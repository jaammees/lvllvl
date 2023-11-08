var ExportGif = function() {
  this.editor = null;

  this.canvas = null;

  this.context = null;

  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8 + 4;

  this.scale = 1;

  this.playMode = 'loop';

  this.imageEffectsControl = null;
  this.effectInputSet = false;

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = null;

  /*
  this.screenCanvas = null;
  this.screenContext = null;
  */

  this.exportGifActive = false;

  this.playDirection = 1;
  this.lastFrameTime = 0;
  this.lastTickTime = 0;
  this.playFrames = true;
  this.currentFrame = 0;
  this.tick = 0;
  this.startFrame = 0;
  this.endFrame = 0;

  this.shaderEffects = null;


  this.exportGIFFormat = 'gif';
  this.recordingVideo = false;
  this.exportLayer = 'all';


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;
  this.mouseIsDown = false;

  this.fromFrame = 0;
  this.toFrame = 0;

  this.shaderTime = 0;

  this.msPerTick = 50;
  this.totalTicks = 0;

  this.framesTickCount = 0;
  this.frameTick = 0;

  this.exportProgressDialog = null;

  this.showPrevFrameSave = false;

  this.exportInProgress = false;

  this.visible = false;

  this.uiComponent = null;
}


ExportGif.prototype = {

  initExportProgress: function() {
    var html = '<div>';
    html += '<h2>Export Progress</h2>';
    html += '<div id="exportGifProgressText"></div>';
    html += '</div>';

    this.exportProgressDialog = UI.create("UI.Dialog", 
      { "id": "exportGifProgressDialog", "title": "Export Progress", "width": 280, "height": 140 });



    this.exportProgressHTML = UI.create("UI.HTMLPanel", {"html": html});
    this.exportProgressDialog.add(this.exportProgressHTML);

  },

  init: function(editor) {
    this.editor = editor;

    this.shaderEffects = new ImageShaderEffects();
    this.shaderEffects.init();
  },


  resizePreview: function() {
    if(!this.visible) {
      return;
    }
    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportGifPreview');
      $('#exportGifPreview').on('mouseenter', function() {
        UI.setCursor('can-drag');
      });
      $('#exportGifPreview').on('mouseleave', function() {
//        UI.setCursor('default');
      });

    }

    if(this.previewCanvas == null) {
      return;
    }

    var element = $('#exportGifPreviewHolder');

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }

    this.previewCanvasScale = UI.devicePixelRatio;


    if(this.width != this.previewCanvas.style.width || this.height != this.previewCanvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.previewCanvas.style.width = this.width + 'px';
        this.previewCanvas.style.height = this.height + 'px';

        this.previewCanvas.width = this.width * this.previewCanvasScale;
        this.previewCanvas.height = this.height * this.previewCanvasScale;


      }
    }

    this.previewContext = this.previewCanvas.getContext('2d');
    this.previewContext.imageSmoothingEnabled = false;
    this.previewContext.webkitImageSmoothingEnabled = false;
    this.previewContext.mozImageSmoothingEnabled = false;
    this.previewContext.msImageSmoothingEnabled = false;
    this.previewContext.oImageSmoothingEnabled = false;

  },

  drawFrame: function(args) { 
    var redrawLayers = true;
    var applyEffects = true;

    if(typeof args != 'undefined') {
      if(typeof args.redrawLayers) {
        redrawLayers = args.redrawLayers;
      }

      if(typeof args.applyEffects != 'undefined') {
        applyEffects = args.applyEffects;
      }
    }


    // how many effects are there
    if(!this.imageEffectsControl || this.imageEffectsControl.getEffectsCount() == 0) {
      applyEffects = false;
    }


    var layers = this.exportLayer;
    if(layers == 'current') {
      layers = this.editor.layers.getSelectedLayerId();
    }       

    if(this.currentFrame < 0 || this.currentFrame >= this.editor.graphic.getFrameCount()) {
      this.currentFrame = 0;
    }

    this.initCanvas();

    if(this.previewCanvas == null) {
      this.resizePreview();
    }

    if(this.previewCanvas == null) {
      return;
    }
    

    this.editor.exportFrameImage.exportFrame({
      scale: this.scale,
      includeBorder: this.borderWidth != 0,
//      addTransparentPixel: this.addTransparentPixel,
      layers: this.exportLayer,
      frame: this.currentFrame
    });

    this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);

    if(applyEffects) {
      this.shaderEffects.setTime(this.shaderTime);
      this.shaderEffects.applyEffects();
    }


    this.previewContext.fillStyle = '#000000';
    this.previewContext.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 


    this.previewContext.save();

    this.previewContext.translate( Math.floor(this.previewCanvas.width / 2), Math.floor(this.previewCanvas.height / 2) ); 
    this.previewContext.scale(this.previewScale * this.previewCanvasScale, this.previewScale * this.previewCanvasScale);
    this.previewContext.drawImage(this.canvas, this.previewOffsetX, this.previewOffsetY);

    this.previewContext.restore();
    return;

  },

  htmlComponentLoaded: function() {
    this.componentsLoaded++;
    if(this.componentsLoaded == 4) {
      this.splitPanel.setPanelVisible('east', true);
      this.splitPanel.resize();



      $('#exportGIFScale3')[0].checked = true;
      
      var scale = parseInt($("input[type='radio'][name='exportGIFScale']:checked").val(), 10);
      this.setScale(scale);
      this.initContent();
      this.initEvents();
    }

  },


  start: function() {
    var _this = this;

    this.lastTickTime = getTimestamp();

    this.showPrevFrameSave = this.editor.frames.getShowPrevFrame();
    this.editor.frames.setShowPrevFrame(false);

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportGifDialog", "title": "Export GIF", "width": 734, "height": 626 });

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "exportGifSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });


      this.componentsLoaded = 0;

      this.effectsSplitPanel = UI.create("UI.SplitPanel");
      this.splitPanel.addEast(this.effectsSplitPanel, 324);

      this.exportGIFFramesPanel = UI.create("UI.HTMLPanel");
      this.effectsSplitPanel.addNorth(this.exportGIFFramesPanel, 140);
      this.exportGIFFramesPanel.load('html/textMode/exportGifFrames.html', function() {
        _this.htmlComponentLoaded();
      });

      this.effectsHtmlComponent = UI.create("UI.HTMLPanel");
      this.effectsSplitPanel.add(this.effectsHtmlComponent);
      this.effectsHtmlComponent.load('html/textMode/exportGifEffects.html', function() {
        _this.htmlComponentLoaded();        
      });


      this.propertiesSplit = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.propertiesSplit);
      this.htmlComponent = UI.create("UI.HTMLPanel");
      //this.splitPanel.add(this.htmlComponent);
      this.propertiesSplit.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportGif.html', function() {
        _this.htmlComponentLoaded();        
      });

      this.previewComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.addNorth(this.previewComponent, 330);

      this.previewComponent.load('html/textMode/exportGifPreview.html', function() {
        _this.htmlComponentLoaded();
      });

      this.previewComponent.on('resize', function() {
        _this.resizePreview();
//        console.log('resize preview component');
      });


      this.okButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-199-save.svg"> Download', "color": "primary" });  
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportGif();
//        UI.closeDialog();
      });

      /*
      this.gdriveButton = UI.create('UI.Button', { "text": "Save To GDrive", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.gdriveButton.on('click', function(event) {
        _this.saveToGDrive();
//        UI.closeDialog();
      });
      */

      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.editor.frames.setShowPrevFrame(_this.showPrevFrameSave);
        _this.exportGifActive = false;
      });

      this.initExportProgress();
    } else {
      this.initContent();
    }

    UI.showDialog("exportGifDialog");
    this.visible = true;
    this.exportGifActive = true;
    this.exportInProgress = false;
  },  

  saveToGDrive: function() {
    g_app.gdrive.handleAuthClick();
  },

  initContent: function() {
    var _this = this;

    $('#exportGIFAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();
    $('#exportGIFToFrame').val(frameCount);
    $('#exportGIFFromFrame').val(1);

    $('#exportGIFFromFrame').attr('max', frameCount);
    $('#exportGIFToFrame').attr('max', frameCount);

    this.playMode = $('#exportGIFLoopType').val();


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth = this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;

    if(this.imageEffectsControl == null) {
      this.imageEffectsControl = new ImageEffectsControl();
      this.imageEffectsControl.init({"htmlElementId": 'exportGIFEffects', "availableEffects": this.shaderEffects.availableEffects });


      this.imageEffectsControl.on('update', function() {
        _this.effectListUpdated();
      });

      this.imageEffectsControl.on('updateParam', function() {
        _this.effectParamUpdated();
      });


    }

    this.exportLayer = $('input[name=exportGIFLayer]:checked').val();

    this.resizePreview();
    this.setFrameParameters();
    this.calculateGifInfo();

  },

  initEvents: function() {
    var _this = this;

    $("input[type='radio'][name='exportGIFScale']").on('click', function() {
      var scale = parseInt($("input[type='radio'][name='exportGIFScale']:checked").val(), 10);
      _this.setScale(scale);
      _this.calculateGifInfo();
    });


    $('input[name=exportGIFLayer]').on('click', function() {
      _this.exportLayer = $('input[name=exportGIFLayer]:checked').val();
      _this.drawFrame();
    });

    $('#exportGIFIncludeBorder').on('click', function() {
      _this.calculateGifInfo();
    });


    $('input[name=exportGIFFormat]').on('click', function() {
      _this.exportGIFFormat = $('input[name=exportGIFFormat]:checked').val();
    });



    $('#exportGifPreview').on('mousedown', function(event) {
      _this.previewMouseDown(event);

    });


    $('#exportGifPreview').on('wheel', function(event) {
      _this.previewMouseWheel(event.originalEvent);
    });    


    $('#exportGIFLoopType').on('change', function(event) {
      _this.setFrameParameters();
//      _this.playMode = $('#exportGIFLoopType').val();
    });

    $('#exportGIFToFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportGIFFromFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportGIFRepeat').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportGIFSpeed').on('change', function(event) {
      if($(this).val() == 'custom') {
        $('#customSpeedSection').show();
      } else {
        $('#customSpeedSection').hide();

      }
      _this.setFrameParameters();
    });
