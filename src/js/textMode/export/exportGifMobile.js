var ExportGifMobile = function() {
  this.editor = null;

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = null;

  this.canvas = null;
  this.context = null;

  this.screenCanvas = null;
  this.screenContext = null;


  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8;
  this.scale = 1;

  this.playMode = 'loop';
  this.playDirection = 1;

  this.imageEffectsControl = null;
  this.tick = 0;
  this.frameTick = 0;

  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;

  this.mouseIsDown = false;

  this.exportLayer = 'all';

  this.touchCount = 0;

  this.currentFrame = 0;
  this.lastTickTime = 0;
  this.msPerTick = 50;


  this.visible = false;
}


ExportGifMobile.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  htmlComponentLoaded: function() {

    this.initContent();
    this.initEvents();
    this.resizePreview();

  },

  show: function() {
    var _this = this;

    this.mouseIsDown = false;

    var width = 500;
    var height = 100;


    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    width = screenWidth - 30;
    height = screenHeight - 30;

    this.fromFrame = 1;
    this.toFrame = this.editor.graphic.getFrameCount();
    this.currentFrame = this.fromFrame - 1;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.MobilePanel", { "id": "exportGifMobileDialog", "title": "Export GIF", "width": width, "height": height });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });


      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);

//      this.splitPanel.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportGifMobile.html', function() {
        _this.htmlComponentLoaded();      
      });


      this.htmlComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": "Export" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportGif();
//        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
      });

/*
      this.closeButton = UI.create('UI.Button', { "text": "Cancel" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
*/

/*
      this.htmlComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
        event.preventDefault();
      });

      this.htmlComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
        event.preventDefault();
      });

      this.uiComponent.on('mousedown', function(event) {
        _this.mouseDown(event);
      });

      this.uiComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
      });
      this.uiComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
      });
*/

    } else {
      this.initContent();
    }

    UI.showDialog("exportGifMobileDialog");
    this.visible = true;
  },  



  resizePreview: function() {
    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportGifMobilePreview');
    }

    this.previewCanvasScale = Math.floor(UI.devicePixelRatio);

    this.width = 320;
    this.height = 200;

    this.previewCanvas.style.width = this.width + 'px';
    this.previewCanvas.style.height = this.height + 'px';

    this.previewCanvas.width = this.width * this.previewCanvasScale;
    this.previewCanvas.height = this.height * this.previewCanvasScale;

    this.previewContext = this.previewCanvas.getContext('2d');
    this.previewContext.imageSmoothingEnabled = false;
    this.previewContext.webkitImageSmoothingEnabled = false;
    this.previewContext.mozImageSmoothingEnabled = false;
    this.previewContext.msImageSmoothingEnabled = false;
    this.previewContext.oImageSmoothingEnabled = false;

    this.drawPreview({ redrawLayers: false, applyEffects: false});
  },


  initContent: function() {
    var _this = this;

    $('#exportGIFMobileAs').val(g_app.fileManager.filename);

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportGIFMobilePreview');
      this.previewContext = this.previewCanvas.getContext('2d');
      this.previewContext.imageSmoothingEnabled = false;
      this.previewContext.webkitImageSmoothingEnabled = false;
      this.previewContext.mozImageSmoothingEnabled = false;
      this.previewContext.msImageSmoothingEnabled = false;
      this.previewContext.oImageSmoothingEnabled = false;

    }

    if(this.imageEffectsControl == null) {
      this.imageEffectsControl = new ImageEffectsControl();
      this.imageEffectsControl.init({ "htmlElementId": 'exportImageMobileEffects'});
      this.imageEffectsControl.on('update', function() {
        _this.drawPreview({ redrawLayers: false });
      });

      this.imageEffectsControl.on('updateParam', function() {
        _this.drawPreview({ redrawLayers: false });
      });
    }



    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth = this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;


    this.drawPreview();
    $('#exportGIFMobileProgress').hide();

  },

  initEvents: function() {
    var _this = this;


    this.previewCanvas.addEventListener("touchstart", function(event){
      _this.touchStart(event);

    }, false);

    this.previewCanvas.addEventListener("touchmove", function(event){
      _this.touchMove(event);
      return false;
    }, false);

    this.previewCanvas.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);



    $('#exportGIFMobileIncludeBorder').on('click', function() {
      _this.drawPreview();
    });

    $('#exportGIFMobileScale').on('change', function() {
      var scale = parseInt($(this).val(), 10);
      if(isNaN(scale)) {
        return;
      }
      _this.setScale(scale);
      _this.drawPreview();

    });

