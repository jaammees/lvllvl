var Graphic = function() {
  this.editor = null;

  this.frames = [];
  this.frameCount = 0;
  this.currentFrame = 0;

  // if not set per layer..
  this.tileSetId = false;
  this.colorPaletteId = false;
  this.gridWidth = 40;
  this.gridHeight = 25;

  this.cellWidth = 8;
  this.cellHeight = 8;

  this.depth = 1;

  // for the last draw, was only the visible cells drawn
  this.onlyViewBoundsDrawn = true;


  // used by drawFrame
  this.tempCanvas = null;
  this.shapesCanvas = null;
  this.lastDrawnPrevFrame = false;

  this.drawEnabled = true;

  this.doc = null;

  //this.type = 'sprite';
  this.type = 'screen';

  this.thumbnailCanvas = null;

}

Graphic.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  connectToDoc: function() {
    var doc = this.editor.doc;

    if(doc.data.frames == null) {
      doc.data.frames = [];
    }

    this.doc = doc;
    this.frames = doc.data.frames;
    this.frameCount = this.frames.length;
    this.editor.layers.load();
  },



  getFrameRanges: function() {
    if(typeof this.doc.data.frameRanges === 'undefined') {
      this.doc.data.frameRanges = [
        {
          start: 0,
          end: this.getFrameCount()
        }
      ];
    }

    return this.doc.data.frameRanges;
  },

  setFrameRanges: function(frameRanges) {
    this.doc.data.frameRanges = frameRanges;
  },

  /*
  hasTileOrientation: function() {
    return false;
  },
  */

  getHasTileMaterials: function() {
    var hasTileMaterials = this.doc.data.hasTileMaterials;
    if(typeof hasTileMaterials === 'undefined') {
      return false;
    }

    return hasTileMaterials;
  },


  setHasTileMaterials: function(hasTileMaterials) {
    this.doc.data.hasTileMaterials = hasTileMaterials;
  },

  getHasTileFlip: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      return layer.getHasTileFlip();
    }

    return false;
  },

  setHasTileFlip: function(hasFlip) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    layer.setHasTileFlip(hasFlip);

  },


  getHasTileRotate: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      return layer.getHasTileRotate();
    }
    return false;
  },

  setHasTileRotate: function(hasRotate) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    layer.setHasTileRotate(hasRotate);

  },



  loadJSON: function(json) {
    var frames = json.frames;
    var layers = json.layers;
    var name = json.name;

    var gridWidth = layers[0].gridWidth;
    var gridHeight = layers[0].gridHeight;

    this.doc.data.frames = frames;
    this.frames = this.doc.data.frames;

    this.setGridDimensions({
      width: gridWidth,
      height: gridHeight
    });

    var layerObject = this.editor.layers.getSelectedLayerObject();
    layerObject.setFromJSON(layers[0]);

    if(layers.length > 0) {
      for(var i = 1; i < layers.length; i++) {
        var layerId = this.editor.layers.newLayer({
          label: layers[i].label,
          type: "grid"
        });
        layerObject = this.editor.layers.getLayerObject(layerId);
        layerObject.setFromJSON(layers[i]);

      }
    }
  },

  getJSON: function(args) {
    var fromFrame = 0;
    var toFrame = this.getFrameCount();
    var includeLayers = 'all';
    var direction = 'bottomtotop';

    if(typeof args != 'undefined') {
      if(typeof args.fromFrame != 'undefined') {
        fromFrame = args.fromFrame;
      }

      if(typeof args.toFrame != 'undefined') {
        toFrame = args.toFrame;
      }

      if(typeof args.layers != 'undefined') {
        includeLayers = args.layers;
      }

      if(typeof args.direction != 'undefined') {
        direction = args.direction;
      }
    }

    var data = {};
    var value = [];
    data.frames = [];
    for(var i = fromFrame; i < toFrame; i++) {    
      data.frames.push(this.frames[i]);
    }

    data.frameRanges = this.doc.data.frameRanges;

    data.layers = [];


    var layers = this.editor.layers.getLayers();
    for(var i = 0; i < layers.length; i++) {
      var layer = this.editor.layers.getLayerObject(layers[i].layerId);
      if(layer) {
        data.layers.push(layer.getJSON(args));
      }
    }


    data.name = this.doc.name;

    return data;
  },



  getType: function() {
    return this.type;

  },

  getThumbnailCanvas: function() {
    var width = 90;
    var height = 90;
    if(this.thumbnailCanvas == null) {
      this.thumbnailCanvas = document.createElement('canvas');
    }

    try {
      console.log("GET THUMBNAIL CANVAS!!!!!!");

      

      var context = this.thumbnailCanvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.webkitImageSmoothingEnabled = false;
      context.mozImageSmoothingEnabled = false;
      context.msImageSmoothingEnabled = false;
      context.oImageSmoothingEnabled = false;

      var thumbnailWidth = 86;
      var thumbnailHeight = 86;
      var scale = 1;
      
  //    this.editor.gridView2d.canvas

      /*
      this.drawFrame({
        canvas: this.thumbnailCanvas,
        scale: scale,
        context: context
      });
  */
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#040404';
      context.fillRect(0, 0, width, height);   
  /*
      this.drawFrame({
        canvas: this.thumbnailCanvas,
        scale: scale,
        context: context
      });
  */

      var width = this.getGraphicWidth();
      var height = this.getGraphicHeight();

      scale = thumbnailWidth / width;
      console.log(scale);
      if(scale < 0.1) {
        scale = 0.1;
      }
      scale = 1;

      this.drawFrame({
        canvas: this.thumbnailCanvas,
        scale: scale,
        context: context
      });


    //  context.drawImage(this.canvas, offsetX, offsetY, scaledWidth, scaledHeight);

    /*
      var srcCanvas = this.editor.gridView2d.canvas;
      var srcX = 0;
      var srcY = 0;
      var srcWidth = srcCanvas.width;
      var srcHeight = srcCanvas.height;

      var dstX = 0;
      var dstY = 0;
      var dstWidth = thumbnailWidth;
      var dstHeight = thumbnailHeight;

      context.drawImage(srcCanvas, 
        srcX, srcY, srcWidth, srcHeight,
        dstX, dstY, dstWidth, dstHeight);
*/        

    } catch(err) {
      console.error(err);
    }
    return this.thumbnailCanvas;
  },


  // shortcut methods to the current layer methods
  getC64Multi1Color: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    var color = false;

    if(this.frames && frame !== false && frame < this.frames.length && layer && layer.getC64Multi1Color) {
      color = layer.getC64Multi1Color(frame);
      if(typeof color != 'undefined') {
        return color;
      }
    }
    return 0;
  },


  getC64Multi2Color: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    var color = false;

    if(this.frames && frame !== false && frame < this.frames.length && layer && layer.getC64Multi2Color) {
      color = layer.getC64Multi2Color(frame);
      if(typeof color != 'undefined') {
        return color;
      }
    }
    return 0;
  },


  getBackgroundColor: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    var bgColor = false;

    if(this.frames && frame !== false && frame < this.frames.length && layer && layer.getBackgroundColor) {
      bgColor = layer.getBackgroundColor(frame);
      if(typeof bgColor != 'undefined') {
        return bgColor;
      }
    }

    // do default
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    bgColor = colorPalette.getDefaultBackgroundColor();
    return bgColor;
  },

  setBackgroundColor: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    var layer = this.editor.layers.getSelectedLayerObject();

    if(this.currentFrame !== false && this.currentFrame < this.frames.length && layer && layer.setBackgroundColor) {
      layer.setBackgroundColor(color, this.currentFrame);
    } 

  },

  getBorderColor: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    var borderColor = false;

    if(this.frames && frame !== false && frame < this.frames.length && layer && layer.getBorderColor) {
      borderColor = layer.getBorderColor(frame);
      if(typeof borderColor != 'undefined') {
        return borderColor;
      }
    }

    // do default
    var colorPalette = layer.getColorPalette();
    borderColor = colorPalette.getDefaultBorderColor();
    return borderColor;
  },

  setBorderColor: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    var layer = this.editor.layers.getSelectedLayerObject();

    if(this.currentFrame !== false && this.currentFrame < this.frames.length && layer && layer.setBorderColor) {
      layer.setBorderColor(color, this.currentFrame);
    } 
  },



  insertFrame: function(frame, duration, frameData, layerFrameData) {


    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }
    if(typeof duration == 'undefined') {
      duration = this.frames[this.currentFrame].duration;
    }

    var frameObject = frameData;

    if(typeof frameObject == 'undefined') {
      frameObject = {
        duration: duration
      };
    }

    this.frames.splice(frame + 1, 0, frameObject);

    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        var frameData = null;

        if(typeof layerFrameData != 'undefined') {
          for(var j = 0; j < layerFrameData.length; j++) {
            if(layerFrameData[j].layerId == layers[i].layerId) {
              frameData = layerFrameData[j].gridData;
            }
          }
        }


        layerGrid.insertFrame(frame, frameData);
      }
    }

    // fix the frame ranges (for sprites)
    var frameRanges = this.getFrameRanges();
    var afterInsertPoint = false;
    for(var i = 0; i < frameRanges.length; i++) {
      if(!afterInsertPoint && (frame + 1) >= frameRanges[i].start && (frame + 1) <= frameRanges[i].end) {
        afterInsertPoint = true;
        frameRanges[i].end++;
      } else if(afterInsertPoint) {
        frameRanges[i].start++;
        frameRanges[i].end++;
      }
    }

  
    this.frameCount++;
    this.fixFrameRanges();

    this.editor.history.startEntry('insertframe');
    this.editor.history.addAction('insertframe', { position: frame });
    this.editor.history.endEntry();



    return frame + 1;

  },



  duplicateFrame: function(frame) {
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var newFrame = frame+1;

    this.editor.history.startEntry('Duplicate');
    this.editor.history.setNewEntryEnabled(false);

    this.insertFrame(frame);
    this.setCurrentFrame(newFrame);



    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.duplicateFrame(frame, newFrame);
      }
    }

    this.editor.history.setNewEntryEnabled(true);

    this.editor.history.endEntry();

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }


    return newFrame;
  },


  // pass in the view bounds as pixels
  setViewBounds: function(minX, minY, maxX, maxY) {

    this.viewMinX = minX;
    this.viewMaxX = maxX;
    this.viewMinY = minY;
    this.viewMaxY = maxY;

    this.viewBounds = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }

    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.setViewBounds(minX, minY, maxX, maxY);
      }
    }
  },


  getViewBounds: function() {
    return this.viewBounds;
  },

  deleteFrame: function(frame) {

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frameCount <= 1) {
      return false;
    }



    var frameData = this.frames.splice(frame, 1);

    var layerFrameData = [];

    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        var gridData = layerGrid.getFrameData(frame);


        layerFrameData.push({ layerId: layers[i].layerId, gridData: gridData });
        layerGrid.deleteFrame(frame);
      }
    }

    // fix the frame ranges
    var frameRanges = this.getFrameRanges();
    var afterInsertPoint = false;
    for(var i = 0; i < frameRanges.length; i++) {
//      if(frameRanges[i].start < frame) {

      if(!afterInsertPoint && (frame + 1) > frameRanges[i].start && (frame ) < frameRanges[i].end) {

        afterInsertPoint = true;
        frameRanges[i].end--;
      } else if(afterInsertPoint) {
        frameRanges[i].start--;
        frameRanges[i].end--;
      }
    }


    var newFrameCount = this.frameCount - 1;
    this.setFrameCount(newFrameCount);

    this.fixFrameRanges();

    this.editor.history.startEntry('deleteframe');
    this.editor.history.addAction('deleteframe', { position: frame, frameData: frameData[0], layerFrameData: layerFrameData });
    this.editor.history.endEntry();

    return true;
  },


  // make sure no frame ranges of zero length
  // make sure no gaps
  // sort
  fixFrameRanges: function() {
    var frameRanges = this.getFrameRanges();

    // remove any ranges of zero length
    for(var i = 0; i < frameRanges.length; i++) {
      if(frameRanges[i].start == frameRanges[i].end) {
        // ok need to delete it
        frameRanges.splice(i, 1);
      }
    }

    frameRanges.sort(function(a, b) {
      return a.start - b.start;
    });

    var frameCount = this.getFrameCount();

    if(frameRanges.length == 0) {
      frameRanges.push({
        start: 0,
        end: frameCount
      });
    }


    var lastEnd = 0;
    // remove any ranges of zero length
    for(var i = 0; i < frameRanges.length; i++) {
      if(frameRanges[i].start !== lastEnd) {
        frameRanges[i].start = lastEnd;
      }
      lastEnd = frameRanges[i].end;
    }

    frameRanges[frameRanges.length - 1].end = frameCount;


  },

  setFrameCount: function(frameCount) {


/*
    // copy the background color from the last frame
    var bgColor = 0;
    if(this.frames.length > 0) {
      bgColor = this.frames[this.frames.length - 1].bgColor;
    } else {
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      if(colorPalette != null) {
        bgColor = colorPalette.getDefaultBackgroundColor();
      }
    }
*/

    while(frameCount > this.frames.length) {
      this.frames.push({ duration: 12 });
    }



    if(frameCount < this.frameCount) {
      this.frames.length = frameCount;
    }


    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.setFrameCount(frameCount);
      }
    }    

    this.frameCount = frameCount;
  },


  setCurrentFrame: function(frame) {

    if(this.currentFrame === frame) {
      return;
    }

    this.currentFrame = frame;
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.setCurrentFrame(frame);
      }
    }    

    this.redraw();
  },

  getCurrentFrame: function() {
    return this.currentFrame;
  },

  
  getFrameCount: function() {
    return this.frameCount;
  },

  setFrameDuration: function(duration, frame) {
    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(theFrame < 0 || theFrame >= this.frameCount) {
      return;
    }

    this.frames[theFrame].duration = duration;

  },

  getFrameDuration: function(frame) {
    return this.frames[frame].duration;
  },


  getGridWidth: function() {

    return this.gridWidth;
  },

  getGridHeight: function() {
    return this.gridHeight;
  },


  getGraphicWidth: function() {
    if(this.doc) {
      return this.doc.data.width;//  this.gridWidth * this.cellWidth;
    } else {
      return 1;
    }
  },

  getGraphicHeight: function() {
    if(this.doc) {
      return this.doc.data.height;//this.gridHeight * this.cellHeight;
    } else {
      return 1;
    }
  },


  setCellDimensionsFromTiles: function() {
    var cellWidth = 8;
    var cellHeight = 8;
    var gridWidth = this.gridWidth;
    var gridHeight = this.gridHeight;

    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        var tileSet = layerGrid.getTileSet();
        gridWidth = layerGrid.getGridWidth();
        gridHeight = layerGrid.getGridHeight();
        layerGrid.setGridDimensions({width: gridWidth, height: gridHeight, cellWidth: tileSet.getTileWidth(), cellHeight: tileSet.getTileHeight() });
        cellWidth = layerGrid.getCellWidth();
        cellHeight = layerGrid.getCellHeight();
      }
    }


    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;

    this.doc.data.width = this.gridWidth * this.cellWidth;
    this.doc.data.height = this.gridHeight * this.cellHeight;

  },
  setGridDimensions: function(args) {
    var width = this.gridWidth;
    var height = this.gridHeight;

    // what to offset current grid by
    var offsetX = 0;
    var offsetY = 0;

    if(typeof args != 'undefined') {
      if(typeof args.width != 'undefined') {
        width = args.width;
      }
      if(typeof args.height != 'undefined') {
        height = args.height;
      }
      if(typeof args.offsetX != 'undefined') {
        offsetX = args.offsetX;
      }
      if(typeof args.offsetY != 'undefined') {
        offsetY = args.offsetY;
      }

    }

    this.gridWidth = width;
    this.gridHeight = height;


    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.setGridDimensions({ width: width, height: height, offsetX: offsetX, offsetY: offsetY });
        this.cellWidth = layerGrid.getCellWidth();
        this.cellHeight = layerGrid.getCellHeight();
      }
    }

    this.doc.data.width = width * this.cellWidth;
    this.doc.data.height = height * this.cellHeight;

    this.invalidateAllCells();
    this.redraw({ allCells: true });
    if(this.type == 'sprite') {
      this.editor.tools.drawTools.tilePalette.drawTilePalette();
    }
  },



  invalidateAllCells: function() {
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.invalidateAllCells();
      }
    }

  },

  // either set for screen and all layers or just the current selected layer.
  initFrameBlocks: function(blockId) {
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.initFrameBlocks(blockId);
      }
    }
  },

  setBlockDimensions: function(width, height) {
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        layerGrid.setBlockDimensions(width, height);
      }
    }

  },

  setOnlyViewBoundsDrawn: function(onlyViewBoundsDrawn) {
    this.onlyViewBoundsDrawn = onlyViewBoundsDrawn;
  },

  // have only the view bounds been drawn
  getOnlyViewBoundsDrawn: function() {
    return this.onlyViewBoundsDrawn;
  },


  setDrawEnabled: function(enabled) {
    this.drawEnabled = enabled;
  },

  getDrawEnabled: function() {
    return this.drawEnabled;
  },

  redraw: function(args) {
    
    if(this.drawEnabled) {

      if(!this.doc) {
        return;
      }
      // assume everything is drawn..
      this.onlyViewBoundsDrawn = false;

      if(g_newSystem) {
        //this.drawFrame(args);
        this.editor.gridView2d.draw(args);
      } else {
        this.editor.grid.grid2d.update(args);
      }
      this.editor.layers.updateLayerPreview();
    }
  },


  drawFrame: function(args) {

    var frame = this.getCurrentFrame();
    if(typeof args.frame != 'undefined') {    
      frame = args.frame;
    }    

    // draw just the graphic, or also draw cursor, selection, shapes, etc
    var graphicOnly = false;
    if(args.graphicOnly) {
      graphicOnly = args.graphicOnly;
    }

    var canvas = args.canvas;
    var context = args.context;

    var srcX = 0;
    var srcY = 0;
    var dstX = 0;
    var dstY = 0;
    var srcWidth = this.getGraphicWidth();
    var srcHeight = this.getGraphicHeight();

    if(typeof args.srcX != 'undefined') {
      srcX = args.srcX;
      srcY = args.srcY;
    }

    if(typeof args.srcWidth != 'undefined') {
      srcWidth = args.srcWidth;
      srcHeight = args.srcHeight;
    }

    if(typeof args.dstX != 'undefined') {
      dstX = args.dstX;
      dstY = args.dstY;
    } else {
      args.dstX = dstX;
      args.dstY = dstY;
    }


    var drawAtX = false;
    var drawAtY = false;
    if(typeof args.drawAtX !== 'undefined') {
      drawAtX = args.drawAtX;
      drawAtY = args.drawAtY;
    }

    var shapes = false;

    var scale = 1;
    if(typeof args.scale != 'undefined') {
      scale = args.scale;
    }

    if(typeof args.dstWidth == 'undefined') {
      args.dstWidth = srcWidth * scale;
      args.dstHeight = srcHeight * scale;
    }


    if(typeof args.shapes != 'undefined') {
      shapes = args.shapes;
    }

    var whichLayers = 'visible';

    var allCells = false;
    if(typeof args.allCells != 'undefined') {
      allCells = args.allCells;
    }

    var drawBackground = this.editor.layers.isBackgroundVisible();
    if(typeof args.drawBackground != 'undefined') {
      drawBackground = args.drawBackground;
    }

    // dont want to update the layer canvas if we're not updating the currently displayed frame
    // eg sprite animation preview
    var updateLayerCanvas = true;
    if(typeof args.updateLayerCanvas != 'undefined') {
      updateLayerCanvas = args.updateLayerCanvas;
    }

    if(!updateLayerCanvas) {
      if(this.tempCanvas == null) {
        this.tempCanvas = document.createElement('canvas');
      }
      this.tempCanvas.width = screenWidth;
      this.tempCanvas.height = screenHeight;
      this.tempContext = this.tempCanvas.getContext('2d');
    }
    
    // just update animated tiles?
    var animatedTilesOnly = false;
    if(typeof args.animatedTilesOnly != 'undefined') {
      animatedTilesOnly = args.animatedTilesOnly;
    }

    if(typeof args.layers != 'undefined') {
      whichLayers = args.layers;
    }

    // does the previous frame need to be drawn?
    var drawPreviousFrame = false;
    if(typeof args.drawPreviousFrame != 'undefined') {
      drawPreviousFrame = args.drawPreviousFrame;
    } else {
      drawPreviousFrame = this.editor.frames.getShowPrevFrame();
    }

    
    var prevFrame = frame - 1;
    if(prevFrame < 0) {
      prevFrame += this.getFrameCount();
    }

    if(prevFrame === frame) {
      // prev frame and current frame are the same, so dont draw it..
      drawPreviousFrame = false;
    }

//    console.log('prev = ' + prevFrame);

    //var previousFrameSrcCanvas = null;
    /*
    if(drawPreviousFrame) {
      // previous screen is grid2d
      var gridView2d = this.editor.gridView2d;

      gridView2d.setupPreviousFrame();
      previousFrameSrcCanvas = gridView2d.previousScreen.canvas;

      this.editor.graphic.invalidateAllCells();
    }    
    */


    // are we drawing everything or just what is in the view?
    var drawBounds = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height
    };


    /*
    if(!allCells) {
      if(this.editor.graphic.getOnlyViewBoundsDrawn() || animatedTilesOnly) {
        var viewBounds = this.editor.graphic.getViewBounds();
        drawBounds.x = viewBounds.x;
        drawBounds.y = viewBounds.y;
        drawBounds.width = viewBounds.width;
        drawBounds.height = viewBounds.height;
      }
    }
    */


