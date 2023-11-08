

var Select = function() {
  this.editor = null;

  this.inSelect = false;
  this.inDragSelect = false;
  this.inDragSelectedCharacters = false;

  this.mouseDownOnCell = { x: 0, y: 0, z: 0 };
  this.mouseDownOnBlock = { x: 0, y: 0 };

  this.selectSave = {
    minX : 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    minZ: 0,
    maxZ: 0
  };

  this.data = [];

  this.replaceColor = 0;
  this.replaceWithColor = 0;
  this.invertY = true;

  this.lastSelection = { from: {x: 0, y: 0, z: 0}, to: { x: 0, y: 0, z: 0}};
  this.selectionEnabled = false;

  this.expandFromMiddle = false;
  this.mouseDownX = false;
  this.mouseDownY = false;

  this.selection = {
    visible: false,
    minX: 0,
    minY: 0,
    minZ: 0,

    maxX: 0,
    maxY: 0,
    maxZ: 0
  };

  this.selectionOffsetX = 0;
  this.selectionOffsetY = 0;

  this.lastCell = {
    x: 0,
    y: 0
  };

  this.clipboardCanvas = null;
  this.clipboardImageData = null;
  this.clipboardContext = null;

  this.inPasteMove = false;
  this.inDragPastedContent = false;

  this.copiedFromFrame = false;
  this.copiedFromLayer = false;
  // has the selection changed after copy
  this.selectionChangedAfterCopy = false;

}

