var PixelSelect = function() {
  this.editor = null;

  this.active = false;
  this.selection = {
    minX: 0,
    minY: 0,

    maxX: 0,
    maxY: 0,
  };

  this.selectSave = {
    minX : 0,
    maxX: 0,
    minY: 0,
    maxY: 0
  };


  this.mouseDownOnPixel = { x: 0, y: 0 };

  this.selectionOffsetX = 0;
  this.selectionOffsetY = 0;

  this.copyAtX = false;
  this.copyAtY = false;

  this.pasteOffsetX = 0;
  this.pasteOffsetY = 0;

  this.lastSelection = { from: {x: 0, y: 0 }, to: { x: 0, y: 0 }};

  this.inDragSelectedPixels = false;

  this.canvas = null;

  // has the user just pasted, they need to either drag or click somewhere else
  this.inPasteMove = false;

  // is user currently dragging pasted
  this.inDragPaste = false;

  this.data = [];

  this.nudgeData = false;

}

PixelSelect.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  setActive: function(active) {
    this.active = active;
  },

  isActive: function() {
    // should check if visible and if min != max
    if(this.editor.getEditorMode() != 'pixel') {
      return false;
    }
    return this.active;
  },

  isInPasteMove: function() {
    if(this.editor.getEditorMode() != 'pixel') {
      return false;
    }
    return this.inPasteMove;
  },

  getSelection: function() {
    return this.selection;
  },


  getPasteWidth: function() {
    if(this.data.length == 0) {
      return 0;
    }

    return this.data[0].length;
  },

  getPasteHeight: function() {
    return this.data.length;
  },

  drawPastedPixels: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    var colorIndex = this.editor.currentTile.getColor();
    var args = {
      canvas: this.canvas,
      colorIndex: colorIndex,
      pixelData: this.data
    }

    layer.drawPixels(args);
  },


  drawSelection: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();
    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    if(this.canvas == null) {
      this.canvas = document.createElement('canvas');
    }

    this.canvas.width = layerWidth;
    this.canvas.height = layerHeight;

    var fromX = Math.floor(this.selection.minX / cellWidth);
    var minY = this.selection.minY;
    if(minY < 0) {
      minY = 0;
    }
// reverseY    var fromY = Math.floor(  (layerHeight - 1 - minY) / cellHeight);
    var fromY = Math.floor(minY / cellHeight);

    var toX = Math.ceil(this.selection.maxX / cellWidth) + 1;

