var LayerRefImage = function() {
  this.editor = null;

  this.doc = null;

  this.canvas = null;
  this.context = null;


  this.image = null;

  this.imageCanvas = null;
  this.imageContext = null;

  this.previewCanvas = null;
  this.previewContext = null;  

  this.backgroundCanvas = null;


  this.width = 0;
  this.height = 0;
}


LayerRefImage.prototype = {
  init: function(editor, layerId, layerRef) {
    this.editor = editor;
    this.layerId = layerId;
    this.layerRef = layerRef;
    this.connectToDoc();
  },

  getId: function() {
    return this.doc.layerId;
  },

  getLabel: function() {
    return this.doc.label;
  },
  getType: function() {
    return 'image';
  },

  isCurrentLayer: function() {
    return this.layerId == this.editor.layers.getSelectedLayerId();    
  },



/*
  getScreenMode: function() {
    return 'rgb';
  },
*/
  // find the layer's data in the doc..
  connectToDoc: function() {
    var doc = this.editor.doc;
    var layers = doc.data.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].layerId == this.layerId) {      
        this.doc = layers[i];
      }
    }

    if(typeof this.doc.width == 'undefined') {
      this.doc.width = 1;      
    }

    if(typeof this.doc.height == 'undefined') {
      this.doc.height = 1;      
    }

  },



  loadFromDoc: function(editor, layerId, layerRef) {
    this.editor = editor;
    this.layerId = layerId;
    this.layerRef = layerRef;
    this.connectToDoc();

    var image = new Image();
    image.src =  this.doc.imageData;


    var _this = this;
    image.onload = function() {


//      if(typeof _this.doc.width == 'undefined') {
        _this.doc.width = image.naturalWidth;      
//      }

//      if(typeof _this.doc.height == 'undefined') {
        _this.doc.height = image.naturalHeight;      
//      }

      var args = {};
      args.image = image;
      args.params = {
        x: 0,
        y: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        colorReductionMethod: "none",
        scale: 100
      }
      args.imageData = _this.doc.imageData;
      _this.setArgs(args);
      _this.editor.graphic.redraw();
      _this.updatePreview();
//      _this.editor.layers.updateLayerPreview(this.layerId);
      /*
      _this.originalImage = image;
      _this.layers[index].image.width = image.naturalWidth;
      _this.layers[index].image.height = image.naturalHeight;

      var context = _this.layers[index].image.getContext('2d');
      context.drawImage(image, 0, 0);
      _this.updateLayerPreview(_this.layers[index].layerId);
      _this.editor.grid.update();
      */
    }


  },


  setDimensions: function(width, height) {
    this.doc.width = width;
    this.doc.height = height;
  },

  setArgs: function(args) {
    this.image = args.image;
    this.originalImage = args.image;
    this.params = args.params;

    if(typeof this.params.originalImage == 'undefined') {
      this.params.originalImage = this.image;
    }

    this.doc.imageData = args.imageData;



    if(this.imageCanvas == null) {
      this.imageCanvas = document.createElement('canvas');
    }

    this.imageCanvas.width = this.doc.width;
    this.imageCanvas.height = this.doc.height;
    this.imageContext = this.imageCanvas.getContext('2d');
    this.imageContext.drawImage(this.image, 0, 0);

    var canvas = this.getCanvas();
    var context = canvas.getContext('2d');
    context.drawImage(this.image, 0, 0);


  },

  getParams: function() {
    return this.params;
  },

  getOriginalImage: function() {

    return this.originalImage;
  },

  setPreviewCanvasElementId: function(elementId) {
    this.previewCanvas = document.getElementById(elementId);
  },


  getCanvas: function() {
    if(this.canvas == null) {
      this.canvas = document.createElement('canvas');
    }

    if(this.image !== null) {
      var layerWidth = this.doc.width;
      var layerHeight = this.doc.height;

      if(layerWidth == 0) {
        layerWidth = 1;
      }
      if(layerHeight == 0) {
        layerHeight = 1;
      }

      if(this.canvas.width != layerWidth || this.canvas.height != layerHeight) {
        if(layerWidth != 0) {
          this.canvas.width = layerWidth;
        }

        if(layerHeight != 0) {
          this.canvas.height = layerHeight;
        }
      }
    }

    return this.canvas;
  },


  updatePreview: function() {

    console.log('update preview!!!');
    var previewWidth = this.doc.width;
    var previewHeight = this.doc.height;



    // need to fit into 80x80
    var maxWidth = 80;
    var maxHeight = 80;
    if(previewWidth > maxWidth) {
      previewHeight = (maxWidth / previewWidth) * previewHeight;
      previewWidth = maxWidth;
    }

    if(previewHeight > maxHeight) {
      previewWidth = (maxHeight / previewHeight) * previewWidth;
      previewHeight = maxHeight;
    }


    if(this.previewCanvas.width != previewWidth || this.previewCanvas.height != previewHeight) {
      this.previewCanvas.width = previewWidth;
      this.previewCanvas.height = previewHeight;
    }
    this.previewContext = this.previewCanvas.getContext('2d');


    // background canvas
    if(this.backgroundCanvas == null) {
      this.backgroundCanvas = document.createElement('canvas');
    }

    // if background canvas isn't correct size, create it..
    if(this.backgroundCanvas.width != this.previewCanvas.width || this.backgroundCanvas.height != this.previewCanvas.height) {

      this.backgroundCanvas.width = this.previewCanvas.width;
      this.backgroundCanvas.height = this.previewCanvas.height;
      this.backgroundContext = this.backgroundCanvas.getContext('2d');

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
    }

    this.previewContext.drawImage(this.backgroundCanvas, 0, 0, this.previewCanvas.width, this.previewCanvas.height);

    this.previewContext.drawImage(this.getCanvas(), 0, 0, this.previewCanvas.width, this.previewCanvas.height); 

  },

  draw: function(args) {

    console.log('draw!!');
    var canvas = args.canvas;
    var context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);     

//      this.backgroundContext.fillStyle = '#ff0000';
//    context.fillRect(30, 30, 100, 100);   
    if(this.imageCanvas) {
      context.drawImage(this.imageCanvas, 0, 0);//, canvas.width, canvas.height);    
    }
  }
}

