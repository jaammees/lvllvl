var PixelDraw = function() {
  this.editor = null;
  this.mode = 'draw';

  this.highlightCell = false;
  this.highlightColor = false;

  this.c64MultiColorType = 'cell';

  this.alteredCharacters = [];
  this.lastX = false;
  this.lastY = false;

  this.toolType = 'draw';
  this.color = 0;

  this.shiftLineDirection = false;

  this.eventsSetup = false;
  this.lastHighlightTile = false;
  this.fillShape = false;

//  this.subPaletteColorIndex = 0;

  this.stack = [];
}

PixelDraw.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function() {
    this.initC64MulticolorControl();
    var label = this.getToolLabel(this.toolType);
    $('#pixelToolLabel').html(label);

    if(!this.eventsSetup) {
      this.initEvents();
      this.eventsSetup = true;
    }
  },

  setFillShape: function(fill) {
    this.fillShape = fill;
  },

  initEvents: function() {
    var _this = this;

    $('.pixelTool').on('mouseover', function() {
      var id = $(this).attr('data-toolType');
      
      var label = _this.getToolLabel(id);
      $('#pixelToolLabel').html(label);
    });

    $('.pixelTool').on('mouseleave', function() {
      var label = _this.getToolLabel(_this.toolType);
      $('#pixelToolLabel').html(label);
    });

    $('.pixelTool').on('click', function(event) {
      var tool = $(this).attr('data-toolType');
      _this.setTool(tool);
    });


    $('.pixelToolSubPaletteColor').on('click', function() {
      var colorIndex = $(this).attr('data-index');
      _this.selectColorSubPaletteColorIndex(colorIndex);
    });

    $('#pixelToolMulticolor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setColor(color);
      }

      if(_this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
        args.mode = TextModeEditor.Mode.C64MULTICOLOR;
      }
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.getColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });


    $('#pixelShapeFill').on('click', function() {
      _this.setFillShape($(this).is(':checked'));

    });

  },

  selectColorSubPaletteColorIndex: function(colorIndex) {
    this.editor.colorPaletteManager.colorSubPalettes.selectPaletteColor(colorIndex); 

//    this.color = colorIndex;
  },

  drawSelectedSubPaletteColor: function() {
    var colorIndex = this.color;
    $('.pixelToolSubPaletteColor').css({"border-width": "1px"});
    $('#pixelToolSettingsSubPaletteColor-' + colorIndex).css({"border-width": "2px"});

  },

  getToolLabel: function(id) {
    var tools = {
      "draw": { label: "Pencil", "key": keys.textMode.toolsPencil.key },
      "pen":  { label: "Pencil", "key": keys.textMode.toolsPencil.key },
      "erase": { label: "Blank", "key": keys.textMode.toolsErase.key },
      "fill": { label: "Fill Bucket", "key": keys.textMode.toolsBucket.key },
      "eyedropper": { label: "Eyedropper", "key": keys.textMode.toolsEyedropper.key },
      "line": { label: "Line", "key": keys.textMode.toolsShape.key },
      "rect": { label: "Rect", "key": keys.textMode.toolsShape.key },
      "oval": { label: "Oval", "key": keys.textMode.toolsShape.key },
      "select": { label: "Marquee", "key": keys.textMode.toolsMarquee.key },
      "charpixel": { label: "Char Pixel", "key": keys.textMode.toolsCharPixel.key },
      "type": { label: "Type", "key": keys.textMode.toolsType.key },
      "pixel": { label: "Pixel", "key": keys.textMode.toolsPixel.key },
      "block": { label: "Block", "key": keys.textMode.toolsBlock.key },
      "zoom": { label: "Zoom", "key": keys.textMode.toolsZoom.key },
      "hand": { label: "Hand", "key": keys.textMode.toolsHand.key },
      "move": { label: "Move", "key": keys.textMode.toolsMove.key }
    };

    if(tools.hasOwnProperty(id)) {
      return tools[id].label + " (Shift + " + tools[id].key + ")";
    }
    return id;

  },

  setTool: function(tool) {
    this.toolType = tool;

    if(this.toolType == 'erase') {
      this.mode = 'erase';
      
      this.setC64MultiColorType('background');
    } else {
      
      this.mode = 'draw';
      if(this.c64MultiColorType == 'background') {
        this.setC64MultiColorType('cell');
      }
    }
    $('.pixelTool').removeClass('pixelToolSelected');
    $('#pixelTool_' + tool).addClass('pixelToolSelected');
  },


  toggleShape: function() {
    switch(this.toolType) {
      case 'line':
        this.setTool('rect');      
      break;
      case 'rect':
        this.setTool('oval');      
      break;
      case 'oval':
        this.setTool('line');      
      break;
      default:
        this.setTool('line');
      break;
    }
  },

  setColor: function(color) {
    this.color = color;
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();    
    var colorHex = '#' + colorPalette.getHexString(color);
    $('#pixelToolMulticolor').css('background-color', colorHex);
    $('#tileEditorMultiColor').css('background-color', colorHex);

    this.editor.currentTile.setColor(color);
  },

  getColor: function() {
    return this.color;
  },

  initC64MulticolorControl: function() {
    
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    
    this.setC64MultiColorType(this.c64MultiColorType);
    layer.setC64Multi1Color(layer.getC64Multi1Color());
    layer.setC64Multi2Color(layer.getC64Multi2Color());
    this.editor.graphic.setBackgroundColor(this.editor.graphic.getBackgroundColor());
    this.editor.currentTile.setColor(this.editor.currentTile.getColor());
  },

  setC64MultiColorType: function(colorType) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    this.c64MultiColorType = colorType;

    $('.tileEditorC64ColorType').removeClass('tileEditorC64ColorTypeSelected');
    $('.tileEditorC64ColorType_' + colorType).addClass('tileEditorC64ColorTypeSelected');


    var colorIndex = 0;
    switch(colorType) {
      case 'cell':
        colorIndex = this.editor.currentTile.getColor();
      break;
      case 'background':
        colorIndex = this.editor.graphic.getBackgroundColor();
      break;
      case 'multi1':
        colorIndex = layer.getC64Multi1Color();
      break;
      case 'multi2':
        colorIndex = layer.getC64Multi2Color();
      break;
    }

    if(colorType != 'background' && this.mode == 'erase') {
      this.setTool('draw');
    }

    if(this.editor.tileEditor) {
      this.editor.tileEditor.selectC64ColorType(colorType, colorIndex);
    }

    if(this.editor.tileEditorMobile) {
      this.editor.tileEditorMobile.selectC64ColorType(colorType, colorIndex);      
    }


    if(this.editor.tools.drawTools.blockPalette && this.editor.blockEditor) {
      this.editor.blockEditor.selectC64ColorType(colorType, colorIndex);
    }
  },


  keyDown: function(event) {
    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toUpperCase();


    if(event.shiftKey) {
      switch(c) {
        case keys.textMode.toolsPencil.key:
          this.setTool('draw');
        break;
        case keys.textMode.toolsErase.key:
          this.setTool('erase');
        break;
        /*
        case keys.textMode.toolsBucket.key:
          this.setTool('fill');
        break;
        */
        case keys.textMode.toolsEyedropper.key:
          this.setTool('eyedropper');      
        break;
        case keys.textMode.toolsMarquee.key:
          this.setTool('select');      
        break;
        case keys.textMode.toolsShape.key:
          this.toggleShape();      
        break;
      }
    }

  },


  addToAlteredCharacters: function(c) {
    if(this.alteredCharacters.indexOf(c) !== -1) {
      return;
    }
    this.alteredCharacters.push(c);

  },

  resetAlteredCharacters: function() {
    this.alteredCharacters = [];

  },

  startShape: function() {
    // need to make a copy of the character set.
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();    
    this.characterDataCopy = tileSet.getCharacterDataCopy();
    this.resetAlteredCharacters();

  },

  endShape: function() {
    // get rid of copy of character set

  },

  updateShape: function(gridView, pixel) {
    // set changed characters from saved character set
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();    
    tileSet.restoreCharacterDataFor(this.characterDataCopy, this.alteredCharacters);

    for(var i = 0; i < this.alteredCharacters.length; i++) {
      tileSet.updateCharacterCurrentData(this.alteredCharacters[i]);
    }


    this.resetAlteredCharacters();

    if(this.toolType == 'line') {
      this.drawLine(gridView, this.mouseDownAtX, this.mouseDownAtY, pixel.x, pixel.y);
    } else if(this.toolType == 'rect') {
      this.drawRect(gridView, this.mouseDownAtX, this.mouseDownAtY, pixel.x, pixel.y);
    } else if(this.toolType == 'oval') {
      this.drawOval(gridView, this.mouseDownAtX, this.mouseDownAtY, pixel.x, pixel.y);    
    }
  },

  drawPixelTextmode: function(cell) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    var tile = layer.getTile(cell);

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var screenMode = this.editor.getScreenMode();
    if(screenMode == TextModeEditor.Mode.NES) {
      if(this.toolType == 'eyedropper') {
        var colorIndex = tileSet.getPixel(tile, cell.pixelX, cell.pixelY);      
        this.selectColorSubPaletteColorIndex(colorIndex);
  
      } else {
          
        if(this.mode == 'erase') {
          tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);
        } else {
          tileSet.setPixel(tile, cell.pixelX, cell.pixelY, this.color, false);
        }
      }
    } else if(screenMode == TextModeEditor.Mode.INDEXED) {
      if(this.mode == 'erase') {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);
      } else {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, this.color, false);
      }
    } else if(screenMode == TextModeEditor.Mode.RGB) {
      if(this.mode == 'erase') {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);
      } else {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, this.color, false);
      }
    } else {
      if(this.mode == 'draw') {
        if(this.editor.graphic.getType() == 'sprite') {
          switch(this.editor.tools.drawTools.pixelDraw.c64MultiColorType) {
            case 'background':
              tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);
              break;
            default:
              tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 1, false);
              break;
          }
        } else {

          tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 1, false);
        }
      } else if(this.mode == 'erase') {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);      
      }
    }
  },


  drawPixelC64Multicolor: function(cell) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    var cellData = layer.getCell(cell);
    var tile = cellData.t;
    var color = cellData.fc;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(color >= 8 || this.editor.graphic.getType() == 'sprite') {
      //pixelWidth = 2;
      var pixelX = Math.floor(cell.pixelX/2) * 2;

      // order is different for sprites to chars

      if(this.editor.graphic.getType() == 'sprite') {
        switch(this.editor.tools.drawTools.pixelDraw.c64MultiColorType) {
          case 'background':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 0, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 0, false);
          break;
          case 'multi1':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 0, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 1, false);
          break;
          case 'multi2':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 1, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 1, false);
          break;
          default:
          case 'cell':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 1, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 0, false);
          break;
        }
      } else {
        switch(this.editor.tools.drawTools.pixelDraw.c64MultiColorType) {
          case 'background':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 0, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 0, false);
          break;
          case 'multi1':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 0, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 1, false);
          break;
          case 'multi2':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 1, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 0, false);
          break;
          default:
          case 'cell':
            tileSet.setPixel(tile, pixelX, cell.pixelY, 1, false);
            tileSet.setPixel(tile, pixelX + 1, cell.pixelY, 1, false);
          break;
        }
      }
    } else {
      if(this.mode == 'draw') {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 1, false);
      } else if(this.mode == 'erase') {
        tileSet.setPixel(tile, cell.pixelX, cell.pixelY, 0, false);      
      }
    }
  },


  isValidPixel: function(tileSet, x, y)  {
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    if(x >= 0 && x < tileWidth && y >= 0 && y < tileHeight) {
      return true;
    }

    return false;
  },



  stackPush: function(pixel) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(!this.isValidPixel(tileSet, pixel.x, pixel.y)){
      return;
    }
    /*
    if(cell.x < 0 || cell.x >= this.gridWidth
      || cell.y < 0 || cell.y >= this.gridHeight) {
      return;
    }
    */

    for(var i = 0; i < this.stack.length; i++) {
      if(this.stack[i].x == pixel.x && this.stack[i].y == pixel.y) {
        return;
      }
    }
    this.stack.push(pixel);

  },

  stackPop: function() {
    var pixel = this.stack[this.stack.length - 1];
    this.stack = this.stack.slice(0, -1);    
    return pixel;
  },


  fill: function(gridView, pixel) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    var screenMode = layer.getScreenMode();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    var cell = {
      x: Math.floor(pixel.x / tileWidth),
      y: Math.floor(pixel.y / tileHeight)
    }

    cell.pixelX = pixel.x % tileWidth;
