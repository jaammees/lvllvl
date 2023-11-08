var ColorPaletteDisplay = function() {
  this.canvas = null;
  this.context = null;
  this.canvasScale = 1;

  this.colorWidth = 20;
  this.colorHeight = 20;
  this.colorSpacing = 1;

  this.colorsAcross = 8;
  this.colorsDown = 2;
  this.colorCount = 16;
  this.colors = [];

  this.selectedColors = [];

  this.highlightColor =  false;//this.editor.colorPaletteManager.noColor;

  this.cursorRGB = false;
  this.colorSelected = false;
  this.highlightChanged = false;

  this.touchColorHandler = false;
  this.touchEndColorHandler = false;

  this.buttons = 0;
  // map of x,y to colour

  // should always be true
  this.useColorMap = true;
  this.colorMap = [];
  this.noColor = -1;

  this.lastGridX = false;
  this.lastGridY = false;

  this.gridMouseMove = false;
  this.gridMouseDown = false;
  this.gridMouseUp = false;
  this.gridEndDrag = false;
  this.gridEndMarqueeDrag = false;

  this.gridDoubleClick = false;

  this.marqueeChanged = false;

  this.gridLinesVisible = false;
  this.selectEnabled = true;
  this.highlightEnabled = true;

  this.highlightGridX = false;
  this.highlightGridY = false;

  this.inDragMarquee = false;
  this.dragMarqueeContents = false;

  this.inDragColor = false;
  this.dragColorX = false;
  this.dragColorY = false;
  this.dragColorIndex = false;

  this.dragOffsetX = 0;
  this.dragOffsetY = 0;

  this.maxSelectableColors = 2;
  this.canSelectWithRightMouseButton = false;
  this.canSelectMultiple = false;

  this.touchColorEndHandler = false;

  this.multipleSelectMode = 'add';

  this.marquee = false;
  this.marqueeLeft = 0;//false;
  this.marqueeWidth = 1;//false;
  this.marqueeTop = 0;//false;
  this.marqueeHeight = 2;//false;

  this.type = '';

  this.canvasElementId = false;


  this.maxColorWidth = false;

  this.drawEnabled = true;
  this.drawHighlightInMarquee = true;

}

