var ChooseColorsDialog = function() {
  this.editor = null;
  this.canvas = null;
  this.context = null;
  this.callback = null;

  this.colorChosen = [];

  this.uiComponent = null;
  this.colorPaletteDisplay =  null;

  this.mouseMode = '';

}

ChooseColorsDialog.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  initColorPaletteDisplay: function() {
    var _this = this;

    if(this.colorPaletteDisplay == null) {

      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { "canvasElementId": "chooseColorsCanvas",  "canSelectWithRightMouseButton": false, "canSelectMultiple": true   });

      this.colorPaletteDisplay.on('colorselected', function(event) {
        if(event.colorIndex == 0) {
          var color = event.color;
        }
      });

      this.colorPaletteDisplay.on('highlightchanged', function(event) {
        _this.highlightedColor = event.color;
      });
    }

  },


  show: function(args) {

    this.message = false;
    if(typeof args.message != 'undefined') {
      this.message = args.message;
    }

    if(this.uiComponent == null) {

      var _this = this;

      this.callback = false;

      var html = '<div class="panelFill">';

      html += '<div id="chooseColorsMessage"></div>';

      html += '<div style="padding: 2px">';
      html += '<canvas width="144" height="36" id="chooseColorsCanvas" style="background-color: #222222"></canvas>';
      html += '<div style="padding-top: 2px">';
      html += '<div class="ui-button" id="chooseColorsClearSelection">Clear Selection</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';

      this.uiComponent = UI.create("UI.Dialog", { "id": "chooseColorsDialog", "title": "Choose Colors", "width": 200 });

      this.htmlComponent = UI.create("UI.HTMLPanel", {"html": html});
      this.uiComponent.add(this.htmlComponent);
      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        if(_this.callback) {
          _this.callback(_this.colorPaletteDisplay.getSelectedColors());
        }
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.initContent(args);
      this.initEvents();
    } else {
      this.initContent(args);
    }

    UI.showDialog("chooseColorsDialog");

//    this.drawColors();    

  },

  initContent: function(args) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();    


    for(var i = 0; i < colorPalette.getColorCount(); i++) {
      this.colorChosen[i] = false;
    }


    if(this.colorPaletteDisplay == null) {
      this.initColorPaletteDisplay();
    }

    var colors = [];
    var colorCount = colorPalette.getColorCount();
    for(var i = 0; i < colorCount; i++) {
      colors.push(colorPalette.getHex(i));
    }


    // work out the width and height of colours
    var colorMap = colorPalette.getCurrentColorMap();
    var colorsAcross = 8;
    var colorsDown = 8;
    if(colorMap.length > 0 && colorMap[0].length > 0) {
      colorsAcross = colorMap[0].length;
      colorsDown = colorMap.length;
    }
    var colorWidth = 26;
    var colorHeight = 26;
    if(colorsAcross > 12 || colorsDown > 12) {
      colorWidth = 20;
      colorHeight = 20;
    }
    this.colorPaletteDisplay.setColorSize(colorWidth, colorHeight);


    this.colorPaletteDisplay.setColors(colors, { colorMap: colorPalette.getCurrentColorMap() });

    if(typeof args != 'undefined'){
      if(typeof args.callback != 'undefined') {
        this.callback = args.callback;
      }

      if(typeof args.colors != 'undefined') {
        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();    

        this.colorPaletteDisplay.setSelectedColors(args.colors);
      }
    }


    var colorDisplayWidth = this.colorPaletteDisplay.getWidth();
    var colorDisplayHeight = this.colorPaletteDisplay.getHeight();

    var dialogWidth = colorDisplayWidth + 8 + 6;//this.canvas.width + 18;
    if(dialogWidth < 180) {
      dialogWidth = 180;
    }
    var dialogHeight = colorDisplayHeight + 78 + 6;//this.canvas.height + 52;

    if(this.message !== false) {
      $('#chooseColorsMessage').html(this.message);
      $('#chooseColorsMessage').show();
      dialogHeight += 20;
    } else {
      $('#chooseColorsMessage').html('');
      $('#chooseColorsMessage').hide();
    }
    UI('chooseColorsDialog').setWidth(dialogWidth);
    UI('chooseColorsDialog').setHeight(dialogHeight);

  },

  clearSelection: function() {
    this.colorPaletteDisplay.setSelectedColors([]);
    this.colorPaletteDisplay.draw()
  },

  initEvents: function() {
    var _this = this;

    $('#chooseColorsClearSelection').on('click', function(event) {
      _this.clearSelection();
    });
  },

}
