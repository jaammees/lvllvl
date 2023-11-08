// NO LONGER USED!!!!!!!!!!!!!!!!!!!!
// moved to c64 debugger

var REGA = 0;
var REGX = 1;
var REGY = 2;
var REGSP = 3;


var C64DebuggerCompact = function() {

//  this.c64 = null;
//  this.cpu = null;

  this.uiComponent = null;

  this.disassembly = null;
  this.c64Memory = null;
  this.c64Registers = null;
  this.c64Charset = null;
  this.c64Sprites = null;
  this.breakpoints = null;
  this.onscreenJoystick = null;
  this.onscreenKeyboard = null;

  this.lastDriveStatus = false;
  this.lastDrivePosition = false;

  this.c64Focus = true;

  this.prefix = 'c64compactpre';

  this.debuggerContent = 'disassembly';
  this.runningButtons = true;
  this.showRaster = false;

  this.c64Size = 1;

  this.joystickPort = 1;

  this.lastUpdate = getTimestamp();
  this.offscreenCanvas = null;
  this.imageData = null;

  
}

C64DebuggerCompact.prototype = {

  init: function(mode) {
  },


  setSize: function(size) {
    switch(size) {
      case 1:
        UI('c64-size-1').setChecked(true);
        UI('c64-size-2').setChecked(false);
        this.c64Size = 1;
        break;
      case 2:
        this.c64Size = 2;
    
        break;
    }

    this.canvas.width = this.offscreenCanvas.width * this.c64Size;
    this.canvas.height = this.offscreenCanvas.height * this.c64Size;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
 
    if(this.c64Focus) {
      this.focusMachine();
    } else {
      this.blurMachine();
    }

  },

  show: function() {

    
    if(this.offscreenCanvas == null) {
     
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 384;
      this.offscreenCanvas.height = 272;
      this.offscreenContext = this.offscreenCanvas.getContext('2d');
      this.imageData = this.offscreenContext.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

      this.canvas = document.getElementById('c64DebuggerCompactCanvas');
      this.canvas.width = 384;
      this.canvas.height = 272;    
      this.context = this.canvas.getContext('2d');

      this.setSize(1);

      this.c64Memory = new DbgMemory();
      this.c64Memory.init({
        "debugger": this, 
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64Memory.buildInterface(this.memoryPanel);

      this.disassembly = new DbgDisassembly();
      this.disassembly.init({ 
        "prefix": this.prefix,
        "debugger": this, 
        "machine": this.c64 });
      this.disassembly.buildInterface(this.disassemblyPanel);

      this.c64Charset = new DbgCharset();
      this.c64Charset.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64Charset.buildInterface(this.charsetPanel);

      this.c64Sprites = new DbgSprites();
      this.c64Sprites.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64Sprites.buildInterface(this.spritesPanel);


      this.c64Registers = new DbgRegisters();
      this.c64Registers.init({ 
        "prefix": this.prefix,
        "debugger": this, 
        "machine": this.c64 });
      this.c64Registers.buildInterface(this.registersPanel);

      this.breakpoints = new DbgBreakpoints();
      this.breakpoints.init({ 
        "prefix": this.prefix,
        "debugger": this, 
        "machine": this.c64 });
      this.breakpoints.buildInterface(this.breakpointsPanel);


    }
    this.resize();
  },
 
  resize: function() {
    UI(this.prefix + 'DisassemblyCanvas').resize();
    UI(this.prefix + 'MemoryCanvas').resize();
    UI(this.prefix + 'RegistersCanvas').resize();
    UI(this.prefix + 'BreakpointsCanvas').resize();
  },

  buildInterface: function(parentPanel) {
    var _this = this;

    this.uiComponent = UI.create("UI.Panel", { "id": "c64debuggerCompactPanel" } );
    parentPanel.add(this.uiComponent);

    var splitPanel = UI.create("UI.SplitPanel", { "id": "c64DebuggerCompactSplitPanel"});
    this.uiComponent.add(splitPanel);


    var buttonsHTML = '';
    buttonsHTML += '<div style="position: relative">';

    buttonsHTML += '  <div style="margin: 4px 0; position: relative">';
    buttonsHTML += '    <div class="ui-button" id="c64CompactPlay" style="width: 68px"><i class="halflings halflings-pause"></i>&nbsp;Pause (F9)</div>';
    buttonsHTML += '    <div class="ui-button ui-button-disabled" id="c64CompactStep">Step (F10)</div>';

    
    buttonsHTML += '    <div class="ui-button ui-button-disabled" style="display: none" id="c64CompactStepCycle">Step 1/2 Cycle</div>';
    
//    html += '    <div class="ui-button" id="c64CompactReset">machine reset</div>'; 


    buttonsHTML += '  </div>';   


    
    buttonsHTML += '</div>';

    var html = '';
    html += '<div style="padding: 4px">';

    html += '      <label class="cb-container">Show raster position';
    html += '        <input type="checkbox" id="c64CompactShowRaster" name="c64CompactShowRaster" value="1">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';                

    html += '  <div style="margin: 4px 0; position: absolute; right: 4px; top: 3px">';
    html += '    Joystick';
    html += '    <div style="display: inline-block">';
    html += '      <label class="rb-container">None';
    html += '        <input type="radio" id="c64CompactJoystickPort0" name="c64CompactJoystickPort" checked="checked" value="0">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';
    html += '      <label class="rb-container">Port 1';
    html += '        <input type="radio" id="c64CompactJoystickPort1" name="c64CompactJoystickPort" value="1">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';                
    html += '      <label class="rb-container">Port 2';
    html += '        <input type="radio" id="c64CompactJoystickPort1" name="c64CompactJoystickPort" value="2">';
    html += '        <span class="checkmark"></span>';
    html += '      </label>';                
    html += '    </div>'
    html += '  </div>';

    html += '</div>'; 


    html += '<div>';

    html += '<form id="c64DebuggerCompactForm">';
    html += '  <input class="formControl"  id="c64CompactChoosePRG" type="file" accept=".prg" style="position: absolute; top: -50px; left: -100px" />';
    html += '  <input class="formControl"  id="c64CompactChooseD64" type="file" accept=".d64" style="position: absolute; top: -50px; left: -150px" />';
    html += '  <input class="formControl"  id="c64CompactChooseCRT" type="file" accept=".crt" style="position: absolute; top: -50px; left: -150px" />';
    html += '</form>';


    html += '  <canvas id="c64DebuggerCompactCanvas" style="cursor: default; border: 2px solid #111111"></canvas>';
    html += '  <canvas id="c64DebuggerCompactCanvasResize"  style="cursor: default; border: 2px solid #111111"></canvas>'

    html += '</div>';

    /*
    html += '<div>DRIVE:';
    html += '<div id="c64DebuggerDriveLight" style="display: inline-block; width: 30px; height: 16px; background-color: rgb(255, 0, 0);"></div>';
    html += '<div style="display: inline" id="c64DebuggerAttachedDisk"></div>';
    html += '<div id="c64DebuggerAttachDisk" class="ui-button">Attach Disk</div>';
    html += '<div id="c64DebuggerDrivePosition"></div>';
    html += '</div>';
    */

    var htmlComponent = UI.create("UI.HTMLPanel", { "id": "c64DebuggerCompactHTML", "html": html  });
    //splitPanel.add(htmlComponent);

    this.registersPanel = UI.create("UI.Panel");
//    splitPanel.addNorth(this.registersPanel, 34, false);

    this.cpuPanel = UI.create("UI.SplitPanel");
//    splitPanel.addSouth(this.cpuPanel, 300, true);


    /*
*/

    splitPanel.add(this.cpuPanel);

    this.cpuPanel.addNorth(htmlComponent, 280);//280);

    this.breakpointsPanel = UI.create("UI.Panel");
    this.cpuPanel.addSouth(this.breakpointsPanel, 100);


    var controlsPanel = UI.create("UI.SplitPanel");
    this.cpuPanel.add(controlsPanel);

//    var buttonsHTML = 'buttons!';
    var buttonsPanel = UI.create("UI.HTMLPanel", { html: buttonsHTML });

    // tab panel and disassembly/memory
    var debuggerOutputSplitPanel = UI.create("UI.SplitPanel");

    controlsPanel.addNorth(this.registersPanel, 38, false);
    controlsPanel.add(debuggerOutputSplitPanel);
    controlsPanel.addSouth(buttonsPanel, 40, false);


    this.tabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
    this.tabPanel.addTab({ key: 'disassembly',   title: 'Disassembly', isTemp: false }, true);
    this.tabPanel.addTab({ key: 'memory',   title: 'Memory', isTemp: false }, false);
    this.tabPanel.addTab({ key: 'charset',   title: 'Charset', isTemp: false }, false);
    this.tabPanel.addTab({ key: 'sprites',   title: 'Sprites', isTemp: false }, false);

    this.tabPanel.on('tabfocus', function(key, tabPanel) {      
      var tabIndex = _this.tabPanel.getTabIndex(key);
      if(tabIndex >= 0) {
        _this.showDebuggerContent(key);
      }
    });



    this.debuggerOutputPanel = UI.create("UI.Panel");
    debuggerOutputSplitPanel.add(this.debuggerOutputPanel);
    debuggerOutputSplitPanel.addNorth(this.tabPanel, 30, false);

    this.disassemblyPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactDisassembly"});

    this.debuggerOutputPanel.add(this.disassemblyPanel);

    this.memoryPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactMemory"});
    this.debuggerOutputPanel.add(this.memoryPanel);

    this.charsetPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactCharset"});
    this.debuggerOutputPanel.add(this.charsetPanel);

    this.spritesPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactSprites"});
    this.debuggerOutputPanel.add(this.spritesPanel);

    UI.on('ready', function() {
      _this.showDebuggerContent('disassembly');
      _this.initEvents();
    });

  },

  showDebuggerContent: function(key) {
    this.debuggerContent = key;

    switch(key) {
      case 'disassembly':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactDisassembly")
        break;

      case 'memory':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactMemory")
        break;

      case 'charset':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactCharset")
        break;
      case 'sprites':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactSprites")
        break;

    }

    this.debuggerOutputPanel.resize();
  },


  initEvents: function() {
    var _this = this;

    $('input[name=c64CompactJoystickPort]').on('click', function() {
      var joystickPort = $('input[name=c64CompactJoystickPort]:checked').val();
      _this.setJoystickPort(joystickPort);
    });

    $('#c64CompactShowRaster').on('click', function() {
      var showRaster = $(this).is(':checked');
      _this.setShowRaster(showRaster);
    });

    $('#c64CompactPlay').on('click', function() {
      _this.play();
    });

    $('#c64CompactStep').on('click', function() {
      _this.step();
    });

    $('#c64CompactStepCycle').on('click', function() {
      _this.stepCycle();
    });

    $('#c64CompactReset').on('click', function() {
      _this.machineReset();
    });

    $('#c64DebuggerCompactCanvas').on('click', function(event) {
      _this.focusMachine();
    });

    $('#c64DebuggerCompactCanvasResize').on('click', function(event) {
      _this.focusMachine();
    });


    document.getElementById('c64CompactChoosePRG').addEventListener("change", function(e) {
      var file = document.getElementById('c64CompactChoosePRG').files[0];
      _this.loadPRGFile(file);
    });

    document.getElementById('c64CompactChooseD64').addEventListener("change", function(e) {
      var file = document.getElementById('c64CompactChooseD64').files[0];
      _this.attachD64(file);
    });

    document.getElementById('c64CompactChooseCRT').addEventListener("change", function(e) {
      var file = document.getElementById('c64CompactChooseCRT').files[0];
      _this.inserCRT(file);
    });

  },


  choosePRG: function() {
    $('#c64CompactChoosePRG').click();
  },

  chooseD64: function() {
    $('#c64CompactChooseD64').click();
  },

  chooseCRT: function() {
    $('#c64CompactChooseCRT').click();
  },

  loadPRGFile: function(file) {
//    this.c64.loadPRG(file);

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);

      c64_reset();
      c64_loadPRG(data, data.length, false);
    };

    reader.readAsArrayBuffer(file);


    this.prgFile = file;
    this.prgData = null;

  },  

  attachD64: function(file) {

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      c64_insertDisk(data, data.length);
    };
    reader.readAsArrayBuffer(file);
 
    
    var filename = file.name;

    $('#c64DebuggerAttachedDisk').html(filename);

  },

  insertCRT: function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      console.log("INSERT CRT!!!");
      console.log(data);
