// https://medium.com/@bantic/hand-coding-a-color-wheel-with-canvas-78256c9d7d43
// hand code color whee;


// https://twitter.com/beast_pixels/status/1007953732632567808

function xy2polar(x, y) {
  var r = Math.sqrt(x*x + y*y);
  var phi = Math.atan2(y, x);
  return [r, phi];
}

function polar2xy(r, phi) {
  var x = r * Math.cos(phi);
  var y = r * Math.sin(phi);

  return [x,y];
}

// rad in [-Ï€, Ï€] range
// return degree in [0, 360] range
function rad2deg(rad) {
  return ((rad + Math.PI) / (2 * Math.PI)) * 360;
}


// hue in range [0, 360]
// saturation, value in range [0,1]
// return [r,g,b] each in range [0,255]
// See: https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV

function hsv2rgb(hue, saturation, value) {
  var chroma = value * saturation;
  var hue1 = hue / 60;
  var x = chroma * (1- Math.abs((hue1 % 2) - 1));
  var r1, g1, b1;
  if (hue1 >= 0 && hue1 <= 1) {
    r1 = chroma;
    g1 = x;
    b1 = 0;
//    ([r1, g1, b1] = [chroma, x, 0]);
  } else if (hue1 >= 1 && hue1 <= 2) {
    r1 = x;
    g1 = chroma;
    b1 = 0;
//    ([r1, g1, b1] = [x, chroma, 0]);
  } else if (hue1 >= 2 && hue1 <= 3) {
    r1 = 0;
    g1 = chroma;
    b1 = x;
//    ([r1, g1, b1] = [0, chroma, x]);
  } else if (hue1 >= 3 && hue1 <= 4) {
    r1 = 0;
    g1 = x;
    b1 = chroma;

//    ([r1, g1, b1] = [0, x, chroma]);
  } else if (hue1 >= 4 && hue1 <= 5) {
    r1 = x;
    g1 = 0;
    b1 = chroma;
//    ([r1, g1, b1] = [x, 0, chroma]);
  } else if (hue1 >= 5 && hue1 <= 6) {
    r1 = chroma;
    g1 = 0;
    b1 = x;
//    ([r1, g1, b1] = [chroma, 0, x]);
  }
  
  var m = value - chroma;
//  var [r,g,b] = [r1+m, g1+m, b1+m];
  var r = r1+m;
  var g = g1+m;
  var b = b1+m;
  
  // Change r,g,b values from [0,1] to [0,255]
  return [255*r,255*g,255*b];
}


/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgb2hsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}

var ColorPaletteEdit = function() {
  this.editor = null;
  this.uiComponent = null;

  this.prefix = 'colorPaletteEdit';

  this.colorPaletteDisplay = null;
//  this.colorPaletteCanvas = null;
  this.colorWidth = 16;
  this.colorHeight = 16;
  this.colorSpacing = 2;

  this.colorsAcross = 16;
  this.colorsDown = 16;

  this.colors = [];
  this.imageColors = [];

  this.colorCount = 16;


  this.imagePaletteCanvas = null;
  this.importImage = null;

  this.imageCanvas = null;
  this.imageCanvasScale = null;
  this.imageScale = 1;
  this.imageX = 0;
  this.imageY = 0;


  this.colorWheelCanvas = null;
  this.colorWheelContext = null;

  this.imageMouseDownX = false;
  this.imageMouseDownY = false;

  this.imageData = null;

  this.highlightColor = 0;
  this.selectedColor = 0;

  this.mouseDownOnImage = false;
  this.mouseDownX = 0;
  this.mouseDownY = 0;
  this.currentOffsetX = 0;
  this.currentOffsetY = 0;

  this.gridMouseDownX = 0;
  this.gridMouseDownY = 0;


  this.colorSelectionMethod = 'rgb';

  this.rSliderCanvas = null;
  this.gSliderCanvas = null;
  this.bSliderCanvas = null;

  this.hSliderCanvas = null;
  this.sSliderCanvas = null;
  this.vSliderCanvas = null;

  this.activeSlider = false;

  this.gridWidth = 16;
  this.gridHeight = 16;

  this.currentTool = 'pen';

  this.visible = false;

  this.buttons = 0;
  // extra check for left mousebutton
  this.leftMouseUp = true;


  this.history = [];
  this.historyPosition = 0;


  this.colorsChanged = false;


  this.colorMap = [];
  this.saveMap = [];
  this.ramps = [];

  this.rampFromGridX = false;
  this.rampFromGridY = false;
  this.rampToGridX = false;
  this.rampToGridY = false;


  this.exportCanvas = null;

  this.paramGraph = null;

  this.graphParam = 'red';

  this.colorPaletteLoadFromURL = null;

  
  this.selectedColorWheelColorX = false;
  this.selectedColorWheelColorY = false;
  this.colourWheelMouseIsDown = false;

  this.colorWheelImage = null;
  this.colorWheelValueCanvas = null;
  this.colorWheelValue = 1;


  this.autosave = false;

  this.h = 0;
  this.s = 100;
  this.v = 100;
}

