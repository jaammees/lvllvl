var TilePaletteDisplay = function() {
  this.editor = null;

  this.charPaletteMap = [];
  this.charPaletteMapType = false;

  this.charPaletteWidth = 9 * 16;
  this.charPaletteHeight = 9 * 8;
  this.tilePaletteScale = 2;

  this.charPaletteBlockSpacing = 4;
  this.charPaletteSpacing = 1;

  this.charPaletteX = 0;
  this.charPaletteY = 0;
  this.canvas = null;
  this.context = null;


  this.tileCanvas = null;
  this.tileContext = null;


  this.columnWidthMax = false;
  this.columnHeightMax = false;

  this.singleTileCanvas = null;
  this.singleTileContext = null;

  this.mouseDownX = false;
  this.mouseDownY = false;
  this.highlightCharacter = false;

  // if mouse is over palette, location of tile mouse is over, otherwise false
  this.highlightGridX = false;
  this.highlightGridY = false;

  this.mouseDownOnCharacter = false;

  this.charPaletteImageData = null;

  this.canvasScale = 1;
  this.charMargin = 1;

  this.charRecentIndex = 0;

  this.mode = 'grid';
  this.selectMode = 'add';
  this.selectedCharacters = [];
  this.selectedCharactersGrid = [];
  this.selectedGridCells = [];


  this.selectedGridChanged = false;
  this.highlightChanged = false;
  this.charDblClick = false;
  this.characterSelectedCallback = false;
  this.touchCharacterHandler = false;
  this.touchEndCharacterHandler = false;
  this.mouseUpHandler = false;
  this.mouseLeaveHandler = false;

  this.blockStacking = 'horizontal';

  this.tileLocations = [];

  this.resizeCanvas = true;


  this.page = 0;


  this.lastMouseX = 0;
  this.lastMouseY = 0;

  this.scrollX = 0;
  this.scrollY = 0;
  this.xScrollSpeed = 0;
  this.yScrollSpeed = 0;

  this.vScrollBarWidth = styles.ui.scrollbarWidth;
  this.vScrollBarHeight = 0;
  this.vScrollBarPosition = null;
  this.vScrollBarPositionMin = 0;
  this.vScrollBarPositionMax = 0;
  this.vScrollBarPositionMouseOffset = 0;
  this.vScroll = false;

//  this.hScrollBar = null;
  this.hScrollBarHeight = styles.ui.scrollbarWidth;
  this.hScrollBarWidth = 0;
  this.hScrollBarPosition = null;
  this.hScrollBarPositionMin = 0;
  this.hScrollBarPositionMax = 0;
  this.hScrollBarPositionMouseOffset = 0;
  this.hScroll = false;


  this.gridMap = [];

  // can disable draw so its not called repeatedly when loading
  this.drawEnabled = true;


  this.sortDragTile = false;
  // offsets for sort drag image in sort drag mode
  this.sortDragTileX = 0;
  this.sortDragTileY = 0;
  this.sortDragOffsetX = 0;
  this.sortDragOffsetY = 0;


  // display using 'current' colours or 'monochrome'
  this.colors = "current";
}

