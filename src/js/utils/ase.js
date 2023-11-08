// https://github.com/DominikGuzei/node-ase-utils/blob/master/encode.js

var ieee754 = {};

ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


var BBuffer = function() {
  this.data = [];
  this.index = 0;
}

BBuffer.prototype = {
  getOffset: function() {
    return this.index;
  },
  writeChar: function(value) {
    this.data[this.index++] = value.charCodeAt(0);
  },

  writeChar16: function(value) {
    var charCode = value.charCodeAt(0);
    this.writeUint16BE(charCode);
  },


  writeUint16BE: function(value) {
    var b1 = (value >> 8) & 0xff;
    var b2 = value & 0xff;

    this.data[this.index++] = b1;
    this.data[this.index++] = b2;
  },

  writeUint32BE: function(value) {
    var b1 = (value >> 24) & 0xff;
    var b2 = (value >> 16) & 0xff;
    var b3 = (value >> 8) & 0xff;
    var b4 = value & 0xff;

    this.data[this.index++] = b1;
    this.data[this.index++] = b2;
    this.data[this.index++] = b3;
    this.data[this.index++] = b4;
  },

  writeFloatBE: function(value) {
    this.data[this.index] = 0;
    this.data[this.index + 1] = 0;
    this.data[this.index + 2] = 0;
    this.data[this.index + 3] = 0;
    ieee754.write(this.data, value, this.index, false, 23, 4);

    this.index += 4;

  },

  writeBuffer: function(value) {
    var data = value.data;
    for(var i = 0; i < data.length; i++) {
      this.data[this.index++] = data[i];
    }
  },

  getByteArray: function() {
    var data = new Uint8Array(this.data.length);
    for(var i = 0; i < this.data.length; i++) {
      data[i] = this.data[i];
    }

    return data;
  }
}

var ASE = function() {
  this.MODE_COLOR = 1;
  this.MODE_GROUP = 2;

  this.STATE_GET_MODE   = 1;
  this.STATE_GET_LENGTH = 2;
  this.STATE_GET_NAME   = 3;
  this.STATE_GET_MODEL  = 4;
  this.STATE_GET_COLOR  = 5;
  this.STATE_GET_TYPE   = 6;

  this.COLOR_START = 0x0001;
  this.GROUP_START = 0xc001;
  this.GROUP_END   = 0xc002;

  this.COLOR_SIZES = {
    CMYK: 4,
    RGB: 3,
    LAB: 3,
    GRAY: 1
  },



  this.state = 0;
  this.mode = 0;

  this.colors = [];

  this.blockModel = '';
  
/*
  FILE_SIGNATURE: "ASEF",
  FORMAT_VERSION: 0x10000,

  COLOR_START: 0x0001,
  GROUP_START: 0xc001,
  GROUP_END  : 0xc002,

  MODE_COLOR : 1,
  MODE_GROUP : 2,

  STATE_GET_MODE   : 1,
  STATE_GET_LENGTH : 2,
  STATE_GET_NAME   : 3,
  STATE_GET_MODEL  : 4,
  STATE_GET_COLOR  : 5,
  STATE_GET_TYPE   : 6,

  COLOR_SIZES: {
    CMYK: 4,
    RGB: 3,
    LAB: 3,
    GRAY: 1
  },

  READ_COLOR_TYPES: {
    0: 'global',
    1: 'spot',
    2: 'normal'
  },

  WRITE_COLOR_TYPES: {
    global: 0,
    spot: 1,
    normal: 2
  }  
*/

  this.colors = [];
  this.data = [];
  this.index = 0;
};


