var ImportColorUtils = function() {
  this.editor = null;

  this.colorsRGB = [];
  this.colorsLABA = [];  

}

ImportColorUtils.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  initColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.colorsRGB = [];
    this.colorsLABA = [];

    for(var i = 0; i < colorPalette.getColorCount(); i++) {  

      var colorHex = colorPalette.getHex(i);

      var r = (colorHex >> 16) & 255;
      var g = (colorHex >> 8) & 255;
      var b = colorHex & 255;  

      var color = {};
      color.values = [r,g,b,255];
      color = Colour.converters[Colour.RGBA][Colour.LABA](color);
      this.colorsRGB[i] = [r,g,b];
      this.colorsLABA[i] = [color.values[0], color.values[1], color.values[2]];
    }
  },


  // get the image data in laba space
  // https://en.wikipedia.org/wiki/Lab_color_space
  imageDataToLABA: function(imageData) {
    this.imageDataLABA = [];

    var data = [];
    var color = {};
    for(var i = 0; i < imageData.data.length; i += 4) {
      data[0] = imageData.data[i];
      data[1] = imageData.data[i + 1];
      data[2] = imageData.data[i + 2];
      data[3] = imageData.data[i + 3];
      color.values = data;
      color = Colour.converters[Colour.RGBA][Colour.LABA](color);

      this.imageDataLABA[i] = color.values[0];
      this.imageDataLABA[i + 1] = color.values[1];
      this.imageDataLABA[i + 2] = color.values[2];
      this.imageDataLABA[i + 3] = imageData.data[i + 3];;//color.values[3];
    }
  },    

  findColors2: function(imageData, useColors) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    // get the colors as rgb
    var colors = [];
    // loop through chosen colors, find the rgb values
    for(var i = 0; i < useColors.length; i++) {
      var color = colorPalette.getHex(useColors[i]);
      var r = (color >> 16) & 255;
      var g = (color >> 8) & 255;
      var b = color & 255;  

      colors.push([r,g,b]);
    }
    var method = 2;


    var opts = {  method: method, palette: colors, dithKern: null };

