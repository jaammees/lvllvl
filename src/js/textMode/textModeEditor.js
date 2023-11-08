function deprecated(message) {
  //console.error(message);
}

var TextModeEditor = function() {

  this.graphic = null;

  this.tileSetManager = null;
  this.colorPaletteManager = null;
  this.blockSetManager = null;

  this.importImage = null;
  this.importC64Formats = null;
  this.importC64SpriteFormats = null;
  this.importSpriteImage = null;
  this.importAssembly = null;

  this.tools = null;
  this.doc  = null;

  this.type = '2d';
  this.mode = 'draw';

  this.tileEditor = null;
  this.tileEditorMobile = null;


  this.blockEditor = null;

  this.textModeFile = null;

  this.info = null;
  this.colorPalettePanel = null;
  this.colorEditor = null;

  this.chooseColorsDialog = null;
  this.chooseCharactersDialog = null;
  this.toPrg = null;
  this.toPrgAdvanced = null;
  this.export3dGifDialog = null;

  this.exportImageDialog = null;

  this.exportGifDialog = null;
  this.exportSvgDialog = null;
  this.exportGifMobileDialog = null;

  this.gridDimensionsDialog = null;

  this.cursorTileTransparent = false;

  this.exportFrameImage = null;

  this.exportPngDialog = null;
  this.exportSpritePngDialog = null;

  this.checkerboardPattern = null;
  this.exportPngMobileDialog = null;
  this.exportJson = null;
  this.exportTxt = null;
  this.exportBinaryData = null;
  this.exportSpriteBinaryData = null;
  this.exportC64Assembly = null;
  this.exportMega65Assembly = null;
  this.exportX16Basic = null;
  this.exportX16Basic = null;
  this.exportC64SpriteAssembly = null;
  this.exportSEQ = null;
  this.exportPetsciiC = null;
  this.exportVox = null;
  this.exportObj = null;

  this.info = null;

  this.backgroundImage = null;

  this.importShaderEditor = null;


  this.replaceColorDialog = null;
  this.replaceCharacterDialog = null;


  this.referenceImageDialog = null;
  this.referenceImageDialogMobile = null;

  this.editColorPaletteDialog = null;
  this.colorPaletteEdit = null;


  this.tilePaletteEditor = null;

  this.frames = null;

  this.shiftDown = false;
  this.altDown = false;
  this.ctrlDown = false;
  this.cmdDown = false;

  this.screenMode = TextModeEditor.Mode.TEXTMODE;

  this.invertY = true;

  this.mobileMenu = null;

  this.lastSelectAnimate = 0;


  this.gridVisible = true;

  this.grid3d = null;

  this.screenModeDialog = null;
  // c64multicolor
  // 00 = background (d021)
  // 01 = d022
  // 10 = d023
  // 11 = color ram color



  this.editorMode = 'tile';
  this.histories = {};
  this.openingDoc = false;
}

TextModeEditor.Mode = {};
TextModeEditor.Mode.TEXTMODE = 'textmode';
TextModeEditor.Mode.C64STANDARD = 'c64standard';
TextModeEditor.Mode.C64MULTICOLOR = 'c64multicolor';
TextModeEditor.Mode.C64ECM = 'c64ecm';
TextModeEditor.Mode.NES = 'nes';
TextModeEditor.Mode.INDEXED = 'indexed';
TextModeEditor.Mode.RGB = 'rgb';
TextModeEditor.Mode.VECTOR = 'vector';

