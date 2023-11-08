var ChooseCharactersDialog = function() {
  this.editor = null;
  this.tilePickerCanvas = null;
  this.context = null;

  this.charsets = {
    "none": [],
    "alpha": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154],
    "triangles": [32, 160, 95, 105, 223, 233],
    "squares": [32, 160, 108, 123, 124, 126, 127, 255, 102, 230, 207, 208, 204,250],
    "diagonals": [77, 78],
    "verticals": [101],
    "circles": [81, 87],
    "segments": [32, 160, 108, 123, 124, 126, 100, 111, 121, 98, 120, 119, 99, 101, 116, 117, 97, 118, 103, 106, 82, 70, 64, 68, 69,
                228, 239, 249, 226, 248, 247, 227, 229, 244, 245, 225, 246, 231, 234, 
                236, 251, 252, 254, 240, 238, 253, 237, 207, 208, 250, 204,
                84, 71, 93, 72, 89,
                127, 255],
    "4x4": [32, 160, 108, 123, 126, 124, 127, 255, 236, 251, 254, 252, 97, 225, 98, 226]
  }

  this.callback = null;

  this.uiComponent = null;

  this.mouseMode = '';

  this.tilePaletteDisplay = null;

}

ChooseCharactersDialog.prototype = {


  init: function(editor) {
    this.editor = editor;
  },
  show: function(args) {

    this.charPaletteMap = this.editor.tools.drawTools.tilePalette.charPaletteMap;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();


    if(this.uiComponent == null) {

      var dialogWidth = 740;
      var dialogHeight = 240;

      var _this = this;

      var html = '<div class="panelFill">';

      html += '<div id="chooseCharsCanvasHolder" style="position: absolute; top: 2px; bottom: 32px; left: 2px; right: 2px">';
      html += '<canvas width="144" height="36" id="chooseCharsCanvas" style="background-color: #222222"></canvas>';
      html += '</div>';


      html += '<div id="chooseCharsTypeHolder" style="position: absolute; left: 2px; right: 2px; bottom: 2px; height: 26px">';
      html += '  <div class="ui-button chooseCharsType" data-type="none">Clear Selection</div>';
      html += '  <div style="display: inline-block" id="chooseCharsPetscii">';
      html += '    <div class="ui-button chooseCharsType" data-type="triangles">Triangles</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="squares">Squares</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="circles">Circles</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="diagonals">Diagonals</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="verticals">Verticals</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="segments">Segments</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="4x4">4x4 Pixel</div>';
      html += '    <div class="ui-button chooseCharsType" data-type="alpha">Alpha</div>';
      html += '  </div>';
      html += '</div>';

      html += '</div>';

      this.uiComponent = UI.create("UI.Dialog", { "id": "chooseCharactersDialog", "title": "Choose Characters", "width": dialogWidth, "height": dialogHeight });

      this.htmlComponent = UI.create("UI.HTMLPanel", {"html": html});
      this.uiComponent.add(this.htmlComponent);
      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        if(_this.callback) {
          _this.callback(_this.tilePaletteDisplay.getSelectedCharacters() );
        }

        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      UI.on('ready', function() {
        _this.initContent();
        _this.initEvents();
        _this.uiComponent.on('resize', function() {
          _this.resize();
        });
      });

    } else {
      this.initContent();
    }

    this.callback = null;

    if(typeof args != 'undefined') {
      if(typeof args.callback != 'undefined') {
        this.callback = args.callback;
      }
      if(typeof args.chars != 'undefined') {
        this.tilePaletteDisplay.setSelected(args.chars);
      }

    }

    UI.showDialog("chooseCharactersDialog");
    this.resize();
//    this.drawChars();    

  },
  

  initContent: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.tilePaletteDisplay == null) {
      this.tilePaletteDisplay = new TilePaletteDisplay();
      this.tilePaletteDisplay.init(this.editor, { "mode": "multiple", "canvasElementId": "chooseCharsCanvas", "colors": "monochrome" });
    }

    // need to call init in case character set has changed.
    var mapType = this.editor.tools.drawTools.tilePalette.getTilePaletteMapType();
    this.tilePaletteDisplay.initCharPalette({ "mapType": mapType });
    this.tilePaletteDisplay.draw();


    var tilePaletteDisplayWidth = this.tilePaletteDisplay.getWidth();
    var tilePaletteDisplayHeight = this.tilePaletteDisplay.getHeight();

    var dialogWidth = tilePaletteDisplayWidth + 80;
    var dialogHeight = tilePaletteDisplayHeight + 120;


    UI('chooseCharactersDialog').setWidth(dialogWidth);
    UI('chooseCharactersDialog').setHeight(dialogHeight);

  },



  resize: function() {
    if(this.tilePickerCanvas == null) {
      this.tilePickerCanvas = document.getElementById('chooseCharsCanvas');
    }
    var element = $('#chooseCharsCanvasHolder');
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

  initEvents: function() {
    var _this = this;

    $('.chooseCharsType').on('click', function(event) {
      var type = $(this).attr('data-type');
      if(typeof _this.charsets[type] != 'undefined') {
        _this.tilePaletteDisplay.setSelected(_this.charsets[type]);
      }
    });

    $('#chooseCharsCancel').on('click', function() {
      _this.editor.hideDialog();
    });

    $('#chooseCharsOK').on('click', function() {
      if(_this.callback) {
        _this.callback();
      }
      _this.editor.hideDialog();
    });
  },

}