Select.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function() {
    if(this.editor.type == '2d') {
      $('.selectZControl').hide();
    }
  },

  isActive: function() {
    // should check if visible and if min != max
    if(this.editor.getEditorMode() == 'pixel') {
      return false;
    }
    return this.selection.visible;
  },


  isInPasteMove: function() {
    return this.inPasteMove;
  },


  getEnabled: function() {
    return this.selectionEnabled;
  },
  
  // draws the dragable clipboard image
  drawClipboardImage: function(context, scale) {

    var drawScale = 1;
    if(typeof scale != 'undefined') {
      drawScale = scale;
    }
    if(this.clipboardCanvas == null 
       || this.clipboardImageWidth == 0 
       || this.clipboardImageHeight == 0) {
         return;
    }
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();


    var x = (this.selection.minX + this.selectionOffsetX) * tileWidth;
    var y = (this.selection.minY + this.selectionOffsetY) * tileHeight;
    
    context.drawImage(this.clipboardCanvas, 
                      0, 0, this.clipboardImageWidth, this.clipboardImageHeight,
                      x * drawScale, y * drawScale, this.clipboardImageWidth * drawScale, this.clipboardImageHeight * drawScale);

  },

  getPasteData: function() {
    return this.data;
  },


  // called when selection is copied.
  clipboardToCanvas: function() {

    if(this.data.length == 0 || this.data[0].length == 0) {
      // selection has no width or height
      this.clipboardImageWidth = 0;
      this.clipboardImageHeight = 0;
      return;
    }

    if(this.clipboardCanvas == null) {
      this.clipboardCanvas = document.createElement('canvas');

//      this.clipboardCanvas = document.getElementById('debugCanvas');
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    var tileSet = layer.getTileSet();// this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();
    var colorPalette = layer.getColorPalette();// this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    var tilesAcross = 0 ;
    var tilesDown = 0;
    tilesAcross = this.data[0].length;
    tilesDown = this.data.length;


    var totalWidth = tileWidth * tilesAcross
    var totalHeight = tileHeight * tilesDown;
    var canvasResized = false;

    this.clipboardImageWidth = totalWidth;
    this.clipboardImageHeight = totalHeight;

    if(this.clipboardCanvas.width < totalWidth) {
      this.clipboardCanvas.width = totalWidth;
      canvasResized = true;
    }

    if(this.clipboardCanvas.height < totalHeight) {
      this.clipboardCanvas.height = totalHeight;
      canvasResized = true;
    }

    var colorPerMode = this.editor.getColorPerMode();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var defaultBgColorRGB = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;


    if(canvasResized || this.clipboardImageData == null) {
      this.clipboardContext = this.clipboardCanvas.getContext("2d");
      this.clipboardContext.clearRect(0, 0, this.clipboardCanvas.width, this.clipboardCanvas.height);
      this.clipboardImageData = this.clipboardContext.getImageData(0, 0, this.clipboardCanvas.width, this.clipboardCanvas.height);
    }

    var imageDataLength = this.clipboardCanvas.width * this.clipboardCanvas.height * 4;
    var pos = 3;
    while(pos < imageDataLength) {
      this.clipboardImageData.data[pos] = 0;
      pos += 4;
    }

    var args = {};

    args['imageData'] = this.clipboardImageData;


    if(layer && typeof layer.getScreenMode != 'undefined') {
      args['screenMode'] = layer.getScreenMode();
      if(args['screenMode'] === TextModeEditor.Mode.INDEXED) {
        args['transparentColorIndex'] = layer.getTransparentColorIndex();
      }

      if(args['screenMode'] === TextModeEditor.Mode.C64MULTICOLOR) {
        defaultBgColorRGB = colorPalette.getHex(layer.getBackgroundColor());

        args['backgroundColor'] = layer.getBackgroundColor();
        args['c64Multi1Color'] = layer.getC64Multi1Color();
        args['c64Multi2Color'] = layer.getC64Multi2Color();

      }
    }


    for(var y = 0; y < tilesDown; y++) {
      for(var x = 0; x < tilesAcross; x++) {
        args['color'] = this.data[y][x].fc;
        args['bgColor'] = this.data[y][x].bc;
        args['character'] = this.data[y][x].t;

        if(args['screenMode'] === TextModeEditor.Mode.C64ECM) {
          if(layer && typeof layer.getC64ECMColor != 'undefined') {

            args['bgColor'] = layer.getC64ECMColor(args['bgColor']);
          }
        }

        if(typeof args['character'] != 'undefined' && args['character'] !== false) {
          //if(this.editor.graphic.hasTileOrientation()) {
          if(this.editor.graphic.getHasTileFlip()) {
            args['flipH'] = this.data[y][x].fh;
            args['flipV'] = this.data[y][x].fv;
          } 

          if(this.editor.graphic.getHasTileRotate()) {
            args['rotZ'] = this.data[y][x].rz;
          }
          
          args['x'] = x * tileWidth;
          args['y'] = y * tileHeight;
          args['scale'] = 1;

          args['select'] = false;
          args['highlight'] = false;
          args['backgroundIsTransparent'] = true;

          tileSet.drawCharacter(args);
        }
      }
    }
    this.clipboardContext.putImageData(this.clipboardImageData, 0, 0);    
    /*
    this.data[y][x] = {
      t: this.editor.tileSetManager.blankCharacter,
      fc: 0,
      ry: 0,
      rx: 0,
      rz: 0,
      bc: -1,
      fh: 0,
      fv: 0
    }
    */


  },

  getSelection: function() {
    return this.selection;
  },

  cropToSelection: function() {
    if(this.selection.minX == this.selection.maxX || this.selection.minY == this.selection.maxY) {
      return;
    }

    var width = (this.selection.maxX - this.selection.minX);
    var height = (this.selection.maxY - this.selection.minY);

    var offsetX = -this.selection.minX;
    var offsetY = -this.selection.minY;

    this.editor.graphic.setGridDimensions({
      width: width,
      height: height,
      offsetX: offsetX,
      offsetY: offsetY
    });

    this.unselectAll();
  },

  setSelection: function(args) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    this.selectionChangedAfterCopy = true;

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var saveInHistory = true;
    var from = { x: this.lastSelection.from.x, y: this.lastSelection.from.y, z: this.lastSelection.from.z };
    var to = { x: this.lastSelection.to.x, y: this.lastSelection.to.y, z: this.lastSelection.to.z };
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
    }

    if(layer.getBlockModeEnabled()) {
      this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockWidth = layer.getBlockWidth();
      var blockHeight = layer.getBlockHeight();

      var temp = 0;
      if(from.x > to.x) {
        temp = from.x;
        from.x = to.x;
        to.x = temp;
      }

      if(from.y > to.y) {
        temp = to.y;
        to.y = from.y;
        from.y = temp;
      }

// reverseY      from.y = this.editor.frames.height - 1 - from.y;
      from.x = Math.floor(from.x / blockWidth) * blockWidth;
      from.y = Math.floor(from.y / blockHeight) * blockHeight;

// reverseY      from.y = this.editor.frames.height - 1 - from.y;


      // width needs to be multiple of block width
      var width = to.x - from.x;
      if(width == 0) {
        width = blockWidth - 1;
      } else if( (width + 1) % (blockWidth) != 0) {
        width += 1;
        width = blockWidth - 1 + (Math.floor(width / (blockWidth)) * (blockWidth));
      }
      to.x = from.x + width;

      var height = to.y - from.y;
      if(height == 0) {
        height = blockHeight - 1;
      } else if( (height + 1) %(blockHeight) != 0) {
        height += 1;
        height =  blockHeight - 1 + (Math.floor(height / blockHeight) * blockHeight);
      }
      to.y = from.y + height;
    }


    if(from.x == this.lastSelection.from.x && from.y == this.lastSelection.from.y && from.z == this.lastSelection.from.z
        && to.x == this.lastSelection.to.x && to.y == this.lastSelection.to.y && to.z == this.lastSelection.to.z
        && enabled === this.selectionEnabled) {
      return;
    }



    if(saveInHistory) {
      var history = {
        lastEnabled: this.selectionEnabled,
        lastFrom: { x: this.lastSelection.from.x, y: this.lastSelection.from.y, z: this.lastSelection.from.z },      
        lastTo: {x: this.lastSelection.to.x, y: this.lastSelection.to.y, z: this.lastSelection.to.z },
        enabled: enabled,
        from: { x: from.x, y: from.y, z: from.z },      
        to: { x: to.x, y: to.y, z: to.z }
      }

      this.editor.history.startEntry('selectionChange');
      this.editor.history.addAction('setSelection', history);
      this.editor.history.endEntry();

      this.lastSelection.from.x = from.x;
      this.lastSelection.from.y = from.y;
      this.lastSelection.from.z = from.z;

      this.lastSelection.to.x = to.x;
      this.lastSelection.to.y = to.y;
      this.lastSelection.to.z = to.z;
      this.selectionEnabled = enabled;
    }



    this.selectionActive = true;
    var minX = from.x;
    var minY = from.y;
    var minZ = from.z;

    var maxX = to.x;
    var maxY = to.y;
    var maxZ = to.z;


    // make sure min and max are the correct way around
    if(minX > maxX) {
      minX = maxX;
      maxX = from.x;
    }


    if(minY > maxY) {
      minY = maxY;
      maxY = from.y;      
    }

    if(minZ == maxZ) {
      maxZ += 1;
    }    

    if(minZ > maxZ) {
      minZ = to.z - 1;

      if(maxZ - minZ == 1) {
        //minZ -= 1;
      }
      maxZ = from.z ;
    } else {
      maxZ -= 1;
    }


    // restrict to visible area??
    var keepInBounds = false;

    if(keepInBounds) {

      if(minX < 0) {
        minX = 0;
      }

      if(minX >= gridWidth) {
        minX = gridWidth - 1;
      }

      if(maxX >= gridWidth) {
        maxX = gridWidth - 1;
      }

      if(maxX < 0) {
        maxX = 0;
      }

      if(minY < 0) {
        minY = 0;
      }

      if(minY >= gridHeight) {
        minY = gridHeight - 1;
      }

      if(maxY >= gridHeight)  {
        maxY = gridHeight - 1;
      }

      if(maxY < 0) {
        maxY = 0;
      }
    }



    if(minZ < 0) {
      minZ = 0;
    }
