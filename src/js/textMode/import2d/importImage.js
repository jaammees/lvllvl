var ImportImage = function() {

  this.editor = null;
  this.importColorUtils = null;

  this.importSource = 'image';

  this.imageLib = null;

  this.multipleBackgroundColors = false;

  //this.charsImageData = null;
  this.basicImport = null;
  this.mobileImport = null;

  this.srcCanvas = null;
  this.srcContext = null;


  this.scrollbar2 = null;
  this.scrollbar1 = null;
  this.scrollbar3 = null;
  this.scrollbar4 = null;

  this.rangeCanvas = null;

  this.cacheCanvas = null;
  this.cacheContext = null;
  this.cacheImageX = false;
  this.cacheImageY = false;
  this.cacheDrawWidth = false;
  this.cacheDrawHeight = false;
  this.cacheScale = false;
  this.cacheCrosshairX = false;
  this.cacheCrosshairY = false;
  this.cacheRotateAmount = 0;

  this.disableCache = false;


  // copy of the current image at the desired scale
  this.imageCanvasScale = 0;
  this.imageCanvas = null;
  this.imageContext = null;

  this.progressCanvas = null;
  this.progressContext = null;

  // canvas in the import image dialog
  this.importImageCanvas = null;
  this.importImageContext = null;

  // checkerboard pattern
//  this.backgroundCanvas = null;

  this.importImage = null;
  this.importVideo = null;
  this.importingVideo = false;
  this.videoFrameReady = false;
  this.firstVideoFrame = true;


  this.imageData = null;

  // is import currently happening
  this.importInProgress = false;

  // is a frame currently being imported
  this.frameImportInProgress = false;


  this.frameCount = 20;

  this.videoSampleEvery = 400;
  this.videoStartAt = 0;



  this.importWidth = 320;
  this.importHeight = 200;

  this.imageScale = 100;

  // animate effect for import
  this.importImageAnimate = false;
  this.zoomAmount = 100;
//  this.zoomFrames = 10;

  this.currentZoom = 100;


  this.brightnessDelta = 0;
  this.contrastDelta = 0;
  this.saturationDelta = 0;


  this.previewNeedsUpdate = false;


  this.importImageMobile = null;
/*
  this.brightnessFrom = 0;
  this.brightnessTo = 0;
  this.contrastFrom = 0;
  this.contrastTo = 0;
  this.saturationFrom = 0;
  this.saturationTo = 0;
*/

  this.useColors = 'all';
  this.maxColors = 16;//32;

//  this.imagesImported = 0;

  this.frame = 0;

  this.rotateDelta = 30;
  this.rotateAmount = 0;

  this.imageColors = [];
  this.bgColors = [];

  this.customTileSet = [];
  this.customColorSet = [];


  this.brightness = 0;
  this.contrast = 0;
  this.saturation = 0;
  this.hue = 0;

  // using shader to to petscii

  this.useShader = true;
  this.useMobile = false;

  this.renderTargetWidth = false;
  this.renderTargetHeight = false;
  this.renderTarget = null;
  this.renderTargetScene = null;
  this.renderTargetCamera = null;
  this.renderTargetMaterial = null;
  this.renderTargetQuad = null;

  this.renderCanvas;
  this.renderContext;
  this.renderImageData;

  this.importCanvas = null;
  this.charCanvas = null;


  this.importColorPalette = [];
  this.createPaletteColorCount = 16;
  this.currentColorCount = false;

  this.previewAnimation = false;
  this.lastPreviewUpdate = 0;
  this.ticksPerFrame = 6;


  this.uiComponent = null;

  this.mouseIsDown = false;

  this.mirrorEffect = null;
  this.rotateZoomEffect = null;
  this.slitscanEffect = null;
  this.noiseEffect = null;
  this.imageParametersEffect = null;
  this.shaderEffects = null;
  this.shaderEffectsList = [];

  this.edgeDetect = false;

  this.insertFrames = false;

  this.colorReductionMethod = 'dither';
  this.ditherThreshold = 0;


  this.visible = false;

  this.imageSmoothing = false;
  this.invertColors = false;

  this.importImageScale = 100;

  this.imageX = 0;
  this.imageY = 0;
  this.backgroundColorType = 'perCell';


  this.mouseInPreview = false;

  this.midPointX = false;
  this.midPointY = false;

  this.chromaKeyEnabled = false;
  this.chromaChooseColor = false;

  this.importEffects = [
    {
      name: "Chroma Key",
      type: "shadereffect",
      enabled: false,      
      params: {
        r: { name: "Red", value: 0 },
        g: { name: "Green", value: 0 },
        b: { name: "Blue", value: 0 },

      }
    },    


    {
      name: "Pan",
      enabled: false,
      type: "rotatezoom",
      params: {
        h: { name: "Horizontal", value: 0, animated: true },
        v: { name: "Vertical", value: 0, animated: true }
      }
    },
    {
      name: "Zoom",
      enabled: false,
      type: "rotatezoom",
      params: {
        direction: { name: "Direction", type: "options", "options": ["In", "Out"], value: "In" },
        amountX: { name: "Amount X (%)", value: 1000 },
        amountY: { name: "Amount Y (%)", value: 1000 },
        infinite: { name: "Infinite Zoom", value: false, type: "checkbox" },
        layerAngleSeparation: { name: "Layer Angle Separation", value: 0}

      }
    },
    {
      name: "Rotate",
      enabled: false,
      type: "rotatezoom",
      params: {
        direction: { name: "Direction", type: "options", options: [ "Clockwise", "Anticlockwise", "Wiggle" ], value: "Clockwise"},
        wiggleAmount: { name: "Wiggle Amount", value: 15 }
      }
    },
    {
      name: "Slitscan",
      enabled: false,
      type: "slitscan",
      params: {
        slice: { name: "Slice", type: "options", options: [ "Horizontal", "Vertical" ], value: "Vertical"},
        sliceCount: { name: "Slice Count", value: 15 }
      }
    },

    {
      name: "Mirror",
      enabled: false,
      type: "mirror",
      params: {
        flip: {name: "Flip", type: "multioptions", options: [ "Horizontal", "Vertical" ]},
        mirror: {name: "Mirror", type: "multioptions", options: [ "Horizontal", "Vertical" ]},
      }
    },
    {
      name: "Brightness",
      enabled: false,
      type: "imageparams",
      params: {
        amount: {name: "Amount", value: 1, animated: true }
      }
    },
    {
      name: "Contrast",
      enabled: false,
      type: "imageparams",
      params: {
        amount: { name: "Amount", value: 1, animated: true }
      }
    },
    {
      name: "Saturation",
      type: "shadereffect",
      type: "imageparams",
      enabled: false,
      params: {
        amount: {name: "Amount", value: 1, animated: true }
      }
    },
    {
      name: "Hue/Saturation",
      type: "shadereffect",
      enabled: false,
      params: {

      }
    },
    {
      name: "Wobble",
      type: "shadereffect",
      enabled: false,
      params: {
        strength: { name: "Strength", type: "range", min: 0, max: 0.1, "value": 10 },
        size: { name: "Size", type: "range", min: 0, max: 30, value: 16 }

      }
    },
    {
      name: "Colour Cycle",
      type: "shadereffect",
      enabled: false,
      params: {
        amount: { name: "Amount", type: "range", min: 0.1, max: 1.0, value: 5 },
        offset: { name: "Offset", type: "range", min: 0, max: 2, value: 0 }

      }
    },


    {
      name: "Plasma",
      type: "shadereffect",
      enabled: false,
      params: {
        scale: { name: "Scale", value: 10 },
        amount: { name: "Amount", type: "range", value: 50, min: 0, max: 1 }
      }
    },


    {
      name: "Pixelate",
      type: "shadereffect",
      enabled: false,
      params: {
        initialX: { name: "Initial X", value: 10 },
        amountX: { name: "Amount X", value: 0, animated: true },

        initialY: { name: "Initial Y", value: 10 },
        amountY: { name: "Amount Y", value: 0, animated: true }


      }
    },

    {
      name: "Polar Pixelate",
      type: "shadereffect",
      enabled: false,
      params: {
        initialCircles: { name: "Initial Circles", type: "range", min: 0, max: 1, value: 10 },
        amountCircles: { name: "Amount Circles", value: 0, animated: true },

        initialSlices: { name: "Initial Slices", type: "range", min: 0, max: 1, value: 10 },
        amountSlices: { name: "Amount Slices", value: 0, animated: true },

      }
    },

    {
      name: "Hexagonal Pixelate",
      type: "shadereffect",
      enabled: false,
      params: {
        initial: { name: "Initial Value", value: 10, type: "range", min: 0, max: 80 },
        amount: { name: "Amount", value: 0, animated: true }

//        scale: { name: "Scale", value: 10, type: "range", min: 1, max: 80 }
      }
    },


    {
      name: "Diffusion",
      type: "shadereffect",
      enabled: false,
      params: {
        initial: { name: "Initial Value", value: 10, type: "range", min: 0, max: 0.4 },
        amount: { name: "Amount", value: 0, animated: true }

      }
    },

    {
      name: "Noise",
      enabled: false,
      type: "noise",
      params: {
        amount: {name: "Amount", value: 30 },
        density: {name: "Density", value: 75 }
      }
    },

  ];

}