//      c64_insertDisk(data, data.length);
    };
    reader.readAsArrayBuffer(file);

  },

  step: function() {
    if(!debugger_isRunning()) {
      debugger_step();
      

      if(this.showRaster) {
        this.drawRasterPosition();
      }
    }
  },

  stepCycle: function() {
    return;
    if(!this.c64.isRunning()) {
      this.c64.stepCycle();
    }

  },

  updateButtons: function() {
    console.log('updateButtons');
    if(debugger_isRunning()) {
      this.runningButtons = true;
      $('#c64CompactPlay').html('<i class="halflings halflings-pause"></i>&nbsp;Pause (F9)');
      $('#c64CompactStep').addClass('ui-button-disabled');
      $('#c64CompactStepCycle').addClass('ui-button-disabled');
    } else {
      this.runningButtons = false;
      $('#c64CompactPlay').html('<i class="halflings halflings-play"></i>&nbsp;Play (F9)');
      $('#c64CompactStep').removeClass('ui-button-disabled');
      $('#c64CompactStepCycle').removeClass('ui-button-disabled');
    }
  },

  play: function() {

    if(debugger_isRunning()) {
      debugger_pause();
    } else {
      debugger_play();
    }

    this.updateButtons();
  },
  machineReset: function() {
    //$('#c64DebuggerForm').reset();
    $('#c64DebuggerAttachedDisk').html('');
    c64_reset();

  },
  setPRG: function(args) {
    c64_reset();
    c64_loadPRG(args.prg, args.prg.length, false);    

    if(typeof args.report != 'undefined') {
      this.disassembly.setReport(args.report);
      this.c64Memory.setReport(args.report);
    } else {
      this.disassembly.setReport([]);
      this.c64Memory.setReport([]);
    }
//    this.c64.play();
  },


  readByte: function(address) {
    var value = c64_cpuRead(address);

    return value & 0xff;
  },

  writeByte: function(address, value) {
    c64_cpuWrite(address, value);
  },

  vicReadRegister: function(reg) {
    return c64_vicReadRegister(reg) & 0xff;
  },

  vicRead: function(address) {
    return c64_vicRead(address) & 0xff;
  },



  // move these to cpu????
  getRegA: function() {
    return c64_getRegA();
  },

  setRegA: function(v) {
    c64_setRegA(v);
  },

  getRegX: function() {
    return c64_getRegX();
  },

  setRegX: function(v) {
    c64_setRegX(v);
  },

  getRegY: function() {
    return c64_getRegY();    
  },

  setRegY: function(v) {
    c64_setRegY(v);
  },

  getRegSP: function() {
    return 0;
  },

  setRegSP: function(v) {
  },
  
  getPC: function() {
    return c64_getPC();
  },

  setPC: function(v) {
    c64_setPC(v);
  },

  getFlagN: function() {
    return c64_getFlagN();
  },

  setFlagN: function(v) {
    c64_setFlagN(v);
  },

  getFlagV: function() {
    return c64_getFlagV();
  },
  setFlagV: function(v) {
    c64_setFlagV(v);
  },

  getFlagB: function() {
    return c64_getFlagB();
  },
  setFlagB: function(v) {
    c64_setFlagB(v);
  },

  getFlagD: function() {
    return c64_getFlagD();
  },

  setFlagD: function(v) {
    c64_setFlagD(v);
  },

  getFlagI: function() {
    return c64_getFlagI();
  },

  setFlagI: function(v) {
    c64_setFlagI(v);
  },
 
  getFlagZ: function() {
    return c64_getFlagZ();
  },

  setFlagZ: function(v) {
    c64_setFlagZ(v);
  },
  
  getFlagC: function() {
    return c64_getFlagC();
  },

  setFlagC: function(v) {
    return c64_setFlagC(v);
  },
  getVC: function() {

//    var vic = this.c64.getVIC();
//    return vic.lineCycle;
    return 0;

  },

  getRstY: function() {
    return c64_getRasterY();
  },

  getRstX: function() {
    //return c64_getRasterX();
    return 0;
  },

  getCycleCount: function(address) {    
    return c64_getCycleCount(address);
  },


  getPCBreakpoints: function() {
    return [];
  },

  getMemoryBreakpoints: function() {
    return [];
  },

  getRasterYBreakpoints: function() {
    return [];
  },
  
  

  showFile: function(path) {
    var record = g_app.doc.getDocRecord(path);
    if(!record) {
      return;
    }

    var prg = base64ToBuffer(record.data);
    this.setPRG(prg);
  },

  toggleAudio: function() {
    if(this.c64.getAudioEnabled()) {
      this.c64.stopAudio();
      UI('c64-sound').setChecked(false);
    } else {
      this.c64.startAudio();
      UI('c64-sound').setChecked(true);
    }
  },
  toggleShowRaster: function() {
    this.setShowRaster(!this.showRaster);
  },

  setShowRaster: function(show) {
    this.showRaster = show;
    UI('c64-viewraster').setChecked(show);
    $('#c64CompactShowRaster').prop('checked', show);
    if(show) {
      this.drawRasterPosition();
    }
  },
  setJoystickPort: function(port) {
    var html = '';

    this.joystickPort = port;
    if(port === 0) {
      UI('c64-joysticknone').setChecked(true);
      UI('c64-joystick1').setChecked(false);
      UI('c64-joystick2').setChecked(false);

  //    this.setJoystickEnabled(false);
      html += 'None';
    } else {
    //  this.setJoystickEnabled(true);
//      this.c64.setJoystickPort(port - 1);

      UI('c64-joysticknone').setChecked(false);
      if(port == 1) {
        html += 'Port 1';
        UI('c64-joystick1').setChecked(true);
        UI('c64-joystick2').setChecked(false);
        $('#c64CompactJoystickPort1').prop('checked', true);

      }
      if(port == 2) {
        html += 'Port 2';
        UI('c64-joystick1').setChecked(false);
        UI('c64-joystick2').setChecked(true);
        $('#c64CompactJoystickPort2').prop('checked', true);
      }
    }
    $('#c64DebuggerJoystick').html(html);
  },


  keyDown: function(event) {

    if(event.key == 'F5') {
      g_app.assemblerEditor.run();
      event.preventDefault();
    }

    if(event.key == 'F6') {
      g_app.assemblerEditor.build();
      event.preventDefault();
    }

    if(event.key == 'F9') {
      this.play();
      event.preventDefault();
    }

    if(event.key == 'F11' || event.key == 'F10') {
      if(debugger_isRunning()) {
        debugger_pause();
      } else {
  
        debugger_step();
      }
      event.preventDefault();
    }

    if(this.c64Focus) {
      if(this.joystickPort != 0) {
        var joystickIndex = this.joystickPort - 1;

        event.preventDefault();
        var key = event.key.toLowerCase();
        switch(key) {
          case 'arrowdown':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_DOWN);
            return;
          break;
          case 'arrowup':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_UP);
            return;
          break;
          case 'arrowleft':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_LEFT);
            return;
          break;
          case 'arrowright':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_RIGHT);
            return;
          break;
          case 'z':
            c64_joystickPush(joystickIndex, C64_JOYSTICK_FIRE);
            return;
          break;
        }
      }


      c64_keydown(event);

    }
  },

  keyUp: function(event) {
    if(this.c64Focus) {
      if(this.joystickPort != 0) {
        var joystickIndex = this.joystickPort - 1;

        event.preventDefault();
        var key = event.key.toLowerCase();
        switch(key) {
          case 'arrowdown':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_DOWN);
            return;
          break;
          case 'arrowup':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_UP);
            return;
          break;
          case 'arrowleft':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_LEFT);
            return;
          break;
          case 'arrowright':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_RIGHT);
            return;
          break;
          case 'z':
            c64_joystickRelease(joystickIndex, C64_JOYSTICK_FIRE);
            return;
          break;
        }
      }


      c64_keyup(event);
    }
  },
  focusMachine: function() {
    this.c64Focus = true;

    if(this.c64Size == 1) {
      $('#c64DebuggerCompactCanvas').focus();
      $('#c64DebuggerCompactCanvas').css('border', '2px solid #3343a9');
    }

    if(this.c64Size == 2) {
      $('#c64DebuggerCompactCanvasResize').focus();
      $('#c64DebuggerCompactCanvasResize').css('border', '2px solid #3343a9');
    }
  },

  blurMachine: function() {
    if(this.c64Size == 1) {
      $('#c64DebuggerCompactCanvas').css('border', '2px solid #111111');
    }

    if(this.c64Size == 2) {
      $('#c64DebuggerCompactCanvasResize').css('border', '2px solid #111111');
    }
    this.c64Focus = false;
  },


  updateDriveLight: function() {
    var status = c1541_getStatus();

    if(status !== this.lastDriveStatus) {
      switch(status) {
//        case C64.C1541.FloppyStatus.LOAD:
        case 2:
          $('#c64DebuggerDriveLight').css('background-color', '#00ff00');
        break;
//        case C64.C1541.FloppyStatus.ON:
        case 1:          
          $('#c64DebuggerDriveLight').css('background-color', '#ff0000');
        break;
//        case C64.C1541.FloppyStatus.OFF:
        case 0:
          $('#c64DebuggerDriveLight').css('background-color', '#333333');
        break;

      }
      this.lastDriveStatus = status;


    }

    var position = c1541_getPosition();
    if(position !== this.lastDrivePosition) {
      $('#c64DebuggerDrivePosition').html(position);
      this.lastDrivePosition = position;
    }
  },

  drawRasterPosition: function() {
    var rasterY = c64_getRasterY();// vic.rasterY;
    var rasterX = 0;//(vic.lineCycle - 9) * 8;

//    var context = 
    var context = this.context;
    var height = this.canvas.height;
    var width = this.canvas.width;


    context.lineWidth = 1;
    context.strokeStyle = '#ffffff';    
    context.globalAlpha = 0.6;        
    context.beginPath();    
    context.moveTo(rasterX + 0.5, 0);
    context.lineTo(rasterX + 0.5, height);
    context.stroke();

    context.beginPath();    
    context.moveTo(0, rasterY + 0.5);
    context.lineTo(width, rasterY + 0.5);
    context.stroke();

    context.globalAlpha = 1;        
  },



  redraw: function() {
    var ptr = c64_getPixelBuffer();
    var len = 384*272*4;
  
    var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
    var data = this.imageData.data;
    data.set(view);
  
    this.offscreenContext.putImageData(this.imageData, 0, 0);
    this.context.drawImage(this.offscreenCanvas, 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,
      0, 0, this.canvas.width, this.canvas.height);
  
    /*
      c64Screenx2Context.drawImage(c64Screen, 0, 0, c64Screen.width, c64Screen.height,
      0, 0, c64Screenx2.width, c64Screenx2.height);
        */
  },

  update: function() {

    if(c64_ready) {
      var time = getTimestamp();
      var dTime = time - this.lastUpdate;
      this.lastUpdate = time;
  
      if(debugger_update(dTime)) {
        this.redraw();

        if(this.showRaster) {
          // returns true if screen was drawn
          this.drawRasterPosition();
        }
  
        this.updateDriveLight();
      }  


  
    }


    /*
    if(this.c64.update()) {

      if(this.c64Size == 2) {
        this.resizeContext.drawImage(this.canvas, 
                            0, 
                            0,
                            this.canvas.width * 2,
                            this.canvas.height * 2);
      }

      if(this.showRaster) {
        // returns true if screen was drawn
        this.drawRasterPosition();
      }


    }
*/
    // draw the raster x position

    /*
    if(this.c64.isRunning() != this.runningButtons) {
      // this prob only happened if hit breakpoint
      this.updateButtons();
      if(this.showRaster) {
        this.drawRasterPosition();
      }
    }
    */
    
    if(this.debuggerContent == 'memory') {
      this.c64Memory.update();
    }

    if(this.debuggerContent == 'disassembly') {
      this.disassembly.update();
    }

    if(this.debuggerContent == 'charset') {
      this.c64Charset.update();
    }

    if(this.debuggerContent == 'sprites') {
      this.c64Sprites.update();
    }

    this.c64Registers.update();
    this.breakpoints.update();
  }

}