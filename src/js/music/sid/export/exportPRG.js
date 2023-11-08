var ExportSIDPRG = function() {
  this.editor = null;
  this.uiComponent = null;
}

ExportSIDPRG.prototype = {
  init: function(editor) {
    this.editor = editor;   
  },

  start: function() {

    var _this = this;
    if(this.uiComponent == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportSIDPRGFilename">Filename:</label>';
      html += '  <input type="text" class="formControl submitOnEnter" id="exportSIDPRGFilename" value="Untitled" size="20"/>';
      html += '</div>';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportSIDPRGFilename">Type:</label>';

      html += '<div class="checkboxGroup">';

      html += '  <div>';
      html += '    <label class="rb-container">PRG ';
      html += '      <input type="radio" checked="checked" id="exportSIDPRGType_prg" name="exportSIDPRGType" value="prg">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';

      html += '  <div>';
      html += '    <label class="rb-container">BIN';
      html += '      <input type="radio" id="exportSIDPRGType_bin" name="exportSIDPRGType" value="bin">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';      
      html += '  </div>';

      html += '</div>';


      html += '</div>';


      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportSIDPRGInstruments">Include:</label>';


      html += '<div class="checkboxGroup">';

      html += '  <div>';
      html += '    <label class="rb-container">All Instruments ';
      html += '      <input type="radio" checked="checked" id="exportSIDPRGInstruments_all" name="exportSIDPRGInstruments" value="all">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';

      html += '  <div>';
      html += '    <label class="rb-container">Only Used Instruments';
      html += '      <input type="radio" id="exportSIDPRGInstruments_used" name="exportSIDPRGInstruments" value="used">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';      
      html += '  </div>';

      html += '</div>';


      html += '</div>';


      var width = 360;
      var height = 260;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSIDPRGDialog", "title": "Export PRG", "width": width, "height": height });

      this.exportOBJHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.exportOBJHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var filename = $('#exportSIDPRGFilename').val();
        var type = $('input[name=exportSIDPRGType]:checked').val();
        var instruments = $('input[name=exportSIDPRGInstruments]:checked').val();
        _this.doExport({
          filename: filename,
          type: type,
          instruments: instruments
        });
        UI.closeDialog();
      });
 
      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.addButton(okButton);
      this.uiComponent.addButton(closeButton);    
    }

    UI.showDialog("exportSIDPRGDialog");
    this.initContent();
  },

  initContent: function() {

  },

  doExport: function(args) {
    console.log(args);

    this.editor.createSid();
    this.editor.songData.downloadPRG(args);
    
//    this.editor.songData.downloadGoat(args);    
  }

}
