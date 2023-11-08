var PixelDrawTools = function() {
  this.editor = null;

  // current tool
  this.tool = 'pen';
}


PixelDrawTools.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  initEvents: function() {
    var _this = this;

    $('.pixelDrawTool').on('click', function() {
      var id = $(this).attr('id');
      var dashPos = id.lastIndexOf('_');
      id = id.substring(dashPos + 1);
      _this.setDrawTool(id);
    });

    $('.pixelDrawTool').on('mouseover', function() {
      var id = $(this).attr('id');
      
      id = id.substring('drawTool_'.length);
      var label = _this.getToolLabel(id);
      $('#currentTool').html(label);
    });

    $('.pixelDrawTool').on('mouseleave', function() {
      var label = _this.getToolLabel(_this.tool);
      $('#currentTool').html(label);
    });


    $('#pixelDrawCellForegroundColor').on('click', function() {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.currentTile.setColor(color);
      }
      args.mode = _this.editor.getScreenMode();
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellcolor';
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

/*
    $('#pixelC64Individual').on('click', function() {
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.editor.currentTile.setColor(color);
      }
      args.mode = _this.editor.getScreenMode();
      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.editor.currentTile.getColor();
      args.type = 'cellcolor';
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });
*/
    $('#pixelDrawTools-colors' + ' .colorSetting').on('click', function(event) {

      var colorType = $(this).attr('data-type');
      _this.showColorPicker(event, colorType);

      event.preventDefault();

    });

    $('.pixelDrawToolsColor').on('click', function() {
      var type = $(this).attr('data-type');
      $('.pixelDrawToolsColor').removeClass('pixelDrawToolsColorSelected');
      $(this).addClass('pixelDrawToolsColorSelected');
      _this.selectC64ColorType(type);
    });
  },


  setScreenMode: function(screenMode) {
    switch(screenMode) {
      case TextModeEditor.Mode.TEXTMODE:
      case TextModeEditor.Mode.C64ECM:
      case TextModeEditor.Mode.C64STANDARD:
        $('#pixelDrawToolsColor-cell').show();
        $('#pixelDrawToolsColor-background').show();
        $('#pixelDrawTools-c64multicolor').hide();
        $('#pixelDrawTools-nes').hide();
        $('#pixelDrawTools-indexed').hide();
      break;
      case TextModeEditor.Mode.C64MULTICOLOR:
        $('#pixelDrawToolsColor-cell').show();
        $('#pixelDrawToolsColor-background').show();
        $('#pixelDrawTools-c64multicolor').show();
        $('#pixelDrawTools-nes').hide();
        $('#pixelDrawTools-indexed').hide();
      break;
      case TextModeEditor.Mode.NES:
        $('#pixelDrawToolsColor-cell').hide();
        $('#pixelDrawToolsColor-background').hide();
        $('#pixelDrawTools-c64multicolor').hide();
        $('#pixelDrawTools-nes').show();
        $('#pixelDrawTools-indexed').hide();
      break;
      case TextModeEditor.Mode.INDEXED:
        $('#pixelDrawToolsColor-cell').show();
        $('#pixelDrawToolsColor-background').hide();
        $('#pixelDrawTools-c64multicolor').hide();
        $('#pixelDrawTools-nes').hide();
        $('#pixelDrawTools-indexed').hide();      
      break;
      case TextModeEditor.Mode.RGB:
        $('#pixelDrawToolsColor-cell').show();
        $('#pixelDrawToolsColor-background').hide();
        $('#pixelDrawTools-c64multicolor').hide();
        $('#pixelDrawTools-nes').hide();
        $('#pixelDrawTools-indexed').hide();      
        break;
    }
  },

  showColorPicker: function(event, colorType) {
    var args = {};

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer) {
      return;
    }
    args.currentColor = 0;
    switch(colorType) {
      case 'cell':
        args.currentColor  = this.editor.currentTile.getColor();
        args.type = 'cellcolor';

      break;
      case 'background':
        args.hasNone = true;
        args.currentColor  = layer.getBackgroundColor();
        args.type = 'background';
      break;
      case 'multi1':
        args.currentColor  = layer.getC64Multi1Color();
        args.type = 'multi1';
      break;
      case 'multi2':
        args.currentColor  = layer.getC64Multi2Color();
        args.type = 'multi2';
      break;
    }

    args.colorPickedCallback = function(color) {
      switch(colorType) {
        case 'background':
          this.editor.setBackgroundColor(color);
          break;
        case 'cell':
          this.editor.currentTile.setColor(color);
          break;
        case 'multi1':
          this.editor.setC64Multi1Color(color);
          break;
        case 'multi2':
          this.editor.setC64Multi2Color(color);
          break;
      }
    }

    if(UI.isMobile.any()) {
      this.editor.colorPaletteManager.showColorPickerMobile(args);
    } else {
      var x = event.pageX;
      var y = event.pageY;
      this.editor.colorPaletteManager.showColorPicker(x, y, args);
    }
  },

  selectC64ColorType: function(colorType) {
    this.editor.tools.drawTools.pixelDraw.setC64MultiColorType(colorType);

/*
    if(this.colorTypeSelectedHander !== false) {
      this.colorTypeSelectedHander(colorType);//, colorIndex);
    }
*/
  },



  buildInterface: function(parentPanel) {
    var _this = this;
    UI.on('ready', function() {

      var drawToolsPanel = UI('pixelToolsDesktopPanel');
      drawToolsPanel.on('loaded', function() {
        _this.initEvents();  
      });

      drawToolsPanel.on('contextmenu', function(event) {
        event.preventDefault();
      });

      drawToolsPanel.load("html/textMode/pixelDrawTools.html");

      var drawToolsMobileSidePanel = UI('pixelToolsMobileSidePanel');
      drawToolsMobileSidePanel.on('loaded', function() {

        _this.initMobileSidePanelContent();
        _this.initMobileSidePanelEvents();
        _this.checkMobileToolScroll();

      });
      drawToolsMobileSidePanel.load("html/textMode/pixelDrawToolsMobileSide.html");

      drawToolsMobileSidePanel.on('resize', function() {
        //_this.checkMobileToolScroll();
      });
    });

  },

  initMobileSidePanelContent: function() {
  },


  initMobileSidePanelEvents: function() {
    var _this = this;

    $('#pixelLayersButtonMobile').on('click', function() {
      _this.editor.layers.showMobileLayerChooser();
    });


    $('.pixelDrawToolMobileSide').on('click', function() {
      var type = $(this).attr('data-type');
      _this.setDrawTool(type);
    });
/*

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
 
*/
        
  },

  checkMobileToolScroll: function() {
    var holderHeight = $('#pixelToolIconHolderMobile').height();
    var toolsHeight = $('#pixelToolIconsMobile').height();
    var position = $('#pixelToolIconsMobile').position();
    var top = position.top;

    if(top < -2) {
      // can scroll down
      $('#pixelToolIconsScrollTop').show();
    } else {
      $('#pixelToolIconsScrollTop').hide();
    }

    if(top + toolsHeight - 2 > holderHeight) {
      // can scroll up
      $('#pixelToolIconsScrollBottom').show();

    } else {
      $('#pixelToolIconsScrollBottom').hide();

    }
  },  


  getToolLabel: function(id) {
    this.toolMap = {
      "pen": { label: "Pencil", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', key: keys.textMode.toolsPencil.key },
      "erase": { label: "Blank", "mobileIcon": 'icons/svg/glyphicons-basic-250-eraser.svg', "key": keys.textMode.toolsErase.key },
      "fill": { label: "Fill Bucket", "mobileIcon": 'icons/svg/glyphicons-basic-245-fill.svg', "key": keys.textMode.toolsBucket.key },
      "eyedropper": { label: "Eyedropper", "mobileIcon": 'icons/svg/glyphicons-basic-91-eyedropper.svg', "key": keys.textMode.toolsEyedropper.key },
      "line": { label: "Line", "mobileIcon": 'icons/svg/slash.svg', "key": keys.textMode.toolsShape.key },
      "rect": { label: "Rect", "mobileIcon": 'icons/svg/square.svg', "key": keys.textMode.toolsShape.key },
      "oval": { label: "Oval", "mobileIcon": 'icons/svg/circle.svg', "key": keys.textMode.toolsShape.key },
      "pixelselect": { label: "Marquee", "mobileIcon": 'icons/select@2x.png', "key": keys.textMode.toolsMarquee.key },
      "charpixel": { label: "Char Pixel", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsCharPixel.key },
      "type": { label: "Type", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsType.key },
      "pixel": { label: "Pixel", "mobileIcon": 'icons/pixel.png', "key": keys.textMode.toolsPixel.key },
      "block": { label: "Block", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsBlock.key },
      "zoom": { label: "Zoom", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsZoom.key },
      "hand": { label: "Hand", "mobileIcon": 'icons/svg/glyphicons-basic-457-hand-open.svg', "key": keys.textMode.toolsHand.key },
      "move": { label: "Move", "mobileIcon": 'icons/svg/glyphicons-basic-31-pencil.svg', "key": keys.textMode.toolsMove.key }
    };

    if(this.toolMap.hasOwnProperty(id)) {
      return this.toolMap[id].label + " (" + this.toolMap[id].key + ")";
    }
    return id;

  },

  setDrawTool: function(tool) {
    switch(tool) {
      case 'pen':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('draw');
      break;
      case 'erase':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('erase');
      break;
      case 'line':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('line');
      break;
      case 'rect':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('rect');
        $('#pixelshapeToolSettingsMobile').show();       
        $('#pixelShapeFillSetting').show(); 
      break;
      case 'oval':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('oval');
        $('#pixelshapeToolSettingsMobile').show();        
        $('#pixelShapeFillSetting').show();

      break;
      case 'fill':
        this.editor.tools.drawTools.setDrawTool('pixel');
        this.editor.tools.drawTools.pixelDraw.setTool('fill');      
      break;
      case 'pixelselect':
      case 'select':
        this.editor.tools.drawTools.setDrawTool('pixelselect');
      break;
      case 'zoom':
        this.editor.tools.drawTools.setDrawTool('pixelzoom');
      break;
      case 'hand':
        this.editor.tools.drawTools.setDrawTool('pixelhand');      
      break;
      case 'move':
        this.editor.tools.drawTools.setDrawTool('pixelmove');
      break;

    }

    $('.pixelDrawTool').removeClass('pixelDrawToolSelected');
    $('#pixelDrawTool_' + tool).addClass('pixelDrawToolSelected');

    $('.pixelDrawToolMobile').removeClass('pixelDrawToolMobileSelected');
    $('#pixelDrawToolMobile_' + tool).addClass('pixelDrawToolMobileSelected');

    $('.pixelDrawToolMobileSide').removeClass('pixelDrawToolMobileSideSelected');
    $('#pixelDrawToolMobileSide_' + tool).addClass('pixelDrawToolMobileSideSelected');

    if(this.editor.tools.drawTools.pixelSelect.isInPasteMove()) {
      this.editor.tools.drawTools.pixelSelect.endPasteDrag();
    }

  },

  toggleShape: function() {

  },

  keyDown: function(event) {
    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toUpperCase();
    var tool = this.editor.tools.drawTools.tool;


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
        case keys.textMode.toolsMarquee.key:
          this.setDrawTool('select');      
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
      }
    }

