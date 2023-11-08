// not used????!!!!/???!

var ScreenAPI = {};

ScreenAPI.getWidth = function() {
  var editor = g_app.textModeEditor;
  return editor.frames.getWidth();
}

ScreenAPI.getHeight = function() {
  var editor = g_app.textModeEditor;
  return editor.frames.getHeight();
}

ScreenAPI.clear = function(apiArgs) {
  var editor = g_app.textModeEditor;

  var args = {};
  var frame = editor.frames.getCurrentFrame();

  if(typeof apiArgs != 'undefined') {
    if(typeof apiArgs.frame != 'undefined') {
      frame = parseInt(apiArgs.frame, 10);
      if(isNaN(frame)) {
        console.log('frame is not a number');
        return;
      }
      if(frame >= editor.frames.getFrameCount()) {
        console.log('frame too big' + frame);
        return;
      }
    }
  }

  for(var z = 0; z < editor.grid.depth; z++) {
    for(var y = 0; y < editor.grid.height; y++) {
      for(var x = 0; x < editor.grid.width; x++) {
        if(editor.grid.gridData[z][y][x].character != 32) {
          editor.grid.setCell({t: editor.tileSetManager.blankCharacter, x:x, y:y, z:z });
        }
      }
    }
  }



}
ScreenAPI.setCell = function(apiArgs) {
  var editor = g_app.textModeEditor;
  var colorPalette = editor.colorPaletteManager.getCurrentColorPalette();
  var tileSet = editor.tileSetManager.getCurrentTileSet();
  var grid = editor.grid;


  var args = {};

  if(typeof apiArgs.x != 'undefined') {
    args.x = parseInt(apiArgs.x, 10);
    if(isNaN(args.x)) {
      console.log('x is not a number ' + apiArgs.x);
      return;
    }
  } else {
    console.log('x not set!');
    return;
  }



  if(typeof apiArgs.y != 'undefined') {
    args.y = parseInt(grid.height - 1 - apiArgs.y, 10);
    if(isNaN(args.x)) {
      console.log('y is not a number ' + apiArgs.y);
      return;
    }
  } else {
    console.log('y not set!');
  }


  if(typeof apiArgs.frame != 'undefined') {
    args.frame = parseInt(apiArgs.frame, 10);
    if(isNaN(args.frame)) {
      console.log('frame is not a number');
      return;
    }
    if(args.frame >= editor.frames.getFrameCount()) {
      console.log('frame count too big' + apiArgs.frame);
      return;
    }
  }


  if(typeof apiArgs.t != 'undefined') {
    args.c = apiArgs.t % tileSet.getTileCount();
    if(isNaN(args.c)) {
      console.log('t is not a number' + apiArgs.t);
    }
  }

  if(typeof apiArgs.fc != 'undefined') {
    args.fc = apiArgs.fc % colorPalette.getColorCount();
  }
  if(typeof apiArgs.bc != 'undefined') {
    args.bc = apiArgs.bc % colorPalette.getColorCount();
  }



  args.z = g_app.textModeEditor.grid.getXYGridPosition();

  if(typeof apiArgs.layer != 'undefined') {
    args.z = editor.layers.getLayerZFromLabel(apiArgs.layer);
    if(args.z === false) {
      console.log("can't find layer '" + apiArgs.layer + "'");
      return;
    }
  }


  g_app.textModeEditor.frames.setCell(args);

}


ScreenAPI.getCell = function(apiArgs) {
  var editor = g_app.textModeEditor;
  var colorPalette = editor.colorPaletteManager.getCurrentColorPalette();
  var tileSet = editor.tileSetManager.getCurrentTileSet();
  var grid = editor.grid;

  var args = {};

  if(typeof apiArgs.x != 'undefined') {
    args.x = parseInt(apiArgs.x, 10);
    if(isNaN(args.x)) {
      console.log('x is not a number ' + apiArgs.x);
      return;
    }
  } else {
    console.log('x not set!');
    return;
  }


  if(typeof apiArgs.y != 'undefined') {
    args.y = parseInt(grid.height - 1 - apiArgs.y, 10);
    if(isNaN(args.x)) {
      console.log('y is not a number ' + apiArgs.y);
      return;
    }
  } else {
    console.log('y not set!');
  }

  if(typeof apiArgs.frame != 'undefined') {
    args.frame = parseInt(apiArgs.frame, 10);
    if(isNaN(args.frame)) {
      console.log('frame is not a number');
      return;
    }
    if(args.frame >= editor.frames.getFrameCount()) {
      console.log('frame count too big' + apiArgs.frame);
      return;
    }
  }  

  args.z = g_app.textModeEditor.grid.getXYGridPosition();

  if(typeof apiArgs.layer != 'undefined') {
    args.z = editor.layers.getLayerZFromLabel(apiArgs.layer);
    if(args.z === false) {
      console.log("can't find layer '" + apiArgs.layer + "'");
      return;
    }
  }

  var cell = editor.frames.getCell(args);
  if(cell === false) {
    return;
  }

  return { t: cell.c, fc: cell.fc, bc: cell.bc };
//  return  { t: 12, fc: 32, bc: 12};
}


