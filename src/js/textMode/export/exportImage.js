var ExportImage = function() {
  this.editor = null;


  this.maxExportWidth = 8192;
  this.maxExportHeight = 8192;


  // preview displayed on screen
  this.previewCanvas = null;
  this.previewContext = null;
  this.previewContextSmoothing = false;
  this.previewCanvasScale = null;


  this.canvas = null;
  this.context = null;


  this.exportFormat = 'gif';

  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8 + 4;

  this.userBorderWidth = 32;
  this.userBorderHeight = 36;
  
  this.scale = 1;
  this.addTransparentPixel = false;

  this.playMode = 'loop';

  this.imageEffectsControl = null;


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;

  this.mouseIsDown = false;
  this.touchCount = 0;


  this.exportLayer = 'all';
  this.showPrevFrameSave = false;


  // variables for playing frames
  this.fromFrame = 1;
  this.toFrame = 0;


  this.playDirection = 1;
  this.lastFrameTime = 0;
  this.lastTickTime = 0;
  this.playFrames = true;
  this.currentFrame = 0;
  this.tick = 0;
  this.frameTick = 0;
  this.framesTickCount = 0;
  this.startFrame = 0;
  this.endFrame = 0;

  this.exportProgressDialog = null;

  this.msPerTick = 50;

  // might be active but not visible if export is in progress
  this.visible = false;
  this.active = false;
  this.exportInProgress = false;
  this.shaderEffects = null; 


  // used for deciding whether to set the scale when displaying dialog
  this.lastGraphicWidth = false;
  this.lastGraphicHeight = false;

  this.clipboardCanvas = null;
}


