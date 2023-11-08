var DbgC64SpriteEditor = function () {
  this.canvas = null;
  this.offscreenCanvas = null;
  this.context = null;

  this.spriteAddress = 0x2000;
  this.dbgSprites = null;

  this.spriteWidth = 24;
  this.spriteHeight = 21;
  this.canvasElementId = 'dbgC64SpriteEditorCanvas';

  this.multicolor = false;
  this.buttons = 0;

  this.drawMode = false;

  this.spriteColor = 1;
  this.bgColor = 0;
  this.mc1Color = 2;
  this.mc2Color = 3;

  this.lastPixelAddress = false;
  this.lastPixelX = false;
  this.historyPosition = 0;
  this.history = [];
  this.historyEntry = [];

}


DbgC64SpriteEditor.prototype = {
  init: function (dbgSprites, args) {
    this.dbgSprites = dbgSprites;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

  },

  buildInterface: function (parentPanel) {
    this.canvasElementId = this.prefix + 'SpriteEditorCanvas';

    var html = '';
    html = '<div class="panelFill" id="' + this.prefix + 'SpriteEditorPanel">';

    html += '  <div style="position: absolute; top: 0; left: 0; right: 0; height: 30px">';
    html += '    <div id="' + this.prefix + 'SpriteEditorAddress" style="font-size: 24px; font-weight: 300"></div>';
    html += '  </div>';

    html += '  <div style="position: absolute; top: 30px; left: 0; right: 0; bottom: 38px">';
    html += '    <canvas id="' + this.canvasElementId + '" style="background-color: #333333" width="256" height="256"></canvas>';
    html += '  </div>';

    html += '  <div style="position: absolute; left: 0; right: 0; bottom: 0px; height: 38px">';


    html += '    <div>';
    html += '      <label class="cb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multicolour';
    html += '      <input type="checkbox" value="mouse" class="showMouseInfo"  id="' + this.prefix + 'SpriteEditorMulti"><span class="checkmark"></span>';
    html += '</label>';
    html += '    </div>';



    html += '    <div id="' + this.prefix + 'SpriteEditorMultiControls" style="display: none">';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Background';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'SpriteEditorMultiMode" id="' + this.prefix + 'SpriteEditorMultiModeErase" value="erase"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'SpriteEditorColorBg" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';

    html += '</label>';
    

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Invididual';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'SpriteEditorMultiMode" id="' + this.prefix + 'SpriteEditorMultiModeDraw" value="draw"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'SpriteEditorColorBg" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';

    html += '</label>';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multi 1';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'SpriteEditorMultiMode" id="' + this.prefix + 'SpriteEditorMultiModeMulti1" value="multi1"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'SpriteEditorColorMulti1" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';

    html += '</label>';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multi 2';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'SpriteEditorMultiMode" id="' + this.prefix + 'SpriteEditorMultiModeMulti2" value="multi2"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'SpriteEditorColorMulti2" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';

    html += '</label>';

    html += '    </div>';


    html += '  </div>';



    html += '</div>'

    html += '</div>';
    this.htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
    parentPanel.add(this.htmlPanel);

    var _this = this;
    this.htmlPanel.on('resize', function () {
      _this.resize();
    });

    this.canvasScale = Math.floor(UI.devicePixelRatio);

    var _this = this;
    UI.on('ready', function () {
      _this.initContent();
      _this.initEvents();
    });

  },

  initContent: function () {
    if (this.canvas == null) {
      this.canvas = document.getElementById(this.canvasElementId);
    }

    if (this.offscreenCanvas == null) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = this.spriteWidth;
      this.offscreenCanvas.height = this.spriteHeight;
      this.offscreenContext = this.offscreenCanvas.getContext('2d');
      this.offscreenImageData = this.offscreenContext.getImageData(0, 0,
        this.offscreenCanvas.width, this.offscreenCanvas.height);

    }

    this.resize();
  },

  setDrawMode: function(drawMode) {
    this.drawMode = drawMode;
    $('input[name=' + this.prefix + 'SpriteEditorMultiMode][value=' + drawMode + ']').prop('checked', true);
  },

  initEvents: function () {
    var _this = this;

    $('#' + this.prefix + 'SpriteEditorMulti').on('click', function() {
      _this.setMulticolor($(this).is(':checked'));
    });

    $('input[name=' + this.prefix + 'SpriteEditorMultiMode]').on('click', function() {
      var value = $('input[name=' + _this.prefix + 'SpriteEditorMultiMode]:checked').val();
      //_this.drawMode = value;
      _this.setDrawMode(value);
    });

    $('#' + this.canvasElementId).on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#' + this.canvasElementId).on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.canvasElementId).on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#' + this.canvasElementId).on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });
    
    $('#' + this.canvasElementId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    $('#' + this.canvasElementId).on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });
    
  },


  getPixel: function(x, y) {
    var address = this.spriteAddress + y * 3 + Math.floor(x / 8);
    var value = this.debugger.readByte(address);

    x = 7 - (x % 8);

    var bit = value & (1 << x);

    if(bit) {
      return 1;
    }

    return 0;

  },

  setPixel: function() {
    var x = this.cursorPixelX;
    var y = this.cursorPixelY;

    var address = this.spriteAddress + y * 3 + Math.floor(x / 8);
    var value = c64_vicReadAbsolute(address);
    var prev = value;

    if(this.lastPixelAddress === address && this.lastPixelX === x) {
      return;
    }


    this.lastPixelAddress = address;
    this.lastPixelX = x;


    if(this.multicolor) {
      x = x % 8;
      x = 6 - (x % 8);

//      var pixel = Math.floor(x / 2);
      var bits = 0;
      switch(this.drawMode) {
        case 'erase':
          bits = 0;
          break;
        case 'draw':
          bits = 2;
          break;
        case 'multi1':
          bits = 1;
          break;
        case 'multi2':
          bits = 3;
          break;
      }

      value = value & ~(3 << x);
      value = value | (bits << x);

    } else {
      // toggle the pixel
      x = 7 - (x % 8);

      if(this.drawMode == 'draw') {
        value = value | (1 << x );      
      }

      if(this.drawMode == 'erase') {
        value = value & (0xff ^ (1 << x) );      
      }
    }

    this.debugger.writeByte(address, value);

    this.historyEntry.push({
      address: address,
      prev: prev,
      value: value
    });
  
  },


  setButtons: function(event) {
    if(typeof event.buttons != 'undefined') {
      this.buttons = event.buttons;
    } else {
      if(typeof event.which !== 'undefined') {
        this.buttons = event.which;

      } else if(typeof event.nativeEvent !== 'undefined') {
        if(typeof event.nativeEvent.which != 'undefined') {
          this.buttons = event.nativeEvent.which;
        }
        if(typeof event.nativeEvent.buttons != 'undefined') {
          this.buttons = event.nativeEvent.buttons;
        }
      }
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {

      this.buttons = UI.LEFTMOUSEBUTTON;
    }
    if(event.ctrlKey && (this.buttons & UI.LEFTMOUSEBUTTON)  ) {
      this.buttons = UI.RIGHTMOUSEBUTTON;
    }
    // cmd + click
    if(event.metaKey && this.buttons == 1) {
      this.buttons = UI.MIDDLEMOUSEBUTTON;
    }

  },  
  mouseDown: function(event) {

    this.setButtons(event);

    if(this.buttons & UI.LEFTMOUSEBUTTON) {
      UI.captureMouse(this);
      this.historyEntry = [];

      if(this.cursorPixelX !== false && this.cursorPixelY !== false) {
        if(!this.multicolor) {
          if(this.getPixel(this.cursorPixelX, this.cursorPixelY)) {
            this.drawMode = 'erase';
          } else {
            this.drawMode = 'draw';
          }
        }
        this.setPixel();
        this.draw();
      }
    }

  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;
    x = x * this.canvasScale;
    y = y * this.canvasScale;

    if(x > this.gridXPos && x < this.gridXPos + this.spriteWidth * this.scale
       && y > this.gridYPos && y < this.gridYPos + this.spriteHeight * this.scale) {

      var cursorPixelX = Math.floor( (x - this.gridXPos) / this.scale );
      var cursorPixelY = Math.floor( (y - this.gridYPos) / this.scale );

      if(cursorPixelX !== this.cursorPixelX || cursorPixelY !== this.cursorPixelY) {
        this.cursorPixelX = cursorPixelX;
        this.cursorPixelY = cursorPixelY;
        if(this.multicolor) {
          this.cursorPixelX = Math.floor(this.cursorPixelX / 2) * 2;
        }

        if(this.buttons & UI.LEFTMOUSEBUTTON) {
          if(this.cursorPixelX !== false && this.cursorPixelY !== false) {
            this.setPixel();
          }
        }
    
        this.draw();
      }
    }


  },

  mouseUp: function(event) {
    this.buttons = 0;

    this.lastPixelAddress = false;
    this.lastPixelX = false;

    this.history.length = this.historyPosition;
    this.history.push(this.historyEntry);
    this.historyPosition++;

    this.historyEntry = [];

  },

  mouseEnter: function(event) {

  },

  undo: function() {
    this.lastPixelAddress = false;
    this.lastPixelX = false;

    if(this.historyPosition <= 0) {
      return;
    }
    this.historyPosition--;

    if(this.historyPosition >= this.history.length) {
      return;
    }

    var historyEntry = this.history[this.historyPosition];

    for(var i = historyEntry.length - 1; i >= 0; i--) {
      this.debugger.writeByte(historyEntry[i].address, historyEntry[i].prev);
    }

  },

  redo: function() {
    if(this.historyPosition >= this.history.length ) {
      console.log('no history');
      return;
    }

    var historyEntry = this.history[this.historyPosition];

    for(var i = 0; i < historyEntry.length; i++) {
      this.debugger.writeByte(historyEntry[i].address, historyEntry[i].value);
    }

    this.historyPosition++;

  },

  mouseLeave: function(event) {
    this.cursorPixelX = false;
    this.cursorPixelY = false;
  },

  resize: function () {
    this.canvasScale = Math.floor(UI.devicePixelRatio);

    var element = $('#' + this.prefix + 'SpriteEditorPanel');

    var position = element.offset();
    if (position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }


    var canvasHeight = this.height - 72;

    this.canvas.width = this.width * UI.devicePixelRatio;
    this.canvas.height = (canvasHeight) * UI.devicePixelRatio;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = canvasHeight + 'px';

    this.context = this.canvas.getContext('2d');

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;


    this.scale = Math.floor(this.canvas.height / this.spriteHeight);

    this.gridXPos = 0;
    this.gridYPos = 0;

//    this.pixelWidth = Math.floor(maxWidth / this.charWidth);
//    this.pixelHeight = Math.floor(maxHeight / this.charHeight);


  },

  setMulticolor: function(multicolor) {
    this.multicolor = multicolor;
    $('#' + this.prefix + 'SpriteEditorMulti').prop('checked', multicolor);
    if(this.multicolor) {
      this.setDrawMode('draw');
      $('#' + this.prefix + 'SpriteEditorMultiControls').prop('checked', this.multicolor);
      $('#' + this.prefix + 'SpriteEditorMultiControls').show();
    } else {
      $('#' + this.prefix + 'SpriteEditorMultiControls').hide();
    }

    this.draw();
  },

  setSpriteAddress: function (address) {
    this.history = [];
    this.spriteAddress = address;
    this.draw();
    var spriteAddressHex = ('0000' + address.toString(16)).substr(-4);
    $('#' + this.prefix + 'SpriteEditorAddress').html('$' + spriteAddressHex);
  },



  
  setColor: function(type, colorIndex) {
    var color = c64.colors.getColor(colorIndex) & 0xffffff;
    var r = color & 0xff;
    var g = (color >> 8) & 0xff;
    var b = (color >> 16) & 0xff;

    r = ("00" + r.toString(16)).substr(-2);
    g = ("00" + g.toString(16)).substr(-2);
    b = ("00" + b.toString(16)).substr(-2);
    color = '#' + r + g + b;
    $('#' + this.prefix + 'SpriteEditorColor' + type).css('background-color',  color);

  },

  updateColors: function() {
    this.setColor('Bg', this.bgColor);
    this.setColor('Fg', this.spriteColor);
    this.setColor('Multi1', this.mc1Color);
    this.setColor('Multi2', this.mc2Color);
  },  

  drawSprite: function () {

    this.dbgSprites.drawSprite(this.offscreenImageData, this.spriteAddress, this.multicolor, 
      this.spriteColor, this.bgColor, this.mc1Color, this.mc2Color);
    
    this.offscreenContext.putImageData(this.offscreenImageData, 0, 0);

  },

  drawGrid: function() {
    var lineHSpacing = 1;
    var pixelWidth = this.scale;
    var pixelHeight = this.scale;

    this.context.strokeStyle = styles.textMode.tileEditorGridLines;
    this.context.beginPath();
    if(this.multicolor) {
      lineHSpacing = 2;
    } 

    for(var i = 0; i <= this.spriteWidth; i += lineHSpacing) {
      this.context.moveTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + 0);
      this.context.lineTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + this.spriteHeight * pixelHeight);
    }

    for(var i = 0; i <= this.spriteHeight; i++) {
      this.context.moveTo(this.gridXPos + 0, this.gridYPos + i * pixelHeight + 0.5);
      this.context.lineTo(this.gridXPos + this.spriteWidth * pixelWidth, this.gridYPos + i * pixelHeight + 0.5);
    }
    this.context.stroke();


    this.context.strokeStyle = '#555555';//styles.textMode.tileEditorGridLines;
    this.context.beginPath();
    for(var i = 8; i < this.spriteWidth; i += 8) {
      this.context.moveTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + 0);
      this.context.lineTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + this.spriteHeight * pixelHeight);
    }
    for(var i = 8; i < this.spriteHeight; i += 8) {
      this.context.moveTo(this.gridXPos + 0, this.gridYPos + i * pixelHeight + 0.5);
      this.context.lineTo(this.gridXPos + this.spriteWidth * pixelWidth, this.gridYPos + i * pixelHeight + 0.5);
    }

    this.context.stroke();

    /*
    this.context.strokeStyle = styles.textMode.tileEditorGridBorder;//'#c9c9c9';    
    this.context.beginPath();
    for(var i = 0; i <= this.charsAcross; i++) {
      this.context.moveTo(this.offsetX + i * this.pixelWidth * this.charWidth + 0.5, this.offsetY + 0);
      this.context.lineTo(this.offsetX + i * this.pixelWidth * this.charWidth + 0.5, this.offsetY + this.charHeight * this.charsDown * this.pixelHeight);
    }

    for(var i = 0; i <= this.charsDown; i++) {
      this.context.moveTo(this.offsetX + 0, this.offsetY + i * this.pixelHeight * this.charHeight + 0.5);
      this.context.lineTo(this.offsetX + this.charWidth * this.charsAcross * this.pixelWidth, this.offsetY + i * this.pixelHeight * this.charHeight + 0.5);
    }
    this.context.stroke();
    */

  },





  draw: function () {
    this.drawSprite();

    var destWidth = this.spriteWidth * this.scale;
    var destHeight = this.spriteHeight * this.scale;

    // draw the sprite
    this.context.drawImage(this.offscreenCanvas, 
      0, 0, this.spriteWidth, this.spriteHeight,
      this.gridXPos, this.gridYPos, destWidth, destHeight);


    // draw the cursor

    if(this.cursorPixelX !== false && this.cursorPixelY !== false) {
      var pixelWidth = this.scale;
      var pixelHeight = this.scale;

      var pixelX = this.gridXPos + this.scale * this.cursorPixelX;
      var pixelY = this.gridYPos + this.scale * this.cursorPixelY;

      var cursorColor = 'cccccc';
      if(this.multicolor) {
        pixelWidth *= 2;

      } else {

      }

      this.context.fillStyle = '#' + cursorColor;

      this.context.globalAlpha = 0.5;
      this.context.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
      this.context.globalAlpha = 1;
    }


    // draw the grid
    this.drawGrid();    

  }

}