var DropImage = function() {
  this.editor = null;

  this.uiComponent = null;
}

DropImage.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function() {
    var width = 220;
    var height = 186;
    this.uiComponent = UI.create("UI.Dialog", { "id": "dropImage", "title": "Image", "width": width, "height": height });

    var html = '';

    html += '<div>';
    html += '<label class="rb-container">Import/Convert Image';
    html += '<input type="radio" name="dropImageAction" id="dropImageAction_import" value="import" checked="checked">';
    html += '<span class="checkmark"></span>';
    html += '</label>';
    html += '</div>';

    html += '<div>';
    html += '<label class="rb-container">Set as layer background';
    html += '<input type="radio" name="dropImageAction" id="dropImageAction_background" value="background">';
    html += '<span class="checkmark"></span>';
    html += '</label>';
    html += '</div>';

    html += '<div>';
    html += '<label class="rb-container">Import as a Tile Set';
    html += '<input type="radio" name="dropImageAction" id="dropImageAction_charset" value="charset">';
    html += '<span class="checkmark"></span>';
    html += '</label>';
    html += '</div>';


    html += '<div>';
    html += '<label class="rb-container">Import as a Colour Palette';
    html += '<input type="radio" name="dropImageAction" id="dropImageAction_colorpalette" value="colorpalette">';
    html += '<span class="checkmark"></span>';
    html += '</label>';
    html += '</div>';

    this.newHTML = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.add(this.newHTML);

    var _this = this;
    this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
    this.okButton.on('click', function(event) { 
      UI.closeDialog();
      _this.doAction();
    });

    this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
    this.closeButton.on('click', function(event) {
      UI.closeDialog();
    });

    this.uiComponent.addButton(this.okButton);
    this.uiComponent.addButton(this.closeButton);
  },

  processAction: function(action) {
    var _this = this;

    if(action == 'import') {
      g_app.textModeEditor.importImage.start({
        dialogReadyCallback: function() {
          g_app.textModeEditor.importImage.setImportImage(_this.file);
        }
      });
    }

    if(action == 'background') {
      g_app.textModeEditor.showReferenceImageDialog({
        dialogReadyCallback: function() {
          g_app.textModeEditor.referenceImageDialog.chooseImage(_this.file);
        }
      });
    }    

    if(action == 'charset') {
      g_app.textModeEditor.tileSetManager.showImport({
        dialogReadyCallback: function() {

          g_app.textModeEditor.tileSetManager.tileSetChoosePreset.tileSetImport.chooseTileSetFile(_this.file);        

        }
      });
    }

    if(action == 'colorpalette') {
      // show the load colour palette dialog
      g_app.textModeEditor.colorPaletteManager.showLoad({
        dialogReadyCallback: function() {
          g_app.textModeEditor.colorPaletteManager.colorPaletteChoosePreset.dropFile(_this.file);
//          g_app.textModeEditor.colorPaletteManager.colorPaletteLoad.setImportFile(_this.file);
        }
      });      
    }
  },

  doAction: function() {
    var action = $('input[name=dropImageAction]:checked').val();
    var _this = this;

    if(g_app.doc == null) {
      // need to create the doc
      var args = {};
      args.mode = 'monochrome';
      args.width = 40;
      args.height = 25;
      
      g_app.newProject(args, function() {
        _this.processAction(action);
      });
    } else {
      this.processAction(action);
    }
  },


  start: function(file) {

    console.log("DROP IMAGE!!!");
    
    this.file = file;
    if(this.uiComponent == null) {
      this.buildInterface();
    }

    if(g_app.doc !== null) {
      // a doc is open, do we already know what to do without asking user?
      if(g_app.textModeEditor.importImage.visible) {
        this.doAction('import');
        return;
      }

      /*
      if(g_app.textModeEditor.colorPaletteManager.colorPaletteLoad && g_app.textModeEditor.colorPaletteManager.colorPaletteLoad.visible) {
        g_app.textModeEditor.colorPaletteManager.colorPaletteLoad.setImportFile(this.file);
        return;
      }
      */

      if(g_app.textModeEditor.colorPaletteEdit && g_app.textModeEditor.colorPaletteEdit.visible) {
        g_app.textModeEditor.colorPaletteEdit.dropFile(file);
        return;
      }


    }

    if(g_app.textModeEditor.colorPaletteManager.colorPaletteChoosePreset && g_app.textModeEditor.colorPaletteManager.colorPaletteChoosePreset.visible) {
      g_app.textModeEditor.colorPaletteManager.colorPaletteChoosePreset.dropFile(file);
      return;
    }

    
    if(g_app.textModeEditor.tileSetManager.tileSetChoosePreset && g_app.textModeEditor.tileSetManager.tileSetChoosePreset.visible) {
      g_app.textModeEditor.tileSetManager.tileSetChoosePreset.dropFile(file);
      return;
    }



    UI.closeAllDialogs();
    UI.showDialog("dropImage");

//    console.log(file);

  }
}


