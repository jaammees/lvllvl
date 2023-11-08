var TileEditorGrid = function() {
  this.character = false;

  this.characters = [];
  this.cells = [];

  this.canvas = null;
  this.context = null;
  this.clipboardCanvas = null;

  // checkerboard pattern
  this.checkerboardCanvas = null;


  // the actual size version of selected characters
  this.characterCanvas = null;
  this.characterContext = null;

  this.characterCursorCanvas = null;
  this.characterCursorContext = null;

  this.charsAcross = 1;
  this.charsDown = 1;
  this.pixelWidth = 22;
  this.pixelHeight = 22;

  this.charWidth = false;
  this.charHeight = false;

  this.cursorPositionX = -1;
  this.cursorPositionY = -1;
  this.lastPixelX = -1;
  this.lastPixelY = -1;

  this.frame = 0;
  this.frameCount = 1;

  this.mixedAnimation = false;


  this.visible = false;

  this.tileSet = null;


  // the character to draw into the grid
  this.drawCharacter = false;
  this.drawFGColor = 0;
  this.drawBGColor = 0;

  // what color type currently using, cell, background, multi1, multi2
  this.c64ColorType = 'cell';

  // if using index color, the index to use
  this.colorIndex = 0;

  this.mode = 'pixelEdit';
  this.screenMode = '';

  this.buttons = 0;

  this.characterSelected = false;
  this.cellSelected = false;
  this.mouseOverCharacter = false;
  this.gridMouseEnter = false;
  this.gridMouseLeave = false;

  this.useCells = false;

  // if this handles mouse cursors
  this.setMouseCursor = false;

  this.useCurrentTileColor = true;
  this.currentColor = 2;

  this.drawPixelLines = true;

  this.scale = 1;
}

