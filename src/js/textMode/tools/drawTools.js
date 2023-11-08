var DrawTools = function() {
  this.editor = null;

  // current tool
  this.tool = 'pen';

  // the tools..
  this.shapes = null;
  this.typing = null;
  this.pixelCharacterDraw = null;
  this.lineSegmentDraw = null;
  this.pixelDraw = null;
  this.invertTool = null;
  this.cornersTool = null;

  this.fill = null;
  this.select = null;
  this.pixelSelect = null;

  // what the tools affect
  this.drawCharacter = true;
  this.drawColor = true;
  this.drawBGColor = true;

  this.drawToolsPopup = null;


  this.mirrorH = false;
  this.mirrorHX = 20;

  this.mirrorV = false;
  this.mirrorVY = false;


  // save the current tiles when switching to pixel draw mode.
  this.saveCurrentTiles = false;

  this.debugVisible = false;
}

DrawTools.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.shapes = new Shapes();
    this.shapes.init(editor);

    this.typing = new Typing();
    this.typing.init(editor);

    this.pixelCharacterDraw = new PixelCharacterDraw();
    this.pixelCharacterDraw.init(editor);


    this.lineSegmentDraw = new LineSegmentDraw();
    this.lineSegmentDraw.init(editor);

    this.cornersTool = new CornersTool();
    this.cornersTool.init(editor);

    this.invertTool = new InvertTool();
    this.invertTool.init(editor);

    this.pixelDraw = new PixelDraw();
    this.pixelDraw.init(editor);

    this.fill = new Fill();
    this.fill.init(editor);

    this.select = new Select();
    this.select.init(editor);

    this.pixelSelect = new PixelSelect();
    this.pixelSelect.init(editor);
  },

  initToolSettingEvents: function() {
    var _this = this;

    this.initToolSettingsCurrentTileEvents();

    var toolsPanelVisible = g_app.getPref("textmode.toolsPanelVisible") !== 'no';
    if(toolsPanelVisible) {
      $('#tileToolsOpenButtonHolder').hide();
    }

    $('#tileFlipH').on('click', function() {
      _this.editor.currentTile.flipH2d();
    });

    $('#tileFlipV').on('click', function() {
      _this.editor.currentTile.flipV2d();
    });

    $('#tileRotate').on('click', function() {
      _this.editor.currentTile.rotate2d();
    });


    $('#currentDrawToolHolder').on('click', function() {
      _this.showDrawToolsPopup();
    });

    $('#tileToolsOpenButton').on('click', function() {
      _this.editor.setToolsVisible(true);
    });

    $('input[name=drawChanges]').on('click', function(event) {
      _this.setDrawMode();
    });

    $('input[name=drawMirror]').on('click', function(event) {
      _this.setDrawMode();
    });

    $('#spriteFlipH').on('click', function() {
      _this.pixelDraw.flipH();

    });
    $('#spriteFlipV').on('click', function() {
      _this.pixelDraw.flipV();
    });

    $('#spriteRotate').on('click', function() {
      _this.pixelDraw.rotate();
    });

    $('#spriteInvert').on('click', function() {
      _this.pixelDraw.invert();
    });


    this.pixelDraw.c64MulticolorTypeControl = new C64MulticolorTypeControl();
    this.pixelDraw.c64MulticolorTypeControl.init(_this.editor, { "elementId": "pixelToolSettings-c64multicolor" })

    $('input[name=charPixelToolMode]').on('click', function(event) {
      _this.pixelCharacterDraw.setMode($('input[name=charPixelToolMode]:checked').val());
    });


    $('input[name=lineSegmentToolMode]').on('click', function(event) {
      _this.lineSegmentDraw.setMode($('input[name=lineSegmentToolMode]:checked').val());
    });

    $('#lineSegmentToolInvert').on('click', function(event) {
      _this.lineSegmentDraw.setInvert($(this).is(':checked'));
    });


  },

  showDrawToolsPopup: function() {
    var x = 110;
    var y = 60;
 
    if(g_app.isMobile()) {
      var holderOffset = $('#mobileMenuCurrentTools').offset();
      x = holderOffset.left - 10;// - 8;
      y = holderOffset.top + 42;
    } else {
      var holderOffset = $('#currentDrawToolHolder').offset();
      x = holderOffset.left - 8;
      y = holderOffset.top + 30;
    }

    
    var character = 0;
    var color = 0;
    var callback = function(result) {
    }

    if(this.drawToolsPopup == null) {
      this.drawToolsPopup = new DrawToolsPopup();

      var _this = this;
      this.drawToolsPopup.init(this.editor, function() {
        // can't show it until the html has loaded..
        _this.drawToolsPopup.show(x, y, character, color, callback);
      });
    } else {
      this.drawToolsPopup.show(x, y, character, color, callback);
    }

  },

  initMobileToolSettingEvents: function() {
    var _this = this;
    /*
    $('input[name=drawChanges]').on('click', function(event) {
      _this.setDrawMode();
    });
    */

    this.pixelDraw.c64MulticolorTypeMobileControl = new C64MulticolorTypeControl();
    this.pixelDraw.c64MulticolorTypeMobileControl.init(_this.editor, { "elementId": "pixelToolSettingsMobile-c64multicolor" })
 
    $('input[name=drawChangesMobile]').on('click', function(event) {
      _this.setDrawMode();
    });

    $('input[name=drawMirrorMobile]').on('click', function(event) {
      _this.setDrawMode();
    });



    $('#pixelToolSettingsMobile-monochrome .mobileRadio').on('click', function() {

      var parent = $(this).parent();
      parent.children('.mobileRadio').removeClass('mobileRadioSelected');
      $(this).addClass('mobileRadioSelected');
      var value = $(this).attr('data-value');
      _this.pixelDraw.setTool(value);
    });

    $('#selectMobileDrawUsingSelection').on('click', function() {
      _this.select.selectionToPen();
      _this.select.unselectAll();
      _this.setDrawTool('pen');
    });

    $('#selectMobileDeselect').on('click', function() {
      _this.select.unselectAll();
    });

    $('#selectMobileClear').on('click', function() {
      _this.select.clear();
    });

    $('#selectMobileFlipHButton').on('click', function() {
      _this.select.flipH();
    });


    $('#selectMobileFlipVButton').on('click', function() {
      _this.select.flipV()
    });

    $('#selectMobileMoveButton').on('click', function() {
      _this.setDrawTool('move');
    });



    $('#pixelselectMobileDeselect').on('click', function() {
      _this.pixelSelect.unselectAll();
    });

    $('#pixelselectMobileClear').on('click', function() {
      _this.pixelSelect.clear();
    });

    $('#pixelselectMobileCut').on('click', function() {
      _this.pixelSelect.cut();
    });

    $('#pixelselectMobileCopy').on('click', function() {
      _this.pixelSelect.copy();
    });

    $('#pixelselectMobilePaste').on('click', function() {
      _this.pixelSelect.paste();
    });

    $('#pixelselectMobileFlipV').on('click', function() {
      _this.pixelDraw.flipV();
    });

    $('#pixelselectMobileFlipH').on('click', function() {
      _this.pixelDraw.flipH();
    });

    $('#pixelDrawShapeFillMobile').on('click', function() {
      _this.pixelDraw.setFillShape($(this).is(':checked'));
    });


  },

  getTools: function() {
    this.toolMap = {
      "pen": { label: TextStore.get("Pencil"), "isMobileTool": true, "icon": 'icons/pen@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', key: keys.textMode.toolsPencil.key },
      "erase": { label: TextStore.get("Blank"), "isMobileTool": true, "icon": 'icons/erase@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-250-eraser.svg', "key": keys.textMode.toolsErase.key },
      "fill": { label: TextStore.get("Fill Bucket"), "isMobileTool": true, "icon": 'icons/fill@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-245-fill.svg', "key": keys.textMode.toolsBucket.key },
      "eyedropper": { label: TextStore.get("Eyedropper"), "isMobileTool": true, "icon": 'icons/eyedropper@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-91-eyedropper.svg', "key": keys.textMode.toolsEyedropper.key },
      "line": { label: TextStore.get("Line"), "isMobileTool": true, "icon": 'icons/line@2x.png', "mobileIcon": 'icons/svg/slash.svg', "key": keys.textMode.toolsShape.key },
      "rect": { label: TextStore.get("Rect"), "isMobileTool": true, "icon": 'icons/rect@2x.png', "mobileIcon": 'icons/svg/square.svg', "key": keys.textMode.toolsShape.key },
      "oval": { label: TextStore.get("Oval"), "isMobileTool": true, "icon": 'icons/oval@2x.png', "mobileIcon": 'icons/svg/circle.svg', "key": keys.textMode.toolsShape.key },
      "select": { label: TextStore.get("Marquee"), "isMobileTool": true, "icon": 'icons/select@2x.png', "mobileIcon": 'icons/select@2x.png', "key": keys.textMode.toolsMarquee.key },
      "charpixel": { label: TextStore.get("Char Pixel"), "isMobileTool": true, "icon": 'icons/charpixel@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsCharPixel.key },
      "linesegment": { label: TextStore.get("Line Segment"), "isMobileTool": false, "icon": 'icons/linesegment@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": false },

//        "invert": { label: TextStore.get("Invert"), "icon": 'icons/linesegment@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": false },
//        "corners": { label: TextStore.get("Corners"), "icon": 'icons/linesegment@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": false },

      // icons/linesegment@2x.png      
      "type": { label: TextStore.get("Type"), "isMobileTool": false, "icon": 'icons/type@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsType.key },
      "pixel": { label: TextStore.get("Pixel"), "isMobileTool": true, "icon": 'icons/pixel@2x.png', "mobileIcon": 'icons/pixel.png', "key": keys.textMode.toolsPixel.key },
      "block": { label: TextStore.get("Meta Tile"), "isMobileTool": true, "icon": 'icons/block@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsBlock.key },
      "zoom": { label: TextStore.get("Zoom"), "isMobileTool": false, "icon": 'icons/zoom@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsZoom.key },
      "hand": { label: TextStore.get("Hand"), "isMobileTool": true, "icon": 'icons/hand@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-457-hand-open.svg', "key": keys.textMode.toolsHand.key },
      "move": { label: TextStore.get("Move"), "isMobileTool": true, "icon": 'icons/move@2x.png', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsMove.key },
      "rotate": { label: TextStore.get("Rotate"), "isMobileTool": false, "icon": '', "mobileIcon": 'icons/svg/glyphicons-basic-494-rotate-horizontal.svg' },
      "pixelselect": { label: TextStore.get("Marquee"), "isMobileTool": false, "icon": '', "mobileIcon": 'icons/select@2x.png', "key": false },
      "pixelzoom": { label: TextStore.get("Zoom"), "isMobileTool": false, "icon": '', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsZoom.key },
      "pixelhand": { label: TextStore.get("Hand"), "isMobileTool": false, "icon": '', "mobileIcon": 'icons/svg/glyphicons-basic-457-hand-open.svg', "key": keys.textMode.toolsHand.key },
      "pixelmove": { label: TextStore.get("Move"), "isMobileTool": false, "icon": '', "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsMove.key }
    };


    return this.toolMap;
  },



  getToolLabel: function(id) {

    this.getTools();

    if(this.toolMap.hasOwnProperty(id)) {
      var label = this.toolMap[id].label;
      if(this.toolMap[id].key !== false) {
        label += " (" + this.toolMap[id].key + ")";

      }
      return label;
    }
    return id;

  },
  
  initMobileSidePanelContent: function() {
    var canvasId = 'toolsMobileCurrentTile';
    var characterCanvas = document.getElementById(canvasId);

    var width = 60;
    var height = 60;
    var scale = Math.floor(UI.devicePixelRatio);

    characterCanvas.width = width * scale;
    characterCanvas.height = height * scale;

    characterCanvas.style.width = width + 'px';
    characterCanvas.style.height = height + 'px';

    var _this = this;
    characterCanvas.addEventListener("click", function(event){
      _this.editor.currentTile.chooseCharacterMobile(event);
    }, false);

    $('#' + canvasId).on('contextmenu', function(event) {
      var characters = _this.editor.currentTile.getCharacters();
      if(characters.length > 0 && characters[0].length > 0) {
        _this.editor.showTileEditor({ character: characters[0][0]});
      }
      event.preventDefault();
    });

    this.checkMobileToolScroll();
  },

  initMobileSidePanelEvents: function() {
    var _this = this;

    $('.drawToolMobileSide').on('click', function() {
      var type = $(this).attr('data-type');
      _this.setDrawTool(type);
    });

    $('.nesPalettePickerMobile').on('click', function(event) {

      var args = {};
      _this.editor.colorPaletteManager.colorSubPalettes.showMobilePicker(args);
    });


    $('.foregroundColorMobile').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.currentTile.setColor(color.color);
      }

      args.mode = _this.editor.getScreenMode();
      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellcolor';


      _this.editor.colorPaletteManager.showColorPickerMobile(args);

    });

    $('.cellBackgroundColorMobile').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.currentTile.setColor(color.color);
      }

      args.mode = _this.editor.getScreenMode();
      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellbg';


      _this.editor.colorPaletteManager.showColorPickerMobile(args);

    });    

    $('.backgroundColorMobile').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.setBackgroundColor(color.color);
      }


      args.mode = _this.editor.getScreenMode();
      args.currentColor = _this.editor.graphic.getBackgroundColor();
      args.type = 'background';


      _this.editor.colorPaletteManager.showColorPickerMobile(args);

    });

    $('#toolIconHolderMobile').on('scroll', function(event) {
      _this.checkMobileToolScroll();
    });

    $('#drawToolsMobileSide').on('contextmenu', function(event) {
      event.preventDefault();
    });

    $('#layersButtonMobile').on('click', function() {
      _this.editor.layers.showMobileLayerChooser();

    });
    

  },

  initMobileEvents: function() {
    var _this = this;

    $('.drawToolMobile').on('click', function() {
      var type = $(this).attr('data-type');
      _this.setDrawTool(type);
    });
  },

  checkMobileToolScroll: function() {
    var holderHeight = $('#toolIconHolderMobile').height();
    var toolsHeight = $('#toolIconsMobile').height();
    var position = $('#toolIconsMobile').position();


    if(typeof position == 'undefined') {
      return;
    }
    var top = position.top;

    if(top < -2) {
      // can scroll down
      $('#toolIconsScrollTop').show();
    } else {
      $('#toolIconsScrollTop').hide();
    }

    if(top + toolsHeight - 2 > holderHeight) {
      // can scroll up
      $('#toolIconsScrollBottom').show();

    } else {
      $('#toolIconsScrollBottom').hide();

    }
  },

  initEvents: function() {
    var _this = this;

    $('#tileToolsCloseButton').on('click', function() {
      _this.editor.setToolsVisible(false);
    });

    $('.drawTool').on('click', function() {
      var id = $(this).attr('id');
      var dashPos = id.lastIndexOf('_');
      id = id.substring(dashPos + 1);
      _this.setDrawTool(id);
    });

    $('.drawTool').on('mouseover', function() {
      var id = $(this).attr('id');
      
      id = id.substring('drawTool_'.length);
      var label = _this.getToolLabel(id);
      $('#currentTool').html(label);
    });

    $('.drawTool').on('mouseleave', function() {
      var label = _this.getToolLabel(_this.tool);
      $('#currentTool').html(label);
    });

    $('#switchColors').on('click', function(event) {
      _this.editor.currentTile.switchColors();

    });

    $('#background3dColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        console.log('colour chosen:' + color);
        _this.editor.grid3d.setBackgroundColor(color);
//        _this.editor.currentTile.setColor(color);
      }

      args.mode = _this.editor.getScreenMode();
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellcolor';
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });

    $('.foregroundColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.currentTile.setColor(color);
      }


      args.mode = _this.editor.getScreenMode();
      var x = event.pageX;
      var y = event.pageY;

      var offset = $(this).offset();
      x = offset.left;
      y = offset.top;

      var popupX = $(this).attr('data-popupx');
      if(typeof popupX != 'undefined') {
        x = parseInt(popupX, 10);
      }
      var popupY = $(this).attr('data-popupy');
      if(typeof popupY != 'undefined') {
        y = parseInt(popupY, 10);
      }

      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellcolor';
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

    $('.cellBackgroundColor').on('click', function(event) {
      console.log('colour picked!');
      
      var args = {};
      args.colorPickedCallback = function(color) {
        // if in c64 ecm mode, this will be the ecm index.
        _this.editor.currentTile.setBGColor(color);
      }

      args.c64ECMColorSetCallback = function(index, color) {
        _this.editor.setC64ECMColor(index, color);
        _this.editor.currentTile.setBGColor(index, { force: true });
      }
//      args.hasNone = true;
      args.isCellBG = true; 
      args.screenMode = _this.editor.getScreenMode();
      
      var x = event.pageX;
      var y = event.pageY;

      var offset = $(this).offset();
      x = offset.left;
      y = offset.top;
      
      args.currentColor = _this.editor.currentTile.getBGColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });


    $('.backgroundColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.setBackgroundColor(color);
      }
      var x = event.pageX;
      var y = event.pageY;

      var offset = $(this).offset();
      x = offset.left;
      y = offset.top;


      args.hasNone = true;
      args.currentColor = _this.editor.graphic.getBackgroundColor();
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

    $('.borderColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.setBorderColor(color);
      }
      var x = event.pageX;
      var y = event.pageY;

      var offset = $(this).offset();
      x = offset.left;
      y = offset.top;

      args.hasNone = true;
      args.currentColor = _this.editor.graphic.getBorderColor();

      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

    $('.c64Multi1Color').on('click', function(event) {
      var layer = _this.editor.layers.getSelectedLayerObject();
      if(!layer) {
        return;
      }

      var args = {};
      args.colorPickedCallback = function(color) {
        layer.setC64Multi1Color(color);
      }
      var x = event.pageX;
      var y = event.pageY;


      args.currentColor = layer.getC64Multi1Color();

      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });


    $('.c64Multi2Color').on('click', function(event) {
      var layer = _this.editor.layers.getSelectedLayerObject();
      if(!layer) {
        return;
      }

      var args = {};
      args.colorPickedCallback = function(color) {
        layer.setC64Multi2Color(color);
      }
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = layer.getC64Multi2Color();

      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });


    $('.colorSubPalette').on('click', function(event) {
      var x = event.pageX;
      var y = event.pageY;
      var args = {};
      _this.editor.colorPaletteManager.showColorSubPalettePicker(x, y, args);

    });

    $('.colorSubPaletteColor').on('click', function(event) {
      var paletteIndex = parseInt($(this).attr('data-paletteIndex'));
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.colorPaletteManager.colorSubPalettes.setColor(paletteIndex, color);
      }
      var x = event.pageX;
      var y = event.pageY;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });


    $('#mobileMenuCurrentTools').on('click', function() {
      _this.showDrawToolsPopup();
    });



  },


  setScreenMode: function(screenMode) {

    /*
    if(!g_newSystem) {
      if($('#drawTool_invert') && $('#drawTool_invert').length > 0) {
        $('#drawTool_invert').hide();
        $('#drawTool_corners').hide();
      }
    }
*/

    // colour palette panel
    UI("eastInfoPanel").setPanelVisible("south", true);

    if(g_app.getMode() == '3d') {
      $('#drawTools-frameColors').hide();
      $('#drawTool_charpixel').hide();
      /*
      $('#drawTool_invert').hide();
      $('#drawTool_corners').hide();
      */
     
      $('#drawTool_pixel').hide();
      $('#drawTool_linesegment').hide();
      $('#drawTool_block').hide();
      $('#drawTools-3dBackgroundColor').show();

    } else {
      $('.drawTool').show();

      $('#drawTools-3dBackgroundColor').hide();
      switch(screenMode) {
        case TextModeEditor.Mode.TEXTMODE:
        case TextModeEditor.Mode.C64ECM:
          $('#drawTools-cellBgColor').show();
          $('#drawTools-cellColor').show();

          $('.cellBackgroundColor').show();
          $('#switchColors').show();

          $('#drawTools-c64multicolor').hide();
          $('#drawTools-colorSubPalettes').hide();
          $('#drawTools-frameColors').show();

          $('#pixelToolSettings-multicolor').hide();
          $('#pixelToolSettings-c64multicolor').hide();
          $('#pixelToolSettings-nes').hide();

          $('#pixelToolSettings-colorLabel').hide();

          $('#pixelToolSettingsMobile-c64multicolor').hide();
          
          if(this.editor.getEditorMode() == 'pixel') {
            $('#pixelToolSettingsMobile-monochrome').hide();        
          } else {
            $('#pixelToolSettingsMobile-monochrome').show();        
          }
          $('#pixelToolSettingsMobile-multicolor').hide();        

          $('#cellForegroundColorMobile').show();
          $('#cellForegroundColorMobile').css('width', '34px');
          $('#cellForegroundColorMobile').css('height', '34px');

          $('#cellBackgroundColorMobile').show();


          break;
        case TextModeEditor.Mode.C64STANDARD:
          $('#drawTools-cellBgColor').hide();
          $('#drawTools-cellColor').show();

          $('.cellBackgroundColor').hide();
          $('#switchColors').hide();

          $('#drawTools-c64multicolor').hide();
          $('#drawTools-colorSubPalettes').hide();
          $('#drawTools-frameColors').show();

          $('#pixelToolSettings-multicolor').hide();
          $('#pixelToolSettings-c64multicolor').hide();
          $('#pixelToolSettings-nes').hide();

          $('#pixelToolSettings-colorLabel').hide();

          $('#pixelToolSettingsMobile-c64multicolor').hide();
          
          if(this.editor.getEditorMode() == 'pixel') {
            $('#pixelToolSettingsMobile-monochrome').hide();        
          } else {
            $('#pixelToolSettingsMobile-monochrome').show();        
          }
          $('#pixelToolSettingsMobile-multicolor').hide();        

          $('#cellForegroundColorMobile').show();
          $('#cellForegroundColorMobile').css('width', '34px');
          $('#cellForegroundColorMobile').css('height', '34px');

          $('#cellBackgroundColorMobile').show();
          break;
        case TextModeEditor.Mode.C64MULTICOLOR:
          $('#drawTools-cellBgColor').hide();

          $('#drawTools-cellColor').show();
          $('.cellBackgroundColor').hide();
          $('#switchColors').hide();
          $('#drawTools-c64multicolor').show();
          $('#drawTools-colorSubPalettes').hide();
          $('#drawTools-frameColors').show();

          $('#pixelToolSettings-multicolor').hide();
          $('#pixelToolSettings-nes').hide();
          $('#pixelToolSettings-c64multicolor').show();

          $('#pixelToolSettings-colorLabel').show();

          $('#pixelToolSettingsMobile-c64multicolor').show();
          $('#pixelToolSettingsMobile-monochrome').hide();        
          $('#pixelToolSettingsMobile-multicolor').hide();        

          $('#cellForegroundColorMobile').show();
          $('#cellForegroundColorMobile').css('width', '42px');
          $('#cellForegroundColorMobile').css('height', '42px');
          $('#cellBackgroundColorMobile').hide();


          break;
        case TextModeEditor.Mode.NES:
          $('#drawTools-cellColor').hide();
          $('#drawTools-cellBgColor').hide();
          $('#drawTools-c64multicolor').hide();
          $('#drawTools-frameColors').hide();
          $('#drawTools-colorSubPalettes').show();
          
          $('#pixelToolSettings-multicolor').hide();
          $('#pixelToolSettings-c64multicolor').hide();
          $('#pixelToolSettings-nes').show();

          $('#pixelToolSettingsMobile-c64multicolor').hide();
          $('#pixelToolSettingsMobile-monochrome').hide();        
          $('#pixelToolSettingsMobile-multicolor').hide();        

          break;

        case TextModeEditor.Mode.VECTOR:
          $('#drawTool_linesegment').hide();
          $('#drawTool_pixel').hide();
          $('#drawTool_charpixel').hide();
    
          break;

        case TextModeEditor.Mode.INDEXED:
        case TextModeEditor.Mode.RGB:
          $('#drawTools-cellBgColor').hide();
          $('#drawTools-c64multicolor').hide();
          $('#drawTools-colorSubPalettes').hide();
          $('#drawTools-frameColors').hide();

          $('#pixelToolSettings-multicolor').show();
          $('#pixelToolSettings-c64multicolor').hide();
          $('#pixelToolSettings-nes').hide();

          $('#pixelToolSettings-colorLabel').show();

          $('#pixelToolSettingsMobile-c64multicolor').hide();
          $('#pixelToolSettingsMobile-monochrome').hide();        
          $('#pixelToolSettingsMobile-multicolor').show();        

          $('#cellForegroundColorMobile').hide();
          $('#cellBackgroundColorMobile').hide();
          

          // colour palette panel
          if(this.editor.getEditorMode() == 'pixel' || this.tool == 'pixel') {
            UI("eastInfoPanel").setPanelVisible("south", true);
            $('#drawTools-cellColor').show();
            $('#cellForegroundColor').show();
            $('#cellBackgroundColor').hide();
            $('#switchColors').hide();

          } else {
            $('#drawTools-cellColor').hide();

            UI("eastInfoPanel").setPanelVisible("south", false);
          }


          break;
      }

      if(this.editor.getEditorMode() == 'pixel') {
        $('#pixelToolSettings-c64multicolor').hide();
      }
    }
  },

  getToolIconHTML: function(tool) {
    var imageUrl = 'icons/' + tool + '@2x.png';
    return '<img src="' + imageUrl + '" style="width: 20px">';
  },

  setDrawTool: function(tool) {
    if(tool == 'pixel' && this.tool != 'pixel') {
      this.saveCurrentTiles = this.editor.currentTile.getTiles();
    }

    if(this.tool == 'pixel' && tool != 'pixel') {
      if(this.saveCurrentTiles) {
        this.editor.currentTile.setTiles(this.saveCurrentTiles);
      }
    }
    
    this.tool = tool;//$('input[name=drawTool]:checked').val();

    var graphicType = this.editor.graphic.getType();

    this.toolDisplayName = this.getToolLabel(tool);

    $('.toolSettings').hide();
    $('.toolSettingsMobile').hide();


    // this will check if actually in a move
    this.editor.tools.drawTools.select.endPasteDrag();

    // need to clear the highlight character if previous tool was eyedropper
    
    this.editor.tools.drawTools.tilePalette.clearHighlightCharacter();
    this.editor.tools.drawTools.tilePalette.drawTilePalette();

    this.editor.sideTilePalette.clearHighlightCharacter();
    this.editor.sideTilePalette.drawTilePalette();


    if(this.editor.graphic.getType() != 'sprite') {
      if(this.editor.spriteFrames.getVisible()) {
        this.editor.spriteFrames.hide();
      }

      if(g_app.isMobile()) {
        UI('textEditorMobileToolsHolder').showOnly('tilePaletteMobile');            
      }
    }

    switch(tool) {
      case 'pen':
      case 'eyedropper':
      case 'line':
      case 'rect':
      case 'oval':
      case 'erase':
      case 'fill':
        $('#drawToolSettings').show();
        $('#drawToolSettingsMobile').show();
        this.setDrawMode();
        this.editor.currentTile.drawCursor();
        UI('toolControls').showOnly('tilePaletteSplitPanel');

//        UI('eastTilesPanel').showOnly('sidecharPalette');

        UI('previewPanel').showOnly('currentTilePanel');
        this.editor.animationPreview.hide();        
      break;
      case 'block':
//        UI('toolControls').showOnly('tilePaletteSplitPanel');
        this.editor.startBlockTool();

        this.blockPalette.start();
        this.editor.sideBlockPalette.start();

        if(this.editor.currentTile.getBlock() === false) {
          this.editor.currentTile.setBlock(0);
        }
      break;

      case 'select': 
        $('#selectToolSettings').show();
        this.select.show();
        UI('toolControls').showOnly('selectControls');
        $('#selectToolSettingsMobile').show();        

      break;

      case 'pixelselect':
       $('#pixelselectToolSettingsMobile').show();        
      break;
      case 'type':
        UI('toolControls').showOnly('typeControls');
        this.editor.currentTile.setCharacter(0);
        $('#drawToolSettings').show();

//        this.editor.grid.setCursorCharacter(-1);

//        this.editor.grid.setTypingCursorPosition(0, 0, this.editor.grid.getXYGridPosition());
//        this.editor.grid.typingCursor.visible = true;
        this.typing.show();
      break;
      case 'charpixel':

        UI('toolControls').showOnly('tilePaletteSplitPanel');
//        UI('eastTilesPanel').showOnly('sidecharPalette');

        UI('previewPanel').showOnly('currentTilePanel');

        $('#charPixelToolSettings').show();

        this.pixelCharacterDraw.initCharset();
      break;
      
      case 'linesegment':
        UI('toolControls').showOnly('tilePaletteSplitPanel');

//        UI('eastTilesPanel').showOnly('sidecharPalette');

        UI('previewPanel').showOnly('currentTilePanel');

        $('#lineSegmentToolSettings').show();

        this.lineSegmentDraw.initCharset();
        break;
      case 'invert':
        this.invertTool.toolSelected();
        UI('toolControls').showOnly('tilePaletteSplitPanel');
//        UI('eastTilesPanel').showOnly('sidecharPalette');

        UI('previewPanel').showOnly('currentTilePanel');

        break;

      case 'corners':
        this.cornersTool.toolSelected();
        UI('toolControls').showOnly('tilePaletteSplitPanel');
//        UI('eastTilesPanel').showOnly('sidecharPalette');

        UI('previewPanel').showOnly('currentTilePanel');

        break;

      case 'pixel':
        this.pixelDraw.show();

        $('#pixelToolSettings').show();
        $('#pixelToolSettingsMobile').show();
//        UI('toolControls').showOnly('pixelControls');
        if(graphicType != 'sprite') {

          UI('toolControls').showOnly('tilePaletteSplitPanel');
//          UI('eastTilesPanel').showOnly('sidecharPalette');

          UI('previewPanel').showOnly('currentTilePanel');

          $('#pixelToolSettings_pixelTool').show();
          this.editor.animationPreview.hide();


          if(g_app.isMobile()) {
            UI('textEditorMobileToolsHolder').showOnly('tilePaletteMobile');            
          }
        } else {
          UI('toolControls').showOnly('spriteFramesPanel');
          $('#pixelToolSettings_pixelTool').hide();
          UI('previewPanel').showOnly('animationPreview');

          if(g_app.isMobile()) {
            UI('textEditorMobileToolsHolder').showOnly('spriteFramesMobile');
            this.editor.animationPreview.setCanvasElementId('animationPreviewCanvasMobile', 'animationPreviewHolderMobile');
            this.editor.spriteFramesMobile.show();
          } else {
            this.editor.animationPreview.setCanvasElementId('animationPreviewCanvas', 'animationPreviewHolder');
            this.editor.spriteFrames.show();
          }

          
          this.editor.animationPreview.show();
        }

      break;

      case 'hand':
      case 'zoom':
      case 'move':
        UI('toolControls').showOnly('tilePaletteSplitPanel');      
//        UI('eastTilesPanel').showOnly('sidecharPalette');
      break;
    }

    if(tool != 'type') {
      if(this.editor.grid.typingCursor) {
        this.editor.grid.typingCursor.visible = false;      
      }
    }
    if(tool == 'rect') {
      $('#smartRect').show();      
    } else {
      $('#smartRect').hide();
    }

    if(tool == 'type') {
      $('.drawAffects').hide();

    } else {
      $('.drawAffects').show();
    }

    if(tool == 'eyedropper' || tool == 'pixel') {
      $('#drawTools-mirrorH').hide();
      $('#drawTools-mirrorV').hide();
    } else {
      $('#drawTools-mirrorH').show();
      $('#drawTools-mirrorV').show();
    }

    if(tool == 'rect' || tool == 'oval') {
      $('#shapeFillSetting').show();


      if($('#drawToolSettingsMobile').width() > 300) {
        // should check width
        $('#drawFillMobileContainer').show();
      }
    } else {
      $('#shapeFillSetting').hide();      
      $('#drawFillMobileContainer').hide();
    }

    if(tool == 'eyedropper') {
//      this.editor.currentTile.setCharacter(0);
    }

    if(tool == 'erase') {
      this.editor.grid.setCursorCharacter(this.editor.tileSetManager.blankCharacter);
    } else {

    }


    if(tool == 'fill') {
      $('.drawFillSettings').show();
      $('#drawTools-mirrorH').hide();
      $('#drawTools-mirrorV').hide();
    } else {
      $('.drawFillSettings').hide();
    }

    $('.drawTool').removeClass('drawToolSelected');
    $('#drawTool_' + tool).addClass('drawToolSelected');

    $('.drawToolMobile').removeClass('drawToolMobileSelected');
    $('#drawToolMobile_' + tool).addClass('drawToolMobileSelected');

    $('.drawToolMobileSide').removeClass('drawToolMobileSideSelected');
    $('#drawToolMobileSide_' + tool).addClass('drawToolMobileSideSelected');

    $('#walk_drawTool_' + tool).addClass('drawToolSelected');
    $('#currentTool').html(this.toolDisplayName);

    $('.drawPopupTool').removeClass('drawPopupToolSelected');
    $('#drawPopupTool_' + tool).addClass('drawPopupToolSelected');
    $('#currentPopupTool').html(this.toolDisplayName);
    $('#toolSettingsCurrentTool').html(this.toolDisplayName);

    $('.currentDrawTool').html(this.getToolIconHTML(this.tool));


    if(g_app.isMobile()) {
      var toolHtml = '';
//      var toolHtml = '<div id="mobileCurrentTool">';
      toolHtml += '<div class="mobileToolIconHolder"><img src="' + this.toolMap[tool].mobileIcon + '"/></div>';
      toolHtml += '<span>' + this.toolMap[tool].label + '</span>';;
  //    toolHtml += '</div>';

      $('#mobileMenuCurrentTools').html(toolHtml);

      /*
      var _this = this;
      $('.mobileToolIconHolder').on('click', function() {
        if(_this.debugVisible) {
          $('#debugBox').hide();
          _this.debugVisible = false;

        } else {
          $('#debugBox').show();
          _this.debugVisible = true;
        }
      });

      */
    }


    // show colour palette depending on mode
    if(this.editor.getScreenMode() == TextModeEditor.Mode.INDEXED || this.editor.getScreenMode() == TextModeEditor.Mode.RGB) {
      // colour palette panel
      if(this.editor.getEditorMode() == 'pixel' || this.tool == 'pixel') {
        UI("eastInfoPanel").setPanelVisible("south", true);
        $('#drawTools-cellColor').show();
        $('#cellForegroundColor').show();
        $('#cellBackgroundColor').hide();
        $('#switchColors').hide();

      } else {
        UI("eastInfoPanel").setPanelVisible("south", false);
        $('#drawTools-cellColor').hide();
      }
    } else {
      UI("eastInfoPanel").setPanelVisible("south", true);
    }

    if(g_app.mode == '3d') {
      this.editor.gridView3d.toolChanged();
    }
    //    this.editor.graphic.redraw({ allCells: true});    

  },


  toggleDrawCharacter: function() {
    this.drawCharacter = !$('#drawChangesCharacter').is(':checked');
    $('#drawChangesCharacter').prop('checked', this.drawCharacter);
  },

  toggleDrawFGColor: function() {
    this.drawColor = !$('#drawChangesColor').is(':checked');
    $('#drawChangesColor').prop('checked', this.drawColor);
  },

  toggleDrawBGColor: function() {
    this.drawBgColor = !$('#drawChangesBGColor').is(':checked');
    $('#drawChangesBGColor').prop('checked', this.drawBgColor);
  },

  setDrawMode: function() {
    if(g_app.isMobile()) {
      this.drawCharacter = $('#drawChangesCharacterMobile').is(':checked');
      this.drawColor = $('#drawChangesColorMobile').is(':checked');
      this.drawBgColor = $('#drawChangesBGColorMobile').is(':checked');
      this.mirrorH = $('#drawMirrorHMobile').is(':checked');
      this.mirrorV = $('#drawMirrorVMobile').is(':checked');
    } else {
      this.drawCharacter = $('#drawChangesCharacter').is(':checked');
      this.drawColor = $('#drawChangesColor').is(':checked');
      this.drawBgColor = $('#drawChangesBGColor').is(':checked');
      this.mirrorH = $('#drawMirrorH').is(':checked');
      this.mirrorV = $('#drawMirrorV').is(':checked');
    }

    if(this.mirrorV && this.mirrorVY === false) {
      var gridHeight = this.editor.graphic.getGridHeight();

      this.mirrorVY = Math.floor(gridHeight / 2);
    }

    if(this.mirrorH && this.mirrorHX === false) {
      var gridWidth = this.editor.graphic.getGridWidth();

      this.mirrorHX = Math.floor(gridWidth / 2);
    }

/*
    if(this.editor.grid) {
      this.editor.grid.setCursorCharacter(this.editor.currentTile.character, 0, 0, 0, this.editor.currentTile.color);
    }
*/

  },

  initSelectEvents: function() {
    var _this = this;

    $('#selectX1').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });
    $('#selectY1').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });

    $('#selectX1').on('blur', function() {
    });
    $('#selectZ1').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });

    $('#selectX2').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });
    $('#selectY2').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });
    $('#selectZ2').on('keyup', function() {
      _this.select.setSelectionFromInput();
    });


    $('#selectFillButton').on('click', function() {
      _this.select.fill();
    });
    $('#selectInvertButton').on('click', function() {
      _this.select.invert();
    });

    $('#selectSwitchFCBC').on('click', function() {
      _this.select.switchColors();
    });

    $('#selectFlipHButton').on('click', function() {
      _this.select.flipH();
    });
    $('#selectFlipVButton').on('click', function() {
      _this.select.flipV()
    });

    $('#selectNudgeLeft').on('click', function() {
      _this.select.nudgeSelection(-1, 0, 0, { moveCut: true });
    });
    $('#selectNudgeRight').on('click', function() {
      _this.select.nudgeSelection(1, 0, 0, { moveCut: true });
    });
    $('#selectNudgeUp').on('click', function() {
      _this.select.nudgeSelection(0, -1, 0, { moveCut: true });
    });
    $('#selectNudgeDown').on('click', function() {
      _this.select.nudgeSelection(0, 1, 0, { moveCut: true });
    });



    $('#selectRotateLeft').on('click', function() {
      _this.select.rotateSelection(-1, 0, 0);
    });
    $('#selectRotateRight').on('click', function() {
      _this.select.rotateSelection(1, 0, 0);
    });
    $('#selectRotateUp').on('click', function() {
      _this.select.rotateSelection(0, -1, 0);
    });
    $('#selectRotateDown').on('click', function() {
      _this.select.rotateSelection(0, 1, 0);
    });



    $('#selectReplaceColorsButton').on('click', function() {
      _this.editor.replaceColor();
    });

    $('#selectReplaceCharactersButton').on('click', function() {
      _this.editor.replaceCharacter();
    });

    $('#selectDrawUsingSelection').on('click', function() {
      _this.select.selectionToPen();
      _this.select.unselectAll();
      _this.setDrawTool('pen');
    });


  },
  buildInterface: function(parentPanel) {
    var _this = this;

    var splitPanel = UI.create("UI.SplitPanel", { "id": "textModeBottomPanel" });
    parentPanel.add(splitPanel);


    var previewPanel = UI.create("UI.Panel", { "id": "previewPanel"});

    var animationPreview = UI.create("UI.Panel", { "id": "animationPreview", "visible": false });
    var currentTile = UI.create("UI.Panel", { "id": "currentTilePanel" });

    previewPanel.add(animationPreview);
    previewPanel.add(currentTile);

    splitPanel.addWest(previewPanel, 180)


    this.editor.currentTile.buildInterface(currentTile);
    this.editor.animationPreview.buildInterface(animationPreview);

    var toolControlsSplitPanel = UI.create("UI.SplitPanel");

//    var html = '<div class="activeBackground panelFill"></div>';
    var toolSettingsDesktopPanel = UI.create("UI.Panel", { "id": "toolSettingsDesktopPanel"});
    var toolSettingsSplitPanel = UI.create("UI.SplitPanel", { "id": "toolSettingsSplitPanel" });
    toolSettingsDesktopPanel.add(toolSettingsSplitPanel);

//    var toolSettingsCurrentHTML = '';
//    toolSettingsCurrentHTML = '<div class="activeBackground panelFill"><canvas id="toolSettingsCurrentTile" style="width: 24px; height: 24px; margin: 3px 2px"></canvas></div>';
//    var toolSettingsCurrentTilePanel = UI.create("UI.HTMLPanel", { "html": toolSettingsCurrentHTML });
//    toolSettingsSplitPanel.addWest(toolSettingsCurrentTilePanel, 30, false);
    
    var toolSettingsDesktop = UI.create("UI.HTMLPanel", { "id": "toolSettingsDesktop" });
    toolSettingsSplitPanel.add(toolSettingsDesktop);
    
    UI.on('ready', function() {
      var isMobile = UI.isMobile.any();
      if(isMobile) {
        UI('toolSettingsPanel').showOnly('toolsSettingsMobileHTMLPanel');
      } else {
        UI('toolSettingsPanel').showOnly('toolSettingsDesktopPanel');
      }

      toolSettingsDesktop.load('html/textMode/toolSettings.html', function() {
        _this.initToolSettingEvents();
      });
    });
    UI('toolSettingsPanel').add(toolSettingsDesktopPanel);



    var toolControlsPanel = UI.create("UI.Panel", { "id": "toolControls" });

    toolControlsSplitPanel.add(toolControlsPanel);
    splitPanel.add(toolControlsSplitPanel);

    var typingPanel = UI.create("UI.HTMLPanel", { "id": "typeControls", "visible": false, 
      "html": '<div class="panelFill"><canvas width="421" height="141" id="typeKeyboard" style="background-color: white; cursor: default;"></canvas> <div>Hold \'Shift\' or \'Alt\' to select alternate character ranges</div></div>' });
    toolControlsPanel.add(typingPanel);
    UI.on('ready', function() {
      UI('typeControls').setVisible(false);
    });

    var selectPanel = UI.create("UI.HTMLPanel", { "id": "selectControls" });
    toolControlsPanel.add(selectPanel);
    UI.on('ready', function() {
      UI('selectControls').setVisible(false);
      selectPanel.load('html/textMode/selectTools.html', function() {
        _this.initSelectEvents();
      });
    });

    var pixelPanel = UI.create("UI.HTMLPanel", { "id": "pixelControls" });
    toolControlsPanel.add(pixelPanel);
    UI.on('ready', function() {
      UI('pixelControls').setVisible(false);
      pixelPanel.load('html/textMode/pixelTools.html', function() {
      });
    });


    var spriteFramesPanel = UI.create("UI.Panel", { "id": "spriteFramesPanel" });
    toolControlsPanel.add(spriteFramesPanel);

    this.editor.spriteFrames = new SpriteFrames();
    this.editor.spriteFrames.init(this.editor);
    this.editor.spriteFrames.buildInterface(spriteFramesPanel);

    UI.on('ready', function() {
      UI('spriteFramesPanel').setVisible(false);
    });



    this.tilePaletteSplitPanel = UI.create("UI.SplitPanel", { "id": "tilePaletteSplitPanel" });
    toolControlsPanel.add(this.tilePaletteSplitPanel);

    var tilePaletteHolder = UI.create("UI.Panel", { "id": "tilePaletteHolder" });
    this.tilePaletteSplitPanel.add(tilePaletteHolder);

    this.tilePalette = new TilePalette();
    this.tilePalette.init(this.editor);
    this.tilePalette.buildInterface(tilePaletteHolder);


    var blockPaletteHolder = UI.create("UI.Panel", { "id": "blockPaletteHolder" });
    this.tilePaletteSplitPanel.addEast(blockPaletteHolder, 300);

    this.blockPalette = new BlockPalette();
    this.blockPalette.init(this.editor);
    this.blockPalette.buildInterface(blockPaletteHolder);
    UI.on('ready', function() {
      //UI('blockPalette').setVisible(false);
    });






    UI.on('ready', function() {

      var drawToolsPanel = UI('toolsDesktopPanel');
      drawToolsPanel.on('loaded', function() {
        _this.initEvents();  
      });

      drawToolsPanel.on('contextmenu', function(event) {
        event.preventDefault();
      });

      drawToolsPanel.load("html/textMode/drawTools.html");

      var drawToolsMobileSidePanel = UI('toolsMobileSidePanel');
      drawToolsMobileSidePanel.on('loaded', function() {
        _this.initMobileSidePanelContent();
        _this.initMobileSidePanelEvents();
        _this.checkMobileToolScroll();
      });
      drawToolsMobileSidePanel.load("html/textMode/drawToolsMobileSide.html");

      drawToolsMobileSidePanel.on('resize', function() {
        _this.checkMobileToolScroll();
      });


  
      var drawToolsMobilePanel = UI('toolsMobileHTMLPanel');
      drawToolsMobilePanel.on('loaded', function() {
        _this.initMobileEvents();
      });

      drawToolsMobilePanel.on('contextmenu', function(event) {
        event.preventDefault();
      });

      drawToolsMobilePanel.load("html/textMode/drawToolsMobile.html");

      var toolSettingsMobilePanel = UI('toolsSettingsMobileHTMLPanel');
      toolSettingsMobilePanel.on('loaded', function() {
        _this.initMobileToolSettingEvents();
      });
      toolSettingsMobilePanel.load('html/textMode/toolSettingsMobile.html');





    });

  },

  initToolSettingsCurrentTileEvents: function() {

    var _this = this;
    $('#toolSettingsCurrentTile').on('click', function(event) {
      var offset = $(this).offset();

      _this.editor.gridView2d.mousePageX = offset.left + 20;
      _this.editor.gridView2d.mousePageY = offset.top + 26 + 20;
      _this.editor.gridView2d.showCharacterPicker();
    })

  },

