var C64Colors = function() {
  this.colors = [
    0xFF000000,
    0xFFffffff,
    0xFF383381,
    0xFFc8ce75,
    0xFF973c8e,
    0xFF4dac56,
    0xFF9b2c2e,
    0xFF71f1ed,
    0xFF29508e,
    0xFF003855,
    0xFF716cc4,
    0xFF4a4a4a,
    0xFF7b7b7b,
    0xFF9fffa9,
    0xFFeb6d70,
    0xFFb2b2b2
  ];
  
  /*
  this.colors = [
    0xff000000,
    0xffffffff,
    0xff30387f,
    0xffc2b972,
    0xffa83780,
    0xff39a561,
    0xff9c2437,
    0xff66dbcc,
    0xff215687,
    0xff014155,
    0xff646bb5,
    0xff4d4d4d,
    0xff777777,
    0xff7deda6,
    0xffd86172,
    0xffa4a4a4
  ];
  */
}

C64Colors.prototype = {
  init: function() {
  },


  setColor: function(colorIndex, color) {
    if(isNaN(colorIndex) || colorIndex < 0 || colorIndex > 15) {
      return;
    }
    this.colors[colorIndex] = color;
    if(c64_ready) {
      c64_setColor(colorIndex, color);
    }
  },

  getColor: function(colorIndex) {
    if(colorIndex < 0 || colorIndex > 15) {
      return;
    }
    return this.colors[colorIndex];
  },

  setAllColors: function() {
    if(c64_ready) {

      for(var i = 0; i < 16; i++) {
        c64_setColor(i, this.colors[i]);
      }
    }
  },

  resetColor: function(colorIndex) {
    /*
    var colors = [
      0xff000000,
      0xffffffff,
      0xff30387f,
      0xffc2b972,
      0xffa83780,
      0xff39a561,
      0xff9c2437,
      0xff66dbcc,
      0xff215687,
      0xff014155,
      0xff646bb5,
      0xff4d4d4d,
      0xff777777,
      0xff7deda6,
      0xffd86172,
      0xffa4a4a4
    ];
*/
    var colors = [
      0xFF000000,
      0xFFffffff,
      0xFF383381,
      0xFFc8ce75,
      0xFF973c8e,
      0xFF4dac56,
      0xFF9b2c2e,
      0xFF71f1ed,
      0xFF29508e,
      0xFF003855,
      0xFF716cc4,
      0xFF4a4a4a,
      0xFF7b7b7b,
      0xFF9fffa9,
      0xFFeb6d70,
      0xFFb2b2b2
    ];
      
    this.setColor(colorIndex, colors[colorIndex]);

  },

  resetColors: function() {
    this.colors = [
      0xFF000000,
      0xFFffffff,
      0xFF383381,
      0xFFc8ce75,
      0xFF973c8e,
      0xFF4dac56,
      0xFF9b2c2e,
      0xFF71f1ed,
      0xFF29508e,
      0xFF003855,
      0xFF716cc4,
      0xFF4a4a4a,
      0xFF7b7b7b,
      0xFF9fffa9,
      0xFFeb6d70,
      0xFFb2b2b2
    ];
     /* 
    this.colors = [
      0xff000000,
      0xffffffff,
      0xff30387f,
      0xffc2b972,
      0xffa83780,
      0xff39a561,
      0xff9c2437,
      0xff66dbcc,
      0xff215687,
      0xff014155,
      0xff646bb5,
      0xff4d4d4d,
      0xff777777,
      0xff7deda6,
      0xffd86172,
      0xffa4a4a4
    ];
*/
    this.setAllColors();
  }
}