ColorPaletteEdit.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  htmlComponentLoaded: function() {

    this.colorPaletteDisplay = new ColorPaletteDisplay();
    this.colorPaletteDisplay.init(this.editor, { canvasElementId:  this.prefix + 'Canvas', 
                  "gridLinesVisible": true,
                  "selectEnabled": false,
                  "highlightEnabled": false });

    this.colorPaletteDisplay.setColorSize(24, 24, 0);

    this.paramGraph = new ParamGraph();
    this.paramGraph.init({ "canvasElementId": this.prefix + "Graph" });

    this.paramGraph.on('paramchanged', function(index, value) {
      _this.paramChanged(index, value);
    });

    this.paramGraph.on('mouseup', function(event) {
      _this.paramGraphMouseUp(event);

    });

    var _this = this;
    this.colorPaletteDisplay.on('colorselected', function(args) {
      _this.colorSelected(args.color);
    });

    this.colorPaletteDisplay.on('highlightchanged', function(args) {
      _this.colorHighlighted(args.color);
    });

    this.colorPaletteDisplay.on('mousemove', function(event, gridX, gridY) {
      _this.gridMouseMove(event, gridX, gridY);
    });

    this.colorPaletteDisplay.on('mousedown', function(event, gridX, gridY) {
      _this.gridMouseDown(event, gridX, gridY);
    });


    this.colorPaletteDisplay.on('mouseup', function(event, gridX, gridY) {
      _this.gridMouseUp(event, gridX, gridY);
    });


    this.colorPaletteDisplay.on('mouseenter', function(event) {
      _this.gridMouseEnter(event);
    });

    this.colorPaletteDisplay.on('mouseleave', function(event) {
      _this.gridMouseLeave(event);
    });

    this.colorPaletteDisplay.on('enddrag', function(fromX, fromY, toX, toY) {
      _this.gridEndDrag(fromX, fromY, toX, toY);
    });

    this.colorPaletteDisplay.on('endmarqueedrag', function(fromX, fromY, width, height, toX, toY) {
      _this.gridEndMarqueeDrag(fromX, fromY, width, height, toX, toY);
    });


    this.colorPaletteDisplay.on('marqueechanged', function(left, top, width, height) {
      _this.marqueeChanged(left, top, width, height);
    });

  
/*  
    this.colorPaletteCanvas.style.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing + 'px';
    this.colorPaletteCanvas.style.height = 16 * (this.colorHeight + this.colorSpacing) + this.colorSpacing + 'px';

    this.colorPaletteCanvas.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing;
    this.colorPaletteCanvas.height = 16 * (this.colorHeight + this.colorSpacing) + this.colorSpacing;
*/

    this.imageCanvas = document.getElementById(this.prefix + 'FromImageImage');
    this.imageCanvas.style.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing + 'px';
    this.imageCanvas.style.height = 12 * (this.colorHeight + this.colorSpacing) + this.colorSpacing + 'px';

    this.imageCanvas.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing;
    this.imageCanvas.height = 12 * (this.colorHeight + this.colorSpacing) + this.colorSpacing;

    this.imageContext = this.imageCanvas.getContext('2d');
    this.imageContext.imageSmoothingEnabled = false;
    this.imageContext.webkitImageSmoothingEnabled = false;
    this.imageContext.mozImageSmoothingEnabled = false;
    this.imageContext.msImageSmoothingEnabled = false;
    this.imageContext.oImageSmoothingEnabled = false;


    this.imagePaletteCanvas = document.getElementById(this.prefix + 'FromImagePalette');

    this.imagePaletteCanvas.style.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing + 'px';
    this.imagePaletteCanvas.style.height = 1 * (this.colorHeight + this.colorSpacing) + this.colorSpacing + 'px';

    this.imagePaletteCanvas.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing;
    this.imagePaletteCanvas.height = 1 * (this.colorHeight + this.colorSpacing) + this.colorSpacing;



    this.rSliderCanvas = document.getElementById(this.prefix + 'RCanvas');
    this.gSliderCanvas = document.getElementById(this.prefix + 'GCanvas');
    this.bSliderCanvas = document.getElementById(this.prefix + 'BCanvas');


    this.hSliderCanvas = document.getElementById(this.prefix + 'HCanvas');
    this.sSliderCanvas = document.getElementById(this.prefix + 'SCanvas');
    this.vSliderCanvas = document.getElementById(this.prefix + 'VCanvas');


    this.initEvents();

    this.initColors();
//    this.drawPalette();

  },


  setColorPaletteTool: function(tool) {
    if(tool == 'select') {
      $('#' + this.prefix +  ' .colorPaletteSelectionMethod').hide();


      $('#' + this.prefix + ' .colorPaletteEditorDrawColor').hide();
      $('#' + this.prefix + ' .editColorPaletteChooseMethod').hide();

      
      $('#' + this.prefix + 'GraphHolder').show();
      this.paramGraph.draw(); 
      this.setStartEndColors();

    } else if(this.currentTool == 'select' && tool != 'select') {
      $('#' + this.prefix + ' .colorPaletteSelectionMethod').hide();
      $('#' + this.prefix + 'SelectionMethod_' + this.colorSelectionMethod).show();

      $('#' + this.prefix + ' .colorPaletteEditorDrawColor').show();
      $('#' + this.prefix + ' .editColorPaletteChooseMethod').show();
    }
    this.currentTool = tool;

    $('#' + this.prefix + ' .colorPaletteTool').removeClass('colorPaletteToolSelected');
    $('#' + this.prefix + 'Tool_' + tool).addClass('colorPaletteToolSelected');
    var label = this.getToolLabel(this.currentTool);
    $('#' + this.prefix + 'CurrentTool').html(label);

    if(tool == 'select' || tool == 'move') {
      this.colorPaletteDisplay.setDrawHighlightInMarquee(false);
    } else {
      this.colorPaletteDisplay.setDrawHighlightInMarquee(true);
    }
  },

  colorSelected: function(color) {
    if(color != this.selectedColor) {
      this.selectedColor = color;
      this.updateColorInfo();
    }

  },

  colorHighlighted: function(color) {
    if(color != this.highlightedColor) {
      this.highlightedColor = color;
      this.updateColorInfo();
    }

  },

  updateColorInfo: function() {
    var color = false;
    if(this.highlightedColor != this.editor.colorPaletteManager.noColor) {
      color = this.highlightedColor;
    } else if(this.selectedColor != this.editor.colorPaletteManager.noColor) {
      color = this.selectedColor;
    }

    if(color === false || color >= this.colors.length) {
      return false;
    }

    var colorHex = this.colors[color];
    var colorHexString = ("000000" + colorHex.toString(16)).substr(-6);


    $('#' + this.prefix + 'CurrentColorBox').css('background-color', '#' + colorHexString);
    $('#' + this.prefix + 'CurrentColorIndex').html(color);
    $('#' + this.prefix + 'CurrentColorHex').html('#' + colorHexString);


  },

  setAutosave: function(autosave) {
    this.autosave = autosave;
  },

  setToCurrentPalette: function() {

    if(this.editor.colorPaletteManager == null) {
      return;
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(colorPalette == null) {
      return;
    }

//    this.autosave = true;
//    var colors = colorPalette.getColors();


    this.colorCount = colorPalette.getColorCount();
    this.colorsAcross = colorPalette.getColorsAcross();

    this.colors = [];
    for(var i = 0; i < this.colorCount; i++) {
      this.colors.push(colorPalette.getARGB(i)   );
    }


    var colorMap = colorPalette.getDefaultColorPaletteMap();//colorPalette.getCurrentColorMap();
    if(colorMap === false || colorMap.length == 0) {
      colorPalette.setSortOrderMethod('default');
      colorMap = colorPalette.getCurrentColorMap();
    }

    var mapWidth= 16;
    var mapHeight = 16;

    if(colorMap.length > 0) {
      if(colorMap.length > mapHeight) {
        mapHeight = colorMap.length;
      }

      if(colorMap[0].length > mapWidth) {
        mapWidth = colorMap[0].length;
      }
    }
    this.colorMap = [];
    for(var y = 0; y < mapHeight; y++) {
      this.colorMap[y] = [];
      for(var x = 0; x < mapWidth; x++) {
        if(y < colorMap.length && x < colorMap[y].length) {
          this.colorMap[y][x] = colorMap[y][x];
        } else {
          this.colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }
      }
    }

    //this.colorPaletteDisplay.setColorMap(this.colorMap);
    this.colorPaletteDisplay.setColors(this.colors, { colorMap: this.colorMap });

    colorPalette.setTrackModified(false);
    this.historyInit();
    this.historySaveState();
    colorPalette.setTrackModified(true);

/*
    // is there a map?
    var maps = colorPalette.getColorPaletteMaps();
    if(maps.length > 0) {
      // get the first map
      var colorPaletteMap = colorPalette.getColorPaletteMapById(maps[0].id);

      if(colorPaletteMap) {
        this.colorPaletteDisplay.setUseColorMap(true, colorPaletteMap, false);

      }
    }
*/    
  },


  initContent: function() {

    this.r = $('#' + this.prefix + 'R').val();
    this.g = $('#' + this.prefix + 'G').val();
    this.b = $('#' + this.prefix + 'B').val();

    this.colorPaletteDisplay.setMarqueeEnabled(false);
    this.setColorPaletteTool('pen');


    this.setRGB();
    this.updateHex();

    this.setToCurrentPalette();

    this.historyInit();
    this.historySaveState();


  },

  getToolLabel: function(key) {
    var label = key;

    label = this.editor.tools.drawTools.getToolLabel(key);
    return label;
  },

  initEvents: function() {
    var _this = this;


    $('.colorPaletteTool').on('click', function() {
      var id = $(this).attr('id');
      var dashPos = id.lastIndexOf('_');
      id = id.substring(dashPos + 1);
      _this.setColorPaletteTool(id);
    });

    $('.colorPaletteTool').on('mouseover', function() {
      var id = $(this).attr('id');
      
      //id = id.substring('colorPaletteTool_'.length);
      var pos = id.indexOf('_');
      id = id.substring(pos + 1);
      var label = _this.getToolLabel(id);

      $('#' + _this.prefix + 'CurrentTool').html(label);
    });

    $('.colorPaletteTool').on('mouseleave', function() {
      var label = _this.getToolLabel(_this.currentTool);
      $('#' + _this.prefix + 'CurrentTool').html(label);
    });

    $('#' + this.prefix + 'ShowGrid').on('click', function() {
      _this.colorPaletteDisplay.setGridVisible($('#' + _this.prefix + 'ShowGrid').is(':checked'));

    });


    $('#' + this.prefix + 'ImageChooseFile').on('click', function() {
      $('#' + _this.prefix + 'Image').click();
    });


    document.getElementById(this.prefix + 'Image').addEventListener("change", function(e) {
      var file = document.getElementById(_this.prefix + 'Image').files[0];
      _this.setImportFile(file);
    });

    $('.colorPaletteNumber').on('change', function(event) {
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

    $('.colorPaletteNumber').on('keyup', function(event) {
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


    $('.colorPaletteSlider').on('mousedown', function(event) {
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

    $('#' + this.prefix + ' input[name=editColorPaletteMethod]').on('click', function(event) {
      var value = $('input[name=editColorPaletteMethod]:checked').val();
      _this.setColorSelectionMethod(value);
    });

    $('#' + this.prefix + 'Clear').on('click', function(event) {
      _this.clearPalette();
    });

    $('#' + this.prefix + 'Load').on('click', function(event) {

      document.getElementById(_this.prefix + 'LoadForm').reset();
      $('#' + _this.prefix + 'ChooseFile').click();
    });

    $('#' + this.prefix + 'LoadLospec').on('click', function(event) {
      _this.loadLospecPalette();
    });

    $('#' + this.prefix + 'Save').on('click', function(event) {
      _this.saveColorPalette();
    });


    document.getElementById(this.prefix + 'ChooseFile').addEventListener("change", function(e) {
      var file = document.getElementById(_this.prefix + 'ChooseFile').files[0];
      _this.choosePaletteFile(file);
    });


    $('#' + this.prefix + 'FromImageColorCount').on('change', function(event) {
      _this.colorCount = parseInt( $('#' + _this.prefix + 'FromImageColorCount').val(), 10);
      _this.createAutomaticPalette();

    });

    $('#' + this.prefix + 'FromImageAdd').on('click', function(event) {
      _this.addColorsFromImage();
    });


    $('#' + this.prefix + 'FromImageImage').on('dblclick', function(event) {
      _this.dblClickImage(event);
    });

    $('#' + this.prefix + 'FromImageImage').on('mousedown', function(event) {
      _this.mouseDownImage(event);
    });

    $('#' + this.prefix + 'FromImageImage').on('mouseleave', function(event) {
      _this.mouseLeaveImage(event);
    });

    $('#' + this.prefix + 'FromImageImage').on('wheel', function(event) {
      _this.imageMouseWheel(event.originalEvent);
    });



    $('#' + this.prefix + 'FromImageImage').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.prefix + 'FromImageImage').on('mouseup', function(event) {
      _this.mouseUp(event);
    });


    $('#' + this.prefix + 'FromImagePalette').on('mousedown', function(event) {
      _this.mouseDownPalette(event);
    });


    $('#' + this.prefix + 'FromImagePalette').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.prefix + 'ImageAddColor').on('click', function(event) {
      _this.addSelectedColor();
    });


    $('#' + this.prefix + 'GraphParam').on('change', function(event) {
      var value = $(this).val();
      _this.setGraphParam(value);
    });
/*
    $('#editColorPaletteHex').on('keyup', function(event) {

      _this.setColorFromHex();
    });
*/
    $('#' + this.prefix + 'Hex').on('keyup', function(event) {
      _this.setColorFromHex();
    });

    $('#' + this.prefix + 'Hex').on('change', function(event) {
      _this.setColorFromHex();
    });

    $('#' + this.prefix + 'Hex').on('blur', function(event) {
      _this.setColorFromHex();
      _this.updateHex();      
    });


    $('#' + this.prefix + 'ImageFit').on('click', function(event) {
      _this.scaleImageToFit();
    });


    // image scale
    $('#' + this.prefix + 'ImageScale').on('keyup', function() {
      var scale = parseInt($(this).val(), 10);
      if(!isNaN(scale)) {
        _this.setImageScale(scale/100);
      }
    });



    $('#' + this.prefix + 'ImageScaleDecrease').on('click', function() {
      var scale = _this.imageScale;
      if(isNaN(scale)) {
        return;
      }
      scale -= 0.05;
      if(scale > 0) {
        _this.setImageScale(scale);
      }

    });

    $('#' + this.prefix + 'ImageScaleIncrease').on('click', function() {
      var scale = _this.imageScale;
      if(isNaN(scale)) {
        return;
      }
      scale += 0.05;
      if(scale > 0) {
        _this.setImageScale(scale);
      }
    });



    $('#' + this.prefix + 'GridWidth').on('change', function() {
      var width = parseInt($(this).val(), 10);
      _this.setGridWidth(width);
    });

    $('#' + this.prefix + 'GridWidth').on('keyup', function() {
      var width = parseInt($(this).val(), 10);
      _this.setGridWidth(width);
    });

    $('#' + this.prefix + 'GridHeight').on('change', function() {
      var height = parseInt($(this).val(), 10);
      _this.setGridHeight(height);
    });

    $('#' + this.prefix + 'GridHeight').on('keyup', function() {
      var height = parseInt($(this).val(), 10);
      _this.setGridHeight(height);
    });

    $('#colorPaletteEditorGenerateGradient').on('click', function(event) {

      var type = $('input[name=colorPaletteEditorGenerateGradientType]:checked').val();
      var correctLightness = $('#colorPaletteEditorGradientCorrectLightness').is(':checked');

      _this.generateGradient({
        type: type,
        correctLightness: correctLightness
      });
    });
  },


  loadLospecPalette: function() {
    if(this.colorPaletteLoadFromURL == null) {
      this.colorPaletteLoadFromURL = new ColorPaletteLoadFromURL();
    }

    var _this = this;
    this.colorPaletteLoadFromURL.show({
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

    this.clearPalette(false);
    this.addColors(colors);
    

    /*
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
    */
  },


  choosePaletteFile: function(file) {

    var _this = this;
    this.clearPalette(false);

    var colorPaletteLoader = this.editor.colorPaletteManager.getColorPaletteLoader();
    colorPaletteLoader.setImportFile(file, function(result) {
      _this.addColors(result);

    });
  },


  dropFile: function(file) {
    this.choosePaletteFile(file);
  },

  resize: function() {

    // resize the grid
    var width = $('#' + this.prefix + 'CanvasHolder').width();
    var height = $('#' + this.prefix + 'CanvasHolder').height() - 10;
    this.colorPaletteDisplay.fitToWidthHeight(width, height);
  },
  
  setGridWidth: function(width) {
    var map = this.colorPaletteDisplay.getColorMap();
    if(map.length <= 0 || width == 0) {
      return;
    }

    if(map[0].length == width) {
      return;
    }

    if(map[0].length > width && (this.saveMap.length == 0 || this.saveMap[0].length < map[0].length) ) {
      // grid is shrinking, save the map in case it increases
      this.saveMap = [];
      for(var y = 0; y < map.length; y++) {
        this.saveMap[y] = [];
        for(var x = 0; x < map[y].length; x++) {
          this.saveMap[y][x] = map[y][x];
        }
      }
    }


    var noColor = this.editor.colorPaletteManager.noColor;
    for(var y = 0; y < map.length; y++) {
      if(map[y].length < width) {
        for(var x = map[y].length; x < width; x++) {
          if(y < this.saveMap.length && x < this.saveMap[y].length) {
            map[y][x] = this.saveMap[y][x];
          } else {
            map[y][x] = noColor;
          }
        }
      }

      if(map[y].length > width) {
        map[y].length = width;
      }
    }

    this.colorPaletteDisplay.setColorMap(map);
    var width = this.colorPaletteDisplay.getCanvasWidth();

    this.resize();

  },

  setGridHeight: function(height) {
    var map = this.colorPaletteDisplay.getColorMap();
    if(map.length <= 0 || map.length === height || height == 0) {
      return;
    }


    if(map.length > height && (this.saveMap.length == 0 || this.saveMap.length < map.length) ) {
      // grid is shrinking, save the map in case it increases
      this.saveMap = [];
      for(var y = 0; y < map.length; y++) {
        this.saveMap[y] = [];
        for(var x = 0; x < map[y].length; x++) {
          this.saveMap[y][x] = map[y][x];
        }
      }
    }


    var width = map[0].length;
    var noColor = this.editor.colorPaletteManager.noColor;

    if(map.length < height) {
      for(var y = map.length; y < height; y++) {
        var row = [];
        for(var x = 0; x < width; x++) {
          row[x] = noColor;
          if(y < this.saveMap.length && x < this.saveMap[y].length) {
            row[x] = this.saveMap[y][x];
          }
        }
        map.push(row);
      }
    }

    if(map.length > height) {
      map.length = height;
    }
    this.colorPaletteDisplay.setColorMap(map);
    
    var width = this.colorPaletteDisplay.getCanvasWidth();
    /*
    if(width > 350) {
      width = 350;
    }
    if(width < 330) {
      width = 330;
    }
*/

    this.resize();
  },

  setColorSelectionMethod: function(method) {
    this.colorSelectionMethod = method;
    $('#' +this.prefix + ' .colorPaletteSelectionMethod').hide();
    $('#' + this.prefix + 'SelectionMethod_' + this.colorSelectionMethod).show();

    if(method == 'colorwheel') {
      this.drawColorWheel();
      this.setColorWheelHSV();
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
  },

  setG: function(g) {
    g = parseInt(g, 10);
    if(isNaN(g)) {
      return;
    }
    this.g = g;
    this.setRGB();
    this.updateHex();
  },

  setB: function(b) {
    b = parseInt(b);
    if(isNaN(b)) {
      return;
    }
    this.b = b;
    this.setRGB();
    this.updateHex();
  },

  setH: function(h) {
    h = parseInt(h, 10);
    if(isNaN(h)) {
      return;
    }
    this.h = h;
    this.setHSV();
    this.updateHex();
  },

  setS: function(s) {
    s = parseInt(s, 10);
    if(isNaN(s)) {
      return;
    }
    this.s = s;
    this.setHSV();
    this.updateHex();

  },

  setV: function(v) {
    v = parseInt(v, 10);
    if(isNaN(v)) {
      return;
    }
    this.v = v;
    this.setHSV();
    this.updateHex();
  },

  updatePalette: function() {
    var colorPaletteManager = this.editor.colorPaletteManager;
    var colorPalette = colorPaletteManager.getCurrentColorPalette();

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
    this.updateHSVSlider(this.hSliderCanvas, {
      fromH: 0, toH: 360,
      fromS: this.s, toS: this.s,
      fromV: this.v, toV: this.v,
      value: this.h / 360
    });

    this.updateHSVSlider(this.sSliderCanvas, {
      fromH: this.h, toH: this.h,
      fromS: 0, toS: 100,
      fromV: this.v, toV: this.v,
      value: this.s / 100
    });

    this.updateHSVSlider(this.vSliderCanvas, {
      fromH: this.h, toH: this.h,
      fromS: this.s, toS: this.s,
      fromV: 0, toV: 100,
      value: this.v / 100
    });
/*
    this.updateHSVSlider(this.vSliderCanvas, {
      fromH: this.h, toH: this.h,
      fromS: this.s, toS: this.s,
      fromV: 0, toV: 100,
      value: this.v
    });
*/
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

  setRGB: function(rgb) {
    if(typeof rgb == 'undefined') {
      this.rgb = ((this.r & 0xff) << 16) + ((this.g & 0xff) << 8) + ((this.b & 0xff));
    } else {
      this.rgb = rgb;
      this.r = (rgb & 0xff0000) >> 16;
      this.g = (rgb >> 8) & 0xff;
      this.b = (rgb) & 0xff;
    }

    var hsv = rgb2hsv(this.r, this.g, this.b);

    this.h = Math.round(hsv[0] * 360);
    this.s = Math.round(hsv[1] * 100);
    this.v = Math.round(hsv[2] * 100);

    this.updateColorSliders();
  },

  setColorFromHex: function() {
    var value = $('#' + this.prefix + 'Hex').val();
    value = parseInt(value, 16);

    if(isNaN(value)) {
      return;
    }

    this.setRGB(value);
//    this.updateColorSliders();

  },

  updateHex: function() {
    var colorHexString = ("000000" + this.rgb.toString(16)).substr(-6);
    $('#' + this.prefix + 'Hex').val(colorHexString);
  },

  updateColorSliders: function() {

    $('#' + this.prefix + 'R').val(this.r);
    $('#' + this.prefix + 'G').val(this.g);
    $('#' + this.prefix + 'B').val(this.b);


    $('#' + this.prefix + 'H').val(this.h);
    $('#' + this.prefix + 'S').val(this.s);
    $('#' + this.prefix + 'V').val(this.v);


//    $('#colorPaletteImageMouseSelectedColor').css('background-color', '#' + colorHexString);
//    this.selectedColor = this.rgb;

    this.setSelectedColor(this.rgb);

    this.updateRGBSliders();
    this.updateHSVSliders();
  },

  initColors: function() {
    this.colors = [];

  },


  historyInit: function() {
    this.history = [];
    this.historyPosition = 0;
  },

  historySaveState: function() {

    var entry = {};
    entry.colors = [];
    entry.map = [];


    for(var i = 0; i < this.colors.length; i++) {
      entry.colors.push(this.colors[i]);
    }

    var map = this.colorPaletteDisplay.getColorMap();
    for(var y = 0; y < map.length; y++) {
      entry.map.push([]);
      for(var x = 0; x < map[y].length; x++) {
        entry.map[y].push(map[y][x]);
      }
    }

    this.historyPosition++;
    this.history[this.historyPosition] = entry;
//    this.history.push(this.historyPosition++);


    if(this.autosave) {
      this.setPalette();
    }

  },


  undo: function() {
    console.log('undo!!!');


    if(this.historyPosition <= 1) {
      return;
    }

    this.historyPosition--;
    this.historyRestoreEntry(this.historyPosition);

    this.setGraphData();
    if(this.autosave) {
      this.setPalette();
    }


  },

  redo: function() {
    if(this.historyPosition >= this.history.length - 1) {
      return;
    }

    this.historyPosition++;
    this.historyRestoreEntry(this.historyPosition);

    this.setGraphData();
    if(this.autosave) {
      this.setPalette();
    }

  },

  historyRestoreEntry: function(position) {
    var entry = this.history[position];

    this.colors = [];
    for(var i = 0; i < entry.colors.length; i++) {
      this.colors.push(entry.colors[i]);
    }

    var map = [];
    for(var y = 0; y < entry.map.length; y++) {
      map.push([]);
      for(var x = 0; x < entry.map[y].length; x++) {
        map[y].push(entry.map[y][x]);
      }
    }

    this.colorPaletteDisplay.setColors(this.colors, { colorMap: map });
    //this.colorPaletteDisplay.setUseColorMap(true, map, false);

  },

  saveColorPalette: function() {
    if(this.colorPalette == null) {
      this.colorPalette = new ColorPalette();
      this.colorPalette.editor = this.editor;
    }

    this.setPalette(false);

    this.editor.colorPaletteManager.showSave({
      colorPalette: this.colorPalette
    });
  },


  setPalette: function(useCurrent) {
    var colorPaletteManager = this.editor.colorPaletteManager;
    var colorPalette = this.colorPalette;
    
    if(typeof useCurrent == 'undefined' || useCurrent) {
      colorPalette = colorPaletteManager.getCurrentColorPalette();
    }

    var colorsDown = Math.ceil(this.colors.length / this.colorsAcross);
    var colorPaletteMap = this.colorPaletteDisplay.getColorMap();

    var colorMapWidth = 0;
    var colorMapHeight = 0;
    for(var y = 0; y < colorPaletteMap.length; y++) {
      for(var x = 0; x < colorPaletteMap[y].length; x++) {
        if(colorPaletteMap[y][x] != this.editor.colorPaletteManager.noColor) {
          if(x + 1 > colorMapWidth) {
            colorMapWidth = x + 1;
          }
          colorMapHeight = y + 1;
        }
      }
    }

    var trimmedColorMap = [];
    for(var y = 0; y < colorMapHeight; y++) {
      trimmedColorMap[y] = [];
      for(var x = 0; x < colorMapWidth; x++) {
        trimmedColorMap[y][x] = colorPaletteMap[y][x];
      }
    }

    colorPalette.setColorPaletteMap('Default Layout', trimmedColorMap);
    colorPalette.setColors(this.colors, this.colorsAcross, colorsDown);

  },


  clearPalette: function(saveHistory) {
    this.colors = [];
    for(var y = 0; y < this.colorMap.length; y++) {
      for(var x = 0; x < this.colorMap[y].length; x++) {
        this.colorMap[y][x] = this.editor.colorPaletteManager.noColor;
      }
    }
    this.colorPaletteDisplay.setColors(this.colors, { colorMap: this.colorMap });

    if(typeof saveHistory == 'undefined' || saveHistory) {
      this.historySaveState();
    }
  },

  removeColor: function() {

    if(this.selectedColor === false || this.selectedColor >= this.colors.length) {
      return;
    }

    this.colors.splice(this.selectedColor, 1);


    this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross });

    this.historySaveState();

    this.selectedColor = false;


  },



  setImportFile: function(file) {
    if(!this.importImage) {
      this.importImage = new Image();
    }

    var _this = this;
    this.importImage.onload = function() {
      _this.imageScale = 1;
      _this.imageX = - _this.imageCanvas.width / 2;
      _this.imageY = - _this.imageCanvas.height / 2;
      _this.updateImportImage();
      _this.createAutomaticPalette();      
    }

    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    this.importImage.src = src;


    if(typeof file.name != 'undefined') { 
      $('#' + this.prefix + 'ImageChooseFileName').html(file.name);
    } else {
      $('#' + this.prefix + 'ImageChooseFileName').html('');
    }    

  },


  setImageScale: function(scale) {
    this.imageScale = scale;

    var scaleValue = scale * 100;
    $('#' + this.prefix + 'ImageScale').val(scaleValue);

    this.updateImportImage();
  },



  scaleImageToFit: function() {
    if( this.importImage == null) {
      return;
    }



    var drawWidth = 0;
    var drawHeight = 0;
    var scale = 1;

    // actual image width/height
    var drawWidth = this.importImage.naturalWidth;
    var drawHeight = this.importImage.naturalHeight;

    var canvasWidth = this.imageCanvas.width;
    var canvasHeight = this.imageCanvas.height;

    // scale to fit width first
    if(drawWidth > canvasWidth) {
      scale = canvasWidth / this.importImage.naturalWidth;
    }

    // scale to fit height
    if(drawHeight > canvasHeight) {
      scale = canvasHeight / this.importImage.naturalHeight;
    }


    if(drawWidth < canvasWidth && scale == 1) {
      scale = canvasWidth / this.importImage.naturalWidth;
    }

    if(drawHeight < canvasHeight && scale == 1) {
      scale = canvasHeight / this.importImage.naturalHeight;
    }

    this.imageX = (canvasWidth - drawWidth * scale) / 2   - canvasWidth / (2* scale);

    this.imageY = (canvasHeight - drawHeight * scale) / 2   - canvasHeight / (2* scale);

    var imageScale = scale;


    

//    this.updateImportImage();
    this.setImageScale(imageScale);
  },

  xyToImageColor: function(x, y) {
    if(this.imageData == null) {
      return false;
    }

    x = Math.floor(x);
    y = Math.floor(y);

    var pos = x * 4 + (y * 4 * this.imageData.width);
    if(pos + 3 >= this.imageData.data.length) {
      return false;
    }
    var r = this.imageData.data[pos];
    var g = this.imageData.data[pos + 1];
    var b = this.imageData.data[pos + 2];

    var color = (r << 16) + (g << 8) + (b);

    return color;

  },

  updateImportImage: function() {

    var drawWidth = this.importImage.naturalWidth;
    var drawHeight = this.importImage.naturalHeight;


    this.imageContext.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);

    var offsetX = 0;
    var offsetY = 0;

    this.imageContext.save();

    this.imageContext.translate(this.imageCanvas.width / 2, this.imageCanvas.height / 2); 
    this.imageContext.scale(this.imageScale, this.imageScale);


    this.imageContext.drawImage(this.importImage, 0, 0, drawWidth, drawHeight, 
      this.imageX + offsetX, this.imageY + offsetY, drawWidth, drawHeight );

    this.imageContext.restore();

    this.imageData = this.imageContext.getImageData(0, 0, this.imageCanvas.width, this.imageCanvas.height);   


    if(this.imageMouseDownX !== false && this.imageMouseDownY !== false) {
      var x = this.imageMouseDownX;
      var y = this.imageMouseDownY;
      this.imageContext.strokeStyle = '#222222';
      this.imageContext.beginPath();
      this.imageContext.arc(x,y, 2,0,2*Math.PI);
      this.imageContext.stroke();
    }
  },

  createAutomaticPalette: function() {
    if(this.importImage == null) {
      return;
    }

    var palette = ImageUtils.createColorPaletteFromImage(this.colorCount, this.importImage);// = function(colors, image) {    

    this.imageColors = [];
    for(var i =0 ; i < palette.length; i+= 4) {
      var alpha = 0xff >>> 0;
      var color = ((alpha << 24) + (palette[i] << 16) + (palette[i + 1] << 8) + (palette[i + 2])) >>> 0;
      this.imageColors.push(color);
    }




    this.drawImageColors();
  },


  buildInterface: function(parentPanel) {
    var _this = this;

    this.prefix = 'colorPaletteEditor';
    this.uiComponent = UI.create("UI.Panel");
    parentPanel.add(this.uiComponent);

    this.uiComponent.on('keydown', function(event) {
      _this.keyDown(event);
    });


    this.uiComponent.on('keyup', function(event) {
      _this.keyUp(event);
    });

    this.uiComponent.on('keypress', function(event) {
      _this.keyPress(event);
    });


    this.createPalettePanel = UI.create("UI.HTMLPanel");


    this.uiComponent.add(this.createPalettePanel);
    UI.on('ready', function() {
      _this.createPalettePanel.load('html/textMode/colorPaletteEditor.html', function() {
        _this.htmlComponentLoaded();
        _this.initContent();
        _this.setH(208);
        _this.setS(67);
        _this.setV(67);

      });
    });


  },

  // show as dialog
  show: function() {
    var _this = this;
    this.visible = true;
    this.autosave = false;

    this.prefix = 'colorPaletteEdit';

    if(this.uiComponent == null) {
      var width = 800;
      var height = 660;

      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "editColorPaletteDialog", "title": "Edit Colour Palette", "width": width, "height": height });

      this.uiComponent.on('close', function() {
        _this.visible = false;
      });


      this.uiComponent.on('keydown', function(event) {
        _this.keyDown(event);
      });


      this.uiComponent.on('keyup', function(event) {
        _this.keyUp(event);
      });

      this.uiComponent.on('keypress', function(event) {
        _this.keyPress(event);
      });

      this.uiComponent.on('resize', function(event) {
        _this.resize();
      });


      this.createPalettePanel = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.createPalettePanel);
      this.createPalettePanel.load('html/textMode/colorPaletteEdit.html', function() {
        _this.htmlComponentLoaded();
        _this.initContent();
        _this.setH(208);
        _this.setS(67);
        _this.setV(67);

      });

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


      /*
      this.downloadPNGButton = UI.create('UI.Button', { "text": "Download PNG", "color": "secondary" });
      this.uiComponent.addButton(this.downloadPNGButton);
      this.downloadPNGButton.on('click', function(event) {
        _this.downloadPNG();
      });
*/
    } else {
      this.initContent();
    }

    UI.showDialog("editColorPaletteDialog");
  },


  getColorInfo: function(color) {
    var colorHexString = ("000000" + color.toString(16)).substr(-6);    
    var colorInfo = '<div>#' + colorHexString + '<div>';

    var a = (color & 0xff000000) >> 24;
    var r = (color & 0xff0000) >> 16;
    var g = (color & 0xff00) >> 8;
    var b = (color & 0xff);
    colorInfo += '<div>';
    colorInfo += '<label class="gridinfo-label">R</label><div class="color-value">' + r + '</div>';
    colorInfo += '<label class="gridinfo-label">G</label><div class="color-value">' + g + '</div>';
    colorInfo += '<label class="gridinfo-label">B</label><div class="color-value">' + b + '</div>'; 
    colorInfo += '</div>';

    var hsv = rgb2hsv(r, g, b);

    var h = Math.round(360 * hsv[0]);
    var s = Math.round(hsv[1] * 100);
    var v = Math.round(hsv[2] * 100);
    colorInfo += '<div><label class="gridinfo-label">H</label><div class="color-value">' + h + '</div>';
    colorInfo += '<label class="gridinfo-label">S</label><div class="color-value">' + s + '</div>';
    colorInfo += '<label class="gridinfo-label">V</label><div class="color-value">' + v + '</div>'; 
    colorInfo += '</div>';

    return colorInfo;
  },

  setHighlightColor: function(color) {
    this.highlightColor = color;
    var colorHexString = ("000000" + color.toString(16)).substr(-6);
    $('#' + this.prefix + 'ImageMouseHoverColor').css('background-color', '#' + colorHexString);

    var colorInfo = '<div style="font-weight: bold; font-size: 12px; margin: 2px 0 2px 0">Hover Colour</div>' + this.getColorInfo(color);
    $('#' + this.prefix + 'ImageMouseHoverColorInfo').html(colorInfo);
  },

  setSelectedColor: function(color) {
    this.selectedColor = color;
    var colorHexString = ("000000" + this.selectedColor.toString(16)).substr(-6);
    $('#' + this.prefix + 'ImageMouseSelectedColor').css('background-color', '#' + colorHexString);

    var colorInfo = '<div style="font-weight: bold; font-size: 12px; margin: 2px 0 2px 0">Draw Colour</div>' + this.getColorInfo(color);
    $('#' + this.prefix + 'ImageMouseSelectedColorInfo').html(colorInfo);

    this.colorPaletteDisplay.setCursorRGB(this.selectedColor);

  },


  addSelectedColor: function() {
    for(var i = 0; i < this.colors.length; i++) {
      if(this.colors[i] == this.selectedColor) {
        alert('This colour has already been added');
        return;
      }
    }
    this.colors.push(this.selectedColor);
    this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross });

    this.historySaveState();


//    this.drawPalette();
  },


  applyGridTool: function(gridX, gridY, event) {
    if(this.currentTool == 'eyedropper' || event.altKey) {
      var colorIndex = this.colorPaletteDisplay.getColorAtMapXY(gridX, gridY);
      if(colorIndex !== this.colorPaletteDisplay.noColor) {
        var color = this.colors[colorIndex];
        this.setRGB(color);
        this.updateHex();
      }
      return;

    }

    if(this.currentTool == 'erase') {
      var colorIndex = this.colorPaletteDisplay.getColorAtMapXY(gridX, gridY);
      if(colorIndex !== this.colorPaletteDisplay.noColor) {
        this.colorPaletteDisplay.setColorAtMapXY(gridX, gridY, this.colorPaletteDisplay.noColor);
        console.error('need to delete the colour as well?..');
      }

    }

    if(this.currentTool == 'pen') {
      var colorIndex = this.colorPaletteDisplay.getColorAtMapXY(gridX, gridY);

      if(colorIndex === this.colorPaletteDisplay.noColor) {
        colorIndex = this.colors.length;
        this.colors.push(this.selectedColor);
        this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
        this.colorPaletteDisplay.setColorAtMapXY(gridX, gridY, colorIndex);
      } else {
        this.colors[colorIndex] = this.selectedColor;
        this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
      }

      this.colorsChanged = true;
    }
  },

  gridMouseDown: function(event, gridX, gridY) {
    
    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    
    // clear the save map
    this.saveMap = [];

    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        return;
      }

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        this.leftMouseUp = false;
      }

