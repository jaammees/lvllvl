var ExportQubicle = function() {
  this.editor = null;

  this.data = null;
  this.voxels = [];
  this.palette = [];

  this.width = 0;
  this.height = 0;
  this.depth = 0;
}


//https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt

ExportQubicle.prototype = {
  init: function(editor) {
    this.editor = editor;   

    for (var i = 256; --i > -1;) {
      this.palette.push(0xff000000 | i | (i << 8) | (i << 16));
    }

    this.voxels = [];

  },


  setVoxel: function(x, y, z, i) {
    i |= 0;
    x |= 0;
    y |= 0;
    z |= 0;

    if (i >= 0 && i < 256 && x >= 0 && y >= 0 && z >= 0 && x < this.width && z < this.height && y < this.depth) {
      var key = x + "_" + y + "_" + z
      if (i > 0) {
        if (!this.voxels[key]) this.vcount++;
        this.voxels[key] = i;
      } else {
        if (this.voxels[key]) this.vcount--;
        delete this.voxels[key];
      }
    }
  },


  writeString: function(str) {
    for (var i = 0, j = str.length; i < j; ++i) {
      this.data.push(str.charCodeAt(i));
    }
  },

  writeUInt32: function(n) {
    this.data.push(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
  },

  writeByte: function(b) {
    this.data.push(b);
  },


 
  writeRGBA: function(n) {
    this.data.push((n >>> 16) & 0xff,(n >>> 8) & 0xff, n & 0xff, (n >>> 24) & 0xff);
  },
  
  writeVoxel: function(key) {
    var v = key.split("_");
    this.data.push(v[0], v[1], v[2], this.voxels[key]);
  },

  exportAs: function(filename) {
    this.data = [];
    this.voxels = [];
    this.vcount = 0;

    for(var i = 0; i < 16; i++) {
      var color = this.editor.petscii.getColor(i);
      this.palette[i] = color;
      var colorR = (color >> 16) & 255;
      var colorG = (color >> 8) & 255;
      var colorB =  color & 255;

    }
    // z is y
    var sizeX = this.editor.frames.width * this.editor.petscii.charWidth;
    var sizeY = this.editor.frames.depth * this.editor.petscii.charDepth;
    var sizeZ = this.editor.frames.height * this.editor.petscii.charHeight;




    var gridWidth = sizeX / this.editor.petscii.charWidth;
    var gridHeight = sizeZ / this.editor.petscii.charHeight;
    var gridDepth = sizeY / this.editor.petscii.charDepth;

/*
    for(var z = 0; z < gridDepth; z++) {
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {

          var charIndex =  this.editor.frames.frames[frame].data[this.editor.frames.depth - 1 - z][y][x].character;
          var colorIndex =  this.editor.frames.frames[frame].data[z][y][x].color;

          if(charIndex != 32) {


            var charX = charIndex % 32;
            var charY = Math.floor(charIndex / 32);

              for(var j = 0; j < this.editor.petscii.charHeight; j++) {
                for(var i = 0; i < this.editor.petscii.charWidth; i++) {
                  var srcX = i;// Math.floor(i / this.scale);
                  var srcY = j;//Math.floor(j / this.scale);
                  var srcPos =  ((charX) * this.editor.petscii.charWidth + srcX + ((charY * this.editor.petscii.charHeight) + this.editor.petscii.charHeight - 1 - srcY) * this.editor.charsImageData.width) * 4;
                  //var dstPos = ((x * this.editor.petscii.charWidth * this.scale) + i + this.borderWidth * this.scale + ((y * this.editor.petscii.charHeight * this.scale) + j + this.borderHeight * this.scale) * imageData.width) * 4;
                  if(this.editor.charsImageData.data[srcPos] > 100) {
                    for(k = 0; k < this.editor.petscii.charDepth; k++) {
                      this.setVoxel(x * 8 + i, z * 8 + k, y * 8 + j, colorIndex + 1);
                    }

                  } else {

                  }

                }
              }
          }

        }
      }
    }
*/

    var voxelCount = this.vcount;


/*
    WRITE(uint32_t, 257, file); // version
    WRITE(uint32_t, 0, file);   // color format RGBA
    WRITE(uint32_t, 1, file);   // orientation right handed
    WRITE(uint32_t, 0, file);   // no compression
    WRITE(uint32_t, 0, file);   // vmask
    WRITE(uint32_t, count, file);
*/

    // version
    this.writeUInt32(257);

    // color format RGBA
    this.writeUInt32(0);

    // z axis orientation 0=left handed or 1=right handed
    this.writeUInt32(0);

    // 0 = uncompressed
    this.writeUInt32(0);

    // visibility mask, 0 = Alpha shows visibility
    this.writeUInt32(0);

    // matrix count
    this.writeUInt32(1);

    // write out the matrix


    // name length
    this.writeByte(7);

    // name
    this.writeString('petscii');

    //size x
    this.writeUInt32(sizeX);

    //size y
    this.writeUInt32(sizeY);

    //size z
    this.writeUInt32(sizeZ);


    // pos x 
    this.writeUInt32(0);

    // pos y
    this.writeUInt32(0);

    // pos z 
    this.writeUInt32(0);


    var frame = 0;

/*
    for(var i = 0; i < sizeX * sizeY * sizeZ; i++) {
      var r = 255;
      var g = 0;
      var b = 0;
      var a = 255;
      this.writeUInt32((r>>24) + (g >> 16) + (b >> 8) + a);
    }
*/

    console.log('depth = ' + gridDepth + ', height = ' + gridHeight + ', width = ' + gridWidth);

    for(var z = 0; z < gridDepth; z++) {
      for(var k = 0; k < this.editor.petscii.charDepth; k++) {
        for(var y = 0; y < gridHeight; y++) {
          for(var j = 0; j < this.editor.petscii.charHeight; j++) {
            for(var x = 0; x < gridWidth; x++) {

              var charIndex =  this.editor.frames.frames[frame].data[this.editor.frames.depth - 1 - z][y][x].character;
              var colorIndex =  this.editor.frames.frames[frame].data[z][y][x].color;

              var color = this.editor.petscii.getColor(colorIndex);
//              color = (color << 8) + 255;

              var r = 255;
              var g = 0;
              var b = 255;

/*
      var r = (color >> 16) & 255;
      var g = (color >> 8) & 255;
      var b =  color & 255;
*/

              var a = 255;

              if(charIndex != this.editor.characterSetManager.blankCharacter) {
                var charX = charIndex % 32;
                var charY = Math.floor(charIndex / 32);

                for(var i = 0; i < this.editor.petscii.charWidth; i++) {
                  var srcX = i;// Math.floor(i / this.scale);
                  var srcY = j;//Math.floor(j / this.scale);
                  var srcPos =  ((charX) * this.editor.petscii.charWidth + srcX + ((charY * this.editor.petscii.charHeight) + this.editor.petscii.charHeight - 1 - srcY) * this.editor.charsImageData.width) * 4;

                  if(this.editor.charsImageData.data[srcPos] > 100) {

                    this.writeUInt32((r<<24) + (g << 16) + (b << 8) + a);
//                    this.writeUInt32(color);

                  } else {
//                    this.writeUInt32((r<<24) + (g << 16) + (b << 8) + a);
                    this.writeUInt32(0);

                  }

                }
              } else {
                for(var i = 0; i < this.editor.petscii.charWidth; i++) {
                  this.writeUInt32(0);
                }



              }
            }

          }
        }
      }
    }



    var data = new Uint8Array(this.data.length);   

    for(var i = 0; i < this.data.length; i++) {
      data[i] = this.data[i];
    }


    if(filename.indexOf('.qb') == -1) {
      filename += ".qb";
    }
    download(data, filename, "application/qb");



  }

}

