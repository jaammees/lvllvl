var ExportObj = function() {
  this.editor = null;

  this.width = 0;
  this.height = 0;
  this.depth = 0;

  this.uiComponent = null;
}



ExportObj.prototype = {

  init: function(editor) {
    this.editor = editor;   
  },

  start: function() {

    var _this = this;
    if(this.uiComponent == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportObjFilename">Filename:</label>';
      html += '  <input type="text" class="formControl submitOnEnter" id="exportObjFilename" size="20"/>';
      html += '</div>';


      var width = 200;
      var height = 200;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportObjDialog", "title": "Export OBJ", "width": width, "height": height });

      this.exportOBJHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.exportOBJHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var filename = $('#exportObjFilename').val();
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

    UI.showDialog("exportObjDialog");
    this.initContent();
  },

  initContent: function() {

  },  
  doExport: function(args) {
    var fromFrame = 0;
    var toFrame = 0;
    var filename = 'Untitled';

    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }
    }

    var grid3d = this.editor.grid3d;
    var layer = grid3d.getCurrentLayer();
    var colorPalette = layer.getColorPalette();
    var tileSet = layer.getTileSet();

    var colorCount = colorPalette.getColorCount();

    var materials = '';
    for(var i = 0; i < colorCount; i++) {
      var rgba = colorPalette.getRGBA(i);
      materials += 'newmtl color' + i + "\n";
      materials += 'Kd ' + rgba[0] + ' ' + rgba[1] + ' ' + rgba[2] + "\n";

    }
    var materialFilename = filename + '.mtl';

    var exporter = new THREE.OBJExporter();
    var zip = new JSZip();
    zip.file(materialFilename, materials);

    for(var frame = fromFrame; frame <= toFrame; frame++) {
      var objData = '';
      objData += 'mtllib petscii.mtl' + "\n";
      objData += exporter.parse(layer.getHolder(frame));

      var frameFilename = filename + ".obj";
      if(fromFrame != toFrame) {
        var frameNo = frame;
        frameFilename = filename + "-" + frameNo + ".obj";
      }

      zip.file(frameFilename, objData);
    }


    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
//        saveAs(blob, filename + ".zip");
    });    

  }
}