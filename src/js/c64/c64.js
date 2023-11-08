var c64_ready = false;
var c64_model = 'pal';
var g_c64Settings = typeof g_c64Settings == 'undefined' ?  false : g_c64Settings;

var options = {};
var c64 = C64(options);
var c64_setModel = c64.cwrap('c64_setModel', null, ['number']);
var c64_getModel = c64.cwrap('c64_getModel', 'number');


var c64_cpuRead = c64.cwrap('c64_cpuRead', 'number', ['number']);
var c64_cpuWrite = c64.cwrap('c64_cpuWrite', null, ['number','number']);
var c64_cpuReadNS = c64.cwrap('c64_cpuReadNS', 'number', ['number']);

var c64_getPC = c64.cwrap('c64_getPC', 'number');
var c64_getRegX = c64.cwrap('c64_getRegX', 'number');
var c64_getRegY = c64.cwrap('c64_getRegY', 'number');
var c64_getRegA = c64.cwrap('c64_getRegA', 'number');
var c64_getSP = c64.cwrap('c64_getSP', 'number');

var c64_getFlagN = c64.cwrap('c64_getFlagN', 'number');
var c64_getFlagC = c64.cwrap('c64_getFlagC', 'number');
var c64_getFlagD = c64.cwrap('c64_getFlagD', 'number');
var c64_getFlagZ = c64.cwrap('c64_getFlagZ', 'number');
var c64_getFlagV = c64.cwrap('c64_getFlagV', 'number');
var c64_getFlagI = c64.cwrap('c64_getFlagI', 'number');
var c64_getFlagU = c64.cwrap('c64_getFlagU', 'number');
var c64_getFlagB = c64.cwrap('c64_getFlagB', 'number');
var c64_getVicCycle = c64.cwrap('c64_getVicCycle', 'number');
var c64_getRasterY = c64.cwrap('c64_getRasterY', 'number');
var c64_getCycleCount = c64.cwrap('c64_getCycleCount','number', ['number']);


var c64_setPC = c64.cwrap('c64_setPC', null, ['number']);
var c64_setRegX = c64.cwrap('c64_setRegX', null, ['number']);
var c64_setRegY = c64.cwrap('c64_setRegY', null, ['number']);
var c64_setRegA = c64.cwrap('c64_setRegA', null, ['number']);

var c64_setFlagN = c64.cwrap('c64_setFlagN', null, ['number']);
var c64_setFlagC = c64.cwrap('c64_setFlagC', null, ['number']);
var c64_setFlagD = c64.cwrap('c64_setFlagD', null, ['number']);
var c64_setFlagZ = c64.cwrap('c64_setFlagZ', null, ['number']);
var c64_setFlagV = c64.cwrap('c64_setFlagV', null, ['number']);
var c64_setFlagI = c64.cwrap('c64_setFlagI', null, ['number']);
var c64_setFlagU = c64.cwrap('c64_setFlagU', null, ['number']);
var c64_setFlagB = c64.cwrap('c64_setFlagB', null, ['number']);


var c64_setColor = c64.cwrap('c64_setColor', null, ['number', 'number']);

var c64_vicRead = c64.cwrap('c64_vicRead', 'number', ['number']);
var c64_vicReadNS = c64.cwrap('vic_readNS', 'number', ['number']);
var c64_vicReadAbsolute = c64.cwrap('c64_vicReadAbsolute', 'number', ['number']);
var c64_vicReadRegister = c64.cwrap('c64_vicReadRegister', 'number', ['number']);

var c64_vicReadRegisterAt = c64.cwrap('vic_getRegisterAt', 'number', ['number', 'number', 'number']);

var c64_cia1ReadNS = c64.cwrap('cia1_readNS', 'number', ['number']);
var c64_cia2ReadNS = c64.cwrap('cia2_readNS', 'number', ['number']);
var c64_cia1ReadRegisterAt = c64.cwrap('cia1_getRegisterAt', 'number', ['number', 'number', 'number']);
var c64_cia2ReadRegisterAt = c64.cwrap('cia2_getRegisterAt', 'number', ['number', 'number', 'number']);

