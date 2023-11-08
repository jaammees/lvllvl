var BlockEditor = function() {
  this.editor = null;

  this.blockWidth = 2;
  this.blockHeight = 2;

  this.canResizeBlock = false;

  this.tilePaletteDisplay = null;

  this.highlightCharacter = false;
  this.selectedCharacter = false;

  this.tileEditorGrid = null;

  this.callback = null;

  this.currentTool = 'pen';

  this.colorMode = 'none';
  this.c64PixelColor = 'cell';

  this.visible = false;

  this.canvas = null;

  this.blockEditorTilePaletteCanvas = null;
}

BlockEditor.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  initCharInfoCanvas: function() {
    if(this.characterCanvas == null) {
      this.characterCanvas = document.getElementById('blockEditorCharInfoCanvas');
    }
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    this.characterCanvasScale =  Math.floor(UI.devicePixelRatio);
    this.characterCanvas.width = 2 * charWidth * this.characterCanvasScale;
    this.characterCanvas.height = 2 * charHeight * this.characterCanvasScale;
    this.characterCanvas.style.width = 2 * charWidth + 'px';
    this.characterCanvas.style.height = 2 * charHeight + 'px';

    this.characterContext = this.characterCanvas.getContext('2d');
    this.characterImageData = this.characterContext.getImageData(0, 0, this.characterCanvas.width, this.characterCanvas.height);    

  },


  htmlComponentLoaded: function(args) {
    this.htmlComponentsLoaded++;
    if(this.htmlComponentsLoaded == 2) {
      this.initContent(args);      
      this.initEvents();
      this.resizeCharPalette();      
    }
  },

  show: function(args) {
    var _this = this;

    this.htmlComponentsLoaded = 0;

    this.callback = null;
    if(typeof args.callback !== 'undefined') {
      this.callback = args.callback;
    }

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "blockEditor", 
                                                  "title": styles.text.blockName + " Editor", 
                                                  "width": 680,
                                                  "height": 500 });

  //    var blockSplitPanel = UI.create("UI.SplitPanel", { "id": "blockPalette" });


      this.uiComponent.on('close', function(event) {
        _this.visible = false;
      });
      this.uiComponent.on('keydown', function(event) {
        _this.keyDown(event);
      });

      this.uiComponent.on('keyup', function(event) {
        _this.keyUp(event);
      });

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "blockEditorSplitPanel"});
      this.uiComponent.add(this.splitPanel);
      this.uiComponent.on('resize', function() {
        _this.resize();
      });

      var html = '<div id="blockEditorCharPalette" class="panelFill" style="color: white">';
      html += '<div id="blockEditorInfoPanel" style="height: 19px; position: absolute; top: 0; left: 0; right: 0; height: 24px">';
      html += '<canvas style="background-color: rgb(34, 34, 34); border: 1px solid white; width: 16px; height: 16px; cursor: default;" width="32" height="32" id="blockEditorCharInfoCanvas"></canvas>';
      html += '<span id="blockEditorCharInfo" style="display: inline-block; width: 80px; margin-left: 4px;  overflow: hidden; white-space: nowrap; text-overflow: ellipsis"></span>';
      html += '</div>';

      html += '<div id="blockEditorTilePaletteHolder" style="position: absolute; top: 24px; left: 0; right: 0; bottom: 0; overflow: hidden">';
      html += '<canvas  id="blockEditorTilePalette"></canvas>';
      html += '</div>';

      html += '</div>';

      this.blockEditorCharPalette = UI.create("UI.HTMLPanel", { "html": html });
      this.blockEditorCharPalette.on('resize', function() {
        _this.resizeCharPalette();
      });
      this.splitPanel.addSouth(this.blockEditorCharPalette, 174);

      this.blockEditorTools = UI.create("UI.HTMLPanel");
      this.splitPanel.addWest(this.blockEditorTools, 240);
      this.blockEditorTools.load('html/textMode/blockEditorTools.html', function() {

        _this.c64MulticolorTypeControl = new C64MulticolorTypeControl();
        _this.c64MulticolorTypeControl.init(_this.editor, { "elementId": "blockEditorC64PixelColors" })

        _this.htmlComponentLoaded(args);
      });


      this.blockEditor = UI.create("UI.HTMLPanel");
      this.splitPanel.add(this.blockEditor);
      this.blockEditor.load('html/textMode/blockEditor.html', function() {
        _this.htmlComponentLoaded(args);
      });

      this.blockEditor.on('resize', function() {
        //console.log('resize!!!!!!!!!!!!!!!!');
        _this.resize();        
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        if(_this.callback) {
          _this.callback(args, { "data": _this.tileEditorGrid.getCells(), "colorMode": _this.colorMode, "fc": _this.fgColor, "bc": _this.bgColor });
        }
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent(args);
            
    }

    UI.showDialog("blockEditor");
    this.resize();
    this.resizeCharPalette();   
    this.visible = true;


  },


  resizeCharPalette: function() {
    if(this.blockEditorTilePaletteCanvas == null) {
      this.blockEditorTilePaletteCanvas = document.getElementById('blockEditorTilePalette');
    }
    var element = $('#blockEditorTilePaletteHolder');
    this.width = element.width();
    this.height = element.height();

    if(this.width != this.blockEditorTilePaletteCanvas.style.width || this.height != this.blockEditorTilePaletteCanvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.blockEditorTilePaletteCanvas.style.width = this.width + 'px';
        this.blockEditorTilePaletteCanvas.style.height = this.height + 'px';

        this.blockEditorTilePaletteCanvas.width = this.width * UI.devicePixelRatio;
        this.blockEditorTilePaletteCanvas.height = this.height * UI.devicePixelRatio;
      }
    }

    if(this.tilePaletteDisplay != null) {
      this.tilePaletteDisplay.draw();
    }

  },
  resize: function() {
    if(this.canvas == null) {
      this.canvas = document.getElementById('blockEditorBlock');
    }

    var element = $('#blockEditorBlockHolder');

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }


