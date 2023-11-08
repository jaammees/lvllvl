var CodeEditor = function() {
  this.eventHandlers = {};
  this.annotations = [];

  // last line cursor was on
  this.lastLine = false;

  this.fontSize = 14;
  this.lineHeight = 1.4;
  this.theme = 'tomorrow_night';
  this.showInvisibles = true;
  this.tabIndentation = false;
  this.autocomplete = true;

  this.assemblerEditor = null;
  
}


CodeEditor.prototype = {
  init: function(mode, assemblerEditor) {
    this.mode = 'ace/mode/assembly_6502';
    if(typeof mode != 'undefined') {
      this.mode = mode;
    }

    if(typeof assemblerEditor != 'undefined') {
      this.assemblerEditor = assemblerEditor;
    } else {
      this.assemblerEditor = g_app.assemblerEditor;
    }

  },

  buildInterface: function(parentPanel) {
    this.id = UI.getID();

    var html = '<div class="panelFill" style="background-color:#333333;">';
//    html += '  <textarea id="assemblyCodeEditor"  rows="20" cols="60"></textarea>';
    html += '  <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0" id="codeEditor' + this.id + '"></div>';
    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html});
    parentPanel.add(this.uiComponent);


    var _this = this;
    UI.on('ready', function() {
      _this.initContent();
    });

    this.uiComponent.on('resize', function() {
      _this.resize();
    });

  },


  on: function(eventName, f) {
    this.eventHandlers[eventName] = f;
  },

