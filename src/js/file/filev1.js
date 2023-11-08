var FileV1 = function() {
  this.editor = null;
}

FileV1.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  read: function(data) {
    data = $.parseJSON(data);

    if(typeof data.view != 'undefined') {
      // do worrt about data view?
    }

    if(typeof data.music != 'undefined') {
      this.editor.music.load(data.music);
    }

    var textData = {};
    if(typeof data.petscii != 'undefined') {
      textData = data.petscii;
    } else {
      textData = data;
    }

    this.editor.textModeEditor.load(textData);
  }

}