//    cell.pixelY = (tileHeight - 1) -  pixel.y % tileHeight;
    cell.pixelY = pixel.y % tileHeight;

    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      // pixel x should be divisible by 2
      cell.pixelX = Math.floor(cell.pixelX / 2) * 2;
    }


    var x = cell.pixelX;
    var y = cell.pixelY;

    var tile = layer.getTile(cell);


    var target = tileSet.getPixel(tile, x, y);
    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      target = (target << 1) + tileSet.getPixel(tile, x + 1, y);
    }



    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    var replacement = 1;
    if(screenMode == TextModeEditor.Mode.INDEXED || screenMode == TextModeEditor.RGB) {
      replacement = fc;
    }


    // If target-color is equal to replacement-color, return.
    if(target == replacement) {
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

      while(this.isValidPixel(tileSet, w.x, w.y)) {
        var testPixel = tileSet.getPixel(tile, w.x, w.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          testPixel = (testPixel << 1) + tileSet.getPixel(tile, w.x + 1, w.y);
        }

        if(testPixel != target) {
          break;
        }

        tileSet.setPixel(tile, w.x, w.y, replacement, false)


//         If the color of the node to the north of n is target-color, add that node to Q.
        var north = { x: w.x, y: w.y + 1 };
        var northValue = tileSet.getPixel(tile, north.x, north.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          northValue = (northValue << 1) + tileSet.getPixel(tile, north.x + 1, north.y);
        }
        if(this.isValidPixel(tileSet, north.x, north.y) && northValue === target) {
          this.stackPush(north);
        }
//         If the color of the node to the south of n is target-color, add that node to Q.        
        var south = { x: w.x, y: w.y - 1 };
        var southValue = tileSet.getPixel(tile, south.x, south.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          southValue = (southValue << 1) + tileSet.getPixel(tile, south.x + 1, south.y);
        }
        if(this.isValidPixel(tileSet, south.x, south.y) && southValue === target) {
          this.stackPush(south);
        }
        w.x--;
      }
      w.x++;

//     Move e to the east until the color of the node to the east of e no longer matches target-color.
      e.x++;
      while(this.isValidPixel(tileSet, e.x, e.y)) {
        var testPixel = tileSet.getPixel(tile, e.x, e.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          testPixel = (testPixel << 1) + tileSet.getPixel(tile, e.x + 1, e.y);
        }

        if(testPixel != target) {
          break;
        }
  
        tileSet.setPixel(tile, e.x, e.y, replacement, false);

//         If the color of the node to the north of n is target-color, add that node to Q.
        var north = { x: e.x, y: e.y + 1 };
        var northValue =  tileSet.getPixel(tile, north.x, north.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          northValue =  tileSet.getPixel(tile, north.x + 1, north.y);
        }
        if(this.isValidPixel(tileSet, north.x, north.y) && northValue === target) {
          this.stackPush(north);
        }
//         If the color of the node to the south of n is target-color, add that node to Q.        
        var south = { x: e.x, y: e.y - 1 };
        var southValue = tileSet.getPixel(tile, south.x, south.y);
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          southValue = tileSet.getPixel(tile, south.x + 1, south.y);
        }

        if(this.isValidPixel(tileSet, south.x, south.y) && southValue === target) {
          this.stackPush(south);
        }

        e.x++;
        if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
          e.x++;
        }

      }
      e.x--;
      if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
        e.x--;
      }
    }

    tileSet.updateCharacterCurrentData(tile);
    this.editor.graphic.redraw({ allCells: true });
  },


  drawPixel: function(gridView, pixel) {
    console.log('draw pixel');
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileSet = layer.getTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    var cell = {
      x: Math.floor(pixel.x / tileWidth),
      y: Math.floor(pixel.y / tileHeight)
    }

    cell.pixelX = pixel.x % tileWidth;
    cell.pixelY = pixel.y % tileHeight;

    var tile = layer.getTile(cell);

    // if the selection is active, only draw if in selection
    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();

    if(selectionActive) {
      var selection = pixelSelect.getSelection();
      if(pixel.x < selection.minX || pixel.x >= selection.maxX) {
        return;
      }
      if(pixel.y < selection.minY || pixel.y >= selection.maxY) {
        return;
      }
    }    

    if(tile !== false) {
      // modify cell.pixelX/Y if tile is flipped or rotated
      if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
        this.adjustForOrientation(cell);
      }

      // mark tile as altered
      this.addToAlteredCharacters(tile);
      
      // should only do this if need to update..
      if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
        this.drawPixelC64Multicolor(cell);    
      } else {
        this.drawPixelTextmode(cell);
      }

      tileSet.updateCharacter(tile);

      this.editor.graphic.invalidateAllCells();

      this.editor.graphic.redraw();



      if(this.editor.tileEditor.visible) {
        this.editor.tileEditor.draw();
      }

      if(this.editor.animationPreview.getVisible()) {
        this.editor.animationPreview.draw();
      }

    }


    
  },



  drawRect: function(gridView, fromX, fromY, toX, toY) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
  
    if(fromX == toX && fromY == toY) {
      return;
    }

    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    if(fromX > toX) {
      var temp = toX;
      toX = fromX;
      fromX = temp;
    }

    if(fromY > toY) {
      var temp = toY;
      toY = fromY;
      fromY = temp;
    }

    var cell = {};
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();


    for(var x = fromX; x <= toX; x++) {
      for(var y = fromY; y <= toY; y++) {
        var drawPixel = (y === fromY) || (y === toY) || (x === fromX) || (x === toX) || this.fillShape;
        if(drawPixel) {

          var cell = {
            x: Math.floor(x / tileWidth),
            y: Math.floor(y / tileHeight)
          }


          cell.pixelX = x % tileWidth;
// reverseY          cell.pixelY = (tileHeight - 1) -  y % tileHeight;
          cell.pixelY = y % tileHeight;

          var canDraw = true;
          if(selectionActive) {
            var selection = pixelSelect.getSelection();
            if(x < selection.minX || x >= selection.maxX) {
              canDraw = false;
            }
            if(y < selection.minY || y >= selection.maxY) {
              canDraw = false;
            }
          }

          if(canDraw && cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {


            var tile = layer.getTile(cell);

            if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
              this.adjustForOrientation(cell);
            }

            this.addToAlteredCharacters(tile);

            if(cell) {
              // should only do this if need to update..
              if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
                this.drawPixelC64Multicolor(cell);    
              } else {
                this.drawPixelTextmode(cell);
              }
            }
          }
        }
      }
    }

    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw();
    

    if(this.editor.tileEditor.visible) {
      this.editor.tileEditor.draw();
    }

    if(this.editor.animationPreview.getVisible()) {
      this.editor.animationPreview.draw();
    }


  },


  drawOval: function(gridView, fromX, fromY, toX, toY) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    if(fromX == toX && fromY == toY) {
      return;
    }

    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    if(fromX > toX) {
      var temp = toX;
      toX = fromX;
      fromX = temp;
    }

    if(fromY > toY) {
      var temp = toY;
      toY = fromY;
      fromY = temp;
    }

    var centerY = fromY + (toY - fromY) / 2;
    var centerX = fromX + (toX - fromX) / 2;

    var width = toX - fromX;
    var height = toY - fromY;

    var widthScale = 1;
    var heightScale = 1;

    if(width > height) {

      heightScale = height / width;
      radius = width / 2;
    } else {
      widthScale = width / height;
      radius = height / 2;
    }


    var cell = {};
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

