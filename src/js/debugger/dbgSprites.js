var DbgSprites = function () {
  this.machine = null;
  this.visible = true;

  this.context = null;
  this.offscreenCanvas = null;
  this.offscreenContext = null;
  this.offscreenImageData = null;
  this.spritesLocation = false;

  this.spriteEditor = null;

  this.lastWidth = false;
  this.lastHeight = false;
  this.lastScrollY = false;

  this.prefix = '';

  this.spritePositions = [];

  this.rasterY = false;
  this.showSprites = 'mouse';

  this.exportSpriteData = null;

}

DbgSprites.prototype = {
  init: function (args) {
    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

    var dbgFont = g_app.dbgFont;
    dbgFont.createFonts();

    this.fontCanvas = dbgFont.fontCanvas;
    this.hexNumberCanvas = dbgFont.hexNumberCanvas[0];
    this.setFontMetrics();


    this.spriteEditor = new DbgC64SpriteEditor();
    this.spriteEditor.init(this, args);


  },

  setFontMetrics: function() {
    var dbgFont = g_app.dbgFont;
    this.fontCharWidth = dbgFont.fontCharWidth;
    this.fontCharHeight = dbgFont.fontCharHeight;
    this.hexNumberPositions = dbgFont.hexNumberPositions;
    this.cmdPositions = dbgFont.cmdPositions;
    this.lineHeight = this.fontCharHeight + 4 * UI.devicePixelRatio;  


    this.cmdPositionX = 23 * this.fontCharWidth;
    this.cyclesPositionX = 19 * this.fontCharWidth;

    this.opCodePositionX = this.breakpointColWidth + this.fontCharWidth * 4 + 20;

  },

  setVisible: function (visible) {
    this.visible = visible;
  },

  getVisible: function () {
    return this.visible;
  },

  undo: function() {
    this.spriteEditor.undo();
  },

  redo: function() {
    this.spriteEditor.redo();
  },

  buildInterface: function (parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    this.spriteSplitPanel = UI.create("UI.SplitPanel");

    var html = '';
    html += '<div class="panelFill">';

    html += '<div style="margin-top: 6px">';

    html += 'Sprites At ';

    html += '<label class="rb-container" style="margin-right: 4px">Mouse Location'
    html += '<input name="' + this.prefix + 'ShowSprites" type="radio" checked="checked" value="mouse" id="' + this.prefix + 'SpritesMouseLocation">';
    html += '<span class="checkmark"></span>';
    html += '</label>';

    html += '<label class="rb-container" style="margin-right: 4px">At Raster Y'
    html += '<input name="' + this.prefix + 'ShowSprites" type="radio" value="raster" id="' + this.prefix + 'SpritesAtRasterY">';
    html += '<span class="checkmark"></span>';
    html += '</label>';
//    html += '<input size="4" id="' + this.prefix + 'SpriteRasterY"/>';


    html += '<label class="rb-container" style="margin-right: 4px">Memory'
    html += '<input name="' + this.prefix + 'ShowSprites" type="radio" value="memory" id="' + this.prefix + 'SpritesInMemory">';
    html += '<span class="checkmark"></span>';
    html += '</label>';

    html += '</div>';


    html += '<div>';
    html += '<label id="' + this.prefix + 'SpriteMouseInfo"><span class="ui-text-label">Raster Y </span><span size="4" id="' + this.prefix + 'SpritesRasterY"></span>  (click to set)</label>';
    html += '<label id="' + this.prefix + 'SpriteRasterYInfo" style="display: none" class="ui-text-label">Raster Y <input class="number" size="4" id="' + this.prefix + 'SpritesRasterYInput"/></label>';
    html += '<label id="' + this.prefix + 'SpriteMemoryInfo" style="display: none" class="ui-text-label"> <input class="number" size="4" id="' + this.prefix + 'SpritesMemoryInput"/></label>';
    html += '</div>';



    html += '<div id="' + this.prefix + 'SpriteInfo">';
    html += '</div>';



    html += '</div>';

    var infoPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.addNorth(infoPanel, 70, false);

    this.uiComponent.add(this.spriteSplitPanel);


    this.editorPanel = UI.create("UI.Panel");
    this.spriteSplitPanel.addNorth(this.editorPanel, 280, true, false);

    this.spriteEditor.buildInterface(this.editorPanel);


    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + 'SpriteCanvas'});
    this.spriteSplitPanel.add(this.scrollCanvas);


    html = '';
    html = '<div class="panelFill">';

    html += '<div style="margin-top: 4px">';
    html += '<label class="cb-container" style="margin-right: 4px">';
    html += '<input type="checkbox" value="mouse" class="showMouseInfo"  id="' + this.prefix + 'spritesMouseInspect"><span class="checkmark"></span>';
    html += '<span class="cb-label">Mouse Inspect</span>';
    html += '</label>';


    html += '<label class="cb-container" style="margin-right: 4px; display: inline-block">';    
    html += '<input type="checkbox" value="mouse" id="' + this.prefix + 'showSpriteEditor"><span class="checkmark"></span>';
    html += '<span class="cb-label">Show Sprite Editor</span>';
    html += '</label>';


    html += '<div class="ui-button" id="' + this.prefix + 'exportSpriteData">Export Data...</div>';
    html += '</div>';



    html += '</div>'

    this.htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.spriteSplitPanel.addSouth(this.htmlPanel, 30, false);

    var _this = this;
    this.htmlPanel.on('resize', function () {
      _this.resize();
    });

    var _this = this;
    UI.on('ready', function () {
      _this.initContent();
      _this.initEvents();
    });
  },

  initContent: function () {

    this.spriteWidth = 24;
    this.spriteHeight = 21;

    this.showSpriteEditor(false);

    //this.canvas = document.getElementById(this.prefix + 'SpritesCanvas');
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.spriteWidth;
    this.offscreenCanvas.height = this.spriteHeight;




    this.offscreenContext = this.offscreenCanvas.getContext('2d');
    this.offscreenImageData = this.offscreenContext.getImageData(0, 0,
      this.offscreenCanvas.width, this.offscreenCanvas.height);
  },

  showSpriteEditor: function(show) {
    this.spriteSplitPanel.setPanelVisible('north', show);

    var checkbox = $('#' + this.prefix + 'showSpriteEditor');
    if(checkbox != null && typeof checkbox.length != 'undefined') {
      checkbox.prop('checked', show);
    }

    if(show) {
      this.spriteEditor.updateColors();
    }

  },

  doExportSpriteData: function() {
    if(this.exportSpriteData == null) {
      this.exportSpriteData = new ExportC64SpriteData();
    }

    this.exportSpriteData.show();
    
  },

  initEvents: function () {

    var _this = this;

    $('#' + this.prefix + 'spritesMouseInspect').on('click', function() {
      _this.debugger.showMouseInfo($(this).is(':checked'));

    });    

    $('#' + this.prefix + 'showSpriteEditor').on('click', function() {
      _this.showSpriteEditor($(this).is(':checked'));
    });

    $('#' + this.prefix + 'exportSpriteData').on('click', function() {
      _this.doExportSpriteData();
    });
    /*
    $('#' + this.prefix + 'SpritesCurrent').on('click', function () {
      _this.setSpritesCurrent($(this).is(':checked'));
    });

    $('#' + this.prefix + 'SpritesAddress').on('change', function () {
      var address = parseInt($(this).val(), 16);
      if (!isNaN(address)) {
        _this.setSpritesLocation(address);
      }
    });

    $('#' + this.prefix + 'SpritesAddress').on('keyup', function () {
      var address = parseInt($(this).val(), 16);
      if (!isNaN(address)) {
        _this.setSpritesLocation(address);
      }
    });
    */

    $('input[name=' + this.prefix + 'ShowSprites]').on('click', function() {
      var value = $('input[name=' + _this.prefix + 'ShowSprites]:checked').val();
      _this.setShowSprites(value);

    });

    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.scrollCanvas.on('resize', function() {
      _this.doClear();
    });

    this.scrollCanvas.on('dblclick', function(event) {
      _this.dblClick(event);
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
  },

  setRasterY: function(rasterY) {
    this.rasterY = parseInt(rasterY, 10);
    if(isNaN(rasterY)) {
      return;
    }

    $('#' + this.prefix + 'SpritesRasterYInput').val(rasterY);
  },

  setShowSprites: function(showSprites) {
    $('input[name=' + this.prefix + 'ShowSprites][value=' + showSprites + ']').prop('checked', true);
    this.showSprites = showSprites;

    $('#' + this.prefix + 'SpriteMouseInfo').hide();
    $('#' + this.prefix + 'SpriteRasterYInfo').hide();
    $('#' + this.prefix + 'SpriteMemoryInfo').hide();
    if(showSprites == 'memory') {
      $('#' + this.prefix + 'SpriteMemoryInfo').show();
      this.setSpritesCurrent(false);
    } else {
      this.setSpritesCurrent(true);
    }

    if(showSprites == 'raster') {
      $('#' + this.prefix + 'SpriteRasterYInfo').show();
    }
    if(showSprites == 'memory') {
      $('#' + this.prefix + 'SpriteMemoryInfo').show();
    }

  },

  setSpritesLocation: function (address) {
    this.lastScrollY = false;
    if (this.spritesLocation === false) {
      return;
    }

    this.spritesLocation = address;
  },
  setSpritesCurrent: function (showCurrentSprites) {
    this.lastScrollY = false;
    if (showCurrentSprites) {
      this.spritesLocation = false;
    } else {
      this.spritesLocation = 0x2000;
    }
  },

  resize: function () {
    var element = $('#dbgSpritePanel');

    var position = element.offset();
    if (position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }


//    var canvasHeight = this.height - 30;

    /*
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
*/

  },

  doClear: function() {
    this.context = this.scrollCanvas.getContext();
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
  },

  drawSprite: function (imageData, spriteLocation, multicolor, spriteColor, bgColor, mc1Color, mc2Color) {

    var colors = c64.colors.colors;

    var multiColors = [];
    multiColors.push(colors[bgColor] & 0xffffff);
    multiColors.push(colors[mc1Color] & 0xffffff);
    multiColors.push(colors[0] & 0xffffff);
    multiColors.push(colors[mc2Color] & 0xffffff);


    var dstImageData = imageData;//this.offscreenImageData;
    var imageDataWidth = imageData.width; //this.offscreenImageData.width;
    var imageDataHeight = imageData.height; //this.offscreenImageData.height;


    // sprites are 21 high
    for (var y = 0; y < 21; y++) {
      //        var spriteColor = this.debugger.readByte(0xd027) & 0xf;
      multiColors[2] = colors[spriteColor];

      // (sprite index * sprite height + current sprite y) x imageDataWidth * 4
      dstPos = y * imageDataWidth * 4;
      // sprites are 3 bytes wide
      for (var b = 0; b < 3; b++) {
        var v = c64_vicReadAbsolute(spriteLocation++);
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
              color = colors[spriteColor];
            }

            dstImageData.data[dstPos++] = (color) & 0xff;
            dstImageData.data[dstPos++] = (color >> 8) & 0xff;
            dstImageData.data[dstPos++] = (color >> 16) & 0xff;
            dstImageData.data[dstPos++] = 0xff;
          }
        }
      }
    }

  },

  drawSpritesAtMemoryLocation: function (context) {

    var scrollCanvas = this.scrollCanvas;

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();

    var scrollY = scrollCanvas.getScrollY();

    context.fillStyle= '#222222';
    context.fillRect(0, 0, width, height);

//    var spriteLocation = this.spritesLocation;
    var multicolor = false;
    var spriteColor = 1;
    var bgColor = 0;
    var mc1Color = 2;
    var mc2Color = 3;

    var x = 6;
    var y = 6;



    var spriteDisplayWidth = this.offscreenCanvas.width * 2 * UI.devicePixelRatio;

    var spriteDisplayHeight = this.offscreenCanvas.height * 2 * UI.devicePixelRatio;
    var spriteXSpacing = spriteDisplayWidth + 16;
    this.spriteYSpacing = spriteDisplayHeight + this.lineHeight + 10;

    var textWidth = this.fontCharWidth * 4 + 16;

    if(textWidth > spriteXSpacing) {
      spriteXSpacing = textWidth;
    }

    var spritesAcross = Math.floor(width / spriteXSpacing);
    var spritesDown = Math.ceil(height / this.spriteYSpacing);

    var spriteLocation = Math.floor(scrollY / this.spriteYSpacing) * spritesAcross * 64;

    scrollY = scrollY % this.spriteYSpacing;

    var spriteCount = spritesAcross * (spritesDown + 1);

    var contentHeight = Math.ceil(0xffff / (spritesAcross * 64)) * this.spriteYSpacing;
    this.scrollCanvas.setContentHeight(contentHeight);
    this.spritePositions = [];
    for (var i = 0; i < spriteCount; i++) {

      this.drawSprite(this.offscreenImageData, spriteLocation, multicolor, spriteColor, bgColor, mc1Color, mc2Color);
      this.offscreenContext.putImageData(this.offscreenImageData, 0, 0);

      this.spritePositions.push({
        x: x,
        y: y - scrollY,
        width: spriteDisplayWidth,
        height: spriteDisplayHeight,
        address: spriteLocation
      });

      this.context.drawImage(this.offscreenCanvas,
        x,
        y - scrollY,
        spriteDisplayWidth,
        spriteDisplayHeight);

      var spriteLocationString = spriteLocation.toString(16);
      var line = spriteLocationString;
      this.drawLine(line, x, y + spriteDisplayHeight + 4 - scrollY);
  


      x += spriteXSpacing;
      if (x + (spriteXSpacing) > width) {
        x = 6;
        y += this.spriteYSpacing;
      }

      /*
      this.context.strokeStyle = "red";
      this.context.beginPath();
            this.context.rect(x, y, this.offscreenCanvas.width * 2, this.offscreenCanvas.height * 2);
      this.context.stroke();
      */

      spriteLocation += 64;

      if(spriteLocation > 0xffff) {
        break;
      }
    }
  },

  dblClick: function(event) {
    if(!this.scrollCanvas) {
      return;
    }

    this.canvas = this.scrollCanvas.getCanvas();
    this.canvasElementId = this.canvas.id;

    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    for(var i = 0; i < this.spritePositions.length; i++) {
      if(x >= this.spritePositions[i].x && x < this.spritePositions[i].x + this.spritePositions[i].width
        && y >= this.spritePositions[i].y && y < this.spritePositions[i].y + this.spritePositions[i].height) {
          var spriteAddress = this.spritePositions[i].address;
          
          this.spriteEditor.setSpriteAddress(spriteAddress);
          break;
        }
    }

    this.showSpriteEditor(true);
  },

  mouseDown: function(event) {
    if(!this.scrollCanvas) {
      return;
    }

    this.canvas = this.scrollCanvas.getCanvas();
    this.canvasElementId = this.canvas.id;

    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    x = x * UI.devicePixelRatio;
    y = y * UI.devicePixelRatio;

    for(var i = 0; i < this.spritePositions.length; i++) {
      if(x >= this.spritePositions[i].x && x < this.spritePositions[i].x + this.spritePositions[i].width
        && y >= this.spritePositions[i].y && y < this.spritePositions[i].y + this.spritePositions[i].height) {
          var spriteAddress = this.spritePositions[i].address;
          
          this.spriteEditor.setSpriteAddress(spriteAddress);
          break;
        }
    }

  },

  mouseMove: function(event) {

  },

  mouseUp: function(event) {

  },

  forceRedraw:function() {
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    this.lastWidth = false;
    this.lastHeight = false;    
  },

  debuggerMousePosition: function(rasterX, rasterY) {
    this.mouseRasterX = rasterX;
    this.mouseRasterY = rasterY;
  },

  debuggerMouseLeave: function() {
    this.mouseRasterX = false;
    this.mouseRasterY = false;
  },

  debuggerMouseDown: function() {
    this.setShowSprites('raster');
    this.setRasterY(this.mouseRasterY);

  },

  drawCurrentSprites: function (context) {
    this.context = context;

    var scrollCanvas = this.scrollCanvas;

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();

    var scrollY = -scrollCanvas.getScrollY();

    if(scrollY !== this.lastScrollY 
      || width !== this.lastWidth 
      || height !== this.lastHeight
    ) {

      
      this.lastScrollY = scrollY;
      this.lastWidth = width;
      this.lastHeight = height;
      this.doClear();

//      this.setInputPosition();
    }


    context.fillStyle= '#000000';
    context.fillRect(0, 0, width, height);

    var contentHeight = (this.fontCharHeight + 4 + (this.fontCharHeight + 2) * 4 + 20) * 8;
    this.scrollCanvas.setContentHeight(contentHeight);

    var vicBankStart = 0;
//    var dd02 = this.debugger.readByte(0xdd02);
    // bits 0-1 of dd00 are  vic chip system memory bank select (default 11)


//    var dd00 = c64_cpuReadNS(0xdd00) & 0x3;// this.debugger.readByte(0xdd00) & 0x3;

    var vicRegisters = [];
    var dd00 = false;
    var rasterY = this.mouseRasterY;

    if(this.showSprites == 'raster') {
      rasterY = this.rasterY;     
    }

    if(rasterY !== false) {
      for(var i = 0; i < 0x40; i++) {
        vicRegisters[i] = c64_vicReadRegisterAt(rasterY, this.mouseRasterX, i);
      }

      dd00 = c64_cia2ReadRegisterAt(rasterY, this.mouseRasterX, 0);
    } else {
      for(var i = 0; i < 0x40; i++) {
        vicRegisters[i] = c64_vicReadRegister(i);//(0xd000 + i);
      }

      dd00 = c64_cpuReadNS(0xdd00);

    }

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


    var d010 = vicRegisters[0x10];
    var d015 = vicRegisters[0x15];
    var d018 = vicRegisters[0x18];
    var d01c = vicRegisters[0x1c];
    var d021 = vicRegisters[0x21];
    var d025 = vicRegisters[0x25];
    var d026 = vicRegisters[0x26];


    // d018 The four most significant bits form a 4-bit number in the range 0 thru 15: 
    // Multiplied with 1024 this gives the start address for the screen character RAM.
    // (relative to start of vic bank)
//    var d018 = this.debugger.readByte(0xd018);
    var screenMemory = vicBankStart + ((d018 & 0xf0) >> 4) * 1024;


    var spritePointers = [];

    // sprite colours start at $D027

    var bgColor = d021 & 0xf;//c64_cpuReadNS(0xd021) & 0xf;
    var mc1Color = d025 & 0xf;//c64_cpuReadNS(0xd025) & 0xf;
    var mc2Color = d026 & 0xf;//c64_cpuReadNS(0xd026) & 0xf;

    var html = '';
    html += ' VIC Bank: 0x' + ('0000' + vicBankStart.toString(16)).substr(-4);
    html += ' MC1: 0x' + ('00' + mc1Color.toString(16)).substr(-2);
    html += ', MC2: 0x' + ('00' + mc2Color.toString(16)).substr(-2);
    if(rasterY !== false) {
      html += '<div>';
      html += 'Raster Y:' + rasterY;
      html += '</div>';
    }

    $('#' + this.prefix + 'SpriteInfo').html(html);

    var x = 6;
    var y = 6;

    var line = "";

    var spriteDrawWidth = this.offscreenCanvas.width * 3 * UI.devicePixelRatio;
    var spriteDrawHeight = this.offscreenCanvas.height * 3 * UI.devicePixelRatio;

    // sprite x msb
//    var d010 = c64_cpuReadNS(0xd010);

    // sprite enabled
//    var d015 = c64_cpuReadNS(0xd015);

    // sprite multicolor
//    var d01c = c64_cpuReadNS(0xd01c);
    var spriteMulticolor = d01c;// c64_cpuReadNS(0xd01c);

    // need to fix this, should depend on screen memory location
    var spritePointerLocation = screenMemory + 0x3f8;//0x7f8;
    this.spritePositions = [];

    for (var i = 0; i < 8; i++) {
      //spritePointers[i] = c64_cpuReadNS(screenMemory + 1016 + i);
      if(rasterY !== false) {
        spritePointers[i] = c64_debugger_get_sprite_pointer(i);
      } else {
        spritePointers[i] = c64_vicReadAbsolute(screenMemory + 1016 + i);
      }

      var spriteLocation = vicBankStart + spritePointers[i] * 64;
      var multicolor = ((spriteMulticolor >>> i) & 0x1) !== 0;
      var spriteColor = vicRegisters[0x27 + i] & 0xf;// c64_cpuReadNS(0xd027 + i) & 0xf;

      line = "SPRITE " + i;
      this.drawLine(line, x, y + scrollY);
      y += this.fontCharHeight + 4;

      this.drawSprite(this.offscreenImageData, spriteLocation, multicolor, spriteColor, bgColor, mc1Color, mc2Color);
      this.offscreenContext.putImageData(this.offscreenImageData, 0, 0);


      this.spritePositions.push({
        x: x,
        y: y + scrollY,
        width: width,
        height: spriteDrawHeight,
        address: spriteLocation
      });
      this.context.drawImage(this.offscreenCanvas,
        x,
        y + scrollY,
        spriteDrawWidth,
        spriteDrawHeight);

      // sprite info

      

      x += spriteDrawWidth + 10;
      var textPosition = x;
      var textPositionY = y;

//      var spritePointer = c64_vicReadAbsolute(spritePointerLocation + i);//c64_cpuReadNS(spritePointerLocation + i);

      line = "POINTER ";      
      this.context.globalAlpha = 0.5;
      this.drawLine(line, x, y + scrollY);
      this.context.globalAlpha = 1;

      line = '$' + spritePointers[i].toString(16);
      var spriteLocationString = spriteLocation.toString(16);
      line += " ($" + spriteLocationString + ")";
      // 7 chars plus space in "POINTER "
      this.drawLine(line, x + 8 * this.fontCharWidth, y + scrollY);


      y += this.fontCharHeight + 2;
      x = textPosition;

      line = "ENABLED ";
      this.context.globalAlpha = 0.5;
      this.drawLine(line, x, y + scrollY);
      this.context.globalAlpha = 1;

      line = "NO";
      if (d015 & (1 << i)) {
        line = "YES";
      }
      this.drawLine(line, x +  8 * this.fontCharWidth, y + scrollY);


      y += this.fontCharHeight + 2;
      x = textPosition;

      line = "MONOCHROME";
      if (spriteMulticolor & (1 << i)) {
        line = "MULTICOLOUR";
      }
      this.drawLine(line, x + 8 * this.fontCharWidth, y + scrollY);

      y += this.fontCharHeight + 2;
      x = textPosition;


      var xPos = vicRegisters[i * 2];//c64_cpuReadNS(0xd000 + i * 2);
      if (d010 & (1 << i)) {
        xPos += 256;
      }

      line = "X ";
      this.context.globalAlpha = 0.5;
      this.drawLine(line, x, y + scrollY);
      this.context.globalAlpha = 1;

      line = xPos.toString();
      this.drawLine(line, x + 2 * this.fontCharWidth, y + scrollY);

      //y += this.fontCharHeight;
      x += this.fontCharWidth * 9;
      var yPos = vicRegisters[i * 2 + 1];//c64_cpuReadNS(0xd001 + i * 2);
      line = "Y ";
      this.context.globalAlpha = 0.5;
      this.drawLine(line, x, y + scrollY);
      this.context.globalAlpha = 1;

      line = yPos.toString();
      this.drawLine(line, x + 2 * this.fontCharWidth, y + scrollY);

      y += this.fontCharHeight + 2;
      x = 6;
      y += 20;//= 6 + (spriteDrawHeight + 10) * i;

      if (y + scrollY > height) { //this.canvas.height) {
        break;
      }
    }
  },

  drawLine: function (line, x, y) {
    var charWidth = this.fontCharWidth;
    var charHeight = this.fontCharHeight;

    var lineLength = line.length;
    for (var j = 0; j < lineLength; j++) {
      var c = line.charCodeAt(j);

      srcX = c * charWidth;
      srcY = 0;
      srcWidth = charWidth;
      srcHeight = charHeight;
      dstX = x + j * charWidth;
      dstY = y;
      dstWidth = charWidth;
      dstHeight = charHeight;

      this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
    }
  },

  draw: function (context) {

    this.setFontMetrics();
    this.context = context;
/*
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
*/
    /*
    if (this.canvas == null) {
      return;
    }
    */

    //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.spritesLocation !== false) {
      this.drawSpritesAtMemoryLocation(context);
    } else {
      this.drawCurrentSprites(context);
    }
    /*
        var cpu = this.machine.getCPU();
        var ram = this.machine.getRAM();
        var vic = this.machine.getVIC();
    */
    //    var videoMatrixBase = (this.machine.getByte(0xd018) & 0xf0) << 6;



    //console.log(screenMemory);
    //    console.log(spritePointers[0]);

  },

  
  update: function () {
//    console.log("SPRITES UPDATE!!!");
    if(this.visible) {
      this.scrollCanvas.render();
    }
    this.spriteEditor.draw();
  }
}