//    ImageUtils.rgbQuant(imageData, );//colors, dithKern);

    var q = new RgbQuant(opts);
    q.sample(imageData);      
    var palette = q.palette(true, true);//false, false);

  },


  /*
  // -- for each square, calculate its 2 colours, if square has 2 colours then score increases for each of the colour

  findBGColors: function(imageData, useColors) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      reutrn;
    }

    var tileSet = layer.getTileSet();

    this.initColors();
    this.imageDataToLABA(imageData);


    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.importFromX = 0;
    this.importFromY = 0;
    this.importToX = this.editor.frames.width;
    this.importToY = this.editor.frames.height;

    imageColors = [];
    for(var i = 0; i < useColors.length; i++) {
      imageColors[i] = {"color": useColors[i], "timesUsed": 0};
    }

    for(var y1 = this.importFromY; y1 < this.importToY; y1++) {
      for(var x1 = this.importFromX; x1 < this.importToX; x1++) {

        var cellColorScores = [];
        for(var i = 0; i < useColors.length; i++) {
          cellColorScores[i] = 0;
        }

        // find the best 2 colors for this block...
        for(var colorIndex = 0; colorIndex < useColors.length; colorIndex++) {
          var color = useColors[colorIndex];
          var testScore = 0;

          var colorFound = false;

          for(cy = 0; cy < tileSet.charHeight; cy++) {
            for(cx = 0; cx < tileSet.charWidth; cx++) {
              var offset = (y1 * tileSet.charHeight * imageData.width * 4) + (x1 * tileSet.charWidth * 4) 
                            + (cy * imageData.width * 4) + cx * 4;

              // values for color we're trying
              var r = this.colorsLABA[color][0];
              var g = this.colorsLABA[color][1];
              var b = this.colorsLABA[color][2];

              // values for image
              var r2 = this.imageDataLABA[offset++];
              var g2 = this.imageDataLABA[offset++];
              var b2 = this.imageDataLABA[offset++];
              var a2 = this.imageDataLABA[offset++];

              if(a2 == 0) {
                // transparent
//                testScore += 100;
              } else {
                // find the difference
                colorFound = true;
                
                testScore += Math.abs(r2 - r);
                testScore += Math.abs(g2 - g);
                testScore += Math.abs(b2 - b);
              }
            }
          }

          cellColorScores[colorIndex] = testScore;

        }
      }
    }

  },
*/


  // find colors, sort them by order used, used to find background colour
  findColors: function(imageData, useColors) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    this.initColors();
    this.imageDataToLABA(imageData);

    this.importFromX = 0;
    this.importFromY = 0;
    this.importToX = this.editor.frames.width;
    this.importToY = this.editor.frames.height;

    imageColors = [];
    for(var i = 0; i < useColors.length; i++) {
      imageColors[i] = {"color": useColors[i], "timesUsed": 0};
    }

    for(var y1 = this.importFromY; y1 < this.importToY; y1++) {
      for(var x1 = this.importFromX; x1 < this.importToX; x1++) {

        var score = 99999999;
        var chosenColor = -1;
        var chosenColorIndex = -1;

        // find the best color for this block...
        for(var colorIndex = 0; colorIndex < useColors.length; colorIndex++) {
          var color = useColors[colorIndex];

          var testScore = 0;

          var colorFound = false;

          for(cy = 0; cy < tileSet.charHeight; cy++) {
            for(cx = 0; cx < tileSet.charWidth; cx++) {
              var offset = (y1 * tileSet.charHeight * imageData.width * 4) + (x1 * tileSet.charWidth * 4) 
                            + (cy * imageData.width * 4) + cx * 4;

              // values for color we're trying
              var r = this.colorsLABA[color][0];
              var g = this.colorsLABA[color][1];
              var b = this.colorsLABA[color][2];

              // values for image
              var r2 = this.imageDataLABA[offset++];
              var g2 = this.imageDataLABA[offset++];
              var b2 = this.imageDataLABA[offset++];
              var a2 = this.imageDataLABA[offset++];

              if(a2 == 0) {
                // transparent
                testScore += 100;
              } else {
                // find the difference
                colorFound = true;
                testScore += Math.abs(r2 - r);
                testScore += Math.abs(g2 - g);
                testScore += Math.abs(b2 - b);
              }
            }
          }

          if(testScore < score && colorFound) {
            score = testScore;
            chosenColor = color;
            chosenColorIndex = colorIndex;
          }
        }

        if(chosenColor == -1) {
          // shouldn't get here...
//          console.log("NO COLOR FOUND!!!!!!!!!");
        } else {

          imageColors[chosenColorIndex].timesUsed++;
        }
      }
    }

    imageColors.sort(function(a, b) {
      return b.timesUsed - a.timesUsed;
    });

    return imageColors;
  },


  // convert imagedata to black and white using floyd steinberg
  rgbQuant: function(imageData, blackAndWhite) {

alert('is this ever used??');
//return;
    if(typeof blackAndWhite == 'undefined') {
      blackAndWhite = false;
    }


    if(this.useColors == 'choose' && typeof this.customColorSet != 'undefined' ) {
      this.colors = [];
      for(var i = 0; i < this.customColorSet.length; i++) {
        this.colors.push(this.customColorSet[i]);
      } 
    } else if(this.useColors == 'greyscale') {
      this.colors = [];

      for(var i = 0; i < this.editor.petscii.colors.length; i++) {
        if(this.editor.petscii.colors[i].isGrey) {
          this.colors.push(this.editor.petscii.colors[i].index)
        }
      }

    } else {
      this.colors = [];
      for(var i = 0; i < this.editor.petscii.colors.length; i++) {
        this.colors.push(i);
      }      
    }    

    var opts = {
        colors: 256,             // desired palette size
        method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
        boxSize: [64,64],        // subregion dims (if method = 2)
        boxPxls: 2,              // min-population threshold (if method = 2)
        initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
        minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
        dithKern: null,          // dithering kernel name, see available kernels in docs below
        dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
        dithSerp: false,         // enable serpentine pattern dithering
        palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
        reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
        useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
        cacheFreq: 10,           // min color occurance count needed to qualify for caching
        colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
    };

//  opts.dithKern = 'FloydSteinberg';
  

    var colors = [];

    // loop through chosen colors, find the rgb values
    for(var i = 0; i < this.colors.length; i++) {
      colors.push(this.editor.petscii.getColor(this.colors[i]));
    }

//    opts.dithKern = 'FloydSteinberg';

    if(this.isVideo) {
//videoToPetsciiDither
      opts.dithKern = $('input[name=videoToPetsciiDither]:checked').val();
    } else {
      opts.dithKern = $('input[name=toPetsciiDither]:checked').val();
    }

    opts.colors = colors.length;


    for(var i = 0; i < colors.length; i++) {
        var r = (colors[i] >> 16) & 255;
        var g = (colors[i] >> 8) & 255;
        var b = colors[i] & 255;  
        opts.palette[i] = [r,g,b];

    }

    var q = new RgbQuant(opts);

    q.sample(imageData);      
    var pal = q.palette();

    var alphas = [];
//    for (var i = 0, len = this.imageData.length; i < len; ++i) {
    for(var i =0 ; i < imageData.data.length; i++) {
      if( (i + 1) % 4 == 0) {
//        console.log(".");
        alphas.push(imageData.data[i]);
      }
    }

    var outImageData = q.reduce(imageData);

    var alphaCount = 0;
    for(var i = 0; i < imageData.data.length; i++) {
      if( (i + 1) % 4) {
      } else {
        imageData.data[i] = alphas[alphaCount++];
      }
    }
  },  
}