// reverseY    var toY = Math.ceil(  (layerHeight - 1 - this.selection.maxY) / cellHeight) + 1;
    var toY = Math.ceil( this.selection.maxY / cellHeight) + 1;

    if(toX >  layerWidth) {
      toX = layerWidth;
    }

    if(toY > layerHeight) {
      toY = layerHeight;
    }


    if(fromX < 0) {
      fromX = 0;
    }

    if(fromY < 0) {
      fromY = 0;
    }

    if(toX < 0) {
      toX = 0;
    }

    toY = layerHeight / cellHeight;
    var args = {
      draw: 'pixelselection',
      canvas: this.canvas,
      fromX: fromX,
      fromY: fromY,
      toX: toX,
      toY: toY
    };

    layer.draw(args);

  },

  setSelection: function(args) {
//    console.error('set selection');
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var resetNudgeData = true;
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();
    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    var graphicWidth = gridWidth * cellWidth;
    var graphicHeight = gridHeight * cellHeight;

    var saveInHistory = true;
    var from = { x: this.lastSelection.from.x, y: this.lastSelection.from.y };
    var to = { x: this.lastSelection.to.x, y: this.lastSelection.to.y };
    var enabled = true;

    if(typeof args != 'undefined') {
      if(typeof args.from != 'undefined') {
        from = args.from;
      }

      if(typeof args.to != 'undefined') {
        to = args.to;
      }

      if(typeof args.enabled != 'undefined') {
        enabled = args.enabled;
      }

      if(typeof args.saveInHistory != 'undefined') {
        saveInHistory = args.saveInHistory;
      }

      if(typeof args.resetNudgeData != 'undefined') {
        resetNudgeData = args.resetNudgeData;
      }
    }

    if(resetNudgeData) {
      this.nudgeData = false;
    }

    if(from.x == this.lastSelection.from.x && from.y == this.lastSelection.from.y 
        && to.x == this.lastSelection.to.x && to.y == this.lastSelection.to.y 
        && enabled === this.selectionEnabled) {
      return;
    }



    if(saveInHistory) {
      var history = {
        lastEnabled: this.selectionEnabled,
        lastFrom: { x: this.lastSelection.from.x, y: this.lastSelection.from.y },      
        lastTo: {x: this.lastSelection.to.x, y: this.lastSelection.to.y },
        enabled: enabled,
        from: { x: from.x, y: from.y },      
        to: { x: to.x, y: to.y }
      }
  
      this.editor.history.startEntry('pixelSelectionChange');
      this.editor.history.addAction('pixelSetSelection', history);
      this.editor.history.endEntry();
  
      this.lastSelection.from.x = from.x;
      this.lastSelection.from.y = from.y;

      this.lastSelection.to.x = to.x;
      this.lastSelection.to.y = to.y;
      this.selectionEnabled = enabled;
    }    


    this.selectionActive = true;
    var minX = from.x;
    var minY = from.y;

    var maxX = to.x;
    var maxY = to.y;

    if(minX > maxX) {
      minX = maxX;
      maxX = from.x;
    }

    if(minY > maxY) {
      minY = maxY;
      maxY = from.y;      
    }
/*
    if(minX < 0) {
     // minX = 0;
    }

    if(minX >= graphicWidth) {
     // minX = graphicWidth - 1;
    }

    if(maxX >= graphicWidth) {
//      maxX = graphicWidth - 1;
    }

    if(maxX < 0) {
    //  maxX = 0;
    }

    if(minY < 0) {
     // minY = 0;
    }

    if(minY >= graphicHeight) {
      //minY = graphicHeight - 1;
    }

    if(maxY >= graphicHeight)  {
      //maxY = graphicHeight - 1;
    }

    if(maxY < 0) {
      //maxY = 0;
    }
*/

    this.selection.minX = minX;
    this.selection.minY = minY;

    this.selection.maxX = maxX+1;
    this.selection.maxY = maxY+1;



    if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
      if(this.selection.minX % 2) {
        this.selection.minX -= 1;
      }
      if(this.selection.maxX % 2) {
        this.selection.maxX += 1;  
      }
    }
    this.active = true;

    if(!enabled) {
      this.active = false;
    }
  },


  recordSelectionChangeHistory: function() {
    this.editor.history.startEntry('pixelSelectionChange');

    this.editor.history.endEntry();
  },  

  selectAll: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    this.setSelection({ from: { x: 0, y: 0 }, to: { x: layerWidth - 1, y: layerHeight - 1 } });

  },

  unselectAll: function() {
    this.setSelection({enabled: false});

    this.editor.graphic.redraw({ allCells: true });    
  },

  mouseDown: function(gridView, event) {


    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    // which buttons are down
    var buttons = gridView.buttons;

    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;

    this.mouseDownX = x;
    this.mouseDownY = y;

    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;

//    var cell = gridView.xyToCell(x, y);
    var pixelXY = gridView.xyToPixel(x, y);
    if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
      pixelXY.x = Math.floor(pixelXY.x / 2) * 2;
    }

    if(pixelXY.x < 0 || pixelXY.y < 0 || pixelXY.x >= layerWidth || pixelXY.y >= layerHeight) {

      this.unselectAll();
      this.inSelect = false;
      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true }); 

      return;
    }

//    if( (typeof event.metaKey != 'undefined' && event.metaKey) || (typeof event.metaKey != 'undefined' && event.ctrlKey) ) {
      // user is trying to drag whole grid
//      return;
//    }


    this.mouseDownOnPixel.x = pixelXY.x;
    this.mouseDownOnPixel.y = pixelXY.y;


    if(this.inPasteMove) {
      this.inDragPaste = true;
      return;
    }

