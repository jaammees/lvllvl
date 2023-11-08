var ExportGoatTracker = function() {
  this.editor = null;
  this.uiComponent = null;
}

ExportGoatTracker.prototype = {
  init: function(editor) {
    this.editor = editor;   
  },

  start: function() {

    var _this = this;
    if(this.uiComponent == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportGTFilename">Filename:</label>';
      html += '  <input type="text" class="formControl submitOnEnter" id="exportGTFilename" value="Untitled" size="20"/>';
      html += '</div>';


      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportGTInstruments">Include:</label>';


      html += '<div class="checkboxGroup">';

      html += '  <div>';
      html += '    <label class="rb-container">All Instruments ';
      html += '      <input type="radio" checked="checked" id="exportGTInstruments_all" name="exportGTInstruments" value="all">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';

      html += '  <div>';
      html += '    <label class="rb-container">Only Used Instruments';
      html += '      <input type="radio" id="exportGTInstruments_used" name="exportGTInstruments" value="used">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';      
      html += '  </div>';

      html += '</div>';


      html += '</div>';


      var width = 310;
      var height = 200;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportGTDialog", "title": "Export GoatTracker V2", "width": width, "height": height });

      this.exportGTHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.exportGTHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var filename = $('#exportGTFilename').val();
        var instruments = $('input[name=exportGTInstruments]:checked').val();
        _this.doExport({
          filename: filename,
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

    UI.showDialog("exportGTDialog");
    this.initContent();
  },

  initContent: function() {

  },

  doExport: function(args) {

    
    // createSid converts lvl pattern, instrument, track data into arrays
    // stores the data in songData
    // then calls writeSid of songData
    this.editor.createSid();

    // download goat 
    this.editor.songData.downloadGoat(args);    
  }

}
