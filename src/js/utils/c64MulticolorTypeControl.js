var C64MulticolorTypeControl = function() {
  this.elementId = false;
  this.editor = null;

  this.colorTypeSelectedHander = false;
}

C64MulticolorTypeControl.prototype = {
  init: function(editor, args) {
    this.editor = editor;
    this.elementId = args.elementId;
    this.writeHTML();
  },

  on: function(eventName, f) {
    switch(eventName) {
      case 'colortypeselected':
        this.colorTypeSelectedHander = f;
      break;
    }
  },

  writeHTML: function() {
    var html = '';

    html += '<div class="tileEditorC64ColorType tileEditorC64ColorType_background" data-type="background">';
    html += '  <div class="tileEditorC64Color backgroundColorDisplay" data-type="background" id="tileEditorC64Color-background"></div>';
    html += '<span class="tileEditorC64ColorLabel">&nbsp;Frame';
    if(!UI.isMobile.any()) {
      html += ' (1)';
    }
    html += '</span>';
    html += '</div>';
    html += '<div class="tileEditorC64ColorType tileEditorC64ColorType_cell" data-type="cell">';
    html += '<div class="tileEditorC64Color foregroundColorDisplay tileEditorC64Color-cell"  data-type="cell"></div>';
    html += '<span class="tileEditorC64ColorLabel">&nbsp;Cell';
    if(!UI.isMobile.any()) {
      html += ' (2)'
    }
    html += '</span>';
    html += '</div>';
    html += '<div class="tileEditorC64ColorType tileEditorC64ColorType_multi1" data-type="multi1"> ';
    html += '<div class="tileEditorC64Color c64Multi1ColorDisplay tileEditorC64Color-multi1"  data-type="multi1"></div>';
    html += '<span class="tileEditorC64ColorLabel">&nbsp;Multi 1';
    if(!UI.isMobile.any()) {
      html += ' (3)';
    }
    html += '</span>';
    html += '</div>';
    html += '<div class="tileEditorC64ColorType tileEditorC64ColorType_multi2" data-type="multi2"> ';
    html += '<div class="tileEditorC64Color c64Multi2ColorDisplay tileEditorC64Color-multi2" data-type="multi2" ></div>';
    html += '<span class="tileEditorC64ColorLabel">&nbsp;Multi 2';
    if(!UI.isMobile.any()) {
      html += ' (4)';
    }
    html += '</span>';
    html += '</div>';


    $('#' + this.elementId).html(html);
    this.initEvents();

  },

  initEvents: function() {

    var _this = this;

    $('#' + this.elementId + ' .tileEditorC64Color').on('click', function(event) {
      var colorType = $(this).attr('data-type');
      _this.showColorPicker(event, colorType);

      event.preventDefault();

    });

    $('#' + this.elementId + ' .tileEditorC64ColorType').on('click', function(event) {
      var colorType = $(this).attr('data-type');


      _this.selectC64ColorType(colorType);

    });
  },


  showColorPicker: function(event, colorType) {
    var args = {};

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer) {
      return;
    }
    args.currentColor = 0;
    switch(colorType) {
      case 'cell':
        args.currentColor  = this.editor.currentTile.getColor();
        args.type = 'cellcolor';

      break;
      case 'background':
        args.currentColor  = layer.getBackgroundColor();
        args.type = 'background';
        args.hasNone = true;
      break;
      case 'multi1':
        args.currentColor  = layer.getC64Multi1Color();
        args.type = 'multi1';
      break;
      case 'multi2':
        args.currentColor  = layer.getC64Multi2Color();
        args.type = 'multi2';
      break;
    }

    args.colorPickedCallback = function(color) {
      switch(colorType) {
        case 'background':
          this.editor.setBackgroundColor(color);
          break;
        case 'cell':
          this.editor.currentTile.setColor(color);
          break;
        case 'multi1':
          this.editor.setC64Multi1Color(color);
          break;
        case 'multi2':
          this.editor.setC64Multi2Color(color);
          break;
      }
    }

    if(UI.isMobile.any()) {
      this.editor.colorPaletteManager.showColorPickerMobile(args);
    } else {
      var x = event.pageX;
      var y = event.pageY;
      this.editor.colorPaletteManager.showColorPicker(x, y, args);
    }
  },

  selectC64ColorType: function(colorType) {
    this.editor.tools.drawTools.pixelDraw.setC64MultiColorType(colorType);

    if(this.colorTypeSelectedHander !== false) {
      this.colorTypeSelectedHander(colorType);//, colorIndex);
    }
  }
}