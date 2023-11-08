var AssemblerEditor = function() {
  this.files = new AssemblerFiles();

  this.codeEditor = null;

  this.doc = null;
  this.path = false;

  this.acmeAssembler = null;
  this.acmeWorker = null;

  this.exomizerWorker = null;
  this.ca65Assembler = null;
  this.preprocessor = null;

  this.debuggerCompact = null;


  this.useAssembler = 'acme';
//  this.useAssembler = 'ca65';

  this.acmeParser = null;

  this.targetMachine = 'x16';

  this.lastEditorLine = false;

  // avoid infinite loops on resizing code panel
  this.inResize = false;

  this.fontSize = 10;

  this.breakpoints = {};

  this.prefix = '';
  this.assembleCallback = false;
}


AssemblerEditor.prototype = {
  init: function() {
    this.preprocessor = new AssemblerPreprocessor();
    this.preprocessor.init(this);
  },

  modified: function() {
    if(g_app.openingProject) {
      return;
    }
    g_app.doc.recordModified(this.doc, this.path);
  },

  willReceiveKeyboardEvents: function(allow) {
    // if this editor loses keyboard events, blur the debugger machine
    if(allow == false) {

      if(this.debuggerCompact) {
        this.debuggerCompact.blurMachine();
      }
    }
  },

  buildC64DebuggerInterface: function(parentPanel) {
    this.prefix = 'c64debugger';
    // Editor in main panel content
    var content = UI.create("UI.SplitPanel", { "id": this.prefix + "assemblerContent" });
    parentPanel.add(content);

    var outputPanelSize = 420;
    var buildControlsPanelSize = 30;
    var buildPanel = UI.create("UI.SplitPanel");
    content.add(buildPanel);
//    content.addEast(buildPanel, outputPanelSize, true);
    
    var codeEditorPanel = UI.create("UI.Panel", { "id": this.prefix + "codeEditorPanel" });
    buildPanel.add(codeEditorPanel);

    var buildControlsPanel = UI.create("UI.Panel");
    buildPanel.addSouth(buildControlsPanel, buildControlsPanelSize, false);

    var buildOutputPanel = UI.create("UI.Panel");
    content.addEast(buildOutputPanel, outputPanelSize, true);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('ace/mode/assembly_6502', this);
    this.codeEditor.buildInterface(codeEditorPanel);

    var _this = this;

    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange(event);
    });

    this.codeEditor.on('changeCursor', function(cursorLine) {
      _this.codeEditorChangeCursor(cursorLine);
    });

    this.codeEditor.on('setbreakpoint', function(row) {
      _this.breakpointSet(row);
    });

    this.codeEditor.on('clearbreakpoint', function(row) {
      _this.breakpointCleared(row);
    });

    this.acmeParser = new AcmeParser();
    this.acmeParser.init(this);

    this.buildControls = new BuildControls();
    this.buildControls.init(this, this.prefix);
    this.buildControls.buildInterface(buildControlsPanel);

    this.assemblerOutput = new AssemblerOutput();
    this.assemblerOutput.init(this, this.prefix);
    this.assemblerOutput.buildInterface(buildOutputPanel);   
    
    UI.on('ready',function() {
      UI( _this.prefix + "assemblerContent").resize();
    });
  },

  buildInterface: function(parentPanel) {
    var _this = this;


    var isMobile = g_app.isMobile();
    var buildControlsPanelSize = 30;
    var outputPanelSize = 200;
    if(isMobile) {
      buildControlsPanelSize = 50;
      outputPanelSize = 120;
    }


    var topContent = UI.create("UI.SplitPanel", { "id": "assembler"});
    parentPanel.add(topContent);

    // Side Panel with Assembler Tools
    var toolsHidden = false;
    if(isMobile) {
      toolsHidden = true;
    }
  
    var toolsSplitPanel = UI.create("UI.SplitPanel", { "id": "toolsSplitPanel" });


    var panelSize = g_app.getPref('assembler-tools-panelsizeh');
    if(typeof panelSize == 'undefined' || panelSize == null ) {
      panelSize = 780;
    } else {
      panelSize = parseInt(panelSize, 10);
    }

    if(isNaN(panelSize) || panelSize < 10) {
      panelSize = 780;
    }

    topContent.addEast(toolsSplitPanel, panelSize, true, toolsHidden);
    topContent.on('resizeeast', function(size) {
      g_app.setPref('assembler-tools-panelsizeh', size);
    });

    var libraryPanel = UI.create("UI.SplitPanel", { "id": "assemblerLibraryPanel"} );

    var panelSize = g_app.getPref('assembler-library-panelsizeh');
    if(typeof panelSize == 'undefined' || panelSize == null ) {
      panelSize = 360;
    } else {
      panelSize = parseInt(panelSize, 10);
    }

    if(isNaN(panelSize) || panelSize < 10) {
      panelSize = 360;
    }

    toolsSplitPanel.addEast(libraryPanel, panelSize, true, toolsHidden);
    toolsSplitPanel.on('resizeeast', function(size) {
      g_app.setPref('assembler-library-panelsizeh', size);
    });

    /*
    var html = "";
    html += '<a class="assemblerToolTab" data-type="mos6502OpcodesPanel" href="javascript: void(0)">6502/6510 Instruction Set</a>';
    html += '&nbsp; | &nbsp;';
    html += '<a class="assemblerToolTab" data-type="c64MemoryMapPanel" href="javascript: void(0)">C64 Memory Map</a>';
    html += '&nbsp; | &nbsp;';
    html += '<a class="assemblerToolTab" data-type="calculatorPanel" href="javascript: void(0)">Calculator</a>';
    */


    this.tabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
    this.tabPanel.addTab({ key: 'mos6502OpcodesPanel',   title: 'Docs', isTemp: false }, true);
    this.tabPanel.addTab({ key: 'calculatorPanel',   title: 'Calculator', isTemp: false }, false);

    this.tabPanel.on('tabfocus', function(key, tabPanel) {      
      var tabIndex = _this.tabPanel.getTabIndex(key);
      if(tabIndex >= 0) {
        _this.showContent(key);
        //_this.showDebuggerContent(key);
      }
    });
    
    //var toolsNavPanel = UI.create("UI.HTMLPanel", { "html": html });
    //libraryPanel.addNorth(toolsNavPanel, 40);
    libraryPanel.addNorth(this.tabPanel, 30);

    var toolsPanel = UI.create("UI.Panel", { "id": "assemblerToolsPanel" });
    libraryPanel.add(toolsPanel);

    this.calculator = new Calculator();
    this.calculator.init(this, 'assembler');
    this.calculator.buildInterface(toolsPanel);

    this.mos6502Opcodes = new MOS6502Opcodes();
    this.mos6502Opcodes.init(this, 'assembler');
    this.mos6502Opcodes.buildInterface(toolsPanel);

    this.c64MemoryMap = new C64MemoryMap();
    this.c64MemoryMap.init(this);
    this.c64MemoryMap.buildInterface(toolsPanel);

    // Editor in main panel content
    var content = UI.create("UI.SplitPanel", { "id": "assemblerContent" });
    topContent.add(content);

    var buildPanel = UI.create("UI.SplitPanel");
    content.addSouth(buildPanel, outputPanelSize, true);
    
    var codeEditorPanel = UI.create("UI.Panel", { "id": "codeEditorPanel" });
    content.add(codeEditorPanel);


    // emulator panel

    var emulatorHidden = false;
    if(isMobile) {
      emulatorHidden = true;
    }
    
    var emulatorPanel = UI.create("UI.Panel", { "id": "codeEditorEmulator" });
//    content.addEast(emulatorPanel, 400, true, emulatorHidden);

    toolsSplitPanel.add(emulatorPanel);


    if(!emulatorHidden) {
      this.debuggerCompact = new C64Debugger();
      this.debuggerCompact.init({ "type": "compact" })
      this.debuggerCompact.buildInterface(emulatorPanel);

      var _this = this;
      UI.on('ready', function() {
  //      UI('assemblerToolsPanel').showOnly('calculatorPanel');
        UI('assemblerToolsPanel').showOnly('assembler' + 'mos6502OpcodesPanel');
/*
        $('.assemblerToolTab').on('click', function() {
          var type = $(this).attr('data-type');
          UI('assemblerToolsPanel').showOnly('assembler' + type);
        });
*/


      });
    }

    UI.on('ready', function() {
      UI("codeEditorPanel").on('resize', function() {
        _this.codeEditorPanelResize();
      });
    });



    var buildControlsPanel = UI.create("UI.Panel");
    buildPanel.addNorth(buildControlsPanel, buildControlsPanelSize, false);

    var buildOutputPanel = UI.create("UI.Panel");
    buildPanel.add(buildOutputPanel);


    this.codeEditor = new CodeEditor();
    this.codeEditor.init(this);
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {

      _this.codeEditorChange(event);
    });

    this.codeEditor.on('changeCursor', function(cursorLine) {
      _this.codeEditorChangeCursor(cursorLine);
    });

    this.codeEditor.on('setbreakpoint', function(row) {
      _this.breakpointSet(row);
    });

    this.codeEditor.on('clearbreakpoint', function(row) {
      _this.breakpointCleared(row);
    });

    this.acmeParser = new AcmeParser();
    this.acmeParser.init(this);

    this.buildControls = new BuildControls();
    this.buildControls.init(this);
    this.buildControls.buildInterface(buildControlsPanel);

    this.assemblerOutput = new AssemblerOutput();
    this.assemblerOutput.init(this);
    this.assemblerOutput.buildInterface(buildOutputPanel);

  },

  showContent: function(key) {
    UI('assemblerToolsPanel').showOnly('assembler' + key);

  },

  keyDown: function(event) {
    if(this.debuggerCompact) {
      this.debuggerCompact.keyDown(event);
    }

  },

  keyUp: function(event) {
    if(this.debuggerCompact) {
      this.debuggerCompact.keyUp(event);
    }
  },



  saveSettings: function(settings) {
    settings[this.path] = {
      editSession: this.codeEditor.getEditSession()
    }
  },

  // a breakpoint has been set
  breakpointSet: function(lineNumber) {
    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    lineNumber++;
    var path = this.path;
    // remove the /asm/ at the start
    var pathPrefix = '/asm/';
    path = path.substr(pathPrefix.length);

    if(typeof this.assemblerReport != 'undefined' 
        && typeof this.assemblerReport.lineMap[path] != 'undefined' 
        && typeof this.assemblerReport.lineMap[path][lineNumber] != 'undefined') {
      var address = this.assemblerReport.lineMap[path][lineNumber];
      if(this.debuggerCompact) {
        this.debuggerCompact.addPCBreakpoint({
          address: address,
          file: path,
          lineNumber: lineNumber
        });
      }
    }
    this.debuggerCompact.breakpoints.drawBreakpoints();    
  },

  // a breakpoint has been cleared
  breakpointCleared: function(lineNumber) {
    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    lineNumber++;
    var path = this.path;
    // remove the /asm/ at the start
    var pathPrefix = '/asm/';
    path = path.substr(pathPrefix.length);

    if(typeof this.assemblerReport != 'undefined' 
        && typeof this.assemblerReport.lineMap[path] != 'undefined' 
        && typeof this.assemblerReport.lineMap[path][lineNumber] != 'undefined') {
      var address = this.assemblerReport.lineMap[path][lineNumber];
      if(this.debuggerCompact) {
        this.debuggerCompact.removePCBreakpoint({
          address: address,
          file: path,
          lineNumber: lineNumber
        });
      }
    }
    this.debuggerCompact.breakpoints.drawBreakpoints();    

  },
  /*
  changeFontSize: function(direction) {
    this.codeEditor.changeFontSize(direction);

    // need to trigger a redraw of everything
    this.debuggerCompact.resize();
  },

  resetFontSize: function() {
    this.codeEditor.resetFontSize();
  },

  */

  setFontSize: function(fontSize) {

    var size = fontSize;

    if(typeof fontSize == 'undefined') {
      fontSize = g_app.getFontSize();
    }

    this.codeEditor.setFontSize(fontSize);

      
    if(this.debuggerCompact) {
      this.debuggerCompact.setFontSize(fontSize);
    }
  },

  toggleInvisibles: function() {
    this.codeEditor.toggleInvisibles();
  },

  toggleAutocomplete: function() {
    this.codeEditor.toggleAutocomplete();
  },

  toggleTabIndentation: function() {
    
    this.codeEditor.toggleTabIndentation();
  },

  setTheme: function(theme) {
    this.codeEditor.setTheme(theme);
  },

  undo: function() {
    this.codeEditor.undo();
  },

  redo: function() {
    this.codeEditor.redo();
  },

  codeEditorPanelResize: function() {
    if(this.inResize) {
      return;
    }

    if(!g_app.isMobile()) {
      return;
    }

    var panelId = UI('codeEditorPanel').id;
    var height = UI.getScreenHeight();// $('#' + panelId).parent().height();
    
    if(g_app.isMobile() && height < 500) {
      // keyboard is up??
      this.inResize = true;
      UI('assemblerContent').resizeThePanel({ panel: 'south', size: 50 });
      this.saveHeight = 170;
      this.inResize = false;
    } else {
      this.inResize = true;
      this.saveHeight = 170;
      UI('assemblerContent').resizeThePanel({ panel: 'south', size: this.saveHeight });
      this.inResize = false;
    }

    //UI('assemblerContent').sizepanel('south');
  },
  
  show: function() {
    this.setFontSize();

    if(this.debuggerCompact) {
      this.debuggerCompact.show();
      this.debuggerCompact.resize();
    }
//    this.refreshTree();
  },

  getCompletions: function(line, pos) {
    return this.acmeParser.getCompletions(line, pos);
  },

  codeEditorChange: function(event) {
    if(this.doc != null) {
      this.modified();
      this.doc.data = this.codeEditor.getValue();
      this.acmeParser.process(this.doc.id, this.doc.data);
    } 
  },

  codeEditorChangeCursor: function(cursorLine) {

    var row = cursorLine.row;

    if(row != this.lastEditorLine) {
      this.lastEditorLine = row;

    }


  },

  updateBreakpoints: function() {
    var session = this.codeEditor.getEditSession();
    var breakpoints = session.getBreakpoints();
    var path = this.path;

    this.breakpoints[this.path] = [];
    for(key in breakpoints) {
      this.breakpoints[this.path].push(parseInt(key, 10) + 1);
    }    
  },

  setBreakpoints: function(path) {

    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }
    this.debuggerCompact.clearPCBreakpoints();

    for(var path in this.breakpoints) {
      // remove the /asm/ at the start
      var pathPrefix = '/asm/';
      var breakpoints = this.breakpoints[path];
      path = path.substr(pathPrefix.length);

      for(var i = 0; i < breakpoints.length; i++) {
        var lineNumber = breakpoints[i];
        // now need to find address to set breakpoint..
        if(typeof this.assemblerReport != 'undefined' && typeof this.assemblerReport.lineMap[path] != 'undefined' && typeof this.assemblerReport.lineMap[path][lineNumber] != 'undefined') {
          var address = this.assemblerReport.lineMap[path][lineNumber];

          if(this.debuggerCompact) {
//            this.debuggerCompact.breakpoints.addPCBreakpoint({
            this.debuggerCompact.addPCBreakpoint({
              address: address,
              file: path,
              lineNumber: lineNumber
            });
          }
        }
      }      
    }

    if(this.debuggerCompact.breakpoints) {
      this.debuggerCompact.breakpoints.drawBreakpoints();    
    }
  },

  showFile: function(path, lineNumber, settings, forceReload) {

    var line = lineNumber;
    
    var force = false;
    if(typeof forceReload != 'undefined') {
      force = forceReload;
    }

    this.acmeParser.parseAllFiles();


    this.codeEditor.focus();

    if(path == this.path && !force) {
      // already showing it
      if(typeof line != 'undefined' && line !== false) {
        // need to go to a line..
        this.codeEditor.gotoLine(line);
      }
      return;
    }


    
    this.doc = null;

    this.path = path;
    var record = g_app.doc.getDocRecord(path);
    
    if(record != null) {

      this.doc = record;
      var _this = this;

//      if(!force && typeof settings != 'undefined' && typeof settings[path] != 'undefined') {
      if(!force && typeof settings != 'undefined' && typeof settings[path] != 'undefined' && typeof settings[path].editSession != 'undefined') {  
        this.codeEditor.setEditSession(settings[path].editSession);
      } else {
        var editSession = ace.createEditSession(record.data, 'ace/mode/assembly_6502');

        editSession.on('changeBreakpoint', function(event) {
          _this.updateBreakpoints();
        });

        this.codeEditor.setEditSession(editSession);
      }

      this.codeEditor.clearAnnotations();
      this.assemblerOutput.addAnnotationsToEditor();
      this.codeEditor.setTabIndentation();

    }

  },


  readConfig: function() {
    var defaultConfig = {
      "assembler": "acme",
      "flags": "--format cbm --msvc -r report",
      "files": "main.asm",
      "output": "out.prg",
      "target": "c64"
    };

    var config = null;
    var configRecord = g_app.doc.getDocRecord("/config/assembler.json");
    if(configRecord) {
      try {
        if(isString(configRecord.data)) {
            config = $.parseJSON(configRecord.data);
        } else {
          config = configRecord.data;
        }
  
      } catch(err) {
        console.log(err.name);
        console.log(err.message);
        return {
          "error": true,
          "message": err.message
        };
      }

      return config;
    } 

    return defaultConfig;
  },

  setConfig: function(config) {
    var configRecord = g_app.doc.getDocRecord("/config/assembler.json");
    configRecord.data = config;

  },


  processAssemblerResponse: function(result, callback) {
    var _this = this;

    var assemblerOutput = this.assemblerOutput;
    if(result.success) {
      assemblerOutput.setReport(result.reportRaw);

      this.assemblerOutput.addOutputLine({
        text: "Done"
      });       

      var size = result.prg.length;
      this.assemblerOutput.addOutputLine({
        text: "Size: " + size.toLocaleString()
      });     

/*
      if(typeof result.report.addressMap !== 'undefined') {
        var addressMap = result.report.addressMap;
        var text = '';

        var i = 0;
        var label = 'entry point';
        text += ('0000' + addressMap[i].address.toString(16)).substr(-4);

        text += ": " + label;
        this.assemblerOutput.addOutputLine({
          text: text
        });     

      }
*/

      this.assemblerMemoryMap = [];
      if(typeof result.report.memoryMap !== 'undefined') {
        var memoryMap = result.report.memoryMap;
        for(var i = 0; i < memoryMap.length; i++) {
          var text = '';
          text += ('0000' + memoryMap[i].address.toString(16)).substr(-4);
          text += ": " + memoryMap[i].label;
          this.assemblerMemoryMap.push(text);

          /*
          this.assemblerOutput.addOutputLine({
            text: text
          });     
          */
        }
      }


      //this.assemblerOutput.showOutput();

      callback(result);

      // disable exomizer for now

      if(false) {
        this.assemblerOutput.addOutputLine({
          text: "Running Exomizer..."
        });       
        this.runExomizer(result.prg, function(exomizerResult) {

          var size = exomizerResult.prg.length;
          console.log(exomizerResult);
//          callback(exomizerResult);

          _this.assemblerOutput.addOutputLine({
            text: "Exomizer Size: " + size.toLocaleString()
          });       
          for(var i = 0; i < _this.assemblerMemoryMap.length; i++) {
            _this.assemblerOutput.addOutputLine({
              text: _this.assemblerMemoryMap[i]
            });
          }
          _this.assemblerOutput.showOutput();


        });
      }

    } else {
      if(typeof result.errors != 'undefined') {
        for(var i = 0; i < result.errors.length; i++) {
          assemblerOutput.addOutputLine(result.errors[i]);
        }
      }
      assemblerOutput.showOutput();
      assemblerOutput.setReport('');
    }
  },

  runExomizer: function(prg, callback) {

    /*
    if(this.exomizerWorker) {
      this.exomizerWorker.terminate();
      this.exomizerWorker = null;
    }
    */

    if(this.exomizerWorker == null) {
      var _this = this;
      this.exomizerWorker = new Worker("lib/exomizer/exomizerWorker.js");

      this.exomizerWorker.onmessage = function(e)  {
        if(e.data.success) {
          callback(e.data);
        }
      }
    }

    this.exomizerWorker.postMessage({ 
      file: prg,
      config: {}
    });
  },


  assemble: function(callback, sourceFiles) {

    var _this = this;
    this.assembleCallback = callback;

    var config = this.readConfig();

    this.assemblerOutput.clear();
    if(typeof config.error != 'undefined' && config.error) {
      this.assemblerOutput.addOutputLine({
        text: "Error in assembler config file"
      });       

      if(typeof config.message != 'undefined') {
        this.assemblerOutput.addOutputLine({
          text: config.message
        });       
      }
      this.assemblerOutput.showOutput();
      return;
    }


    var assembler = config.assembler;
    if(typeof assembler == 'undefined') {
      this.assemblerOutput.addOutputLine({
        text: "Assembler not specified, using ACME"
      });       
      assembler = 'acme';
    };
    assembler = assembler.toLowerCase();

    if(assembler != 'acme' && assembler != 'ca65') {
      this.assemblerOutput.addOutputLine({
        text: "Unknown assembler '" + assembler + "' in config file"
      });       
      this.assemblerOutput.showOutput();
      return;
    }

    if(assembler == 'ca65') {
      this.assemblerOutput.addOutputLine({
        text: "Building with CA65.."
      });       
    } else {

      this.assemblerOutput.addOutputLine({
        text: "Building with ACME 0.97..."
      });       
    }
    this.assemblerOutput.showOutput();

    var files = [];

    if(typeof sourceFiles != 'undefined') {
      files = sourceFiles;
    } else {
      _this.collectSourceFiles('/asm', files, ['asm', 'folder']);
      var result = _this.preprocessor.preprocessSourceFiles(files);

      if(result.success === false) {
        this.processAssemblerResponse(result, callback);
        return;

      }
      _this.collectSourceFiles('/asm', files, ['bin']);
    }

    console.log('assemble files');
    console.log(files);

    // CA65!!!
    if(assembler == 'ca65') {
      if(_this.ca65Assembler == null) {
        _this.ca65Assembler = new CA65Assembler();
        _this.ca65Assembler.init(_this);
      }
      _this.ca65Assembler.assemble(files, config, function(result) {
        _this.assemblerOutput.addOutputLine({
          text: "Done"
        });       
        _this.assemblerOutput.showOutput();
        callback(result);

      });
    } else {

      if(false && this.acmeWorker) {
        this.acmeWorker.terminate();
        this.acmeWorker = null;
      }
  
      // ACME!!!
      if(_this.acmeWorker == null) {
        console.log('create new acme worker');
        _this.acmeWorker = new Worker("c64/acme097/acmeAssemblerWorker.js");

        _this.acmeWorker.onmessage = function(e)  {
//          console.log(e);

            console.log('assembler response:');
            console.log(e);
          //_this.processAssemblerResponse(e.data, callback);
          _this.processAssemblerResponse(e.data, _this.assembleCallback);
        }
      }

      _this.acmeWorker.postMessage({ 
        files: files,
        config: config
      });

/*
      _this.acmeAssembler.assemble(files, config, function(result) {
        _this.assemblerOutput.addOutputLine({
          text: "Done"
        });       
        _this.assemblerOutput.showOutput();

        callback(result);
      });
*/

    }
  },

  machinePlay: function() {
    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    if(this.debuggerCompact) {
      this.debuggerCompact.play();
    }
  },

  machineStep: function() {

    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    if(this.debuggerCompact) {
      this.debuggerCompact.step();
    }
  },

  machineStepOver: function() {
    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    if(this.debuggerCompact) {
      this.debuggerCompact.stepOver();
    }
  },

  machineStepInto: function() {
    if(this.prefix == 'c64debugger') {
      this.debuggerCompact = g_app.c64Debugger;
    }

    if(this.debuggerCompact) {
      this.debuggerCompact.stepInto();
    }
  },

  
  run: function() {
    var _this = this;

    // read in the json config file
    var config = this.readConfig();

    if(typeof config.error != 'undefined' && config.error) {
      this.assemblerOutput.clear();
      this.assemblerOutput.addOutputLine({
        text: "Error in assembler config file"
      });       

      if(typeof config.message != 'undefined') {
        this.assemblerOutput.addOutputLine({
          text: config.message
        });
      }
      this.assemblerOutput.showOutput();
      return;
    }

    var target = config.target;
    if(typeof target == 'undefined') {
      target = 'c64';
    }

    if(target != 'c64' && target != 'x16' && target != 'nes') {
      this.assemblerOutput.clear();
      this.assemblerOutput.addOutputLine({
        text: "Unknown target: '" + target + "'"
      });       
      this.assemblerOutput.showOutput();
      return;

    }

    this.build(function(result, path) {
      /*
      if(target == 'x16') {
        g_app.setMode('x16');
        g_app.x16Debugger.setPRG(result.prg);
      } else {
        g_app.setMode('c64');
        g_app.c64Debugger.setPRG(result.prg);
      }
*/
      if(_this.prefix == 'c64debugger') {
        result.startC64 = true;
        _this.assemblerReport = result.report;

        _this.codeEditor.blur();
        _this.setBreakpoints();      
        g_app.c64Debugger.setPRG(result);
        g_app.c64Debugger.focusMachine();

      } else if(target == 'c64' && _this.debuggerCompact && !g_app.isMobile()) {
        result.startC64 = true;
        _this.assemblerReport = result.report;

        _this.codeEditor.blur();
        _this.setBreakpoints();      
        _this.debuggerCompact.setPRG(result);
        _this.debuggerCompact.focusMachine();
      } else {

        if(g_app.isMobile()) {
          if(target == 'x16') {
            g_app.setMode('x16');
            g_app.x16Debugger.setPRG(result.prg);
          } else {
            g_app.setMode('c64');
            g_app.c64Debugger.setPRG({
              prg: result.prg,
              backLink: _this.path
            });
          }
    
        } else {
          g_app.projectNavigator.setPrgHandler(target);
          g_app.projectNavigator.selectDocRecord(path);
        }
      }
      /*
      if(_this.targetMachine == 'x16') {
        g_app.setMode('x16');
        g_app.x16Debugger.setPRG(result.prg);
      } else {
        g_app.setMode('c64');
        g_app.c64Debugger.setPRG(result.prg);
      }
      */

    });
  },

  collectSourceFiles: function(dir, sourceFiles, types) {
//    var sourceFiles = [];

    var doc = g_app.doc;
    var files = doc.dir(dir);
    
    for(var i = 0; i < files.length; i++) {
      var file = files[i];

      if(types.indexOf(file.type) != -1) {

        sourceFiles.push({
          id: file.id,
          name: file.name,
          content: file.data,
          filePath: file.name,
          type: file.type
        });
      } 

      if(file.type == 'folder') {
        // add the files in this folder
        var folderPath = file.name;
        
        var folderFiles = doc.dir(dir + '/' + folderPath);

        for(var j = 0; j < folderFiles.length; j++) {

          var name = folderFiles[j].name;
          var content = folderFiles[j].data;
          var filePath = folderPath + '/' + name;
          var type = folderFiles[j].type;

          if(types.indexOf(type) != -1) {
            sourceFiles.push({
              id: folderFiles[j].id,
              name: folderFiles[j].name,
              content: folderFiles[j].data,
              filePath: folderPath + '/' + folderFiles[j].name,
              type: folderFiles[j].type
            });
          }
        }

        console.log("SOURCE FILES = ");
        console.log(sourceFiles);
      } 
    }

    return sourceFiles;

  },

  build: function(callback) {

    var _this = this;
    this.assemble(function(result) {


      var config = _this.readConfig();


      var prg = bufferToBase64(result.prg);
      var filename = 'build.prg';
      if(config.target == 'nes') {
        filename = 'build.nes';
      }

      var path = '/build/' + filename;
      var doc = g_app.doc;
      var docRecord = doc.getDocRecord(path);

      if(docRecord) {
        docRecord.data = prg;
      } else {
        var newDocRecord = doc.createDocRecord('/build', filename, 'prg', prg);
      }

      g_app.projectNavigator.reloadTreeBranch('/build');
      g_app.projectNavigator.treeRoot.refreshChildren();

      if(typeof callback != 'undefined') {
        callback(result, path);
      }
    });
  },

  buildAndDownload: function() {
    var _this = this;
    this.assemble(function(result) {

console.log('build and download result');
console.log(result);

      var config = _this.readConfig();
      if(config.target == 'nes') {
        download(result.prg, 'build.nes', "application/prg");   
      } else {      
        download(result.prg, 'build.prg', "application/prg");   
      }
    });
  },


  update: function() {
    if(this.debuggerCompact) {
      this.debuggerCompact.update();
    }
  },

}


/*
*= $0801;       The program counter definition
!byte    $0E, $08, $0A, $00, $9E, $20, $28,  $33, $30, $37, $32, $29, $00, $00, $00
*= $0c00;
   lda   #03
   sta   $d020
   
   ldx #$00
   
loop_text
  lda message, x
  sta $0590,x
  inx
  cpx #$28
  bne loop_text
  
loop
   jmp   loop

!source "lib.asm"
*/

/*
message
  !scr  "                  blah blah                       "
  
*/
  