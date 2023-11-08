// textModeEditor.js needs to be included first..

//********************************** BUILD INTERFACE  **************************************/




TextModeEditor.prototype.mobileReduceInterface = function() {


  var mobileSplitPanel = UI('textEditorMobileSplitPanel');

  // tool settings panel
  mobileSplitPanel.setPanelVisible('north', false);
  
  // frames panel
  mobileSplitPanel.setPanelVisible('south', false);

  // tools panel
  this.textModeEditorPanel.setPanelVisible('west', true);
  
  this.tilePaletteMobile.setCurrentTileVisible(false);
  this.tilePaletteMobile.draw();
}

TextModeEditor.prototype.mobileRestoreInterface = function() {
  var mobileSplitPanel = UI('textEditorMobileSplitPanel');

  // tool settings panel
  mobileSplitPanel.setPanelVisible('north', true);
  
  // frames panel
  mobileSplitPanel.setPanelVisible('south', true);

  // tools panel
  this.textModeEditorPanel.setPanelVisible('west', false);

  this.tilePaletteMobile.setCurrentTileVisible(true);
  this.tilePaletteMobile.draw();

}




TextModeEditor.prototype.setLayoutType = function(mode) {
  var isMobile = UI.isMobile.any();
  if(isMobile) {
    return;
  }

  /*
  if($('#drawTool_invert') && $('#drawTool_invert').length > 0) {
    console.log('hide new tools');
    $('#drawTool_invert').hide();
    $('#drawTool_corners').hide();
  }
*/

  // layout the interface for either textmode or sprites
  if(mode == 'textmode') {
    var eastPanelSize = g_app.getPref("textmode.eastPanelSize");
    if(typeof eastPanelSize == 'undefined' || eastPanelSize == null || eastPanelSize < 100) {
      eastPanelSize = 340;
    } else {
      eastPanelSize = parseInt(eastPanelSize, 10);
    }
    this.textModeEditorPanel.resizeThePanel({panel: 'east', size: eastPanelSize });    

    var infoPanelVisible = g_app.getPref("textmode.infoPanelVisible") == "yes";
    this.setInfoPanelVisible(infoPanelVisible);

    var colorPaletteVisible = g_app.getPref("textmode.colorPaletteVisible") != "no";
    var colorPanelSize = g_app.getPref("textmode.colorPanelSize");  
    if(typeof colorPanelSize == 'undefined' || colorPanelSize == null) {
      colorPanelSize = 150;      
    } else {
      colorPanelSize = parseInt(colorPanelSize, 10);
    }
    this.setColorPalettePanelVisible(colorPaletteVisible);
  
    var layersPanelVisible = g_app.getPref("textmode.layersPanelVisible") != "no";
    var layersPanelSize = g_app.getPref("textmode.layersPanelSize");
    if(typeof layersPanelSize == 'undefined' || layersPanelSize == null) {
      layersPanelSize = 200;      
    } else {
      layersPanelSize = parseInt(layersPanelSize, 10);
    }

    this.setLayersPanelVisible(layersPanelVisible);

    if(g_isNewUser) {
      g_app.setPref("textmode.sideTilePaletteVisible", "yes");
      g_app.setPref("textmode.tilePaletteVisible", "no");

      g_app.setPref("textmode.bottomBlockPaletteVisible", "no");
      g_app.setPref("textmode.sideBlockPaletteVisible", "no");
    }

    var sideTilePaletteVisible = g_app.getPref("textmode.sideTilePaletteVisible") == "yes";
    /*
    if(newLayout) {
      sideTilePaletteVisible = g_app.getPref("textmode.sideTilePaletteVisible") != "no";
    }
    */
    this.setTilePalettePanelVisible('side', sideTilePaletteVisible);

    var sideBlockPaletteVisible = g_app.getPref("textmode.sideBlockPaletteVisible") == "yes";
    this.setSideBlockPanelVisible(sideBlockPaletteVisible);

    var bottomBlockPaletteVisible = g_app.getPref("textmode.bottomBlockPaletteVisible") == "yes";
    this.setBottomBlockPanelVisible(bottomBlockPaletteVisible);


    var tilePaletteVisible = g_app.getPref("textmode.tilePaletteVisible") != "no";
    /*
    if(newLayout) {
      tilePaletteVisible = g_app.getPref("textmode.tilePaletteVisible") == "yes";
    }
    */
    this.setTilePalettePanelVisible('bottom', tilePaletteVisible);

    if(layersPanelVisible) {
      if(colorPaletteVisible && sideTilePaletteVisible) {
        
        UI('textModeEastPanel').resizeThePanel({panel: 'north', size: layersPanelSize }); 
      }
    }

    if(colorPaletteVisible) {
      if(layersPanelVisible || sideTilePaletteVisible) {
        //console.log('resize south!!!');
        UI('textModeEastPanel').resizeThePanel({panel: 'south', size: colorPanelSize }); 
      }
    }



    var toolsPanelVisible = g_app.getPref("textmode.toolsPanelVisible") !== 'no';
    this.setToolsVisible(toolsPanelVisible);
  }

  if(mode == 'sprite') {

    var eastPanelSize = g_app.getPref("sprite.eastPanelSize");
    if(typeof eastPanelSize == 'undefined' || eastPanelSize == null || eastPanelSize < 100) {
      eastPanelSize = 340;
    } else {
      eastPanelSize = parseInt(eastPanelSize, 10);
    }
    this.textModeEditorPanel.resizeThePanel({panel: 'east', size: eastPanelSize }); 


    var infoPanelVisible = g_app.getPref("sprite.infoPanelVisible") == "yes";
    this.setInfoPanelVisible(infoPanelVisible);

    var colorPaletteVisible = g_app.getPref("sprite.colorPaletteVisible") != "no";
    var colorPanelSize = g_app.getPref("sprite.colorPanelSize");  
    if(typeof colorPanelSize == 'undefined' || colorPanelSize == null) {
      colorPanelSize = 140;      
    } else {
      colorPanelSize = parseInt(colorPanelSize, 10);
    }
    this.setColorPalettePanelVisible(colorPaletteVisible);
  
    var layersPanelVisible = g_app.getPref("sprite.layersPanelVisible") != "no";
    var layersPanelSize = g_app.getPref("sprite.layersPanelSize");
    if(typeof layersPanelSize == 'undefined' || layersPanelSize == null) {
      layersPanelSize = 200;      
    } else {
      layersPanelSize = parseInt(layersPanelSize, 10);
    }

    this.setLayersPanelVisible(layersPanelVisible);
  
    var sideTilePaletteVisible = false; //g_app.getPref("sprite.sideTilePaletteVisible") == "yes";
    this.setTilePalettePanelVisible('side', sideTilePaletteVisible);


    var tilePaletteVisible = true; //g_app.getPref("sprite.tilePaletteVisible") != "no";
    this.setTilePalettePanelVisible('bottom', tilePaletteVisible);



    var toolsPanelVisible = g_app.getPref("sprite.toolsPanelVisible") !== 'no';
    this.setToolsVisible(toolsPanelVisible);




  }


  
}

