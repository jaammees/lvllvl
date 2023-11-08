var KeyboardCanvas = function() {
  this.canvasID = '';

  this.keyboardCanvas = null;
  this.keyboardContext = null;
  this.whiteKeyWidth = 20;
  this.blackKeyWidth = 10;
  this.keyboardOctave = 5;
  this.keyboardNote = 5;

  this.keydownCallback = null;
  this.keyupCallback = null;

  this.mouseIsDown = true;

  this.whiteKey = false;  
}

KeyboardCanvas.prototype = {
  init: function(canvasID) {
    this.canvasID = canvasID;
    this.keyboardCanvas = document.getElementById(canvasID);
    this.keyboardContext = this.keyboardCanvas.getContext("2d");
    this.drawKeyboard();

    var keyboard = this;
    this.keyboardCanvas.addEventListener('mousedown', function(event) {
      //UI.mouseDown(event);
      keyboard.mouseDown(event);
    }, false); 

    this.keyboardCanvas.addEventListener('mousemove', function(event) {
      //UI.mouseMove(event); 
      keyboard.mouseMove(event);
    }, false); 

    this.keyboardCanvas.addEventListener('mouseup', function(event) {
    //  UI.mouseUp(event);
      keyboard.mouseUp(event);
    }, false); 



  },

  on: function(type, callback) {
    if(type == 'keydown') {
      this.keydownCallback = callback;
    }

    if(type == 'keyup') {
      this.keyupCallback = callback;
    }

  },

  mouseDown: function(event) {
    this.mouseIsDown = true;
    UI.captureMouse(this);
    if(this.keydownCallback) {
      this.keydownCallback(this.keyboardOctave, this.keyboardNote);
    }

  },

  mouseMove: function(event) {

    if(this.mouseIsDown) {
      return;
    }
    UI.setCursor('pointer');
    var x = event.offsetX;
    var y = event.offsetY;


    this.mouseToKeyboard(x, y);
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
    UI.releaseMouse();

    if(this.keyupCallback) {
      this.keyupCallback();
    }

  },

  mouseToKeyboard: function(x, y) {
    var keyboardOffset = $('#' + this.canvasID).offset();

    if(true) {
//    if(x > keyboardOffset.left && x < keyboardOffset.left + this.keyboardCanvas.width) {//} &&
       //y > keyboardOffset.top && y < keyboardOffset.top + this.keyboardCanvas.height) {


//      x = x - keyboardOffset.left;
//      y = y - keyboardOffset.top;

      var whiteKey = Math.floor(x / this.whiteKeyWidth);
      this.whiteKey = whiteKey;


      var note = whiteKey % 7;
      var octave = Math.floor(whiteKey / 7);

      whiteKey = note;
      if(whiteKey >= 1) {
        note++;
      }
      if(whiteKey >= 2) {
        note++;
      }
      if(whiteKey >= 4) {
        note++;
      }
      if(whiteKey >= 5) {
        note++;
      }
      if(whiteKey >= 6) {
        note++;
      }

      if(y < 30) {
        var blackKey = false;
        // check if black key
        var blackKeyPos = ((octave * 7 + whiteKey) * this.whiteKeyWidth) - this.blackKeyWidth / 2;
        if(x > blackKeyPos && x < blackKeyPos + this.blackKeyWidth) {
          whiteKey--;
          blackKey = whiteKey;
        }
        var blackKeyPos = ((octave * 7 + whiteKey) * this.whiteKeyWidth) + this.whiteKeyWidth  - this.blackKeyWidth / 2;
        if(x > blackKeyPos && x < blackKeyPos + this.blackKeyWidth) {
          blackKey = whiteKey;
        }        

        if(blackKey !== false) {
          if(blackKey == 0) {
            note = 1;
            this.whiteKey = false;
          }
          if(blackKey == 1) {
            note = 3;
            this.whiteKey = false;
          }
          if(blackKey == 3) {
            note = 6;
            this.whiteKey = false;
          }
          if(blackKey == 4) {
            note = 8;
            this.whiteKey = false;
          }
          if(blackKey == 5) {
            note = 10;
            this.whiteKey = false;
          }
        }

      }
      this.keyboardNote = note;
      this.keyboardOctave = octave + 1;

    }

    this.drawKeyboard();
  },

  drawKeyboard: function() {
    var keyWidth = 14;
    var selectedKeyColor = styles.music.pianoRollSelectedNote;;//"#cccccc";
    if(this.playingInstrument) {
      selectedKeyColor = styles.music.pianoRollHighlightedNote;
    }

    this.whiteKey = false;

    if(this.keyboardNote !== false) {
      if(this.keyboardNote % 12 == 0) {
        this.whiteKey = 0;
      }
      if(this.keyboardNote % 12 == 2) {
        this.whiteKey = 1;
      }
      if(this.keyboardNote % 12 == 4) {
        this.whiteKey = 2;
      }
      if(this.keyboardNote % 12  == 5) {
        this.whiteKey = 3;
      }
      if(this.keyboardNote % 12 == 7) {
        this.whiteKey = 4;
      }
      if(this.keyboardNote % 12 == 9) {
        this.whiteKey = 5;
      }
      if(this.keyboardNote % 12 == 11) {
        this.whiteKey = 6;
      }

      this.keyboardOctave += Math.floor(this.keyboardNote / 12);

      if(this.whiteKey!== false) {
        this.whiteKey = this.whiteKey + (this.keyboardOctave - 1) * 7;
      }
    }

    this.whiteKeyWidth = (12 / 7) * keyWidth;
//    var width = 3 * this.cellWidth;
    var keyCount = Math.floor(this.keyboardCanvas.width/this.whiteKeyWidth) + 1;

    //alert(keyCount);

    if(keyCount > 48) {
      keyCount = 48;

    }

    this.keyboardContext.fillStyle = styles.music.pianoRollWhiteKey;
    this.keyboardContext.clearRect(0, 0, this.keyboardCanvas.width, this.keyboardCanvas.height);

    if(this.whiteKey !== false) {
      this.keyboardContext.fillStyle= selectedKeyColor;
      this.keyboardContext.fillRect(this.whiteKey * this.whiteKeyWidth,0,
        this.whiteKeyWidth,this.keyboardCanvas.height);


    }



    this.keyboardContext.beginPath();
    for(var i = 0; i < keyCount; i++) {
      this.keyboardContext.moveTo(i * this.whiteKeyWidth + 0.5,0);
      this.keyboardContext.lineTo(i * this.whiteKeyWidth + 0.5,this.keyboardCanvas.height);
    }
    this.keyboardContext.stroke();

    for(var i = 0; i <= keyCount / 7; i++) {
      this.keyboardContext.font="10px Verdana";
      this.keyboardContext.fillStyle = styles.music.pianoRollBlackKey;
      var octave = i + 1;
      this.keyboardContext.fillText("C" + octave, i*this.whiteKeyWidth*7 +2,56);

    }


    var height = this.cellHeight;
    this.blackKeyWidth = keyWidth;
    var blackKeyHeight = this.keyboardCanvas.height  / 2 ;


    for(var i = 0; i < keyCount; i++) {
      var whiteKey = i % 7;
      var octave = Math.floor(i / 7) + 1;
//      if(note == 1 || note == 3 || note == 6 || note == 8 || note == 10) {
      if(whiteKey == 1 || whiteKey == 2 || whiteKey == 4 || whiteKey == 5 || whiteKey == 6) {
          var note = 0;
          if(whiteKey == 1) {
            note = 1;
          }
          if(whiteKey == 2) {
            note = 3;
          }
          if(whiteKey == 4) {
            note = 6;
          }
          if(whiteKey == 5) {
            note = 8;
          }
          if(whiteKey == 6) {
            note = 10;
          }

        if(this.keyboardNote == note && this.keyboardOctave == octave) {
          this.keyboardContext.fillStyle = selectedKeyColor;
        } else {
          this.keyboardContext.fillStyle = styles.music.pianoRollBlackKey;
        }


        this.keyboardContext.fillRect(i * this.whiteKeyWidth - this.blackKeyWidth / 2,0,this.blackKeyWidth,blackKeyHeight);
      }
    }    
  }
  


}