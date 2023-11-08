var Fill = function() {
  this.editor = null;

  this.stack = [];
}

Fill.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  nonContiguousFill: function(x,y) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }

    var drawTools = this.editor.tools.drawTools;

    this.gridWidth = layer.getGridWidth();
    this.gridHeight = layer.getGridHeight();

    var cell = layer.getCell({ x: x, y: y });
    // make a copy as the target
    var target = {};
    for(key in cell) {
      target[key] = cell[key];
    }


    var replacementTiles = this.editor.currentTile.getCharacters();
    if(replacementTiles.length == 0) {
      return;
    }
    var replacement = replacementTiles[0][0];    

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    for(var y = 0; y < this.gridHeight; y++) {
      for(var x = 0; x < this.gridWidth; x++) {
        var testCell = layer.getCell({ x: x, y: y });
        if(this.cellsAreEqual(target, testCell)) {
          var args = {
            x: x,
            y: y,
            t: replacement,
            fc: fc,
            bc: bc,
            update: false
          };
  
          if(!drawTools.drawCharacter) {
            args.t = testCell.t;
          }
  
          if(!drawTools.drawColor) {
            args.fc = testCell.fc;
          }
  
          if(!drawTools.drawBGColor) {
            args.bc = cellData.bc;
          }
  
  
          layer.setCell(args);
  
        }
      }
    }

    if(layer.getBlockModeEnabled()) {
      this.editor.graphic.invalidateAllCells();
    }      
    this.editor.graphic.redraw();


  },