/*
    $("input[type='radio'][name='exportGIFMobileScale']").on('click', function() {
      var scale = $("input[type='radio'][name='exportGIFMobileScale']:checked").val();
      _this.setScale(scale);
      _this.drawPreview();
    });
*/
    $('input[name=exportGIFMobileLayer]').on('click', function() {
      _this.exportLayer = $('input[name=exportGIFMobileLayer]:checked').val();
      _this.drawPreview();

    });



    $('#exportGIFMobilePreview').on('mousedown', function(e) {
      _this.previewMouseDown(e);

    });


    $('#GIFExportMobilePreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#GIFExportMobilePreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#GIFExportMobilePreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });


    $('#exportGIFMobileSaveGDrive').on('click', function() {
      _this.saveToGDrive();
    });

  },



  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawPreview({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#GIFExportMobilePreviewScale').val(displayScale);
    $('#GIFExportMobilePreviewScaleText').val(displayScale);
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


  touchStart: function(event) {
    event.preventDefault();

    var touches = event.touches;
    var elementOffset = $('#' + this.previewCanvas.id).offset();
    var elementLeft = elementOffset.left;
    var elementTop = elementOffset.top;
 
    if(touches.length == 1) {
 
      this.touchCount = 1;
      var x = touches[0].pageX - $(this.previewCanvas).offset().left;
      var y = touches[0].pageY - $(this.previewCanvas).offset().top;

      this.mouseDownAtX = x;
      this.mouseDownAtY = y;
      this.currentOffsetX = this.previewOffsetX;
      this.currentOffsetY = this.previewOffsetY;

      this.mouseIsDown = true;

    }

    if(touches.length == 2) {
      // start a pinch or span?
     
      this.touchCount = 2; 
      this.touchStart0X = touches[0].pageX - elementLeft;
      this.touchStart0Y = touches[0].pageY - elementTop;

      this.touchStart1X = touches[1].pageX - elementLeft;
      this.touchStart1Y = touches[1].pageY - elementTop;


      this.touchStartDistance =   (this.touchStart0X - this.touchStart1X) * (this.touchStart0X - this.touchStart1X)
                                + (this.touchStart0Y - this.touchStart1Y) * (this.touchStart0Y - this.touchStart1Y);
      this.touchStartDistance = Math.sqrt(this.touchStartDistance);

      this.touchStartMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchStartMidY = (this.touchStart0Y + this.touchStart1Y) / 2;
      this.touchMoveMidX = (this.touchStart0X + this.touchStart1X) / 2;
      this.touchMoveMidY = (this.touchStart0Y + this.touchStart1Y) / 2;

      this.pinchStartScale = this.previewScale;

    }


  },

  touchMove: function(event) {
    event.preventDefault();

    var touches = event.touches;
    var elementOffset = $('#' + this.previewCanvas.id).offset();
    var elementLeft = elementOffset.left;
    var elementTop = elementOffset.top;

    if(touches.length == 1 && this.touchCount == 1) {
 
      var x = touches[0].pageX - $(this.previewCanvas).offset().left;
      var y = touches[0].pageY - $(this.previewCanvas).offset().top;


      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;      

      this.previewOffsetX = this.currentOffsetX + diffX / this.previewScale;
      this.previewOffsetY = this.currentOffsetY + diffY / this.previewScale;

      this.drawPreview({ redrawLayers: false, applyEffects: false});

    }

    if(touches.length == 2) {
      this.touchMove0X = touches[0].pageX - elementLeft;
      this.touchMove0Y = touches[0].pageY - elementTop;

      this.touchMove1X = touches[1].pageX - elementLeft;
      this.touchMove1Y = touches[1].pageY - elementTop;

      this.touchMoveDistance =   (this.touchMove0X - this.touchMove1X) * (this.touchMove0X - this.touchMove1X)
                                + (this.touchMove0Y - this.touchMove1Y) * (this.touchMove0Y - this.touchMove1Y);
      this.touchMoveDistance = Math.sqrt(this.touchMoveDistance);

      var oldMidX = this.touchMoveMidX;
      var oldMidY = this.touchMoveMidY;
      var newMidX = (this.touchMove0X + this.touchMove1X) / 2;
      var newMidY = (this.touchMove0Y + this.touchMove1Y) / 2;

      this.touchMoveMidX = newMidX;
      this.touchMoveMidY = newMidY;

      var oldScale = this.previewScale;
      var newScale = (this.touchMoveDistance / this.touchStartDistance) * this.pinchStartScale;
      this.setPreviewScale(newScale);

/*
      var dx = newMidX / newScale - oldMidX / oldScale;
      var dy = newMidY / newScale - oldMidY / oldScale;
*/

      var dx = (newMidX - oldMidX) / newScale;
      var dy = (newMidY - oldMidY) / newScale;

      this.previewOffsetX += dx;
      this.previewOffsetY += dy;

    }
 
  },

  touchEnd: function(event) {

  },


/*
  previewMouseDown: function(event) {
    var x = event.offsetX;
    var y = event.offsetY;


    this.mouseDownAtX = event.clientX;
    this.mouseDownAtY = event.clientY;
    this.currentOffsetX = this.previewOffsetX;
    this.currentOffsetY = this.previewOffsetY;

    this.mouseIsDown = true;

    UI.setCursor('drag');
    UI.captureMouse(this);


  },


  mouseDown: function(e) {

  },

  mouseMove: function(e) {
    if(this.mouseIsDown) {

      var x = e.clientX;
      var y = e.clientY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;      

      this.previewOffsetX = this.currentOffsetX + diffX / this.previewScale;
      this.previewOffsetY = this.currentOffsetY + diffY / this.previewScale;

      this.drawPreview({ redrawLayers: false, applyEffects: false});
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  },

*/

  drawPreview: function(args) {

    if(this.previewCanvas == null) {
      return;
    }
    // need to redraw characters?
    var redrawLayers = true;
    if(typeof args != 'undefined' && typeof args.redrawLayers != 'undefined') {
      redrawLayers = args.redrawLayers;
    }

    var applyEffects = true;
    if(typeof args != 'undefined' && typeof args.applyEffects != 'undefined') {
      applyEffects = args.applyEffects;
    }

    if(redrawLayers) {
      this.drawFrame();//frame, this.exportLayer);
    }

    if(false && applyEffects) {
//      this.context.drawImage(this.layersCanvas, 0, 0);

      this.applyEffects();
    } else {
      this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);
    }

//    this.previewScale = 1;//0.5;

    if(this.canvas == null) {
      return;
    }

    this.previewContext.fillStyle = '#000000';
    this.previewContext.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 

    this.previewContext.save();

    this.previewContext.translate( Math.floor(this.previewCanvas.width / 2), Math.floor(this.previewCanvas.height / 2)); 
    this.previewContext.scale(this.previewScale * this.previewCanvasScale, this.previewScale * this.previewCanvasScale);

    this.previewContext.drawImage(this.canvas, Math.floor(this.previewOffsetX), Math.floor(this.previewOffsetY));//, this.canvas.width * this.previewScale, this.canvas.height * this.previewScale);    

    this.previewContext.restore();

  },

  applyEffects: function() {

    var data = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);

    this.imageEffectsControl.applyEffects(data);

    this.context.putImageData(data,0,0);

  },

  readParameters: function() {

    this.includeBorder = $('#exportGIFMobileIncludeBorder').is(':checked') ;

  },

  setScale: function(scale) {
    var oldScale = this.scale;

    this.scale = scale;

    this.previewOffsetY = Math.floor(this.previewOffsetY * this.scale / oldScale);    
    this.previewOffsetX = Math.floor(this.previewOffsetX * this.scale / oldScale);    
  },

  initCanvas: function() {
    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale ;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;

    if(!this.canvas) {

      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
    }

    if(this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;//img.naturalWidth;
      this.canvas.height = height;//img.naturalHeight;

      this.context = this.canvas.getContext("2d");
    }

  },
  
  drawFrame: function() {//frame, whichLayers) {

    this.readParameters();

    var layers = this.exportLayer;
    if(layers == 'current') {
      layers = this.editor.layers.getSelectedLayerId();
    } 


    if(this.includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 

    this.initCanvas();

    this.editor.exportFrameImage.exportFrame({
      scale: this.scale,
      includeBorder: this.borderWidth != 0,
//      addTransparentPixel: this.addTransparentPixel,
      layers: this.exportLayer,
      frame: this.currentFrame
    });

    this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);
  },

  exportGifFinished: function() {

  },

  saveToGDrive: function() {
//g_app.gdrive.doUpload(blob, filename);
    console.log('save to gdrive');
    var _this = this;
    g_app.gdrive.handleAuthClick(function() {
      _this.exportGif({ saveToGDrive: true });
    });
  },

  exportGif: function(args) {
    var saveToGDrive = false;
    if(typeof args !== 'undefined') {
      if(typeof args.saveToGDrive != 'undefined') {
        saveToGDrive = args.saveToGDrive;
      }

    }
    var filename = $('#exportGIFMobileAs').val();

    this.drawPreview();

    if(filename.indexOf('.gif') == -1) {
      filename += ".gif";
    }

    var duration = 100;

    var gif = new GIF({
      workers: 4,
      workerScript: 'lib/gif/gif.worker.js',
      quality: 10,
      width: this.canvas.width,
      height: this.canvas.height,
      background: '#000000',
      repeat: 0
    });
  
    var speed = 1;
    var msPerTick = FRAMERATE / speed;

    this.playMode = 'loop';
    var fromFrame = 1;
    var toFrame = this.editor.graphic.getFrameCount();


    // all of the ticks of each element, eg animated characters, frames
    var elementTicks = [];

    var tileSet =  this.editor.tileSetManager.getCurrentTileSet();

    var characterTicks = tileSet.getAnimatedCharacterTicks();

    var twitterExport = false;//$('#exportGIFShorten').is(':checked');


    var maxFrameRate = 30;

    var hasTimeBasedEffects = false;//this.shaderEffects.hasTimeEffects();


    if(true) {//characterTicks.length > 0) {
      // has animated characters...
      var ticks = 0;
      for(var i = fromFrame - 1; i < toFrame; i++) {
        var frameDuration = this.editor.graphic.getFrameDuration(i);
        ticks += frameDuration;
      }

      if(this.playMode == 'pingpong' && toFrame != fromFrame) {
        ticks *= 2;
      }

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

      var tick = 0;
      var frame = fromFrame-1;
      var thisFrameTicks = 0;
      var lastFrameTick = 0;


      // find out how often to updated effect time
      //msPerTick

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
      console.log('frame = ' + this.currentFrame);
      this.drawFrame();
      this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);


      var frameDirection = 1
      for(var tick = 1; tick < ticks; tick++) {
        thisFrameTicks++;

//        this.shaderTime = (tick - 1) / ticks;
        this.shaderTime = tick / ticks;


        var effectsUpdated = false;
        if(hasTimeBasedEffects) {
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
          console.log('frame = ' + this.currentFrame);
          this.drawFrame();
          this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);

        }

      }

      // need to draw last frame
      var duration = (tick - lastFrameTick) * msPerTick;

      if(twitterExport) {
        gif.addFrame(this.context, {copy: true, delay: duration / 2 });
      } else {
        gif.addFrame(this.context, {copy: true, delay: duration });
      }


    } else {


      for(var i = fromFrame - 1; i < toFrame; i++) {
//        this.drawFrame(i, whichLayers);
        var frameDuration = this.editor.graphic.getFrameDuration(i);

        this.currentFrame = i;
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
          var frameDuration = this.editor.graphic.getFrameDuration(i);          
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


    //gif.addFrame(this.context, {copy: true, delay: duration });
    if(true || UI.isMobile.iOS()) {
      $('#exportGIFMobileProgress').html('Generating GIF...');
      $('#exportGIFMobileProgress').show();
    }

    var _this = this;
    gif.on('finished', function(blob) {
      if(filename.indexOf('.gif') == -1) {
        filename += ".gif";
      }    

      if(saveToGDrive) {
        var paddingTop = UI.getScreenHeight() * 2 / 5;
        html = '<div style="text-align: center; color: #aaaaaa; font-size: 24px; padding-top: ' + paddingTop + 'px">Uploading...</div>';
        $('#exportGIFMobileProgress').html(html);            

        g_app.gdrive.uploadToAppFolder(blob, filename, {
          success: function(data) {
            UI.closeDialog();
          },
          progress: function(event) {
            console.log(event);

            var percent = 0;
            var position = event.loaded || event.position;
            var total = event.total;
            if (event.lengthComputable) {
              percent = Math.ceil(position / total * 100);
            }

            var html = 'Uploading: ' + percent.toFixed(2) + '%';
            var paddingTop = UI.getScreenHeight() * 2 / 5;
            html = '<div style="text-align: center; color: #aaaaaa; font-size: 24px; padding-top: ' + paddingTop + 'px">' + html + '</div>';
            $('#exportGIFMobileProgress').html(html);            
          },
          error: function(error) {
            console.log("ERROR!!!!");
            console.log(error);

            var paddingTop = UI.getScreenHeight() * 2 / 15;
            var message = 'Error!!!';
            message += '<p>';
            message += error.responseText;
            message += '</p>';
            html = '<div style="text-align: center; color: #aaaaaa; font-size: 24px; padding-top: ' + paddingTop + 'px">' + message + '</div>';
            $('#exportGIFMobileProgress').html(html);                        
          }
        });
      } else { //if(true) {//UI.isMobile.iOS()) {

        // ios specific stuff now handled in util/mobileDownload.js

       // window.open(dataURL);
        var a = new FileReader();
        a.onload = function(e) {
          var dataURL = e.target.result;
          mobileDownload({ data: dataURL, filename: filename, mimeType: "image/gif" });
          UI.closeDialog();    


        /*

//          var html = '<div style="position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px; background-color: white; z-index: 3000">';
          var html = '';

          html += '<div style="text-align: center">';

          html += '<div style="margin-bottom: 20px">';
          html += '<img src="' + dataURL + '">';
          html += '</div>';


          html += '<div style="margin-bottom: 20px">';
          html += '<div class="ui-button" id="exportMobileGIFDownloadButton">Download</div>';
          html += '</div>';


          html += '<div>';
          html += '<div class="ui-button" id="exportGIFMobileClose">Close</div>';
          html += '</div>';

          html += '</div>';

          html += '</div>';

          $('#exportGIFMobileProgress').html(html);
//          html += '<div>Hold finger to save</div>';

          $('#exportGIFMobileClose').on('click', function() {
            UI.closeDialog();
          });

          $('#exportMobileGIFDownloadButton').on('click', function() {
            window.open(dataURL);
          });


          html += '</div>';
          */
//          $('body').append(html);
        }
        a.readAsDataURL(blob);       
      }
      
      /*
      else {

        download(blob, filename, "application/gif");    
        UI.closeDialog();        
      }
      */

      _this.exportGifFinished();
    });

    gif.on('progress', function(p) {
      var progress = p * 100;
      var html = 'Generating: ' + progress.toFixed(2) + '%';
      var paddingTop = UI.getScreenHeight() * 2 / 5;
      html = '<div style="text-align: center; color: #aaaaaa; font-size: 24px; padding-top: ' + paddingTop + 'px">' + html + '</div>';
      $('#exportGIFMobileProgress').html(html);

//      $('#exportGifProgressText').html(html);
    });

    gif.render();


  },



  // need to integrate this with Frames.update
  updateFrame: function() {

    this.startFrame = this.fromFrame - 1;
    this.endFrame = this.toFrame;//this.editor.frames.frameCount;

    var time = getTimestamp();

    var speed = 1;
    this.msPerTick = FRAMERATE / speed;


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


/*
      // update shader time...
      var tickCount = this.tick % this.totalTicks;

      this.shaderTime = tickCount / this.totalTicks;
*/

      // TODO: animate color palette
    }


    if(true) {//  this.playFrames) {

      if(this.currentFrame < 0 || this.currentFrame >= this.editor.graphic.getFrameCount()) {
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

            frame = this.startFrame;
          }
        }

        this.currentFrame = frame;
        //this.setCurrentFrame(frame);
        this.lastFrameTime = time;
      }
    }

  },


  update: function() {
    if(!this.visible) {
      return false;
    }

    this.updateFrame();
    this.drawPreview();
    return true;
  }


}