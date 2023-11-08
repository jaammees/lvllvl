var ScriptEditor = function() {
  this.doc = null;

  this.uiComponent = null;

  this.codeEditor = null;
}

ScriptEditor.prototype = {


  modified: function() {
    if(g_app.openingProject) {
      return;
    }
    g_app.doc.recordModified(this.doc, this.path);
  },

  init: function(args) {
    this.parentPanel = args.parentPanel;
  },

  buildInterface: function() {
    if(this.uiComponent != null) {
      return;
    }

    this.uiComponent = UI.create("UI.Panel", { "id": "scriptEditor" } );
    this.parentPanel.add(this.uiComponent);

    var codeEditorPanel = UI.create("UI.Panel");
    this.uiComponent.add(codeEditorPanel);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('javascript');
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange();
    });

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  show: function() {
    console.log('show script editor');
    if(!this.uiComponent) {
      this.buildInterface();
    }

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


  load: function(path, lineNumber) {
    if(typeof lineNumber == 'undefined' && path == this.path) {
      // already showing it
      return;
    }


    var record = g_app.doc.getDocRecord(path);
    if(record != null) {
      this.doc = record;
      this.path = path;
  
      /*
      this.codeEditor.setValue(record.data);
      this.doc = record;
*/

      if(typeof settings != 'undefined' && typeof settings[path] != 'undefined') {
        this.codeEditor.setEditSession(settings[path].editSession);
      } else {
      //        this.codeEditor.setValue(record.data);
        this.codeEditor.setEditSession(ace.createEditSession(record.data, 'ace/mode/json'));
      }


      if(typeof lineNumber != 'undefined') {
        this.codeEditor.gotoLine(lineNumber);
      }

    }
  }
}
