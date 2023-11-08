var GlyphEditor = function() {
  this.character = false;

  this.characters = [];

  this.clipboardCanvas = null;
  this.canvas = null;


  this.tile = false;
  this.tileSet = null;

}

GlyphEditor.prototype = {
  init: function(editor) {
    this.editor = editor;
    
    this.glyphEditorCanvas = new GlyphEditorCanvas();
    this.glyphEditorCanvas.init(editor, { "canvasElementId": 'glyphEditorCanvas', "setMouseCursor": true });
  },

  initEvents: function() {
    var _this = this;

    $('#glyphEditorCloseButton').on('click', function() {
      _this.editor.tileEditor.toggleVisible();
    });

  },

  setTile: function(tile) {
    this.tile = tile;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }

    var type = tileSet.getType();
    if(type != 'vector') {
      return;
    }

    console.log('vector set tile = ' + this.tile);
    this.glyphEditorCanvas.setTile(tile);
  }

}