var c64_init = c64.cwrap('c64_init');
var c64_reset = c64.cwrap('c64_reset');
var c64_getPixelBuffer = c64.cwrap('c64_getPixelBuffer', 'number');

var c64_getData = c64.cwrap('c64_getData', 'number', ['array','number']);
var c64_getDataLength = c64.cwrap('c64_getDataLength', 'number');

var c64_update = c64.cwrap('c64_update');
var c64_step = c64.cwrap('c64_step');
var c64_loadPRG = c64.cwrap('c64_loadPRG', null, ['array','number','number']);
var c64_loadCRT = c64.cwrap('c64_loadCartridge', null, ['array', 'number']);
var c64_removeCartridge = c64.cwrap('c64_removeCartridge');

var c64_insertDisk = c64.cwrap('c64_insertDisk', null, ['array','number']);


var sid_dumpBuffer = c64.cwrap('sid_dumpBuffer');

var debugger_pause = c64.cwrap('debugger_pause');
var debugger_isRunning = c64.cwrap('debugger_isRunning');
var debugger_play = c64.cwrap('debugger_play');
var debugger_set_speed = c64.cwrap('debugger_set_speed');
var debugger_step = c64.cwrap('debugger_step');
var debugger_update = c64.cwrap('debugger_update','number', ['number']);

var c64_debugger_set_inspect_at = c64.cwrap('debugger_set_inspect_at',null, ['number','number']);
var c64_debugger_get_sprite_pointer = c64.cwrap('debugger_get_sprite_pointer','number',['number']);

var c64_pcBreakpointAdd = c64.cwrap('breakpoints_pcAdd', null, ['number']);
var c64_pcBreakpointSetEnabled = c64.cwrap('breakpoint_pcSetEnabled', null, ['number','number']);
var c64_pcBreakpointRemove = c64.cwrap('breakpoint_pcRemove', null, ['number']);

var c64_memoryBreakpointAdd = c64.cwrap('breakpoints_memoryAdd', null, ['number','number','number']);
var c64_memoryBreakpointSetEnabled = c64.cwrap('breakpoint_memorySetEnabled', null, ['number','number','number','number']);
var c64_memoryBreakpointRemove = c64.cwrap('breakpoint_memoryRemove', null, ['number','number','number']);

var c64_rasterYBreakpointAdd = c64.cwrap('breakpoints_rasterYAdd', null, ['number']);
var c64_rasterYBreakpointSetEnabled = c64.cwrap('breakpoint_rasterYSetEnabled', null, ['number','number']);
var c64_rasterYBreakpointRemove = c64.cwrap('breakpoint_rasterYRemove', null, ['number']);


var c64_keyPressed = c64.cwrap('keyboard_keyPressed', null, ['number']);
var c64_keyReleased = c64.cwrap('keyboard_keyReleased', null, ['number']);

var c64_joystickPush = c64.cwrap('c64_joystick_push', null, ['number', 'number']);
var c64_joystickRelease = c64.cwrap('c64_joystick_release', null, ['number', 'number']);
var c64_mousePosition = c64.cwrap('c64_mouse_position', null, ['number', 'number']);
var c64_setMousePortEnabled = c64.cwrap('c64_set_mouse_port_enabled', null, ['number', 'number']);

var c1541_setEnabled = c64.cwrap('c64_setDriveEnabled', null, ['number']);
var c1541_getStatus = c64.cwrap('c1541_getStatus', 'number');
var c1541_getPosition = c64.cwrap('c1541_getPosition', 'number');
var c1541_cpuRead = c64.cwrap('c1541_cpuRead', 'number', ['number']);
var c1541_getPC = c64.cwrap('c1541_getPC', 'number');

var c1541_getRegX = c64.cwrap('c1541_getRegX', 'number');
var c1541_getRegY = c64.cwrap('c1541_getRegY', 'number');
var c1541_getRegA = c64.cwrap('c1541_getRegA', 'number');
var c1541_getSP = c64.cwrap('c1541_getSP', 'number');

