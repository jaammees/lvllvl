var ExportSEQ = function() {
  this.editor = null;
  this.colors = [
    0x90, //black
    0x05, //white
    0x1c, //red
    0x9f, //cyan
    0x9c, //purple
    0x1e, //green
    0x1f, //blue
    0x9e, //yellow
    0x81, //orange
    0x95, //brown
    0x96, //pink
    0x97, //grey 1
    0x98, //grey 2
    0x99, //lt green
    0x9a, //lt blue
    0x9b //grey 3  
  ];

  this.revsOn = 0x12;
  this.revsOff = 0x92;  
}

ExportSEQ.prototype = {
/*  
  initDialog: function() {
    var toSeq = this;

    $('#exportSEQOK').on('click', function() {
      var filename = $('#exportSEQAs').val();

      toSeq.exportAs(filename);
      toSeq.editor.hideDialog('exportSEQDialog');      
    });

    $('#exportSEQCancel').on('click', function() {
      toSeq.editor.hideDialog('exportSEQDialog');      
    });    

  },
*/
  init: function(editor) {
    this.editor = editor;

  },

  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSEQDialog", "title": "Export SEQ", "width": 345, "height": 270 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportSEQ.html', function() {

        _this.initContent();
//        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportSEQ();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);

      });

    } else {
      this.initContent();
    }

    UI.setAllowBrowserEditOperations(true);
    g_app.setAllowKeyShortcuts(false);
    UI.showDialog("exportSEQDialog");
  },  

  initContent: function() {

    $('#exportSEQAs').val(g_app.fileManager.filename);
/*
    $('#exportAssemblyToFrame').val(this.editor.frames.frameCount);
    $('#exportAssemblyFromFrame').val(1);

    $('#exportAssemblyFromFrame').attr('max', this.editor.frames.frameCount);
    $('#exportAssemblyToFrame').attr('max', this.editor.frames.frameCount);
*/

  },

  exportSEQ: function() {
    var filename = $('#exportSEQAs').val();
    this.exportAs(filename);

  },

  exportAs: function(filename) {
    var frame = this.editor.graphic.getCurrentFrame();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }


    var addClearByte = $('#exportSEQClearByte').is(':checked');
    var gfxByte = $('#exportSEQNewGFXByte').is(':checked');
    var newLineByte = $('#exportSEQNewLineBytes').is(':checked');

    var headerBytes = $('#exportSEQHeaderBytes').val();
    var footerBytes = $('#exportSEQFooterBytes').val();

    var width = layer.getGridWidth();
    var height = layer.getGridHeight();

    var lastColor = -1;
    var seq = '';

    // make array bigger than needed
    var length = width * height * 4;
    var buffer = new Uint8Array(length);   
    var index = 0; 

    var revIsOn = false;

    // clear screen
    if(addClearByte) {
      buffer[index++] = 0x93;
    }

    if(gfxByte) {
      buffer[index++] = 0x8e;
    }

//    console.log('width = ' + width + ' height = ' + height);
    headerBytes = headerBytes.split(',');
    for(var i = 0; i < headerBytes.length; i++) {
      var b = headerBytes[i].trim();
      var value = false;
      if(b != "") {
        if(b[0] == '$') {
          // its hex
          b = b.substring(1);
          console.log('parse hex: ' + b);
          value = parseInt(b, 16);
        } else {
          console.log('parse dec: ' + b);
          value = parseInt(b, 10);          
        }
        console.log('value = ' + value);

        if(!isNaN(value)) {
          buffer[index++] = value;
        }
      }
    }

    for(var y = 0; y < height; y++) {
      
      for(var x = 0; x < width; x++) {
        var cellData = layer.getCell({ x: x, y: y, frame: frame });
        var character = cellData.t;
        var color = cellData.fc;

        if(lastColor != color) {
          if(color < this.colors.length) {
            buffer[index++] = this.colors[color];
          }
          lastColor = color;
        }

        if(character >= 128) {
          if(!revIsOn) {
            revIsOn = true;
            buffer[index++] = this.revsOn;
          }
          character -= 128;

        } else {
          if(revIsOn) {
            revIsOn = false;
            buffer[index++] = this.revsOff;
          }

        }

        // https://sta.c64.org/cbm64pettoscr.html
        if(character >= 0 && character <= 0x1f) {
          character += 64;//0x40;
        } else if(character >= 0x40 && character <= 0x5d) {
          character += 32;//0x80;
        } else if(character == 0x5e) {
          character = 0xff;
        } else if(character == 0x5f) {
          character += 32;
        } else if(character >= 0x60 && character <= 0x7f) {
          character += 64;// 0x80;
        } else if(character >= 0x80 && character <= 0x9f) {
          character -= 128;//0x80;
        } else if(character >= 0xc0 && character <= 0xdf) {
          character -= 64;//0x40;
        }

        if(character == 34) { // double quotes
          // put in a double quotes, then delete it, so not inside quotes
          buffer[index++] = 34;
          buffer[index++] = 20;
        }

        /*
        if(character >= 0 && character <= 0x1f) {
          character += 0x40;
        } else if(character >= 0x40 && character <= 0x5d) {
          character += 0x80;
        } else if(character == 0x5e) {
          character = 0xff;
        } else if(character == 0x95) {
          character = 0xdf;
        } else if(character >= 0x60 && character <= 0x7f) {
          character += 0x80;
        } else if(character >= 0x80 && character <= 0xbf) {
          character -= 0x80;
        } else if(character >= 0xc0 && character <= 0xff) {
          character -= 0x40;
        }
        */
        buffer[index++] = character;
        console.log(character);
      }

      if(newLineByte) {
        buffer[index++] = 0x8d;
      }

    }

    footerBytes = footerBytes.split(',');
    for(var i = 0; i < footerBytes.length; i++) {
      var b = footerBytes[i].trim();
      var value = false;
      if(b != "") {
        if(b[0] == '$') {
          // its hex
          b = b.substring(1);
          value = parseInt(b, 16);
        } else {
          value = parseInt(b, 10);          
        }

        if(!isNaN(value)) {
          buffer[index++] = value;
        }
      }
    }    

    var length = index;

//    console.log('length = ' + length);
    var data = new Uint8Array(length);   
    /*
    for(var i = 0; i < length; i++) {
      if(i < 255) {
        data[i] = i;
      } else {
        data[i] = buffer[i];
      }
    }
*/
    for(var i = 0; i < length; i++) {
      data[i] = buffer[i];
    }


    if(filename.indexOf('.seq') == -1) {
      filename += ".seq";
    }
    download(data, filename, "application/seq");
  }

}