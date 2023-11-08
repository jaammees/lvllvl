var ImportAssembly = function() {
  this.editor = null;
}

ImportAssembly.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  start: function() {
    var _this = this;
    
    this.componentsLoaded = 0;


    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "importAssemblyDialog", "title": "Import Assembly", "width": 840 });

      this.importAssemblyPanel = UI.create("UI.HTMLPanel");
      this.importAssemblyPanel.load('html/textMode/importAssembly.html', function() {
       // _this.htmlComponentLoaded();
        _this.initContent();
      });
      this.uiComponent.add(this.importAssemblyPanel);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.doImport();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });


    } else {
      _this.initContent();
    }

    UI.showDialog("importAssemblyDialog");
    this.visible = true;


  },

  initContent: function() {
    $('#importAssemblySource').val('');
  },

  doImport: function() {
    var source = $('#importAssemblySource').val();
    // remove comments?

    source = source.replace(/\r/g, '');

    var row = 0;
    var col = 0;
    var index = 0;
    var grid = this.editor.grid;
    var gridWidth = grid.getWidth();
    var gridHeight = grid.getHeight();
    var z = grid.getXYGridPosition();


    var lines = source.split('\n');
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/!byte/g, '');
      var hexBytes = line.split(',');
      for(var j = 0; j < hexBytes.length; j++) {
        var hexByte = hexBytes[j].trim();
        if(hexByte[0] === '$') {
          hexByte = hexByte.substring(1);          
        }

        if(hexByte !== '') {
          var dec = parseInt(hexByte, 16);
          if(isNaN(dec)) {
            console.log('nan: ' + hexByte);
          } else {
            row = gridHeight - Math.floor(index / gridWidth) - 1;
            col = index % gridWidth;
            index++;

            grid.setCell({
              c: dec,
              x: col,
              y: row,
              z: z
            });
          }
        }


      }


    }

  }


}

