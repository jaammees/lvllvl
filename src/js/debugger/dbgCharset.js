
var DbgCharset = function() {
  this.machine = null;
  this.visible = true;

  this.canvas = null;
  this.context = null;
  this.offscreenCanvas = null;
  this.offscreenContext = null;
  this.offscreenImageData = null;

  this.charEditor = null;  

  this.charsetAddress = false;
  this.fgColor = 0x6;
  this.bgColor = 0xe;
  this.selectedChar = 0;
  this.highlightChar = false;

  this.selectedFgColor = 14;
  this.selectedBgColor = 6;
  this.selectedMode = 'standard';
  this.highlightBgColor = false;

  this.prefix = '';


  this.mouseRasterY = 0;
  this.mouseRasterX = 0;
  this.mouseAddress = false;

  this.isROMCharset = false;

  this.rasterY = false;

  this.drawMode = false; // draw in emulator
  this.inDraw = false;
  this.lastSetAddress = false;
  this.lastSetByte = false;

}

DbgCharset.prototype = {
  init: function(args) {

    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

    this.canvasElementId = this.prefix + "CharsetCanvas";

    this.charEditor = new DbgC64CharEditor();
    this.charEditor.init(this, args);
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

  undo: function() {
    this.charEditor.undo();
  },

  redo: function() {
    this.charEditor.redo();
  },



  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    this.charsetSplitPanel = UI.create("UI.SplitPanel");

    var html = '';
    html += '<div class="panelFill">';

    html += '<div>';


    html += '<div style="margin-top: 6px">';
    html += '<span class="ui-text-label">Charset At</span> ';

    html += '<label class="rb-container" style="margin-right: 4px">Mouse Location'
    html += '<input type="radio" checked="checked" value="mouse"  name="' + this.prefix + 'ShowCharset" id="' + this.prefix + 'CharsetAtMouse">';
    html += '<span class="checkmark"></span>';
    html += '</label>';

    html += '<label class="rb-container" style="margin-right: 4px">Raster'
    
    html += '<input type="radio" value="raster" name="' + this.prefix + 'ShowCharset"  id="' + this.prefix + 'CharsetAtRaster">';
    html += '<span class="checkmark"></span>';
    html += '</label>';


    html += '<label class="rb-container" style="margin-right: 4px">Memory'
    html += '<input type="radio" value="memory" name="' + this.prefix + 'ShowCharset"  id="' + this.prefix + 'CharsetAtMemory">';
    html += '<span class="checkmark"></span>';
    html += '</label>';


    html += '</div>';


    html += '<div>';
    html += '<label id="' + this.prefix + 'CharsetMouseInfo"><span class="ui-text-label">Raster Y </span><span size="4" id="' + this.prefix + 'CharsetRasterY"></span>  (click to set)</label>';
    html += '<label id="' + this.prefix + 'CharsetRasterYInfo" style="display: none" class="ui-text-label">Raster Y <input class="ui-number" size="4" id="' + this.prefix + 'CharsetRasterYInput"/></label>';
    html += '<label id="' + this.prefix + 'CharsetMemoryInfo" style="display: none" class="ui-text-label">Address $ <input size="4" id="' + this.prefix + 'CharsetAddress"/></label>';
    html += '</div>';

    html += '</div>';




    html += '</div>';

    var infoPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.addNorth(infoPanel, 60, false);

    this.uiComponent.add(this.charsetSplitPanel);

    this.editorPanel = UI.create("UI.Panel");
    this.charsetSplitPanel.addNorth(this.editorPanel, 260, true, false);

    this.charEditor.buildInterface(this.editorPanel);

//    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + 'CharCanvas'});
//    this.charsetSplitPanel.add(this.scrollCanvas);

    html = '<div class="panelFill">';
    html += '<div style="height: 24px" id="' + this.prefix + 'CharsetInfo">';
    html += '</div>';

    html += '<canvas id="' + this.prefix + 'CharCanvas"></canvas>';
    html += '</div>';

    this.canvasPanel = UI.create("UI.HTMLPanel", { html: html });


    html = '<div class="panelFill" style="background-color: #000000" >';


    html += '<canvas id="' + this.prefix + 'ColorPaletteCanvas"></canvas>';

    html += '<div>';
    html += '<label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Standard';
    html += '<input type="radio" value="standard" checked="checked" name="' + this.prefix + 'charDebuggerMode" id="' + this.prefix + 'charDebuggerModestandard"><span class="checkmark"></span>';
    html += '</label>';

    html += '<label class="rb-container" style="margin-right: 4px; display: inline-block">';
    html += 'Multicolour';
    html += '<input type="radio" value="multicolor"  name="' + this.prefix + 'charDebuggerMode" id="' + this.prefix + 'charDebuggerModemulticolor"><span class="checkmark"></span>';
    html += '</label>';

    html += '</div>';

    html += '</div>';
    this.colorPalettePanel = UI.create("UI.HTMLPanel", { html: html });

    var splitPanel = UI.create("UI.SplitPanel");
    splitPanel.add(this.canvasPanel);
    splitPanel.addSouth(this.colorPalettePanel, 100);

    this.charsetSplitPanel.add(splitPanel);




    html = '';
    html += '<div class="panelFill">';


    html += '<div style="">';


    html += '<label class="cb-container" style="margin-right: 4px; display: inline-block">';    
    html += '<input type="checkbox" value="mouse"  id="' + this.prefix + 'drawMode">';
    html += '<span class="cb-label">Draw In Emulator</span>';
    html += '<span class="checkmark"></span>';
    html += '</label>';
    
    html += '<label class="cb-container" style="margin-right: 4px; display: inline-block">';    
    html += '<input type="checkbox" value="mouse" id="' + this.prefix + 'showCharEditor">';
    html += '<span class="cb-label">Show Char Editor</span>';
    html += '<span class="checkmark"></span>';
    html += '</label>';


    html += '<label class="cb-container" style="margin-right: 4px; display: inline-block">';    
    html += '<input type="checkbox" value="mouse" class="showMouseInfo"  id="' + this.prefix + 'mouseInspect">';
    html += '<span class="cb-label">Mouse Inspect</span>';
    html += '<span class="checkmark"></span></label>';


    html += '</div>';


    html += '</div>'

    this.htmlSouthPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.charsetSplitPanel.addSouth(this.htmlSouthPanel, 30, false);


    var _this = this;
    UI.on('ready', function() {
      _this.initContent();
      _this.initEvents();
    });
  },

  resizeCanvas: function() {
    var scale = 2;
    var width = 8 * 16 * scale;
    var height = 8 * 16 * scale;
    this.canvas.width = width * UI.devicePixelRatio;
    this.canvas.height = height * UI.devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    if(this.canvas) {
      this.context = UI.getContextNoSmoothing(this.canvas); 
    }
    

    this.colorSize = 16 * scale;
    width = 8 * this.colorSize;
    height = 2 * this.colorSize;
    this.colorPaletteCanvas.width = width * UI.devicePixelRatio;
    this.colorPaletteCanvas.height = height * UI.devicePixelRatio;
    this.colorPaletteCanvas.style.width = width + 'px';
    this.colorPaletteCanvas.style.height = height + 'px';
    if(this.colorPaletteCanvas) {
      this.colorPaletteContext = UI.getContextNoSmoothing(this.colorPaletteCanvas); 
    }

  },

  resize: function () {


  },

  setDrawInEmulator: function(draw) {
    this.drawInEmulator = draw;
    $('#' + this.prefix + '').prop('checked', draw);
  },

  initContent: function() {
    this.charsAcross = 16;
    this.charsDown = 16;
    this.charWidth = 8;
    this.charHeight = 8;

    this.showCharEditor(false);
//    this.canvas = document.getElementById(this.canvasElementId);

    this.canvas = document.getElementById(this.prefix + 'CharCanvas');// this.scrollCanvas.getCanvas();
    this.canvasElementId = this.canvas.id;


    this.colorPaletteCanvasId = this.prefix + 'ColorPaletteCanvas';
    this.colorPaletteCanvas = document.getElementById(this.colorPaletteCanvasId);
    

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.charWidth * this.charsAcross;
    this.offscreenCanvas.height = this.charHeight * this.charsDown;

/*
//    this.canvas.width = this.offscreenCanvas.width * 2;
//    this.canvas.height = this.offscreenCanvas.height * 2;
    this.context = this.canvas.getContext('2d');
    
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
*/

    this.offscreenContext = this.offscreenCanvas.getContext('2d');


    this.offscreenImageData = this.offscreenContext.getImageData(0, 0, 
      this.offscreenCanvas.width, this.offscreenCanvas.height);


  },

  setCharMode: function(mode) {
    
    this.selectedMode = mode;
    $('#' + this.prefix + 'charDebuggerMode').prop('checked', true);
    // c64precharDebuggerModemulticolor
    // c64precharDebuggerModemulticolor
    this.charEditor.setMulticolor(this.selectedMode == 'multicolor');

    var d016 = c64_cpuReadNS(0xd016);
    if(mode == 'multicolor') {
      d016 = d016 | 0x10;
    } else {
      d016 = d016 & ~0x10;
    }
    this.debugger.writeByte(0xd016, d016);
  },

  setDrawMode: function(drawMode) {
    this.drawMode = drawMode;
    $('#' + this.prefix +'drawMode').prop('checked', drawMode);
  },

  showCharEditor: function(show) {
    this.charsetSplitPanel.setPanelVisible('north', show);

    var checkbox = $('#' + this.prefix + 'showCharEditor');
    if(checkbox != null && typeof checkbox.length != 'undefined') {
      checkbox.prop('checked', show);
    }

    if(show) {
      this.charEditor.updateColors();
    }
  },


  initEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'mouseInspect').on('click', function() {
      _this.debugger.showMouseInfo($(this).is(':checked'));

    });

    $('#' + this.prefix + 'showCharEditor').on('click', function() {
//      _this.debugger.showMouseInfo($(this).is(':checked'));
      _this.showCharEditor($(this).is(':checked'));

    });


    $('#' + this.prefix + 'drawMode').on('click', function() {
      _this.setDrawMode($(this).is(':checked'));
    });


    
    $('#' + this.canvasElementId).on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#' + this.canvasElementId).on('dblclick', function(event) {
      _this.dblClick(event);
    });

    $('#' + this.canvasElementId).on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.canvasElementId).on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#' + this.canvasElementId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    // this.colorPaletteCanvasId
    $('#' + this.colorPaletteCanvasId).on('mousedown', function(event) {
      _this.colorPaletteMouseDown(event);
    });

    /*
    $('#' + this.colorPaletteCanvasId).on('dblclick', function(event) {
      _this.dblClick(event);
    });
*/
    $('#' + this.colorPaletteCanvasId).on('mousemove', function(event) {
      _this.colorPaletteMouseMove(event);
    });

    $('#' + this.colorPaletteCanvasId).on('mouseup', function(event) {
      _this.colorPaletteMouseUp(event);
    });

    $('#' + this.colorPaletteCanvasId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    $('input[name=' + this.prefix + 'ShowCharset]').on('click', function() {
      var showCharset = $('input[name=' + _this.prefix + 'ShowCharset]:checked').val();

      
      _this.setShowCharset(showCharset);
    });

    $('#' + this.prefix + 'CharsetAddress').on('focus', function() {
      _this.debugger.blurMachine();
    });

    $('#' + this.prefix + 'CharsetAddress').on('change', function(event) {
      var address = parseInt($(this).val(), 16);
      if(isNaN(address)) {
        return;
      }
      _this.setCharsetAddress(address);
    });

    
    $('#' + this.prefix + 'CharsetAddress').on('keyup', function(event) {
      var address = parseInt($(this).val(), 16);
      if(isNaN(address)) {
        return;
      }
      _this.setCharsetAddress(address);

    });

    $('#' + this.prefix + 'CharsetRasterYInput').on('focus', function() {
      _this.debugger.blurMachine();
    });

    $('#' + this.prefix + 'CharsetRasterYInput').on('change', function() {
      var value = parseInt($(this).val(), 10);
      if(isNaN(value)) {
        return;
      }
      _this.setRasterY(value);
    });

    $('#' + this.prefix + 'CharsetRasterYInput').on('keyup', function() {
      var value = parseInt($(this).val(), 10);
      if(isNaN(value)) {
        return;
      }
      _this.setRasterY(value);
    });

    $('input[name=' + this.prefix + 'charDebuggerMode]').on('click', function() {
      var value = $('input[name=' + this.prefix + 'charDebuggerMode]:checked').val();
      var value = $(this).val();
      _this.setCharMode(value);
    });
  },


  setShowCharset: function(showCharset) {
    this.showCharset = showCharset;

    $('input[name=' + this.prefix + 'ShowCharset][value=' + showCharset + ']').prop('checked', true);
    $('#' + this.prefix + 'CharsetMouseInfo').hide();
    $('#' + this.prefix + 'CharsetRasterYInfo').hide();
    $('#' + this.prefix + 'CharsetMemoryInfo').hide();

    if(this.showCharset == 'mouse') {
      $('#' + this.prefix + 'CharsetMouseInfo').show();
    }


    if(this.showCharset == 'memory') {
      $('#' + this.prefix + 'CharsetMemoryInfo').show();
      var address = this.charsetAddress;
      $('#' + this.prefix + 'CharsetAddress').val(address.toString(16));
      /*
      var address = parseInt( $('#' + this.prefix + 'CharsetAddress').val(), 16);
      if(isNaN(address)) {
        return;
      }
      */
      this.setCharsetAddress(address);
    }

    if(this.showCharset == 'raster') {
      var rasterY = this.mouseRasterY;
      if(rasterY === false) {
        rasterY = 0;
      }
      $('#' + this.prefix + 'CharsetRasterYInput').val(rasterY);        

      $('#' + this.prefix + 'CharsetRasterYInfo').show();
    }
  },

  setRasterY: function(rasterY) {
    rasterY = parseInt(rasterY, 10);
    if(isNaN(rasterY)) {
      return;
    }

    this.rasterY = rasterY;

    $('#' + this.prefix + 'CharsetRasterYInput').val(rasterY);

    this.setShowCharset('raster');
  },


  debuggerMousePosition: function(address, colorAddress, rasterX, rasterY, fgColor, bgColor, char) {
    this.mouseAddress = address;
    this.mouseColorAddress = colorAddress;
    this.mouseRasterX = rasterX;
    this.mouseRasterY = rasterY;
    this.fgColor = fgColor;
    this.bgColor = bgColor;
    this.highlightChar = char;

    if(this.inDraw) {
      if(this.mouseAddress !== false && this.selectedChar !== false) {
        this.debuggerDrawChar(this.mouseAddress, this.selectedChar);
        this.inDraw = true;
      }

    }
  },

  debuggerMouseLeave: function() {
    this.mouseRasterX = false;
    this.mouseRasterY = false;
    this.fgColor = 1;
    this.bgColor = 0;
  },

  debuggerDrawChar: function(address, value) {
    
    if(this.lastSetAddress !== address || this.lastSetByte !== value) {
      this.debugger.writeByte(address, value);
      this.debugger.writeByte(this.mouseColorAddress, this.selectedFgColor);
      this.lastSetAddress = address;
      this.lastSetByte = value;
    }
  },

  debuggerMouseDown: function() {

    this.setRasterY(this.mouseRasterY);

    if(this.drawMode) {
      if(this.mouseAddress !== false && this.selectedChar !== false) {
        this.debuggerDrawChar(this.mouseAddress, this.selectedChar);
      }
      this.inDraw = true;
    }

  },

  debuggerMouseUp: function() {
    this.inDraw = false;
  },

  xyToChar: function(x,y) {
    var dstCharacterSpacing = 0;

    var charX = Math.floor((x - dstCharacterSpacing * 2) / (2 * (this.charWidth + dstCharacterSpacing)) );
    var charY = Math.floor((y - dstCharacterSpacing * 2) / (2 * (this.charHeight + dstCharacterSpacing)) );

    var c = charX + charY * 16;
    return c;

  },


  setSelectedChar: function(char) {
    if(this.selectedChar !== char) {
      this.selectedChar = char;
      this.charEditor.setCharAddress(this.charsetAddress + this.highlightChar * 8);      
      this.draw(this.context);
    }
  },

  xyToColor: function(x, y) {
    var colorSize = this.colorSize;
    var color = Math.floor(x / colorSize) + Math.floor(y / colorSize) * 8;
    
    return color;
  },

  setSelectedBgColor: function(color) {
    this.debugger.writeByte(0xd021, color);
    this.selectedBgColor = color;
    this.charEditor.setBgColor(color);
  },
  colorPaletteMouseDown: function(event) {
    var x = event.pageX - $('#' + this.colorPaletteCanvasId).offset().left;
    var y = event.pageY - $('#' + this.colorPaletteCanvasId).offset().top;

    var color = this.xyToColor(x, y);
    if(event.button == 2) {
      this.setSelectedBgColor(color);
    } else {
      this.selectedFgColor = color;
      this.charEditor.setFgColor(color);
    }
  }, 

  colorPaletteMouseMove: function(event) {
    var x = event.pageX - $('#' + this.colorPaletteCanvasId).offset().left;
    var y = event.pageY - $('#' + this.colorPaletteCanvasId).offset().top;

  }, 

  colorPaletteMouseUp: function(event) {
    var x = event.pageX - $('#' + this.colorPaletteCanvasId).offset().left;
    var y = event.pageY - $('#' + this.colorPaletteCanvasId).offset().top;

  }, 



  mouseDown: function(event) {
    this.setSelectedChar(this.highlightChar);
    
  },

  dblClick: function(event) {
    this.showCharEditor(true);
  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    var highlightChar = this.xyToChar(x, y);
    
    this.setHighlightChar(highlightChar);
  },

  mouseUp: function(event) {

  },

  mouseLeave: function(event) {

  },


  drawChar: function(dstImageData, address, multicolor, charColor, bgColor, mc1Color, mc2Color) {

    var colors = c64.colors.colors;
    var multiColors = [];
    multiColors.push(colors[bgColor] & 0xffffff);
    multiColors.push(colors[mc1Color] & 0xffffff);
    multiColors.push(colors[0] & 0xffffff);
    multiColors.push(colors[mc2Color] & 0xffffff);

    var imageDataWidth = dstImageData.width; //this.offscreenImageData.width;
    var imageDataHeight = dstImageData.height; //this.offscreenImageData.height;

    // sprites are 8 high
    for (var y = 0; y < 8; y++) {
      multiColors[2] = colors[charColor];

      // (sprite index * sprite height + current sprite y) x imageDataWidth * 4
      dstPos = y * imageDataWidth * 4;
      // sprites are 3 bytes wide
//      var v = this.debugger.readByte(address++);
      //var v = this.debugger.vicRead(address++);
      var v = c64_vicReadAbsolute(address++);
      for (var x = 7; x >= 0; x--) {
        var p = (v >>> x) & 1;

        if (multicolor) {
          var colorIndex = 0;
          if (p) {
            colorIndex += 2;
          }
          x--;
          var p2 = (v >>> x) & 1;
          if (p2) {
            colorIndex += 1;
          }
          var color32 = multiColors[colorIndex];

          dstImageData.data[dstPos++] = (color32) & 0xff;
          dstImageData.data[dstPos++] = (color32 >> 8) & 0xff;
          dstImageData.data[dstPos++] = (color32 >> 16) & 0xff;
          dstImageData.data[dstPos++] = 0xff;

          dstImageData.data[dstPos++] = (color32) & 0xff;
          dstImageData.data[dstPos++] = (color32 >> 8) & 0xff;
          dstImageData.data[dstPos++] = (color32 >> 16) & 0xff;
          dstImageData.data[dstPos++] = 0xff;


        } else {
          var color = colors[bgColor];
          if (p) {
            color = colors[charColor];
          }

          dstImageData.data[dstPos++] = (color) & 0xff;
          dstImageData.data[dstPos++] = (color >> 8) & 0xff;
          dstImageData.data[dstPos++] = (color >> 16) & 0xff;
          dstImageData.data[dstPos++] = 0xff;
        }
      }
    }
  

  },

  forceRedraw:function() {
    /*
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    */

    this.lastWidth = false;
    this.lastHeight = false;    
  },

  setHighlightChar: function(char) {
    if(char !== this.highlightChar) {
      this.highlightChar = char;
      this.draw(this.context);
    }
  },

  editChar: function(ch) {
    if(ch !== false) {
      this.setSelectedChar(ch);
      this.showCharEditor(true);
    }

  },


  getPixel: function(args) {
    var ch = this.selectedChar;
    if(typeof args.c != 'undefined') {
      ch = args.c;
    }
    var x = args.x;
    var y = args.y;

    if(typeof ch === 'undefined' || ch === false) {
      return 0;
    }

    var address = this.charsetAddress + ch * 8 + y % 8;
    var bit = 7 - (x % 8);
    var value = c64_vicReadAbsolute(address);
    return (value >> bit) & 1;
  },


  setPixel: function(args) {
    var ch = this.selectedChar;
    if(typeof args.c != 'undefined') {
      ch = args.c;
    }
    var x = args.x;
    var y = args.y;

    if(typeof ch === 'undefined' || ch === false) {
      return;
    }

    var address = this.charsetAddress + ch * 8 + y % 8;
    var bit = x % 8;
    var value = c64_vicReadAbsolute(address);

    if(args.value == 1) {
      value = value | (1 << (7 - bit) ); 
    } else {
      if(value & (1 << (7 - bit) )) {
        value = value ^ (1 << (7 - bit) ); 
      }
    }

    c64_cpuWrite(address, value);
  },

  setCharsetAddress: function(address) {
    this.charsetAddress = address;

    
  },

  drawColorPalette: function() {
    if(!this.colorPaletteContext) {
      return;
    }

    var context = this.colorPaletteContext;

    for(var i = 0; i < 16; i++) {
      var colorIndex = i;

      var multicolorMode = false;
      if(this.selectedMode == 'multicolor') {
        multicolorMode = true;
      }

      if(multicolorMode) {
        if(colorIndex > 7) {
          colorIndex -= 8;
        }
      }
        

      var color = c64.colors.getColor(colorIndex) & 0xffffff;
      var r = color & 0xff;
      var g = (color >> 8) & 0xff;
      var b = (color >> 16) & 0xff;
  
      r = ("00" + r.toString(16)).substr(-2);
      g = ("00" + g.toString(16)).substr(-2);
      b = ("00" + b.toString(16)).substr(-2);
      color = '#' + r + g + b;
      context.fillStyle = color;

      var x = (i % 8) * this.colorSize * UI.devicePixelRatio;
      var y = Math.floor(i / 8) * this.colorSize * UI.devicePixelRatio;

      context.fillRect(x, y, this.colorSize * UI.devicePixelRatio, this.colorSize * UI.devicePixelRatio);    

      if(multicolorMode && i > 7) {
        context.font = "10px Verdana";
        context.fillStyle = "#eeeeee";
        context.fillText("M", x + 2, y + 12);
      }
  
    }



    context.strokeStyle = 'yellow';
    if(this.selectedFgColor !== false) {
      var xPos = (this.selectedFgColor % 8) * this.colorSize * UI.devicePixelRatio;
      var yPos = Math.floor(this.selectedFgColor / 8) * this.colorSize * UI.devicePixelRatio;
      var colorSize = this.colorSize * UI.devicePixelRatio;

      context.fillStyle = 'yellow';
      context.beginPath();
      context.moveTo(xPos, yPos);
      context.lineTo(xPos + colorSize / 3, yPos);
      context.lineTo(xPos, yPos + colorSize / 3);
      context.fill();



      context.beginPath();
      context.lineWidth = 2;
      context.rect(xPos, yPos, this.colorSize * UI.devicePixelRatio, this.colorSize * UI.devicePixelRatio);
      context.stroke();
    }

    if(this.selectedBgColor !== false) {
      var xPos = (this.selectedBgColor % 8) * this.colorSize * UI.devicePixelRatio;
      var yPos = Math.floor(this.selectedBgColor / 8) * this.colorSize * UI.devicePixelRatio;

      var colorSize = this.colorSize * UI.devicePixelRatio;

      context.fillStyle = 'yellow';
      context.beginPath();
      context.moveTo(xPos + colorSize, yPos + colorSize);
      context.lineTo(xPos + colorSize - colorSize / 3, yPos + colorSize);
      context.lineTo(xPos + colorSize, yPos + colorSize - colorSize / 3);

      context.fill();


      context.beginPath();
      context.lineWidth = 2;
      context.rect(xPos, yPos, this.colorSize * UI.devicePixelRatio, this.colorSize * UI.devicePixelRatio);
      context.stroke();
    }

  },

  draw: function(context) {

//    this.context = context;

    if(!this.context) {
      this.resizeCanvas();
//      return;
    }


    if(!this.canvas) {
      return;
    }

    this.drawColorPalette();

    
    if(this.context && this.canvas) {
      this.context.fillStyle = '#111111';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    var colors = c64.colors.colors;
  
    var charData = [];

    var dd00 = false;

    var vicRegisters = [];

    var rasterY = this.mouseRasterY;

    if(this.showCharset == 'raster') {
      rasterY = this.rasterY;
    }

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
/*
    // d018 bits 1-3 are pointer to char memory or bitmap memory
    var d018 = c64_vicReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0x18);
    var d016 = c64_vicReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0x16);
    var d021 = c64_vicReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0x21);
    var d022 = c64_vicReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0x22);
    var d023 = c64_vicReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0x23);
    var dd00 = c64_cia2ReadRegisterAt(this.mouseRasterY, this.mouseRasterX, 0);
*/

    var charRom = this.debugger.readByte(1) & 8 == 0;
    var charmembase = (vicRegisters[0x18] & 0x0e) << 10;
    var multicolorMode = (vicRegisters[0x16] & 0x10) > 0;

    var backgroundColor = vicRegisters[0x21] & 0x0f;
    var mc1 = vicRegisters[0x22] & 0x0f;
    var mc2 = vicRegisters[0x23] & 0x0f;



    var foregroundColor = this.fgColor;

    foregroundColor = this.selectedFgColor;
    if(this.selectedMode == 'multicolor') {
      multicolorMode = true;
    }

    if(multicolorMode) {
      if(foregroundColor >= 8) {
        foregroundColor -= 8;
      } else {
        multicolorMode = false;
      }
    }

    var multiColors = [];
    multiColors.push(colors[backgroundColor] & 0xffffff);
    multiColors.push(colors[mc1] & 0xffffff);
    multiColors.push(colors[mc2] & 0xffffff);
    multiColors.push(colors[foregroundColor] & 0xffffff);


    // The VIC-II always sees the CHARROM at $1000-1FFF and $9000-9FFF, and RAM everywhere else, regardless of these bits.

    var isROMCharset = false;
    var vicBankStart = 0;
    switch (dd00 & 0x3) {
      case 0:
        vicBankStart = 49152;
        break;
      case 1:
        vicBankStart = 32768;
        if(charmembase == 0x1000) {
          isROMCharset = true;
        }
        break;
      case 2:
        vicBankStart = 16384;
        break;
      case 3:
        vicBankStart = 0;
        if(charmembase == 0x1000) {
          isROMCharset = true;
        }
        break;
    }


    

    if(this.showCharset != 'memory') {

      if(isROMCharset !== this.isROMCharset) {
        isROMCharset = this.isROMCharset;
      }

      for(var i = 0; i < 2048; i++) {
        charData[i] = c64_vicReadAbsolute(vicBankStart + charmembase + i);
      }

      this.charsetAddress = vicBankStart + charmembase;
    } else {
      for(var i = 0; i < 2048; i++) {
        charData[i] = c64_vicReadAbsolute(this.charsetAddress + i & 0xffff);
      }
    }

    var tileCount = 256;

    var srcCharPosition = charmembase;

    var labelColor = '#999999';
    var valueColor = '#cccccc';
    var html = '';
    html += ' <span style="color: ' + labelColor + '">VIC Bank </span>';
    html += '<span style="color: ' + valueColor + '">$' + ('0000' + vicBankStart.toString(16)).substr(-4) + '</span>';
    html += ' <span style="color: ' + labelColor + '">Charset Address </span>';
    html += '<span style="color: ' + valueColor + '">$' + ('0000' + this.charsetAddress.toString(16)).substr(-4) + '</span>'
    html += ' <span style="color: ' + labelColor + '">Char Address </span>';

    var charAddress = this.charsetAddress + this.selectedChar * 8;
    var charAddress = this.charsetAddress + this.highlightChar * 8;
    html += '<span style="color: ' + valueColor + '">$' + ('0000' + charAddress.toString(16)).substr(-4) + '</span>'

    if(rasterY !== false) {      
      $('#' + this.prefix + 'CharsetRasterY').html(rasterY);
    }

    //html += ' MC1: 0x' + ('00' + mc1Color.toString(16)).substr(-2);
    //html += ', MC2: 0x' + ('00' + mc2Color.toString(16)).substr(-2);
    $('#' + this.prefix + 'CharsetInfo').html(html);


    var onVal= 255;
    var offVal = 0;


    var fg = colors[foregroundColor] & 0xffffff;
    var fgR = fg & 0xff;
    var fgG = (fg >> 8) & 0xff;
    var fgB = (fg >> 16) & 0xff;

    var bg = colors[backgroundColor] & 0xffffff;
    var bgR = bg & 0xff;
    var bgG = (bg >> 8) & 0xff;
    var bgB = (bg >> 16) & 0xff;

//    fgR = fgG = fgB = 255;
//    bgR = bgG = bgB = 0;

    var dstCharacterSpacing = 0;
    var dstImageData = this.offscreenImageData;
    for(var c = 0; c < tileCount; c++) {
      // 16 chars across

      var dstCharX = c % this.charsAcross;
      var dstCharY = Math.floor(c / this.charsAcross);

      srcCharPosition =  c * 8;

      for(var y = 0; y < this.charHeight; y++) {
        var byteValue = charData[srcCharPosition + y];

        for(var x = 0; x < this.charWidth; x++) {
          var dstX = dstCharacterSpacing + dstCharX * (this.charWidth + dstCharacterSpacing) + x;
          var dstY = dstCharacterSpacing + dstCharY * (this.charHeight + dstCharacterSpacing) + y;

          var dstPos = (dstX + dstY * dstImageData.width) * 4;

          if(multicolorMode) {
            var value = 0;
            var b1 = byteValue & (1 << (7-x));
            if(b1 > 0) {
              value = 2;
            }
            x++;
            var b2 = byteValue & (1 << (7-x));
            if(b2 > 0) {
              value++;
            }
            var color32 = multiColors[value];

            dstImageData.data[dstPos] = (color32) & 0xff;
            dstImageData.data[dstPos + 1] = (color32 >> 8) & 0xff;
            dstImageData.data[dstPos + 2] = (color32 >> 16) & 0xff;
            dstImageData.data[dstPos + 3] = 0xff;

            dstImageData.data[dstPos + 4] = dstImageData.data[dstPos];
            dstImageData.data[dstPos + 5] = dstImageData.data[dstPos + 1];
            dstImageData.data[dstPos + 6] = dstImageData.data[dstPos + 2];
            dstImageData.data[dstPos + 7] = dstImageData.data[dstPos + 3];

            
          } else {
            if(byteValue & (1 << (7-x) )) {
              dstImageData.data[dstPos] = fgR;//onVal;
              dstImageData.data[dstPos + 1] = fgG; //onVal;
              dstImageData.data[dstPos + 2] = fgB; //onVal;
              dstImageData.data[dstPos + 3] = 255;
            } else {
              dstImageData.data[dstPos] = bgR; //offVal;
              dstImageData.data[dstPos + 1] = bgG; //offVal;
              dstImageData.data[dstPos + 2] = bgB; //offVal;
              dstImageData.data[dstPos + 3] = 255;
            }
          }

        }
      }

      srcCharPosition += 8;
    }

    this.offscreenContext.putImageData(dstImageData, 0, 0);
    this.scale = 2 * UI.devicePixelRatio;
    this.context.drawImage(this.offscreenCanvas, 
                          0, 
                          0, 
                          this.offscreenCanvas.width * this.scale, 
                          this.offscreenCanvas.height * this.scale);

    if(this.highlightChar !== false) { 
      var row = Math.floor(this.highlightChar / this.charsAcross);
      var column = this.highlightChar % this.charsAcross;
      var y = row * 8 * this.scale;
      var x = column * 8 * this.scale;
      var width = 8 * this.scale;
      var height = 8 * this.scale;
      this.context.lineWidth = 2;
      this.context.strokeStyle = "#ffaa00";      
      this.context.beginPath();
      this.context.rect(x, y, width, height);
      this.context.stroke();
    }

    if(this.selectedChar !== false) {
      var row = Math.floor(this.selectedChar / this.charsAcross);
      var column = this.selectedChar % this.charsAcross;
      var y = row * 8 * this.scale;
      var x = column * 8 * this.scale;
      var width = 8 * this.scale;
      var height = 8 * this.scale;
      this.context.lineWidth = 2;
      this.context.strokeStyle = "#ff0000";      
      this.context.beginPath();
      this.context.rect(x, y, width, height);
      this.context.stroke();
    }

  },

  update: function() {

    if(this.visible) {
      this.draw();
      //this.scrollCanvas.render();
    }


    this.charEditor.draw();
    
  }
}