ExportImage.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.shaderEffects = new ShaderEffects();
    this.shaderEffects.init();

    var _this = this;
    this.shaderEffects.on('paramchanged', function(param, value) {
      _this.drawFrame();
    });

    this.effects = [
      null,
      new MattiasCRTEffect(),
      new LotteCRTEffect(),
      new NoisyGlowEffect()
    ];
  },

  createProgressDialog: function() {
    var html = '<div>';
    html += '<h2>Export Progress</h2>';
    html += '<div id="exportImageProgressText"></div>';
    html += '</div>';

    this.exportProgressDialog = UI.create("UI.Dialog", 
      { 
        "id": "exportImageProgressDialog", 
        "title": "Export Progress", 
        "width": 280, 
        "height": 140 
      });

    this.exportProgressHTML = UI.create("UI.HTMLPanel", {"html": html});
    this.exportProgressDialog.add(this.exportProgressHTML);

  },


  htmlComponentLoaded: function(callback) {
    this.componentsLoaded++;
    if(this.componentsLoaded == 4) {
      this.splitPanel.setPanelVisible('east', true);
      this.splitPanel.resize();

      this.initContent();
      this.setExportScales({ chooseScale: true });
      this.setEffectsHTML();
      this.setEffect(0);

      this.initEvents();

      if(typeof callback != 'undefined') {
        callback();
      }
    }

  },

  createUI: function(callback) {
    var _this = this;
    
    if(this.uiComponent == null) {
      var width = 1340;
      var height = 920;
      this.uiComponent = UI.create("UI.Dialog", { 
        "id": "exportImageDialog", 
        "title": "Export Image", 
        "width": width, 
        "height": height 
      });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.componentsLoaded = 0;

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "exportImageSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.eastPanel = UI.create("UI.SplitPanel");
      this.splitPanel.addEast(this.eastPanel, 320);


      this.framesComponent = UI.create("UI.HTMLPanel");
      this.eastPanel.addNorth(this.framesComponent, 120);
      this.framesComponent.load('html/textMode/exportImageFrames.html', function() {
        _this.htmlComponentLoaded(callback);
      });

      this.effectsHtmlComponent = UI.create("UI.HTMLPanel");
      this.eastPanel.add(this.effectsHtmlComponent);
      //this.splitPanel.addEast(this.effectsHtmlComponent, 290);
      this.effectsHtmlComponent.load('html/textMode/exportImageEffects.html', function() {
        _this.htmlComponentLoaded(callback);        
      });

      this.propertiesSplit = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.propertiesSplit);

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.addSouth(this.htmlComponent, 250);

      this.htmlComponent.load('html/textMode/exportImage.html', function() {
        _this.htmlComponentLoaded(callback);      
      });

      this.previewComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.add(this.previewComponent);

      this.previewComponent.load('html/textMode/exportImagePreview.html', function() {
        _this.htmlComponentLoaded(callback);
        
      });

      this.previewComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-199-save.svg"> Download', "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportImage();
//        UI.closeDialog();
      });

      this.copyButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.copyButton);
      this.copyButton.on('click', function(event) {
        _this.copyToClipboard({});
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
        _this.active = false;
        _this.editor.frames.setShowPrevFrame(_this.showPrevFrameSave);
      });

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

      this.createProgressDialog();

    } else {
      
      this.initContent();
      this.setExportScales({ chooseScale: false });

      if(typeof callback != 'undefined') {
        callback();
      }
    }
  },


  setExportScales: function(args) {
    var chooseScale = false;
    if(typeof args != 'undefined' || typeof args.chooseScale != 'undefined') {
      chooseScale = args.chooseScale;
    }
    var graphic = this.editor.graphic;
    var width = graphic.getGraphicWidth();
    var height = graphic.getGraphicHeight();

    var maxScale = 10;
    var defaultScale = 3;

    // try to make the image size 1000x1000
    var defaultHScale = Math.floor(1000 / width);
    var defaultVScale = Math.floor(1000/height);

    if(defaultVScale < defaultHScale) {
      defaultHScale = defaultVScale;
    }

    defaultScale = defaultHScale;

    var maxHScale = Math.floor(this.maxExportWidth / width)
    var maxVScale = Math.floor(this.maxExportHeight / height)

    if(maxHScale > maxVScale) {
      maxHScale = maxVScale;
    }

    if(maxScale > maxHScale) {
      maxScale = maxHScale;
    }

    if(maxHScale > 12) {
      maxScale = 12;
    }

    if(maxScale < 1) {
      maxScale = 1;
    }

    if(defaultScale > maxScale) {
      defaultScale = maxScale;
    }

    if(defaultScale == 0) {
      defaultScale = 1;
    }

    var optionsHTML = '';
    for(var i = 1; i <= maxScale; i++) {
      var label = i * 100;
      label += '%';
      optionsHTML += '<option value="' + i + '">' + label + '</option>';
    }

    $('#exportImageScale').html(optionsHTML);
    $('#exportImageScale').val(defaultScale);

    console.log('set scale to ' + defaultScale);
    this.setScale(defaultScale);
    this.calculateImageDimensions();
    this.drawFrame();
//    _this.drawPreview();  


  },

  show: function() {
    this.lastTickTime = getTimestamp(); 
    if(g_app.isMobile()) {
      this.showMobile();
      return;
    }
    var _this = this;

    this.mouseIsDown = false;
    this.showPrevFrameSave = this.editor.frames.getShowPrevFrame();
    this.editor.frames.setShowPrevFrame(false);

    this.createUI();

    UI.showDialog("exportImageDialog");
    this.visible = true;
    this.active = true;
    //this.initContent();
    this.resizePreview();

    if(typeof ClipboardItem !== 'undefined') {
      this.copyButton.setVisible(true);
    } else {
      this.copyButton.setVisible(false);
    }
  },  


  showMobile: function() {
    var _this = this;

    this.mouseIsDown = false;

    var width = 500;
    var height = 100;

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    width = screenWidth - 30;
    height = screenHeight - 30;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.MobilePanel", { "id": "exportImageMobileDialog", "title": "Export Image", "width": width, "height": height });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });


      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);

//      this.splitPanel.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportImageMobile.html', function() {
//        _this.htmlComponentLoaded();      

        _this.initContent();
        _this.setExportScales({ chooseScale: true });

        _this.setEffectsHTML();
        _this.setEffect(0);

        _this.initEvents();
        
        UI.showDialog("exportImageMobileDialog");
        _this.resizePreview();
        _this.createProgressDialog();

      });


      this.htmlComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": "Export" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
