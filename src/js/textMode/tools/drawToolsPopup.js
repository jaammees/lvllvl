var DrawToolsPopup = function() {
  this.editor = null;

  this.character = 0;
  this.color = 0;

  this.drawPopupCanvas = null;
  this.drawPopupContext = null;
  this.drawPopupGrid = null;

  this.highlightX = 0;
  this.highlightY = 0;

  this.charScale = 2;

  this.relatedCharacters = null;

  this.uiComponent = null;

  this.shiftDown = false;

  this.callback = null;


  this.elements = [];

}

DrawToolsPopup.prototype = {

  getHTML: function() {
    var tools = this.editor.tools.drawTools.getTools();
    var html = '<div style="background-color: #111111">';


    if(g_app.isMobile()) {
      for(var toolKey in tools) {
        if(tools.hasOwnProperty(toolKey)) {
          var tool = tools[toolKey];
          var label = tool.label;

          if(tool.isMobileTool) {
            if( (toolKey.indexOf('pixel') != 0 || toolKey == 'pixel') && toolKey != 'rotate') {
              html += '<div class="mobile-popup-tool" data-tool="' + toolKey + '">';
              html += '<img  src="' + tool.mobileIcon + '"/>';
              html += '<span class="mobile-popup-tool-label">' + tool.label + '</span>';
              html += '</div>';
            }
          }
        }
      }
    } else {
      for(var toolKey in tools) {
        if(tools.hasOwnProperty(toolKey)) {
          var tool = tools[toolKey];
          var label = tool.label;

          if( (toolKey.indexOf('pixel') != 0 || toolKey == 'pixel') && toolKey != 'rotate') {
            html += '<div class="popup-tool" id="popup-tool-' + toolKey + '" data-tool="' + toolKey + '">';
            html += '<img width="20" src="' + tool.icon + '"/>';
            html += '<span class="popup-tool-label">' + tool.label + '</span>';
            if(tool.key !== false) {
              html += '<span class="popup-tool-shortcut">(' + tool.key + ')</span>';
            }
            html += '</div>';
          }
        }
      }
    }

    html += '</div>';
    return html;
  },

  setScreenMode: function() {
    var screenMode = this.editor.getScreenMode();
    if(screenMode == 'vector') {
      $('#popup-tool-charpixel').hide();
      $('#popup-tool-linesegment').hide();
      $('#popup-tool-pixel').hide();
    } else {
      $('#popup-tool-charpixel').show();
      $('#popup-tool-linesegment').show();
      $('#popup-tool-pixel').show();
    }
  },

  init: function(editor, callback) {
    this.editor = editor;


    this.relatedCharacters = [];
    /*
    this.relatedCharacters[0] = [100, 111, 121, 98,  248, 247, 227, 160, 228, 239, 249, 226, 120, 119, 99, 255, 226, 127];
    this.relatedCharacters[1] = [79,  119, 80,  236, 226, 251, 112, 64, 110, 233,  223, 214,  219, 32, 32, 97,  219, 225];
    this.relatedCharacters[2] = [101, 32,  103, 97,  32,  225, 66,  32, 93,  95,   105, 91,   102, 32, 32, 124, 98,  126];
    this.relatedCharacters[3] = [76,  111, 122, 252, 98,  254, 109, 64, 125];
    */

    this.drawPopupGrid = [];
    for(var i = 0; i < 30; i++) {
      this.drawPopupGrid[i] = [];
      for(var j = 0; j < 30; j++) {
        this.drawPopupGrid[i][j] = null;

      }
    }


    var _this = this;

    this.uiComponent = UI.create("UI.Popup", { "id": "drawToolsPopup", "width": 180, "height": 200 });
    
    var html = this.getHTML();
    this.htmlComponent = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.add(this.htmlComponent);

    this.uiComponent.on('keydown', function(event) {
      _this.keyDown(event);
    });

    this.uiComponent.on('keyup', function(event) {
      _this.keyUp(event);
    });

    this.initEvents();
    if(typeof callback != 'undefined') {
      callback();
    }


    /*
    this.htmlComponent.load('html/textMode/drawToolsPopup.html', function() {
      _this.initEvents();
      if(typeof callback != 'undefined') {
        callback();
      }
    });
    */
  },

  doCallback: function() {
    if(typeof this.callback != 'undefined' && this.callback) {
      this.callback();
    }

  },
  initEvents: function() {
    var _this = this;


    $('.popup-tool').on('click', function(event) {
      var tool = $(this).attr('data-tool');
      _this.editor.tools.drawTools.setDrawTool(tool);
      UI.hidePopup();    
    });

    $('.mobile-popup-tool').on('click', function(event) {
      var tool = $(this).attr('data-tool');
      _this.editor.tools.drawTools.setDrawTool(tool);
      UI.hidePopup();    

    });
    /*

    $('#drawPopupCanvas').on('click', function(event) {
      _this.mouseDown(event);
    });

    $('#drawPopupCanvas').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('.drawPopupTool').on('click', function() {
      var id = $(this).attr('id');
      id = id.substring('drawPopupTool_'.length);
      _this.editor.tools.drawTools.setDrawTool(id);
      _this.doCallback();
      UI.hidePopup(); 
    });

    $('.drawPopupTool').on('mouseover', function() {
      var id = $(this).attr('id');
      id = id.substring('drawPopupTool_'.length);

      var label = _this.editor.tools.drawTools.getToolLabel(id);
      $('#currentPopupTool').html(label);
    });

    $('.drawPopupTool').on('mouseleave', function() {
      var label = _this.editor.tools.drawTools.getToolLabel(_this.editor.tools.drawTools.tool);
      $('#currentPopupTool').html(label);
    });
*/

  },

 

  xyToElement: function(x, y) {
    this.highlightRecentCharacter = false;
    this.highlightRightClickCharacter  = false;
    this.highlightRightClickColor = false;
    this.highlightRecentColor = false;

    for(var i = 0; i < this.elements.length; i++) {
      if(x >= this.elements[i].x && x < this.elements[i].x + this.elements[i].width
         && y >= this.elements[i].y && y < this.elements[i].y + this.elements[i].height) {
        //console.log(this.elements[i]);
        switch(this.elements[i].type) {
          case 'rightclicktile':
            this.highlightRightClickCharacter = true;
          break;
          case 'rightclickcolor':
            this.highlightRightClickColor = true;
          break;
          case 'recenttile':
            this.highlightRecentCharacter = this.elements[i].index;
          break;
          case 'recentcolor':
            this.highlightRecentColor = this.elements[i].index;
          break;
        }
        return true;
      }
    }


    return false;

    var gap =  (this.charWidth * this.charScale + this.charMargin) * 2;

    var recentCharacters = this.editor.currentTile.recentCharacters;

    var rightClickCharacter = this.highlightRightClickCharacter;
    var character = this.highlightCharacter;
    var recentCharacter = this.highlightRecentCharacter;

    var rightClickColor = this.highlightRightClickColor;
    var color = this.highlightColor;


    this.highlightRightClickCharacter = -1;
    this.highlightRecentCharacter = -1;
    this.highlightColor = -1;
    this.highlightCharacter = -1;
    this.highlightRightClickColor = -1;

    // recent characters
    if(y >= this.recentCharactersY && y < this.recentCharactersY + this.charHeight * this.charScale) {
      if(x >= this.recentCharactersX && x < this.recentCharactersX + this.charWidth * this.charScale) {
        this.highlightRightClickCharacter = this.character;
        return this.highlightRightClickCharacter != rightClickCharacter;
      }

      if(x >= this.recentCharactersX + gap) {
        x = x - (this.recentCharactersX +  gap);

        var index = Math.floor(x / (this.charWidth * this.charScale + this.charMargin))
        if(index < recentCharacters.length) {
          this.highlightRecentCharacter = index;
          return this.highlightRecentCharacter != recentCharacter;
        }
      }
    }

    // right click color
    if(y >= this.rightClickColorY && y < this.rightClickColorY + this.colorHeight + this.colorMargin) {
      if(x >= this.rightClickColorX && x < this.rightClickColorX + this.colorWidth + this.colorMargin) {
        this.highlightRightClickColor = this.color;
        return this.highlightRightClickColor != color;
      }

    }

    // color palette

    var colorPaletteHeight = Math.ceil(this.colorCount / this.colorsAcross) * (this.colorHeight + this.colorMargin);
    var colorPaletteWidth = this.colorsAcross * (this.colorWidth + this.colorMargin);

    if(y >= this.colorPaletteY && y < this.colorPaletteY + colorPaletteHeight) {
      if(x >= this.colorPaletteX && x < this.colorPaletteX + colorPaletteWidth) {
        var xIndex = Math.floor((x - this.colorPaletteX) / (this.colorWidth + this.colorMargin));
        var yIndex = Math.floor((y - this.colorPaletteY) / (this.colorHeight + this.colorMargin));
        var index = xIndex + yIndex * this.colorsAcross;
        if(index < this.colorCount) {
          this.highlightColor = index;
          return this.highlightColor != color;
        }
      }
    }

    var charPaletteHeight = this.charactersDown * (this.charHeight * this.charScale + this.charMargin);
    var charPaletteWidth = this.charactersAcross * (this.charWidth * this.charScale + this.charMargin);
    if(y >= this.charPaletteY && y < this.charPaletteY + charPaletteHeight) {
      if(x >= this.charPaletteX && x <= this.charPaletteX + charPaletteWidth) {

        var xIndex = Math.floor((x - this.charPaletteX) / (this.charWidth * this.charScale + this.charMargin));
        var yIndex = Math.floor((y - this.charPaletteY) / (this.charHeight * this.charScale + this.charMargin));
        var index = xIndex + yIndex * this.charactersAcross;
        this.highlightCharacter = index;
        return this.highlightCharacter != character;
      }
    }


    return this.highlightRecentCharacter != recentCharacter
        || this.highlightRightClickColor != color
        || this.highlightRightClickCharacter != rightClickCharacter
        || this.highlightCharacter != character
        || this.highlightColor != color;


  },

  drawCanvas: function() {

    if(this.drawPopupCanvas == null) {
      this.drawPopupCanvas = document.getElementById('drawPopupCanvas');
    }

    if(!this.drawPopupCanvas) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    var recentCharacters = this.editor.currentTile.recentCharacters;
    var recentColors = this.editor.currentTile.recentColors;


    var canvasHeight = charHeight * this.charScale + this.charMargin + this.colorHeight + 20 + 24;
    var canvasWidth = 170;


    if(this.drawPopupContext == null || this.drawPopupCanvas.height != canvasHeight || this.drawPopupCanvas.width != canvasWidth) {
      this.drawPopupCanvas.height = canvasHeight;
      this.drawPopupContext = this.drawPopupCanvas.getContext("2d");      
    }

    this.drawPopupContext.clearRect(0, 0, this.drawPopupCanvas.width, this.drawPopupCanvas.height);
    var imageData = this.drawPopupContext.getImageData(0, 0, this.drawPopupCanvas.width, this.drawPopupCanvas.height);

    var width = 30;
    var height = 30;


    // ------------------------------------------ draw characters ----------------------------- //
    x = 1;
    y = 0;


    var bgColor = this.editor.currentTile.bgColor;
    if(bgColor === false) {
      bgColor = this.editor.frames.getBackgroundColor();
    }

    var args = {};
    args['imageData'] = imageData;
    args['color'] = this.editor.currentTile.color;
    args['bgColor'] = bgColor;
    args['scale'] = this.charScale;


    // draw right-clicked character

    var recentTilesHeadingX = x + (charWidth * this.charScale + this.charMargin) * 2;;
    var recentTilesHeadingY = y;
    y += 12;

    this.recentCharactersY = y;
    this.recentCharactersX = x;
    var charIndex = this.character;

/*
    if(this.shiftDown) {
      if(charIndex < 128) {
        charIndex += 128;
      } else {
        charIndex -= 128;
      }
    }
*/

    args['character'] = charIndex;
    args['x'] = x;
    args['y'] = y;
    args['highlight'] = this.highlightRightClickCharacter !== false;


    tileSet.drawCharacter(args);
    this.elements.push({
      x: x,
      y: y,
      width: charWidth * this.charScale,
      height: charHeight * this.charScale,
      type: "rightclicktile"
    });

  
    x += (charWidth * this.charScale + this.charMargin) * 2;

    var showTileCount = recentCharacters.length;
    if(showTileCount > 7) {
      showTileCount = 7;
    }
    // draw recent characters
    for(var i = showTileCount - 1; i >= 0; i--) {

      var charIndex = recentCharacters[i];

/*
      if(this.shiftDown) {
        if(charIndex < 128) {
          charIndex += 128;
        } else {
          charIndex -= 128;
        }
      }
*/
      args['character'] = charIndex;
      args['x'] = x;
      args['y'] = y;
      args['highlight'] = this.highlightRecentCharacter === showTileCount - 1 - i;
      tileSet.drawCharacter(args);

      this.elements.push({
        x: x,
        y: y,
        width: charWidth * this.charScale,
        height: charHeight * this.charScale,
        type: "recenttile",
        index: showTileCount - 1- i
      });

      x += charWidth * this.charScale + this.charMargin;
    }

    y += charHeight * this.charScale + this.charMargin;
    y += 10;

    x = 1;

    var colorArgs = {};
    colorArgs['imageData'] = imageData;
    colorArgs['character'] = -1;
    colorArgs['charWidth'] = this.colorWidth;
    colorArgs['charHeight'] = this.colorHeight;
    colorArgs['scale'] = 1;
//    colorArgs['padding'] = 2;


    // ---------------------------------- draw colours --------------------------------------- //
    // draw right clicked color

    var recentColorsHeadingX = x + (charWidth * this.charScale + this.charMargin) * 2;;
    var recentColorsHeadingY = y;

    y += 12;


    this.rightClickColorX = x;
    this.rightClickColorY = y;
    colorArgs['color'] = this.color;
    colorArgs['x'] = x;
    colorArgs['y'] = y;
    colorArgs['highlight'] = this.highlightRightClickColor !== false;

    tileSet.drawCharacter(colorArgs);
    this.elements.push({
      x: x,
      y: y,
      width: this.colorWidth,
      height: this.colorHeight,
      type: "rightclickcolor"
    });


    x += (charWidth * this.charScale + this.charMargin) * 2;

    var showColorCount = recentColors.length;
    if(showColorCount > 7) {
      showColorCount = 7;
    }
    // draw recent characters
    for(var i = showColorCount - 1; i >= 0; i--) {

      var colorIndex = recentColors[i];

      colorArgs['color'] = colorIndex;
      colorArgs['x'] = x;
      colorArgs['y'] = y;
      colorArgs['highlight'] = this.highlightRecentColor === showColorCount - 1 - i;

      tileSet.drawCharacter(colorArgs);
      this.elements.push({
        x: x,
        y: y,
        width: this.colorWidth,
        height: this.colorHeight,
        type: "recentcolor",
        index: showColorCount - 1 - i
      });

      x += this.colorWidth + this.charMargin;
    }


    this.drawPopupContext.putImageData(imageData, 0, 0);


    this.drawPopupContext.font = "8px Verdana";
    this.drawPopupContext.fillStyle = "#eeeeee";
    this.drawPopupContext.fillText("Recent Tiles",  recentTilesHeadingX, recentTilesHeadingY + 6); 


    this.drawPopupContext.font = "8px Verdana";
    this.drawPopupContext.fillStyle = "#eeeeee";
    this.drawPopupContext.fillText("Recent Colours",  recentColorsHeadingX, recentColorsHeadingY + 6); 

  },


  keyDown: function(event) {
    this.shiftDown = event.shiftKey;
    //this.drawCanvas();
  },

  keyUp: function(event) {
    this.shiftDown = event.shiftKey;
    //this.drawCanvas();
  },

  show: function(x, y, character, color, callback) {
    this.callback = callback;

    var width = 180;
    height = 210;
    this.uiComponent.setDimensions(width, height);
    UI.showPopup("drawToolsPopup", x, y);

    this.setScreenMode();

    return;
    console.error('show popup');
    this.editor.grid.setCursorEnabled(false);


    this.character = character;
    this.color = color;

    // work out the dimensions of the popup
    var height = 0;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.charWidth = tileSet.getTileWidth();
    this.charHeight = tileSet.getTileHeight();

    this.charactersAcross = 16;
    this.charactersDown = 8;

    this.charScale = 2;
    if(this.charHeight >= 16) {
      this.charScale = 1;
    }

    this.charMargin = 2;

    this.colorCount = colorPalette.getColorCount();
    this.colorWidth = 16;
    this.colorHeight = 16;
    this.colorMargin = 2;
    this.colorsAcross = colorPalette.getColorsAcross();
    this.colorsDown = colorPalette.getColorsDown();

    // tools
    height += 72;

    // recent characters
    height += this.charHeight * this.charScale + this.charMargin;
    height += 10;

    // recent colors
    height += this.colorHeight + this.colorMargin;
    height += 10;

    // color palette
    height += this.colorsDown * (this.colorHeight + this.colorMargin);

    height += this.charactersDown * (this.charHeight * this.charScale + this.charMargin);

    // instructions text
    height += 20;
//    $('#drawPopupMenu').css('height', height + 'px');

    var width = 180;
    height = 210;
    this.uiComponent.setDimensions(width, height);
    UI.showPopup("drawToolsPopup", x, y);


    this.highlightRecentCharacter = false;
    this.highlightRightClickCharacter  = false;
    this.highlightRightClickColor = false;
    this.highlightRecentColor = false;


    this.drawCanvas();
  },


  hide: function() {
    this.editor.grid.setCursorEnabled(true);
  },


  makeSelection: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var currentTile = this.editor.currentTile;


    if(typeof this.highlightRightClickCharacter == 'undefined') {
      return;
    }

    if(this.highlightRightClickCharacter !== false) {
      var charIndex = this.character;//this.highlightRightClickCharacter;

      /*
      if(this.shiftDown && charIndex < 128) {
        charIndex += 128;
      }
      */

      currentTile.setCharacters([[charIndex]]);
      this.doCallback();
      UI.hidePopup();
      return;
    }

    if(this.highlightRightClickColor !== false) {
      currentTile.setColor(this.color);
      this.doCallback();
      UI.hidePopup();
      return;
    }

    if(this.highlightRecentCharacter !== false) {
      var recentCharacters = currentTile.recentCharacters;

      var index = this.highlightRecentCharacter;
      if(index < recentCharacters.length) {
        index = recentCharacters.length - 1 - index;
        var charIndex = recentCharacters[index];

        this.editor.currentTile.setCharacters([[charIndex]]);
        this.doCallback();
        UI.hidePopup();    
        return;
      }
    }

    if(this.highlightRecentColor !== false) {
      var recentColors = this.editor.currentTile.recentColors;      
      var index = this.highlightRecentColor;
      index = recentColors.length - 1 - index;
      if(index >= 0 && index < recentColors.length) {
        var color = recentColors[index];

        this.editor.currentTile.setColor(color);
        this.doCallback();
        UI.hidePopup();    
        return;
      }

    }

    if(this.highlightColor != -1) {
      if(this.highlightColor < colorPalette.getColorCount()) {
        this.editor.currentTile.setColor(this.highlightColor);
        this.doCallback();
        UI.hidePopup();     
        return;
      }
    }

    if(this.highlightCharacter != -1) {
      if(this.highlightCharacter < 128) {
        charIndex = this.highlightCharacter;

        charIndexX = charIndex % this.charactersAcross;
        charIndexY = Math.floor(charIndex / this.charactersAcross);

        this.editor.currentTile.setCharacters([[charIndex]]);
        this.doCallback();
        UI.hidePopup();      
        return;

      }
    }

  },

  mouseDown: function(event) {

    this.makeSelection();

  },
  mouseMove: function(event) {

    var x = event.pageX - $('#drawPopupCanvas').offset().left;
    var y = event.pageY - $('#drawPopupCanvas').offset().top;


    /*
    if(this.xyToElement(x, y)) {

      this.drawCanvas();
    }
    */


/*
    var x = Math.floor(event.offsetX / (this.editor.petscii.charWidth * scale + 2));
    var y = Math.floor(event.offsetY / (this.editor.petscii.charHeight * scale + 2));

    if(this.drawPopupGrid[y][x]) {
      this.highlightX = x;
      this.highlightY = y;
      this.drawCanvas();
    }
*/


  },
  mouseUp: function(event) {

  }
}