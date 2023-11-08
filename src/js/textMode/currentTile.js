var CurrentTile = function() {
  this.camera = null;
  this.scene = null;

  this.type = '';
  this.scale = 1;


  this.character = false;
  this.characters = [];
  this.characterSelected = [];
  this.blockId = false;

  this.color = 1;
  this.bgColor = false;
  this.rotX = 0;
  this.rotY = 0;
  this.rotZ = 0;

  this.canvas = null;
  this.context = null;

  this.tilePaletteCanvas = null;
  this.tilePaletteContext = null;

  this.tileSettingsTileCanvas = null;
  this.tileSettingsTileContext = null;

  this.cursorCanvas = null;
  this.cursorContext = null;

  this.recentCharacters = [];
  this.recentColors = [];

  this.characterMesh = null;
  this.tileMaterial = null;
  this.tileBGMaterial = null;
  this.tilePaletteChooserMobile = null;

  // use cells to draw instead of character
  this.useCells = false;

  this.flipH = false;
  this.flipV = false;

  this.mobileCanvasEventsInit = false;  
  this.desktopCanvasEventsInit = false;

  this.tileMaterialsCanvas = null;

  this.tileMaterials = null;

  this.cursorImageData = null;

  this.backgroundColor3d = new THREE.Color( 0.1, 0.1, 0.1 );

}


CurrentTile.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.init3d();
  },

  init3d: function() {

    this.noBGMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0});
    this.tileBGMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff });

    this.scene = new THREE.Scene();  

    var width = 150;
    var height = 150;
    var fov = 55;

    this.camera = new THREE.PerspectiveCamera( fov, width / height, 1, 10000 );

    this.camera.position.x = 1;
    this.camera.position.y = 1;
    this.camera.position.z = 4;

    this.axisHelper = new THREE.AxesHelper(1500);
    this.scene.add( this.axisHelper );    


    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
    directionalLight.position.set( 1000, 1000, 1500 );
    directionalLight.target.position.set( 0, 0, 0 );
    this.scene.add( directionalLight );

    var light = new THREE.AmbientLight( 0x999999 ); // soft white light
    this.scene.add( light );

  },

  initRotationToolEvents: function() {
    var _this = this;

    $('#currentTileRotateLeft').on('click', function() {
      _this.rotate('left');
    });
    $('#currentTileRotateRight').on('click', function() {
      _this.rotate('right');
    });

    $('#currentTileRotateUp').on('click', function() {
      _this.rotate('up');
    });
    $('#currentTileRotateDown').on('click', function() {
      _this.rotate('down');
    });

    $('#currentTileRotateClockwise').on('click', function() {
      _this.rotate('clockwise');
    });
    $('#currentTileRotateAntiClockwise').on('click', function() {
      _this.rotate('anticlockwise');
    });

    $('#currentTileRotateReset').on('click', function() {
      _this.rotateReset();
    });
  },


  initOrientationToolEvents: function() {
    var _this = this;

    $('#currentTileOrientation2dReset').on('click', function() {
      _this.resetOrientation2d();
    });

    $('#currentTileOrientation2dFlipH').on('click', function() {
      _this.flipH2d();
    });

    $('#currentTileOrientation2dFlipV').on('click', function() {
      _this.flipV2d();
    });

    $('#currentTileOrientation2dRotate').on('click', function() {
      _this.rotate2d();
    });
  },


  update2dOrientationInfo: function() {
    var rotZ = this.rotZ * 90;
    $('#currentTileRotate').html(rotZ);
    $('.tile-rotation-amount').html(rotZ);

    var flipH = 'N';
    if(this.flipH) {
      flipH = 'Y'
    }
    $('#currentTileFlipH').html(flipH);
    $('.tile-flipped-x').html(flipH);


    var flipV = 'N';
    if(this.flipV) {
      flipV = 'Y';
    }
    $('#currentTileFlipV').html(flipV);
    $('.tile-flipped-y').html(flipV);


  },


/*
tileControlsSplitPanel 
- main content is materials
- north content is orientation controls

currentTileSplitPanel 
- south is tileControlsSplitPanel
*/
  setTileMaterialsVisible: function(visible) {
    if(visible) {
      $('#tileMaterialControls').show();
    } else {
      $('#tileMaterialControls').hide();
    }

    if(this.editor.sideTilePalette) {
      this.editor.sideTilePalette.setMaterialsVisible(visible);
    }

  },

  setSouthPanelSize: function() {
    if(g_app.getMode() == '3d') {
      UI('currentTileSplitPanel').setPanelVisible('south', true);
      UI('currentTileSplitPanel').resizeThePanel({ "panel": 'south', "size": 56 });

      UI('tileControlsSplitPanel').setPanelVisible('north', true);
      UI('tileControlsSplitPanel').resizeThePanel({ "panel": 'north', "size": 56 });
      
      this.setTileMaterialsVisible(false);

      $('#charRotationTools3d').show();
      $('#charOrientationTools2d').hide();
      
    } else {
      var hasFlip = this.editor.graphic.getHasTileFlip();
      var hasRotate = this.editor.graphic.getHasTileRotate();

      var hasOrientation = hasFlip || hasRotate;
      var hasMaterials = this.editor.graphic.getHasTileMaterials();
      $('#charRotationTools3d').hide();
      $('#charOrientationTools2d').show();

      if(!hasOrientation && !hasMaterials) {
        UI('currentTileSplitPanel').setPanelVisible('south', false);
        this.setTileMaterialsVisible(false);

      } else {
        UI('currentTileSplitPanel').setPanelVisible('south', true);
        if(hasOrientation && !hasMaterials) {
          UI('currentTileSplitPanel').resizeThePanel({ "panel": 'south', "size": 56 });

          UI('tileControlsSplitPanel').setPanelVisible('north', true);
          UI('tileControlsSplitPanel').resizeThePanel({ "panel": 'north', "size": 56 });

          this.setTileMaterialsVisible(false);

          $('#charRotationTools3d').hide();
          $('#charOrientationTools2d').show();

        } else if(!hasOrientation && hasMaterials) {
          UI('currentTileSplitPanel').resizeThePanel({ "panel": 'south', "size": 60 });

          this.setTileMaterialsVisible(true);


          UI('tileControlsSplitPanel').setPanelVisible('north', false);
        } else {
          // need size for both (80)
          UI('currentTileSplitPanel').resizeThePanel({ "panel": 'south', "size": 116 });

          this.setTileMaterialsVisible(true);


          UI('tileControlsSplitPanel').setPanelVisible('north', true);
          UI('tileControlsSplitPanel').resizeThePanel({ "panel": 'north', "size": 56 });
        }
      }  

      if(hasOrientation) {
        $('#drawToolSettings-tileOrientation').show();
        if(hasFlip) {
          $('#currentTileFlipHolder').show();

          $('#tileFlipH').show();
          $('#tileFlipV').show();

          $('.tile-fliph').show();
          $('.tile-flipv').show();
        } else {
          $('#currentTileFlipHolder').hide();

          $('#tileFlipH').hide();
          $('#tileFlipV').hide();

          $('.tile-fliph').hide();
          $('.tile-flipv').hide();

        }

        if(hasRotate) {
          $('#currentTileRotateHolder').show();
          $('#tileRotate').show();
          $('.tile-rotation').show();
        } else {
          $('#currentTileRotateHolder').hide();
          $('#tileRotate').hide();
          $('.tile-rotation').hide();
        }
      } else {
        $('#drawToolSettings-tileOrientation').hide();

        $('.tile-rotation').hide();
        $('.tile-fliph').hide();
        $('.tile-flipv').hide();

      }
    }

  },

  setMaterialsVisibility: function() {
    this.setSouthPanelSize();
  },

  setOrientationToolsVisibility: function() {
    var flip = this.editor.graphic.getHasTileFlip();
    var rotate = this.editor.graphic.getHasTileRotate();

    if(flip || rotate) {
      $('#charOrientationTools2d').show();
      if(flip) {
        $('#tileOrientationFlipControls').show();
      } else {
        $('#tileOrientationFlipControls').hide();
      }

      if(rotate) {
        $('#tileOrientationRotateControls').show();
      } else {
        $('#tileOrientationRotateControls').hide();

      }
    } else {
      $('#charOrientationTools2d').hide();
    }

    /*

    if(this.editor.graphic.hasTileOrientation()) {
      UI('tileControlsSplitPanel').setPanelVisible('south', true);
      $('#charOrientationTools2d').show();
    } else {
      UI('tileControlsSplitPanel').setPanelVisible('south', false);
      $('#charOrientationTools2d').hide();
    }
    */
    this.setSouthPanelSize();
  },

