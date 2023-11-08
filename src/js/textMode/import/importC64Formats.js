var ImportC64Formats = function() {
  this.editor = null;
  this.tileData = []; 
  this.screenData = [];
  this.colorData = []; 

  this.canvas = null;
  this.context = null;
  this.c64ImageData = null;
  this.crtData = null;

  this.rows = 25;
  this.cols = 40;
  this.bgColor = 6;
  this.borderColor = 6;

  this.visible = false;

//  this.c64 = null;
  this.viceSnapshotReader = null;
  this.importC = null;
  this.importSeq = null;
  this.importCharPad = null;

  this.importType = '';
  this.screnMode = TextModeEditor.Mode.TEXTMODE;
  this.extendedBackground = false;

  this.mouseDownOnPreview = false;

  this.previewOffsetX = 0;
  this.previewOffsetY = 0;

  this.commodoreKeyDown = false;

  this.uiPasteText = null;

  this.lastDriveStatus = false;
  this.lastDrivePosition = false;


  this.joystickPort = 0;
}

ImportC64Formats.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  initCharacterData: function() {
    this.tileData = [];
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileData = tileSet.getData();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    for(var c = 0; c < tileData.length; c++) {
      this.tileData[c] = [];
      for(var i = 0; i < charWidth * charHeight; i++) {
       this.tileData[c][i] = tileData[c][i];
      }
    }
  },

  initScreenData: function() {
    this.screenData = [];
    for(var i = 0; i < this.rows * this.cols; i++) {
      this.screenData[i] = i %256;
    }
  },

  initColorData: function() {
    this.colorData = [];
    for(var i = 0; i < this.rows * this.cols; i++) {
      this.colorData[i] = 14;
    }

  },

  showPasteTextDialog: function() {

    var _this = this;

    if(this.uiPasteText == null) {
      this.uiPasteText = UI.create("UI.Dialog", { "id": "importC64PasteDialog", "title": "Paste Text", "width": 400, "height": 300 });

      var pasteTextHTML = '<div class="panelFill">';
      pasteTextHTML += '<div style="position: absolute; top: 6px; bottom: 6px; left: 6px; right: 6px">';
      pasteTextHTML += '<textarea id="importC64PasteText" style="position: absolute; top: 0px; left: 0px; bottom: 0px; width: 100%"></textarea>';
      pasteTextHTML += '</div>';
      pasteTextHTML += '</div>';
      this.pasteHtmlComponent = UI.create("UI.HTMLPanel", { "html": pasteTextHTML});
      this.uiPasteText.add(this.pasteHtmlComponent);

      this.pasteOkButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiPasteText.addButton(this.pasteOkButton);
      this.pasteOkButton.on('click', function(event) {
        var text = $('#importC64PasteText').val();
        _this.doC64PasteText(text);
        UI.closeDialog();
      });

      this.pasteCloseButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiPasteText.addButton(this.pasteCloseButton);
      this.pasteCloseButton.on('click', function(event) {
        UI.closeDialog();
      });

    }

    UI.showDialog('importC64PasteDialog');
  },

  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "importC64FormatsDialog", "title": "Import", "width": 615, "height": 500 });

      this.uiComponent.on('keydown', function(event) {
        _this.keyDown(event);
      });

      this.uiComponent.on('keyup', function(event) {
        _this.keyUp(event);
      });


      this.uiComponent.on('keypress', function(event) {
        _this.keyPress(event);
      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
      });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/importC64Formats.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "Import", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.doImport();
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
    UI("importC64FormatsDialog").setWidth(615);
    UI("importC64FormatsDialog").setHeight(490);

    UI.showDialog("importC64FormatsDialog");
    this.visible = true;
  },  

  initContent: function() {

    if(this.canvas == null) {
      this.canvas = document.getElementById('importC64FormatsPreview');
      this.canvas.width = 384;//320;
      this.canvas.height = 272;//200;
      this.context = this.canvas.getContext('2d');
      this.c64ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {

        this.bgColor = layer.getBackgroundColor();
        this.borderColor = layer.getBorderColor();
        this.multi1 = layer.getC64Multi1Color();
        this.multi2 = layer.getC64Multi2Color();
      }

    }
    this.initCharacterData();
    this.initScreenData();
    this.initColorData();


    this.showC64();

    var joystickPort = parseInt($('input[name=importC64JoystickPort]:checked').val(), 10);
    this.setJoystickPort(joystickPort);


    $('.importC64Settings').hide();
//    $('#importPetsciiCSettings').show();

    $('#importC64Settings').show();
    document.getElementById('importC64FormatsForm').reset();

  },

  initEvents: function() {
    var _this = this;

    $('#importC64FormatsChooseFile').on('click', function() {
      $('#importC64FormatsSourceFile').click();
    });

    document.getElementById('importC64FormatsSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('importC64FormatsSourceFile').files[0];
      _this.setImportFile(file);
    });


    $('#c64SaveState').on('click', function() {
//      _this.c64.saveState();
    });

    $('#c64RestoreState').on('click', function() {
//      _this.c64.restoreState();
    });

    $('#importC64FormatsButton').on('click', function() {
      _this.doImport();
    });

    $('#importC64FormatsFramesPrev').on('click', function() {
      _this.changeFrame(-1);
    });


    $('#importC64FormatsFramesNext').on('click', function() {
      _this.changeFrame(1);
    });

    $('#importC64FormatsPreview').on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });

    $('#importC64FormatsPreview').on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });

    $('#importC64FormatsPreview').on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#importC64FormatsPreview').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#importC64FormatsPreview').on('mouseup', function(event) {
      _this.mouseUp(event);
    });


    $('#importC64PRGReset').on('click', function(event) {
      _this.resetC64();

    });

    $('#importC64PRGPaste').on('click', function(event) {
      _this.c64Paste();
    });

    $('#importC64PRGCMDKey').on('click', function(event) {
      _this.c64CommodoreKey();
    });

