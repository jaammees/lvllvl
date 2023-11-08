var LayerPropertiesDialog = function() {
  this.editor = null;
/*
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
  this.previewCanvasMaxWidth = 400;
  this.previewCanvasMaxHeight = 400;
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

  this.ditherMethod = 'FloydSteinberg';
  this.imageLib = null;
*/
  this.layerType = 'grid';
  this.newLayer = false;

  this.tileSetMode = false;
  this.tileSetType = false;
  this.tileSetPresetId = false;

  this.colorPaletteCreated = false;
  this.newColorPalette = null;
  this.colorPalettePresetId = false;
}


LayerPropertiesDialog.prototype = {


  init: function(editor) {
    this.editor = editor;
//    this.imageLib = new ImageLib();
  },


  setLayerType: function(type) {
    this.layerType = type;
    var height = 520;
    var width = 400;

    switch(this.layerType) {
      case 'grid':

        if(g_app.isMobile()) {
          height = 490;
        } else {
          if(this.newLayer) {
            height = 340;
          } else {
            height = 290;
          }
        }
        width = 380;

        $('#layerDialogStandardProperties').show();
        $('#layerDialogGridProperties').show();
        $('#layerDialogBackgroundProperties').hide();
        $('#layerDialogImageProperties').hide();
      break;
      case 'background':
        height = 140;
        width = 310;

        $('#layerDialogStandardProperties').hide();
        $('#layerDialogBackgroundProperties').show();
        $('#layerDialogImageProperties').hide();
      break;
      /*
      case 'image':
        height = 550;
        width = 620;

        $('#layerDialogGridProperties').hide();
        $('#layerDialogStandardProperties').show();      
        $('#layerDialogBackgroundProperties').hide();
        $('#layerDialogImageProperties').show();

        if(g_app.isMobile()) {
          if(width + 20 > UI.getScreenWidth()) {
            $('#refImageParameters').hide();
          }
        }
      break;
      */
    }
    if(width + 20 > UI.getScreenWidth()) {
      width = UI.getScreenWidth() - 20;
    }
    this.uiComponent.setHeight(height);
    this.uiComponent.setWidth(width);

  },

  show: function(args) {
    var _this = this;

    if(this.uiComponent == null) {

      var width = 420;
      var height = 580;
      if(g_app.isMobile()) {
        height = 490;
      }


      if(width > UI.getScreenWidth()) {
        width = UI.getScreenWidth();
      }
 

      this.uiComponent = UI.create("UI.Dialog", { "id": "layerPropertiesDialog", "title": "Layer Properties", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/layerPropertiesDialog.html', function() {
        UI.number.initControls('#refLayer .number');;
        _this.initCompositeDropdown();
        _this.initContent(args);
        _this.initEvents();
      });


      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.setLayer();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent(args);
    }

    UI.showDialog("layerPropertiesDialog");
  },  


  setLayer: function() {

    if(this.layerType == 'background') {
      this.editor.frames.setBackgroundColor(this.backgroundColor);
      return;
    }

    var label = $('#layersRefImageName').val();

    var tileSet = $('input[name=layerDialogTileSet]:checked').val();
    var colorPalette = $('input[name=layerDialogColorPalette]:checked').val();

    /*
    var opacity = parseInt($('#layersRefImageOpacity').val(), 10);
    if(isNaN(opacity)) {
      opacity = 1;
    } else {
      opacity = opacity / 100;
    }    
    var compositeOperation = $('#layersRefImageMode').val();
    */

    var screenMode = $('#layersScreenMode').val();

    var layers = this.editor.layers;

    if(this.layerType == 'grid') {
      var tileFlip = $('#layerTileFlip').is(':checked');
      var tileRotate = $('#layerTileRotate').is(':checked');
      if(this.newLayer) {
        var opacity = 1;
        var compositeOperation = 'source-over';

/*
        _this.tileSetCreated = args.tileSetCreated;
        _this.tileSet = args.tileSet;
        _this.tileSetMode = args.mode;
        _this.tileSetType = args.type;
        _this.tileSetPresetId = args.presetId;
*/  
        if(tileSet == 'new') {
          if( ! this.tileSetPresetId ) {
            this.tileSetPresetId = "petscii";
            this.tileSetName = "Commodore 64";
          }
        }

        if(colorPalette == 'new') {
          if(!this.colorPalettePresetId) {
            this.colorPalettePresetId = "c64_colodore";
            this.colorPaletteName = 'Commodore 64';
          }
        }
        layers.newLayer({ 
          label: label, 
          opacity: opacity, 
          compositeOperation: compositeOperation, 
          backgroundColor: this.backgroundColor, 
          borderColor: this.borderColor, 
          screenMode: screenMode,
          tileFlip: tileFlip,
          tileRotate: tileRotate,
          tileSet: tileSet,
          tileSetMode: this.tileSetMode,
          tileSetPresetId: this.tileSetPresetId,
          tileSetCreated: this.tileSetCreated,
          newTileSet: this.tileSet,
          tileSetName: this.tileSetName,


          colorPalette: colorPalette,
          colorPaletteCreated: this.colorPaletteCreated,
          colorPalettePresetId: this.colorPalettePresetId,
          newColorPalette: this.newColorPalette,
          colorPaletteName: this.colorPaletteName
        });
        this.updateEditorInterface();
      } else {

        layers.setSelectedLayerBackgroundColor(this.backgroundColor);
        layers.setSelectedLayerBorderColor(this.borderColor);


        var layer = layers.getSelectedLayerObject();
        if(layer && layer.getType() == 'grid') {        
          layer.setHasTileFlip(tileFlip);
          layer.setHasTileRotate(tileRotate);          
        }

        var _this = this;
        layer.setScreenMode(screenMode, function() {
          layers.setSelectedLayerLabel(label);
          _this.updateEditorInterface();

        });

      }

      return;
    }

    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true });
  },

  updateEditorInterface: function() {
    this.editor.updateInterfaceTileOrientation();
    this.editor.currentTile.refresh();

    this.editor.syncColorPickers();
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true });

  },