// ************************ EAST PANEL ******************************** //
TextModeEditor.prototype.buildEastPanel = function() {
  // ******************* SIDE PANEL ************************ //
  // default is visible
  var colorPaletteVisible = g_app.getPref("textmode.colorPaletteVisible") != "no";
  var layersPanelVisible = g_app.getPref("textmode.layersPanelVisible") != "no";

  // default is not visible
  var sideTilePaletteVisible = g_app.getPref("textmode.sideTilePaletteVisible") == "yes";
  var infoPanelVisible = g_app.getPref("textmode.infoPanelVisible") == "yes";

  var isMobile = UI.isMobile.any();
  this.deviceType = 'desktop';
  if(isMobile) {
    this.deviceType = 'mobile';
  }

  // hide the east panel if on a mobile
  var eastInfoPanelHidden = false;
  if(isMobile) {
    eastInfoPanelHidden = true;
  }


  var eastInfoPanel = UI.create("UI.SplitPanel", { "id": "eastInfoPanel"});

  var eastPanelSize = g_app.getPref("textmode.eastPanelSize");

  if(typeof eastPanelSize == 'undefined' || eastPanelSize == null || eastPanelSize < 100) {
    eastPanelSize = 340;
  } else {
    eastPanelSize = parseInt(eastPanelSize, 10);
  }

  this.textModeEditorPanel.addEast(eastInfoPanel, eastPanelSize, true, eastInfoPanelHidden);
  this.textModeEditorPanel.setMinSize('east', 10);
  this.textModeEditorPanel.on('resizeeast', function(size) {
    var type = 'textmode';
    if(g_app.textModeEditor.graphic.type == 'sprite') {
      type = 'sprite';
    }

    g_app.setPref(type + ".eastPanelSize", size);
  });


  // info panel
  var infoPanel = UI.create("UI.Panel", { "id": "infoPanel" });

  eastInfoPanel.addNorth(infoPanel, 148, true, !infoPanelVisible);
  this.info = new Info();
  this.info.init(this);
  this.info.buildInterface(infoPanel);


  // put rest in center panel
  var eastInfoCenter = UI.create("UI.SplitPanel", { "id": "textModeEastPanel" });
  eastInfoPanel.add(eastInfoCenter);


  // LAYERS PANEL
  var layersPanelSize = g_app.getPref("textmode.layersPanelSize");  
  if(typeof layersPanelSize == 'undefined' || layersPanelSize == null) {
    layersPanelSize = 200;
    
  } else {
    layersPanelSize = parseInt(layersPanelSize, 10);
  }

  


  var layersPanel = UI.create("UI.Panel", { "id": "layersPanel" });
  eastInfoCenter.addNorth(layersPanel, layersPanelSize, true, !layersPanelVisible);
  eastInfoCenter.on('resizenorth', function(size) {
    
    var type = 'textmode';
    if(g_app.textModeEditor.graphic.type == 'sprite') {
      type = 'sprite';
    }

    g_app.setPref(type + ".layersPanelSize", size);
  });


  // TILES PANEL
  var eastTilesSplitPanel = UI.create("UI.SplitPanel", { "id": "eastTilesSplitPanel" });

  var eastTilesPanel = UI.create("UI.Panel", { "id": "eastTilesPanel" });

  this.sideTilePalette = new TilePalette();
  this.sideTilePalette.init(this, { prefix: 'side', blockStacking: 'vertical' });
  this.sideTilePalette.buildInterface(eastTilesPanel);

  eastTilesSplitPanel.add(eastTilesPanel);

  var eastBlockPanel = UI.create("UI.SplitPanel", { "id": "eastBlockPanel" });
  eastTilesSplitPanel.addSouth(eastBlockPanel, 300);

  this.sideBlockPalette = new BlockPalette();
  this.sideBlockPalette.init(this, { "prefix": 'side' });
  this.sideBlockPalette.buildInterface(eastBlockPanel);
  

  this.blockEditor = new BlockEditor();
  this.blockEditor.init(this);


  UI.on('ready', function() {

//    UI('eastTilesPanel').showOnly('sidecharPalette');
  });



  eastInfoCenter.add(eastTilesSplitPanel, !sideTilePaletteVisible);
  eastInfoCenter.centerDefaultHeight = 180;
  //eastInfoCenter.centerVisible = false;


  var colorSplitPanel = UI.create("UI.SplitPanel", { "id": "colorSplitPanel" });
  var colorPanelSize = g_app.getPref("textmode.colorPanelSize");  
  if(typeof colorPanelSize == 'undefined' || colorPanelSize == null) {
    colorPanelSize = 140;
    
  } else {
    colorPanelSize = parseInt(colorPanelSize, 10);
  }
  

  eastInfoCenter.addSouth(colorSplitPanel, colorPanelSize, true, !colorPaletteVisible);  
  eastInfoCenter.on('resizesouth', function(size) {

    var type = 'textmode';
    if(g_app.textModeEditor.graphic.type == 'sprite') {
      type = 'sprite';
    }

    g_app.setPref(type + ".colorPanelSize", size);
  });


  var palettePanel = UI.create("UI.Panel", { "id": "palettePanel" });

  colorSplitPanel.add(palettePanel);

  this.colorPalettePanel = new ColorPalettePanel();
  this.colorPalettePanel.init(this);
  this.colorPalettePanel.buildInterface(palettePanel);

  var colorEditorVisible = false;
  var colorEditPanel = UI.create("UI.Panel", { "id": "colorEditPanel" });
  colorSplitPanel.addSouth(colorEditPanel, 180, false, !colorEditorVisible);
  


  this.colorEditor = new ColorEditor();
  this.colorEditor.init(this);
  this.colorEditor.buildInterface(colorEditPanel);

  var _this = this;
  UI.on('ready', function() {
    
//    _this.setTilePalettePanelVisible('side', false);
//_this.setLayersPanelVisible(true);
  });
}



