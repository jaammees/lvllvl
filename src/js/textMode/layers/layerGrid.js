var LayerGrid = function() {
  this.editor = null;
  this.frames = [];
  this.currentFrame = 0;
  this.frameCount = 0;


  this.type = 'grid';

/*
  this.gridWidth = 40;
  this.gridHeight = 25;
  this.depth = 25;
*/

  this.tileWidth = 8;
  this.tileHeight = 8;
//  this.tileDepth = 8;

/*
  this.cellWidth = 8;
  this.cellHeight = 8;
  this.cellDepth = 8;

  this.tileSetId = false;
  this.colorPaletteId = false;
*/

//  this.colorPerMode = 'cell';
//  this.mode = 'monochrome';

/*
  this.blockMode = false;
  this.blockWidth = 2;
  this.blockHeight = 2;
*/

  this.mode = false;
  this.hasCharRotation = false;
  this.hasCharFlip = false;


  this.doc = null;

  this.canvas = null;
  this.context = null;

  this.prevFrameCanvas = null;
  this.prevFrameContext = null;

  this.refImage = null;

  this.refImageParams = null;

/*
  {
    originalRefImage: null
  };
*/

  this.refImageCanvas = null;
  this.refImageContext = null;


  this.previewCanvas = null;
  this.previewContext = null;

  this.viewMinX = 0;
  this.viewMinY = 0;
  this.viewMaxX = 0;
  this.viewMaxY = 0;

  this.defaultBackgroundColor = -1;
  this.defaultBorderColor = -1;

  this.updatedCellRanges = {
    minX: 0,
    minY: 0,
    maxX: 40,
    maxY: 25
  };

  // if onlyViewBoundsDrawn is true, what are the bounds of area drawn
  this.drawnBounds = {
    fromX: 0,
    toX: 0,
    fromY: 0,
    toY: 0
  };


  this.backgroundCanvas = null;

  this.blankTileId = 32;

  this.createSpriteTiles = true;


  // used to determine whether need to redraw
  this.lastDrawFromGridX = false;
  this.lastDrawFromGridY = false;
  this.lastDrawToGridX = false;
  this.lastDrawToGridY = false;
  this.lastDrawScale = false;

  // dimensions of last cursor drawn
  this.lastCursorFromX = 0;
  this.lastCursorFromY = 0;
  this.lastCursorToX = 0;
  this.lastCursorToY = 0;

  this.lastTypingCursorFromX = 0;
  this.lastTypingCursorFromY = 0;
  this.lastTypingCursorToX = 0;
  this.lastTypingCursorToY = 0;

  this.lastDragPasteFromX = 0;
  this.lastDragPasteFromY = 0;
  this.lastDragPasteToX = 0;
  this.lastDragPasteToY = 0;  
}

LayerGrid.prototype = {

  setBlankTileId: function(blankTileId, updateTiles) {

    if(this.blankTileId === false) {
      // blank tile hasn't been set yet
      this.blankTileId = blankTileId;
      return;
    }

    if(this.blankTileId === blankTileId) {
      // blank tile not changing
      return;
    }

    if(updateTiles) {
      var frames = this.frames
      var frameCount = this.getFrameCount();
      var gridWidth = this.getGridWidth();
      var gridHeight = this.getGridHeight();

      for(var i = 0; i < frameCount; i++) {
        var frameData = frames[i].data;
        for(var y = 0; y < gridHeight; y++) {
          for(var x = 0; x < gridWidth; x++) {
            if(frameData[y][x].t == this.blankTileId) {
              frameData[y][x].t = blankTileId;
            }
          }
        }
      }
    }

    this.blankTileId = blankTileId;
  },

  setToBlank: function() {
    var frames = this.frames
    var frameCount = this.getFrameCount();
    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();

    for(var i = 0; i < frameCount; i++) {
      var frameData = frames[i].data;
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          frameData[y][x].t = this.blankTileId;
        }
      }
    }
  },

  
  init: function(editor, layerId, layerRef, screenMode) {
    this.editor = editor;
    this.layerId = layerId;
    this.layerRef = layerRef;

    this.defaultBackgroundColor = this.editor.colorPaletteManager.noColor;

    this.connectToDoc();


    if(typeof screenMode != 'undefined') {
      this.mode = screenMode;
    }


    // shouldn't really be here..
    switch(this.mode) {
      case 'monochrome':
        this.doc.screenMode = TextModeEditor.Mode.TEXTMODE;
      break;
      default:
        this.doc.screenMode = this.mode;
      break;
    }


  },


  loadFromDoc: function(editor, layerId, layerRef) {
    this.editor = editor;
    this.layerId = layerId;
    this.layerRef = layerRef;

    this.connectToDoc();
  },

  getType: function() {
    return 'grid';
  },


  loadReferenceImageFromDoc: function() {
    if(this.refImage == null) {
      this.refImage = new Image();
    }

    var _this = this;
    this.refImage.onload = function() {
      var params = {
        originalImage: _this.refImage,
        x: 0,
        y: 0,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        colorReductionMethod: "none",
        scale: 100
      };

      _this.setReferenceImage({
        image: _this.refImage,
        imageData: _this.doc.refImageData,
        params: params

      });

      _this.editor.graphic.redraw({ allCells: true });
    }

    this.refImage.src = this.doc.refImageData;

  },

  // find the layer's data in the doc..
  connectToDoc: function(args) {
    var doc = null;

    if(typeof args != 'undefined') {
      if(typeof args.doc != 'undefined') {
        doc = args.doc;
      }
      if(typeof args.layerId != 'undefined') {
        this.layerId = args.layerId;
      }
      if(typeof args.editor != 'undefined') {
        this.editor = args.editor;
      }
    }
    
    if(doc == null) {
      doc = this.editor.doc;
    }

    var layers = doc.data.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].layerId == this.layerId) {
        if(typeof layers[i].frames == 'undefined') {
          layers[i].frames = [];
        }
        this.frames = layers[i].frames;
        this.doc = layers[i];
        this.frameCount = this.frames.length;

        // defaults
        if(typeof this.doc.colorPerMode == 'undefined') {
          this.doc.colorPerMode = 'cell';
        }

        if(typeof this.doc.screenMode == 'undefined') {
          this.doc.screenMode = 'textmode';
        }

        if(typeof this.doc.blockMode == 'undefined') {
          this.doc.blockMode = false;
        }

        if(typeof this.doc.hasTileRotate == 'undefined') {
          this.doc.hasTileRotate = false;
        }

        if(typeof this.doc.hasTileFlip == 'undefined') {
          this.doc.hasTileFlip = false;
        }

        if(typeof this.doc.blockWidth == 'undefined') {
          this.doc.blockWidth = 2;
        }

        if(typeof this.doc.blockHeight == 'undefined') {
          this.doc.blockHeight = 2;
        }



        switch(this.doc.screenMode) {
          case 'monochrome':
            this.mode = TextModeEditor.Mode.TEXTMODE;
          break;
          default:
            this.mode = this.doc.screenMode;  
          break;
        }

        if(typeof this.doc.refImageData == 'undefined') {
          this.refImageParams = null;
          this.refImage = null;
        } else {
          this.loadReferenceImageFromDoc();
        }        

        // set the default colours
        var colorPalette = this.getColorPalette();
        if(colorPalette) {
          this.defaultBackgroundColor = colorPalette.getDefaultBackgroundColor();
          this.defaultBorderColor = colorPalette.getDefaultBorderColor();
        }
      }
    }
  },

  setPreviewCanvasElementId: function(elementId) {
    this.previewCanvas = document.getElementById(elementId);
  },

  setReferenceImage: function(args) {


    this.refImage = args.image;
    this.refImageParams = args.params;
    this.doc.refImageData = args.imageData;
    this.editor.modified();

    if(this.refImageCanvas == null) {
      this.refImageCanvas = document.createElement('canvas');
    }

    this.refImageCanvas.width = this.getWidth();
    this.refImageCanvas.height = this.getHeight();
    this.refImageContext = this.refImageCanvas.getContext('2d');
    this.refImageContext.drawImage(this.refImage, 0, 0);

  },

  getReferenceImage: function() {
    return this.refImage;
  },

  getReferenceImageData: function() {
    return this.doc.refImageData;
  },

  getReferenceImageParams: function() {
    return this.refImageParams;
  },
