var ColorPaletteChoosePreset = function() {
  this.editor = null;
  this.uiComponent = null;

  this.previewColorPalette = null;

  this.img = null;
//  this.previewCanvas = null;
  this.paletteCanvas = null;

  this.colorPaletteSampleImage = null;
  this.sampleImageCanvas = null;
  this.sampleImageContext = null;

  this.brightness = 0;
  this.contrast = 0;
  this.saturation = 0;

  this.colorPaletteDisplay = null;

  this.setColorPalette = false;
  this.callback = false;

  this.previewColorPaletteId = false;
  this.previewColorPaletteDescription = '';

  this.activeTab = 'system';

  this.colorPalettes = [];
  this.visible = false;

  this.colorPaletteLoad = null;
}

ColorPaletteChoosePreset.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  setupSampleImage: function(callback) {
    this.colorPaletteSampleImage = new Image();
    this.colorPaletteSampleImage.onload = callback;

    this.colorPaletteSampleImage.src = 'images/color_palette_sample.png';
  },

  show: function(args) {
    var _this = this;
    this.visible = true;

    this.setColorPalette = true;
    this.callback = false;
    this.createOnLoad = false;


    if(typeof args != 'undefined') {
      if(typeof args.setColorPalette != 'undefined') {
        this.setColorPalette = args.setColorPalette;
      }

      if(typeof args.callback != 'undefined') {
        this.callback = args.callback;
      }

      if(typeof args.createOnLoad != 'undefined') {
        this.createOnLoad = args.createOnLoad;
      }
    }

    if(this.uiComponent == null) {
      var width = 636;
      var height = 646;
      this.uiComponent = UI.create("UI.Dialog", { "id": "colorPaletteChoosePresetDialog", "title": "Choose A Colour Palette", "width": width, "height": height });

      this.splitPanel = UI.create("UI.SplitPanel");

      this.tabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
      this.tabPanel.addTab({ key: 'system',   title: 'System Palettes', isTemp: false }, true);
      this.tabPanel.addTab({ key: 'custom',   title: 'Custom Palettes', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'load',   title: 'Load/Import Palette', isTemp: false }, false);

      this.tabPanel.on('tabfocus', function(key, tabPanel) {                    
        var tabIndex = _this.tabPanel.getTabIndex(key);
        _this.activeTab = key;
        if(tabIndex >= 0) {
          if(key == 'load') {
            _this.colorPaletteChoosePanel.showOnly('colorPaletteImportPanel');
            _this.startLoadColorPalette({});
          } else {
            _this.colorPaletteChoosePanel.showOnly("colorPaletteChoosePresetPanel");
            _this.setColorPalettePresetType(key);
          }
        }
      });

      this.splitPanel.addNorth(this.tabPanel, 30, false);

      this.colorPaletteChoosePanel = UI.create("UI.Panel", { "id": "colorPaletteChoosePanel" });
      this.splitPanel.add(this.colorPaletteChoosePanel);
      this.uiComponent.add(this.splitPanel);

      this.colorPaletteImportPanel = UI.create("UI.Panel", { "id": "colorPaletteImportPanel" });
      this.colorPaletteChoosePanel.add(this.colorPaletteImportPanel);


      this.htmlComponent = UI.create("UI.HTMLPanel", { "id": "colorPaletteChoosePresetPanel" });
      this.colorPaletteChoosePanel.add(this.htmlComponent);
      this.colorPaletteChoosePanel.showOnly("colorPaletteChoosePresetPanel");

      //this.splitPanel.add(this.htmlComponent);

      this.uiComponent.add(this.splitPanel);
//      this.htmlComponent = UI.create("UI.HTMLPanel");
      //this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/colorPaletteChoosePreset.html', function() {
        _this.setupSampleImage(function() {
          _this.initContent(args);
          _this.initEvents();
        });
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
    
        if(_this.activeTab == 'load') {
          _this.colorPaletteLoad.setPalette({ callback: _this.callback, createColorPalette: _this.createOnLoad});
        } else {
          _this.choosePreset(_this.previewColorPalette.selectedPaletteId);//,  { brightness: _this.brightness, saturation: _this.saturation, contrast: _this.contrast});
        }
        UI.closeDialog();
      });

      this.linkButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-351-link.svg"> Create A Template Link', "color": "other" });
      this.uiComponent.addButton(this.linkButton);
      this.linkButton.on('click', function(event) {
        _this.createTemplateLink();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();

      });


      this.uiComponent.on('keydown', function(event) {
        _this.keydown(event);
      });

      this.uiComponent.on('keyup', function(event) {
        _this.keyup(event);
      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
      });
    } else {
      this.initContent(args);      
    }

    UI.showDialog("colorPaletteChoosePresetDialog");
  },

  startLoadColorPalette: function(args) {
    
    if(this.colorPaletteLoad == null) {
      this.colorPaletteLoad = new ColorPaletteLoad();
      this.colorPaletteLoad.init(this.editor, this.colorPaletteImportPanel);
    }

    this.colorPaletteLoad.show(args);

  },

  keydown: function(event) {
    var key = event.key;
    if(typeof key != 'undefined') {
      key = key.toLowerCase();
      if(key == 'arrowup' || key == 'arrowleft') {
        this.prev()
      }

      if(key == 'arrowdown' || key == 'arrowright') {
        this.next();
      }

    } else {
      switch(event.keyCode) {
        case 38: // arrow up
        case 37: // arrow left
          this.prev();
          break;
        case 40: // arrow down
        case 39: // arrow right
          this.next();
          break;

      }

    }

  },

  keyup: function(event) {

  },

  prev: function() {
    var prevIndex = false;
    for(var i = 0; i < this.colorPalettes.length; i++) {
      if(this.colorPalettes[i] == this.previewColorPalette.id) {
        if(i > 0) {
          prevIndex = i - 1;
          break;
        }
      }
    }

    if(prevIndex !== false) {
      var selectId = this.colorPalettes[prevIndex];

      this.colorPaletteDialogSelect(selectId);
      $('.colorPaletteListEntry ').removeClass('colorPaletteListEntrySelected');
      $('.colorPaletteListEntry[value=' + selectId + ']').addClass('colorPaletteListEntrySelected');
    }

  },

  next: function() {
    var nextIndex = false;
    for(var i = 0; i < this.colorPalettes.length; i++) {
      if(this.colorPalettes[i] == this.previewColorPalette.id) {
        if(i < this.colorPalettes.length - 1) {
          nextIndex = i + 1;
          break;
        }
      }
    }

    if(nextIndex !== false) {
      var selectId = this.colorPalettes[nextIndex];
      this.colorPaletteDialogSelect(selectId);
      $('.colorPaletteListEntry ').removeClass('colorPaletteListEntrySelected');
      $('.colorPaletteListEntry[value=' + selectId + ']').addClass('colorPaletteListEntrySelected');
    }
  },
  
  
  createTemplateLink: function() {
    UI.closeDialog();
    g_app.createTemplateLink.show({ "colorPaletteId": this.previewColorPalette.selectedPaletteId });
  },

  dropFile: function(file) {
    console.log('drop file!');
    console.log(file);
    this.colorPaletteLoad.setImportFile(file);
  },


  initContent: function(args) {
    

    if(this.colorPaletteDisplay == null) {
      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { canvasElementId: "chooseColorPalettePreview" });
      this.colorPaletteDisplay.setColorSize(24, 24, 1);
    }

    this.showSystemColorPalettes();

    if(typeof args.tab != 'undefined') {
      if(args.tab == 'load') {
        this.activeTab = 'load';
        this.colorPaletteChoosePanel.showOnly('colorPaletteImportPanel');
        this.startLoadColorPalette(args);
        this.tabPanel.showTab('load');
      } else {
        this.activeTab = 'system';
        this.colorPaletteChoosePanel.showOnly("colorPaletteChoosePresetPanel");
        this.setColorPalettePresetType(this.activeTab);
        this.tabPanel.showTab(this.activeTab);
      }
    } else {
      this.activeTab = 'system';
      this.colorPaletteChoosePanel.showOnly("colorPaletteChoosePresetPanel");
      this.setColorPalettePresetType(this.activeTab);
      this.tabPanel.showTab(this.activeTab);
    }

  },

  initEvents: function() {

    var _this = this;

    var _this = this;
    $('#chooseColorPaletteList').on('click', '.colorPaletteListEntry', function() {
      var preset = $(this).attr('value');

      $('.colorPaletteListEntry').removeClass('colorPaletteListEntrySelected');
      $(this).addClass('colorPaletteListEntrySelected');

      _this.colorPaletteDialogSelect(preset);
    });


    $('#choosePaletteBrightness').on('change', function() {
      _this.brightness = $(this).val();

      $('#choosePaletteBrightnessValue').val(_this.brightness);
      _this.previewPalette();
    });

    $('#choosePaletteBrightness').on('input', function() {
      _this.brightness = $(this).val();

      $('#choosePaletteBrightnessValue').val(_this.brightness);
      _this.previewPalette();
    });

    $('#choosePaletteBrightnessValue').on('change', function() {
      _this.brightness = $(this).val();
      $('#choosePaletteBrightness').val(_this.brightness);
      _this.previewPalette();
    });

    $('#choosePaletteBrightnessReset').on('click', function() {
      _this.brightness = 0;
      $('#choosePaletteBrightness').val(_this.brightness);
      $('#choosePaletteBrightnessValue').val(_this.brightness);
      _this.previewPalette();

    });

    $('#choosePaletteContrast').on('change', function() {
      _this.contrast = $(this).val();

      $('#choosePaletteContrastValue').val(_this.contrast);
      _this.previewPalette();
    });

    $('#choosePaletteContrast').on('input', function() {
      _this.contrast = $(this).val();

      $('#choosePaletteContrastValue').val(_this.contrast);
      _this.previewPalette();
    });

    $('#choosePaletteContrastValue').on('change', function() {
      _this.contrast = $(this).val();

      $('#choosePaletteContrast').val(_this.contrast);
      _this.previewPalette();
    });

    $('#choosePaletteContrastReset').on('click', function() {
      _this.contrast = 0;
      $('#choosePaletteContrast').val(_this.contrast);
      $('#choosePaletteContrastValue').val(_this.contrast);
      _this.previewPalette();

    });


    $('#choosePaletteSaturation').on('change', function() {
      _this.saturation = $(this).val();

      $('#choosePaletteSaturationValue').val(_this.saturation);
      _this.previewPalette();
    });

    $('#choosePaletteSaturation').on('input', function() {
      _this.saturation = $(this).val();
      $('#choosePaletteSaturationValue').val(_this.saturation);
      _this.previewPalette();
    });


    $('#choosePaletteSaturationValue').on('change', function() {
      _this.saturation = $(this).val();

      $('#choosePaletteSaturation').val(_this.saturation);
      _this.previewPalette();
    });    

    $('#choosePaletteSaturationReset').on('click', function() {
      _this.saturation = 0;
      $('#choosePaletteSaturation').val(_this.saturation);
      $('#choosePaletteSaturationValue').val(_this.saturation);
      _this.previewPalette();

    });

  },


  showSystemColorPalettes: function() {
    var listHTML = '';

    this.colorPalettes = [];

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {
        var categoryName = ColorPalettePresets[category].category;

        listHTML += '<div class="colorPaletteListCategory">' + categoryName + '</div>';

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var name = ColorPalettePresets[category].colorPalettes[i].name;
          var id =  ColorPalettePresets[category].colorPalettes[i].id;

          listHTML += '<div class="colorPaletteListEntry ';

          if(id == 'c64_colodore') {
            listHTML += ' colorPaletteListEntrySelected ';
          }

          this.colorPalettes.push(id);

          listHTML += '" value="' + id + '">' + name + '</div>';

        }
      }
    }

    this.colorPaletteDialogSelect('c64_colodore');
    $('#chooseColorPaletteList').html(listHTML);
  },

  
  showCustomColorPalettes: function() {
    var listHTML = '';

    this.colorPalettes = [];
    for(var category in ColorPaletteCustomPresets) {
      if(ColorPaletteCustomPresets.hasOwnProperty(category)) {
        var categoryName = ColorPaletteCustomPresets[category].category;

        listHTML += '<div class="colorPaletteListCategory">' + categoryName + '</div>';

        for(var i = 0; i < ColorPaletteCustomPresets[category].colorPalettes.length; i++) {
          var name = ColorPaletteCustomPresets[category].colorPalettes[i].name;
          var id =  ColorPaletteCustomPresets[category].colorPalettes[i].id;

          listHTML += '<div class="colorPaletteListEntry ';

          if(id == 'c64_colodore') {
            listHTML += ' colorPaletteListEntrySelected ';
          }
          this.colorPalettes.push(id);
          listHTML += '" value="' + id + '">' + name + '</div>';

        }
      }
    }

    this.colorPaletteDialogSelect('c64_colodore');
    $('#chooseColorPaletteList').html(listHTML);
  },


  colorPaletteDialogSelect: function(preset) {
    var colorPalette = this.getColorPaletteDescription(preset);
    this.previewColorPalette = colorPalette;
    var heading = this.previewColorPalette.name;
    if(typeof this.previewColorPalette.author !== 'undefined') {
      heading += ' by ' + this.previewColorPalette.author;
    }
    $('#chooseColorPaletteHeading').html(heading);
    var info = '';
    $('#chooseColorPaletteInfo').html(info);

    var description = '';
    if(typeof this.previewColorPalette.description != 'undefined') {
      description = this.previewColorPalette.description;
    }

    $('#chooseColorPaletteDescription').html(description);


    var options = '';
    var paletteId = colorPalette.id;
/*
                <label class="rb-container" style="margin-right: 4px">HSV / RGB
                  <input type="radio" name="editColorPaletteMethod" value="rgb" checked="checked"> 
                  <span class="checkmark"/>
                </label>
*/
    if(typeof colorPalette.options != 'undefined') {
      for(var i = 0; i < colorPalette.options.length; i++) {
        options += '<label class="rb-container" style="margin-right: 8px;"><input type="radio" name="colorPaletteOption" value="' + colorPalette.options[i].id + '" ';
        if(i == 0) {
          paletteId = colorPalette.options[i].id;
          options += ' checked="checked" ';
        }
        options += '> ' + colorPalette.options[i].name + '<span class="checkmark"/></label>&nbsp;';
      }

    }

    if(options != '') {
      $('#chooseColorPaletteOptions').html(options);
      $('#chooseColorPaletteOptions').show();
    } else {
      $('#chooseColorPaletteOptions').hide();

    }

    var thisColorPalette = this;

    $('input[type=radio][name=colorPaletteOption]').on('change', function() {
      var paletteId = $('input[name=colorPaletteOption]:checked').val();
      thisColorPalette.previewColorPalette.selectedPaletteId = paletteId;
      var filename = paletteId + '.png';
      var url = "palettes/" + filename;
      thisColorPalette.previewFromPaletteImage(url);
    });

//    var filename = colorPalette.id + '.png';

    this.previewColorPalette.selectedPaletteId = paletteId;
    var filename = paletteId + '.png';
    var url = "palettes/" + filename;
    this.previewFromPaletteImage(url);
  },

  setColorPalettePresetType: function(type) {
    if(type == 'system') {
      this.showSystemColorPalettes();
    } else {
      this.showCustomColorPalettes();
    }
  },


  previewFromPaletteImage: function(url) {

    if(this.img == null) {
      this.img = new Image();
    }

    var thisColorPalette = this;
    this.img.onload = function() {
      thisColorPalette.paletteImage = thisColorPalette.img;
      thisColorPalette.previewPalette();      
    }

    this.img.src = url;
  },

  previewPalette: function() {

    var charsetUtil = this.editor.tileSetManager.getCurrentTileSet();

    var colors = this.editor.colorPaletteManager.colorPaletteFromPaletteImg(this.paletteImage,
      { brightness: this.brightness, saturation: this.saturation, contrast: this.contrast});
    var colorsCount = colors.colors.length;

    var colorWidth = 16;
    var colorHeight = 16;
    var spacing = 2;
    var colorsAcross = 8;
    var colorsDown = 2;

    colorsAcross = Math.floor(this.paletteImage.naturalWidth / 8);
    colorsDown = Math.floor(this.paletteImage.naturalHeight / 8);

    var colorMap = [];
    var colorIndex = 0;
    for(var y = 0; y < colorHeight; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorWidth; x++) {
        if(y < colorsDown && x < colorsAcross) {
          colorMap[y][x] = colorIndex++;
        } else {
          colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }

      }
    }
    this.colorPaletteDisplay.setColors(colors.colors, { colorMap: colorMap });