ASE.prototype = {
  readChar: function() {
    if(this.index >= this.data.length) {
      return false;
    }
    return String.fromCharCode(this.data[this.index++]);
    
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

  readUint32BE: function() {
    var b1 = this.data[this.index++];
    var b2 = this.data[this.index++];
    var b3 = this.data[this.index++];
    var b4 = this.data[this.index++];
    return (b1 << 24) | (b2 << 16) | (b3 << 8) | b4;

  },


  readFloatBE: function() {
    var value = ieee754.read(this.data, this.index, false, 23, 4);
//ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {

    this.index += 4;
    return value;
  },

/*
  writeChar: function(value) {
    this.data[this.index++] = value.charCodeAt(0);
  },

  writeChar16: function(value) {
    var charCode = value.charCodeAt(0);
    this.writeUint16BE(charCode);
  },
  

  writeUint16BE: function(value) {
    var b1 = (value >> 8) & 0xff;
    var b2 = value & 0xff;

    this.data[this.index++] = b1;
    this.data[this.index++] = b2;
  },

  writeUint32BE: function(value) {
    var b1 = (value >> 24) & 0xff;
    var b2 = (value >> 16) & 0xff;
    var b3 = (value >> 8) & 0xff;
    var b4 = value & 0xff;

    this.data[this.index++] = b1;
    this.data[this.index++] = b2;
    this.data[this.index++] = b3;
    this.data[this.index++] = b4;
  },

  writeFloatBE: function() {
    this.data[this.index] = 0;
    this.data[this.index + 1] = 0;
    this.data[this.index + 2] = 0;
    this.data[this.index + 3] = 0; 
    ieee754.write(this.data, value, this.index, false, 23, 4);

  },
*/
  writePalette: function(colors) {
    //this.data = [];
    //this.index = 0;
    var ase = new BBuffer();

    // file signature
    ase.writeChar('A');
    ase.writeChar('S');
    ase.writeChar('E');
    ase.writeChar('F');

    // format version
    ase.writeUint32BE(0x10000);

    // number of blocks
    ase.writeUint32BE(colors.length);
    console.log('number of colors' + colors.length);
    for(var i = 0; i < colors.length; i++) {
      var swatch = new BBuffer();
      // block type
      ase.writeUint16BE(this.COLOR_START);

      // Group/Color name
      // 0-terminated string of length (uint16) double-byte characters
      var colorName = "Color";
      swatch.writeUint16BE(colorName.length + 1);
      for(var j = 0; j < colorName.length; j++) {
        swatch.writeUint16BE(colorName.charCodeAt(j));
      }
      swatch.writeUint16BE(0);

      swatch.writeChar('R');
      swatch.writeChar('G');
      swatch.writeChar('B');
      swatch.writeChar(' ');

      var color = colors[i].hex;

      var r = (color >> 16) & 0xff;
      var g = (color >> 8) & 0xff;
      var b = (color) & 0xff;

      swatch.writeFloatBE(r / 255);
      swatch.writeFloatBE(g / 255);
      swatch.writeFloatBE(b / 255);

      var colorType = 2; 
      // color type - 1*int16 (0 â‡’ Global, 1 â‡’ Spot, 2 â‡’ Normal)
      swatch.writeUint16BE(colorType);       

      // swatch length
      //
      var blockLength = swatch.getOffset();
      console.log('block length = ' + blockLength);
      ase.writeUint32BE(blockLength);

      ase.writeBuffer(swatch);
          
    }

    return ase.getByteArray();
      
  },

  readPalette: function(data) {
    this.colors = [];
    this.data = data;
    this.index = 0;

    var magic = '';
    magic += this.readChar();
    magic += this.readChar();
    magic += this.readChar();
    magic += this.readChar();
    console.log(magic);
    if(magic != 'ASEF') {
      console.log('not valide ase file');
    }

    this.version = [];
    this.version.push(this.readUint16BE());
    this.version.push(this.readUint16BE());

    console.log(this.version);


    this.blocks = this.readUint32BE();
    console.log('blocks = ' + this.blocks);

    this.state = this.STATE_GET_MODE;
    this.mode = this.MODE_COLOR;

    var count = 0;
    while(this.index < this.data.length) {
      count++;
      if(count > 99999) {
        break;
      }

      switch(this.state) {
        case this.STATE_GET_MODE:
          this.readBlockMode();
          break;
        case this.STATE_GET_LENGTH:
          this.readBlockLength();
          break;
        case this.STATE_GET_NAME:
          this.readBlockName();
          break;
        case this.STATE_GET_MODEL:
          this.readBlockModel(); 
          break;
        case this.STATE_GET_COLOR:
          this.readBlockColor();
          break;
        case this.STATE_GET_TYPE:
          this.readBlockType();
          break;
      }
    }

console.log('returning');
console.log(this.colors);

    return this.colors;
  },

  readBlockMode: function() {
    var blockMode = this.readUint16BE();
    console.log('block mode = ' + blockMode);

    switch(blockMode) {
      case this.COLOR_START:
        
        this.mode = this.MODE_COLOR;
        break;
      case this.GROUP_START:
        this.mode = this.MODE_GROUP;
        break;
      case this.GROUP_END:
        break;
    }

    this.state = this.STATE_GET_LENGTH;
  },

  readBlockLength: function() {
    this.blockLength = this.readUint32BE();

    console.log('block length = ' + this.blockLength);
    this.state = this.STATE_GET_NAME;
  },

  readBlockName: function() {
    var nameLength = this.readUint16BE();
    var name = '';
    for(var i = 0; i < nameLength; i++) {
      name += this.readChar16();
    }

    console.log('block name = ' + name);

    if(this.mode == this.MODE_GROUP) {
      this.state = this.STATE_GET_MODE;
    } else {
      this.state = this.STATE_GET_MODEL;
    }
  },

  readBlockModel: function() {
    var model = '';
    model += this.readChar();
    model += this.readChar();
    model += this.readChar();
    model += this.readChar();

    console.log('block model = "' + model + '"');


    model = model.trim();
    console.log('model = ' + model);

    this.blockModel = model;
    this.state = this.STATE_GET_COLOR;
  },

  readBlockColor: function() {
    var model = this.blockModel.toUpperCase();
    var count = this.COLOR_SIZES[model];
    console.log('colour count = ' + count);
    var channels = [];

    for(var i = 0; i < count; i++) {
      channels.push(this.readFloatBE());
    }


    if(this.blockModel == 'RGB') {
      console.log("ADDING RGB COLOR!!");
      var r = Math.round(channels[0] * 255);
      var g = Math.round(channels[1] * 255);
      var b = Math.round(channels[2] * 255);

      var color = (r << 16) | (g << 8) + b;
      this.colors.push(color);
      console.log(color);
    } else if(this.blockModel == 'Gray') {
      var r = Math.round(channels[0] * 255);
      var g = Math.round(channels[0] * 255);
      var b = Math.round(channels[0] * 255);

      var color = (r << 16) | (g << 8) + b;
      this.colors.push(color);

    } else if(this.blockModel == 'CMYK') {
      var color = cmyk2rgb(channels[0], channels[1], channels[2], channels[3]);
      this.colors.push(color);
    } else if(this.blockModel == 'LAB') {
      channels[0] *= 100;
      var rgb = convert.xyz.rgb(convert.lab.xyz(channels));
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


    } else {
      console.log('unknown model!!!!!: \'' + this.blockModel + '\'');
    }

    this.state = this.STATE_GET_TYPE;
  },

  readBlockType: function() {
    var typeIndex = this.readUint16BE();
    this.state = this.STATE_GET_MODE;
  }
}