/*
  getOriginalRefImage: function() {
    return this.refImageParams.originalRefImage;
  },
*/
  setFromJSON: function(data) {
    var doc = this.doc;

    if(typeof data.blockMode != 'undefined') {
      doc.blockMode = data.blocMode;
    }

    if(typeof data.cellHeight != 'undefined') {
      doc.cellHeight = data.cellHeight;
    }

    if(typeof data.cellWidth != 'undefined') {
      doc.cellWidth = data.cellWidth;
    }

    if(typeof data.colorPerMode != 'undefined') {
      doc.colorPerMode = data.colorPerMode;
    }

    if(typeof data.gridHeight != 'undefined') {
      doc.gridHeight = data.gridHeight;
    }

    if(typeof data.gridWidth != 'undefined') {
      doc.gridWidth = data.gridWidth;
    }

    if(typeof data.label != 'undefined') {
      doc.label = data.label;
    }

    if(typeof data.screenMode != 'undefined') {
      doc.screenMode = data.screenMode;
    }

    doc.frames = data.frames;
    
    return;
    this.frames = layers[i].frames;
    this.doc = layers[i];
    this.frameCount = data.frames.length;

    // defaults
    if(typeof this.doc.colorPerMode == 'undefined') {
      this.doc.colorPerMode = 'cell';
    }

    if(typeof this.doc.screenMode == 'undefined') {
      this.doc.screenMode = 'textmode';
    }

    if(typeof this.doc.blockMode == 'undefined') {
      this.doc.blockMode = false;
    }

    if(typeof this.doc.hasTileRotate == 'undefined') {
      this.doc.hasTileRotate = false;
    }

    if(typeof this.doc.hasTileFlip == 'undefined') {
      this.doc.hasTileFlip = false;
    }

    if(typeof this.doc.blockWidth == 'undefined') {
      this.doc.blockWidth = 2;
    }

    if(typeof this.doc.blockHeight == 'undefined') {
      this.doc.blockHeight = 2;
    }



    switch(this.doc.screenMode) {
      case 'monochrome':
        this.mode = TextModeEditor.Mode.TEXTMODE;
      break;
      default:
        this.mode = this.doc.screenMode;  
      break;
    }
  },


  getJSON: function(args) {
    var direction = 'bottomtotop';

    var fromFrame = 0;
    var toFrame = this.editor.graphic.getFrameCount();

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();

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


    var exclude = [
    ];

    var screenMode = this.doc.screenMode;
    if(screenMode !== 'indexed color') {
    } else {
      exclude.push('fc');
      exclude.push('bc');
    }

    //if(this.editor.graphic.getHasTileFlip()) {
    if (this.getHasTileFlip()) {
      exclude.push('fh');
      exclude.push('fv');
    } 

//    if(this.editor.graphic.getHasTileRotate()) {

    if(this.getHasTileRotate()) {
      exclude.push('rz');
    }

    var colorPerMode = this.getColorPerMode();
    if(colorPerMode == 'character' || colorPerMode == 'block' || screenMode == 'indexed color') {
      exclude.push('fc');
      exclude.push('bc');
    } 

    var yStart = 0;
    var yEnd = gridHeight;
    var yIncrement = 1;
    if(direction != 'bottomtotop') {
      yStart = gridHeight - 1;
      yEnd = -1;
      yIncrement = -1;
    }

    var data = {};

    data.id = this.doc.layerId;
    data.label = this.doc.label;
    data.gridWidth = gridWidth;
    data.gridHeight = gridHeight;
    data.colorPerMode = colorPerMode;
    data.screenMode = this.doc.screenMode;
    data.cellWidth = this.getCellWidth();
    data.cellHeight = this.getCellHeight();
    data.tileSetId = this.doc.tileSetId;
    data.colorPaletteId = this.doc.colorPaletteId;

    data.blockMode = this.getBlockModeEnabled();
    if(data.blockMode) {
      data.blockWidth = this.getBlockWidth();
      data.blockHeight = this.getBlockHeight();
    }


    data.frames = [];
    for(var i = fromFrame; i < toFrame; i++) {
      if(i < this.frames.length) {
        var frameData = [];

        for(var y = yStart; y != yEnd; y += yIncrement) {
          frameData[y] = [];
          for(var x = 0; x < gridWidth; x++) {
            var cell = {};

            var cellData = this.frames[i].data[y][x];

            for(var key in cellData) {
              if(!exclude.includes(key)) {
                var dstKey = key;
                cell[dstKey] = cellData[key];
              }
            }
            frameData[y][x] = cell;
          }
        }

        var bgColor = this.getBackgroundColor(i);
        var borderColor = this.getBorderColor(i);
        data.frames.push({ 'data': frameData, bgColor: bgColor, borderColor: borderColor });
      }
    }

    return data;

  },
  
  getCanvas: function() {
    if(this.canvas == null) {
      this.canvas = document.createElement('canvas');
    }

    var layerWidth = this.doc.gridWidth * this.doc.cellWidth;
    var layerHeight = this.doc.gridHeight * this.doc.cellHeight;

    var screenMode = this.getMode();

    // vector size will depend on scale, so only size if not vector
    if(screenMode != TextModeEditor.Mode.VECTOR) {
      if(this.canvas.width != layerWidth || this.canvas.height != layerHeight) {
        this.canvas.width = layerWidth;
        this.canvas.height = layerHeight;        
      }
    }

    return this.canvas;
  },

  getPrevFrameCanvas: function() {
    if(this.prevFrameCanvas == null) {
      this.prevFrameCanvas = document.createElement('canvas');
    }


    var screenMode = this.getMode();

    // vector size will depend on scale, so only size if not vector
    if(screenMode != TextModeEditor.Mode.VECTOR) {
        var layerWidth = this.doc.gridWidth * this.doc.cellWidth;

        var layerHeight = this.doc.gridHeight * this.doc.cellHeight;
        if(this.prevFrameCanvas.width != layerWidth || this.prevFrameCanvas.height != layerHeight) {
        this.prevFrameCanvas.width = layerWidth;
        this.prevFrameCanvas.height = layerHeight;        
      }
    }

    return this.prevFrameCanvas;

  },



  getPreviewCanvas: function() {
    return this.previewCanvas;
  },

  isCurrentLayer: function() {
    return this.layerId == this.editor.layers.getSelectedLayerId();
    
  },

  setScreenMode: function(screenMode, callback) {
    return this.setMode(screenMode, callback);
  },

  
  getTransparentColorIndex: function() {
    if(typeof this.doc.transparentColorIndex == 'undefined') {
      return 0;
    }

    return this.doc.transparentColorIndex;
  },


  setTransparentColorIndex: function(index) {
    this.doc.transparentColorIndex = index;
    this.editor.modified();
  },


  setHasTileFlip: function(hasTileFlip) {
    this.doc.hasTileFlip = hasTileFlip;
    this.editor.modified();

  },

  getHasTileFlip: function() {
    return this.doc.hasTileFlip;
  },


  setHasTileRotate: function(hasTileRotate) {
    this.doc.hasTileRotate = hasTileRotate;
    this.editor.modified();    
  },

  getHasTileRotate: function() {
    return this.doc.hasTileRotate;
  },

  setMode: function(screenMode, callback) {

    var tileSetPreset = false;

    if(typeof screenMode.tileSet != 'undefined') {
      tileSetPreset = screenMode.tileSet;
    }

    if(typeof screenMode.mode != 'undefined') {
      screenMode = screenMode.mode;
    }



    // work out if tileset is used anywhere else
    var tileSetUsed = false;
    var layerCount = this.editor.layers.getLayerCount();
    
    for(var i = 0; i < layerCount; i++) {
      var layer = this.editor.layers.getLayerObjectFromIndex(i);
      if(layer.getId() != this.getId()) {
        if(layer.getTileSetId() == this.getTileSetId()) {
          tileSetUsed = true;
          break;
        }
      }
    }
    

    if(
      (screenMode == 'vector' && this.doc.screenMode != 'vector')
      || (this.doc.screenMode == 'vector' && screenMode != 'vector')
    ) {
      // switching from non vector to vector or vice versa
      var tileSet = this.getTileSet();
      if(tileSetUsed) {
        // need to create a new tile set
        var name = screenMode + ' Tile Set';
        name = name[0].toUpperCase() + name.substring(1)

        var newTileSetId = this.editor.tileSetManager.createTileSet({ name: name, width: 8, height: 8 }); 
        tileSet = this.editor.tileSetManager.getTileSet(newTileSetId);
        tileSet.setTileCount(256);
        this.setTileSet(tileSet.getId());      
      }

    }
      

    var _this = this;
    if(screenMode == 'vector') {

      if(this.doc.screenMode == 'vector') {
        // already in vector
        if(typeof callback != 'undefined') {
          callback();
        }

      }  else {
      
        if(tileSetPreset == false) {
          tileSetPreset = 'modular-shapes';
        }

        tileSet.setToVector(tileSetPreset, function() {
          _this._setMode(screenMode);        
        
          var tilePaletteDisplay = _this.editor.tools.drawTools.tilePalette.tilePaletteDisplay;
          var sideTilePaletteDisplay = _this.editor.sideTilePalette.tilePaletteDisplay;    
  //        _this.editor.tileSetManager.updateSortMethods();

          tilePaletteDisplay.draw({ redrawTiles: true });
          sideTilePaletteDisplay.draw({ redrawTiles: true });    

          if(typeof callback != 'undefined') {
            callback();
          }
        });
      }

    } else {

      if(this.doc.screenMode == 'vector') {
        // if switching from vector to non vector, tileset needs to be set to a non vector tileset
        tileSet.setToPreset('petscii', function() {
          _this._setMode(screenMode);
          if(typeof callback != 'undefined') {
            callback();
          }  
        });
      } else {
        // switching from a non vector mode to another non vector mode
        this._setMode(screenMode);
        if(typeof callback != 'undefined') {
          callback();
        }
      }
    }
  },

  // used internally
  _setMode: function(screenMode) {
    var updateEnabledSave = this.editor.grid.getUpdateEnabled();

    // turn off updates while doing all this..
    this.editor.grid.setUpdateEnabled(false);

    this.mode = screenMode;
    switch(this.mode) {
      case 'monochrome':
        this.doc.screenMode = TextModeEditor.Mode.TEXTMODE;
      break;
      default:
        this.doc.screenMode = this.mode;
      break;
    }
    this.editor.modified();    

    if(screenMode == TextModeEditor.Mode.C64STANDARD) {
      if(this.editor.currentTile.getBGColor() !== this.editor.colorPaletteManager.noColor) {
        this.editor.currentTile.setBGColor(this.editor.colorPaletteManager.noColor);
      }
    }
    if(screenMode == TextModeEditor.Mode.C64ECM) {
      // make sure there are some background colours
      
      var theFrame = this.currentFrame;
      if(this.editor.currentTile.getBGColor() == this.editor.colorPaletteManager.noColor) {
        this.editor.currentTile.setBGColor(0);
      }

      if(typeof this.frames[theFrame].c64ECMColor1 == 'undefined') {
        this.frames[theFrame].c64ECMColor1 = 0;
      }

      if(typeof this.frames[theFrame].c64ECMColor2 == 'undefined') {
        this.frames[theFrame].c64ECMColor2 = 1;
      }
      if(typeof this.frames[theFrame].c64ECMColor3 == 'undefined') {
        this.frames[theFrame].c64ECMColor3 = 2;
      }
    }

    // only do this if its the currently selected layer...
    if(this.isCurrentLayer()) {
      // c64 ecm doesn't have group similar
      this.editor.tileSetManager.updateSortMethods(); 
      this.setAsCurrentLayer();   
    }

    // turn updates back on
    this.editor.grid.setUpdateEnabled(updateEnabledSave);
    this.editor.graphic.redraw({ allCells: true });
    if(this.type == '2d') {
      this.layers.updateAllLayerPreviews();
    }
  },


  getMode: function() {
    return this.mode;
  },

  getScreenMode: function() {
    return this.mode;
  },

  getColorPerMode: function() {
    return this.doc.colorPerMode;
  },

  setColorPerMode: function(colorPerMode) {
    //this.colorPerMode = colorPerMode;
    if(this.doc.colorPerMode == 'character' && colorPerMode == 'cell') {
      this.updateGridColorsFromTiles();
    }
    this.doc.colorPerMode = colorPerMode;
    this.editor.modified();
  },


  getBlockSet: function() {
    return this.editor.blockSetManager.getCurrentBlockSet();    
  },

  getBlockModeEnabled: function() {
    return this.doc.blockMode;
  },

  setBlockModeEnabled: function(enabled) {
    //this.blockMode = enabled;
    if(this.doc.blockMode && !enabled) {
      this.updateTilesFromBlocks();
    }
    this.doc.blockMode = enabled;
    this.editor.modified();

//    UI('mode-blockmode').setChecked(enabled);
    if(this.isCurrentLayer()) {
      this.editor.updateBlockModeInterface();
    }
  },

  initFrameBlocks: function(blockId) {
    for(var i = 0; i < this.frames.length; i++) {
      var gridData = this.frames[i].data;
      if(gridData) {
        for(var y = 0; y < gridData.length; y++) {
          for(var x = 0; x < gridData[y].length; x++) {
            if(typeof gridData[y][x].b === 'undefined') {
              gridData[y][x].b = blockId;
            }
          }
        }
      }
    }
  },


  // this should really be in layers.js ?
  setAsCurrentLayer: function() {
    this.editor.setInterfaceScreenMode(this.mode);
  },

  setBlockDimensions: function(width, height) {
    // need to make sure current block set is compatible..
    this.doc.blockWidth = parseInt(width, 10);
    this.doc.blockHeight = parseInt(height, 10);
    this.editor.modified();
  },


  getId: function() {
    return this.doc.layerId;
  },

  getLabel: function() {
    return this.doc.label;
  },

  getWidth: function() {
    return this.getCellWidth() * this.getGridWidth();
  },

  getHeight: function() {
    return this.getCellHeight() * this.getGridHeight();
  },
  getCellWidth: function() {
    return this.doc.cellWidth;
  },

  getCellHeight: function() {
    return this.doc.cellHeight;
  },

  getGridWidth: function() {
    return this.doc.gridWidth;
  },

  getGridHeight: function() {
    return this.doc.gridHeight;
  },

  getGridDepth: function() {
    return this.depth;
  },

  getBlockWidth: function() {
    return this.doc.blockWidth;
//    return this.editor.blockSetManager.getCurrentBlockSet().getWidth();
  },

  getBlockHeight: function() {
    return this.doc.blockHeight;
//    return this.editor.blockSetManager.getCurrentBlockSet().getHeight();
  },

  getXOffsetInBlock: function(x) {
    var xOffset = x % this.getBlockWidth();
    return xOffset;
  },

  getYOffsetInBlock: function(y) {
//    var yOffset = this.getBlockHeight() - y % this.getBlockHeight() - 1;
    var yOffset = y % this.getBlockHeight() ;

    return yOffset;
  },

  // update where the colours are used
  colorsUpdated: function() {

    if(this.isCurrentLayer()) {
      this.editor.tileSetManager.redrawCharacters();
      //this.editor.grid.update({ allCells: true });


      this.editor.graphic.invalidateAllCells();

      if(g_newSystem) {
        this.editor.gridView2d.draw();
      } else {
        this.editor.grid.update({ allCells: true });
      }
  
      if(typeof this.editor.tools.drawTools.blockPalette && this.editor.blockEditor) {
        if(this.editor.blockEditor.visible) {
          this.editor.blockEditor.draw();
          
        }
      }
    }

    if(this.editor.type == '2d') {
      this.editor.layers.updateAllLayerPreviews();
    }

  },

  setC64ECMColor: function(index, color, frame, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }


    if(index == 0 || index == this.editor.colorPaletteManager.noColor) {
      return this.setBackgroundColor(color, theFrame);
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      switch(index) {
        case 1:
          this.frames[theFrame].c64ECMColor1 = color;
          break;
        case 2:
          this.frames[theFrame].c64ECMColor2 = color;
          break;
        case 3:
          this.frames[theFrame].c64ECMColor3 = color;
          break;
      }
    } 
    this.editor.modified();

    if(this.isCurrentLayer()) {
//      var colorPalette = this.getColorPalette();
//      $('.c64Multi1Color').css('background-color', '#' + colorPalette.getHexString(color));
//      $('.c64Multi1ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));
    }

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }

  },

  getC64ECMColor: function(index, frame) {
    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(!this.frames || theFrame === false) {
      return this.editor.colorPaletteManager.noColor;
    }

    if(index === 0 || index === this.editor.colorPaletteManager.noColor) {
      return this.getBackgroundColor(theFrame);
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      switch(index) {
        case 1:
          return this.frames[theFrame].c64ECMColor1;
        case 2:
          return this.frames[theFrame].c64ECMColor2;
        case 3:
          return this.frames[theFrame].c64ECMColor3;
      }
    } 
    return 0;
  },



  getC64Multi1Color: function(frame) {

    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(!this.frames || theFrame === false) {
      return this.editor.colorPaletteManager.noColor;
    }

    if(theFrame !== false &&  theFrame < this.frames.length) {
      color = this.frames[theFrame].c64Multi1Color;
      if(typeof color != 'undefined') {
        return color;
      }
    }
    color = 11;  

    var colorPalette = this.getColorPalette();    
    if(color >= colorPalette.getColorCount()) {
      return 0;
    }
    return color;
  },


  setC64Multi1Color: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      if(this.frames[this.currentFrame].c64Multi1Color !== color) {

        this.frames[this.currentFrame].c64Multi1Color = color;
        this.editor.modified();
      }
    } 

    if(this.isCurrentLayer()) {
      var colorPalette = this.getColorPalette();
      $('.c64Multi1Color').css('background-color', '#' + colorPalette.getHexString(color));
      $('.c64Multi1ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));
    }

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }
  },


  getC64Multi2Color: function(frame) {
    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(!this.frames || theFrame === false) {
      return this.editor.colorPaletteManager.noColor;
    }


    if(theFrame !== false && theFrame < this.frames.length) {
      color = this.frames[theFrame].c64Multi2Color;
      if(typeof color != 'undefined') {
        return color;
      }
    }

    color = 12;  
    var colorPalette = this.getColorPalette();    
    if(color >= colorPalette.getColorCount()) {
      return 1;
    }
    return color;
  },

  setC64Multi2Color: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      if(this.frames[this.currentFrame].c64Multi2Color !== color) {
        this.frames[this.currentFrame].c64Multi2Color = color;
        this.editor.modified();      
      }
    } 

    if(this.isCurrentLayer()) {
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      $('.c64Multi2Color').css('background-color', '#' + colorPalette.getHexString(color));
      $('.c64Multi2ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));
    }

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }
  },


  setBackgroundColor: function(color, frame) {


    if(this.frames.length == 0) {
      this.defaultBackgroundColor = color;
    }

    var theFrame = this.currentFrame;
    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(theFrame < this.frames.length) {
      if(this.frames[theFrame].bgColor !== color) {
        this.frames[theFrame].bgColor = color;
        this.editor.modified();      
      }
    }

  },


  getBackgroundColor: function(frame) {

    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(theFrame < this.frames.length && typeof this.frames[theFrame].bgColor != 'undefined') {      
      return this.frames[theFrame].bgColor;
    }


    return this.defaultBackgroundColor;// this.editor.colorPaletteManager.noColor;
  },


  setBorderColor: function(color, frame) {
    if(this.frames.length == 0) {
      this.defaultBorderColor = color;
    }

    var theFrame = this.currentFrame;
    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(theFrame < this.frames.length) {
      this.frames[theFrame].borderColor = color;
      this.editor.modified();      
    }
  },

  getBorderColor: function(frameIndex) {
    var borderColor = this.editor.colorPaletteManager.noColor;
    var frame = frameIndex;

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frames && frame !== false && frame < this.frames.length) {
      borderColor = this.frames[frame].borderColor;
      if(typeof borderColor != 'undefined') {
        return borderColor;
      }
    }


    return this.defaultBorderColor;
    
