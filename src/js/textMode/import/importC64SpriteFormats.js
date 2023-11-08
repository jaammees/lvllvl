var ImportC64SpriteFormats = function() {
  this.editor = null;

  this.visible = false;

  this.importType = false;

  this.canvas = null;
  this.context = null;
  this.c64ImageData = null;


  this.spriteCanvas = null;
  this.spriteContext = null;

  this.spriteFrames = [];

  this.lastTime = 0;

  this.sprMulticolor = true;
  this.c64Focus = true;
  this.joystickPort = 0;
}

ImportC64SpriteFormats.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "importC64SpriteFormatsDialog", "title": "Import", "width": 615, "height": 500 });

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
      this.htmlComponent.load('html/textMode/importC64SpriteFormats.html', function() {

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
    UI("importC64SpriteFormatsDialog").setWidth(615);
    UI("importC64SpriteFormatsDialog").setHeight(490);

    UI.showDialog("importC64SpriteFormatsDialog");
    this.visible = true;
  },  

  initContent: function() {

    if(this.canvas == null) {
      this.canvas = document.getElementById('importC64SpriteFormatsPreview');
      this.canvas.width = 384;//320;
      this.canvas.height = 272;//200;
      this.context = this.canvas.getContext('2d');
      this.c64ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    }

    if(this.spriteCanvas == null) {
      this.spriteCanvas = document.createElement('canvas');
      this.setSpriteDimensions(24, 21);
    }

    this.showC64();
    var joystickPort = parseInt($('input[name=importC64SpriteJoystickPort]:checked').val(), 10);
    this.setJoystickPort(joystickPort);

  },

  setSpriteDimensions: function(width, height) {
    this.spriteCanvas.width = width;
    this.spriteCanvas.height = height;
    this.spriteContext = this.spriteCanvas.getContext('2d');
  },

  drawSprite: function(args) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var spriteData = args.spriteData;
    var multicolor = args.multicolor;
    var dstX = args.x;
    var dstY = args.y;

    var backgroundColor = 0;
    var multi1 = args.multi1;
    var multi2 = args.multi2;
    var cellColor = args.color;


    var colors = [];
    colors.push(colorPalette.getColor(backgroundColor));
    colors.push(colorPalette.getColor(multi1));
    colors.push(colorPalette.getColor(cellColor));
    colors.push(colorPalette.getColor(multi2));

    var width = this.spriteCanvas.width;
    var height = this.spriteCanvas.height;

    this.spriteContext.clearRect(0, 0, width, height);
//    this.spriteCanvas.fillStyle = '#222222';
//    this.spriteContext.fillRect(0, 0, width, height);

    this.spriteImageData = this.spriteContext.getImageData(0, 0, width, height);
    var imageData = this.spriteImageData;

    var i = 0;
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        var b = spriteData[i++];

        for(var w = 7; w >= 0; w--) {
          var dstPos = (x  + y * imageData.width) * 4;

          var p = (b >>> w) & 1;

          if(multicolor) {
            var colorIndex = 0;
            if(p) {
              colorIndex += 2;
            }
            w--;
            var p2 = (b >>> w) & 1;
            if(p2) {
              colorIndex += 1;
            }

            var color = colors[colorIndex];

            if(colorIndex) {
              imageData.data[dstPos] = color.r * 255; 
              imageData.data[dstPos + 1] = color.g * 255;
              imageData.data[dstPos + 2] = color.b * 255;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = color.r * 255; 
              imageData.data[dstPos + 5] = color.g * 255;
              imageData.data[dstPos + 6] = color.b * 255;
              imageData.data[dstPos + 7] = 255;
            } else {
              imageData.data[dstPos] = 0; 
              imageData.data[dstPos + 1] = 0;
              imageData.data[dstPos + 2] = 0;
              imageData.data[dstPos + 3] = 0;

              imageData.data[dstPos + 4] = 0; 
              imageData.data[dstPos + 5] = 0;
              imageData.data[dstPos + 6] = 0;
              imageData.data[dstPos + 7] = 0;

            }


            x += 2;
          } else {
            var color = colors[0];
            if(p) {
              color = colors[2];
              imageData.data[dstPos] = color.r * 255; 
              imageData.data[dstPos + 1] = color.g * 255;
              imageData.data[dstPos + 2] = color.b * 255;
              imageData.data[dstPos + 3] = 255;
            } else {
              imageData.data[dstPos] = 0; 
              imageData.data[dstPos + 1] = 0;
              imageData.data[dstPos + 2] = 0;
              imageData.data[dstPos + 3] = 0;
            }

            x++;
          }
        }
        x--;
      }
    }
    this.spriteContext.putImageData(imageData, 0, 0);    

    this.context.drawImage(this.spriteCanvas, dstX, dstY);


  },

  doImport: function() {
    if(this.importType == 'spritepad') {
      this.importSpritePad.doImport();
    }
    if(this.importType == 'spr') {
      this.importSPR.doImport({ multicolor: this.sprMulticolor });
    }
    if(this.importType == 'prg') {
      this.importPRGSprites();
    }
  },

  initEvents: function() {
    var _this = this;

    $('#importC64SpriteFormatsChooseFile').on('click', function() {
      $('#importC64SpriteFormatsSourceFile').click();
    });

    document.getElementById('importC64SpriteFormatsSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('importC64SpriteFormatsSourceFile').files[0];
      _this.setImportFile(file);
    });


    $('#importC64SpritePRGReset').on('click', function(event) {
      _this.resetC64();

    });

    $('#importC64SpritePRGPaste').on('click', function(event) {
      _this.c64Paste();
    });

    $('#importC64SpritePRGCMDKey').on('click', function(event) {
      _this.c64CommodoreKey();
    });

    $('input[name=importC64SpriteJoystickPort]').on('click', function(e) {
      var port = parseInt($('input[name=importC64SpriteJoystickPort]:checked').val(), 10);
      _this.setJoystickPort(port);

    });    

    $('#importC64SpriteViewSprites').on('click', function() {
      _this.viewPRGSprites();
    });

    $('#importC64SpriteBackToC64').on('click', function() {
      _this.backToC64();
    });

    $('#importC64SpriteBank').on('change', function() {
      var value = parseInt($(this).val());
      _this.setC64VICBank(value);
    });

    $('#importC64SpritesFromAddress').on('keyup', function() {
      var value = parseInt($(this).val(), 16);
      if(!isNaN(value)) {
        _this.setC64ViewSpritesFrom(value);
      }
    });

    $('#importC64SpriteSPRMulticolor').on('click', function() {
      _this.setSPRMulticolor($(this).is(':checked'));
    });

    $('#importC64SpritesFromAddress').on('focus', function() {
      _this.c64Focus = false;
    });
    $('#importC64SpritesFromAddress').on('blur', function() {
      _this.c64Focus = true;
    });

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
      case 'd64':
        this.loadD64(file);
        break;
      case 'spd':
        this.loadSpritePad(file);
      break;
      case 'spr':
        this.loadSPR(file);
        break;
    }
  },

  loadSpritePad: function(file) {
    if(this.importSpritePad == null) {
      this.importSpritePad = new ImportSpritePad();
      this.importSpritePad.init(this.editor);      
    }
    this.importType = 'spritepad';

    $('.importC64SpriteSettings').hide();
    $('#importC64SpriteSpritePadControls').show();


    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);

      _this.importSpritePad.readSpritePad(byteArray);

      _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);

      var animations = _this.importSpritePad.getAnimations();

      // sprite frames stores what frame the animation is up to in the preview
      // count is how long on the current frame.
      _this.spriteFrames = [];
      for(var i = 0; i < animations.length; i++) {
        _this.spriteFrames.push({
          frame: animations[i].start,
          count: 0
        });

      }
      _this.drawSpritePad();
    };
    reader.readAsArrayBuffer(file);
  },

  drawSpritePad: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var backgroundColor = this.importSpritePad.getBackgroundColor();
    this.context.fillStyle = '#' + colorPalette.getHexString(backgroundColor);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var drawAnimations = false;

    if(!drawAnimations) {

      var sprites = this.importSpritePad.getSprites();
      var locationCount = 0;

      for(var i = 0; i < sprites.length; i++) {
        var sprite = sprites[i];// this.importSpritePad.getSprite(spriteIndex);
        var multi1 = this.importSpritePad.getMulti1();
        var multi2 = this.importSpritePad.getMulti2();
        var spriteWidth = 34;
        var spritesAcross = Math.floor(this.canvas.width / spriteWidth);
        var x = (locationCount % spritesAcross) * 34;
        var y = Math.floor(locationCount / spritesAcross) * 31;

        if(sprite.overlay != 1) {
          locationCount++;
        }

        this.drawSprite({
          x: x,
          y: y,
          multi1: multi1,
          multi2: multi2,
          spriteData: sprite.spriteData,
          multicolor: sprite.multi == 1,
          color: sprite.color
        });
      }
    } else {

      var animations = this.importSpritePad.getAnimations();
      
      for(var i = 0; i < animations.length; i++) {

        var spriteIndex = this.spriteFrames[i].frame;

        this.spriteFrames[i].count++;
        if(this.spriteFrames[i].count > animations[i].timer) {
          this.spriteFrames[i].count = 0;
          this.spriteFrames[i].frame++;
          if(this.spriteFrames[i].frame >= animations[i].end) {    
            this.spriteFrames[i].frame = animations[i].start;
          }
        }

        var sprite = this.importSpritePad.getSprite(spriteIndex);
        var multi1 = this.importSpritePad.getMulti1();
        var multi2 = this.importSpritePad.getMulti2();
        var spriteWidth = 34;
        var spritesAcross = Math.floor(this.canvas.width / spriteWidth);
        var x = (i % spritesAcross) * 34;
        var y = Math.floor(i / spritesAcross) * 31;
        this.drawSprite({
          x: x,
          y: y,
          multi1: multi1,
          multi2: multi2,
          spriteData: sprite.spriteData,
          multicolor: sprite.multi == 1,
          color: sprite.color
        });
      }
    }
  },

  loadSPR: function(file) {
    if(this.importSPR == null) {
      this.importSPR = new ImportSPR();
      this.importSPR.init(this.editor);      
    }

    this.importType = 'spr';

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);
      _this.importSPR.readSPR(byteArray);
      _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);

      $('.importC64SpriteSettings').hide();
      $('#importC64SpriteSPRControls').show();

    };
    reader.readAsArrayBuffer(file);

  },

  setSPRMulticolor: function(multicolor) {
    this.sprMulticolor = multicolor;
  },

  drawSpr: function() {
    var backgroundColor = '#cccccc';// this.importSpritePad.getBackgroundColor();
    this.context.fillStyle = '#' + colorPalette.getHexString(backgroundColor);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


    var sprites = this.importSPR.getSprites();
    for(var i = 0; i < sprites.length; i++) {
      var sprite = sprites[i];
      var color = 1;
      var multi = this.sprMulticolor;
      var multi1 = 2;
      var multi2 = 3;
      var spriteWidth = 34;

      var spritesAcross = Math.floor(this.canvas.width / spriteWidth);
      var x = (i % spritesAcross) * 34;
      var y = Math.floor(i / spritesAcross) * 31;
      this.drawSprite({
        x: x,
        y: y,
        multi1: multi1,
        multi2: multi2,
        spriteData: sprite.spriteData,
        multicolor: multi,
        color: sprite.color
      });

    }
  },



  loadPrg: function(file) {
    this.canvas.width = 384;
    this.canvas.height = 272;    
    this.context = this.canvas.getContext('2d');


    $('.importC64SpriteSettings').hide();
    $('#importC64SpritePRGControls').show();

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);

      c64_reset();
      c64_loadPRG(data, data.length, false);
    };
    reader.readAsArrayBuffer(file);

    this.importType = 'prg';
  },



  loadD64: function(file) {
    $('.importC64SpriteSettings').hide();
    $('#importC64SpritePRGControls').show();
    $('#importC64SpriteD64Controls').show();


    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      c64_insertDisk(data, data.length);
    };
    reader.readAsArrayBuffer(file);


    var filename = file.name;
    $('#importC64SpriteFormatsAttachedDisk').html(filename);

    this.importType = 'prg';
  },

  resetC64: function() {
    c64_reset();
    
    this.importType = 'prg';
    document.getElementById('importC64SpriteFormatsForm').reset();

    $('.importC64SpriteSettings').hide();
    $('#importC64SpritePRGControls').show();

  },


  setJoystickPort: function(port) {
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
  },

  viewPRGSprites: function() {
    // pause the c64
    //this.c64.pause();

    debugger_pause();

//    var cpu = this.c64.getCPU();

    var bankId = c64_cpuRead(0xdd00) & 0x3;
    this.setC64VICBank(bankId);

    var screenMemory = this.vicBankAddress + ((c64_cpuRead(0xd018) & 0xf0) >> 4) * 1024;
    var spritePointer0 = c64_cpuRead(screenMemory + 1016);
    this.viewC64VICFrom = this.vicBankAddress + spritePointer0 * 64;
    $('#importC64SpritesFromAddress').val(this.viewC64VICFrom.toString(16));

//    var d016 = cpu.cpuRead(0xd016);
//    this.multicolor = (d016 & 0x10) > 0;
//$D01C
//    var d01c = cpu.cpuRead(0xd01c);

    this.sprMulticolor = true;
    this.multiColor1 = c64_cpuRead(0xd025) & 0xf;
    this.multiColor2 = c64_cpuRead(0xd026) & 0xf;

    // sprite colours
    // $D027–D02E.
    this.color = c64_cpuRead(0xd027) & 0xf;

    this.setC64ViewSpritesFrom(this.viewC64VICFrom);


    $('#importC64SpriteC64Controls').hide();
    $('#importC64SpriteSpriteControls').show();
  },

  drawC64Sprites: function() {
// 9000
    var backgroundColor = '#cccccc';// this.importSpritePad.getBackgroundColor();
    this.context.fillStyle = '#' + colorPalette.getHexString(backgroundColor);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


 //   this.viewC64VICFrom = 0xc000;
//    var cpu = this.c64.getCPU();

    var address = this.viewC64VICFrom;
    var spriteCount = 84;
    var sprites = [];

//    this.sprMulticolor = true;

    try {
      for(var i = 0; i < spriteCount; i++) {
        var spriteData = [];
        for(var j = 0; j < 63; j++) {
          spriteData.push(c64_cpuRead(address++));
        }
        var extraByte = c64_cpuRead(address++);
        sprites.push({ 
          spriteData: spriteData,
          color: this.color
        });
      }
    } catch(e) {
      console.log(e);

    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for(var i = 0; i < sprites.length; i++) {
      var sprite = sprites[i];
      var multi = this.sprMulticolor;
      var spriteWidth = 34;

      var spritesAcross = Math.floor(this.canvas.width / spriteWidth);
      var x = (i % spritesAcross) * 34;
      var y = Math.floor(i / spritesAcross) * 31;
      this.drawSprite({
        x: x,
        y: y,
        multi1: this.multiColor1,
        multi2: this.multiColor2,
        spriteData: sprite.spriteData,
        multicolor: multi,
        color: sprite.color
      });
    }

    this.sprites = sprites;

  },

  importPRGSprites: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var graphic = this.editor.graphic;
    graphic.setDrawEnabled(false);
    this.editor.history.setEnabled(false);

//    if(this.c64.isRunning()) {

      this.viewPRGSprites();
  //  }

    var tileSet = layer.getTileSet();

    var x = 0;
    var y = 0;

    if(this.sprMulticolor) {
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
    } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);
    }

    layer.setCreateSpriteTiles(false);
    layer.setBlankTileId(0);

    layer.setC64Multi1Color(this.multiColor1);
    layer.setC64Multi2Color(this.multiColor2);


    for(var i = 0; i < this.sprites.length; i++) {
      var spriteData = this.sprites[i].spriteData;

      var tileId = tileSet.createTile();
      var foregroundColor = this.sprites[i].color;

      var tileData = [];

      for(var j = 0; j < spriteData.length; j++) {
        var b = spriteData[j];
        for(var k = 7; k >= 0; k--) {
          var p = (b >>> k) & 1;
          tileData.push(p);
        }
      }

      tileSet.setTileData(tileId, tileData);

      if(i !== 0) {
        var frame = graphic.insertFrame();
        graphic.setCurrentFrame(frame);
      }

      var args = {};
      args.update = false;
      args.x = x;
      args.y = y;
          
      args.t = tileId; 
      args.fc = foregroundColor;
      args.bc = this.editor.colorPaletteManager.noColor;

      layer.setCell(args);
    }

    layer.setCreateSpriteTiles(true);

    this.editor.history.setEnabled(true);

    graphic.setDrawEnabled(true);    

    this.editor.spriteFrames.draw({ framesChanged: true });
    this.editor.frames.gotoFrame(0);
    this.editor.graphic.redraw();
  },
  backToC64: function() {
    $('#importC64SpriteC64Controls').show();
    $('#importC64SpriteSpriteControls').hide();

//    this.c64.play();

    debugger_play();
  },

  setC64ViewSpritesFrom: function(value) {
    this.viewC64VICFrom = value;
    this.drawC64Sprites();
  },

  setC64VICBank: function(bankId) {
    this.c64VICBank = bankId;
    switch(this.c64VICBank) {
      case 3:
        this.vicBankAddress = 0x0000;
        break;
      case 2:
        this.vicBankAddress = 0x4000;
        break;
      case 1:
        this.vicBankAddress = 0x8000;
        break;
      case 0:
        this.vicBankAddress = 0xc000;
        break;
    }
    this.drawC64Sprites();

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


  showC64: function() {
    this.canvas.width = 384;
    this.canvas.height = 272;    
    this.context = this.canvas.getContext('2d');

    this.importType = 'prg';
    $('.importC64SpriteSettings').hide();
    $('#importC64SpritePRGControls').show();

  },


  keyDown: function(event) {
    if(this.importType == 'prg' && this.c64Focus) {

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
    if(this.importType == 'prg' && this.c64Focus) {
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
    var status = c1541_getStatus();

    if(status !== this.lastDriveStatus) {
      switch(status) {
//        case C64.C1541.FloppyStatus.LOAD:
        case 2:
          $('#importC64SpriteFormatsDriveLight').css('background-color', '#00ff00');
        break;
//        case C64.C1541.FloppyStatus.ON:
        case 1:          
          $('#importC64SpriteFormatsDriveLight').css('background-color', '#ff0000');
        break;
//        case C64.C1541.FloppyStatus.OFF:
        case 0:
          $('#importC64SpriteFormatsDriveLight').css('background-color', '#333333');
        break;

      }
      this.lastDriveStatus = status;


    }

//    var position = drive.getPosition();
    var position = c1541_getPosition();

    if(position !== this.lastDrivePosition) {
      $('#importC64SpriteFormatsDrivePosition').html(position);
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

    if(this.importType == 'spritepad') {
      var time = getTimestamp();
      var deltaTime = time - this.lastTime;
      if(deltaTime > 1000/50) {
        this.lastTime = time;
        this.drawSpritePad();
      }
    }

    if(this.importType == 'spr') {
      var time = getTimestamp();
      var deltaTime = time - this.lastTime;
      if(deltaTime > 1000/50) {
        this.lastTime = time;
        this.drawSpr();
      }
    }
    
    if(this.importType == 'prg') {
      if(c64_ready) {
        var time = getTimestamp();
        var dTime = time - this.lastUpdate;
        this.lastUpdate = time;
    
        if(debugger_isRunning()) {
          if(debugger_update(dTime)) {
            this.c64Redraw();
            this.c64UpdateDriveLight();
          } 
        }
      } 
    }
  }
}
