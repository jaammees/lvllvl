var TileEditorMobile = function() {
  this.character = false;

  this.characters = [];

  this.clipboardCanvas = null;
  this.canvas = null;

  this.uiComponent = null;
  this.tileEditorMobileGrid = null;

  this.frame = 0;
  this.frameCount = 1;

  this.mixedAnimation = false;

  this.visible = false;

  this.tileSet = null;

}

TileEditorMobile.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  show: function(args) {
    if(this.uiComponent == null) {

      var width = 500;
      var height = 100;

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();

      width = screenWidth - 10;// - 30;
      height = screenHeight - 10;

      if(width > 640) {
        width = 640;      
      }

      if(height > 800) {
        height = 800;
      }

      var _this = this;
      if(this.uiComponent == null) {

        this.uiComponent = UI.create("UI.MobilePanel", { "id": "tileEditorMobile", "title": "Tile Editor", "width": width, "height": height });
/*
        this.closeButton = UI.create('UI.Button', { "text": "Close" });
        this.closeButton.on('click', function(event) {
          UI.closeDialog();
        });

        this.uiComponent.addButton(this.closeButton);
*/

        var htmlPanel = UI.create("UI.HTMLPanel", { "id": "tileEditorMobileHTML" });
        this.uiComponent.add(htmlPanel);
        htmlPanel.load('html/textMode/tileEditorMobile.html', function() {


          _this.c64MulticolorTypeControl = new C64MulticolorTypeControl();
          _this.c64MulticolorTypeControl.init(_this.editor, { "elementId": "tileEditorMobileC64Colors" })
          _this.initEvents();

          _this.tileEditorMobileGrid = new TileEditorGrid();
          _this.tileEditorMobileGrid.init(_this.editor, { "canvasElementId": 'tileEditorMobileCanvas', "setMouseCursor": true });
          _this.tileEditorMobileGrid.setupTileEditor();
          if(typeof args != 'undefined') {
            if(typeof args.character != 'undefined') {
              _this.setCharacters([[args.character]]);
            }
          } else {
            _this.setCharacters([[0]]);
          }

          _this.setScreenMode(_this.editor.getScreenMode());

          if(_this.editor.getScreenMode() == TextModeEditor.Mode.C64MULTICOLOR) {
            _this.editor.setBackgroundColor(_this.editor.graphic.getBackgroundColor(), false);
            _this.editor.setC64Multi1Color(_this.editor.graphic.getC64Multi1Color(), false);
            _this.editor.setC64Multi2Color(_this.editor.graphic.getC64Multi2Color(), false);
            var currentColor = _this.editor.currentTile.getColor();
            _this.editor.currentTile.setColor(currentColor, { force: true });
          }


          UI.showDialog("tileEditorMobile");
          _this.resize();
          _this.draw();

          _this.editor.tools.drawTools.pixelDraw.setC64MultiColorType(_this.editor.tools.drawTools.pixelDraw.c64MultiColorType);

          if(_this.editor.colorPaletteManager.colorSubPalettes) {
            _this.editor.colorPaletteManager.colorSubPalettes.selectPalette();
          }
      
        });

      }

    } else {

      if(typeof args != 'undefined') {
        if(typeof args.character != 'undefined') {
          this.setCharacters([[args.character]]);
        }
      }
      UI.showDialog("tileEditorMobile");
      this.resize();
      this.draw();

      if(this.editor.colorPaletteManager.colorSubPalettes) {
        this.editor.colorPaletteManager.colorSubPalettes.selectPalette();
      }

    }



  },
  /*
  toggleVisible: function() {
    this.visible = !this.visible;
    if(this.visible) {
      this.editor.tools.drawTools.pixelDraw.initC64MulticolorControl();

    }
    UI("gridSplitPanel").setPanelVisible('west', this.visible);
  },
  */

  setScreenMode: function(screenMode) {
    switch(screenMode) {
      case TextModeEditor.Mode.TEXTMODE:
      case TextModeEditor.Mode.C64ECM:
      case TextModeEditor.Mode.C64STANDARD:
        $('#tileEditorMobileC64Colors').hide();
        $('#tileEditorMobileSubPaletteColors').hide();
        $('#tileEditorMobileMultiColors').hide();
      break;
      case TextModeEditor.Mode.C64MULTICOLOR:
        $('#tileEditorMobileC64Colors').show();
        $('#tileEditorMobileSubPaletteColors').hide();
        $('#tileEditorMobileMultiColors').hide();
      break;
      case TextModeEditor.Mode.NES:
        $('#tileEditorMobileC64Colors').hide();
        $('#tileEditorMobileSubPaletteColors').show();
        $('#tileEditorMobileMultiColors').hide();
      break;
      case TextModeEditor.Mode.INDEXED:
      case TextModeEditor.Mode.RGB:
        $('#tileEditorMobileC64Colors').hide();
        $('#tileEditorMobileSubPaletteColors').hide();
        $('#tileEditorMobileMultiColors').show();

      break;
    }
  },
  initEvents: function() {
    var _this = this;
    
    $('#tileEditorMobileFlipH').on('click', function() {    
      _this.tileEditorMobileGrid.flipH();
    });

    $('#tileEditorMobileFlipV').on('click', function() {
      _this.tileEditorMobileGrid.flipV();
    });


    $('#tileEditorMobileLeft').on('click', function() {
      _this.tileEditorMobileGrid.rotatePixels(1, 0);
    });

    $('#tileEditorMobileRight').on('click', function() {
      _this.tileEditorMobileGrid.rotatePixels(-1, 0);
    });

    $('#tileEditorMobileUp').on('click', function() {
      _this.tileEditorMobileGrid.rotatePixels(0, 1);
    });

    $('#tileEditorMobileDown').on('click', function() {
      _this.tileEditorMobileGrid.rotatePixels(0, -1);
    });


    $('#tileEditorMobileRotate').on('click', function() {
      _this.tileEditorMobileGrid.rotate();
    });


    $('#tileEditorMobileInvert').on('click', function() {
      _this.tileEditorMobileGrid.invert();
    });

    $('#tileEditorMobileCopy').on('click', function() {
      _this.tileEditorMobileGrid.copyCharacter();
    });

    $('#tileEditorMobilePaste').on('click', function() {
      _this.tileEditorMobileGrid.pasteCharacter();
    });

    $('#tileEditorMobileClear').on('click', function() {
      _this.tileEditorMobileGrid.copyCharacter();      
      _this.tileEditorMobileGrid.clearCharacter();
    });

/*
    $('#tileEditorMobileAnimated').on('click', function() {
      _this.setAnimated($(this).is(':checked'));
    });
*/

    $('#tileEditorMobileAnimatedType').on('change', function() {
      var type = $(this).val();
      _this.setAnimatedType(type);
    })

    $('#tileEditorMobileAnimatedTicksPerFrame').on('keyup', function() {
      var ticks = parseInt($(this).val(), 10);
      if(!isNaN(ticks)) {
        _this.setTicksPerFrame(ticks);
      }
    });

    $('#tileEditorMobileAnimatedTicksPerFrame').on('change', function() {
      var ticks = parseInt($(this).val(), 10);
      if(!isNaN(ticks)) {
        _this.setTicksPerFrame(ticks);
      }
    });

    $('#tileEditorMobileCloseButton').on('click', function() {
      _this.toggleVisible();
    });

    $('#tileEditorMobileFrame').on('change', function() {
      var frame = parseInt($(this).val());
      if(!isNaN(frame)) {
        _this.setFrame(frame - 1);
      }
    });

    $('#tileEditorMobileFrame').on('keyup', function() {
      var frame = parseInt($(this).val());
      if(!isNaN(frame)) {
        _this.setFrame(frame - 1);
      }
    });

    $('#tileEditorMobileNextFrame').on('click', function() {
      _this.nextFrame();
    });

    $('#tileEditorMobilePrevFrame').on('click', function() {
      _this.prevFrame();
    });

    $('#tileEditorMobileInsertFrame').on('click', function() {
      _this.insertFrame();
    });

    $('#tileEditorMobileDeleteFrame').on('click', function() {
      _this.deleteFrame();
    });


    $('#tileEditorMobileControls .ui-button').on('mouseleave', function(event) {
      $('#tileEditorMobileControlLabel').html('');
    });

    $('#tileEditorMobileControls .ui-button').on('mouseenter', function(event) {
      var label = $(this).attr('data-label');
      $('#tileEditorMobileControlLabel').html(label);
    });

    $('#tileEditorMobileMultiColor').on('click', function(event) {
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


    $('.tileEditorMobileSubPaletteColor').on('click', function(event) {
      
      var colorIndex = $(this).attr('data-index');
      console.log('select colour ' + colorIndex);
      _this.selectSubPaletteColorIndex(colorIndex);
    });



  },

/*
  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.HTMLPanel", {  });
    parentPanel.add(this.uiComponent);

    var _this = this;
    UI.on('ready', function() {
      _this.uiComponent.load('html/textMode/tileEditorMobile.html', function() {
        _this.c64MulticolorTypeControl = new C64MulticolorTypeControl();
        _this.c64MulticolorTypeControl.init(_this.editor, { "elementId": "tileEditorC64Colors" })
        _this.initEvents();
      });
    });

    this.uiComponent.on('contextmenu', function(event) {
      event.preventDefault();
    });

    this.uiComponent.on('resize', function(event) {
      _this.resize();
    });

  },

*/
  setupTileEditor: function() {

    var controlsTop = this.tileEditorMobileGrid.getHeight(); + 10 + 10;
    document.getElementById('tileEditorMobileControls').style.top = controlsTop + 'px';
  },


  resize: function() {
    if(this.canvas == null) {
      this.canvas = document.getElementById('tileEditorMobileCanvas');
    }


//tileEditorMobileCanvasHolder


    var element = $('#tileEditorMobileCanvasHolder');

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }


    if(this.width > UI.getScreenHeight() / 2) {
      this.width = Math.ceil(UI.getScreenHeight() / 2);
    }

    var charsAcross = 1;
    var charsDown = 1;

    if(this.characters.length > 0 && this.characters[0].length > 0) {
      charsAcross = this.characters[0].length;
      charsDown = this.characters.length;
    }

    var width = this.width - 20;
    var height = this.width - 20;


    if(charsAcross > charsDown) {
      height = Math.ceil(charsDown * (width / charsAcross));
    }

    this.tileEditorMobileGrid.setSize(width, height);
    $('#tileEditorMobileCanvas').css('top', '10px');
    $('#tileEditorMobileCanvas').css('left', '10px');


  },

  // set the characters to be edited, 
  // pass in 2d array of characters
  setCharacters: function(characters) {
    var changed = false;


    // check if they've changed
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



    this.tileSet = this.editor.tileSetManager.getCurrentTileSet();    
    this.setupTileEditor();

    this.characters = [];

    // have we checked the first character
    var firstCharacter = true;

    // do all the characters have the same properties
    var sameProperties = true;

    this.animated = false;
    this.ticksPerFrame = 0;
    this.animatedType = '';
    this.frames = 0;

    for(var y = 0; y < characters.length; y++) {
      this.characters.push([]);
      for(var x = 0; x < characters[y].length; x++) {
        this.characters[y].push(characters[y][x]);
        var properties = this.tileSet.getTileProperties(characters[y][x]);
        if(typeof properties.animated != 'undefined' && properties.animated !== false) {
          if( (this.animated && this.ticksPerFrame == properties.ticksPerFrame && this.animatedType == properties.animated && this.frameCount == properties.frameCount) || firstCharacter) {
            this.animated = true;
            this.ticksPerFrame = properties.ticksPerFrame;
            this.animatedType = properties.animated;
            this.frameCount = properties.frameCount;
          } else {
            if(!firstCharacter) {
              sameProperties = false;
            }
          }

        } else {
          if((!this.animated) || firstCharacter) {
            this.animated = false;
          } else {
            if(!firstCharacter) {
              sameProperties = false;
            }
          }

        }


        firstCharacter = false;
      }
    }

    this.frame = 0;
    $('#tileEditorMobileFrame').val(1);


    if(!sameProperties) {
      this.mixedAnimation = true;
      this.updateAnimationOptions({ "hasMixed": true, "selected": "mixed"});
      $('#tileEditorMobileAnimatedType').val('mixed')
    } else {
      this.mixedAnimation = false;
      this.updateAnimationOptions({ "hasMixed": false });

      if(this.animated) {
        $('#tileEditorMobileAnimatedTicksPerFrame').val(this.ticksPerFrame);
        $('#tileEditorMobileAnimatedType').val(this.animatedType);
        $('#tileEditorMobileFrames').val(this.frameCount);
        $('#tileEditorMobileFrame').attr('max', this.frameCount);


        if(this.animatedType == 'frames') {
          $('#tileEditorMobileFrameControls').show();
        } else {
          $('#tileEditorMobileFrameControls').hide();
        }
      } else {
        $('#tileEditorMobileAnimatedType').val('')
        $('#tileEditorMobileFrameControls').hide();

        $('#tileEditorMobileFrames').val(1);
        $('#tileEditorMobileFrame').attr('max', 1);

      }
    }



/*
    if(typeof properties.animated != 'undefined' && properties.animated) {
      $('#tileEditorMobileAnimated').prop('checked', true);
      $('#tileEditorMobileAnimatedTicksPerFrame').val(properties.ticksPerFrame);
      $('#tileEditorMobileAnimatedType').val(properties.animatedType);
    } else {
      $('#tileEditorMobileAnimated').prop('checked', false);
    }

*/

    this.frame = 0;
    $('#tileEditorMobileFrame').val(1);
//    this.drawSelectedCharacters();


    this.resize();
    this.tileEditorMobileGrid.setCharacters(characters);
//    this.editor.grid.update();
    this.editor.currentTile.refresh();

//    console.error('character editor grid set characters');
  },

  updateAnimationOptions: function(args) {
    var hasMixed = false;
    if(typeof args.hasMixed != 'undefined') {
      hasMixed = args.hasMixed;
    }

    var selected = '';
    if(typeof args.selected != 'undefined') {
      selected = args.selected;
    }


    var animationOptions = [
      { "value": '', "label": 'No' },
      { "value": 'mixed', "label": 'Mixed' },
      { "value": 'left', "label": 'Scroll Left' },
      { "value": 'right', "label": 'Scroll Right' },
      { "value": 'up', "label": 'Scroll Up' },
      { "value": 'down', "label": 'Scroll Down' },
      { "value": 'blink', "label": 'Blink' },
      { "value": 'frames', "label": 'Frames' }
    ];


    var html = '';
    for(var i =0 ; i < animationOptions.length; i++) {
      if(animationOptions[i].value != 'mixed' || hasMixed) {
        html += '<option value="' + animationOptions[i].value + '" ';
        if(animationOptions[i] === 'selected') {
          html += ' selected="selected" ';
        }

        html += '>' + animationOptions[i].label + '</option>';
      }
    }
    $('#tileEditorMobileAnimatedType').html(html);
  },

  setFrame: function(frame) {
    if(frame >= this.frameCount) {
      return;
    }
    this.frame = frame;
    $('#tileEditorMobileFrame').val(this.frame + 1);

    this.tileEditorMobileGrid.setFrame(this.frame);
  },

  prevFrame: function() {
    var frame = this.frame - 1;
    if(frame >= 0) {
      this.setFrame(frame);
      $('#tileEditorMobileFrame').val(frame + 1);
    }
  },
  nextFrame: function() {
    var frame = this.frame + 1;
    if(frame < this.frameCount) {
      this.setFrame(frame);
      $('#tileEditorMobileFrame').val(frame + 1);
    }
  },

  insertFrame: function() {

    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.insertFrame(this.characters[y][x], this.frame);
        var properties = this.tileSet.getTileProperties(this.characters[y][x]);
        frameCount = properties.frameCount;
      }
    }



    this.frameCount = frameCount;
    $('#tileEditorMobileFrames').val(frameCount);
    $('#tileEditorMobileFrame').attr('max', frameCount);


    this.setFrame(this.frame + 1);

  },

  deleteFrame: function() {
    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.deleteFrame(this.characters[y][x], this.frame);
        var properties = this.tileSet.getTileProperties(this.characters[y][x]);
        frameCount = properties.frameCount;
      }
    }



    this.frameCount = frameCount;
    $('#tileEditorMobileFrames').val(frameCount);
    $('#tileEditorMobileFrame').attr('max', frameCount);

    if(this.frameCount == 1 ||this.frame == 0) {
      this.setFrame(0);      
    } else {
      this.setFrame(this.frame - 1);
    }
  },


  setAnimated: function(animated) {
    console.error('shouldnt get here');
    var type = $('#tileEditorMobileAnimatedType').val();
    var ticks = parseInt($('#tileEditorMobileAnimatedTicksPerFrame').val(), 10);
    if(isNaN(ticks)) {
      ticks = 6;
    }

    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.setAnimated(this.characters[y][x], animated);
        this.tileSet.setAnimatedType(this.characters[y][x], type);
        this.tileSet.setAnimatedTicksPerFrame(this.characters[y][x], ticks);
      }
    }