/*
    $("input[type='radio'][name='exportGIFSpeed']").on('click', function(event) {
    });
*/
    $('#exportGIFMSPerTick').on('change', function() {
      _this.setFrameParameters();
    });

    $('#gifExportPreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#gifExportPreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#gifExportPreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });
  },


  setFrameParameters: function() {

    this.playMode = $('#exportGIFLoopType').val();
    var frameCount = this.editor.graphic.getFrameCount();

    var fromFrame = parseInt($('#exportGIFFromFrame').val(), 10);
    if(!isNaN(fromFrame) && fromFrame >= 1 && fromFrame <= frameCount) {
      this.fromFrame = fromFrame;
    }

    var toFrame = parseInt($('#exportGIFToFrame').val(), 10);
    if(!isNaN(toFrame) && toFrame >= 1 && toFrame <= frameCount) {
      this.toFrame = toFrame;
    }

/*
    var repeat = parseInt($('#exportGIFRepeat').val(), 10);
    if(!isNaN(repeat) && repeat >= 1) {
      this.repeat = repeat;
    }
*/
    this.repeat = 1;

    this.speed = $('#exportGIFSpeed').val();

    this.msPerTick = 50;
    if(this.speed == 'custom') {
      this.msPerTick = parseInt($('#exportGIFMSPerTick').val(), 10);
    }  else {
      this.msPerTick = FRAMERATE / parseInt(this.speed, 10);
    }  

    this.calculateGifInfo();

  },


  mouseDown: function(e) {

  },

  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawFrame({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#gifExportPreviewScale').val(displayScale);
    $('#gifExportPreviewScaleText').val(displayScale);
  },

  previewMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var newScale = this.previewScale - wheel.spinY  / 8;//12;
    if(newScale >= 0.1) {
      this.setPreviewScale(newScale);
    }
  },

  previewMouseDown: function(event) {
    var x = event.offsetX;
    var y = event.offsetY;
    this.mouseDownAtX = event.clientX;
    this.mouseDownAtY = event.clientY;
    this.currentOffsetX = this.previewOffsetX;
    this.currentOffsetY = this.previewOffsetY;

    UI.setCursor('drag');
    this.mouseIsDown = true;
    UI.captureMouse(this, {"cursor": 'url(cursors/closedhand.png) 2 14, pointer'});
  },

  mouseMove: function(e) {

    if(this.mouseIsDown) {
      var x = e.clientX;
      var y = e.clientY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;      

      this.previewOffsetX = this.currentOffsetX + diffX / (this.previewScale );
      this.previewOffsetY = this.currentOffsetY + diffY / (this.previewScale);

      this.drawFrame({ redrawLayers: false, applyEffects: false});
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  },



  effectListUpdated: function() {
    if(this.shaderEffects && this.imageEffectsControl) {
      this.shaderEffects.setEffects(this.imageEffectsControl.getEffectsList());
      this.shaderEffects.setEffectParams(this.imageEffectsControl.getEffectsList());
    }
  },

  effectParamUpdated: function() {
    this.shaderEffects.setEffectParams(this.imageEffectsControl.getEffectsList());
  },

  exportGif: function() {
    var filename = $('#exportGIFAs').val();

    var includeBorder = $('#exportGIFIncludeBorder').is(':checked') ;

    if(this.fromFrame > this.toFrame) {
      alert("From must be greater than to");
      return;
    }

    var scale = this.scale;

  
    var layers = $("input[type='radio'][name='exportGIFLayer']:checked").val();
//console.log('include border = ' + includeBorder);

    $('#exportGifProgressText').html('');
    UI.showDialog("exportGifProgressDialog");

    if(this.exportGIFFormat == 'gif') {
      this.exportAs(filename, includeBorder, scale, this.speed, layers, this.fromFrame, this.toFrame);
    }

    if(this.exportGIFFormat == 'video') {
      this.exportVideo();
    }
  },

  setScale: function(scale) {
    var oldScale = this.scale;
    this.scale = scale;

    this.previewOffsetY = Math.floor(this.previewOffsetY * this.scale / oldScale);    
    this.previewOffsetX = Math.floor(this.previewOffsetX * this.scale / oldScale);    

  },

  calculateGifInfo: function() {

    this.drawFrame();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var includeBorder = $('#exportGIFIncludeBorder').is(':checked') ;
   
    if(includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8 + 4;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    }


    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale ;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;


    var ticks = 0;
    for(var i = this.fromFrame - 1; i < this.toFrame; i++) {
      ticks += this.editor.graphic.getFrameDuration(i);
    }

    if(this.playMode == 'pingpong') {
      ticks *= 2;
    }

    var characterTicks = tileSet.getAnimatedCharacterTicks();

    // make sure enough ticks to cycle through animation
    for(var i = 0; i < characterTicks.length; i++) {
      if(ticks < characterTicks[i]) {
        ticks = characterTicks[i];
      }
    }


    this.totalTicks = ticks;
    var length = (ticks * this.msPerTick) / 1000;
    length = length.toFixed(2);
    var html = 'Dimensions: ' + width + 'x' + height + ' pixels, Length ' + length + ' seconds';

    $('#exportGIFInfo').html(html);
  },


  initCanvas: function(includeBorder) {

    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale ;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;


    if(!this.canvas) {
      this.canvas = document.createElement("canvas");      
//      document.body.appendChild(this.canvas);
//      this.canvas.setAttribute('style', 'position: absolute; z-index: 1000; top: 0; left: 0');
    }

    if(this.canvas.width != width || this.canvas.height != height) {      
      this.canvas.width = width;
      this.canvas.height = height;

      this.context = UI.getContextNoSmoothing(this.canvas);

      if(this.imageEffectsControl && this.imageEffectsControl.getEffectsCount() > 0) {
        this.effectInputSet = true;
        this.shaderEffects.setInput(this.canvas, this.canvas);
        this.effectListUpdated();
      }
    }

    if(this.imageEffectsControl && this.imageEffectsControl.getEffectsCount() > 0 && !this.effectInputSet) {
      this.effectInputSet = true;
      this.shaderEffects.setInput(this.canvas, this.canvas);
      this.effectListUpdated();
    }

  },

  exportVideo: function() {
    var _this = this;

//    console.log('export video start!');
    var time = getTimestamp();
    this.currentFrame = this.startFrame;
    this.lastFrameTime = time;
    this.tick = 0;
    this.frameTick = 0;
    this.framesTickCount = 0;

    this.lastTickTime = time;
    this.shaderTime = 0;

    this.drawFrame();

    var options = {
      mimeType: 'video/webm; codecs=vp8'

    };

    this.recordedChunks = [];
    this.stream = this.canvas.captureStream();
    this.recorder = new MediaRecorder(this.stream, options);
    this.recorder.addEventListener('dataavailable', function(event) {
      _this.recordedChunks.push(event.data);

      if(_this.recordingVideo == false) {
        // recording has finished, so download
        _this.downloadVideoChunks();
      }
    });
    this.recorder.start(); 

    this.recordingVideo = true;
  },

  exportVideoFinished: function() {
    this.recorder.stop();
    this.recordingVideo = false;

    UI.closeDialog();
    UI.closeDialog();

//    var url = URL.createObjectURL(blob);
//    var 
  },

  downloadVideoChunks: function() {
    var blob = new Blob(this.recordedChunks, {
      type: 'video/webm'
    });

    var filename = 'video.webm';
    download(blob, filename, "video/webm");    

  },


  exportAs: function(filename, includeBorder, scale, speed, whichLayers, fromFrame, toFrame) {
//This actually due to the MP4 conversion: total frames duration must be a multiple of 12/15 fps. this work on my pixels gif  =)

// 15fps = 0.0666 secs / frame
// 15fps = 66.66 msecs/frame
// 12 fps = 83.3333 ms/frame

    this.exportInProgress = true;

    this.playMode = $('#exportGIFLoopType').val();

    // get the number of milliseconds per tick
    var msPerTick = 50;
    if(speed == 'custom') {
      msPerTick = parseInt($('#exportGIFMSPerTick').val(), 10);
    }  else {
      msPerTick = FRAMERATE / speed      
    }   


    if(typeof includeBorder == 'undefined') {
      includeBorder = false;
    }

   
    if(includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8 + 4;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    }


    this.scale = scale;
    this.initCanvas(includeBorder);
      
    // all of the ticks of each element, eg animated characters, frames
    var elementTicks = [];

    var tileSet =  this.editor.tileSetManager.getCurrentTileSet();

    var characterTicks = tileSet.getAnimatedCharacterTicks();

    var twitterExport = $('#exportGIFShorten').is(':checked');

    var gif = new GIF({
      workers: 4,
      workerScript: 'lib/gif/gif.worker.js',
      quality: 10,
      width: this.canvas.width,
      height: this.canvas.height,
      background: '#000000',
      repeat: 0
    });

    var maxFrameRate = 30;

    var hasTimeBasedEffects = this.shaderEffects.hasTimeEffects();

    
    if(true) {//characterTicks.length > 0) {
      // has animated characters...
      var ticks = 0;
      for(var i = fromFrame - 1; i < toFrame; i++) {
        ticks += this.editor.graphic.getFrameDuration(i);
      }

      if(this.playMode == 'pingpong' && toFrame != fromFrame) {
        ticks *= 2;
      }

      console.log('total ticks = ' + ticks);
      elementTicks.push(ticks);

      // make sure enough ticks to cycle through character animation
      for(var i = 0; i < characterTicks.length; i++) {
        elementTicks.push(characterTicks[i]);
        if(ticks < characterTicks[i]) {
          ticks = characterTicks[i];
        }
      }


      function gcd(a, b) {
          return !b ? a : gcd(b, a % b);
      }

      function lcm(a, b) {
          return (a * b) / gcd(a, b);   
      }

      var multiple = elementTicks[0];
      elementTicks.forEach(function(n) {
          multiple = lcm(multiple, n);
      });

      ticks = multiple;

      console.log('with anim chars ticks = ' + ticks);

      var tick = 0;
      var frame = fromFrame - 1;
      var thisFrameTicks = 0;
      var lastFrameTick = 0;


      // find out how often to update effect time

      var maxFrameRate = 9;
      var ticksPerSecond = 1000 / msPerTick;
      var updateEffectsEvery = 1;

      if(ticksPerSecond > maxFrameRate) {
        updateEffectsEvery = Math.ceil(ticksPerSecond / maxFrameRate);
      }

      this.shaderTime = 0;

      var effectsUpdated = false;


      // need to make sure number of ticks is greater than character animation frames
      tileSet.update(tick);

      this.currentFrame = frame;
      this.drawFrame();
      this.drawFrame();


      var frameDirection = 1
      for(var tick = 1; tick < ticks; tick++) {
        thisFrameTicks++;
        this.shaderTime = tick / ticks;


        var effectsUpdated = false;
        if(hasTimeBasedEffects) {
          console.log("HAS TIME BASED EFFECTS!!!!");
          if(tick % updateEffectsEvery == 0) {
            effectsUpdated = true;
          } 
        }

        var charsUpdated = tileSet.update(tick);
        var nextFrame = this.editor.graphic.getFrameDuration(frame) <= thisFrameTicks;

        if(nextFrame) {
          frame += frameDirection;
          thisFrameTicks = 0;

          if(frame == toFrame) {
            if(this.playMode == 'pingpong' && toFrame != fromFrame) {
              frame--;
              frameDirection = -frameDirection;
            } else {
              frame = fromFrame -1;
            }
          }
        }
        if(charsUpdated || nextFrame || effectsUpdated) {
          // need to add gif frame
          var duration = (tick - lastFrameTick) * msPerTick;

          if(twitterExport) {
            gif.addFrame(this.context, {copy: true, delay: duration / 2 });
            gif.addFrame(this.context, {copy: true, delay: duration / 2 });

          } else {
            gif.addFrame(this.context, {copy: true, delay: duration });
          }
          // now draw next frame
          lastFrameTick = tick;

          this.currentFrame = frame;

          this.drawFrame();
          this.drawFrame();

        }

      }

      // need to draw last frame
      var duration = (tick - lastFrameTick) * msPerTick;
      this.drawFrame();
//      console.log('add last frame, duration: ' + duration);
      if(twitterExport) {
        gif.addFrame(this.context, {copy: true, delay: duration / 2 });
      } else {
        gif.addFrame(this.context, {copy: true, delay: duration });
      }


    } else {


      for(var i = fromFrame - 1; i < toFrame; i++) {
//        this.drawFrame(i, whichLayers);

        this.currentFrame = i;
        var frameDuration = this.editor.graphic.getFrameDuration(this.currentFrame);
        this.drawFrame();

        if(twitterExport) {
          if(this.playMode != 'pingpong' && i == toFrame - 1) {
            gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2});
          } else {
            gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2});
            gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2});
          }
        } else {
          gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick});
        }
      }


      if(this.playMode == 'pingpong') {
        for(var i = toFrame - 2; i > fromFrame - 1; i--) {
//          this.drawFrame(i, whichLayers);
          this.currentFrame = i;
          var frameDuration = this.editor.graphic.getFrameDuration(this.currentFrame);  
          this.drawFrame();

          if(twitterExport) {
            if(i == fromFrame) {
              gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2});
            } else {
              gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2 });
              gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick / 2});
            }
          } else {
            gif.addFrame(this.context, {copy: true, delay: frameDuration * msPerTick});
          }
        }

      }
    }


    var _this = this;
    gif.on('finished', function(blob) {
      if(filename.indexOf('.gif') == -1) {
        filename += ".gif";
      }    

      download(blob, filename, "application/gif");    
      _this.exportGifFinished();

    });

    gif.on('progress', function(p) {
      var progress = p * 100;
      var html = progress.toFixed(2) + '%';

      $('#exportGifProgressText').html(html);
    });

    gif.render();

  },

  exportGifFinished: function() {
    this.exportInProgress = false;
    // close both dialogs
    UI.closeDialog();
    UI.closeDialog();

  },



  // need to integrate this with Frames.update
  updateFrame: function() {

    
    this.startFrame = this.fromFrame - 1;
    this.endFrame = this.toFrame;//this.editor.frames.frameCount;

    var time = getTimestamp();

//    if(time - this.lastTickTime >= this.msPerTick) {
    while(time - this.lastTickTime >= this.msPerTick) {
      this.tick++;
      this.frameTick++;
      this.lastTickTime = this.lastTickTime + this.msPerTick;

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      tileSet.update(this.tick);

      // call the scripting tick function
      if(TextMode.tick) {
        TextMode.tick(this.tick);
      }


      // update shader time...
      var tickCount = this.tick % this.totalTicks;

      this.shaderTime = tickCount / this.totalTicks;

/*
      this.shaderTime += 0.01;
      while(this.shaderTime >= 1) {
        this.shaderTime -= 1;
      }
*/

      // TODO: animate color palette
    }


    if(this.recordingVideo) {
      var progress = 100 * (tickCount / this.totalTicks);
      var html = progress.toFixed(2) + '%';

      $('#exportGifProgressText').html(html);

    }

    if(this.playFrames) {
      if(this.currentFrame < 0 || this.currentFrame >= this.editor.graphic.getFrameCount() ) {
        this.currentFrame = 0;
      }
      var frameDuration = this.editor.graphic.getFrameDuration(this.currentFrame);      
 //     if(time - this.lastFrameTime > this.editor.frames.frames[this.currentFrame].duration * this.msPerTick) {
      if(this.frameTick >= frameDuration) {
        this.frameTick = 0;

        this.framesTickCount += frameDuration;

        var frame = this.currentFrame;

        frame += this.playDirection;

        if(this.playMode == "pingpong") {
          if(frame === this.startFrame) {
            this.playDirection = 1;
          }
          if(frame === this.endFrame - 1) {
            this.playDirection = -1;
          }

          if(frame >= this.endFrame) {
            frame = this.startFrame;
          } else if(frame < this.startFrame) {
            frame = this.startFrame;
          }
        } else if(this.playMode == "once") {
          if(frame >= this.endFrame) {
            frame = this.startFrame;

            if(this.recordingVideo) {

              console.log('recording finished: ' + this.tick);
              this.exportVideoFinished();
            }
//            this.editor.animationTools.stop();
            //return;
          }          
        } else {
          if(frame >= this.endFrame) {

            if(this.recordingVideo) {
              console.log('recording finished: ' + this.tick);

              this.exportVideoFinished();
            }

            frame = this.startFrame;
          }
        }
        this.currentFrame = frame;
        //this.setCurrentFrame(frame);
        this.lastFrameTime = time;
      }
    }

  },


  // return true will mean frames.update isn't called
  update: function() {
    if(!this.exportGifActive) {
      return false;
    }

    if(this.exportInProgress) {
      return true;
    }

    this.updateFrame();
    this.drawFrame();
    return true;
  }
}