TextModeEditor.prototype.buildInterface =  function(parentPanel) {
  var _this = this;

  this.desktopToolsWidth = 77;

  var isMobile = UI.isMobile.any();
  this.deviceType = 'desktop';
  if(isMobile) {
    this.deviceType = 'mobile';
  }

  var screenWidth = UI.getScreenWidth();
  var screenHeight = UI.getScreenHeight();


  this.textModeEditorPanel = UI.create("UI.SplitPanel", { "id": "textModeEditor"});
  parentPanel.add(this.textModeEditorPanel);

  var mobileSplitPanel = UI.create("UI.SplitPanel", { "id": "textEditorMobileSplitPanel" });
  this.textModeEditorPanel.add(mobileSplitPanel);

  var textEditorContent = UI.create("UI.SplitPanel", { "id": "textEditorContent"});
  mobileSplitPanel.add(textEditorContent);

  var gridSplitPanel = UI.create("UI.SplitPanel", { "id": "gridSplitPanel" });
  textEditorContent.add(gridSplitPanel);



  var tileEditorPanel = UI.create("UI.Panel");
  gridSplitPanel.addWest(tileEditorPanel, 300, true, true);
  gridSplitPanel.setMinSize('west', 150);

  var showGridInfo = true;
  if(isMobile) {
    showGridInfo = false;
  }

  var gridInfoPanel = UI.create("UI.Panel");
  gridSplitPanel.addSouth(gridInfoPanel, 24, false, !showGridInfo);
  this.gridInfo = new GridInfo();
  this.gridInfo.init(this);
  this.gridInfo.buildInterface(gridInfoPanel)

  this.tileEditor = new TileEditor();

  this.tileEditor.init(this);
  this.tileEditor.buildInterface(tileEditorPanel);

//    var gridPanel = UI.create("UI.Panel", { "id": "gridPanel"} );

  var gridPanel = UI.create("UI.SplitPanel");
  gridSplitPanel.add(gridPanel);


  var gridHolder = UI.create("UI.Panel", { "id": "gridPanel" });
  gridPanel.add(gridHolder);


  // tools panel is loaded by drawtools.js

  var toolsPanelWidth = this.desktopToolsWidth;
  if(isMobile) {
    toolsPanelWidth = 70;// 62;
  }
  var toolsPanel = UI.create("UI.Panel", { "id": " toolsPanel" });

  var mobilePanelVisible = false;
  var desktopPanelVisible = true;
  if(isMobile) {
    mobilePanelVisible = true;
    desktopPanelVisible = false;
  }


  var showPixelTools = false;

  // tool panels on the side
  var toolsDesktopPanel = UI.create("UI.HTMLPanel", { "id": "toolsDesktopPanel", "visible": desktopPanelVisible & !showPixelTools });
  toolsPanel.add(toolsDesktopPanel);


  var pixelToolsDesktopPanel = UI.create("UI.HTMLPanel", { "id": "pixelToolsDesktopPanel", "visible": desktopPanelVisible & showPixelTools });
  toolsPanel.add(pixelToolsDesktopPanel);

//    this.textModeEditorPanel.addWest(toolsPanel, toolsPanelWidth, false, !desktopPanelVisible);

  var toolsPanelVisible = g_app.getPref("textmode.toolsPanelVisible") !== 'no';

  this.textModeEditorPanel.addWest(toolsPanel, toolsPanelWidth, false, !toolsPanelVisible);

  if(toolsPanelVisible) {
    UI.on('ready', function() {
      UI('view-tools').setChecked(true);    
    });
  }


  var toolsMobileSidePanel = UI.create("UI.HTMLPanel", { "id": "toolsMobileSidePanel", visible: mobilePanelVisible & !showPixelTools });
  toolsPanel.add(toolsMobileSidePanel);


  var pixelToolsMobileSidePanel = UI.create("UI.HTMLPanel", { "id": "pixelToolsMobileSidePanel", visible: mobilePanelVisible & showPixelTools });
  toolsPanel.add(pixelToolsMobileSidePanel);


  var framesMobilePanel =  UI.create("UI.Panel", { "id": "framesMobilePanel", "visible": mobilePanelVisible }); 
  var toolsSettingsMobilePanel = UI.create("UI.HTMLPanel", { "id": "toolsSettingsMobileHTMLPanel" });
  var toolsMobileHTMLPanel = UI.create("UI.HTMLPanel", { "id": "toolsMobileHTMLPanel" });




  var mobileBottomSplitPanel = UI.create("UI.SplitPanel");


  mobileBottomSplitPanel.add(framesMobilePanel);

  mobileSplitPanel.addSouth(mobileBottomSplitPanel, 50, false, !mobilePanelVisible);

  var toolSettingsSize = 30;
  if(isMobile) {
    toolSettingsSize = 40;

  }
  var toolSettingsPanel = UI.create("UI.Panel", { "id": "toolSettingsPanel" });
  mobileSplitPanel.addNorth(toolSettingsPanel, toolSettingsSize, false);
  toolSettingsPanel.add(toolsSettingsMobilePanel);
//  mobileSplitPanel.addNorth(toolsSettingsMobilePanel, 40, false, !mobilePanelVisible);


  this.buildEastPanel();


  // default is visible
  var tilePaletteVisible = g_app.getPref("textmode.tilePaletteVisible") != "no";
  
  var bottomToolsPanelHeight = 210;
  if(!tilePaletteVisible) {
    bottomToolsPanelHeight = 0;// 26;
    var framesVisible = true;

    if(framesVisible) {
      bottomToolsPanelHeight += 60;
    }
  }



  var toolsPanelHidden = false;
  if(isMobile) {
    toolsPanelHidden = true;

    bottomToolsPanelHeight = 68;
    if(screenHeight < 700) {
      bottomToolsPanelHeight = 50;
    } 

  }

  var bottomToolsPanel = UI.create("UI.Panel", { "id": "bottomToolsPanel" });

  // tools at the bottom
  var desktopToolsHolder = UI.create("UI.Panel", { visible: !isMobile, "id": "textEditorDesktopToolsHolder" });

  
  var textModeSplitPanel = UI.create("UI.SplitPanel", { "id": "textEditorDesktopTools" });
  desktopToolsHolder.add(textModeSplitPanel);

  var mobileToolsHolder = UI.create("UI.Panel", { visible: isMobile, "id": "textEditorMobileToolsHolder" });

  bottomToolsPanel.add(mobileToolsHolder);
  bottomToolsPanel.add(desktopToolsHolder);

  //the tile palette at the bottom of the screen
  var tilePaletteMobileHolder = UI.create("UI.Panel", { "id": "tilePaletteMobile" });
  mobileToolsHolder.add(tilePaletteMobileHolder);

  this.tilePaletteMobile = new TilePaletteMobile();
  this.tilePaletteMobile.init(this);
  this.tilePaletteMobile.buildInterface(tilePaletteMobileHolder);


  var spriteFramesMobileHolder = UI.create("UI.Panel", { "visible": false, "id": "spriteFramesMobile"});
  mobileToolsHolder.add(spriteFramesMobileHolder);

  this.spriteFramesMobile = new SpriteFrames();
  this.spriteFramesMobile.init(this, "mobile");
  this.spriteFramesMobile.buildInterface(spriteFramesMobileHolder);


  textEditorContent.addSouth(bottomToolsPanel, bottomToolsPanelHeight, !isMobile);//, toolsPanelHidden);    
  if(!tilePaletteVisible) {
    textEditorContent.setResizeVisible('south', false);
  }

  var drawToolsPanel = UI.create("UI.Panel");


  textModeSplitPanel.add(drawToolsPanel);

  this.currentTile = new CurrentTile();
  this.currentTile.init(this);


  this.animationPreview = new AnimationPreview();
  this.animationPreview.init(this);
  
  this.tools = new Tools();
  this.tools.init(this);
  this.tools.buildInterface(drawToolsPanel);


  // desktop frames panel..
  var framesPanel = UI.create("UI.Panel", { "id": "framesPanel"});
  textModeSplitPanel.addSouth(framesPanel, 60, false);

  this.build2dInterface(gridHolder);
  this.build3dInterface(gridHolder);


}




