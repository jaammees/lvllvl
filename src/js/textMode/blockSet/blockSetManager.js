var BlockSetManager = function() {
  this.currentBlockSetId = false;
  this.blockSets = {};

  this.blockSizeDialog = null;
}

BlockSetManager.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  initBlockSizeDialogContent: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    var blockWidth = 2;
    var blockHeight = 2;

    this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    if(layer && layer.getType() == 'grid') {
      blockWidth = layer.getBlockWidth();
      blockHeight = layer.getBlockHeight();
    }

    $('#settingsBlockWidth').val(blockWidth);
    $('#settingsBlockHeight').val(blockHeight);

    var colorPerMode = this.editor.getColorPerMode();

    if(colorPerMode === 'cell') {
      colorPerMode = 'block';
    }

    $('#settingsBlockColorMode').val(colorPerMode);
  },

  initBlockSizeDialog: function() {
    var _this = this;

    this.blockSizeDialog = UI.create("UI.Dialog", { "id": "blockSizeDialog", "title": styles.text.blockName + " Size", "width": 280, "height": 168 });

    this.blockSizeHTML = UI.create("UI.HTMLPanel");
    this.blockSizeDialog.add(this.blockSizeHTML);
    this.blockSizeHTML.load('html/textMode/blockSizeDialog.html', function() {
      _this.initBlockSizeDialogContent();
      UI.showDialog("blockSizeDialog");

    });

    this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
    this.blockSizeDialog.addButton(this.okButton);
    this.okButton.on('click', function(event) {
      var width = $('#settingsBlockWidth').val();
      var height = $('#settingsBlockHeight').val();
      var colorMode = $('#settingsBlockColorMode').val();

      if(typeof _this.blockSizeDialogCallback != 'undefined') {
        _this.blockSizeDialogCallback(width, height, colorMode);

      }

      UI.closeDialog();
    });

    this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
    this.blockSizeDialog.addButton(this.closeButton);
    this.closeButton.on('click', function(event) {
      UI.closeDialog();
    });
  },


  showBlockSizeDialog: function(callback) {
    this.blockSizeDialogCallback = callback;
    if(this.blockSizeDialog == null) {
      this.initBlockSizeDialog();
    } else {
      this.initBlockSizeDialogContent();
      UI.showDialog("blockSizeDialog");

    }
  },

  checkBlockMode: function(width, height) {
    // check blockset is compatible with block mode..
    var blockSet = this.getCurrentBlockSet();

    if(!blockSet) {
      console.log("NO BLOCK SET!!!");
      return;
    }

    var blockCount = blockSet.getBlockCount();

    if(blockCount === 0) {
      console.log("CREATING A BLOCK");
      // need to create a block
      var t = this.editor.tileSetManager.blankCharacter;
      var fc = this.editor.currentTile.getColor();
      var bc = this.editor.colorPaletteManager.noColor;

      var data = [];
      for(var y = 0; y < height; y++) {
        data[y] = [];
        for(var x = 0; x < width; x++) {
          data[y].push({ fc: fc, bc: bc, t: t });

        }
      }

      var blockId = blockSet.createBlock({ bc: bc, fc: fc, data: data });
      this.editor.graphic.initFrameBlocks(blockId);

      this.editor.tools.drawTools.blockPalette.selectBlock();
      this.editor.sideBlockPalette.selectBlock();


      return true;
    } else {
      // are the blocks the wrong size?
      var blocks = blockSet.getBlocks();
      var sizeOk = true;
      for(var i = 0; i < blocks.length; i++) {
        if(blocks[i].data.length != height || blocks[i].data[0].length != width) {

          sizeOk = false;
          break;
        }
      }

      if(!sizeOk) {
        if(confirm('Not all blocks are the correct size, proceeding will resize them. Proceed?')) {
          for(var i = 0; i < blocks.length; i++) {
            if(blocks[i].data.length != height || blocks[i].data[0].length != width) {
              blockSet.setBlockDimensions(i, width, height);
            }
          }
          this.editor.graphic.initFrameBlocks(0);
          this.editor.tools.drawTools.blockPalette.selectBlock();
          this.editor.sideBlockPalette.selectBlock();

          return true;


        } else {
          return false;
        }
      }
    }


    // is there at least one block?


  },


  createBlockSet: function(args) {
    var width = 2;
    var height = 2;
    var name = 'Block Set';
    console.error("shoulnd't get here...");

    if(typeof args != 'undefined') {
      if(args.width != 'undefined') {
        width = args.width;
      }

      if(args.height != 'undefined') {
        height = args.height;
      }
    }

    if(typeof args.name != 'undefined') {
      name = args.name;
    }

    var blockSet = g_app.doc.createDocRecord("/block sets", name, "block set", { width: width, height: height, blocks: [] });
    
    this.currentBlockSetId = blockSet.id;
    return blockSet;
  },

  setCurrentBlockSetFromId: function(blockSetId) {
    console.error('set current block set from id!!!');
    var blockSet = g_app.doc.getDocRecordById(blockSetId, "/block sets");
    if(blockSet != null) {

      if(this.currentBlockSet == null) {
        this.currentBlockSet = new BlockSet();
      }
      console.log('set current block size to ' + blockSetId);
      this.currentBlockSetId = blockSetId;
      this.currentBlockSet.init(this.editor, blockSet.name, blockSet.id);
    }


  },


  getCurrentBlockSet: function() {

    // maybe cache it?

    
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return null;
    }
    var path = tileSet.getPath();


    var blockSetsPath = path + '/block sets';
    var blockSets = g_app.doc.getDocRecord(blockSetsPath);    
    if(!blockSets) {
      blockSets = g_app.doc.createDocRecord(path, 'block sets', 'folder', {});
    }