/*
    $('#importC64EnableJoystick').on('click', function(event) {
      _this.setJoystickEnabled($(this).is(':checked'));
    });
*/
    $('input[name=importC64JoystickPort]').on('click', function(e) {
      var port = parseInt($('input[name=importC64JoystickPort]:checked').val(), 10);
      _this.setJoystickPort(port);

    });

  },


  mouseEnter: function(event) {
    if(this.screenWidth > 40 || this.screenHeight > 25) {
      UI.setCursor('can-drag-scroll');
    } else {
      UI.setCursor('default');
    }
  },

  mouseLeave: function(event) {
    UI.setCursor('default');
  },


  mouseDown: function(event) {

    this.mouseDownX = event.pageX;
    this.mouseDownY = event.pageY;
    this.mouseDownOffsetX = this.previewOffsetX;
    this.mouseDownOffsetY = this.previewOffsetY;

    this.mouseDownOnPreview = true;
    UI.captureMouse(this, 'drag-scroll');
    UI.setCursor('drag-scroll');

  },

  mouseMove: function(event) {
    if(this.mouseDownOnPreview) {
      UI.setCursor('drag-scroll');
      var previewOffsetX = this.mouseDownOffsetX +  Math.floor((event.pageX - this.mouseDownX) / 8);
      var previewOffsetY = this.mouseDownOffsetY + Math.floor((event.pageY - this.mouseDownY) / 8);

      var previewWidth = 40;
      var previewHeight = 25;
      if(-previewOffsetX + previewWidth > this.screenWidth) {
        previewOffsetX = -(this.screenWidth - previewWidth);
      }
      if(-previewOffsetX < 0) {
        previewOffsetX = 0;
      }

      if(-previewOffsetY + previewHeight > this.screenHeight) {
        previewOffsetY = -(this.screenHeight - previewHeight);
      }
      if(-previewOffsetY < 0) {
        previewOffsetY = 0;
      }

      if(this.previewOffsetX != previewOffsetX || this.previewOffsetY != previewOffsetY) {
        this.previewOffsetX = previewOffsetX;
        this.previewOffsetY = previewOffsetY;

        switch(this.importType) {
          case 'ctm':
            this.getCharPadScreenData();      
            break;
          case 'c':
            this.getCScreenData();
          break;
        }
        this.drawScreen();
      }
    }
  },

  mouseUp: function(event) {
    this.mouseDownOnPreview = false;
    UI.setCursor('default');

  },

  drawScreen: function() {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var charWidth = 8;
    var charHeight = 8;


    var screenMode = this.screenMode;

    var screenWidth = charWidth * 40;
    var screenHeight = charHeight * 25;
    var borderWidth = Math.floor((this.canvas.width - screenWidth) / 2);
    var borderHeight = Math.floor((this.canvas.height - screenHeight) / 2);

    var imageData = this.context.getImageData(0, 0, screenWidth, screenHeight);

    var bgColor = colorPalette.getHex(this.bgColor);
    var bgColorR = (bgColor >> 16) & 255;
    var bgColorG = (bgColor >> 8) & 255;
    var bgColorB =  bgColor & 255;



    for(var p = 0; p < this.screenData.length; p++) {
      screenMode = this.screenMode;

      var ch = this.screenData[p];
      var colorIndex = this.colorData[p];
      if(colorIndex < 8) {
        screenMode = TextModeEditor.Mode.TEXTMODE;
      }

      var charX = p % this.cols;
      var charY = Math.floor(p / this.cols);

      var charData = this.tileData[ch];

      var colors = [];
      if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {

        colorIndex -= 8;
        var cellColor = colorIndex;
        colors = [];
        colors.push(colorPalette.getColor(this.bgColor));
        colors.push(colorPalette.getColor(this.multi1));
        colors.push(colorPalette.getColor(this.multi2));
        colors.push(colorPalette.getColor(cellColor));
      }


      var color = colorPalette.getHex(colorIndex);
      var colorR = (color >> 16) & 255;
      var colorG = (color >> 8) & 255;
      var colorB =  color & 255;


      for(var j = 0; j < charHeight; j++) {
        for(var i = 0; i < charWidth; i++) {

          var srcPos = i + j * charWidth;
          var colorIndex = charData[srcPos];

          var dstPos = ((charX * charWidth) + i + ((charY * charHeight) + j) * imageData.width) * 4;


          if(screenMode == TextModeEditor.Mode.TEXTMODE) {
            if(colorIndex > 0) {
              imageData.data[dstPos] = colorR; 
              imageData.data[dstPos + 1] = colorG;
              imageData.data[dstPos + 2] = colorB;
              imageData.data[dstPos + 3] = 255;

            } else  {
              imageData.data[dstPos] = bgColorR;
              imageData.data[dstPos + 1] = bgColorG;
              imageData.data[dstPos + 2] = bgColorB;
              imageData.data[dstPos + 3] = 255;
            }
          } else if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {

            var value = 0;

            // upper bit
            if(colorIndex > 0) {
              value += 2;
            }

            colorIndex = charData[srcPos + 1];

            // lower bit
            if(colorIndex > 0) {
              value += 1;
            }

            // TODO: do this without multiplications
            var color = colors[value];
            if(value == 0) {
              // background..
              imageData.data[dstPos] = bgColorR;
              imageData.data[dstPos + 1] = bgColorG;
              imageData.data[dstPos + 2] = bgColorB;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = bgColorR;
              imageData.data[dstPos + 5] = bgColorG;
              imageData.data[dstPos + 6] = bgColorB;
              imageData.data[dstPos + 7] = 255;


            } else if(value == 3) {
              imageData.data[dstPos] = colorR; 
              imageData.data[dstPos + 1] = colorG;
              imageData.data[dstPos + 2] = colorB;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = colorR;
              imageData.data[dstPos + 5] = colorG;
              imageData.data[dstPos + 6] = colorB;
              imageData.data[dstPos + 7] = 255;
            } else {
              imageData.data[dstPos] = color.r * 255; 
              imageData.data[dstPos + 1] = color.g * 255;
              imageData.data[dstPos + 2] = color.b * 255;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = color.r * 255; 
              imageData.data[dstPos + 5] = color.g * 255;
              imageData.data[dstPos + 6] = color.b * 255;
              imageData.data[dstPos + 7] = 255;
            }

            // need to skip next pixel cos c64 multicolor
            i++;          
          }
        }
      }
    }

    var borderColor = colorPalette.getHexString(this.borderColor);
    this.context.fillStyle = '#' + borderColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


    this.context.putImageData(imageData, borderWidth, borderHeight);

  },


  // ---------------------------- Load SEQ ------------------------- //

  loadSeq: function(file) {
    this.importType = 'seq';
    this.screenMode = TextModeEditor.Mode.TEXTMODE;

    if(this.importSeq == null) {
      this.importSeq = new ImportSeq();
      this.importSeq.init(this.editor);
    }

    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();
    $('#importC64PRGControls').hide();


    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);
      var result = _this.importSeq.readSeq(byteArray);
      _this.showSeq();
    };
    reader.readAsArrayBuffer(file);

  },


  showSeq: function() {

    $('.importC64Settings').hide();
    $('#importSEQSettings').show();
    $('#importC64PRGControls').hide();


    var info = '';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Format:</div>';
    info += '<div>SEQ</div>';
    info += '</div>';


    this.screenWidth = this.importSeq.getScreenWidth();
    this.screenHeight = this.importSeq.getScreenHeight();
    var frameCount = this.importSeq.getFrameCount();

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Screen Size:</div>';
    info += '<div>' + this.screenWidth + ' x ' + this.screenHeight + '</div>';
    info += '</div>';


    info += '<div class="c64ImportRow"';
    info += '<div class="c64ImportHeading">Frame Count:</div>';
    info += '<div>' + frameCount + '</div>';
    info += '</div>';


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(!tileSet.isPetscii()) {
      info += '<div class="c64ImportRow">';
      info += 'Current tile set will be changed to PETSCII';
      info += '</div>';
    }

    $('#importSEQSettings').html(info);

    this.importSeq.getScreenData(this.screenData);
    this.importSeq.getColorData(this.colorData);

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      this.bgColor = layer.getBackgroundColor();
    }
    this.readCharacterBinaryData(C64CharROM);
    this.drawScreen();

  },


  doImportSeq: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert("Please select a grid layer");
      return;
    }

    this.editor.setScreenMode(TextModeEditor.Mode.TEXTMODE);      

    var args = {};
    args.update = false;
    for(var y = 0; y < 25; y++) {
      for(var x = 0; x < 40; x++) {
        var pos = x + y * 40;
        var c = this.screenData[pos];
        var bc = this.editor.colorPaletteManager.noColor;

        if(this.extendedBackground) {
          var backgroundColorIndex = (c) >> 6;
          bc = this.bgColor;
          if(backgroundColorIndex == 1) {
            bc = this.multi1;
          }
          if(backgroundColorIndex == 2) {
            bc = this.multi2;
          }
          c = c & 0x3f;
        }
        args.x = x;
// reverseY        args.y = 24 - y;
        args.y = y;        
        args.t = c; 
        args.fc = this.colorData[pos];
        args.bc = bc;
        layer.setCell(args);
      }
    }

    this.editor.graphic.redraw({ allCells: true });

  },


  // -------------------------------  Import PETSCII C ---------------------------- //

  loadC: function(file) {
    if(this.importC == null) {
      this.importC = new ImportC();
      this.importC.init(this.editor);
    }

    $('#importC64FormatsFrames').show();
    $('#importC64FormatsViceSettings').hide();
    $('#importC64PRGControls').hide();


    this.screenMode = TextModeEditor.Mode.TEXTMODE;
    this.previewOffsetX = 0;
    this.previewOffsetY = 0;

    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var result = _this.importC.read(e.target.result);
      _this.frame = 0;
      _this.showC();
//      _this.readJson(e.target.result);

    }
    fileReader.readAsText(file);

    this.importType = 'c';
  },

  showC: function() {

    $('.importC64Settings').hide();
    $('#importPetsciiCSettings').show();

    var info = '';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Format:</div>';
    info += '<div>PETSCII C</div>';
    info += '</div>';


    this.screenWidth = this.importC.getScreenWidth();
    this.screenHeight = this.importC.getScreenHeight();
    var frameCount = this.importC.getFrameCount();

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Screen Size:</div>';
    info += '<div>' + this.screenWidth + ' x ' + this.screenHeight + '</div>';
    info += '</div>';


    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Frame Count:</div>';
    info += '<div>' + frameCount + '</div>';
    info += '</div>';


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(!tileSet.isPetscii()) {
      info += '<div class="c64ImportRow">';
      info += 'Current tile set will be changed to PETSCII';
      info += '</div>';
    }


    $('#importPetsciiCSettings').html(info);

    this.showFrames();
    this.getCScreenData();
    this.bgColor = this.importC.getBackgroundColor(this.frame);
    this.borderColor = this.importC.getBorderColor(this.frame);
    this.readCharacterBinaryData(C64CharROM);
    this.drawScreen();
  },

  getCScreenData: function() {
    this.importC.getScreenData(this.screenData, this.frame, -this.previewOffsetX, -this.previewOffsetY);
    this.importC.getColorData(this.colorData, this.frame, -this.previewOffsetX, -this.previewOffsetY);

  },


  doImportC: function() {

    this.importC.doImport();
    return;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please select a grid layer');
      return;
    }


    var frameCount = this.importC.getFrameCount();
    layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      

    this.screenWidth = this.importC.getScreenWidth();
    this.screenHeight = this.importC.getScreenHeight();
    var screenDepth = 1;

    this.editor.graphic.setGridDimensions({ width: this.screenWidth, height: this.screenHeight});


    var currentFrame = this.editor.graphic.getCurrentFrame();
    for(var frameIndex = 0; frameIndex < frameCount; frameIndex++) {

      if(frameIndex != 0) {
        var newFrame = this.editor.graphic.insertFrame();
        this.editor.frames.gotoFrame(newFrame);
      }

      this.screenData = [];
      this.importC.getScreenData(this.screenData, frameIndex);
      this.colorData = [];
      this.importC.getColorData(this.colorData, frameIndex);
      this.bgColor = this.importC.getBackgroundColor(frameIndex);
      this.borderColor = this.importC.getBorderColor(frameIndex);

      layer.setBackgroundColor(this.bgColor);
      layer.setBorderColor(this.borderColor);

      var args = {};
      
      args.update = false;
      for(var y = 0; y < this.screenHeight; y++) {
        for(var x = 0; x < this.screenWidth; x++) {
          var pos = x + y * this.screenWidth;
          var c = this.screenData[pos];
          var bc = this.editor.colorPaletteManager.noColor;

          if(this.extendedBackground) {
            var backgroundColorIndex = (c) >> 6;
            bc = this.bgColor;
            if(backgroundColorIndex == 1) {
              bc = this.multi1;
            }
            if(backgroundColorIndex == 2) {
              bc = this.multi2;
            }
            c = c & 0x3f;
          }
          args.x = x;
// reverseY          args.y = this.screenHeight - y - 1;
          args.y = y;
          
          args.t = c; 
          args.fc = this.colorData[pos];
          args.bc = bc;
          layer.setCell(args);
        }
      }
    }
 
    var tileSet = layer.getTileSet();

    if(!tileSet.isPetscii()) {
      tileSet.readBinaryData({ tileData: C64CharROM, characterWidth: 8, characterHeight: 8 });
      this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });
    }


    this.editor.frames.gotoFrame(currentFrame);
    this.editor.gridView2d.findViewBounds();    
    this.editor.graphic.invalidateAllCells();


    this.editor.graphic.redraw({ allCells: true });

  },


  showFrames: function() {
    var displayFrame = this.frame + 1;
    var frameCount = this.importC.getFrameCount();
    var html = 'Frame ' + displayFrame + ' of ' + frameCount;

    $('#importC64FormatsFrameInfo').html(html);
  },

  changeFrame: function(direction) {

    this.frame = this.frame + direction;
    if(this.frame < 0) {
      this.frame = 0;
    }

    if(this.frame >= this.importC.getFrameCount()) {
      this.frame = this.importC.getFrameCount() - 1;
    }
    this.showC();

  },


  loadPrg: function(file) {
    this.canvas.width = 384;
    this.canvas.height = 272;    
    this.context = this.canvas.getContext('2d');

    /*
    if(this.c64 == null) {
//      this.c64 = new C64JS();//new C64Interface();
      this.canvas.width = 384;
      this.canvas.height = 272;    
//      this.c64.init({ canvas: this.canvas });

    }
    */
    $('.importC64Settings').hide();
    $('#importC64PRGControls').show();
    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    $('#importC64Settings').show();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);

      /*
      c64_reset();
      c64_loadPRG(data, data.length, false);
      c64.insertText('run\n');
      */
      _this.startPRG(data, false);
    };
    reader.readAsArrayBuffer(file);