TextModeEditor.prototype.build2dInterface = function(parentPanel) {
  var container = UI.create("UI.Panel", { "id": "grid2d" });
  parentPanel.add(container);

  var gridView2d = UI.create("UI.CanvasPanel", { "id": "gridView2d" });

  container.add(gridView2d);
}

TextModeEditor.prototype.build3dInterface = function(parentPanel) {


  var container = UI.create("UI.Panel", { "id": "grid3d" });
  parentPanel.add(container);

  var splitPanel = UI.create("UI.SplitPanel");
  container.add(splitPanel);

  var gridView3d = UI.create("UI.WebGLPanel", { "id": "gridView3d" });
  splitPanel.add(gridView3d);


  var isMobile = this.deviceType === 'mobile';
  var hiddenPanel = isMobile;

  var eastSplitPanel = UI.create("UI.SplitPanel");
  splitPanel.addEast(eastSplitPanel, 500, !isMobile, hiddenPanel);
  splitPanel.setMinSize('east', 4);


  var gridViewFront = UI.create("UI.SplitPanel", { "id": "gridViewFront" });
  var gridViewFrontWebGL = UI.create("UI.WebGLPanel", { "id": "gridViewFrontWebGL" });
  var html = '<div>';
  html += 'Front';
  html += '<div class="ui-button" id="gridXYBack">&lt;</div>';
  html += '<input class="number" size="2" min="0" value="2" id="gridXYPosition"/>';
  html += '<div class="ui-button" id="gridXYForward">&gt;</div>';
  html += '</div>';

  var gridViewFrontHTML = UI.create("UI.HTMLPanel", { "html": html })
  gridViewFront.addSouth(gridViewFrontHTML, 20, false);
  gridViewFront.add(gridViewFrontWebGL);

  eastSplitPanel.addNorth(gridViewFront, 200, !isMobile, hiddenPanel);
  eastSplitPanel.setMinSize('north', 20);


  var gridViewTop = UI.create("UI.SplitPanel", { "id": "gridViewTop" });
  var gridViewTopWebGL = UI.create("UI.WebGLPanel", { "id": "gridViewTopWebGL" });
  html = '<div>';
  html += 'Top';
  html += '<div class="ui-button" id="gridXZDown">&lt;</div>';
  html += '<input class="number" size="2" min="0" value="2" id="gridXZPosition"/>';
  html += '<div class="ui-button" id="gridXZUp">&gt;</div>';
  html += '</div>';

  var gridViewTopHTML = UI.create("UI.HTMLPanel", { "html": html });
  gridViewTop.addSouth(gridViewTopHTML, 20, false);
  gridViewTop.add(gridViewTopWebGL);

  eastSplitPanel.add(gridViewTop);

  if(isMobile) {
//      gridViewFront.setEnabled(false);
//      gridViewTop.setEnabled(false);
  }

  var _this = this;
  UI.on('ready', function() {
    _this.initGrid3dControls();
  });

}


