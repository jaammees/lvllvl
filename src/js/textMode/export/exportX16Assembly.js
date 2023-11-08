/*
tile modes:

text:
1 bit per pixel

graphics
2bpp
4bpp
8bpp

map has 2 bytes per tile
first: tile index
second: color index
or second: palette offset | flip v | flip h | upper 2 bits of tile index

*/

var ExportX16Assembly = function() {
  this.editor = null;
  this.asmEditor = null;  

  this.lineEnding = '\r\n';
  this.columns = 16;
}

ExportX16Assembly.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  formatBytes: function(bytes, args) {
    var hex = args.numberFormat != 'dec';

    var byteLabel = this.getByteLabel(args);
    var lineEnding = this.lineEnding;
    var column = 0;
    var columns = 16;


    var data = '';
    for(var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      if(column !== 0) {
        data += ',';
      } else {
        data += byteLabel;
      }

      if(hex) {
        data += '$';
        data += ("00" + b.toString(16)).substr(-2);   
      } else {
        data += b.toString(10);
      }
      column++;

      if(column == columns) {
        column = 0;
        data += lineEnding;
      }

    }
    return data;
  },

  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportX16AssemblyDialog", "title": "Export Assembly", "width": 840, "height": 600 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportX16Assembly.html', function() {
        _this.initContent();
        _this.initEvents();
      });


      this.htmlComponent.on('resize', function() {
        if(_this.asmEditor && _this.asmEditor.resize) {
          _this.asmEditor.resize();
        }
      });


      this.displayButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"/> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.displayButton);
      this.displayButton.on('click', function(event) {
        //UI.closeDialog();
        _this.copyToClipboard();
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

    } else {
      this.initContent();
    }

    UI.showDialog("exportX16AssemblyDialog");
  },  


  toHex: function(value) {
    return ("0000" + value.toString(16)).substr(-4); 
  },

  initContent: function() {

    if(this.asmEditor == null) {
      this.asmEditor = ace.edit("exportX16AssemblySource");
      this.asmEditor.getSession().setTabSize(2);
      this.asmEditor.getSession().setUseSoftTabs(true);
      this.asmEditor.on('focus', function() {
        g_app.setAllowKeyShortcuts(false);
        UI.setAllowBrowserEditOperations(true);
      });

      this.asmEditor.on('blur', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });
      var mode = 'ace/mode/assembly_6502';
      if(this.mode == 'javascript') {
        mode = 'ace/mode/javascript';
      }
      this.asmEditor.getSession().setMode(mode);//"ace/mode/assembly_6502");
      this.asmEditor.setShowInvisibles(false);
    }


    // should get from layer?
    this.colorPerMode = this.editor.getColorPerMode();
    this.blockModeEnabled = this.editor.getBlockModeEnabled();

    $('#exportX16AssemblyAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportX16AssemblyToFrame').val(frameCount);
    $('#exportX16AssemblyFromFrame').val(1);

    $('#exportX16AssemblyFromFrame').attr('max', frameCount);
    $('#exportX16AssemblyToFrame').attr('max', frameCount);

    switch(this.colorPerMode) {
      case 'character':

        $('#exportX16AssemblyColorDataHolder').show();
        $('#exportX16AssemblyMapColorData').hide();
      break;
      case 'cell':
//        $('#exportX16AssemblyColorDataHolder').hide();
        $('#exportX16AssemblyColorDataHolder').show();
        $('#exportX16AssemblyMapColorData').show();
      break;
      case 'block':
        $('#exportX16AssemblyColorDataHolder').show();
//          $('#exportX16AssemblyColorDataHolder').hide();
        $('#exportX16AssemblyMapColorData').hide();

      break;
    }


    if(this.blockModeEnabled) {
      $('#exportX16AssemblyBlockMapDataHolder').show();

      if(this.colorPerMode == 'block') {
        $('#exportX16AssemblyBlockColorDataHolder').show();
      } else {
        $('#exportX16AssemblyBlockColorDataHolder').hide();        
      }

      $('#exportX16AssemblyMapData').prop('checked', false);

    } else {
      $('#exportX16AssemblyBlockMapDataHolder').hide();
      $('#exportX16AssemblyBlockColorDataHolder').hide();
      $('#exportX16AssemblyBlockDataHolder').hide();
    }


    this.exportX16Assembly({ displayOnly: true });

  },

  initEvents: function() {
    var _this = this;

    $('input[name=exportX16AssemblyFormat]').on('click', function() {
      _this.exportX16Assembly({ displayOnly: true });
    });

    $('input[name=exportX16NumberFormat]').on('click', function() {
      _this.exportX16Assembly({ displayOnly: true });
    });

    $('.exportX16AssemblyInclude').on('click', function() {
      _this.exportX16Assembly({ displayOnly: true });
    });

    $('#exportX16AssemblyFromFrame').on('change', function() {
      _this.exportX16Assembly({ displayOnly: true });
    });

    $('#exportX16AssemblyToFrame').on('change', function() {
      _this.exportX16Assembly({ displayOnly: true });
    });

    $('#exportX16AssemblyDownload').on('click', function() {
      //_this.exportX16Assembly({});
      _this.download();
    });


  },



  copyToClipboard: function() {
    var sel = this.asmEditor.selection.toJSON(); // save selection
    this.asmEditor.selectAll();
    this.asmEditor.focus();
    document.execCommand('copy');
    this.asmEditor.selection.fromJSON(sel); // restore selection  
  },

  getByteLabel: function(args) {
    var byteLabel = '!byte ';
    if(args.format == 'kickass' || args.format == 'ca65' || args.format == 'tass') {
      byteLabel = '.byte ';
    }

    if(args.format == 'acme') {
      byteLabel = '!byte ';
    }
    return byteLabel;
  },

  getCommentSymbol: function(args) {
    var commentSymbol = ';';
    if(args.format == 'kickass') {
      commentSymbol = '//';
    }

    return commentSymbol;
  },

  getConstSymbol: function(args) {
    var constSymbol = '';
    if(args.format == 'kickass') {
      constSymbol = '.label ';
    }

    return constSymbol;
  },

  getSetPCSymbol: function(args) {
    var setPCSymbol = '* = ';

    if(args.format == 'ca65') {
      setPCSymbol = '.ORG ';
    }

    return setPCSymbol;
  },

  getLabelPostfix: function(args) {
    var labelPostfix = '';
    if(args.format == 'kickass' || args.format == 'ca65') {
      labelPostfix = ':';
    }

    return labelPostfix;
  },

  // get
  getBlockMapData: function(args, format) {
    var layer = this.editor.layers.getSelectedLayerObject();

    var fromFrame = 1;
    var toFrame = 1;

    if(typeof args != 'undefined') {
      if(typeof args.fromFrame != 'undefined') {
        fromFrame = args.fromFrame;
      }
      if(typeof args.toFrame != 'undefined') {
        toFrame = args.toFrame;
      }
    }

    var hex = args.numberFormat != 'dec';
    
    var tileSet = layer.getTileSet();
    var charCount = tileSet.getTileCount();
    var charSetSize = charCount * 8;

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    var blockCount  = 0;
    var blockWidth = 0;
    var blockHeight = 0;

    if(blockSet) {
      blockCount = blockSet.getBlockCount();
      blockWidth = layer.getBlockWidth();
      blockHeight = layer.getBlockHeight();
    }
    var blockSetSize = blockCount * blockWidth * blockHeight;


    var byteLabel = this.getByteLabel(args);

    var exportFormat = 'text';
    if(typeof format != 'undefined') {
      exportFormat = format;
    }

    var textData = '';
    var arrayData = [];
    var index = 0;

    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      var column = 0;
      if(frameIndex >= layer.getFrameCount() ) {
        break;
      }

      var index = 0;
      column = 0;

//          var yStart = gridHeight - 1;
//          var yLimit = -1;
//          var yIncrement = -blockHeight;

      var yStart = 0;
      var yLimit = gridHeight;
      var yIncrement = blockHeight;
      var xIncrement = blockWidth;

      for(var y = yStart; y < yLimit; y += yIncrement) {
        for(var x = 0; x < gridWidth; x += xIncrement) {

          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          var block = cellData.b;
          if(typeof block == 'undefined') {
            block = 0;
          }

          if(exportFormat == 'text') {
            if(column !== 0) {
              textData += ',';
            } else {
              textData += byteLabel;
            }

            /*
            if(x !== 0) {
              screenData += ',';
            }
            */

            if(hex) {
              textData += '$';
              textData += ("00" + block.toString(16)).substr(-2);   
            } else {
              textData += block.toString(10);
            }

            column++;

            if(column == this.columns) {
              column = 0;
              textData += this.lineEnding;
            }
          }

          if(exportFormat == 'binary') {
            arrayData[index] = block;
          }

          index++;
        }
//            screenData += '\r\n';
      }

      textData += this.lineEnding + this.lineEnding;


      var frameNumber = frameIndex + 1;
//          var layerNumber = z + 1;
    }
    if(exportFormat == 'text') {
      return textData;
    }

    if(exportFormat == 'binary') {
      return new Uint8Array(arrayData);
    }
  },

  // get the characters in each block
  getBlockSetData: function(args, format) {
    var layer = this.editor.layers.getSelectedLayerObject();

    var tileSet = layer.getTileSet();
    var charCount = tileSet.getTileCount();
    var charSetSize = charCount * 8;

    var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    var blockCount  = 0;
    var blockWidth = 0;
    var blockHeight = 0;

    if(blockSet) {
      blockCount = blockSet.getBlockCount();
      blockWidth = layer.getBlockWidth();
      blockHeight = layer.getBlockHeight();
    }

    var blockSetSize = blockCount * blockWidth * blockHeight;

    var hex = args.numberFormat != 'dec';
    var screenMode = layer.getScreenMode();
    var isECM = screenMode === TextModeEditor.Mode.C64ECM;
    var colorPerMode = layer.getColorPerMode();


    var byteLabel = this.getByteLabel(args);

    var exportFormat = 'text';
    if(typeof format != 'undefined') {
      exportFormat = format;
    }

    var textData = '';
    var column = 0;
    var arrayData = [];


    var column = 0;
    var index = 0;
    for(var b = 0; b < blockCount; b++) {
      for(var y = 0; y < blockHeight; y++) {
        for(var x = 0; x < blockWidth; x++) {
          var tileId = blockSet.getCharacterInBlock(b, x, y);

          if(isECM) {
            var bc = blockSet.getBlockBGColor(b);
            if(colorPerMode == 'character') {
              bc = tileSet.getTileBGColor(c) & 0xf;
            }
            tileId = tileId & 0x3f;

            switch(bc) {
              /*
              case this.editor.colorPaletteManager.noColor:
              case 0:
              break;
              */
              case 1:
                tileId = tileId | 0x40;
              break;
              case 2:
                tileId = tileId | 0x80;
              break;
              case 3:
                tileId = tileId | 0xc0;
              break;
            }

          }

          if(exportFormat == 'text') {
            if(column !== 0) {
              textData += ',';
            } else {
              textData += byteLabel;
            }

            if(hex) {
              textData += '$';
              textData += ("00" + tileId.toString(16)).substr(-2);   
            } else {
              textData += tileId.toString(10);
            }

            column++;

            if(column == this.columns) {
              column = 0;
              textData += this.lineEnding;
            }
          }

          if(exportFormat == 'binary') {
            arrayData[index] = tileId;
          }

          index++;

        }
      }
    }    

    if(exportFormat == 'text') {
      return textData;
    }

    if(exportFormat == 'binary') {
      return new Uint8Array(arrayData);
    }
  },


  getBlockColorData: function(args, format) {
    var layer = this.editor.layers.getSelectedLayerObject();

    var tileSet = layer.getTileSet();
    var charCount = tileSet.getTileCount();
    var charSetSize = charCount * 8;

    var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    var blockCount  = 0;
    var blockWidth = 0;
    var blockHeight = 0;

    if(blockSet) {
      blockCount = blockSet.getBlockCount();
      blockWidth = layer.getBlockWidth();
      blockHeight = layer.getBlockHeight();
    }
    var blockSetSize = blockCount * blockWidth * blockHeight;


    var hex = args.numberFormat != 'dec';

    var byteLabel = this.getByteLabel(args);

    var exportFormat = 'text';
    if(typeof format != 'undefined') {
      exportFormat = format;
    }

    var textData = '';
    var column = 0;
    var arrayData = [];


    var column = 0;
    var index = 0;

    for(var i = 0; i < blockCount; i++) {
      var color = blockSet.getBlockColor(i);

      if(exportFormat == 'text') {
        if(column !== 0) {
          textData += ',';
        } else {
          textData += byteLabel;
        }

        if(hex) {
          textData += '$';
          textData += ("00" + color.toString(16)).substr(-2);   
        } else {
          textData += color.toString(10);
        }

        column++;

        if(column == this.columns) {
          column = 0;
          textData += this.lineEnding;
        }
      }

      if(exportFormat == 'binary') {
        arrayData[index] = color;
      }

      index++;
    }
    if(exportFormat == 'text') {
      return textData;
    }

    if(exportFormat == 'binary') {
      return new Uint8Array(arrayData);
    }
  },

  getLayerFromPath: function(args) {
    var layerId = false;    
    var graphicRecord = g_app.doc.getDocRecord(args.path);

    if(graphicRecord) {
      if(typeof args.layerId === 'undefined') {
        var layers = graphicRecord.data.layers;
        console.log(layers);
        if(layers.length > 0) {
          layerId = layers[0].layerId;          
        }
      }
      layer = new LayerGrid();
      layer.connectToDoc({ editor: this.editor, doc: graphicRecord, layerId: layerId });
      console.log(layer);
      console.log('layer id = ' + layerId);
    }
  },

  // get the map data with characters
  getCharMapData: function(args, format) {
    var layer = null;

    if(typeof args !== 'undefined') {
      if(typeof args.path !== 'undefined') {
        layer = this.getLayerFromPath(args);
      }
    }

    if(layer === null) {
      layer = this.editor.layers.getSelectedLayerObject();
    }

    if(layer.getType() !== 'grid') {
      return;
    }

    var exportFormat = 'text';
    if(typeof format != 'undefined') {
      exportFormat = format;
    }


    var column = 0;

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var fromFrame = 1;
    var toFrame = 1;

    var byteArray = [];

    if(typeof args != 'undefined') {
      if(typeof args.fromFrame != 'undefined') {
        fromFrame = args.fromFrame;
      }
      if(typeof args.toFrame != 'undefined') {
        toFrame = args.toFrame;
      }
    }

    
    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      if(frameIndex >= layer.getFrameCount()) {
        break;
      }

      column = 0;

      var yStart = 0;
      var yLimit = gridHeight;
      var yIncrement = 1;

      // byte 1: tile index
      // byte 2: color (in 1bpp mode)
      //       : palette offset | flip v | flip h | upper 2 bits of tile index

      for(var y = yStart; y != yLimit; y += yIncrement) {
        for(var x = 0; x < gridWidth; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          var tileId = cellData.t;

          // byte 1 is tile index
          byteArray.push(tileId & 0xff);

          var b2 = (tileId >> 8) & 0x3;

          if(cellData.fh) {
            b2 = b2 | 0x4;
          }
          if(cellData.fv) {
            b2 = b2 | 0x8;
          }
          byteArray.push(b2);
        }
      }
    }

    if(exportFormat == 'text') {
      return this.formatBytes(byteArray, args);;
    }

    if(exportFormat == 'binary') {
      return new Uint8Array(byteArray);
    }
  },


  exportX16Format: function(args) {
    var columns = 16;
    this.columns = 16;
    var extension = '.txt';

    var exportColorPalette = (typeof args.exportColorPalette === 'undefined') ? true : args.exportColorPalette;
    var exportTileSet = true;
    var exportCharacterColorData = true;
    var exportBlockData = true;
    var exportBlockMap = true;
    var exportCharMap = false;
    var exportBlockColorData = true;
    var exportCharMapColorData = false;

    if(typeof args.exportTileSet != 'undefined') {
      exportTileSet = args.exportTileSet;
    }

    if(typeof args.exportCharacterColorData != 'undefined') {
      exportCharacterColorData = args.exportCharacterColorData;
    }

    if(typeof args.exportBlockData != 'undefined') {
      exportBlockData = args.exportBlockData;
    }

    if(typeof args.exportBlockColorData != 'undefined') {
      exportBlockColorData = args.exportBlockColorData;
    }

    if(typeof args.exportBlockMap != 'undefined') {
      exportBlockMap = args.exportBlockMap;
    }

    if(typeof args.exportCharMap != 'undefined') {
      exportCharMap = args.exportCharMap;
    }


    if(typeof args.exportCharMapColorData != 'undefined') {
      exportCharMapColorData = args.exportCharMapColorData;
    }

    var lineEnding = '\r\n';
    var byteLabel = this.getByteLabel(args);
    var commentSymbol = this.getCommentSymbol(args);
    var constSymbol = this.getConstSymbol(args);
    var labelPostfix = this.getLabelPostfix(args);
    var setPCSymbol = this.getSetPCSymbol(args);



//    var zip = new JSZip();


    var screenData = '';

    var tileSetManager = this.editor.tileSetManager;

    var layer = this.editor.layers.getSelectedLayerObject();

    if(layer && layer.getType() == 'grid') {

      if(!layer.getBlockModeEnabled()) {
        exportBlockMap = false;
      }

      var gridWidth = layer.getGridWidth();
      var gridHeight = layer.getGridHeight();

      var tileSet = layer.getTileSet();
      var charCount = tileSet.getTileCount();
      var charSetSize = charCount * 8;

      var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockCount  = 0;
      var blockWidth = 0;
      var blockHeight = 0;

      var hex = args.numberFormat != 'dec';

      if(blockSet) {
        blockCount = blockSet.getBlockCount();
        blockWidth = layer.getBlockWidth();
        blockHeight = layer.getBlockHeight();
      }
      var blockSetSize = blockCount * blockWidth * blockHeight;

      var backgroundColor = layer.getBackgroundColor();
      var borderColor = layer.getBorderColor();

      screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR = ' + backgroundColor + lineEnding;
      screenData += constSymbol + 'SCREEN_BORDER_COLOUR = ' + borderColor + lineEnding;
      if(args.screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
        var multi1 = layer.getC64Multi1Color();
        var multi2 = layer.getC64Multi2Color();
        screenData += constSymbol + 'CHAR_MULTICOLOUR_MODE = 1' + lineEnding;
        screenData += constSymbol + 'COLOUR_CHAR_MC1 = ' + multi1 + lineEnding;
        screenData += constSymbol + 'COLOUR_CHAR_MC2 = ' + multi2 + lineEnding;
      } else {
        screenData += constSymbol + 'CHAR_MULTICOLOUR_MODE = 0' + lineEnding;
      }

      if(exportTileSet) {
        screenData += constSymbol + 'CHAR_COUNT = ' + charCount +  lineEnding;
      }

      if(exportBlockData) {
        screenData += constSymbol + 'TILE_COUNT = ' + blockCount + lineEnding;
        screenData += constSymbol + 'TILE_WIDTH = ' + blockWidth + lineEnding;
        screenData += constSymbol + 'TILE_HEIGHT = ' + blockHeight + lineEnding;
      }

      var mapWidth = 0;
      var mapHeight = 0;

      if(exportBlockMap && blockWidth != 0 && blockHeight != 0) {
        mapWidth = Math.ceil(gridWidth / blockWidth);
        mapHeight = Math.ceil(gridHeight / blockHeight);

        screenData += constSymbol + 'MAP_WID = ' + mapWidth + lineEnding;
        screenData += constSymbol + 'MAP_HEI = ' + mapHeight + lineEnding;
      }

      var blockMapSize = mapWidth * mapHeight;
      var charMapSize = gridWidth * gridHeight;

      if(exportBlockMap || exportCharMap) {
        var charMapWidth = gridWidth;
        var charMapHeight = gridHeight;
        var pixelWidth = charMapWidth * 8;
        var pixelHeight = charMapHeight * 8;

        screenData += constSymbol + 'MAP_WID_CHRS = ' + charMapWidth + lineEnding;
        screenData += constSymbol + 'MAP_HEI_CHRS = ' + charMapHeight + lineEnding;
        screenData += constSymbol + 'MAP_WID_PXLS = ' + pixelWidth + lineEnding;
        screenData += constSymbol + 'MAP_HEI_PXLS = ' + pixelHeight + lineEnding;
      }


      screenData += lineEnding + lineEnding;

      screenData += commentSymbol + ' Data block size constants:-' + lineEnding;


      if(exportTileSet) {
        screenData += constSymbol + 'SZ_CHARSET_DATA         = ' + charSetSize  + lineEnding;
      }
      if(exportCharacterColorData) {
        screenData += constSymbol + 'SZ_CHARSET_ATTRIB_DATA  = ' + charCount + lineEnding;
      }

      if(exportBlockColorData) {
        screenData += constSymbol + 'SZ_TILESET_ATTRIB_DATA  = ' + blockCount + lineEnding;
      }

      if(exportBlockData) {
        screenData += constSymbol + 'SZ_TILESET_DATA         = ' + blockSetSize + lineEnding;
      }

      if(exportBlockMap) {
        screenData += constSymbol + 'SZ_TILE_MAP_DATA        = ' + blockMapSize + lineEnding;
      }

      if(exportCharMap) {
        screenData += constSymbol + 'SZ_CHAR_MAP_DATA        = ' + charMapSize + lineEnding;      
      }

      if(exportCharMapColorData) {
        screenData += constSymbol + 'SZ_CHAR_MAP_COLOUR_DATA = ' + charMapSize + lineEnding;              
      }


      screenData += lineEnding + lineEnding;

      screenData += commentSymbol + ' Data block address constants (dummy values):-' + lineEnding;

      var currentAddress = 0x1000;

      if(exportTileSet) {
        screenData += constSymbol + 'ADDR_CHARSET_DATA          = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'charset_data\'        (size = $' + this.toHex(charSetSize) + '). ' + lineEnding;
        currentAddress += charSetSize;
      }

      if(exportCharacterColorData) {
        screenData += constSymbol + 'ADDR_CHARSET_ATTRIB_DATA   = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'charset_attrib_data\' (size = $' + this.toHex(charCount) + ').' + lineEnding;
        currentAddress += charCount;
      }

      if(exportBlockColorData) {
//        screenData += constSymbol + 'SZ_TILESET_ATTRIB_DATA  = ' + blockCount + lineEnding;
        screenData += constSymbol + 'ADDR_TILESET_ATTRIB_DATA             = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tileset_attrib_data\'        (size = $' + this.toHex(blockSetSize) + ').' + lineEnding;
        currentAddress += blockSetSize;

      }


      if(exportBlockData) {
        screenData += constSymbol + 'ADDR_TILESET_DATA             = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tileset_data\'        (size = $' + this.toHex(blockSetSize) + ').' + lineEnding;
        currentAddress += blockSetSize;
      }

      if(exportBlockMap) {
        screenData += constSymbol + 'ADDR_TILE_MAP_DATA         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tile_map_data\'            (size = $' + this.toHex(blockMapSize) + ').' + lineEnding;
        currentAddress += blockMapSize;
      }

      if(exportCharMap) {
        screenData += constSymbol + 'ADDR_CHAR_MAP_DATA         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_data\'            (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
        currentAddress += charMapSize;
      }

      if(exportCharMapColorData) {
        screenData += constSymbol + 'ADDR_CHAR_MAP_COLOUR_DATA  = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_colour_data\'     (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
        currentAddress += charMapSize;
      }


      screenData += "\n\n";

      
      if(exportColorPalette) {
        var paletteData = '';
        var colorPalette = layer.getColorPalette();
        var colorCount = colorPalette.getColorCount();

  //        paletteData += commentSymbol + ' PALETTE DATA : ' + colorCount + ' colors : total size is ' + charCount + ' ($' + this.toHex(charCount) + ') bytes.' + lineEnding;
        paletteData += setPCSymbol + ' ADDR_CHARSET_PALETTE_DATA';
        if(args.format == 'kickass') {
          paletteData += ' "charset_palette_data"';
        }

        paletteData += lineEnding;
        paletteData += 'charset_palette_data' + labelPostfix + lineEnding;
        paletteData += lineEnding;

        var colorPaletteBytes = [];
        for(var i = 0; i < colorCount; i++) {
          var c = colorPalette.getRGBA(i);

          // 12 bit colour
          var r = ((c[0]) >> 4) & 0x0f;
          var g = (c[1]) & 0xf0;
          var b = ((c[2]) >> 4) & 0x0f;          
          
          colorPaletteBytes.push( g + b)
          colorPaletteBytes.push(r);
        }

        paletteData += this.formatBytes(colorPaletteBytes, args);

        screenData += paletteData;
        screenData += lineEnding + lineEnding;

      }

      if(exportTileSet) {   

        screenData += commentSymbol + ' CHAR SET DATA : ' + charCount + ' (8 byte) chars : total size is ' + charSetSize + ' ($' + this.toHex(charSetSize) + ') bytes.' + lineEnding;
        screenData += lineEnding;
        screenData += setPCSymbol + ' ADDR_CHARSET_DATA';
        if(args.format == 'kickass') {
          screenData += ' "charset_data"';
        }
        screenData += lineEnding;
        screenData += 'charset_data' + labelPostfix + lineEnding;
        screenData += lineEnding;

        var tileSetData = [];//new Uint8Array(dataSize);
    //    var tileSet = this.editor.tileSets[this.editor.currentTileSetID];
        index = 0;


        var column = 0;
        columns = 8;

        console.log('export tiles!');

        var tileWidth = tileSet.getTileWidth();
        var tileHeight = tileSet.getTileHeight();
        var frameCount = this.editor.graphic.getFrameCount();

        for(var c = 0; c < tileSet.tileCount; c++) {
        //for(var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
          var cellX = 0;
          var cellY = 0;
          //var cellData = layer.getCell({ x: cellX, y: cellY, frame: frameIndex });
          //var c = cellData.t;

          // get the character's xy position in the char image
          var bytes = [];
          for(var y = 0; y < tileHeight; y++) {
            var b = 0;
            for(var x = 0; x < tileWidth; x++) {
              // 8bpp
              b = tileSet.getPixel(c, x, y);
              bytes.push(b);

              /*
              // 4bpp
              if(x % 2) {
                b = b | tileSet.getPixel(c, x, y);
                bytes.push(b);
              } else {
                b = tileSet.getPixel(c, x, y) << 4;
              }
              */
            }
          }

          for(var i = 0; i < bytes.length; i++) {
            var b = bytes[i];
            if(column !== 0) {
              screenData += ',';
            } else {
              screenData += byteLabel;
            }

            if(hex) {
              screenData += '$';
              screenData += ("00" + b.toString(16)).substr(-2);   
            } else {
              screenData += b.toString(10);
            }
            column++;

            if(column == columns) {
              column = 0;
              screenData += lineEnding;
            }

          }
          screenData += lineEnding;

        }

        screenData += lineEnding + lineEnding;
      }

      if(exportCharacterColorData) {
        var charColorData = '';

        var charCount = tileSet.getTileCount();


        charColorData += commentSymbol + ' CHAR SET ATTRIBUTE DATA : ' + charCount + ' attributes : total size is ' + charCount + ' ($' + this.toHex(charCount) + ') bytes.' + lineEnding;
        charColorData += commentSymbol + ' nb. Upper nybbles = Material, Lower nybbles = Colour.' + lineEnding;
        charColorData += lineEnding;
        charColorData += setPCSymbol + ' ADDR_CHARSET_ATTRIB_DATA';
        if(args.format == 'kickass') {
          charColorData += ' "charset_attrib_data"';
        }
        
        charColorData += lineEnding;
        charColorData += 'charset_attrib_data' + labelPostfix + lineEnding;
        charColorData += lineEnding;

        var column = 0;
        for(var i = 0; i < tileSet.tileCount; i++) {
          var color = tileSet.getTileColor(i) & 0xf;
          var material = tileSet.getTileMaterial(i) & 0xf;

          if(column !== 0) {
            charColorData += ',';
          } else {
            charColorData += byteLabel;
          }

          var value = color + (material << 4);

          if(hex) {
            charColorData += '$';
            charColorData += ("00" + value.toString(16)).substr(-2);   
          } else {
            charColorData += value.toString(10);               
          }
          column++;

          if(column == columns) {
            column = 0;
            charColorData += lineEnding;
          }
        }
        screenData += charColorData;
        screenData += lineEnding + lineEnding;
      }


      if(exportBlockData) {
        var blockData = '';

        blockData += commentSymbol + ' TILE SET DATA : ' + blockCount + ' (' + blockWidth + 'x' + blockHeight + ') tiles : total size is ' + blockSetSize + ' ($' + this.toHex(blockSetSize) + ') bytes.' + lineEnding;
        blockData += lineEnding;
        blockData += setPCSymbol + ' ADDR_TILESET_DATA';
        if(args.format == 'kickass') {
          blockData += ' "tileset_data"';
        }        
        blockData += lineEnding;
        blockData += 'tileset_data' + labelPostfix + lineEnding;
        blockData += lineEnding;

        blockData += this.getBlockSetData(args);

        screenData += blockData;
        screenData += lineEnding + lineEnding;
      }


      if(exportBlockColorData) {
        var blockColorData = '';

        var size = blockCount;
        var sizeHex = ("0000" + size.toString(16)).substr(-4); 


        blockColorData += commentSymbol + ' TILE SET ATTRIBUTE DATA : ' + blockCount + ' attributes : total size is ' + size + ' ($' + sizeHex + ') bytes.' + lineEnding;
        blockColorData += commentSymbol + ' nb. Upper nybbles = Material, Lower nybbles = Colour.' + lineEnding;
        blockColorData += lineEnding;
        blockColorData += setPCSymbol + ' ADDR_TILESET_ATTRIB_DATA';
        if(args.format == 'kickass') {
          blockColorData += ' "tileset_attrib_data"';
        }        

        blockColorData += lineEnding;
        blockColorData += 'tileset_attrib_data' + labelPostfix + lineEnding;
        blockColorData += lineEnding;

        blockColorData += this.getBlockColorData(args);
/*
        var column = 0;
        for(var i = 0; i < blockCount; i++) {
          var color = blockSet.getBlockColor(i);
          if(column !== 0) {
            blockColorData += ',';
          } else {
            blockColorData += byteLabel;
          }

          blockColorData += '$';
          blockColorData += ("00" + color.toString(16)).substr(-2);   
          column++;

          if(column == columns) {
            column = 0;
            charColorData += lineEnding;
          }
        }
*/

        screenData += blockColorData;
        screenData += lineEnding + lineEnding;      
      }




      if(exportBlockMap) {
        var blockMap = '';
        var blockMapSizeHex = ("0000" + blockMapSize.toString(16)).substr(-4);   

        var column = 0;

        blockMap += commentSymbol + ' MAP DATA : 1 (' + mapWidth + 'x' + mapHeight + ') map : total size is ' + blockMapSize + ' ($' + blockMapSizeHex + ') bytes.' + lineEnding;
        blockMap += lineEnding;
        blockMap += setPCSymbol + ' ADDR_TILE_MAP_DATA';
        if(args.format == 'kickass') {
          blockMap += ' "tile_map_data"';
        }        

        blockMap += lineEnding;
        blockMap += 'tile_map_data' + labelPostfix + lineEnding;
        blockMap += lineEnding;


        blockMap += this.getBlockMapData(args);

        screenData += blockMap;    
        screenData += lineEnding + lineEnding;

      }


      if(exportCharMap) {

        var column = 0;

        screenData += commentSymbol + ' MAP DATA : 1 (' + gridWidth + 'x' + gridHeight + ') map : total size is ' + charMapSize + ' ($' + this.toHex(charMapSize) + ') bytes.' + lineEnding;
        screenData += lineEnding;
        screenData += setPCSymbol + ' ADDR_CHAR_MAP_DATA';
        if(args.format == 'kickass') {
          screenData += ' "map_data"';
        }        
        screenData  += lineEnding;                
        screenData += 'map_data' + labelPostfix + lineEnding;
        screenData += lineEnding;


        screenData += this.getCharMapData(args);

      }



      if(exportCharMapColorData) {

        var column = 0;

        screenData += commentSymbol + '  MAP COLOUR DATA : 1 (' + gridWidth + 'x' + gridHeight + ') map : total size is ' + charMapSize + ' ($' + this.toHex(charMapSize) + ') bytes.' + lineEnding;
        screenData += lineEnding;
        screenData += setPCSymbol + ' ADDR_CHAR_MAP_COLOUR_DATA';
        if(args.format == 'kickass') {
          screenData += ' "map_colour_data"';
        }        

        screenData += lineEnding;

        screenData += 'map_colour_data' + labelPostfix + lineEnding;
        screenData += lineEnding;

//        for(var z = fromLayer; z <= toLayer; z++) {
        for(var frameIndex = args.fromFrame - 1; frameIndex < args.toFrame; frameIndex++) {
          if(frameIndex >= this.editor.graphic.getFrameCount()) {
            break;
          }

          var index = 0;
          column = 0;
          /*
          var yStart = gridHeight - 1;
          var yLimit = -1;
          var yIncrement = -1;
          */
         var yStart = 0;
         var yLimit = gridHeight;
         var yIncrement = 1;

         for(var y = yStart; y != yLimit; y += yIncrement) {
            for(var x = 0; x < gridWidth; x++) {
              var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });

              if(column !== 0) {
                screenData += ',';
              } else {
                screenData += byteLabel;
              }

              if(hex) {
                screenData += '$';
                screenData += ("00" + cellData.fc.toString(16)).substr(-2);   
              } else {
                screenData += cellData.fc.toString(10);   
              }

              column++;

              if(column == columns) {
                column = 0;
                screenData += lineEnding;
              }

              index++;
            }
          }
          screenData += lineEnding + lineEnding;

//          var frameNumber = frameIndex + 1;
//            var layerNumber = z + 1;
        }
//        }
      }


    }

    if(typeof args.displayOnly != 'undefined' && args.displayOnly) {
//      g_app.textDialog.setText(screenData);
//      g_app.textDialog.show();
      this.asmEditor.setValue(screenData, -1);

    } else {
      download(screenData, args.filename + '.txt', "application/txt");
    }
  },