//    this.editor.grid.update();
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }


  },

  setTicksPerFrame: function(ticks) {
    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.setAnimatedTicksPerFrame(this.characters[y][x], ticks);
      }
    }
  },


  setAnimatedType: function(type) {
    var animated = true;
    if(type == '') {
      animated = false;
    }

    var ticks = parseInt($('#tileEditorMobileAnimatedTicksPerFrame').val(), 10);
    if(isNaN(ticks)) {
      ticks = 6;
    }


    var frameCount = 0;

    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.setAnimated(this.characters[y][x], animated);
        if(animated) {
          this.tileSet.setAnimatedType(this.characters[y][x], type);    
          this.tileSet.setAnimatedTicksPerFrame(this.characters[y][x], ticks);
        }
        var properties = this.tileSet.getTileProperties(this.characters[y][x]);
        frameCount = properties.frameCount;
      }
    }

    if(this.mixedAnimation) {
      // need to get rid of mixed option, as have selected 
      this.updateAnimationOptions({ "hasMixed": false, "selected": type });
      $('#tileEditorMobileAnimatedType').val(type);
      this.mixedAnimation = false;
    }

    if(type == 'frames') {
      this.frameCount = frameCount;
      $('#tileEditorMobileFrames').val(frameCount);
      $('#tileEditorMobileFrame').attr('max', frameCount);

      $('#tileEditorMobileFrameControls').show();
    } else {
      $('#tileEditorMobileFrameControls').hide();

    }

    this.setFrame(0);

    this.tileEditorMobileGrid.updateCharacter();
    for(var y = 0; y < this.characters.length; y++) {
      for(var x = 0; x < this.characters[y].length; x++) {
        this.tileSet.updateCharacterCurrentData(this.characters[y][x]);
      } 
    }

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

    this.editor.currentTile.refresh();
  },
  
  selectC64ColorType: function(colorType, colorIndex) {
    this.tileEditorMobileGrid.setC64ColorType(colorType);    
    this.tileEditorMobileGrid.setColorIndex(colorIndex);
  },

  selectColorIndex: function(colorIndex) {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    $('#tileEditorMobileMultiColor').css('background-color', '#' + colorPalette.getHexString(colorIndex));

    this.tileEditorMobileGrid.setColorIndex(colorIndex);
  },

  selectSubPaletteColorIndex: function(colorIndex) {
    this.editor.colorPaletteManager.colorSubPalettes.selectPaletteColor(colorIndex);

    /*
    $('.tileEditorMobileSubPaletteColor').css({"border-width": "1px"});

    $('#tileEditorMobileSubPaletteColor-' + colorIndex).css({"border-width": "2px"});
    this.tileEditorMobileGrid.setColorIndex(colorIndex);
    */
  },

  drawSelectedSubPaletteColor: function() {
    var colorIndex = this.tileEditorMobileGrid.getColorIndex();
    $('.tileEditorMobileSubPaletteColor').css({"border-width": "1px"});
    $('#tileEditorMobileSubPaletteColor-' + colorIndex).css({"border-width": "2px"});

  },


  draw: function() {
    this.tileEditorMobileGrid.draw();
  }

}
