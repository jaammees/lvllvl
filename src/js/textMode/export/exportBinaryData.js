var ExportBinaryData = function() {
  this.editor = null;
}


// mz700
// https://www.sharpmz.no/articles/the-mz-series/mz-700/mz-700-v-ram/

ExportBinaryData.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      var width = 420;
      var height = 420;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportBinaryDataDialog", "title": "Export Binary Data", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportBinaryData.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportBinaryData();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

    } else {
      this.initContent();
    }

    UI.showDialog("exportBinaryDataDialog");
  },  

  initContent: function() {

    $('#exportBinaryAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportBinaryToFrame').val(frameCount);
    $('#exportBinaryFromFrame').val(1);

    $('#exportBinaryFromFrame').attr('max', frameCount);
    $('#exportBinaryToFrame').attr('max', frameCount);
  },

  initEvents: function() {
    var _this = this;
  },


  // get the 4 most used bg colors
  getExtendedColorBGColors: function(args) {
    /*
    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }
    */

    var layer = args.layer;
    var gridWidth = args.gridWidth;
    var gridHeight = args.gridHeight;
    var fromFrame = args.fromFrame - 1;
    var toFrame = args.toFrame;


    this.extendedColorBGColors = [];
      
    var bgColors = [];
    for(var i = 0; i < 16; i++) {
      bgColors[i] = { "color": i, "timesUsed": 0 };
    }

    
    for(var frameIndex = fromFrame; frameIndex < toFrame; frameIndex++) {
      var frame = frameIndex;

      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          var color = 0;
          var cellData = layer.getCell({ x: x, y: y, frame: frame});
          color = cellData.bc;//frames[frame].frameData.data[z][gridHeight - 1 - y][x].bc;

          if(typeof color == 'undefined' || color === false || color === this.editor.colorPaletteManager.noColor) {
            // its the bg colour
            color = layer.getBackgroundColor();
          }
          bgColors[color].timesUsed++;
        }
      }
    }

    bgColors.sort(function(a, b) {
      return b.timesUsed - a.timesUsed;
    });

    for(var i = 0; i < 4; i++) {
      this.extendedColorBGColors[i] = bgColors[i];
    }


    console.log('bg colours:');
    console.log(bgColors);
    console.log(this.extendedColorBGColors);

  },
  
  exportBinaryDataAsMega65: function(args) {
    console.log('export mega 65');
    var layer = this.editor.layers.getSelectedLayerObject();
    var screenMode = layer.getScreenMode();
    var filename = g_app.fileManager.filename;

    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var fromFrame = this.editor.graphic.getCurrentFrame();
    if(typeof args.fromFrame != 'undefined') {
      fromFrame = args.fromFrame;
    }
    var toFrame = this.editor.graphic.getCurrentFrame();
    if(typeof args.toFrame != 'undefined') {
      toFrame = args.toFrame;
    }

    var format = 'mega65';
    if(typeof args.format != 'undefined') {
      format = args.format;
    }

    var extension = '.bin';
    if(format == 'c64') {
      extension = '.prg';
    }

    var tileSet = layer.getTileSet();
    var tileCount = tileSet.getTileCount();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    var exportScreen = args.exportMapData;
    var exportColor = args.exportColorData;
    var exportTileSet = args.exportTileData;
    var exportPalette = true;

    var zip = new JSZip();

    var frameCount = this.editor.graphic.getFrameCount();
    var gridHeight = layer.getGridHeight();
    var gridWidth = layer.getGridWidth();

    var frameNumber = 1;
    var layerName = layer.getLabel();

    var tileData = [];
    if(exportTileSet) {
      var tileData = new Uint8Array(tileCount * tileHeight * tileWidth);
      var pos = 0;
      for(var tileIndex = 0; tileIndex < tileCount; tileIndex++) {
        for(var y = 0; y < tileHeight; y++) {
          for(var x = 0; x < tileWidth; x++) {
            var b = tileSet.getPixel(tileIndex, x, y);
            //tileData.push(b);
            tileData[pos++] = b;
          }
        }
      }

      zip.file("TileData_" + layerName + "_Frame_" + frameNumber  + extension, tileData);

    }

    if(exportPalette) {
      var paletteData = new Uint8Array(255 * 3);
      var rBytes = [];
      var gBytes = [];
      var bBytes = [];

      var colorPalette = layer.getColorPalette();
      var colorCount = colorPalette.getColorCount();
      //for(var i = 0; i < colorCount; i++) {
      for(var i = 0; i < 255; i++) {
        if(i < colorCount) {
          var c = colorPalette.getRGBA(i);

          c[0] = c[0] & 0xff;
          var reversed = (c[0] & 0xf0) >> 4;

          var lowNybble = c[0] & 0xf;
          if(lowNybble > 7) {
            lowNybble = 7;
          }
          reversed += lowNybble << 4;

          rBytes.push(reversed);
          reversed = ((c[1] & 0xf0) >> 4) + ((c[1] & 0x0f) << 4);
          gBytes.push(reversed);
          reversed = ((c[2] & 0xf0) >> 4) + ((c[2] & 0x0f) << 4);
          bBytes.push(reversed);
        } else {
          rBytes.push(0);
          gBytes.push(0);
          bBytes.push(0);
        }
      }

      var pos = 0;
      for(var i = 0; i < 256; i++) {
        paletteData[pos++] = rBytes[i];
      }
      for(var i = 0; i < 256; i++) {
        paletteData[pos++] = gBytes[i];     
      }
      for(var i = 0; i < 256; i++) {
        paletteData[pos++] = bBytes[i];
      }
      zip.file("PaletteData_" + layerName + "_Frame_" + frameNumber  + extension, paletteData);  
    }

    console.log('export mega65 binary');
    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
    });    


  },
  
  exportBinaryDataAs: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    var screenMode = layer.getScreenMode();
    var isECM = screenMode === TextModeEditor.Mode.C64ECM;
    var exportAsECM = false;

    if(typeof args.colorMode) {
      exportAsECM = args.colorMode == 'ecm';
    }

    if(!layer && layer.getType() != 'grid') {
      return;
    }    

    var filename = g_app.fileManager.filename;

    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var format = 'binary';
    if(typeof args.format != 'undefined') {
      format = args.format;
    }

    if(format == 'mega65') {
      this.exportBinaryDataAsMega65(args);
      return;
    }


    var fromFrame = this.editor.graphic.getCurrentFrame();
    if(typeof args.fromFrame != 'undefined') {
      fromFrame = args.fromFrame;
    }
    var toFrame = this.editor.graphic.getCurrentFrame();
    if(typeof args.toFrame != 'undefined') {
      toFrame = args.toFrame;
    }

    var extension = '.bin';
    if(format == 'c64') {
      extension = '.prg';
    }

    var tileSet = layer.getTileSet();
    var tileCount = tileSet.getTileCount();

    var exportScreen = args.exportMapData;
    var exportColor = args.exportColorData;
    var exportTileSet = args.exportTileData;
    var exportTileAttributeData = args.exportTileAttributeData;

    var zip = new JSZip();

    var frameCount = this.editor.graphic.getFrameCount();
    var gridHeight = layer.getGridHeight();
    var gridWidth = layer.getGridWidth();