//      if(this.cellInSelection2d(cell) && this.selection.visible) {
    if(this.pixelInSelection(pixelXY) && this.isActive()) {
    
      // testing if mouse down in selection
//      if( (buttons & UI.LEFTMOUSEBUTTON && (typeof event.altKey != 'undefined' && event.altKey) ) || this.editor.tools.drawTools.tool == 'pixelmove') {
      if( (buttons & UI.LEFTMOUSEBUTTON 
        && (typeof event.metaKey != 'undefined' && event.metaKey
          || typeof event.ctrlKey != 'undefined' && event.ctrlKey) ) 
        || this.editor.tools.drawTools.tool == 'pixelmove') {  

        // drag selected pixel
        UI.setCursor('move');

        this.inDragSelectedPixels = true;


        this.selectionOffsetX = 0;
        this.selectionOffsetY = 0;
        this.selectionDragMode = '2d';

        this.editor.graphic.invalidateAllCells();

        return;

      } else if(buttons & UI.LEFTMOUSEBUTTON) {
        // mouse down in select, start drag selection outline
        UI.setCursor('drag-selection-outline');

        var selection = this.selection;

        this.inDragSelect = true;

        // save this if max/min changes as mouse drags
        this.selectSave.minX = selection.minX;
        this.selectSave.minY = selection.minY;
        this.selectSave.maxX = selection.maxX;
        this.selectSave.maxY = selection.maxY;
        return;
      }
    }

    // start a selection
    this.expandFromMiddle = typeof event.shiftKey != 'undefined' && event.shiftKey;
    this.inSelect = true;

//    this.unselectAll({ saveInHistory});

    this.setSelection({ from: pixelXY, to: pixelXY, enabled: false, saveInHistory: false });
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true }); 

  },
  
  pixelInSelection: function(pixelXY) {

    if(pixelXY.x >= this.selection.minX  && pixelXY.x < this.selection.maxX ) {
      if(pixelXY.y >= this.selection.minY  && pixelXY.y < this.selection.maxY ) {
        return true;
      }
    }
    return false;
  },


  marqueeSelectToMouse: function(gridView, event, saveInHistory) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    var x = 0;
    var y = 0;


    if(event === false || typeof event.pageX == 'undefined' || typeof event.pageY == 'undefined') {
      x = gridView.mousePageX - $('#' + gridView.canvas.id).offset().left;
      y = gridView.mousePageY - $('#' + gridView.canvas.id).offset().top;
    } else {
      x = event.pageX - $('#' + gridView.canvas.id).offset().left;
      y = event.pageY - $('#' + gridView.canvas.id).offset().top;
    }


    var pixelXY = gridView.xyToPixel(x, y);
    if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
