var TilePalette = function() {
  this.editor = null;

  this.tilePaletteDisplay = null;
  this.charRecentIndex = 0;

  this.canvas = null;

  this.width = 0;
  this.height = 0;

  // story tile width and height so know when it changes
  this.tileWidth = false;
  this.tileHeight = false;
  this.prefix = '';

  this.blockStacking = 'horizontal';
  this.tileMaterials = null;

  // the tile info is being displayed for
  this.tileInfoTile = false;
}

TilePalette.prototype = {
  init: function(editor, args) {
    if(typeof args != 'undefined') {
      if(typeof args.prefix != 'undefined') {
        this.prefix = args.prefix;
      }

      if(typeof args.blockStacking != 'undefined') {
        this.blockStacking = args.blockStacking;
      }
    }

    this.editor = editor;
  },


  buildInterface: function(parentPanel) {


    var _this = this;

    this.tileMaterials = new TileMaterials();
    this.tileMaterials.init(this.editor, this.prefix);


    var html = '<div class="panelFill" id="' + this.prefix + 'charPalette">';


    html += '<div class="title" style="background-color: #111111; height: 18px; overflow: none; white-space: nowrap">';
    html += '  <div style="position: absolute; font-size: 10px; top: 2px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    html += '  Tiles';
    html += '  </div>';
    html += '  <div style="position: absolute; top: 2px; right: 2px; width: 20px">';
    html += '    <div id="' + this.prefix + 'charPaletteCloseButton" class="ui-button ui-panel-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
    html += '  </div>';
    html += '</div>';

    html += '<div style=" position: absolute; left: 0px; right: 0px; top: 18px; height: 24px; display: flex; align-items: center; background-color: #222222; padding: 0px;">';

    // ----------  highlight tile
    html += '<div style="margin-left: 2px; display: flex; align-items: center">';
    html += '<canvas style="background-color: #222222; border: 1px solid #333333" width="16" height="16" id="' + this.prefix + 'tilepalette-tileinfocanvas"></canvas>';
    html += '<div id="' + this.prefix + 'charpalette-charinfo" style="display: flex; width: 60px; margin-left: 4px;  overflow: hidden; white-space: nowrap; text-overflow: ellipsis">0x32</div>';

    html += '<div class="tile-rotation" id="' + this.prefix + 'charpalette-rotationinfo" style="display: flex; align-items: center;  margin-right: 8px">';
    html += '<div id="' + this.prefix + 'charpalette-rotation" class="tile-rotation-amount" style="width: 30px; text-align: right; margin-right: 10px"></div>';
    html += '<div id="' + this.prefix + 'charpalette-rotatebutton" class="ui-button ui-button-small"  data-label="Tile Rotate" title="Tile Rotate (R)"><img src="icons/svg/glyphicons-basic-493-rotate.svg"></div>';
    html += '</div>';


    html += '<div class="tile-fliph" id="' + this.prefix + 'charpalette-fliphinfo" style="display: flex; align-items: center; margin-right: 8px">';
    html += '<div class="gridinfo-label">Flip&nbsp;H</div>';
    html += '<div id="' + this.prefix + 'charpalette-fliph" class="tile-flipped-x" style="width: 10px; text-align: center"></div>';    
    html += '<div id="' + this.prefix + 'charpalette-fliphbutton" class="ui-button ui-button-small" style="margin-left: 4px" data-label="Tile Flip X" title="Tile Flip X (F)"><img src="icons/svg/glyphicons-basic-747-reflect-y.svg"></div>';
    html += '</div>';


    html += '<div class="tile-flipv" id="' + this.prefix + 'charpalette-flipvinfo" style="display:flex; align-items: center;">';
    html += '<div class="gridinfo-label">Flip&nbsp;V</div>';
    html += '<div id="' + this.prefix + 'charpalette-flipv"  class="tile-flipped-y" style="width: 10px; text-align: center"></div>';
    html += '<div id="' + this.prefix + 'charpalette-flipvbutton" class="ui-button ui-button-small"  style="margin-left: 4px" data-label="Tile Flip Y" title="Tile Flip Y (G)"><img src="icons/svg/glyphicons-basic-748-reflect-x.svg"></div>';
    html += '</div>';



    html += '</div>';

    // -------------------------
    

    html += '</div>';




    if(this.prefix == 'side') {
      html += '<div style="position: absolute; left: 2px; right: 0px; top: 44px; bottom: 56px; overflow: hidden" id="' + this.prefix + 'tilePaletteHolder">';
    } else {
      html += '<div style="position: absolute; left: 2px; right: 0px; top: 44px; bottom: 28px; overflow: hidden" id="' + this.prefix + 'tilePaletteHolder">';
    }
    html += '<canvas id="' + this.prefix + 'charPaletteCanvas" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;" ></canvas>';
    html += '</div>';


    // bottom part..

    if(this.prefix == 'side') {

      html += '<div  id="' + this.prefix + 'tilePaletteMaterials" style="position: absolute; display: none; left: 0px; right: 0; bottom: 56px; height: 0px; background-color: #111111; padding: 0px;">';
      html += this.tileMaterials.getHTML();
      html += '</div>';

      html += '<div style=" position: absolute; left: 0px; right: 0px; bottom: 0px; height: 56px; background-color: #222222; padding: 0px; display: flex; flex-direction: column;">';
      html += '<div style="white-space: nowrap; height: 28px; display: flex; align-items: center">';
    } else {
      html += '<div style="white-space: nowrap; position: absolute; left: 0px; right: 0px; bottom: 0px; height: 28px; background-color: #222222; padding: 0px; display: flex; align-items: center">';
    }

    // side top row


    // ---------
//    html += '<label class="gridinfo-label" class="gridinfo-label" for="charPaletteSortOrder">Sort</label>&nbsp;';
    html += '<select id="' + this.prefix + 'charPaletteSortOrder" style="margin-right: 20px">';
    html += '<option value="source">Tile Index</option>';
    html += '<option value="similar" selected="selected">Group Similar</option>';
    html += '</select>';


    //html += '<label class="gridinfo-label" for="tilePaletteScale" style="margin-left: 20px">Scale</label>&nbsp;';

    html += '<div style="display: flex">';
    html += '<div class="ui-button tilePaletteScale-dec">-</div>';
    html += '<select id="' + this.prefix + 'tilePaletteScale">';
    html += '<option value="1">100%</option>';
    html += '<option value="2" selected="selected">200%</option>';
    html += '<option value="3">300%</option>';
    html += '<option value="4">400%</option>';
    html += '</select>';
    html += '<div class="ui-button tilePaletteScale-inc">+</div>';
    html += '</div>';

    html += '<span style="margin-left: 20px">';
    html += '<label class="gridinfo-label" for="tilePaletteTileMargin">Spacing</label>';
    html += '<span id="' + this.prefix + 'tilePaletteTileMargin" style="white-space: nowrap; margin-right: 10px">1</span>';
    html += '</span>';

    html += '<span>';
    html += '<div class="ui-button" id="' + this.prefix + 'tilePaletteTileMarginDec">-</div>';
    html += '&nbsp;'
    html += '<div class="ui-button" id="' + this.prefix + 'tilePaletteTileMarginInc">+</div>';
    html += '</span>';
    // -----------



    if(this.prefix == 'side') {
      html += '</div>';
      html += '<div style="white-space: nowrap; height: 28px; display: flex; align-items: center">';
    }


    // side bottom row

    html += '<span style="margin-right: 0px">';
    html += '<label class="gridinfo-label" for="tilePaletteTileSize">Size</label>';
    html += '<span id="' + this.prefix + 'tilePaletteTileSize" style="white-space: nowrap; margin-right: 10px"> 8x8</span>';
    html += '</span>';

    html += '<span>';
    html += '<label class="gridinfo-label" for="tilePaletteTileCount">Count</label>';
    html += '<span id="' + this.prefix + 'tilePaletteTileCount" style="white-space: nowrap; margin-right: 10px"> 256</span>';
    html += '</span>';

    html += '<span style="margin-right: 16px">';
    html += '<div class="ui-button" id="' + this.prefix + 'tilePaletteTileCountDec">-</div>';
    html += '&nbsp;'
    html += '<div class="ui-button" id="' + this.prefix + 'tilePaletteTileCountInc">+</div>';
    html += '</span>';

    html += '<div class="ui-button" id="' + this.prefix + 'tilePaletteChooseTileSet">Choose Tile Set...<div class="rippleJS"></div></div>';

    html += '<div class="ui-button" style="margin-left: 6px" id="' + this.prefix + 'sortTilePalette">Rearrange...</div>';

    if(this.prefix == 'side') {
      html += '</div>';

    } else {

      /*
      html += '<span style="margin-left: 20px;">';
      html += '<label class="cb-container">Rearrange Tiles ';
      html += '<input type="checkbox" id="' + this.prefix + 'sortTilePalette"> <span class="checkmark"></span></label>';
      html += '</span>';
      */
    }

    


    html += '</div>';


    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "id": this.prefix + "charPalette", "html": html});


    UI.on('ready', function() {

      _this.canvas = document.getElementById(_this.prefix + 'charPaletteCanvas');
      _this.uiComponent.on('resize', function() {
        _this.resize();
      });

      if(_this.prefix == 'side' && _this.tileMaterials != null) {
        _this.tileMaterials.initEvents();
      }
    });
    parentPanel.add(this.uiComponent);

    this.tilePaletteDisplay = new TilePaletteDisplay();
    this.tilePaletteDisplay.init(this.editor, {canvasElementId: this.prefix + "charPaletteCanvas", resizeCanvas: false, blockStacking: this.blockStacking });


    var _this = this;
    this.tilePaletteDisplay.on('selectedgridchanged', function(selectedGrid) {

      _this.tileChosen();

      _this.editor.currentTile.setCharacters(selectedGrid);

      // sync the two tile palettes
      var tilePalette = _this.editor.tools.drawTools.tilePalette;
      var sideTilePalette = _this.editor.sideTilePalette;
      if(_this.prefix == 'side') {
        //this.editor.tools.drawTools.tilePalette.selectedGridChanged(characters);
        var mapType = sideTilePalette.tilePaletteDisplay.getCharPaletteMapType();
        if(mapType == 'source') { //} || mapType == 'columns') {
          // doesnt use selectedGridCells
          tilePalette.tilePaletteDisplay.clearSelectedGridCells();
          tilePalette.tilePaletteDisplay.setSelected(sideTilePalette.tilePaletteDisplay.getSelectedCharacters());
        } else {

          tilePalette.tilePaletteDisplay.setSelectedGridCells(sideTilePalette.tilePaletteDisplay.selectedGridCells);
        }
        tilePalette.drawTilePalette();
  
      } else {
        var mapType = tilePalette.tilePaletteDisplay.getCharPaletteMapType();
        if(mapType == 'source') { //} || mapType == 'columns') {
          // doesnt use selectedGridCells
          // clear the selected grid cells..
          sideTilePalette.tilePaletteDisplay.clearSelectedGridCells();
          sideTilePalette.tilePaletteDisplay.setSelected(tilePalette.tilePaletteDisplay.getSelectedCharacters());
        } else {
          sideTilePalette.tilePaletteDisplay.setSelectedGridCells(tilePalette.tilePaletteDisplay.selectedGridCells);
        }
        sideTilePalette.drawTilePalette();
  
      }
    });

    this.tilePaletteDisplay.on('charactertouch', function(character) {
      console.log('character touch');
      //_this.setCharacter(character);
      _this.editor.currentTile.setTiles([[character]]);
    });    

    this.tilePaletteDisplay.on('highlightchanged', function(character) {
      _this.setCharacterInfo(character);
    });

    this.tilePaletteDisplay.on('dblclick', function(ch) {

      this.editor.currentTile.setCharacters([[ch]]);

      this.editor.tileEditor.setVisible(true);
    });

    UI.on('ready', function() {
      _this.setupEvents();
    });
  },

  // switch tools if not the pen
  tileChosen: function() {
    var currentTool = this.editor.tools.drawTools.tool
    if(
      currentTool == 'block'
      || currentTool == 'erase'
      || currentTool == 'eyedropper'
      || currentTool == 'type'
      || currentTool == 'select'
      || currentTool == 'charpixel'
      || currentTool == 'zoom'
      || currentTool == 'move'
      || currentTool == 'pixel'
      || currentTool == 'hand'

    ) {
      // need to switch tools
      this.editor.tools.drawTools.setDrawTool('pen');
    }
  },

  setMaterialsVisible: function(visible) {
    if(visible) {
      $('#' + this.prefix + "tilePaletteMaterials").show();
      $('#' + this.prefix + "tilePaletteMaterials").css('height', '60px');
      $('#' + this.prefix + 'tilePaletteHolder').css('bottom', '116px');
    } else {
      $('#' + this.prefix + "tilePaletteMaterials").hide();
      $('#' + this.prefix + "tilePaletteMaterials").css('height', '0px');
      $('#' + this.prefix + 'tilePaletteHolder').css('bottom', '56px');
    }

  },
  

  selectedGridChanged: function(characters) {
    // called by current character....
    this.tilePaletteDisplay.clearSelectedGridCells();
    this.tilePaletteDisplay.setSelectedGrid(characters);
  },


  selectTilePaletteMapType: function(mapType) {
    
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(tileSet && tileSet.isPetscii()) {
      g_app.setPref("textmode.petsciisortmethod", mapType);
    } else {
      // save the sort method with the tile set..
    } 

    this.setCharPaletteMapType(mapType);

    // sync the palettes
    var tilePalette = this.editor.tools.drawTools.tilePalette;
    var sideTilePalette = this.editor.sideTilePalette;

    tilePalette.setCharPaletteMapType(mapType);
    sideTilePalette.setCharPaletteMapType(mapType);

    if(this.prefix == 'side') {
      $('#charPaletteSortOrder').val(mapType);      
    } else {
      $('#sidecharPaletteSortOrder').val(mapType);
    }

  },

  setupEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'charPaletteCloseButton').on('click', function() {

      _this.editor.setTilePalettePanelVisible(_this.prefix, false);
    });

    $('#' + this.prefix + 'charPaletteSortOrder').on('change', function(event) {
      var value = $(this).val();
      _this.selectTilePaletteMapType(value);

    });

    $('#' + this.prefix + 'tilePaletteChooseTileSet').on('click', function(event) {
      _this.editor.tileSetManager.showChoosePreset({});
    });

    $('#' + this.prefix + 'tilePaletteScale').on('change', function(event) {
      var value = parseFloat($(this).val());
      if(!isNaN(value)) {
        _this.setScale(value);
      }
    });

    $('.tilePaletteScale-dec').on('click', function() {
      var value = $('#' + _this.prefix + 'tilePaletteScale').val();
      var element = $('#' + _this.prefix + 'tilePaletteScale').get(0);
      var options = element.options;
      var prev = false;
      for(var i = 0; i < options.length; i++) {
        if(options[i].value == value) {
          break;
        }
        prev = options[i].value;
      }
      if(prev !== false) {
        _this.setScale(prev);
      }
      /*
      var options = $(this)[0].optio;
      console.log(options);
      console.log(this.options);
      */
      
    });

    $('.tilePaletteScale-inc').on('click', function() {
      var value = $('#' + _this.prefix + 'tilePaletteScale').val();
      var element = $('#' + _this.prefix + 'tilePaletteScale').get(0);
      var options = element.options;
      var next = false;
      for(var i = 0; i < options.length; i++) {
        if(options[i].value == value && i < options.length - 1) {
          next = options[i + 1].value;          
        }
      }
      if(next !== false) {
        _this.setScale(next);
      }


    });



    $('#' + this.prefix + 'tilePaletteTileCountInc').on('click', function() {
      _this.tileCountChange(1);
      
    });


    $('#' + this.prefix + 'tilePaletteTileCountDec').on('click', function() {
      _this.tileCountChange(-1);
    });


    $('#' + this.prefix + 'tilePaletteTileMarginInc').on('click', function() {
      _this.tileMarginChange(1);
      
    });

    $('#' + this.prefix + 'tilePaletteTileMarginDec').on('click', function() {
      _this.tileMarginChange(-1);
    });

    $('#' + this.prefix + 'sortTilePalette').on('click', function() {
      var sort = $(this).is(':checked');
//      _this.setSortTilePalette(sort);

      _this.editor.editTilePalette();

    });


    $('#' + this.prefix + 'charpalette-rotatebutton').on('click', function() {
      _this.editor.currentTile.rotate2d();
    });

    $('#' + this.prefix + 'charpalette-fliphbutton').on('click', function() {
      _this.editor.currentTile.flipH2d();
    });

    $('#' + this.prefix + 'charpalette-flipvbutton').on('click', function() {
      _this.editor.currentTile.flipV2d();
    });


  },

  
  setSortTilePalette: function(sort) {
    var noTile = this.editor.tileSetManager.noTile;
    
    if(sort) {
      this.tilePaletteDisplay.setMode('sort');

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      var currentCustomMap = tileSet.getPaletteMap('custom');

      var tileMap = [];

      if(currentCustomMap === false) {
        // make a copy of the tile map
        tileMap = this.tilePaletteDisplay.getCharPaletteMap();
      } else {
        tileMap = currentCustomMap.data;
      }

      var allTiles = [];

      this.tileSortMap = [];
      for(var y = 0; y < tileMap.length; y++) {
        this.tileSortMap[y] = [];
        for(var x = 0; x < tileMap[y].length; x++) {
          this.tileSortMap[y][x] = tileMap[y][x];
          allTiles.push(tileMap[y][x]);
        }
      }

      console.log(allTiles);

      console.log(JSON.stringify(allTiles));

      // add an extra block of tiles..
      if(tileMap.length < 32) {
        for(var y = tileMap.length; y < 32; y++) {
          this.tileSortMap[y] = [];
          for(var x = 0; x < tileMap[0].length; x++) {
            this.tileSortMap[y][x] = noTile;
          }
        }
      }

      $('#' + this.prefix + 'charPaletteSortOrder').val('custom');      
      
      this.tilePaletteDisplay.setCharPaletteMap(this.tileSortMap, 'custom');

      this.tilePaletteDisplay.draw({ redrawTiles: true });

    } else {
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();

      var map = this.tilePaletteDisplay.getCharPaletteMap();
      var lastRow = 0;
      for(var y = 0; y < map.length; y++) {
        var includeRow = false;
        for(var x = 0; x < map[y].length; x++) {
          if(map[y][x] !== noTile) {
            includeRow = true;
          }
        }
        if(includeRow && y > lastRow) {
          lastRow = y;
        }
      }      
      map.length = lastRow + 1;      
      tileSet.setPaletteMap('custom', { data: map, rowsPerColumn: 8 });

      this.tilePaletteDisplay.setMode('grid');
      this.tilePaletteDisplay.draw({ redrawTiles: true });      
    }
  },

  tileMarginChange: function(amount) {
    var tileWidth = 8;
    var tileHeight = 8;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(tileSet != null) {
      tileWidth = tileSet.getTileWidth();
      tileHeight = tileSet.getTileHeight();
    }

    var prefName = "tilepalette.margin_" + tileWidth + 'x' + tileHeight;

    var margin = 1;

    if(typeof amount != 'undefined') {
      margin = this.tilePaletteDisplay.getTileMargin();
      margin += amount;
    } else {
      // dont think it should get to here if, mobile, but just in case.
      if(!UI.isMobile.any()) {
        margin = g_app.getPref(prefName);
        if(typeof margin == 'undefined' || margin === null) {
          
          margin = 1;
        }
      }
    }

    margin = parseInt(margin, 10);
    if(isNaN(margin)) {
      margin = 1;
    }

    if(margin >= 0) {

      g_app.setPref(prefName, margin);

      this.tilePaletteDisplay.setTileMargin(margin);
      this.tilePaletteDisplay.draw({ redrawTiles: true });
      $('#' + this.prefix + 'tilePaletteTileMargin').html(margin);
    }

  },
  
  tileCountChange: function(amount) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var tileCount = tileSet.getTileCount();
    tileCount += amount;

    if(tileCount > 0) {
      tileSet.setTileCount(tileCount);
    }
    this.tilePaletteDisplay.draw({ redrawTiles: true });
    this.updateTileCountHTML();


    
  },

  updateTileCountHTML: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();
    $('#' + this.prefix + 'tilePaletteTileCount').html(tileCount);

  },

  setCharPaletteMapType: function(type) {
    this.tilePaletteDisplay.setCharPaletteMapType(type);

    $('#charPaletteSortOrder').val(type);      
    $('#sidecharPaletteSortOrder').val(type);

  },  

  getTilePaletteMapType: function() {
    return this.tilePaletteDisplay.charPaletteMapType;
  },

  setScale: function(scale) {

    var tileWidth = 8;
    var tileHeight = 8;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(tileSet != null) {
      tileWidth = tileSet.getTileWidth();
      tileHeight = tileSet.getTileHeight();
    }

    var prefName = "tilepalette.scale_" + tileWidth + 'x' + tileHeight;

    var newScale = 2;

    if(typeof scale != 'undefined') {
      newScale = scale;
    } else {
      // dont think it should get to here if, mobile, but just in case.
      if(!UI.isMobile.any()) {
        newScale = g_app.getPref(prefName);
        if(typeof newScale == 'undefined' || newScale == null) {          
          newScale = 2;
        }
      }
    }


    newScale = parseInt(newScale, 10);

    if(isNaN(newScale) || newScale > 100) {
      newScale = 2;
    }
    
    g_app.setPref(prefName, newScale);

    this.tilePaletteDisplay.setScale(newScale);
    this.tilePaletteDisplay.draw({ redrawTiles: true });
    $('#' + this.prefix + 'tilePaletteScale').val(newScale);

  },

  setCharPaletteScale: function(charWidth, charHeight) {
    this.tilePaletteDisplay.setCharPaletteScale(charWidth, charHeight);
  },

  
  resize: function() {
    if(!this.canvas) {
      return;
    }
    var element = $('#' + this.prefix + 'tilePaletteHolder');
    this.width = element.width();
    this.height = element.height();

    if(this.width != this.canvas.style.width || this.height != this.canvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.canvas.width = this.width * UI.devicePixelRatio;
        this.canvas.height = this.height * UI.devicePixelRatio;
      }
    }
    this.tilePaletteDisplay.draw();
  },

  initCharPalette: function() {
    
    this.tilePaletteDisplay.initCharPalette();

    if(!UI.isMobile.any()) {
//      var panelHeight = canvasHeight + 82;
//      UI('textEditor').resizeThePanel({panel: 'south', size: panelHeight});
    }

    this.initCharInfoCanvas();
  },


  /*
  drawMobileCharPalette: function() {

    alert('draw mobile char palette');
    if(this.charPaletteContext == null) {
      // char palette context hasn't been initialised yet
      return;
    }
    this.charPaletteContext.clearRect(0, 0, this.charPaletteCanvas.width, this.charPaletteCanvas.height);
    this.charPaletteImageData = this.charPaletteContext.getImageData(0, 0, this.charPaletteCanvas.width, this.charPaletteCanvas.height);

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    UI.mobileDebug('draw mobile char palette');

    var args = {};
    args['imageData'] = this.charPaletteImageData;
    args['colorRGB']  = ColorUtils.hexStringToInt(styles.textMode.tilePaletteFg);//0xffffff;
    args['bgColorRGB'] = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;


    this.charPaletteScale = 4;

    this.charMargin = 4;

//    this.canvasScale = 1;
    for(var i = 0; i < 128; i++) {
      var x = (i % 16);
      var y = Math.floor(i / 16);
      var ch = this.charPaletteMap[y][x];

      args['character'] = ch;
      args['x'] = (1 + x * (tileSet.charWidth + this.charMargin) * this.charPaletteScale) * this.canvasScale;
      args['y'] = (1 + y * (tileSet.charHeight + 1) * this.charMargin) * this.canvasScale
      args['scale'] = this.charPaletteScale * this.canvasScale;

      args['select'] = this.editor.currentTile.isCharacterSelected(ch);
      args['highlight'] = this.highlightCharacter === ch;

      tileSet.drawCharacter(args);
    }

    this.charPaletteContext.putImageData(this.charPaletteImageData, 0, 0);
  },
*/



  drawCharPalette: function() {
    console.error('draw char palette!!');
    this.tilePaletteDisplay.draw();
  },
  drawTilePalette: function(args) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(tileSet == null) {
      return;
    }

    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    if(tileWidth !== this.tileWidth || tileHeight !== this.tileHeight) {
      this.tileWidth = tileWidth;
      this.tileHeight = tileHeight;

      this.tileMarginChange();
      this.setScale();
    }

    if(this.editor.graphic.getType() == 'sprite') {

      if(g_app.isMobile()) {
//        this.editor.tilePaletteMobile.draw();
        this.editor.spriteFramesMobile.draw();
      } else {
        this.editor.spriteFrames.draw();
      }

    } else {
/*
    html += '<option value="1">100%</option>';
    html += '<option value="2" selected="selected">200%</option>';
    html += '<option value="3">300%</option>';
    html += '<option value="4">400%</option>';
*/
      if(g_app.isMobile()) {
        this.editor.tilePaletteMobile.draw();
      } else {
        if(typeof args != 'undefined' && typeof args.redrawTiles != 'undefined' && args.redrawTiles) {
          if(tileSet.getTileHeight() > 32) {
            var scaleHtml = '';
            var tilePaletteScale = $('#' + this.prefix + 'tilePaletteScale').val();

            scaleHtml += '<option value="0.25" ';
            if(tilePaletteScale == 0.25) {
              scaleHtml += ' selected="selected"';
            }
            scaleHtml += '>25%</option>';

            scaleHtml += '<option value="0.5" ';
            if(tilePaletteScale == 0.5) {
              scaleHtml += ' selected="selected"';
            }
            scaleHtml += '>50%</option>';

            scaleHtml += '<option value="1" ';
            if(tilePaletteScale == 1) {
              scaleHtml += ' selected="selected"';
            }
            scaleHtml += '>100%</option>';

            $('#' + this.prefix + 'tilePaletteScale').html(scaleHtml);
            if(tilePaletteScale > 1) {
              this.tilePaletteDisplay.setScale(0.5);
              $('#' + this.prefix + 'tilePaletteScale').val(0.5)
            }
        
          } else {
            var scaleHtml = '';
            var tilePaletteScale = $('#' + this.prefix + 'tilePaletteScale').val();
            scaleHtml += '<option value="0.5">50%</option>';
            for(var i = 1; i <= 4; i++) {
              scaleHtml += '<option value="' + i + '" ';
              if(i == tilePaletteScale) {
                scaleHtml += ' selected="selected" ';
              }
              scaleHtml += '>';
              scaleHtml += i + '00%</option>';
            }
            $('#' + this.prefix + 'tilePaletteScale').html(scaleHtml);
          }
        }
        this.tilePaletteDisplay.draw(args);
      }
    }
  },

  selectRecent: function(direction) {
    if(this.editor.currentTile.recentCharacters.length == 0) {
      return;
    }
    var recentIndex = this.charRecentIndex - direction;
    if(recentIndex < 0) {
      recentIndex = 0;
    }
    if(recentIndex >= this.editor.currentTile.recentCharacters.length) {
      recentIndex = this.editor.currentTile.recentCharacters.length - 1;
    }

    this.charRecentIndex = recentIndex;

    var c = this.editor.currentTile.recentCharacters[this.editor.currentTile.recentCharacters.length - 1 - recentIndex];
    //this.editor.currentTile.setTiles([[c]]);
    this.editor.setSelectedTiles([[c]]);
//    this.draw();
  },

  rotateCharacter: function() {
    
    var characters = this.editor.currentTile.getCharacters();
    if(characters.length == 0) {
      return;
    }

    var c = characters[0][0];
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var rotatedChar = tileSet.getCharNextRotation(c);
    if(c === rotatedChar) {
      rotatedChar = false;
    }
    if(rotatedChar !== false) {
      this.editor.setSelectedTiles([[rotatedChar]]);
      return;
    }

    if(this.editor.getHasTileRotate()) {
      this.editor.currentTile.rotate2d();
    }

    

//    this.draw();
  },

  keyDown: function(event) {

    switch(event.keyCode) {

      case keys.textMode.tilePaletteLeft.keyCode:
        if(keys.textMode.tilePaletteLeft.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(-1, 0);
        }
      break;
      case keys.textMode.tilePaletteRight.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(1, 0);
        }
      break;
      case keys.textMode.tilePaletteUp.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(0, -1);      
        }
      break;
      case keys.textMode.tilePaletteDown.keyCode:
        if(keys.textMode.tilePaletteDown.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(0, 1);      
        }
      break;
      case keys.textMode.characterRecentNext.keyCode:
        if(keys.textMode.characterRecentNext.shift == event.shiftKey) {
          this.selectRecent(1);
        }
      break;
      case keys.textMode.characterRecentPrev.keyCode:
        if(keys.textMode.characterRecentPrev.shift == event.shiftKey) {
          this.selectRecent(-1);
        }
      break;

      case keys.textMode.characterRotate.keyCode: 
        this.rotateCharacter();
      break;

    }

  },

  keyUp: function(event) {

  },

  keyPress: function(event) {

  },

  charPaletteTouch: function(event) {
//    var x = event.offsetX;
//    var y = event.offsetY;
//    var x  = event.touches[0].pageX - event.touches[0].target.offsetLeft;
//    var y = event.touches[0].pageY - event.touches[0].target.offsetTop;
//    var x = event.touches[0].pageX - $('#' + this.canvas.id).offset().left;
//    var y = event.touches[0].pageY - $('#' + this.canvas.id).offset().top;

    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;



    var character = this.charPaletteXYToChar(x, y);
    if(character !== false) {
      this.editor.currentTile.setCharacter(character);      
      UI.closeDialog();      
    }
  },


  initCharInfoCanvas: function() {
    if(this.characterCanvas == null) {
      this.characterCanvas = document.getElementById(this.prefix + 'tilepalette-tileinfocanvas');
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    this.characterCanvasScale =  Math.floor(UI.devicePixelRatio);

    var charScale = 2;
    if(charHeight >= 10) {
      charScale = 1;
    }

    if(charScale * charHeight > 26) {
      charScale = 26 / charHeight;
    }

    
    this.characterCanvas.width = 16 * UI.devicePixelRatio;
    this.characterCanvas.height = 16 * UI.devicePixelRatio;
    this.characterCanvas.style.width = '16px';
    this.characterCanvas.style.height = '16px';

    /*
    this.characterCanvas.width = charScale * charWidth * this.characterCanvasScale;
    this.characterCanvas.height = charScale * charHeight * this.characterCanvasScale;
    this.characterCanvas.style.width = charScale * charWidth + 'px';
    this.characterCanvas.style.height = charScale * charHeight + 'px';
    */

    this.characterCanvasScale *= charScale;

    this.characterContext = this.characterCanvas.getContext('2d');
    this.characterImageData = this.characterContext.getImageData(0, 0, this.characterCanvas.width, this.characterCanvas.height);    

  },

  setHighlightCharacter: function(character) {
    this.tilePaletteDisplay.setHighlightCharacter(character);
    this.setCharacterInfo(character);
  },

  clearHighlightCharacter: function() {
    this.tilePaletteDisplay.clearHighlightCharacter();
  },

  setCharacterInfoToCurrent: function() {
    if(this.tileInfoTile !== false) {
      return;
    }

    var currentTile = this.editor.currentTile;
    tiles = currentTile.getTiles();
//    
    var html = '';

    if(tiles.length == 1 && tiles[0].length == 1) {
      var characterHex = ("00" + tiles[0][0].toString(16)).substr(-2);
      html += tiles[0][0] + " (0x" + characterHex + ")";
    }

    $('#' + this.prefix + 'charpalette-charinfo').html(html);

    var currentTileCanvas = currentTile.tileSettingsTileCanvas;
    if(currentTileCanvas && this.characterContext) {
      this.characterContext.clearRect(0, 0, this.characterCanvas.width, this.characterCanvas.height);
      this.characterContext.drawImage(currentTileCanvas, 0, 0, currentTileCanvas.width, currentTileCanvas.height,
        0, 0, this.characterCanvas.width, this.characterCanvas.height);
    }

  },

  setCharacterInfo: function(character) {
    this.tileInfoTile = character;
    // use currentTile::drawCursor
    //console.log('set character info' + character);
    if(character === false) {
//      console.log('false');
      this.setCharacterInfoToCurrent();
      return;
    }

    var characterHex = ("00" + character.toString(16)).substr(-2);
    var html = '';
    html += character + " (0x" + characterHex + ")";

    $('#' + this.prefix + 'charpalette-charinfo').html(html);


    
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var scale = this.characterCanvas.width / tileSet.getTileWidth();// this.characterCanvasScale;

    var characterIndex = parseInt(character);
    if(isNaN(characterIndex)) {
      return;
    }

    var flipV = false;
    var flipH = false;
    var rotZ = 0;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      if(layer.getHasTileFlip()) {
        flipH = this.editor.currentTile.flipH;
        flipV = this.editor.currentTile.flipV;
      }
      if(layer.getHasTileRotate()) {
        rotZ = this.editor.currentTile.rotZ;
      }  
    }

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      var ecmGroup = Math.floor(characterIndex / 256);
      characterIndex = (characterIndex % 64) + ecmGroup * 256;
    }
 
    

    if(tileSet.getType() == 'vector') {
      this.characterContext.clearRect(0, 0, this.characterCanvas.width, this.characterCanvas.height);
    }

    tileSet.drawCharacter({
      character: characterIndex, 
      x: 0,
      y: 0,
      scale: scale,
      imageData: this.characterImageData,
      context: this.characterContext,
      colorRGB: 0xdddddd,
      bgColorRGB: 0x111111,
      flipV: flipV,
      flipH: flipH,
      rotZ: rotZ
    })

    if(tileSet.getType() != 'vector') {
      this.characterContext.putImageData(this.characterImageData, 0, 0);
    }
  },

}
