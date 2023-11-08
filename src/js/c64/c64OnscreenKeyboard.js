


var C64OnscreenKeyboard = function() {
  this.debugger = null;
  this.fontImage = null;
  this.fontCanvas = null;

  this.keyPositions = [];
  this.deletePosition = {};

  this.keyIndexDown = false;

  this.keysDown = [];
  this.touchUsed = [];

  this.id = 'c64-onscreen-keyboard';
}

var C64_KEY_NONE = -1;

C64OnscreenKeyboard.prototype = {
  init: function(args) {
    this.debugger = args.debugger;
    this.initKeyboard();
  },

  getHTML: function() {
    var html = '<div style="text-align: center; position: absolute; top: 0; bottom: 0; left: 0; right: 0" id="' + this.id + '">';
    html +=  '<canvas id="c64OnscreenKeyboardCanvas" style="background-color: #440000"></canvas>'
    html += '</div>';
    return html;
  },


  buildInterface: function(parentPanel) {
    var html = this.getHTML();

    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "c64OnscreenKeyboard", "html": html });
    parentPanel.add(this.uiComponent);
    this.initEvents();
    this.loadFont();

  },

  loadFont: function() {
    var _this = this;
    this.fontImage = new Image();
    this.fontImage.onload = function() {
      _this.createFontCanvas();
    }
    this.fontImage.src = c64keycharsImageData;//'images/c64keychars.png';

  },

  createFontCanvas: function() {
    var width = this.fontImage.naturalWidth;
    var height = this.fontImage.naturalHeight;

    this.fontCanvas = document.createElement('canvas');
    this.fontCanvas.width = width;
    this.fontCanvas.height = height;
    this.fontContext = this.fontCanvas.getContext('2d');

    this.fontContext.drawImage(this.fontImage, 0, 0, width, height);
    this.draw();

  },

  initEvents: function() {

    this.canvas = document.getElementById('c64OnscreenKeyboardCanvas');

    if(typeof $ != 'undefined') {
      $('#c64OnscreenKeyboardCanvas').on('contextmenu', function(e) {
        e.preventDefault();
      });
    }

    var _this = this;

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, false);
 

    this.canvas.addEventListener("touchstart", function(event){
      event.preventDefault();
      _this.touchStart(event);


    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      _this.touchMove(event);
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      event.preventDefault();
      _this.touchEnd(event);
    }, false);    
  },

  processStartTouches: function(touches) {

    // these are all new touches

    var keyWasShift = false;

    var keysDown = [];
    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      for(var i = 0; i < this.keyPositions.length; i++) {
        var keyX = this.keyPositions[i].x;
        var keyY = this.keyPositions[i].y;
        var keyWidth = this.keyPositions[i].width;
        var keyHeight = this.keyPositions[i].height;

        if(x > keyX && x < keyX + keyWidth
           && y > keyY && y < keyY + keyHeight) {
          var keyIndex = this.keyPositions[i].keyIndex;

          if(keyIndex === C64_KEY_SHIFT_LEFT 
             || keyIndex === C64_KEY_SHIFT_RIGHT) {
            keyWasShift = false;
          }

          keysDown.push({keyIndex: keyIndex, identifier: touch.identifier});
          break;        
        }
      }
    }


    // check if shift is already down
    var shiftIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_SHIFT_LEFT 
         || this.keysDown[j] === C64_KEY_SHIFT_RIGHT) {
        shiftIsDown = true;
        break;
      }
    }

    var commodoreIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_COMMODORE ) {
        commodoreIsDown = true;
        break;
      }
    }

    var ctrlIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_CTRL ) {
        ctrlIsDown = true;
        break;
      }
    }



    // transfer the keys to this.keysdown
    for(var i = 0; i < keysDown.length; i++) {
      var keyIndex = keysDown[i].keyIndex;
      var found = false;
      var foundIndex = false;
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] == keysDown[i].keyIndex) {
          found = true;
          foundIndex = j;
          break;
        }
      }

      if(!found) {
        this.keyDown(keysDown[i].keyIndex);
        this.keysDown.push(keysDown[i].keyIndex);
      }

      /*
      // if shift is down and its pressed again, then release it
      if(found 
          && (keyIndex === C64_KEY_SHIFT_LEFT
              || keyIndex === C64_KEY_SHIFT_RIGHT)) {
        this.keysDown.splice(foundIndex, 1);          
        this.keyUp(keyIndex);
      }
      */
    }


    this.releaseShiftLeft = false;
    this.releaseShiftRight = false;
    this.releaseCommodore = false;
    this.releaseCtrl = false;

    if(shiftIsDown) {
      // release shift key if it was down
      // prob dont want to release if still touch on shift
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_SHIFT_LEFT) {
          this.releaseShiftLeft = true;
          this.keysDown.splice(j, 1);
          j = 0;
        }
        if(this.keysDown[j] === C64_KEY_SHIFT_RIGHT) {
          this.releaseShiftRight = true;
          this.keysDown.splice(j, 1);
          j = 0;
        }
      }
    }

    if(commodoreIsDown) {
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_COMMODORE) {
          this.releaseCommodore = true;
          this.keysDown.splice(j, 1);          
          break;
        }
      }
    }

    if(ctrlIsDown) {
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_CTRL) {
          this.releaseCtrl = true;
          this.keysDown.splice(j, 1);          
          break;
        }
      }
    }


  },

  // called on touch move and touch end
  processTouches: function(touches) {

    var keysDown = [];
    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;



      for(var i = 0; i < this.keyPositions.length; i++) {
        var keyX = this.keyPositions[i].x;
        var keyY = this.keyPositions[i].y;
        var keyWidth = this.keyPositions[i].width;
        var keyHeight = this.keyPositions[i].height;

        if(x > keyX && x < keyX + keyWidth
           && y > keyY && y < keyY + keyHeight) {
          var keyIndex = this.keyPositions[i].keyIndex;

          if(keyIndex !== C64_KEY_SHIFT_LEFT 
             && keyIndex !== C64_KEY_SHIFT_RIGHT 
             && keyIndex !== C64_KEY_COMMODORE
             && keyIndex !== C64_KEY_CTRL) {
            keysDown.push({keyIndex: keyIndex, identifier: touch.identifier});
          }
          break;        
        }
      }
    }

    // find the differences..

    var currentKeys = [];

    // first which keys released
    for(var i = 0; i < this.keysDown.length; i++) {

      if(this.keysDown[i] !== C64_KEY_SHIFT_LEFT 
         && this.keysDown[i] !== C64_KEY_SHIFT_RIGHT
         && this.keysDown[i] !== C64_KEY_COMMODORE
         && this.keysDown[i] !== C64_KEY_CTRL) {
        var found = false;
        for(var j = 0; j < keysDown.length; j++) {
          if(this.keysDown[i] == keysDown[j].keyIndex) {
            found = true;
            break;
          }
        }

        if(!found) {
          this.keyUp(this.keysDown[i]);
        } else {
          currentKeys.push(this.keysDown[i]);
        }
      } else {
        // if shift is down, keep it down
        currentKeys.push(this.keysDown[i]);
        
      }
    }

    this.keysDown = currentKeys;


    /*

    // now which keys pressed
    for(var i = 0; i < keysDown.length; i++) {
      var found = false;
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] == keysDown[i].keyIndex) {
          found = true;
          break;
        }
      }

      if(!found) {
        this.keyDown(keysDown[i].keyIndex);
      }
    }

    this.keysDown = [];
    for(var i = 0; i < keysDown.length; i++) {
      this.keysDown.push(keysDown[i].keyIndex);
    }

    */