//    var ecmColors = [];

    this.mostUsedCharacters = [];
    this.charsetMap = [];

    for(var i = 0; i < tileCount; i++) {
      this.mostUsedCharacters.push({ "c": i, "timesUsed": 0 });
      this.charsetMap[i] = 0;
    }        

    if(exportAsECM && !isECM) {
      var needsReordering = false;

      // need to make a charset map
      for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
        if(frameIndex >= frameCount) {
          break;
        }
  //      var frame = this.editor.frames.frames[frameIndex];
        var frameData = layer.getFrameData(frameIndex).data;
        
        for(var y = 0; y < gridHeight; y ++) {
          for(var x = 0; x < gridWidth; x++) {
            var t = frameData[y][x].t;
            if(t >= 64) {
              needsReordering = true;
            }
            if(t < this.mostUsedCharacters.length) {
              this.mostUsedCharacters[t].timesUsed++;
            }
          }
        }
      }

      this.mostUsedCharacters.sort(function(a, b) {
        return b.timesUsed - a.timesUsed;
      });

      if(needsReordering) {
        // get the top used 64 chars
        for(var i = 0; i < 64; i++) {
          if(i < this.mostUsedCharacters.length) {
            var c = this.mostUsedCharacters[i].c;
            this.charsetMap[c] = i;
          }
        }
      } else {
        for(var i = 0; i < tileCount; i++) {
          this.mostUsedCharacters[i] = { "c": i, "timesUsed": 0 };
          this.charsetMap[i] = i;
        }        
      }
      // get the most used background colours
      this.getExtendedColorBGColors({ layer: layer, fromFrame: fromFrame, toFrame: toFrame, gridWidth: gridWidth, gridHeight: gridHeight });
    }
    
    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      if(frameIndex >= frameCount) {
        break;
      }