//    console.log(this.left + ',' + this.top + ',' + this.width + ',' + this.height);

    var charsAcross = this.blockWidth;
    var charsDown = this.blockHeight;

    var width = this.width - 20;
    var height = this.height - 20;

    if(charsAcross > charsDown) {
      height = Math.ceil(charsDown * (width / charsAcross));
    }

    if(this.tileEditorGrid != null) {
      this.tileEditorGrid.setSize(width, height);
    }
    
    $('#blockEditorBlock').css('top', '0px');
    $('#blockEditorBlock').css('left', '0px');


  },

  setHighlightCharacter: function(character) {
    this.tilePaletteDisplay.setHighlightCharacter(character);
    this.setCharacterInfo(character);

//        _this.tilePaletteDisplay.setHighlightCharacter(character);
//        _this.tilePaletteDisplay.draw();

  },


  setCharacterInfo: function(character) {
    if(character === false) {
      return;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    var characterHex = ("00" + character.toString(16)).substr(-2);
    var html = '';
    html += character + " (0x" + characterHex + ")";

    $('#blockEditorCharInfo').html(html);


    var scale = 2 * this.characterCanvasScale;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var characterIndex = parseInt(character);
    if(isNaN(characterIndex)) {
      return;
    }

    tileSet.drawCharacter({
      character: characterIndex, 
      x: 0,
      y: 0,
      scale: scale,
      imageData: this.characterImageData,
      colorRGB: 0xdddddd,
      bgColorRGB: 0x111111,
      context: this.characterContext
    })

    if(layer && layer.getMode() != TextModeEditor.Mode.VECTOR) {
      this.characterContext.putImageData(this.characterImageData, 0, 0);
    }
  },

  setBlockDimensions: function(width, height) {
    this.blockWidth = width;
    this.blockHeight = height;

  },



  initContent: function(args) {
    var _this = this;

    if(!this.tileEditorGrid) {
      this.tileEditorGrid = new TileEditorGrid();
      this.tileEditorGrid.drawPixelLines = false;
      this.tileEditorGrid.init(this.editor, { "canvasElementId": "blockEditorBlock", "useCells": true });
      this.tileEditorGrid.setMode('characterEdit');

      this.tileEditorGrid.on('cellselected', function(cell) {
        _this.selectCharacter(cell.t);
      });

      this.tileEditorGrid.on('mouseOverCharacter', function(character) {
        _this.setHighlightCharacter(character);
      });

      this.tileEditorGrid.on('mouseenter', function(event) {
        _this.gridMouseEnter(event);
      });

      this.tileEditorGrid.on('mouseleave', function(event) {
        _this.gridMouseLeave(event);
      });
    }

    if(!this.tilePaletteDisplay) {
      this.tilePaletteDisplay = new TilePaletteDisplay();
      this.tilePaletteDisplay.init(this.editor, { "mode": "single", "canvasElementId": "blockEditorTilePalette" });
      this.tilePaletteDisplay.on('characterselected', function(character) {  

        _this.setHighlightCharacter(character);

        _this.mouseDownCharacter = character;
        _this.selectedCharacter = character;
        _this.tileEditorGrid.setDrawCharacter(_this.selectedCharacter);

      });

      this.tilePaletteDisplay.on('highlightchanged', function(character) {
       if(character !== false) {
          _this.setHighlightCharacter(character);
        }
      });  

      this.tilePaletteDisplay.on('mouseleave', function(event) {
        _this.setHighlightCharacter(_this.selectedCharacter);
      });    

      this.editor.tools.drawTools.pixelDraw.initC64MulticolorControl();

    }

    this.tilePaletteDisplay.draw({ redrawTiles: true });
    var colorPerMode = this.editor.getColorPerMode();
    var blockColorMode = 'none';

    if(colorPerMode == 'character') {
      $('#blockEditorColorOptions').hide();
      $('#blockEditorColorSelection').hide();
      blockColorMode = 'none';
    } else if(colorPerMode == 'block') {
      $('#blockEditorColorOptions').hide();
      $('#blockEditorColorSelection').show();
      blockColorMode = 'perblock';
    } else {
      $('#blockEditorColorOptions').show();
      $('#blockEditorColorSelection').show();
      blockColorMode = $('input[name=blockEditColorSetting]:checked').val();
      if(typeof args != 'undefined' && typeof args.blockData != 'undefined' && typeof args.blockData.colorMode != 'undefined') {
        blockColorMode = args.blockData.colorMode;
      }

    }


    // need to call init in case character set has changed.
    var mapType = this.editor.tools.drawTools.tilePalette.getTilePaletteMapType();
    this.tilePaletteDisplay.initCharPalette({ "mapType": mapType });
    this.tilePaletteDisplay.draw();

    this.canResizeBlock = false;

    var blankCharacter = this.editor.tileSetManager.blankCharacter;

    if(typeof args.blockWidth != 'undefined') {
      this.blockWidth = args.blockWidth;
    }

    if(typeof args.blockHeight != 'undefined') {
      this.blockHeight = args.blockHeight;
    }

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();


    var blockModeEnabled = false;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      blockModeEnabled = layer.getBlockModeEnabled();
    }


    if(blockModeEnabled) {
      this.canResizeBlock = false;
      this.blockWidth = layer.getBlockWidth();
      this.blockHeight = layer.getBlockHeight();
      $("#blockDimensionsStatic").show();
      $("#blockDimensionsEditable").hide();
    } else {
      this.canResizeBlock = true;
      $("#blockDimensionsStatic").hide();
      $("#blockDimensionsEditable").show();      
    }

    $('#blockEditorHeight').val(this.blockHeight);
    $('#blockEditorWidth').val(this.blockWidth);

    $('#blockEditorStaticWidth').html(this.blockWidth);
    $('#blockEditorStaticHeight').html(this.blockHeight);

    if(typeof args.blockData != 'undefined') {
      this.tileEditorGrid.setCells(args.blockData.data);

      fc = args.blockData.fc;
      bc = args.blockData.bc;
      this.blockHeight = args.blockData.data.length;
      this.blockWidth = args.blockData.data[0].length;
    } else {
      var data = [];

      for(var y = 0; y < this.blockHeight; y++) {
        data.push([]);
        for(var x = 0; x < this.blockWidth; x++) {
          data[y].push({t: blankCharacter, fc: fc, bc: bc, fh: 0, fv: 0, rz: 0 });
        }
      }
      this.tileEditorGrid.setCells(data);
    }

    this.colorMode = blockColorMode;
    $('#blockEditColorSetting_' + blockColorMode).prop('checked', true);

    this.setFGColor(fc);
    this.setBGColor(bc);


    var screenMode = this.editor.getScreenMode();
    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR || screenMode == TextModeEditor.Mode.C64STANDARD) {
      $('#blockEditBackgroundColor').hide();
    }

    if(screenMode === TextModeEditor.Mode.TEXTMODE || screenMode === TextModeEditor.Mode.C64ECM) {
      $('#blockEditBackgroundColor').show();
    }

    this.initCharInfoCanvas();
    this.setTool('pen');

    var selected = this.tilePaletteDisplay.getSelectedCharacters();
    if(selected.length == 0) {
      this.selectCharacter(0);
    }


    this.resize();
    