//https://ace.c9.io/#nav=howto&api=ace

  initContent: function() {

    

    var _this = this;
    var assemblyCodeEditor = document.getElementById('codeEditor' + this.id);

    ace.config.set('basePath', 'lib/ace/src');
    ace.require("ace/ext/language_tools");
    this.editor = ace.edit("codeEditor" + this.id);
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    });

    this.theme = g_app.getPref("codeeditor.theme");
    if(this.theme == null) {
      this.theme = "tomorrow_night";
    }
    this.editor.setTheme("ace/theme/" + this.theme);


    // https://gist.github.com/yuvalherziger/aa48782568c6914b55066d290ff88360
    // remove current completers

    if(this.mode != 'javascript' && this.mode != 'json' && this.mode != 'text' && this.mode != 'c64basic') {
      this.editor.completers = [];
      // custom completer
      this.editor.completers.push({
        getCompletions: function(editor, session, pos, prefix, callback) {
          //var completions = [];
          var line = session.getLine(pos.row);
          var completions = g_app.assemblerEditor.getCompletions(line, pos);//  _this.editor.getCompletions(line, pos);
          callback(null, completions);
        }
      });
    } else {
      if(this.mode == 'javascript') {
        // custom completer
        this.editor.completers.push({
          getCompletions: function(editor, session, pos, prefix, callback) {
            //var completions = [];
            var line = session.getLine(pos.row);
//            var completions = c64.scripting.getCompletions(line, pos);
//            callback(null, completions);
          }
        });
      }

    }
  
  
    this.editor.getSession().setTabSize(2);
    this.editor.getSession().setUseSoftTabs(true);

    this.fontSize = parseInt(g_app.getPref('codeeditor.fontsize'), 10);

    /*
    if(this.fontSize == null || isNaN(this.fontSize) || this.fontSize <= 0) {
      this.fontSize = 14;
    } else {
      this.fontSize = parseInt(this.fontSize)
    }
    this.editor.setFontSize(this.fontSize);
    */

    this.editor.container.style.lineHeight = this.lineHeight;
    this.editor.renderer.updateFontSize();

    this.editor.on('focus', function() {
      g_app.setAllowKeyShortcuts(false);
      UI.setAllowBrowserEditOperations(true);
    });

    this.editor.on('blur', function() {
      g_app.setAllowKeyShortcuts(true);
      UI.setAllowBrowserEditOperations(false);
    });

    this.selection = this.editor.getSelection();
    this.selection.on('changeCursor', function() {
      _this.changeCursor();
    });


    this.editor.on('change', function(event) {
      _this.change(event);
    });

    this.editor.on('guttermousedown', function(event) {
      var target = event.domEvent.target;

      if (target.className.indexOf("ace_gutter-cell") == -1){
        return;
      }

      var breakpoints = event.editor.session.getBreakpoints();
      var row = event.getDocumentPosition().row;      

      if(typeof breakpoints[row] === typeof undefined) {
        if(typeof _this.eventHandlers['setbreakpoint'] != 'undefined') {
          _this.eventHandlers['setbreakpoint'](row);
        }
        event.editor.session.setBreakpoint(row);
      } else {
        if(typeof _this.eventHandlers['clearbreakpoint'] != 'undefined') {
          _this.eventHandlers['clearbreakpoint'](row);
        }
        event.editor.session.clearBreakpoint(row);
      }

      event.stop();      

      
    });

    this.editor.commands.addCommand({
      name: "run",
      bindKey: { win: "F5", mac: "F5"},
      exec: function(editor) {
        if(typeof _this.eventHandlers['run'] != 'undefined') {
          _this.eventHandlers['run']();
        } else {
          _this.assemblerEditor.run();
        } 
      }
    });

    this.editor.commands.addCommand({
      name: "build",
      bindKey: { win: "F6", mac: "F6"},
      exec: function(editor) {
        _this.assemblerEditor.build();
      }
    });

    this.editor.commands.addCommand({
      name: "playpause",
      bindKey: { win: "F9", mac: "F9"},
      exec: function(editor) {
        _this.assemblerEditor.machinePlay();
      }
    });

    this.editor.commands.addCommand({
      name: "stepover",
      bindKey: { win: "F10", mac: "F10"},
      exec: function(editor) {
        _this.assemblerEditor.machineStepOver();
      }
    });


    this.editor.commands.addCommand({
      name: "stepinto",
      bindKey: { win: "F11", mac: "F11"},
      exec: function(editor) {
        _this.assemblerEditor.machineStepInto();
      }
    });

    this.editor.commands.addCommand({
      name: "projectexplorer",
      bindKey: { win: "Ctrl-P", mac: "Cmd-P"},
      exec: function(editor) {
        g_app.projectNavigator.toggleVisible();      
//        g_app.assemblerEditor.machineStep();
      }
    });


    this.editor.commands.addCommand({
      name: 'f3search',
      bindKey: { win: 'F3', mac: 'F3' },
      exec: function(){
//        _this.editor.execCommand("find")
        var searchOptions = _this.editor.getLastSearchOptions();
        //console.log(searchOptions);
        searchOptions = {};
        _this.editor.findNext(searchOptions, true);
      }
    });

    var mode = 'ace/mode/assembly_6502';
    if(this.mode == 'javascript') {
//      mode = 'ace/mode/javascript';
      mode = 'ace/mode/text';
    }
    if(this.mode == 'text') {
      mode = 'ace/mode/text';
    }
    if(this.mode == 'c64basic') {
      mode = 'ace/mode/c64basic';
    }
    this.editor.getSession().setMode(mode);//"ace/mode/assembly_6502");

    this.showInvisibles = g_app.getPref("codeeditor.hideinvisibles") !== 'yes';
    this.setShowInvisibles(this.showInvisibles);

    this.tabIndentation = g_app.getPref("codeeditor.tabindentation") == 'yes';
    this.setTabIndentation(this.tabIndentation);


    this.setAutocomplete(g_app.getPref("codeeditor.autocomplete") != 'no');
//    this.editor.setValue(C64ASM);
    this.editor.gotoLine(1);


