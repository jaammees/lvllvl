UI.CanvasScrollPanel = function() {

  this.init = function(args) {

//    UI.canvasComponents.push(this);
    this.canvas = null;

    this.scale = 1;
    this.left = false;
    this.top = false;
    this.width = false;
    this.height = false;

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

    this.mouseIsDown = false;

    this.saveCursor = false;

    this.canvasScale = UI.devicePixelRatio;

  } 

  this.getElement = function() {
    this.element = document.createElement('div');
    this.element.setAttribute('id', this.id);
    this.element.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0');
    this.element.setAttribute('class', 'ui-canvas-panel ui-mouseevents');
    
    this.element.innerHTML = '<canvas style="" id="' + this.id + '-canvas"></canvas>';

    
    return this.element;

  }

  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0" class="ui-canvas-panel ui-mouseevents">';

    html += '<canvas style="" id="' + this.id + '-canvas"></canvas>';
    html += '</div>';


    return html;
  }

  this.initEvents = function() {
    var _this = this;    
//    this.getCanvas();

    this.canvas.addEventListener('dblclick', function(event) {
      _this.dblClick(event);
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
  }

  this.getCanvas = function() {
    if(this.canvas == null) {
      this.canvas =  document.getElementById(this.id + '-canvas');
      if(this.canvas != null) {
        this.initEvents();
      }
    } 
    return this.canvas;

  }

  this.contextMenu = function(event) {
    this.trigger('contextmenu', event);
  }


  this.mouseDownVScroll = function(button, x, y) {

    if(y <  this.vScrollBarPosition) {
      this.setYScroll(this.scrollY - 20);

    } else if(y >   this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY + 20);
    } else {
      this.vScroll = true;
    }
  }

  this.mouseDownHScroll = function(button, x, y) {


    if(x < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 20);
    } else if(x > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 20);
    } else {
      this.hScroll = true;
    }
    
  }


  this.setButtons = function(event) {
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

  }

  this.mouseDown = function(event) {
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

    this.trigger('mousedown', event);
  }

  this.dblClick = function(event) {
    this.trigger('dblclick', event);
  }

  this.mouseWheel = function(event, delta) {
    
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var factor = 6;

    this.setYScroll(this.scrollY + wheel.spinY * factor);
    this.setXScroll(this.scrollX + wheel.spinX * factor);

  }

  this.dragView = function(x, y, deltaX, deltaY) {
    //UI.setCursor('move');
    this.setYScroll(this.scrollY - deltaY);
    this.setXScroll(this.scrollX - deltaX);
  }


  this.mouseMoveVScroll = function(x, y, deltaX, deltaY) {
    var scale = this.vScrollBarHeight / (this.contentHeight);
    var diffY = (y - this.mouseDownAtY) / scale;

    this.setYScroll(this.mouseDownAtScrollY + diffY);
  }

  this.mouseMoveHScroll = function(x, y, deltaX, deltaY) {

    var scale = this.hScrollBarWidth / (this.contentWidth);
    var diffX = (x - this.mouseDownAtX) / scale;
    this.setXScroll(this.mouseDownAtScrollX + diffX);
  }

  this.mouseMove = function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var deltaX = x - this.lastMouseX;
    var deltaY = y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;


    var redrawCharPalette = false;

    if( (this.buttons & UI.MIDDLEMOUSEBUTTON)) {
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


    // is mouse over vertical scroll bar?
    if(x > this.width - this.vScrollBarWidth && y < this.canvas.height ) {
      UI.setCursor('default');      
      return;
    }

    // is mouse over horizontal scroll bar
    if(x > 0 && y < this.hScrollBarHeight) {
      UI.setCursor('default');      
      return;
    }

//    x += this.scrollX;
//    y += this.scrollY;

    this.trigger('mousemove', event);

  }


  this.mouseUp = function(event) {
    this.xScrollSpeed = 0;
    this.yScrollSpeed = 0;

    this.vScroll = false;
    this.hScroll = false;
    this.mouseDownX = false;
    this.mouseDownY = false;
    this.mouseIsDown = false;

    if(!UI.isMobile.any()) {
      this.setButtons(event);
    } else {
      this.buttons = 0;
    }
    UI.setCursor('default');     

    this.trigger('mouseup', event);

//    this.draw();    

  }

  this.setXScroll = function(scrollX) {
    var viewWidth = this.viewWidth;
    if(scrollX + viewWidth > this.contentWidth) {
      scrollX = this.contentWidth - viewWidth;
    }

    if(scrollX < 0) {
      scrollX = 0;
    }

    this.scrollX = scrollX;

//    this.draw();

  }

  this.scrollToX = function(x) {
    this.setXScroll(x);

  }

  this.scrollToY = function(y) {
    this.setYScroll(y);
  }

  this.setYScroll = function(scrollY) {

    var viewHeight = this.viewHeight;

    if(scrollY + viewHeight > this.contentHeight) {
      scrollY = this.contentHeight - viewHeight;
    }

    if(scrollY < 0) {
      scrollY = 0;
    }

    this.scrollY = scrollY;
//    this.draw();

  }



  this.calculateScroll = function() {
//    this.resize();

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

    if(this.vScrollBarPositionHeight < 4) {
      this.vScrollBarPositionHeight = 4;
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
  }

  this.setContentHeight = function(contentHeight) {
    if(contentHeight != this.contentHeight) {
      this.contentHeight = contentHeight;
      this.render();
    }
  }

  this.getWidth = function() {
    return this.canvas.width;
  }

  this.getHeight = function() {
    return this.canvas.height;
  }

  this.setScrollY = function(scrollY) {
    this.scrollY = scrollY;
    this.calculateScroll();
  }
  this.getScrollY = function() {
    return this.scrollY;
  }

  this.getScrollX = function() {
    return this.scrollX;
  }

  this.resize = function() {

    if(this.canvas == null) {
      this.getCanvas();

      if(!this.canvas) {
        return;
      }
    }

    var element = $('#' + this.id);

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';

    this.canvasScale = UI.devicePixelRatio;
//    this.canvasScale = 1;

    this.canvas.width = this.width * this.canvasScale;
    this.canvas.height = this.height * this.canvasScale;



    this.width = this.canvas.width / this.canvasScale;
    this.height = this.canvas.height / this.canvasScale;
    this.viewWidth = this.width - this.vScrollBarWidth;
    this.viewHeight = this.height - this.hScrollBarHeight;

    this.contentWidth = this.viewWidth;

    this.trigger('resize');
  }

  this.getScale = function() {
    return this.canvasScale;
  },
 
  this.getElementId = function() {
    return this.id;
  },

  
  this.getContext = function() {
    if(this.canvas == null) {
      this.getCanvas();
      if(this.canvas == null) {
        return;
      }
    }
    this.context = this.canvas.getContext('2d', { "alpha": false });

    
    return this.context;
  }

  this.draw = function(context) {
    this.context.fillStyle= '#ee3344';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  }
  this.render = function() {
    
    if(this.canvas == null) {
      this.getCanvas();
      if(this.canvas == null) {
        return;
      }
    }
    this.context = this.canvas.getContext('2d', { "alpha": false });

    this.calculateScroll();

    this.draw(this.context);


    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';

    // horizontal scroll
    if(this.hScrollBarPosition > 0 && this.hScrollBarWidth > 0) {
      this.context.fillRect(0, (this.height - this.hScrollBarHeight) * this.canvasScale, 
              this.viewWidth * this.canvasScale, this.hScrollBarHeight * this.canvasScale);
      this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';

      this.context.fillRect(this.hScrollBarPosition * this.canvasScale, 
              (this.height - this.hScrollBarHeight + 1) * this.canvasScale, this.hScrollBarPositionWidth * this.canvasScale, 
              (this.hScrollBarHeight - 2) * this.canvasScale);
    }


//            console.log(this.vScrollBarWidth);
    // vertical scroll
    if(this.vScrollBarPositionHeight > 0 && this.vScrollBarWidth > 0) {
      this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';
      this.context.fillRect( (this.width - this.vScrollBarWidth) * this.canvasScale, 0, 
                              this.vScrollBarWidth * this.canvasScale, this.viewHeight * this.canvasScale);
      this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';
      this.context.fillRect( (this.width - this.vScrollBarWidth + 1) * this.canvasScale, 
                              this.vScrollBarPosition * this.canvasScale, 
                             (this.vScrollBarWidth - 2) * this.canvasScale, 
                             this.vScrollBarPositionHeight * this.canvasScale);
    }
    
  }

}

UI.registerComponentType("UI.CanvasScrollPanel", UI.CanvasScrollPanel);