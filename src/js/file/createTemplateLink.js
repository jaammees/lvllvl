var CreateTemplateLink = function() {
  
  this.uiComponent = null;
  this.charsetId = 'petscii';
  this.colorPaletteId = 'c64_colodore';
}

CreateTemplateLink.prototype = {
  init: function() {
  },

  show: function(args) {
    this.charsetId = 'petscii';
    this.colorPaletteId = 'c64_colodore';

    console.log(args);

    if(typeof args != 'undefined') {
      if(typeof args.charsetId != 'undefined') {
        this.charsetId = args.charsetId;
      }

      if(typeof args.colorPaletteId != 'undefined') {
        this.colorPaletteId = args.colorPaletteId;
      }
    }


    var _this = this;
    if(this.uiComponent == null) {

      var width = 400;
      var height = 330;

      this.uiComponent = UI.create("UI.Dialog", { "id": "createTemplateLinkDialog", "title": "Create Template Link", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/project/createTemplateLink.html', function() {
        _this.initEvents();
        _this.initContent();
      });

/*
      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.okButton.on('click', function(event) {

        UI.closeDialog();
      });
 */
      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });      
      this.uiComponent.addButton(this.closeButton);

      this.uiComponent.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
  
      });

    } else {
      this.initContent();
    }

    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

    UI.showDialog("createTemplateLinkDialog");

  },

  initEvents: function() {
    var _this = this;
    $('#templateLinkTileSetList').on('change', function() {
      _this.generateLink();
    });

    $('#templateLinkColorPaletteList').on('change', function() {
      _this.generateLink();
    });

    $('#templateLinkScreenMode').on('change', function() {
      _this.generateLink();
    });
 
      
    $('#templateLinkCanFlipTiles').on('click', function() {
      _this.generateLink();
    });

    $('#templateLinkCanRotateTiles').on('click', function() {
      _this.generateLink();
    });


    $('#templateLinkCopy').on('click', function() {
      _this.copyLink();
    });

    $('#templateLinkEditorList').on('change', function() {
      var editor = $(this).val();
      _this.setEditor(editor);
      _this.generateLink();
    });
  },

  initContent: function() {
    this.initCharsets();
    this.initColorPalettes();
    this.generateLink();
  },

  initCharsets: function() {
    var listHTML = '';
    var _this = this;

    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
        var categoryName = CharacterSetPresets[category].category;

        listHTML += '<optgroup label="' + categoryName + '">';

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var name = CharacterSetPresets[category].characterSets[i].name;
          var id =  CharacterSetPresets[category].characterSets[i].id;
          

          listHTML += '<option value="' + id + '"';
          if(id == this.charsetId) {
            listHTML += ' selected="selected" ';
          }
          listHTML += '>';
          listHTML += name;
          listHTML += '</option>';

          if(typeof CharacterSetPresets[category].characterSets[i].options != 'undefined') {
            for(var j = 0; j < CharacterSetPresets[category].characterSets[i].options.length; j++) {
              var name = CharacterSetPresets[category].characterSets[i].options[j].name;
              var id =  CharacterSetPresets[category].characterSets[i].options[j].id;
              
    
              listHTML += '<option value="' + id + '"';
              if(id == this.charsetId) {
                listHTML += ' selected="selected" ';
              }
              listHTML += '>&nbsp;&nbsp;&nbsp;&nbsp;';
              listHTML += name;
              listHTML += '</option>';
    
            }
          }
        }

        listHTML += '</optgroup>';
      }
    }
    $('#templateLinkTileSetList').html(listHTML);
  },

  initColorPalettes: function() {
    var listHTML = '';

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {
        var categoryName = ColorPalettePresets[category].category;

        listHTML += '<optgroup label="' + categoryName + '">';

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var name = ColorPalettePresets[category].colorPalettes[i].name;
          var id =  ColorPalettePresets[category].colorPalettes[i].id;

          listHTML += '<option value="' + id + '" ';

          if(id == this.colorPaletteId) {
            listHTML += ' selected="selected" ';
          }
          listHTML += '>' + name + '</option>';

        }

        listHTML += '</optgroup>';
      }
    }

    $('#templateLinkColorPaletteList').html(listHTML);
  },

  setEditor: function(editor) {
    this.editor = editor;
    switch(this.editor) {
      case 'screen':
        break;
      case 'sprite':
        break;
      case 'music':
        break;
      case 'assembly':
        break;
      case 'color':
        break;
      case 'c64':
        break;
    }

  },

  generateLink: function() {
    console.log("GENERATE LINK");

    var editor = $('#templateLinkEditorList').val();
    var tileSet = $('#templateLinkTileSetList').val();
    var colorPalette = $('#templateLinkColorPaletteList').val();
    var width = parseInt($('#templateLinkWidth').val(), 10);
    var height = parseInt($('#templateLinkHeight').val(), 10);
    var screenMode = $('#templateLinkScreenMode').val();
    var tileFlip = $('#templateLinkCanFlipTiles').is(':checked');
    var tileRotate = $('#templateLinkCanRotateTiles').is(':checked');

    var link = 'https://lvllvl.com/?';

    link += 'editor=' + editor;
    link += '&tileset=' + tileSet;
    link += '&palette=' + colorPalette;
    link += '&width=' + width;
    link += '&height=' + height;
    link += '&mode=' + screenMode;
    if(tileFlip) {
      link += '&tileflip=1';
    }
    if(tileRotate) {
      link += '&tilerotate=1';
    }
    $('#templateLink').val(link);
  },

  copyLink: function() {
    var copyText = document.getElementById("templateLink");

    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");    
  }

}