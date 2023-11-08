var g_isNewUser = true;

var StartPage = function() {
  this.uiComponent = null;

  this.renameDialog = null;

  this.projects = {};
  this.localProjectList = [];
  this.githubProjectList = [];
  this.googleDriveProjectList = [];


  this.gdriveFileIdToLoad = false;
  this.gdriveStatusKnown = false;

  this.projectList = [];


  // don't load a repository straight away, check log in status first
  this.repositoryToLoad = false;
  this.repositoryToLoadView = false;
  this.userStatusKnown = false;

  this.gistToLoad = false;

  this.dragBorderElementTop = false;
  this.dragBorderVisible = false;
}

StartPage.prototype = {
  init: function() {
  },

  buildInterface: function(parentComponent) {
    
    var _this = this;
    this.uiComponent = UI.create("UI.Panel", { "id": "startPage" });
    parentComponent.add(this.uiComponent);

    this.htmlPanel = UI.create("UI.HTMLPanel", 
      { "id": "startPageHTML", "html": '<div id="frames" class="panelFill" style="background-color: #ffffff"></div>' });
    this.uiComponent.add(this.htmlPanel);

    var loadingHTML = '<div style="text-align: center; padding-top: 100px">';
    
    loadingHTML += '<div style="margin-bottom: 10px"><img src="images/logo32t.png"/></div>';
    loadingHTML += '<div>loading....</div>';

    loadingHTML += '</div>';
    this.loadingPanel = UI.create("UI.HTMLPanel", { "id": "loadingPageHTML", "html": loadingHTML });
    this.uiComponent.add(this.loadingPanel, { "id": "loadeeingPanel" });


    UI.on('ready', function() {
      _this.uiComponent.showOnly("loadingPageHTML");
      var htmlFile = 'html/startPage.html';
      if(UI.isMobile.any()) {
        htmlFile = 'html/startPageMobile.html';
      }

      _this.htmlPanel.load(htmlFile, function() {
        _this.initContent();
        _this.initEvents();

      });
    });
  },

  show: function() {

    //g_app.setMode('start');
    this.uiComponent.showOnly("startPageHTML");

    this.drawBrowserStorage();
  },

  gdriveStatusUpdated: function() {
    this.gdriveStatusKnown = true;
    if(this.gdriveFileIdToLoad !== false) {
      var fileId = this.gdriveFileIdToLoad;
      g_app.gdrive.openProject({ id: fileId, name: 'Untitiled'});
      this.gdriveFileIdToLoad = false;
    }
  },

  // github user status is now known
  // check if the user trying to load a project from a github repository
  // if so try loading it now.
  userLoginStatusUpdated: function() {
    this.userStatusKnown = true;

    // check if user was trying to load a repository
    // using a shared link
    if(this.repositoryToLoad !== false) {
      var repositoryURL = this.repositoryToLoad;

      var _this = this;

      // check if its in the cache first./
      g_app.fileManager.getCacheFile(repositoryURL, function(result) {

        if(result !== null) {
          g_app.fileManager.loadCachedData({ data: result, view: this.repositoryToLoadView });

        } else {
          g_app.github.loadRepository({ 
            "address": repositoryURL, 
            "view": this.repositoryToLoadView,
            "callback": function() {
              var expirySeconds = 1 * 60 * 60;

              g_app.fileManager.cacheFile(repositoryURL, g_app.doc.data, expirySeconds);

            }
          });
        }

      });
      this.repositoryToLoad = false;
    }

    if(this.gistToLoad !== false) {

      g_app.gist.loadFromGist({
        gist: this.gistToLoad
      });

    }

  },


  processURL: function() {
    var _this = this;

    UI.on('ready', function() {
      var url = window.location.href;
      var urlParams = new URLSearchParams(window.location.search);

      urlParams.has('type');  // true
      var charset = '';

      if(urlParams.has('tileset')) {
        charset = urlParams.get('tileset');    // 1234
      }

      var editor = '';
      if(urlParams.has('editor')) {
        editor = urlParams.get('editor');
      }


      if(url.indexOf('/c64/') !== -1) {
        editor = 'c64';
      }

      var width = 40;
      if(urlParams.has('width')) {
        width = parseInt(urlParams.get('width'), 10);
      }

      var height = 25;
      if(urlParams.has('height')) {
        height = parseInt(urlParams.get('height'), 10);
      }

      var screenMode = 'textmode';
      if(urlParams.has('mode')) {
        screenMode = urlParams.get('mode');
      }

      var canFlipTile = false;
      if(urlParams.has('tileflip') && parseInt(urlParams.get('tileflip'), 10) == 1) {
        canFlipTile = true;
      }

      var canRotateTile = false;
      if(urlParams.has('tilerotate') && parseInt(urlParams.get('tilerotate'), 10) == 1) {
        canRotateTile = true;
      }

      var palette = '';

      if(urlParams.has('palette')) {
        palette = urlParams.get('palette');
      }

      var gh = false;
      if(urlParams.has('gh')) {
        gh = urlParams.get('gh');
      }

      var gist = false;
      if(urlParams.has('gist')) {
        gist = urlParams.get('gist');
      }

      if(urlParams.has('gid')) {
        gist = urlParams.get('gid');
      }


      var gd = false;
      if(urlParams.has('gd')) {
        gd = urlParams.get('gd');
      }

      var view = false;
      if(urlParams.has('view')) {
        view = urlParams.get('view');
      }

      if(gh !== false) {
        // loading a github repository
        _this.repositoryToLoad = gh;
        _this.repositoryToLoadView = view;
        if(_this.userStatusKnown) {
          // already know the user status, so just load it
          _this.userLoginStatusUpdated();
        }
        return;
      }

      if(gd !== false) {
        // loading a google drive repository
        _this.gdriveFileIdToLoad = gd;
        if(_this.gdriveStatusKnown) {
          _this.gdriveStatusUpdated();
        }
        return;
      }

      if(gist !== false) {
        // loading from a gist
        _this.gistToLoad = gist;
        _this.gistToLoadView = view;
        if(_this.userStatusKnown) {
          // already know the user status, so just load it
          _this.userLoginStatusUpdated();
        }
        return;
      }


      if(charset != '' || palette != '' || editor != '') {
        var args = {};
        args.mode = TextModeEditor.Mode.TEXTMODE;

        // check if width is specified
        if(isNaN(width) || width <= 0) {
          args.width = 40;
        } else {
          args.width = width;
        }

        // check if height is specified
        if(isNaN(height) || height <= 0) {
          args.height = 25;
        } else {
          args.height = height;
        }

        
        args.editor = editor;
        args.tileSet = charset;
        args.palette = palette;
        args.screenMode = screenMode;
        args.canFlipTile = canFlipTile;
        args.canRotateTile = canRotateTile;

        g_app.newProject(args, function() {
        });

        var url = window.location.href;
        var queryPos = url.indexOf('?');
        if(queryPos !== -1) {
          url = url.substr(0, queryPos);
        }
        // fix the url..
        UI.browserPushState({}, 'lvllvl', url);
      } else {
        // nothing specified in the url so show the start page...
        //_this.showStartPage();
        g_app.setMode('start');
      }
    });
  },


  initRenameContent: function() {
    var projectName = this.projects[this.currentProjectId].name;
    $('#renameProjectName').val(projectName);

  },


  renameProject: function(newName) {
    var _this = this;
    g_app.fileManager.renameProject({ projectId: this.currentProjectId, name: newName }, function() {
      _this.drawBrowserStorage();
    });
  },

  showRenameProject: function(projectId) {
    var _this = this;

    if(this.renameDialog == null) {
      var width = 360;
      var height = 100;

      if(UI.isMobile.any()) {
        height = 220;
        width = 270;
      }
      this.renameDialog = UI.create("UI.Dialog", { "id": "renameDialog", "title": "Rename", "width": width, "height": height });

      this.newHTML = UI.create("UI.HTMLPanel");
      this.renameDialog.add(this.newHTML);
      this.newHTML.load('html/project/renameDialog.html', function() {
        _this.initRenameContent();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.okButton.on('click', function(event) {
        var newName = $('#renameProjectName').val(); 
        _this.renameProject(newName);
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.renameDialog.addButton(this.okButton);
      this.renameDialog.addButton(this.closeButton);
    } else {
      this.initRenameContent();
    }

    UI.showDialog("renameDialog");

  },




  displayPersist: function(persist) {

    var html = persist;

    if(persist != 'persisted') {
//      html = 'Browser storage is set to temporary, data may be evicted by the browser - make sure you have downloaded copies of any data you want to keep';
    }

    html = '';
    $('#browserStorage_persistent').html(html);

  },


  updateProjectThumbnails: function() {

  },

  drawProjects: function() {
    var _this = this;
    var projectsHTML = '';


    var projects = [];
    for(var i = 0; i < this.localProjectList.length; i++) {
      this.localProjectList[i].type = 'local';
      projects.push(this.localProjectList[i]);
    }

    for(var i = 0; i < this.githubProjectList.length; i++) {
      this.githubProjectList[i].type = 'github';
      // only add it if not already in list

      var owner = this.githubProjectList[i].owner;
      var repository = this.githubProjectList[i].repository;
      var alreadyExists = false;

      for(var j = 0; j < this.localProjectList.length; j++) {
        if(typeof this.localProjectList[j].githubOwner != 'undefined' && typeof this.localProjectList[j].githubRepository != 'undefined') {
          if(this.localProjectList[j].githubOwner === owner 
            && this.localProjectList[j].githubRepository === repository) {
            alreadyExists = true;
            break;  
          }
        }
      }

      if(!alreadyExists) {
        projects.push(this.githubProjectList[i]);
      }
    }

    for(var i = 0; i < this.googleDriveProjectList.length; i++) {
      this.googleDriveProjectList[i].type = 'gdrive';
      projects.push(this.googleDriveProjectList[i]);
    }

    projects.sort(function(a,b) {
      if(typeof a.lastModified == 'undefined') {
        return 1;
      }

      if(typeof b.lastModified == 'undefined') {
        return -1;
      }

      if(a.lastModified < b.lastModified) {
        return 1;
      }

      if(a.lastModified > b.lastModified) {
        return -1;
      }

      return 0;
    });

    // if there are saved projects, show if they are persistent
    if(projects.length > 0) {
      if(typeof tryPersistWithoutPromtingUser != 'undefined') {
        tryPersistWithoutPromtingUser(function(result) {
          _this.displayPersist(result);

        });
      }        
    }


    for(var i = 0; i < projects.length; i++) {
      var projectId = projects[i].id;
      var projectName = projects[i].name;

      if(projectName !== '__autosave') {
        _this.projects[projectId] = projects[i];


//          g_app.fileManager.getProjectThumbnail({ id: projectId }, function(result) {


        var blockHTML = '';
        if(projects[i].type == 'local') {
          var githubOwner = false;
          var githubRepository = false;

          if(typeof projects[i].githubOwner !== 'undefined' && typeof projects[i].githubRepository != 'undefined') {
            githubOwner = projects[i].githubOwner;
            githubRepository = projects[i].githubRepository;            
          }

          blockHTML += '<div class="start-tile">';

          blockHTML += '<div class="rippleJS"></div>';

          // image square
          blockHTML += '<div class="start-tile-image project-open" ';
          blockHTML += ' data-id="' + projectId + '" ';
          blockHTML += ' data-name="' + projectName + '" ';

          if(githubOwner && githubRepository) {
            blockHTML += ' data-owner="' + githubOwner + '" ';
            blockHTML += ' data-repository="' + githubRepository + '" ';
          }
          blockHTML += ' style="image-rendering: pixelated; background-image: url(\'' + projects[i].thumbnailData + '\')">';

          if(githubOwner && githubRepository) {
            // github image
//            blockHTML += '<img style="filter: invert(80%); opacity: 0.7; position: absolute; bottom: 6px; right: 6px; width: 28px; height: 28px; " src="icons/GitHub-Mark-64px.png"/>';
          }
          
          blockHTML += '<div class="rippleJS"></div>';
          
          blockHTML += '</div>';

          // project name
          blockHTML += '<div class="start-tile-label project-open" data-id="' + projectId + '" data-name="' + projectName + '">';
          
          // github icon
          if(githubOwner && githubRepository) {
            // github image
            blockHTML += '<img style="filter: invert(80%); margin-right: 4px; width: 14px; height: 14px; " src="icons/GitHub-Mark-64px.png"/>';
          }

          blockHTML += projectName;
          blockHTML += '</div>';

          if(githubOwner && githubRepository) {
            blockHTML += '<div class="start-tile-more repository-more" data-id="' + projectId + '" data-owner="' + githubOwner + '" data-repository="' + githubRepository + '"><img src="icons/material/baseline-more_vert-24px.svg" height="16px"/></div>';
          } else {
            blockHTML += '<div class="start-tile-more project-more" data-id="' + projectId + '" data-name="' + projectName + '"><img src="icons/material/baseline-more_vert-24px.svg" height="16px"/></div>';
          }
          blockHTML += '</div>';
        } else if(projects[i].type == 'github') {
          var owner = projects[i].owner;
          var repository = projects[i].repository;
          blockHTML += '<div class="start-tile">';
          blockHTML += '<div class="rippleJS"></div>';
          blockHTML += '<div class="start-tile-image repository-open" title="' + repository + '" data-owner="' + owner + '" data-repository="' + repository + '" style="text-align: center; display: flex-box">';
//          blockHTML += '<img style="filter: invert(60%)" width="40" src="icons/material/baseline-cloud_circle-24px.svg">';
          blockHTML += '<img style="filter: invert(60%); width: 32px; height: 32px; " src="icons/GitHub-Mark-64px.png"/>';

          //GitHub-Mark-32px.png
          blockHTML += '<div class="rippleJS"></div>';
          blockHTML += '</div>';
          blockHTML += '<div class="start-tile-label repository-open" title="' + repository + '" data-owner="' + owner + '" data-repository="' + repository + '">' + repository + '</div>';
          blockHTML += '<div class="start-tile-more repository-more" data-id="' + projectId + '" data-owner="' + owner + '" data-repository="' + repository + '"><img src="icons/material/baseline-more_vert-24px.svg" height="16px"/></div>';
          blockHTML += '</div>';
        } else if(projects[i].type == 'gdrive') {
//          var owner = projects[i].owner;
//          var repository = projects[i].repository;
          var name = projects[i].name;
          var id = projects[i].id;
          blockHTML += '<div class="start-tile">';
          blockHTML += '<div class="rippleJS"></div>';
          blockHTML += '<div class="start-tile-image gdrive-open" data-id="' + id + '" title="' + name + '" style="text-align: center; display: flex-box">';
//          blockHTML += '<img style="filter: invert(60%)" width="40" src="icons/material/baseline-cloud_circle-24px.svg">';
          blockHTML += '<img style="filter: invert(60%); width: 32px; height: 32px; " src="icons/GoogleDriveIconMonochromatic512.png"/>';

          //GitHub-Mark-32px.png
          blockHTML += '<div class="rippleJS"></div>';
          blockHTML += '</div>';
          blockHTML += '<div class="start-tile-label gdrive-open" data-id="' + id + '" title="' + name + '">' + name + '</div>';
          blockHTML += '<div class="start-tile-more gdrive-more"  data-id="' + id + '" title="' + name + '"><img src="icons/material/baseline-more_vert-24px.svg" height="16px"/></div>';
          blockHTML += '</div>';

        }
        
        
        projectsHTML += blockHTML;
      }
    }


    $('#browserStorage_projects').html(projectsHTML);


    _this.updateProjectThumbnails();

    $('.project-open').on('click', function() {
      var projectId = $(this).attr('data-id');
//      var projectName = $(this).attr('data-name');
      _this.projectOpen({ projectId: projectId });
    });

    $('.project-more').on('click', function(e) {
      var projectId = $(this).attr('data-id');
      _this.showProjectMenu(e, projectId);
    });


    $('.project-open').on('contextmenu', function(e) {
      e.preventDefault();

      var projectId = $(this).attr('data-id');
      var owner = $(this).attr('data-owner');
      var repository = $(this).attr('data-repository');


      if(owner && repository) {
        _this.showRepositoryMenu(e, owner, repository, projectId);
      } else {
        _this.showProjectMenu(e, projectId);
      }
    });


    $('.repository-open').on('click', function(e) {
      var owner = $(this).attr('data-owner');
      var repository = $(this).attr('data-repository');
      g_app.github.openRepository({ owner: owner, repository: repository});
    });

    $('.repository-more').on('click', function(e) {
      var projectId = $(this).attr('data-id');
      var owner = $(this).attr('data-owner');
      var repository = $(this).attr('data-repository');

      _this.showRepositoryMenu(e, owner, repository, projectId);
    });


    $('.repository-open').on('contextmenu', function(e) {
      var owner = $(this).attr('data-owner');
      var repository = $(this).attr('data-repository');
      e.preventDefault();
      _this.showRepositoryMenu(e, owner, repository);
    });


    $('.gdrive-open').on('click', function(e) {
      var id = $(this).attr('data-id');
      var name = $(this).attr('title');
      g_app.gdrive.openProject({ "id": id, "name": name });
    });

    $('.gdrive-open').on('contextmenu', function(e) {
      var name = $(this).attr('title');
      var id = $(this).attr('data-id');
      e.preventDefault();
      _this.showGDriveMenu(e, name, id);
    });

    $('.gdrive-more').on('click', function(e) {
      var name = $(this).attr('title');
      var id = $(this).attr('data-id');

      _this.showGDriveMenu(e, name, id);
    });

    if(projectsHTML == '') {
      projectsHTML = '<div>Saved projects will appear here</div>';
      $('#browserStorage_projects').html(projectsHTML);
    }
  },
  

  showDragBorder: function() {
    if(!this.dragBorderVisible) {
      this.dragBorderVisible = true;
      if(this.dragBorderElementTop == false) {

        this.dragBorderElementTop = document.createElement('div');
        this.dragBorderElementTop.setAttribute('style', 'position: absolute; border-top: 2px solid #4433dd; z-index: 3000; top: 0; height: 2px; left: 0; right: 0');
        this.dragBorderElementTop.setAttribute('id', 'dragBorderElementTop');
        document.body.appendChild(this.dragBorderElementTop);

        this.dragBorderElementBottom = document.createElement('div');
        this.dragBorderElementBottom.setAttribute('style', 'position: absolute; border-bottom: 2px solid #4433dd; z-index: 3000; height: 2px; bottom: 0; left: 0; right: 0');
        this.dragBorderElementBottom.setAttribute('id', 'dragBorderElementBottom');
        document.body.appendChild(this.dragBorderElementBottom);

        this.dragBorderElementLeft = document.createElement('div');
        this.dragBorderElementLeft.setAttribute('style', 'position: absolute; border-left: 2px solid #4433dd; z-index: 3000; top: 0; bottom: 0; left: 0; width: 2px');
        this.dragBorderElementLeft.setAttribute('id', 'dragBorderElementLeft');
        document.body.appendChild(this.dragBorderElementLeft);

        this.dragBorderElementRight = document.createElement('div');
        this.dragBorderElementRight.setAttribute('style', 'position: absolute; border-right: 2px solid #4433dd; z-index: 3000; top: 0; bottom: 0; width: 2px; right: 0');
        this.dragBorderElementRight.setAttribute('id', 'dragBorderElementRight');
        document.body.appendChild(this.dragBorderElementRight);

      } else {
        $('#dragBorderElementTop').show();
        $('#dragBorderElementBottom').show();
        $('#dragBorderElementLeft').show();
        $('#dragBorderElementRight').show();
      }
    }
 
  },

  hideDragBorder: function() {
    $('#dragBorderElementTop').hide();
    $('#dragBorderElementBottom').hide();
    $('#dragBorderElementLeft').hide();
    $('#dragBorderElementRight').hide();
    this.dragBorderVisible = false;
  },

  setIsNewUser: function(isNewUser) {
    g_isNewUser = isNewUser;
    if(!isNewUser) {
      var petsciiSortMethod = g_app.getPref("textmode.petsciisortmethod");

      if(typeof petsciiSortMethod == 'undefined' || petsciiSortMethod == null) {
        g_app.setPref("textmode.petsciisortmethod", "similar");        
      }

      var infoPanelVisible = g_app.getPref("textmode.infoPanelVisible");
      if(typeof infoPanelVisible == 'undefined' || infoPanelVisible === null) {
        g_app.setPref("textmode.infoPanelVisible", "yes");
      }
    }

  },

  drawBrowserStorage: function() {
    var _this = this;

    g_app.fileManager.getProjectList({ type: 'project' }, function(result) {
      _this.localProjectList = result.projects;

      _this.setIsNewUser(_this.localProjectList.length == 0);
      _this.drawProjects();

    });
    


    g_app.fileManager.getAutosaveSummary(function(result) {
      if(result.success) {
        $('#start-continue-last .start-tile-image').css('background-image', "url('" + result.thumbnailData + "')")

        $('#start-continue-last').show();

      } else {
        $('#start-continue-last').hide();
      }
    });


    $('.projectDelete').on('click', function() {
      if(confirm('Are you sure you want to delete?')) {
        var fileId = $(this).attr('data-fileId');
        _this.projectDelete({ fileId: fileId});

      }
    });

    $('.templateOpen').on('click', function() {
      var fileId = $(this).attr('data-fileId');
      _this.templateOpen({ fileId: fileId});
    });
  },


  initContent: function() {
    if(UI.isMobile.any()) {
      $('#startContinueLast').show();
      $('#startOpen').hide();

    } else {
      $('#startContinueLast').hide();
      $('#startOpen').show();
    }

//    this.drawBrowserStorage();
    this.drawProjects();

  },
  initEvents: function() {
    var _this = this;

    $('#startOpen').on('click', function() {
      g_app.fileManager.openLocalFile();      
//      g_app.setMode('');
    });

    $('#start2D').on('click', function() {
      var newProjectDialog = g_app.getNewProjectDialog();
      newProjectDialog.show();
      /*
      var args = {};
      args.mode = 'monochrome';
      args.width = 40;
      args.height = 25;
      g_app.newProject(args);      
      */

      if(UI.isMobile.any()) {
//        UI.goFullscreen();
      }
    });

    $('#start-continue-last').on('click', function() {
      var args = {};
      args.fileId = _this.continueLastFileId;
      //_this.loadAutosave(args);
      g_app.fileManager.loadAutosave();
  
    });

    $('#loadRepository').on('click', function() {
      g_app.github.showLoadFromRepositoryDialog();
      
    });

    $('#start-login-mobile').on('click', function() {
      _this.login();      
    });

    $('#start-logout-mobile').on('click', function() {
      _this.logout();      
    });

    $('#login-button').on('click', function() {
      var callback = function() {

      };

      var scopesRequired = [];
      _this.login(callback, scopesRequired);      
    });

    $('#logout-button').on('click', function() {
      _this.logout();      
    });

    $('#testsave').on('click', function() {
      g_app.github.load();
    });

    $('#startImportImage').on('click', function() {

      var args = {};
      g_app.newProject(args, function() {

        g_app.setMode('2d');
        g_app.textModeEditor.importImage.start();
      });
      

    });

    $('#startMusic').on('click', function() {
      var args = {};
      g_app.newProject(args);
      g_app.setMode('music');

    });


    $('#connectToGDriveButton').on('click', function() {
      _this.connectToGDrive();
    }); 

    $('#connectToGDriveButtonMobile').on('click', function() {
      _this.connectToGDrive();
    }); 


    $('#disconnectFromGDriveButton').on('click', function() {
      _this.disconnectFromGDrive();
    }); 

    $('#disconnectFromGDriveButtonMobile').on('click', function() {
      _this.disconnectFromGDrive();
    }); 

    $('#projectMenuBacking').on('click', function() {
      _this.hideProjectMenu();
      _this.hideRepositoryMenu();
    });

    $('.projectMenuItem').on('click', function() {
      var action = $(this).attr('data-action');
      _this.hideProjectMenu();

      switch(action) {
        case 'open':
          _this.projectOpen({ projectId: _this.currentProjectId });
        break;
        case 'delete':
          _this.deleteProject();
        break;
        case 'rename':
          _this.showRenameProject();
        break;
        case 'download':
          _this.downloadProject();
        break;
      }
    });

    $('.repositoryMenuItem').on('click', function() {
      var action = $(this).attr('data-action');
      _this.hideRepositoryMenu();

      switch(action) {
        case 'opennocheck':
          _this.projectOpen({ projectId: _this.currentProjectId, githubCheck: false });
                
          break;
        case 'remove':
          _this.removeRepository();
        break;
        case 'viewongithub':
          _this.viewOnGitHub();
        break;
      }
    });

    $('.gdriveMenuItem').on('click', function() {
      var action = $(this).attr('data-action');
      _this.hideGDriveMenu();

      switch(action) {
        case 'viewInGDrive':
          _this.viewInGDrive();
        break;
        case 'download':
          _this.gDriveDownload();
        break;
        case 'delete':
          _this.gDriveDelete();
        break;
      }
    });    
    if(document.getElementById('startPageProjectHolderMobile')) {
      document.getElementById('startPageProjectHolderMobile').addEventListener("dragover", function(event) {
        event.preventDefault();
      });

      document.getElementById('startPageProjectHolderMobile').addEventListener("dragleave", function(event) {
        event.preventDefault();
      });

      //document.addEventListener("drop", function(event) {
      document.getElementById('startPageProjectHolderMobile').addEventListener("drop", function(event) {
        event.preventDefault();
        
  //      var data = event.dataTransfer.getData("Text");
        var files;
        if (event.dataTransfer) {
          // method was called from a file drop
          var files = event.dataTransfer.files;
          if(files.length > 0) {
            g_app.fileManager.openFile(files[0]);
          }
        }
      });
    }

    if(document.getElementById('startPageProjectHolder')) {
//      document.getElementById('startPageProjectHolder').addEventListener("dragover", function(event) {
        document.addEventListener("dragover", function(event) {
          _this.showDragBorder();
          event.preventDefault();
      });

      //document.getElementById('startPageProjectHolder').addEventListener("dragleave", function(event) {
      document.addEventListener("dragleave", function(event) {
        
        _this.hideDragBorder();
        event.preventDefault();
      });

      document.addEventListener("drop", function(event) {
        
      //document.getElementById('startPageProjectHolder').addEventListener("drop", function(event) {
        event.preventDefault();
        _this.hideDragBorder();
  //      var data = event.dataTransfer.getData("Text");


        var files;
        if (event.dataTransfer) {
          // method was called from a file drop
          var files = event.dataTransfer.files;
          if(files.length > 0) {
            g_app.fileManager.openFile(files[0]);
          }

        }
      });
    }

    $('#startPageProjectHolder').on('contextmenu', function(e) {
      e.preventDefault();
    });

    $('#startPageBanner *').on('contextmenu', function(e) {
      e.preventDefault();
    });

  },

  viewInGDrive: function() {
    var id = this.currentGDriveId;
    for(var i = 0; i < this.googleDriveProjectList.length; i++) {
      if(this.googleDriveProjectList[i].id == id) {
        window.open(this.googleDriveProjectList[i].webViewLink);
        return;
      }
    }
  },

  gDriveDownload: function() {
    var id = this.currentGDriveId;
    for(var i = 0; i < this.googleDriveProjectList.length; i++) {
      if(this.googleDriveProjectList[i].id == id) {
        window.open(this.googleDriveProjectList[i].webContentLink);
        return;
      }
    }

  },

  gDriveDelete: function() {
    var id = this.currentGDriveId;
    for(var i = 0; i < this.googleDriveProjectList.length; i++) {
      if(this.googleDriveProjectList[i].id == id) {

        return;
      }
    }
  },
  login: function(callback, scopesRequired) {
    if(UI.isMobile.any()) {
      g_app.confirmLeave = false;
      g_app.githubClient.loginWithRedirect(callback, scopesRequired);
    } else {     
      g_app.githubClient.login(callback, scopesRequired);
    }
  },


  logout: function() {
    g_app.githubClient.logout();
  },  


  hideProjectMenu: function() {
    $('#projectMenuBacking').fadeOut({ duration: 200 });
    $('#projectMenu').fadeOut({ duration: 200 });
  },

  hideRepositoryMenu: function() {
    $('#projectMenuBacking').fadeOut({ duration: 200 });
    $('#repositoryMenu').fadeOut({ duration: 200 });
  },
  hideGDriveMenu: function() {
    $('#projectMenuBacking').fadeOut({ duration: 200 });
    $('#gdriveMenu').fadeOut({ duration: 200 });
  },

  connectToGDrive: function() {
    g_app.gdrive.handleAuthClick();
  },

  disconnectFromGDrive: function() {
    g_app.gdrive.handleSignoutClick();

  },

  deleteProject: function() {
    var _this = this;

    if(confirm('Are you sure you want to delete?')) {
      g_app.fileManager.deleteBrowserStorageProject({ projectId: this.currentProjectId }, function() {
        _this.drawBrowserStorage();
      });
    }

  },

  viewOnGitHub: function() {
    var url = 'https://github.com/' + this.currentOwner + '/' + this.currentRepository;
    window.open(url);

  },

  removeRepository: function() {
    var _this = this;

    if(confirm('Are you sure you want to remove this repository?\nThe repository will be removed from this page, but not deleted from GitHub.')) {
      g_app.removeRepository(this.currentOwner, this.currentRepository, function() {    
        g_app.fileManager.deleteBrowserStorageProject({ projectId: _this.currentProjectId }, function() {
          g_app.getRepositoryList();
          _this.drawBrowserStorage();
        });
      });
    }
  },

  downloadProject: function() {
    //projectId: this.currentProjectId
    var filename = 'project';

    for(var i = 0; i < this.localProjectList.length; i++) {
      if(this.localProjectList[i].id == this.currentProjectId) {
        filename = this.localProjectList[i].name;
        break;
      }
    }

    g_app.fileManager.downloadProject({ filename: filename, projectId: this.currentProjectId });
  },

  showRepositoryMenu: function(e, owner, repository, projectId) {

    var x = e.pageX;
    var y = e.pageY;    

//    y += $('#startPageBanner').height();
    this.currentOwner = owner;
    this.currentRepository = repository;
    this.currentProjectId = projectId;

    $('#projectMenuBacking').show();

    $('#repositoryMenu').show();//{ duration: 200 });
    $('#repositoryMenu').css('top', y + 'px');
    $('#repositoryMenu').css('left', x + 'px');

  },

  showGDriveMenu: function(e, name, id) {
    var x = e.pageX;
    var y = e.pageY;    

//    y += $('#startPageBanner').height();
    this.currentGDriveName = name;
    this.currentGDriveId = id;

    $('#projectMenuBacking').show();

    $('#gdriveMenu').show();//{ duration: 200 });
    $('#gdriveMenu').css('top', y + 'px');
    $('#gdriveMenu').css('left', x + 'px');

  },




  showProjectMenu: function(e, projectId) {
    var x = e.pageX;
    var y = e.pageY;    

//    y += $('#startPageBanner').height();
    this.currentProjectId = projectId;

    $('#projectMenuBacking').show();

    $('#projectMenu').show();//{ duration: 200 });
    $('#projectMenu').css('top', y + 'px');
    $('#projectMenu').css('left', x + 'px');

  },

  projectOpen: function(args) {
    var projectId = args.projectId;
//    var projectName = args.projectName;
    var projectName = '';
    var currentPath = false;
    var projectNavVisible = false;
    var githubOwner = false;
    var githubRepository = false;
    var githubCheck = false;

    for(var i = 0; i < this.localProjectList.length; i++) {
      if(this.localProjectList[i].id == projectId) {
        if(typeof this.localProjectList[i].name != 'undefined') {
          projectName = this.localProjectList[i].name;
        }
        if(typeof this.localProjectList[i].currentPath != 'undefined') {
          currentPath = this.localProjectList[i].currentPath;          
        }
        if(typeof this.localProjectList[i].projectNavVisible != 'undefined') {
          projectNavVisible = this.localProjectList[i].projectNavVisible;          
        }

        if(typeof this.localProjectList[i].githubOwner != 'undefined') {
          githubOwner = this.localProjectList[i].githubOwner; 
        }
        if(typeof this.localProjectList[i].githubRepository != 'undefined') {
          githubRepository = this.localProjectList[i].githubRepository; 
          githubCheck = true;
        }
      }
    }

    if(typeof args.githubCheck != 'undefined') {
      githubCheck = args.githubCheck;
    }


    g_app.openProject({
      projectId: projectId, 
      projectName: projectName, 
      currentPath: currentPath,   // currently open record
      projectNavVisible: projectNavVisible,
      githubOwner: githubOwner,
      githubRepository: githubRepository,
      githubCheck: githubCheck
    });

  },

  projectOpenOld: function(args) {
    var fileId = args.fileId;
    g_app.fileManager.loadBrowserStorageProject(fileId);
  },

  templateOpen: function(args) {
    var fileId = args.fileId;

    g_app.fileManager.loadBrowserStorageTemplate(fileId);

//    g_app.newDocument(args);

//    g_app.fileManager.loadBrowserStorageProject(fileId);
  },

  projectDelete: function(args) {
    var fileId = args.fileId;
    var _this = this;
    g_app.fileManager.deleteBrowserStorageProject(fileId, function() {
      _this.drawBrowserStorage();
    });
  },


  updateRepositories: function(args) {
    this.githubProjectList = g_app.repositories;
    this.drawProjects();
  }
}