//        pixelXY.x = Math.floor(pixelXY.x / 2) * 2;
      }

      
    // currently selecting characters
    if(pixelXY.x < 0) {
      pixelXY.x = 0;
    }
    if(pixelXY.x >= layerWidth) {
      pixelXY.x = layerWidth - 1;
    }

    if(pixelXY.y < 0) {
      pixelXY.y = 0;
    }

    if(pixelXY.y >= layerHeight) {
      pixelXY.y = layerHeight - 1;
    }

    var x1 = this.mouseDownOnPixel.x;
    var y1 = this.mouseDownOnPixel.y;

    var x2 = pixelXY.x;
    var y2 = pixelXY.y;

    if(this.expandFromMiddle) {
      x1 = Math.floor(x1 - (x2 - x1));
      y1 = Math.floor(y1 - (y2 - y1));
    }


    this.setSelection({ from: {x: x1, y: y1 }, to: { x: x2, y: y2 }, saveInHistory: saveInHistory });
  },

  mouseMove: function(gridView, event) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;

    var pixelXY = gridView.xyToPixel(x, y);
    if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
      pixelXY.x = Math.floor(pixelXY.x / 2) * 2;
    }

    if(this.inDragPaste) {

      UI.setCursor('move');
      // dragging pasted
      this.pasteOffsetX = pixelXY.x - this.mouseDownOnPixel.x;
// reverseY      this.pasteOffsetY =  -pixelXY.y + this.mouseDownOnPixel.y; 
      this.pasteOffsetY =  pixelXY.y - this.mouseDownOnPixel.y; 
      
      this.editor.graphic.redraw(); 
    } else if(this.inPasteMove) {
      UI.setCursor('move');

    } else if(this.inSelect) {
      this.marqueeSelectToMouse(gridView, event, false);

    } else if(this.inDragSelect) {
      // dragging the selection outline
      UI.setCursor('drag-selection-outline');

      var pixelDiffX = pixelXY.x - this.mouseDownOnPixel.x;
      var pixelDiffY = pixelXY.y - this.mouseDownOnPixel.y;

      var newSelectionMin = { x: this.selectSave.minX + pixelDiffX, y: this.selectSave.minY + pixelDiffY };

      var newSelectionMax = { x: this.selectSave.maxX + pixelDiffX - 1, y: this.selectSave.maxY + pixelDiffY - 1 };

      this.setSelection({ from: newSelectionMin, to: newSelectionMax, saveInHistory: false});


      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true }); 

    } else if(this.inDragSelectedPixels) {

      // dragging the selected content
      UI.setCursor('move');

      this.selectionOffsetX = pixelXY.x - this.mouseDownOnPixel.x;
      this.selectionOffsetY =  pixelXY.y - this.mouseDownOnPixel.y; 
      
      this.editor.graphic.redraw(); 


    } else {

      // mouse is just moving with no button down
      if(this.pixelInSelection(pixelXY) && this.isActive()) {
        // mouse is in the selection
        if( (typeof event.metaKey != 'undefined' && event.metaKey || typeof event.ctrlKey != 'undefined' && event.ctrlKey) || this.editor.tools.drawTools.tool == 'pixelmove') {
          UI.setCursor('move');
        } else {
          UI.setCursor('can-drag-selection-outline');
        }

      } else {
        UI.setCursor('box-select');
      }

    }
  },  


  mouseUp: function(gridView, event) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();


    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;


    if(this.inDragSelect) {
      // dragging selection outline..

      var pixelXY = gridView.xyToPixel(x, y);
      if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
        pixelXY.x = Math.floor(pixelXY.x / 2) * 2;
      }
  
      var pixelDiffX = pixelXY.x - this.mouseDownOnPixel.x;
      var pixelDiffY = pixelXY.y - this.mouseDownOnPixel.y;

      var newSelectionMin = { x: this.selectSave.minX + pixelDiffX, y: this.selectSave.minY + pixelDiffY };

      var newSelectionMax = { x: this.selectSave.maxX + pixelDiffX - 1, y: this.selectSave.maxY + pixelDiffY - 1 };

      this.setSelection({ from: newSelectionMin, to: newSelectionMax, saveInHistory: true});


      if( typeof event.altKey != 'undefined' && event.altKey) {
        UI.setCursor('can-drag');
      } else {
        UI.setCursor('can-drag-selection-outline');
      }
    }


    if(this.inSelect) {
      if(x == this.mouseDownX && y == this.mouseDownY) {
        this.unselectAll();


        gridView.xyToCell(x, y);
        var cell = gridView.foundCell;


        this.setSelection({ from: cell, to: cell, enabled: false, saveInHistory: false });

      } else {
        // save the history..
        this.marqueeSelectToMouse(gridView, event, true);
      }

      this.selectionOffsetX = 0;
      this.selectionOffsetY = 0;

      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true });

    }


//    if(this.inDragPaste) {
    if(this.inPasteMove) {
      // ok, paste for real at the dragged position
      this.endPasteDrag();
    }


    this.inPasteMove = false;
    this.inSelect = false;

    this.inDragSelect = false;

    if(this.inDragSelectedPixels) { 
      if(  (typeof event.altKey != 'undefined' && event.altKey) || this.editor.tools.drawTools.tool == 'move') {
        UI.setCursor('move');
      } else {
        UI.setCursor('can-drag-selection-outline');
      }

      this.endSelectionDrag();

//      this.editor.graphic.redraw({ allCells: true });

      this.inDragSelectedPixels = false;
    }



  },  


  endPasteDrag: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    this.inDragPaste = false;
    this.inPasteMove = false;

