// same method as shader, but all done in javascript


var BasicImport = function() {
  this.editor = null;

  this.colors = [];
  this.bgColors = [];
  this.characters = [];

  this.colorsRGB = [];
  this.colorsLABA = [];  

  this.imageDataLABA = [];
  this.useMultipleBGColors = false;  

  this.imageData = null;
  this.nextX = 0;
  this.nextY = 0;

}

BasicImport.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.charactersHasSpace = true;
    this.charactersHasBlock = true;

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

  setCharacters: function(characters) {
    this.characters = [];
    for(var i = 0; i < characters.length; i++) {
      this.characters.push(characters[i]);
    }
  },

  setImageData: function(imageData) {
    this.imageData = imageData;
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


  startImport: function() {
    console.log("BASIC!!!");
    this.initColors();
    this.imageDataToLABA();
    this.nextX = 0;
    this.nextY = 0;
    this.importAtZ = this.editor.grid.getXYGridPosition();
  },

  findChar: function(x, y) {
//    var tileSet =  this.editor.tileSets[this.editor.currentTileSetID];
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var score = 99999999;
    var chosen = -1;
    var chosenColor = -1;
    var chosenColor2 = -1;  

    var backgroundColors = 1;

    if(this.useMultipleBGColors) {
      backgroundColors = this.bgColors.length;
    }


    for(var bgColorIndex = -1; bgColorIndex < backgroundColors; bgColorIndex++) {
      if(bgColorIndex == -1) {
        c2 = false;
      } else {
        c2 = this.bgColors[bgColorIndex];
      }



      for(var colorIndex = 0; colorIndex < this.colors.length; colorIndex++) {
        var c1 = this.colors[colorIndex];
        for(var cIndex = 0; cIndex < this.characters.length; cIndex++) {
          var c = this.characters[cIndex];

          var charRow = Math.floor(c / 32);
          var charCol = c % 32;
          var blankSquare = true;

          var testScore = 0;
          for(cy = 0; cy < tileSet.charHeight; cy++) {
            for(cx = 0; cx < tileSet.charWidth; cx++) {

              var backgroundColor = c2;
              if(backgroundColors == 1) {//} && !this.blackAndWhite) {
              //  backgroundColor = this.editor.tools.currentBackgroundColor;
              }

              if(backgroundColor === false) {
                backgroundColor = this.editor.tools.currentBackgroundColor;
              }

              var offset = y * this.imageData.width * 4 + x * 4 + cy * this.imageData.width * 4 + cx * 4;
              var charOffset = charRow * tileSet.charHeight * 256 * 4 + charCol * tileSet.charWidth * 4 + cy * 256 * 4 + cx * 4;

              var r2 = this.imageDataLABA[offset++];
              var g2 = this.imageDataLABA[offset++];
              var b2 = this.imageDataLABA[offset++];
              var a2 = this.imageDataLABA[offset++];

              if(a2 > 0.7) {
                // this square contains a pixel
                blankSquare = false;
              }

              if(a2 < 0.7 && c2 === false && !tileSet.getPixel(c, cx, cy)) {
                // background color is false and there is no pixel
                testScore += 0;
              } else {
                var r = this.colorsLABA[backgroundColor][0];
                var g = this.colorsLABA[backgroundColor][1];
                var b = this.colorsLABA[backgroundColor][2];

                //if(this.editor.charsImageData.data[charOffset++] > 100) {
                if(tileSet.getPixel(c, cx, cy)) {
                  r = this.colorsLABA[c1][0];
                  g = this.colorsLABA[c1][1];
                  b = this.colorsLABA[c1][2];
                }

                /*
                if(a2 == 0) {
                  r2 =  this.colorsLABA[backgroundColor][0];;
                  g2 = this.colorsLABA[backgroundColor][1];
                  b2 = this.colorsLABA[backgroundColor][2];
                }
                */
                

                testScore += Math.abs(r2 - r);
                testScore += Math.abs(g2 - g);
                testScore += Math.abs(b2 - b);
              }
              
              //testScore += Math.abs(destImageData.data[offset++] - chars.data[charOffset++]);
            }
          }

          if(blankSquare) {
            return { "ch": false, "c1": false, "c2": false };

          }

          if(chosen == -1 || testScore < score) {
            score = testScore;
            chosen = c;
            chosenColor = c1;
            chosenColor2 = c2;//backgroundColor;
          }
        }
      }
    }

    if(chosenColor == chosenColor2 && this.charactersHasBlock) {
//      chosen = 160;
    }

    return { "ch": chosen, "c1": chosenColor, "c2": chosenColor2 };
  },

  getProgress: function() {
    return '(' + this.nextX + ',' + this.nextY + ')';
  },

  update: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var x = this.nextX * tileSet.charWidth;
    var y = this.nextY * tileSet.charHeight;
    var c = this.findChar(x, y);

    if(c.ch !== false) {
      if(c.ch == 160 && c.c1 == c.c2) {
        if(this.charactersHasSpace) {
          c.ch = this.editor.tileSetManager.blankCharacter;
        }
      }

      var yPos = this.editor.frames.height - this.nextY - 1;
      var args = {};
      args.c = c.ch;
      args.x = this.nextX;
      args.y = yPos;
      args.z = this.importAtZ;
      args.fc = c.c1;
      args.rx = 0;
      args.ry = 0;
      args.rz = 0;

      if(this.useMultipleBGColors) {
        args.bc = c.c2;
      } else {
        args.bc = this.edit.colorPaletteManager.noColor;
      }
      this.editor.grid.setCell(args);
    }
    
    this.nextX++;

    // has the end of the row been reached?
    if(this.nextX >= this.editor.frames.width) {//} || this.nextX >= this.importToX) {
      this.nextX = 0;
      this.nextY++;
    }

    // has the end of the image been reached?
    if(this.nextY >= this.editor.frames.height) {//} || this.nextY >= this.importToY) {
      return false;
    }

    return true;

  }
}