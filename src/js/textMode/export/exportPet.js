var ExportPet = function() {
  this.editor = null;
}


ExportPet.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportPetDialog", "title": "Export .PET", "width": 330, "height": 246 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportPet.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportPet();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent();
    }

    UI.showDialog("exportPetDialog");
  },  

  initContent: function() {

    $('#exportPetAs').val(g_app.fileManager.filename);

  },

  initEvents: function() {
    var _this = this;
  },

  exportPetAs: function(args) {
    var filename = 'Untitled';

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please select a grid layer');
      return;
    }
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var output = [];

    var currentFrame = this.editor.graphic.getCurrentFrame();

    var upper = 0;

    output.push(gridWidth);
    output.push(gridHeight);
    output.push(layer.getBorderColor(currentFrame));
    output.push(layer.getBackgroundColor(currentFrame));
    output.push(upper);

    for(var y = 0; y < gridHeight; y++) {
      for(var x = 0; x < gridWidth; x++) {
        var cellData = layer.getCell({ x: x, y: y, frame: currentFrame });
        
        output.push(cellData.t);
      }
    }

    for(var y = 0; y < gridHeight; y++) {
      for(var x = 0; x < gridWidth; x++) {
        var cellData = layer.getCell({ x: x, y: y, frame: currentFrame });        
        output.push(cellData.fc);
      }
    }

    var binaryData = new Uint8Array(output.length);
    for(var i = 0; i < output.length; i++) {
      binaryData[i] = output[i];
    }

    if(filename.indexOf('.pet') == -1) {
      filename += ".pet";
    }
    download(binaryData, filename, "application/bin");    


  },

  exportPet: function() {
    var args = {};
    args.filename = $('#exportPetAs').val(); 

    this.exportPetAs(args);
  }  
}