/*
  setTileFlipToolsVisible: function(visible) {

    if(visible) {
      $('#charOrientationTools2d').show();
    } else {
      // if rotation also not visible, hide the panel
    }

  },

  setRotateToolsVisible: function(visible) {
    if(visible) {
      $('#charOrientationTools2d').show();
    } 

  },
*/
  flipH2d: function() {
    this.flipH = !this.flipH;
    this.canvasDrawCharacters();
    this.update2dOrientationInfo();

    if(this.editor.sideTilePalette) {
      this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }    

    if(this.editor.tools.drawTools.tilePalette) {
      this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }
    
  },

  flipV2d: function() {
    this.flipV = !this.flipV;
    this.canvasDrawCharacters();
    this.update2dOrientationInfo();

    if(this.editor.sideTilePalette) {
      this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }    

    if(this.editor.tools.drawTools.tilePalette) {
      this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }


  },

  rotate2d: function() {

    this.rotZ = Math.floor(this.rotZ + 1) % 4;
    this.canvasDrawCharacters();
    this.update2dOrientationInfo();

    if(this.editor.sideTilePalette) {
      this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true });
    }    

    if(this.editor.tools.drawTools.tilePalette) {
      this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    }

  },

  resetOrientation2d: function() {
    this.flipH = false;
    this.flipV = false;
    this.rotZ = 0;
    this.canvasDrawCharacters();
    this.update2dOrientationInfo();

  },

  buildInterface: function(parentPanel) {
    var _this = this;

    var splitPanel = UI.create("UI.SplitPanel", { "id": "currentTileSplitPanel" });
    parentPanel.add(splitPanel);

    this.holderPanel = UI.create("UI.Panel");
    //parentPanel.add(this.holderPanel);

    splitPanel.add(this.holderPanel);

    this.holderPanel.on('mousemove', function(event) {
      UI.setCursor('default');
    });

    this.canvasPanel = UI.create("UI.CanvasPanel", { "id": "currentTileCanvasPanel"});
    this.canvasPanel.on('contextmenu', function(event) {
      event.preventDefault();
    });

    this.canvasPanel.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);
      _this.refresh();
    });
    UI.on('ready', function() {

/*

      if(UI.isMobile.any()) {
        var characterCanvas = _this.canvasPanel.getCanvas();

        characterCanvas.addEventListener("click", function(event){
          _this.characterClick(event);
        }, false);
      } else {
        var characterCanvas = _this.canvasPanel.getCanvas();

        characterCanvas.addEventListener('dblclick', function(event) {
          _this.characterDoubleClick(event);
        }, false);

      }

*/
      _this.initEvents();
      _this.resize();
    });


    this.holderPanel.add(this.canvasPanel);

//    var splitPanel = UI.create("UI.SplitPanel", { "id": "currentTileWebGLPanel"});


    var character3d = UI.create("UI.WebGLPanel", { "id": "currentTileWebGLPanel" });
    character3d.on('render', function(left, top, width, height) {
      _this.render(left, top, width, height);
    });
//    splitPanel.add(character3d);
    this.holderPanel.add(character3d);


    var tileControlsHeight = 80;
    var controlsSplitPanel = UI.create("UI.SplitPanel", { "id": "tileControlsSplitPanel" });
    splitPanel.addSouth(controlsSplitPanel, tileControlsHeight, false);


    this.tileMaterials = new TileMaterials();
    this.tileMaterials.init(this.editor, 'currentTile');
    /*
    var materialsHTML = '<div class="panelFill" style="color: white">';

    materialsHTML += '  <div style="padding-left: 2px;" id="tileMaterialControls">';
    materialsHTML += '    <div style="margin: 4px 0 2px 0; font-size: 10px; font-weight: normal; color: #999999">Tile Material</div>';
    materialsHTML += '    <canvas id="tileMaterialsCanvas"></canvas>';
    materialsHTML += '  </div>';
    materialsHTML += '</div>';

    var materialsPanel = UI.create("UI.HTMLPanel", { html: materialsHTML });
    controlsSplitPanel.add(materialsPanel);
    */
    this.tileMaterials.buildInterface(controlsSplitPanel);

    var characterControls = UI.create("UI.HTMLPanel");
    characterControls.on('loaded', function() {
      _this.initRotationToolEvents();
      _this.initOrientationToolEvents();
    });

    var characterControlsHeight = 24;
    controlsSplitPanel.addNorth(characterControls, characterControlsHeight, false);

