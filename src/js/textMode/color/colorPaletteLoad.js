var ColorPaletteLoad = function() {
  this.importImage = null;
  this.paletteCanvas = null;

  this.colorPaletteDisplay = null;

  this.colorsAcross = 8;
  this.importColors = 16;

  this.colorMap = [];

  this.editor = null;

  this.loadMap = false;
  this.ase = null;
  this.aco = null;

  this.visible = false;

  this.callback = false;
  this.dialogReadyCallback = false;

  this.parentComponent = null;

  this.colorPaletteLoadFromURL = null;

  this.name = '';
}

ColorPaletteLoad.prototype = {
  init: function(editor, parentComponent) {
    this.editor = editor;

    if(typeof parentComponent != 'undefined') {
      this.parentComponent = parentComponent;
    }
  },

  show: function(args) {
    if(typeof args != 'undefined') {
      if(typeof args.dialogReadyCallback != 'undefined') {
        this.dialogReadyCallback = args.dialogReadyCallback;
      }
    }

    var _this = this;
    if(this.uiComponent == null) {

      if(this.parentComponent == null) {
        this.uiComponent = UI.create("UI.Dialog", 
          { "id": "colourPaletteLoadDialog", "title": "Colour Palette Load", "width": 384 });
      } else {
        this.uiComponent = this.parentComponent;
      }

      this.colorPaletteLoadPanel = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.colorPaletteLoadPanel);
      this.colorPaletteLoadPanel.load('html/textMode/colorPaletteLoad.html', function() {
        _this.htmlComponentLoaded();
        _this.initContent();
        _this.initEvents();

        if(_this.dialogReadyCallback != false) {
          _this.dialogReadyCallback();
        }
      });

      if(!this.parentComponent) {
        this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
        this.uiComponent.addButton(this.okButton);
        this.okButton.on('click', function(event) {
          _this.setPalette();
          UI.closeDialog();
        });

        this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
        this.uiComponent.addButton(this.closeButton);
        this.closeButton.on('click', function(event) {
          UI.closeDialog();
        });

        this.uiComponent.on('close', function() {
          _this.visible = false;
        });
      }


      if(this.parentComponent == null) {
        UI.showDialog("colourPaletteLoadDialog");
      }
      this.visible = true;
  
    } else {
      this.initContent();

      if(this.parentComponent == null) {
        UI.showDialog("colourPaletteLoadDialog");
      }

      this.visible = true;
  
      if(_this.dialogReadyCallback != false) {
        _this.dialogReadyCallback();
      }
    }

  },

  initContent: function() {
    if(this.colorPaletteDisplay == null) {
      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { canvasElementId: 'colorPaletteLoadPreview' });
    }
    this.sortMethod = $('#colorPaletteLoadColorsSortMethod').val();
  },

  htmlComponentLoaded: function() {
    this.paletteCanvas = document.getElementById('colorPaletteLoadPreview');
  },

  initEvents: function() {
    var _this = this;

    $('#colorPaletteLoadURLButton').on('click', function(event) {
      var url = $('#colorPaletteLoadURL').val();
      _this.loadPaletteFromURL(url);
    });


    $('#colorPaletteFileChoose').on('click', function() {
      $('#colourPaletteFile').click();
    });

    $('#colorPaletteLoadLospec').on('click', function() {
      _this.loadLospecPalette();
    });


    $('#colorPaletteLoadColorsAcross').on('keyup', function(event) {
      var colorsAcross = parseInt($('#colorPaletteLoadColorsAcross').val(), 10);
      if(!isNaN(colorsAcross)) {
        _this.setColorsAcross(colorsAcross);
      }
    });

    $('#colorPaletteLoadColorsAcross').on('change', function(event) {
      var colorsAcross = parseInt($('#colorPaletteLoadColorsAcross').val(), 10);
      if(!isNaN(colorsAcross)) {
        _this.setColorsAcross(colorsAcross);
      }
    });

/*
    $('#colorPaletteLoadColorsSortMethod').on('change', function(event) {
      _this.sortMethod = $('#colorPaletteLoadColorsSortMethod').val();
      _this.sortColors();
    });
*/
    $('#colorPaletteLoadUserColorCount').on('change', function(event) {
      var colorCount = parseInt($(this).val(), 10);
      if(!isNaN(colorCount)) {
        _this.setColorCount(colorCount);
      }

    });

    $('#colorPaletteLoadUserColorCount').on('keyup', function(event) {
      var colorCount = parseInt($(this).val(), 10);
      if(!isNaN(colorCount)) {
        _this.setColorCount(colorCount);
      }
    });

    document.getElementById('colourPaletteFile').addEventListener("change", function(e) {
      var file = document.getElementById('colourPaletteFile').files[0];
      _this.setImportFile(file);
    });

  },

  loadLospecPalette: function() {
    if(this.colorPaletteLoadFromURL == null) {
      this.colorPaletteLoadFromURL = new ColorPaletteLoadFromURL();
    }

//    console.log('load palette from url' + url);
    var _this = this;
    this.colorPaletteLoadFromURL.show({
      callback: function(response) {
        _this.createPaletteFromLoSpec(response.response);
      }
    });

  },

  loadPaletteFromURL: function(url) {
    if(this.colorPaletteLoadFromURL == null) {
      this.colorPaletteLoadFromURL = new ColorPaletteLoadFromURL();
    }

    console.log('load palette from url' + url);
    var _this = this;
    this.colorPaletteLoadFromURL.loadURL({
      url: url,
      callback: function(response) {
        _this.createPaletteFromLoSpec(response.response);
      }
    });

  },

  createPaletteFromLoSpec: function(data) {
    this.name = data.name;
    var author = data.author;
    var colors = [];
    
    for(var i = 0; i < data.colors.length; i++) {
      var color = parseInt(data.colors[i], 16);
      if(!isNaN(color)) {
        colors.push(color);
      }
    }
    
    if(colors.length > 0) {
      this.colors = colors;
      this.setAlpha();

      if(this.callback) {
        this.callback(this.colors);
      }

      if(this.visible) {
        this.setColorCount(colors.length);

        this.autoColorsAcross();
        this.updatePreviewPalette();
      }
    }
  },


  setPalette: function(args) {
    var callback = false;
    
    if(typeof args != 'undefined') {
      callback = args.callback;
    }

    var colorPaletteManager = this.editor.colorPaletteManager;

    var colorPaletteCreated = false;
    var colorPalette = colorPaletteManager.getCurrentColorPalette();

    if(colorPalette == null || (typeof args.createColorPalette != 'undefined' && args.createColorPalette)) {
      colorPaletteCreated = true;
      colorPalette = new ColorPalette();
    }

    var colorsDown = Math.ceil(this.colors.length / this.colorsAcross);
    colorPalette.setColors(this.colors, this.colorsAcross, colorsDown);

    if(colorPaletteCreated) {
      if(callback) {
        callback({
          colorPaletteCreated: true,
          colorPalette: colorPalette,          
          presetId: false,
          description: { "name": this.name }
//          description: { "name": tileSet.label },
//          mode: this.importArgs.mode

        });
      }
    } else {
      colorPalette.clearPaletteMaps();
      if(this.loadMap) {
        var colorMapId = colorPalette.setColorPaletteMap('Default Layout', this.colorMap);
        colorPalette.setCurrentColorMap(colorMapId);
      }
      colorPalette.paletteChanged();

      if(g_app.getMode() == 'color palette') {
        g_app.colorPaletteEditor.draw();
      }
    }

  },

  setColorsAcross: function(colorsAcross) {
    this.colorsAcross = colorsAcross;
    this.updatePreviewPalette();
  },

  autoColorsAcross: function() {
    this.colorsAcross = 16;
    if(this.colors.length <= 8) {
      this.colorsAcross = 4;
    } else if(this.colors.length <= 16) {
      this.colorsAcross = 16;
    }
    $('#colorPaletteLoadColorsAcross').val(this.colorsAcross);
  },

  createColorMap: function() {
    var colorsAcross = this.colorsAcross;
    var colorCount = this.importColors;
    var colorsDown = Math.ceil(this.importColors / colorsAcross);
    if(colorCount > this.colors.length) {
      colorCount = this.colors.length;
    }

    var index = 0;
    this.colorMap = [];
    for(var y = 0; y < colorsDown; y++) {
      this.colorMap[y] = [];
      for(var x = 0; x < colorsAcross; x++) {
        if(index < colorCount) {
          this.colorMap[y][x] = index;
        } else {
          this.colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }
        index++;
      }
    }
  },


  setImportFile: function(file, callback) {
    if(typeof file == 'undefined') {
      return;
    }

    if(typeof callback != 'undefined') {
      this.callback = callback;
    }

    var filename = file.name;
    this.name = filename;
    $('#colorPaletteFileChooseName').html(filename);
    var extension = filename.split('.').pop().toLowerCase();
    this.loadMap = false;

    if(extension == 'png' || extension == 'jpg' || extension == 'gif') {
      this.loadPNG(file);
    }

    if(extension == 'ase') {
      this.loadASE(file);
    }

    if(extension == 'aco') {
      this.loadACO(file);
    }

    if(extension == 'txt' || extension == 'hex') {
      this.loadTXT(file);
    }


    if(extension == 'vpl') {
      this.loadVPL(file);
    }

    if(extension == 'gpl') {
      this.loadGPL(file);
    }

    if(extension == 'act') {
      this.loadBinary(file);
    }

    if(extension == 'json') {
      this.loadJSON(file);
    }

  },

  loadPNG: function(file) {
    if(!this.importImage) {
      this.importImage = new Image();
    }

    var _this = this;
    this.importImage.onload = function() {
      _this.createPaletteFromImage();      
    }

    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    this.importImage.src = src;

  },

  loadTXT: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var colorText = e.target.result;
      _this.createPaletteFromPaintTxt(colorText);

    }
    fileReader.readAsText(file);
  },

  loadVPL: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var colorText = e.target.result;
      _this.createPaletteFromVPL(colorText);

    }
    fileReader.readAsText(file);

  },

  loadGPL: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var colorText = e.target.result;
      _this.createPaletteFromGPL(colorText);

    }
    fileReader.readAsText(file);
  },

  loadACO: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      _this.createPaletteFromACO(new Uint8Array(e.target.result));
    }
  //  fileReader.readAsText(file);
    fileReader.readAsArrayBuffer(file);


  },
  loadASE: function(file) {
    if(this.ase == null) {
      this.ase = new ASE();
    }

    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      _this.createPaletteFromASE(new Uint8Array(e.target.result));
    }
  //  fileReader.readAsText(file);
    fileReader.readAsArrayBuffer(file);
  },

  loadBinary: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      _this.createPaletteFromBinary(new Uint8Array(e.target.result));
    }
    fileReader.readAsArrayBuffer(file);    
  },


  errorMessage: function(message) {
    $('#colorPaletteLoadError').html(message);
    if(message != '') {
      $('#colorPaletteLoadError').show();
    } else {
      $('#colorPaletteLoadError').hide();
    }

  },


  loadJSON: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      var colorText = e.target.result;
      _this.createPaletteFromJSON(colorText);

    }
    fileReader.readAsText(file);
  },

  setAlpha: function() {
    for(var i = 0; i < this.colors.length; i++) {
      var alpha = (0xff) >>> 0;
      var color = (this.colors[i]) >>> 0;
      this.colors[i] = ((alpha << 24) | color) >>> 0;
    }
  },

  createPaletteFromJSON: function(jsonString) {
    var colorJson = {};
    try {
      colorJson = $.parseJSON(jsonString);
      if(typeof colorJson.colorPalette != 'undefined') {
        colorJson = colorJson.colorPalette;
      }

      var colors = [];
      if(typeof colorJson.data != 'undefined') {
        for(var i = 0; i < colorJson.data.length; i++) {
          colors.push(colorJson.data[i]);
        }
      }

      if(typeof colorJson.across != 'undefined') {
        this.colorsAcross = colorJson.across;
        $('#colorPaletteLoadColorsAcross').val(this.colorsAcross);

      } else {
        this.autoColorsAcross();
      }


      if(typeof colorJson.maps != 'undefined' && colorJson.maps.length > 0) {
        this.loadMap = true;
        this.colorMap = [];
        var srcMap = colorJson.maps[0];


        for(var y = 0; y < srcMap.map.length; y++) {
          this.colorMap[y] = [];
          for(var x = 0; x < srcMap.map[y].length; x++) {
            this.colorMap[y][x] = srcMap.map[y][x];
          }
        }
      } else {
        this.loadMap = false;
      }

      if(colors.length > 0) {
        this.colors = colors;
        this.setColorCount(colors.length);

        if(this.callback) {
          this.callback(this.colors);
        }

        
        if(this.visible) {
          this.updatePreviewPalette();
        }
        this.errorMessage('');
      } else {
        this.errorMessage('No colours found');

      }
    } catch(err) {
      this.errorMessage('Sorry, unable to interpret file');
    }

  },

  createPaletteFromASE: function(data) {
    if(this.ase == null) {
      this.ase = new ASE();
    }

    var colors = this.ase.readPalette(data);
    if(colors === false) {
      //console.log('no colours');
      this.errorMessage('No colours found');
      return;
    }

    this.colors = colors;
    this.setAlpha();

    if(this.callback) {
      this.callback(this.colors);
    }


    if(this.visible) {
      this.setColorCount(colors.length);
      this.autoColorsAcross();
      this.updatePreviewPalette();
      this.errorMessage('');
    }
  },

  createPaletteFromACO: function(data) {
    if(this.aco == null) {
      this.aco = new ACO();
    }
    var colors = this.aco.readPalette(data);
    if(colors === false) {
//      console.log('no colours');
      this.errorMessage('No colours found');
      return;
    }

    this.colors = colors;
    this.setAlpha();

    if(this.callback) {
      this.callback(this.colors);
    }


    if(this.visible) {
      this.setColorCount(colors.length);

      this.autoColorsAcross();    
      this.updatePreviewPalette();
      this.errorMessage('');
    }

  },
  createPaletteFromImage: function() {
    var colorPaletteManager = null;
    if(this.editor) {
      colorPaletteManager = this.editor.colorPaletteManager;
    } else if(g_app && g_app.textModeEditor) {
      colorPaletteManager = g_app.textModeEditor.colorPaletteManager;
    }

    if(!colorPaletteManager) {
      console.log('couldnt find color palette manager');
      return;
    }
 
    var colors = colorPaletteManager.colorPaletteFromPaletteImg(this.importImage);

    this.colors = colors.colors;
    this.setAlpha();

    if(this.callback) {
      this.callback(this.colors);
    }

    if(this.visible) {
      if(colors.map !== false) {
        this.loadMap = true;
        this.colorMap = colors.map;
      } else {
        this.loadMap = false;
      }

      this.setColorCount(this.colors.length);

      this.colorsAcross = colors.colorsAcross;
      this.updatePreviewPalette();
    }
  },

  createPaletteFromVPL: function(data) {
    var colors = [];
    data = data.replace("\r", "");
    var lines = data.split("\n");
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if(line.length > 0) {
        if(line[0] == '#') {
          // its a comment
        } else {
          parts = line.split(' ');
          if(parts.length >= 3) {
            var red = parseInt(parts[0], 16);
            var green = parseInt(parts[1], 16);
            var blue = parseInt(parts[2], 16);
            if(!isNaN(red) && !isNaN(green) && !isNaN(blue)) {
              var rgb = (red << 16) + (green << 8) + (blue);
              colors.push(rgb);
            }
          }

          /*
          if(line.length == 8) {
            // its ARGB
            var rgb = line.substring(2);
            var color = parseInt(rgb, 16);
            if(!isNaN(color)) {
              colors.push(color);
            }
          } else if(line.length == 6) {
            // its RGB
            var color = parseInt(line, 16);
            if(!isNaN(color)) {
              colors.push(color);
            }
          }
          */
        }
      }
    }
    if(colors.length > 0) {
      this.colors = colors;
      this.setAlpha();

      if(this.callback) {
        this.callback(this.colors);
      }
      
      if(this.visible) {
        this.setColorCount(colors.length);
        if(colors.length == 16) {

          this.colorsAcross = 8;
          $('#colorPaletteLoadColorsAcross').val(this.colorsAcross);

        } else {
          this.autoColorsAcross();
        }
        this.updatePreviewPalette();
      }
    }

  },

  createPaletteFromPaintTxt: function(data) {
    var colors = [];
    data = data.replace("\r", "");
    var lines = data.split("\n");
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if(line.length > 0) {
        if(line[0] == ';') {
          // its a comment
        } else {
          if(line.length == 8) {
            // its ARGB
            var rgb = line.substring(2);
            var color = parseInt(rgb, 16);
            if(!isNaN(color)) {
              colors.push(color);
            }
          } else if(line.length == 6) {
            // its RGB
            var color = parseInt(line, 16);
            if(!isNaN(color)) {
              colors.push(color);
            }
          }
        }
      }
    }
    if(colors.length > 0) {
      this.colors = colors;
      this.setAlpha();

      if(this.callback) {
        this.callback(this.colors);
      }

      if(this.visible) {
        this.setColorCount(colors.length);

        this.autoColorsAcross();
        this.updatePreviewPalette();
      }
    }
  },