/*
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
*/
  initCompositeDropdown: function() {
    var html = '';

    for(var i = 0; i < this.editor.layers.compositeOperations.length; i++) {
      if(this.editor.layers.compositeOperations[i].label == '-') {
        html += '<option disabled>──────────</option>';
      } else {
        html += '<option value="' + this.editor.layers.compositeOperations[i].operation + '">';
        html += this.editor.layers.compositeOperations[i].label;
        html += '</option>';
      }
    }

    $('#layersRefImageMode').html(html);
  },

  // show or hide options depending on screen mode
  setScreenModeOptions: function() {
    var screenMode = $('#layersScreenMode').val();
    if(screenMode ==  TextModeEditor.Mode.C64STANDARD || screenMode ==  TextModeEditor.Mode.C64MULTICOLOR || screenMode ==  TextModeEditor.Mode.C64STANDARD) {
      $('#layerDialogFlipRotateOptions').hide();
      $('#layerTileFlip').prop('checked', false);
      $('#layerTileRotate').prop('checked', false);      
    } else {
      $('#layerDialogFlipRotateOptions').show();
    }
  },

  initContent: function(args) {
    var screenModeHTML = $('#layersScreenMode').html();
    if(this.editor.graphic.getType() == 'sprite') {
      screenModeHTML = screenModeHTML.replace('Text Mode', 'Monochrome');
      $('#layerDialogGridPropertiesBackgroundColor').hide();
      this.setBackgroundColor(this.editor.colorPaletteManager.noColor);
      this.setBorderColor(this.editor.colorPaletteManager.noColor);

    } else {
      $('#layerDialogGridPropertiesBackgroundColor').show();
      screenModeHTML = screenModeHTML.replace('Monochrome', 'Text Mode');      
    }

    $('#layerTileSet').prop('checked', true);
    $('#layerColorPaletteCurrent').prop('checked', true);
    
    this.setChooseTileSetVisibility();
    this.setChooseColorPaletteVisibility();

    $('#layersScreenMode').html(screenModeHTML);

    document.getElementById('refLayerForm').reset();

    this.layerObject = null;

    if(typeof args != 'undefined') {
      this.newLayer = false;

      if(typeof args.layerId != 'undefined') {
        this.layerObject = this.editor.layers.getLayerObject(args.layerId);
      }
      
      $('#layerDialogLayerTypeRow').hide();
      this.setLayerType(args.type);

      switch(args.type) {
        case 'grid':
          $('#layersRefImageName').val(args.label);
          $('#layersRefImageOpacity').val(Math.floor(args.opacity * 100)) ;
          $('#layersRefImageMode').val(args.compositeOperation);
          $('#layersScreenMode').val(this.layerObject.getScreenMode());

          if(this.editor.graphic.getType() == 'sprite') {
            $('#layerDialogGridPropertiesBackgroundColor').hide();
            this.setBackgroundColor(this.editor.colorPaletteManager.noColor);
            this.setBorderColor(this.editor.colorPaletteManager.noColor);
          } else {
            $('#layerDialogGridPropertiesBackgroundColor').show();
            this.setBackgroundColor(this.layerObject.getBackgroundColor());
            this.setBorderColor(this.layerObject.getBorderColor());
          }

          if(this.layerObject) {
            $('#layerTileFlip').prop('checked', this.layerObject.getHasTileFlip());
            $('#layerTileRotate').prop('checked', this.layerObject.getHasTileRotate());
          }
        break;
        /*
        case 'image':
          $('#layersRefImageName').val(args.label);
          $('#layersRefImageOpacity').val(Math.floor(args.opacity * 100)) ;
          $('#layersRefImageMode').val(args.compositeOperation);

          this.image = null;

          var params = this.layerObject.getParams();

          this.image = params.originalImage;

          this.x = params.x;
          this.y = params.y;
          

          this.scale = params.scale;
          this.colors = params.colors;
          this.ditherMethod = params.ditherMethod;

          this.brightness = params.brightness;
          this.contrast = params.contrast;
          this.saturation = params.saturation;
          this.colorReductionMethod = params.colorReductionMethod;
          this.useColors = params.useColors;


        break;
        */
        case 'background':
          var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
          var bgColor = this.editor.frames.getBackgroundColor();
          $('#layerPropertiesDialogBackgroundColor').css('background-color', '#' + colorPalette.getHexString(bgColor));        
        break;
      }

    } else {
      // its a new layer...

      this.newLayer = true;
      $('#layerDialogLayerType_grid').prop('checked', true);
      this.setLayerType('grid');

      var currentLayer =  this.editor.layers.getSelectedLayerObject();


      // always hide layer type for now, cos its always a grid..
      $('#layerDialogLayerTypeRow').hide();

      if(currentLayer) {
        $('#layersScreenMode').val(currentLayer.getMode());
        $('#layerTileFlip').prop('checked', currentLayer.getHasTileFlip());
        $('#layerTileRotate').prop('checked', currentLayer.getHasTileRotate());
    
      } else {
        $('#layersScreenMode').val('textmode');
      }
      this.setBackgroundColor(this.editor.colorPaletteManager.noColor);
      this.setBorderColor(this.editor.colorPaletteManager.noColor);

/*
      this.image = null;
      this.x = 0;
      this.y = 0;

      this.scale = 100;

      this.brightness = 0;
      this.contrast = 0;
      this.saturation = 0;
      this.colorReductionMethod = 'none';
      this.useColors = 'all';

  
      this.colors = [];

*/
      $('#layersRefImageName').val('Layer ' + this.editor.layers.getLayerCount());
      $('#layersRefImageOpacity').val('100');
      $('#layersRefImageMode').val('source-over');
    }
/*
    $('#refImageBrightness').val(this.brightness);
    $('#refImageBrightnessValue').val(this.brightness);
    $('#refImageContrast').val(this.contrast);
    $('#refImageContrastValue').val(this.contrast);
    $('#refImageSaturation').val(this.saturation);
    $('#refImageSaturationValue').val(this.saturation);

//console.log('color reduction = ' + this.colorReductionMethod);
//console.log('use colors = ' +this.useColors);
//    $('input[name=refImageColorReduction][value=\'' + this.colorReductionMethod + '\']').prop('checked', true);

    $('#refImageColorReduction').val(this.colorReductionMethod);
    $('#refImageUseColors').val(this.useColors);
    $('#refImageDither').val(this.ditherMethod);
    
    $('#refImageX').val(this.x);
    $('#refImageY').val(this.y);
    $('#refImageScale').val(this.scale);


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();


    if(!this.canvas) {
      this.canvas = document.createElement('canvas');
    }

    this.canvasWidth = tileSet.charWidth * this.editor.grid.width;
    this.canvasHeight = tileSet.charHeight * this.editor.grid.height;

    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;



    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;


    if(!this.previewCanvas) {
      this.previewCanvas = document.getElementById('refImageCanvas');
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


    if(this.imageParametersEffect == null) {
      this.imageParametersEffect = new ImageParametersEffect();
    }

    this.initBackgroundCanvas();

    this.setColorReductionParams();

    this.previewContext.drawImage(this.backgroundCanvas, 0, 0);


    if(this.image) {
      this.showImage();
    }

    */

    if(this.newLayer) {
      $('#layerDialogTileSetGroup').show();
      $('#layerDialogColorPaletteGroup').show();
    } else {
      $('#layerDialogTileSetGroup').hide();
      $('#layerDialogColorPaletteGroup').hide();
    }

    this.setScreenModeOptions();

  },

  initEvents: function() {
    var _this = this;
/*
    var mouseDownAtX = 0;
    var mouseDownAtY = 0;
    var mouseDown = false;
    var currentOffsetX = 0;
    var currentOffsetY = 0;


    $('input[name=layerDialogLayerType]').on('click', function(event) {
      var layerType = $('input[name=layerDialogLayerType]:checked').val();
      _this.setLayerType(layerType);
    });

    $('#refImageX').on('keyup', function() {
      _this.showImage();
    });

    $('#refImageY').on('keyup', function() {
      _this.showImage();
    });

    $('#refImageScale').on('keyup', function() {
      _this.showImage();
    });

    $('#refImageScaleToFit').on('click', function() {
      _this.scaleToFit();
    });

    $('#refImageCanvas').on('wheel', function(event) {
      _this.imageMouseWheel(event.originalEvent);
    });


    $('#refImageCanvas').on('mousedown', function(e) {

      var x = e.offsetX;
      var y = e.offsetY;

      _this.mouseDownAtX = e.clientX;
      _this.mouseDownAtY = e.clientY;
      _this.currentOffsetX = parseInt($('#refImageX').val());
      _this.currentOffsetY = parseInt($('#refImageY').val());

      _this.mouseIsDown = true;

      UI.setCursor('drag');

      UI.captureMouse(_this);//, { "cursor": 'hand' });
    });

    $('#refImageScaleDecrease').on('click', function() {
      var scale = parseInt($('#refImageScale').val());
      scale -= 5;
      if(scale > 0) {
        $('#refImageScale').val(scale);
      }
      _this.showImage();        

    });

    $('#refImageCanvas').on('mouseenter', function(e) {
      UI.setCursor('can-drag');
    });


    $('#refImageScaleIncrease').on('click', function() {
      var scale = parseInt($('#refImageScale').val());
      scale += 5;
      if(scale > 0) {
        $('#refImageScale').val(scale);
      }
      _this.showImage();        

    });



    // brightness/contrast/saturation
    $('#refImageBrightness').on('change', function() {
      _this.brightness = $(this).val();


      $('#refImageBrightnessValue').val(_this.brightness);
      _this.showImage();
    });

    $('#refImageBrightness').on('input', function() {
      _this.brightness = $(this).val();



      $('#refImageBrightnessValue').val(_this.brightness);
      _this.showImage();
    });

    $('#refImageBrightnessValue').on('change', function() {
      _this.brightness = $(this).val();
      $('#refImageBrightness').val(_this.brightness);
      _this.showImage();

    });

    $('#refImageContrast').on('change', function() {
      _this.contrast = $(this).val();

      $('#refImageContrastValue').val(_this.contrast);
      _this.showImage();
    });

    $('#refImageContrast').on('input', function() {
      _this.contrast = $(this).val();

      $('#refImageContrastValue').val(_this.contrast);
      _this.showImage();
    });

    $('#refImageContrastValue').on('change', function() {
      _this.contrast = $(this).val();

      $('#refImageContrast').val(_this.contrast);
      _this.showImage();
    });



    $('#refImageSaturation').on('change', function() {
      _this.saturation = $(this).val();

      $('#refImageSaturationValue').val(_this.saturation);
      _this.showImage();
    });

    $('#refImageSaturation').on('input', function() {
      _this.saturation = $(this).val();
      $('#refImageSaturationValue').val(_this.saturation);
      _this.showImage();
    });


    $('#refImageSaturationValue').on('change', function() {
      _this.saturation = $(this).val();

      $('#refImageSaturation').val(_this.saturation);
      _this.showImage();
    });



    // color reduction

    $('#refImageColorReduction').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });

    $('#refImageLimitPerCell').on('click', function() {
      _this.setColorReductionParams();
      _this.showImage();

    });

    $('#refImageDither').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });

    $('#refImageDitherThreshold').on('change', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });
    $('#refImageDitherThreshold').on('keyup', function() {
      _this.setColorReductionParams();
      _this.showImage();
    });



    $('#refImageUseColors').on('change', function(event) {
      _this.useColors = $(this).val();
      if(_this.useColors == 'all') {
        $('#refImageChooseColorsRow').hide();
        $('#refImageCreatePalette').hide();
      } else if(_this.useColors == 'greyscale') {
        $('#refImageChooseColorsRow').hide();
        $('#refImageCreatePalette').hide();
      } else if(_this.useColors == 'choose') {
        $('#refImageChooseColorsRow').show();
        $('#refImageCreatePalette').hide();
      } else {
        $('#refImageChooseColorsRow').hide();
        $('#refImageCreatePalette').hide();
      }

      _this.showImage();

    });

    var chooseColorsCallback = function(chosenColors) {

      console.log('choose colours callback!!!');

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
      $('#refImageChooseColorsCount').html(html);

      _this.showImage();
    }

    $('#refImageChooseColors').on('click', function() {
      _this.editor.chooseColorsDialog.show({ callback: chooseColorsCallback});
    });


    document.getElementById('refLayerSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('refLayerSourceFile').files[0];
      _this.chooseImage(file);
    });
*/


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

    $('input[name=layerDialogTileSet]').on('click', function() {
      _this.setChooseTileSetVisibility();
    });

    $('input[name=layerDialogColorPalette]').on('click', function() {
      _this.setChooseColorPaletteVisibility();
    });


    if($('#layerDialogChooseTileSetButton').length > 0) {
      $('#layerDialogChooseTileSetButton').on('click', function() {
        _this.chooseTileSet();

      });
    }

    if($('#layerDialogChooseColourPaletteButton').length > 0) {
      $('#layerDialogChooseColourPaletteButton').on('click', function() {
        _this.chooseColorPalette();
      });
    }

    $('#layersScreenMode').on('change', function() {
      _this.setScreenModeOptions();
    });

  },


  setChooseTileSetVisibility: function() {
    var choose = $('input[name=layerDialogTileSet]:checked').val();
    if(choose == 'new') {
      $('#layerDialogChooseTilesetHolder').show();
    } else {
      $('#layerDialogChooseTilesetHolder').hide();
    }
  },

  setChooseColorPaletteVisibility: function() {
    var choose = $('input[name=layerDialogColorPalette]:checked').val();
    if(choose == 'new') {
      $('#layerDialogChooseColorPaletteHolder').show();
    } else {
      $('#layerDialogChooseColorPaletteHolder').hide();
    }
  },

  chooseTileSet: function() {
    var _this = this;
    var args = {};
    if(this.mode == 'vector') {
      args.type = 'vector';
    } else {
      args.type = 'character';
    }

    args.createOnLoad = true;
    
    args.callback = function(args) { //type, tileSetId, description) {
      
      var type = args.type;
      var tileSetId = args.presetId;
      var description = args.description;

      _this.tileSetCreated = args.tileSetCreated;
      _this.tileSet = args.tileSet;
      _this.tileSetMode = args.mode;
      _this.tileSetType = args.type;
      if(args.type == 'vector') {
        _this.tileSetPresetId = 'vector:' + args.presetId;
        $('#layersScreenMode').val('vector');
      } else {
        _this.tileSetPresetId = args.presetId;
        if($('#layersScreenMode').val() == 'vector') {
          $('#layersScreenMode').val('textmode');
        }
      }
      _this.setScreenModeOptions();

      if(description && description.name) {
        _this.tileSetName = description.name;
      } else {
        _this.tileSetName = args.presetId;
      }

      if(description) {
        var width = description.width;
        var height = description.height;
        $('#layerDialogNewTileSet').html(description.name);
      } else {
        $('#layerDialogNewTileSet').html(args.presetId);

      }

    }

    var tileSetManager = g_app.textModeEditor.tileSetManager;
    var dialog = tileSetManager.getChoosePresetDialog();
    dialog.show(args);
  },

  chooseColorPalette: function() {
    var _this = this;
    var args = {};
    args.setColorPalette = false;
    args.createOnLoad = true;

    args.callback = function(args) {//presetId, description) {
      var description = args.description;
      _this.colorPaletteCreated = args.colorPaletteCreated;

      if(!args.colorPaletteCreated) {
        _this.colorPalettePresetId = args.presetId;
        _this.newColorPalette = null;
      } else {
        _this.colorPalettePresetId = false;
        _this.newColorPalette = args.colorPalette;
      }
      _this.colorPaletteName = description.name;

      if(description) {
        $('#layerDialogNewColorPalette').html(description.name);
      }

//      _this.choosePreset(presetId, args);
    }

    var colorPaletteManager = g_app.textModeEditor.colorPaletteManager;
    var dialog = colorPaletteManager.getChoosePresetDialog();
    dialog.show(args);

  },


  setBackgroundColor: function(color) {
    this.backgroundColor = color;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
//    $('#layerPropertiesDialogBackgroundColor').css('background-color', '#' + colorPalette.getHexString(color));


    if(this.backgroundColor !== this.editor.colorPaletteManager.noColor) {
      /*
      $('#layerPropertiesDialogBackgroundColor').html('');      
      $('#layerPropertiesDialogBackgroundColor').css('background-color', '#' + colorPalette.getHexString(this.backgroundColor));
      $('#layerPropertiesDialogBackgroundColor').css('background-image', "none");
      */

      var colorString = this.backgroundColor + '&nbsp;&nbsp; 0x' + ("00" + this.backgroundColor.toString(16)).substr(-2) + '&nbsp;&nbsp; #' + colorPalette.getHexString(this.backgroundColor);
      $('#layerPropertiesDialogBackgroundColorDescription').html(colorString);
      
      $('#layerProperties-backgroundColor').css('background-color', '#' + colorPalette.getHexString(this.backgroundColor));
      $('#layerProperties-backgroundColor').css('background-image', "none");
    } else {
      /*
      $('#layerPropertiesDialogBackgroundColor').css('background-color', '#000000');
      $('#layerPropertiesDialogBackgroundColor').html('<i style="font-size: 28px; margin-top: -1px" class="halflings halflings-remove"></i>');
      
      */
      $('#layerProperties-backgroundColor').css('background-color', 'transparent');
      $('#layerProperties-backgroundColor').css('background-image', "url('images/transparent.png')");
      $('#layerPropertiesDialogBackgroundColorDescription').html('Transparent');

    }
  },



  setBorderColor: function(color) {
    this.borderColor = color;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
//    $('#layerPropertiesDialogBackgroundColor').css('background-color', '#' + colorPalette.getHexString(color));


    if(this.borderColor !== this.editor.colorPaletteManager.noColor) {


      var colorString = this.borderColor + '&nbsp;&nbsp; 0x' + ("00" + this.borderColor.toString(16)).substr(-2) + '&nbsp;&nbsp; #' + colorPalette.getHexString(this.borderColor);
      $('#layerPropertiesDialogBorderColorDescription').html(colorString);


      
      $('#layerProperties-borderColor').css('background-color', '#' + colorPalette.getHexString(this.borderColor));
      $('#layerProperties-borderColor').css('background-image', "none");

    } else {
      $('#layerProperties-borderColor').css('background-color', 'transparent');

      $('#layerProperties-borderColor').css('background-image', "url('images/transparent.png')");
      $('#layerPropertiesDialogBorderColorDescription').html('Transparent');

    }
  },