var c1541_getFlagN = c64.cwrap('c1541_getFlagN', 'number');
var c1541_getFlagC = c64.cwrap('c1541_getFlagC', 'number');
var c1541_getFlagD = c64.cwrap('c1541_getFlagD', 'number');
var c1541_getFlagZ = c64.cwrap('c1541_getFlagZ', 'number');
var c1541_getFlagV = c64.cwrap('c1541_getFlagV', 'number');
var c1541_getFlagI = c64.cwrap('c1541_getFlagI', 'number');
var c1541_getFlagU = c64.cwrap('c1541_getFlagU', 'number');
var c1541_getFlagB = c64.cwrap('c1541_getFlagB', 'number');




var sid_setModel = c64.cwrap('sid_setModel', '', ['number']);

var sid_setChannelBuffersEnabled = c64.cwrap('sid_setChannelBuffersEnabled', '', ['number']);
var sid_getAudioBuffer = c64.cwrap('sid_getAudioBuffer', 'number');
var sid_getAudioBufferCh = c64.cwrap('sid_getAudioBufferCh', 'number');
var sid_setSampleRate = c64.cwrap('sid_setSampleRate', 'number');
var sid_setVoiceEnabled = c64.cwrap('sid_setVoiceEnabled', 'number');
var sid_readNS = c64.cwrap('sid_readNS', 'number', ['number']);


var c64_getSnapshot = c64.cwrap('c64_getSnapshot', 'number');
var c64_getSnapshotSize = c64.cwrap('c64_getSnapshotSize', 'number');
var c64_loadSnapshot = c64.cwrap('c64_loadSnapshot', null, ['array','number']);

c64['onRuntimeInitialized'] = function() { 

  var model = c64_model;
  
  if(g_c64Settings !== false) {
    if(typeof g_c64Settings.model != 'undefined') {
      model = g_c64Settings.model;
    }
  }

  if(model == 'pal') {
    c64_setModel(1);
  } else if(model == 'ntsc') {
    c64_setModel(2);
  }

  c64_init();

  c64.pastingText = false;
  c64.textToPaste = [];

//  c64.scripting = new C64Scripting();
  c64.colors = new C64Colors();
  c64.colors.init();

  c64.joystick = new C64Joystick();
  c64.joystick.init();


  c64.sound = new C64Sound();
  c64.sound.init();

  if(g_c64Settings !== false) {
    c64.setSettings();

  }

  c64_ready = true;
  c64.colors.setAllColors();

  if(typeof onC64Ready != 'undefined') {
    onC64Ready();
  }
}

