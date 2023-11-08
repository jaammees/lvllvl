var SpriteFrames = function() {
  this.editor = null;
  this.canvas = null;

  this.uiComponent = null;

  this.visible = false;

  this.spritePositions = [];

  this.backgroundColor = '#000000';
  this.currentHighlightRect = false;

  this.rulerHeight = 20;
  this.rangeHeight = 20;

  this.cellWidth = 24;
  this.cellHeight = 21;
  this.cellHPadding = 2;
  this.cellVPadding = 2;


  this.rulerCanvas = null;
  this.rulerContext = null;

  this.rangeCanvas = null;
  this.rangeContext = null;

  this.gridCanvas = null;
  this.gridContext = null;

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

  this.scrollX = 0;
  this.scrollY = 0;

  this.mouseDownAtScrollX = 0;
  this.mouseDownAtScrollY = 0;

  this.lastMouseX = 0;
  this.lastMouseY = 0;

  this.id = '';
  this.buttons = [];

  this.controlHandleWidth = 6;

}

SpriteFrames.prototype = {
  init: function(editor, id) {
    this.editor = editor;

    if(typeof id == 'undefined') {
      this.id = '';
    } else {
      this.id = id;
    }
  },

  buildInterface: function(parentComponent) {
    var _this = this;

    var html = '';
    html += '<div class="panelFill" id="spriteFramesHolder' + this.id + '">';

    html += '<canvas id="spriteFramesCanvas' + this.id + '" ></canvas>';
    html += '</div>';
/*
    var html = '<span style="line-height: 20px; vertical-align: middle; margin-left: 3px">Sprite Frames:</span>';
    html += '<div id="spriteFramesHolder" style="position: absolute; top: 0; right: 0; left: 48px; bottom: 0; background-color: #111111"><canvas id="frameTimeline"></canvas></div>';

*/
    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html });

    this.uiComponent.on('resize', function() {
      _this.resize();
    });
    parentComponent.add(this.uiComponent);

    UI.on('ready', function() {
      _this.resize();
      _this.initEvents();
    });
  },


  show: function() {
    this.visible = true;
    this.resize();

    if(this.rangeCanvas == null) {
      this.rangeCanvas = document.createElement('canvas');      
    }

    if(this.rulerCanvas == null) {
      this.rulerCanvas = document.createElement('canvas');
    }


    if(this.gridCanvas == null) {
      this.gridCanvas = document.createElement('canvas');
    }

    this.setSize();
  },

  hide: function() {
    this.visible = false;
  },

  getVisible: function() {
    return this.visible;
  },

  initEvents: function() {
    var _this = this;

    if(this.canvas == null) {
      this.canvas = document.getElementById('spriteFramesCanvas' + this.id);
    }


    $('#spriteFramesCanvas' + this.id).on('mousedown', function(e) {
      _this.mouseDown(e);
    });

    $('#spriteFramesCanvas' + this.id).on('mousemove', function(e) {
      _this.mouseMove(e);
    });

    $('#spriteFramesCanvas' + this.id).on('mouseup', function(e) {
      _this.mouseUp(e);
    });
    

    $('#spriteFramesCanvas' + this.id).on('mouseenter', function(e) {
      UI.setCursor('default');
    });

    $('#spriteFramesCanvas' + this.id).on('mouseleave', function(e) {
      UI.setCursor('default');
    });


    this.canvas.addEventListener('dblclick', function(event) {
      _this.mouseDoubleClick(event);
    }, false);

    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);

  },

  sizeCanvas: function() {
    var element = $('#spriteFramesHolder' + this.id);
    if(this.canvas == null) {
      this.canvas = document.getElementById('spriteFramesCanvas' + this.id);
    }


    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }

    if(this.width != this.canvas.style.width || this.height != this.canvas.style.height) {
      if(this.width != 0 && this.height != 0) {

        this.scale = 1;
        
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.canvas.width = this.width * this.scale;
        this.canvas.height = this.height * this.scale;
      }
    }

    this.context = this.canvas.getContext('2d');
    this.context.scale(this.scale, this.scale);
  },

  resize: function() {
    this.sizeCanvas();
    this.draw();
  },


  keyDown: function(event) {

    switch(event.keyCode) {

      case keys.textMode.tilePaletteLeft.keyCode:
        if(keys.textMode.tilePaletteLeft.shift == event.shiftKey) {
          //this.tilePaletteDisplay.moveSelection(-1, 0);
          this.editor.frames.prevFrame();

        }
      break;
      case keys.textMode.tilePaletteRight.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.editor.frames.nextFrame();
        }
      break;
      case keys.textMode.tilePaletteUp.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.editor.layers.moveSelect(1);      
        }
      break;
      case keys.textMode.tilePaletteDown.keyCode:
        if(keys.textMode.tilePaletteDown.shift == event.shiftKey) {
          this.editor.layers.moveSelect(-1);                
        }
      break;
      case keys.textMode.characterRecentNext.keyCode:
        if(keys.textMode.characterRecentNext.shift == event.shiftKey) {
//          this.selectRecent(1);

        }
      break;
      case keys.textMode.characterRecentPrev.keyCode:
        if(keys.textMode.characterRecentPrev.shift == event.shiftKey) {
//          this.selectRecent(-1);
        }
      break;
    }
  },



  mouseDownVScroll: function(button, x, y) {
    y = this.height - y;

    if(y < this.rulerHeight + this.rangeHeight + this.vScrollBarPosition) {
      this.setYScroll(this.scrollY + 20);

    } else if(y > this.rulerHeight + this.rangeHeight +  this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY - 20);
    } else {
      this.vScroll = true;
    }

    this.draw({ framesChanged: false });

  },

  mouseDownHScroll: function(button, x, y) {
    x = x - this.layerLabelWidth;

    if(x < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 20);
    } else if(x > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 20);
    } else {
      this.hScroll = true;
    }

    this.draw({ framesChanged: false });
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

  addFrameRangeEdge: function(position) {
    var frameRanges = this.editor.graphic.getFrameRanges();
    for(var i = 0; i < frameRanges.length; i++) {
      if(frameRanges[i].start < position && frameRanges[i].end > position) {
        // need to insert range here...
        var newRange = {
          start: position,
          end: frameRanges[i].end
        };
        frameRanges[i].end = position;

        frameRanges.splice(i + 1, 0, newRange);
        return;
      }
    }    
  },

  deleteFrameRangeEnd: function(range) {
    var nextRange = range + 1;
    var frameRanges = this.editor.graphic.getFrameRanges();

    if(range >= 0 && range < frameRanges.length - 1) {
      frameRanges[range].end = frameRanges[nextRange].end;
      frameRanges.splice(nextRange, 1);
    }

  },

  mouseDoubleClick: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;
    x -= this.layerLabelWidth - this.scrollX;

    if(y > 0 && y < this.rangeHeight) {
      // mouse click in range control
      for(var range = 0; range < this.rangePositions.length; range++) {
        if(x > this.rangePositions[range].fromX && x < this.rangePositions[range].toX) {
          var fromX = this.rangePositions[range].fromX;
          var toX = this.rangePositions[range].toX;

          var rangeEdge = false;

          if(x < fromX + this.controlHandleWidth) {
            rangeEdge = range;
            this.deleteFrameRangeEnd(range - 1);

          } else if(x > toX - this.controlHandleWidth) {
            this.deleteFrameRangeEnd(range);
          } else {
            this.editor.animationPreview.setFrameRange(range);
            var frame = Math.floor(x / this.cellWidth);
            this.addFrameRangeEdge(frame);
          }
          this.drawRange({ rangesChanged: false });
          this.draw({ framesChanged: false });
          break;
        }
      }
    } 
    
    
    /*
    this.editor.animationPreview.setFrameRange('');
    this.drawRange({ rangesChanged: false });
    this.draw({ framesChanged: false });
    */

  },

  mouseDown: function(event) {
    /*
    if(this.highlightFrame !== false && this.highlightFrame >= 0 && this.highlightFrame < this.editor.graphic.getFrameCount() ) {
      this.editor.frames.gotoFrame(this.highlightFrame);
    }
    */
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;

    this.mouseCaptured = false;
    
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        return;
      }

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        this.leftMouseUp = false;
      }