//    this.drawTilePalette();
  },

  initEvents: function(args) {
    var _this = this;


    $('#blockEditForegroundColor').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setFGColor(color);

      }

      args.type = 'cellcolor';

      var x = event.pageX;
      var y = event.pageY;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });


    $('#blockEditBackgroundColor').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setBGColor(color);
      }
      args.c64ECMColorSetCallback = function(index, color) {
        _this.editor.setC64ECMColor(index, color);

        var colorPalette = _this.editor.colorPaletteManager.getCurrentColorPalette();

        $('#blockEditBackgroundColor').html('');      
        $('#blockEditBackgroundColor').css('background-color', '#' + colorPalette.getHexString(color));
        $('#blockEditBackgroundColor').css('background-image', "none");

      // call this to update the color picker color
        //_this.setBGColor(index);
//        _this.editor.currentTile.setBGColor(index, { force: true });
      }

      args.isCellBG = true; 
      args.screenMode = _this.editor.getScreenMode();

      var x = event.pageX;
      var y = event.pageY;
//      args.hasNone = true;


      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });


    $('#blockEditorWidth').on('change', function() {
      var width = parseInt($('#blockEditorWidth').val(), 10);
      if(!isNaN(width)) {
        _this.setBlockWidth(width);
      }
    });

    $('#blockEditorHeight').on('change', function() {
      var height = parseInt($('#blockEditorHeight').val(), 10);
      if(!isNaN(height)) {
        _this.setBlockHeight(height);
      }
    });


    $('.blockEditTool').on('click', function(event) {
      var id = $(this).attr('id');
      var dashPos = id.lastIndexOf('_');
      id = id.substring(dashPos + 1);
      _this.setTool(id, event);
    });

    $('.blockEditTool').on('mouseover', function() {
      var id = $(this).attr('id');
      
      id = id.substring('blockEditTool_'.length);
      var label = _this.getToolLabel(id);

      $('#currentBlockEditTool').html(label);
    });

    $('.blockEditTool').on('mouseleave', function() {
      var label = _this.getToolLabel(_this.currentTool);
      $('#currentBlockEditTool').html(label);
    });


    $('input[name=blockEditColorSetting').on('click', function() {
      var mode = $('input[name=blockEditColorSetting]:checked').val();
      _this.setColorMode(mode);
    });

    $('#blockEditorMulticolorPixelColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.selectColorIndex(color);
        _this.editor.currentTile.setColor(color);
      }
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.editor.currentTile.getColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });

/*
    $('input[name=blockEditorC64Color]').on('click', function() {
      var c64Color = $('input[name=blockEditorC64Color]:checked').val();
      _this.setC64PixelColor(c64Color);
    }); 
*/

  },


  selectColorIndex: function(colorIndex) {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    $('#blockEditorMulticolorPixelColor').css('background-color', '#' + colorPalette.getHexString(colorIndex));

    if(this.tileEditorGrid) {
      this.tileEditorGrid.setColorIndex(colorIndex);
    }
  },



  gridMouseEnter: function(event) {
    this.mouseInGrid = true;
    this.setMouseCursor(event);
  },

  gridMouseLeave: function(event) {
    this.mouseInGrid = false;
    this.setMouseCursor(event);
    UI.setCursor('default');
  },



  setMouseCursor: function(event) {
    if(this.mouseInGrid) {

      if(event.altKey) {
        UI.setCursor('eyedropper');
        return;
      }

      switch(this.currentTool) {
        case 'pen':
          UI.setCursor('draw');
        break;
        case 'erase':
          UI.setCursor('erase');
        break;
        case 'eyedropper':
          UI.setCursor('eyedropper');
        break;
        case 'pixel':
          UI.setCursor('crosshair');
        break;
        case 'select':
          UI.setCursor('select');
        break;
      }
    }

  },

  keyDown: function(event) {

    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toUpperCase();

    switch(c) {
      case keys.textMode.toolsPencil.key:
        this.setTool('pen', event);
      break;
      case keys.textMode.toolsEyedropper.key:
        this.setTool('eyedropper', event);      
      break;
      case keys.textMode.toolsPixel.key:
        this.setTool('pixel', event);      
      break;

    }


    switch(event.keyCode) {

      case keys.textMode.tilePaletteLeft.keyCode:
        if(keys.textMode.tilePaletteLeft.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(-1, 0);
        }
      break;
      case keys.textMode.tilePaletteRight.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(1, 0);
        }
      break;
      case keys.textMode.tilePaletteUp.keyCode:
        if(keys.textMode.tilePaletteRight.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(0, -1);      
        }
      break;
      case keys.textMode.tilePaletteDown.keyCode:
        if(keys.textMode.tilePaletteDown.shift == event.shiftKey) {
          this.tilePaletteDisplay.moveSelection(0, 1);      
        }
      break;
      case keys.textMode.characterRecentNext.keyCode:
        if(keys.textMode.characterRecentNext.shift == event.shiftKey) {
          //this.selectRecent(1);
        }
      break;
      case keys.textMode.characterRecentPrev.keyCode:
        if(keys.textMode.characterRecentPrev.shift == event.shiftKey) {
          //this.selectRecent(-1);
        }
      break;

      case keys.textMode.characterRotate.keyCode: 
        this.rotateCharacter();
      break;

    }

    if(this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
      switch(c) {
        case keys.textMode.c64MultiFG.key:
          this.editor.tools.drawTools.pixelDraw.setC64MultiColorType('cell');
        break;
        case keys.textMode.c64MultiBG.key:
          this.editor.tools.drawTools.pixelDraw.setC64MultiColorType('background');
        break;
        case keys.textMode.c64MultiMC1.key:
          this.editor.tools.drawTools.pixelDraw.setC64MultiColorType('multi1');
        break;
        case keys.textMode.c64MultiMC2.key:
          this.editor.tools.drawTools.pixelDraw.setC64MultiColorType('multi2');
        break;
      }
    }


    this.setMouseCursor(event);

  },


  selectCharacter: function(c) {
    this.tilePaletteDisplay.setSelected([c]);

    if(this.tileEditorGrid) {
      this.tileEditorGrid.setDrawCharacter(c);
    }

  },
  rotateCharacter: function() {
    var c = this.tilePaletteDisplay.drawCharacter;
    if(c === false) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var c = tileSet.getCharNextRotation(c);
    if(c !== false) {
      this.selectCharacter(c);
    }
    this.draw();
  },

  
  keyUp: function(event) {
    this.setMouseCursor(event);

  },


  setFGColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    //        _this.replaceColor = color;

    this.fgColor = color;

    if(this.tileEditorGrid) {
      if(this.colorMode == 'none' || this.colorMode == 'perblock') {
        this.tileEditorGrid.setCellColors(color);
      } 

      this.tileEditorGrid.setDrawColor(color);
    }

