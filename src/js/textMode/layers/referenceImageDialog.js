var ReferenceImageDialog = function() {
  this.editor = null;

  this.prefix = '';

  this.scale = 1;
  this.brightness = 0;
  this.contrast = 0;
  this.saturation = 0;
  this.hue = 0;

  this.colorReductionMethod = 'dither';
  this.ditherThreshold = 0;

  this.mouseDownAtX = 0;
  this.mouseDownAtY = 0;
  this.currentOffsetX = 0;
  this.currentOffsetY = 0;
  this.mouseIsDown = false;

  this.canvas = null;
  this.previewCanvas = null;
  this.previewCanvasMaxWidth = 320;
  this.previewCanvasMaxHeight = 320;
  this.context = null;

  this.image = null;
  this.imageDataURL = null;

  this.x = 0;
  this.y = 0;
  this.drawWidth = 0;
  this.drawHeight = 0;

  this.canvasWidth = 0;
  this.canvasHeight = 0;

  this.imageParametersEffect = null;

  // checkerboard pattern
  this.backgroundCanvas = null;

  this.layerType = 'grid';
  this.newLayer = false;

  this.useColors = 'all';
  this.ditherMethod = 'FloydSteinberg';
  this.imageLib = null; 

  this.touchCount = 0;
  this.previewScale = 1;

  this.colorPickerMobile = null;

}

