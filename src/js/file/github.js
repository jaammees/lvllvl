var GitHubUI = function() {
  this.uiComponent = null;
  this.githubClient = null;

  this.loginPromptDialog = null;
  this.repositoryDetailsDialog = null;
  this.loadingRepositoryDialog = null;
  this.pullDialog = null;

  this.loadFromRepositoryDialog = null;

  this.owner = false;
  this.repository = '';
  this.commitOnly = false;

  this.saveProgressBar = null;
  this.loadProgressBar = null;

  // is this dialog to save or make a share link?
  this.dialogAction = 'save';  
  this.initialCommitMessage = 'Initial Commit';

  this.pullFinishedCallback = null;
}

GitHubUI.prototype = {
  init: function(githubClient) {
    this.githubClient = githubClient;
  },

  // entry point when saving
  save: function() {
    this.dialogAction = 'save';
    // is a user logged in?
    if(!this.githubClient.isLoggedIn()) {
      var _this = this;
      this.promptToLogin(function() {
        UI.closeDialog();
        _this.promptRepositoryDetails();
      });
    } else {
      this.promptRepositoryDetails();
    }
  },


  showPullDialog: function() {
  
    if(!this.pullDialog) {
      var width = 300;
      var height = 220;
      if(g_app.isMobile()) {
        height = 260;
      }

      this.pullProgressBar = UI.create("UI.ProgressBar");

      var progressBarHTML = this.pullProgressBar.getHTML();


      this.pullDialog = UI.create("UI.Dialog", { "id": "githubPullDialog", "title": "Pull Files", "width": width, "height": height });

      var html = '';
      html += '<div id="pullDialogProgress" style="margin-top: 2px"></div>'

      html += '<div id="pullProgressBar" style="display: none; margin-top: 6px">';
      html += progressBarHTML;
      html += '</div>';

      html += '<div id="pullDialogUpdatedFiles" style="display: none; position: absolute; top: 20px; left: 6px; right: 6px; line-height: 14px; letter-spacing: 0.2px; bottom: 30px; padding: 4px; margin: 8px 0; overflow: auto; background-color: #333333"></div>';

      html += '<div id="githubPullUpdatedHolder" style="position: absolute; display: none; left: 6px; bottom: 0px; right: 6px; height: 30px">';
      html += '<div class="ui-button ui-button-primary" id="githubPullUpdatedFiles" style="margin-right: 10px">Pull Updated Files From Origin</div>';
      html += '<div class="ui-button ui-button-secondary" id="githubOpenNoPull">Open Without Pull</div>';
      html += '</div>';
      var htmlPanel = UI.create("UI.HTMLPanel", { html: html });
      this.pullDialog.add(htmlPanel);

      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });

      this.pullDialog.addButton(this.closeButton);

      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      var _this = this;

      $('#githubOpenNoPull').on('click', function() {

        // just call the callback
        if(_this.pullFinishedCallback) {
          _this.pullFinishedCallback();
          _this.pullFinishedCallback = null;
        }
        UI.closeDialog();

      });
      $('#githubPullUpdatedFiles').on('click', function() {
        $('#githubPullUpdatedHolder').hide();


        _this.doPull(function(result) {

          if(_this.pullFinishedCallback) {
            _this.pullFinishedCallback();
            _this.pullFinishedCallback = null;
          }
          UI.closeDialog();
        });
      });
    }
    $('#pullDialogProgress').html('');

    UI.showDialog("githubPullDialog");    
  },

  doCheckForUpdatedFiles: function(callback) {
    this.showPullDialog();

    var args = {
      owner: this.owner,
      repository: this.repository,
      listFilesOnly: true
    }

    $('#pullDialogProgress').html('Checking for updated files in repository....');

    var pullProgress = '';
    args.progress = function(data) {
      var message = data.message;
      pullProgress += '<div>' + message + '</div>';
      $('#pullDialogProgress').html(pullProgress);
    }

    var _this = this;
      
    // not really a pull, just getting the list of files 
    // where sha doesn't match
    this.githubClient.pull(args, function(result) {
      var filesToPull = result.filesToPull;
      var fileCount = filesToPull.length;

      if(filesToPull.length > 0) {
        // show there are files to pull

      
        var message = 'Found ' + fileCount + ' updated file';
        if(fileCount != 1) {
          message += 's';
        }

        $('#pullDialogProgress').html(message);


        var html = '';
        for(var i = 0; i < filesToPull.length; i++) {
          html += '<div class="">' + filesToPull[i] + '</div>';
        }

        $('#pullDialogUpdatedFiles').html(html);
        $('#pullDialogUpdatedFiles').show();
        $('#githubPullUpdatedHolder').show();
        _this.pullFinishedCallback = callback;


      } else {
        // no files to pull
        console.log("NO FILES TO PULL, call the callback");

        UI.closeDialog();
        g_app.projectNavigator.updateModifiedList();
        g_app.projectNavigator.treeRoot.refreshChildren();
        if(typeof callback != 'undefined') {
          callback(result);
        }
  
        callback(result);
      }
    });

  },

  // 
  doPull: function(callback) {

    var _this = this;
    this.showPullDialog();

    var args = {
      owner: this.owner,
      repository: this.repository      
    }

    this.pullProgressBar.setProgress(0);


    $('#pullDialogUpdatedFiles').hide();
    $('#pullProgressBar').show();

    var pullProgress = '';
    args.progress = function(data) {
      var message = data.message;
      var progress = data.progress;
//      pullProgress += '<div>' + message + '</div>';
      $('#pullDialogProgress').html(message);
      _this.pullProgressBar.setProgress(data.progress);
    }
      


    this.githubClient.pull(args, function(result) {
      UI.closeDialog();
      g_app.projectNavigator.updateModifiedList();
      g_app.projectNavigator.treeRoot.refreshChildren();
      if(typeof callback != 'undefined') {
        callback(result);
      }

    });
  },


  // entry point when sharing..
  shareProject: function() {
    this.dialogAction = 'share';
    this.promptRepositoryDetails();
  },

  // if saving and not logged in, promp user to login/register
  promptToLogin: function(callback) {
    if(!this.loginPromptDialog) {
      var width = 200;
      var height = 220;
      if(g_app.isMobile()) {
        height = 260;
      }
      this.loginPromptDialog = UI.create("UI.Dialog", { "id": "githubLoginPrompt", "title": "Login Required", "width": width, "height": height });

      var html = '<div>You need to login to commit to GitHub</div>';

      html += '<div class="ui-button" id="loginToGitHubButton">Login To GitHub</div>';
      this.loginHTML = UI.create("UI.HTMLPanel", { html: html });
      this.loginPromptDialog.add(this.loginHTML);

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.loginPromptDialog.addButton(this.closeButton);

      var _this = this;
      $('#loginToGitHubButton').on('click', function() {
        _this.githubClient.login(function() {
          if(callback) {
            callback();
          }
        });
      });

    }
    UI.showDialog("githubLoginPrompt");    
  },

  initRepositoryDetailsEvents: function() {
    var _this = this;
    $('input[name=githubRepositoryAction]').on('click', function(event) {
      var value = $('input[name=githubRepositoryAction]:checked').val();

      if(value == 'create') {
        $('#repositoryName').show();
        $('#repositoryName').focus();
        $('#githubRepositoryTypeRow').show();
      } else {
        $('#githubRepositoryTypeRow').hide();
      }
    });

    $('#githubRepositoryCommitOnlyChange').on('click', function() {
      _this.setCommitOnly(false);
    });

    $('#loginRegisterGitHub').on('click', function() {
      _this.githubClient.login(function() {
        _this.userHasLoggedIn();
      });
    });

    $('#githubShareLinkCopy').on('click', function() {
      $("#githubShareLink").select();
      document.execCommand('copy');
    });

    $('#repositoryShareCreateButton').on('click', function() {
      _this.createShareRepository();
    });

    $('#githubShareInitialView').on('change', function() {
      _this.updateShareLink();
    });

    $('#githubShareLinkCurrentRepositoryCommit').on('click', function() {
      _this.commitToShare();
    });

    $('#githubShareLinkCurrentRepositoryNew').on('click', function() {
      _this.newShareRepository();
    });


    $('#githubRepositoryCommitOnlyMessage').on('keypress', function(e) {
      if(e.keyCode == 13) {
        _this.doCommit();
      }
    });


  },

  createShareRepository: function() {
    this.doCommit();
  },

  newShareRepository: function() {
    $('#githubShareLinkSectionRepositoryExists').hide();
    $('#repositoryOwner').val(this.owner);
    $('#githubShareLinkSection').hide();
    $('#repositoryName').select();
    $('#repositoryName').focus();
    this.setCommitOnly(false);
  },

  commitToShare: function() {
    // commit to the current repository
    $('#githubShareLinkSectionRepositoryExists').hide();
    $('#githubRepositoryProgress').show();
    $('#githubRepositoryError').hide();
    var args = {};
    args.owner = this.owner;
    args.repository = this.repository;
    args.repositoryId = this.owner + '/' + this.repository;

    var _this = this;
    this.recordRepository(args, function(response) {
      _this.saveToRepository(args);
    });    

  }, 

  setCommitOnly: function(commitOnly) {
    this.commitOnly = commitOnly;

    if(this.commitOnly) {
      $('#githubRepositoryForm').hide();
      $('#githubRepositoryCommitOnly').show();

      var repositoryDetails = this.owner + '/' + this.repository;

      
      $('#githubRepositoryCommitOnlyDetails').html(repositoryDetails);

      if($('#repositoryCommitMessage').val() == this.initialCommitMessage) {
        $('#repositoryCommitMessage').val('A Commit');
      }

      $('#githubRepositoryCommitOnlyMessage').select(); 
      $('#githubRepositoryCommitOnlyMessage').focus(); 

    } else {
      $('#githubRepositoryForm').show();
      $('#githubRepositoryCommitOnly').hide();

      $('#repositoryName').select();
      $('#repositoryName').focus();
    }

  },

  // update the drop down containing views
  updateViewSelect: function() {
    var files = g_app.doc.dir('/');
    var html = '';
    var foundSelected = false;
    for(var i = 0; i < files.length; i++) {
      if(files[i].type !== 'hiddenfile' && files[i].name != '3d') {
        var optionsHTML = '';
        var children = files[i].children;
        for(var j = 0; j < children.length; j++) {
          if(children[j].type !== 'folder' && children[j].type !== 'hiddenfile') {
            var path = files[i].name + '/' + children[j].name;
            optionsHTML += '<option value="' + path + '"';
            
            if(!foundSelected) {
              if(children[j].type == 'graphic') {
                optionsHTML += ' selected="selected" ';
                foundSelected = true;
              }
            }
            optionsHTML += '>' + children[j].name + '</option>';
          }
        }
        if(optionsHTML != '') {
          html += '<optgroup label="' + files[i].name + '">';
          html += optionsHTML;
          html += '</optgroup>';
        }
      }
    }

    $('#githubShareInitialView').html(html);

  },

  showShareLink: function() {

    this.updateViewSelect();

    $(".githubRepositoryDialogSection").hide();
    $('#githubRepositoryMessage').hide();
    $('#githubRepositoryProgress').hide();
    $('#githubRepositoryError').hide();
    $("#githubShareLinkSection").show();

    this.updateShareLink();
  },

  updateShareLink: function() {
    var shareLink = 'https://lvllvl.com/?gh=' + this.owner + '/' + this.repository;

    var view = $('#githubShareInitialView').val();
    if(view) {
      shareLink += '&view=' + view;
    }
    $('#githubShareLink').val(shareLink);

  },

  initRepositoryDetailsContent: function() {

    if(this.owner === false) {
      this.owner = this.githubClient.getLoginName();
    }

    $(".githubRepositoryDialogSection").hide();

    var currentShareRepositoryIsPublic = false;

    if(this.dialogAction == 'share') { 

      if(this.repoOkButton) {
        this.repoOkButton.setVisible(false);
      }

      // if sharing, cant commit to existing repository
      $('#githubRepositoryFormCreateOptions').hide();
      $('#githubCommitMessageRow').hide();

      if(typeof this.repositoryDetails != 'undefined' 
        && this.repositoryDetails) {

        currentShareRepositoryIsPublic = true;

        // a repository has already been set up, is it private?
        if(this.repositoryDetails.private === false) {
          // repository is ok to share, put in the link
          this.showShareLink();

          var html = '';
          html += '<a href="' + this.repositoryDetails.html_url + '" target="_blank">';
          html += this.repositoryDetails.full_name;
          html += '</a>';

          $('#githubShareLinkCurrentRepository').html(html);
          // hide the repository created message
          $('#githubShareLinkSectionRepositoryCreated').hide();
          $('#githubShareLinkSectionRepositoryExists').show();

//          return;
        } else {
          // the repository is private, prompt the user to create a public one
          $('#githubShareInstructions').show();
          $('#githubShareLinkSectionRepositoryExists').hide();
        }
      } else {
        // no repository set up
        $('#githubShareInstructions').show();
      }

    } else {
      $('#githubRepositoryFormCreateOptions').show();
      $('#githubCommitMessageRow').show();
    }


    // do this if not sharing or current repo is not public
    if(this.dialogAction != 'share' || !currentShareRepositoryIsPublic) {

      $('#githubRepositoryForm').show();
      $('#githubRepositoryMessage').html("");
      $('#githubRepositoryMessage').hide();


      $('#repositoryOwner').val(this.owner);

      if(this.repository !== false) {
        $('#repositoryName').val(this.repository);
      } else {
        // its a new repository
        var repositoryName = 'repository-name';
        repositoryName = g_app.fileManager.getProjectName();

        $('#repositoryName').val(repositoryName);
        $('#repositoryCommitMessage').val(this.initialCommitMessage);
      }

      if(this.repository === false || this.repository === '') {
        $('#githubRepositoryAction_save').prop('checked', false);
        $('#githubRepositoryAction_create').prop('checked', true);
        this.setCommitOnly(false);
      } else {      

        this.setCommitOnly(true);
        $('#githubRepositoryAction_save').prop('checked', true);
        $('#githubRepositoryAction_create').prop('checked', false);
      }
    }

    if(this.dialogAction == 'share') {
      // share repositories are always public
      $('#githubRepositoryTypeRow').hide();
    } else {    
      if($('#githubRepositoryAction_create').is(':checked')) {
        $('#githubRepositoryTypeRow').show();

      } else {
        $('#githubRepositoryTypeRow').hide();
      }
    }

    if(this.repoOkButton) { 
      this.repoOkButton.setEnabled(true);
    }

    if(this.repoCloseButton) {
      this.repoCloseButton.setEnabled(true);
    }

    if(this.saveProgressBar == null) {
      this.saveProgressBar = UI.create("UI.ProgressBar");
      var html = this.saveProgressBar.getHTML();
      $('#githubRepositoryProgress').html(html);
    }

    $('#githubRepositoryProgress').hide();
    $('#githubRepositoryError').hide();
    this.saveProgressBar.setProgress(0);

  },

  userHasLoggedIn: function() {
    this.repositoryDetails = false;
    if(this.dialogAction == 'share') {
      // if sharing, need to check if current repository is public
      if(this.repository != '' && this.repository != false) {
        var _this = this;
        this.githubClient.getRepoDetails({ owner: this.owner, repository: this.repository }, function(response) {
          _this.repositoryDetails = response.data;
          _this.initRepositoryDetailsContent();        
        });

        return;
      }
    } 

    // not sharing or no current repository, so just init dialog
    this.initRepositoryDetailsContent();        
  },


  initCommitRepositoryDetails: function() {
    $(".githubRepositoryDialogSection").hide();

    if(!this.githubClient.isLoggedIn()) {
      $('#githubRepositoryLogin').show();
    } else {
      this.userHasLoggedIn();
    }    

    if(this.dialogAction == 'share') {
      // create repository and commit button
      $('#repositoryShareCreateButtonHolder').show();

      // hide ok button
      if(this.repoOkButton) {
        this.repoOkButton.setVisible(false);
      }
    } else {
      $('#repositoryShareCreateButtonHolder').hide();

      if(this.repoOkButton) {
        this.repoOkButton.setVisible(true);
      }
    }
  },

  /*
  https://github.com/jaammees/publictest.git
  git@github.com:jaammees/publictest.git
  https://github.com/jaammees/publictest

  */
  loadRepository: function(args) {
    var address = args.address;
    var view = false;
    if(typeof args.view !== 'undefined') {
      view = args.view;
    }

    var callback = false;
    if(typeof args.callback !== 'undefined') {
      callback = args.callback;
    }


    var pos = address.indexOf('github.com');
    if(pos != -1) {
      address = address.substr(pos + 11);
    }

    if(address.length == 0) {
      return;
    }

    if(address[0] == '/') {
      address = address.substr(1);
    }

    var pos = address.indexOf('.git');
    if(pos !== -1) {
      address = address.substr(0, pos);
    }
    var pos = address.indexOf('/');

    if(pos == -1) {
      return;
    }



    var owner = address.substr(0, pos);
    var repositoryName = address.substr(pos + 1);


    var pos = repositoryName.indexOf('/');
    if(pos != -1) {
      repositoryName = repositoryName.substr(0, pos);
    }

    owner = owner.replace(/\//g, '');
    repositoryName = repositoryName.replace(/\//g, '');

    this.openRepository({ owner: owner, repository: repositoryName, requireLogin: false, view: view }, function(response) {
      if(response.success) {
        UI.closeDialog();

        if(callback !== false) {
          callback();
        }
      } else {
        var message = "<div class=\"alert\">";
        var fullname = owner + '/' + repositoryName;
        message += '<img src="icons/svg/glyphicons-basic-638-triangle-alert.svg" height="16" style="vertical-align: top"/>'
        message += "<div style=\"display: inline-block; width: calc(100% - 40px)\"><strong>Could not open repository '" + fullname + "'</strong>";
        message += "<div>You may need to login to access this repository</div>";
        message += "</div>";
        message += "</div>";

        $('#loadFromGithubRepositoryAlert').html(message);
        $('#loadingRepositoryAlert').html(message);

      }
    });
          
  },
 

  // using start page to load a repository..
  showLoadFromRepositoryDialog: function() {
    var _this = this;

    if(!this.loadFromRepositoryDialog) {
      var width = 360;
      var height = 280;
      if(g_app.isMobile()) {
        height = 340;
      }

      var html = '';
      html += '<div id="loadFromGithubRepository" class="panelFill dialogContent">';
      html += '<div id="loadFromGithubRepositoryAlert" style="margin-bottom: 10px"></div>';
      html += '<div class="formGroup">';
      html += '<label class="controlLabel" for="repositoryAddress" style="margin-bottom: 10px">GitHub Repository:</label> ';
      html += '<input class="formControl" type="text" size="20" value="" id="repositoryAddress"/>';
      html += '</div>';

      html += '</div>';

      this.loadFromRepositoryDialog = UI.create("UI.Dialog", { "id": "loadFromGithubRepository", "title": "Load From GitHub Repository", "width": width, "height": height });

      this.loadRepositoryHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.loadFromRepositoryDialog.add(this.loadRepositoryHTML);

      var _this = this;
      var okButton = UI.create("UI.Button", { "text": "Load", "color": "primary" });
      okButton.on('click', function(event) {
        var repositoryAddress = $('#repositoryAddress').val();
        _this.loadRepository({ "address": repositoryAddress });
      });
      this.loadFromRepositoryDialog.addButton(okButton);

      var closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.loadFromRepositoryDialog.addButton(closeButton);

      this.loadFromRepositoryDialog.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
  
      });

    }

    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);
    $('#loadFromGithubRepositoryAlert').html('');

    UI.showDialog("loadFromGithubRepository");    

  },

  promptRepositoryDetails: function() {
    var _this = this;

    // allow copy and paste
    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

    // create the dialog if it doesn't exist
    if(!this.repositoryDetailsDialog) {
      var width = 420;
      var height = 320;
      if(g_app.isMobile()) {
        height = 340;
      }

      this.repositoryDetailsDialog = UI.create("UI.Dialog", { "id": "githubRepositoryDetails", "title": "GitHub Repository Repository Details", "width": width, "height": height });

      this.repositoryDetailsHTML = UI.create("UI.HTMLPanel");
      this.repositoryDetailsDialog.add(this.repositoryDetailsHTML);

      this.repositoryDetailsHTML.load('html/githubRepositoryDetails.html', function() {
        _this.initCommitRepositoryDetails();
        _this.initRepositoryDetailsEvents();

      });

 
      this.repoOkButton = UI.create('UI.Button', { "text": "Commit", "color": "primary" });
      this.repoOkButton.on('click', function(event) {
        _this.doCommit();
      });

      this.repositoryDetailsDialog.addButton(this.repoOkButton);

      this.repoCloseButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.repoCloseButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.repositoryDetailsDialog.addButton(this.repoCloseButton);

      this.repositoryDetailsDialog.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);

      });
      UI.showDialog("githubRepositoryDetails");    
      $('#repositoryName').show();

    } else {
      UI.showDialog("githubRepositoryDetails");    
      $('#repositoryName').show();

      this.initCommitRepositoryDetails();
    }


  },

  // a commit button has been clicked..
  doCommit: function() {
    var _this = this;
    var args = {

    };

    args.owner = $('#repositoryOwner').val().trim();
    args.repository = $('#repositoryName').val().trim().replace(/ /g, "-");


    // hide inputs.

    this.repoOkButton.setEnabled(false);
    this.repoCloseButton.setEnabled(false);
    var fullname = args.owner + '/' + args.repository;
    $('#githubRepositoryCommitOnly').hide();
    $('#githubRepositoryForm').hide();
    $('#githubRepositoryCommitOnly').hide();
    $('#githubRepositoryMessage').html("Commit to repository: '" + fullname + "'...");
    $('#githubRepositoryMessage').show();
    $('#githubRepositoryProgress').show();
    $('#githubRepositoryError').hide();



    if(this.dialogAction == 'share') { 
      args.action = 'create';
      args.repositoryType = 'public';
      args.commitOnly = 'Initial Commit';
    } else {          
      args.action = $('input[name=githubRepositoryAction]:checked').val();
      args.repositoryType = $('input[name=githubRepositoryType]:checked').val();
      args.commitMessage = $('#repositoryCommitMessage').val();
    }

    if(args.owner == '') {
      alert('Please enter a value for the repository owner')
      return;
    }

    if(args.repository == '') {
      alert('Please enter a name for the repository')
      return;
    }

    $('#githubShareInstructions').hide();

    if(args.action == 'create') {
      // check scopes
      this.githubClient.requestScope('repo', function() {
        _this.createRepository(args);
      });
    } else {  
      if(!this.commitOnly) {
        // maybe c
        //this.setRepositoryFolder('');
      }

      this.githubClient.requestScope('repo', function() {
        
        // make sure the repository exists before committing to it
        _this.githubClient.getRepoDetails(args, function(response) {

          if(response.status == 200) {
            args.repositoryId = response.data.id;

            // record changes in firebase
            _this.recordRepository(args, function(response) {
              _this.repositorySaveLocalVersion(args, function() {
                _this.saveToRepository(args);
              });
            });
          } else if(response.status == 404) {

            // repository not found..
            var fullname = args.owner + '/' + args.repository;

            var message = "<div class=\"alert\">";
            message += '<img src="icons/svg/glyphicons-basic-638-triangle-alert.svg" height="16" style="vertical-align: top"/>'
            message += "<div style=\"display: inline-block; width: calc(100% - 40px)\"><strong>Repository not found '" + fullname + "'</strong></div>";
            message += "</div>";

            $('#githubRepositoryMessage').html(message);
            $('#githubRepositoryMessage').show();

            if(_this.commitOnly) {
              $('#githubRepositoryCommitOnly').show();
            } else {
              $('#githubRepositoryForm').show();
            }
            $('#githubRepositoryProgress').hide();
            $('#githubRepositoryError').hide();
    
            _this.repoOkButton.setEnabled(true);
            _this.repoCloseButton.setEnabled(true);     
          }
        });
      });
    }
  },


  // if the user wants a local version, save it..
  repositorySaveLocalVersion: function(args, callback) {
    var method = 'browserStorage';
    // first need to make sure have a local saved project
    var projectName = g_app.fileManager.getProjectName();
    if(g_app.fileManager.getIsNew()) {
      // ok hasnt been saved before..
      projectName = args.repository;
    }

    // get the list of projects to make sure name is unique
    g_app.fileManager.getProjectList({ type: 'project', thumbnails: false }, function(result) {
      var projects = result.projects;

      if(g_app.fileManager.getIsNew()) {
        // need to make sure name is unique
        var nameFound = true;
        var newName = projectName;
        var nameAttempt = 0;
        while(nameFound) {
          nameFound = false;
          for(var i = 0; i < projects.length; i++) {
            if(projects[i].type == 'project' && projects[i].name == newName) {
              nameFound = true;
              nameAttempt++;
              newName = projectName + '-' + nameAttempt;
              break;
            }
          }
        }
        projectName = newName;
      }


      // save the project to browser storage
      g_app.doc.saveToBrowserStorage({ filename: projectName }, function() {
        g_app.fileManager.setIsNew(false);
        g_app.fileManager.setProjectName(projectName);
        if(typeof callback != 'undefined') {
          callback();
        }
      });
    });    
  },


  createRepository: function(args) {

    this.repoOkButton.setEnabled(false);
    this.repoCloseButton.setEnabled(false);
    var fullname = args.owner + '/' + args.repository;

    $('#githubRepositoryForm').hide();
    $('#githubRepositoryCommitOnly').hide();
    $('#githubRepositoryMessage').html("Creating repository: '" + fullname + "'...");
    $('#githubRepositoryMessage').show();
    $('#githubRepositoryProgress').show();

    var _this = this;

    // if the user wants a local version, save it..
    this.repositorySaveLocalVersion(args, function() {


      // ok, now create the repository
      _this.githubClient.setRepositoryFolder('');
      _this.githubClient.createRepo(args, function(response) {

        var status = response.status;
        var statusText = response.statusText;

        if(status == 500) {
          var message = "<div class=\"alert\">";
          message += '<img src="icons/svg/glyphicons-basic-638-triangle-alert.svg" height="16" style="vertical-align: top"/>'
          message += "<div style=\"display: inline-block; width: calc(100% - 40px)\"><strong>Could not create repository '" + fullname + "', does it already exist?</strong></div>";
          message += "</div>";
          $('#githubRepositoryMessage').html(message);
          if(_this.commitOnly) {
            $('#githubRepositoryCommitOnly').show();
          } else {
            $('#githubRepositoryForm').show();
          }
          $('#githubRepositoryProgress').hide();
          $('#githubRepositoryError').hide();

          _this.repoOkButton.setEnabled(true);
          _this.repoCloseButton.setEnabled(true);

        } else {
          var data = response.data;
          var name = data.name;
          var id = data.id;
          fullname = data.full_name;
          args.repositoryId = data.id;

          console.log("RECORD REPOSITORY IN FIRESTORE!!!!!!!!!!!!!!!!!!!");

          // record repository in firestore
          _this.recordRepository(args, function(response) {
            // save the repository details to the browser storage project
            console.log("SAVE PROJECT REPOSITORY DETAUILSSSS!!!!!!!!!!!!!!!!!!!");
            g_app.fileManager.saveProjectRepositoryDetails({ owner: args.owner, repository: args.repository }, function() {              
              // push the changes
              _this.saveToRepository(args);
            });
          });
        }
      });
    });
  },