TilePaletteDisplay.prototype = {
  init: function(editor, args) {
    this.editor = editor;
    this.canvasElementId = args.canvasElementId;    

    this.blockStacking = 'horizontal';

    if(typeof args != 'undefined') {
      if(typeof args.mode != 'undefined') {
        this.mode = args.mode;
      }

      if(typeof args.blockStacking != 'undefined') {
        this.blockStacking = args.blockStacking;
      }

      if(typeof args.charMargin != 'undefined') {
        this.charMargin = args.charMargin;
      }

      if(typeof args.resizeCanvas !== 'undefined') {
        this.resizeCanvas = args.resizeCanvas;
      }

      if(typeof args.colors != 'undefined') {
        this.colors = args.colors;
      }
    }

  },

  on: function(trigger, f) {
    if(trigger == 'selectedgridchanged') {
      this.selectedGridChanged = f;
    }

    if(trigger == 'highlightchanged') {
      this.highlightChanged = f;
    }

    if(trigger == 'dblclick') {
      this.charDblClick = f;
    }

    if(trigger == 'characterselected') {
      this.characterSelectedCallback = f;
    }

    if(trigger == 'charactertouch') {
      this.touchCharacterHandler = f;
    }

    if(trigger == 'charactertouchend') {
      this.touchEndCharacterHandler = f;
    }

    if(trigger == 'mouseup') {
      this.mouseUpHandler = f;
    }

    if(trigger == 'mouseleave') {
      this.mouseLeaveHandler = f;
    }
  },


  getDrawEnabled: function() {
    return this.drawEnabled;
  },


  setDrawEnabled: function(enabled) {
    this.drawEnabled = enabled;
  },

  initEvents: function() {
    var _this = this;

//    this.canvas = document.getElementById(this.canvasElementId);

    this.canvas.addEventListener('dblclick', function(event) {
      _this.tilePaletteDoubleClick(event);
    }, false);


    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('mousemove', function(event) {
      
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseleave', function(event) {
      if(_this.mouseIsDown) {
        UI.captureMouse(_this);
      }
      _this.charPaletteMouseLeave(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);

    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);


    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, false);


    this.canvas.addEventListener('touchstart', function(event) {
      _this.touchStart(event);
    }, false);

    this.canvas.addEventListener('touchmove', function(event) {
      _this.touchMove(event);
    }, false);

    this.canvas.addEventListener('touchend', function(event) {
      _this.touchEnd(event);
    }, false);
  },

  getTileMargin: function() {
    return this.charMargin;
  },


  getCharPaletteMap: function() {
    return this.charPaletteMap;
  },

  getCharPaletteMapType: function() {
    return this.charPaletteMapType;
  },

  setCharPaletteMap: function(charPaletteMap, paletteMapName) {
    if(typeof paletteMapName != 'undefined') {
      this.charPaletteMapType = paletteMapName;
    }
    this.charPaletteMap = [];

    for(var y = 0; y < charPaletteMap.length; y++) {
      this.charPaletteMap[y] = [];
      for(var x = 0; x < charPaletteMap[y].length; x++) {
        this.charPaletteMap[y][x] = charPaletteMap[y][x];
      }
    }

    this.draw({ redrawTiles: true });

  },

  setCharPaletteMapType: function(type) {
    
    if(type == 'similar') {
      type = 'petscii';      
    }

    /*
     might be calling this because a new tileset has been selected
     so want to relayout tiles.. so this has been commented out
    if(this.charPaletteMapType == type) {
      return;
    }
    */

    this.charPaletteMapType = type;

    // init the char palette map
    this.charPaletteMap = [];
    var ch = 0;
    for(var j = 0; j < 16; j++) {
      this.charPaletteMap[j] = [];
      for(var i = 0; i < 16; i++) {
        this.charPaletteMap[j][i] = ch++;
      }
    }

    if(type == 'petsciigraphic') {

        /*
        [112, 64,110, 79,119, 80,108, 98,123,236,226,251,207,247,208,229,101,101,244],
        [ 93, 87, 93,116, 91,106,225,219, 97, 97, 32,225,244, 32,231,244,116, 84,212],
        [109, 64,125, 76,111,122,124,226,126,252, 98,254,204,239,250,245,117, 71,199],

        [ 85, 68, 73, 77,114, 78,240,192,238,213,196,201,205,242,206,225, 97, 66,221],
        [ 71, 81, 72,107, 86,115,221,215,221,199,209,200,235,214,243,118,246, 72,200],
        [ 74, 70, 75, 78,113, 77,237,192,253,202,198,203,206,241,205,106,234, 89,217],

        [100,111,121, 98,248,247,227,160,233,223,92,104,127,255,35,103,231,103,231],
        [228,239,249,226,120,119,99,32,95,105,220,232,102,230,163,96,160,32,160],
        [100, 82, 70, 64, 68,69,119,99,228,239,210,198,195,196,197,247,227,160,32],
        */

      this.charPaletteMap = [
        [ 112, 64,110,  79,119, 80, 108, 98,123,  85, 68, 73,  77,114, 78, 229,101,101,244 ],
        [  93, 87, 93, 116, 91,106, 225, 32, 97,  71, 81, 72, 107, 86,115, 244,116, 84,212 ],
        [ 109, 64,125,  76,111,122, 124,226,126,  74, 70, 75,  78,113, 77, 245,117, 71,199 ],

        [ 240,192,238, 207,247,208, 236,226,251, 213,196,201, 205,242,206, 225, 97, 66,221 ],
        [ 221,215,221, 244,219,231,  97,160,225, 199,209,200, 235,214,243, 118,246, 72,200 ],
        [ 237,192,253, 204,239,250, 252, 98,254, 202,198,203, 206,241,205, 106,234, 89,217 ],

        [ 100,111,121, 98,248,247,227,160,233,223,92,104,102,127,35, 103,231,103,231],
        [ 228,239,249,226,120,119,99,32,95,105,220,232,230,255,163, 96,160, 32,160],

        [ 100, 111, 82, 70, 64, 68,69,119,99,228,239,210,198,195,196,197,247,227,160],


        [33,0,63,38,93,94,90,88,83,65,30,31,32,32,32,32,32,32,-1],
        [49,50,51,52,53,54,55,56,57,48,61,43,45,42,47,37,36,28,35],
        [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
        [20,21,22,23,24,25,26,44,46,59,58,34,39,40,41,27,29,60,62],

        [161,128,191,166,194,222,218,193,216,211,158,159,160,160,160,160,160,160,160],
        [177,178,179,180,181,182,183,184,185,176,189,171,173,170,175,165,164,156,163],
        [129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147],
        [148,149,150,151,152,153,154,172,174,187,186,162,167,168,169,155,157,188,190]
        
      
      /*,[160,160,160,160,234,224,116,67,32,192,32,221,32,32,32,32,32,32,32]
      */];

      this.draw({ redrawTiles: true });
      return;
    }

    if(type == 'petscii' || type == 'similar') {
      this.charPaletteMap = [
            [32,48,49,50,51,52,53,54,55,56,57,61,43,45,42,47],
            [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
            [17,18,19,20,21,22,23,24,25,26,33,63,58,59,44,46],
            [108,123,112,110,79,80,107,114,85,73,81,87,78,77,92,102],
            [124,126,109,125,76,122,113,115,74,75,86,91,95,105,104,127],
            [100,111,121,98,120,119,99,101,116,117,97,118,106,103,28,35],
            [82,70,64,68,69,66,67,84,71,93,72,89,30,31,36,37],
            [90,88,83,65,27,29,40,41,60,62,34,39,94,38,0,96]
      ];

      // fill in the inverted characters
      for(var j = 0; j < 8; j++) {
        this.charPaletteMap[j + 8] = [];
        for(var i = 0; i < 16; i++) {
          this.charPaletteMap[j + 8][i] = this.charPaletteMap[j][i] + 128;
        }
      }
      this.draw({ redrawTiles: true });
      return;

    } 
    
    if(type == 'ascii32x8') {
      for(var j = 0; j < 8; j++) {
        for(var i = 0; i < 16; i++) {
          this.charPaletteMap[j][i] = i + j * 32;
          this.charPaletteMap[j + 8][i] = (i + 16) + j * 32;
        }
      }
      this.draw({ redrawTiles: true });
      return;
    } 


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var map = tileSet.getPaletteMap(type);
    if(map !== false) {
      for(var y = 0; y < map.data.length; y++) {
        this.charPaletteMap[y] = [];
        for(var x = 0; x < map.data[y].length; x++) {
          this.charPaletteMap[y][x] = map.data[y][x];
        }
      }

      this.draw({ redrawTiles: true });
      return;      
    }


    if(type == 'columns') {

      // make the columns palette map
      var tileCount = tileSet.getTileCount();
      var columnWidth = 16;
      var columnHeight = 8;
      var tilesPerColumn = columnWidth * columnHeight;
      var columns = Math.ceil(tileCount / tilesPerColumn);


      for(var column = 0; column < columns; column++) {
        for(var j = 0; j < columnHeight; j++) {
          this.charPaletteMap[j + columnHeight * column] = [];
          for(var i = 0; i < columnWidth; i++) {
            var tileIndex = column * tilesPerColumn + j * columnWidth + i;
            if(tileIndex < tileCount) {
              this.charPaletteMap[j + columnHeight * column][i] = tileIndex;
            } else {
              this.charPaletteMap[j + columnHeight * column][i] = false;
            }

          }
        }
      }

   
    } else {

      // assume 2 columns?
      for(var j = 0; j < 8; j++) {
        for(var i = 0; i < 16; i++) {
          this.charPaletteMap[j][i] = i + j * 16;
          this.charPaletteMap[j + 8][i] = 128 + i  + j * 16;
        }
      }
    }
    this.draw({ redrawTiles: true });
  },  

  setScale: function(scale) {
//    console.error('set tile palette display scale = ' + scale);
    this.tilePaletteScale = scale;
  },

  getScale: function(scale) {
    return this.tilePaletteScale;
  },

  setMode: function(mode) {
    this.mode = mode;
  },

  setColumnWidthMax: function(max) {
    this.columnWidthMax = max;
    if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
      this.columnWidth = this.columnWidthMax;
    }
  },


  setColumnHeightMax: function(max) {
    this.columnHeightMax = max;
    if(this.columnHeightMax !== false && this.columnHeight > this.columnHeightMax) {
      this.columnHeight = this.columnHeightMax;
    }
  },

  getPage: function() {
    return this.page;
  },

  setPage: function(page) {
    var maxPages = this.getMaxPages();
    this.page = page;
  },

  getMaxPages: function() {

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tilesPerPage = this.columns * this.columnHeight * this.columnWidth;

    return Math.ceil(tileSet.getTileCount() / tilesPerPage);

  },

  initCharPalette: function(args) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }

    if(typeof args != 'undefined') {
      if(typeof args.mapType != 'undefined') {
        mapType = args.mapType;
        this.setCharPaletteMapType(args.mapType);
      }
    }

    if(this.charPaletteMapType === false) {
      this.setCharPaletteMapType('columns');
    }

      // 16 chars across, 8 down
    var charPaletteWidth = (tileSet.charWidth + 1) * 16;
    var charPaletteHeight = (tileSet.charHeight + 1) * 8;

    // has the size changed?
    if(this.charPaletteWidth != charPaletteWidth || this.charPaletteHeight != charPaletteHeight || this.charPaletteImageData == null) {
      this.charPaletteWidth = charPaletteWidth;
      this.charPaletteHeight = charPaletteHeight;

//      this.settilePaletteScale(tileSet.charWidth, tileSet.charHeight);

      if(this.canvas == null) {
        this.canvas = document.getElementById(this.canvasElementId);
        this.initEvents();
      }

      if(this.tileCanvas == null) {
        this.tileCanvas = document.createElement('canvas');        
      }

      var canvasWidth = this.charPaletteWidth * 2 * this.tilePaletteScale + this.charPaletteBlockSpacing;
      var canvasHeight = this.charPaletteHeight * this.tilePaletteScale;

      if(this.blockStacking == 'vertical') {
        var canvasWidth = this.charPaletteWidth * this.tilePaletteScale + this.charPaletteBlockSpacing;
        var canvasHeight = this.charPaletteHeight * 2 * this.tilePaletteScale;
  
      }


      this.canvasScale = Math.floor(UI.devicePixelRatio);

      // is the display allowed to resize the canvas?
      if(this.resizeCanvas) {
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';

        this.canvas.width = canvasWidth * this.canvasScale;
        this.canvas.height = canvasHeight * this.canvasScale;
      }
      this.context = this.canvas.getContext("2d");

      if(!g_app.isMobile()) {
        var panelHeight = canvasHeight + 82 + 44 + 12;
        
        if( panelHeight < 360) {
          // only resize panel if it hasn't been shrunk by the user.
          var currentPanelSize = UI('textEditorContent').getPanelSize({ "panel": 'south'});
          
          if(currentPanelSize > 140) {
            UI('textEditorContent').resizeThePanel({panel: 'south', size: panelHeight });
          }
        }
      }
    }
  },

  checkCanvasSize: function() {
    

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    // width and height of a column of tiles.
    var columnPixelWidth = this.columnWidth * (tileWidth) * this.tilePaletteScale + this.columnWidth * this.charMargin;
    var columnPixelHeight = this.columnHeight * (tileHeight) * this.tilePaletteScale + this.columnHeight * this.charMargin;


    var canvasWidth = 10;
    var canvasHeight = 10;

    // how the columns are stacked.
    if(this.blockStacking == 'horizontal') {
      canvasWidth = 1 + this.columns * (columnPixelWidth + this.charPaletteBlockSpacing);
      canvasHeight = 1 + this.columnHeight * (tileHeight + this.charMargin) * this.tilePaletteScale;
    }

    if(this.blockStacking == 'vertical') {
      canvasWidth = 1 + (columnPixelWidth);
      canvasHeight = 1 + this.columns * (columnPixelHeight + this.charPaletteBlockSpacing);
    }

    var scaledCanvasWidth = canvasWidth * this.canvasScale;
    var scaledCanvasHeight = canvasHeight * this.canvasScale;


    if(this.resizeCanvas) {
      if(this.canvas.width !== scaledCanvasWidth || this.canvas.height !== scaledCanvasHeight) {
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';


        this.canvas.width = scaledCanvasWidth;
        this.canvas.height = scaledCanvasHeight
      }
    }
    this.context = this.canvas.getContext("2d");


    if(this.tileCanvas.width != canvasWidth || this.tileCanvas.height != canvasHeight || this.tileContext == null) {
      this.tileCanvas.width = canvasWidth;
      this.tileCanvas.height = canvasHeight;
      this.tileContext = UI.getContextNoSmoothing(this.tileCanvas);
    }
  },


  // set selected works if the map type is source
  setSelected: function(selected) {
    this.selectedCharacters = [];
    for(var i = 0; i < selected.length; i++) {
      if(this.selectedCharacters.indexOf(selected[i]) == -1) {
        this.selectedCharacters.push(selected[i]);
      }
    }
    this.draw();
  },

  // set selectedGridCells if map type is not  source
  // which cells in the map are selected
  setSelectedGridCells: function(selectedGridCells) {
    this.selectedGridCells = [];
    for(var i = 0; i < selectedGridCells.length; i++) {
      this.selectedGridCells.push({
        x: selectedGridCells[i].x,
        y: selectedGridCells[i].y,
        selectedGridX: selectedGridCells[i].selectedGridX,
        selectedGridY: selectedGridCells[i].selectedGridY
      });
    }
  },


  // pass in 2d array of tiles
  // they will be set to be selected in display
  // whether using selectedCharacters or selectedGridCells
  setSelectedGrid: function(characters) {
        
        this.selectedCharacters = [];
        this.selectedCharactersGrid = [];
    
        //this.selectedGridCells = [];
    
        var addToSelectedGridCells = false;
        if(this.selectedGridCells.length == 0) {
          addToSelectedGridCells = true;
        }
    
        for(var y = 0; y < characters.length; y++) {
          this.selectedCharactersGrid.push([]);
          for(var x = 0; x < characters[y].length; x++) {
            this.selectedCharactersGrid[y][x] = characters[y][x];
    
            if(addToSelectedGridCells) {
              // need to find char location in char palette map..
              var mapPosition = this.getMapPosition(characters[y][x]);
              if(mapPosition !== false) {
                this.selectedGridCells.push({
                  x: mapPosition.x,
                  y: mapPosition.y,
                  selectedGridX: x,
                  selectedGridY: y
                });
              }
            }
    
            if(!this.isCharacterSelected(characters[y][x])) {
              this.selectedCharacters.push(characters[y][x]);
            }
    
          }
        }
    
      },


  getSelectedCharacters: function() {
    return this.selectedCharacters;
  },

  getSelectedCharactersGrid: function() {
    return this.selectedCharactersGrid;
  },


  unselectCharacter: function(ch) {
    var index = false;
    for(var i = 0; i < this.selectedCharacters.length; i++) {
      if(this.selectedCharacters[i] === ch) {
        index = i;
        break;
      }
    }

    if(index !== false) {
      this.selectedCharacters.splice(index, 1);
    }
  },

  unselectAll: function() {
    this.selectedCharacters = [];
    this.selectedCharactersGrid = [];
    this.selectedGridCells = [];
  },

  isCharacterSelected: function(ch) {
    for(var i = 0; i < this.selectedCharacters.length; i++) {
      if(this.selectedCharacters[i] === ch) {
        return true;
      }
    }
    return false;
  },


  drawTilePalette: function(args) {

    var colorPaletteManager = this.editor.colorPaletteManager;
    var noTile = this.editor.tileSetManager.noTile;

    if(!this.drawEnabled) {
      return;
    }

    
    if(this.context == null || this.tileContext == null) {
      // create/size the canvas
      this.initCharPalette();
    }

    if(this.context == null) {
      return;
    }


    var screenMode = TextModeEditor.Mode.TEXTMODE;
    var colorPerMode = 'cell';
    var transparentColorIndex = 0;

    var flipH = false;
    var flipV = false;
    var rotateZ = false;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      screenMode = layer.getScreenMode();
      colorPerMode = layer.getColorPerMode();
      transparentColorIndex = layer.getTransparentColorIndex();

      if(layer.getHasTileFlip()) {
        flipH = this.editor.currentTile.flipH;
        flipV = this.editor.currentTile.flipV;
      }
      if(layer.getHasTileRotate()) {
        rotateZ = this.editor.currentTile.rotZ;

      }
    }

    var alteredTiles = false;  

    if(typeof args != 'undefined') {
      if(typeof args.screenMode != 'undefined') {
        screenMode = args.screenMode;
      }

      if(typeof args.tiles != 'undefined') {
        alteredTiles = args.tiles;
      }
    }

    this.columns = 2;
    this.columnWidth = 16;