ReferenceImageDialog.prototype = {


  init: function(editor) {
    this.editor = editor;
    this.imageLib = new ImageLib();
  },


  show: function(args) {
    var _this = this;

    this.dialogReadyCallback = false;

    if(typeof args != 'undefined') {
      if(typeof args.dialogReadyCallback != 'undefined') {
        this.dialogReadyCallback = args.dialogReadyCallback;
      }
    }


    if(g_app.isMobile()) {
      this.prefix = "mobile_";

      if(this.uiComponent == null) {

        var width = 640;
        var height = 460;
        if(g_app.isMobile()) {
          height = 490;
        }


        if(width > UI.getScreenWidth()) {
          width = UI.getScreenWidth();
        }
   

//        this.uiComponent = UI.create("UI.Dialog", { "id": "referenceImageDialogMobile", "title": "Reference Image", "width": width, "height": height });
        this.uiComponent = UI.create("UI.MobilePanel", { "id": "referenceImageDialogMobile", "title": "Reference Image", "fullScreen": true, "maxWidth": 640, "maxHeight": 800 });

        this.htmlComponent = UI.create("UI.HTMLPanel");
        this.uiComponent.add(this.htmlComponent);
        this.htmlComponent.load('html/textMode/referenceImageDialogMobile.html', function() {
          UI.number.initControls('#' + this.prefix + 'refLayer .number');;
          _this.initContent();
          _this.initEvents();
        });


        this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
        this.uiComponent.addButton(this.okButton);
        this.okButton.on('click', function(event) {
          _this.setLayerRefImage();
          UI.closeDialog();
        });

        /*
        this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
        this.uiComponent.addButton(this.closeButton);
        this.closeButton.on('click', function(event) {
          UI.closeDialog();
        });

        */
      } else {
        this.initContent(args);
      }

      UI.showDialog("referenceImageDialogMobile");

    } else {
      if(this.uiComponent == null) {

        var width = 640;
        var height = 460;
        if(g_app.isMobile()) {
          height = 490;
        }


        if(width > UI.getScreenWidth()) {
          width = UI.getScreenWidth();
        }
   

        this.uiComponent = UI.create("UI.Dialog", { "id": "referenceImageDialog", "title": "Reference Image", "width": width, "height": height });

        this.htmlComponent = UI.create("UI.HTMLPanel");
        this.uiComponent.add(this.htmlComponent);
        this.htmlComponent.load('html/textMode/referenceImageDialog.html', function() {
          UI.number.initControls('#' + this.prefix + 'refLayer .number');;
          _this.initContent();
          _this.initEvents();

          if(_this.dialogReadyCallback !== false) {
            _this.dialogReadyCallback();
          }
        });


        this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
        this.uiComponent.addButton(this.okButton);
        this.okButton.on('click', function(event) {
          _this.setLayerRefImage();
          UI.closeDialog();
        });

        this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
        this.uiComponent.addButton(this.closeButton);
        this.closeButton.on('click', function(event) {
          UI.closeDialog();
        });
      } else {
        this.initContent();
        if(_this.dialogReadyCallback !== false) {
          _this.dialogReadyCallback();
        }

      }

      UI.showDialog("referenceImageDialog");
    }
  },  


  initBackgroundCanvas: function() {

    if(this.backgroundCanvas == null) {
      this.backgroundCanvas = document.createElement('canvas');
    }

    if(this.backgroundCanvas.width != this.previewCanvas.width || this.backgroundCanvas.height != this.previewCanvas.height) {
      this.backgroundCanvas.width = this.previewCanvas.width;
      this.backgroundCanvas.height = this.previewCanvas.height;
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

  },

  initContent: function(args) {

    var _this = this;

    if(g_app.isMobile()) {
      this.previewCanvasMaxWidth = 320;
      this.previewCanvasMaxHeight = 200;
    
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    var params = layer.getReferenceImageParams();

    this.image = layer.getReferenceImage();
    this.x = 0;
    this.y = 0;
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;
    this.hue = 0;
    this.colorReductionMethod = 'dither';
    this.useColors = 'all';
    this.ditherMethod = 'FloydSteinberg';

    if(params != null) {
      this.brightness = params.brightness;
      this.contrast = params.contrast;
      this.saturation = params.saturation;
      
      this.colorReductionMethod = params.colorReductionMethod;
      this.useColors = params.useColors;
      this.ditherMethod = params.ditherMethod;

      this.scale = params.scale;
      this.x = params.x;
      this.y = params.y;

      if(typeof params.originalImage != 'undefined' && params.originalImage) {
        this.image = params.originalImage;
      }

    }

    /*
          this.scale = params.scale;
          this.colors = params.colors;
          this.ditherMethod = params.ditherMethod;

          this.brightness = params.brightness;
          this.contrast = params.contrast;
          this.saturation = params.saturation;
          this.colorReductionMethod = params.colorReductionMethod;
          this.useColors = params.useColors;
          */
    $('#' + this.prefix + 'refImageBrightness').val(this.brightness);
    $('#' + this.prefix + 'refImageBrightnessValue').val(this.brightness);
    $('#' + this.prefix + 'refImageContrast').val(this.contrast);
    $('#' + this.prefix + 'refImageContrastValue').val(this.contrast);
    $('#' + this.prefix + 'refImageSaturation').val(this.saturation);
    $('#' + this.prefix + 'refImageSaturationValue').val(this.saturation);


    $('#' + this.prefix + 'refImageColorReduction').val(this.colorReductionMethod);
    $('#' + this.prefix + 'refImageUseColors').val(this.useColors);
    $('#' + this.prefix + 'refImageDither').val(this.ditherMethod);
    
    $('#' + this.prefix + 'refImageX').val(this.x);
    $('#' + this.prefix + 'refImageY').val(this.y);
    $('#' + this.prefix + 'refImageScale').val(this.scale);


//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();




    this.initCanvas();





/*
    if(!this.previewCanvas) {
      this.previewCanvas = document.getElementById(this.prefix + 'refImageCanvas');

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

    var previewCanvasWidth = this.canvasWidth;
    var previewCanvasHeight = this.canvasHeight;

    if(previewCanvasWidth > this.previewCanvasMaxWidth) {
      previewCanvasWidth = this.previewCanvasMaxWidth;
      previewCanvasHeight = this.canvasHeight * (previewCanvasWidth / this.canvasWidth);
    }

    if(previewCanvasHeight > this.previewCanvasMaxHeight) {
      previewCanvasHeight = this.previewCanvasMaxHeight;
      previewCanvasWidth = this.canvasWidth * (previewCanvasHeight / this.canvasHeight);
    }

    this.previewCanvas.width = previewCanvasWidth;
    this.previewCanvas.height = previewCanvasHeight;

    this.previewContext = this.previewCanvas.getContext('2d');

*/
    if(this.imageParametersEffect == null) {
      this.imageParametersEffect = new ImageParametersEffect();
    }

    this.initBackgroundCanvas();

    this.setColorReductionParams();

    this.previewContext.drawImage(this.backgroundCanvas, 0, 0);


    if(this.image) {
      this.showImage();
    }    
  },

  initCanvas: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      reutrn;
    }

    var tileSet = layer.getTileSet();

    this.layerWidth = layer.getGridWidth() * layer.getCellWidth();
    this.layerHeight = layer.getGridHeight() * layer.getCellHeight();


    // first the offscreen canvas the image is drawn into..
    // it has the same resolution as the layer.
    if(!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    this.canvasWidth = this.layerWidth;
    this.canvasHeight = this.layerHeight;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;


    var _this = this;

    // now the preview canvas, it needs to fit in the dialog...
    if(!this.previewCanvas) {
      this.previewCanvas = document.getElementById(this.prefix + 'refImageCanvas');

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



    this.previewScale = 1;

    var previewWidth = this.layerWidth;
    var previewHeight = this.layerHeight;

    // make sure preview fits in the dialog
    if(previewWidth > this.previewCanvasMaxWidth || previewHeight > this.previewCanvasMaxHeight) {
      if(this.previewCanvasMaxWidth/this.previewCanvasMaxHeight > previewWidth / previewHeight) {

        this.previewScale = this.previewCanvasMaxHeight / previewHeight;
        previewWidth = previewWidth * this.previewCanvasMaxHeight / previewHeight;

        previewHeight = this.previewCanvasMaxHeight;
      } else {
        this.previewScale = this.previewCanvasMaxWidth / previewWidth;
        previewHeight = previewHeight * this.previewCanvasMaxWidth / previewWidth;
        previewWidth = this.previewCanvasMaxWidth;
      }
    }


    if(this.previewCanvas.width != previewWidth || this.previewCanvas.height != previewHeight) {
      this.previewCanvas.width = previewWidth;
      this.previewCanvas.height = previewHeight;
    }
    this.previewContext = this.previewCanvas.getContext('2d');



  },

  setLayerRefImage: function() {
    /*
    this.editor.layers.setReferenceImage(this.canvas,
       { 
          originalImage: this.image, 
          x: this.x, 
          y: this.y, 
          width: this.drawWidth, 
          height: this.drawHeight, 
          scale: this.scale,
          brightness: this.brightness,
          contrast: this.contrast,
          saturation: this.saturation,
          colorReductionMethod: this.colorReductionMethod,
          ditherMethod: this.ditherMethod,
          useColors: this.useColors,
          colors: this.colors
       });
    */
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid')  {
      layer.setReferenceImage({
        image: this.canvas,
        imageData: this.canvas.toDataURL(),
        params: {
          originalImage: this.image,
          x: this.x, 
          y: this.y, 
          scale: this.scale,
          brightness: this.brightness,
          contrast: this.contrast,
          saturation: this.saturation,
          colorReductionMethod: this.colorReductionMethod,
          ditherMethod: this.ditherMethod,
          useColors: this.useColors,
          colors: this.colors
        }
      });

      this.editor.graphic.redraw({ allCells: true });
    }

  },


  initEvents: function() {
    var _this = this;

    var mouseDownAtX = 0;
    var mouseDownAtY = 0;
    var mouseDown = false;
    var currentOffsetX = 0;
    var currentOffsetY = 0;

    $('#' + this.prefix + 'refLayerSourceChooseFile').on('click', function() {
      $('#' + _this.prefix + 'refLayerSourceFile').click();
    });


    $('#' + this.prefix + 'refLayerClearImage').on('click', function() {
      _this.clearImage();
    });


    $('#' + this.prefix + 'refImageX').on('keyup', function() {
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageY').on('keyup', function() {
      _this.showImage();
    });


    $('#' + this.prefix + 'refImageScale').on('keyup', function() {
      $('#' + this.prefix + 'refImageScaleRange').val($(this).val());
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageScaleRange').on('change', function() {
      var scale = $(this).val();
      $('#' + _this.prefix + 'refImageScale').val($(this).val());
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageScaleRange').on('input', function() {
      $('#' + _this.prefix + 'refImageScale').val($(this).val());
      _this.showImage();
    });



    $('#' + this.prefix + 'refImageRotation').on('keyup', function() {
      $('#' + this.prefix + 'refImageScaleRotation').val($(this).val());
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageRotationRange').on('change', function() {
      var scale = $(this).val();
      $('#' + _this.prefix + 'refImageRotation').val($(this).val());
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageRotationRange').on('input', function() {
      $('#' + _this.prefix + 'refImageRotation').val($(this).val());
      _this.showImage();
    });


    $('#' + this.prefix + 'refImageRotation90').on('click', function() {
      _this.rotate90();
    });



    $('#' + this.prefix + 'refImageScaleToFit').on('click', function() {
      _this.scaleToFit();
    });

    $('#' + this.prefix + 'refImageCanvas').on('wheel', function(event) {
      _this.imageMouseWheel(event.originalEvent);
    });


    $('#' + this.prefix + 'refImageCanvas').on('mousedown', function(e) {

      var x = e.offsetX;
      var y = e.offsetY;

      _this.mouseDownAtX = e.clientX;
      _this.mouseDownAtY = e.clientY;
      _this.currentOffsetX = parseInt($('#' + _this.prefix + 'refImageX').val());
      _this.currentOffsetY = parseInt($('#' + _this.prefix + 'refImageY').val());

      _this.mouseIsDown = true;

      UI.setCursor('drag');

      UI.captureMouse(_this);//, { "cursor": 'hand' });
    });

    $('#' + this.prefix + 'refImageScaleDecrease').on('click', function() {
      var scale = parseInt($('#' + _this.prefix + 'refImageScale').val(), 10);
      scale -= 5;
      if(scale > 0) {
        $('#' + _this.prefix + 'refImageScale').val(scale, 10);
      }
      _this.showImage();        

    });

    $('#' + this.prefix + 'refImageCanvas').on('mouseenter', function(e) {
      UI.setCursor('can-drag');
    });


    $('#' + this.prefix + 'refImageScaleIncrease').on('click', function() {
      var scale = parseInt($('#' + _this.prefix + 'refImageScale').val());
      scale += 5;
      if(scale > 0) {
        $('#' + _this.prefix + 'refImageScale').val(scale, 10);
      }
      _this.showImage();        

    });



    // brightness/contrast/saturation
    $('#' + this.prefix + 'refImageBrightness').on('change', function() {
      _this.brightness = $(this).val();


      $('#' + _this.prefix + 'refImageBrightnessValue').val(_this.brightness);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageBrightness').on('input', function() {
      _this.brightness = $(this).val();
      $('#' + _this.prefix + 'refImageBrightnessValue').val(_this.brightness);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageBrightnessValue').on('change', function() {
      _this.brightness = $(this).val();
      $('#' + _this.prefix + 'refImageBrightness').val(_this.brightness);
      _this.showImage();

    });

    $('#' + this.prefix + 'refImageBrightnessReset').on('click', function() {
      _this.brightness = 0;
      $('#' + _this.prefix + 'refImageBrightnessValue').val(0);
      $('#' + _this.prefix + 'refImageBrightness').val(0);      
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageContrast').on('change', function() {
      _this.contrast = $(this).val();

      $('#' + _this.prefix + 'refImageContrastValue').val(_this.contrast);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageContrast').on('input', function() {
      _this.contrast = $(this).val();

      $('#' + _this.prefix + 'refImageContrastValue').val(_this.contrast);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageContrastValue').on('change', function() {
      _this.contrast = $(this).val();

      $('#' + _this.prefix + 'refImageContrast').val(_this.contrast);
      _this.showImage();
    });


    $('#' + this.prefix + 'refImageContrastReset').on('click', function() {
      _this.contrast = 0;
      $('#' + _this.prefix + 'refImageContrast').val(0);
      $('#' + _this.prefix + 'refImageContrastValue').val(0);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageSaturation').on('change', function() {
      _this.saturation = $(this).val();

      $('#' + _this.prefix + 'refImageSaturationValue').val(_this.saturation);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageSaturation').on('input', function() {
      _this.saturation = $(this).val();
      $('#' + _this.prefix + 'refImageSaturationValue').val(_this.saturation);
      _this.showImage();
    });


    $('#' + this.prefix + 'refImageSaturationValue').on('change', function() {
      _this.saturation = $(this).val();

      $('#' + _this.prefix + 'refImageSaturation').val(_this.saturation);
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageSaturationReset').on('click', function() {
      _this.saturation = 0;
      $('#' + _this.prefix + 'refImageSaturationValue').val(0);
      $('#' + _this.prefix + 'refImageSaturation').val(0);
      _this.showImage();
    });    


    // color reduction

    $('#' + this.prefix + 'refImageColorReduction').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });
/*
    $('input[name=refImageColorReduction]').on('click', function() {
      _this.setColorReductionParams();
      _this.showImage();

    });
*/
    $('#' + this.prefix + 'refImageLimitPerCell').on('click', function() {
      _this.setColorReductionParams();
      _this.showImage();

    });

    $('#' + this.prefix + 'refImageDither').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });

    $('#' + this.prefix + 'refImageDitherThreshold').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });
    $('#' + this.prefix + 'refImageDitherThreshold').on('keyup', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });



    $('#' + this.prefix + 'refImageUseColors').on('change', function(event) {
      _this.useColors = $(this).val();
      if(_this.useColors == 'all') {
        $('#' + _this.prefix + 'refImageChooseColorsRow').hide();
        $('#' + _this.prefix + 'refImageCreatePalette').hide();
      } else if(_this.useColors == 'greyscale') {
        $('#' + _this.prefix + 'refImageChooseColorsRow').hide();
        $('#' + _this.prefix + 'refImageCreatePalette').hide();
      } else if(_this.useColors == 'choose') {

        $('#' + _this.prefix + 'refImageChooseColorsRow').show();
        $('#' + _this.prefix + 'refImageCreatePalette').hide();
        $('#mobile_refImageUseColorsRow').css('border-bottom', '0');

        _this.chooseColors();
      } else {
        $('#' + _this.prefix + 'refImageChooseColorsRow').hide();
        $('#' + _this.prefix + 'refImageCreatePalette').hide();
      }

      _this.showImage();

    });


    $('#' + this.prefix + 'refImageChooseColors').on('click', function() {
      _this.chooseColors();
    });


    document.getElementById(this.prefix + 'refLayerSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById(_this.prefix + 'refLayerSourceFile').files[0];
      _this.chooseImage(file);
    });

    $('#layerProperties-backgroundColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setBackgroundColor(color);
        //
      }
      args.hasNone = true;
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.backgroundColor;//_this.editor.frames.getBackgroundColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });

    $('#layerProperties-borderColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setBorderColor(color);
        //
      }
      args.hasNone = true;
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.borderColor;//_this.editor.frames.getBackgroundColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

