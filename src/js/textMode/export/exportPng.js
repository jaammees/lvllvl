var ExportPng = function() {
  this.editor = null;

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = null;


  this.canvas = null;
  this.context = null;

  /*
  this.layersCanvas = null;
  this.layersContext = null;
  this.screenCanvas = null;
  this.screenContext = null;
  */

  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8 + 4;
  this.scale = 1;
  this.addTransparentPixel = false;

  this.playMode = 'loop';

  this.imageEffectsControl = null;


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;

  this.mouseIsDown = false;

  this.exportLayer = 'all';
  this.showPrevFrameSave = false;
  this.visible = false;

}


ExportPng.prototype = {


  init: function(editor) {
    this.editor = editor;
  },


  htmlComponentLoaded: function() {
    this.componentsLoaded++;
    if(this.componentsLoaded == 3) {
      this.splitPanel.setPanelVisible('east', true);
      this.splitPanel.resize();

      this.initContent();
      this.initEvents();
    }

  },

  createUI: function() {
    var _this = this;
    
    if(this.uiComponent == null) {
      var width = 800;
      var height = 800;
      this.uiComponent = UI.create("UI.Dialog", { 
        "id": "exportPngDialog", 
        "title": "Export PNG", 
        "width": width, 
        "height": height 
      });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.componentsLoaded = 0;

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "exportPngSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.effectsHtmlComponent = UI.create("UI.HTMLPanel");
      this.splitPanel.addEast(this.effectsHtmlComponent, 290);
      this.effectsHtmlComponent.load('html/textMode/exportPngEffects.html', function() {
        _this.htmlComponentLoaded();        
      });

      this.propertiesSplit = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.propertiesSplit);

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.addSouth(this.htmlComponent, 220);

//      this.splitPanel.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportPng.html', function() {
        _this.htmlComponentLoaded();      
      });

      this.previewComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.add(this.previewComponent);

      this.previewComponent.load('html/textMode/exportPngPreview.html', function() {
        _this.htmlComponentLoaded();
        
      });

      this.previewComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-199-save.svg"> Download', "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportPng();
        UI.closeDialog();
      });

      this.copyButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.copyButton);
      this.copyButton.on('click', function(event) {
        _this.copyToClipboard();
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
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


    } else {
      this.initContent();
    }
  },

  show: function() {
    var _this = this;

    this.mouseIsDown = false;
    this.showPrevFrameSave = this.editor.frames.getShowPrevFrame();
    this.editor.frames.setShowPrevFrame(false);

    this.createUI();

    UI.showDialog("exportPngDialog");
    this.visible = true;
    //this.initContent();
    this.resizePreview();

    if(typeof ClipboardItem !== 'undefined') {
      this.copyButton.setVisible(true);
    } else {
      this.copyButton.setVisible(false);
    }

  },  



  resizePreview: function() {
    if(!this.visible) {
      return;
    }

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportPngPreview');
      $('#exportPngPreview').on('mouseenter', function() {
        UI.setCursor('can-drag');
      });
      $('#exportPngPreview').on('mouseleave', function() {
//        UI.setCursor('default');
      });

    }

    var element = $('#exportPngPreviewHolder');
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

    $('#exportPNGAs').val(g_app.fileManager.filename);

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportPngPreview');
      this.previewContext = this.previewCanvas.getContext('2d');
      this.previewContext.imageSmoothingEnabled = false;
      this.previewContext.webkitImageSmoothingEnabled = false;
      this.previewContext.mozImageSmoothingEnabled = false;
      this.previewContext.msImageSmoothingEnabled = false;
      this.previewContext.oImageSmoothingEnabled = false;

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


    this.exportLayer = $('input[name=exportPNGLayer]:checked').val();

    this.addTransparentPixel = $('#exportPNGTransparentPixel').is(':checked');


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;