c64.setSettings = function() {
  if(typeof g_c64Settings.colors != 'undefined' && typeof g_c64Settings.colors.length != 'undefined') {
    if(g_c64Settings.colors.length == 16) {
      for(var i = 0; i < g_c64Settings.colors[i]; i++) {
        c64.colors.setColor(i, g_c64Settings.colors[i]);
      }
    }
  }

  if(typeof g_c64Settings.port1 != 'undefined') {
    c64.joystick.setPortEnabled(1, g_c64Settings.port1);
  }

  if(typeof g_c64Settings.port2 != 'undefined') {
    c64.joystick.setPortEnabled(2, g_c64Settings.port2);
  }

  if(typeof g_c64Settings.port1Buttons != 'undefined') {
    c64.joystick.setJoystickButtons(0, g_c64Settings.port1Buttons);
  }

  if(typeof g_c64Settings.port2Buttons != 'undefined') {
    c64.joystick.setJoystickButtons(1, g_c64Settings.port2Buttons);
  }

  if(typeof g_c64Settings.port1Button1Action != 'undefined') {
    c64.joystick.setJoystickButtonAction(0, 1, g_c64Settings.port1Button1Action);
  }

  if(typeof g_c64Settings.port2Button1Action != 'undefined') {
    c64.joystick.setJoystickButtonAction(1, 1, g_c64Settings.port2Button1Action);
  }

  if(typeof g_c64Settings.mousePort1 != 'undefined') {
    c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
  }

  if(typeof g_c64Settings.mousePort2 != 'undefined') {
    c64.joystick.setMousePortEnabled(2, g_c64Settings.mousePort2);
  }

  for(var i = 0; i < 2; i++) {
    var port = i + 1;

    if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {

      c64.joystick.setPortEnabled(port, true);

      if(typeof g_c64Settings['port' + port + 'buttons'] != 'undefined') {
        var buttons = parseInt(g_c64Settings['port' + port + 'buttons'], 10);
        c64.joystick.setJoystickButtons(i, buttons);
        
      }

      if(typeof g_c64Settings['port' + port + 'buttonactions'] != 'undefined' && typeof g_c64Settings['port' + port + 'buttonactions'].length != 'undefined') {
        var action = g_c64Settings['port' + port + 'buttonactions'][1];
        c64.joystick.setJoystickButtonAction(i, 1, action);
      }
        
    }
/*      
    if(typeof g_c64Settings['mousePort' + port] != 'undefined') {
//        c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
    }
*/  
  }

  if(typeof g_c64Settings.sid != 'undefined') {
    c64.sound.setModel(g_c64Settings.sid);
  }
}


c64.insertScreenCodes = function(screenCodes) {
  c64.textToPaste = [];
  for(var i = 0; i < screenCodes.length; i++) {
    c64.textToPaste.push(screenCodes[i]);
  }

  c64.processPasteText();
}

// http://sta.c64.org/cbm64pet.html
http://retro64.altervista.org/blog/commodore-64-keyboard-buffer-tricks-deleting-and-creating-basic-lines-from-basic/

c64.insertText = function(text) {

  //var keycodes = [];
  c64.textToPaste = [];
  text = text.toUpperCase();

//  text = text.replace("\r\n", "\n");
  text = text.split("\r\n").join("\n");
    
  for(var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    switch(code) {
      case 10:
        code = 13;
        break;
    }
    c64.textToPaste.push(code);
  }

  c64.processPasteText();
}

c64.processPasteText = function() {


  if(c64.textToPaste.length == 0) {
    c64.pastingText = false;
  }

  c64.pastingText = true;
  // check if buffer is empty yet
  var bufferLength = c64_cpuRead(0xc6);
  if(bufferLength != 0) {
    // still waiting for buffer to empty
    return;
  }

  // address of keyboard buffer
  var bufferAddress = 0x277;

  var textLength = c64.textToPaste.length;
  var index = 0;

  var bufferLength = textLength;
  if(bufferLength > 8) {
    bufferLength = 8;
  }

  // write text into buffer
  c64_cpuWrite(0xc6, bufferLength);
  for(var i = 0; i < bufferLength; i++) {
    var keyCode = c64.textToPaste.shift();
    c64_cpuWrite(bufferAddress++, keyCode);
  }

  if(c64.textToPaste.length == 0) {
    c64.pastingText = false;
  }

}

  /*
  // time to increment by before checking buffer again
  var dTime = 5;

  while(textLength > 0) {
    var bufferLength = textLength;
    if(bufferLength > 8) {
      bufferLength = 8;
    }
    textLength -= bufferLength;

    address = 0x277;
//    pla.cpuWrite(0xc6, bufferLength);

    // write text into buffer
    c64_cpuWrite(0xc6, bufferLength);
    for(var i = 0; i < bufferLength; i++) {
//      pla.cpuWrite(address++, keycodes[index++]);
      c64_cpuWrite(address++, keycodes[index++]);
    }

    // wait until buffer goes to 0 length
    var count = 0;
    while(true) {
      count++;
      if(count > 20) {
        console.log('count too big!');
        break;
      }
//        eventScheduler.clock();
      debugger_update(dTime)
      bufferLength = c64_cpuRead(0xc6);
      if(bufferLength == 0) {
        break;
      }
    }

    console.log('buffer is zero!');
  }
}
*/



