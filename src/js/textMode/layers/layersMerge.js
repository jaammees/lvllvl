var LayersMerge = function() {
  this.editor = null;
  this.uiComponent = null;
}

LayersMerge.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  initContent: function() {

  },

  initEvents: function() {

  },

  show: function() {
    var _this = this;

    if(this.uiComponent == null) {
      var html = '<div class="formGroup">';
      html += '<label class="controlLabel">Merge:</label>';
      html += '<div class="checkboxGroup">';
      html += '<label class="rb-container">All<input type="radio" name="layersMergeLayers" value="all" checked="checked"><span class="checkmark"></span> </label>';
      html += '&nbsp;&nbsp;<label class="rb-container">Visible<input type="radio" name="layersMergeLayers" value="all"> <span class="checkmark"></span></label>';

      html += '</div>';
      html += '</div>';

/*
      var html = '<label>Merge:</label>';
      html += '<label><input type="radio" name="layersMergeLayers" value="all" checked="checked"> All</label>';
      html += '<label><input type="radio" name="layersMergeLayers" value="all"> Visible</label>';
*/
      this.uiComponent = UI.create("UI.Dialog", { "id": "layerMergeDialog", 
                                                  "title": "Merge Layers", 
                                                  "width": 200,
                                                  "height": 100 });

      this.htmlComponent = UI.create("UI.HTMLPanel", { "html": html});
      this.uiComponent.add(this.htmlComponent);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {

        var layers = 'visible';
        _this.editor.layers.mergeLayers(layers);
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });


      this.initContent();
      this.initEvents();
    }
    UI.showDialog("layerMergeDialog");

  }
}