//      UI.captureMouse(this);
      this.mouseIsDown = true;
    }

    if(this.buttons & UI.LEFTMOUSEBUTTON) {

      this.pageMouseDownX = event.pageX;
      this.pageMouseDownY = event.pageY;

      this.gridMouseDownX = gridX;
      this.gridMouseDownY = gridY;

      this.applyGridTool(gridX, gridY, event);

      if(this.currentTool == 'move') {
        if(this.colorPaletteDisplay.getMarqueeEnabled() && this.colorPaletteDisplay.inMarquee(gridX, gridY)) {
          this.colorPaletteDisplay.startDragMarquee(true);
        } else {
          this.colorPaletteDisplay.startDragColor(gridX, gridY);
        }
      }

      if(this.currentTool == 'select') {
        if(this.colorPaletteDisplay.getMarqueeEnabled() && this.colorPaletteDisplay.inMarquee(gridX, gridY)) {
          this.colorPaletteDisplay.startDragMarquee(false);
        } else {
          this.colorPaletteDisplay.setMarqueeBounds(gridX, gridY, 1, 1);
          this.colorPaletteDisplay.setMarqueeEnabled(true);
        }
      }

      if(this.currentTool == 'ramp') {
        this.rampStart(gridX, gridY);
      }

    }
    this.colorPaletteDisplay.draw();
  },


  rampStart: function(gridX, gridY) {
    this.rampFromGridX = gridX;
    this.rampFromGridY = gridY;
    this.rampToGridX = gridX;
    this.rampToGridY = gridY;

    var colorIndex = this.colorPaletteDisplay.getColorAtMapXY(gridX, gridY);

    if(colorIndex === this.colorPaletteDisplay.noColor) {
      colorIndex = this.colors.length;
      this.colors.push(this.selectedColor);
      this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
      this.colorPaletteDisplay.setColorAtMapXY(gridX, gridY, colorIndex);
    } else {
//      this.colors[colorIndex] = this.selectedColor;
//      this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
    }

    this.drawingRamp = true;
//    this.colorsChanged = true;
  },

  rampMove: function(gridX, gridY) {

    if(this.drawingRamp) {
      this.rampToGridX = gridX;
      this.rampToGridY = gridY;

      this.drawRamp();
    }

  },


  rampEnd: function(gridX, gridY) {
    this.rampToGridX = gridX;
    this.rampToGridY = gridY;
    this.drawingRamp = false;

  },

  drawRamp: function() {
    var context = this.colorPaletteDisplay.getContext();
    var radius = 6;

    var fromCell = this.colorPaletteDisplay.gridXYToCell(this.rampFromGridX, this.rampFromGridY);
    var toCell = this.colorPaletteDisplay.gridXYToCell(this.rampToGridX, this.rampToGridY);

    context.lineWidth = 1;
    context.strokeStyle = '#eeeeee';
    context.beginPath();
    context.moveTo(fromCell.centerX, fromCell.centerY);
    context.lineTo(toCell.centerX, toCell.centerY);
    context.stroke();   

    context.beginPath();
//    context.moveTo(fromCell.centerX, fromCell.centerY);
    context.arc(fromCell.centerX, fromCell.centerY, radius, 0, 2 * Math.PI);
    context.stroke();    

    context.beginPath();    
  //  context.moveTo(toCell.centerX, toCell.centerY );
    context.arc(toCell.centerX, toCell.centerY, radius, 0, 2 * Math.PI);
    context.stroke();    
  },


  gridMouseEnter: function(event) {
    this.mouseInGrid = true;
    this.setMouseCursor(event);
  },

  gridMouseLeave: function(event) {
    this.mouseInGrid = false;
    this.setMouseCursor(event);
    this.colorPaletteDisplay.setHighlightGrid(false, false);
    this.colorPaletteDisplay.draw();
    UI.setCursor('default');
  },


  gridEndDrag: function(fromX, fromY, toX, toY) {
    var dragColorIndex = this.colorPaletteDisplay.getColorAtMapXY(fromX, fromY);
    if(dragColorIndex === this.colorPaletteDisplay.noColor) {
      return;
    }

    if(fromX !== toX || fromY !== toY) {
      var dragToColorIndex = this.colorPaletteDisplay.getColorAtMapXY(toX, toY);
      this.colorPaletteDisplay.setColorAtMapXY(toX, toY, dragColorIndex);
      this.colorPaletteDisplay.setColorAtMapXY(fromX, fromY, dragToColorIndex);
      this.colorPaletteDisplay.draw();
      this.historySaveState();

    }
//    this.colorPaletteDisplay
  },

  gridEndMarqueeDrag: function(fromX, fromY, width, height, toX, toY) {

    if(this.currentTool == 'move') {
      var noColor = this.colorPaletteDisplay.noColor;

      if(fromX !== toX || fromY !== toY) {
        var data = [];
        for(var y = 0; y < height; y++) {
          data[y] = [];
          for(var x = 0; x < width; x++) {
            data[y][x] = this.colorPaletteDisplay.getColorAtMapXY(fromX + x, fromY + y);

            this.colorPaletteDisplay.setColorAtMapXY(fromX + x, fromY + y, noColor);
          }        
        }


        for(var y = 0; y < height; y++) {
          for(var x = 0; x < width; x++) {
            this.colorPaletteDisplay.setColorAtMapXY(toX + x, toY + y, data[y][x]);
          }
        }

        this.colorPaletteDisplay.draw();
        this.historySaveState();
      }

    }

    this.colorPaletteDisplay.setMarqueeBounds(toX, toY, width, height);
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


  gridMouseMove: function(event, gridX, gridY) {
    if(!UI.isMobile.any()) {
      this.setButtons(event);
    }

    this.setMouseCursor(event);
    this.mouseInGrid = true;

    if(this.currentTool == 'pen') {
      this.colorPaletteDisplay.setCursorRGB(this.selectedColor);
    } else {
      this.colorPaletteDisplay.setCursorRGB(false);
    }

    this.colorPaletteDisplay.setHighlightGrid(gridX, gridY);

    // is mouse over a colour?
    var colorIndex = this.colorPaletteDisplay.getColorAtMapXY(gridX, gridY);
    if(colorIndex != this.colorPaletteDisplay.noColor && colorIndex < this.colors.length) {
      this.setHighlightColor(this.colors[colorIndex]);
    }

    if((this.buttons & UI.LEFTMOUSEBUTTON) && !this.leftMouseUp) {
      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        this.applyGridTool(gridX, gridY, event);
      }

      if(this.currentTool == 'select' && !this.colorPaletteDisplay.getInDragMarquee()) {
        var marqueeX = this.gridMouseDownX;
        var marqueeY = this.gridMouseDownY;
        var marqueeWidth = gridX - this.gridMouseDownX + 1;
        var marqueeHeight = gridY - this.gridMouseDownY + 1;

        if(gridX < this.gridMouseDownX) {
          marqueeX = gridX;
          marqueeWidth = this.gridMouseDownX - gridX + 1;
        }

        if(gridY < this.gridMouseDownY) {
          marqueeY = gridY;
          marqueeHeight = this.gridMouseDownY - gridY + 1;
        }
        this.colorPaletteDisplay.setMarqueeBounds(marqueeX, marqueeY, marqueeWidth, marqueeHeight);
      }

    }

    this.colorPaletteDisplay.draw();

    if(this.currentTool == 'ramp') {
      this.rampMove(gridX, gridY);
    }

  },

  gridMouseUp: function(event, gridX, gridY) {

    if(this.currentTool == 'select') {
      if(this.pageMouseDownX == event.pageX && this.pageMouseDownY == event.pageY) {
        this.colorPaletteDisplay.setMarqueeEnabled(false);
      }
    }

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

    if(this.currentTool == 'ramp') {
      this.rampEnd(gridX, gridY);
    }


    if(this.colorsChanged) {
      this.historySaveState();
      this.colorsChanged = false;

      this.setGraphData();
    }

  },

  mouseDown: function(event) {
  },


  setMouseCursor: function(event) {
    if(this.mouseInGrid) {

      if(event.altKey) {
        UI.setCursor('eyedropper');
        return;
      }

      switch(this.currentTool) {
        case 'pen':
          UI.setCursor('draw');
        break;
        case 'erase':
          UI.setCursor('erase');
        break;
        case 'eyedropper':
          UI.setCursor('eyedropper');
        break;
        case 'move':
          UI.setCursor('move');
        break;
        case 'select':
          UI.setCursor('select');
        break;
      }
    }

  },


  keyDown: function(event) {

    var keyCode = event.keyCode;
    

    if(typeof event.key != 'undefined') {
      if(event.ctrlKey || event.metaKey) {
        switch(event.key.toUpperCase()) {
          case 'Z':
            if(event.shift) {
              this.redo();
            } else {
              this.undo();
            }
          break;
        }
      }
    }

    var c = String.fromCharCode(keyCode).toUpperCase();

    switch(c) {
      case keys.textMode.toolsPencil.key:
        this.setColorPaletteTool('pen');
      break;
      case keys.textMode.toolsErase.key:
        this.setColorPaletteTool('erase');
      break;
      case keys.textMode.toolsEyedropper.key:
        this.setColorPaletteTool('eyedropper');      
      break;
      case keys.textMode.toolsMove.key:
        this.setColorPaletteTool('move');      
      break;
      case keys.textMode.toolsMarquee.key:
        this.setColorPaletteTool('select');      
      break;

    }

    this.setMouseCursor(event);

  },

  keyUp: function(event) {
    this.setMouseCursor(event);

  },

  keyPress: function(event) {

  },


  imageMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var newScale = this.imageScale - wheel.spinY  / 8;//12;

    if(this.imageMouseDownX !== false && this.imageMouseDownY !== false)  {
      this.imageMouseDownX = this.imageCanvas.width / 2 + newScale * (this.imageMouseDownX - this.imageCanvas.width / 2) / this.imageScale;
      this.imageMouseDownY = this.imageCanvas.height / 2 + newScale * (this.imageMouseDownY - this.imageCanvas.height / 2) / this.imageScale;

/*
      this.imageMouseDownX = false;
      this.imageMouseDownY = false;
*/

    }


    this.imageScale = newScale;


    this.updateImportImage();
  },


  dblClickImage: function(event) {
    this.setSelectedColor(this.highlightColor);
    this.addSelectedColor();
  },


  mouseLeaveImage: function(event) {
    if(this.mouseDownOnImage) {
      UI.captureMouse(this);
    }
  },

  mouseDownImage: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'FromImageImage').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImageImage').offset().top;


    this.imageMouseDownX = x;
    this.imageMouseDownY = y;
    this.currentImageMouseDownX = x;
    this.currentImageMouseDownY = y;
    this.updateImportImage();


    this.setSelectedColor(this.highlightColor);

    this.mouseDownAtX = event.pageX;//e.clientX;
    this.mouseDownAtY = event.pageY;//e.clientY;
    this.currentOffsetX = this.imageX;
    this.currentOffsetY = this.imageY;
    this.mouseDownOnImage = true;

