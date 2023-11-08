var FrameTimeline = function() {
  this.editor = null;

  this.canvas = null;

  this.highlightFrame = false;

  this.frameWidth = 18;
  this.frameHeight = 14;
  this.frameMargin = 2;

  this.frameCount = 0;


}

FrameTimeline.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentComponent) {
    var _this = this;

    var html = '';
    html += '<div>';
    html += '<span style="line-height: 20px; vertical-align: middle; margin-left: 3px" class="gridinfo-label">Frames</span>';
    html += '<div id="frameTimelineHolder" style="position: absolute; top: 0; right: 0; left: 48px; bottom: 0; background-color: #111111"><canvas id="frameTimeline"></canvas></div>';
    html += '</div>';
    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html });
    /*
    this.uiComponent.load("html/textMode/frames.html", function() {
      _this.initEvents();

    });
*/

    this.uiComponent.on('resize', function() {
      _this.resize();
    });
    parentComponent.add(this.uiComponent);

    UI.on('ready', function() {
      _this.resize();
      _this.initEvents();
    });
  },


  initEvents: function() {
    var _this = this;
    $('#frameTimeline').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#frameTimeline').on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#frameTimeline').on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#frameTimeline').on('mouseleave', function(event) {
      _this.setHighlightFrame(false);
    });

  },

  sizeCanvas: function() {
    var element = $('#frameTimelineHolder');

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }

    if(this.canvas == null) {
      this.canvas = document.getElementById('frameTimeline');
    }

    if(this.width != this.canvas.style.width || this.height != this.canvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.canvas.width = this.width * UI.devicePixelRatio;
        this.canvas.height = this.height * UI.devicePixelRatio;

        this.scale = UI.devicePixelRatio;

      }
    }

    this.context = this.canvas.getContext('2d');
    this.context.scale(this.scale, this.scale);

  },

  resize: function() {
    this.sizeCanvas();
    this.draw();
  },

  mouseDown: function(event) {

    if(this.highlightFrame !== false && this.highlightFrame >= 0 && this.highlightFrame < this.editor.graphic.getFrameCount() ) {
      this.editor.frames.gotoFrame(this.highlightFrame);
    }

  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var frame = Math.floor(x / (this.frameWidth + this.frameMargin));
    this.setHighlightFrame(frame);

  },

  mouseUp: function(event) {

  },


  setHighlightFrame: function(frame) {
    if(frame === this.highlightFrame) {
      return;
    }


    this.highlightFrame = frame;
    this.drawFrames();

  },

  drawFrames: function() {


//    this.rulerContext.beginPath();    
//    this.rulerContext.strokeStyle = '#555555';    

    var currentFrame = this.editor.graphic.getCurrentFrame();

    var frameTextPositionY = 13;
    var frameCount = this.editor.graphic.getFrameCount();

    if(this.frameCount != frameCount) {
      // check the size of the canvas, sometimes it doesn't resize..
      this.sizeCanvas();
      this.frameCount = frameCount;
    }

    this.context.fillStyle = '#111111';

    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var frameWidth = this.frameWidth;
    var frameHeight = this.frameHeight;
    var frameMargin = this.frameMargin;

    for(var i = 0; i < frameCount; i++) {
      var frame = i + 1;
      var frameStartPosition = i * (frameWidth + frameMargin) + 0.5;
      var frameEndPosition = i * (frameWidth + frameMargin) + frameWidth;
      var frameTextPositionX = frameStartPosition + 3;

      if(i === currentFrame) {
        this.context.fillStyle = '#444444';
      } else if(i === this.highlightFrame) {
        this.context.fillStyle = '#3d3d3d';
      } else {
        this.context.fillStyle = '#2d2d2d';
      }
      this.context.fillRect(frameStartPosition, 3.5, frameWidth, frameHeight);
    }


    this.context.font = "8px Verdana";
    this.context.fillStyle = "#eeeeee";

    this.context.beginPath();
    this.context.lineWidth = 1;

    for(var i = 0; i < frameCount; i++) {
      if(i !== currentFrame) {
        var frame = i + 1;
        var frameStartPosition = i * (frameWidth + frameMargin) + 0.5;
        var frameEndPosition = i * (frameWidth + frameMargin) + frameWidth;
        var frameTextPositionX = frameStartPosition + 3;

  /*
        if(i === currentFrame) {
          this.context.rect(frameStartPosition, 3.5, frameWidth, frameHeight);
        }
  */

        this.context.fillText(frame, frameTextPositionX, frameTextPositionY); 
      }

    }
    this.context.strokeStyle = '#777777';    
    this.context.stroke();


    // do the current frame
    this.context.beginPath();
    this.context.lineWidth = 1;
    var i = currentFrame;
    var frame = i + 1;
    var frameStartPosition = i * (frameWidth + frameMargin) + 0.5;
    var frameEndPosition = i * (frameWidth + frameMargin) + frameWidth;
    var frameTextPositionX = frameStartPosition + 3;

    this.context.rect(frameStartPosition, 3.5, frameWidth, frameHeight);
    this.context.fillText(frame, frameTextPositionX, frameTextPositionY); 
    this.context.strokeStyle = '#555555';    
    this.context.stroke();


/*
    for(var i = 0; i < this.trackLength; i++) {
      if(i % 16 == 0) {
        this.rulerContext.moveTo(i * this.patternCellWidth + 0.5, 2);        
        this.rulerContext.lineTo(i * this.patternCellWidth + 0.5, this.rulerCanvas.height / this.canvasScale);

        var bar = 1 + (i / 16);
        this.rulerContext.fillText(bar, i * this.patternCellWidth + 4, this.rulerCanvas.height / this.canvasScale - 9);

      } else {
        this.rulerContext.moveTo(i * this.patternCellWidth + 0.5, 
          this.rulerCanvas.height / this.canvasScale - ((1 * this.rulerCanvas.height / this.canvasScale) / 4) );        
        this.rulerContext.lineTo(i * this.patternCellWidth + 0.5, this.rulerCanvas.height / this.canvasScale);        
      }
    }

    this.rulerContext.stroke();
*/

  },

  draw: function() {
    this.drawFrames();
  }
}
