var g_newSystem = true;

var GridView2d = function() {
  this.editor = null;
  this.uiComponent = null;
  this.camera = null;

  this.canvas = null;
  this.context = null;

  this.backBufferCanvas = null;
  this.backBufferContext = null;
  //this.previousFrameCanvas = null;

  // checkerboard pattern
  this.backgroundCanvas = null;

  this.view = '2d front';
  this.left = 0;
  this.top = 0;
  this.width = 0;
  this.height = 0;
  this.scale = 1;

  this.vScroll = false;
  this.vScrollBarWidth = styles.ui.scrollbarWidth;
  this.vScrollBarHeight = 0;
  this.vScrollBarPosition = null;
  this.vScrollBarPositionMin = 0;
  this.vScrollBarPositionMax = 0;
  this.vScrollBarPositionMouseOffset = 0;

//  this.hScrollBar = null;
  this.hScroll = false;
  this.hScrollBarHeight = styles.ui.scrollbarWidth;
  this.hScrollBarWidth = 0;
  this.hScrollBarPosition = null;
  this.hScrollBarPositionMin = 0;
  this.hScrollBarPositionMax = 0;
  this.hScrollBarPositionMouseOffset = 0;

  this.vPadding = 200;
  this.hPadding = 200;

  this.lastBlinkTime = 0;
  this.typingCursorBlink = false;
  this.lastSelectAnimate = 0;

  this.foundCell = {x: 0, y: 0, z: 0};

  this.previousScreen = null;
  this.previousScreenFrame = false;

  this.mouseInCanvas = false;

  this.pan = false;

  this.shiftLineDirection = false;

  this.mouseIsDown = false;


  this.zoomDownX = false;
  this.zoomDownY = false;

  this.zoomMouseX = false;
  this.zoomMouseY = false;


  this.buttons = 0;
  
  // extra check for left mousebutton
  this.leftMouseUp = true;


  // should the cursor be drawn
  this.cursorVisible = false;
  this.cursorBoxVisible = true;

  // bounds of displayed characters
  this.minCharX = 0;
  this.maxCharX = 0;
  this.minCharY = 0;
  this.maxCharY = 0;

  this.mousePageX = 0;
  this.mousePageY = 0;

  this.lastTouchEnded = true;
  this.touchMoved = false;
  this.touchZoom = false;
  this.touchCellDrawn = false;

  this.mouseOverHControl1 = false;
  this.mouseOverHControl2 = false;
  this.mouseDownOnHControl = false;

  this.mouseOverVControl1 = false;
  this.mouseOverVControl2 = false;
  this.mouseDownOnVControl = false;

  this.displayScale = 1;
}

GridView2d.prototype = {
  init: function(editor, uiComponent) {
    this.editor = editor;
    this.uiComponent = uiComponent;

    var _this = this;

    UI.on('ready', function() {
      _this.setupEvents();
    });

    uiComponent.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);
    });

    this.uiComponent.on('keydown', function(event) {

      _this.keyDown(event);
    });

    this.uiComponent.on('keyup', function(event) {
      _this.keyUp(event);
    }); 

    UI.on('focus', function(event) {
      _this.focus(event);

    });

    UI.on('blur', function(event) {
      _this.blur(event);
    });


    this.camera = {};
    this.camera.position = {
      x: 0,
      y: 0
    };

    this.previousScreen = new Grid2d();
    this.previousScreen.init(this.editor);    
  },

  setupEvents: function() {
    var _this = this;

    this.canvas = this.uiComponent.getCanvas();

    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);


    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);
/*
    this.canvas.addEventListener('mousewheel', function(event) {      
      event.preventDefault();
    }, false);
*/
    this.canvas.addEventListener('contextmenu', function(event) {
      _this.contextMenu(event);
    }, false);



    this.canvas.addEventListener("touchstart", function(event){
      _this.touchStart(event);

    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      _this.touchMove(event);
      return false;
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      _this.touchEnd(event);

      /*
      _this.pan = false;
      if(event.touches.length == 1) {
        _this.mouseUp(event.touches[0]);
        event.preventDefault();
      }
      */
    }, false);


    this.canvas.addEventListener('mouseleave', function(event) {
      _this.mouseLeave(event);
      _this.mouseInCanvas = false;

    }, false);

    this.canvas.addEventListener('mouseenter', function(event) {
      _this.mouseEnter(event);
      _this.mouseInCanvas = true;
    }, false);

    this.canvas.addEventListener("webglcontextlost", function(event) {
      console.log("CONTEXT LOST!!!!!!");
      event.preventDefault();
    }, false);


    this.canvas.addEventListener(
      "webglcontextrestored", function(event) {
        console.log("CONTEXT RESTORED!!!!!");
      }, false);

  },

  xyToCellPercent: function(x, y) {
//    var srcCanvas = this.editor.grid.grid2d.canvas;

    var scale = this.displayScale;
    var cell = this.xyToCell(x, y);
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();
    

   // reverseY y = this.height - y;    
    var result = {};
    result.x = x - (this.width / (2 ) - layerWidth * scale / 2 - this.camera.position.x * scale);
//    result.y = y = y - (this.height / (2) - srcCanvas.height * this.scale / 2 - this.camera.position.y * this.scale);
    result.y = y - (this.height / (2) - layerHeight * scale / 2 + this.camera.position.y * scale);

    result.x = (result.x / scale) - cell.x * cellWidth;
    result.y = (result.y / scale) - cell.y * cellHeight;

    return result;
  },

  xyToPixel: function(x, y) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }

    var scale = this.displayScale;

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

//    var srcCanvas = this.editor.grid.grid2d.canvas;

   // reverseY y = this.height - y;    
    var result = {};
    result.x = x - (this.width / (2 ) - layerWidth * scale / 2 - this.camera.position.x * scale);
//    result.y = y = y - (this.height / (2) - srcCanvas.height * this.scale / 2 - this.camera.position.y * this.scale);
    result.y = y - (this.height / (2) - layerHeight * scale / 2 + this.camera.position.y * scale);

    result.x = Math.floor(result.x / scale);
    result.y = Math.floor(result.y / scale);


    return result;

  },

  xToGridX: function(x) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }
    var scale = this.displayScale;

    var layerWidth = layer.getWidth();

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    
    var tileWidth = tileSet.getTileWidth();

//    x += this.scale * tileWidth / 2;
    x = x - (this.width / (2 ) 
            - layerWidth * scale / 2 
            - this.camera.position.x * scale);


    var charX = Math.round(x / (scale * tileWidth));
    return charX;
  },

  yToGridY: function(y) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }
    var scale = this.displayScale;

    var layerHeight = layer.getHeight();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }
    var cellHeight = layer.getCellHeight();

    y = y - (this.height / (2) - layerHeight * scale / 2 + this.camera.position.y * scale);

//    var cellX = Math.floor(x / (this.scale * cellWidth));
    return Math.round(y / (scale * cellHeight));

    
  },



  xyToCell: function(x, y, getPixel) {
    var scale = this.displayScale;

    var doGetPixel = false;
    if(typeof getPixel !== 'undefined') {
      doGetPixel = getPixel;
    }

    //var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    //var srcCanvas = this.editor.grid.grid2d.canvas;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


//  reverseY  y = this.height - y;
    x = x - (this.width / (2 ) - layerWidth * scale / 2 - this.camera.position.x * scale);
    y = y - (this.height / (2) - layerHeight * scale / 2 + this.camera.position.y * scale);

    var cellX = Math.floor(x / (scale * cellWidth));
    var cellY = Math.floor(y / (scale * cellHeight));
    //var charZ = this.editor.grid.getXYGridPosition();


    this.foundCell.x = cellX;
    this.foundCell.y = cellY;
    this.foundCell.z = 0;//charZ;

    if(getPixel) {
      this.foundCell.pixelX = Math.floor((x / scale) % (cellWidth));
//      this.foundCell.pixelY = cellHeight - 1 - Math.floor((y / this.scale) % (cellHeight));
      this.foundCell.pixelY =  Math.floor((y / scale) % (cellHeight));
    }

    if(cellX < 0 || cellX >= gridWidth
       || cellX < 0 || cellY >= gridHeight) {
      return false;
    }

    return this.foundCell;
  },


  xyToCellPixel: function(x, y, hPixels, vPixels) {
// reverseY   y = this.height - y;
    this.scale = this.displayScale;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer) {
      return;
    }


    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