ImportImage.prototype = {

  init: function(editor) {
    this.editor = editor;
    this.importColorUtils = new ImportColorUtils();
    this.importColorUtils.init(this.editor);

    this.imageLib = new ImageLib();

  },

  effectsHTML : function() {
    var html = '';
    for(var i = 0; i < this.importEffects.length; i++) {

      var name = this.importEffects[i].name;


      if(name != "Chroma Key") {
        if(name == 'Hue/Saturation') {
          name = 'Hue';
        }
        html += '<div class="importEffectContainer">';
        html += '  <div>';

  //      html += '    <label><input type="checkbox" id="importEffectCheckbox_' + i + '" class="importEffectCheckbox" data-effectId="' + i + '"/>' + name + '</label>';
        html += '    <label class="cb-container">';
        html += name;
        html += '<input type="checkbox" id="importEffectCheckbox_' + i + '" class="importEffectCheckbox" data-effectId="' + i + '"/>';
        html += '<span class="checkmark"></span>';
        html += '</label>';


        html += '  </div>';

        html += '<div id="importEffectParams_' + i + '" class="importEffectParamsContainer" style="display: none">';
        var params = this.importEffects[i].params;
  //      for(var j = 0; j < params.length; j++) {
        for(var key in params) {
          if(params.hasOwnProperty(key)) {
            var type = 'number';
            var param = params[key];

            if(typeof param.type != 'undefined') {
              type = param.type;          
            }

            html += '<div class="formRow">';
            html += '<label class="controlLabel" for="importEffect_' + i + '_param_' + key + '">' + param.name + '</label>';

            var value = 0;

            if(typeof param.value != 'undefined') {
              value = param.value;
            }

            if(type == 'number') {
              html += '<input type="text" class="number importEffectNumberParam" size="4" data-effectId="' + i + '" data-paramId="' + key + '" id="importEffect_' + i + '_param_' + key + '" value="' + value + '"/>';
            }

            if(type == 'range') {
              html += '<input type="text" class="number importEffectNumberParam" size="4" ';
              if(typeof param.min != 'undefined') {
                html += ' min="0" ';
              }
              if(typeof param.max != 'undefined') {
                html += ' max="100" ';
              }
              html += ' data-effectId="' + i + '" data-paramId="' + key + '" id="importEffect_' + i + '_param_' + key + '" value="' + value + '"/>';
            }


            if(type == 'checkbox') {
  //            html += '<input type="checkbox" class="importEffectCheckboxParam" data-effectId="' + i + '" id="importEffect_' + i + '_param_' + key + '" value="1"/>';
              html += '    <label class="cb-container">&nbsp;';

              html += '<input type="checkbox" class="importEffectCheckboxParam" data-effectId="' + i + '" id="importEffect_' + i + '_param_' + key + '" value="1"/>';
              html += '<span class="checkmark"></span>';
              html += '</label>';

            }

            if(type == 'options') {
              html += '<div style="display: inline-block">';
              for(var k = 0; k < param.options.length; k++) {
  /*              
                html += '<label><input type="radio" class="importEffectOptionsParam" data-effectId="' + i + '" value="' + param.options[k]  + '" name="importEffect_' + i + '_param_' + key + '" ';

                if(param.options[k] == value) {
                  html += ' checked="checked" ';
                }
                html += '>' + param.options[k] + '</label>';
  */
                html += '<label class="rb-container">';
                html +=  param.options[k];
                html += '<input type="radio" class="importEffectOptionsParam" data-effectId="' + i + '" value="' + param.options[k]  + '" name="importEffect_' + i + '_param_' + key + '" ';

                if(param.options[k] == value) {
                  html += ' checked="checked" ';
                }
                html += '/>';
                html += '<span class="checkmark"></span>';
                html += '</label>';
                html += '<br/>';
              }
              html += '</div>';
            }

            if(type == 'multioptions') {
              html += '<div style="display: inline-block">';
              for(var k = 0; k < param.options.length; k++) {
                //html += '<label><input type="checkbox" name="importEffect_' + i + '_param_' + key + '" class="importEffectMultiOptionsParam" data-effectId="' + i + '" value="' + param.options[k] + '">' + param.options[k] + '</label>';

              html += '    <label class="cb-container">';
              html +=  param.options[k];
              html += '<input type="checkbox" name="importEffect_' + i + '_param_' + key + '" class="importEffectMultiOptionsParam" data-effectId="' + i + '" value="' + param.options[k] + '"/>';
              html += '<span class="checkmark"></span>';
              html += '</label>';

                html += '<br/>';
              }
              html += '</div>';

            }


            if(typeof param.animated != 'undefined' && param.animated) {
              html += '&nbsp;';
              html += '<select class="importEffectNumberParam" data-effectId="' + i + '" data-paramId="' + key + '" id="importEffect_' + i + '_param_' + key + '_animateType">';
              html += '<option value="linear">Linear</option>';
              html += '<option value="sine">Sin</option>';
              html += '<option value="cosine">Cos</option>';
              html += '<option value="random">Random</option>';
              html += '</select>';
            }
            html += '</div>';

          }

        }
        html += '</div>';
        html += '</div>';
      }
    }


    $('#importImageEffectsHolder').html(html);


    UI.number.initControls('#importImageEffectsHolder .number');;
    var _this = this;
    $('.importEffectCheckbox').on('click', function() {
      var effectId = $(this).attr('data-effectId');
      _this.updateEffectSettings(effectId);
      _this.updateShaderEffects();
      _this.parameterChanged();      
    });

    $('.importEffectNumberParam').on('change', function() {
      var effectId = $(this).attr('data-effectId');
      var paramId = $(this).attr('data-paramId');
      _this.updateEffectSettings(effectId);
      _this.parameterChanged();      
    });

    $('.importEffectNumberParam').on('keyup', function() {
      var effectId = $(this).attr('data-effectId');
      var paramId = $(this).attr('data-paramId');
      _this.updateEffectSettings(effectId);
      _this.parameterChanged();      
    });


    $('.importEffectCheckboxParam').on('click', function() {
      var effectId = $(this).attr('data-effectId');
      var paramId = $(this).attr('data-paramId');
      _this.updateEffectSettings(effectId);
      _this.parameterChanged();      
    });

    $('.importEffectOptionsParam').on('click', function() {
      var effectId = $(this).attr('data-effectId');
      var paramId = $(this).attr('data-paramId');
      _this.updateEffectSettings(effectId);
      _this.parameterChanged();
    });

    $('.importEffectMultiOptionsParam').on('click', function() {
      var effectId = $(this).attr('data-effectId');
      var paramId = $(this).attr('data-paramId');
      _this.updateEffectSettings(effectId);
      _this.parameterChanged();


    });


  },


  updateShaderEffects: function() {
    var shaderEffectsList = [];
    for(var i = 0; i < this.importEffects.length; i++) {
      if(this.importEffects[i].type == 'shadereffect' && this.importEffects[i].enabled) {
        var params = {};
        for(var key in this.importEffects[i].params) {
          params[key] = this.importEffects[i].params[key].value;
        }

        shaderEffectsList.push({
          "effect": this.importEffects[i].name,
          "params": params
        });        
      }
    }


    var changed = false;
    if(this.shaderEffectsList.length != shaderEffectsList.length) {
      changed = true;
    } else {
      for(var i = 0; i < shaderEffectsList.length; i++) {
        if(this.shaderEffectsList[i].effect != shaderEffectsList[i].effect) {
          changed = true;
          break;
        }
      }
    }

    if(changed) {
      this.shaderEffectsList = shaderEffectsList;
      this.shaderEffects.setEffects(this.shaderEffectsList);
    }

  },

  updateEffectSettings: function(effectId) {
    if($('#importEffectCheckbox_' + effectId).is(':checked')) {
      //$('#importEffectParams_' + effectId).show();
      $('#importEffectParams_' + effectId).slideDown(200);
      this.importEffects[effectId].enabled = true;

      // find the shader effect index
      var shaderEffectListIndex = false;
      if(this.importEffects[effectId].type == 'shadereffect') {
        for(var i = 0; i < this.shaderEffectsList.length; i++) {
          if(this.shaderEffectsList[i].effect == this.importEffects[effectId].name) {
            shaderEffectListIndex = i;
            break;

          }
        }
      }

//      for(var i = 0; i < this.importEffects[effectId].params.length; i++) {

      for(var key in this.importEffects[effectId].params) {
        if(this.importEffects[effectId].params.hasOwnProperty(key)) {
          var type = 'number';
          var param = this.importEffects[effectId].params[key];

          if(typeof this.importEffects[effectId].params[key].type != 'undefined') {
            type = this.importEffects[effectId].params[key].type;          
          }

          var animateType = 'none';
          if(typeof param.animated != 'undefined' && param.animated) {
            this.importEffects[effectId].params[key].animateType = $('#importEffect_' + effectId + '_param_' + key + '_animateType').val();
          }
          var value = '';
          if(type == 'number') {
            value = parseInt($('#importEffect_' + effectId + '_param_' + key).val(), 10);
          } else if(type == 'range') {
            value = parseInt($('#importEffect_' + effectId + '_param_' + key).val(), 10);
            var min = this.importEffects[effectId].params[key].min;
            var max = this.importEffects[effectId].params[key].max;
            value = min + (max - min) * value / 100;

          } else if(type == 'checkbox') {
            value = $('#importEffect_' + effectId + '_param_' + key).is(':checked');
          } else if(type == 'options') {
            value = $('input[name=importEffect_' + effectId + '_param_' + key + ']:checked').val();
          } else if(type == 'multioptions') {
            value = [];

            $('input[name=importEffect_' + effectId + '_param_' + key + ']:checked').each(function() {
              value.push($(this).val());
            });
            /*
            for(var i = 0; i < checked.length; i++) {
              value.push(checked[i].val());
            }
            */
//            value = $('input[name=importEffect_' + effectId + '_param_' + key + ']:checked').val();
          }
          this.importEffects[effectId].params[key].value = value;
          if(shaderEffectListIndex !== false) {
            this.shaderEffectsList[shaderEffectListIndex].params[key] = value;
          }
        }
      }
    } else {
      this.importEffects[effectId].enabled = false;
//      $('#importEffectParams_' + effectId).hide();
      $('#importEffectParams_' + effectId).slideUp();
    }
  },




  initEffects: function() {
    if(this.mirrorEffect == null) {
      this.mirrorEffect = new MirrorEffect();
    }

    if(this.rotateZoomEffect == null) {
      this.rotateZoomEffect = new RotateZoomEffect();
    }

    if(this.slitscanEffect == null) {
      this.slitscanEffect = new SlitscanEffect();
    }

    if(this.noiseEffect == null) {
      this.noiseEffect = new NoiseEffect();
    }

    if(this.imageParametersEffect == null) {
      this.imageParametersEffect = new ImageParametersEffect();
    }

    if(this.shaderEffects == null) {
      this.shaderEffects = new ImageShaderEffects();
      this.shaderEffects.init();
    }


  },


  htmlComponentLoaded: function() {
    this.componentsLoaded++;
    if(this.componentsLoaded == 4) {
      this.splitPanel.setPanelVisible('east', true);
      this.splitPanel.resize();

//multirange(document.getElementById('importImageVideoRange'));

      this.initContent();
      this.initEvents();

      this.initRangeControl();

      this.drawRangeControl();
      this.effectsHTML();


      // set up the scrollbars..
      if (!Modernizr.cssscrollbar) {
        this.scrollbar1 = new PerfectScrollbar('#importImageHolder');
        this.scrollbar2 = new PerfectScrollbar('#importEffectsHolder');
        this.scrollbar3 = new PerfectScrollbar('#importImageAllSettings');
        this.scrollbar4 = new PerfectScrollbar('#importImageFramesHolder');
      }

      if(this.dialogReadyCallback !== false) {
        this.dialogReadyCallback();
      }
    }
  },

  updateScrollbars: function() {
    if(this.scrollbar1 && this.scrollbar2 && this.scrollbar3 && this.scrollbar4) {
      this.scrollbar1.update();      
      this.scrollbar2.update();      
      this.scrollbar3.update();      
      this.scrollbar4.update();      
    }

  },


  initRangeControl: function() {
    var _this = this;
    if(g_app.isMobile()) {

      this.rangeCanvas = document.getElementById('importImageVideoRangeMobile');
    } else {
      this.rangeCanvas = document.getElementById('importImageVideoRange');

    }
    this.rangeContext = this.rangeCanvas.getContext('2d');

    this.rangeMaxValue = 600;    
    this.rangeStartValue = 40;
    this.rangeEndValue = 100;

    $('#importImageVideoRange').on('mousedown', function(event) {
      _this.rangeMouseDown(event);
    });

  },

  setVideoImportFrom: function(importFrom) {
    if(g_app.isMobile()) {
      importFrom = parseFloat(importFrom);
      this.rangeStartValue = importFrom;
      $('#importImageMobileStartTime').val(importFrom);
      $('#importImageMobileStartTimeValue').val(importFrom);
      this.drawRangeControl();
    } else {
      $('#importImageVideoStartAt').val(importFrom);
      this.rangeStartValue = importFrom;
      this.drawRangeControl();
    }
    this.setVideoImportParams();

  },

  setVideoImportTo: function(importTo) {
    if(g_app.isMobile()) {
      importTo = parseFloat(importTo);
      $('#importImageMobileEndTime').val(importTo);
      $('#importImageMobileEndTimeValue').val(importTo);
      this.rangeEndValue = importTo;
      this.drawRangeControl();

    } else {
      $('#importImageVideoEndAt').val(importTo);
      this.rangeEndValue = importTo;
      this.drawRangeControl();

    }
    this.setVideoImportParams();

  },

  rangeMouseDown: function(event) {

    var x = event.pageX - $('#importImageVideoRange').offset().left;
    var y = event.pageY - $('#importImageVideoRange').offset().top;

//    var x = event.offsetX;
//    var y = event.offsetY;    

    this.mouseDownAtX = event.pageX;
    this.mouseDownAtY = event.pageY;


    this.mouseDownInRange = false;
    this.mouseDownRangeStart = false;
    this.mouseDownRangeEnd = false;

//    x += 10;

    if(x < this.rangeStartPosition && x > this.rangeStartPosition - 6) {
      this.mouseDownInRange = true;
      this.mouseDownRangeStart = true;
      this.rangeStartMouseDownPosition = this.rangeStartPosition;
      UI.captureMouse(this, { "cursor": 'ew-resize' } );
    }

    if(x > this.rangeEndPosition && x < this.rangeEndPosition + 6) {
      this.mouseDownInRange = true;
      this.mouseDownRangeEnd = true;
      this.rangeEndMouseDownPosition = this.rangeEndPosition;
      UI.captureMouse(this, { "cursor": 'ew-resize' });
    }
  },

  rangeMouseMove: function(event) {

//    var x = event.pageX;
//    var y = event.pageY;

    var x = event.pageX - $('#importImageVideoRange').offset().left;
    var y = event.pageY - $('#importImageVideoRange').offset().top;


    var diffX = event.pageX - this.mouseDownAtX;
    var diffY = event.pageY - this.mouseDownAtY;

    if(x < this.rangeStartPosition && x > this.rangeStartPosition - 6) {
      // mouse is over move left
      UI.setCursor('ew-resize');      
    } else if(x > this.rangeEndPosition && x < this.rangeEndPosition + 6) {
      // mouse is over move
      UI.setCursor('ew-resize');      
    } else {
      if(!this.mouseInPreview && !this.mouseIsDown) {
        UI.setCursor('default');
      }
    }


    if(this.mouseDownRangeStart) {
      this.rangeStartPosition = this.rangeStartMouseDownPosition + diffX;
      this.rangeStartValue = ( (this.rangeStartPosition - 10) / this.rangeControlWidth) * this.rangeMaxValue;
      if(this.rangeStartValue < 0) {
        this.rangeStartValue = 0;
      }

      if(this.rangeStartValue > this.rangeEndValue) {
        this.rangeStartValue = this.rangeEndValue;
      }
      UI.setCursor('ew-resize');      

      this.setVideoImportFrom(this.rangeStartValue);
    }

    if(this.mouseDownRangeEnd) {
      this.rangeEndPosition = this.rangeEndMouseDownPosition + diffX;
      this.rangeEndValue = ( (this.rangeEndPosition - 10) / this.rangeControlWidth) * this.rangeMaxValue;

      if(this.rangeEndValue > this.rangeMaxValue) {
        this.rangeEndValue = this.rangeMaxValue;
      }

      if(this.rangeEndValue < this.rangeStartValue) {
        this.rangeEndValue = this.rangeStartValue;
      }
      UI.setCursor('ew-resize');      

      this.setVideoImportTo(this.rangeEndValue);

    }


  },

  rangeMouseUp: function(event) {
    this.mouseDownInRange = false;
    this.mouseDownRangeStart = false;
    this.mouseDownRangeEnd = false;
  },
  drawRangeControl: function() {
    var vPadding = 2;
    if(this.rangeCanvas == null) {
      return;
    }
    var controlWidth = this.rangeCanvas.width;
    var controlHeight = this.rangeCanvas.height;

    this.rangeContext.clearRect(0, 0, this.rangeCanvas.width, this.rangeCanvas.height);

    this.rangeControlWidth = controlWidth - 20;
    // draw rect that represents whole range
    this.rangeContext.fillStyle= '#292929';
    this.rangeContext.fillRect(10, vPadding, this.rangeControlWidth, controlHeight - (vPadding * 2));

    // get the start position
    this.rangeStartPosition = 10 + (this.rangeStartValue / this.rangeMaxValue) * this.rangeControlWidth;
    this.rangeEndPosition = 10 + (this.rangeEndValue / this.rangeMaxValue) * this.rangeControlWidth;

    // draw the selectedRange
    this.rangeContext.fillStyle= '#444444';
    this.rangeContext.fillRect(this.rangeStartPosition, vPadding, this.rangeEndPosition - this.rangeStartPosition, controlHeight - (vPadding * 2));


    var controlHandleWidth = 6;
    var controlHandleHeight = 8;

    this.rangeContext.fillStyle= '#aaaaaa';

    // control handle
    if(!g_app.isMobile()) {
      /*
      this.rangeContext.fillRect(this.rangeStartPosition - controlHandleWidth, (controlHeight - controlHandleHeight) / 2, 
                                  controlHandleWidth, controlHandleHeight);
      */

      this.rangeContext.beginPath();
      this.rangeContext.moveTo(this.rangeStartPosition - controlHandleWidth, (controlHeight - controlHandleHeight) / 2);
      this.rangeContext.lineTo(this.rangeStartPosition, controlHeight / 2);
      this.rangeContext.lineTo(this.rangeStartPosition - controlHandleWidth, (controlHeight + controlHandleHeight) / 2);
      this.rangeContext.fill();


    }

    this.rangeContext.fillRect(this.rangeStartPosition, vPadding, 1, controlHeight - (vPadding * 2));



    // control handle
    if(!g_app.isMobile()) {
      this.rangeContext.beginPath();
      this.rangeContext.moveTo(this.rangeEndPosition + 1, (controlHeight) / 2);
      this.rangeContext.lineTo(this.rangeEndPosition + 1 + controlHandleWidth, (controlHeight - controlHandleHeight) / 2);
      this.rangeContext.lineTo(this.rangeEndPosition + 1 + controlHandleWidth, (controlHeight + controlHandleHeight) / 2);
      this.rangeContext.fill();

      /*
      this.rangeContext.fillRect(this.rangeEndPosition + 1, (controlHeight - controlHandleHeight) / 2, 
                                  controlHandleWidth, controlHandleHeight);
      */                                  
    }

    this.rangeContext.fillRect(this.rangeEndPosition, vPadding, 1, controlHeight - (vPadding * 2));

    // draw where video is up to 
    if(this.importVideo != null && typeof this.importVideo.currentTime  != 'undefined') {
      var videoMs = this.importVideo.currentTime * 1000;

//      this.rangeStartValue = ( (this.rangeStartPosition - 10) / this.rangeControlWidth) * this.rangeMaxValue;
      var playheadPos = 10 + (videoMs / this.rangeMaxValue) * this.rangeControlWidth;
      this.rangeContext.fillStyle= '#dddddd';
      this.rangeContext.fillRect(playheadPos, vPadding, 1, controlHeight - (vPadding * 2));
    }


  },

  start: function(args) {


    this.dialogReadyCallback = false;

    if(typeof args != 'undefined') {
      if(typeof args.dialogReadyCallback != 'undefined') {
        this.dialogReadyCallback = args.dialogReadyCallback;
      }
    }

    // stop play
    this.editor.frames.stop();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var tileSet = layer.getTileSet();

    this.importWidth = layer.getGridWidth() * layer.getCellWidth();
    this.importHeight = layer.getGridHeight() * layer.getCellHeight();

    this.initEffects();
    this.initSrcCanvas();

    if(!this.shaderImport) {
      this.shaderImport = new ShaderImport2();
      this.shaderImport.init(this.editor);
    }

    if(!this.mobileImport) {
      this.mobileImport = new MobileImport();
      this.mobileImport.init(this.editor);
    }


    if(UI.isMobile.any()) {
      this.useMobile = true;
      this.useShader = false;
    } else {

      if($('#importImageMethod').val() == 'method2') {
        this.useMobile = true;
        this.useShader = false;
      } else if($('#importImageMethod').val() == 'method1') {
        this.useMobile = false;
        this.useShader = true;
      } else {
        this.useMobile = true;
        this.useShader = false;  
      }
    }



    if(g_app.isMobile()) {
//    if(this.useMobile) {
      if(this.importImageMobile == null) {
        this.importImageMobile = new ImportImageMobile();
        this.importImageMobile.init(this.editor, this);
      }

      this.importImageMobile.show();
      return;
    }

    var _this = this;
    
    this.componentsLoaded = 0;


    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "importImageDialog", "title": "Import Image", "width": 900, "height": 640 });

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "importImageSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.animPanel = UI.create("UI.SplitPanel", { "id": "importImageAnimPanel"});
      this.animPanel.on('resize', function() {
        _this.updateScrollbars();
      });

      this.splitPanel.addEast(this.animPanel, 260);

      this.framesPanel = UI.create("UI.HTMLPanel");
      this.animPanel.addNorth(this.framesPanel, 190);
      this.framesPanel.load('html/textMode/importImageFrames.html', function() {
        _this.htmlComponentLoaded();
      });
      this.framesPanel.on('resize', function() {
        _this.updateScrollbars();
      });


      this.effectsPanel = UI.create("UI.HTMLPanel");
      this.animPanel.add(this.effectsPanel);
      this.effectsPanel.load('html/textMode/importImageEffects.html', function() {
        _this.htmlComponentLoaded();
      });
      this.effectsPanel.on('resize', function() {
        _this.updateScrollbars();
      });



      this.innerSplitPanel = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.innerSplitPanel);


      this.importSourcePanel = UI.create("UI.HTMLPanel");
      this.innerSplitPanel.addNorth(this.importSourcePanel, 336);
      this.importSourcePanel.load('html/textMode/importImage.html', function() {
        _this.htmlComponentLoaded();
      });
      this.innerSplitPanel.on('resize', function() {
        _this.updateScrollbars();
      });

      this.converterSettingsPanel = UI.create("UI.HTMLPanel");
      this.innerSplitPanel.add(this.converterSettingsPanel);
      this.converterSettingsPanel.load('html/textMode/importImageConverterSettings.html', function() {
        _this.htmlComponentLoaded();
      });
      this.converterSettingsPanel.on('resize', function() {
        _this.updateScrollbars();
      });

      this.okButton = UI.create('UI.Button', { "text": 'Import', "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        UI.closeDialog();
        _this.frame = 0;
        _this.showProgress();

        setTimeout(function() {
          _this.startImport();
        }, 10);
        /*
        if(_this.startImport()) {
          UI.closeDialog();
        }
        */
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
//        alert('close');
        _this.visible = false;
      });

    } else {
      _this.initContent();
      if(_this.dialogReadyCallback !== false) {
        _this.dialogReadyCallback();
      }
    }

    if(!this.visible) {
      UI.showDialog("importImageDialog");
    }
    this.visible = true;

  },


  setUseEffects: function(useEffects) {
    this.useEffects = useEffects;
    var frameCount = parseInt($('#importImageFrames').val());    

    if(this.useEffects) {
      $('#importImagePreviewAnimationRow').hide();
      $('#importImageEffectsBorder').show();
      $('#importImageEffectsHolder').show();
      if(frameCount <= 1) {
        $('#importImageFrames').val(12);
      }

    } else {
      $('#importImagePreviewAnimationRow').hide();
      $('#importImageEffectsBorder').hide();
      $('#importImageEffectsHolder').hide();

      if(this.importSource != 'video') {
        $('#importImageFrames').val(1);
      }


    }

    this.setAnimationParameters();
    this.updateAnimateSettings();

  },



  updateAnimateSettings: function() {    


//    this.importImageAnimate = $('input[name=importImageWithFrames]:checked').val() == "on";

    this.importImageAnimate = true;
    this.previewAnimation = ($('#importImagePreviewAnimation').is(':checked')) && this.importImageAnimate;

    this.insertFrames = $('#importImageInsertFrames').is(':checked');        


    if(this.importImageAnimate) {

    }


    this.parameterChanged();

  },

  initContent: function() {

    var _this = this;
    this.mouseDownAtX = 0;
    this.mouseDownAtY = 0;
    this.mouseIsDown = false;
    this.currentOffsetX = 0;
    this.currentOffsetY = 0;

    if(!this.basicImport) {
      this.basicImport = new BasicImport();
      this.basicImport.init(this.editor);
    }

    if(!this.mobileImport) {
      this.mobileImport = new MobileImport();
      this.mobileImport.init(this.editor);
    }


    if(UI.isMobile.any()) {
      this.useMobile = true;
      this.useShader = false;
    }

    this.setColorReductionParams();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      this.backgroundColor = layer.getBackgroundColor();
    }

    var layerMode = layer.getMode();

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = layer.getTileSet();


    this.characters = [];
    for(var i = 0; i < 256; i++) {
      this.characters.push(i);
    }
    this.charactersHasSpace = true;
    this.charactersHasBlock = true;

    this.initColors();


    var scale = parseInt($('#importImageScale').val(), 10);
    if(!isNaN(scale)) {
      this.importImageScale = scale;
    } else {
      this.importImageScale = 100;
      $('#importImageScale').val(100);
    }

    this.edgeDetect = $('#importImageEdgeDetect').is(':checked');
    this.edgeDetectLowThreshold = $('#importImageEdgeDetectLow').val();
    this.edgeDetectHighThreshold = parseInt($('#importImageEdgeDetectHigh').val(), 10);
    this.edgeDetectBlurRadius = parseInt($('#importImageEdgeDetectBlur').val(), 10);
    this.edgeDetectLineThickness = parseInt($('input[name=importImageEdgeDetectLineThickness]:checked').val(), 10);

    if(layerMode == TextModeEditor.Mode.C64STANDARD) {
      this.backgroundColorType = 'frame';
      $('#importImageBGSettingsC64Standard').show();
      $('#importImageBGSettings').hide();
    } else {
      this.backgroundColorType =  $('#importImageBackgroundColorType').val();
      $('#importImageBGSettingsC64Standard').hide();
      $('#importImageBGSettings').show();
    }
    this.setBackgroundColorChoose($('#importImageBackgroundColorChoose').val());


    if(this.backgroundColorType == 'frame') {
      $('#importFrameBGSettings').show();
    } else {
      $('#importFrameBGSettings').hide();
    }

    var midPointX = Math.floor(layer.getGridWidth() * layer.getCellWidth() / 2);
    var midPointY = Math.floor(layer.getGridHeight() * layer.getCellHeight() / 2);

    if(this.midPointY != midPointY || this.midPointX != midPointX) {
      this.midPointX = midPointX;
      this.midPointY = midPointY;
      $('#imageImportZoomX').val(midPointX);
      $('#imageImportZoomY').val(midPointY);
    }

    this.imageX = parseFloat($('#importImageX').val());
    this.imageY = parseFloat($('#importImageY').val());
    this.crosshairX = $('#imageImportZoomX').val();
    this.crosshairY = $('#imageImportZoomY').val();

    this.updateAnimateSettings();
    this.setAnimationParameters();
    this.setVideoImportParams();


    this.initCanvas();
    this.parameterChanged();

