var NoiseEffect = function() {
  this.src = null;
  this.dst = null;
  this.imageX = 0;
  this.imageY = 0;

  this.scale = 1;


  this.frame = 0;
  this.amount = 30;
  this.density = 0.75;
}


NoiseEffect.prototype = {
  setSource: function(srcCanvas) {
    this.src = srcCanvas;
  },

  setDestination: function(dstCanvas) {
    this.dst = dstCanvas;
  },

  setPosition: function(x, y) {
    this.imageX = x;
    this.imageY = y;
  },

  setScale: function(scale) {
    this.scale = scale;

  },


  setParameters: function(args) {

    if(typeof args.amount != 'undefined') {
      this.amount = parseInt(args.amount, 10);
    }

    if(typeof args.density != 'undefined') {
      this.density = parseInt(args.density, 10) / 100;
    }

  },

  nextFrame: function() {
    this.frame = this.frame + 1;
  },

  gotoFrame: function(frame) {
    this.frame = frame;
  },


  update: function() {
//    this.srcContext = this.src.getContext('2d');
    this.dstContext = this.dst.getContext('2d');

    var srcWidth = this.src.width;
    var srcHeight = this.src.height;

    var dstWidth = this.dst.width;
    var dstHeight = this.dst.height;


    var srcX = -(this.imageX);
    var srcY = -(this.imageY);
    var scale = this.scale;

    srcWidth = dstWidth / scale;
    srcHeight = dstHeight / scale;

    this.dstContext.drawImage(this.src, srcX, srcY, srcWidth, srcHeight,
      0, 0, dstWidth, dstHeight);

    var data = this.dstContext.getImageData(0,0,this.dst.width, this.dst.height);
    JSManipulate.noise.filter(data, { amount: this.amount, density: this.density, monochrome: true});//{amount: 10, density: 1, monochrome: true});     
    this.dstContext.putImageData(data,0,0);
  }
}