/*
  updateRepositoryModified: function(args) {
    var fullname = args.owner + '-' + args.repository;
    var repositoryId = fullname;

    var user = firebase.auth().currentUser;
    var date = new Date();
    var lastModified = date.getTime();

    firestoreDb.collection('users/' + user.uid + '/repositories').doc(repositoryId).set({
      owner: args.owner,
      repository: args.repository,
      repositoryId: args.repositoryId,
      lastModified: lastModified
    }, { merge: true }).then(function(response) {
      if(callback) {
        callback(response);
      }
    }).catch(function(e) {
      console.log('could not record repository');
      console.log(e);
    });

  },
*/


  // record the repository in firebase..
  recordRepository: function(args, callback) {
    var fullname = args.owner + '-' + args.repository;
    var repositoryId = fullname;


    var user = firebase.auth().currentUser;
    var date = new Date();
    var lastModified = date.getTime();

    firestoreDb.collection('users/' + user.uid + '/repositories').doc(repositoryId).set({
      owner: args.owner,
      repository: args.repository,
      repositoryId: args.repositoryId,
      lastModified: lastModified
    }, { merge: true }).then(function(response) {
      if(callback) {
        callback(response);
      }
    }).catch(function(e) {
      console.log('could not record repository');
      console.log(e);
    });
  },

  saveToRepository: function(args) {
    var _this = this;

    this.repoOkButton.setEnabled(false);
    this.repoCloseButton.setEnabled(false);

    var fullname = args.owner + '/' + args.repository;

    $('#githubRepositoryForm').hide();
    $('#githubRepositoryCommitOnly').hide();
    $('#githubRepositoryMessage').html("Commit to repository: '" + fullname + "'...");
    $('#githubRepositoryMessage').show();
    $('#githubRepositoryProgress').show();
    $('#githubRepositoryError').hide();

    this.setRepositoryDetails(args.owner, args.repository);

    args.progress = function(data) {
//      $('#githubRepositoryMessage').html(data.message);
      _this.saveProgressBar.setProgress(data.progress);
    }

    this.githubClient.save(args, function(response) {

      g_app.projectNavigator.updateModifiedList();

      if(typeof response.error != 'undefined' && response.error === true) {
        // uh oh..

        console.log("ERROR" + response.message);

        var errorHTML = '<div>';
        errorHTML += '<p>Sorry an error was encountered:</p>'
        errorHTML += '<p>' + response.message + '</p>';
        errorHTML += '</div>';
        $('#githubRepositoryError').html(errorHTML);
        $('#githubRepositoryError').show();

        _this.repoCloseButton.setEnabled(true);
        return;
      }


      _this.repoOkButton.setEnabled(true);
      _this.repoCloseButton.setEnabled(true);

      if(_this.dialogAction == 'share') {
        // repository has been created..
        // show the repository created message
        $('#githubShareLinkSectionRepositoryCreated').hide();

        _this.showShareLink();
      } else { 
        UI.closeDialog();        
      }
    });
  },


  showLoadingDialog: function() {
    if(this.loadingRepositoryDialog == null) {
      var width = 400;
      var height = 200;

      var screenWidth = UI.getScreenWidth();
      if(screenWidth - 40 < width ) {
        width = screenWidth - 40;

      }
      this.loadingRepositoryDialog = UI.create("UI.Dialog", { "id": "loadingRepositoryDialog", "title": "Loading...", "width": width, "height": height, "showCloseButton": false });

      var html = '<h2 id="loadingRepositoryDialogHeading">Loading...</h2>';
      html += '<div id="loadingRepositoryAlert" style="margin-bottom: 10px"></div>';

      html += '<div id="loadingRepositoryDialogProgress" style="margin-bottom: 4px">&nbsp;</div>';


      this.loadProgressBar = UI.create("UI.ProgressBar");
      html += this.loadProgressBar.getHTML();


      this.loadingRepositoryDialogHTML = UI.create("UI.HTMLPanel", { html: html });
      this.loadingRepositoryDialog.add(this.loadingRepositoryDialogHTML);
    }

    UI.showDialog("loadingRepositoryDialog");    

  },

  setRepositoryDetails: function(owner, repository) {
    this.owner = owner;
    this.repository = repository;
    g_app.projectNavigator.setGithubRepositoryDetails(owner, repository);

    if(owner != false && repository != false) {
      UI('file-commit').setVisible(false);
      UI('project-commitchanges').setVisible(true);
    } else {
      UI('file-commit').setVisible(true);
      UI('project-commitchanges').setVisible(false);
    }
  },

  openRepository: function(args, callback) {

    console.log("OPEN REPOSITORY!");

    var owner = args.owner;
    var repository = args.repository;
    var view = false;
    var createLocalProject = true;

    if(typeof args.view !== 'undefined') {
      view = args.view;
    }

    if(typeof args.createLocalProject != 'undefined') {
      createLocalProject = args.createLocalProject;
    }

    var _this = this;
    this.showLoadingDialog();

    this.loadProgressBar.setProgress(0);
    $('#loadingRepositoryDialogHeading').html("Loading " + repository + "...");
    $('#loadingRepositoryDialogProgress').html("Loading file list...");
    args.progress = function(data) {
      $('#loadingRepositoryDialogProgress').html(data.message);
      _this.loadProgressBar.setProgress(data.progress);
    }
    this.githubClient.load(args, function(response) {

      if(response.success === false) {
        // dont close the dialog so theres a chance to show the error..
        callback(response);

      } else {

        UI.closeDialog();
        _this.setRepositoryDetails(args.owner, args.repository);

        if(createLocalProject) {
          console.log("CREATE LOCAL PROJECT!!!!!!!!!");

          g_app.fileManager.getUniqueProjectName(repository, function(projectName) {
            // need to create a local project..
            var fileManager = g_app.fileManager;

            /*
            var projectArgs = {
              name: projectName,
              owner: args.owner, 
              repository: args.repository
            };
            */

            var projectArgs = {
              filename: projectName,
              owner: args.owner, 
              repository: args.repository
            };


            console.log("CREATE LOCAL PROJECT WITH NAME " + projectName);
            g_app.doc.saveToBrowserStorage(projectArgs, function() {

            });

          });
        }

        g_app.projectNavigator.refreshTree();

        if(view === false) {
          // get the first screen
          var dir = g_app.doc.dir('/screens');

          if(dir && dir.length > 0) {
            var firstScreen = dir[0].name;
            if(view === false) {
              view = '/screens/' + firstScreen;
            }

            view = view.trim();
            if(view.length > 0 && view[0] != '/') {
              view = '/' + view;
            }
        
            var record = g_app.doc.getDocRecord(view);
            if(!record) {
              // uh oh, the view doesn't exist...
              view = false;
            }
          }
        }

        if(view != false) {
          g_app.projectNavigator.showDocRecord(view);
        } else {
          g_app.setMode('none');
        }
        
        if(typeof callback != 'undefined') {
          callback({ success: true });
        }
      }

    });

  },

  getCurrentRepository: function() {
    return {
      owner: this.owner,
      repository: this.repository
    }
  }
}
