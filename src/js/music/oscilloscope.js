function outCallback(data) {

}

var Oscilloscope = function() {
  this.visible = true;

  this.sampleCount = 800;
  this.track1 = null;

  this.width = 0;
  this.height = 0;
  this.left = 0;
  this.bottom = 0;

  this.waveformMeshes = [];
}

Oscilloscope.prototype = {
  init: function(music, channel, uiComponent) {

    this.music = music;
    this.channel = channel;
    this.canvas = uiComponent.getCanvas();
  },


  outputData: function(data) {
    if(!this.visible) {
      return;
    }
    this.width = Math.floor(this.canvas.width / this.music.doc.data.tracks.length);
    this.height = this.canvas.height;
    var xOffset = this.width * this.channel;

    this.context = this.canvas.getContext("2d");    

    var scaleY = 0.002;
    var dataWindowSize = data.length / 5.2;//2.8;

    this.context.fillStyle= styles.music.oscilloscopeBackground;
    this.context.fillRect(xOffset, 0, this.width, this.height);

    this.context.beginPath();    
    this.context.strokeStyle = styles.music.oscilloscopeLines;
    this.context.lineWidth = 2;

    if(data === false) {

      var x = xOffset;
      var y = this.height / 2;
      this.context.moveTo(x, y);
      this.context.lineTo(xOffset + this.width, y);
      this.context.stroke();
      return
    }  

    var triggerOffset = 0;
    while(data[triggerOffset] < 6000 && triggerOffset < 1000) {
      triggerOffset++;
    }
    while(data[triggerOffset] >= 5990 && triggerOffset < 1000) {
      triggerOffset++;
    }

    var sample = 0;
    var pos = Math.floor(triggerOffset + sample) % 2048;
    var x = xOffset;
    var y = this.height / 2 - data[pos] * scaleY;
    this.context.moveTo(x, y);


    var sampleStep = dataWindowSize / this.width;
    var midpoint = this.height / 2;

    for(var x = 1; x < this.width; x++) {
      sample += sampleStep;
      pos = Math.floor(triggerOffset + sample) % 2048;
      y = midpoint - data[pos] * scaleY;
      this.context.lineTo(xOffset + x, y);
    }
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