//    this.resizePreview();
    this.drawPreview();

  },

  initEvents: function() {
    var _this = this;

    $('#exportPNGIncludeBorder').on('click', function() {
      _this.drawPreview();
    });

    $("input[type='radio'][name='exportPNGScale']").on('click', function() {
      var scale = $("input[type='radio'][name='exportPNGScale']:checked").val();
      _this.setScale(scale);
      _this.drawPreview();
    });

    $('input[name=exportPNGLayer]').on('click', function() {
      _this.exportLayer = $('input[name=exportPNGLayer]:checked').val();
      _this.drawPreview();

    });

    $('#exportPNGTransparentPixel').on('click', function() {
      _this.addTransparentPixel = $('#exportPNGTransparentPixel').is(':checked');
      _this.drawPreview();
    });


    $('#exportPngPreview').on('mousedown', function(e) {
      _this.previewMouseDown(e);

    });

    $('#exportPngPreview').on('wheel', function(event) {
      _this.previewMouseWheel(event.originalEvent);
    });    



    $('#pngExportPreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#pngExportPreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#pngExportPreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });

  },



  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawPreview({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#pngExportPreviewScale').val(displayScale);
    $('#pngExportPreviewScaleText').val(displayScale);
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

  drawPreview: function(args) {

    // need to redraw characters?
    var redrawLayers = true;
    if(typeof args != 'undefined' && typeof args.redrawLayers != 'undefined') {
      redrawLayers = args.redrawLayers;
    }

    var applyEffects = true;
    if(typeof args != 'undefined' && typeof args.applyEffects != 'undefined') {
      applyEffects = args.applyEffects;
    }

    var frame = this.editor.graphic.getCurrentFrame();

    if(redrawLayers) {
      this.drawFrame(frame, this.exportLayer);
    }

    if(applyEffects) {
      this.context.drawImage(this.editor.exportFrameImage.getCanvas(), 0 , 0);
//      this.context.drawImage(this.layersCanvas, 0, 0);
      this.applyEffects();
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

    this.previewContext.drawImage(this.canvas, this.previewOffsetX, this.previewOffsetY);//, this.canvas.width * this.previewScale, this.canvas.height * this.previewScale);    

    this.previewContext.restore();

  },

  applyEffects: function() {

    var data = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);

    this.imageEffectsControl.applyEffects(data);

    this.context.putImageData(data,0,0);

  },

  readParameters: function() {

    this.includeBorder = $('#exportPNGIncludeBorder').is(':checked') ;

/*
    var scale = parseInt($("input[type='radio'][name='exportPNGScale']:checked").val());
    if(!isNaN(scale)) {
      this.scale = scale;
    }
*/

    var layers = $("input[type='radio'][name='exportPNGLayer']:checked").val();

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
    }

    if(this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;//img.naturalWidth;
      this.canvas.height = height;//img.naturalHeight;

      this.context = this.canvas.getContext("2d");
    }

    /*
    if(!this.layersCanvas) {

      this.layersCanvas = document.createElement("canvas");
      this.layersContext = this.layersCanvas.getContext("2d");
    }

    if(this.layersCanvas.width != width || this.layersCanvas.height != height) {    

      this.layersCanvas.width = width;//img.naturalWidth;
      this.layersCanvas.height = height;//img.naturalHeight;

      this.layersContext = this.layersCanvas.getContext("2d");
    }
    */

  },



  // draw frame to layersCanvas
  drawFrame: function(frame, whichLayers) {

    this.readParameters();

    if(this.includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8 + 4;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 

    this.initCanvas();

    this.editor.exportFrameImage.exportFrame({
      scale: this.scale,
      includeBorder: this.includeBorder,
      addTransparentPixel: this.addTransparentPixel,
      layers: this.exportLayer,
      frame: frame
    });


    return;

    var layers = this.exportLayer;
    if(layers == 'current') {
      layers = this.editor.layers.getSelectedLayerId();
    }
    
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    if(this.includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8 + 4;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 



    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw the border
    if(this.borderWidth != 0 || this.borderHeight != 0) {


      var borderColorIndex = false;

      for(var i = 0; i < this.editor.layers.layers.length; i++) {
        var layer = this.editor.layers.layers[i];
        if( (layer.type == 'grid' ) 
          && ((layer.visible && layers == 'visible')
              || (layers == 'all')
              || (layers == layer.layerId) 
        )) {

          var layerObject = null;
          layerObject = this.editor.layers.getLayerObject(layer.layerId);
          if(layerObject && typeof layerObject.getBorderColor != 'undefined') {
            borderColorIndex = layerObject.getBorderColor();
          }
        }
      }      
      var borderColor = colorPalette.getHexString(borderColorIndex);
      
      this.layersContext.fillStyle = '#' + borderColor;
      this.layersContext.fillRect(0, 0, this.borderWidth * this.scale, this.canvas.height); 
      this.layersContext.fillRect(this.canvas.width - this.borderWidth * this.scale, 0, this.borderWidth * this.scale, this.canvas.height); 

      this.layersContext.fillRect(0, 0, this.canvas.width, this.borderHeight * this.scale); 
      this.layersContext.fillRect(0, this.canvas.height - this.borderHeight * this.scale, this.canvas.width , this.borderHeight * this.scale); 
    }

    this.layersContext.clearRect(this.borderWidth * this.scale, 
                          this.borderHeight * this.scale, 
                          this.canvas.width - (this.borderWidth * this.scale * 2),
                          this.canvas.height - (this.borderHeight * this.scale * 2) );


    if(this.screenCanvas == null) {
      this.screenCanvas = document.createElement('canvas');
    }

    if(this.screenContext == null || this.screenCanvas.width != screenWidth || this.screenCanvas.height != screenHeight) {
      this.screenCanvas.width = screenWidth;
      this.screenCanvas.height = screenHeight;
      this.screenContext = UI.getContextNoSmoothing(this.screenCanvas);
    }

    this.layersContext.imageSmoothingEnabled = false;
    this.layersContext.webkitImageSmoothingEnabled = false;
    this.layersContext.mozImageSmoothingEnabled = false;
    this.layersContext.msImageSmoothingEnabled = false;
    this.layersContext.oImageSmoothingEnabled = false;


    if(g_newSystem) {    
      this.editor.graphic.drawFrame({ 
        allCells: true,
        graphicOnly: true,

        /*
        canvas: this.screenCanvas, 
        context: this.screenContext, 
        */
        canvas: this.layersCanvas,
        context: this.layersContext,
        frame: this.currentFrame, 
        layers: layers,
        scale: this.scale,
        dstX: this.borderWidth * this.scale,
        dstY: this.borderHeight * this.scale
      });
    } else {
      this.editor.grid.grid2d.drawFrame({ canvas: this.screenCanvas, context: this.screenContext, frame: this.currentFrame, layers: layers });
      // draw it rescaled
      this.layersContext.drawImage(this.screenCanvas, this.borderWidth * this.scale, this.borderHeight * this.scale, 
        this.screenCanvas.width * this.scale, this.screenCanvas.height * this.scale);
    }

    


    if(this.addTransparentPixel) {
      var imageData = this.layersContext.getImageData(0,0,this.canvas.width, this.canvas.height);
      imageData.data[3] = 100;
      this.layersContext.putImageData(imageData,0,0);
    }

  },


  copyToClipboard: function() {
    this.canvas.toBlob(function(blob) { 
      var item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]); 
    });
  },

  exportPng: function() {
    var filename = $('#exportPNGAs').val();

    this.drawPreview();

    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }


    var dataURL = this.canvas.toDataURL("image/png");    
    download(dataURL, filename, "image/png");    
  }

}