//********************************** EAST PANEL **************************************/

TextModeEditor.prototype.updateEastInfoPanel = function() {
  var oneVisible = false;

  /*
  if(this.getInfoPanelVisible()) {
    oneVisible = true;
    UI('view-infopanel').setChecked(true);
  } else {
    UI('view-infopanel').setChecked(false);
  }
  */

  if(this.getLayersPanelVisible()) {
    oneVisible = true;
    UI('view-layerspanel').setChecked(true);
  } else {
    UI('view-layerspanel').setChecked(false);
  }

  var tileSplitPanelVisible = false;

  if(this.getTilePalettePanelVisible('side')) {
    oneVisible = true;
    tileSplitPanelVisible = true;
    UI('view-tilepalettepanelside').setChecked(true);
  } else {
    UI('view-tilepalettepanelside').setChecked(false);
  }

  if(this.getSideBlockPanelVisible()) {
    oneVisible = true;
    tileSplitPanelVisible = true;
    UI('view-metatilepalettepanelside').setChecked(true);
  } else {
    UI('view-metatilepalettepanelside').setChecked(false);
  }

  // set the center of east visible if either tile or meta tiles is visible
  UI('textModeEastPanel').setPanelVisible('center', tileSplitPanelVisible, 300, true);    

  if(this.getColorPalettePanelVisible()) {
    oneVisible = true;
    UI('view-palettepanel').setChecked(true);
  } else {
    UI('view-palettepanel').setChecked(false);
  }

  if(oneVisible) {
    this.textModeEditorPanel.setPanelVisible('east', true);
  } else {
    this.textModeEditorPanel.setPanelVisible('east', false);
  }

}


