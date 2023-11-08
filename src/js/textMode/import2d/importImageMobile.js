var ImportImageMobile = function() {
  this.uiComponent = null;
  this.importer = null;
  this.editor = null;

  this.importWidth = 0;
  this.importHeight = 0;

  // the preview canvas
  this.previewScale = null
  this.previewCanvas = null;
  this.previewContext = null;

  this.backgroundCanvas = null;
  this.backgroundContext = null;

  this.useChars = 'all';
  this.useColors = 'all';

  this.touchCount = 0;
  this.doImport = false;
  this.visible = false;


  this.frameCount = 24;
  this.speed = 9;

  this.mirrorH = false;
  this.mirrorV = false;
  this.invertColors = false;

}

ImportImageMobile.prototype = {

  init: function(editor, importer) {
    this.editor = editor;
    this.importer = importer;
  },

  initEvents: function() {
    var _this = this;
    document.getElementById('importImageMobileSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('importImageMobileSourceFile').files[0];
      _this.setImportImage(file);
    });

    $('#importImageMobileChooseFile').on('click', function() {
      $('#importImageMobileSourceFile').click();
    });

    $('#importImageMobileScaleToFit').on('click', function(event) {
      _this.importer.scaleImageToFit();
      _this.setScale(_this.importer.importImageScale);
//      _this.parameterChanged();
    });

    $('#importImageColorReductionMobile').on('change', function(event) {
      var method = $(this).val();
      _this.setColorReductionMethod(method);
      _this.parameterChanged();

    });

    $('#importImageDitherMobile').on('change', function(event) {
      var ditherMethod = $(this).val();
      _this.setDitherMethod(ditherMethod);
      _this.parameterChanged();
    });

    $('#togglePerCell').on('click', function(event) {
      _this.importer.limitColorsPerCell = !_this.importer.limitColorsPerCell;
      _this.parameterChanged();
    });


    $('#importImageMobileDirection').on('change', function() {
      _this.importer.videoPlaybackDirection = $(this).val();
      _this.importer.setVideoImportParams();
    });

    $('#importImageMobileStartTime').on('change', function() {
      _this.importer.setVideoImportFrom($(this).val());
    });

    $('#importImageMobileStartTime').on('input', function() {
      _this.importer.setVideoImportFrom($(this).val());
    });

    $('#importImageMobileStartTimeValue').on('change', function() {
      _this.importer.setVideoImportFrom($(this).val());

    });


    $('#importImageMobileEndTime').on('change', function() {
      _this.importer.setVideoImportTo($(this).val());
    });

    $('#importImageMobileEndTime').on('input', function() {
      _this.importer.setVideoImportTo($(this).val());
    });

    $('#importImageMobileEndTimeValue').on('change', function() {
      _this.importer.setVideoImportTo($(this).val());
    });

    $('#importImageMobileEndTimeReset').on('click', function() {
//      _this.importer.setVideoImportTo($(this).val());
        var importTo = 5 * 1000;
        var duration = _this.importer.importVideo.duration;
        if(importTo > duration) {
          importTo = duration;
        }
        _this.importer.setVideoImportTo(importTo);

    });



    $('#importImageMobileStartTime').on('change', function() {
      _this.importer.setVideoImportFrom($(this).val());
    });

    $('#importImageMobileStartTime').on('input', function() {
      _this.importer.setVideoImportFrom($(this).val());
    });

    $('#importImageMobileStartTimeValue').on('change', function() {
      _this.importer.setVideoImportFrom($(this).val());

    });

    $('#importImageMobileStartTimeReset').on('click', function() {
      _this.importer.setVideoImportFrom(0);
    });


    $('#importImageMobileFrames').on('change', function() {
      _this.setFrameCount($(this).val());

    });
    $('#importImageMobileFrames').on('input', function() {
      _this.setFrameCount($(this).val());
    });

    $('#importImageMobileFramesValue').on('change', function() {
      _this.setFrameCount($(this).val());
    });

    $('#importImageMobileFramesReset').on('click', function() {
      _this.setFrameCount(24);
    }); 


    $('#importImageMobileSpeed').on('change', function() {
      _this.setSpeed($(this).val());

    });
    $('#importImageMobileSpeed').on('input', function() {
      _this.setSpeed($(this).val());
    });

    $('#importImageMobileSpeedValue').on('change', function() {
      _this.setSpeed($(this).val());
    });

    $('#importImageMobileSpeedReset').on('click', function() {
      _this.setSpeed(8);
    }); 





    // scale/brightness/contrast/saturation
    $('#importImageMobileScale').on('change', function() {
      _this.setScale($(this).val());
    });

    $('#importImageMobileScale').on('input', function() {
      _this.setScale($(this).val());
    });

    $('#importImageMobileScaleValue').on('change', function() {
      _this.setScale($(this).val());

    });


    $('#importImageMobileRotation').on('change', function() {
      _this.setRotation($(this).val());
    });

    $('#importImageMobileRotation').on('input', function() {
      _this.setRotation($(this).val());
    });

    $('#importImageMobileRotationValue').on('change', function() {
      _this.setRotation($(this).val());
    });


    $('#importImageMobileRotation90').on('click', function() {
      //_this.setRotation(0);
      _this.rotate90();

    });





    // brightness/contrast/saturation
    $('#importImageMobileBrightness').on('change', function() {
      _this.importer.brightness = $(this).val();

      $('#importImageMobileBrightnessValue').val(_this.importer.brightness);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileBrightness').on('input', function() {
      _this.importer.brightness = $(this).val();

      $('#importImageMobileBrightnessValue').val(_this.importer.brightness);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileBrightnessValue').on('change', function() {
      _this.importer.brightness = $(this).val();
      $('#importImageMobileBrightness').val(_this.importer.brightness);
      if(_this.importer.importSource != 'video') {            
        _this.parameterChanged();
      }

    });

    $('#importImageMobileBrightnessReset').on('click', function() {
      _this.setBrightness(0);

    }); 



    $('#importImageMobileContrast').on('change', function() {
      _this.importer.contrast = $(this).val();

      $('#importImageMobileContrastValue').val(_this.importer.contrast);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileContrast').on('input', function() {
      _this.importer.contrast = $(this).val();

      $('#importImageMobileContrastValue').val(_this.importer.contrast);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileContrastValue').on('change', function() {
      _this.importer.contrast = $(this).val();

      $('#importImageMobileContrast').val(_this.importer.contrast);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileContrastReset').on('click', function() {
      _this.setContrast(0);
    });




    $('#importImageMobileSaturation').on('change', function() {
      _this.importer.saturation = $(this).val();

      $('#importImageMobileSaturationValue').val(_this.importer.saturation);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileSaturation').on('input', function() {
      _this.importer.saturation = $(this).val();
      $('#importImageMobileSaturationValue').val(_this.importer.saturation);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });

    $('#importImageMobileSaturationValue').on('change', function() {
      _this.importer.saturation = $(this).val();

      $('#importImageMobileSaturation').val(_this.importer.saturation);
      if(_this.importer.importSource != 'video') {      
        _this.parameterChanged();
      }
    });


    $('#importImageMobileSaturationReset').on('click', function() {
      _this.setSaturation(0);
    });



    $('#importImageMobileChooseChars').on('click', function(event) {
      _this.chooseTiles();
    });

    $('#importImageMobileChooseColors').on('click', function(event) {
      _this.chooseColors();
    });

    $('#importImageMobileUseChars').on('change', function(event) {
      _this.useChars = $(this).val();

      if(_this.useChars == 'all') {
        $('#importImageCharsMobile').css('border-bottom', '1px solid #444444');

        $('#importImageMobileChooseChars').hide();
        $('#importImageMobileChooseCharsContainer').hide();
      } else {
        $('#importImageCharsMobile').css('border-bottom', '0px solid #444444');

        $('#importImageMobileChooseChars').show();
        $('#importImageMobileChooseCharsContainer').show();
        _this.chooseTiles();
      }
    });

    $('#importImageMobileUseColors').on('change', function(event) {
      _this.useColors = $(this).val();
      _this.importer.useColors = _this.useColors;
      _this.parameterChanged();

      if(_this.useColors == 'all') {
        $('#importImageColorsMobile').css('border-bottom', '1px solid #444444');
        $('#importImageMobileChooseColorsContainer').hide();
        $('#importImageMobileChooseColors').hide();
      } else {
        $('#importImageColorsMobile').css('border-bottom', '0px');
        $('#importImageMobileChooseColorsContainer').show();
        $('#importImageMobileChooseColors').show();
        _this.chooseColors();
      }
    });


    $('#importImageMobileBackgroundColorType').on('change', function(event) {
      _this.importer.backgroundColorType = $(this).val();

    });

    $('#importImageMobileMirrorH').on('click', function(event) {
      _this.mirrorH = $(this).is(':checked');
      _this.parameterChanged();
    });


    $('#importImageMobileMirrorV').on('click', function(event) {
      _this.mirrorV = $(this).is(':checked');
      _this.parameterChanged();
    });


    $('#importImageMobileInvertColors').on('click', function(event) {
      //_this.invertColors = $(this).is(':checked');
      _this.importer.invertColors = $(this).is(':checked');
      _this.parameterChanged();
    });

  },

  setBrightness: function(value) {
    this.importer.brightness = value;
    $('#importImageMobileBrightness').val(this.importer.brightness);
    $('#importImageMobileBrightnessValue').val(this.importer.brightness);
    if(this.importer.importSource != 'video') {      
      this.parameterChanged();
    }
  },

  setContrast: function(value) {
    this.importer.contrast = value;

    $('#importImageMobileContrast').val(this.importer.contrast);
    $('#importImageMobileContrastValue').val(this.importer.contrast);
    if(this.importer.importSource != 'video') {      
      this.parameterChanged();
    }

  },

  setSaturation: function(value) {
    this.importer.saturation = value;

    $('#importImageMobileSaturation').val(this.importer.saturation);
    $('#importImageMobileSaturationValue').val(this.importer.saturation);
    if(this.importer.importSource != 'video') {      
      this.parameterChanged();
    }

  },


  setFrameCount: function(frameCount) {
    frameCount = parseInt(frameCount, 10);
    if(isNaN(frameCount)) {
      return;
    }


    $('#importImageMobileFrames').val(frameCount);
    $('#importImageMobileFramesValue').val(frameCount);

    this.frameCount = frameCount;
    this.importer.frameCount = frameCount;
    this.importer.setVideoImportParams();
  },


  setSpeed: function(speed) {
    speed = parseInt(speed, 10);
    if(isNaN(speed)) {
      return;
    }
    $('#importImageMobileSpeed').val(speed);
    $('#importImageMobileSpeedValue').val(speed);

    this.speed = speed;
//    this.importer.frameCount = frameCount;  
    this.importer.ticksPerFrame = 13 - this.speed;
    this.importer.setVideoImportParams();

  },

  setScale: function(scale, update) {
    scale = parseFloat(scale);
    if(isNaN(scale)) {
      return;
    }

    this.importer.importImageScale = scale;
      
    $('#importImageMobileScaleValue').val(this.importer.importImageScale);
    $('#importImageMobileScale').val(this.importer.importImageScale);

    if(typeof update == 'undefined' || update) {
//      if(this.importer.importSource != 'video') {      

        this.parameterChanged();
//      }
    }
  },


  rotate90: function() {

    var rotation = (this.importer.rotateAmount + 90) % 360;
//    $('#' + this.prefix + 'refImageRotation').val(this.rotation);
//    this.showImage();
    this.setRotation(rotation);
  
  },

  setRotation: function(rotation) {
    console.log('set rotation to ' + rotation);

    rotation = parseInt(rotation, 10);
    if(isNaN(rotation)) {
      return;
    }

    $('#importImageMobileRotation').val(rotation);
    $('#importImageMobileRotationValue').val(rotation);

    var dAngle = rotation - this.importer.rotateAmount;
    var imageX = this.importer.imageX  - this.importer.crosshairX;
    var imageY = this.importer.imageY - this.importer.crosshairY;

    this.importer.imageX = Math.cos(dAngle * Math.PI / 180) * imageX - Math.sin(dAngle * Math.PI / 180) * imageY;
    this.importer.imageY = Math.cos(dAngle * Math.PI / 180) * imageY + Math.sin(dAngle * Math.PI / 180) * imageX;

    this.importer.imageX += this.importer.crosshairX;
    this.importer.imageY += this.importer.crosshairY;

    this.importer.rotateAmount = rotation;
    
    this.parameterChanged();
  },

  show: function() {
    var _this = this;
//    this.callback = args.colorPickedCallback;
    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.MobilePanel", { "id": "importImageMobile", "title": "Import Image", "fullScreen": true, "maxWidth": 640, "maxHeight": 800 });

      var htmlPanel = UI.create("UI.HTMLPanel", { "id": "importImageHTML" });
      this.uiComponent.add(htmlPanel);

      htmlPanel.load('html/textMode/importImageMobile.html', function() {
        _this.importer.initRangeControl();
        _this.initEvents();
        _this.initContent();
      });



      this.importButton = UI.create('UI.Button', { "text": "Import" });
      this.importButton.on('click', function(event) {
        _this.doImport = true;
        UI.closeDialog();


      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
        _this.importer.visible = false;
        if(_this.doImport) {
          _this.showProgress();
          setTimeout(function() {
            _this.startImport();
          }, 10);
        }
      });

      this.uiComponent.addButton(this.importButton);
/*
      this.closeButton = UI.create('UI.Button', { "text": "Close" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.addButton(this.closeButton);
*/

    } else {
      this.initContent();
    }

    UI.showDialog("importImageMobile");
    this.visible = true;
    this.importer.visible = true;

  },

  initContent: function() {
    // flag to say whether to do import on dialog close
    this.doImport = false;

    this.initCanvas();

    this.importer.crosshairX = this.importer.importWidth / 2;
    this.importer.crosshairY = this.importer.importHeight / 2;

    this.importer.setSmoothingMethod(false);

    this.setColorReductionMethod($('#importImageColorReductionMobile').val());
    this.setDitherMethod($('#importImageDitherMobile').val());
    this.setScale(this.importer.importImageScale);

    this.useChars = $('#importImageMobileUseChars').val();
    this.useColors = $('#importImageMobileUseColors').val();
    this.importer.backgroundColorType = $('#importImageMobileBackgroundColorType').val();
    this.importer.backgroundColorChoose = 'auto';


    if(this.importer.importSource == 'video' && this.importer.importVideo) {

      this.importer.videoFrameReady = true;
      this.importer.importInProgress = false;
      this.setFrameCount($('#importImageMobileFramesValue').val());
    }

    this.importer.videoPlaybackDirection = $('#importImageMobileDirection').val();    
  },
     
  initCanvas: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    var maxWidth = 320;
    var maxHeight = 200;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var _this = this;

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('importImageMobileCanvas');

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


    }

    this.previewContext = this.previewCanvas.getContext("2d");

    this.importWidth = layer.getGridWidth() * layer.getCellWidth();
    this.importHeight = layer.getGridHeight() * layer.getCellHeight();

    this.previewScale = 1;

    var previewWidth = this.importWidth;
    var previewHeight = this.importHeight;

    // make sure preview fits in the dialog
    if(previewWidth > maxWidth || previewHeight > maxHeight) {
      if(maxWidth/maxHeight > previewWidth / previewHeight) {

        this.previewScale = maxHeight / previewHeight;
        previewWidth = previewWidth * maxHeight / previewHeight;

        previewHeight = maxHeight;
      } else {
        this.previewScale = maxWidth / previewWidth;
        previewHeight = previewHeight * maxWidth / previewWidth;
        previewWidth = maxWidth;
      }
    }

    if(this.previewCanvas.width != previewWidth || this.previewCanvas.height != previewHeight) {
      this.previewCanvas.width = previewWidth;//this.importWidth;
      this.previewCanvas.height = previewHeight;//this.importHeight;
      this.previewContext = this.previewCanvas.getContext('2d');
    }


    if(this.backgroundCanvas == null) {
      this.backgroundCanvas = document.createElement('canvas');
    }

    if(this.backgroundCanvas.width != previewWidth || this.backgroundCanvas.height != previewHeight) {
      this.backgroundCanvas.width = previewWidth;
      this.backgroundCanvas.height = previewHeight;
      this.backgroundContext = this.backgroundCanvas.getContext('2d');
    }

    // draw the background image
    this.backgroundContext.fillStyle = '#cccccc';
    this.backgroundContext.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height); 

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

    this.previewContext.drawImage(this.backgroundCanvas, 0, 0, this.previewCanvas.width, this.previewCanvas.height);    
  },



  drawPreview: function() {
    if(!this.importer.importInProgress) {

      if(!this.previewContext) {
        // not set up yet
        return;
      }

      this.previewContext.drawImage(this.backgroundCanvas, 0, 0, this.previewCanvas.width, this.previewCanvas.height);    

      this.previewContext.drawImage(this.importer.srcCanvas, 0, 0, this.previewCanvas.width, this.previewCanvas.height);

/*
      // draw zoom/rotate crosshairs
      this.importImageContext.beginPath();
      this.importImageContext.moveTo(this.crosshairX * this.previewScale + 0.5, 0);
      this.importImageContext.lineTo(this.crosshairX * this.previewScale + 0.5, this.srcCanvas.height * this.previewScale);
      this.importImageContext.strokeStyle = '#ffff00';
      this.importImageContext.lineWidth = 1;
      this.importImageContext.stroke();

      this.previewContext.beginPath();
      this.previewContext.moveTo(0, this.crosshairY * this.previewScale + 0.5);
      this.previewContext.lineTo(this.importer.srcCanvas.width * this.previewScale, 
        this.crosshairY * this.previewScale + 0.5);
      this.previewContext.strokeStyle = '#ffff00';
      this.previewContext.stroke();
*/

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
 
      var x = touches[0].pageX - elementLeft;
      var y = touches[0].pageY - elementTop;

      this.mouseDownAtX = x;
      this.mouseDownAtY = y;
      this.currentOffsetX = this.importer.imageX;
      this.currentOffsetY = this.importer.imageY;

      this.mouseIsDown = true;

    }

    if(touches.length == 2) {
      this.touchCount = 2;
      // start a pinch or span?
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

      this.pinchStartScale = this.importer.importImageScale;   

    }


    this.setColorReductionMethod('none');
    //  _this.parameterChanged();

  },

  touchMove: function(event) {
    event.preventDefault();

    var touches = event.touches;
    var elementOffset = $('#' + this.previewCanvas.id).offset();
    var elementLeft = elementOffset.left;
    var elementTop = elementOffset.top;

    if(touches.length == 1 && this.touchCount == 1) {
 
      var x = touches[0].pageX - elementLeft;
      var y = touches[0].pageY - elementTop;


      var scale = this.importer.imageScale;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;

      diffX = (diffX * 100 / scale) / this.previewScale;
      diffY = (diffY * 100 / scale) / this.previewScale;


      if(diffX > 2 || diffY > 2) {
        this.movingImage = true;
      }        

      var newOffsetX = this.currentOffsetX + diffX;
      this.importer.imageX = newOffsetX;

      var newOffsetY = this.currentOffsetY + diffY;
      this.importer.imageY = newOffsetY;

      this.parameterChanged();
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

/*
      var midPixelX = (this.importer.imageX + this.touchMoveMidX) * this.importer.importImageScale / 100;
      var midPixelY = (this.importer.imageY + this.touchMoveMidY) * this.importer.importImageScale / 100;


      this.touchMoveMidX = (this.touchMove0X + this.touchMove1X) / 2;
      this.touchMoveMidY = (this.touchMove0Y + this.touchMove1Y) / 2;
*/
      //console.log(this.touchMoveMidX);


// want the pixel identified by the midpoint to be in the same place..

// pixel below the midpoint should be the same

/*
      var positionX = this.importer.imageX;
      var positionY = this.importer.imageY;

      var srcCanvas = this.importer.srcCanvas;
      var previewCanvas = this.previewCanvas;

      var scale = this.importer.importImageScale;
*/
/*
      var zoomX = this.touchMoveMidX / scale - previewCanvas.width / (2 * scale) + srcCanvas.width / 2 
                + positionX - diffX / scale;
      var zoomY = previewCanvas.height / scale - this.touchMoveMidY / scale - 
                previewCanvas.height / (2 * scale) + srcCanvas.height  / 2 + positionY + diffY / scale;
*/

      var newScale = (this.touchMoveDistance / this.touchStartDistance) * this.pinchStartScale;
      this.setScale(newScale, false);
//      scale = newScale;


/*

      var midPixelX = (this.importer.imageX + this.touchMoveMidX) * this.importer.importImageScale / 100;
      var midPixelY = (this.importer.imageY + this.touchMoveMidY) * this.importer.importImageScale / 100;
*/

      // make the mid point the same pixel as before zoom.
/*
      this.importer.imageX = ((midPixelX * 100) / this.importer.importImageScale) - this.touchMoveMidX;
      this.importer.imageY = ((midPixelY * 100) / this.importer.importImageScale) - this.touchMoveMidY;
*/

      var scale = this.importer.imageScale;

      var dx = (newMidX - oldMidX);
      var dy = (newMidY - oldMidY);

      dx = (dx * 100 / scale) / this.previewScale;
      dy = (dy * 100 / scale) / this.previewScale;


      this.importer.imageX += dx;
      this.importer.imageY += dy;


/*

      positionX = zoomX - this.touchMoveMidX / scale + previewCanvas.width / (2 * scale) - srcCanvas.width / 2;
      positionY = zoomY - previewCanvas.height / scale + this.touchMoveMidY / scale + previewCanvas.height / (2 * scale) - srcCanvas.height / 2



      this.importer.imageX = positionX;
      this.importer.imageY = positionY;
*/

      this.parameterChanged();

    }


  },

  touchEnd: function(event) {

    var method = $('#importImageColorReductionMobile').val();
    this.setColorReductionMethod(method);
    this.parameterChanged();


  },

  setDitherMethod: function(ditherMethod) {
    this.importer.ditherMethod = ditherMethod;
  },
  setColorReductionMethod: function(method) {
    this.importer.colorReductionMethod = method;

    if(method == 'dither') {
      $('#importImageDitherGroupMobile').show();
    } else {
      $('#importImageDitherGroupMobile').hide();
    }
  },

  parameterChanged: function() {


    if(this.mirrorH || this.mirrorV) {
      this.importer.importImageAnimate = true;
      this.importer.useEffects = true;
      for(var i = 0; i < this.importer.importEffects.length; i++) {
        if(this.importer.importEffects[i].name == 'Mirror') {
          this.importer.importEffects[i].enabled = true;
          this.importer.importEffects[i].params.mirror.value = [];

          if(this.mirrorH) {
            this.importer.importEffects[i].params.mirror.value.push('Horizontal');
          }

          if(this.mirrorV) {
            this.importer.importEffects[i].params.mirror.value.push('Vertical'); 
          }
        }
      }

      this.importer.updateShaderEffects();
    } else {
      this.importer.importImageAnimate = false;
      this.importer.useEffects = false;      
    }

    this.importer.updateImportImage();
    this.drawPreview();
  },

  setImportVideo: function(file) {
//    this.importer.resetCacheCanvas();
//    this.importer.importSource = 'video';
    $('.importImageMobileVideoSetting').show();
    $('#importImageSourceContainer').css('height', '296px');
    $('#importImageControlsContainer').css('top', '308px');
    $('#importImageControlsContainer').show();
    this.importer.setImportVideo(file);
  },

  setImportImage: function(file) {
    
    if(file.type.indexOf('video/') === 0) {
//    if(file.type == 'video/mp4' || file.type == 'video/webm') {
      this.setImportVideo(file);
      return;
    }

    $('.importImageMobileVideoSetting').hide();
    $('#importImageSourceContainer').css('height', '280px');
    $('#importImageControlsContainer').css('top', '292px');
    $('#importImageControlsContainer').show();

    this.importer.resetCacheCanvas();
    this.importer.importSource = 'image';
    if(!this.importer.importImage) {
      this.importer.importImage = new Image();      
    }
    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    var _this = this;
    this.importer.importImage.onload = function() { 

      _this.importer.scaleImageToFit();
      _this.setScale(_this.importer.importImageScale);
      _this.setBrightness(0);
      _this.setSaturation(0);
      _this.setContrast(0);
    }
    this.importer.importImage.src = src;

  },

  showProgress: function() {

  },
  
  startImport: function() {
    this.importer.useChars = this.useChars;
    this.importer.useColors = this.useColors;
    this.importer.startImport();

  },

  chooseTiles: function() {
    if(this.tilePaletteChooserMobile == null) {
      var _this = this;
      this.tilePaletteChooserMobile = new TilePaletteChooserMobile();
      this.tilePaletteChooserMobile.init(this.editor, { "mode": "multiple", "id": "Picker" });

      this.tilePaletteChooserMobile.on('close', function() {
        var selectedCharacters = _this.tilePaletteChooserMobile.getSelectedCharacters();
        _this.importer.customTileSet = [];
        for(var i = 0; i < selectedCharacters.length; i++) {
          _this.importer.customTileSet.push(selectedCharacters[i]);
        }
      });
    }

    var character = 0;

    if(typeof this.importer.customTileSet == 'undefined') {
      this.importer.customTileSet = [];
    }
    this.tilePaletteChooserMobile.show({ characters: this.importer.customTileSet });    
  },


  chooseColors: function() {
    if(this.colorPickerMobile == null) {
      var _this = this;
      this.colorPickerMobile = new ColorPickerMobile();
      this.colorPickerMobile.init(this.editor, { "canSelectMultiple": true, "id": "Picker" });

      this.colorPickerMobile.on('close', function() {
        var selectedColors = _this.colorPickerMobile.getSelectedColors();
        _this.importer.customColorSet = [];
        for(var i = 0; i < selectedColors.length; i++) {
          _this.importer.customColorSet.push(selectedColors[i]);
        }
        _this.parameterChanged();        
      });
    }

    if(typeof this.importer.customColorSet == 'undefined') {
      this.importer.customColorSet = [];
    }

    this.colorPickerMobile.show({colors: this.importer.customColorSet });    
  }
}