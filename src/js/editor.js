var SHOWUNFINISHED = false;
var g_urlParams = new URLSearchParams(window.location.search);
if(g_urlParams.has('features') && g_urlParams.get('features') == 'all') {
  SHOWUNFINISHED = true;
}

var g_paramEditor = '';
if(g_urlParams.has('editor')) {
  g_paramEditor = g_urlParams.get('editor');
}


// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136

var lut = [];

for ( var i = 0; i < 256; i ++ ) {
  lut[ i ] = ( i < 16 ? '0' : '' ) + ( i ).toString( 16 );
}

function generateUUID() {

  var d0 = Math.random() * 0xffffffff | 0;
  var d1 = Math.random() * 0xffffffff | 0;
  var d2 = Math.random() * 0xffffffff | 0;
  var d3 = Math.random() * 0xffffffff | 0;
  var uuid = lut[ d0 & 0xff ] + lut[ d0 >> 8 & 0xff ] + lut[ d0 >> 16 & 0xff ] + lut[ d0 >> 24 & 0xff ] + '-' +
    lut[ d1 & 0xff ] + lut[ d1 >> 8 & 0xff ] + '-' + lut[ d1 >> 16 & 0x0f | 0x40 ] + lut[ d1 >> 24 & 0xff ] + '-' +
    lut[ d2 & 0x3f | 0x80 ] + lut[ d2 >> 8 & 0xff ] + '-' + lut[ d2 >> 16 & 0xff ] + lut[ d2 >> 24 & 0xff ] +
    lut[ d3 & 0xff ] + lut[ d3 >> 8 & 0xff ] + lut[ d3 >> 16 & 0xff ] + lut[ d3 >> 24 & 0xff ];

  // .toUpperCase() here flattens concatenated strings to save heap memory space.
  return uuid.toUpperCase();

};

function base64ToBuffer( str ) {

  var b = atob( str );
  var buf = new Uint8Array( b.length );

  for ( var i = 0, l = buf.length; i < l; i ++ ) {
    buf[ i ] = b.charCodeAt( i );
  }
  return buf;
}

var Editor = function() {
  this.mode = false;


  this.newProjectDialog = null;

  this.mobileInterfaceType = 'full';
  this.projectSplitPanel = null;
  this.mainSplitPanel = null;
  this.menuBar = null;

  this.spriteEditor = null;
  this.textModeEditor = null;
  this.projectShare = null;
  this.music = null;
  this.assemblerEditor = null;
  this.colorPaletteEditor = null;
  this.tileSetEditor = null;
  this.scriptEditor = null;
  this.jsonEditor = null;
  this.textEditor = null;

  this.hexEditor = null;

  this.createTemplateLink = null;

//  this.c64 = null;

  this.c64Debugger = null;
  
  this.nesDebugger = null;
  this.x16Debugger = null;
  this.dbgFont = null;

  this.features = {};

  this.projectNavigator = null;
  this.projectNavigatorMobile = null;
  this.fileManager = null;

  this.doc = null;

  this.menuItems = {};
  this.confirmLeave = true;


  // allow code editor to turn off key shortcuts
  this.allowKeyShortcuts = true;

  this.deviceType = 'desktop';

  this.githubClient = null;
  this.gistClient = null;
  this.githubLogoutDialog = null;  

  this.gdrive = null;

  this.state = {
    user: {},
    isLoggedIn: false
  }
  this.repositories = [];

  this.openingProject = false;

  this.fontSize = 14;

  this.isElectron = false;

}

var firestoreDb = null;

