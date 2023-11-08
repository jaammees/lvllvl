var REGA = 0;
var REGX = 1;
var REGY = 2;
var REGSP = 3;


var sampleC64DebuggerScript = [
'// sample script (ES6)',
'',
'// set the border colour',
'c64.cpuWrite(0xd020, 0);',
'',
'// set the background colour',
'c64.cpuWrite(0xd021, 11);',
'',
'// counter',
'let counter = 1;',
'',
'// event handler for start of new frame',
'c64.on(\'frame\', () => {',
'',
'  for(let i = 0; i < 1000; i++) {',
'    // set screen char',
'    c64.cpuWrite(0x400 + i, counter);',
'',    
'    // set fg colour',
'    c64.cpuWrite(0xd800 + i, i % 16);',
'  }',
'',
'  counter = (counter + 1) % 256;',
'});',
'',
].join('\n');


function onC64Ready() {
  if(typeof g_app != 'undefined' && typeof g_app.c64Debugger != 'undefined') {
    g_app.c64Debugger.onC64Ready();
  }
}

var C64Debugger = function() {

//  this.c64 = null;
//  this.cpu = null;

  this.uiComponent = null;


  this.disassembly = null;
  this.c64Memory = null;
  this.c64Registers = null;
  this.breakpoints = null;
  this.c64Charset = null;
  this.c64Bitmap = null;
  this.c64Sprites = null;
  this.c64Drive = null;
  this.c64SID = null;
  this.scripting = null;
  this.basic = null;
  this.colors = null;


  this.onscreenJoystick = null;
  this.overlayOnscreenJoystick = null;

  this.onscreenKeyboard = null;

  this.lastDriveStatus = false;
  this.lastDrivePosition = false;

  this.c64Focus = true;

  this.prgFile = null;
  this.prgName = 'test.prg';

  this.prgLoadMethod = 'inject';

  // current prg/d64/crt
  this.prgData = null;
  this.d64Data = null;
  this.d64Name = '';
  this.crtData = null;
  this.crtName = '';

  this.prefix = 'c64pre';

  this.showRaster = false;

  this.c64Size = 1;
  this.c64Fit = false;
  this.c64FitPixel = false;
  this.joystickPort = 0;
  
  this.lastUpdate = getTimestamp();
  this.offscreenCanvas = null;
  this.imageData = null;


  this.pcBreakpoints = [];
  this.memoryBreakpoints = [];
  this.rasterYBreakpoints = [];

  this.type = 'normal';
  this.c64CanvasId = 'c64DebuggerCanvas';

  this.runningButtons = false;

  this.assemblerReport = false;

  this.mouseX = false;
  this.mouseY = false;
  this.mouseZoom = 4;
  this.mouseInfo = false;

  this.mouseC64X = 0;
  this.mouseC64Y = 0;

  this.mouseLocked = false;
  this.lockedMouseX = 0;
  this.lockedMouseY = 0;

  this.buttons = 0;

  this.grid = false;

  this.fontSize = 12;

  this.overlayVisible = true;
  this.prgToStart = null;
  this.crtToStart = null;
  this.d64ToStart = null;
  this.snapshotToStart = null;

  this.exportAsHTML = null;


  this.panelVisible = {
    "disassembly": false,
    "scripting": false,
    "basic": false,
    "colors": false,

    "memory": false,
    "charset": false,
    "sprites": false,
    "bitmap": false,
    "sid": false,
    "drive": false,
    "docs": false,
    "calc": false,

    "assembler": false
  };
  this.onlyc64Visible = false;
  this.contentIsSetup = false;

  this.pcGutterDecoration = {
    session: false,
    lineNumber: false
  };

  this.autostartD64 = false;

  this.assemblerEditor = null;
  this.gistShare = null;

  this.driveVisible = false;

}