//    var srcCanvas = this.editor.grid.grid2d.canvas;

    x = x - (this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale);
    y = y - (this.height / 2 - layerHeight * scale / 2 - this.camera.position.y * scale);

    var pixelX = Math.floor(x / scale) % cellWidth;
    var pixelY = Math.floor(y / scale) % cellHeight;

    var pixelWidth = cellWidth / hPixels;
    var pixelHeight = cellHeight / vPixels;

    pixelX = Math.floor(pixelX / pixelWidth);

    if(cellHeight == 20 && vPixels == 3) {
      // teletext
      if(pixelY < 6) {
        pixelY = 0;
      } else if(pixelY < 14) {
        pixelY = 1;
      } else {
        pixelY = 2;
      }
    } else {
      pixelY = Math.floor(pixelY / pixelHeight);
    }

    var z = 0;//this.editor.grid.getXYGridPosition();


    return { x: pixelX, y: pixelY, z: z };
  },


  xyToCharPixel: function(x, y, hPixels, vPixels) {
    var scale = this.displayScale;
// reverseY   y = this.height - y;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var srcCanvas = this.editor.grid.grid2d.canvas;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer) {
      return;
    }

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


    x = x - (this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale);
    y = y - (this.height / 2 - layerHeight * scale / 2 + this.camera.position.y * scale);

    var pixelX = Math.floor(x / scale) % tileSet.charWidth;
    var pixelY = Math.floor(y / scale) % tileSet.charHeight;

    var pixelWidth = tileSet.charWidth / hPixels;
    var pixelHeight = tileSet.charHeight / vPixels;

    pixelX = Math.floor(pixelX / pixelWidth);

    if(tileSet.charHeight == 20 && vPixels == 3) {
      // teletext
      if(pixelY < 6) {
        pixelY = 0;
      } else if(pixelY < 14) {
        pixelY = 1;
      } else {
        pixelY = 2;
      }
    } else {
      pixelY = Math.floor(pixelY / pixelHeight);
    }

    var z = 0;// this.editor.grid.getXYGridPosition();


    return { x: pixelX, y: pixelY, z: z };
  },



  mouseDownVScroll: function(button, x, y) {
    y = this.height - y;
    this.mouseDownAtY = y;
    this.mouseDownAtScrollY = this.scrollY;

    if(y < this.vScrollBarPosition) {
      this.setYScroll(this.scrollY - 20);
    } else if(y > this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY + 20);
    } else {
      this.vScroll = true;
    }
  },

  mouseDownHScroll: function(button, x, y) {
    this.mouseDownAtX = x;
    this.mouseDownAtScrollX = this.scrollX;

    if(x < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 20);
    } else if(x > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 20);
    } else {
      this.hScroll = true;
    }
  },

  contextMenu: function(event) {


//    var x = event.pageX;
//    var y = event.pageY;
    event.preventDefault();
//    event.stopPropagation();
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer == null || layer.getType() != 'grid') {
      return;
    }

    if(event.shiftKey) {
      this.showColorPicker();
    } else {
      this.editor.gridView2d.showCharacterPicker();
    }
    return;



    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;


    var tile = 0;
    var color = 0;
    var cell = this.xyToCell(x, y);
    if(cell) {
      var cellData = layer.getCell({ x: cell.x, y: cell.y });

      tile = cellData.t;
      color = cellData.fc;
    }      
    var _this = this;
    this.editor.tools.drawTools.showPopup(x, y, tile, color, function() {
      _this.setMouseCursor();
    });
    return;

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
  },

  setLastCursorLocation: function(args) {
    this.lastCursorX = args.x;
    this.lastCursorY = args.y;
    this.lastCursorZ = args.z;
  },


  toolStart: function(cell, x, y, event) {

    var drawTools = this.editor.tools.drawTools;

    var tool = drawTools.tool;
    var grid2d = this.editor.grid.grid2d;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.editor.layers.getSelectedLayerType() != 'grid') {
      grid2d.setCursorEnabled(false);      
      UI.setCursor('not-allowed');
      return;
    }


    var moveKey = event.metaKey || event.ctrlKey;
    if(moveKey) {
      if(tool !== 'select') {
        tool = 'hand';
      }
    }

    
    if(tool == 'pixel') {
      drawTools.pixelDraw.mouseDown(this, event, x, y);
      return;
    }

    if(tool == 'charpixel') {
      if(drawTools.mirrorH) {
        tileSet.buildHFlipMap();
      }
      if(drawTools.mirrorV) {
        tileSet.buildVFlipMap();
      }

      drawTools.pixelCharacterDraw.mouseDown(this, x, y);
      return;
    }

    if(tool == 'linesegment') {
      if(drawTools.mirrorH) {
        tileSet.buildHFlipMap();
      }
      if(drawTools.mirrorV) {
        tileSet.buildVFlipMap();
      }      
      drawTools.lineSegmentDraw.mouseDown(this, x, y);
      return;
    }

    if(tool == 'invert') {
      drawTools.invertTool.mouseDown(this, x, y);
      return;
    }

    if(tool == 'corners') {
      drawTools.cornersTool.mouseDown(this, x, y);
      return;
    }


    if(tool == 'select') {
      drawTools.select.mouseDown(this, event);
      return;
    }

    if(tool == 'pixelselect' || tool == 'pixelmove') {
      drawTools.pixelSelect.mouseDown(this, event);
    }

    if(tool == 'move') {
      drawTools.select.mouseDown(this, event);        
    }
    if(tool == 'hand' || tool == 'pixelhand') {
      this.pan = true;
      UI.setCursor('drag-scroll')
    }


    if(cell === false) {
      return;
    }


    grid2d.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
    grid2d.setCursorEnabled(true);      


    if(typeof event.altKey != 'undefined' && event.altKey) {
      grid2d.eyedropperCursorCell();    
      return;
    }


    if(drawTools.mirrorH) {
      tileSet.buildHFlipMap();
    }
    if(drawTools.mirrorV) {
      tileSet.buildVFlipMap();
    }

    this.editor.history.startEntry('draw');
    this.editor.history.addAction('cursorLocation', { x: this.lastCursorX, y: this.lastCursorY, z: cell.z });

    switch(tool) {
      case 'pen':
      case 'block':
        this.shiftLineDirection = false;

        if(typeof event != 'undefined' && typeof event.shiftKey != 'undefined' && event.shiftKey) {
            var fromX = this.lastCursorX;
            var fromY = this.lastCursorY;
            var toX = cell.x;
            var toY = cell.y;
            this.drawLineWithCursor(fromX, fromY, toX, toY, cell.z);
        } else {


          grid2d.setCursorCells();

          if(drawTools.drawCharacter) {
            this.editor.currentTile.addToRecentCharacters();
          }

          if(drawTools.drawColor) {
            this.editor.currentTile.addToRecentColors();
          }
        }

        this.lastCursorX = cell.x;
        this.lastCursorY = cell.y;
        this.mouseDownCursorX = cell.x;
        this.mouseDownCursorY = cell.y;


        break;
      case 'erase':
        grid2d.eraseCursorCells();
        break;
      case 'eyedropper':

        grid2d.eyedropperCursorCell();
        this.editor.tools.drawTools.setDrawTool('pen');
        
        break;
      case 'line':
      case 'rect':
      case 'oval':
        drawTools.shapes.startShape(drawTools.tool, this.foundCell.x, this.foundCell.y, this.foundCell.z, 'xy', event.shiftKey);
        if(drawTools.drawCharacter) {
          this.editor.currentTile.addToRecentCharacters();
        }
        if(drawTools.drawColor) {
          this.editor.currentTile.addToRecentColors();
        }
        break;
      case 'fill':
        var contiguous = $('#contiguousFill').is(':checked');

        if(contiguous) {
          drawTools.fill.floodFill(cell.x, cell.y);
        } else {
          drawTools.fill.nonContiguousFill(cell.x, cell.y);
        }
        if(drawTools.drawCharacter) {
          this.editor.currentTile.addToRecentCharacters();
        }
        if(drawTools.drawColor) {
          this.editor.currentTile.addToRecentColors();
        }

        break;
      case 'type':
        //this.editor.grid.setTypingCursorPosition();
        drawTools.typing.setCursorPosition(grid2d.cursor.position);
      break;
      case 'hand':
      case 'pixelhand':
        this.pan = true;
      break;
      case 'zoom':
      case 'pixelzoom':
        if(!event.metaKey) {
          this.zoomMouseDown = true;
          if(cell !== false) {
            this.zoomDownX = cell.x;
            this.zoomDownY = cell.y;

            this.zoomMouseX = cell.x;
            this.zoomMouseY = cell.y;

          } else {
            this.zoomDownX = false;
            this.zoomDownY = false;

            this.zoomMouseX = false;
            this.zoomMouseY = false;
          }

        }
      break;

    }

    this.lastX = cell.x;
    this.lastY = cell.y;
    this.lastZ = cell.z;
  },


  toolMove: function(cell, x, y, event) {
    var drawTools = this.editor.tools.drawTools;
    var currentTool = drawTools.tool;
    var grid2d = this.editor.grid.grid2d;

    switch(currentTool) {
      case 'pixel':
        grid2d.setCursorEnabled(false);
        UI.setCursor('pixel');
        drawTools.pixelDraw.mouseMove(this, event, x, y);      
        return;
      break;

      
      case 'charpixel':
        drawTools.pixelCharacterDraw.mouseMove(this, x, y);
        return;
      break;

      case 'linesegment':
        drawTools.lineSegmentDraw.mouseMove(this, x, y);
        return;
        break;

      case 'invert':
        drawTools.invertTool.mouseMove(this, x, y);
        return;
        break;

      case 'corners':
        drawTools.cornersTool.mouseMove(this, x, y);
        return;
        break;


      case 'select':
        drawTools.select.mouseMove(this, event);
        return;
      break;
      case 'pixelselect':
      case 'pixelmove':
        drawTools.pixelSelect.mouseMove(this, event);  
      break;

      case 'move':
        drawTools.select.mouseMove(this, event);
        return;
      break;
    }

    var tool = drawTools.tool;
    var hasCursor = true;

    // dont want to show the cursor if alt key is down with pen tool
    if( (tool === 'pen' || tool === 'block') ) {
      if(typeof event.altKey != 'undefined' && event.altKey) {
        hasCursor = false;
      }
    }


    if(cell !== false && hasCursor) {

//      this.editor.grid.setCursorPosition(cell.x, cell.y, cell.z);
      grid2d.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
      grid2d.setCursorEnabled(true);      
    } else {
      grid2d.setCursorEnabled(false);
    }


    if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {

      switch(tool) {
        case 'pen':
        case 'block':
          if(typeof event.altKey != 'undefined' && event.altKey) {
            grid2d.eyedropperCursorCell();
          } else {

            if(cell !== false) {
              if(this.lastCursorX !== false && this.lastCursorY !== false) {
                var fromX = this.lastCursorX;
                var fromY = this.lastCursorY;
                var toX = cell.x;
                var toY = cell.y;

                if(event.shiftKey) {
                  if(this.shiftLineDirection === false) {
                    var diffX = this.mouseDownCursorX - cell.x;
                    if(diffX < 0) {
                      diffX = -diffX;
                    }
                    var diffY = this.mouseDownCursorY - cell.y;
                    if(diffY < 0) {
                      diffY = -diffY;
                    }

                    if(diffX > diffY) {
                      this.shiftLineDirection = 'horizontal';
                    } else if(diffY > diffX) {
                      this.shiftLineDirection = 'vertical';
                    }
                  }


                  if(this.shiftLineDirection == 'vertical') {
                    fromX = this.mouseDownCursorX;
                    toX = this.mouseDownCursorX;
                  } else {
                    fromY = this.mouseDownCursorY;
                    toY = this.mouseDownCursorY;
                  }

  //                  cell.x = toX;
  //                  cell.y = toY;

                }

                this.drawLineWithCursor(fromX, fromY, toX, toY, cell.z);
                this.lastCursorX = toX;
                this.lastCursorY = toY;


              } else {
                grid2d.setCursorCells();
                this.lastCursorX = cell.x;
                this.lastCursorY = cell.y;
              }

            } else {
              this.lastCursorX = false;
              this.lastCursorY = false;
            }

          }
          break;
        case 'erase':
          grid2d.eraseCursorCells();
          break;
        case 'eyedropper':
          grid2d.eyedropperCursorCell();
          break;
        case 'line':
        case 'rect':
        case 'oval':
          drawTools.shapes.setShapeTo(this.foundCell.x, this.foundCell.y, this.foundCell.z);
          break;
        case 'zoom':
        case 'pixelzoom':
          if(cell !== false) {
            if(this.zoomDownX !== false && this.zoomDownY !== false) {
              this.zoomMouseX = cell.x;
              this.zoomMouseY = cell.y;            
            }
          }
        break;
      }

      if(cell) {
        this.lastX = cell.x;
        this.lastY = cell.y;
        this.lastZ = cell.z;
      }    
    }

  },


  toolEnd: function(cell, event) {
    var drawTools = this.editor.tools.drawTools;

    var blockModeEnabled = false;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      blockModeEnabled = layer.getBlockModeEnabled();
    }

    switch(drawTools.tool) {
      case 'pen':
        if(blockModeEnabled) {
          this.editor.graphic.invalidateAllCells();
          this.editor.graphic.redraw({ allCells: true});
        }      
      break;
      case 'line':
      case 'rect':
      case 'oval':
        drawTools.shapes.endShape();
        if(blockModeEnabled) {
          this.editor.graphic.invalidateAllCells();
        }
      break;
      case 'select':
        drawTools.select.mouseUp(this, event);
      break;
      case 'pixelselect':
      case 'pixelmove':

        drawTools.pixelSelect.mouseUp(this, event);  
      break;

      case 'move':
        drawTools.select.mouseUp(this, event);
        if(blockModeEnabled) {
          this.editor.graphic.invalidateAllCells();
        }

      break;

      case 'pixel':
        this.editor.graphic.invalidateAllCells();
        drawTools.pixelDraw.mouseUp(this, event);//, x, y);

      break;

      case 'zoom':
      case 'pixelzoom':
        if(this.zoomMouseDown) {
          if(this.zoomDownX !== false && this.zoomDownY !== false
              && this.zoomDownX !== this.zoomMouseX && this.zoomDownY != this.zoomMouseY) {
            this.fitOnScreen({
              minX: this.zoomDownX,
              minY: this.zoomDownY,
              maxX: this.zoomMouseX,
              maxY: this.zoomMouseY
            });


          } else {
            var zoomAmount = 1;
            if(this.editor.getEditorMode() == 'pixel') {
              zoomAmount = 3;
            }

            if(typeof event.altKey != 'undefined' && event.altKey) {
              this.zoom(-zoomAmount);
            } else {

              this.zoomToXY(this.mouseDownAtX, this.mouseDownAtY, zoomAmount);
            }
          }

          this.zoomDownX = false;
          this.zoomDownY = false;
          this.zoomMouseX = false;
          this.zoomMouseY = false;
        }

      break;

    }

    if(this.editor.layers.getSelectedLayerType() != 'grid') {
      grid2d.setCursorEnabled(false);      
      UI.setCursor('not-allowed');
//      return;
    } else {
      this.setMouseCursor(event);
    }

    this.zoomMouseDown = false;

    this.hScroll = false;
    this.vScroll = false;

    this.shiftLineDirection = false;
    this.editor.history.endEntry();
    this.lastX = false;
    this.lastY = false;
    this.lastZ = false;

    this.pan = false;