/*
    if(minZ >= this.depth) {
      minZ = this.depth - 1;
    }

    if(maxZ < 0) {
      maxZ = 0;
    }

    if(maxZ >= this.depth) {
      maxZ = this.depth - 1;
    }
*/
    this.selection.minX = minX;
    this.selection.minY = minY;
    this.selection.minZ = minZ;

    this.selection.maxX = maxX+1;
    this.selection.maxY = maxY+1;
    this.selection.maxZ = maxZ+1;

    this.selection.visible = true;



    if(!enabled) {
      this.selection.visible = false;
    }
  },

  recordSelectionChangeHistory: function() {
    this.editor.history.startEntry('selectionChange');

    this.editor.history.endEntry();


  },

  mouseDown: function(gridView, event) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var buttons = gridView.buttons;

    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;

    this.mouseDownX = x;
    this.mouseDownY = y;

    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;

    var cell = gridView.xyToCell(x, y);



    if(!cell) {

      this.unselectAll();
      this.inSelect = false;
      return;
    }



    if(layer.getBlockModeEnabled()) {
      // can only move in increments of the block dimensions
      this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockWidth = layer.getBlockWidth();
      var blockHeight = layer.getBlockHeight();

// reverseY      cell.y = gridHeight - 1 - cell.y;
      cell.x = Math.floor(cell.x / blockWidth) * blockWidth;
      cell.y = Math.floor(cell.y / blockHeight) * blockHeight;
// reverseY      cell.y = gridHeight - 1 - cell.y;


      this.mouseDownOnBlock.x = cell.x / blockWidth;
      this.mouseDownOnBlock.y = cell.y / blockHeight;


    }
    this.mouseDownOnCell.x = cell.x;
    this.mouseDownOnCell.y = cell.y;
    this.mouseDownOnCell.z = cell.z;


    //if(this.editor.type == '2d') {




      if(this.cellInSelection2d(cell) && this.selection.visible) {
//        if(button == 0 && event.shiftKey) {
//        if( (buttons & UI.LEFTMOUSEBUTTON && (typeof event.altKey != 'undefined' && event.altKey) ) || this.editor.tools.drawTools.tool == 'move') {
        if( (buttons & UI.LEFTMOUSEBUTTON 
              && (typeof event.metaKey != 'undefined' && event.metaKey
                 || typeof event.ctrlKey != 'undefined' && event.ctrlKey) ) 
              || this.editor.tools.drawTools.tool == 'move') {  
          // drag selected characters
          UI.setCursor('move');

          this.inDragSelectedCharacters = true;

          this.selectionOffsetX = 0;
          this.selectionOffsetY = 0;
          this.selectionDragMode = '2d';

          this.editor.graphic.invalidateAllCells();

          return;
        } else if(buttons & UI.LEFTMOUSEBUTTON && this.inPasteMove) {
          this.inDragPastedContent = true;
          UI.setCursor('move');
          return;

        } else if(buttons & UI.LEFTMOUSEBUTTON) {
          // mouse down in select, start drag selection
          UI.setCursor('drag-selection-outline');

          var selection = this.selection;

          this.inDragSelect = true;

          // save this if max/min changes as mouse drags
          this.selectSave.minX = selection.minX;
          this.selectSave.minY = selection.minY;
          this.selectSave.maxX = selection.maxX;
          this.selectSave.maxY = selection.maxY;

          this.selectSave.minZ = selection.minZ;
          this.selectSave.maxZ = selection.maxZ;


          return;
        }
      }
   // }

    // start a selection
    this.expandFromMiddle = typeof event.shiftKey != 'undefined' && event.shiftKey;
    this.inSelect = true;