//    context.clearRect(drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height);

    //context.clearRect(dstX, dstY, dstWidth, dstHeight);

//    context.fillStyle = 'black';
//    context.fillRect(dstX, dstY, dstWidth, dstHeight);

    // loop through the layers to draw them
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var layerObject = false;
  
      // get the origin of the layer in screen coords
      var originX = dstX - srcX * scale;
      var originY = dstY - srcY * scale;

      if(drawAtX !== false) {
        originX = drawAtX;
        originY = drawAtY;
      }


//      console.log(originX + ',' + originY);


      if( ( (layer.visible && whichLayers == 'visible') 
            || (whichLayers == 'all') || (whichLayers == layer.layerId) )
            && (layer.type == 'grid' || layer.type == 'image')) {
        // we're drawing this layer.
        var layerObject = null;
        var layerCanvas = null;

        var drawLayerOffsetX = 0;
        var drawLayerOffsetY = 0;
        var drawLayerWidth = 0;
        var drawLayerHeight = 0;

        layerObject = this.editor.layers.getLayerObject(layer.layerId);

        var layerWidth = layerObject.getWidth();
        var layerHeight = layerObject.getHeight();


        // if also drawing previous frame, dont draw the background of the current frame
        var drawLayerBackground = drawBackground;
        if(layerObject && layerObject.isCurrentLayer() && drawPreviousFrame) {
          drawLayerBackground = false;
          
        }

        // grid is the only layer type supported at the moment...
        if(layer.type == 'grid') {

          // dont want to update the layer canvas if 
          // something is requesting a frame other than the current one
          if(updateLayerCanvas) {
            layerCanvas = layerObject.getCanvas();
          } else {
            layerCanvas = this.tempCanvas;
          }


          if(layerObject.getMode() == TextModeEditor.Mode.VECTOR) {

            var drawFromX = srcX;
            var drawFromY = srcY;
            var drawToX = srcX + srcWidth;
            var drawToY = srcY + srcHeight;

            if(drawFromX < 0) {
              drawLayerOffsetX = -drawFromX * scale;
              drawFromX = 0;
            }

            if(drawFromY < 0) {
              drawLayerOffsetY = -drawFromY * scale;              
              drawFromY = 0;
            }

            if(drawToX > layerWidth) {
              drawToX = layerWidth;
            }

            if(drawToY > layerHeight) {
              drawToY = layerHeight;
            }

            if(shapes) {
              shapes = this.editor.tools.drawTools.shapes.getCurrentShape() !== false;
            }
            
            var drawArgs = {
              canvas: layerCanvas,  
              frame: frame, 
              drawBackground: drawLayerBackground,
              allCells: allCells,
              shapes: shapes,
              cursor: false,
              scale: scale,
              drawFromX: drawFromX,
              drawFromY: drawFromY,
              drawToX: drawToX,
              drawToY: drawToY
            };


            if(!graphicOnly && !allCells) {
              // redraw the last cursor position
              drawArgs.shapes = false;
              drawArgs.eraseCursor = true;
              drawArgs.cursor = false;
              drawArgs.dragPaste = false;
              drawArgs.eraseDragPaste = false;
              drawArgs.allCells = false;
              layerObject.drawVector(drawArgs);
            }

            // draw the layer
            drawArgs.allCells = allCells;
            drawArgs.eraseCursor = false;
            drawArgs.cursor = false;
            drawArgs.dragPaste = false;
            drawArgs.eraseDragPaste = false;
            drawArgs.shapes = shapes;
            drawArgs.typingCursor = false;
            drawArgs.eraseTypingCursor = false;


            var drawArgs2 = {
              canvas: layerCanvas,  
              frame: frame, 
              drawBackground: drawLayerBackground,
              allCells: allCells,
              shapes: shapes,
              cursor: false,
              scale: scale,
              drawFromX: drawFromX,
              drawFromY: drawFromY,
              drawToX: drawToX,
              drawToY: drawToY
            };

            var offset = false;

            if(allCells) {
              
              drawArgs2.bgOnly = true;
              drawArgs2.fgOnly = false;
              offset = layerObject.drawVector(drawArgs2);

              drawArgs2.bgOnly = false;
              drawArgs2.fgOnly = true;
              
              offset = layerObject.drawVector(drawArgs2);
            } else {

              drawArgs2.bgOnly = true;
              drawArgs2.fgOnly = false;
              offset = layerObject.drawVector(drawArgs2);

              drawArgs2.bgOnly = false;
              drawArgs2.fgOnly = true;
              offset = layerObject.drawVector(drawArgs2);
            }

            if(!graphicOnly && layerObject.isCurrentLayer()) {
              // dont want to draw the cursor if drawing a shape
              if(this.editor.gridView2d.getCursorVisible() && !shapes && !UI.isMobile.any()) {
                /*
                // erase the old cursor
                drawArgs.shapes = false;
                drawArgs.eraseCursor = true;
                drawArgs.cursor = false;
                drawArgs.dragPaste = false;
                drawArgs.eraseDragPaste = false;
                drawArgs.allCells = false;
                layerObject.drawVector(drawArgs);
                */

                // draw the cursor
                drawArgs.shapes = false;
                drawArgs.eraseCursor = false;
                drawArgs.cursor = true;
                drawArgs.dragPaste = false;
                drawArgs.eraseDragPaste = false;
                drawArgs.allCells = false;
                layerObject.drawVector(drawArgs);                
              }

              if(this.editor.tools.drawTools.tool == 'type') {
                if(this.editor.gridView2d.typingCursorBlink) {
                  // draw the cursor
                  drawArgs.shapes = false;
                  drawArgs.eraseCursor = false;
                  drawArgs.cursor = false;
                  drawArgs.typingCursor = true;
                  drawArgs.dragPaste = false;
                  drawArgs.eraseDragPaste = false;
                  drawArgs.allCells = false;
                  layerObject.drawVector(drawArgs);                
                } else {
                  drawArgs.shapes = false;
                  drawArgs.eraseCursor = false;
                  drawArgs.cursor = false;
                  drawArgs.typingCursor = false;
                  drawArgs.eraseTypingCursor = true;
                  drawArgs.dragPaste = false;
                  drawArgs.eraseDragPaste = false;
                  drawArgs.allCells = false;
                  layerObject.drawVector(drawArgs);                
                }

              } else {
                drawArgs.shapes = false;
                drawArgs.eraseCursor = false;
                drawArgs.cursor = false;
                drawArgs.typingCursor = false;
                drawArgs.eraseTypingCursor = true;
                drawArgs.dragPaste = false;
                drawArgs.eraseDragPaste = false;
                drawArgs.allCells = false;
                layerObject.drawVector(drawArgs);                    
              }

              drawArgs.typingCursor = false;  
              drawArgs.eraseTypingCursor = false;              

              
              if(this.editor.tools.drawTools.select.isInPasteMove()) {
                // draw the paste move

                drawArgs.shapes = false;
                drawArgs.eraseCursor = false;
                drawArgs.cursor = false;
                drawArgs.dragPaste = false;
                drawArgs.eraseDragPaste = true;
                drawArgs.allCells = false;
                layerObject.drawVector(drawArgs);

                drawArgs.shapes = false;
                drawArgs.eraseCursor = false;
                drawArgs.cursor = false;
                drawArgs.dragPaste = true;
                drawArgs.eraseDragPaste = false;
                drawArgs.allCells = false;
                layerObject.drawVector(drawArgs);                              
              }
            }


            drawLayerOffsetX += offset.offsetX + dstX;
            drawLayerOffsetY += offset.offsetY + dstY;


            drawLayerWidth = (drawToX - drawFromX) * scale;
            drawLayerHeight = (drawToY - drawFromY) * scale;
            
          } else {
            // non vector

            // tell the layer to draw itself
            layerObject.draw({ 
                    canvas: layerCanvas,  
                    frame: frame, 
                    allCells: allCells,
                    drawBackground: drawLayerBackground,
                    shapes: shapes,
            });
          }
        }                  

        // take the opacity into account
        var opacity = 1;
        if(typeof layer.opacity != 'undefined') {
          opacity = layer.opacity;
        }


        // if the current layer is a grid layer and need to draw onion skin frame
        if(layerObject && layerObject.isCurrentLayer() && drawPreviousFrame && layer.type == 'grid') {
          if(drawBackground) {
            context.globalAlpha = opacity;
            var colorPalette = layerObject.getColorPalette();
            var bgColor = layerObject.getBackgroundColor();

            if(bgColor !== this.editor.colorPaletteManager.noColor) {
              context.fillStyle= '#' + colorPalette.getHexString(bgColor);  

              
              context.fillRect(originX, originY, 
                layerWidth * scale, layerHeight * scale);
                
            }
          }
          context.globalAlpha = 0.3;

          // should only need to redraw if frame has changed...

          var prevFrameCanvas = layerObject.getPrevFrameCanvas();


          if(layerObject.getMode() == TextModeEditor.Mode.VECTOR) {
            var drawFromX = srcX;
            var drawFromY = srcY;
            var drawToX = srcX + srcWidth;
            var drawToY = srcY + srcHeight;
            var drawPrevLayerOffsetX = 0;
            var drawPrevLayerOffsetY = 0;

            if(drawFromX < 0) {
              drawPrevLayerOffsetX = -drawFromX * scale;
              drawFromX = 0;
            }

            if(drawFromY < 0) {
              drawPrevLayerOffsetY = -drawFromY * scale;              
              drawFromY = 0;
            }

            if(drawToX > layerWidth) {
              drawToX = layerWidth;
            }

            if(drawToY > layerHeight) {
              drawToY = layerHeight;
            }

            var drawArgs = {
              canvas: prevFrameCanvas,  
              frame: prevFrame, 
              allCells: allCells,
              drawBackground: false,
              shapes: false,
              cursor: false,
              scale: scale,
              drawFromX: drawFromX,
              drawFromY: drawFromY,
              drawToX: drawToX,
              drawToY: drawToY,
              draw: 'prevgrid'
            };

            var offset = layerObject.drawVector(drawArgs);

            
            drawPrevLayerOffsetX += offset.offsetX + dstX;
            drawPrevLayerOffsetY += offset.offsetY + dstY;


            drawPrevLayerWidth = (drawToX - drawFromX) * scale;
            drawPrevLayerHeight = (drawToY - drawFromY) * scale;

            context.drawImage(prevFrameCanvas, 
              0, 0, drawPrevLayerWidth, drawPrevLayerHeight,
              drawPrevLayerOffsetX, drawPrevLayerOffsetY, drawPrevLayerWidth, drawPrevLayerHeight
            );

          } else {

            if(prevFrame !== this.lastDrawnPrevFrame) {
              layerObject.draw({
                canvas: prevFrameCanvas,
                frame: prevFrame,
                allCells: true,
                shapes: false,
                draw: 'prevgrid'
              });
            }

            context.drawImage(
                        prevFrameCanvas, 
                        originX,
                        originY,
                        layerWidth * scale, 
                        layerHeight * scale
                    );
          }

//          context.drawImage(previousFrameSrcCanvas, originX, originY, layerWidth * scale, layerHeight * scale);

        }

        // set the opacity and composite operation
        context.globalAlpha = opacity;
        if(typeof layer.compositeOperation != 'undefined') {
          context.globalCompositeOperation = layer.compositeOperation;
        } else {
          context.globalCompositeOperation = 'source-over';
        }


        if(layer.type == 'grid' || layer.type == 'image') {
          if(layerCanvas) {

            if(layerObject.getMode() == TextModeEditor.Mode.VECTOR) {

              var drawWidth = layerCanvas.width;
              var drawHeight = layerCanvas.height;

              // right border is at originX + layerWidth * scale

              if(drawLayerOffsetX + drawWidth > originX + layerWidth * scale) {
                drawWidth = (originX + layerWidth * scale) - drawLayerOffsetX;
              }

              if(drawLayerOffsetY + drawHeight > originY + layerHeight * scale) {
                drawHeight = (originY + layerHeight * scale) - drawLayerOffsetY;
              }

              context.drawImage(layerCanvas,
                                 0, 0, drawWidth, drawHeight,
                                 drawLayerOffsetX, drawLayerOffsetY, drawWidth, drawHeight);
              /*
              context.drawImage(layerCanvas, 
                drawLayerOffsetX, drawLayerOffsetY,
                drawWidth, drawHeight
              );
              */
            } else {

              // only draw visible part of canvas
              context.drawImage(layerCanvas,
                srcX, srcY, srcWidth, srcHeight,
                dstX, dstY, srcWidth * scale, srcHeight * scale
//                dstX, dstY, dstWidth, dstHeight
              );

              
              // draw the cursor
              if(!UI.isMobile.any()) {
                var drawCursor = layerObject.isCurrentLayer();
                if(this.editor.tools.drawTools.shapes.getCurrentShape() !== false) {
                  drawCursor = false;
                } 
    
                if(drawCursor) {
                  this.editor.gridView2d.drawCursor({ 
                    context: context, 
                    offsetX: originX, 
                    offsetY: originY, 
                    scale: scale 
                  });
                }


              }
              

            }



            
            /*
            context.drawImage(layerCanvas, 
              drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height,
              drawBounds.x, drawBounds.y, drawBounds.width, drawBounds.height
            );
            */
          }
        } else {
          context.drawImage(layer.canvas, 0, 0);
        }


        // draw the borders if necessary, dont draw border for sprites
        var borderVisible = this.editor.grid.border.visible && this.getType() != 'sprite';    
        if(originX > 0 || originY > 0 || originX + layerWidth * scale < canvas.width || originY + layerHeight * scale < canvas.height) {
          
          if(borderVisible && layer.visible && layer.type == 'grid') {
            var layerObject = this.editor.layers.getLayerObject(layer.layerId);    
            if(layerObject && typeof layerObject.getBorderColor != 'undefined') {
              var colorPalette = layerObject.getColorPalette();    
              var borderWidth = 8 * 4;// tileSet.charWidth * 4;
              var borderColor = layerObject.getBorderColor();
    
              if(borderColor != this.editor.colorPaletteManager.noColor) {
                context.fillStyle = '#' + colorPalette.getHexString(borderColor);;
    
                    // might need to draw borders
                if(originX + (borderWidth * scale) > 0) {
                  // left border
                  context.fillRect(
                    originX - borderWidth * scale, 
                    originY - 2, 
                    borderWidth * scale, 
                    layerHeight * scale + 4
                  );
                }
                if(originX + layerWidth * scale < canvas.width) {
                  // right border
                  context.fillRect(
                    originX + layerWidth * scale, 
                    originY - 2, 
                    borderWidth * scale, 
                    layerHeight * scale + 4
                  );
                }

                if(originY + (borderWidth * scale) > 0) {
                  // top border
                  context.fillRect(
                    originX - borderWidth * scale, 
                    originY - borderWidth * scale, 
                    (layerWidth + 2 * borderWidth) * scale, 
                    borderWidth * scale
                  );
                }

                // bottom border
                context.fillRect(
                  originX - borderWidth * scale, 
                  originY + layerHeight * scale, 
                  (layerWidth + 2 * borderWidth) * scale, 
                  borderWidth * scale
                );

              }
            }
          }        
        }

      }

      if(layerObject !== false && layerObject.isCurrentLayer()) {
        // its the current layer..draw selection and shapes
        // need to draw shapes?
        // draw shapes if in shapes mode and grid correct size

        var drawTools = this.editor.tools.drawTools;
        var drawTool = drawTools.tool;
        if(drawTool === 'rect' || drawTool === 'line' || drawTool === 'oval' ) {
          //          var shapesGrid = this.editor.tools.drawTools.shapes.getGrid();


          // creates a shapes canvas the same size as the layer canvas and then draws the shapes into it
          // dont want to do this if vector??

          if(drawTools.shapes.width == layerObject.getGridWidth()
              && drawTools.shapes.height == layerObject.getGridHeight()) {

            if(this.shapesCanvas === null) {
              this.shapesCanvas = document.createElement('canvas');
            }

            var layerCanvas = layerObject.getCanvas();

            if(this.shapesCanvas.width != layerCanvas.width || this.shapesCanvas.height != layerCanvas.height) {
              this.shapesCanvas.width = layerCanvas.width;
              this.shapesCanvas.height = layerCanvas.height;
            }

            layerObject.draw({ canvas: this.shapesCanvas,  allCells: true, draw: 'shapes' });

            context.drawImage(this.shapesCanvas, 
              0, 0, this.shapesCanvas.width, this.shapesCanvas.height,
              originX, originY, this.shapesCanvas.width * scale, this.shapesCanvas.height * scale
              );
          }
        }

        if(layer.type == 'grid') {

          // if select is active, selection isn't drawn in the grid, need to draw it here
          // dont want to draw it if in paste move
          if(drawTools.select.isActive()) {

            if(!drawTools.select.isInPasteMove()) {
              // not really shapes canvas, its the selection canvas
              if(this.shapesCanvas === null) {
                this.shapesCanvas = document.createElement('canvas');
              }

              var layerCanvas = layerObject.getCanvas();

              if(this.shapesCanvas.width != layerCanvas.width || this.shapesCanvas.height != layerCanvas.height) {
                this.shapesCanvas.width = layerCanvas.width;
                this.shapesCanvas.height = layerCanvas.height;
              }

              layerObject.draw({ 
                canvas: this.shapesCanvas, 
                allCells: true, 
                draw: 'selection', 
                frame: frame 
              });

              
              context.drawImage(this.shapesCanvas, 
                0, 0, this.shapesCanvas.width, this.shapesCanvas.height,
                originX, originY, this.shapesCanvas.width * scale, this.shapesCanvas.height * scale);
                
            }

          }

          // draw the movable pasted area
          if(drawTools.select.isInPasteMove()) {
            context.translate(originX, originY);
            drawTools.select.drawClipboardImage(context, scale);
            context.translate(-originX, -originY);
          }


          var pixelSelect = drawTools.pixelSelect;

          if(pixelSelect.isActive()) {
            var selection = pixelSelect.getSelection();
            if(selection.maxX > selection.minX && selection.maxY > selection.minY) {
              var layerHeight = layerObject.getHeight();

              pixelSelect.drawSelection();

              var sx = selection.minX;
              var sy = selection.minY;
              var sWidth = selection.maxX - selection.minX;
              var sHeight = selection.maxY - selection.minY;
              var dx = selection.minX + pixelSelect.selectionOffsetX;
              // reverseY                    var dy = layerHeight - selection.maxY - pixelSelect.selectionOffsetY;
              var dy = selection.minY + pixelSelect.selectionOffsetY;
              context.drawImage(pixelSelect.canvas, sx, sy, sWidth, sHeight, 
                originX + dx * scale, originY + dy * scale, sWidth * scale, sHeight * scale);
            }
          }


          // draw the movable pasted area
          if(pixelSelect.isInPasteMove()) {
            pixelSelect.drawPastedPixels();
            var sx = 0;
            var sy = 0;
            var sWidth = pixelSelect.getPasteWidth();
            var sHeight = pixelSelect.getPasteHeight();
            var dx = pixelSelect.pasteOffsetX;
            var dy = pixelSelect.pasteOffsetY;

            context.drawImage(pixelSelect.canvas, sx, sy, sWidth, sHeight, 
              originX + dx * scale, originY + dy * scale, sWidth * scale, sHeight * scale);
          }
        }
      } 
      
      if(drawPreviousFrame) {
        this.lastDrawnPrevFrame = false;// prevFrame;
      } else {
        this.lastDrawnPrevFrame = false;
      }
    }    
  }



}