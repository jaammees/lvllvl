var ImportC = function() {
  this.editor = null;

  this.cols = 40;
  this.rows = 25;
  this.machine = 'c64';
  this.charset = 'upper';
}


ImportC.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  doImport: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please select a grid layer');
      return;
    }


    var multi1 = layer.getC64Multi1Color();
    var multi2 = layer.getC64Multi2Color();


    var frameCount = this.getFrameCount();
    layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);      

    var screenWidth = this.getScreenWidth();
    var screenHeight = this.getScreenHeight();

    this.editor.graphic.setGridDimensions({ width: screenWidth, height: screenHeight});


    var currentFrame = this.editor.graphic.getCurrentFrame();
    for(var frameIndex = 0; frameIndex < frameCount; frameIndex++) {

      if(frameIndex != 0) {
        var newFrame = this.editor.graphic.insertFrame();
        this.editor.frames.gotoFrame(newFrame);
      }

      var screenData = [];
      this.getScreenData(screenData, frameIndex);
      var colorData = [];
      this.getColorData(colorData, frameIndex);

      var bgColor = this.getBackgroundColor(frameIndex);
      var borderColor = this.getBorderColor(frameIndex);

      layer.setBackgroundColor(bgColor);
      layer.setBorderColor(borderColor);

      var extendedBackground = false;

      var args = {};
      
      args.update = false;
      for(var y = 0; y < screenHeight; y++) {
        for(var x = 0; x < screenWidth; x++) {
          var pos = x + y * screenWidth;
          var c = screenData[pos];
          var bc = this.editor.colorPaletteManager.noColor;

          if(extendedBackground) {
            var backgroundColorIndex = (c) >> 6;
            bc = bgColor;
            if(backgroundColorIndex == 1) {
              bc = multi1;
            }
            if(backgroundColorIndex == 2) {
              bc = multi2;
            }
            c = c & 0x3f;
          }
          args.x = x;
// reverseY          args.y = this.screenHeight - y - 1;
          args.y = y;
          
          args.t = c; 
          args.fc = colorData[pos];
          args.bc = bc;
          layer.setCell(args);
        }
      }
    }
 
    var tileSet = layer.getTileSet();

    if(!tileSet.isPetscii()) {
      //tileSet.readBinaryData({ tileData: C64CharROM, characterWidth: 8, characterHeight: 8 });


      this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });
    }


    this.editor.frames.gotoFrame(currentFrame);
    this.editor.gridView2d.findViewBounds();    
    this.editor.graphic.invalidateAllCells();


    this.editor.graphic.redraw({ allCells: true });

  },

  read: function(content) {
    // defaults
    this.cols = 40;
    this.rows = 25;
    this.machine = 'c64';
    this.charset = 'upper';


    content = content.replace("\r", "");

    var lines = content.split("\n");
    
    // look for META
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var pos = line.indexOf('META:');
      if(pos !== -1) {
        pos += 5;
        line = line.substring(pos).trim();
        var meta = line.split(" ");
        if(meta.length >= 4) {
          this.cols = meta[0];
          this.rows = meta[1];
          this.machine = meta[2];
          this.charset = meta[3];
        }
        console.log('meta: ' );
        console.log(line);
      }
    }

    console.log('cols = ' + this.cols + ',' + this.rows);

    // read in the frames
    var index = 0;
    var line = lines[index];

    this.frames = [];
    var frameCount = 0;
    while(true) {
      while(index < lines.length - 1 && line.indexOf('char') === -1) {
        index++;
        line = lines[index];
      }

      index++;
      line = lines[index];

      while(index < lines.length - 1 && line.indexOf('//') === 0) {
        index++;
        line = lines[index];
        console.log('line = ' + line);
      }

//      index++;


      if(index >= lines.length) {
        console.log('done: ' + frameCount + ' frames');
        console.log(this.frames);
        return;
      }


      // next line should be border, bg
      line = lines[index];

      console.log('line index === ' + line);
      var parts = line.split(',');
      if(parts.length > 4 || parts.length < 2) {
        // uh oh
        console.log('parts = ');
        console.log(parts);
        console.log('too many parts for border, bg');
        return;
      }

      var border = parseInt(parts[0], 10);
      var bg = parseInt(parts[1], 10);

      var charData = [];
      for(var i = 0; i < this.rows; i++) {
        index++;
        if(index >= lines.length) {
          // uh oh
          console.log('not enough data');
          return;
        }
        var line = lines[index];
        var parts = line.split(',');
        for(var j = 0; j < this.cols; j++) {
          if(j >= parts.length) {
            // uh oh

            console.log('not enough data for row');
            console.log(parts);
            return;
          }
          var c = parseInt(parts[j], 10);
          if(isNaN(c)) {
            console.log('not an int: ' + j + ':' + parts[j]);
          } else {
            charData.push(c);
          }
        }
      }

      var colorData = [];
      for(var i = 0; i < this.rows; i++) {
        index++;
        if(index >= lines.length) {
          // uh oh
          console.log('not enough data');
          return;
        }

        var line = lines[index];
        var parts = line.split(',');
        for(var j = 0; j < this.cols; j++) {
          if(j >= parts.length) {
            // uh oh
            console.log('not enough data for row');
            return;
          }
          var c = parseInt(parts[j], 10);
          if(isNaN(c)) {
            console.log('not an int: ' + c);
          } else {
            colorData.push(c);
          }
        }
      }

      this.frames.push({
        border: border,
        bg: bg,
        charData: charData,
        colorData: colorData
      });

      frameCount++;
      if(frameCount > 200) {
        break;
      }
    }
  },

  getFrameCount: function() {
    return this.frames.length;
  },

  getScreenData: function(screenData, frameIndex, offX, offY) {
    var frame = this.frames[0];
    if(typeof frameIndex != 'undefined') {
      frame = this.frames[frameIndex];
    }

    var offsetX = 0;
    var offsetY = 0;
    if(typeof offX != 'undefined') {
      offsetX = offX;
    }
    if(typeof offY != 'undefined') {
      offsetY = offY;
    }

    var dataLength = this.cols * this.rows;

    for(var i = 0; i < dataLength; i++) {
      var p = i + offsetX + offsetY * this.cols;
      if(p >= dataLength) {
        break;
      }
      screenData[i] = frame.charData[p];
    }
  },

  getColorData: function(colorData, frameIndex, offX, offY) {
    var frame = this.frames[0];
    if(typeof frameIndex != 'undefined') {
      frame = this.frames[frameIndex];
    }

    var offsetX = 0;
    var offsetY = 0;
    if(typeof offX != 'undefined') {
      offsetX = offX;
    }
    if(typeof offY != 'undefined') {
      offsetY = offY;
    }
    var dataLength = this.cols * this.rows;

    for(var i = 0; i < dataLength; i++) {
      var p = i + offsetX + offsetY * this.cols;
      if(p >= dataLength) {
        break;
      }      
      colorData[i] = frame.colorData[p];
    }
  },

  getBackgroundColor: function(frameIndex) {
    var frame = this.frames[0];
    if(typeof frameIndex != 'undefined') {
      frame = this.frames[frameIndex];
    }

    return frame.bg;

  },

  getBorderColor: function(frameIndex) {
    var frame = this.frames[0];
    if(typeof frameIndex != 'undefined') {
      frame = this.frames[frameIndex];
    }

    return frame.border;

  },

  getScreenWidth: function() {
    return this.cols;
  },

  getScreenHeight: function() {
    return this.rows;
  }
}
