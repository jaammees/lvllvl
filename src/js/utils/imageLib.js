// http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code/


// create histogram of all colours in cell, sorted by use
// go down histogram, find nearest colour in palette, add to new palette, keep going until found 2 new colours
// do the reduction or do the dither...

var ImageLib = function(args) {
  args = args || {};

  this.imageData = null;
  this.histogram = null;
  this.buf8 = null;
  this.buf32 = null;

  this.width = false;
  this.height = false;

  this.cellWidth = 8;
  this.cellHeight = 8;


  // selection of color-distance equation
  this.colorDist = args.colorDist == "manhattan" ? distManhattan : distEuclidean;

  this.palette = [
    [0, 0, 0],
    [255, 255, 255],
    [127, 56, 48],
    [114, 185, 194],
    [128, 55, 168],
    [97, 165, 57],
    [55, 36, 156],
    [204, 219, 102],
    [135, 86, 33],
    [85, 65, 1],
    [181, 107, 100],
    [77, 77, 77],
    [119, 119, 119],
    [166, 237, 125],
    [114, 97, 216],
    [164, 164, 164]
  ];

  this.paletteI32 = [
  ];

  // Rec. 709 (sRGB) luma coef
  var Pr = .2126,
    Pg = .7152,
    Pb = .0722;

  // http://alienryderflex.com/hsp.html
  function rgb2lum(r,g,b) {
    return Math.sqrt(
      Pr * r*r +
      Pg * g*g +
      Pb * b*b
    );
  }


  var rd = 255,
    gd = 255,
    bd = 255;

  var euclMax = Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd);
  // perceptual Euclidean color distance
  function distEuclidean(rgb0, rgb1) {
    var rd = rgb1[0] - rgb0[0],
      gd = rgb1[1] - rgb0[1],
      bd = rgb1[2] - rgb0[2];

    // dont really need the sqrt?
    return Math.sqrt(Pr*rd*rd + Pg*gd*gd + Pb*bd*bd) / euclMax;
  }

  var manhMax = Pr*rd + Pg*gd + Pb*bd;
  // perceptual Manhattan color distance
  function distManhattan(rgb0, rgb1) {
    var rd = Math.abs(rgb1[0]-rgb0[0]),
      gd = Math.abs(rgb1[1]-rgb0[1]),
      bd = Math.abs(rgb1[2]-rgb0[2]);

    return (Pr*rd + Pg*gd + Pb*bd) / manhMax;
  }



}