C64Debugger.prototype = {

  init: function(args) {

    if(typeof args != 'undefined' && typeof args.type != 'undefined') {
      if(args.type == 'compact') {
        this.type = 'compact';
        this.prefix = 'c64compactpre';
        this.c64CanvasId = 'c64DebuggerCanvasCompact';
      }
    }
  },

  setFontSize: function(fontSize) {
    this.fontSize = fontSize;
    // set the debug font size
    g_app.dbgFont.setFontSize(fontSize);

    if(this.scripting) {
      this.scripting.codeEditor.setFontSize(fontSize);
    }
    if(this.basic) {
      this.basic.codeEditor.setFontSize(fontSize);
    }

    if(this.assemblerEditor) {
      this.assemblerEditor.codeEditor.setFontSize(fontSize);
    }

    // need to trigger a redraw of everything
    this.resize();      

  },

  getRandomDelayEnabled: function() {
    var randomdelay = g_app.getPref('c64-randomdelay');

    return randomdelay != 'no';

  },

  toggleRandomDelay: function() {
    var enabled = !this.getRandomDelayEnabled();

    g_app.setPref('c64-randomdelay', enabled ? 'yes' : 'no');
    UI('c64debugger-randomdelay').setChecked(enabled);
    
  },



  setDebuggerScript: function() {
    var path = '/scripts/c64.js';
  },

  loadPrefs: function() {
     
    var model = g_app.getPref('c64-model');
    if(typeof model != 'undefined' && model !== null) {
      c64_model = model;
    }

    this.setPRGLoadMethod(g_app.getPref('c64-prgstart'));
  },

  setModel: function(model) {
    c64_model = model;
    if(model == 'pal') {
      UI('c64debugger-model-ntsc').setChecked(false);
      UI('c64debugger-model-pal').setChecked(true);
      c64_setModel(1);
      g_app.setPref('c64-model', model);
    }

    if(model == 'ntsc') {
      UI('c64debugger-model-pal').setChecked(false);
      UI('c64debugger-model-ntsc').setChecked(true);
      c64_setModel(2);
      g_app.setPref('c64-model', model);
    }

    var size = g_app.getPref('c64-' + this.prefix + '-size');
    if(typeof size != 'undefined' && size !== null) {
      this.setSize(size);

    }

    if(this.canvas && this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },

  getPRGLoadMethod: function() {
    return this.prgLoadMethod;
  },

  setPRGLoadMethod: function(method) {
    if(typeof method == 'undefined' || method == null) {
      return;
    }

    this.prgLoadMethod = method;
    if(method == 'loadrun') {
      UI('c64debugger-prgloadrun').setChecked(true);
      UI('c64debugger-prginject').setChecked(false);

      UI('c64-prgloadrun').setChecked(true);
      UI('c64-prginject').setChecked(false);

      g_app.setPref('c64-prgstart', 'loadrun');
    }

    if(method == 'inject') {
      UI('c64debugger-prgloadrun').setChecked(false);
      UI('c64debugger-prginject').setChecked(true);

      UI('c64-prgloadrun').setChecked(false);
      UI('c64-prginject').setChecked(true);

      g_app.setPref('c64-prgstart', 'inject');
    }
  },

  setSpeed: function(speed) {
    
    UI('c64debugger-speed-25').setChecked(false);
    UI('c64debugger-speed-50').setChecked(false);
    UI('c64debugger-speed-100').setChecked(false);
    UI('c64debugger-speed-150').setChecked(false);
    UI('c64debugger-speed-200').setChecked(false);
    UI('c64debugger-speed-300').setChecked(false);

    UI('c64debugger-speed-' + speed).setChecked(true);

    console.log('set speed = ' + speed);
    debugger_set_speed(speed);

  },

  setSize: function(size) {

    UI('c64-size-1').setChecked(false);
    UI('c64-size-2').setChecked(false);
    UI('c64-size-3').setChecked(false);
    UI('c64-size-4').setChecked(false);
    UI('c64-size-fit').setChecked(false);
    UI('c64-size-fitpixel').setChecked(false);

    UI('c64debugger-size-1').setChecked(false);
    UI('c64debugger-size-2').setChecked(false);
    UI('c64debugger-size-3').setChecked(false);
    UI('c64debugger-size-4').setChecked(false);
    UI('c64debugger-size-fit').setChecked(false);
    UI('c64debugger-size-fitpixel').setChecked(false);

    if(size == 'fit') {
      UI('c64-size-fit').setChecked(true);
      UI('c64debugger-size-fit').setChecked(true);
      this.c64Fit = true;
      this.c64FitPixel = false;
      this.resizeC64Panel();
    } else if(size == 'fitpixel') {
      UI('c64-size-fitpixel').setChecked(true);
      UI('c64debugger-size-fitpixel').setChecked(true);
      this.c64FitPixel = true;
      this.c64Fit = false;
      this.resizeC64Panel();
    } else {
      size = parseInt(size, 10);
      if(isNaN(size)) {
        size = 2;
      }
      this.c64Fit = false;
      this.c64FitPixel = false;
      this.c64Size = size;
      UI('c64-size-' + this.c64Size).setChecked(true);
      UI('c64debugger-size-' + this.c64Size).setChecked(true);
    }

    if(this.offscreenCanvas == null) {
      return;
    }
    g_app.setPref('c64-' + this.prefix + '-size', size);



    // pixel aspect ratio
    //https://codebase64.org/doku.php?id=base:pixel_aspect_ratio
    var par = 1;
    var trueAspectRatio = false;

    if(trueAspectRatio) {
      if(c64_model == 'pal') {
        // pal 
        par = 0.9365;
      }

      if(c64_model == 'ntsc') {
        // ntsc
        par = 0.75;
      }
    }

    this.canvas.width = Math.floor(this.offscreenCanvas.width * this.c64Size * par);
    this.canvas.height = this.offscreenCanvas.height * this.c64Size;


    if(par == 1 || (par == 0.75 && this.c64Size == 4)) {
      this.context = UI.getContextNoSmoothing(this.canvas);
    } else {
      this.context = this.canvas.getContext('2d');
    }
  
    if(this.c64Focus) {
      this.focusMachine();
    } else {
      this.blurMachine();
    }

    if(c64_ready) {
      this.redraw();

      if(this.showRaster) {
        // returns true if screen was drawn
        this.drawRasterPosition();
      }
    }

    this.setOverlaySize();

  },



  readByte: function(address) {
    var value = c64_cpuReadNS(address);

    return value & 0xff;
  },

  writeByte: function(address, value) {
    c64_cpuWrite(address, value);
  },

  vicReadRegister: function(reg) {
    return c64_vicReadRegister(reg) & 0xff;
  },

  vicRead: function(address) {
//    return c64_vicRead(address) & 0xff;
    return c64_vicReadNS(address) & 0xff;

  },

  show: function() {
    
    if(this.offscreenCanvas == null) {
      
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 384;
      this.offscreenCanvas.height = 272;
      this.offscreenContext = this.offscreenCanvas.getContext('2d');
      this.imageData = this.offscreenContext.getImageData(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);

      this.canvas = document.getElementById(this.c64CanvasId);
      this.canvas.width = 384;
      this.canvas.height = 272; 
      
      
      this.context = this.canvas.getContext('2d');

      var c64Size = g_app.getPref('c64-' + this.prefix + '-size');

      if(typeof c64Size == 'undefined' || c64Size == null) {
        if(g_app.isMobile() || this.type == 'compact') {
          c64Size = 1;
        } else {
          c64Size = 'fitpixel';
//          this.setSize('fitpixel');
//          this.setSize('fit');
        }
      }

      this.setSize(c64Size);

      if(g_app.isMobile()) {

        $('#c64DebuggerCanvas').on('contextmenu', function(e) {
          e.preventDefault();
        });
    
    
        this.canvas.addEventListener("touchstart", function(event){
          event.preventDefault();
          //_this.touchStart(event);
    
        }, false);
    
        this.canvas.addEventListener("touchmove", function(event){
          event.preventDefault();
          //_this.touchMove(event);
          return false;
        }, false);
    
        this.canvas.addEventListener("touchend", function(event) {
          event.preventDefault();
          //_this.touchEnd(event);
        }, false);        
      }

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

      this.c64Registers = new DbgRegisters();
      this.c64Registers.init({ 
        "canWrite": true,
        "showRasterPosition": true,
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

      // prob want these even if not compact
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

      // prob want these even if not compact
      this.c64Bitmap = new DbgC64Bitmap();
      this.c64Bitmap.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64Bitmap.buildInterface(this.bitmapPanel);

      // prob want these even if not compact
      this.c64SID = new DbgSID();
      this.c64SID.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64SID.buildInterface(this.sidPanel);
      

      this.c64Drive = new DbgC64Drive();
      this.c64Drive.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.c64Drive.buildInterface(this.drivePanel);

      this.scripting = new DbgScripting();
      this.scripting.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.scripting.buildInterface(this.scriptingPanel);
      this.scripting.codeEditor.setFontSize(this.fontSize);


      this.basic = new DbgC64Basic();
      this.basic.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.basic.buildInterface(this.basicPanel);
      this.basic.codeEditor.setFontSize(this.fontSize);

      this.colors = new DbgC64Colors();
      this.colors.init({
        "debugger": this,
        "machine": this.c64,
        "prefix": this.prefix
      });
      this.colors.buildInterface(this.colorsPanel);
  

      if(this.type != 'compact') {

        this.calculator = new Calculator();
        this.calculator.init(this, 'c64Debugger');
        this.calculator.buildInterface(this.calcPanel);
    
        // needed for docs
        this.c64MemoryMap = new C64MemoryMap();
        this.c64MemoryMap.init(this);
    
        this.mos6502Opcodes = new MOS6502Opcodes();
        this.mos6502Opcodes.init(this, 'c64Debugger');
        this.mos6502Opcodes.buildInterface(this.docsPanel);

        
        if(g_app.isMobile()) {
          this.c64Memory.setVisible(false);
          this.disassembly.setVisible(false);
          this.c64Registers.setVisible(false);
          this.breakpoints.setVisible(false);
          $('#c64JoystickPort').hide();
        } //else {
          
        this.assemblerEditor = new AssemblerEditor();
        this.assemblerEditor.init();
        this.assemblerEditor.buildC64DebuggerInterface(this.assemblerPanel);


        if(g_app.doc.getDocRecord('/asm/main.asm') == null && g_app.doc.getDocRecord('/asm')  != null) {
          g_app.doc.createDocRecord('/asm', 'main.asm', 'asm', c64Asm_example);
          g_app.doc.createDocRecord('/asm/inc', 'macros.asm', 'asm', c64Asm_macro);
          g_app.doc.createDocRecord('/config', 'assembler.json', 'json', '{\n  "assembler": "acme",\n  "arguments": "--format cbm",\n  "files": "main.asm",\n  "output": "out.prg",\n  "target": "c64"\n }');
        }
  
        var file = '/asm/main.asm';
        //g_app.projectNavigator.showDocRecord(file);
        this.assemblerEditor.showFile(file, 0);// source.lineNumber);
        this.assemblerEditor.codeEditor.setFontSize(this.fontSize);
  
      //  }
  

        // this is all mobile stuff for non compact
        this.onscreenJoystick = new C64OnscreenJoystick();
        this.onscreenJoystick.init({ debugger: this });
        this.onscreenJoystick.buildInterface(this.mobilePanel);


        this.onscreenKeyboard = new C64OnscreenKeyboard();
        this.onscreenKeyboard.init({ debugger: this });
        this.onscreenKeyboard.buildInterface(this.mobilePanel);

        var _this = this;
        this.mobilePanel.on('resize', function() {
          _this.onscreenJoystick.draw();
          _this.onscreenKeyboard.draw();
          _this.overlayOnscreenJoystick.draw();

        });

        var html = '<span style="color: white">filepanel!!!!</span>';
        this.mobileFilePanel = UI.create("UI.HTMLPanel", { id: "c64OnscreenFile", "html": html });
        this.mobilePanel.add(this.mobileFilePanel);


        html = '<div style="padding: 10px; position: absolute; top: 0; bottom: 0; left: 0; right: 0; overflow: auto">';

        html += '<h3>Sound</h3>';
        html += '<div class="radioGroup">';
        html += '<label class="rb-container" style="margin-right: 8px">No Sound<input type="radio" name="c64MobileAudio" id="c64MobileAudioNone" value="0" ><span class="checkmark"></span> </label>';
        html += '<label class="rb-container" style="margin-right: 8px">6581<input type="radio" checked="checked" name="c64MobileAudio" id="c64MobileAudio6581" value="6581" ><span class="checkmark"></span> </label>';
        html += '<label class="rb-container" style="margin-right: 8px">8580<input type="radio" name="c64MobileAudio" id="c64MobileAudio8580" value="8580" ><span class="checkmark"></span> </label>';
        html += '</div>';

        html += '<h3>Joystick</h3>';
        html += '<div>';
        html += '  <div class="radioGroup">';
        html += '    <label class="rb-container" style="margin-right: 8px">Port 1<input type="radio" name="c64MobileJoystickPort" id="c64MobileJoystickPort_1" value="1" ><span class="checkmark"></span> </label>';
        html += '    <label class="rb-container" style="margin-right: 8px">Port 2<input type="radio"  checked="checked" name="c64MobileJoystickPort" id="c64MobileJoystickPort_2" value="2" ><span class="checkmark"></span> </label>';
        html += '  </div>';
        html += '</div>';

        html += '<div>';
        html += '  <div class="radioGroup">';
        html += '    <label class="rb-container" style="margin-right: 8px">One Button<input type="radio" checked="checked" name="c64MobileJoystickType" id="c64MobileJoystickType_1" value="1" ><span class="checkmark"></span> </label>';
        html += '    <label class="rb-container" style="margin-right: 8px">Two Button<input type="radio" name="c64MobileJoystickType" id="c64MobileJoystickType_2" value="2" ><span class="checkmark"></span> </label>';
        html += '  </div>';
        html += '</div>';


        html += '<div>';
        html += '  <div>Button 2:</div>';
        html += '  <div class="radioGroup">';
        html += '    <label class="rb-container" style="margin-right: 8px">Up<input type="radio" checked="checked" name="c64MobileJoystickButton2" id="c64MobileJoystickButton2_up" value="up" ><span class="checkmark"></span> </label>';
        html += '    <label class="rb-container" style="margin-right: 8px">Space Bar<input type="radio" name="c64MobileJoystickButton2" id="c64MobileJoystickButton2_space" value="space" ><span class="checkmark"></span> </label>';
        html += '  </div>';
        html += '</div>';


        html += '</div>';

        this.mobileSettingsPanel = UI.create("UI.HTMLPanel", { id: "c64OnscreenSettings", "html": html });
        this.mobilePanel.add(this.mobileSettingsPanel);

        html = '<div>';

        html += '<div style="margin-top: 40px">';
        html += '  <div class="ui-button" id="c64MobileLoadPRG" style="margin-right: 20px">Load PRG...</div>';
        html += '  <div class="ui-button" id="c64MobileAttachD64" style="margin-right: 20px">Attach D64...</div>';
        html += '  <div class="ui-button" id="c64MobileInsertCRT" style="margin-right: 20px">Insert CRT...</div>';
        html += '</div>';

        html += '<div style="margin-top: 20px">';
        html += '  <div class="ui-button" id="c64MobileReset">Reset Machine</div>'
        html += '</div>';

        html += '</div>';

        this.mobileContentPanel = UI.create("UI.HTMLPanel", { id: "c64OnscreenContent", "html": html });
        this.mobilePanel.add(this.mobileContentPanel);
        
        this.mobilePanel.showOnly('c64OnscreenJoystick');
      
        var _this = this;

        UI.on('ready', function() {
          _this.orientation = window.innerWidth > window.innerHeight ? 90 : 0;
          _this.resize();

          /*
          $('#c64MobileAudioEnabled').on('click', function() {
            if($('#c64MobileAudioEnabled').is(':checked')) {
              _this.startAudio();
            } else {
              _this.stopAudio();
            }
          });
*/
          $('input[name=c64MobileAudio]').on('click', function(e) {

            var value = $('input[name=c64MobileAudio]:checked').val();

            if(value == '0') {
              if(c64.sound.getAudioEnabled()) {
                c64.sound.stopAudio();
              }              
            }

            if(value == '6581') {
              c64.sound.startAudio();
              c64.sound.setModel('6581');
            }

            if(value == '8580') {
              c64.sound.startAudio();
              c64.sound.setModel('8580');
            }

          });

          $('input[name=c64MobileJoystickPort]').on('click', function(e) {
            var value = parseInt($('input[name=c64MobileJoystickPort]:checked').val(), 10);

            if(!isNaN(value)) {
              _this.onscreenJoystick.setPort(value);
              _this.overlayOnscreenJoystick.setPort(value);
            }
          });

          $('input[name=c64MobileJoystickType]').on('click', function(e) {
            var value = parseInt($('input[name=c64MobileJoystickType]:checked').val(), 10);

            if(!isNaN(value)) {
              _this.onscreenJoystick.setType(value);
              _this.overlayOnscreenJoystick.setType(value);
            }
          });

          $('input[name=c64MobileJoystickButton2]').on('click', function(e) {
            var value = $('input[name=c64MobileJoystickButton2]:checked').val();
            _this.onscreenJoystick.setSecondButton(value);
            _this.overlayOnscreenJoystick.setSecondButton(value);

          });


          $('#c64MobileLoadPRG').on('click', function() {
            _this.choosePRG();
          });

          $('#c64MobileAttachD64').on('click', function() {
            _this.chooseD64();
          });

          $('#c64MobileInsertCRT').on('click', function() {
            _this.chooseCRT();
          });

  
          $('#c64MobileReset').on('click', function() {
            _this.machineReset();
          });

          if(g_app.isMobile()) {
            _this.onscreenJoystick.draw();
          }
        });
      }
    }
/*
    var _this = this; 
    UI.on('ready', function() {
      if(_this.scripting) {
        _this.scripting.show();
      }
    });
*/
    this.loadPrefs();
    this.scripting.show();
  },

  resize: function() {

    if(this.uiComponent) {
      // only resize if interface has been built
      if(this.disassembly) {
        UI(this.prefix + 'DisassemblyCanvas').resize();
      }

      if(this.c64Memory) {
        UI(this.prefix + 'MemoryCanvas').resize();
        this.c64Memory.forceRedraw();
      }

      if(this.c64Registers) {
        UI(this.prefix + 'RegistersCanvas').resize();
      }

      if(this.breakpoints) {
        UI(this.prefix + 'BreakpointsCanvas').resize();
      }
    }

    if(this.type != 'compact' && g_app.isMobile()) {
      this.orientation = window.innerWidth > window.innerHeight ? 90 : 0;
      this.layoutMobile();
    }
  },

  undo: function() {
    if(this.c64Sprites && this.panelVisible['sprites']) {
      this.c64Sprites.undo();
    }
    if(this.c64Charset && this.panelVisible['charset']) {
      this.c64Charset.undo();
    }

  },

  redo: function() {
    if(this.c64Sprites && this.panelVisible['sprites']) {
      this.c64Sprites.redo();
    }
    if(this.c64Charset && this.panelVisible['charset']) {
      this.c64Charset.redo();
    }

  },

  resizeC64Panel: function() {
    var isMobile = g_app.isMobile();
    var mobileFitFullscreen = isMobile;// && this.orientation != 0;

    var deviceScale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.

    if(this.canvas == null) {
      return;
    }

    if(this.c64Fit || this.c64FitPixel || mobileFitFullscreen) {
      var element = $('#' + this.c64CanvasId + 'Holder');

      var position = element.offset();
      if (position) {
  
        var width = element.width();
        var height = element.height();

        if(!mobileFitFullscreen) {
          height -= 30;
        }

        var c64Width = 384;
        var c64Height = 272;

        var scale = 1;
        var hScale = width / c64Width;
        var vScale = height / c64Height;

        /*
        if(isMobile) {
          hScale = Math.floor(mobileScale * width) / c64Width;
          vScale = Math.floor(mobileScale * height) / c64Width;
        }
        */

        if(hScale > vScale) {
          scale = vScale;
        } else {
          scale = hScale;
        }
        if(scale > 1 && this.c64FitPixel && !mobileFitFullscreen) {
          scale = Math.floor(scale);
        }

        this.c64Size = scale;
        var cssWidth = Math.round(c64Width * scale);
        var cssHeight = Math.round(c64Height * scale);

        if(isMobile) {
          this.canvas.width = Math.round(c64Width * scale * deviceScale);
          this.canvas.height = Math.round(c64Height * scale * deviceScale);
          this.canvas.style.width = cssWidth +  'px';
          this.canvas.style.height = cssHeight +  'px';

        } else {
          this.canvas.width = Math.round(c64Width * scale);
          this.canvas.height = Math.round(c64Height * scale);
        }
        this.context = this.canvas.getContext('2d');


        //if(scale == Math.floor(scale)) {
        if(scale >= 1 && (this.c64FitPixel || mobileFitFullscreen)) {
          this.context.imageSmoothingEnabled = false;
          this.context.webkitImageSmoothingEnabled = false;
          this.context.mozImageSmoothingEnabled = false;
          this.context.msImageSmoothingEnabled = false;
          this.context.oImageSmoothingEnabled = false;
        } else {
          this.context.imageSmoothingEnabled = true;
          this.context.webkitImageSmoothingEnabled = true;
          this.context.mozImageSmoothingEnabled = true;
          this.context.msImageSmoothingEnabled = true;
          this.context.oImageSmoothingEnabled = true;
        }

        if(g_app.isMobile() && this.orientation != 0) {
          // center the canvas
          var topSpacing = Math.floor( (element.height() - cssHeight) / 2);
          this.canvas.style.marginTop = topSpacing + 'px';

          
          // how much space is in the edges for the joystick?
          var sideSpace = Math.floor( (element.width() - cssWidth) / 2 );
          var maxRadius = Math.floor(( (sideSpace - 40) / 2));
          if(maxRadius < 65) {
            maxRadius = 65;
          }
          this.overlayOnscreenJoystick.maxRadius = maxRadius;
        } else {
          this.canvas.style.marginTop = '0px';
        }
         
        if(c64_ready) {

          this.redraw();
        }

      }

    }

    this.setOverlaySize();
    this.setInfoPosition();


  },

  setInfoPosition: function() {
    if(this.type == 'compact' || g_app.isMobile()) {
      return;
    }

    var canvas = $('#' + this.c64CanvasId);
    if(canvas.length == 0)  {
      return;
    }

    var canvasWidth = canvas.width();
    var canvasHeight = canvas.height();
    var canvasPosition = canvas.position();
    var canvasMarginTop = parseInt(canvas.css('marginTop').replace('px', ''), 10);

    var info = $('#' + this.c64CanvasId + 'C64Info');

    var infoLeft = canvasPosition.left;
    var infoTop = canvasPosition.top + canvasMarginTop + canvasHeight + 2;
    var infoWidth = canvasWidth;

    info.css('left', infoLeft + 'px');
    info.css('top', infoTop + 'px');
    info.css('height', '30px');
    info.css('width', infoWidth + 'px');


  },
  setOverlaySize: function() {
    if(this.overlayVisible) {
      // overlay is only for non compact debugger
      if(this.type != 'compact') {
        var canvas = $('#' + this.c64CanvasId);
        if(canvas.length > 0)  {
          var canvasWidth = canvas.width();
          var canvasHeight = canvas.height();

          var position = canvas.position();
          var overlay = $('#' + this.c64CanvasId + 'Overlay');
          overlay.css('top', position.top + 'px');
          overlay.css('left', position.left + 'px');
          overlay.css('width', canvasWidth + 'px');
          overlay.css('height', canvasHeight + 'px');
          if(this.canvas) {
            overlay.css('marginTop', this.canvas.style.marginTop);
          }

          var overlayElements = $('#' + this.c64CanvasId + 'OverlayElements');
          overlayElements.css('top', position.top + 'px');
          overlayElements.css('left', position.left + 'px');
          overlayElements.css('width', canvas.width() + 'px');
          overlayElements.css('height', canvas.height() + 'px');

          var playButton = $('#' + this.c64CanvasId + 'OverlayPlayButton');
          var buttonWidth = playButton.width();
          var buttonHeight = playButton.height();
          var buttonTop = this.c64Size * 18 * 6;// Math.round( (canvasHeight - buttonHeight) / 3);
          var buttonLeft = Math.round((canvasWidth - buttonWidth) / 2);
          playButton.css('top', buttonTop + 'px');
          playButton.css('left', buttonLeft + 'px');

          var title = $('#' + this.c64CanvasId + 'OverlayTitle');
          var titleWidth = title.width();
          var titleHeight = title.height();
          var titleTop = buttonTop - titleHeight;

          if(this.c64Size >= 2) {
            titleTop -= 36;
          } else {
            titleTop -= 20;
          }
          var titleLeft = Math.round((canvasWidth - titleWidth) / 2);
          title.css('top', titleTop + 'px');
          title.css('left', titleLeft + 'px');

          var info = $('#' + this.c64CanvasId + 'OverlayInfo');
          var infoWidth = info.width();
          var infoTop = buttonTop + buttonHeight;
          if(this.c64Size >= 2) {
            infoTop += 32;
          } else {
            infoTop += 20;
          }
          var infoLeft = Math.round((canvasWidth - infoWidth) / 2);
          info.css('top', infoTop + 'px');
          info.css('left', infoLeft + 'px');

        }
      }
    }

  },

  hideOnscreenJoystick: function() {
    this.overlayOnscreenJoystick.setHidden(true);
  },

  buildInterface: function(parentPanel) {
    
    var isMobile = g_app.isMobile();
    var _this = this;

    // mobile overlay onscreen joystick for landscape mode
    this.overlayOnscreenJoystick = new C64OnscreenJoystick();
    this.overlayOnscreenJoystick.init({ debugger: this, id: "on-screen-joystick-overlay", showPortSelection: false });


    if(this.type != 'compact') {
      this.uiComponent = UI.create("UI.Panel", { "id": "c64debuggerPanel" } );
      parentPanel.add(this.uiComponent);

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "c64DebuggerSplitPanel"});
      this.uiComponent.add(this.splitPanel);

      var html = '';
      html += '<div>';

      html += '  <form id="c64DebuggerForm">';
      html += '    <input class="formControl"  id="c64ChoosePRG" type="file" accept=".prg" style="position: absolute; top: -50px; left: -100px" />';
      html += '    <input class="formControl"  id="c64ChooseD64" type="file" accept=".d64" style="position: absolute; top: -50px; left: -150px" />';
      html += '    <input class="formControl"  id="c64ChooseCRT" type="file" accept=".crt" style="position: absolute; top: -50px; left: -150px" />';
      html += '  </form>';


      // nav can hold the back link
      html += '  <div id="c64DebuggerNav">';
      if(isMobile) {
        html += '    <div class="ui-button" style="display: none" id="c64BackToSource">&lt; back to source</div>';
      }
      html += '  </div>';


      html += '  <div style="text-align: center; position: absolute; left: 0; right: 0; top: 0; bottom: 0px" id="' + this.c64CanvasId + 'Holder">';
      html += '    <canvas id="' + this.c64CanvasId + '"></canvas>';


      html += this.overlayOnscreenJoystick.getHTML({ opacity: 0.6 });

      html += '    <div style="display: none" class="c64-overlay" id="' + this.c64CanvasId + 'Overlay">';
      html += '    </div>';

      html += '    <div style="display: none; position: absolute; left: 0; top: 0;" id="' + this.c64CanvasId + 'OverlayElements">';

      html += '      <div style="font-size: 40px; font-weight: 300; position: absolute; color: white; top: 0; left: 0" id="' + this.c64CanvasId + 'OverlayTitle"></div>';


      html += '      <div id="' + this.c64CanvasId + 'OverlayPlayButton" class="c64-play-button" style="position: absolute; cursor: pointer; margin: auto;  display: block; width: 80px; height: 80px;">';
      html += '        <i style="font-size: 80px; cursor: pointer" class="halflings halflings-play"></i>';
      html += '      </div>';

      html += '      <div id="' + this.c64CanvasId + 'OverlayInfo" class="c64-overlay-info" style="cursor: pointer; margin: auto;  display: block; position: absolute; top: 0; left: 0">';
      html += '      </div>';
      html += '    </div>';


      var infoDisplay = 'flex';
      if(isMobile) {
        infoDisplay = 'none';
      }
      html += '    <div style="display: ' + infoDisplay + '; justify-content: space-between; align-items: center; padding: 5px 2px; position: absolute; left: 0; right: 0; bottom: 0; height; 30px;  text-align: left" id="' + this.c64CanvasId + 'C64Info">';

      html += '      <div id="' + this.prefix + 'DriveInfo" style="display: flex;">';
      html += '        <div id="' + this.prefix + 'DriveLight" style="width: 30px; height: 16px; background-color: rgb(255, 0, 0);"></div>';
      html += '        <div id="' + this.prefix + 'DrivePosition" style="margin-left: 6px; width: 20px"></div>';
      html += '        <span class="drive-info-label">DRIVE</span>';
      html += '        <div style="display: inline-block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 160px; color: #aaaaaa" id="' + this.prefix + 'AttachedDisk"></div>';    
      html += '      </div>';
      
      html += '      <div id="' + this.prefix + 'JoystickHolder" style="display: flex; align-items: center">';
      html += '      </div>';

      /*
      html += '      PRG:';
      html += '      <div style="display: inline; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 200px; " id="c64DebuggerCurrentPRG' + this.type + '">None</div>';    
*/
      if(false && !isMobile) {
        html += '  <div id="c64DebuggerShare" class="ui-button">';
        html += '    <img src="icons/material/share-24px.svg">&nbsp;';
        html += '    Share PRG...';
        html += '  </div>';
      }    

      html += '    </div>';

      html += '  </div>';

//      html += '</div>';

      html += '</div>';
      

      var htmlComponent = UI.create("UI.HTMLPanel", { "id": "c64DebuggerHTML", "html": html  });

      htmlComponent.on('resize', function() {
        _this.resizeC64Panel();
      });


      var c64SplitPanel = UI.create("UI.SplitPanel", { "id": "c64ScreenSplitPanel"});
      c64SplitPanel.add(htmlComponent);

      var assemblerPanelVisible = false;

      this.assemblerHolder = UI.create("UI.SplitPanel", {});

      var closeAssemblerHTML = '<div class="title" style="background-color: #111111; height: 20px">';
      closeAssemblerHTML += '&nbsp;Assembler';
      closeAssemblerHTML += '<div style="position: absolute; top: 2px; right: 2px; width: 20px">';
      
      closeAssemblerHTML += '<div id="c64CloseAssemblerPanel" class="ui-button ui-panel-close-button ui-button-danger"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
      closeAssemblerHTML += '</div>';
      closeAssemblerHTML += '</div>';

      this.assemblerClosePanel = UI.create("UI.HTMLPanel", { "html": closeAssemblerHTML });

      this.assemblerHolder.addNorth(this.assemblerClosePanel, 20, false);

      this.assemblerPanel = UI.create("UI.Panel", { "id": "debuggerAssemblerPanel" });
      this.assemblerHolder.add(this.assemblerPanel);

      c64SplitPanel.addSouth(this.assemblerHolder, 360, true, !assemblerPanelVisible);
      c64SplitPanel.southBarSize = 5;
      c64SplitPanel.southBarSizeSave = 5;
      

      this.splitPanel.add(c64SplitPanel);



      var _this = this;
      UI.on('ready', function() {
        /*
        _this.showEastContent('memory');
        _this.showWestContent('disassembly');
        */

        // hide all the panels
        _this.showPanel('c64-view-toggle-disassembly', false);
        _this.showPanel('c64-view-toggle-scripting', false);
        _this.showPanel('c64-view-toggle-colors', false);
        _this.showPanel('c64-view-toggle-basic', false);

        _this.showPanel('c64-view-toggle-memory', false);
        _this.showPanel('c64-view-toggle-charset', false);
        
        _this.showPanel('c64-view-toggle-sprites', false);
        _this.showPanel('c64-view-toggle-bitmap', false);
        _this.showPanel('c64-view-toggle-sid', false);
        _this.showPanel('c64-view-toggle-drive', false);
        _this.showPanel('c64-view-toggle-calc', false);
        _this.showPanel('c64-view-toggle-docs', false);

        _this.setPanelVisibility();

        if(!g_app.isMobile() && $('#on-screen-joystick-overlay').length > 0) {
          $('#on-screen-joystick-overlay').hide();
        }
        
        _this.initEvents();
        _this.initContent();

      });

      var showDebuggerPanels = false;
      if(isMobile) {
        showDebuggerPanels = true;
      }

      this.eastSplitPanel = UI.create("UI.SplitPanel");

//      splitPanel.addEast(this.memoryPanel, 420, true, showDebuggerPanels);
      this.splitPanel.addEast(this.eastSplitPanel, 440, true, showDebuggerPanels);

      this.eastTabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
      this.eastTabPanel.addTab({ key: 'memory',   title: 'Memory', isTemp: false }, true);
      this.eastTabPanel.addTab({ key: 'charset',   title: 'Charset', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'sprites',   title: 'Sprites', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'bitmap',   title: 'Bitmap', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'sid',   title: 'SID', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'drive',   title: 'Drive', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'docs',   title: 'Docs', isTemp: false }, false);
      this.eastTabPanel.addTab({ key: 'calc',   title: 'Calculator', isTemp: false }, false);

      this.eastTabPanel.on('tabfocus', function(key, tabPanel) {      
        var tabIndex = _this.eastTabPanel.getTabIndex(key);
        if(tabIndex >= 0) {
          _this.showEastContent(key);
          //_this.showDebuggerContent(key);
        }
      });

      this.eastTopPanel = UI.create("UI.SplitPanel");
      var closeEastHTML = '<div class="title" style="background-color: #111111; height: 18px">';
      closeEastHTML += '<div style="position: absolute; top: 2px; right: 2px; width: 20px">';
      closeEastHTML += '<div id="c64CloseEastPanel" class="ui-button ui-panel-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
      closeEastHTML += '</div>';
      closeEastHTML += '</div>';

      this.eastClosePanel = UI.create("UI.HTMLPanel", { html: closeEastHTML });

      this.eastTopPanel.addNorth(this.eastClosePanel, 24, false);
      this.eastTopPanel.add(this.eastTabPanel);

      this.eastSplitPanel.addNorth(this.eastTopPanel, 54, false);

      this.eastMainPanel = UI.create("UI.Panel");
      this.eastSplitPanel.add(this.eastMainPanel);

      this.memoryPanel = UI.create("UI.Panel", { "id": "c64DebuggerMemory" });
      this.eastMainPanel.add(this.memoryPanel);


      this.charsetPanel = UI.create("UI.Panel", { "id": "c64DebuggerCharset"});
      this.eastMainPanel.add(this.charsetPanel);
  
      this.spritesPanel = UI.create("UI.Panel", { "id": "c64DebuggerSprites"});
      this.eastMainPanel.add(this.spritesPanel);

      this.bitmapPanel = UI.create("UI.Panel", { "id": "c64DebuggerBitmap"});
      this.eastMainPanel.add(this.bitmapPanel);

      this.sidPanel = UI.create("UI.Panel", { "id": "c64DebuggerSID"});
      this.eastMainPanel.add(this.sidPanel);

      this.drivePanel = UI.create("UI.Panel", { "id": "c64DebuggerDrive"});
      this.eastMainPanel.add(this.drivePanel);

      this.docsPanel = UI.create("UI.Panel", { "id": "c64DebuggerDocs"});
      this.eastMainPanel.add(this.docsPanel);

      this.calcPanel = UI.create("UI.Panel", { "id": "c64DebuggerCalculator"});
      this.eastMainPanel.add(this.calcPanel);


      this.cpuPanel = UI.create("UI.SplitPanel");
      this.splitPanel.addWest(this.cpuPanel, 380, true, showDebuggerPanels);


      this.registersPanel = UI.create("UI.Panel");

      this.westTopPanel = UI.create("UI.SplitPanel");

      var closeWestHTML = '<div class="title" style="background-color: #111111; height: 18px">';
      closeWestHTML += '<div style="position: absolute; top: 2px; right: 2px; width: 20px">';
      closeWestHTML += '<div id="c64CloseWestPanel" class="ui-button ui-panel-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
      closeWestHTML += '</div>';
      closeWestHTML += '</div>';

      this.westClosePanel = UI.create("UI.HTMLPanel", { html: closeWestHTML });

      this.westTopPanel.addNorth(this.westClosePanel, 24, false);
      this.westTopPanel.add(this.registersPanel);

      this.cpuPanel.addNorth(this.westTopPanel, 80, false, showDebuggerPanels);

      this.breakpointsPanel = UI.create("UI.Panel");
      this.cpuPanel.addSouth(this.breakpointsPanel, 200);

      this.westSplitPanel = UI.create("UI.SplitPanel");
      
      this.cpuPanel.add(this.westSplitPanel);

      this.westTabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
      this.westTabPanel.addTab({ key: 'disassembly',   title: 'Disassembly', isTemp: false }, true);
      this.westTabPanel.addTab({ key: 'scripting',   title: 'Scripting', isTemp: false }, false);
      this.westTabPanel.addTab({ key: 'basic',   title: 'BASIC', isTemp: false }, false);
      this.westTabPanel.addTab({ key: 'colors',   title: 'Colours', isTemp: false }, false);
  
      this.westTabPanel.on('tabfocus', function(key, tabPanel) {      
        var tabIndex = _this.westTabPanel.getTabIndex(key);
        if(tabIndex >= 0) {
          _this.showWestContent(key);
          //_this.showDebuggerContent(key);
        }
      });


      this.westSplitPanel.addNorth(this.westTabPanel, 30, false);
      this.westMainPanel = UI.create("UI.Panel");
      this.westSplitPanel.add(this.westMainPanel);

      this.disassemblyPanel = UI.create("UI.Panel", { "id": "c64DebuggerDisassembly" });
      this.westMainPanel.add(this.disassemblyPanel);


      this.scriptingPanel = UI.create("UI.Panel", { "id": "c64DebuggerScripting" });
      this.westMainPanel.add(this.scriptingPanel);
      
      this.colorsPanel = UI.create("UI.Panel", { "id": "c64DebuggerColors" });
      this.westMainPanel.add(this.colorsPanel);

      this.basicPanel = UI.create("UI.Panel", { "id": "c64DebuggerBasic" });
      this.westMainPanel.add(this.basicPanel);



      var buttonsHTML = '';
      buttonsHTML += '  <div style="margin: 4px 0; position: relative">';
      buttonsHTML += '    <div class="ui-button" id="c64Play" style="width: 68px"><i class="halflings halflings-pause"></i>&nbsp;Pause (F9)</div>';
      buttonsHTML += '    <div class="ui-button ui-button-disabled" id="c64StepOver">Step Over (F10)</div>';
      buttonsHTML += '    <div class="ui-button ui-button-disabled" id="c64StepInto">Step Into (F11)</div>';
        
  //    html += '    <div class="ui-button" id="c64CompactReset">machine reset</div>'; 
  
  
      buttonsHTML += '  </div>';   


      var buttonsPanel = UI.create("UI.HTMLPanel", { "html": buttonsHTML });
      this.westSplitPanel.addSouth(buttonsPanel, 30, false);



      // need to calculate height
      this.mobileSplitPanel = UI.create("UI.SplitPanel");
      this.splitPanel.addSouth(this.mobileSplitPanel, 250, false, !showDebuggerPanels);

      var html = '';
      html += '<div id="c64DebuggerTabs">';
      html += '<div class="ui-tab " data-tab="Keyboard">Keyboard</div>';
      html += '<div class="ui-tab ui-current-tab" data-tab="Joystick">Joystick</div>';

      html += '<div class="ui-tab" data-tab="Settings">Settings</div>';
      html += '<div class="ui-tab" data-tab="Content">Content</div>';
      html += '</div>';

      this.mobileSelectPanel = UI.create("UI.HTMLPanel", { html: html });
      this.mobileSplitPanel.addNorth(this.mobileSelectPanel, 40, false);

      this.mobilePanel = UI.create("UI.Panel", { "id": "c64MobilePanel" });
      this.mobileSplitPanel.add(this.mobilePanel);
    } else {


      // compact version...

      this.uiComponent = UI.create("UI.Panel", { "id": "c64debuggerCompactPanel" } );
      parentPanel.add(this.uiComponent);
  
      var splitPanel = UI.create("UI.SplitPanel", { "id": "c64DebuggerCompactSplitPanel"});
      this.uiComponent.add(splitPanel);
  
  
      var buttonsHTML = '';
      buttonsHTML += '<div style="position: relative">';
  
      buttonsHTML += '  <div style="margin: 4px 0; position: relative">';
      buttonsHTML += '    <div class="ui-button" id="c64CompactPlay" style="width: 68px"><i class="halflings halflings-pause"></i>&nbsp;Pause (F9)</div>';
      buttonsHTML += '    <div class="ui-button ui-button-disabled" id="c64CompactStepOver">Step Over (F10)</div>';
      buttonsHTML += '    <div class="ui-button ui-button-disabled" id="c64CompactStepInto">Step Into (F11)</div>';        
      buttonsHTML += '    <div class="ui-button ui-button-disabled" style="display: none" id="c64CompactStepCycle">Step 1/2 Cycle</div>';
      
  //    html += '    <div class="ui-button" id="c64CompactReset">machine reset</div>'; 
  
  
      buttonsHTML += '  </div>';   
  
  
      
      buttonsHTML += '</div>';
  
      var html = '';

  
      html += '<div class="panelFill" id="' + this.c64CanvasId + 'Holder">';
  
      html += '<form id="c64DebuggerCompactForm">';
      html += '  <input class="formControl"  id="c64CompactChoosePRG" type="file" accept=".prg" style="position: absolute; top: -50px; left: -100px" />';
      html += '  <input class="formControl"  id="c64CompactChooseD64" type="file" accept=".d64" style="position: absolute; top: -50px; left: -150px" />';
      html += '  <input class="formControl"  id="c64CompactChooseCRT" type="file" accept=".crt" style="position: absolute; top: -50px; left: -150px" />';
      html += '</form>';
  

      html += '<canvas id="' + this.c64CanvasId + '"></canvas>';


      html += '<div style="position: absolute; left: 0; right: 0; bottom: 0; height: 20px; background-color: #555555; color: #dddddd">';
      html += '  <div class="checkboxGroup">';
      html += '    <label class="cb-container">Grid<input type="checkbox" id="' + this.c64CanvasId + 'Grid" value="1" ><span class="checkmark"></span> </label>';
      html += '  </div>';

      html += '  <div  style="display: inline-block" id="' + this.c64CanvasId + 'InspectInfo"></div>';
      html += '</div>';

      
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

      htmlComponent.on('resize', function() {
        _this.resizeC64Panel();
      });

  
      this.registersPanel = UI.create("UI.Panel");
  //    splitPanel.addNorth(this.registersPanel, 34, false);
  
      this.cpuPanel = UI.create("UI.SplitPanel");
  //    splitPanel.addSouth(this.cpuPanel, 300, true);
  
  
      /*
  */
  
      splitPanel.add(this.cpuPanel);
  
      var panelSize = g_app.getPref('c64-' + this.prefix + '-panelsizev');

      if(typeof panelSize == 'undefined' || panelSize == null ) {
        panelSize = 280;
      } else {
        panelSize = parseInt(panelSize, 10);
      }

      if(isNaN(panelSize) || panelSize < 10) {
        panelSize = 280;
      }

      this.cpuPanel.addNorth(htmlComponent, panelSize);//280);
      this.cpuPanel.on('resizenorth', function(size) {
        if(size > 0) {
          g_app.setPref('c64-' + _this.prefix + '-panelsizev', size);
        }
      });

  
  
  
      var controlsPanel = UI.create("UI.SplitPanel");
      this.cpuPanel.add(controlsPanel);

      this.breakpointsPanel = UI.create("UI.Panel");
      this.cpuPanel.addSouth(this.breakpointsPanel, 120);
      
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
      this.tabPanel.addTab({ key: 'bitmap',   title: 'Bitmap', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'sid',   title: 'SID', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'drive',   title: 'Drive', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'scripting',   title: 'Scripting', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'colors',   title: 'Colors', isTemp: false }, false);
      this.tabPanel.addTab({ key: 'basic',   title: 'Basic', isTemp: false }, false);
  
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

      this.bitmapPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactBitmap"});
      this.debuggerOutputPanel.add(this.bitmapPanel);

      this.sidPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactSID"});
      this.debuggerOutputPanel.add(this.sidPanel);
      
      this.drivePanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactDrive"});
      this.debuggerOutputPanel.add(this.drivePanel);
        
      this.scriptingPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactScripting" });
      this.debuggerOutputPanel.add(this.scriptingPanel);

      this.colorsPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactColors" });
      this.debuggerOutputPanel.add(this.colorsPanel);

      this.basicPanel = UI.create("UI.Panel", { "id": "c64DebuggerCompactBasic" });
      this.debuggerOutputPanel.add(this.basicPanel);

      UI.on('ready', function() {
        _this.showDebuggerContent('disassembly');
        _this.initCompactEvents();
      });  
    }
  },


  closeWestPanel: function() {
    this.showPanel('c64-view-toggle-' + this.westContent, false);
  },

  closeEastPanel: function() {
    sid_setChannelBuffersEnabled(false);
    this.showPanel('c64-view-toggle-' + this.eastContent, false);
  },

  closeAssemblerPanel: function() {
    this.showPanel('c64-view-toggle-assembler', false);
  },

  showPanel: function(panel, show) {

    var westPanel = {
      "c64-view-toggle-disassembly": {
        "menuItem": 'c64-view-toggle-disassembly',
        "tab": 'disassembly',
        "panel": 'c64DebuggerDisassembly',
        "component": this.disassembly
      },
      "c64-view-toggle-scripting": {
        "menuItem": "c64-view-toggle-scripting",
        "tab": 'scripting',
        "panel": 'c64DebuggerScripting',
        "component": null
      },
      "c64-view-toggle-colors": {
        "menuItem": "c64-view-toggle-colors",
        "tab": 'colors',
        "panel": 'c64DebuggerColors',
        "component": this.colors
      },
      "c64-view-toggle-basic": {
        "menuItem": "c64-view-toggle-basic",
        "tab": 'basic',
        "panel": 'c64DebuggerBasic',
        "component": null
      },
    };
 
    var eastPanel = {
      "c64-view-toggle-memory": {
        "menuItem": "c64-view-toggle-memory",
        "tab": 'memory',
        "panel": 'c64DebuggerMemory',
        "component": this.memory
      },
      "c64-view-toggle-charset": {
        "menuItem": "c64-view-toggle-charset",
        "tab": 'charset',
        "panel": 'c64DebuggerCharset',
        "component": this.c64Charset
      },
      "c64-view-toggle-sprites": {
        "menuItem": "c64-view-toggle-sprites",
        "tab": 'sprites',
        "panel": 'c64DebuggerSprites',
        "component": this.c64Sprites
      },
      "c64-view-toggle-bitmap": {
        "menuItem": "c64-view-toggle-bitmap",
        "tab": 'bitmap',
        "panel": 'c64DebuggerBitmap',
        "component": this.c64Bitmap
      },
      "c64-view-toggle-sid": {
        "menuItem": "c64-view-toggle-sid",
        "tab": 'sid',
        "panel": 'c64DebuggerSID',
        "component": this.c64SID
      },

      "c64-view-toggle-drive": {
        "menuItem": "c64-view-toggle-drive",
        "tab": 'drive',
        "panel": 'c64DebuggerDrive',
        "component": this.c64Drive
      },
      "c64-view-toggle-docs": {
        "menuItem": "c64-view-toggle-docs",
        "tab": 'docs',
        "panel": 'c64DebuggerDocs',
        "component": null
      },
      "c64-view-toggle-calc": {
        "menuItem": "c64-view-toggle-calc",
        "tab": 'calc',
        "panel": 'c64DebuggerCalculator',
        "component": null
      }
    };

    // the component corresponding to the panel
    var panelComponent = null;

    if(panel == 'c64-view-toggle-assembler') {
      UI('c64ScreenSplitPanel').setPanelVisible('south', show, 300);
      UI(panel).setChecked(show);
      this.panelVisible['assembler'] = show;
    }

    if(westPanel.hasOwnProperty(panel)) {


      for(var key in westPanel) {
        var component = westPanel[key].component;

        if(panel == key) {
          this.panelVisible[westPanel[key].tab] = show;
          UI(westPanel[key].menuItem).setChecked(show);

          if(show) {
            this.westContent = westPanel[key].tab;

            UI('c64DebuggerSplitPanel').setPanelVisible('west', true);
            
            this.westTabPanel.showTab(westPanel[key].tab);
            this.westMainPanel.showOnly(westPanel[key].panel);

            if(this.c64Registers) {
              this.c64Registers.update();
            }

            panelComponent = component;            
          }
        } else {
          if(show) {
            this.panelVisible[westPanel[key].tab] = false;
            if(component) {
              if(typeof component.setVisible != 'undefined') {
                component.setVisible(false);
              }
            }
            UI(westPanel[key].menuItem).setChecked(false);
          }
        }
      }

      if(panel == "c64-view-toggle-disassembly") {
        this.westSplitPanel.setPanelVisible('south', true);
        this.cpuPanel.setPanelVisible('south', true);
      } else {
        this.westSplitPanel.setPanelVisible('south', false);
        this.cpuPanel.setPanelVisible('south', false);
      }
    }

    if(eastPanel.hasOwnProperty(panel)) {
      for(var key in eastPanel) {
        var component = eastPanel[key].component;

        if(panel == key) {
          this.panelVisible[eastPanel[key].tab] = show;
          UI(eastPanel[key].menuItem).setChecked(show);
          if(show) {
            this.eastContent = eastPanel[key].tab;

            this.eastTabPanel.showTab(eastPanel[key].tab);
            panelComponent = component;
            this.eastMainPanel.showOnly(eastPanel[key].panel);

          }
        } else {
          if(show) {
            this.panelVisible[eastPanel[key].tab] = false;
            UI(eastPanel[key].menuItem).setChecked(false);
            if(component && typeof component.setVisible != 'undefined') {
              component.setVisible(false);
            }
          }
        }
      }
    }


    this.setPanelVisibility();
    UI(panel).setChecked(show);

    if(panelComponent) {
      if(typeof panelComponent.setVisible != 'undefined') {
        panelComponent.setVisible(true);
      }
      if(typeof panelComponent.forceRedraw != 'undefined') {
        panelComponent.forceRedraw();
      }
      panelComponent.update();

    }
  },

  setPanelVisibility: function() {
    this.onlyc64Visible = true;

    if(this.panelVisible['assembler']) {
      this.onlyc64Visible = false;
    }

    if(this.panelVisible['disassembly'] 
      || this.panelVisible['scripting']
      || this.panelVisible['colors'] 
      || this.panelVisible['basic'] ) {
      UI('c64DebuggerSplitPanel').setPanelVisible('west', true);
      this.onlyc64Visible = false;
    } else {
      UI('c64DebuggerSplitPanel').setPanelVisible('west', false);
    }


    if(
        this.panelVisible['memory']
        || this.panelVisible['charset']
        || this.panelVisible['sprites']
        || this.panelVisible['bitmap']
        || this.panelVisible['sid']
        || this.panelVisible['drive']
        || this.panelVisible['docs'] 
        || this.panelVisible['calc']
      ) {
//      UI('c64DebuggerSplitPanel').resizeThePanel({panel: 'east', size: 355});
      UI('c64DebuggerSplitPanel').setPanelVisible('east', true);
      
      this.onlyc64Visible = false;
    } else {
      UI('c64DebuggerSplitPanel').setPanelVisible('east', false);
    }

    if(this.c64Focus || this.onlyc64Visible) {
      this.focusMachine();
    } else {
      this.blurMachine();
    }
  },


  showWestContent: function(key) {
    this.westContent = key;
    switch(key) {
      case 'disassembly':
        this.showPanel('c64-view-toggle-disassembly', true);
        
//        this.westMainPanel.showOnly("c64DebuggerDisassembly")
        break;

      case 'scripting':
        this.showPanel('c64-view-toggle-scripting', true);

        /*
        this.westMainPanel.showOnly("c64DebuggerScripting")
        if(this.scripting) {
          this.scripting.show();
        }
        */
        break;
      case 'colors':
        this.showPanel('c64-view-toggle-colors', true);

//        this.westMainPanel.showOnly("c64DebuggerColors")
        break;
      case 'basic':
        this.showPanel('c64-view-toggle-basic', true);
        this.basic.show();
        break;
    }
    this.westMainPanel.resize();

  },

  showEastContent: function(key) {
    this.eastContent = key;
    if(key != 'sid') {
      sid_setChannelBuffersEnabled(false);
    }
    switch(key) {
      case 'memory':
        this.showPanel('c64-view-toggle-memory', true);
//        this.eastMainPanel.showOnly("c64DebuggerMemory");
        break;
      case 'charset':
        this.showPanel('c64-view-toggle-charset', true);
/*
        this.eastMainPanel.showOnly("c64DebuggerCharset");
        this.c64Charset.setVisible(true);
        this.c64Charset.forceRedraw();
*/        
        break;
  
      case 'sprites':
        this.showPanel('c64-view-toggle-sprites', true);
        break;
      case 'bitmap':
        this.showPanel('c64-view-toggle-bitmap', true);
        break;
      case 'sid':
        sid_setChannelBuffersEnabled(true);
        this.showPanel('c64-view-toggle-sid', true);
        break;
      case 'drive':
        this.showPanel('c64-view-toggle-drive', true);
        break;
      case 'docs':
        this.showPanel('c64-view-toggle-docs', true);

        /*
        this.eastMainPanel.showOnly("c64DebuggerDocs");
        */
        break;
      case 'calc':
        this.showPanel('c64-view-toggle-calc', true);

      /*
        this.eastMainPanel.showOnly("c64DebuggerCalculator");
      */        
        break;
    }
    this.eastMainPanel.resize();

  },

  // compact view stuff
  showDebuggerContent: function(key) {
    this.debuggerContent = key;
    if(key != 'sid' && c64_ready) {
      sid_setChannelBuffersEnabled(false);
    }

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
      case 'bitmap':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactBitmap")
        break;
      case 'sid':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactSID");
        sid_setChannelBuffersEnabled(true);
        break;
      case 'drive':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactDrive")
        break;
      case 'scripting':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactScripting")
        if(this.scripting) {
          this.scripting.show();
        }
  
        break;
      case 'colors':
        break;
      case 'basic':
        this.debuggerOutputPanel.showOnly("c64DebuggerCompactBasic")
        break;
    }
    this.debuggerOutputPanel.resize();
  },


  initCompactEvents: function() {
    var _this = this;

    /*
    $('input[name=c64CompactJoystickPort]').on('click', function() {
      var joystickPort = $('input[name=c64CompactJoystickPort]:checked').val();
      _this.setJoystickPort(joystickPort);
    });
*/

    this.canvas = document.getElementById(this.c64CanvasId);
    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('dblclick', function(event) {
      _this.dblClick(event);
    }, false);


    this.canvas.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);

    this.canvas.addEventListener('mouseenter', function(event) {
      if(_this.mouseInfo) {
        UI.setCursor('none');
      } else {
        UI.setCursor('default');
      }
    }, false);

    this.canvas.addEventListener('mouseleave', function(event) {

      _this.mouseLeave(event);

    }, false);

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();      
    }, false);

          
    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);    


    $('#c64CompactShowRaster').on('click', function() {
      var showRaster = $(this).is(':checked');
      _this.setShowRaster(showRaster);
    });

    $('#c64CompactPlay').on('click', function() {
      _this.play();
    });

    $('#c64CompactStepOver').on('click', function() {
      _this.stepOver();
    });

    $('#c64CompactStepInto').on('click', function() {
      _this.stepInto();
    });

    $('#c64CompactStepCycle').on('click', function() {
      _this.stepCycle();
    });

    $('#c64CompactReset').on('click', function() {
      _this.machineReset();
    });

    $('#' + this.c64CanvasId).on('click', function(event) {
      _this.focusMachine();
    });

    $('#' + this.c64CanvasId + 'Grid').on('click', function(event) {      
      _this.showGrid($(this).is(':checked'));      
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
      _this.insertCRT(file);
    });

  },  

  showGrid: function(show) {
    this.grid = show;
    UI('c64debugger-grid').setChecked(show);
  },

  showMouseInfo: function(show) {
    this.mouseInfo = show;
    UI('c64debugger-mouse').setChecked(show);

    $('.showMouseInfo').prop('checked', show);
  },

  initContent: function() {

    if(g_app.isMobile()) {
      $('#' + this.c64CanvasId + 'Holder').css('text-align', 'center');
      $('#' + this.c64CanvasId + 'Holder').css('margin-top', '10px');

      $('#c64DebuggerJoystickHolder').hide();
    }
    
    UI('c64debugger-randomdelay').setChecked(this.getRandomDelayEnabled());

  },

  layoutMobile: function() {
    if(this.canvas == null) {
      // not ready yet
      return;
    }
    
    var height = UI.getScreenHeight();
    var width = UI.getScreenWidth();

    if(this.orientation != 0) {
      // landcape
      if(UI.exists('mobileMenuBar')) {
        UI('mobileMenuBar').setVisible(false);
      }
      if(UI.exists('projectSplitPanel')) {
        UI('projectSplitPanel').resizeThePanel({panel: 'north', size: 0});
      }
      $('#' + this.c64CanvasId + 'Holder').css('margin-top', '5px');


      //this.splitPanel.resizeThePanel({ panel: 'south', size: 0 });
      this.splitPanel.setPanelVisible('south', false);
//      splitPanel.addSouth(this.mobileSplitPanel, 250, false, !showDebuggerPanels);
      $("#on-screen-joystick-overlay").show();
      this.overlayOnscreenJoystick.draw();

    } else {
      // portrait

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();


      // work out size for c64..
      var c64Width = 384;
      var c64Height = 272;

      var c64Scale = screenWidth / c64Width;
      if(c64Scale < 1) {
        c64Scale = 1;
      }

      var c64CanvasMaxHeight = c64Height * c64Scale;

      var remainingHeight = Math.floor(screenHeight - c64CanvasMaxHeight - 40 - 60);

      if(remainingHeight > 280) {
        remainingHeight = 280;
      }
      if(remainingHeight < 260) {
        remainingHeight = 260;
      }

    
      if(UI.exists('mobileMenuBar')) {
        UI('mobileMenuBar').setVisible(true);
      }
      if(UI.exists('projectSplitPanel')) {
        UI('projectSplitPanel').resizeThePanel({panel: 'north', size: 70});
      }
      $('#' + this.c64CanvasId + 'Holder').css('margin-top', '10px');

      //this.splitPanel.resizeThePanel({ panel: 'south', size: 250 });
      this.splitPanel.setPanelVisible('south', true);
      this.splitPanel.resizeThePanel({ panel: 'south', size: remainingHeight });

      $("#on-screen-joystick-overlay").hide();
      this.onscreenJoystick.draw();
      this.onscreenKeyboard.draw();
    }
  
  },

  initEvents: function() {
    var isMobile = g_app.isMobile();

    var _this = this;

    if(isMobile) {

      this.overlayOnscreenJoystick.initEvents();

      window.addEventListener("orientationchange", function(event) {

        return;
        
        if( typeof event.target.screen != 'undefined' 
            && typeof event.target.screen.orientation != 'undefined'
            && typeof event.target.screen.orientation.angle != 'undefined') {
          _this.orientation = event.target.screen.orientation.angle;
        }
        _this.layoutMobile();
      });
    }


    /*
    $('input[name=importC64JoystickPort]').on('click', function() {
      var joystickPort = $('input[name=importC64JoystickPort]:checked').val();
      _this.setJoystickPort(joystickPort);
    });
    */

    $('#c64CloseWestPanel').on('click', function() {
      _this.closeWestPanel();
    }); 


    $('#c64CloseEastPanel').on('click', function() {
      _this.closeEastPanel();
    }); 

    $('#c64CloseAssemblerPanel').on('click', function() {
      _this.closeAssemblerPanel();
    });

    $('#c64Play').on('click', function() {
      _this.play();
    });

    $('#c64StepOver').on('click', function() {
      _this.stepOver();
    });

    $('#c64StepInto').on('click', function() {
      _this.stepInto();
    });

    $('#c64Reset').on('click', function() {
      _this.machineReset();
    });

    //$('#c64LoadPRG').on('click', function() {
    $('#c64DebuggerCurrentPRG' + this.type).on('click', function() {
      $('#c64ChoosePRG').click();
    });

    $('#c64DebuggerAttachedDisk').on('click', function() {
//    $('#c64DebuggerAttachDisk').on('click', function() {
      _this.chooseD64();
    });

    $('#c64DebuggerJoystick').on('click', function() {
      _this.toggleJoystick();
    });

    $('#c64DebuggerShare').on('click', function() {
      _this.share();
    });

    $('#c64DebuggerTabs .ui-tab').on('click', function() {
      var tab = $(this).attr('data-tab');
      $('#c64DebuggerTabs .ui-tab').removeClass('ui-current-tab');
      $(this).addClass('ui-current-tab');

      UI('c64MobilePanel').showOnly('c64Onscreen' + tab);

      if(tab == 'Joystick') {
        _this.onscreenJoystick.draw();
      }
      if(tab == 'Keyboard') {

        _this.onscreenKeyboard.draw();
      }
    });



    $('#' +  this.prefix + 'JoystickHolder').on('click', function() {
      c64.joystick.showSettingsDialog();
    });


    $('#' + this.prefix + 'DriveInfo').on('click', function() {
      _this.chooseD64(false);
    });

    $('#' + this.c64CanvasId ).on('click', function() {
      _this.focusMachine();
    });


    //$('#' + this.c64CanvasId + 'Overlay').on('click', function() {
    $('#' + this.c64CanvasId + 'OverlayPlayButton').on('click', function() {
      _this.overlayClick();
    });

    this.canvas = document.getElementById(this.c64CanvasId);

    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API

    this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
                                     this.canvas.mozRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock;


    this.canvas.addEventListener('click', function(event) {
      if(!_this.mouseLocked && c64.joystick.hasMouse()) {
        _this.canvas.requestPointerLock();
      }
    }, false);    

    document.addEventListener('pointerlockchange', function(event) {
      _this.lockChange(event);
    }, false);
    document.addEventListener('mozpointerlockchange', function(event) {
      _this.lockChange(event);
    }, false);

    this.canvas.addEventListener('dblclick', function(event) {
      _this.dblClick(event);
    }, false);
    
    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();      
    }, false);


    this.canvas.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);

    this.canvas.addEventListener('mouseenter', function(event) {
      if(_this.mouseInfo || (c64_ready && (c64.joystick.getMousePortEnabled(0) || c64.joystick.getMousePortEnabled(1)))  ) {
        UI.setCursor('none');
      } else {
        UI.setCursor('default');
      }
    }, false);

    this.canvas.addEventListener('mouseleave', function(event) {
      _this.mouseLeave(event);

    }, false);

    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);    



    if(isMobile) {
      $('#c64BackToSource').on('click', function() {
        _this.backToSource();
      });

    }

    document.getElementById('c64ChoosePRG').addEventListener("change", function(e) {
      var file = document.getElementById('c64ChoosePRG').files[0];
      _this.loadPRGFile(file);
    });

    document.getElementById('c64ChooseD64').addEventListener("change", function(e) {
      var file = document.getElementById('c64ChooseD64').files[0];
      _this.attachD64(file);
    });

    document.getElementById('c64ChooseCRT').addEventListener("change", function(e) {
      var file = document.getElementById('c64ChooseCRT').files[0];
      _this.insertCRT(file);
    });

  },

  setButtons: function(event) {
    if(typeof event.buttons != 'undefined') {
      this.buttons = event.buttons;
    } else {
      if(typeof event.which !== 'undefined') {
        this.buttons = event.which;

      } else if(typeof event.nativeEvent !== 'undefined') {
        if(typeof event.nativeEvent.which != 'undefined') {
          this.buttons = event.nativeEvent.which;
        }
        if(typeof event.nativeEvent.buttons != 'undefined') {
          this.buttons = event.nativeEvent.buttons;
        }
      }
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {

      this.buttons = UI.LEFTMOUSEBUTTON;
    }

    if(event.ctrlKey && (this.buttons & UI.LEFTMOUSEBUTTON)  ) {
      if(UI.os == 'Mac OS') {
        this.buttons = UI.RIGHTMOUSEBUTTON;
      }
    }
  },

  lockChange: function(event) {
    if (document.pointerLockElement === this.canvas ||
      document.mozPointerLockElement === this.canvas) {
      this.mouseLocked = true;
//      document.addEventListener("mousemove", updatePosition, false);
    } else {
      this.mouseLocked = false;
//      document.removeEventListener("mousemove", updatePosition, false);
    }
  },

  mouseDown: function(event) {

    this.setButtons(event);
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;    
    x = x - 32;
    y = y - 36;

    // mouse left = fire,mouse right = up
    if(c64.joystick.getMousePortEnabled(0)) {
      event.preventDefault();
      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        c64_joystickPush(0, C64_JOYSTICK_FIRE);
      }

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        c64_joystickPush(0, C64_JOYSTICK_UP);
      }
      
    }
    if(c64.joystick.getMousePortEnabled(1)) {
      event.preventDefault();

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        c64_joystickPush(1, C64_JOYSTICK_FIRE);
      }

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        c64_joystickRelease(1, C64_JOYSTICK_FIRE);
      }
    }

    if(this.c64Charset && this.panelVisible['charset']) {
      this.c64Charset.debuggerMouseDown();
      UI.captureMouse(this);
    }

    if(this.c64Sprites && this.c64Sprites.visible) {
      this.c64Sprites.debuggerMouseDown();
    }

  },

  
  mouseUp: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;
    x = x - 32;
    y = y - 36;

    if(c64.joystick.getMousePortEnabled(0)) {
      event.preventDefault();
      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        c64_joystickRelease(0, C64_JOYSTICK_FIRE);
      }

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        c64_joystickRelease(0, C64_JOYSTICK_UP);
      }
      
    }
    if(c64.joystick.getMousePortEnabled(1)) {
      event.preventDefault();
      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        c64_joystickRelease(1, C64_JOYSTICK_FIRE);
      } 

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        c64_joystickRelease(1, C64_JOYSTICK_UP);
      }
    }

    if(this.c64Charset && this.c64Charset.visible) {
      this.c64Charset.debuggerMouseUp();
//      UI.captureMouse(this);
    }


    this.buttons = 0;
  },

  dblClick: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;    

    if(this.c64Charset.visible) {
      this.c64Charset.editChar(this.mouseChar);
    }
  },

  mouseMove: function(event) {
    if(this.mouseLocked) {
      this.lockedMouseX += event.movementX;
      this.lockedMouseY += event.movementY;
      this.mouseC64X += event.movementX;
      this.mouseC64Y += event.movementY;
      return;
    }
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;    


    this.mouseX = x;
    this.mouseY = y;
    if(this.mouseX !== false && this.mouseY !== false) {
      if(c64_ready) {
        this.redraw();
      }
    }
  },

  mouseLeave: function(event) {
    UI.setCursor('default');
    this.mouseX = false;
    this.mouseY = false;

    if(this.c64Charset && this.c64Charset.getVisible()) {
      this.c64Charset.debuggerMouseLeave();
    }

    if(this.c64Sprites && this.c64Sprites.getVisible()) {
      this.c64Sprites.debuggerMouseLeave();
    }

    if(this.c64Bitmap && this.c64Bitmap.getVisible()) {
      this.c64Bitmap.debuggerMouseLeave();
    }
    
  },


  mouseWheel: function(event) {
    //event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var direction = -wheel.spinY;

    var newScale = this.mouseZoom + direction / 2;

    if(newScale <= 1) {
      newScale = 1;
    }

    this.setMouseZoom(newScale);
  },

  setMouseZoom: function(newScale) {
    this.mouseZoom = newScale;

  },


  // no compact version of this?
  choosePRG: function() {
    document.getElementById('c64DebuggerForm').reset();

    $('#c64ChoosePRG').click();
  },

  chooseD64: function(autostart) {
    this.autostartD64 = autostart;
    document.getElementById('c64DebuggerForm').reset();

    $('#c64ChooseD64').click();
  },


  chooseCRT: function() {
    document.getElementById('c64DebuggerForm').reset();

    $('#c64ChooseCRT').click();
  },



  loadBASFile: function(file) {
    var _this = this;
    var fileReader = new FileReader();

    fileReader.onload = function(e) {
      _this.showPanel('c64-view-toggle-basic', true);
      _this.basic.setBAS(e.target.result);
      
      _this.basic.run();
    }
    fileReader.readAsText(file);
  },


  loadPRGFile: function(file) {

    c64.sound.checkAudio();

    // remove pc marker from text editor
    this.removePCMarker();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      _this.prgData = new Uint8Array(reader.result);
      _this.prgName = file.name;

      if(_this.type != 'compact') {
        $('#c64DebuggerCurrentPRG' + _this.type).html(_this.prgName);
      }
      var inject = _this.prgLoadMethod != 'loadrun';
      if(_this.crtData != null) {
        _this.crtData = null;
  
        c64_removeCartridge();
      }
        
      _this.startPRG(_this.prgData, inject);



    };

    reader.readAsArrayBuffer(file);

    this.prgFile = file;
    this.resizeC64Panel();
  },  

  attachD64AsByteArray: function(filename, d64ByteArray) {

    c64.sound.checkAudio();    
    c64_insertDisk(d64ByteArray, d64ByteArray.length);
    this.d64Data = d64ByteArray;
    this.d64Name = filename;

    if(this.type != 'compact') {     
      $('#' + this.prefix + 'AttachedDisk').html(filename);
      $('#' + this.prefix + 'DriveInfo').show();
    }

    if(this.autostartD64) {
      //D64Util.getFirstPRG(d64ByteArray);
      this.autostartD64PRG(d64ByteArray);
    }

    this.resizeC64Panel();

  },

  autostartD64PRG: function(data) {
    var prgData = D64Util.getFirstPRG(data);
    this.prgData = prgData;//new Uint8Array(reader.result);
    this.prgName = 'd64prg';// file.name;
    c64_reset();
    c64_insertDisk(data, data.length);

    this.d64Data = data;
    
  
    if(false && this.prgData) {
      var _this = this;
      setTimeout(function() {
        c64_loadPRG(_this.prgData, _this.prgData.length, false);
        c64.insertText('run:\n');
      }, 2000);

    } else {
      
//      alert("sorry, couldn;t find a prg");
      setTimeout(function() {
        c64.insertText('load "*",8,1\nrun\n');
      }, 2000);
    }

    this.resizeC64Panel();

  },

  attachD64: function(file) {

    c64.sound.checkAudio();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
      c64_insertDisk(data, data.length);
      _this.d64Data = data;
      _this.d64Name = file.name;

      if(_this.autostartD64) {
        _this.autostartD64PRG(data);
      }
  
    };
    reader.readAsArrayBuffer(file);

    var filename = file.name;

    if(this.type != 'compact') {     
      $('#' + this.prefix + 'AttachedDisk').html(filename);
//      $('#' + this.c64CanvasId + 'C64Info').show();
      $('#' + this.prefix + 'DriveInfo').show();
    }
  },

  insertCRT: function(file) {

    c64.sound.checkAudio();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(reader.result);
//      c64_insertDisk(data, data.length);

      if(_this.crtData != null) {
        _this.crtData = null;

        c64_removeCartridge();
      }

      c64_loadCRT(data, data.length);
      _this.crtData = data;
      _this.crtName = file.name;

    };
    reader.readAsArrayBuffer(file);
  },


  setSettings: function(settings) {


  },

  share: function(args) {
    
    var shareArgs = args;

    if(typeof args == 'undefined') {
      shareArgs = {};
    }

    if(typeof shareArgs.type == 'undefined') {
      // try to figure out the type...
      if(this.prgData) {
        shareArgs.type = 'prg';
      } else if(this.d64Data) {
        shareArgs.type = 'd64';
      } else if(this.crtData) {
        shareArgs.type = 'crt';
      } else if(this.panelVisible['assembler']) {
        shareArgs.type = 'assembly';
        shareArgs.view = 'current';
      } else if(this.panelVisible['basic']) {
        shareArgs.type = 'basic';
        shareArgs.view = 'current';
      }
      
    }

    if(this.gistShare == null) {
      this.gistShare = new C64GistShare();
    }

    this.gistShare.show(shareArgs);
    return;
    // share..
    var _this = this;

    if(!this.prgData) {
      alert('Only sharing of PRGs currently supported, please choose a PRG first');
      return;
    }

    var files = {};
    var data = bufferToBase64(this.prgData);
    files[this.prgName] = { content: data };
    var colors = c64.colors.colors;
    var port1 = c64.joystick.portEnabled[0]; 
    var port2 = c64.joystick.portEnabled[1]; 

    var settings = {
      "colors": colors,
      "port1": port1,
      "port2": port2
    };

    files["c64settings"] = {
      "content": JSON.stringify(settings)
    };
    g_app.gist.share({ files: files });
  },

  step: function() {
    if(!debugger_isRunning()) {
      debugger_step();
      this.syncToSource();
      this.redraw();
      if(this.showRaster) {
        this.drawRasterPosition();
      }
    }
  },

  stepOver: function() {
    // need to get address of next instruction....

    var pc = this.getPC();
    var opcode = this.readByte(pc) & 0xff;
    var opcoderecord = MOS6510Opcodes[opcode];

    // only really jsr need to find next address to step over?
    if(typeof opcoderecord == 'undefined' || opcode != 0x20) {
      this.stepInto();
      return;
    }

    var nextAddress = pc + opcoderecord.bytes;

    if(!debugger_isRunning()) {
      var count = 0;
//      for(var i = 0; i < 5000; i++) {
      while(count < 900000) {
        count++;
        debugger_step();
        var pc = this.getPC();
        if(pc == nextAddress) {

          break;
        }
      }


      this.syncToSource();
      this.redraw();
      if(this.showRaster) {
        this.drawRasterPosition();
      }
    }
  },

  stepInto: function() {
    if(!debugger_isRunning()) {
      debugger_step();
      this.syncToSource();
      this.redraw();
      if(this.showRaster) {
        this.drawRasterPosition();
      }
    }
  },

  // sync stepping to the source code
  syncToSource: function() {
    var pc = this.getPC();
    if(this.assemblerReport !== false) {
      if(typeof this.assemblerReport.addressMap[pc] != 'undefined') {
        var source = this.assemblerReport.addressMap[pc];

        var file = '/asm/' + source.file;

        if(this.type == 'compact') {
          g_app.projectNavigator.showDocRecord(file);
          g_app.assemblerEditor.showFile(file, source.lineNumber);
          var session = g_app.assemblerEditor.codeEditor.getEditSession();

          var lineNumber = source.lineNumber;
          this.removePCMarker();

          session.addGutterDecoration(lineNumber - 1, 'ace_pc');
          this.pcGutterDecoration.session = session;
          this.pcGutterDecoration.lineNumber = lineNumber - 1;
  
        } else {
          this.assemblerEditor.showFile(file, source.lineNumber);

          var session = this.assemblerEditor.codeEditor.getEditSession();

          var lineNumber = source.lineNumber;
          this.removePCMarker();

          session.addGutterDecoration(lineNumber - 1, 'ace_pc');
          this.pcGutterDecoration.session = session;
          this.pcGutterDecoration.lineNumber = lineNumber - 1;
            
        }

//        event.editor.session.setBreakpoint(row);

        
  
      }
    }

  },

  removePCMarker: function() {
    if(this.pcGutterDecoration.session !== false) {
      this.pcGutterDecoration.session.removeGutterDecoration(this.pcGutterDecoration.lineNumber, 'ace_pc');
      this.pcGutterDecoration.session = false;
      this.pcGutterDecoration.lineNumber = false;
    } 
  },

  // only used in compact at the moment
  updateButtons: function() {
    console.log('update buttons');
    if(debugger_isRunning()) {
      this.runningButtons = true;

      if(this.type == 'compact') {
        $('#c64CompactPlay').html('<i class="halflings halflings-pause"></i>&nbsp;Pause (F9)');
        $('#c64CompactPlay').removeClass('ui-button-primary');
        $('#c64CompactStepOver').addClass('ui-button-disabled');
        $('#c64CompactStepInto').addClass('ui-button-disabled');
        $('#c64CompactStepCycle').addClass('ui-button-disabled');
      } else {
        $('#c64Play').html('<i class="halflings halflings-pause"></i>&nbsp;Pause (F9)');
        $('#c64Play').removeClass('ui-button-primary');
        $('#c64StepOver').addClass('ui-button-disabled');
        $('#c64StepInto').addClass('ui-button-disabled');

      }
    } else {

      this.runningButtons = false;

      if(this.type =='compact') {
        $('#c64CompactPlay').html('<i class="halflings halflings-play"></i>&nbsp;Play (F9)');
        $('#c64CompactPlay').addClass('ui-button-primary');
        $('#c64CompactStepOver').removeClass('ui-button-disabled');
        $('#c64CompactStepInto').removeClass('ui-button-disabled');
        $('#c64CompactStepCycle').removeClass('ui-button-disabled');
        this.syncToSource();
      } else {
        $('#c64Play').html('<i class="halflings halflings-play"></i>&nbsp;Play (F9)');
        $('#c64Play').addClass('ui-button-primary');
        $('#c64StepOver').removeClass('ui-button-disabled');
        $('#c64StepInto').removeClass('ui-button-disabled');
      }
    }
  },
  
  isRunning: function() {
    return debugger_isRunning();
  },
  play: function() {

    if(debugger_isRunning()) {
      debugger_pause();
    } else {
      this.removePCMarker();
      debugger_play();
    }

    this.updateButtons();
  },

  machineReset: function() {
    //$('#c64DebuggerForm').reset();
    $('#c64DebuggerAttachedDisk').html('');
    //this.c64.machineReset();

    if(this.crtData != null) {
      this.crtData = null;
      c64_removeCartridge();
    }
    c64_reset();
  },


  overlayClick: function() {

    c64.sound.checkAudio();

    this.overlayVisible = false;
    $('#' + this.c64CanvasId + 'Overlay').hide();
    $('#' + this.c64CanvasId + 'OverlayElements').hide();

    if(g_app.isMobile()) {

      var docelem = document.documentElement;

      if (docelem.requestFullscreen) {
          docelem.requestFullscreen();
      } else if (docelem.mozRequestFullScreen) {
          docelem.mozRequestFullScreen();
      } else if (docelem.webkitRequestFullscreen) {
          docelem.webkitRequestFullscreen();
      } else if (docelem.msRequestFullscreen) {
          docelem.msRequestFullscreen();
      }
    } else {
      if(!this.mouseLocked && c64.joystick.hasMouse()) {
        this.canvas.requestPointerLock();
      }
    }

    if(this.prgToStart) {
      var args = {};
      args.prg = this.prgToStart;

      if(typeof g_c64Settings != 'undefined') {
        if(typeof g_c64Settings.prgstart != 'undefined') {
          args.prgStartMethod = g_c64Settings.prgstart;
        }
        if(typeof g_c64Settings.prgRandomDelay != 'undefined') {
          args.prgRandomDelay = g_c64Settings.prgRandomDelay;
        }
      }

      this.setPRG(args);
    }

    if(this.d64ToStart) {
      this.autostartD64PRG(this.d64ToStart);
    }

    if(this.crtToStart) {
      this.crtData = this.crtToStart;
      c64_loadCRT(this.crtData, this.crtData.length);
    }


    if(this.snapshotToStart) {
      c64_loadSnapshot(this.snapshotToStart, this.snapshotToStart.length);

    }
  },



  onC64Ready: function() {
    /*
    console.log("READY!!!");

    var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    data = new Uint8Array(data);
    console.log('original data:');
    console.log(data);

    var dataLength = data.length;

    var ptr = c64_getData(data, dataLength);
    var len = c64_getDataLength();

    var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
    console.log('encrypted data');
    console.log(view);

    var ptr = c64_decrypt(view, view.length);
    view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view

    console.log('decrypted data');
    console.log(view);

    */

    // set the model..should really do this before call to c64_init..    
    var model = g_app.getPref('c64-model');
    if(typeof model != 'undefined' && model !== null) {
      this.setModel(model);
    }

    this.setupContent();
    this.updateJoystickInfo();

  },

  setupContent: function() {
    if(!c64_ready) {
      return;
    }

    if(this.contentIsSetup) {
      // have already setup content
      return;
    }

    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('view')) {
      var view = urlParams.get('view');
      var views = view.split(',');
      for(var i = 0; i < views.length; i++) {          
        var view = views[i];
        this.showPanel('c64-view-toggle-' + view, true);
      }

    }

    
    if(g_c64Settings === false) {
      // not ready to setup content
      return;
    }
    c64.setSettings();


    var settings = g_c64Settings;
    
    if(!g_app.isMobile()) {
      // which panels to show on startup
      if(typeof settings.view != 'undefined') {
        for(var i = 0; i < settings.view.length; i++) {
          
          var view = settings.view[i];
          this.showPanel('c64-view-toggle-' + view, true);
        }
      }
    }

    

    // what content to show
    if(typeof settings.autostart != 'undefined') {
      for(var i = 0; i < settings.autostart.length; i++) {
        var autostart = settings.autostart[i];
        switch(autostart) {
          case 'basic':
            this.basic.run();
            break;
          case 'script':
            this.scripting.run();
            break;
          case 'assembler':
            this.assemblerEditor.run();
            break;
        }
      }
    }

    // mobile joystick
    for(var i = 0; i < 2; i++) {
      var port = i + 1;

      if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {
        this.onscreenJoystick.setPort(port);
        this.overlayOnscreenJoystick.setPort(port);

        $('#c64MobileJoystickPort_' + port).prop('checked', true);

        if(typeof g_c64Settings['port' + port + 'Buttons'] != 'undefined') {
          var buttons = parseInt(g_c64Settings['port' + port + 'Buttons'], 10);
          this.onscreenJoystick.setType(buttons);
          this.overlayOnscreenJoystick.setType(buttons);

          $('#c64MobileJoystickType_' + buttons).prop('checked', true);
        }

        if(typeof g_c64Settings['port' + port + 'Button1Action'] != 'undefined') {
          var action = g_c64Settings['port' + port + 'Button1Action'];
          //c64.joystick.setJoystickButtonAction(0, 1, g_c64Settings.port1Button1Action);
          this.onscreenJoystick.setSecondButton(action);
          this.overlayOnscreenJoystick.setSecondButton(action);

          $('#c64MobileJoystickButton2_' + action).prop('checked', true);
        }
          
      }
        
      if(typeof g_c64Settings['mousePort' + port] != 'undefined') {
//        c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
      }
    
    }

    this.contentIsSetup = true;

  },

  checkSharing: function() {
    if(typeof g_c64Settings != 'undefined') {
      if(typeof g_c64Settings.share != 'undefined') {
        return g_c64Settings.share;
      }
    }

    return true;
  },

  checkSnapshotDownload: function() {
    if(typeof g_c64Settings.snapshotDownload != 'undefined') {
      return g_c64Settings.snapshotDownload;
    }
    return true;
  },


  applyShareSettings: function() {
    if(typeof g_c64Settings == 'undefined') {
      return;
    }

    if(typeof g_c64Settings.share != 'undefined') {
      if(!g_c64Settings.share) {
        $('#shareButton').hide();
      } 
      
      UI('c64-share-link').setEnabled(g_c64Settings.share);
      UI('c64-export-html-page').setEnabled(g_c64Settings.share);
    } else {
      UI('c64-share-link').setEnabled(true);
      UI('c64-export-html-page').setEnabled(true);
    }

    if(typeof g_c64Settings.snapshotDownload != 'undefined') {
      UI('c64-downloadsnapshot').setEnabled(g_c64Settings.snapshotDownload);
    } else {
      UI('c64-downloadsnapshot').setEnabled(true);
    }
  },

  setContentToStart: function(args) {
//    c64.sound.checkAudio();

    $('#shareButton').hide();
    $('#menuSignIn').hide();
    if(g_app.isMobile()) {
      var logoHTML = '<a href="http://lvllvl.com"><img src="images/logo32t.png" style="margin-top: 8px; filter: invert(10%) !important" height="32" style="padding: 3px 3px 3px 5px"></a>';
      $('#mobileMenuBarHamburger').html(logoHTML);
    }



    var filename = '';

    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    if(typeof args.prg != 'undefined') {
      this.prgToStart = args.prg;
      this.prgName = filename;
    }

    if(typeof args.crt != 'undefined') {
      this.crtToStart = args.crt;
      this.crtName = filename;
    }

    if(typeof args.d64 != 'undefined') {
      this.d64ToStart = args.d64;
      this.d64Name = filename;
    }

    if(typeof args.snapshot != 'undefined') {
      this.snapshotToStart = args.snapshot;
      
    }

    $('#' + this.c64CanvasId + 'Overlay').show();
    $('#' + this.c64CanvasId + 'OverlayElements').show();
    $('#' + this.c64CanvasId + 'OverlayTitle').html(filename);

    var overlayInfo = '';// 'controls: arrow keys + z';

    this.applyShareSettings();

    if(!g_app.isMobile()) {
      var secondButton = false;

      if(typeof g_c64Settings != 'undefined' && g_c64Settings) {
        for(var i = 0; i < 2; i++) {
          var port = i + 1;
          if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {
            if(typeof g_c64Settings['port' + port + 'Buttons'] != 'undefined' && g_c64Settings['port' + port + 'Buttons'] > 1) {

              secondButton = true;
            }
          }
        }


      }

      overlayInfo = '<div style="display: inline-block; width: 162px; position: relative">';
      overlayInfo += '<div style="position: absolute; top: 0; left: 0; width: 162px; height: 22px; font-size: 18px; color: white; text-align: center">Controls</div>';
      overlayInfo += '<div style="position: absolute; top: 40px; left: 0; width: 92px"><img src="images/arrowkeys.png"></div>';
      overlayInfo += '<div style="position: absolute; top: 52px; left: 92px; width: 42px; font-size: 20px; text-align: center">+</div>';
      overlayInfo += '<div style="position: absolute; top: 72px; left: 134px; width: 28px"><img src="images/zkey.png"></div>';
      if(secondButton) {
        overlayInfo += '<div style="position: absolute; top: 72px; left: 170px; width: 28px"><img src="images/xkey.png"></div>';
      }
      overlayInfo += '</div>';
      $('#' + this.c64CanvasId + 'OverlayInfo').html(overlayInfo);
      this.overlayVisible = true;
    }
    // hide all the panels
    this.showPanel('c64-view-toggle-disassembly', false);
    this.showPanel('c64-view-toggle-scripting', false);
    this.showPanel('c64-view-toggle-colors', false);
    this.showPanel('c64-view-toggle-basic', false);

    this.showPanel('c64-view-toggle-memory', false);
    this.showPanel('c64-view-toggle-charset', false);
    this.showPanel('c64-view-toggle-sprites', false);
    this.showPanel('c64-view-toggle-bitmap', false);
    this.showPanel('c64-view-toggle-sid', false);
    this.showPanel('c64-view-toggle-drive', false);
    this.showPanel('c64-view-toggle-calc', false);
    this.showPanel('c64-view-toggle-docs', false);

    this.setPanelVisibility();

    this.resizeC64Panel();


  },


  downloadSnapshot: function() {
    if(!this.checkSnapshotDownload()) {
      alert('Sorry, snapshot download has been disabled for this content');
      return;
    }


    var ptr = c64_getSnapshot();
    var len = c64_getSnapshotSize();  
    var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); 
    download(view, 'snapshot.c64', "application/bin");       

  },
  
  loadSnapshotFile: function(file) {

    
    c64.sound.checkAudio();

    // remove pc marker from text editor
    this.removePCMarker();

    var _this = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      var snapshotData = new Uint8Array(reader.result);

      c64_reset();
      c64_loadSnapshot(snapshotData, snapshotData.length);
    };

    reader.readAsArrayBuffer(file);

    this.prgFile = file;
  },

  startPRG: function(data, inject, randomDelay) {
    var loadAddress = data[0] + (data[1] << 8);
    var endAddress = loadAddress - 2 + data.length;
/*
    if(  (loadAddress < 0x400 && endAddress > 0x400 + 1000) // screen ram
        || (loadAddress < 0xa000 && endAddress >= 0xbfff)   // basic
        || (loadAddress < 0xe000 && endAddress >= 0xffff)   // kernal
        || (loadAddress < 0xd000 && endAddress >= 0xdfff)   // i/o
      
      ) {
        */
    if( 
        
        (loadAddress < 0xe000 && endAddress >= 0xffff)   // kernal
        || (loadAddress < 0xd000 && endAddress >= 0xdfff)   // i/o
      
      ) {

        // inject
      inject = true;

    }



    c64_reset();
    var delay = 2000;
    var randomDelayEnabled = this.getRandomDelayEnabled();
    if(typeof randomDelay != 'undefined') {
      randomDelayEnabled = randomDelay;
    }

    //if(this.getRandomDelayEnabled()) {
    if(randomDelayEnabled) {
      delay = Math.random() * 100;
    }

//    delay = 0;
//    delay = 0;
    setTimeout(function() {
      c64_loadPRG(data, data.length, inject ? 1:0);

      if(inject) {
        if(loadAddress < 0x4f0 && endAddress > 0x4f0) {
          // prg has overwritten screen ram..
        } else {
          c64.insertText('run\n');
        }
        
      } else {
        setTimeout(function() {
          c64.insertText('load "*",8,1\nrun\n');
        }, 2000);
      }
    }, delay);

  },

  setPRG: function(args) {

    this.overlayVisible = false;
    if($('#' + this.c64CanvasId + 'Overlay').length > 0) {
      $('#' + this.c64CanvasId + 'Overlay').hide();
      $('#' + this.c64CanvasId + 'OverlayElements').hide();
    }

    var startC64 = false;

    c64.sound.checkAudio();
    this.removePCMarker();

    if(typeof args.startC64 != 'undefined') {
      startC64 = args.startC64;
    }

    if(startC64) {
      // want to start the c64 if it's not running
      if(!debugger_isRunning()) {
        debugger_play();
      }
    }

    var inject = this.prgLoadMethod == 'inject';
    
    if(typeof args.prgStartMethod != 'undefined') {
      inject = args.prgStartMethod == 'inject';
    }

    var randomDelay = true;
    if(typeof args.prgRandomDelay != 'undefined') {
      randomDelay = args.prgRandomDelay;
    }


    this.startPRG(args.prg, inject, randomDelay);
        
    this.prgFile = null;
    this.prgData = args.prg;

    if(typeof args.report != 'undefined') {
      this.assemblerReport = args.report;

      if(this.disassembly) {
        this.disassembly.setReport(args.report);
      }

      if(this.c64Memory) {
        this.c64Memory.setReport(args.report);
      }
    } else {
      this.assemblerReport = false;

      // clear the report
      this.disassembly.setReport({});
      this.c64Memory.setReport({});
    }

    if(this.type != 'compact') {
      // mobile needs a back link
      this.backLink = '';
      if(typeof args != 'undefined' && typeof args.backLink != 'undefined') {
        this.backLink = args.backLink;
      }

      if($('#c64BackToSource').length > 0) {
        if(this.backLink != '') {
          $('#c64BackToSource').show();
        } else {
          $('#c64BackToSource').hide();
        }
      }
    }
  },

  backToSource: function() {
    g_app.setMode('assembler');
    g_app.assemblerEditor.showFile(this.backLink);

    this.currentEditor = g_app.assemblerEditor;
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
    return c64_getSP();
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
    return c64_getVicCycle();
  },

  getRstY: function() {
    return c64_getRasterY();
  },

  getCycleCount: function(address) {
    
    return c64_getCycleCount(address);
  },

  getRstX: function() {
    //return c64_getRasterX();
    return 0;
  },



  addPCBreakpoint: function(args) {
    var address = args.address;
    for(var i = 0; i < this.pcBreakpoints.length; i++) {
      if(this.pcBreakpoints[i].address === address) {
        return;
      }
    }

    var file = false;
    var lineNumber = false;

    if(typeof args.file != 'undefined') {
      file = args.file;      
    }

    if(typeof args.lineNumber != 'undefined') {
      lineNumber = args.lineNumber;
    }
    this.pcBreakpoints.push({ 
                        "address": address, 
                        file: file,
                        lineNumber: lineNumber,
                        "enabled": true,
                      });

    c64_pcBreakpointAdd(address);

  },

  setPCBreakpointEnabled: function(args) {
    var address = args.address;
    var enabled = args.enabled;
    for(var i = 0; i < this.pcBreakpoints.length; i++) {
      if(this.pcBreakpoints[i].address === address) {
        this.pcBreakpoints[i].enabled = enabled;
      }
    }
    
    c64_pcBreakpointSetEnabled(address,  enabled ? 1 : 0);
  },

  removePCBreakpoint: function(args) {
    var address = args.address;
    var breakpointIndex = false;

    for(var i = 0; i < this.pcBreakpoints.length; i++) {
      if(this.pcBreakpoints[i].address === address) {
        breakpointIndex = i;
        break;
      }
    }

    if(breakpointIndex === false) {
      return;
    }
    this.pcBreakpoints.splice(breakpointIndex, 1);

    c64_pcBreakpointRemove(address);
  },

  clearPCBreakpoints: function() {
    var c = 0;
    while(this.pcBreakpoints.length > 0) {
      c++;
      if(c > 200) {
        break;
      }
      this.removePCBreakpoint({
        address: this.pcBreakpoints[0].address
      });
    }
  },

  getPCBreakpoints: function() {
    return this.pcBreakpoints;
  },
  


  addMemoryBreakpoint: function(args) {
    
    var address = parseInt(args.address, 10);
    var op = parseInt(args.op, 10);
    var value = parseInt(args.value, 10);


    for(var i = 0; i < this.memoryBreakpoints.length; i++) {
      if(this.memoryBreakpoints[i].address === address
         && this.memoryBreakpoints[i].op === op
         && this.memoryBreakpoints[i].value == value) {
           return;
      }
    }


    this.memoryBreakpoints.push({ "address": address, "op": op, "value": value, "enabled": 1 });

    c64_memoryBreakpointAdd(address, op, value);
  },

  setMemoryBreakpointEnabled: function(args) {
    var address = parseInt(args.address, 10);
    var op = parseInt(args.op, 10);
    var value = parseInt(args.value, 10);
    var enabled = args.enabled ? 1 : 0;

    for(var i = 0; i < this.memoryBreakpoints.length; i++) {
      if(this.memoryBreakpoints[i].address === address
         && this.memoryBreakpoints[i].op === op
         && this.memoryBreakpoints[i].value == value) {
        this.memoryBreakpoints[i].enabled = enabled;
      }
    }

    c64_memoryBreakpointSetEnabled(address, op, value, enabled);
  },

  removeMemoryBreakpoint: function(args) {
    var address = parseInt(args.address, 10);
    var op = parseInt(args.op, 10);
    var value = parseInt(args.value, 10);
    
    var breakpointIndex = false;


    for(var i = 0; i < this.memoryBreakpoints.length; i++) {
      if(this.memoryBreakpoints[i].address === address
         && this.memoryBreakpoints[i].op === op
         && this.memoryBreakpoints[i].value == value) {
        breakpointIndex = i;
        break;
      }
    }

    if(breakpointIndex === false) {
      return;
    }

    this.memoryBreakpoints.splice(breakpointIndex, 1);

    c64_memoryBreakpointRemove(address, op, value);

  },



  // raster breakpoints
  addRasterYBreakpoint: function(args) {
    var rasterY = parseInt(args.rasterY, 10);
    for(var i = 0; i < this.rasterYBreakpoints.length; i++) {
      if(this.rasterYBreakpoints[i].rasterY === rasterY) {
        return;
      }
    }
    // activated shows if has been activated
    this.rasterYBreakpoints.push({ "rasterY": rasterY, "enabled": true, "activated": false });


    c64_rasterYBreakpointAdd(rasterY);

  },

  setRasterYBreakpointEnabled: function(args) {
    var rasterY = parseInt(args.rasterY, 10);
    var enabled = args.enabled ? 1 : 0;

    for(var i = 0; i < this.rasterYBreakpoints.length; i++) {
      if(this.rasterYBreakpoints[i].rasterY === rasterY) {
        this.rasterYBreakpoints[i].enabled = enabled;
      }
    }

    c64_rasterYBreakpointSetEnabled(rasterY, enabled);
  },

  removeRasterYBreakpoint: function(args) {
    var rasterY = parseInt(args.rasterY, 10);
    var breakpointIndex = false;

    for(var i = 0; i < this.rasterYBreakpoints.length; i++) {
      if(this.rasterYBreakpoints[i].rasterY === rasterY) {
        breakpointIndex = i;
        break;
      }
    }

    if(breakpointIndex === false) {
      return;
    }
    this.rasterYBreakpoints.splice(breakpointIndex, 1);

    c64_rasterYBreakpointRemove(rasterY);
  },

  getRasterYBreakpoints: function() {
    return this.rasterYBreakpoints;
  },

  /*
  addPCBreakpoint: function(args) {

  },

  getPCBreakpoints: function() {
    return [];
  },
  */
  getMemoryBreakpoints: function() {
    return this.memoryBreakpoints;
  },


  showFile: function(path) {
    var record = g_app.doc.getDocRecord(path);
    if(!record) {
      return;
    }

    var prg = base64ToBuffer(record.data);
    this.setPRG({ prg: prg });
  },