FrameAPI = function() {
  this.frameID = 0;
}


FrameAPI.prototype = {
  init: function(editor, frameID) {
    this.editor = editor;
    this.frameID = frameID;
  },

  clear: function() {
    this.showFrame();

    for(var z = 0; z < this.editor.grid.depth; z++) {
      for(var y = 0; y < this.editor.grid.height; y++) {
        for(var x = 0; x < this.editor.grid.width; x++) {
          if(this.editor.grid.gridData[z][y][x].character != 32) {
            this.editor.grid.setCell({c: this.editor.tileSetManager.blankCharacter, x:x, y:y, z:z });
          }
        }
      }
    }

  },

  getCell: function(x, y, z) {
    var zCoord = z;
    if(typeof z == 'undefined') {
      zCoord = this.editor.grid.getXYGridPosition();
    }

    x = parseInt(x, 10);
    y = parseInt(y, 10);
    z = parseInt(zCoord, 10);

    if(!this.checkCoordinates(x, y, z)) {
      return;
    }

    var frame = this.editor.frames.frames[this.frameID];
    return {
      "ch": frame.data[z][y][x].character,
      "fg": frame.data[z][y][x].color,
      "bg": frame.data[z][y][x].bgColor

    };
  },

  getWidth: function() {
    return this.editor.frames.width;
  },

  getHeight: function() {
    return this.editor.frames.height;
  },

  showFrame: function() {
    if(this.editor.frames.currentFrame != this.frameID) {
      this.editor.frames.setCurrentFrame(this.frameID);
    }
  },
  setBackgroundColor: function(color) {
    this.showFrame();
    this.editor.tools.setBackgroundColor(color);
  },
  setDuration: function(duration) {

    if(this.editor.frames.currentFrame == this.frameID) {
      $('#frameDuration').val(duration);
    }
    this.editor.frames.frames[this.frameID].duration = duration;

  },

  checkCoordinates: function(x, y, z) {

    if(isNaN(x)) {
      console.log('invalid x');
      return false;
    }

    if(isNaN(y)) {
      console.log('invalid y');
      return false;
    }

    if(isNaN(z)) {
      console.log('invalid z');
      return false;
    }


    if(x < 0) {
      console.log('x too small');
      return false;
    }
    if(x >= this.editor.grid.width) {
      console.log('x too big');
      return false;
    }

    if(y < 0) {
      console.log('y too small');
      return false;
    }
    if(y >= this.editor.grid.height) {
      console.log('y too big');
      return false;
    }

    if(z < 0) {
      console.log('z too small');
      return false;
    }

    if(z >= this.editor.grid.depth) {
      console.log('z too big');
      return false;
    }

    return true;
  },

//  setCell: function(x, y, z, character, color) {

  // args.c - character
  // args.x - x pos
  // args.y - y pos
  // args.z - z pos
  // args.fc - foreground color
  // args.bc - background color
  // args.rx - rotation x
  // args.ry - rotation y
  // args.rz - rotation z
  setCell: function(args) {

    if(typeof args == 'undefined') {
      console.log('no arguments');
      return;
    }

    var x = 0;
    var y = 0;
    var z = this.editor.grid.getXYGridPosition();

    var character = 0;
    var color = 0;
    var bgColor = false;

    if(typeof args.x != 'undefined') {
      x = parseInt(args.x, 10);
    }

    if(typeof args.y != 'undefined') {
      y = parseInt(args.y, 10);
    }

    if(typeof args.z != 'undefined') {
      z = parseInt(args.z, 10);
    }

    if(typeof args.ch != 'undefined') {
      character = parseInt(args.ch, 10);
    }

    if(typeof args.fg != 'undefined') {
      color = parseInt(args.fg, 10);
    }

    if(typeof args.bg != 'undefined') {
      bgColor = parseInt(args.bg, 10);
    }

    if(this.editor.frames.currentFrame != this.frameID) {
      this.editor.frames.setCurrentFrame(this.frameID);
    }

    x = parseInt(x, 10);
    y = parseInt(y, 10);
    z = parseInt(z, 10);

    if(!this.checkCoordinates(x, y, z)) {
      return;
    }


    this.editor.grid.setCell({ c: character, x: x, y: y, z: z, fc: color, bc: bgColor});

  }

}