// INFO PANEL VISIBLE
TextModeEditor.prototype.setInfoPanelVisible = function(visible) {
  if(visible) {
    this.textModeEditorPanel.setPanelVisible('east', true);
  }

  UI('eastInfoPanel').setPanelVisible('north', visible);
  //UI('view-infopanel').setChecked(visible);

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }

  g_app.setPref(type + ".infoPanelVisible", visible ? "yes": "no");
  this.updateEastInfoPanel();
}

TextModeEditor.prototype.getInfoPanelVisible = function() {
  return UI('eastInfoPanel').getPanelVisible('north');
}


// LAYERS PANEL VISIBLE
TextModeEditor.prototype.setLayersPanelVisible = function(visible) {

  if(visible) {
    this.textModeEditorPanel.setPanelVisible('east', true);
  }
  
  UI('textModeEastPanel').setPanelVisible('north', visible, 180, true);

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }

  g_app.setPref(type + ".layersPanelVisible", visible ? "yes": "no");

  //UI('eastInfoPanel').setPanelVisible('center', visible);

  UI('view-layerspanel').setChecked(visible);
  this.updateEastInfoPanel();
}

TextModeEditor.prototype.getLayersPanelVisible = function() {
  return UI('textModeEastPanel').getPanelVisible('north');
}


// BLOCKS PANEL VISIBLE
TextModeEditor.prototype.setSideBlockPanelVisible = function(visible) {
  if(!this.textModeEditorPanel.getPanelVisible('east')) {
    UI('textModeEastPanel').setPanelVisible('center', true, 300, true);   
    this.textModeEditorPanel.setPanelVisible('east', true, 300, true);

  }  

//  UI('eastTilesSplitPanel').setPanelVisible('center', visible, 300, true);

  UI('eastTilesSplitPanel').setPanelVisible('south', visible, 300, true);

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }

  g_app.setPref(type + ".sideBlockPaletteVisible", visible ? "yes": "no");


  
  this.updateEastInfoPanel();  
}

TextModeEditor.prototype.getSideBlockPanelVisible = function() {
  return UI('eastTilesSplitPanel').getPanelVisible('south');
}


// BLOCKS PANEL VISIBLE
TextModeEditor.prototype.setBottomBlockPanelVisible = function(visible) {
  //UI('eastTilesSplitPanel').setPanelVisible('south', visible, 300, true);

  UI('tilePaletteSplitPanel').setPanelVisible('east', visible, 300, true);

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }

  g_app.setPref(type + ".bottomBlockPaletteVisible", visible ? "yes": "no");
  this.updateBottomPanel();
}

TextModeEditor.prototype.getBottomBlockPanelVisible = function() {
  //return UI('eastTilesSplitPanel').getPanelVisible('south');
  return UI('tilePaletteSplitPanel').getPanelVisible('east');

}