/*
  setJoystickEnabled: function(enabled) {
    this.c64.setJoystickEnabled(enabled);
  },
*/
  toggleJoystick: function() {
    var port = this.joystickPort + 1;
    if(port > 2) {
      port = 0;
    }
    this.setJoystickPort(port);

  },

  setOnscreenJoystickPort: function(port) {
    var html = '';
    // used by onscreen joystick
    this.joystickPort = port;

  },

  joystickPush: function(direction) {
    var port = this.joystickPort - 1;
    c64_joystickPush(port, direction);

  },

  joystickRelease: function(direction) {
    var port = this.joystickPort - 1;
    c64_joystickRelease(port, direction);
  },

  keyDown: function(event) {
    if(event.key == 'z' && this.overlayVisible) {
      this.overlayClick();
    }

    var assemblerEditor = this.assemblerEditor;
    if(this.type == 'compact') {
      assemblerEditor = g_app.assemblerEditor;
    }
    
    if(this.panelVisible['assembler']) {
      // compact needs to control the assembler
      if(event.key == 'F5') {
        this.removePCMarker();
        assemblerEditor.run();
        event.preventDefault();
      }

      if(event.key == 'F6') {
        assemblerEditor.build();
        event.preventDefault();
      }
    } else if(this.panelVisible['basic']) {
      if(event.key == 'F5') {
        this.basic.run();
        event.preventDefault();
      }
    }

    if(event.key == 'F9') {
      this.play();
      event.preventDefault();
    }

    if(event.key == 'F11' || event.key == 'F10') {
      if(debugger_isRunning()) {
        debugger_pause();
      } else {
        if(event.key == 'F10') {
          this.stepOver();

        } else {
          this.stepInto();
        }
//          debugger_step();
      }
      event.preventDefault();
    }

    if(this.c64Focus && c64_ready) {
      if(c64.joystick.keyDown(event)) {
        return;
      }
      c64_keydown(event);
      event.preventDefault();
    }
  },

  keyUp: function(event) {
    if(this.c64Focus && c64_ready) {
      if(c64.joystick.keyUp(event)) {
        return;
      }
      c64_keyup(event);
      event.preventDefault();
    }
  },

  focusMachine: function() {
    this.c64Focus = true;

    UI.canProcessKeyEvents = false;

    $(this.c64CanvasId).focus();  
    if(!g_app.isMobile()) {
      if(this.onlyc64Visible) {
        $('#' + this.c64CanvasId).css('border', '2px solid transparent');

      } else {
        $('#' + this.c64CanvasId).css('border', '2px solid #3343a9');
      }
    }

  },

  exportAsHTMLPage: function() {
    if(this.exportAsHTML == null) {
      this.exportAsHTML = new C64DebuggerExportHTML();
    }

    this.exportAsHTML.show();
  },


  blurMachine: function() {
    this.c64Focus = false;

    UI.canProcessKeyEvents = true;

//    UI.setAllowBrowserEditOperations(false);
//    g_app.allowKeyShortcuts = true;
//    g_app.setAllowKeyShortcuts(false);

    if(!g_app.isMobile()) {
      $('#' + this.c64CanvasId).css('border', '2px solid #111111');
    }
  },

  getJoystickKeySymbol: function(key) {
    if(key == false || key == 'false') {
      return '';
    }

    switch(key) {
      case 'arrowup':
        return '<img src="icons/material/north-black-18dp.svg"/>';
        break;
      case 'arrowdown':
        return '<img src="icons/material/south-black-18dp.svg"/>';
        break;
      case 'arrowleft':
        return '<img src="icons/material/west-black-18dp.svg"/>';        
        break;
      case 'arrowright':
        return '<img src="icons/material/east-black-18dp.svg"/>';
        break;
      default: 
        return key;
    }
  },

  updateJoystickInfo: function() {
    var html = '';

    if(typeof c64.joystick == 'undefined') {
      return;
    }

    for(var i = 0; i < 2; i++) {

      if(c64.joystick.portEnabled[i]) {
        portNumber = i + 1;
        html += '<div style="margin-left: 8px; color: #cccccc; align-items: center">Joystick ' + portNumber + ' keys</div>';
        var keys = c64.joystick.joystickKeys[i];
        var up = keys[1];
        var down = keys[6];
        var left = keys[3];
        var right = keys[4];

        var button1 = keys[8];
        var button2 = keys[9];

        var buttonCount = c64.joystick.joystickButtons[i];

        html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(up) + '</span>';
        html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(down) + '</span>';
        html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(left) + '</span>';
        html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(right) + '</span>';
        html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(button1) + '</span>';

        if(buttonCount > 1) {
          html += '<span class="joystick-info-key">' + this.getJoystickKeySymbol(button2) + '</span>';
        }
      } 
    }

    if(html === '') {
      html += '<div style="margin-left: 8px; color: #cccccc; align-items: center">No joystick enabled</div>';
    }

    html += '<img class="joystick-settings-icon" src="icons/material/settings-black-18dp.svg"/>';
    
    $('#' + this.prefix + 'JoystickHolder').html(html);
    this.resizeC64Panel();

  },


  updateDriveLight: function() {
    var status = c1541_getStatus();

    if(status !== this.lastDriveStatus) {
      switch(status) {
//        case C64.C1541.FloppyStatus.LOAD:
        case 2:
          $('#' + this.prefix + 'DriveLight').css('background-color', '#00ff00');
        break;
//        case C64.C1541.FloppyStatus.ON:
        case 1:          
          $('#' + this.prefix + 'DriveLight').css('background-color', '#ff0000');
        break;
//        case C64.C1541.FloppyStatus.OFF:
        case 0:
          $('#' + this.prefix + 'DriveLight').css('background-color', '#333333');
        break;        
      }

      if(status != 0 && !this.driveVisible) {
//        $('#' + this.c64CanvasId + 'C64Info').show();
        $('#' + this.prefix + 'DriveInfo').show();
        this.driveVisible = true;
      }
      this.lastDriveStatus = status;


    }

//    var position = drive.getPosition();
    var position = c1541_getPosition();

    if(position !== this.lastDrivePosition) {
      $('#' + this.prefix + 'DrivePosition').html(position);
      this.lastDrivePosition = position;
    }
  },


  drawGrid: function() {

    var context = this.context;
    var height = this.canvas.height;
    var width = this.canvas.width;
    var topBorderEnd = 36;
    var sideBorderEnd = 32;

    var hOffset = 0;
    var vOffset = 0;

    var d016 = this.readByte(0xd016);
    if( (d016 & 0x8) == 0) {
      // 24 column mode
    }
    hOffset = 0;
    var scroll = d016 & 7;
    hOffset = scroll;

    var d011 = this.readByte(0xd011);
    if((d011 & 0x8) == 0) {
      
    }
    vOffset -= 3;
    scroll = d011 & 7;
    vOffset += scroll;

    context.beginPath();    
    context.lineWidth = 1;
    context.strokeStyle = '#ffffff';    
    context.globalAlpha = 0.2;        

    sideBorderEnd += hOffset;
    topBorderEnd += vOffset;
    for(var i = 0; i < 40; i++) {
      var x = (sideBorderEnd + i * 8) * this.c64Size + 0.5;
      var y = (topBorderEnd  ) * this.c64Size;
      context.moveTo(x, y);
      context.lineTo(x, y + 25 * 8 * this.c64Size);
    }

    for(var i = 0; i < 25; i++) {
//      var x = (40 + i * 8) * this.c64Size;
      var y = (topBorderEnd + i * 8) * this.c64Size + 0.5;
      context.moveTo(sideBorderEnd * this.c64Size , y);
      context.lineTo( (sideBorderEnd + 40 * 8) * this.c64Size , y);
    }

    context.stroke();
    context.globalAlpha = 1;        

    /*
    context.beginPath();    
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
    context.stroke();
    */
  },

  drawMousePosition: function() {

    if(this.mouseX === false || this.mouseY === false) {
      return;
    }

    var context = this.context;
    var height = this.canvas.height;
    var width = this.canvas.width;


    if(this.mouseInfo) {
      // draw the zoomed area
      var zoomWidth = 160;
      var zoomHeight = 160;
      var xPos = this.mouseX - (zoomWidth / 2);
      var yPos = this.mouseY - (zoomHeight / 2);

      var zoom = this.mouseZoom;
      var srcWidth = (zoomWidth / (this.c64Size * zoom));
      var srcHeight = (zoomHeight / (this.c64Size * zoom));

      var srcX = ( (this.mouseX / this.c64Size) - srcWidth / 2);
      var srcY = ( (this.mouseY / this.c64Size) - srcHeight / 2);

      this.context.drawImage(
        this.offscreenCanvas, 
        srcX, srcY, srcWidth, srcHeight,
        xPos, yPos, zoomWidth, zoomHeight
      );

      this.context.beginPath();
      this.context.strokeStyle = "#cccccc";
      this.context.rect(
        xPos - 0.5,
        yPos - 0.5,
        zoomWidth,
        zoomHeight
      );

      this.context.stroke();      

      this.context.globalAlpha = 1;

      // draw the grid in the zoom box
      if(this.grid) {

        // offsets due to scroll registers
        var hOffset = 0;
        var vOffset = 0;
    
        var d016 = this.readByte(0xd016);
        if( (d016 & 0x8) == 0) {
          // 24 column mode
        }
        hOffset = 0;
        var scroll = d016 & 7;
        hOffset = scroll;
    
        var d011 = this.readByte(0xd011);
        if((d011 & 0x8) == 0) {
          
        }
        vOffset -= 3;
        scroll = d011 & 7;
        vOffset += scroll;

        this.context.beginPath();    
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#ffffff';    
        this.context.globalAlpha = 0.2;

        var cellSize = this.c64Size * zoom * 8;
        var lines = Math.ceil(zoomWidth / cellSize);
        var xOffset = -(srcX % 8 - hOffset) * this.c64Size * zoom;
        for(var i = 0; i <= lines; i++) {
          var x = xOffset + xPos + i * cellSize + 0.5;
          var y = yPos;
          if(x > xPos && x < xPos + zoomWidth) {
            this.context.moveTo(x, y);
            this.context.lineTo(x, y + zoomHeight);
          }
        }

        lines = Math.ceil(zoomHeight / cellSize);
        var yOffset = -(srcY % 8 + 4 - vOffset) * this.c64Size * zoom;
        for(var i = 1; i <= lines; i++) {
          var x = xPos;
          var y = yOffset + yPos + i * cellSize + 0.5;
          if(y > yPos && y < yPos + zoomHeight) {
            this.context.moveTo(x, y);
            this.context.lineTo(x + zoomWidth, y);
          }
        }
        this.context.stroke();
        this.context.globalAlpha = 1;        
      }
    }


    // draw the crosshairs
    var x = this.mouseX;
    var y = this.mouseY;


    if(this.mouseInfo) {
      context.lineWidth = 1;
      context.strokeStyle = '#ffffff';    
      context.globalAlpha = 0.6;        
      context.beginPath();    
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, height);
      context.stroke();

      context.beginPath();    
      context.moveTo(0, y + 0.5);
      context.lineTo(width, y + 0.5);
      context.stroke();
      context.globalAlpha = 1;        
    }

    // draw 
    x = Math.floor(x / this.c64Size);
    y = Math.floor(y / this.c64Size);


    var xPos = x;
    var yPos = y - 36 + 50;
    var html = '';
    html = 'x: ' + x + ' (0x' + x.toString(16) + ')';
    html += 'y: ' + y + ' (0x' + y.toString(16) + ')';


    // visible starts at 15
    var rasterY = y + 15;
    if(rasterY < 0) {
      rasterY = 0;      
    }

    if(rasterY >= 312) {
      rasterY = 311;
    }
    if(!this.mouseLocked) {
      this.mouseC64X = x;
      this.mouseC64Y = y + 15;
    }
    x = x - 32;
    y = y - 36;


    var lineCycle = Math.floor(x / 8);
    if(lineCycle < 0) {
      lineCycle = 0;
    }

    if(lineCycle > 63) {
      lineCycle = 63;
    }

    var charX = Math.floor(x / 8);
    var charY = Math.floor(y / 8);

    var address = charX + charY * 40;
    var vicBase = 0;

    var vicBankStart = 0;
    /*
      $dd00
      Bits #0-#1: VIC bank. Values:
      %00, 0: Bank #3, $C000-$FFFF, 49152-65535.
      %01, 1: Bank #2, $8000-$BFFF, 32768-49151.
      %10, 2: Bank #1, $4000-$7FFF, 16384-32767.
      %11, 3: Bank #0, $0000-$3FFF, 0-16383.
    */

    var dd00 = c64_cia2ReadRegisterAt(rasterY, 0, 0x00);
    var d011 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x11);
    var d016 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x16);

    var d021 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x21) & 0xf;
    var d022 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x22) & 0xf;
    var d023 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x23) & 0xf;
    var d024 = c64_vicReadRegisterAt(rasterY, lineCycle, 0x24) & 0xf;

    c64_debugger_set_inspect_at(rasterY, lineCycle);