//    this.lastCursorX = false;
//    this.lastCursorY = false;

    this.editor.layers.updateLayerPreview();
  },

  
  touchStart: function(event) {
    event.preventDefault();

    var touches = event.touches;
    var drawTools = this.editor.tools.drawTools;
 
    if(touches.length == 2) {

      this.touchCount = 2;

      if(!this.lastTouchEnded && !this.touchMoved) {
  
        // last single touch hasn't ended, need to undo
        if(this.touchCellDrawn) {
          this.editor.history.endEntry();
          this.editor.history.undo();
          this.touchZoom = true;
        }
      }

      // start a pinch or span?
      this.touchStart0X = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      this.touchStart0Y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      this.touchStart1X = touches[1].pageX - $('#' + this.canvas.id).offset().left;
      this.touchStart1Y = touches[1].pageY - $('#' + this.canvas.id).offset().top;

      this.touchStartDistance =   (this.touchStart0X - this.touchStart1X) * (this.touchStart0X - this.touchStart1X)
                                + (this.touchStart0Y - this.touchStart1Y) * (this.touchStart0Y - this.touchStart1Y);
      this.touchStartDistance = Math.sqrt(this.touchStartDistance);

      this.touchStartMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchStartMidY = (this.touchStart0Y + this.touchStart1Y) / 2;
      this.touchMoveMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchMoveMidY = (this.touchStart0Y + this.touchStart1Y) / 2;

      //this.pinchStartScale = this.scale;      
      this.pinchStartScale = this.displayScale;      

    }

    if(touches.length == 1) {
  
      this.touchCount = 1;
      this.lastTouchEnded = false;
      this.touchCellDrawn = false;
      this.touchMoved = false;
      this.touchZoom = false;

      this.touchStartCellX = false;
      this.touchStartCellY = false;

      var x = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      var y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      this.buttons = UI.LEFTMOUSEBUTTON;

      this.lastMouseX = x;
      this.lastMouseY = y;

      this.mouseDownAtX = x;
      this.mouseDownAtY = y;

      this.mouseDownCameraX = this.camera.position.x;
      this.mouseDownCameraY = this.camera.position.y;

      if(drawTools.tool == 'hand' || drawTools.tool == 'pixelhand') {
        this.pan = true;
      }


      var cell = this.xyToCell(x, y);

      if(cell !== false) {
        // if a cell is drawn, might need to undo if this was the start of a pinch
        this.touchCellDrawn = true;
        this.touchStartCellX = cell.x;
        this.touchStartCellY = cell.y;
      }

      this.toolStart(cell, x, y, event.touches[0]);

    }
  },

  touchMove: function(event) {
    event.preventDefault();

    var touches = event.touches;
    var grid2d = this.editor.grid.grid2d;
    var graphic = this.editor.graphic;
    var graphicWidth = graphic.getGraphicWidth();
    var graphicHeight = graphic.getGraphicHeight();


    if(touches.length == 1) {
      if(this.touchZoom) {
        // dont want to draw anything until zoom is over
        return;
      }
      var x = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      var y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      this.mousePageX = event.pageX;
      this.mousePageY = event.pageY;


      this.buttons = UI.LEFTMOUSEBUTTON;
      this.leftMouseUp = false;


      if(this.pan) {
        // middle mouse
        var cameraPosX = this.mouseDownCameraX - (x - this.mouseDownAtX) / this.scale;
        var cameraPosY = this.mouseDownCameraY - ( (- y) + this.mouseDownAtY) / this.scale;

        this.setCameraPosition(cameraPosX, cameraPosY);
        return;
      }

      var cell = this.xyToCell(x, y);
      if(cell === false) {
//        return;
      }

      // has moved from cell where touch started?
      if(cell === false || cell.x !== this.touchStartCellX || cell.y !== this.touchStartCellY) {
        this.touchMoved = true;
      }

      if(cell !== false) {
        //this.editor.grid.setCursorPosition(cell.x, cell.y, cell.z);
        grid2d.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
        grid2d.setCursorEnabled(true);      
      }

      this.toolMove(cell, x, y, touches[0]);
    }

    if(touches.length == 2) {

      if(this.touchStartDistance < 80) {
        // havent passed the threshold yet
        this.touchStart0X = touches[0].pageX - $('#' + this.canvas.id).offset().left;
        this.touchStart0Y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

        this.touchStart1X = touches[1].pageX - $('#' + this.canvas.id).offset().left;
        this.touchStart1Y = touches[1].pageY - $('#' + this.canvas.id).offset().top;

        this.touchStartDistance =   (this.touchStart0X - this.touchStart1X) * (this.touchStart0X - this.touchStart1X)
                                  + (this.touchStart0Y - this.touchStart1Y) * (this.touchStart0Y - this.touchStart1Y);
        this.touchStartDistance = Math.sqrt(this.touchStartDistance);

        this.touchStartMidX = (this.touchStart0X + this.touchStart1X) / 2;
        this.touchStartMidY = (this.touchStart0Y + this.touchStart1Y) / 2;
        this.touchMoveMidX = (this.touchStart0X + this.touchStart1X) / 2;
        this.touchMoveMidY = (this.touchStart0Y + this.touchStart1Y) / 2;

//        this.pinchStartScale = this.scale;      
        this.pinchStartScale = this.displayScale;      


      } else {
        this.touchMove0X = touches[0].pageX - $('#' + this.canvas.id).offset().left;
        this.touchMove0Y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

        this.touchMove1X = touches[1].pageX - $('#' + this.canvas.id).offset().left;
        this.touchMove1Y = touches[1].pageY - $('#' + this.canvas.id).offset().top;

        this.touchMoveDistance =   (this.touchMove0X - this.touchMove1X) * (this.touchMove0X - this.touchMove1X)
                                  + (this.touchMove0Y - this.touchMove1Y) * (this.touchMove0Y - this.touchMove1Y);
        this.touchMoveDistance = Math.sqrt(this.touchMoveDistance);


        var midX = (this.touchMove0X + this.touchMove1X) / 2;
        var midY = (this.touchMove0Y + this.touchMove1Y) / 2;

        var diffX = midX - this.touchMoveMidX;
        var diffY = midY - this.touchMoveMidY;

        this.touchMoveMidX = (this.touchMove0X + this.touchMove1X) / 2;
        this.touchMoveMidY = (this.touchMove0Y + this.touchMove1Y) / 2;



        //var srcCanvas = this.editor.grid.grid2d.canvas;

        var scale = this.displayScale;
        var zoomX = this.touchMoveMidX / scale - this.width / (2 * scale) + graphicWidth / 2 
                  + this.camera.position.x - diffX / scale;

        var zoomY = this.height / scale - this.touchMoveMidY / scale - 
                  this.height / (2 * scale) + graphicHeight  / 2 + this.camera.position.y
                  + diffY / scale;

        var newScale = (this.touchMoveDistance / this.touchStartDistance) * this.pinchStartScale;
        this.setScale(newScale);

        scale = this.displayScale;
        var cameraPosX = zoomX - this.touchMoveMidX / scale + this.width / (2 * scale) - graphicWidth / 2;
        var cameraPosY = zoomY - this.height / scale + this.touchMoveMidY / scale + this.height / (2 * scale) - graphicHeight / 2

        this.setCameraPosition(cameraPosX, cameraPosY);
      }
    }

  },

  touchEnd: function(event) {
    event.preventDefault();
    var drawTools = this.editor.tools.drawTools;
    this.lastTouchEnded = true;
    var touches = event.changedTouches;

    this.pan = false;

    var cell = false;

    this.scale = this.displayScale;


    if(touches.length == 1) {
      // touches will equal zero if touch end of one touch
      var x = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      var y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      cell = this.xyToCell(x, y);
      event = touches[0];
    }

    var tool = drawTools.tool;
    if(this.touchCount == 2 && (tool == 'oval' || tool == 'rect' || tool == 'line')) {
      // doing a pinch, so dont want to draw a shape
      drawTools.shapes.cancelShape();
    } else {
      this.toolEnd(cell, event);
    }

    if(UI.isMobile.any()) {
      g_app.autosave();
    }
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

      UI.captureMouse(this);
      this.mouseIsDown = true;
    }

    this.lastMouseX = x;
    this.lastMouseY = y;

    this.mouseDownAtX = x;
    this.mouseDownAtY = y;

    if(this.pan) {
      // user started a touch pan
      return;
    }

    if(this.mouseOverHControl1 || this.mouseOverHControl2) {
      this.mouseDownOnHControl = true;
      return;
    }

    if(this.mouseOverVControl1 || this.mouseOverVControl2) {
      this.mouseDownOnVControl = true;
      return;
    }

    this.mouseDownCameraX = this.camera.position.x;
    this.mouseDownCameraY = this.camera.position.y;

    // is mouse in scrollbar?
    if(x > this.width - this.vScrollBarWidth) {

      return this.mouseDownVScroll(button, x, this.height - y);
    } else if((this.height - y) < this.hScrollBarHeight) {
      return this.mouseDownHScroll(button, x, y);
    }



    this.setMouseCursor(event);

    if(this.buttons & UI.LEFTMOUSEBUTTON) {


      var cell = this.xyToCell(x, y);



      this.toolStart(cell, x, y, event);

    }

  },

  mouseMoveVScroll: function(x, y) {
    y = this.height - y;

    var scale = this.vScrollBarHeight / (this.srcHeight);
    var diffY = (y - this.mouseDownAtY) / scale;

    this.setYScroll(this.mouseDownAtScrollY + diffY);
  },

  mouseMoveHScroll: function(x, y) {
    var scale = this.hScrollBarWidth / (this.srcWidth);
    var diffX = (x - this.mouseDownAtX) / scale;
    this.setXScroll(this.mouseDownAtScrollX + diffX);
  },
