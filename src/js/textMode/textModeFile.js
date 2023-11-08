var TextModeFile = function() {
  this.editor = null;
}

TextModeFile.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  load: function(data, callback) {

    alert('load');
    console.error("LOAD!!!!!");

    if(!data.frames) {
      return;
    }

    console.log(data);

    var version = 0;
    if(typeof data.version != 'undefined') {
      version = data.version;
    } else {
      data.version = 0;
    }

    this.editor.history.setEnabled(false);

    // clear frames first
    this.editor.frames.clear();


    if(typeof data.clearColor != 'undefined') {
//      this.editor.clearColor = data.clearColor;
    }


    if(typeof data.floorColor != 'undefined') {
/*
      var red = (data.floorColor & 0xff0000) >> 16;
      var green = (data.floorColor & 0x00ff00) >> 8;
      var blue = (data.floorColor & 0x0000ff);

      this.editor.grid.floor.material.color.setRGB(red/255, green/255, blue/255);
*/      
    }



    var _this = this;
    this.loadTileSets(data, function() {


      var tileSetManager = _this.editor.tileSetManager;
      var current = tileSetManager.getCurrentTileSet();

      _this.loadColorPalettes(data);
      _this.loadFrames(data);

      if(typeof callback != 'undefined') {
        callback();
      }
    });


/*
    if(data.charactersets && data.charactersets.length > 0) {
//      this.editor.petscii.setCharsetData(data.charactersets[0]["data"]);
      for(var i = 0; i < data.charactersets.length; i++) {
        var name = data.charactersets[i].name;
        var type = data.charactersets[i].type;

        if(typeof type == 'undefined') {
          type = 'ascii';
        }


        if(i >= this.editor.tileSets.length) {
          var tileSet = new TileSet();
          tileSet.init(this.editor, name);
          tileSet.setToDefault();

          if(data.charactersets[i]["data"].length > 0) {
            tileSet.type = type;
            tileSet.setCharsetData(data.charactersets[i]["data"]);
            this.editor.tools.setCharPaletteMap(type);            
          } else {
          }

          if(typeof data.charactersets[i]["properties"] != undefined) {
            tileSet.setCharsetProperties(data.charactersets[i]["properties"]);
          }

          this.editor.tileSets.push(tileSet);
        } else {
          if(data.charactersets[i]["data"].length > 0) {
            this.editor.tileSets[i].type = type;

            this.editor.tileSets[i].setCharsetData(data.charactersets[i]["data"]);

            this.editor.tools.setCharPaletteMap(type);
          } else {

            this.editor.tileSets[i].setToDefault();
          }

          if(typeof data.charactersets[i]["properties"] != undefined) {
            this.editor.tileSets[i].setCharsetProperties(data.charactersets[i]["properties"]);
          }

          this.editor.tileSets[i].name = name;
        }
      }
    } else {
      this.editor.petscii.resetTileSet();
    }


    this.editor.selectTileSet(0);


    */
//    this.editor.grid.update();
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

    this.editor.history.setEnabled(true);    
  },


  loadColorPalettes: function(data) {
    var version = data.version;

    this.editor.colorPaletteManager.reset();

    if(typeof data.materials != 'undefined') {
//      this.editor.petscii.setMaterialsData(data.materials);
      var materials = data.materials;
      var colors = [];

      // loop through once to get number of colors
      for(var i = 0; i < materials.length; i++) {
        if(materials[i].i == "floor") {
        } else if(materials[i].i == "background") {
        } else {
          colors.push(materials[i].c);
        }
      }

      // loop through again to put them in the proper place (if index is set..)
      for(var i = 0; i < materials.length; i++) {
        if(materials[i].i == "floor") {
        } else if(materials[i].i == "background") {
        } else {
          if(typeof materials[i].i != 'undefined') {
            colors[materials[i].i] = materials[i].c;
          }
        }
      }
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      colorPalette.setColors(colors);
    } else {
      // file has no color palette, set use default
      this.editor.colorPaletteManager.useDefaultColorPalette();
    }
  },


  // get character set image data from an array of 8 bit values
  // prob only works for 8x8 ?
  tileSetImageData: function(charsetData) {


    var charWidth = 8;
    var charHeight = 8;
    var width = charWidth * 32;
    var height = charHeight * 8;

    if(typeof this.charsCanvas == 'undefined' || !this.charsCanvas) {
      this.charsCanvas = document.createElement('canvas');
      this.charsImageData = null;
      this.charsContext = null;
    }

    if(this.charsCanvas.width != width || this.charsCanvas.height != height || this.charsImageData == null) {
      this.charsCanvas.width = width;
      this.charsCanvas.height = height;
      this.charsContext = this.charsCanvas.getContext("2d");
      this.charsImageData = this.charsContext.getImageData(0, 0, this.charsCanvas.width, this.charsCanvas.height);
    }

    var imageData = this.charsImageData;    

    var index = 0;
    var characters = charsetData.length / charHeight;

    for(var ch = 0; ch < characters; ch++) {
      var charX = ch % 32;
      var charY = Math.floor(ch / 32);    

      for(var y = 0; y < charHeight; y++) {
        var b = charsetData[index++];
        for(var x = 0; x < charWidth; x++) {

        var pos =  ((charX) * charWidth + x + ((charY * charHeight) 
          + y) * imageData.width) * 4;

          var mask = 1 << (charWidth - 1 - x);
          var bt = b & mask;
          if(bt) {
            imageData.data[pos] = 255;
            imageData.data[pos + 1] = 255;
            imageData.data[pos + 2] = 255;
            imageData.data[pos + 3] = 255;

          } else {
            imageData.data[pos] = 0;
            imageData.data[pos + 1] = 0;
            imageData.data[pos + 2] = 0;
            imageData.data[pos + 3] = 0;

          }

        }
      }
    }

    return imageData;

//    this.setCharsetImageData(imageData);
  },


  loadTileSets: function(data, callback) {

    var toLoadCount = 0;
    var loadedCount = 0;
    var calledCallback = false;

    var version = data.version;
    var tileSetManager = this.editor.tileSetManager;



    if(typeof data.charactersets == 'undefined' || data.charactersets.length == 0) {
      // file contains no charactersets, use default..
      tileSetManager.useDefaultTileSet(callback);
      return;
    }

    tileSetManager.reset();

    if(data.charactersets && data.charactersets.length > 0) {
//      this.editor.petscii.setCharsetData(data.charactersets[0]["data"]);

      toLoadCount = data.charactersets.length;

      for(var i = 0; i < data.charactersets.length; i++) {
        var name = data.charactersets[i].name;
        var type = data.charactersets[i].type;

        if(typeof type == 'undefined') {
          type = 'ascii';
        }

        var tileSet = new TileSet();
        tileSet.init(this.editor, name);

        if(data.charactersets[i]["data"].length > 0) {
          tileSet.type = type;

          var imageData = this.tileSetImageData(data.charactersets[i]["data"]);

          tileSet.setFromImageData(imageData);
          loadedCount++;

//          tileSet.setCharsetData(data.charactersets[i]["data"]);
        } else {
          // need to use default..
          tileSet.setToPreset('petscii', function() {
            loadedCount++;
            // call the callback if all charsets loaded
            if(loadedCount == toLoadCount && !calledCallback) {
              if(typeof callback != 'undefined') {
                callback();
                calledCallback = true;
              }
            }
          });
        }

        if(typeof data.charactersets[i]["properties"] != undefined) {
//          tileSet.setProperties(data.charactersets[i]["properties"]);

          var properties = data.charactersets[i]["properties"];
          tileSet.characterProperties = [];
          for(var i = 0; i < 256; i++) {
            tileSet.characterProperties[i] = {};
          }
          for(var i = 0; i < properties.length; i++) {
            var c = properties[i].c;
            tileSet.setAnimated(c, properties[i].a);
            tileSet.setAnimatedType(c, properties[i].at);
            tileSet.setAnimatedTicksPerFrame(c, properties[i].af);
          }
        }
      }
      tileSetManager.addTileSet(tileSet);
    }

    tileSetManager.setCurrentTileSet(0);
    if(typeof callback != 'undefined') {
      if(loadedCount == toLoadCount && !calledCallback) {
        callback();
      }
    }

  },

  loadFrames: function(data) {

    var version = data.version;

    var width = data.width;
    var depth = data.depth;
    var height = data.height;


    var background = data.background;
    if(typeof background == 'undefined') {
      background = 6;
    }
    var border = data.border;
    if(typeof border == 'undefined') {
      border = 14;
    }



    var timeUnits = data.timeUnits;

    if(typeof timeUnits == 'undefined') {
      timeUnits = 'ms';
    }


    var frames = this.editor.frames;
    var frame = 0;
    var handedness = 'right';

    if(version == 0) {
      handedness = 'left';
    }

    // dont use this anymore, this is where cell background colour would be in previous layer
    if(version <= 1) {
//      this.editor.bgInPrevLayer = true;
    }
    
    frames.setDimensions(width, height, depth);
    frames.setFrameCount(data.frames.length);

    //frames.
    for(var frame = 0; frame < data.frames.length; frame++) {
      frames.setCurrentFrame(frame);

      var hasRotation = true;
      if(typeof data.frames[frame].rotation != 'undefined') {
        hasRotation = data.frames[frame].rotation;
      }

      if(typeof data.frames[frame].chars != 'undefined') {
        var frameData = data.frames[frame].chars;
        var i = 0;

        while(i < frameData.length) {
    
          var x = frameData[i++];
          var y = frameData[i++];
          if(handedness == 'left') {
            y = height - 1 - y;
          }
          var z = frameData[i++];
          var character = frameData[i++];
          var color = frameData[i++];
          var bgColor = false;
          if(version >= 1.1) {
            bgColor = frameData[i++];
            if(bgColor == -1) {
              bgColor = false;
            }
          }
          var rotX = 0;
          var rotY = 0;
          var rotZ = 0;
          if(hasRotation) {
            if(version == 0) {
              rotX = frameData[i++];
              rotY = frameData[i++];
            } else {
              var rotation = frameData[i++];
              rotX = rotation & 0x3;
              rotY = (rotation & 0xC) >> 2;
              rotZ = (rotation & 30) >> 4;

              rotX = rotX * 0.25;
              rotY = rotY * 0.25;
              rotZ = rotZ * 0.25;

            }
          }

          this.editor.grid.setCell( {
            c:character, 
            x:x, 
            y:y, 
            z:z, 
            fc:color, 
            rx:rotX, 
            ry:rotY, 
            rz:rotZ, 
            bc:bgColor,
            update: false });
        }
      } else if(typeof data.frames[frame].slices != 'undefined') {
        for(var i = 0; i < data.frames[frame].slices.length; i++) {
          var sliceData = data.frames[frame].slices[i];
          var j = 0;
          var x = 0;
          var y = 0;
          var z = sliceData[j++];
          while(j < sliceData.length) {
            var character = sliceData[j++];
            var color = sliceData[j++];
            var bgColor = false;

            if(version >= 1.1) {
              bgColor = sliceData[j++];
              if(bgColor == -1) {
                bgColor = false;
              }
            }

            var rotX = 0;
            var rotY = 0;
            var rotZ = 0;
            if(hasRotation) {
              console.log('has rotation');
              if(version <= 1) {
                rotX = sliceData[j++];
                rotY = sliceData[j++];
              } else {
                var rotation = sliceData[i++];
                rotX = rotation & 0x3;
                rotY = (rotation & 0xC) >> 2;
                rotZ = (rotation & 30) >> 4;

                rotX = rotX * 0.25;
                rotY = rotY * 0.25;
                rotZ = rotZ * 0.25;

              }
            }
            this.editor.grid.setCell({
              c:character, 
              x:x, 
              y:y, 
              z:z, 
              fc:color, 
              rx:rotX, 
              ry:rotY, 
              rz:rotZ, 
              bc: bgColor,
              update: false});
            x++;
            if(x >= width) {
              x = 0;
              y++;
            }

          }
        }
      }

      frames.frames[frame].duration = data.frames[frame].duration;

      if(timeUnits == 'ms') {
        var durationMultiplier = 0.05;//0.149;
        frames.frames[frame].duration = Math.floor(data.frames[frame].duration * durationMultiplier);
      }

      if(typeof data.frames[frame].bgColor != 'undefined') {
        frames.frames[frame].bgColor = data.frames[frame].bgColor;
      } else {
        frames.frames[frame].bgColor = background;
      }

      if(typeof data.frames[frame].borderColor != 'undefined') {
        frames.frames[frame].borderColor = data.frames[frame].borderColor;
      } else {
        frames.frames[frame].borderColor = border;
      }
    }    

    frames.setCurrentFrame(0);
  },


  getSaveData: function() {
    var frames = this.editor.frames;
    var framesData = [];

    for(var i = 0; i < frames.frameCount; i++) {

      var frame = {};
      frame["duration"] = frames.frames[i].duration;
      frame["bgColor"] = frames.frames[i].bgColor;
      var chars = [];

      // check if has rotation
      var hasRotation = false;
      for(var z = 0; z < frames.depth; z++) {
        for(var y = 0; y < frames.height; y++) {
          for(var x = 0; x < frames.width; x++) {
            if(frames.frames[i].data[z][y][x].rotX != 0 || frames.frames[i].data[z][y][x].rotY != 0 || frames.frames[i].data[z][y][x].rotZ != 0) {
              hasRotation = true;
              y = frames.height;
              z = frames.depth;
              break;
            }
          }
        }
      }

      for(var z = 0; z < frames.depth; z++) {
        for(var y = 0; y < frames.height; y++) {
          for(var x = 0; x < frames.width; x++) {
            var cell = frames.frames[i].data[z][y][x];
            var character = frames.frames[i].data[z][y][x].character;
            var bgColor = cell.bgColor;
            if(character != this.editor.tileSetManager.blankCharacter || bgColor !== false) {
              chars.push(x);
              chars.push(y);
              chars.push(z);
              chars.push(character);
              chars.push(cell.color);
              if(bgColor !== false) {
                chars.push(bgColor);
              } else {
                chars.push(-1);
              }

              if(hasRotation) {
                var rotX = parseInt(cell.rotX * 4) % 4;
                var rotY = parseInt(cell.rotY * 4) % 4;
                var rotZ = parseInt(cell.rotZ * 4) % 4;

                var rotation = rotX + (rotY << 2) + (rotZ << 4);
                chars.push(rotation);
                //var rotation = parseInt(cell.rotX * 4) + parseInt(cell.rotY * 4)
  //                  chars.push(frames.frames[i].data[z][y][x].rotX);
  //                  chars.push(frames.frames[i].data[z][y][x].rotY);
              }
            }
          }
        }
      }

      var slices = [];
      // check if storing full slices is better
      for(var z = 0; z < frames.depth; z++) {
        var sliceEmpty = true;
        for(var y = 0; y < frames.height; y++) {
          for(var x = 0; x < frames.width; x++) {
            var character = frames.frames[i].data[z][y][x].character;
            if(character != this.editor.tileSetManager.blankCharacter || frames.frames[i].data[z][y][x].bgColor !== false) {
              sliceEmpty = false;
              y = frames.height;
              break;
            }
          }
        }


        if(!sliceEmpty) {
          var slice = [];

          slice.push(z);
          for(var y = 0; y < frames.height; y++) {
            for(var x = 0; x < frames.width; x++) {
              var cell = frames.frames[i].data[z][y][x];
              var character = frames.frames[i].data[z][y][x].character;
              var color = frames.frames[i].data[z][y][x].color;
              var bgColor = frames.frames[i].data[z][y][x].bgColor;
              slice.push(character);
              slice.push(color);
              if(bgColor !== false) {
                slice.push(bgColor);
              } else {
                slice.push(-1);
              }
              if(hasRotation) {
                //slice.push(cell.rotX);
                //slice.push(cell.rotY);
                //slice.push(cell.rotZ);
                var rotation = cell.rotX + (cell.rotY << 2) + (cell.rotZ << 4);
                chars.push(rotation);                  

              }
            }
          }
          slices.push(slice);
        }
      }

      var charString = JSON.stringify(chars);
      var slicesString = JSON.stringify(slices);

      if(charString.length < slicesString.length) {
        frame["chars"] = chars;
      } else {
        frame["slices"] = slices;
      }

      frame["rotation"] = hasRotation;

      framesData.push(frame);
    }

    var data = {};
    data["version"] = 1.1;
    data["width"] = frames.width;
    data["depth"] = frames.depth;
    data["height"] = frames.height;
    data["background"] = this.editor.tools.currentBackgroundColor;
    data["border"] = this.editor.tools.currentBorderColor;
    data["frames"] = framesData;
    data["timeUnits"] = "ticks";
    data["clearColor"] = this.editor.clearColor;
    data["floorColor"] = this.editor.floorColor;

//      data["materials"] = this.editor.petscii.getMaterialsData();

    return data;
  }
}