ColorPaletteDisplay.prototype = {
  init: function(editor, args) {
    this.editor = editor;
    this.canvasElementId = args.canvasElementId;    

    this.selectedColors[0] =  this.editor.colorPaletteManager.noColor;
    this.selectedColors[1] =  this.editor.colorPaletteManager.noColor;
    this.highlightColor = this.editor.colorPaletteManager.noColor;


    if(typeof args != 'undefined') {
      if(typeof args.gridLinesVisible != 'undefined') {
        this.gridLinesVisible = args.gridLinesVisible;
      }

      if(typeof args.selectEnabled != 'undefined') {
        this.selectEnabled = args.selectEnabled;
      }

      if(typeof args.highlightEnabled != 'undefined') {
        this.highlightEnabled = args.highlightEnabled;
      }

      if(typeof args.maxSelectableColors != 'undefined') {
        this.maxSelectableColors = args.maxSelectableColors;
      }

      if(typeof args.canSelectWithRightMouseButton != 'undefined') {
        this.canSelectWithRightMouseButton = args.canSelectWithRightMouseButton;
      }

      if(typeof args.canSelectMultiple != 'undefined') {
        this.canSelectMultiple = args.canSelectMultiple;
      }
    }

    if(this.canSelectMultiple) {
      this.selectedColors = [];
    }

  },

  initEvents: function() {
    var _this = this;
    $('#' + this.canvasElementId).on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#' + this.canvasElementId).on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.canvasElementId).on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    this.canvas.addEventListener('dblclick', function(event) {
      _this.doubleClick(event);
    }, false);

    this.canvasElement = document.getElementById(this.canvasElementId);

    this.canvasElement.addEventListener('touchstart', function(event) {
      _this.touchStart(event);
    }, false);

    this.canvasElement.addEventListener('touchmove', function(event) {
      _this.touchMove(event);
    }, false);

    this.canvasElement.addEventListener('touchend', function(event) {
      _this.touchEnd(event);
    }, false);


    $('#' + this.canvasElementId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    $('#' + this.canvasElementId).on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });

    $('#' + this.canvasElementId).on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });
  },

  setDrawEnabled: function(enabled) {
    this.drawEnabled = enabled;
  },

  getDrawEnabled: function() {
    return this.drawEnabled;
  },


  // set whether to draw the highlight cursor when it is in the marquee
  setDrawHighlightInMarquee: function(draw) {
    this.drawHighlightInMarquee = draw;
  },

  setup: function() {
    if(this.canvas === null) {
      this.canvas = document.getElementById(this.canvasElementId);
      this.initEvents();
    }

    this.canvasScale = Math.floor(UI.devicePixelRatio);

    var colorsAcross = 1;
    var colorsDown = 1;

    if(this.colorMap.length > 0) {
      colorsAcross = this.colorMap[0].length;
      colorsDown = this.colorMap.length;
    }

    var width = (this.colorWidth + this.colorSpacing) * colorsAcross + this.colorSpacing;
    var height = (this.colorHeight + this.colorSpacing) * colorsDown + this.colorSpacing;


    if(width == 0) {
      width = 1;
    }

    if(height == 0) {
      height = 1;
    }


    this.canvas.width = width * this.canvasScale;
    this.canvas.height = height * this.canvasScale;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';


    this.context = this.canvas.getContext('2d');
    this.context.scale(this.canvasScale, this.canvasScale);


  },

  getCanvas: function() {
    return this.canvas;
  },

  getCanvasWidth: function() {
    return this.canvas.width;
  },

  getCanvasHeight: function() {
    return this.canvas.height;
  },

  setColorSize: function(width, height, spacing) {
    this.colorWidth = width;
    this.colorHeight = height;
    if(typeof spacing != 'undefined') {
      this.colorSpacing = spacing;
    }

    this.setup();

  },

  getColorsAcross: function() {
    return this.colorsAcross;
  },

  // need to know if its a cell colour in c64 multicolor mode
  setType: function(type) {
    this.type = type;
  },

  setMarqueeBounds: function(left, top, width, height) {
    this.marqueeLeft = left;
    this.marqueeTop = top;
    this.marqueeWidth = width;
    this.marqueeHeight = height;

    if(this.marqueeChanged !== false) {
      this.marqueeChanged(left, top, width, height);
    }

  },



  setMarqueeEnabled: function(enabled) {
    this.marquee = enabled;
  },
  
  getMarqueeEnabled: function() {
    return this.marquee;
  },

  inMarquee: function(gridX, gridY) {
    return gridX >= this.marqueeLeft && gridX < (this.marqueeLeft + this.marqueeWidth) 
        && gridY >= this.marqueeTop && gridY < (this.marqueeTop + this.marqueeHeight);
  },

  getHeight: function() {
    return Math.ceil(this.canvas.height / this.canvasScale);
  },

  getWidth: function() {
    return Math.ceil(this.canvas.width / this.canvasScale);
  },



  setButtons: function(event) {
    if(event.buttons != 'undefined') {
      this.buttons = event.buttons;
    }
    if(event.buttons === 'undefined' && event.nativeEvent !== 'undefined') {
      this.buttons = event.nativeEvent.buttons;
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {
      this.buttons = UI.LEFTMOUSEBUTTON;
    }
    // ctrl click
    if(event.ctrlKey && this.buttons == 1) {
      this.buttons = UI.RIGHTMOUSEBUTTON;
    }

    // cmd + click
    if(event.metaKey && this.buttons == 1) {
      this.buttons = 4;
    }

  },

  on: function(eventName, f) {
    if(eventName == 'colorselected') {
      this.colorSelected = f;
    }

    if(eventName == 'highlightchanged') {
      this.highlightChanged = f;
    }

    if(eventName == 'mousemove') {
      this.gridMouseMove = f;
    }

    if(eventName == 'doubleclick') {
      this.gridDoubleClick = f;
    }

    if(eventName == 'mousedown') {
      this.gridMouseDown = f;
    }

    if(eventName == 'mouseup') {
      this.gridMouseUp = f;
    }

    if(eventName == 'mouseenter') {
      this.gridMouseEnter = f;
    }

    if(eventName == 'mouseleave') {
      this.gridMouseLeave = f;
    }

    if(eventName == 'enddrag') {
      this.gridEndDrag = f;
    }

    if(eventName == 'endmarqueedrag') {
      this.gridEndMarqueeDrag = f;
    }

    if(eventName == 'marqueechanged') {
      this.marqueeChanged = f;
    }

    if(eventName == 'touchcolor') {
      this.touchColorHandler = f;
    }

    if(eventName == 'touchcolorend') {
      this.touchColorEndHandler = f;
    }

  },

  mouseEnter: function(event) {
    if(this.gridMouseEnter) {
      this.gridMouseEnter(event);
    }

  },

  mouseLeave: function(event) {
    this.setHighlightColor(this.editor.colorPaletteManager.noColor);
    if(this.gridMouseLeave) {
      this.gridMouseLeave(event);
    }
  },


  multipleSelect: function(color) {
    // see if already selected
    var selectedIndex = false;
    for(var i = 0; i < this.selectedColors.length; i++) {
      if(this.selectedColors[i] === color)  {
        selectedIndex = i;
        break;
      }
    }

    if(selectedIndex !== false) {
      // remove it
      if(this.multipleSelectMode == 'remove') {
        this.selectedColors.splice(selectedIndex, 1);
      }
    } else {
      if(this.multipleSelectMode == 'add') {
        this.selectedColors.push(color);
      }
    }

    this.draw();
  },



  touchStart: function(event) {
    event.preventDefault();

    var touches = event.changedTouches;

    if(touches.length > 0) {
      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;

      var color = this.xyToColor(x, y);
      if(color !== false) {
        if(this.touchColorHandler !== false) {
          this.touchColorHandler(color);
        }

        if(this.selectEnabled) {
          // selecting range of colours
          if(color !== this.editor.colorPaletteManager.noColor) {
            if(this.canSelectMultiple) {
              // is already added ?
              this.multipleSelectMode = 'add';
              for(var i = 0; i < this.selectedColors.length; i++) {
                if(this.selectedColors[i] === color) {
                  this.multipleSelectMode = 'remove';
                  break;
                }
              }
              this.multipleSelect(color);
//              this.lastGridY = gridY;
//              this.lastGridX = gridX;
            } else {
              this.selectedColors[0] = color;
            }
            if(this.colorSelected !== false) {
              this.colorSelected({ color: color, colorIndex: 0 });
            }
          }

          if( (this.buttons & UI.RIGHTMOUSEBUTTON) && this.canSelectWithRightMouseButton) {
            this.selectedColors[1] = color;
            if(this.colorSelected !== false) {
              this.colorSelected({ color: color, colorIndex: 1 });
            }
          }
          this.draw();
        }


      }

/*
      this.mouseDownOnCharacter =  this.charPaletteXYToChar(x, y);

      if(this.mouseDownOnCharacter !== false) {
        if(this.touchCharacterHandler !== false) {
          this.touchCharacterHandler(this.mouseDownOnCharacter);
        }
      }
*/

    }

  },


  touchMove: function(event) {
    event.preventDefault();

    var touches = event.changedTouches;

    if(touches.length > 0) {
      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;


      var color = this.xyToColor(x, y);
      if(color !== false) {
        if(this.touchColorHandler !== false) {
          this.touchColorHandler(color);
        }


        if(this.canSelectMultiple) {
          var color = this.xyToColor(x, y);
          this.multipleSelect(color);
        }


      }

/*
      this.mouseDownOnCharacter =  this.charPaletteXYToChar(x, y);

      if(this.mouseDownOnCharacter !== false) {
        if(this.touchCharacterHandler !== false) {
          this.touchCharacterHandler(this.mouseDownOnCharacter);
        }
      }
*/      
    }

  },

  touchEnd: function(event) {
    event.preventDefault();
    var touches = event.changedTouches;
    if(touches.length > 0) {


      var x = touches[0].pageX - $('#' + this.canvasElementId).offset().left;
      var y = touches[0].pageY - $('#' + this.canvasElementId).offset().top;

      var color = this.xyToColor(x, y);
      if(color !== false) {
        if(this.touchColorEndHandler !== false) {

          this.touchColorEndHandler(color);
        }
      }

/*
      var character =  this.charPaletteXYToChar(x, y);

      if(character !== false) {
        if(this.touchEndCharacterHandler !== false) {
          this.touchEndCharacterHandler(character);
        }
      }
      */
    }
    
  },

  doubleClick: function(event) {
    if(this.gridDoubleClick) {
      this.gridDoubleClick();
    }
  },


  mouseDown: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    var gridX = Math.floor((x - this.colorSpacing) / (this.colorWidth + this.colorSpacing));
    var gridY = Math.floor((y - this.colorSpacing) / (this.colorHeight + this.colorSpacing));

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);
    }

    if(this.lastGridX !== false && this.lastGridY !== false) {
      if(this.gridMouseDown) {
        this.gridMouseDown(event, this.lastGridX, this.lastGridY);
      }

    }

    var color = this.xyToColor(x, y);

    if(this.selectEnabled) {
      
      // selecting range of colours
      if(color !== this.editor.colorPaletteManager.noColor) {
        if(this.buttons & UI.LEFTMOUSEBUTTON) {
          if(this.canSelectMultiple) {
            // is already added ?
            this.multipleSelectMode = 'add';
            for(var i = 0; i < this.selectedColors.length; i++) {
              if(this.selectedColors[i] === color) {
                this.multipleSelectMode = 'remove';
                break;
              }
            }
            this.multipleSelect(color);
            this.lastGridY = gridY;
            this.lastGridX = gridX;
          } else {
            this.selectedColors[0] = color;
          }
          if(this.colorSelected !== false) {
            this.colorSelected({ color: color, colorIndex: 0 });
          }
        }

        if( (this.buttons & UI.RIGHTMOUSEBUTTON) && this.canSelectWithRightMouseButton) {
          this.selectedColors[1] = color;
          if(this.colorSelected !== false) {
            this.colorSelected({ color: color, colorIndex: 1 });
          }
        }
        this.draw();
      }
    } else {


    }

    event.preventDefault();
  },

  mouseMove: function(event) {

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);
    }

    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    var gridX = Math.floor((x - this.colorSpacing) / (this.colorWidth + this.colorSpacing));
    var gridY = Math.floor((y - this.colorSpacing) / (this.colorHeight + this.colorSpacing));

    this.lastX = x;
    this.lastY = y;


    if(gridX < 0) {
      gridX = false;
    }

    if(gridY < 0) {
      gridY = false;
    }

    if(gridX !== this.lastGridX || gridY !== this.lastGridY) {
      if(gridX !== false && gridY !== false) {
        if(this.gridMouseMove) {
          this.gridMouseMove(event, gridX, gridY);
        }
      }
      this.lastGridY = gridY;
      this.lastGridX = gridX;

    }

    if(this.canSelectMultiple) {
      if(this.buttons & UI.LEFTMOUSEBUTTON) {        
        var color = this.xyToColor(x, y);
        this.multipleSelect(color);
      }

    }

    if(this.highlightEnabled) {
      var color = this.xyToColor(x, y);

//      if(this.buttons == 0) {
        if(this.highlightColor !== color) {
          this.setHighlightColor(color);

        }
//      }
    }

    if(this.inDragColor) {
      this.draw();
    }

    if(this.inDragMarquee) {
      this.draw();
    }

  },

  mouseUp: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    this.buttons = 0;
    var gridX = Math.floor((x - this.colorSpacing) / (this.colorWidth + this.colorSpacing));
    var gridY = Math.floor((y - this.colorSpacing) / (this.colorHeight + this.colorSpacing));

    if(this.gridMouseUp) {

      this.gridMouseUp(event, gridX, gridY);

    }

    if(this.inDragColor) {
      this.inDragColor = false;
      this.endDragColor(gridX, gridY);
    }

    if(this.inDragMarquee) {
      this.inDragMarquee = false;
      this.endDragMarquee();
    }

    this.draw();
  },

  setColorsAcross: function(colorsAcross) {
    this.colorsAcross = colorsAcross;
    this.draw();
  },

  setHighlightColor: function(color) {
    this.highlightColor = color;
    this.draw();
    if(this.highlightChanged !==  false) {
      this.highlightChanged({ color: color });
    }
  },

  setHighlightGrid: function(gridX, gridY) {
    this.highlightGridX = gridX;
    this.highlightGridY = gridY;
  },

  setGridVisible: function(visible) {
    this.gridLinesVisible = visible;
    this.draw();
  },


  getHighlightColor: function() {
    return this.highlightColor;
  },

  setSelectedColor: function(index, color) {
    //if(index < this.selectedColors.length) {
    if(index < this.maxSelectableColors) {
      this.selectedColors[index] = color;
      this.draw();
    }


    // dont want to cause infinite loop so dont trigger events?
  },

  getSelectedColor: function(index) {
    if(index < this.selectedColors.length) {
      return this.selectedColors[index];
    } 

    return false;
  },

  setSelectedColors: function(selectedColors) {
    this.selectedColors = [];
    for(var i = 0; i < selectedColors.length; i++) {
      this.selectedColors.push(selectedColors[i]);
    }
  },

  getSelectedColors: function() {
    return this.selectedColors;
  },

  setColors: function(colors, args) {
    this.colorCount = colors.length;    

    if(typeof args != 'undefined') {
      if(typeof args.colorMap != 'undefined') {
        this.setColorMap(args.colorMap);
      }

      if(typeof args.colorCount != 'undefined') {
        this.colorCount = args.colorCount;
      }
    }


    this.colors = [];

    for(var i = 0; i < this.colorCount; i++) {
      this.colors.push(colors[i]);
    }

    this.setup();
    this.draw();
  },

  setColorMap: function(colorMap) {
    this.useColorMap = true;
    this.colorMap = colorMap;
  },


  setMaxColorWidth: function(maxColorWidth) {
    this.maxColorWidth = maxColorWidth;
  },


  fitToWidthHeight: function(width, height) {
    var canvasWidth = 0;
    var canvasHeight = height;
    if(typeof width == 'undefined') {
      canvasWidth = Math.floor(this.canvas.width / this.canvasScale);
    } else {
      canvasWidth = width;
    }

    var colorsAcross = 1;
    var colorsDown = 1;
    if(this.colorMap.length > 0) {
      colorsAcross = this.colorMap[0].length;
      colorsDown = this.colorMap.length;
    }

    this.colorWidth = Math.floor(((canvasWidth - this.colorSpacing) / colorsAcross) - this.colorSpacing);
    this.colorHeight = Math.floor(((canvasHeight - this.colorSpacing) / colorsDown) - this.colorSpacing);


    if(this.maxColorWidth !== false && this.colorWidth > this.maxColorWidth) {
      this.colorWidth = this.maxColorWidth;
    }

    if(this.colorHeight < this.colorWidth) {
      this.colorWidth = this.colorHeight;
    }

    this.colorHeight = this.colorWidth;


    this.setup();
    this.draw();

  },


  fitToWidth: function(width) {
    var canvasWidth = 0;
    if(typeof width == 'undefined') {
      canvasWidth = Math.floor(this.canvas.width / this.canvasScale);
    } else {
      canvasWidth = width;
    }

    var colorsAcross = 1;
    var colorsDown = 1;
    if(this.colorMap.length > 0) {
      colorsAcross = this.colorMap[0].length;
      colorsDown = this.colorMap.length;
    }

    this.colorWidth = Math.floor(((canvasWidth - this.colorSpacing) / colorsAcross) - this.colorSpacing);

    if(this.maxColorWidth !== false && this.colorWidth > this.maxColorWidth) {
      this.colorWidth = this.maxColorWidth;
    }
    this.colorHeight = this.colorWidth;


    this.setup();
    this.draw();

  },