//    this.unselectAll({ saveInHistory});

    this.setSelection({ from: cell, to: cell, enabled: false, saveInHistory: false });


    if(g_newSystem) {
      this.editor.graphic.invalidateAllCells();
      this.editor.gridView2d.render();      
    }
  },

  cellInSelection2d: function(cell) {

    if(cell.x >= this.selection.minX  && cell.x < this.selection.maxX ) {
      if(cell.y >= this.selection.minY  && cell.y < this.selection.maxY ) {
        return true;
      }
    }
    return false;
  },



  inSelection: function(x, y) {
    if(this.selection.visible == false) {
      return true;
    }    

    if(x >= this.selection.minX  && x < this.selection.maxX ) {
      if(y >= this.selection.minY  && y < this.selection.maxY ) {
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
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var x = 0;
    var y = 0;


    if(event === false || typeof event.pageX == 'undefined' || typeof event.pageY == 'undefined') {
      x = gridView.mousePageX - $('#' + gridView.canvas.id).offset().left;
      y = gridView.mousePageY - $('#' + gridView.canvas.id).offset().top;
    } else {
      x = event.pageX - $('#' + gridView.canvas.id).offset().left;
      y = event.pageY - $('#' + gridView.canvas.id).offset().top;
    }


    gridView.xyToCell(x, y);
    var cell = gridView.foundCell;

    // currently selecting characters
    if(cell.x < 0) {
      cell.x = 0;
    }
    if(cell.x >= gridWidth) {
      cell.x = gridWidth - 1;
    }

    if(cell.y < 0) {
      cell.y = 0;
    }

    if(cell.y >= gridHeight) {
      cell.y = gridHeight - 1;
    }

    var x1 = this.mouseDownOnCell.x;
    var y1 = this.mouseDownOnCell.y;
    var z1 = this.mouseDownOnCell.z;

    var x2 = cell.x;
    var y2 = cell.y;
    var z2 = cell.z;

    if(this.expandFromMiddle) {
      x1 = Math.floor(x1 - (x2 - x1));
      y1 = Math.floor(y1 - (y2 - y1));
    }


    this.setSelection({ from: {x: x1, y: y1, z: z1}, to: { x: x2, y: y2, z: z2}, saveInHistory: saveInHistory });
  },

  mouseMove: function(gridView, event) {


    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;

/*

    if(  (typeof event.metaKey != 'undefined' && event.metaKey) || (typeof event.ctrlKey != 'undefined' && event.ctrlKey) ) {
      // user is trying to drag whole grid
      return;
    }
*/

    gridView.xyToCell(x, y);
    var cell = gridView.foundCell;
    if(cell) {
      this.lastCell.x = cell.x;
      this.lastCell.y = cell.y;
    }

    if(this.inSelect) {
      // dragging out a marquee with mouse
      this.marqueeSelectToMouse(gridView, event, false);

    } else if(this.inDragPastedContent) {

      // dragging the selected content
      UI.setCursor('move');

      this.selectionOffsetX = cell.x - this.mouseDownOnCell.x;
      this.selectionOffsetY =  cell.y - this.mouseDownOnCell.y; 

      if(layer.getBlockModeEnabled()) {

        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();


        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();

// reverseY        cell.y = gridHeight - 1 - cell.y;
        cell.x = Math.floor(cell.x / blockWidth) * blockWidth;
        cell.y = Math.floor(cell.y / blockHeight) * blockHeight;
// reverseY        cell.y = gridHeight - 1 - cell.y;


        var block = { x: 0, y: 0 };
        block.x = cell.x / blockWidth;
        block.y = cell.y / blockHeight;

        this.selectionOffsetX =(block.x - this.mouseDownOnBlock.x) * blockWidth;
        this.selectionOffsetY =(block.y - this.mouseDownOnBlock.y) * blockHeight;
      }
//      console.log('redraw');
//      

      if(g_newSystem) {
        this.editor.gridView2d.render();
      } else {
        this.editor.graphic.redraw();       
      }

    } else if(this.inDragSelect) {
      // dragging the selection outline
      UI.setCursor('drag-selection-outline');

      var cellDiffX = cell.x - this.mouseDownOnCell.x;
      var cellDiffY = cell.y - this.mouseDownOnCell.y;

      if(layer.getBlockModeEnabled()) {

        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();

// reverseY        cell.y = gridHeight - 1 - cell.y;
        cell.x = Math.floor(cell.x / blockWidth) * blockWidth;
        cell.y = Math.floor(cell.y / blockHeight) * blockHeight;
// reverseY        cell.y = gridHeight - 1 - cell.y;


        var block = { x: 0, y: 0 };
        block.x = cell.x / blockWidth;
        block.y = cell.y / blockHeight;

        cellDiffX = (block.x - this.mouseDownOnBlock.x) * blockWidth;
        cellDiffY = (block.y - this.mouseDownOnBlock.y) * blockHeight;
      }

      var newSelectionMin = { x: this.selectSave.minX + cellDiffX, y: this.selectSave.minY + cellDiffY, z: this.selectSave.minZ };

      var newSelectionMax = { x: this.selectSave.maxX + cellDiffX - 1, y: this.selectSave.maxY + cellDiffY - 1, z: this.selectSave.maxZ };

      
      this.setSelection({ from: newSelectionMin, to: newSelectionMax, saveInHistory: false});

      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true }); 

    } else if(this.inDragSelectedCharacters) {

      // dragging the selected content
      UI.setCursor('move');

      this.selectionOffsetX = cell.x - this.mouseDownOnCell.x;
      this.selectionOffsetY =  cell.y - this.mouseDownOnCell.y; 

      if(layer.getBlockModeEnabled()) {

        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();


        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();

// reverseY        cell.y = gridHeight - 1 - cell.y;
        cell.x = Math.floor(cell.x / blockWidth) * blockWidth;
        cell.y = Math.floor(cell.y / blockHeight) * blockHeight;
// reverseY        cell.y = gridHeight - 1 - cell.y;


        var block = { x: 0, y: 0 };
        block.x = cell.x / blockWidth;
        block.y = cell.y / blockHeight;

        this.selectionOffsetX = (block.x - this.mouseDownOnBlock.x) * blockWidth;
        this.selectionOffsetY = (block.y - this.mouseDownOnBlock.y) * blockHeight;

      }

      if(g_newSystem) {
        // dont really need to invalidate all, just prev select area and current
        this.editor.graphic.invalidateAllCells();
        this.editor.gridView2d.render();      
      } else {
        this.editor.graphic.redraw(); 
      }


    } else {

      if(this.editor.type == '2d') {
        this.setSelectCursor(event);
      }

    }
  },

  setSelectCursor: function(event) {
    if(this.inDragSelectedCharacters) {
      UI.setCursor('move');
      return;
    }
    if(this.cellInSelection2d(this.lastCell) && this.selection.visible) {
      // mouse is in the selection
      if( (typeof event.ctrlKey != 'undefined' && event.ctrlKey) 
          || (typeof event.metaKey != 'undefined' && event.metaKey)
          || this.editor.tools.drawTools.tool == 'move'
          || this.inPasteMove) {
        UI.setCursor('move');
      } else {
        UI.setCursor('can-drag-selection-outline');
      }

    } else {

      UI.setCursor('box-select');
    }
  },

 
  endPasteDrag: function() {

    if(!this.inPasteMove) {
      return;
    }

    this.inDragPastedContent = false;
    this.inPasteMove = false;

    var from = {
      x: this.selection.minX + this.selectionOffsetX,
      y: this.selection.minY + this.selectionOffsetY,
      z: this.selection.minZ
    }

    var to = {
      x: this.selection.maxX + this.selectionOffsetX - 1,
      y: this.selection.maxY + this.selectionOffsetY - 1,
      z: this.selection.maxZ
    }

    this.setSelection({ from: from, to: to, enabled: true })
    this.paste(this.pasteMoveArgs);
    this.setSelection({ from: from, to: to, enabled: false })
    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;
    this.unselectAll();

  },

  end2dSelectionDrag: function() {
    if(this.selectionOffsetX != 0 || this.selectionOffsetY != 0) {
      this.editor.history.startEntry('Drag');
      this.editor.history.setNewEntryEnabled(false);

//      this.editor.history.setEnabled(false);

      this.cut();

      var from = {
        x: this.selection.minX + this.selectionOffsetX,
        y: this.selection.minY + this.selectionOffsetY,
        z: this.selection.minZ
      }

      var to = {
        x: this.selection.maxX + this.selectionOffsetX - 1,
        y: this.selection.maxY + this.selectionOffsetY - 1,
        z: this.selection.maxZ
      }
      this.setSelection({ from: from, to: to })
      this.paste();

//      this.editor.history.setEnabled(true);
      this.editor.history.setNewEntryEnabled(true);

      this.editor.history.endEntry();


    }
    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;

    this.editor.graphic.redraw(); 

  },


  mouseUp: function(gridView, event) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var x = event.pageX - $('#' + gridView.canvas.id).offset().left;
    var y = event.pageY - $('#' + gridView.canvas.id).offset().top;

    if(this.inDragSelect) {
      // dragging selection outline..

      gridView.xyToCell(x, y);
      var cell = gridView.foundCell;

      var cellDiffX = cell.x - this.mouseDownOnCell.x;
      var cellDiffY = cell.y - this.mouseDownOnCell.y;


      if(layer.getBlockModeEnabled()) {

        var blockWidth = layer.getBlockWidth();
        var blockHeight = layer.getBlockHeight();

// reverseY        cell.y = gridHeight - 1 - cell.y;
        cell.x = Math.floor(cell.x / blockWidth) * blockWidth;
        cell.y = Math.floor(cell.y / blockHeight) * blockHeight;
// reverseY        cell.y = gridHeight - 1 - cell.y;


        var block = { x: 0, y: 0 };
        block.x = cell.x / blockWidth;
        block.y = cell.y / blockHeight;

        cellDiffX = (block.x - this.mouseDownOnBlock.x) * blockWidth;
        cellDiffY = (block.y - this.mouseDownOnBlock.y) * blockHeight;


      }


      var newSelectionMin = { x: this.selectSave.minX + cellDiffX, y: this.selectSave.minY + cellDiffY, z: this.selectSave.minZ };

      var newSelectionMax = { x: this.selectSave.maxX + cellDiffX - 1, y: this.selectSave.maxY + cellDiffY - 1, z: this.selectSave.maxZ };

      this.setSelection({ from: newSelectionMin, to: newSelectionMax, saveInHistory: true});


      if( typeof event.altKey != 'undefined' && event.altKey) {
        UI.setCursor('can-drag');
      } else {
        UI.setCursor('can-drag-selection-outline');
      }

      this.editor.graphic.redraw({ allCells: true }); 


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
      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true });

    }


    if(this.inPasteMove) {
      this.endPasteDrag();
    }


    this.inSelect = false;

    this.inDragSelect = false;

    if(this.inDragSelectedCharacters) { 
      if(  (typeof event.altKey != 'undefined' && event.altKey) || this.editor.tools.drawTools.tool == 'move') {
        UI.setCursor('move');
      } else {
        UI.setCursor('can-drag-selection-outline');
      }

      this.end2dSelectionDrag();

      this.editor.graphic.redraw({ allCells: true });

      this.inDragSelectedCharacters = false;
    }

    this.selectionOffsetX = 0;
    this.selectionOffsetY = 0;

  },


  selectAll: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();


    var min = { "x": 0, "y": 0, "z": 0 };
    var max = { "x": gridWidth - 1, "y": gridHeight - 1, "z": 1 };

    this.setSelection( {from: min, to: max});
  },

  unselectAll: function() {
    this.setSelection({enabled: false});

    this.editor.graphic.redraw({ allCells: true });    
  },


  clear: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    


    var history = true;
    if(typeof args != 'undefined' && typeof args.history != 'undefined') {
      history = args.history;
    }

    if(history) {
      this.editor.history.startEntry('Clear');
    }

    var selection = this.selection;


    var args = {};

    for(args.y = selection.minY; args.y < selection.maxY; args.y++) {
      for(args.x = selection.minX; args.x < selection.maxX; args.x++) {
        if(layer.getBlockModeEnabled()) {
          args.t = this.editor.tileSetManager.blankCharacter;
          args.bc = this.editor.colorPaletteManager.noColor;
          args.b = 0;
        } else {
          args.t = this.editor.tileSetManager.blankCharacter;
          args.bc = this.editor.colorPaletteManager.noColor;
        }
        args.update = false;
        layer.setCell(args);
      }
    }

    if(history) {
      this.editor.history.endEntry();
    }

    this.editor.graphic.redraw();

  },

  selectionToPen: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var selection = this.selection;

    this.data = [];

    var width = selection.maxX - selection.minX;
