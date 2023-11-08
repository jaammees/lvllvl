var ColorPaletteSave = function() {
  this.editor = null;
  this.colorPaletteDisplay = null;
  this.colorPalette = null;

  this.sortOrder = 'default';
  this.cellWidth = 8;
  this.cellHeight = 8;

}

ColorPaletteSave.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function(args) {

    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "saveColorPaletteDialog", "title": "Save Colour Palette", "width": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/colorPaletteSave.html', function() {
        _this.initContent(args);
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
      this.initContent(args);
    }

    UI.showDialog("saveColorPaletteDialog");
  },

  initContent: function(args) {
    if(this.colorPaletteDisplay == null) {
      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { canvasElementId: 'saveColorPaletteCanvas' });
    }

    if(typeof args != 'undefined' && typeof args.colorPalette != 'undefined') {
      this.colorPalette = args.colorPalette;
    } else {
      this.colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    }
    var colorPalette = this.colorPalette;
    this.colorsAcross = colorPalette.getColorsAcross();
    var colors = [];
    var colorCount = colorPalette.getColorCount();
    for(var i = 0; i < colorCount; i++) {
      colors.push(colorPalette.getHex(i));
    }

    this.sortOrder = $('#saveColorPaletteSortOrder').val();
    this.saveFormat = $('#saveColorPaletteFormat').val();

    $('#saveColorPaletteColorsAcross').val(this.colorsAcross);

    this.colorPaletteDisplay.setColors(colors, { colorsAcross: this.colorsAcross });

//    this.colorPaletteDisplay.setColorMap(colorPalette.getCurrentColorMap());

    this.setColorsAcross(this.colorsAcross)
    this.setSortOrder(this.sortOrder);
    this.colorPaletteDisplay.fitToWidth(240);

    this.colorPaletteDisplay.draw();

    this.setSaveFormat(this.saveFormat);


  },

  setCellWidth: function(cellWidth) {
    this.cellWidth = cellWidth;
    this.setSortOrder(this.sortOrder);

  },

  setCellHeight: function(cellHeight) {
    this.cellHeight = cellHeight;
    this.setSortOrder(this.sortOrder);

  },

  setColorsAcross: function(colorsAcross) {
    this.colorsAcross = colorsAcross;
    this.colorPaletteDisplay.setColorsAcross(colorsAcross);
    this.setSortOrder(this.sortOrder);
  },

  setSortOrder: function(sortOrder) {
    //var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    console.log('get color map');
    this.sortOrder = sortOrder;
    var colorMap = this.colorPalette.getColorMap(this.sortOrder, this.colorsAcross);
    this.colorPaletteDisplay.setColorMap(colorMap);
    this.colorPaletteDisplay.setColorSize(this.cellWidth, this.cellHeight, 0);

    this.colorPaletteDisplay.draw();
  },

  initEvents: function() {
    var _this = this;
    $('#saveColorPaletteSortOrder').on('change', function(event) {
      var sortOrder = $(this).val();
      _this.setSortOrder(sortOrder);
    });

    $('#saveColorPaletteFormat').on('change', function(event) {
      var saveFormat = $(this).val();
      _this.setSaveFormat(saveFormat);
    });

    $('#saveColorPaletteColorsAcross').on('keyup', function(event) {
      var colorsAcross = parseInt($(this).val(), 10);
      if(isNaN(colorsAcross)) {
        return;
      }
      _this.setColorsAcross(colorsAcross);
    });

    $('#saveColorPaletteColorsAcross').on('change', function(event) {
      var colorsAcross = parseInt($(this).val(), 10);
      if(isNaN(colorsAcross)) {
        return;
      }
      _this.setColorsAcross(colorsAcross);
    });


    $('#saveColorPaletteCellWidth').on('keyup', function(event) {
      var cellWidth = parseInt($(this).val(), 10);
      if(isNaN(cellWidth)) {
        return;
      }
      _this.setCellWidth(cellWidth);

    });

    $('#saveColorPaletteCellWidth').on('change', function(event) {
      var cellWidth = parseInt($(this).val(), 10);
      if(isNaN(cellWidth)) {
        return;
      }
      _this.setCellWidth(cellWidth);

    });

    $('#saveColorPaletteCellHeight').on('keyup', function(event) {
      var cellHeight = parseInt($(this).val(), 10);
      if(isNaN(cellHeight)) {
        return;
      }
      _this.setCellHeight(cellHeight);

    });

    $('#saveColorPaletteCellHeight').on('change', function(event) {
      var cellHeight = parseInt($(this).val(), 10);
      if(isNaN(cellHeight)) {
        return;
      }
      _this.setCellHeight(cellHeight);

    });


  },


  setSaveFormat: function(saveFormat) {
    this.saveFormat = saveFormat;
    if(this.saveFormat == 'json') {
      $('#saveColorPaletteSortOrderRow').hide();
    } else {
      $('#saveColorPaletteSortOrderRow').show();
    }

    if(this.saveFormat == 'png') {
      $('#saveColorPaletteColorsAcrossRow').show();
      $('#saveColorPaletteCellWidthRow').show();
      $('#saveColorPaletteCellHeightRow').show();

      //var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      var colorCount = this.colorPalette.getColorCount();
      $('#saveColorPaletteColorsAcross').attr('max', colorCount);


      this.cellWidth = parseInt($('#saveColorPaletteCellWidth').val(), 10);
      this.cellHeight = parseInt($('#saveColorPaletteCellHeight').val(), 10);
      this.setColorsAcross(colorsAcross);

    } else {
      $('#saveColorPaletteColorsAcrossRow').hide();
      $('#saveColorPaletteCellWidthRow').hide();
      $('#saveColorPaletteCellHeightRow').hide();
      //var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      var colorsAcross = this.colorPalette.getColorsAcross();
      this.cellWidth = 16;
      this.cellHeight = 16;
      this.setColorsAcross(colorsAcross);


    }
  },

  save: function() {
    var filename = $('#saveColorPaletteAs').val();
    var format = this.saveFormat;//$('#saveColorPaletteFormat').val();

    //var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorPalette = this.colorPalette;
    var map = this.colorPaletteDisplay.getColorMap();

    switch(format) {
      
      case 'json':
        colorPalette.saveAsJSON(filename);
      break;

      case 'png':
        colorPalette.saveAsPNG(filename, map, this.cellWidth, this.cellHeight);
      break;

      case 'aco':
        colorPalette.saveAsAco(filename, map);
      break;
      case 'ase':
        colorPalette.saveAsAse(filename, map);
      break;

      case 'gpl':
        colorPalette.saveAsGPL(filename, map);
      break;
      case 'txt':
        colorPalette.saveAsTxt(filename, map);
      break;
      case 'hex':
        colorPalette.saveAsHex(filename, map);
      break;
    }

  },

  saveAsGPL: function(filename) {
    var data = '';

  },

  saveAsTxt: function(filename) {

  },

  saveAsHex: function(filename) {

  }
}