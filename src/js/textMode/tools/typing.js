var Typing = function() {
  this.editor = null;

  this.keyboardImage = null;
  this.canvas = null;
  this.context = null;

  this.keyboardRows = [];

  this.keyCodeDown = -1;
  this.reverse = false;

  this.keyboard = [];

  this.shiftDown = false;
  this.ctrlDown = false;
  this.altDown = false;

  this.cursor = {
    x: 0,
    y: 0,
    z: 0
  };
}

Typing.prototype = {

  setCursorPosition: function(args) {
    this.cursor.x = args.x;
    this.cursor.y = args.y;

    if(typeof args.z != 'undefined') {
      this.cursor.z = args.z;
    }

    if(g_app.mode == '3d') {
      this.editor.grid3d.setTypingCursorPosition(this.cursor.x, this.cursor.y, this.cursor.z);
    }
  },


  initKeyboard: function() {
    this.asciiKeyboard = [
      [ 
        { width: 1, keyCode: 223, charCode: 96, shiftedCode: 126, altCode: -1  },  // `
        { width: 1, keyCode: 49,  charCode: 49,  shiftedCode: 33, altCode: -1, colorCode: 0 },   // 1
        { width: 1, keyCode: 50,  charCode: 50,  shiftedCode: 64, altCode: -1, colorCode: 1 },   // 2
        { width: 1, keyCode: 51,  charCode: 51,  shiftedCode: 35, altCode: -1, colorCode: 2 },   // 3
        { width: 1, keyCode: 52,  charCode: 52,  shiftedCode: 36, altCode: -1, colorCode: 3 },   // 4
        { width: 1, keyCode: 53,  charCode: 53,  shiftedCode: 37, altCode: -1, colorCode: 4 },   // 5
        { width: 1, keyCode: 54,  charCode: 54,  shiftedCode: 94, altCode: -1, colorCode: 5 },   // 6
        { width: 1, keyCode: 55,  charCode: 55,  shiftedCode: 38, altCode: -1, colorCode: 6 },   // 7
        { width: 1, keyCode: 56,  charCode: 56,  shiftedCode: 42, altCode: -1, colorCode: 7 },   // 8
        { width: 1, keyCode: 57,  charCode: 57,  shiftedCode: 40, altCode: -1 },   // 9
        { width: 1, keyCode: 48,  charCode: 48,  shiftedCode: 41, altCode: -1 },   // 0
        { width: 1, keyCode: 189, charCode: 45, shiftedCode: 95, altCode: -1 },  // -
        { width: 1, keyCode: 187, charCode: 61, shiftedCode: 43, altCode: -1 },  // =
        { width: 2, keyCode: 8,   charCode: -1,   shiftedCode: -1 }     // backspace
      ],


      [ 
        { width: 1.5, keyCode: 9, charCode: -1, shiftedCode: -1, altCode: -1 },  // tab
        { width: 1, keyCode: 81, charCode: 113,  shiftedCode: 81, altCode: 195 }, //q
        { width: 1, keyCode: 87, charCode: 119,  shiftedCode: 87, altCode: 180 }, //w
        { width: 1, keyCode: 69, charCode: 101,  shiftedCode: 69, altCode: 193 }, //e
        { width: 1, keyCode: 82, charCode: 114,  shiftedCode: 82, altCode: 194 }, //r
        { width: 1, keyCode: 84, charCode: 116,  shiftedCode: 84, altCode: 204 }, //t
        { width: 1, keyCode: 89, charCode: 121,  shiftedCode: 89, altCode: 185 }, //y
        { width: 1, keyCode: 85, charCode: 117,  shiftedCode: 85, altCode: 202 }, //u
        { width: 1, keyCode: 73, charCode: 105,  shiftedCode: 73, altCode: 203 }, //i
        { width: 1, keyCode: 79, charCode: 111,  shiftedCode: 79, altCode: -1 }, //o
        { width: 1, keyCode: 80, charCode: 112,  shiftedCode: 80, altCode: -1 }, //p
        { width: 1, keyCode: 219, charCode: 91, shiftedCode: 123, altCode: -1 }, //[
        { width: 1, keyCode: 221, charCode: 93, shiftedCode: 125, altCode: -1 }, //]
        { width: 1.5, keyCode: 220, charCode: 92, shiftedCode: 124, altCode: -1 } //
      ],

      [ 
        { width: 1.75, keyCode: 20, charCode: -1, shiftedCode: -1 }, // caps lock
        { width: 1, keyCode: 65, charCode: 97, shiftedCode: 65, altCode: 218 },  // a
        { width: 1, keyCode: 83, charCode: 115, shiftedCode: 83, altCode: 191 },  // s
        { width: 1, keyCode: 68, charCode: 100, shiftedCode: 68, altCode: 179 },  // d
        { width: 1, keyCode: 70, charCode: 102, shiftedCode: 70, altCode: 196 },  // f
        { width: 1, keyCode: 71, charCode: 103, shiftedCode: 71, altCode: 201 },  // g
        { width: 1, keyCode: 72, charCode: 104, shiftedCode: 72, altCode: 187 },  // h
        { width: 1, keyCode: 74, charCode: 106, shiftedCode: 74, altCode: 186 },  // j
        { width: 1, keyCode: 75, charCode: 107, shiftedCode: 75, altCode: 205 },  // k
        { width: 1, keyCode: 76, charCode: 108, shiftedCode: 76, altCode: 195 },  // l
        { width: 1, keyCode: 186, charCode: 59, shiftedCode: 58, altCode: 195 }, // ;
        { width: 1, keyCode: 222, charCode: 39, shiftedCode: 34, altCode: 195 }, // '
        { width: 2.25, keyCode: 13, charCode: -1, shiftedCode: -1 } // enter
      ],

      [ 
        { width: 2.25, keyCode: 16, charCode: -1, shiftedCode: -1 }, // left shift
        { width: 1, keyCode: 90, charCode: 122, shiftedCode: 90, altCode: 192 },  // z
        { width: 1, keyCode: 88, charCode: 120, shiftedCode: 88, altCode: 217 },  // x
        { width: 1, keyCode: 67, charCode: 99, shiftedCode: 67, altCode: 197 },  // c
        { width: 1, keyCode: 86, charCode: 118, shiftedCode: 86, altCode: 195  },  // v
        { width: 1, keyCode: 66, charCode: 98, shiftedCode: 66, altCode: 200 },  // b
        { width: 1, keyCode: 78, charCode: 110, shiftedCode: 78, altCode: 188 },  // n
        { width: 1, keyCode: 77, charCode: 109, shiftedCode: 77, altCode: 206 },  // m
        { width: 1, keyCode: 188, charCode: 44, shiftedCode: 60, altCode: 195 }, // ,
        { width: 1, keyCode: 190, charCode: 46, shiftedCode: 62, altCode: 195 }, // .
        { width: 1, keyCode: 191, charCode: 47, shiftedCode: 63, altCode: 195 }, // /
        { width: 2.75, keyCode: 16, charCode: -1, shiftedCode: -1 }  // right shift
      ],

      [ 
        { width: 1.5, keyCode: 17 }, // left ctrl
        { width: 1.25, keyCode: 91 }, // left windows
        { width: 1.5, keyCode: 18 },  // left alt
        { width: 6.5, keyCode: 32, charCode: 32, shiftedCode: 32, altCode: 32 }, // space
        { width: 1.5, keyCode: 18 },  // right alt
        { width: 1.25, keyCode: 92 },  // right windows
        { width: 1.5, keyCode: 17 }   // right ctrl
      ]

    ];

    this.keypad = [
    ];



    this.petsciiKeyboard = [];
    for(var row = 0; row < this.asciiKeyboard.length; row++) {
      this.petsciiKeyboard.push([]);
      for(var i = 0; i < this.asciiKeyboard[row].length; i++) {
        var key = {};
        key.width = this.asciiKeyboard[row][i].width;
        key.keyCode = this.asciiKeyboard[row][i].keyCode;
        key.colorCode = this.asciiKeyboard[row][i].colorCode;
        key.charCode = this.keyCodeToPetscii(key.keyCode, false, false );
        key.shiftedCode = this.keyCodeToPetscii(key.keyCode, true, false);
        key.altCode = this.keyCodeToPetscii(key.keyCode, false, true);
        this.petsciiKeyboard[row].push(key);
      }
    }

    this.keyboard = this.petsciiKeyboard;

  },

  init: function(editor) {
    this.editor = editor;

    this.initKeyboard();


/*
    var typeMode = this;

    this.keyboardImage = new Image();
    this.keyboardImage.src = 'images/keyboard.png';
    this.keyboardImage.onload = function() {
    }
*/

    var row = {
      "offsetX": 13,
      "offsetY": 13,
      "keyCodes": [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187]
    };
    this.keyboardRows.push(row);

    var row = {
      "offsetX": 50,
      "offsetY": 40,
      "keyCodes": [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 220]
    };
    this.keyboardRows.push(row);

    var row = {
      "offsetX": 61,
      "offsetY": 67,
      "keyCodes": [65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222]
    };
    this.keyboardRows.push(row);


    var row = {
      "offsetX": 73,
      "offsetY": 94,
      "keyCodes": [90, 88, 67, 86, 66, 78, 77, 188, 190, 191]
    };
    this.keyboardRows.push(row);

  },

  keyUp: function(event) {
    var keyCode = event.keyCode;
    this.shiftDown = event.shiftKey;
    this.ctrlDown = event.ctrlKey;
    this.altDown = event.altKey;
    this.cmdDown = event.metaKey;    


    if(this.keyCodeDown == keyCode) {
      this.keyCodeDown = -1;
    }
    this.updateTypeCanvas();
  },

  keyPress: function(event) {

  },

  keyCodeToPetscii: function(keyCode, shift, alt) {

    if(typeof shift == 'undefined') {
      shift = this.shiftDown;
    }

    if(typeof alt == 'undefined') {
      alt = this.altDown;      
    }
    var character = -1;

    if(keyCode == 192) {
      character = 31;
      if(shift) {
        character = 94;
      }
    }

    if(keyCode >= 65 && keyCode <= 90) {
      // a - z
      character = keyCode - 65 + 1;

      if(shift) {
        character += 64;
      } else if(alt) {
        switch(character) {
          case 1:
            character = 112;
            break;
          case 2:
            character = 127;
            break;
          case 3:
            character = 124;
            break;
          case 4:
            character = 108;
            break;
          case 5:
            character = 113;
            break;
          case 6:
            character = 123;
            break;
          case 7:
            character = 101;
            break;
          case 8:
            character = 116;
            break;
          case 9:
            character = 98;
            break;
          case 10:
            character = 117;
            break;
          case 11:
            character = 97;
            break;
          case 12:
            character = 118;
            break;
          case 13:
            character = 103;
            break;
          case 14:
            character = 106;
            break;
          case 15:
            character = 121;
            break;
          case 16:
            character = 111;
            break;
          case 17:
            character = 107;
            break;
          case 18:
            character = 114;
            break;
          case 19:
            character = 110;
            break;
          case 20:
            character = 99;
            break;
          case 21:
            character = 120;
            break;
          case 22:
            character = 126;
            break;
          case 23:
            character = 115;
            break;
          case 24:
            character = 125;
            break;
          case 25:
            character = 119;
            break;
          case 26:
            character = 109;
            break;
        }
      }
    }

    if(keyCode >= 48 && keyCode <= 57) {
      // 0 - 9
      if(alt) {
        return -1;
      }
      character = keyCode ;
      if(shift) {
        if(character == 50) {
          // @
          character = 0;
        } else if(character == 54) {
          // up arrow
          character = 30;
        } else if(character == 55) {
          // &
          character = 38;
        } else if(character == 56) {
          // *
          character = 42;
        } else if(character == 57) {
          // (
          character = 40;
        } else if(character == 48) {
          // )
          character = 41;
        } else {
          character -= 49 - 33;
        }
    // fix differences in shifted characters

      }
    }



    if(keyCode == 186) {
      //semicolon
      character = 59;
      if(shift) {
        character = 58;
      }
    }
    if(keyCode == 188) {
      // comma
      if(!alt) {
        character = 44;
      }
      if(shift) {
        character = 60;
      }
    }
    if(keyCode == 190) {
      // full stop
      if(!alt) {
        character = 46;
      }
      if(shift) {
        character = 62;
      }
    }

    if(keyCode == 191) {
      // forward slash
      if(!alt) {         
        character = 47;
      }
      if(shift) {
        character = 63;
      }
    }

    if(keyCode == 32) {
      // space
      character = 32;
    }

    if(keyCode == 187) {
      // equals
      character = 61;
      if(shift) {
        character = 43;
      } else if(alt) {
        character = 92;
      }
    }

    if(keyCode == 189) {
      // minus
      character = 45;
      if(alt) {
        character = 102;
      } 
      if(shift) {
        character = 91;
      }
    }

    if(keyCode == 219) {
      // square bracket open
      character = 27;

      if(shift) {
        character = 122;
      } else if(alt) {
        character = 100;
      }
    }

    if(keyCode == 220) {
      character = 28;
      if(shift) {
        character = 105;
      } else if(alt) {
        character = 104;

      }
    }
    if(keyCode == 221) {
      // square bracket close
      character = 29;
      if(shift) {
        character = 95;
      } else if(alt) {
        character = 64;
      }
    }

    if(keyCode == 222) {
      // single quote
      character = 39;
      if(shift) {
        character = 34;
      }
    }

    if(this.reverse && character != -1) {
      character += 128;
    }
    return character;

  },

  updateTypeCanvas: function() {

    var keys = this.keyboard;
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(tileSet.type == 'petscii' || tileSet.getType() == 'vector') {
      this.keyboard = this.petsciiKeyboard;
    } else {
      this.keyboard = this.asciiKeyboard;      
    }

    var charHeight = tileSet.charHeight;
    var charWidth = tileSet.charWidth;

    var scale = 2;
//    if(charHeight > 10) {
    if(charHeight > 14) {  
      scale = 1;
    }

    var keyHeight = Math.floor(charHeight * 1.8);
    var keyWidth = Math.floor(charWidth * 1.8);

    if(scale == 1) {
      keyHeight = Math.floor(charHeight * 1.4);
      keyWidth = Math.floor(charWidth * 1.4);
    }

    if(keyHeight > keyWidth) {
      keyWidth = keyHeight;
    }

    var keyboardHeight = keyHeight * 5;
    var keyboardWidth = keyWidth * 15;
    this.canvas.height = keyboardHeight * scale + 1;
    this.canvas.width =  keyboardWidth * scale + 1;
    this.context = this.canvas.getContext('2d');

    this.context.fillStyle = styles.textMode.typingKeyboardBackground;
    this.context.fillRect(0, 0, this.canvas.width * scale, this.canvas.height * scale);

    this.context.fillStyle = styles.textMode.typingKeyboardKeyHighlight;

    this.context.moveTo(0, 0);
    for(var y = 0; y < 5; y++) {
      this.context.moveTo(0, Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo(keyboardWidth * scale + 1, Math.floor(y * keyHeight * scale) + 0.5);

      var x = 0;
      for(var i = 0; i < keys[y].length; i++) {

        keys[y][i].top = Math.floor(y * keyHeight * scale) + 0.5;
        keys[y][i].left = Math.floor(x * keyWidth * scale) + 0.5;
        if(keys[y][i].keyCode == this.keyCodeDown) {
          this.context.fillRect(keys[y][i].left, keys[y][i].top, keyWidth * keys[y][i].width * scale, keyHeight * scale);
        }
        this.context.moveTo(Math.floor(x * keyWidth * scale) + 0.5, Math.floor(y * keyHeight * scale) + 0.5);
        this.context.lineTo( Math.floor(x * keyWidth * scale) + 0.5, Math.floor( (y + 1) * keyHeight * scale) + 0.5);
        x += keys[y][i].width;
      }
      this.context.moveTo(Math.floor(x * keyWidth * scale) + 0.5, Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo( Math.floor(x * keyWidth * scale) + 0.5, Math.floor( (y + 1) * keyHeight * scale) + 0.5);
    }

    this.context.moveTo(0, Math.floor(y * keyHeight * scale) + 0.5);
    this.context.lineTo(keyboardWidth * scale + 1, Math.floor(y * keyHeight * scale) + 0.5);

    this.context.strokeStyle = styles.textMode.typingKeyboardLines;
    this.context.lineWidth = 0.5;
    this.context.stroke();

//    this.context.drawImage(this.keyboardImage, 0, 0, this.canvas.width, this.canvas.height);

    var imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);


    var x = 13; 
    var y = 13;
    var character = 4;

    var x = 0;
    var y = 0;
    for(var row = 0; row < keys.length; row++) {

      x = 0;
      y = row;
      for(var i = 0; i < keys[row].length; i++) {
        var keyCode = keys[row][i].keyCode;

        var keyX = Math.floor((x) * keyWidth * scale + ((keyWidth * scale) - charWidth * scale) / 2);
        var keyY = Math.floor((y) * keyHeight * scale + ((keyHeight * scale) - charHeight * scale) / 2);


        var character = this.keyboard[row][i].charCode;
        if(this.shiftDown) {
          character = this.keyboard[row][i].shiftedCode;
        }


        var color = false;
        if(this.altDown) {
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

        var highlight = false;
        if(character >= 0) {
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": character, "colorRGB": 0x666666, "highlight": highlight, "scale": scale })          
        } else if(color !== false) {
          var colorHex = colorPalette.getHex(color);
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": -1, "colorRGB": colorHex, "highlight": highlight, "scale": scale })                    
        }

        x += keys[row][i].width;
      } 
    }


    this.context.putImageData(imageData, 0, 0);

  },

  show: function() {
    this.canvas = document.getElementById('typeKeyboard');
    this.context = this.canvas.getContext('2d');

    this.updateTypeCanvas();
  },

  moveCursor: function(h, v) {
    var width = 0;
    var height = 0;
    var z = 0;

    if(g_app.mode == '3d') {
      var grid3d = this.editor.grid3d;
      width = grid3d.getGridWidth();
      height = grid3d.getGridHeight();
      // upside down for 3d.
      v = -v;
      z = grid3d.getXYPosition();

    } else {
      var layer = this.editor.layers.getSelectedLayerObject();
      if(!layer || layer.getType() != 'grid') {
        return;
      }    
      width = layer.getGridWidth();
      height = layer.getGridHeight();
    }


    var x = this.cursor.x;
    var y = this.cursor.y;


    x += h;

    if(x >= width) {
      x = x - width;

      if(g_app.mode == '3d') {
        v--;
      } else {
        v++;
      }
    }

    if(x < 0) {
      x = x + width;
      if(g_app.mode == '3d') {
        v++;
      } else {
        v--;
      }
    }

    y += v;

    if(y >= height || y < 0) {
      y -= v;
    }

    this.setCursorPosition({x: x, y: y, z: z});
  },


  keycodeToCharCode: function(keyCode) {
    for(var row = 0; row < this.keyboard.length; row++) {
      for(var i = 0; i < this.keyboard[row].length; i++) {
        if(this.keyboard[row][i].keyCode == keyCode) {
          if(this.shiftDown) {
            return this.keyboard[row][i].shiftedCode;
          }

          if(this.altDown) {
            return this.keyboard[row][i].altCode;
          }

          return this.keyboard[row][i].charCode;
        }
      }
    }

    return -1;
  },


  keyDown: function(event) {

//    console.log(event);
    
    var keyCode = event.keyCode;

    this.shiftDown = event.shiftKey;
    this.ctrlDown = event.ctrlKey;
    this.altDown = event.altKey;
    this.cmdDown = event.metaKey;    

    if(event.getModifierState("CapsLock")) {
      this.shiftDown = true;
    }


    this.editor.grid.setCursorEnabled(false);
    var character = undefined;

    var x = this.cursor.x;
    var y = this.cursor.y;
    var z = 0;

    if(g_app.mode == '3d') {
      z = this.editor.grid3d.getXYPosition();
    }

    if(typeof x == 'undefined' || typeof y == 'undefined' || typeof z == 'undefined') {
      var x = 0;
      var y = this.editor.frames.height - 1;
      this.setCursorPosition({x: x, y: y, z: z});
    }

    character = this.keycodeToCharCode(keyCode);


    if(typeof character != 'undefined' && character >= 0) {

      this.keyCodeDown = keyCode;
      if(this.reverse) {
        character += 128;
      }

      this.editor.history.startEntry('type');


      z = 0;
      var cellData = {
        t: character, 
        fc: this.editor.currentTile.color,
        bc:  this.editor.currentTile.bgColor,
        x:x, 
        y:y, 
        z:z
      };


      if(g_app.mode == '3d') {
        var grid3d = this.editor.grid3d;
        cellData.z = grid3d.getXYPosition();
        grid3d.setCell(cellData);
      } else {
        var layer = this.editor.layers.getSelectedLayerObject();
        if(layer == null || layer.getType() != 'grid') {
          return;
        }

        layer.setCell(cellData);
        this.editor.grid.grid2d.setMirrorCells(layer, cellData);
      }

      /*
      this.editor.grid.setCell({
          c: character, 
          fc: this.editor.currentTile.color,
          bc:  this.editor.currentTile.bgColor,
          x:x, 
          y:y, 
          z:z
      });
      */
      this.editor.history.endEntry();

      if(this.editor.frames.getBlockModeEnabled()) {
        // need to update whole grid if block mode is enabled
        this.editor.graphic.invalidateAllCells();
        this.editor.graphic.redraw({ allCells: true});

      } else {
        if(g_newSystem) {
          this.editor.gridView2d.draw();
        } else {          
          this.editor.grid.update();
        }
      }

      this.moveCursor(1, 0);
    }

    this.updateTypeCanvas();


    if(keyCode == 48 && this.altDown) {
      // 0
      this.reverse = false;
    }
    if(keyCode == 57 && this.altDown) {
      // 9
      this.reverse = true;
    }

    switch(keyCode) {
      case 37: // left
        this.moveCursor(-1, 0);
        break;
      case 39: // right
        this.moveCursor(1, 0);
        break;
      case 38: // up
        this.moveCursor(0, -1);
        break;
      case 40: // down
        this.moveCursor(0, 1);      
        break;
      case 13: // enter

        this.moveCursor(-x, 1);
        break;
      case 8:  // delete
        this.moveCursor(-1, 0);
        var x = this.cursor.x;
        var y = this.cursor.y;
        var z = 0;

        this.editor.history.startEntry('type');

        if(g_app.mode == '3d') {
          var grid3d = this.editor.grid3d;
          z = grid3d.getXYPosition();
          grid3d.setCell({
            t: this.editor.tileSetManager.noTile, 
            x: x, 
            y: y, 
            z: z
          });

        } else {
          var layer = this.editor.layers.getSelectedLayerObject();
          if(layer == null || layer.getType() != 'grid') {
            return;
          }
          z = 0;
          layer.setCell({
            t: this.editor.tileSetManager.blankCharacter, 
            x: x, 
            y: y, 
            z: z
          });
        }


        /*
        this.editor.grid.setCell({
          c: this.editor.tileSetManager.blankCharacter, 
          x: x, 
          y: y, 
          z: z
        });
        */
        this.editor.history.endEntry();

        if(this.editor.frames.getBlockModeEnabled()) {
          // need to update whole grid if block mode is enabled
          if(g_newSystem) {
            this.editor.gridView2d.draw();
          } else {
            this.editor.grid.update();
          }
      
        }
        
        break;
    }
  }
}