//    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorPalette = this.getColorPalette();
    borderColor = colorPalette.getDefaultBorderColor();

    return borderColor;

  },


  clear: function() {
    if(this.playFrames) {
      this.playFrames = false;
    }
    
    for(var frame = 0; frame < this.frames.length; frame++) {
      this.clearFrame(frame);
    }
    this.frames = [];
    this.frameCount = 0;

//    this.setFrameCount(1);
  },

  clearFrame: function(frame) {
    if(frame < 0 || frame >= this.frames.length) {
      return;
    }

    if(this.frames[frame].data) {

      /*
      for(var z = 0; z < this.depth; z++) {
        for(y = 0; y < this.gridHeight; y++) {
          for(x = 0; x < this.gridWidth; x++) {
            if(this.frames[frame].data[z][y][x].mesh) {
              // TODO: find proper way of removing mesh
              this.frames[frame].holder.remove(this.frames[frame].data[z][y][x].mesh);
              this.frames[frame].data[z][y][x].mesh = null;
            }
          }
        }
      }
*/
      this.frames[frame].data = null;
    }
    this.editor.modified();    
  },


  setColorPalette: function(colorPaletteId) {
//    this.colorPaletteId = colorPaletteId;
    this.doc.colorPaletteId = colorPaletteId;
    this.editor.modified();    
  },

  getColorPalette: function() {
    var colorPalette = null;
    if(this.doc.colorPaletteId) {
      return this.editor.colorPaletteManager.getColorPalette(this.doc.colorPaletteId);
    } else {
      return this.editor.colorPaletteManager.getCurrentColorPalette();
    }
  },

  setCellDimensions: function(width, height) {

  },

  setTileSet: function(tileSetId) {

    //this.tileSetId = tileSetId; 
    this.doc.tileSetId = tileSetId;
    this.editor.modified();

    if(this.isCurrentLayer()) {
      // need to update interface..
      this.editor.tileSetManager.setCurrentTileSetFromId(tileSetId);

    }

  },

  getTileSetId: function() {
    return this.doc.tileSetId;
  },

  
  getTileSet: function() {
    if(this.doc.tileSetId) {
      return this.editor.tileSetManager.getTileSet(this.doc.tileSetId);
    } else {

      return this.editor.tileSetManager.getCurrentTileSet();
    }
  },


  setCreateSpriteTiles: function(createSpriteTiles) {
    this.createSpriteTiles = createSpriteTiles;
  },

  // recreate frames if dimensions or character dimensions change
  setGridDimensions: function(args) {

    var tileSet = this.getTileSet();
    var doc = this.doc;

    var width = doc.gridWidth;
    var height = doc.gridHeight;

    // what to offset current grid by
    var offsetX = 0;
    var offsetY = 0;

    var cellWidth = this.getCellWidth();
    var cellHeight = this.getCellHeight();

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

      if(typeof args.cellWidth != 'undefined') {
        cellWidth = args.cellWidth;
      }

      if(typeof args.cellHeight != 'undefined') {
        cellHeight = args.cellHeight;
      }

    }

    // TODO: account for pixel dimensions...
    if(width == doc.gridWidth && height == doc.gridHeight 
      && this.tileWidth == tileSet.getTileWidth() 
      && this.tileHeight == tileSet.getTileHeight()
      && offsetX == 0
      && offsetY == 0
      && cellHeight == this.getCellHeight()
      && cellWidth == this.getCellWidth()
       ) {
      return;
    }


    this.tileWidth = tileSet.getTileWidth();
    this.tileHeight = tileSet.getTileHeight();

    this.doc.cellWidth = this.tileWidth;
    this.doc.cellHeight = this.tileHeight;


    if(doc.gridWidth !== width || doc.gridHeight !== height || offsetX !== 0 || offsetY !== 0) {
      // frames need resizing
      var newFrames = [];
      for(var frame = 0; frame < this.frameCount; frame++) {

        // copy over the settings
        newFrames[frame] = {};
        newFrames[frame].holder = this.frames[frame].holder;
//          newFrames[frame].duration = this.frames[frame].duration;

        for(key in this.frames[frame]) {
          if(this.frames[frame].hasOwnProperty(key) && key !== 'data') {
            newFrames[frame][key] = this.frames[frame][key];
          }
        }
        newFrames[frame].data = null;


        var fc = this.frames[0].data[0][0].fc;

        var type = this.editor.graphic.getType();

        var data = this.frames[frame].data;

        offsetX = -offsetX;
//  reverseY       offsetY = -(height - data.length) + offsetY;
        offsetY = -offsetY;


        if(data) {
          newFrames[frame].data = [];
          for(var y = 0; y < height; y++) {
            newFrames[frame].data[y] = [];
            for(var x = 0; x < width; x++) {
              if( (y + offsetY) < data.length && (y + offsetY) >= 0 && (x + offsetX) < data[y + offsetY].length && (x + offsetX) >= 0) {
                // copy existing frame data
                newFrames[frame].data[y][x] =  { t: this.blankTileId, fc: fc, bc: -1, rz: 0, fh: 0, fv: 0 };;// {};

                /*
                if(this.hasCharRotation) {
                  newFrames[frame].data[y][x].rx = 0;
                  newFrames[frame].data[y][x].ry = 0;
                }
                */

                for(var key in data[y + offsetY][x + offsetX]) {
                  newFrames[frame].data[y][x][key] = data[y + offsetY][x + offsetX][key];
                }
              } else {
                // need to insert new data

                var tileId = this.blankTileId;
                if(type == 'sprite' && this.createSpriteTiles) {
                  tileId = tileSet.createTile();
                }

                newFrames[frame].data[y][x] =  { t: tileId, fc: fc, bc: -1, rz: 0, fh: 0, fv: 0 };

                /*
                if(this.hasCharRotation) {
                  newFrames[frame].data[y][x].rx = 0;
                  newFrames[frame].data[y][x].ry = 0;
                }
                */
              }
            }
          }
        }
      }

      this.doc.frames = newFrames;
      this.frames = this.doc.frames;

      this.doc.gridWidth = width;
      this.doc.gridHeight = height;
      this.editor.modified();      

      this.invalidateAllCells();


      this.gridWidth = width;
//      this.depth = depth;
      this.gridHeight = height;

//      this.doc.cellWidth = this.cellWidth;
//      this.doc.cellHeight = this.cellHeight;
/*
    this.width = doc.data.width;//settings.width;
    this.height = doc.data.height;//settings.height;
    this.depth = doc.data.depth;//settings.depth;
*/

    }

//    this.resizeGrid();

//    this.setCurrentFrame(this.currentFrame);

//    this.editor.grid.update({ allCells: true });

    

  },


  insertFrame: function(frame, frameData) {
    var type = this.editor.graphic.getType();
    var firstNewTile = false;
    var newTileCount = 0;
    var tileCount = 0;
/*
    if(type == 'sprite') {
      var tileSet = this.getTileSet();
      if(tileSet) {
        newTileCount = 1;
        var tileCount = tileSet.getTileCount();
        firstNewTile = tileCount;
        tileCount += newTileCount;
        alert('set tile count');
        tileSet.setTileCount(tileCount);
      }
    }
*/
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var frameObject = null;
    if(typeof frameData != 'undefined' && frameData) {
      frameObject = frameData;
    } else {
      frameObject = { data: null };
    }


    frameObject.bgColor = this.getBackgroundColor();

    frameObject.c64Multi1Color = this.getC64Multi1Color();
    frameObject.c64Multi2Color = this.getC64Multi2Color();

    if(this.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      frameObject.c64ECMColor1 = this.getC64ECMColor(1);
      frameObject.c64ECMColor2 = this.getC64ECMColor(2);
      frameObject.c64ECMColor3 = this.getC64ECMColor(3);
    }
    frameObject.borderColor = this.getBorderColor();


    this.frames.splice(frame + 1, 0, frameObject);

    this.frameCount++;
//    $('#frameCount').val(this.frameCount);    

    this.updateFrameInfo();
    this.setCurrentFrame(frame + 1);
    this.editor.modified();
/*
    if(type == 'sprite') {
      // create new tiles for this frame
      var gridWidth = this.getGridWidth();
      var gridHeight = this.getGridHeight();

      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          if(firstNewTile < tileCount) {
            this.setCell({ x: x, y: y, t: firstNewTile });
            firstNewTile++;
          }
        }
      }
    }
*/


  },

  updateFrameInfo: function() {

    if(this.isCurrentLayer()) {
      var html = ' / ' + this.frameCount;
      $('#frameCountInfo').html(html);

      if(g_app.isMobile()) {
        var frameNumber = this.currentFrame + 1;
        html = frameNumber + ' / ' + this.frameCount;
        $('#frameCountInfoMobile').html(html);
      }
    }
  },

  createFrame: function() {
    this.insertFrame();
  },

  duplicateFrame: function(fromFrame, toFrame) {
    var tileSet = this.getTileSet();

    if(fromFrame < 0 || fromFrame >= this.frames.length || toFrame < 0 || toFrame >= this.frames.length) {
      return;
    }


    var gridHeight = this.doc.gridHeight;
    var gridWidth = this.doc.gridWidth;

    var args = {};
    args.z = 0;

    for(args.y = 0; args.y < gridHeight; args.y++) {
      for(args.x = 0; args.x < gridWidth; args.x++) {
        var cell = this.frames[fromFrame].data[args.y][args.x];

        for(var key in cell) {
          if(cell.hasOwnProperty(key)) {
            args[key] = cell[key];
          }
        }

        if(this.editor.graphic.getType() == 'sprite') {

          args.t = false;

          if(this.frames[toFrame].data) {
            args.t = this.frames[toFrame].data[args.y][args.x].t;
          }

          // ok, need to create tile duplicate
          if(args.t === false) {
            args.t = tileSet.duplicateTile(cell.t);
          } else {
            tileSet.copyTile(cell.t, args.t);
          }
        }

        args.frame = toFrame;
        args.update = false;
        this.setCell(args);

      }
    }


    /*
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var newFrame = frame+1;

    this.editor.history.startEntry('Duplicate');
    this.editor.history.setNewEntryEnabled(false);

    this.insertFrame(newFrame);
    this.setCurrentFrame(newFrame);


    if(this.frames[frame].data) {
      var args = {};

      for(args.z = 0; args.z < this.depth; args.z++) {
        for(args.y = 0; args.y < this.gridHeight; args.y++) {
          for(args.x = 0; args.x < this.gridWidth; args.x++) {

            var cell = this.frames[frame].data[args.z][args.y][args.x];

            for(var key in cell) {
              if(cell.hasOwnProperty(key)) {
                args[key] = cell[key];
              }
            }

            args.update = false;

            this.editor.grid.setCell(args);
          }
        }
      }
    }

    this.editor.history.setNewEntryEnabled(true);

    this.editor.history.endEntry();
    this.editor.grid.update();
    */

  },


  deleteFrame: function(frame) {

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frames.length <= 1) {
      
      return false;
    }

    var frameData = this.frames.splice(frame, 1);


    var newFrameCount = this.frameCount - 1;
    this.setFrameCount(newFrameCount);

