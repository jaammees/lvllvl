var ExportPetsciiC = function() {
  this.editor = null;
}


ExportPetsciiC.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportPetsciiCDialog", "title": "Export C", "width": 330, "height": 246 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportPetsciiC.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportPetsciiC();
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

    UI.showDialog("exportPetsciiCDialog");
  },  

  initContent: function() {

    $('#exportPetsciiCAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();
    $('#exportPetsciiCToFrame').val(frameCount);
    $('#exportPetsciiCFromFrame').val(1);

    $('#exportPetsciiCFromFrame').attr('max', frameCount);
    $('#exportPetsciiCToFrame').attr('max', frameCount);
  },

  initEvents: function() {
    var _this = this;
  },

  exportPetsciiCAs: function(args) {
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

    var output = '';

    var variableName = 'frame';
    if(typeof args.variableName != 'undefined') {
      variableName = args.variableName;
    }

    /*
    var direction = 'toptobottom';
    if(typeof args.direction != 'undefined') {
      direction = args.direction;
    }
    */

    var currentFrame = this.editor.graphic.getCurrentFrame();

    var fromFrame = currentFrame;
    if(typeof args.fromFrame != 'undefined') {
      fromFrame = args.fromFrame;
    }
    var toFrame = currentFrame;
    if(typeof args.toFrame != 'undefined') {
      toFrame = args.toFrame;
    }


    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      var frameNumber = frameIndex + 1;
      var frameVariableName = variableName;
      if(fromFrame !== toFrame) {
        frameVariableName += ('0000' + frameNumber).substr(-4);
      }
      output += 'unsigned char ' + frameVariableName + '[] = {  ';
      output += '// border,bg,chars,colors';
      output += "\n";

      /*
    for(var frameIndex = fromFrame - 1; frameIndex < toFrame; frameIndex++) {
      if(fromFrame != toFrame) {
        output += '{';

        output += "\n";
      }
      */

      
//      output += '// Frame ' + frameNumber + "\n";
//      output += '// border,bg,chars,colors' + "\n";


      output += layer.getBorderColor(frameIndex) + ",";
      output += layer.getBackgroundColor(frameIndex) + "," + "\n";
      var yStart = 0;
      var yLimit = gridHeight;
      var yIncrement = 1;
/*
      var yStart = gridHeight - 1;
      var yLimit = -1;
      var yIncrement = -1;
*/
      for(var y = yStart; y != yLimit; y += yIncrement) {
        for(var x = 0; x < gridWidth; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          output += cellData.t;
          output += ",";
        }
        output += "\n";
      }

      for(var y = yStart; y != yLimit; y += yIncrement) {
        for(var x = 0; x < gridWidth; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          output += cellData.fc;

          if(x != gridWidth - 1 || y != gridHeight - 1) {
            output += ",";
          }
        }
        output += "\n";
      }

      /*
      if(fromFrame != toFrame) {

        output += '}';

        if(frameIndex != toFrame - 1) {
          output += ',';
        }

        output += "\n";

      }
      */
      output += "};\n";
    }



    output += "// META: " + gridWidth + " " + gridHeight + " C64 upper\n";

    if(filename.indexOf('.c') == -1) {
      filename += ".c";
    }
    download(output, filename, "application/c");    
  },

  exportPetsciiC: function() {
    var args = {};
    args.filename = $('#exportPetsciiCAs').val(); 
    args.variableName = $('#exportPetsciiCAsVariableName').val(); 
//    args.direction = $('input[name=exportPetsciiCDirection]:checked').val();

    args.fromFrame = parseInt($('#exportPetsciiCFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportPetsciiCToFrame').val(), 10);


    this.exportPetsciiCAs(args);
    var filename = $('#exportPetsciiCAs').val();
  }  
}