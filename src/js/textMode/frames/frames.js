var FRAMERATE = 1000/50;

var Frames = function() {
  this.editor = null;
  this.frames = null;
//  this.frameCount = 0;
//  this.currentFrame = 0;

  this.width = 40;
  this.height = 25;
  this.depth = 25;


  this.playFrames = false;
  this.lastFrameTime = 0;

  this.showPrevFrame = false;

  this.playDirection = 1;

  this.playMode = "loop";
  this.tick = 0;
  this.lastTickTime = 0;

  // character dimensions currently used by frames
  this.framesCharWidth = 0;
  this.framesCharHeight = 0;
  this.framesCharDepth = 0;

  this.hasCharRotation = false;
  this.hasCharFlip = false;

  this.blockWidth = 2;
  this.blockHeight = 2;

  this.updatedCellRanges = [];
}

Frames.prototype = {
  init: function(editor) {
    this.editor = editor;
    var frames = this;

    this.frames = null;//[];
    this.frameCount = 0;
  },


  // load the frame data from the current doc
  load: function() {

    console.error('remove this? Frames::load');

    //get the doc
    var doc = this.editor.doc;
    if(doc.data.frames == null) {
      doc.data.frames = [];
    }

    this.frames = doc.data.frames;
    this.frameCount = doc.data.frames.length;
    this.width = doc.data.width;//settings.width;
    this.height = doc.data.height;//settings.height;
    this.depth = doc.data.depth;//settings.depth;

        
    this.tileSetId = doc.data.tileSetId;
    this.colorPaletteId = doc.data.colorPaletteId;

    this.editor.tileSetManager.setCurrentTileSetFromId(this.tileSetId);
    this.editor.colorPaletteManager.setCurrentColorPaletteFromId(this.colorPaletteId);
    
//    this.blockSetId = doc.data.blockSetId;
//    this.editor.blockSetManager.setCurrentBlockSetFromId(this.blockSetId);

    this.blockMode = false;

    if(this.editor.graphic.frames.length == 0) {
      this.editor.graphic.setFrameCount(1);
    } else {
      for(var i = 0; i < this.frames.length; i++) {
        this.frames[i].holder = new THREE.Object3D();
      }
    }

//    this.resizeGrid();
    this.setCurrentFrame(0);
  },

  getBlockModeEnabled: function() {
    return this.blockMode;
  },

  setBlockModeEnabled: function(enabled) {
    this.blockMode = enabled;
    UI('mode-blockmode').setChecked(enabled);

  },
/*
  initFrameBlocks: function(blockId) {
    for(var i = 0; i < this.frames.length; i++) {
      var gridData = this.frames[i].data;
      for(var z = 0; z < gridData.length; z++) {
        for(var y = 0; y < gridData[z].length; y++) {
          for(var x = 0; x < gridData[z][y].length; x++) {
            if(typeof gridData[z][y][x].b === 'undefined') {
              gridData[z][y][x].b = blockId;
            }

          }
        }
      }
    }
  },

  setBlockDimensions: function(width, height) {
    // need to make sure current block set is compatible..
    this.blockWidth = parseInt(width, 10);
    this.blockHeight = parseInt(height, 10);
  },
*/
  getWidth: function() {
    console.error(' not here frames get wdtih');
    return this.width;
  },

  getHeight: function() {
    console.error('frames get height');
    return this.height;
  },

  getDepth: function() {
    return this.depth;
  },

/*
  getBlockWidth: function() {
    return this.blockWidth;
//    return this.editor.blockSetManager.getCurrentBlockSet().getWidth();
  },

  getBlockHeight: function() {
    return this.blockHeight;
//    return this.editor.blockSetManager.getCurrentBlockSet().getHeight();
  },

  getXOffsetInBlock: function(x) {
    var xOffset = x % this.getBlockWidth();
    return xOffset;
  },

  getYOffsetInBlock: function(y) {
//    var yOffset = this.getBlockHeight() - y % this.getBlockHeight() - 1;
    var yOffset = y % this.getBlockHeight() ;

    return yOffset;
  },
*/
  getShowPrevFrame: function() {
    return this.showPrevFrame;
  },


  initEvents: function() {

    var _this = this;


    $('#showGhostFrame').on('click', function() { 
     _this.setShowPrevFrame($('#showGhostFrame').is(':checked'));
    });


    $('#frameDuration').on('change', function() {
      var duration = parseInt($('#frameDuration').val());
      _this.setFrameDuration(duration);
    });

    $('#frameDuration').on('keyup', function() {
      var duration = parseInt($('#frameDuration').val());
      if(!isNaN(duration)) {
        _this.setFrameDuration(duration);
      }
    });


    $('#createFrame').on('click', function() {
      _this.createFrame();
    });

    $('#insertFrame').on('click', function() {
      _this.insertFrame();
    });

    $('#duplicateFrame').on('click', function() {
      if(g_app.getMode() != '3d') {
        var frame = _this.editor.graphic.duplicateFrame();
        _this.gotoFrame(frame);
      } else {
        var frame = _this.editor.grid3d.duplicateFrame();
        _this.gotoFrame(frame);
      }
    });

    $('#deleteFrame').on('click', function() {
      _this.deleteFrame();
    });

    $('#prevFrame').on('click', function() {
      _this.prevFrame();
    });
    $('#nextFrame').on('click', function() {
      _this.nextFrame();
    });

    $('#currentFrame').on('change', function() {
      var frame = $('#currentFrame').val();
      _this.gotoFrame(frame - 1);
    });

    /*
    $('#currentFrame').on('change', function() {
      var frame = $('#currentFrame').val();
      _this.gotoFrame(frame);
    });
    */
    $('#play').on('click', function() {
      _this.play();
    });

    $('#playMode').on('change', function(){
      _this.setPlayMode($(this).val());
    });
  },

  insertFrame: function(frame, duration, frameData, layerFrameData) {
    console.log('insert frame!');
    // need to do this for sprites
    var color = this.editor.currentTile.getColor();    
    var frameLocation = frame;

    if(g_app.getMode() != '3d') {

      if(typeof frame == 'undefined') {
        frameLocation = this.editor.graphic.getCurrentFrame();
      }
      frameLocation = this.editor.graphic.insertFrame(frameLocation, duration, frameData, layerFrameData);
      this.gotoFrame(frameLocation);

      // need to do this for sprites
      this.editor.currentTile.setColor(color);
    } else {
      if(typeof frame == 'undefined') {
        frameLocation = this.editor.grid3d.getCurrentFrame();
      }

      frameLocation = this.editor.grid3d.insertFrame(frameLocation, duration);
      this.gotoFrame(frameLocation);      
    }




  },
  

  deleteFrame: function(frame) {

    if(g_app.getMode() != '3d') {

      var currentFrame = this.editor.graphic.getCurrentFrame();
      if(typeof frame != 'undefined') {
        currentFrame = frame;
      }

      if(this.editor.graphic.deleteFrame(currentFrame)) {
        if(currentFrame > 0) {
          currentFrame--;

          this.gotoFrame(currentFrame);
        } else {

          this.editor.graphic.invalidateAllCells();
          this.editor.graphic.redraw();
          this.gotoFrame(0);
        }
      } else {
        alert('Unable to delete frame');
      }
    } else {
      var currentFrame = this.editor.grid3d.getCurrentFrame();
      if(typeof frame != 'undefined') {
        currentFrame = frame;
      }
      if(this.editor.grid3d.deleteFrame(currentFrame)) {
        if(currentFrame > 0) {
          currentFrame--;

          this.gotoFrame(currentFrame);
        } else {
          this.gotoFrame(0);
        }
      } else {
        alert('Unable to delete frame');
      }


    }

    this.frameTimeline.draw();

  },
  
  setShowPrevFrame: function(show) {
    if(show) {
      this.showPrevFrame = true;
      if(this.currentFrame > 1) {
//        this.editor.grid.setGridGhostData(this.frames[this.currentFrame - 1].data, this.frames[this.currentFrame - 1].holder);
      }
//      this.editor.grid.update();

      this.setCurrentFrame(this.currentFrame);

    } else {
      this.showPrevFrame = false;    
//      this.editor.grid.setGridGhostData(null, null);
//      this.editor.grid.update();
      this.setCurrentFrame(this.currentFrame);

    }
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true });

  },

  initEventsMobile: function() {

    var _this = this;

    $('#createFrameMobile').on('click', function() {
      _this.createFrame();
    });

    $('#insertFrameMobile').on('click', function() {
      _this.insertFrame();
    });

    $('#duplicateFrameMobile').on('click', function() {
      var frame = _this.editor.graphic.duplicateFrame();
      _this.gotoFrame(frame);
    });

    $('#deleteFrameMobile').on('click', function() {
      _this.deleteFrame();
    });

    $('#prevFrameMobile').on('click', function() {
      _this.prevFrame();
    });
    $('#nextFrameMobile').on('click', function() {
      _this.nextFrame();
    });

    $('#playMobile').on('click', function() {
      _this.play();
    });

  },

  buildInterface: function(parentComponent) {
    var _this = this;
    this.uiComponent = UI.create("UI.SplitPanel");
    this.htmlComponent = UI.create("UI.HTMLPanel");
    this.frameTimelinePanel = UI.create("UI.Panel");
    this.uiComponent.addSouth(this.frameTimelinePanel, 20, false);
    this.uiComponent.add(this.htmlComponent);

    parentComponent.add(this.uiComponent);

    UI.on('ready', function() {
      _this.htmlComponent.load("html/textMode/frames.html", function() {
        _this.initEvents();
      });
    });



    this.frameTimeline = new FrameTimeline();
    this.frameTimeline.init(this.editor);
    this.frameTimeline.buildInterface(this.frameTimelinePanel);
  },

  buildMobileInterface: function(parentComponent) {
    var _this = this;
    this.mobileHtmlComponent = UI.create("UI.HTMLPanel");

    parentComponent.add(this.mobileHtmlComponent);

    UI.on('ready', function() {
      _this.mobileHtmlComponent.load("html/textMode/framesMobile.html", function() {
        _this.initEventsMobile();
      });
    });

  },


  keyDown: function(event) {
    var keyCode = event.keyCode;
    if(keyCode == 46) {
      // del key
      return;
    }
    var c = String.fromCharCode(keyCode).toUpperCase();

    if(keyCode == 190) {
      c = '.';
    }

    if(keyCode == 188) {
      c = ',';
    }
    switch(c) {
      case keys.textMode.framesNext.key:
        this.nextFrame();
      break;
      case keys.textMode.framesPrev.key:
        this.prevFrame();
      break;
    }


  },

  keyUp: function(event) {

  },

  keyPress: function(event) {

  },

  getBackgroundColor: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frames && frame !== false && frame < this.frames.length) {
      bgColor = this.frames[frame].bgColor;
      if(typeof bgColor != 'undefined') {
        return bgColor;
      }
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    bgColor = colorPalette.getDefaultBackgroundColor();
    return bgColor;
  },

  setBackgroundColor: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      this.frames[this.currentFrame].bgColor = color;
    } 

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }

    var colorHexString = colorPalette.getHexString(color);

    $('.backgroundColorMobile').css('background-color', '#' + colorHexString);
    $('.backgroundColor').css('background-color', '#' + colorHexString);
    $('.backgroundColorDisplay').css('background-color', '#' + colorHexString);

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }
  },



  getBorderColor: function(frameIndex) {
    var frame = frameIndex;
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }
    if(this.frames && frame !== false && frame < this.frames.length) {
      bgColor = this.frames[frame].borderColor;
      if(typeof bgColor != 'undefined') {
        return bgColor;
      }
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    bgColor = colorPalette.getDefaultBorderColor();
    return bgColor;
  },

  setBorderColor: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }


    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      this.frames[this.currentFrame].borderColor = color;
    } 

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(!colorPalette) {
      return;
    }
    var colorHexString = colorPalette.getHexString(color);
    $('.borderColor').css('background-color', '#' + colorHexString);
    $('.borderColorMobile').css('background-color', '#' + colorHexString);

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }

  },


  hasCellBackgroundColors: function() {

    var frameCount = this.frameCount;
    if(frameCount > 10) {
      frameCount = 10;
    }
    for(var frame =0; frame < frameCount; frame++) {
      if(this.frames[frame].data) {
        for(var z = 0; z < this.depth; z++) {
          for(y = 0; y < this.height; y++) {
            for(x = 0; x < this.width; x++) {
              if(this.frames[frame].data[z][y][x].bc != this.editor.colorPaletteManager.noColor) {
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  },
/*
  getC64Multi1Color: function() {

    if(!this.frames || this.currentFrame === false) {
      return this.editor.colorPaletteManager.noColor;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      color = this.frames[this.currentFrame].c64Multi1Color;
      if(typeof color != 'undefined') {
        return color;
      }
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    color = 11;  
    return color;
  },

  setC64Multi1Color: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      this.frames[this.currentFrame].c64Multi1Color = color;
    } 

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    $('.c64Multi1Color').css('background-color', '#' + colorPalette.getHexString(color));
    $('.c64Multi1ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }
  },


  getC64Multi2Color: function() {
    if(!this.frames || this.currentFrame === false) {
      return this.editor.colorPaletteManager.noColor;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      color = this.frames[this.currentFrame].c64Multi2Color;
      if(typeof color != 'undefined') {
        return color;
      }
    }
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    color = 12;  
    return color;
  },

  setC64Multi2Color: function(color, update) {
    if(!this.frames || this.currentFrame === false) {
      return;
    }

    if(this.currentFrame !== false && this.currentFrame < this.frames.length) {
      this.frames[this.currentFrame].c64Multi2Color = color;
    } 

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    $('.c64Multi2Color').css('background-color', '#' + colorPalette.getHexString(color));
    $('.c64Multi2ColorDisplay').css('background-color', '#' + colorPalette.getHexString(color));

    if(typeof update === 'undefined' || update === true) {
      this.colorsUpdated();
    }

  },

*/
  // TODO: where is best for this?
  replaceColor: function(color, replacement) {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var material = colorPalette.getMaterial(replacement);
    if(!material) {
      return;
    }

    for(var frame = 0; frame < this.frames.length; frame++) {
      var data = this.frames[frame].data;
      for(var z = 0; z < this.depth; z++) {
        for(y = 0; y < this.height; y++) {
          for(x = 0; x < this.width; x++) {
            if(data[z][y][x].fc == color) {
              if(data[z][y][x].mesh) {
                if(data[z][y][x].mesh.fgMesh) {
                  data[z][y][x].mesh.fgMesh.material = material;
                } else {
                  data[z][y][x].mesh.material = material;
                }
              }
              data[z][y][x].fc = replacement;
            }
            if(data[z][y][x].bc == color) {
              data[z][y][x].bc = replacement;
              if(data[z][y][x].mesh) {
                data[z][y][x].material = material;
              }
            }
          }
        }
      }
    }
  },

  clear: function() {
    if(this.playFrames) {
      this.playFrames = false;
    }
    
    for(var frame = 0; frame < this.frames.length; frame++) {
      this.clearFrame(frame);
    }
    this.frames = [];
    this.frameCount = 0;

//    this.setFrameCount(1);
  },

  clearFrame: function(frame) {
    if(frame < 0 || frame >= this.frames.length) {
      return;
    }

    if(this.frames[frame].data) {
      for(var z = 0; z < this.depth; z++) {
        for(y = 0; y < this.height; y++) {
          for(x = 0; x < this.width; x++) {
            if(this.frames[frame].data[z][y][x].mesh) {
              // TODO: find proper way of removing mesh
              this.frames[frame].holder.remove(this.frames[frame].data[z][y][x].mesh);
              this.frames[frame].data[z][y][x].mesh = null;
            }
            /*
            this.frames[frame].data[z][y][x].character = this.editor.tileSetManager.blankCharacter;
            this.frames[frame].data[z][y][x].color = 0;
            this.frames[frame].data[z][y][x].bgColor = false;         
            */   
          }
        }
      }
      this.frames[frame].data = null;
    }
  },

/*

  // recreate frames if dimensions or character dimensions change
  setDimensions: function(width, height, depth) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    // TODO: account for pixel dimensions...
    if(width == this.width && height == this.height && depth == this.depth 
      && this.framesCharWidth == tileSet.charWidth 
      && this.framesCharHeight == tileSet.charHeight
      && this.framesCharDepth == tileSet.charDepth) {
      return;
    }

    this.framesCharWidth = tileSet.charWidth;
    this.framesCharHeight = tileSet.charHeight;
    this.framesCharDepth = tileSet.charDepth;



    if(this.width !== width || this.height !== height || this.depth !== depth) {
      // frames need resizing

      if(this.width == width && this.height == height) {
        // ok, just adding a xy layer..
        if(depth > this.depth) {
          for(var frame = 0; frame < this.frameCount; frame++) {
            var difference = depth - this.depth;
            while(this.frames[frame].data.length < depth) {
              var z = this.frames[frame].data.length ;
              this.frames[frame].data[z] = [];
              for(var y = 0; y < height; y++) {
                this.frames[frame].data[z][y] = [];
                for(var x = 0; x < width; x++) {
                  this.frames[frame].data[z][y][x] = {
                    c: this.editor.tileSetManager.blankCharacter, 
                    fc: 1, 
                    bc: -1,
                    fh: 0,
                    fv: 0,
                    rz: 0
                  };
                  if(this.hasCharRotation) {
                    this.frames[frame].data[z][y][x].rx = 0;
                    this.frames[frame].data[z][y][x].ry = 0;
                  }
                }
              }
            }
          }
        } else {
          // remove a layer
          var difference = this.depth - depth;
          for(var frame = 0; frame < this.frameCount; frame++) {
            this.frames[frame].data.splice(this.frames[frame].data.length - difference - 1, difference);
          }

        }
      } else {
        // need to rebuild grid

        var newFrames = [];
        for(var frame = 0; frame < this.frameCount; frame++) {

          // copy over the settings
          newFrames[frame] = {};
          newFrames[frame].holder = this.frames[frame].holder;

          newFrames[frame].duration = this.frames[frame].duration;
          newFrames[frame].bc = this.frames[frame].bc;

          var data = this.frames[frame].data;
          if(data) {
            newFrames[frame].data = [];
            for(var z = 0; z < depth; z++) {
              newFrames[frame].data[z] = [];
              for(var y = 0; y < height; y++) {
                newFrames[frame].data[z][y] = [];
                for(var x = 0; x < width; x++) {
                  if(z < data.length && y < data[z].length && x < data[z][y].length) {
                    // copy existing frame data
                    newFrames[frame].data[z][y][x] = {};
                    for(var key in data[z][y][x]) {
                      newFrames[frame].data[z][y][x][key] = data[z][y][x][key];
                    }
                  } else {
                    // need to insert new data
                    newFrames[frame].data[z][y][x] =  { c: this.editor.tileSetManager.blankCharacter, fc: 1, bc: -1, rz: 0, fh: 0, fv: 0 };
                    if(this.hasCharRotation) {
                      newFrames[frame].data[z][y][x].rx = 0;
                      newFrames[frame].data[z][y][x].ry = 0;

                    }
                  }
                }
              }
            }
          }
        }

        var doc = this.editor.doc;
        doc.data.frames = newFrames;
        this.frames = doc.data.frames;
      }
      this.width = width;
      this.depth = depth;
      this.height = height;

      var doc = this.editor.doc;

      doc.data.width = width;
      doc.data.height = height;
      doc.data.depth = depth;

    }


    this.resizeGrid();
    this.setCurrentFrame(this.currentFrame);

    this.editor.grid.update({ allCells: true });

    

  },


  resizeGrid: function() {
    // now resize the grid
    this.editor.grid.width = this.width;
    this.editor.grid.depth = this.depth;
    this.editor.grid.height = this.height;

    // create grid only really needed for 3d mode.
    this.editor.grid.createGrid();
  },
*/
/*
  insertFrame: function(frame, duration, frameData) {
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }
    if(typeof duration == 'undefined') {
      duration = this.frames[this.currentFrame].duration;
    }

    // copy the background color from the current frame
    var bgColor = this.getBackgroundColor();
    var borderColor = this.getBorderColor();

    var holder = new THREE.Object3D();
//    holder.castShadow = true;
//    holder.receiveShadow = true;

    var frameObject = null;
    if(typeof frameData != 'undefined') {
      frameObject = frameData;
      frameObject.holder = holder;
    } else {
      frameObject = { data: null, holder: holder, duration: duration, bgColor: bgColor, borderColor: borderColor };
    }


    frameObject.c64Multi1Color = this.getC64Multi1Color();
    frameObject.c64Multi2Color = this.getC64Multi2Color();

    this.frames.splice(frame + 1, 0, frameObject);

    this.frameCount++;
//    $('#frameCount').val(this.frameCount);    

    this.updateFrameInfo();
    this.setCurrentFrame(frame + 1);

    this.editor.history.startEntry('insertframe');
    this.editor.history.addAction('insertframe', { position: frame });
    this.editor.history.endEntry();


  },
*/

  updateFrameInfo: function() {

    var html = ' / ' + this.editor.graphic.frameCount;
    $('#frameCountInfo').html(html);


    if(g_app.isMobile()) {
      var frameNumber = this.editor.graphic.currentFrame + 1;
      html = frameNumber + ' / ' + this.editor.graphic.frameCount;
      $('#frameCountInfoMobile').html(html);
    }
  },

  setFrameData: function(frame, frameData, z) {

    alert("SET FRAME DATA");
    console.error("SET FRAME DATA");

    if(this.frames[frame].data == null) {
      this.frames[frame].data = [];
    } 

    var data = this.frames[frame].data;
    
    var hasRotationFlip = typeof frameData[0][0].rz != 'undefined';
    var hasBlocks = this.getBlockModeEnabled() && frameData[0][0].b != 'undefined';

    data[z] = [];
    for(var y = 0; y < this.height; y++) {
      data[z][y] = [];
      for(var x = 0; x < this.width; x++) {

        if(y < frameData.length && x < frameData[0].length) {
          data[z][y][x] = { c: frameData[y][x].t, fc: frameData[y][x].fc, bc: frameData[y][x].bc, rz: 0, fh: 0, fv: 0 };
          if(hasRotationFlip) {
            data[z][y][x].rz = frameData[y][x].rz;
            data[z][y][x].fh = frameData[y][x].fh;
            data[z][y][x].fv = frameData[y][x].fv;
          }

/*
          if(this.hasCharRotation) {
            data[z][y][x].rx = 0;
            data[z][y][x].ry = 0;            
          }

          if(this.getBlockModeEnabled()) {
            data[z][y][x].b = 0;
          }
*/

        } else {

          data[z][y][x] = { c: this.editor.tileSetManager.blankCharacter, fc: 1, bc: -1, rz: 0, fh: 0, fv: 0 };

          if(this.hasCharRotation) {
            data[z][y][x].rx = 0;
            data[z][y][x].ry = 0;            
          }

          if(this.getBlockModeEnabled()) {
            data[z][y][x].b = 0;
          }
        }
      }
    }
  },

  createFrameData: function(frame) {
    console.error("CREATER FRAME DATA");
    alert('create frame data');
    // create the data for the frame if it doesn't exist
    if(this.frames[frame].data == null) {
      var data = [];
      for(var z = 0; z < this.depth; z++) {
        data[z] = [];
        for(var y = 0; y < this.height; y++) {
          data[z][y] = [];
          for(var x = 0; x < this.width; x++) {

            data[z][y][x] = { c: this.editor.tileSetManager.blankCharacter, fc: 1, bc: -1, rz: 0, fh: 0, fv: 0 };

            if(this.hasCharRotation) {
              data[z][y][x].rx = 0;
              data[z][y][x].ry = 0;            
            }

            if(this.getBlockModeEnabled()) {
              data[z][y][x].b = 0;
            }
          }
        }
      }
      this.frames[frame].data = data;
    }
  },

  setCurrentFrame: function(frame) {
    frame = parseInt(frame, 10);

    if(isNaN(frame) || frame >= this.frameCount || frame < 0) {
      //console.log('not within frame count');
      return false;
    }

    this.currentFrame = parseInt(frame, 10);

/*
    this.createFrameData(this.currentFrame);

    for(var z = 0; z < this.depth; z++) {
      this.updatedCellRanges[z] = { minX: 0, maxX: this.width, minY: 0, maxY: this.height };
    }

    this.editor.grid.setGridData(this.frames[frame].data, this.frames[frame].holder);

    if(this.showPrevFrame) {
      if(frame > 0) {
        this.editor.grid.setGridGhostData(this.frames[frame - 1].data, this.frames[frame - 1].holder);
      } else {
        this.editor.grid.setGridGhostData(null, null);
      }
    }
*/

    var userCurrentFrame = this.currentFrame + 1;
    if(g_app.isMobile()) {
      var frameNumber = this.currentFrame + 1;
      html = frameNumber + ' / ' + this.frameCount;
      $('#frameCountInfoMobile').html(html);
    } 

    $('#currentFrame').val(userCurrentFrame);    
    $('#frameDuration').val(this.frames[frame].duration);


return;
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var bgColor = this.frames[frame].bgColor;

    var borderColor = this.frames[frame].borderColor;

    if(colorPalette) {
      if(typeof bgColor == 'undefined') {
        bgColor = colorPalette.getDefaultBackgroundColor();

        this.frames[frame].bgColor = bgColor;
      }

      if(typeof borderColor == 'undefined') {
        borderColor = colorPalette.getDefaultBorderColor();
        this.frames[frame].borderColor = borderColor;
      }
    }

    this.editor.tools.currentBackgroundColor = bgColor;
//    this.editor.grid.setBackgroundColor(bgColor);

    //this.editor.grid.setBorderColor(borderColor);

    if(bgColor !== this.editor.colorPaletteManager.noColor  && bgColor >= 0) {
//      var colorHex = colorPalette.getHexString(bgColor);
//      $('.backgroundColor').css('background-color', '#' + colorHex);
      this.setBackgroundColor(bgColor, false);
    }

    if(borderColor !== this.editor.colorPaletteManager.noColor && borderColor >= 0) {
//      var colorHex = colorPalette.getHexString(bgColor);
      this.setBorderColor(borderColor, false);

    }
    // TODO: readd this..
    if(this.editor.type == '2d') {
      this.editor.grid.update();
//      this.editor.grid.grid2d.update();
//      this.editor.layers.updateAllLayerPreviews();
    }

    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.currentFrame = this.currentFrame;


    this.frameTimeline.draw();

  },
/*
  invalidateAllCells: function() {
    for(var z = 0; z < this.depth; z++) {
      this.updatedCellRanges[z] = { minX: 0, maxX: this.width, minY: 0, maxY: this.height };
    }

  },
*/

  nextFrame: function() {
    var currentFrame = false;
    
    if(g_app.getMode() != '3d') {
      currentFrame = this.editor.graphic.getCurrentFrame();
    } else {
      currentFrame = this.editor.grid3d.getCurrentFrame();
    }
    this.gotoFrame(currentFrame + 1);

  },

  prevFrame: function() {
    var currentFrame = false;
    
    if(g_app.getMode() != '3d') {
      currentFrame = this.editor.graphic.getCurrentFrame();
    } else {
      currentFrame = this.editor.grid3d.getCurrentFrame();
    }

    this.gotoFrame(currentFrame - 1);
  },


  setFrameDuration: function(duration, frame) {
    if(g_app.getMode() != '3d') {
      this.editor.graphic.setFrameDuration(duration, frame);
    } else {
      this.editor.grid3d.setFrameDuration(duration, frame);
    }

  },

  gotoFrame: function(frame) {

    // if in a paste move, end it.
    if(this.editor.tools.drawTools.pixelSelect.isInPasteMove()) {
      this.editor.tools.drawTools.pixelSelect.endPasteDrag();
    }

    
    frame = parseInt(frame, 10);
    var frameCount = 0;
    var currentFrame = 0;

    if(g_app.getMode() != '3d') {
      frameCount = this.editor.graphic.getFrameCount();
      currentFrame = this.editor.graphic.getCurrentFrame();
    } else {
      frameCount = this.editor.grid3d.getFrameCount();
      currentFrame = this.editor.grid3d.getCurrentFrame();

    }

    if(isNaN(frame) || frame < 0 || frame >= frameCount) {
      $('#currentFrame').val(parseInt(currentFrame, 10) + 1);
      return;
    }

    var frameDuration = 12;

    if(g_app.getMode() != '3d') {    
      frameDuration = this.editor.graphic.getFrameDuration(frame);
      this.editor.graphic.setCurrentFrame(frame);
      this.frameTimeline.draw();
    } else {
      frameDuration = this.editor.grid3d.getFrameDuration(frame);
      this.editor.grid3d.setCurrentFrame(frame);
    }

    var userCurrentFrame = frame + 1;

    $('#currentFrame').val(userCurrentFrame);
    $('#frameCountInfo').html('/ ' + frameCount);
    $('#frameDuration').val(frameDuration);

    if(g_app.isMobile()) {
      html = userCurrentFrame + ' / ' + frameCount;
      $('#frameCountInfoMobile').html(html);
    } 

    if(this.editor.graphic.getType() == 'sprite') {
      this.editor.updateCurrentColorToSpriteColor();
      if(g_app.isMobile()) {
        this.editor.spriteFramesMobile.highlightCurrentSprite();
      } else {
        this.editor.spriteFrames.highlightCurrentSprite();
      }
    }

    this.editor.updateBackgroundColorPicker();
    this.editor.updateBorderColorPicker();
    this.editor.updateC64MultiColorPickers();
  },

  updateFrameDuration: function() {
    var currentFrame = this.editor.graphic.getCurrentFrame();
    var frameDuration = this.editor.graphic.getFrameDuration(currentFrame);
    $('#frameDuration').val(frameDuration);

  },
  

  setPlayMode: function(playMode) {
    this.playMode = playMode;
    if(this.playMode != 'pingpong') {
      this.playDirection = 1;
    }    
  },

  play: function(forcePlay) {

    if(this.editor.importImage.importInProgress) {
      // don't play if import in progress
      return;
    }

    if(g_app.isMobile()) {
      this.setPlayMode('loop');
    }

    if(typeof forcePlay != 'undefined' && forcePlay) {
      this.playFrames = true;
    } else {
      this.playFrames = !this.playFrames;
    }

    if(g_app.isMobile()) {
      if(this.playFrames) {
        $('#playMobile').html('<i class="halflings halflings-pause"></i>');
      } else {
        $('#playMobile').html('<i class="halflings halflings-play"></i>');
      }

    } else {

      if(this.playFrames) {
        $('#play').html('<i class="halflings halflings-pause"></i>&nbsp;Pause');
      } else {
        $('#play').html('<i class="halflings halflings-play"></i>&nbsp;Play');
      }
    }

  },

  stop: function() {
    if(this.playFrames) {
      this.playFrames = false;
      $('#play').html('<i class="halflings halflings-play"></i>&nbsp;Play');

      if(g_app.isMobile()) {
        $('#playMobile').html('<i class="halflings halflings-play"></i>');
      }
    }

  },

  update: function() {

    var time = getTimestamp();

    if(time - this.lastTickTime >= FRAMERATE) {
      g_tick++;
      this.lastTickTime = time;
    }

    if(g_tick != this.tick) {
      //this.tick++;

      this.tick = g_tick;

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      if(tileSet) {
        tileSet.update(this.tick);
      }


      // call the scripting tick function
      /*
      if(TextMode.tick) {
        TextMode.tick(this.tick);
      }
      */
      g_app.scripting.doTick();

      // TODO: animate color palette
    }

    var mode = g_app.getMode();

    if(this.playFrames) {
      var fromFrame = 0;
      var toFrame = 0;
      var duration = 12;
      var currentFrame = 0;


      if(mode != '3d') {
        toFrame = this.editor.graphic.getFrameCount();
        if(this.editor.graphic.getType() == 'sprite') {
          var frameRanges = this.editor.graphic.getFrameRanges();
          var selectedRange = this.editor.animationPreview.getFrameRange();
    
          if(selectedRange !== '' && selectedRange >= 0 && selectedRange < frameRanges.length) {
            fromFrame = frameRanges[selectedRange].start;
            toFrame = frameRanges[selectedRange].end;
          }
        }

        currentFrame = this.editor.graphic.currentFrame;
        duration = this.editor.graphic.frames[currentFrame].duration;

      } else {
        toFrame = this.editor.grid3d.getFrameCount();
        currentFrame = this.editor.grid3d.getCurrentFrame();
        duration = this.editor.grid3d.getFrameDuration(currentFrame);

      }


      if(time - this.lastFrameTime > duration * FRAMERATE) {
        var frame = currentFrame;

        frame += this.playDirection;

        if(this.playMode == "pingpong") {
          if(frame === fromFrame) {
            this.playDirection = 1;
          }
          if(frame === toFrame) {
            this.playDirection = -1;
          }

          if(frame >= toFrame) {
            frame = fromFrame;
          } else if(frame < fromFrame) {
            frame = fromFrame;
          }
        } else if(this.playMode == "once") {
          if(frame >= toFrame) {
            frame = fromFrame;
            this.editor.animationTools.stop();
            //return;
          }          
        } else {
          if(frame >= toFrame) {
            frame = fromFrame;
          }
          if(frame < fromFrame) {
            frame = fromFrame;
          }
        }

        this.gotoFrame(frame);
//        $('#currentFrame').val(frame + 1);
        this.lastFrameTime = time;
      }
    }
  },


  getCell: function(args) {

    console.error('frame get cell');

    var frame = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frame = args.frame;
    }

    if(isNaN(frame) || frame < 0 || frame >= this.frames.length) {
      return false;
    }

    var gridData = this.frames[frame].data;

    var x = args.x;
    var y = args.y;
    var z = args.z;

    var cell = gridData[z][y][x];

    return cell;

  },

  setCell: function(args) {
    console.error("frame set cell shouldn't get here");

    if(typeof args.c == 'undefined') {
      return;
    }

    var frame = this.currentFrame;
    if(typeof args.frame !== 'undefined') {
      frame = args.frame;
    }

    if(frame === false) {
      return;
    }

    if(isNaN(frame) || frame < 0 || frame >= this.frames.length) {
      return;
    }

    var gridData = this.frames[frame].data;

    var x = args.x;
    var y = args.y;
    var z = args.z;


    // the character id
    var c = args.c;

    // the block
    var b = false;
    if(typeof args.b !== 'undefined') {
      b = args.b;
    }


    var fc = this.editor.currentTile.color;
    if(typeof args.fc !== 'undefined') {
      fc = args.fc;
    }

    var rx = this.editor.currentTile.rotX;
    if(typeof args.rx !== 'undefined') {
      rx = args.rx;
    }

    var ry = this.editor.currentTile.rotY;
    if(typeof args.ry !== 'undefined') {
      ry = args.ry;
    }

    var rz = this.editor.currentTile.rotZ;
    if(typeof args.rz !== 'undefined') {
      rz = args.rz;
    }


    fh = 0;
    if(typeof args.fh !== 'undefined') {
      fh = args.fh;
    }

    fv = 0;
    if(typeof args.fv !== 'undefined') {
      fv = args.fv;
    }
    if(this.editor.grid.selection && this.editor.grid.selection.visible) {
      // if selection visible, only draw characters inside selection
      if(!this.editor.tools.drawTools.select.inSelection(x, y, z)) {
        return;
      }
    }

    if(x >= this.width || x < 0 || y >= this.height || y < 0 || z >= this.depth || z < 0) {
      // outside grid

      return;
    }
    

    var cell = gridData[z][y][x];


    var bc = this.editor.currentTile.bgColor;
    if(typeof args.bc !== 'undefined') {
      bc = args.bc;
    } else {
      if(typeof cell.bc != 'undefined') {
        bc = cell.bc
      } 
    }    

    if(!this.editor.frames.getBlockModeEnabled()) {

      // check if cell has changed
      if(cell.c == c && cell.fc == fc
        && cell.rz == rz
        && cell.fh == fh
        && cell.fv == fv
        &&  (!this.editor.frames.hasCharRotation || (cell.rx == rx && cell.ry == ry && cell.rz == rz)) 
        && cell.bc === bc) {
        // no change
        return;
      }
    }



    // if its the current frame, mark range for redraw.
    if(frame === this.currentFrame) {
      if(x < this.updatedCellRanges[z].minX) {
        this.updatedCellRanges[z].minX = x;
      }
      if(x + 1 > this.updatedCellRanges[z].maxX) {
        this.updatedCellRanges[z].maxX = x + 1;
      }

      if(y < this.updatedCellRanges[z].minY) {
        this.updatedCellRanges[z].minY = y;
      }
      if(y + 1 > this.updatedCellRanges[z].maxY) {
        this.updatedCellRanges[z].maxY = y + 1;
      }
    }



    if(g_app.getEnabled('textmode3d')) {

      var meshX = x * this.cellSizeX + this.cellSizeX / 2;
      var meshY = y * this.cellSizeY + this.cellSizeY / 2;
      var meshZ = z * this.cellSizeZ + this.cellSizeZ / 2;


      // remove mesh for current character
      if(cell && cell.mesh) {
        this.holder.remove(cell.mesh);
        cell.mesh = null;
      }

      if(cell && cell.bgMesh) {
        this.holder.remove(cell.bgMesh);
        cell.bgMesh = null;
      }

      // TODO: check what is 96
      if(c != 96 && (c != this.editor.tileSetManager.blankCharacter || bc !== -1) ) {
        var geometry = null;
        var mesh = null;
        var tileSet = this.editor.tileSetManager.getCurrentTileSet();
        var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
        var colorMaterial = colorPalette.getMaterial(fc);

        if(bc === false) {  
          var geometry = tileSet.getGeometry(c);

          if(typeof geometry == 'undefined') {
          }
          var mesh = new THREE.Mesh(geometry, colorMaterial);
        } else {

          var geometry = tileSet.getGeometry(c);
          var fgMesh = new THREE.Mesh(geometry, colorMaterial);

          var bgMaterial = colorPalette.getMaterial(bc);
          if(bgMaterial !== null) {
            var geometry = tileSet.getBackgroundGeometry(c);
            var mesh = new THREE.Mesh(geometry,  bgMaterial);
            mesh.add(fgMesh);
            mesh.fgMesh = fgMesh;
          } else {
            mesh = fgMesh;
            mesh.fgMesh = null;
          }
        }
        mesh.rotation.order = 'YXZ';
        mesh.rotation.x = rotX * Math.PI * 2;// + Math.PI / 2;
        mesh.rotation.y = rotY * Math.PI * 2;
        mesh.rotation.z = rotZ * Math.PI * 2;

        mesh.position.x = meshX;//x * this.cellSize + this.cellSize / 2;
        mesh.position.y = meshY;//y * this.cellSize + this.cellSize / 2;
        mesh.position.z = meshZ;//z * this.cellSize + this.cellSize / 2;

        // need to retain the original position for when moving selection
        mesh.originalPosition = {};
        mesh.originalPosition.x = meshX;
        mesh.originalPosition.y = meshY;
        mesh.originalPosition.z = meshZ;


        mesh.gridX = x;
        mesh.gridY = y;
        mesh.gridZ = z;
    
        mesh.box = new THREE.Box3(new THREE.Vector3(meshX - this.cellSizeX / 2, meshY - this.cellSizeY / 2, meshZ - this.cellSizeZ / 2),
                                  new THREE.Vector3(meshX + this.cellSizeX / 2, meshY + this.cellSizeY / 2, meshZ + this.cellSizeZ / 2));
        mesh.box.gridPosition = new THREE.Vector3(x, y, z);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        cell.mesh = mesh;

        this.holder.add(mesh);
      }
    }

    // record the action
    var params = { 
                   "x": x, "y": y, "z": z,
                   "oldCharacter": cell.c,
                   "oldColor": cell.fc,
                   "oldBgColor": cell.bc,
                   "oldFh": cell.fh,
                   "oldFv": cell.fv,
                   "oldRz": cell.rz,
                   "newCharacter": c, 
                   "newColor": fc,
                   "newBgColor": bc,
                   "newFh": fh,
                   "newFv": fv,
                   "newRz": rz,
                   "frame": frame
                 };

    if(this.editor.frames.getBlockModeEnabled() && b !== false) {
      params["oldB"] = cell.b;
      params["newB"] = b;
    }

    if(this.editor.frames.hasCharRotation) {
      params["oldRx"] = cell.rx;
      params["oldRy"] = cell.ry;
//      params["oldRotZ"] = cell.rz;
      params["newRx"] = rx;
      params["newRy"] = ry;
//      params["newRotZ"] = rz;
    }                   


    if(!this.editor.frames.getBlockModeEnabled() || b !== false) {
      this.editor.history.addAction("setCell", params);
    }

    cell.c = c;
    cell.fc = fc;
    cell.bc = bc;
    cell.fh = fh;
    cell.fv = fv;
    cell.rz = rz;

    if(this.editor.frames.getBlockModeEnabled()) {
      if(b !== false) {
        // setting the block
        cell.b = b;
      } else {
        // setting a character within the block
        b = gridData[z][y][x].b;
        if(typeof b !== 'undefined') {
          // get the offset in the block
          var xBlockOffset = this.getXOffsetInBlock(x);
          var yBlockOffset = this.getYOffsetInBlock(this.height - y - 1)// this.getBlockHeight() - this.getYOffsetInBlock(y) - 1;
          var blockSet = this.editor.blockSetManager.getCurrentBlockSet();

          blockSet.setCharacterInBlock(b, xBlockOffset, yBlockOffset, c);
        }
      }
    }

    if(this.editor.frames.hasCharRotation) {
      cell.rx = rx;
      cell.ry = ry;
      cell.rz = rz;
    } 
  }
}