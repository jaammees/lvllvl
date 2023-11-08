var ExportC64SpriteData = function () {
  this.editor = null;
  this.textEditor = null;
  this.lineIncrement = 10;
  this.lineNumber = 10;
}

ExportC64SpriteData.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  show: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportC64SpriteDataDialog", "title": "Export Sprite Data", "width": 800, "height": 600 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/c64/exportC64SpriteData.html', function() {
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

    UI.showDialog("exportC64SpriteDataDialog");
  },

  initContent: function() {
    if(this.textEditor == null) {
      this.textEditor = ace.edit("exportC64SpriteDataSource");
      this.textEditor.getSession().setTabSize(2);
      this.textEditor.getSession().setUseSoftTabs(true);
      this.textEditor.on('focus', function() {
        g_app.setAllowKeyShortcuts(false);
        UI.setAllowBrowserEditOperations(true);
      });

      this.textEditor.on('blur', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });
      var mode = 'ace/mode/assembly_6502';
      if(this.mode == 'javascript') {
        mode = 'ace/mode/javascript';
      }
      this.textEditor.getSession().setMode(mode);//"ace/mode/assembly_6502");
      this.textEditor.setShowInvisibles(false);
    }

  },

  download: function() {
    var filename = $('#exportSpriteDataAs').val();
    var content = this.textEditor.getValue();
    download(content, filename, "application/txt");
  },

  copyToClipboard: function() {
    var sel = this.textEditor.selection.toJSON(); // save selection
    this.textEditor.selectAll();
    this.textEditor.focus();
    document.execCommand('copy');
    this.textEditor.selection.fromJSON(sel); // restore selection  
  },

  initEvents: function() {
    var _this = this;
    $('#exportSpriteDataFrom').on('change', function() {
      _this.exportData();
    });
    $('#exportSpriteDataTo').on('change', function() {
      _this.exportData();
    });
    $('#exportSpriteDataFrom').on('keyup', function() {
      _this.exportData();
    });
    $('#exportSpriteDataTo').on('keyup', function() {
      _this.exportData();
    });
    $('#exportC64SpriteDataDownload').on('click', function() {
      _this.download();
    });

    $('#exportSpriteLineNumber').on('change', function() {
      _this.exportData();
    });
    $('#exportSpriteLineNumber').on('keyup', function() {
      _this.exportData();
    });

  },


  exportData: function() {
    var exportFrom = parseInt($('#exportSpriteDataFrom').val(), 16);
    var exportTo = parseInt($('#exportSpriteDataTo').val(), 16);
    var lineNumber = parseInt($('#exportSpriteLineNumber').val(), 10);

    if(isNaN(exportFrom) || isNaN(exportTo) || isNaN(lineNumber)) {
      return;
    }

    if(exportTo < exportFrom) {
      return;
    }

    this.generateBasic({
      lineNumber: lineNumber,
      from: exportFrom,
      to: exportTo
    });
  },

  getLine: function(statement) {
    var line = this.lineNumber + " " + statement + "\n";
    this.lineNumber += this.lineIncrement;
    return line;
  },

  toHex: function(value, digits) {
    if(digits == 2) {
      return ("00" + value.toString(16)).substr(-2).toUpperCase(); 
    }
    return ("0000" + value.toString(16)).substr(-4).toUpperCase(); 
  },

  generateBasic: function(args) {
    var bytesPerLine = 8;
    
    var from = args.from;
    var to = args.to;

    this.lineNumber = args.lineNumber;
    var lines = '';

    var data = [];
    for(var i = from; i < to; i++) {
      data.push(c64_vicReadAbsolute(i));
      if(data.length % bytesPerLine == 0) {
        if(data.length != 0) {
          lines += this.getLine('DATA ' + data.join(','));
          data = [];
        }
      }
    }

    if(data.length != 0) {
      lines += this.getLine('DATA ' + data.join(','));
      data = [];
    }

    this.textEditor.setValue(lines, -1);


  }

}