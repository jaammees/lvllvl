// https://lvllvl.com/c64/?gid=3e3292afb713c7884546b936d799d584

var DbgC64Bitmap = function() {
  this.machine = null;
  this.visible = true;

  this.canvas = null;
  this.context = null;
  this.offscreenCanvas = null;
  this.offscreenContext = null;
  this.offscreenImageData = null;

  this.charEditor = null;  

  this.bitmapAddress = false;
  this.fgColor = 0x6;
  this.bgColor = 0xe;
  this.highlightChar = false;

  this.prefix = '';

  this.mouseRasterY = 0;
  this.mouseRasterX = 0;

}

DbgC64Bitmap.prototype = {
  init: function(args) {

    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

    this.canvasElementId = this.prefix + "BitmapCanvas";

  },

  setVisible: function(visible) {
    this.visible = visible;
    if(visible) {
      this.forceRedraw();
    }
  },

  getVisible: function() {
    return this.visible;
  },

  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    this.bitmapSplitPanel = UI.create("UI.SplitPanel");

    var html = '';
    html += '<div class="panelFill">';


    html += '<div>';
    html += '<label class="cb-container" style="margin-right: 4px">';
    html += 'Mouse Inspect';
    html += '<input type="checkbox" value="mouse" class="showMouseInfo"  id="' + this.prefix + 'bitmapMouseInspect"><span class="checkmark"></span></label>';
    html += '</div>';


    html += '</div>';

    var infoPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.addNorth(infoPanel, 40, false);


    this.uiComponent.add(this.bitmapSplitPanel);


    

    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + 'BitmapCanvas'});
    this.bitmapSplitPanel.add(this.scrollCanvas);




    html = '';
    html += '<div class="panelFill">';