//    var dd00 = c64_cpuReadNS(0xdd00);


    switch(dd00 & 0x3) {
      case 0:
        vicBankStart = 49152;
        break;
      case 1:
        vicBankStart = 32768;
        break;
      case 2:
        vicBankStart = 16384;
        break;
       case 3:
         vicBankStart = 0;
         break;
    }

    // Bits #4-#7: Pointer to screen memory (bits #10-#13), relative to VIC bank, memory address $DD00
    var screenMemory = (c64_vicReadRegisterAt(rasterY, lineCycle, 0x18) & 0xf0) >> 4;


    screenMemory = screenMemory * 1024;// 0x400;

    vicBase = vicBankStart + screenMemory;

    var charMemoryAddress = vicBase + address;
    var colorMemoryAddress = 0xd800 + address;

    var char = c64_cpuReadNS(charMemoryAddress);
    var fgColor =   c64_cpuReadNS(colorMemoryAddress) & 0xf;
    //    var fgColor =  c64_vicReadAbsolute(colorMemoryAddress) & 0xf;

    this.mouseChar = char;
    this.mouseCharX = charX;
    this.mouseCharY = charY;
    this.mouseCharAddress = charMemoryAddress;
    var borderColor = c64_vicReadRegisterAt(rasterY, lineCycle, 0x20) & 0xf;

    html += ' | char x:' + charX + ', y: ' + charY + ' : ' + char + ' (0x' + charMemoryAddress.toString(16) + ')' + rasterY +  ", brdr:" + borderColor;

    if(this.eastContent == 'charset') {
      this.c64Charset.setHighlightChar(char);
    }
    
    var colorAddress = 0xd800 + address;
    html += 'colour: 0x' + colorAddress.toString(16);

    $('#' + this.c64CanvasId + 'InspectInfo').html(html);

    if(this.c64Charset && this.c64Charset.getVisible()) {
      if(this.mouseCharX >= 40 || this.mouseCharX < 0 || this.mouseCharY >=  25 || this.mouseCharY < 0) {
        charMemoryAddress = false;
        colorAddress = false;
      }
      this.c64Charset.debuggerMousePosition(charMemoryAddress, colorAddress, xPos, rasterY, fgColor, d021, char);
    }

    if(this.c64Sprites && this.c64Sprites.getVisible()) {
      this.c64Sprites.debuggerMousePosition(xPos, rasterY);
    }

    if(this.c64Bitmap && this.c64Bitmap.getVisible()) {
      this.c64Bitmap.debuggerMousePosition(xPos, rasterY, fgColor, d021, char);
    }

    if(this.mouseInfo) {
      // draw info near box
      var xPos = this.mouseX - (zoomWidth / 2);
      var yPos = this.mouseY - (zoomHeight / 2);


      var labelColor = '#999999';
      var valueColor = '#cccccc';
      var lineHeight = 18;

      // draw the dimensions
      var infoWidth = 280;
      var infoHeight = (lineHeight + 2) * 3;// 54;//18;
      var infoXPos = xPos;
      if(infoXPos < 0) {
        infoXPos = 0;
      }
      if(infoXPos + infoWidth > this.canvas.width) {
        infoXPos = this.canvas.width - infoWidth;
      }
      var infoYPos = yPos - infoHeight - 1;
      if(infoYPos < 0) {
        // put below instead
        infoYPos = yPos + zoomHeight;
      }

      this.context.globalAlpha = 0.9;
      this.context.fillStyle =  '#111111';
      this.context.fillRect(infoXPos, infoYPos,
                            infoWidth, infoHeight);

      this.context.font = "10px Verdana";
      this.context.fillStyle = "#cccccc";

                            
      infoXPos = infoXPos + 4;
      var lineStart = infoXPos;
      infoYPos = infoYPos + infoHeight - 8;
      var info = '';
      var vicBankStartHex = ("0000" + vicBankStart.toString(16)).substr(-4);

      info = '';
      info = 'bank';
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight * 2);

      infoXPos = lineStart + 40;
      info = '$' + vicBankStartHex;
      this.context.fillStyle = "#cccccc";
      this.context.fillText(info, infoXPos, infoYPos - lineHeight * 2);

      infoXPos = lineStart + 80;
      info = ' ';//mode: ';
      if(d011 & 0x20) {
        this.context.fillStyle = "#ffffcc";
        info += ' bitmap';
      } else if(d011 & 0x40) {
        this.context.fillStyle = "#ffcccc";
        info += ' extended background';
      } else {
        //info += ' char';
        if(d016 & 0x10) {
          this.context.fillStyle = "#aaffaa";
          info += ' multicolour char';
        } else {
          this.context.fillStyle = "#aaaaff";
          info += ' standard char';
        }
      }
      
      this.context.fillText(info, infoXPos, infoYPos - lineHeight * 2);


      infoXPos = lineStart;
      info = 'rsty';
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);

      infoXPos = lineStart + 24;

      info = rasterY;
      this.context.fillStyle = valueColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);

      infoXPos = lineStart + 46;
      info = 'rstx';      
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);

      infoXPos = lineStart + 70;
      var rstX = x + 0x88;
      info = rstX;      
      this.context.fillStyle = valueColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);


      infoXPos = lineStart + 104;
      info = 'sprite x,y';      
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);


      infoXPos = lineStart + 158;
      var spriteX = x + 24;
      var spriteY = rasterY - 1;
      info = spriteX + ',' + spriteY;

      info += ' ($' + ('000' + spriteX.toString(16)).substr(-3) + ', $' + ("00" + spriteY.toString(16)).substr(-2) + ')';
      this.context.fillStyle = valueColor;
      this.context.fillText(info, infoXPos, infoYPos - lineHeight);



      infoXPos = lineStart;
      this.context.fillStyle = "#cccccc";

      
      info = '';
      info += this.mouseCharX + ',' + this.mouseCharY + ' ';      
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 38;
      var screenAddress = ('0000' + this.mouseCharAddress.toString(16)).substr(-4);
      info = '';
      info += '$' + screenAddress + ' ';
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 76;
      info = 'ch';
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 90;
      info = this.mouseChar + ' $' + ('00' + this.mouseChar.toString(16)).substr(-2);// + ')';
      this.context.fillStyle = "#cccccc";
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 134;
      info = 'fg';
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 148;
      info = '$' + ('00' + fgColor.toString(16)).substr(-2);
      this.context.fillStyle = "#cccccc";
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 174;
      info = 'bg';
      this.context.fillStyle = labelColor;
      this.context.fillText(info, infoXPos, infoYPos);

      infoXPos = lineStart + 188;
      info = '$' + ('00' + d021.toString(16)).substr(-2);
      this.context.fillStyle = "#cccccc";
      this.context.fillText(info, infoXPos, infoYPos);
    }



    this.context.globalAlpha = 1;

  },


  drawRasterPosition: function() {
//    var vic = this.c64.getVIC();
    var rasterY = c64_getRasterY();// vic.rasterY;
    var rasterX = (c64_getVicCycle() ) * 8;// 0;//(vic.lineCycle - 9) * 8;

//    var context = 
    var context = this.context;
    var height = this.canvas.height;
    var width = this.canvas.width;

    rasterX = rasterX - 13 * 8;
    rasterY = rasterY - 15;

    if(this.c64Size != 1) {
//      context = this.resizeContext;
      rasterY *= this.c64Size;
      rasterX *= this.c64Size;
      height = this.canvas.height;
      width = this.canvas.width;
    }

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

    if(!this.imageData) {
      return;      
    }

    var ptr = c64_getPixelBuffer();
    var len = 384*272*4;
  
    var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
    var data = this.imageData.data;
    data.set(view);
  
    this.offscreenContext.putImageData(this.imageData, 0, 0);
    this.context.drawImage(
                            this.offscreenCanvas, 
                            0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,
                            0, 0, this.canvas.width, this.canvas.height
                          );

    if(this.grid) {                              
      this.drawGrid();
    }

    if(this.mouseX !== false && this.mouseY !== false) {
      this.drawMousePosition();      
    }                            
  },


  
  update: function() {

    if(c64_ready) {
      var time = getTimestamp();
      var dTime = g_deltaTime;// time - this.lastUpdate;
      this.lastUpdate = time;
      

      c64.joystick.checkGamepads();

      // if in middle of pasting text, call the routine to insert into buffer
      if(c64.pastingText) {
        c64.processPasteText();
      }

      if(g_app.isMobile()) {
        // check orientation

        var orientation = window.innerWidth > window.innerHeight ? 90 : 0;
        if(orientation !== this.orientation) {
          this.orientation = orientation;
          this.layoutMobile();
        }
      }


      c64_mousePosition(this.mouseC64X, this.mouseC64Y);
  
      // refresh screen if debugger says its time, or need to update if currently paused
      if(debugger_update(dTime) || !debugger_isRunning()) {

        this.redraw();

        if(this.showRaster) {
          // returns true if screen was drawn
          this.drawRasterPosition();
        }


        this.updateDriveLight();
      } 

      if(this.type == 'compact') {
        // compact only updates the panel that is currently displayed

        if(debugger_isRunning() != this.runningButtons) {
          // this prob only happened if hit breakpoint
          this.updateButtons();      
        }

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

        if(this.debuggerContent == 'bitmap') {
          this.c64Bitmap.update();
        }

        if(this.debuggerContent == 'sid') {
          
          this.c64SID.update();
        }

        if(this.debuggerContent == 'drive') {
          this.c64Drive.update();
        }
    
        this.c64Registers.update();
        this.breakpoints.update();        
      } else {
        if(!g_app.isMobile()) {
//          this.c64Memory.update();
//          this.disassembly.update();
          if(debugger_isRunning() != this.runningButtons) {
            // this prob only happened if hit breakpoint
            if(!debugger_isRunning()) {
              // maybe hit breakpoint, so do sync
              console.log('sync to source!');
              this.syncToSource();
            }
            this.updateButtons();      
          }


          if(this.eastContent == 'memory') {
            this.c64Memory.update();
          }

          if(this.eastContent == 'charset') {
            this.c64Charset.update();
          }

          if(this.eastContent == 'sprites') {
            this.c64Sprites.update();
          }

          if(this.eastContent == 'bitmap') {
            this.c64Bitmap.update();
          }
          if(this.eastContent == 'sid') {
            
            this.c64SID.update();
          }

          if(this.eastContent == 'drive') {
            this.c64Drive.update();
          }

          if(this.westContent == 'disassembly') {
            this.disassembly.update();
          }

          this.c64Registers.update();
          this.breakpoints.update();
        }
      }        
    }
  

    /*
//    this.c64.update();

    if(this.c64.update()) {

      if(this.c64Size != 1) {
        this.resizeContext.drawImage(this.canvas, 
                            0, 
                            0,
                            this.canvas.width * this.c64Size,
                            this.canvas.height * this.c64Size);
      }

      if(this.showRaster) {
        // returns true if screen was drawn
        this.drawRasterPosition();
      }
    }



    this.c64Memory.update();
    this.disassembly.update();
    this.c64Registers.update();
    this.breakpoints.update();
    this.updateDriveLight();
    */
  }


}