/*

  setColorReductionParams: function() {
    this.useColors = $('#refImageUseColors').val();

//    this.colorReductionMethod = $('input[name=refImageColorReduction]:checked').val();
    this.colorReductionMethod = $('#refImageColorReduction').val();
    if(this.colorReductionMethod == 'dither') {
      $('#refImageDitherGroup').show();
    } else {
      $('#refImageDitherGroup').hide();
    }

    if(this.colorReductionMethod == 'edge') {
      $('#refImageEdgeDetectionGroup').show();
    } else {
      $('#refImageEdgeDetectionGroup').hide();
    }
    this.ditherMethod = $('#refImageDither').val();//$('input[name=refImageDither]:checked').val();

    this.limitColorsPerCell = $('#refImageLimitPerCell').is(':checked');

    if(this.colorReductionMethod == 'none') {
      $('#refImageUseColorsRow').hide();
    } else {
      $('#refImageUseColorsRow').show();
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



  setReferenceImage: function() {
    this.showImage({ drawBackground: false });
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
    
  },

  chooseImage: function(file) {
    if(!this.image) {
      this.image = new Image();
    }

//    this.initCanvas();


    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    this.image.src = src;

    var _this = this;
    this.image.onload = function() {
      _this.showImage();
    }
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
    $('#refImageX').val(x);

    var y = (this.canvasHeight - drawHeight) / 2;
    $('#refImageY').val(y);

    scale = scale * 100;

    $('#refImageScale').val(scale);
    this.showImage();
  },


  showImage: function(args) {
    if(!this.image) {
      return;
    }
//    console.log('draw ref image');


    var drawBackground = true;
    if(typeof args != 'undefined') {
      if(typeof args.drawBackground != 'undefined') {
        drawBackground = args.drawBackground;
      }
    }

    this.setColorReductionParams();

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    this.crosshairX = this.canvas.width / 2;
    this.crosshairY = this.canvas.height / 2;

    var drawWidth = this.image.naturalWidth;
    var drawHeight = this.image.naturalHeight;


    this.scale = parseInt($('#refImageScale').val());
    this.x = parseInt($('#refImageX').val());
    this.y = parseInt($('#refImageY').val());

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
//    

    if(drawBackground) {
      this.previewContext.drawImage(this.backgroundCanvas, 0, 0);
    } else {
      this.previewContext.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.save();

    this.context.translate(this.crosshairX, this.crosshairY); 
    this.context.scale(this.scale / 100, this.scale / 100);

    var imageX = this.x - this.crosshairX;
    var imageY = this.y - this.crosshairY;

    this.context.drawImage(this.image, imageX, imageY, drawWidth, drawHeight);


    this.context.translate(-this.crosshairX, -this.crosshairY); 
    this.context.restore();

    this.imageParametersEffect.setParameters({ brightness: this.brightness });        
    this.imageParametersEffect.setParameters({ contrast: this.contrast });        
    this.imageParametersEffect.setParameters({ saturation: this.saturation });        

    this.imageParametersEffect.setSource(this.canvas);
    this.imageParametersEffect.setDestination(this.canvas);
    this.imageParametersEffect.update();


//    this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     

    if(this.colorReductionMethod == 'closest' || this.colorReductionMethod == 'dither') {

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
        console.log('limit colors per cell');

        this.imageLib.setImageData(this.imageData);
        this.imageData = this.imageLib.reducePerCell();

        this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height);         

      } else {
        this.context.putImageData(this.imageData, 0, 0, 0, 0, this.canvas.width , this.canvas.height);         
      }
    }

    this.previewContext.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height,
      0, 0, this.previewCanvas.width, this.previewCanvas.height);


  },




  imageMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    console.log(wheel);

    this.scale = parseInt($('#refImageScale').val());

    console.log(this.scale);

    var newScale = this.scale - wheel.spinY * 8;//12;

    this.scale = newScale;

    $('#refImageScale').val(this.scale);    
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
      $('#refImageX').val(newOffsetX);

      var newOffsetY = this.currentOffsetY + diffY;
      $('#refImageY').val(newOffsetY);
      this.showImage();        
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  }

*/
}