/*
    this.editor.history.startEntry('deleteframe');
    this.editor.history.addAction('deleteframe', { position: frame, frameData: frameData[0] });
    this.editor.history.endEntry();
*/

  },

  setFrameCount: function(frameCount) {

    // copy the background color from the last frame
    var bgColor = 0;
    if(this.frames.length > 0) {
      bgColor = this.frames[this.frames.length - 1].bgColor;
    } else {
      var colorPalette = this.getColorPalette();
      if(colorPalette != null) {
        bgColor = this.defaultBackgroundColor;// colorPalette.getDefaultBackgroundColor();
      }
    }

    var borderColor = this.editor.colorPaletteManager.noColor;
    if(this.frames.length > 0) {
      borderColor = this.frames[this.frames.length - 1].borderColor;
    } else {
//      var colorPalette = this.getColorPalette();
//      if(colorPalette != null) {
        borderColor = this.defaultBorderColor;// colorPalette.getDefaultBackgroundColor();
//      }
    }


    while(frameCount > this.frames.length) {
      if(this.frames.length == 0) {
        // first time this has been called
        var tileSet = this.getTileSet();
        if(tileSet) {
          this.setBlankTileId(tileSet.getBlankCharacter(), false);
        }
      }

      this.frames.push({ data: null, bgColor: bgColor, borderColor: borderColor });
      this.createFrameData(this.frames.length - 1);
    }

    if(frameCount < this.frameCount) {
      for(var i = frameCount; i < this.frameCount; i++) {
        this.clearFrame(i);
      }

    }

    this.frameCount = frameCount;
//    $('#frameCount').val(frameCount);    
    this.updateFrameInfo();
    this.editor.modified();
  },

  getFrameCount: function() {
    return this.frameCount;
  },

  getCurrentFrame: function() {
    return this.currentFrame;
  },

  setFrameData: function(frame, frameData, z) {
    var doc = this.doc;

    if(this.frames[frame].data == null) {
      this.frames[frame].data = [];
    } 

    var data = this.frames[frame].data;
    
    var hasRotationFlip = typeof frameData[0][0].rz != 'undefined';
    var hasBlocks = this.getBlockModeEnabled() && frameData[0][0].b != 'undefined';

    data = [];
    for(var y = 0; y < doc.gridHeight; y++) {
      data[y] = [];
      for(var x = 0; x < doc.gridWidth; x++) {

        if(y < frameData.length && x < frameData[0].length) {
          data[y][x] = { t: frameData[y][x].t, fc: frameData[y][x].fc, bc: frameData[y][x].bc, rz: 0, fh: 0, fv: 0 };
          if(hasRotationFlip) {
            data[y][x].rz = frameData[y][x].rz;
            data[y][x].fh = frameData[y][x].fh;
            data[y][x].fv = frameData[y][x].fv;
          }

        } else {

          data[y][x] = { t: this.blankTileId, fc: 1, bc: -1, rz: 0, fh: 0, fv: 0 };

          /*
          if(this.hasCharRotation) {
            data[y][x].rx = 0;
            data[y][x].ry = 0;            
          }
          */

          if(this.getBlockModeEnabled()) {
            data[y][x].b = 0;
          }
        }
      }
    }
  },

  getFrames: function() {
    return this.frames;
  },

  getFrameData: function(frame) {
    return this.frames[frame];
  },

  createFrameData: function(frame) {
    var tileSet = this.getTileSet();
    var doc = this.doc;

    // create the data for the frame if it doesn't exist
    if(this.frames[frame].data == null) {

      var data = [];
      for(var y = 0; y < doc.gridHeight; y++) {
        data[y] = [];
        for(var x = 0; x < doc.gridWidth; x++) {

          var tileId = this.blankTileId;
          if(this.editor.graphic.getType() == 'sprite' && this.createSpriteTiles) {
            tileId = tileSet.createTile();
          }

          data[y][x] = { t: tileId, fc: 1, bc: -1, rz: 0, fh: 0, fv: 0 };

          /*
          if(this.hasCharRotation) {
            data[y][x].rx = 0;
            data[y][x].ry = 0;            
          }
          */

          if(this.getBlockModeEnabled()) {
            data[y][x].b = 0;
          }
        }
      }
      this.frames[frame].data = data;
    }
  },

  updateTilesFromBlocks: function() {


    var colorPerMode = this.getColorPerMode();

    for(var frame = 0; frame < this.frames.length; frame++) {
      var gridWidth = this.getGridWidth();
      var gridHeight = this.getGridHeight();

      var gridData = this.frames[frame].data;
      if(!gridData) {
        return false;
      }
      var blockSet = this.editor.blockSetManager.getCurrentBlockSet();


      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {

          var cell = gridData[y][x];
          if(this.getBlockModeEnabled() && cell.b !== false) {
            var xBlockOffset = this.getXOffsetInBlock(x);
//  reverseY          var yBlockOffset = this.getYOffsetInBlock(this.getGridHeight() - y - 1);
            var yBlockOffset = this.getYOffsetInBlock(y);
      
            cell.t = blockSet.getCharacterInBlock(cell.b, xBlockOffset, yBlockOffset);
            

            if(colorPerMode == 'block') {
              cell.fc = blockSet.getBlockColor(cell.b);
              cell.bc = blockSet.getBlockBGColor(cell.b);
            }
          }    
        }
      }
    }
  },


  // set the colours in the grid from the tile colours if in color per tile mode
  updateGridColorsFromTiles: function() {
    var colorPerMode = this.getColorPerMode();
    if(colorPerMode != 'character') {
      return;
    }

    var tileSet = this.getTileSet();

    for(var frame = 0; frame < this.frames.length; frame++) {
      var gridWidth = this.getGridWidth();
      var gridHeight = this.getGridHeight();

      var gridData = this.frames[frame].data;
      if(!gridData) {
        return false;
      }

      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          var cell = gridData[y][x];
          cell.fc = tileSet.getTileColor(cell.t);
          cell.bc = tileSet.getTileBGColor(cell.t);
        }
      }
    }
  },

  invalidateAllCells: function() {
    var doc = this.doc;

    this.updatedCellRanges.minX = 0;
    this.updatedCellRanges.maxX = doc.gridWidth;
    this.updatedCellRanges.minY = 0;
    this.updatedCellRanges.maxY = doc.gridHeight;

    this.drawnBounds.fromX = 0;
    this.drawnBounds.fromY = 0;
    this.drawnBounds.toX = 0;
    this.drawnBounds.toY = 0;
  },

  setCurrentFrame: function(frame) {

    frame = parseInt(frame, 10);

    if(isNaN(frame) || frame >= this.frameCount || frame < 0) {
      return false;
    }


    this.currentFrame = parseInt(frame, 10);

    this.createFrameData(this.currentFrame);

    this.invalidateAllCells();

/*
    this.editor.grid.setGridData(this.frames[frame].data, this.frames[frame].holder);

    if(this.showPrevFrame) {
      if(frame > 0) {
        this.editor.grid.setGridGhostData(this.frames[frame - 1].data, this.frames[frame - 1].holder);
      } else {
        this.editor.grid.setGridGhostData(null, null);
      }
    }
*/



    if(this.isCurrentLayer()) {
      var colorPalette = this.getColorPalette();
      var bgColor = this.frames[frame].bgColor;

      var borderColor = this.frames[frame].borderColor;

      if(colorPalette) {
        if(typeof bgColor == 'undefined') {
          bgColor = colorPalette.getDefaultBackgroundColor();

          this.frames[frame].bgColor = bgColor;
        }

        if(typeof borderColor == 'undefined') {
          borderColor = colorPalette.getDefaultBorderColor();
          this.frames[frame].borderColor = borderColor;
        }
      }

      this.editor.tools.currentBackgroundColor = bgColor;

      if(bgColor !== this.editor.colorPaletteManager.noColor  && bgColor >= 0) {
      //  this.setBackgroundColor(bgColor, false);
      }

      if(borderColor !== this.editor.colorPaletteManager.noColor && borderColor >= 0) {

    //    this.setBorderColor(borderColor, false);

      }
    }
/*
    // TODO: readd this..
    if(this.editor.type == '2d') {
      this.editor.grid.update();
    }

    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.currentFrame = this.currentFrame;

    this.frameTimeline.draw();
*/    
  },



  getCell: function(args) {

    var frame = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frame = args.frame;
    }

    if(isNaN(frame) || frame < 0 || frame >= this.frames.length) {
      return false;
    }

    var gridData = this.frames[frame].data;
    if(!gridData) {
      return false;
    }

    var x = args.x;
    var y = args.y;

    if(y < 0 || y>= gridData.length || x < 0 || x >= gridData[0].length) {
      return false;
    }

    var cell = gridData[y][x];
    if(this.getBlockModeEnabled() && cell.b !== false) {
      var xBlockOffset = this.getXOffsetInBlock(x);
//      var yBlockOffset = this.getYOffsetInBlock(this.getGridHeight() - y - 1);
      var yBlockOffset = this.getYOffsetInBlock(y);
      var blockSet = this.editor.blockSetManager.getCurrentBlockSet();

      cell.t = blockSet.getCharacterInBlock(cell.b, xBlockOffset, yBlockOffset);

    }

    return cell;

  },

  getTile: function(args) {
    var cell = this.getCell(args);
    if(cell === false) {
      return false;
    }

    return cell.t;
  },

  nesCheckAttributes: function(frame, x, y) {
    // each 2x2 needs to have the same fc value (sub-palette)
    // make sure the same as x, y
    var gridData = this.frames[frame].data;
    if(!gridData) {
      return;
    }

    var gridWidth = this.doc.gridWidth;
    var gridHeight = this.doc.gridHeight;

    var cell = gridData[y][x];

    var x2 = x + 1;
    if(x % 2) {
      x2 = x - 1;
    }

    var y2 = y + 1;
    if(y % 2) {
      y2 = y - 1;
    }

    if(x2 >= 0 && x2 < gridWidth) {      
      if(gridData[y][x2].fc != gridData[y][x].fc) {
        var args = {};
        args.x = x2;
        args.y = y;
        args.checkNESAttributes = false;
        
        for(var key in gridData[y][x2]) {
          if(gridData[y][x2].hasOwnProperty(key)) {
            args[key] = gridData[y][x2][key];
          }
        }

        args.fc = gridData[y][x].fc;
        this.setCell(args);
      }
    }

    if(y2 >= 0 && y2 < gridHeight) {      
      if(gridData[y2][x].fc != gridData[y][x].fc) {
        var args = {};
        args.x = x;
        args.y = y2;
        args.checkNESAttributes = false;
        
        for(var key in gridData[y][x2]) {
          if(gridData[y2][x].hasOwnProperty(key)) {
            args[key] = gridData[y2][x][key];
          }
        }

        args.fc = gridData[y][x].fc;
        this.setCell(args);
      }
    }

    if(x2 >= 0 && x2 < gridWidth && y2 >= 0 && y2 < gridHeight) {      
      if(gridData[y2][x2].fc != gridData[y][x].fc) {
        var args = {};
        args.x = x2;
        args.y = y2;
        args.checkNESAttributes = false;
        
        for(var key in gridData[y2][x2]) {
          if(gridData[y2][x2].hasOwnProperty(key)) {
            args[key] = gridData[y2][x2][key];
          }
        }

        args.fc = gridData[y][x].fc;
        this.setCell(args);

      }
    }


  },


  setCell: function(args) {

    if(typeof args.t == 'undefined') {
      return;
    }

    var frame = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frame = args.frame;
    }

    if(frame === false) {
      return;
    }

    if(isNaN(frame) || frame < 0 || frame >= this.frames.length) {
      return;
    }

    var gridData = this.frames[frame].data;
    if(!gridData) {
      return;
    }

    var doc = this.doc;

    var x = args.x;
    var y = args.y;
    var z = 0;//args.z;


    // the tile id
    var t = args.t;

    // the block
    var b = false;
    if(typeof args.b !== 'undefined') {
      b = args.b;
    }


    var fc = this.editor.currentTile.color;
    if(typeof args.fc !== 'undefined') {
      fc = args.fc;
    }

    var rx = this.editor.currentTile.rotX;
    if(typeof args.rx !== 'undefined') {
      rx = args.rx;
    }

    var ry = this.editor.currentTile.rotY;
    if(typeof args.ry !== 'undefined') {
      ry = args.ry;
    }

    var rz = this.editor.currentTile.rotZ;
    if(typeof args.rz !== 'undefined') {
      rz = args.rz;
    }


    fh = 0;
    if(typeof args.fh !== 'undefined') {
      fh = args.fh;
    }

    fv = 0;
    if(typeof args.fv !== 'undefined') {
      fv = args.fv;
    }

    if(this.editor.tools.drawTools.select.isActive()) {
      // if selection visible, only draw characters inside selection
      if(!this.editor.tools.drawTools.select.inSelection(x, y, z)) {
        return;
      }
    }

    if(x >= doc.gridWidth || x < 0 || y >= doc.gridHeight || y < 0) {//} || z >= this.doc.depth || z < 0) {
      // outside grid

      return;
    }
    

    var cell = gridData[y][x];



    var bc = this.editor.currentTile.bgColor;
    if(typeof args.bc !== 'undefined') {
      bc = args.bc;
    } else {
      if(typeof cell.bc != 'undefined') {
        bc = cell.bc
      } 
    }    

    if(!doc.blockMode) {

      // check if cell has changed
      if(cell.t == t && cell.fc == fc
        && cell.rz == rz
        && cell.fh == fh
        && cell.fv == fv
//        &&  (!this.hasCharRotation || (cell.rx == rx && cell.ry == ry && cell.rz == rz)) 
        && cell.bc === bc) {
        // no change
        return;
      }
    }



    // if its the current frame, mark range for redraw.
    if(frame === this.currentFrame) {
      if(x < this.updatedCellRanges.minX) {
        this.updatedCellRanges.minX = x;
      }
      if(x + 1 > this.updatedCellRanges.maxX) {
        this.updatedCellRanges.maxX = x + 1;
      }

      if(y < this.updatedCellRanges.minY) {
        this.updatedCellRanges.minY = y;
      }
      if(y + 1 > this.updatedCellRanges.maxY) {
        this.updatedCellRanges.maxY = y + 1;
      }

      // invalidate drawn bounds if x and y are within it
      if(x >= this.drawnBounds.fromX && x < this.drawnBounds.toX) {
        // should really work out what invalidates the least area
        this.drawnBounds.fromX = x + 1;
      }

      if(y >= this.drawnBounds.fromY && y < this.drawnBounds.toY) {
        this.drawnBounds.fromY = y + 1;
      }

    }

    // record the action
    var params = { 
                   "x": x, "y": y, 
                   "layerRef": this.layerRef,
                   "oldCharacter": cell.t,
                   "oldColor": cell.fc,
                   "oldBgColor": cell.bc,
                   "oldFh": cell.fh,
                   "oldFv": cell.fv,
                   "oldRz": cell.rz,
                   "newCharacter": t, 
                   "newColor": fc,
                   "newBgColor": bc,
                   "newFh": fh,
                   "newFv": fv,
                   "newRz": rz,
                   "frame": frame
                 };

    if(this.getBlockModeEnabled() && b !== false) {
      params["oldB"] = cell.b;
      params["newB"] = b;
    }

    if(this.hasCharRotation) {
      params["oldRx"] = cell.rx;
      params["oldRy"] = cell.ry;
//      params["oldRotZ"] = cell.rz;
      params["newRx"] = rx;
      params["newRy"] = ry;
//      params["newRotZ"] = rz;
    }                   


    if(!this.getBlockModeEnabled() || b !== false) {
      this.editor.history.addAction("setCell", params);
    }

    cell.t = t;
    cell.fc = fc;
    cell.bc = bc;
    cell.fh = fh;
    cell.fv = fv;
    cell.rz = rz;


    if(this.getBlockModeEnabled()) {
      if(b !== false) {
        // setting the block
        cell.b = b;
      } else {
        // setting a character within the block
        b = gridData[y][x].b;
        if(typeof b !== 'undefined') {
          // get the offset in the block
          var xBlockOffset = this.getXOffsetInBlock(x);
// reverseY          var yBlockOffset = this.getYOffsetInBlock(doc.gridHeight - y - 1);
          var yBlockOffset = this.getYOffsetInBlock(y );
          var blockSet = this.editor.blockSetManager.getCurrentBlockSet();

          blockSet.setCharacterInBlock(b, xBlockOffset, yBlockOffset, t);
        }
      }
    }

    /*
    if(this.hasCharRotation) {
      cell.rx = rx;
      cell.ry = ry;
      cell.rz = rz;
    } 
    */

    if(this.getScreenMode() == TextModeEditor.Mode.NES) {
      if(typeof args.checkNESAttributes == 'undefined' || args.checkNESAttributes !== false) {
        this.nesCheckAttributes(frame, x, y);
      }
    }

    this.editor.modified();
  },



  updatePreview: function() {

    var previewWidth = this.doc.gridWidth * this.doc.cellWidth;
    var previewHeight = this.doc.gridHeight * this.doc.cellHeight;

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


    if(previewWidth < 1) {
      previewWidth = 1;
    }

    if(previewHeight < 1) {
      previewHeight = 1;
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

    // might need to draw background
    if(this.isCurrentLayer() && this.editor.frames.getShowPrevFrame()) {
      var colorPalette = this.getColorPalette();
      var bgColor = this.getBackgroundColor();
      if(bgColor !== this.editor.colorPaletteManager.noColor) {
        this.previewContext.fillStyle = '#' + colorPalette.getHexString(bgColor);  
        this.previewContext.fillRect(0, 0,this.previewCanvas.width, this.previewCanvas.height);
      }

    }

    this.previewContext.drawImage(this.getCanvas(), 0, 0, this.previewCanvas.width, this.previewCanvas.height); 

  },


  setViewBounds: function(minX, minY, maxX, maxY) {
    this.viewMinX = Math.floor(minX / this.doc.cellWidth);
    this.viewMaxX = Math.ceil(maxX / this.doc.cellWidth);
    this.viewMinY = Math.floor(minY / this.doc.cellHeight);
    this.viewMaxY = Math.ceil(maxY / this.doc.cellHeight);
  },

  hasCellBackgroundColors: function() {
    var gridHeight = this.getGridHeight();
    var gridWidth = this.getGridWidth();

    var frameCount = this.frameCount;
    if(frameCount > 10) {
      frameCount = 10;
    }
    for(var frame = 0; frame < frameCount; frame++) {
      if(this.frames[frame].data) {
        for(y = 0; y < gridHeight; y++) {
          for(x = 0; x < gridWidth; x++) {
            if(this.frames[frame].data[y][x].bc != this.editor.colorPaletteManager.noColor) {
              return true;
            }
          }
        }
      }
    }

    return false;
  },



  setSpriteColor: function(color) {
    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    for(var y = 0; y < gridHeight; y++) {
      for(var x = 0; x < gridWidth; x++) {
        var cellData = this.getCell({ x: x, y: y });
        if(cellData.fc !== color) {
          this.setCell({ x: x, y: y, fc: color, t: cellData.t });
        }
      }
    }
  },


  // used to draw pasted pixels
  // pixel data is sent in via args
  drawPixels: function(args) {

    var canvas = args.canvas;
    var pixelData = args.pixelData;

    var height = pixelData.length;
    var width = pixelData[0].length;

    if(canvas.width < width) {
      canvas.width = width;
    }

    if(canvas.height < height) {
      canvas.height = height;
    }

    var colorIndex = 0;
    if(typeof args.colorIndex != 'undefined') {
      colorIndex = args.colorIndex;
    }

    var frameIndex = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frameIndex = args.frame;      
    }



    var context = canvas.getContext('2d');

    var colorPalette = this.getColorPalette();

    var screenMode = this.getScreenMode();

    var isSprite = this.editor.graphic.getType() == 'sprite';


    // get colours for c64 multicolor mode
    var colors = [];
    if(screenMode === TextModeEditor.Mode.C64MULTICOLOR) {

      var backgroundColor = this.getBackgroundColor(frameIndex);
      var cellColor = this.editor.currentTile.color;
      var multi1 = this.getC64Multi1Color(frameIndex);
      var multi2 = this.getC64Multi2Color(frameIndex);

      colors = [];
      if(this.editor.graphic.getType() == 'sprite') {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(cellColor));
        colors.push(colorPalette.getColor(multi2));

      } else {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(multi2));
        colors.push(colorPalette.getColor(cellColor));
      }
    }

    var color = colorPalette.getHex(colorIndex);
    var colorR = (color >> 16) & 255;
    var colorG = (color >> 8) & 255;
    var colorB =  color & 255;

    context.clearRect(0, 0, width, height);
    var imageData = context.getImageData(0, 0, width, height);  
    var screenMode = this.getMode();


    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {

      for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
          var dstPos = (y * width + x) * 4;          
          if(x + 1 < pixelData[height - 1].length) {
//  reverseY          var pixel = pixelData[height - 1 - y][x];
            var pixel = pixelData[y][x];
            var value = 0;

            // upper bit
            if(pixel > 0) {
              value += 2;
            }
// reverseY            pixel = pixelData[height - 1 - y][x + 1];
            pixel = pixelData[y][x + 1];
            // lower bit
            if(pixel > 0) {
              value += 1;
            }

            // TODO: do this without multiplications
            var color = colors[value];
            if(value == 0) {

              imageData.data[dstPos + 3] = 0;
              imageData.data[dstPos + 7] = 0;                    

            } else if( (!isSprite && value == 3) || (isSprite && value == 2)) {
              imageData.data[dstPos] = colorR; 
              imageData.data[dstPos + 1] = colorG;
              imageData.data[dstPos + 2] = colorB;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = colorR;
              imageData.data[dstPos + 5] = colorG;
              imageData.data[dstPos + 6] = colorB;
              imageData.data[dstPos + 7] = 255;
            } else {
              imageData.data[dstPos] = color.r * 255; 
              imageData.data[dstPos + 1] = color.g * 255;
              imageData.data[dstPos + 2] = color.b * 255;
              imageData.data[dstPos + 3] = 255;

              imageData.data[dstPos + 4] = color.r * 255; 
              imageData.data[dstPos + 5] = color.g * 255;
              imageData.data[dstPos + 6] = color.b * 255;
              imageData.data[dstPos + 7] = 255;
            }

            // need to skip next pixel cos c64 multicolor
            x++;
          }
        }
      }

    } else {

      for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
// reverseY          var pixel = pixelData[height - 1 - y][x];
          var pixel = pixelData[y][x];
          if(pixel) {

            var dstPos = (y * width + x) * 4;
            imageData.data[dstPos++] = colorR;
            imageData.data[dstPos++] = colorG;
            imageData.data[dstPos++] = colorB;
            imageData.data[dstPos++] = 255;
          }
        }
      }

    }
    context.putImageData(imageData, 0, 0);
  },

  replaceColor: function(oldColor, newColor) {
    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();

    for(var frameIndex = 0; frameIndex < this.frames.length; frameIndex++) {
      var frameData = this.frames[frameIndex].data;

      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          if(frameData[y][x].fc == oldColor) {
            frameData[y][x].fc = newColor;
          }
          if(frameData[y][x].bc == oldColor) {
            frameData[y][x].bc = newColor;
          }
          //frameData[y][x].t = blankTileId;

        }
      }


      var bgColor = this.frames[frameIndex].bgColor;
      if(bgColor === oldColor) {
        this.frames[frameIndex].bgColor = newColor;
      }

      var borderColor = this.frames[frameIndex].borderColor;
      if(borderColor === oldColor) {
        this.frames[frameIndex].borderColor = newColor;
      }
    }
  },

  // draw a part of a vector grid
  drawVector: function(args) {


    var canvas         = args.canvas;
    var context        = canvas.getContext('2d');

    var tileSet        = this.getTileSet();
    var colorPalette   = this.getColorPalette();
    var gridWidth      = this.getGridWidth();
    var gridHeight     = this.getGridHeight();
    var tileWidth      = tileSet.getTileWidth();
    var tileHeight     = tileSet.getTileHeight();
    

    var allCells = false;
    if(typeof args.allCells != 'undefined') {
      allCells = args.allCells;
    }

    var shapes = false;
    if(typeof args.shapes != 'undefined') {
      shapes = args.shapes;
    }

    if(shapes) {
      allCells = true;
    }

    var fgOnly = false;
    if(typeof args.fgOnly != 'undefined') {
      fgOnly = args.fgOnly;
    }

    var bgOnly = false;
    if(typeof args.bgOnly != 'undefined') {
      bgOnly = args.bgOnly;
    }

    // only draw the cursor?
    var cursor = false;
    if(typeof args.cursor != 'undefined') {
      cursor = args.cursor;
    } 

    // erase the previous cursor?
    var eraseCursor = false;
    if(typeof args.eraseCursor != 'undefined') {
      eraseCursor = args.eraseCursor;
    }


    var typingCursor = false;
    if(typeof args.typingCursor != 'undefined') {
      typingCursor = args.typingCursor;
    }

    var eraseTypingCursor = false;
    if(typeof args.eraseTypingCursor != 'undefined') {
      eraseTypingCursor = args.eraseTypingCursor;
    }

    // draw the drag paste area
    var dragPaste = false;
    if(typeof args.dragPaste != 'undefined') {
      dragPaste = args.dragPaste;
    }

    // erase the last drag paste area
    var eraseDragPaste = false;
    if(typeof args.eraseDragPaste != 'undefined') {
      eraseDragPaste = args.eraseDragPaste;
    }
    
    var drawBackground = this.editor.layers.isBackgroundVisible();
    if(typeof args.drawBackground != 'undefined') {
      drawBackground = args.drawBackground;
    }


    var draw = 'grid';
    if(typeof args.draw != 'undefined') {
      draw = args.draw;
    }

    //the offset the grid is drawn at
    var offsetX = 0;
    var offsetY = 0;

  
    // check if have required params
    if(typeof args.drawFromX == 'undefined' || typeof args.drawFromY == 'undefined') {
      return {
        offsetX: offsetX,
        offsetY: offsetY
      };
    }


    // need the extra parameters
    var scale = args.scale;    
    var drawFromX = args.drawFromX;
    var drawFromY = args.drawFromY;
    var drawToX = args.drawToX;
    
    var drawToY = args.drawToY;

    //console.log(scale);

    if(drawFromX < 0) {
      drawFromX = 0;
    }

    if(drawFromY < 0) {
      drawFromY = 0;
    }

    var drawFromGridX = Math.floor(drawFromX / tileWidth);
    var drawFromGridY = Math.floor(drawFromY / tileHeight);
    var drawToGridX = Math.ceil(drawToX / tileWidth);
    var drawToGridY = Math.ceil(drawToY / tileHeight);

    // if any of these parameters have changed, need to redraw everything...
    if(drawFromGridX != this.lastDrawFromGridX || drawFromGridY != this.lastDrawFromGridY 
       || drawToGridX != this.lastDrawToGridX || drawToGridY != this.lastDrawToGridY
       || scale != this.lastDrawScale) {
         allCells = true;    
         
      if(!bgOnly) {
        if(!cursor && !eraseCursor && !dragPaste && !eraseDragPaste && !typingCursor && !eraseTypingCursor) {
          // only save these if drawing the graphic
          this.lastDrawFromGridX = drawFromGridX;
          this.lastDrawFromGridY = drawFromGridY;
          this.lastDrawToGridX = drawToGridX;
          this.lastDrawToGridY = drawToGridY;
          this.lastDrawScale = scale;
        }
      }
    }



    // work out the offsets
    offsetX = ((drawFromGridX * tileWidth) - drawFromX) * scale;
    offsetY = ((drawFromGridY * tileHeight) - drawFromY) * scale;

    if(drawToGridX > gridWidth) {
      drawToGridX = gridWidth;
    }

    if(drawToGridY > gridHeight) {
      drawToGridY = gridHeight;
    }

    var drawGridWidth = drawToGridX - drawFromGridX;
    var drawGridHeight = drawToGridY - drawFromGridY;

    tileWidth = tileWidth * scale;
    tileHeight = tileHeight * scale;

    var canvasWidth = Math.ceil(drawGridWidth * tileWidth);
    var canvasHeight = Math.ceil(drawGridHeight * tileHeight);

    if(canvas.width < canvasWidth || canvas.height < canvasHeight) {      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      context = canvas.getContext('2d');

      // resizing the canvas so need to redraw everything
      allCells = true;
    }



/*
    drawToX = args.dstX;
    drawToY = args.dstY;
    drawToWidth = args.dstWidth;
    drawToHeight = args.dstHeight;

    console.log(drawToX + ',' + drawToY + ',' + drawToWidth);
*/

    if(typeof scale == 'undefined') {
      return {
        offsetX: offsetX,
        offsetY: offsetY
      };
    }

    var frameIndex = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frameIndex = args.frame;    
    }

    var hasTileFlip = this.getHasTileFlip();
    var hasTileRotate = this.getHasTileRotate();
    
    if(frameIndex >= this.frames.length) {
      // invalid frame index..
      return {
        offsetX: offsetX,
        offsetY: offsetY
      };
    }

    
