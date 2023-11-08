var LayersFrames = function() {
  this.editor = null;
}

LayersFrames.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  initContent: function() {

  },

  initEvents: function() {

  },

  showFramesToLayers: function() {
    var _this = this;

    if(this.framesToLayersComponent == null) {

      var html = '<div class="formGroup">';
      html += '<label class="controlLabel">Frames To Layers:</label>';
      html += '<div class="checkboxGroup">';
      html += '<label class="rb-container"> All<input type="radio" name="layersMergeLayers" value="all" checked="checked"><span class="checkmark"></span></label>';
      html += '<label class="rb-container"> Visible<input type="radio" name="layersMergeLayers" value="all"><span class="checkmark"></span></label>';
      html += '</div>';
      html += '</div>';

      this.framesToLayersComponent = UI.create("UI.Dialog", { "id": "framesToLayersComponent", 
                                                  "title": "Frames To Layers", 
                                                  "width": 200,
                                                  "height": 100 });

      this.htmlComponent = UI.create("UI.HTMLPanel", { "html": html});
      this.framesToLayersComponent.add(this.htmlComponent);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.framesToLayersComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.framesToLayersComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    }
    UI.showDialog("framesToLayersComponent");
  },

  showLayersToFrames: function() {
    var _this = this;

    if(this.layersToFramesComponent == null) {
      /*
      var html = '<label>Layers To Frames</label>';
      html += '<label><input type="radio" name="layersToFramesLayers" value="all"> All</label>';
      html += '<label><input type="radio" name="layersToFramesLayers" value="visible" checked="checked"> Visible</label>';
      */

      var html = '<div class="formGroup">';
      html += '<label class="controlLabel">Frames To Layers:</label>';
      html += '<div class="checkboxGroup">';
      html += '<label class="rb-container">All<input type="radio" name="layersToFramesLayers" value="all"> <span class="checkmark"></span></label>';
      html += '&nbsp;';
      html += '<label class="rb-container">Visible<input type="radio" name="layersToFramesLayers" value="visible" checked="checked"><span class="checkmark"></span> </label>';
      html += '</div>';
      html += '</div>';      
      this.layersToFramesComponent = UI.create("UI.Dialog", { "id": "layersToFramesDialog", 
                                                  "title": "Layers To Frames", 
                                                  "width": 220,
                                                  "height": 110 });

      this.htmlComponent = UI.create("UI.HTMLPanel", { "html": html});
      this.layersToFramesComponent.add(this.htmlComponent);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.layersToFramesComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        var layers = $('input[name=layersToFramesLayers]:checked').val();
        _this.editor.layers.layersToFrames(layers);
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.layersToFramesComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });


//      this.initContent();
//      this.initEvents();
    }
    UI.showDialog("layersToFramesDialog");

  }
}