//    this.showImportImage();
    this.uiComponent.fitContent();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      reutrn;
    }

    if(layer.getReferenceImageData()) {
      $('#importImageUseReferenceImage').show();
    } else {
      $('#importImageUseReferenceImage').hide();
    }

//    this.parameterChanged();

  },

  initEvents: function() {
    var _this = this;

    $('#importImagePanel').on('mousemove', function(event) {
      _this.mouseMove(event);
    });


    $('#importImageChooseFile').on('click', function() {
      $('#importImageSourceFile').click();
    });


    $('#importImageMethod').on('change', function() {
      var method = $(this).val();
      if(method == 'method2') {
        _this.useMobile = true;
        _this.useShader = false;
      } else if(method == 'method1') {
        _this.useMobile = false;
        _this.useShader = true;
      }
    });


    // Edge detection
    $('#importImageEdgeDetect').on('click', function() {
      _this.edgeDetect = $('#importImageEdgeDetect').is(':checked');
      _this.parameterChanged();
    });

    $('#importImageEdgeDetectLow').on('change', function() {
      _this.edgeDetectLowThreshold = parseInt($(this).val(), 10);
      _this.parameterChanged();
    });

    $('#importImageEdgeDetectLow').on('keyup', function() {
      _this.edgeDetectLowThreshold = parseInt($(this).val(), 10);
      _this.parameterChanged();
    })

    $('#importImageEdgeDetectHigh').on('change', function() {
      _this.edgeDetectHighThreshold = parseInt($(this).val(), 10);
      _this.parameterChanged();
    });

    $('#importImageEdgeDetectHigh').on('keyup', function() {
      _this.edgeDetectHighThreshold = parseInt($(this).val(), 10);
      _this.parameterChanged();
    })

    $('#importImageEdgeDetectBlur').on('change', function() {
      _this.edgeDetectBlurRadius = parseInt($(this).val(), 10);
      _this.parameterChanged();
    });

    $('#importImageEdgeDetectBlur').on('keyup', function() {
      _this.edgeDetectBlurRadius = parseInt($(this).val(), 10);
      _this.parameterChanged();
    });

    $('input[name=importImageEdgeDetectLineThickness]').on('click', function() {
      _this.edgeDetectLineThickness = parseInt($('input[name=importImageEdgeDetectLineThickness]:checked').val(), 10);
      _this.parameterChanged();
    });


    // image position
    $('#importImageX').on('keyup', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.imageX = value;
        _this.parameterChanged();
      }
    });

    $('#importImageX').on('change', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.imageX = value;
        _this.parameterChanged();
      }
    });


    $('#importImageY').on('keyup', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.imageY = value;
        _this.parameterChanged();
      }
    });

    $('#importImageY').on('change', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.imageY = value;
        _this.parameterChanged();
      }
    });




    // brightness/contrast/saturation
    $('#importImageBrightness').on('change', function() {
      _this.brightness = $(this).val();

      $('#importImageBrightnessValue').val(_this.brightness);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });

    $('#importImageBrightness').on('input', function() {
      _this.brightness = $(this).val();

      $('#importImageBrightnessValue').val(_this.brightness);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });

    $('#importImageBrightnessValue').on('change', function() {
      _this.brightness = $(this).val();
      $('#importImageBrightness').val(_this.brightness);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }

    });

    $('#importImageContrast').on('change', function() {
      _this.contrast = $(this).val();

      $('#importImageContrastValue').val(_this.contrast);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });

    $('#importImageContrast').on('input', function() {
      _this.contrast = $(this).val();

      $('#importImageContrastValue').val(_this.contrast);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });

    $('#importImageContrastValue').on('change', function() {
      _this.contrast = $(this).val();

      $('#importImageContrast').val(_this.contrast);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });



    $('#importImageSaturation').on('change', function() {
      _this.saturation = $(this).val();

      $('#importImageSaturationValue').val(_this.saturation);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });

    $('#importImageSaturation').on('input', function() {
      _this.saturation = $(this).val();
      $('#importImageSaturationValue').val(_this.saturation);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });


    $('#importImageSaturationValue').on('change', function() {
      _this.saturation = $(this).val();

      $('#importImageSaturation').val(_this.saturation);
      if(_this.importSource != 'video') {
        _this.parameterChanged();
      }
    });



    $('#importImageCanvas').on('wheel', function(event) {
      _this.imageMouseWheel(event.originalEvent);
    });

    $('#importImageCanvas').on('mouseenter', function(event) {
      UI.setCursor('can-drag-scroll');

    });

    $('#importImageCanvas').on('mouseleave', function(event) {
//      UI.setCursor('default');
      _this.mouseInPreview = false;
    });

    $('#importImageCanvas').on('mousemove', function(e) {
      UI.setCursor('can-drag-scroll');
      _this.mouseInPreview = true;
      e.preventDefault();
    });
    $('#importImageCanvas').on('mousedown', function(e) {
      var x = e.offsetX;
      var y = e.offsetY;

      _this.movingImage = false;

      _this.mouseDownAtX = e.pageX;//e.clientX;
      _this.mouseDownAtY = e.pageY;//e.clientY;
      _this.currentOffsetX = parseInt($('#importImageX').val());
      _this.currentOffsetY = parseInt($('#importImageY').val());

      if(_this.chromaChooseColor) {
        _this.chooseChromaColorClick(e);
        _this.chromaChooseColor = false;
        return
      }

      _this.mouseIsDown = true;
//    UI.captureMouse(this, {"cursor": 'url(cursors/closedhand.png) 2 14, pointer'});

      UI.setCursor('drag-scroll');
      UI.captureMouse(_this, {"cursor": 'url(cursors/closedhand.png) 2 14, pointer'});
    });


    $('#importImageInverColors').on('click', function() {
      _this.setInvertColors();
    });

    $('#importImageSmoothing').on('click', function() {
      _this.setSmoothingMethod();
    });


    // image scale
    $('#importImageScale').on('keyup', function() {
      var scale = parseInt($(this).val(), 10);
      if(!isNaN(scale)) {
        _this.importImageScale = scale;
        _this.parameterChanged();
      }
    });



    $('#importImageScaleDecrease').on('click', function() {
      var scale = parseInt($('#importImageScale').val());
      if(isNaN(scale)) {
        return;
      }
      scale -= 5;
      if(scale > 0) {
        $('#importImageScale').val(scale);
      }
      _this.importImageScale = scale;
      _this.parameterChanged();

    });

    $('#importImageScaleIncrease').on('click', function() {
      var scale = parseInt($('#importImageScale').val());
      if(isNaN(scale)) {
        return;
      }
      scale += 5;
      if(scale > 0) {
        $('#importImageScale').val(scale);
      }
      _this.importImageScale = scale;
      _this.parameterChanged();

    });

    // scale image
    $('#importImageScaleToFit').on('click', function() {
      _this.scaleImageToFit();
    });


    $('#importImageColorReduction').on('change', function(event) {
      var method = $('#importImageColorReduction').val();
      _this.setColorReductionParams({ method: method});
      _this.parameterChanged();
    });

    $('#importImageBackgroundColorType').on('change', function(event) {
      _this.backgroundColorType = $(this).val();
      if(_this.backgroundColorType == 'frame') {
        $('#importFrameBGSettings').show();
      } else {
        $('#importFrameBGSettings').hide();
      }
    });


    $('#importImageBackgroundColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        var colorPalette = _this.editor.colorPaletteManager.getCurrentColorPalette();
        _this.backgroundColor = color;
        $('#importImageBackgroundColor').css('background-color', '#' + colorPalette.getHexString(color));

      }

      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.backgroundColor;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