//    var depth = selection.maxZ - selection.minZ;
    var height = selection.maxY - selection.minY;


    var characters = [];
    var cells = [];
    var z = 0;
//    for(var z = 0; z < depth; z++) {
      for(var y = 0; y < height; y++) {
        characters[y] = [];
        cells[y] = [];
        for(var x = 0; x < width; x++) {

          if(selection.minY + y >= 0 && selection.minY + y < gridHeight
             && selection.minX + x >= 0 && selection.minX + x < gridWidth) {

//            var cell = layer.getCell({ x: selection.minX + x, y: selection.maxY - y - 1}); 
            var cell = layer.getCell({ x: selection.minX + x, y: selection.minY + y}); 

            characters[y][x] = cell.t;

            cells[y][x] = {};
            for(var key in cell) {
              if(cell.hasOwnProperty(key)) {
                cells[y][x][key] = cell[key];
              }
            }
          }
        }
      }
//    }

    this.editor.currentTile.setCharacters(characters);
    this.editor.currentTile.setCells(cells);
  },
  





  clearAll: function(args) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    


    var history = true;
    if(typeof args != 'undefined' && typeof args.history != 'undefined') {
      history = args.history;
    }

    if(history) {
      this.editor.history.startEntry('Clear');
    }

    var selection = this.selection;

    var args = {};

    args.t = this.editor.tileSetManager.blankCharacter;
    args.bc = this.editor.colorPaletteManager.noColor;
    args.update = false;

    for(args.y = selection.minY; args.y < selection.maxY; args.y++) {
      for(args.x = selection.minX; args.x < selection.maxX; args.x++) {

        layer.setCell(args);
      }
    }

    if(history) {
      this.editor.history.endEntry();
    }

    this.editor.graphic.redraw();

  },

  cut: function(args) {

    this.copy();
    this.clear(args);

  },

  copy: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var selection = this.selection;

    this.data = [];

    var width = selection.maxX - selection.minX;    
    var height = selection.maxY - selection.minY;
    for(var y = 0; y < height; y++) {
      this.data[y] = [];
      for(var x = 0; x < width; x++) {

       if(selection.minY + y >= 0 && selection.minY + y < gridHeight
           && selection.minX + x >= 0 && selection.minX + x < gridWidth) {
          var cell = layer.getCell({ y: selection.minY + y, x: selection.minX + x });

          this.data[y][x] = {};

          for(var key in cell) {
            if(cell.hasOwnProperty(key)) {
              this.data[y][x][key] = cell[key];
            }
          }

        } else {
          // fill in with blank character if selection is out of bounds
          this.data[y][x] = {
            t: this.editor.tileSetManager.blankCharacter,
            fc: 0,
            ry: 0,
            rx: 0,
            rz: 0,
            bc: -1,
            fh: 0,
            fv: 0
          }

          if(layer.getBlockModeEnabled()) {
            this.data[y][x].b = 0;
          }
        }
      }
    }

    this.clipboardToCanvas();
    this.selectionChangedAfterCopy = false;
    this.copiedFromLayer = layer.getId();
    this.copiedFromFrame = layer.getCurrentFrame();
  },

  paste: function(args) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    // check if pasting into a different layer
    if(layer.getId() != this.copiedFromLayer || layer.getCurrentFrame() != this.copiedFromFrame) {
      this.selectionChangedAfterCopy = true;
    }


    // check if want to be able to move paste 
    if(!this.selection.visible || !this.selectionChangedAfterCopy) {
      // no selection active, so allow user to position paste by dragging

      if(!this.selectionChangedAfterCopy) {
        // need to unselect everything if selection hasnt changed
        this.unselectAll();
      }

      // need to set the tool if its not in select mode
      this.editor.tools.drawTools.setDrawTool('select');



      // find where to start the paste  
      var tileSet = layer.getTileSet();// this.editor.tileSetManager.getCurrentTileSet();
      var tileWidth = tileSet.getTileWidth();
      var tileHeight = tileSet.getTileHeight();
    
      this.editor.gridView2d.findViewBounds();
      var bounds = this.editor.graphic.getViewBounds();

      var pasteDragX = Math.floor(bounds.x / tileWidth) + 2;
      var pasteDragY = Math.floor(bounds.y / tileHeight) + 2;

      this.setSelection({
        from: { x:  pasteDragX, y: pasteDragY },
        to: { x:  pasteDragX + this.data[0].length - 1, y: pasteDragY + this.data.length - 1 },
        enabled: true
      });


      this.selectionOffsetX = 0;
      this.selectionOffsetY = 0;

      this.inPasteMove = true;
      this.pasteMoveArgs = args;


//      this.editor.graphic.redraw({ allCells: true });    

      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true });
      UI.captureMouse(this.editor.gridView2d, true);

      return;
    }



    // do the paste
    this.inPasteMove = false;
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();
    var tileSet = layer.getTileSet();

    var hFlip = false;
    var vFlip = false;
    var history = true;

    if(typeof args != 'undefined') {
      if(typeof args.hflip != 'undefined') {
        hFlip = args.hflip;
      }

      if(typeof args.vflip != 'undefined') {
        vFlip = args.vflip;
      }

      if(typeof args.history != 'undefined') {
        history = args.history;
      }

    }

    var pasteWhitespace = true;

    pasteWhitespace = $('#pasteWhitespace').is(':checked');

    var pasteOnWhitespaceOnly = $('#pasteOnWhitespace').is(':checked');

    if(history) {
      this.editor.history.startEntry('Paste');
    }


    var selection = this.selection;

    var pasteRotation = parseInt($('#pasteRotation').val());

    var pasteAtX = selection.minX;
    var pasteAtY = selection.minY;

    if(typeof args != 'undefined') {
      if(typeof args.pasteAtX != 'undefined') {
        pasteAtX = args.pasteAtX;
      }
      if(typeof args.pasteAtY != 'undefined') {
        pasteAtY = args.pasteAtY;
      }
    }

    for(var y = 0; y < this.data.length; y++) {
      for(var x = 0; x < this.data[y].length; x++) {

        var character = this.data[y][x].t;
        var color = this.data[y][x].fc;
        var rotX = this.data[y][x].rx;
        var rotY = this.data[y][x].ry;
        var rotZ = this.data[y][x].rz;
        var bgColor = this.data[y][x].bc;
        var fh = this.data[y][x].fh;
        var fv = this.data[y][x].fv;
        var b = false;
        if(layer.getBlockModeEnabled()) {
          b = this.data[y][x].b;
        }


        if(hFlip) {
          var charX = this.data[y].length - 1 - x;
          character = this.data[y][charX].t;
          character = tileSet.getFlipHChar(character);
          color = this.data[y][charX].fc;
          rotX = this.data[y][charX].rx;
          rotY = this.data[y][charX].ry;
          rotZ = this.data[y][charX].rz;
          bgColor = this.data[y][charX].bc;
          if(layer.getBlockModeEnabled()) {
            b = this.data[y][charX].b;
          }

        }

        if(vFlip) {
          var charY = this.data.length - 1 - y;
          character = this.data[charY][x].t;
          character = tileSet.getFlipVChar(character);
          color = this.data[charY][x].color;
          rotX = this.data[charY][x].rx;
          rotY = this.data[charY][x].ry;
          rotZ = this.data[charY][x].rz;
          bgColor = this.data[charY][x].bc;
          if(layer.getBlockModeEnabled()) {
            b = this.data[charY][x].b;
          }
        }


        var pasteX = x;
        var pasteY = y ;//- this.data.length;



        switch(pasteRotation) {
          case 90:
            rotY += 0.75;
            pasteX = z;
            pasteZ = x;
            break;
          case 180:
            rotY += 0.5;
            pasteX = -x;
            pasteZ = z;
            break;
          case 270:
            rotY += 0.75;
            pasteX = z;
            pasteZ = -x;
            break;

        }

        while(rotY >= 1) {
          rotY -= 1;
        }

        while(rotY < 0) {
          rotY += 1;
        }

        pasteX += pasteAtX;//selection.minX;
//        pasteY += selection.minY + 1;
        pasteY += pasteAtY;//selection.maxY ;


        var args = {};

        if(pasteX >= 0 && pasteY >= 0 &&  pasteX < gridWidth && pasteY < gridHeight) {
          var cellData = layer.getCell({ x: pasteX, y: pasteY });
          var currentTile = cellData.t;


          if(currentTile == this.editor.tileSetManager.blankCharacter || !pasteOnWhitespaceOnly) {

            args.t = character;
            args.x = pasteX;
            args.y = pasteY;
            args.fc = color;
            args.rx = rotX;
            args.ry = rotY;
            args.rz = rotZ;
            args.bc = bgColor;
            args.fh = fh;
            args.fv = fv;

            if(layer.getBlockModeEnabled()) {
              args.b = b;
            }

            args.update = false;

            if(character != this.editor.tileSetManager.blankCharacter || pasteWhitespace || bgColor !== -1) {
              layer.setCell(args);
            }
          }
        }
      }
    }

    if(history) {
      this.editor.history.endEntry();
    }


    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true });

  },


  replaceColors: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.editor.history.startEntry('Replace Colors');
    var selection = this.selection;

    var args = {};

    for(args.y = selection.minY; args.y < selection.maxY; args.y++) {
      for(args.x = selection.minX; args.x < selection.maxX; args.x++) {
        var cell = layer.getCell({x: x, y: y});
        if(cell) {

          args.t = cell.t;
          args.fc = cell.fc;
          args.update = false;

          if(args.fc == this.replaceColor) {
            layer.setCell(args);
          } 
        }
      }
    }
    this.editor.history.endEntry();


    this.editor.graphic.redraw({ allCells: this.editor.graphic.getOnlyViewBoundsDrawn() });

  },




  fill: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.editor.history.startEntry('Fill');
    var selection = this.selection;

    var pasteRotation = parseInt($('#pasteRotation').val());

    var args = {};

    var characters = this.editor.currentTile.getCharacters();
    if(characters.length == 0 || characters[0].length == 0) {
      return;
    }
