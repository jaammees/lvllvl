var Scripting = function() {
  this.codeEditor = null;

  this.visible = false;

  this.interpreter = null;
  this.isRunning = false;

  // script will run while processing events
  this.isProcessingEvents = false;
  this.pendingEvents = [];

  this.apiInitFunctions = [];

  this.errorHandler = null;

  this.doc = null;

  this.currentOutputLineId = 0;

  this.outputElementId = 'scriptingOutputPanel';

  this.preScripts = {};

  this.eventHandlers = {};

}

Scripting.prototype = {
  init: function(args) {
    if(typeof args != 'undefined') {
      if(typeof args.outputElementId != 'undefined') {
        this.outputElementId = args.outputElementId;
      }

      this.parentPanel = args.parentPanel;

    }

  },


  setOutputElementId: function(elementId) {
    this.outputElementId = elementId;
  },

  
  on: function(eventName, f) {
    this.eventHandlers[eventName] = f;
  },

  buildInterface: function() {
    this.uiComponent = UI.create("UI.SplitPanel", { "id": "scriptingSplitPanel" });
    this.parentPanel.add(this.uiComponent);

    var codeEditorPanel = UI.create("UI.Panel");
    this.uiComponent.add(codeEditorPanel);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('javascript');
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange();
    });


    var titleHTML = '<div class="title" style="background-color: #111111; height: 28px">';
    titleHTML += '<div style="position: absolute; top: 6px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    titleHTML += '  Scripting';
    titleHTML += '</div>';
