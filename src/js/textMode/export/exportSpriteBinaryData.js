var ExportSpriteBinaryData = function() {
  this.editor = null;
}


// mz700
// https://www.sharpmz.no/articles/the-mz-series/mz-700/mz-700-v-ram/

ExportSpriteBinaryData.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      var width = 420;
      var height = 380;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSpriteBinaryDataDialog", "title": "Export Sprite Binary Data", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportSpriteBinaryData.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportSpriteBinaryData();
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

    UI.showDialog("exportSpriteBinaryDataDialog");
  },  

  initContent: function() {

    $('#exportSpriteBinaryAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportSpriteBinaryToFrame').val(frameCount);
    $('#exportSpriteBinaryFromFrame').val(1);

    $('#exportSpriteBinaryFromFrame').attr('max', frameCount);
    $('#exportSpriteBinaryToFrame').attr('max', frameCount);
  },

  initEvents: function() {
    var _this = this;
  },
  
  exportBinaryDataAsMega65: function(args) {
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
    var exportTileSet = true;//args.exportTileData;
    var exportPalette = true;

    var zip = new JSZip();

    var frameCount = this.editor.graphic.getFrameCount();
    var gridHeight = layer.getGridHeight();
    var gridWidth = layer.getGridWidth();

    var frameNumber = 1;
    var layerName = layer.getLabel();
    var frameCount = this.editor.graphic.getFrameCount()

    var tileData = [];
    if(exportTileSet) {
      var tileDataLength = tileCount * tileHeight * tileWidth;
      tileDataLength = tileDataLength / 2;
//      var tileData = new Uint8Array(tileCount * tileHeight * tileWidth);
      var tileData = new Uint8Array(frameCount * tileHeight * tileWidth);
      var pos = 0;


//      for(var tileIndex = 0; tileIndex < tileCount; tileIndex++) {
      for(var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
        var cellX = 0;
        var cellY = 0;
        var cellData = layer.getCell({ x: cellX, y: cellY, frame: frameIndex });
        var tileIndex = cellData.t;

        for(var y = 0; y < tileHeight; y++) {
          for(var x = 0; x < tileWidth; x++) {
            var b = tileSet.getPixel(tileIndex, x, y) & 0xf;

            if(x % 2) {
              tileData[pos] = tileData[pos] | (b);
              pos++;
            } else {
              tileData[pos] = (b << 4);
            }
          }
        }
      }
      zip.file("SpriteData_" + layerName  + extension, tileData);
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

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
    });    


  },
  
  exportBinaryDataAsC64: function(args) {
    var filename = g_app.fileManager.filename;

    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var graphic = this.editor.graphic;
    var layers = this.editor.layers.getLayers();
    var layerCount = layers.length;

    var fromFrame = args.fromFrame - 1;
    var toFrame = args.toFrame;//graphic.getFrameCount();

    if(toFrame > graphic.getFrameCount()) {
      toFrame = graphic.getFrameCount() ;
    }

    var numberFormat = args.numberFormat;
    if(numberFormat == 'bin') {
      columns = 3;
    }

    var type = 'c64';
    if(typeof args.type != 'undefined') {
      type = args.type;
    }


    var spriteCount = 0;
    var bytes = [];

    for(var f = fromFrame; f < toFrame; f++) {
      for(var l = 0; l < layerCount; l++) {
        var layer = this.editor.layers.getLayerObjectFromIndex(l);
        if(layer && layer.getType() == 'grid') {
          var screenMode = layer.getScreenMode();
          
          var tileSet = layer.getTileSet();
          var gridWidth = layer.getGridWidth();
          var gridHeight = layer.getGridHeight();
          var tileWidth = tileSet.getTileWidth();
          var tileHeight = tileSet.getTileHeight();

          for(var gridY = 0; gridY < gridHeight; gridY++) {
            for(var gridX = 0; gridX < gridWidth; gridX++) {

              var column = 0;
              var pixelsPerColumn = 8;
              if(type == 'fcm') {
                pixelsPerColumn = tileWidth;
              }
              var tileColumns = Math.ceil(tileWidth / pixelsPerColumn);
            
              var cellData = layer.getCell({ x: gridX, y: gridY, frame: f });
              var tile = cellData.t;
              var color = cellData.fc;
              if(tile !== false) {
                spriteCount++;

                for(var y = 0; y < tileHeight; y++) {
                  // for a c64 sprite, there are 3 columns of 1 byte in a row
                  for(var tileColumn = 0; tileColumn < tileColumns; tileColumn++) {

                    if(type == 'fcm') {
                      for(var x = 0; x < pixelsPerColumn; x += 2) {
                        var tilePixelX = tileColumn * 8 + x;
                        var b1 = (tileSet.getPixel(tile, tilePixelX, y)) & 0xf;
                        var b2 = (tileSet.getPixel(tile, tilePixelX + 1, y)) & 0xf;
                        b = (b1 << 4) & 0xf0;
                        b += (b2 & 0xf);
                        bytes.push(b);                        
                      }
                    } else {
                      var b = 0;

                      for(var x = 0; x < 8; x++) {
                        var tilePixelX = tileColumn * 8 + x;
                        if(tileSet.getPixel(tile, tilePixelX, y)) {
                          b = b | (1 << (7-x));
                        }
                      }

                      bytes.push(b);
                    }
                  }
                }

                if(type == 'c64') {
                  // add mode and colour information as last byte
                  var b = color;
                  if(layer.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
                    b |= 0x80;
                  }
                  bytes.push(b);
                }        
              }
            }
          }
        }
      }
    }

    var binaryData = new Uint8Array(bytes.length);
    for(var i = 0; i < bytes.length; i++) {
      binaryData[i] = bytes[i];
    }

    download(binaryData, filename + ".bin", "application/bin");
  },

  exportBinaryDataAs: function(args) {
    console.log('export binary data');
    console.log(args);
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

    if(format == 'c64') {
      this.exportBinaryDataAsC64(args);
    }

  },

  exportSpriteBinaryData: function() {
    var args = {};
    args.filename = $('#exportSpriteBinaryAs').val();

    args.format = $('input[name=exportSpriteBinaryFormat]:checked').val();


    args.fromFrame = parseInt($('#exportSpriteBinaryFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportSpriteBinaryToFrame').val(), 10);

    args.layer = $('input[name=exportSpriteBinaryLayer]:checked').val();

    this.exportBinaryDataAs(args);
  }  
}