//    args.c = this.editor.currentTile.character;
    args.fc = this.editor.currentTile.getColor();
    args.bc = this.editor.currentTile.getBGColor();
    args.rz = this.editor.currentTile.rotZ;
    args.fh = this.editor.currentTile.flipH;
    args.fv = this.editor.currentTile.flipV;


    var x = 0;
    var y = selection.maxY - selection.minY - 1;
    for(args.y = selection.minY; args.y < selection.maxY; args.y++) {
      x = 0;
      for(args.x = selection.minX; args.x < selection.maxX; args.x++) {
        var charGridX = x % characters[0].length;
        var charGridY = y % characters.length;
        args.t = characters[charGridY][charGridX];
        layer.setCell(args);
        x++;
      }
      y--;
    }
    this.editor.history.endEntry();
  },



  switchColors: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var selection = this.selection;

    var selectAll = !this.isActive() 
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }


    this.editor.history.startEntry('Switch Colors');


    var args = {};

    for(var y = selection.minY; y < selection.maxY; y++) {
      for(var x = selection.minX; x < selection.maxX; x++) {
        args.x = x;
        args.y = y;

        var cell = layer.getCell({ x: x, y: y });

        if(cell) {
          args.t = cell.t;
          if(cell.bc != this.editor.colorPaletteManager.noColor) {
            args.fc  = cell.bc;
          } else {
            args.fc  = cell.fc;
          }
          
          args.bc  = cell.fc;
          args.update = false;

          layer.setCell(args);
        }
      }
    }

    this.editor.history.endEntry();
    this.editor.graphic.redraw();

    if(selectAll) {
      this.unselectAll();
    }

  },

  invert: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var selection = this.selection;

    var selectAll = !this.isActive() 
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }


    this.editor.history.startEntry('Invert');

    var pasteRotation = parseInt($('#pasteRotation').val());

    var args = {};

    for(var y = selection.minY; y < selection.maxY; y++) {
      for(var x = selection.minX; x < selection.maxX; x++) {
        args.x = x;
        args.y = y;

        var cell = layer.getCell({ x: x, y: y });

        if(cell) {
          args.t = cell.t;
          args.fc  = cell.fc;
          args.bc  = cell.bc;
          args.update = false;

          if(args.t == this.editor.tileSetManager.blankCharacter) {
            //color = this.editor.tools.getCurrentColor();
          }
          if(args.t < 128) {
            args.t += 128;
          } else {
            args.t -= 128;
          }
          layer.setCell(args);
        }
      }
    }

    this.editor.history.endEntry();
    this.editor.graphic.redraw();

    if(selectAll) {
      this.unselectAll();
    }
  },

  flipH: function() {


    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    
    var tileSet = layer.getTileSet();
    tileSet.buildHFlipMap();


    var selection = this.selection;

    var selectAll = !this.isActive()
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }



    var data = [];


    var width = selection.maxX - selection.minX;
    var height = selection.maxY - selection.minY;

    this.editor.history.startEntry('Flip H');

    for(var y = 0; y < height; y++) {
      data[y] = [];
      for(var x = 0; x < width; x++) {
        var cell = layer.getCell({ x: selection.minX + x, y: selection.minY + y}); 

        if(cell) {
          
          data[y][x] = { t: cell.t, 
                          fc: cell.fc, 
                          ry: cell.ry, 
                          rx: cell.rx,
                          rz: cell.rz,
                          fh: cell.fh,
                          fv: cell.fv,
                          bc: cell.bc };
          if(layer.getBlockModeEnabled()) {
            data[y][x].b = cell.b;
          }
        }


      }
    }


    var canUseFlipH = this.editor.graphic.getHasTileFlip()

    var args = {};

    for(var y = 0; y < data.length; y++) {
      for(var x = 0; x < data[y].length; x++) {
        var rotY = data[y][x].rotY;
        args.x = x;
        args.y = -data.length  + y;

        args.x = selection.maxX - x - 1;
        args.y += selection.maxY;

          //var character = this.editor.petscii.getFlipHChar(data[z][y][x].character);

        var t = data[y][x].t;
        if(canUseFlipH) {
          if(data[y][x].fh) {
            args.fh = 0;
          } else {
            args.fh = 1;
          }
        } else {
          t = tileSet.getHFlip(t);
          args.fh = data[y][x].fh;
        }

        args.t = t;
        args.fc = data[y][x].fc;
        args.rx = data[y][x].rx;
        args.ry = data[y][x].ry;
        args.rz = data[y][x].rz;
        args.fv = data[y][x].fv;
        args.bc = data[y][x].bc;
        if(layer.getBlockModeEnabled()) {
          args.b = data[y][x].b;
        }

        args.update = false;

        layer.setCell(args);
      }
    }

    this.editor.history.endEntry();
    this.editor.graphic.redraw();

    if(selectAll) {
      this.unselectAll();
    }
  },

  flipV: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    
    var tileSet = layer.getTileSet();
    tileSet.buildVFlipMap();

    var selection = this.selection;
    var selectAll = !this.isActive()
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }


    var data = [];


    var width = selection.maxX - selection.minX;
    var height = selection.maxY - selection.minY;

    var canUseFlipV = this.editor.graphic.getHasTileFlip();

    this.editor.history.startEntry('Flip H');


    for(var y = 0; y < height; y++) {
      data[y] = [];
      for(var x = 0; x < width; x++) {
        var cell = layer.getCell({ y:selection.minY + y , x:selection.minX + x }); 
        data[y][x] = { t: cell.t, 
                          fc: cell.fc, 
                          ry: cell.ry, 
                          rx: cell.rx,
                          rz: cell.rz,
                          fh: cell.fh,
                          fv: cell.fv,
                          bc: cell.bc };
        if(layer.getBlockModeEnabled()) {
          data[y][x].b = cell.b;
        }

      }
    }



    var args = {};


    for(var y = 0; y < data.length; y++) {
      for(var x = 0; x < data[y].length; x++) {
        var rotY = data[y][x].rotY;
        args.x = x;
        args.y = y;

        args.x += selection.minX;
        args.y = selection.maxY - y - 1;

//          var character = this.editor.petscii.getFlipVChar(data[z][y][x].character);
        var t = data[y][x].t;

        if(canUseFlipV) {
          if(data[y][x].fv) {
            args.fv = 0;
          } else {
            args.fv = 1;
          }
        } else {
          t = tileSet.getVFlip(t);
          args.fv = data[y][x].fv;
        }

        args.t = t;
        args.fc = data[y][x].fc;
        args.rx = data[y][x].rx;
        args.ry = data[y][x].ry;
        args.rz = data[y][x].rz;
        args.bc = data[y][x].bc;
        args.fh = data[y][x].fh;
        if(layer.getBlockModeEnabled()) {
          args.b = data[y][x].b;
        }

        args.update = false;

        layer.setCell(args);
      }
    }

    this.editor.history.endEntry();
    this.editor.graphic.redraw();

    if(selectAll) {
      this.unselectAll();
    }
  },


