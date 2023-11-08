var ImportSeq = function() {
  this.editor = null;

  this.cols = 40;
  this.rows = 25;
  this.machine = 'c64';
  this.charset = 'upper';

  this.screenData = [];
  this.colorData = [];

  this.colors = [
    0x90, //black
    0x05, //white
    0x1c, //red
    0x9f, //cyan
    0x9c, //purple
    0x1e, //green
    0x1f, //blue
    0x9e, //yellow
    0x81, //orange
    0x95, //brown
    0x96, //pink
    0x97, //grey 1
    0x98, //grey 2
    0x99, //lt green
    0x9a, //lt blue
    0x9b //grey 3
  ];

  this.revsOn = 0x12;
  this.revsOff = 0x92;

}
/*
//https://en.wikipedia.org/wiki/PETSCII
http://sta.c64.org/cbm64pettoscr.html
*/

ImportSeq.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  readSeq: function(content) {
    var cursor = 0;
    var color = 0;
    var revsIsOn = false;

    this.screenData = [];
    this.colorData = [];

    for(var i = 0; i < 1000; i++) {
      this.screenData[i] = 32;
      this.colorData[i] = 0;
    }

    for(var i = 0; i < content.length; i++) {
      var c = content[i];
      if(c == this.revsOn) {
        revsIsOn = true;
      } else if(c == this.revsOff) {
        revsIsOn = false;
      } else if(c == 3) {
        // run/stop
      } else if(c == 8) {
        // shift disable
      } else if(c == 9) {
        // shift enable
      } else if(c == 13) {   // 0xd
        // carriage return
        cursor = (cursor) - (cursor % 40);
      } else if(c == 14) {   // 0xe
        // text mode
      } else if(c == 17) {   // 0x11
        // cursor down
        cursor += 40;
      } else if(c == 19) {   // 0x13
        // home
        cursor = 0;
      } else if(c == 20) {   // 0x14
        // del
        cursor--;
        if(cursor < 0) {
          cursor = 0;
        }
        this.screenData[cursor] = 0x20;

      } else if(c == 29) {   // 0x1d
        // cursor right
        cursor++;
      } else if(c >= 32 && c <= 63) {
        // maps to screen code
        var screenCode = c;
        if(revsIsOn) {
          screenCode += 128; 
        }
        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;
        cursor++;
      } else if(c >= 64 && c <= 95) {
        var screenCode = c - 64;
        if(revsIsOn) {
          screenCode += 128; 
        }        
        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;

        cursor++;

      } else if(c >= 96 && c <= 127) {
        var screenCode = c - 32;
        if(revsIsOn) {
          screenCode += 128; 
        }

        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;


        cursor++;

 /*
      } else if(c >= 128 && c <= 159) {
        var screenCode = c + 64;
*/
      } else if(c == 141) {
        // line feed
//        cursor += 40;
        cursor = (cursor + 40) - (cursor % 40);

      } else if(c == 142) {
        // graphics
      } else if(c == 145) {
        cursor -= 40;
      } else if(c == 147) {
        for(var j = 0; j < 1000; j++) {
          this.screenData[j] = 32;          
        }
        // clr
      } else if(c == 148) {
        // insert
      } else if(c == 157) {
        // cursor left
        cursor--;
      } else if(c == 160) {
        // shift space
        cursor++;
      } else if(c > 160 && c <= 191) {
        var screenCode = c - 64;
        if(revsIsOn) {
          screenCode += 128; 
        }

        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;


        cursor++;

      } else if(c >= 192 && c <= 223) {
        var screenCode = c -128;
        if(revsIsOn) {
          screenCode += 128; 
        }

        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;


        cursor++;
      } else if(c >= 224 && c <= 254) {
        var screenCode = c -128;
        if(revsIsOn) {
          screenCode += 128; 
        }

        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;


        cursor++;
      } else if(c == 255) {
        var screenCode = 94;
        if(revsIsOn) {
          screenCode += 128; 
        }

        this.screenData[cursor] = screenCode;
        this.colorData[cursor] = color;


        cursor++;

      } else {
        var isAColor = false;
        for(var j = 0; j < this.colors.length; j++) {
          if(c == this.colors[j]) {
            color = j;
            isAColor = true;
            break;
          }
        }

        if(isAColor === false) {
        }
      }
    }
    
  },

  getScreenWidth: function() {
    return this.cols;
  },

  getScreenHeight: function() {
    return this.rows;
  },

  getFrameCount: function() {
    return 1;
  },

  getScreenData: function(screenData) {
    for(var i = 0; i < 1000; i++) {
      screenData[i] = this.screenData[i];
    }
  },

  getColorData: function(colorData) {
    for(var i = 0; i < 1000; i++) {
      colorData[i] = this.colorData[i];
    }
  }
  
}