/*

    $('#importImageBackgroundColor').on('click', function(event) {
      _this.editor.colorPickerPopupMenu.createColorPicker(function(color) {
//        _this.monochromeColor = color;
        var color = _this.editor.petscii.getColor(_this.monochromeColor);
        var colorHex = Number(color).toString(16);
        while (colorHex.length < 6) {
          colorHex = "0" + colorHex;
        }
        $('#importImageBackgroundColor').css('background-color', '#' + colorHex);


      });

      editor.showPopupMenu('colorPickerPopupMenu', function(item) {
      });      

    });
*/

/*
    $('#importImageLimitPerCell').on('click', function() {
      _this.setColorReductionParams();
      _this.parameterChanged();

    });
*/

    $('#importImageDither').on('change', function() {
      _this.setColorReductionParams();
      _this.parameterChanged();
    });

    $('#importImageDitherThreshold').on('change', function() {
      _this.setColorReductionParams();
      _this.parameterChanged();
    });
    $('#importImageDitherThreshold').on('keyup', function() {
      _this.setColorReductionParams();
      _this.parameterChanged();
    });


/*************************************/

    $('#importImageInsertFrames').on('click', function() {
      _this.updateAnimateSettings();
    });

    $('#importImageRotate').on('click', function() {
      _this.rotateAmount += 10;
      _this.parameterChanged();
    });

    $('input[name=importImageWithFrames]').on('click', function() {
      _this.updateAnimateSettings();

      _this.parameterChanged();

      _this.uiComponent.fitContent();
    });

    $('.importImageAnimationEffect').on('click', function() {
      _this.updateAnimateSettings();
    });

    $('#importImagePreviewAnimation').on('click', function() {
      _this.frame = 0;
      _this.lastPreviewUpdate = getTimestamp();

      _this.updateAnimateSettings();
    });


    $('#importImageUseEffects').on('click', function() {
      _this.setUseEffects($(this).is(':checked'));
    });

    // video import parameters
    $('#importImageVideoStartAt').on('keyup', function() {
      var startFrom = parseInt($(this).val());
      if(!isNaN(startFrom)) {
        _this.setVideoImportFrom(startFrom);
      }
//      _this.setVideoImportParams();
    });
    $('#importImageVideoStartAt').on('change', function() {
      var startFrom = parseInt($(this).val());
      if(!isNaN(startFrom)) {
        _this.setVideoImportFrom(startFrom);
      }

//      _this.setVideoImportParams();
    });

    $('#importImageVideoEndAt').on('change', function() {
      var endAt = parseInt($(this).val());
      if(!isNaN(endAt)) {
        _this.setVideoImportTo(endAt);
      }
    });

    $('#importImageVideoEndAt').on('change', function() {
      var endAt = parseInt($(this).val());
      if(!isNaN(endAt)) {
        _this.setVideoImportTo(endAt);
      }

    });


    $('input[name=importImageVideoPlayDirection]').on('click', function() {
      _this.setVideoImportParams();
    });
/*
    $('#importImageVideoImportFrames').on('keyup', function() {
      _this.setVideoImportParams();
    });
    $('#importImageVideoImportFrames').on('change', function() {
      _this.setVideoImportParams();
    });
*/

/*
    $('#importImageVideoImportSampleTime').on('keyup', function() {
      _this.setVideoImportParams();
    });
    $('#importImageVideoImportSampleTime').on('change', function() {
      _this.setVideoImportParams();
    });
*/

    /*
    $('#importImageVideoImportPlaybackSpeed').on('keyup', function() {
      _this.setVideoImportParams();
    });
    $('#importImageVideoImportPlaybackSpeed').on('change', function() {
      _this.setVideoImportParams();
    });
*/

    // universal animation parameters

    $('#importImageFrames').on('keyup', function() {
      _this.setAnimationParameters();
    });
    $('#importImageFrames').on('change', function() {
      _this.setAnimationParameters();
    });

    $('#importImageTicksPerFrame').on('keyup', function() {
      _this.setAnimationParameters();
    });

    $('#importImageTicksPerFrame').on('change', function() {
      _this.setAnimationParameters();
    });



    this.initEffectEvents();

    $('#importImageUseChars').on('change', function(event) {
      _this.useChars = $('#importImageUseChars').val();
      if(_this.useChars == 'all') {
        $('#importImageChooseCharsRow').hide();
      } else {
        _this.chooseCustomChars();
        $('#importImageChooseCharsRow').show();
      }
      _this.uiComponent.fitContent();

    });



    $('#importImageChromaKeying').on('click', function() {
      _this.setChromaKeyEnabled($(this).is(':checked'));
    });


    $('#importImageChromaKeyChooseColor').on('click', function() {
      _this.chromaChooseColorStart();
    });