var C64_KEY_ARROW_LEFT = 0;
var C64_KEY_ONE = 1;
var C64_KEY_TWO = 2;
var C64_KEY_THREE = 3;
var C64_KEY_FOUR = 4;
var C64_KEY_FIVE = 5;
var C64_KEY_SIX = 6;
var C64_KEY_SEVEN = 7;
var C64_KEY_EIGHT = 8;
var C64_KEY_NINE = 9;
var C64_KEY_ZERO = 10;
var C64_KEY_PLUS = 11;
var C64_KEY_MINUS = 12;
var C64_KEY_POUND = 13;
var C64_KEY_CLEAR_HOME = 14;
var C64_KEY_INS_DEL = 15;
var C64_KEY_CTRL = 16;
var C64_KEY_Q = 17;
var C64_KEY_W = 18;
var C64_KEY_E = 19;
var C64_KEY_R = 20;
var C64_KEY_T = 21;
var C64_KEY_Y = 22;
var C64_KEY_U = 23;
var C64_KEY_I = 24;
var C64_KEY_O = 25;
var C64_KEY_P = 26;
var C64_KEY_AT = 27;
var C64_KEY_STAR = 28;
var C64_KEY_ARROW_UP = 29;
var C64_KEY_RUN_STOP = 30;
var C64_KEY_A = 31;
var C64_KEY_S = 32;
var C64_KEY_D = 33;
var C64_KEY_F = 34;
var C64_KEY_G = 35;
var C64_KEY_H = 36;
var C64_KEY_J = 37;
var C64_KEY_K = 38;
var C64_KEY_L = 39;
var C64_KEY_COLON = 40;
var C64_KEY_SEMICOLON = 41;
var C64_KEY_EQUALS = 42;
var C64_KEY_RETURN = 43;
var C64_KEY_COMMODORE = 44;
var C64_KEY_SHIFT_LEFT = 45;
var C64_KEY_Z = 46;
var C64_KEY_X = 47;
var C64_KEY_C = 48;
var C64_KEY_V = 49;
var C64_KEY_B = 50;
var C64_KEY_N = 51;
var C64_KEY_M = 52;
var C64_KEY_COMMA = 53;
var C64_KEY_PERIOD = 54;
var C64_KEY_SLASH = 55;
var C64_KEY_SHIFT_RIGHT = 56;
var C64_KEY_CURSOR_UP_DOWN = 57;
var C64_KEY_CURSOR_LEFT_RIGHT = 58;
var C64_KEY_SPACE = 59;
var C64_KEY_F1 = 60;
var C64_KEY_F3 = 61;
var C64_KEY_F5 = 62;
var C64_KEY_F7 = 63;
var C64_KEY_RESTORE = 64;

var C64_JOYSTICK_UP = 0x1;
var C64_JOYSTICK_DOWN = 0x2;
var C64_JOYSTICK_LEFT = 0x4;
var C64_JOYSTICK_RIGHT = 0x8;
var C64_JOYSTICK_FIRE = 0x10;


var keyDownMap = {};
var joystickEnabled = true;



function shiftedKey(index, keyCode, eventType) {

  if(eventType == 'keydown') {
    c64_keyPressed(C64_KEY_SHIFT_LEFT);
  } else {
    c64_keyReleased(C64_KEY_SHIFT_LEFT);
  }
  if(eventType == 'keyup') {
    index = keyDownMap['kc' + keyCode];
  }
  return index;
}

function nonShiftedKey(index) {
  c64_keyReleased(C64_KEY_SHIFT_LEFT);
  c64_keyReleased(C64_KEY_SHIFT_RIGHT);

  return index;
}

