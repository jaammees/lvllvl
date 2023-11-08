var MobileImport = function() {
  this.editor = null;

  this.colors = [];
  this.bgColors = [];
  this.characters = [];
  this.colorScores = [];

  this.blankCharacter = false;
  this.blockCharacter = false;

  this.useMultipleBGColors = false;  
  this.backgroundColorChoose = 'auto';

  this.vectorTileCanvas = null;
  this.vectorTileContext = null;
  this.vectorTileImageData = null;


  this.canvas = null;
  this.context = null;
  this.imageData = null;



  // selection of color-distance equation
  this.colorDist = distEuclidean;//args.colorDist == "manhattan" ? distManhattan : distEuclidean;
  // Rec. 709 (sRGB) luma coef
  var Pr = .2126,
    Pg = .7152,
    Pb = .0722;

  // color distance equations

  // http://alienryderflex.com/hsp.html
  function rgb2lum(r,g,b) {
    return Math.sqrt(
      Pr * r*r +
      Pg * g*g +
      Pb * b*b
    );
  }


  var rd = 255,
    gd = 255,
    bd = 255;

  var euclMax = Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd);
  // perceptual Euclidean color distance
  function distEuclidean(rgb0, rgb1) {
    var rd = rgb1[0] - rgb0[0],
      gd = rgb1[1] - rgb0[1],
      bd = rgb1[2] - rgb0[2];

    // dont really need the sqrt?
    return Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd) / euclMax;
  }

  var manhMax = Pr*rd + Pg*gd + Pb*bd;
  // perceptual Manhattan color distance
  function distManhattan(rgb0, rgb1) {
    var rd = Math.abs(rgb1[0]-rgb0[0]),
      gd = Math.abs(rgb1[1]-rgb0[1]),
      bd = Math.abs(rgb1[2]-rgb0[2]);

    return (Pr*rd + Pg*gd + Pb*bd) / manhMax;
  }
}