//    titleHTML += '<div style="position: absolute; top: 2px; right: 2px; width: 20px"><button id="scriptingClose" class="">x</button></div>';        

    titleHTML += '<div style="position: absolute; top: 2px; right: 2px; width: 20px">';    
    titleHTML += '<div id="scriptingClose" class="ui-button ui-dialog-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
    titleHTML += '</div>';

    titleHTML += '</div>';


    var titlePanel = UI.create("UI.HTMLPanel", { "html": titleHTML });
    this.uiComponent.addNorth(titlePanel, 28, false);

    var runPanel = UI.create("UI.SplitPanel");
    this.uiComponent.addSouth(runPanel, 180);

    var controlsHTML = '<div class="panelFill"  id="scriptingRunControls">';
    controlsHTML += '<div id="scriptingRunButton" class="ui-button ui-button-primary"><i class="halflings halflings-play"></i> Run</div>';
    controlsHTML += '&nbsp;&nbsp;'
    controlsHTML += '<div id="scriptingStopButton" class="ui-button">Stop</div>';
    /*
    controlsHTML += '&nbsp;&nbsp;'
    controlsHTML += '<button id="scriptingTickButton">Tick</button>';
    controlsHTML += '&nbsp;&nbsp;'
    controlsHTML += '<button id="scriptingStopButton">Create GIF...</button>';
    */
    
    controlsHTML += '</div>';

    var runControlsPanel = UI.create("UI.HTMLPanel", { "html": controlsHTML });
    runPanel.addNorth(runControlsPanel, 40, false);

    var scriptingOutputHTML = '<div class="panelFill" id="' + this.outputElementId + '">';
    scriptingOutputHTML += '</div>';
    var runOutputPanel = UI.create("UI.HTMLPanel", { "html": scriptingOutputHTML });
    runPanel.add(runOutputPanel);

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });

  },

  initEvents: function() {
    var _this = this;
    $('#scriptingRunButton').on('click', function() {
      var script = _this.codeEditor.getValue();

      _this.runScript(script);
    });

    $('#scriptingTickButton').on('click', function() {
      _this.doTick();
    });

    $('#scriptingStopButton').on('click', function() {
      _this.stopScript();
    });

    $('#scriptingClose').on('click', function() {
      _this.toggleVisible();
    });


    $('#scriptingOutputPanel').on('click', '.scriptingOutputLine', function() {
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


  codeEditorChange: function() {
    if(this.doc != null) {
      this.doc.data = this.codeEditor.getValue();
    } 
  },


  toggleVisible: function() {
    this.visible = !this.visible;
    UI("mainSplitPanel").setPanelVisible('west', this.visible);


    if(this.visible) {
      if(!this.uiComponent) { 
        this.buildInterface();
      }
      this.load('/scripts/screen.js');

    }

  },


  load: function(path, lineNumber) {
    if(typeof lineNumber == 'undefined' && path == this.path) {
      // already showing it
      return;
    }

    this.currentFile = null;
    this.path = path;

    var record = g_app.doc.getDocRecord(path);
    if(record != null) {

      this.codeEditor.setValue(record.data);
      this.doc = record;

      if(typeof lineNumber != 'undefined') {
        this.codeEditor.gotoLine(lineNumber);
      }
    }
  },

  logError: function(message) {

    /*
    var errors = $('#scriptingOutput').val();
    errors += message + '\n';
    $('#scriptingOutput').val(errors);
    */

  },


  initInterpreter: function() {


  },


  registerAPI: function(apiInitFunction) {
    this.apiInitFunctions.push(apiInitFunction);
  },

  initAPI: function(interpreter, scope) {
    var _this = this;

    // System object
    var systemObj = interpreter.createObjectProto(interpreter.OBJECT_PROTO);
    interpreter.setProperty(scope, 'System', systemObj);

    // get pending events, returns an array of pending events.
    var wrapper = function() {
/*
      console.log('get pendingevents');
      console.log(_this.pendingEvents);
*/
      
      return interpreter.nativeToPseudo(_this.pendingEvents);
    }

    interpreter.setProperty(systemObj, 'getPendingEvents',
                    interpreter.createNativeFunction(wrapper, false),
                    Interpreter.NONENUMERABLE_DESCRIPTOR);


    // events processed, clear the processing events flag, clear pending events
    var eventsProcessed = function() {
      _this.isProcessingEvents = false;
      _this.pendingEvents = [];
    }

    interpreter.setProperty(systemObj, 'eventsProcessed',
                    interpreter.createNativeFunction(eventsProcessed, false),
                    Interpreter.NONENUMERABLE_DESCRIPTOR);


    GraphicAPI.initAPI(interpreter, scope);

    var consoleObj = interpreter.createObjectProto(interpreter.OBJECT_PROTO);
    interpreter.setProperty(scope, 'console', consoleObj);


    // console.log
    var wrapper = function(args) {
      var content = interpreter.pseudoToNative(args);
      if (typeof content !== 'string' && ! (content instanceof String) ) {
        content = JSON.stringify(content);
      }

//      console.log('console log');
//      console.log(content);
      _this.addOutputLine({ message: content });
    }

    interpreter.setProperty(consoleObj, 'log',
        interpreter.createNativeFunction(wrapper, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     


    for(var i = 0; i < this.apiInitFunctions.length; i++) {
      this.apiInitFunctions[i](interpreter, scope);
    }
  },

  parseBabelError: function(babelError) {
    var error = {};
    var lines = babelError.toString().split("\n");
    if(lines.length == 0) {
      return;
    }

    var lineNumber = false;
    var line = lines[0];

    var linePosition = line.lastIndexOf('(');
    if(linePosition != -1) {

      linePosition++;
      var lineInfo = line.substring(linePosition);
      line = line.substring(0, linePosition - 1);

      var lineEndPosition = lineInfo.lastIndexOf(')');
      if(lineEndPosition !== -1) {
        lineInfo = lineInfo.substring(0, lineEndPosition);

      }

      var colonPos = lineInfo.indexOf(':');
      if(colonPos != -1) {
        lineInfo = lineInfo.substring(0, colonPos);
      }
//      console.log('line info = ' + lineInfo);

      lineNumber = parseInt(lineInfo, 10);
      if(isNaN(lineNumber)) {
        lineNumber = false;
      }
    }

    error.lineNumber = lineNumber;
    error.message = line;

    return error;
  },

  setPrescript: function(section, script) {
    this.preScripts[section] = script;
  },

  editorPreScript: function() {
    var script = '';

    var lineBreak = ";";//\n";
    script += 'var Editor = {};' + lineBreak;
    script += 'Editor.eventHandlers = {};' + lineBreak;
    script += 'Editor.hasEventHandlers = false;' + lineBreak;

    script += 'Editor.on = function(eventType, callback) {' + lineBreak;
    script += '  if(eventType === "run") { ' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  } else {' + lineBreak;
    script += '    Editor.hasEventHandlers = true;' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  }';
    script += '}' + lineBreak;

    script += GraphicAPI.getPreScript();

    for(var key in this.preScripts) {
      script += this.preScripts[key];
    }

    return script;

  },

  editorPostScript: function() {
    var script = "";
    var lineBreak = ";"; //"\n";

    script += 'if(Editor.hasEventHandlers) {' + lineBreak;
    script += '  while(1) {' + lineBreak;  
    script += '    var _systemEvents = System.getPendingEvents();' + lineBreak;

    script += '    if(_systemEvents.length > 0) {' + lineBreak;
    script += '      for(var _systemEventIndex = 0; _systemEventIndex < _systemEvents.length; _systemEventIndex++) {' + lineBreak;
    script += '        if(Editor.eventHandlers.hasOwnProperty(_systemEvents[_systemEventIndex])) {' + lineBreak;
    script += '          Editor.eventHandlers[_systemEvents[_systemEventIndex]]();' + lineBreak;
    script += '        }' + lineBreak;
    script += '      }' + lineBreak;
    script += '    }' + lineBreak;

    script += '    System.eventsProcessed();' + lineBreak;
    script += '  }' + lineBreak;
    script += '}' + lineBreak;

    return script;    
  },


  clearOutputLines: function() {
    $('#' + this.outputElementId).html('');
  },

  addOutputLine: function(args) {
    var message = args.message;
    var type = 'info';
    var lineNumber = false;

    if(typeof args.lineNumber != 'undefined') {
      lineNumber = args.lineNumber;
    }

    if(typeof args.type != 'undefined') {
      type = args.type;
    }

    this.currentOutputLineId++;

    var lineHTML = '';


    lineHTML += '<div class="scriptingOutputLine" id="scriptingOutputLine' + this.currentOutputLineId + '" data-id="' + this.currentOutputLineId + '" data-type="' + type + '"';
    if(lineNumber !== false) {
      lineHTML += ' data-line="' + lineNumber + '"';
    }  
    lineHTML += '>';

    if(type == 'error') {
      lineHTML += '<div class="assemblerOutputErrorIcon"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
    }

    if(lineNumber !== false) {
      lineHTML += lineNumber + ': ';
    }
    lineHTML += message;
    lineHTML += '</div>';


    console.log('output element id = ' + this.outputElementId);
    $('#' + this.outputElementId).append(lineHTML);

    var elmnt = document.getElementById("scriptingOutputLine" + this.currentOutputLineId);
    elmnt.scrollIntoView(false);

  },

  showErrors: function() {
    var outputHTML = '';
    for(var i = 0; i < this.errors.length; i++) {
      var lineNumber = this.errors[i].lineNumber - this.preScriptLineCount;
      this.addOutputLine({
        message: this.errors[i].message,
        lineNumber: lineNumber,
        type: 'error'
      });
    }

  },


  lineCount: function(content) {
    return content.split('\n').length;
  },

  runScripts: function(scripts, args) {
    this.errorHandler = null;

    if(typeof args != 'undefined') {
      if(typeof args.errorHandler != 'undefined') {
        this.errorHandler = args.errorHandler;
      }
    }

    if(scripts.length == 0) {
      return;
    }
    this.scriptMap = [];
    this.errors = [];

    var allScripts = '';
    var script = '';
    var currentLine = 0;
    var lineCount = 0;
    // filepath, content

    // pre script goes first...
    script = this.editorPreScript() + "\n";
    lineCount = this.lineCount(script);

    // script map takes care of prescript line count
    this.preScriptLineCount = 0;//lineCount;

    allScripts += script;

    this.scriptMap.push({ from: currentLine, to: currentLine + lineCount, filePath: 'prescript' });
    currentLine += lineCount;

    // join all the scripts together
    for(var i = 0; i < scripts.length; i++) {
      script = scripts[i].content;
      lineCount = this.lineCount(script);
      this.scriptMap.push({ from: currentLine, to: currentLine + lineCount, filePath: scripts[i].filePath });
      currentLine += lineCount;

      allScripts += script;
    }

    script = this.editorPostScript() + "\n";
    lineCount = this.lineCount(script);
    allScripts += script;
    this.scriptMap.push({ from: currentLine, to: currentLine + lineCount, filePath: 'postscript' });
    currentLine += lineCount;


    // translate it...
    var transformedScript = null;

    try {
      transformedScript = Babel.transform(allScripts, { presets: ['es2015'], retainLines: true });
    } catch(e) {
      var error = this.parseBabelError(e);
      this.mapError(error);

      this.errors.push(error);
      console.log("ERROR!!!");
      console.log(error);

      if(this.errorHandler !== null) {
        this.errorHandler(error);
      } else {
        this.showErrors();
      }
      return;
    }


    // ok, run it...
    var code = transformedScript.code;
    this.run(code, args);
  },

  mapError: function(error) {
    var lineNumber = error.lineNumber;
    var filePath = false;
    for(var i = 0; i < this.scriptMap.length; i++) {
      if(lineNumber >= this.scriptMap[i].from && lineNumber < this.scriptMap[i].to) {
        error.filePath = this.scriptMap[i].filePath;
        error.lineNumber = lineNumber - this.scriptMap[i].from + 1;
        return;

      }
    }
  },

  runScript: function(script, args) { 

    this.errorHandler = null;

    if(typeof args != 'undefined') {
      if(typeof args.errorHandler != 'undefined') {
        this.errorHandler = args.errorHandler;
      }
    }
//    var script = this.codeEditor.getValue();
    if(script == '') {
      return;
    }

    var preScript = this.editorPreScript();
    var preScriptLines = preScript.split("\n");
    this.preScriptLineCount = preScriptLines.length;


    script = this.editorPreScript() + "\n" + script + "\n" + this.editorPostScript();

    try {
      script = Babel.transform(script, { presets: ['es2015'], retainLines: true });
    } catch(e) {

      this.errors = [];
      var error = this.parseBabelError(e);
      this.errors.push(error);

      if(this.errorHandler !== null) {
        this.errorHandler(error);
      } else {
        this.showErrors();
      }

      return;
    }


    var code = script.code;
    this.run(code, args);
  
  },



  run: function(code) {
    var _this = this;

    this.interpreter = new Interpreter(code, function(interpreter, scope) {
      _this.initAPI(interpreter, scope);
    });        



    this.startedRunning();
    this.isProcessingEvents = true;
    this.code = code;

    this.processScriptEvents();
  },


  doTick: function() {
    if(this.isRunning) {

      this.pendingEvents = [];
      this.pendingEvents.push('tick');
      this.isProcessingEvents = true;
      this.processScriptEvents();
    }
  },

  triggerEvent: function(eventName) {
    if(this.isRunning) {
      // make sure event name is a string
      if (typeof eventName === 'string' || eventName instanceof String) {
        this.pendingEvents.push(eventName);
        this.isProcessingEvents = true;
        this.processScriptEvents();
      }
    }
  },

  processScriptEvents: function() {
    var lastStart = false;
    var lastEnd = false;

    try {
//      console.log('run script');
      var count = 0;
      GraphicAPI.frameStart();
      while(count < 1000000 && this.isRunning && this.isProcessingEvents) {
        if(!this.interpreter.step()) {
          break;
        }

        // keep track of line the interpreter is up to..
        var lastNode = this.interpreter.stateStack[this.interpreter.stateStack.length - 1];
        lastStart = lastNode.node.start;
        lastEnd = lastNode.node.end;
      }
      GraphicAPI.frameDone();
    } catch (e) {
      this.finishedRunning();
      this.isProcessingEvents = false;

      // error, find the line number from character range.
      var lineNumber = 1;
      if(lastStart === false) {

      } else {
        for(var i = 0; i < lastStart; i++) {
          if(this.code[i] == '\n') {
            lineNumber++;
          }          
        }

        if(this.errorHandler !== null) {
          var error = {
            lineNumber: lineNumber,
            message: e.message
          };
          //this.errors.push(error);
          this.errorHandler(error);
        } else {
          var error = {
            type: 'error',
            lineNumber: lineNumber,
            message: e.message
          };          
          this.mapError(error);

          this.addOutputLine(error);
//          console.log('error on line ' + lineNumber);
//          console.log(e.message);          
        }

      }
    }

//    g_app.textModeEditor.grid.update();
  },

  stopScript: function() {
    this.finishedRunning();
  },


  getIsRunning: function() {
    return this.isRunning;
  },


  startedRunning: function() {
    this.clearOutputLines();
//    this.addOutputLine({ message: 'Running...' });
    this.isRunning = true;
    if(typeof this.eventHandlers['start'] != 'undefined') {
      this.eventHandlers['start']();
    }
  },

  finishedRunning: function() {
//    this.addOutputLine({ message: 'Finished.' });
    this.isRunning = false;
    if(typeof this.eventHandlers['end'] != 'undefined') {
      console.log('call callback handler');
      this.eventHandlers['end']();
    }

  }



}