//    UI.captureMouse(this);
      this.mouseIsDown = true;
    }


    if(button == 1) {
      // middle button
      return;
    }

    this.mouseDownAtX = x;
    this.mouseDownAtY = y;
    this.mouseDownAtScrollX = this.scrollX;
    this.mouseDownAtScrollY = this.scrollY;
    this.moveFrameRangeEdge = false;


    // is mouse down in vertical scroll bar
    if(x > this.width - this.vScrollBarWidth && y < this.height - (this.rulerHeight + this.rangeHeight )) {
      return this.mouseDownVScroll(button, x, y);
    }

    // is mouse down in horizontal scroll bar
    if(x > this.layerLabelWidth && y > this.height - this.hScrollBarHeight) {
      return this.mouseDownHScroll(button, x, y);
    }

    if(x < this.layerLabelWidth) {
      return;
    }



    x -= this.layerLabelWidth - this.scrollX;
    var frame = Math.floor( x / this.cellWidth);
    var frameCount = this.editor.graphic.getFrameCount();

    // is mouse down in range controls
    if(y > 0 && y < this.rangeHeight) {
      // mouse click in range control
      for(var range = 0; range < this.rangePositions.length; range++) {
        if(x >= this.rangePositions[range].fromX && x < this.rangePositions[range].toX) {
          var fromX = this.rangePositions[range].fromX;
          var toX = this.rangePositions[range].toX;

          if(x < fromX + this.controlHandleWidth) {
            // start of a handle
            if(range !== 0 && range !== this.rangePositions.length ) {
              this.moveFrameRangeEdge = range;
            }
          } else if(x > toX - this.controlHandleWidth) {
            // end of a handle
            if(range + 1 !== 0 && range + 1 !== this.rangePositions.length ) {
              this.moveFrameRangeEdge = range + 1;
            }
          } else {
            this.editor.animationPreview.setFrameRange(range);
          }
          this.drawRange({ rangesChanged: false });
          this.draw({ framesChanged: false });
          break;
        }
      }
    } else {
      if(frame < frameCount) {
        this.editor.frames.gotoFrame(frame);
      }

      if(y > this.rulerHeight + this.rangeHeight) {
        y -= (this.rulerHeight + this.rangeHeight);

        var layers = this.editor.layers.getLayers();
        var layerIndex = layers.length - 1 - Math.floor(y / this.cellHeight);


        if(layerIndex >= 0 && layerIndex < layers.length) {
          this.editor.layers.selectLayer(layers[layerIndex].layerId);
        }
      }
    }
  },


  mouseWheel: function(event, delta) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var factor = 4;

    this.setYScroll(this.scrollY - wheel.spinY * factor);
    this.setXScroll(this.scrollX + wheel.spinX * factor);

    this.draw({ framesChanged: false});
  },


  dragView: function(x, y, deltaX, deltaY) {
    //UI.setCursor('move');
    this.setYScroll(this.scrollY - deltaY);
    this.setXScroll(this.scrollX - deltaX);
    this.draw({ framesChanged: false});

  },

  mouseMoveVScroll: function(x, y, deltaX, deltaY) {
    var scale = this.vScrollBarHeight / (this.gridPixelHeight);
    var diffY = (y - this.mouseDownAtY) / scale;

  //    this.setYScroll(this.scrollY - deltaY / scale);
    this.setYScroll(this.mouseDownAtScrollY + diffY);
    this.draw({ framesChanged: false });

  },

  mouseMoveHScroll: function(x, y, deltaX, deltaY) {
    var scale = this.hScrollBarWidth / (this.gridPixelWidth);
    var diffX = (x - this.mouseDownAtX) / scale;

  //    this.setXScroll(this.scrollX + deltaX / scale);
    this.setXScroll(this.mouseDownAtScrollX + diffX);
    this.draw({ framesChanged: false });

  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var deltaX = x - this.lastMouseX;
    var deltaY = y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;


    if(this.buttons & UI.LEFTMOUSEBUTTON || this.buttons & UI.MIDDLEMOUSEBUTTON) {
      if(!this.mouseCaptured) {
        UI.captureMouse(this);
        this.mouseCaptured = true;
      }
    }

    // check middle button
    //if(UI.mouseIsDown[1]) {
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


      UI.setCursor('default');

      if(this.moveFrameRangeEdge !== false) {
        x -= this.layerLabelWidth - this.scrollX;

        var inCell = Math.floor(x / this.cellWidth);
        if(this.lastMoveFrameRangeCell !== inCell) {
          var frameRanges = this.editor.graphic.getFrameRanges();
          var newPosition = inCell + 1;

          var firstRange = this.moveFrameRangeEdge - 1;
          var secondRange = this.moveFrameRangeEdge;

          var min = 0;
          if(firstRange >= 0 && firstRange < frameRanges.length) {
            min = frameRanges[firstRange].start + 1;
          }
          var max = this.editor.graphic.getFrameCount();
          if(secondRange >= 0 && secondRange < frameRanges.length) {
            max = frameRanges[secondRange].end;
          }

          if(newPosition >= min && newPosition < max) {
            if(firstRange >= 0 && firstRange < frameRanges.length) {
              min = frameRanges[firstRange].start + 1;
              if(newPosition >= min) {
                frameRanges[firstRange].end = newPosition;
              }
            }

            if(secondRange < frameRanges.length) {
              if(newPosition < max) {
                frameRanges[secondRange].start = newPosition;
              }
            }

            this.drawRange({ rangesChanged: false });
            this.draw({ framesChanged: false });
          }
      
          this.lastMoveFrameRangeCell = inCell;
        }

      }
  
          
//    var frame = Math.floor(x / (this.frameWidth + this.frameMargin));
//    this.setHighlightFrame(frame);

  },

  mouseUp: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;
    this.vScroll = false;
    this.hScroll = false;
    this.buttons = 0;

    this.lastMoveFrameRangeCell = false;
    this.moveFrameRangeEdge = false;

  },


  setHighlightFrame: function(frame) {
    if(frame === this.highlightFrame) {
      return;
    }


    this.highlightFrame = frame;
    this.drawFrames();

  },

  highlightCurrentSprite: function() {
    this.draw();




    // draw over previous

    /*
    if(this.currentHighlightRect !== false) {
      this.context.beginPath();

      this.context.fillStyle = this.backgroundColor;
      this.context.strokeStyle = this.backgroundColor;

      this.context.rect(this.currentHighlightRect.x, 
        this.currentHighlightRect.y, 
        this.currentHighlightRect.width,  
        this.currentHighlightRect.height);  
      this.context.stroke();
    }


    this.currentFrame = currentFrame;
    this.currentLayerIndex = currentLayerIndex;
    for(var i = 0; i < this.spritePositions.length; i++) {
      if(this.spritePositions[i].frame === currentFrame && this.spritePositions[i].layerIndex === currentLayerIndex) {

        this.context.beginPath();

        this.context.fillStyle = styles.tilePalette.selectOutline;
        this.context.strokeStyle = styles.tilePalette.selectOutline;
        this.context.rect(this.spritePositions[i].x, 
          this.spritePositions[i].y, 
          this.spritePositions[i].width,  
          this.spritePositions[i].height);      
        this.currentHighlightRect = {
          x: this.spritePositions[i].x,
          y: this.spritePositions[i].y,
          width: this.spritePositions[i].width,
          height: this.spritePositions[i].height
        };
        this.context.stroke();
        break;
      }
    }    
    */
  },

  setSize: function() {

//    var layerObject = this.editor.layers.getLayerObject(layers[i].layerId);

    var spriteGridWidth = this.editor.graphic.getGridWidth();
    var spriteGridHeight = this.editor.graphic.getGridHeight();
    var spriteCellWidth = 24;
    var spriteCellHeight = 21;

    var cellWidth = spriteGridWidth * spriteCellWidth + this.cellHPadding * 2;
    var cellHeight = spriteGridHeight * spriteCellHeight + this.cellVPadding * 2;

    var frameCount = this.editor.graphic.getFrameCount();
    
    var layers = this.editor.layers.getLayers();
    var layerCount = layers.length;

    if(this.gridWidth == frameCount && this.gridHeight == layerCount
      && cellWidth == this.cellWidth && cellHeight == this.cellHeight) {
        // nothing changed..
        return;
    }

    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.gridWidth = frameCount;
    this.gridHeight = layerCount;

    this.gridPixelHeight = this.gridHeight * this.cellHeight;
    this.gridPixelWidth = this.gridWidth * this.cellWidth;

    this.gridCanvas.width = this.gridWidth * this.cellWidth;
    this.gridCanvas.height = this.gridHeight * this.cellHeight;
    this.gridContext = this.gridCanvas.getContext('2d');

    this.rulerCanvas.width = this.gridWidth * this.cellWidth;
    this.rulerCanvas.height = this.rulerHeight;
    this.rulerContext = this.rulerCanvas.getContext('2d'); 

    this.rangeCanvas.width = this.rulerCanvas.width;
    this.rangeCanvas.height = this.rangeHeight;
    this.rangeContext = this.rangeCanvas.getContext('2d');

  },

  drawRange: function(args) {
    if(this.rangeCanvas == null || this.rangeContext == null){
      return;
    }
    var rangesChanged = true;

    if(typeof args != 'undefined') {
      if(typeof args.rangesChanged !== 'undefined') {
        rangesChanged = args.rangesChanged;
      }
    }
    var frameRanges = this.editor.graphic.getFrameRanges();
    var selectedRange = this.editor.animationPreview.getFrameRange();

    this.rangeContext.fillStyle = "#111111";
    this.rangeContext.fillRect(0, 0, this.rangeCanvas.width, this.rangeCanvas.height);

    this.rangePositions = [];

    for(var i = 0; i < frameRanges.length; i++) {
      var start = frameRanges[i].start;
      var end = frameRanges[i].end;

      var fromX = start * this.cellWidth;// + 1;
      var toX = end * this.cellWidth;
      var width = toX - fromX;

      this.rangePositions.push({
        index: i,
        fromX: fromX,
        toX: toX
      });

      this.rangeContext.fillStyle = '#444444';
      if(i === selectedRange || selectedRange === '') {
        this.rangeContext.fillStyle = '#888888';
      }
      this.rangeContext.fillRect(fromX, 1, width, this.rangeHeight - 2);

      var controlHandleWidth = this.controlHandleWidth;
      var controlHandleHeight = this.rangeHeight - 6;
      this.rangeContext.fillStyle = '#cccccc';

      this.rangeContext.beginPath();
      this.rangeContext.moveTo(fromX + 1, (this.rangeHeight - controlHandleHeight) / 2);
      this.rangeContext.lineTo(fromX + 1 + controlHandleWidth, this.rangeHeight / 2);
      this.rangeContext.lineTo(fromX + 1, (this.rangeHeight + controlHandleHeight) / 2);
      this.rangeContext.fill();

      this.rangeContext.beginPath();
      this.rangeContext.moveTo(toX, (this.rangeHeight - controlHandleHeight) / 2);
      this.rangeContext.lineTo(toX - controlHandleWidth, this.rangeHeight / 2);
      this.rangeContext.lineTo(toX, (this.rangeHeight + controlHandleHeight) / 2);
      this.rangeContext.fill();


    }

    if(rangesChanged) {
      this.editor.animationPreview.updateFrameRanges();
    }

  },

  drawRuler: function() {
    // ruler

    this.rulerContext.clearRect(0, 0, this.gridWidth * this.cellWidth, this.rulerHeight);

    // draw grid lines
    this.rulerContext.beginPath();    
    this.rulerContext.strokeStyle = styles.music.rulerBarLines;//'#aaaaaa';    

    this.rulerContext.font = "10px Verdana";
    this.rulerContext.fillStyle = "#eeeeee";
    this.rulerContext.strokeStyle =  styles.music.rulerLines;

    bar = 0;
    for(var i = 0; i < this.gridWidth; i++) {
      bar++;
      var lineHeight = this.rulerHeight;
      this.rulerContext.fillText(bar, i * this.cellWidth + 4, this.rulerHeight - 4);

      var lineYPosition = this.rulerHeight - lineHeight;
      this.rulerContext.moveTo(i * this.cellWidth + 0.5, lineYPosition);
      this.rulerContext.lineTo(i * this.cellWidth + 0.5, lineYPosition + lineHeight);
    }

    this.rulerContext.stroke();
  },


  drawFrames: function() {
    if(!this.editor.layers) {
      return;
    }

    if(!this.visible) {
      return;
    }

    this.gridContext.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

    this.gridImageData = this.gridContext.getImageData(0, 0, this.gridCanvas.width, this.gridCanvas.height);

    var layers = this.editor.layers.getLayers();
    var frameCount = this.editor.graphic.getFrameCount();
    

    var xPosition = 0;
    var yPosition = 0;

    this.spritePositions = [];

    for(var i = layers.length - 1; i >= 0; i--) {
      xPosition = 0;
      var layerObject = this.editor.layers.getLayerObject(layers[i].layerId);
      if(layerObject && layerObject.getType() == 'grid') {
        var tileSet = layerObject.getTileSet();
        if(tileSet) {
          var tileWidth = tileSet.getTileWidth();
          var tileHeight = tileSet.getTileHeight();
          var gridWidth = layerObject.getGridWidth();
          var gridHeight = layerObject.getGridHeight();


          var spriteWidth = tileWidth * gridWidth;
          var spriteHeight = tileHeight * gridHeight;

          var args = {};
          args['screenMode'] = layerObject.getScreenMode();
          if(args['screenMode'] === TextModeEditor.Mode.INDEXED) {
            args['transparentColorIndex'] = layerObject.getTransparentColorIndex();
          }
    
          args['imageData'] = this.gridImageData;

          for(var f = 0; f < frameCount; f++) {
            xPosition = f * this.cellWidth + this.cellHPadding;
//            xPosition += this.cellHPadding;

            for(var y = 0; y < gridHeight; y++) {
              for(var x = 0; x < gridWidth; x++) {
                var cellData = layerObject.getCell({ x: x, y: y, frame: f });
                if(cellData) {
                  args['color'] = cellData.fc;
                  args['bgColor'] = cellData.bc;
                  args['character'] = cellData.t;

                  if(layerObject.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
                    args['backgroundColor'] = layerObject.getBackgroundColor(f);
                    args['c64Multi1Color'] = layerObject.getC64Multi1Color(f);
                    args['c64Multi2Color'] = layerObject.getC64Multi2Color(f);      
                  }

                  args['x'] = (x * tileWidth + xPosition) * this.scale;
// reverseY                  args['y'] = ((gridHeight - y - 1) * tileHeight + yPosition)  * this.scale;
                  args['y'] = (y * tileHeight + yPosition)  * this.scale;

                  args['scale'] = this.scale;
                  tileSet.drawCharacter(args);

                  this.spritePositions.push({
                    layerIndex: i,
                    frame: f,
                    x: args['x'] / this.scale,
                    y: args['y'] / this.scale,
                    width: spriteWidth,
                    height: spriteHeight
                  });
                }
              }
            }
//            xPosition += this.cellWidth;
          }

          yPosition += this.cellHeight;
        }
      }
    }

  
    this.gridContext.putImageData(this.gridImageData, 0, 0);

    this.currentFrame = false;
    this.currentLayerIndex = false;
//    this.highlightCurrentSprite();


  },


  setXScroll: function(scrollX) {
    var viewWidth = this.width - this.layerLabelWidth - this.vScrollBarWidth;
    if(scrollX + viewWidth > this.gridPixelWidth) {
      scrollX = this.gridPixelWidth - viewWidth;
    }

    if(scrollX < 0) {
      scrollX = 0;
    }

    this.scrollX = scrollX;

  },

  scrollToX: function(x) {
    this.setXScroll(x);

  },

  scrollToY: function(y) {
    this.setYScroll(y);
  },

  setYScroll: function(scrollY) {

    if(scrollY < 0) {
      scrollY = 0;
    }

    var viewHeight = this.height - this.rulerHeight - this.rangeHeight - this.hScrollBarHeight;
    if(scrollY + viewHeight > this.gridPixelHeight) {
      scrollY = this.gridPixelHeight - viewHeight;
    }
    if(scrollY < 0) {
      scrollY = 0;
    }

    this.scrollY = scrollY;

  },



  calculateScroll: function() {
    this.vScrollBarHeight = this.gridViewHeight;

    this.vScrollBarPositionHeight = this.vScrollBarHeight * this.gridViewHeight / (this.gridPixelHeight);
    if(this.vScrollBarPositionHeight > this.vScrollBarHeight) {
      this.vScrollBarPositionHeight = this.vScrollBarHeight;
    }

    this.vScrollBarPosition = this.vScrollBarHeight - this.vScrollBarPositionHeight - Math.round(this.scrollY) * this.vScrollBarHeight / (this.gridPixelHeight);

//    this.vScrollBarPosition =  (this.scrollY) * this.vScrollBarHeight / this.srcHeight;


    this.hScrollBarWidth = this.gridViewWidth;
    this.hScrollBarPositionWidth = this.hScrollBarWidth  * this.gridViewWidth / (this.gridPixelWidth);
    if(this.hScrollBarPositionWidth > this.hScrollBarWidth) {
      this.hScrollBarPositionWidth = this.hScrollBarWidth;
    }

    this.hScrollBarPosition = (this.scrollX) * this.hScrollBarWidth / (this.gridPixelWidth);


  },


  draw: function(args) {
    var framesChanged = true;

    if(typeof args != 'undefined') {
      if(typeof args.framesChanged != 'undefined') {
        framesChanged = args.framesChanged;
      }
    }

    if(this.rulerCanvas == null || this.gridCanvas == null) {
      return;
    }

    if(this.canvas == null) {
      this.sizeCanvas();
    }


    var currentFrame = this.editor.graphic.getCurrentFrame();
    var currentLayerIndex = this.editor.layers.getSelectedLayerIndex();
    var layers = this.editor.layers.getLayers();
    var layerCount = layers.length;
    
    this.setSize();

    if(framesChanged) {
      this.drawRange();
      this.drawRuler();
      this.drawFrames();
    } 


    this.context.fillStyle = '#111111';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


    this.context.fillStyle = '#222222';
    this.context.fillRect(0, 0, this.canvas.width, this.rulerHeight);

    var dstX = currentFrame * this.cellWidth + this.layerLabelWidth;
    var dstY = this.rangeHeight;
    // highlight the current frame in the ruler
    this.context.fillStyle = '#444444';
    this.context.fillRect(dstX, 
      dstY, 
      this.cellWidth,  
      this.rulerHeight);      

    // highlight the current frame in the grid
    dstY = this.rangeHeight + this.rulerHeight;
    this.context.fillStyle = '#0a0a0a';
    this.context.fillRect(dstX, 
      this.rulerHeight, 
      this.cellWidth,  
      layerCount * this.cellHeight);


    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.layerLabelWidth = 0;


    var dstX = this.layerLabelWidth;
    var dstY = 0;

    // draw the range canvas
    this.context.drawImage(this.rangeCanvas, 
      Math.round(this.scrollX), 0, 
      this.width - this.layerLabelWidth,  this.rangeHeight, 
      dstX, 
      dstY, 
      this.width - this.layerLabelWidth, this.rangeHeight);

    var dstX = this.layerLabelWidth;
    var dstY = this.rangeHeight;

    this.context.drawImage(this.rulerCanvas, 
      Math.round(this.scrollX), 0, 
      this.width - this.layerLabelWidth,  this.rulerHeight, 
      dstX, 
      dstY, 
      this.width- this.layerLabelWidth, this.rulerHeight);


    this.gridViewWidth = this.width - this.layerLabelWidth - this.vScrollBarWidth;
    this.gridViewHeight = this.height - ( this.rulerHeight - this.rangeHeight) - this.hScrollBarHeight;


    // draw grid


    var drawWidth = this.gridCanvas.width;
    var drawHeight = this.gridCanvas.height;

    var dstX = this.layerLabelWidth;
    var dstY = this.rangeHeight + this.rulerHeight ;

    this.context.drawImage(this.gridCanvas, 
      Math.round(this.scrollX), Math.round(this.scrollY),  drawWidth, drawHeight,
      dstX, dstY, drawWidth, drawHeight);


    // draw outline around selection
    this.context.beginPath();

    this.context.fillStyle = styles.tilePalette.selectOutline;
    this.context.strokeStyle = styles.tilePalette.selectOutline;
    this.context.rect(
      currentFrame * this.cellWidth + this.layerLabelWidth - this.scrollX, 
      (layerCount - currentLayerIndex - 1) * this.cellHeight + this.rangeHeight + this.rulerHeight - this.scrollY, 
      this.cellWidth,  
      this.cellHeight);      
    this.context.stroke();

   
    // draw the scroll bars
    this.calculateScroll();

    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';

    // horizontal scroll
    this.context.fillRect(
        this.layerLabelWidth, 
        this.height - this.hScrollBarHeight, 
        this.gridViewWidth, 
        this.hScrollBarHeight);
    this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';

    this.context.fillRect(
      this.layerLabelWidth + this.hScrollBarPosition, 
      this.height - this.hScrollBarHeight + 1, 
      this.hScrollBarPositionWidth, 
      this.hScrollBarHeight - 2);

    // vertical scroll
    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';
    this.context.fillRect(
      this.width - this.vScrollBarWidth, 
      this.rulerHeight + this.rangeHeight, 
      this.vScrollBarWidth, this.gridViewHeight);

    this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';
    this.context.fillRect(
      this.width - this.vScrollBarWidth + 1, 
      this.rulerHeight + this.rangeHeight + this.vScrollBarPosition, 
      this.vScrollBarWidth - 2, this.vScrollBarPositionHeight);
    

  }
}