//this.editor.resize()    
  },

  on: function(event, handler) {
    this.eventHandlers[event] = handler;

  },
  change: function(event) {
    if(event.lines.length > 1) {
    }
    if(this.eventHandlers.hasOwnProperty('change')) {
      this.eventHandlers.change(event);
    }
  },

  undo: function() {
    this.editor.undo();

  },

  redo: function() {
    this.editor.redo();
  },

  setFontSize: function(fontSize) {
    this.fontSize = fontSize;

    if(typeof this.editor != 'undefined') {
      this.editor.setFontSize(this.fontSize);
    }
  },

  getScrollTop: function() {
    var session = this.editor.getSession();

    return session.getScrollTop();
  },

  getEditSession: function() {
    return this.editor.getSession();
  },

  setEditSession: function(editSession) {
    this.editor.setSession(editSession);
  },

  setScrollTop: function(value) {
    var session = this.editor.getSession();

    return session.setScrollTop(value);
  },

  setTheme: function(theme) {
    console.log("SET THEME" + theme);
    this.theme = theme;
    this.editor.setTheme("ace/theme/" + this.theme);
    g_app.setPref("codeeditor.theme", this.theme);
  },

  setShowInvisibles: function(showInvisibles) {
    this.showInvisibles = showInvisibles;
    this.editor.setShowInvisibles(this.showInvisibles);
    g_app.setPref("codeeditor.hideinvisibles", this.showInvisibles ? "no" : "yes");

    UI('view-toggle-invisible-characters').setChecked(this.showInvisibles);
    if(UI.exists('c64-view-toggle-invisible-characters')) {
      UI('c64-view-toggle-invisible-characters').setChecked(this.showInvisibles);
    }
  },

  toggleInvisibles: function() {
    this.setShowInvisibles(!this.showInvisibles);
  },

  setAutocomplete: function(autocomplete) {
    this.autocomplete = autocomplete;

    UI('view-toggle-autocomplete').setChecked(this.autocomplete);

    if(UI.exists('c64-view-toggle-autocomplete')) {
      UI('c64-view-toggle-autocomplete').setChecked(this.autocomplete);      
    }

    this.editor.setOptions({
      enableBasicAutocompletion: this.autocomplete,
      enableLiveAutocompletion: this.autocomplete
    });

    g_app.setPref("codeeditor.autocomplete", this.autocomplete ? "yes" : "no");

  },

  toggleAutocomplete: function() {
    this.setAutocomplete(!this.autocomplete);
  },

  setTabIndentation: function(tabIndentation) {
    var session = this.editor.getSession();

    if(!session) {
      return;
    }

    if(typeof tabIndentation != 'undefined') {
      this.tabIndentation = tabIndentation;
    }

    UI('view-toggle-tabindentation').setChecked(this.tabIndentation);
    if(UI.exists('c64-view-toggle-tabindentation')) {
      UI('c64-view-toggle-tabindentation').setChecked(this.tabIndentation);
    }
    if(this.tabIndentation) {
      session.setTabSize(2);
      session.setUseSoftTabs(true);
      
    } else {
      session.setTabSize(2);
      session.setUseSoftTabs(false);  
    }
    g_app.setPref("codeeditor.tabindentation", this.tabIndentation ? "yes" : "no");
  },

  toggleTabIndentation: function() {
    this.setTabIndentation(!this.tabIndentation);
  },

  changeCursor: function() {
    //      var cursorLine = this.getCursor();
    var cursorLine = this.selection.getCursor();
    var row = parseInt(cursorLine.row, 10);
    if(!isNaN(row)) {
      if(this.eventHandlers.hasOwnProperty('changeCursor')) {
        this.eventHandlers.changeCursor(cursorLine);
      }
  
    }

  },

  resize: function() {
    if(this.editor && this.editor.resize) {
      this.editor.resize();
    }
  },

  getValue: function() {
    return this.editor.getValue();
  },

  setValue: function(value) {
    this.editor.setValue(value, -1);
  },

  gotoLine: function(lineNumber) {
    this.editor.gotoLine(lineNumber, 0, false);
  },
  
  focus: function() {
    this.editor.focus();

  },

  blur: function() {
    this.editor.blur();
  },

  clearAnnotations: function() {
    this.annotations = [];
    this.editor.getSession().setAnnotations(this.annotations);
  },

  addAnnotation: function(annotation) {
    this.annotations.push(annotation);
    this.editor.getSession().setAnnotations(this.annotations);

    /*
    editor.getSession().setAnnotations([{
      row: 1,
      column: 0,
      text: "Strange error",
      type: "error" // also warning and information
    }]);
    */
  },
  start: function() {

  }
}