//    cell.z = this.editor.grid.getXYGridPosition();
    var rows = [];
    var segments = 300;
    var angle = 0;
    for(var i = 0; i < segments; i++) {
      angle = (2 * Math.PI) * i / segments;

      var x = Math.round(centerX + widthScale * radius * Math.cos(angle));
      var y = Math.round(centerY + heightScale * radius * Math.sin(angle));


      var found = false;
      for(var j = 0; j < rows.length; j++) {
        if(rows[j].y === y) {
          found = true;
          if(rows[j].x1 !== x) {
            rows[j].x2 = x;
          }
          break;
        }
      }

      if(!found) {
        rows.push({ y: y, x1: x, x2: false });
      }


      var cell = {
        x: Math.floor(x / tileWidth),
        y: Math.floor(y / tileHeight)
      }

      cell.pixelX = x % tileWidth;
//  reverseY      cell.pixelY = (tileHeight - 1) -  y % tileHeight;
      cell.pixelY = y % tileHeight;

      var canDraw = true;
      if(selectionActive) {
        var selection = pixelSelect.getSelection();
        if(x < selection.minX || x >= selection.maxX) {
          canDraw = false;
        }
        if(y < selection.minY || y >= selection.maxY) {
          canDraw = false;
        }
      }

      if(canDraw && cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {

        var tile = layer.getTile(cell);

        if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
          this.adjustForOrientation(cell);
        }


        this.addToAlteredCharacters(tile);

        if(cell) {
          // should only do this if need to update..
          if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
            this.drawPixelC64Multicolor(cell);    
          } else {
            this.drawPixelTextmode(cell);
          }
        }
      }
    }

    if(this.fillShape) {
      for(var j = 0; j < rows.length; j++) {
        var fromX = rows[j].x1;
        var toX = rows[j].x2;
        if(toX !== false) {
          if(fromX > toX) {
            var temp = toX;
            toX = fromX;
            fromX = temp;      
          }

          y = rows[j].y;
          for(var x = fromX + 1; x < toX; x++) {

            var cell = {
              x: Math.floor(x / tileWidth),
              y: Math.floor(y / tileHeight)
            }

            cell.pixelX = x % tileWidth;
//            cell.pixelY = (tileHeight - 1) -  y % tileHeight; 
            cell.pixelY = y % tileHeight;

            var canDraw = true;
            if(selectionActive) {
              var selection = pixelSelect.getSelection();
              if(x < selection.minX || x >= selection.maxX) {
                canDraw = false;
              }
              if(y < selection.minY || y >= selection.maxY) {
                canDraw = false;
              }
            }

            if(canDraw && cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {

              var tile = layer.getTile(cell);
              if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
                this.adjustForOrientation(cell);
              }
      
              this.addToAlteredCharacters(tile);

              if(cell) {
                // should only do this if need to update..
                if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
                  this.drawPixelC64Multicolor(cell);    
                } else {
                  this.drawPixelTextmode(cell);
                }
              }
            }



          }
        }
      }

    }
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw();


    if(this.editor.tileEditor.visible) {
      this.editor.tileEditor.draw();
    }

    if(this.editor.animationPreview.getVisible()) {
      this.editor.animationPreview.draw();
    }

    
  },

  adjustForOrientation: function(cell) {
    var layer = this.editor.layers.getSelectedLayerObject();

    var cellHeight = layer.getCellHeight();
    var cellWidth = layer.getCellWidth();

    // check the tile orientation
    var cellData = layer.getCell(cell);
    if(cellData.fh) {
      cell.pixelX = cellWidth - 1 - cell.pixelX;
    }
    if(cellData.fv) {
      cell.pixelY = cellHeight - 1 - cell.pixelY;
    }
    if(cellData.rz) {
      var pixelX = cell.pixelX;
      var pixelY = cell.pixelY;

      if(cellData.rz == 1) {

        cell.pixelX =  pixelY;
        cell.pixelY = cellWidth - 1 - pixelX;
      }

      if(cellData.rz == 2) {

        cell.pixelX = cellWidth - 1 - pixelX;
        cell.pixelY = cellHeight - 1 - pixelY;
      }    
      
      if(cellData.rz == 3) {
        cell.pixelX =  cellHeight - 1 - pixelY;
        cell.pixelY = pixelX;
      }           
    }


  },
  drawLine: function(gridView, fromX, fromY, toX, toY) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    if(fromX == toX && fromY == toY) {
      return;
    }

    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();


    // from x and y are already set
    var alreadySetX = fromX;
    var alreadySetY = fromY;

    var deltaX = toX - fromX;
    if(deltaX < 0) {
      deltaX = -deltaX; 
    }

    var deltaY = toY - fromY;
    if(deltaY < 0) {
      deltaY = -deltaY;
    }

    var cell = {};
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    if(deltaX > deltaY) {

      if(fromX > toX) {
        var temp = toX;
        toX = fromX;
        fromX = temp;

        temp = toY;
        toY = fromY;
        fromY = temp;
      }


      for(var x = fromX; x <= toX; x++) {
        var y = Math.round(fromY + (toY - fromY) * (x - fromX) / (toX - fromX));   

        var cell = {
          x: Math.floor(x / tileWidth),
          y: Math.floor(y / tileHeight)
        }

        var canDraw = true;


        if(selectionActive) {
          var selection = pixelSelect.getSelection();
          if(x < selection.minX || x >= selection.maxX) {
            canDraw = false;
          }
          if(y < selection.minY || y >= selection.maxY) {
            canDraw = false;
          }
        }
        
        cell.pixelX = x % tileWidth;
// reverseY        cell.pixelY = (tileHeight - 1) -  y % tileHeight;
        cell.pixelY = y % tileHeight;

        if(canDraw && cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {

          var tile = layer.getTile(cell);
          if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
            this.adjustForOrientation(cell);
          }
      
          this.addToAlteredCharacters(tile);

          
          if(cell) {
            // should only do this if need to update..
            if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
              this.drawPixelC64Multicolor(cell);    
            } else {
              this.drawPixelTextmode(cell);
            }
          }
        }
      }
    } else {

      if(fromY > toY) {
        var temp = toY;
        toY = fromY;
        fromY = temp;

        temp = toX;
        toX = fromX;
        fromX = temp;

      }

      for(var y = fromY; y <= toY; y++) {
        var x = Math.round(fromX + (toX - fromX) * (y - fromY) / (toY - fromY));

        var cell = {
          x: Math.floor(x / tileWidth),
          y: Math.floor(y / tileHeight)
        }

        cell.pixelX = x % tileWidth;
// reverseY        cell.pixelY = (tileHeight - 1) -  y % tileHeight;
        cell.pixelY = y % tileHeight;
        var canDraw = true;

        if(selectionActive) {
          var selection = pixelSelect.getSelection();
          if(x < selection.minX || x >= selection.maxX) {
            canDraw = false;
          }
          if(y < selection.minY || y >= selection.maxY) {
            canDraw = false;
          }

        }


        if(canDraw && cell.x >= 0 && cell.x < gridWidth && cell.y >= 0 && cell.y < gridHeight) {

          var tile = layer.getTile(cell);

          if(this.editor.graphic.getHasTileFlip() || this.editor.graphic.getHasTileRotate()) {
            this.adjustForOrientation(cell);
          }

          this.addToAlteredCharacters(tile);
          if(cell) {
            // should only do this if need to update..
            if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
              this.drawPixelC64Multicolor(cell, x, y);    
            } else {
              this.drawPixelTextmode(cell, x, y);
            }
          }
        }

      }
    }

    for(var i = 0; i < this.alteredCharacters.length; i++) {
//      tileSet.updateCharacter(this.alteredCharacters[i]);
    }
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw();
  

    if(this.editor.tileEditor.visible) {
      this.editor.tileEditor.draw();
    }

    if(this.editor.animationPreview.getVisible()) {
      this.editor.animationPreview.draw();
    }
  },

  rotate: function() {
    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();
    if(!selectionActive) {
      pixelSelect.selectAll();
    } else {

    }
    pixelSelect.cut();
    pixelSelect.paste({ rotate: true, allowMove: false });

    if(!selectionActive) {
      pixelSelect.unselectAll();
    }
  },

  invert: function() {
    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();
    if(!selectionActive) {
      pixelSelect.selectAll();
    } else {

    }
    pixelSelect.cut();
    pixelSelect.paste({ invert: true, allowMove: false });

    if(!selectionActive) {
      pixelSelect.unselectAll();
    }
  },



  flipH: function() {
    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();
    if(!selectionActive) {
      pixelSelect.selectAll();
    } else {

    }
    pixelSelect.cut();
    pixelSelect.paste({ hflip: true, allowMove: false });

    if(!selectionActive) {
      pixelSelect.unselectAll();
    }

  },

  flipV: function() {
    var pixelSelect = this.editor.tools.drawTools.pixelSelect;
    var selectionActive = pixelSelect.isActive();
    if(!selectionActive) {
      pixelSelect.selectAll();
    } else {

    }
    pixelSelect.cut();
    pixelSelect.paste({ vflip: true, allowMove: false });

    if(!selectionActive) {
      pixelSelect.unselectAll();
    }
  },
  setLastCursorPixelLocation: function(args) {
    this.lastX = args.x;
    this.lastY = args.y;
    this.lastZ = args.z;
  },


  // start pixel draw
  mouseDown: function(gridView, event, x, y) {

    // location in tile
    var pixel = gridView.xyToPixel(x, y);
        
    // need to store which characters have been altered
    this.resetAlteredCharacters();
    
    if(this.toolType == 'line' || this.toolType == 'rect' || this.toolType == 'oval') {
      this.startShape();
    }
    
    this.editor.history.startEntry('draw pixel');
    this.editor.history.addAction('cursorPixelLocation', { x: this.lastX, y: this.lastY, z: pixel.z });

    this.shiftLineDirection = false;

    if(this.toolType == 'fill') {
      this.fill(gridView, pixel);
    } else {

      // if shift held down, draw a line, otherwise draw pixel
      if(typeof event != 'undefined' && typeof event.shiftKey != 'undefined' && event.shiftKey
        && this.lastX !== false && this.lastY !== false
        ) {
        this.drawLine(gridView, this.lastX, this.lastY, pixel.x, pixel.y);
      } else {
        this.drawPixel(gridView, pixel);
      }
    }

    this.lastX = pixel.x;
    this.lastY = pixel.y;
//    this.lastZ = pixel.z;

    this.mouseDownAtX = pixel.x;
    this.mouseDownAtY = pixel.y;

    this.editor.currentTile.canvasDrawCharacters();
  },

  mouseMove: function(gridView, event, x, y) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }
    var screenMode = layer.getScreenMode();

    this.highlightCell = gridView.xyToCell(x, y, true);

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    var cellData = false;
    var fh = false;
    var fv = false;
    var rz = false;

    if(this.highlightCell !== false) {
      cellData = layer.getCell(this.highlightCell);
      fh = cellData.fh;
      fv = cellData.fv;
      rz = cellData.rz;
    }

    if(cellData !== false && !g_app.isMobile()) {
      if(this.lastHighlightTile !== cellData.t) {
        this.lastHighlightTile = cellData.t;

        if(!this.editor.tileEditor.getVisible()) {
          // want to set tiles without selecting them
          this.editor.currentTile.setTiles([[cellData.t]]);

          var drawTools = this.editor.tools.drawTools;
          if(drawTools.tilePalette) {
            this.editor.tools.drawTools.tilePalette.setHighlightCharacter(cellData.t);
            this.editor.tools.drawTools.tilePalette.drawTilePalette();

            this.editor.sideTilePalette.setHighlightCharacter(cellData.t);
            this.editor.sideTilePalette.drawTilePalette();
          }          
        }
      }
    }


    if(cellData === false) {
//      return;
    }
    var pixel = gridView.xyToPixel(x, y);
    if(this.editor.graphic.getType() == 'sprite') {
      var tileId = 0;
      var fc = 0;
      var bc = 0;
      this.editor.gridInfo.setSpriteInfo(pixel.x, pixel.y, 0, tileId, fc, bc);
    } 

    if(gridView.buttons & UI.LEFTMOUSEBUTTON && !gridView.leftMouseUp) {

      var fromX = this.lastX;
      var fromY = this.lastY;
      var toX = pixel.x;
      var toY = pixel.y;
      

      if(typeof event != 'undefined' && typeof event.shiftKey != 'undefined' && event.shiftKey) {
        // drawing a line

        if(this.shiftLineDirection === false) {
          var diffX = this.mouseDownAtX - pixel.x;
          if(diffX < 0) {
            diffX = -diffX;
          }
          var diffY = this.mouseDownAtY - pixel.y;
          if(diffY < 0) {
            diffY = -diffY;
          }

          if(diffX > diffY) {
            this.shiftLineDirection = 'horizontal';
          } else if(diffY > diffX) {
            this.shiftLineDirection = 'vertical';
          }
        }


        if(this.shiftLineDirection == 'vertical') {
          fromX = this.mouseDownAtX;
          toX = this.mouseDownAtX;
        } else {
          fromY = this.mouseDownAtY;
          toY = this.mouseDownAtY;
        }

      }

      if(this.toolType == 'line' || this.toolType == 'rect' || this.toolType == 'oval') {
        this.updateShape(gridView, pixel);
      } else {
        this.drawLine(gridView, fromX, fromY, toX, toY);
        this.lastX = pixel.x;
        this.lastY = pixel.y;
      }

      this.editor.currentTile.canvasDrawCharacters();
    } else {
      if(this.highlightCell === false || cellData === false) {
        return;
      }

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();


      var character = cellData.t;
      var color = cellData.fc;

      if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        switch(this.c64MultiColorType) {
          case 'cell':
            this.highlightColor = color;
            if(this.editor.graphic.getType() !== 'sprite') {
              if(color >= 8) {
                this.highlightColor -= 8;
              }
            }
            break;
          case 'background':
            this.highlightColor = this.editor.graphic.getBackgroundColor();
            break;
          case 'multi1':
            this.highlightColor = layer.getC64Multi1Color();
            break;
          case 'multi2':
            this.highlightColor = layer.getC64Multi2Color();
            break;
        } 

      } else if(screenMode == TextModeEditor.Mode.INDEXED) {
        this.highlightColor = this.color;
      } else if(screenMode == TextModeEditor.Mode.RGB) {
        this.highlightColor = this.color;
      } else if(tileSet.getPixel(character, this.highlightCell.pixelX, this.highlightCell.pixelY) == 0) {
        var color = cellData.fc;
        this.highlightColor = color;
      } else {
        this.highlightColor = cellData.bc;
//        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
        if(this.highlightColor == this.editor.colorPaletteManager.noColor) {
          this.highlightColor = this.editor.graphic.getBackgroundColor();
        }
      }
    }
  },

  mouseUp: function(gridView, event) {//}, x, y) {

    // does the grid need redrawing?
    if(this.editor.graphic.getOnlyViewBoundsDrawn() ) {
      // update the whole grid..
      this.editor.graphic.redraw({ allCells: true });
    } 


// only update changed tiles....
    this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true, tiles: this.alteredCharacters });
    this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true, tiles: this.alteredCharacters });
    this.resetAlteredCharacters();

//    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

/*
    for(var i = 0; i < this.alteredCharacters.length; i++) {
      tileSet.updateCharacter(this.alteredCharacters[i]);
    }
*/

  }


}
