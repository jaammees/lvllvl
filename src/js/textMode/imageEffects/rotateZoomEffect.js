var RotateZoomEffect = function() {
  this.src = null;
  this.dst = null;
  this.imageX = 0;
  this.imageY = 0;

  this.scale = 1;


  this.frame = 0;
  this.frameCount = 12;

  this.zoomStart = 1;
  this.zoomAmountX = 10;
  this.zoomAmountY = 10;
  this.zoomDirection = 1;//'in';
  this.zoomType = 'layer';
  this.rotateDirection = -1;
  this.wiggle = false;
  this.wiggleAmount = 30;
  this.wiggleSteps = 2;

  this.panX = 0;
  this.panY = 0;

  this.layerCount = 1;
  this.layerAngleSeparation = 0;
}


RotateZoomEffect.prototype = {
  setSource: function(srcCanvas) {
    this.src = srcCanvas;
  },

  setDestination: function(dstCanvas) {
    this.dst = dstCanvas;
  },


  setParameters: function(args) {

    /*
    if(typeof args.imageX != 'undefined') {
      this.imageX = imageX;
    }

    if(typeof args.imageY != 'undefined') {
      this.imageY = imageY;
    }

    if(typeof args.crossHairX != 'undefined') {
      this.crossHairX = args.crossHairX;
    }

    if(typeof args.crossHairY != 'undefined') {
      this.crossHairY = args.crossHairY;
    }
        if(typeof args.frameCount != 'undefined') {
      this.frameCount = args.frameCount;
    }


    */

    if(typeof args.zoomAmount != 'undefined') {
      this.zoomAmountX = args.zoomAmount / 100;
      this.zoomAmountY = args.zoomAmount / 100;
    }

    if(typeof args.zoomAmountX != 'undefined') {
      this.zoomAmountX = args.zoomAmountX / 100;
    }

    if(typeof args.zoomAmountY != 'undefined') {
      this.zoomAmountY = args.zoomAmountY / 100;
    }

    if(typeof args.zoomDirection != 'undefined') {
      switch(args.zoomDirection) {
        case 'In':
          this.zoomDirection = 1;
        break;
        case 'Out':
          this.zoomDirection = -1;
        break;
        default:

          this.zoomAmountX = 1;
          this.zoomAmountY = 1;
//          this.zoomDirection = 0;        
        break;
      }
    }

    if(typeof args.zoomType != 'undefined') {
      this.zoomType = args.zoomType;
    }

    if(typeof args.rotateDirection != 'undefined') {
      this.wiggle = false;
      switch(args.rotateDirection) {
        case 'Clockwise':
          this.rotateDirection = 1;
        break;
        case 'Anticlockwise':
          this.rotateDirection = -1;
        break;
        case 'Wiggle':
          this.wiggle = true;
          this.rotateDirection = -1;
          break;
        default:
          this.rotateDirection = 0;        
        break;
      }
    }

    if(typeof args.wiggleAmount != 'undefined') {
      this.wiggleAmount = parseInt(args.wiggleAmount, 10);
    }

    if(typeof args.wiggleSteps != 'undefined') {
      this.wiggleSteps = parseInt(args.wiggleSteps, 10);
    }

    if(typeof args.panX != 'undefined') {
      var panX = parseInt(args.panX, 10);
      if(!isNaN(panX)) {
        this.panX = panX;
      }
    }

    if(typeof args.panXAnimateType != 'undefined') {
      this.panXAnimateType = args.panXAnimateType;
    }


    if(typeof args.panY != 'undefined') {
      var panY = parseInt(args.panY, 10);
      if(!isNaN(panY)) {
        this.panY = panY;
      }
    }

    if(typeof args.panYAnimateType != 'undefined') {
      this.panYAnimateType = args.panYAnimateType;
    }




    if(typeof args.layerCount != 'undefined') {
      this.layerCount = args.layerCount;
    }

    if(typeof args.layerAngleSeparation != 'undefined') {
      this.layerAngleSeparation = args.layerAngleSeparation;
    }


  },

  setPosition: function(x, y) {
    this.imageX = x;
    this.imageY = y;
  },

  setCrosshair: function(x, y) {
    this.crosshairX = x;
    this.crosshairY = y;
  },  

  setScale: function(scale) {
    this.scale = scale;
  },

  setFrameCount: function(frameCount) {
    this.frameCount = frameCount;
  },

  setZoomAmount: function(zoomAmount) {
    this.zoomAmountX = zoomAmount;
    this.zoomAmountY = zoomAmount;
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

/*
    var srcWidth = this.src.width;
    var srcHeight = this.src.height;
*/

    var dstWidth = this.dst.width;
    var dstHeight = this.dst.height;

/*
    this.crosshairX = dstWidth / 2;
    this.crosshairY = dstHeight / 2;
*/    
/*
    this.imageX = 0;
    this.imageY = 0;
*/

    var drawWidth = 0;
    var drawHeight = 0;


    if(typeof this.src.naturalWidth != 'undefined') {
      drawWidth = this.src.naturalWidth;
      drawHeight = this.src.naturalHeight;
    }

    if(typeof this.src.videoWidth != 'undefined') {
      drawWidth = this.src.videoWidth;
      drawHeight = this.src.videoHeight;      
    }


    this.zoomRotateDelta = 0;
    this.zoomRotateDelta = 360 / this.zoomFrames;

    if(this.wiggle) {
      if(this.frame % 2) {
        this.rotateAmount = -this.wiggleAmount;
      } else {
        this.rotateAmount = this.wiggleAmount;
      }
    } else {
      this.rotateAmount = this.rotateDirection * (360 - (this.rotateDirection * this.layerAngleSeparation)) * (this.frame / this.frameCount)
    }
 
    this.zoomDeltaX = 1;
    this.zoomDeltaY = 1;
    var zoomAmountX = this.zoomAmountX;
    var zoomAmountY = this.zoomAmountY;

    if(this.frameCount > 1) {

      if(this.zoomDirection == -1) {
        zoomAmountX = 1 / zoomAmountX;
      }
      this.zoomDeltaX = Math.pow(zoomAmountX, 1 / (this.frameCount));

      if(this.zoomDirection == -1) {
        zoomAmountY = 1 / zoomAmountY;
      }
      this.zoomDeltaY = Math.pow(zoomAmountY, 1 / (this.frameCount));


    }


    this.zoomStartX = this.scale;
    this.zoomStartY = this.scale;
//    this.zoomSmallStart2 = (this.zoomStart) / Math.pow(this.zoomDelta, this.frameCount / 2 );

//    this.zoomLargeStart2 = (this.zoomStart) * Math.pow(this.zoomDelta, this.frameCount / 2);

    this.currentZoomX = this.zoomStartX * Math.pow(this.zoomDeltaX, (this.frame));
    this.currentZoomY = this.zoomStartY * Math.pow(this.zoomDeltaY, (this.frame));



    var panX = 0;
    var panY = 0;


    switch(this.panXAnimateType) {
      case 'linear':
        panX = (this.panX / this.frameCount) * this.frame;
      break;
      case 'sine':
        panX = this.panX * Math.sin(2 * Math.PI * this.frame / this.frameCount);      
      break;
      case 'cosine':
        panX = this.panX * Math.cos(2 * Math.PI * this.frame / this.frameCount);      
      break;
      case 'random':
        panX = this.panX * Math.random(); 
      break;

    }

    switch(this.panYAnimateType) {
      case 'linear':
        panY = (this.panY / this.frameCount) * this.frame;
      break;
      case 'sine':
        panY = this.panY * Math.sin(2 * Math.PI * this.frame / this.frameCount);      
      break;
      case 'cosine':
        panY = this.panY * Math.cos(2 * Math.PI * this.frame / this.frameCount);      
      break;
      case 'random':
        panY = this.panY * Math.random(); 
      break;

    }


//    var panY = (this.panY / this.frameCount) * this.frame;


//    var panX = this.panX * Math.sin(2 * Math.PI * this.frame / this.frameCount);
//    var panY = this.panY * Math.cos(2 * Math.PI * this.frame / this.frameCount);


    if(this.zoomType == 'infinite') {

      if(this.zoomDirection == -1) {
        this.zoomLargeStartX = this.zoomStartX / Math.pow(this.zoomDeltaX, this.frameCount );
        this.zoomLargeStartY = this.zoomStartY / Math.pow(this.zoomDeltaY, this.frameCount );
      } else {
        this.zoomLargeStartX = this.zoomStartX * Math.pow(this.zoomDeltaX, this.frameCount );
        this.zoomLargeStartY = this.zoomStartY * Math.pow(this.zoomDeltaY, this.frameCount );
      }
      this.currentLargeImageZoomX = this.zoomLargeStartX * Math.pow(this.zoomDeltaX, (this.frame));
      this.currentLargeImageZoomY = this.zoomLargeStartY * Math.pow(this.zoomDeltaY, (this.frame));

      if(this.currentLargeImageZoomX > 0 && this.currentLargeImageZoomY > 0) {

        this.dstContext.save();

        this.dstContext.translate(this.crosshairX, this.crosshairY); 

        this.dstContext.scale(this.currentLargeImageZoomX, this.currentLargeImageZoomY);

        var imageX = this.imageX - this.crosshairX;
        var imageY = this.imageY - this.crosshairY;

        this.dstContext.rotate( (this.rotateAmount - this.layerAngleSeparation) * Math.PI * 2 / 360);

        this.dstContext.drawImage(this.src, this.imageX - this.crosshairX, this.imageY - this.crosshairY, drawWidth, drawHeight);

        this.dstContext.translate(-this.crosshairX, -this.crosshairY); 
        this.dstContext.restore();
      }
    }

/*
    if(this.currentLargeImageZoom2 > 0) {

      this.dstContext.save();

      this.dstContext.translate(this.crosshairX, this.crosshairY); 

      this.dstContext.scale(this.currentLargeImageZoom2, this.currentLargeImageZoom2);

      var imageX = this.imageX - this.crosshairX;
      var imageY = this.imageY - this.crosshairY;

      this.dstContext.rotate( (this.rotateAmount - this.layerAngleSeparation) * Math.PI * 2 / 360);

      this.dstContext.drawImage(this.src, this.imageX - this.crosshairX, this.imageY - this.crosshairY, drawWidth, drawHeight);

      this.dstContext.translate(-this.crosshairX, -this.crosshairY); 
      this.dstContext.restore();
    }
*/

    this.dstContext.save();

    //this.dstContext.clearRect(0, 0, this.srcCanvas.width, this.srcCanvas.height);
    this.dstContext.translate(this.crosshairX, this.crosshairY); 

//    this.dstContext.scale(this.currentZoom, this.currentZoom);

    this.dstContext.scale(this.currentZoomX, this.currentZoomY);

    var imageX = panX + this.imageX - this.crosshairX;
    var imageY = panY + this.imageY - this.crosshairY;



    this.dstContext.rotate(this.rotateAmount * Math.PI * 2 / 360);

    this.dstContext.drawImage(this.src, imageX, imageY, drawWidth, drawHeight);

    this.dstContext.translate(-this.crosshairX, -this.crosshairY); 
    this.dstContext.restore();


/*
    if(this.currentSmallImageZoom2 > 0) {


      this.dstContext.save();

      this.dstContext.translate(this.crosshairX, this.crosshairY); 

      this.dstContext.scale(this.currentSmallImageZoom2, this.currentSmallImageZoom2);

      var imageX = this.imageX - this.crosshairX;
      var imageY = this.imageY - this.crosshairY;

      this.dstContext.rotate( (this.rotateAmount + this.layerAngleSeparation) * Math.PI * 2 / 360);

      this.dstContext.drawImage(this.src, this.imageX - this.crosshairX, this.imageY - this.crosshairY, drawWidth, drawHeight);

      this.dstContext.translate(-this.crosshairX, -this.crosshairY); 
      this.dstContext.restore();
    }
*/



    if(this.zoomType == 'infinite') {
      if(this.zoomDirection == -1) {
        this.zoomSmallStartX = this.zoomStartX * Math.pow(this.zoomDeltaX, this.frameCount );
        this.zoomSmallStartY = this.zoomStartY * Math.pow(this.zoomDeltaY, this.frameCount );

      } else {
        this.zoomSmallStartX = this.zoomStartX / Math.pow(this.zoomDeltaX, this.frameCount );
        this.zoomSmallStartY = this.zoomStartY / Math.pow(this.zoomDeltaY, this.frameCount );
      }
      this.currentSmallImageZoomX = this.zoomSmallStartX * Math.pow(this.zoomDeltaX, (this.frame));
      this.currentSmallImageZoomY = this.zoomSmallStartY * Math.pow(this.zoomDeltaY, (this.frame));

      if(this.currentSmallImageZoomX > 0 && this.currentSmallImageZoomY > 0) {


        this.dstContext.save();

        this.dstContext.translate(this.crosshairX, this.crosshairY); 

        this.dstContext.scale(this.currentSmallImageZoomX, this.currentSmallImageZoomY);

        var imageX = this.imageX - this.crosshairX;
        var imageY = this.imageY - this.crosshairY;

        this.dstContext.rotate( (this.rotateAmount + this.layerAngleSeparation) * Math.PI * 2 / 360);

        this.dstContext.drawImage(this.src, this.imageX - this.crosshairX, this.imageY - this.crosshairY, drawWidth, drawHeight);

        this.dstContext.translate(-this.crosshairX, -this.crosshairY); 
        this.dstContext.restore();
      }
    }


  }
}
