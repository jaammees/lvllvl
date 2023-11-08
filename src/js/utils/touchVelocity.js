var TouchVelocity = function() {
  this.touches = [];
}

TouchVelocity.prototype = {
  init: function() {
  },

  pruneTouches: function(maxTime) {
    var time = getTimestamp();
    var threshold = time - maxTime;
    while(this.touches.length > 0 && this.touches[0].t < threshold) {
      this.touches.shift();
    }
  },

  reset: function() {
    this.touches = [];
  },
  touchStart: function(e) {
    this.reset();
  },

  touchMove: function(e) {
    var touches = e.touches;
    if(touches.length > 0) {
      var x = touches[0].pageX;
      var y = touches[0].pageY;       
      var time = getTimestamp();

      this.touches.push({ t: time, x: x, y: y });

      this.pruneTouches(100);


    }
  },

  touchEnd: function(e) {

  },

  getVelocity: function() {
    this.pruneTouches(1000);
    var touchLength = this.touches.length;
    if(touchLength < 2) {
      return { x: 0, y: 0 };
    }

    var dx = this.touches[touchLength - 1].x - this.touches[0].x;
    var dy = this.touches[touchLength - 1].y - this.touches[0].y;
    var time = this.touches[touchLength - 1].t - this.touches[0].t;

    return {
      vx: dx / time,
      vy: dy / time
    };
  }
}