ImageLib.prototype = {

  setPaletteI32: function(palette) {
    this.palette = [];
    this.paletteI32 = [];
    for(var i = 0; i < palette.length; i++) {
      var i32 = palette[i] | 0xff000000;
      this.paletteI32.push(i32);
      var rgb = [
          (i32 & 0xff),
          (i32 & 0xff00) >> 8,
          (i32 & 0xff0000) >> 16,
        ];      
      this.palette.push(rgb);
    }

  },

  setImageData: function(imageData) {
    this.imageData = imageData;
    //this.buf8 = new Uint8Array(this.imageData.data);
    //this.buf32 = new Uint32Array(this.buf8.buffer);
    this.buf32 = new Uint32Array(this.imageData.data.buffer);
    this.width = this.imageData.width;
    this.height = this.imageData.height;

    this.buildI32Palette();

    //console.log(this.paletteI32);
  },
/*
      var self = this;
      this.idxrgb.forEach(function(rgb, i) {
        var i32 = (
          (255    << 24) |  // alpha
          (rgb[2] << 16) |  // blue
          (rgb[1] <<  8) |  // green
           rgb[0]       // red
        ) >>> 0;

        self.idxi32[i]    = i32;
        self.i32idx[i32]  = i;
        self.i32rgb[i32]  = rgb;
      });

*/
  buildI32Palette: function() {
    this.paletteI32 = [];
    var _this = this;

    this.palette.forEach(function(rgb, i) {
      var i32 = (
        (255    << 24) |  // alpha
        (rgb[2] << 16) |  // blue
        (rgb[1] <<  8) |  // green
         rgb[0]       // red
      ) >>> 0;
      _this.paletteI32[i]  = i32;
//      self.i32idx[i32]  = i;
//      self.i32rgb[i32]  = rgb;
    });

  },

  // find the nearest colour in the palette to i32
  nearestColorFromPalette: function(i32, paletteRGB, paletteI32) {
    var min = 1000;
    var minIndex = false;
    var rgb = [
        (i32 & 0xff),
        (i32 & 0xff00) >> 8,
        (i32 & 0xff0000) >> 16,
      ];
    var paletteLength = paletteRGB.length;

    for (var i = 0; i < paletteLength; i++) {
      var dist = this.colorDist(rgb, paletteRGB[i]);

      if (dist < min) {
        min = dist;
        minIndex = i;
      }
    }

    if(minIndex === false) {
//      console.log('nothing found...');
      minIndex = 0;
    }

    return paletteI32[minIndex];

  },



  // find the nearest colour in the palette to i32
  nearestColor: function(i32) {
    var min = 1000;
    var minIndex = false;
    var rgb = [
        (i32 & 0xff),
        (i32 & 0xff00) >> 8,
        (i32 & 0xff0000) >> 16,
      ];
    var paletteLength = this.palette.length;

    for (var i = 0; i < paletteLength; i++) {
      var dist = this.colorDist(rgb, this.palette[i]);

      if (dist < min) {
        min = dist;
        minIndex = i;
      }
    }

    if(minIndex === false) {
//      console.log('nothing found...');
      minIndex = 0;
    }
//    return this.palette[minIndex];
    return this.paletteI32[minIndex];

  },

  // find the nearest colour in the palette to i32
  nearestColorIndex: function(i32) {
    var min = 1000;
    var minIndex = false;
    var rgb = [
        (i32 & 0xff),
        (i32 & 0xff00) >> 8,
        (i32 & 0xff0000) >> 16,
      ];
    var paletteLength = this.palette.length;

    for (var i = 0; i < paletteLength; i++) {
      var dist = this.colorDist(rgb, this.palette[i]);

      if (dist < min) {
        min = dist;
        minIndex = i;
      }
    }

    if(minIndex === false) {
      console.log('nothing found...');
      minIndex = 0;
    }
//    return this.palette[minIndex];
    return minIndex;

  },

  reduce: function() {
    var dithKern = false;

    if(dithKern) {

    } else {
      return this.reduceNearest();
    }

  },

  reducePerCell: function() {
    var dither = false;


    var buf32 = this.buf32;
    var len = buf32.length;
    var out32 = new Uint32Array(len);

    var cellsAcross = Math.floor(this.width / this.cellWidth);
    var cellsDown = Math.floor(this.height / this.cellHeight);

    var cellY = 0;
    var cellX = 0;
    var cellSrcPos = 0;
    var srcPos = 0;
    var x = 0, y = 0;

    for(cellY = 0; cellY < cellsDown; cellY++) {
      for(cellX = 0; cellX < cellsAcross; cellX++) {
        cellSrcPos = cellY * this.cellHeight * this.width + cellX * this.cellWidth;

        // build the histogram for the cell
        var cellHistogram = {};
        for(y = 0; y < this.cellHeight; y++) {
          for(x = 0; x < this.cellWidth; x++) {
            srcPos = cellSrcPos + x + y * this.width;
            var i32 = buf32[srcPos];

            if (i32 in cellHistogram) {
              cellHistogram[i32]++;
            } else {
              cellHistogram[i32] = 1;
            }

          }
        }

        var sortedColors = this.sortedHashKeys(cellHistogram, true);
        var sortedColorsLen = sortedColors.length;
        var cellPalette = [];
        var cellPaletteRGB = [];
        var cellPaletteI32 = [];

        if(sortedColorsLen > 0) {
          var nearest = this.nearestColorIndex(sortedColors[0]);
          cellPalette.push(nearest);
          cellPaletteRGB.push(this.palette[nearest]);
          cellPaletteI32.push(this.paletteI32[nearest]);

          for(var i = 1; i < sortedColors.length; i++) {
            nearest = this.nearestColorIndex(sortedColors[i]);
            if(nearest !== cellPalette[0]) {
              cellPalette.push(nearest);
              cellPaletteRGB.push(this.palette[nearest]);
              cellPaletteI32.push(this.paletteI32[nearest]);
              break;
            }
          }      
        } else {
          // uh oh...
        }


        if(!dither) {
          // reduce the cell to the cell palette by nearest
          for(y = 0; y < this.cellHeight; y++) {
            for(x = 0; x < this.cellWidth; x++) {
              srcPos = cellSrcPos + x + y * this.width;
              var i32 = buf32[srcPos];
              out32[srcPos] = this.nearestColorFromPalette(i32, cellPaletteRGB, cellPaletteI32);
            }
          }
        } else {
          // reduce the cell to the cell palette by dither

          this.reduceCellDither(out32, cellX * this.cellWidth, cellY * this.cellHeight, cellPaletteRGB, cellPaletteI32);
        }

      }
    }


//    var out8 = new Uint8ClampedArray(buf32.buffer);
    var out8 = new Uint8ClampedArray(out32.buffer);
    return new ImageData(out8, this.width, this.height);

    /*
    if(!dither) {
      var out8 = new Uint8ClampedArray(out32.buffer);
      return new ImageData(out8, this.width, this.height);

    } else {
      var out8 = new Uint8ClampedArray(buf32.buffer);
      return new ImageData(out8, this.width, this.height);
    }
*/

  },


  reduceNearest: function() {
    var buf32 = this.buf32;
    var len = buf32.length;
//    var out32 = new Uint32Array(len);
    for (var i = 0; i < len; i++) {
      var i32 = buf32[i];
//      out32[i] = (this.nearestColor(i32) & 0x00ffffff) | (i32 & 0xff000000);
      buf32[i] = (this.nearestColor(i32) & 0x00ffffff) | (i32 & 0xff000000);
    }

//    var out8 = new Uint8ClampedArray(out32.buffer);
//    return new ImageData(out8, this.width, this.height);

    var out8 = new Uint8ClampedArray(buf32.buffer);
    return new ImageData(out8, this.width, this.height);

  },



  // adapted from http://jsbin.com/iXofIji/2/edit by PAEz
  reduceCellDither: function(out32, cellX, cellY, cellPaletteRGB, cellPaletteI32) {
    // http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code/
    var kernels = {
      FloydSteinberg: [
        [7 / 16, 1, 0],
        [3 / 16, -1, 1],
        [5 / 16, 0, 1],
        [1 / 16, 1, 1]
      ],
      FalseFloydSteinberg: [
        [3 / 8, 1, 0],
        [3 / 8, 0, 1],
        [2 / 8, 1, 1]
      ],
      Stucki: [
        [8 / 42, 1, 0],
        [4 / 42, 2, 0],
        [2 / 42, -2, 1],
        [4 / 42, -1, 1],
        [8 / 42, 0, 1],
        [4 / 42, 1, 1],
        [2 / 42, 2, 1],
        [1 / 42, -2, 2],
        [2 / 42, -1, 2],
        [4 / 42, 0, 2],
        [2 / 42, 1, 2],
        [1 / 42, 2, 2]
      ],
      Atkinson: [
        [1 / 8, 1, 0],
        [1 / 8, 2, 0],
        [1 / 8, -1, 1],
        [1 / 8, 0, 1],
        [1 / 8, 1, 1],
        [1 / 8, 0, 2]
      ],
      Jarvis: [     // Jarvis, Judice, and Ninke / JJN?
        [7 / 48, 1, 0],
        [5 / 48, 2, 0],
        [3 / 48, -2, 1],
        [5 / 48, -1, 1],
        [7 / 48, 0, 1],
        [5 / 48, 1, 1],
        [3 / 48, 2, 1],
        [1 / 48, -2, 2],
        [3 / 48, -1, 2],
        [5 / 48, 0, 2],
        [3 / 48, 1, 2],
        [1 / 48, 2, 2]
      ],
      Burkes: [
        [8 / 32, 1, 0],
        [4 / 32, 2, 0],
        [2 / 32, -2, 1],
        [4 / 32, -1, 1],
        [8 / 32, 0, 1],
        [4 / 32, 1, 1],
        [2 / 32, 2, 1],
      ],
      Sierra: [
        [5 / 32, 1, 0],
        [3 / 32, 2, 0],
        [2 / 32, -2, 1],
        [4 / 32, -1, 1],
        [5 / 32, 0, 1],
        [4 / 32, 1, 1],
        [2 / 32, 2, 1],
        [2 / 32, -1, 2],
        [3 / 32, 0, 2],
        [2 / 32, 1, 2],
      ],
      TwoSierra: [
        [4 / 16, 1, 0],
        [3 / 16, 2, 0],
        [1 / 16, -2, 1],
        [2 / 16, -1, 1],
        [3 / 16, 0, 1],
        [2 / 16, 1, 1],
        [1 / 16, 2, 1],
      ],
      SierraLite: [
        [2 / 4, 1, 0],
        [1 / 4, -1, 1],
        [1 / 4, 0, 1],
      ],
    };

    var kernel = 'FloydSteinberg';
    var serpentine = false;

    if (!kernel || !kernels[kernel]) {
      throw 'Unknown dithering kernel: ' + kernel;
    }

    var ds = kernels[kernel];

    var buf32 = this.buf32;
    var width = this.width;
    var height = this.height;
    var len = buf32.len;
    var dir = serpentine ? -1 : 1;

//    for (var y = 0; y < height; y++) {
    for(var y = cellY; y < cellY + this.cellHeight; y++) {
      if (serpentine)
        dir = dir * -1;

      var lni = y * width;

//      for (var x = (dir == 1 ? 0 : width - 1), xend = (dir == 1 ? width : 0); x !== xend; x += dir) {
      for (var x = (dir == 1 ? cellX : cellX + this.cellWidth - 1), xend = (dir == 1 ? cellX + this.cellWidth : cellX); x !== xend; x += dir) {  
        // Image pixel
        var idx = lni + x,
          i32 = buf32[idx],
          r1 = (i32 & 0xff),
          g1 = (i32 & 0xff00) >> 8,
          b1 = (i32 & 0xff0000) >> 16;

        // Reduced pixel
        var i32x = this.nearestColorFromPalette(i32, cellPaletteRGB, cellPaletteI32),
          r2 = (i32x & 0xff),
          g2 = (i32x & 0xff00) >> 8,
          b2 = (i32x & 0xff0000) >> 16;

        buf32[idx] =
          (255 << 24) | // alpha
          (b2  << 16) | // blue
          (g2  <<  8) | // green
           r2;

        // dithering strength
        if (this.dithDelta) {
          var dist = this.colorDist([r1, g1, b1], [r2, g2, b2]);
          if (dist < this.dithDelta)
            continue;
        }

        // Component distance
        var er = r1 - r2,
          eg = g1 - g2,
          eb = b1 - b2;

        for (var i = (dir == 1 ? 0 : ds.length - 1), end = (dir == 1 ? ds.length : 0); i !== end; i += dir) {
          var x1 = ds[i][1] * dir,
            y1 = ds[i][2];

          var lni2 = y1 * width;

//          if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
          if (x1 + x >= cellX && x1 + x < cellX + this.cellWidth && y1 + y >= cellY && y1 + y < cellY + this.cellHeight) {
            var d = ds[i][0];
            var idx2 = idx + (lni2 + x1);

            var r3 = (buf32[idx2] & 0xff),
              g3 = (buf32[idx2] & 0xff00) >> 8,
              b3 = (buf32[idx2] & 0xff0000) >> 16;

            var r4 = Math.max(0, Math.min(255, r3 + er * d)),
              g4 = Math.max(0, Math.min(255, g3 + eg * d)),
              b4 = Math.max(0, Math.min(255, b3 + eb * d));

            buf32[idx2] =
              (255 << 24) | // alpha
              (b4  << 16) | // blue
              (g4  <<  8) | // green
               r4;      // red
          }
        }
      }
    }

//    var out8 = new Uint8ClampedArray(buf32.buffer);
//    return new ImageData(out8, this.width, this.height);
  },



  // adapted from http://jsbin.com/iXofIji/2/edit by PAEz
  reduceDither: function(args) {
    args = args || {};

    var kernel = args.kernel || 'FloydSteinberg';

    var serpentine = false;


    // http://www.tannerhelland.com/4660/dithering-eleven-algorithms-source-code/
    var kernels = {
      FloydSteinberg: [
        [7 / 16, 1, 0],
        [3 / 16, -1, 1],
        [5 / 16, 0, 1],
        [1 / 16, 1, 1]
      ],
      FalseFloydSteinberg: [
        [3 / 8, 1, 0],
        [3 / 8, 0, 1],
        [2 / 8, 1, 1]
      ],
      Stucki: [
        [8 / 42, 1, 0],
        [4 / 42, 2, 0],
        [2 / 42, -2, 1],
        [4 / 42, -1, 1],
        [8 / 42, 0, 1],
        [4 / 42, 1, 1],
        [2 / 42, 2, 1],
        [1 / 42, -2, 2],
        [2 / 42, -1, 2],
        [4 / 42, 0, 2],
        [2 / 42, 1, 2],
        [1 / 42, 2, 2]
      ],
      Atkinson: [
        [1 / 8, 1, 0],
        [1 / 8, 2, 0],
        [1 / 8, -1, 1],
        [1 / 8, 0, 1],
        [1 / 8, 1, 1],
        [1 / 8, 0, 2]
      ],
      Jarvis: [     // Jarvis, Judice, and Ninke / JJN?
        [7 / 48, 1, 0],
        [5 / 48, 2, 0],
        [3 / 48, -2, 1],
        [5 / 48, -1, 1],
        [7 / 48, 0, 1],
        [5 / 48, 1, 1],
        [3 / 48, 2, 1],
        [1 / 48, -2, 2],
        [3 / 48, -1, 2],
        [5 / 48, 0, 2],
        [3 / 48, 1, 2],
        [1 / 48, 2, 2]
      ],
      Burkes: [
        [8 / 32, 1, 0],
        [4 / 32, 2, 0],
        [2 / 32, -2, 1],
        [4 / 32, -1, 1],
        [8 / 32, 0, 1],
        [4 / 32, 1, 1],
        [2 / 32, 2, 1],
      ],
      Sierra: [
        [5 / 32, 1, 0],
        [3 / 32, 2, 0],
        [2 / 32, -2, 1],
        [4 / 32, -1, 1],
        [5 / 32, 0, 1],
        [4 / 32, 1, 1],
        [2 / 32, 2, 1],
        [2 / 32, -1, 2],
        [3 / 32, 0, 2],
        [2 / 32, 1, 2],
      ],
      TwoSierra: [
        [4 / 16, 1, 0],
        [3 / 16, 2, 0],
        [1 / 16, -2, 1],
        [2 / 16, -1, 1],
        [3 / 16, 0, 1],
        [2 / 16, 1, 1],
        [1 / 16, 2, 1],
      ],
      SierraLite: [
        [2 / 4, 1, 0],
        [1 / 4, -1, 1],
        [1 / 4, 0, 1],
      ],
    };


    if (!kernel || !kernels[kernel]) {
      throw 'Unknown dithering kernel: ' + kernel;
    }

    var ds = kernels[kernel];

    var buf32 = this.buf32;
    var width = this.width;
    var height = this.height;
    var len = buf32.len;
    var dir = serpentine ? -1 : 1;

    for (var y = 0; y < height; y++) {
      if (serpentine)
        dir = dir * -1;

      var lni = y * width;

      for (var x = (dir == 1 ? 0 : width - 1), xend = (dir == 1 ? width : 0); x !== xend; x += dir) {
        // Image pixel
        var idx = lni + x,
          i32 = buf32[idx],
          r1 = (i32 & 0xff),
          g1 = (i32 & 0xff00) >> 8,
          b1 = (i32 & 0xff0000) >> 16,
          a1 = (i32 & 0xff000000) >> 24;

        // Reduced pixel
        var i32x = this.nearestColor(i32),
          r2 = (i32x & 0xff),
          g2 = (i32x & 0xff00) >> 8,
          b2 = (i32x & 0xff0000) >> 16;

        buf32[idx] =
          (a1 << 24) | // alpha
          (b2  << 16) | // blue
          (g2  <<  8) | // green
           r2;

        // dithering strength
        if (this.dithDelta) {
          var dist = this.colorDist([r1, g1, b1], [r2, g2, b2]);
          if (dist < this.dithDelta)
            continue;
        }

        // Component distance
        var er = r1 - r2,
          eg = g1 - g2,
          eb = b1 - b2;

        for (var i = (dir == 1 ? 0 : ds.length - 1), end = (dir == 1 ? ds.length : 0); i !== end; i += dir) {
          var x1 = ds[i][1] * dir,
            y1 = ds[i][2];

          var lni2 = y1 * width;

          if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
            var d = ds[i][0];
            var idx2 = idx + (lni2 + x1);

            var r3 = (buf32[idx2] & 0xff),
              g3 = (buf32[idx2] & 0xff00) >> 8,
              b3 = (buf32[idx2] & 0xff0000) >> 16,
              a3 = (buf32[idx2] & 0xff000000) >> 24;

            var r4 = Math.max(0, Math.min(255, r3 + er * d)),
              g4 = Math.max(0, Math.min(255, g3 + eg * d)),
              b4 = Math.max(0, Math.min(255, b3 + eb * d));

            buf32[idx2] =
              (a3  << 24) | // alpha
              (b4  << 16) | // blue
              (g4  <<  8) | // green
               r4;      // red
          }
        }
      }
    }

    var out8 = new Uint8ClampedArray(buf32.buffer);
    return new ImageData(out8, this.width, this.height);
  },


  colorStats1D: function() {
    var histogram = this.histogram;
    var buf32 = this.buf32;
    var len = buf32.length;
    var color = 0;

    for (var i = 0; i < len; i++) {
      color = buf32[i];

      // skip transparent
      if ((color & 0xff000000) >> 24 == 0) continue;

/*
      // collect hue stats
      if (this.hueStats)
        this.hueStats.check(col);
*/
      if (color in histogram)
        histogram[color]++;
      else
        histogram[color] = 1;
    }
  },

  // returns array of hash keys sorted by their values
  sortedHashKeys: function(obj, desc) {
    var keys = [];

    for (var key in obj)
      keys.push(key);

    return keys.sort(function(a, b) {
      return desc ? obj[b] - obj[a] : obj[a] - obj[b];
    });
  /*
    return sort.call(keys, function(a,b) {
      return desc ? obj[b] - obj[a] : obj[a] - obj[b];
    });
    */
  },


  // reduces histogram to palette, remaps & memoizes reduced colors
  buildPalette: function() {
    var histogram = this.histogram;
    var sortedColors = this.sortedHashKeys(histogram, true);

    var idxi32 = sortedColors;

    // int32-ify values (not needed??)
    idxi32 = idxi32.map(function(v){return +v;});

    this.reducePalette(idxi32);
  },

  // reduces similar colors from an importance-sorted Uint32 rgba array
  reducePalette: function(idxi32) {

  },
}