TileEditorGrid.prototype = {
  init: function(editor, args) {
    this.editor = editor;
    this.canvasElementId = args.canvasElementId;

    if(typeof args != 'undefined') {
      if(typeof args.useCells) {
        this.useCells = args.useCells;
      }

      if(typeof args.setMouseCursor != 'undefined') {
        this.setMouseCursor = args.setMouseCursor;
      }

      if(typeof args.useCurrentTileColor != 'undefined') {
        this.useCurrentTileColor = args.useCurrentTileColor;
      }
    }
  },

  on: function(trigger, f) {
    if(trigger == 'characterselected') {
      this.characterSelected = f;
    }

    if(trigger == 'cellselected') {
      this.cellSelected = f;
    }

    if(trigger == 'mouseovercharacter') {
      this.mouseOverCharacter = f;
    }

    if(trigger == 'mouseenter') {

      this.gridMouseEnter = f;
    }

    if(trigger == 'mouseleave') {
      this.gridMouseLeave = f;
    }

  },




  setMode: function(mode) {
    switch(mode) {
      case 'pixelEdit':
        // edit the pixels in the grid
        this.mode = 'pixelEdit';
        break;
      case 'characterEdit':
        // edit the characters in the grid
        this.mode = 'characterEdit';
        break;
      case 'characterEyedropper':
        this.mode = 'characterEyedropper';
        break;
      break;
    }
  },


  setCurrentColor: function(color) {
    this.currentColor = color;
  },

  initEvents: function() {
    var _this = this;


    this.canvas.addEventListener("touchstart", function(event){
      _this.touchStart(event);
      event.preventDefault();

    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      _this.touchMove(event);
      event.preventDefault();
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
      event.preventDefault();
    }, false);



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

  buildInterface: function(parentPanel) {

  },


  setupTileEditor: function() {

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.canvas === null) {

      this.canvas = document.getElementById(this.canvasElementId);
      if(this.canvas == null) {
        // still not ready
        return;
      }
      this.initEvents();
    }

    if(this.charWidth == tileSet.charWidth && this.charHeight == tileSet.charHeight) {
      return;
    }

    var maxWidth = 220;
    var maxHeight = 280;
    this.charWidth = tileSet.charWidth;
    this.charHeight = tileSet.charHeight;

    this.pixelWidth = Math.floor(maxWidth / this.charWidth);
    this.pixelHeight = Math.floor(maxHeight / this.charHeight);

    if(this.pixelWidth < this.pixelHeight) {
      this.pixelHeight = this.pixelWidth;
    }

    if(this.pixelHeight < this.pixelWidth) {
      this.pixelWidth = this.pixelHeight;
    }

    this.canvasScale = Math.floor(UI.devicePixelRatio);


    var width = (this.pixelWidth * this.charWidth + 1);
    var height = (this.pixelHeight * this.charHeight + 1);

    this.canvas.width = width * this.canvasScale;
    this.canvas.height = height * this.canvasScale;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.context = this.canvas.getContext('2d');

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;



    var left = (240 - this.canvas.width) / 2;
    this.canvas.style.left = left + 'px';

    var controlsTop = this.canvas.height + 10 + 10;
    document.getElementById('tileEditorControls').style.top = controlsTop + 'px';


    this.characterCanvas = document.createElement('canvas');
  },



  setSize: function(width, height) {
    if(!this.canvas) {
      return;
    }
    this.pixelWidth = Math.floor(width / this.charWidth);
    this.pixelHeight = Math.floor(height / this.charHeight);

    if(this.pixelWidth < this.pixelHeight) {
      this.pixelHeight = this.pixelWidth;
    }

    if(this.pixelHeight < this.pixelWidth) {
      this.pixelWidth = this.pixelHeight;
    }

    this.canvasScale = Math.floor(UI.devicePixelRatio);


//    var width = (this.pixelWidth * this.charWidth + 1);
//    var height = (this.pixelHeight * this.charHeight + 1);

    this.canvas.width = width * this.canvasScale;
    this.canvas.height = height * this.canvasScale;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.context = this.canvas.getContext('2d');

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;

//    this.scale = Math.floor( (this.canvas.width - 1) / (this.charWidth * this.charsAcross));
//    console.log("scale = " + this.scale);
    this.draw();
  },


  getHeight: function() {
    if(this.canvas == null) {
      return 0;
    } else {
      return this.canvas.height;
    }
  },

  // set the character to draw into the grid
  setDrawCharacter: function(drawCharacter) {
    this.drawCharacter = drawCharacter;
  },

  setDrawColor: function(color) {
    this.drawFGColor = color;
  },

  setCellColors: function(color) {
    for(var y = 0; y < this.cells.length; y++) {
      for(var x = 0; x < this.cells[y].length ;x++) {
        this.cells[y][x].fc = color;
      }
    }
    this.draw();
  },

  setDrawBGColor: function(color) {
    this.drawBGColor = color;
  },

  setCellBGColors: function(color) {
    for(var y = 0; y < this.cells.length; y++) {
      for(var x = 0; x < this.cells[y].length ;x++) {
        this.cells[y][x].bc = color;
      }
    }
    this.draw();
  },

  getCharacters: function() {
    return this.characters;
  },

  getCells: function() {
    return this.cells;
  },

  // set to a grid of cells..
  setCells: function(cells) {
    this.useCells = true;
    this.cells = [];
    for(var y = 0; y < cells.length; y++) {
      this.cells[y] = [];
      for(var x = 0; x < cells[y].length; x++) {
        this.cells[y][x] = {};
        for(var key in cells[y][x]) {
          if(cells[y][x].hasOwnProperty(key)) {
            this.cells[y][x][key] = cells[y][x][key];
          }
        }
      }
    }

    this.tileSet = this.editor.tileSetManager.getCurrentTileSet();    
    this.setupTileEditor();

    this.draw();
  },


  setCharacters: function(characters) {

    var changed = false;

    if(characters.length != this.characters.length) {
      changed = true;
    }

    if(!changed) {
      for(var y = 0; y < characters.length; y++) {
        if(characters[y].length != this.characters[y].length) {
          changed = true;
        }

        if(!changed) {
          for(var x = 0; x < characters[y].length; x++) {
            if(characters[y][x] != this.characters[y][x]) {
              changed = true;

              x = characters[y].length;
              y = characters.length;
              break;
            }
          }
        }
      }
    }

    if(!changed) {
      return;
    }

    this.tileSet = this.editor.tileSetManager.getCurrentTileSet();    
    this.setupTileEditor();


    this.characters = [];

    // have we checked the first character
    var firstCharacter = true;

    // do all the characters have the same properties
    var sameProperties = true;

    this.animated = false;
    this.ticksPerFrame = 0;
    this.animatedType = '';
    this.frames = 0;


    for(var y = 0; y < characters.length; y++) {
      this.characters.push([]);
      for(var x = 0; x < characters[y].length; x++) {
        var tileId = characters[y][x];

        this.characters[y].push(tileId);
        if(tileId != this.editor.tileSetManager.noTile) {
          var properties = this.tileSet.getTileProperties(characters[y][x]);
          if(properties !== false && typeof properties.animated != 'undefined' && properties.animated !== false) {
            if( (this.animated && this.ticksPerFrame == properties.ticksPerFrame && this.animatedType == properties.animated && this.frameCount == properties.frameCount) || firstCharacter) {
              this.animated = true;
              this.ticksPerFrame = properties.ticksPerFrame;
              this.animatedType = properties.animated;
              this.frameCount = properties.frameCount;
            } else {
              if(!firstCharacter) {
                sameProperties = false;
              }
            }

          } else {
            if((!this.animated) || firstCharacter) {
              this.animated = false;
            } else {
              if(!firstCharacter) {
                sameProperties = false;
              }
            }

          }
        }


        firstCharacter = false;
      }
    }

    this.frame = 0;
    $('#tileEditorFrame').val(1);

    this.draw();
  },

  setFrame: function(frame) {
    this.frame = frame;
    this.draw();
  },

  mouseEnter: function(event) {
    if(this.gridMouseEnter) {
      this.gridMouseEnter(event);
    }

  },

  mouseLeave: function(event) {
    this.cursorPositionX = -1;
    this.cursorPositionY = -1;

    if(this.gridMouseLeave) {
      this.gridMouseLeave(event);
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


  getCellColor: function(cellX, cellY) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();

    var currentColor = this.editor.currentTile.color;

    if(this.useCells) {
      if(cellY < this.cells.length && cellX < this.cells[cellY].length) {
        currentColor = this.cells[cellY][cellX].fc;
      }

      if(this.editor.getColorPerMode() == 'character') {

        if(cellY < this.cells.length && cellX < this.cells[cellY].length) {
          var tileIndex = this.cells[cellY][cellX].t;
          if(tileIndex < tileCount) {
            currentColor = tileSet.getTileColor(tileIndex);
          }

        }
      }
    } else {
      if(this.editor.getColorPerMode() == 'character') {
        if(cellY < this.characters.length && cellX < this.characters[cellY].length) {

          var tileIndex = this.characters[cellY][cellX];
          if(tileIndex < tileCount) {
            currentColor = tileSet.getTileColor(tileIndex);
          }
        }
      }        
    }

    return currentColor;

  },

  toolStart: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    x = Math.floor(x * this.canvasScale / this.pixelWidth);
    y = Math.floor(y * this.canvasScale / this.pixelHeight);

    this.cursorCharacterX = Math.floor(x /  this.charWidth);
    this.cursorCharacterY = Math.floor(y / this.charHeight);

    var screenMode = this.editor.getScreenMode();
    var currentColor = this.getCellColor(this.cursorCharacterX, this.cursorCharacterY);

    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      if(currentColor < 8 && this.editor.graphic.getType() !== 'sprite') {
        screenMode = TextModeEditor.Mode.TEXTMODE;
      }
    }

    if(x < 0 || x >= this.charWidth * this.charsAcross || y < 0 || y >= this.charHeight * this.charsDown) {
      return;
    }

    var mode = this.mode;
    if(typeof event.altKey != 'undefined' && event.altKey) {
      mode = 'characterEyedropper';
    }

    if(mode == 'characterEdit') {
      if(this.drawCharacter !== false) {
        if(this.useCells) {
          this.cells[this.cursorCharacterY][this.cursorCharacterX].t = this.drawCharacter;
          this.cells[this.cursorCharacterY][this.cursorCharacterX].fc = this.drawFGColor;
          this.cells[this.cursorCharacterY][this.cursorCharacterX].bc = this.drawBGColor;
        } else {
          this.characters[this.cursorCharacterY][this.cursorCharacterX] = this.drawCharacter;
        }
        this.draw();
      }

    } else if(mode == 'characterEyedropper') {
      if(this.useCells) {
        var cell = this.cells[this.cursorCharacterY][this.cursorCharacterX];

        if(this.cellSelected) {
          this.cellSelected(cell);
        }

      } else {
        var character = this.characters[this.cursorCharacterY][this.cursorCharacterX];

        if(this.characterSelected) {
          this.characterSelected(character);
        }
      }
    } else {

      // draw pixel
      if(screenMode == TextModeEditor.Mode.TEXTMODE || screenMode == TextModeEditor.Mode.C64ECM || screenMode == TextModeEditor.Mode.C64STANDARD) {
        if(this.getPixel(x, y)) {
          this.mouseMode = 'erase';
        } else {
          this.mouseMode = 'draw';
        }

        if(this.mouseMode == 'erase') {
          this.editor.history.startEntry('erase char pixels');
          this.erasePixel(x, y, screenMode);
        } else if(this.mouseMode == 'draw') {
          this.editor.history.startEntry('draw char pixels');
          this.drawPixel(x, y, screenMode);
        }
      }

      if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        this.mouseMode = 'draw';
        this.editor.history.startEntry('draw char pixels');

        var pixelX = Math.floor(x / 2);
        var pixelY = y;
        this.drawPixel(pixelX, pixelY, screenMode);
      }

      if(screenMode == TextModeEditor.Mode.NES|| screenMode == TextModeEditor.Mode.INDEXED || screenMode == TextModeEditor.Mode.RGB) {
        this.mouseMode = 'draw';
        var pixelX = x;
        var pixelY = y;
        this.drawPixel(pixelX, pixelY, screenMode);
      }
    }

  },


  toolMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