//    this.showSampleImage(colors.colors);
  },  



  showSampleImage: function(colors) {
    return;
    
    if(this.sampleImageCanvas == null) {
      this.sampleImageCanvas = document.getElementById('chooseColorPaletteSampleImage');
      this.sampleImageContext = this.sampleImageCanvas.getContext('2d');

    }

    this.sampleImageContext.drawImage(this.colorPaletteSampleImage,0,0);

    var imageData = this.sampleImageContext.getImageData(0, 0, this.sampleImageCanvas.width, this.sampleImageCanvas.height);    
//    ImageUtils.rgbQuant(imageData, colors, null);
    ImageUtils.rgbQuant(imageData, { palette: colors, dithKern: null}); //colors, null);
    this.sampleImageContext.putImageData(imageData, 0, 0, 0, 0, this.sampleImageCanvas.width , this.sampleImageCanvas.height); 

  },


/*

  colorPaletteFromPaletteImg: function(image) {
    if(!this.canvas) {
      this.canvas = document.createElement('canvas');

    }
    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;

    var context = this.canvas.getContext('2d')
    context.drawImage(image, 0, 0);
    var imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    if(this.brightness != 0) {
      ImageUtils.adjustBrightness(imageData, this.brightness);
    }

    if(this.saturation != 0) {
      ImageUtils.adjustSaturation(imageData, this.saturation);      
    }

    if(this.contrast != 0) {
      ImageUtils.adjustContrast(imageData, this.contrast);      
    }

    var colors = [];
    var includedColors = {};

    for(var y = 0; y < this.canvas.height; y += 8) {
      for(var x = 0; x < this.canvas.width; x += 8) {
        var srcPos = ((y * this.canvas.width) + x) * 4;

        var r = imageData.data[srcPos];
        var g = imageData.data[srcPos + 1];
        var b = imageData.data[srcPos + 2];

//        var color = r + (g << 8) + (b << 16);
        var color = (r << 16) + (g << 8) + (b);

//        if(!includedColors.hasOwnProperty(color)) {
//          includedColors[color] = true;
          colors.push(color)
//        }

      }
    }

    return colors;
  },
  
*/

  // TODO: should this be in colorpalette.js?
  choosePreset: function(preset, callback) {
    this.previewColorPaletteId = preset;
    this.previewColorPaletteDescription = this.getColorPaletteDescription(preset);
  
    if(!this.setColorPalette) {
      if(this.callback !== false) {
        this.callback({
          colorPaletteCreated: false,
          colorPalette: null,
          presetId: preset,
          description: this.previewColorPaletteDescription
        });
      }

      return;
    }


    var _this = this;
    var url = 'palettes/' + preset + '.png';

    if(url !== false) {
      var colorPaletteChoosePreset = this;
      var img = new Image();
      img.src = url;
      img.onload = function() {

        var colors = _this.editor.colorPaletteManager.colorPaletteFromPaletteImg(img, 
            { brightness: _this.brightness, saturation: _this.saturation, contrast: _this.contrast});//colorPaletteChoosePreset.colorPaletteFromPaletteImg(img);
        var colorsAcross = Math.floor(img.naturalWidth / 8);
        var colorsDown = Math.floor(img.naturalHeight / 8);

        var colorPalette = colorPaletteChoosePreset.editor.colorPaletteManager.getCurrentColorPalette();
        //colorPalette.name = preset;

//        colorPalette.setName(preset);
    
        colorPalette.setColors(colors.colors, colorsAcross, colorsDown);

        var colorMap = [];
        var colorIndex = 0;
        for(var y = 0; y < colorsDown; y++) {
          colorMap.push([]);
          for(var x = 0; x < colorsAcross; x++) {
            if(colorIndex < colors.colors.length) {
              colorMap[y][x] = colorIndex;
              colorIndex++;
            }
          }
        }

        colorPalette.setColorPaletteMap('Default Layout', colorMap);
        _this.editor.colorPaletteManager.colorPaletteUpdated();



        if(colorPalette.name.indexOf('c64') != -1) {
          colorPalette.setIsC64Palette(true);
        }
        colorPalette.setSortOrderMethod('default');
        
            
        if(typeof callback !== 'undefined' && callback != null) {
          callback();
        }

        if(g_app.getMode() == 'color palette') {          
          g_app.colorPaletteEditor.draw();
        }

      }
    }
  },  


  getColorPaletteDescription: function(preset) {
    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var id =  ColorPalettePresets[category].colorPalettes[i].id;
          if(id == preset) {
            return ColorPalettePresets[category].colorPalettes[i];
          }
        }
      }
    }

    for(var category in ColorPaletteCustomPresets) {
      if(ColorPaletteCustomPresets.hasOwnProperty(category)) {

        for(var i = 0; i < ColorPaletteCustomPresets[category].colorPalettes.length; i++) {
          var id =  ColorPaletteCustomPresets[category].colorPalettes[i].id;
          if(id == preset) {
            return ColorPaletteCustomPresets[category].colorPalettes[i];
          }
        }
      }
    }

    return null;
  }



}