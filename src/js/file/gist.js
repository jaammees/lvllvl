var g_gistPathSeparator = ' ~~ ';


var GistUI = function() {
  this.uiComponent = null;
}

GistUI.prototype = {
  init: function(githubClient) {
    this.githubClient = githubClient;
  },


  loadFromGist: function(args) {
    var gist = args.gist;


    g_app.githubClient.getGist({
      id: gist
    }, function(response) {

      var files = response.data.files;
      var editor =  false;//'assembler';
      var docRecordToOpen = false;

      // create the document
      g_app.doc = new Document();    
      g_app.doc.init(g_app);
      g_app.createDocumentStructure(g_app.doc);

      var c64Settings = false;
      var c64Content = false;
      var settings = false;
      var separator = g_gistPathSeparator;

      // check for settings
      if(typeof files['settings'] != 'undefined') {
        try {
          var settings = JSON.parse(files[key].content);
          if(typeof settings['separator'] != 'undefined') {
            separator = settings['separator'];
          }
        } catch(e) {          
        }
      }

      var foundSeparator = false;
      for(var key in files) {
        if(key.indexOf(separator) != -1) {
          foundSeparator = true;
          break;
        }
      }

      if(!foundSeparator) {
        // use the old one
        //console.log("DIDNT FIND SEPARATOR!!!");
        separator = ' - ';
      }

      for(var key in files) {
        var filename = files[key].filename;
        var content = files[key].content;

//        filename = filename.replace(/ - /g, '/');
        filename = filename.split(separator).join('/');

        
        var extension = '';
        var dotPos = filename.lastIndexOf('.');
        if(dotPos != -1) {
          extension = filename.substr(dotPos + 1);
          extension = extension.toLowerCase().trim();
        }
        if(extension == 'prg') {
          editor = 'c64';  
          var content = files[key].content;
          content = base64ToBuffer(content);
          g_app.setMode('c64');
          var options = {
            fullscreen: 'yes',
            joystick: 'port2'
          };
          c64Content = { filename: files[key].filename, prg: content, options: options };
//          g_app.c64Debugger.setContentToStart({ filename: files[key].filename, prg: content, options: options });
        } 

        if(extension == 'crt') {
          editor = 'c64';  
          var content = files[key].content;
          content = base64ToBuffer(content);
          g_app.setMode('c64');
          c64Content = { filename: files[key].filename, crt: content };
//          g_app.c64Debugger.setContentToStart({ filename: files[key].filename, crt: content });
        }

        if(extension == 'bas') {

          if(filename.indexOf('/') == -1) {
            // its just someone sharing a .bas, not part of a project
            //g_app.setMode('c64');

            var content = files[key].content;
            var path = '/scripts/' + key;

            var record = g_app.doc.getDocRecord(path);
        
            if(record == null) {
              // create it?
              var scripts = g_app.doc.getDocRecord('/scripts');
              if(scripts) {
                g_app.doc.createDocRecord('/scripts', key, 'script', "");
                record = g_app.doc.getDocRecord(path);
              }
            }
        
            if(record != null) {
              if(record.data == '') {
                record.data = content;
              }
            }      
          }
        }

        if(extension == 'js') {
          if(filename == 'c64.js') {
            // it's shared c64 scripting..
            var content = files[key].content;
            var path = '/scripts/' + key;

            var record = g_app.doc.getDocRecord(path);
        
            if(record == null) {
              // create it?
              var scripts = g_app.doc.getDocRecord('/scripts');
              if(scripts) {
                g_app.doc.createDocRecord('/scripts', key, 'script', "");
                record = g_app.doc.getDocRecord(path);
              }
            }
        
            if(record != null) {
              if(record.data == '') {
                record.data = content;
              }
            }      
          }
        }

        if(extension == 'd64') {
          console.log('loading a d64!!!');
          editor = 'c64';  
          var content = files[key].content;
          content = base64ToBuffer(content);
          g_app.setMode('c64');
          c64Content = { filename: files[key].filename, d64: content };
          //g_app.c64Debugger.setContentToStart({ filename: files[key].filename, d64: content });

        }        

        if(filename == 'c64snapshot') {
          var content = base64ToBuffer(files[key].content);
          c64Content = { filename: 'snapshot', snapshot: content };
        }

        if(filename == 'c64settings') {
          try {
            editor = 'c64';
            c64Settings = JSON.parse(files[key].content);      
          } catch(e) {

          }
        }

        // https://lvllvl.com/?view=c64&gist=75425a2c692f53e158a43ae3734da5dc
        if(extension == 'asm') {
          if(editor === false) {
            editor = 'assembler';
          }
        }

        // if the filenames have a slash they're part of a project
        if(filename.length > 0 && filename.indexOf('/') !== -1) {
          if(filename[0] != '/') {
            filename = '/' + filename;
          }
          console.log('set doc record: ' + filename);
          //g_app.doc.setDocRecord(filename, content);
          g_app.doc.addRecord({
            path: filename,
            content: content,
            sha: false
          });


          if(docRecordToOpen === false
             || filename == '/asm/main.asm'
          ) {
            docRecordToOpen = filename;
            console.log('set doc record to open = ' + docRecordToOpen);
          }

          if(filename.indexOf('/screens/') == 0
              || filename.indexOf('/3d scenes/') == 0
              || filename.indexOf('/sprites/') == 0
              || filename.indexOf('/music/') == 0) {
            docRecordToOpen = filename;

            var pos = docRecordToOpen.lastIndexOf('.json');
            if(pos != -1) {
              docRecordToOpen = docRecordToOpen.substr(0, pos);
            }
          }
        }

      }

      if(editor == 'c64') {
        g_app.setMode('c64');
        g_app.projectNavigator.refreshTree();
        g_c64Settings = c64Settings;
        if(c64Content) {
          g_app.c64Debugger.setContentToStart(c64Content);
        }
        // setup content will run here and when c64 is ready
        g_app.c64Debugger.setupContent();
        return;
      }

//      console.log(g_app.doc);

//      g_app.setMode(editor);        
//        g_app.assemblerEditor.showFile('/asm/main.asm', 0);
      console.log('opening: ' + docRecordToOpen);
      g_app.doc.openDoc({ "view": docRecordToOpen });
    });

  },

  startShare: function(args) {
    var files = {};
/*
    sourceFiles.push({
      name: 'assembler.json',
      filePath: 'config/assembler.json',
      content: content
    });
*/

    var path = g_app.projectNavigator.getCurrentPath();
    if(!path) {
      // dont know the path
      return;
    }
    var doc = g_app.doc.getDocRecord(path);
    console.log(doc);
    var type = doc.type;

    if(type == 'music') {
      var filepath = path;
      if(filepath.length > 0 && filepath[0] == '/') {
        filepath = filepath.substr(1);
      }
      
      if(filepath.indexOf('.json') == -1) {
        filepath += '.json';
      }

      filepath = filepath.replace(/\//g, g_gistPathSeparator);

      files[filepath] = {
        content: JSON.stringify(doc.data)
      }
    }


    if(type == 'graphic' || type == '3d scene') {

      //var filename = doc.name;
      var filepath = path;
      if(filepath.length > 0 && filepath[0] == '/') {
        filepath = filepath.substr(1);
      }
      
      if(filepath.indexOf('.json') == -1) {
        filepath += '.json';
      }

      filepath = filepath.replace(/\//g, g_gistPathSeparator);

      files[filepath] = {
        content: JSON.stringify(doc.data)
      }

      var currentEditor = g_app.projectNavigator.getCurrentEditor();
      if(currentEditor && typeof currentEditor.getThumbnailCanvas !== 'undefined') {
        thumbnailCanvas = currentEditor.getThumbnailCanvas();
        if(thumbnailCanvas) {
          thumbnailData = thumbnailCanvas.toDataURL("image/png");
          console.log('thumbnail Data:');
          console.log(thumbnailData);
//          download(thumbnailData, "test.png", "image/png");    
          files['thumbnail.png'] = {
            content: thumbnailData
          }


        }
      }


      // need to get all charsets and color palettes used in graphic
      var layers = doc.data.layers;
      for(var i = 0; i < layers.length; i++) {

        var colorPaletteId = layers[i].colorPaletteId;
        var colorPalette = g_app.textModeEditor.colorPaletteManager.getColorPalette(colorPaletteId);
        if(colorPalette) {
          var colorPaletteJson = colorPalette.getJSON();
          var filename = colorPalette.getName();
          var filepath = 'color palettes' + g_gistPathSeparator + filename;

          files[filepath] = {
            content: JSON.stringify(colorPaletteJson) 
          }
        }

        var tileSetId = layers[i].tileSetId;
        var tileset = g_app.textModeEditor.tileSetManager.getTileSet(tileSetId);
        if(tileset) {
          var tilesetJson = tileset.getJSON();
          var filename = tileset.getName();
          var filepath = 'tile sets' + g_gistPathSeparator + filename;

          files[filepath] = {
            content: JSON.stringify(tilesetJson)
          }
        }
      }
    }

    var settings = {
      version: 1,
      separator: g_gistPathSeparator
    };

    files['settings'] = { content: JSON.stringify(settings) };
    this.share({
      files: files
    });

  },


  showDialog: function() {
    if(this.uiComponent == null) {
      var width = 500;
      var height = 200;
      this.uiComponent = UI.create("UI.Dialog", { "id": "gistShareDialog", "title": "Share", "width": width, "height": height });

      var html = '';

      // user needs to login
      html += '<div id="githubGistLogin" class="gistDialogSection" style="display: none">';
      html += '  <h2>Sign in to GitHub to Share Project</h2>';
      html += '  <div>';
      html += '    <p>Files are shared by creating a ';
      html += '    <a href="https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/editing-and-sharing-content-with-gists" target="_blank">GitHub secret Gist</a>';
      html += '    .</p>';
      html += '    <p>To share your content, you will need to login to GitHub.</p>';
      html += '  </div>';
  
      html += '  <div class="ui-button ui-button-info" id="gistLoginRegisterGitHub" style="padding: 4px; height: auto; line-height: 20px">';
      html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
      html += '    GitHub Login / Register';
      html += '  </div>';
      html += '</div>';

      // user is logged in, but doesn't have correct scope
      html += '<div id="githubGistAddScope" class="gistDialogSection" style="display: none">';
      html += '  <h2>Require Permission to create Gists</h2>';
      html += '  <div>';
      html += '    <p>Files are shared by creating a ';
      html += '    <a href="https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/editing-and-sharing-content-with-gists" target="_blank">GitHub secret Gist</a>';
      html += '    .</p>';
      html += '    <p>To share a your project, you will need to allow lvllvl to create Gists.</p>';
      html += '  </div>';
  
      html += '  <div class="ui-button ui-button-info" id="gistAddScope" style="padding: 4px; height: auto; line-height: 20px">';
      html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
      html += '    Allow Gist Access';
      html += '  </div>';
      html += '</div>';


      // logged in with correct scope, do the share
      html += '<div id="githubGistShare" class="gistDialogSection" style="display: none">';
      html += '  <h2>Share</h2>';
      html += '  <div>';
      
      html += '    <p>Files are shared by creating a ';
      html += '    <a href="https://docs.github.com/en/free-pro-team@latest/github/writing-on-github/editing-and-sharing-content-with-gists" target="_blank">GitHub secret Gist</a>';
      html += '    .</p>';

      html += '    <p>Click the \'Share\' button to create a Gist and a link to the files.</p>';
      html += '  </div>';
  
      html += '  <div class="ui-button ui-button-info" id="gistShareGitHub" style="padding: 4px; height: auto; line-height: 20px">';
      html += '    <img style="margin-right: 6px; margin-top: -4px" src="icons/GitHub-Mark-32px.png">';
      html += '    Share';
      html += '  </div>';
      html += '</div>';


      html += '<div id="githubGistShareProgress" class="gistDialogSection" style="display: none">';
      html += '  uploading...';
      html += '</div>';


      // gist created.
      html += '<div id="githubGistLink" class="gistDialogSection" style="display: none">';
      html += '  <h2>Share Link</h2>';

      html += '  <div>';
      html += '    <p>A secret Gist has been created on GitHub.</p>';
      html += '    <p>You can use the link below to share your content.</p>';
      html += '  </div>';

      html += '<input type="text" size="40" id="gistShareLink">';
      html += '<div class="ui-button ui-button-primary" id="gistShareLinkCopy"><img src="icons/svg/glyphicons-basic-614-copy.svg">&nbsp;Copy To Clipboard</div>'
  
      html += '</div>';


      

      var htmlPanel = UI.create("UI.HTMLPanel", { html: html });
      this.uiComponent.add(htmlPanel);

      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });

      this.uiComponent.addButton(this.closeButton);

      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      var _this = this;

      UI.on('ready', function() {
        $('#gistLoginRegisterGitHub').on('click', function() {
          _this.githubClient.login(function() {
            _this.userHasLoggedIn();
          }, ['gist']);
        });


        $('#gistAddScope').on('click', function() {
          // get existing scopes
          var scopes = _this.githubClient.getScopes();

          // add gist scope
          scopes.push('gist');
          
          _this.githubClient.login(function() {
            _this.userHasLoggedIn();
          }, scopes);
        });

        $('#gistShareGitHub').on('click', function() {
          _this.doShare();
        });

        $('#gistShareLinkCopy').on('click', function() {
          _this.copyShareLink();
        });
    
      });

      this.uiComponent.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });

    }

    UI.showDialog("gistShareDialog");    
    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

  },



  share: function(args) {    
    this.files = [];
    this.shareData = false;
    this.shareFilename = false;

    if(typeof args.data != 'undefined') {
      this.shareData = args.data;
      this.shareFilename = args.filename;
    }

    if(typeof args.files != 'undefined') {
      this.files = args.files;
    }
    this.showDialog();

    $('.gistDialogSection').hide();

    if(!this.githubClient.isLoggedIn() ) {
      $('#githubGistLogin').show();
    } else if(!this.githubClient.hasScope('gist')) {
      // need to request gist scope..
      $('#githubGistAddScope').show();

    } else {
      this.userHasLoggedIn();
    }
  },

  userHasLoggedIn: function() {
    $('.gistDialogSection').hide();
    $('#githubGistShare').show();
  },


  // the function that actually creates the gist
  doShare: function() {

    var _this = this;
    $('.gistDialogSection').hide();
    $('#githubGistShareProgress').show();
    g_app.githubClient.createGist({ 
      files: _this.files
    }, function(response) {
//      var gitPullURL = data.git_pull_url;

      console.log(response);
      var id = response.data.id;
      _this.showLink({ id: id });
    });    
  },

  showLink: function(args) {
    var link = 'https://lvllvl.com/?gid=' + args.id;
    $('.gistDialogSection').hide();
    $('#githubGistLink').show();

    $('#gistShareLink').val(link);
  },

  copyShareLink: function() {
    $("#gistShareLink").focus();
    $("#gistShareLink").select();
    document.execCommand('copy');

  },

}