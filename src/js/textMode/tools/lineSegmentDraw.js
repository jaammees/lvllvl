var LineSegmentDraw = function() {
  this.editor = null;
  this.mode = 'horizontal';
  this.invert = false;

  /*
  this.horizonalSegments = [];
  this.verticalSegments = [];
  this.fromLeftSegments = [];
  this.fromRight = [];
  this.horizonalSegments = [];
  this.horizonalSegments = [];
  */

  this.segments = [];
  this.segmentType = [];
}

LineSegmentDraw.prototype = {
  init: function(editor) {
    this.editor = editor;
  },
  setMode: function(mode) {
    console.log('set mode to ' + mode);
    this.mode = mode;

    $('#lineSegmentToolMode_' + mode + ' input').prop('checked', true);
  },

  setInvert: function(invert) {
    this.invert = invert;
  },

  isCharacter: function(tileIndex, type, line) {

    if(type == 'horizontalsingle') {
      // want single line

      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        if(!this.tileSet.getPixel(tileIndex, pixelX, line)) {
          return false;
        }
      }

      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
          if(pixelY != line) {
            if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
              return false;
            }  
          }
        }
      }
      return true;
    }

    if(type == 'horizontal') {
      // want double line
      if(line >= this.tileHeight - 1) {
        return false;
      }

      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        if(!this.tileSet.getPixel(tileIndex, pixelX, line)) {
          return false;
        }

        if(!this.tileSet.getPixel(tileIndex, pixelX, line + 1)) {
          return false;
        }

      }

      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
          if(pixelY != line && pixelY != line + 1) {
            if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
              return false;
            }  
          }
        }
      }
      return true;
    }

    if(type == 'fromtop') {
      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {          
          if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
            if(pixelY > line) {
              return false;
            }
          } else {
            // no pixel
            if(pixelY <= line) {
              return false;
            }
          }
        }
      }
      return true;
    }

    if(type == 'frombottom') {
      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {          
          if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
            if(pixelY < line) {
              return false;
            }
          } else {
            // no pixel
            if(pixelY >= line) {
              return false;
            }
          }
        }
      }
      return true;
    }


    if(type == 'fromright') {
      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {          
          if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
            if(pixelX < line) {
              return false;
            }
          } else {
            // no pixel
            if(pixelX >= line) {
              return false;
            }
          }
        }
      }
      return true;
    }

    if(type == 'fromleft') {
      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {          
          if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
            if(pixelX > line) {
              return false;
            }
          } else {
            // no pixel
            if(pixelX <= line) {
              return false;
            }
          }
        }
      }
      return true;
    }

    if(type == 'verticalsingle') {
      // want single line

      for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
        if(!this.tileSet.getPixel(tileIndex, line, pixelY)) {
          return false;
        }
      }

      for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
        for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
          if(pixelX != line) {
            if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
              return false;
            }  
          }
        }
      }
      return true;
    }

    if(type == 'vertical') {
      // want double line
      if(line >= this.tileWidth - 1) {
        return false;
      }

      for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
        if(!this.tileSet.getPixel(tileIndex, line, pixelY)) {
          return false;
        }

        if(!this.tileSet.getPixel(tileIndex, line + 1, pixelY)) {
          return false;
        }

      }

      for(var pixelX = 0; pixelX < this.tileWidth; pixelX++) {
        for(var pixelY = 0; pixelY < this.tileHeight; pixelY++) {
          if(pixelX != line && pixelX != line + 1) {
            if(this.tileSet.getPixel(tileIndex, pixelX, pixelY)) {
              return false;
            }  
          }
        }
      }
      return true;
    }

    /*
    for(var pixelY = 0; pixelY < this.vPixels; pixelY++) {
      for(var pixelX = 0; pixelX < this.hPixels; pixelX++) {
      }
    }
    * */

  },

  findCharacters: function() {

    for(var i = 0; i < this.tileCount; i++) {

    }
  },

  initCharset: function() {
    console.log('init charset!');
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    this.tileSet = tileSet;
    this.charWidth = this.tileSet.getTileWidth();
    this.charHeight = this.tileSet.getTileHeight();

    this.tileCount = 256;
    this.tileHeight = 8;
    this.tileWidth = 8;


    this.hPixels = 2;//charWidth / 4;
    this.vPixels = 2;//charHeight / 4;

    // assume 2 pixels thick, horizonal has 1 pixel thick lines at top and bottom

    var types = [
      'horizontal',
      'vertical',
      'fromleft',
      'fromright',
      'fromtop',
      'frombottom'
    ];

    this.segmentType['horizontal'] = 'y';
    this.segments['horizontal'] = [];
    this.segments['vertical'] = [];
    this.segmentType['vertical'] = 'x';
    this.segments['fromleft']  = [];
    this.segmentType['fromleft'] = 'x';
    this.segments['fromright']  = [];
    this.segmentType['fromright'] = 'x';
    this.segments['fromtop']  = [];
    this.segmentType['fromtop'] = 'y';
    this.segments['frombottom']  = [];
    this.segmentType['frombottom'] = 'y';


    if(tileSet.getType() == 'petscii') {
      console.log('use petscii tiles');
      this.segments['horizontal'] = [0x63, 0x77, 0x45, 0x44, 0x40, 0x46, 0x52, 0x6f, 0x64];
      this.segments['vertical']  = [0x65, 0x54, 0x47, 0x5d, 0x48, 0x59, 0x6a];
      this.segments['fromleft']  = [0x65, 0x74, 0x75, 0x61, 0xf6, 0xe7, 0xe7, 0xa0];
      this.segments['fromright']  = [0xa0, 0xe5, 0xf4, 0xf5, 0xe1, 0x76, 0x6a, 0x67];
      this.segments['fromtop']  = [0x63, 0x77, 0x78, 0xe2, 0xf9, 0xef, 0xe4, 0xa0 ];
      this.segments['frombottom']  = [0xa0, 0xe3, 0xf7, 0xf8, 0x62, 0x79, 0x6f, 0x64];
    } else {
      console.log('find segments');

      // find horizontal tiles
      for(var i = 0; i < this.tileHeight; i++) {
        var horizontalSingle = false;
        var horizontalDouble = false;
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(horizontalSingle === false && this.isCharacter(tileIndex, 'horizontalsingle', i)) {
            horizontalSingle = tileIndex;    
          }

          if(horizontalDouble === false && this.isCharacter(tileIndex, 'horizontal', i)) {
            //this.segments['horizontal'].push(tileIndex);
            horizontalDouble = tileIndex;
          }

          if(horizontalSingle !== false && horizontalDouble !== false) {
            break;
          }
        }

        if(horizontalSingle !== false) {
          this.segments['horizontal'].push(horizontalSingle);
        }

        if(horizontalDouble !== false) {
          this.segments['horizontal'].push(horizontalDouble);
        }
      }

      // find vertical tiles
      for(var i = 0; i < this.tileWidth; i++) {
        var verticalSingle = false;
        var verticalDouble = false;
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(verticalSingle === false && this.isCharacter(tileIndex, 'verticalsingle', i)) {
            verticalSingle = tileIndex;    
          }

          if(verticalDouble === false && this.isCharacter(tileIndex, 'vertical', i)) {
            //this.segments['horizontal'].push(tileIndex);
            verticalDouble = tileIndex;
          }

          if(verticalSingle !== false && verticalDouble !== false) {
            break;
          }
        }

        if(verticalSingle !== false) {
          this.segments['vertical'].push(verticalSingle);
        }

        if(verticalDouble !== false) {
          this.segments['vertical'].push(verticalDouble);
        }
      }


      for(var i = 0; i < this.tileHeight; i++) {
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(this.isCharacter(tileIndex, 'fromleft', i)) {
            this.segments['fromleft'].push(tileIndex);
            break;
          }
        }
      }

      for(var i = 0; i < this.tileHeight; i++) {
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(this.isCharacter(tileIndex, 'fromright', i)) {
            this.segments['fromright'].push(tileIndex);
            break;
          }
        }
      }

      for(var i = 0; i < this.tileHeight; i++) {
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(this.isCharacter(tileIndex, 'fromtop', i)) {
            this.segments['fromtop'].push(tileIndex);
            break;
          }
        }
      }


      for(var i = 0; i < this.tileHeight; i++) {
        for(var tileIndex = 0; tileIndex < this.tileCount; tileIndex++) {
          if(this.isCharacter(tileIndex, 'frombottom', i)) {
            this.segments['frombottom'].push(tileIndex);
            break;
          }
        }
      }


      for(var i = 0; i < types.length; i++) {
        if(this.segments[types[i]].length > 0) {
          $('#lineSegmentToolMode_' + types[i]).show();
        } else {
          $('#lineSegmentToolMode_' + types[i]).hide();
        }
      }
    }

  },

  
  mouseDown: function(gridView, x, y) {

    /*
    this.editor.history.startEntry('draw pixel');

    if(this.mode == 'draw') {
      this.drawPixel(gridView, x, y);
    } else if(this.mode == 'erase') {
      this.erasePixel(gridView, x, y);
    } else if(this.mode == 'fill' || this.mode == 'fillerase') {
//      this.pixelFill(gridView, x, y);
    }
    */
    if(gridView.buttons & UI.LEFTMOUSEBUTTON) {
      this.editor.grid.grid2d.setCursorCells({  });
    }

  },

  mouseMove: function(gridView, x, y) {
    if(gridView.buttons & UI.LEFTMOUSEBUTTON) {
      this.editor.grid.grid2d.setCursorCells({  });
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

//    var gridWidth = layer.getGridWidth();
//    var gridHeight = layer.getGridHeight();
    var gridCoords = gridView.xyToCell(x, y);

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
 
    var pixel = gridView.xyToPixel(x, y);
 
    var pixelX = pixel.x % cellWidth;
    var pixelY = pixel.y % cellHeight;
 
    var segments = this.segments[this.mode];

    if(pixelX >= segments.length) {
      pixelX = segments.length - 1;
    }

    var tileIndex = 0;

    var segmentIndex = pixelY;
    if(this.segmentType[this.mode] == 'x') {
      segmentIndex = pixelX;
    }

//    if(this.mode == 'horizontal') {
    if(this.segmentType[this.mode] == 'y') {
      var cellPercent = gridView.xyToCellPercent(x, y);
      var yPercent = (cellPercent.y / this.tileHeight) * this.segments[this.mode].length;
      segmentIndex = Math.floor(yPercent);

      if(segmentIndex >= this.segments['horizontal'].length) {
        segmentIndex = this.segments['horizontal'].length - 1;
      }
    }

//    if(this.mode == 'vertical') {
    if(this.segmentType[this.mode] == 'x') {      
      var cellPercent = gridView.xyToCellPercent(x, y);
      var xPercent = (cellPercent.x / this.tileWidth) * this.segments[this.mode].length;
      segmentIndex = Math.floor(xPercent);

      if(segmentIndex >= this.segments[this.mode].length) {
        segmentIndex = this.segments[this.mode].length - 1;
      }
    }

    tileIndex = this.segments[this.mode][segmentIndex];

    if( typeof tileIndex == 'undefined' ) {
      return;
    }

    if(this.invert) {
      tileIndex = (tileIndex + 128) % 256;
    }

    var color =  this.editor.currentTile.color;

    var grid2d = this.editor.grid.grid2d;

    this.editor.currentTile.setCharacter(tileIndex);
    this.editor.grid.setCursorCharacterAndPosition(tileIndex, gridCoords.x, gridCoords.y, gridCoords.z, color);    
//    this.editor.grid.setCursorEnabled(true);            
    grid2d.setCursor(gridCoords.x, gridCoords.y, tileIndex, this.editor.currentTile.color, this.editor.currentTile.bgColor);
    grid2d.setCursorEnabled(true);


  }
}