/*
    html += '<div style="margin-top: 6px">';
    html += 'Charset By ';

    html += '<label class="rb-container" style="margin-right: 4px">Mouse Location'
    html += '<input type="radio" checked="checked" value="mouse"  name="' + this.prefix + 'ShowCharset" id="' + this.prefix + 'CharsetAtMouse">';
    html += '<span class="checkmark"></span>';
    html += '</label>';

    html += '<label class="rb-container" style="margin-right: 4px">Raster'
    html += '<input type="radio" value="raster" name="' + this.prefix + 'ShowCharset"  id="' + this.prefix + 'CharsetAtMouse">';
    html += '<span class="checkmark"></span>';
    html += '</label>';


    html += '<label class="rb-container" style="margin-right: 4px">Memory'
    html += '<input type="radio" value="memory" name="' + this.prefix + 'ShowCharset"  id="' + this.prefix + 'CharsetAtMouse">';
    html += '<span class="checkmark"></span>';
    html += '</label>';


    html += '<input size="4" id="' + this.prefix + 'CharsetAddress"/>';
    html += '</div>';


    html += '<div id="' + this.prefix + 'CharsetInfo">';
    html += '</div>';
*/
    html += '</div>'

    this.htmlSouthPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.bitmapSplitPanel.addSouth(this.htmlSouthPanel, 65, false);


    var _this = this;
    UI.on('ready', function() {
      _this.initContent();
      _this.initEvents();
    });
  },

  resizeCanvas: function() {
    this.context = UI.getContextNoSmoothing(this.scrollCanvas.getCanvas());
    /*
    this.context = this.scrollCanvas.getContext();

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
    */
  },

  resize: function () {


  },

  initContent: function() {
    this.canvas = this.scrollCanvas.getCanvas();
    this.canvasElementId = this.canvas.id;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 320; // this.charWidth * this.charsAcross;
    this.offscreenCanvas.height = 200;// this.charHeight * this.charsDown;


    this.offscreenContext = this.offscreenCanvas.getContext('2d');


    this.offscreenImageData = this.offscreenContext.getImageData(0, 0, 
      this.offscreenCanvas.width, this.offscreenCanvas.height);


  },


  initEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'bitmapMouseInspect').on('click', function() {
      _this.debugger.showMouseInfo($(this).is(':checked'));

    });
    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.scrollCanvas.on('resize', function() {
      _this.resizeCanvas();
    });

    this.scrollCanvas.on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    this.scrollCanvas.on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    this.scrollCanvas.on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    /*

    $('input[name=' + this.prefix + 'ShowCharset]').on('click', function() {
      var showCharset = $('input[name=' + _this.prefix + 'ShowCharset]:checked').val();
      _this.setShowCharset(showCharset);
    });
    */
  },


  debuggerMousePosition: function(rasterX, rasterY, fgColor, bgColor, char) {
    this.mouseRasterX = rasterX;
    this.mouseRasterY = rasterY;
    this.fgColor = fgColor;
    this.bgColor = bgColor;
    this.highlightChar = char;
  },

  debuggerMouseLeave: function() {
    this.mouseRasterX = false;
    this.mouseRasterY = false;
    this.fgColor = 1;
    this.bgColor = 0;
  },


  xyToChar: function(x,y) {
    /*
    var dstCharacterSpacing = 0;

    var charX = Math.floor((x - dstCharacterSpacing * 2) / (2 * (this.charWidth + dstCharacterSpacing)) );
    var charY = Math.floor((y - dstCharacterSpacing * 2) / (2 * (this.charHeight + dstCharacterSpacing)) );

    var c = charX + charY * 16;

    return c;
    */

  },

  mouseDown: function(event) {
    this.charEditor.setCharAddress(this.charsetAddress + this.highlightedChar * 8);
    
  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

//    x = x * this.canvasScale;
//    y = y * this.canvasScale;    
//    this.highlightedChar = this.xyToChar(x,y);
  },

  mouseUp: function(event) {

  },

  mouseLeave: function(event) {

  },

  forceRedraw:function() {
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    this.lastWidth = false;
    this.lastHeight = false;    
  },


  //https://dustlayer.com/vic-ii/2013/4/26/vic-ii-for-beginners-screen-modes-cheaper-by-the-dozen
  //http://www.coding64.org/?p=164

  // https://sta.c64.org/cbm64disp.html
  drawBitmap: function() {
    var colors = c64.colors.colors;


    var dd00 = false;

    var vicRegisters = [];
    var rasterY = this.mouseRasterY;

    if(rasterY !== false) {
      for(var i = 0; i < 0x40; i++) {
        vicRegisters[i] = c64_vicReadRegisterAt(rasterY, this.mouseRasterX, i);
      }

      dd00 = c64_cia2ReadRegisterAt(rasterY, this.mouseRasterX, 0);
    } else {
      for(var i = 0; i < 0x40; i++) {
        vicRegisters[i] = c64_vicReadRegister(i);// c64_cpuReadNS(0xd000 + i);//c64_vicReadAbsolute(0xd000 + i);
      }

      dd00 = c64_cpuReadNS(0xdd00);// c64_vicReadAbsolute(0xdd00);
    }

    var vicBankStart = 0;
    switch (dd00 & 0x3) {
      case 0:
        vicBankStart = 49152;
        break;
      case 1:
        vicBankStart = 32768;
        break;
      case 2:
        vicBankStart = 16384;
        break;
      case 3:
        vicBankStart = 0;
        break;
    }
    //var bitmapMembase = (vicRegisters[0x18] & 0x0e) << 10;
    var bitmapMembase = (vicRegisters[0x18] & 0x08) << 10;
    var screenMemBase = ((vicRegisters[0x18] & 0xf0) >> 4) * 0x400;
    var multicolorMode = (vicRegisters[0x16] & 0x10) > 0;
    var backgroundColor = colors[(vicRegisters[0x21] & 0xf)];


    var imageData = this.offscreenImageData.data;
    var dstIndex = 0;

    var bitmapAddress = vicBankStart + bitmapMembase;
//    console.log(vicBankStart.toString(16) + ',' + bitmapAddress.toString(16));
    //for(var i = 0; i < 320 * 200 / 8; i++) {
  var count =0 ;
    var src = 0;
    for(var y = 0; y < 25; y++) {
      for(var x = 0; x < 40; x++) {
        var screenAddress = vicBankStart + screenMemBase + (x + y * 40)
        var screenByte = c64_vicReadAbsolute(screenAddress);
        var colorByte = c64_cpuReadNS(0xd800 + (x + y * 40)) ;
        var screenColor1 = colors[screenByte & 0xf];
        var screenColor1R = screenColor1 & 0xff;
        var screenColor1G = (screenColor1 >> 8) & 0xff;
        var screenColor1B = (screenColor1 >> 16) & 0xff;

        var screenColor2 = colors[(screenByte >> 4) & 0xf];
        var screenColor2R = screenColor2 & 0xff;
        var screenColor2G = (screenColor2 >> 8) & 0xff;
        var screenColor2B = (screenColor2 >> 16) & 0xff

        var screenColor3 = colors[colorByte & 0xf];
        for(var row = 0; row < 8; row++) {
          var i = src++;//8 * ((y * 40) + x) + row;
          var b = c64_vicReadAbsolute(vicBankStart + bitmapMembase + i);
          

          var dstIndex = 4 * ((y * 8 + row) * 320 + x * 8);

          if(multicolorMode) {
            for(var j = 0; j < 8; j++) {
              var value = 0;
              var b1 = b & (1 << (7-j));
              if(b1 > 0) {
                value = 2;
              }
              j++;
              var b2 = b & (1 << (7-j));
              if(b2 > 0) {
                value++;
              }

              /*
                Bit pair = %00: Pixel has Background Color.
                Bit pair = %01: Pixel color is determined by bits #4-#7 of the corresponding screen byte in Screen RAM.
                Bit pair = %10: Pixel color is determined by bits #0-#3 of the corresponding screen byte in Screen RAM.
                Bit pair = %11: Pixel color is determined by the corresponding color byte in Color RAM.
              */              

              var red = 0;
              var green = 0;
              var blue = 0;
              switch(value) {
                case 0:
                  red = backgroundColor & 0xff;
                  green = (backgroundColor >> 8) & 0xff;
                  blue = (backgroundColor >> 16) & 0xff;
                  break;
                case 1:
                  red = screenColor2R;
                  green = screenColor2G;
                  blue = screenColor2B;
                  break;
                case 2:
                  red = screenColor1R;
                  green = screenColor1G;
                  blue = screenColor1B;

                  break;
                case 3:
                  red = screenColor3 & 0xff;
                  green = (screenColor3 >> 8) & 0xff;
                  blue = (screenColor3 >> 16) & 0xff;

                  break;
              }
              count += 2;
              imageData[dstIndex++] = red;
              imageData[dstIndex++] = green;
              imageData[dstIndex++] = blue;
              imageData[dstIndex++] = 255;
              imageData[dstIndex++] = red;
              imageData[dstIndex++] = green;
              imageData[dstIndex++] = blue;
              imageData[dstIndex++] = 255;
            }

          } else {

            /*
              Bit = 0: Pixel color is determined by bits #0-#3 of the corresponding screen byte in Screen RAM.
              Bit = 1: Pixel color is determined by bits #4-#7 of the corresponding screen byte in Screen RAM.
            */

            for(var j = 7; j >= 0; j--) {
              var bit = (b >> j) & 1;
      //        b = b >> 1;

              if(bit) {
                imageData[dstIndex++] = screenColor2R;
                imageData[dstIndex++] = screenColor2G;
                imageData[dstIndex++] = screenColor2B;
                imageData[dstIndex++] = 255;

              } else {
                imageData[dstIndex++] = screenColor1R;
                imageData[dstIndex++] = screenColor1G;
                imageData[dstIndex++] = screenColor1B;
                imageData[dstIndex++] = 255;
              }
            }
          }
        }
      }

//      charData[i] = c64_vicReadAbsolute(vicBankStart + bitmapMembase + i);
    }
    this.offscreenContext.putImageData(this.offscreenImageData, 0, 0);
    
    
  },

  draw: function(context) {

    this.context = context;
    if(this.context && this.canvas) {
      this.context.fillStyle = '#111111';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.drawBitmap();
    this.scale = 2 * UI.devicePixelRatio;
    this.context.drawImage(this.offscreenCanvas, 
                          0, 
                          0, 
                          this.offscreenCanvas.width * this.scale, 
                          this.offscreenCanvas.height * this.scale);
  },

  update: function() {

    if(this.visible) {
      this.scrollCanvas.render();
    }
  }
}
