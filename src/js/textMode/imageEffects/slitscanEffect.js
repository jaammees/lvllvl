  var SlitscanEffect = function() {
  this.src = null;
  this.dst = null;
  this.imageX = 0;
  this.imageY = 0;

  this.slices = 30;
  this.horizontal = false;
  this.vertical = true;

  this.frames = [];
}


SlitscanEffect.prototype = {
  setSource: function(srcCanvas) {
    this.src = srcCanvas;
  },

  setDestination: function(dstCanvas) {
    this.dst = dstCanvas;
  },


  reset: function() {
    this.frames = [];
  },

  update: function() {
    if(this.slices < 3) {
      this.slices = 3;
    }

    this.dstContext = this.dst.getContext('2d');

    var srcHeight = this.src.height;
    var srcWidth = this.src.width;

    var dstWidth = this.dst.width;
    var dstHeight = this.dst.height;


    // ceil prevents gaps in slices
    var sliceHeight = Math.ceil(srcHeight / this.slices)
    var sliceWidth = Math.ceil(srcWidth / this.slices);

    var srcContext = this.src.getContext('2d');

    this.frames.push(srcContext.getImageData(0, 0, this.src.width, this.src.height))


    if(this.horizontal) {
      // draw slices to canvas
      var i = this.slices;
      if(i >= this.frames.length) {
        i = this.frames.length;
      }
      while (i--) {
        try {
          this.dstContext.putImageData(
            this.frames[i], 0, 0, 0, 
            sliceHeight * i, 
            this.src.width, sliceHeight)
        } catch (e) {
        }
      }
    }

    if(this.vertical) {
      var i = this.slices;
      if(i >= this.frames.length) {
        i = this.frames.length;
      }
      while (i--) {
        try {
          this.dstContext.putImageData(
            this.frames[i], 0, 0, sliceWidth * i, 
            0, 
            sliceWidth, this.src.height);
        } catch (e) {
        }
      }

    }

    while (this.frames.length > this.slices){
      this.frames.shift()
    } 
  }
}
