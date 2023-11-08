var ColorSubPalettes = function() {
  this.editor = null;

  this.html = '';

  this.uiComponent = null;

  this.currentColorSubPalette = 0;
  this.currentColor = 1;
  this.colorSubPaletteCount = 4;
  this.colorPerColorSubPalette = 4;
  this.subPalettes = [];
  this.checking = false;
}


ColorSubPalettes.prototype = {
  setColorSubPaletteCount: function(colorSubPaletteCount) {
    this.colorSubPaletteCount = colorSubPaletteCount;

    if(colorSubPaletteCount == 4) {
      this.subPalettes.push([33, 32, 41, 22]);
      this.subPalettes.push([33, 12, 38, 26]);
      this.subPalettes.push([33, 18, 44, 29]);
      this.subPalettes.push([33, 48, 32, 16]);

    } else { 
      while(this.subPalettes.length < this.colorSubPaletteCount) {
        var subPalette = [33, 32, 41, 22];
        this.subPalettes.push(subPalette);
      }
    }
    this.initHTML();


  },

  initColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorCount = colorPalette.getColorCount();

    var lastColorIndex = -1;

    for(var i = 0; i < this.subPalettes.length; i++) {
      for(var j = 0; j < this.subPalettes[i].length; j++) {
        
        var colorIndex = this.subPalettes[i][j];
        if(colorIndex >= colorCount) {
          lastColorIndex++;
          if(lastColorIndex >= colorCount) {
            lastColorIndex = 0;
          }
          this.subPalettes[i][j] = lastColorIndex;
        }
      }
    }
    this.updateColors();
  },

  updateColors: function() {
    var currentSubPalette = this.currentColorSubPalette;
    for(var i = 0; i < this.subPalettes[currentSubPalette].length; i++) {
      this.setColor(i, this.subPalettes[currentSubPalette][i]);
    }
    
  },

  check: function(callback) {
    var _this = this;

    if(this.checking) {
      return;
    }
    this.checking = true;

    if(this.currentColorSubPalette == 'undefined') {
      this.currentColorSubPalette = 0;
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var colorCount = colorPalette.getColorCount();

    console.log('colour count = ' + colorCount);

    /*
    if(colorCount !== 52) {
      if(confirm("You are not currently using the NES colour palette, would you like to switch?")) {
        this.editor.colorPaletteManager.choosePreset('nes', { "callback": function() {
          _this.initColors();
          if(typeof callback != 'undefined') {
            callback();
          }
          _this.checking = false;
        } });

        return;
      }
    } 
    */


    this.initColors();
    if(typeof callback != 'undefined') {
      callback();
    }
    this.checking = false;
  },
  initHTML: function() {
    this.html = '';

    this.html += '<div class="colorSubPalettePicker"  style="background-color: #111111; border: 1px solid #444444">';
    for(var i = 0; i < this.colorSubPaletteCount; i++) {

      this.html += '<div class="colorSubPalette" data-palette="' + i + '" style="">';
      this.html += '<div id="colorSubPalettePicker_' + i + '_0" style="position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background-color: #ffee66"></div>';
      this.html += '<div id="colorSubPalettePicker_' + i + '_1" style="position: absolute; top: 2px; left: 20px; width: 16px; height: 16px; background-color: #66ff66"></div>';
      this.html += '<div id="colorSubPalettePicker_' + i + '_2" style="position: absolute; top: 20px; left: 2px; width: 16px; height: 16px; background-color: #ffee66"></div>';
      this.html += '<div id="colorSubPalettePicker_' + i + '_3" style="position: absolute; top: 20px; left: 20px; width: 16px; height: 16px; background-color: #66ff66"></div>';
      this.html += '<div style="position: absolute; top: 4px; left: 50px; color: #eeeeee">Palette ' + i + '</div>';
      this.html += '</div>';

    }
    this.html += '</div>';
  },

  init: function(editor) {
    this.editor = editor;

    this.subPalettes = [];
    this.setColorSubPaletteCount(4);

    this.initHTML();

  },

  initEvents: function() {
    var _this = this;

    $('.colorSubPalettePicker .colorSubPalette').on('click', function(event) {
      var index = parseInt($(this).attr('data-palette'));
      _this.closePicker();
      _this.selectPalette(index);
    });

  },

  setPickerColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    for(var i = 0; i < this.subPalettes.length; i++) {
      for(var j = 0; j < this.subPalettes[i].length; j++) {
        var color = this.subPalettes[i][j];
        
        $('#colorSubPalettePicker_' + i + '_' + j).css('background-color', '#' + colorPalette.getHexString(color));
      }
    }
  },

  showPicker: function(x, y, args) {

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Popup", { "id": "colorSubPalettePickerPopup", "width": 300, "height": 300 });    
      this.htmlComponent = UI.create("UI.HTMLPanel", { "html": this.html });
      this.uiComponent.add(this.htmlComponent);
      this.initEvents();  
    }
    this.setPickerColors();

    var popupWidth = 180;
    var popupHeight = 166;
    this.uiComponent.setDimensions(popupWidth, popupHeight);

    UI.showPopup("colorSubPalettePickerPopup", x, y);
    this.visible = true; 

  },

  closePicker: function() {
    if(this.visible) {
      UI.hidePopup();
    }
    this.visible = false;
  },

  showMobilePicker: function(args) {
    console.log('show mobile picker');
    if(this.colorSubPalettePickerMobile == null) {
      this.colorSubPalettePickerMobile = new ColorSubPalettePickerMobile();
      this.colorSubPalettePickerMobile.init(this.editor);
    }

    this.colorSubPalettePickerMobile.show(args);

  },

  setColor: function(index, color) {
    
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    $('.colorSubPaletteColor' + index).css('background-color', '#' + colorPalette.getHexString(color));
    $('.colorSubPaletteColor' + index + 'Mobile').css('background-color', '#' + colorPalette.getHexString(color));

    //    $('.c64Multi1ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));

    if(index === 0) {
      // color 0 is the same for all palettes, and background color
      for(var i = 0; i < this.subPalettes.length; i++) {
        this.subPalettes[i][index] = color;
      }
//      this.editor.frames.setBackgroundColor(color);
      this.editor.setBackgroundColor(color, false);
      
    } else {
      this.subPalettes[this.currentColorSubPalette][index] = color;
    }

    this.editor.colorsUpdated();

    this.editor.colorPalettePanel.updateSubPaletteColors();

    if(this.colorSubPalettePickerMobile) {
      this.colorSubPalettePickerMobile.updateSubPaletteColors();
    }


//    this.editor.tileSetManager.tileSetUpdated();

  },

  getColor: function(index) {
    return this.subPalettes[this.currentColorSubPalette][index];
  },

  getPaletteColor: function(paletteIndex, colorIndex) {
    

    if(paletteIndex >= 4 || paletteIndex < 0 || paletteIndex === false) {
      paletteIndex = 0;
    }

//    console.error(paletteIndex);
    if(paletteIndex >= this.subPalettes.length || colorIndex >= this.subPalettes[paletteIndex].length) {
      return 0;
    }

    return this.subPalettes[paletteIndex][colorIndex];
  },

  getPaletteCount: function() {
    return this.subPalettes.length;
  },

  getPaletteColorCount: function() {
    return this.colorPerColorSubPalette;
  },

  selectPaletteColor: function(paletteColor) {
    this.currentColor = paletteColor;
    this.editor.tileEditor.tileEditorGrid.setColorIndex(paletteColor);
    this.editor.tools.drawTools.pixelDraw.color = paletteColor;

    this.editor.colorPalettePanel.highlightSubPaletteColor();

    if(this.colorSubPalettePickerMobile) {
      this.colorSubPalettePickerMobile.highlightSubPaletteColor();
    }
    this.editor.tileEditor.drawSelectedSubPaletteColor();

    if(this.editor.tileEditorMobile) {
      this.editor.tileEditorMobile.tileEditorMobileGrid.setColorIndex(paletteColor);
      this.editor.tileEditorMobile.drawSelectedSubPaletteColor();
    }


    this.editor.tools.drawTools.pixelDraw.drawSelectedSubPaletteColor();
  },

  getCurrentPalette: function() {
    return this.currentColorSubPalette;
  },

  getCurrentPaletteColor: function() {
    return this.currentColor;
  },

  selectPalette: function(paletteIndex, paletteColor) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(typeof paletteIndex != 'undefined') {
      this.currentColorSubPalette = paletteIndex;
    }

    if(typeof paletteColor != 'undefined') {
      this.currentColor = paletteColor;
      this.editor.colorPalettePanel.highlightSubPaletteColor();  
    }

    $('.colorSubPaletteSelectedPaletteName').html('Palette ' + this.currentColorSubPalette);

    for(var j = 0; j < 4; j++) {
      var color = this.subPalettes[this.currentColorSubPalette][j];
      $('.colorSubPaletteColor' + j).css('background-color', '#' + colorPalette.getHexString(color));
    }

    this.editor.currentTile.setColor(this.currentColorSubPalette, { force: true });

  }
}