MobileImport.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.charactersHasSpace = true;
    this.charactersHasBlock = true;    

    /*
    var debugCanvas = '<canvas width="320" height="200" style="background-color: black; display: none; position: absolute; bottom: 0; right: 0" id="mobileDebugCanvas"></canvas>';
    $('body').append(debugCanvas);

    this.canvas = document.getElementById('mobileDebugCanvas');
    */

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
  },

  setColors: function(colors) {
    this.colors = [];
    for(var i = 0; i < colors.length; i++) {
      this.colors.push(colors[i]);
    }
  },

  setBGColors: function(bgColors) {


    this.bgColors = [];
    for(var i = 0; i < bgColors.length; i++) {
      this.bgColors.push(bgColors[i]);
    }
  },

  setBackgroundColorChoose: function(backgroundColorChoose) {
    this.backgroundColorChoose = backgroundColorChoose;    
  },


  setCharacters: function(characters) {
    var tileSetManager = this.editor.tileSetManager;
    var tileSet = tileSetManager.getCurrentTileSet();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();


    this.blankCharacter = false;
    this.blockCharacter = false;

    if(tileSet.getType() == 'vector') {
      this.blankCharacter = tileSet.getBlankTile();
      this.blockCharacter = tileSet.getBlockTile();
    }


    this.characters = [];
    for(var i = 0; i < characters.length; i++) {
      this.characters.push(characters[i]);


      if(tileSet.getType() == 'vector') {
        if(this.blockCharacter === false) {
          var block = true;
          for(var y = 0; y < charHeight; y++) {
            for(var x = 0; x < charWidth; x++) {
              var pixel = tileSet.getPixel(characters[i], x, y) ;
              if(pixel == 0) {
                block = false;
                y = charHeight;
                break;
              }
            }
          }
          if(block == true) {
            this.blockCharacter = characters[i];
          }
        }
        if(this.blankCharacter === false) {
          // check if this is a blank character
          var blank = true;
          for(var y = 0; y < charHeight; y++) {
            for(var x = 0; x < charWidth; x++) {
              var pixel = tileSet.getPixel(characters[i], x, y);
              if(pixel > 0) {
                blank = false;
                y = charHeight;
                break;
              }
            }
          }
          if(blank == true) {
            this.blankCharacter = characters[i];
          }
        }
      }
    }

    this.initCharSet();
  },


  initCharSet: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(tileSet.getType() == 'vector') {
      this.initCharSetVector();
      return;
    }
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    this.weights = [];
    var maxWeight = tileWidth * tileHeight;
    for(var i = 0; i <= maxWeight; i++) {
      this.weights[i] = [];
    }

    // get the weights for the different characters
    for(var i = 0; i < this.characters.length; i++) {
      var c = this.characters[i];
      var vWeights = [];
      var hWeights = [];
      var totalWeight = 0;

      if(c !== false) {
        for(var y = 0; y < tileHeight; y++) {
          hWeights[y] = 0;
          for(var x = 0; x < tileWidth; x++) {
            if(y == 0) {
              vWeights[x] = 0;
            }
            if(tileSet.getPixel(c, x, y)) {
              totalWeight++;
              hWeights[y]++;
              vWeights[x]++;
            }
          }
        }
       this.weights[totalWeight].push({ c: c, hWeights: hWeights, vWeights: vWeights });
      }
    }
  },

  initCharSetVector: function() {
    console.log('init char set vector');
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();


    if(this.vectorTileCanvas == null) {
      this.vectorTileCanvas = document.createElement('canvas');
    }

    if(this.vectorTileCanvas.width != tileWidth || this.vectorTileCanvas.height != tileHeight || this.vectorTileContext == null) {
      this.vectorTileCanvas.width = tileWidth;
      this.vectorTileCanvas.height = tileHeight;
      this.vectorTileContext = this.vectorTileCanvas.getContext('2d');
    }

    this.vectorTileContext.clearRect(0, 0, this.vectorTileCanvas.width, this.vectorTileCanvas.height);


    this.weights = [];
    var maxWeight = tileWidth * tileHeight;
    for(var i = 0; i <= maxWeight; i++) {
      this.weights[i] = [];
    }

    // get the weights for the different characters
    for(var i = 0; i < this.characters.length; i++) {
      var c = this.characters[i];
      var vWeights = [];
      var hWeights = [];
      var totalWeight = 0;

      if(c !== false) {
        var path = tileSet.getGlyphPath(c);
        if(path !== null) {    
          var fontScale = tileSet.getFontScale();
          var scale = tileWidth * fontScale;
          var ascent = tileSet.getFontAscent() ;
    
          var dstX = 0;
          var dstY = 0;
          this.vectorTileContext.clearRect(0, 0, this.vectorTileCanvas.width, this.vectorTileCanvas.height);

          this.vectorTileContext.setTransform(scale,0,0,-scale, dstX, dstY + ascent * scale);
          this.vectorTileContext.fillStyle = '#ffffff';
          this.vectorTileContext.fill(path);
          this.vectorTileContext.setTransform(1,0,0,1,0,0);
        }
    
        this.vectorTileImageData = this.vectorTileContext.getImageData(0, 0, this.vectorTileCanvas.width, this.vectorTileCanvas.height);

        
        for(var y = 0; y < tileHeight; y++) {
          hWeights[y] = 0;
          for(var x = 0; x < tileWidth; x++) {
            var srcPos = (x + y * tileWidth) * 4;

            if(y == 0) {
              vWeights[x] = 0;
            }

            if(this.vectorTileImageData.data[srcPos] > 100) {
              totalWeight++;
              hWeights[y]++;
              vWeights[x]++;
            }

            /*
            if(tileSet.getPixel(c, x, y)) {
              totalWeight++;
              hWeights[y]++;
              vWeights[x]++;
            }
            */

          }
        }
        this.weights[totalWeight].push({ c: c, hWeights: hWeights, vWeights: vWeights });
      }
    }

  },

  findChar: function(totalWeight, vWeights, hWeights) {
    var bestScore = 9999999;
    var bestChar = 0;


    var numTested = 0;
    var i = 0;
    var j = 0;
    var weight = 0;
    for(weight = totalWeight; weight < this.weights.length; weight++) {
      if(this.weights[weight].length > 0) {
        for(i = 0; i < this.weights[weight].length; i++) {
          numTested++;
          var score = 0;

          var cvWeights = this.weights[weight][i].vWeights;
          var chWeights = this.weights[weight][i].hWeights;
          for(j = 0; j < vWeights.length; j++) {
            score += Math.abs(vWeights[j] - cvWeights[j]);
            score += Math.abs(hWeights[j] - chWeights[j]);
          }
          if(score < bestScore && this.weights[weight][i].c !== false) {
            bestScore = score;
            bestChar = this.weights[weight][i].c;
          }
        }
      }
      if(numTested > 10) {
        break;
      }
    }

    numTested = 0;
    for(weight = totalWeight - 1; weight >= 0; weight--) {
      if(this.weights[weight].length > 0) {
        for(i = 0; i < this.weights[weight].length; i++) {
          numTested++;
          var score = 0;

          var cvWeights = this.weights[weight][i].vWeights;
          var chWeights = this.weights[weight][i].hWeights;
          for(var j = 0; j < vWeights.length; j++) {
            score += Math.abs(vWeights[j] - cvWeights[j]);
            score += Math.abs(hWeights[j] - chWeights[j]);
          }
          if(score < bestScore && this.weights[weight][i].c !== false) {
            bestScore = score;
            bestChar = this.weights[weight][i].c;
          }
        }
      }
      if(numTested > 10) {
        break;
      }
    }


    return bestChar;
  },


  // called each time image is imported
  setupColorPalette: function() {
    // get the colors as rgb
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.colorMap = {};
    this.paletteRGB = [];
    this.paletteI32 = [];


    // find the most used color
    if(!this.useMultipleBGColors) {

      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {
        if(this.bgColors.length > 0) {
          layer.setBackgroundColor(this.bgColors[0]);
          this.editor.updateBackgroundColorPicker();
        }
      }
    }


    // loop through chosen colors, find the rgb values
    for(var i = 0; i < this.colors.length; i++) {
      var hex = colorPalette.getHex(this.colors[i]);

      var r = (hex >> 16) & 0xff;
      var g = (hex >> 8) & 0xff;
      var b = hex & 0xff;  
      this.paletteRGB.push([r,g,b]);


      // store the colours in the order they are stored in the image data:
      var i32 = (0xff << 24) |
                (b << 16) |
                (g << 8) |
                (r);

      this.paletteI32.push(i32);


      // map the i32 to the original index
      this.colorMap['#' + i32] = this.colors[i];
      if(this.colors[i] == this.bgColorIndex) {
        this.bgColorPaletteIndex = i;
      }
    }
  },

  // find the nearest colour in the palette to i32
  nearestColorIndex: function(i32) {
    // TODO:  cache look up here?

    var min = 1000;
    var minIndex = 0;

    var rgb = [
        (i32 & 0xff),
        (i32 & 0xff00) >> 8,
        (i32 & 0xff0000) >> 16,
      ];
    var paletteLength = this.paletteRGB.length;

    for (var i = 0; i < paletteLength; i++) {
      var dist = this.colorDist(rgb, this.paletteRGB[i]);

      if (dist < min) {
        min = dist;
        minIndex = i;
      }
    }


    return minIndex;
  },



  importImageData: function(imageData, findColors) {
    var startTime = getTimestamp();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    var cellsDown = layer.getGridHeight();
    var cellsAcross = layer.getGridWidth();


    var imageDataWidth = imageData.width;
    var imageDataHeight = imageData.height;

    // dont really need canvas??
    this.canvas.width = cellsAcross * cellWidth;
    this.canvas.height = cellsDown * cellHeight;
    this.context = this.canvas.getContext('2d');

    this.imageData = imageData;


    this.bgColorIndex = layer.getBackgroundColor();
    //var bgColor = colorPalette.getHex(bgColorIndex);
    this.setupColorPalette();


    // need to find index of colour thats not the bg colour, but is the closest to it
    var nearestToBgColor = 0;

    var min = false;
    //var minIndex = 0;
/*
    var rgb = [
        (i32 & 0xff),
        (i32 & 0xff00) >> 8,
        (i32 & 0xff0000) >> 16,
      ];
    var paletteLength = this.paletteRGB.length;

    for (var i = 0; i < paletteLength; i++) {
      var dist = this.colorDist(rgb, this.paletteRGB[i]);

      if (dist < min) {
        min = dist;
        minIndex = i;
      }
    }

*/

    // find nearest to background colour

    // get the index of the bg colour in the palette
    var bgPaletteIndex = 0;
    for(var i = 0; i < this.colors.length; i++) {
      if(this.colors[i] == this.bgColorIndex) {
        bgPaletteIndex = i;
        break;
      }
    }


    for(var i = 0; i < this.colors.length; i++) {
      if(i != this.bgColorIndex && this.bgColorIndex !== false && this.bgColorIndex >= 0) {
        //var dist = this.colorDist(this.paletteRGB[this.bgColorIndex], this.paletteRGB[i]);
        var dist = this.colorDist(this.paletteRGB[bgPaletteIndex], this.paletteRGB[i]);

        if (min === false || dist < min) {
          min = dist;
          nearestToBgColor = i;
        }
  
      }
    }



    var colorMap = this.colorMap;
    var paletteRGB = this.paletteRGB;
    var paletteI32 = this.paletteI32;

    var data = null;

    // get unit8 and unit32 views of the data
    var buf8 = new Uint8Array(imageData.data);
    var buf32 = new Uint32Array(buf8.buffer);

    // go through each cell in the image
    // reduce each cell to 2 colours, then black and white those colours, store which is black and which is white
    // store horizontal and vertical sums for black

    var out32 = new Uint32Array(buf32.length);

    // variables used in the loop
    var cellY = 0;
    var cellX = 0;
    var cellSrcPos = 0;
    var srcPos = 0;
    var x = 0, y = 0;
    var color1dist = 0;
    var color2dist = 0;

    var hWeight = 0;
    var i32 = 0;
    var rgb = [0,0,0];

    for(cellY = 0; cellY < cellsDown; cellY++) {
      for(cellX = 0; cellX < cellsAcross; cellX++) {
        // cell pos in the image data
        cellSrcPos = cellY * cellHeight * imageDataWidth + cellX * cellWidth;


        // build the histogram for the cell
        var cellHistogram = {};
        for(y = 0; y < cellHeight; y++) {
          for(x = 0; x < cellWidth; x++) {
            srcPos = cellSrcPos + x + y * imageDataWidth;
            i32 = buf32[srcPos];

            if (i32 in cellHistogram) {
              cellHistogram[i32]++;
            } else {
              cellHistogram[i32] = 1;
            }
          }
        }

        // sort the histogram
        var sortedColors = this.sortedHashKeys(cellHistogram, true);
        var sortedColorsLen = sortedColors.length;


        var cellPalette = [];
        var cellPaletteRGB = [];
        var cellPaletteI32 = [];

        var color1Index = false;
        var color1RGB = false;
        var color1I32 = false;

        var color2Index = false;
        var color2RGB = false;
        var color2I32 = false;

        // find the 2 colors in the palette which match the most colors in the cell
        if(sortedColorsLen > 0) {
          var nearest = this.nearestColorIndex(sortedColors[0]);

          color1Index = nearest;
          color1RGB = paletteRGB[nearest];
          color1I32 = paletteI32[nearest];

          if(this.useMultipleBGColors) {
            for(var i = 1; i < sortedColors.length; i++) {
              nearest = this.nearestColorIndex(sortedColors[i]);
              if(nearest !== color1Index) {
                color2Index = nearest;
                color2RGB = paletteRGB[nearest];
                color2I32 = paletteI32[nearest];
                break;
              }
            }      
          } else {
            // color1 index can't be the background colour
            if(color1Index == this.bgColorPaletteIndex) {
              if(sortedColors.length > 1) {
                nearest = this.nearestColorIndex(sortedColors[1]);

                color1Index = nearest;
                color1RGB = paletteRGB[nearest];
                color1I32 = paletteI32[nearest];      
              } else {
                // should find colour closest to background colour
                color1Index = nearestToBgColor;
                color1RGB = paletteRGB[nearestToBgColor];
                color1I32 = paletteI32[nearestToBgColor];      
              }
            }


            // if not multiple background colors, 
            // color 2 is always the background color
            color2Index = this.bgColorPaletteIndex;
            if(typeof color2Index == 'undefined' || color2Index === false || color2Index >= paletteRGB.length) {
              color2Index = 0;
            }
            color2RGB = paletteRGB[color2Index];
            color2I32 = paletteI32[color2Index];

          }
        } else {
          // uh oh...
        }


        var vWeights = [];
        var hWeights = [];
        totalWeight = 0;


        if(color2Index === false) {
          // theres only 1 color
        } else {
          var cellCache = {};

          // ok now go through the cell, convert the colors to black and white, black representing #1 colour
          for(y = 0; y < cellHeight; y++) {
            hWeight = 0;

            for(x = 0; x < cellWidth; x++) {
              if(y === 0) {
                vWeights.push(0);
              }

              srcPos = cellSrcPos + x + y * imageDataWidth;
              i32 = buf32[srcPos];

              rgb[0] = (i32 & 0xff);
              rgb[1] = (i32 & 0xff00) >> 8;
              rgb[2] = (i32 & 0xff0000) >> 16;

              color1dist = this.colorDist(rgb, color1RGB);
              color2dist = this.colorDist(rgb, color2RGB);

              if(color1dist < color2dist) {
                hWeight++;
                totalWeight++;
                vWeights[x]++;

                out32[srcPos] = 255;

              } else {
                out32[srcPos] = 0;
              }
            }
            hWeights.push(hWeight);

          }
        }

        if(color2I32 === false) {
          color2I32 = color1I32;
        } 

        // ok, find a char that matches the weights..

        var ch = this.findChar(totalWeight, vWeights, hWeights);
// yreverse        var yPos = cellsDown - cellY - 1;
        var args = {};
        args.t = ch;
        args.x = cellX;
        args.y = cellY;
        args.z = 0;//importAtZ;
        args.fc = this.colorMap['#' + color1I32];


        args.bc = this.editor.colorPaletteManager.noColor;
        if(this.useMultipleBGColors) {
          args.bc = this.colorMap['#' + color2I32];
        }
        args.rx = 0;
        args.ry = 0;
        args.rz = 0;
        args.update = false;

        if(findColors) {
          // score colours to find background color
          if(args.fc == args.bc || args.t === this.blockCharacter || args.t === this.blankCharacter) {  
            // tile colour doesn't get a score
          } else {
            //this.colorScores[args.fc]++;
            if(args.bc != this.editor.colorPaletteManager.noColor) {
              this.colorScores[args.bc]++;              
            }
          }
        } else {

          layer.setCell(args);
        }
      }
    }

    var endTime = getTimestamp();
    var timeTaken = endTime - startTime;

  },

  findBGColor: function(imageData) {

    var maxColor = 0;

    // now set bgColors to all the colours
    this.bgColors = [];
    for(var i = 0; i < this.colors.length; i++) {
      if(this.colors[i] > maxColor) {
        maxColor = this.colors[i];
      }
      this.bgColors.push(this.colors[i]);        
    }

    this.colorScores = [];
    for(var i = 0; i <= maxColor; i++) {
      this.colorScores[i] = 0;
    }

    // convert using all the colours
    this.useMultipleBGColors = true;
    this.importImageData(imageData, true);
    this.useMultipleBGColors = false;


    var bestColor = 0;
    var bestScore = 0;
    for(var i = 0; i < this.colorScores.length; i++) {
      if(this.colorScores[i] > bestScore) {
        bestColor = i;
        bestScore = this.colorScores[i];
      }
    }

    // set the bg color
    this.bgColors = [];
    this.bgColors.push(bestColor);    

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    layer.setBackgroundColor(bestColor);
  },


  setImageData: function(imageData) {

    if(!this.useMultipleBGColors && this.backgroundColorChoose == 'auto') {
      this.findBGColor(imageData);
    }
    this.importImageData(imageData, false);
  },

  setUseMultipleBGColors: function(useMultipleBGColors) {
    this.useMultipleBGColors = useMultipleBGColors;
  },

  initColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();


    this.colorsRGB = [];
    this.colorsLABA = [];

