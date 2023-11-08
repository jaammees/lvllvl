var Info = function() {
  this.character = 0;
  this.block = false;
  this.fgColor = 0;
  this.bgColor = 0;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.characterCanvas = null;
  this.characterContext = null;

}

Info.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentComponent) {
    var _this = this;
    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "info" });
    UI.on('ready', function() {
      _this.uiComponent.load('html/textMode/info.html', function() {
        _this.initEvents();
        _this.initContent();
      });
    });

    parentComponent.add(this.uiComponent);
  },

  initEvents: function() {
    var _this = this;

    this.characterCanvas = document.getElementById('infoCharacterCanvas');
    $('#infoPanelCloseButton').on('click', function(e) {

      _this.editor.setInfoPanelVisible(false);
    });
  },


  initContent: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var charWidth = 8;//tileSet.getTileWidth();
    var charHeight = 8;//tileSet.getTileHeight();
    this.characterCanvasScale =  Math.floor(UI.devicePixelRatio);
    this.characterCanvas.width = 2 * charWidth * this.characterCanvasScale;
    this.characterCanvas.height = 2 * charHeight * this.characterCanvasScale;
    this.characterCanvas.style.width = 2 * charWidth + 'px';
    this.characterCanvas.style.height = 2 * charHeight + 'px';

    this.characterContext = this.characterCanvas.getContext('2d');
    this.characterImageData = this.characterContext.getImageData(0, 0, this.characterCanvas.width, this.characterCanvas.height);    
  },

  leaveGrid: function() {
    var html = '';
    $('#info-coordinates').html(html);
  },

  setCoordinates: function(x, y, z) {
    var layer = this.editor.layers.getSelectedLayerObject();

    if(x == this.x && y == this.y && z == this.z) {
      return;
    }
    this.x = x;
    this.y = y;
    this.z = z;

    /*
    // reverseY
    if(layer && layer.getType() == 'grid') {
      this.y = layer.getGridHeight() - y - 1;
    }
*/
    var displayX = this.x;
    var displayY = this.y;
    var html = 'X: ' + displayX;
    html += ', ';
    html += 'Y: ' + displayY;
    html += '<br>';


    if(layer && layer.getType() == 'grid') {
      var address = this.x + this.y * this.editor.frames.width;
      var addressHex = ("0000" + address.toString(16)).substr(-4);


      html += ' ' + address +  ' (0x' + addressHex + ')';
    }

/*
    var html = '<table>';
    html += '<tr>';
    html += '<td>X:</td>';
    html += '<td>' + this.x + '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td>Y:</td>';
    html += '<td>' + this.y + '</td>';
    html += '</tr>';


    html += '</table>';  

*/

//    html += ', ';
//    html += 'z: ' + this.z;

    $('#info-coordinates').html(html);

  },

  setBlock: function(block) {

    if(typeof block == 'undefined' || block === false) {
      return;
    }
    if(block === this.block) {
      return;
    }
    this.block = block;

    var blockHex = ("00" + block.toString(16)).substr(-2);
    var html = '';
    html += block + " (0x" + blockHex + ")";

    
    $('#info-block').html(html);

  },

  setCharacter: function(character) {
    if(character == this.character) {
      return;
    }
    this.character = character;

    var characterHex = ("00" + character.toString(16)).substr(-2);
    var html = '';
    html += character + " (0x" + characterHex + ")";

    $('#info-character').html(html);

    var scale = 2 * this.characterCanvasScale;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var characterIndex = parseInt(character);
    if(isNaN(characterIndex)) {
      return;
    }

    tileSet.drawCharacter({
      character: characterIndex, 
      x: 0,
      y: 0,
      scale: scale,
      imageData: this.characterImageData,
      colorRGB: 0xdddddd,
      bgColorRGB: 0x111111
    })
    this.characterContext.putImageData(this.characterImageData, 0, 0);

  },

  setFGColor: function(fgColor) {
    if(fgColor == this.fgColor || typeof fgColor == 'undefined') {
      return;
    }

    this.fgColor = fgColor;

    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR && fgColor >= 8 && this.editor.graphic.getType() != 'sprite') {
      fgColor -= 8;
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var hexString = '#' + colorPalette.getHexString(fgColor);

    $('#infoCellFGColor').css('background-color', hexString);
    $('#infoCellFGColorIndex').html(fgColor);

    var fgColorHex = ("00" + fgColor.toString(16)).substr(-2);
    $('#infoCellFGColorHex').html("(0x" + fgColorHex + ")");

    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
      $('.currentCellColorDisplay').css('background-color', hexString);
    }
/*
    var html = 'fg: ';
    if(fgColor === false) {
      html += '';
    } else {
      html += fgColor;
    }
*/
//    $('#info-fgColor').html(html);

  },

  setBGColor: function(bgColor) {
    if(bgColor == this.bgColor) {
      return;
    }

    this.bgColor = bgColor;
    if(bgColor === this.editor.colorPaletteManager.noColor) {

      $('#infoCellBGColor').css('color', '#ffffff');
      $('#infoCellBGColor').css('background-color', '#000000');
      $('#infoCellBGColor').html('<i style="font-size: 16px; margin-top: -1px" class="halflings halflings-remove"></i>');

    } else {
      this.editor.colorPaletteManager.getCurrentColorPalette();
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      var hexString = '#' + colorPalette.getHexString(bgColor);

      $('#infoCellBGColor').css('background-color', hexString);
      $('#infoCellBGColor').html('');

    }

    var html = 'bg: ';
    if(bgColor === false) {
      html += '';
    } else {
      html += bgColor;
    }
//    $('#info-bgColor').html(html);
  },

  setZoom: function(zoom) {

    var zoom = zoom * 100;
    var zoomString = zoom.toFixed(2) + '%';
    $('#info-zoom').html(zoomString);
  },

  setScreenMode: function(mode) {
    switch(mode) {
      case TextModeEditor.Mode.TEXTMODE:
      case TextModeEditor.Mode.C64ECM:
        $('#info-bgColor').show();
        $('#info-fgColor').show();
      break;
      case TextModeEditor.Mode.C64STANDARD:
        $('#info-bgColor').hide();
        $('#info-fgColor').show();
        break;
      case TextModeEditor.Mode.C64MULTICOLOR:
        $('#info-fgColor').show();
        $('#info-bgColor').hide();
      break;
      case TextModeEditor.Mode.INDEXED:
      case TextModeEditor.Mode.RGB:
        $('#info-bgColor').hide();
        $('#info-fgColor').hide();
      break;
      default:
        $('#info-bgColor').show();
        $('#info-fgColor').show();
      break;
    }
  }


}