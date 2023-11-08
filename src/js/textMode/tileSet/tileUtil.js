var TileUtil = function() {
  this.editor = null;
}

TileUtil.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  // draw character into image data, use image data
  drawTile: function( args ) {//imageData, character, color, x, y, highlight) {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var charHeight = tileSet.getTileHeight();
    var charWidth = tileSet.getTileWidth();

    if(typeof args['charHeight'] != 'undefined') {
      charHeight = args['charHeight'];
    }
    if(typeof args['charWidth'] != 'undefined') {
      charWidth = args['charWidth'];
    }
    var charsAcross = 32;
    if(typeof args['charsAcross'] != 'undefined')  {
      charsAcross = args['charsAcross'];
    }

    var tileData = null;
    var imageData = args['imageData'];
    var character = args['character'];
    var colorIndex = -1;
    var bgColor = -1;

    if(typeof args['color'] != 'undefined') {
      colorIndex = args['color'];
    }

    if(typeof args['bgColor'] != 'undefined') {
      bgColor = args['bgColor'];
    }

    tileData = args['tileData'];
    characterDataIsImageData = true;


    var colorRGB = false;//0xffffff;
    var colorR = false;
    var colorG = false;
    var colorB = false;

    if(typeof args['colorRGB'] != 'undefined') {
      colorRGB = args['colorRGB'];
      colorR = (colorRGB >> 16) & 255;
      colorG = (colorRGB >> 8) & 255;
      colorB =  colorRGB & 255;
    }

    var bgColorRGB = false;
    var bgColorR = false;
    var bgColorG = false;
    var bgColorB = false;
    if(typeof args['bgColorRGB'] != 'undefined') {
      bgColorRGB = args['bgColorRGB'];      

      if(bgColorRGB !== false) {
        bgColorR = (bgColorRGB >> 16) & 255;
        bgColorG = (bgColorRGB >> 8) & 255;
        bgColorB =  bgColorRGB & 255;
      }

    }

    if(bgColor != -1) {
      bgColorRGB = colorPalette.getHex(bgColor);//this.editor.petscii.getColor(bgColor);

      bgColorR = (bgColorRGB >> 16) & 255;
      bgColorG = (bgColorRGB >> 8) & 255;
      bgColorB =  bgColorRGB & 255;

    }

    var screenMode = this.editor.getScreenMode();;


    var colors = [];
    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      var backgroundColor = this.editor.frames.getBackgroundColor();
      var cellColor = this.editor.currentTile.color;
      if(this.editor.graphic.getType() !== 'sprite') {
        if(cellColor < 8) {
          screenMode = TextModeEditor.Mode.TEXTMODE;
        } else {
          cellColor -= 8;
        }
      }
      var multi1 = this.editor.frames.getC64Multi1Color();
      var multi2 = this.editor.frames.getC64Multi2Color();
      var colors = [];
      colors.push(colorPalette.getColor(backgroundColor));
      colors.push(colorPalette.getColor(multi1));
      colors.push(colorPalette.getColor(multi2));
      colors.push(colorPalette.getColor(cellColor));

      // if color not defined, use the current color
      if(colorIndex == -1 && colorRGB === false) {
        colorIndex = cellColor;
      }

      
    }


    var x = args['x'];
    var y = args['y'];

    var highlight = false;
    if(typeof args['highlight'] == 'undefined') {
      highlight = false;

    } else {
      highlight = args['highlight'];
    }


    var select = false;
    if(typeof args['select'] == 'undefined') {
      select = false;

    } else {
      select = args['select'];
    }


    var scale = 2;

    if(typeof args['scale'] != 'undefined') {
      scale = args['scale'];
    }

    var padding = 0;
    if(typeof args['padding'] != 'undefined') {
      padding = args['padding'];
    }

    /*
    if(typeof highlight == 'undefined') {
      highlight = false;
      if(x == this.highlightX && y == this.highlightY) {
        highlight = true;
      }

    }
    */

    if(highlight) {
      for(var j = -1; j < charHeight * scale + padding * 2 + 1; j++) {
        for(var i = -1; i < charWidth * scale + padding * 2 + 1; i++) {
          var dstPos = ((x) + i + x * padding 
              + ((y) + j + y * padding) * imageData.width) * 4;
          if(dstPos > 0 && (dstPos + 3) < imageData.data.length) {
            imageData.data[dstPos] = 255; 
            imageData.data[dstPos + 1] = 0;
            imageData.data[dstPos + 2] = 0;
            imageData.data[dstPos + 3] = 255;
          }
        }
      }

    }

    if(select) {
      for(var j = -1; j < charHeight * scale + padding * 2 + 1; j++) {
        for(var i = -1; i < charWidth * scale + padding * 2 + 1; i++) {
          var dstPos = ((x) + i + x * padding 
              + ((y) + j + y * padding) * imageData.width) * 4;
          if(dstPos > 0 && (dstPos + 3) < imageData.data.length) {
            imageData.data[dstPos] = 255; 
            imageData.data[dstPos + 1] = 0;
            imageData.data[dstPos + 2] = 0;
            imageData.data[dstPos + 3] = 255;
          }
        }
      }

    }


    if(!tileData) {
      return;
    }


    if(character == -1) {
      // draw solid block of color

      if(colorIndex != -1) {
        var color = colorPalette.getHex(colorIndex);//this.editor.petscii.getColor(color);
        colorR = (color >> 16) & 255;
        colorG = (color >> 8) & 255;
        colorB =  color & 255;
      }

      for(var j = 0; j < charHeight * scale; j++) {
        for(var i = 0; i < charWidth * scale; i++) {
          var dstPos = ((x) + i + (x + 1) * padding 
              + ((y) + j + (y + 1) * padding) * imageData.width) * 4;
          imageData.data[dstPos] = colorR; 
          imageData.data[dstPos + 1] = colorG;
          imageData.data[dstPos + 2] = colorB;
          imageData.data[dstPos + 3] = 255;
        }
      }

    } else {

      var charX = character % charsAcross;
      var charY = Math.floor(character / charsAcross);    


      if(colorIndex != -1) {
        var color = colorPalette.getHex(colorIndex);
        colorR = (color >> 16) & 255;
        colorG = (color >> 8) & 255;
        colorB =  color & 255;
      }

//      var 
      for(var j = 0; j < charHeight * scale; j++) {
        for(var i = 0; i < charWidth * scale; i++) {
          var colorIndex = 0;
          var srcPos = Math.floor(i / scale) + Math.floor(j / scale) * charWidth;

          if(characterDataIsImageData) {
            srcPos =  ((charX) * charWidth + Math.floor(i / scale) + ((charY * charHeight) + Math.floor(j / scale)) * tileData.width) * 4;
            colorIndex = tileData.data[srcPos];
          } else {
            colorIndex = tileData[character][srcPos];
          }

          var dstPos = ((x) + i + (x + 1) * padding 
              + ((y) + j + (y + 1) * padding) * imageData.width) * 4;

          if(!highlight) {

            if(screenMode === TextModeEditor.Mode.INDEXED) {

              // TODO: speed this up
              var color = colorPalette.getHex(colorIndex);  
              colorR = (color >> 16) & 255;
              colorG = (color >> 8) & 255;
              colorB = color & 255;
              imageData.data[dstPos] = colorR;
              imageData.data[dstPos + 1] = colorG;
              imageData.data[dstPos + 2] = colorB;
              imageData.data[dstPos + 3] = 255;
            } else if(screenMode == TextModeEditor.Mode.NES) {
              if(colorIndex >= 4) {
                colorIndex = 1;
              }
                        
              // TODO: speed this up..
              colorIndex = this.editor.colorPaletteManager.colorSubPalettes.getColor(colorIndex);

              var color = colorPalette.getHex(colorIndex);

//              var color = colorPalette.getNESColor(colorIndex);
              imageData.data[dstPos] = (color >> 16) & 255;  
              imageData.data[dstPos + 1] = (color >> 8) & 255;
              imageData.data[dstPos + 2] = color & 255;
              imageData.data[dstPos + 3] = 255;

            } else if(screenMode == TextModeEditor.Mode.TEXTMODE 
              || screenMode == TextModeEditor.Mode.C64ECM
              || screenMode == TextModeEditor.Mode.C64STANDARD) {
              if(colorIndex > 0) {
                imageData.data[dstPos] = colorR; 
                imageData.data[dstPos + 1] = colorG;
                imageData.data[dstPos + 2] = colorB;
                imageData.data[dstPos + 3] = 255;
              } else if(bgColorRGB !== false) {                
                imageData.data[dstPos] = bgColorR;
                imageData.data[dstPos + 1] = bgColorG;
                imageData.data[dstPos + 2] = bgColorB
                imageData.data[dstPos + 3] = 255;            
              } 
            } else if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
              var value = 0;
              if(colorIndex > 1) {
                value += 2;
              }

              srcPos += 4;
              // TODO: need to fix this
              if(tileData.data[srcPos] > 100) {
                value += 1;
              }
              var color = colors[value];

              for(var k = 0; k < scale; k++) {
                imageData.data[dstPos] = color.r * 255; 
                imageData.data[dstPos + 1] = color.g * 255;
                imageData.data[dstPos + 2] = color.b * 255;
                imageData.data[dstPos + 3] = 255;

                i++;
                imageData.data[dstPos + 4] = color.r * 255; 
                imageData.data[dstPos + 5] = color.g * 255;
                imageData.data[dstPos + 6] = color.b * 255;
                imageData.data[dstPos + 7] = 255;

                i++;
                dstPos += 8;
              }
              i--;

//              i += scale;


            }
          } else {
            // unknown mode, make everything grey
            if(colorIndex > 0) {
              imageData.data[dstPos] = 40; 
              imageData.data[dstPos + 1] = 40;
              imageData.data[dstPos + 2] = 40;
              imageData.data[dstPos + 3] = 40;

            } else {
              /*
              imageData.data[dstPos] = 200;//backgroundR;
              imageData.data[dstPos + 1] = 200;//backgroundG;
              imageData.data[dstPos + 2] = 200;//backgroundB;
              imageData.data[dstPos + 3] = 255;
              */
            }

          }

        }
      }
    }
  }
}
