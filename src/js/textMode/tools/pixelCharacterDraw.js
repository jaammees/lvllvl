var PixelCharacterDraw = function() {
  this.editor = null;
  this.mode = 'draw';
}

PixelCharacterDraw.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  setMode: function(mode) {
    this.mode = mode;
  },

  characterToNumber: function(char) {
    var value = 0;
    var pixel = 0;

    for(var pixelY = 0; pixelY < this.vPixels; pixelY++) {
      for(var pixelX = 0; pixelX < this.hPixels; pixelX++) {
        var xOffset = pixelX * this.pixelWidth;
        var yOffset = pixelY * this.pixelHeight;

        var pixelHeight = this.pixelHeight;
        var pixelWidth = this.pixelWidth;

        if(this.charHeight == 20 && this.vPixels == 3) {
          // teletext..
          switch(pixelY) {
            case 0:
              yOffset = 0;
              pixelHeight = 6;
              break;
            case 1:
              yOffset = 6;
              pixelHeight = 8;
              break;
            case 2:
              yOffset = 14;
              pixelHeight = 6;
              break;
          }
        } 

        var preset = this.tileSet.preset;
        if(preset == 'sharpmz700_1' || preset == 'sharpmz700_1_japanese' || preset == 'sharpmz80a') {
          // if the 0, 0 pixel is set then not a pixel character
          if(this.tileSet.getPixel(char, xOffset, yOffset)) {
            return false;
          }
          if(this.tileSet.getPixel(char, xOffset + 1, yOffset)) {
            return false;
          }
          if(this.tileSet.getPixel(char, xOffset, yOffset+1)) {
            return false;
          }
          pixelHeight = 3;
          pixelWidth = 3;
          xOffset += 1;
          yOffset += 1;
        }
        var firstPixelValue = this.tileSet.getPixel(char, xOffset, yOffset);

        for(var y = 0; y < pixelHeight; y++) {
          for(var x = 0; x < pixelWidth; x++) {
            var isPixel = this.tileSet.getPixel(char, xOffset + x, yOffset + y);
            if(isPixel != firstPixelValue) {
              // not a solid block
              return false;
            }
          }
        }

        if(firstPixelValue) {
          value = value + (1 << pixel);
        }
        pixel++;
      }
    }
    return value;
  },

  initCharset: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    this.tileSet = tileSet;
    this.charWidth = this.tileSet.charWidth;
    this.charHeight = this.tileSet.charHeight;


    this.hPixels = 2;//charWidth / 4;
    this.vPixels = 2;//charHeight / 4;

    if(this.charWidth == 8) {
      this.hPixels = 2;
    }
    if(this.charWidth == 8) {
      this.vPixels = 2;
    }


    if(this.charWidth == 12 && this.charHeight == 20) {
      // teletext
      this.hPixels = 2;
      this.vPixels = 3;
    }


    var charCount = 1 << (this.hPixels * this.vPixels);

    this.pixelWidth = this.charWidth / this.hPixels;
    this.pixelHeight = this.charHeight / this.vPixels;

    this.pixelCharacters = [];
    this.characterPixelCharacter = [];

    for(var i = 0; i < charCount; i++) {
      this.pixelCharacters.push(false);
    }

    var foundPixelCharacters = 0;

    for(var i = 0; i < 256; i++) {
      var value = this.characterToNumber(i);
      if(value !== false) {
        if(this.pixelCharacters[value] === false) {
          foundPixelCharacters++;
          this.pixelCharacters[value] = i;
        }
      }
      this.characterPixelCharacter[i] = value;
    }

  },

  drawPixel: function(gridView, x, y) {
    var gridCoords = gridView.xyToCell(x, y);
    if(gridCoords === false) {
      return;
    }

    var color = this.editor.currentTile.color;
    var pixel = this.xyToPixel(gridView, x, y);

    this.setPixel(gridView, color, gridCoords.x, gridCoords.y, gridCoords.z, pixel.x, pixel.y, pixel.z);
    return;

  },


  erasePixel: function(gridView, x, y) {
    var gridCoords = gridView.xyToCell(x, y);
    if(gridCoords === false) {
      return;
    }

    var color = this.editor.currentTile.color;

    var pixel = this.xyToPixel(gridView, x, y);

    this.removePixel(gridView, gridCoords.x, gridCoords.y, gridCoords.z, pixel.x, pixel.y, pixel.z);
    return;
  },



  xyToPixel: function(gridView, x, y) {
    return gridView.xyToCharPixel(x, y, this.hPixels, this.vPixels);
  },

  setPixel: function(gridView, color, charX, charY, charZ, pixX, pixY, pixZ) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var rotX = 0;
    var rotY = 0;
    var rotZ = 0;
    if(gridView.view == 'front' || gridView.view == '2d front') {
      rotX = 0;
      rotY = 0;
    }

    if(gridView.view == 'top') {
      rotX = 0.25;
      rotY = 0;
    }

    if(gridView.view == 'front' || gridView.view == 'top' || gridView.view == '2d front') {

      if(charX < 0 || charX >= gridWidth
        || charY < 0 || charY >= gridHeight) {
        return;
      }

      var cellData = layer.getCell({ x: charX, y: charY });

      var currentTile = cellData.t;

      // if its not the same color, erase it
      if(cellData.fc != color) {
        currentTile = this.editor.tileSetManager.blankCharacter;
      }

      // if it's a rotated pixel not rotated to current rotation, erase it
      if(this.editor.frames.hasCharRotation) {
        if(cellData.rx != rotX ||
           cellData.ry != rotY) {
          currentTile = this.editor.tileSetManager.blankCharacter;
        }
      }


// reverseY      var pixelBitPosition = (this.vPixels - 1 - pixY) * this.hPixels + pixX;
      var pixelBitPosition = ( pixY) * this.hPixels + pixX;
      var pixelCharacter = 1 << (pixelBitPosition );
      var currentPixelCharacter = this.characterPixelCharacter[currentTile];
      var newPixelCharacter = currentPixelCharacter | pixelCharacter;
      var character = this.pixelCharacters[newPixelCharacter];

      var args = {
        t: character, 
        x: charX, 
        y: charY, 
        z: charZ, 
        fc: color, 
        rx: rotX, 
        ry: rotY, 
        rz: rotZ
      };

      layer.setCell(args);
      this.editor.grid.grid2d.setMirrorCells(layer, args);

      this.editor.graphic.redraw();
    }    
  },

  removePixel: function(gridView, charX, charY, charZ, pixX, pixY, pixZ) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();


    var rotX = 0;
    var rotY = 0;
    var rotZ = 0;
    if(gridView.view == 'front' || gridView.view == '2d front') {
      rotX = 0;
      rotY = 0;
    }

    if(gridView.view == 'top') {
      rotX = 0.25;
      rotY = 0;
    }

    if(gridView.type == 'front' || gridView.type == 'top' || gridView.view == '2d front') {
      var cellData = layer.getCell({ x: charX, y: charY });
      if(cellData === false) {
        return;
      }

      var currentTile = cellData.t;
      var color = cellData.fc;

      //var pixelBitPosition = (this.vPixels - 1 - pixY) * this.hPixels + pixX;
      var pixelBitPosition = ( pixY) * this.hPixels + pixX;
      var pixelCharacter = 1 << (pixelBitPosition );
      var currentPixelCharacter = this.characterPixelCharacter[currentTile];
      var newPixelCharacter = currentPixelCharacter & ~pixelCharacter;
      var tile = this.pixelCharacters[newPixelCharacter];

      var args = {
        t: tile, 
        x: charX, 
        y: charY, 
        z: charZ, 
        fc: color, 
        rx: rotX, 
        ry: rotY, 
        rz: rotZ
      };

      layer.setCell(args);

      this.editor.grid.grid2d.setMirrorCells(layer, args);

      this.editor.graphic.redraw();
    }
  },

  isPixelCharacter: function(x, y, z) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }  

    var character = layer.getTile({ x: x, y: y });
    if(character >= 256 || character < 0) {
      return false;
    }

    return this.characterPixelCharacter[character] !== false;
  },

  mouseDown: function(gridView, x, y) {
    this.editor.history.startEntry('draw pixel');

    if(this.mode == 'draw') {
      console.log('draw pixel');
      this.drawPixel(gridView, x, y);
    } else if(this.mode == 'erase') {
      console.log('erase pixel');
      this.erasePixel(gridView, x, y);
    } else if(this.mode == 'fill' || this.mode == 'fillerase') {
//      this.pixelFill(gridView, x, y);
    }
  },

  mouseMove: function(gridView, x, y) {
    if(gridView.buttons & UI.LEFTMOUSEBUTTON) {
      if(this.mode == 'draw') {
        this.drawPixel(gridView, x, y);
      } else if(this.mode == 'erase') {
        this.erasePixel(gridView, x, y);
      }
    }

    this.updateCursor(gridView, x, y);

  },


  mouseUp: function(gridView, x, y) {

  },


  updateCursor: function(gridView, x, y) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    //var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var character = 123;
    var pixel = this.xyToPixel(gridView, x, y);


    var gridCoords = gridView.xyToCell(x, y);


    var rotX = 0;
    var rotY = 0;
    if(gridView.view == 'front') {
      rotX = 0;
      rotY = 0;
    }

    if(gridView.view == 'top') {
      rotX = 0.25;
      rotY = 0;
    }

    this.editor.currentTile.rotY = rotY;
    this.editor.currentTile.rotX = rotX;
    this.editor.currentTile.rotZ = 0;

    var pixelBitPosition = (pixel.y) * this.hPixels + pixel.x;
    var pixelCharacter = 1 << (pixelBitPosition );
    character = this.pixelCharacters[pixelCharacter];

    var color =  this.editor.currentTile.color;

    if(this.editor.shiftDown || this.mode == 'erase' ) {
      color = this.editor.currentTile.bgColor;
    }

    if(gridCoords.x >= 0 && gridCoords.x < gridWidth
       && gridCoords.y >= 0 && gridCoords.y < gridHeight) {
//       && gridCoords.z >= 0 && gridCoords.z < this.editor.grid.depth) {

      var currentTile = layer.getTile({ x: gridCoords.x, y: gridCoords.y }); 



      var currentPixelCharacter = this.characterPixelCharacter[currentTile];            
      var newPixelCharacter = currentPixelCharacter | pixelCharacter;

      var character = this.pixelCharacters[newPixelCharacter];

      this.editor.currentTile.setCharacter(character);
      this.editor.grid.setCursorCharacterAndPosition(character, gridCoords.x, gridCoords.y, gridCoords.z, color);    

     if(gridView.view == '2d front') {
        var character = character;
        var color = color;              
        var bgColor = false;//this.editor.tools.currentCellBackgroundColor;
        this.editor.grid.grid2d.setCursor(gridCoords.x, gridCoords.y, character, color, bgColor);
      }
      this.editor.grid.setCursorEnabled(true);            

    } else {
      this.editor.grid.setCursorEnabled(false);            
    }
  }
}