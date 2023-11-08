var ProjectNavigatorMobile = function() {
  this.rootLabel = 'Project';
  this.visible = false;

  this.uiComponent = null;

  this.newDocRecordDialog = null;

  this.treeMap = {};

  this.settings = {};

  this.selectedId = false;

  this.currentEditor = null;
}

ProjectNavigatorMobile.prototype = {
  init: function() {
    this.currentEditor = g_app.textModeEditor;
  },

  buildInterface: function() {
    var width = UI.getScreenWidth() - 30;
    if(width > 380) {
      width = 380;
    }

    this.uiComponent = UI.create("UI.Dialog", { "id": "projectNavigatorMobileDialog", "title": "Project Explorer", "width": width });

    html = '<div class="panelFill">';

    html += '<div id="projectNavigatorMobileButtons" style="position: absolute; left: 10px; top: 10px; height: 30px; right: 10px">';

    html += '</div>';


    html += '<div id="projectDocListMobile"></div>';
    html += '</div>';

    var _this = this;
    var htmlPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.add(htmlPanel);

    var openButton = UI.create('UI.Button', { "text": "Open", "color": "primary" });
    this.uiComponent.addButton(openButton);
    openButton.on('click', function(event) {
      _this.openSelected();
      UI.closeDialog();
    });

    var openButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
    this.uiComponent.addButton(openButton);
    openButton.on('click', function(event) {
      UI.closeDialog();
    });

    this.uiComponent.on('close', function() {
      _this.visible = false;
    });

    $('#addRecordButton').on('click', function() {
      _this.showNewDocRecordDialog();
    });

  },

  initNewRecordDialogContent: function(args) {
    var type = false;
    if(typeof args !== 'undefined') {
      if(typeof args.type != 'undefined') {
        type = args.type;
      }
    }



    $('#newDocRecordMobileType').val(type);

    var _this = this;
    $('#newDocRecordMobileType').on('change', function() {
      var type = $(this).val();
      _this.setNewRecordType(type, false);
    });


    var filename = 'Untitled';
    $('#newProjectFileNameMobile').val(filename);


  },

  setTileSets: function(args) {
    var requiredWidth = false;
    var requiredHeight = false;
    if(typeof args != 'undefined') {
      if(typeof args.width != 'undefined') {
        requiredWidth = args.width;
      }
      if(typeof args.height != 'undefined') {
        requiredHeight = args.height;
      }
    }
    var html = '';
    html += '<option value="">New</option>';
    var tileSets = g_app.doc.dir('/tile sets');
    var tileSetCount = 0;
    var firstTileSetId = false;
    for(var i = 0; i < tileSets.length; i++) {
      var tileSet = tileSets[i];
      var width = tileSet.data.width;
      var height = tileSet.data.height;

      if( (width === requiredWidth || requiredWidth === false) 
          && (height === requiredHeight || requiredHeight === false)) {
        tileSetCount++;
        if(firstTileSetId === false) {
          firstTileSetId = tileSets[i].id;
        }
        html += '<option value="' + tileSets[i].id + '">' + tileSets[i].name + '</option>';
      }
    }

    $('#newDocRecordMobileTileSet').html(html);
    if(tileSetCount > 0) {
      $('#newDocRecordMobileTileSet').val(firstTileSetId);
    } else {
      $('#newDocRecordMobileTileSet').val('');      
    }
  },

  setColorPalettes: function() {
    var html = '';
    html += '<option value="">New</option>';
    var colorPalettes = g_app.doc.dir('/color palettes');
    for(var i = 0; i < colorPalettes.length; i++) {
      var colorPalette = colorPalettes[i];
      html += '<option value="' + colorPalette.id + '">' + colorPalette.name + '</option>';
    }

    $('#newDocRecordMobileColorPalette').html(html);

    if(colorPalettes.length > 0) {
      $('#newDocRecordMobileColorPalette').val(colorPalettes[0].id);
    }

  },

  setNewRecordType: function(type, setDropdown) {

    var name = $('#newProjectFileNameMobile').val();
    var parentPath = '';
    var extension = '';

    var pos = name.lastIndexOf('.');
    if(pos !== -1) {
      name = name.substring(0, pos);
    }

    if(typeof setDropdown == 'undefined' || setDropdown) {
      $('#newDocRecordMobileType').val(type);
    }

    if(type == 'sprite') {
      parentPath = 'sprites';
      $('#newDocRecordGridDimensionsDepthMobile').hide();
      $('#newDocRecordMobileGridDimensions').hide();
      this.setColorPalettes();
      this.setTileSets({ width: 24, height: 21 });
    } 

    if(type == 'screen') {
      parentPath = 'screens';
      $('#newDocRecordMobileGridDimensions').show();
      $('#newDocRecordGridDimensionsDepthMobile').hide();
      this.setColorPalettes();
      this.setTileSets();
    }

    if(type == '3d scene') {
      this.parentPath = '3d scenes';
      $('#newDocRecordGridDimensionsDepthMobile').show();
      this.setTileSets();
      this.setColorPalettes();

    }


    if(type == 'asm') {
      parentPath = 'asm/inc';
      $('#newDocRecordMobileGridDimensions').hide();
      extension = 'asm';
    }

    name = this.getUniqueFilename('/' + parentPath + '/', name, extension);
    $('#newProjectFileNameMobile').val(name);     

    var selectLength = name.length;
    if(extension != '') {
      var pos = name.lastIndexOf('.');
      if(pos != -1) {
        selectLength = pos;
      }
    }

    var input = document.getElementById('newProjectFileNameMobile');  
    input.focus();
    input.setSelectionRange(0, selectLength);    

  },

  showNewDocRecordDialog: function(args) {
    var type = false;
    if(typeof args !== 'undefined') {
      if(typeof args.type != 'undefined') {
        type = args.type;
      }
    }


    var _this = this;
    if(this.newDocRecordDialog == null) {
      var width = UI.getScreenWidth() - 30;
      if(width > 380) {
        width = 380;
      }
      var height = 290;
      this.newDocRecordDialog = UI.create("UI.Dialog", { "id": "newProjectFileDialogMobile", "title": "New", "width": width, "height": height });

      this.newFileHTML = UI.create("UI.HTMLPanel");
      this.newDocRecordDialog.add(this.newFileHTML);
      this.newFileHTML.load('html/project/newDocRecordMobile.html', function() {
        _this.initNewRecordDialogContent(args);
        if(type != false) {
          _this.setNewRecordType(type);
        }

      });


      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.okButton.on('click', function(event) {
        var type = $('#newDocRecordMobileType').val();
        var name = $('#newProjectFileNameMobile').val();
        var width = $('#newDocRecordGridWidthMobile').val();
        var height = $('#newDocRecordGridHeightMobile').val();
        var depth = $('#newDocRecordGridDepthMobile').val();
        _this.newRecord({
          type: type,
          name: name,
          width: width,
          height: height,
          depth: depth
        });

        /*
        var args = {};
        var parentNode = _this.tree.getSelectedNode();
        if(parentNode) {
          var nodeType = parentNode.getType();

          if(nodeType != 'folder') {
            parentNode = parentNode.getParentNode();
          }
        }
        args.filename = $('#newProjectFileName').val();
        args.parentNode = parentNode;

        _this.newFile(args);
        */

        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.newDocRecordDialog.addButton(this.okButton);
      this.newDocRecordDialog.addButton(this.closeButton);
    } else {
      this.initNewRecordDialogContent(args);     
      if(type != false) {
        this.setNewRecordType(type);
      }
       
    }

    // work out whats being created

    UI.showDialog("newProjectFileDialogMobile");
  },



  getUniqueFilename: function(parentPath, filename, extension) {

    // make sure the name is unique
    var count = 0;
    var fileExtension = '';
    if(typeof extension != 'undefined' && extension != '') {
      fileExtension = "." + extension;
    }

    // does the filename already have the correct extension, remove it if it does
    var pos = filename.lastIndexOf('.');
    if(pos !== -1) {
      var existingExtension = filename.substring(pos);
      if(existingExtension.toLowerCase() == fileExtension.toLowerCase()) {
        filename = filename.substring(0, pos);
      }
    }

    var testName = filename;

    while(g_app.doc.getDocRecord(parentPath + testName + fileExtension)) {
      count++;
      testName = filename + ' ' + count
    }
    return testName + fileExtension;
  },


  newRecord: function(args) {
    var name = args.name;
    var type = args.type;
    var _this = this;
    var extension = '';


    var parentPath = false;
    switch(type) {
      case 'sprite':
        parentPath = 'sprites';
      break;
      case 'screen':
        parentPath = 'screens';
      break;
      case 'asm':
        parentPath = 'asm/inc';
        extension = "asm";
      break;
      case '3d scene':
        parentPath = '3d scenes';
        break;
    }

    if(parentPath === false) {
      return;
    }

    name = this.getUniqueFilename('/' + parentPath + '/', name, extension);


    if(type == '3d scene') {
      var colorPalette = 'c64_colodore';

      var newDocRecordTileSetId = $('#newDocRecordMobileTileSet').val();
      var colorPaletteId = $('#newDocRecordMobileColorPalette').val();


      var width = 40;

      if(typeof args.width != 'undefined') {
        width = parseInt(args.width, 10);
      }

      var height = 40;
      if(typeof args.height != 'undefined') {
        height = parseInt(args.height, 10);
      }
      if(isNaN(height)) {
        height = 25;
      }

      var depth = 25;
      if(typeof args.depth != 'undefined') {
        depth = parseInt(args.depth, 10);
      }
      if(isNaN(depth)) {
        depth = 25;
      }

      g_app.textModeEditor.grid3d.createDoc({
        parentPath: '/3d scenes',
        name: name,
        gridWidth: width,
        gridHeight: height,
        gridDepth: depth,
        colorPalette: colorPalette,
        tileSet: tileSet,
        tileSetId: newDocRecordTileSetId,
        colorPaletteId: colorPaletteId

      }, function(newDocRecord) {
        _this.updateProjectList();

        _this.selectDoc(newDocRecord.id, '3d scenes/' + name);
        _this.openSelected();
        UI.closeDialog();
      });      

    }
    if(type == 'screen') {
      type = 'graphic';

      var colorPalette = 'c64_colodore';

      var newDocRecordTileSetId = $('#newDocRecordMobileTileSet').val();
      var colorPaletteId = $('#newDocRecordMobileColorPalette').val();


      var width = 40;

      if(typeof args.width != 'undefined') {
        width = parseInt(args.width, 10);
      }
      var height = 40;

      if(typeof args.height != 'undefined') {
        height = parseInt(args.height, 10);
      }
      if(isNaN(height)) {
        height = 25;
      }

      g_app.textModeEditor.createDoc({
        parentPath: '/screens',
        name: name,
        gridWidth: width,
        gridHeight: height,
        colorPalette: colorPalette,
        colorPaletteId: colorPaletteId,
        tileSet: '',
        tileSetId: newDocRecordTileSetId,

      }, function(newDocRecord) {
        _this.updateProjectList();
        _this.selectDoc(newDocRecord.id, 'screens/' + name);
        _this.openSelected();
        UI.closeDialog();
      });

    }

    if(type == 'sprite') {

      type = 'graphic';
/*
      var colorPalette = 'c64_colodore';
      var tileSet = 'petscii';
*/

      var colorPalette = '';
      var tileSet = 'petscii';

      var newDocRecordTileSetId = $('#newDocRecordMobileTileSet').val();
      var colorPaletteId = $('#newDocRecordMobileColorPalette').val();
      if(colorPaletteId == '') {
        colorPalette = 'c64_colodore';
      }


      var tileSetName = 'Sprite Tile Set';

      g_app.textModeEditor.createDoc({
        parentPath: '/sprites',
        name: name,
        gridWidth: 1,
        gridHeight: 1,
        colorPalette: colorPalette,
        colorPaletteId: colorPaletteId,
        cellWidth: 24,
        cellHeight: 21,
        tileSet: '',
        tileSetId: newDocRecordTileSetId,
        tileSetArgs: { width: 24, height: 21, name: tileSetName },

      }, function(newDocRecord) {
        _this.updateProjectList();
        _this.selectDoc(newDocRecord.id, 'sprites/' + name);
        _this.openSelected();
        g_app.textModeEditor.setBackgroundColor(g_app.textModeEditor.colorPaletteManager.noColor);

        UI.closeDialog();
      });
    }
    if(type == 'asm') {
      type = 'asm';
      data = '; asm file';
      var newDocRecord = g_app.doc.createDocRecord('/asm/inc', name, type, data);
      _this.updateProjectList();
      _this.selectDoc(newDocRecord.id, 'asm/inc/' + name);
      _this.openSelected();
      UI.closeDialog();
  }

  },

  getDocListHTML: function(parentFile, prefix) {
    var html = '';

    var filenamePrefix = '';
    if(typeof prefix != 'undefined') {
      filenamePrefix = prefix;
    }

    var docs = parentFile.children;
    var parentPath = parentFile.name;
    if(parentPath == 'inc') {
      parentPath = 'asm/' + parentPath;
    }

    for(var i = 0; i < docs.length; i++) {
      if(docs[i].type !== 'folder') {
        var path = parentPath + '/' + docs[i].name;
        console.log(parentPath);
        html += '<div class="projectNavigatorMobileDoc';
        if(this.selectedId === docs[i].id) {
          html += ' projectNavigatorMobileDocSelected';
        }
        var iconType = docs[i].type;
        if(iconType == 'graphic') {
          if(parentPath == 'screens') {
            iconType = 'screen';
          }
          if(parentPath == 'sprites') {
            iconType = 'sprite';
          }
        }
        html += '" data-path="' + path + '" data-parent="' + parentPath + '" data-id="' + docs[i].id + '" id="mobileDoc-' + docs[i].id + '">';
        html += '<img class="projectNavigatorMobileDocIcon" src="' + Icons.get(iconType) + '" />';
        html += '<span class="projectNavigatorMobileFilename">' + filenamePrefix + docs[i].name + '</span>';
        html += '</div>';

        
      }

      if(docs[i].type == 'folder' && docs[i].name == 'inc') {
        html += this.getDocListHTML(docs[i], 'inc/');
      }
    }

    return html;
  },

  updateProjectList: function() {
    var html = '';


    var doc = g_app.doc;
    var files = doc.dir('/');

//    this.selectedId = false;

    if(this.selectedId === false) {
      var currentEditor = g_app.projectNavigator.getCurrentEditor();
      if(currentEditor) {
        var currentDoc = currentEditor.doc;
        if(currentDoc) {
          this.selectedId = currentDoc.id;
        }
      }
    }


    if(files != null) {
      for(var i = 0; i < files.length; i++) {
        if(files[i].type != 'hiddenfile') {
          var filename = files[i].name;
          var type = files[i].type;
          var id = files[i].id;

          if(type == 'folder') {

            if( (filename == 'screens' 
                  || filename == 'sprites' 
                  || filename == 'asm' 
                  || filename == 'build'
                  || filename == '3d scenes')) {

              html += '<div class="projectNavigatorMobileSection">';

              html += '<div class="projectNavigatorMobileFolder">';
//              html += '<img src="icons/svg/glyphicons-basic-336-folder.svg" style="filter: invert(80%)" height="30"/>';
              html += filename;
              if(filename == 'screens') {
                html += '<div class="ui-button mobileAddRecordButton" data-type="screen" id="mobileProjectAddScreenButton">';
                html += '<div class="rippleJS"></div>';
                html += '<i class="halflings halflings-plus"></i> New Screen...';
                html += '</div>';              
              }

              if(filename == 'sprites') {
                html += '<div class="ui-button mobileAddRecordButton"  data-type="sprite" id="mobileProjectAddSpriteButton">';
                html += '<div class="rippleJS"></div>';
                html += '<i class="halflings halflings-plus"></i> New Sprite...</div>';              
              }

              if(filename == 'asm') {
                html += '<div class="ui-button mobileAddRecordButton"  data-type="asm"  id="mobileProjectAddSpriteButton">';
                html += '<div class="rippleJS"></div>';
                html += '<i class="halflings halflings-plus"></i> New ASM...</div>';              
              }

              if(filename == '3d scenes') {
                html += '<div class="ui-button mobileAddRecordButton"  data-type="3d scene"  id="mobileProjectAdd3dSceneButton">';
                html += '<div class="rippleJS"></div>';
                html += '<i class="halflings halflings-plus"></i> New 3d Scene...</div>';              
              }

//              console.log(filename);

              html += '</div>';

              var docListHTML = this.getDocListHTML(files[i]);
              if(docListHTML == '') {
                docListHTML += '<div class="projectNavigatorMobileEmptyDocList"></div>';
              }

              html += docListHTML;


              html += '</div>';
            }
          } 

          /*else {
            html += '<div class="projectNavigatorMobileDoc">';
            html += filename;
            html += '</div>';
          }
          */

//          var treeNode = this.treeRoot.addChild({ 'label': filename, 'type': type, 'attributes': { "filename": filename, "id": id } });
//          this.treeMap[id] = treeNode;

//          this.refreshTreeNode(files[i], treeNode);
        }
      }
    }


    $('#projectDocListMobile').html(html);

    var _this = this;
    $('.projectNavigatorMobileDoc').on('click', function() {
      var id = $(this).attr('data-id');
      var path = $(this).attr('data-path');
      _this.selectDoc(id, path);

    });

    $('.mobileAddRecordButton').on('click', function() {
      var type = $(this).attr('data-type');

      $('#newDocRecordMobileType').val(type);

      _this.showNewDocRecordDialog({ type: type });
    });


  },

  selectDoc: function(id, path) {

    this.selectedId = id;
    this.selectedPath = path;
    console.log('select doc ' + id + ',' + path);
    $('.projectNavigatorMobileDoc').removeClass('projectNavigatorMobileDocSelected');
    $('#mobileDoc-' + id).addClass('projectNavigatorMobileDocSelected');
  },


  openSelected: function() {

    if( this.currentEditor) {
      if(typeof this.currentEditor.saveSettings !== 'undefined') {
        this.currentEditor.saveSettings(this.settings);
      }
    }

    var path = '/' + this.selectedPath;
    console.log("PATH = '" + path + "'");

    var slashPos = path.lastIndexOf('/');
    parentPath = path.substring(0, slashPos);

    var record = g_app.doc.getDocRecord(path);
    if(!record) {
      console.log("NO RECORD FOR " + path);
      return false;
    }

    var type = record.type;


    console.log("TYPE = " + type);

    switch(type) {
      case 'textmode':
      case 'graphic':
        g_app.setMode('2d');
        g_app.textModeEditor.loadScreen(path, this.settings);

        this.currentEditor = g_app.textModeEditor;      
      break;
/*      
      case 'sprites':
        g_app.setMode('2d');
        g_app.textModeEditor.loadScreen('/' + path, this.settings);

        this.currentEditor = g_app.textModeEditor;
      break;
*/      

      case '3d scene':
        g_app.setMode('3d');
        g_app.textModeEditor.open3d(path, this.settings);
        this.currentEditor = g_app.textModeEditor;
  
        break;
      case 'asm':
        g_app.setMode('assembler');
        g_app.assemblerEditor.showFile(path, this.settings);

        this.currentEditor = g_app.assemblerEditor;
        break;
      case 'bin':
        g_app.setMode('hex');
        g_app.hexEditor.load(path);
        this.currentEditor = g_app.hexEditor;
  
        break;
      case 'prg':
        g_app.setMode('c64');
        //g_app.c64Debugger();
//          g_app.assemblerEditor.showFile(path, this.settings);
        g_app.c64Debugger.showFile(path);
        this.currentEditor = g_app.c64Debugger;
        break;
    

    }
  },


/*
  selectCurrent: function() {

    var currentEditor = g_app.projectNavigator.getCurrentEditor();
    if(currentEditor) {
      var currentDoc = currentEditor.doc;
      if(currentDoc) {
        this.selectedId = currentDoc.id;
      }
    }

    if(this.currentPath === false) {
      // ok, current path is not set, try to work out from editor
      var editor = this.currentEditor;
      if(typeof editor.doc !== 'undefined') {
        if(editor.doc.type == 'graphic') {
          // ok its prob a screen
          this.currentPath = '/screens/' + editor.doc.name;
        }
      }
    }

    var doc = g_app.doc.getDocRecord(this.currentPath);
    if(doc) {
      this.selectNodeWithId(doc.id);
    }
  },
  */

  show: function() {
    this.visible = true;
    if(this.uiComponent == null) {
      this.buildInterface();
    }

    this.updateProjectList();
    UI.showDialog('projectNavigatorMobileDialog');    

//    this.selectCurrent();
  }
}

