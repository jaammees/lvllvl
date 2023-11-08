
var GridInfo = function() {
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

GridInfo.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentComponent) {
    var _this = this;

    var html = '<div style="background-color: #1d1d1d; position: absolute; top: 0; left: 0; right: 0; bottom: 0">';
    html += '<div id="gridinfo-coordinates" style="padding: 4px"></div>'

    html += '<div id="gridInfoZoom" style="text-align: right; display: block; position: absolute; width: 160px; right: 80px; top: 4px">';
    html += 'Zoom: ';
    html += '</div>';


    html += '<div style="position: absolute; top: 4px; right: 4px">';
    html += '<div class="ui-button" style="margin-right: 4px; height: 14px; width: 10px; padding: 2px 4px; text-align: center; line-height: 12px" id="gridInfoZoomOut">-</div>';
    html += '<div class="ui-button" style="margin-right: 4px; height: 14px; width: 10px;  padding: 2px 4px; text-align: center; line-height: 12px" id="gridInfoZoomIn">+</div>';
    html += '<div class="ui-button" style="height: 14px; width: 10px;  padding: 2px 8px 2px 6px; text-align: center; line-height: 12px" id="gridInfoZoomFit">Fit</div>';
    html += '</div>';


    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "gridinfo", "html": html });

    parentComponent.add(this.uiComponent);

    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  initEvents: function() {
    var _this = this;

    $('#gridInfoZoomOut').on('click', function() {
      _this.editor.zoom(-1);
    });
    $('#gridInfoZoomIn').on('click', function() {
      _this.editor.zoom(1);

    });
    $('#gridInfoZoomFit').on('click', function() {
      _this.editor.fitOnScreen(1);

    });
  },

  leaveGrid: function() {
    var html = '';
    $('#info-coordinates').html(html);
  },

  setSpriteInfo: function(x, y, z, tileIndex, fc, bc) {
    var layer = this.editor.layers.getSelectedLayerObject();
    var colorPalette = layer.getColorPalette();

    if(x == this.x && y == this.y && z == this.z && this.tileIndex == tileIndex && this.fc == fc && this.bc == bc) {
      return;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.tileIndex = tileIndex;
    this.bc = bc;
    this.fc = fc;
    this.fgColorHex = '#' + colorPalette.getHexString(this.fc);
    this.bgColorHex = '';
    if(this.bc !== -1) {
     this.bgColorHex = '#' + colorPalette.getHexString(this.bc);
    }

    /*
    // reverseY
    if(layer && layer.getType() == 'grid') {
      this.y = layer.getGridHeight() - y - 1;
    }
*/
    var displayX = this.x;
    var displayY = this.y;
    var html = '';
    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">XY:</label>';
    html += '<div class="gridinfo-value">' + displayX + ', ' + displayY + '</div>';
    html += '</div>';

/*
    if(layer && layer.getType() == 'grid') {
      var address = this.x + this.y * this.editor.graphic.getGridWidth();
      var addressHex = ("0000" + address.toString(16)).substr(-4);

      html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
      html += '<div class="gridinfo-value">';
      html += ' ' + address +  ' (0x' + addressHex + ')';
      html += '</div>';
      html += '</div>';
    }


    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">Tile:</label>';
    html += '<div class="gridinfo-value">' + this.tileIndex;
    
    var tileIndexHex = this.tileIndex.toString(16);
    html += ' (0x' + tileIndexHex + ')';
    

    html += '</div>';
    html += '</div>';

    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">FG Colour:</label>';
    
    html += '<div class="gridinfo-value">';
    
    html += '<div style="display: inline-block; width: 12px; height: 12px; margin-right: 3px; background-color:' + this.fgColorHex + ';"></div>';
    html += this.fc;
    html += '</div>';
    html += '</div>';

    html += '<div style="display: inline-block; width: 140px; overflow: hidden">';
    html += '<label class="gridinfo-label">BG colour:</label>';
    html += '<div class="gridinfo-value">';
    if(this.bc != -1) {
      html += '<div style="display: inline-block; width: 12px; height: 12px; margin-right: 3px; background-color:' + this.bgColorHex + ';"></div>';
      html += this.bc;
    } else {
      html += 'use frame';
    }
    html += '</div>';
    html += '</div>'
*/

    $('#gridinfo-coordinates').html(html);
  },


  //(cell.x, cell.y, cell.z, cellData.t, cellData.fc, cellData.bc);
  setInfo: function(x, y, z, tileIndex, fc, bc) {
    
    var layer = this.editor.layers.getSelectedLayerObject();
    var colorPalette = layer.getColorPalette();

    if(x == this.x && y == this.y && z == this.z && this.tileIndex == tileIndex && this.fc == fc && this.bc == bc) {
      return;
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.tileIndex = tileIndex;
    this.bc = bc;
    this.fc = fc;
    this.fgColorHex = '#' + colorPalette.getHexString(this.fc);
    this.bgColorHex = '';
    if(this.bc !== -1) {
     this.bgColorHex = '#' + colorPalette.getHexString(this.bc);
    }

    /*
    // reverseY
    if(layer && layer.getType() == 'grid') {
      this.y = layer.getGridHeight() - y - 1;
    }
*/
    var displayX = this.x;
    var displayY = this.y;
    var html = '';
    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">XY</label>';
    html += '<div class="gridinfo-value">' + displayX + ', ' + displayY + '</div>';
    html += '</div>';


    if(layer && layer.getType() == 'grid') {
      var address = this.x + this.y * this.editor.graphic.getGridWidth();
      var addressHex = ("0000" + address.toString(16)).substr(-4);

      html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
      html += '<div class="gridinfo-value">';
      html += ' ' + address +  ' (0x' + addressHex + ')';
      html += '</div>';
      html += '</div>';
    }


    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">Tile</label>';
    html += '<div class="gridinfo-value">' + this.tileIndex;
    
    var tileIndexHex = this.tileIndex.toString(16);
    html += ' (0x' + tileIndexHex + ')';
    

    html += '</div>';
    html += '</div>';

    html += '<div style="display: inline-block; width: 100px; overflow: hidden">';
    html += '<label class="gridinfo-label">FG Colour</label>';
    
    html += '<div class="gridinfo-value">';
    
    html += '<div style="display: inline-block; width: 12px; height: 12px; margin-right: 3px; background-color:' + this.fgColorHex + ';"></div>';
    html += this.fc;
    html += '</div>';
    html += '</div>';

    html += '<div style="display: inline-block; width: 140px; overflow: hidden">';
    html += '<label class="gridinfo-label">BG Colour</label>';
    html += '<div class="gridinfo-value">';
    if(this.bc != -1) {
      html += '<div style="display: inline-block; width: 12px; height: 12px; margin-right: 3px; background-color:' + this.bgColorHex + ';"></div>';
      html += this.bc;
    } else {
      html += 'use frame';
    }
    html += '</div>';
    html += '</div>'


    $('#gridinfo-coordinates').html(html);

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
    var zoomString = '<label class="gridinfo-label">Zoom</label>';
    zoomString += '<div class="gridinfo-value">';
    zoomString += zoom.toFixed(0) + '%';
    zoomString += '</div>';
    $('#gridInfoZoom').html(zoomString);
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
      case TextModeEditor.mode.RGB:
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