/*
  selectToolKeypress: function(event) {
    var selectTool = this.editor.tools.drawTools.select;

    var moveKey = event.metaKey || event.ctrlKey;
    var args = { moveCut: moveKey, moveCopy: event.altKey };

    switch(event.keyCode) {
      case UI.DELETEKEY:
      case UI.BACKSPACEKEY:
        this.editor.tools.drawTools.select.clear();
      break;      
      case UI.UPARROWKEY:
        selectTool.nudgeSelection(0, 1, 0, args);
        event.preventDefault();
      break;
      case UI.DOWNARROWKEY:
        selectTool.nudgeSelection(0, -1, 0, args);
        event.preventDefault();
      break;
      case UI.RIGHTARROWKEY:
        selectTool.nudgeSelection(1, 0, 0, args);
        event.preventDefault();
      break;
      case UI.LEFTARROWKEY:
        selectTool.nudgeSelection(-1, 0, 0, args);
        event.preventDefault();
      break;
    }
  },

  screenMoveKeypress: function(event) {

    var selectTool = this.editor.tools.drawTools.select;

    var moveKey = event.metaKey || event.ctrlKey;
    var args = { moveCut: moveKey, moveCopy: event.altKey };

    if(!args.moveCut && !args.moveCopy) {
      return;
    }

    var nudgeX = 0;
    var nudgeY = 0;
    var nudgeZ = 0;

    switch(event.keyCode) {
      case UI.UPARROWKEY:
        nudgeY = 1;
      break;
      case UI.DOWNARROWKEY:
        nudgeY = -1;
      break;
      case UI.RIGHTARROWKEY:
        nudgeX = 1;
      break;
      case UI.LEFTARROWKEY:
        nudgeX = -1;
      break;
    }

    if(nudgeX != 0 || nudgeY != 0 || nudgeX != 0) {
      selectTool.selectAll();
      selectTool.nudgeSelection(nudgeX, nudgeY, nudgeZ, args);
      selectTool.unselectAll();
      event.preventDefault();
    }

  },
*/

  showCharacterPicker: function() {
    var _this = this;
    var args = {};

    args.mouseUp = function(event, selection) {

      _this.setButtons(event);

      if(event.button != UI.RIGHTMOUSEBUTTON && event.ctrlKey !== true) {
        _this.editor.setSelectedTiles(selection.grid);
        // switch tools if necessary
        _this.editor.tools.drawTools.tilePalette.tileChosen();
        UI.hidePopup();
      }

    }

    args.mode = 'grid';
    var x = this.mousePageX - 20;
    var y = this.mousePageY - 20;

    this.editor.tileSetManager.showCharacterPicker(x, y, args);

  },

  showColorPicker: function() {
    var _this = this;
    var args = {};
    args.colorPickedCallback = function(color) {
      _this.editor.currentTile.setColor(color);
    }

    var x = this.mousePageX - 20;
    var y = this.mousePageY - 2;
    args.type = 'cellcolor';
      
    args.currentColor = this.editor.currentTile.getColor();
    _this.editor.colorPaletteManager.showColorPicker(x, y, args);

  },

  focus: function(event) {
    this.editor.graphic.redraw({ allCells: true});    
    this.uiComponent.resize({ force: true});
  },

  blur: function(event) {
    if(UI.isMobile.any()) {
      g_app.autosave();
    }
  },

  keyDown: function(event) {

    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toUpperCase();

    this.setMouseCursor(event);
/*

    if(this.editor.tools.drawTools.tool != 'type') {
      switch(c) {
        case keys.textMode.showColorPicker.key:
          if(event.shiftKey) {
            this.showColorPicker();
          } else {
            this.showCharacterPicker();
          }
        break;
      }
    }

    if(this.shiftLineDirection === false) {
      if(this.lastX !== false && this.lastY !== false) {
      }

    }
    this.setMouseCursor(event);

//    if(this.editor.grid.selectionActive 
//    if(this.editor.grid.selection.visible && (this.editor.grid.selection.minX != this.editor.grid.selection.maxX || this.editor.grid.selection.minY != this.editor.grid.selection.maxY)) {
    if(this.editor.tools.drawTools.select.isActive())  {
      this.selectToolKeypress(event);
    } else {
      this.screenMoveKeypress(event);
    }
*/

  },

  keyUp: function(event) {
    this.setMouseCursor(event);
  },

  setMouseCursor: function(event) {

    // set the mouse cursor..
    if(this.buttons & UI.MIDDLEMOUSEBUTTON) {
      UI.setCursor('drag-scroll');
    } else if(false) {//typeof event != 'undefined' && event.metaKey) {
      // can grab to scroll
      if(this.mouseInCanvas) {
//        UI.setCursor('can-drag-scroll');
//        this.editor.grid.grid2d.setCursorEnabled(false);
      }
    } else {
      
      if(typeof event != 'undefined' && event.altKey  
        && this.editor.tools.drawTools.tool != 'type'
        && this.editor.tools.drawTools.tool != 'select') {
        this.editor.grid.grid2d.setCursorEnabled(false);
        UI.setCursor('eyedropper');
        return;
      }

      var tool = this.editor.tools.drawTools.tool;
      if(typeof event != 'undefined' && (event.metaKey || event.ctrlKey)) {
        if(tool !== 'select') {
          tool = 'hand';
        }
      }

      switch(tool) {
        case 'pen':
        case 'block':
        case 'invert':
          if(this.editor.grid.grid2d.getCursorEnabled()) { 
            if(typeof event != 'undefined' && event.altKey) {
              this.editor.grid.grid2d.setCursorEnabled(false);

              UI.setCursor('eyedropper');
            } else {
              UI.setCursor('draw');
            }
          } else {
            UI.setCursor('default');            
          }
          break;
        case 'erase':
          if(this.editor.grid.grid2d.getCursorEnabled()) { 
            UI.setCursor('erase');
          } else {
            UI.setCursor('default');
          }
          break;
        case 'fill':
          if(this.editor.grid.grid2d.getCursorEnabled()) { 
            UI.setCursor('fill');
          } else {
            UI.setCursor('default');            
          }
          break;
        case 'eyedropper':
          UI.setCursor('eyedropper');
          break;
        case 'line':
        case 'rect':
        case 'oval':
        case 'pixelselect':
          UI.setCursor('crosshair');
          break;
        break;
        case 'pixel':
        case 'charpixel':
        case 'linesegment':
        case 'corners':
          UI.setCursor('pixel');
          break;
        case 'type':
          UI.setCursor('text');
          break;
        case 'hand':
        case 'pixelhand':
          if(this.pan) {
            UI.setCursor('drag-scroll');
          } else {
            UI.setCursor('can-drag-scroll');
          }
          break;
        case 'zoom':
        case 'pixelzoom':
//          if(!event.metaKey) {
            UI.setCursor('zoom');
//          }
          break;
        case 'select':
          this.editor.tools.drawTools.select.setSelectCursor(event);
        break;
        case 'move':
        case 'pixelmove':

          if(this.editor.grid.grid2d.getCursorEnabled()) { 

            UI.setCursor('move');
          } else {
            UI.setCursor('default');
          }
          break;
      }
    }

  },


  drawLineWithCursor: function(fromX, fromY, toX, toY, z) {

    if(fromX == toX && fromY == toY) {
      return;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();
    


    // from x and y are already set
    var alreadySetX = fromX;
    var alreadySetY = fromY;

    var deltaX = toX - fromX;
    if(deltaX < 0) {
      deltaX = -deltaX; 
    }

    var deltaY = toY - fromY;
    if(deltaY < 0) {
      deltaY = -deltaY;
    }

    if(deltaX > deltaY) {

      if(fromX > toX) {
        var temp = toX;
        toX = fromX;
        fromX = temp;

        temp = toY;
        toY = fromY;
        fromY = temp;
      }


      for(var x = fromX; x <= toX; x++) {
        if(x >= 0 && x < gridWidth) {

          var y = Math.round(fromY + (toY - fromY) * (x - fromX) / (toX - fromX));        
          if(y >= 0 && y < gridHeight) {

            // from is already set..
            if(x != alreadySetX || y != alreadySetY)  {
              //this.editor.grid.setCursorPosition(x, y, z);
              this.editor.grid.grid2d.setCursor(x, y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
              this.editor.grid.grid2d.setCursorEnabled(true);      

              this.editor.grid.grid2d.setCursorCells({ update: false });

            }
          }
        }
      }

    } else {

      if(fromY > toY) {
        var temp = toY;
        toY = fromY;
        fromY = temp;

        temp = toX;
        toX = fromX;
        fromX = temp;

      }


      for(var y = fromY; y <= toY; y++) {

        if(y >= 0 && y < gridHeight) {
          var x = Math.round(fromX + (toX - fromX) * (y - fromY) / (toY - fromY));
          if(x >= 0 && x < gridWidth) {

            if(x != alreadySetX || y != alreadySetY)  {
//              this.editor.grid.setCursorPosition(x, y, z);

              this.editor.grid.grid2d.setCursor(x, y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
              this.editor.grid.grid2d.setCursorEnabled(true);      

              this.editor.grid.grid2d.setCursorCells({ update: false });              
            }            
          }

        }
      }
    }


    if(g_newSystem) {
      this.draw();
    } else {
      this.editor.grid.update();
    }
  },


  mouseMove: function(event) {

    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    this.mousePageX = event.pageX;
    this.mousePageY = event.pageY;


    if(!UI.isMobile.any()) {
      this.setButtons(event);
    }

    // currently horizontal scrolling?
    if(this.hScroll) {
      this.mouseMoveHScroll(x, y);
      return;
    }

    // currently vertically scrolling?
    if(this.vScroll) {
      this.mouseMoveVScroll(x, this.height - y);
      return;
    }

    // mouse in vscroll?
    if(x > this.width - this.vScrollBarWidth && x < this.width) {

      if(this.buttons == 0) {
        this.editor.grid.grid2d.setCursorEnabled(false);

        UI.setCursor('default');
        return;
      }
    }

    // mouse in h scroll?
    //if(y < this.hScrollBarHeight) {
    if((this.height - y) < this.hScrollBarHeight) {     
      if((this.buttons  == 0)) {

        this.editor.grid.grid2d.setCursorEnabled(false);
        UI.setCursor('default');
        return;
      }
    }
 
    //if(event.buttons)
    if(this.buttons == UI.MIDDLEMOUSEBUTTON || this.pan) {
      // middle mouse
      var cameraPosX = this.mouseDownCameraX - (x - this.mouseDownAtX) / this.scale;
      var cameraPosY = this.mouseDownCameraY - ( (- y) + this.mouseDownAtY) / this.scale;

      this.setCameraPosition(cameraPosX, cameraPosY);
      return;
    }

    if(this.editor.layers.getSelectedLayerType() != 'grid') {
      this.editor.grid.grid2d.setCursorEnabled(false);      
      UI.setCursor('not-allowed');
      return;
    }


    var gridWidth = 0;
    var gridHeight = 0;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() === 'grid') {
      gridWidth = layer.getGridWidth();
      gridHeight = layer.getGridHeight();
    }
    if(this.mouseDownOnHControl) {
      var gridX = this.xToGridX(x);
      if(gridX < 1) {
        gridX = 1;
      }
      if(gridX >= gridWidth) {
        gridX = gridWidth - 1;
      }
      this.editor.tools.drawTools.mirrorHX = gridX;
      return;
    } else {
      this.mouseOverHControl1 = false;
      this.mouseOverHControl2 = false;

      if(x >= this.mirrorHControlX && x < this.mirrorHControlX + this.mirrorHControlSize) {
        if(y >= this.mirrorHControl1Y && y < this.mirrorHControl1Y + this.mirrorHControlSize) {
          UI.setCursor('ew-resize');
          this.mouseOverHControl1 = true;
          return;
        } else if(y >= this.mirrorHControl2Y && y < this.mirrorHControl2Y + this.mirrorHControlSize) {
          UI.setCursor('ew-resize');
          this.mouseOverHControl2 = true;
          return;        
        }
      }
    }


    if(this.mouseDownOnVControl) {
      var gridY = this.yToGridY(y);
      if(gridY < 1) {
        gridY = 1;
      }
      if(gridY >= gridHeight) {
        gridY = gridHeight - 1;
      }
      this.editor.tools.drawTools.mirrorVY = gridY;
      return;
    } else {
      this.mouseOverVControl1 = false;
      this.mouseOverVControl2 = false;

      if(y >= this.mirrorVControlY && y < this.mirrorVControlY + this.mirrorVControlSize) {
        if(x >= this.mirrorVControl1X && x < this.mirrorVControl1X + this.mirrorVControlSize) {
          UI.setCursor('ns-resize');
          this.mouseOverVControl1 = true;
          return;
        } else if(x >= this.mirrorVControl2X && x < this.mirrorVControl2X + this.mirrorVControlSize) {
          UI.setCursor('ns-resize');
          this.mouseOverVControl2 = true;
          return;        
        }
      }
    }



    var layer = this.editor.layers.getSelectedLayerObject();

    var cell = this.xyToCell(x, y);
    if(cell.y < 0) {
      cell = false;
    }

//    console.log(cell);


    if(cell !== false) {


      if(layer) {
        var cellData = layer.getCell(cell);

        if(cellData !== false) {

          if(layer.getType() == 'grid' && layer.getBlockModeEnabled()) {
            this.editor.info.setBlock(cellData.b);
          }
          
          this.editor.info.setCharacter(cellData.t);
          this.editor.info.setFGColor(cellData.fc);
          this.editor.info.setBGColor(cellData.bc);
          this.editor.info.setCoordinates(cell.x, cell.y, cell.z);

          // set info here if its not a sprite, if sprite, set it in pixelDraw.js
          if(this.editor.graphic.getType() != 'sprite') {
            this.editor.gridInfo.setInfo(cell.x, cell.y, cell.z, cellData.t, cellData.fc, cellData.bc);
          } 

          if(this.editor.tools.drawTools.tool == 'eyedropper' || event.altKey) {   
            
            this.editor.tools.drawTools.tilePalette.setHighlightCharacter(cellData.t);
            this.editor.tools.drawTools.tilePalette.drawTilePalette();

            this.editor.sideTilePalette.setHighlightCharacter(cellData.t);
            this.editor.sideTilePalette.drawTilePalette();

            

          }
        }
      }
    } else {
      this.editor.info.leaveGrid();
    }

    if(this.buttons == 0) {
      this.setMouseCursor(event); 
    }

    this.toolMove(cell, x, y, event);

  },

  mouseUp: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    this.mouseIsDown = false;
    this.mouseDownOnHControl = false;
    this.mouseDownOnVControl = false;

    if(!UI.isMobile.any()) {
      this.setButtons(event);
    } else {
      this.buttons = 0;
    }

    if(this.buttons & UI.LEFTMOUSEBUTTON) {
      this.leftMouseUp = false;
    } else {
      this.leftMouseUp = true;
    }

    var cell = this.xyToCell(x, y);
    this.toolEnd(cell, event);

  },

  mouseWheel: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    //event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    this.zoomToXY(x, y, -wheel.spinY / 4);


    this.editor.info.setZoom(this.displayScale);
    this.editor.gridInfo.setZoom(this.displayScale);    
  },


  zoomToXY: function(zoomX, zoomY, amount) {
    var scale = this.displayScale;

    var graphic = this.editor.graphic;
    var graphicWidth = graphic.getGraphicWidth();
    var graphicHeight = graphic.getGraphicHeight();

    var x = zoomX / scale - this.width / (2 * scale) + graphicWidth / 2 
              + this.camera.position.x ;

    var y = this.height / scale - zoomY / scale - 
              this.height / (2 * scale) 
              + graphicHeight  / 2 + this.camera.position.y;

    if(this.scale <= 0.25 && amount > 0 && amount < 0.5) {
      amount = 0.5;
      console.log(amount);
    }
    this.zoom(amount, false);

    scale = this.displayScale;

    var cameraPosX = x - zoomX / scale + this.width / (2 * scale) - graphicWidth / 2;
    var cameraPosY = y - this.height / scale + zoomY / scale + this.height / (2 * scale) - graphicHeight / 2

    this.setCameraPosition(cameraPosX, cameraPosY);

  },

  zoom: function(direction, redraw) {
    var newScale = this.scale + direction / 2;


    if(newScale <= 0.01) {
      newScale = 0.01;
    }

    this.setScale(newScale, redraw);
  },

  fitOnScreen: function(args) {
    var centreX = 0;
    var centreY = 0;

    var graphic = this.editor.graphic;
    var graphicWidth = graphic.getGraphicWidth();
    var graphicHeight = graphic.getGraphicHeight();

    if(typeof args != 'undefined' && typeof args.minX != 'undefined' && typeof args.minY != 'undefined') {
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      var charWidth = tileSet.getTileWidth();
      var charHeight = tileSet.getTileHeight();
      var minX = args.minX;
      var minY = args.minY;
      var maxX = args.maxX;
      var maxY = args.maxY;

      var gridHeight = 0;
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {
        gridHeight = layer.getGridHeight();
      }
  
      minY = gridHeight - minY;
      maxY = gridHeight - maxY;

      if(minX > maxX) {
        var temp = minX;
        minX = maxX;
        maxX = temp;
      }

      if(minY > maxY) {
        var temp = minY;
        minY = maxY;
        maxY = temp;
      }

      //maxX++;
//      maxY++;


      var srcWidth = charWidth * (maxX - minX);
      var srcHeight = charHeight * (maxY - minY);

      var panelWidth = this.width;
      var panelHeight = this.height;
      if(panelWidth == 0) {
        panelWidth = UI.getScreenWidth() - 300;
      }
      if(panelHeight == 0) {
        panelHeight = UI.getScreenHeight() - 400;
      }

      // find scale to fit it into current canvas, with a bit of padding
      var horizontalScale = (panelWidth) / srcWidth;
      var verticalScale = (panelHeight) / srcHeight;

      if(horizontalScale > verticalScale) {
        if(verticalScale <= 0) {
          verticalScale = 1;
        }
        this.setScale(verticalScale);
      } else {
        if(horizontalScale <= 0) {
          horizontalScale = 1;
        }
        this.setScale(horizontalScale);
      }


      // zoom in on column 0..
      centreX = charWidth * (minX + maxX) / 2;

//      var srcCanvas = this.editor.grid.grid2d.canvas;

      centreX = centreX - (graphicWidth / 2);
      centreY = charHeight * (minY + maxY) / 2;

      centreY = (centreY) - (graphicHeight / 2);

    } else {

      // get the grid canvas dimensions

      var panelWidth = this.width;
      var panelHeight = this.height;
      if(panelWidth == 0) {
        panelWidth = UI.getScreenWidth() - 300;
      }
      if(panelHeight == 0) {
        panelHeight = UI.getScreenHeight() - 300;
      }

      var hPadding = 40;
      var vPadding = 100;
      if(this.editor.graphic.getType() == 'sprite') {
        hPadding = 20;
        vPadding = 40;
      }

      // find scale to fit it into current canvas, with a bit of padding
      var horizontalScale = (panelWidth - hPadding) / graphicWidth;
      var verticalScale = (panelHeight - vPadding) / graphicHeight;


      var scale = horizontalScale;
      if(horizontalScale > verticalScale) {
        scale = verticalScale;
      }
      if(scale < 1) {
        scale = 1;
      }
      this.setScale(scale);


    }


    if(typeof args != 'undefined') {
      if(typeof args.minScale != 'undefined') {
        if(this.scale < args.minScale) {
          this.setScale(args.minScale);
        }
      }
    }

    // need to centre it

    this.setCameraPosition(centreX, centreY);

      
    // does the grid need redrawing?
    if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
      this.findViewBounds();
      this.editor.graphic.redraw();
    }

  },

  fitWidth: function() {

  },

  setScale: function(scale, redraw) {

    if(scale < 0.1) {
      scale = 0.1;      
      this.displayScale = scale;
    } else {
      this.displayScale = (Math.floor(scale / 0.25) * 0.25);

      if(this.displayScale < 0.1) {
        this.displayScale = 0.1;
        scale = 0.1;
      }
    }
    this.scale = scale;


    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.scale = scale;

    if(typeof redraw == 'undefined' || redraw === true) {
      // does the grid need redrawing?
      if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
        this.findViewBounds();
        this.editor.graphic.redraw();
      }
    }

    this.editor.info.setZoom(this.displayScale);
    this.editor.gridInfo.setZoom(this.displayScale);
  },


  getScale: function() {
    return this.displayScale;
  },


  setCameraPosition: function(x, y) {

    if(isNaN(x) || isNaN(y)) {
      return;
    }
    this.camera.position.x = x;
    this.camera.position.y = y;

    if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
      this.findViewBounds();
      this.editor.graphic.redraw();
    }
    
  },

  getCameraPosition: function() {
    return this.camera.position;
  },

  actualPixels: function() {
    this.setScale(1);
  },

  mouseEnter: function(event) {
    if(!this.mouseIsDown) {
      this.editor.grid.grid2d.setCursorEnabled(true);
      this.setMouseCursor(event);
    }
  },

  mouseLeave: function(event) {

    if(UI.getMouseIsCaptured()) {
      return;
    }

    UI.setCursor('default');
    this.editor.info.leaveGrid();
    
    this.editor.grid.grid2d.setCursorEnabled(false);
  },

  drawMirrorH: function(x, y, width, height) {

    var gridWidth = 0;
    var gridHeight = 0;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      gridWidth = layer.getGridWidth();
      gridHeight = layer.getGridHeight();
    }

    var scale = this.displayScale;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var mirrorHX = this.editor.tools.drawTools.mirrorHX;
    if(mirrorHX < 0 || mirrorHX >= gridWidth ) {
      mirrorHX = Math.floor(gridWidth / 2);
      this.editor.tools.drawTools.mirrorHX = mirrorHX;

    }


    var gridXStart = x;
    var gridXEnd =  x + width * scale;

    var gridYStart = y;
    gridYEnd = y + height * scale;

    var gridCellWidth = tileSet.charWidth * scale;
    var gridCellHeight = tileSet.charHeight * scale;

    if(gridXStart < 0) {
      var offset = -  Math.ceil((-gridXStart) / gridCellWidth);
      gridXStart += offset * gridCellWidth;
    }

    if(gridYStart < 0) {
      var offset = -  Math.ceil((-gridYStart) / gridCellHeight);
      gridYStart += offset * gridCellHeight;
    }

    this.context.beginPath();

    var xPosition = x + tileSet.charWidth * scale * mirrorHX;
 
    this.context.moveTo(xPosition, gridYStart);
    this.context.lineTo(xPosition, gridYEnd);

    this.context.lineWidth = 1;//styles.textMode.gridView2dGridLineWidth;
    this.context.strokeStyle = styles.textMode.gridView2dGridLine;
    this.context.stroke();

    // draw resize controls
    this.mirrorHControlX = xPosition- this.mirrorHControlSize / 2 ;
    this.mirrorHControlSize = 9;
    this.mirrorHControl1Y = gridYStart - this.mirrorHControlSize;
    if(this.mirrorHControl1Y < 0) {
      this.mirrorHControl1Y = 0;
    }


    this.context.fillStyle = '#dddddd';
    this.context.fillRect(this.mirrorHControlX , this.mirrorHControl1Y, this.mirrorHControlSize, this.mirrorHControlSize); 

    this.mirrorHControl2Y = gridYEnd;
    if(this.mirrorHControl2Y < 0) {
      this.mirrorHControl2Y = 0;
    }

    if(this.mirrorHControl2Y > this.canvas.height - 10- this.mirrorHControlSize) {
      this.mirrorHControl2Y = this.canvas.height - 10- this.mirrorHControlSize;
    }


    this.context.fillStyle = '#dddddd';
    this.context.fillRect(this.mirrorHControlX, this.mirrorHControl2Y , this.mirrorHControlSize, this.mirrorHControlSize); 



  },

  drawMirrorV: function(x, y, width, height) {
    var scale = this.displayScale;
    var gridWidth = 0;
    var gridHeight = 0;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      gridWidth = layer.getGridWidth();
      gridHeight = layer.getGridHeight();
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var mirrorVY = this.editor.tools.drawTools.mirrorVY;// - 1;

    if(mirrorVY < 0 || mirrorVY >= gridHeight) {
      mirrorVY = Math.floor(gridHeight / 2);
      this.editor.tools.drawTools.mirrorVY = mirrorVY;

    }


    var gridXStart = x;
    var gridXEnd =  x + width * scale;

    var gridYStart = y;
    gridYEnd = y + height * scale;

    var gridCellWidth = tileSet.charWidth * scale;
    var gridCellHeight = tileSet.charHeight * scale;

    if(gridXStart < 0) {
      var offset = -  Math.ceil((-gridXStart) / gridCellWidth);
      gridXStart += offset * gridCellWidth;
    }

    if(gridYStart < 0) {
      var offset = -  Math.ceil((-gridYStart) / gridCellHeight);
      gridYStart += offset * gridCellHeight;
    }

    this.context.beginPath();

    var yPosition = y + tileSet.charHeight * scale * mirrorVY;

    this.context.moveTo(x, yPosition);
    this.context.lineTo(gridXEnd, yPosition);

    this.context.lineWidth = 1;//styles.textMode.gridView2dGridLineWidth;
    this.context.strokeStyle = styles.textMode.gridView2dGridLine;

    this.context.stroke();



    // draw resize controls
    this.mirrorVControlSize = 9;
    this.mirrorVControl1X = x - this.mirrorVControlSize;
    if(this.mirrorVControl1X < 0) {
      this.mirrorVControl1X = 0;
    }
    this.mirrorVControlY = yPosition - this.mirrorVControlSize / 2;


    this.context.fillStyle = '#dddddd';
    this.context.fillRect(this.mirrorVControl1X , this.mirrorVControlY, this.mirrorVControlSize, this.mirrorVControlSize); 

    this.mirrorVControl2X = gridXEnd;
    if(this.mirrorVControl2X < 0) {
      this.mirrorVControl2X = 0;
    }

    if(this.mirrorVControl2X > this.canvas.width - 10 - this.mirrorVControlSize) {
      this.mirrorVControl2X = this.canvas.width - 10 - this.mirrorVControlSize;
    }


    this.context.fillStyle = '#dddddd';
    this.context.fillRect(this.mirrorVControl2X, this.mirrorVControlY , this.mirrorVControlSize, this.mirrorVControlSize); 




  },

  drawGrid: function(x, y, width, height) {

    var scale = this.displayScale;

    // draw grid
//    if(this.editor.grid.xyGrid.visible) {
    if(this.editor.getGridVisible()) {
//      this.context.globalCompositeOperation = 'difference';
//      this.context.globalCompositeOperation = 'exclusion';
      

      var layer = this.editor.layers.getSelectedLayerObject();
      if(!layer || layer.getType() != 'grid') {
        return false;
      }

      var cellWidth = 8;//layer.getCellWidth();
      var cellHeight = 8;//layer.getCellHeight();

      var blockModeEnabled = false;

      var layerObject = this.editor.layers.getSelectedLayerObject();
      if(layerObject && layerObject.getType() == 'grid') {
        cellWidth = layerObject.getCellWidth();
        cellHeight = layerObject.getCellHeight();
        blockModeEnabled = layerObject.getBlockModeEnabled();
      }


      var gridXStart = x;
      var gridXEnd =  x + width * scale;

      var gridYStart = y;
      gridYEnd = y + height * scale;

      var gridCellWidth = cellWidth * scale;
      var gridCellHeight = cellHeight * scale;

      if(gridXStart < 0) {
        var offset = -  Math.ceil((-gridXStart) / gridCellWidth);
        gridXStart += offset * gridCellWidth;
      }

      if(gridYStart < 0) {
        var offset = -  Math.ceil((-gridYStart) / gridCellHeight);
        gridYStart += offset * gridCellHeight;
      }

      // pixel grid
      if(scale > 6) {

        if(this.editor.graphic.getType() == 'sprite' && this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          for(var gridX = gridXStart; gridX < gridXEnd; gridX += scale * 2) {
            var xPosition = gridX;

            this.context.moveTo(xPosition, gridYStart);
            this.context.lineTo(xPosition, gridYEnd);
          }

        } else {
          for(var gridX = gridXStart; gridX < gridXEnd; gridX += scale) {
            var xPosition = gridX;

            this.context.moveTo(xPosition, gridYStart);
            this.context.lineTo(xPosition, gridYEnd);
          }
        }

        for(var gridY = gridYStart; gridY < gridYEnd; gridY += scale) {
          var yPosition = gridY;

          this.context.moveTo(x, yPosition);
          this.context.lineTo(gridXEnd, yPosition);
        }

        this.context.strokeStyle = styles.textMode.gridView2dPixelGridLine;
        this.context.lineWidth = styles.textMode.gridView2dPixelGridLineWidth;

        if(this.editor.getEditorMode() == 'pixel') {
          this.context.strokeStyle = '#999999';//styles.textMode.gridView2dPixelGridLine;
          this.context.lineWidth = 0.4;//styles.textMode.gridView2dPixelGridLineWidth;
        }

        this.context.stroke();
      }

      // tile grid
      this.context.beginPath();

      for(var gridX = gridXStart; gridX < gridXEnd; gridX += cellWidth * scale) {
        var xPosition = gridX;

        this.context.moveTo(xPosition, gridYStart);
        this.context.lineTo(xPosition, gridYEnd);
      }

      for(var gridY = gridYStart; gridY < gridYEnd; gridY += cellHeight * scale) {
        var yPosition = gridY;

        this.context.moveTo(x, yPosition);
        this.context.lineTo(gridXEnd, yPosition);
      }

      this.context.strokeStyle = styles.textMode.gridView2dGridLine;

      this.context.lineWidth = styles.textMode.gridView2dGridLineWidth;

      if(this.editor.getEditorMode() == 'pixel') {
        this.context.strokeStyle = '#888888';//styles.textMode.gridView2dPixelGridLine;
        this.context.lineWidth = 0.6;//styles.textMode.gridView2dPixelGridLineWidth;
//        this.context.lineWidth = styles.textMode.gridView2dGridBlockLineWidth * 1;
      }
    

      this.context.stroke();


      if(blockModeEnabled) {
        this.context.setLineDash([]);

        // draw block divisions
        this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();        
        var blockWidth = layerObject.getBlockWidth();
        var blockHeight = layerObject.getBlockHeight();


        var gridXStart = x;
        var gridXEnd =  x + width * scale;

        var gridYStart = y;
        gridYEnd = y + height * scale;

        var gridCellWidth = cellWidth * scale;
        var gridCellHeight = cellHeight * scale;

        if(gridXStart < 0) {
          var offset = -  Math.ceil((-gridXStart) / (gridCellWidth * blockWidth) );
          gridXStart += offset * (gridCellWidth * blockWidth);
        }

        if(gridYStart < 0) {
          var offset = -  Math.ceil((-gridYStart) / (gridCellHeight * blockHeight));
          gridYStart += offset * (gridCellHeight * blockHeight);
        }


        this.context.beginPath();

        for(var gridX = gridXStart; gridX < gridXEnd; gridX += cellWidth * scale * blockWidth) {
          var xPosition = gridX;

          this.context.moveTo(xPosition, gridYStart);
          this.context.lineTo(xPosition, gridYEnd);
        }

        for(var gridY = gridYStart; gridY < gridYEnd; gridY += cellHeight * scale * blockHeight) {
          var yPosition = gridY;

          this.context.moveTo(x, yPosition);
          this.context.lineTo(gridXEnd, yPosition);
        }

        this.context.strokeStyle = styles.textMode.gridView2dGridBlockLine;
        this.context.lineWidth = styles.textMode.gridView2dGridBlockLineWidth * 1;
        this.context.stroke();
      }
//      this.context.globalCompositeOperation = 'source-over';

    }
  },

  drawPixelSelect: function() {
    var scale = this.displayScale;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


    var time = getTimestamp();


    var x = this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale;
    var y = this.height / 2 - layerHeight * scale / 2 + this.camera.position.y * scale;
  

    var selectionOffsetX = pixelSelect.selectionOffsetX;
    var selectionOffsetY = pixelSelect.selectionOffsetY;
    var selection = pixelSelect.getSelection();

    // draw selection
    this.context.beginPath();
    var minX = (selection.minX  + selectionOffsetX);
    var maxX = (selection.maxX + selectionOffsetX);

// reverseY    var minY = srcCanvas.height - (selection.minY + selectionOffsetY);
// reverseY    var maxY = srcCanvas.height - (selection.maxY + selectionOffsetY);

    var minY = (selection.minY + selectionOffsetY);
    var maxY = (selection.maxY + selectionOffsetY);

    this.context.moveTo(x + minX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + minY * scale);

    this.context.setLineDash([]);
    this.context.strokeStyle = styles.textMode.gridView2dSelectLineDark;
    this.context.lineWidth = 1;
    this.context.stroke();

    if(time - this.lastSelectAnimate > 260) {
      this.lastSelectAnimate = time;

      if(this.lastDashOffset == 0) {
        this.lastDashOffset = 5;
      } else {
        this.lastDashOffset = 0;
      }
    }

    if(this.lastDashOffset == 0) {
      this.context.setLineDash([5, 5]);
    } else {
      this.context.setLineDash([0,5,5,0]);
    }

    this.context.strokeStyle = styles.textMode.gridView2dSelectLineLight;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]); 

    // draw the dimensions
    var infoWidth = 120;
    var infoHeight = 16;
    var infoXPos = x + minX * scale;
    var infoYPos = y + minY * scale - infoHeight;

    var selectionWidth = maxX - minX;
    var selectionHeight = maxY - minY;

    this.context.globalAlpha = 0.8;
    this.context.fillStyle =  '#111111';
    this.context.fillRect(infoXPos, infoYPos,
      infoWidth, infoHeight);

    infoXPos = infoXPos + 4;
    infoYPos = infoYPos + infoHeight - 4;
    var info = 'xy: ';
    info += minX + ',' + minY;
    info += '   wh: ';
    info += selectionWidth + ', ' + selectionHeight;
    this.context.font = "10px Verdana";
    this.context.fillStyle = "#cccccc";
    this.context.fillText(info, infoXPos, infoYPos);

    this.context.globalAlpha = 1;

  },

  drawCellInfo: function(x, y, cellWidth, cellHeight) {
    var gridInfo = this.editor.gridInfo;

    // draw the dimensions
    var infoWidth = 120;
    var infoHeight = 32;
    var infoXPos = x;// + minX * this.scale;
    var infoYPos = y + cellHeight;// - infoHeight;// + minY * this.scale - infoHeight;


    this.context.globalAlpha = 0.8;
    this.context.fillStyle =  '#111111';
    this.context.fillRect(infoXPos, infoYPos,
      infoWidth, infoHeight);



    infoXPos = infoXPos + 4;
    infoYPos = infoYPos + 12;//infoHeight - 4;
    var info = 'XY:';
    info += gridInfo.x + ',' + gridInfo.y;
    if(typeof gridInfo.tileIndex == 'undefined') {
      return;
    }
    info += ' Tile:' + gridInfo.tileIndex + '(0x' + ("00" + gridInfo.tileIndex.toString(16)).substr(-2) + ')';
    this.context.font = "10px Verdana";
    this.context.fillStyle = "#cccccc";
    this.context.fillText(info, infoXPos, infoYPos);

    info = 'FG:' + gridInfo.fc + '(0x' + ("00" + gridInfo.fc.toString(16)).substr(-2) + ')';
    if(gridInfo.bc != -1) {
      info += ' BG:' + gridInfo.bc + '(0x' + ("00" + gridInfo.bc.toString(16)).substr(-2) + ')';
    }
    this.context.font = "10px Verdana";
    this.context.fillStyle = "#cccccc";
    this.context.fillText(info, infoXPos, infoYPos + 14);

    this.context.globalAlpha = 1;

  },

  drawPixelPasteMove: function() {
    var scale = this.displayScale;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


    var time = getTimestamp();


    var x = this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale;
    var y = this.height / 2 - layerHeight * scale / 2 + this.camera.position.y * scale;



    // draw boundary around paste 
    this.context.beginPath();
    var minX = pixelSelect.pasteOffsetX;
    var maxX = pixelSelect.pasteOffsetX + pixelSelect.getPasteWidth();

    var minY = (pixelSelect.pasteOffsetY);
    var maxY = (pixelSelect.pasteOffsetY + pixelSelect.getPasteHeight());

    this.context.moveTo(x + minX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + minY * scale);

    this.context.setLineDash([]);
    this.context.strokeStyle = styles.textMode.gridView2dSelectLineDark;
    this.context.lineWidth = 1;
    this.context.stroke();

    if(time - this.lastSelectAnimate > 260) {
      this.lastSelectAnimate = time;

      if(this.lastDashOffset == 0) {
        this.lastDashOffset = 5;
      } else {
        this.lastDashOffset = 0;
      }
    }

    if(this.lastDashOffset == 0) {
      this.context.setLineDash([5, 5]);
    } else {
      this.context.setLineDash([0,5,5,0]);
    }

    this.context.strokeStyle = styles.textMode.gridView2dSelectLineLight;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]); 
  },


  drawSelect: function() {

    var scale = this.displayScale;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var time = getTimestamp();

    var x = this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale;
    var y = this.height / 2 - layerHeight * scale / 2 + this.camera.position.y * scale;


    var selectionOffsetX = this.editor.tools.drawTools.select.selectionOffsetX;
    var selectionOffsetY = this.editor.tools.drawTools.select.selectionOffsetY;
    var selection = this.editor.tools.drawTools.select.getSelection();

    // draw selection
    this.context.beginPath();
    var minX = (selection.minX  + selectionOffsetX) * cellWidth;
    var maxX = (selection.maxX + selectionOffsetX)  * cellWidth;

    var minY = (selection.minY + selectionOffsetY)  * cellHeight;
    var maxY = (selection.maxY + selectionOffsetY)  * cellHeight;


    this.context.moveTo(x + minX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + minY * scale);

    this.context.setLineDash([]);
    this.context.strokeStyle = styles.textMode.gridView2dSelectLineDark;
    this.context.lineWidth = 1;
    this.context.stroke();

    if(time - this.lastSelectAnimate > 260) {
      this.lastSelectAnimate = time;

      if(this.lastDashOffset == 0) {
        this.lastDashOffset = 5;
      } else {
        this.lastDashOffset = 0;
      }
    }

    if(this.lastDashOffset == 0) {
      this.context.setLineDash([5, 5]);
    } else {
      this.context.setLineDash([0,5,5,0]);
    }

    this.context.strokeStyle = styles.textMode.gridView2dSelectLineLight;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]); 


    // draw the dimensions
    var infoWidth = 120;
    var infoHeight = 16 - 1;
    var infoXPos = x + minX * scale;
    var infoYPos = y + minY * scale - infoHeight;

    var minXInfo = (selection.minX  + selectionOffsetX);
    var maxX = (selection.maxX + selectionOffsetX);

    var minY = (selection.minY + selectionOffsetY);
    var maxYInfo = (selection.maxY + selectionOffsetY);


    var selectionWidth = maxX - minXInfo;
    var selectionHeight = maxYInfo - minY;

    this.context.globalAlpha = 0.8;
    this.context.fillStyle =  '#111111';
    this.context.fillRect(infoXPos, infoYPos,
      infoWidth, infoHeight);

    infoXPos = infoXPos + 4;
    infoYPos = infoYPos + infoHeight - 4;
    var info = '';

    info += 'xy: ' + minX + ',' + maxX;
    this.context.font = "10px Verdana";
    this.context.fillStyle = "#cccccc";
    this.context.fillText(info, infoXPos, infoYPos);

    info = 'wh: ' + selectionWidth + ', ' + selectionHeight;
    this.context.fillText(info, infoXPos + 60, infoYPos);


    if(this.editor.tools.drawTools.select.isInPasteMove()) {
      // draw paste instructions
      infoWidth = 30;
      
      var instructions = 'Drag to place';
      infoWidth = 76;
      infoXPos = x + minX * scale;
      infoYPos = y + maxY * scale;

      this.context.globalAlpha = 0.8;
      this.context.fillStyle =  '#111111';
      this.context.fillRect(infoXPos, infoYPos,
        infoWidth, infoHeight);

      infoXPos = infoXPos + 4;
      infoYPos = infoYPos + infoHeight - 4;
    
      this.context.font = "10px Verdana";
      this.context.fillStyle = "#cccccc";      
      this.context.fillText(instructions, infoXPos, infoYPos);      
    }

    this.context.globalAlpha = 1;

  },


  drawZoom: function() {

    var scale = this.displayScale;

    if(this.zoomDownX === false || this.zoomDownY === false || this.zoomMouseX === false || this.zoomMouseY === false
      ||this.zoomDownX == this.zoomMouseX || this.zoomDownY == this.zoomMouseY) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var time = getTimestamp();

//    var srcCanvas = this.editor.grid.grid2d.canvas;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


    var x = this.width / 2 - layerWidth * scale / 2 - this.camera.position.x * scale;
    var y = this.height / 2 - layerHeight * scale / 2 + this.camera.position.y * scale;


    var zoomMinX = this.zoomDownX;
    var zoomMinY = this.zoomDownY;
    var zoomMaxX = this.zoomMouseX;
    var zoomMaxY = this.zoomMouseY;

    if(zoomMaxX >= zoomMinX) {
      zoomMaxX ++;
    }

    if(zoomMaxY >= zoomMinY) {
      zoomMaxY++;
    } else {
      zoomMinY++;
    }
//    if(zoomMaxY )

    // draw selection
    this.context.beginPath();
    var minX = (zoomMinX) * tileSet.charWidth;
    var maxX = (zoomMaxX)  * tileSet.charWidth;

//  reverseY    var minY = srcCanvas.height - (zoomMinY)  * tileSet.charHeight;
//  reverseY  var maxY = srcCanvas.height - (zoomMaxY)  * tileSet.charHeight;

    var minY = (zoomMinY)  * tileSet.charHeight;
    var maxY = (zoomMaxY)  * tileSet.charHeight;

    this.context.moveTo(x + minX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + minY * scale);
    this.context.lineTo(x + maxX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + maxY * scale);
    this.context.lineTo(x + minX * scale, 
      y + minY * scale);

    this.context.setLineDash([]);
    this.context.strokeStyle = styles.textMode.gridView2dSelectLineDark;
    this.context.lineWidth = 1;
    this.context.stroke();

    if(time - this.lastSelectAnimate > 260) {
      this.lastSelectAnimate = time;

      if(this.lastDashOffset == 0) {
        this.lastDashOffset = 5;
      } else {
        this.lastDashOffset = 0;
      }
    }

    if(this.lastDashOffset == 0) {
      this.context.setLineDash([5, 5]);
    } else {
      this.context.setLineDash([0,5,5,0]);

    }

    this.context.strokeStyle = styles.textMode.gridView2dSelectLineLight;
    this.context.lineWidth = 1;
    this.context.stroke();
    this.context.setLineDash([]); 
  },


  setYScroll: function(scrollY) {
    var scale = this.displayScale;
    //var srcCanvas = this.editor.grid.grid2d.canvas;
    var graphic = this.editor.graphic;
    var graphicHeight = graphic.getGraphicHeight();

    this.scrollY = scrollY;

    var cameraY = (-this.scrollY - this.canvas.height / (2 * this.uiComponent.getScale()) + graphicHeight * scale / 2) / scale;
    this.setCameraPosition(this.camera.position.x, cameraY);
  },

  setXScroll: function(scrollX) {
    var scale = this.displayScale;

    var graphic = this.editor.graphic;
    var graphicWidth = graphic.getGraphicWidth();

    this.scrollX = scrollX;

    var cameraX = (this.scrollX + this.canvas.width / (2 * this.uiComponent.getScale()) - graphicWidth * scale / 2) / scale;
    this.setCameraPosition(cameraX, this.camera.position.y);
  },


  calculateScroll: function() {
    var scale = this.displayScale;

    this.vPadding = 200 * scale;
    this.hPadding = 300 * scale;

    this.srcHeight += this.vPadding;
    this.srcWidth += this.hPadding;

    this.vScrollBarHeight = this.viewHeight;

    this.vScrollBarPositionHeight = this.vScrollBarHeight  * this.viewHeight / this.srcHeight;
    if(this.vScrollBarPositionHeight > this.vScrollBarHeight) {
      this.vScrollBarPositionHeight = this.vScrollBarHeight;
      this.scrollY = -this.vPadding/2;
    }
    this.vScrollBarPosition =  (this.scrollY + this.vPadding/2) * this.vScrollBarHeight / this.srcHeight;



    this.hScrollBarWidth = this.viewWidth;
    this.hScrollBarPositionWidth = this.hScrollBarWidth  * this.viewWidth / this.srcWidth;
    if(this.hScrollBarPositionWidth > this.hScrollBarWidth) {
      this.hScrollBarPositionWidth = this.hScrollBarWidth;
      this.scrollX = -this.hPadding / 2;

    }


    this.hScrollBarPosition = (this.scrollX + this.hPadding/2) * this.hScrollBarWidth / this.srcWidth;
  },


  typingCursor: function() {
    if(this.editor.tools.drawTools.tool == 'type') {


      var time = getTimestamp();
      if(time - this.lastBlinkTime > 600) {
        this.lastBlinkTime = time;
        this.typingCursorBlink = !this.typingCursorBlink;
      }
      var color = this.editor.currentTile.bgColor;
      if(this.typingCursorBlink) {
        color = this.editor.currentTile.color;
      }

//      this.editor.grid.grid2d.setTypingCursor(this.editor.grid.typingCursor.gridX, this.editor.grid.typingCursor.gridY, color, true);
      this.editor.grid.grid2d.setTypingCursor(this.editor.tools.drawTools.typing.cursor.x, this.editor.tools.drawTools.typing.cursor.y, color, true);

    } else {
      var color = this.editor.currentTile.bgColor;

      this.editor.grid.grid2d.setTypingCursor(this.editor.tools.drawTools.typing.cursor.x, this.editor.tools.drawTools.typing.cursor.y, color, true);

//      this.editor.grid.grid2d.setTypingCursor(this.editor.grid.typingCursor.gridX, this.editor.grid.typingCursor.gridY, color, true);
    }

  },

  setupPreviousFrame: function() {

    if(this.editor.graphic.getFrameCount() == 1) {
      this.previousScreenFrame = false;
      return;
    }

    var previousFrame = this.editor.graphic.getCurrentFrame() - 1;
    if(previousFrame === -1) {
      previousFrame = this.editor.graphic.getFrameCount() -1;
    }

    if(previousFrame !== this.previousScreenFrame) {
      this.previousScreenFrame = previousFrame;
      
      this.previousScreen.update({
        frame: previousFrame, 
        allCells: true, 
        drawBackground: false, 
        drawPreviousFrame: false 
      });
    }

  },


  resize: function(left, top, width, height) {
    

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;
  
    this.canvas = this.uiComponent.getCanvas();

    this.context = this.canvas.getContext("2d");
    this.context.scale(this.uiComponent.getScale(), this.uiComponent.getScale());
    
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;

    // does the grid need redrawing?
    if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
      this.findViewBounds();
      this.editor.graphic.redraw();
    }

  },


  setupBackgroundCanvas: function() {

    if(this.backgroundCanvas == null) {
      this.backgroundCanvas = document.createElement('canvas');
    }

    if(this.backgroundCanvas.width < this.canvas.width || this.backgroundCanvas.height < this.canvas.height) {

      this.backgroundCanvas.width = this.canvas.width;
      this.backgroundCanvas.height = this.canvas.height;
      this.backgroundContext = this.backgroundCanvas.getContext('2d');

      // draw the background image
      this.backgroundContext.fillStyle = '#cccccc';
      this.backgroundContext.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height); 

      // this is the transparent image..
      var blockSize = 5;
      var blocksAcross = Math.ceil(this.backgroundCanvas.width / blockSize);
      var blocksDown = Math.ceil(this.backgroundCanvas.height / blockSize);

      this.backgroundContext.fillStyle = '#bbbbbb';
      for(var y = 0; y < blocksDown; y++) {
        for(var x = 0; x < blocksAcross; x++) {
          if((x + y) % 2) {
            this.backgroundContext.fillRect(x * blockSize, y * blockSize, 
              blockSize, blockSize); 
          }
        }
      }
    }
  },

