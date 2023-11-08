var BlockSet = function() {
  this.blockSetId = null;
  this.name = '';
  this.editor = null;

  this.defaultWidth = 2;
  this.defaultHeight = 2;

  this.path = '';
}

BlockSet.prototype = {

/*  
  initOld: function(editor, name, blockSetId) {
    this.editor = editor;
    this.blockSetId = blockSetId;
    this.name = name;
    this.docRecord = g_app.doc.getDocRecord('/block sets/' + name);
    if(!this.docRecord) {
      console.log("doc doesn't exist!!!'");
    }
  },
*/
  init: function(editor, path) {
    this.editor = editor;
    this.path = path;
  },

  getDocRecord: function() {
    return g_app.doc.getDocRecord(this.path);

  },

  createBlock: function(args) {
    var data = [];

    var block = {};
    block.colorMode = 'none';
    block.fc = 0;
    block.bc = 0;


    if(typeof args != 'undefined') {
      if(typeof args.colorMode != 'undefined') {
        block.colorMode = args.colorMode;
      }

      if(typeof args.fc != 'undefined') {
        block.fc = args.fc;
      }
      if(typeof args.bc != 'undefined') {
        block.bc = args.bc;
      }

      if(typeof args.data != 'undefined') {
        data = args.data;
      }
    }

    block.data = [];
    for(var y = 0; y < data.length; y++) {
      block.data[y] = [];
      for(var x = 0; x < data[y].length; x++) {
        block.data[y][x] = {};
        for(var key in data[y][x]) {
          block.data[y][x][key] = data[y][x][key];
        }
      }
    }

    /*
    // TODO: put in some checks on blockDataSrc??
    var blockData = [];
    for(var i =0 ; i < blockDataSrc.length; i++) {
      blockData.push([]);
      for(var j = 0; j < blockDataSrc[i].length; j++) {
        blockData[i].push(blockDataSrc[i][j]);
      }
    }
*/
    this.docRecord = this.getDocRecord();
    if(this.docRecord) {
      var blockId = this.docRecord.data.blocks.length;
      this.docRecord.data.blocks.push(block);

      return blockId;
    }


    return false;
  },

  getBlockCount: function() {
    this.docRecord = this.getDocRecord();
    if(!this.docRecord) {
      return;
    }

    return this.docRecord.data.blocks.length;
  },

  setBlockCount: function(blockCount) {
    if(blockCount < this.docRecord.data.blocks.length) {
      this.docRecord.data.blocks.length = blockCount;
    }

  },


  setBlock: function(blockId, args) {
    this.docRecord = this.getDocRecord();
    if(!this.docRecord) {
      return;
    }
/*
    var blockData = [];
    for(var i =0 ; i < blockDataSrc.length; i++) {
      blockData.push([]);
      for(var j = 0; j < blockDataSrc[i].length; j++) {
        blockData[i].push(blockDataSrc[i][j]);
      }
    }
*/
    var block = this.docRecord.data.blocks[blockId];


    if(typeof args != 'undefined') {
      if(typeof args.colorMode != 'undefined') {
        block.colorMode = args.colorMode;
      }

      if(typeof args.fc != 'undefined') {
        block.fc = args.fc;
      }
      if(typeof args.bc != 'undefined') {
        block.bc = args.bc;
      }

      if(typeof args.data != 'undefined') {
        var data = args.data;
        block.data = [];
        for(var y = 0; y < data.length; y++) {
          block.data[y] = [];
          for(var x = 0; x < data[y].length; x++) {
            block.data[y][x] = {};
            for(var key in data[y][x]) {
              block.data[y][x][key] = data[y][x][key];
            }
          }
        }
      }
    }


//    this.docRecord.data.blocks[blockId] = blockData;
  },

  setCharacterInBlock: function(blockId, x, y, character) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return;
    }
    var data = this.docRecord.data.blocks[blockId].data;

    // record the action
    var params = { 
                   "x": x, "y": y, "b": blockId,
                   "oldCharacter": data[y][x].t,
                   "newCharacter": character
                 };

    data[y][x].t = character;

    this.editor.history.addAction("setBlockCell", params);

  },

  setBlockDimensions: function(blockId, width, height) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return;
    }
    var cells = this.docRecord.data.blocks[blockId].data;


    var newCells = [];
    var blankCharacter = this.editor.tileSetManager.blankCharacter;

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    for(var y = 0; y < height; y++) {
      newCells.push([]);
      for(var x = 0; x < width; x++) {
        var cell = {};
        if(y < cells.length && x < cells[y].length) {        
          for(var key in cells[y][x]) {
            if(cells[y][x].hasOwnProperty(key)) {
              cell[key] = cells[y][x][key];
            }
          }
        } else {
          cell = { t: blankCharacter, fc: fc, bc: bc, fh: 0, fv: 0, rz: 0 };
        }

        newCells[y].push(cell);
      }
    }

    this.docRecord.data.blocks[blockId].data = newCells;
  },

  getCharacterInBlock: function(blockId, x, y) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return this.editor.tileSetManager.blankCharacter;
    }

    if(typeof this.docRecord.data.blocks[blockId] == 'undefined') {
      return this.editor.tileSetManager.blankCharacter;
    }

    if(y < this.docRecord.data.blocks[blockId].data.length && x < this.docRecord.data.blocks[blockId].data[y].length) {
      return this.docRecord.data.blocks[blockId].data[y][x].t;
    }

    return this.editor.tileSetManager.blankCharacter;
  },


  getBlockColor: function(blockId) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord || typeof this.docRecord.data.blocks[blockId] == 'undefined') {
      return 0;
    }

    return this.docRecord.data.blocks[blockId].fc;
  },

  setBlockColor: function(blockId, color) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord || typeof this.docRecord.data.blocks[blockId] == 'undefined') {
      return 0;
    }

    this.docRecord.data.blocks[blockId].fc = color;

  },

  getBlockBGColor: function(blockId) {
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord || typeof this.docRecord.data.blocks[blockId] == 'undefined') {
      return this.editor.colorPaletteManager.noColor;
    }

    return this.docRecord.data.blocks[blockId].bc;

  },

  getBlockData: function(blockId) {
    this.docRecord = this.getDocRecord();//g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return [];
    }

    if(blockId < this.docRecord.data.blocks.length) {
      return this.docRecord.data.blocks[blockId];
    }

    return [];

  },



  clear: function() {
    this.docRecord = this.getDocRecord();//g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return;
    }

    this.docRecord.data.blocks = [];
  },


  getBlocks: function() {

    this.docRecord = this.getDocRecord();//g_app.doc.getDocRecord('/block sets/' + this.name);
    if(!this.docRecord) {
      return [];
    }

    return this.docRecord.data.blocks;
  },



  getWidth: function() {
    console.error('get block width');
    return this.defaultWidth;
  },

  getHeight: function() {
    console.error('get block height!');
    return this.defaultHeight;
  },

  getId: function() {
    console.error('get block id!');
    return this.blockSetId;
  }
}