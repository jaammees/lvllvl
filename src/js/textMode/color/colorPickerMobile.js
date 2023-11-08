var ColorPickerMobile = function() {
  this.editor = null;

  this.colorPaletteDisplay =  null;
  this.colorType = 'cell';

  this.uiComponent = null;

  this.canSelectMultiple = false;
  this.id = 'Choose';

  this.closeHandler = false;
  this.c64ECMColorIndex = 0;

}

ColorPickerMobile.prototype = {
  on: function(eventName, f) {
    if(eventName == 'close') {
      this.closeHandler = f;
    }
  },

  init: function(editor, args) {
    this.editor = editor;

    if(typeof args != 'undefined') {
      if(typeof args.canSelectMultiple != 'undefined') {
        this.canSelectMultiple = args.canSelectMultiple;
      }

      if(typeof args.id != 'undefined') {
        this.id = args.id;
      }
    }
  },

  initEvents: function() {
    var _this = this;
    this.colorPaletteDisplay.on('touchcolor', function(color) {
      _this.displayInfo(color);
    });
    this.colorPaletteDisplay.on('touchcolorend', function(color) {
      if(color !== false) {
        if(!_this.canSelectMultiple) {
          _this.selectColor(color);
          UI.closeDialog();
        }
      }
    });

    $('#noColorMobile').on('click', function(event) {
      _this.selectColor(_this.editor.colorPaletteManager.noColor);
      UI.closeDialog();
    });

    $('.colorPickerTypeMobile').on('click', function(event) {
      var type = $(this).attr('data-type');
      _this.setColorType(type);
    });

    $('#clearColorSelection').on('click', function(event) {
      _this.colorPaletteDisplay.setSelectedColors([]);
      _this.colorPaletteDisplay.draw();
    });

    $('input[name=colorPickerECMColorIndexMobile]').on('click', function() {
      var index = $('input[name=colorPickerECMColorIndexMobile]:checked').val();
      index = parseInt(index, 10);
      if(!isNaN(index)) {
        _this.setC64ECMIndex(index);
      }
    });


/*
    $('input[name=colorPickerTypeMobile]').on('click', function(event) {
      var type = $('input[name=colorPickerTypeMobile]:checked').val();
      _this.setColorType(type);

    });
*/
  },
  show: function(args) {
    var colorType = 'cell';
    if(typeof args != 'undefined') {
      if(typeof args.type != 'undefined') {
        colorType = args.type;
      }
    }

    var _this = this;
    this.callback = args.colorPickedCallback;
    if(this.uiComponent == null) {
      var width = 500;
      var height = 100;

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();

      width = screenWidth - 30;
      height = screenHeight - 30;

      this.uiComponent = UI.create("UI.MobilePanel", { "id": "colorPickerMobile" + this.id, "title": "Choose Color", "width": width, "height": height });
      var html = '';


      html += '<h2 style="margin: 0 0 14px 0" id="colorPickerMobileHeading">Color type heading</h2>';

      html += '<div style="margin-bottom: 14px">';
      html += '  <div style="display: inline-block; width: 64px; height: 60px; border: 3px solid #333333">';
      html += '    <div style="width: 64px; height: 30px;" id="colorPickerMobileCurrent' + this.id + '"></div>';
      html += '    <div style="width: 64px; height: 30px;" id="colorPickerMobilePreview' + this.id + '"></div>';
      html += '  </div>';
      html += '  <div style="display: inline-block; margin-left: 10px" id="colorPickerMobileInfo' + this.id + '"></div>';
      html += '</div>';

      html += '<div style="text-align: center">';
      html += '<canvas id="colorPickerMobileCanvas' + this.id + '"></canvas>';
      html += '</div>';



      if(!this.canSelectMultiple) {
        html += '<div style="position: absolute; left: 0px; right: 0px; bottom: 0px; height: 60px; background-color: #2f2f2f"></div>';

      
        html += '<div style="position: absolute; left: 7px; right: 7px; bottom: 10px; height: 42px; display: flex">';
        html += '  <div id="colorPickerTypeMobile_cell" data-type="cell" class="colorPickerTypeMobile"> <div class="colorPickerMobileColor"></div>Cell FG</div>';

        html += '  <div id="colorPickerTypeMobile_multi1" data-type="multi1" class="colorPickerTypeMobile colorPickerTypeMobileC64Multi"><div class="colorPickerMobileColor"></div>Multi 1</div>';
        html += '  <div id="colorPickerTypeMobile_multi2" data-type="multi2" class="colorPickerTypeMobile colorPickerTypeMobileC64Multi"><div class="colorPickerMobileColor"></div>Multi 2</div>';
        html += '  <div id="colorPickerTypeMobile_cellbg" data-type="cellbg" class="colorPickerTypeMobile colorPickerTypeMobileCellBG"><div class="colorPickerMobileColor"></div>Cell BG</div>';

/*
        html += '  <span id="colorPickerTypeMobileMulti1"><div id="colorPickerTypeMobile_multi1" data-type="multi1" class="colorPickerTypeMobile colorPickerTypeMobileC64Multi"><div class="colorPickerMobileColor"></div>Multi 1</div></span>';
        html += '  <span id="colorPickerTypeMobileMulti2"><div id="colorPickerTypeMobile_multi2" data-type="multi2" class="colorPickerTypeMobile"><div class="colorPickerMobileColor"></div>Multi 2</div></span>';
        html += '  <span id="colorPickerTypeMobileCellBG"><div id="colorPickerTypeMobile_cellbg" data-type="cellbg" class="colorPickerTypeMobile"><div class="colorPickerMobileColor"></div>Cell BG</div></span>';
*/        
        html += '  <div id="colorPickerTypeMobile_background" data-type="background" class="colorPickerTypeMobile"><div class="colorPickerMobileColor"></div>Frame</div>';
        html += '  <div id="colorPickerTypeMobile_border" data-type="border" class="colorPickerTypeMobile"><div class="colorPickerMobileColor"></div>Border</div>';
        html += '</div>';


        html += '<div style="margin-top: 14px" id="noColorMobileHolder">';
        html += '  <div class="ui-button" id="noColorMobile"><i class="halflings halflings-remove"></i> Transparent</div>';
        html += '</div>';

        html += '<div style="margin-top: 14px" id="c64ecmMobileHolder">';
//        html += '  <div class="ui-button" id="noColorMobile"><i class="halflings halflings-remove"></i> Transparent</div>';
        for(var i = 0; i < 4; i++) {
          var colorNumber = i + 1;
          var colorIndex = i;

          html += '<div>';
          html += '<label class="rb-container" style="margin-right: 4px"> ';
          html += '<div id="colorPickerECMColorBlockIndexMobile' + i + '" style="display: inline-block; width: 16px; height: 16px; background-color: #884433"></div>';
          html += 'BG ' + colorNumber;

          html += '<input type="radio" id="colorPickerECMColorIndexMobile' + i + '" name="colorPickerECMColorIndexMobile" value="' + colorIndex + '"'; 
          if(i === 0) {
            html += ' checked="checked" ';
          }
          html += '>';
          html += '<span class="checkmark"/>';
          html += '</label>';
          html += '</div>';
        }


        html += '</div>';


      } else {

/*
        html += '<div>';
        html += '<div style="display: inline-block; width: 80px; height: 80px; border: 1px solid #eeeeee">';
        html += '<div style="width: 80px; height: 40px;" id="colorPickerMobileCurrent' + this.id + '"></div>';
        html += '<div style="width: 80px; height: 40px;" id="colorPickerMobilePreview' + this.id + '"></div>';
        html += '</div>';
        html += '<div style="display: inline-block; margin-left: 10px" id="colorPickerMobileInfo' + this.id + '"></div>';
        html += '</div>';


        html += '<canvas id="colorPickerMobileCanvas' + this.id + '"></canvas>';
*/

        html += '<div style="margin-top: 20px">';
        html += '<div class="ui-button" id="clearColorSelection">Clear Selection</div>';
        html += '</div>';    

        this.okButton = UI.create('UI.Button', { "text": "OK" });
        this.uiComponent.addButton(this.okButton);
        this.okButton.on('click', function(event) {
          if(_this.closeHandler) {
            console.log('close dialog');
            _this.closeHandler();
          }

          UI.closeDialog();
        });


      }
      
      var htmlPanel = UI.create("UI.HTMLPanel", { "id": "colorPickerMobileHTML" + this.id, "html": html });
      this.uiComponent.add(htmlPanel);


      this.uiComponent.on('close', function() {

/*
        if(_this.closeHandler) {
          _this.closeHandler();
        }
*/        

      });

/*
      this.closeButton = UI.create('UI.Button', { "text": "Close" });
      this.closeButton.on('click', function(event) {
        if(_this.closeHandler) {
          _this.closeHandler();
        }
        UI.closeDialog();
      });

      this.uiComponent.addButton(this.closeButton);
*/
      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { "canvasElementId": "colorPickerMobileCanvas" + this.id, "canSelectMultiple": this.canSelectMultiple, "maxSelectableColors": 1, "canSelectWithRightMouseButton": false   });
      this.colorPaletteDisplay.draw();

      this.initEvents();

    }

    this.setColorType(colorType);

    this.initColorTypes();
    UI.showDialog("colorPickerMobile" + this.id);

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.c64ECMColorIndex = parseInt($('input[name=colorPickerECMColorIndexMobile]:checked').val(), 10);

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

    this.updateColorPreviews();
  },

  updateC64ECMColors: function() {
//    var colorPaletteManager = this.editor.colorPaletteManager;
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    for(var i = 0; i < 4; i++) {
      var color = this.editor.getC64ECMColor(i);
      var colorHex = colorPalette.getHexString(color);
      $('#colorPickerECMColorBlockIndexMobile' + i).css('background-color', '#' + colorHex);      
    }
  },


  updateColorPreviews: function() {


    var color = 0;
    var colorHex = '';

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    
    this.updateC64ECMColors();

    color = this.editor.currentTile.getColor();
    colorHex = colorPalette.getHexString(color);
    $('#colorPickerTypeMobile_cell .colorPickerMobileColor').css('background-color', '#' + colorHex);

    color = this.editor.graphic.getC64Multi1Color();
    colorHex = colorPalette.getHexString(color);
    $('#colorPickerTypeMobile_multi1 .colorPickerMobileColor').css('background-color', '#' + colorHex);

    color = this.editor.graphic.getC64Multi2Color();    
    colorHex = colorPalette.getHexString(color);
    $('#colorPickerTypeMobile_multi2 .colorPickerMobileColor').css('background-color', '#' + colorHex);

    color = this.editor.currentTile.getBGColor();   
    if(color !== this.editor.colorPaletteManager.noColor) {

      colorHex = colorPalette.getHexString(color);    
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').css('background-color', '#' + colorHex);
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').html('');
    } else {
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').css('background-color', '#000000');   
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').css('color', '#eeeeee');   
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').css('text-align', 'center');   
      $('#colorPickerTypeMobile_cellbg .colorPickerMobileColor').html('<i style="font-size: 12px; margin-top: 1px" class="halflings halflings-remove"></i>');
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(typeof layer.getBackgroundColor != 'undefined') {
      color = layer.getBackgroundColor();
    }

    if(color !== this.editor.colorPaletteManager.noColor) {
      colorHex = colorPalette.getHexString(color);
      $('#colorPickerTypeMobile_background .colorPickerMobileColor').css('background-color', '#' + colorHex);
    } else {
      $('#colorPickerTypeMobile_background .colorPickerMobileColor').css('background-color', '#000000');   
      $('#colorPickerTypeMobile_background .colorPickerMobileColor').css('color', '#eeeeee');   
      $('#colorPickerTypeMobile_background .colorPickerMobileColor').css('text-align', 'center');   
      $('#colorPickerTypeMobile_background .colorPickerMobileColor').html('<i style="font-size: 12px; margin-top: 1px" class="halflings halflings-remove"></i>');

    }

    color = this.editor.graphic.getBorderColor();    
    if(color !== this.editor.colorPaletteManager.noColor) {
      colorHex = colorPalette.getHexString(color);
      $('#colorPickerTypeMobile_border .colorPickerMobileColor').css('background-color', '#' + colorHex);
    } else {
      $('#colorPickerTypeMobile_border .colorPickerMobileColor').css('background-color', '#000000');   
      $('#colorPickerTypeMobile_border .colorPickerMobileColor').css('color', '#eeeeee');   
      $('#colorPickerTypeMobile_border .colorPickerMobileColor').css('text-align', 'center');   
      $('#colorPickerTypeMobile_border .colorPickerMobileColor').html('<i style="font-size: 12px; margin-top: 1px" class="halflings halflings-remove"></i>');

    }
  },

  initColorTypes: function() {
    var screenMode = this.editor.getScreenMode();
    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      $('.colorPickerTypeMobileC64Multi').show();
      $('.colorPickerTypeMobileCellBG').hide();
    } else {
      $('.colorPickerTypeMobileC64Multi').hide();
      $('.colorPickerTypeMobileCellBG').show();
    }

    if(this.editor.graphic.getType() == 'sprite') {
      $('#colorPickerTypeMobile_border').hide();
    } else {
      $('#colorPickerTypeMobile_border').show();
    }

  },

  getSelectedColors: function() {
    return this.colorPaletteDisplay.getSelectedColors();
  },


  setC64ECMIndex: function(index) {
    this.c64ECMColorIndex = index;
    this.editor.currentTile.setBGColor(index);
    console.log('set c64 ecm index: ' + this.c64ECMColorIndex);
//    this.colorPickedCallback(index);
  },

  selectColor: function(color) {
    var screenMode = this.editor.getScreenMode();

    switch(this.colorType) {
      case 'cell':
        this.editor.currentTile.setColor(color);
      break;
      case 'cellbg':
        if(screenMode === TextModeEditor.Mode.C64ECM)  {
          console.log('set ecm colour ' + this.c64ECMColorIndex + ':' + color);
          this.editor.setC64ECMColor(this.c64ECMColorIndex, color);
          this.updateC64ECMColors();
        } else {
          this.editor.currentTile.setBGColor(color);
        }
      break;
      case 'multi1':
        this.editor.setC64Multi1Color(color);
      break;
      case 'multi2':
        this.editor.setC64Multi2Color(color);
      break;
      case 'background':
        this.editor.setBackgroundColor(color);
      break;
      case 'border':
        this.editor.setBorderColor(color);
      break;
    }


    if(this.editor.tileEditorMobile) {
      this.editor.tileEditorMobile.draw();
    }
  },
  setCurrentColor: function() {
    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer) {
      return;
    }

    var color = false;
    switch(this.colorType) {
      case 'cell':
        color = this.editor.currentTile.getColor();
      break;
      case 'cellbg':
        color = this.editor.currentTile.getBGColor();
      break;
      case 'multi1':
        if(typeof layer.getC64Multi1Color != 'undefined') {
          color = layer.getC64Multi1Color();
        }
      break;
      case 'multi2':
        if(typeof layer.getC64Multi2Color != 'undefined') {
          color = layer.getC64Multi2Color();
        }
      break;
      case 'background':
        if(typeof layer.getBackgroundColor != 'undefined') {
          color = layer.getBackgroundColor();
        }
      break;
      case 'border':
        if(typeof layer.getBorderColor != 'undefined') {
          color = layer.getBorderColor();
        }
      break;

    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(color === this.editor.colorPaletteManager.noColor) {
      var colorHex = '000000';
      $('#colorPickerMobileCurrent' + this.id).css('background-color', '#' + colorHex);

    } else {

      var colorHex = colorPalette.getHexString(color);
      $('#colorPickerMobileCurrent' + this.id).css('background-color', '#' + colorHex);
    }


  },

  setColorType: function(type) {
    if(type == 'cellcolor') {
      type = 'cell';
    }
    this.colorType = type;
    var screenMode = this.editor.getScreenMode();

    $('#noColorMobileHolder').hide();
    $('#c64ecmMobileHolder').hide();

    var heading = '';
    switch(type) {
      case 'cell':
        heading = 'Cell FG Colour';
      break;
      case 'cellbg':
        heading = 'Cell BG Colour';

        if(screenMode === TextModeEditor.Mode.C64ECM)  {
          $('#noColorMobileHolder').hide();
          $('#c64ecmMobileHolder').show();
        } else {
          $('#noColorMobileHolder').show();
        }
      break;
      case 'background':
        heading = 'Frame Background Colour';
        $('#noColorMobileHolder').show();
      break;
      case 'border':
        heading = 'Border Colour';
        $('#noColorMobileHolder').show();
      break;
      case 'multi1':
        heading = 'Multi Colour 1';
      break;
      case 'multi2':
        heading = 'Multi Colour 2';
      break;

    }

    $('#colorPickerMobileHeading').html(heading);


    $('.colorPickerTypeMobile').removeClass('colorPickerTypeMobileSelected');
    $('#colorPickerTypeMobile_' + type).addClass('colorPickerTypeMobileSelected');
//    $('#colorPickerTypeMobile_' + type).prop('checked', true);
    if(type == 'cell') {
      this.colorPaletteDisplay.setType('cellcolor');
    } else {
      this.colorPaletteDisplay.setType(type);
    }

    this.colorPaletteDisplay.draw();
    this.setCurrentColor();
//    $('input[name=colorPickerTypeMobile')
  },

  displayInfo: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(color === false) {
      return;
    }

    var displayColor = color;
    var screenMode = this.editor.getScreenMode();
    if(screenMode === TextModeEditor.Mode.C64MULTICOLOR && color >= 8 && this.colorType == 'cell' && this.editor.graphic.getType() != 'sprite') {
      displayColor -= 8;
    }

    var colorHex = colorPalette.getHexString(color);
    var displayColorHex = colorPalette.getHexString(displayColor);
    $('#colorPickerMobilePreview' + this.id).css('background-color', '#' + displayColorHex);


    var html = '';
    html += '<div>Index: ' + color + '</div>';
    html += '<div>Hex Index: ' +  ("00" + color.toString(16)).substr(-2) + '</div>';
    html += '<div>RGB: #' + colorHex + '</div>';
    html += '<div>';

    $('#colorPickerMobileInfo' + this.id).html(html);

  },
}

