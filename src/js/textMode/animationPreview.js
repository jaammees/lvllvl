var AnimationPreview = function() {
  this.editor = null;
  this.visible = false;

  this.currentCanvasElementId = '';
  this.canvasElementId = '';
  this.canvasHolderElementId = '';
  this.screenCanvas = null;
  this.screenContext = null;

  this.lastFrameTime = 0;
  this.currentFrame = 0;

  this.scale = 1;
  this.scaleFit = false;

  this.fromFrame = 0;
  this.toFrame = 0;

}

AnimationPreview.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentPanel) {
    var _this = this;

    var html = '';

    html += '<div class="panelFill">';
    html += '  <div style="position: absolute; top: 10px; left: 0; right: 0; bottom: 40px" id="animationPreviewHolder">';
    html += '    <canvas id="animationPreviewCanvas" style=""></canvas>';
    html += '  </div>';


    html += '<div style="position: absolute; bottom: 0px; height: 40px; left: 0; right: 0">';


    html += '<div>';
    html += '  <select id="animationFrameRange">';
    html += '    <option value="" selected="selected">All Frames</option>';
    html += '  </select>';

    html += '</div>';

    html += '<div class="ui-button">Play</div>';
    html += '<select id="animationPreviewScale">';
    html += '<option value="0" selected="selected">Fit</option>';
    html += '<option value="1">100%</option>';
    html += '<option value="2">200%</option>';
    html += '<option value="3">300%</option>';
    html += '<option value="4">400%</option>';
    html += '<option value="5">500%</option>';
    html += '<option value="6">600%</option>';
    html += '</select>';
    html += '</div>';


    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html });

    this.uiComponent.on('resize', function() {
      _this.resize();
    });
    parentPanel.add(this.uiComponent);

    this.canvasElementId = 'animationPreviewCanvas';
    this.canvasHolderElementId = 'animationPreviewHolder';

    
    UI.on('ready', function() {

      var value = parseInt($('#animationPreviewScale').val());
      _this.setScale(value);

      $('#animationPreviewScale').on('change', function() {
        var value = parseInt($(this).val());
        _this.setScale(value);
      });
      _this.resize();
      _this.initEvents();
    });
  },

  show: function() {
    this.visible = true;
    this.resize();
  },

  hide: function() {
    this.visible = false;
  },

  getVisible: function() {
    return this.visible;
  },
  
  initEvents: function() {
    var _this = this;

    $('#animationFrameRange').on('change', function() {
      var value = $(this).val();
      _this.setFrameRange(value);
    });

  },

  updateFrameRanges: function() {
    var currentValue = $('#animationFrameRange').val();

    if(currentValue !== '') {
      currentValue = parseInt(currentValue, 10);
    }

    var html = '';
    html += '<option value="">All Frames</option>';
    var frameRanges = this.editor.graphic.getFrameRanges();
    for(var i = 0; i < frameRanges.length; i++) {
      var rangeNumber = i + 1;
      var name = 'Range ' + rangeNumber;
      html += '<option value="' + i + '" ';
      if(i === currentValue) {
        html += ' selected="selected" ';
      }
      html += '>' + name + '</option>';
    } 

    $('#animationFrameRange').html(html);
    var value = $('#animationFrameRange').val();
    this.setFrameRange(value);
  },

  setFrameRange: function(value) {
    if(value !== '') {
      value = parseInt(value, 10);
      if(isNaN(value)) {
        return;
      }
    }

    this.frameRange = value;
    var frameRanges = this.editor.graphic.getFrameRanges();
    this.fromFrame = 0;
    this.toFrame = this.editor.graphic.getFrameCount();

    if(value !== '' && value >= 0 && value < frameRanges.length) {
      this.fromFrame = frameRanges[value].start;
      this.toFrame = frameRanges[value].end;
    }

    if(currentFrame < this.fromFrame || currentFrame >= this.toFrame) {
      this.currentFrame = this.fromFrame;
    }

    var selectValue = $('#animationFrameRange').val();
    if(selectValue !== '') {
      selectValue = parseInt(selectValue, 10);
    }

    if(selectValue !== value) {
      $('#animationFrameRange').val(value);
    }

    this.editor.spriteFrames.drawRange({ rangesChanged: false });
    this.editor.spriteFrames.draw({ framesChanged: false });

  },

  getFrameRange: function() {
    return this.frameRange;
  },

  setScale: function(scale) {
    this.scaleFit = scale == 0;    
    this.scale = scale;
  },

  setCanvasElementId: function(canvasElementId, canvasHolderElementId) {
    this.canvasElementId = canvasElementId;
    this.canvasHolderElementId = canvasHolderElementId;
  },

  sizeCanvas: function() {

    var element = $('#' + this.canvasHolderElementId);
    if(this.canvas == null || this.canvasElementId != this.currentCanvasElementId) {
      this.canvas = document.getElementById(this.canvasElementId);
      this.currentCanvasElementId = this.canvasElementId;
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

        this.canvasScale = Math.floor(UI.devicePixelRatio);
        
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.canvas.width = this.width * this.canvasScale;
        this.canvas.height = this.height * this.canvasScale;
      }
    }

    this.context = this.canvas.getContext('2d');
