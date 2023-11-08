var ExportSID = function() {
  this.editor = null;
  this.uiComponent = null;
}

ExportSID.prototype = {
  init: function(editor) {
    this.editor = editor;   
  },

  start: function() {

    var _this = this;
    if(this.uiComponent == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportSIDFilename">Filename:</label>';
      html += '  <input type="text" class="formControl submitOnEnter" id="exportSIDFilename" value="Untitled" size="20"/>';
      html += '</div>';


      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportSIDInstruments">Include:</label>';


      html += '<div class="checkboxGroup">';

      html += '  <div>';
      html += '    <label class="rb-container">All Instruments ';
      html += '      <input type="radio" checked="checked" id="exportSIDInstruments_all" name="exportSIDInstruments" value="all">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';

      html += '  <div>';
      html += '    <label class="rb-container">Only Used Instruments';
      html += '      <input type="radio" id="exportSIDInstruments_used" name="exportSIDInstruments" value="used">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';      
      html += '  </div>';

      html += '</div>';


      html += '</div>';


      var width = 260;
      var height = 200;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSIDDialog", "title": "Export SID", "width": width, "height": height });

      this.exportOBJHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.exportOBJHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var filename = $('#exportSIDFilename').val();
        _this.doExport({
          filename: filename
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

    UI.showDialog("exportSIDDialog");
    this.initContent();
  },

  initContent: function() {

  },

  doExport: function(args) {

    // createSid converts lvl pattern, instrument, track data into arrays
    // stores the data in songData
    // then calls writeSid of songData    
    this.editor.createSid();
    
    this.editor.songData.downloadSID(args);
    
//    this.editor.songData.downloadGoat(args);    
  }

}
