var ImageUtils = {};


ImageUtils.createColorPaletteFromImage = function(colors, image) {
  var opts = {
      colors: colors,             // desired palette size
      method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
      boxSize: [64,64],        // subregion dims (if method = 2)
      boxPxls: 2,              // min-population threshold (if method = 2)
      initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
      minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
      dithKern: null,          // dithering kernel name, see available kernels in docs below
      dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
      dithSerp: false,         // enable serpentine pattern dithering
      palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
      reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
      useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
      cacheFreq: 10,           // min color occurance count needed to qualify for caching
      colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
  };

  var q = new RgbQuant(opts);
  q.sample(image);      
  return q.palette();


}

// convert imagedata to reduced palette using dithering
ImageUtils.rgbQuant = function(imageData, args) {//colors, dithKern, colorCount) {

/*
  var colorCount = 16;
  if(typeof colorCount == 'undefined') {
    colorCount = colors.length;
  }
*/
  if(typeof args.colors == 'undefined') {
    args.colors = args.palette.length;
  }

  // default values
  var opts = {
      colors: 256,             // desired palette size
      method: 2,               // histogram method, 2: min-population threshold within subregions; 1: global top-population
      boxSize: [64,64],        // subregion dims (if method = 2)
      boxPxls: 2,              // min-population threshold (if method = 2)
      initColors: 4096,        // # of top-occurring colors  to start with (if method = 1)
      minHueCols: 0,           // # of colors per hue group to evaluate regardless of counts, to retain low-count hues
      dithKern: null,          // dithering kernel name, see available kernels in docs below
      dithDelta: 0,            // dithering threshhold (0-1) e.g: 0.05 will not dither colors with <= 5% difference
      dithSerp: false,         // enable serpentine pattern dithering
      palette: [],             // a predefined palette to start with in r,g,b tuple format: [[r,g,b],[r,g,b]...]
      reIndex: false,          // affects predefined palettes only. if true, allows compacting of sparsed palette once target palette size is reached. also enables palette sorting.
      useCache: true,          // enables caching for perf usually, but can reduce perf in some cases, like pre-def palettes
      cacheFreq: 10,           // min color occurance count needed to qualify for caching
      colorDist: "euclidean",  // method used to determine color distance, can also be "manhattan"
  };


  for(var key in opts) {
    if(args.hasOwnProperty(key) && key != 'palette') {
      opts[key] = args[key];
    }
  }


  /*
  if(typeof args.colors != 'undefined') {
    opts.colors = args.colors;
  }

  if(typeof args.dithKern != 'undefined') {
    opts.dithKern = dithKern;
  }

//  opts.colorDist = "manhattan";

//  dithDelta = 0.90;

  opts.dithKern = dithKern;
  opts.colors = colorCount;

  opts.dithDelta = 0.5;
*/
//  opts.method = 2;
//  opts.boxSize = [8, 8];

  for(var i = 0; i < args.palette.length; i++) {
    var r = (args.palette[i] >> 16) & 255;
    var g = (args.palette[i] >> 8) & 255;
    var b = args.palette[i] & 255;  
    opts.palette[i] = [r,g,b];
  }
//console.log(opts);
  var q = new RgbQuant(opts);
  q.sample(imageData);      
  var pal = q.palette();

  var alphas = [];
//    for (var i = 0, len = this.imageData.length; i < len; ++i) {
  for(var i =0 ; i < imageData.data.length; i++) {
    if( (i + 1) % 4 == 0) {
      alphas.push(imageData.data[i]);
    }
  }

  var outImageData = q.reduce(imageData, 1);

  var alphaCount = 0;
  for(var i = 0; i < imageData.data.length; i++) {
    if( (i + 1) % 4) {
      imageData.data[i] = outImageData[i];
    } else {
      imageData.data[i] = alphas[alphaCount++];
    }
  }
}

// -100 to 100
ImageUtils.adjustBrightness = function(imageData, adjust) {

  adjust = Math.floor(255 * (adjust / 100));

  for(var i = 0; i < imageData.data.length; i+=4) {
    for(var j = 0; j < 3; j++) {
      var amount = imageData.data[i + j];
      amount += adjust;
      if(amount > 255) {
        amount = 255;
      }
      if(amount < 0) {
        amount = 0;
      }
      imageData.data[i + j] = amount;
    }

  }
}