Editor.prototype = {


  // init is the first thing called after the page loads
  init: function(args) {
    this.setEnabled('textmode3d', true);

    if(typeof args != 'undefined') {
      if(typeof args.type != 'undefined') {
        this.isElectron = args.type == 'electron';
      }
    }

    if(UI.isMobile.any()) {
      this.deviceType = 'mobile';
    } else {
      this.deviceType = 'desktop';
    }

    var _this = this;
    this.githubClient = new GitHubClient();
    this.githubClient.on('login', function() {
      _this.displayUserDetails();
    });


    this.githubClient.on('logout', function() {
      _this.confirmLogout();
      _this.displayUserDetails();
    });
    this.github = new GitHubUI();
    this.github.init(this.githubClient);

    this.gist = new GistUI();
    this.gist.init(this.githubClient);

    this.gdrive = new GDrive();
    this.gdrive.init();
    this.gdrive.handleClientLoad();

    this.initFirebase();

    this.loadGlobalPrefs();

    this.buildInterface();

    this.fileManager = new FileManager();
    this.fileManager.init(this);

    this.textDialog = new TextDialog();

    this.startPage.processURL();
    
  },


  getNewProjectDialog: function() {
    if(this.newProjectDialog == null) {
      this.newProjectDialog = new NewProjectDialog();
      this.newProjectDialog.init();
    }

    return this.newProjectDialog;
  },

  getGuid: function() {
//    var settings = this.doc.getDocRecord("/settings");

    guid = generateUUID();
    return guid;
    
  },

  isOnline: function() {
    return typeof firebase !== 'undefined';

  },


  setPref: function(key, value) {
    
    if (typeof(Storage) !== "undefined") {    
      localStorage.setItem(key, value);
    }
  },

  getPref: function(key) {
    if (typeof(Storage) !== "undefined") {
      return localStorage.getItem(key);
    }
  },

  loadGlobalPrefs: function() {

    // font size
    this.fontSize = parseInt(g_app.getPref('codeeditor.fontsize'), 10);
    if(this.fontSize == null || isNaN(this.fontSize) || this.fontSize <= 0) {
      this.fontSize = 14;
    } else {
      this.fontSize = parseInt(this.fontSize)
    }

    this.setFontSize(this.fontSize);

  },

  setUser: function(user) {
    var state = this.state;
    

    if(user == null) {
      state.isLoggedIn = false;
      this.displayUserDetails();
    } else {

      state.isLoggedIn = true;
      state.user.id = user.uid;
      state.user.name = user.displayName;


      firestoreDb.collection('users').doc(state.user.id).set(state.user, { merge: true });
    }
  },


  openProject: function(args) {
    var projectId = args.projectId;
    var projectName = args.projectName;
    var path = args.currentPath;
    var projectNavVisible = args.projectNavVisible;
    var githubOwner = args.githubOwner;
    var githubRepository = args.githubRepository;

    // whether to check github for updates.
//    var githubCheck = args.githubCheck;
    this.openingProject = true;

    this.doc = new Document();
    this.doc.init(this);
    this.createDocumentStructure(this.doc);

    var _this = this;
    this.doc.openBrowserStorageProject(args, function() {

      _this.fileManager.filename = projectName;
      var settings = g_app.doc.getDocRecord('/settings');      
      settings.data.filename = projectName;

      _this.projectNavigator.refreshTree();

      // if path has been passed in args, check it's valid
      // if valid, then show it
      var pathSet = false;
      if(typeof path != 'undefined' && path !== false) {        
        // does the path exist?
        var record = _this.doc.getDocRecord(path);
        if(record) {
          if(_this.projectNavigator.showDocRecord(path) !== false) {
            pathSet = true;
          }
        }
      }

      // path hasn't been specified, so find a default path
      if(!pathSet) {
        // need a default document..
        // get the first screen
        var dir = _this.doc.dir('/screens');
        if(dir && dir.length > 0) {
          var firstScreen = dir[0].name;
          _this.setMode('2d');          
          _this.textModeEditor.loadScreen('/screens/' + firstScreen);
          pathSet = true;
        }
      }

      if(!pathSet) {
        // uh oh
        g_app.setMode('none');
      }


      if(typeof projectNavVisible != 'undefined' && projectNavVisible) {
        _this.projectNavigator.setVisible(projectNavVisible);
      }

      // set the repository details..
      _this.github.setRepositoryDetails(githubOwner, githubRepository);
      _this.openingProject = false;

    });
  },

  confirmLogout: function() {
    var dialogCreated = false;
    if(this.githubLogoutDialog == null) {
      var width = 300;
      height = 190;
      if(UI.isMobile.any()) {
        height = 240;
      }

      this.githubLogoutDialog = UI.create("UI.Dialog", { "id": "githubLogutDialog", "title": "Logged Out", "width": width, "height": height });

      var html = '';
      html = '<div>';
      html += '<p>You have signed out of lvllvl</p>';
      html += '<p>You may still be signed into GitHub</p>';
      html += '<p>Click the button below if you would also like to sign out of GitHub</p>';
      html += '</div>';

      html += '<div>';
      html += '<div class="ui-button ui-button-nextaction" id="signOutOfGitHub">Sign out of GitHub</div>';
      html += '</div>';

      var htmlComponent = UI.create("UI.HTMLPanel", { "html": html });
      this.githubLogoutDialog.add(htmlComponent);

      var closeButton = UI.create('UI.Button', { "text": "Close", color: "secondary" });
      this.githubLogoutDialog.addButton(closeButton);
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });
      dialogCreated = true;
    }

    
    UI.showDialog("githubLogutDialog");
    if(dialogCreated) {
      $('#signOutOfGitHub').on('click', function(event) {
        window.open('https://github.com/logout');
        UI.closeDialog();
      });
    }
  },

  displayUserDetails: function() {
    var userIcon = '<img src="icons/svg/glyphicons-halflings-1-user.svg" height="16" style="filter: invert(65%)">';
    if(this.githubClient.isLoggedIn()) {
      var username = this.githubClient.getLoginName();
      $('#start-username').html(userIcon + '&nbsp;' + username);
      $('#start-user-info').html(userIcon + ' Signed in as ' + username);

      var userHTML = '<div style="text-align: right; margin-right: 10px">';
      userHTML += userIcon + '&nbsp;' + username;
      userHTML += ' (<a href="#" style="color: white; cursor: pointer" id="menuSignOut">Sign Out</a>)';
      userHTML += '</div>';
      $('#menuUserInfo').html(userHTML);

      var _this = this;
      $('#menuSignOut').on('click', function(e) {
        e.preventDefault();
        g_app.githubClient.logout();
      });


      var userHTML = '';
      
      //userHTML += '<div style="line-height: 20px">lvllvl</div>';
      userHTML += '<div style="padding: 10px; margin-bottom: 20px; background-color: #222222; position: relative">';
      userHTML += '<div style="font-size: 20px; display: inline-block; width: 200px; line-height: 36px; overflow: hidden">' + userIcon + '&nbsp;' + username + '</div>';
      //userHTML += '<div>';
      userHTML += '<div class="ui-button" id="mobileMenuSignOut" style="position: absolute; right: 10px; top: 10px">Sign Out</div>';
      //userHTML += '</div>';
      userHTML += '</div>';
      $('#mobileMenuUserInfo').html(userHTML);

      $('#mobileMenuSignOut').on('click', function(e) {
        e.preventDefault();
        g_app.githubClient.logout();
      });
    } else {

      $('#start-username').html('');
      $('#start-user-info').html(userIcon + ' You are not signed in');

      var userHTML = '<div style="text-align: right; margin-right: 10px; margin-top: 4px">';
      //userHTML += 'You are not signed in.<br/>';
      userHTML += '<div class="ui-button ui-button-info" id="menuSignIn">';
//      userHTML += '<img src="icons/svg/glyphicons-halflings-185-log-in.svg">';
      userHTML += '<img src="icons/GitHub-Mark-32px.png"/>';
      userHTML += '&nbsp;&nbsp;Sign In With GitHub...</div>';
//<img src="icons/svg/glyphicons-halflings-185-log-in.svg">
//      userHTML += '(<a href="#"  style="color: white; cursor: pointer" id="menuSignIn">';
//      userHTML += 'Sign In With GitHub';  
//      userHTML += '</a>)';
      userHTML += '</div>';
      $('#menuUserInfo').html(userHTML);

      $('#menuSignIn').on('click', function(e) {
        e.preventDefault();
        g_app.githubClient.login();
      });

      var userHTML = '<div style="padding: 10px">';

//      userHTML += '<div style="font-size: 20px; margin-bottom: 10px">You are not signed in. Sign in to save projects online</div>';
      userHTML += '<div style="font-size: 20px; margin-bottom: 10px">You are not signed in.</div>';
      userHTML += '<div>';

      //userHTML += '<div class="ui-button ui-button-info" id="mobileMenuSignIn"> <img src="icons/svg/glyphicons-halflings-185-log-in.svg">&nbsp;Sign In With GitHub...</div>';

//      userHTML += '<div class="ui-button" id="mobileMenuSignIn">';
//      userHTML += 'Sign In With GitHub';  
//      userHTML += '</div>';
      userHTML += '</div>';
      userHTML += '</div>';
      $('#mobileMenuUserInfo').html(userHTML);

      $('#mobileMenuSignIn').on('click', function(e) {
        e.preventDefault();
        g_app.githubClient.login();
      });

    }
  },




  initFirebase: function() {

    var _this = this;

    if(typeof firebase != 'undefined') {
    /*
      // Initialize Firebase
      var config = {
        apiKey: "AIzaSyCn0uJ7rBn1a5pU7Y-1Wzpo688s6JJRqA4",
        authDomain: "level-3-editor.firebaseapp.com",
        databaseURL: "https://level-3-editor.firebaseio.com",
        projectId: "level-3-editor",
        storageBucket: "level-3-editor.appspot.com",
        messagingSenderId: "552000131546"
      };

      firebase.initializeApp(config);
*/
//google-site-verification=DJ7-lh_nFpBn1_42gPYwbkYQzUaGCqWEdUhLWNW85Q4
/*
      var firebaseConfig = {
        apiKey: "AIzaSyAuSjHOq2_3RYn4fwBRRMqXSOON2SxjxCY",
        authDomain: "lvllvl.firebaseapp.com",
        databaseURL: "https://lvllvl.firebaseio.com",
        projectId: "lvllvl",
        storageBucket: "",
        messagingSenderId: "673634360731",
        appId: "1:673634360731:web:3cfe4f051e2e98ed"
      };
*/      

var firebaseConfig = {
  apiKey: "AIzaSyAuSjHOq2_3RYn4fwBRRMqXSOON2SxjxCY",
  authDomain: "lvllvl.firebaseapp.com",
  databaseURL: "https://lvllvl.firebaseio.com",
  projectId: "lvllvl",
  storageBucket: "lvllvl.appspot.com",
  messagingSenderId: "673634360731",
  appId: "1:673634360731:web:3cfe4f051e2e98ed",
  measurementId: "G-0ENX7VSE20"
};

      // Initialize Firebase
      var app = firebase.initializeApp(firebaseConfig);
      //firebase.getAnalytics(app);
      
      
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
          _this.setUser(user);
          _this.getRepositoryList();

          $('#login').hide();
          $('#start-login-mobile').hide();

          $('#logout').show();
          $('#start-logout-mobile').show();

          try {
            _this.githubClient.setUser(user, function() {
              _this.startPage.userLoginStatusUpdated();
            });
            
          } catch (e) {
            console.log('login exception');
            console.log(e);
            // something went wrong, try to login again..
            // maybe token expired?
            _this.githubClient.login();

          }
        } else {
//          g_app.fileManager.clearRepositoriesCache(function() {

            _this.setUser(null);
            _this.githubClient.setUser(null);
            _this.getRepositoryList();

            _this.startPage.userLoginStatusUpdated();
//          });

          $('#login').show();
          $('#start-login-mobile').show();
          $('#logout').hide();
          $('#start-logout-mobile').hide();
        }
      });

      firestoreDb = firebase.firestore();
      // Disable deprecated features
      /*
      firestoreDb.settings({
        timestampsInSnapshots: true
      });    
*/
    }

  },

  removeRepository: function(owner, repository, callback) {
    var user = firebase.auth().currentUser;
    if(user == null) {
      return;
    }

    var repositoryId = owner + '-' + repository;

    firestoreDb.collection('users/' + user.uid + '/repositories').doc(repositoryId).delete().then(function() {
      callback();
    }).catch(function(error) {
      console.log(error);

    })

  },

  getRepositoryList: function() {
    
    var user = firebase.auth().currentUser;
    if(user == null) {
      this.repositories = [];
      this.startPage.updateRepositories();
      return;
    }

    var _this = this;
    
    firestoreDb.collection('users/' + user.uid + '/repositories').get().then(function(querySnapshot) {
      _this.repositories = [];
      querySnapshot.forEach(function(doc) {
        var data = doc.data();
        _this.repositories.push(data);          
        _this.startPage.updateRepositories();
        
      });
    });
  },

  setEnabled: function(feature, enabled) {
    this.features[feature] = enabled;
  },

  getEnabled: function(feature) {
    if(typeof this.features[feature] == 'undefined') {
      return true;
    }

    return this.features[feature];

  },

  initModeEvents: function() {
    var _this = this;

    $(window).on('beforeunload', function(event){
      
      if(g_app.confirmLeave) {
        event.preventDefault();
        return "Are you sure you want to leave this page?"
      }
    });


    UI.on('update', function() {
      _this.update();
    });

    UI.on('keydown', function(event) {
      
      _this.keyDown(event);
    });

    UI.on('keyup', function(event) {
      _this.keyUp(event);
    });

    UI.on('keypress', function(event) {

      
      _this.keyPress(event);
    });

    $('#shareButton').on('click', function() {
      _this.share();
    });


  },

  // really setting whether the editors get keyboard events..
  setAllowKeyShortcuts: function(allow) {
    this.allowKeyShortcuts = allow;

    switch(this.mode) { 
      case 'assembler':
        this.assemblerEditor.willReceiveKeyboardEvents(allow);
        break;
      case 'c64':
        this.c64Debugger.blurMachine();
        break;
    }
  },

  keyDown: function(event) {


    if(event.keyCode == 89 && (event.metaKey || event.ctrlKey))  {
      // ctrl-y
      this.redo();
    }

    if(!this.allowKeyShortcuts) {
      return;
    }

    switch(this.mode) {
      case '3d':
      case '2d':
        this.textModeEditor.keyDown(event);
      break;
      case 'sprite':
        this.spriteEditor.keyDown(event);
      break;
      case 'music':
        this.music.keyDown(event);
      break;
      case 'c64':
        this.c64Debugger.keyDown(event);
      break;
      /*
      case 'nes':
        this.nesDebugger.keyDown(event);
      break;
      */
      case 'color palette':
        this.colorPaletteEditor.colorPaletteEdit.keyDown(event);
      break;
      case 'assembler':
        this.assemblerEditor.keyDown(event);
      break;      
    }
  },

  keyUp: function(event) {


    if(!this.allowKeyShortcuts) {
      return;
    }

    switch(this.mode) {
      case '3d':
      case '2d':
        this.textModeEditor.keyUp(event);
      break;
      case 'sprite':
        this.spriteEditor.keyUp(event);
      break;
      case 'music':
        this.music.keyUp(event);
      break;
      case 'c64':
        this.c64Debugger.keyUp(event);
      break;
      /*
      case 'nes':
        this.nesDebugger.keyUp(event);
      break;
      */
      case 'color palette':
        this.colorPaletteEditor.colorPaletteEdit.keyUp(event);
      break;
      case 'assembler':
        this.assemblerEditor.keyUp(event);
      break;

    }
  },

  keyPress: function(event) {

    
    if(!this.allowKeyShortcuts) {
      return;
    }


    switch(this.mode) {
      case '3d':
      case '2d':
        this.textModeEditor.keyPress(event);
      break;
      case 'sprite':
        this.spriteEditor.keyPress(event);
      break;
      case 'music':
        this.music.keyPress(event);
      break;
      case 'color palette':
        this.colorPaletteEditor.colorPaletteEdit.keyPress(event);
      break;      
    }
  },

  setDeviceType: function(deviceType) {

    if(deviceType == 'desktop') {
      this.deviceType = 'desktop';


      UI('menubar').setVisible(true);
      UI('mobileMenuBar').setVisible(false);
      UI('projectSplitPanel').resizeThePanel({panel: 'north', size: 30});
      UI('tabSplitPanel').setPanelVisible('north', true);
    }

    if(deviceType == 'mobile') {

      this.deviceType = 'mobile';

      UI('menubar').setVisible(false);
      UI('mobileMenuBar').setVisible(true);

      UI('projectSplitPanel').resizeThePanel({panel: 'north', size: 70});

      UI('tabSplitPanel').setPanelVisible('north', false);

    }


    if(this.textModeEditor) {
      this.textModeEditor.setDeviceType(deviceType);
    }
  },

  isDesktopApp: function() {
    
    return this.isElectron;
  },

  isMobile: function() {
    return this.deviceType == 'mobile';
  },

  getMode: function() {
    return this.mode;    
  },


  setMode: function(mode) {
    this.mode = mode;

    if(g_app.isMobile()) {
      $('#mobileMenuUndoRedo').show();
    }

//    console.error("SET MODE!!!!: " + mode);

    switch(mode) {
      
      case 'start':
        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', false);
        }
        this.startPage.show();
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('startPage');

        break;


      case '3d':
        this.projectPanel.setPanelVisible('north', true);
        UI.setWebGLEnabled(true);
        this.contentPanel.showOnly('textModeEditor');
        this.textModeEditor.setType('3d');
        this.mainPanel.showOnly('projectSplitPanel');

        this.menuBar.showOnly('ui-menu-tilemode');

        $('.ui-menu-screen').show();
        $('.ui-menu-sprite').hide();          
        this.textModeEditor.currentTile.setSouthPanelSize();

        this.menuBar.showOnly('ui-menu-3d');


        UI('gridPanel').showOnly('grid3d');
        this.textModeEditor.gridView3d.uiComponent.resize();
        this.textModeEditor.setEditorMode('tile');        


        if(g_app.isMobile()) {
          $('.drawToolMobileSide2d').hide();
          $('.drawToolMobileSide3d').show();

          $('#toolIconHolderMobile').css('bottom', '94px');
          $('#toolIconsScrollBottom').css('bottom', '94px');
          $('#drawToolMobileColors').css('height', '80px');
        }
        break;
      case '2d':
        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', true);
        }

        if(g_app.isMobile()) {
          $('#mobileMenuCurrentTools').show();
        }
        
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('textModeEditor');
        this.textModeEditor.setType('2d');
        UI('gridPanel').showOnly('grid2d');
        UI('gridView2d').resize(); 

        this.menuBar.showOnly('ui-menu-tilemode');

        if(this.textModeEditor.graphic && this.textModeEditor.graphic.getType() == 'sprite') {
          $('.ui-menu-screen').hide();
          $('.ui-menu-sprite').show();
        } else {
          $('.ui-menu-screen').show();
          $('.ui-menu-sprite').hide();          
        }
        this.textModeEditor.tools.drawTools.tilePalette.drawTilePalette();
        this.textModeEditor.frames.updateFrameInfo();

        if(g_app.isMobile()) {
          this.textModeEditor.tools.drawTools.checkMobileToolScroll();
        }

        if(g_app.isMobile()) {
          $('.drawToolMobileSide2d').show();
          $('.drawToolMobileSide3d').hide();
          $('#toolIconHolderMobile').css('bottom', '194px');
          $('#toolIconsScrollBottom').css('bottom', '194px');
          $('#drawToolMobileColors').css('height', '180px');

        } else {
          this.textModeEditor.updateEastInfoPanel();          
        }


        break;
      case 'color palette':
        if(this.projectPanel) {
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('colorPaletteEditor');
        this.menuBar.showOnly('ui-menu-colorpalette');

//        UI('gridView2d').resize(); 
      break;

      case 'tile set':
        if(this.projectPanel) {
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('tileSetEditor');
        this.menuBar.showOnly('ui-menu-tileset');

      break;
    
      case 'script':
        if(this.projectPanel) {
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.scriptEditor.show();
        this.contentPanel.showOnly('scriptEditor');
        this.menuBar.showOnly('ui-menu-script');
      break;

      case 'json':
          if(this.projectPanel) {
            this.projectPanel.setPanelVisible('north', true);
          }
          UI.setWebGLEnabled(false);
          
          this.jsonEditor.show();
          this.mainPanel.showOnly('projectSplitPanel');
          this.contentPanel.showOnly('jsonEditor');
          this.menuBar.showOnly('ui-menu-script');
          break;
      case 'text':
        if(this.projectPanel) {
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
        this.textEditor.show();
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('textEditor');
        this.menuBar.showOnly('ui-menu-script');
        break;
      case 'hex':
        if(this.projectPanel) {
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('hexEditor');
        this.menuBar.showOnly('ui-menu-script');
      break;

      /*
      case 'sprite':
        if(this.mainSplitPanel) { 
          this.mainSplitPanel.setPanelVisible('north', true);
        }

        UI.setWebGLEnabled(false);
        this.contentPanel.showOnly('spriteEditor');
        break;
        */
      case 'music':

        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);
//        this.music.show('/music/Untitled Music');


        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('musicEditor');
        this.menuBar.showOnly('ui-menu-music');

        UI('musicEditor').resize();

        break;
      case 'assembler':

        if(g_app.isMobile()) {
          $('#mobileMenuCurrentTools').hide();
        }
//        this.mainPanel.showOnly('mainSplitPanel');
        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', true);
        }
        UI.setWebGLEnabled(false);

        this.mainPanel.showOnly('projectSplitPanel');
        this.mainSplitPanel.setPanelVisible('north', true);

        this.menuBar.showOnly('ui-menu-c64-assembler');

        this.showAssembler();
        break;
      case 'c64':
        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', true);
        }

        if(g_app.isMobile()) {
          $('#mobileMenuUndoRedo').hide();
        }
  
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('c64debuggerPanel');
        this.menuBar.showOnly('ui-menu-c64');

        this.c64Debugger.show();
        break;

        /*
      case 'nes':

        if(this.projectPanel) { 
          this.projectPanel.setPanelVisible('north', true);
        }
        if(g_app.isMobile()) {
          $('#mobileMenuUndoRedo').hide();
        }
  
        UI.setWebGLEnabled(false);
        this.mainPanel.showOnly('projectSplitPanel');
        this.contentPanel.showOnly('nesdebuggerPanel');
        this.menuBar.showOnly('ui-menu-nes');

        this.nesDebugger.show();
        break;
      case 'x16':
          if(this.projectPanel) { 
            this.projectPanel.setPanelVisible('north', true);
          }
          if(g_app.isMobile()) {
            $('#mobileMenuUndoRedo').hide();
          }
    
          UI.setWebGLEnabled(false);
          this.mainPanel.showOnly('projectSplitPanel');
          this.contentPanel.showOnly('x16DebuggerPanel');
          this.x16Debugger.show();
          break;

          */
      default:
          if(this.projectPanel) { 
            this.projectPanel.setPanelVisible('north', true);
          }
          if(g_app.isMobile()) {
            $('#mobileMenuUndoRedo').hide();
          }
    
          UI.setWebGLEnabled(false);
          this.mainPanel.showOnly('projectSplitPanel');
          this.contentPanel.showOnly('noEditorPanel');
          break;

    }

    if(this.menuBar) {
      if(mode == 'assembler') {
          // TODO: prob should be in on focus of text editor
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "Z" } , false);
          this.menuBar.setShortcutEnabled({ "cmd": true, "shift": true,  "key": "Z" } , false);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "X" } , false);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "C" } , false);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "V" } , false);      
      } else {
          // TODO: prob should be in on focus of text editor
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "Z" } , true);
          this.menuBar.setShortcutEnabled({ "cmd": true, "shift": true,  "key": "Z" } , true);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "X" } , true);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "C" } , true);
          this.menuBar.setShortcutEnabled({ "cmd": true, "key": "V" } , true);

      }
    }
  },

  debugMessage: function(message) {

  },

