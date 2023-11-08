var ColorSubPalettePickerMobile = function() {
  this.editor = null;

  this.colorPaletteDisplay =  null;
  this.colorType = 'cell';

  this.uiComponent = null;

  this.id = 'Choose';
}

ColorSubPalettePickerMobile.prototype = {
  on: function(eventName, f) {
    if(eventName == 'close') {
      this.closeHandler = f;
    }
  },

  init: function(editor, args) {
    this.editor = editor;

  },


  initEvents: function() {
    var _this = this;

    $('.colorPalettePanelSubPaletteColorMobile').on('click', function() {
      console.log('select colour');
      var subPalette = parseInt($(this).attr('data-subpalette'), 10);
      var subPaletteColor = parseInt($(this).attr('data-color'), 10);

      console.log(subPalette + ',' + subPaletteColor);
      _this.selectSubPaletteColor(subPalette, subPaletteColor);
    });

    this.colorPaletteDisplay.on('colorselected', function(event) {
      _this.colorSelected(event.colorIndex, event.color);
    });    
  },

  show: function(args) {
    var _this = this;

    this.callback = args.colorPickedCallback;
    if(this.uiComponent == null) {
      var width = 500;
      var height = 100;

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();

      width = screenWidth - 30;
      height = screenHeight - 30;

      this.uiComponent = UI.create("UI.MobilePanel", { "id": "colorSubPalettePickerMobile" + this.id, "title": "Choose Palette", "width": width, "height": height });
      var html = '';


      html += '<h2 style="margin: 0 0 14px 0" id="">Color Palette</h2>';

      /*
      html += '<div style="margin-bottom: 14px">';
      html += '  <div style="display: inline-block; width: 64px; height: 60px; border: 3px solid #333333">';
      html += '    <div style="width: 64px; height: 30px;" id="colorPickerMobileCurrent' + this.id + '"></div>';
      html += '    <div style="width: 64px; height: 30px;" id="colorPickerMobilePreview' + this.id + '"></div>';
      html += '  </div>';
      html += '  <div style="display: inline-block; margin-left: 10px" id="colorPickerMobileInfo' + this.id + '"></div>';
      html += '</div>';
      */

      html += '<div style="text-align: center">';
      html += '<canvas id="colorSubPalettePickerMobileCanvas' + this.id + '"></canvas>';
      html += '</div>';


      var subpaletteCount = 4;
      html += '<div id="colorPalettePanelSubPalettesMobile">';

      for(var i = 0; i < subpaletteCount; i++) {
        html += '    <div class="colorPalettePanelSubPaletteMobile" data-subPalette="' + i + '">';
        html += '      <div class="colorPalettePanelSubPaletteHolderMobile">';
        html += '        <div class="colorPalettePanelSubPaletteLabelMobile">' + i + ':</div>';
        html += '        <div class="colorPalettePanelSubPaletteColorsMobile">';
        html += '          <div class="colorPalettePanelSubPaletteColorMobile" id="colorPalettePanelSubPalette' + i + '-Color0Mobile" data-subPalette="' + i + '" data-color="0"></div>';
        html += '          <div class="colorPalettePanelSubPaletteColorMobile" id="colorPalettePanelSubPalette' + i + '-Color1Mobile" data-subPalette="' + i + '" data-color="1"></div>';
        html += '          <div class="colorPalettePanelSubPaletteColorMobile" id="colorPalettePanelSubPalette' + i + '-Color2Mobile" data-subPalette="' + i + '" data-color="2"></div>';
        html += '          <div class="colorPalettePanelSubPaletteColorMobile" id="colorPalettePanelSubPalette' + i + '-Color3Mobile" data-subPalette="' + i + '" data-color="3"></div>';
        html += '        </div>';
        html += '      </div>';
        html += '    </div>';
      }
      html += '</div>';



      
      var htmlPanel = UI.create("UI.HTMLPanel", { "id": "colorSubPalettePickerMobileHTML" + this.id, "html": html });
      this.uiComponent.add(htmlPanel);


      this.uiComponent.on('close', function() {

      });

      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { "canvasElementId": "colorSubPalettePickerMobileCanvas" + this.id, "canSelectMultiple": this.canSelectMultiple, "maxSelectableColors": 1, "canSelectWithRightMouseButton": false   });
      this.colorPaletteDisplay.draw();

      this.initEvents();

    }

    UI.showDialog("colorSubPalettePickerMobile" + this.id);

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    var colors = [];
    var colorCount = colorPalette.getColorCount();
    for(var i = 0; i < colorCount; i++) {
      colors.push(colorPalette.getHex(i));
    }

    var colorMap = colorPalette.getCurrentColorMap();
    var colorsAcross = 8;
    var colorsDown = 8;
    if(colorMap.length > 0 && colorMap[0].length > 0) {
      colorsAcross = colorMap[0].length;
      colorsDown = colorMap.length;
    }
    var colorWidth = 34;
    var colorHeight = 34;
    var colorSpacing = 4;
    if(colorsAcross > 12 || colorsDown > 12) {
      colorWidth = 20;
      colorHeight = 20;
    }

    if(typeof args.colors != 'undefined') {
      this.colorPaletteDisplay.setSelectedColors(args.colors);
    }
    this.colorPaletteDisplay.setColorSize(colorWidth, colorHeight, colorSpacing);
    this.colorPaletteDisplay.setColors(colors, { colorMap: colorPalette.getCurrentColorMap() });

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    var maxHeight = screenHeight - 111 - 120;

    if(colorsAcross > 6 && screenWidth < 800) {
      this.colorPaletteDisplay.fitToWidth(screenWidth - 24);
    }

    if(this.colorPaletteDisplay.getHeight() > maxHeight) {
      console.log('setting max height');
      colorWidth = 14;
      colorHeight = 14;
      colorSpacing = 3;
      this.colorPaletteDisplay.setColorSize(colorWidth, colorHeight, colorSpacing);
    }




    this.colorPaletteDisplay.draw();

    if(typeof args.currentColor != 'undefined') {
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      if(args.currentColor === false) {
        return;
      }

      var colorHex = colorPalette.getHexString(args.currentColor);
      $('#colorPickerMobileCurrent' + this.id).css('background-color', '#' + colorHex);

    }

    this.updateSubPaletteColors();

  },  

  // colorType is fg or bg
  colorSelected: function(colorType, colorIndex) {
    var colorSubPalettes = this.editor.colorPaletteManager.colorSubPalettes;
    var currentSubPalette = colorSubPalettes.getCurrentPalette();

    var currentSubPaletteColor = colorSubPalettes.getCurrentPaletteColor();
    colorSubPalettes.setColor(currentSubPaletteColor, colorIndex);
    this.editor.currentTile.setColor(currentSubPalette, { force: true});
  },


  selectSubPaletteColor: function(subPalette, subPaletteColor) {

    this.editor.colorPaletteManager.colorSubPalettes.selectPalette(subPalette, subPaletteColor);
    this.editor.colorPaletteManager.colorSubPalettes.selectPaletteColor(subPaletteColor);    
  },

  highlightSubPaletteColor: function() {
    $('.colorPalettePanelSubPaletteColorMobile').removeClass('colorPalettePanelSubPaletteColorMobile-selected');
    var palette = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPalette();
    var paletteColor = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPaletteColor();
    $('#colorPalettePanelSubPalette' + palette + '-Color' + paletteColor + 'Mobile').addClass('colorPalettePanelSubPaletteColorMobile-selected');
    this.updateSubPaletteColors();

    var colorSubPalettes = this.editor.colorPaletteManager.colorSubPalettes;

    console.log('highlight sub palette colours!!!!');
    console.log('palette = ' + palette + ',' + paletteColor);
    var colorIndex = colorSubPalettes.getPaletteColor(palette, paletteColor);
    if(colorIndex !== false) {
      this.colorPaletteDisplay.setSelectedColors([colorIndex]);      
      this.colorPaletteDisplay.draw();
    }
    console.log('colorIndex = ' + colorIndex);
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
        $('#colorPalettePanelSubPalette' + i + '-Color' + j + 'Mobile').css('background-color', '#' + color);
        $('#colorPalettePanelSubPalette' + i + '-Color' + j + 'Mobile').css('border-color', '#' + color);
      }
    }

    $('.colorPalettePanelSubPaletteColorMobile-selected').css('border-color', '#888888');


  },


}
