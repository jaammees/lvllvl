var TilePaletteEditor = function() {
  this.editor = null;
  this.tilePaletteDisplay = null;

  this.uiComponent = null;

}


TilePaletteEditor.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function() {
    var _this = this;
    var width = 600;
    var height = 600;

    if(!this.uiComponent) {
      var html = '';
      this.canvasElementId = "tilePaletteEditorCanvas";

      html = '<div class="panelFill">';

      html += '<div id="' + this.canvasElementId + 'Holder" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0">';
      html += '<canvas id="' + this.canvasElementId + '" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0;"></canvas>';
      html += '</div>';


      html += '</div>';

      this.htmlPanel = UI.create("UI.HTMLPanel", { "id": "tilePaletteEditor", "html": html} );

      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "tilePaletteEditorDialog", "title": "Edit Tile Palette", "width": width, "height": height });

      this.uiComponent.add(this.htmlPanel);        

      this.uiComponent.on('resize', function() {
        _this.resize();
      });


      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.endSortTilePalette(true);
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        _this.endSortTilePalette(false);
        UI.closeDialog();
      });


      UI.showDialog("tilePaletteEditorDialog");


      this.tilePaletteDisplay = new TilePaletteDisplay();
      this.tilePaletteDisplay.init(this.editor, { 
        canvasElementId: this.canvasElementId, 
        resizeCanvas: false, blockStacking: "vertical" 
      });

      this.canvas = document.getElementById(this.canvasElementId);

    } else {      
      UI.showDialog("tilePaletteEditorDialog");      
    }

    this.resize();
    this.draw();

    this.startSortTilePalette();

  },

  startSortTilePalette: function() {
    var noTile = this.editor.tileSetManager.noTile;

    this.tilePaletteDisplay.setMode('sort');

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var currentCustomMap = tileSet.getPaletteMap('custom');

    var tileMap = [];

    if(currentCustomMap === false) {
      // make a copy of the tile map
      tileMap = this.editor.tools.drawTools.tilePalette.tilePaletteDisplay.getCharPaletteMap();
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


//    this.debugDownload(allTiles);

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

  },

  debugDownload: function(allTiles) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var vectorData = [];
/*
    _this.docRecord.data.vectorData = response.data;
    _this.unitsPerEm = response.unitsPerEm;
    _this.ascent = response.ascent;
    _this.descent = response.descent;

    if(typeof response.blankTile != 'undefined') {
      _this.blankCharacter = response.blankTile;
    }

    if(typeof response.filledCharacter != 'undefined') {
      _this.filledCharacter = response.filledTile;
    }

    _this.vectorData = response.data;
    for(var i = 0; i < _this.vectorData.length; i++) {
      _this.vectorData[i].path2d = null;
    }
*/
    console.log(allTiles);

    console.log(JSON.stringify(allTiles));

    for(var i = 0; i < allTiles.length; i++) {
      if(tileSet.vectorData[allTiles[i]]) {
        vectorData.push({
          "name": tileSet.vectorData[allTiles[i]].name,
          "unicode": tileSet.vectorData[allTiles[i]].unicode,
          "path": tileSet.vectorData[allTiles[i]].path
        });
      }
    }

    var data = {};
    data.data = vectorData;
    data.unitsPerEm = tileSet.unitsPerEm;
    data.ascent = tileSet.ascent;
    data.descent = tileSet.descent;
    data.blankTile = tileSet.blankCharacter;
    data.filledTile = tileSet.filledCharacter;

    console.log(data);

    download( JSON.stringify(data), 'tileset.json', "application/json");   

  },

  endSortTilePalette: function(save) {
    var noTile = this.editor.tileSetManager.noTile;
    if(save) {
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
      this.editor.tools.drawTools.tilePalette.selectTilePaletteMapType('custom');

    }

    this.tilePaletteDisplay.setMode('grid');
//    this.tilePaletteDisplay.draw({ redrawTiles: true });      

    // want to redraw tile palettes

    
//    this.editor.redrawTilePalettes();

  },
    

  resize: function() {
    if(!this.canvas) {
      return;
    }
    var element = $('#' + this.canvasElementId + 'Holder');
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



  draw: function() {
    this.tilePaletteDisplay.draw({ redrawTiles: true });      

  }
}