function keyCodeToMatrixIndex(keyCode, e) {
    var eventType = e.type.toLowerCase();
    var index = false;

    if(eventType == 'keydown') {
      if(e.shiftKey) {
//        var kte = C64.KeyTableEntry["matrix"][C64.KeyTableEntry["SHIFT_LEFT"]];
//        this.c64.keyboard.keyPressed(kte);        
        c64_keyPressed(C64_KEY_SHIFT_LEFT); 
      } else {
        
        if(keyCode != 38 && keyCode != 37) {
          // if keycode not up or left
          c64_keyReleased(C64_KEY_SHIFT_RIGHT);
          c64_keyReleased(C64_KEY_SHIFT_LEFT);

          /*
          var kte = C64.KeyTableEntry["matrix"][C64_KEY_SHIFT_RIGHT];
          this.c64.keyboard.keyReleased(kte);        
          var kte = C64.KeyTableEntry["matrix"][C64_KEY_SHIFT_LEFT];
          this.c64.keyboard.keyReleased(kte);        
          */
        }

      }

      if(typeof keyDownMap['kc' + keyCode] != 'undefined' && keyDownMap['kc' + keyCode] !== false) {
        return false;
      }
    }

    e.preventDefault();

    if(typeof e.key != 'undefined') {

      var key = e.key.toLowerCase();

      switch(key) {
        case 'enter': // enter
          index = 43;
        break;
        case ' ': // space
          index = 59;
        break;
        case '`': // `
          index = C64_KEY_ARROW_LEFT;
          break;
        case '~':
          index = C64_KEY_ARROW_UP;
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
        break;
        case '1':  // 1
          index = 1;
        break;
        case '2':  // 2
          index = 2;
        break;
        case '3': //3
          index = 3;
        break;
        case '4':  //4
          index = 4;
        break;
        case '5': //5
          index = 5;
        break;
        case '6':  //6
          index = 6;
        break;
        case '7':  //7
          index = 7;
        break;
        case '8':  //8
          index = 8;
        break;
        case '9':  //9
          index = 9;
        break;
        case '0'://0
          index = 10;
        break;

        case '\\': // \
          index = C64_KEY_POUND;
        break;

        case '-': // -
         index = 12;
        break;


        case 'backspace': // ins delete
        case 'delete':
          index = 15;
        break;

        case 'tab': // tab
          index = C64_KEY_CTRL;
        break;
        case 'control': // ctrl
          index = C64_KEY_COMMODORE;
        break;
        case 'q': // q
          index = 17;
        break;
        case 'w': // w
          index = 18;
        break;
        case 'e': // e
          index = 19;
        break;
        case 'r': // r
          index = 20;
        break;
        case 't': // t
          index = 21;
        break;      
        case 'y': // y
          index = 22;
        break;
        case 'u': // u
          index = 23;
        break;
        case 'i':  // i
          index = 24;
        break;
        case 'o':  //o 
          index = 25;
        break;
        case 'p': // p
          index = 26;
        break;

        case 'escape': // escape
          index = 30;
        break;


        case 'a': // a
          index = 31;
        break;
        case 's': // s
          index = 32;
        break;
        case 'd': // d
          index = 33;
        break;
        case 'f': // f
          index = 34;
        break;
        case 'g': // g
          index = 35;
        break;
        case 'h': // h
          index = 36;
        break;
        case 'j': // j
          index = 37;
        break;
        case 'k': // k
          index = 38;
        break;
        case 'l': // l
          index = 39;
        break;
        case ':':
          index = C64_KEY_COLON;
          if(eventType == 'keydown') {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
            c64_keyReleased(C64_KEY_SHIFT_RIGHT);
          }
        break;
        case ';':
          index = C64_KEY_SEMICOLON;
        break;

        case '[':
          index = C64_KEY_COLON;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

          break;
        case ']':
          index = C64_KEY_SEMICOLON;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

          break;


        case '=':
          index = 42;
        break;

        case 'capslock':
          index = 44;
        break;

        case 'z': // z
          index = 46;
        break;
        case 'x': // x
          index = 47;
        break;
        case 'c': // c
          index = 48;
        break;
        case 'v': // v
          index = 49;
        break;
        case 'b': // b
          index = 50;
        break;
        case 'n': // n
          index = 51;
        break;
        case 'm': // m
          index = 52;
        break;

        case ',': // ,
        case '<':
          index = C64_KEY_COMMA;
        break;

        case '.': // .
        case '>':
          index = C64_KEY_PERIOD;
        break;

        case '/':
        case '?':
          index = C64_KEY_SLASH;
        break;


        case 'arrowup': // up          
          index = C64_KEY_CURSOR_UP_DOWN;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'arrowdown': // down
          index = C64_KEY_CURSOR_UP_DOWN;
        break;
        case 'arrowleft': // left
          index = C64_KEY_CURSOR_LEFT_RIGHT;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'arrowright':  // right
          index = C64_KEY_CURSOR_LEFT_RIGHT;

        break;

        case '!':
          index = shiftedKey(C64_KEY_ONE, keyCode, eventType);
/*
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
*/
          break;

        case '"':
          index = shiftedKey(C64_KEY_TWO, keyCode, eventType);
          /*
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
          */
          break;
        case '#':
          index = shiftedKey(C64_KEY_THREE, keyCode, eventType);
          break;
        case '$':
          index = shiftedKey(C64_KEY_FOUR, keyCode, eventType);
          /*
          index = C64_KEY_FOUR;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
          */
          break;

        case '%': 
          index = shiftedKey(C64_KEY_FIVE, keyCode, eventType);
        break;

        case '&':
          index = shiftedKey(C64_KEY_SIX, keyCode, eventType);
          break;

        case "'":
          index = shiftedKey(C64_KEY_SEVEN, keyCode, eventType);          
          break;

        case '(':
          index = shiftedKey(C64_KEY_EIGHT, keyCode, eventType);          
          break;
        case ')':
          index = shiftedKey(C64_KEY_NINE, keyCode, eventType);          
        break;


        
        case '@':
          index = nonShiftedKey(C64_KEY_AT);
        break;

        case '^':
          index = nonShiftedKey(C64_KEY_ARROW_UP);
        break;

        case '*': 
          index = nonShiftedKey(C64_KEY_STAR);
        break;
        case '+': 
          index = nonShiftedKey(C64_KEY_PLUS);
        break;


        case 'f1': // f1
          index = C64_KEY_F1;
        break;
        case 'f2': // f2
          index = C64_KEY_F1;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'f3': // f3
          index = C64_KEY_F3;
        break;
        case 'f4': // f4
          index = C64_KEY_F3;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'f5': // f5
          index = C64_KEY_F5;
        break;
        case 'f6': // f6
          index = C64_KEY_F5;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);

          }

        break;
        case 'f7': // f7
          index = C64_KEY_F7;
        break;
        case 'f8': // f8
          index = C64_KEY_F7;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
        break;
        case 'shift': // shift left
          index = 45;
        break;

      }
    }

    if(eventType == 'keydown') {
      keyDownMap['kc' + keyCode] = index;
    } else {
      keyDownMap['kc' + keyCode] = false;
    }


    return index;
  }


function c64_keydown(e) {
  e.preventDefault();

  var keyCode = e.keyCode;
  var matrixIndex = this.keyCodeToMatrixIndex(keyCode, e);
  if(matrixIndex === false) {
    return;
  }
  c64_keyPressed(matrixIndex);

}

function c64_keyup(e) {
  e.preventDefault();

  var keyCode = e.keyCode;
  var matrixIndex = this.keyCodeToMatrixIndex(keyCode, e);
  if(matrixIndex === false) {
    return;
  }
  c64_keyReleased(matrixIndex);

}


// emscripten functions


// start of new frame
function c64_frame() {
//  g_app.assemblerEditor.debuggerCompact.scripting.scriptProcessor.triggerEvent('c64.frame');
  if(c64.scripting) {
    c64.scripting.scriptProcessor.triggerEvent('c64.frame');
  }
}

function c64_rasterY(rasterY) {

  if(c64.scripting) {
//    c64.scripting.scriptProcessor.triggerEvent('c64.rastery');
  }
}