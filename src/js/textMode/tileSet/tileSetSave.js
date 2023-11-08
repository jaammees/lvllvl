var TileSetSave = function() {
  this.editor = null;
  this.tilesAcross = 16;
}

TileSetSave.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function() {

    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "saveTileSetDialog", "title": "Save Tileset", "width": 300, "height": 160 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/tileSetSave.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.save();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent();
    }

    UI.showDialog("saveTileSetDialog");
  },

  updateTilesAcross: function() {
    var tilesAcross = parseInt($('#saveTileSetTilesAcross').val(), 10);
    if(!isNaN(tilesAcross)) {
      this.tilesAcross = tilesAcross;
    }
  },

  updateExportFormat: function() {
    var format = $('#saveTileSetFormat').val();
    if(format == 'png') {
      $('#saveTilesSetTilesAcrossSection').show();
    } else {
      $('#saveTilesSetTilesAcrossSection').hide();
    }

  },

  initContent: function() {
    this.updateExportFormat();
    this.updateTilesAcross();
  },

  initEvents: function() {
    var _this = this;
    $('#saveTileSetTilesAcross').on('change', function() {
      _this.updateTilesAcross();
    });

    $('#saveTileSetFormat').on('change', function() {
      _this.updateExportFormat();
    });
  },



  save: function() {
    var filename = $('#saveTileSetAs').val();
    var format =  $('#saveTileSetFormat').val();

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    switch(format) {
      case 'json':
        tileSet.saveAsJson(filename);
        break;
      case 'png':
        tileSet.exportPng({ filename: filename, tilesAcross: this.tilesAcross });
        break;

      case 'bin':
        tileSet.exportBinary(filename, {});
        break;

    }

  }
}