//    this.keysDown = keysDown;


  },

  keyDown: function(keyIndex) {
    c64_keyPressed(keyIndex);
  },


  keyUp: function(keyIndex) {
    c64_keyReleased(keyIndex);

  },

  touchStart: function(event) {
    var touches = event.touches;
    this.processStartTouches(event.changedTouches);
    this.draw();

  },

  touchMove: function(event) {
    this.processTouches(event.touches);
    this.draw();
  },

  touchEnd: function(event) {
    this.processTouches(event.touches);

    if(this.releaseCommodore) {
      this.keyUp(C64_KEY_COMMODORE);
      this.releaseCommodore = false;
    }

    if(this.releaseCtrl) {
      this.keyUp(C64_KEY_CTRL);
      this.releaseCtrl = false;
    }

    // check if also need to release shift
    if(this.releaseShiftLeft) {
      this.keyUp(C64_KEY_SHIFT_LEFT);
      this.releaseShiftLeft = false;
    }

    if(this.releaseShiftRight) {
      this.keyUp(C64_KEY_SHIFT_RIGHT);
      this.releaseShiftRight = false;
    }


    this.draw();

  },

  initKeyboard: function() {

    this.petsciiKeyboardFull = [
      [ 
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  

        { width: 1, keyIndex: C64_KEY_ONE,        charCode: 49,  shiftedCode: 33, altCode: -1, colorCode: 0 },   // 1
        { width: 1, keyIndex: C64_KEY_TWO,        charCode: 50,  shiftedCode: 34, altCode: -1, colorCode: 1 },   // 2
        { width: 1, keyIndex: C64_KEY_THREE,      charCode: 51,  shiftedCode: 35, altCode: -1, colorCode: 2 },   // 3
        { width: 1, keyIndex: C64_KEY_FOUR,       charCode: 52,  shiftedCode: 36, altCode: -1, colorCode: 3 },   // 4
        { width: 1, keyIndex: C64_KEY_FIVE,       charCode: 53,  shiftedCode: 37, altCode: -1, colorCode: 4 },   // 5
        { width: 1, keyIndex: C64_KEY_SIX,        charCode: 54,  shiftedCode: 38, altCode: -1, colorCode: 5 },   // 6
        { width: 1, keyIndex: C64_KEY_SEVEN,      charCode: 55,  shiftedCode: 39, altCode: -1, colorCode: 6 },   // 7
        { width: 1, keyIndex: C64_KEY_EIGHT,      charCode: 56,  shiftedCode: 40, altCode: -1, colorCode: 7 },   // 8
        { width: 1, keyIndex: C64_KEY_NINE,       charCode: 57,  shiftedCode: 41, altCode: -1 },   // 9
        { width: 1, keyIndex: C64_KEY_ZERO,       charCode: 48,  shiftedCode: 42, altCode: -1 },   // 0
        { width: 1, keyIndex: C64_KEY_PLUS,       charCode: 43,  shiftedCode: 95, altCode: -1 },  // -
        { width: 1, keyIndex: C64_KEY_MINUS,      charCode: 45,  shiftedCode: 43, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_POUND,      charCode: 28,  shiftedCode: 43, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace
      ],


      [ 
        { width: 1.5, keyIndex: 9, charCode: -1, shiftedCode: -1, altCode: -1 },  // tab
        { width: 1, keyIndex: C64_KEY_Q, charCode: 17,  shiftedCode: 81, altCode: 195 }, //q
        { width: 1, keyIndex: C64_KEY_W, charCode: 23,  shiftedCode: 87, altCode: 180 }, //w
        { width: 1, keyIndex: C64_KEY_E, charCode: 5,  shiftedCode: 69, altCode: 193 }, //e
        { width: 1, keyIndex: C64_KEY_R, charCode: 18,  shiftedCode: 82, altCode: 194 }, //r
        { width: 1, keyIndex: C64_KEY_T, charCode: 20,  shiftedCode: 84, altCode: 204 }, //t
        { width: 1, keyIndex: C64_KEY_Y, charCode: 25,  shiftedCode: 89, altCode: 185 }, //y
        { width: 1, keyIndex: C64_KEY_U, charCode: 21,  shiftedCode: 85, altCode: 202 }, //u
        { width: 1, keyIndex: C64_KEY_I, charCode: 9,  shiftedCode: 73, altCode: 203 }, //i
        { width: 1, keyIndex: C64_KEY_O, charCode: 15,  shiftedCode: 79, altCode: -1 }, //o
        { width: 1, keyIndex: C64_KEY_P, charCode: 16,  shiftedCode: 80, altCode: -1 }, //p
        { width: 1, keyIndex: C64_KEY_AT, charCode: 0, shiftedCode: 123, altCode: -1 }, //[
        { width: 1, keyIndex: C64_KEY_STAR, charCode: 42, shiftedCode: 125, altCode: -1 }, //]
        { width: 1.5, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 124, altCode: -1 } //
      ],

      [ 
        { width: 1.75, keyIndex: C64_KEY_RUN_STOP, charCode: -1, shiftedCode: -1 }, // caps lock
        { width: 1, keyIndex: C64_KEY_A, charCode: 1, shiftedCode: 65, altCode: 218 },  // a
        { width: 1, keyIndex: C64_KEY_S, charCode: 19, shiftedCode: 83, altCode: 191 },  // s
        { width: 1, keyIndex: C64_KEY_D, charCode: 4, shiftedCode: 68, altCode: 179 },  // d
        { width: 1, keyIndex: C64_KEY_F, charCode: 6, shiftedCode: 70, altCode: 196 },  // f
        { width: 1, keyIndex: C64_KEY_G, charCode: 7, shiftedCode: 71, altCode: 201 },  // g
        { width: 1, keyIndex: C64_KEY_H, charCode: 8, shiftedCode: 72, altCode: 187 },  // h
        { width: 1, keyIndex: C64_KEY_J, charCode: 10, shiftedCode: 74, altCode: 186 },  // j
        { width: 1, keyIndex: C64_KEY_K, charCode: 11, shiftedCode: 75, altCode: 205 },  // k
        { width: 1, keyIndex: C64_KEY_L, charCode: 12, shiftedCode: 76, altCode: 195 },  // l
        { width: 1, keyIndex: C64_KEY_COLON, charCode: 58, shiftedCode: 58, altCode: 195 }, // ;
        { width: 1, keyIndex: C64_KEY_SEMICOLON, charCode: 59, shiftedCode: 34, altCode: 195 }, // '
        { width: 1, keyIndex: C64_KEY_EQUALS, charCode: 61, shiftedCode: 34, altCode: 195 }, // '
        { width: 1.25, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter
      ],

      [ 
        { width: 2.25, keyIndex: C64_KEY_SHIFT_LEFT, charCode: -1, shiftedCode: -1 }, // left shift
        { width: 1, keyIndex: C64_KEY_Z,      charCode: 26, shiftedCode: 90, altCode: 192 },  // z
        { width: 1, keyIndex: C64_KEY_X,      charCode: 24, shiftedCode: 88, altCode: 217 },  // x
        { width: 1, keyIndex: C64_KEY_C,      charCode: 3, shiftedCode: 67, altCode: 197 },  // c
        { width: 1, keyIndex: C64_KEY_V,      charCode: 22, shiftedCode: 86, altCode: 195  },  // v
        { width: 1, keyIndex: C64_KEY_B,      charCode: 2, shiftedCode: 66, altCode: 200 },  // b
        { width: 1, keyIndex: C64_KEY_N,      charCode: 14, shiftedCode: 78, altCode: 188 },  // n
        { width: 1, keyIndex: C64_KEY_M,      charCode: 13, shiftedCode: 77, altCode: 206 },  // m
        { width: 1, keyIndex: C64_KEY_COMMA,  charCode: 44, shiftedCode: 60, altCode: 195 }, // ,
        { width: 1, keyIndex: C64_KEY_PERIOD, charCode: 46, shiftedCode: 62, altCode: 195 }, // .
        { width: 1, keyIndex: C64_KEY_SLASH,  charCode: 47, shiftedCode: 63, altCode: 195 }, // /
        { width: 2.75, keyIndex: C64_KEY_SHIFT_RIGHT, charCode: -1, shiftedCode: -1 }  // right shift
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_COMMODORE, charCode: -1 }, // left ctrl
        { width: 1.25, keyIndex: 91 }, // left windows
        { width: 1.5, keyIndex: 18 },  // left alt
        { width: 6.5, keyIndex: C64_KEY_SPACE, charCode: 32, shiftedCode: 32, altCode: 32 }, // space
        { width: 1.5, keyIndex: 18 },  // right alt
        { width: 1.25, keyIndex: 92 },  // right windows
        { width: 1.5, keyIndex: 17 }   // right ctrl
      ]    
    ];

    this.petsciiKeyboardSmall = [

      [ 
        /*
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  
        */
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 31, altCode: -1  },  // `  
        { width: 1, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 94, altCode: -1 }, //

        { width: 1.5, keyIndex: C64_KEY_F1, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 0 },   // 1
        { width: 1.5, keyIndex: C64_KEY_F3, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 1 },   // 2
        { width: 1.5, keyIndex: C64_KEY_F5, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 2 },   // 3
        { width: 1.5, keyIndex: C64_KEY_F7, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4
        { width: 2, keyIndex: C64_KEY_RESTORE, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4

        { width: 2, keyIndex: C64_KEY_INS_DEL, charCode: -1,  shiftedCode: -1, altCode: -1 },  // =
/*        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace */

      ],

      [ 
        /*
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  
        */
        { width: 1, keyIndex: C64_KEY_ONE,        charCode: 49,  shiftedCode: 33, altCode: -1, colorCode: 0 },   // 1
        { width: 1, keyIndex: C64_KEY_TWO,        charCode: 50,  shiftedCode: 34, altCode: -1, colorCode: 1 },   // 2
        { width: 1, keyIndex: C64_KEY_THREE,      charCode: 51,  shiftedCode: 35, altCode: -1, colorCode: 2 },   // 3
        { width: 1, keyIndex: C64_KEY_FOUR,       charCode: 52,  shiftedCode: 36, altCode: -1, colorCode: 3 },   // 4
        { width: 1, keyIndex: C64_KEY_FIVE,       charCode: 53,  shiftedCode: 37, altCode: -1, colorCode: 4 },   // 5
        { width: 1, keyIndex: C64_KEY_SIX,        charCode: 54,  shiftedCode: 38, altCode: -1, colorCode: 5 },   // 6
        { width: 1, keyIndex: C64_KEY_SEVEN,      charCode: 55,  shiftedCode: 39, altCode: -1, colorCode: 6 },   // 7
        { width: 1, keyIndex: C64_KEY_EIGHT,      charCode: 56,  shiftedCode: 40, altCode: -1, colorCode: 7 },   // 8
        { width: 1, keyIndex: C64_KEY_NINE,       charCode: 57,  shiftedCode: 41, altCode: -1 },   // 9
        { width: 1, keyIndex: C64_KEY_ZERO,       charCode: 48,  shiftedCode: -1, altCode: -1 },   // 0
        { width: 1, keyIndex: C64_KEY_PLUS,       charCode: 43,  shiftedCode: 91, altCode: -1 },  // -
        { width: 1, keyIndex: C64_KEY_MINUS,      charCode: 45,  shiftedCode: 93, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_POUND,      charCode: 28,  shiftedCode: 105, altCode: -1 },  // =
/*        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace */

      ],


      [ 
        /*
        { width: 1.5, keyIndex: 9, charCode: -1, shiftedCode: -1, altCode: -1 },  // tab
        */
        { width: 0.5, keyIndex: C64_KEY_NONE, charCode: -1,  shiftedCode: -1, altCode: -1 }, //q

        { width: 1, keyIndex: C64_KEY_Q, charCode: 17,  shiftedCode: 81, altCode: 107 }, //q
        { width: 1, keyIndex: C64_KEY_W, charCode: 23,  shiftedCode: 87, altCode: 115 }, //w
        { width: 1, keyIndex: C64_KEY_E, charCode: 5,   shiftedCode: 69, altCode: 113 }, //e
        { width: 1, keyIndex: C64_KEY_R, charCode: 18,  shiftedCode: 82, altCode: 114 }, //r
        { width: 1, keyIndex: C64_KEY_T, charCode: 20,  shiftedCode: 84, altCode: 99 }, //t
        { width: 1, keyIndex: C64_KEY_Y, charCode: 25,  shiftedCode: 89, altCode: 119 }, //y
        { width: 1, keyIndex: C64_KEY_U, charCode: 21,  shiftedCode: 85, altCode: 120 }, //u
        { width: 1, keyIndex: C64_KEY_I, charCode: 9,  shiftedCode: 73, altCode: 98 }, //i
        { width: 1, keyIndex: C64_KEY_O, charCode: 15,  shiftedCode: 79, altCode: 121 }, //o
        { width: 1, keyIndex: C64_KEY_P, charCode: 16,  shiftedCode: 80, altCode: 111 }, //p
        { width: 1, keyIndex: C64_KEY_AT, charCode: 0, shiftedCode: 122, altCode: 100 }, //[
        { width: 1, keyIndex: C64_KEY_STAR, charCode: 42, shiftedCode: 70, altCode: 95 }, //]


        { width: 0.5, keyIndex: C64_KEY_NONE, charCode: -1,  shiftedCode: -1, altCode: -1 }, //q

        /*
        { width: 1.5, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 124, altCode: -1 } //
        */
      ],

      [ 
        { width: 1, keyIndex: C64_KEY_RUN_STOP, charCode: -1, shiftedCode: -1 }, // caps lock
        { width: 1, keyIndex: C64_KEY_A, charCode: 1, shiftedCode: 65, altCode: 112 },  // a
        { width: 1, keyIndex: C64_KEY_S, charCode: 19, shiftedCode: 83, altCode: 110 },  // s
        { width: 1, keyIndex: C64_KEY_D, charCode: 4, shiftedCode: 68, altCode: 108 },  // d
        { width: 1, keyIndex: C64_KEY_F, charCode: 6, shiftedCode: 70, altCode: 123 },  // f
        { width: 1, keyIndex: C64_KEY_G, charCode: 7, shiftedCode: 71, altCode: 101 },  // g
        { width: 1, keyIndex: C64_KEY_H, charCode: 8, shiftedCode: 72, altCode: 116 },  // h
        { width: 1, keyIndex: C64_KEY_J, charCode: 10, shiftedCode: 74, altCode: 117 },  // j
        { width: 1, keyIndex: C64_KEY_K, charCode: 11, shiftedCode: 75, altCode: 97 },  // k
        { width: 1, keyIndex: C64_KEY_L, charCode: 12, shiftedCode: 76, altCode: 118 },  // l
        { width: 1, keyIndex: C64_KEY_COLON, charCode: 58, shiftedCode: 27, altCode: 27 }, // ;
        { width: 1, keyIndex: C64_KEY_SEMICOLON, charCode: 59, shiftedCode: 29, altCode: 29 }, // '
        { width: 1, keyIndex: C64_KEY_EQUALS, charCode: 61, shiftedCode: 61, altCode: 61 }, // '
        /*
        { width: 1.25, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter
        */
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_SHIFT_LEFT, charCode: -1, shiftedCode: -1 }, // left shift
        { width: 1, keyIndex: C64_KEY_Z,      charCode: 26, shiftedCode: 90, altCode: 109 },  // z
        { width: 1, keyIndex: C64_KEY_X,      charCode: 24, shiftedCode: 88, altCode: 125 },  // x
        { width: 1, keyIndex: C64_KEY_C,      charCode: 3, shiftedCode: 67, altCode: 124 },  // c
        { width: 1, keyIndex: C64_KEY_V,      charCode: 22, shiftedCode: 86, altCode: 126  },  // v
        { width: 1, keyIndex: C64_KEY_B,      charCode: 2, shiftedCode: 66, altCode: 127 },  // b
        { width: 1, keyIndex: C64_KEY_N,      charCode: 14, shiftedCode: 78, altCode: 106 },  // n
        { width: 1, keyIndex: C64_KEY_M,      charCode: 13, shiftedCode: 77, altCode: 103 },  // m
        { width: 1, keyIndex: C64_KEY_COMMA,  charCode: 44, shiftedCode: 60, altCode: 60 }, // ,
        { width: 1, keyIndex: C64_KEY_PERIOD, charCode: 46, shiftedCode: 62, altCode: 62 }, // .
        { width: 1, keyIndex: C64_KEY_SLASH,  charCode: 47, shiftedCode: 63, altCode: 63 }, // /

        { width: 1.5, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter

        /*
        { width: 1.5, keyIndex: C64_KEY_INS_DEL, charCode: -1,   shiftedCode: -1 }
        */
        /*
        { width: 2.75, keyIndex: C64_KEY_SHIFT_RIGHT, charCode: -1, shiftedCode: -1 }  // right shift
        */
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_COMMODORE, charCode: -1 }, // left commodore
        { width: 1.25, keyIndex: C64_KEY_CTRL, charCode: -1 }, // left ctrl
//        { width: 1.5, keyIndex: -1 },  // left alt
        { width: 6.5, keyIndex: C64_KEY_SPACE, charCode: 32, shiftedCode: 32, altCode: 32 }, // space
//        { width: 1.5, keyIndex: -1 },  // right alt
//        { width: 1.25, keyIndex: -1 },  // right windows

//        { width: 1.25, keyIndex: C64_KEY_INS_DEL, charCode: -1,   shiftedCode: -1 }

        /*
        { width: 1.5, keyIndex: 17 }   // right ctrl
        */
      ]    
    ];

    this.keyboard = this.petsciiKeyboardSmall;
  },

  draw: function() {

    if(this.fontCanvas == null) {
      return;
    }


    var index = 0;
    if(this.keyPositions.length == 0) {

      for(var i = 0; i < 256; i++) {
        this.keyPositions[i] = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }
    }

    this.context = this.canvas.getContext('2d');

    var keys = this.keyboard;


    var charHeight = 8;//tileSet.charHeight;
    var charWidth = 8;//tileSet.charWidth;

    var scale = 1;


  //  var screenWidth = UI.getScreenWidth() - 4;
    var holder = document.getElementById(this.id);
    if(!holder) {
      console.log('no holder');
      return;
    }
    var screenWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    var screenHeight = holder.clientHeight - 4;

    var maxKeyWidth = Math.floor(screenWidth / 15);
    if(keyWidth * scale > maxKeyWidth) {
      keyWidth = Math.floor(maxKeyWidth / scale);
    }

    
    var minKeyHeight = Math.floor(charHeight * 1.8);
    var minKeyWidth = Math.floor(charWidth * 1.8);

    var keysAcross = 13;
//    var screenWidth =  UI.getScreenWidth() - 4;
    var keyWidth = Math.floor(screenWidth / keysAcross);
    var keyHeight = keyWidth;
    
    if(keyHeight * 6 > screenHeight) {
      keyHeight = Math.floor(screenHeight / 6);
      if(keyWidth > 1.35 * keyHeight) {
        keyWidth = Math.floor(1.35 * keyHeight);
      }
    }



    if(scale == 1) {
//      keyHeight = Math.floor(charHeight * 1.4);
//      keyWidth = Math.floor(charWidth * 1.4);
    }

    if(keyHeight > keyWidth) {
      keyWidth = keyHeight;
    }

    if(keyWidth < charWidth) {
      // too narrow..
      keyWidth = charWidth;
    }
//    keyHeight = keyWidth;


    var keyboardHeight = keyHeight * 7.5;
    var keyboardWidth = keyWidth * 13;
    this.canvas.height = keyboardHeight * scale + 1;
    this.canvas.width =  keyboardWidth * scale + 1;
    this.context = this.canvas.getContext('2d');

    /*
    this.deletePosition.x = keyboardWidth - (keyWidth * 2);
    this.deletePosition.y = keyHeight * 0.2;
    this.deletePosition.width = keyWidth * 2;
    this.deletePosition.height = keyHeight;
*/

    this.shiftDown = false;
    this.commodoreDown = false;

    for(var i = 0; i < this.keysDown.length; i++) {
      if(this.keysDown[i] == C64_KEY_SHIFT_LEFT 
          || this.keysDown[i] == C64_KEY_SHIFT_RIGHT) {
        this.shiftDown = true;
      }
      if(this.keysDown[i] == C64_KEY_COMMODORE ) {
        this.commodoreDown = true;
      }
    }

    /*
        typingKeyboardKeyHighlight: '#aaaaaa',
    typingKeyboardLines: '#333333',//#444444',
    typingKeyboardBackground: '#eeeeee',
    */

    this.context.fillStyle = '#151515';//styles.textMode.typingKeyboardBackground;
    this.context.fillRect(0, 0, this.canvas.width * scale, this.canvas.height * scale);

    this.context.fillStyle = '#aaaaaa';// styles.textMode.typingKeyboardKeyHighlight;

    var keyboardPositionY = 0;//Math.floor(keyHeight * 1.2);
    this.context.moveTo(0, keyboardPositionY);
    for(var y = 0; y < 6; y++) {
      this.context.moveTo(0, keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo(keyboardWidth * scale + 1, keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

      var x = 0;
      for(var i = 0; i < keys[y].length; i++) {

        keys[y][i].top = keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5;
        keys[y][i].left = Math.floor(x * keyWidth * scale) + 0.5;

        var keyDown = false;
        for(var j = 0; j < this.keysDown.length; j++) {
          if(this.keysDown[j] == keys[y][i].keyIndex) {
            keyDown = true;
          }
        }

        if(keyDown) {
          this.context.fillRect(
            keys[y][i].left, 
            keyboardPositionY + keys[y][i].top, 
            keyWidth * keys[y][i].width * scale, 
            keyHeight * scale);
        }

        this.keyPositions[index++] = {
          x: keys[y][i].left,
          y: keyboardPositionY + keys[y][i].top,
          width: keyWidth * keys[y][i].width * scale,
          height:  keyHeight * scale,
          keyIndex: keys[y][i].keyIndex
        };

        this.context.moveTo(
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

        this.context.lineTo( 
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor( (y + 1) * keyHeight * scale) + 0.5);
        x += keys[y][i].width;
      }
      this.context.moveTo(
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo( 
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor( (y + 1) * keyHeight * scale) + 0.5);
    }

    this.context.moveTo(
                0, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
    this.context.lineTo(
                keyboardWidth * scale + 1, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

    this.context.strokeStyle = '#333333';// styles.textMode.typingKeyboardLines;
    this.context.lineWidth = 1.5;
    this.context.stroke();

    /*
    this.context.beginPath();
    this.context.rect(this.deletePosition.x,
                      this.deletePosition.y,
                      this.deletePosition.width,
                      this.deletePosition.height);
    this.context.stroke();
*/
    var x = 13; 
    var y = 13;
    var character = 4;

    var x = 0;
    var y = 0;
    for(var row = 0; row < keys.length; row++) {
      x = 0;
      y = row;
      for(var i = 0; i < keys[row].length; i++) {
        //var keyCode = keys[row][i].keyCode;

        var currentKeyWidth = keys[row][i].width * keyWidth * scale;

        var keyX = Math.floor((x) * keyWidth * scale + (currentKeyWidth - charWidth * scale) / 2);
        var keyY = keyboardPositionY + Math.floor((y) * keyHeight * scale + ((keyHeight * scale) - charHeight * scale) / 2);


        var character = this.keyboard[row][i].charCode;
        if(this.shiftDown) {
          character = this.keyboard[row][i].shiftedCode;
        }


        var color = false;
        if(this.commodoreDown) {
          character = this.keyboard[row][i].altCode;

          if(character == -1 && typeof this.keyboard[row][i].colorCode != 'undefined') {
            color = this.keyboard[row][i].colorCode;

            if(this.shiftDown) {
              color += 8;
            }
          }
        }


        if(typeof(character) == 'undefined') {
          character = -1;
        }
        if(character >= 0) {
          var charX = character % 16;
          var charY = Math.floor(character / 16);
          var srcX = charX * 8;
          var srcY = charY * 8;
          var srcWidth = 8;
          var srcHeight = 8;

          var dstX = keyX;
          var dstY = keyY;
          var dstWidth = 8;//keyWidth;
          var dstHeight = 8;//keyHeight;

          this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
            dstX, dstY, dstWidth, dstHeight);  
    
        } else {

          var keyIndex = this.keyboard[row][i].keyIndex;
          var chars = [];

          if(keyIndex == C64_KEY_F1 || keyIndex == C64_KEY_F3 || keyIndex == C64_KEY_F5 || keyIndex == C64_KEY_F7) {
            chars.push(6);
            var character = 49;
            switch(keyIndex) {
              case C64_KEY_F3:
                character += 2;
              break;
              case C64_KEY_F5:
                character += 4;
              break;
              case C64_KEY_F7:
                character += 6;
              break;
            }
            if(this.shiftDown) {
              character++;
            }
            
            chars.push(character);

          }

          if(keyIndex == C64_KEY_COMMODORE) {
            chars.push(3);
            chars.push(61);
          }

          if(keyIndex == C64_KEY_CTRL) {
            chars.push(3);
            chars.push(20);
            chars.push(18);
            chars.push(12);
          }

          if(keyIndex == C64_KEY_SHIFT_LEFT) {
            chars.push(19);
            chars.push(8);
            chars.push(6);
            chars.push(20);

          }

          if(keyIndex == C64_KEY_RESTORE) {
            chars.push(18);
            chars.push(19);
            chars.push(20);
            chars.push(18);
          }

          if(keyIndex == C64_KEY_INS_DEL) {
            chars.push(4);
            chars.push(5);
            chars.push(12);

          }

          if(keyIndex == C64_KEY_RETURN) {
            chars.push(18);
            chars.push(20);
            chars.push(14);

          }

          if(keyIndex == C64_KEY_RUN_STOP) {
            chars.push(18);
            chars.push(47);
            chars.push(19);
          }

          var keyX = Math.floor((x) * keyWidth * scale + (currentKeyWidth - chars.length * charWidth * scale) / 2);

          for(var k = 0; k < chars.length; k++) {
            character = chars[k];

            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX + k * 8;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;


            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

          }


/*          
          if(keyIndex == C64_KEY_F1 || keyIndex == C64_KEY_F3 || keyIndex == C64_KEY_F5 || keyIndex == C64_KEY_F7) {
            character = 6;
            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;

            keyX += 8;

            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

            character = 49
            switch(keyIndex) {
              case C64_KEY_F3:
                character += 2;
              break;
              case C64_KEY_F5:
                character += 4;
              break;
              case C64_KEY_F7:
                character += 6;
              break;
            }
            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;

            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

          }
*/
          /*
          keyIndex: C64_KEY_F1, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 0 },   // 1
        { width: 1.5, keyIndex: C64_KEY_F3, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 1 },   // 2
        { width: 1.5, keyIndex: C64_KEY_F5, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 2 },   // 3
        { width: 1.5, keyIndex: C64_KEY_F7, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4
        { width: 2, keyIndex: C64_KEY_RESTORE, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4

        { width: 2, keyIndex: C64_KEY_INS_DEL, charCode: -1,  shiftedCode: -1, altCode: -1 },  // =
        */
//          this.context.fillStyle = '#993322';
//          this.context.fillRect(keyX, keyY, keyWidth, keyHeight);
        }



/*
        var highlight = false;
        if(character >= 0) {
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": character, "colorRGB": 0x666666, "highlight": highlight, "scale": scale })          
        } else if(color !== false) {
          var colorHex = 0x334455;
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": -1, "colorRGB": colorHex, "highlight": highlight, "scale": scale })                    
        }

*/
        x += keys[row][i].width;
      } 
    }


//    this.context.putImageData(imageData, 0, 0);
  }
}


var c64keycharsImageData = 'data:image/png;base64,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';