// reverseY    this.paste({ allowMove: false, pasteAtX: this.pasteOffsetX, pasteAtY:  layerHeight - this.pasteOffsetY });

    this.paste({ allowMove: false, pasteAtX: this.pasteOffsetX, pasteAtY:  this.pasteOffsetY });

  },

  endSelectionDrag: function() {
    if(this.selectionOffsetX != 0 || this.selectionOffsetY != 0) {
      this.editor.history.startEntry('PixelDrag');
      this.editor.history.setNewEntryEnabled(false);

      this.cut();

      var from = {
        x: this.selection.minX + this.selectionOffsetX,
        y: this.selection.minY + this.selectionOffsetY
      }

      var to = {
        x: this.selection.maxX + this.selectionOffsetX - 1,
        y: this.selection.maxY + this.selectionOffsetY - 1
      }
      this.setSelection({ from: from, to: to })

      this.selectionOffsetX = 0;
      this.selectionOffsetY = 0;

      this.paste({ allowMove: false });

      this.editor.history.setNewEntryEnabled(true);

      this.editor.history.endEntry();


    }
    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;

    // paste should do the redraw
//    this.editor.graphic.redraw(); 

  },


  clear: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    if(this.inPasteMove) {
      // ok, paste for real at the dragged position
      this.endPasteDrag();
    }

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    var tileSet = layer.getTileSet();

    var history = true;
    if(typeof args != 'undefined' && typeof args.history != 'undefined') {
      history = args.history;
    }

    if(history) {
      this.editor.history.startEntry('PixelClear');
    }

    var selection = this.selection;
    var modifiedTiles = [];

    for(var y = selection.minY; y < selection.maxY; y++) {
      for(var x = selection.minX; x < selection.maxX; x++) {
        if(y < layerHeight) {
          var gridX = Math.floor(x / cellWidth);
          var gridY = Math.floor(y / cellHeight);
          var pixelX = x % cellWidth;
// reverseY          var pixelY = cellHeight - 1 - (y % cellHeight);
          var pixelY = y % cellHeight;

          var cellTile = layer.getTile({ x: gridX, y: gridY });
          if(cellTile !== false) {
            tileSet.setPixel(cellTile, pixelX, pixelY, 0, false); 
            if(modifiedTiles.indexOf(cellTile) === -1) {
                modifiedTiles.push(cellTile);
            }     
          }
        }

      }
    }
 
    if(this.editor.tileEditor.visible) {
      this.editor.tileEditor.draw();
    }

      
    if(history) {
      this.editor.history.endEntry();
    }
    for(var i = 0; i < modifiedTiles; i++) {
      tileSet.updateCharacter(modifiedTiles[i]);
    }

    this.editor.graphic.invalidateAllCells();
   
    this.editor.graphic.redraw();

  },
  

  cut: function(args) {
    if(this.inPasteMove) {
      // ok, paste for real at the dragged position
      this.endPasteDrag();
    }


    this.copy(args);
    this.clear(args);

  },

  copy: function(args) {
    if(this.inPasteMove) {
      // ok, paste for real at the dragged position
      this.endPasteDrag();
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var useNudgeData = false;
    if(typeof args != 'undefined') {
      if(typeof args.useNudgeData != 'undefined') {
        useNudgeData = args.useNudgeData;
      }
    }
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();
    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();
    var tileSet = layer.getTileSet();

    var selection = this.selection;

    var data = [];

    this.copyAtX = selection.minX;
    this.copyAtY = selection.minY;

    var width = selection.maxX - selection.minX;    
    var height = selection.maxY - selection.minY;
    for(var y = 0; y < height; y++) {
      data[y] = [];
      for(var x = 0; x < width; x++) {

       if(selection.minY + y >= 0 && selection.minY + y < layerHeight
           && selection.minX + x >= 0 && selection.minX + x < layerWidth) {
          // location of the pixel in the layer
          var layerX = selection.minX + x;
          var layerY = selection.minY + y;

          // the grid cell
          var gridX = Math.floor(layerX / cellWidth);
          var gridY = Math.floor(layerY / cellHeight);

          // the pixel within the cell
          var pixelX = layerX % cellWidth;
//          var pixelY = cellHeight - 1 - (layerY % cellHeight);
          var pixelY = layerY % cellHeight;

          var cellTile = layer.getTile({ x: gridX, y: gridY });
          if(cellTile !== false) {
            data[y][x] = tileSet.getPixel(cellTile, pixelX, pixelY, 0);
          }

        } else {
          data[y][x] = 0;
        }
      }
    }

    if(useNudgeData) {
      this.nudgeData = data;
    } else {
      this.data = data;
    }
  },

  pasteAsMovable: function() {
    this.pasteOffsetY = 0;
    this.pasteOffsetX = 0;

    this.unselectAll();
    this.inPasteMove = true;
    this.editor.graphic.invalidateAllCells();     
    this.editor.graphic.redraw();

  },

  paste: function(args) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    if(!this.inPasteMove) {
      // paste called for first time, do we just paste into selection?
      // if selection hasn't moved, dont paste into selection..
      // if selection has moved and width and height are the same, paste into selection


      var selection = this.selection;

      var data = [];
  
      var width = selection.maxX - selection.minX;    
      var height = selection.maxY - selection.minY;

      
      if(this.data.length > 0 && this.data.length == height && this.data[0].length == width) {
        if(selection.minX !== this.copyAtX && this.selection.minY !== this.copyAtY) {
          this.inPasteMove = false;
          this.inDragPaste = false;

          if(typeof args == 'undefined') {
            args = {};
          }

          args.allowMove = false;
          args.pasteAtX = selection.minX;
          args.pasteAtY = selection.minY;
        }
    
    // reverseY    this.paste({ allowMove: false, pasteAtX: this.pasteOffsetX, pasteAtY:  layerHeight - this.pasteOffsetY });
    
//        this.paste({ allowMove: false, pasteAtX: this.pasteOffsetX, pasteAtY:  this.pasteOffsetY });
    

      }
    }

    if(this.inPasteMove) {
      // ok, paste for real at the dragged position
      this.endPasteDrag();
    }
    
    var useNudgeData = false;
    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();
    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    // allow the pasted are to be moved after
    var allowMove = true;

    var tileSet = layer.getTileSet();

    var hFlip = false;
    var vFlip = false;
    var invert = false;
    var rotate = false;

    var history = true;

    var selection = this.selection;
    var modifiedTiles = [];

    var pasteAtX = selection.minX;
    var pasteAtY = selection.minY;

    if(typeof args != 'undefined') {
      if(typeof args.hflip != 'undefined') {
        hFlip = args.hflip;
      }

      if(typeof args.vflip != 'undefined') {
        vFlip = args.vflip;
      }

      if(typeof args.invert != 'undefined') {
        invert = args.invert;
      }

      if(typeof args.rotate != 'undefined') {
        rotate = args.rotate;
      }

      if(typeof args.allowMove) {
        allowMove = args.allowMove;
      }
    
      if(typeof args.history != 'undefined') {
        history = args.history;
      }

      if(typeof args.pasteAtX != 'undefined') {
        pasteAtX = args.pasteAtX;
      }

      if(typeof args.pasteAtY != 'undefined') {
        pasteAtY = args.pasteAtY;
      }

      if(typeof args.useNudgeData != 'undefined') {
        useNudgeData = args.useNudgeData;
      }
    }


    if(allowMove) {
      this.pasteAsMovable();
      return;
    }

    if(history) {
      this.editor.history.startEntry('PixelPaste');
    }

    var pasteTransparent = false;

    if(typeof args != 'undefined') {
      if(typeof args.pasteAtX != 'undefined') {
        pasteAtX = args.pasteAtX;
      }
      if(typeof args.pasteAtY != 'undefined') {
        pasteAtY = args.pasteAtY;
      }

      if(typeof args.pasteTransparent) {
        pasteTransparent = args.pasteTransparent;
      }
    }

    var isC64Multicolor = layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR;
    var data = this.data;
    if(useNudgeData && this.nudgeData !== false) {
      data = this.nudgeData;
    }

    for(var y = 0; y < data.length; y++) {
      for(var x = 0; x < data[y].length; x++) {
        var srcX = x;
        var srcY = y;       
        if(vFlip) {
          srcY = data.length - 1 - y;
        }

        if(hFlip) {
          if(isC64Multicolor) {
            srcX = data[0].length - 1 - x;
            if(x % 2) {
              srcX += 1;              
            } else {
              srcX -= 1;
            }
          } else {
            srcX = data[0].length - 1 - x;
          }
        }

        var pixelValue = data[srcY][srcX];

        if(invert) {
          if(pixelValue > 0) {
            pixelValue = 0;
          } else {
            pixelValue = 1;
          }    
        }

        var pasteX = x;
        var pasteY = y;// - data.length;

        if(rotate) {
          pasteX = data.length - y;
          pasteY = x;
//          pasteY = x;//(x - data[0].length);
          
        }

        pasteX += pasteAtX;//selection.minX;
//        pasteY += selection.minY + 1;
        pasteY += pasteAtY;//selection.maxY ;

        if(pasteX >= 0 && pasteY >= 0 &&  pasteX < layerWidth && pasteY < layerHeight) {

          var gridX = Math.floor(pasteX / cellWidth);
          var gridY = Math.floor(pasteY / cellHeight);
          var pixelX = pasteX % cellWidth;
// reverseY          var pixelY = cellHeight - 1 - (pasteY % cellHeight);
          var pixelY = pasteY % cellHeight;

          var cellTile = layer.getTile({ x: gridX, y: gridY });
          if(cellTile !== false) {

            if(pixelValue || pasteTransparent) {
              tileSet.setPixel(cellTile, pixelX, pixelY, pixelValue, false);
              if(modifiedTiles.indexOf(cellTile) === -1) {
                modifiedTiles.push(cellTile);
              }
            }
          }
        }
      }
    }

    if(history) {
      this.editor.history.endEntry();
    }


    
    for(var i = 0; i < modifiedTiles; i++) {
      tileSet.updateCharacter(modifiedTiles[i]);
    }
    this.editor.graphic.invalidateAllCells();     
    this.editor.graphic.redraw();
  
    if(this.editor.animationPreview.getVisible()) {
      this.editor.animationPreview.draw();
    }

  },
  


  nudgeSelection: function(x, y, args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var layerWidth = layer.getWidth();
    var layerHeight = layer.getHeight();

    var moveCut = false;
    var moveCopy = false;

    var selection = this.selection;

    var selectAll = !this.isActive()
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
      if(x < 0) {
        this.selection.minX -= x;
      }

      if(y < 0) {
        this.selection.minY -= y;
      }
      if(y > 0) {
        this.selection.maxY -= y;      
      }
    }


    if(typeof args != 'undefined') {
      if(typeof args.moveCopy != 'undefined') {
        moveCopy = args.moveCopy;
      }
      if(typeof args.moveCut != 'undefined') {
        moveCut = args.moveCut;
      }
    }


    if(layer.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
      if(x == 1 || x == -1) {
        x *= 2;
      }
    }


    var min = { x: 0, y: 0 };
    var max = { x: 0, y: 0  };


    min.x = selection.minX + x;
    min.y = selection.minY + y;

    max.x = selection.maxX + x - 1;
    max.y = selection.maxY + y - 1;

    if(!selectAll) {
      if(min.x < 0) {
//        return;
      }

      if(min.y < 0) {
        //return;
      }

      if(max.y >= layerHeight) {
        //return;
      }

      if(max.x >= layerWidth) {
        //return;
      }
    }
    if(moveCut || moveCopy) {
      this.editor.history.startEntry('pixelNudgeSelection');
      this.editor.history.setNewEntryEnabled(false);

      if(this.nudgeData !== false) {
        // got the data in the nudge data
        this.clear();

      } else {
        // set the nudge data
        if(moveCut) {
          this.cut({ useNudgeData: true });
        }
        if(moveCopy) {
          this.copy({ useNudgeData: true });
        }
      }

      this.setSelection({ from: min, to: max, resetNudgeData: false, saveInHistory: true } );
      var args = { pasteTransparent: true, allowMove: false, useNudgeData: true };
      this.paste(args);
      this.editor.history.setNewEntryEnabled(true);
      this.editor.history.endEntry();

      if(moveCopy) {
        // dont really want to invalidate all cells, just the ones from where the selecteion moved from and to
   //     this.editor.graphic.invalidateAllCells();
        // cut and paste should be doing this?
      }

    } else {
      this.setSelection({ from: min, to: max, saveInHistory: true});
    }

    if(selectAll) {
      this.unselectAll();
    }
  },    

}
