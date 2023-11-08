var ExportPngMobile = function() {
  this.editor = null;

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = null;

  this.layersCanvas = null;

  this.canvas = null;
  this.context = null;

  this.screenCanvas = null;
  this.screenContext = null;


  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8;
  this.scale = 1;
  this.addTransparentPixel = false;

  this.playMode = 'loop';

  this.imageEffectsControl = null;


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;

  this.mouseIsDown = false;

  this.exportLayer = 'all';

  this.touchCount = 0;
}


ExportPngMobile.prototype = {

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

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.MobilePanel", { "id": "exportPngMobileDialog", "title": "Export PNG", "width": width, "height": height });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });


      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);

//      this.splitPanel.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportPngMobile.html', function() {
        _this.htmlComponentLoaded();      
      });


      this.htmlComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": "Export" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportPng();
        UI.closeDialog();
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

    UI.showDialog("exportPngMobileDialog");
  },  



  resizePreview: function() {
    console.log('resize preview');
    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportPngMobilePreview');
    }

    this.previewCanvasScale = Math.floor(UI.devicePixelRatio);

/*
    var element = $('#exportPngMobilePreviewHolder');

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }

    if(this.width != this.previewCanvas.style.width || this.height != this.previewCanvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        


      }
    }
*/

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

    if(typeof ClipboardItem !== 'undefined') {
      $('#pngExportCopyToClipboard').show();
      $('#exportPNGMobileCanvasHolder').css('height', '270px');
      $('#exportPNGMobileControlsHolder').css('top', '282px');
    } else {
      $('#pngExportCopyToClipboard').hide();
      $('#exportPNGMobileCanvasHolder').css('height', '240px');
      $('#exportPNGMobileControlsHolder').css('top', '252px');
    }


    $('#exportPNGMobileAs').val(g_app.fileManager.filename);

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportPngMobilePreview');
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


    this.addTransparentPixel = false;//$('#exportPNGMobileTransparentPixel').is(':checked');

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth = this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;



    this.drawPreview();

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



    $('#pngExportCopyToClipboard').on('click', function() {
      _this.copyToClipboard();
    });



    $('#exportPNGMobileIncludeBorder').on('click', function() {
      _this.drawPreview();
    });

/*
    $("input[type='radio'][name='exportPNGMobileScale']").on('click', function() {
      var scale = $("input[type='radio'][name='exportPNGMobileScale']:checked").val();
      _this.setScale(scale);
      _this.drawPreview();
    });
*/
    $('#exportPNGMobileScale').on('change', function() {
      var scale = parseInt($(this).val(), 10);
      if(isNaN(scale)) {
        return;
      }
      _this.setScale(scale);
      _this.drawPreview();

    });

    $('input[name=exportPNGMobileLayer]').on('click', function() {
      _this.exportLayer = $('input[name=exportPNGMobileLayer]:checked').val();
      _this.drawPreview();

    });

    $('#exportPNGMobileTransparentPixel').on('click', function() {
      _this.addTransparentPixel = $('#exportPNGMobileTransparentPixel').is(':checked');
      _this.drawPreview();
    });


    $('#exportPngMobilePreview').on('mousedown', function(e) {
      _this.previewMouseDown(e);

    });


    $('#pngExportMobilePreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#pngExportMobilePreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#pngExportMobilePreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });

  },



  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawPreview({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#pngExportMobilePreviewScale').val(displayScale);
    $('#pngExportMobilePreviewScaleText').val(displayScale);
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
      this.applyEffects();

//      this.context.drawImage(this.layersCanvas, 0, 0);

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

    this.includeBorder = $('#exportPNGMobileIncludeBorder').is(':checked') ;

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

    /*
    this.readParameters();
    var layers = this.exportLayer;
    if(layers == 'current') {
      layers = this.editor.layers.getSelectedLayerId();
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var z = this.editor.grid.xyPosition;
    var width = this.editor.grid.width;
    var height = this.editor.grid.height;

    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();


    if(this.includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 

    this.initCanvas();


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

    if(this.screenContext == null || this.screenCanvas.width != graphicWidth || this.screenCanvas.height != graphicHeight) {
      this.screenCanvas.width = graphicWidth;
      this.screenCanvas.height = graphicHeight;
      this.screenContext = this.screenCanvas.getContext('2d');

      this.screenContext.imageSmoothingEnabled = false;
      this.screenContext.webkitImageSmoothingEnabled = false;
      this.screenContext.mozImageSmoothingEnabled = false;
      this.screenContext.msImageSmoothingEnabled = false;
      this.screenContext.oImageSmoothingEnabled = false;
    }


    this.editor.grid.grid2d.drawFrame({ canvas: this.screenCanvas, context: this.screenContext, frame: this.currentFrame, layers: layers });

    this.layersContext.imageSmoothingEnabled = false;
    this.layersContext.webkitImageSmoothingEnabled = false;
    this.layersContext.mozImageSmoothingEnabled = false;
    this.layersContext.msImageSmoothingEnabled = false;
    this.layersContext.oImageSmoothingEnabled = false;

    // draw it rescaled
    this.layersContext.drawImage(this.screenCanvas, this.borderWidth * this.scale, this.borderHeight * this.scale, 
      this.screenCanvas.width * this.scale, this.screenCanvas.height * this.scale);

    if(this.addTransparentPixel) {
      var imageData = this.layersContext.getImageData(0,0,this.canvas.width, this.canvas.height);
      imageData.data[3] = 100;
      this.layersContext.putImageData(imageData,0,0);
    }
*/
  },

  copyToClipboard: function() {
    this.canvas.toBlob(function(blob) { 
      var item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]); 
    });

  },

  exportPng: function() {
    var filename = $('#exportPNGMobileAs').val();

    this.drawPreview();

    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }

    var dataURL = this.canvas.toDataURL("image/png"); 
    if(UI.isMobile.any()) {
      mobileDownload({ data: dataURL, filename: filename, mimeType: "image/png" });      
    } else {
      download(dataURL, filename, "image/png");    
    }
  }

}