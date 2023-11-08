var HexEditor = function() {
  this.uiComponent = null;

  this.data = false;

}

HexEditor.prototype = {
  init: function() {
  },

  buildInterface: function(parentPanel) {
    if(this.uiComponent != null) {
      return;
    }

    this.uiComponent = UI.create("UI.Panel", { "id": "hexEditor" } );
    parentPanel.add(this.uiComponent);

    var html = '<div id="hexEditorContent" style="background-color: #222222; color: #eeeeee; overflow-y: auto" class="panelFill"></div>';
    var htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.add(htmlPanel);

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  initEvents: function() {

  },

  display: function() {
    var bytes = this.data.length;
    var bytesPerRow = 16;
    var lines = Math.ceil(bytes / bytesPerRow);

    var html = '';
    var address = 0;
    for(var line = 0; line < lines; line++) {
      var lineHTML = '<div>';

      var text = ("0000" + address.toString(16)).substr(-4);
      lineHTML += text + ':&nbsp;&nbsp';

      for(var i = 0; i < bytesPerRow; i++) {
        if(address < bytes) {
          var text = ("00" + this.data[address].toString(16)).substr(-2);
          lineHTML += text + '&nbsp';
          address++;
        }
      }
      lineHTML += '</div>';

      html += lineHTML;
    }

    $('#hexEditorContent').html(html);
    
  },

  load: function(path) {
    this.path = path;

    var record = g_app.doc.getDocRecord(path);
    if(record != null) {
      console.log(record.data);
      this.data = base64ToBuffer(record.data);
      this.display();
      /*
      this.codeEditor.setValue(record.data);
      this.doc = record;

      if(typeof lineNumber != 'undefined') {
        this.codeEditor.gotoLine(lineNumber);
      }
      */
    }    
  }

}