//    for(var i = 0; i < this.colors.length; i++) {  
    for(var i = 0; i < colorPalette.getColorCount(); i++) {  

      var colorHex = colorPalette.getHex(i);//this.colors[i]);

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
  imageDataToLABA: function() {
    this.imageDataLABA = [];

    var data = [];
    var color = {};
    for(var i = 0; i < this.imageData.data.length; i += 4) {
      data[0] = this.imageData.data[i];
      data[1] = this.imageData.data[i + 1];
      data[2] = this.imageData.data[i + 2];
      data[3] = this.imageData.data[i + 3];
      color.values = data;
      color = Colour.converters[Colour.RGBA][Colour.LABA](color);

      this.imageDataLABA[i] = color.values[0];
      this.imageDataLABA[i + 1] = color.values[1];
      this.imageDataLABA[i + 2] = color.values[2];
      this.imageDataLABA[i + 3] = this.imageData.data[i + 3];;//color.values[3];
    }
  },    


  // returns array of hash keys sorted by their values
  sortedHashKeys: function(obj, desc) {
    var keys = [];

    for (var key in obj)
      keys.push(key);

    return keys.sort(function(a, b) {
      return desc ? obj[b] - obj[a] : obj[a] - obj[b];
    });
  },


  startImport: function() {
    this.initColors();
    this.nextX = 0;
    this.nextY = 0;
  },


  getProgress: function() {
    return '(' + this.nextX + ',' + this.nextY + ')';
  },

  update: function() {
  }




}