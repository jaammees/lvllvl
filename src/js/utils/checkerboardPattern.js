var CheckerboardPattern = function() {
  this.canvas = null;
  this.context = null;
  this.checkSize = 5;

  this.lightColor = '#161616';
  this.darkColor = '#111111';

}

CheckerboardPattern.prototype = {
  init: function() {

  },

  getCanvas: function(width, height) {
    if(this.canvas == null || width > this.canvas.width || height > this.canvas.height) {
      this.setDimensions(width, height);
    }
    return this.canvas;
  },

  setDimensions: function(width, height) {
    if(this.canvas == null) {
      this.canvas = document.createElement('canvas');
    }
    if(this.context == null || this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.context = this.canvas.getContext('2d');
    }

    // draw the background image
    this.context.fillStyle = this.lightColor; // '#cccccc';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); 

    var blocksAcross = Math.ceil(this.canvas.width / this.checkSize);
    var blocksDown = Math.ceil(this.canvas.height / this.checkSize);

    this.context.fillStyle = this.darkColor; //'#bbbbbb';
    for(var y = 0; y < blocksDown; y++) {
      for(var x = 0; x < blocksAcross; x++) {
        if((x + y) % 2) {
          this.context.fillRect(x * this.checkSize, y * this.checkSize, 
            this.checkSize, this.checkSize); 
        }
      }
    }
  }
}