/*
    $('#layerPropertiesDialogBackgroundColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setBackgroundColor(color);
        //
      }
      args.hasNone = true;
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.backgroundColor;//_this.editor.frames.getBackgroundColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });



    $('#layerPropertiesDialogBorderColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setBorderColor(color);
        //
      }
      args.hasNone = true;
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.borderColor;//_this.editor.frames.getBackgroundColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });    
*/
  },

  chooseColors: function() {
    var _this = this;

    var chooseColorsCallback = function(chosenColors) {
      _this.customColorSet = [];
      var count = chosenColors.length;
      for(var i = 0; i < count; i++) {
        _this.customColorSet.push(chosenColors[i]);
      }

      var html = count;
      html += ' Colour';
      if(count != 1) {
        html += 's';
      }
      html += ' Chosen';
      $('#' + _this.prefix + 'refImageChooseColorsCount').html(html);

      _this.showImage();
    }



    if(g_app.isMobile()) {
      if(this.colorPickerMobile == null) {
        var _this = this;
        this.colorPickerMobile = new ColorPickerMobile();
        this.colorPickerMobile.init(this.editor, { "canSelectMultiple": true, "id": "RefPicker" });
  
        this.colorPickerMobile.on('close', function() {
          var selectedColors = _this.colorPickerMobile.getSelectedColors();
          chooseColorsCallback(selectedColors);
        });
      }
  
      if(typeof this.customColorSet == 'undefined') {
        this.customColorSet = [];
      }
  
      this.colorPickerMobile.show({colors: this.customColorSet });    

    } else {
      this.editor.chooseColorsDialog.show({ callback: chooseColorsCallback});
    }
  },

  setColorReductionParams: function() {
    this.useColors = $('#' + this.prefix + 'refImageUseColors').val();

//    this.colorReductionMethod = $('input[name=refImageColorReduction]:checked').val();
    this.colorReductionMethod = $('#' + this.prefix + 'refImageColorReduction').val();
    if(this.colorReductionMethod == 'dither') {
      $('#' + this.prefix + 'refImageDitherGroup').show();
    } else {
      $('#' + this.prefix + 'refImageDitherGroup').hide();
    }

    if(this.colorReductionMethod == 'edge') {
      $('#' + this.prefix + 'refImageEdgeDetectionGroup').show();
    } else {
      $('#' + this.prefix + 'refImageEdgeDetectionGroup').hide();
    }
    this.ditherMethod = $('#' + this.prefix + 'refImageDither').val();//$('input[name=refImageDither]:checked').val();

    this.limitColorsPerCell = $('#' + this.prefix + 'refImageLimitPerCell').is(':checked');

    if(this.colorReductionMethod == 'none') {
      $('#' + this.prefix + 'refImageUseColorsRow').hide();
    } else {
      $('#' + this.prefix + 'refImageUseColorsRow').show();
    }
  },


  setColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(this.useColors == 'choose' && typeof this.customColorSet != 'undefined' ) {
      this.colors = [];
      for(var i = 0; i < this.customColorSet.length; i++) {
        this.colors.push(this.customColorSet[i]);
      } 
    } else if(this.useColors == 'greyscale') {
      this.colors = [];

      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        if(colorPalette.getIsGrey(i)) {
          this.colors.push(i);
        }
      }

    } else {
      this.colors = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colors.push(i);
      }      
    }    
  },

  chooseImage: function(file) {
    var _this = this;
    var image = new Image();
    image.onload = function() {
      _this.image = image;
      _this.scaleToFit();
      _this.showImage();
    }
/*  
    if(!this.image) {
      this.image = new Image();
      var _this = this;
      this.image.onload = function() {
        console.log('image loaded!!');
        console.log(_this.image);
        _this.scaleToFit();
        _this.showImage();
      }
  
    }
*/

    if(this.prefix == 'mobile_') {
      $('#mobile_refImageControlsContainer').show();
    }

//console.error('choose image');

    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    image.src = src;

  },



  scaleToFit: function() {
    var drawWidth = 0;
    var drawHeight = 0;
    var scale = 1;

    // actual image width/height
    var drawWidth = this.image.naturalWidth;
    var drawHeight = this.image.naturalHeight;

    // scale to fit width first
    if(drawWidth > this.canvasWidth) {
      scale = this.canvasWidth / this.image.naturalWidth;
    }

    // scale to fit height
    if(drawHeight > this.canvasHeight) {
      scale = this.canvasHeight / this.image.naturalHeight;
    }


    if(drawWidth < this.canvasWidth && scale == 1) {
      scale = this.canvasWidth / this.image.naturalWidth;
    }

    if(drawHeight < this.canvasHeight && scale == 1) {
      scale = this.canvasHeight / this.image.naturalHeight;
    }

    var x = (this.canvasWidth - drawWidth) / 2;
    $('#' + this.prefix + 'refImageX').val(x);

    var y = (this.canvasHeight - drawHeight) / 2;
    $('#' + this.prefix + 'refImageY').val(y);

    scale = scale * 100;

    $('#' + this.prefix + 'refImageScale').val(scale);
    this.showImage();
  },


  clearImage: function() {
    this.image = null;
    this.showImage();

  },

  rotate90: function() {
    this.rotation = parseInt($('#' + this.prefix + 'refImageRotation').val());
    if(isNaN(this.rotation)) {
      this.rotation = 0;
    }

    this.rotation = (this.rotation + 90) % 360;
    $('#' + this.prefix + 'refImageRotation').val(this.rotation);
    this.showImage();
  

  },

  showImage: function(args) {
    var drawBackground = true;
    var ignoreColorReduction = false;

    if(typeof args != 'undefined') {
      if(typeof args.drawBackground != 'undefined') {
        drawBackground = args.drawBackground;
      }

      if(typeof args.ignoreColorReduction != 'undefined') {
        ignoreColorReduction = args.ignoreColorReduction;
      }
    }


//    if(!ignoreColorReduction) {
    this.setColorReductionParams();
//    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    this.crosshairX = this.canvas.width / 2;
    this.crosshairY = this.canvas.height / 2;



    this.scale = parseInt($('#' + this.prefix + 'refImageScale').val());
    this.rotation = parseInt($('#' + this.prefix + 'refImageRotation').val());
    if(isNaN(this.rotation)) {
      this.rotation = 0;
    }

    this.x = parseInt($('#' + this.prefix + 'refImageX').val());
    this.y = parseInt($('#' + this.prefix + 'refImageY').val());

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    if(drawBackground) {
      this.previewContext.drawImage(this.backgroundCanvas, 0, 0);
    } else {
      this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);


    if(this.image) {
      this.context.save();

      this.context.translate(this.crosshairX, this.crosshairY); 


      this.context.scale(this.scale / 100, this.scale / 100);
      this.context.rotate(this.rotation * Math.PI * 2 / 360);


      var imageX = this.x - this.crosshairX;
      var imageY = this.y - this.crosshairY;

      var drawWidth = this.image.naturalWidth;
      var drawHeight = this.image.naturalHeight;

      var tx = imageX;
      var ty = imageY;


//      tx = Math.cos(this.rotation * Math.PI / 180) * imageX + Math.sin(this.rotation* Math.PI / 180) * imageY;
//      ty = Math.cos(this.rotation* Math.PI / 180) * imageY - Math.sin(this.rotation* Math.PI / 180) * imageX;

      this.context.drawImage(this.image, tx, ty, drawWidth, drawHeight);      
//      this.context.drawImage(this.image, imageX, imageY, drawWidth, drawHeight);


      this.context.translate(-this.crosshairX, -this.crosshairY); 
      this.context.restore();

      this.imageParametersEffect.setParameters({ brightness: this.brightness });        
      this.imageParametersEffect.setParameters({ contrast: this.contrast });        
      this.imageParametersEffect.setParameters({ saturation: this.saturation });        

      this.imageParametersEffect.setSource(this.canvas);
      this.imageParametersEffect.setDestination(this.canvas);
      this.imageParametersEffect.update();


  //    this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     

      if(!ignoreColorReduction && (this.colorReductionMethod == 'closest' || this.colorReductionMethod == 'dither')) {

        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);     

        this.setColors();

        var palette = [];
        for(var i = 0; i < this.colors.length; i++) {
          palette.push(colorPalette.getRGBA(this.colors[i]));
        }


        this.imageLib.palette = palette;
        this.imageLib.setImageData(this.imageData);
        if(this.colorReductionMethod == 'dither') {
          this.imageData = this.imageLib.reduceDither({ kernel: this.ditherMethod });          
        } else {
          this.imageData = this.imageLib.reduceNearest();
        }


        if(this.limitColorsPerCell) {

          this.imageLib.setImageData(this.imageData);
          this.imageData = this.imageLib.reducePerCell();

          this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height);         

          /*
          var hasTransparent = false;
          var mask = [];
          for(var i = 0; i < this.imageData.data.length; i+= 4) {
            if(this.imageData.data[i + 3] < 255) {
              hasTransparent = true;
              this.imageData.data[i] = 0;
              this.imageData.data[i + 1] = 0;
              this.imageData.data[i + 2] = 0;
              this.imageData.data[i + 3] = 255;
              mask.push(i + 3);
            }
          }
          this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height); 

          ImageUtils.limitColorsPerCell(this.context, { colors: colors, dithKern: dithKern, width: this.canvas.width, height: this.canvas.height });        
          if(hasTransparent) {

            this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);     

            for(var i = 0; i < mask.length; i++) {
              this.imageData.data[mask[i]] = 0;
            }
            this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height); 
          }
          */
        } else {
          this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height);         
        }
      }


      this.previewContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height,
        0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }

  },




  imageMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);

    this.scale = parseInt($('#' + this.prefix + 'refImageScale').val());


    var newScale = this.scale - wheel.spinY * 8;//12;

    this.scale = newScale;

    $('#' + this.prefix + 'refImageScale').val(this.scale);    
    this.showImage();
  },


  mouseDown: function(e) {

  },

  mouseMove: function(e) {

    if(this.mouseIsDown) {
      var scale = this.scale;

      var x = e.clientX;
      var y = e.clientY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;

      diffX = diffX * 100 / scale;
      diffY = diffY * 100 / scale;


      var newOffsetX = this.currentOffsetX + diffX;
      $('#' + this.prefix + 'refImageX').val(newOffsetX);

      var newOffsetY = this.currentOffsetY + diffY;
      $('#' + this.prefix + 'refImageY').val(newOffsetY);
      this.showImage();        
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  },

  setScale: function(scale, update) {
    scale = parseFloat(scale);
    if(isNaN(scale)) {
      return;
    }

    this.scale = scale;
      
    $('#' + this.prefix + 'refImageScale').val(this.scale);
    $('#' + this.prefix + 'refImageScaleRange').val(this.scale);

    if(typeof update == 'undefined' || update) {
//      if(this.importer.importSource != 'video') {      

        this.showImage();
//      }
    }
  },

/*
  setColorReductionMethod: function(method) {

  },
*/
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
      this.currentOffsetX = parseFloat($('#' + this.prefix + 'refImageX').val());
      this.currentOffsetY =  parseFloat($('#' + this.prefix + 'refImageY').val());

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

      this.pinchStartScale = this.scale;   

    }

    this.colorReductionMethod = 'none';
