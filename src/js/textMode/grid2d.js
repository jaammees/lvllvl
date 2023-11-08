var Grid2d = function() {
  this.editor = null;

  this.canvas = null;
  this.context = null;
  this.imageData = null;

  this.prevFrameCanvas = null;
  this.prevFrameContext = null;

  this.thumbnailCanvas = null;

  this.nextFrameCanvas = null;
  this.nextFrameContext = null;

  this.effectCanvas = null;
  this.effectContext = null;


  this.tempCanvas = null;
  this.tempContext = null;

  this.cursor = {};
  this.cursor.isOn = true;
  this.cursor.position = { x: -1, y: -1 };
  this.cursor.offset = { x: 0, y: 0};
  this.cursor.color = false;
  this.cursor.bgColor = false;
  this.cursor.character = false;

  this.typingCursor = {};
  this.typingCursor.isOn = false;
  this.typingCursor.position = { x: -1, y: -1 };
  this.typingCursor.color = false;

  this.shapesCanvas = null;
  this.selectionCanvas = null;
}

Grid2d.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.canvas = document.createElement("canvas");
    this.canvas.width = 320;
    this.canvas.height = 200;

    this.context = this.canvas.getContext("2d");

    this.shaderEffects = new ImageShaderEffects();
    this.shaderEffects.init();    

  },

  getCursorEnabled: function() {
    return this.cursor.isOn;
  },

  setCursorEnabled: function(enabled) {

    if(this.cursor.isOn === enabled) {
      return;
    }
    this.cursor.isOn = enabled;
  },

  getCursorPosition: function() {
    return {
      x: this.cursor.position.x,
      y: this.cursor.position.y
    }
  },

  setCursorPosition: function(x, y) {
    if(this.cursor.position.x == x && this.cursor.position.y == y) {
      // nothing changed
      return;
    }

    var oldX = this.cursor.position.x;
    var oldY = this.cursor.position.y;


    var cursorWidth = 1;
    var cursorHeight = 1;

    var tool = this.editor.tools.drawTools.tool;
    if(tool === 'pen' || tool === 'block') {
      cursorHeight = this.editor.currentTile.characters.length;
      if(cursorHeight > 0) {
        cursorWidth = this.editor.currentTile.characters[0].length;
      }
    }

    var layer = this.editor.layers.getSelectedLayerObject();

    if(tool === 'block' && layer && layer.getType() == 'grid' && layer.getBlockModeEnabled()) {

      // can only move in increments of the block dimensions
      this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockWidth = layer.getBlockWidth();
      var blockHeight = layer.getBlockHeight();
      var gridHeight = layer.getGridHeight();

// reverseY      y = gridHeight - 1 - y;
      x = Math.floor(x / blockWidth) * blockWidth;
      y = Math.floor(y / blockHeight) * blockHeight;

// reverseY      y = gridHeight - 1 - y;

    }

    this.cursor.position.x = x;
    this.cursor.position.y = y;
  },

  eyedropperCursorCell: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer == null || layer.getType() != 'grid') {
      return;
    }

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var x = this.cursor.position.x;
    var y = this.cursor.position.y;


    if(   x === false || x < 0 || x >= gridWidth
       || y === false || y < 0 || y >= gridHeight) {
      return;
    }

    var cellData = layer.getCell({ x: x, y: y });
    if(cellData === false) {
      return;
    }

    var drawTools = this.editor.tools.drawTools;
    var currentTile = this.editor.currentTile;

    if(drawTools.drawCharacter) {
//      currentTile.setCharacter(cellData.t);
      this.editor.setSelectedTiles([[cellData.t]]);
    }

    if(drawTools.drawColor) {
      currentTile.setColor(cellData.fc);
    }

    if(drawTools.drawBGColor) {
      currentTile.setBGColor(cellData.bc);
    }



  },


  eraseCursorCells: function() {
    var args = {};
    args.useCells = false;
    args.rz = 0;
    args.fh = 0;
    args.fv = 0;
    args.bc = this.editor.colorPaletteManager.noColor;
    args.useTile = this.editor.tileSetManager.blankCharacter;

    this.setCursorCells(args);
  },


  setMirrorCells: function(layer, cellData) {
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    if(this.editor.tools.drawTools.mirrorH) {        

      var canUseFlipH = this.editor.graphic.getHasTileFlip();

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();

      var saveX = cellData.x;
      var saveY = cellData.y;
      var saveT = cellData.t;
      var saveFV = cellData.fv;
      var saveFH = cellData.fh;

      var mirrorHX = this.editor.tools.drawTools.mirrorHX;
      var x = mirrorHX + mirrorHX - cellData.x - 1;
      if(x >= 0 && x < gridWidth) {
        if(canUseFlipH) {
          cellData.fh = 1-cellData.fh;
        } else {
          cellData.t = tileSet.getHFlip(cellData.t);
        }

        cellData.x = x;
        layer.setCell(cellData);

      }

      if(this.editor.tools.drawTools.mirrorV) {

        var mirrorVY = this.editor.tools.drawTools.mirrorVY;
        var y = mirrorVY + mirrorVY - cellData.y - 1;
        if(y >= 0 && y < gridHeight) {
          cellData.y = y;
          if(canUseFlipH) {
            cellData.fv = 1-cellData.fv;
          } else {
            cellData.t = tileSet.getVFlip(cellData.t);
          }

          layer.setCell(cellData);
        }

      }

      cellData.x = saveX;
      cellData.y = saveY;
      cellData.t = saveT;
      cellData.fh = saveFH;
      cellData.fv = saveFV;
    } 

    if(this.editor.tools.drawTools.mirrorV) {
      var canUseFlipV = this.editor.graphic.getHasTileFlip();
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();

      var mirrorVY = this.editor.tools.drawTools.mirrorVY;
      var y = mirrorVY + mirrorVY - cellData.y - 1;
      if(y >= 0 && y < gridHeight) {
        cellData.y = y;
        if(canUseFlipV) {
          cellData.fv = 1-cellData.fv;
        } else {
          cellData.t = tileSet.getVFlip(cellData.t);
        }

        layer.setCell(cellData);
      }

    }
  },


  setCursorCells: function(args) {

    var update = true;

    var rotX = this.editor.currentTile.rotX;
    var rotY = this.editor.currentTile.rotY;
    var rotZ = this.editor.currentTile.rotZ;

    var useTile = false;



    var tiles = this.editor.currentTile.characters;

    var cells = this.editor.currentTile.cells;
    var useCells = this.editor.currentTile.useCells && (cells != null);


    var cursorX = this.cursor.position.x;
    var cursorY = this.cursor.position.y;
    var cursorZ = 0;//this.editor.grid.getXYGridPosition();

    var layer = this.editor.layers.getSelectedLayer();
    if(layer.type != 'grid') {
    }

    layer = this.editor.layers.getLayerObject(layer.layerId);

    var cellData = {};
    cellData.fc = this.editor.currentTile.color;
    cellData.bc =  this.editor.currentTile.bgColor;


    cellData.fh = 0;
    cellData.fv = 0;

    if(this.editor.currentTile.flipH) {
      cellData.fh = 1;
    }

    if(this.editor.currentTile.flipV) {
      cellData.fv = 1;
    }



    cellData.update = false;

    // if block mode is enabled, set the block
    if(layer.getBlockModeEnabled()) {
      cellData.b = this.editor.currentTile.blockId;

      if(this.editor.tools.drawTools.tool != 'block') {
        cellData.b = false;
      }
    }

    var width = 0;
    var height = 0;
    if(useCells) {
      if(typeof cells == 'undefined' || cells.length == 0) {
        return;
      }
      height = cells.length;
      width = cells[0].length;
    } else {
      if(typeof tiles == 'undefined' || tiles.length == 0) {
        return;
      }
      height = tiles.length;
      width = tiles[0].length;      
    }


    if(typeof args != 'undefined') {
      if(typeof args.update != 'undefined') {
        update = args.update;
      }

      if(typeof args.fh !== 'undefined') {
        cellData.fh = args.fh;
      }

      if(typeof args.fv !== 'undefined') {
        cellData.fv = args.fv
      }  

      if(typeof args.rz === 'undefined') {
        cellData.rz = args.rz;//this.editor.currentTile.rotZ;
      }

      if(typeof args.bc != 'undefined') {
        cellData.bc = args.bc;
      }

      if(typeof args.useCells !== 'undefined') {
        useCells = args.useCells;
      }
      if(typeof args.useTile != 'undefined' ) {
        useTile = args.useTile;
      }



    }

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    for(var currentTileY = 0; currentTileY < height; currentTileY++) {
      for(var currentTileX = 0; currentTileX < width; currentTileX++) {
        var x = cursorX + currentTileX + this.cursor.offset.x;
//  reverseY        var y = cursorY + (height - currentTileY - 1) - height + 1 - this.cursor.offset.y;
        var y = cursorY + currentTileY + this.cursor.offset.y;
        var z = 0;
        var currentCell = layer.getCell({ x: x, y: y });

        if(   x !== false && x >= 0 && x < gridWidth
           && y !== false && y >= 0 && y < gridHeight) {

          cellData.x = x;
          cellData.y = y;
          cellData.z = 0;
          cellData.update = false;

          if(useCells) {
            for(key in cells[currentTileY][currentTileX]) {
              if(key !== 'b') {
                if(cells[currentTileY][currentTileX].hasOwnProperty(key)) {
                  cellData[key] = cells[currentTileY][currentTileX][key];
                }
              }
            }

          } else {

            if(useTile !== false) {
              cellData.t = useTile;
            } else {
              cellData.t = tiles[currentTileY][currentTileX];
            }

            if(!this.editor.tools.drawTools.drawCharacter) {
              cellData.t =  currentCell.t;
              cellData.rx = currentCell.rx;
              cellData.ry = currentCell.ry;
              cellData.rz = currentCell.rz;
              cellData.fh = currentCell.fh;
              cellData.fv = currentCell.fv;
            }

            if(!this.editor.tools.drawTools.drawColor) {
              cellData.fc = currentCell.fc;
            }
            if(!this.editor.tools.drawTools.drawBgColor) {
              cellData.bc = currentCell.bc;
            }

          }


          if(typeof cellData.t !== 'undefined' && cellData.t !== false && cellData.t !== this.editor.tileSetManager.noTile) {
            layer.setCell(cellData);
          }

          this.setMirrorCells(layer, cellData);

        }

      }
    }

    if(update) {
      if(layer.getBlockModeEnabled() && cellData.b === false) {
        // updating a cell in a block, so need to redraw everything..
        this.editor.graphic.invalidateAllCells();
      }      
      this.editor.graphic.redraw();
    }

  },


  setCursorColor: function(color) {
    this.cursor.color = color;
  },

  setCursorBGColor: function(color) {
    this.cursor.bgColor = color;
  },

  setCursorCharacter: function(character) {
    this.cursor.character = character;
  },

  moveCursor: function(dx, dy) {
    //this.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var x = this.cursor.position.x + dx;
    var y = this.cursor.position.y + dy;
    if(x >= 0 && x < layer.getGridWidth() && y >= 0 && y < layer.getGridHeight()) {
      this.setCursorPosition(x, y);
    }

  },

  setCursor: function(x, y, character, color, bgColor) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }


    if(x < 0 || y < 0 || x >= layer.getGridWidth() || y >= layer.getGridHeight() ) {
      return false;
    }

    if(this.cursor.position.x == x && this.cursor.position.y == y && this.cursor.character == character && this.cursor.color == color && this.cursor.bgColor == bgColor) {
      return false;
    }

    if(this.cursor.position.x == x && this.cursor.position.y == y) {

      this.cursor.character = character;
      this.cursor.color = color;
      this.cursor.bgColor = bgColor;

    } else {
      var oldX = this.cursor.position.x;
      var oldY = this.cursor.position.y;

      this.cursor.character = character;
      this.cursor.color = color;
      this.cursor.bgColor = bgColor;
      this.setCursorPosition(x, y);

    }

  },



  setTypingCursor: function(x, y, color, isOn) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    if(x < 0 || y < 0 || x >= layer.getGridWidth() || y >= layer.getGridHeight() ) {
      return false;
    }

    if(isNaN(x) || isNaN(y)) {
      return;
    }

    if(this.typingCursor.position.x == x && this.typingCursor.position.y == y 
         && this.typingCursor.color == color && this.typingCursor.isOn == isOn) {
      return false;
    }

    var currentFrame = this.editor.graphic.getCurrentFrame();

    if(this.typingCursor.position.x == x && this.typingCursor.position.y == y) {

      this.typingCursor.color = color;
      this.typingCursor.isOn = isOn;

//      this.update(currentFrame, x, y);
    } else {
      var oldX = this.typingCursor.position.x;
      var oldY = this.typingCursor.position.y;

      this.typingCursor.color = color;
      this.typingCursor.isOn = isOn;
      this.typingCursor.position.x = x;
      this.typingCursor.position.y = y;

      /*
      if(oldX != -1 && oldY != -1) {
        this.update(currentFrame, oldX, oldY);
      }
      this.update(currentFrame, x, y);
*/      
    }


  },

  // draw into a context, called by export gif and png
  draw: function(args) {
    var context = this.context;
    var canvas = this.canvas;
    var frame = this.editor.graphic.getCurrentFrame();
    var whichLayers = 'visible';
    var clear = true;

//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
//    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth = this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();


    if(typeof args != 'undefined') {
      if(typeof args.canvas != 'undefined') {
        canvas = args.canvas;
        context = canvas.getContext('2d');
      }

      if(typeof args.context != 'undefined') {
        context = args.context;
      }

      if(typeof args.frame != 'undefined') {
        frame = args.frame;
      }

      if(typeof args.layers != 'undefined') {
        whichLayers = args.layers;
      }

      if(typeof args.clear !== 'undefined') {
        clear = args.clear;
      }

    }


    if(clear) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    for(var i = 0; i < this.editor.layers.layers.length; i++) {
      var layer = this.editor.layers.layers[i];

      if( ( (layer.visible && whichLayers == 'visible') || (whichLayers == 'all') || (whichLayers == layer.layerId) ) 
        && (layer.type == 'grid' || layer.type == 'image')) {

        if(layer.canvas.width != screenWidth || layer.canvas.height != screenHeight) {
          layer.canvas.width = screenWidth;
          layer.canvas.height = screenHeight;
        }

        this.drawLayer({ canvas: layer.canvas, layerIndex: i, frame: frame });


        var opacity = 1;
        if(typeof layer.opacity != 'undefined') {
          opacity = layer.opacity;
        }

        context.globalAlpha = opacity;

        if(typeof layer.compositeOperation != 'undefined') {
          context.globalCompositeOperation = layer.compositeOperation;
        } else {
          context.globalCompositeOperation = 'source-over';
        }


        context.drawImage(layer.canvas, 0, 0);        
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
    }
  },


  // draw frame, when drawing to the screen..called by grid2d.update.
  drawFrame: function(args) {

    var frame = this.editor.graphic.getCurrentFrame();
    if(typeof args.frame != 'undefined') {    
      frame = args.frame;
    }

    var canvas = args.canvas;
    var context = args.context;

    var whichLayers = 'visible';

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth = this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    var allCells = false;
    if(typeof args.allCells != 'undefined') {
      allCells = args.allCells;
    }

    var drawBackground = this.editor.layers.isBackgroundVisible();
    if(typeof args.drawBackground != 'undefined') {
      drawBackground = args.drawBackground;
    }

    var updateLayerCanvas = true;
    if(typeof args.updateLayerCanvas != 'undefined') {
      updateLayerCanvas = args.updateLayerCanvas;
    }

    var animatedTilesOnly = false;
    if(typeof args.animatedTilesOnly != 'undefined') {
      animatedTilesOnly = args.animatedTilesOnly;
    }

    if(typeof args.layers != 'undefined') {
      whichLayers = args.layers;
    }

    var drawPreviousFrame = false;
    if(typeof args.drawPreviousFrame != 'undefined') {
      drawPreviousFrame = args.drawPreviousFrame;
    } else {
      drawPreviousFrame = this.editor.frames.getShowPrevFrame();
    }


    if(screenWidth != canvas.width || screenHeight != canvas.height) {
      canvas.width = screenWidth;
      canvas.height = screenHeight;
      context = canvas.getContext('2d');
    }


    if(this.effectCanvas == null) {
      this.effectCanvas = document.createElement('canvas');
    }

    this.effectCanvas.width = screenWidth;
    this.effectCanvas.height = screenHeight;
    this.effectContext = this.effectCanvas.getContext('2d');


    if(!updateLayerCanvas) {
      if(this.tempCanvas == null) {
        this.tempCanvas = document.createElement('canvas');
      }
      this.tempCanvas.width = screenWidth;
      this.tempCanvas.height = screenHeight;
      this.tempContext = this.tempCanvas.getContext('2d');
    }


    if(typeof frame == 'undefined') {
      frame = this.editor.graphic.getCurrentFrame();
    }

    var previousFrameSrcCanvas = null;
    if(drawPreviousFrame) {
      // previous screen is grid2d
      var gridView2d = this.editor.gridView2d;

      gridView2d.setupPreviousFrame();
      previousFrameSrcCanvas = gridView2d.previousScreen.canvas;

      this.editor.graphic.invalidateAllCells();
    }

    var drawBounds = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };

    if(!allCells) {
      if(this.editor.graphic.getOnlyViewBoundsDrawn() || animatedTilesOnly) {
        var viewBounds = this.editor.graphic.getViewBounds();
        drawBounds.x = viewBounds.x;
        drawBounds.y = viewBounds.y;
        drawBounds.width = viewBounds.width;
        drawBounds.height = viewBounds.height;
      }
    }

//    context.clearRect(0, 0, canvas.width, canvas.height);

    context.clearRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);

    var canvas = null;

    for(var i = 0; i < this.editor.layers.layers.length; i++) {
      var layer = this.editor.layers.layers[i];
  
      if( ( (layer.visible && whichLayers == 'visible') || (whichLayers == 'all') || (whichLayers == layer.layerId) ) 
        && (layer.type == 'grid' || layer.type == 'image')) {

        
        var layerObject = null;
        canvas = null;

        layerObject = this.editor.layers.getLayerObject(layer.layerId);

        var drawLayerBackground = drawBackground;
        if(layerObject && layerObject.isCurrentLayer() && drawPreviousFrame) {
          drawLayerBackground = false;
        }


        if(layer.type == 'grid') {
          if(updateLayerCanvas) {
            canvas = layerObject.getCanvas();
          } else {
            canvas = this.tempCanvas;
          }

        
          layerObject.draw({ 
            canvas: canvas,  
            frame: frame, 
            allCells: allCells,
            drawBackground: drawLayerBackground 
          });



        } else if(layer.type == 'image') {
          if(drawBackground) {
            if(updateLayerCanvas) {
              canvas = layerObject.getCanvas();
            } else {
              canvas = this.tempCanvas;
            }

            layerObject.draw({ 
              canvas: canvas, 
              frame: frame 
            });
          }
        } else {
//            this.drawLayer({ canvas: layer.canvas, layerIndex: i, frame: frame, fromX: fromX, fromY: fromY, toX: toX, toY: toY });
        }


        var opacity = 1;
        if(typeof layer.opacity != 'undefined') {
          opacity = layer.opacity;
        }

        // do effect here...
        if(false && i == 1) {
/*
          context.globalAlpha = opacity;
          if(typeof layer.compositeOperation != 'undefined') {
            context.globalCompositeOperation = layer.compositeOperation;
          } else {
            context.globalCompositeOperation = 'source-over';
          }

          this.shaderEffects.setInput(layer.canvas, this.effectCanvas);

          var effectsList = [ { effect: "RGB Shift", params: { "amount":  0.05, "angle": 0}}];
          this.shaderEffects.setEffects(effectsList);
          this.shaderEffects.setEffectParams(effectsList);
//          this.shaderEffects.setTime(this.shaderTime);
          this.shaderEffects.applyEffects();

          context.drawImage(this.effectCanvas, 0, 0);
*/
        } else {

          // if the current layer is a grid layer and need to draw onion skin frame
          if(layerObject && layerObject.isCurrentLayer() && drawPreviousFrame && layer.type == 'grid') {
            if(drawBackground) {
              context.globalAlpha = opacity;
              var colorPalette = layerObject.getColorPalette();
              var bgColor = layerObject.getBackgroundColor();
              if(bgColor !== this.editor.colorPaletteManager.noColor) {
                context.fillStyle= '#' + colorPalette.getHexString(bgColor);  
                context.fillRect(0, 0, canvas.width, canvas.height);
              }
            }
            context.globalAlpha = 0.3;
            context.drawImage(previousFrameSrcCanvas, 0, 0);
          }



          context.globalAlpha = opacity;
          if(typeof layer.compositeOperation != 'undefined') {
            context.globalCompositeOperation = layer.compositeOperation;
          } else {
            context.globalCompositeOperation = 'source-over';
          }

          if(layer.type == 'grid' || layer.type == 'image') {
            if(canvas) {

              // only draw visible part of canvas

//              context.drawImage(canvas, 0, 0);
              context.drawImage(canvas, 
                drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height,
                drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height
                );
            }
          } else {
            context.drawImage(layer.canvas, 0, 0);
          }


          // if current layer is image layer and need to draw onion skin layer after drawing image.
          if(layerObject && layerObject.isCurrentLayer() && drawPreviousFrame && layer.type == 'image') {
            context.globalAlpha = 0.3;
            context.drawImage(previousFrameSrcCanvas, 0, 0);
          }




        }
/*
this.shaderEffects.setInput(canvas, canvas);
var effectsList = [ { effect: "Triangle Blur", params: { "amount":  0.003}}];
this.shaderEffects.setEffects(effectsList);
this.shaderEffects.setEffectParams(effectsList);
this.shaderEffects.applyEffects();
*/
//context.drawImage(this.effectCanvas, 0, 0);



        if(layerObject.getType() === 'grid') {
          if(layerObject.isCurrentLayer()) {
            // its the current layer..draw selection and shapes
            // need to draw shapes?
            // draw shapes if in shapes mode and grid correct size

            var drawTool = this.editor.tools.drawTools.tool;
            if(drawTool === 'rect' || drawTool === 'line' || drawTool === 'oval' ) {
              var shapesGrid = this.editor.tools.drawTools.shapes.getGrid();


              if(this.editor.tools.drawTools.shapes.width == layerObject.getGridWidth()
                  && this.editor.tools.drawTools.shapes.height == layerObject.getGridHeight()) {

                if(this.shapesCanvas === null) {
                  this.shapesCanvas = document.createElement('canvas');
                }

                var layerCanvas = layerObject.getCanvas();

                if(this.shapesCanvas.width != layerCanvas.width || this.shapesCanvas.height != layerCanvas.height) {
                  this.shapesCanvas.width = layerCanvas.width;
                  this.shapesCanvas.height = layerCanvas.height;
                }

                layerObject.draw({ 
                  canvas: this.shapesCanvas,  
                  allCells: true, 
                  draw: 'shapes' 
                });


//                this.drawLayer({ canvas: this.shapesCanvas, draw: 'shapes', frame: frame });
                context.drawImage(this.shapesCanvas, 0, 0);
              }
            }

            if(layer.type == 'grid') {

                // if select is active, selection isn't drawn in the grid, need to draw it here
                // dont want to draw it if in paste move
                if(this.editor.tools.drawTools.select.isActive()) {

                  if(!this.editor.tools.drawTools.select.isInPasteMove()) {
                    // not really shapes canvas, its the selection canvas
                    if(this.shapesCanvas === null) {
                      this.shapesCanvas = document.createElement('canvas');
                    }

                    var layerCanvas = layerObject.getCanvas();

                    if(this.shapesCanvas.width != layerCanvas.width || this.shapesCanvas.height != layerCanvas.height) {
                      this.shapesCanvas.width = layerCanvas.width;
                      this.shapesCanvas.height = layerCanvas.height;
                    }

                    layerObject.draw({ 
                      canvas: this.shapesCanvas, 
                      allCells: true, 
                      draw: 'selection', 
                      frame: frame 
                    });
                    
                    context.drawImage(this.shapesCanvas, 0, 0);
                  }

                }

                // draw the movable pasted area
                if(this.editor.tools.drawTools.select.isInPasteMove()) {
                  this.editor.tools.drawTools.select.drawClipboardImage(context);
                }


                var pixelSelect = this.editor.tools.drawTools.pixelSelect;

                if(pixelSelect.isActive()) {
                  var selection = pixelSelect.getSelection();
                  if(selection.maxX > selection.minX && selection.maxY > selection.minY) {
                    var layerHeight = layerObject.getHeight();

                    pixelSelect.drawSelection();

                    var sx = selection.minX;
                    var sy = selection.minY;
                    var sWidth = selection.maxX - selection.minX;
                    var sHeight = selection.maxY - selection.minY;
                    var dx = selection.minX + pixelSelect.selectionOffsetX;
// reverseY                    var dy = layerHeight - selection.maxY - pixelSelect.selectionOffsetY;
                    var dy = selection.minY + pixelSelect.selectionOffsetY;
                    context.drawImage(pixelSelect.canvas, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
                  }
                }


                // draw the movable pasted area
                if(pixelSelect.isInPasteMove()) {
                  pixelSelect.drawPastedPixels();
                  var sx = 0;
                  var sy = 0;
                  var sWidth = pixelSelect.getPasteWidth();
                  var sHeight = pixelSelect.getPasteHeight();
                  var dx = pixelSelect.pasteOffsetX;
                  var dy = pixelSelect.pasteOffsetY;

                  context.drawImage(pixelSelect.canvas, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
                }

            }

//            }
          }


          /*

          // have all cells that needed to be update have been updated?
          if(!onlyViewBoundsUpdatedLayer) {
            // updates to all cells have been made, so mark no cells as needing update
            if(frame === this.editor.frames.currentFrame) {
              console.error('readd cell invalidation per layer');
              this.editor.frames.updatedCellRanges[z].minX = gridWidth;
              this.editor.frames.updatedCellRanges[z].maxX = 0;

              this.editor.frames.updatedCellRanges[z].minY = gridHeight;
              this.editor.frames.updatedCellRanges[z].maxY = 0;
            }
          } else {
           
          }
          */

        }        
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';


    }
  },

  getThumbnailCanvas: function() {
    var width = 90;
    var height = 90;
    if(this.thumbnailCanvas == null) {
      this.thumbnailCanvas = document.createElement('canvas');
    }

    this.thumbnailCanvas.width = width;
    this.thumbnailCanvas.height = height;

    var context = this.thumbnailCanvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.oImageSmoothingEnabled = false;

    var thumbnailWidth = 86;
    var thumbnailHeight = 86;

    var scaledWidth = width;
    var scaledHeight = height;

    if(this.canvas.width > this.canvas.height) {
      scaledWidth = thumbnailWidth;
      scaledHeight = this.canvas.height * (scaledWidth / this.canvas.width);
    } else {
      scaledHeight = thumbnailHeight;
      scaledWidth = this.canvas.width * (scaledHeight / this.canvas.height);
    }

    var offsetX = (width - scaledWidth) / 2;
    var offsetY = (height - scaledHeight) / 2;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#040404';
    context.fillRect(0, 0, width, height);   

    context.drawImage(this.canvas, offsetX, offsetY, scaledWidth, scaledHeight);

    return this.thumbnailCanvas;

  },

  update: function(args) {


    if(g_newSystem) {
      console.error('shouldnt get here update in grid2d!!!');
    }
    var frame = this.editor.graphic.getCurrentFrame();
    var allCells = false;
    var drawBackground = this.editor.layers.isBackgroundVisible();
    var drawPreviousFrame = this.editor.frames.getShowPrevFrame();
    var animatedTilesOnly = false;


    if(typeof args != 'undefined') {
      if(typeof args.frame != 'undefined') {
        frame = args.frame;
      }

      if(typeof args.allCells != 'undefined') {
        allCells = args.allCells;
      }

      if(typeof args.drawBackground != 'undefined') {
        drawBackground = args.drawBackground;
      }

      if(typeof args.drawPreviousFrame != 'undefined') {
        drawPreviousFrame = args.drawPreviousFrame;
      }

      if(typeof args.animatedTilesOnly != 'undefined') {
        animatedTilesOnly = args.animatedTilesOnly
      }

    }

    if(allCells) {
    }
    
    var frameCount = this.editor.graphic.getFrameCount();


    this.drawFrame({ frame: frame, 
                     canvas: this.canvas, 
                     context: this.context, 
                     allCells: allCells,
                     drawBackground: drawBackground,
                     drawPreviousFrame: drawPreviousFrame,
                     animatedTilesOnly: animatedTilesOnly });

  }

}