/*
    $('input[name=importImageUseChars]').on('click', function() {
      _this.useChars = $('input[name=importImageUseChars]:checked').val();
      if(_this.useChars == 'all') {
        $('#importImageChooseCharsRow').hide();
      } else {
        $('#importImageChooseCharsRow').show();
      }
      _this.uiComponent.fitContent();

    });
*/


    $('#importImageChooseChars').on('click', function() {
      _this.chooseCustomChars();
    });


    $('#importImageUseColors').on('change', function(event) {
      var useColors = $('#importImageUseColors').val();
      _this.setUseColors(useColors);

    });

    $('#importImageCreatePaletteColorCount').on('change', function() {
      _this.createPaletteColorCount = parseInt($(this).val(), 10);

      _this.createImportColorPalette();
      _this.parameterChanged();
      _this.uiComponent.fitContent();
    });



    $('#importImageChooseColors').on('click', function() {
      //$('#chooseColorsDialog').show();
//      _this.editor.chooseColorsDialog.show({ callback: chooseColorsCallback, colors: _this.customColorSet });
      _this.chooseCustomColors();
    });

    $('#importImageBackgroundColorChoose').on('change', function() {
      _this.setBackgroundColorChoose($(this).val());
    });

    $('#importImageUseReferenceImage').on('click', function() {
      _this.setImportImageFromReferenceImage();
    });

    document.getElementById('importImageSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('importImageSourceFile').files[0];
      _this.setImportImage(file);
    });
  },

  chooseCustomChars: function() {
    var _this = this;

    var chooseCharsCallback = function(selectedCharacters) {
      _this.customTileSet = [];
      var count = 0;
      for(var i = 0; i < selectedCharacters.length; i++) {
        count++;
        _this.customTileSet.push(selectedCharacters[i]);        
      }
      
      var html = count + ' Character';
      if(count != 1) {
        html += 's';
      }
      html += ' Chosen';
      $('#importImageCharactersChosen').html(html);
    }

    this.editor.chooseCharactersDialog.show({ 
      callback: chooseCharsCallback, 
      chars: this.customTileSet 
    });
  },

  chooseCustomColors: function() {
    var _this = this;
    var chooseColorsCallback = function(chosenColors) {
      _this.customColorSet = [];
      var noColor = _this.editor.colorPaletteManager.noColor;

      var count = chosenColors.length;
      for(var i = 0; i < count; i++) {
        if(chosenColors[i] !== noColor) {
          _this.customColorSet.push(chosenColors[i]);
        }
      }

      var html = count;
      html += ' Colour';
      if(count != 1) {
        html += 's';
      }
      html += ' Chosen';
      $('#importImageColoursChosen').html(html);
      _this.parameterChanged();
    }


    this.editor.chooseColorsDialog.show({ 
      message: "Choose colours",
      callback: chooseColorsCallback, 
      colors: this.customColorSet 
    });
  },

  chromaChooseColorStart: function() {
    this.chromaChooseColor = true;

  },

  chooseChromaColorClick: function(event) {
    var x = event.pageX - $('#importImageCanvas').offset().left;
    var y = event.pageY - $('#importImageCanvas').offset().top;

    var imageData = this.importImageContext.getImageData(0, 0, this.importImageCanvas.width, this.importImageCanvas.height);     

    var data = imageData.data;
    var srcPos = x * 4 + y * this.importImageCanvas.width * 4;

    var r = data[srcPos++] / 255;
    var g = data[srcPos++] / 255;
    var b = data[srcPos++] / 255;

    this.setChromaKeyColor(r, g, b);
    this.chromaChooseColor = false;    
  },

  setChromaKeyEnabled: function(enabled) {
    this.chromaKeyEnabled = enabled;

    for(var i = 0; i < this.importEffects.length; i++) {

      var name = this.importEffects[i].name;
      if(name === "Chroma Key") {    
        this.importEffects[i].enabled = enabled;
        break;
      }
    }

    this.updateShaderEffects();
    this.parameterChanged();         

//    this.setChromaKeyColor(0, 0, 0);
  },



  setChromaKeyColor: function(r, g, b) {

    for(var i = 0; i < this.importEffects.length; i++) {

      var name = this.importEffects[i].name;
      if(name === "Chroma Key") {    
        this.importEffects[i].params["r"].value = r;
        this.importEffects[i].params["g"].value = g;
        this.importEffects[i].params["b"].value = b;

        break; 
      }
    }

    for(var i = 0; i < this.shaderEffectsList.length; i++) {
      if(this.shaderEffectsList[i].effect == 'Chroma Key') {
        this.shaderEffectsList[i].params["r"] = r;
        this.shaderEffectsList[i].params["g"] = g;
        this.shaderEffectsList[i].params["b"] = b;
        break;
      }
    }
    this.updateShaderEffects();
    this.parameterChanged();         

/*
        shaderEffectsList.push({
          "effect": this.importEffects[i].name,
          "params": params
        });        
*/    
  },

  setBackgroundColorChoose: function(choose) {
    this.backgroundColorChoose = choose;

    if(this.backgroundColorChoose == 'auto' || this.backgroundColorChoose == 'current') {
      $('#importImageUseBackgroundColor').hide();
    } else {
      $('#importImageUseBackgroundColor').show();
    }
    this.uiComponent.fitContent();

  },
  setUseColors: function(useColors) {
    this.useColors = useColors;

    if(this.useColors == 'all') {
      $('#importImageChooseColorsRow').hide();
      $('#importImageCreatePalette').hide();
    } else if(this.useColors == 'greyscale') {
      $('#importImageChooseColorsRow').hide();
      $('#importImageCreatePalette').hide();
    } else if(this.useColors == 'create') {

      this.createImportColorPalette();
      $('#importImageChooseColorsRow').hide();
      $('#importImageCreatePalette').show();
    } else if(this.useColors == 'choose') {
      this.chooseCustomColors();
      $('#importImageChooseColorsRow').show();
      $('#importImageCreatePalette').hide();
    } else {
      $('#importImageChooseColorsRow').hide();
      $('#importImageCreatePalette').hide();
    }

    this.parameterChanged();
    this.uiComponent.fitContent();

  },

  setColorReductionParams: function(args) {
    if(typeof args != 'undefined') {
     // this.colorReductionMethod = $('input[name=importImageColorReduction]:checked').val();
      if(typeof args.method != 'undefined') {
        this.colorReductionMethod = args.method;
      }
    }

    if(this.colorReductionMethod == 'dither') {
      $('#importImageDitherGroup').show();
      var ditherThreshold = parseInt($('#importImageDitherThreshold').val(), 10);

      if(!isNaN(ditherThreshold)) {
        this.ditherThreshold = ditherThreshold;
      }
    } else {
      $('#importImageDitherGroup').hide();
    }

    if(this.colorReductionMethod == 'edge') {
      $('#importImageEdgeDetectionGroup').show();
    } else {
      $('#importImageEdgeDetectionGroup').hide();
    }
    this.ditherMethod = $('#importImageDither').val();//$('input[name=importImageDither]:checked').val();

    this.limitColorsPerCell = false;//$('#importImageLimitPerCell').is(':checked');
  },



  imageMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);

    var scale = parseInt($('#importImageScale').val());
    if(isNaN(scale)) {
      return;
    }
    //scale -= 5;

    scale = scale - wheel.spinY * 8;//12;
    if(scale > 0) {
      $('#importImageScale').val(scale);
    }
    this.importImageScale = scale;
    this.parameterChanged();

  },


  setAnimationParameters: function() {
    if(this.importSource == 'video') {
      this.setVideoImportParams();
    }

    if(this.importSource != 'image') {
      return;
    }

    var frameCount = parseInt($('#importImageFrames').val());
    if(!isNaN(frameCount)) {
      var oldFrameCount = this.frameCount;
      this.frameCount = frameCount;

      if(this.frameCount == 1 && oldFrameCount > 1) {
        this.frame = 0;
        this.parameterChanged();
      }

    }

    var ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
    if(!isNaN(ticksPerFrame)) {
      this.ticksPerFrame = ticksPerFrame;
    }

  },

  setVideoImportParams: function() {
    if(this.importSource != 'video') {
      return;
    }

    if(g_app.isMobile()) {
      this.frameCount = this.importImageMobile.frameCount;
//      this.videoPlaybackDirection = 'forwards';
      this.videoStartAt = this.rangeStartValue;
      this.videoEndAt = this.rangeEndValue;
      this.videoSampleEvery  = (this.videoEndAt - this.videoStartAt) / this.frameCount;
//      var ticksPerFrame = 3;//60;

      if(this.videoPlaybackDirection == 'pingpong') {
        this.videoSampleEvery = this.videoSampleEvery * 2;
      }

//      this.ticksPerFrame = ticksPerFrame;

    } else {

      var frameCount = parseInt($('#importImageFrames').val());
      if(!isNaN(frameCount)) {
        this.frameCount = frameCount;
      }

      this.videoPlaybackDirection = $('input[name=importImageVideoPlayDirection]:checked').val();

      this.videoStartAt = this.rangeStartValue;
      this.videoEndAt = this.rangeEndValue;
      this.videoSampleEvery  = (this.videoEndAt - this.videoStartAt) / this.frameCount;

      if(this.videoPlaybackDirection == 'pingpong') {
        this.videoSampleEvery = this.videoSampleEvery * 2;
      }

      var ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
      if(!isNaN(ticksPerFrame)) {
        this.ticksPerFrame = ticksPerFrame;
      }
    }


/*
    var startAt = parseInt( $('#importImageVideoStartAt').val(), 10);
    if(!isNaN(startAt)) {
      this.videoStartAt = startAt;
    }
*/


/*
    var frameCount = parseInt( $('#importImageVideoImportFrames').val(), 10);
    if(!isNaN(frameCount)) {
      this.frameCount = frameCount;
    }

    var ticksPerFrame = parseInt($('#importImageVideoImportPlaybackSpeed').val(), 10);
    if(!isNaN(ticksPerFrame)) {
      this.ticksPerFrame = ticksPerFrame;
    }


    var sampleEvery = parseInt( $('#importImageVideoImportSampleTime').val(), 10);
    if(!isNaN(sampleEvery)) {
      this.videoSampleEvery = sampleEvery;
    }
*/

  },


  scaleImageToFit: function() {
    if(this.importSource == 'image' && this.importImage == null) {
      return;
    }

    if(this.importSource == 'video' && this.importVideo == null) {
      return;
    }


    var drawWidth = 0;
    var drawHeight = 0;
    var scale = 1;

    if(this.importSource == 'image') {
      // actual image width/height
      var drawWidth = this.importImage.naturalWidth;
      var drawHeight = this.importImage.naturalHeight;

      // scale to fit width first
      if(drawWidth > this.importWidth) {
        scale = this.importWidth / this.importImage.naturalWidth;
      }

      // scale to fit height
      if(drawHeight > this.importHeight) {
        scale = this.importHeight / this.importImage.naturalHeight;
      }


      if(drawWidth < this.importWidth && scale == 1) {
        scale = this.importWidth / this.importImage.naturalWidth;
      }

      if(drawHeight < this.importHeight && scale == 1) {
        scale = this.importHeight / this.importImage.naturalHeight;
      }
    } 

    if(this.importSource == 'video') {
      // actual image width/height
      var drawWidth = this.importVideo.videoWidth;
      if(drawWidth == 0) {
        drawWidth = 320;
      }
      var drawHeight = this.importVideo.videoHeight;
      if(drawHeight == 0) {
        drawHeight = 200;
      }



      // scale to fit width first
      if(drawWidth > this.importWidth) {
        scale = this.importWidth / drawWidth;
      }

      // scale to fit height
      if(drawHeight > this.importHeight) {
        scale = this.importHeight / drawHeight;
      }


      if(drawWidth < this.importWidth && scale == 1) {
        scale = this.importWidth / drawWidth;
      }

      if(drawHeight < this.importHeight && scale == 1) {
        scale = this.importHeight / drawHeight;
      }

    }



    var x = (this.importWidth - drawWidth) / 2;
    $('#importImageX').val(x);
    this.imageX = x;

    var y = (this.importHeight - drawHeight) / 2;
    $('#importImageY').val(y);
    this.imageY = y;

    scale = scale * 100;
    this.importImageScale = scale;

    if(g_app.isMobile()) {
      $('#importImageMobileScale').val(scale);

    } else {

      $('#importImageScale').val(scale);
      this.parameterChanged();
    }
  },


  createImportColorPalette: function() {

    var palette = false;

    if(this.importSource == 'video') {      
      if(this.importVideo == null) {
        return;
      }

      // need to draw the video into a canvas to get the colours
      this.srcContext.drawImage(this.importVideo, 0, 0, this.importVideo.videoWidth, this.importVideo.videoHeight);        

      palette = ImageUtils.createColorPaletteFromImage(this.createPaletteColorCount, this.srcCanvas);
    } else {
      
      if(this.importImage == null) {
        return;
      }
    
      if(this.currentColorCount == this.createPaletteColorCount) {
        return;
      }

      palette = ImageUtils.createColorPaletteFromImage(this.createPaletteColorCount, this.importImage);
    }
    
    this.importColorPalette = [];    
    for(var i = 0 ; i < palette.length; i+= 4) {
      var color = (palette[i] << 16) + (palette[i + 1] << 8) + (palette[i + 2]);
      this.importColorPalette.push(color);
    }

    this.currentColorCount = this.createPaletteColorCount;
  },

  setInvertColors: function() {
    this.invertColors = $('#importImageInverColors').is(':checked');
    this.parameterChanged();
  },

  setSmoothingMethod: function(smoothing) {
    if(typeof smoothing == 'undefined') {
      if($('#importImageSmoothing').is(':checked')) {
        this.imageSmoothing = true;
      } else {
        this.imageSmoothing = false;
      }
    } else {
      this.imageSmoothing = smoothing;
    }
    this.srcContext.imageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.webkitImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.mozImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.msImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.oImageSmoothingEnabled = this.imageSmoothing;

    if(this.importImageContext) {
      this.importImageContext.imageSmoothingEnabled = this.imageSmoothing;
      this.importImageContext.webkitImageSmoothingEnabled = this.imageSmoothing;
      this.importImageContext.mozImageSmoothingEnabled = this.imageSmoothing;
      this.importImageContext.msImageSmoothingEnabled = this.imageSmoothing;
      this.importImageContext.oImageSmoothingEnabled = this.imageSmoothing;
    }

    this.parameterChanged();
  },


  parameterChanged: function() {
    this.updateImportImage();
    this.drawPreview();
  },

  resetCacheCanvas: function() {
    this.cacheImageX = false;
    this.cacheImageY = false;
    this.cacheDrawWidth = false;
    this.cacheDrawHeight = false;
    this.cacheScale = false;
    this.cacheCrosshairX = false;
    this.cacheCrosshairY = false;
    this.cacheImageSmoothing = -1;

  },


  // called when importing the image, or updating preview animation
  updateImportImage: function() {

    if(this.importSource == 'image' && this.importImage == null) {
      return;
    }

    if(this.importSource == 'video' && this.importVideo == null) {
      return;
    }



    var drawWidth = 0;
    var drawHeight = 0;

    if(this.importSource == 'image') {
      drawWidth = this.importImage.naturalWidth;
      drawHeight = this.importImage.naturalHeight;
    }

    if(this.importSource == 'video') {
      drawWidth = this.importVideo.videoWidth;
      if(drawWidth == 0) {
        drawWidth = 320;
      }
      drawHeight = this.importVideo.videoHeight;      
      if(drawHeight == 0) {
        drawHeight = 200;
      }
    }

    // scale by user's input
    var scale = this.importImageScale;
    this.imageScale = scale;
    this.currentZoom = scale;

/*
    // position by user's input
    this.imageX = parseInt($('#importImageX').val());
    this.imageY = parseInt($('#importImageY').val());
*/


    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.srcContext.clearRect(0, 0, this.srcCanvas.width, this.srcCanvas.height);

    if(!this.importImageAnimate || (!this.useEffects && !this.chromaKeyEnabled) || this.chromaChooseColor) {

      // no animation..

      var scale = this.currentZoom;
      var imageX = this.imageX - this.crosshairX;
      var imageY = this.imageY - this.crosshairY;

      if(this.importSource == 'image'
        && this.cacheCanvas !== null
        && this.cacheImageX === imageX
        && this.cacheImageY === imageY
        && this.cacheDrawWidth === drawWidth
        && this.cacheDrawHeight === drawHeight
        && this.cacheScale === scale
        && this.cacheCrosshairX === this.crosshairX
        && this.cacheCrosshairY === this.crosshairY 
        && this.cacheImageSmoothing === this.imageSmoothing
        && this.cacheRotateAmount == this.rotateAmount
        ) {
        // got a cached version

        this.srcContext.drawImage(this.cacheCanvas, 0, 0);

      } else {
        this.srcContext.save();

        var crosshairX = this.crosshairX;
        var crosshairY = this.crosshairY;

//        crosshairX = Math.cos(this.rotateAmount * Math.PI / 180) * this.crosshairX - Math.sin(this.rotateAmount* Math.PI / 180) * this.crosshairY;
//        crosshairY = Math.cos(this.rotateAmount* Math.PI / 180) * this.crosshairY - Math.sin(this.rotateAmount* Math.PI / 180) * this.crosshairX;


        // want to zoom on crosshair
        this.srcContext.translate(crosshairX, crosshairY); 

        this.srcContext.scale(scale / 100,scale / 100);
        this.srcContext.rotate(this.rotateAmount * Math.PI / 180);


        var tx = imageX;
        var ty = imageY;


        tx = Math.cos(this.rotateAmount * Math.PI / 180) * imageX + Math.sin(this.rotateAmount* Math.PI / 180) * imageY;
        ty = Math.cos(this.rotateAmount* Math.PI / 180) * imageY - Math.sin(this.rotateAmount* Math.PI / 180) * imageX;


        if(this.importSource == 'image') {
          this.srcContext.drawImage(this.importImage, tx, ty, drawWidth, drawHeight);
        }

        if(this.importSource == 'video') {
          this.srcContext.drawImage(this.importVideo, tx, ty, drawWidth, drawHeight);        
        }

        this.srcContext.translate(-crosshairX, -crosshairY); 
        this.srcContext.restore();


        // cache a copy, only cache image
        if(this.importSource == 'image') {
          if(this.cacheCanvas == null) {
            this.cacheCanvas = document.createElement('canvas');
          }

          if(this.cacheCanvas !== null && this.disableCache !== true) {
            this.cacheCanvas.width = this.srcCanvas.width;
            this.cacheCanvas.height = this.srcCanvas.height;
            this.cacheContext = this.cacheCanvas.getContext('2d');
            this.cacheImageX = imageX;
            this.cacheImageY = imageY;
            this.cacheDrawWidth = drawWidth;
            this.cacheDrawHeight = drawHeight;
            this.cacheScale = scale;
            this.cacheCrosshairX = this.crosshairX;
            this.cacheCrosshairY = this.crosshairY;
            this.cacheImageSmoothing = this.imageSmoothing;
            this.cacheRotateAmount = this.rotateAmount;

            this.cacheContext.drawImage(this.srcCanvas, 0, 0);
          }
        }
      }

      this.imageParametersEffect.setParameters({ brightness: this.brightness });
      this.imageParametersEffect.setParameters({ contrast: this.contrast });
      this.imageParametersEffect.setParameters({ saturation: this.saturation });
      this.imageParametersEffect.setParameters({ invertColors: this.invertColors });

      this.imageParametersEffect.setSource(this.srcCanvas);
      this.imageParametersEffect.setDestination(this.srcCanvas);
      this.imageParametersEffect.update();


    } else {

      var scale = this.currentZoom;//this.imageScale * this.currentZoom / 100;
//      this.srcContext.save();

      var imageX = this.imageX - this.crosshairX;
      var imageY = this.imageY - this.crosshairY;

      var scale = this.importImageScale;


      this.rotateZoomEffect.setScale(scale / 100);

      this.rotateZoomEffect.gotoFrame(this.frame);
      this.rotateZoomEffect.setFrameCount(this.frameCount);

      if(this.rotateAmount != 0) {
        this.srcContext.save();

        var crosshairX = this.crosshairX;
        var crosshairY = this.crosshairY;

//        crosshairX = Math.cos(this.rotateAmount * Math.PI / 180) * this.crosshairX - Math.sin(this.rotateAmount* Math.PI / 180) * this.crosshairY;
//        crosshairY = Math.cos(this.rotateAmount* Math.PI / 180) * this.crosshairY - Math.sin(this.rotateAmount* Math.PI / 180) * this.crosshairX;


        // want to zoom on crosshair
        this.srcContext.translate(crosshairX, crosshairY); 

        this.srcContext.scale(scale / 100,scale / 100);
        this.srcContext.rotate(this.rotateAmount * Math.PI / 180);


        var tx = imageX;
        var ty = imageY;


        tx = Math.cos(this.rotateAmount * Math.PI / 180) * imageX + Math.sin(this.rotateAmount* Math.PI / 180) * imageY;
        ty = Math.cos(this.rotateAmount* Math.PI / 180) * imageY - Math.sin(this.rotateAmount* Math.PI / 180) * imageX;


        if(this.importSource == 'image') {
          this.srcContext.drawImage(this.importImage, tx, ty, drawWidth, drawHeight);
        }

        if(this.importSource == 'video') {
          this.srcContext.drawImage(this.importVideo, tx, ty, drawWidth, drawHeight);        
        }

        this.srcContext.translate(-crosshairX, -crosshairY); 
        this.srcContext.restore();

        if(this.importSource == 'image') {
          this.rotateZoomEffect.setSource(this.srcCanvas);
        } else if(this.importSource == 'video') {
          this.rotateZoomEffect.setSource(this.srcCanvas);        
        }

      } else {

        if(this.importSource == 'image') {
          this.rotateZoomEffect.setSource(this.importImage);
        } else if(this.importSource == 'video') {
          this.rotateZoomEffect.setSource(this.importVideo);        
        }
      }
 

      var mirrorEnabled = false;
      var noiseEnabled = false;
      var slitscanEnabled = false;

      for(var j = 0; j < this.importEffects.length; j++) {
        var name = this.importEffects[j].name;
        var enabled = this.importEffects[j].enabled;
        var type = this.importEffects[j].type;
        var params = this.importEffects[j].params;


        if(type !== 'shadereffect') {
          switch(name) {
            case 'Pan':
              if(enabled) {

                this.rotateZoomEffect.setParameters({ 
                  "panX": params.h.value,
                  "panXAnimateType": params.h.animateType, 
                  "panY": params.v.value,
                  "panYAnimateType": params.v.animateType
                });

              } else {

                this.rotateZoomEffect.setParameters({ 
                  "panX": 0, 
                  "panY": 0 
                });

              }
            break;
            case 'Zoom':
              if(enabled) {

                var zoomType = 'layer';
                if(params.infinite.value === true) {
                  zoomType = 'infinite';
                }
                this.rotateZoomEffect.setParameters({ 
                  "zoomDirection": params.direction.value, 
                  "zoomAmountX": params.amountX.value,
                  "zoomAmountY": params.amountY.value,
                  "zoomType": zoomType,
                  "layerAngleSeparation": params.layerAngleSeparation.value
                });            

              } else {
                this.rotateZoomEffect.setParameters({ "zoomDirection": 0 });
              }
            break;
            case 'Rotate':
              if(enabled) {
                this.rotateZoomEffect.setParameters({ 
                  "rotateDirection": params.direction.value,
                  "wiggleAmount": params.wiggleAmount.value,
                  "wiggleSteps": 0
                });

              } else {
                this.rotateZoomEffect.setParameters({ "rotateDirection": 0 });
              }
            break;

            case 'Slitscan':
              slitscanEnabled = enabled;
              if(enabled) {
                this.slitscanEffect.horizontal = params.slice.value == 'Horizontal';
                this.slitscanEffect.vertical = params.slice.value == 'Vertical';
                this.slitscanEffect.slices = params.sliceCount.value;
              }
            break;
            case 'Mirror':
              mirrorEnabled = enabled;
              if(enabled) {
                var effectParams = {
                  flipV: false,
                  flipH: false,
                  mirrorV: false,
                  mirrorH: false
                };

                var flip = params.flip.value;
                if(typeof flip != 'undefined' && flip.length > 0) {
                  if((flip.length > 0 && flip[0] == 'Horizontal') 
                    || (flip.length > 1 && flip[1] == 'Horizontal')) {
                    effectParams.flipH = true;
                  }

                  if((flip.length > 0 && flip[0] == 'Vertical') 
                    || (flip.length > 1 && flip[1] == 'Vertical')) {
                    effectParams.flipV = true;
                  }
                }

                var mirror = params.mirror.value;
                if(typeof mirror != 'undefined' && mirror.length > 0) {
                  if((mirror.length > 0 && mirror[0] == 'Horizontal') 
                    || (params.flip.length > 1 && params.mirror[1] == 'Horizontal')) {
                    effectParams.mirrorH = true;
                  }

                  if((mirror.length > 0 && mirror[0] == 'Vertical') 
                    || (mirror.length > 1 && mirror[1] == 'Vertical')) {
                    effectParams.mirrorV = true;
                  }
                }


                this.mirrorEffect.setParameters(effectParams);
                this.mirrorEffect.gotoFrame(this.frame);
              } else {
                this.mirrorEffect.setParameters({ 
                  flipV: false, 
                  flipH: false, 
                  mirrorV: false, 
                  mirrorH: false 
                });
              }
            break;
            case 'Brightness':
              if(enabled) {

                this.imageParametersEffect.setParameters({ 
                  brightness: this.brightness, 
                  brightnessDelta: params.amount.value,
                  brightnessAnimateType: params.amount.animateType
                });

              } else {
                this.imageParametersEffect.setParameters({ 
                  brightness: this.brightness, 
                  brightnessDelta: 0 
                });        
              }

            break;
            case 'Contrast':
              if(enabled) {
                this.imageParametersEffect.setParameters({ 
                  contrast: this.contrast,
                  contrastDelta: params.amount.value,
                  contrastAnimateType: params.amount.animateType
                });
              } else {
                this.imageParametersEffect.setParameters({ 
                  contrast: this.contrast, 
                  contrastDelta: 0 
                });        
              }

            break;
            case 'Saturation':
              if(enabled) {
                this.imageParametersEffect.setParameters({ 
                  saturation: this.saturation,
                  saturationDelta: params.amount.value,
                  saturationAnimateType: params.amount.animateType
                });
              } else {
                this.imageParametersEffect.setParameters({ 
                  saturation: this.saturation 
                });        
              }

            break;
            case 'Noise':
              noiseEnabled = enabled;
              if(enabled) {
                this.noiseEffect.setParameters({
                  amount: params.amount.value,
                  density: params.density.value
                });
              } else {

              }
            break;
          }

        }
      }


      // just do it for the last one..
      this.rotateZoomEffect.setDestination(this.srcCanvas);
      this.rotateZoomEffect.setPosition(this.imageX, this.imageY);
      this.rotateZoomEffect.setCrosshair(this.crosshairX, this.crosshairY);
      this.rotateZoomEffect.update();

      // should check if mirror is used..
      if(mirrorEnabled) {
        this.mirrorEffect.setSource(this.srcCanvas);
        this.mirrorEffect.setDestination(this.srcCanvas);
        this.mirrorEffect.update();
      }

      if(slitscanEnabled) {
        this.slitscanEffect.setSource(this.srcCanvas);
        this.slitscanEffect.setDestination(this.srcCanvas);
        this.slitscanEffect.update();
      }


      this.imageParametersEffect.setFrameCount(this.frameCount);

      this.imageParametersEffect.setSource(this.srcCanvas);
      this.imageParametersEffect.setDestination(this.srcCanvas);
      this.imageParametersEffect.gotoFrame(this.frame);
      this.imageParametersEffect.update();


      if(this.shaderEffectsList.length > 0) {

        var shaderTime = this.frame / this.frameCount;
        for(var i = 0; i < this.shaderEffectsList.length; i++) {
          var effect = this.shaderEffectsList[i].effect;
          if(effect == 'Pixelate') {
            this.shaderEffectsList[i].params['pixelsX'] = this.shaderEffectsList[i].params['initialX'] + (this.shaderEffectsList[i].params['amountX']) * Math.sin(2 * Math.PI * shaderTime);     
            this.shaderEffectsList[i].params['pixelsY'] = this.shaderEffectsList[i].params['initialY'] + (this.shaderEffectsList[i].params['amountY']) * Math.sin(2 * Math.PI * shaderTime);     

          } else if(effect == 'Polar Pixelate') {
            this.shaderEffectsList[i].params['pixelsX'] = this.shaderEffectsList[i].params['initialCircles'] + (this.shaderEffectsList[i].params['amountCircles'] / 100) * Math.sin(2 * Math.PI * shaderTime);     
            this.shaderEffectsList[i].params['pixelsY'] = this.shaderEffectsList[i].params['initialSlices'] + (this.shaderEffectsList[i].params['amountSlices'] / 100) * Math.sin(2 * Math.PI * shaderTime);     

          } else if(effect == 'Hexagonal Pixelate') {
            this.shaderEffectsList[i].params['scale'] = this.shaderEffectsList[i].params['initial'] + shaderTime * this.shaderEffectsList[i].params['amount'];

            this.shaderEffectsList[i].params['scale'] = this.shaderEffectsList[i].params['initial'] + (this.shaderEffectsList[i].params['amount'] / 80) * Math.sin(2 * Math.PI * shaderTime);     
          } else if(effect == 'Diffusion') {
            this.shaderEffectsList[i].params['scale'] = this.shaderEffectsList[i].params['initial'] + shaderTime * this.shaderEffectsList[i].params['amount'];

            this.shaderEffectsList[i].params['scale'] = this.shaderEffectsList[i].params['initial'] + (this.shaderEffectsList[i].params['amount'] / 280) * Math.sin(2 * Math.PI * shaderTime);     
            
          } else {
            if(effect != 'Chroma Key') {
              if(effect == 'Hue/Saturation') {
                this.shaderEffectsList[i].params['hue'] = shaderTime * 2;
              } else {
                this.shaderEffectsList[i].params['time'] = shaderTime;
              } 
            }
          }
        }

        this.shaderEffects.setEffectParams(this.shaderEffectsList);

        this.shaderEffects.applyEffects();
      }

      if(noiseEnabled) {
        this.noiseEffect.gotoFrame(this.frame);
        this.noiseEffect.setSource(this.srcCanvas);
        this.noiseEffect.setDestination(this.srcCanvas);
        this.noiseEffect.update();      

      }

    }

    this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     

    if(!this.chromaChooseColor) {
      if(this.colorReductionMethod == 'closest' || this.colorReductionMethod == 'dither') {

        this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     


        this.setColors();

        if(false) {

          // get the colors as rgb
          var colors = [];
          // loop through chosen colors, find the rgb values
          for(var i = 0; i < this.colors.length; i++) {
            colors.push(colorPalette.getHex(this.colors[i]));
          }

          // get dithering method
          var dithKern = null;
          if(this.colorReductionMethod == 'dither') {
            dithKern = this.ditherMethod;
          }

          if(this.useColors == 'create') {
            colors = this.importColorPalette;
          }

          var dithDelta = this.ditherThreshold / 200;
          var method = 2;

          ImageUtils.rgbQuant(this.imageData, { method: method, palette: colors, dithKern: dithKern, dithDelta: dithDelta });//colors, dithKern);
        } else {

//          //this.imageLib.setPalette(colors);
          var palette = [];

          if(this.useColors == 'create') {
            for(var i = 0; i < this.importColorPalette.length; i++) {
              var c = this.importColorPalette[i];
              var r = (c >>> 16) & 0xff;
              var g = (c >>> 8) & 0xff;
              var b = (c >>> 0) & 0xff;                

              palette.push([r,g,b,255]);

            }
          } else {
            for(var i = 0; i < this.colors.length; i++) {
              palette.push(colorPalette.getRGBA(this.colors[i]));
            }
          }

          this.imageLib.palette = palette;
          this.imageLib.setImageData(this.imageData);
          if(this.colorReductionMethod == 'dither') {
            this.imageData = this.imageLib.reduceDither({ kernel: this.ditherMethod });          
          } else {
            this.imageData = this.imageLib.reduceNearest();
          }
        }


        this.srcContext.putImageData(this.imageData, 0, 0, 0, 0, this.srcCanvas.width , this.srcCanvas.height); 


        if(this.limitColorsPerCell) {
          ImageUtils.limitColorsPerCell(this.srcContext, { colors: colors, dithKern: dithKern, width: this.srcCanvas.width, height: this.srcCanvas.height });

        }



  //      this.srcContext.putImageData(this.imageData, 0, 0, 0, 0, this.srcCanvas.width , this.srcCanvas.height); 
      }

      if(this.colorReductionMethod == 'edge') {

        ImageUtils.edgeDetect(this.imageData, { 
          lowThreshold: this.edgeDetectLowThreshold, 
          highThreshold: this.edgeDetectHighThreshold, 
          blurRadius: this.edgeDetectBlurRadius,
          lineThickness: this.edgeDetectLineThickness });
        this.srcContext.putImageData(this.imageData, 0, 0, 0, 0, this.srcCanvas.width , this.srcCanvas.height); 
      }
    }

  },

  drawPreview: function() {
    if(!this.importInProgress) {

      if(!this.importImageContext) {
        // not set up yet
        return;
      }

      var previewCanvasWidth = this.importImageCanvas.width;
      var previewCanvasHeight = this.importImageCanvas.height;

//      this.importImageContext.drawImage(this.backgroundCanvas, 0, 0, this.importImageCanvas.width, this.importImageCanvas.height);    

      var checkerboardCanvas = this.editor.checkerboardPattern.getCanvas(previewCanvasWidth, previewCanvasHeight);
      this.importImageContext.drawImage(checkerboardCanvas, 
                                        0, 0, previewCanvasWidth, previewCanvasHeight,
                                        0, 0, previewCanvasWidth, previewCanvasHeight);

      this.importImageContext.drawImage(this.srcCanvas, 0, 0, previewCanvasWidth, previewCanvasHeight);

      // draw zoom/rotate crosshairs
      this.importImageContext.beginPath();
      this.importImageContext.moveTo(this.crosshairX * this.previewScale + 0.5, 0);
      this.importImageContext.lineTo(this.crosshairX * this.previewScale + 0.5, this.srcCanvas.height * this.previewScale);
      this.importImageContext.strokeStyle = '#ffff00';
      this.importImageContext.lineWidth = 1;
      this.importImageContext.stroke();


      this.importImageContext.beginPath();
      this.importImageContext.moveTo(0, this.crosshairY * this.previewScale + 0.5);
      this.importImageContext.lineTo(this.srcCanvas.width * this.previewScale, this.crosshairY * this.previewScale + 0.5);
      this.importImageContext.strokeStyle = '#ffff00';
      this.importImageContext.stroke();
    }
  },


  mouseDown: function(e) {

  },

  mouseMove: function(e) {
    this.rangeMouseMove(e);

    if(this.mouseIsDown) {
      var scale = this.imageScale;

      var x = e.pageX;
      var y = e.pageY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;

      diffX = (diffX * 100 / scale) / this.previewScale;
      diffY = (diffY * 100 / scale) / this.previewScale;


      if(diffX > 2 || diffY > 2) {
        this.movingImage = true;
      }        

      var newOffsetX = this.currentOffsetX + diffX;
      $('#importImageX').val(newOffsetX);
      this.imageX = newOffsetX;

      var newOffsetY = this.currentOffsetY + diffY;
      $('#importImageY').val(newOffsetY);
      this.imageY = newOffsetY;

      this.parameterChanged();
    }


  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
    if(this.mouseDownInRange) {
      this.rangeMouseUp(event);
    }

    UI.setCursor('default');

  },



  setImportVideo: function(file) {  
    this.importSource = 'video';
    this.resetCacheCanvas();

    if(g_app.isMobile()) {
    } else {
      var frameCount = parseInt($('#importImageFrames').val());
      if(isNaN(frameCount) || frameCount <= 1) {
        $('#importImageFrames').val(12);
      }


      this.innerSplitPanel.resizeThePanel({"panel": 'north', "size": 388});
      $('#importImageVideoControls').show();

      if(typeof file.name != 'undefined') { 
        $('#importImageChooseFileName').html(file.name);
      } else {
        $('#importImageChooseFileName').html('');
      }
    }


//    $('#importImageWithFramesOn').prop('checked', true);


    this.setVideoImportParams();

    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);

    if(!this.importVideo) {
      this.importVideo = document.createElement("video");
    }    

    var videoParamsSet = false;
    this.videoLoaded = false;

    var _this = this;

    this.importVideo.onseeked = function() {

      _this.videoFrameReady = true;

      if(_this.importingVideo) {
        // let import know frame is ready for import
        _this.frameReadyForImport();

      } else {

        if(g_app.isMobile()) {
          _this.drawRangeControl();
          _this.importImageMobile.parameterChanged();
        } else {
          _this.drawRangeControl();
          _this.parameterChanged();
        }
      }
    }

    this.importVideo.oncanplaythrough = function() {

      var duration = _this.importVideo.duration;
      var playbackRate = _this.importVideo.playbackRate;
      var seekable = _this.importVideo.seekable;

      if(!videoParamsSet) {
        _this.videoFrameReady = true;
        videoParamsSet = true;
        duration = duration * 1000;

        _this.rangeMaxValue = duration;

        if(g_app.isMobile()) {
          $('#importImageMobileStartTime').attr('max', _this.rangeMaxValue);
          $('#importImageMobileStartTimeValue').attr('max', _this.rangeMaxValue);          

          $('#importImageMobileEndTime').attr('max', _this.rangeMaxValue);
          $('#importImageMobileEndTimeValue').attr('max', _this.rangeMaxValue);          
        } else {
          $('#importImageVideoInfo').html('Video Duration: ' + duration + 'ms');
        }
        var importTo = 5 * 1000;

        if(importTo > duration) {
          importTo = duration;
        }
        _this.setVideoImportFrom(0);
        _this.setVideoImportTo(importTo);



//      if(!_this.videoLoaded) {
  //      _this.videoLoaded = true;
        _this.scaleImageToFit();        
//      }

      }

/*

      if(_this.importingVideo) {
        // let import know frame is ready for import
        _this.frameReadyForImport();

      } else {


        if(g_app.isMobile()) {
          _this.drawRangeControl();
          _this.importImageMobile.parameterChanged();
        } else {
          _this.drawRangeControl();
          _this.parameterChanged();
        }

      }
*/

    }

    this.importVideo.src = src;
    this.importVideo.load();
    this.importVideo.currentTime = 0;

    this.updateAnimateSettings();
  },

  setImportImageFromReferenceImage: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var imageData = layer.getReferenceImageData();
    if(!imageData) {
      return;
    }

    $('#importImageForm')[0].reset();
    $('#importImageChooseFileName').html('');
    this.setImportImageFromSrc(imageData);

  },

  setImportImage: function(file) {
    if(typeof file == 'undefined' || !file) {
      return;
    }
//    if(file.type == 'video/mp4' || file.type == 'video/webm') {
    if(file.type.indexOf('video/') === 0) {
      this.setImportVideo(file);
      return;
    }

    if(typeof file.name != 'undefined') { 
      $('#importImageChooseFileName').html(file.name);
    } else {
      $('#importImageChooseFileName').html('');
    }
    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);

    this.setImportImageFromSrc(src);
  },

  setImportImageFromSrc: function(src) {
    this.importVideo = null;

    this.innerSplitPanel.resizeThePanel({ "panel": 'north', "size": 336});
    $('#importImageVideoControls').hide();
    $('#importImageTickControls').show();

    this.importSource = 'image';
    this.resetCacheCanvas();

    this.setAnimationParameters();

    if(!this.importImage) {
      this.importImage = new Image();
    }

    this.currentColorCount = false;
//    this.initCanvas();

    var _this = this;
    this.importImage.onload = function() {
      $('#importImageScale').val(100);  
      _this.importImageScale = 100;

      $('#importImageX').val(0);
      $('#importImageY').val(0);   
      _this.imageX = 0;
      _this.imageY = 0;
      if(_this.useColors == 'create') {   
        _this.createImportColorPalette();                   
      }

      _this.scaleImageToFit();

      _this.parameterChanged();
//      _this.showImportImage();
    }
    this.importImage.src = src;

    this.updateAnimateSettings();

  },



  initColors: function() {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorCount = colorPalette.getColorCount();

    this.colors = [];
    for(var i = 0; i < colorCount; i++) {
      this.colors.push(i);
    }

    this.bgColors = [];
    for(var i = 0; i < colorCount; i++) {
      this.bgColors.push(i);
    }

  },



  findBackgroundColors: function() {

    if(!this.imageData) {
      this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     
    }
   // bg colors to use
    this.bgColors = [];
    for(var i = 0; i < this.colors.length; i++) {
      this.bgColors.push(this.colors[i]);
    }

    if(!this.multipleBackgroundColors) {

      if(this.backgroundColorChoose == 'auto') {

        this.imageColors = this.importColorUtils.findColors(this.imageData, this.colors);

        var bgColor = this.imageColors[0].color;  
        this.editor.frames.setBackgroundColor(bgColor);

        this.bgColors = [];
        this.bgColors.push(bgColor);
      } else if(this.backgroundColorChoose == 'manual') {
        this.bgColors = [];
        this.bgColors.push(this.backgroundColor);
        this.editor.setBackgroundColor(this.backgroundColor);
      } else {
        this.bgColors = [];
        this.bgColors.push(this.editor.graphic.getBackgroundColor());
      }
    }

    if(this.multipleBackgroundColors) {

      if(this.multipleBackgroundColorsLimit) {
        // only use 4 background colors for extended color mode

        this.imageColors = this.importColorUtils.findColors(this.imageData, this.colors);
        var colorCount = 4;

        // check in case the import is using less than 4 colours
        if(this.colors.length < colorCount) {
          colorCount = this.colors.length;
        }

        this.bgColors = [];
        for(var i = 0; i < colorCount; i++) {
          this.bgColors[i] = this.imageColors[i].color;
        }  
      } else {

        this.bgColors = [];
        for(var i = 0; i < this.colors.length; i++) {
          this.bgColors[i] = this.colors[i];
        }  

      }
    }
  },


     
  initCanvas: function() {

    var _this = this;

    if(this.importImageCanvas == null) {
      this.importImageCanvas = document.getElementById('importImageCanvas');
    }
 
    this.importImageContext = this.importImageCanvas.getContext("2d");

    this.previewScale = 1;

    var previewWidth = this.importWidth;
    var previewHeight = this.importHeight;


    // make sure preview fits in the dialog
    if(previewWidth > 320 || previewHeight > 200) {
      if(320/200 > previewWidth / previewHeight) {

        this.previewScale = 200 / previewHeight;
        previewWidth = previewWidth * 200 / previewHeight;

        previewHeight = 200;
      } else {
        this.previewScale = 320 / previewWidth;
        previewHeight = previewHeight * 320 / previewWidth;
        previewWidth = 320;
      }
    }


    if(this.importImageCanvas.width != previewWidth || this.importImageCanvas.height != previewHeight) {
      this.importImageCanvas.width = previewWidth;//this.importWidth;
      this.importImageCanvas.height = previewHeight;//this.importHeight;
      this.importImageContext = this.importImageCanvas.getContext('2d');
    }

/*
    this.importImageContext.imageSmoothingEnabled = this.imageSmoothing;
    this.importImageContext.webkitImageSmoothingEnabled = this.imageSmoothing;
    this.importImageContext.mozImageSmoothingEnabled = this.imageSmoothing;
    this.importImageContext.msImageSmoothingEnabled = this.imageSmoothing;
    this.importImageContext.oImageSmoothingEnabled = this.imageSmoothing;

*/

/*
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

    this.importImageContext.drawImage(this.backgroundCanvas, 0, 0, this.importImageCanvas.width, this.importImageCanvas.height);    
*/
  },


  initSrcCanvas: function() {
    var width = this.importWidth;
    var height = this.importHeight;

    if(!this.srcCanvas) {
      this.srcCanvas = document.createElement('canvas');
      this.srcCanvas.width = width;//img.naturalWidth;
      this.srcCanvas.height = height;//img.naturalHeight;
      this.shaderEffects.setInput(this.srcCanvas, this.srcCanvas);
      this.srcContext = this.srcCanvas.getContext("2d");
    } else if(this.srcCanvas.width != width || this.srcCanvas.height != height) {
      this.srcCanvas.width = width;//img.naturalWidth;
      this.srcCanvas.height = height;//img.naturalHeight;
      this.srcContext = this.srcCanvas.getContext("2d");
      this.shaderEffects.setInput(this.srcCanvas, this.srcCanvas);
    }


    this.srcContext.imageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.webkitImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.mozImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.msImageSmoothingEnabled = this.imageSmoothing;
    this.srcContext.oImageSmoothingEnabled = this.imageSmoothing;

    if(!this.progressCanvas) {
      var html = '';

      html += '<div style="margin-bottom: 6px">Import in progress...</div>';

      html += '<div style="text-align: center">';
      html += '<canvas width="128" height="80" id="importCanvas" style="border: 1px solid white"></canvas>';
      html += '</div>';

      html += '  <div style="margin-top: 2px">';
      html += '    <div id="importImageProgressText" style="margin-bottom: 4px">Imported x / y frames</div>';

      html += '    <button id="importImageCancelProgress">Stop Import</button>';
      html += '  </div>';

      var element = document.createElement('div');
      element.setAttribute('id', 'importImageProgress');
      element.setAttribute('style', 'display: none; z-index: 1000; color: white; text-align: center; padding: 4px; position: absolute; background-color: #111111; top: 32px; left: 2px; width: 120px; height: 110px; border: 1px solid #cccccc');
      element.innerHTML = html;

      document.body.append(element);
      //</div>

      // setup the cancel button    
      var _this = this;
      $('#importImageCancelProgress').off('click');
      $('#importImageCancelProgress').on('click', function() {
        _this.endImport();
      });

      this.progressCanvas = document.getElementById("importCanvas");
    }
    this.progressCanvas.width = width / 5;
    this.progressCanvas.height = height / 5;
    this.progressContext = this.progressCanvas.getContext("2d");

    this.srcContext.clearRect(0, 0, width, height);
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


      // only do this if import has started??
      if(this.importInProgress) {

        if(!this.imageData) {
          this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     
        }

        // too many colours, reduce it to the max colours..
        if(this.colors.length > this.maxColors) {
          this.imageColors = this.importColorUtils.findColors(this.imageData, this.colors);
          this.colors = [];
          for(var i = 0; i < this.maxColors; i++) {
            this.colors.push(this.imageColors[i].color);
          }
        }
      }


    }    



  },


  endImport: function() {
    this.importInProgress = false;
    this.frameImportInProgress = false;
    this.importingVideo = false;

    this.frame = 1;
    this.frameCount = 1;

    $('#importProgress').hide();  

    $('#importImageProgress').hide();  
    this.editor.history.endEntry(); 

    this.editor.graphic.redraw({ allCells: true});

  },


  initEffectEvents: function() {
    var _this = this;
    // pan animation parameters
    $('#imageImportPanX').on('keyup', function() {
      _this.updateAnimateSettings();
    });

    $('#imageImportPanX').on('change', function() {
      _this.updateAnimateSettings();
    });

    $('#imageImportPanY').on('keyup', function() {
      _this.updateAnimateSettings();
    });

    $('#imageImportPanY').on('change', function() {
      _this.updateAnimateSettings();
    });


    // zoom rotate animation parameters
    $('#imageImportZoomAmount').on('change', function() {
      _this.updateAnimateSettings();
    });
    $('#imageImportZoomAmount').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('input[name=imageImportZoomDirection]').on('click', function() {
      _this.updateAnimateSettings();      
    });


    $('#imageImportZoomAmount').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('#imageImportZoomAmount').on('change', function() {
      _this.updateAnimateSettings();      
    });

    $('input[name=imageImportRotateDirection]').on('click', function() {
      _this.updateAnimateSettings();      
    });


    $('input[name=imageImportZoomLayers]').on('click', function() {
      _this.updateAnimateSettings();      
    });

    $('#imageImportZoomRotateAngleSeparation').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('#imageImportZoomRotateAngleSeparation').on('change', function() {
      _this.updateAnimateSettings();      
    });

    $('#imageImportZoomX').on('keyup', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.crosshairX = value;
        _this.updateAnimateSettings();      
      }
    });
    $('#imageImportZoomX').on('change', function() {

      var value = parseInt($(this).val(), 10);


      if(!isNaN(value)) {
        _this.crosshairX = value;
        _this.updateAnimateSettings();      
      }
    });

    $('#imageImportZoomY').on('keyup', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.crosshairY = value;
        _this.updateAnimateSettings();      
      }
    });

    $('#imageImportZoomY').on('change', function() {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        _this.crosshairY = value;
        _this.updateAnimateSettings();      
      }
    });


    $('input[name=imageImportRotateDirectionAnticlockwise]').on('click', function() {
      _this.updateAnimateSettings();      
    });


    $('.imageEffectCheckbox').on('click', function() {
      _this.updateAnimateSettings();    
    });


    $('#importImageBrightnessDelta').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('#importImageBrightnessDelta').on('change', function() {
      _this.updateAnimateSettings();      
    });


    $('#importImageSaturationDelta').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('#importImageSaturationDelta').on('change', function() {
      _this.updateAnimateSettings();      
    });

    $('#importImageContrastDelta').on('keyup', function() {
      _this.updateAnimateSettings();      
    });

    $('#importImageContrastDelta').on('change', function() {
      _this.updateAnimateSettings();      
    });


    $(".importImageParameter").on('keyup', function() {
      _this.updateAnimateSettings();
    });

    $(".importImageParameter").on('change', function() {
      _this.updateAnimateSettings();
    });

  },


  startImport: function() {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();    
    var noColor = this.editor.colorPaletteManager.noColor;

    // stop play
    this.editor.frames.stop();
    
    this.previewAnimation = false;

    if(UI.isMobile.any()) {
      this.useMobile = true;
      this.useShader = false;
    } else {
      this.useShader = true;//$('#importImageUseShader').is(':checked');

      if($('#importImageMethod').val() == 'method2') {
        this.useMobile = true;
        this.useShader = false;
      } else if($('#importImageMethod').val() == 'method1') {
        this.useMobile = false;
        this.useShader = true;
      } else {
        this.useMobile = true;
        this.useShader = false;  
      }
    }



    switch(this.backgroundColorType) {
      case 'perCell':
        this.multipleBackgroundColors = true;
        this.multipleBackgroundColorsLimit = true;
      break;

      case 'frame':
        this.multipleBackgroundColors = false;
        this.multipleBackgroundColorsLimit = false;      
      break;
    }

    // **** setup colours to use ****
    if(this.useColors == 'create') {
//      this.createImportColorPalette();
      colorPalette.setColors(this.importColorPalette);
      colorPalette.name = 'From Image';
    }

    // copy palette colours into color and bgcolor array
    this.initColors();

    if(this.useColors == 'choose') {
      if(typeof this.customColorSet == 'undefined' || this.customColorSet.length == 0) {
        alert('No colours chosen');
        return false;
      }

      this.colors = [];
      for(var i = 0; i < this.customColorSet.length; i++) {
        if(this.customColorSet[i] !== noColor) {
          this.colors.push(this.customColorSet[i]);
        }
      }      
    } else {  
      // set the colors to use
      this.colors = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colors.push(i);
      }
    }

    if(this.colors.length > this.maxColors) {
      if(!this.imageData) {
        this.imageData = this.srcContext.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height);     
      }
      this.imageColors = this.importColorUtils.findColors(this.imageData, this.colors);
      this.colors = [];
      for(var i = 0; i < this.maxColors; i++) {
        this.colors.push(this.imageColors[i].color);
      }
    }


  
    // find the bgcolors to use
    this.findBackgroundColors();
    // ***** set characters to use ****** //
    if(this.useChars == 'choose') {
      if(typeof this.customTileSet == 'undefined' || this.customTileSet.length == 0) {
        alert('No characters chosen');
        return false;
      }
      this.characters = [];
      this.charactersHasSpace = false;
      this.charactersHasBlock = false;
      for(var i = 0; i < this.customTileSet.length; i++) {
        this.characters.push(this.customTileSet[i]);
      }

      if(this.customTileSet[i] == this.editor.tileSetManager.blankCharacter) {
        this.charactersHasSpace = true;
      }
      if(this.customTileSet[i] == 160) {
        this.charactersHasBlock = true;
      }
    } else {
    
      // set the characters to use
      this.characters = [];
      for(var i = 0; i < 256; i++) {
        this.characters.push(i);
      }
      this.charactersHasSpace = true;
      this.charactersHasBlock = true;
    }

    this.importImageAnimate = true;// $('input[name=importImageWithFrames]:checked').val() == 'on';
    this.frame = 0;

    this.frameCount= 1;

    if(this.importSource == 'video') {
      this.setVideoImportParams();
    }

    // no animation effects at the moment on mobile.
    if(this.importImageAnimate && !g_app.isMobile()) {
      this.setAnimationParameters();
      var ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
      if(!isNaN(ticksPerFrame)) {
        this.editor.graphic.setFrameDuration(ticksPerFrame);
        $('#frameDuration').val(ticksPerFrame);
      }
    }