//        _this.exportPng();
        _this.exportImage();
        //UI.closeDialog();
      });

      this.uiComponent.on('close', function() {        
        _this.visible = false;
        _this.active = false;
        _this.editor.frames.setShowPrevFrame(_this.showPrevFrameSave);

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
//      this.drawFrame();
      UI.showDialog("exportImageMobileDialog");
      this.initContent();
      this.setExportScales({ chooseScale: true });

    }

   
    this.visible = true;
    this.active = true;


  },  






  resizePreview: function() {
    if(!this.visible) {
      return;
    }

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportImagePreview');
      $('#exportImagePreview').on('mouseenter', function() {
        UI.setCursor('can-drag');
      });
      $('#exportImagePreview').on('mouseleave', function() {
//        UI.setCursor('default');
      });

    }

    var element = $('#exportImagePreviewHolder');
    if(!element || element.length == 0) {
      return;
    }

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

    this.previewContext = null;// this.previewCanvas.getContext('2d');// UI.getContextNoSmoothing(this.previewCanvas);

    this.drawPreview({ redrawLayers: false, applyEffects: false});
  },


  setEffectsHTML: function() {
    var html = '';
    for(var i = 0; i < this.effects.length; i++) {
      var effect = this.effects[i];
      if(!effect) {
        html += '<option value="' + i + '">No Effect</option>';
      } else {
        html += '<option value="' + i + '">' + effect.getName() + '</option>';
      }
    }

    var _this = this;
    $('#exportImageEffectOptions').html(html);
    $('#exportImageEffectOptions').on('change', function() {
      var value = $(this).val();
      _this.setEffect(value);
    });

  },

  initContent: function() {
    var _this = this;

    $('#exportImageAs').val(g_app.fileManager.filename);

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportImagePreview');
      this.previewContext = null;//this.previewCanvas.getContext('2d');

      /*
      this.previewContext.imageSmoothingEnabled = false;
      this.previewContext.webkitImageSmoothingEnabled = false;
      this.previewContext.mozImageSmoothingEnabled = false;
      this.previewContext.msImageSmoothingEnabled = false;
      this.previewContext.oImageSmoothingEnabled = false;
      */
    }

    if(this.imageEffectsControl == null) {
      this.imageEffectsControl = new ImageEffectsControl();
      this.imageEffectsControl.init({ "htmlElementId": 'exportImageEffects'});
      this.imageEffectsControl.on('update', function() {
        _this.drawPreview({ redrawLayers: false });
      });

      this.imageEffectsControl.on('updateParam', function() {
        _this.drawPreview({ redrawLayers: false });
      });
    }


    if($('input[name=exportImageLayer]:checked').length > 0) {
      this.exportLayer = $('input[name=exportImageLayer]:checked').val();
    }


    // frames
    var frameCount = this.editor.graphic.getFrameCount();    
    $('#exportImageToFrame').val(frameCount);
    $('#exportImageFromFrame').val(1);
    $('#exportImageFromFrame').attr('max', frameCount);
    $('#exportImageToFrame').attr('max', frameCount);

    $('#exportImageFrame').val(this.editor.graphic.getCurrentFrame() + 1);
    $('#exportImageFrame').attr('max', frameCount);

    this.playMode = $('#exportImageLoopType').val();

    this.addTransparentPixel = $('#exportImageTransparentPixel').is(':checked');


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;


    if(frameCount == 1 && !tileSet.hasAnimatedTiles() ) {
      _this.setExportFormat('png');
    } else {
      _this.setExportFormat('gif');
    }

    this.shaderEffects.setControlsParentId('exportImageEffectControls');
    this.drawPreview();

    this.resizePreview();
    this.setFrameParameters();
    this.calculateImageDimensions();
    this.calculateImageDuration();
  },

  initEvents: function() {
    var _this = this;

    $('#exportImageIncludeBorder').on('click', function() {
      console.log('borsder check!');
      _this.drawPreview();
      _this.calculateImageDimensions();
    });

    if($("input[type='radio'][name='exportImageScale']").length > 0) {
      $("input[type='radio'][name='exportImageScale']").on('click', function() {
        var scale = $("input[type='radio'][name='exportImageScale']:checked").val();
        _this.setScale(scale);
        _this.calculateImageDimensions();
        _this.drawPreview();
      });
    }

    if($('#exportImageScale').length > 0) {
      $('#exportImageScale').on('change', function() {
        var scale = $(this).val();
        _this.setScale(scale);
        _this.calculateImageDimensions();
        _this.drawPreview();  
      });
    }

    if($('#exportImageScale-inc').length > 0) {
      $('#exportImageScale-inc').on('click', function() {
        var value = $('#exportImageScale').val();
        var element = $('#exportImageScale').get(0);
        var options = element.options;
        var next = false;
        for(var i = 0; i < options.length; i++) {
          if(options[i].value == value && i < options.length - 1) {
            next = options[i + 1].value;          
          }
        }

        if(next !== false) {
          $('#exportImageScale').val(next);
          _this.setScale(next);
          _this.calculateImageDimensions();
          _this.drawPreview();  
        }
      });
    }

    if($('#exportImageScale-dec').length > 0) {
      $('#exportImageScale-dec').on('click', function() {
        var value = $('#exportImageScale').val();
        var element = $('#exportImageScale').get(0);
        var options = element.options;
        var prev = false;
        for(var i = 0; i < options.length; i++) {
          if(options[i].value == value) {
            break;
          }
          prev = options[i].value;
        }
        if(prev !== false) {
          $('#exportImageScale').val(prev);
          _this.setScale(prev);
          _this.calculateImageDimensions();
          _this.drawPreview();  
        }

      });
    }


    $('input[name=exportImageLayer]').on('click', function() {
      _this.exportLayer = $('input[name=exportImageLayer]:checked').val();
      _this.drawPreview();

    });

    $('#exportImageTransparentPixel').on('click', function() {
      _this.addTransparentPixel = $('#exportImageTransparentPixel').is(':checked');
      _this.drawPreview();
    });


    $('#exportImagePreview').on('mousedown', function(e) {
      _this.previewMouseDown(e);

    });

    $('#exportImagePreview').on('wheel', function(event) {
      _this.previewMouseWheel(event.originalEvent);
    });    


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




    $('#imageExportPreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#imageExportPreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#imageExportPreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });



    $('#exportImageLoopType').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportImageFromFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportImageFromFrame').on('keyup', function(event) {
      _this.setFrameParameters();
    });

    $('#exportImageToFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#exportImageToFrame').on('keyup', function(event) {
      _this.setFrameParameters();
    });


    $('#exportImageSpeed').on('change', function(event) {
      if($(this).val() == 'custom') {
        $('#exportImageCustomSpeed').show();
      } else {
        $('#exportImageCustomSpeed').hide();

      }
      _this.setFrameParameters();
    });


    $('input[name=exportImageFormat]').on('click', function() {
      var value = $('input[name=exportImageFormat]:checked').val();
      _this.setExportFormat(value);
    });

    $('#exportImageFrame').on('change', function() {
      _this.setFrameParameters();
    });

    $('#exportImageEffectPrev').on('click', function() {
      _this.gotoEffect(-1);
    });
    $('#exportImageEffectNext').on('click', function() {
      _this.gotoEffect(1);
    });

    $('#exportImageBorderReset').on('click', function() {
      $('#exportImageBorderWidth').val(32);
      $('#exportImageBorderHeight').val(36);
      _this.setBorderSize();
    });

    $('#exportImageBorderWidth,#exportImageBorderHeight').on('keyup', function() {
      _this.setBorderSize();
    });

    $('#exportImageBorderWidth,#exportImageBorderHeight').on('change', function() {
      _this.setBorderSize();
    });
  },


  setBorderSize: function() {
    var width = parseInt($('#exportImageBorderWidth').val(), 10);
    var height = parseInt($('#exportImageBorderHeight').val(), 10);

    if(!isNaN(width) && !isNaN(height)) {
      this.userBorderHeight = height;
      this.userBorderWidth = width;
    }

    this.calculateImageDimensions();
    this.drawFrame();
  },

  setExportFormat: function(format) {

    this.exportFormat = format;
    $('input[name=exportImageFormat][value=' + format + ']').prop('checked', true);

    this.lastTickTime = getTimestamp(); 
    switch(format) {
      case 'gif':
        $('.exportImagePNGParameters').hide();
        $('.exportImageGIFParameters').show();
        break;
      case 'png':
        $('.exportImagePNGParameters').show();
        $('.exportImageGIFParameters').hide();
        break;
    }

    this.setFrameParameters();
  },

  gotoEffect: function(offset) {
    var effectIndex = parseInt($('#exportImageEffectOptions').val(), 10);
    effectIndex += offset;
    if(effectIndex < 0) {
      effectIndex = this.effects.length - 1;
    }
    if(effectIndex >= this.effects.length) {
      effectIndex = 0;
    }
    this.setEffect(effectIndex);
  },

  setEffect: function(index) {
    $('#exportImageEffectOptions').val(index);
    if(!this.effects[index]) {
      $('#exportImageEffectControls').html('');
      this.effect = null;
    } else {
      this.effect = this.effects[index];
      this.shaderEffects.setEffect(this.effects[index]);
    }

    this.drawFrame();
  },

  calculateImageDimensions: function() {
    var includeBorder = $('#exportImageIncludeBorder').is(':checked') ;

    if(includeBorder) {
      $('#borderSizeHolder').show();
    } else {
      $('#borderSizeHolder').hide();
    }
   
    if(includeBorder) {
      this.borderWidth = this.userBorderWidth; //4 * 8;
      this.borderHeight = this.userBorderHeight; //4 * 8 + 4;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    }
    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;

    var html =  width + 'x' + height + ' pixels';

    $('#exportImageDimensions').html(html);

  },

  calculateImageDuration: function() {

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

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
    var html = 'Length ' + length + ' seconds';

    $('#exportImageDuration').html(html);
  },

  setFrameParameters: function() {
    var frameCount = this.editor.graphic.getFrameCount();

    if(this.exportFormat == 'png') {
      var frame = parseInt($('#exportImageFrame').val(), 10);
      if(!isNaN(frame)) {        
        frame = frame - 1;
        if(frame >= 0 && frame < frameCount) {
          this.currentFrame = frame;
          this.drawPreview();
        }
      }
    }

    if(this.exportFormat == 'gif') {
      this.playMode = $('#exportImageLoopType').val();

      var fromFrame = parseInt($('#exportImageFromFrame').val(), 10);
      if(!isNaN(fromFrame) && fromFrame >= 1 && fromFrame <= frameCount) {
        this.fromFrame = fromFrame;
      }

      var toFrame = parseInt($('#exportImageToFrame').val(), 10);
      if(!isNaN(toFrame) && toFrame >= 1 && toFrame <= frameCount) {
        this.toFrame = toFrame;
      }

      this.speed = $('#exportImageSpeed').val();

      this.msPerTick = 50;
      if(this.speed == 'custom') {
        this.msPerTick = parseInt($('#exportImageMSPerTick').val(), 10);
      }  else {
        this.msPerTick = FRAMERATE / parseInt(this.speed, 10);
      }  
    }

//    this.calculateGifInfo();

  },  

  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawPreview({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#imageExportPreviewScale').val(displayScale);
    $('#imageExportPreviewScaleText').val(displayScale);
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


  drawPreview: function(args) {

    // need to redraw characters?
    var redrawLayers = true;
    if(typeof args != 'undefined' && typeof args.redrawLayers != 'undefined') {
      redrawLayers = args.redrawLayers;
    }

    /*
    var applyEffects = true;
    if(typeof args != 'undefined' && typeof args.applyEffects != 'undefined') {
      applyEffects = args.applyEffects;
    }
    */

    if(redrawLayers) {
      this.drawFrame();
    }

    if(this.canvas == null || this.previewCanvas == null) {//} || this.previewContext == null) {
      // not ready yet
      return;
    }

    //this.previewContext.fillStyle = '#000000';
    //this.previewContext.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 

    if(this.previewContext == null || (this.previewScale < 1 && !this.previewContextSmoothing) ) {
      this.previewContext = this.previewCanvas.getContext('2d');// UI.getContextNoSmoothing(this.previewCanvas);
      this.previewContextSmoothing = true;
    } 

    if(this.previewCOntext == null || (this.previewScale >= 1 && this.previewContextSmoothing)) {
      this.previewContext = UI.getContextNoSmoothing(this.previewCanvas);
      this.previewContextSmoothing = false;
    }

    var previewWidth = this.previewCanvas.width;
    var previewHeight = this.previewCanvas.height;

    var checkerboardCanvas = this.editor.checkerboardPattern.getCanvas(previewWidth, previewHeight);
    this.previewContext.drawImage(checkerboardCanvas, 0, 0, previewWidth, previewHeight, 0, 0, previewWidth, previewHeight);

    this.previewContext.save();

    this.previewContext.translate( Math.floor(previewWidth / 2), Math.floor(previewHeight / 2)); 
    this.previewContext.scale(this.previewScale * this.previewCanvasScale, this.previewScale * this.previewCanvasScale);

    this.previewContext.drawImage(this.canvas, this.previewOffsetX, this.previewOffsetY);//, this.canvas.width * this.previewScale, this.canvas.height * this.previewScale);    

    this.previewContext.restore();

  },

  applyEffects: function() {

    var data = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);

    this.imageEffectsControl.applyEffects(data);

    this.context.putImageData(data,0,0);

  },

  readParameters: function() {

    this.includeBorder = $('#exportImageIncludeBorder').is(':checked') ;

/*
    var scale = parseInt($("input[type='radio'][name='exportImageScale']:checked").val());
    if(!isNaN(scale)) {
      this.scale = scale;
    }
*/

    var layers = $("input[type='radio'][name='exportImageLayer']:checked").val();

  },

  getScale: function() {
    return this.scale;
  },
  setScale: function(scale) {
    var oldScale = this.scale;

    this.scale = scale;

    this.previewOffsetY = Math.floor(this.previewOffsetY * this.scale / oldScale);    
    this.previewOffsetX = Math.floor(this.previewOffsetX * this.scale / oldScale);    
  },

  initCanvas: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;

    if(!this.canvas) {

      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      this.shaderEffects.setInput(this.canvas);

      this.shaderEffects.setOutput(this.canvas);
    }

    if(this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;//img.naturalWidth;
      this.canvas.height = height;//img.naturalHeight;

      this.context = this.canvas.getContext("2d");

      this.shaderEffects.setSize(width, height);
      
    }
  },



  // draw frame, this.canvas should have the frame afterwards
  drawFrame: function(args) {
    this.readParameters();

    var drawFrame = this.currentFrame;
    var includeBorder = this.includeBorder;
    var section = false;
    var effects = this.effect;
    var scale = this.scale;

    if(typeof args != 'undefined') {
      if(typeof args.frame != 'undefined') {
        drawFrame = args.frame
      }

      if(typeof args.includeBorder != 'undefined') {
        includeBorder = args.includeBorder;
      }

      if(typeof args.section != 'undefined') {
        section = args.section;
        if(section) {
          includeBorder = false;
        }
      }

      if(typeof args.scale != 'undefined') {
        scale = args.scale;
      }

      if(typeof args.effects != 'undefined') {
        effects = args.effects;
      }
    }


    if(includeBorder) {
      this.borderWidth = this.userBorderWidth;
      this.borderHeight = this.userBorderHeight;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 

    this.initCanvas();

    this.editor.exportFrameImage.exportFrame({
      scale: scale,
      includeBorder: includeBorder,
      borderWidth: this.borderWidth,
      borderHeight: this.borderHeight,
      addTransparentPixel: this.addTransparentPixel,
      layers: this.exportLayer,
      frame: drawFrame,
      section: section
    });

    if(effects) {
      this.shaderEffects.setInput(this.editor.exportFrameImage.getCanvas());  
      this.shaderEffects.setOutput(this.canvas);
      this.shaderEffects.applyEffects();
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);
    }

  },


  copyToClipboard: function(args) {
    if(typeof navigator == 'undefined' || typeof navigator.clipboard == 'undefined' || typeof navigator.clipboard.write == 'undefined') {
      return;
    }

    try {
      
      var section = false;
      var fromX = 0;
      var fromY = 0;
      var width = 0;
      var height = 0;

      if(typeof args != 'undefined') {
        if(typeof args.section != 'undefined') {
          section = args.section;
          if(section) {
            includeBorder = false;
            if(typeof args.fromX != 'undefined') {
              fromX = args.fromX;
            }
            if(typeof args.fromY != 'undefined') {
              fromY = args.fromY;
            }
            if(typeof args.width != 'undefined') {
              width = args.width;
            }
            if(typeof args.height != 'undefined') {
              height = args.height;
            }  
          }
        }
      }

      if(section) {
        if(!this.clipboardCanvas) {
          this.clipboardCanvas = document.createElement('canvas');
        }
        this.clipboardCanvas.width = width;
        this.clipboardCanvas.height = height;
        this.clipboardContext = this.clipboardCanvas.getContext('2d');
        this.clipboardContext.drawImage(this.canvas,
          fromX, fromY, width, height,
          0, 0, width, height
          );

        this.clipboardCanvas.toBlob(function(blob) { 
          var item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]); 
        });
    
      } else {
        this.canvas.toBlob(function(blob) { 
          var item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard.write([item]); 
        });
      }
    } catch(e) {

    }
  },

  exportImage: function() {

    switch(this.exportFormat) {
      case 'png':
        this.exportPng();
        UI.closeDialog();
        break;
      case 'gif':
        this.exportGif();
        break;
    }
  },


  exportPng: function() {
    var filename = $('#exportImageAs').val();
    this.drawPreview();
    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }
    var dataURL = this.canvas.toDataURL("image/png");    
    download(dataURL, filename, "image/png");    
  },


  exportGif: function() {
    var filename = $('#exportImageAs').val();
    if(filename.indexOf('.gif') == -1) {
      filename += '.gif';
    }
    var twitterExport = false;//$('#exportGIFShorten').is(':checked');    
    var fromFrame = this.fromFrame;
    var toFrame = this.toFrame;

    UI.showDialog("exportImageProgressDialog");
    this.exportInProgress = true;

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
    var elementTicks = [];

    var tileSet =  this.editor.tileSetManager.getCurrentTileSet();

    var characterTicks = tileSet.getAnimatedCharacterTicks();

    var ticks = 0;
    for(var i = fromFrame - 1; i < toFrame; i++) {
      ticks += this.editor.graphic.getFrameDuration(i);
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
      var frame = fromFrame - 1;
      var thisFrameTicks = 0;
      var lastFrameTick = 0;


      // find out how often to update effect time

      var maxFrameRate = 9;
      var ticksPerSecond = 1000 / this.msPerTick;
      var updateEffectsEvery = 1;
      
      // need to make sure number of ticks is greater than character animation frames
      tileSet.update(tick);

      this.currentFrame = frame;
      this.drawFrame();      

      var frameDirection = 1
      for(var tick = 1; tick < ticks; tick++) {
        thisFrameTicks++;
        this.shaderTime = tick / ticks;

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
        if(charsUpdated || nextFrame) {
          // need to add gif frame
          var duration = (tick - lastFrameTick) * this.msPerTick;

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
        }

      }

      // need to draw last frame
      var duration = (tick - lastFrameTick) * this.msPerTick;
      this.drawFrame();
      if(twitterExport) {
        gif.addFrame(this.context, {copy: true, delay: duration / 2 });
      } else {
        gif.addFrame(this.context, {copy: true, delay: duration });
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
  
        $('#exportImageProgressText').html(html);
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
    if(this.exportFormat == 'png') {
      this.lastTickTime = getTimestamp(); 
      return false;
    }

    var changed = false;
    this.startFrame = this.fromFrame - 1;
    this.endFrame = this.toFrame;

    if(this.startFrame < 0) {
      this.startFrame = 0;
    }

    if(this.endFrame >= this.editor.graphic.getFrameCount()) {
      this.endFrame = this.editor.graphic.getFrameCount();
    }

    var time = getTimestamp();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    while(time - this.lastTickTime >= this.msPerTick) {
      this.tick++;
      this.frameTick++;
      this.lastTickTime = this.lastTickTime + this.msPerTick;

      if(tileSet.update(this.tick)) {
        changed = true;
      }

      // call the scripting tick function
      if(TextMode.tick) {
        changed = true;
        TextMode.tick(this.tick);
      }

    }

    if(this.playFrames) {
      if(this.currentFrame < 0 || this.currentFrame >= this.editor.graphic.getFrameCount() ) {
        this.currentFrame = 0;
      }
      var frameDuration = this.editor.graphic.getFrameDuration(this.currentFrame);
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

          }          
        } else {
          if(frame >= this.endFrame) {

            frame = this.startFrame;
          }
        }

        if(this.currentFrame !== frame) {
          this.currentFrame = frame;
          changed = true;
        }
        this.lastFrameTime = time;
      }
    }


    return changed;

  },

  update: function() {
    if(!this.active) {
      return false;
    }

    
    if(this.updateFrame()) {
      this.drawFrame();
    }
    this.drawPreview({ redrawLayers: false });

    return true;
  }


}
