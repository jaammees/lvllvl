
var HistoryGraph = function() {
  this.visible = false;
  this.segments = 512;
  this.maximumValue = 0xff;
  this.data = [];
  this.waveformMeshes = [];
  this.historyLine = null;
  this.cursor = 0;

  this.canvas = null;
  this.context = null;

  this.width = 10;
  this.height = 10;
  this.left = 0;
  this.bottom = 0;

}

HistoryGraph.prototype = {

  init: function(music, args) {
    if(typeof args != 'undefined') {
      if(typeof args.max != 'undefined') {
        this.maximumValue = args.max;
      }
      if(typeof args.segments != 'undefined') {
        this.segments = args.segments;
      }

    }

    this.music = music;

return;
//TODO: !!!

    this.canvas = document.createElement('canvas');
    document.body.appendChild(this.canvas);
    this.canvas.style.zIndex = 100;
    this.canvas.style.position = 'absolute';
    this.canvas.style.display = 'none';
    this.canvas.className += ' historyGraph';
    this.resize();

    for(var i = 0; i < this.segments; i++) {
      this.data.push(0);
    }
  },

  setVisible: function(visible) {
    if(visible != this.visible) {
      this.visible = visible;
      if(visible) {
        this.canvas.style.display = 'block';
      } else {
        this.canvas.style.display = 'none';

      }
    }
  },

  setMaximumValue: function(maximumValue) {
    this.maximumValue = maximumValue;
  },



  addValue: function(value) {
    this.data[this.cursor++] = value;
    if(this.cursor >= this.segments) {
      this.cursor = 0;
    }

  },  

  outputData: function() {
    if(!this.visible) {
      return;
    }

    this.context.fillStyle= '#060606';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.beginPath();    
    this.context.strokeStyle = '#e6e6e6';    


    var scaleY = 1;
    var scaleX = this.width / this.segments;

    var drawAt = this.segments ;//Math.floor(this.segments / 2);
    var cursor = this.cursor - drawAt;
    if(cursor < 0) {
      cursor += this.segments;
    }

    var x = 0;
    var y = this.height - scaleY * (this.data[cursor++]  / this.maximumValue * this.height);

    this.context.moveTo(x, y);

    for(var i = 1; i < drawAt; i++) {
      var x = i * scaleX;
      var y = this.height - scaleY * (this.data[cursor++]  / this.maximumValue * this.height);

      this.context.lineTo(x, y);

      if(cursor >= this.segments) {
        cursor = 0;
      }
    }

    for(var i = drawAt; i < this.segments; i++) {
      console.log("HEREEEEE!!!");
      var x = i * scaleX;
      var y = this.height - 0;

      this.context.lineTo(x, y);
    }

    this.context.lineWidth = 2;
    this.context.stroke();

  },





  resize: function() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.context = this.canvas.getContext("2d");    
  },  

  render: function(left, bottom, width, height) {

    if(!this.visible) {
      return;
    }


    // reposition if needed
    if(this.left != left) {
      this.left = left;
      this.canvas.style.left = left + 'px';
    }

    if(this.bottom != bottom) {
      this.bottom = bottom;
      this.canvas.style.bottom =  bottom + 'px';
    }

    // resize if needed
    if(width != this.width || height != this.height) {
      this.width = width;
      this.height = height;
      this.resize();
    }

  }
}