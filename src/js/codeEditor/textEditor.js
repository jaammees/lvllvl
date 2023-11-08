var TextEditor = function() {
  this.doc = null;
  this.path = '';

  this.uiComponent = null;

  this.codeEditor = null;
}

TextEditor.prototype = {

  modified: function() {
    if(g_app.openingProject) {
      return;
    }
    g_app.doc.recordModified(this.doc, this.path);
  },

  init: function(args) {
    this.parentPanel = args.parentPanel;
  },

  show: function() {
    if(!this.uiComponent) {
      this.buildInterface();
    }
  },

  buildInterface: function(parentPanel) {
    if(this.uiComponent != null) {
      return;
    }

    this.uiComponent = UI.create("UI.Panel", { "id": "textEditor" } );
    parentPanel.add(this.uiComponent);

    var codeEditorPanel = UI.create("UI.Panel");
    this.uiComponent.add(codeEditorPanel);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('text');
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange();
    });

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },


  initEvents: function() {

  },

  codeEditorChange: function() {
    if(this.doc != null) {
      this.modified();

      this.doc.data = this.codeEditor.getValue();
    } 
  },

  saveSettings: function(settings) {
    settings[this.path] = {
      scrollTop: this.codeEditor.getScrollTop(),
      editSession: this.codeEditor.getEditSession()
    }
  },


  load: function(path, lineNumber, settings) {
    console.log('current path = ' + this.path);
    console.log('new path = ' + path);
    if(typeof lineNumber == 'undefined' && path == this.path) {
      // already showing it
      return;
    }


    this.doc = null;
    this.path = path;

    var record = g_app.doc.getDocRecord(path);
    if(record != null) {
      this.doc = record;

      if(typeof settings != 'undefined' && typeof settings[path] != 'undefined') {
        console.log('set edit session');
        this.codeEditor.setEditSession(settings[path].editSession);
      } else {
//        this.codeEditor.setValue(record.data);
        console.log('create edit session');
        var data = record.data;
        if(!isString(record.data)) {
          data = JSON.stringify(data, null, 2);
        }
        this.codeEditor.setEditSession(ace.createEditSession(data, 'ace/mode/text'));
      }

      if(typeof lineNumber != 'undefined') {
        this.codeEditor.gotoLine(lineNumber);
      }


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