//    this.holderPanel.add(splitPanel);

    UI.on('ready', function() {
      characterControls.load("html/textMode/charRotationTools.html");
    });
  },

  initEvents: function() {
    var _this = this;

    /*
    if(this.tileMaterialsCanvas == null) {
      this.tileMaterialsCanvas = document.getElementById('tileMaterialsCanvas');
    }
    

    this.tileMaterialsCanvas.addEventListener('mousedown', function(event) {
      _this.materialsMouseDown(event);
    }, false);

    this.tileMaterialsCanvas.addEventListener('mousemove', function(event) {
      _this.materialsMouseMove(event);
    }, false);

    this.tileMaterialsCanvas.addEventListener('mouseup', function(event) {
      _this.materialsMouseUp(event);
    }, false);
    */

  },

  /*

  materialsMouseDown: function(event) {
    var x = event.pageX - $('#' + this.tileMaterialsCanvas.id).offset().left;
    var y = event.pageY - $('#' + this.tileMaterialsCanvas.id).offset().top;

    var xPos = Math.floor((x - this.materialSpacing) / (this.materialWidth + this.materialSpacing));
    var yPos = Math.floor((y - this.materialSpacing) / (this.materialHeight + this.materialSpacing));

    var material = xPos + yPos * 8;
    if(material >= 0 && material < 16) {
      this.setMaterial(material);
    }

  },

  materialsMouseMove: function(event) {
    var x = event.pageX - $('#' + this.tileMaterialsCanvas.id).offset().left;
    var y = event.pageY - $('#' + this.tileMaterialsCanvas.id).offset().top;


  },

  materialsMouseUp: function(event) {
    var x = event.pageX - $('#' + this.tileMaterialsCanvas.id).offset().left;
    var y = event.pageY - $('#' + this.tileMaterialsCanvas.id).offset().top;


  },

  drawTileMaterials: function() {
    if(this.tileMaterialsCanvas == null) {
      this.tileMaterialsCanvas = document.getElementById('tileMaterialsCanvas')
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    this.materialWidth = 16;
    this.materialHeight = 16;
    this.materialSpacing = 1;
    var canvasWidth = 8 * (this.materialWidth + this.materialSpacing) + this.materialSpacing;
    var canvasHeight = 2 * (this.materialHeight + this.materialSpacing) + this.materialSpacing;


    this.tileMaterialsCanvas.width = canvasWidth * UI.devicePixelRatio;
    this.tileMaterialsCanvas.height = canvasHeight * UI.devicePixelRatio;
    this.tileMaterialsCanvas.style.width = canvasWidth + 'px';
    this.tileMaterialsCanvas.style.height = canvasHeight + 'px';

    this.tileMaterialsContext = this.tileMaterialsCanvas.getContext('2d');


    this.tileMaterialsContext.fillStyle = '#222222';
    this.tileMaterialsContext.fillRect(0, 0, this.tileMaterialsCanvas.width, this.tileMaterialsCanvas.height);

    for(var y = 0; y < 2; y++) {
      for(var x = 0; x < 8; x++) {
        var material = x + y * 8;

        var xPos = (this.materialSpacing + x * (this.materialWidth + this.materialSpacing)) * UI.devicePixelRatio;
        var yPos = (this.materialSpacing + y * (this.materialHeight + this.materialSpacing)) * UI.devicePixelRatio;
        var width = this.materialWidth * UI.devicePixelRatio;
        var height = this.materialHeight * UI.devicePixelRatio;

        var selected = false;
        if(this.useCells) {
          for(var j = 0; j < this.cells.length; j++) {
            for(var i = 0; i < this.cells[j].length; i++) {
              var tileId = this.cells[j][i].t;
              if(tileId != this.editor.tileSetManager.noTile) {
                if(tileSet.getTileMaterial(tileId) == material) {
                  selected = true;
                }
              }
            }
          }

        } else {
          for(var j = 0; j < this.characters.length; j++) {
            for(var i = 0; i < this.characters[j].length; i++) {
              var tileId = this.characters[j][i];
              if(tileId != this.editor.tileSetManager.noTile) {
                if(tileSet.getTileMaterial(tileId) == material) {
                  selected = true;
                }
              }
            }
          }
        }

        if(selected) {
          this.tileMaterialsContext.fillStyle = '#cccccc';
        } else {
          this.tileMaterialsContext.fillStyle = '#121212';
        }
        this.tileMaterialsContext.fillRect(xPos, yPos, width, height);

        var fontPx = 14 * UI.devicePixelRatio;
        var font = fontPx + "px \"Courier New\", Courier, monospace";
    
        this.tileMaterialsContext.font = font;
        if(selected) {
          this.tileMaterialsContext.fillStyle = '#121212';
        } else {
          this.tileMaterialsContext.fillStyle = '#cccccc';
        }

        // draw all the characters in the same spot
        for(var i = 0; i < 128; i++) {
          var c = material.toString(16).toUpperCase();
          var textMeasure = this.tileMaterialsContext.measureText(c);

          var textX = xPos + (width - textMeasure.width) / 2;
          var textY = yPos + 12 * UI.devicePixelRatio;
          this.tileMaterialsContext.fillText(c, textX, textY);
        }
      }
    }
  },

*/
  setMaterial: function(material) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.useCells) {
      for(var j = 0; j < this.cells.length; j++) {
        for(var i = 0; i < this.cells[j].length; i++) {
          var tileId = this.cells[j][i].t;
          if(tileId != this.editor.tileSetManager.noTile) {
            tileSet.setTileMaterial(tileId, material);
          }
        }
      }

    } else {
      for(var j = 0; j < this.characters.length; j++) {
        for(var i = 0; i < this.characters[j].length; i++) {
          var tileId = this.characters[j][i];
          if(tileId != this.editor.tileSetManager.noTile) {
            tileSet.setTileMaterial(tileId, material);
          }
        }
      }
    }

    this.drawTileMaterials();

  },


  drawTileMaterials: function() {
    this.tileMaterials.drawTileMaterials();

    if(this.editor.sideTilePalette) {
      this.editor.sideTilePalette.tileMaterials.drawTileMaterials();
    }

  },
  

  chooseCharacterMobile: function() {
    if(this.tilePaletteChooserMobile == null) {
      this.tilePaletteChooserMobile = new TilePaletteChooserMobile();
      this.tilePaletteChooserMobile.init(this.editor);
    }

    var character = 0;
    if(this.characters.length > 0 && this.characters[0].length > 0) {
      character = this.characters[0][0];

    }
    this.tilePaletteChooserMobile.show({character: character});

  },
  characterClick: function(event) {
  },

  characterDoubleClick: function(event) {
    this.editor.tileEditor.toggleVisible();

  },

  getRx: function() {
    return this.rotX;
  },

  getRy: function() {
    return this.rotY;
  },

  getRz: function() {
    return this.rotZ;
  },

  getCharacters: function() {
    return this.characters;
  },

  getTiles: function() {
    return this.characters;

  },

  getColor: function() {
    return this.color;
  },

  switchColors: function() {
    var fc  = this.color;
    var bc = this.bgColor;

    if(bc == this.editor.colorPaletteManager.noColor) {
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {
        var bc = layer.getBackgroundColor();
      }          
    }

    if(bc != this.editor.colorPaletteManager.noColor) {
      this.setColor(bc);
    } 
    this.setBGColor(fc);
  },

  setColor: function(color, args) {
    var force = false;
    var update = true;
    this.useCells = false;

//    console.error('set color');
//    return;
    if(typeof args != 'undefined') {
      if(typeof args.force != 'undefined') {
        force = args.force;
      }

      // whether to update where this colour is used.
      if(typeof args.update != 'undefined') {
        update = args.update;
      }
    }

    if(color === this.color && !force) {
      return;
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }
    this.color = color;

    if(this.characterMesh) {
      this.characterMesh.material = colorPalette.getMaterial(this.color);
    }

    if(this.type == '2d') {
      this.canvasDrawCharacter();
    }


    this.editor.grid.setCursorColor(this.color);

    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.currentFGColor = color;
  
    if(this.editor.getColorPerMode() == 'character') {
//      if(this.editor.tools.drawTools.tool != 'block') {
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      // need to update character colours..
      for(var y = 0; y < this.characters.length; y++) {
        for(var x = 0; x < this.characters[y].length; x++) {
          tileSet.setTileColor(this.characters[y][x], color);
        }
      }

      if(this.editor.tools.drawTools.tool == 'block' && this.editor.tools.drawTools.blockPalette != null) {
        this.editor.tools.drawTools.blockPalette.drawBlockPalette();

        if(this.editor.sideBlockPalette) {
          this.editor.sideBlockPalette.drawBlockPalette();
        }
      }
    }

    if(this.editor.getColorPerMode() == 'block') {
      if(this.editor.tools.drawTools.tool == 'block') {
        var selectedBlockId = this.editor.tools.drawTools.blockPalette.getSelectedBlockId();
        if(selectedBlockId !== false) {
          var blockSet = this.editor.blockSetManager.getCurrentBlockSet();        
          blockSet.setBlockColor(selectedBlockId, color);
        }
        this.editor.tools.drawTools.blockPalette.drawBlockPalette();
        this.editor.sideBlockPalette.drawBlockPalette();
      }
    }

    if(this.editor.graphic.type  == 'sprite') {
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getType() == 'grid') {
        layer.setSpriteColor(color);
        this.editor.graphic.redraw({ allCells: true });
      }
    }


    if(update) {
      this.editor.colorsUpdated();
    }


    var colorIndex = color;
    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR && colorIndex >= 8 && this.editor.graphic.getType() !== 'sprite') {
      colorIndex -= 8;
    }

    if(
      this.editor.getScreenMode() === TextModeEditor.Mode.INDEXED || this.editor.getScreenMode() === TextModeEditor.Mode.RGB) {
      // colour is the pixel tool color
      this.editor.tools.drawTools.pixelDraw.setColor(color);
      this.editor.tileEditor.selectColorIndex(color);      
    }


    if(this.editor.colorEditor) {
      this.editor.colorEditor.setColor(color);
    }
    
    //if(this.type == '3d') {
    if(g_app.getMode() == '3d') {
      this.editor.grid3d.setCursorColor(color);
    }
    this.editor.info.setFGColor(color);
    this.editor.colorPalettePanel.setSelectedColor(0, color);


    var colorHexString = colorPalette.getHexString(colorIndex);
    $('.foregroundColor').css('background-color', '#' + colorHexString);
    $('.foregroundColorMobile').css('background-color', '#' + colorHexString);
    $('.foregroundColorDisplay').css('background-color', '#' + colorHexString);
  },


  setScreenMode: function(screenMode) {
    this.screenMode = screenMode;

//    this.hasTileOrientation = true;

  },

  getBGColor: function() {
    return this.bgColor;
  },

  setBGColor: function(bgColor, args) {
    
    if(bgColor === false) {
      bgColor = this.editor.colorPaletteManager.noColor;
    }

    var force = false;
    var update = true;

    if(typeof args != 'undefined') {
      if(typeof args.force != 'undefined') {
        force = args.force;
      }
      if(typeof args.update != 'undefined') {
        update = args.update;
      }
    }

    if(this.bgColor === bgColor && !force) {
      return;
    }

    if(this.editor.getScreenMode() == TextModeEditor.Mode.C64STANDARD) {
      this.bgColor = this.editor.colorPaletteManager.noColor;
      return;
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    this.bgColor = bgColor;

    if(this.type == '2d') {
      this.canvasDrawCharacter();
    }

    if(this.characterMesh) {
      if(this.bgColor !== this.editor.colorPaletteManager.noColor) {
//        this.characterBGMesh.material = colorPalette.getMaterial(this.bgColor);
        this.tileBGMaterial.color.set(colorPalette.getHex(this.bgColor));

        this.characterBGMesh.material = this.tileBGMaterial;
      } else {
        this.characterBGMesh.material = this.noBGMaterial;
      }
    }

    var realBgIndex = bgColor;
    if(this.editor.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      realBgIndex = this.editor.getC64ECMColor(bgColor);        
      if(realBgIndex === this.editor.colorPaletteManager.noColor) {
        realBgIndex = 0;
      }
      // need to change selected tiles

      if(bgColor !== this.editor.colorPaletteManager.noColor) {
        var tiles = this.getTiles();
        for(var y = 0; y < tiles.length; y++) {
          for(var x = 0; x < tiles[y].length; x++) {
            var ecmGroup = Math.floor(tiles[y][x] / 256);
            tiles[y][x] = ((tiles[y][x] % 256) % 64) + ecmGroup * 256 + bgColor * 64;          
          }
        }
        //this.setTiles(tiles);
        this.editor.setSelectedTiles(tiles);
      }
    }

    this.editor.info.setBGColor(bgColor);
    this.editor.colorPalettePanel.setSelectedColor(1, realBgIndex);

    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.currentBGColor = bgColor;

    this.editor.grid.setCursorBGColor(this.bgColor);
    if(realBgIndex !== this.editor.colorPaletteManager.noColor) {
      $('.cellBackgroundColor').html('');      
      $('.cellBackgroundColor').css('background-color', '#' + colorPalette.getHexString(realBgIndex));
      $('.cellBackgroundColor').css('background-image', "none");

      $('.cellBackgroundColorMobile').html('');      
      $('.cellBackgroundColorMobile').css('background-color', '#' + colorPalette.getHexString(realBgIndex));
      $('.cellBackgroundColorMobile').css('background-image', "none");
    } else {
      $('.cellBackgroundColor').css('background-color', '#000000');
      $('.cellBackgroundColor').html('<i style="margin-left: 1px" class="halflings halflings-remove"></i>');


      $('.cellBackgroundColorMobile').css('background-color', '#000000');
      $('.cellBackgroundColorMobile').html('<i style="font-size: 32px; margin-top: 1px" class="halflings halflings-remove"></i>');
    }


    if(this.editor.getColorPerMode() == 'character') {
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      var tileCount = tileSet.getTileCount();
      // need to update character colours..
      for(var y = 0; y < this.characters.length; y++) {
        for(var x = 0; x < this.characters[y].length; x++) {
          var t = this.characters[y][x];
          if(t < tileCount) {
            tileSet.setCharacterBGColor(t, bgColor);
          }
        }
      }
    }

    if(update) {
      this.editor.colorsUpdated();
    }
  },

  getBlock: function() {
    return this.blockId;
  },

  setBlock: function(blockId) {
    this.blockSet = this.editor.blockSetManager.getCurrentBlockSet();

    var blockData = this.blockSet.getBlockData(blockId);

    if(blockData.length == 0) {
      this.blockId = false;
      return;
    }

//    this.setCharacters(blockData);

    var characters = [];
    for(var y = 0; y < blockData.data.length; y++) {
      characters[y] = [];
      for(var x = 0; x < blockData.data[y].length; x++) {
        characters[y][x] = blockData.data[y][x].t;
      }
    }
    this.setCharacters(characters);


    if(blockData.colorMode == 'none') {
      var characters = [];
      for(var y = 0; y < blockData.data.length; y++) {
        characters[y] = [];
        for(var x = 0; x < blockData.data[y].length; x++) {
          characters[y][x] = blockData.data[y][x].t;
        }
      }
      this.setCharacters(characters);
      this.useCells = false;
    } else {
      this.setCells(blockData.data);
      this.useCells = true;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer) {
      var colorPerMode = layer.getColorPerMode();
      if(colorPerMode == 'block') {
        // need to set the color
        var fgColor = blockData.fc;
        this.setColor(fgColor, { update: false });

      }

    }

    // set the block id here cos setCharacters sets it to false
    this.blockId = blockId;
  },


  // set to a grid of cells..
  setCells: function(cells) {
    this.useCells = true;
    this.cells = [];
    for(var y = 0; y < cells.length; y++) {
      this.cells[y] = [];
      for(var x = 0; x < cells[y].length; x++) {
        this.cells[y][x] = {};
        for(var key in cells[y][x]) {
          if(cells[y][x].hasOwnProperty(key)) {
            this.cells[y][x][key] = cells[y][x][key];
          }
        }
      }
    }

    this.canvasDrawCharacter();
    this.drawTileMaterials();
  },


  setToFirstBlankTile: function() {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }

    var tileCount = tileSet.getTileCount();
    if(tileCount == 0) {
      return;
    }

    for(var i = 0; i < tileCount; i++) {
      if(!tileSet.isBlank(i)) {
        this.setTiles([[ i ]]);
        return;
      }
    }

    // all blank, so just choose first tile
    this.setTiles([[0]]);

  },
  
  setCharacters: function(characters) {
    this.setTiles(characters);
  },

  // set to a grid of characters
  setTiles: function(characters) {
    // check parmeter
    if(typeof characters == 'undefined' || characters.length == 0 || characters[0].length == 0) {
      return;
    }

    this.useCells = false;

    var changed = false;
 
    this.blockId = false;
    if(characters.length != this.characters.length) {
      changed = true;
    }


    if(!changed) {
      for(var y = 0; y < characters.length; y++) {
        if(characters[y].length != this.characters[y].length) {
          changed = true;
        }

        if(!changed) {
          for(var x = 0; x < characters[y].length; x++) {
            if(characters[y][x] != this.characters[y][x]) {
              changed = true;

              x = characters[y].length;
              y = characters.length;
              break;
            }
          }
        }
      }
    }

    if(!changed) {
      return;
    }


    var tileSetManager = this.editor.tileSetManager;
    var tileCount = tileSetManager.getTileCount();

    this.characterSelected = [];
    for(var i = 0; i < tileCount; i++) {
      this.characterSelected[i] = false;
    }

    this.characters = [];
    for(var y = 0; y < characters.length; y++) {
      this.characters.push([]);
      for(var x = 0; x < characters[y].length; x++) {
        this.characterSelected[characters[y][x]] = true;
        this.characters[y].push(characters[y][x]);
      }
    }



    
    if(this.editor.tileEditor) {
      this.editor.tileEditor.setCharacters(characters);
    }

    
    this.canvasDrawCharacters();

    if(this.type === '3d' ) {
      this.setCharacter3d(characters);
    }
    if(characters.length > 0 && characters[0].length > 0) {
      this.character3d = characters[0][0];
    }

    this.editor.info.setCharacter(this.editor.currentTile.getCharacters());

    var settings = g_app.doc.getDocRecord('/settings');
    
    settings.data.currentTile = characters[0][0];

    var colorPerMode = this.editor.getColorPerMode();


    if(colorPerMode == 'character') {

      if(characters.length == 1 && characters[0].length == 1) {
        var tileSet = this.editor.tileSetManager.getCurrentTileSet();
        var fgColor = tileSet.getTileColor(characters[0][0]);
        var bgColor = tileSet.getCharacterBGColor(characters[0][0]);

        this.setColor(fgColor, { update: false });
        if(this.editor.getScreenMode() != TextModeEditor.Mode.C64ECM) {
          this.setBGColor(bgColor, { update: false });
        }
      }
      
    }

    if(this.editor.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      var bgColor = Math.floor(characters[0][0] / 64) % 4;
      this.setBGColor(bgColor, { update: false });
    }

    this.editor.tilesUpdated();
    this.setMobileCharacterInfo();
    this.update2dOrientationInfo();
    this.drawTileMaterials();
  },
  

  setMobileCharacterInfo: function() {
    if(this.characters.length == 0 || this.characters[0].length == 0) {
      return;
    }
    var html = '';
    var character = this.characters[0][0];

    if(typeof character == 'undefined') {
      return;
    }
    
    html = character;
    var hexCharacter = ("00" + character.toString(16)).substr(-2);
    html += ' (0x' + hexCharacter + ')';

    $('#toolsMobileCurrentTileInfo').html(html);
  },

  isCharacterSelected: function(character) {
    return this.characterSelected[character];
  },

  setCharacter: function(character) {
    this.useCells = false;

    this.blockId = false;

    if(this.character === character) {
      return;
    }

    if(this.type === '3d' ) {
//      this.setCharacter3d(character);
    }


    this.character = character;    
    this.setCharacters([[character]]);


    if(this.editor.tileEditor) {
      this.editor.tileEditor.setCharacters([[character]]);
    }



    /*
    this.character = character;
    this.characters = [];
    this.characters.push([]);
    this.characters[0].push(character);
    */

    this.editor.grid.setCursorCharacter(character);//, 0, 0, 0);

/*
    if(this.type === '2d') {
      this.canvasDrawCharacter();
    }
*/

  },


  addToRecentCharacters: function() {
    if(typeof this.characters == 'undefined' || this.characters.length == 0) {
      return;
    }
    var character = this.characters[0][0];
    // add char to recent if not already there
    var foundCharacter = false;
    for(var i = 0; i < this.recentCharacters.length; i++) {
      if(this.recentCharacters[i] == character) {
        foundCharacter = true;
        break;
      }
    }

    if(!foundCharacter) {
      this.recentCharacters.push(character);
      if(this.recentCharacters.length > 16) {
        this.recentCharacters.shift();
      }
    }
  },

  addToRecentColors: function() {
    var color = this.color;
    // add char to recent if not already there
    var foundColor = false;
    for(var i = 0; i < this.recentColors.length; i++) {
      if(this.recentColors[i] == color) {
        foundColor = true;
        break;
      }
    }

    if(!foundColor) {
      this.recentColors.push(color);
      if(this.recentColors.length > 16) {
        this.recentColors.shift();
      }
    }
  },


  setCharacter3d: function(characters) {
    
    var character = characters[0][0];

    if(this.character3d !== character) {
      this.character = character;
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

      var rotationX = 0;
      var rotationY = 0;
      var rotationZ = 0;
      
      if(this.characterMesh !== null) {
        //TODO: remove properly
        rotationX = this.characterMesh.rotation.x;
        rotationY = this.characterMesh.rotation.y;
        rotationZ = this.characterMesh.rotation.z;

        this.scene.remove(this.characterMesh);
        this.characterMesh = null;
      }

      if(character !== this.editor.tileSetManager.blankCharacter) {
        // TODO: whats going on here, using the color palette material slows down frame rate
        // creating new material seems to work..
        // flat shading is causing the problem

//        var material = colorPalette.getMaterial(this.color);
        if(this.tileMaterial == null) { 
          this.tileMaterial = new THREE.MeshPhongMaterial( { color: colorPalette.getHex(this.color) });
          //this.tileMaterial.flatShading = true;
        } else {
          this.tileMaterial.color.set(colorPalette.getHex(this.color) );
        }
        var geometry = tileSet.getGeometry(character);
        
        this.characterMesh = new THREE.Mesh(geometry, this.tileMaterial);
        this.characterMesh.rotation.order = 'YXZ';
        this.characterMesh.rotation.x = rotationX;
        this.characterMesh.rotation.y = rotationY;
        this.characterMesh.rotation.z = rotationZ;

        this.characterMesh.position.x = 1;
        this.characterMesh.position.y = 1;
        this.characterMesh.position.z = 1;

        this.scene.add(this.characterMesh);

//        var material = new THREE.MeshPhongMaterial( { color: this.editor.petscii.getColor(bgColor), specular: 0, shininess: 0, shading: THREE.FlatShading, transparent: true, opacity: 1.0 });//, transparent: true, opacity: 0.6 } ) ;
        if(this.bgColor !== this.editor.colorPaletteManager.noColor) {
//          material = colorPalette.getMaterial(this.bgColor);
//          this.tileBGMaterial.color.setColor(this.bgColor);
          material = this.tileBGMaterial;

        } else {
          material = this.noBGMaterial;
        }

        material.flatShading = true;

        if(this.bgColor === -1) {
          material.opacity = 0;
        }
        var geometry = tileSet.getBackgroundGeometry(character);
        this.characterBGMesh = new THREE.Mesh(geometry, material);
        this.characterMesh.add(this.characterBGMesh);
      }

      // set the 3d cursor according to the selected tool
      this.editor.gridView3d.toolChanged();
    }
  },

  update3dOrientationInfo: function() {
    var rx = Math.round(this.rotX * 360);
    $('#currentTileRX').html(rx);

    var ry = Math.round(this.rotY * 360);
    $('#currentTileRY').html(ry);

    var rz = Math.round(this.rotZ * 360);
    $('#currentTileRZ').html(rz);
  },



  rotateReset: function() {
    this.rotX = 0;
    this.rotY = 0;
    this.rotZ = 0;

    this.editor.grid3d.setCursorRotation(this.rotX, this.rotY, this.rotZ);
    this.updateCharacterMeshOrientation();
    this.update3dOrientationInfo();
  },

  rotate: function(direction) {

    var rotFromX = this.rotX * Math.PI * 2;
    var rotFromY = this.rotY * Math.PI * 2;
    var rotFromZ = this.rotZ * Math.PI * 2;

    var euler = new THREE.Euler(rotFromX, rotFromY, rotFromZ, 'YXZ');
    var rotationMatrix = new THREE.Matrix4();

    rotationMatrix.makeRotationFromEuler(euler);

    var toRotate = new THREE.Matrix4();

    if(direction == 'left') {
      toRotate.makeRotationY(-Math.PI / 2); 
    }
    if(direction == 'right') {
      toRotate.makeRotationY(Math.PI / 2); 
    }
    if(direction == 'up') {
      toRotate.makeRotationX(-Math.PI / 2);
    }
    if(direction == 'down') {
      toRotate.makeRotationX(Math.PI / 2);
    }

    if(direction == 'clockwise') {
      toRotate.makeRotationZ(-Math.PI / 2);
    }

    if(direction == 'anticlockwise') {
      toRotate.makeRotationZ(Math.PI / 2);
    }

    rotationMatrix.premultiply(toRotate);

    euler.setFromRotationMatrix(rotationMatrix, 'YXZ');

    var rotX = Math.round(euler.x * 2 / Math.PI) / 4;
    var rotY = Math.round(euler.y * 2 / Math.PI) / 4;
    var rotZ = Math.round(euler.z * 2 / Math.PI) / 4;

    this.rotX = rotX;
    this.rotY = rotY;
    this.rotZ = rotZ;


    this.editor.grid3d.setCursorRotation(this.rotX, this.rotY, this.rotZ);
    this.rotateCharacterMesh(rotFromX, rotFromY, rotFromZ, direction);
    this.update3dOrientationInfo();
  },

  rotateCharacterMesh: function(rotFromX, rotFromY, rotFromZ, direction) {
    this.characterMesh.rotation.x = rotFromX;
    this.characterMesh.rotation.y = rotFromY;
    this.characterMesh.rotation.z = rotFromZ;

    var euler = new THREE.Euler(rotFromX, rotFromY, rotFromZ, 'YXZ');
    var rotationMatrix = new THREE.Matrix4();

    rotationMatrix.makeRotationFromEuler(euler);

    var toRotate = new THREE.Matrix4();


    var position = { x: 0 };
    var endPosition = { x: 1 };

    if(this.rotationTween != null) {
      this.rotationTween.stop();
    }
    this.rotationTween = new TWEEN.Tween(position).to(endPosition, 500);
    var currentTile = this;

    this.rotationTween.onUpdate(function() {

      euler.set(rotFromX, rotFromY, rotFromZ, 'YXZ');

      rotationMatrix.makeRotationFromEuler(euler);

      if(direction == 'left') {
        toRotate.makeRotationY(position.x * -Math.PI / 2); 
      }
      if(direction == 'right') {
        toRotate.makeRotationY(position.x * Math.PI / 2); 
      }
      if(direction == 'up') {
        toRotate.makeRotationX(position.x * -Math.PI / 2);
      }
      if(direction == 'down') {
        toRotate.makeRotationX(position.x * Math.PI / 2);
      }

      if(direction == 'clockwise') {
        toRotate.makeRotationZ(position.x * -Math.PI / 2);
      }

      if(direction == 'anticlockwise') {
        toRotate.makeRotationZ(position.x * Math.PI / 2);
      }

      rotationMatrix.premultiply(toRotate);

      euler.setFromRotationMatrix(rotationMatrix, 'YXZ');
      currentTile.characterMesh.rotation.x = euler.x;
      currentTile.characterMesh.rotation.y = euler.y;
      currentTile.characterMesh.rotation.z = euler.z;

    });
      
    this.rotationTween.onComplete(function() {
    });
    this.rotationTween.easing(TWEEN.Easing.Cubic.InOut);
    this.rotationTween.start();



  },

  updateCharacterMeshOrientation: function() {
    var rotX = this.rotX * Math.PI * 2;
    var rotY = this.rotX * Math.PI * 2;
    var rotZ = this.rotX * Math.PI * 2;

    if(this.characterMesh.rotation.x == rotX && this.characterMesh.rotation.y == rotY && this.characterMesh.rotation.z == rotZ) {
      return;
    }

    var position = { x: this.characterMesh.rotation.x, y: this.characterMesh.rotation.y, z: this.characterMesh.rotation.z };
    var endPosition = { x: rotX, y: rotY, z: rotZ };

    var tween = new TWEEN.Tween(position).to(endPosition, 400);
    var currentTile = this;

    tween.onUpdate(function() {
      currentTile.characterMesh.rotation.x = position.x;
      currentTile.characterMesh.rotation.y = position.y;
      currentTile.characterMesh.rotation.z = position.z;

    });
      
    tween.onComplete(function() {
      currentTile.characterMesh.rotation.x = currentTile.rotX * Math.PI * 2;
      currentTile.characterMesh.rotation.y = currentTile.rotY * Math.PI * 2;
      currentTile.characterMesh.rotation.z = currentTile.rotZ * Math.PI * 2;

    });
    tween.easing(TWEEN.Easing.Cubic.InOut);
    tween.start();
  },



  getVectorCursorCanvas: function(args) {
    var scale = args.scale;
    
    // need to check if cached..
    this.drawCursor({
      scale: scale
    });
    return this.cursorCanvas;

  },


  getCursorCanvas: function() {
    return this.cursorCanvas;

  },


  getCursorWidth: function() {
    return this.characters[0].length;
  },

  getCursorHeight: function() {
    return this.characters.length;
  },



  // draw current characters into the cursor canvas
  drawCursor: function(args) {
    if(this.type != '2d') {
//      return;
    }

    // scale used for vector cursors
    var scale = 1;
    if(typeof args != 'undefined') {
      if(typeof args.scale != 'undefined') {
        scale = args.scale;
      }
    }

    // **** draw cursor seems to get called a lot when loading a screen
    //    console.log('draw cursor');
    

    if(this.useCells) {
      if(this.cells.length === 0) {
        return;
      }

      if(this.cells[0].length == 0) {
        return;
      }

    } else {
      if(this.characters.length === 0) {
        return;
      }

      if(this.characters[0].length == 0) {
        return;
      }
    }



    if(this.cursorCanvas == null) {
      this.cursorCanvas = document.createElement('canvas');
    }

    var layer = this.editor.layers.getSelectedLayerObject();

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileCount = tileSet.getTileCount();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    var charsAcross = 0 ;
    var charsDown = 0;
    if(this.useCells) {
      charsAcross = this.cells[0].length;
      charsDown = this.cells.length;

    } else {
      charsAcross = this.characters[0].length;
      charsDown = this.characters.length;

    }

    var totalCharWidth = charWidth * charsAcross * scale;
    var totalCharHeight = charHeight * charsDown * scale;
    var cursorCanvasResized = false;

    if(this.cursorCanvas.width < totalCharWidth) {
      this.cursorCanvas.width = totalCharWidth;
      cursorCanvasResized = true;
    }

    if(this.cursorCanvas.height < totalCharHeight) {
      this.cursorCanvas.height = totalCharHeight;
      cursorCanvasResized = true;
    }

    var colorPerMode = this.editor.getColorPerMode();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var defaultBgColorRGB = ColorUtils.hexStringToInt(styles.textMode.tilePaletteBg);//0x333333;


    if(cursorCanvasResized || this.cursorImageData == null) {
      this.cursorContext = this.cursorCanvas.getContext("2d");
      this.cursorContext.clearRect(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
      this.cursorImageData = this.cursorContext.getImageData(0, 0, this.cursorCanvas.width, this.cursorCanvas.height);
    }


    var canvas = this.cursorCanvas;
    var context = this.cursorContext;
    var imageData = this.cursorImageData;

    // overrides used for drawing vector cursors
    if(typeof args != 'undefined') {
      if(typeof args.canvas != 'undefined') {
        canvas = args.canvas;
      }
      if(typeof args.context != 'undefined') {
        context = args.context;
      }
      if(typeof args.imageData != 'undefined') {
        imageData = args.imageData;
      }
    }

    var imageDataLength = canvas.width * canvas.height * 4;
    var pos = 3;
    while(pos < imageDataLength) {
      this.cursorImageData.data[pos] = 0;
      pos += 4;
    }
 
    var args = {};

    args['imageData'] = imageData;// this.cursorImageData;
    // cursor context needed for vector
    args['context'] = context;//this.cursorContext;


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


    var bgColor = this.bgColor;

    for(var y = 0; y < charsDown; y++) {
      for(var x = 0; x < charsAcross; x++) {

        if(this.useCells) {
          args['color'] = this.cells[y][x].fc;
          args['bgColor'] = this.cells[y][x].bc;
          args['character'] = this.cells[y][x].t;
        } else {
          args['character'] = this.characters[y][x];

          if(colorPerMode == 'character') {
            var ch = args['character'];
            if(typeof ch != 'undefined' && ch !== false && ch < tileCount) {
              var fgColor = tileSet.getTileColor(ch);
              if(this.editor.getColorPerMode() == 'character') {
                bgColor = tileSet.getCharacterBGColor(ch);
              }

              
              args['colorRGB'] = colorPalette.getHex(fgColor);
              args['color'] = fgColor;
              if(bgColor != this.editor.colorPaletteManager.noColor) {
//                args['bgColorRGB'] = colorPalette.getHex(bgColor);
                args['bgColor'] = bgColor;
              } else {
//                args['bgColorRGB'] = defaultBgColorRGB;
                args['bgColor'] = this.editor.colorPaletteManager.noColor;
              }
            }

          } else {
            args['color'] = this.color;
            args['bgColor'] = this.bgColor;
          }
        }


        if(args['screenMode'] === TextModeEditor.Mode.C64STANDARD) {
          args['bgColor'] = this.editor.colorPaletteManager.noColor;
        }

        if(args['screenMode'] === TextModeEditor.Mode.C64ECM) {
          if(layer && typeof layer.getC64ECMColor != 'undefined') {
            var ecmBGColor = Math.floor(args['character'] / 64) % 4;

            //args['bgColorRGB'] = colorPalette.getHex(layer.getC64ECMColor(ecmBGColor));

            args['character'] = args['character'] % 64;
            args['bgColor'] = layer.getC64ECMColor(ecmBGColor); //args['bgColor']);
          }
        }

        if(typeof args['character'] != 'undefined' && args['character'] !== false) {
          //if(this.editor.graphic.hasTileOrientation()) {
          if(this.editor.graphic.getHasTileFlip()) {
            args['flipH'] = this.flipH;
            args['flipV'] = this.flipV;
          } 

          if(this.editor.graphic.getHasTileRotate()) {
            args['rotZ'] = this.rotZ;
          }
          
          args['x'] = x * charWidth;
          args['y'] = y * charHeight;
          args['scale'] = scale;

          args['select'] = false;
          args['highlight'] = false;
          
          if(this.editor.getCursorTileTransparent()) {
            args['backgroundIsTransparent'] = true;
          } else {
            if(args['bgColor'] == this.editor.colorPaletteManager.noColor) {
              args['bgColor'] = this.editor.graphic.getBackgroundColor();
            }
          }
//          

          tileSet.drawCharacter(args);
        }
      }
    }

    if(layer && layer.getMode() != TextModeEditor.Mode.VECTOR) {
      context.putImageData(imageData, 0, 0);
    }

  },


  setDeviceType: function(device) {
    var _this = this;

    if(device == 'mobile') {
      this.canvas =  document.getElementById('toolsMobileCurrentTile');
      if(!this.mobileCanvasEventsInit) {
        if(this.canvas) {
          this.mobileCanvasEventsInit = true;
          this.canvas.addEventListener("click", function(event){
            _this.characterClick(event);
          }, false);
        }
      }

      this.tilePaletteCanvas = document.getElementById('tilePaletteMobileCurrentTile');


    } else {
      this.canvas = this.canvasPanel.getCanvas();

      if(!this.desktopCanvasEventsInit) {
        this.desktopCanvasEventsInit = true;
        this.canvas.addEventListener('dblclick', function(event) {
          _this.characterDoubleClick(event);
        }, false);
      }

      this.tileSettingsTileCanvas = document.getElementById('toolSettingsCurrentTile');      
      this.tileSettingsTileCanvas.width = 24 * UI.devicePixelRatio;
      this.tileSettingsTileCanvas.height = 24 * UI.devicePixelRatio;

      $('#toolSettingsCurrentTile').on('mouseenter', function() {
        UI.setCursor('pointer');
      });
      $('#toolSettingsCurrentTile').on('mouseleave', function() {
        UI.setCursor('default');
      });

    }
  },




  // draw the large version of the selected characters
  canvasDrawCharacters: function() {

    if(this.type != '2d') {
//      return;
    }

    if(this.characters.length === 0) {
      return;
    }

    if(this.characters[0].length == 0) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();

    var charsAcross = 0 ;
    var charsDown = 0;


    if(this.useCells) {
      // draw using cells rather than characters..
      // cells have bg, fg colours
      // used for when drawing with selection..
      charsAcross = this.cells[0].length;
      charsDown = this.cells.length;

    } else {
      charsAcross = this.characters[0].length;
      charsDown = this.characters.length;

    }

    var totalCharWidth = tileWidth * charsAcross;
    var totalCharHeight = tileHeight * charsDown;

    this.drawCursor();

    if(this.canvas == null) {

      // get the canvas that displays the current tiles
      if(g_app.isMobile()) {
        this.setDeviceType('mobile');
      } else {
        this.setDeviceType('desktop');
      }
    }

    if(this.canvas == null) {
      // still not ready
      return;
    }

    this.context = UI.getContextNoSmoothing(this.canvas);

    this.context.fillStyle = '#222222';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.tilePaletteContext = null;
    if(this.tilePaletteCanvas != null) {
      // this is the canvas at the bottom
      this.tilePaletteContext = UI.getContextNoSmoothing(this.tilePaletteCanvas);

      /*
      this.tilePaletteContext = this.tilePaletteCanvas.getContext('2d');
      this.tilePaletteContext.imageSmoothingEnabled = false;
      this.tilePaletteContext.webkitImageSmoothingEnabled = false;
      this.tilePaletteContext.mozImageSmoothingEnabled = false;
      this.tilePaletteContext.msImageSmoothingEnabled = false;
      this.tilePaletteContext.oImageSmoothingEnabled = false;
      */

      this.tilePaletteContext.fillStyle = '#222222';
      this.tilePaletteContext.fillRect(0, 0, this.tilePaletteCanvas.width, this.tilePaletteCanvas.height);
    }


    this.tileSettingsTileContext = null;
    if(this.tileSettingsTileCanvas != null) {
      // this is the canvas in the tool settings bar
      this.tileSettingsTileContext = UI.getContextNoSmoothing(this.tileSettingsTileCanvas);
      this.tileSettingsTileContext.fillStyle = '#222222';
      this.tileSettingsTileContext.fillRect(0, 0, this.tileSettingsTileCanvas.width, this.tileSettingsTileCanvas.height);
      this.tileSettingsImageData = this.tileSettingsTileContext.getImageData(0, 0, this.tileSettingsTileCanvas.width, this.tileSettingsTileCanvas.height);
    }


    var scale = 1;
    var hScale = 1;
    var vScale = 1;
    if(this.canvas.width > totalCharWidth) {
      hScale = this.canvas.width / totalCharWidth;
    }

    // scale to fit height
    var vScale = 1;
    if(this.canvas.height > totalCharHeight) {
      vScale = this.canvas.height / totalCharHeight;
    }


    if(hScale > vScale) {
      scale = vScale;
    } else {
      scale = hScale;
    }


    var layer =  this.editor.layers.getSelectedLayerObject();
    if(layer.getMode() == TextModeEditor.Mode.VECTOR) {
      
      this.drawCursor({
        scale: scale,
        canvas: this.canvas,
        context: this.context,
        imageData: null
      });


    } else {

 
      var xPos = 0;
      var yPos = 0;
      var destWidth = Math.floor(totalCharWidth * scale);
      var destHeight = Math.floor(totalCharHeight * scale);

      xPos = Math.floor((this.canvas.width - destWidth) / 2);
      yPos = Math.floor((this.canvas.height - destHeight) / 2);
      this.context.drawImage(this.cursorCanvas, 
              0, 0, totalCharWidth, totalCharHeight,
              xPos, yPos, destWidth, destHeight);
    }


    if(this.tilePaletteContext) {
      var scale = 1;
      var hScale = 1;
      var vScale = 1;
      if(this.tilePaletteCanvas.width > totalCharWidth) {
        hScale = this.tilePaletteCanvas.width / totalCharWidth;
      }
  
      // scale to fit height
      var vScale = 1;
      if(this.tilePaletteCanvas.height > totalCharHeight) {
        vScale = this.tilePaletteCanvas.height / totalCharHeight;
      }
  
  
      if(hScale > vScale) {
        scale = vScale;
      } else {
        scale = hScale;
      }
  
      var layer =  this.editor.layers.getSelectedLayerObject();
      if(layer.getMode() == TextModeEditor.Mode.VECTOR) {
        

        this.drawCursor({
          scale: scale,
          canvas: this.tilePaletteCanvas,
          context: this.tilePaletteContext,
          imageData: null
        });


      } else {


        var xPos = 0;
        var yPos = 0;
        var destWidth = Math.floor(totalCharWidth * scale);
        var destHeight = Math.floor(totalCharHeight * scale);
    
        xPos = Math.floor((this.tilePaletteCanvas.width - destWidth) / 2);
        yPos = Math.floor((this.tilePaletteCanvas.height - destHeight) / 2);
        this.tilePaletteContext.drawImage(this.cursorCanvas, 
          0, 0, totalCharWidth, totalCharHeight,
          xPos, yPos, destWidth, destHeight);
      }

    }            



    if(this.tileSettingsTileContext) {
      var scale = 1;
      var hScale = 1;
      var vScale = 1;
      if(this.tileSettingsTileCanvas.width > totalCharWidth) {
        hScale = this.tileSettingsTileCanvas.width / totalCharWidth;
      }
  
      // scale to fit height
      var vScale = 1;
      if(this.tileSettingsTileCanvas.height > totalCharHeight) {
        vScale = this.tileSettingsTileCanvas.height / totalCharHeight;
      }
  
  
      if(hScale > vScale) {
        scale = vScale;
      } else {
        scale = hScale;
      }
      
      var layer =  this.editor.layers.getSelectedLayerObject();
      if(layer.getMode() == TextModeEditor.Mode.VECTOR) {
        
        this.drawCursor({
          scale: scale,
          canvas: this.tileSettingsTileCanvas,
          context: this.tileSettingsTileContext,
          imageData: this.tileSettingsImageData
        });

      } else {
        var xPos = 0;
        var yPos = 0;
        var destWidth = Math.floor(totalCharWidth * scale);
        var destHeight = Math.floor(totalCharHeight * scale);
    
        xPos = Math.floor((this.tileSettingsTileCanvas.width - destWidth) / 2);
        yPos = Math.floor((this.tileSettingsTileCanvas.height - destHeight) / 2);
        this.tileSettingsTileContext.drawImage(this.cursorCanvas, 
          0, 0, totalCharWidth, totalCharHeight,
          xPos, yPos, destWidth, destHeight);
      }

      // redraw the char at top of tilepalettes
      if(this.editor.sideTilePalette) {
        this.editor.sideTilePalette.setCharacterInfoToCurrent();
      }

      if(this.editor.tools.drawTools.tilePalette) {
        this.editor.tools.drawTools.tilePalette.setCharacterInfoToCurrent();
      }
  

    }     

    /*
    return;


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var charWidth = tileSet.charWidth;
    var charHeight = tileSet.charHeight;

    var charsAcross = this.characters[0].length;
    var charsDown = this.characters.length;

    var totalCharWidth = charWidth * charsAcross;
    var totalCharHeight = charHeight * charsDown;



    if(this.canvas == null) {
      this.canvas = this.canvasPanel.getCanvas();
    }

    this.context = this.canvas.getContext('2d');

    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    var pixelWidth = Math.floor(this.canvas.width / totalCharWidth);
    var pixelHeight = Math.floor(this.canvas.height / totalCharHeight);

    if(pixelWidth > pixelHeight) {
      pixelWidth = pixelHeight;
    } else {
      pixelHeight = pixelWidth;
    }

    if(pixelWidth < 1 || pixelHeight < 1) {
      pixelWidth = 1;
      pixelHeight = 1;
    }    

    var offsetX = Math.floor((this.canvas.width - totalCharWidth * pixelWidth) / 2);
    var offsetY = Math.floor((this.canvas.height - totalCharHeight * pixelHeight) / 2);


    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.canvasDrawCharacterAt(this.characters[y][x], offsetX + x * pixelWidth * charWidth, 
          offsetY + y * pixelHeight * charHeight, 
          pixelWidth, pixelHeight);
      }
    }

    this.drawCursor();

    */
  },

  canvasDrawCharacter: function() {
    this.canvasDrawCharacters();
    return;

  },

  resize: function(left, top, width, height) {
    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;

    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  },

  setType: function(type) {
    this.type = type;
    if(this.type == '2d') {
      this.holderPanel.showOnly("currentTileCanvasPanel");
      this.canvasDrawCharacter();

    } else if(this.type == '3d') {
      this.holderPanel.showOnly("currentTileWebGLPanel");

    }
  },

  refresh: function() {
    if(this.editor.type == '2d') {
      this.canvasDrawCharacters();
    }
  },

  render: function(left, top, width, height) {
    if(this.editor.type != this.type) {
      this.setType(this.editor.type);
    }
    if(this.width != width || this.height != height || this.left != left || this.top != top) {
      this.resize(left, top, width, height);
    }

    if(this.editor.type == '3d') {     
//      console.log('render');
      UI.renderer.setClearColor( this.backgroundColor3d );
      UI.renderer.render( this.scene, this.camera );
    } else if(this.editor.type == '2d') {
      this.canvasDrawCharacters();
    }

  }

}
