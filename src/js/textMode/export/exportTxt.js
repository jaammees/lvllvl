var ExportTxt = function() {
  this.editor = null;
//  this.asmEditor = null;  

  this.lineEnding = '\r\n';
  this.columns = 16;
}

ExportTxt.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportTxtDialog", "title": "Export Txt", "width": 800, "height": 600 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportTxt.html', function() {
        _this.initContent();
        _this.initEvents();
      });

      this.displayButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"/> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.displayButton);
      this.displayButton.on('click', function(event) {
        //UI.closeDialog();
        _this.copyToClipboard();
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

    } else {
      this.initContent();
    }

    UI.showDialog("exportTxtDialog");
  },  

  initContent: function() {

    if(this.asmEditor == null) {
      this.asmEditor = ace.edit("exportTxtSource");
      this.asmEditor.getSession().setTabSize(2);
      this.asmEditor.getSession().setUseSoftTabs(true);
      this.asmEditor.on('focus', function() {
        g_app.setAllowKeyShortcuts(false);
        UI.setAllowBrowserEditOperations(true);
      });

      this.asmEditor.on('blur', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });
      var mode = 'ace/mode/text';
      this.asmEditor.getSession().setMode(mode);//"ace/mode/assembly_6502");
      this.asmEditor.setShowInvisibles(false);
      this.asmEditor.setDisplayIndentGuides(false);
    }


    $('#exportTxtAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

    $('#exportTxtToFrame').val(frameCount);
    $('#exportTxtFromFrame').val(1);

    $('#exportTxtFromFrame').attr('max', frameCount);
    $('#exportTxtToFrame').attr('max', frameCount);


    this.exportTxt({ displayOnly: true });

  },

  initEvents: function() {
    var _this = this;

    $('#exportTxtInsertFrameSeparator').on('click', function() {
      _this.exportTxt({ displayOnly: true });
    });
    $('#exportTxtFromFrame').on('change', function() {
      _this.exportTxt({ displayOnly: true });
    });

    $('#exportTxtToFrame').on('change', function() {
      _this.exportTxt({ displayOnly: true });
    });

    
    $('#exportTxtDownload').on('click', function() {
      _this.download();
    });


  },

  copyToClipboard: function() {
    var sel = this.asmEditor.selection.toJSON(); // save selection
    this.asmEditor.selectAll();
    this.asmEditor.focus();
    document.execCommand('copy');
    this.asmEditor.selection.fromJSON(sel); // restore selection  
  },


  exportTxtFormat: function(args) {

    var insertFrameSeparator = true;
    if(typeof args.insertFrameSeparator != 'undefined') {
      insertFrameSeparator = args.insertFrameSeparator;
    }

    var screenData = '';
    var layer = this.editor.layers.getSelectedLayerObject();
    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    for(var frameIndex = args.fromFrame - 1; frameIndex < args.toFrame; frameIndex++) {
      if(frameIndex >= this.editor.graphic.getFrameCount()) {
        break;
      }
      var frameNumber = frameIndex + 1;

      if(insertFrameSeparator) {
        var frameLabel = 'Frame ' + frameNumber + ' ';
        var dashCount = gridWidth - frameLabel.length;
        screenData += frameLabel;
        for(var i = 0; i < dashCount; i++) {
          screenData += '-';
        }
        screenData += this.lineEnding;
      }


      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          var cell = layer.getCell({ frame: frameIndex, x: x, y: y });
          var c = cell.t;
          c = String.fromCharCode(c);
          screenData += c;
        }
        screenData += this.lineEnding;
      }
    }

    if(typeof args.displayOnly != 'undefined' && args.displayOnly) {
      this.asmEditor.setValue(screenData, -1);

    } else {
      download(screenData, args.filename + '.txt', "application/txt");
    }
  },

  exportTxtAs: function(args) {

    if(typeof args.filename == 'undefined') {
      args.filename = g_app.fileManager.filename;
    }

    var currentFrame = this.editor.graphic.getCurrentFrame();

    if(typeof args.fromFrame == 'undefined') {
      args.fromFrame = currentFrame;
    }

    if(typeof args.toFrame == 'undefined') {
      args.toFrame = currentFrame;
    }

    this.exportTxtFormat(args);
  },


  download: function() {
    var filename = $('#exportTxtAs').val();
    filename += '.txt';

    var source = this.asmEditor.getValue();
    download(source, filename, "application/txt");

  },

  exportTxt: function(args) {
    args.filename = $('#exportTxtAs').val();

    args.fromFrame = parseInt($('#exportTxtFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportTxtToFrame').val(), 10);
    args.insertFrameSeparator = $('#exportTxtInsertFrameSeparator').is(':checked');


    this.exportTxtAs(args);
  }  
}