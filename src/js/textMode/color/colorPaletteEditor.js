var ColorPaletteEditor = function() {
  this.doc = null;
  this.uiComponent = null;
  this.colorPaletteEdit = null;
}

ColorPaletteEditor.prototype = {
  init: function() {

  },

  buildInterface: function(parentPanel) {
    if(this.uiComponent != null) {
      return;
    }

    this.uiComponent = UI.create("UI.Panel", { "id": "colorPaletteEditor" } );
    parentPanel.add(this.uiComponent);

    this.colorPaletteEdit = new ColorPaletteEdit();
    this.colorPaletteEdit.init(g_app.textModeEditor);
    this.colorPaletteEdit.buildInterface(this.uiComponent);
    

//    var htmlPanel = UI.create("UI.HTMLPanel", { "html": '<div style="color: white; background-color: red">colorpalette editor</div>' });

//    this.uiComponent.add(htmlPanel);

  },

  draw: function() {
    this.load(this.path);
//    this.colorPaletteEdit.drawPalette();
  },

  
  load: function(path) {
    var colorPaletteManager = g_app.textModeEditor.colorPaletteManager;
    this.path = path;

    var record = g_app.doc.getDocRecord(path);
    
    if(record != null) {

      this.doc = record;

      colorPaletteManager.setCurrentColorPaletteFromId(this.doc.id);
      this.colorPaletteEdit.setAutosave(true);
      this.colorPaletteEdit.setToCurrentPalette();

    }


  }
}
