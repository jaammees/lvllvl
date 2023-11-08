var TilePickerPopup = function() {
  this.html = '<div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0">';
  this.html += '  <div id="charactePickerCanvasHolder" style="position: absolute; top: 0; bottom: 28px; left: 0; right: 0; overflow: hidden">';
  this.html += '    <canvas id="characterPickerCanvas"></canvas>';
  this.html += '  </div>';
  this.html += '  <div style="position: absolute; bottom: 4px; left: 4px; height: 20px;" id="characterPickerInfo" style="color: #ffffff"></div>';
  this.html += '</div>';

  this.uiComponent = null;
  this.htmlComponent = null;

  this.highlightedCharacter = false;

  this.characterPickedCallback = null;

  this.tilePickerCanvas = null;


  this.layout = 'vertical';
  this.mode = 'single';

  this.tilePaletteDisplay = null;
}

TilePickerPopup.prototype = {
  init: function(editor, args) {
    var _this = this;
    this.editor = editor;

    this.uiComponent = UI.create("UI.Popup", { "id": "tilePickerPopup", "width": 300, "height": 300 });
    

    this.uiComponent.on('keydown', function(event) {
      _this.editor.keyDown(event);
      _this.tilePaletteDisplay.draw({ redrawTiles: true });

    });

    this.uiComponent.on('keyup', function(event) {
      _this.editor.keyUp(event);
      _this.tilePaletteDisplay.draw({ redrawTiles: true });

    });

    this.htmlComponent = UI.create("UI.HTMLPanel", { "html": this.html });
    this.uiComponent.add(this.htmlComponent);


  },

  updateInfo: function(character) {
    var html = '';
    html += 'Tile: ';
    html += character;

    var hex = character.toString(16);
    if(hex.length == 1) {
      hex = '0' + hex;
    }
    hex = '0x' + hex;
    html == '(' + hex + ')';

    $('#characterPickerInfo').html(html);
  },


  resize: function() {
    if(this.tilePickerCanvas == null) {
      this.tilePickerCanvas = document.getElementById('characterPickerCanvas');
    }
    var element = $('#charactePickerCanvasHolder');
    this.width = element.width();
    this.height = element.height();

    if(this.width != this.tilePickerCanvas.style.width 
      || this.height != this.tilePickerCanvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.tilePickerCanvas.style.width = this.width + 'px';
        this.tilePickerCanvas.style.height = this.height + 'px';

        this.tilePickerCanvas.width = this.width * UI.devicePixelRatio;
        this.tilePickerCanvas.height = this.height * UI.devicePixelRatio;
      }
    }

    if(this.tilePaletteDisplay != null) {
      this.tilePaletteDisplay.draw();
    }

  },

  show: function(x, y, args) {

    
    var _this = this;

    this.characterPickedCallback = null;
    if(typeof args.characterPickedCallback != 'undefined') {
      this.characterPickedCallback = args.characterPickedCallback;
    }

    if(typeof args.mode != 'undefined') {
      this.mode = args.mode;

    }


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.tilePaletteDisplay == null) {
      this.tilePaletteDisplay = new TilePaletteDisplay();
      this.tilePaletteDisplay.init(this.editor, { "mode": this.mode, "canvasElementId": "characterPickerCanvas", "blockStacking": "vertical" });
      this.tilePaletteDisplay.on('characterselected', function(character) {
        if(character !== false) { 
          _this.characterPickedCallback(character);
        }
        UI.hidePopup();
      });

      this.tilePaletteDisplay.on('highlightchanged', function(character) {
        if(character !== false) {
          _this.updateInfo(character);
        }
      });

    }

    this.tilePaletteDisplay.setScale(2);

    this.tilePaletteDisplay.setMode(this.mode);
    if(this.mode == 'single') {
      if(typeof args.selected != 'undefined') {
        this.tilePaletteDisplay.setSelectedGrid([]);
        this.tilePaletteDisplay.setSelected([args.selected]);
      }
    }

    if(typeof args.mouseUp != 'undefined') {
      this.tilePaletteDisplay.on('mouseup', function(event) {
        var selection = {};
        selection.characters = _this.tilePaletteDisplay.getSelectedCharacters();
        selection.grid = _this.tilePaletteDisplay.getSelectedCharactersGrid();

        args.mouseUp(event, selection);
      });
    }

    // need to call init in case character set has changed.
    var mapType = this.editor.tools.drawTools.tilePalette.getTilePaletteMapType();
    this.tilePaletteDisplay.initCharPalette({ "mapType": mapType });
    this.tilePaletteDisplay.draw({ "redrawTiles": true });

    var tilePaletteDisplayWidth = this.tilePaletteDisplay.getWidth();
    var tilePaletteDisplayHeight = this.tilePaletteDisplay.getHeight();

    var popupWidth = tilePaletteDisplayWidth ;//+ 84;
    var popupHeight = tilePaletteDisplayHeight + 30;// 58;


    if(popupWidth > UI.getScreenWidth() - 20) {
      popupWidth = UI.getScreenWidth() - 20;
    }

    if(popupHeight > UI.getScreenHeight() - 200) {
      popupHeight = UI.getScreenHeight() - 200;
      popupWidth += 14;
    }

    this.uiComponent.setDimensions(popupWidth, popupHeight);

    UI.showPopup("tilePickerPopup", x, y);
    this.resize();
  },

}