/*
    x = x - canvasOffset.left;
    y = y - canvasOffset.top;
*/
    x = Math.floor(x * this.canvasScale / this.pixelWidth);
    y = Math.floor(y * this.canvasScale / this.pixelHeight);

    var cursorCharacterX = Math.floor(x / this.charWidth);
    var cursorCharacterY = Math.floor(y / this.charHeight);

    var screenMode = this.editor.getScreenMode();

    var currentColor = this.getCellColor(cursorCharacterX, cursorCharacterY);


    if(screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
      if(currentColor < 8 && this.editor.graphic.getType() !== 'sprite') {
        screenMode = TextModeEditor.Mode.TEXTMODE;
      }
    }

    if(this.useCells) {
      if( x < 0 || y < 0 || cursorCharacterY >= this.cells.length || cursorCharacterX >= this.cells[cursorCharacterY].length) {
        return;
      }
    } else {
      if( x < 0 || y < 0 || cursorCharacterY >= this.characters.length || cursorCharacterX >= this.characters[cursorCharacterY].length) {
        return;
      }

    }


    if(this.cursorCharacterX == cursorCharacterX && this.cursorCharacterY == cursorCharacterY && this.cursorPositionX == x && this.cursorPositionY == y) {
//        return;
    }

    this.cursorCharacterX = cursorCharacterX;
    this.cursorCharacterY = cursorCharacterY;
    this.cursorPositionY = y % this.charHeight;


    this.cursorPositionX = x % this.charWidth;

    if(this.mouseOverCharacter) {
      if(this.useCells) {
        if(this.cursorCharacterY < this.characters.length && this.cursorCharacterX < this.characters[this.cursorCharacterY].length) {
          this.mouseOverCharacter(this.characters[this.cursorCharacterY][this.cursorCharacterX]);
        }
      } else {
        if(this.cursorCharacterY < this.cells.length && this.cursorCharacterX < this.cells[this.cursorCharacterY].length) {
          this.mouseOverCharacter(this.cells[this.cursorCharacterY][this.cursorCharacterX].c);
        }

      }
    }

    if(this.mode == 'characterEdit') {

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        if(this.drawCharacter !== false) {
          if(this.useCells) {
            this.cells[this.cursorCharacterY][this.cursorCharacterX].t = this.drawCharacter;
            this.cells[this.cursorCharacterY][this.cursorCharacterX].fc = this.drawFGColor;
            this.cells[this.cursorCharacterY][this.cursorCharacterX].bc = this.drawBGColor;

          } else {
            this.characters[this.cursorCharacterY][this.cursorCharacterX] = this.drawCharacter;
          }

        }
      }
      this.draw();
    }


    if(this.mode == 'pixelEdit') {

      if(x < 0 || x >= this.charWidth * this.charsAcross || y < 0 || y >= this.charHeight * this.charsDown) {
        this.drawCursor(-1, -1);
        return;
      }

      if(this.mouseMode == 'erase') {
        if(this.setMouseCursor) {
          UI.setCursor('erase');
        }

        if(x != this.lastPixelX || y != this.lastPixelY) {
          this.lastPixelX = x;
          this.lastPixelY = y;
          this.erasePixel(x, y);
        }
      } else if(this.mouseMode == 'draw') {
        if(this.setMouseCursor) {
          UI.setCursor('draw');
        }

        if(screenMode == TextModeEditor.Mode.TEXTMODE || screenMode == TextModeEditor.Mode.C64ECM|| screenMode == TextModeEditor.Mode.C64STANDARD) {

          if(x != this.lastPixelX || y != this.lastPixelY) {
            this.lastPixelX = x;
            this.lastPixelY = y;
            this.drawPixel(x, y, screenMode);
          }
        }

        if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
          x = Math.floor(x / 2);
          this.cursorPositionY = y;
          this.cursorPositionX = x;

          if(x != this.lastPixelX || y != this.lastPixelY) {
            this.lastPixelX = x;
            this.lastPixelY = y;

            this.drawPixel( x, y,  screenMode);
          }


        }

        if(screenMode == TextModeEditor.Mode.NES || screenMode == TextModeEditor.Mode.INDEXED  || screenMode == TextModeEditor.Mode.RGB) {

          if(x != this.lastPixelX || y != this.lastPixelY) {
            this.lastPixelX = x;
            this.lastPixelY = y;
            this.drawPixel(x, y);
          }
        }


      } else {


        if(this.setMouseCursor) {

          if(screenMode === TextModeEditor.Mode.TEXTMODE || screenMode === TextModeEditor.Mode.C64ECM  || screenMode === TextModeEditor.Mode.C64STANDARD) {
            if(this.getPixel(x, y)) {
              UI.setCursor('erase');
            } else {
              UI.setCursor('draw');
            }
          } else {
            UI.setCursor('draw');
          }
        }

        this.cursorPositionY = y % this.charHeight;
        this.cursorPositionX = x % this.charWidth;
        if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
          this.cursorPositionX = Math.floor(x / 2) % (this.charWidth / 2);
        }

        this.draw();

      }
    }
  },


  toolEnd: function(event) {
    if(this.useCells === false && (this.characters.length == 0 || this.characters[0].length == 0)) {
      return;
    }

    if(this.useCells && (this.cells.length == 0 || this.cells[0].length == 0)) {
      return;
    }


    // does the grid need redrawing?
    if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
      // update the whole grid..
      this.editor.graphic.redraw({ allCells: true });
    }

    
    this.editor.history.endEntry();
    this.lastPixelX = -1;
    this.lastPixelY = -1;
    this.mouseMode = false;

  },

  touchStart: function(event) {
    var touches = event.touches;
    if(touches.length == 1) {

      this.buttons = UI.LEFTMOUSEBUTTON;

      this.toolStart(touches[0]);
    }

  },

  touchMove: function(event) {
    var touches = event.touches;


    if(touches.length == 1) {
      this.buttons = UI.LEFTMOUSEBUTTON;
      this.toolMove(touches[0]);
    }

  },

  touchEnd: function(event) {

  },

  mouseDown: function(event) {

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        return;
      }

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        this.leftMouseUp = false;
      }
      this.mouseIsDown = true;
      UI.captureMouse(this);

    }


    if(this.useCells === false && (this.characters.length == 0 || this.characters[0].length == 0)) {
      return;
    }

    if(this.useCells && (this.cells.length == 0 || this.cells[0].length == 0)) {
      return;
    }

    var x = event.clientX;
    var y = event.clientY;

    var characterOffset = $('#' + this.canvasElementId).offset();
    var characterWidth = $('#' + this.canvasElementId).width();
    var characterHeight = $('#' + this.canvasElementId).height();

    if(x > characterOffset.left && x < characterOffset.left + characterWidth 
      && y > characterOffset.top && y < characterOffset.top + characterHeight) {

      this.toolStart(event);


    }

  },

  mouseMove: function(event) {

    if(!UI.isMobile.any()) {
      this.setButtons(event);
    }

    if(this.useCells === false && (this.characters.length == 0 || this.characters[0].length == 0)) {
      return;
    }

    if(this.useCells && (this.cells.length == 0 || this.cells[0].length == 0)) {
      return;
    }


    var x = event.clientX;
    var y = event.clientY;

    var canvasOffset = $('#' + this.canvasElementId).offset();
    var canvasWidth = $('#' + this.canvasElementId).width();
    var canvasHeight = $('#' + this.canvasElementId).height();

    if(x > canvasOffset.left && x < canvasOffset.left + canvasWidth 
      && y > canvasOffset.top && y < canvasOffset.top + canvasHeight) {


      this.toolMove(event);

    } else {
      this.drawCursor(-1, -1);

    }
  },

  mouseUp: function(event) {
    this.toolEnd(event);
  },


  rotatePixels: function(h, v, sMode) {
    var screenMode = sMode;

    if(typeof sMode == 'undefined') {
      screenMode = this.editor.getScreenMode();
    } 



    var temp = [];
    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      temp[y] = [];
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        temp[y][x] = this.getPixel(x, y);
      }
    }

    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      if(v == 0 && h != 0) {
        h *= 2;
      }
    }

    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        var srcX = (x + h + this.charWidth * this.charsAcross) % (this.charWidth * this.charsAcross);
        var srcY = (y + v + this.charHeight * this.charsDown) % (this.charHeight * this.charsDown);

        this.setPixel(x, y, temp[srcY][srcX], false);
      }
    }
    this.updateCharacter();
  },


  rotate: function(h, v) {

    var temp = [];
    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      temp[y] = [];
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        temp[y][x] = this.getPixel(x, y);
      }
    }

    this.editor.history.startEntry('rotate char pixels');

    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        var srcX = y % (this.charWidth * this.charsAcross);
        var srcY = this.charHeight * this.charsDown - 1 - x;

        this.setPixel(x, y, temp[srcY][srcX], false);
      }
    }

    this.editor.history.endEntry();

    this.updateCharacter();