//    this.setColorReductionMethod('none');
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


      var scale = this.scale;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;

      diffX = (diffX * 100 / scale) / this.previewScale;
      diffY = (diffY * 100 / scale) / this.previewScale;



      if(diffX > 2 || diffY > 2) {
        this.movingImage = true;
      }        

      
      var imageDx = Math.cos(this.rotation * Math.PI / 180) * diffX + Math.sin(this.rotation* Math.PI / 180) * diffY;
      var imageDy = Math.cos(this.rotation* Math.PI / 180) * diffY - Math.sin(this.rotation* Math.PI / 180) * diffX;


      var newOffsetX = this.currentOffsetX + imageDx;
       $('#' + this.prefix + 'refImageX').val(newOffsetX);

      var newOffsetY = this.currentOffsetY + imageDy;
      $('#' + this.prefix + 'refImageY').val(newOffsetY);

      this.showImage({ ignoreColorReduction: true });
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


      var newScale = (this.touchMoveDistance / this.touchStartDistance) * this.pinchStartScale;
      this.setScale(newScale, false);

      var scale = this.scale

      /*
      var dx = (newMidX - oldMidX);
      var dy = (newMidY - oldMidY);

      dx = (dx * 100 / scale) / this.previewScale;
      dy = (dy * 100 / scale) / this.previewScale;
*/

//      this.importer.imageX += dx;
//      this.importer.imageY += dy;
      this.showImage({ ignoreColorReduction: true });
    }


  },

  touchEnd: function(event) {

    var method = $('#importImageColorReductionMobile').val();
    //this.setColorReductionParams();
    this.showImage();


  },



}