//    UI.captureMouse(this);


  },

  mouseMoveImage: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'FromImageImage').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImageImage').offset().top;

    var color = this.xyToImageColor(x, y);

    if(color) {
      this.setHighlightColor(color);
    }

    if(this.mouseDownOnImage) {

      var x = event.pageX;
      var y = event.pageY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;

//      diffX = (diffX / this.imageScale);
//      diffY = (diffY / this.imageScale);

      this.imageX = this.currentOffsetX + diffX / this.imageScale;
      this.imageY = this.currentOffsetY + diffY / this.imageScale;


      this.imageMouseDownX = this.currentImageMouseDownX + diffX;
      this.imageMouseDownY = this.currentImageMouseDownX + diffY;


      this.updateImportImage();
    }
  },


  mouseDownPalette: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'FromImagePalette').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImagePalette').offset().top;


  },
  mouseMovePalette: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'FromImagePalette').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImagePalette').offset().top;

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
  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'FromImageImage').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImageImage').offset().top;

    if(this.activeSlider !== false) {
      this.mouseMoveSlider(event);
    }

    if(this.colorWheelValueMouseIsDown) {
      this.colorWheelValueMouseMove(event);
      return;
    }

    if(this.colourWheelMouseIsDown) {
      this.colorWheelMouseMove(event);
      return;
    }


    if(this.mouseDownOnImage 
      || (x > 0 
        && y > 0 
        && x < $('#' + this.prefix + 'FromImageImage').width() 
        && y < $('#' + this.prefix + 'FromImageImage').height())) {
      this.mouseMoveImage(event);
    }

    var x = event.pageX - $('#' + this.prefix + 'FromImagePalette').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'FromImagePalette').offset().top;

    if(x > 0 
        && y > 0 
        && x < $('#' + this.prefix + 'FromImagePalette').width() 
        && y < $('#' + this.prefix + 'FromImagePalette').height()) {
      this.mouseMovePalette(event);
    }



  },

  mouseUp: function(event) {
    if(this.colorWheelValueMouseIsDown) {
      this.colorWheelValueMouseUp(event);
      return;
    }

    if(this.colourWheelMouseIsDown) {
      this.colorWheelMouseUp(event);
      return;
    }


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




  mouseUpImage: function(event) {

  },

  generateGradient: function(args) {
    var type = args.type;
    var correctLightness = args.correctLightness;

    // https://gka.github.io/chroma.js/#quick-start
    console.log('generate gradient: ' + type);
    console.log(this.startColor + ',' + this.endColor);
    var scale = null;
    
    
    if(type == 'bezier') {
      scale = chroma.bezier(['#' + this.startColor, '#' + this.endColor]).scale();
    } else {
      scale = chroma.scale(['#' + this.startColor, '#' + this.endColor]);
    }

    if(correctLightness) {
      scale = scale.correctLightness();
    }

    console.log(scale);

    var steps = this.marqueeWidth * this.marqueeHeight;

    var colors = scale.colors(steps, 'hex');

    for(var i = 1; i < colors.length - 1; i++) {
      var y = this.marqueeTop + Math.floor(i / this.marqueeWidth);
      var x = this.marqueeLeft + i % this.marqueeWidth;

      var color = colors[i];
      if(color.indexOf('#') == 0) {
        color = color.substring(1);
      }
      
      color = parseInt(color, 16);      
      var colorIndex = this.colorMap[y][x];

      if(colorIndex === this.editor.colorPaletteManager.noColor) {
        // need to add a colour
        colorIndex = this.colors.length;
        this.colors.push(color);
        this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
        this.colorPaletteDisplay.setColorAtMapXY(x, y, colorIndex);
      } else {
        this.colors[colorIndex] = color;
        this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
      }    
    }
    this.setGraphData();
    this.paramGraph.draw(); 
  },

  setStartEndColors: function() {
    var startColorIndex = this.colorPaletteDisplay.getColorAtMapXY(this.marqueeLeft, this.marqueeTop);

    if(startColorIndex !== this.colorPaletteDisplay.noColor) {
      var color = this.colors[startColorIndex];
      
      var colorHexString = ("000000" + color.toString(16)).substr(-6);
      this.startColor = colorHexString;
      $('#colorPaletteEditorFrom').css('background-color', '#' + colorHexString);
    }

    var endColorIndex = this.colorPaletteDisplay.getColorAtMapXY(this.marqueeLeft + this.marqueeWidth - 1, this.marqueeTop + this.marqueeHeight - 1);
    if(endColorIndex !== this.colorPaletteDisplay.noColor) {
      var color = this.colors[endColorIndex];
      
      var colorHexString = ("000000" + color.toString(16)).substr(-6);
      this.endColor = colorHexString;
      $('#colorPaletteEditorTo').css('background-color', '#' + colorHexString);
    }
  },


  marqueeChanged: function(left, top, width, height) {
    if(left === this.marqueeLeft && top === this.marqueeTop && width === this.marqueeWidth && height === this.marqueeHeight) {
      return;
    }
    this.marqueeLeft = left;
    this.marqueeTop = top;
    this.marqueeWidth = width;
    this.marqueeHeight = height;
    this.setGraphData();
    this.setStartEndColors();
  },


  setGraphData: function() {
    this.marqueeColors = [];
    this.marqueeColorsComponent = [];

    this.colorMap = this.colorPaletteDisplay.getColorMap();
    for(var y = this.marqueeTop; y < this.marqueeTop + this.marqueeHeight; y++) {
      for(var x = this.marqueeLeft; x < this.marqueeLeft + this.marqueeWidth; x++) {
        if(y < this.colorMap.length && x < this.colorMap[y].length) {
          var colorIndex = this.colorMap[y][x];
          var color = 0;
          if(colorIndex !== this.editor.colorPaletteManager.nocolor) {
            color = this.colors[colorIndex];
          }


          var value = 0;

          this.marqueeColors.push({ x: x, y: y });
          if(this.graphParam === 'red' || this.graphParam == 'green' || this.graphParam == 'blue') {
            this.paramGraph.setBounds(0, 255);

            if(this.graphParam === 'red') {
              value = (color >> 16) & 0xff;
            }
            if(this.graphParam === 'green') {
              value = (color >> 8) & 0xff;
            }
            if(this.graphParam === 'blue') {
              value = (color) & 0xff;
            }

          }

          if(this.graphParam == 'hue' || this.graphParam == 'saturation' || this.graphParam == 'value') {
            var r = (color & 0xff0000) >> 16;
            var g = (color >> 8) & 0xff;
            var b = (color) & 0xff;

            var hsv = rgb2hsv(r, g, b);
            if(this.graphParam == 'hue') {
              this.paramGraph.setBounds(0, 359);
              value = Math.round(hsv[0] * 360);
            }

            if(this.graphParam == 'saturation') {
              this.paramGraph.setBounds(0, 100);
              value = Math.round(hsv[1] * 100);
            }

            if(this.graphParam == 'value') {
              this.paramGraph.setBounds(0, 100);
              value = Math.round(hsv[2] * 100);
            }

          }
          this.marqueeColorsComponent.push(value);
        }
      }
    }

    this.paramGraph.setData(this.marqueeColorsComponent);

    this.paramGraph.draw();

  },


  setGraphParam: function(param) {
    this.graphParam = param;
    this.setGraphData();
  },

  paramChanged: function(index, value) {
    if(index === false || index < 0 || index >= this.marqueeColors.length) {
      return;
    }
    var x = this.marqueeColors[index].x;
    var y = this.marqueeColors[index].y;

    var colorIndex = this.colorMap[y][x];

    if(colorIndex === this.editor.colorPaletteManager.noColor) {
      // need to add a colour
      colorIndex = this.colors.length;
      this.colors.push(this.selectedColor);
      this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross, createColorMap: false });
      this.colorPaletteDisplay.setColorAtMapXY(x, y, colorIndex);
    }
    
    
    if(colorIndex !== this.editor.colorPaletteManager.noColor) {
      var color = this.colors[colorIndex];
      var alpha = 0xff;


      if(this.graphParam == 'red') {
        this.colors[colorIndex] = ((color & 0xff00ffff) | (value << 16)) >>> 0;
      }

      if(this.graphParam == 'green') {
        this.colors[colorIndex] = ((color & 0xffff00ff) | (value << 8)) >>> 0;        
      }

      if(this.graphParam == 'blue') {
        this.colors[colorIndex] = ((color & 0xffffff00) | (value)) >>> 0;        
      }      

      if(this.graphParam == 'hue' || this.graphParam == 'saturation' || this.graphParam == 'value') {
        var r = (color & 0xff0000) >> 16;
        var g = (color >> 8) & 0xff;
        var b = (color) & 0xff;

        var hsv = rgb2hsv(r, g, b);
        var rgb = [];
        if(this.graphParam == 'hue') {
          rgb = hsv2rgb(value, hsv[1], hsv[2]);
        }
        if(this.graphParam == 'saturation') {
          rgb = hsv2rgb(hsv[0]*360, value / 100, hsv[2]);
        }

        if(this.graphParam == 'value') {
          rgb = hsv2rgb(hsv[0]*360, hsv[1], value / 100);
        }

        var r = (Math.round(rgb[0])) >>> 0;
        var g = (Math.round(rgb[1])) >>> 0;
        var b = (Math.round(rgb[2])) >>> 0;   
        var a = (0xff) >>> 0;     
        this.colors[colorIndex] = ((a << 24) + ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff))) >>> 0;


      }


      this.colorPaletteDisplay.setColors(this.colors);
      this.colorsChanged = true;
    }

    // prob only need to do this if its first or last colour changed
    this.setStartEndColors();

