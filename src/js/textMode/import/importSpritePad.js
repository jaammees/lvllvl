var ImportSpritePad = function() {
  this.editor = null;

  this.sprites = [];
  this.animations = [];

}
//  Details of the SpritePad SPD format
// https://csdb.dk/forums/index.php?roomid=7&topicid=125812

// https://github.com/Esshahn/spritemate/blob/master/src/js/Load.js
ImportSpritePad.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  readSpritePad: function(content) {

    var index = 0;
    var version = 0;

    // 83, 80, 68
    if(content[index++] != 83 
        || content[index++] != 80
        || content[index++] != 68) {
      // not a spritepad file
//      console.log('not spritepad!!');
    //  return;
      version = 0;
    } else {
      version = content[index++];
    }

    console.log('sprite pad version: ' + version);

    if(version === 0) {
      var length = content.length;
      if ((length & 63) != 3 || length > 256*64+3 || length < 67) {
        console.log('not charpad');
        return ;
      }

      index = 0;
      this.backgroundColor = content[index++];
      this.multiColor1 = content[index++];
      this.multiColor2 = content[index++];

      this.spriteCount = (length - 3) / 64;
      this.animationCount = 0;
    } else if(version === 1) {
      this.spriteCount = content[index++] + 1;
      this.animationCount = content[index++] + 1;
      this.backgroundColor = content[index++];
      this.multiColor1 = content[index++];
      this.multiColor2 = content[index++];
    } else if(version === 2) {
      var subVersion = content[index++]; // ???
      this.spriteCount = content[index++];
 
      content[index++]; // ??
      content[index++]; // ??
      content[index++]; // ??

      this.animationCount = content[index++];
      content[index++]; // ??
      content[index++]; // ??
      content[index++]; // ??

      this.backgroundColor = content[index++];
      this.multiColor1 = content[index++];
      this.multiColor2 = content[index++];


    }

    console.log('sprite count' + this.spriteCount);
    console.log('animation count = ' + this.animationCount);
    console.log('background color = ' + this.backgroundColor);
    console.log('multicolor 1 = ' + this.multiColor1);
    console.log('multicolor 2 = ' + this.multiColor2);

    this.sprites = [];

    for(var i = 0; i < this.spriteCount; i++) {
      var spriteData = [];
      for(var j = 0; j < 63; j++) {

        var value = content[index++];
        spriteData.push(value);
      }
      var flags = content[index++];
      var overlay = (flags >> 4) & 1;

      this.sprites.push({
        spriteData: spriteData,
        color: flags & 0xf,
        overlay: overlay,
        multi: (flags >> 7) & 1,
        flags: flags
      });

    }

    this.animations = [];


    if(version == 0) {

    }

    if(version == 1) {
      for(var i = 0; i < this.animationCount; i++) {
        var animationStarts = content[index++];
        this.animations.push({
          start: animationStarts
        });
      }
      for(var i = 0; i < this.animationCount; i++) {
        var animationEnds = content[index++];
        this.animations[i].end = animationEnds;
      }
      for(var i = 0; i < this.animationCount; i++) {
        var timers = content[index++];
        this.animations[i].timer = timers;
      }
      for(var i = 0; i < this.animationCount; i++) {
        var flags = content[index++];
        this.animations[i].flags = flags;
      }
    }

    if(version == 2) {
      for(var i = 0; i < this.animationCount; i++) {
        // 2 bytes per index
        var animationStartsLow = content[index++];
        var animationStartsHigh = content[index++]; // guess

        var animationStarts = animationStartsLow;
        this.animations.push({
          start: animationStarts
        });
      }

      for(var i = 0; i < this.animationCount; i++) {
        var animationEndsLow = content[index++];
        var animationEndsHigh = content[index++];
        var animationEnds = animationEndsLow;
        this.animations[i].end = animationEnds;
      }
      for(var i = 0; i < this.animationCount; i++) {
        var timers = content[index++];
        this.animations[i].timer = timers;
      }
      for(var i = 0; i < this.animationCount; i++) {
        var flags = content[index++];
        this.animations[i].flags = flags;
      }

    }

    if(this.animations.length == 0) {
      this.animations.push({
        start: 0,
        end: this.sprites.length - 1,
        timer: 12,
        flags: 0
      });
    }

    if(this.animations.length == 1 && this.animations[0].start == this.animations[0].end) {
      this.animations[0].start = 0;
      this.animations[0].end = this.sprites.length - 1,
      this.animations[0].timer = 12;
      this.animations[0].flags = 0;
    }

    console.log(this.sprites);

  },


  doImport: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var graphic = this.editor.graphic;

    graphic.setDrawEnabled(false);
    this.editor.history.setEnabled(false);


    var tileWidth = this.getTileWidth();
    var tileHeight = this.getTileHeight();
    //var tiles = this.getTiles();

    var screenWidth = this.getGridWidth();
    var screenHeight = this.getGridHeight();    

    var tileSet = layer.getTileSet();

    var x = 0;
    var y = 0;

    layer.setCreateSpriteTiles(false);
    layer.setBlankTileId(0);

    layer.setC64Multi1Color(this.multiColor1);
    layer.setC64Multi2Color(this.multiColor2);
    layer.setBackgroundColor(this.editor.colorPaletteManager.noColor);

    var screenMode = TextModeEditor.Mode.TEXTMODE;

    var spriteCount = 0;

    var importedSprites = {};

    var frameRanges = [];

    var frame = graphic.getCurrentFrame();

    // check if need another layer
    var sprites = this.sprites;
    var hasOverlay = false;
    var overlayScreenMode = TextModeEditor.Mode.TEXTMODE;
    var overlayLayer = null;

    for(var i = 0; i < sprites.length; i++) {
      if(sprites[i].overlay == 1) {
        hasOverlay = true;
        break;
      }
    }

    if(hasOverlay) {
      var layers = this.editor.layers;
      var overlayLayerId = layers.newLayer({ 
        label: 'overlay',
        screenMode: overlayScreenMode 
      });
      overlayLayer = this.editor.layers.getLayerObject(overlayLayerId);

    }


    for(var i = 0; i < this.animations.length; i++) {
      var start = this.animations[i].start;
      var end = this.animations[i].end;
      var frameCount = end - start + 1;

      var timer = this.animations[i].timer;

      var startFrame = frame;
      if(spriteCount !== 0) {
        startFrame++;
      }

      /*
      frameRanges.push({
        start: startFrame,
        end: startFrame + frameCount
      });
*/

      var startFrame = frame;
      var frameCount = 0;
      for(var spriteIndex = start; spriteIndex <= end; spriteIndex++) {
        frameCount++;
        var sprite = this.sprites[spriteIndex];
        var spriteData = sprite.spriteData;

        if(sprite.multi) {
          screenMode = TextModeEditor.Mode.C64MULTICOLOR;
        }

        var tileId = '';
        if(importedSprites.hasOwnProperty(spriteIndex)) {
          tileId = importedSprites[spriteIndex];
        } else {
          // should test if already created this sprite...
          tileId = tileSet.createTile();
          importedSprites[spriteIndex] = tileId;
          var foregroundColor = sprite.color;
          var tileData = [];

          for(var j = 0; j < spriteData.length; j++) {
            var b = spriteData[j];
            for(var k = 7; k >= 0; k--) {
              var p = (b >>> k) & 1;
              tileData.push(p);
            }
          }
          tileSet.setTileData(tileId, tileData);
        }


        var duration = timer;

        if(spriteCount !== 0) {          
          frame = graphic.insertFrame(frame, duration);
          graphic.setCurrentFrame(frame);
        } else {
          graphic.setCurrentFrame(frame);
          graphic.setFrameDuration(duration, frame);
        } 

        var args = {};
        args.update = false;
        args.x = x;
        args.y = y;

        args.t = tileId; 
        args.fc = foregroundColor;
        args.bc = this.editor.colorPaletteManager.noColor;

        layer.setCell(args);

        if(sprite.overlay) {
          // next sprite is an overlay..
          spriteIndex++;
          sprite = this.sprites[spriteIndex];
          var spriteData = sprite.spriteData;
          var tileId = '';

          if(importedSprites.hasOwnProperty(spriteIndex)) {
            tileId = importedSprites[spriteIndex];
          } else {
            // should test if already created this sprite...
            tileId = tileSet.createTile();
            importedSprites[spriteIndex] = tileId;
            var foregroundColor = sprite.color;
            var tileData = [];
  
            for(var j = 0; j < spriteData.length; j++) {
              var b = spriteData[j];
              for(var k = 7; k >= 0; k--) {
                var p = (b >>> k) & 1;
                tileData.push(p);
              }
            }
            tileSet.setTileData(tileId, tileData);
          }

          var args = {};
          args.update = false;
          args.x = x;
          args.y = y;
  
          args.t = tileId; 
          args.fc = foregroundColor;
          args.bc = this.editor.colorPaletteManager.noColor;
  
          overlayLayer.setCell(args);
          
        }

        spriteCount++;


      }

      frameRanges.push({
        start: startFrame,
        end: startFrame + frameCount
      });
  
    }


    graphic.setFrameRanges(frameRanges);

    /*
    for(var i = 0; i < this.sprites.length; i++) {
      var spriteData = this.sprites[i].spriteData;
      if(this.sprites[i].multi) {
        screenMode = TextModeEditor.Mode.C64MULTICOLOR;
      }

      var tileId = tileSet.createTile();
      var foregroundColor = this.sprites[i].color;

      var tileData = [];

      for(var j = 0; j < spriteData.length; j++) {
        var b = spriteData[j];
        for(var k = 7; k >= 0; k--) {
          var p = (b >>> k) & 1;
          tileData.push(p);
        }
      }

      tileSet.setTileData(tileId, tileData);

      if(i !== 0) {
        var frame = graphic.insertFrame();
        graphic.setCurrentFrame(frame);
      }

      var args = {};
      args.update = false;
      args.x = x;
      args.y = y;
          
      args.t = tileId; 
      args.fc = foregroundColor;
      args.bc = this.editor.colorPaletteManager.noColor;

      layer.setCell(args);
    }
    */


    layer.setCreateSpriteTiles(true);
    layer.setScreenMode(screenMode);

    this.editor.history.setEnabled(true);

    graphic.setDrawEnabled(true);

  },


  getTileWidth: function() {
    return 24;
  },

  getTileHeight: function() {
    return 21;
  },

  getGridWidth: function() {
    return 1;
  },

  getGridHeight: function() {
    return 1;
  },

  getAnimations: function() {
    return this.animations;
  },

  getSprites: function() {
    return this.sprites;
  },

  getSprite: function(index) {
    return this.sprites[index];
  },

  getMulti1: function() {
    return this.multiColor1;
  },

  getMulti2: function() {
    return this.multiColor2;
  },

  getBackgroundColor: function() {
    return this.backgroundColor;
  }

}
