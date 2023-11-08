var GridView2d = function() {
  this.editor = null;
  this.uiComponent = null;
  this.camera = null;

  this.canvas = null;
  this.context = null;

  // checkerboard pattern
  this.backgroundCanvas = null;

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

}
GridView2d.prototype = {
  init: function(editor, uiComponent) {
    this.editor = editor;
    this.uiComponent = uiComponent;

    var _this = this;
    uiComponent.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);
    });

    this.uiComponent.on('keydown', function(event) {
      _this.keyDown(event);
    });

    this.uiComponent.on('keyup', function(event) {
      _this.keyUp(event);
    });

    this.uiComponent.on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    this.uiComponent.on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    this.uiComponent.on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    this.uiComponent.on('mousewheel', function(event) {
      _this.mouseWheel(event);
    });

    this.uiComponent.on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });

    this.uiComponent.on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });

    this.uiComponent.on('contextmenu', function(event) {
      _this.contextMenu(event);
    });


    this.camera = {};
    this.camera.position = {
      x: 0,
      y: 0
    };
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
  },

  mouseDown: function(event) {
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

  calculateScroll: function() {
    this.vPadding = 200 * this.scale;
    this.hPadding = 300 * this.scale;

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

  resize: function(left, top, width, height) {

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;

    this.canvas = this.uiComponent.getCanvas();

    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
  },

  render: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    
  }





}