//console.log(blockSets);

    var name = 'block set';
    var blockSetPath = blockSetsPath + '/' + name;
    var blockSet = g_app.doc.getDocRecord(blockSetPath);
    if(!blockSet) {
      blockSet = g_app.doc.createDocRecord(blockSetsPath, name, "block set", {  blocks: [] })
    }

//console.log(blockSet);

    return this.getBlockSet(blockSetPath);

  },


  getBlockSet: function(path) {

    // should be id in case path changes??

    if(this.blockSets.hasOwnProperty(path)) {
      return this.blockSets[path];
    }

    // create it in the doc if not exists
    var blockSet = g_app.doc.getDocRecord(path);
    if(!blockSet) {
      var lastSlash = path.lastIndexOf('/');
      var blockSetsPath = path.substring(0, lastSlash);
      var name = path.substring(lastSlash + 1);
      console.log('create ' + blockSetsPath + ' - ' + name);

      var blockSets = g_app.doc.getDocRecord(blockSetsPath);    
      if(!blockSets) {
        var lastSlash = blockSetsPath.lastIndexOf('/');
        var tileSetPath = blockSetsPath.substring(0, lastSlash);

        blockSets = g_app.doc.createDocRecord(tileSetPath, 'block sets', 'folder', {});
      }

      blockSet = g_app.doc.createDocRecord(blockSetsPath, name, "block set", {  blocks: [] })
    }


    var blockSet = new BlockSet();
    blockSet.init(this.editor, path);
    this.blockSets[path] = blockSet;
    return blockSet;

  },


  getBlockSetOld: function(blockSetId) {

    if(blockSetId === false) {
      return null;
    }


    var blockSet = g_app.doc.getDocRecordById(blockSetId, "/block sets");
    if(blockSet != null) {

      if(this.currentBlockSet == null) {
        this.currentBlockSet = new BlockSet();
      }

      if(this.currentBlockSet.getId() != blockSetId) {
        this.currentBlockSet.init(this.editor, blockSet.name, blockSet.id);
      }

      return this.currentBlockSet;
    }

    return null;

/*
    if(this.blockSets.hasOwnProperty(blockSetId)) {
      return this.blockSets[blockSetId];
    }

    var blockSet = new BlockSet();
    blockSet.init(this.editor, blockSetId);
    this.blockSets[blockSetId] = blockSet;

    return blockSet;
*/

  }
}
