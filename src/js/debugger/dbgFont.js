var DbgFont = function() {
  this.debuggerFont  = null;

  this.fontCanvas = null;

  // different colour fonts
  this.fontCanvasColors = [];

  this.fontSize = 12;//14;//12;
  this.fontCharWidth = 10;
  this.fontCharHeight = 18;
  this.hexNumberCanvas = [];
  this.hexNumberPositions = [];
  this.cmdCanvas = null;
  this.cmdPositions = {};
  this.retinaFont = true;

  this.fontsCreated = false;
}

DbgFont.prototype = {
  init: function() {

  },

  createFonts: function() {
    if(this.fontsCreated) {
      return;
    }

    this.initDebuggerFont();
    this.initHexNumberCanvas();
    this.initCmdCanvas();
    this.fontsCreated = true;

  },


  setFontSize: function(fontSize) {

    this.fontSize = fontSize;
    if(this.fontsCreated) {
      this.fontsCreated = false;
      this.initDebuggerFont();
      this.createFonts();
    }
  },

  initDebuggerFont: function() {

    if(this.retinaFont) {
      this.fontPx = this.fontSize * UI.devicePixelRatio;
    } else {
      this.fontPx = this.fontSize;
    }

    this.font = this.fontPx + "px \"Courier New\", Courier, monospace";
//this.font = this.fontPx + "px Courier, monospace";
    
    if(this.fontCanvas == null) {
      this.fontCanvas = document.createElement('canvas');
      this.fontCanvas.style.position = 'absolute';
      this.fontCanvas.style.top = '-100px';
      this.fontCanvas.style.left = '0px';

      // need to append it for it to work on firefox
      document.getElementById('ui').appendChild(this.fontCanvas);
    }

    // first, work out the dimensions of a character
    this.fontCanvas.width = this.fontPx * 3;
    this.fontCanvas.height = this.fontPx * 3;
    var context = this.fontCanvas.getContext("2d");
    context.font = this.font;
    context.clearRect(0, 0, this.fontCanvas.width, this.fontCanvas.height);
    var width = 0;
    context.fillStyle= '#ffffff';

    // draw all the characters in the same spot
    for(var i = 0; i < 128; i++) {
      var c = String.fromCharCode(i);
      var textMeasure = context.measureText(c);
      if(textMeasure.width > width) {
        width = textMeasure.width;
      }
      context.fillText(c, 0, this.fontPx * 2);
    }


    var canvasWidth = this.fontCanvas.width;
    var canvasHeight = this.fontCanvas.height;

    var topLine = false;
    var bottomLine = false;
    var imageData = context.getImageData(0, 0, this.fontCanvas.width, this.fontCanvas.height );  
    for(var y = 0; y < canvasHeight; y++) {
      var lineHasPixel = false;
      for(var x = 0; x < canvasWidth; x++) {
        var src = y * canvasWidth * 4 + x * 4;
        if(imageData.data[src] > 100) {
          lineHasPixel = true;
        }
      }

      if(topLine === false && lineHasPixel) {
        topLine = y;
      }

      if(topLine !== false && bottomLine === false && !lineHasPixel) {
        bottomLine = y;
      }
    }

    this.fontCharHeight = bottomLine - topLine + 3;
    this.fontCharWidth = Math.ceil(width);// - 1;

    this.baseLine = bottomLine - this.fontPx * 2


    // black
    this.fontCanvas.width = this.fontCharWidth * 128;
    this.fontCanvas.height = this.fontCharHeight + 6;
    context = this.fontCanvas.getContext("2d");
    context.font = this.font;
    context.fillStyle= '#000000';
    context.fillRect(0, 0, this.fontCanvas.width, this.fontCanvas.height);

    context.fillStyle= '#ffffff';

    for(var i = 0; i < 128; i++) {
      var c = String.fromCharCode(i);
      context.fillText(c, i * this.fontCharWidth, this.fontCharHeight - this.baseLine);
    }

    var colors = [
      '#88aaff',
      '#ff4411'
    ];

    for(var colorIndex = 0; colorIndex < colors.length; colorIndex++) {
      if(this.fontCanvasColors.length <= colorIndex) {
        this.fontCanvasColors[colorIndex] = document.createElement('canvas');
      }

      this.fontCanvasColors[colorIndex].width = this.fontCharWidth * 128;
      this.fontCanvasColors[colorIndex].height = this.fontCharHeight + 6;

      context = this.fontCanvasColors[colorIndex].getContext("2d");
      context.font = this.font;
      context.fillStyle= '#000000';
      context.fillRect(0, 0, this.fontCanvasColors[colorIndex].width, this.fontCanvasColors[colorIndex].height);
  
      context.fillStyle= colors[colorIndex];
  
      for(var i = 0; i < 128; i++) {
        var c = String.fromCharCode(i);
        context.fillText(c, i * this.fontCharWidth, this.fontCharHeight - this.baseLine);
      }
    }

  },

  initCmdCanvas: function() { 


    var cmdCount = MOS6510OpcodeCmds.length;

    if(this.cmdCanvas == null) {
      this.cmdCanvas = document.createElement('canvas');
    }

    this.cmdCanvas.width = 3 * this.fontCharWidth;
    this.cmdCanvas.height = cmdCount * this.fontCharHeight;

    var context = this.cmdCanvas.getContext('2d');
    context.font = this.font;
    context.fillStyle= '#b294bb';

    var charWidth = this.fontCharWidth;
    var charHeight = this.fontCharHeight;
    
    var srcX = 0;
    var srcY = 0;
    var srcWidth = charWidth;
    var srcHeight = charHeight;
    var dstX = 0;
    var dstY = 0;
    var dstWidth = charWidth;
    var dstHeight = charHeight;
    var c = false;

    for(var i = 0; i < cmdCount; i++) {
      var dstX = 0;
      var line = MOS6510OpcodeCmds[i].cmd;
      this.cmdPositions[line] = {
        x: dstX,
        y: dstY
      }

      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = String.fromCharCode(line.charCodeAt(j));

        context.fillText(c, dstX, dstY + charHeight - this.baseLine);

        /*
        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;

        context.drawImage(this.fontCanvas, 
          srcX, 
          srcY, 
          srcWidth, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth, 
          dstHeight);
        */
        dstX += charWidth;

      }      
      dstX = 0;
      dstY += charHeight;
    }
  },

  initHexNumberCanvas: function() {
    var colors = [
      '#ffffff',
      '#aab4ff',
      '#ff94ab'
    ];

    for(var k = 0; k < colors.length; k++) {

      if(this.hexNumberCanvas.length <= k) {
        this.hexNumberCanvas[k] = document.createElement('canvas');
      }
      /*
      if(this.hexNumberCanvas == null) {
        this.hexNumberCanvas = document.createElement('canvas');
      }
      */

      this.hexNumberCanvas[k].width = 16 * 2 * this.fontCharWidth;
      this.hexNumberCanvas[k].height = 16 * this.fontCharHeight;

      var context = this.hexNumberCanvas[k].getContext('2d');

      context.fillStyle= '#000000';
      context.fillRect(0, 0, this.hexNumberCanvas[k].width, this.hexNumberCanvas[k].height);
  
//      context.clearRect(0, 0, this.hexNumberCanvas[k].width, this.hexNumberCanvas[k].height);
      context.font = this.font;
      context.fillStyle = colors[k];//'#b2ffcb';

      var charWidth = this.fontCharWidth;
      var charHeight = this.fontCharHeight;
      
      var dstX = 0;
      var dstY = 0;
      var dstWidth = charWidth;
      var dstHeight = charHeight;
      var c = false;

      for(var i = 0; i < 256; i++) {

        if(i !== 0 && i % 16 === 0) {
          dstX = 0;
          dstY += charHeight;
        }

        var charCodes = hex2Digit[i];
        this.hexNumberPositions[i] = {
          x: dstX,
          y: dstY
        };

        for(var j = 0; j < 2; j++) {
          c = String.fromCharCode(charCodes[j]);

//          context.clearRect(dstX, dstY, dstWidth, dstHeight);
          context.fillText(c, dstX, dstY + charHeight - this.baseLine);
  /*
          srcX = c * charWidth;
          context.drawImage(this.fontCanvas, 
                      srcX, 
                      srcY, 
                      srcWidth, 
                      srcHeight, 
                      dstX, 
                      dstY, 
                      dstWidth, 
                      dstHeight);
  */

          dstX += charWidth;  

        }
  //      dstX += 10;
      }
    }

  },

}