//    this.editor.currentTile.setColor(color);

    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {  
      if(color > 8) {
        color = color - 8;
      }
    }
    $('#blockEditForegroundColor').css('background-color', '#' + colorPalette.getHexString(color));

    this.tilePaletteDisplay.draw();

  },

  setBGColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.bgColor = color;

    var drawColor = color;

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer) {
      if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
        drawColor = layer.getC64ECMColor(color);
      }        

      if(layer.getScreenMode() == TextModeEditor.Mode.C64STANDARD) {
        drawColor = this.editor.colorPaletteManager.noColor;
      }
    }


    if(color !== this.editor.colorPaletteManager.noColor) {
      $('#blockEditBackgroundColor').html('');      
      $('#blockEditBackgroundColor').css('background-color', '#' + colorPalette.getHexString(drawColor));
      $('#blockEditBackgroundColor').css('background-image', "none");
    } else {
      $('#blockEditBackgroundColor').css('background-color', '#000000');
      $('#blockEditBackgroundColor').html('<i style="font-size: 28px; margin-top: -1px" class="halflings halflings-remove"></i>');
    }

    if(this.tileEditorGrid) {
      if(this.colorMode == 'none' || this.colorMode == 'perblock') {
        this.tileEditorGrid.setCellBGColors(color);
      } 

      this.tileEditorGrid.setDrawBGColor(color);
    }

  },

  setColorMode: function(mode) {
    this.colorMode = mode;

    if(this.colorMode == 'none' || this.colorMode == 'perblock') {
      if(this.tileEditorGrid) {
        this.tileEditorGrid.setCellColors(this.fgColor);
        this.tileEditorGrid.setCellBGColors(this.bgColor);
      }
    }
  },


  selectC64ColorType: function(colorType, colorIndex) {
    this.c64PixelColor = colorType;
    if(this.tileEditorGrid) {
      this.tileEditorGrid.setC64ColorType(colorType);    
      this.tileEditorGrid.setColorIndex(colorIndex);
    }

  },

  getToolLabel: function(key) {
    var label = key;

    label = this.editor.tools.drawTools.getToolLabel(key);
    return label;
  },


  setBlockWidth: function(width) {
    if(!this.tileEditorGrid) {
      return;
    }

    var cells = this.tileEditorGrid.getCells();
    var newCells = [];
    var blankCharacter = this.editor.tileSetManager.blankCharacter;

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    for(var y = 0; y < cells.length; y++) {
      newCells.push([]);
      for(var x = 0; x < width; x++) {
        var cell = {};
        if(x < cells[y].length) {        
          for(var key in cells[y][x]) {
            if(cells[y][x].hasOwnProperty(key)) {
              cell[key] = cells[y][x][key];
            }
          }
        } else {
          cell = { t: blankCharacter, fc: fc, bc: bc, fh: 0, fv: 0, rz: 0 };
        }

        newCells[y].push(cell);
      }
    }

    this.tileEditorGrid.setCells(newCells);

  },

  setBlockHeight: function(height) {
    if(!this.tileEditorGrid) {
      return;
    }

    var cells = this.tileEditorGrid.getCells();
    var newCells = [];
    var blankCharacter = this.editor.tileSetManager.blankCharacter;

    var fc = this.editor.currentTile.getColor();
    var bc = this.editor.currentTile.getBGColor();

    var width = cells[0].length;

    for(var y = 0; y < height; y++) {
      newCells.push([]);
      for(var x = 0; x < width; x++) {
        if(y < cells.length) {
          var cell = {};
          for(var key in cells[y][x]) {
            if(cells[y][x].hasOwnProperty(key)) {
              cell[key] = cells[y][x][key];
            }
          }          
        } else {
          cell = { t: blankCharacter, fc: fc, bc: bc, fh: 0, fv: 0, rz: 0 };
        }
        newCells[y].push(cell);
      }

    }

    this.tileEditorGrid.setCells(newCells);

  },


  setTool: function(tool, event) {
    this.currentTool = tool;

    $('.blockEditTool').removeClass('blockEditToolSelected');
    $('#blockEditTool_' + tool).addClass('blockEditToolSelected');
    var label = this.getToolLabel(this.currentTool);
    $('#currentBlockEditTool').html(label);

    var screenMode = this.editor.getScreenMode();

    var colorSelectionVisible = false;

    switch(tool) {
      case 'pen':
        this.tileEditorGrid.setMode('characterEdit');
        if(screenMode != TextModeEditor.Mode.INDEXED && screenMode != TextModeEditor.Mode.RGB) {
          colorSelectionVisible = true;
        }
        $('#blockPixelEditColor').hide();
      break;
      case 'eyedropper':
        colorSelectionVisible = true;
        this.tileEditorGrid.setMode('characterEyedropper');
        $('#blockPixelEditColor').hide();
      break;
      case 'pixel':
        colorSelectionVisible = false;
        this.tileEditorGrid.setMode('pixelEdit');      
      break;
    }

    if(screenMode == TextModeEditor.Mode.INDEXED || screenMode == TextModeEditor.Mode.RGB) {
      colorSelectionVisible = false;
    }



    var colorPerMode = this.editor.getColorPerMode();
    var blockColorMode = 'none';

    if(colorPerMode == 'character') {
      colorSelectionVisible = false;
    } 

    if(colorPerMode == 'block') {
      colorSelectionVisible = true;
    }

    if(colorSelectionVisible) {
      $('#blockEditorColorSelection').show();      
    } else {
      $('#blockEditorColorSelection').hide();      
    }

    if(tool == 'pixel') {
      if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
        $('#blockPixelEditColor').hide();
        $('#blockEditorC64PixelColors').show();
        $('#blockPixelEditColor').show();
      } else if(screenMode == TextModeEditor.Mode.INDEXED || screenMode == TextModeEditor.Mode.RGB) {
        $('#blockPixelEditColor').show();
        $('#blockEditorC64PixelColors').hide();
        $('#blockPixelEditColor').show();

      } else {
        $('#blockEditorC64PixelColors').hide();   
        $('#blockPixelEditColor').hide();

      }
    } 

    this.setMouseCursor(event);

  },

  draw: function() {
    this.tileEditorGrid.draw();
  }

}