//    this.context.scale(this.scale, this.scale);

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;


  },

  resize: function() {
    if(!this.visible) {
      return;
    }


    this.sizeCanvas();
    this.draw();
  },

  draw: function() {
    if(!this.visible) {
      return;
    }

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    if(this.screenCanvas == null) {
      this.screenCanvas = document.createElement('canvas');
    }

    if(this.screenContext == null || this.screenCanvas.width != screenWidth || this.screenCanvas.height != screenHeight) {
      this.screenCanvas.width = screenWidth;
      this.screenCanvas.height = screenHeight;
      this.screenContext = this.screenCanvas.getContext('2d');

      this.screenContext.imageSmoothingEnabled = false;
      this.screenContext.webkitImageSmoothingEnabled = false;
      this.screenContext.mozImageSmoothingEnabled = false;
      this.screenContext.msImageSmoothingEnabled = false;
      this.screenContext.oImageSmoothingEnabled = false;
    }



    this.layers = 'visible';

    this.screenContext.clearRect(0, 0, this.screenCanvas.width, this.screenCanvas.height);

    var selectionActive = this.editor.tools.drawTools.pixelSelect.isActive();
    this.editor.tools.drawTools.pixelSelect.setActive(false);
    this.editor.grid.grid2d.drawFrame({ 
      allCells: true,
      updateLayerCanvas: false,
      canvas: this.screenCanvas, 
      context: this.screenContext, 
      frame: this.currentFrame, 
      layers: this.layers });
    this.editor.tools.drawTools.pixelSelect.setActive(selectionActive);

    var scale = this.scale * this.canvasScale;
    if(scale === 0) {
      var hScale = Math.floor((this.canvas.width - 10) / screenWidth);
      var vScale = Math.floor((this.canvas.height - 10) / screenHeight);
      if(vScale > hScale) {
        scale = hScale;
      } else {
        scale = vScale;
      }
    }

    var width = this.screenCanvas.width * scale;
    var height = this.screenCanvas.height * scale;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.screenCanvas, (this.canvas.width - width) / 2, (this.canvas.height - height) / 2,  
                           this.screenCanvas.width * scale, 
                           this.screenCanvas.height * scale);

/*this.borderWidth * this.scale, this.borderHeight * this.scale, 
      this.screenCanvas.width * this.scale, this.screenCanvas.height * this.scale);
*/

  },


  update: function() {
    if(this.editor.frames.playFrames) {
      // playing so just do the same frames...
      var frame = this.editor.graphic.getCurrentFrame();
      if(frame !== this.currentFrame) {
        this.currentFrame = frame;
        this.draw();        
      }

    } else {
      this.playDirection = 1;

      var time = getTimestamp();   

      var frameCount = this.editor.graphic.getFrameCount();

      // what is the start and end of the current frame range
      var frameRanges = this.editor.graphic.getFrameRanges();
      this.fromFrame = 0;
      this.toFrame = frameCount;

      if(this.frameRange !== '' && this.frameRange >= 0 && this.frameRange < frameRanges.length) {
        this.fromFrame = frameRanges[this.frameRange].start;
        this.toFrame = frameRanges[this.frameRange].end;
      }


      if(this.currentFrame >= this.toFrame) {
        this.currentFrame = this.fromFrame;

        if(frameCount == 0) {
          return;
        }
      } 

      if( time - this.lastFrameTime > this.editor.graphic.frames[this.currentFrame].duration * FRAMERATE) {

        var frame = this.currentFrame;

        frame += this.playDirection;

        if(frame >= this.toFrame) {
          frame = this.fromFrame;
        }      

        this.currentFrame = frame;
        this.lastFrameTime = time;      
        this.draw();

      }
    
    }
  }

}