//    this.c64.loadPRG(file);

    this.importType = 'prg';
  },


  loadCrt: function(file) {
    this.canvas.width = 384;
    this.canvas.height = 272;    
    this.context = this.canvas.getContext('2d');

    $('.importC64Settings').hide();
    $('#importC64PRGControls').show();
    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    $('#importC64Settings').show();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      _this.startCRT(data, false);
    };
    reader.readAsArrayBuffer(file);


//    this.c64.loadPRG(file);

    this.importType = 'prg';
  },  

  startCRT: function(data) {
    if(this.crtData != null) {
      this.crtData = null;

      c64_removeCartridge();
    }

    c64_loadCRT(data, data.length);
    
  },


  
  startPRG: function(data, inject) {
    var loadAddress = data[0] + (data[1] << 8);
    console.log('load address = ' + loadAddress.toString(16));
    var endAddress = loadAddress - 2 + data.length;

    if(loadAddress == 0x801 && endAddress < 0xd000) {
      inject = true;
    }

    c64_reset();
    var delay = 1;
    delay = Math.random() * 100;

    setTimeout(function() {
      c64_loadPRG(data, data.length, inject ? 1:0);

      if(inject) {
        if(loadAddress < 0x4f0 && endAddress > 0x4f0) {
          // prg has overwritten screen ram..
        } else {
          c64.insertText('run:\n');
        }
        
      } else {
        setTimeout(function() {
          c64.insertText('load "*",8,1\nrun\n');
        }, 2000);
      }
    }, delay);

  },


  loadD64: function(file) {

    /*
    if(this.c64 == null) {
//      this.c64 = new C64JS();//new C64Interface();
//      this.canvas.width = 384;
//      this.canvas.height = 272;    
//      this.c64.init({ canvas: this.canvas });
    }
    */
    $('.importC64Settings').hide();
    $('#importC64PRGControls').show();
    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    $('#importC64Settings').show();

//    this.c64.c64.enableFloppyDiskDrives(true);
//    this.c64.attachDisk(file);

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      c64_insertDisk(data, data.length);
    };
    reader.readAsArrayBuffer(file);


    var filename = file.name;
    $('#importC64FormatsAttachedDisk').html(filename);

    this.importType = 'prg';
  },

  resetC64: function() {
//    this.c64.restoreState();
//    this.c64.machineReset();
    c64_reset();

    this.importType = 'prg';
    document.getElementById('importC64FormatsForm').reset();

    $('#importC64FormatsAttachedDisk').html('');
    $('.importC64Settings').hide();
    $('#importC64PRGControls').show();
    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    $('#importC64Settings').show();

  },

  setJoystickEnabled: function(enabled) {
//    this.c64.setJoystickEnabled(enabled);
  },

  setJoystickPort: function(port) {
    /*
    if(port === 0) {
      this.c64.setJoystickEnabled(false);
    } else {
      this.c64.setJoystickEnabled(true);
      this.c64.setJoystickPort(port - 1);
    }
*/
    var html = '';

    this.joystickPort = port;
    if(port === 0) {
      html += 'None';
    } else {
//      UI('c64-joysticknone').setChecked(false);
      if(port == 1) {
        html += 'Port 1';
//        $('#c64CompactJoystickPort1').prop('checked', true);

      }
      if(port == 2) {
        html += 'Port 2';
//        $('#c64CompactJoystickPort2').prop('checked', true);
      }
    }
//    $('#c64DebuggerJoystick').html(html);

  },

  c64CommodoreKey: function() {
    if(this.commodoreKeyDown) {
      this.commodoreKeyDown = false;
      keyboard.commodoreKeyUp();
    } else {
      this.commodoreKeyDown = true;
      keyboard.commodoreKeyDown();
    }

  },

  c64Paste: function() {
    this.showPasteTextDialog();

  },


  doC64PasteText: function(text)  {
    for(var i = 0; i < text.length; i++) {
      
    }
  },



  loadCharPad: function(file) {
    this.importType = 'ctm';

    if(this.importCharPad == null) {
      this.importCharPad = new ImportCharPad();
      this.importCharPad.init(this.editor);      
    }

    $('#importC64PRGControls').hide();
    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    this.previewOffsetX = 0;
    this.previewOffsetY = 0;

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);
      var result = _this.importCharPad.readCharPad(byteArray);
      _this.showCharPad();
    };
    reader.readAsArrayBuffer(file);


  },


  doImportCharPad: function() {

    var args = {};

    args.importC64CharPadCharacters = $('#importC64CharPadCharacters').is(':checked');
    args.importC64CharPadBlocks = $('#importC64CharPadBlocks').is(':checked');
    args.importC64CharPadMap = $('#importC64CharPadMap').is(':checked');
    args.useBlockMode = $('#importC64CharPadBlockMode').is(':checked');
    args.setColorPerMode = $('#importC64CharPadScreenColorMode').is(':checked');

    this.importCharPad.doImport(args);
/*
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var graphic = this.editor.graphic;
    graphic.setDrawEnabled(false);

//    var grid = this.editor.grid;
//    grid.setUpdateEnabled(false);




    if(!this.importCharPad.getTileSystem()) {
      this.useBlockMode = false;

    }


    this.screenWidth = this.importCharPad.getScreenWidth();
    this.screenHeight = this.importCharPad.getScreenHeight();
    var screenDepth = 1;

    if(this.importC64CharPadMap) {
      this.editor.graphic.setGridDimensions({ width: this.screenWidth, height: this.screenHeight});
    }


    var charData = this.importCharPad.getCharData();

    var tileSet = layer.getTileSet();
    var blockSet = layer.getBlockSet();

    if(this.importC64CharPadMap) {
      layer.setBackgroundColor(this.importCharPad.getBackgroundColor());
      this.editor.currentTile.setColor(this.importCharPad.getCharColor(), { update: false });
    }


    if(this.importC64CharPadCharacters) {
      
      tileSet.readBinaryData({ tileData: charData, tileCount: this.importCharPad.getCharCount(), characterWidth: 8, characterHeight: 8 });
      this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });

      if(this.importCharPad.getMulticolorMode()) {
        layer.setC64Multi1Color(this.importCharPad.getC64Multi1Color(), false);
        layer.setC64Multi2Color(this.importCharPad.getC64Multi2Color(), false);
        layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
      } else {
        layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      
      }

      // set screen mode will turn updates back on..
      graphic.setDrawEnabled(false);


      if(this.importCharPad.getColorMethod() == 2) {
        // color per character
        for(var c = 0; c < this.importCharPad.getCharCount(); c++) {
          var color = this.importCharPad.getCharacterColor(c);  
          tileSet.setTileColor(c, color);
        }
        if(this.setColorPerMode) {
          layer.setColorPerMode('character');
        }
      }

    }


    var tileWidth = this.importCharPad.getTileWidth();
    var tileHeight = this.importCharPad.getTileHeight();

    if(this.importC64CharPadBlocks) {

      if(this.editor.tools.drawTools.blockPalette) {
        this.editor.tools.drawTools.blockPalette.selectedBlock = false;
        this.editor.tools.drawTools.blockPalette.highlightBlock = false;
      }
      blockSet.clear();
      var tiles = this.importCharPad.getTiles();
      for(var i = 0; i < tiles.length; i++) {
        blockSet.createBlock({ data: tiles[i]});
      }

      if(this.setColorPerMode) {
        if(this.importCharPad.getColorMethod() == 1) {
          layer.setColorPerMode('block');

          for(var i = 0; i < tiles.length; i++) {
            var color = this.importCharPad.getTileColor(i);
            blockSet.setBlockColor(i, color);
          }
        }
      }
    }

    if(this.setColorPerMode) {
      if(this.importCharPad.getColorMethod() == 0) {
        // global color
        var color = this.importCharPad.getCharColor();
        for(var c = 0; c < this.importCharPad.getCharCount(); c++) {
          tileSet.setTileColor(c, color);
        }        
        layer.setColorPerMode('character');
      }
    }


    if(this.importC64CharPadMap) {

      if(this.useBlockMode) {
        layer.setBlockDimensions(tileWidth, tileHeight);
        layer.setBlockModeEnabled(true);
      } else {
        layer.setBlockModeEnabled(false);
      }

      this.editor.layers.updateLayerLabel(layer.getId());
      
      this.editor.history.setEnabled(false);

      var args = {};
      
      args.update = false;

      for(var y = 0; y < this.screenHeight; y++) {
        for(var x = 0; x < this.screenWidth; x++) {
          args.x = x;
// reverseY          args.y = this.screenHeight - y - 1;
          args.y = y;
          
          args.b = this.importCharPad.getBlockAt(x, y);
          args.t = this.importCharPad.getCharAt(x, y); 
          args.fc = this.importCharPad.getColorAt(x, y);
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
    this.editor.tools.drawTools.tilePalette.drawTilePalette();

    this.editor.layers.updateLayerLabel(layer.getId()); 
*/
  },


  showCharPad: function() {

    $('.importC64Settings').hide();
    $('#importC64CharPadSettings').show();
    var tileWidth = this.importCharPad.getTileWidth();
    var tileHeight = this.importCharPad.getTileHeight();

    var info = '';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Format:</div>';
    info += '<div>CharPad (Version ' + this.importCharPad.getVersion() + ')</div>';
    info += '</div>';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Characters:</div>';
    info += '<div>' + this.importCharPad.getTileCount() + '</div>';
    info += '</div>';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">' + styles.text.blockName + 's:</div>';
    info += '<div>' + this.importCharPad.getTileCount() + ' (CharPad Tiles)</div>';
    info += '</div>';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">' + styles.text.blockName + ' Size:</div>';
    info += '<div>' + tileWidth + ' x ' + tileHeight + '</div>';
    info += '</div>';

    this.screenWidth = this.importCharPad.getScreenWidth();
    this.screenHeight = this.importCharPad.getScreenHeight();
    var mapWidth = this.importCharPad.getMapWidth();
    var mapHeight = this.importCharPad.getMapHeight();


    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Map Size:</div>';
    info += '<div>' + this.screenWidth + ' x ' + this.screenHeight + ' Characters</div>';
//    info += '</div>';

//    info += '<div>';
//    info += '<div></div>';
    info += '<div style="margin-top: 2px">' + mapWidth + ' x ' + mapHeight + ' Blocks</div>';
    info += '</div>';

    var colorMode = 'Colour Per Character';
    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Colour Mode:</div>';
    info += '<div>' + colorMode + '</div>';  
    info += '</div>';


    $('#importC64CharPadInfo').html(info);

    $('#importC64CharPadVersion').html("Version: " + this.importCharPad.getVersion());
    $('#importC64CharPadCharCount').html(this.importCharPad.getTileCount() + " Characters");


    $('#importC64CharPadBlockSize').html(styles.text.blockName + " Size: " + tileWidth + "x" + tileHeight);    
    $('#importC64CharPadBlockCount').html(this.importCharPad.getTileCount() + " Blocks (CharPad Tiles)");

    this.screenWidth = this.importCharPad.getScreenWidth();
    this.screenHeight = this.importCharPad.getScreenHeight();
    var mapWidth = this.importCharPad.getMapWidth();
    var mapHeight = this.importCharPad.getMapHeight();

    $('#importC64CharPadMapSize').html("Map Size: " + this.screenWidth + "x" + this.screenHeight + " Characters, " + mapWidth + "x" + mapHeight + " Blocks");


    this.screenMode = TextModeEditor.Mode.TEXTMODE;
    if(this.importCharPad.getMulticolorMode()) {
      this.screenMode = TextModeEditor.Mode.C64MULTICOLOR;
    }

    this.colorData = [];
    this.screenData = [];
    for(var i = 0; i < 1000; i++) {
      this.screenData[i] = 32;
      this.colorData[i] = 14;
    }
    this.importCharPad.getScreenData(this.screenData);    
//    this.importCharPad.getColorData(this.colorData);

    this.bgColor = this.importCharPad.getBackgroundColor();
//    this.borderColor = this.viceSnapshotReader.getBorderColor();
    this.multi1 = this.importCharPad.getC64Multi1Color();
    this.multi2 = this.importCharPad.getC64Multi2Color();

    var characterBinaryData = [];

    var characterBinaryData = this.importCharPad.getCharData();


    this.readCharacterBinaryData(characterBinaryData);




    var previewWidth = 40;
    var previewHeight = 25;

    for(var i = 0; i < 1000; i++) {
      var x = i % previewWidth;
      var y = Math.floor(i / previewWidth);
      if(x < this.screenWidth && y < this.screenHeight) { 
        this.colorData[i] = this.importCharPad.getColorAt(x, y);
      }
    }

    this.bgColor = this.importCharPad.getBackgroundColor();
    this.drawScreen();

  },



  getCharPadScreenData: function() {
    var previewWidth = 40;
    var previewHeight = 25;
    this.importCharPad.getScreenData(this.screenData, false, -this.previewOffsetX, -this.previewOffsetY);    
    for(var i = 0; i < 1000; i++) {
      var x = i % previewWidth - this.previewOffsetX;
      var y = Math.floor(i / previewWidth) - this.previewOffsetY;
      if(x < this.screenWidth && y < this.screenHeight) { 
        this.colorData[i] = this.importCharPad.getColorAt(x, y);
      }
    }
  },


  loadVsf: function(file) {
    this.importType = 'vsf';

    $('#importC64PRGControls').hide();
    $('.importC64Settings').hide();
    $('#importC64FormatsViceSettings').show();
    $('#importC64FormatsFrames').hide();


    if(this.viceSnapshotReader == null) {
      this.viceSnapshotReader = new ViceSnapshotReader();
      this.viceSnapshotReader.init(this.editor);
    }

    this.previewOffsetX = 0;
    this.previewOffsetY = 0;
    this.screenWidth = 40;
    this.screenHeight =25;

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);
      var result = _this.viceSnapshotReader.readSnapshot(byteArray);
      _this.showVsf();
    };
    reader.readAsArrayBuffer(file);
  },

  showVsf: function() {
    this.screenMode = TextModeEditor.Mode.TEXTMODE;
    if(this.viceSnapshotReader.getMulticolorMode()) {
      this.screenMode = TextModeEditor.Mode.C64MULTICOLOR;
    }

    this.viceSnapshotReader.getScreenData(this.screenData);    
    this.viceSnapshotReader.getColorData(this.colorData);

    this.bgColor = this.viceSnapshotReader.getBackgroundColor();
    this.borderColor = this.viceSnapshotReader.getBorderColor();
    this.multi1 = this.viceSnapshotReader.getExtraBackgroundColor1();
    this.multi2 = this.viceSnapshotReader.getExtraBackgroundColor2();

    var characterBinaryData = [];

    this.viceSnapshotReader.getCharacterData(characterBinaryData);
    this.readCharacterBinaryData(characterBinaryData);

    this.drawScreen();



    var info = '';

    info += '<div class="c64ImportRow">';
    info += '<div class="c64ImportHeading">Format:</div>';
    info += '<div>VICE Snapshot (Version ' + this.viceSnapshotReader.getVersion() + ')</div>';
    info += '</div>';


    $('#importC64ViceInfo').html(info);    
  },


  importVsf: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var grid = this.editor.grid;
    var z = grid.getXYGridPosition();

    this.screenWidth = 40;
    this.screenHeight = 25;
    var screenDepth = 1;

    this.editor.graphic.setGridDimensions( { width: this.screenWidth, height: this.screenHeight});

    this.bgColor = this.viceSnapshotReader.getBackgroundColor();
    this.borderColor = this.viceSnapshotReader.getBorderColor();
    layer.setBackgroundColor(this.bgColor);
    layer.setBorderColor(this.borderColor);
    if(this.screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
      layer.setC64Multi1Color(this.multi1);
      layer.setC64Multi2Color(this.multi2);
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
    } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      
    }

    this.editor.setColorPerMode('cell');



    var tileSet = layer.getTileSet();    
    tileSet.readCharData({ tileData: this.tileData, characterWidth: 8, characterHeight: 8 });
  
    tileSet.setLabel(this.filename); 