//    var selectY = false;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var totalCharacterCount = tileSet.getTileCount();

    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();
    
    var tileCount = tileSet.getTileCount();
    var blankTile = tileSet.getBlankTile();



    this.tileLocations = [];
    for(var i = 0; i < tileCount; i++) {
      this.tileLocations.push([]);
    }
//    this.tileLocations.length = tileSet.getTileCount();


    // columns is columns of the charpalette map
    var columns = this.columns;

    if(this.charPaletteMapType == 'columns') {
      this.columnWidth = 16;

      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }

      this.columnHeight = Math.ceil(tileSet.getTileCount() / this.columnWidth);

      if(this.columnHeightMax !== false && this.columnHeight > this.columnHeightMax) {
        this.columnHeight = this.columnHeightMax;
      }

      this.columnHeight = 8;
      var columnCharCount = this.columnWidth * this.columnHeight;

      columns = Math.ceil(totalCharacterCount / columnCharCount);

      
//      columns = 2;
    } else if(this.charPaletteMapType == 'petscii') {
      //alert('p[etscii');
      this.columnWidth = 16;
      this.columnHeight = 8;

      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }
      if(this.columnHeightMax !== false && this.columnHeight > this.columnHeightMax) {
        this.columnHeight = this.columnHeightMax;
      }

      // this layout needs to account for characters after 255

      var columnCharCount = this.columnWidth * this.columnHeight;
      columns = Math.ceil(totalCharacterCount / columnCharCount);

    } else if(this.charPaletteMapType == 'source') {
      columns = 1;
      this.columnWidth = 32;
      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }

      this.columnHeight = Math.ceil(tileSet.getTileCount() / this.columnWidth);

      if(this.columnHeightMax !== false && this.columnHeight > this.columnHeightMax) {
        this.columnHeight = this.columnHeightMax;
      }
    } else if(this.charPaletteMapType == 'custom') {
      columns = 1;
      this.columnWidth = this.charPaletteMap[0].length;
      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }
      this.columnHeight = 8;

      var totalMapSlots = this.columnWidth * this.charPaletteMap.length;
      var tilesPerColumn = this.columnWidth  * this.columnHeight;// 8 * 16;
      columns = Math.ceil(totalMapSlots / tilesPerColumn);

    } else if(this.charPaletteMapType == 'petsciigraphic') {
      columns = 1;
      this.columnWidth = this.charPaletteMap[0].length;
      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }

      this.columnHeight = 9;

      var totalMapSlots = this.columnWidth * this.charPaletteMap.length;
      var tilesPerColumn = this.columnWidth * this.columnHeight;// 8 * 16;
      columns = Math.ceil(totalMapSlots / tilesPerColumn);

      

    } else {
      columns = 1;
      this.columnWidth = this.charPaletteMap[0].length;
      if(this.columnWidthMax !== false && this.columnWidth > this.columnWidthMax) {
        this.columnWidth = this.columnWidthMax;
      }

      this.columnHeight = Math.ceil(this.charPaletteMap.length / this.columns);
      if(this.columnHeightMax !== false && this.columnHeight > this.columnHeightMax) {
        this.columnHeight = this.columnHeightMax;
      }
    }


    this.columns = columns;

    // should work out if the canvas is big enough??
    this.checkCanvasSize();

    if(alteredTiles === false) {
      // redrawing everything
      this.tileContext.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);    
      this.gridMapClear();
    }


    if(this.singleTileCanvas == null) {
      this.singleTileCanvas = document.createElement('canvas');
    }


    this.singleTileScale = 1;
    if(tileSet.getType() == 'vector') {
      this.singleTileScale = this.tilePaletteScale;
    }
    if(this.singleTileCanvas.width != tileWidth * this.singleTileScale || this.singleTileCanvas.height != tileHeight * this.singleTileScale || this.singleTileContext == null) {
      this.singleTileCanvas.width = tileWidth * this.singleTileScale;
      this.singleTileCanvas.height = tileHeight * this.singleTileScale;
      this.singleTileContext = this.singleTileCanvas.getContext('2d');
      this.singleTileImageData = this.singleTileContext.getImageData(0, 0, tileWidth * this.singleTileScale, tileHeight * this.singleTileScale);
    }


    if(alteredTiles === false || this.tilePaletteImageData == null) {
      this.tilePaletteImageData = this.tileContext.getImageData(0, 0, this.tileCanvas.width, this.tileCanvas.height);
    } 

    var colorPalette = colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }


    var fgColor = this.editor.currentTile.getColor();
    var bgColor = this.editor.currentTile.getBGColor();

    var args = {};
    args['screenMode'] = screenMode;//layer.getScreenMode();
    args['transparentColorIndex'] = transparentColorIndex;
    args['imageData'] = this.tilePaletteImageData;//tileImageData;
    args['colorRGB']  = ColorUtils.hexStringToInt(styles.textMode.tilePaletteFg);//0xffffff;

    if(this.colors == 'monochrome') {
      args['bgColorRGB'] = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;
    } else {
      if(bgColor != colorPaletteManager.noColor) {
        args['bgColorRGB'] = colorPalette.getHex(bgColor);
      } else {
        var frameBGColor = this.editor.graphic.getBackgroundColor();
        if(frameBGColor != -1) {
          args['bgColorRGB'] = colorPalette.getHex(frameBGColor);
        } else {
          args['bgColorRGB'] = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;
        }
      }
    }
    

    if(this.colors == 'monochrome') {
      args['colorRGB']  = ColorUtils.hexStringToInt(styles.textMode.tilePaletteFg);//0xffffff;
    } else {
      args['colorRGB'] =  colorPalette.getHex(fgColor);
    }
    var defaultBgColorRGB = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;

    if(screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
      args['bgColorRGB'] = '#ff0000';

      args['backgroundColor'] = layer.getBackgroundColor();
      args['c64Multi1Color'] = layer.getC64Multi1Color();
      args['c64Multi2Color'] = layer.getC64Multi2Color();      
    }

    // tile dimensions used for the tile coordinates map
    var drawTileWidth = Math.ceil(tileWidth * this.tilePaletteScale);
    var drawTileHeight = Math.ceil(tileHeight * this.tilePaletteScale);


    var tilesPerPage = this.columnWidth * this.columnHeight;
    var firstTile = tilesPerPage * this.page;

    var charPaletteMapX = false;
    var charPaletteMapY = false;


    for(var column = 0; column < this.columns; column++) {
      var columnCharCount = this.columnWidth * this.columnHeight;

      for(var i = 0; i < columnCharCount; i++) {
        var x = (i % this.columnWidth);
        var y = Math.floor(i / this.columnWidth);

        var srcY = y + column * this.columnHeight;
        var ch = firstTile + i + column * this.columnWidth * this.columnHeight;

//        if(this.charPaletteMapType != 'columns' && this.charPaletteMapType != 'source') {
        if(this.charPaletteMapType != 'source') {  
          if(srcY < this.charPaletteMap.length && x < this.charPaletteMap[srcY].length) {
            charPaletteMapX = x;
            charPaletteMapY = srcY;
            ch = this.charPaletteMap[charPaletteMapY][charPaletteMapX];
          } else {
            // dont want to display it
            ch = totalCharacterCount + 1;
            
            break;
          }
        }


        if(ch < totalCharacterCount && ch !== false) {

          if(ch === noTile || ch === false) {
            ch = blankTile;
          }

          var drawTile = true;
          if(alteredTiles !== false) {
            drawTile = alteredTiles.indexOf(ch) !== -1;
          }


          args['character'] = ch;
          if(screenMode === TextModeEditor.Mode.C64ECM) {
            var ecmBGColor = Math.floor(args['character'] / 64) % 4;
            var ecmGroup = Math.floor(args['character'] / 256);
            args['bgColorRGB'] = colorPalette.getHex(layer.getC64ECMColor(ecmBGColor));
            args['character'] = (args['character'] % 64) + ecmGroup * 256;

          }


          if(colorPerMode == 'character') {
            var fgColor = tileSet.getTileColor(ch);
            var bgColor = tileSet.getCharacterBGColor(ch);

            args['colorRGB'] = colorPalette.getHex(fgColor);
            args['color'] = fgColor;

            if(!layer || screenMode != TextModeEditor.Mode.C64ECM) {
              if(bgColor != colorPaletteManager.noColor) {
                args['bgColorRGB'] = colorPalette.getHex(bgColor);
              } else {
                args['bgColorRGB'] = defaultBgColorRGB;
              }
            }
          }

          var drawAtX = 0;
          var drawAtY = 0;
          if(this.blockStacking == 'horizontal') {
            drawAtX = 1 + this.charPaletteBlockSpacing * column + this.charMargin * (x + column * this.columnWidth)
                      + (x + column * this.columnWidth) * (tileWidth) * this.tilePaletteScale;
            drawAtY = 1 + this.charMargin * y + y * tileHeight  * this.tilePaletteScale;

          }

          if(this.blockStacking == 'vertical') {
           drawAtX = 1 + x * this.charMargin + x * tileWidth * this.tilePaletteScale;          
           drawAtY = 1 + this.charPaletteBlockSpacing * column + this.charMargin * (y  + column * this.columnHeight)
                       + (y + column * this.columnHeight) * (tileHeight) * this.tilePaletteScale;
         }

         drawAtX = Math.ceil(drawAtX);
         drawAtY = Math.ceil(drawAtY);

         if(ch !== false && ch >= 0) {
            this.tileLocations[ch].push({
                x: drawAtX * this.canvasScale,
                y: drawAtY * this.canvasScale
            });
          }
         /*
          this.tileLocations[ch] = {
            x: drawAtX * this.canvasScale,
            y: drawAtY * this.canvasScale
          };
          */

          if(alteredTiles === false) {
            if(this.charMargin > 1) { 
              this.gridMapAdd(drawAtX - this.charMargin / 2, drawAtY - this.charMargin / 2, 
                              drawTileWidth + this.charMargin, drawTileHeight + this.charMargin, 
                              ch, charPaletteMapX, charPaletteMapY);
            } else {
              this.gridMapAdd(drawAtX, drawAtY, drawTileWidth, drawTileHeight, 
                ch, charPaletteMapX, charPaletteMapY);
            }
          }
          if(tileSet.getType() == 'vector') {

            var context = this.tileContext;

            // clear the background
            if(bgColor != this.editor.colorPaletteManager.noColor) {

              if(this.colors == 'monochrome') {
                context.fillStyle = styles.textMode.tilePaletteBg;
              } else {               
                context.fillStyle =  '#' + colorPalette.getHexString(bgColor);// '#eeeeee';
              }
            } else {
              if(this.colors == 'monochrome') {
                context.fillStyle = styles.textMode.tilePaletteBg;
              } else {               
                if(frameBGColor != -1) {
                  context.fillStyle =  '#' + colorPalette.getHexString(frameBGColor);
                } else {
                  context.fillStyle = styles.textMode.tilePaletteBg;

                }
              }
            }
            context.fillRect(drawAtX, drawAtY, drawTileWidth, drawTileHeight);

            
            var path = tileSet.getGlyphPath(ch);
            if(path) {
            
              var cellSize = drawTileWidth;
              var fontScale = tileSet.getFontScale();

              var scale = cellSize * tileSet.getFontScale();
              //var ascent = tileSet.getFontAscent() * scale;
              var ascent = tileSet.getFontAscent() ;

              if(this.colors == 'monochrome') {
                context.fillStyle = styles.textMode.tilePaletteFg;
              } else {                   
                context.fillStyle = '#' + colorPalette.getHexString(fgColor);//'#000000';    //  
              }
              context.strokeStyle = context.fillStyle;

              context.setTransform(scale,0,0,-scale, drawAtX, drawAtY + ascent * scale);

//              context.setTransform(scale,0,0,-scale, drawAtX, drawAtY + ascent);
              if(flipH) {
                context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
                context.scale(-1,1);
                context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
              }
  
              if(flipV) {
                context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
                context.scale(1,-1);
                context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
              }            
  
              if(rotateZ != 0) {
                context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );
                context.rotate(rotateZ * 90 * Math.PI / 180);            
                context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
              }
  
              context.fill(path);
              context.setTransform(1,0,0,1,0,0);              
            }



          } else {
            args['flipH'] = flipH;
            args['flipV'] = flipV;
            args['rotZ'] = rotateZ;
            args['x'] = drawAtX;
            args['y'] = drawAtY;
            args['scale'] = this.tilePaletteScale ;//* this.canvasScale;


            if(drawTile) {
              tileSet.drawCharacter(args);
            }

            if(this.selectedCharacters.length > 0 && ch == this.selectedCharacters[0]) {
              args['x'] = 0;
              args['y'] = 0;
              args['scale'] = 1;
              args['imageData'] = this.singleTileImageData;
              tileSet.drawCharacter(args);
              this.singleTileContext.putImageData(this.singleTileImageData, 0, 0);
              args['imageData'] = this.tilePaletteImageData;            
            }
          }


        }
      }
    }

    if(tileSet.getType() != 'vector') {
      this.tileContext.putImageData(this.tilePaletteImageData, 0, 0);
    }

    if(tileSet.getType() == 'vector' && this.selectedCharacters.length > 0) {
      args['character'] = this.selectedCharacters[0];
      args['x'] = 0;
      args['y'] = 0;
      args['scale'] = this.singleTileScale;
      args['context'] = this.singleTileContext;
      tileSet.drawCharacter(args);

    }
  },

  setXScroll: function(scrollX) {
    var viewWidth = this.viewWidth;
    if(scrollX + viewWidth > this.contentWidth) {
      scrollX = this.contentWidth - viewWidth;
    }

    if(scrollX < 0) {
      scrollX = 0;
    }

    this.scrollX = scrollX;

    this.draw();

  },

  scrollToX: function(x) {
    this.setXScroll(x);

  },

  scrollToY: function(y) {
    this.setYScroll(y);
  },

  setYScroll: function(scrollY) {

    var viewHeight = this.viewHeight;

    if(scrollY + viewHeight > this.contentHeight) {
      scrollY = this.contentHeight - viewHeight;
    }

    if(scrollY < 0) {
      scrollY = 0;
    }

    this.scrollY = scrollY;
    this.draw();

  },  



  calculateScroll: function() {
    this.resize();

    this.viewWidth = this.width;// - this.vScrollBarWidth;
    this.viewHeight = this.height;// - this.hScrollBarHeight;

    // check if need vertical scroll
    if(this.contentHeight <= this.viewHeight) {
      // vertical scroll not needed
      this.vScrollBarWidth = 0;      
    } else {
      this.vScrollBarWidth = styles.ui.scrollbarWidth;
      this.viewWidth = this.width - this.vScrollBarWidth;
    }

    if(this.contentWidth <= this.viewWidth) {
      this.hScrollBarHeight = 0;
    } else {
      this.hScrollBarHeight = styles.ui.scrollbarWidth;
      this.viewHeight = this.height - this.hScrollBarHeight;

      // is vertical scroll now needed?
      if(this.vScrollBarWidth === 0 && this.contentHeight > this.viewHeight) {
        this.vScrollBarWidth = styles.ui.scrollbarWidth;
        this.viewWidth = this.width - this.vScrollBarWidth;  
      }
    }



    if(this.scrollY + this.viewHeight > this.contentHeight) {
      this.scrollY = this.contentHeight - this.viewHeight;
      if(this.scrollY < 0) {
        this.scrollY = 0;
      }
    }

    if(this.viewWidth + this.scrollX > this.contentWidth) {
      this.scrollX = this.contentWidth - this.viewWidth;
      if(this.scrollX < 0) {
        this.scrollX = 0;
      }
    }
  

    this.vScrollBarHeight = this.viewHeight;

    this.vScrollBarPositionHeight = this.vScrollBarHeight  * this.viewHeight / (this.contentHeight);
    if(this.vScrollBarPositionHeight > this.vScrollBarHeight) {
      this.vScrollBarPositionHeight = this.vScrollBarHeight;
    }

//    this.vScrollBarPosition = this.vScrollBarHeight - this.vScrollBarPositionHeight - Math.round(this.scrollY) * this.vScrollBarHeight / (this.contentHeight);

//    this.vScrollBarPosition = this.vScrollBarPositionHeight - Math.round(this.scrollY) * this.vScrollBarHeight / (this.contentHeight);
    this.vScrollBarPosition = (this.scrollY) * this.vScrollBarHeight / (this.contentHeight);

    this.hScrollBarWidth = this.viewWidth;
    this.hScrollBarPositionWidth = this.hScrollBarWidth  * this.viewWidth / (this.contentWidth);
    if(this.hScrollBarPositionWidth > this.hScrollBarWidth) {
      this.hScrollBarPositionWidth = this.hScrollBarWidth;
    }

    this.hScrollBarPosition = (this.scrollX) * this.hScrollBarWidth / (this.contentWidth);

  },


  resize: function() {
    this.width = this.canvas.width / UI.devicePixelRatio;
    this.height = this.canvas.height / UI.devicePixelRatio;
    this.viewWidth = this.width - this.vScrollBarWidth;
    this.viewHeight = this.height - this.hScrollBarHeight;

    this.contentWidth = this.tileCanvas.width;
    this.contentHeight = this.tileCanvas.height;
  },  

  draw: function(args) {    
    var highlightedChars = [];
    var selectedChars = [];

    // does the tile palette need redrawing?
    if(typeof args !== 'undefined' && typeof args.redrawTiles != 'undefined' && args.redrawTiles !== false) {
      this.drawTilePalette(args);
    }

    if(this.canvas == null) {
      return;
    }

    this.context = UI.getContextNoSmoothing(this.canvas);
    if(this.context == null) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    this.calculateScroll();
  /*

  this.gridmap is 1d array  of
    var entry = {
      y: y,
      height: height,
      value: value,
      mapX: mapX,
      mapY: mapY
    }  

  */
    if(this.selectedGridCells.length == 0) {        
      // if selected grid cells is empty, then use the selected characters instead

      if(typeof this.tileLocations != 'undefined') {
        for(var i = 0; i < this.selectedCharacters.length; i++) {
          var selectedTileIndex = this.selectedCharacters[i];
          

          if(selectedTileIndex >= 0 && selectedTileIndex < this.tileLocations.length) {
            for(var j = 0; j < this.tileLocations[selectedTileIndex].length; j++)
            selectedChars.push(this.tileLocations[selectedTileIndex][j]);
          }
        }
      }

      

    }

    if( this.highlightGridX !== false && this.highlightGridY !== false) {

    } else if(this.highlightCharacter !== false) {
      if(typeof this.tileLocations != 'undefined') {
        if(this.highlightCharacter >= 0 && this.highlightCharacter < this.tileLocations.length) {
          var tileLocations = this.tileLocations[this.highlightCharacter];
          // might be in more than one place
          for(var i = 0; i < tileLocations.length; i++) {
            highlightedChars.push(tileLocations[i]);
          }

        }
      }
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    var srcX = Math.round(this.scrollX);
    var srcY = Math.round(this.scrollY);//this.contentHeight - this.viewHeight - Math.round(this.scrollY);
    var srcWidth = this.viewWidth;
    var srcHeight = this.viewHeight;

    var dstX = 0;
    var dstY = 0;
    var dstWidth = this.viewWidth * UI.devicePixelRatio;
    var dstHeight = this.viewHeight * UI.devicePixelRatio;


    this.context.drawImage(this.tileCanvas, srcX, srcY, srcWidth, srcHeight, 
                            dstX, dstY, dstWidth, dstHeight);


    this.context.fillStyle = styles.tilePalette.highlightOutline;
    this.context.strokeStyle = styles.tilePalette.highlightOutline;

    this.context.beginPath();
    this.context.lineWidth = 2;

    var charWidth = (tileSet.getTileWidth() * this.tilePaletteScale + 1) * this.canvasScale;
    var charHeight = (tileSet.getTileHeight() * this.tilePaletteScale + 1) * this.canvasScale; 


    if( this.highlightGridX !== false && this.highlightGridY !== false) {
      // if mouse is causing the highlight, will go in here
      this.context.rect(
        this.highlightGridPixelX * UI.devicePixelRatio - this.scrollX * UI.devicePixelRatio - 1 + this.charMargin / 2, 
        this.highlightGridPixelY * UI.devicePixelRatio - this.scrollY * UI.devicePixelRatio - 1 + this.charMargin / 2, 
        charWidth, charHeight);
    } else {
      for(var i = 0; i < highlightedChars.length; i++) {
        this.context.rect(highlightedChars[i].x - this.scrollX * UI.devicePixelRatio - 1, 
          highlightedChars[i].y  - this.scrollY * UI.devicePixelRatio - 1, charWidth, charHeight);
    
      }
    }

    this.context.stroke();



    this.context.fillStyle = styles.tilePalette.selectOutline;
    this.context.strokeStyle = styles.tilePalette.selectOutline;

    this.context.beginPath();
    this.context.lineWidth = 2;
    var tileWidth = tileSet.getTileWidth();// (tileSet.getTileWidth() * this.tilePaletteScale + 1) * this.canvasScale;
    var tileHeight = tileSet.getTileWidth(); //(tileSet.getTileHeight() * this.tilePaletteScale + 1) * this.canvasScale; 
    var cellWidth = ( (tileSet.getTileWidth() + 5) * this.tilePaletteScale + 1) * this.canvasScale;
    var cellHeight = ( (tileSet.getTileHeight() + 5) * this.tilePaletteScale + 1) * this.canvasScale;
    if(this.selectedGridCells.length == 0) {
      for(var i = 0; i < selectedChars.length; i++) {
        if(typeof selectedChars[i] != 'undefined') {
          this.context.rect(
            (selectedChars[i].x - this.scrollX * UI.devicePixelRatio - 1),//  * UI.devicePixelRatio,
            (selectedChars[i].y - this.scrollY * UI.devicePixelRatio - 1),//  * UI.devicePixelRatio, 
            tileWidth * this.tilePaletteScale  * UI.devicePixelRatio, 
            tileHeight * this.tilePaletteScale  * UI.devicePixelRatio);
        }
      }
    } else {
        
      for(var i = 0; i < this.selectedGridCells.length; i++) {
        var gridCellX = this.selectedGridCells[i].x;
        var gridCellY = this.selectedGridCells[i].y;

        var rectX = 0;
        var rectY = 0;
      
        var columnOffset = 0;
        var columnVOffset = 0;
//        if(gridCellY >= this.columnHeight) {
          if(this.blockStacking == 'horizontal') {
            var column = Math.floor(gridCellY / this.columnHeight);
            gridCellY = gridCellY % this.columnHeight;

            rectX = 1 + this.charPaletteBlockSpacing * column + this.charMargin * (gridCellX + column * this.columnWidth)
                      + (gridCellX + column * this.columnWidth) * (tileWidth) * this.tilePaletteScale;
            rectY = 1 + this.charMargin * gridCellY + gridCellY * tileHeight  * this.tilePaletteScale;

//            var columnPixelWidth = this.charPaletteBlockSpacing * UI.devicePixelRatio + this.columnWidth * (cellWidth);// + this.columnWidth * this.charMargin;
//            columnOffset = column * columnPixelWidth;
          } 

          if(this.blockStacking == 'vertical') {
            var column = Math.floor(gridCellY / this.columnHeight);
            gridCellY = gridCellY % this.columnHeight;


            rectX = 1 + gridCellX * this.charMargin + gridCellX * tileWidth * this.tilePaletteScale;          
            rectY = 1 + this.charPaletteBlockSpacing * column + this.charMargin * (gridCellY  + column * this.columnHeight)
                        + (gridCellY + column * this.columnHeight) * (tileHeight) * this.tilePaletteScale;

          }
  //      }
  


        this.context.rect(
          rectX * UI.devicePixelRatio - this.scrollX * UI.devicePixelRatio , 
          rectY * UI.devicePixelRatio - this.scrollY * UI.devicePixelRatio , 
          tileWidth * this.tilePaletteScale * UI.devicePixelRatio, 
          tileHeight * this.tilePaletteScale * UI.devicePixelRatio);
      }
    }

    this.context.stroke();


    // if dragging a tile in sort mode, draw that
    if(this.mode == 'sort') {
//      this.context.drawImage(this.tileCanvas, srcX, srcY, srcWidth, srcHeight, 
//        dstX, dstY, dstWidth, dstHeight);


      if(this.sortDragTile) {
        var tileWidth = tileSet.getTileWidth();
        var tileHeight = tileSet.getTileHeight();
        var destTileWidth = tileWidth * this.tilePaletteScale * UI.devicePixelRatio;
        var destTileHeight = tileHeight * this.tilePaletteScale * UI.devicePixelRatio;
        var destTileX = (this.sortDragTileX - this.mouseDownOnGridPosition.offsetX) * UI.devicePixelRatio;
        var destTileY = (this.sortDragTileY - this.mouseDownOnGridPosition.offsetY) * UI.devicePixelRatio;
  
        this.context.drawImage(this.singleTileCanvas, 0, 0, tileWidth * this.singleTileScale, tileHeight * this.singleTileScale, 
          destTileX, destTileY, destTileWidth, destTileHeight);
      }
    }

    // draw the scroll



    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';

    if(this.hScrollBarHeight > 0) {
      // horizontal scroll
      this.context.fillRect(0, (this.height - this.hScrollBarHeight) * UI.devicePixelRatio, 
              this.viewWidth * UI.devicePixelRatio, this.hScrollBarHeight * UI.devicePixelRatio);
      this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';

      this.context.fillRect(this.hScrollBarPosition * UI.devicePixelRatio, 
              (this.height - this.hScrollBarHeight + 1) * UI.devicePixelRatio, this.hScrollBarPositionWidth * UI.devicePixelRatio, 
              (this.hScrollBarHeight - 2) * UI.devicePixelRatio);
    }


    // vertical scroll
    if(this.vScrollBarWidth > 0) {
      this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';
      this.context.fillRect( (this.width - this.vScrollBarWidth) * UI.devicePixelRatio, 0, 
                              this.vScrollBarWidth * UI.devicePixelRatio, this.viewHeight * UI.devicePixelRatio);
      this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';
      this.context.fillRect( (this.width - this.vScrollBarWidth + 1) * UI.devicePixelRatio, 
                              this.vScrollBarPosition * UI.devicePixelRatio, 
                             (this.vScrollBarWidth - 2) * UI.devicePixelRatio, this.vScrollBarPositionHeight * UI.devicePixelRatio);
    }


  },


   
  moveSelection: function(dx, dy) {


    var characters = this.selectedCharactersGrid;

    if(this.mode != 'grid' || this.charPaletteMapType == 'source') {
      characters = [this.selectedCharacters];      
    }

    // save the selected characters if need to cancel the selection move
    var selectedCharactersSave = [];
    for(var i = 0; i < this.selectedCharacters.length; i++) {
      selectedCharactersSave.push(this.selectedCharacters[i]);      
    }

    var newCharacters = [];
    this.selectedCharacters = [];

//    var charPaletteMapWidth = 16;

    var newSelectedCells = [];



    if(this.selectedGridCells.length > 0) {
      for(var i = 0; i < this.selectedGridCells.length; i++) {
        var x = this.selectedGridCells[i].x;
        var y = this.selectedGridCells[i].y;
        var selectedGridX = this.selectedGridCells[i].selectedGridX;
        var selectedGridY = this.selectedGridCells[i].selectedGridY;

        x += dx;
        y += dy;

        if(y < 0 || y >= this.charPaletteMap.length) {
          return;
        }
        

        if(x >= this.charPaletteMap[y].length) {
          // gone past right edge of column
          
          x -= this.charPaletteMap[y].length;
          y += this.columnHeight;
          if(y >= this.charPaletteMap.length) {
            return;
          }
        }

        if(x < 0) {
          // gone past left edge of column
          x += this.charPaletteMap[y].length;
          y -= this.columnHeight;
          if(y < 0) {
            return;
          }
        }

        if(y >= this.charPaletteMap.length || y < 0 || x >= this.charPaletteMap[y].length  || x < 0) {
          return;
        }

        var newSelectedCharacter = this.charPaletteMap[y][x];

        if(newSelectedCharacter === false || newSelectedCharacter < 0) {
          return;
        }


        // make sure newCharacters is big enough
        while(newCharacters.length <= selectedGridY) {
          var chars = [];
          while(chars.length <= selectedGridX) {
            chars.push(-1);
          }
          newCharacters.push(chars);
        }
        newCharacters[selectedGridY][selectedGridX] = newSelectedCharacter;
        this.selectedCharacters.push(newSelectedCharacter);

        // x and y in char map, plus x and y in the selected char grid
        newSelectedCells.push({
          x: x,
          y: y,
          selectedGridX: selectedGridX,
          selectedGridY: selectedGridY
        });
      }

      this.selectedGridCells = newSelectedCells;

    } else {

      if(this.charPaletteMapType == 'source') {
        var tileSet = this.editor.tileSetManager.getCurrentTileSet();
        var totalCharacterCount = tileSet.getTileCount();
    
        for(var j = 0; j < characters.length; j++) {
          newCharacters.push([]);
          for(var i = 0; i < characters[j].length; i++) {
            var t = characters[j][i];
            t += dx;
            t += dy * this.columnWidth;

            if(t >= 0 && t < totalCharacterCount) {
              if(!this.isCharacterSelected(t)) {
                this.selectedCharacters.push(t);
              }
              newCharacters[j].push(t);
            } else {
              // want to restore selected characters
              this.selectedCharacters = [];
              for(var i = 0; i < selectedCharactersSave.length; i++) {                        
                this.selectedCharacters.push(selectedCharactersSave[i]);
              }              
              return;
            }

          }
        }
    
      } else {
        var charPaletteMapHeight = this.charPaletteMap.length;

        for(var j = 0; j < characters.length; j++) {
          newCharacters.push([]);
          for(var i = 0; i < characters[j].length; i++) {
            var character = characters[j][i];
            for(var y = 0; y < charPaletteMapHeight; y++) {
              for(var x = 0; x < this.charPaletteMap[y].length; x++) {
                if(this.charPaletteMap[y][x] == character) {
                  var charPaletteMapWidth = this.charPaletteMap[y].length;

                  var newX = x + dx;
                  var newY = y + dy;

                  if(newX >= charPaletteMapWidth) {
                    newX -= charPaletteMapWidth;
                    newY += this.columnHeight;
                  }

                  if(newX < 0) {
                    newX += charPaletteMapWidth;
                    newY -= this.columnHeight;
                  }


                  if( newY >= 0 && newY < charPaletteMapHeight
                    && newX >= 0 && newX < charPaletteMapWidth) {
                    var c = this.charPaletteMap[newY][newX];
                    newCharacters[j].push(c);

                    if(!this.isCharacterSelected(c)) {
                      this.selectedCharacters.push(c);
                    }
                  } else {

                    /*
                    // want to restore selected characters
                    this.selectedCharacters = [];
                    for(var i = 0; i < selectedCharactersSave.length; i++) {                        
                      this.selectedCharacters.push(selectedCharactersSave[i]);
                    }
                    */
                
                    return;
                  }

                  x = charPaletteMapWidth;
                  y = charPaletteMapHeight;
                  break;
                }
              }
            }
          }
        }
      }
    }

    this.selectedCharactersGrid = newCharacters;

    if(this.selectedGridChanged) {
      this.selectedGridChanged(this.selectedCharactersGrid);
    }



    if(this.mode == 'single') {
      var currentTile = false;

      if(this.selectedCharacters.length > 0) {
        currentTile = this.selectedCharacters[0];
      }

      if(this.characterSelectedCallback) {
        this.characterSelectedCallback(currentTile);
      }
    }


    this.draw();     
  },

  tilePaletteDoubleClick: function(event) {

    var currentTile = this.highlightCharacter;

    if(this.charDblClick) {
      this.charDblClick(currentTile);
    }



  },


  touchStart: function(event) {
    event.preventDefault();

    var touches = event.changedTouches;

    if(touches.length > 0) {

      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;

      this.mouseDownOnCharacter =  this.tilePaletteXYToTile(x, y);

      if(this.mouseDownOnCharacter !== false) {
        if(this.touchCharacterHandler !== false) {
          this.touchCharacterHandler(this.mouseDownOnCharacter);
        }
      }

      if(this.mode == 'multiple') {
        if(this.isCharacterSelected(this.mouseDownOnCharacter)) {
          this.unselectCharacter(this.mouseDownOnCharacter);
          this.selectMode = 'remove';
        } else {
          this.selectedCharacters.push(this.mouseDownOnCharacter);
          this.selectMode = 'add';
        }
      }

      this.draw();      



    }

  },


  touchMove: function(event) {
    event.preventDefault();

    var touches = event.changedTouches;

    if(touches.length > 0) {
      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;

      this.mouseDownOnCharacter =  this.tilePaletteXYToTile(x, y);

      if(this.mouseDownOnCharacter !== false) {
        if(this.touchCharacterHandler !== false) {
          this.touchCharacterHandler(this.mouseDownOnCharacter);
        }

        if(this.mode == 'multiple') {


          if(this.selectMode == 'remove') {
            this.unselectCharacter(this.mouseDownOnCharacter);
          } else {          
            if(!this.isCharacterSelected(this.mouseDownOnCharacter)) {
              if(this.selectMode == 'add') {
                this.selectedCharacters.push(this.mouseDownOnCharacter);
              }
            }
          }
        }
      }

      this.draw();      

    }

  },

  touchEnd: function(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    if(touches.length > 0) {


      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;

      var character =  this.tilePaletteXYToTile(x, y);

      if(character !== false) {
        if(this.touchEndCharacterHandler !== false) {
          this.touchEndCharacterHandler(character);
        }
      }
    }
    
  },

  
  mouseDownVScroll: function(button, x, y) {

    if(y <  this.vScrollBarPosition) {
      this.setYScroll(this.scrollY - 20);

    } else if(y >   this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY + 20);
    } else {
      this.vScroll = true;
    }
  },

  mouseDownHScroll: function(button, x, y) {


    if(x < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 20);
    } else if(x > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 20);
    } else {
      this.hScroll = true;
    }
    
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
      if(UI.os == 'Mac OS') {
        this.buttons = UI.RIGHTMOUSEBUTTON;
      }
    }
    // cmd + click
    /*
    if(event.metaKey && this.buttons == 1) {
      this.buttons = UI.MIDDLEMOUSEBUTTON;
    }
    */

  },

  mouseDown: function(event) {

    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

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

//      UI.captureMouse(this);
      this.mouseIsDown = true;
    }

    this.mouseDownAtScrollX = this.scrollX;
    this.mouseDownAtScrollY = this.scrollY;
    this.mouseDownAtY = y;
    this.mouseDownAtX = x;


    // is mouse down in vertical scroll bar
    if(x > this.width - this.vScrollBarWidth && y < this.height) {
      return this.mouseDownVScroll(button, x, y);
    }

    // is mouse down in horizontal scroll bar
    if(x > 0 && y > this.height - this.hScrollBarHeight) {
      return this.mouseDownHScroll(button, x, y);
    }

    x += this.scrollX;
    y += this.scrollY;
    this.mouseDownX = x;
    this.mouseDownY = y;

    this.mouseDownOnCharacter =  this.tilePaletteXYToTile(x, y);
    var gridMapPosition = this.gridMapGetMapPosition(x, y);

    
    if(this.mouseDownOnCharacter !== false) {
      var currentTile = this.mouseDownOnCharacter;



      if(this.mode == 'grid') {

        this.selectedCharacters = [];
        this.selectedCharactersGrid = [];
        

        this.selectedCharacters.push(currentTile);
        this.selectedCharactersGrid.push([currentTile]);

        this.selectedGridCells = [];
        // sort by tile index and columns of 16 arent in grid
        if(gridMapPosition.mapX !== false && gridMapPosition.mapY !== false) {     
          // x and y in char map, plus x and y in the selected char grid
          this.selectedGridCells.push({ x: gridMapPosition.mapX, y: gridMapPosition.mapY, selectedGridX: 0, selectedGridY: 0 });
          this.draw();
        } 

        if(this.selectedGridChanged) {
          this.selectedGridChanged(this.selectedCharactersGrid);
        }
      }

      if(this.mode == 'multiple') {
        if(this.isCharacterSelected(currentTile)) {
          this.selectMode = 'remove';
          this.unselectCharacter(currentTile);
        } else {
          this.selectMode = 'add';
          this.selectedCharacters.push(currentTile);
        }
        this.draw();
      }

      if(this.mode == 'single') {
        this.selectedCharacters = [currentTile];
        if(this.characterSelectedCallback) {
          this.characterSelectedCallback(currentTile);
        }
      }

      if(this.mode == 'sort') {
        this.selectedCharacters = [currentTile];
        this.drawTilePalette();

        this.mouseDownOnGridPosition = this.gridMapGetMapPosition(x, y);
        
        // need offset
        this.sortDragOffsetX = 0;
        this.sortDragOffsetY = 0;
        this.sortDragTile = true;
      }

    }
  },


  mouseWheel: function(event, delta) {
    event.stopPropagation();  
    event.preventDefault();  

//    var factor = 1;

 //   factor = event.deltaFactor / 6;

    var wheel = normalizeWheel(event);
    var factor = 4;

    this.setYScroll(this.scrollY + wheel.spinY * factor);
    this.setXScroll(this.scrollX + wheel.spinX * factor);

  },


  setTileMargin: function(tileMargin) {
    if(!isNaN(tileMargin) && tileMargin >= 0) {
      this.charMargin = tileMargin;
      this.draw({ redrawTiles: true });
    }
  },

  dragView: function(x, y, deltaX, deltaY) {
    //UI.setCursor('move');
    this.setYScroll(this.scrollY - deltaY);
    this.setXScroll(this.scrollX - deltaX);
  },  

  mouseMoveVScroll: function(x, y, deltaX, deltaY) {
    var scale = this.vScrollBarHeight / (this.contentHeight);
    var diffY = (y - this.mouseDownAtY) / scale;

    this.setYScroll(this.mouseDownAtScrollY + diffY);
  },

  mouseMoveHScroll: function(x, y, deltaX, deltaY) {

    var scale = this.hScrollBarWidth / (this.contentWidth);
    var diffX = (x - this.mouseDownAtX) / scale;
    this.setXScroll(this.mouseDownAtScrollX + diffX);
  },

  mouseMove: function(event) {
    
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var deltaX = x - this.lastMouseX;
    var deltaY = y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;


    var redrawCharPalette = false;

    if( (this.buttons & UI.MIDDLEMOUSEBUTTON) || (this.mode == 'hand' && this.buttons & UI.LEFTMOUSEBUTTON)  ) {
      UI.setCursor('drag-scroll');
      this.dragView(x, y, deltaX, deltaY);
      return;
    }

    // currently horzontal scrolling?
    if(this.hScroll) {
      this.mouseMoveHScroll(x, y, deltaX, deltaY);
      return;
    }

    // currently vertically scrolling?
    if(this.vScroll) {
      this.mouseMoveVScroll(x, y, deltaX, deltaY);
      return;
    }

    
    // reset scroll speed
    this.xScrollSpeed = 0;
    this.yScrollSpeed = 0;

    x += this.scrollX;
    y += this.scrollY;


    var character = this.tilePaletteXYToTile(x, y);

    if(character !== false) {
      UI.setCursor('default');
      if(character !== this.highlightCharacter) {
//        this.highlightCharacter = character;
//        this.setCharacterInfo(character);
        this.setHighlightCharacter(character);

        var gridMapPosition = this.gridMapGetMapPosition(x, y);
        this.highlightGridX = gridMapPosition.mapX;
        this.highlightGridY = gridMapPosition.mapY;

        this.highlightGridPixelX = gridMapPosition.x;
        this.highlightGridPixelY = gridMapPosition.y;


        if(this.highlightChanged) {
          this.highlightChanged(character);
        }


        redrawCharPalette = true;
        if(this.mouseDownX !== false && this.mouseDownY !== false) {
          this.editor.info.setCharacter(this.editor.currentTile.getCharacters());
        } else {
          this.editor.info.setCharacter(character);
        }

      }

    } else {
      if(this.highlightCharacter !== false) {
        this.highlightCharacter = false;
        
        redrawCharPalette = true;
        this.editor.info.setCharacter(this.editor.currentTile.getCharacters());
      }

    }

    if(this.mouseDownX !== false && this.mouseDownY !== false) {

      if(this.mode == 'grid') {
        // select a grid of characters
        var fromX = this.mouseDownX;
        var fromY = this.mouseDownY;
        var toX = x;
        var toY = y;
        if(fromX > toX) {
          var temp = toX;
          toX = fromX;
          fromX = temp;
        }
        if(fromY > toY) {
          var temp = toY;
          toY = fromY;
          fromY = temp;
        }

        var lastCharacter = false;
        var firstCharacter = false;

        //this.selectedCharacters = [];

        var selectedCharacters = [];
        var characters = [];
        var selectedGridCells = [];

        var fromGridPosition = this.gridMapGetMapPosition(fromX, fromY);
        var toGridPosition = this.gridMapGetMapPosition(toX, toY);

        if(fromGridPosition.mapX === false || fromGridPosition.mapY === false) {

          for(var testY = fromY; testY <= toY; testY++) {
            var row = [];
            
            for(var testX = fromX; testX <= toX; testX++) {
              var character = this.tilePaletteXYToTile(testX, testY);

              if(character === firstCharacter && row.length == 0) {
                // skip this row
                testX = toX;
              } else {
                if(character !== false && character !== lastCharacter && character !== firstCharacter) {
                  if(testX == fromX) {
                    firstCharacter = character;
                  }
                  lastCharacter = character;


                  if(selectedCharacters.indexOf(character) < 0) {
        //              if(!this.isCharacterSelected(character)) {
                    selectedCharacters.push(character);
                  }
                  
/*
                  selectedGridCells.push({
                    x: gridX,
                    y: gridY,
                    selectedGridX: row.length, 
                    selectedGridY: characters.length
                  });
*/
                  row.push(character);
                }
              }
            }

            lastCharacter = false;

            if(row.length > 0) {
              characters.push(row);
            }
          }

        } else {

  //        for(var testY = fromY; testY <= toY; testY++) {
          for(var gridY = fromGridPosition.mapY; gridY <= toGridPosition.mapY; gridY++) {
            var row = [];
            
  //          for(var testX = fromX; testX <= toX; testX++) {
            for(var gridX = fromGridPosition.mapX; gridX <= toGridPosition.mapX; gridX++) {
              //var character = this.tilePaletteXYToTile(testX, testY);

              var character = this.charPaletteMap[gridY][gridX];

              if(character === firstCharacter && row.length == 0) {
                // skip this row
                //testX = toX;
                gridX = toGridPosition.mapX;
              } else {
                if(character !== false && character !== lastCharacter && character !== firstCharacter) {
                  //if(testX == fromX) {
                  if(gridX == fromGridPosition.mapX) {
                    firstCharacter = character;
                  }
                  lastCharacter = character;


                  if(selectedCharacters.indexOf(character) < 0) {
  //                if(!this.isCharacterSelected(character)) {
                    selectedCharacters.push(character);
                  }
                  

                  selectedGridCells.push({
                    x: gridX,
                    y: gridY,
                    selectedGridX: row.length, 
                    selectedGridY: characters.length
                  });

                  row.push(character);
                }
              }
            }

            lastCharacter = false;

            if(row.length > 0) {
              characters.push(row);
            }
          }
        }


        if(characters.length > 0) {

          this.selectedCharactersGrid = characters;
          this.selectedCharacters = selectedCharacters;
          this.selectedGridCells = selectedGridCells;

          if(this.selectedGridChanged) {
            this.selectedGridChanged(this.selectedCharactersGrid);
          }
        }
      }

      if(this.mode == 'multiple') {
        // select multiple characters, not in a grid
        
        if(character !== false) {
          if(this.selectMode == 'remove') {
            this.unselectCharacter(character);
          } else {          
            if(!this.isCharacterSelected(character)) {
              if(this.selectMode == 'add') {
                this.selectedCharacters.push(character);
              }
            }
          }
        }
      }

      redrawCharPalette = true;
    }
    if(this.mode == 'sort') {
      if(this.sortDragTile) {
//        x += this.scrollX;
//        y += this.scrollY;
    
        this.sortDragTileX = x - this.scrollX;
        this.sortDragTileY = y - this.scrollY;
        redrawCharPalette = true;
      }
    }

    if(redrawCharPalette) {
      this.draw();      
    }
  },


  gridMapClear: function() {
    this.gridMap = [];
  },

  gridMapAdd: function(x, y, width, height, value, mapX, mapY) {
    var entry = {
      y: y,
      height: height,
      value: value,
      mapX: mapX,
      mapY: mapY
    }

    for(var i = 0; i < this.gridMap.length; i++) {
      if(this.gridMap[i].x === x && this.gridMap[i].width === width) {
        this.gridMap[i].rows.push(entry); //{ y: y, height: height, value: value, mapX: mapX, mapY: mapY });
        return;
      }
    }

    this.gridMap[i] =
      {
        x: x, 
        width: width,
        rows: [ entry ]
      };
  },

  // return the tile at pixel location x, y in the tile map
  gridMapGetValue: function(x, y) {
    for(var i = 0; i < this.gridMap.length; i++) {
      if(x >= this.gridMap[i].x && x < (this.gridMap[i].x + this.gridMap[i].width) ) {
        for(var j = 0; j < this.gridMap[i].rows.length; j++) {
          if(y >= this.gridMap[i].rows[j].y && y < this.gridMap[i].rows[j].y + this.gridMap[i].rows[j].height) {
            return this.gridMap[i].rows[j].value;
          }
        }
      }
    }
    return false;
  },

  // get the x, y, position in the tile map for pixel location x, y
  gridMapGetPosition: function(x, y) {
    for(var i = 0; i < this.gridMap.length; i++) {
      if(x >= this.gridMap[i].x && x < (this.gridMap[i].x + this.gridMap[i].width) ) {
        for(var j = 0; j < this.gridMap[i].rows.length; j++) {
          if(y >= this.gridMap[i].rows[j].y && y < this.gridMap[i].rows[j].y + this.gridMap[i].rows[j].height) {
            return {
              x: i,
              y: j
            }
          }
        }
      }
    }
    return false;
  },

  // get the x, y, position in the tile map for pixel location x, y
  gridMapGetMapPosition: function(x, y) {
    for(var i = 0; i < this.gridMap.length; i++) {
      if(x >= this.gridMap[i].x && x < (this.gridMap[i].x + this.gridMap[i].width) ) {
        for(var j = 0; j < this.gridMap[i].rows.length; j++) {
          if(y >= this.gridMap[i].rows[j].y && y < this.gridMap[i].rows[j].y + this.gridMap[i].rows[j].height) {
            return {
              x: this.gridMap[i].x,
              y: this.gridMap[i].rows[j].y,
              mapX: this.gridMap[i].rows[j].mapX,
              mapY: this.gridMap[i].rows[j].mapY,
              offsetX: x - this.gridMap[i].x,
              offsetY: y - this.gridMap[i].rows[j].y
            }
          }
        }
      }
    }
    return false;
  },

  tilePaletteXYToTile: function(x, y) {
    return this.gridMapGetValue(x, y);
  },

  getWidth: function() {
    return Math.ceil(this.canvas.width / this.canvasScale);
  },

  getHeight: function() {
    return Math.ceil(this.canvas.height / this.canvasScale);
  },

  getMapPosition: function(tileIndex) {

    for(var j = 0; j < this.charPaletteMap.length; j++) {
      for(var i = 0; i < this.charPaletteMap[j].length; i++) {
        if(this.charPaletteMap[j][i] === tileIndex) {
          return { x: i, y: j };
        }
      }
    }
    return false;
  },
  


  clearSelectedGridCells: function() {
    this.selectedGridCells = [];
  },


  setHighlightCharacter: function(character) {
    this.highlightCharacter = character;
  },

  clearHighlightCharacter: function() {
    this.highlightCharacter = false;
  },

  charPaletteMouseLeave: function(event) {

    this.highlightGridX = false;
    this.highlightGridY = false;

    if(this.highlightCharacter !== false) {
      this.highlightCharacter = false;

      this.draw();
    }
    if(this.highlightChanged) {
      this.highlightChanged(false);
    }


    if(this.mouseLeaveHandler !== false) {
      this.mouseLeaveHandler(event);
    }

  },

  mouseUp: function(event) {
    var noTile = this.editor.tileSetManager.noTile;
    
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    x += this.scrollX;
    y += this.scrollY;


    this.xScrollSpeed = 0;
    this.yScrollSpeed = 0;


    if(this.mode == 'sort') {
      if(this.mouseDownOnCharacter !== false) {
        
        this.highlightedChars = false;
        var mouseUpOnGridPosition = this.gridMapGetMapPosition(x, y);

        if(mouseUpOnGridPosition !== false) {
          var newTile = this.gridMapGetValue(x, y);
        
          var mouseDownX = this.mouseDownOnGridPosition.mapX;
          var mouseDownY = this.mouseDownOnGridPosition.mapY;
          var mouseUpX = mouseUpOnGridPosition.mapX;
          var mouseUpY = mouseUpOnGridPosition.mapY;

          
          if(event.shiftKey) {
            // user is trying to duplicate tile

            if(mouseUpY == mouseDownY && mouseUpX == mouseDownX) {
              // user is trying to remove the tile
              // should make sure its not the only one..
              this.charPaletteMap[mouseUpY][mouseUpX] = noTile;
            } else {//} if(newTile == noTile) {
//              this.charPaletteMap[mouseDownY][mouseDownX] = newTile;
              this.charPaletteMap[mouseUpY][mouseUpX] = this.mouseDownOnCharacter;
            }
          } else {
            this.charPaletteMap[mouseDownY][mouseDownX] = newTile;
            this.charPaletteMap[mouseUpY][mouseUpX] = this.mouseDownOnCharacter;
          }
        }
        this.draw({ redrawTiles: true });
      }
      this.sortDragTile = false;
    }

    this.vScroll = false;
    this.hScroll = false;
    this.mouseDownOnCharacter = false;
    this.mouseDownX = false;
    this.mouseDownY = false;
    this.mouseIsDown = false;
    this.draw();    

    if(this.mouseUpHandler !== false) {
      this.mouseUpHandler(event);
    }

    this.buttons = 0;
  }
}
