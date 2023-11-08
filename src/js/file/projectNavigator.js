var ProjectNavigatorPopup = function() {
  this.html = '<div>';
  this.html += '<div id="projectNavigatorMenuCreate" class="ui-menu-item projectNavigatorMenuItem" data-action="create"><div style="padding-right: 5px" class="ui-menu-item-label">New...</div></div>';
  this.html += '<div id="projectNavigatorMenuCreate" class="ui-menu-item projectNavigatorMenuItem" data-action="createfolder"><div style="padding-right: 5px" class="ui-menu-item-label">New Folder...</div></div>';
  this.html += '<div id="projectNavigatorMenuRename" class="ui-menu-item projectNavigatorMenuItem" data-action="rename"><div style="padding-right: 5px" class="ui-menu-item-label">Rename...</div></div>';
  this.html += '<div id="projectNavigatorMenuDelete" class="ui-menu-item projectNavigatorMenuItem" data-action="delete"><div style="padding-right: 5px" class="ui-menu-item-label">Delete</div></div>';
  this.html += '</div>';

  this.uiComponent = null;
  this.htmlComponent = null;

  this.visible = false;
  this.callback = false;
}

ProjectNavigatorPopup.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.uiComponent = UI.create("UI.Popup", { "id": "projectNavigatorPopup", "width": 300, "height": 'auto' });

    this.uiComponent.on('close', function() {
      $('.ui-tree-contextselected-row').removeClass('ui-tree-contextselected-row');

    });
    
    this.htmlComponent = UI.create("UI.HTMLPanel", { "html": this.html });
    this.uiComponent.add(this.htmlComponent);
    this.initEvents();
  },


  initEvents: function() {
    var _this = this;

    $('.projectNavigatorMenuItem').on('click', function() {
      var action = $(this).attr('data-action');
      if(_this.callback !== false) {
        _this.callback(action, this.args);
      }
    });

  },

  show: function(x, y, args) {
    var popupWidth = 120;
    var popupHeight = 'auto';
    this.uiComponent.setDimensions(popupWidth, popupHeight);
    UI.showPopup("projectNavigatorPopup", x - 5, y - 5);
    this.visible = true;

    if(typeof args != 'undefined' && typeof args.callback != 'undefined') {
      this.args = args;
      this.callback = args.callback;

    }
  },

  close: function() {
    if(this.visible) {
      UI.hidePopup();
    }
    this.visible = false;
  },

}



var ProjectNavigator = function() {
  this.editor = null;
  this.rootLabel = 'Project';
  this.visible = false;

  this.newDocRecordDialog = null;

  this.treeMap = {};

  this.settings = {};

  this.currentEditor = null;
  this.currentPath = false;

  this.projectNavigatorPopup = null;
  this.renameDialog = null;

  this.prgHandler = 'c64';
  this.cantDelete = ['/color palettes', '/tile sets', '/screens', '/sprites', '/music', '/scripts', '/build'];

}

