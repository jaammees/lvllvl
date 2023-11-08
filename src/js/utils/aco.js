/*
https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577411_pgfId-1070626
*/


var cmyk2rgb = function(c, m, y, k){
    if(c > 1) {
      c = 1;
    }
    if(m > 1) {
      m = 1;
    }
    if(y > 1) {
      y = 1;
    }
    if(k > 1) {
      k = 1;
    }
    
    c = c * (1 - k) + k;
    m = m * (1 - k) + k;
    y = y * (1 - k) + k;
    
    var r = Math.round((1 - c) * 255);
    var g = Math.round((1 - m) * 255);
    var b = Math.round((1 - y) * 255);

    return (r << 16) + (g << 8) + b;
    
}

var ACO = function() {
  this.colors = [];

  this.data = [];
  this.index = 0;
};


ACO.prototype = {

  writeUint16BE: function(value) {
    var b1 = (value >> 8) & 0xff;
    var b2 = value & 0xff;

    this.data[this.index++] = b1;
    this.data[this.index++] = b2;
  },

  readChar16: function() {
    var c = this.readUint16BE();
    return String.fromCharCode(c);
  },

  readUint16BE: function() {
    var b1 = this.data[this.index++];
    var b2 = this.data[this.index++];
    return (b1 << 8) | b2;
  },

  readInt16BE: function() {
    var b1 = this.data[this.index++];
    var b2 = this.data[this.index++];
    var value = (b1 << 8) | b2;
    if ((value & 0x8000) === 0x8000) {
      value = -(0xFFFF - value + 1); // Cast to signed
    }

    return value;
  },


  readColor: function() {
    var colorSpace = this.readUint16BE();

    console.log('color space = ' + colorSpace);
/*
    var w = this.readUint16BE();
    var x = this.readUint16BE();
    var y = this.readUint16BE();
    var z = this.readUint16BE();
*/

    var w = this.readUint16BE();
    var x = this.readUint16BE();
    var y = this.readUint16BE();
    var z = this.readUint16BE();

    var name = '';
    if(this.acoVersion == 2) {
      this.readUint16BE();  // 0
      var nameLength = this.readUint16BE();
      for(var i = 0; i < nameLength; i++) {
        name += this.readChar16();
      }
      this.readUint16BE(); //0
    }

    if(colorSpace == 0) {
      // rgb
      /*
      RGB.
      The first three values in the color data are red , green , and blue . They are full unsigned 16-bit values as in Apple's RGBColor data structure.
      Pure red = 65535, 0, 0. 
      */

      console.log(w + ',' + x + ',' + y);
      var r = w >> 8;//Math.round(w / 256);
      var g = x >> 8;//Math.round(x / 256);
      var b = y >> 8;//Math.round(y / 256);

      var color = (r << 16) + (g << 8) + b;
      this.colors.push(color);
    } else if(colorSpace == 1) {
      // hsb
      /*
      HSB.
      The first three values in the color data are hue , saturation , and brightness . They are full unsigned 16-bit values as in Apple's HSVColor data structure.
      Pure red = 0,65535, 65535.
      */
    } else if(colorSpace == 2) {
      // cmyk
      /*
      CMYK.

      The four values in the color data are cyan , magenta , yellow , and black . They are full unsigned 16-bit values.

      0 = 100% ink. For example, pure cyan = 0,65535,65535,65535.
      */     
      var c = 1.0 - (w / 65535);
      var m = 1.0 - (x / 65535);
      var y = 1.0 -  (y / 65535);
      var k = 1.0 -  (z / 65535);

      var color = cmyk2rgb(c, m, y, k);
      this.colors.push(color);
    } else if(colorSpace == 7) {
      // lab
      /*
        The first three values in the color data are lightness , a chrominance , and b chrominance .
        Lightness is a 16-bit value from  0...10000. Chrominance components are each 16-bit values from  -12800...12700. Gray values are represented by
        chrominance components of  0. Pure white = 10000,0,0. 
      */      
console.log(w + ',' + x + ',' + y + ',' + z);

      // x and y are unsigned
      if ((x & 0x8000) === 0x8000) {
        x = -(0xFFFF - x + 1); // Cast to signed
      }

      if ((y & 0x8000) === 0x8000) {
        y = -(0xFFFF - y + 1); // Cast to signed
      }

      var l = w / 100;
      var a = x / 100;
      var b = y / 100;


      //convert.lab.rgb(l, a, b);
      //
      var rgb = convert.xyz.rgb(convert.lab.xyz([l, a, b]));
      var r = Math.round(rgb[0]);
      var g = Math.round(rgb[1]);
      var b = Math.round(rgb[2]);
      if(r > 255) {
        r = 255;
      }    
      if(g > 255) {
        g = 255;
      }
      if(b > 255) {
        b = 255;
      }
      var color = (r << 16) + (g << 8) + b;
      this.colors.push(color);

    } else if(colorSpace == 8) {
      // greyscale
      /*
        Grayscale.

        The first value in the color data is the gray value, from 0...10000.
      */ 
      var grey = 1 - (w / 10000);
      if(grey > 1) {
        grey = 1;
      }
      var r = Math.round(grey * 255);
      var g = Math.round(grey * 255);
      var b = Math.round(grey * 255);

      var color = (r << 16) + (g << 8) + b;
      this.colors.push(color);      
    } else if(colorSpace == 9) {
      // wide cmyk
    }

  },

  readPalette: function(data) {
    this.colors = [];
    this.data = data;
    this.index = 0;

    this.acoVersion = this.readUint16BE();
    console.log('aco version = ' + this.acoVersion);
    if(this.acoVersion == 0 || this.acoVersion > 2) {
      // unknown version
      return false;
    }

    this.colorCount = this.readUint16BE();

console.log('colour count = ' + this.colorCount);

    for(var i = 0; i < this.colorCount; i++) {
      this.readColor();
    }
    return this.colors;
  },

  writePalette: function(colors) {
    console.log(colors);
    this.colors = colors;
    this.data = [];
    this.index = 0;

    // version 1
    this.writeUint16BE(1);

    // color count
    this.writeUint16BE(colors.length);

    for(var i = 0; i < colors.length; i++) {
      var color = colors[i].hex;
      // rgb colour space
      this.writeUint16BE(0);
      var r = (color >> 16) & 0xff;
      var g = (color >> 8) & 0xff;
      var b = (color) & 0xff;

      console.log('write ' + r + ',' + g + ',' + b);
      this.writeUint16BE(r << 8);
      this.writeUint16BE(g << 8);
      this.writeUint16BE(b << 8);
      this.writeUint16BE(0);
    }

    var data = new Uint8Array(this.data.length);
    for(var i = 0; i < this.data.length; i++) {
      data[i] = this.data[i];
    }

    return data;
  }

}