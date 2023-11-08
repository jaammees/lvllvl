var TileSetChoosePreset = function() {
  this.editor = null;
  this.uiComponent = null;
  this.callback = false;
  this.type = false; //'character';
  this.tileSet = null;
  this.tileSetImport = null;

  this.previewCharsetId = false;
  this.previewCharsetDescription = '';

  this.createTileSetOnLoad = false;

  this.tileSets = [];
  this.visible = false;
}

TileSetChoosePreset.prototype = {
  init: function(editor) {
    this.editor = editor;

  },

  show: function(args) {
    var _this = this;

    this.createTileSetOnLoad = false;

    if(typeof args != 'undefined') {
      if(typeof args.callback != 'undefined') {
        this.callback = args.callback;
      }

      if(typeof args.createOnLoad != 'undefined') {
        this.createTileSetOnLoad = args.createOnLoad;
      }
    }
    if(this.uiComponent == null) {
      
      this.uiComponent = UI.create("UI.Dialog", { "id": "chooseCharacterSetPresetDialog", "title": "Choose A Tile Set", "width": 800, height: 800 });
      this.splitPanel = UI.create("UI.SplitPanel");

      this.tabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
      this.tabPanel.addTab({ key: 'character',   title: 'Character Sets', isTemp: false }, true);
      this.tabPanel.addTab({ key: 'custom',   title: 'Custom Text Mode Sets', isTemp: false }, true);
      this.tabPanel.addTab({ key: 'vector',   title: 'Vector Tiles', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'load',   title: 'Load/Import Tile Set', isTemp: false }, false);
      this.tabPanel.on('tabfocus', function(key, tabPanel) {      
        
        _this.activeTab = key;
        var tabIndex = _this.tabPanel.getTabIndex(key);
        if(tabIndex >= 0) {
          if(key == 'load') {
            _this.tileSetChoosePanel.showOnly('tileSetImportPanel');
            _this.startLoadTileset({});
          } else {
            _this.tileSetChoosePanel.showOnly('tileSetChoosePresetPanel');
            _this.setTilePresetType(key);
          }
        }
      });

      this.splitPanel.addNorth(this.tabPanel, 40, false);

      this.tileSetChoosePanel = UI.create("UI.Panel", { "id": "tileSetChoosePanel" });
      this.splitPanel.add(this.tileSetChoosePanel);
      this.uiComponent.add(this.splitPanel);

      
      this.tileSetImportPanel = UI.create("UI.Panel", { "id": "tileSetImportPanel" });
      this.tileSetChoosePanel.add(this.tileSetImportPanel);

      this.htmlComponent = UI.create("UI.HTMLPanel", { "id": "tileSetChoosePresetPanel" });
      this.tileSetChoosePanel.add(this.htmlComponent);
      this.tileSetChoosePanel.showOnly('tileSetChoosePresetPanel');


      this.htmlComponent.load('html/textMode/tileSetChoosePreset.html', function() {
        _this.initContent(args);
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {

    
        if(_this.activeTab == 'load') {
          _this.tileSetImport.importTileSet({ callback: _this.callback, createTileSet: _this.createTileSetOnLoad});
        } else {
          if(_this.callback !== false) {          
            _this.callback({
              tileSetCreated: false,
              tileSet: null,
              type: _this.type,
              presetId: _this.previewCharsetId,
              description: _this.previewCharsetDescription
            });//_this.type, _this.previewCharsetId, _this.previewCharsetDescription);
          }
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


      this.uiComponent.on('close', function(event) {
        _this.visible = false;
      });

      UI.showDialog("chooseCharacterSetPresetDialog");

      
    } else {
      UI.showDialog("chooseCharacterSetPresetDialog");
      this.initContent(args);
    }

    this.visible = true;

  },

  startLoadTileset: function(args) {

    if(this.tileSetImport == null) {
      this.tileSetImport = new TileSetImport();
      this.tileSetImport.init(this.editor, this.tileSetImportPanel);
    }

    this.tileSetImport.start(args);

  },

  createTemplateLink: function() {
    UI.closeDialog();
    g_app.createTemplateLink.show({ "charsetId": this.previewCharsetId });
  },

  initEvents: function() {
    var _this = this;

    $('#chooseCharacterSetList').on('click', '.characterSetListEntry', function() {
      var preset = $(this).attr('value');
      $('.characterSetListEntry').removeClass('characterSetListEntrySelected');
      $(this).addClass('characterSetListEntrySelected');
      _this.chooseDialogSelect(preset);

    });

  },


  setTilePresetType: function(type) {
    if(this.type == type) {
      return;
    }
    this.type = type;
    switch(type) {
      case 'character':
        this.showCharacterSetPresets();
        break;
      case 'custom':
        this.showCustomTextModePresets();
        break;
      case 'vector':
        this.showVectorPresets();
        break;
    }
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
    for(var i = 0; i < this.tileSets.length; i++) {
      if(this.tileSets[i] == this.previewCharset.id) {
        if(i > 0) {
          prevIndex = i - 1;
          break;
        }
      }
    }

    if(prevIndex !== false) {
      var selectId = this.tileSets[prevIndex];
      this.chooseDialogSelect(selectId);
      $('.characterSetListEntry').removeClass('characterSetListEntrySelected');
      $('.characterSetListEntry[value=' + selectId + ']').addClass('characterSetListEntrySelected');
    }

  },

  next: function() {
    var nextIndex = false;
    for(var i = 0; i < this.tileSets.length; i++) {
      if(this.tileSets[i] == this.previewCharset.id) {
        if(i < this.tileSets.length - 1) {
          nextIndex = i + 1;
          break;
        }
      }
    }

//    var preset = $(this).attr('value');
//    $('.characterSetListEntry').removeClass('characterSetListEntrySelected');
//    $(this).addClass('characterSetListEntrySelected');
    if(nextIndex !== false) {
      var selectId = this.tileSets[nextIndex];
      this.chooseDialogSelect(selectId);
      $('.characterSetListEntry').removeClass('characterSetListEntrySelected');
      $('.characterSetListEntry[value=' + selectId + ']').addClass('characterSetListEntrySelected');

    }


  },

  showVectorPresets: function() {
    this.tileSets = [];

    var listHTML = '';
    for(var category in VectorPresets) {
      if(VectorPresets.hasOwnProperty(category)) {
        var categoryName = VectorPresets[category].category;

        listHTML += '<div class="characterSetListCategory">' + categoryName + '</div>';

        for(var i = 0; i < VectorPresets[category].characterSets.length; i++) {
          var name = VectorPresets[category].characterSets[i].name;
          var id =  VectorPresets[category].characterSets[i].id;

          this.tileSets.push(id);

          listHTML += '<div class="characterSetListEntry ';

          if(id == 'modular-shapes') {
            listHTML += ' characterSetListEntrySelected ';
          }
          listHTML += '" value="' + id + '">' + name + '</div>';
        }
      }
    }

    $('#chooseCharacterSetList').html(listHTML);

    this.chooseDialogSelect('modular-shapes');

  },

  showCustomTextModePresets: function() {
    var listHTML = '';
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
        var categoryName = CharacterSetPresets[category].category;
        var tilesetCount = 0;

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var type = CharacterSetPresets[category].characterSets[i].type;
          if(typeof type != 'undefined' && type == 'custom') {
            tilesetCount++;
          }
        }

        if(tilesetCount > 0) {
          listHTML += '<div class="characterSetListCategory">' + categoryName + '</div>';

          for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
            var name = CharacterSetPresets[category].characterSets[i].name;
            var id =  CharacterSetPresets[category].characterSets[i].id;
            var type = CharacterSetPresets[category].characterSets[i].type;

            if(typeof type != 'undefined' && type == 'custom') {
              listHTML += '<div class="characterSetListEntry ';
              this.tileSets.push(id);

              if(id == '8px') {
                listHTML += ' characterSetListEntrySelected ';
              }
              listHTML += '" value="' + id + '">' + name + '</div>';
            }
          }
        }
      }
    }


    $('#chooseCharacterSetList').html(listHTML);

    this.chooseDialogSelect('8px');
  },


  showCharacterSetPresets: function() {
    var listHTML = '';
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
        var categoryName = CharacterSetPresets[category].category;

        listHTML += '<div class="characterSetListCategory">' + categoryName + '</div>';

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var name = CharacterSetPresets[category].characterSets[i].name;
          var id =  CharacterSetPresets[category].characterSets[i].id;
          var type = CharacterSetPresets[category].characterSets[i].type;

          if(typeof type == 'undefined' || type != 'custom') {

            listHTML += '<div class="characterSetListEntry ';
            this.tileSets.push(id);

            if(id == 'petscii') {
              listHTML += ' characterSetListEntrySelected ';
            }
            listHTML += '" value="' + id + '">' + name + '</div>';
          }
        }
      }
    }

    $('#chooseCharacterSetList').html(listHTML);

    this.chooseDialogSelect('petscii');
  },


  initContent: function(args) {
    var _this = this;

    if(typeof args.showImport != 'undefined' && args.showImport) {
      this.tabPanel.showTab('load');
      this.tileSetChoosePanel.showOnly('tileSetImportPanel');
      this.activeTab = 'load';      
      this.startLoadTileset(args);

    } else {
      var type = 'character';
      if(typeof args.type != 'undefined') {
        type = args.type;
      }

      this.tabPanel.showTab(type);
      this.setTilePresetType(type);
    }

//    this.showCharacterSetPresets();



  },

  chooseDialogSelect: function(charset) {
    if(typeof charset == 'undefined') {
      return;
    }

    var charset = this.getCharacterSetDescription(charset);
    if(!charset) {
      return;
    }

    this.previewCharset = charset;


    var heading = this.previewCharset.name;
    if(typeof this.previewCharset.author != 'undefined') {
      heading += ' by ' + this.previewCharset.author;
    }

    var info = '';
    if(typeof this.previewCharset.author != 'undefined') {
      info += ' by ' + this.previewCharset.author;
    }

    if(typeof this.previewCharset.authorlink != 'undefined') {
      info += this.previewCharset.authorlink;
    }

    if(info != '') {
      info = '<div>' + info + '</div>';
    }


    if(typeof this.previewCharset.licence != 'undefined') {
      info += '<div>Licence: ' + this.previewCharset.licence + '</div>';
    }

    if(typeof this.previewCharset.notes != 'undefined') {
      info += '</div>' + this.previewCharset.notes + '</div>';
    }


    if(info != '') {
      $('#chooseCharacterSetInfo').html('<div style="margin-top: 4px">' + info + '</div>');
    } else {
      $('#chooseCharacterSetInfo').html('');
    }

    /*
    if(typeof this.previewCharset.authorlink != 'undefined') {
      heading += this.previewCharset.authorlink;
    }
    */
    $('#chooseCharacterSetHeading').html(heading);

//    var info = 'Character Width ' + this.previewCharset.width;
//    info += ', Character Height ' + this.previewCharset.height;


    var description = '';
    if(typeof this.previewCharset.description != 'undefined') {
      description = this.previewCharset.description;
    }

    $('#chooseCharacterSetDescription').html(description);

    var options = '';
    var charsetId = charset.id;

    if(typeof this.previewCharset.options != 'undefined') {
      for(var i = 0; i < this.previewCharset.options.length; i++) {
//        options += '<label class="rb-container" style="margin-right: 8px;"><input type="radio" name="colorPaletteOption" value="' + colorPalette.options[i].id + '" ';

        options += '<label class="rb-container" style="margin-right: 8px;"> ';
        

        options += '<input type="radio" name="charsetOption" value="' + this.previewCharset.options[i].id + '" ';
        if(i == 0) {
          charsetId = this.previewCharset.options[i].id;
          options += ' checked="checked" ';
        }
        options += '/> ';
        options += this.previewCharset.options[i].name;

        if(typeof this.previewCharset.options[i].author != 'undefined') {
          options += ' by ' + this.previewCharset.options[i].author;
        }

        if(typeof this.previewCharset.options[i].authorlink != 'undefined') {
          options += this.previewCharset.options[i].authorlink;
        }
        options += '<span class="checkmark"></span>';
        options += '</label>';
      }
    }
    if(options != '') {
      $('#chooseCharacterSetOptions').html(options);
      $('#chooseCharacterSetOptions').show();
    } else {
      $('#chooseCharacterSetOptions').hide();

    }

    var _this = this;

    $('input[type=radio][name=charsetOption]').on('change', function() {
      var charsetId = $('input[name=charsetOption]:checked').val();
      _this.setPreviewCharacterset(charsetId);
    });
    this.setPreviewCharacterset(charsetId);
  },


  setPreviewFromImg: function(args) {
    
    var img = args.img;
    var interpret = args.interpret;

    //var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!this.tileSet) {
      this.tileSet = new TileSet();
    }

    var charset = this.previewCharset;

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('chooseCharacterSetPreview');
    }



    if(!interpret) {
      this.previewCanvas.width = img.naturalWidth;
      this.previewCanvas.height = img.naturalHeight;

      var previewContext = this.previewCanvas.getContext('2d');
      previewContext.drawImage(img, 0, 0);
      //var previewImageData = previewContext.getImageData(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    } else {
      var spacing = 2;
      var scale = 2;
      if(charset.height > 10) {
        scale = 1;
      }

      var charsAcross = 16;
      var charsDown = 16;

      if(this.charCanvas == null) {
        this.charCanvas = document.createElement('canvas');
      }

      this.charCanvas.width = this.img.naturalWidth;
      this.charCanvas.height = this.img.naturalHeight;
      var charContext = this.charCanvas.getContext('2d');
      charContext.drawImage(this.img, 0, 0);
      var charImageData = charContext.getImageData(0, 0, this.charCanvas.width, this.charCanvas.height);


      var args = {};
      args.srcImageData = charImageData;
      args.characterWidth = charset.width;
      args.characterHeight = charset.height;
      args.dstCharacterSpacing = 2;
      args.scale = scale;

      charsAcross = this.charCanvas.width / args.characterWidth;
      charsDown = this.charCanvas.height / args.characterHeight;

      this.previewCanvas.width = scale * charset.width * 16 + spacing * 17;
      this.previewCanvas.height = scale * charset.height * charsDown + spacing * (charsDown + 1);

      var previewContext = this.previewCanvas.getContext('2d');
      var previewImageData = previewContext.getImageData(0, 0, this.previewCanvas.width, this.previewCanvas.height);


      args.dstImageData = previewImageData;

      this.tileSet.readImageData(args);
      previewContext.putImageData(previewImageData, 0, 0);  
    }

  },

  dropFile: function(file) {
    var _this = this;
    
    this.tileSetChoosePanel.showOnly('tileSetImportPanel');
    this.activeTab = 'load';    
    this.startLoadTileset({ 'dialogReadyCallback': function() {
      _this.tileSetImport.chooseTileSetFile(file);
    }});

    
  },


  // preview charset for choose preset
  setPreviewCharacterset: function(charsetId) {
    

    this.previewCharsetId = charsetId;
    this.previewCharsetDescription = this.getCharacterSetDescription(charsetId);


    var _this = this;

    var filename = charsetId + '.png?1';
    var url = "charsets/" + filename;

    if(this.type == 'vector') {
      url = 'vectorsets/' + filename;
    }

    if(!this.img) {
      this.img = new Image();
      this.img.onload = function() {
        var args = {};

        args["img"] = _this.img;
        args['interpret'] = _this.type != 'vector';
        _this.setPreviewFromImg(args);

      }
    }

    this.img.src = url;
  },


  getCharacterSetDescription: function(preset) {
    var presets = CharacterSetPresets;
    if(this.type == 'vector') {
      presets = VectorPresets;
    }

    for(var category in presets) {
      if(presets.hasOwnProperty(category)) {

        for(var i = 0; i < presets[category].characterSets.length; i++) {
          var id =  presets[category].characterSets[i].id;
          if(id == preset) {
            charWidth = presets[category].characterSets[i].width;
            charHeight = presets[category].characterSets[i].height;
            if(typeof presets[category].characterSets[i].type == 'undefined') {
              presets[category].characterSets[i].type = 'ascii';
            }

            return presets[category].characterSets[i];

          }
        }
      }
    }
    return null;
  }
}