/*
    toolsPencil: { key: 'N' },
    toolsErase: { key: 'J' },
    toolsBucket: { key: 'K' },
    toolsEyedropper: { key: 'I' },
    toolsPixel: { key: 'P' },
    toolsMarquee: { key: 'M' },
    toolsShape: { key: 'U' },
    toolsZoom: { key: 'Z' },
    toolsHand: { key: 'H' },
    toolsMove: { key: 'V' },
*/

  toggleShape: function() {
    switch(this.tool) {
      case 'line':
        this.setDrawTool('rect');      
      break;
      case 'rect':
        this.setDrawTool('oval');      
      break;
      case 'oval':
        this.setDrawTool('line');      
      break;
      default:
        this.setDrawTool('line');
      break;
    }

  },

  keyDown: function(event) {

    var k = event.key.toLowerCase();
    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toUpperCase();
    var cl = String.fromCharCode(keyCode).toLowerCase();
    var tool = this.tool;
    var grid2d = this.editor.grid.grid2d;
 
    var layer = this.editor.layers.getSelectedLayerObject();

    if(this.editor.spriteFrames.getVisible()) {
      if(this.editor.spriteFrames.keyDown(event)) {
        return;
      }
    }

    if(tool != 'type') {
      this.editor.colorPalettePanel.keyDown(event);      
    }

    if(this.editor.getEditorMode() == 'pixel') {
      this.editor.tools.pixelDrawTools.keyDown(event);
      return;
    }

    if(tool == 'pixel') {
      this.pixelDraw.keyDown(event);    
    }

    if(tool == 'type') {
      event.preventDefault();
      this.typing.keyDown(event);   
      return;   
    }


    if(!event.shiftKey) {
      switch(c) {
        case keys.textMode.toolsPencil.key:
          this.setDrawTool('pen');
          return;
        break;
        case keys.textMode.toolsErase.key:
          this.setDrawTool('erase');
          return;
        break;
        case keys.textMode.toolsBucket.key:
          this.setDrawTool('fill');
          return;
        break;
        case keys.textMode.toolsEyedropper.key:
          this.setDrawTool('eyedropper');      
          return;
        break;
        case keys.textMode.toolsPixel.key:
          this.setDrawTool('pixel');      
          return;
        break;
        case keys.textMode.toolsCharPixel.key:
          this.setDrawTool('charpixel');
          return;
        break;
        case keys.textMode.toolsMarquee.key:
          this.setDrawTool('select');      
          return;
        break;
        case keys.textMode.toolsType.key:
          this.setDrawTool('type');
          return;
        break;
        case keys.textMode.toolsShape.key:
          this.toggleShape();      
          return;
        break;
        case keys.textMode.toolsZoom.key:
          this.setDrawTool('zoom');
          return;
        break;
        case keys.textMode.toolsHand.key:
          this.setDrawTool('hand');
          return;
        break;
        case keys.textMode.toolsMove.key:
          this.setDrawTool('move');
          return;
        break;
        case keys.textMode.toolsBlock.key:
          this.setDrawTool('block');
          return;
        break;
      }
    }

    if(this.tool == 'pen' 
       || this.tool == 'erase' 
       || this.tool == 'fill' 
       || this.tool == 'eyedropper' 
       || this.tool == 'line' 
       || this.tool == 'rect' 
       || this.tool == 'oval') {
      switch(c) {
        case keys.textMode.drawTileFlipH.key:
          this.editor.currentTile.flipH2d();
        break;
        case keys.textMode.drawTileFlipV.key:
          this.editor.currentTile.flipV2d();
        break;

        case keys.textMode.drawCharacter.key: 
          this.toggleDrawCharacter();
        break;
        case keys.textMode.drawFGColor.key: 
          this.toggleDrawFGColor();
        break;
        case keys.textMode.drawBGColor.key: 
          this.toggleDrawBGColor();
        break;
      }
      this.tilePalette.keyDown(event);       
    }

    if(this.tool == 'pen' || this.tool == 'block') {
      var dx = 1;
      var dy = 1;

      if(layer && layer.getType() == 'grid') {
        if(layer.getBlockModeEnabled()) {
          dx = layer.getBlockWidth();
          dy = layer.getBlockHeight();          
        }
      }


      switch(k) {
        case 'arrowup':
//          grid2d.setCursor(cell.x, cell.y, 0, this.editor.currentTile.color, this.editor.currentTile.bgColor);
          grid2d.moveCursor(0, -dy);
          grid2d.setCursorEnabled(true);
          break;
        case 'arrowdown':
          grid2d.moveCursor(0, dy);
          grid2d.setCursorEnabled(true);
          break;
        case 'arrowleft':
          grid2d.moveCursor(-dx, 0);
          grid2d.setCursorEnabled(true);

          break;
        case 'arrowright':
          grid2d.moveCursor(dx, 0);
          grid2d.setCursorEnabled(true);
          break;
        case 'enter':
        case 'insert':
          grid2d.setCursorCells();          
          break;
      }
    }


    if(this.tool == 'linesegment') {
      switch(c) { 
        case keys.textMode.lineSegmentHorizontal.key:
          this.lineSegmentDraw.setMode('horizontal');
        break;
        case keys.textMode.lineSegmentVertical.key:
          this.lineSegmentDraw.setMode('vertical');
        break;
      }
    }

    if(this.tool == 'block') {
      if(this.blockPalette) {
        this.blockPalette.keyDown(event);      
      }

      if(this.editor.sideTilePalette) {
        this.editor.sideTilePalette.keyDown(event);
      }
    }


    if(this.tool != 'type') {
      switch(event.key) {
        case keys.textMode.showColorPicker.key:
          this.editor.gridView2d.showColorPicker();
          break;
        case keys.textMode.showTilePicker.key:
          this.editor.gridView2d.showCharacterPicker();
          break;
      }

      switch(event.key.toLowerCase()) {
        case keys.textMode.switchColors.key:
          this.editor.currentTile.switchColors();
          break;

      }
    }


    if(this.tool == 'select') {
      if(!event.shiftKey && !event.altKey && !event.metaKey) {
        switch(c) {
          case keys.textMode.selectDrawWithSelection.key:
            this.select.selectionToPen();
            this.select.unselectAll();
            this.setDrawTool('pen');          
          break;
          case keys.textMode.selectFlipSelectionH.key:
            this.select.flipH();
          break;
          case keys.textMode.selectFlipSelectionV.key:
            this.select.flipV();
          break;
          case keys.textMode.selectFillSelection.key:
            this.select.fill();
          break;
        }
      }
    }

    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
      switch(c) {
        case keys.textMode.c64MultiFG.key:
          this.pixelDraw.setC64MultiColorType('cell');
        break;
        case keys.textMode.c64MultiBG.key:
          this.pixelDraw.setC64MultiColorType('background');
        break;
        case keys.textMode.c64MultiMC1.key:
          this.pixelDraw.setC64MultiColorType('multi1');
        break;
        case keys.textMode.c64MultiMC2.key:
          this.pixelDraw.setC64MultiColorType('multi2');
        break;
      }
    }

    if(this.select.isActive())  {
      this.selectToolKeypress(event);
    } else {
      this.screenMoveKeypress(event);
    }
    this.editor.gridView2d.setMouseCursor(event);
  },

  keyUp: function(event) {
    if(this.tool == 'type') {
      event.preventDefault();
    }

  },

  keyPress: function(event) {
    if(this.tool == 'type') {
      event.preventDefault();
    }

  },


  selectToolKeypress: function(event) {
    var selectTool = this.select;

    var moveKey = event.metaKey || event.ctrlKey;
    var args = { moveCut: moveKey, moveCopy: event.altKey };

    switch(event.keyCode) {
      case UI.DELETEKEY:
      case UI.BACKSPACEKEY:
        selectTool.clear();
      break;      
      case UI.UPARROWKEY:
        selectTool.nudgeSelection(0, -1, 0, args);
        event.preventDefault();
      break;
      case UI.DOWNARROWKEY:
        selectTool.nudgeSelection(0, 1, 0, args);
        event.preventDefault();
      break;
      case UI.RIGHTARROWKEY:
        selectTool.nudgeSelection(1, 0, 0, args);
        event.preventDefault();
      break;
      case UI.LEFTARROWKEY:
        selectTool.nudgeSelection(-1, 0, 0, args);
        event.preventDefault();
      break;
    }
  },

  screenMoveKeypress: function(event) {

    var selectTool = this.select;

    var moveKey = event.metaKey || event.ctrlKey;
    var args = { moveCut: moveKey, moveCopy: event.altKey };

    if(!args.moveCut && !args.moveCopy) {
      return;
    }

    var nudgeX = 0;
    var nudgeY = 0;
    var nudgeZ = 0;

    switch(event.keyCode) {
      case UI.UPARROWKEY:
        nudgeY = 1;
      break;
      case UI.DOWNARROWKEY:
        nudgeY = -1;
      break;
      case UI.RIGHTARROWKEY:
        nudgeX = 1;
      break;
      case UI.LEFTARROWKEY:
        nudgeX = -1;
      break;
    }

    if(nudgeX != 0 || nudgeY != 0 || nudgeX != 0) {
      selectTool.selectAll();
      selectTool.nudgeSelection(nudgeX, nudgeY, nudgeZ, args);
      selectTool.unselectAll();
      event.preventDefault();
    }

  },



  showPopup: function(x, y, character, color, callback) {
    if(this.drawToolsPopup == null) {
      this.drawToolsPopup = new DrawToolsPopup();

      var _this = this;
      this.drawToolsPopup.init(this.editor, function() {
        // can't show it until the html has loaded..
        _this.drawToolsPopup.show(x, y, character, color, callback);
      });
    } else {
      this.drawToolsPopup.show(x, y, character, color, callback);
    }
  }

}