// TILES PANEL VISIBLE
TextModeEditor.prototype.setTilePalettePanelVisible = function(paneltype, visible) {


  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }


  if(paneltype == 'side') {
//    UI('textModeEastPanel').setPanelVisible('center', visible, 300, true);
    UI('eastTilesSplitPanel').setPanelVisible('center', visible, 300, true);
    g_app.setPref(type + ".sideTilePaletteVisible", visible ? "yes": "no");

    this.updateEastInfoPanel();
  } else {


    UI('tilePaletteSplitPanel').setPanelVisible('center', visible, 300, true);
    g_app.setPref(type + ".tilePaletteVisible", visible ? "yes": "no");
    this.updateBottomPanel();
  }
}


TextModeEditor.prototype.getTilePalettePanelVisible = function(type) {
  if(type == 'side') {
    return UI('eastTilesSplitPanel').getPanelVisible('center');
  } else {
    //return this.bottomTilePaletteVisible;
    return UI('tilePaletteSplitPanel').getPanelVisible('center');
  }
}




TextModeEditor.prototype.updateBottomPanel = function() {
//  getBottomBlockPanelVisible
  var oneVisible = false;

  if(this.getTilePalettePanelVisible('bottom')) {
    oneVisible = true;
    UI('view-tilepalettepanelbottom').setChecked(true);
  } else {
    UI('view-tilepalettepanelbottom').setChecked(false);

  }

  if(this.getBottomBlockPanelVisible()) {
    oneVisible = true;
    UI('view-metatilepalettepanelbottom').setChecked(true);
  } else {
    UI('view-metatilepalettepanelbottom').setChecked(false);
  }




  // 26 is height of current tool controls
  var bottomPanelHeight = 280;
//  g_app.setPref(type + ".tilePaletteVisible", oneVisible ? "yes": "no");

  if(!oneVisible) {
    bottomPanelHeight = 0;//26;
    var framesVisible = true;

    if(framesVisible) {
      bottomPanelHeight += 60;
    }

    UI('textEditorContent').setResizeVisible('south', false);
  } else {
    UI('textEditorContent').setResizeVisible('south', true);
  }

  // hide the bottom tile palette
  UI('textEditorContent').resizeThePanel({panel: 'south', size: bottomPanelHeight });

  // need to show/hide the resize handle depending on visible


  this.bottomTilePaletteVisible = oneVisible;

  // resize current tile
  var currentTileSize = 180;
  if(oneVisible === false) {
    currentTileSize = 28;
  }
  UI('textModeBottomPanel').resizeThePanel({ panel: 'west', size: currentTileSize });  



}


TextModeEditor.prototype.setColorPalettePanelVisible = function(visible) {
  if(visible) {
    this.textModeEditorPanel.setPanelVisible('east', true);
  } else {
    if(this.colorEditor.getVisible()) {
      this.colorEditor.setVisible(false);
    }
  }

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }
  g_app.setPref(type + ".colorPaletteVisible", visible ? "yes": "no");

  UI('textModeEastPanel').setPanelVisible('south', visible, 150, true);
  UI('view-palettepanel').setChecked(visible);
  this.updateEastInfoPanel();
}

TextModeEditor.prototype.getColorPalettePanelVisible = function() {
  return UI('textModeEastPanel').getPanelVisible('south');
}

TextModeEditor.prototype.getToolsVisible = function(visible) {
  return this.textModeEditorPanel.getPanelVisible('west');
}


TextModeEditor.prototype.setToolsVisible = function(visible) {
//  console.error('set vis =' + visible );
  this.textModeEditorPanel.setPanelVisible('west', visible);

  if(visible) {
    $('#tileToolsOpenButtonHolder').hide();

    $('#drawToolSettings-cellColor').hide();
    $('#drawToolSettings-frameColors').hide();

  } else {
    $('#tileToolsOpenButtonHolder').show();
    $('#drawToolSettings-cellColor').show();
    $('#drawToolSettings-frameColors').show();

  }

  var type = 'textmode';
  if(g_app.textModeEditor.graphic.type == 'sprite') {
    type = 'sprite';
  }
  g_app.setPref(type + ".toolsPanelVisible", visible ? "yes": "no");
  UI('view-tools').setChecked(visible);

}