/*
  exportNESFormat: function(args) {
    var exportScreen = true;
    var exportColor = true;
    var exportTileSet = true;

    var extension = '.txt';
    var assembly = '';

    if(exportTileSet) {   

      assembly += '; chr data\r\n\r\n';

      var tileSetManager = this.editor.tileSetManager;
      var tileSet = tileSetManager.getCurrentTileSet();
      index = 0;


      var column = 0;

      for(var i = 0; i < tileSet.tileCount; i++) {
        var c = i;
        // get the character's xy position in the char image

        for(var plane = 0; plane < 2; plane++) {
          for(var y = 0; y < 8; y++) {
            var b = 0;
            for(var x = 0; x < 8; x++) {
                // set the bit
              var paletteIndex = tileSet.getPixel(c, x, y);
              if(plane == 0) {
                // lower bit
                if(paletteIndex & 0x1) {
                  b = b | (1 << (7-x));
                }
              } else {
                // upper bit
                if(paletteIndex & 0x2) {
                  b = b | (1 << (7-x));                  
                }
              }
            }

            if(column !== 0) {
              assembly += ',';
            } else {
              assembly += '.byte ';
            }

            assembly += '$';
            assembly += ("00" + b.toString(16)).substr(-2);   
            column++;

            if(column == columns) {
              column = 0;
              assembly += '\r\n';
            }

          }
        }
      }
    }


    download(assembly, args.filename + '.txt', "application/txt");

  },

  */

  exportX16AssemblyAs: function(args) {

    if(typeof args.filename == 'undefined') {
      args.filename = g_app.fileManager.filename;
    }

    if(typeof args.format == 'undefined') {
      args.format = 'binary';
    }

    if(typeof args.layer == 'undefined') {
      args.layer = 'current';
    }

    var currentFrame = this.editor.graphic.getCurrentFrame();

    if(typeof args.fromFrame == 'undefined') {
      args.fromFrame = currentFrame;
    }

    if(typeof args.toFrame == 'undefined') {
      args.toFrame = currentFrame;
    }

    this.exportX16Format(args);

/*
    this.exportNESFormat({
      filename: filename
    });
*/

  },


  download: function() {
    var filename = $('#exportX16AssemblyAs').val();
    filename += '.txt';

    var source = this.asmEditor.getValue();
    download(source, filename, "application/txt");

  },

  exportX16Assembly: function(args) {
    args.filename = $('#exportX16AssemblyAs').val();

    args.format = $('input[name=exportX16AssemblyFormat]:checked').val();
    args.numberFormat = $('input[name=exportX16NumberFormat]:checked').val();

    args.fromFrame = parseInt($('#exportX16AssemblyFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportX16AssemblyToFrame').val(), 10);

    args.layer = $('input[name=exportX16AssemblyLayer]:checked').val();

//    this.colorPerMode = this.editor.getColorPerMode();
//    this.blockModeEnabled = this.editor.getBlockModeEnabled();

    args.exportColorPalette = $('#exportX16AssemblyColorPalette').is(':checked');
    args.exportTileSet = $('#exportX16AssemblyCharactersetData').is(':checked');
    args.exportCharacterColorData = $('#exportX16AssemblyColorData').is(':checked') ;//&& this.colorPerMode == 'character';
    args.exportBlockColorData = $('#exportX16AssemblyBlockColorData').is(':checked') && this.colorPerMode == 'block';

    args.exportBlockData = $('#exportX16AssemblyBlockData').is(':checked') && this.blockModeEnabled;
    args.exportBlockMap = $('#exportX16AssemblyBlockMapData').is(':checked') && this.blockModeEnabled;
    args.exportCharMap = $('#exportX16AssemblyMapData').is(':checked');

    args.exportCharMapColorData = $('#exportX16AssemblyMapColorData').is(':checked');// && this.colorPerMode != 'character' && this.colorPerMode != 'block';


    args.screenMode = this.editor.getScreenMode();
    this.exportX16AssemblyAs(args);
  }  
}