var ColorEditor = function() {
  this.uiComponent = null;


  this.rSliderCanvas = null;
  this.gSliderCanvas = null;
  this.bSliderCanvas = null;

  this.hSliderCanvas = null;
  this.sSliderCanvas = null;
  this.vSliderCanvas = null;

  this.colorIndex = false;
  this.visible = false;

  this.saveSouthSize = false;

  this.colorType = 'hsv';
}

ColorEditor.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  getVisible: function() {
    return this.visible;
  },

  setVisible: function(visible) {
    this.visible = visible;

    if(visible) {
      if(!this.editor.getColorPalettePanelVisible()) {
        this.editor.setColorPalettePanelVisible(true);
      }
    }

    UI("colorSplitPanel").setPanelVisible('south', this.visible);
    var southSize = UI('textModeEastPanel').getPanelSize({ 'panel': 'south' });
    var colorEditSize = 230;

    if(this.visible) {
      this.saveSouthSize = southSize;
      // editor is 180 pixels high, need to fit it in plus palette
      var newSouthSize = southSize;
      if(newSouthSize < 340) {
        newSouthSize = 340;
      }
      // the panel holding the colour palette and the editor
      UI('textModeEastPanel').resizeThePanel({ panel: 'south', size: newSouthSize });

      // the panel holding the colour editor
      UI('colorSplitPanel').resizeThePanel({ panel: 'south', size: colorEditSize });
    } else {
      var newSouthSize = southSize;
      if(this.saveSouthSize !== false) {
        newSouthSize = this.saveSouthSize;
      }
      
      // the panel holding the colour palette and the editor
      UI('textModeEastPanel').resizeThePanel({ panel: 'south', size: newSouthSize });

      // the panel holding the colour editor
      UI('colorSplitPanel').resizeThePanel({ panel: 'south', size: 0 });
    }

    // set the menu
    if(UI.exists('color-edit')) {
      if(visible) {
        UI('color-edit').setLabel('Hide Colour Editor');
      } else {
        UI('color-edit').setLabel('Show Colour Editor');
      }
    }


  },

  toggleVisible: function() {
    this.setVisible(!this.visible);
  },

  buildInterface: function(parentComponent) {
    var _this = this;
    var html = 'colour editor';
    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "colorEditorPanel" });
    UI.on('ready', function() {

      _this.uiComponent.load('html/textMode/colorEditor.html', function() {
        _this.htmlComponentLoaded();

        /*
        if (!Modernizr.cssscrollbar) {
          _this.scrollbar = new PerfectScrollbar('#colorPaletteHolder');
        }
        */
      });

    });

    this.uiComponent.on('resize', function() {
//      _this.colorPaletteResize();
    });

    parentComponent.add(this.uiComponent);
  },


  htmlComponentLoaded: function() {

    this.rSliderCanvas = document.getElementById('editColorRCanvas');
    this.gSliderCanvas = document.getElementById('editColorGCanvas');
    this.bSliderCanvas = document.getElementById('editColorBCanvas');


    this.hSliderCanvas = document.getElementById('editColorHCanvas');
    this.sSliderCanvas = document.getElementById('editColorSCanvas');
    this.vSliderCanvas = document.getElementById('editColorVCanvas');

    this.initEvents();
  },


  initEvents: function() {
    var _this = this;
    $('.colorEditorNumber').on('change', function(event) {
      var value = $(this).val();
      if(value == "") {
        value = "0";
      }
      value = parseInt(value, 10);

      var component = $(this).attr('data-component');

      if(!isNaN(value)) {
        switch(component) {
          case 'r':
            _this.setR(value);
          break;
          case 'g':
            _this.setG(value);
          break;
          case 'b':
            _this.setB(value);
          break;
          case 'h':
            _this.setH(value);
          break;
          case 's':
            _this.setS(value);
          break;
          case 'v':
            _this.setV(value);
          break;
        }
      }
    });

    $('.colorEditorNumber').on('keyup', function(event) {
      var value = parseInt($(this).val(), 10);
      if(!isNaN(value)) {
        var component = $(this).attr('data-component');
        switch(component) {
          case 'r':
            _this.setR(value);
          break;
          case 'g':
            _this.setG(value);
          break;
          case 'b':
            _this.setB(value);
          break;
          case 'h':
            _this.setH(value);
          break;
          case 's':
            _this.setS(value);
          break;
          case 'v':
            _this.setV(value);
          break;
        }
      }
    });



    $('.colorEditorSlider').on('mousedown', function(event) {
      var x = event.pageX - $(this).offset().left;
      var y = event.pageY - $(this).offset().top;

      var component = $(this).attr('data-component');


      switch(component) {
        case 'r':
          var value = Math.floor(255 * (x / $(this).width()));
          _this.setR(value);
        break;
        case 'g':
          var value = Math.floor(255 * (x / $(this).width()));
          _this.setG(value);
        break;
        case 'b':
          var value = Math.floor(255 * (x / $(this).width()));
          _this.setB(value);
        break;
        case 'h':
          var value = Math.floor(360 * (x / $(this).width()));
          _this.setH(value);
        break;
        case 's':
          var value = Math.floor(100 * (x / $(this).width()));
          _this.setS(value);
        break;
        case 'v':
          var value = Math.floor(100 * (x / $(this).width()));
          _this.setV(value);        
        break;



      }

      _this.activeSlider = this;
      UI.captureMouse(_this);



    });


    $('#editColorHex').on('keyup', function() {
      _this.setColorFromHex();
    });
    $('#editColorHex').on('change', function() {
      _this.setColorFromHex();
    });

    $('.colorEditorTab').on('click', function() {
      var colorType = $(this).attr('data-colortype');
      _this.setColorType(colorType);
    });

    $('#colorEditorCloseButton').on('click', function() {      
      //_this.setVisible(false);
      _this.editor.toggleColorEditor();
    });
  },


  setColorType: function(colorType) {
    this.colorType = colorType;


    if(colorType == 'rgb') {
      $('#colorEditorRGB').show();
      $('#colorEditorHSV').hide();
      $('#colorEditorTab-rgb').addClass('colorEditorTabActive');
      $('#colorEditorTab-hsv').removeClass('colorEditorTabActive');
    }

    if(colorType == 'hsv') {
      $('#colorEditorRGB').hide();
      $('#colorEditorHSV').show();
      $('#colorEditorTab-hsv').addClass('colorEditorTabActive');
      $('#colorEditorTab-rgb').removeClass('colorEditorTabActive');
    }
  },

  mouseMoveSlider: function(event) {
    var x = event.pageX - $(this.activeSlider).offset().left;
    var y = event.pageY - $(this.activeSlider).offset().top;

    var component = $(this.activeSlider).attr('data-component');

    var value = 0;

    if(component == 'r' || component == 'g' || component == 'b') {
      value = Math.floor(255 * (x / $(this.activeSlider).width()));
      if(value > 255) {
        value = 255;
      }

      if(value < 0) {
        value = 0;
      }
    }

    if(component == 'h') {
      value = Math.floor(360 * (x / $(this.activeSlider).width()));
      if(value > 360) {
        value = 360;
      }

      if(value < 0) {
        value = 0;
      }
    }

    if(component == 's' || component == 'v') {
      value = Math.floor(100 * (x / $(this.activeSlider).width()));
      if(value > 100) {
        value = 100;
      }

      if(value < 0) {
        value = 0;
      }
    }

    switch(component) {
      case 'r':
        this.setR(value);
      break;
      case 'g':
        this.setG(value);
      break;
      case 'b':
        this.setB(value);
      break;
      case 'h':
        this.setH(value);
      break;
      case 's':
        this.setS(value);
      break;
      case 'v':
        this.setV(value);
      break;
    }
  },


  setButtons: function(event) {
    if(typeof event.buttons != 'undefined') {
      this.buttons = event.buttons;
    } else {
      if(typeof event.which !== 'undefined') {
        this.buttons = event.which;

      } else if(typeof event.nativeEvent !== 'undefined') {
        if(typeof event.nativeEvent.which != 'undefined') {
          this.buttons = event.nativeEvent.which;
        }
        if(typeof event.nativeEvent.buttons != 'undefined') {
          this.buttons = event.nativeEvent.buttons;
        }
      }
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {

      this.buttons = UI.LEFTMOUSEBUTTON;
    }
    if(event.ctrlKey && (this.buttons & UI.LEFTMOUSEBUTTON)  ) {
      this.buttons = UI.RIGHTMOUSEBUTTON;
    }
    // cmd + click
    if(event.metaKey && this.buttons == 1) {
      this.buttons = UI.MIDDLEMOUSEBUTTON;
    }
  },

  mouseMove: function(event) {
//    var x = event.pageX - $('#colorPaletteFromImageImage').offset().left;
//    var y = event.pageY - $('#colorPaletteFromImageImage').offset().top;

    if(this.activeSlider !== false) {
      this.mouseMoveSlider(event);
    }

  
  },

  mouseUp: function(event) {

    this.mouseDownOnImage = false;

    this.activeSlider = false;

    if(!UI.isMobile.any()) {
      this.setButtons(event);
    } else {
      this.buttons = 0;
    }

    if(this.buttons & UI.LEFTMOUSEBUTTON) {
      this.leftMouseUp = false;
    } else {
      this.leftMouseUp = true;
    }

  },

  setR: function(r) {
    r = parseInt(r, 10);
    if(isNaN(r)) {
      return;
    }
    this.r = r;
    this.setRGB();
    this.updateHex();
    this.updatePaletteColor();
  },

  setG: function(g) {
    g = parseInt(g, 10);
    if(isNaN(g)) {
      return;
    }
    this.g = g;
    this.setRGB();
    this.updateHex();
    this.updatePaletteColor();
  },

  setB: function(b) {
    b = parseInt(b);
    if(isNaN(b)) {
      return;
    }
    this.b = b;
    this.setRGB();
    this.updateHex();
    this.updatePaletteColor();
  },

  setH: function(h) {
    h = parseInt(h, 10);
    if(isNaN(h)) {
      return;
    }
    this.h = h;
    this.setHSV();
    this.updateHex();
    this.updatePaletteColor();
  },

  setS: function(s) {
    s = parseInt(s, 10);
    if(isNaN(s)) {
      return;
    }
    this.s = s;
    this.setHSV();
    this.updateHex();
    this.updatePaletteColor();

  },

  setV: function(v) {
    v = parseInt(v, 10);
    if(isNaN(v)) {
      return;
    }
    this.v = v;
    this.setHSV();
    this.updateHex();
    this.updatePaletteColor();
  },

  updateHSVSlider: function(canvas, args) {

    var sliderContext = canvas.getContext('2d');
    sliderContext.clearRect(0, 0, canvas.width, canvas.height);
    var imageData = sliderContext.getImageData(0, 0, canvas.width, canvas.height);
    var colorHeight = canvas.height - 4;

    for(var y = 0; y < colorHeight; y++) {
      for(var x = 0; x < canvas.width; x++) {
        var amount = x / canvas.width;
        var pos = (y * canvas.width + x) * 4;

//        var r = Math.floor(args.fromR + (args.toR - args.fromR) * amount);
//        var g = Math.floor(args.fromG + (args.toG - args.fromG) * amount);
//        var b = Math.floor(args.fromB + (args.toB - args.fromB) * amount);

        var h = Math.floor(args.fromH + (args.toH - args.fromH) * amount);
        var s = Math.floor(args.fromS + (args.toS - args.fromS) * amount);
        var v = Math.floor(args.fromV + (args.toV - args.fromV) * amount);

        var rgb = hsv2rgb(h, s / 100, v / 100);

        imageData.data[pos] = Math.round(rgb[0]);
        imageData.data[pos + 1] = Math.round(rgb[1]);
        imageData.data[pos + 2] = Math.round(rgb[2]);
        imageData.data[pos + 3] = 255;
      }
    }

    sliderContext.putImageData(imageData, 0, 0);

    var cursorPos = (args.value) * canvas.width;

    sliderContext.globalAlpha = 0.6;
    sliderContext.strokeStyle = '#ffffff';
    sliderContext.beginPath();
    sliderContext.moveTo(cursorPos, 0);
    sliderContext.lineTo(cursorPos, canvas.height);
    sliderContext.stroke();
    sliderContext.globalAlpha = 1;


    sliderContext.fillStyle = '#ffffff';
    sliderContext.beginPath();
    sliderContext.moveTo(cursorPos, colorHeight);
    sliderContext.lineTo(cursorPos + 2, canvas.height);
    sliderContext.lineTo(cursorPos - 2, canvas.height);
    sliderContext.fill();
  },


  updateHSVSliders: function() {
    if(this.hSliderCanvas) {
      this.updateHSVSlider(this.hSliderCanvas, {
        fromH: 0, toH: 360,
        fromS: this.s, toS: this.s,
        fromV: this.v, toV: this.v,
        value: this.h / 360
      });
    }

    if(this.sSliderCanvas) {
      this.updateHSVSlider(this.sSliderCanvas, {
        fromH: this.h, toH: this.h,
        fromS: 0, toS: 100,
        fromV: this.v, toV: this.v,
        value: this.s / 100
      });
    }

    if(this.vSliderCanvas) {
      this.updateHSVSlider(this.vSliderCanvas, {
        fromH: this.h, toH: this.h,
        fromS: this.s, toS: this.s,
        fromV: 0, toV: 100,
        value: this.v / 100
      });
    }
  },

  updateRGBSlider: function(canvas, args) {
    if(!canvas) {
      return;
    }
    var sliderContext = canvas.getContext('2d');

    sliderContext.clearRect(0, 0, canvas.width, canvas.height);

    var imageData = sliderContext.getImageData(0, 0, canvas.width, canvas.height);
    var colorHeight = canvas.height - 4;



    for(var y = 0; y < colorHeight; y++) {
      for(var x = 0; x < canvas.width; x++) {
        var amount = x / canvas.width;
        var pos = (y * canvas.width + x) * 4;

        var r = Math.floor(args.fromR + (args.toR - args.fromR) * amount);
        var g = Math.floor(args.fromG + (args.toG - args.fromG) * amount);
        var b = Math.floor(args.fromB + (args.toB - args.fromB) * amount);

        imageData.data[pos] = r;
        imageData.data[pos + 1] = g;
        imageData.data[pos + 2] = b;
        imageData.data[pos + 3] = 255;
      }
    }

    sliderContext.putImageData(imageData, 0, 0);

    var cursorPos = (args.value / 255) * canvas.width;

    sliderContext.strokeStyle = '#ffffff';
    sliderContext.beginPath();
    sliderContext.moveTo(cursorPos, 0);
    sliderContext.lineTo(cursorPos, colorHeight);
    sliderContext.stroke();

    sliderContext.fillStyle = '#ffffff';
    sliderContext.beginPath();
    sliderContext.moveTo(cursorPos, colorHeight);
    sliderContext.lineTo(cursorPos + 2, canvas.height);
    sliderContext.lineTo(cursorPos - 2, canvas.height);
    sliderContext.fill();
  },



  updateRGBSliders: function() {
    this.updateRGBSlider(this.rSliderCanvas, {
      fromR: 0, toR: 255,
      fromG: this.g, toG: this.g,
      fromB: this.b, toB: this.b,
      value: this.r
    });

    this.updateRGBSlider(this.gSliderCanvas, {
      fromR: this.r, toR: this.r,
      fromG: 0, toG: 255,
      fromB: this.b, toB: this.b,
      value: this.g
    });

    this.updateRGBSlider(this.bSliderCanvas, {
      fromR: this.r, toR: this.r,
      fromG: this.g, toG: this.g,
      fromB: 0, toB: 255,
      value: this.b
    });

  },

  setHSV: function() {
    var rgb = hsv2rgb(this.h, this.s/100, this.v/100);
    this.r = Math.round(rgb[0]);
    this.g = Math.round(rgb[1]);
    this.b = Math.round(rgb[2]);

    this.rgb = ((this.r & 0xff) << 16) + ((this.g & 0xff) << 8) + ((this.b & 0xff));

    this.updateColorSliders();

  },

  setColor: function(colorIndex) {
    var screenMode = this.editor.getScreenMode();

    if(screenMode ==  TextModeEditor.Mode.NES) {
      // colour is the subpalette
      var subPalette = colorIndex;
      var subPaletteColor = this.editor.colorPaletteManager.colorSubPalettes.getCurrentPaletteColor();
      if(typeof subPaletteColor !== 'undefined') {
        colorIndex = this.editor.colorPaletteManager.colorSubPalettes.getPaletteColor(subPalette, subPaletteColor);
      }
    } 


    this.colorIndex = colorIndex;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }
    var rgb = colorPalette.getHex(colorIndex);
    this.setRGB(rgb);
    this.updateHex();
  },

  updatePaletteColor: function() {
    
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    colorPalette.setColorRGB(this.colorIndex, this.rgb);

    this.editor.currentTile.setColor(this.colorIndex, { force: true, update: false });
    this.editor.colorPalettePanel.colorPaletteUpdate({ updateMap: false });

    this.editor.graphic.invalidateAllCells();

    var mode = "textmode"; // or sprite
    if(g_app.getPref(mode + ".tilePaletteVisible") != "no") {
      this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(g_app.getPref(mode + ".sideTilePaletteVisible") == "yes") {
      this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }
  },

  setRGB: function(rgb) {

    if(typeof rgb == 'undefined') {
      this.rgb = ((this.r & 0xff) << 16) + ((this.g & 0xff) << 8) + ((this.b & 0xff));
    } else {
      this.rgb = rgb;
      this.r = (rgb & 0xff0000) >> 16;
      this.g = (rgb >> 8) & 0xff;
      this.b = (rgb) & 0xff;
    }


    this.rgb = ((this.r & 0xff) << 16) + ((this.g & 0xff) << 8) + ((this.b & 0xff));


    var hsvValuesCorrect = false;
    // do the hsv colours already map to this rgb value?
    if(this.colorType == 'hsv') {
      var hsvRGB = hsv2rgb(this.h, this.s/100, this.v/100);
      var r = Math.round(hsvRGB[0]);
      var g = Math.round(hsvRGB[1]);
      var b = Math.round(hsvRGB[2]);
      hsvRGB = ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff));

      if(hsvRGB == rgb) {
        hsvValuesCorrect = true;
      }
    }

    if(!hsvValuesCorrect) {
      var hsv = rgb2hsv(this.r, this.g, this.b);

      this.h = Math.round(hsv[0] * 360);
      this.s = Math.round(hsv[1] * 100);
      this.v = Math.round(hsv[2] * 100);
    }

    this.updateColorSliders();
  },

  setColorFromHex: function() {
    var value = $('#editColorHex').val();
    value = parseInt(value, 16);
    if(isNaN(value)) {
      return;
    }

    this.setRGB(value);
    this.updatePaletteColor();

//    this.updateColorSliders();

  },

  updateHex: function() {

    if(!$('#editColorHex').is(':focus')) {
      var colorHexString = ("000000" + this.rgb.toString(16)).substr(-6);
      $('#editColorHex').val(colorHexString);
    }
  },

  updateColorSliders: function() {

    $('#editColorR').val(this.r);
    $('#editColorG').val(this.g);
    $('#editColorB').val(this.b);


    $('#editColorH').val(this.h);
    $('#editColorS').val(this.s);
    $('#editColorV').val(this.v);



//    this.setSelectedColor(this.rgb);

    this.updateRGBSliders();
    this.updateHSVSliders();
  },
}  