//      var frame = this.editor.frames.frames[frameIndex];
      var frameData = layer.getFrameData(frameIndex).data;

      if(exportAsECM && !isECM) {
        
        /*
        // ok, user wants to export as ECM, but they are not using ECM Mode..
        // need to get the four colours
        ecmColors = [];
        // just get the first 3 background colors
        ecmColors.push(layer.getBackgroundColor(frameIndex));

        // first colour is the frame background colour
        for(var y = 0; y < gridHeight; y ++) {
          for(var x = 0; x < gridWidth; x++) {
            var bc = frameData[y][x].bc;
            var t = frameData[y][x].t;

            if(bc != this.editor.colorPaletteManager.noColor) {
              if( ecmColors.indexOf(bc) == -1) {
                ecmColors.push(bc);
              }
            }

            if(ecmColors.length == 4) {
              // found 4 colours, lets break
              //break;
            }
          }

          if(ecmColors.length == 4) {
            // found 4 colours, lets break
            //break;
          }
        }      
        */

      }
  
      var tileData = [];//new Uint8Array(dataSize);  
      var colorData = [];//new Uint8Array(dataSize);

      var index = 0;

      if(args.format == 'mz80a') {
        // 01 for object file
        tileData[index++] = 01;
 
        // 17 bytes for file name
        tileData[index++] = 0x4d;
        tileData[index++] = 0x5a;
        tileData[index++] = 0x20;
        tileData[index++] = 0x46;
        tileData[index++] = 0x49;
        tileData[index++] = 0x4c;
        tileData[index++] = 0x45;
        tileData[index++] = 0x4e;
        tileData[index++] = 0x41;
        tileData[index++] = 0x4d;
        tileData[index++] = 0x45;
        tileData[index++] = 0x0d;
        tileData[index++] = 0x0d;
        tileData[index++] = 0x0d;
        tileData[index++] = 0x0d;
        tileData[index++] = 0x0d;
        tileData[index++] = 0x0d;

        // 2 bytes for size of data block (1000 bytes)
        tileData[index++] = 0xe8;
        tileData[index++] = 0x03;

        // 2 bytes for address of data block
        tileData[index++] = 0x00;
        tileData[index++] = 0xd0;

        // 2 bytes for execution address
        tileData[index++] = 0x00;
        tileData[index++] = 0x00;

        // 92/104 bytes? for supplemental information
        for(var i = 0; i < 104; i++) {
          tileData[index++] = 0x00;
        }

      }

      if(args.format == 'c64') {
        tileData[index] = 0x0;
        colorData[index] = 0x0;
        index++;
        tileData[index] = 0x04;
        colorData[index] = 0xd8;
        index++;
      }

      var yStart = this.editor.frames.height - 1;
      var yLimit = -1;
      var yIncrement = -1;

      for(var y = 0; y < gridHeight; y ++) {
        for(var x = 0; x < gridWidth; x++) {
          var tileIndex = frameData[y][x].t;

          var bc = frameData[y][x].bc;
          if(exportAsECM) {
            if(!isECM) {
              // want ecm output, but not using ecm mode
              // need to find ecm index of background colour

              bc = this.extendedColorBGColors.indexOf(bc);            
//              bc = ecmColors.indexOf(bc);
              if(bc < 0 || bc > 3) {
                // out of range for ecm
                bc = 0;
              }
            }


            if(!isECM) {
              if(tileIndex < this.charsetMap.length) {
                tileIndex = this.charsetMap[tileIndex];
              }
            }

            // limit to 64
            tileIndex = tileIndex & 0x3f;

            switch(bc) {
              /*
              case this.editor.colorPaletteManager.noColor:
              case 0:
              break;
              */
              case 1:
                tileIndex = tileIndex | 0x40;
              break;
              case 2:
                tileIndex = tileIndex | 0x80;
              break;
              case 3:
                tileIndex = tileIndex | 0xc0;
              break;
            }
          }
          tileData[index] = tileIndex & 0xff;
          if(format == 'mz700') {
            var fc = frameData[y][x].fc & 0x7;
            var bc = frameData[y][x].bc;

            if(bc === this.editor.colorPaletteManager.noColor) {
              bc = layer.getBackgroundColor(frameIndex);
            }

            bc = bc & 0x7;

            colorData[index] = bc | (fc << 4);

            if(frameData[y][x].t >= 256) {
              colorData[index] = colorData[index] | 0x80;
            }
          } else {
            colorData[index] = frameData[y][x].fc;
          }
          index++;
        }
      }


  //    dataSize = 2048;
  //    dataSize += 2;

      var frameNumber = frameIndex + 1;
      //var layerNumber = z + 1;
      var layerName = layer.getLabel();

      if(exportScreen) {
        var characterBinaryData = new Uint8Array(tileData.length);
        for(var i = 0; i < tileData.length; i++) {
          characterBinaryData[i] = tileData[i];
        }

        zip.file("ScreenCharacterData_" + layerName + "_Frame_" + frameNumber  + extension, characterBinaryData);
      }

      if(exportColor) {
        var colorBinaryData = new Uint8Array(colorData.length);
        for(var i = 0; i < colorData.length; i++) {
          colorBinaryData[i] = colorData[i];
        }
        zip.file("ScreenColorData_" + layerName + "_Frame_" + frameNumber   + extension, colorBinaryData);
      }

    }



    if(exportTileSet) {   
      var tileSetData = [];//new Uint8Array(dataSize);
      var tileSetManager = this.editor.tileSetManager;
      var tileSet = tileSetManager.getCurrentTileSet();

      var tileWidth = tileSet.getTileWidth();
      var tileHeight = tileSet.getTileHeight();

      index = 0;

      if(args.format == 'c64') {
        tileSetData[index++] = 0x00;
        tileSetData[index++] = 0x38;
      }

      for(var i = 0; i < tileSet.tileCount; i++) {
        var c = i;
        if(exportAsECM && !isECM) {
          c = c & 0x3f;
          if(c < this.mostUsedCharacters.length) {
            c = this.mostUsedCharacters[c].c;
          }
        }
  
        for(var y = 0; y < tileHeight; y++) {
          var b = 0;
          for(var x = 0; x < tileWidth; x++) {
              // set the bit
            if(tileSet.getPixel(c, x, y)) {
              b = b | (1 << (7-x));
            }
          }
          //this.charsetData.push(b);
          tileSetData[index++] = b;
        }
      }

      var tileSetBinaryData = new Uint8Array(tileSetData.length);
      for(var i = 0; i < tileSetData.length; i++) {
        tileSetBinaryData[i] = tileSetData[i];
      }
      zip.file("TileSetData" + extension, tileSetBinaryData);
    }

    if(exportTileAttributeData) {
      var tileSetAttributeData = [];
      var tileSetManager = this.editor.tileSetManager;
      var tileSet = tileSetManager.getCurrentTileSet();

      var tileWidth = tileSet.getTileWidth();
      var tileHeight = tileSet.getTileHeight();

      for(var i = 0; i < tileSet.tileCount; i++) {
        var color = tileSet.getTileColor(i) & 0xf;
        var material = tileSet.getTileMaterial(i) & 0xf;
        var value = color + (material << 4);
        tileSetAttributeData.push(value);
      }

      var tileSetBinaryAttributeData = new Uint8Array(tileSetAttributeData.length);
      for(var i = 0; i < tileSetAttributeData.length; i++) {
        tileSetBinaryAttributeData[i] = tileSetAttributeData[i];
      }

      extension = '.bin';
      zip.file("TileSetAttributeData" + extension, tileSetBinaryAttributeData);

    }

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
//        saveAs(blob, filename + ".zip");
    });    

  },

  exportBinaryData: function() {
    var args = {};
    args.filename = $('#exportBinaryAs').val();

    args.format = $('input[name=exportBinaryFormat]:checked').val();
    args.colorMode = $('input[name=exportBinaryColorMode]:checked').val();

    args.exportMapData = $('#exportBinaryCharacterData').is(':checked');
    args.exportColorData = $('#exportBinaryColorData').is(':checked');
    args.exportTileData = $('#exportBinaryCharactersetData').is(':checked');
    args.exportTileAttributeData = $('#exportBinaryCharacterAttributeData').is(':checked');

    args.fromFrame = parseInt($('#exportBinaryFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportBinaryToFrame').val(), 10);

    args.layer = $('input[name=exportBinaryLayer]:checked').val();

    this.exportBinaryDataAs(args);
  }  
}