TextModeEditor.prototype = {


  getThumbnailCanvas: function() {
//    return this.grid.grid2d.getThumbnailCanvas();
    return this.graphic.getThumbnailCanvas();
  },


  setAlterKeys: function(event) {
    this.shiftDown = event.shiftKey;
    this.ctrlDown = event.ctrlKey;
    this.altDown = event.altKey;
    this.cmdDown = event.metaKey;        
  },


  initEvents: function() {


  },

  saveSettings: function(settingsMap) {
    if(this.doc === null) {
      return;
    }

    var settings = {};

    settings.currentTile = this.currentTile.getCharacters();
    settings.fgColor = this.currentTile.getColor();
    settings.bgColor = this.currentTile.getBGColor();

    var cameraPosition = this.gridView2d.getCameraPosition();
    settings.cameraX = cameraPosition.x;
    settings.cameraY = cameraPosition.y;
    settings.scale = this.gridView2d.getScale();
    settings.currentFrame = this.graphic.getCurrentFrame();
    settingsMap[this.doc.id] = settings;

  },

  restoreSettings: function(settingsMap) {
    var tiles = false;
    var fgColor = false;
    var bgColor = false;

    if(typeof this.doc.data != 'undefined' && typeof this.doc.data.settings != 'undefined') {
      var settings = this.doc.data.settings;

      if(typeof settings.currentFgColor != 'undefined') {
        fgColor = settings.currentFgColor;
      }

      if(typeof settings.currentBgColor != 'undefined') {
        bgColor = settings.currentBgColor;
      }
    }

    if(this.type != '3d') {
      if(typeof settingsMap == 'undefined' || !settingsMap.hasOwnProperty(this.doc.id)) {
        this.gridView2d.fitOnScreen({});
        return;
      }
    }


    var settings = settingsMap[this.doc.id];

    if(typeof settings == 'undefined' || !settings ) {
      return;
    }

    if(typeof settings.currentTile  != 'undefined') {
      this.currentTile.setCharacters(settings.currentTile);
    }

    if(fgColor !== false) {
      this.currentTile.setColor(fgColor);
    } else {
      if(typeof settings.fgColor != 'undefined') {
        this.currentTile.setColor( settings.fgColor );
      }
    }

    if(bgColor !== false) {
      this.currentTile.setBGColor( bgColor );
    } else {
      if(typeof settings.bgColor != 'undefined') {
        this.currentTile.setBGColor( settings.bgColor );
      }
    }


    if(this.type != '3d') {

      var cameraX = false;
      var cameraY = false;
      var scale = false;
      var currentFrame = false;

      if(typeof settings.cameraX != 'undefined') {
        cameraX = settings.cameraX;
      }

      if(typeof settings.cameraY != 'undefined') {
        cameraY = settings.cameraY;
      }

      if(typeof settings.scale != 'undefined') {
        scale = settings.scale;
      }

      if(cameraX !== false && cameraY !== false) {
        this.gridView2d.setCameraPosition(cameraX, cameraY);
      }

      if(scale !== false) {
        this.gridView2d.setScale(scale);
      }
    }

    var currentFrame = false;
    if(typeof settings.currentFrame != 'undefined') {
      currentFrame = settings.currentFrame;
    }

    if(currentFrame !== false) {
      this.frames.gotoFrame(currentFrame);
    }
  },


  preload: function() {
    // preload some stuff so starting is quicker
    this.preloadImage = new Image();
    this.preloadImage.onload = function() {
      
    }
    this.preloadImage.src = 'charsets/petscii.png';

    this.preloadImage2 = new Image();
    this.preloadImage2.onload = function() {
      
    }
    this.preloadImage2.src = 'palettes/c64_colodore.png';

  },

  loadPreferences: function() {

    var cursorTransparent = g_app.getPref("textmode.cursortiletransparent");
    if(typeof cursorTransparent != 'undefined' && cursorTransparent != null) {
      this.setCursorTileTransparent(parseInt(cursorTransparent, 10) == 1);
    }
  },

  init: function() {
    var _this = this;

    
    this.colorPaletteManager = new ColorPaletteManager();
    this.colorPaletteManager.init(this);

    this.preload();

    UI.on('ready', function() {

      _this.initEvents();

      _this.graphic = new Graphic();
      _this.graphic.init(_this);

      _this.checkerboardPattern = new CheckerboardPattern();
      
      _this.exportFrameImage = new ExportFrameImage();
      _this.exportFrameImage.init(_this);

      // need to init character set manager before grid
      _this.tileSetManager = new TileSetManager();
      _this.tileSetManager.init(_this);

      _this.blockSetManager = new BlockSetManager();
      _this.blockSetManager.init(_this);


      _this.grid = new Grid();
      _this.grid.init(_this);

      _this.grid3d = new Grid3d();
      _this.grid3d.init(_this);

      if(UI.exists('gridView3d')) {
        _this.gridView3d = new GridView3d();
        _this.gridView3d.init(_this, UI('gridView3d'), { "view": "3d" });
        UI('gridView3d').resize();

        _this.gridViewFront = new GridView3d();
        _this.gridViewFront.init(_this, UI('gridViewFrontWebGL'), { "view": "front" });
        UI('gridViewFrontWebGL').resize();

        _this.gridViewTop = new GridView3d();
        _this.gridViewTop.init(_this, UI('gridViewTopWebGL'), { "view": "top" });
        UI('gridViewTopWebGL').resize();
      }

      _this.gridView2d = new GridView2d();
      _this.gridView2d.init(_this, UI('gridView2d'));

      _this.layers = new Layers();
      _this.layers.init(_this);
      _this.layers.buildInterface(UI('layersPanel'));

      // need a current character set and color palette to do this..
      _this.frames = new Frames();
      _this.frames.init(_this);
      _this.frames.buildInterface(UI('framesPanel'));
      _this.frames.buildMobileInterface(UI('framesMobilePanel'));

        _this.importImage = new ImportImage();
        _this.importImage.init(_this);

        _this.importAssembly = new ImportAssembly();
        _this.importAssembly.init(_this);

        _this.importC64Formats = new ImportC64Formats();
        _this.importC64Formats.init(_this);

        _this.importC64SpriteFormats = new ImportC64SpriteFormats();
        _this.importC64SpriteFormats.init(_this);

        _this.chooseColorsDialog = new ChooseColorsDialog();
        _this.chooseColorsDialog.init(_this);

        _this.chooseCharactersDialog = new ChooseCharactersDialog();
        _this.chooseCharactersDialog.init(_this);

        _this.backgroundImage = new BackgroundImage();
        _this.backgroundImage.init(_this);
        
        _this.toPrg = new ToPRG();
        _this.toPrg.init(_this);

        _this.toPrgAdv = new ToPRGAdv();
        _this.toPrgAdv.init(_this);

        _this.exportC64 = new ExportC64Dialog();
        _this.exportC64.init(_this);

        _this.textModeFile = new TextModeFile();
        _this.textModeFile.init(_this);
    });
  },


  modified: function() {
    if(g_app.openingProject) {
      return;
    }
    g_app.doc.recordModified(this.doc, this.path);
  },


  createDoc: function(args, callback) {
    var doc = g_app.doc;

    var parentPath = '/screens';
    if(typeof args.parentPath != 'undefined') {
      parentPath = args.parentPath;  
    }

    var name = args.name;
    // defaults
    var colorPalette = args.colorPalette;
    //var tileSet = args.tileSet;

    var gridWidth = args.gridWidth;
    var gridHeight = args.gridHeight;

    var cellWidth = 8;
    var cellHeight = 8;

    if(typeof args.cellWidth != 'undefined') {
      cellWidth = args.cellWidth;
    }

    if(typeof args.cellHeight != 'undefined') {
      cellHeight = args.cellHeight;
    }


    var screenMode = TextModeEditor.Mode.TEXTMODE;
    if(typeof args.screenMode != 'undefined') {
      screenMode = args.screenMode;
    }

    if(screenMode == 'monochrome') {
      screenMode = TextModeEditor.Mode.TEXTMODE;
    }

    var _this = this;

    var tileSetArgs = {};
    if(typeof args.tileSetArgs != 'undefined') {
      tileSetArgs = args.tileSetArgs;
    } else if(typeof args.tileSetPresetId != 'undefined') {
      tileSetArgs.preset = args.tileSetPresetId;
    }

    if(typeof args.tileSet != 'undefined' && args.tileSet != null) {
      tileSetArgs.preset = false;
      tileSetArgs.tileSet = args.tileSet
    }

    tileSetArgs.tileSetName = 'Tile Set';
    if(typeof args.tileSetName != 'undefined') {
      tileSetArgs.tileSetName = args.tileSetName;
    }


    if(typeof args.tileSetId != 'undefined' && args.tileSetId != '') {
      // specific tile set chosen
      tileSetArgs.tileSetId = args.tileSetId;

    }

    var colorPaletteArgs = {};
    colorPaletteArgs.preset = args.colorPalettePresetId;
    if(typeof args.colorPaletteId != 'undefined' && args.colorPaletteId != '') {
      colorPaletteArgs.colorPaletteId = args.colorPaletteId;
    }
    colorPaletteArgs.colorPalette = args.colorPalette;

    colorPaletteArgs.colorPaletteName = 'Colour Palette';
    if(typeof args.colorPaletteName != 'undefined') {
      colorPaletteArgs.colorPaletteName = args.colorPaletteName;
    }

    

    this.colorPaletteManager.addColorPaletteToDoc(colorPaletteArgs, function(colorPaletteId) {
      _this.tileSetManager.addTileSetToDoc(tileSetArgs, function(tileSetId) {
        var tileSet = _this.tileSetManager.getTileSet(tileSetId);////g_app.doc.getDocRecordById(tileSetId, '/tile sets');

        if(parentPath == '/screens') {
          // make sure the tileset has a tile in it.
          
          if(tileSet && tileSet.getTileCount() == 0) {
            // create a new tile..
            tileSet.setTileCount(1);
          }
        }

        // get the cell width/height here..
        cellWidth = tileSet.getTileWidth();
        cellHeight = tileSet.getTileHeight();

        var defaultBackgroundColor = 6;
        var defaultBorderColor = 14;

        var layerData = {
          label: "Layer 0",
          visible: true,
          opacity: 1,         
          layerId: g_app.getGuid(), 
          screenMode: screenMode,
          colorPerMode: "cell",
          compositeOperation: "source-over",
          blockMode: false,
          cellWidth: cellWidth,
          cellHeight: cellHeight,
          colorPaletteId: colorPaletteId,
          tileSetId: tileSetId,
          type: "grid",
          gridWidth: gridWidth,
          gridHeight: gridHeight,
          frames: []// [{ data: null, bgColor: defaultBackgroundColor, borderColor: defaultBorderColor }]
        };

        if(typeof args.canFlipTile != 'undefined') {
          layerData.hasTileFlip = args.canFlipTile;
        }

        if(typeof args.canRotateTile != 'undefined') {
          layerData.hasTileRotate = args.canRotateTile;
        }

        var id = g_app.getGuid();

        var graphicWidth = gridWidth * cellWidth;
        var graphicHeight = gridHeight * cellHeight;
    
        var graphicData = {
          id: id,
          width: graphicWidth,
          height: graphicHeight,
          frames: [],// { duration: 12 } ],
          layers: [layerData],
        }

        var record = doc.createDocRecord(parentPath, name, 'graphic', graphicData, id);
        if(typeof callback !== 'undefined') {
          callback(record);
        }

      });
    });
  },


  // setup/restorehistory
  setupHistory: function() {

    var id = this.doc.id;

    // setup/restore the history
    if(this.histories.hasOwnProperty(id)) {
      this.history = this.histories[id];
    } else {
      this.history = new History();
      this.history.init(this);
      this.histories[id] = this.history;
    }
  },

  open3d: function(path, settings) {

    var tilePaletteDisplay = this.tools.drawTools.tilePalette.tilePaletteDisplay;
    var drawTilePaletteEnabledSave = false;
    if(tilePaletteDisplay) {
      // disable draw so its not repeatedly called
      drawTilePaletteEnabledSave = tilePaletteDisplay.getDrawEnabled();
      tilePaletteDisplay.setDrawEnabled(false);
    }



    var colorPaletteDisplay = this.colorPalettePanel.colorPaletteDisplay;
    var drawColorPaletteEnabledSave = false;

    if(colorPaletteDisplay) {
      drawColorPaletteEnabledSave = colorPaletteDisplay.getDrawEnabled();
      colorPaletteDisplay.setDrawEnabled(false);
    }



    this.path = path;
    this.doc = g_app.doc.getDocRecord(path);

    this.grid3d.connectToDoc();
    this.tools.drawTools.setDrawTool('pen');

    this.restoreSettings(settings);

    var currentTiles = this.currentTile.getTiles();
    if(currentTiles === false || currentTiles.length === 0) {
      this.currentTile.setCharacters([[0]]);
    }

//    var currentColor = this.currentTile.getColor();
    this.setupHistory();


    if(tilePaletteDisplay) {
      // reenable draw tile palette and draw all the tiles
      tilePaletteDisplay.setDrawEnabled(drawTilePaletteEnabledSave);
      this.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(colorPaletteDisplay) {
      colorPaletteDisplay.setDrawEnabled(drawColorPaletteEnabledSave);
      colorPaletteDisplay.draw();
    }


  },


  // called when screen is clicked on from project navigator..
  loadScreen: function(screen, settings) {

    var tilePaletteDisplay = this.tools.drawTools.tilePalette.tilePaletteDisplay;
    var sideTilePaletteDisplay = this.sideTilePalette.tilePaletteDisplay;

    // want to disable drawing while loading, so save current state and set to disabled.
    var drawTilePaletteEnabledSave = false;
    if(tilePaletteDisplay) {
      drawTilePaletteEnabledSave = tilePaletteDisplay.getDrawEnabled();
      tilePaletteDisplay.setDrawEnabled(false);
    }

    var drawSideTilePaletteEnabledSave = false;
    if(sideTilePaletteDisplay) {
      drawSideTilePaletteEnabledSave = sideTilePaletteDisplay.getDrawEnabled();
      sideTilePaletteDisplay.setDrawEnabled(false);
    }


    // save current state of draw colour palette and then disable drawing it
    var colorPaletteDisplay = this.colorPalettePanel.colorPaletteDisplay;
    var drawColorPaletteEnabledSave = false;
    if(colorPaletteDisplay) {
      drawColorPaletteEnabledSave = colorPaletteDisplay.getDrawEnabled();
      colorPaletteDisplay.setDrawEnabled(false);
    }

  
    try {

      // should check if already loaded...
      if(this.path === screen) {
        // already loaded
//        return;
      }

      // this is used from open
      this.path = screen;

      var isSprite = this.path.indexOf('/sprites/') === 0;
      this.doc = g_app.doc.getDocRecord(this.path);

      if(this.doc == null) {
        alert("couldn't open");
        return;
      }


      

      this.setupHistory();

      // go through all the layers, find the largest width/height and set to the default
      var defaultGridWidth = 0;
      var defaultGridHeight = 0;

      var defaultCellWidth = 0;
      var defaultCellHeight = 0;

      var graphicWidth = 0;
      var graphicHeight = 0;

      for(var i = 0; i < this.doc.data.layers.length; i++) {
        var layer = this.doc.data.layers[i];
        var layerWidth = layer.cellWidth * layer.gridWidth;
        var layerHeight = layer.cellHeight * layer.gridHeight;

        if(layer.gridWidth > defaultGridWidth) {
          defaultGridWidth = layer.gridWidth;
        }

        if(layer.gridHeight > defaultGridHeight) {
          defaultGridHeight = layer.gridHeight;
        }


        if(layer.cellWidth > defaultCellWidth) {
          defaultCellWidth = layer.cellWidth;
        }

        if(layer.cellHeight > defaultCellHeight) {
          defaultCellHeight = layer.cellHeight;
        }

        if(layerWidth > graphicWidth) {
          graphicWidth = layerWidth;
        }

        if(layerHeight > graphicHeight) {
          graphicHeight = layerHeight;
        }
      }

      if(typeof this.doc.data.width == 'undefined') {
        this.doc.data.width = graphicWidth;
        this.doc.data.height = graphicHeight;
      }

      // new layers are created with these grid dimensions
      this.graphic.gridWidth = defaultGridWidth;
      this.graphic.gridHeight = defaultGridHeight;

      this.graphic.cellWidth = defaultCellWidth;
      this.graphic.cellHeight = defaultCellHeight;


      if(isSprite) {
        this.setEditorMode('pixel');
        this.graphic.type = 'sprite';
        this.setLayoutType('sprite');
      } else {
        this.setEditorMode('tile');
        this.graphic.type = 'screen';
        this.setLayoutType('textmode');
      }


      var drawEnabledSave = this.graphic.getDrawEnabled();
      this.graphic.setDrawEnabled(false);

      var character = false;
      var fgColor = false;
      var bgColor = false;


      if(typeof this.doc.data != 'undefined' && typeof this.doc.data.settings != 'undefined') {
        var settings = this.doc.data.settings;

        if(typeof settings.currentTile != 'undefined') {
          character = settings.currentTile;
        }

        if(typeof settings.currentFgColor != 'undefined') {
          fgColor = settings.currentFgColor;
        }
  
        if(typeof settings.currentBgColor != 'undefined') {
          bgColor = settings.currentBgColor;
        }
      }


      var currentFrame = 0;

      this.graphic.connectToDoc();

      if(typeof settings != 'undefined' && typeof settings[this.doc.id] != 'undefined') {
        if(typeof settings[this.doc.id].currentFrame != 'undefined') {
          currentFrame = settings[this.doc.id].currentFrame;
        }
      }

      // make sure has at least one frame and go to frame last viewed
      if(this.graphic.getFrameCount() == 0) {
        this.graphic.setFrameCount(1);
        currentFrame = 0;
      }
      this.graphic.setCurrentFrame(currentFrame);

      // select a layer
      var layerId = this.layers.getLayerId(0);
      this.layers.selectLayer(layerId);

      if(this.editorMode == 'pixel') {
        this.tools.pixelDrawTools.setDrawTool('pen');
      } else {
        this.tools.drawTools.setDrawTool('pen');
      }

      this.colorPaletteManager.colorPaletteUpdated();
      
      if(fgColor === false) {
        fgColor = 0;
        var layer = this.layers.getSelectedLayerObject();
        if(layer && typeof layer.getColorPalette != 'undefined') {
          var colorPalette = layer.getColorPalette();
          if(colorPalette) {
            if(colorPalette.getColorCount() == 16) {
              fgColor = 14;
            }
          }
        }

        if(layer && typeof layer.getBackgroundColor != 'undefined') {
          if(fgColor == 0 && layer.getBackgroundColor() == 0) {
            fgColor = 1;
          }
        }
      }
 
      if(fgColor !== false) {        
        this.currentTile.setColor( fgColor );
      }

      if(bgColor === false) {
        bgColor = this.colorPaletteManager.noColor;
      }
      this.currentTile.setBGColor( bgColor );


      // need to set character after setting colours
      // otherwise if colour per tile, the tile colour will be set..
      character = 0;
      if(character !== false) {

        this.currentTile.setTiles([[ this.tileSetManager.noTile]]);
        this.setSelectedTiles([[character]]);

      }

      this.frames.frameTimeline.resize();
      this.frames.updateFrameInfo();



      this.graphic.setDrawEnabled(drawEnabledSave);

      if(this.type != '3d') {
        this.graphic.invalidateAllCells();
        this.gridView2d.previousScreenFrame = false;

        this.gridView2d.findViewBounds();
        
        this.graphic.redraw({ allCells: true });
        this.restoreSettings(settings);

        this.graphic.setDrawEnabled(false);
        this.updateBlockModeInterface();
      }

      this.graphic.setDrawEnabled(drawEnabledSave);
      
      
      this.tools.drawTools.tilePalette.resize();
      this.sideTilePalette.resize();


      this.setupMenu();

    } catch(err) {
      console.log(err.message);
      console.log(err);
    }

    // reenable draw tile palette and draw all the tiles
    if(tilePaletteDisplay) {
      tilePaletteDisplay.setDrawEnabled(drawTilePaletteEnabledSave);
      this.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(sideTilePaletteDisplay) {
      sideTilePaletteDisplay.setDrawEnabled(drawSideTilePaletteEnabledSave);
      this.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(this.tools.drawTools.blockPalette) {
      this.tools.drawTools.blockPalette.drawBlockPalette();
    }

    if(this.sideBlockPalette) {
      this.sideBlockPalette.drawBlockPalette();
    }    

    if(colorPaletteDisplay) {
      colorPaletteDisplay.setDrawEnabled(drawColorPaletteEnabledSave);
      colorPaletteDisplay.draw();
    }

  },

  startNew: function(args, callback) {

    alert('start new');
    // stop animation if playing...
    this.frames.stop();

    // clear all frames
    this.frames.clear();

    // reset color palette
    this.colorPaletteManager.reset();


    var width = 40;
    var depth = 25;
    var height = 1;

    if(typeof args.width !== 'undefined') {
      width = args.width;
    }

    if(typeof args.height !== 'undefined') {
      height = args.height;
    }

    if(typeof args.depth !== 'undefined') {
      depth = args.depth;
    }

    var colorPalette = 'c64_colodore';
    var tileSet = 'petscii';

    if(typeof args.colorPalette != 'undefined') {
      colorPalette = args.colorPalette;
    }

    if(typeof args.tileSet != 'undefined') {
      tileSet = args.tileSet;
    }



    this.colorPaletteManager.reset();
    this.colorPaletteManager.userPresetColorPalette(colorPalette);

    this.tileSetManager.reset();
    this.tileSetManager.userPresetTileSet(tileSet, function() {
      this.frames.setFrameCount(1);
      this.frames.setCurrentFrame(0);
      this.frames.setDimensions(width, height, depth);

      if(callback) {
        callback();
      }
    });

  },


  setSelectedTiles: function(tiles) {
    var drawTools = this.tools.drawTools;
    if(drawTools.tilePalette) {

      drawTools.tilePalette.selectedGridChanged(tiles);        
      drawTools.tilePalette.drawTilePalette();
      
      this.sideTilePalette.selectedGridChanged(tiles);
      this.sideTilePalette.drawTilePalette();
    }
    this.currentTile.setCharacters(tiles);

  },


  redrawTilePalettes: function() {
    var drawTools = this.tools.drawTools;
    if(drawTools.tilePalette) {
      drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
      this.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }

  },



  load: function(data) {
    this.textModeFile.load(data);
  },

  getSaveData: function() {
    return this.textModeFile.getSaveData();
  },

  getBlockModeEnabled: function() {

    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {

      return false;
    }
    return layer.getBlockModeEnabled();
    //    return this.frames.getBlockModeEnabled();
  },

  updateBlockModeInterface: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    if(layer.getBlockModeEnabled()) {
      $('#infoTableBlock').show();
      UI('mode-blockmode').setChecked(true);
      UI('mode-blocksize').setEnabled(true);
      UI('colorpermode-cell').setEnabled(false);
      UI('colorpermode-block').setEnabled(true);
    } else {
      $('#infoTableBlock').hide();
      UI('mode-blockmode').setChecked(false);
      UI('mode-blocksize').setEnabled(false);
      UI('colorpermode-cell').setEnabled(true);
      UI('colorpermode-block').setEnabled(false);
    }

    var colorMode = layer.getColorPerMode();

    UI('colorpermode-cell').setChecked(false);
    UI('colorpermode-character').setChecked(false);
    UI('colorpermode-block').setChecked(false);

    this.setInterfaceColorPerMode(colorMode);
  },

  updateInterfaceTileOrientation: function() {
    UI('mode-tileflip').setChecked(this.getHasTileFlip());
    UI('mode-tilerotate').setChecked(this.getHasTileRotate());
    this.currentTile.setOrientationToolsVisibility();
  },

  updateInterfaceTileMaterials: function() {
    UI('mode-tilematerials').setChecked(this.getHasTileMaterials());
    this.currentTile.setMaterialsVisibility();
  },


  getHasTileFlip: function() {
    return this.graphic.getHasTileFlip();
  },

  setHasTileFlip: function(hasTileFlip) {
    this.graphic.setHasTileFlip(hasTileFlip);
    this.updateInterfaceTileOrientation();
    this.currentTile.refresh();
    this.graphic.redraw({ allCells: true});


    var layer = this.layers.getSelectedLayerObject();
    this.layers.updateLayerLabel(layer.getId());

  },


  getHasTileRotate: function() {
    return this.graphic.getHasTileRotate();
  },

  setHasTileRotate: function(hasTileRotate) {
    this.graphic.setHasTileRotate(hasTileRotate);
    this.updateInterfaceTileOrientation();
    this.currentTile.refresh();
    this.graphic.redraw({ allCells: true});

    var layer = this.layers.getSelectedLayerObject();
    this.layers.updateLayerLabel(layer.getId());

  },

  getHasTileMaterials: function() {
    return this.graphic.getHasTileMaterials();
  },

  setHasTileMaterials: function(hasTileMaterials) {
    this.graphic.setHasTileMaterials(hasTileMaterials);
    this.updateInterfaceTileMaterials();

  },

  setBlockModeEnabled: function(enabled) {

    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      alert('please choose a grid layer');
      return;
    }

    if(enabled) {
      var _this = this;
      this.blockSetManager.showBlockSizeDialog(function(width, height, colorMode) {

        _this.blockSetManager.checkBlockMode(width, height);
        
        layer.setBlockModeEnabled(enabled);
        layer.setBlockDimensions(width, height);
        layer.setColorPerMode(colorMode);
        _this.graphic.redraw({ allCells: true });

        _this.updateBlockModeInterface();

        _this.setInterfaceColorPerMode(colorMode);

        _this.layers.updateLayerLabel(layer.getId());      
        _this.startBlockTool();  
      });
    } else {
      layer.setBlockModeEnabled(enabled);
      this.graphic.redraw({ allCells: true });

      this.updateBlockModeInterface();

      if(layer.getColorPerMode() == 'block') {
        layer.setColorPerMode('cell');
        UI('colorpermode-cell').setChecked(true);
        UI('colorpermode-block').setChecked(false);
      }
      this.layers.updateLayerLabel(layer.getId());
      this.startBlockTool();

    }
  },

  showDimensionsDialog: function() {
    if(this.gridDimensionsDialog == null) {
      this.gridDimensionsDialog = new GridDimensionsDialog();
      this.gridDimensionsDialog.init(this);
    }

    this.gridDimensionsDialog.showDimensions();
  },

  cropToSelection: function() {
    
    this.tools.drawTools.select.cropToSelection();
  },

  showBlockSizeDialog: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      alert('please choose a grid layer');
      return;
    }

    var _this = this;
    this.blockSetManager.showBlockSizeDialog(function(width, height, colorMode) {
      _this.blockSetManager.checkBlockMode(width, height);
      
      layer.setBlockModeEnabled(true);
      layer.setBlockDimensions(width, height);
      layer.setColorPerMode(colorMode);
      _this.graphic.redraw({ allCells: true });

    });
  },


  setColorPerMode: function(colorPerMode) {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      alert('please choose a grid layer');
      return;
    }

    layer.setColorPerMode(colorPerMode);
    this.setInterfaceColorPerMode(colorPerMode);
    this.graphic.redraw({ allCells: true });
  },

  getColorPerMode: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.getColorPerMode != 'undefined') {
      return layer.getColorPerMode();
    }

    return 'cell';
  },

  getScreenMode: function() {
//    deprecated('getScreenMode');
    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.getScreenMode != 'undefined') {
      return layer.getMode();
    }

    return TextModeEditor.Mode.TEXTMODE;
  },



  getGridVisible: function() {
    if(this.type == '3d') {
      return this.grid3d.getGridVisible();
    } else {
      return this.gridVisible;
    }
  },

  setGridVisible: function(visible) {
    if(this.type == '3d') {
      this.grid3d.setGridVisible(visible);
    } else {
      this.gridVisible = visible;
      UI('edit-showgrid').setChecked(visible);      
    }
  },

  // hacky??
  syncColorPickers: function() {
    var color = this.currentTile.getColor();
    this.currentTile.setColor(color, { update: false });

//    var bgColor = this.graphic.getBackgroundColor();
//    this.setBackgroundColor(bgColor, false);

//    var borderColor = this.graphic.getBorderColor();
//    this.setBorderColor(borderColor, false);

    this.updateBackgroundColorPicker();
    this.updateBorderColorPicker();

    this.updateC64MultiColorPickers();

    this.colorsUpdated();
//    this.editor.frames.colorsUpdated();
  },

  updateCurrentColorToSpriteColor: function() {
  // in sprite mode, need to update the current colour

    if(this.graphic.getType() == 'sprite') {
      var layer = this.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {
        var cellData = layer.getCell({ x: 0, y: 0});
        if(cellData) {
          this.currentTile.setColor(cellData.fc);
        }
      }

    }

  },

  updateC64MultiColorPickers: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer) {
      return;
    }

    if(typeof layer.getColorPalette == 'undefined') {
      return;
    }

    var colorPalette = layer.getColorPalette();
    if(!colorPalette) {
      return;
    }

    if(typeof layer.getC64Multi1Color != 'undefined') {
      var color = layer.getC64Multi1Color();
      var colorHexString = colorPalette.getHexString(color);

      $('.c64Multi1Color').css('background-color', '#' + colorPalette.getHexString(color));
      $('.c64Multi1ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));
    }


    if(typeof layer.getC64Multi2Color != 'undefined') {
      var color = layer.getC64Multi2Color();
      var colorHexString = colorPalette.getHexString(color);

      $('.c64Multi2Color').css('background-color', '#' + colorPalette.getHexString(color));
      $('.c64Multi2ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));
    }

  },


  tilesUpdated: function() {
    if(this.doc) {
      this.doc.data.settings = {
        "currentTile": this.currentTile.getCharacters(),
        "currentFgColor": this.currentTile.getColor(),
        "currentBgColor": this.currentTile.getBGColor()
      };
    }

  },

  // update where the colours are used
  colorsUpdated: function() {
    
    this.tileSetManager.redrawCharacters();

    if(this.type != '3d') {
      this.graphic.invalidateAllCells();
      this.graphic.redraw({ allCells: true });
    }
    

    if(typeof this.tools.drawTools.blockPalette && this.blockEditor) {
      if(this.blockEditor.visible) {
        this.blockEditor.draw();
      }
    }
    this.layers.updateAllLayerPreviews();

    if(this.doc) {
      this.doc.data.settings = {
        "currentTile": this.currentTile.getCharacters(),
        "currentFgColor": this.currentTile.getColor(),
        "currentBgColor": this.currentTile.getBGColor()
      };
    }

  },

  updateBackgroundColorPicker: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || typeof layer.getBorderColor == 'undefined') {
      return;
    }

    var color = layer.getBackgroundColor();
    var colorPalette = layer.getColorPalette();
    if(!colorPalette) {
      return;
    }

    if(color == this.colorPaletteManager.noColor) {
      $('.backgroundColorMobile').css('background-color', 'transparent');

      $('.backgroundColor').css('background-color', 'transparent');
      $('#backgroundColor').css('background-image', "url('images/transparent.png')");
      $('#backgroundColorMobile').css('background-image', "url('images/transparent.png')");

      $('.backgroundColorDisplay').css('background-color', '#000000');
      //$('.backgroundColorDisplay').html('<i style="font-size: 28px; margin-top: -1px" class="halflings halflings-remove"></i>');  
      $('.backgroundColorDisplay').html('<i style="color: #cccccc; font-size: 16px; margin-top: -1px" class="halflings halflings-remove"></i>') ;
    } else {

      var colorHexString = colorPalette.getHexString(color);
      $('.backgroundColorMobile').html('');      
      $('.backgroundColorMobile').css('background-color', '#' + colorHexString);

      $('.backgroundColor').html('');      
      $('.backgroundColor').css('background-color', '#' + colorHexString);
      $('#backgroundColor').css('background-image', "none");
      $('#backgroundColorMobile').css('background-image', "none");

      $('.backgroundColorDisplay').html('');      
      $('.backgroundColorDisplay').css('background-color', '#' + colorHexString);
    }
  },

  getC64ECMColor: function(index) {
    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.getC64ECMColor != 'undefined') {
      return layer.getC64ECMColor(index);
    }
    return 0;

  },

  setC64ECMColor: function(index, color, frame, update) {
    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.setC64ECMColor != 'undefined') {
      
      layer.setC64ECMColor(index, color, frame, update);

      var colorPalette = layer.getColorPalette();
      if(!colorPalette) {
        return;
      }

      this.updateBackgroundColorPicker();

      if(typeof update === 'undefined' || update === true) {
        this.colorsUpdated();
      }      
    }
  },


  setBackgroundColor: function(color, update) {


    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.setBackgroundColor != 'undefined') {
      layer.setBackgroundColor(color);

      var colorPalette = layer.getColorPalette();
      if(!colorPalette) {
        return;
      }

      this.updateBackgroundColorPicker();

      if(typeof update === 'undefined' || update === true) {
        this.colorsUpdated();
      }      
    }
  },

  updateBorderColorPicker: function() {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || typeof layer.getBorderColor == 'undefined') {
      return;
    }

    var color = layer.getBorderColor();
    var colorPalette = layer.getColorPalette();
    if(!colorPalette) {
      return;
    }

    if(color == this.colorPaletteManager.noColor) {
      var colorHexString = colorPalette.getHexString(color);
      $('.borderColor').css('background-color', 'transparent');
      $('.borderColorMobile').css('background-color', 'transparent');         

      $('#borderColor').css('background-image', "url('images/transparent.png')") 
      $('#borderColorMobile').css('background-image', "url('images/transparent.png')") 

    } else {
      var colorHexString = colorPalette.getHexString(color);
      $('.borderColor').css('background-color', '#' + colorHexString);
      $('.borderColorMobile').css('background-color', '#' + colorHexString);          

      $('#borderColor').css('background-image', "none");
      $('#borderColorMobile').css('background-image', "none");
    }

  },

  setBorderColor: function(color, update) {
    var layer = this.layers.getSelectedLayerObject();
    if(layer && typeof layer.setBorderColor != 'undefined') {
      layer.setBorderColor(color);

      var colorPalette = layer.getColorPalette();
      if(!colorPalette) {
        return;
      }

      this.updateBorderColorPicker();

    }
  },  

  setC64Multi1Color: function(color, update) {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    layer.setC64Multi1Color(color);


    this.updateC64MultiColorPickers();

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }

  },

  setC64Multi2Color: function(color, update) {
    var layer = this.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }
    
    layer.setC64Multi2Color(color);



    this.updateC64MultiColorPickers();

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }
  },


  setInterfaceColorPerMode: function(colorPerMode) {
    switch(colorPerMode) {
      case 'cell':
//        this.colorPerMode = 'cell';
        $('#drawTools-cellColorHeading').html('Cell');
      break;
      case 'character':
//        this.colorPerMode = 'character';
        $('#drawTools-cellColorHeading').html('Tile');
      break;
      case 'block':
//        this.colorPerMode = 'block';
        $('#drawTools-cellColorHeading').html(styles.text.blockName);
      break;
    }

    UI('colorpermode-cell').setChecked(false);
    UI('colorpermode-character').setChecked(false);
    UI('colorpermode-block').setChecked(false);

    UI('colorpermode-' + colorPerMode).setChecked(true);

    this.tileSetManager.tileSetUpdated();
    this.syncColorPickers();

    this.colorPaletteManager.colorPaletteUpdated();


  },


  setInterfaceScreenMode: function(screenMode) {
    var _this = this;
    var updateEnabledSave = this.grid.getUpdateEnabled();

    // turn off updates while doing all this..
    this.grid.setUpdateEnabled(false);
 

    switch(screenMode) {
      case TextModeEditor.Mode.TEXTMODE:
      case TextModeEditor.Mode.C64ECM:
      case TextModeEditor.Mode.C64STANDARD:
        this.screenMode = TextModeEditor.Mode.TEXTMODE;
        this.layers.setBackgroundEnabled(true);
        this.currentTile.setBGColor(this.colorPaletteManager.noColor);
        break;
      case TextModeEditor.Mode.C64MULTICOLOR:
        this.screenMode = TextModeEditor.Mode.C64MULTICOLOR;
        // can't have cellbackground color
        this.currentTile.setColor(this.currentTile.getColor(), { force: true });
        this.currentTile.setBGColor(this.colorPaletteManager.noColor);
        this.grid.setBorderEnabled(true);
        break;
      case TextModeEditor.Mode.NES:
        this.screenMode = TextModeEditor.Mode.NES;
        this.currentTile.setBGColor(this.colorPaletteManager.noColor);
        this.colorPaletteManager.colorSubPalettes.selectPalette(0);
        this.grid.setBorderEnabled(false);
        break;
      case TextModeEditor.Mode.INDEXED:
        this.screenMode = TextModeEditor.Mode.INDEXED;
        this.grid.setBorderEnabled(false);
        break;
      case TextModeEditor.Mode.RGB:
        this.screenMode = TextModeEditor.Mode.RGB;
        this.grid.setBorderEnabled(false);
        break;
    }

    if(g_app.isMobile()) {
      if(screenMode === TextModeEditor.Mode.NES) {
        $('#drawToolMobileSubpalette').show();
        $('#drawToolMobileCellColor').hide();
        $('#drawToolMobileFrameColor').hide();
      } else {
        $('#drawToolMobileSubpalette').hide();
        $('#drawToolMobileCellColor').show();
        $('#drawToolMobileFrameColor').show();

      }
    }


    this.currentTile.setScreenMode(screenMode);

    if(this.tools.pixelDrawTools) {
      this.tools.pixelDrawTools.setScreenMode(screenMode);
    }

    if(this.graphic.getType() == 'sprite') {
      UI('mode-spritetextmode').setChecked(false);
      UI('mode-spritec64multicolor').setChecked(false);
      if(UI.exists('mode-spritenes')) {
        UI('mode-spritenes').setChecked(false);
      }

      if(UI.exists('mode-spriteindexed')) {
        UI('mode-spriteindexed').setChecked(false);
      }

      if(UI.exists('mode-spritergb')) {
        UI('mode-spritergb').setChecked(false);
      }
    
      UI('mode-sprite' + screenMode).setChecked(true);

    } else {
      UI('mode-textmode').setChecked(false);
      UI('mode-c64multicolor').setChecked(false);

      if(UI.exists('mode-c64standard')) {
        UI('mode-c64standard').setChecked(false);
      }

      if(UI.exists('mode-c64ecm')) {
        UI('mode-c64ecm').setChecked(false);
      }

      if(UI.exists('mode-vector')) {
        UI('mode-vector').setChecked(false);        
      }
      
      if(UI.exists('mode-nes')) {
        UI('mode-nes').setChecked(false);
      }

      if(UI.exists('mode-indexed')) {
        UI('mode-indexed').setChecked(false);
      }

      if(UI.exists('mode-rgb')) {
        UI('mode-rgb').setChecked(false);
      }
    
      UI('mode-' + screenMode).setChecked(true);
    }

    this.tools.drawTools.setScreenMode(screenMode);
    if(this.tileEditor) {    
      this.tileEditor.setScreenMode(screenMode);
    }
    if(this.tileEditorMobile) {
      this.tileEditorMobile.setScreenMode(screenMode);
    }

    if(this.info) {
      this.info.setScreenMode(screenMode);
    }


    if(screenMode == 'vector') {
      UI('export-svg').setEnabled(true);
    } else {
      UI('export-svg').setEnabled(false);
    }    

    this.tileSetManager.tileSetUpdated();
    this.syncColorPickers();

    this.colorPaletteManager.colorPaletteUpdated();


    this.currentTile.canvasDrawCharacters();

    // turn updates back on
    this.grid.setUpdateEnabled(updateEnabledSave);
    if(this.type != '3d') {
      this.graphic.redraw({ allCells: true });
    }

    if(this.type == '2d') {
      this.layers.updateAllLayerPreviews();
    }

  },

  setScreenMode: function(screenMode) {
    if(screenMode == 'vector') {
      UI('export-svg').setEnabled(true);
    } else {
      UI('export-svg').setEnabled(false);
    }


    var layer = this.layers.getSelectedLayerObject();
    if(!layer) {
//      this.setScreenMode(screenMode);
      return;
    }

    var _this = this;
    layer.setScreenMode(screenMode, function() {
      _this.setInterfaceScreenMode(screenMode);
      _this.layers.updateLayerLabel(layer.getId());
    });
  },


  editC64PRGCode: function() {
    this.toPrgAdv.editCode();
  },


  toggleMobile: function() {
    this.textModeEditorPanel.setPanelVisible('east', true);
    UI('textEditorContent').setPanelVisible('south', true);
    UI('framesMobilePanel').setVisible(false);
    UI('toolsDesktopPanel').setVisible(true);
  },

  getEditorMode: function() {
    return this.editorMode;
  },

  setEditorMode: function(editorMode) {

    this.editorMode = editorMode;

    if(editorMode == 'pixel') {
      this.tools.pixelDrawTools.setDrawTool('pen');
      $('#pixelDrawSettings').show();
    } else {
      this.tools.drawTools.setDrawTool('pen');
      $('#pixelDrawSettings').hide();
    }

    UI('toolsMobileSidePanel').setVisible((this.deviceType == 'mobile') & (this.editorMode != 'pixel'));
    UI('toolsDesktopPanel').setVisible((this.deviceType == 'desktop') & (this.editorMode != 'pixel'));

    UI('pixelToolsMobileSidePanel').setVisible((this.deviceType == 'mobile') & (this.editorMode == 'pixel'));
    UI('pixelToolsDesktopPanel').setVisible((this.deviceType == 'desktop') & (this.editorMode == 'pixel'));

  },




  showReferenceImageDialog: function(args) {

    if(g_app.isMobile()) {
      if(this.referenceImageDialogMobile == null) {
        this.referenceImageDialogMobile = new ReferenceImageDialog();
        this.referenceImageDialogMobile.init(this);
      }

      this.referenceImageDialogMobile.show();
    } else {

      if(this.referenceImageDialog == null) {
        this.referenceImageDialog = new ReferenceImageDialog();
        this.referenceImageDialog.init(this);
      }

      this.referenceImageDialog.show(args);
    }
  },
 
  initGrid3dControls: function() {
    var _this = this;

    $('#gridXYBack').on('click', function() {
      var xyPosition = _this.grid3d.getXYPosition();
      xyPosition -= 1;
      if(xyPosition >= 0) {
        _this.grid3d.setXYPosition(xyPosition);
      }
    });

    $('#gridXYForward').on('click', function() {
      var xyPosition = _this.grid3d.getXYPosition();
      xyPosition += 1;
      if(xyPosition < _this.grid3d.getGridDepth()) {
        _this.grid3d.setXYPosition(xyPosition);
      }
    });

    $('#gridXYPosition').on('change', function() {
      var position = parseInt($(this).val(), 10);
      if(isNaN(position)) {
        return;
      }
      _this.grid3d.setXYPosition(position);
    });

    $('#gridXZDown').on('click', function() {
      var xzPosition = _this.grid3d.getXZPosition();
      xzPosition -= 1;
      if(xzPosition >= 0) {
        _this.grid3d.setXZPosition(xzPosition);
      }
    });

    $('#gridXZUp').on('click', function() {
      var xzPosition = _this.grid3d.getXZPosition();
      xzPosition += 1;
      if(xzPosition < _this.grid3d.getGridHeight()) {
        _this.grid3d.setXZPosition(xzPosition);
      }
    });
    
    $('#gridXZPosition').on('change', function() {
      var position = parseInt($(this).val(), 10);
      if(isNaN(position)) {
        return;
      }
      _this.grid3d.setXZPosition(position);
      
    });

  },



  editImportShader: function() {
    if(this.importShaderEditor == null) {
      this.importShaderEditor = new ImportShaderEditor();
      this.importShaderEditor.init(this);
    }

    this.importShaderEditor.show();
    
  },

  setType: function(type) {
    this.type = type;
    this.currentTile.setType(type);
    if(type == '2d') {
      this.graphic.redraw({ allCells: true });
      this.layers.updateAllLayerPreviews();
    }
  },

  keyDown: function(event) {    
    if(event.keyCode == keys.textMode.play.keyCode && this.tools.drawTools.tool != 'type') {
      // if its space and not typing, then space means play/pause
      this.frames.play();
    }

    this.setAlterKeys(event);
    this.tools.keyDown(event);
    this.frames.keyDown(event);

  },

  keyUp: function(event) {

    this.setAlterKeys(event);

    if(this.colorPaletteEdit && this.colorPaletteEdit.visible) {
      this.colorPaletteEdit.keyUp(event);
      return;
    }

    this.tools.keyUp(event);

  },

  keyPress: function(event) {
    this.setAlterKeys(event);

    if(this.colorPaletteEdit && this.colorPaletteEdit.visible) {
      this.colorPaletteEdit.keyPress(event);
      return;
    }

    this.tools.keyPress(event);

  },


  setupMenu: function() {
    if(this.graphic.getType() == 'sprite') {
      UI('edit-replaceCharacter').setVisible(false);

      // export menu
      UI('export-png').setVisible(true);
      UI('export-prg').setVisible(false);
      UI('export-seq').setVisible(false);
      UI('export-petsciic').setVisible(false);
      UI('export-charpad').setVisible(false);
      UI('export-spritepad').setVisible(true);

      // import menu
      UI('import-image').setVisible(false);
      UI('import-c64formats').setVisible(false);
      UI('import-c64spriteformats').setVisible(true);
      UI('import-spriteimage').setVisible(true);

      // screen menu
      $('.ui-menu-screen').hide();
      $('.ui-menu-sprite').show();
    } else {
      UI('edit-replaceCharacter').setVisible(true);

      // export menu
      UI('export-png').setVisible(false);
      UI('export-prg').setVisible(true);
      UI('export-seq').setVisible(true);
      UI('export-petsciic').setVisible(true);
      UI('export-charpad').setVisible(true);
      UI('export-spritepad').setVisible(false);


      // import menu
      UI('import-image').setVisible(true);
      UI('import-c64formats').setVisible(true);
      UI('import-c64spriteformats').setVisible(false);
      UI('import-spriteimage').setVisible(false);

      // screen menu
      $('.ui-menu-screen').show();
      $('.ui-menu-sprite').hide();
    }

  },

  showMobileMenu: function() {
    if(this.mobileMenu == null) {
      this.mobileMenu = new MobileMenu();
      this.mobileMenu.init(this);
    }

    this.mobileMenu.show();
  },

  showScreenModeDialog: function() {
    var _this = this;
    if(this.screenModeDialog == null) {
      var width = 300;
      var height = 140;

      if(UI.isMobile.any()) {
        height = 240;
      }

      this.screenModeDialog = UI.create("UI.Dialog", { "id": "screenModeDialog", "title": "Screen Mode", "width": width, "height": height });
      this.screenModeHTML = UI.create("UI.HTMLPanel");
      this.screenModeDialog.add(this.screenModeHTML);
      this.screenModeHTML.load('html/textMode/screenModeDialog.html', function() {
        $('#screenModeDialogMode').val(_this.getScreenMode());
        
        $('#screenModeDialogAllowTileFlip').prop('checked', _this.getHasTileFlip());
        $('#screenModeDialogAllowTileRotate').prop('checked', _this.getHasTileRotate());

        _this.getHasTileRotate();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.screenModeDialog.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        var screenMode = $('#screenModeDialogMode').val();
        _this.setScreenMode(screenMode);

        if(screenMode == 'nes') {
          _this.colorPaletteManager.colorSubPalettes.check();
        }

        var tileFlip = $('#screenModeDialogAllowTileFlip').is(':checked');
        _this.setHasTileFlip(tileFlip);

        var tileRotate = $('#screenModeDialogAllowTileRotate').is(':checked');
        _this.setHasTileRotate(tileRotate);

//        _this.editor.textModeEditor.frames.setDimensions(width, height, depth);
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.screenModeDialog.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    }

    UI.showDialog("screenModeDialog");
    $('#screenModeDialogMode').val(this.getScreenMode());


  },

  showTileEditor: function(args) {
    if(g_app.isMobile()) {
      if(this.tileEditorMobile == null) {
        this.tileEditorMobile = new TileEditorMobile();
        this.tileEditorMobile.init(this);
      }

      this.tileEditorMobile.show(args);

    } else {


      this.tileEditor.toggleVisible();      

      if(this.tileEditor.getVisible()) {
        UI('charactersets-edit').setLabel('Hide Tile Editor');
      } else {
        UI('charactersets-edit').setLabel('Show Tile Editor');
      }
    }
  },

  showColorEditor: function() {
    this.colorEditor.setVisible(true);
  },

  toggleColorEditor: function(args) {
    
    this.colorEditor.toggleVisible();
  },

  getCursorTileTransparent: function() {
    return this.cursorTileTransparent;
  },

  setCursorTileTransparent: function(transparent) {
    this.cursorTileTransparent = transparent;
    UI('cursor-tile-transparent').setChecked(transparent);
    g_app.setPref("textmode.cursortiletransparent", transparent ? 1:0);
    if(this.currentTile) {
      this.currentTile.drawCursor();
    }
  },

  toggleCursorTileTransparent: function() {
    this.setCursorTileTransparent(!this.getCursorTileTransparent());
  },


  export3dAsGif: function() {
    if(g_app.isMobile()) {
      if(this.export3dGifMobileDialog == null) {
        this.export3dGifMobileDialog = new Export3dGifMobile();
        this.export3dGifMobileDialog.init(this);
      }

      this.export3dGifMobileDialog.show();
    } else {
      if(this.export3dGifDialog == null) {
        this.export3dGifDialog = new Export3dGif();
        this.export3dGifDialog.init(this);
      }

      this.export3dGifDialog.start();

    }

  },

  exportGif: function() {
    if(g_app.isMobile()) {
      if(this.exportGifMobileDialog == null) {
        this.exportGifMobileDialog = new ExportGifMobile();
        this.exportGifMobileDialog.init(this);
      }

      this.exportGifMobileDialog.show();
    } else {
      if(this.exportGifDialog == null) {
        this.exportGifDialog = new ExportGif();
        this.exportGifDialog.init(this);
      }

      this.exportGifDialog.start();

    }
//            _this.exportGif = new ExportGif();
//        _this.exportGif.init(_this);

  },

  exportImage: function() {
    if(this.exportImageDialog == null) {
      this.exportImageDialog = new ExportImage();
      this.exportImageDialog.init(this);
    }

    this.exportImageDialog.show();
  },

  exportSvg: function() {
    if(g_app.isMobile()) {
      /*
      if(this.exportSvgMobileDialog == null) {
        this.exportSvgMobileDialog = new ExportSvgMobile();
        this.exportSvgMobileDialog.init(this);
      }

      this.exportSvgMobileDialog.show();
      */
    } else {
      if(this.exportSvgDialog == null) {
        this.exportSvgDialog = new ExportSvg();
        this.exportSvgDialog.init(this);
      }

      this.exportSvgDialog.show();

    }

  },

  exportPng: function() {
    if(this.graphic.getType() == 'sprite') {
      if(g_app.isMobile()) {

      } else {
        if(this.exportSpritePngDialog == null) {
          this.exportSpritePngDialog = new ExportSpritePng();
          this.exportSpritePngDialog.init(this);
        }
  
        this.exportSpritePngDialog.show();
        return;
  
      }
    }

    if(g_app.isMobile()) {
      if(this.exportPngMobileDialog == null) {
        this.exportPngMobileDialog = new ExportPngMobile();
        this.exportPngMobileDialog.init(this);
      }

      this.exportPngMobileDialog.show();
    } else {
      if(this.exportPngDialog == null) {
        this.exportPngDialog = new ExportPng();
        this.exportPngDialog.init(this);
      }

      this.exportPngDialog.show();

    }

  },


  copyAsImage: function() {
    if(g_app.isMobile()) {
      if(this.exportPngMobileDialog == null) {
        this.exportPngMobileDialog = new ExportPngMobile();
        this.exportPngMobileDialog.init(this);
      }

      this.exportPngMobileDialog.show();
    } else {

      if(this.exportImageDialog == null) {
        this.exportImageDialog = new ExportImage();
        this.exportImageDialog.init(this);
      }

      var _this = this;
      this.exportImageDialog.createUI(function() {


        var args = {};
        args.frame = _this.graphic.getCurrentFrame();
        args.effects = false;
        args.includeBorder = false;
        args.scale = _this.exportImageDialog.getScale();

        var selection = _this.tools.drawTools.select.getSelection();
        if(_this.tools.drawTools.select.getEnabled() && selection.minX != selection.maxX && selection.minY != selection.maxY) {
          var layer = _this.layers.getSelectedLayerObject();
          if(layer.getType() == 'grid') {
            args.section = true;
            args.fromX = selection.minX * layer.getCellWidth() * args.scale;
            args.width = (selection.maxX - selection.minX) * layer.getCellWidth() * args.scale;
            args.fromY = selection.minY * layer.getCellHeight() * args.scale;
            args.height = (selection.maxY - selection.minY) * layer.getCellHeight() * args.scale;
          }
        } else {
          args.section = true;
          args.fromX = 0;
          args.width = _this.graphic.getGraphicWidth() * args.scale;
          args.fromY = 0;
          args.height = _this.graphic.getGraphicHeight() * args.scale;

        }

        
        _this.exportImageDialog.drawFrame(args);
        _this.exportImageDialog.copyToClipboard(args);
      });

    }

  },


  exportTileset: function() {
    var filename = "Tileset";
    var tileSet = this.tileSetManager.getCurrentTileSet();

    tileSet.exportPng({ filename: filename});

  },

  createBin: function(args) {
    var path = args.source;
    var binType = args.type;
    var pathParts = path.split('/');
    var parentFolder = '';

    while(pathParts.length > 0 && pathParts[0] == '') {
      pathParts.shift();      
    }
    if(pathParts.length == 0) {
      // something went wrong..
      return;
    }
    var record = g_app.doc.getDocRecord(path);

    if(record == null) {
      // uh oh...
      return "error";
    }

    var id = record.id;
    var type = record.type;
    var name = record.name;
    var binName = name;// + '.bin';
    var binPath = 'bin/' + name + '.bin';

    var result = { success: false };

    if(this.exportC64Assembly == null) {
      this.exportC64Assembly = new ExportC64Assembly();
      this.exportC64Assembly.init(this);
    }


    switch(type) {
      case 'tile set':
        result = this.tileSetManager.createBin({
          tileSetId: id,
          name: binName,
          binPath: binPath,
          binType: binType
        });
      break;
      case 'graphic':
        var binData = [];
        var exportType = "charmap";
        if(typeof args.type != 'undefined') {
          exportType = args.type.toLowerCase();
        }
        switch(exportType) {
          case 'blockset':
            binData = this.exportC64Assembly.getBlockSetData({ 'path': path }, 'binary');
            break;
          case 'blockmap':
            binData = this.exportC64Assembly.getBlockMapData({ 'path': path }, 'binary');
            break;
          case 'blockcolor':
          case 'blockcolour':
            binData = this.exportC64Assembly.getBlockColorData({ 'path': path }, 'binary');
            break;
          default:
            binData = this.exportC64Assembly.getCharMapData({ 'path': path }, 'binary');
            break;
        }


        var data = bufferToBase64(binData);

        var type = 'bin';
        var parentPath = '/asm/bin';

        name = binName + ' - ' + exportType + '.bin';
    
        var record = g_app.doc.getDocRecord(parentPath + '/' + name);
        if(record) {
          record.data = data;
        } else {
          var newDocRecord = g_app.doc.createDocRecord(parentPath, name, type, data);
        }
    
        g_app.projectNavigator.reloadTreeBranch('/asm/bin');
        g_app.projectNavigator.treeRoot.refreshChildren();

        result = {
          success: true, 
          path: 'bin/' + name
        };
    

      break;
    }
    return result;


  },

  startImportSpriteImage: function() {
    if(this.importSpriteImage == null) {
      this.importSpriteImage = new ImportSpriteImage();
      this.importSpriteImage.init(this);
    }
    this.importSpriteImage.start();
  },

  doExport: function(type) {
    switch(type) {
      case 'txt':
        if(this.exportTxt == null) {
          this.exportTxt = new ExportTxt();
          this.exportTxt.init(this);
        }

        this.exportTxt.start();
        break;
      case 'json':
        if(this.exportJson == null) {
          this.exportJson = new ExportJson();
          this.exportJson.init(this);
        }

        this.exportJson.start();
      break;
      case 'binary':
        if(this.graphic.getType() == 'sprite') {
          if(this.exportSpriteBinaryData == null) {
            this.exportSpriteBinaryData = new ExportSpriteBinaryData();
            this.exportSpriteBinaryData.init(this);
          }
          this.exportSpriteBinaryData.start();

        } else {
          if(this.exportBinaryData == null) {
            this.exportBinaryData = new ExportBinaryData();
            this.exportBinaryData.init(this);
          }
          this.exportBinaryData.start();
        }
      break;
      case 'petsciic':
        if(this.exportPetsciiC == null) {
          this.exportPetsciiC = new ExportPetsciiC();
          this.exportPetsciiC.init(this);
        }
        this.exportPetsciiC.start();
      break;
      case 'pet':
        if(this.exportPet == null) {
          this.exportPet = new ExportPet();
          this.exportPet.init(this);
        }
        this.exportPet.start();
        break;
      case 'c64assembly':

        if(this.graphic.getType() == 'sprite') {
          if(this.exportC64SpriteAssembly == null) {
            this.exportC64SpriteAssembly = new ExportC64SpriteAssembly();
            this.exportC64SpriteAssembly.init(this);
          }
          this.exportC64SpriteAssembly.start();

        } else {
          if(this.exportC64Assembly == null) {
            this.exportC64Assembly = new ExportC64Assembly();
            this.exportC64Assembly.init(this);
          }
          this.exportC64Assembly.start();
        }
        break;

      case 'mega65assembly':
        if(this.exportMega65Assembly == null) {
          this.exportMega65Assembly = new ExportMega65Assembly();
          this.exportMega65Assembly.init(this);
        }
        this.exportMega65Assembly.start();
        break;

      case 'x16assembly':
        if(this.exportX16Assembly == null) {
          this.exportX16Assembly = new ExportX16Assembly();
          this.exportX16Assembly.init(this);
        }
        this.exportX16Assembly.start();
        break;

        
      case 'charpad':
        if(this.exportCharPad == null) {
          this.exportCharPad = new ExportCharPad();
          this.exportCharPad.init(this);
        }
        this.exportCharPad.start();
        break;


      case 'spritepad':
        if(this.exportSpritePad == null) {
          this.exportSpritePad = new ExportSpritePad();
          this.exportSpritePad.init(this);
        }
        this.exportSpritePad.start();
        break;

      case 'seq':
        if(this.exportSEQ == null) {
          this.exportSEQ = new ExportSEQ();
          this.exportSEQ.init(this);
        }
        this.exportSEQ.start();
        break;

      case 'x16basic':
        if(this.exportX16Basic == null) {
          this.exportX16Basic = new ExportX16Basic();
          this.exportX16Basic.init(this);
        }

        this.exportX16Basic.start();
        break;
      case 'vox':
        if(this.exportVox == null) {
          this.exportVox = new ExportVox();
          this.exportVox.init(this);
        }

        this.exportVox.start();
        break;
      case 'obj':
        if(this.exportObj == null) {
          this.exportObj = new ExportObj();
          this.exportObj.init(this);
        }

        this.exportObj.start();
        break;
    }
  },

  zoom: function(direction) {
    if(this.type == '2d') {
      this.gridView2d.zoom(direction);
    }

    if(this.type == '3d') {
      console.error('need to get active grid view');
      this.gridView3d.zoom(direction);
    }
  },

  fitOnScreen: function(args) {
    if(this.type == '2d') {
      this.gridView2d.fitOnScreen(args);
    }

    if(this.type == '3d') {
      console.error('need to get active grid view');
      this.gridView3d.fitOnScreen();
    }
  },

  actualPixels: function() {
    if(this.type == '2d') {
      this.gridView2d.actualPixels();
    }

    if(this.type == '3d') {
      console.error('need to get active grid view');
      this.gridView3d.actualPixels();
    }
  },

  replaceColor: function() {
    if(this.replaceColorDialog == null) {
      this.replaceColorDialog = new ReplaceColorDialog();
      this.replaceColorDialog.init(this);
    }

    this.replaceColorDialog.show();
  },

  replaceCharacter: function() {
    if(this.replaceCharacterDialog == null) {
      this.replaceCharacterDialog = new ReplaceCharacterDialog();
      this.replaceCharacterDialog.init(this);
    }

    this.replaceCharacterDialog.show();
  },

  clearHiddenTiles: function() {
    if(this.clearHiddenTilesDialog == null) {
      this.clearHiddenTilesDialog = new ClearHiddenTilesDialog();
      this.clearHiddenTilesDialog.init(this);
    }

    this.clearHiddenTilesDialog.show();
  },

  /*
  editColorPalette: function() {
    if(this.editColorPaletteDialog == null) {
      this.editColorPaletteDialog = new EditColorPaletteDialog();
      this.editColorPaletteDialog.init(this);
    }

    this.editColorPaletteDialog.show();
  },
*/

  editTilePalette: function() {
    if(this.tilePaletteEditor == null) {
      this.tilePaletteEditor = new TilePaletteEditor();
      this.tilePaletteEditor.init(this);
    }

    this.tilePaletteEditor.show();
  },
  editColorPalette: function() {
    if(this.colorPaletteEdit  == null) {
      this.colorPaletteEdit = new ColorPaletteEdit();
      this.colorPaletteEdit.init(this);
    }

    this.colorPaletteEdit.show();

  },

  update: function() {
    var time = getTimestamp();


    // animate select marquee
    if(time - this.lastSelectAnimate > 260) {
      this.lastSelectAnimate = time;

      if(this.lastDashOffset == 0) {
        this.lastDashOffset = 5;
      } else {
        this.lastDashOffset = 0;
      }
    }


    if(this.importImage !== null) {
      this.importImage.update();
    }

    if(this.exportGifDialog !== null) {
      if(this.exportGifDialog.update()) {
        return;
      }
    }


    if(this.exportImageDialog !== null) {
      if(this.exportImageDialog.update()) {
        return;
      }
    }

    if(this.export3dGifDialog !== null) {
      if(this.export3dGifDialog.update()) {
        return;
      }
    }

    
    if(this.exportGifMobileDialog !== null && this.exportGifMobileDialog.visible) {
      if(this.exportGifMobileDialog.update()) {
        return;
      }
    }

    if(this.colorPaletteEdit && this.colorPaletteEdit.visible) {
      this.colorPaletteEdit.update();
      return;
    }


    if(this.frames !== null) {
      this.frames.update();
    }

    if(this.animationPreview.getVisible()) {
      this.animationPreview.update();
    }
    

    if(this.importImage.visible !== true) {

      if(this.gridView2d && this.type == '2d') {
        this.gridView2d.render();
      }

      if(g_app.getMode() == '3d') {
        this.grid3d.update();

//        this.gridView3d.render();
      }
    }

    if(this.importC64Formats != null && this.importC64Formats.visible === true) {
      this.importC64Formats.update();
    }

    if(this.importC64SpriteFormats != null && this.importC64SpriteFormats.visible === true) {
      this.importC64SpriteFormats.update();
    }

    /*
    if(this.importC64SpriteFormats != null && this.importC64SpriteFormats.visible === true) {
      this.importC64SpriteFormats.update();
    }
    */
//    console.log('text mode update');
  }
}