/*
  getHeight: function() {
    return this.canvas.height;
  },
*/

  moveSelection: function(dx, dy) {

    if(this.useColorMap) {
      var colorIndex = this.selectedColors[0];
      var mapXY = this.colorToGridXy(colorIndex);
      if(dx != 0 || dy != 0 && mapXY.x !== false && mapXY.y !== false) {
        var y = mapXY.y;
        var x = mapXY.x;
        while(1) {
          x += dx;
          y += dy;
          if(y < 0 || y >= this.colorMap.length || x < 0 || x >= this.colorMap[y].length ) {
            return;
          }


          if(this.colorMap[y][x] != this.noColor) {
            this.selectedColors[0] = this.colorMap[y][x];
            if(this.colorSelected !== false) {
              this.colorSelected({ color: this.selectedColors[0], colorIndex: 0 });
            }
            this.draw();
            return;
          }
        }

      }

    } else {
      for(var y = 0; y < this.colorsDown; y++) {
        for(var x = 0; x < this.colorsAcross; x++) {
          var colorIndex = x + y * this.colorsAcross;
          if(this.sortOrder !== false && this.colors.length == this.sortOrder.length) {
            colorIndex = this.sortOrder[colorIndex];
          }

          if(colorIndex == this.selectedColors[0]) {
            var nextX = x + dx;
            var nextY = y + dy;
            if(nextX < 0 || nextX >= this.colorsAcross || nextY < 0 || nextY >= this.colorsDown) {
              return;
            }
            var colorIndex = nextX + nextY * this.colorsAcross;
            if(this.sortOrder !== false && this.colors.length == this.sortOrder.length) {
              colorIndex = this.sortOrder[colorIndex];
            }
            // set the new colour
  //          var newColor = this.sortOrder[colorIndex];
            this.selectedColors[0] = colorIndex;
            if(this.colorSelected !== false) {
              this.colorSelected({ color: colorIndex, colorIndex: 0 });
            }
            this.draw();

            return;
          }

        }
      }
    }


  },

  gridXYToCell: function(gridX, gridY) {
    var x = gridX * (this.colorWidth + this.colorSpacing);
    var y = gridY * (this.colorHeight + this.colorSpacing);

    return {
      centerX: x + (this.colorWidth / 2),
      centerY: y + (this.colorHeight / 2)
    };

  },


  xyToColor: function(x, y) {
    x -= this.colorSpacing * 2;
    y -= this.colorSpacing * 2;

    if(x < 0 || y < 0) {
      return this.noColor;
    }

    var colorX = Math.floor(x / (this.colorWidth + this.colorSpacing));
    var colorY = Math.floor(y / (this.colorHeight + this.colorSpacing));

    if(this.useColorMap) {
      if(colorY < this.colorMap.length && colorX < this.colorMap[colorY].length) {
        return this.colorMap[colorY][colorX];
      }

    } else {
      if(colorX >= this.colorsAcross || colorX < 0) {
        return  this.editor.colorPaletteManager.noColor;
      }

      if(colorY >= this.colorsDown || colorY < 0) {
        return  this.editor.colorPaletteManager.noColor;
      }

      var color = colorY * this.colorsAcross + colorX;

      if(this.sortOrder !== false && this.colors.length == this.sortOrder.length) {
        color = this.sortOrder[color];
      }

      return color;
    }

    return this.noColor;
  },

  colorToGridXy: function(color) {
    var colorIndex = color;

    if(color === this.noColor) {
      return {x: false, y: false};
    }

    if(this.useColorMap) {
      for(var y = 0; y < this.colorMap.length; y++) {
        for(var x = 0; x < this.colorMap[y].length; x++) {
          if(this.colorMap[y][x] == colorIndex) {
            return { x: x, y: y};

          }

        }
      }

    } else {
      if(this.sortOrder !== false && this.colors.length == this.sortOrder.length) {
        for(var i = 0; i < this.sortOrder.length; i++) {
          if(this.sortOrder[i] == colorIndex) {
            colorIndex = i;
            break;
          }
        }
      }

      var x = colorIndex % this.colorsAcross;
      var y = Math.floor(colorIndex / this.colorsAcross);
      return {x: x, y: y};
    }

    return { x: false, y: false };
  },


  startDragColor: function(gridX, gridY) {
    var colorIndex = this.getColorAtMapXY(gridX, gridY);
    if(colorIndex === this.noColor) {
      return;
    }

    this.inDragColor = true;
    this.dragColorX = gridX;
    this.dragColorY = gridY;
    this.dragColorIndex = colorIndex;

    // get the mouse offset into the grid cell
    var xPos = this.colorSpacing + gridX * (this.colorWidth + this.colorSpacing);
    var yPos = this.colorSpacing + gridY * (this.colorHeight + this.colorSpacing);
    this.dragOffsetX = xPos - this.lastX;
    this.dragOffsetY = yPos - this.lastY;

    UI.captureMouse(this);
  },

  endDragColor: function(gridX, gridY) {
    if(this.gridEndDrag) {
      this.gridEndDrag(this.dragColorX, this.dragColorY, gridX, gridY);
    }
  },

  startDragMarquee: function(dragMarqueeContents) {

    this.inDragMarquee = true;
    this.dragMarqueeContents = dragMarqueeContents;

    // get the mouse offset into the marquee
    var xPos = this.colorSpacing + this.marqueeLeft * (this.colorWidth + this.colorSpacing);
    var yPos = this.colorSpacing + this.marqueeTop * (this.colorHeight + this.colorSpacing);
    this.dragOffsetX = xPos - this.lastX;
    this.dragOffsetY = yPos - this.lastY;

    UI.captureMouse(this);

  },

  getInDragMarquee: function() {
    return this.inDragMarquee;
  },

  endDragMarquee: function() {
    var xPos = this.lastX + this.dragOffsetX;
    var yPos = this.lastY + this.dragOffsetY;

    
    var left = xPos; //this.colorSpacing + this.marqueeLeft * (this.colorWidth + this.colorSpacing);
    var top = yPos; //this.colorSpacing + this.marqueeTop * (this.colorHeight + this.colorSpacing);

    var gridX = Math.floor(  (xPos / (this.colorWidth + this.colorSpacing)) - this.colorSpacing );
    var gridY = Math.floor(  (yPos / (this.colorHeight + this.colorSpacing)) - this.colorSpacing );
    //var width = this.marqueeWidth * (this.colorWidth + this.colorSpacing);
    //var height = this.marqueeHeight * (this.colorHeight + this.colorSpacing);

    if(this.gridEndMarqueeDrag) {
      this.gridEndMarqueeDrag(this.marqueeLeft, this.marqueeTop, this.marqueeWidth, this.marqueeHeight, gridX, gridY);
    }


    this.marqueeLeft = gridX;
    this.marqueeTop = gridY;
  },

  getColorMap: function() {
    return this.colorMap;
  },

  getColorAtMapXY: function(x, y) {
    if(y < this.colorMap.length && x < this.colorMap[y].length) {
      return this.colorMap[y][x];
    }

    return this.noColor;
  },

  setColorAtMapXY: function(x, y, color) {
    if(x >= 0 && y >= 0 && y < this.colorMap.length && x < this.colorMap[y].length) {
      this.colorMap[y][x] = color;
    }
  },

  drawGridLines: function() {


    var colorsAcross = 1;
    var colorsDown = 1;
    if(this.colorMap.length > 0) {
      colorsAcross = this.colorMap[0].length;
      colorsDown = this.colorMap.length;
    }


    this.context.beginPath();

    for(var x = 0; x < colorsAcross; x++) {
      var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
//      var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);
//      var xPosition = gridX;

      this.context.moveTo(xPos, 0);
      this.context.lineTo(xPos, this.canvas.height);

    }


    for(var y = 0; y < colorsDown; y++) {
      var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing); 
      this.context.moveTo(0, yPos + 0.5);
      this.context.lineTo(this.canvas.width, yPos + 0.5);          
    }

    this.context.strokeStyle = styles.textMode.gridView2dGridLine;
    this.context.lineWidth = styles.textMode.gridView2dGridLineWidth;
    this.context.stroke();
  },


  setCursorRGB: function(cursorRGB) {
    if(this.cursorRGB === cursorRGB) {
      return;
    }
    if(cursorRGB === false) {
      this.cursorRGB = false;
    } else {
      this.cursorRGB = '#' +  ("000000" + cursorRGB.toString(16)).substr(-6);
    }
  },


  getContext: function() {
    return this.context;
  },


  draw: function() {

    if(!this.drawEnabled) {
      return;
    }

//    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if(this.colorMap.length == 0) {
      return;
    }


    //console.log('draw color palette display');
    // draw in the stipple
    var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);      
    var index = 0;

    for(var y = 0; y < this.canvas.height; y++) {
      for(var x = 0; x < this.canvas.width; x++) {
        if( (x + y) % (2 * this.canvasScale))  {
          imageData.data[index++] = 30;
          imageData.data[index++] = 30;
          imageData.data[index++] = 30;
        } else {          
          imageData.data[index++] = 70;
          imageData.data[index++] = 70;
          imageData.data[index++] = 70;
        }
        imageData.data[index++] = 255;
      }
    }

    this.context.putImageData(imageData, 0, 0);

    var colorsAcross = 1;
    var colorsDown = 1;

    if(this.colorMap.length > 0) {
      colorsAcross = this.colorMap[0].length;
      colorsDown = this.colorMap.length;
    }

    this.colorsAcross = colorsAcross;
    this.colorsDown = colorsDown;

    var screenMode = this.editor.getScreenMode();


    for(var y = 0; y < colorsDown; y++) {
      for(var x = 0; x < colorsAcross; x++) {

        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);

        var colorIndex = x + y * this.colorsAcross;

        if(this.useColorMap) {
          colorIndex = this.colorMap[y][x];
        }

        if(colorIndex < this.colors.length && colorIndex >= 0) {

          var multicolorMode = false;

          if(screenMode === TextModeEditor.Mode.C64MULTICOLOR && this.type == 'cellcolor') {

            if(this.editor.graphic.getType() == 'sprite') {
              multicolorMode = true;
            } else if(colorIndex >= 8) {
              colorIndex -= 8;
              multicolorMode = true;
            }
          }
          var alpha = (this.colors[colorIndex] >>> 24) & 0xff;
          var color = this.colors[colorIndex] & 0xffffff;

          var colorHexString = ("000000" + color.toString(16)).substr(-6);

          this.context.fillStyle = '#' + colorHexString;
          this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);


          if(multicolorMode && this.editor.graphic.getType() !== 'sprite') {
            this.context.font = "8px Verdana";
            this.context.fillStyle = "#eeeeee";
            this.context.fillText("M",  xPos + 2, yPos + 8); 

          }


        }
      }
    }

    // draw grid lines
    if(this.gridLinesVisible) {
      this.drawGridLines();
    }



    // draw selected colour outlines
    for(var i = 0; i < this.selectedColors.length; i++) {
      var colorPosition = { x: false, y: false };

      if(this.selectedColors[i] !== this.editor.colorPaletteManager.noColor) {
        colorPosition = this.colorToGridXy(this.selectedColors[i]);

        if(colorPosition.x !== false) {
          // should check 
          this.context.fillStyle = "#ffff00";
          this.context.strokeStyle = "#ffff00";

          var xPos = this.colorSpacing + (colorPosition.x) * (this.colorWidth + this.colorSpacing);
          var yPos = this.colorSpacing + colorPosition.y * (this.colorHeight + this.colorSpacing);

          this.context.beginPath();
          if(i % 2 == 0 || this.canSelectMultiple) {
            this.context.moveTo(xPos, yPos);
            this.context.lineTo(xPos + this.colorWidth / 3, yPos);
            this.context.lineTo(xPos, yPos + this.colorHeight / 3);
          } else {
            this.context.moveTo(xPos + this.colorWidth, yPos + this.colorHeight);
            this.context.lineTo(xPos + this.colorWidth - this.colorWidth / 3, yPos + this.colorHeight);
            this.context.lineTo(xPos + this.colorWidth, yPos + this.colorHeight - this.colorHeight / 3);

          }
          this.context.fill();

          this.context.beginPath();
          this.context.lineWidth = 2;
          this.context.rect(xPos, yPos, this.colorWidth, this.colorHeight);
          this.context.stroke();
        }

      }
    }


    // draw highlight colour outline

    if(this.highlightColor !== false) {
      var colorPosition = this.colorToGridXy(this.highlightColor);

      if(colorPosition.x !== false) {
        this.context.strokeStyle = styles.colorPalette.highlightOutline;
        var xPos = this.colorSpacing + colorPosition.x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + colorPosition.y * (this.colorWidth + this.colorSpacing);


        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.rect(xPos, yPos, this.colorWidth, this.colorHeight);
        this.context.stroke();
      }
    }


    // fill highlight colour

    if(!this.inDragMarquee && (this.drawHighlightInMarquee|| !this.inMarquee(this.highlightGridX, this.highlightGridY)) ) {
      if(this.highlightGridX !== false && this.highlightGridY !== false) {
        var xPos = this.colorSpacing + this.highlightGridX * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + this.highlightGridY * (this.colorWidth + this.colorSpacing);

        if(this.cursorRGB !== false) {
          this.context.fillStyle = this.cursorRGB;
          this.context.globalAlpha = 0.5;
          this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
          this.context.globalAlpha = 1;
        }

        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.rect(xPos, yPos, this.colorWidth, this.colorHeight);
        this.context.stroke();

      }
    }


    // draw marquee
    if(this.marquee && this.marqueeLeft !== false && this.marqueeTop !== false) {
      var left = this.colorSpacing + this.marqueeLeft * (this.colorWidth + this.colorSpacing);
      var top = this.colorSpacing + this.marqueeTop * (this.colorHeight + this.colorSpacing);
      var width = this.marqueeWidth * (this.colorWidth + this.colorSpacing);
      var height = this.marqueeHeight * (this.colorHeight + this.colorSpacing);


      if(this.editor.lastDashOffset == 0) {
        this.context.setLineDash([5, 5]);
      } else {
        this.context.setLineDash([0,5,5,0]);
      }


      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.rect(left, top, width, height);
      this.context.stroke();

      this.context.setLineDash([]); 

    }


    if(this.inDragMarquee) {
      var xPos = this.lastX + this.dragOffsetX;
      var yPos = this.lastY + this.dragOffsetY;
      
      var left = xPos; //this.colorSpacing + this.marqueeLeft * (this.colorWidth + this.colorSpacing);
      var top = yPos; //this.colorSpacing + this.marqueeTop * (this.colorHeight + this.colorSpacing);
      var width = this.marqueeWidth * (this.colorWidth + this.colorSpacing);
      var height = this.marqueeHeight * (this.colorHeight + this.colorSpacing);

      if(this.dragMarqueeContents) {
        for(var y = 0; y < this.marqueeHeight; y++) {
          for(var x = 0; x < this.marqueeWidth; x++) {
            xPos = left + x * (this.colorWidth + this.colorSpacing);
            yPos = top + y * (this.colorHeight + this.colorSpacing);

            var colorIndex = this.colorMap[y + this.marqueeTop][x + this.marqueeLeft]

            if(colorIndex < this.colors.length && colorIndex >= 0) {
              var color = this.colors[colorIndex] & 0xffffff;
              var colorHexString = ("000000" + color.toString(16)).substr(-6);

              this.context.fillStyle = '#' + colorHexString;
              this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
            }



            ;
          }
        }
      }

      if(this.editor.lastDashOffset == 0) {
        this.context.setLineDash([5, 5]);
      } else {
        this.context.setLineDash([0,5,5,0]);
      }


      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.rect(left, top, width, height);
      this.context.stroke();

      this.context.setLineDash([]); 


    }


    // draw drag colour
    if(this.inDragColor) {

      var xPos = this.colorSpacing + this.dragColorX * (this.colorWidth + this.colorSpacing);
      var yPos = this.colorSpacing + this.dragColorY * (this.colorWidth + this.colorSpacing);


      this.context.strokeStyle = "#ffff00";
      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.rect(xPos, yPos, this.colorWidth, this.colorHeight);
      this.context.stroke();


      var xPos = this.lastX + this.dragOffsetX;
      var yPos = this.lastY + this.dragOffsetY;

      var color = this.colors[this.dragColorIndex];

      var colorHexString = ("000000" + color.toString(16)).substr(-6);
      this.context.fillStyle = '#' + colorHexString;
      this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);


    }

  }

}