/*
Flood-fill (node, target-color, replacement-color):
 1. If target-color is equal to replacement-color, return.
 2. If color of node is not equal to target-color, return.
 3. Set Q to the empty queue.
 4. Add node to Q.
 5. For each element N of Q:
 6.     Set w and e equal to N.
 7.     Move w to the west until the color of the node to the west of w no longer matches target-color.
 8.     Move e to the east until the color of the node to the east of e no longer matches target-color.
 9.     For each node n between w and e:
10.         Set the color of n to replacement-color.
11.         If the color of the node to the north of n is target-color, add that node to Q.
12.         If the color of the node to the south of n is target-color, add that node to Q.
13. Continue looping until Q is exhausted.
14. Return.
*/
  floodFill: function(x, y) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }
    var drawTools = this.editor.tools.drawTools;

    this.gridWidth = layer.getGridWidth();
    this.gridHeight = layer.getGridHeight();

    var cell = layer.getCell({ x: x, y: y });

    // make a copy as the target
    var target = {};
    for(key in cell) {
      target[key] = cell[key];
    }

    var replacementTiles = this.editor.currentTile.getCharacters();
    if(replacementTiles.length == 0) {
      return;
    }
    var replacement = replacementTiles[0][0];    

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    // If target-color is equal to replacement-color, return.
    if(target.t === replacement.t
       && target.fc === fc
       && target.bc === bc) {
      return;
    }

    // If color of node is not equal to target-color, return.
    // ??

    // Set Q to the empty queue.
    this.stack = [];

    // Add node to Q.
    this.stackPush({ x: x, y: y });

    var count = 0;
    while(this.stack.length > 0) {
      count++;
      if(count > 10000) {
        return;
      }
      var n = this.stackPop();
//     Set w and e equal to N.
      var w = { x: n.x, y: n.y };
      var e = { x: n.x, y: n.y };

//     Move w to the west until the color of the node to the west of w no longer matches target-color.

      while(this.isValidCell(w)) {
        var testCell = layer.getCell({ x: w.x, y: w.y });
        if(!this.cellsAreEqual(target, testCell)) {
          break;
        }

        var args = {
          x: w.x,
          y: w.y,
          t: replacement,
          fc: fc,
          bc: bc,
          update: false
        };

        if(!drawTools.drawCharacter) {
          args.t = testCell.t;
        }

        if(!drawTools.drawColor) {
          args.fc = testCell.fc;
        }

        if(!drawTools.drawBGColor) {
          args.bc = cellData.bc;
        }


        layer.setCell(args);

//         If the color of the node to the north of n is target-color, add that node to Q.
        var north = { x: w.x, y: w.y + 1 };
        if(this.isValidCell(north) && this.cellsAreEqual(target, layer.getCell(north))) {

          this.stackPush(north);
        }
//         If the color of the node to the south of n is target-color, add that node to Q.        
        var south = { x: w.x, y: w.y - 1 };
        if(this.isValidCell(south) && this.cellsAreEqual(target, layer.getCell(south))) {
          this.stackPush(south);
        }
        w.x--;
      }
      w.x++;

//     Move e to the east until the color of the node to the east of e no longer matches target-color.
      e.x++;
      while(this.isValidCell(e)) {
        var testCell = layer.getCell({ x: e.x, y: e.y });
        if(!this.cellsAreEqual(target, testCell)) {
          break;
        }

        var args = {
          x: e.x,
          y: e.y,
          t: replacement,
          fc: fc,
          bc: bc,
          update: false
        };

        if(!drawTools.drawCharacter) {
          args.t = testCell.t;
        }

        if(!drawTools.drawColor) {
          args.fc = testCell.fc;
        }

        if(!drawTools.drawBGColor) {
          args.bc = cellData.bc;
        }


        layer.setCell(args);

//         If the color of the node to the north of n is target-color, add that node to Q.
        var north = { x: e.x, y: e.y + 1 };
        if(this.isValidCell(north) && this.cellsAreEqual(target, layer.getCell(north))) {

          this.stackPush(north);
        }
//         If the color of the node to the south of n is target-color, add that node to Q.        
        var south = { x: e.x, y: e.y - 1 };
        if(this.isValidCell(south) && this.cellsAreEqual(target, layer.getCell(south))) {
          this.stackPush(south);
        }


        e.x++;
      }
      e.x--;



    }

    if(layer.getBlockModeEnabled()) {
      this.editor.graphic.invalidateAllCells();
    }      
    this.editor.graphic.redraw();

  },

  cellsAreEqual: function(target, testCell) {
    var drawTools = this.editor.tools.drawTools;

    if(drawTools.drawCharacter) {
      if(target.t !== testCell.t) {
        return false;
      }
    }

    if(drawTools.drawColor) {
      if( target.fc !== testCell.fc) {
        return false;
      }
    }

    if(drawTools.drawBGColor) {
      if(target.bc !== testCell.bc) {
        return false;
      }
    }

    return true;

  },

  isValidCell: function(cell) {

    if(this.editor.tools.drawTools.select.isActive()) {
      if(!this.editor.tools.drawTools.select.inSelection(cell.x, cell.y)) {
        return false;
      }
    }
    if(cell.x < 0 || cell.x >= this.gridWidth
      || cell.y < 0 || cell.y >= this.gridHeight) {
      return false;
    }

    return true;
  },
  stackPush: function(cell) {
    if(!this.isValidCell(cell)){
      return;
    }
    /*
    if(cell.x < 0 || cell.x >= this.gridWidth
      || cell.y < 0 || cell.y >= this.gridHeight) {
      return;
    }
    */

    for(var i = 0; i < this.stack.length; i++) {
      if(this.stack[i].x == cell.x && this.stack[i].y == cell.y) {
        return;
      }
    }
    this.stack.push(cell);

  },

  stackPop: function() {
    var cell = this.stack[this.stack.length - 1];
    this.stack = this.stack.slice(0, -1);    
    return cell;
  },

  fill: function(plane, x, y, z) {

    console.error("FULL!!!");

    var grid = this.editor.grid;
    var gridData = this.editor.grid.gridData;


    var characters = this.editor.currentTile.getCharacters();
    if(characters.length == 0) {
      return;
    }
    var character = characters[0][0];

    var color = this.editor.currentTile.getColor();
    var bgColor = this.editor.currentTile.getBGColor();
    var rotX = this.editor.currentTile.rotX;
    var rotY = this.editor.currentTile.rotY;
    var rotZ = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;

    var fillTestCharacter = gridData[z][y][x].c;
    var fillTestColor = gridData[z][y][x].fc;
    var fillTestBGColor = gridData[z][y][x].bc;

    this.fillStack = [];

    if(fillTestCharacter != character || fillTestColor != color || fillTestBGColor != bgColor) {
      this.stackPush({ x: x, y: y, z: z});
    }



    var args = {};
    var counter = 0;
    while(this.stack.length > 0) {
      var pos = this.stackPop();

      //stack[stack.length - 1];
      //stack = stack.slice(0, -1);    

      counter++;
      if(counter > 10000) {
        alert('reached max!');
        break;
      }

      var isFillCell = true;

      if(gridData[pos.z][pos.y][pos.x].c != fillTestCharacter) {
        isFillCell = false;
      }

      if(gridData[pos.z][pos.y][pos.x].fc != fillTestColor) {
        isFillCell = false;
      }

      if(gridData[pos.z][pos.y][pos.x].bc != fillTestBGColor) {
        isFillCell = false;
      }

      if(isFillCell) {


        if(!this.editor.tools.drawTools.drawCharacter) {
          character = gridData[pos.z][pos.y][pos.x].c;
        }
        if(!this.editor.tools.drawTools.drawColor) {
          color = gridData[pos.z][pos.y][pos.x].fc;
        }
        if(!this.editor.tools.drawTools.drawBGColor) {
          bgColor = gridData[pos.z][pos.y][pos.x].bc;
        }

        args.t = character;
        args.x = pos.x;
        args.y = pos.y;
        args.z = pos.z;
        args.fc = color;
        args.rx = rotX;
        args.ry = rotY;
        args.rz = rotZ;
        args.fh = fh;
        args.fv = fv;
        args.bc = bgColor;
        args.update = false;

        grid.setCell(args);

        var newPos = { x: pos.x - 1, y: pos.y, z: pos.z };
        if(newPos.x >= 0) {
          this.stackPush(newPos);
        }

        var newPos = { x: pos.x + 1, y: pos.y, z: pos.z };
        if(newPos.x < grid.width) {
          this.stackPush(newPos);
        }

        if(plane == 'xz') {
          var newPos = { x: pos.x, y: pos.y, z: pos.z - 1};
          if(newPos.z >= 0) {
            this.stackPush(newPos);
          }

          var newPos = { x: pos.x, y: pos.y, z: pos.z + 1 };
          if(newPos.z < grid.depth) {
            this.stackPush(newPos);
          }

        } else {
          var newPos = { x: pos.x, y: pos.y - 1, z: pos.z };
          if(newPos.y >= 0) {
            this.stackPush(newPos);
          }

          var newPos = { x: pos.x, y: pos.y + 1, z: pos.z };
          if(newPos.y < grid.height) {
            this.stackPush(newPos);
          }
        }

      }
    }

//    this.editor.grid.update();
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

  }

}