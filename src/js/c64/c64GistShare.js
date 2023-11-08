var C64GistShare = function() {
  this.uiComponent = null;

  this.shareType = 'prg';
  this.shareView = 'current';
}

C64GistShare.prototype = {
  init: function(githubClient) {
    this.githubClient = githubClient;
  },

  getLoginHTML: function() {
    var html = '<div class="c64ShareSection" id="c64ShareLogin">';

    // user needs to login
    html += '  <h2>Sign in to GitHub to Share Project</h2>';
    html += '  <div>';
    html += '    <p>Files are shared by creating a ';
    html += '    <a href="https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/editing-and-sharing-content-with-gists" target="_blank">GitHub secret Gist</a>';
    html += '    .</p>';
    html += '    <p>To share your content, you will need to login to GitHub.</p>';
    html += '  </div>';

    html += '  <div class="ui-button ui-button-info" id="c64ShareRegisterGitHub" style="padding: 4px; height: auto; line-height: 20px">';
    html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
    html += '    GitHub Login / Register';
    html += '  </div>';

    html += '</div>';

    return html;
  },

  getAddScopeHTML: function() {
    var html = '';
    
    html += '<div class="c64ShareSection" id="c64ShareAddScope">';

    html += '  <h2>Require Permission to create Gists</h2>';
    html += '  <div>';
    html += '    <p>Files are shared by creating a ';

    html += '    <a href="https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/editing-and-sharing-content-with-gists" target="_blank">GitHub secret Gist</a>';
    html += '    .</p>';    
    html += '    <p>To share a your project, you will need to allow lvllvl to create Gists.</p>';
    html += '  </div>';

    html += '  <div class="ui-button ui-button-info" id="c64ShareAddScope" style="padding: 4px; height: auto; line-height: 20px">';
    html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
    html += '    Allow Gist Access';
    html += '  </div>';

    html += '</div>';
    return html;
  },


  getShareLinkHTML: function() {
    var html = '';

    html += '<div class="c64ShareSection" id="c64ShareLinkGenerated">';

    html += '  <h2>Share Link</h2>';

    html += '  <div>';
    html += '    <p>A secret Gist has been created on GitHub.</p>';
    html += '    <p>You can use the link below to share your content.</p>';
    html += '  </div>';

    html += '<input type="text" size="40" id="c64ShareLink">';
    html += '<div class="ui-button ui-button-primary" id="c64ShareLinkCopy"><img src="icons/svg/glyphicons-basic-614-copy.svg">&nbsp;Copy To Clipboard</div>'

    html += '</div>';
    return html;

  },

  getShareLinkProgressHTML: function() {
    html = '';
    html += '<div id="c64ShareLinkProgress" class="c64ShareSection" style="display: none">';
    html += '  uploading...';
    html += '</div>';

    return html;
  },
  getOptionsHTML: function() {
    var html = '<h3>Create a share link</h3>';

//    html += '<p>Download the current PRG/D64/CRT as a zipped HTML page to upload to websites such as itch.io</p>';

    var contentOptions = [
      {
        "label": "Current PRG",
        "value": "prg",
      },
      {
        "label": "Current D64 (Autostart)",
        "value": "d64",
      },
      {
        "label": "Current CRT",
        "value": "crt",
      },
      {
        "label": "Assembly Source",
        "value": "assembly",
      },
      {
        "label": "BASIC",
        "value": "basic",
      },
      {
        "label": "Script",
        "value": "script",
      },
      {
        "label": "Snapshot",
        "value": "snapshot"
      },

    ];
    html += '<div class="c64ShareSection" id="c64ShareOptions">';
    html += '  <div class="formGroup">';

    html += '    <label class="controlLabel">Content</label>'
    html += '    <select id="c64ShareType" name="c64ShareType">';
    for(var i = 0; i < contentOptions.length; i++) {
      html += '    <option value="' + contentOptions[i].value + '">' + contentOptions[i].label + '</option>';
    }

    html += '    </select>';

    html += '  </div>';


    html += '  <div class="formGroup">';

    html += '    <label class="controlLabel">Default View</label>'

    html += '    <select name="c64ShareView" id="c64ShareView">';
    html += '      <option value="c64only">C64 Only</option>';
    html += '      <option value="current">Current View</option>';
    html += '    </select>';

    html += '  </div>';

    html += '<div class="formGroup">';
    html += '  <label class="controlLabel">Enable Joysticks</label>'
    html += '  <div class="checkboxGroup">';
    html += '    <label class="cb-container">Port 1';
    html += '      <input type="checkbox" id="c64ShareJoystickPort1" name="c64ShareJoystickPort" value="port1">';
    html += '      <span class="checkmark"></span>';
    html += '    </label>';
    html += '    <br/>';
    html += '    <label class="cb-container">Port 2';
    html += '      <input type="checkbox" id="c64ShareJoystickPort2" name="c64ShareJoystickPort" value="port2">';
    html += '      <span class="checkmark"></span>';
    html += '    </label>';
    html += '  </div>';
    html += '</div>';


    html += '  <div class="formGroup">';

    html += '    <label class="controlLabel">Options</label>'
    html += '    <div class="checkboxGroup">';
    html += '      <label class="cb-container">Allow Snapshot Download'
    html += '        <input type="checkbox" name="c64ShareSnapshot" id="c64ShareSnapshot" value="1" checked="checked">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';
    html += '      <br/>';

    html += '      <label class="cb-container">Allow Share'
    html += '        <input type="checkbox" name="c64ShareAllowShare" id="c64ShareAllowShare" value="1" checked="checked">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';
    html += '    </div>';


    html += '  </div>';


    html += '  <div class="ui-button ui-button-info" id="c64ShareCreateGist" style="padding: 4px; height: auto; line-height: 20px">';
    html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
    html += '    Create Share Link';
    html += '  </div>';

    html += '</div>';

    return html;
  },


  
  buildInterface: function() {
    var width = 500;
    var height = 500;
    this.uiComponent = UI.create("UI.Dialog", { "id": "c64gistsharedialog", "title": "Share", "width": width, "height": height });

    var html = this.getOptionsHTML();
    html += this.getLoginHTML();
    html += this.getAddScopeHTML();
    html += this.getShareLinkProgressHTML();
    html += this.getShareLinkHTML();

    var htmlPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.add(htmlPanel);

    this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });

    this.uiComponent.addButton(this.closeButton);

    this.closeButton.on('click', function(event) {
      UI.closeDialog();
    });

    this.uiComponent.on('close', function() {
      g_app.setAllowKeyShortcuts(true);
      UI.setAllowBrowserEditOperations(false);
    });

    this.initEvents();
  },


  initEvents: function() {
    var _this = this;
/*
    $('input[name=c64ShareType]').on('click', function() {
      var shareType = $('input[name=c64ShareType]:checked').val();
      _this.shareType = shareType;
    });


    $('input[name=c64ShareView]').on('click', function() {
      var shareView = $('input[name=c64ShareView]:checked').val();
      _this.shareView = shareView;
    });
*/

    $('#c64ShareType').on('change', function() {
      var shareType = $(this).val();
      _this.shareType = shareType;
    });


    $('c64ShareView').on('change', function() {
      var shareView = $('c64ShareView').val();
      _this.shareView = shareView;
    });


    $('#c64ShareRegisterGitHub').on('click', function() {
      g_app.githubClient.login(function() {
        _this.userHasLoggedIn();
      }, ['gist']);
    });


    $('#c64ShareAddScope').on('click', function() {
      // get existing scopes
      var scopes = g_app.githubClient.getScopes();

      // add gist scope
      scopes.push('gist');
      
      g_app.githubClient.login(function() {
        _this.userHasLoggedIn();
      }, scopes);
    });

    $('#c64ShareCreateGist').on('click', function() {
      _this.createShareLink();
    });


    $('#c64ShareLinkCopy').on('click', function() {
      _this.copyShareLink();
    });    

  },

  show: function(args) {
    if(this.uiComponent == null) {
      this.buildInterface();
    }

    var c64Debugger = g_app.c64Debugger;
    if(!c64Debugger.checkSharing()) {
      alert('Sorry, sharing has been disabled for this content');
      return false;
    }


    UI.showDialog("c64gistsharedialog");
    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

    var c64Debugger = g_app.c64Debugger;

    if(c64Debugger.d64Data) {
      this.shareType = 'd64';      
    } else if(c64Debugger.prgData) {
      this.shareType = 'prg';
    } else if(c64Debugger.crtData) {
      this.shareType = 'crt';
    }

    if(typeof args != 'undefined') {
      if(typeof args.type != 'undefined') {
        this.shareType = args.type;
      }

      if(typeof args.view != 'undefined') {
        this.shareView = args.view;
      }
    }

    $('#c64ShareType').val(this.shareType);
    $('#c64ShareView').val(this.shareView);

    $('#c64ShareJoystickPort1').prop('checked', c64.joystick.portEnabled[0]);
    $('#c64ShareJoystickPort2').prop('checked', c64.joystick.portEnabled[1]);

    $('.c64ShareSection').hide();
    var githubClient = g_app.githubClient;
    if(!githubClient.isLoggedIn() ) {
      $('#c64ShareLogin').show();
    } else if(!githubClient.hasScope('gist')) {
      // need to request gist scope..
      $('#c64ShareAddScope').show();

    } else {
      this.userHasLoggedIn();
    }
  },


  userHasLoggedIn: function() {
    $('.c64ShareSection').hide();
    $('#c64ShareOptions').show();
  },


  createShareLink: function() {
    var c64Debugger = g_app.c64Debugger;
    if(!c64Debugger.checkSharing()) {
      alert('Sorry, sharing has been disabled for this content');
      return false;
    }

    var colors = c64.colors.colors;
    /*
    var port1 = c64.joystick.portEnabled[0]; 
    var port2 = c64.joystick.portEnabled[1]; 
    */
   
    var port1 = $('#c64ShareJoystickPort1').is(':checked');
    var port2 = $('#c64ShareJoystickPort2').is(':checked');

    var port1Buttons = c64.joystick.joystickButtons[0];
    var port2Buttons = c64.joystick.joystickButtons[1];
    var port1Button1Action = c64.joystick.joystickButtonActions[0][1];
    var port2Button1Action = c64.joystick.joystickButtonActions[1][1];

    var allowSnapshotDownload = $('#c64ShareSnapshot').is(':checked');
    var allowShare = $('#c64ShareAllowShare').is(':checked');

    var mousePort1 = c64.joystick.mousePortEnabled[0];
    var mousePort2 = c64.joystick.mousePortEnabled[1];


    var settings = {
      "colors": colors,
      "port1": port1,
      "port2": port2,
      "port1Buttons": port1Buttons,
      "port2Buttons": port2Buttons,
      "port1Button1Action": port1Button1Action,
      "port2Button1Action": port2Button1Action,
      "mousePort1": mousePort1,
      "mousePort2": mousePort2,
      "snapshotDownload": allowSnapshotDownload,
      "share": allowShare
    };

    var files = {};
    var autostart = [];

    if(this.shareView == 'current') {
      var view = [];
      for(var key in c64Debugger.panelVisible) {

        if(c64Debugger.panelVisible[key]) {
          view.push(key);
        }
      }
      settings['view'] = view;
    } else {
      settings['view'] = [];
    }

    if(this.shareType == 'prg') {
      if(c64Debugger.prgData) {
        var prgName = c64Debugger.prgName;
        var data = bufferToBase64(c64Debugger.prgData);
        files[prgName] = { content: data };
      }
      settings['prgstart'] = g_app.c64Debugger.prgLoadMethod;
      settings['prgRandomDelay'] = g_app.c64Debugger.getRandomDelayEnabled();
    }

    if(this.shareType == 'd64') {
      if(c64Debugger.d64Data) {
        var d64Name = c64Debugger.d64Name;
        var data = bufferToBase64(c64Debugger.d64Data);
        files[d64Name] = { content: data };
      }
    }

    if(this.shareType == 'crt') {
      if(c64Debugger.crtData) {
        var crtName = c64Debugger.crtName;
        var data = bufferToBase64(c64Debugger.crtData);
        files[crtName] = { content: data };
      }
    }

    if(this.shareType == 'assembly') {


      var asmFiles = [];
      asmFiles = c64Debugger.assemblerEditor.collectSourceFiles('/asm', asmFiles, ['asm', 'folder']);
  
      console.log("ASSEMBLY FILES: ");
      console.log(files);

      for(var i = 0; i < asmFiles.length; i++) {
        var path = asmFiles[i].filePath;
        var type = asmFiles[i].type;
        if(type !== 'folder') {
          if(path.length > 0 && path[0] == '/') {
            path = path.substr(1);
          }
          path = 'asm/' + path;

          path = path.replace(/\//g, g_gistPathSeparator);
          files[path] = { content: asmFiles[i].content };
        }
      }

      /*
      var path = '/asm/main.asm';
      var record = g_app.doc.getDocRecord(path);
      */

      autostart.push('assembler');

    }

    if(this.shareType == 'basic') {
      var path = '/scripts/c64.bas';
      var record = g_app.doc.getDocRecord(path);

      if(record) {
        files['c64.bas'] = { content: record.data };
      }

      autostart.push('basic');

    }

    if(this.shareType == 'script') {
      var path = '/scripts/c64.js';
      var record = g_app.doc.getDocRecord(path);

      if(record) {
        files['c64.js'] = { content: record.data };
      }  

      autostart.push('script');
    }

    if(this.shareType == 'snapshot') {
//      alert('snapshot!');
      var ptr = c64_getSnapshot();
      var len = c64_getSnapshotSize();

//      console.log('snapshot size = ' + len);
    
      var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
//      var data = this.imageData.data;
//      data.set(view);
//      console.log(view);
      
      var data = bufferToBase64(view);
      files['c64snapshot'] = { content: data };

//      console.log(files);
//      return;

    }
  

    if(autostart.length > 0) {
      settings['autostart'] = autostart;
    }

    files["c64settings"] = {
      "content": JSON.stringify(settings)
    };


    $('.c64ShareSection').hide();
    $('#c64ShareLinkProgress').show();


    console.log(files);


    var _this = this;

    g_app.githubClient.createGist({ 
      files: files
    }, function(response) {
//      var gitPullURL = data.git_pull_url;

      console.log(response);
      var id = response.data.id;
      _this.showLink({ id: id });
    });    

//    console.log(files);
//    g_app.gist.share({ files: files });
  },


  showLink: function(args) {
    var link = 'https://lvllvl.com/c64/?gid=' + args.id;
    $('.c64ShareSection').hide();
    $('#c64ShareLinkGenerated').show();

    $('#c64ShareLink').val(link);
  },

  copyShareLink: function() {
    $("#c64ShareLink").focus();
    $("#c64ShareLink").select();
    document.execCommand('copy');

  },


}