//    if(tool == 'pixelselect') {
   // if(this.editor.tools.drawTools.pixelSelect.isActive()) {
      this.selectToolKeypress(event);
         

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
/*
    if(this.select.isActive())  {
      this.selectToolKeypress(event);
    } else {
      this.screenMoveKeypress(event);
    }
*/
    this.editor.gridView2d.setMouseCursor(event);
  },  


  selectToolKeypress: function(event) {
    var selectTool = this.editor.tools.drawTools.pixelSelect;

    var moveKey = event.metaKey || event.ctrlKey;
    var args = { moveCut: moveKey, moveCopy: event.altKey };

    switch(event.keyCode) {
      case UI.DELETEKEY:
      case UI.BACKSPACEKEY:
        selectTool.clear();
      break;      
      case UI.UPARROWKEY:
        selectTool.nudgeSelection(0, -1, args);
        event.preventDefault();
      break;
      case UI.DOWNARROWKEY:
        selectTool.nudgeSelection(0, 1, args);
        event.preventDefault();
      break;
      case UI.RIGHTARROWKEY:
        selectTool.nudgeSelection(1, 0, args);
        event.preventDefault();
      break;
      case UI.LEFTARROWKEY:
        selectTool.nudgeSelection(-1, 0, args);
        event.preventDefault();
      break;
    }
  },  

}