/*
There is no version number written in the file. The file is 768 or 772 bytes long and contains 256 RGB colors. The first color in the table is index zero. There are three bytes per color in the order red, green, blue. If the file is 772 bytes long there are 4 additional bytes remaining. Two bytes for the number of colors to use. Two bytes for the color index with the transparency color to use. If loaded into the Colors palette, the colors will be installed in the color swatch list as RGB colors.
*/
  createPaletteFromBinary: function(data) {
    var colors = [];
    var colorLength = 3;
    for(var i = 0; i < data.length; i += colorLength) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      if(!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        var color = (r << 16) + (g << 8) + b;
        colors.push(color);
      }
    }

    if(colors.length > 0) {
      this.colors = colors;
      this.setAlpha();

      if(this.callback) {
        this.callback(this.colors);
      }

      if(this.visible) {
        this.setColorCount(colors.length);

        this.autoColorsAcross();
        this.updatePreviewPalette();
      }
    }

  },

  createPaletteFromGPL: function(data) {
    var colors = [];
    data = data.trim().replace("\r", "");
    var lines = data.split("\n");
    // should be magic at the start
    if(lines.length == 0) {
      return;
    }

    if(lines[0] != 'GIMP Palette') {
      //unknown format
      //console.log('unknown palette format: ' + lines[0]);
      this.errorMessage('Unknown palette format: ' + lines[0]);
      return;
    }

    for(var i = 1; i < lines.length; i++) {
      var line = lines[i].trim();
      if(line[0] == '#') {
        // is a comment
      } else {
        var parts = line.split(/[\s,\t\n]+/);
        if(parts.length >= 3) {
          var r = parseInt(parts[0]);
          var g = parseInt(parts[1]);
          var b = parseInt(parts[2]);
          
          if(!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            var color = (r << 16) + (g << 8) + b;
            colors.push(color);
          }
        }
      }
    }

    if(colors.length > 0) {
      this.colors = colors;
      this.setAlpha();

      if(this.callback) {
        this.callback(this.colors);
      }


      if(this.visible) {
        this.autoColorsAcross();
        this.setColorCount(colors.length);

        this.updatePreviewPalette();
      }
    }


  },

  getColors: function() {
    return this.colors;
  },

  setColorCount: function(colorCount) {
    if(colorCount > 256) {
      colorCount = 256;
    }
    this.importColors = colorCount;
    $('#colorPaletteLoadUserColorCount').val(colorCount);

    this.updatePreviewPalette();
  },


  updatePreviewPalette: function() {
    if(!this.loadMap) {
      this.createColorMap();
    }

    $('#colorPaletteLoadColorsAcross').val(this.colorsAcross);
    this.colorPaletteDisplay.setColors(this.colors, { colorCount: this.importColors, colorMap: this.colorMap });
    $('#colorPaletteLoadSettings').show();
    $('#colorPaletteLoadColorCount').html(this.colors.length);    
  }

}