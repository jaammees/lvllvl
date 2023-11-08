// github library: https://github.com/github-tools/github

var GitHubClient = function() {
  var token = false;
  var githubUser = null;
  var githubProfile = null;
  var gh = null;
  var repo = null;
  
  var filesToCommit = [];
  var currentBranch = {};
  var newCommit = {};

  var repositoryOwner = '';
  var repositoryName = '';

  var repositoryFolder = '';//'data';
  var repositoryFolderSHA = '';
  var treeFiles = null;

  var onLogin = false;
  var onLogout = false;

  var provider = null;
  var scopes = [];
 
//  this.repoUsername = 'jaammees';
//  this.repoName = 'test-repo';

  this.setRepositoryFolder = function(folder) {
    repositoryFolder = folder;
  },

  this.isLoggedIn = function() {
    return token !== false;
  },

  this.on = function(eventName, f) {
    switch(eventName) {
      case 'login':
        onLogin = f;
      break;
      case 'logout':
        onLogout = f;
      break;
    }
  }

  //https://level-3-editor.firebaseapp.com/__/auth/handler?code=60a4d9520ddf67c7d0c0&state=AMbdmDkfURiE2j_iPjz1kHjnT8ajrVnMVjDKXqURKXnjjshMuSTpb-wdjaEP9U1p1mqP_tnR9hkZRV-D6yPAY_yaJaHURljsJ92TS8VHzJ-a9A3Bwux1CW_ldRg2tbl3Y5ekw40T6-v2_9qYBrDFLlNEBmo8MwqygshD1rjyeGyUzQUTx3CIuFd8jgh6KVQ69XPHlro09SI263KTUIBUdSaey05HYew4wf4VXfT-5JwVgJ_-NhSOl0ZAGJqOp7SD1AOZE5LyWRUXyxJQElg1QAD8bI8wkJfrv8uZN2R9jXZw3Q7OBud6b-hpjRsXJeLqb-7OhMRYoeQbbiI

  this.loginWithRedirect = function() {
    provider = new firebase.auth.GithubAuthProvider();    
    provider.addScope('repo');
    provider.addScope('gist');

    firebase.auth().signInWithRedirect(provider);
  },

  this.getScopes = function() {
    return scopes;
  }


  // if the current user doesn't have the scope, then request it
  
  this.requestScope = function(scope, callback) {
    if( (token === false || !this.hasScope(scope)) ) {
      // user either is not logged in or doesn't have the scope
      var requestScopes = [];
      for(var i = 0; i < scopes.length; i++) {
        requestScopes.push(scopes[i]);
      }
      requestScopes.push(scope);

      this.login(callback, requestScopes);
    } else {
      callback();
    }
  }

  this.hasScope = function(scope) {
    for(var i = 0; i < scopes.length; i++) {
      if(scopes[i] == scope) {
        return true;
      }
    }

    return false;
  }
  
  this.login = function(callback, scopesRequired) {
    var _this = this;    

//    console.log('github login');
//    console.log('scopes required: ' + scopesRequired);

    provider = new firebase.auth.GithubAuthProvider();    
    if(typeof scopesRequired != 'undefined') {
      for(var i = 0; i < scopesRequired.length; i++) {
        provider.addScope(scopesRequired[i]);
      }
    } else {
      provider.addScope('repo');
      provider.addScope('gist');
    }

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.

      token = result.credential.accessToken;

      var user = firebase.auth().currentUser;
      firestoreDb.collection('users').doc(user.uid).set({ token: token }, { merge: true });
      setToken(token, callback);
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });    
  }

  this.logout = function() {
    g_app.fileManager.clearRepositoriesCache(function() {
      firebase.auth().signOut();
      token = false;
      if(onLogout) {
        onLogout();
      }
    });
  }


  function setToken(t, callback) {
    token = t;
    gh = new GitHub({ token: token });
    githubUser = gh.getUser();
    githubUser.getProfile().then(function(result) {

      scopes = result.headers['x-oauth-scopes'].split(',');
      for(var i = 0; i < scopes.length; i++) {
        scopes[i] = scopes[i].trim();
      }
      githubProfile = result.data;

      if(onLogin !== false) {
        onLogin();
      }      

      if(typeof callback != 'undefined') {
        callback();
      }
    });
  }

  this.getLoginName = function() {

    if(!token || !githubProfile) {
      return '';
    }

    return githubProfile.login;
  }

  
  this.setUser = function(user, callback) {

    if(user) {


      
      var userDocRef = firestoreDb.collection("users").doc(user.uid);      

      userDocRef.get().then(function(userDoc) {
        if(userDoc.exists) {
          var data = userDoc.data();

          setToken(data.token);


          if(typeof callback != 'undefined') {
            callback();
          }

        } else {
          console.log("couldn't get user");
        }

      }).catch(function(error) {
        console.log("Error getting document:", error);
        console.log(error);
      });
    } else {
      token = false;
      githubUser = null;
      githubProfile = null;
      if(typeof callback != 'undefined') {
        callback();
      }
    }
  }

  this.getRepoDetails = function(args, callback) {
    var repo = gh.getRepo(githubProfile.login, args.repository);
    repo.getDetails().then(function(response) {
      callback(response);
    }).catch((e) => {
      callback({
        status: 404,
        statusText: "Repository Not Found"
      });
    });
  }

  this.getBranches = function(callback) {
    if (!repo) {
      throw 'Repository is not initialized';
    }


    repo.listBranches().then((branches) => {
      callback(branches);
    });

  }

  this.getCurrentBranchName = function(callback) {
    this.getBranches(function(branches) {
      var branchName = false;
      var branchData = branches.data;
      if(branchData && branchData.length > 0) {
        branchName = branchData[0].name;
        for(var i = 0; i < branchData.length; i++) {
          if(branchData[i].name == 'master') {
            branchName = 'master';
          }
        }
        callback(branchName);
        return;
      }
      callback('main');
    });
  }

  this.createGist = function(args, callback) {
    var gist = gh.getGist(); // not a gist yet
    gist.create({
       public: false,
       description: 'Test',
       files: args.files
    }).then(function({data}) {
       // Promises!
       let createdGist = data;
       return gist.read();
    }).then(function(response) {
       let retrievedGist = response.data;
       callback(response);
       // do interesting things
    });
  }

  this.processTruncated = function(response, truncated, callback) {
    if(truncated.length == 0) {
      callback(response);
      return;
    }

    var _this = this;

    var key = truncated.pop();
    var url = response.data.files[key].raw_url;
    $.get(url, {}, function(data) {
      response.data.files[key].content = data;
      _this.processTruncated(response, truncated, callback);
    });


  },

  this.getGist = function(args, callback) {
    var id = args.id;
    if(gh == null) {
      gh = new GitHub({token: token });
    }
    var gist = gh.getGist(id); // not a gist yet

    this.gistTruncated = [];
    var _this = this;
    gist.read().then(function(response) {
      // need to check if truncated..
      for(var key in response.data.files) {
        if(response.data.files[key].truncated) {
          _this.gistTruncated.push(key);
        }
      }

      if(_this.gistTruncated.length > 0) {
        _this.processTruncated(response, _this.gistTruncated, callback);
      } else {
        callback(response);
      }
    });

  }

  this.createRepo = function(args, callback) {

    gh = new GitHub({ token: token });
    var user = gh.getUser();



    var repositoryType = args.repositoryType;
    if(typeof repositoryType == 'undefined') {
      repositoryType = 'private';
    }

    var options = {
      "name": args.repository,
      "private": repositoryType != 'public',
      "auto_init": true
    }

    user.createRepo(options)
      .then(function(response) {
        if(callback) {
          callback(response);

        }

      }).catch((e) => {
        // uh oh, does the repo already exist?

        var repo = gh.getRepo(githubProfile.login, args.repository);
        repo.getDetails().then(function(response) {

          if(response.status == 200) {
            callback({
              status: 500,
              statusText: "Repository Already Exists"
            });
          }
        }).catch(function(e) {
          console.log('another exception...');
          console.log(e);

        });
      });
  }

  // check if login is required, check if logged in, then called doLoad
  this.load = function(args, callback) {
    var _this = this;

    var requireLogin = true;
    if(typeof args.requireLogin != 'undefined') {
      requireLogin = args.requireLogin;
    }

    if( (token === false || !this.hasScope('repo')) && requireLogin) {
      this.login(function() {
        _this.doLoad(args, callback);
      }, ['repo']);
    } else {
      _this.doLoad(args, callback);
    }
  }

  // first check if valid user logged in..
  // then call do pull
  this.pull = function(args, callback) {
    var _this = this;

    var requireLogin = true;
    if(typeof args.requireLogin != 'undefined') {
      requireLogin = args.requireLogin;
    }


    //     if( (token === false || !this.hasScope('repo')) && requireLogin) {
    if( requireLogin && token === false ) {  //} (token === false || !this.hasScope('repo')) && requireLogin) {
      // not logged in
      this.login(function() {
        _this.doPull(args, callback);
      }, ['repo']);
    } else if(requireLogin && !this.hasScope('repo')) {
      // logged in, but doesn't have correct scope
      var newScopes = this.getScopes();

      newScopes.push('repo');


      this.login(function() {
        _this.doPull(args, callback);
      }, newScopes);

    } else {
      _this.doPull(args, callback);
    }
  }


  this.doPull = function(args, callback) {
    gh = new GitHub({token: token });    

    var _this = this;


    this.setRepo(args.owner, args.repository);

    this.getCurrentBranchName(function(branchName) {

      _this.setBranch(branchName)
      .then( getCurrentCommitSHA )
      .then( getCurrentTreeSHA )
      .then( function() {
        // get list of all the files in the repository
        return repo.getTree(currentBranch.treeSHA + '?recursive=1');
      })
      .then( (response) => {
        if(response !== false) {

          // set all the files to get..
          treeFiles = response.data.tree;
          _this.pullFiles(treeFiles, args, callback);
        } else {
          // uh oh, something went wrong
          callback({ success: false, message: "Couldn't get list of files in project" });
        }
      })
      .catch(function(e) {
        // uh oh
        callback({ success: false, message: e.message });
      });    
    });
  }

  this.pullFiles = async function(treeFiles, args, callback) {

    var repositoryId = repositoryOwner + '/' + repositoryName;

    // assuming doc is initialised
    // or has current files in it
    var doc = g_app.doc; 

    // count the number of blobs (not folders), blobs are files
    // work out if there is a repository folder by looking for /screens, old way of storing things..
    var fileCount = 0;
    repositoryFolder = '';
    for(var i = 0; i < treeFiles.length; i++) {
      var path = treeFiles[i].path;
      if(treeFiles[i].type == 'blob') {
        fileCount++;
      } else {
        var pos = path.indexOf('/screens');
        if(pos !== -1) {
          repositoryFolder = path.substring(0, pos);
        }
      }
    }


    // keep track of files to pull/have been pulled
    // mostly if want to prompt user to confirm
    var filesToPull = [];
    var fileListOnly = true;

    if(typeof args.listFilesOnly) {
      fileListOnly = args.listFilesOnly;
    }


    // load each of the files...
    var fileLoadedCount = 0;
    var filesToLoadCount = 0;

    // count how many files need to pull
    for(var i = 0; i < treeFiles.length; i++) {
      if(treeFiles[i].type == 'blob') {

        var sha = treeFiles[i].sha;

        // path in the repository
        var path = treeFiles[i].path;

        // path in the doc, should be the same unless theres a repository folder
        var docPath = path;          
        var slashPos = path.lastIndexOf('/');
        var parentPath = path.substring(0, slashPos);

        // remove the repository folder from the parent folder..
        if(repositoryFolder.length > 0 && parentPath.indexOf(repositoryFolder) === 0) {
          parentPath = parentPath.substring(repositoryFolder.length + 1);
          docPath = docPath.substring(repositoryFolder.length + 1);
        }


        var dotPos = docPath.lastIndexOf('.');
        var extension = '';
        if(dotPos !== -1) {
          extension = docPath.substring(dotPos + 1).toLowerCase();
        }


        // only config files can have .json extension?
        // maybe should check if in folder that removes the json from path
        if(extension == 'json' && docPath.indexOf('config/') == -1) {
          docPath = docPath.substring(0, dotPos);
        }

        
        if(!doc.hasVersion(docPath, sha)) {
          filesToLoadCount++;

        }
      }
    }


    for(var i = 0; i < treeFiles.length; i++) {
        
      // only interested in blob, not tree
      if(treeFiles[i].type == 'blob') {
        var sha = treeFiles[i].sha;

        // path in the repository
        var path = treeFiles[i].path;

        // path in the doc, should be the same unless theres a repository folder
        var docPath = path;          
        var slashPos = path.lastIndexOf('/');
        var parentPath = path.substring(0, slashPos);

        // remove the repository folder from the parent folder..
        if(repositoryFolder.length > 0 && parentPath.indexOf(repositoryFolder) === 0) {
          parentPath = parentPath.substring(repositoryFolder.length + 1);
          docPath = docPath.substring(repositoryFolder.length + 1);
        }


        var dotPos = docPath.lastIndexOf('.');
        var extension = '';
        if(dotPos !== -1) {
          extension = docPath.substring(dotPos + 1).toLowerCase();
        }


        // only config files can have .json extension?
        // maybe should check if in folder that removes the json from path
        if(extension == 'json' && docPath.indexOf('config/') == -1) {
          docPath = docPath.substring(0, dotPos);
        }
  
        // if the doc already has this version, dont reload it
        if(!doc.hasVersion(docPath, sha)) {


          filesToPull.push(docPath);

          if(fileListOnly) {

          } else {
            var isBinaryFile = doc.isBinary(path);

            if(typeof args.progress) {
              args.progress({ message: 'Pulling ' + docPath + '...', progress: fileLoadedCount / filesToLoadCount })
            }


            // ok, fetch the file.
            var file = null;
            if(isBinaryFile) {
              file = await repo.getBlobAsBase64(sha);
            } else {
              file = await repo.getBlob(sha);
            }


            var fileData = file.data;
            if(isBinaryFile && typeof file.data.content !== 'undefined') {
              encoding = file.data.encoding;
              fileData = file.data.content;
            }

            doc.addRecord({
              path: docPath,
              content: fileData,
              sha: sha
            });

            // if this is the current record being displayed, 
            // then refresh what is being displayed
            if(docPath.length > 0 && docPath[0] != '/') {
              docPath = '/' + docPath;
            }
        
            var currentDocPath = g_app.projectNavigator.getCurrentPath();
            if(currentDocPath == docPath) {
              g_app.projectNavigator.showDocRecord(currentDocPath, { forceReload: true });
            }
          }
          fileLoadedCount++;
        }
        
      }
    }

    if(callback) {
      callback({
        filesToPull: filesToPull,
        success: true,
        status: 200
      });
    }
  }


  // get a list of all files in a repository, then call loadFiles
  this.doLoad = function(args, callback) {
    
    var _this = this;

    gh = new GitHub({token: token });    
    this.setRepo(args.owner, args.repository);

    this.getCurrentBranchName(function(branchName) {

      _this.setBranch(branchName)
      .then( getCurrentCommitSHA ) 
      .then( getCurrentTreeSHA )
      .then( function() {
        return repo.getTree(currentBranch.treeSHA + '?recursive=1');

      })
      .then( (response) => {

        if(response !== false) {

          // set all the files to get..
          treeFiles = response.data.tree;


          _this.loadFiles(treeFiles, args, callback);
        } else {
          // uh oh, something went wrong
          alert("Couldn't find containing folder");
        }
  //      return treeFiles;
      }).catch(function(e) {
        console.log("EXCEPTION IN Load!!!");
        console.log(e);

        callback({ success: false, message: e.message });
      }); ;
    });

  }

  // treeFiles is from doLoad, contains all the files in the repository
  this.loadFiles = async function(treeFiles, args, callback) {

    g_app.doc = new Document();
    g_app.doc.init(g_app);   
    var doc = g_app.doc; 

    var colorPaletteManager = g_app.textModeEditor.colorPaletteManager;
    var tileSetManager = g_app.textModeEditor.tileSetManager;
    var screenManager = g_app.textModeEditor.graphic;

  
    g_app.createDocumentStructure(doc);

    var colorPaletteId = '';
    var tileSetId = '';

    //g_app.textModeEditor.layers.load();

    var folders = [
        { 'path': 'tile sets', 'type': 'tile set', 'extension': 'json' },
        { 'path': 'color palettes', 'type': 'color palette', 'extension': 'json' },
        { 'path': 'screens', 'type': 'screen', 'extension': 'json' },
        { 'path': 'sprites', 'type': 'sprite', 'extension': 'json' },
        { 'path': 'music', 'type': 'music', 'extension': 'json' },
        { 'path': 'asm', 'type': 'asm', 'extension': 'asm' },
        { 'path': 'scripts', 'type': 'script', 'extension': 'js' },
        { 'path': 'build', 'type': 'prg', 'extension': 'prg' }
    ];

    // count the number of blobs (not folders), blobs are files
    // work out if there is a repository folder by looking for /screens, old way of storing things..
    var fileCount = 0;
    repositoryFolder = '';
    for(var i = 0; i < treeFiles.length; i++) {
      var path = treeFiles[i].path;
      if(treeFiles[i].type == 'blob') {
        fileCount++;
      } else {
        var pos = path.indexOf('/screens');
        if(pos !== -1) {
          repositoryFolder = path.substring(0, pos);
        }

      }


    }

    var repositoryId = repositoryOwner + '/' + repositoryName;
    var _this = this;

    var binaryExtensions = [
      'prg',
      'bin',
      'rom',
      'nes'
    ];

    // get local versions of the files in the repository,  no longer used...
   // g_app.fileManager.getRepositoryFiles(repositoryId, treeFiles, async function(localFiles) {

      // load each of the files...
      var fileLoadedCount = 0;
      for(var i = 0; i < treeFiles.length; i++) {
        
        if(treeFiles[i].type == 'blob') {
          var sha = treeFiles[i].sha;

          // path in the repository
          var path = treeFiles[i].path;

          // path in the doc, should be the same unless theres a repository folder
          var docPath = path;
          

          var slashPos = path.lastIndexOf('/');
          var parentPath = path.substring(0, slashPos);

          // remove the repository folder from the parent folder..
          if(repositoryFolder.length > 0 && parentPath.indexOf(repositoryFolder) === 0) {
            parentPath = parentPath.substring(repositoryFolder.length + 1);
            docPath = docPath.substring(repositoryFolder.length + 1);
          }
          var name = path.substring(slashPos + 1);
          var extension = '';
          var dotPos = path.lastIndexOf('.');
          if(dotPos !== -1) {
            extension = path.substring(dotPos + 1).toLowerCase();
          }

          var isBinaryFile = false;
          isBinaryFile = binaryExtensions.indexOf(extension.toLowerCase()) !== -1;



          var file = null;


          if(isBinaryFile) {
            file = await repo.getBlobAsBase64(sha);
          } else {
            file = await repo.getBlob(sha);
          }



          if(typeof args.progress) {
            args.progress({ message: 'Loading ' + name + '...', progress: fileLoadedCount / fileCount })
          }

          var fileData = file.data;
          if(isBinaryFile && typeof file.data.content !== 'undefined') {
            encoding = file.data.encoding;
            fileData = file.data.content;
          }

          doc.addRecord({
            path: docPath,
            content: fileData,
            sha: sha
          });
    


          fileLoadedCount++;
        }
      }



//      console.log("DONE!!!!");
//      return;
      if(callback) {
        callback({
          success: true,
          status: 200
        });
      }
//    });
  }

  this.save = function(args, callback) {
    var _this = this;

    if(token === false) {
      this.login(function() {
        _this.doSave(args, callback);
      });
    } else {
      _this.doSave(args, callback);
    }
  }

  this.doSave = function(args, callback) {
    var _this = this;


    gh = new GitHub({token: token });    
    this.setRepo(args.owner, args.repository);

    var commitMessage = 'commit...';

    if(typeof args != 'undefined') {
      if(typeof args.commitMessage != 'undefined') {
        commitMessage = args.commitMessage;
      }
    }

    var doc = g_app.doc;

    files = doc.getFiles({
      includeEmptyFolders: false,
      doStringify: true
    });


//    return;

    this.getCurrentBranchName(function(branchName) {

      _this.setBranch(branchName)
      .then( () => _this.pushFiles(commitMessage, files, args) )
      .then(function(response) {

      // now get the list of files and their sha's      
      }).then( getCurrentCommitSHA ) 
      .then( getCurrentTreeSHA )
      .then( function() {
        // need to get the sha for the respository folder (data)
        // so get the contents of root of tree
        return repo.getContents(branchName, '');
      }).then(function(response) {
        var data = response.data;

        repositoryFolderSHA = false;

        if(repositoryFolder !== false && repositoryFolder != '') {
          for(var i = 0; i < data.length; i++) {
            if(data[i].path == repositoryFolder) {
              // found the sha for the repository folder
              repositoryFolderSHA = data[i].sha;
              break;
            }
          }
          return repo.getTree(repositoryFolderSHA + '?recursive=1');  
        } else {
          return repo.getTree(currentBranch.treeSHA + '?recursive=1');
        }

      }).then(function(response) {

        // set all the files to get..
        treeFiles = response.data.tree;
        _this.updateBrowserFiles(treeFiles, files, function() {
          if(callback) {
            callback(response);
          }      
        });

      }).catch(function(e) {
        console.log("EXCEPTION IN SAVE!!!");
        console.log(e.message);

        if(callback) {
          callback({ error: true, message: e.message });
        }
      });
    });
  }


  this.updateBrowserFiles = function(treeFiles, files, callback) {
    // need to update in memory doc files
    var doc = g_app.doc;
    for(var i = 0; i < treeFiles.length; i++) {
      var path = treeFiles[i].path;
      if(path.length > 0 && path[0] != '/') {
        path = '/' + path;
      }

      var pathParts = path.split('/');
      var extension = '';
      var dotPos = path.lastIndexOf('.');
      if(dotPos !== -1) {
        extension = path.substring(dotPos + 1).trim().toLowerCase();
      }

      var parentPath = pathParts[1];

      // if extension is json, remove it from the name
      // only do this for color palette, screen, etc?
      if(extension == 'json' 
          && (
            parentPath == 'color palettes'
            || parentPath == 'tile sets'
            || parentPath == 'screens'
            || parentPath == 'sprites'
            || parentPath == 'music'
            || parentPath == '3d scenes'
          )
      
      ) {
        path = path.substring(0, dotPos);
      }
      
      var sha = treeFiles[i].sha;
      var record = doc.getDocRecord(path);

      if(record) {
        record.sha = sha;
      } else {
        console.error('couldnt find: ' + path);
      }
    }

    // update browser saved files
    var repositoryId = repositoryOwner + '/' + repositoryName;
    g_app.fileManager.updateFileSHA(repositoryId, treeFiles, files, function() {
      callback();
    });

    return;

  }

  /**
  * Sets the current repository to make push to
  * @public
  * @param {string} userName Name of the user who owns the repository
  * @param {string} repoName Name of the repository
  * @return void
  */
  this.setRepo = function(userName, repoName) {
    repositoryOwner = userName;
    repositoryName = repoName;
    repo = gh.getRepo(userName, repoName);
  }

  /**
  * Sets the current branch to make push to. If the branch doesn't exist yet,
  * it will be created first
  * @public
  * @param {string} branchName The name of the branch
  * @return {Promise}
  */
  this.setBranch = function(branchName) {
    if (!repo) {
      throw 'Repository is not initialized';
    }

    return repo.listBranches().then((branches) => {
      var branchExists = branches.data.find( branch => branch.name === branchName );
      if (!branchExists) {
        return repo.createBranch('main', branchName)        
        .then(() => {
          currentBranch.name = branchName;
        });
      } else {
        currentBranch.name = branchName;
      }
    });
  }

  this.getFileSHA = function(file) {
    var fileSHA = '';

    // get the sha
    for(var i = 0; i < treeFiles.length; i++) {
      if(treeFiles[i].path == file) {
        fileSHA = treeFiles[i].sha;
        break;
      }
    }

    return fileSHA;

  }

  this.getFileWithSHA = function(fileSHA) {
//    var fileSHA = this.getFileSHA(file);

    return repo.getBlob(fileSHA);
  }

  this.getFile = function(file) {
      //dont think this gets called anymore??
      alert('shouldnt get here');

      /*
    return getCurrentCommitSHA()
        .then(getCurrentTreeSHA)
        .then( () => {
          repo.getContents('master', 'screens');

          repo.getTree(currentBranch.treeSHA + '?recursive=1');//97a8c280fa857df97d901584a56beffcbfd8f0da?recursive=1');//currentBranch.treeSHA);
          //return repo.getSha('master', file)
//          return repo.getContents('master', file, true) 
        }).then((response) => {
          console.log(response);
          //var sha = response.data.sha;
          //return repo.getBlob(sha);
        })
        .catch((e) => {
          console.error(e);
    });
    */

  }
    /**
     * Makes the push to the currently set branch
     * @public
     * @param  {string}   message Message of the commit
     * @param  {object[]} files   Array of objects (with keys 'content' and 'path'),
     *                            containing data to push
     * @return {Promise}
     */
    this.pushFiles = function(message, files, args) {
        if (!repo) {
            throw 'Repository is not initialized';
        }
        if (!currentBranch.hasOwnProperty('name')) {
            throw 'Branch is not set';
        }

        return getCurrentCommitSHA()
            .then(function() {
              if(typeof args.progress) {
                args.progress({ message: "1/6", progress: 1/6 });
              }
              return getCurrentTreeSHA();
            })
            .then(function() {
              if(typeof args.progress) {
                args.progress({ message: "2/6", progress: 2/6 });
              }
              return createFiles(files, args);
            })
            .then(function() {
              if(typeof args.progress) {
                args.progress({ message: "3/6", progress: 3/6 });
              }
              return createTree();
            })
            .then( function() {
              if(typeof args.progress) {
                args.progress({ message: "4/6", progress: 4/6 });
              }
              return createCommit(message) 
            })
            .then( function() {
              if(typeof args.progress) {
                args.progress({ message: "5/6", progress: 5/6 });
              }
              return updateHead();
            });
//            .catch((e) => {
//                console.error(e);
//            });
            // let calling function catch the exception
    }

    /**
     * Sets the current commit's SHA
     * @private
     * @return {Promise}
     */
    function getCurrentCommitSHA() {
        return repo.getRef('heads/' + currentBranch.name)
            .then((ref) => {
                currentBranch.commitSHA = ref.data.object.sha;
            });
    }

    /**
     * Sets the current commit tree's SHA
     * @private
     * @return {Promise}
     */
    function getCurrentTreeSHA() {
        return repo.getCommit(currentBranch.commitSHA)
            .then((commit) => {
              console.log('commit = ');
                console.log(commit);
                currentBranch.treeSHA = commit.data.tree.sha;
            });
    }

    /**
     * Creates blobs for all passed files
     * @private
     * @param  {object[]} filesInfo Array of objects (with keys 'content' and 'path'),
     *                              containing data to push
     * @return {Promise}
     */
    function createFiles(filesInfo) {
        var promises = [];
        var length = filesInfo.length;

        for (var i = 0; i < length; i++) {
          if(filesInfo[i].type !== 'folder') {
            promises.push(createFile(filesInfo[i]));
          }
        }

        return Promise.all(promises);
    }

    /**
     * Creates a blob for a single file
     * @private
     * @param  {object} fileInfo Array of objects (with keys 'content' and 'path'),
     *                           containing data to push
     * @return {Promise}
     */
    function createFile(fileInfo) {

        var encoding = false;
        var type = false;
        if(typeof fileInfo.type != 'undefined') {
          type = fileInfo.type;
        }
        if(typeof fileInfo.encoding != 'undefined') {
          encoding = fileInfo.encoding;
        }

        var path = fileInfo.path;
        if(path.length > 0 && path[0] == '/') {
          path = path.substring(1);
        }
        if(path != 'README.md' && repositoryFolder !== false && repositoryFolder != '') {
          path = repositoryFolder + '/' + path;
          
        }


        if(type == 'blob' && encoding == 'base64') {
          var blobInfo = {
            content: fileInfo.content,
            encoding: 'base64'
          }

          return repo.postBlob(blobInfo)
              .then((blob) => {                  
                  filesToCommit.push({
                      sha: blob.data.sha,
                      path: path, //repositoryFolder + '/' + fileInfo.path,
                      mode: '100644',
                      type: 'blob'
                  });
              });

        } else {
          return repo.createBlob(fileInfo.content)
              .then((blob) => {
                  filesToCommit.push({
                      sha: blob.data.sha,
                      path: path,// repositoryFolder + '/' + fileInfo.path,
                      mode: '100644',
                      type: 'blob'
                  });
              });
        }
    }

    /**
     * Creates a new tree
     * @private
     * @return {Promise}
     */
    function createTree() {
        return repo.createTree(filesToCommit, currentBranch.treeSHA)
            .then((tree) => {
                newCommit.treeSHA = tree.data.sha;
            });
    }

    /**
     * Creates a new commit
     * @private
     * @param  {string} message A message for the commit
     * @return {Promise}
     */
    function createCommit(message) {
        return repo.commit(currentBranch.commitSHA, newCommit.treeSHA, message)
            .then((commit) => {
                newCommit.sha = commit.data.sha;
            });
    }

    /**
     * Updates the pointer of the current branch to point the newly created commit
     * @private
     * @return {Promise}
     */
    function updateHead() {
        return repo.updateHead('heads/' + currentBranch.name, newCommit.sha);
    }

}