ProjectNavigator.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.currentEditor = g_app.textModeEditor;
  },

  setPrgHandler: function(handler) {
    if(handler == 'x16' || handler == 'c64') {
      this.prgHandler = handler;
    }
  },

  shareProject: function() {
    alert('share project');
  },

  selectCurrent: function() {
    /*
    if(this.currentPath === false) {
      // ok, current path is not set, try to work out from editor
      var editor = this.currentEditor;
      if(typeof editor.doc !== 'undefined') {

        if(editor.doc == null) {
          // ok, give up..
          return;
        }
        if(editor.doc.type == 'graphic') {
          // ok its prob a screen
          this.currentPath = '/screens/' + editor.doc.name;
        }
      }
    }
    */
    var path = this.getCurrentPath();
    if(path) {
      var doc = g_app.doc.getDocRecord(path);
      if(doc) {
        this.selectNodeWithId(doc.id);
      }
    }
  },

  getVisible: function() {
    return this.visible;
  },

  setVisible: function(visible) {

    if(!g_app.isMobile()) {
      this.visible = visible;
      UI("projectSplitPanel").setPanelVisible('west', this.visible);  
      if(this.visible) {
        g_app.setTabPanelVisible(true);
        this.selectCurrent();
      }
    }
  },

  toggleVisible: function() {
    this.setVisible(!this.visible);
  },

  getCurrentEditor: function() {
    return this.currentEditor;
  },

  getCurrentPath: function() {
    if(this.currentPath === false) {
      // ok, current path is not set, try to work out from editor
      var editor = this.currentEditor;
      if(typeof editor.doc !== 'undefined') {

        if(editor.doc == null) {
          // ok, give up..
          return;
        }
        if(editor.doc.type == 'graphic') {
          // ok its prob a screen
          this.currentPath = '/screens/' + editor.doc.name;
        }
      }
    }

    
    return this.currentPath;
  },
  hide: function() {
    this.visible = false;
    UI("projectSplitPanel").setPanelVisible('west', false);
  },


  updateModifiedList: function() {
    this.modifiedRecords = g_app.doc.getModifiedRecordsList();

    var html = '';

    var modifiedCount = this.modifiedRecords.length;

    var heading = modifiedCount + ' Changed file';
    if(modifiedCount !== 1) {
      heading += 's';
    }  
    $('#githubChangedHeading').html(heading);

    for(var i = 0; i < this.modifiedRecords.length; i++) {
      html += '<div class="githubChangedFile">';
      html += '<img src="images/tree/file.png" style="filter: invert(0.65)"/>';
      html += this.modifiedRecords[i].name;
      html += '</div>';
    }

    $('#githubModified').html(html);

  },

  setGithubRepositoryDetails: function(owner, repository) {

    if(owner === false && repository === false) {

      $('#githubModified').html('');

      $('#projectGithubDetailsCreateHolder').show();

      var html = '';
      $('#projectGithubDetails').html(html);
      $('#projectGithubButtons').hide();
      $('#projectModifiedFiles').hide();

//      $('#projectGithubDetailsHolder').show();
      UI('projectNavigatorSplitPanel').resizeThePanel({ panel: 'north', size: 84 });

    } else {
      var repositoryUrl = 'https://github.com/' + owner + '/' + repository;
      var html = '<div style="display: flex; align-items: center;  height: 24px">';

      html += '<img style="filter: invert(80%); width: 14px; height: 14px; margin: 0 4px" src="icons/GitHub-Mark-64px.png">';
      html += '<a href="' + repositoryUrl + '" target="_blank" style="cursor: pointer; color: #eeeeee; font-size: 11px">' + owner + '/' + repository + '</a>';
      html += '</div>';

      $('#projectGithubDetails').html(html);
      $('#projectGithubButtons').show();
      $('#projectModifiedFiles').show();

      $('#projectGithubDetailsCreateHolder').hide();

      $('#projectGithubDetailsHolder').show();
      UI('projectNavigatorSplitPanel').resizeThePanel({ panel: 'north', size: 140 });

      this.updateModifiedList();

    }
  },

  buildInterface: function(parentPanel) {
    var _this = this;
    var projectNavSplitPanel = UI.create("UI.SplitPanel", { "id": "projectNavigatorSplitPanel"});
    parentPanel.add(projectNavSplitPanel);

    var githubPanel = UI.create("UI.Panel", { "id": "projectGithubPanel" });

    /*
    var titleBarHTML = '';
    
    titleBarHTML += '<div class="title" style="background-color: #111111; height: 28px">';
    
    titleBarHTML += '  <div style="position: absolute; top: 6px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    titleBarHTML += 'Project';
    titleBarHTML += '  </div>';
    titleBarHTML += '  <div style="position: absolute; top: 2px; right: 2px; width: 20px">';  
    titleBarHTML += '    <div id="projectCloseButton" class="ui-button ui-dialog-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>'
    titleBarHTML += '  </div>';
    titleBarHTML += '</div>';
    */

    // repository details


    var githubHTML = '';

    githubHTML += '<div class="title" style="background-color: #111111; height: 24px">';    
    githubHTML += ' <span>Project Explorer</span>';
    githubHTML += '  <div style="position: absolute; top: 2px; right: 2px; width: 20px">';  
    githubHTML += '    <div id="projectCloseButton" class="ui-button ui-dialog-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>'
    githubHTML += '  </div>';
    githubHTML += '</div>';

    
    githubHTML += '<div class="title" style="background-color: #111111; height: 24px; position: relative">';

    githubHTML += '  <div style="position: absolute; top: 6px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    githubHTML += 'GitHub Repository';
    githubHTML += '  </div>';
    

    
   githubHTML += '</div>';


    githubHTML += '<div id="projectGithubDetailsHolder" style="margin-bottom: 6px">';

    githubHTML += '<div id="projectGithubDetailsCreateHolder">';
    githubHTML += '<div class="ui-button" id="projectGithubDetailsCreate" style="margin-top: 4px">';
    githubHTML += '<img style="filter: invert(80%); width: 14px; height: 14px; margin: 0 4px" src="icons/GitHub-Mark-64px.png">'
    githubHTML += 'Create A GitHub Repo</div>';
    githubHTML += '</div>';

    githubHTML += '  <div id="projectGithubDetails">owner/repository</div>';

    githubHTML += '  <div id="projectGithubButtons">';
    githubHTML += '    <div id="projectCommitButton" style="font-size: 9px; line-height: 15px; height: 14px" class="ui-button ui-button-primary">Commit to master</div>';
    githubHTML += '    <div id="projectPullButton" style="font-size: 9px; line-height: 15px; height: 14px" class="ui-button ui-button-primary">Pull Origin</div>';
    githubHTML += '  </div>';

    githubHTML += '  <div id="projectModifiedFiles">';
    githubHTML += '<div id="githubChangedHeading">';
    githubHTML += '</div>';

    githubHTML += '   <div id="githubModified" style="position: absolute; top: 108px; left: 0;right: 0; bottom: 0;" >modified files</div>';
    githubHTML += '  </div>';

    githubHTML += '</div>';
    var githubHTMLPanel = UI.create("UI.HTMLPanel", { "html": githubHTML });
    githubPanel.add(githubHTMLPanel);
    projectNavSplitPanel.addNorth(githubPanel, 160);





    var projectLocalSplitPanel = UI.create("UI.SplitPanel", { "id": "projectLocalSplitPanel"});
    projectNavSplitPanel.add(projectLocalSplitPanel);


    var titleBarHTML = '';

    titleBarHTML += '<div class="title" style="background-color: #111111; height: 24px">';
    
    titleBarHTML += '  <div style="position: absolute; top: 6px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    titleBarHTML += 'Project Files';
    titleBarHTML += '  </div>';
    /*
    titleBarHTML += '  <div style="position: absolute; top: 2px; right: 2px; width: 20px">';  
    titleBarHTML += '    <div id="projectCloseButton" class="ui-button ui-dialog-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>'
    titleBarHTML += '  </div>';
    */
    titleBarHTML += '</div>';

    // new/delete buttons
    titleBarHTML += '<div>';
    titleBarHTML += '<div id="projectAddFileButton" style="font-size: 9px; line-height: 15px; height: 14px" class="ui-button ui-button-primary"><i class="halflings halflings-plus"></i>&nbsp;New...</div>';
    titleBarHTML += '<div id="projectDeleteFileButton" style="font-size: 9px; line-height: 15px; height: 14px" class="ui-button ui-button-danger"><i class="halflings halflings-plus"></i>&nbsp;Delete</div>';
    titleBarHTML += '</div>';


    var titleBar = UI.create("UI.HTMLPanel", { "html": titleBarHTML });
    projectLocalSplitPanel.addNorth(titleBar, 48, false);
    this.tree = UI.create("UI.Tree", { "candrag": false });
//    parentPanel.addWest(this.tree, 200);
    //parentPanel.add(this.tree);
    projectLocalSplitPanel.add(this.tree);

    this.tree.on('nodetoggleclick', function(node) {
      //node.toggle();
    }),

    this.tree.on('nodeclick', function(node) {
      node.select();
/*      
      if(node.getType() == 'folder') {

      } else {
        node.select();
      }
*/
      
    });

    this.tree.on('nodedblclick', function(node) {
      _this.showFile(node, true);
    });

    this.tree.on('nodecontextmenu', function(node, event) {
//      node.select();
      // toggle it back to how it was..
//      node.toggle();


      _this.showContextMenu(event, node);
      event.preventDefault();

    });

    this.tree.on('nodeselect', function(node) {
      _this.showFile(node);
    });

    var root = this.tree.getRootNode();
    this.treeRoot = root.addChild({ 'label': this.rootLabel, "type": 'folder' });

    UI.on('ready', function() {
      root.toggle();
      _this.treeRoot.toggle();
      _this.initEvents();

      _this.setGithubRepositoryDetails(false, false);

    });
  },

  initEvents: function() {
    var _this = this;
    $('#projectCloseButton').on('click', function() {
      _this.hide();
    });

    $('#projectAddFileButton').on('click', function() {
      _this.showNewDocRecordDialog();
    });

    $('#projectCommitButton').on('click', function() {
      g_app.github.save();      
    });

    $('#projectPullButton').on('click', function() {
      g_app.github.doPull();
    });


    $('#projectGithubDetailsCreate').on('click', function() {
      g_app.github.save();
    });
  },

  refresh: function() {
    this.refreshTree();
  },


  selectNodeWithId: function(id) {
    if(this.treeMap.hasOwnProperty(id)) {
      var node = this.treeMap[id];

      // make sure the parents are expanded
      var parent = node.m_parent;
      while(parent !== null) {
        if(parent.m_state != 1) {
          parent.toggle();
        }
        parent = parent.m_parent;
      }
      this.tree.selectNode(node.id);
    }
  },


  initNewRecordDialogContent: function(args) {
    var parentNode = this.tree.getSelectedNode();
    if(typeof args != 'undefined') {
      if(typeof args.node != 'undefined') {
        parentNode = args.node;
      }
    }

    if(parentNode) {
      var nodeType = parentNode.getType();
      if(nodeType != 'folder') {
        parentNode = parentNode.getParentNode();
      }
    }

    if(parentNode == null) {
      this.newDocRecordType = false;
      return false;
    }

    var parentPath = parentNode.getPath();

    var pathStart = '/' + this.rootLabel + '/';
    var pos = parentPath.indexOf(pathStart);
    if(pos >= 0) {
      parentPath = '/' + parentPath.substr(pos + pathStart.length);
    }

    this.parentPath = parentPath;


    var docRecord = g_app.doc.getDocRecord(parentPath);

    // reset the binary dialog
    document.getElementById('newDocBinaryFileForm').reset();
    this.binaryFilesChanged();

    if(docRecord == null) {
      this.newDocRecordType = false;
      return false;
    }
    var parentFolderName = docRecord.name;
    var typeName = '';
    var type = '';
    switch(parentFolderName) {
      case 'color palettes':
        type = 'color palette';
        typeName = 'Color Palette';
      break;
      case 'tile sets':
        type = 'tile set';
        typeName = 'Tile Set';
      break;
      case 'screens':
        type = 'screen';
        typeName = 'Screen';
      break;
      case 'sprites':
        type = 'sprite';
        typeName = 'Sprite';
      break;
      case 'music':
        type ='music';
        typeName = 'Music';
      break;
      case 'asm':
      case 'inc':
        type = 'asm';
        typeName = 'ASM';
      break;
      case 'scripts':
        type = 'script';
        typeName = 'Script';
      break;

      case 'bin':
        type = 'binary';
        typeName = 'Binary';
        
      break;

      case '3d scenes':
        type = '3d scene';
        typeName = '3d scene';
      break;
    }

    $('#newProjectFileName').val("Untitled");
    this.setNewRecordType(type);


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


  createSpriteRecord: function(args, callback) {
    var name = 'Sprite';
    var type = 'graphic';

    if(typeof args != 'undefined') {
      if(typeof args.name != 'undefined') {
        name = args.name;
      }
    }

    var colorPalette = '';
    var colorPaletteId = '';
    var tileSet = 'petscii';
    var screenMode = 'monochrome';

//      var newDocRecordTileSetId = $('#newDocRecordSpriteTileSet').val();
//      var colorPaletteId = $('#newDocRecordSpriteColorPalette').val();
    if(colorPaletteId == '') {
      colorPalette = 'c64_colodore';
    }
      
      
    var tileSetName = 'Sprite Tile Set';
//      var screenMode = $('#newDocRecordSpriteScreenMode').val();

    var width = 1;
    var height = 1;
    var _this = this;

    g_app.textModeEditor.createDoc({
      parentPath: '/sprites',
      name: name,
      gridWidth: width,
      gridHeight: width,
      colorPalette: colorPalette,
      colorPaletteId: colorPaletteId,
      cellWidth: 24,
      cellHeight: 21,
      tileSetArgs: { width: 24, height: 21, name: tileSetName },
      screenMode: screenMode

    }, function(newDocRecord) {

      _this.treeRoot.refreshChildren();
      _this.selectNodeWithId(newDocRecord.id);
      g_app.textModeEditor.setBackgroundColor(g_app.textModeEditor.colorPaletteManager.noColor);

      if(typeof callback != 'undefined') {
        callback(newDocRecord);
      }

    });    
  },

  newFile: function(args) {

    console.log('new file');
    console.log(args);

    
    var parentPath = this.parentPath;
    // make sure parent path is a folder
    var parentRecord = g_app.doc.getDocRecord(parentPath);
    while(parentRecord !== null && parentRecord.type !== 'folder') {
      var lastSlash = parentPath.lastIndexOf('/');
      if(lastSlash === -1) {
        parentRecord = null;      
      } else {
        parentPath = parentPath.substring(0, lastSlash);
        parentRecord = g_app.doc.getDocRecord(parentPath);
      }
    }

    var parentNode = this.tree.getNodeFromPath('/' + this.rootLabel + '/' + parentPath);
    if(parentPath.length == 0 || parentPath[0] != '/') {
      parentPath = '/' + parentPath;
    }
    /*
    var pathStart = '/' + this.rootLabel + '/';
    var pos = parentPath.indexOf(pathStart);
    if(pos >= 0) {
      parentPath = '/' + parentPath.substr(pos + pathStart.length);
    }
    */


    var name = args.filename;
    if(name == '') {
      name = 'Untitled';
    }
    var type = this.newDocRecordType;
    var data = '';

    var parentDocRecord = g_app.doc.getDocRecord(parentPath);

    var extension = '';
    switch(type) {
      case 'asm':
        extension = 'asm';
        break;
      case 'script':
        extension = 'js';
        break;
    }

    var name = this.getUniqueFilename(parentPath + '/', name, extension);
    var _this = this;

//    if(docRecord.name == 'asm' || docRecord.name == 'inc') {
    if(type == 'asm') {

      data = '; asm file';
      var newDocRecord = g_app.doc.createDocRecord(parentPath, name, type, data);
      this.refreshTreeNode(parentDocRecord, parentNode);
      this.treeRoot.refreshChildren();
      this.selectNodeWithId(newDocRecord.id);
    }

    if(type == 'script') {
      data = '// script';
      var newDocRecord = g_app.doc.createDocRecord(parentPath, name, type, data);
      this.refreshTreeNode(parentDocRecord, parentNode);
      this.treeRoot.refreshChildren();
      this.selectNodeWithId(newDocRecord.id);

    }
    
    if(type == 'color palette') {
      var colorPaletteId = g_app.textModeEditor.colorPaletteManager.createColorPalette({ name: "Colour Palette" });

      this.refreshTreeNode(parentDocRecord, parentNode);
      this.reloadTreeBranch('/color palettes');


 

      this.treeRoot.refreshChildren();
    }

    if(type == 'tile set') {
      var name = 'new tile set';//$('#newTileSetName').val();
      var tileCount = 256;//$('#newTileSetCount').val();
      
      var newTileSetId = g_app.textModeEditor.tileSetManager.createTileSet({ name: name, width: 8, height: 8 }); 
  
      var newTileSet = g_app.textModeEditor.tileSetManager.getTileSet(newTileSetId);
      newTileSet.setTileCount(tileCount);

      this.refreshTreeNode(parentDocRecord, parentNode);

      this.reloadTreeBranch('/tile sets');

 

      this.treeRoot.refreshChildren();
      this.selectNodeWithId(newTileSetId);
    }


    if(type == 'screen') {
      type = 'graphic';

      var colorPalette = 'c64_colodore';
      var tileSet = '';

      var newDocRecordTileSetId = $('#newDocRecordGridTileSet').val();
      var colorPaletteId = $('#newDocRecordGridColorPalette').val();

      var width = parseInt($('#newDocRecordGridWidth').val(), 10);
      if(isNaN(width)) {
        width = 40;
      }
      var height = parseInt($('#newDocRecordGridHeight').val(), 10);
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


        _this.refreshTreeNode(parentDocRecord, parentNode);
        _this.reloadTreeBranch('/color palettes');
        _this.reloadTreeBranch('/tile sets');

   

        _this.treeRoot.refreshChildren();
        _this.selectNodeWithId(newDocRecord.id);
      });
    }


    if(type == 'sprite') {

      type = 'graphic';

      var colorPalette = '';
      var tileSet = 'petscii';

      var newDocRecordTileSetId = $('#newDocRecordSpriteTileSet').val();
      var colorPaletteId = $('#newDocRecordSpriteColorPalette').val();
      if(colorPaletteId == '') {
        colorPalette = 'c64_colodore';
      }
      
      
      var tileSetName = 'Sprite Tile Set';
      var screenMode = $('#newDocRecordSpriteScreenMode').val();

      var width = parseInt($('#newDocRecordSpriteGridWidth').val(), 10);
      if(isNaN(width)) {
        width = 1;
      }
      var height = parseInt($('#newDocRecordSpriteGridHeight').val(), 10);
      if(isNaN(height)) {
        height = 1;
      }

      /*
      colorPalette: colorPalette,
      colorPaletteId: colorPaletteId,
      tileSet: '',
      tileSetId: newDocRecordTileSetId,
*/
      g_app.textModeEditor.createDoc({
        parentPath: '/sprites',
        name: name,
        gridWidth: width,
        gridHeight: height,
        colorPalette: colorPalette,
        colorPaletteId: colorPaletteId,
        cellWidth: 24,
        cellHeight: 21,
        tileSet: null,
        tileSetId: newDocRecordTileSetId,
        tileSetArgs: { width: 24, height: 21, name: tileSetName },
        screenMode: screenMode

      }, function(newDocRecord) {

        _this.refreshTreeNode(parentDocRecord, parentNode);        

        var colorDocRecord = g_app.doc.getDocRecord('/color palettes');
        var colorParentNode = _this.tree.getNodeFromPath('/Project/color palettes');
        _this.refreshTreeNode(colorDocRecord, colorParentNode);

        var tileSetsDocRecord = g_app.doc.getDocRecord('/tile sets');
        var tileSetsParentNode = _this.tree.getNodeFromPath('/Project/tile sets');
        _this.refreshTreeNode(tileSetsDocRecord, tileSetsParentNode);

        
        _this.treeRoot.refreshChildren();
        _this.selectNodeWithId(newDocRecord.id);
        g_app.textModeEditor.setBackgroundColor(g_app.textModeEditor.colorPaletteManager.noColor);

      });
    }

    if(type == 'music') {
      var newDocRecord = g_app.music.startNew({ name: name });      
      //g_app.music.show('/music/' + name);

      this.currentEditor = g_app.music;
      _this.refreshTreeNode(parentDocRecord, parentNode);        
      _this.treeRoot.refreshChildren();
      this.selectNodeWithId(newDocRecord.id);
    }



    if(type == 'binary') {
      type = 'bin';
      var files = document.getElementById('newDocRecordBinaryFile').files;

      if(files.length == 0) {
        return;
      }

      var index = 0;
      var file = files[index];
      var name = file.name;

//      for(var i = 0; i < files.length; i++) {
//      var file = document.getElementById('newDocRecordBinaryFile').files[0];
//        var file = files[i];
//        var name = file.name;

        var _this = this;
  //      var reader = new FileReader();
  //      reader.onload = function(e) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var binData = new Uint8Array(e.target.result);
          var data = bufferToBase64(binData);

          var newDocRecord = g_app.doc.createDocRecord(parentPath, name, type, data);
          _this.refreshTreeNode(parentDocRecord, parentNode);
          _this.treeRoot.refreshChildren();
          _this.selectNodeWithId(newDocRecord.id);

          index++;
          if(index < files.length) {
            file = files[index];
            name = file.name;
            reader.readAsArrayBuffer(file);    
          }
        };

        reader.readAsArrayBuffer(file);