//    this.drawPalette();
  },


  paramGraphMouseUp: function(event) {
    if(this.colorsChanged) {
      this.historySaveState();
      this.colorsChanged = false;

//      this.setGraphData();
    }

  },

  addColorsFromImage: function() {
    this.addColors(this.imageColors);
  },

  addColors: function(colors) {

    var avoidDuplicates = false;

    var colorMap = this.colorPaletteDisplay.getColorMap();

    var mapX = 0;
    var mapY = 0;
    for(var y = 0; y < colorMap.length; y++) {
      var rowBlank = true;
      for(var x = 0; x < colorMap[y].length; x++) {
        if(colorMap[y][x] != this.editor.colorPaletteManager.noColor) {
          rowBlank = false;
          break;
        }
      }

      if(rowBlank) {
        mapX = 0;
        mapY = y;
        break;
      }
    }

//    for(var i = 0; i < this.imageColors.length; i++) {
    for(var i = 0; i < colors.length; i++) {  
      var color = colors[i];
      var found = false;
      for(var j = 0; j < this.colors.length; j++) {
        if(this.colors[j] == color) {
          found = true;
          break;
        }
      }

      if(!found) {
        var mapSlot = colorMap[mapY][mapX];
        while(mapSlot !== this.editor.colorPaletteManager.noColor) {
          mapX++;
          if(mapX >= colorMap[mapY].length) {
            mapX = 0;
            mapY++;
            if(mapY >= colorMap.length) {
              // uh oh
              break;
            }
          }

          mapSlot = colorMap[mapY][mapX];
        }

        if(mapY < colorMap.length) {

          var colorIndex = this.colors.length;
          this.colors.push(color);

          colorMap[mapY][mapX] = colorIndex;
        } else {
           break;
        }

        // need to add it to the map
      }
    }

    this.colorPaletteDisplay.setColors(this.colors, { colorsAcross: this.colorsAcross });

    this.historySaveState();
  },


  downloadPNG: function(args) {
    var filename = 'palette.png';
    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }
    }

    var width = 0;
    var height = 0;
    for(var y = 0; y < this.colorMap.length; y++) {
      for(var x = 0; x < this.colorMap[y].length; x++) {
        if(this.colorMap[y][x] != this.editor.colorPaletteManager.noColor) {
          if(x + 1 > width) {
            width = x + 1;
          }
          height = y + 1;
        }
      }
    }

    if(this.exportCanvas == null) { 
      this.exportCanvas = document.createElement("canvas");
    }
    var colorSize = 16;
    this.exportCanvas.width = width * colorSize;
    this.exportCanvas.height = height * colorSize;
    this.exportContext = this.exportCanvas.getContext('2d');
    this.exportContext.clearRect(0, 0, this.exportCanvas.width, this.exportCanvas.height);