// -100 to 100
ImageUtils.adjustSaturation = function(imageData, adjust) {
//    adjust = Math.floor(255 * (adjust / 100));
  adjust *= -0.01;

  for(var i = 0; i < imageData.data.length; i+=4) {
    var r = imageData.data[i];
    var g = imageData.data[i + 1];
    var b = imageData.data[i + 2];
    var max = r;
    if(g > max) {
      max = g;
    }
    if(b > max) {
      max = b;
    }


    if(r != max) 
      r += (max - r) * adjust;

    if(g != max) {
      g += (max - g) * adjust;
    }

    if(b != max) {
      b += (max - b) * adjust;
    }

    imageData.data[i] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
  }
}

ImageUtils.adjustContrast = function(imageData, contrast) {
  contrast /= 1.1;

  var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));    
  for(var i = 0; i < imageData.data.length; i+=4) {

      imageData.data[i] = factor * (imageData.data[i] - 128) + 128;
      imageData.data[i+1] = factor * (imageData.data[i+1] - 128) + 128;
      imageData.data[i+2] = factor * (imageData.data[i+2] - 128) + 128;
  }
}

ImageUtils.invertColors = function(imageData) {
  for(var i = 0; i < imageData.data.length; i+=4) {
    imageData.data[i] = 255 - imageData.data[i];
    imageData.data[i+1] = 255 - imageData.data[i+1];
    imageData.data[i+2] = 255 - imageData.data[i+2]
  }
}

ImageUtils.adjustHue = function(imageData, hue) {
  for(var i = 0; i < imageData.data.length; i+= 4) {

    var r = imageData.data[i];
    var g = imageData.data[i + 1];
    var b = imageData.data[i + 2];

    var c = {};
    c.values = [r,g,b,255];
    c = Colour.converters[Colour.RGBA][Colour.HSVA](c);
    //color.hsv = c;

    var h = c.values[0];
//      console.log(h);
    h += hue;
    h = h % 360;

/*      
    h = h * 100;
    h += Math.abs(hue);
    h = h % 100;
    h /= 100;

    c.values[0] = h % 255;

    */
    c.values[0] = h;
    c = Colour.converters[Colour.HSVA][Colour.RGBA](c);

    imageData.data[i] = c.values[0];
    imageData.data[i + 1] = c.values[1];
    imageData.data[i + 2] = c.values[2];


    /*
  h = hsv.h * 100
  h += Math.abs adjust
  h = h % 100
  h /= 100
  hsv.h = h

  {r, g, b} = Convert.hsvToRGB hsv.h, hsv.s, hsv.v
  rgba.r = r; rgba.g = g; rgba.b = b

  */
  }
}