//    this.updateScreenPreview();

  },


  flipH: function(sMode) {
    var temp = [];
    this.editor.history.startEntry('flip h pixels');
    var screenMode = sMode;


    if(typeof sMode == 'undefined') {
      screenMode = this.editor.getScreenMode();
    } 

    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      for(var y = 0; y < this.charHeight * this.charsDown; y++) {
        for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
          temp[x] = this.getPixel(x, y);
        }
        for(var x = 0; x < this.charWidth * this.charsAcross; x += 2) {
          this.setPixel(this.charWidth * this.charsAcross - x - 2, y, temp[x], false);
          this.setPixel(this.charWidth * this.charsAcross - x - 1, y, temp[x + 1], false);
        }
      }
    } else {
      for(var y = 0; y < this.charHeight * this.charsDown; y++) {
        for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
          temp[x] = this.getPixel(x, y);
        }
        for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
          this.setPixel(this.charWidth * this.charsAcross - x - 1, y, temp[x], false);
        }
      }
    }

    this.editor.history.endEntry();
//    this.updateScreenPreview();
    this.updateCharacter();

  },

  flipV: function() {
    var temp = [];

    this.editor.history.startEntry('flip v pixels');

    for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
      for(var y = 0; y < this.charHeight * this.charsDown; y++) {
        temp[y] = this.getPixel(x, y);
      }
      for(var y = 0; y < this.charHeight * this.charsDown; y++) {
        this.setPixel(x , this.charHeight * this.charsDown - y - 1, temp[y], false);
      }
    }

    this.editor.history.endEntry();

//    this.updateScreenPreview();
    this.updateCharacter();

  },

  invert: function() {

    this.editor.history.startEntry('invert pixels');

    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        this.togglePixel(x, y, false);

      }
    }

    this.editor.history.endEntry();

    this.updateCharacter();

