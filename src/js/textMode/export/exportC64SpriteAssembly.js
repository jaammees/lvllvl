var ExportC64SpriteAssembly = function() {
  this.editor = null;
  this.asmEditor = null;
}

ExportC64SpriteAssembly.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportC64SpriteAssemblyDialog", "title": "Export Assembly", "width": 600, "height": 600 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportC64SpriteAssembly.html', function() {
        _this.initContent();
        _this.initEvents();
      });

/*
      this.okButton = UI.create('UI.Button', { "text": "Save", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportC64Assembly({});
        UI.closeDialog();
      });
*/
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

    UI.showDialog("exportC64SpriteAssemblyDialog");
  },  

  initContent: function() {
    if(this.asmEditor == null) {
      this.asmEditor = ace.edit("exportC64SpriteAssemblySource");
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


    $('#exportC64SpriteAssemblyAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportC64SpriteAssemblyToFrame').val(frameCount);
    $('#exportC64SpriteAssemblyFromFrame').val(1);

    $('#exportC64SpriteAssemblyFromFrame').attr('max', frameCount);
    $('#exportC64SpriteAssemblyToFrame').attr('max', frameCount);


    this.exportC64Assembly({ displayOnly: true });

  },

  initEvents: function() {
    var _this = this;

    $('input[name=exportC64SpriteAssemblyType]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('input[name=exportC64SpriteAssemblyFormat]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('#exportC64SpriteAssemblyFromFrame').on('change', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('#exportC64SpriteAssemblyToFrame').on('change', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });

    $('input[name=exportC64SpriteNumberFormat]').on('click', function() {
      _this.exportC64Assembly({ displayOnly: true });
    });


    $('#exportC64SpriteAssemblyDownload').on('click', function() {
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

  

  exportC64Format: function(args) {
    var columns = 16;

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


    var lineEnding = '\r\n';
    var byteLabel = '!byte ';

    var byteLabel = this.getByteLabel(args);
    var commentSymbol = this.getCommentSymbol(args);
    var constSymbol = this.getConstSymbol(args);
    var labelPostfix = this.getLabelPostfix(args);
    var setPCSymbol = this.getSetPCSymbol(args);


    if(type == 'fcm') {
      columns = 8;
    }

    var spriteCount = 0;
    var output = '';
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

          var layerName = layer.getLabel();

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

                console.log('export tile ' + tile);


                //output += 'spr_img' + spriteCount + lineEnding;
                output += 'spr_img_' + f + '_' + l + labelPostfix + lineEnding;
                output += commentSymbol + ' Frame: ' + f + lineEnding;
                output += commentSymbol + ' Layer: ' + layerName + lineEnding;
                output += lineEnding;
                spriteCount++;

                var bytes = [];
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
                      if(false && screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
                        for(var x = 0; x < 8; x++) {
                          var tilePixelX = tileColumn * 8 + x;
                          var bit1 = tileSet.getPixel(tile, tilePixelX, y);

                          var tilePixelX = tileColumn * 8 + x + 1;
                          var bit2 = tileSet.getPixel(tile, tilePixelX, y);

                          // translate from char bits to sprite bits
                          if(bit1 == 0 && bit2 == 1) {
                            bit1 = 0;
                            bit2 = 1;
                          } else if(bit1 == 1 && bit2 == 0) {
                            bit1 = 1;
                            bit2 = 1;
                          } else if(bit1 == 1 && bit2 == 1) {
                            bit1 = 1;
                            bit2 = 0;
                          }
                          if(bit1) {
                            b = b | (1 << (7-x));
                          }

                          x++;
                          if(bit2) {
                            b = b | (1 << (7-x));
                          }
                          /*
                          if(tileSet.getPixel(tile, tilePixelX, y)) {
                            b = b | (1 << (7-x));
                          }
                          */
                        }

                      } else {
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
                }

                if(type == 'c64') {
                  // add mode and colour information as last byte
                  var b = color;
                  if(layer.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
                    b |= 0x80;
                  }
                  bytes.push(b);
                }

                for(var i = 0; i < bytes.length; i++) {
                  var b = bytes[i];

                  if(column !== 0) {
                    output += ',';
                  } else {
                    output += byteLabel;
                  }

                  if(numberFormat == 'hex') {
                    output += '$';
                    output += ("00" + b.toString(16)).substr(-2);   
                  }
                  if(numberFormat == 'dec') {
                    output += b.toString(10);
                  }
                  if(numberFormat == 'bin') {
                    output += '%';
                    output += ("00000000" + b.toString(2)).substr(-8);
                  }
                  column++;

                  if(column == columns) {
                    column = 0;
                    output += lineEnding;
                  }
                }


                output += lineEnding;


              }
            }
          }

          output += lineEnding + lineEnding;
        }
      }
    }


    var heading = commentSymbol + ' SPRITE IMAGE DATA : ' + spriteCount + ' image';
    if(spriteCount != 1) {
      heading += 's';
    }
    var size = spriteCount * 64;
    var sizeHex = ("0000" + size.toString(16)).substr(-4);

    heading += ' : total size is ' + size + ' ($' + sizeHex + ') bytes.';
    heading += lineEnding + lineEnding;
    output = heading + output;

    if(typeof args.displayOnly != 'undefined' && args.displayOnly) {
//      g_app.textDialog.setText(screenData);
//      g_app.textDialog.show();

      this.asmEditor.setValue(output, -1);
    } else {
      download(output, args.filename + '.txt', "application/txt");
    }
  },

/*
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

  },
  */

  download: function() {
    var filename = $('#exportC64SpriteAssemblyAs').val();
    filename += '.txt';

    var source = this.asmEditor.getValue();
    download(source, filename, "application/txt");

  },

  exportC64Assembly: function(args) {
    args.filename = $('#exportC64SpriteAssemblyAs').val();

    args.type = $('input[name=exportC64SpriteAssemblyType]:checked').val();

    args.format = $('input[name=exportC64SpriteAssemblyFormat]:checked').val();

    args.fromFrame = parseInt($('#exportC64SpriteAssemblyFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportC64SpriteAssemblyToFrame').val(), 10);
    args.numberFormat = $('input[name=exportC64SpriteNumberFormat]:checked').val();


    this.exportC64Format(args);

//    args.layer = $('input[name=exportC64AssemblyLayer]:checked').val();

//    this.colorPerMode = this.editor.getColorPerMode();
//    this.blockModeEnabled = this.editor.getBlockModeEnabled();

/*
    args.exportTileSet = $('#exportC64AssemblyCharactersetData').is(':checked');
    args.exportCharacterColorData = $('#exportC64AssemblyColorData').is(':checked') && this.colorPerMode == 'character';
    args.exportBlockColorData = $('#exportC64AssemblyBlockColorData').is(':checked') && this.colorPerMode == 'block';

    args.exportBlockData = $('#exportC64AssemblyBlockData').is(':checked') && this.blockModeEnabled;
    args.exportBlockMap = $('#exportC64AssemblyBlockMapData').is(':checked') && this.blockModeEnabled;
    args.exportCharMap = $('#exportC64AssemblyMapData').is(':checked');

    args.screenMode = this.editor.getScreenMode();
    this.exportC64AssemblyAs(args);
*/

  }  
}