//     this.drawCursor({ context: this.cont ext, canvasX: x, canvasY: y, scale: this.scale });
  getCursorVisible: function() {
    var drawTools = this.editor.tools.drawTools;
    var tool = drawTools.tool;

    if(this.editor.grid.grid2d.getCursorEnabled()) {
      switch(tool) {
        case 'line':
        case 'rect':
        case 'oval':
        case 'pen':
        case 'block':
        case 'fill':
        case 'charpixel':
        case 'linesegment':
        case 'invert':
        case 'corners':

          return true;
        default:
          return false;
      }
    }
    return false;
  },

  setCursorBoxVisible: function(visible) {
    this.cursorBoxVisible = visible;
  },

  drawCursorBox: function(context, x, y, width, height, scale) {

    if(this.cursorBoxVisible) {
      context.beginPath();
      context.strokeStyle = 'red';


      context.moveTo(x, y);
      context.lineTo( x + 1 * scale, y );
      context.moveTo(x, y);
      context.lineTo(x, y + 1 * scale);

      context.moveTo(x + width, y);
      context.lineTo( x + width - 1 * scale, y );
      context.moveTo(x + width, y);
      context.lineTo(x + width, y + 1 * scale);

      context.moveTo(x, y + height);
      context.lineTo( x, y + height - 1 * scale );
      context.moveTo(x, y + height);
      context.lineTo(x + 1 * scale, y + height );


      context.moveTo(x + width, y + height);
      context.lineTo( x + width - 1 * scale, y + height);
      context.moveTo(x + width, y + height);
      context.lineTo(x + width, y + height - 1 * scale);

      context.stroke();
    }

  },

  // new system calls draw cursor from graphic.js for non vector cursors
  drawCursor: function(args) {


    if(this.editor.currentTile.characters == null || this.editor.currentTile.characters.length == 0) {
      return;
    }

    /*
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }
    */


    
    var gridHeight = 0;
    var gridWidth = 0;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      gridWidth = layer.getGridWidth();
      gridHeight = layer.getGridHeight();
    }

    var tileSet = layer.getTileSet();

    var context = args.context;
    var scale = args.scale;
    var offsetX = args.offsetX;
    var offsetY = args.offsetY;

    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();
    var cursorWidth = this.editor.currentTile.getCursorWidth();
    var cursorHeight = this.editor.currentTile.getCursorHeight();
    var cursorX = this.editor.grid.grid2d.cursor.position.x + this.editor.grid.grid2d.cursor.offset.x;
    var cursorY = this.editor.grid.grid2d.cursor.position.y + this.editor.grid.grid2d.cursor.offset.y;

    var cursorOffsetX = 0;
    var cursorOffsetY = 0;


    if(cursorX + cursorWidth > gridWidth) {
      cursorWidth = gridWidth - cursorX;
    }

    if(cursorY + cursorHeight > gridHeight) {
      cursorHeight = gridHeight - cursorY;
    }

    if(cursorX < 0) {
      cursorOffsetX = -cursorX;
      cursorWidth += cursorX;
      cursorX = 0;
    }

    if(cursorY < 0) {
      cursorOffsetY = -cursorY;
      cursorHeight += cursorY;
      cursorY = 0;
    }


    cursorWidth *= tileWidth;
    cursorHeight *= tileHeight;
    offsetX = offsetX + (cursorX * tileWidth) * scale;
    offsetY = offsetY + (cursorY * tileHeight) * scale;

    var drawTools = this.editor.tools.drawTools;
    var tool = drawTools.tool;

    if(this.editor.grid.grid2d.getCursorEnabled()) {
      switch(tool) {
        case 'line':
        case 'rect':
        case 'oval':
          cursorWidth = tileWidth;
          cursorHeight = tileHeight;
        case 'pen':
        case 'block':
        case 'fill':
        case 'charpixel':
        case 'linesegment':
        case 'corners':
        case 'invert':


          
          if(drawTools.drawCharacter 
              || drawTools.tool == 'charpixel' 
              || drawTools.tool == 'linesegment'
              || drawTools.tool == 'corners'
              || drawTools.tool == 'invert') {

            if(cursorWidth != 0 && cursorHeight != 0) {
              if(this.editor.getCursorTileTransparent()) {
                context.globalAlpha = 0.7;//0.2;
              }

              var cursorCanvas = null;
              if(layer.getMode() == TextModeEditor.Mode.VECTOR) {
                // need to get cursor at the current size..
                cursorCanvas = this.editor.currentTile.getVectorCursorCanvas({ scale: scale });
                if(cursorCanvas) {

                  context.drawImage(cursorCanvas,
                                    cursorOffsetX, cursorOffsetY, cursorWidth * scale, cursorHeight * scale,
                                    offsetX, offsetY, cursorWidth * scale, cursorHeight * scale);

                  this.drawCursorBox(context, offsetX, offsetY, cursorWidth * scale, cursorHeight * scale, scale);
                }


              } else {

                cursorCanvas = this.editor.currentTile.getCursorCanvas();
                if(cursorCanvas) {
                  /*
                  context.drawImage(cursorCanvas,
                    cursorOffsetX, cursorOffsetY, cursorCanvas.width, cursorCanvas.height,
                    offsetX, offsetY, cursorCanvas.width * scale, cursorCanvas.height * scale);
                  */
                  
                  context.drawImage(cursorCanvas,
                                    cursorOffsetX, cursorOffsetY, cursorWidth, cursorHeight,
                                    offsetX, offsetY, cursorWidth * scale, cursorHeight * scale);
                  
                  this.drawCursorBox(context, offsetX, offsetY, cursorWidth * scale, cursorHeight * scale, scale);                                    
                  
                }
              }
              context.globalAlpha = 1;
            }
          } else {
            if(this.editor.getCursorTileTransparent()) {
              context.globalAlpha = 0.4;//0.2;
            }
            if(drawTools.drawColor) {
              var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
              context.fillStyle = '#' + colorPalette.getHexString(this.editor.currentTile.getColor()); 

            } else {
              context.fillStyle= '#cccccc';          
            }
            context.fillRect(offsetX, offsetY, cursorWidth * scale, cursorHeight * scale);
            context.globalAlpha = 1;

          }
          break;
        case 'eyedropper':
        case 'type':
        case 'erase':
          cursorWidth = tileWidth;
          cursorHeight = tileHeight;
          context.globalAlpha = 0.4;//0.2;
          context.fillStyle= '#cccccc';          
          context.fillRect(offsetX, offsetY, cursorWidth * scale, cursorHeight * scale);
          context.globalAlpha = 1;

          if(tool == 'eyedropper') {
            this.drawCellInfo(offsetX, offsetY,  cursorWidth * scale, cursorHeight * scale);
          }

        break;

      }
    }

    if(this.editor.tools.drawTools.tool == 'pixel') {
      var highlightCell = this.editor.tools.drawTools.pixelDraw.highlightCell;
      if(typeof highlightCell != 'undefined' && highlightCell !== false && typeof highlightCell.x != 'undefined') {
        var cursorX = highlightCell.x;
// reverseY        var cursorY = gridHeight - highlightCell.y - 1;
        var cursorY = highlightCell.y;

        var pixelX = highlightCell.pixelX;
        var pixelY = highlightCell.pixelY;

        var pixelWidth = 1;
        var pixelHeight = 1;

        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
        var colorString = '#' + colorPalette.getHexString(this.editor.tools.drawTools.pixelDraw.highlightColor); 

        if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) { 

          var cellData = layer.getCell({ x: highlightCell.x, y: highlightCell.y });
          if(typeof cellData.fc != 'undefined') {
            var color = cellData.fc;
            if(color >= 8 || this.editor.graphic.getType() == 'sprite') {
              pixelWidth = 2;
              pixelX = Math.floor(pixelX/2);
            }
          }

        }


        offsetX = args.offsetX + (cursorX * tileWidth) * scale;
        offsetY = args.offsetY + (cursorY * tileHeight) * scale;

        offsetX += pixelX * pixelWidth * scale;
        offsetY += pixelY * pixelHeight * scale;

        context.globalAlpha = 0.4;//0.2;
        context.fillStyle= colorString;
        context.fillRect(offsetX, offsetY, scale * pixelWidth, scale * pixelHeight);
        context.globalAlpha = 1;


      }

    }


    if( this.editor.tools.drawTools.tool == 'type' && this.editor.grid.grid2d.typingCursor.isOn  ) {

      var cursorWidth = tileWidth * this.editor.currentTile.getCursorWidth();
      var cursorHeight = tileHeight * this.editor.currentTile.getCursorHeight();
      var cursorX = this.editor.grid.grid2d.typingCursor.position.x;
// reversey      var cursorY = gridHeight - this.editor.grid.grid2d.typingCursor.position.y - 1;
      var cursorY = this.editor.grid.grid2d.typingCursor.position.y ;
      var color = this.editor.grid.grid2d.typingCursor.color;


      if(color !== false && color >= 0) {
        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
        var colorString = '#' + colorPalette.getHexString(color); 


        offsetX = args.offsetX + (cursorX * tileWidth) * scale;
        offsetY = args.offsetY + (cursorY * tileHeight) * scale;

        context.fillStyle = colorString;
        context.fillRect(offsetX, offsetY, cursorWidth * scale, cursorHeight * scale);
      }
    }
    
  },


  findViewBounds: function() {
    var scale = this.displayScale;
    //var srcCanvas = this.editor.grid.grid2d.canvas;
    var graphic = this.editor.graphic;
    var graphicWidth = graphic.getGraphicWidth();
    var graphicHeight = graphic.getGraphicHeight();

    var x = Math.floor(this.width / 2 - graphicWidth * scale / 2 - this.camera.position.x * scale);
    var y = Math.floor(this.height / 2 - graphicHeight * scale / 2 + this.camera.position.y * scale);

    var srcX = 0;
    var srcY = 0;

    var dstX = x;
    var dstY = y;
    var dstWidth = graphicWidth * scale;
    var dstHeight = graphicHeight * scale;

// need to calculate srcx, srcy first then dst x
    if(x < 0) {
      srcX = -Math.floor(x / scale) - 1;
      if(srcX < 0) {
        srcX = 0;
      }
      dstX = x + srcX * scale;
    }

    if(y < 0) {
      srcY = -Math.floor(y / scale) - 1;
      if(srcY < 0) {
        srcY = 0;
      }
      dstY = y + srcY * scale;
    }



    srcWidth = Math.ceil( (this.width - dstX) / scale);
    if(srcX + srcWidth > graphicWidth) {
      srcWidth = graphicWidth - srcX;
    }
    dstWidth = srcWidth * scale;

    srcHeight = Math.ceil(  (this.height - dstY) / scale);
    if(srcY + srcHeight > graphicHeight) {
      srcHeight = graphicHeight - srcY;
    }
    dstHeight = srcHeight * scale;

    this.editor.graphic.setViewBounds(srcX, srcY, srcX + srcWidth, srcY + srcHeight);


  },


  draw: function(args) {
    var graphic = this.editor.graphic;
    var scale = this.displayScale;


    // width of the graphic in pixels
    var graphicWidth = graphic.getGraphicWidth();
    var graphicHeight = graphic.getGraphicHeight();

    // work out the coordinates of the content to be displayed

    // view bounds in terms of graphic coordinates
//    var viewBoundsX = -this.width / (2 * this.scale) + graphicWidth / 2 + this.camera.position.x;
//    var viewBoundsY = -this.height / (2 * this.scale) + graphicHeight / 2 - this.camera.position.y;
//    var viewWidth = (this.width - this.vScrollBarWidth)  / this.scale;
//    var viewHeight = (this.height - this.hScrollBarHeight) / this.scale;

    // x and y position of where the frame will be drawn..basically viewBoundsX,y multiplied by scale
    var x = Math.floor(this.width / 2 - graphicWidth * scale / 2 - this.camera.position.x * scale);
    var y = Math.floor(this.height / 2 - graphicHeight * scale / 2 + this.camera.position.y * scale);

    
    // round them to get pixel values
//    var srcX = Math.floor(viewBoundsX);
//    var srcY = Math.floor(viewBoundsY);
//    var srcWidth = Math.ceil(viewWidth);
//    var srcHeight = Math.ceil(viewHeight);


    var srcX = 0;
    var srcY = 0;
    var srcWidth = graphicWidth;
    var srcHeight = graphicHeight;

    var dstX = x;
    var dstY = y;
    var dstWidth = srcWidth * scale;
    var dstHeight = srcHeight * scale;

    // need to calculate srcx, srcy first then dst x
    if(x < 0) {
      srcX = -Math.floor(x / scale) - 1;
      if(srcX < 0) {
        srcX = 0;
      }
      dstX = x + srcX * scale;
    }

    if(y < 0) {
      srcY = -Math.floor(y / scale) - 1;
      if(srcY < 0) {
        srcY = 0;
      }
      dstY = y + srcY * scale;
    }

    srcWidth = Math.ceil( (this.width - dstX) / scale);
    if(srcX + srcWidth > graphicWidth) {
      srcWidth = graphicWidth - srcX;
    }
    dstWidth = srcWidth * scale;

    srcHeight = Math.ceil(  (this.height - dstY) / scale);
    if(srcY + srcHeight > graphicHeight) {
      srcHeight = graphicHeight - srcY;
    }
    dstHeight = srcHeight * scale;


    
/*
    // get the onscreen position where the graphic should be drawn
    var dstX = 0 - (viewBoundsX - srcX) * this.scale;
    var dstY = 0 - (viewBoundsY - srcY) * this.scale;

    // on screen width of the image
    var dstWidth = Math.ceil(srcWidth * this.scale);
    var dstHeight = Math.ceil(srcHeight * this.scale);
*/


    // maybe dont need to do this on every draw, but it helps
    this.findViewBounds();

    
    // create the back buffer and size it to the viewport size
    if(this.backBufferCanvas == null) {
      this.backBufferCanvas = document.createElement('canvas');
    }

    if(this.backBufferContext == null || this.backBufferCanvas.width < this.width || this.backBufferCanvas.height < this.height) {      
      this.backBufferCanvas.width = this.width;
      this.backBufferCanvas.height = this.height;
      this.backBufferContext = UI.getContextNoSmoothing(this.backBufferCanvas);
    }


    // clear everything
    this.backBufferContext.fillStyle = 'black';
    this.backBufferContext.fillRect(dstX, dstY, dstWidth, dstHeight);




    //console.log(x + ',' + y);

    // draw the background and border if necessary, could move to graphic?
//    var borderVisible = this.editor.grid.border.visible && graphic.getType() != 'sprite';    
    if(x > 0 || y > 0 || x + graphicWidth * scale < this.width || y + graphicHeight * scale < this.height) {
      // at least one of the edges is within the viewport
      
      // is one of the edges within the display (so background will be visible)
      //this.backBufferContext.clearRect(0, 0, this.width, this.height);

      this.backBufferContext.fillStyle = styles.textMode.gridView2dBackground;
      this.backBufferContext.fillRect(0, 0, this.width, this.height);

      // set this to true for now..
      // really should only do it if no layers visible, background is hidden or all layers have transparent background
      if(true || !this.editor.layers.isBackgroundVisible()) {

        // draw the checkerboard pattern
        var bgWidth = graphicWidth * scale;
        var bgHeight = graphicHeight * scale;
        var bgPosX = x;
        var bgPosY = y;
        if(bgPosY < 0) {
          bgHeight += bgPosY;
          bgPosY = 0;
        }
        if(bgPosX < 0) {
          bgWidth += bgPosX;
          bgPosX = 0;
        }

        // draw checkerboard
        this.setupBackgroundCanvas();
        this.backBufferContext.drawImage(this.backgroundCanvas, 
                                0, 0, bgWidth, bgHeight,
                                bgPosX, bgPosY, bgWidth, bgHeight);
      }

    } else {
      // graphic covers the whole of the viewport
      if(true || !this.editor.layers.isBackgroundVisible()) {
      // draw checkerboard
        this.setupBackgroundCanvas();
        this.backBufferContext.drawImage(this.backgroundCanvas, 
                                0, 0, this.width, this.height,
                                0, 0, this.width, this.height);
      }
    }



    // draw to the back buffer
    var frame = this.editor.graphic.getCurrentFrame();
    var allCells = false;
    var drawBackground = this.editor.layers.isBackgroundVisible();
    var drawPreviousFrame = this.editor.frames.getShowPrevFrame();
    var animatedTilesOnly = false;
    var tool = this.editor.tools.drawTools.tool;
    var shapes = tool == 'line' || tool == 'rect' || tool == 'oval';

    if(typeof args != 'undefined') {
      if(typeof args.allCells != 'undefined') {
        allCells = args.allCells;
      }      
    }

    /*
    if(drawPreviousFrame) {
      if(this.previousFrameCanvas == null) {
        this.previousFrameCanvas = document.createElement('canvas');
      }
    }
    */

    this.editor.graphic.drawFrame({
      canvas: this.backBufferCanvas,
      context: this.backBufferContext,
      
      frame: frame,
      srcX: srcX,
      srcY: srcY,
      srcWidth: srcWidth,
      srcHeight: srcHeight,
      dstX: dstX,
      dstY: dstY,
      drawAtX: x,
      drawAtY: y,
      scale: scale,
      dstWidth: dstWidth,
      dstHeight: dstHeight,
      allCells: allCells,
      drawBackground: drawBackground,
      drawPreviousFrame: drawPreviousFrame,
//      previousFrameCanvas: previousFrameCanvas,
      animatedTilesOnly: animatedTilesOnly,
      shapes: shapes

    });



    this.context.drawImage(this.backBufferCanvas, 0, 0);



    // these are needed to calculate and draw scrollbars..
    this.viewWidth = this.width - this.vScrollBarWidth;
    this.viewHeight = this.height - this.hScrollBarHeight;
    this.srcWidth = graphicWidth * scale;
    this.srcHeight = graphicHeight * scale;
    this.scrollX = -x;
    this.scrollY = -y;


    /*
    if(!UI.isMobile.any()) {
      this.drawCursor({ context: this.context, offsetX: x, offsetY: y, scale: this.scale });
    }
    */

    this.drawGrid(x, y, graphicWidth, graphicHeight);


    var drawTools = this.editor.tools.drawTools;
    if(drawTools.select.isActive()) {
      this.drawSelect();
    }

    if(drawTools.pixelSelect.isActive()) {
      this.drawPixelSelect();
    }

    if(drawTools.pixelSelect.isInPasteMove()) {
      this.drawPixelPasteMove();
    }

    this.drawZoom();

    if(drawTools.mirrorH) {
      this.drawMirrorH(x, y, graphicWidth, graphicHeight);
    }

    if(drawTools.mirrorV) {
      this.drawMirrorV(x, y, graphicWidth, graphicHeight);
    }

    // draw the scroll bars
    this.calculateScroll();


    this.context.fillStyle = styles.ui.scrollbarHolder;


    // horizontal scroll
    this.context.fillRect(0, this.height - this.hScrollBarHeight, this.viewWidth, this.hScrollBarHeight);
    this.context.fillStyle = styles.ui.scrollbar;
    this.context.fillRect(this.hScrollBarPosition, this.height - this.hScrollBarHeight + 1, this.hScrollBarPositionWidth, this.hScrollBarHeight - 2);

    // vertical scroll
    this.context.fillStyle = styles.ui.scrollbarHolder; 
    this.context.fillRect(this.width - this.vScrollBarWidth, 0, this.vScrollBarWidth, this.viewHeight);
    this.context.fillStyle = styles.ui.scrollbar;
    this.context.fillRect(this.width - this.vScrollBarWidth + 1, this.vScrollBarPosition , this.vScrollBarWidth - 2, this.vScrollBarPositionHeight);
      
  },


  render: function() {
    if(this.editor.type == '3d') {
      // shouldn't get here if 3d, but just in case
      return;
    }

    var drawTools = this.editor.tools.drawTools;


    if(drawTools.tool == 'type') {
      // blink the cursor
      this.typingCursor();
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(this.canvas == null) {
      this.uiComponent.resize();
    } else {

      /*
      this.canvas.width = this.canvas.width;
      this.context = this.canvas.getContext("2d");
      var scale = this.uiComponent.getScale();
      this.context.scale(scale, scale);
  
      this.context.imageSmoothingEnabled = false;
      this.context.webkitImageSmoothingEnabled = false;
      this.context.mozImageSmoothingEnabled = false;
      this.context.msImageSmoothingEnabled = false;
      this.context.oImageSmoothingEnabled = false;
      */  
    }

//    console.log('render!');


    if(g_newSystem) {
      this.draw();
      return;
    }

    

    var srcCanvas = this.editor.grid.grid2d.canvas;

    var x = Math.floor(this.width / 2 - srcCanvas.width * this.scale / 2 - this.camera.position.x * this.scale);
    var y = Math.floor(this.height / 2 - srcCanvas.height * this.scale / 2 + this.camera.position.y * this.scale);

    this.viewWidth = this.width - this.vScrollBarWidth;
    this.viewHeight = this.height - this.hScrollBarHeight;
    this.srcWidth = srcCanvas.width * this.scale;
    this.srcHeight = srcCanvas.height * this.scale;
    this.scrollX = -x;
    this.scrollY = -y;


    var graphic = this.editor.graphic;

    var borderVisible = this.editor.grid.border.visible && graphic.getType() != 'sprite';
    
    if(x > 0 || y > 0 || x + srcCanvas.width * this.scale < this.width || y + srcCanvas.height * this.scale < this.height) {  

      // is one of the edges within the display (so background will be visible)
      this.context.clearRect(0, 0, this.width, this.height);

      this.context.fillStyle = styles.textMode.gridView2dBackground;
      this.context.fillRect(0, 0, this.width, this.height);

      if(borderVisible) {
        for(var i = 0; i < this.editor.layers.layers.length; i++) {
          var layer = this.editor.layers.layers[i];

          if( ( layer.visible ) 
            && (layer.type == 'grid' )) {

            
            var layerObject = null;

            layerObject = this.editor.layers.getLayerObject(layer.layerId);

            if(layerObject && typeof layerObject.getBorderColor != 'undefined') {
              var colorPalette = layerObject.getColorPalette();

              var borderWidth = 8 * 4;// tileSet.charWidth * 4;
              var borderColor = layerObject.getBorderColor();

              if(borderColor != this.editor.colorPaletteManager.noColor) {
                this.context.fillStyle = '#' + colorPalette.getHexString(borderColor);;

                // might need to draw borders
                if(x > 0) {
                  this.context.fillRect(x - borderWidth * this.scale, y - 2, borderWidth * this.scale, srcCanvas.height * this.scale + 4);
                }
                if(x+ srcCanvas.width * this.scale < this.width) {
                  this.context.fillRect(x + srcCanvas.width * this.scale, y - 2, borderWidth * this.scale, srcCanvas.height * this.scale + 4);
                }

                if(y > 0) {
                  this.context.fillRect(x - borderWidth * this.scale, y - borderWidth * this.scale, (srcCanvas.width + 2 * borderWidth) * this.scale, borderWidth * this.scale);
                }
                this.context.fillRect(x - borderWidth * this.scale, y + srcCanvas.height * this.scale, (srcCanvas.width + 2 * borderWidth) * this.scale, borderWidth * this.scale);
              }

            }
          }
        }
      }




      // set this to true for now..
      // really should only do it if no layers visible, background is hidden or all layers have transparent background
      if(true || !this.editor.layers.isBackgroundVisible()) {
        var bgWidth = srcCanvas.width * this.scale;
        var bgHeight = srcCanvas.height * this.scale;
        var bgPosX = x;
        var bgPosY = y;
        if(bgPosY < 0) {
          bgHeight += bgPosY;
          bgPosY = 0;
        }
        if(bgPosX < 0) {
          bgWidth += bgPosX;
          bgPosX = 0;
        }

        // draw checkerboard
        this.setupBackgroundCanvas();
        this.context.drawImage(this.backgroundCanvas, 
                                0, 0, bgWidth, bgHeight,
                                bgPosX, bgPosY, bgWidth, bgHeight);
      }

    } else {
      if(true || !this.editor.layers.isBackgroundVisible()) {
      // draw checkerboard
        this.setupBackgroundCanvas();
        this.context.drawImage(this.backgroundCanvas, 
                                0, 0, this.width, this.height,
                                0, 0, this.width, this.height);


      }
    }




    var srcX = 0;
    var srcY = 0;
    var srcWidth = srcCanvas.width ;
    var srcHeight = srcCanvas.height;

    var dstX = x;
    var dstY = y;
    var dstWidth = srcWidth * this.scale;
    var dstHeight = srcHeight * this.scale;

    // need to calculate srcx, srcy first then dst x
    if(x < 0) {
      srcX = -Math.floor(x / this.scale) - 1;
      if(srcX < 0) {
        srcX = 0;
      }
      dstX = x + srcX * this.scale;
    }

    if(y < 0) {
      srcY = -Math.floor(y / this.scale) - 1;
      if(srcY < 0) {
        srcY = 0;
      }
      dstY = y + srcY * this.scale;
    }

    srcWidth = Math.ceil( (this.width - dstX) / this.scale);
    if(srcX + srcWidth > srcCanvas.width) {
      srcWidth = srcCanvas.width - srcX;
    }
    dstWidth = srcWidth * this.scale;

    srcHeight = Math.ceil(  (this.height - dstY) / this.scale);
    if(srcY + srcHeight > srcCanvas.height) {
      srcHeight = srcCanvas.height - srcY;
    }
    dstHeight = srcHeight * this.scale;

    this.editor.graphic.setViewBounds(srcX, srcY, srcX + srcWidth, srcY + srcHeight);

    this.context.drawImage(srcCanvas, 
          srcX, srcY, srcWidth, srcHeight,
          dstX, dstY, dstWidth, dstHeight);

    if(!UI.isMobile.any()) {
      this.drawCursor({ context: this.context, offsetX: x, offsetY: y, scale: this.scale });
    }

    this.drawGrid(x, y, srcCanvas.width, srcCanvas.height);


    if(drawTools.select.isActive()) {
      this.drawSelect();
    }

    if(drawTools.pixelSelect.isActive()) {
      this.drawPixelSelect();
    }

    if(drawTools.pixelSelect.isInPasteMove()) {
      this.drawPixelPasteMove();
    }

    this.drawZoom();

    if(drawTools.mirrorH) {
      this.drawMirrorH(x, y, srcCanvas.width, srcCanvas.height);
    }

    if(drawTools.mirrorV) {
      this.drawMirrorV(x, y, srcCanvas.width, srcCanvas.height);
    }

    // draw the scroll bars
    this.calculateScroll();

    this.context.fillStyle = styles.ui.scrollbarHolder;

    // horizontal scroll
    this.context.fillRect(0, this.height - this.hScrollBarHeight, this.viewWidth, this.hScrollBarHeight);
    this.context.fillStyle = styles.ui.scrollbar;
    this.context.fillRect(this.hScrollBarPosition, this.height - this.hScrollBarHeight + 1, this.hScrollBarPositionWidth, this.hScrollBarHeight - 2);

    // vertical scroll
    this.context.fillStyle = styles.ui.scrollbarHolder; 
    this.context.fillRect(this.width - this.vScrollBarWidth, 0, this.vScrollBarWidth, this.viewHeight);
    this.context.fillStyle = styles.ui.scrollbar;
    this.context.fillRect(this.width - this.vScrollBarWidth + 1, this.vScrollBarPosition , this.vScrollBarWidth - 2, this.vScrollBarPositionHeight);
  }


}
