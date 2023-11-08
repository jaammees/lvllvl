var InvertTool = function() {
  this.editor = null;
  this.lastSetX = false;
  this.lastSetY = false;
}

InvertTool.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  toolSelected: function() {
    console.log('invert tool selected');
  },


  mouseDown: function(gridView, x, y) {
    if(gridView.buttons & UI.LEFTMOUSEBUTTON) {
//      var cursorPosition = this.editor.grid.grid2d.getCursorPosition();
      var cell = gridView.xyToCell(x, y);
      if(!cell) {
        return;
      }


      if(cell.x != this.lastSetX || cell.y != this.lastSetY) {
        this.lastSetX = cell.x;
        this.lastSetY = cell.y;

        this.editor.grid.grid2d.setCursorCells({  });
      }
    }

  },

  mouseMove: function(gridView, x, y) {


//    var cursorPosition = this.editor.grid.grid2d.getCursorPosition();

    var cell = gridView.xyToCell(x, y);
    if(!cell) {
      return;
    }
    if(cell.x != this.lastSetX || cell.y != this.lastSetY) {
      this.updateCursor(gridView, x, y);

      if(gridView.buttons & UI.LEFTMOUSEBUTTON) {
        this.lastSetX = cell.x;
        this.lastSetY = cell.y;
        this.editor.grid.grid2d.setCursorCells({  });
      } else {
        this.lastSetX = false;
        this.lastSetY = false;

      }

    }
  },


  mouseUp: function(gridView, x, y) {
    this.lastSetX = false;
    this.lastSetY = false;

  },


  updateCursor: function(gridView, x, y) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  

    var gridCoords = gridView.xyToCell(x, y);

    if(!gridCoords) {
      return;
    }

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    var cell = layer.getCell(gridCoords);

    if(!cell) {
      return;
    }
 
    var tileIndex = cell.t;
    // invert it
    tileIndex = (tileIndex + 128) % 256;

    var fgColor =  cell.fc;
    var bgColor = cell.bc;

    var grid2d = this.editor.grid.grid2d;

    this.editor.currentTile.setCharacter(tileIndex);
    this.editor.currentTile.setColor(fgColor);
    this.editor.grid.setCursorCharacterAndPosition(tileIndex, gridCoords.x, gridCoords.y, gridCoords.z, fgColor);    
//    this.editor.grid.setCursorEnabled(true);            
    grid2d.setCursor(gridCoords.x, gridCoords.y, tileIndex, fgColor, bgColor);
    grid2d.setCursorEnabled(true);

  }  
}
