var ImageParametersEffect = function() {
  this.src = null;
  this.dst = null;

  this.saturation = 0;
  this.brightness = 0;
  this.contrast = 0;
  this.brightnessDelta = 0;
  this.brightnessAnimateType = 'linear';
  this.contrastDelta = 0;
  this.contrastAnimateType = 'linear';
  this.saturationDelta = 0;
  this.saturationAnimateType = 'linear';

  this.invertColors = false;

  this.frame = 0;
  this.frameCount = 12;
}

ImageParametersEffect.prototype = {
  setSource: function(srcCanvas) {
    this.src = srcCanvas;
  },

  setDestination: function(dstCanvas) {
    this.dst = dstCanvas;
  },

  setFrameCount: function(frameCount) {
    this.frameCount = frameCount;
  },


  gotoFrame: function(frame) {
    this.frame = parseInt(frame, 10);
  },


  setParameters: function(args) {
    if(typeof args.saturation != 'undefined') {
      this.saturation = parseInt(args.saturation, 10);
    }

    if(typeof args.saturationDelta != 'undefined') {
      this.saturationDelta = parseInt(args.saturationDelta, 10);
    }

    if(typeof args.saturationAnimateType != 'undefined') {
      this.saturationAnimateType = args.saturationAnimateType;
    }


    if(typeof args.contrast != 'undefined') {
      this.contrast = parseInt(args.contrast, 10);
    }

    if(typeof args.contrastDelta != 'undefined') {
      this.contrastDelta = parseInt(args.contrastDelta, 10);
    }
    if(typeof args.contrastAnimateType != 'undefined') {
      this.contrastAnimateType = args.contrastAnimateType;
    }



    if(typeof args.brightness != 'undefined') {
      this.brightness = parseInt(args.brightness, 10);
    }

    if(typeof args.brightnessDelta != 'undefined') {
      this.brightnessDelta = parseInt(args.brightnessDelta, 10);
    }
    if(typeof args.brightnessAnimateType != 'undefined') {
      this.brightnessAnimateType = args.brightnessAnimateType;
    }

    if(typeof args.invertColors != 'undefined') {
      this.invertColors = args.invertColors;
    }
  },

  update: function() {
    this.srcContext = this.src.getContext('2d');


    this.dstContext = this.dst.getContext('2d');

    var srcWidth = this.src.width;
    var srcHeight = this.src.height;

    var dstWidth = this.dst.width;
    var dstHeight = this.dst.height;


    this.imageData = this.srcContext.getImageData(0, 0, this.src.width, this.src.height);    

    if(this.invertColors) {
      ImageUtils.invertColors(this.imageData);
    }
//    var saturation = this.saturation + this.saturationDelta * this.frame;

    var saturation = this.saturation;
    switch(this.saturationAnimateType) {
      case 'linear':
        // linear to value
        saturation = this.saturation + this.saturationDelta * this.frame / this.frameCount;
        break;
      case 'sine':
        // sine
        saturation = this.saturation + this.saturationDelta * Math.sin(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'cosine':
        // sine
        saturation = this.saturation + this.saturationDelta * Math.cos(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'random':
        saturation = this.saturation + this.saturationDelta * Math.random();;
        break;
    }


    if(saturation != 0) {
      ImageUtils.adjustSaturation(this.imageData, saturation);
    }

    var brightness = this.brightness;
    /*
    // per frame
    var brightness = this.brightness + this.brightnessDelta * this.frame;
    */

    switch(this.brightnessAnimateType) {
      case 'linear':
        // linear to value
        brightness = this.brightness + this.brightnessDelta * this.frame / this.frameCount;
        break;
      case 'sine':
        // sine
        brightness = this.brightness + this.brightnessDelta * Math.sin(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'cosine':
        // sine
        brightness = this.brightness + this.brightnessDelta * Math.cos(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'random':
        brightness = this.brightness + this.brightnessDelta * Math.random();;
        break;

    }
//    console.log('brightness ' + this.brightness + ',' + this.brightnessDelta + ',' + this.frame);

    if(brightness != 0) {
      ImageUtils.adjustBrightness(this.imageData, brightness);
    }

//    var contrast = this.contrast + this.contrastDelta * this.frame;
    var contrast = this.contrast;
    switch(this.contrastAnimateType) {
      case 'linear':
        // linear to value
        contrast = this.contrast + this.contrastDelta * this.frame / this.frameCount;
        break;
      case 'sine':
        // sine
        contrast = this.contrast + this.contrastDelta * Math.sin(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'cosine':
        // sine
        contrast = this.contrast + this.contrastDelta * Math.cos(2 * Math.PI * this.frame / this.frameCount);
        break;
      case 'random':
        contrast = this.contrast + this.contrastDelta * Math.random();;
        break;
    }

    if(contrast != 0) {
      ImageUtils.adjustContrast(this.imageData, contrast);
    }


    this.dstContext.putImageData(this.imageData, 0, 0, 0, 0, this.src.width , this.src.height); 


  }

}