/*

main panel contains split panel
main split panel north is menu
*/

  mobileMenuBarLoaded: function() {

    var _this = this;
    $('#mobileMenuBarHamburger').on('click', function(event) {
      _this.textModeEditor.showMobileMenu();
    });

    $('#mobileMenuBarUndo').on('click', function(event) {
      _this.undo();
    });

    $('#mobileMenuBarRedo').on('click', function(event) {
      _this.redo();
    });

  },


  getMobileInterfaceType: function() {
    return this.mobileInterfaceType;
  },

  mobileReduceInterface: function() {
    // hamburger and undo/redo
//    this.projectPanel.setPanelVisible('north', false);

    this.mobileInterfaceType = 'reduced';

    this.textModeEditor.mobileReduceInterface();


    /*
    var restoreElement = document.getElementById('mobileRestoreButton');
    if(!restoreElement) {
      var restoreElement = document.createElement('div');
      restoreElement.setAttribute('id', 'mobileRestoreButton');
      restoreElement.setAttribute('style', 'position: absolute; top: 8px; left: 8px; width: 20px; height: 20px; z-index: 1000');
      document.body.appendChild(restoreElement);
      restoreElement.innerHTML = '<i class="halflings halflings-chevron-left"></i>';
      restoreElement.addEventListener('click', function() {
        g_app.mobileRestoreInterface();
      }); 
    } else {
      restoreElement.setAttribute('style', 'display: block');
    }
    */

  },

  mobileRestoreInterface: function() {
    // hamburger and undo/redo
//    this.projectPanel.setPanelVisible('north', true);
    
    this.mobileInterfaceType = 'full';

    /*
    var restoreElement = document.getElementById('mobileRestoreButton');
    if(restoreElement) {
      restoreElement.setAttribute('style', 'display: none');
    }
    */

    this.textModeEditor.mobileRestoreInterface();

  },

  buildInterface: function() {
    var isMobile = this.isMobile();
    this.mainPanel = UI.create("UI.Panel", { "id": "mainPanel" });
    UI.add(this.mainPanel);

    this.projectPanel = UI.create("UI.SplitPanel", { "id": "projectSplitPanel" });
    this.mainPanel.add(this.projectPanel);

    this.mainSplitPanel = UI.create("UI.SplitPanel", { "id": "mainSplitPanel" });
    this.projectPanel.add(this.mainSplitPanel);

    var _this = this;
    UI.on('ready', function() {


      var menuBarHidden = false;
      var menuBarHeight = 30;
      if(isMobile) {
        menuBarHidden = true;
        menuBarHeight = 46;
      }


      _this.menuBar = UI.create("UI.MenuBar", { "id": "menubar", "visible": !menuBarHidden });

      _this.menuBarHolder = UI.create("UI.Panel", { "id": "menuBarHolder" });

      _this.menuSplit = UI.create("UI.SplitPanel", { "id": "menuSplit", "visible": !menuBarHidden })

      var html = '<div style="text-align: right">';
      html += '<div id="menuUserInfo" style="display: inline-block"></div>';
      html += '<div class="ui-button" id="shareButton" style="margin-left: 4px"><img src="icons/material/share-24px.svg">&nbsp;Share</div>';
      html += '</div>';
      _this.userInfoPanel = UI.create("UI.HTMLPanel", { "html": html});
      _this.menuSplit.addEast(_this.userInfoPanel, 280, false);


      
      _this.menuSplit.add(_this.menuBar);


      //_this.menuBarHolder.add(_this.menuBar);
      _this.projectPanel.addNorth(_this.menuBarHolder, menuBarHeight, false);

//      _this.menuBarHolder.add(_this.menuBar);
      _this.menuBarHolder.add(_this.menuSplit);

      _this.mobileMenuBar = UI.create("UI.HTMLPanel", { "id": "mobileMenuBar", "visible": menuBarHidden});
      _this.menuBarHolder.add(_this.mobileMenuBar);

      _this.mobileMenuBar.load('html/textMode/mobileMenuBar.html', function() {
        _this.mobileMenuBarLoaded();
      });

      
      _this.initModeEvents();

      var menu = null;
      menu = _this.menuBar.addMenu({"label": "Project", "className": 'ui-menu-music ui-menu-tilemode ui-menu-3d ui-menu-colorpalette ui-menu-tileset ui-menu-script ui-menu-c64-assembler' });
      menu.addItem({ "label": "New Project...", "id": "file-new" });//, "shortcut": { "key": 'N', "cmd": true } });
//      menu.addItem({ "label": "Open Project...", "id": "file-open" });
//      menu.addItem({ "label": "Home", "id": "home-page" });
//      menu.addSeparator({  });

      if(SHOWUNFINISHED && g_paramEditor != 'assembler') {
        menu.addItem({ "label": "Project Explorer" + "...", "id": "show-project-explorer", "shortcut": { "cmd": true, "key": "P" } });
        menu.addSeparator({  });
      }

      menu.addItem({ "label": "Save", "id": "file-save", "shortcut": { "key": 'S', "cmd": true } });
      menu.addItem({ "label": "Save As...", "id": "file-saveas", "shortcut": { "key": 'S',  "cmd": true, "shift": true } });

      menu.addItem({ "label": "Commit Project To GitHub...", "id": "file-commit", "shortcut": { "key": 'C',  "cmd": true, "shift": true } });
      menu.addItem({ "label": "Commit Changes To GitHub...", "id": "project-commitchanges", "shortcut": { "key": 'C',  "cmd": true, "shift": true } });
      menu.addItem({ "label": "Share Project...", "id": "project-share" }); //, "shortcut": { "key": 'C',  "cmd": true, "shift": true }

      menu.addItem({ "label": "Download Project...", "id": "file-download", "shortcut": { "key": 'D',  "shift": true, "cmd": true, "shift": true } });
      //menu.addItem({ "label": "NES", "id": "file-nes" });
      //menu.addItem({ "label": "X16", "id": "file-x16" });
      //menu.addItem({ "label": "C64", "id": "edit-c64", "shortcut": { "cmd": true, "key": "L"} });

      menu.addSeparator({  });
      menu.addItem({ "label": "Create A Template Link...", "id": "file-templateLink" });

//      menu.addSeparator({  });
//      menu.addItem({ "label": "Go To Home Screen", "id": "project-home" });

  //    menu.addItem({ "label": "Save As Template...", "id": "file-saveastemplate" });

      UI('project-commitchanges').setVisible(false);

      menu = _this.menuBar.addMenu({"label": "Edit", "className": 'ui-menu-tilemode ui-menu-3d' });
 
      menu.addItem({ "label": "Undo", "id": "edit-undo", "shortcut": { "cmd": true, "key": "Z" } });
      menu.addItem({ "label": "Redo", "id": "edit-redo", "shortcut": { "cmd": true, "shift": true, "key": "Z" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Cut", "id": "edit-cut", "shortcut": { "cmd": true, "key": "X" } });
      menu.addItem({ "label": "Copy", "id": "edit-copy", "shortcut": { "cmd": true, "key": "C" } });
      menu.addItem({ "label": "Copy as Image To Clipboard", "id": "edit-copyimage", "shortcut": { "cmd": true, "key": "I" } });
      menu.addItem({ "label": "Paste", "id": "edit-paste", "shortcut": { "cmd": true, "key": "V" } });
      menu.addItem({ "label": "Clear All", "id": "edit-clearall", "shortcut": { "key": "Del" } });
      menu.addItem({ "label": "Clear...", "id": "edit-clear" });
      menu.addItem({ "label": "Select All", "id": "edit-selectall", "shortcut": { "cmd": true, "key": "A" } });
      menu.addItem({ "label": "Deselect", "id": "edit-deselect", "shortcut": { "cmd": true, "key": "D" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Flip H", "id": "edit-fliph" });//, "shortcut": { "key": "F" } });
      menu.addItem({ "label": "Flip V", "id": "edit-flipv" });//, "shortcut": { "key": "G" } });

      menu.addItem({ "label": "Replace Colour" + "...", "id": "edit-replaceColor"});
      menu.addItem({ "label": "Replace Tile" + "...", "id": "edit-replaceCharacter"});
      menu.addItem({ "label": "Clear Hidden Tiles" + "...", "id": "edit-clearHiddenTiles"});


      menu = _this.menuBar.addMenu({"label": "Edit", "className": 'ui-menu-colorpalette' });
      menu.addItem({ "label": "Undo", "id": "colorpaletteedit-undo", "shortcut": { "cmd": true, "key": "Z" } });
      menu.addItem({ "label": "Redo", "id": "colorpaletteedit-redo", "shortcut": { "cmd": true, "shift": true, "key": "Z" } });

      /*
      menu.addSeparator({  });
      menu.addItem({ "label": "Toggle Editor Mode", "id": "edit-toggleMode"});
      */

      menu = _this.menuBar.addMenu({"label": "Export", "className": 'ui-menu-tilemode' });
      menu.addSeparator({ "label": "Visual Formats" });
      menu.addItem({ "label": "GIF / PNG...", "id": "export-image" });

      menu.addItem({ "label": "Sprite Sheet (PNG)...", "id": "export-png" });



      menu.addItem({ "label": "SVG...", "id": "export-svg" });

      menu.addSeparator({ "label": "C64 Formats" });
      menu.addItem({ "label": "C64 PRG / D64...", "id": "export-prg" });
      
      menu.addItem({ "label": "C64 Assembly Source" + "...", "id": "export-c64assembly" });
      menu.addItem({ "label": "Mega65 Assembly Source" + "...", "id": "export-mega65assembly" });
      menu.addItem({ "label": "X16 Assembly Source" + "...", "id": "export-x16assembly" });
      //menu.addItem({ "label": "C64 PRG Advanced...", "id": "export-prgadvanced" });
      menu.addItem({ "label": "SEQ...", "id": "export-seq" });
      menu.addItem({ "label": "PETSCII C...", "id": "export-petsciic" });
      menu.addItem({ "label": ".PET...", "id": "export-pet" });
      menu.addItem({ "label": "CharPad V5...", "id": "export-charpad" });

      menu.addItem({ "label": "SpritePad...", "id": "export-spritepad" });

      if(SHOWUNFINISHED) {
        menu.addSeparator({ "label": "X16 Formats" });
        menu.addItem({ "label": "X16 Basic" + "...", "id": "export-x16basic" });
      }

      menu.addSeparator({ "label": "Dev Formats" });
      menu.addItem({ "label": "JSON...", "id": "export-json" });
      menu.addItem({ "label": "Binary Data" + "...", "id": "export-binary" });
      menu.addItem({ "label": "TXT...", "id": "export-txt" });

      menu.addSeparator({ "label": "Share" });
      menu.addItem({ "label": "Share...", "id": "export-share", "shortcut": { "cmd": true, "key": "H" } });


      menu = _this.menuBar.addMenu({"label": "Export", "className": 'ui-menu-3d' });
      menu.addSeparator({ "label": "Visual Formats" });
      menu.addItem({ "label": "PNG...", "id": "export-3d-png" });
      menu.addItem({ "label": "GIF" + "...", "id": "export-3d-gif" });
      menu.addItem({ "label": "OBJ" + "...", "id": "export-obj" });
      menu.addItem({ "label": "MagicaVoxel" + "...", "id": "export-magicavoxel" });


      menu = _this.menuBar.addMenu({"label": "Edit", "className": 'ui-menu-music' });
      menu.addItem({ "label": "Undo", "id": "edit-musicundo", "shortcut": { "cmd": true, "key": "Z" } });
      menu.addItem({ "label": "Redo", "id": "edit-musicredo", "shortcut": { "cmd": true, "shift": true, "key": "Z" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Cut", "id": "edit-musiccut", "shortcut": { "cmd": true, "key": "X" } });
      menu.addItem({ "label": "Copy", "id": "edit-musiccopy", "shortcut": { "cmd": true, "key": "C" } });
      menu.addItem({ "label": "Paste", "id": "edit-musicpaste", "shortcut": { "cmd": true, "key": "V" } });
//      menu.addItem({ "label": "Clear All", "id": "edit-clearall", "shortcut": { "key": "Del" } });
//      menu.addItem({ "label": "Clear...", "id": "edit-clear" });
      menu.addItem({ "label": "Select All", "id": "edit-musicselectall", "shortcut": { "cmd": true, "key": "A" } });
      menu.addItem({ "label": "Deselect", "id": "edit-musicdeselect", "shortcut": { "cmd": true, "key": "D" } });



      menu = _this.menuBar.addMenu({"label": "Export", "className": 'ui-menu-music' });
      menu.addItem({ "label": "SID...", "id": "export-sid" });
      //menu.addItem({ "label": "SID...", "id": "export-sid" });
      menu.addItem({ "label": "PRG / BIN...", "id": "export-sidprg" });
      menu.addItem({ "label": "GoatTracker 2...", "id": "export-goattracker" });

//      menu.addItem({ "label": "WAV...", "id": "export-wav" });



/*
      menu.addSeparator({ "label": "3d Formats" });
      menu.addItem({ "label": "Export .obj...", "id": "export-obj" });
      menu.addItem({ "label": "Export MagicaVoxel (.vox)...", "id": "export-vox" });
      menu.addItem({ "label": "Export Qubicle Binary (.qb)...", "id": "export-qb" });

      menu.addSeparator({ "label": "Music Formats" });
      menu.addItem({ "label": "SID...", "id": "export-sid" });
      menu.addItem({ "label": "GoatTracker 2...", "id": "export-gt" });
      menu.addItem({ "label": "WAV...", "id": "export-wav" });
*/


      menu = _this.menuBar.addMenu({"label": "Import", "className": 'ui-menu-tilemode' });
      menu.addSeparator({ "label": "2d Formats" });
      menu.addItem({ "label": "Image / Video" + "...", "id": "import-image" });
//      menu.addItem({ "label": "Video...", "id": "import-video" });

//      menu.addItem({ "label": "ANSI File...", "id": "import-ansi" });

//      menu.addItem({ "label": "Assembly...", "id": "import-assembly" });
//      menu.addItem({ "label": "PRG...", "id": "import-prg" });
//      menu.addItem({ "label": "VICE Snapshot...", "id": "import-vice" });
      menu.addItem({ "label": "C64 Formats" + "...", "id": "import-c64formats" });
      menu.addItem({ "label": "C64 Formats" + "...", "id": "import-c64spriteformats" });
      menu.addItem({ "label": "Image" + "...", "id": "import-spriteimage" });

/*
      menu.addSeparator({ "label": "3d Formats" });
      menu.addItem({ "label": "OBJ...", "id": "import-obj" });
      menu.addItem({ "label": "FBX...", "id": "import-fbx" });
*/

      menu = _this.menuBar.addMenu({"label": "Screen", "className": 'ui-menu-tilemode ui-menu-screen' });
      menu.addItem({ "label": "Dimensions" + "...", "id": "file-dimensions" });
      menu.addItem({ "label": "Crop To Selection", "id": "screen-crop"});
//      menu.addItem({ "label": "3D Mode", "id": "3d-mode" });


      menu.addSeparator({ "label": "Mode" });
      menu.addItem({"label": "Text Mode", "id": "mode-textmode", "checked": true });
      menu.addItem({"label": "C64 Standard Character Mode", "id": "mode-c64standard"});
      menu.addItem({"label": "C64 Multicolour Character Mode", "id": "mode-c64multicolor"});
      menu.addItem({"label": "C64 Extended BG Colour Mode", "id": "mode-c64ecm"});
      menu.addItem({"label": "Vector Mode", "id": "mode-vector"});
//      menu.addItem({"label": "NES", "id": "mode-nes"});
      menu.addItem({"label": "Indexed Colour", "id": "mode-indexed"});
      menu.addItem({"label": "RGB Colour", "id": "mode-rgb"});


      if(SHOWUNFINISHED) {
        menu.addItem({"label": "NES", "id": "mode-nes"});
      }

      /*
      menu.addItem({"label": "NES", "id": "mode-nes"});
      menu.addItem({"label": "Indexed Colour", "id": "mode-indexed"});
      menu.addItem({"label": "NES", "id": "mode-rgb"});
      */
      menu.addSeparator({ "label": "Tile Orientation" });
      menu.addItem({"label": "Allow Tile Flip", "id": "mode-tileflip"});
      menu.addItem({"label": "Allow Tile Rotate", "id": "mode-tilerotate"});
      menu.addItem({"label": "Has Tile Materials", "id": "mode-tilematerials"});


      menu.addSeparator({ "label": styles.text.blockName + " Mode" });
      menu.addItem({"label": styles.text.blockName + " Mode", "id": "mode-blockmode"});
      menu.addItem({"label": styles.text.blockName + " Size" + "...", "id": "mode-blocksize"});
      UI('mode-blocksize').setEnabled(false);


      menu.addSeparator({ "label": "Colour Mode" });
      menu.addItem({"label": "Colour Per Cell", "id": "colorpermode-cell", "checked": true });
      menu.addItem({"label": "Colour Per Tile", "id": "colorpermode-character"});
      menu.addItem({"label": "Colour Per " + styles.text.blockName, "id": "colorpermode-block"});
      UI('colorpermode-block').setEnabled(false);

      menu.addSeparator({ "label": "Reference Image" });
      menu.addItem({ "label": "Set Reference Image" + "...", "id": "screen-referenceimage", "shortcut": { "cmd": true, "key": "I"} });

      menu = _this.menuBar.addMenu({"label": "Sprite", "className": 'ui-menu-tilemode ui-menu-sprite' });
      menu.addItem({ "label": "Dimensions" + "...", "id": "file-spritedimensions" });
      
      
      menu.addSeparator({ "label": "Mode" });
      menu.addItem({"label": "Monochrome", "id": "mode-spritetextmode", "checked": true });
      menu.addItem({"label": "C64 Multicolour", "id": "mode-spritec64multicolor"});
      menu.addItem({"label": "NES", "id": "mode-spritenes"});
      menu.addItem({"label": "Indexed", "id": "mode-spriteindexed"});


      menu.addSeparator({ "label": "Help" });
      menu.addItem({"label": "Help" + "!", "id": "mode-help"});

      menu = _this.menuBar.addMenu({"label": "Scene", "className": 'ui-menu-3d' });
      menu.addItem({"label": "Dimensions...", "id": "dimensions3d", "checked": true });


      menu = _this.menuBar.addMenu({"label": "Layers", "className": 'ui-menu-tilemode' });
      menu.addItem({"label": "New Layer" + "...", "id": "layers-new", "shortcut": { "cmd": true, "key": "L"}  });   // { "cmd": true, "shift": true, "key": "N" }
      menu.addSeparator({ });
      menu.addItem({"label": "Layer Properties" + "...", "id": "layers-properties"});
      menu.addItem({"label": "Delete Layer", "id": "layers-delete"});
      menu.addItem({"label": "Bring Forward", "id": "layers-moveUp", "shortcut": {"cmd": true, "key": "]"} });
      menu.addItem({"label": "Send Backward", "id": "layers-moveDown", "shortcut": {"cmd": true, "key": "["} });
      menu.addItem({"label": "Toggle Layer Visibility", "id": "layers-toggle", "shortcut": { "cmd": true, "key": "\\" }});
      menu.addItem({"label": "Select Above", "id": "layers-selectAbove", "shortcut": {"alt": true, "key": "]"} });
      menu.addItem({"label": "Select Below", "id": "layers-selectBelow", "shortcut": {"alt": true, "key": "["} });
/*
      menu.addSeparator({ });
      menu.addItem({"label": "Merge...", "id": "layers-merge"});
      menu.addItem({"label": "To Frames...", "id": "layers-toframes"});
//      menu.addItem({"label": "From Frames...", "id": "layers-fromframes"});
*/

      _this.tileSetMenu = _this.menuBar.addMenu({"label": "Tiles", "className": 'ui-menu-tilemode ui-menu-screen ui-menu-3d' });
      _this.tileSetMenu.addItem({ "label": "Show Tile Editor", "id": "charactersets-edit", "shortcut": { "cmd": true, "key": "E" } });
      _this.tileSetMenu.addSeparator({ "label": "Current Tile Set" });
      _this.tileSetMenu.addItem({ "label": "Choose A Tile Set" + "...", "id": "charactersets-preset" });
      _this.tileSetMenu.addItem({ "label": "Load / Import Tile Set" + "...", "id": "charactersets-load" });
//      _this.tileSetMenu.addItem({ "label": "Load / Import Tile Set" + "...", "id": "charactersets-load" });
      _this.tileSetMenu.addItem({ "label": "Save Tile Set" + "...", "id": "charactersets-save" });
      _this.tileSetMenu.addSeparator({ "label": "Project Tile Sets" });
      _this.tileSetMenu.addItem({ "label": "Create a Tile Set...", "id": "tileset-new" });


      //tileset
      menu = _this.menuBar.addMenu({"label": "Tiles", "className": 'ui-menu-tileset' });
      menu.addItem({ "label": "Choose A Character Set" + "...", "id": "tileset-preset" });
      menu.addItem({ "label": "Load / Import Tile Set" + "...", "id": "tileset-load" });
      menu.addItem({ "label": "Save Tile Set" + "...", "id": "tileset-save" });


      _this.colorPaletteMenu = _this.menuBar.addMenu({"label": "Colours", "className": 'ui-menu-tilemode ui-menu-3d' });
      _this.colorPaletteMenu.addItem({ "label": "Show Colour Editor", "id": "color-edit", "shortcut": { "cmd": true, "shift": true, "key": "E" } });
      _this.colorPaletteMenu.addSeparator({ });      
      _this.colorPaletteMenu.addItem({ "label": "Choose A Colour Palette" + "...", "id": "colors-preset" });
      _this.colorPaletteMenu.addItem({ "label": "Edit Colour Palette" + "...", "id": "color-editcolorpalette" });
//      menu.addItem({ "label": "Edit/Create Palette...", "id": "colors-edit" });
      _this.colorPaletteMenu.addItem({ "label": "Load Colour Palette" + "...", "id": "colors-load" });
      _this.colorPaletteMenu.addItem({ "label": "Save Colour Palette" + "...", "id": "colors-save" });
      _this.colorPaletteMenu.addSeparator({ "label": "Project Tile Sets" });
      _this.colorPaletteMenu.addItem({ "label": "Create a Colour Palette...", "id": "colorpalette-new" });

      menu = _this.menuBar.addMenu({"label": "Import / Export", "className": 'ui-menu-colorpalette' });
      menu.addItem({ "label": "Choose A Colour Palette" + "...", "id": "colorpalette-preset" });
      menu.addItem({ "label": "Load Colour Palette" + "...", "id": "colorpalette-load" });
      menu.addItem({ "label": "Save Colour Palette" + "...", "id": "colorpalette-save" });


      menu = _this.menuBar.addMenu({"label": "View", "className": 'ui-menu-tilemode' });
      menu.addItem({ "label": "Zoom In", "id": "view-zoomin", "shortcut": { "cmd": true, "key": "=" } });
      menu.addItem({ "label": "Zoom Out", "id": "view-zoomout", "shortcut": { "cmd": true, "key": "-" } });
      menu.addItem({ "label": "Fit On Screen", "id": "view-fitonscreen", "shortcut": { "cmd": true, "key": "0" } });
      menu.addItem({ "label": "Actual Pixels", "id": "view-actualpixels", "shortcut": { "cmd": true, "key": "1" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Grid Lines", "id": "edit-showgrid", "checked": true, "shortcut": { "cmd": true, "key": "G" } });

      menu.addItem({ "label": "Border", "id": "edit-showborder", "checked": true, "shortcut": { "cmd": true, "key": "H" } });
      menu.addItem({ "label": "Background", "id": "edit-showbackground", "checked": true, "shortcut": { "cmd": true, "key": "B" } });
      /*
      menu.addItem({ "label": "Show/Hide Background Image", "id": "edit-showbackgroundimage", "shortcut": { "cmd": true, "key": "I" } });
      menu.addItem({ "label": "Set Background Image...", "id": "edit-setbackgroundimage" });
      */

      /*
     menu.addSeparator({ "label": "Layout" });
     menu.addItem({ "label": "Tile Palette Bottom", "id": "layout-palette-bottom" });
     menu.addItem({ "label": "Tile Palette Side", "id": "layout-palette-side" });
     menu.addItem({ "label": "Minimal", "id": "layout-minimal" });
      */

     menu.addSeparator({  });
     menu.addItem({ "label": "Cursor Tile Is Transparent", "id": "cursor-tile-transparent" });





//     if(SHOWUNFINISHED) { 
      menu.addSeparator({  });
      menu.addItem({ "label": "Scripting" + "...", "id": "edit-scripting", "shortcut": { "cmd": true, "key": "R" } });
//     }
//      menu.addItem({ "label": "Project View" + "...", "id": "view-project", "shortcut": { "cmd": true, "key": "P" } });



/*
      menu = _this.menuBar.addMenu({"label": 'Settings'});
      menu.addItem({ "label": "Audio Options...", "id": "settings-audio" });
      menu.addItem({ "label": "C64 PRG Code...", "id": "settings-prgcode" });
      menu.addItem({ "label": "C64 Effects Code...", "id": "settings-c64effects" });
*/      
//      menu.addItem({ "label": "Import Shader Code...", "id": "settings-importshader" });

      menu = _this.menuBar.addMenu({"label": "Interface", "className": 'ui-menu-tilemode' });
      menu.addItem({ "label": "Tools Panel", "id": "view-tools" });
      menu.addSeparator({  });

//      menu.addItem({ "label": "Info Panel", "id": "view-infopanel" });
//      menu.addSeparator({  });
      menu.addItem({ "label": "Layers Panel", "id": "view-layerspanel" });
      menu.addItem({ "label": "Tile Palette Panel Side", "id": "view-tilepalettepanelside" });
      menu.addItem({ "label": "Meta Tile Palette Panel Side", "id": "view-metatilepalettepanelside" });
      menu.addItem({ "label": "Colour Palette Panel", "id": "view-palettepanel" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Tile Palette Panel Bottom", "id": "view-tilepalettepanelbottom" });
      menu.addItem({ "label": "Meta Tile Palette Panel Bottom", "id": "view-metatilepalettepanelbottom" });

      menu.addSeparator({  });
      menu.addItem({ "label": "Perf Stats", "id": "view-perfstats" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Export GIF / " + "Video (old version)" + "...", "id": "export-gif" });
      menu.addItem({ "label": "Export C64 (new)...", "id": "export-c64" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Mobile Mode", "id": "settings-mobilemode" });

      menu = _this.menuBar.addMenu({"label": "C64", "className": 'ui-menu-assembler-old' });
      menu.addItem({ "label": "Show Raster Position", "id": "c64-viewraster" });
      menu.addItem({ "label": "Sound Playback", "id": "c64-sound", "checked": true });

      
      menu.addSeparator({ "label": "Joysticks" });
//      menu.addItem({ "label": "None", "checked": true, "id": "sticknone" });
      menu.addItem({ "label": "Port 1", "id": "c64-joystick1" });
      menu.addItem({ "label": "Port 2", "id": "c64-joystick2" });
      menu.addItem({ "label": "Swap Joysticks", "id": "c64-joystickswap" });
      menu.addItem({ "label": "Joystick Settings...", "id": "c64-joysticksettings" });
      menu.addSeparator({ "label": "1351 Mouse" });
      menu.addItem({ "label": "Port 1", "id": "c64-mouse1" });
      menu.addItem({ "label": "Port 2", "id": "c64-mouse2" });

      menu.addSeparator({ "label": "Size" });
      menu.addItem({ "label": "100%", "id": "c64-size-1" });
      menu.addItem({ "label": "200%", "id": "c64-size-2" });
      menu.addItem({ "label": "300%", "id": "c64-size-3" });
      menu.addItem({ "label": "400%", "id": "c64-size-4" });
      menu.addItem({ "label": "Fit", "id": "c64-size-fit" });
      menu.addItem({ "label": "Fit", "id": "c64-size-fitpixel" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Load PRG...", "id": "c64-loadprg" });
      menu.addItem({ "label": "Attach D64...", "id": "c64-attachd64" });
      
      menu.addSeparator({ "label": "PRG Start Settings"  });
      menu.addItem({ "label": "Load/Run", "id": "c64-prgloadrun" });
      menu.addItem({ "label": "Inject into RAM", "id": "c64-prginject", "checked": true });
      menu.addItem({ "label": "Random Delay", "id": "c64-randomdelay", "checked": true });


      menu.addItem({ "label": "Reset", "id": "c64-reset" });


     // menu = _this.menuBar.addMenu({"label": "NES", "className": 'ui-menu-nes' });
     // menu.addItem({ "label": "Reset Machine", "id": "nesdebugger-reset" });
      


      // ------------------------------------------------------------
      menu = _this.menuBar.addMenu({"label": "C64", "className": 'ui-menu-c64 ui-menu-c64-assembler' });
      
//      menu.addSeparator({ "label": "Model"  });
//      menu.addItem({ "label": "PAL", "id": "c64debugger-model-pal", "checked": true });
//      menu.addItem({ "label": "NTSC", "id": "c64debugger-model-ntsc" });

      menu.addSeparator({  });

      menu.addItem({ "label": "Show Raster Position", "id": "c64debugger-viewraster" });
      menu.addItem({ "label": "Show Grid", "id": "c64debugger-grid", "shortcut": { "cmd": true, "key": "G" } });
      menu.addItem({ "label": "Mouse Info", "id": "c64debugger-mouse", "shortcut": { "cmd": true, "key": "I" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Load PRG...", "id": "c64debugger-loadprg" });
      menu.addItem({ "label": "Attach D64...", "id": "c64debugger-attachd64" });
      menu.addItem({ "label": "Autostart D64...", "id": "c64-autostartd64" });
      menu.addItem({ "label": "Insert CRT...", "id": "c64-insertcrt" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Download Snapshot", "id": "c64-downloadsnapshot" });
//      menu.addSeparator({  });
      //menu.addItem({ "label": "Settings...", "id": "c64-settings" });
      menu.addSeparator({ "label": "PRG Start Settings"  });
      menu.addItem({ "label": "Load/Run", "id": "c64debugger-prgloadrun" });
      menu.addItem({ "label": "Inject into RAM", "id": "c64debugger-prginject", "checked": true });
      menu.addItem({ "label": "Random Delay", "id": "c64debugger-randomdelay", "checked": true });

      menu.addSeparator({  });
      menu.addItem({ "label": "Reset Machine", "id": "c64debugger-reset" });

      menu = _this.menuBar.addMenu({"label": "Sound", "className": 'ui-menu-c64' });
      menu.addItem({ "label": "Sound Playback", "id": "c64debugger-sound", "checked": true });
      menu.addSeparator({ "label": "SID Model" });
      menu.addItem({ "label": "6581", "id": "c64debugger-sound6581", "checked": true });
      menu.addItem({ "label": "8580", "id": "c64debugger-sound8580" });


      menu = _this.menuBar.addMenu({"label": "Joystick", "className": 'ui-menu-c64 ui-menu-c64-assembler' });
      menu.addItem({ "label": "Port 1", "id": "c64debugger-joystick1" });
      menu.addItem({ "label": "Port 2", "id": "c64debugger-joystick2" });
      menu.addItem({ "label": "Swap Joysticks", "id": "c64debugger-joystickswap", "shortcut": { "cmd": true, "key": "J"} });
      menu.addItem({ "label": "Joystick Settings...", "id": "c64debugger-joysticksettings" });
      menu.addSeparator({ "label": "1351 Mouse" });
      menu.addItem({ "label": "Port 1", "id": "c64debugger-mouse1" });
      menu.addItem({ "label": "Port 2", "id": "c64debugger-mouse2" });

      menu = _this.menuBar.addMenu({"label": "Size", "className": 'ui-menu-c64 ui-menu-c64-assembler' });
      menu.addItem({ "label": "100%", "id": "c64debugger-size-1" });
      menu.addItem({ "label": "200%", "id": "c64debugger-size-2" });
      menu.addItem({ "label": "300%", "id": "c64debugger-size-3" });
      menu.addItem({ "label": "400%", "id": "c64debugger-size-4" });
      menu.addItem({ "label": "Fit Pixel Multiple", "id": "c64debugger-size-fitpixel" });
      menu.addItem({ "label": "Fit", "id": "c64debugger-size-fit" });


      menu = _this.menuBar.addMenu({"label": "Speed", "className": 'ui-menu-c64' });
      menu.addItem({ "label": "25%", "id": "c64debugger-speed-25" });
      menu.addItem({ "label": "50%", "id": "c64debugger-speed-50" });
      menu.addItem({ "label": "100%", "id": "c64debugger-speed-100", "checked": true });
      menu.addItem({ "label": "150%", "id": "c64debugger-speed-150" });
      menu.addItem({ "label": "200%", "id": "c64debugger-speed-200" });
      menu.addItem({ "label": "300%", "id": "c64debugger-speed-300" });

      menu = _this.menuBar.addMenu({"label": "View", "className": 'ui-menu-3d' });
      menu.addItem({ "label": "Show / Hide Grid", "id": "view-3dgrid", "shortcut": { "cmd": true, "key": "G" } });
      menu.addSeparator({  });
      menu.addItem({ "label": "Perf Stats", "id": "view-3dperfstats" });


      menu = _this.menuBar.addMenu({"label": "View", "className": 'ui-menu-music  ui-menu-colorpalette ui-menu-tileset ui-menu-script' });
      menu.addItem({ "label": "Project View" + "...", "id": "view-project-explorer", "shortcut": { "cmd": true, "key": "P" } });


      menu = _this.menuBar.addMenu({"label": "View", "className": 'ui-menu-c64-assembler' });
      menu.addSeparator({ "label": "Font" });
      menu.addItem({ "label": "Increase Font Size", "id": "view-increase-font-size", "shortcut": { "cmd": true, "key": "=" } });
      menu.addItem({ "label": "Decrease Font Size", "id": "view-decrease-font-size", "shortcut": { "cmd": true, "key": "-" } });
      menu.addItem({ "label": "Reset Font Size", "id": "view-reset-font-size", "shortcut": { "cmd": true, "key": "0" } });
      menu.addItem({ "label": "Show Invisible Characters", "id": "view-toggle-invisible-characters" });//, "shortcut": { "cmd": true, "key": "9" } });
      menu.addItem({ "label": "Autocomplete", "id": "view-toggle-autocomplete" });
      menu.addItem({ "label": "Tab indentation ", "id": "view-toggle-tabindentation" });
      menu.addSeparator({ "label": "Theme" });
      menu.addItem({ "label": "Light", "id": "view-theme-chrome" });
      menu.addItem({ "label": "Dark", "id": "view-theme-tomorrow-night" });



      menu = _this.menuBar.addMenu({"label": "View", "className": 'ui-menu-c64' });

      menu.addItem({ "label": "Disassembly", "id": "c64-view-toggle-disassembly" });
      menu.addItem({ "label": "Scripting", "id": "c64-view-toggle-scripting" });
      menu.addItem({ "label": "BASIC", "id": "c64-view-toggle-basic" });
      menu.addItem({ "label": "Colours", "id": "c64-view-toggle-colors" });
      menu.addItem({ "label": "Memory", "id": "c64-view-toggle-memory" });
      menu.addItem({ "label": "Character Set", "id": "c64-view-toggle-charset" });
      menu.addItem({ "label": "Sprites", "id": "c64-view-toggle-sprites" });
      menu.addItem({ "label": "Bitmap", "id": "c64-view-toggle-bitmap" });
      menu.addItem({ "label": "SID", "id": "c64-view-toggle-sid" });
      menu.addItem({ "label": "Drive", "id": "c64-view-toggle-drive" });
      menu.addItem({ "label": "Docs", "id": "c64-view-toggle-docs" });
      menu.addItem({ "label": "Calculator", "id": "c64-view-toggle-calc" });
      menu.addSeparator({});
      menu.addItem({ "label": "Increase Font Size", "id": "c64-view-increase-font-size", "shortcut": { "cmd": true, "key": "=" } });
      menu.addItem({ "label": "Decrease Font Size", "id": "c64-view-decrease-font-size", "shortcut": { "cmd": true, "key": "-" } });
      menu.addItem({ "label": "Reset Font Size", "id": "c64-view-reset-font-size", "shortcut": { "cmd": true, "key": "0" } });
      menu.addSeparator({ });
      menu.addItem({ "label": "Perf Stats", "id": "c64-view-perfstats" });


      menu = _this.menuBar.addMenu({"label": "Assembler", "className": 'ui-menu-c64' });
      menu.addItem({ "label": "Show Assembler", "id": "c64-view-toggle-assembler" });
      menu.addSeparator({  });
      menu.addItem({ "label": "Show Invisible Characters", "id": "c64-view-toggle-invisible-characters", "shortcut": { "cmd": true, "key": "9" } });
      menu.addItem({ "label": "Autocomplete", "id": "c64-view-toggle-autocomplete" });
      menu.addItem({ "label": "Use Tab indentation ", "id": "c64-view-toggle-tabindentation" });
      menu.addSeparator({ "label": "Theme" });
      menu.addItem({ "label": "Light", "id": "c64-view-theme-chrome" });
      menu.addItem({ "label": "Dark", "id": "c64-view-theme-tomorrow-night" });


      menu = _this.menuBar.addMenu({"label": "Share", "className": 'ui-menu-c64 ui-menu-c64-share' });

      menu.addItem({ "label": "Create a Link to the Current PRG/D64/CRT...", "id": "c64-share-link" });
      menu.addItem({ "label": "Export PRG/D64/CRT as a HTML Page...", "id": "c64-export-html-page" });
//      menu.addItem({ "label": "Download HTML Page", "id": "c64-share-html" });

/*
      menu = _this.menuBar.addMenu({"label": 'Tools' });
      menu.addItem({ "label": "Image Effects", "id": "settings-imageeffects" });
      menu.addItem({ "label": "Show C64 Bytes Free...", "id": "settings-c64bytesfree" });
*/
      menu = _this.menuBar.addMenu({"label": "Help", "className": 'ui-menu-tilemode' });

      menu.addItem({ "label": "Common Actions" + "...", "id": "help-commonactionshortcuts" });

      menu.addItem({ "label": "Mouse / Keyboard shortcuts" + "...", "id": "help-keyboardshortcuts" });

      if(SHOWUNFINISHED) {
        menu.addItem({ "label": "Scripting API" + "...", "id": "help-scriptingapi" });
      }

      _this.menuBar.on('itemclick', function(id) {          
        _this.menuClick(id);
      });

//      _this.setMode('start'); 

      _this.uiNumber = new UINumber();
      _this.uiNumber.init();

      // hide all the panels at first
      _this.mainPanel.showOnly('startPage');

      _this.textModeEditor.loadPreferences();


    });


    this.tabSplitPanel = UI.create("UI.SplitPanel", { "id": "tabSplitPanel" });
    this.tabPanel = UI.create("UI.TabPanel", {});

    this.tabPanel.on('tabfocus', function(key, tabPanel) {

      var tabIndex = _this.tabPanel.getTabIndex(key);
      if(tabIndex >= 0) {
        var tabData = _this.tabPanel.getTabData(tabIndex);
        var path = tabData.path;
        if(typeof path != 'undefined') {
          g_app.projectNavigator.selectDocRecord(path);  
        }
      }
//      var path = key;
//      g_app.projectNavigator.selectDocRecord(path);

    });

    this.tabPanel.on('notabs', function(tabPanel) {
      g_app.setMode('none');
    });


    var tabPanelHidden = true;
    if(isMobile) {
      tabPanelHidden = true;
    }
    this.tabSplitPanel.addNorth(this.tabPanel, 34, false, tabPanelHidden);


    this.contentPanel = UI.create("UI.Panel", { "id": "appContent" } );

    this.tabSplitPanel.add(this.contentPanel);
    this.mainSplitPanel.add(this.tabSplitPanel);

    this.startPage = new StartPage();
    this.startPage.init();
    this.startPage.buildInterface(this.mainPanel);//this.contentPanel);



//    this.projectShare = new ProjectShare();
//    this.projectShare.init(this.githubClient);

    this.textModeEditor = new TextModeEditor();
    this.textModeEditor.init();
    this.textModeEditor.buildInterface(this.contentPanel);

    this.colorPaletteEditor = new ColorPaletteEditor();
    this.colorPaletteEditor.init();
    this.colorPaletteEditor.buildInterface(this.contentPanel);

    this.tileSetEditor = new TileSetEditor();
    this.tileSetEditor.init();
    this.tileSetEditor.buildInterface(this.contentPanel);

    this.scriptEditor = new ScriptEditor();
    this.scriptEditor.init({ parentPanel: this.contentPanel });
    // interface gets built when its shown
//    this.scriptEditor.buildInterface(this.contentPanel);

    this.jsonEditor = new JSONEditor();
    this.jsonEditor.init({ parentPanel: this.contentPanel });
//    this.jsonEditor.buildInterface(this.contentPanel);

    this.textEditor = new TextEditor();
    this.textEditor.init({ parentPanel: this.contentPanel });
//    this.textEditor.buildInterface(this.contentPanel);
    
    this.hexEditor = new HexEditor();
    this.hexEditor.init();
    this.hexEditor.buildInterface(this.contentPanel);
//    this.spriteEditor = new SpriteEditor();
//    this.spriteEditor.init();
//    this.spriteEditor.buildInterface(this.contentPanel);

    this.createTemplateLink = new CreateTemplateLink();
    this.createTemplateLink.init();

    this.assembler = new Assembler();
    this.assembler.init();

    this.assemblerEditor = new AssemblerEditor();
    this.assemblerEditor.init();
    this.assemblerEditor.buildInterface(this.contentPanel);


    this.music = new Music();
    this.music.init();
    this.music.buildInterface(this.contentPanel);


    this.c64Debugger = new C64Debugger();
    this.c64Debugger.init();
    this.c64Debugger.buildInterface(this.contentPanel);


/*
    this.nesDebugger = new NESDebugger();
    this.nesDebugger.init();
    this.nesDebugger.buildInterface(this.contentPanel);
*/

    /*
    this.x16Debugger = new X16();
    this.x16Debugger.init();
    this.x16Debugger.buildInterface(this.contentPanel);

    */

    this.dbgFont = new DbgFont();
    this.dbgFont.init();

    this.setFontSize(this.fontSize);
/*
    this.c64 = new C64Interface();
    this.c64.init();
    this.c64.buildInterface(this.contentPanel);
*/

    this.scripting = new Scripting();
    
    this.scriptingPanel = UI.create("UI.Panel", {"id": "scriptingPanel"});
    this.scripting.init({ "parentPanel": this.scriptingPanel });
//    this.scripting.buildInterface(this.scriptingPanel);

    this.mainSplitPanel.addWest(this.scriptingPanel, 360, true, true);//, true);


    this.projectNavigator = new ProjectNavigator();
    this.projectNavigator.init(this);
    this.projectNavigatorPanel = UI.create("UI.Panel", { "id": "projectNavigatorPanel" });
    this.projectNavigator.buildInterface(this.projectNavigatorPanel);

    this.projectPanel.addWest(this.projectNavigatorPanel, 180, true, true);


  },

  toggleMobileView: function() {
    this.tabSplitPanel.setPanelVisible('north', true);
    this.projectPanel.setPanelVisible('north', true);

  },


  setTabPanelVisible: function() {
    this.tabSplitPanel.setPanelVisible('north', true);
  },

  // just update the tab..
  setCurrentDocRecord: function(docRecord) {
//    this.tabPanel.setTabLabel(0, docRecord.name);
  },

  menuClick: function(menuItem) {
    var _this = this;
    switch(menuItem) {
      case 'file-new':
        var newProjectDialog = g_app.getNewProjectDialog();
        newProjectDialog.show();      
//        g_app.fileManager.showNewDialog();
      break;
      case 'file-open':
        this.fileManager.openLocalFile();
      break;
      case 'file-spritedimensions':
      case 'file-dimensions':
//        this.fileManager.showDimensions();

        this.textModeEditor.showDimensionsDialog();
      break;
      case 'screen-crop':
        this.textModeEditor.cropToSelection();
        break;
      case '3d-mode':
        this.setMode('3d');
      break;
      case 'file-save':
        this.fileManager.save();
      break;

      case 'file-saveas':
        this.fileManager.showSaveAs();
      break;

      case 'file-commit':
      case 'project-commitchanges':
          
        g_app.github.save();      
      break;

      case 'project-share':
        this.share();
//        this.projectShare.showShareDialog();
//        this.github.shareProject();
        break;

      case 'file-saveastemplate':
        this.fileManager.showSaveAsTemplate();
      break;

      case 'file-nes':
        this.setMode('nes'); 
      break;

      case 'file-x16':
        this.setMode('x16');
      break;
      case 'file-download':
        this.fileManager.showDownload();
      break;

      case 'file-new':
        this.fileManager.showNew();
      break;

      case 'file-templateLink':
        this.createTemplateLink.show();
      break;

      case 'edit-undo':
      case 'edit-musicundo':
      case 'colorpaletteedit-undo':
        this.undo();
      break;
      case 'edit-redo':
      case 'edit-musicredo':
      case 'colorpaletteedit-undo':
        this.redo();
      break;

      case 'edit-cut':
      case 'edit-musiccut':
        if(this.mode == '3d' || this.mode == '2d') {
          if(this.textModeEditor.getEditorMode() == 'pixel') {
            this.textModeEditor.tools.drawTools.pixelSelect.cut();
          } else {  
            this.textModeEditor.tools.drawTools.select.cut();
          }
        } 
        if(this.mode == 'music') {
          this.music.cut();
        }
        break;

      case 'edit-copy':
      case 'edit-musiccopy':
        if(this.mode == '3d' || this.mode == '2d') {
          if(this.textModeEditor.getEditorMode() == 'pixel') {
            this.textModeEditor.tools.drawTools.pixelSelect.copy();
          } else {  
            this.textModeEditor.tools.drawTools.select.copy();

            if(this.textModeEditor.tools.drawTools.select.getEnabled()) {
              //this.textModeEditor.copyAsImage();
            }
          }
        } 

        if(this.mode == 'music') {
          this.music.copy();
        }
        break;

      case 'c64debugger-mouse':
      case 'edit-copyimage':
        if(this.mode == 'c64') {
          this.c64Debugger.showMouseInfo(!this.c64Debugger.mouseInfo);
        } else {
          this.textModeEditor.copyAsImage();
        }
        break;
      case 'edit-paste':
      case 'edit-musicpaste':
        if(this.mode == '3d' || this.mode == '2d') {
          if(this.textModeEditor.getEditorMode() == 'pixel') {
            this.textModeEditor.tools.drawTools.pixelSelect.paste();
          } else {  

            this.textModeEditor.tools.drawTools.select.paste();
          }
        } 
        if(this.mode == 'music') {
          this.music.paste();
        }
        break;
      break;
      case 'edit-clearall':
        if(this.mode == '3d' || this.mode == '2d') {
          this.textModeEditor.tools.drawTools.select.clearAll();
        } 
        if(this.mode == 'music') {
          this.music.clear();
        }
      break;

      case 'edit-clear':
        if(this.mode == '3d' || this.mode == '2d') {
          this.textModeEditor.tools.drawTools.select.clear();
        } 
        break;
      case 'edit-musicclear':
        this.music.clear();
      break;

      case 'edit-fliph':
        if(this.textModeEditor.graphic.getType() == 'sprite') {
          this.textModeEditor.tools.drawTools.pixelDraw.flipH();
        } else {
          this.textModeEditor.tools.drawTools.select.flipH();
        }
        break;
      case 'edit-flipv':
        if(this.textModeEditor.graphic.getType() == 'sprite') {
          this.textModeEditor.tools.drawTools.pixelDraw.flipV();
        } else {
          this.textModeEditor.tools.drawTools.select.flipV();
        }
        break;

      case 'edit-selectall':
        if(this.mode == '3d' || this.mode == '2d') {
          if(this.textModeEditor.getEditorMode() == 'pixel') {
            this.textModeEditor.tools.drawTools.pixelSelect.selectAll();
          } else {  

            this.textModeEditor.tools.drawTools.select.selectAll();
          }
        } 

        if(this.mode == 'music') {
          this.music.selectAll();
        }
        break;
      case 'edit-deselect':
        if(this.mode == '2d') {
          if(this.textModeEditor.getEditorMode() == 'pixel') {
            this.textModeEditor.tools.drawTools.pixelSelect.unselectAll();
          } else {  

            this.textModeEditor.tools.drawTools.select.unselectAll();
          }
        } 

        if(this.mode == '3d' ) {
          this.textModeEditor.grid3d.selection.unselectAll();
        }
      case 'edit-musicdeselect':
        this.music.clearSelect();
      break;


      case 'edit-replaceColor':
        this.textModeEditor.replaceColor();
      break;

      case 'edit-replaceCharacter':
        this.textModeEditor.replaceCharacter();
      break;

      case 'edit-clearHiddenTiles':
        this.textModeEditor.clearHiddenTiles();
      break;

      case 'edit-c64':
        this.setMode('c64');
      break;

      case 'edit-toggleMode':
        var editorMode = this.textModeEditor.getEditorMode();
        if(editorMode != 'pixel') {
          this.textModeEditor.setEditorMode('pixel');
        } else {
          this.textModeEditor.setEditorMode('tile');
        }
      break;


      case 'view-3dgrid':
        this.textModeEditor.setGridVisible(!this.textModeEditor.getGridVisible());
        break;


      case 'edit-showborder':
        this.textModeEditor.grid.toggleBorder();
      break;


      case 'edit-showbackground':
//        this.textModeEditor.grid.toggleBackground();
        this.textModeEditor.layers.toggleBackground();
      break;

      case 'edit-showbackgroundimage':
        this.textModeEditor.grid.toggleBackgroundImage();
      break;

      case 'edit-setbackgroundimage':
        this.textModeEditor.backgroundImage.start();
      break;

      case 'screen-referenceimage':
        this.textModeEditor.showReferenceImageDialog();
      break;
      case 'edit-scripting':
        this.scripting.toggleVisible();      
      break;

      case 'export-png':
        this.textModeEditor.exportPng();
      break;

      case 'export-svg':
        
        this.textModeEditor.exportSvg();
      break;

      case 'export-image':
        this.textModeEditor.exportImage();        
        break;
      case 'export-gif':
        this.textModeEditor.exportGif();
//        this.textModeEditor.exportGif.start();
      break;

      case 'export-petsciic':
        this.textModeEditor.doExport('petsciic');
      break;

      case 'export-pet':
        this.textModeEditor.doExport('pet');
      break;

      case 'export-3d-gif':
        this.textModeEditor.export3dAsGif();
        break;

      case 'export-charpad':
        this.textModeEditor.doExport('charpad');
      break;

      case 'export-spritepad':
        this.textModeEditor.doExport('spritepad');
      break;

      case 'export-c64assembly':
        this.textModeEditor.doExport('c64assembly');
      break;
      case 'export-mega65assembly':
        this.textModeEditor.doExport('mega65assembly');
      break;
      case 'export-x16assembly':
        this.textModeEditor.doExport('x16assembly');
      break;


      case 'export-x16basic':
        this.textModeEditor.doExport('x16basic');
      break;

      case 'export-share':
        this.share();
        break;

      case 'export-txt':
        this.textModeEditor.doExport('txt');
        break;
      case 'export-json':
        this.textModeEditor.doExport('json');
      break;

      case 'export-binary':
        this.textModeEditor.doExport('binary');//exportBinaryData.start();
      break;
      
      case 'export-seq':
        this.textModeEditor.doExport('seq');
      break;

      case 'export-prg':
        this.textModeEditor.toPrg.start();
      break;

      case 'export-c64':
        this.textModeEditor.exportC64.start();
        break;

      case 'export-magicavoxel':
        this.textModeEditor.doExport('vox');
      break;

      case 'export-obj':
        this.textModeEditor.doExport('obj');
      break;


      case 'export-sid':
        this.music.exportAsType('sid');
      break;

      case 'export-goattracker':
        this.music.exportAsType('goattracker');
      break;

      case 'export-wav':
        this.music.exportAsType('wav');      
      break;

      case 'export-sidprg':
        this.music.exportAsType('prg');      
      break;


      case 'import-image':
        this.textModeEditor.importImage.start();
      break;

      case 'import-assembly':
        this.textModeEditor.importAssembly.start();
      break;

      case 'import-c64formats':
        this.textModeEditor.importC64Formats.start();
      break;

      case 'import-c64spriteformats':
        this.textModeEditor.importC64SpriteFormats.start();
        break;
      case 'import-spriteimage':
        this.textModeEditor.startImportSpriteImage();
        break;

      case 'mode-spritetextmode':
      case 'mode-textmode':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.TEXTMODE);
      break;


      case 'mode-c64standard':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.C64STANDARD);
        break

      case 'mode-c64ecm':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.C64ECM);
      break;

      case 'mode-vector':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.VECTOR);
        this.textModeEditor.setHasTileFlip(true);
        this.textModeEditor.setHasTileRotate(true);
      break;

      case 'mode-spritec64multicolor':
      case 'mode-c64multicolor':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
      break;

      case 'mode-spritenes':
      case 'mode-nes':
        this.textModeEditor.setScreenMode('nes');
        this.textModeEditor.colorPaletteManager.colorSubPalettes.check();
      break;
      case 'mode-indexed':
      case 'mode-spriteindexed':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.INDEXED);
        break;

      case 'mode-rgb':
      case 'mode-spritergb':
        this.textModeEditor.setScreenMode(TextModeEditor.Mode.RGB);
        break;

      case 'mode-multicolor':
        this.textModeEditor.setScreenMode('multicolor');
      break;

      case 'mode-tileflip':
        this.textModeEditor.setHasTileFlip(!this.textModeEditor.getHasTileFlip());
        break;
      case 'mode-tilerotate':
        this.textModeEditor.setHasTileRotate(!this.textModeEditor.getHasTileRotate());
        break;
      case 'mode-tilematerials':
          this.textModeEditor.setHasTileMaterials(!this.textModeEditor.getHasTileMaterials());
          break;

      case 'mode-blockmode':
        if(this.textModeEditor.getBlockModeEnabled()) {
          this.textModeEditor.setBlockModeEnabled(false);
        } else {
          this.textModeEditor.setBlockModeEnabled(true);
          
        }

        if(this.textModeEditor.getBlockModeEnabled()) {
          UI('mode-blockmode').setChecked(true);
          UI('mode-blocksize').setEnabled(true);
          UI('colorpermode-cell').setEnabled(false);
        } else {
          UI('mode-blockmode').setChecked(false);
          UI('mode-blocksize').setEnabled(false);
          UI('colorpermode-cell').setEnabled(true);
        }
      break;

      case 'mode-blocksize':
        this.textModeEditor.showBlockSizeDialog();
      break;

      case 'colorpermode-cell':
        this.textModeEditor.setColorPerMode('cell');
      break;

      case 'colorpermode-character':
        this.textModeEditor.setColorPerMode('character');
      break;

      case 'colorpermode-block':
        this.textModeEditor.setColorPerMode('block');
      break;

      case 'layers-new':
        this.textModeEditor.layers.showNewLayerDialog();
      break;

      case 'layers-properties':
        this.textModeEditor.layers.editLayer();      
      break;

      case 'layers-delete':
        if(confirm('Are you sure you want to delete this layer?')) {

          this.textModeEditor.layers.deleteLayer();      
        }
      break;

      case 'layers-moveUp':
        this.textModeEditor.layers.moveLayer(1);    
      break;

      case 'layers-moveDown':
        this.textModeEditor.layers.moveLayer(-1);      
      break;

      case 'layers-toggle':
        this.textModeEditor.layers.toggleVisible();
      break;

      case 'layers-selectAbove':
        this.textModeEditor.layers.moveSelect(1);          
      break;
      
      case 'layers-selectBelow':      
        this.textModeEditor.layers.moveSelect(-1);          
      break;

      case 'layers-merge':
        this.textModeEditor.layers.showLayerMerge();
      break;

      case 'layers-toframes':
        this.textModeEditor.layers.showLayersToFrames();
      break;

      case 'layers-fromframes':
        this.textModeEditor.layers.showFramesToLayers();
      break;

      case 'charactersets-edit':
        this.textModeEditor.showTileEditor();

      break;
      case 'charactersets-preset':
      case 'tileset-preset':

        this.textModeEditor.tileSetManager.showChoosePreset({});
        break;
      break;
      case 'charactersets-load':
      case 'tileset-load':
        this.textModeEditor.tileSetManager.showImport({});
      break;
      case 'charactersets-save':
      case 'tileset-save':
      this.textModeEditor.tileSetManager.showSave();
      break;
      case 'tileset-new':
        this.textModeEditor.tileSetManager.showNewTileSetDialog();
      break;
      case 'colorpalette-new':
        this.textModeEditor.colorPaletteManager.showNewColorPaletteDialog();
      break;
      case 'color-edit':
        this.textModeEditor.toggleColorEditor();
      break;
      case 'colors-preset':
      case 'colorpalette-preset':
        this.textModeEditor.colorPaletteManager.showChoosePreset({});
      break;
      case 'color-editcolorpalette':
        this.textModeEditor.editColorPalette();
      break;
      /*
      case 'colors-edit':
        this.textModeEditor.editColorPalette();
      break;
      */

      case 'colors-load':
      case 'colorpalette-load':
        this.textModeEditor.colorPaletteManager.showLoad({});
      break;
      case 'colors-save':
      case 'colorpalette-save':
        this.textModeEditor.colorPaletteManager.showSave();
      break;
      case 'view-increase-font-size':
      case 'c64-view-increase-font-size':
      case 'view-zoomin':
        if(this.mode == 'assembler' || this.mode == 'c64') {
          this.changeFontSize(1);
        } else {
          this.textModeEditor.zoom(1);
        }
        break;
      case 'view-decrease-font-size':
      case 'c64-view-decrease-font-size':
      case 'view-zoomout':
        if(this.mode == 'assembler' || this.mode == 'c64') {
          this.changeFontSize(-1);          
        } else {
          this.textModeEditor.zoom(-1);
        }
        break;
      case 'view-theme-chrome':
        this.assemblerEditor.setTheme('chrome');          
        break;
      case 'view-theme-tomorrow-night':
        this.assemblerEditor.setTheme('tomorrow_night');
        break;  
      case 'view-fitonscreen':
      case 'view-reset-font-size':
      case 'c64-view-reset-font-size':
          if(this.mode == 'assembler' || this.mode == 'c64') {
          this.resetFontSize();          
        } else {
          this.textModeEditor.fitOnScreen();
        }
        break;
      case 'view-toggle-invisible-characters':
        this.assemblerEditor.toggleInvisibles();
        break;
      
      case 'view-toggle-autocomplete':
        this.assemblerEditor.toggleAutocomplete();
        break;

      case 'view-toggle-tabindentation':
        this.assemblerEditor.toggleTabIndentation();
        break;


      case 'c64-view-toggle-drive':
        var show = !UI(menuItem).getChecked();
        this.c64Debugger.showPanel(menuItem, show);
        break;
  
      case 'c64-view-toggle-invisible-characters':
        this.c64Debugger.assemblerEditor.toggleInvisibles();
        break;

      case 'c64-view-toggle-autocomplete':
        this.c64Debugger.assemblerEditor.toggleAutocomplete();
        break;
      case 'c64-view-theme-chrome':
        this.c64Debugger.assemblerEditor.setTheme('chrome');          
        break;
      case 'c64-view-theme-tomorrow-night':
        this.c64Debugger.assemblerEditor.setTheme('tomorrow_night');
        break;  
      case 'c64-view-toggle-tabindentation':
        this.c64Debugger.assemblerEditor.toggleTabIndentation();
        break;
    
      case 'c64-view-toggle-assembler':
      case 'c64-view-toggle-disassembly':
      case 'c64-view-toggle-scripting':
      case 'c64-view-toggle-colors':
      case 'c64-view-toggle-basic':
      case 'c64-view-toggle-memory':      
      case 'c64-view-toggle-charset':
      case 'c64-view-toggle-sprites':
      case 'c64-view-toggle-bitmap':
      case 'c64-view-toggle-sid':
      case 'c64-view-toggle-drive':
      case 'c64-view-toggle-docs':
      case 'c64-view-toggle-calc':
        var show = !UI(menuItem).getChecked();
        this.c64Debugger.showPanel(menuItem, show);
        break;

        
//      case '':
//        break;
      case 'view-actualpixels':
        this.textModeEditor.actualPixels();
        break;

      case 'home-page':
        document.location = '/';
        break;
      case 'view-project':
      case 'view-project-explorer':
      case 'show-project-explorer':
        this.projectNavigator.toggleVisible();      

        //this.mainPanel.showOnly('mainSplitPanel');
        /*
        this.mainPanel.showOnly('projectSplitPanel');
        this.mainSplitPanel.setPanelVisible('north', true);
        this.showAssembler();
        */

        break;

      case 'settings-prgcode':
        this.textModeEditor.editC64PRGCode();
        break;

      case 'settings-importshader':
        this.textModeEditor.editImportShader();
        break;

      case 'settings-mobilemode':
        if(confirm('Are you sure you want to switch to mobile mode?')) {
          this.setDeviceType('mobile');
        }
        break;
      case 'cursor-tile-transparent':
        this.textModeEditor.toggleCursorTileTransparent();
        break;

      case 'layout-palette-bottom':
        this.textModeEditor.setLayout('bottom');
        break;
      case 'layout-palette-side':
        this.textModeEditor.setLayout('side');
        break;
      case 'layout-minimal':
        this.textModeEditor.setLayout('minimal');
        break;

      case 'view-tools':
        this.textModeEditor.setToolsVisible(!this.textModeEditor.getToolsVisible());
        break;

      case 'view-infopanel':
        this.textModeEditor.setInfoPanelVisible(!this.textModeEditor.getInfoPanelVisible());
        break;
      case 'view-layerspanel':
          this.textModeEditor.setLayersPanelVisible(!this.textModeEditor.getLayersPanelVisible());
          break;
      case 'view-palettepanel':
          this.textModeEditor.setColorPalettePanelVisible(!this.textModeEditor.getColorPalettePanelVisible());
          break;

      case 'view-tilepalettepanelside':
        this.textModeEditor.setTilePalettePanelVisible('side', !this.textModeEditor.getTilePalettePanelVisible('side'));
        break;
      case 'view-metatilepalettepanelside':
        this.textModeEditor.setSideBlockPanelVisible(!this.textModeEditor.getSideBlockPanelVisible());
        break;
  
      case 'view-tilepalettepanelbottom':
        this.textModeEditor.setTilePalettePanelVisible('bottom', !this.textModeEditor.getTilePalettePanelVisible('bottom'));
        break;
      case 'view-metatilepalettepanelbottom':
        this.textModeEditor.setBottomBlockPanelVisible(!this.textModeEditor.getBottomBlockPanelVisible());
        break;
  
      case 'c64-view-perfstats':
      case 'view-perfstats':
      case 'view-3dperfstats':
        if(UI.getStatsEnabled()) {
          UI.setStatsEnabled(false);
          UI('view-perfstats').setChecked(false);

        } else {
          UI.setStatsEnabled(true);
          UI('view-perfstats').setChecked(true);
        }
        
        break;
      case 'help-commonactionshortcuts':
        window.open('docs/common-action-shortcuts.html', 'common-action-shortcuts');
        break;
      case 'help-keyboardshortcuts':
        window.open('docs/keyboard-shortcuts.html', 'keyboard-shortcuts');
      break;
      case 'help-scriptingapi':
        window.open('docs/api.html', 'scripting-api');
      break;

      case 'c64-sound':
      case 'c64debugger-sound':
        c64.sound.toggleAudio();
        break;

      case 'c64debugger-sound6581':
        c64.sound.setModel('6581');
        break;
      case 'c64debugger-sound8580':
        c64.sound.setModel('8580');
        break;

      case 'c64-share-link':
        this.c64Debugger.share();
        break;
      
      case 'c64-export-html-page':
        this.c64Debugger.exportAsHTMLPage();
        break;
      case 'c64-loadprg':
      case 'c64debugger-loadprg':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.choosePRG();
          }
        }

        if(this.mode == 'c64') {
          this.c64Debugger.choosePRG();
        }
        break;
      case 'c64-attachd64':
      case 'c64debugger-attachd64':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.chooseD64(false);
          }
        }        

        if(this.mode == 'c64') {
          this.c64Debugger.chooseD64(false);
        }
        break;
      case 'c64-autostartd64':
        if(this.mode == 'c64') {
          this.c64Debugger.chooseD64(true);
        }
        break;
      case 'c64-insertcrt':
        if(this.mode == 'c64') {
          this.c64Debugger.chooseCRT();
        }
        break;  
      case 'c64-downloadsnapshot':
        if(this.mode == 'c64') {
          this.c64Debugger.downloadSnapshot();
        }
        break;
      case 'c64-settings':
        if(this.mode == 'c64') {
//          this.c64Debugger.showSettings();
        }
        break;
      case 'c64debugger-prgloadrun':
      case 'c64-prgloadrun':
        
        if(this.mode == 'c64') {          
          this.c64Debugger.setPRGLoadMethod('loadrun');
        }

        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {
            this.assemblerEditor.debuggerCompact.setPRGLoadMethod('loadrun');
          }
        }
        break;
      case 'c64debugger-prginject':
      case 'c64-prginject':
        if(this.mode == 'c64') {
          this.c64Debugger.setPRGLoadMethod('inject');
        }

        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {
            this.assemblerEditor.debuggerCompact.setPRGLoadMethod('inject');
          }
        }

        break;
      case 'c64debugger-randomdelay':
        if(this.mode == 'c64') {
          this.c64Debugger.toggleRandomDelay();
        }
        break;
      case 'c64-reset':
      case 'c64debugger-reset':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.machineReset();
          }
        }        

        if(this.mode == 'c64') {
          this.c64Debugger.machineReset();
        }
        break;
      case 'c64debugger-model-pal':
        if(this.mode == 'c64') {
          this.c64Debugger.setModel('pal');
        }
        break;

      case 'c64debugger-model-ntsc':
        if(this.mode == 'c64') {
          this.c64Debugger.setModel('ntsc');
        }
        break;
      
      case 'c64-viewraster':
      case 'c64debugger-viewraster':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.toggleShowRaster();
          }
        }        

        if(this.mode == 'c64') {
          this.c64Debugger.toggleShowRaster();
        }
        break;
      case 'edit-showgrid':  
      case 'c64debugger-grid':
        if(this.mode == 'c64') {
          this.c64Debugger.showGrid(!this.c64Debugger.grid);
        } else {
          this.textModeEditor.setGridVisible(!this.textModeEditor.getGridVisible());
        }
        break;
      case 'c64-joystick1':
      case 'c64-joystick2':
      case 'c64debugger-joystick1':
      case 'c64debugger-joystick2':
        var port = 0;
        var enabled = true;

        if(menuItem == 'c64-joystick1' || menuItem == 'c64debugger-joystick1') {
          enabled = UI('c64-joystick1').getChecked();
          port = 1;
        } else if(menuItem == 'c64-joystick2' || menuItem == 'c64debugger-joystick2') {
          enabled = UI('c64-joystick2').getChecked();
          port = 2;
        }

        c64.joystick.setPortEnabled(port, !enabled);
        break;
      case 'c64-joysticksettings':
      case 'c64debugger-joysticksettings':
        c64.joystick.showSettingsDialog();
        break;
      case 'c64-joystickswap':
      case 'c64debugger-joystickswap':
        c64.joystick.swap();
        break;

      case 'c64-mouse1':
      case 'c64-mouse2':
      case 'c64debugger-mouse1':
      case 'c64debugger-mouse2':
        var port = 0;
        var enabled = true;

        if(menuItem == 'c64-mouse1' || menuItem == 'c64debugger-mouse1') {
          enabled = UI('c64-mouse1').getChecked();
          port = 1;
        } else if(menuItem == 'c64-mouse2' || menuItem == 'c64debugger-mouse2') {
          enabled = UI('c64-mouse2').getChecked();
          port = 2;
        }

        c64.joystick.setMousePortEnabled(port, !enabled);

        break;

      case 'c64-size-1':
      case 'c64-size-2':
      case 'c64-size-3':
      case 'c64-size-4':
      case 'c64debugger-size-1':
      case 'c64debugger-size-2':
      case 'c64debugger-size-3':
      case 'c64debugger-size-4':
            var size = 1;
        if(menuItem == 'c64-size-1' || menuItem == 'c64debugger-size-1') {
          size = 1;
        } else if(menuItem == 'c64-size-2' || menuItem == 'c64debugger-size-2') {
          size = 2;
        } else if(menuItem == 'c64-size-3' || menuItem == 'c64debugger-size-3') {
          size = 3;
        } else if(menuItem == 'c64-size-4' || menuItem == 'c64debugger-size-4') {
          size = 4;
        }

        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.setSize(size);
          }
        }

        if(this.mode == 'c64') {
          this.c64Debugger.setSize(size);
        }
        break;

      case 'c64debugger-speed-25':
      case 'c64debugger-speed-50':
      case 'c64debugger-speed-100':
      case 'c64debugger-speed-150':
      case 'c64debugger-speed-200':
      case 'c64debugger-speed-300':
        var speed = 100;
        switch(menuItem) {
          case 'c64debugger-speed-25':
            speed = 25;
            break;
          case 'c64debugger-speed-50':
            speed = 50;
            break;
          case 'c64debugger-speed-100':
            speed = 100;
            break;
          case 'c64debugger-speed-150':
            speed = 150;
            break;
          case 'c64debugger-speed-200':
            speed = 200;
            break;
          case 'c64debugger-speed-300':
            speed = 300;
            break;
  
        }
        if(this.mode == 'c64') {
          this.c64Debugger.setSpeed(speed);
        }
        break;

      case 'c64-size-fit':
      case 'c64debugger-size-fit':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.setSize('fit');
          }
        }

        if(this.mode == 'c64') {
          this.c64Debugger.setSize('fit');
        }
        break;
      case 'c64debugger-size-fitpixel':
      case 'c64-size-fitpixel':
        if(this.mode == 'assembler') {
          if(this.assemblerEditor.debuggerCompact) {  
            this.assemblerEditor.debuggerCompact.setSize('fitpixel');
          }
        }

        if(this.mode == 'c64') {
          this.c64Debugger.setSize('fitpixel');
        }
        break;
        
    }

    if(menuItem.indexOf('tileset-select-') !== -1) {
      var tileSetId = menuItem.substring('tileset-select-'.length);
      this.textModeEditor.tileSetManager.selectTileSet(tileSetId);
    }


    if(menuItem.indexOf('colorpalette-select-') !== -1) {
      var colorPaletteId = menuItem.substring('colorpalette-select-'.length);
      this.textModeEditor.colorPaletteManager.selectColorPalette(colorPaletteId);
    }


  },

  showProjectNavigator: function() {
    if(this.isMobile()) {
      if(this.projectNavigatorMobile == null) {
        this.projectNavigatorMobile = new ProjectNavigatorMobile();
        this.projectNavigatorMobile.init();
      }


      this.projectNavigatorMobile.show();

    }
  },

  getFontSize: function() {
    return this.fontSize;
  },

  setFontSize: function(fontSize) {
    this.fontSize = fontSize;
//    this.editor.setFontSize(this.fontSize);
    g_app.setPref("codeeditor.fontsize", this.fontSize);

    // set the font for all the code editors..
    if(this.assemblerEditor) {
      this.assemblerEditor.setFontSize(this.fontSize);
    }

    if(this.c64Debugger) {
      this.c64Debugger.setFontSize(this.fontSize);
    }

  },


  changeFontSize: function(direction) {
    var fontSize = this.fontSize + direction;
    if(isNaN(fontSize) || fontSize <= 0) {
      return;
    }

    this.setFontSize(fontSize);

  },

  resetFontSize: function() {
    this.setFontSize(14);
  },

  share: function() {
    

    if(this.mode == 'assembler') {
      this.assemblerEditor.buildControls.showShare();
    } else if(this.mode == 'c64') {
      this.c64Debugger.share();
    } else {
      this.gist.startShare();  
    }
  },

  undo: function() {

    if(this.textModeEditor.colorPaletteEdit && this.textModeEditor.colorPaletteEdit.visible) {
      this.textModeEditor.colorPaletteEdit.undo();
      return;
    }

    if(this.mode == '3d' || this.mode == '2d') {
      this.textModeEditor.history.undo();
    } 
    if(this.mode == 'sprite') {
      this.spriteEditor.history.undo();
    }
    if(this.mode == 'music') {
      this.music.history.undo();
    }
    if(this.mode == 'color palette') {
      this.colorPaletteEditor.colorPaletteEdit.undo()
    }

    if(this.mode == 'assembler') {
      this.assemblerEditor.undo();
    }

    if(this.mode == 'c64') {
      this.c64Debugger.undo();
    }
  },

  redo: function() {

    if(this.textModeEditor.colorPaletteEdit && this.textModeEditor.colorPaletteEdit.visible) {
      this.textModeEditor.colorPaletteEdit.redo();
      return;
    }

    if(this.mode == '3d' || this.mode == '2d') {
      this.textModeEditor.history.redo();
    } 
    if(this.mode == 'sprite') {
      this.spriteEditor.history.undo();
    }
    if(this.mode == 'music') {
      this.music.history.redo();
    }
    if(this.mode == 'color palette') {
      this.colorPaletteEditor.colorPaletteEdit.redo()
    }

    if(this.mode == 'assembler') {
      this.assemblerEditor.redo();
    }

    if(this.mode == 'c64') {
      this.c64Debugger.redo();
    }

  },


  createDocumentStructure: function(doc) {
    doc.createDocRecord('/', 'color palettes', 'folder', {});
    doc.createDocRecord('/', 'tile sets', 'folder', {});
    doc.createDocRecord('/', 'screens', 'folder', {});
    doc.createDocRecord('/', 'sprites', 'folder', {});
    doc.createDocRecord('/', 'music', 'folder', {});
    doc.createDocRecord('/', 'asm', 'folder', {});
    doc.createDocRecord('/asm', 'inc', 'folder', {});
    doc.createDocRecord('/asm', 'bin', 'folder', {});
    doc.createDocRecord('/', 'scripts', 'folder', {});
    doc.createDocRecord('/', 'build', 'folder', {});
    doc.createDocRecord('/', '3d scenes', 'folder', {});
    doc.createDocRecord('/', 'config', 'folder', {});
  },



  closeProject: function() {
    this.doc = null;
    this.projectNavigator.refresh(null);
    this.projectNavigator.currentPath = false;

  },

  
  newProject: function(args, callback) {
    var _this = this;

    this.closeProject();
    this.fileManager.setIsNew(true);

    var mode = 'monochrome';
    var editor = 'screen';

    if(typeof args.editor  != 'undefined') {
      editor = args.editor;
    }

    if(editor == '') {
      editor = 'screen';
    }

    if(typeof args.mode != 'undefined') {
      mode = args.mode;
    }


    this.doc = new Document();
    this.doc.init(this);

    // load the colour palette and tile set
    var colorPalettePresetId = 'c64_colodore';
    var colorPaletteName = 'Colour Palette';

    if(typeof args.colorPalettePresetId !== 'undefined') {
      if(args.colorPalettePresetId) {
        colorPalettePresetId = args.colorPalettePresetId;
      }
    }

    if(typeof args.colorPaletteName != 'undefined') {
      colorPaletteName = args.colorPaletteName;
    }



    var colorPalette = null;

    if(typeof args.colorPalette != 'undefined' && args.colorPalette) {
      colorPalettePresetId = false;
      colorPalette = args.colorPalette;
    }

    var tileSetName = 'Tile Set';
    var tileSetPresetId = 'petscii';
    if(typeof args.tileSetPresetId != 'undefined') {
      if(args.tileSetPresetId) {
        tileSetPresetId = args.tileSetPresetId;
      }
    }

    var tileSet = null;
    if(typeof args.tileSetCreated != 'undefined' && args.tileSetCreated) {
      tileSet = args.tileSet;
    }

    if(typeof args.tileSetName != 'undefined') {
      tileSetName = args.tileSetName;
    }

    var gridWidth = 40;
    var gridHeight = 25;

    if(mode == 'nes') {
      gridWidth = 32;
      gridHeight = 30;
      colorPalettePresetId = 'nes';
    }


    if(typeof args.width != 'undefined') {
      gridWidth = args.width;
    }

    if(typeof args.height != 'undefined') {
      gridHeight = args.height;
    }

    if(typeof args.template != 'undefined') {
      // templates not really used??

      // new from a template
      var template = args.template;
      for(var i = 0; i < template.length; i++) {
        this.doc.data.children.push(template[i]);
      }


      var screenName = 'Untitled Screen';
      this.textModeEditor.open('/screens/' + screenName);
      this.textModeEditor.setLayoutType('textmode');

      this.setMode('2d');
      
      this.textModeEditor.setScreenMode(mode);
      this.textModeEditor.fitOnScreen({ minScale: 1 });
      this.textModeEditor.colorPaletteManager.colorPaletteUpdated();
      this.projectNavigator.refresh();
      this.textModeEditor.frames.frameTimeline.resize();
      this.textModeEditor.grid.setUpdateEnabled(true);
      this.textModeEditor.grid.update();
      this.textModeEditor.layers.updateAllLayerPreviews();
      return;
    } else {
      this.createDocumentStructure(this.doc);
      this.doc.createDocRecord('/asm', 'main.asm', 'asm', c64Asm_example);
      this.doc.createDocRecord('/asm/inc', 'macros.asm', 'asm', c64Asm_macro);
      this.doc.createDocRecord('/scripts', 'screen.js', 'script', "");
      this.doc.createDocRecord('/scripts', 'assembler.js', 'script', "");
      this.doc.createDocRecord('/scripts', 'c64.js', 'script', "");
      this.doc.createDocRecord('/config', 'assembler.json', 'json', '{\n  "assembler": "acme",\n  "arguments": "--format cbm",\n  "files": "main.asm",\n  "output": "out.prg",\n  "target": "c64"\n }');
      this.doc.createDocRecord('/config', 'c64.json', 'json', "{\n}");
    }

    if(this.music) {
      this.music.startNew({ "name": "Untitled Music", "defaultInstruments": true });
    }

    var graphicName = 'Untitled Screen';
    this.textModeEditor.graphic.setDrawEnabled(false);
    var graphicArgs = {
      name: graphicName,
      gridWidth: gridWidth,
      gridHeight: gridHeight,
      colorPalettePresetId: colorPalettePresetId,
      colorPalette: colorPalette,
      colorPaletteName: colorPaletteName,
      tileSetPresetId: tileSetPresetId,
      tileSet: tileSet,
      tileSetName: tileSetName
    };

    if(typeof args.screenMode != 'undefined') {
      graphicArgs.screenMode = args.screenMode;
    }

    if(typeof args.canFlipTile != 'undefined') {
      graphicArgs.canFlipTile = args.canFlipTile;
    }

    if(typeof args.canRotateTile != 'undefined') {
      graphicArgs.canRotateTile = args.canRotateTile;
    }
    
    this.textModeEditor.createDoc(graphicArgs, function() {    
        switch(editor) {
          case '3d':
            var gridDepth = 25;

            g_app.textModeEditor.grid3d.createDoc({
              parentPath: '/3d scenes',
              name: graphicName,
              gridWidth: gridWidth,
              gridHeight: gridHeight,
              gridDepth: gridDepth,
              colorPalettePresetId: colorPalettePresetId,
              colorPalette: colorPalette,
              tileSetPresetId: tileSetPresetId,
              tileSet: tileSet
      
            }, function(newDocRecord) {
//              g_app.projectNavigator.refreshTreeNode(parentDocRecord, parentNode);
//              g_app.projectNavigator.treeRoot.refreshChildren();
//              g_app.projectNavigator.selectNodeWithId(newDocRecord.id);
              g_app.projectNavigator.showDocRecord('/3d scenes/' + graphicName);
              
            });      
      
            break;

          default: 
          case 'screen':
            _this.setMode('2d');

//            var textModeEditor = _this.textModeEditor;
            _this.projectNavigator.refresh();

            _this.projectNavigator.showDocRecord('/screens/' + graphicName);
            _this.textModeEditor.graphic.setDrawEnabled(true);
            _this.textModeEditor.graphic.invalidateAllCells();
            _this.textModeEditor.graphic.redraw({allCells: true});
            _this.textModeEditor.layers.updateAllLayerPreviews();    

/*
            // open the new doc, should really just use project navigator show doc record?
            //textModeEditor.open('/screens/' + graphicName);

            
//            textModeEditor.setLayoutType('textmode');
          
            // select the first layer
            var firstLayerId = textModeEditor.layers.getLayerId(0);
            textModeEditor.layers.selectLayer(firstLayerId);
            textModeEditor.fitOnScreen({ minScale: 1 });
            textModeEditor.colorPaletteManager.colorPaletteUpdated();


            // if it's a c64 colour palette, select the default c64 colours
            if(colorPalette.indexOf('c64_') === 0) { 
              textModeEditor.currentTile.setColor(14);
              textModeEditor.currentTile.setBGColor(textModeEditor.colorPaletteManager.noColor);
            } else {
              textModeEditor.currentTile.setColor(1);
              textModeEditor.currentTile.setBGColor(textModeEditor.colorPaletteManager.noColor);          
            }

            _this.projectNavigator.refresh();

            textModeEditor.frames.frameTimeline.resize();

            textModeEditor.graphic.setDrawEnabled(true);
            textModeEditor.graphic.invalidateAllCells();
            textModeEditor.graphic.redraw({allCells: true});
            textModeEditor.layers.updateAllLayerPreviews();
            
            textModeEditor.tools.drawTools.setDrawTool('pen');
            textModeEditor.colorPaletteManager.colorPaletteUpdated();

            // need to set to first non blank (unless all are blank)
//            textModeEditor.currentTile.setCharacters([[ 0 ]]);
            textModeEditor.currentTile.setToFirstBlankTile();

            // need to redraw the tile palette
            //textModeEditor.tileSetManager.redrawCharacters();
            textModeEditor.tools.drawTools.tilePalette.resize();
*/            
            break;
          case 'sprite':
//              _this.textModeEditor.open('/screens/' + graphicName);
//              _this.setMode('2d');

//return;              
            _this.projectNavigator.createSpriteRecord({ 'name': "Untitled Sprite" }, function(spriteRecord) {
              _this.projectNavigator.refresh();
              _this.projectNavigator.showDocRecord('/sprites/Untitled Sprite');
              g_app.textModeEditor.setBackgroundColor(g_app.textModeEditor.colorPaletteManager.noColor);

              _this.textModeEditor.graphic.setDrawEnabled(true);
              _this.textModeEditor.graphic.invalidateAllCells();
              _this.textModeEditor.graphic.redraw({allCells: true});
              _this.textModeEditor.layers.updateAllLayerPreviews();    

            });
            break;
          case 'music': 
//            _this.setMode('music');
            _this.projectNavigator.refresh();
            _this.projectNavigator.showDocRecord('/music/Untitled Music');
            break;
          case 'assembler':

            _this.projectNavigator.refresh();

            _this.projectNavigator.showDocRecord('/asm/main.asm');
//            _this.setMode('assembler');
            break;
          case 'c64':
            _this.projectNavigator.refresh();
            _this.setMode('c64');
            break;          
          case 'nes':
            _this.projectNavigator.refresh();
            _this.setMode('nes');
            break;
        }

        // reenable draw
        _this.textModeEditor.graphic.setDrawEnabled(true);


        if(callback) {

          callback();

//          console.error('callback');
        }

//      });
    });
  },

  autosave: function() {
    if(this.doc) {
      g_app.fileManager.autosave();
    }
  },


  showAssembler: function() {
    UI.setWebGLEnabled(false);
    this.assemblerEditor.show();
    this.contentPanel.showOnly('assembler');    
  },

  update: function() {
    if(this.mode === false) {
      return;      
    }


    if(this.mode == '3d' || this.mode == '2d') {
      this.textModeEditor.update();
    }

    if(this.mode == 'assembler') {
      this.assemblerEditor.update();
    }

    if(this.mode == 'music') {
      this.music.update();
    }

    if(this.mode == 'c64') {
      this.c64Debugger.update();
    }
    /*
    if(this.mode == 'x16') {
      this.x16Debugger.update();
    }

    if(this.mode == 'nes') {
      this.nesDebugger.update();
    }
*/
    // api callbacks
    if(TextMode.update) {
      TextMode.update();
    }
  }
}
