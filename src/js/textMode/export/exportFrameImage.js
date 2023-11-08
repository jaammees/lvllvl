var ExportFrameImage = function() {
  this.editor = null;

  this.layersCanvas = null;
  this.layersContext = null;
  this.screenCanvas = null;
  this.screenContext = null;

  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8 + 4;

  this.scale = 1;
  
}


ExportFrameImage.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  initCanvas: function() {

    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale ;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;

    if(!this.layersCanvas) {

      this.layersCanvas = document.createElement("canvas");
      this.layersContext = this.layersCanvas.getContext("2d");
    }

    if(this.layersCanvas.width != width || this.layersCanvas.height != height) {    

      this.layersCanvas.width = width;//img.naturalWidth;
      this.layersCanvas.height = height;//img.naturalHeight;

      this.layersContext = this.layersCanvas.getContext("2d");
    }
  
  },

  exportFrame: function(args) {
    this.scale = args.scale;
    this.includeBorder = args.includeBorder;
    var layers = args.layers;
    
    if(layers == 'current') {
      layers = this.editor.layers.getSelectedLayerId();
    }

    var frame = 0;
    if(typeof args.frame != 'undefined') {
      frame = args.frame;
    }
    var addTransparentPixel = false;
    if(typeof args.addTransparentPixel != 'undefined') {
      addTransparentPixel = args.addTransparentPixel;
    }

    if(this.includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8 + 4;

      if(typeof args.borderWidth != 'undefined') {
        this.borderWidth = args.borderWidth;
      }

      if(typeof args.borderHeight != 'undefined') {
        this.borderHeight = args.borderHeight;
      }
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    } 

    
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    var exportWidth = (screenWidth + this.borderWidth * 2) * this.scale;
    var exportHeight = (screenHeight + this.borderHeight * 2) * this.scale;


    this.initCanvas();


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
      this.layersContext.fillRect(0, 0, this.borderWidth * this.scale, exportHeight); 
      this.layersContext.fillRect(exportWidth - this.borderWidth * this.scale, 0, this.borderWidth * this.scale, exportHeight); 

      this.layersContext.fillRect(0, 0, exportWidth, this.borderHeight * this.scale); 
      this.layersContext.fillRect(0, exportHeight - this.borderHeight * this.scale, exportWidth, this.borderHeight * this.scale); 
    }

    this.layersContext.clearRect(this.borderWidth * this.scale, 
                          this.borderHeight * this.scale, 
                          exportWidth - (this.borderWidth * this.scale * 2),
                          exportHeight - (this.borderHeight * this.scale * 2) );


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

    this.editor.graphic.invalidateAllCells();

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
        frame: frame, 
        layers: layers,
        scale: this.scale,
        dstX: this.borderWidth * this.scale,
        dstY: this.borderHeight * this.scale
      });
    } else {
      this.editor.grid.grid2d.drawFrame({ canvas: this.screenCanvas, context: this.screenContext, frame: frame, layers: layers });
      // draw it rescaled
      this.layersContext.drawImage(this.screenCanvas, this.borderWidth * this.scale, this.borderHeight * this.scale, 
        this.screenCanvas.width * this.scale, this.screenCanvas.height * this.scale);
    }

    if(this.addTransparentPixel) {
      var imageData = this.layersContext.getImageData(0,0,exportWidth, exportHeight);
      imageData.data[3] = 100;
      this.layersContext.putImageData(imageData,0,0);
    }    
  },

  getCanvas: function() {
    return this.layersCanvas;
  }
}