TextModeEditor.prototype.setLayout = function(layout) {  
  return;
  if(layout == 'bottom') {

    // hide the side tile palette
    UI('eastToolPanel').setPanelVisible('north', false);
    
    UI('textEditorContent').resizeThePanel({panel: 'south', size: 280 });
    // show the resize handle

    UI('textModeBottomPanel').resizeThePanel({ panel: 'west', size: 200 });
    // need to show the resize handle

  }

  if(layout == 'side') {
    // show the side tile palette
    UI('eastToolPanel').setPanelVisible('north', true);


    // 26 is height of current tool controls
    var bottomPanelHeight = 26;
    var framesVisible = true;

    if(framesVisible) {
      bottomPanelHeight += 60;
    }

    // hide the bottom tile palette
    UI('textEditorContent').resizeThePanel({panel: 'south', size: bottomPanelHeight });
    // need to hide the resize handle


    // current tile
    UI('textModeBottomPanel').resizeThePanel({ panel: 'west', size: 28 });
    // need to hide the resize handle
  }

  if(layout == 'minimal') {
    // need to hide the east panel
    this.setInfoPanelVisible(false);
    this.setLayersPanelVisible(false);
    this.setColorPalettePanelVisible(false);



    // 26 is height of current tool controls
    var bottomPanelHeight = 26;
    var framesVisible = true;

    if(framesVisible) {
      bottomPanelHeight += 60;
    }
    
    // hide the bottom tile palette
    UI('textEditorContent').resizeThePanel({panel: 'south', size: bottomPanelHeight });
    // need to hide the resize handle


    // current tile
    UI('textModeBottomPanel').resizeThePanel({ panel: 'west', size: 28 });
    // need to hide the resize handle

  }

  if(layout == 'custom') {

  }
}

TextModeEditor.prototype.startBlockTool = function() {
  if(this.getSideBlockPanelVisible() || this.getBottomBlockPanelVisible()) {
    return;
  }

  // need to show a block panel
  if(this.getTilePalettePanelVisible('side')) {
    var tilePaletteHeight = UI('eastTilesSplitPanel').getPanelHeight('center');
    var blockPanelSize = Math.floor(tilePaletteHeight / 2);
    this.setSideBlockPanelVisible(true);
    UI('eastTilesSplitPanel').resizeThePanel({
      "panel": "south",
      "size": blockPanelSize
    });
  } else if(this.getTilePalettePanelVisible('bottom')) {
//    UI('tilePaletteSplitPanel').getPanelVisible('center');    
    var tilePaletteWidth = UI('tilePaletteSplitPanel').getPanelWidth('center');
    this.setBottomBlockPanelVisible(true);

    var blockPanelSize = 300;
    if(tilePaletteWidth > 1000) {
      blockPanelSize = Math.floor(tilePaletteWidth / 2);
    }

    UI('tilePaletteSplitPanel').resizeThePanel({
      "panel": "east",
      "size": blockPanelSize
    });

  }
}

// *******************  SWITCH MOBILE / DESKTOP LAYOUT ******************* //
TextModeEditor.prototype.setDeviceType = function(deviceType) {
  var mobileToolsPanelWidth = 80; // 62;
  this.deviceType = deviceType;

  if(deviceType == 'mobile') {
    this.textModeEditorPanel.setPanelVisible('east', false);
    UI('textEditorContent').setPanelVisible('south', false);
    UI('textEditorContent').resizeThePanel({panel: 'south', size: 0 });

    UI('framesMobilePanel').setVisible(true);

    UI('toolsMobileSidePanel').setVisible(true & (this.editorMode != 'pixel'));
    UI('toolsDesktopPanel').setVisible(false);
    UI('pixelToolsMobileSidePanel').setVisible(true & (this.editorMode == 'pixel'));
    UI('pixelToolsDesktopPanel').setVisible(false);

    // panel holding the tools
    UI('textModeEditor').resizeThePanel({panel: 'west', size: 62});

    UI('textEditorMobileSplitPanel').setPanelVisible('south', true);
    UI('textEditorMobileSplitPanel').resizeThePanel({ panel: 'south', size: 50 });

    UI('textEditorMobileSplitPanel').setPanelVisible('north', true);
    UI('textEditorMobileSplitPanel').resizeThePanel({ panel: 'north', size: 50 });

  } 

  if(deviceType == 'desktop') {
    this.textModeEditorPanel.setPanelVisible('east', true);
    UI('textEditorContent').setPanelVisible('south', true);
    UI('textEditorContent').resizeThePanel({panel: 'south', size: 260 });

    UI('framesMobilePanel').setVisible(false);

    UI('toolsMobileSidePanel').setVisible(false);
    UI('toolsDesktopPanel').setVisible(true & (this.editorMode != 'pixel'));

    UI('pixelToolsMobileSidePanel').setVisible(false);
    UI('pixelToolsDesktopPanel').setVisible(true & (this.editorMode == 'pixel'));

    // panel holding the tools
    UI('textModeEditor').resizeThePanel({panel: 'west', size: this.desktopToolsSize});

    UI('textEditorMobileSplitPanel').setPanelVisible('south', false);
    UI('textEditorMobileSplitPanel').resizeThePanel({ panel: 'south', size: 0 });

    UI('textEditorMobileSplitPanel').setPanelVisible('north', false);
    UI('textEditorMobileSplitPanel').resizeThePanel({ panel: 'north', size: 0 });

/*      $('.drawTool').css('width', '26px');
    $('.drawTool').css('height', '26px');
*/
  }

  this.currentTile.setDeviceType(deviceType);

  if(deviceType == 'desktop') {

  }
}