//    this.updateScreenPreview();
  },

  copyCharacter: function() {
    this.clipboard = [];

    for(var y = 0; y < this.charHeight; y++) {
      this.clipboard[y] = [];
      for(var x = 0; x < this.charWidth; x++) {
        this.clipboard[y][x] = this.getPixel(x, y);
      }
    }

    this.updateClipboardPreview();

  },

  setupClipboardCanvas: function() {
    if(!this.clipboardCanvas) {
      this.clipboardCanvas = document.getElementById('tileEditorClipboard');
    }
    this.clipboardCanvas.width = this.charWidth * 2;
    this.clipboardCanvas.height = this.charHeight * 2;

    this.clipboardContext = this.clipboardCanvas.getContext("2d");
    this.clipboardImageData = this.clipboardContext.getImageData(0, 0, this.clipboardCanvas.width, this.clipboardCanvas.height);
    
  },

  updateClipboardPreview: function() {
    this.setupClipboardCanvas();

    var scale = 2;

    for(var y = 0; y < this.charHeight * scale; y++) {
      for(var x = 0; x < this.charWidth * scale; x++) {
        var clipboardX = Math.floor(x / scale);
        var clipboardY = Math.floor(y / scale);

        var dstPos = y * this.clipboardImageData.width * 4 + x * 4;        

        if(this.clipboard[clipboardY][clipboardX]) {
          this.clipboardImageData.data[dstPos] = 255;
          this.clipboardImageData.data[dstPos + 1] = 255;
          this.clipboardImageData.data[dstPos + 2] = 255;
          this.clipboardImageData.data[dstPos + 3] = 255;
        } else {
          this.clipboardImageData.data[dstPos] = 0;
          this.clipboardImageData.data[dstPos + 1] = 0;
          this.clipboardImageData.data[dstPos + 2] = 0;
          this.clipboardImageData.data[dstPos + 3] = 0;

        }

      }
    }

    this.clipboardContext.putImageData(this.clipboardImageData, 0, 0);

  },


  pasteCharacter: function () {
    this.editor.history.startEntry('paste char pixels');

    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        this.setPixel(x, y, this.clipboard[y][x], false);
      }
    }

    this.editor.history.endEntry();


    this.updateCharacter();
  },

  clearCharacter: function() {

    this.editor.history.startEntry('clear char pixels');

    for(var y = 0; y < this.charHeight * this.charsDown; y++) {
      for(var x = 0; x < this.charWidth * this.charsAcross; x++) {
        this.setPixel(this.charWidth * this.charsAcross - x - 1, y, 0, false);
      }
    }

    this.editor.history.endEntry();

    this.updateCharacter();
  },


  getPixel: function(x, y) {

    var charX = Math.floor(x / this.charWidth);
    var charY = Math.floor(y / this.charHeight);

    if(charX >= this.charsAcross || charY >= this.charsDown) {
      return false;
    }
    x = x % this.charWidth;
    y = y % this.charHeight;

    var character = 0;

    if(this.useCells) {
      character = this.cells[charY][charX].t;
    } else {
      character = this.characters[charY][charX];
    }

    return this.tileSet.getPixel(character, x, y, this.frame);
  },


  setPixel: function(x, y, set, updateCharacter) {


    if(typeof updateCharacter == 'undefined') {
      updateCharacter = true;
    }

    var charX = Math.floor(x / this.charWidth);
    var charY = Math.floor(y / this.charHeight);

    if(charX >= this.charsAcross || charY >= this.charsDown) {
      return false;
    }

    x = x % this.charWidth;
    y = y % this.charHeight;

    var character = 0;
    if(this.useCells) {
      character = this.cells[charY][charX].t;
    } else {
      character = this.characters[charY][charX];
    }

//    this.tileSet.setPixel(character, x, y, set, updateCharacter, this.frame);

    this.tileSet.setPixel(character, x, y, set, false, this.frame);


    if(updateCharacter) {
      this.updateCharacter(character);
    }
    this.draw();
    return;
  },

  setC64ColorType: function(colorType) {
    this.c64ColorType = colorType;
  },

  setColorIndex: function(colorIndex) {
    this.colorIndex = colorIndex;
  },

  getColorIndex: function() {
    return this.colorIndex;
  },

  updateCharacter: function(character) {
    var c64ECM = false;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid' && layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      c64ECM = true;
    }
    

    if(typeof character == 'undefined') {
      // update all characters
      for(var y = 0; y < this.characters.length; y++) {
        for(var x =0 ; x < this.characters[y].length; x++) {
          if(c64ECM) {
            var ecmGroup = Math.floor(this.characters[y][x] / 256);
            var c = (this.characters[y][x] % 64) + ecmGroup * 256;
            this.tileSet.updateCharacter(c);
            this.tileSet.updateCharacter(c + 64);
            this.tileSet.updateCharacter(c + 128);
            this.tileSet.updateCharacter(c + 192);

          } else {
            this.tileSet.updateCharacter(this.characters[y][x]);
          }
        }
      }
    } else {
      if(c64ECM) {
        var ecmGroup = Math.floor(character / 256);
        character = character % 64 + ecmGroup * 256;
        this.tileSet.updateCharacter(character);
        this.tileSet.updateCharacter(character + 64);
        this.tileSet.updateCharacter(character + 128);
        this.tileSet.updateCharacter(character + 192);
      } else {
        this.tileSet.updateCharacter(character);
      }
    }


    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true });
    this.editor.currentTile.canvasDrawCharacter();

    if(this.editor.tools.drawTools.tool == 'type') {
      this.editor.tools.drawTools.typing.updateTypeCanvas();
    }


  },


  drawPixel: function(x, y, sMode) {
    var screenMode = sMode;

    if(typeof sMode == 'undefined') {
      screenMode = this.editor.getScreenMode();
    } else {

    }

    if(screenMode == TextModeEditor.Mode.TEXTMODE || screenMode == TextModeEditor.Mode.C64ECM  || screenMode == TextModeEditor.Mode.C64STANDARD) {
      this.setPixel(x, y, 1);
    }

    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {

      if(this.editor.graphic.getType() == 'sprite') {
        switch(this.c64ColorType) {
          case 'cell':
            this.setPixel(x * 2, y, 1);
            this.setPixel(x * 2 + 1, y, 0, true);
          break;
          case 'background':
            this.setPixel(x * 2, y, 0);
            this.setPixel(x * 2 + 1, y, 0, true);
          break;
          case 'multi1':
            this.setPixel(x * 2, y, 0);
            this.setPixel(x * 2 + 1, y, 1, true);
          break;
          case 'multi2':
            this.setPixel(x * 2, y, 1);
            this.setPixel(x * 2 + 1, y, 1, true);
          break;
        }
      } else {
        switch(this.c64ColorType) {
          case 'cell':
            this.setPixel(x * 2, y, 1);
            this.setPixel(x * 2 + 1, y, 1, true);
          break;
          case 'background':
            this.setPixel(x * 2, y, 0);
            this.setPixel(x * 2 + 1, y, 0, true);
          break;
          case 'multi1':
            this.setPixel(x * 2, y, 0);
            this.setPixel(x * 2 + 1, y, 1, true);
          break;
          case 'multi2':
            this.setPixel(x * 2, y, 1);
            this.setPixel(x * 2 + 1, y, 0, true);
          break;
        }
      }
    }

    if(screenMode == TextModeEditor.Mode.RGB) {
//      this.colorIndex = 0xffff2211 >>> 0;
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      var colorARGB = colorPalette.getARGB(this.colorIndex);
      this.setPixel(x, y, colorARGB);
    }

    if(screenMode == TextModeEditor.Mode.NES || screenMode == TextModeEditor.Mode.INDEXED ) {    
      this.setPixel(x, y, this.colorIndex);
    }

  },

  togglePixel: function(x, y, updatePreview) {
    if(this.getPixel(x, y) === 1) {
      this.setPixel(x, y, 0, updatePreview);
    } else {
      this.setPixel(x, y, 1, updatePreview);
    }

  },
  erasePixel: function(x, y) {
    this.setPixel(x, y, 0);
  },


  // draw pixel cursor
  drawCursor: function(x, y, cursorCharacterX, cursorCharacterY) {
    if(x != this.cursorPositionX || y != this.cursorPositionY) {
      this.cursorPositionY = y % this.charHeight;
      this.cursorPositionX = x % this.charWidth;
      this.cursorCharacterX = cursorCharacterX;
      this.cursorCharacterY = cursorCharacterY;
      this.draw();
    }
  },


  setupCharacterCanvas: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    // character canvas is the actual size canvas
    var width = charWidth * this.charsAcross;
    var height = charHeight * this.charsDown;


    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid' && layer.getScreenMode() == TextModeEditor.Mode.VECTOR) {
      width = width * this.scale;
      height = height * this.scale;
    }
    
    if(!this.characterCanvas) {
      return;
    }

    if(this.characterCanvas.width < width || this.characterCanvas.height < height || this.characterContext == null) {
      this.characterCanvas.width = width;
      this.characterCanvas.height = height;

      this.characterContext = this.characterCanvas.getContext('2d'); 
    }
  },

  // draw the checkerboard for indexed mode
  setupCheckerboardCanvas: function() {
    if(!this.checkerboardCanvas) {
      this.checkerboardCanvas = document.createElement('canvas');
    }

    if(this.checkerboardContext == null ||
       this.checkerboardCanvas.width != this.canvas.width || this.checkerboardCanvas.height != this.canvas.height) {
        this.checkerboardCanvas.width = this.canvas.width;
        this.checkerboardCanvas.height = this.canvas.height;
        this.checkerboardContext = this.checkerboardCanvas.getContext('2d');

        var checkSize = 5;

        // draw the background image
        this.checkerboardContext.fillStyle = '#cccccc';
        this.checkerboardContext.fillRect(0, 0, this.checkerboardCanvas.width, this.checkerboardCanvas.height); 

        // this is the transparent image..
        var blockSize = 5;
        var blocksAcross = Math.ceil(this.checkerboardCanvas.width / checkSize);
        var blocksDown = Math.ceil(this.checkerboardCanvas.height / checkSize);

        this.checkerboardContext.fillStyle = '#bbbbbb';
        for(var y = 0; y < blocksDown; y++) {
          for(var x = 0; x < blocksAcross; x++) {
            if((x + y) % 2) {
              this.checkerboardContext.fillRect(x * checkSize, y * checkSize, 
                checkSize, checkSize); 
            }
          }
        }
    }
  },


  // used when editing a metatile/block
  drawCharCursor: function() {
    if(this.cursorPositionX < 0 || this.cursorPositionY < 0) {
      return;
    }

    var layer = this.editor.layers.getSelectedLayerObject();

    var charX = this.cursorCharacterX;
    var charY = this.cursorCharacterY;


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    if(this.characterCursorCanvas == null) {
      this.characterCursorCanvas = document.createElement('canvas');
    }
  
    if(this.characterCursorContext == null || this.characterCursorCanvas.width != charWidth || this.characterCursorCanvas.height != charHeight) {
      this.characterCursorCanvas.width = charWidth;
      this.characterCursorCanvas.height = charHeight;
      this.characterCursorContext = this.characterCursorCanvas.getContext('2d');
      this.characterCursorImageData = this.characterCursorContext.getImageData(0, 0, this.characterCursorCanvas.width, this.characterCursorCanvas.height);
    }

    var imageDataLength = this.characterCursorCanvas.width * this.characterCursorCanvas.height * 4;
    var pos = 3;
    while(pos < imageDataLength) {
      this.characterCursorImageData.data[pos] = 0;
      pos += 4;
    }


//    this.characterCursorContext.clearRect(0, 0, this.characterCursorCanvas.width, this.characterCursorCanvas.height);

    var args = {};

    args['imageData'] = this.characterCursorImageData;

    var bgColor = this.editor.currentTile.getBGColor();

//    args['color'] = this.drawFGColor;

    args['color'] = this.getCellColor(charX, charY);

    args['bgColor'] = this.drawBGColor;

    if(this.editor.getColorPerMode() == 'character') {
      args['color'] = tileSet.getTileColor(this.drawCharacter);
      args['bgColor'] = tileSet.getCharacterBGColor(this.drawCharacter);
    }


//console.log('bg colour = ' + args['bgColor']);

    args['character'] = this.drawCharacter;

    args['x'] = 0;
    args['y'] = 0;
    args['scale'] = 1;

    args['select'] = false;
    args['highlight'] = false;
    args['backgroundIsTransparent'] = true;

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      args['bgColor'] = layer.getC64ECMColor(args['bgColor']);
      var ecmGroup = Math.floor(args['character'] / 256);
      args['character'] = (args['character'] % 64) + ecmGroup * 256;
    }        

    if(layer.getScreenMode() === TextModeEditor.Mode.INDEXED) {
      args['transparentColorIndex'] = layer.getTransparentColorIndex();
    }


    if(layer.getScreenMode() == TextModeEditor.Mode.VECTOR) { 
      args['context'] = this.context;
      args['x'] = charX * charWidth;// * this.scale;
      args['y'] = charY * charHeight;// * this.scale;
      args['scale'] = this.scale;
      tileSet.drawCharacter(args);
    

    } else {
      tileSet.drawCharacter(args);

      this.characterCursorContext.putImageData(this.characterCursorImageData, 0, 0);

      var xPos = charX * charWidth * this.scale;
      var yPos = charY * charHeight * this.scale;
      var destWidth = charWidth * this.scale;
      var destHeight = charHeight * this.scale;

      this.context.globalAlpha = 0.5;
      this.context.drawImage(this.characterCursorCanvas, 
              0, 0, charWidth, charHeight,
              xPos, yPos, destWidth, destHeight);
      this.context.globalAlpha = 1;
    }

  },


  drawTileCanvas: function() {
    if(!this.characterContext) {
      return;
    }

    var colorPerMode = this.editor.getColorPerMode();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();

    this.characterContext.clearRect(0, 0, this.characterCanvas.width, this.characterCanvas.height);

    var args = {};
    
    this.characterImageData = this.characterContext.getImageData(0, 0, this.characterCanvas.width, this.characterCanvas.height);

    args['imageData'] = this.characterImageData;
    args['characterFrame'] = this.frame;
    args['backgroundIsTransparent'] = false;

    var color = this.editor.currentTile.getColor();
    if(!this.useCurrentTileColor) {
      currentColor = this.currentColor;
    }


    var bgColor = this.editor.currentTile.getBGColor();

    var screenMode = TextModeEditor.Mode.TEXTMODE;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      screenMode = layer.getScreenMode();
    }

    if(g_app.getMode() == '3d') {

    } else {

      if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        args['bgColorRGB'] = '#ff0000';
        args['backgroundColor'] = layer.getBackgroundColor();
        bgColor = args['bgColor'];
        args['c64Multi1Color'] = layer.getC64Multi1Color();
        args['c64Multi2Color'] = layer.getC64Multi2Color();
      }

      if(screenMode === TextModeEditor.Mode.INDEXED) {
        args['transparentColorIndex'] = layer.getTransparentColorIndex();
        args['backgroundIsTransparent'] = false;

      }
    }

   
    for(var y = 0; y < this.charsDown; y++) {
      for(var x = 0; x < this.charsAcross; x++) {
        var ch = 0;
        var color = this.getCellColor(x, y);

        if(this.useCells) { 

          ch = this.cells[y][x].t;
          args['color'] = color;//this.cells[y][x].fc;
          args['bgColor'] = this.cells[y][x].bc;
        } else {
          ch = this.characters[y][x];
          if(
            this.screenMode == TextModeEditor.Mode.TEXTMODE 
            || this.screenMode == TextModeEditor.Mode.C64STANDARD 
            || this.screenMode == TextModeEditor.Mode.C64ECM
            || (this.screenMode == TextModeEditor.Mode.C64MULTICOLOR && color < 8 && this.editor.graphic.getType() !== 'sprite')
            ) {
            args['colorRGB'] = 0xdddddd;
            args['bgColor'] = this.editor.colorPaletteManager.noColor;
          } else {
            args['color'] = color;
            args['bgColor'] = bgColor;
          }
        }

        if(typeof ch != 'undefined' && ch !== false && ch < tileCount) {

          if(colorPerMode == 'character') {
            var fgColor = tileSet.getTileColor(ch);
            var bgColor = tileSet.getCharacterBGColor(ch);
            args['colorRGB'] = colorPalette.getHex(fgColor);
            args['color'] = fgColor;
            args['bgColor'] = bgColor;
          }



          args['character'] = ch;

          if(screenMode == TextModeEditor.Mode.C64ECM) {

            var ecmBGColor = Math.floor(args['character'] / 64) % 4;
            var ecmGroup = Math.floor(args['character'] / 256);
            args['bgColor'] = layer.getC64ECMColor(ecmBGColor);
            args['character'] = (args['character'] % 64) + ecmGroup * 256;
          }        


          args['x'] = x * this.charWidth;
          args['y'] = y * this.charHeight;
          args['scale'] = 1;

          args['select'] = false;
          args['highlight'] = false;
          if(screenMode == TextModeEditor.Mode.VECTOR) {
            args['scale'] = this.scale;
            args['context'] = this.characterContext;
          }

          tileSet.drawCharacter(args);
        }
      }
    }

    if(screenMode != TextModeEditor.Mode.VECTOR) {
      this.characterContext.putImageData(this.characterImageData, 0, 0);
    }
  },


  drawGrid: function() {

//    this.screenMode = this.editor.getScreenMode();

    var mixedScreenMode = false;
    var colorPerMode = this.editor.getColorPerMode();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();


    if(this.useCells) {
      if(this.cells.length ==0 || this.cells[0].length == 0) {
        return;
      }
      // can have different colour per cell, check if they are all the same
      this.screenMode = this.editor.getScreenMode();
      if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        var screenMode = TextModeEditor.Mode.C64MULTICOLOR;
        if(this.cells[0][0].fc < 8 && this.editor.graphic.getType() !== 'sprite') {
          screenMode = TextModeEditor.Mode.TEXTMODE;
        }

        for(var y = 0; y < this.cells.length; y++) {
          for(var x = 0; x < this.cells[0].length; x++) {
            var color = this.cells[y][x].fc;
            if(colorPerMode == 'character') {
              var charIndex = this.cells[y][x].t;
              color = tileSet.getTileColor(charIndex);
            }

            if(this.editor.graphic.getType() !== 'sprite') {
              if(screenMode == TextModeEditor.Mode.TEXTMODE && color >= 8) {
                screenMode = TextModeEditor.Mode.C64MULTICOLOR;
                mixedScreenMode = true;
              }
              if(screenMode == TextModeEditor.Mode.C64MULTICOLOR && color < 8) {
                screenMode = TextModeEditor.Mode.TEXTMODE;
                mixedScreenMode = true;
              }
            }
          }
        }

        this.screenMode = screenMode;
      }
    } else {
      this.screenMode = this.editor.getScreenMode();
      if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        var screenMode = TextModeEditor.Mode.C64MULTICOLOR;
        var color = this.editor.currentTile.getColor();

        if(colorPerMode == 'character') {
          screenMode = false;
          // need to check each character to see if in mixed or what mode
          for(var y = 0; y < this.characters.length; y++) {
            for(var x = 0; x < this.characters[0].length; x++) {
              var ch = this.characters[y][x];

              if(typeof ch != 'undefined' && ch !== false && ch < tileCount) {
                var color = tileSet.getTileColor(ch);
                if(screenMode === false) {
                  if(color >= 8) {
                    screenMode = TextModeEditor.Mode.C64MULTICOLOR;
                  } else {
                    screenMode = TextModeEditor.Mode.TEXTMODE;
                  }
                } else if(screenMode == TextModeEditor.Mode.TEXTMODE && color >= 8) {
                  screenMode = TextModeEditor.Mode.C64MULTICOLOR;
                  mixedScreenMode = true;
                } else if(screenMode == TextModeEditor.Mode.C64MULTICOLOR && color < 8) {
                  screenMode = TextModeEditor.Mode.TEXTMODE;
                  mixedScreenMode = true;
                }
              }
            }
          }
  
        } else {
          if(color < 8) {
            screenMode = TextModeEditor.Mode.TEXTMODE;
          }
        }
        this.screenMode = screenMode;
      }


    }

  

    var lineHSpacing = 1;
    if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      lineHSpacing = 2;
    }


    if(mixedScreenMode) {
      
      // screen mode per cell

      // draw horizontal lines
      this.context.strokeStyle = styles.textMode.tileEditorGridLines;
      this.context.beginPath();
      for(var i = 0; i <= this.charHeight * this.charsDown; i++) {
        this.context.moveTo(this.offsetX + 0, this.offsetY + i * this.pixelHeight + 0.5);
        this.context.lineTo(this.offsetX + this.charWidth * this.charsAcross * this.pixelWidth, this.offsetY + i * this.pixelHeight + 0.5);
      }


      var screenMode = '';
      if(this.useCells) {
        for(var y = 0; y < this.cells.length; y++) {
          for(var x = 0; x < this.cells[0].length; x++) {
            var cellStartX = this.offsetX + x * this.charWidth * this.pixelWidth;
            var cellStartY = this.offsetY + y * this.charHeight * this.pixelHeight;

            var color = this.cells[y][x].fc;
            if(colorPerMode == 'character') {
              var charIndex = this.cells[y][x].t;
              color = tileSet.getTileColor(charIndex);
            }


            if(color >= 8) {
              screenMode = TextModeEditor.Mode.C64MULTICOLOR;
              lineHSpacing = 2;            
            }
            if(color < 8) {
              screenMode = TextModeEditor.Mode.TEXTMODE;
              lineHSpacing = 1;
            }
            if(this.drawPixelLines) {
              for(var i = 0; i < this.charWidth; i += lineHSpacing) {
                this.context.moveTo(cellStartX + i * this.pixelWidth + 0.5, cellStartY + 0);
                this.context.lineTo(cellStartX + i * this.pixelWidth + 0.5, cellStartY + this.charHeight * this.pixelHeight);
              }
            }
          }
        }
      } else {
        for(var y = 0; y < this.characters.length; y++) {
          for(var x = 0; x < this.characters[0].length; x++) {
            var cellStartX = this.offsetX + x * this.charWidth * this.pixelWidth;
            var cellStartY = this.offsetY + y * this.charHeight * this.pixelHeight;

            var color = tileSet.getTileColor(this.characters[y][x]);

            if(color >= 8) {
              screenMode = TextModeEditor.Mode.C64MULTICOLOR;
              lineHSpacing = 2;            
            }
            if(color < 8) {
              screenMode = TextModeEditor.Mode.TEXTMODE;
              lineHSpacing = 1;
            }

            if(this.drawPixelLines) {
              for(var i = 0; i < this.charWidth; i += lineHSpacing) {
                this.context.moveTo(cellStartX + i * this.pixelWidth + 0.5, cellStartY + 0);
                this.context.lineTo(cellStartX + i * this.pixelWidth + 0.5, cellStartY + this.charHeight * this.pixelHeight);
              }
            }
          }
        }

      }


      this.context.stroke();


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

    } else {

      if(this.drawPixelLines) {
        this.context.strokeStyle = styles.textMode.tileEditorGridLines;
        this.context.beginPath();
        for(var i = 0; i <= this.charWidth * this.charsAcross; i += lineHSpacing) {
          this.context.moveTo(this.offsetX + i * this.pixelWidth +0.5, this.offsetY + 0);
          this.context.lineTo(this.offsetX + i * this.pixelWidth + 0.5, this.offsetY + this.charHeight * this.charsDown * this.pixelHeight);
        }

        for(var i = 0; i <= this.charHeight * this.charsDown; i++) {
          this.context.moveTo(this.offsetX + 0, this.offsetY + i * this.pixelHeight + 0.5);
          this.context.lineTo(this.offsetX + this.charWidth * this.charsAcross * this.pixelWidth, this.offsetY + i * this.pixelHeight + 0.5);
        }
        this.context.stroke();
      }

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
    }
  },

  draw: function() {

    if(!this.characterCanvas || !this.canvas) {
      return;
    }


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }

    this.offsetX = 0;
    this.offsetY = 0;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.charWidth = tileSet.getTileWidth();
    this.charHeight = tileSet.getTileHeight();

    this.screenMode = this.editor.getScreenMode();
    var currentColor = this.editor.currentTile.color;
    if(!this.useCurrentTileColor) {
      currentColor = this.currentColor;
    }

    if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      if(currentColor < 8) {
        this.screenMode = TextModeEditor.Mode.TEXTMODE;
      } 
    }

    if(this.useCells) {
      if(this.cells == null || this.cells.length == 0) {
        return;
      }

      this.charsAcross = this.cells[0].length;
      this.charsDown = this.cells.length;

    } else {
      if(this.characters == null || this.characters.length == 0) {
        return;
      }

      this.charsAcross = this.characters[0].length;
      this.charsDown = this.characters.length;
    }


