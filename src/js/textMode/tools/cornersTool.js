var CornersTool = function() {
  this.editor = null;
}

CornersTool.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  toolSelected: function() {
    console.log('corners tool selected');
  },

  mouseDown: function(gridView, x, y) {
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

    var tileSet = layer.getTileSet();

    var gridCoords = gridView.xyToCell(x, y);

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var pixel = gridView.xyToPixel(x, y);
 
    var pixelX = pixel.x % cellWidth;
    var pixelY = pixel.y % cellHeight;
 
    var corner = 0;
    if(pixelX < cellWidth / 2 && pixelY < cellHeight / 2) {
      corner = 0;
    } else if(pixelX >= cellWidth / 2 && pixelY < cellHeight / 2) {
      corner = 1;
    } else if(pixelX >= cellWidth / 2 && pixelY >= cellHeight / 2) {
      corner = 2;
    } else {
      corner = 3;
    }


    var currentTile = this.editor.currentTile;

    var tiles = currentTile.getTiles();
    if(tiles.length == 0 || tiles[0].length == 0) {
      return;
    }
 

    var tileIndex = tiles[0][0];
    tileIndex = tileSet.getTileRotation(tileIndex, corner);

    var fgColor =  currentTile.getColor();
    var bgColor =  currentTile.getBGColor();

    var grid2d = this.editor.grid.grid2d;

    this.editor.currentTile.setCharacter(tileIndex);
    this.editor.grid.setCursorCharacterAndPosition(tileIndex, gridCoords.x, gridCoords.y, gridCoords.z, color);    
//    this.editor.grid.setCursorEnabled(true);            
    grid2d.setCursor(gridCoords.x, gridCoords.y, tileIndex, this.editor.currentTile.color, this.editor.currentTile.bgColor);
    grid2d.setCursorEnabled(true);


  }  
}