//    tileSet.setType('custom');
    this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });

    var args = {};
    
    args.update = false;
    for(var y = 0; y < 25; y++) {
      for(var x = 0; x < 40; x++) {
        var pos = x + y * 40;
        var c = this.screenData[pos];
        var bc = this.editor.colorPaletteManager.noColor;

        if(this.extendedBackground) {
          var backgroundColorIndex = (c) >> 6;
          bc = this.bgColor;
          if(backgroundColorIndex == 1) {
            bc = this.multi1;
          }
          if(backgroundColorIndex == 2) {
            bc = this.multi2;
          }
          c = c & 0x3f;
        }
        args.x = x;
// reverseY        args.y = 24 - y;
        args.y = y;
        
        args.t = c; 
        args.fc = this.colorData[pos];
        args.bc = bc;
        layer.setCell(args);
      }
    }


    this.editor.gridView2d.findViewBounds();    
    this.editor.graphic.invalidateAllCells();

    this.editor.graphic.redraw({ allCells: true });
  },

  setImportFile: function(file) {
    this.filename = file.name;
    var extension = '';
    var dotPos = this.filename.lastIndexOf('.');
    if(dotPos != -1) {
      extension = this.filename.split('.').pop().toLowerCase();
      this.filename = this.filename.substring(0, dotPos);
    }


    switch(extension) {
      case 'prg':
        this.loadPrg(file);
      break;
      case 'crt':
        this.loadCrt(file);
      break;
      case 'd64':
        this.loadD64(file);
        break;
      case 'vsf':
        this.loadVsf(file);
      break;
      case 'c':
        this.loadC(file);
      break;
      case 'seq':
        this.loadSeq(file);
      break;
      case 'ctm':
        this.loadCharPad(file);
      break;
    }
  },

  showC64: function() {
/*    
    if(this.c64 == null) {
      this.c64 = new C64JS();
      this.canvas.width = 384;
      this.canvas.height = 272;    
      this.c64.init({ canvas: this.canvas });

    }
*/
    c64_reset();
    this.canvas.width = 384;
    this.canvas.height = 272;    
    this.context = this.canvas.getContext('2d');


    $('#importC64FormatsFrames').hide();
    $('#importC64FormatsViceSettings').hide();

    //this.c64.machineReset();
//    this.c64.restoreState();
//    this.c64.loadPrg(file);

    this.importType = 'prg';

  },

  

  importPrg: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please select a grid layer');
      return;
    }

    /*
    var charmembase = (this.c64.getByte(0xd018)& 0x0e) << 10;
    var videoMatrixBase = (this.c64.getByte(0xd018) & 0xf0) << 6;
    var extendedBackground = (this.c64.getByte(0xd011) & 0x40) > 0;
    var multicolorMode = (this.c64.getByte(0xd016) & 0x10) > 0;


    var ram = this.c64.getRAM();
    var vic = this.c64.getVIC();
*/
    /*
    var screenData = vic2.getScreenData();
    var colorData = vic2.getColorData();
   
    var charData = vic2.getCharData();
c64_cpuRead(address);    
*/

    var charmembase = (c64_cpuReadNS(0xd018)& 0x0e) << 10;
    var videoMatrixBase = (c64_cpuReadNS(0xd018) & 0xf0) << 6;
    var extendedBackground = (c64_cpuReadNS(0xd011) & 0x40) > 0;
    var multicolorMode = (c64_cpuReadNS(0xd016) & 0x10) > 0;


    var screenData = [];
    var colorData = [];
    var charData = [];

    for(var i = 0; i < 1000; i++) {
      screenData[i] = c64_vicRead(videoMatrixBase + i);//ram[videoMatrixBase + i];
      colorData[i] = c64_cpuRead(0xd800 + i) & 0x0f;
    }

    for(var i = 0; i < 2000; i++) {
      charData[i] = c64_vicRead(charmembase + i) ;//this.c64.getByte(charmembase + i);
    }

    this.screenWidth = 40;
    this.screenHeight = 25;
    var screenDepth = 1;
    this.editor.graphic.setGridDimensions({ width: this.screenWidth, height: this.screenHeight});
    
