var MirrorEffect = function() {
  this.src = null;
  this.dst = null;
  this.imageX = 0;
  this.imageY = 0;

  this.scale = 1;

  this.deltaX = -12;
  this.deltaY = 0;
  this.deltaScale = 0;

  this.frame = 0;

  this.flipH = false;
  this.flipV = false;
  this.mirrorH = true;
  this.mirrorV = false;

  this.canvas = null;
  this.context = null;
}

MirrorEffect.prototype = {
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

    if(typeof args.flipH != 'undefined') {
      this.flipH = args.flipH;
    }

    if(typeof args.flipV != 'undefined') {
      this.flipV = args.flipV;
    }

    if(typeof args.mirrorH != 'undefined') {
      this.mirrorH = args.mirrorH;
    }

    if(typeof args.mirrorV != 'undefined') {
      this.mirrorV = args.mirrorV;
    }

  },

  nextFrame: function() {
    this.frame = this.frame + 1;
  },

  gotoFrame: function(frame) {
    this.frame = frame;
  },

  setupCanvas: function() {
    if(this.canvas == null) {
      this.canvas = document.createElement('canvas');
    }

    if(this.canvas.width != this.src.width || this.canvas.height != this.src.height || this.context == null) {
      this.canvas.width = this.src.width;
      this.canvas.height = this.src.height;
      this.context = this.canvas.getContext('2d');
    }
  },

  update: function() {
//    this.srcContext = this.src.getContext('2d');
    this.dstContext = this.dst.getContext('2d');

    this.setupCanvas();

    var srcWidth = this.src.width;
    var srcHeight = this.src.height;

    var dstWidth = this.dst.width;
    var dstHeight = this.dst.height;



//ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

    srcHeight = dstHeight * srcWidth / dstWidth;

    var srcX = this.imageX;//-(this.imageX + this.frame * this.deltaX);
    var srcY = this.imageY;//-(this.imageY + this.frame * this.deltaY);
    var scale = this.scale;//this.scale + this.frame * this.deltaScale;

    srcWidth = dstWidth / scale;
    srcHeight = dstHeight / scale;

    this.context.clearRect(0,0, this.canvas.width, this.canvas.height);




    if(this.flipH || this.flipV) {

      var scaleH = 1;
      var translateH = 0;
      if(this.flipH) {
        scaleH = -1;
        translateH = this.canvas.width;
      }

      var scaleV = 1;
      var translateV = 0;
      if(this.flipV) {
        scaleV = -1;
        translateV = this.canvas.height;
      }
      this.context.save();

      this.context.translate(translateH, translateV);
      this.context.scale(scaleH, scaleV);

      this.context.drawImage(this.src, 0, 0);

      this.context.restore();


    } else {
      this.context.drawImage(this.src, srcX, srcY);

    }
/*

    if(this.flipH) {
      this.context.save();

      console.log('flip h');
      this.context.translate(this.canvas.width, 0);
      this.context.scale(-1, 1);
      this.context.drawImage(this.canvas, 0, 0);
      this.context.restore();

    }

    if(this.flipV) {
      this.context.save();

      console.log('flip v');
      this.context.translate(0, this.canvas.height);
      this.context.scale(1, -1);
      this.context.drawImage(this.canvas, 0, 0);
      this.context.restore();

    }

*/

    if(this.mirrorH) {
      // draw the other half in reverse

      this.context.clearRect(this.canvas.width / 2,0, this.canvas.width / 2, this.canvas.height);


      this.context.save();
      this.context.translate(dstWidth / 2, 0);
      this.context.scale(-1,1);
      this.context.drawImage(this.canvas, srcX, srcY, srcWidth / 2, srcHeight,
        -dstWidth / 2, 0, dstWidth / 2, dstHeight);

  //    this.dstContext.drawImage(this.src, srcWidth / 2, 0, srcWidth / 2, srcHeight,
  //      0, 0, (dstWidth / 2), dstHeight);
      this.context.restore();
    }


    if(this.mirrorV) {
      // draw the other half in reverse
      this.context.save();
      this.context.translate(0, dstHeight / 2);
      this.context.scale(1,-1);
      this.context.drawImage(this.canvas, srcX, srcY, srcWidth, srcHeight / 2,
        0, -dstHeight/2, dstWidth, dstHeight / 2);

  //    this.dstContext.drawImage(this.src, srcWidth / 2, 0, srcWidth / 2, srcHeight,
  //      0, 0, (dstWidth / 2), dstHeight);
      this.context.restore();
    }


/*

    // draw half of the image the correct way around
    this.context.drawImage(this.src, srcX, srcY, srcWidth / 2, srcHeight,
      0, 0, dstWidth / 2, dstHeight);


    // draw the other half in reverse
    this.context.save();
    this.context.translate(dstWidth / 2, 0);
    this.context.scale(-1,1);
    this.context.drawImage(this.src, srcX, srcY, srcWidth / 2, srcHeight,
      -dstWidth / 2, 0, dstWidth / 2, dstHeight);

//    this.dstContext.drawImage(this.src, srcWidth / 2, 0, srcWidth / 2, srcHeight,
//      0, 0, (dstWidth / 2), dstHeight);
    this.context.restore();
*/

    this.dstContext.clearRect(0,0, this.dst.width, this.dst.height);

    this.dstContext.drawImage(this.canvas, 0, 0);

  }
}