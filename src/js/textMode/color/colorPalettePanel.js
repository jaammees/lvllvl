var ColorPalettePanel = function() {
  this.colorPaletteDisplay = null;

  this.colorPaletteWidth = false;
  this.scrollbar = null;

  this.colorRecentIndex = 0;
  this.maxColorSize = 30;
  this.layout = '';
}

ColorPalettePanel.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentComponent) {
    var _this = this;
    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "colorPalettePanel" });
    UI.on('ready', function() {

      _this.colorPaletteResize();

      _this.uiComponent.load('html/textMode/colorPalettePanel.html', function() {
        _this.initEvents();
        if (!Modernizr.cssscrollbar) {
          _this.scrollbar = new PerfectScrollbar('#colorPaletteHolder');
        }
      });
    });

    this.uiComponent.on('resize', function() {
      _this.colorPaletteResize();
    });

    parentComponent.add(this.uiComponent);
  },

  setSelectedColor: function(index, color) {
    var screenMode = this.editor.getScreenMode();

    if(screenMode ==  TextModeEditor.Mode.NES) {
      // colour is the subpalette
      var subPalette = color;
      var subPaletteColor = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPaletteColor();
      if(typeof subPaletteColor !== 'undefined') {
        color = this.editor.colorPaletteManager.colorSubPalettes.getPaletteColor(subPalette, subPaletteColor);
      }
    } 
    if(this.colorPaletteDisplay) {
      this.colorPaletteDisplay.setSelectedColor(index, color);
      if(index == 0 && color != this.editor.colorPaletteManager.noColor) {
        this.setColorInfo(color);
      }
    }
  },

  initEvents: function() {
    var _this = this;
    this.colorPaletteDisplay = new ColorPaletteDisplay();
    this.colorPaletteDisplay.init(this.editor, { canvasElementId: "colorPalettePanelCanvas", "canSelectWithRightMouseButton": true });
    this.colorPaletteDisplay.setType('cellcolor');
    
    this.colorPaletteDisplay.on('colorselected', function(event) {
      _this.colorSelected(event.colorIndex, event.color);
    });

    this.colorPaletteDisplay.on('highlightchanged', function(event) {
      if(event.color !==  _this.editor.colorPaletteManager.noColor) {
        _this.setColorInfo(event.color);
      } else {
        _this.setColorInfo(_this.colorPaletteDisplay.getSelectedColor(0));
      }
    });

    this.colorPaletteDisplay.on('doubleclick', function(event) {
      //_this.editor.toggleColorEditor();
      _this.editor.showColorEditor();
    });

    $('#chooseColorPaletteButton').on('click', function() {      
      _this.editor.colorPaletteManager.showChoosePreset({});
    });


    $('#editColorPaletteButton').on('click', function() {
      _this.editor.editColorPalette();
    });

    $('#loadColorPaletteButton').on('click', function() {
      _this.editor.colorPaletteManager.showLoad({});
    })



    $('#colorPaletteSortOrder').on('change', function() {
      var val = $(this).val();
      _this.sortPalette(val);
    });

    $('.colorPalettePanelSubPaletteColor').on('click', function() {
      var subPalette = parseInt($(this).attr('data-subpalette'), 10);
      var subPaletteColor = parseInt($(this).attr('data-color'), 10);

      _this.selectSubPaletteColor(subPalette, subPaletteColor);
    });

    $('.colorPalettePanelSubPaletteColor').on('mouseover', function() {
      var subPalette = parseInt($(this).attr('data-subpalette'), 10);
      var subPaletteColor = parseInt($(this).attr('data-color'), 10);
      
      var colorIndex = _this.editor.colorPaletteManager.colorSubPalettes.getPaletteColor(subPalette, subPaletteColor);
      _this.setColorInfo(colorIndex);
      _this.colorPaletteDisplay.setHighlightColor(colorIndex);
    });

    $('.colorPalettePanelSubPaletteColor').on('mouseout', function() {
      var selectedColor = _this.colorPaletteDisplay.getSelectedColor(0);
      if(typeof selectedColor != 'undefined' && selectedColor !== false && selectedColor !== _this.editor.colorPaletteManager.noColor) {
        _this.setColorInfo(selectedColor);
      }

      _this.colorPaletteDisplay.setHighlightColor(_this.editor.colorPaletteManager.noColor);

    });

    $('#colorPaletteCloseButton').on('click', function() {
      _this.editor.setColorPalettePanelVisible(false);
    });

    this.colorPaletteUpdate();
  },


  
  // colorType is fg or bg
  colorSelected: function(colorType, colorIndex) {
    var screenMode = this.editor.getScreenMode();

    if(screenMode ==  TextModeEditor.Mode.NES) {
      var currentSubPalette = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPalette();

      var currentSubPaletteColor = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPaletteColor();
      this.editor.colorPaletteManager.colorSubPalettes.setColor(currentSubPaletteColor, colorIndex);
      this.editor.currentTile.setColor(currentSubPalette, { force: true});
      
    } else {
      if(colorType == 0) {
        this.editor.currentTile.setColor(colorIndex);
      }
      if(colorType == 1) {
        if(screenMode == TextModeEditor.Mode.C64STANDARD) {
          this.editor.currentTile.setBGColor(this.editor.colorPaletteManager.noColor);
        } else if(screenMode == TextModeEditor.Mode.C64ECM) {
          var index = this.editor.currentTile.getBGColor();
          this.editor.setC64ECMColor(index, colorIndex);
//          this.editor.currentTile.setBGColor(index, { force: true });

        } else {
          this.editor.currentTile.setBGColor(colorIndex);
        }
      }
    }
  },

  setSubPalettesVisible: function(visible) {
    if(visible) {
      this.layout = 'subpalettes';
      $('#colorPalettePanelSubPalettes').show();
      $('#colorPalettePanelInfoHolder').css('top', '82px');
      $('#colorPaletteHolder').css('top', '106px');

      var southSize = UI('eastInfoPanel').getPanelSize({ 'panel': 'south' });
      if(southSize < 210) {
        UI('eastInfoPanel').resizeThePanel({ panel: 'south', size: 210 });
      }

    } else {
      this.layout = '';
      $('#colorPalettePanelSubPalettes').hide();
      $('#colorPalettePanelInfoHolder').css('top', '22px');
      $('#colorPaletteHolder').css('top', '46px');
    }
  },

  selectSubPaletteColor: function(subPalette, subPaletteColor) {
    this.editor.colorPaletteManager.colorSubPalettes.selectPalette(subPalette, subPaletteColor);
    this.editor.colorPaletteManager.colorSubPalettes.selectPaletteColor(subPaletteColor);    
  },

  highlightSubPaletteColor: function() {
    $('.colorPalettePanelSubPaletteColor').removeClass('colorPalettePanelSubPaletteColor-selected');
    var palette = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPalette();
    var paletteColor = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPaletteColor();
    $('#colorPalettePanelSubPalette' + palette + '-Color' + paletteColor).addClass('colorPalettePanelSubPaletteColor-selected');
    this.updateSubPaletteColors();
  },

  updateSubPaletteColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorSubPalettes = this.editor.colorPaletteManager.colorSubPalettes;
    var subPaletteCount = colorSubPalettes.getPaletteCount();
    var subPaletteColorCount =  colorSubPalettes.getPaletteColorCount();

    for(var i = 0; i < subPaletteCount; i++) {
      for(var j = 0; j < subPaletteColorCount; j++) {
        var colorIndex = colorSubPalettes.getPaletteColor(i, j);
        var color = colorPalette.getHexString(colorIndex);
        $('#colorPalettePanelSubPalette' + i + '-Color' + j).css('background-color', '#' + color);
        $('#colorPalettePanelSubPalette' + i + '-Color' + j).css('border-color', '#' + color);
      }
    }

    $('.colorPalettePanelSubPaletteColor-selected').css('border-color', '#888888');


  },

  sortPalette: function(sortOrderMethod) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(colorPalette.setCurrentColorMap(sortOrderMethod) === false) {
      colorPalette.setSortOrderMethod(sortOrderMethod);
    }
    /*
    if( $.isNumeric(sortOrderMethod)) {
      // its a map..
      colorPalette.setCurrentColorMap(sortOrderMethod);
    } else {
      colorPalette.setSortOrderMethod(sortOrderMethod);
    }
    */

    this.colorPaletteDisplay.setColorMap(colorPalette.getCurrentColorMap());
    this.colorPaletteDisplay.draw();

  },

  setColorInfo: function(index) {
    var colorIndex = index;
    if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR && colorIndex >= 8 && this.editor.graphic.getType() !== 'sprite') {
      colorIndex -= 8;
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }
    var hexString = colorPalette.getHexString(colorIndex);
    $('#colorPalettePanelInfoColor').css('background-color', '#' + hexString);
    $('#colorPalettePanelInfoColorDec').html(index);
    $('#colorPalettePanelInfoColorHex').html("0x" + ("00" + index.toString(16)).substr(-2));
    $('#colorPalettePanelInfoColorRGB').html('#' + hexString);
  },

  keyDown: function(event) {

    //          if(event.shiftKey) {

    switch(event.keyCode) {
      case keys.textMode.colorPaletteLeft.keyCode:
        if(keys.textMode.colorPaletteLeft.shift == event.shiftKey) {
          this.moveSelection(-1, 0);
        }
      break;
      case keys.textMode.colorPaletteRight.keyCode:
        if(keys.textMode.colorPaletteRight.shift == event.shiftKey) {
          this.moveSelection(1, 0);
        }
      break;
      case keys.textMode.colorPaletteUp.keyCode:
        if(keys.textMode.colorPaletteRight.shift == event.shiftKey) {
          this.moveSelection(0, -1);      
        }
      break;
      case keys.textMode.colorPaletteDown.keyCode:
        if(keys.textMode.colorPaletteDown.shift == event.shiftKey) {
          this.moveSelection(0, 1);      
        }
      break;
      case keys.textMode.colorPaletteRecentNext.keyCode:
        if(keys.textMode.colorPaletteRecentNext.shift == event.shiftKey) {
          this.selectRecent(1);
        }
      break;
      case keys.textMode.colorPaletteRecentPrev.keyCode:
        if(keys.textMode.colorPaletteRecentPrev.shift == event.shiftKey) {
          this.selectRecent(-1);
        }
      break;

    }

  },

  keyUp: function(event) {
  },

  keyPress: function(event) {
  },

  moveSelection: function(dx, dy) {
    this.colorPaletteDisplay.moveSelection(dx, dy);
  },

  selectRecent: function(direction) {
    var recentIndex = this.colorRecentIndex - direction;
    if(recentIndex < 0) {
      recentIndex = 0;
    }
    if(recentIndex >= this.editor.currentTile.recentColors.length) {
      recentIndex = this.editor.currentTile.recentColors.length - 1;
    }

    this.colorRecentIndex = recentIndex;

    var color = this.editor.currentTile.recentColors[this.editor.currentTile.recentColors.length - 1 - recentIndex];
    if(typeof color != 'undefined') {
      this.editor.currentTile.setColor(color);
    }
//    this.drawCharPalette();
  },


  colorPaletteUpdate: function(args) {

    if(!this.colorPaletteDisplay) {
      return;
    }
    var updateMap = true;
    if(typeof args != 'undefined') {
      if(typeof args.updateMap != 'undefined') {
        updateMap = args.updateMap;
      }
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(colorPalette == null) {
      return;
    }
    var colors = [];
    var colorCount = colorPalette.getColorCount();
    for(var i = 0; i < colorCount; i++) {
      colors.push(colorPalette.getHex(i) & 0xffffff);
    }

    var colorsAcross = colorPalette.getColorsAcross();
    this.colorPaletteDisplay.setColors(colors, { colorsAcross: colorsAcross });



    if(updateMap) {
      var sortOrder = $('#colorPaletteSortOrder').val();


      var defaultSortMethods = [

        { value: "source" , label: "Colour Index" },
        { value: "hls" , label: "Hue" },
  //      { value: "hue" , label: "Source" },
        { value: "saturation" , label: "Saturation" },
        { value: "brightness" , label: "Brightness" },
        { value: "red" , label: "Red" },
        { value: "green" , label: "Green" },
        { value: "blue" , label: "Blue" },
      ];
      var sortOrderHTML = "";

      var maps = colorPalette.getColorPaletteMaps();
      for(var i = 0; i < maps.length; i++) {
        sortOrderHTML += '<option value="' + maps[i].id + '">' + maps[i].name + '</option>';
      }

      if(maps.length == 1) {
        sortOrder = maps[0].id;
      }


      if(maps.length == 0) {
        sortOrderHTML += '<option value="default">Default Layout</option>';
      }

      for(var i = 0; i < defaultSortMethods.length; i++) {
        sortOrderHTML += '<option value="' + defaultSortMethods[i].value + '">' + defaultSortMethods[i].label + '</option>';
      }

      $('#colorPaletteSortOrder').html(sortOrderHTML);

      $('#colorPaletteSortOrder').val(sortOrder);
      $('#colorPaletteSortOrder').hide();
      this.sortPalette(sortOrder);
    }

    // set to false so it resizes
    this.colorPaletteWidth = false;
    this.colorPaletteResize();
    this.colorPaletteDisplay.draw();

    var screenMode = this.editor.getScreenMode();
    if(screenMode ==  TextModeEditor.Mode.NES) {
      if(this.layout !== 'subpalettes') {
        this.setSubPalettesVisible(true);
      }
      this.updateSubPaletteColors();
    } else {
      if(this.layout == 'subpalettes') {
        this.setSubPalettesVisible(false);
      }
    }
  },


  getSortMethod: function() {
    return $('#colorPaletteSortOrder').val();
  },

  colorPaletteResize: function() {

    var width = $('#colorPaletteHolder').width();
    if(typeof width == 'undefined' || width < 0) {

      // not sure why coming as negative...
      width = 227;
    }

    if(this.colorPaletteWidth != width) {
      this.colorPaletteWidth = width;

      if(this.colorPaletteDisplay) {
        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
        if(colorPalette) {
          this.colorPaletteDisplay.setMaxColorWidth(30);
          this.colorPaletteDisplay.fitToWidth(width);
        }
      }
    }

    if(this.scrollbar) {
      this.scrollbar.update();
    }
  }

}