//    var imageData = this.exportContext.getImageData(0, 0, this.exportCanvas.width, this.exportCanvas.height);
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        if(this.colorMap[y][x] != this.editor.colorPaletteManager.noColor) {
          var colorIndex = this.colorMap[y][x];
          var color = this.colors[colorIndex] & 0xffffff;
          var alpha = (this.colors[colorIndex] >>> 24) & 0xff;
          var colorHexString = ("000000" + color.toString(16)).substr(-6);

          this.exportContext.fillStyle = '#' + colorHexString;
          this.exportContext.fillRect(x * colorSize, y * colorSize, colorSize,  colorSize);
        }

      }
    }


    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }

    var dataURL = this.exportCanvas.toDataURL("image/png");
    download(dataURL, filename, "image/png");    
  },


  colorWheelXYToColor: function(x, y) {
//    console.log(x + ',' + y);
    x = x - this.colorWheelRadius;
    y = y - this.colorWheelRadius;
    
    var result = xy2polar(x, y);
    var r = result[0];
    var phi = result[1];
    
    if (r > this.colorWheelRadius) {
      // skip all (x,y) coordinates that are outside of the circle
      r = this.colorWheelRadius;
      //return false;
    }
    
    var deg = rad2deg(phi);
    var hue = deg;
    var saturation = r / this.colorWheelRadius;
    var value = 1.0;

    result = polar2xy(r, phi);
    x = this.colorWheelRadius + result[0];
    y = this.colorWheelRadius + result[1];

//    console.log(hue + ',' + saturation + ',' + value);

    /*
    var rgbColor = 0;
    rgbColorParts = hsv2rgb(hue, saturation, this.v / 100);
    rgbColor =  (  (rgbColorParts[0] & 0xff) << 16) + ( (rgbColorParts[1] & 0xff) << 8) + (rgbColorParts[0] & 0xff);
    */

    var rgb = hsv2rgb(hue, saturation, this.v/100);
    var r = Math.round(rgb[0]);
    var g = Math.round(rgb[1]);
    var b = Math.round(rgb[2]);
    var rgbColor = ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff));
    this.setHighlightColor(rgbColor);

    return { "hue": hue, "saturation": saturation, "value": value, x: x, y: y };
  },

  setColorWheelColor: function(x, y) {
    var selectedColor = this.colorWheelXYToColor(x, y);
    if(selectedColor !== false) {
      this.selectedColorWheelColor = this.colorWheelXYToColor(x, y);

//      var result = polar2xy
      this.selectedColorWheelColorX = this.selectedColorWheelColor.x;
      this.selectedColorWheelColorY = this.selectedColorWheelColor.y;

      this.h = this.selectedColorWheelColor.hue;
      this.s = this.selectedColorWheelColor.saturation * 100;
      this.setHSV();
//      this.setV(this.selectedColorWheelColor.value);

      this.drawColorWheel();
    }
  },

  setColorWheelHSV: function() {
    
    var result = polar2xy(this.s/100 * this.colorWheelRadius, (this.h - 180) * Math.PI / 180);
    this.selectedColorWheelColorX = this.colorWheelRadius + result[0];
    this.selectedColorWheelColorY = this.colorWheelRadius + result[1];

    this.setColorWheelValue(this.v/100);
  },
  setColorWheelValue: function(value) {
    if(value < 0) {
      value = 0;
    }

    if(value > 1) {
      value = 1;
    }
    this.colorWheelValue = value;
    this.v = value * 100;
    this.setHSV();
    this.updateColorWheelImage();
    this.drawColorWheel();
  },

  colorWheelValueHover: function(value) {
    if(value < 0) {
      value = 0;
    }

    if(value > 1) {
      value = 1;
    }    
    var rgb = hsv2rgb(this.h, this.s/100, value);
    var r = Math.round(rgb[0]);
    var g = Math.round(rgb[1]);
    var b = Math.round(rgb[2]);
    var rgbColor = ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff));
    this.setHighlightColor(rgbColor);

  },

  colorWheelValueMouseDown: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'ColorWheelValue').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheelValue').offset().top;

    this.colorWheelValueMouseIsDown = true;

    var height = 200;
    var value = 1 - y / height;
    this.setColorWheelValue(value);

    UI.captureMouse(this);

  },

  colorWheelValueMouseMove: function(event) {


    var x = event.pageX - $('#' + this.prefix + 'ColorWheelValue').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheelValue').offset().top;
    var height = 200;
    var value = 1 - y / height;

    if(this.colorWheelValueMouseIsDown) {
      this.setColorWheelValue(value);
    } else {
      this.colorWheelValueHover(value);
    }

  },

  colorWheelValueMouseUp: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'ColorWheelValue').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheelValue').offset().top;

    this.colorWheelValueMouseIsDown = false;

  },

  colorWheelMouseDown: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'ColorWheel').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheel').offset().top;

    this.setColorWheelColor(x, y);
    this.colourWheelMouseIsDown = true;
    UI.captureMouse(this);

  },

  colorWheelMouseMove: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'ColorWheel').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheel').offset().top;

    if(this.colourWheelMouseIsDown) {
      this.setColorWheelColor(x, y);
    } else {
      this.colorWheelXYToColor(x, y);
    }
  },

  colorWheelMouseUp: function(event) {
    var x = event.pageX - $('#' + this.prefix + 'ColorWheel').offset().left;
    var y = event.pageY - $('#' + this.prefix + 'ColorWheel').offset().top;

    this.colourWheelMouseIsDown = false;

  },

  updateColorWheelValue: function() {
    var width = 20;
    var height = 200;

    if(this.colorWheelValueCanvas == null) {
      this.colorWheelValueCanvas = document.getElementById(this.prefix + 'ColorWheelValue');
      this.colorWheelValueContext = this.colorWheelValueCanvas.getContext('2d');

      var _this = this;
      $('#' + this.prefix + 'ColorWheelValue').on('mousemove', function(event) {
        _this.colorWheelValueMouseMove(event);
      });

      $('#' + this.prefix + 'ColorWheelValue').on('mousedown', function(event) {
        _this.colorWheelValueMouseDown(event);
      });


      $('#' + this.prefix + 'ColorWheelValue').on('mouseup', function(event) {
        _this.colorWheelValueMouseUp(event);
      });


    }
/*
    if(this.colorWheelValueImage == null) {
      console.log('set image');
      this.colorWheelValueImage = this.colorWheelValueContext.createImageData(width, height);
    }
*/

    var canvas = this.colorWheelValueCanvas;
    this.colorWheelValueContext.clearRect(0, 0, canvas.width, canvas.height);
    var imageData = this.colorWheelValueContext.getImageData(0, 0, canvas.width, canvas.height);

    var data = imageData.data;

    var index = 0;
    var width = canvas.width;

    var triangleWidth = 4;

    for(var y = 0; y < height; y++) {
      var value = Math.round( (1 - (y / height)) * 255);
      index += triangleWidth * 4;
      for(var x = triangleWidth; x < width; x++) {
        data[index] = value;
        data[index+1] = value;
        data[index+2] = value;
        data[index+3] = 255;

        index += 4;

      }
    }
    this.colorWheelValueContext.putImageData(imageData, 0, 0);

    var cursorPos = 50;

    var height = 200;
//    var value = 1 - y / height;
    //this.setColorWheelValue(value);

    cursorPos = -(this.colorWheelValue - 1) * height;


    this.colorWheelValueContext.globalAlpha = 0.6;
    this.colorWheelValueContext.strokeStyle = '#ffffff';
    this.colorWheelValueContext.beginPath();
    this.colorWheelValueContext.moveTo(triangleWidth, cursorPos);
    this.colorWheelValueContext.lineTo(canvas.width, cursorPos);
    this.colorWheelValueContext.stroke();
    this.colorWheelValueContext.globalAlpha = 1;


    this.colorWheelValueContext.fillStyle = '#ffffff';
    this.colorWheelValueContext.beginPath();
    this.colorWheelValueContext.moveTo(triangleWidth, cursorPos);
    this.colorWheelValueContext.lineTo(0, cursorPos + 2);
    this.colorWheelValueContext.lineTo(0, cursorPos - 2);
    this.colorWheelValueContext.fill();


  },

  updateColorWheelImage: function() {

    if(this.colorWheelImage == null) {
      this.colorWheelImage = this.colorWheelContext.createImageData(2*this.colorWheelRadius, 2*this.colorWheelRadius);
    }

    var data = this.colorWheelImage.data;

    for (var x = -this.colorWheelRadius; x < this.colorWheelRadius; x++) {
      for (var y = -this.colorWheelRadius; y < this.colorWheelRadius; y++) {
        
        var result = xy2polar(x, y);
        var r = result[0];
        var phi = result[1];

        if (r > this.colorWheelRadius) {
          // skip all (x,y) coordinates that are outside of the circle
          continue;
        }
        
        var deg = rad2deg(phi);
        
        // Figure out the starting index of this pixel in the image data array.
        var rowLength = 2*this.colorWheelRadius;
        var adjustedX = x + this.colorWheelRadius; // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
        var adjustedY = y + this.colorWheelRadius; // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)
        var pixelWidth = 4; // each pixel requires 4 slots in the data array
        var index = (adjustedX + (adjustedY * rowLength)) * pixelWidth;
        
        var hue = deg;
        var saturation = r / this.colorWheelRadius;
        var value = this.colorWheelValue;
        
        var result = hsv2rgb(hue, saturation, value);
        var red = result[0];
        var green = result[1];
        var blue = result[2];
        var alpha = 255;
        
        data[index] = red;
        data[index+1] = green;
        data[index+2] = blue;
        data[index+3] = alpha;
      }
    }

  },

  drawColorWheel: function() {
    if(this.colorWheelCanvas == null) {
      this.colorWheelCanvas = document.getElementById(this.prefix + 'ColorWheel');

      var _this = this;
      $('#' + this.prefix + 'ColorWheel').on('mousemove', function(event) {
        _this.colorWheelMouseMove(event);
      });

      $('#' + this.prefix + 'ColorWheel').on('mousedown', function(event) {
        _this.colorWheelMouseDown(event);
      });


      $('#' + this.prefix + 'ColorWheel').on('mouseup', function(event) {
        _this.colorWheelMouseUp(event);
      });
    }

    this.colorWheelRadius = 100;
    var canvasWidth = this.colorWheelRadius * 2;
    var canvasHeight = this.colorWheelRadius * 2;
    this.colorWheelCanvas.width = canvasWidth;
    this.colorWheelCanvas.height = canvasHeight;


    this.colorWheelContext = this.colorWheelCanvas.getContext('2d');

    if(this.colorWheelImage == null) {
      this.updateColorWheelImage();
    }

    this.colorWheelContext.putImageData(this.colorWheelImage, 0, 0);


    this.updateColorWheelValue();

    if(this.selectedColorWheelColorX !== false && this.selectedColorWheelColorY !== false) {
      var x = this.selectedColorWheelColorX;
      var y = this.selectedColorWheelColorY;

      this.colorWheelContext.strokeStyle = '#333333';
      this.colorWheelContext.beginPath();
      this.colorWheelContext.arc(x,y, 2,0,2*Math.PI);
      this.colorWheelContext.stroke();
      this.colorWheelContext.strokeStyle = '#999999';
      this.colorWheelContext.beginPath();
      this.colorWheelContext.arc(x,y, 3,0,2*Math.PI);
      this.colorWheelContext.stroke();
    }


    /*
      this.colorWheelContext.strokeStyle = '#ff0000';
      this.colorWheelContext.beginPath();
      this.colorWheelContext.arc(200, 200, 2,0,2*Math.PI);
      this.colorWheelContext.stroke();
    */

  },

  drawImageColors: function() {

    var rows = Math.ceil(this.imageColors.length / 16);
    this.imagePaletteCanvas.style.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing + 'px';
    this.imagePaletteCanvas.style.height = rows * (this.colorHeight + this.colorSpacing) + this.colorSpacing + 'px';

    this.imagePaletteCanvas.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing;
    this.imagePaletteCanvas.height = rows * (this.colorHeight + this.colorSpacing) + this.colorSpacing;


    this.imagePaletteContext = this.imagePaletteCanvas.getContext('2d');





    var colorIndex = 0;
    for(var y = 0; y < 16; y++) {
      for(var x = 0; x < 16; x++) {
        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);

        if(colorIndex < this.imageColors.length) {
          var color = this.imageColors[colorIndex];
          if(color !== false) {
            var colorHexString = ("000000" + color.toString(16)).substr(-6);

            this.imagePaletteContext.fillStyle = '#' + colorHexString;

            this.imagePaletteContext.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
          } else {
            this.imagePaletteContext.fillStyle = '#444444';
            this.imagePaletteContext.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);

          }
        } else {
//          console.log('color hex string = ' + colorHexString);

          this.imagePaletteContext.fillStyle = '#444444';
          this.imagePaletteContext.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
        }
        colorIndex++;
      }