//    var frame = this.frames[frameIndex];    



    var colorPerMode = this.getColorPerMode();
    
    // the data about the grid's cells
    var gridData = this.frames[frameIndex].data;
    var shapesGrid = this.editor.tools.drawTools.shapes.getGrid();

    var transparentColorIndex = this.getTransparentColorIndex();
    var colorIndex = 0;
    var bgColorIndex = 0;
    var tileIndex = 0;
    var flipV = false;
    var flipH = false;
    var rotZ = false;

    var drawCharacter = false;

    
    var bgColor = this.getBackgroundColor(frameIndex);
    if(!drawBackground) {
      bgColor = this.editor.colorPaletteManager.noColor;
    }


    var fromX = drawFromGridX;
    var toX = drawToGridX;
    var fromY = drawFromGridY;
    var toY = drawToGridY;
    var dstX = 0;
    var dstY = 0;
    var contextSaved = false;

    var selectionX  = this.editor.tools.drawTools.select.selection.minX;
    var selectionY  = this.editor.tools.drawTools.select.selection.minY;
    var selectionOffsetX =  this.editor.tools.drawTools.select.selectionOffsetX;
    var selectionOffsetY =  this.editor.tools.drawTools.select.selectionOffsetY;
    var selectionWidth = this.editor.tools.drawTools.select.selection.maxX - this.editor.tools.drawTools.select.selection.minX;
    var selectionHeight = this.editor.tools.drawTools.select.selection.maxY - this.editor.tools.drawTools.select.selection.minY;

    if(allCells) {
      
    }

    // used in cursor mode and drag paste mode, offset into cursor/pasted area currently drawing
    var cursorX = 0;
    var cursorY = 0;
    // array of cursor tiles
    var cursorTiles = false;
    var pasteTiles = false;

    if(eraseDragPaste) {

      fromX = this.lastDragPasteFromX - 1;
      fromY = this.lastDragPasteFromY - 1;
      toX = this.lastDragPasteToX + 1;
      toY = this.lastDragPasteToY + 1;

      if(toX > gridWidth) {
        toX = gridWidth;        
      }

      if(toY > gridHeight) {
        toY = gridHeight;
      }

      if(fromX < 0) {
        fromX = 0;
      }

      if(fromY < 0) {
        fromY = 0;
      }


      
      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;


    } else if(dragPaste) {
      
      pasteTiles = this.editor.tools.drawTools.select.getPasteData();
      if(pasteTiles.length == 0) {
        return;
      }

      var pastePositionX  = selectionX + selectionOffsetX; // this.editor.tools.drawTools.select.selection.minX + this.editor.tools.drawTools.select.selectionOffsetX;//this.editor.grid.grid2d.cursor.position.x + this.editor.grid.grid2d.cursor.offset.x;
      var pastePositionY  = selectionY + selectionOffsetY; //this.editor.tools.drawTools.select.selection.minY+ this.editor.tools.drawTools.select.selectionOffsetY;//this.editor.grid.grid2d.cursor.position.y + this.editor.grid.grid2d.cursor.offset.y;
      var pasteWidth = pasteTiles[0].length;
      var pasteHeight = pasteTiles.length;

      // drawing the cursor
      fromX = pastePositionX;// - drawFromGridX;
      fromY = pastePositionY;// - drawFromGridY;
      toX = fromX + pasteWidth;
      toY = fromY + pasteHeight;

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;


      this.lastDragPasteFromX = fromX;
      this.lastDragPasteFromY = fromY;
      this.lastDragPasteToX = toX;
      this.lastDragPasteToY = toY;
    } else if(eraseCursor) {
      fromX = this.lastCursorFromX;// - 1;
      fromY = this.lastCursorFromY;// - 1;
      toX = this.lastCursorToX;// + 1;
      toY = this.lastCursorToY;// + 1;

      if(toX > gridWidth) {
        toX = gridWidth;        
      }

      if(toY > gridHeight) {
        toY = gridHeight;
      }

      if(fromX < 0) {
        fromX = 0;
      }

      if(fromY < 0) {
        fromY = 0;
      }

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;
      
    } else if(cursor) {

      cursorTiles = this.editor.currentTile.getTiles();
      var cursorPositionX  = this.editor.grid.grid2d.cursor.position.x + this.editor.grid.grid2d.cursor.offset.x;
      var cursorPositionY  = this.editor.grid.grid2d.cursor.position.y + this.editor.grid.grid2d.cursor.offset.y;
      var cursorWidth = this.editor.currentTile.getCursorWidth();
      var cursorHeight = this.editor.currentTile.getCursorHeight();

      // drawing the cursor
      fromX = cursorPositionX;// - drawFromGridX;
      fromY = cursorPositionY;// - drawFromGridY;
      toX = fromX + cursorWidth;
      toY = fromY + cursorHeight;

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;

      this.lastCursorFromX = fromX;
      this.lastCursorFromY = fromY;
      this.lastCursorToX = toX;
      this.lastCursorToY = toY;
    } else if(typingCursor) {
      fromX = this.editor.tools.drawTools.typing.cursor.x;
      fromY = this.editor.tools.drawTools.typing.cursor.y;

      if(this.lastTypingCursorFromX !== false && (this.lastTypingCursorFromX != fromX || this.lastTypingCursorFromY != fromY)) {
        // cursor has moved, need to erase
        fromX = this.lastTypingCursorFromX;// - 1;
        fromY = this.lastTypingCursorFromY;// - 1;
        toX = this.lastTypingCursorToX;// + 1;
        toY = this.lastTypingCursorToY;// + 1;
  
        if(toX > gridWidth) {
          toX = gridWidth;        
        }
  
        if(toY > gridHeight) {
          toY = gridHeight;
        }
  
        if(fromX < 0) {
          fromX = 0;
        }
  
        if(fromY < 0) {
          fromY = 0;
        }
  
        dstX = (fromX - drawFromGridX) * tileWidth;
        dstY = (fromY - drawFromGridY) * tileHeight;
  
        
        this.lastTypingCursorFromX = false;
        this.lastTypingCursorFromY = false;
        eraseTypingCursor = true;
        typingCursor = false;

  
      } else {
        toX = fromX + 1;
        toY = fromY + 1;

        dstX = (fromX - drawFromGridX) * tileWidth;
        dstY = (fromY - drawFromGridY) * tileHeight;

        this.lastTypingCursorFromX = fromX;
        this.lastTypingCursorFromY = fromY;
        this.lastTypingCursorToX = toX;
        this.lastTypingCursorToY = toY;
      }
    } else if(eraseTypingCursor) {

      if(this.lastTypingCursorFromX  === false) {
        return;
      }

      fromX = this.lastTypingCursorFromX;// - 1;
      fromY = this.lastTypingCursorFromY;// - 1;
      toX = this.lastTypingCursorToX;// + 1;
      toY = this.lastTypingCursorToY;// + 1;

      if(toX > gridWidth) {
        toX = gridWidth;        
      }

      if(toY > gridHeight) {
        toY = gridHeight;
      }

      if(fromX < 0) {
        fromX = 0;
      }

      if(fromY < 0) {
        fromY = 0;
      }

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;

      this.lastTypingCursorFromX = false;
      this.lastTypingCursorFromY = false;

    } else if(allCells === false && draw != 'shapes' && draw != 'prevgrid') {

      if(this.updatedCellRanges.minX >= this.updatedCellRanges.maxX || this.updatedCellRanges.minY >= this.updatedCellRanges.maxY) {
        // nothing to do..
        return {
          offsetX: offsetX,
          offsetY: offsetY
        };
      }


      // set update to only draw the updated cells, this is the default..
      fromX = this.updatedCellRanges.minX;
      if(fromX < drawFromGridX) {
        fromX = drawFromGridX;
      }
      
      toX = this.updatedCellRanges.maxX;
      if(toX > drawToGridX) {
        toX = drawToGridX;
      }

      fromY = this.updatedCellRanges.minY;
      if(fromY < drawFromGridY) {
        fromY = drawFromGridY;
      }

      toY = this.updatedCellRanges.maxY;
      if(toY > drawToGridY) {
        toY = drawToGridY;
      }

      // set where to start drawing from
      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;
    }


    // need to calculate this properly..
    var fromPixelX = 0;
    var fromPixelY = 0;
    var pixelWidth = canvasWidth;
    var pixelHeight = canvasHeight;


    fromPixelX = dstX ;
    fromPixelY = dstY ;
    pixelWidth = (toX - fromX) * tileWidth;
    pixelHeight = (toY - fromY) * tileHeight;


    if(allCells) {
//      context.fillStyle = '#000000';
//      context.fillRect(0, 0, canvas.width, canvas.height);
    }


    // expand the cells being drawn, clip half way
    if(!allCells && !cursor && !dragPaste) {
      var clipFromX = (fromX - drawFromGridX) * tileWidth;
      var clipFromY = (fromY - drawFromGridY) * tileHeight;
      var clipWidth = pixelWidth;
      var clipHeight = pixelHeight;

      if(fromX > 0) {
        fromX -= 1;
        clipFromX -= tileWidth / 2;
        clipWidth += tileWidth / 2;
        dstX = (fromX - drawFromGridX) * tileWidth;
      }

      if(toX < gridWidth) {
//        if(toX < gridWidth - 1) {
          toX += 1;
          clipWidth += tileWidth / 2;
//       }
      }
      if(fromY > 0) {
        fromY -= 1;
        clipFromY -= tileHeight / 2;
        clipHeight += tileHeight / 2;
        dstY = (fromY - drawFromGridY) * tileHeight;
      }
      if(toY < gridHeight) {//} - 1) {
        toY += 1;
        clipHeight += tileHeight / 2;
      }
      
      contextSaved = true;
      context.save();
      context.beginPath();
      context.rect(clipFromX, clipFromY, clipWidth, clipHeight);
      
      context.clip();

      fromPixelX = dstX ;
      fromPixelY = dstY ;
      pixelWidth = (toX - fromX) * tileWidth;
      pixelHeight = (toY - fromY) * tileHeight;
           
    }

    if(!fgOnly && !typingCursor) {
//      console.log('draw background!');
      if(bgColor != this.editor.colorPaletteManager.noColor) {
        context.fillStyle= '#' + colorPalette.getHexString(bgColor);      
        context.fillRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);
      } else {
        context.clearRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);

      }
    }
 
    
    var cellSize = tileWidth
    var fontScale = tileSet.getFontScale();
    var scale = cellSize * fontScale;
    var ascent = tileSet.getFontAscent() ;

    if(typingCursor) {
      fromX = this.editor.tools.drawTools.typing.cursor.x;
      fromY = this.editor.tools.drawTools.typing.cursor.y;
      toX = fromX + 1;
      toY = fromY + 1;

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;

      var colorIndex = this.editor.currentTile.getColor();
      context.fillStyle = '#' + colorPalette.getHexString(colorIndex);
      
      context.fillRect(dstX, dstY, tileWidth, tileHeight);
      this.lastTypingCursorFromX = fromX;
      this.lastTypingCursorFromY = fromY;
      this.lastTypingCursorToX = toX;
      this.lastTypingCursorToY = toY;


      /*
      var bgColor = '#55aa00';// + colorPalette.getHexString(bgColorIndex);
      context.fillStyle = bgColor;
      context.fillRect(dstX, dstY, tileWidth, tileHeight);
      */
    } else {

      // loop over the area to be drawn..
      for(var y = fromY; y < toY; y++, dstY += tileHeight, cursorY++) {
        if(y >= 0 && y < gridData.length) {
          dstX = (fromX - drawFromGridX) * tileWidth;
          cursorX = 0;
          for(var x = fromX; x < toX; x++, dstX += tileWidth, cursorX++) {
            if(x >= 0 && x < gridData[y].length) {
              colorIndex =  gridData[y][x].fc;
              bgColorIndex = gridData[y][x].bc;
              drawCharacter = true;  
              charIndex = gridData[y][x].t;
              flipV = gridData[y][x].fv;
              flipH = gridData[y][x].fh;
              rotZ = gridData[y][x].rz;

              if(x >= selectionX + selectionOffsetX && x < selectionX + selectionOffsetX + selectionWidth
                && y >= selectionY + selectionOffsetY && y < selectionY + selectionOffsetY + selectionHeight) {
                  var sX = x - selectionOffsetX;
                  var sY = y - selectionOffsetY;

                  if(sY >= 0 && sY < gridData.length && sX >= 0 && sX < gridData[sY].length) {
                    colorIndex =  gridData[sY][sX].fc;
                    bgColorIndex = gridData[sY][sX].bc;
                    drawCharacter = true;  
                    charIndex = gridData[sY][sX].t;
                    flipV = gridData[sY][sX].fv;
                    flipH = gridData[sY][sX].fh;
                    rotZ = gridData[sY][sX].rz;
                  }
              }

              if(shapes) {
                // need to draw shapes?
                if(shapesGrid[y][x].t !== false) {
                  charIndex = shapesGrid[y][x].t;
                  
                  flipH = shapesGrid[y][x].fh;
                  flipV = shapesGrid[y][x].fv;
                  rotZ = shapesGrid[y][x].rz;

                }
                if(shapesGrid[y][x].fc !== false) {
                  colorIndex = shapesGrid[y][x].fc;
                }
              }

              if(cursor) {
                // need to draw cursor?
                charIndex = cursorTiles[cursorY][cursorX];
                colorIndex = this.editor.currentTile.getColor();
                bgColorIndex = this.editor.currentTile.getBGColor();
                flipH = this.editor.currentTile.flipH;
                flipV = this.editor.currentTile.flipV;
                rotZ = this.editor.currentTile.rotZ;
              }

              if(dragPaste) {
                var tile = pasteTiles[cursorY][cursorX];
                charIndex = tile.t;
                colorIndex = tile.fc;
                bgColorIndex = tile.bc;
                flipH = tile.fh;
                flipV = tile.fv;
                rotZ = tile.rz;
              }


              var path = tileSet.getGlyphPath(charIndex);
              if(path != null) {



                if(!fgOnly) {
                  // set the background colour
                  if(bgColorIndex !== -1) {
                    var bgColor = '#' + colorPalette.getHexString(bgColorIndex);
                    context.fillStyle = bgColor;
                    context.fillRect(dstX, dstY, tileWidth, tileHeight);
                  } else {
                    // if drawing the cursor and background is transparent, erase what is behind it
                    if(cursor && bgColor ==  this.editor.colorPaletteManager.noColor) {
                      context.clearRect(dstX, dstY, tileWidth, tileHeight);
                    }
                  }
                }

                context.fillStyle = '#' + colorPalette.getHexString(colorIndex);//'#000000';    //  
                context.strokeStyle = context.fillStyle;// '#' + colorPalette.getHexString(colorIndex);

                if(!bgOnly) {

                  context.setTransform(scale,0,0,-scale, dstX, dstY + ascent * scale);

                  // do flip after rotate
                  if(hasTileFlip && flipH) {
                    context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
                    context.scale(-1,1);
                    context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
                  }
      
                  if(hasTileFlip && flipV) {
                    context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
                    context.scale(1,-1);
                    context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
                  } 

                  if(hasTileRotate && rotZ != 0) {
                    context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );
                    context.rotate(rotZ * 90 * Math.PI / 180);            
                    context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
                  }

                  context.fill(path);
                  context.setTransform(1,0,0,1,0,0);
                }              
              }
            }
          }
        }
      }
    }

    //if(!allCells && !cursor && !typingCursor) {
    if(contextSaved) {      
      context.restore();
    }

    /*
    if(typingCursor) {
      fromX = this.editor.tools.drawTools.typing.cursor.x;
      fromY = this.editor.tools.drawTools.typing.cursor.y;
      toX = fromX + 1;
      toY = fromY + 1;

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;

      context.fillStyle = '#11aa22';
      context.fillRect(dstX, dstY, tileWidth, tileHeight);
      this.lastTypingCursorFromX = fromX;
      this.lastTypingCursorFromY = fromY;
      this.lastTypingCursorToX = toX;
      this.lastTypingCursorToY = toY;

    }

    */
    if(cursor) {
      //console.log(scale);
      //scale = 1 / scale;

      dstX = (fromX - drawFromGridX) * tileWidth;
      dstY = (fromY - drawFromGridY) * tileHeight;
      this.editor.gridView2d.drawCursorBox(context, 
        dstX, 
        dstY, 
        (toX - fromX) * (tileWidth), 
        (toY - fromY) * (tileHeight), 
        5);
       
      
      /*
      context.setTransform(scale,0,0,-scale, this.lastCursorFromX,  this.lastCursorFromY + ascent * scale);

      this.editor.gridView2d.drawCursorBox(context, 
        0, 
        0, 
        (this.lastCursorToX - this.lastCursorFromX), 
        (this.lastCursorToY - this.lastCursorFromY), 
        3);
      context.setTransform(1,0,0,1,0,0);
      */
    }

    // everything has been drawn if not drawing cursor/drag paste area..
    // so invalidate updated cell ranges
    
    if(!eraseCursor && !cursor && !eraseDragPaste && !dragPaste && !typingCursor && !eraseTypingCursor) {

      if(!bgOnly) {
        this.updatedCellRanges.minX = this.doc.gridWidth;
        this.updatedCellRanges.maxX = 0;

        this.updatedCellRanges.minY = this.doc.gridHeight;
        this.updatedCellRanges.maxY = 0;
      }
    }

    
    return {
      offsetX: offsetX,
      offsetY: offsetY
    };


  },
  /*
    draw always draws the smaller of the view area and changed cells..
    redraw with allCells draws whole grid.
    call invalidate all cells when doing an operation that will modify all cells
    call redraw with allCells = true when have time to redraw everything..
  */

    // draw all cells means draw all visible cells...
    // if something wants the whole frame redrawn, it should call invalidate all cells
    // if drawing a shape, want to redraw all visible cells? should really be confined to the size of the shape..

  draw: function(args) {
      
     
    var canvas = args.canvas;
    var context = canvas.getContext('2d');

    var allCells = false;
    if(typeof args.allCells != 'undefined') {
      allCells = args.allCells;
    }

    var drawBackground = this.editor.layers.isBackgroundVisible();
    if(typeof args.drawBackground != 'undefined') {
      drawBackground = args.drawBackground;
    }

    var draw = 'grid';
    if(typeof args.draw != 'undefined') {
      draw = args.draw;
    }

    var shapes = false;
    if(typeof args.shapes != 'undefined') {
      shapes = args.shapes;
    }
    if(shapes) {
      allCells = true;
    }


    var screenMode = this.getMode();
    if(screenMode == TextModeEditor.Mode.VECTOR) {
      return this.drawVector(args);
    }


    var frameIndex = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frameIndex = args.frame;    
//      console.log('frame index = ' + frameIndex);  
    }