//    this.context = this.canvas.getContext('2d');

    var layer = this.editor.layers.getSelectedLayerObject();

    this.setupCharacterCanvas();
    // prob dont need to redo this if nothing changed..
    this.drawTileCanvas();

    // draw the characters to the canvas on screen
    var totalCharWidth = this.charWidth * this.charsAcross;
    var totalCharHeight = this.charHeight * this.charsDown;

    var pixelWidth = Math.floor( (this.canvas.width - 1) / totalCharWidth);
    var pixelHeight = Math.floor( (this.canvas.height - 1) / totalCharHeight);

    if(pixelWidth > pixelHeight) {
      pixelWidth = pixelHeight;
    } else {
      pixelHeight = pixelWidth;
    }

    if(pixelWidth < 1 || pixelHeight < 1) {
      pixelWidth = 1;
      pixelHeight = 1;
    }    

    this.pixelWidth = pixelWidth;
    this.pixelHeight = pixelHeight;
    this.scale = pixelWidth;

    var xPos = 0;
    var yPos = 0;
    var destWidth = this.scale * totalCharWidth;
    var destHeight = this.scale * totalCharHeight;


    if(this.screenMode == TextModeEditor.Mode.TEXTMODE || this.screenMode == TextModeEditor.Mode.C64ECM || this.screenMode == TextModeEditor.Mode.C64STANDARD) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else if(this.screenMode == TextModeEditor.Mode.INDEXED || this.screenMode == TextModeEditor.Mode.RGB) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.setupCheckerboardCanvas();
      this.context.drawImage(this.checkerboardCanvas, 0, 0, destWidth, destHeight, 0, 0, destWidth, destHeight);
      // draw checkerboard
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      var backgroundColorIndex = layer.getBackgroundColor();//  this.editor.frames.getBackgroundColor();
      var backgroundColor = colorPalette.getHexString(backgroundColorIndex);
      this.context.fillStyle = '#' + backgroundColor;
      this.context.fillRect(xPos, yPos, destWidth, destHeight); 

    }

    if(this.screenMode == TextModeEditor.Mode.VECTOR) {
      this.context.drawImage(this.characterCanvas, 
        0, 0);
    } else {
      this.context.drawImage(this.characterCanvas, 
              0, 0, totalCharWidth, totalCharHeight,
              xPos, yPos, destWidth, destHeight);
    }


    // draw the cursor

    if(!UI.isMobile.any()) {
      if(this.mode == 'pixelEdit') {
        var cursorX = (this.cursorPositionX + this.cursorCharacterX * this.charWidth) * pixelWidth;
        var cursorY = (this.cursorPositionY + this.cursorCharacterY * this.charHeight) * pixelHeight;

        this.screenMode = this.editor.getScreenMode();
        if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
          if(typeof this.cursorCharacterX != 'undefined' && typeof this.cursorCharacterY != 'undefined') {
            var color = this.getCellColor(this.cursorCharacterX, this.cursorCharacterY);
            if(color < 8) {
              this.screenMode = TextModeEditor.Mode.TEXTMODE;
            }
          }
        }

        if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
          cursorX = (this.cursorPositionX * 2 + this.cursorCharacterX * this.charWidth) * pixelWidth;        
          pixelWidth = pixelWidth * 2;
        }
        var cursorWidth = pixelWidth;
        var cursorHeight = this.pixelHeight;


        if(this.screenMode == TextModeEditor.Mode.RGB) {
          var colorR = (this.colorIndex >>> 16) & 0xff;
          var colorG = (this.colorIndex >>> 8) & 0xff;
          var colorB = (this.colorIndex) & 0xff;
          var colorA = ((this.colorIndex >>> 24) & 0xff) / 255;
          this.context.fillStyle = 'rgba(' + colorR + ',' + colorG + ',' + colorB + ',' + colorA + ')';
          
        } else if(this.screenMode == TextModeEditor.Mode.INDEXED) {
          this.context.fillStyle = '#' + colorPalette.getHexString(this.colorIndex);
        } else if(this.screenMode == TextModeEditor.Mode.C64MULTICOLOR && layer && typeof layer.getC64Multi1Color != 'undefined') {
          var colorIndex =0;
          switch(this.c64ColorType) {
            case 'cell':
              colorIndex = this.editor.currentTile.getColor();
            break;
            case 'background':
              colorIndex = layer.getBackgroundColor();
            break;
            case 'multi1':
              colorIndex = layer.getC64Multi1Color();
            break;
            case 'multi2':
              colorIndex = layer.getC64Multi2Color();
            break;
          }
          this.context.fillStyle = '#' + colorPalette.getHexString(colorIndex);

        } else {

          this.context.fillStyle = '#ffffff';
        }

        this.context.globalAlpha = 0.5;
        this.context.fillRect(this.offsetX + cursorX, this.offsetY + cursorY,
          cursorWidth, cursorHeight);
        this.context.globalAlpha = 1;
      }
    }


    if(this.mode == 'characterEdit') {
      // used in metatile/block mode
      this.drawCharCursor();
    }

    // draw the grid...
    this.drawGrid();

  },


}