/*
      for(x = this.colorsAcross; x < 16; x++) {
        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);
        this.context.fillStyle = '#444444';
        this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
      }
*/
    }

  },

  update: function() {
    if(!this.colorPaletteDisplay) {
      return;
    }
    if(this.colorPaletteDisplay.marquee !== false) {
      if(this.lastDashOffset != this.editor.lastDashOffset ) {
        this.lastDashOffset = this.editor.lastDashOffset;      
        this.colorPaletteDisplay.draw();
      }
    }

  },

  drawPalette: function() {
    this.colorPaletteDisplay.draw();

    /*
    this.context = this.colorPaletteCanvas.getContext('2d');

    var colorIndex = 0;
    for(var y = 0; y < this.colorsDown; y++) {
      for(var x = 0; x < this.colorsAcross; x++) {
        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);

        if(colorIndex < this.colors.length) {
          var color = this.colors[colorIndex];
          if(color !== false) {
            var colorHexString = ("000000" + color.toString(16)).substr(-6);

            this.context.fillStyle = '#' + colorHexString;

            this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
          } else {
            this.context.fillStyle = '#444444';
            this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);

          }
        } else {
//          console.log('color hex string = ' + colorHexString);

          this.context.fillStyle = '#444444';
          this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
        }
        colorIndex++;
      }

      for(x = this.colorsAcross; x < 16; x++) {
        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);
        this.context.fillStyle = '#444444';
        this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
      }

    }
    */

  }
}