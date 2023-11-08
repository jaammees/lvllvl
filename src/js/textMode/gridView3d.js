var GridView3d = function() {
  this.editor = null;
  this.uiComponent = null;
  this.camera = null;
  this.cameraControls = null;
  this.viewIsPerspective = true;

  this.view = ''
  this.viewType = '';
  this.left = 0;
  this.top = 0;
  this.width = 0;
  this.height = 0;
  this.scale = 30;

  this.lastX = 0;
  this.lastY = 0;

  this.raycaster = null;
  this.mouse = null;  
  this.mouseInCanvas = false;

  this.foundCell = {x: 0, y: 0, z: 0};


  this.buttons = 0;

  this.lastTouchEnded = true;
  this.touchMoved = false;
  this.touchZoom = false;
  this.touchCellDrawn = false;

  this.pinchStartScale = 1;
}


GridView3d.prototype = {

  setViewType: function(viewType) {
    this.viewType = viewType;
  },

  getCamera: function() {
    return this.camera;

  },

  setupCamera: function() {
    var grid3d = this.editor.grid3d;

    var cellSizeX = grid3d.getCellSizeX();// 8 * pixelSizeX * pixelTo3dUnits;
    var cellSizeY = grid3d.getCellSizeY();//8 * pixelSizeY * pixelTo3dUnits;
    var cellSizeZ = grid3d.getCellSizeZ();//8 * pixelSizeZ * pixelTo3dUnits;


    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var gridDepth = grid3d.getGridDepth();


    switch(this.viewType) {
      case '3d':

        this.viewIsPerspective = true;
        this.fov = 30;//45;

        if(this.camera == null) {
          this.camera = new THREE.PerspectiveCamera( this.fov, window.innerWidth/window.innerHeight, 0.1, 1000 );

          this.camera.position.x =  cellSizeX * gridWidth / 2;
          this.camera.position.y =  cellSizeY * gridHeight / 2;
          this.camera.position.z = 100;

  //        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

          this.cameraControls = new THREE.Camera3dControls( this.camera, UI.renderer.domElement );
          this.cameraControls.enableDamping = true;
          this.cameraControls.dampingFactor = 0.25;
          this.setCameraTarget(cellSizeX * gridWidth / 2, 0, cellSizeZ * gridDepth / 2);
  //        this.cameraControls.enableZoom = false;
          this.cameraControls.update();
        }

//        this.background = new THREE.Color( 0.5, 0.5, 0.7 );

        break;
      case 'front':
        this.viewIsPerspective = false;
        var near = 1;
        var far = 1000;
        var width = 40;
        var height = 40;


        if(this.camera == null) {
          this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );
          this.camera.position.x = Math.floor(gridWidth / 2) * cellSizeX;
          this.camera.position.y = Math.floor(gridHeight / 2) * cellSizeY;
          this.camera.position.z = 100;
      }



        /*
        this.setCameraPosition(Math.floor(gridWidth / 2) * cellSizeX, 
                               Math.floor(gridHeight / 2) * cellSizeY, 
                               1100);
        */

//        this.background = new THREE.Color( 0.1, 0.1, 0.7 );

        break;
      case 'top':
        this.viewIsPerspective = false;

        var near = 1;
        var far = 10000;
        var width = 40;
        var height = 40;
        
        if(this.camera == null) {
          this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

          this.camera.position.x = Math.floor(gridWidth / 2) * cellSizeX;
          this.camera.position.y = 2000;
          this.camera.position.z = Math.floor(gridDepth / 2) * cellSizeZ;
          this.camera.rotation.x = -Math.PI / 2;
        }
/*
        this.setCameraPosition(Math.floor(gridWidth/2) * cellSizeX, 
                               100, 
                               Math.floor(gridDepth/2) * cellSizeZ);
*/

//        this.background = new THREE.Color( 0.7, 0.1, 0.7 );

        break;
    }
    this.background = new THREE.Color( 0.3, 0.3, 0.3 );    
  },

  toolChanged: function() {
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    if(tool != 'type') {
      grid3d.setTypingCursorMeshVisible(false);
    }

    if(tool == 'erase' || tool == 'eyedropper') {
      grid3d.setCursorTile(this.editor.tileSetManager.noTile);
    } else {
      var currentTiles = this.editor.currentTile.getTiles();
      if(currentTiles.length > 0) {
        grid3d.setCursorTile(currentTiles[0][0]);
      }
    }

  },

  setCameraPosition: function(x, y, z) {
    this.camera.position.x = x;
    this.camera.position.y = y;
    this.camera.position.z = z;
  },

  setCameraTarget: function(x, y, z) {
    this.cameraControls.target.x = x;
    this.cameraControls.target.y = y;
    this.cameraControls.target.z = z;
  },

  init: function(editor, uiComponent, args) {
    var _this = this;
    this.editor = editor;
    this.uiComponent = uiComponent;

    var viewType = '3d';
    if(typeof args.view != 'undefined') {
      viewType = args.view;
    }

    this.setViewType(viewType);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    uiComponent.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);
    });

    this.uiComponent.on('render', function(left, top, width, height) {
      _this.render(left, top, width, height);
    });

    UI.on('ready', function() {
      var id = _this.uiComponent.id;
      $('#' + id).on('mouseenter', function(event) {
        _this.mouseEnter(event);
        _this.mouseInCanvas = true;
      });
      $('#' + id).on('mouseleave', function(event) {
        _this.mouseLeave(event);
        _this.mouseInCanvas = false;
      });

      $('#' + id).on('mousedown', function(event) {
        _this.mouseDown(event);
      });
      $('#' + id).on('mouseup', function(event) {
        _this.mouseUp(event);
      });
      $('#' + id).on('mousemove', function(event) {
        _this.mouseMove(event);
      });

      $('#' + id).on('contextmenu', function(event) {
        console.log('context menu!!');
        event.preventDefault();
      });

  
  

      var viewElement = document.getElementById(id);

      viewElement.addEventListener("touchstart", function(event){
        _this.touchStart(event);
  
      }, false);
  
      viewElement.addEventListener("touchmove", function(event){
        _this.touchMove(event);
        return false;
      }, false);
  
      viewElement.addEventListener("touchend", function(event) {
        _this.touchEnd(event);
  
        /*
        _this.pan = false;
        if(event.touches.length == 1) {
          _this.mouseUp(event.touches[0]);
          event.preventDefault();
        }
        */
      }, false);

      
      document.getElementById(id).addEventListener('wheel', function(event) {
        _this.mouseWheel(event);
      }, false);

      /*
      $('#' + id).on('wheel', function(event) {
        _this.mouseWheel(event);
      });
      */

    });
    return;
  },

  mouseWheel: function(event) {
    event.preventDefault();  

    var wheel = normalizeWheel(event);
//    this.zoomToXY(x, y, -wheel.spinY / 4);
    if(this.viewType == '3d') {
      if(wheel.spinY < 0) {
        this.cameraControls.zoomSpeed = -wheel.spinY;
        this.cameraControls.dollyOut();//delta*1.01);
      } else {
        this.cameraControls.zoomSpeed = wheel.spinY;
        this.cameraControls.dollyIn();//-delta*1.01);
      }
      this.cameraControls.update();
    } else {
      var newScale = this.scale - wheel.spinY;
      if(newScale <= 0) {
        return;
      }
      this.scale = newScale;      
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

  doEyedropper: function() {
    var grid3d = this.editor.grid3d;
    var drawTools = this.editor.tools.drawTools;

    var x = grid3d.getCursorX();
    var y = grid3d.getCursorY();
    var z = grid3d.getCursorZ();

    var cell = grid3d.getCell(x, y, z);

    if(drawTools.drawCharacter) {
      this.editor.currentTile.setCharacters([[ cell.t ]]);
    }
    if(drawTools.drawColor) {
      this.editor.currentTile.setColor(cell.fc);
    }

    if(drawTools.drawBGColor) {
      this.editor.currentTile.setBGColor(cell.bc);
    }
  },

  toolStart: function(event) {
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;


    switch(tool) {
      case 'type':
          this.editor.tools.drawTools.typing.setCursorPosition({
            x: grid3d.getCursorX(),
            y: grid3d.getCursorY(),
            z: grid3d.getCursorZ()
          });
        break;
      case 'eyedropper':
        this.doEyedropper();
        break;
      case 'pen':
      case 'erase':
        this.editor.history.startEntry('draw');
        grid3d.setCellFromCursor();
        break;
      case 'rect':
      case 'oval':
      case 'line':
        var plane = 'xy';

        if(this.viewType == 'top') {
          plane = 'xz';
        }

        if(this.viewType == '3d') {
          if(grid3d.getCursorZ() !== grid3d.getXYPosition() && grid3d.getCursorY() == grid3d.getXZPosition()) {
            plane = 'xz';
          }
        }

        grid3d.shapes.startShape(tool, 
                                      grid3d.getCursorX(), 
                                      grid3d.getCursorY(), 
                                      grid3d.getCursorZ(), 
                                      plane);        
        break;
      case 'select':
        
        if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
          
          grid3d.selection.startSelection(grid3d.getCursorX(), grid3d.getCursorY(), grid3d.getCursorZ());
        }

        break;
    }

  },

  toolMove: function(event) {
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    switch(tool) {
      case 'hand':

      break;
      case 'eyedropper':
        break;
      case 'pen':
      case 'erase':  
        if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
          grid3d.setCellFromCursor();
        }
        break;
      case 'rect':
      case 'oval':
      case 'line':
        if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
          grid3d.shapes.setShapeTo(grid3d.getCursorX(), 
                                    grid3d.getCursorY(), 
                                    grid3d.getCursorZ()); 
        }
        break;
      case 'select':
        console.log('select move');
        if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
          grid3d.selection.selectionTo(grid3d.getCursorX(), 
                                        grid3d.getCursorY(), 
                                        grid3d.getCursorZ());
        }

        break;
    }
  },

  toolEnd: function(event) {
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    switch(tool) {
      case 'eyedropper':
        break;
      case 'pen':
      case 'erase':  
        if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
          //grid3d.setCellFromCursor();
        }
        break;
      case 'rect':
      case 'oval':
      case 'line':
        grid3d.shapes.endShape(); 
        break;
    }    
    this.editor.history.endEntry();
    grid3d.lastCellSetX = false;
    grid3d.lastCellSetY = false;
    grid3d.lastCellSetZ = false;

  },


  toolPan: function(deltaX, deltaY) {
    var grid3d = this.editor.grid3d;
    
    var cellSizeX = grid3d.getCellSizeX();
    var cellSizeY = grid3d.getCellSizeY();
    var cellSizeZ = grid3d.getCellSizeZ();

    if(this.viewType == '3d') {
      this.cameraControls.pan(deltaX, deltaY);
      this.cameraControls.update();
    } else if(this.viewType == 'top') {
      this.setCameraPosition(
        this.camera.position.x - deltaX * cellSizeX / this.scale, 
        this.camera.position.y, 
        this.camera.position.z - deltaY * cellSizeZ  / this.scale
      );          

    } else if(this.viewType == 'front') {
      this.setCameraPosition(
        this.camera.position.x - deltaX * cellSizeX / this.scale, 
        this.camera.position.y + deltaY * cellSizeY  / this.scale, 
        this.camera.position.z);        
    }
  },


  toolRotate: function(deltaX, deltaY) {

    if(this.viewType == '3d') {
      this.cameraControls.rotateLeft(deltaX / 20);
      this.cameraControls.rotateUp(deltaY / 20);
      this.cameraControls.update();
    } else if(this.viewType == 'top') {

    } else if(this.viewType == 'front') {
    }
  },


  touchStart: function(event) {
    if(event.cancelable) {
      event.preventDefault();
    }

    var elementId = this.uiComponent.id;

    var drawTools = this.editor.tools.drawTools;
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;


    var touches = event.touches;
 
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
      this.touchStart0X = touches[0].pageX - $('#' + elementId).offset().left;
      this.touchStart0Y = touches[0].pageY - $('#' + elementId).offset().top;

      this.touchStart1X = touches[1].pageX - $('#' + elementId).offset().left;
      this.touchStart1Y = touches[1].pageY - $('#' + elementId).offset().top;


      this.touchStartDistance =   (this.touchStart0X - this.touchStart1X) * (this.touchStart0X - this.touchStart1X)
                                + (this.touchStart0Y - this.touchStart1Y) * (this.touchStart0Y - this.touchStart1Y);
      this.touchStartDistance = Math.sqrt(this.touchStartDistance);

      this.touchStartMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchStartMidY = (this.touchStart0Y + this.touchStart1Y) / 2;
      this.touchMoveMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchMoveMidY = (this.touchStart0Y + this.touchStart1Y) / 2;

      this.lastX = this.touchMoveMidX;
      this.lastY = this.touchMoveMidY;


      this.pinchStartScale = this.cameraControls.getScale();
    }

    if(touches.length == 1) {
  
      this.touchCount = 1;
      this.lastTouchEnded = false;
      this.touchCellDrawn = false;
      this.touchMoved = false;
      this.touchZoom = false;

      this.touchStartCellX = false;
      this.touchStartCellY = false;

      var x = touches[0].pageX - $('#' + this.uiComponent.id).offset().left;
      var y = touches[0].pageY - $('#' + this.uiComponent.id).offset().top;

      this.buttons = UI.LEFTMOUSEBUTTON;
      this.leftMouseUp = false;

  
      this.lastX = x;
      this.lastY = y;
      var findEmptyCell = true;
      if(tool == 'erase' || tool == 'eyedropper') {
        findEmptyCell = false;
      } else {
        if(!drawTools.drawCharacter) {
          findEmptyCell = false;
        }
      }
  
      if(this.findCellFromXY(x, y, findEmptyCell)) {
        grid3d.setCursorEnabled(true);
      } else {
        grid3d.setCursorEnabled(false);
      }

      this.toolStart(event.touches[0]);
      /*
      

      this.lastMouseX = x;
      this.lastMouseY = y;

      this.mouseDownAtX = x;
      this.mouseDownAtY = y;

      this.mouseDownCameraX = this.camera.position.x;
      this.mouseDownCameraY = this.camera.position.y;

      */

      /*
      if(this.editor.tools.drawTools.tool == 'hand' || this.editor.tools.drawTools.tool == 'pixelhand') {
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
*/
    }
  },

  touchMove: function(event) {
    var elementId = this.uiComponent.id;
    if(event.cancelable) {
      event.preventDefault();
    }
    var drawTools = this.editor.tools.drawTools;
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    var touches = event.touches;


    if(touches.length == 1) {
      if(this.touchZoom) {
        // dont want to draw anything until zoom is over
        return;
      }

      var x = touches[0].pageX - $('#' + elementId).offset().left;
      var y = touches[0].pageY - $('#' + elementId).offset().top;
      

      this.buttons = UI.LEFTMOUSEBUTTON;
      this.leftMouseUp = false;

      var deltaX = x - this.lastX;
      var deltaY = y - this.lastY;

  
      this.lastX = x;
      this.lastY = y;

      if(tool == 'hand') {
        this.toolPan(deltaX, deltaY);        
      } else if(tool == 'rotate') {
        this.toolRotate(deltaX, deltaY);
      } else {
        var findEmptyCell = true;      
        if(tool == 'erase' || tool == 'eyedropper') {
          findEmptyCell = false;
        } else {
          if(!drawTools.drawCharacter) {
            findEmptyCell = false;
          }
        }
    
        if(this.findCellFromXY(x, y, findEmptyCell)) {
          grid3d.setCursorEnabled(true);
          this.touchMoved = true;
        } else {
          grid3d.setCursorEnabled(false);
        }

        this.toolMove(touches[0]);
      }

      /*
      var x = touches[0].pageX - $('#' + elementId).offset().left;
      var y = touches[0].pageY - $('#' + elementId).offset().top;

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
        this.editor.grid.grid2d.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
        this.editor.grid.grid2d.setCursorEnabled(true);      
      }

      console.log('tool move');
      this.toolMove(touches[0]);
      */
    }

    if(touches.length == 2) {

      if(this.touchStartDistance < 80) {
        // havent passed the threshold yet
        this.touchStart0X = touches[0].pageX - $('#' + elementId).offset().left;
        this.touchStart0Y = touches[0].pageY - $('#' + elementId).offset().top;

        this.touchStart1X = touches[1].pageX - $('#' + elementId).offset().left;
        this.touchStart1Y = touches[1].pageY - $('#' + elementId).offset().top;

        this.touchStartDistance =   (this.touchStart0X - this.touchStart1X) * (this.touchStart0X - this.touchStart1X)
                                  + (this.touchStart0Y - this.touchStart1Y) * (this.touchStart0Y - this.touchStart1Y);
        this.touchStartDistance = Math.sqrt(this.touchStartDistance);

        this.touchStartMidX = (this.touchStart0X + this.touchStart1X) / 2;
        this.touchStartMidY = (this.touchStart0Y + this.touchStart1Y) / 2;
        this.touchMoveMidX = (this.touchStart0X + this.touchStart1X) / 2;
        this.touchMoveMidY = (this.touchStart0Y + this.touchStart1Y) / 2;

        this.pinchStartScale = this.cameraControls.getScale();



      } else {
        this.touchMove0X = touches[0].pageX - $('#' + elementId).offset().left;
        this.touchMove0Y = touches[0].pageY - $('#' + elementId).offset().top;

        this.touchMove1X = touches[1].pageX - $('#' + elementId).offset().left;
        this.touchMove1Y = touches[1].pageY - $('#' + elementId).offset().top;

        this.touchMoveDistance =   (this.touchMove0X - this.touchMove1X) * (this.touchMove0X - this.touchMove1X)
                                  + (this.touchMove0Y - this.touchMove1Y) * (this.touchMove0Y - this.touchMove1Y);
        this.touchMoveDistance = Math.sqrt(this.touchMoveDistance);


        var midX = (this.touchMove0X + this.touchMove1X) / 2;
        var midY = (this.touchMove0Y + this.touchMove1Y) / 2;

        var diffX = midX - this.touchMoveMidX;
        var diffY = midY - this.touchMoveMidY;

        this.touchMoveMidX = (this.touchMove0X + this.touchMove1X) / 2;
        this.touchMoveMidY = (this.touchMove0Y + this.touchMove1Y) / 2;

//        this.toolPan(diffX, diffY); 

/*
        var srcCanvas = this.editor.grid.grid2d.canvas;

        var zoomX = this.touchMoveMidX / this.scale - this.width / (2 * this.scale) + srcCanvas.width / 2 
                  + this.camera.position.x - diffX / this.scale;

        var zoomY = this.height / this.scale - this.touchMoveMidY / this.scale - 
                  this.height / (2 * this.scale) + srcCanvas.height  / 2 + this.camera.position.y
                  + diffY / this.scale;
*/

        var newScale = this.pinchStartScale 
                        + ((this.touchStartDistance / this.touchMoveDistance) - 1) * this.pinchStartScale * 0.1;
        this.cameraControls.setScale(newScale);
        this.cameraControls.pan(diffX, diffY);
        this.cameraControls.update();

/*
        var newScale = (this.touchMoveDistance / this.touchStartDistance) * this.pinchStartScale;

        if(newScale > 1) {
//          this.cameraControls.zoomSpeed = 1;

          this.cameraControls.dollyOut();//delta*1.01);
          this.cameraControls.update();

        } else {
//          this.cameraControls.zoomSpeed = 1;
          this.cameraControls.dollyIn();//delta*1.01);
          this.cameraControls.update();

        }
*/

//        var cameraPosX = zoomX - this.touchMoveMidX / this.scale + this.width / (2 * this.scale) - srcCanvas.width / 2;
//        var cameraPosY = zoomY - this.height / this.scale + this.touchMoveMidY / this.scale + this.height / (2 * this.scale) - srcCanvas.height / 2

//        this.setCameraPosition(cameraPosX, cameraPosY);
      }
    }

  },

  touchEnd: function(event) {
    event.preventDefault();
    var drawTools = this.editor.tools.drawTools;
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    var elementId = this.uiComponent.id;

    this.lastTouchEnded = true;
    var touches = event.changedTouches;

    this.pan = false;

    var cell = false;


    if(touches.length == 1) {
      // touches will equal zero if touch end of one touch
      var x = touches[0].pageX - $('#' + elementId).offset().left;
      var y = touches[0].pageY - $('#' + elementId).offset().top;

    }

    if(this.touchCount == 2 && (tool == 'oval' || tool == 'rect' || tool == 'line')) {
      // doing a pinch, so dont want to draw a shape
      this.editor.tools.drawTools.shapes.cancelShape();
    } else {
      this.toolEnd();
    }

    if(UI.isMobile.any()) {
      g_app.autosave();
    }
  },


  
  setMouseCursor: function(event) {
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;


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
        && tool != 'type'
        && tool != 'select') {
     //   this.editor.grid.grid2d.setCursorEnabled(false);
        UI.setCursor('eyedropper');
        return;
      }

      switch(tool) {
        case 'pen':
        case 'block':

          if(grid3d.getCursorEnabled()) { 
            if(typeof event != 'undefined' && event.altKey) {
              //this.editor.grid.grid2d.setCursorEnabled(false);

              UI.setCursor('eyedropper');
            } else {
              UI.setCursor('draw');
            }
          } else {
            UI.setCursor('default');            
          }
          break;
        case 'erase':
          if(grid3d.getCursorEnabled()) { 
            UI.setCursor('erase');
          } else {
            UI.setCursor('default');
          }
          break;
        case 'fill':
          if(grid3d.getCursorEnabled()) { 
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
          UI.setCursor('pixel');
          break;
        case 'type':
          UI.setCursor('text');
          break;
        case 'hand':
        case 'pixelhand':
          if(this.buttons & UI.LEFTMOUSEBUTTON ||  this.pan ) {
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

          if(grid3d.getCursorEnabled()) { 

            UI.setCursor('move');
          } else {
            UI.setCursor('default');
          }
          break;
      }
    }

  },

  mouseDown: function(event) {
    var elementId = this.uiComponent.id;
    var x = event.pageX - $('#' + elementId).offset().left;
    var y = event.pageY - $('#' + elementId).offset().top;
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;


    this.mouseDownX = x;
    this.mouseDownY = y;

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


    if(this.buttons & UI.MIDDLEMOUSEBUTTON) {
      event.preventDefault();
    }

    this.setMouseCursor(event);

    if(this.buttons & UI.LEFTMOUSEBUTTON && !event.metaKey) {

      if(tool == 'select') {
        if(grid3d.selection.mouseDown(x, y, this)) {
          return;
        }
      }
  
      this.toolStart();
    }

  },

  mouseUp: function(event) {
    var elementId = this.uiComponent.id;
    var tool = this.editor.tools.drawTools.tool;
    var grid3d = this.editor.grid3d;

    var x = event.pageX - $('#' + elementId).offset().left;
    var y = event.pageY - $('#' + elementId).offset().top;

  
    this.mouseIsDown = false;
    

    if(tool == 'select') {
      grid3d.selection.mouseUp(x, y, this);
    }
    if(!UI.isMobile.any()) {
      this.setButtons(event);
    } else {
      this.buttons = 0;
    }

    this.toolEnd();

    this.setMouseCursor(event);


  },

  mouseMove: function(event) {
    var elementId = this.uiComponent.id;

    var x = event.pageX - $('#' + elementId).offset().left;
    var y = event.pageY - $('#' + elementId).offset().top;


    var tool = this.editor.tools.drawTools.tool;


    var deltaX = x - this.lastX;
    var deltaY = y - this.lastY;

    var grid3d = this.editor.grid3d;
    var drawTools = this.editor.tools.drawTools;


    this.lastX = x;
    this.lastY = y;
    var findEmptyCell = true;
    if(tool == 'erase' || tool == 'eyedropper') {
      findEmptyCell = false;
    } else {
      if(!drawTools.drawCharacter) {
        findEmptyCell = false;
      }
    }

    if(this.findCellFromXY(x, y, findEmptyCell)) {
      grid3d.setCursorEnabled(true);
    } else {
      grid3d.setCursorEnabled(false);
    }

    if(this.buttons == 0) {
      this.setMouseCursor(event); 
    }

    if(tool == 'select') {
      if(grid3d.selection.mouseMove(x, y, this)) {
        return;
      }
    }


    if((tool == 'hand' && (this.buttons & UI.LEFTMOUSEBUTTON) )
        ||(this.buttons & UI.LEFTMOUSEBUTTON && event.metaKey && event.shiftKey)
        || (this.buttons & UI.MIDDLEMOUSEBUTTON && (event.shiftKey  || this.viewType != '3d' )   )) {
      this.toolPan(deltaX, deltaY);
    } else if((tool == 'rotate' && (this.buttons & UI.LEFTMOUSEBUTTON))
              || (this.buttons & UI.LEFTMOUSEBUTTON && event.metaKey && !event.shiftKey)
              || (this.buttons & UI.MIDDLEMOUSEBUTTON && !event.shiftKey)) {
      this.toolRotate(deltaX, deltaY);
    } else if(this.buttons & UI.LEFTMOUSEBUTTON && !event.metaKey) {
      this.toolMove(event);
    } 
  
  },


  mouseEnter: function(event) {
    if(!this.mouseIsDown) {
//      this.editor.grid.grid2d.setCursorEnabled(true);
      this.setMouseCursor(event);
    }
  },

  mouseLeave: function(event) {
    if(UI.getMouseIsCaptured()) {
      return;
    }

    UI.setCursor('default');
  //  this.editor.info.leaveGrid();
    
    this.editor.grid3d.setCursorEnabled(false);
  },

  setCameraPosition: function(x, y, z) {

    if(!this.camera) {
      return;
    }

    this.camera.position.x = x;
    this.camera.position.y = y;
    this.camera.position.z = z;
  },


  findCellFromXY: function(x, y, emptyOnly) {
        
    y = this.height - y;
    var grid3d = this.editor.grid3d;
    var wantEmptyCell = true;
    if(typeof emptyOnly != 'undefined') {
      wantEmptyCell = emptyOnly;
    }

    this.mouse.x = (x / this.width) * 2 - 1;
    this.mouse.y = (y / this.height) * 2 - 1;


    var closestDistance = 100000;
    var foundCursorLocation = false;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    var currentLayer = grid3d.getCurrentLayer();
    var cellSizeX = grid3d.getCellSizeX();
    var cellSizeY = grid3d.getCellSizeY();
    var cellSizeZ = grid3d.getCellSizeZ();
    
    // if want an empty cell, first check grid
    if(wantEmptyCell) {
      // find the intersection with the grid planes.
      var objects = this.raycaster.intersectObjects(currentLayer.planes);
      if(objects.length > 0) {
        var object = objects[0];
        var point = object.point;
        if(object.object.gridPlane == 'xy') {
          // if xy grid not visible, dont intersect with it in 3d view
          if(this.viewType != '3d' || this.editor.grid3d.getXYGridVisible()) {
            var x = Math.floor(point.x / cellSizeX);
            var y = Math.floor(point.y / cellSizeY);
            var z = grid3d.getXYPosition();

            closestDistance = object.distance * object.distance;
            grid3d.setCursorPosition(x, y, z);
            foundCursorLocation = true;     
          }
        }

        if(object.object.gridPlane == 'xz') {
          if(this.viewType != '3d' || this.editor.grid3d.getXZGridVisible()) {
            var x = Math.floor(point.x / cellSizeX)
            var y = grid3d.getXZPosition();
            var z = Math.floor(point.z / cellSizeZ);

            closestDistance = object.distance * object.distance;
            grid3d.setCursorPosition(x, y, z);
            foundCursorLocation = true;     
          }
        }
      }
    }

    if(this.viewType == '3d') {
  
      // intersection with boxes
      var ray = this.raycaster.ray;

      var holder = this.editor.grid3d.getHolder();

      var closestBox = null;
      var closestPoint = new THREE.Vector3();

      var intersectionPoint = new THREE.Vector3();

      for(var i = 0; i < holder.children.length; i++) {
        if(ray.intersectBox(holder.children[i].box, intersectionPoint)) {

          var distance = (this.camera.position.x - intersectionPoint.x) * (this.camera.position.x - intersectionPoint.x) +
                          (this.camera.position.y - intersectionPoint.y) * (this.camera.position.y - intersectionPoint.y) +
                          (this.camera.position.z - intersectionPoint.z) * (this.camera.position.z - intersectionPoint.z);
          if(distance < closestDistance) {
            closestPoint.x = intersectionPoint.x;
            closestPoint.y = intersectionPoint.y;
            closestPoint.z = intersectionPoint.z;

            closestBox = holder.children[i].box;
            closestDistance = distance;
          }
        }
      }


      var drawTool = 'pen';
      var drawMode = 'both';
      if(closestBox) {
        if(wantEmptyCell) {
          if(grid3d.lastCellSetX == closestBox.gridPosition.x 
              && grid3d.lastCellSetY == closestBox.gridPosition.y 
              && grid3d.lastCellSetZ == closestBox.gridPosition.z) {
            foundCursorLocation = false;
          } else {
            var offsetX = 0;
            var offsetY = 0;
            var offsetZ = 1;
            var face = 'front';
            var frontDistance = (closestPoint.z - closestBox.max.z) * (closestPoint.z - closestBox.max.z);
        
            var closestDistance = frontDistance;

            // test back
            var backDistance = (closestPoint.z - closestBox.min.z) * (closestPoint.z - closestBox.min.z);
            if(backDistance < closestDistance) {
              face = 'back';
              offsetX = 0;
              offsetY = 0;
              offsetZ = -1;
              closestDistance = backDistance;
            }


            // test top
            var topDistance = (closestPoint.y - closestBox.max.y) * (closestPoint.y - closestBox.max.y);
            if(topDistance < closestDistance) {
              face = 'top';
              offsetX = 0;
              offsetY = 1;
              offsetZ = 0;
              closestDistance = topDistance;
            }


            // test bottom
            var bottomDistance = (closestPoint.y - closestBox.min.y) * (closestPoint.y - closestBox.min.y);
            if(bottomDistance < closestDistance) {
              face = 'bottom';
              offsetX = 0;
              offsetY = -1;
              offsetZ = 0;
              closestDistance = bottomDistance;
            }


            // test left
            var leftDistance = (closestPoint.x - closestBox.min.x) * (closestPoint.x - closestBox.min.x);
            if(leftDistance < closestDistance) {
              face = 'left';
              offsetX = -1;
              offsetY = 0;
              offsetZ = 0;
              closestDistance = leftDistance;
            }

            // test right
            var rightDistance = (closestPoint.x - closestBox.max.x) * (closestPoint.x - closestBox.max.x);
            if(rightDistance < closestDistance) {
              face = 'right';
              offsetX = 1;
              offsetY = 0;
              offsetZ = 0;
              closestDistance = rightDistance;
            }

            var x = closestBox.gridPosition.x + offsetX;
            var y = closestBox.gridPosition.y + offsetY;
            var z = closestBox.gridPosition.z + offsetZ;

            grid3d.setCursorPosition(x, y, z);
            foundCursorLocation = true;
          }
        } else {
          // want a filled cell, dont need to check sides.
          var x = closestBox.gridPosition.x;
          var y = closestBox.gridPosition.y;
          var z = closestBox.gridPosition.z;

          grid3d.setCursorPosition(x, y, z);
          foundCursorLocation = true;
        }          
      }
    }

    if(!foundCursorLocation) {
      
    }

    return foundCursorLocation;
  },

  getScale: function() {
    return this.scale;
  },

  resize: function(left, top, width, height) {
    


    if(this.viewType == '3d') {
    }

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;


    if(!this.camera) {
      return;
    }


    if(this.viewIsPerspective) {
      this.camera.aspect = width / height;
    } else {
      this.camera.left = -width / (this.scale);
      this.camera.right = width / (this.scale);
      this.camera.top = height / (this.scale);
      this.camera.bottom = -height / (this.scale);        
    }
    this.camera.updateProjectionMatrix();
  },

  render: function(left, top, width, height) {

    if(g_app.getMode() != '3d') {
      // shouldn't get here if 2d, but just in case
      return;
    }

    if(this.camera == null) {
      this.setupCamera();
      this.uiComponent.resize();
    }

    this.scene = this.editor.grid3d.getScene();

    if(this.viewType != '3d') {
      
      this.camera.left = -this.width / (this.scale);
      this.camera.right = this.width / (this.scale);
      this.camera.top = this.height / (this.scale);
      this.camera.bottom = -this.height / (this.scale);  
      
      this.camera.updateProjectionMatrix();
    }


    var grid3d = this.editor.grid3d;

    if(this.viewType == '3d') {
      grid3d.showAll();
    } else if(this.viewType == 'front') {
      grid3d.showOnlyXY();

    } else if(this.viewType == 'top') {
      grid3d.showOnlyXZ();

    }
//    UI.renderer.setClearColor( this.background );
    UI.renderer.setClearColor( grid3d.getBackgroundColorRGB() );
    UI.renderer.render( this.scene, this.camera );

  }
}
