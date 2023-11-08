var DbgC64CharEditor = function () {
  this.canvas = null;
  this.offscreenCanvas = null;
  this.context = null;

  this.charAddress = 0x1000;
  this.dbgCharset = null;

  this.charWidth = 8;
  this.charHeight = 8;
  this.canvasElementId = 'dbgC64CharEditorCanvas';

  this.multicolor = false;
  this.buttons = 0;

  this.drawMode = false;
  this.isROMChar = false;

  this.charColor = 1;
  this.bgColor = 0;
  this.mc1Color = 2;
  this.mc2Color = 3;

  this.lastPixelAddress = false;
  this.lastPixelX = false;
  this.historyPosition = 0;
  this.history = [];
  this.historyEntry = [];
}


DbgC64CharEditor.prototype = {
  init: function (dbgCharset, args) {
    this.dbgCharset = dbgCharset;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

  },

  buildInterface: function (parentPanel) {
    this.canvasElementId = this.prefix + 'CharEditorCanvas';

    var html = '';
    html = '<div class="panelFill" id="' + this.prefix + 'CharEditorPanel">';

    html += '  <div style="position: absolute; top: 0; left: 0; right: 0; height: 30px">';
    html += '    <div id="' + this.prefix + 'CharEditorAddress" style="font-size: 24px; font-weight: 300"></div>';
    html += '  </div>';


    html += '  <div style="position: absolute; top: 30px; left: 0; right: 0; bottom: 40px">';
    html += '    <canvas id="' + this.canvasElementId + '" style="background-color: #333333" width="256" height="256"></canvas>';
    html += '  </div>';

    html += '  <div style="position: absolute; left: 0; right: 0; bottom: 0px; height: 40px">';

    /*
    html += '    <div>';
    html += '      <label class="cb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multicolour';
    html += '      <input type="checkbox" value="mouse" class="showMouseInfo"  id="' + this.prefix + 'CharEditorMulti"><span class="checkmark"></span></label>';
    html += '    </div>';
*/


    html += '    <div id="' + this.prefix + 'CharEditorMultiControls" style="display: none">';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Background';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'CharEditorMultiMode" id="' + this.prefix + 'CharEditorMultiModeErase" value="erase"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'CharEditorColorBg" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';
    html += '</label>';
    

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Invididual';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'CharEditorMultiMode" id="' + this.prefix + 'CharEditorMultiModeDraw" value="draw"><span class="checkmark"></span>';
    html += '<div  id="' + this.prefix + 'CharEditorColorFg" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';
    html += '</label>';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multi 1';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'CharEditorMultiMode" id="' + this.prefix + 'CharEditorMultiModeMulti1" value="multi1"><span class="checkmark"></span>';
    html += '<div  id="' + this.prefix + 'CharEditorColorMulti1" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';
    html += '</label>';

    html += '      <label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multi 2';
    html += '      <input type="radio" class="showMouseInfo"  name="' + this.prefix + 'CharEditorMultiMode" id="' + this.prefix + 'CharEditorMultiModeMulti2" value="multi2"><span class="checkmark"></span>';
    html += '<div id="' + this.prefix + 'CharEditorColorMulti2" style="display: inline-block; width: 16px; height: 16px; background-color: #555555"></div>';
    html += '</label>';

    html += '    </div>';



    html += '  </div>'

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
      this.offscreenCanvas.width = this.charWidth;
      this.offscreenCanvas.height = this.charHeight;
      this.offscreenContext = this.offscreenCanvas.getContext('2d');
      this.offscreenImageData = this.offscreenContext.getImageData(0, 0,
        this.offscreenCanvas.width, this.offscreenCanvas.height);

    }

    this.resize();
  },

  setMulticolor: function(multicolor) {
    this.multicolor = multicolor;


//    $('#' + this.prefix + 'CharEditorMulti').prop('checked', multicolor);
    if(this.multicolor) {
      this.setDrawMode('draw');
    //  $('#' + this.prefix + 'CharEditorMultiControls').prop('checked', this.multicolor);
      $('#' + this.prefix + 'CharEditorMultiControls').show();
    } else {
      $('#' + this.prefix + 'CharEditorMultiControls').hide();
    }

    this.draw();
  },

  setFgColor: function(color) {
    this.charColor = color;
    this.updateColors();
  },

  setBgColor: function(color) {
    this.bgColor = color;
    this.updateColors();
  },

  setDrawMode: function(drawMode) {
    this.drawMode = drawMode;
    $('input[name=' + this.prefix + 'CharEditorMultiMode][value=' + drawMode + ']').prop('checked', true);
  },

  initEvents: function () {
    var _this = this;


    /*
    $('#' + this.prefix + 'CharEditorMulti').on('click', function() {
      _this.setMulticolor($(this).is(':checked'));
    });
*/
    $('input[name=' + this.prefix + 'CharEditorMultiMode]').on('click', function() {
      var value = $('input[name=' + _this.prefix + 'CharEditorMultiMode]:checked').val();
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

  setCharAddress: function (address) {
    this.isROMChar = false;
    if(address >= 0x1000 && address < 0x1000 + 4096) {
      this.isROMChar = true;
    }

    if(address >= 0x9000 && address < 0x9000 + 4096) {
      this.isROMChar = true;
    }

    this.charAddress = address;
    this.draw();


    var addressHTML = '';
    addressHTML += '$' + ('0000' + address.toString(16)).substr(-4);
    if(this.isROMChar) {
      addressHTML += ' (Char ROM - not editable)';
    }
    $('#' + this.prefix + 'CharEditorAddress').html(addressHTML);
  },


  getPixel: function(x, y) {
    /*
    var address = this.spriteAddress + y * 3 + Math.floor(x / 8);
    var value = this.debugger.readByte(address);

    x = 7 - (x % 8);

    var bit = value & (1 << x);

    if(bit) {
      return 1;
    }
    */
    return 0;

  },

  setPixel: function() {
    var x = this.cursorPixelX;

    var address = this.charAddress;
    if(this.isROMChar) {
      return;
    }


    address += this.cursorPixelY;
    var value = c64_vicReadAbsolute(address);

    if(this.multicolor) {
      
      x = 6 - (x % 8);

//      var pixel = Math.floor(x / 2);
      var bits = 0;
      switch(this.drawMode) {
        case 'erase':
          bits = 0;
          break;
        case 'draw':
          bits = 3;
          break;
        case 'multi1':
          bits = 1;
          break;
        case 'multi2':
          bits = 2;
          break;
      }

      value = value & ~(3 << x);
      value = value | (bits << x);

      this.debugger.writeByte(address, value);
    } else {
      var bit = x % 8;
      var value = c64_vicReadAbsolute(address);
  
      if(this.drawMode == 'draw') {
        value = value | (1 << (7 - bit) ); 
      } else {
        if(value & (1 << (7 - bit) )) {
          value = value ^ (1 << (7 - bit) ); 
        }
      }
  
      c64_cpuWrite(address, value);
  
      /*
      this.dbgCharset.setPixel({
        x: this.cursorPixelX,
        y: this.cursorPixelY,
        value: this.drawMode == 'draw' ? 1 : 0          
      });
      */
    }
    this.draw();


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
          if(this.dbgCharset.getPixel({ x: this.cursorPixelX, y: this.cursorPixelY })) {
            this.drawMode = 'erase';
          } else {
            this.drawMode = 'draw';
          }
        }
        this.setPixel();
      }
    }

  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;
    x = x * this.canvasScale;
    y = y * this.canvasScale;

    if(x > this.gridXPos && x < this.gridXPos + this.charWidth * this.scale
       && y > this.gridYPos && y < this.gridYPos + this.charHeight * this.scale) {

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
      return;
    }

    var historyEntry = this.history[this.historyPosition];

    for(var i = 0; i < historyEntry.length; i++) {
      this.debugger.writeByte(historyEntry[i].address, historyEntry[i].value);
    }

    this.historyPosition++;
  },


  mouseEnter: function(event) {

  },

  mouseLeave: function(event) {
    this.cursorPixelX = false;
    this.cursorPixelY = false;
  },

  resize: function () {
    this.canvasScale = Math.floor(UI.devicePixelRatio);

    var element = $('#' + this.prefix + 'CharEditorPanel');

    var position = element.offset();
    if (position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }


    var canvasHeight = this.height - 70;

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


    this.scale = Math.floor(this.canvas.height / this.charHeight);

    this.gridXPos = 0;
    this.gridYPos = 0;

//    this.pixelWidth = Math.floor(maxWidth / this.charWidth);
//    this.pixelHeight = Math.floor(maxHeight / this.charHeight);


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
    $('#' + this.prefix + 'CharEditorColor' + type).css('background-color',  color);

  },

  updateColors: function() {
    this.setColor('Bg', this.bgColor);

    var fgColor = this.charColor;
    if(this.multicolor && fgColor > 7) {
      fgColor -=8;

    }
    this.setColor('Fg', fgColor);
    this.setColor('Multi1', this.mc1Color);
    this.setColor('Multi2', this.mc2Color);
  },


  drawChar: function () {
    var fgColor = this.charColor;
    var multicolor = this.multicolor;
    if(multicolor) {
      if(fgColor > 7) {
        fgColor -= 8;
      } else {
        multicolor = false;
      }
    }

//    console.log('draw ' + this.charAddress);

    this.dbgCharset.drawChar(
      this.offscreenImageData, 
      this.charAddress, 
      multicolor, 
      fgColor, 
      this.bgColor, 
      this.mc1Color, 
      this.mc2Color);


    this.offscreenContext.putImageData(this.offscreenImageData, 0, 0);

  },

  drawGrid: function() {
    var lineHSpacing = 1;
    var pixelWidth = this.scale;
    var pixelHeight = this.scale;

    if(this.multicolor) {
      lineHSpacing = 2;
    }

    this.context.strokeStyle = styles.textMode.tileEditorGridLines;
    this.context.beginPath();

    for(var i = 0; i <= this.charWidth; i += lineHSpacing) {
      this.context.moveTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + 0);
      this.context.lineTo(this.gridXPos + i * pixelWidth + 0.5, this.gridYPos + this.charHeight * pixelHeight);
    }

    for(var i = 0; i <= this.charHeight; i++) {
      this.context.moveTo(this.gridXPos + 0, this.gridYPos + i * pixelHeight + 0.5);
      this.context.lineTo(this.gridXPos + this.charWidth * pixelWidth, this.gridYPos + i * pixelHeight + 0.5);
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
    this.drawChar();

    var destWidth = this.charWidth * this.scale;
    var destHeight = this.charHeight * this.scale;

    // draw the char
    this.context.drawImage(this.offscreenCanvas, 
      0, 0, this.charWidth, this.charHeight,
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