//    importImage.imageData = importImage.srcContext.getImageData(0, 0, img.this, img.naturalHeight);     


    this.editor.history.startEntry('Import Image');

    this.importInProgress = true;

    if(this.importSource == 'video') {

      this.frameImportInProgress = true;
      this.frameReady = false;
      this.importingVideo = true;
      this.firstVideoFrame = true;

      if(this.videoPlaybackDirection == 'backwards') {
        this.importVideo.currentTime = this.videoEndAt / 1000;
      } else {
        this.importVideo.currentTime = this.videoStartAt / 1000;
      }
    } else {

      this.frameImportInProgress = true;
      this.frameReady = true;
      this.importingVideo = false;
      this.parameterChanged();

      this.updateProgress();

    }

    if(this.useMobile) {
      this.mobileImport.setColors(this.colors);
      this.mobileImport.setBGColors(this.bgColors);
      this.mobileImport.setCharacters(this.characters);
      this.mobileImport.setUseMultipleBGColors(this.multipleBackgroundColors);
      this.mobileImport.setBackgroundColorChoose(this.backgroundColorChoose);

//      this.mobileImport.setImageData(this.imageData);
//      this.mobileImport.startImport();

    } else  if(this.useShader) {


      this.shaderImport.setColors(this.colors);
      this.shaderImport.setBGColors(this.bgColors);
      this.shaderImport.setCharacters(this.characters);
      this.shaderImport.setUseMultipleBGColors(this.multipleBackgroundColors);
      this.shaderImport.setBackgroundColorChoose(this.backgroundColorChoose);
      //this.shaderImport.setImageData(this.imageData);
      //this.shaderImport.setSrcCanvas()
      this.shaderImport.startImport();

    } else {
      this.basicImport.setColors(this.colors);
      this.basicImport.setBGColors(this.bgColors);
      this.basicImport.setCharacters(this.characters);
      this.basicImport.setUseMultipleBGColors(this.multipleBackgroundColors);

      this.basicImport.setImageData(this.imageData);

      this.basicImport.startImport();
    }


    return true;


  },

  showProgress: function() {
    this.updateProgress();
  },

  updateProgress: function() {
    var imagesImported = this.frame + 1;
    $('#importImageProgressText').html('Frame ' + imagesImported + ' of ' + this.frameCount);
    $('#importImageProgress').show();  

    this.progressContext.clearRect(0,0, this.progressCanvas.width, this.progressCanvas.height);

    this.progressContext.drawImage(this.srcCanvas, 0, 0, this.progressCanvas.width, this.progressCanvas.height);
  },



  nextFrame: function() {

    if(!this.insertFrames && this.editor.graphic.getCurrentFrame() < this.editor.graphic.getFrameCount() - 1) {
      this.editor.frames.nextFrame();
    } else {
//      this.editor.frames.createFrame();
      var frame = this.editor.graphic.insertFrame();
      this.editor.frames.gotoFrame(frame);
    }

    var ticksPerFrame = 6;
    if(!g_app.isMobile()) {
      ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
    }
    this.editor.graphic.setFrameDuration(ticksPerFrame);

  },




  frameReadyForImport: function() {
    // update the import image
    this.parameterChanged();

    // update the progress text and preview image    
    this.updateProgress();

    // basic import needs to draw into a new frame
    if(!this.useShader) {

      // create a frame if its not video or importing video and not the first video frame
      if(!this.importingVideo ||  !this.firstVideoFrame ) {
        this.nextFrame();
      }
      this.firstVideoFrame = false;
      if(this.useMobile) {
        this.mobileImport.setImageData(this.imageData);
        this.mobileImport.startImport();        
      } else {
        this.basicImport.setImageData(this.imageData);
        this.basicImport.startImport();
      }
    }

    // set frame is ready
    this.frameReady = true;
  },




  updatePreview: function() {

    if(this.importSource == 'video' && !this.importInProgress && !this.importingVideo) {

      var time = getTimestamp();
      //var ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
      var ticksPerFrame = this.ticksPerFrame;
      if(time - this.lastPreviewUpdate > ticksPerFrame * 50 && this.videoFrameReady) {
        
        this.lastPreviewUpdate = time;

        this.frame++;

        var videoTime = 0;

        if(this.videoPlaybackDirection == 'backwards') {
          videoTime = (this.videoEndAt - this.frame * this.videoSampleEvery) / 1000;
        } else if(this.videoPlaybackDirection == 'pingpong') {
          if(this.frame < this.frameCount / 2) {
            videoTime = (this.videoStartAt + this.frame * this.videoSampleEvery) / 1000;
          } else {
            var midFrame = Math.ceil(this.frameCount / 2);
            var frame = midFrame - (this.frame - midFrame);


            videoTime = (this.videoStartAt + frame * this.videoSampleEvery) / 1000;
          }
        } else {
          videoTime = (this.videoStartAt + this.frame * this.videoSampleEvery) / 1000;
        }

        if(videoTime < 0) {
          videoTime = 0;
        }

        if(videoTime > this.importVideo.duration) {
          videoTime = this.importVideo.duration
        }

        if(!isNaN(videoTime)) {
          this.importVideo.currentTime = videoTime;

          this.videoFrameReady = false;
        }

        if(this.frame + 1 >= this.frameCount) {
          this.frame = -1;
        }
      }
    }


    if(this.previewAnimation && !this.importInProgress) {

      // not importing and want to preview animation...

      var time = getTimestamp();
      //var ticksPerFrame = parseInt($('#importImageTicksPerFrame').val());
      var ticksPerFrame = this.ticksPerFrame;


      if(time - this.lastPreviewUpdate > ticksPerFrame * 50) {
        this.lastPreviewUpdate = time;

        if(this.importSource == 'video') {
        } else {
          this.frame++;
          this.parameterChanged();
        }

        if(this.frame + 1 >= this.frameCount) {
          this.frame = -1;
        }
      }
    }    
  },

  update: function() {

    if(!this.importInProgress && !this.visible) {
      return;
    }

//    if(this.previewNeedsUpdate) {
      // update the preview in the import dialog
    if(this.frameCount > 1) {
      this.updatePreview();
    } else {
//      console.log(this.frameCount);
    }
//      this.previewNeedsUpdate = false;
//    }


    if(this.importInProgress) {

      if(this.frameImportInProgress && this.frameReady) {
        // currently importing a frame

        if(this.useMobile) {

          var imagesImported = this.frame + 1;
          var progress = 'Frame ' + imagesImported + ' of ' + this.frameCount;
          progress += ', ' + this.mobileImport.getProgress();
          $('#importImageProgressText').html(progress);

          if(this.frame != 0) {
            // create a new frame and blank it
//            this.nextFrame();
          }

          this.mobileImport.startImport();
          this.mobileImport.setImageData(this.imageData);


          // basic import will return if its finished a frame
          this.frameImportInProgress = false;//this.mobileImport.update();


        } else if(this.useShader) {

          this.shaderImport.setSrcCanvas(this.srcCanvas);


          // do the conversion
          this.shaderImport.convert();

          if(this.frame != 0) {
            // create a new frame and blank it
            this.nextFrame();
          }

          // update the frame
          this.shaderImport.updateFrame();

          // shader processes whole frame at once
          this.frameImportInProgress = false;

        } else {        
          // basic import does one cell at a time

          var imagesImported = this.frame + 1;
          var progress = 'Frame ' + imagesImported + ' of ' + this.frameCount;
          progress += ', ' + this.basicImport.getProgress();
          $('#importImageProgressText').html(progress);

          // basic import will return if its finished a frame
          this.frameImportInProgress = this.basicImport.update();
        }
      }


      // has frame finished importing
      if(!this.frameImportInProgress) {

        this.frame++;

        // frame is done, go to the next frame, or is import over
        if(this.frame >= this.frameCount) {
          // ok, import is done
          this.endImport();
        } else {

          // import is import is still happening
          this.importInProgress = true;
          this.frameImportInProgress = true;


          if(this.importSource == 'video') {
            // update the current time of the video, frame not ready until can play event fires
            this.frameReady = false;


            var videoTime = 0;

            if(this.videoPlaybackDirection == 'backwards') {
              videoTime = (this.videoEndAt - this.frame * this.videoSampleEvery) / 1000;
            } else if(this.videoPlaybackDirection == 'pingpong') {
              if(this.frame < this.frameCount / 2) {
                videoTime = (this.videoStartAt + this.frame * this.videoSampleEvery) / 1000;
              } else {
                var midFrame = Math.ceil(this.frameCount / 2);
                var frame = midFrame - (this.frame - midFrame);

                videoTime = (this.videoStartAt + frame * this.videoSampleEvery) / 1000;
              }
            } else {
              videoTime = (this.videoStartAt + this.frame * this.videoSampleEvery) / 1000;
            }

            if(videoTime < 0) {
              videoTime = 0;
            }

            if(videoTime > this.importVideo.duration) {
              videoTime = this.importVideo.duration
            }

            this.importVideo.currentTime = videoTime;

//            this.importVideo.currentTime = (this.videoStartAt + this.frame * this.videoSampleEvery) / 1000;
          } else {
            this.frameReadyForImport();
          }
        }
      }
    }
  }
}

