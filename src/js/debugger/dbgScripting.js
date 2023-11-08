var DbgScripting = function() {
  this.codeEditor = null;
  this.doc = null;

  this.scriptProcessor = null;

  this.prefix = 'dbg';

  this.editorElementId = '';
  this.outputElementId = '';

}

DbgScripting.prototype = {
  init: function(args) {
    if(typeof args.prefix) {
      this.prefix = args.prefix;
    }

    this.outputElementId = this.prefix + 'DebuggerScriptingOutput';

    if(c64.scripting == null) {
      c64.scripting = new C64Scripting();
      c64.scripting.init();
    }

    this.scriptProcessor = c64.scripting.scriptProcessor;



  },


  buildInterface: function(parentPanel) {
    var _this = this;

    this.uiComponent = UI.create("UI.SplitPanel", { overflow: "unset" });
    parentPanel.add(this.uiComponent);

    var controlsHTML = '';
    
    controlsHTML += '<div class="panelFill">';
    controlsHTML += '<div id="' + this.prefix + 'ScriptingButtonPanel" style="position:absolute; top: 0px; left:0px; right:0px; height:26px; padding: 4px">';
    controlsHTML += '  <div class="ui-button" id="' + this.prefix + 'ScriptingRun"><i class="halflings halflings-play"></i> Run Script</div>';
    controlsHTML += '</div>';
   

    controlsHTML += '  <div style="overflow: auto; position:absolute; top: 26px; left:0px;right:0px;height: 24px">';
    controlsHTML += '  <div class="ui-button" id="' + this.prefix + 'ScriptingClearConsole">Clear</div>';
    controlsHTML += '  </div>';

    controlsHTML += '  <div style="overflow: auto; position:absolute; top: 50px; left:0px;right:0px;bottom:0px" id="' + this.outputElementId + '">';
    controlsHTML += '  </div>';
    controlsHTML += '</div>';


    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": controlsHTML });
    this.uiComponent.addSouth(this.controlsPanel, 120, true);

    var codeEditorPanel = UI.create("UI.Panel");
    this.uiComponent.add(codeEditorPanel);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('javascript');
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange();
    });

    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  initEvents: function() {
    var _this = this;
    $('#' + this.prefix + 'ScriptingRun').on('click', function() {
      console.log("scripting run click!");
      _this.run();
     // g_app.c64Scripting.run();
    });

    $('#' + this.prefix + 'ScriptingClearConsole').on('click', function() {
      _this.clearConsole();
    });

    /*
    $('#' + this.prefix + 'ScriptingTrigger').on('click', function() {      
      _this.scriptProcessor.triggerEvent('c64.mousedown');
    }); 
    */

    $('#' + this.outputElementId).on('click', '.scriptingOutputLine', function() {
      var lineId = $(this).attr('data-id');
      var type = $(this).attr('type');
      var line = $(this).attr('data-line');

      //var lineNumber = error.lineNumber - this.preScriptLineCount;    
      $('.scriptingOutputLine').css('background-color', 'transparent');
      $('.scriptingOutputLine').css('color', '#eeeeee');
      $(this).css('background-color', '#4586dd');
      $(this).css('color', '#ffffff');

      if(typeof line != 'undefined') {
        line = parseInt(line, 10);
        if(!isNaN(line)) {
          _this.codeEditor.gotoLine(line, 0, false);
        }
      }
    });

  },

  run: function() {
    console.log("run!" + this.prefix);
    if(this.scriptProcessor.getIsRunning()) {
      this.scriptProcessor.stopScript();
    } else {
      var script = '';
      this.path = '/scripts/c64.js';

      var record = g_app.doc.getDocRecord(this.path);
  
      if(record != null && record.data != '') {
        script = record.data;
      } else {
        script = this.codeEditor.getValue();
      }

      var errors = [];

      // filepath used for errors?
      this.scriptProcessor.runScripts([ {content: script, filePath: 'c64scripting'} ]);
    }
  },
    

  clearConsole: function() {
    $('#' + this.outputElementId).html('');
  },

  show: function() {
    this.path = '/scripts/c64.js';

    var record = g_app.doc.getDocRecord(this.path);

    if(record == null) {
      // create it?
      var scripts = g_app.doc.getDocRecord('/scripts');
      if(scripts) {
        g_app.doc.createDocRecord('/scripts', 'c64.js', 'script', "");
        record = g_app.doc.getDocRecord(this.path);
      }
    }


    if(record != null) {
      if(record.data == '') {
        record.data = sampleC64DebuggerScript;
      }
      this.codeEditor.setValue(record.data);
      this.doc = record;
    }

    var _this = this;
    this.scriptProcessor.on('start', function() {
      $('#' + _this.prefix + 'ScriptingButtonPanel').css('background-color', '#222222');
      $('#' + _this.prefix + 'ScriptingRun').html('<i class="halflings halflings-stop"></i> Stop Script');
      $('#' + _this.prefix + 'ScriptingRun').addClass('ui-button-info');
    });

    this.scriptProcessor.on('end', function() {
      $('#' + _this.prefix + 'ScriptingButtonPanel').css('background-color', '#111111');
      $('#' + _this.prefix + 'ScriptingRun').html('<i class="halflings halflings-play"></i> Start Script');
      $('#' + _this.prefix + 'ScriptingRun').removeClass('ui-button-info');
    });

    this.scriptProcessor.setOutputElementId(this.outputElementId);
  },

  codeEditorChange: function() {
    if(this.doc != null) {
      this.doc.data = this.codeEditor.getValue();
    } 
  },


}