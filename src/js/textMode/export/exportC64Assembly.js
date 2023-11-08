var ExportC64Assembly = function() {
  this.editor = null;
  this.asmEditor = null;  

  this.lineEnding = '\r\n';
  this.columns = 16;
}

ExportC64Assembly.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportC64AssemblyDialog", "title": "Export Assembly", "width": 980, "height": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportC64Assembly.html', function() {
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

    UI.showDialog("exportC64AssemblyDialog");
  },  


  toHex: function(value) {
    return ("0000" + value.toString(16)).substr(-4); 
  },

  initContent: function() {

    if(this.asmEditor == null) {
      this.asmEditor = ace.edit("exportC64AssemblySource");
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

    $('#exportC64AssemblyAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportC64AssemblyToFrame').val(frameCount);
    $('#exportC64AssemblyFromFrame').val(1);

    $('#exportC64AssemblyFromFrame').attr('max', frameCount);
    $('#exportC64AssemblyToFrame').attr('max', frameCount);

    switch(this.colorPerMode) {
      case 'character':

        $('#exportC64AssemblyColorDataHolder').show();
        $('#exportC64AssemblyMapColorData').hide();
      break;
      case 'cell':
//        $('#exportC64AssemblyColorDataHolder').hide();
        $('#exportC64AssemblyColorDataHolder').show();
        $('#exportC64AssemblyMapColorData').show();
      break;
      case 'block':
        $('#exportC64AssemblyColorDataHolder').show();
//          $('#exportC64AssemblyColorDataHolder').hide();
        $('#exportC64AssemblyMapColorData').hide();

      break;
    }


    if(this.blockModeEnabled) {
      $('#exportC64AssemblyBlockMapDataHolder').show();

      if(this.colorPerMode == 'block') {
        $('#exportC64AssemblyBlockColorDataHolder').show();
      } else {
        $('#exportC64AssemblyBlockColorDataHolder').hide();        
      }

      $('#exportC64AssemblyMapData').prop('checked', false);

      $('#exportC64MetaTileIndexSettings').show();
    } else {
      $('#exportC64AssemblyBlockMapDataHolder').hide();
      $('#exportC64AssemblyBlockColorDataHolder').hide();
      $('#exportC64AssemblyBlockDataHolder').hide();
      $('#exportC64MetaTileIndexSettings').hide();
    }


    this.exportC64Assembly({ displayOnly: true });

  },

  initEvents: function() {
    var _this = this;

    $('input[name=exportC64AssemblyFormat]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('input[name=exportC64NumberFormat]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('input[name=exportC64TileIndexSize]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('input[name=exportC64MetaTileIndexSize]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('.exportC64AssemblyInclude').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('#exportC64AssemblyFromFrame').on('change', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('#exportC64AssemblyToFrame').on('change', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('#exportC64AssemblyDownload').on('click', function() {
      //_this.exportC64Assembly({});
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

  getWordLabel: function(args) {
    var wordLabel = '!word ';
    if(args.format == 'kickass' || args.format == 'ca65' || args.format == 'tass') {
      wordLabel = '.word ';
    }

    if(args.format == 'acme') {
      wordLabel = '!word ';
    }
    return wordLabel;
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
    var exportSelection = false;
    if(typeof args.selection != 'undefined') {
      exportSelection = args.selection;
    }
    
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

    var drawTools = this.editor.tools.drawTools;
    var selectionX  = drawTools.select.selection.minX;
    var selectionY  = drawTools.select.selection.minY;
    var selectionOffsetX =  drawTools.select.selectionOffsetX;
    var selectionOffsetY =  drawTools.select.selectionOffsetY;
    var selectionWidth = drawTools.select.selection.maxX - drawTools.select.selection.minX;
    var selectionHeight = drawTools.select.selection.maxY - drawTools.select.selection.minY;

    if(exportSelection) {
      gridWidth = selectionWidth;
      gridHeight = selectionHeight;
    }


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
    var wordLabel = this.getWordLabel(args);

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

      if(exportSelection) {
        yStart = selectionY;
        yLimit = drawTools.select.selection.maxY;
      }

      for(var y = yStart; y < yLimit; y += yIncrement) {

        var xStart = 0;
        var xLimit = gridWidth;
        
        if(exportSelection) {
          xStart = selectionX;
          xLimit = drawTools.select.selection.maxX;
        }
  
        for(var x = xStart; x < xLimit; x += xIncrement) {

          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          var block = cellData.b;
          if(typeof block == 'undefined') {
            block = 0;
          }

          if(args.hi_byte) {
            block = (block >> 8) & 0xff;
          } else if(args.metaTileIndexSize == '16word') {
            block = block & 0xffff;
          } else {
            block = block & 0xff;
          }          

          if(exportFormat == 'text') {
            if(column !== 0) {
              textData += ',';
            } else {
              if(args.metaTileIndexSize == '16word') {
                textData += wordLabel;
              } else {
                textData += byteLabel;
              }
            }

            if(hex) {
              textData += '$';

              if(args.metaTileIndexSize == '16word') {
                textData += ("0000" + block.toString(16)).substr(-4);
              } else {
                textData += ("00" + block.toString(16)).substr(-2);   
              }

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
    var wordLabel = this.getWordLabel(args);

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
              bc = tileSet.getTileBGColor(tileId);
              if(bc !== this.editor.colorPaletteManager.noColor) {
                bc = bc & 0xf;
              }
            }
            //tileId = tileId & 0x3f;
            tileId = tileId & 0xff;

            if(bc !== this.editor.colorPaletteManager.noColor) {
              tileId = tileId & 0x3f;
              switch(bc) {
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

          }

          if(args.hi_byte) {
            tileId = (tileId >> 8) & 0xff;
          } else if(args.tileIndexSize == '16word') {
            tileId = tileId & 0xffff;
          } else {
            tileId = tileId & 0xff;
          }
          

          if(exportFormat == 'text') {

            if(column !== 0) {
              textData += ',';
            } else {
              if(args.tileIndexSize == '16word') {
                textData += wordLabel;
              } else {
                textData += byteLabel;
              }
            }


            if(hex) {
              textData += '$';

              if(args.tileIndexSize == '16word') {
                textData += ("0000" + tileId.toString(16)).substr(-4);
              } else {
                textData += ("00" + tileId.toString(16)).substr(-2);   
              }

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
    var exportSelection = false;
    if(typeof args.selection != 'undefined') {
      exportSelection = args.selection;
    }
     
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

    var screenMode = layer.getScreenMode();
    var isECM = screenMode === TextModeEditor.Mode.C64ECM;
    var colorPerMode = layer.getColorPerMode();

    var byteLabel = this.getByteLabel(args);
    var wordLabel = this.getWordLabel(args);

    var exportFormat = 'text';
    if(typeof format != 'undefined') {
      exportFormat = format;
    }

    var hex = args.numberFormat != 'dec';
    var indexSize = args.tileIndexSize;

    var textData = '';
    var column = 0;
    var arrayData = [];

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var drawTools = this.editor.tools.drawTools;
    var selectionX  = drawTools.select.selection.minX;
    var selectionY  = drawTools.select.selection.minY;
    var selectionOffsetX =  drawTools.select.selectionOffsetX;
    var selectionOffsetY =  drawTools.select.selectionOffsetY;
    var selectionWidth = drawTools.select.selection.maxX - drawTools.select.selection.minX;
    var selectionHeight = drawTools.select.selection.maxY - drawTools.select.selection.minY;

    if(exportSelection) {
      gridWidth = selectionWidth;
      gridHeight = selectionHeight;
    }


    var tileSet = layer.getTileSet();

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

    
    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      if(frameIndex >= layer.getFrameCount()) {
        break;
      }

      var index = 0;
      column = 0;

//          var yStart = gridHeight - 1;
//          var yLimit = -1;
//          var yIncrement = -1;

      var yStart = 0;
      var yLimit = gridHeight;
      var yIncrement = 1;

      if(exportSelection) {
        yStart = selectionY;
        yLimit = drawTools.select.selection.maxY;
      }


      for(var y = yStart; y != yLimit; y += yIncrement) {

        var xStart = 0;
        var xLimit = gridWidth;

        if(exportSelection) {
          xStart = selectionX;
          xLimit = drawTools.select.selection.maxX;
        }
          
        for(var x = xStart; x < xLimit; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          var tileId = cellData.t;
          /*
            00xxxxxx gives the background color specified in 53281/$D021
            01xxxxxx gives the background color specified in 53282/$D022
            10xxxxxx gives the background color specified in 53283/$D023
            11xxxxxx gives the background color specified in 53284/$D024          
          */
          if(isECM) {
            // tileId will depend on the background colour
            var bc = cellData.bc;
            if(colorPerMode == 'character') {
              bc = tileSet.getTileBGColor(tileId);

              if(bc !== this.editor.colorPaletteManager.noColor) {
                bc = bc & 0xf;
              }
            }

            if(bc !== this.editor.colorPaletteManager.noColor) {
              tileId = tileId & 0x3f;

              switch(bc) {
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


          }

          if(args.hi_byte) {
            tileId = (tileId >> 8) & 0xff;
          } else if(args.tileIndexSize == '16word') {
            tileId = tileId & 0xffff;
          } else {
            tileId = tileId & 0xff;
          }


          if(exportFormat == 'text') {
            if(column !== 0) {
              textData += ',';
            } else {
              if(args.tileIndexSize == '16word') {
                textData += wordLabel;
              } else {
                textData += byteLabel;
              }
            }

            if(hex) {
              textData += '$';

              if(args.tileIndexSize == '16word') {
                textData += ("0000" + tileId.toString(16)).substr(-4);
              } else {
                textData += ("00" + tileId.toString(16)).substr(-2);   
              }
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
      if(exportFormat == 'text') {
        textData += this.lineEnding + this.lineEnding;
      }
    }

    if(exportFormat == 'text') {
      return textData;
    }

    if(exportFormat == 'binary') {
      return new Uint8Array(arrayData);
    }
  },


  exportC64Format: function(args) {
    var columns = 16;
    this.columns = 16;

    /*
    var fromLayer = this.editor.grid.xyPosition;
    var toLayer = this.editor.grid.xyPosition;
    if(args.layer == 'all') {
      fromLayer = 0;
      toLayer = this.editor.frames.depth - 1;
    }
    */

    

    var extension = '.txt';

    var exportTileSet = true;
    var exportCharacterColorData = true;
    var exportBlockData = true;
    var exportBlockMap = true;
    var exportCharMap = false;
    var exportBlockColorData = true;
    var exportCharMapColorData = false;
    var exportSelection = false;

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

    if(typeof args.selection != 'undefined') {
      exportSelection = args.selection;
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
      var screenMode = layer.getScreenMode();
      var isECM = screenMode === TextModeEditor.Mode.C64ECM;
  
      if(!layer.getBlockModeEnabled()) {
        exportBlockMap = false;
      }

      var gridWidth = layer.getGridWidth();
      var gridHeight = layer.getGridHeight();


      var drawTools = this.editor.tools.drawTools;
      var selectionX  = drawTools.select.selection.minX;
      var selectionY  = drawTools.select.selection.minY;
      var selectionOffsetX =  drawTools.select.selectionOffsetX;
      var selectionOffsetY =  drawTools.select.selectionOffsetY;
      var selectionWidth = drawTools.select.selection.maxX - this.editor.tools.drawTools.select.selection.minX;
      var selectionHeight = drawTools.select.selection.maxY - this.editor.tools.drawTools.select.selection.minY;
  
      if(exportSelection) {
        gridWidth = selectionWidth;
        gridHeight = selectionHeight;
      }

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

      screenData += constSymbol + 'SCREEN_BORDER_COLOUR = ' + borderColor + lineEnding;
      if(args.screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
        screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR = ' + backgroundColor + lineEnding;
        var multi1 = layer.getC64Multi1Color();
        var multi2 = layer.getC64Multi2Color();
        screenData += constSymbol + 'CHAR_MULTICOLOUR_MODE = 1' + lineEnding;
        screenData += constSymbol + 'COLOUR_CHAR_MC1 = ' + multi1 + lineEnding;
        screenData += constSymbol + 'COLOUR_CHAR_MC2 = ' + multi2 + lineEnding;
      } else if(args.screenMode == TextModeEditor.Mode.C64ECM) {
        screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR1 = ' + backgroundColor + lineEnding;
        var bgColor2 = layer.getC64ECMColor(1);
        screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR2 = ' + bgColor2 + lineEnding;
        var bgColor3 = layer.getC64ECMColor(2);
        screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR3 = ' + bgColor3 + lineEnding;

        var bgColor4 = layer.getC64ECMColor(3);
        screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR4 = ' + bgColor4 + lineEnding;

      } else {
          screenData += constSymbol + 'SCREEN_BACKGROUND_COLOUR = ' + backgroundColor + lineEnding;
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
      var colorMapSize = charMapSize;

      if(args.tileIndexSize == '16word') {
        charMapSize *= 2;
      }

      if(args.metaTileIndexSize == '16word') {
        blockMapSize *= 2;
      }

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
        if(args.metaTileIndexSize == '16split') {
          screenData += constSymbol + 'SZ_TILE_MAP_DATA_LO        = ' + blockMapSize + lineEnding;
          screenData += constSymbol + 'SZ_TILE_MAP_DATA_HI        = ' + blockMapSize + lineEnding;

        } else {
          screenData += constSymbol + 'SZ_TILE_MAP_DATA        = ' + blockMapSize + lineEnding;
        }
      }

      if(exportCharMap) {
        if(args.tileIndexSize == '16split') {
          screenData += constSymbol + 'SZ_CHAR_MAP_DATA_LO        = ' + charMapSize + lineEnding;      
          screenData += constSymbol + 'SZ_CHAR_MAP_DATA_HI        = ' + charMapSize + lineEnding;      

        } else {
          screenData += constSymbol + 'SZ_CHAR_MAP_DATA        = ' + charMapSize + lineEnding;      
        }
      }

      if(exportCharMapColorData) {
        screenData += constSymbol + 'SZ_CHAR_MAP_COLOUR_DATA = ' + colorMapSize + lineEnding;              
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

        if(args.metaTileIndexSize == '16split') {
          screenData += constSymbol + 'ADDR_TILE_MAP_DATA_LO         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tile_map_data\'            (size = $' + this.toHex(blockMapSize) + ').' + lineEnding;
          currentAddress += blockMapSize;
          screenData += constSymbol + 'ADDR_TILE_MAP_DATA_HI         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tile_map_data\'            (size = $' + this.toHex(blockMapSize) + ').' + lineEnding;
          currentAddress += blockMapSize;

        } else {
          screenData += constSymbol + 'ADDR_TILE_MAP_DATA         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'tile_map_data\'            (size = $' + this.toHex(blockMapSize) + ').' + lineEnding;
          currentAddress += blockMapSize;
        }
      }

      if(exportCharMap) {
        if(args.tileIndexSize == '16split') {
          screenData += constSymbol + 'ADDR_CHAR_MAP_DATA_LO         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_data\'            (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
          currentAddress += charMapSize;

          screenData += constSymbol + 'ADDR_CHAR_MAP_DATA_HI         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_data\'            (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
          currentAddress += charMapSize;

        } else {
          screenData += constSymbol + 'ADDR_CHAR_MAP_DATA         = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_data\'            (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
          currentAddress += charMapSize;
        }
      }

      if(exportCharMapColorData) {
        screenData += constSymbol + 'ADDR_CHAR_MAP_COLOUR_DATA  = $' + this.toHex(currentAddress) + '   ' + commentSymbol + ' label = \'map_colour_data\'     (size = $' + this.toHex(charMapSize) + ').' + lineEnding;
        currentAddress += colorMapSize;
      }


      screenData += "\n\n";



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

        for(var i = 0; i < tileSet.tileCount; i++) {
          var c = i;
          // get the character's xy position in the char image

          for(var y = 0; y < 8; y++) {
            var b = 0;
            for(var x = 0; x < 8; x++) {
                // set the bit
              if(tileSet.getPixel(c, x, y)) {
                b = b | (1 << (7-x));
              }
            }
            //this.charsetData.push(b);
            //tileSetData[index++] = b;

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



        var tileset_data_label = 'tileset_data';
        if(args.tileIndexSize == '16split') {
          tileset_data_label = 'tileset_data_lo';
        }

        if(args.format == 'kickass') {
          blockData += ' "' + tileset_data_label + '"';
        }        
        blockData  += lineEnding;                
        blockData += tileset_data_label + labelPostfix + lineEnding;
        blockData += lineEnding;

        args.hi_byte = false;
        blockData += this.getBlockSetData(args);

        if(args.tileIndexSize == '16split') {
          blockData  += lineEnding;                
          tileset_data_label = 'tileset_data_hi';

          if(args.format == 'kickass') {
            blockData += ' "' + tileset_data_label + '"';
          }        
          blockData  += lineEnding;                
          blockData += tileset_data_label + labelPostfix + lineEnding;
          blockData += lineEnding;
  
          args.hi_byte = true;
          blockData += this.getBlockSetData(args);          
        }


/*
        if(args.format == 'kickass') {
          blockData += ' "tileset_data"';
        }        
        blockData += lineEnding;
        blockData += 'tileset_data' + labelPostfix + lineEnding;
        blockData += lineEnding;

        blockData += this.getBlockSetData(args);
*/

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
//        blockMap += setPCSymbol + ' ADDR_TILE_MAP_DATA';

        

        var map_data_label = 'tile_map_data';
        if(args.metaTileIndexSize == '16split') {
          map_data_label = 'tile_map_data_lo';
          blockMap += setPCSymbol + ' ADDR_TILE_MAP_DATA_LO';
        } else {
          blockMap += setPCSymbol + ' ADDR_TILE_MAP_DATA';
        }

        if(args.format == 'kickass') {
          blockMap += ' "' + map_data_label + '"';
        }        
        blockMap  += lineEnding;                
        blockMap += map_data_label + labelPostfix + lineEnding;
        blockMap += lineEnding;

        args.hi_byte = false;
        blockMap += this.getBlockMapData(args);

        if(args.metaTileIndexSize == '16split') {
          blockMap += setPCSymbol + ' ADDR_TILE_MAP_DATA_HI';

          map_data_label = 'tile_map_data_hi';

          if(args.format == 'kickass') {
            blockMap += ' "' + map_data_label + '"';
          }        
          blockMap  += lineEnding;                
          blockMap += map_data_label + labelPostfix + lineEnding;
          blockMap += lineEnding;
  
          args.hi_byte = true;
          blockMap += this.getBlockMapData(args);      
        }


        
        /*
        if(args.format == 'kickass') {
          blockMap += ' "tile_map_data"';
        }        

        blockMap += lineEnding;
        blockMap += 'tile_map_data' + labelPostfix + lineEnding;
        blockMap += lineEnding;


        blockMap += this.getBlockMapData(args);
        */

        screenData += blockMap;    
        screenData += lineEnding + lineEnding;

      }


      if(exportCharMap) {

        var column = 0;

        screenData += commentSymbol + ' MAP DATA : 1 (' + gridWidth + 'x' + gridHeight + ') map : total size is ' + charMapSize + ' ($' + this.toHex(charMapSize) + ') bytes.' + lineEnding;
        screenData += lineEnding;

        var map_data_label = 'map_data';
        if(args.tileIndexSize == '16split') {
          map_data_label = 'map_data_lo';
          screenData += setPCSymbol + ' ADDR_CHAR_MAP_DATA_LO';
        } else {
          screenData += setPCSymbol + ' ADDR_CHAR_MAP_DATA';
        }

        if(args.format == 'kickass') {
          screenData += ' "' + map_data_label + '"';
        }        
        screenData  += lineEnding;                
        screenData += map_data_label + labelPostfix + lineEnding;
        screenData += lineEnding;

        args.hi_byte = false;
        screenData += this.getCharMapData(args);

        if(args.tileIndexSize == '16split') {
          screenData += setPCSymbol + ' ADDR_CHAR_MAP_DATA_HI';

          map_data_label = 'map_data_hi';

          if(args.format == 'kickass') {
            screenData += ' "' + map_data_label + '"';
          }        
          screenData  += lineEnding;                
          screenData += map_data_label + labelPostfix + lineEnding;
          screenData += lineEnding;
  
          args.hi_byte = true;
          screenData += this.getCharMapData(args);            
        }

      }



      if(exportCharMapColorData) {

        var column = 0;

        screenData += commentSymbol + '  MAP COLOUR DATA : 1 (' + gridWidth + 'x' + gridHeight + ') map : total size is ' + colorMapSize + ' ($' + this.toHex(colorMapSize) + ') bytes.' + lineEnding;
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

         if(exportSelection) {
          yStart = selectionY;
          yLimit = drawTools.select.selection.maxY;
        }
  
         for(var y = yStart; y != yLimit; y += yIncrement) {

          var xStart = 0;
          var xLimit = gridWidth;
 
          if(exportSelection) {
            xStart = selectionX;
            xLimit = drawTools.select.selection.maxX;
          }
    
          for(var x = xStart; x < xLimit; x++) {
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

  exportC64AssemblyAs: function(args) {

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

    this.exportC64Format(args);

/*
    this.exportNESFormat({
      filename: filename
    });
*/

  },


  download: function() {
    var filename = $('#exportC64AssemblyAs').val();
    filename += '.txt';

    var source = this.asmEditor.getValue();
    download(source, filename, "application/txt");

  },

  exportC64Assembly: function(args) {
    args.filename = $('#exportC64AssemblyAs').val();

    args.format = $('input[name=exportC64AssemblyFormat]:checked').val();
    args.numberFormat = $('input[name=exportC64NumberFormat]:checked').val();
    args.tileIndexSize = $('input[name=exportC64TileIndexSize]:checked').val();
    args.metaTileIndexSize = $('input[name=exportC64MetaTileIndexSize]:checked').val();

    args.fromFrame = parseInt($('#exportC64AssemblyFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportC64AssemblyToFrame').val(), 10);

    args.layer = $('input[name=exportC64AssemblyLayer]:checked').val();

//    this.colorPerMode = this.editor.getColorPerMode();
//    this.blockModeEnabled = this.editor.getBlockModeEnabled();

    args.exportTileSet = $('#exportC64AssemblyCharactersetData').is(':checked');
    args.exportCharacterColorData = $('#exportC64AssemblyColorData').is(':checked') ;//&& this.colorPerMode == 'character';
    args.exportBlockColorData = $('#exportC64AssemblyBlockColorData').is(':checked') && this.colorPerMode == 'block';

    args.exportBlockData = $('#exportC64AssemblyBlockData').is(':checked') && this.blockModeEnabled;
    args.exportBlockMap = $('#exportC64AssemblyBlockMapData').is(':checked') && this.blockModeEnabled;
    args.exportCharMap = $('#exportC64AssemblyMapData').is(':checked');

    args.exportCharMapColorData = $('#exportC64AssemblyMapColorData').is(':checked');// && this.colorPerMode != 'character' && this.colorPerMode != 'block';

    args.selection = $('#exportC64AssemblySelectionOnly').is(':checked');

    args.screenMode = this.editor.getScreenMode();
    this.exportC64AssemblyAs(args);
  }  
}