//      }

      
    }

    if(type == 'folder') {
      var newDocRecord = g_app.doc.createDocRecord(parentPath, name, 'folder', {});
      this.refreshTreeNode(parentDocRecord, parentNode);
      this.treeRoot.refreshChildren();
      this.selectNodeWithId(newDocRecord.id);


    }

    if(type == '3d scene') {

      var colorPalette = 'c64_colodore';
      var tileSet = 'petscii';

      var newDocRecordTileSetId = $('#newDocRecordGridTileSet').val();
      var colorPaletteId = $('#newDocRecordGridColorPalette').val();

      var width = parseInt($('#newDocRecordGridWidth').val(), 10);
      if(isNaN(width)) {
        width = 40;
      }
      var height = parseInt($('#newDocRecordGridHeight').val(), 10);
      if(isNaN(height)) {
        height = 25;
      }

      var depth = parseInt($('#newDocRecordGridDepth').val(), 10);
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
        _this.refreshTreeNode(parentDocRecord, parentNode);

        _this.treeRoot.refreshChildren();
        _this.selectNodeWithId(newDocRecord.id);
      });      
    }
  },

  setGridTileSets: function() {
    var html = '';
    html += '<option value="">New</option>';
    var tileSets = g_app.doc.dir('/tile sets');
    for(var i = 0; i < tileSets.length; i++) {
      var tileSet = tileSets[i];
      var width = tileSet.data.width;
      var height = tileSet.data.height;

      html += '<option value="' + tileSets[i].id + '">' + tileSets[i].name + '</option>';
    }

    $('#newDocRecordGridTileSet').html(html);
    if(tileSets.length > 0) {
      $('#newDocRecordGridTileSet').val(tileSets[0].id);
    }
  },

  setGridColorPalettes: function() {
    var html = '';
    html += '<option value="">New</option>';
    var colorPalettes = g_app.doc.dir('/color palettes');
    for(var i = 0; i < colorPalettes.length; i++) {
      var colorPalette = colorPalettes[i];

      html += '<option value="' + colorPalette.id + '">' + colorPalette.name + '</option>';
    }

    $('#newDocRecordGridColorPalette').html(html);

    if(colorPalettes.length > 0) {
      $('#newDocRecordGridColorPalette').val(colorPalettes[0].id);
    }

  },


  setSpriteTileSets: function() {
    var requiredWidth = 24;
    var requiredHeight = 21;
    var html = '';
    html += '<option value="">New</option>';
    var tileSets = g_app.doc.dir('/tile sets');
    var tileSetCount = 0;
    var firstTileSetId = false;
    for(var i = 0; i < tileSets.length; i++) {
      var tileSet = tileSets[i];
      var width = tileSet.data.width;
      var height = tileSet.data.height;

      if(width == requiredWidth && height == requiredHeight) {
        tileSetCount++;
        if(firstTileSetId === false) {
          firstTileSetId = tileSets[i].id;
        }
        html += '<option value="' + tileSets[i].id + '">' + tileSets[i].name + '</option>';
      }
    }

    $('#newDocRecordSpriteTileSet').html(html);
    if(tileSetCount > 0) {
      $('#newDocRecordSpriteTileSet').val(firstTileSetId);
    } else {
      $('#newDocRecordSpriteTileSet').val('');      
    }
  },

  setSpriteColorPalettes: function() {
    var html = '';
    html += '<option value="">New</option>';
    var colorPalettes = g_app.doc.dir('/color palettes');
    for(var i = 0; i < colorPalettes.length; i++) {
      var colorPalette = colorPalettes[i];
      html += '<option value="' + colorPalette.id + '">' + colorPalette.name + '</option>';
    }

    $('#newDocRecordSpriteColorPalette').html(html);

    if(colorPalettes.length > 0) {
      $('#newDocRecordSpriteColorPalette').val(colorPalettes[0].id);
    }

  },


  // hide show things based on type
  setNewRecordType: function(type, setDropdown) {

    this.newDocRecordType = type;
    var name = $('#newProjectFileName').val();
//    this.parentPath = '';
    var extension = '';

    var pos = name.lastIndexOf('.');
    if(pos !== -1) {
      name = name.substring(0, pos);
    }

    if(typeof setDropdown == 'undefined' || setDropdown) {
      $('#newDocRecordType').val(type);
    }

    switch(type) {
      case '3d scene':
        this.parentPath = '3d scenes';

        $('#newDocRecordGridDimensions').show();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordGridDimensionsDepth').show();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
        this.setGridTileSets();
        this.setGridColorPalettes();
  
      break;
      case 'screen':
        this.parentPath = 'screens';

        $('#newDocRecordGridDimensions').show();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordGridDimensionsDepth').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
        this.setGridTileSets();
        this.setGridColorPalettes();
      break;
      case 'sprite':
        this.parentPath = 'sprites';

        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').show();
        $('#newDocRecordGridDimensionsDepth').hide();
        $('#newDocRecordSpriteScreenModeGroup').show();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
        this.setSpriteTileSets();
        this.setSpriteColorPalettes();
      break;
      case 'color palette':
        this.parentPath = 'color palettes';
        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
        break;
      case 'tile set':
        this.parentPath = 'tile sets';
        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
        break;
      case 'script':
        this.parentPath = 'scripts';
        extension = 'js';
        break;
      case 'asm':
        if(this.parentPath === false || this.parentPath === '') {
          this.parentPath = 'asm/inc';
        }
        extension = 'asm';
        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();        
        break;
      case 'music':
        this.parentPath = 'music';
        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();
      break;

      case 'binary':
          this.parentPath = 'asm/bin';
          $('#newDocRecordGridDimensions').hide();
          $('#newDocRecordSpriteDimensions').hide();
          $('#newDocRecordSpriteScreenModeGroup').hide();
          $('#newDocRecordBinFileGroup').show();
          $('#newDocRecordDocName').hide();
        break;
      case 'folder':
        var selectedNode = this.tree.getSelectedNode();

        this.parentPath = this.getNodePath(selectedNode);
        $('#newDocRecordGridDimensions').hide();
        $('#newDocRecordSpriteDimensions').hide();
        $('#newDocRecordSpriteScreenModeGroup').hide();
        $('#newDocRecordBinFileGroup').hide();
        $('#newDocRecordDocName').show();  
        break;      
    }

    name = this.getUniqueFilename('/' + this.parentPath + '/', name, extension);
    $('#newProjectFileName').val(name);     


    var selectLength = name.length;

    if(extension != '') {
      var pos = name.lastIndexOf('.');

      if(pos != -1) {
        selectLength = pos;
      }
    }

    var input = document.getElementById('newProjectFileName');  
    input.focus();
    input.setSelectionRange(0, selectLength);
  },

  reloadTreeBranch: function(branch) {
    var docRecord = g_app.doc.getDocRecord(branch);

    var parentNode = this.tree.getNodeFromPath('/Project' + branch);
    this.refreshTreeNode(docRecord, parentNode);    
  },
  
  showNewDocRecordDialog: function(args) {
    var _this = this;
    if(this.newDocRecordDialog == null) {
      var width = 320;
      var height = 296;
      this.newDocRecordDialog = UI.create("UI.Dialog", { "id": "newProjectFileDialog", "title": "New", "width": width, "height": height });

      this.newFileHTML = UI.create("UI.HTMLPanel");
      this.newDocRecordDialog.add(this.newFileHTML);
      this.newFileHTML.load('html/project/newDocRecord.html', function() {
        $('#newDocRecordType').on('change', function() {
          var type = $(this).val();
          _this.setNewRecordType(type, false);
        });
    
        $('#newDocRecordDialog .submitOnEnter').on('keypress', function(e) {
          if(e.key.toLowerCase() == 'enter') {
            _this.submitNewDocRecordDialog();  
          }
        });

        $('#newDocBinaryChooseFiles').on('click', function() {
          document.getElementById('newDocRecordBinaryFile').click();
        });


        $('#newDocRecordBinaryFile').on('change', function() {
          _this.binaryFilesChanged();
        });
    
        
        _this.initNewRecordDialogContent(args);
      });


      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.okButton.on('click', function(event) {
        _this.submitNewDocRecordDialog();
      });
 
      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.newDocRecordDialog.addButton(this.okButton);
      this.newDocRecordDialog.addButton(this.closeButton);
      UI.showDialog("newProjectFileDialog");
    } else {
      UI.showDialog("newProjectFileDialog");
      this.initNewRecordDialogContent(args);      
    }

    // work out whats being created

    /*
    $('#newProjectFileName').focus();
    console.log('select');
    $('#newProjectFileName').select();
*/
  },

  binaryFilesChanged: function() {
    var files = document.getElementById('newDocRecordBinaryFile').files;

    var html = '';

    if(files.length == 0) {
      html += '<div>No files chosen</div>';
    }
    for(var i = 0; i < files.length; i++) {
      var file = files[i];
      var name = file.name;
      html += '<div>';
      html += name;
      html += '</div>';
    }

    $('#newDocBinaryFiles').html(html);


  },
  
  submitNewDocRecordDialog: function() {
    var args = {};
    var parentNode = this.tree.getSelectedNode();
    if(parentNode) {
      var nodeType = parentNode.getType();

      if(nodeType != 'folder') {
        parentNode = parentNode.getParentNode();
      }
    }
    args.filename = $('#newProjectFileName').val().trim();

    if(args.filename == '') {
      alert('Please enter a name');

      $('#newProjectFileName').focus();
      return;
    }
    args.parentNode = parentNode;

    this.newFile(args);

    UI.closeDialog();
  },

  selectDocRecord: function(path) {
    path = path.trim();
    if(path.length > 0 && path[0] != '/') {
      path = '/' + path;
    }
    var record = g_app.doc.getDocRecord(path);
    if(!record) {
      console.log('no record!' + path);
      return false;
    }

    var docRecordId = record.id;
    this.selectNodeWithId(docRecordId);
  },

  showDocRecord: function(path, args) {
    //var doc = g_app.doc;


    if(path == false) {
      return false;
    }

    path = path.trim();
    if(path.length > 0 && path[0] != '/') {
      path = '/' + path;
    }
    var record = g_app.doc.getDocRecord(path);
    if(!record) {
      return false;
    }
        
    var type = record.type;
    var tabKey = record.id;

    if(type !== 'folder') {

      var tabPanel = g_app.tabPanel;

      var tempTab = true;
      var forceReload = false;
      if(typeof args != 'undefined') {
        if(typeof args.tempTab != 'undefined') {
          tempTab = args.tempTab;
        }

        if(typeof args.forceReload != 'undefined') {
          forceReload = args.forceReload;
        }
      }
  
      var tabs = tabPanel.getTabs();

      // find if there is a tab already with this key
      var tabIndex = tabPanel.getTabIndex(tabKey);

      var tempTabIndex = false;
      if(tabIndex === -1) {
        // no existing tab, so find if there is a temp tab
        for(var i = 0; i < tabs.length; i++) {
          if(tabs[i].tab.isTemp === true) {
            //found one
            tempTabIndex = i;
            break;
          }
        }
      }

      var title = '';
      title += '<img height="14" style="height: 14px; margin: 0; padding: 0; border: 0; filter: invert(0.8)" src="images/tree/file.png">';
      title += '&nbsp; ' + record.name;

      // tempTabIndex will be false if there is already a tab
      if(tempTabIndex !== false) {
        // if there is a temp tab, then replace it
        tabPanel.setTabData(tempTabIndex, { key: tabKey, path: path, title: title, isTemp: tempTab} );
        tabPanel.showTab(tabKey);
      } else if(tabIndex !== -1) {
        if(!tempTab) {
          tabPanel.setTabData(tabIndex, {  isTemp: tempTab} );
        }
        tabPanel.showTab(tabKey);
      } else {
        tabPanel.addTab({ key: tabKey,  path: path, title: title, isTemp: tempTab }, true);
      }
    }

    if(this.currentPath === path && !forceReload) {
      // already showing path
      return;
    }
    this.currentPath = path;

    
    switch(type) {
      case 'music':
        g_app.setMode('music');
        g_app.music.show(path);
        this.currentEditor = g_app.music;
        break;
      case 'color palette':
        g_app.setMode('color palette');
        g_app.colorPaletteEditor.load(path);
        this.currentEditor = g_app.colorPaletteEditor;
        break;

      case 'tile set':
        g_app.setMode('tile set');
        g_app.tileSetEditor.load(path);
        this.currentEditor = g_app.tileSetEditor;
        break;
      case 'script':
        g_app.setMode('script');
        g_app.scriptEditor.load(path);
        this.currentEditor = g_app.scriptEditor;
        break;
      case 'json':
          g_app.setMode('json');
          g_app.jsonEditor.load(path);
          this.currentEditor = g_app.jsonEditor;
          break;
      case 'textmode':
      case 'graphic':
        g_app.setMode('2d');
        g_app.textModeEditor.loadScreen(path, this.settings);

        this.currentEditor = g_app.textModeEditor;
        break;
      case '3d scene':
        g_app.setMode('3d');
        g_app.textModeEditor.open3d(path, this.settings);
        this.currentEditor = g_app.textModeEditor;
        break;
      case 'asm':
        g_app.setMode('assembler'); 
        g_app.assemblerEditor.showFile(path, false, this.settings, forceReload);
        // need to resize components as last step
        g_app.assemblerEditor.show();

        this.currentEditor = g_app.assemblerEditor;
        break;
      case 'bin':
        g_app.setMode('hex');
        g_app.hexEditor.load(path);
        this.currentEditor = g_app.hexEditor;
  
        break;
      case 'prg':


          if(this.prgHandler == 'c64') {
            g_app.setMode('c64');
            g_app.c64Debugger.showFile(path);
            this.currentEditor = g_app.c64Debugger;
          }

          if(this.prgHandler == 'x16') {
            g_app.setMode('x16');
            g_app.x16Debugger.showFile(path);
            this.currentEditor = g_app.x16Debugger;
          }
          break;
      default:
          g_app.setMode('text');
          g_app.textEditor.load(path);
          this.currentEditor = g_app.textEditor;
          break;

        return false;
    }

    return true;

  },

  getNodePath: function(treeNode) {
    var path = treeNode.getPath();

    var pathStart = '/' + this.rootLabel + '/';
    var pos = path.indexOf(pathStart);
    if(pos >= 0) {
      path = '/' + path.substr(pos + pathStart.length);
    }

    return path;
  },


  deleteRecord: function(path) {
    if(g_app.doc.deleteDocRecord(path)) {
      // need to get the parent record..
      var slashPos = path.lastIndexOf('/');
      if(slashPos == -1) {
        return;
      }
      var parentPath = path.substring(0, slashPos);
      this.refreshTreeNodeFromPath(parentPath);
      this.treeRoot.refreshChildren();

      // remove tab if it exists

      var tabPanel = g_app.tabPanel;
      // it'll fail if there is no tab..
      tabPanel.closeTab(path);
      
    }
  },

  showRename: function(path) {

    if(this.renameDialog == null) {
      var width = 300;
      var height = 120;

      if(UI.isMobile.any()) {
        height = 220;
        width = 270;
      }
      this.renameDialog = UI.create("UI.Dialog", { "id": "docRecordRenameDialog", "title": "Rename", "width": width, "height": height });


      var html = '<div id="renameDocRecordDialog" class="panelFill dialogContent">';
      html += '  <div class="formGroup">';
      html += '    <label class="controlLabel" for="renameDocRecordName">Name:</label>';
      html += '    <input type="text" class="formControl submitOnEnter" spellcheck="false" id="renameDocRecordName"/>';
      html += '  </div>';
      html += '</div>';
      
      this.renameHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.renameDialog.add(this.renameHTML);

      var _this = this;
      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var newName = $('#renameDocRecordName').val(); 
        _this.renameDocRecord(_this.renamePath, newName);
        UI.closeDialog();
      });

      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });


      this.renameDialog.addButton(okButton);
      this.renameDialog.addButton(closeButton);

      $('#renameDocRecordDialog .submitOnEnter').on('keypress', function(e) {
        if(e.key.toLowerCase() == 'enter') {
          var newName = $('#renameDocRecordName').val(); 
          _this.renameDocRecord(_this.renamePath, newName);
          UI.closeDialog();
  
        }
      });

    }

    var record = g_app.doc.getDocRecord(path);
    if(record) {
      this.renamePath = path;
      var filename = record.name;
      $('#renameDocRecordName').val(filename);
      UI.showDialog("docRecordRenameDialog");    

      $('#renameDocRecordName').focus();

      var dotPos = filename.lastIndexOf('.');
      if(dotPos !== -1) {
        $('#renameDocRecordName')[0].setSelectionRange(0, dotPos);
      } else {
        $('#renameDocRecordName').select();
      }

    }

  },

  renameDocRecord: function(path, newName) {
    var record = g_app.doc.getDocRecord(path);
    
    if(record) {

      var treeNode = this.tree.getNodeFromPath('/Project' + path);
      var parentRecord = record;
      var treeNodeParent = treeNode.getParentNode();
      var parentPath = path;
      var slashIndex = path.lastIndexOf('/');
      if(slashIndex != -1) {
        parentPath = parentPath.substr(0, slashIndex);
        parentRecord = g_app.doc.getDocRecord(parentPath);

      }

      record.name = newName;

      switch(record.type) {
        case 'graphic':
          break;
        case 'tile set':
          var tileSet = g_app.textModeEditor.tileSetManager.getTileSet(record.id);
          if(tileSet) {
            tileSet.nameChanged();
          }
          break;
        case 'color palette':
          var colorPalette = g_app.textModeEditor.colorPaletteManager.getColorPalette(record.id);
          if(colorPalette) {
            colorPalette.nameChanged();
          }
          break;
      }
      this.refreshTreeNode(parentRecord, treeNodeParent);
      this.treeRoot.refreshChildren();    
    }
  },
  
  showContextMenu: function(event, treeNode) {
    var x = event.pageX;
    var y = event.pageY;
  
  
    var rowId = treeNode.m_treeID + 'node' + treeNode.id + 'row';
    $('#' + rowId).addClass('ui-tree-contextselected-row');
    
    if(this.projectNavigatorPopup == null) {
      this.projectNavigatorPopup = new ProjectNavigatorPopup();
      this.projectNavigatorPopup.init(this.editor);
    }
    var path = this.getNodePath(treeNode);

    var record = g_app.doc.getDocRecord(path);
    if(record.type == 'folder') {
      // cant rename folders
      $('#projectNavigatorMenuRename').hide();
      $('#projectNavigatorMenuCreate').show();
    } else {
      $('#projectNavigatorMenuRename').show();
      $('#projectNavigatorMenuCreate').show();
    }

    if(this.cantDelete.indexOf(path) !== -1) {
      $('#projectNavigatorMenuDelete').hide();
    } else {
      $('#projectNavigatorMenuDelete').show();
    }

    var _this = this;

    this.parentPath = path;

    // 3rd argument is passed to the callback
    this.projectNavigatorPopup.show(x, y, {
      path: path,
      callback: function(action, callbackArgs) {
        _this.projectNavigatorPopup.close();
 
        switch(action) {
          case 'rename':
            _this.showRename(path);
            break;
          case 'create':
            _this.showNewDocRecordDialog({ path: path, node: treeNode }); 
            break;
          case 'createfolder':
            _this.showNewDocRecordDialog({ path: path, node: treeNode });
            break;
          case 'delete':
            if(confirm('Are you sure you want to delete?\n\n' + path)) {
              _this.deleteRecord(path);
            }
            break;
        }

      }
    });

  },
  

  showFile: function(treeNode, addTab) {
    var doAddTab = false;
    if(typeof addTab  != 'undefined') {
      doAddTab = addTab;
    }

    var filename = treeNode.getAttribute('filename');
    var path = treeNode.getPath();
    var type = treeNode.getType();

    var pathStart = '/' + this.rootLabel + '/';
    var pos = path.indexOf(pathStart);
    if(pos >= 0) {
      path = '/' + path.substr(pos + pathStart.length);
    }

    if(type !== 'folder' && this.currentEditor) {
      if(typeof this.currentEditor.saveSettings !== 'undefined') {
        this.currentEditor.saveSettings(this.settings);
      }
    }

    if(type == 'folder') {
      treeNode.toggle();  
    } else {

      this.showDocRecord(path, { tempTab: !doAddTab });

    }
  },

  refreshTreeNodeFromPath: function(path) {
    var docNode = g_app.doc.getDocRecord(path);
    var treeNode = this.tree.getNodeFromPath('/Project' + path);
    this.refreshTreeNode(docNode, treeNode);
  },


  refreshTreeNodeChildren(children, treeNode) {
    treeNode.deleteChildren();
//    var children = docNode.children;  

    var docs = [];
    // add to an array then sort
    for(var i = 0; i < children.length; i++) {
      var filename = children[i].name;
      var type = children[i].type;
      var id = children[i].id;
      if(typeof children[i].deleted == 'undefined' || children[i].deleted !== true) {
        docs.push({
          'index': i,
          'label': filename,
          'type': type,
          'attributes': {
            "filename": filename,
            "id": id
          }
        });
      }
    }

    docs.sort(function(a, b) {
      if(a.type != b.type) {
        if(a.type == 'folder') {
          return -1;
        }
        if(b.type == 'folder') {
          return 1;
        }
      }

      return a.label.localeCompare(b.label);
    });


    for(var i = 0; i < docs.length; i++) {
      var node = treeNode.addChild(docs[i]);
      this.treeMap[docs[i]['attributes'].id] = node;
      if(docs[i].type == 'folder' && typeof children[docs[i].index].children != 'undefined') {
        this.refreshTreeNodeChildren(children[docs[i].index].children, node);
      }
    }
  },

  refreshTreeNode: function(docNode, treeNode) {

    if(typeof docNode.children == 'undefined' || !treeNode) {//|| docNode.children.length == 0) {
      return;
    }

    this.refreshTreeNodeChildren(docNode.children, treeNode);

    return;

    treeNode.deleteChildren();
    var children = docNode.children;  

    var docs = [];
    // add to an array then sort
    for(var i = 0; i < children.length; i++) {
      var filename = children[i].name;
      var type = children[i].type;
      var id = children[i].id;
      if(typeof children[i].deleted == 'undefined' || children[i].deleted !== true) {
        docs.push({
          'index': i,
          'label': filename,
          'type': type,
          'attributes': {
            "filename": filename,
            "id": id
          }
        });
      }
    }

    docs.sort(function(a, b) {
      if(a.type != b.type) {
        if(a.type == 'folder') {
          return -1;
        }
        if(b.type == 'folder') {
          return 1;
        }
      }

      return a.label.localeCompare(b.label);
    });

    console.log("SORTED SUB DOCS");
    console.log(docs);

    for(var i = 0; i < docs.length; i++) {
      var node = treeNode.addChild(docs[i]);
      this.treeMap[docs[i]['attributes'].id] = node;
      if(docs[i].type == 'folder') {
        this.refreshTreeNode(children[docs[i].index], node);
      }
    }


    /*
    for(var i = 0; i < children.length; i++) {
      var filename = children[i].name;
      var type = children[i].type;
      var id = children[i].id;
      if(typeof children[i].deleted == 'undefined' || children[i].deleted !== true) {

        var node = treeNode.addChild({
          'label': filename,
          'type': type,
          'attributes': {
            "filename": filename,
            "id": id
          }
        });

        this.treeMap[id] = node;

        if(type == 'folder') {
          this.refreshTreeNode(docNode.children[i], node);
        }
      }
    }

    */
  },

  refreshTree: function(files) {
    if(g_app.doc == null) {
      return;
    }

    this.files = files;
    this.treeRoot.deleteChildren();
    this.treeMap = {};

    var doc = g_app.doc;
    var children = doc.dir('/');


    if(children != null) {
      this.refreshTreeNodeChildren(children, this.treeRoot);
/*
      var treeNode = this.treeRoot;

      var docs = [];
      for(var i = 0; i < children.length; i++) {
        if(children[i].type != 'hiddenfile') {
          var filename = children[i].name;
          var type = children[i].type;
          var id = children[i].id;
          if(typeof children[i].deleted == 'undefined' || children[i].deleted !== true) {
            docs.push({
              'index': i,
              'label': filename, 
              'type': type, 
              'attributes': { "filename": filename, "id": id } 

            });
          }
        }
      }

      docs.sort(function(a, b) {
        if(a.type != b.type) {
          if(a.type == 'folder') {
            return -1;
          }
          if(b.type == 'folder') {
            return 1;
          }
        }
  
        return a.label.localeCompare(b.label);
      });


      console.log("SORTED DOCS:");
      console.log(docs);
  
      for(var i = 0; i < docs.length; i++) {
        var node = treeNode.addChild(docs[i]);
        this.treeMap[docs[i]['attributes'].id] = node;
        if(docs[i].type == 'folder') {
          this.refreshTreeNode(children[docs[i].index], node);
        }
      }
  */
    }

    this.treeRoot.refreshChildren();
  },

  addFile: function(filename, content) {
    this.refreshTree();
  },

}