//    var c64 = this.c64;
//    var vic = c64.getVIC();
//    var vicRegisters = vic.getRegisters();

    var backgroundColor = c64_vicReadRegister(0x21) & 0x0f;// this.c64.getByte(0xd021);
    var borderColor = c64_vicReadRegister(0x20) & 0x0f;//this.c64.getByte(0xd020);
    var mc1 = c64_vicReadRegister(0x22) & 0x0f;//this.c64.getByte(0xd022);
    var mc2 = c64_vicReadRegister(0x23) & 0x0f;//this.c64.getByte(0xd023);


    layer.setBackgroundColor(backgroundColor);
    layer.setBorderColor(borderColor);
    if(multicolorMode) {
      layer.setC64Multi1Color(mc1);
      layer.setC64Multi2Color(mc2);
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
    } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      
    }

    /*
    var extendedBackground = vic2.screenControlRegister.extendedBackground;

    // get background colour

    var backgroundColor = vic2.backgroundColor;
    var borderColor = vic2.borderColor;
    var mc1 = vic2.extraBackgroundColor1;
    var mc2 = vic2.extraBackgroundColor2;

    layer.setBackgroundColor(backgroundColor);
    layer.setBorderColor(borderColor);
    if(vic2.screenControlRegister.multiColor) {
      layer.setC64Multi1Color(mc1);
      layer.setC64Multi2Color(mc2);
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
    } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      
    }

    */

    var tileSet = layer.getTileSet();
    tileSet.readBinaryData({ tileData: charData, characterWidth: 8, characterHeight: 8 });
    this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });

    var args = {};
    
    args.update = false;
    for(var y = 0; y < 25; y++) {
      for(var x = 0; x < 40; x++) {
        var pos = x + y * 40;
        var c = screenData[pos];
        var bc = this.editor.colorPaletteManager.noColor;

        if(extendedBackground) {
          var backgroundColorIndex = (c) >> 6;
//          bc = vicRegisters[0x21 + backgroundColorIndex] & 0xf;
          bc = c64_vicReadRegister(0x21 + backgroundColorIndex) & 0xf;
          c = c & 0x3f;

        }
        args.x = x;
// reverseY        args.y = 24 - y;
        args.y = y;
        
        args.t = c; 
        args.fc = colorData[pos];
        args.bc = bc;
        layer.setCell(args);
      }
    }

    this.editor.graphic.redraw({ allCells: true });
  },


  readCharacterBinaryData: function(tileData) {

    var characterWidth = 8;
    var characterHeight = 8;

    this.tileData = [];

    for(var c = 0; c < tileData.length; c++) {
      this.tileData[c] = [];
      for(var i = 0; i < characterWidth * characterHeight; i++) {
        this.tileData[c][i] = 0;        
      }  
      var srcCharPosition = c * (characterWidth);// * characterHeight);

      var onVal = 1;
      var offVal = 0;

      for(var y = 0; y < characterHeight; y++) {
        for(var x = 0; x < characterWidth; x++) {

          var pos = x + y * characterWidth;

//          var srcBit = srcCharPosition + characterWidth;

          var srcByte = srcCharPosition + y;//Math.floor(srcBit / 8);
          var srcBitPos = x;//srcBit % 8;
          var byteValue = tileData[srcByte];

          var dstPos = 0;
          if(byteValue & (1 << (7-srcBitPos) )) {
            this.tileData[c][pos] = onVal;
          } else {
            this.tileData[c][pos] = offVal;
          }
        }
      }
    }
  },


  doImport: function() {
    if(this.importType == 'prg') {
      this.importPrg();
    }


    if(this.importType == 'c') {
      this.doImportC();
    }

    if(this.importType == 'vsf') {
      this.importVsf();
    }


    if(this.importType == 'seq') {
      this.doImportSeq();
    }

    if(this.importType == 'ctm') {
      this.doImportCharPad();
    }
  },

  keyDown: function(event) {
    if(this.importType == 'prg') {

      if(this.joystickPort != 0) {
        var joystickIndex = this.joystickPort - 1;

        event.preventDefault();
        var key = event.key.toLowerCase();
        switch(key) {
          case 'arrowdown':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_DOWN);
            return;
          break;
          case 'arrowup':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_UP);
            return;
          break;
          case 'arrowleft':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_LEFT);
            return;
          break;
          case 'arrowright':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_RIGHT);
            return;
          break;
          case 'z':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_FIRE);
            return;
          break;
        }
      }


      c64_keydown(event);
    }
  },

  keyUp: function(event) {
    if(this.importType == 'prg') {
      if(this.joystickPort != 0) {
        var joystickIndex = this.joystickPort - 1;

        event.preventDefault();
        var key = event.key.toLowerCase();
        switch(key) {
          case 'arrowdown':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_DOWN);
            return;
          break;
          case 'arrowup':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_UP);
            return;
          break;
          case 'arrowleft':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_LEFT);
            return;
          break;
          case 'arrowright':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_RIGHT);
            return;
          break;
          case 'z':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_FIRE);
            return;
          break;
        }
      }
      c64_keyup(event);
    }
  },

  keyPress: function(event) {
/*
    if(this.importType == 'prg') {
      event.preventDefault();
    }
*/
  },


  c64UpdateDriveLight: function() {
//    var drive = this.c64.c64.getDrive();
//    var status = drive.getStatus();
    var status = c1541_getStatus();

    if(status !== this.lastDriveStatus) {
      switch(status) {
//        case C64.C1541.FloppyStatus.LOAD:
        case 2:
          $('#importC64FormatsDriveLight').css('background-color', '#00ff00');
        break;
//        case C64.C1541.FloppyStatus.ON:
        case 1:          
          $('#importC64FormatsDriveLight').css('background-color', '#ff0000');
        break;
//        case C64.C1541.FloppyStatus.OFF:
        case 0:
          $('#importC64FormatsDriveLight').css('background-color', '#333333');
        break;

      }
      this.lastDriveStatus = status;


    }

//    var position = drive.getPosition();
    var position = c1541_getPosition();

    if(position !== this.lastDrivePosition) {
      $('#importC64FormatsDrivePosition').html(position);
      this.lastDrivePosition = position;
    }
  },

  c64Redraw: function() {
    var ptr = c64_getPixelBuffer();
    var len = 384*272*4;
  
    var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
    var data = this.c64ImageData.data;
    data.set(view);
    this.context.putImageData(this.c64ImageData, 0, 0);
  
    /*
    this.offscreenContext.putImageData(this.imageData, 0, 0);
    this.context.drawImage(this.offscreenCanvas, 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,
      0, 0, this.canvas.width, this.canvas.height);
      */
  },

  update: function() {
    if(this.importType == 'prg') {
      if(c64_ready) {
        var time = getTimestamp();
        var dTime = time - this.lastUpdate;
        this.lastUpdate = time;
      
        // if in middle of pasting text, call the routine to insert into buffer
        if(c64.pastingText) {
          c64.processPasteText();
        }
                
        if(debugger_update(dTime)) {
          this.c64Redraw();
          this.c64UpdateDriveLight();
        } 
      } 
  
//      this.c64.update();
//      this.updateDriveLight();
    }
  }
}