//    var hasTileOrientation = this.editor.graphic.hasTileOrientation();

    var hasTileFlip = this.getHasTileFlip(); // this.editor.graphic.getHasTileFlip();
    var hasTileRotate = this.getHasTileRotate(); //this.editor.graphic.getHasTileRotate();
    
    if(frameIndex >= this.frames.length) {
      // invalid frame index..
      return;
    }

    
    var frame = this.frames[frameIndex];

    var tileSet = this.getTileSet();
    var colorPalette = this.getColorPalette();

    this.tileData = tileSet.getData();

    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();


    // is block mode enabled
    var blockMode = this.getBlockModeEnabled();
    var blockSet = null;
    if(blockMode) {
      blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    }

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();

    // initialise bounds to entire area
    var fromX = 0;
    var fromY = 0;
    var toX = gridWidth;
    var toY = gridHeight;      

    // has this draw only updated cells visible in the view and there are still cells outside the view needing updating?
    var onlyViewBoundsUpdatedLayer = false;

    if(allCells === false) {

      // set it so only the cells in the view will be drawn
      fromX = this.viewMinX;

      fromY = this.viewMinY;
      toX = this.viewMaxX;
      toY = this.viewMaxY;

      if(draw != 'shapes' && draw != 'prevgrid') {
        // set update to only draw the updated cells, this is the default..
        fromX = this.updatedCellRanges.minX;
        toX = this.updatedCellRanges.maxX;

        fromY = this.updatedCellRanges.minY;
        toY = this.updatedCellRanges.maxY;
      } 

      // find if the update area is greater than the area being displayed..
      if(fromX < this.viewMinX) {
        fromX = this.viewMinX;

      }

      if(fromY < this.viewMinY) {
        fromY = this.viewMinY;
      }

      if(toX > this.viewMaxX) {
        toX = this.viewMaxX;
      }

      if(toY > this.viewMaxY) {
        toY = this.viewMaxY;
      }

    }


    // values have been passed in, so use these..
    if(typeof args.fromX != 'undefined') {

      fromX = args.fromX;
      
    }

    if(typeof args.fromY != 'undefined') {
      fromY = args.fromY;
    }

    if(typeof args.toX != 'undefined') {
      toX = args.toX;
    }

    if(typeof args.toY != 'undefined') {
      toY = args.toY;
    }

    if(draw != 'prevgrid') {
      // is the area we're going to draw smaller than the area that needs updating?
      onlyViewBoundsUpdatedLayer = fromX > this.updatedCellRanges.minX 
                                  || fromY > this.updatedCellRanges.minY 
                                  || toX < this.updatedCellRanges.maxX 
                                  || toY < this.updatedCellRanges.maxY;
    }



    if(fromX >= toX || fromY >= toY) {
      // invalid bounds

      // bounds could be invalid because updatedcellranges has been set to fromX = max and toX = 0, as nothing needs to be updated
      //console.log("INVALID BOUNDS!!!" + fromX + ',' + fromY + ',' + toX + ',' + toY);
      return;
    }

    // make sure within grid
    if(fromX < 0) {
      fromX = 0;
    }

    if(toX >= gridWidth) {
      toX = gridWidth;
    }

    if(toY >= gridHeight) {
      toY = gridHeight;
    }
    if(toY < 0) {
      toY = 0;
    }


    // workout the bounds in pixels.
    var fromPixelX = fromX * tileWidth;
    var fromPixelY = fromY * tileHeight;
    var toPixelX = toX * tileWidth;
    var toPixelY = toY * tileHeight;

    var pixelWidth = toPixelX - fromPixelX;
    var pixelHeight = toPixelY - fromPixelY;

    // determine whether to draw shapes    
    var shapesGrid = this.editor.tools.drawTools.shapes.getGrid();
    // if in draw shape mode, draw

    var isSprite = this.editor.graphic.getType() == 'sprite';

    // get colours for c64 multicolor mode
    var colors = [];
    if(this.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {

      var backgroundColor = this.getBackgroundColor(frameIndex);
      var cellColor = this.editor.currentTile.color;
      var multi1 = this.getC64Multi1Color(frameIndex);
      var multi2 = this.getC64Multi2Color(frameIndex);

      colors = [];
      if(this.editor.graphic.getType() == 'sprite') {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(cellColor));
        colors.push(colorPalette.getColor(multi2));

      } else {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(multi2));
        colors.push(colorPalette.getColor(cellColor));
      }
    }


    /*
00xxxxxx gives the background color specified in 53281/$D021
01xxxxxx gives the background color specified in 53282/$D022
10xxxxxx gives the background color specified in 53283/$D023
11xxxxxx gives the background color specified in 53284/$D024
    */
    // get the ecm colours
    var ecmColors = [];
    if(this.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      ecmColors[0] = this.getC64ECMColor(0);
      ecmColors[1] = this.getC64ECMColor(1);
      ecmColors[2] = this.getC64ECMColor(2);
      ecmColors[3] = this.getC64ECMColor(3);
    }


    // colour per block, tile, cell
    var colorPerMode = this.getColorPerMode();

    // the data about the grid's cells
    var gridData = this.frames[frameIndex].data;

    var bgColor = this.getBackgroundColor(frameIndex);

    if(!drawBackground) {
      bgColor = this.editor.colorPaletteManager.noColor;
    }

    if(this.getScreenMode() == TextModeEditor.Mode.NES) {
      // bg colour is the 0 colour of any palette
      bgColor = this.editor.colorPaletteManager.colorSubPalettes.getPaletteColor(0, 0);

    }


    var transparentColorIndex = this.getTransparentColorIndex();
    // clear the area we're about to draw tiles onto, by drawing background colour, transparent 
    // and background image if it has one..
    // if nothing has changed in this area, maybe dont need to?
    

    // is there an area that doesn't need redrawing??
    if(draw != 'selection' && draw != 'prevgrid' && this.drawnBounds.toX > this.drawnBounds.fromX 
        && this.drawnBounds.toY > this.drawnBounds.fromY

    ) {
      if(bgColor != this.editor.colorPaletteManager.noColor) {
        context.fillStyle= '#' + colorPalette.getHexString(bgColor);      
      }

      var drawnFromX = this.drawnBounds.fromX * tileWidth;
      var drawnToX = this.drawnBounds.toX * tileWidth;
      var drawnFromY = this.drawnBounds.fromY * tileHeight;
      var drawnToY = this.drawnBounds.toY * tileHeight;

      // is there anything to the left of drawnBounds that should be erased?
      if(fromPixelX < drawnFromX) {
        var drawWidth = drawnFromX - fromPixelX;
        if(toPixelX < drawnFromX) {
          drawWidth = toPixelX - fromPixelX;
        }
        

        if(bgColor !== this.editor.colorPaletteManager.noColor && draw != 'selection' && draw != 'shapes') {
          // background colour is not transparent, and not drawing selection or shapes
          // so fill with background colour
          context.fillRect(fromPixelX, fromPixelY, drawWidth, pixelHeight);
        } else {
          context.clearRect(fromPixelX, fromPixelY, drawWidth, pixelHeight);
        }
        if(this.refImageCanvas && draw != 'selection' && draw != 'shapes') {
          context.drawImage(this.refImageCanvas, 
            fromPixelX, fromPixelY, drawWidth, pixelHeight,
            fromPixelX, fromPixelY, drawWidth, pixelHeight
            );
        }
      }

      // is there anything to the right that should be erased?
      if(toPixelX > drawnToX) {
        var drawFromPixelX = drawnToX;
        var drawWidth = toPixelX - drawFromPixelX;

        if(bgColor !== this.editor.colorPaletteManager.noColor && draw != 'selection' && draw != 'shapes') {
          // background colour is not transparent, and not drawing selection or shapes
          // so fill with background colour
          context.fillRect(drawFromPixelX, fromPixelY, drawWidth, pixelHeight);
        } else {
          context.clearRect(drawFromPixelX, fromPixelY, drawWidth, pixelHeight);
        }
        if(this.refImageCanvas && draw != 'selection' && draw != 'shapes') {
          context.drawImage(this.refImageCanvas, 
            drawFromPixelX, fromPixelY, drawWidth, pixelHeight,
            drawFromPixelX, fromPixelY, drawWidth, pixelHeight
            );
        }
  
      }

      // is there anything above that should be erased?
      if(fromPixelY < drawnFromY) {
        var drawHeight = drawnFromY - fromPixelY;
        if(toPixelY < drawnFromY) {
          drawHeight = toPixelY - fromPixelY;
        }
        if(bgColor !== this.editor.colorPaletteManager.noColor && draw != 'selection' && draw != 'shapes') {
          // background colour is not transparent, and not drawing selection or shapes
          // so fill with background colour
          context.fillRect(fromPixelX, fromPixelY, pixelWidth, drawHeight);
        } else {
          context.clearRect(fromPixelX, fromPixelY, pixelWidth, drawHeight);
        }

        if(this.refImageCanvas && draw != 'selection' && draw != 'shapes') {
          context.drawImage(this.refImageCanvas, 
            fromPixelX, fromPixelY, pixelWidth, drawHeight,
            fromPixelX, fromPixelY, pixelWidth, drawHeight
            );
        }

      }

      if(toPixelY > drawnToY) {
        var drawFromPixelY = drawnToY;
        var drawHeight = toPixelY - drawFromPixelY;

        if(bgColor !== this.editor.colorPaletteManager.noColor && draw != 'selection' && draw != 'shapes') {
          // background colour is not transparent, and not drawing selection or shapes
          // so fill with background colour
          context.fillRect(fromPixelX, drawFromPixelY, pixelWidth, drawHeight);
        } else {
          context.clearRect(fromPixelX, drawFromPixelY, pixelWidth, drawHeight);
        }
        if(this.refImageCanvas && draw != 'selection' && draw != 'shapes') {
          context.drawImage(this.refImageCanvas, 
            fromPixelX, drawFromPixelY, pixelWidth, drawHeight,
            fromPixelX, drawFromPixelY, pixelWidth, drawHeight
            );
        }

      }

    } else {
      if(bgColor !== this.editor.colorPaletteManager.noColor && draw != 'selection' && draw != 'shapes') {
        // background colour is not transparent, and not drawing selection or shapes
        // so fill with background colour
        context.fillStyle= '#' + colorPalette.getHexString(bgColor);      
        context.fillRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);
      } else {
        context.clearRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);
      }


      if(this.refImageCanvas && draw != 'selection' && draw != 'shapes') {
        context.drawImage(this.refImageCanvas, 
          fromPixelX, fromPixelY, pixelWidth, pixelHeight,
          fromPixelX, fromPixelY, pixelWidth, pixelHeight
        );
      }
    } 



    // now image data is ready to draw on..
    var imageData = context.getImageData(fromPixelX, fromPixelY, pixelWidth, pixelHeight);  
    var imageDataWidth = imageData.width;

    var blankCharacter = this.blankTileId;
    var screenMode = this.getMode();
    var dontDrawSelected = this.isCurrentLayer() && this.editor.tools.drawTools.select.isActive() && !this.editor.tools.drawTools.select.isInPasteMove();

    // loop over the area to be drawn..
    for(var y = fromY; y < toY; y++) {
      for(var x = fromX; x < toX; x++) {
//    reverseY    var gridY = gridHeight - 1 - y;
        if(x < this.drawnBounds.fromX 
          || x >= this.drawnBounds.toX 
          || y < this.drawnBounds.fromY 
          || y >= this.drawnBounds.toY
          || draw == 'selection'
          || draw == 'prevgrid') {

          var drawCharacter = false;
          var flipH = false;
          var flipV = false;
          var rotZ = 0;

          switch(draw) {

            case 'selection':

              // selection layer
              var select = this.editor.tools.drawTools.select;
              var selection = select.getSelection();

              var selectionOffsetX = select.selectionOffsetX;
              var selectionOffsetY = select.selectionOffsetY;

              drawCharacter = false;
              charIndex = blankCharacter;
              bgColorIndex = this.editor.colorPaletteManager.noColor;

              if(x >= selection.minX + selectionOffsetX && x < selection.maxX + selectionOffsetX) {
                if(y >= selection.minY + selectionOffsetY && y < selection.maxY + selectionOffsetY) {
                  if(y - selectionOffsetY >= 0 && y - selectionOffsetY < gridData.length
                    && x - selectionOffsetX >= 0 && x - selectionOffsetX < gridData[y - selectionOffsetY].length) {


                    var selectionY = y - selectionOffsetY;
                    var selectionX = x - selectionOffsetX;
                    if(blockMode) {

                      // draw blocks not characters
                      var blockIndex = gridData[selectionY][selectionX].b;

                      colorIndex =  gridData[selectionY][selectionX].fc;
                      bgColorIndex = gridData[selectionY][selectionX].bc;

                      if(blockIndex !== 'undefined') {

                        var blockXOffset = this.getXOffsetInBlock(selectionX);
                        var blockYOffset = this.getYOffsetInBlock(y);//selectionY);//gridY);  

                        charIndex =  blockSet.getCharacterInBlock(blockIndex, blockXOffset, blockYOffset);
                        drawCharacter = true;

                        if(charIndex === false) {
                          charIndex = blankCharacter;
                        }

                        if(colorPerMode == 'block') {
                          // get the block colours
                          colorIndex = blockSet.getBlockColor(blockIndex);
                          bgColorIndex = blockSet.getBlockBGColor(blockIndex);

                        }
                      } else {
                        charIndex = blankCharacter;
                        drawCharacter = true;

                      }
                    } else {
                      drawCharacter = true;
                      charIndex = gridData[y - selectionOffsetY][x - selectionOffsetX].t;
                      colorIndex = gridData[y - selectionOffsetY][x - selectionOffsetX].fc;
                      bgColorIndex = gridData[y - selectionOffsetY][x - selectionOffsetX].bc;
                      flipH = gridData[y - selectionOffsetY][x - selectionOffsetX].fh;
                      flipV = gridData[y - selectionOffsetY][x - selectionOffsetX].fv;
                      rotZ = gridData[y - selectionOffsetY][x - selectionOffsetX].rz;
                    }
                  }
                }

              }            
              break;
            case 'shapes':

              drawCharacter = true;
              charIndex = shapesGrid[y][x].t;

              if(charIndex === false) {
                drawCharacter = false;
                charIndex = blankCharacter;              
              }

              colorIndex =  shapesGrid[y][x].fc;
              bgColorIndex = shapesGrid[y][x].bc;

              flipH = shapesGrid[y][x].fh;
              flipV = shapesGrid[y][x].fv;
              rotZ = shapesGrid[y][x].rz;
              

              if(colorIndex === false) {
                drawCharacter = false;
              }
              break;


            default:
              // not drawing selection or shapes, just want to draw grid tiles

              colorIndex =  gridData[y][x].fc;
              bgColorIndex = gridData[y][x].bc;

              // get the index of the tile to draw.
              if(blockMode) {

                // draw blocks not characters,
                // so find the block, then find the tile index in the block
                var blockIndex = gridData[y][x].b;

                if(blockIndex !== 'undefined') {

                  var blockXOffset = this.getXOffsetInBlock(x);
                  var blockYOffset = this.getYOffsetInBlock(y);//gridY);

                  charIndex =  blockSet.getCharacterInBlock(blockIndex, blockXOffset, blockYOffset);
                  drawCharacter = true;

                  if(charIndex === false) {
                    charIndex = blankCharacter;
                  }

                  if(colorPerMode == 'block') {
                    // get the block colours
                    colorIndex = blockSet.getBlockColor(blockIndex);
                    bgColorIndex = blockSet.getBlockBGColor(blockIndex);

                  }
                } else {
                  charIndex = blankCharacter;
                  drawCharacter = true;
                }
              } else {
                drawCharacter = true;

                charIndex = gridData[y][x].t;
              }

              if(colorPerMode == 'character') {
                if(charIndex !== false) {
                  colorIndex = tileSet.getTileColor(charIndex);
                  bgColorIndex = tileSet.getCharacterBGColor(charIndex);
                }
              }

              flipV = gridData[y][x].fv;
              flipH = gridData[y][x].fh;
              rotZ = gridData[y][x].rz;


              // dont draw characters in selection
              if(dontDrawSelected && this.editor.tools.drawTools.select.inSelection(x, y, 0)) {
                drawCharacter = false;

                charIndex = blankCharacter;
                bgColorIndex = this.editor.colorPaletteManager.noColor;            
              }
              break;
          }

          
          if(this.getMode() == TextModeEditor.Mode.C64MULTICOLOR) {
            // no cell background color in multicolor mode
            bgColorIndex = this.editor.colorPaletteManager.noColor;
          }

          if(this.getMode() == TextModeEditor.Mode.C64ECM) {
            if(bgColorIndex !== this.editor.colorPaletteManager.noColor) {
              if(bgColorIndex < ecmColors.length) {
                bgColorIndex = ecmColors[bgColorIndex];
              }
            }
          }
          
          var bgColorR = false;
          var bgColorG = false;
          var bgColorB = false;

          // are we still sure we want to draw it?
          if(drawCharacter) {
            var screenMode = this.getMode();
            // work out the colour, if in multicolour mode and not a sprite
            if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
              if(this.editor.graphic.getType() !== 'sprite') {
                if(colorIndex < 8) {
                  screenMode = TextModeEditor.Mode.TEXTMODE;
                } else {
                  colorIndex -= 8;
                }
              }
            }

            // TODO: need to optimise this somehow...
            var color = colorPalette.getHex(colorIndex);
            var colorR = (color >> 16) & 255;
            var colorG = (color >> 8) & 255;
            var colorB =  color & 255;


            // colorindex holds the nespalette index if in nes mode
            var nesPaletteIndex = colorIndex;
            if(nesPaletteIndex >=4 ) {
              nesPaletteIndex = 0;
            }


            if(bgColorIndex !== -1) {
              var bgColor = colorPalette.getHex(bgColorIndex);
              bgColorR = (bgColor >> 16) & 255;
              bgColorG = (bgColor >> 8) & 255;
              bgColorB =  bgColor & 255;
            }

            var charX = charIndex % 32;
            var charY = Math.floor(charIndex / 32);

            if(charIndex !== false && charIndex < this.tileData.length) {


              if(this.getScreenMode() == TextModeEditor.Mode.C64ECM) {

                if(charIndex >= 64 || bgColorIndex === this.editor.colorPaletteManager.noColor || bgColorIndex === false) {
                  var ecmColor = Math.floor(charIndex / 64) % 4;
                  bgColorIndex = ecmColors[ecmColor];
                  var bgColor = colorPalette.getHex(bgColorIndex);
                  bgColorR = (bgColor >> 16) & 255;
                  bgColorG = (bgColor >> 8) & 255;
                  bgColorB =  bgColor & 255;
                }
                var ecmGroup = Math.floor(charIndex / 256);
                charIndex = (charIndex % 64) + ecmGroup * 256 ;
              }

              // the data for this tile..
              var tileData = this.tileData[charIndex];

              for(var j = 0; j < tileHeight; j++) {
                for(var i = 0; i < tileWidth; i++) {

                  var srcX = i;
                  var srcY = j;

                  if(hasTileFlip) {

                    if(flipH) {
                      srcX = (tileWidth - srcX - 1);
                    }

                    if(flipV) {
                      srcY = (tileHeight - srcY - 1);
                    }
                  }

                  if(hasTileRotate) {
                    if(rotZ != 0 && tileWidth === tileHeight) {
                      var tempX = srcX;
                      var tempY = srcY;
                      if(rotZ === 1) {
                        srcY = (tileWidth - tempX - 1);
                        srcX = tempY;
                      } 
                      if(rotZ === 2) {
                        srcX = (tileWidth - tempX - 1);
                        srcY = (tileHeight - tempY - 1);
                      }

                      if(rotZ === 3) {
                        srcY = tempX;
                        srcX = (tileHeight - tempY - 1); 
                      }
                    }
                  }


                  var srcPos = srcX + srcY * tileWidth;
                  var colorIndex = tileData[srcPos];

                  var dstPos = ( ((x * tileWidth) - fromPixelX) + i 
                    + (  ((y * tileHeight) - fromPixelY) + j) * imageDataWidth) * 4;


                  if(screenMode === TextModeEditor.Mode.TEXTMODE 
                    || screenMode === TextModeEditor.Mode.C64ECM
                    || screenMode === TextModeEditor.Mode.C64STANDARD) { 

                    if(colorIndex > 0) {

                      imageData.data[dstPos] = colorR; 
                      imageData.data[dstPos + 1] = colorG;
                      imageData.data[dstPos + 2] = colorB;
                      imageData.data[dstPos + 3] = 255;

                    } else if(bgColorIndex !== -1) {
                      imageData.data[dstPos] = bgColorR;
                      imageData.data[dstPos + 1] = bgColorG;
                      imageData.data[dstPos + 2] = bgColorB;
                      imageData.data[dstPos + 3] = 255;
                    }
                  } else if(screenMode == TextModeEditor.Mode.INDEXED) {
                    if(colorIndex === transparentColorIndex) {
                      imageData.data[dstPos] = 0;
                      imageData.data[dstPos + 1] = 0;
                      imageData.data[dstPos + 2] = 0;
                      imageData.data[dstPos + 3] = 0;

                    } else {
                    
                      // TODO: speed this up
                      var color = colorPalette.getHex(colorIndex);  
                      colorR = (color >> 16) & 255;
                      colorG = (color >> 8) & 255;
                      colorB = color & 255;
                      imageData.data[dstPos] = colorR;
                      imageData.data[dstPos + 1] = colorG;
                      imageData.data[dstPos + 2] = colorB;
                      imageData.data[dstPos + 3] = 255;
                    }
                  } else if(screenMode == TextModeEditor.Mode.RGB) {
                    colorR = (colorIndex >>> 16) & 255;
                    colorG = (colorIndex >>> 8) & 255;
                    colorB = colorIndex & 255;
                    colorA = (colorIndex >>> 24) & 255;

                    imageData.data[dstPos] = colorR;
                    imageData.data[dstPos + 1] = colorG;
                    imageData.data[dstPos + 2] = colorB;
                    imageData.data[dstPos + 3] = colorA;

                  } else if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {


                    var value = 0;

                    // upper bit
                    if(colorIndex > 0) {
                      value += 2;
                    }

                    colorIndex = tileData[srcPos + 1];

                    // lower bit
                    if(colorIndex > 0) {
                      value += 1;
                    }

                    // TODO: do this without multiplications
                    var color = colors[value];
                    if(value == 0 && tileSet.backgroundIsTransparent) {
                      // background..
  //                      imageData.data[dstPos] = colorR; 
  //                      imageData.data[dstPos + 1] = colorG;
  //                     imageData.data[dstPos + 2] = colorB;

  //                    imageData.data[dstPos + 3] = 0;
  //                    imageData.data[dstPos + 7] = 0;                    

                    } else if( (!isSprite && value == 3) || (isSprite && value == 2)) {
                      imageData.data[dstPos] = colorR; 
                      imageData.data[dstPos + 1] = colorG;
                      imageData.data[dstPos + 2] = colorB;
                      imageData.data[dstPos + 3] = 255;

                      imageData.data[dstPos + 4] = colorR;
                      imageData.data[dstPos + 5] = colorG;
                      imageData.data[dstPos + 6] = colorB;
                      imageData.data[dstPos + 7] = 255;
                    } else {
                      imageData.data[dstPos] = color.r * 255; 
                      imageData.data[dstPos + 1] = color.g * 255;
                      imageData.data[dstPos + 2] = color.b * 255;
                      imageData.data[dstPos + 3] = 255;

                      imageData.data[dstPos + 4] = color.r * 255; 
                      imageData.data[dstPos + 5] = color.g * 255;
                      imageData.data[dstPos + 6] = color.b * 255;
                      imageData.data[dstPos + 7] = 255;
                    }

                    // need to skip next pixel cos c64 multicolor
                    i++;
                  } else if(screenMode == TextModeEditor.Mode.NES) {

                    if(colorIndex >= 4) {
                      colorIndex = 1;
                    }

                    if(colorIndex == 0) {

                    } else {

                      var paletteColorIndex = this.editor.colorPaletteManager.colorSubPalettes.getPaletteColor(nesPaletteIndex, colorIndex);

                      var color = colorPalette.getHex(paletteColorIndex);

                      imageData.data[dstPos] = (color >> 16) & 255;  
                      imageData.data[dstPos + 1] = (color >> 8) & 255;
                      imageData.data[dstPos + 2] = color & 255;
                      imageData.data[dstPos + 3] = 255;
                    }

                  }

                }
              }
            }
            
          }
        }          
      }
    }

    if(this.getMode() !== TextModeEditor.Mode.VECTOR) {
      context.putImageData(imageData, fromPixelX, fromPixelY);
    }


    if(this.isCurrentLayer() && this.editor.tools.drawTools.pixelSelect.isActive() && draw == 'grid') {


      // erase the selected pixels
      var selection = this.editor.tools.drawTools.pixelSelect.getSelection();

      var layerWidth = this.getWidth();
      var layerHeight = this.getHeight();

      var minX = selection.minX;
      var minY = selection.minY;
      var maxX = selection.maxX;
      var maxY = selection.maxY;

      var pixelWidth = maxX - minX;
      var pixelHeight = maxY - minY;
      var fromPixelX = minX;
// reverseY      var fromPixelY = this.getHeight() - maxY;
      var fromPixelY = minY;

      if(bgColor !== this.editor.colorPaletteManager.noColor) {
        context.fillStyle= '#' + colorPalette.getHexString(bgColor);      
        context.fillRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);
      } else {
        context.clearRect(fromPixelX, fromPixelY, pixelWidth, pixelHeight);
      }
    }

    

    if(draw == 'grid') {
      // not drawing selection or shapes
      if(!onlyViewBoundsUpdatedLayer) {

        // everything has been drawn..
        // so invalidate updated cell ranges

        this.updatedCellRanges.minX = this.doc.gridWidth;
        this.updatedCellRanges.maxX = 0;

        this.updatedCellRanges.minY = this.doc.gridHeight;
        this.updatedCellRanges.maxY = 0;

        this.drawnBounds.fromX = 0;
        this.drawnBounds.toX = 0;
        this.drawnBounds.fromY = 0;
        this.drawnBounds.toY = 0;        

      } else {
          // have only drawn visible cells, need to still mark cells as needing update.
          // save what we have drawn tho, so don't draw next time

          this.editor.graphic.setOnlyViewBoundsDrawn(true);

        // record what just got drawn
          this.drawnBounds.fromX = fromX;
          this.drawnBounds.toX = toX;
          this.drawnBounds.fromY = fromY;
          this.drawnBounds.toY = toY;        

      }
    }

  },  

}