ImageUtils.limitColorsPerCell = function(srcContext, args) {
  var charWidth = 8;
  var charHeight = 8;

  var colors = args.colors;
  var dithKern = args.dithKern;
  var width = args.width;
  var height = args.height;

  var bgColorR = 0;
  var bgColorG = 0;
  var bgColorB = 0;

  if(typeof(args) != 'undefined' && typeof(args.bgColor) != 'undefined') {
    bgColorR = (args.bgColor >> 16) & 0xff;
    bgColorG = (args.bgColor >> 8) & 0xff;
    bgColorB = (args.bgColor) & 0xff;
  }

  console.log(args);
  console.log('bg color = ' + bgColorR + ',' + bgColorG + ',' + bgColorB);
  var charsAcross = Math.ceil(width / charWidth);
  var charsDown = Math.ceil(height / charHeight);

  var imageData = srcContext.getImageData(0, 0, width, height);

  for(var charY = 0; charY < charsDown; charY++) {
    for(var charX = 0; charX < charsAcross; charX++) {

      var paddingLeft = 0; //4;
      var paddingTop = 0;//4;
      var paddingRight = 0;//4;
      var paddingBottom = 0;//4;

      var cellImageData = srcContext.getImageData(charX * charWidth - paddingLeft, charY * charHeight - paddingTop, 
              charWidth + paddingLeft + paddingRight, charHeight + paddingTop + paddingBottom);


      for(var pixelY = 0; pixelY < charHeight; pixelY++) {
        for(var pixelX =0 ; pixelX < charWidth; pixelX++) {
          var src = 4 * ((paddingLeft + pixelX) + (paddingTop + pixelY) * (charWidth + paddingLeft + paddingRight));
          if(cellImageData.data[src + 3] == 0) {
            // transparent..
            cellImageData.data[src] = bgColorR;
            cellImageData.data[src + 1] = bgColorG;
            cellImageData.data[src + 2] = bgColorB;
            cellImageData.data[src + 3] = 255;            
          }
        }
      }

      ImageUtils.rgbQuant(cellImageData, { method: 2, colors: 2, palette: colors, dithKern: dithKern, dithDelta: 0 });

      for(var pixelY = 0; pixelY < charHeight; pixelY++) {
        for(var pixelX =0 ; pixelX < charWidth; pixelX++) {
          var src = 4 * ((paddingLeft + pixelX) + (paddingTop + pixelY) * (charWidth + paddingLeft + paddingRight));
          var dst = 4 * (charX * charWidth + pixelX + ((charY * charHeight + pixelY) * width));

          imageData.data[dst] = cellImageData.data[src];
          imageData.data[dst + 1] = cellImageData.data[src + 1];
          imageData.data[dst + 2] = cellImageData.data[src + 2];
//          imageData.data[dst + 3] = cellImageData.data[src + 3];
        }
      }
  //          this.srcContext.putImageData(imageData, charX * charWidth, charY * charHeight, 
  //                    0, 0, charWidth, charHeight); 
    }
  }


  console.log('limited the colours');
  srcContext.putImageData(imageData, 0, 0, 0, 0, width, height); 

}

ImageUtils.edgeDetect = function(imageData, args) {
  console.log('edge detect');
  var lowThreshold = 20;
  var highThreshold = 90;
  var blurRadius = 3;
  var lineThickness = 2;

  if(typeof args != 'undefined') {
    if(typeof args.lowThreshold != 'undefined') {
      lowThreshold = args.lowThreshold;
    }

    if(typeof args.highThreshold != 'undefined') {
      highThreshold = args.highThreshold;
    }

    if(typeof args.blurRadius != 'undefined') {
      blurRadius = args.blurRadius;
    }    

    if(typeof args.lineThickness) {
      lineThickness = args.lineThickness;
    }
  }


  var img_u8;
  img_u8 = new jsfeat.matrix_t(imageData.width, imageData.height, jsfeat.U8C1_t);

  jsfeat.imgproc.grayscale(imageData.data, imageData.width, imageData.height, img_u8);

  var r = blurRadius;
  var kernelSize = (r+1) << 1;
  jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernelSize, 0);

  jsfeat.imgproc.canny(img_u8, img_u8, lowThreshold, highThreshold);

// render result back to canvas
  var data_u32 = new Uint32Array(imageData.data.buffer);
  var alpha = (0xff << 24);
  var i = img_u8.cols*img_u8.rows, pix = 0;
  while(--i >= 0) {
      pix = img_u8.data[i];
      data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
  }  


console.log('line thickness: ' + lineThickness);
  // thicken
  if(lineThickness > 1) {
    for(var y = 0; y < imageData.height; y++) {
      for(var x = imageData.width - lineThickness; x > 0; x--) {
        var src = y * imageData.width * 4 + x * 4;
        if(imageData.data[src] > 100) {
          imageData.data[src + 4] = 0xff;
          imageData.data[src + 5] = 0xff;
          imageData.data[src + 6] = 0xff;
          imageData.data[src + 7] = 0xff;
        }
      }
    }

    for(var y = 1; y < imageData.height; y++) {
      for(var x = imageData.width - lineThickness; x > 0; x--) {
        var src = y * imageData.width * 4 + x * 4;
        var prev = (y - 1) * imageData.width * 4 + x * 4;
        if(imageData.data[src] > 100) {
          imageData.data[prev + 4] = 0xff;
          imageData.data[prev + 5] = 0xff;
          imageData.data[prev + 6] = 0xff;
          imageData.data[prev + 7] = 0xff;
        }
      }
    }
  }

}
