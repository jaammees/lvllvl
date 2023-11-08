var ImportCharPad = function() {
  this.editor = null;

  this.characterMaterials = [];
  this.tiles = [];

}

ImportCharPad.prototype = {
  init: function(editor) {
    this.editor = editor;
  },



  doImport: function(args) {
    var importC64CharPadMap = true;
    var importC64CharPadCharacters = true;
    var setColorPerMode = true;
    var importC64CharPadBlocks = true;
    var useBlockMode = true;


    if(typeof args != 'undefined') {
      importC64CharPadMap = args.importC64CharPadMap;
      importC64CharPadCharacters = args.importC64CharPadCharacters;
      setColorPerMode = args.setColorPerMode;
      importC64CharPadBlocks = args.importC64CharPadBlocks;
      useBlockMode = args.useBlockMode;
    }

    
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var graphic = this.editor.graphic;
    graphic.setDrawEnabled(false);


    var tileWidth = this.getTileWidth();
    var tileHeight = this.getTileHeight();
    var tiles = this.getTiles();

    if(!this.getTileSystem() || tiles.length == 0 || (tileWidth === 1 && tileHeight === 1)) {
      useBlockMode = false;

    }

    var screenWidth = this.getScreenWidth();
    var screenHeight = this.getScreenHeight();
    var screenDepth = 1;

    if(importC64CharPadMap) {
      this.editor.graphic.setGridDimensions({ width: screenWidth, height: screenHeight});
    }

    var charData = this.getCharData();

    var tileSet = layer.getTileSet();
    var blockSet = layer.getBlockSet();

    if(importC64CharPadMap) {
      layer.setBackgroundColor(this.getBackgroundColor());
      this.editor.currentTile.setColor(this.getCharColor(), { update: false });
    }


    if(importC64CharPadCharacters) {
      
      tileSet.readBinaryData({ tileData: charData, tileCount: this.getCharCount(), characterWidth: 8, characterHeight: 8 });
      this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });

      if(this.getMulticolorMode()) {
        layer.setC64Multi1Color(this.getC64Multi1Color(), false);
        layer.setC64Multi2Color(this.getC64Multi2Color(), false);
        layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
      } else if(this.getECMMode()) {
        layer.setC64ECMColor(1, this.getC64Multi1Color());
        layer.setC64ECMColor(2, this.getC64Multi2Color());
        layer.setC64ECMColor(3, this.bgColor3);
        layer.setScreenMode(TextModeEditor.Mode.C64ECM);      
      } else {
        layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      
      }

      // set screen mode will turn updates back on..
      graphic.setDrawEnabled(false);

      for(var c = 0; c < this.getCharCount(); c++) {
        var color = this.getCharacterMaterial(c);  
        tileSet.setTileMaterial(c, color);
      }      

      if(this.getColorMethod() == 2) {
        // color per character
        for(var c = 0; c < this.getCharCount(); c++) {
          var color = this.getCharacterColor(c);  
          tileSet.setTileColor(c, color);
        }
        if(setColorPerMode) {
          layer.setColorPerMode('character');
        }
      }

    }



    if(importC64CharPadBlocks) {
      if(this.editor.tools.drawTools.blockPalette) {
        this.editor.tools.drawTools.blockPalette.selectedBlock = false;
        this.editor.tools.drawTools.blockPalette.highlightBlock = false;

        this.editor.sideBlockPalette.highlightBlock = false;
        this.editor.sideBlockPalette.highlightBlock = false;
      }
      blockSet.clear();
      var tiles = this.getTiles();
      
      for(var i = 0; i < tiles.length; i++) {

        blockSet.createBlock({ data: tiles[i]});
      }

      if(setColorPerMode) {
        if(this.getColorMethod() == 1) {
          layer.setColorPerMode('block');

          for(var i = 0; i < tiles.length; i++) {
            var color = this.getTileColor(i);
            blockSet.setBlockColor(i, color);
          }
        }
      }
    }

    if(setColorPerMode) {
      if(this.getColorMethod() == 0) {
        // global color
        var color = this.getCharColor();
        for(var c = 0; c < this.getCharCount(); c++) {
          tileSet.setTileColor(c, color);
        }        
        layer.setColorPerMode('character');
      }
    }


    if(importC64CharPadMap) {

      if(useBlockMode) {
        layer.setBlockDimensions(tileWidth, tileHeight);
        layer.setBlockModeEnabled(true);
      } else {
        layer.setBlockModeEnabled(false);
      }

      this.editor.layers.updateLayerLabel(layer.getId());
      
      this.editor.history.setEnabled(false);

      var args = {};
      
      args.update = false;

      for(var y = 0; y < screenHeight; y++) {
        for(var x = 0; x < screenWidth; x++) {
          args.x = x;
// reverseY          args.y = this.screenHeight - y - 1;
          args.y = y;
          
          args.b = this.getBlockAt(x, y);
          args.t = this.getCharAt(x, y); 
          args.fc = this.getColorAt(x, y);
          args.bc = this.editor.colorPaletteManager.noColor;
          layer.setCell(args);
        }
      }
      this.editor.history.setEnabled(true);
    }

    graphic.setDrawEnabled(true);

    this.editor.gridView2d.findViewBounds();    
    this.editor.graphic.invalidateAllCells();

    this.editor.graphic.redraw({ allCells: true });

    this.editor.tools.drawTools.blockPalette.drawBlockPalette();
    this.editor.sideBlockPalette.drawBlockPalette();
    this.editor.tools.drawTools.tilePalette.drawTilePalette();
    this.editor.sideTilePalette.drawTilePalette();

    this.editor.layers.updateLayerLabel(layer.getId()); 
  },

  readCharPadV7: function(content) {
    console.log('read char pad v7');

    this.tileSystem = false;
    this.expandedData = false;
    this.multiColorMode = false;
    this.ecmMode = false;

    var index = 0;
    this.bgColor = content[4];
    this.multiColor1 = content[5];
    this.multiColor2 = content[6];

    this.bgColor3 = content[7];
    this.charColor = content[8];

    this.colorMethod = content[9];
    this.screenMode = content[10];
    this.multiColorMode = this.screenMode == 1;
    this.ecmMode = this.screenMode == 2;

    this.flags = content[11];
    this.tileSystem = this.flags & 0x1;

    console.log('screen mode = ' + this.screenMode);
    console.log(this.multiColorMode + ',' + this.ecmMode);
    console.log('tile system = ' + this.flags + ',' + this.tileSystem);

    index = 12;

    // character data block
    var b = content[index++];
    if(b != 0xda) {
      console.log('character data block: bad block marker');
      return;
    }
    b = content[index++];
    if(b != 0xb0) {
      console.log('character data block: bad block marker');
      return;
    }

    this.numChars = content[index++] + (content[index++] << 8) + 1;
    console.log('num chars = ' + this.numChars);

    this.tileData = [];
    // char data..
    for(var c = 0; c < this.numChars; c++) {
      for(var row = 0; row < 8; row++) {
        this.tileData.push(content[index++]);
      }
    }    


    // character set attributes block
    b = content[index++];
    if(b != 0xda) {
      console.log('character set attributes block: bad block marker');
      return;
    }
    b = content[index++];
    if(b != 0xb1) {
      console.log('character seta attributes block: bad block marker');
      return;
    }
    

    // character attributes: materials and colours
    this.characterMaterials = [];
    this.characterColors = [];

    for(var c = 0; c < this.numChars; c++) {
      this.characterMaterials.push(content[index] >> 4);
      this.characterColors.push(content[index] & 0xf);
      index++;
    }

    this.numTiles = 0;
    if(this.tileSystem) {
      // tile data block
      b = content[index++];
      if(b != 0xda) {
        console.log('character set attributes block: bad block marker');
        return;
      }

      // block number 0xbn
      b = content[index++];
      /*
      if(b != 0xb1) {
        console.log('character seta attributes block: bad block marker');
        return;
      }
      */

      this.numTiles = content[index++] + (content[index++] << 8) + 1;
      this.tileWidth = content[index++];
      this.tileHeight = content[index++];      
      console.log('num tiles = ' + this.numTiles + ',' + this.tileWidth + ',' + this.tileHeight);  

      // tile data
      for(var t = 0; t < this.numTiles; t++) {
        var tile = [];
        for(var y = 0; y < this.tileHeight; y++) {
          tile.push([]);
          for(var x = 0; x < this.tileWidth; x++) {
            var c = content[index++] + (content[index++] << 8);
            tile[y][x] = { t: c, fc: 0, bc: 0 };
          }
        }
        this.tiles.push(tile);
      }

      // colour per tile
      this.tileColors = [];
      if(this.colorMethod == 1) {
        b = content[index++];
        if(b != 0xda) {
          console.log('tile colours block: bad block marker');
          return;        
        }
        b = content[index++];

        for(var tile = 0; tile < this.numTiles; tile++) {
          this.tileColors.push(content[index++]);
        }
      }


      // tile tags block
      b = content[index++];
      if(b != 0xda) {
        console.log('tile tags block: bad block marker');
        return;
      }
      // block number
      b = content[index++];
      for(var tile = 0; tile < this.numTiles; tile++) {
        var tileTag = content[index++];
      }

      // tile names block
      b = content[index++];
      if(b != 0xda) {
        console.log('tile names block: bad block marker');
        return;
      }
      // block number
      b = content[index++];
      
      // tile names, zero terminated string per tile
      for(var tile = 0; tile < this.numTiles; tile++) {
        var tileName = '';
        while(content[index] != 0) {
          tileName += String.fromCharCode(content[index]);
          index++;
        }
        index++;
      }
    }

    // map data block
    b = content[index++];
    if(b != 0xda) {
      console.log('map data block: bad block marker');
      return;
    }
    // block number
    b = content[index++];

    this.mapWidth = content[index++] + (content[index++] << 8);
    this.mapHeight  = content[index++] + (content[index++] << 8);
    console.log('map width = ' + this.mapWidth + ',' + this.mapHeight);

    this.mapData = [];
    for(var y = 0; y < this.mapHeight; y++) {
      for(var x = 0; x < this.mapWidth; x++) {
        this.mapData.push(content[index++] + (content[index++] << 8));
      }
    }
    


  },

  readCharPad: function(content) {
    if(content[0] != 67 || content[1] != 84 || content[2] != 77) {
      // not a charpad file
      return;
    }

    var index = 3;

    this.tileSystem = false;
    this.expandedData = false;
    this.multiColorMode = false;
    this.ecmMode = false;
    this.characterMaterials = [];
    this.tiles = [];
    this.mapWidth = 40;
    this.mapHeight = 25;
    this.mapData = [];

    this.version = content[3];
    console.log('char pad v' + this.version);

    if(this.version == 7) {
      this.readCharPadV7(content);
      return;
    }

    this.bgColor = content[4];
    this.multiColor1 = content[5];
    this.multiColor2 = content[6];

    console.log('import charpad version ' + this.version);
    if(this.version == 7) {
      this.bgColor3 = content[7];
      this.charColor = content[8];

      this.colorMethod = content[9];
      this.screenMode = content[10];
      this.multiColorMode = this.screenMode == 1;
      this.ecmMode = this.screenMode == 2;

      this.flags = content[11];
      this.tileSystem = this.flags & 0x1;

      console.log('tile system = ' + this.flags + ',' + this.tileSystem);

    } else {

      this.charColor = content[7];

      this.colorMethod = content[8];
      //  (0 = Global, 1 = Per Tile, 2 = Per Character , 3 per tile cell
      if(this.version <= 4 && this.colorMethod == 2) {
        // color per tile cell doesn't exist in v 5
        this.colorMethod = 3;
      }

      this.flags = content[9];
    }


    if(this.version <= 4) {
      this.multiColorMode = this.flags;

    } else if(this.version == 5) {

      this.tileSystem = (this.flags & 0x1) != 0;
      this.expandedData = (this.flags & 0x2) != 0;
      this.multiColorMode = (this.flags & 0x4) != 0;
    } else if(this.version == 6) {
      this.multiColorMode = (this.flags & 0x1) != 0;
      this.tileSystem = (this.flags & 0x2) != 0;
    }

    if(this.version <= 3) {
      this.mapWidth = content[10] + (content[11] << 8);
      this.mapHeight  = content[12] + (content[13] << 8);

      this.numChars = content[14] + (content[15] << 8) + 1;
      this.numTiles = content[16] + 1;
      this.tileWidth = content[17];
      this.tileHeight = content[17];

    } else if(this.version == 4) {
      this.numChars = content[10] + (content[11] << 8) + 1;
      this.numTiles = content[12] + 1;

      this.tileWidth = content[13];
      this.tileHeight = content[14];

      this.mapWidth = content[15] + (content[16] << 8);
      this.mapHeight  = content[17] + (content[18] << 8);

      this.expandedData = content[19];

    } else if(this.version == 5) {

      this.numChars = content[10] + (content[11] << 8) + 1;
      this.numTiles = content[12] + (content[13] << 8) + 1;
      this.tileWidth = content[14];
      this.tileHeight = content[15];

      this.mapWidth = content[16] + (content[17] << 8);
      this.mapHeight  = content[18] + (content[19] << 8);
    }

    if(this.tileWidth == 0 || this.tileHeight == 0) {
      this.expandedData = true;
    }

    var index = 20;
    if(this.version == 4) {
      index = 24;
    }


    if(this.version >= 6) {
      if(this.version == 6) {
        index = 10;
      }
  
      if(this.version == 7) {
        index = 12;
      }
  
      // char data block marker
      if(content[index++] == 0xda && content[index++] == 0xb0) {
        console.log('found char data block marker');
      } else {
        console.log('couldnt find charset attributes block');
      }
      this.numChars = content[index++] + (content[index++] << 8) + 1;
      console.log('num chars = ' + this.numChars);

    }



    this.tileData = [];
    // char data..
    for(var c = 0; c < this.numChars; c++) {
      for(var row = 0; row < 8; row++) {
        this.tileData.push(content[index++]);
      }

      if(this.version == 2) {
        // 9th byte is material group
        index++;
      }
    }


    // character attributes: materials and colours
    this.characterMaterials = [];
    this.characterColors = [];

    if(this.version >= 4) {

      if(this.version >= 6 ) {
        if(content[index++] == 0xda && content[index++] == 0xb1) {
          console.log('found char set attributes block');
        } else {
          console.log('couldnt find charset attributes block');
        }
      }
  
      for(var c = 0; c < this.numChars; c++) {
        this.characterMaterials.push(content[index] >> 4);
        this.characterColors.push(content[index] & 0xf);
        index++;
      }
    }


    
    // tile/cell data
    this.tiles = [];
    if(!this.expandedData && this.tileSystem) {
      if(this.version >= 6) {
        if(content[index++] == 0xda ) {
          var block = content[index++];
          console.log('found tileblock: ' + block);
        } else {
          console.log('couldnt find tile block');
        }

        this.numTiles = content[index++] + (content[index++] << 8) + 1;
        this.tileWidth = content[index++];
        this.tileHeight = content[index++];

        console.log('num tiles = ' + this.numTiles + ',' + this.tileWidth + ',' + this.tileHeight);
  
      }

      // tile data
      for(var t = 0; t < this.numTiles; t++) {
        var tile = [];
        for(var y = 0; y < this.tileHeight; y++) {
          tile.push([]);
          for(var x = 0; x < this.tileWidth; x++) {
            var c = content[index++] + (content[index++] << 8);
            tile[y][x] = { t: c, fc: 0, bc: 0 };
          }
        }
        this.tiles.push(tile);
      }
    }

    if(this.tileSystem && this.expandedData) {
      var charIndex = 0;

      for(var t = 0; t < this.numTiles; t++) {
        var tile = [];
        for(var y = 0; y < this.tileHeight; y++) {
          tile.push([]);
          for(var x = 0; x < this.tileWidth; x++) {
            tile[y][x] = { t: charIndex++, fc: 0, bc: 0 };
          }
        }
        this.tiles.push(tile);
      }
    }

    // tile cell attributes
    this.tileCellColors = [];
    if(this.version == 4 || this.version == 3 || (this.version == 2 && this.colorMethod == 3)) {
      for(var t = 0; t < this.numTiles; t++) {
        var colors = [];
        for(var y = 0; y < this.tileHeight; y++) {
          colors.push([]);
          for(var x = 0; x < this.tileWidth; x++) {
            colors[y][x] = (content[index++] & 0xf);
          }
        }
//        this.tiles.push(tile);
        this.tileCellColors.push(colors);
      }
    }

    // colour per tile
    this.tileColors = [];
    if(this.colorMethod == 1) {
      if(this.version >= 6) {
        if(content[index++] == 0xda ) {
          var block = content[index++];
          console.log('found tile colours block: ' + block);
        } else {
          console.log('couldnt find tile colours block');
        }
      }
      for(var tile = 0; tile < this.numTiles; tile++) {
        this.tileColors.push(content[index++]);
      }
    }

    if(this.tileSystem) {
      if(this.version >= 6) {

        // tile tags, one byte per tile
        if(content[index++] == 0xda ) {
          var block = content[index++];
          console.log('found tile tags block: ' + block);
        } else {
          console.log('couldnt find tile colours block');
        }
        for(var tile = 0; tile < this.numTiles; tile++) {
          var tileTag = content[index++];
        }

        // tile names, zero terminated string per tile
        for(var tile = 0; tile < this.numTiles; tile++) {
          var tileName = '';
          while(content[index] != 0) {
            tileName += String.fromCharCode(content[index]);
            index++;
          }
          index++;
        }
        
      }
    }

    if(this.version >= 6) {
      // tile tags, one byte per tile
      if(content[index++] == 0xda ) {
        var block = content[index++];
        console.log('found map block: ' + block);
      } else {
        console.log('couldnt find map block');
      }

      this.mapWidth = content[index++] + (content[index++] << 8);
      this.mapHeight  = content[index++] + (content[index++] << 8);
      console.log('map width = ' + this.mapWidth + ',' + this.mapHeight);

    }

    this.mapData = [];
    for(var y = 0; y < this.mapHeight; y++) {
      for(var x = 0; x < this.mapWidth; x++) {
        this.mapData.push(content[index++] + (content[index++] << 8));
      }
    }

    console.log(this);

  },

  getVersion: function() {
    return this.version;
  },

  getTileCount: function() {
    return this.numTiles;
  },


  getCharCount: function() {
    return this.numChars;
  },


  getColorMethod: function() {
    return this.colorMethod;
  },
  getCharacterColor: function(c) {
    return this.characterColors[c];
  },

  getCharacterMaterial: function(c) {
    if(c < 0 || c >= this.characterMaterials.length) {
      return 0;
    }
    return this.characterMaterials[c];
  },

  getTileColor: function(t) {
    return this.tileColors[t];
  },

  getTileWidth: function() {
    return this.tileWidth;
  },

  getTileHeight: function() {
    return this.tileHeight;
  },
  getMulticolorMode: function() {
    return this.multiColorMode;
  },
  getECMMode: function() {
    return this.ecmMode;
  },
  getCharData: function() {
    return this.tileData;
  },

  getBackgroundColor: function() {
    return this.bgColor;
  },

  getC64Multi1Color: function() {
    return this.multiColor1;
  },

  getC64Multi2Color: function() {
    return this.multiColor2;
  },

  getCharColor: function() {
    return this.charColor;
  },

  getMapWidth: function() {
    return this.mapWidth;
  },

  getMapHeight: function() {
    return this.mapHeight;
  },

  getTileSystem: function() {
    return this.tileSystem;
  },

  getScreenWidth: function() {
    if(this.tileSystem) {
      return this.mapWidth * this.tileWidth;
    }

    return this.mapWidth;

  },

  getScreenHeight: function() {
    if(this.tileSystem) {
      return this.mapHeight * this.tileHeight;
    }

    return this.mapHeight;
  },

  getTiles: function() {
    return this.tiles;
  },

  getCharAt: function(x, y) {
    if(this.tileSystem) {
      var tileX = Math.floor(x / this.tileWidth);
      var tileY = Math.floor(y / this.tileHeight);
      var index = tileY * this.mapWidth + tileX;
      if(index < 0 || index >= this.mapData.length) {
        return 0;
      }

      var tile = this.mapData[index];
      var tileOffsetX = x % this.tileWidth;
      var tileOffsetY = y % this.tileHeight;

      if(tile >= this.tiles.length || tileOffsetY >= this.tiles[tile].length || tileOffsetX >= this.tiles[tile][tileOffsetY].length) {
        return 0;
      }
      return this.tiles[tile][tileOffsetY][tileOffsetX].t;
    } else {
      var index = y * this.mapWidth + x;
      if(index < 0 || index >= this.mapData.length) {
        return 0;
      }

      return this.mapData[index];
    }

    return 0;
  },

  getBlockAt: function(x, y) {
    if(this.tileSystem) {
      var tileX = Math.floor(x / this.tileWidth);
      var tileY = Math.floor(y / this.tileHeight);
      var index = tileY * this.mapWidth + tileX;
      if(index < 0 || index >= this.mapData.length) {
        return 0;
      }
      return this.mapData[index];
    } else {
      var index = y * this.mapWidth + x;
      if(index < 0 || index >= this.mapData.length) {
        return 0;
      }

      return this.mapData[index];
    }

    return 0;

  },

  getColorAt: function(x, y) {
    if(this.colorMethod == 0) {
      return this.charColor;
    }

    if(this.colorMethod == 1) {
      // color per tile
      var block = this.getBlockAt(x, y);
      return this.getTileColor(block);
    }
    if(this.colorMethod == 2) {
      // colour per character
      var c = this.getCharAt(x, y);
      return this.characterColors[c];
    }
    return 14;
  },

  getScreenData: function(screenData, full, xOff, yOff) {
    var getFull = false;
    if(typeof full !== 'undefined') {
      getFull = full;
    }

    var index = 0;
    var width = 40;
    var height = 25;
    var xOffset = 0;
    var yOffset = 0;
    if(typeof xOff != 'undefined') {
      xOffset = xOff;
    }

    if(typeof yOff != 'undefined') {
      yOffset = yOff;
    }

    if(getFull) {
      if(this.tileSystem) {
        width = this.mapWidth * this.tileWidth;
        height = this.mapHeight * this.tileHeight;
      }
    }
    if(this.tileSystem) {
      if(width > this.mapWidth * this.tileWidth) {
        width = this.mapWidth * this.tileWidth;
      }

      if(height > this.mapHeight * this.tileHeight) {
        height = this.mapHeight * this.tileHeight;
      }
    } else {
      if(width > this.mapWidth) {
        width = this.mapWidth;
      }

      if(height > this.mapHeight) {
        height = this.mapHeight;
      }
    }

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {

        var srcX = x + xOffset;
        var srcY = y + yOffset;

        if(this.tileSystem) {
          var tileX = Math.floor(srcX / this.tileWidth);
          var tileY = Math.floor(srcY / this.tileHeight);
          var tile = this.mapData[tileY * this.mapWidth + tileX];
          var tileOffsetX = srcX % this.tileWidth;
          var tileOffsetY = srcY % this.tileHeight;

/*
console.log(srcX + ',' + srcY + ':' + tileX + ',' + tileY);
console.log(tile + ',' + tileOffsetX + ',' + tileOffsetY);
console.log(this.tiles[tile][tileOffsetY][tileOffsetX]);
*/
          var c = this.tiles[tile][tileOffsetY][tileOffsetX].t;
          screenData[index++] = c;
        } else {
          var c = this.mapData[srcY * this.mapWidth + srcX];
          screenData[index++] = c;
        }


      }
    }
  }

}