/*
  // set the selection from the input controls
  setSelectionFromInput: function() {

    var min = { x: 0, y: 0, z: 0 };
    var max = { x: 0, y: 0, z: 0 };

    min.x = parseInt($('#selectX1').val());
    min.y = parseInt($('#selectY1').val());
    min.z = parseInt($('#selectZ1').val());

    if(isNaN(min.x) || isNaN(min.y) || isNaN(min.z)) {
      return;
    }


    max.x = parseInt($('#selectX2').val());
    max.y = parseInt($('#selectY2').val());
    max.z = parseInt($('#selectZ2').val());

    if(isNaN(max.x) || isNaN(max.y) || isNaN(max.z)) {
      return;
    }


    if(this.editor.invertY) {
      var temp = min.y;
      min.y = this.editor.frames.height - max.y - 1;
      max.y = this.editor.frames.height - temp - 1;
    }


    if(max.z > min.z) {
      max.z++;
    }

    if(min.z > max.z) {
      min.z++;
    }

    this.setSelection({ from: min, to: max});

  },
*/


  rotateSelection: function(dx, dy, dz) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    var selection = this.selection;

    var history = true;
    var selectAll = !this.isActive
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }

    var min = { x: 0, y: 0, z: 0 };
    var max = { x: 0, y: 0, z: 0 };

    min.x = selection.minX;
    min.y = selection.minY;

    max.x = selection.maxX;
    max.y = selection.maxY;

    var data = [];
    for(var j = min.y; j < max.y; j++) {
      data.push([]);
      for(var i = min.x; i < max.x; i++) {
        data[j - min.y].push({});
      }
    }

    if(layer.getBlockModeEnabled()) {
      this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockWidth = this.editor.frames.getBlockWidth();
      var blockHeight = this.editor.frames.getBlockHeight();
      if(dx > 0) {
        dx = Math.ceil(dx / blockWidth) * blockWidth;
      } else {
        dx = Math.floor(dx / blockHeight) * blockHeight;
      }

      if(dy > 0) {
        dy = Math.ceil(dy / blockHeight) * blockHeight;
      } else {
        dy = Math.floor(dy / blockHeight) * blockHeight;
      }
    }
 

    for(var j = min.y; j < max.y; j++) {
      data.push([]);
      for(var i = min.x; i < max.x; i++) {
        var copyFromX = i;
        var copyFromY = j;
        var copyFromZ = min.z;

        var copyToX = i + dx;
        var copyToY = j + dy;
        var copyToZ = min.z + dz;

        if(copyToX < selection.minX) {
          copyToX = selection.maxX + (copyToX - selection.minX);
        }

        if(copyToY < selection.minY) {
          copyToY = selection.maxY + (copyToY - selection.minY);
        }

        if(copyToX >= selection.maxX) {
          copyToX = selection.minX + (copyToX - selection.maxX);
        }

        if(copyToY >= selection.maxY) {
          copyToY = selection.minY + (copyToY - selection.maxY);
        }


        var cell = layer.getCell({ x: copyFromX, y: copyFromY }); 

        var x = copyToX - selection.minX;
        var y = copyToY - selection.minY;

        if(cell) {

          data[y][x] = { t: cell.t, 
                        fc: cell.fc, 
                        ry: cell.ry, 
                        rx: cell.rx,
                        rz: cell.rz,
                        fh: cell.fh,
                        fv: cell.fv,
                        bc: cell.bc };
          if(this.editor.frames.getBlockModeEnabled()) {
            data[y][x].b = cell.b;
          }
        } else {
          data[y][x].t = this.editor.tileSetManager.blankCharacter;
        }

      }
    }


    if(history) {
      this.editor.history.startEntry('Paste');
    }


    for(var j = min.y; j < max.y; j++) {
      for(var i = min.x; i < max.x; i++) {
        var args = data[j - min.y][i - min.x];
        args.x = i;
        args.y = j;
        args.z = min.z;
        args.update = false;
        layer.setCell(args);        
      }
    }


    this.editor.graphic.redraw();

    if(history) {
      this.editor.history.endEntry();
    }


    if(selectAll) {
      this.unselectAll();
    }
  },



  nudgeSelection: function(x, y, z, args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }    

    if(layer.getBlockModeEnabled()) {
      this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();
      var blockWidth = layer.getBlockWidth();
      var blockHeight = layer.getBlockHeight();
      x *= blockWidth;
      y *= blockHeight;
    }

    var moveCut = false;
    var moveCopy = false;

    var selection = this.selection;

    var selectAll = !this.isActive()
      || (selection.minX == selection.maxX && selection.minY == selection.maxY);

    if(selectAll) {
      this.selectAll();
    }

    /*
    var moveContent = moveSelectedContent;

    if(typeof moveContent === 'undefined') {
      moveContent = false;
    }
    */

    if(typeof args != 'undefined') {
      if(typeof args.moveCopy != 'undefined') {
        moveCopy = args.moveCopy;
      }
      if(typeof args.moveCut != 'undefined') {
        moveCut = args.moveCut;
      }
    }


    var min = { x: 0, y: 0, z: 0 };
    var max = { x: 0, y: 0, z: 0 };


    min.x = selection.minX + x;
    min.y = selection.minY + y;

    max.x = selection.maxX + x - 1;
    max.y = selection.maxY + y - 1;

    if(moveCut || moveCopy) {
      this.editor.history.startEntry('nudgeSelection');
      this.editor.history.setNewEntryEnabled(false);
      if(moveCut) {
        this.cut();
      }
      if(moveCopy) {
        this.copy();
      }

      this.setSelection({ from: min, to: max, saveInHistory: true } );
      var args = {};
      /*
        pasteAtX: min.x,
        pasteAtY: max.y + 1

      };
      */

      this.paste(args);
      this.editor.history.setNewEntryEnabled(true);
      this.editor.history.endEntry();

      if(moveCopy) {
        // dont really want to invalidate all cells, just the ones from where the selecteion moved from and to
        this.editor.graphic.invalidateAllCells();
      }

    } else {
      this.setSelection({ from: min, to: max, saveInHistory: true});

      // need to redraw the previous selection area (not really all cells)
      this.editor.graphic.redraw({ allCells: true }); 
      
    }

    if(selectAll) {
      this.unselectAll();
    }
  },  


}