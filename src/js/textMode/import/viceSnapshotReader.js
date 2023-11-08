var ViceSnapshotReader = function() {
  this.editor = null;

  this.data = null;
  this.index = 0;
}

ViceSnapshotReader.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  getVersion: function() {
    return this.majorVersion + '.' + this.minorVersion;
  },

  readSnapshot: function(data) {
    this.data = data;
    this.index = 0;

    // first 19 bytes are magic string
    var magic = '';

    for(var i = 0; i < 18; i++) {
      magic += String.fromCharCode(data[i]);
    }

    if(magic != 'VICE Snapshot File') {
      // unknown file format
      console.error('unknown file format');
      return false;
    }
    console.log('magic = ' + magic);


    this.index = 19;
    this.majorVersion = data[this.index++];
    this.minorVersion = data[this.index++];

    console.log('major version = ' + this.majorVersion);
    console.log('minor version = ' + this.minorVersion);

    this.machineName = '';
    for(var i = this.index; i < this.index + 16; i++) {
      if(data[i] != 0) {
        this.machineName += String.fromCharCode(data[i]);
      }
    }
    console.log('machine name = ' + this.machineName);

    this.index += 16;

    // snapshot version
    this.snapshotVersion = '';
    for(var i = this.index; i < this.index + 12; i++) {
      if(data[i] != 0) {
        this.snapshotVersion += String.fromCharCode(data[i]);
      }
    }

    console.log(this.snapshotVersion);

    if(this.snapshotVersion == 'VICE Version') {
      this.index += 13;
      this.index += 8;
    }


    // now get the modules
    this.ramOffset = false;
    this.viciiOffset = false;
    this.viciiMajorVersion = 0;

    while(this.index < data.length) {
      var moduleName = '';
      for(var i = this.index; i < this.index + 16; i++) {
        if(data[i] != 0) {
          moduleName += String.fromCharCode(data[i]);
        }
      }
      console.log('module name = ' + moduleName);

      this.index += 16;
      var moduleMajorVersion = data[this.index++];
      var moduleMinorVersion = data[this.index++];

      var moduleSize = 0;
      moduleSize += data[this.index++];
      moduleSize += (data[this.index++] << 8);
      moduleSize += (data[this.index++] << 16);
      moduleSize += (data[this.index++] << 24);

      console.log('moduleSize = ' + moduleSize);

      if(moduleName == 'C64MEM') {
        this.ramOffset = this.index + 4;
      }

      if(moduleName == 'VIC-II') {
        this.viciiOffset = this.index;
        viciiMajorVersion = moduleMajorVersion;
      }

      if(moduleName == 'CIA2') {
        this.cia2Offset = this.index;
        this.cia2OutputRegisterA = data[this.index];
        this.cia2OutputRegisterB = data[this.index + 1];
        this.ddRegisterA = data[this.index+ 2];
        this.ddRegisterB = data[this.index+ 3];

        console.log('---->output register A = ' + this.cia2OutputRegisterA);
        console.log('---->output register B = ' + this.cia2OutputRegisterB);

        console.log('---->dd register A = ' + this.ddRegisterA);
        console.log('---->dd register B = ' + this.ddRegisterB);
      }

      this.index += moduleSize - 16 - 2 - 4;
    }

    console.log('vic ii maj version = ');
    console.log(viciiMajorVersion);

//    this.readVICIIV1();
    this.readVICIIV2();
//  readVICII(data, viciiOffset);
//  readC64Mem(data, ramOffset);
  },


  readVICIIV1: function() {

    var VICII_SCREEN_TEXTCOLS = 40;
    var VICII_SCREEN_TEXTLINES = 25;
    var VICII_DRAW_BUFFER_SIZE = (65 * 8);

    var offset = this.viciiOffset;
    var data = this.data;

    // model
    offset++;
    var vicIIRegisters = [];
    // vic ii registers
    for(var i = 0;i < 64; i++) {
      vicIIRegisters.push(data[offset + i + 1]);
  //    console.log('vic registers ' + i + ':' +  data[offset + i + 1]);
    }


    // raster cycle
    offset += 2;

    // cycle flags
    offset += 2;

    // raster line
    offset += 2;

    // start of frame
    offset++;

    // irq status
    offset++;

    // raster irq line
    offset += 2;


    // raster irq triggered
    offset++;

    // vbuf
    offset += VICII_SCREEN_TEXTCOLS;
    // cbuf
    offset += VICII_SCREEN_TEXTCOLS;

    // gbuf
    offset++;

    // dbuff offset
    offset += 2;


    // dbuf
    offset += VICII_DRAW_BUFFER_SIZE;



    // 0x11 = 17
    // d011, bit 5 is text/bitmap mode, bit 6 is extended background mode
    var d011 = vicIIRegisters[17];
    this.extendedBackgroundMode = (d011 & 0x40) > 0;

    // 0x16 = 22
    // d018 is multicolour mode in bit 4, bit 3 is 40/38 columns
    var d016 = vicIIRegisters[22];
    this.multicolorMode = (d016 & 0x10) > 0;


    // 0x18 = 24;
    // d018 is memory setup for vic ii
    var d018 = vicIIRegisters[24];

    var d020 = vicIIRegisters[32];
    var d021 = vicIIRegisters[33];

    var d022 = vicIIRegisters[34];
    var d023 = vicIIRegisters[35];

    this.borderColor = d020;
    this.backgroundColor = d021;
    this.extraBackgroundColor1 = d022;
    this.extraBackgroundColor2 = d023;

    var characterMemoryAddress = 0;
    var characterMemoryBits = (d018 & 0xe) >> 1;
    this.characterMemoryAddress = characterMemoryBits * 2048;

    var screenMemoryBits = (d018 & 0xf0) >> 4;
    this.screenMemoryAddress = screenMemoryBits * 1024;

//    console.log('screen memory = ' + screenMemory + ', character memory = ' + characterMemoryAddress);
  },


  getScreenData: function(screenData) {
    console.log('screen memory address = ' + this.screenMemoryAddress);
    // need the bank?

    var screenOffset = this.screenMemoryAddress;

    var vicBank = this.cia2OutputRegisterA & 0x3;
    switch(vicBank) {
      case 0:
        screenOffset += 49152;
      break;
      case 1:
        screenOffset += 32768;
      break;
      case 2:
        screenOffset += 16384;
      break;
      case 3:
      break;
    }
//    var screenData = [];
    for(var i = 0; i < 1000; i++) {
      screenData[i] = this.data[this.ramOffset + screenOffset + i];
    }

    return screenData;

  },

  getColorData: function(colorData) {
    console.log('get color data');
    var colorRamOffset = this.colorRamOffset;

    for(var i = 0; i < 1000; i++) {
      colorData[i] = this.data[this.colorRamOffset + i];
    }

  },

  getCharacterData: function(tileData) {
    var characterOffset = this.characterMemoryAddress;

    var vicBank = this.cia2OutputRegisterA & 0x3;
    switch(vicBank) {
      case 0:
        characterOffset += 49152;
      break;
      case 1:
        characterOffset += 32768;
      break;
      case 2:
        characterOffset += 16384;
      break;
      case 3:
      break;
    }

    var offset = this.ramOffset + characterOffset;

    for(var i = 0; i < 2048; i++) {
      tileData[i] = this.data[this.ramOffset + characterOffset + i];
    }
  },


  getBorderColor: function() {
    return this.borderColor;
  },

  getBackgroundColor: function() {
    return this.backgroundColor;
  },

  getExtraBackgroundColor1: function() {
    return this.extraBackgroundColor1;
  },

  getExtraBackgroundColor2: function() {
    return this.extraBackgroundColor2;
  },

  getMulticolorMode: function() {
    return this.multicolorMode;
  },

  // snapshot format for 2.4?
  // https://github.com/martinpiper/VICE/blob/master/src/vicii/vicii-snapshot.c
  readVICIIV2: function() {
    var offset = this.viciiOffset;
    var data = this.data;

    var version = data[offset++];
    console.log('version = ' + version);


    // allow bad lines
    offset++;
    // bad line
    offset++;
    //blank
    offset++;
    // colorbuf
    offset += 40;

    // color ram
    this.colorRamOffset = offset - 1;
    offset += 1024;

    // idle state
    offset++;
    //lptrigger
    offset++;
    //lpx
    offset++;
    //lpy
    offset++;
    //matrixbuf
    offset += 40;
    // new sprite dma mask
    offset++;


    var ramBase = data[offset++];
    ramBase += data[offset++] << 8;

    console.log('vic ii ram base = ' + ramBase);

    // raster cycle
    offset++;

    // rasterline
    offset += 2;

    var vicIIRegisters = [];
    // vic ii registers
    for(var i = 0;i < 64; i++) {
      vicIIRegisters.push(data[offset + i + 1]);
  //    console.log('vic registers ' + i + ':' +  data[offset + i + 1]);
    }

    console.log(vicIIRegisters);


    // 0x11 = 17
    // d011, bit 5 is text/bitmap mode, bit 6 is extended background mode
    var d011 = vicIIRegisters[17];
    this.extendedBackgroundMode = (d011 & 0x40) > 0;

    // 0x16 = 22
    // d018 is multicolour mode in bit 4, bit 3 is 40/38 columns
    var d016 = vicIIRegisters[22];
    this.multicolorMode = (d016 & 0x10) > 0;

    console.log('multicolor mode = ' + this.multicolorMode);


    // 0x18 = 24;
    // d018 is memory setup for vic ii
    var d018 = vicIIRegisters[24];
    var d020 = vicIIRegisters[32];
    var d021 = vicIIRegisters[33];

    var d022 = vicIIRegisters[34];
    var d023 = vicIIRegisters[35];

    this.borderColor = d020;
    this.backgroundColor = d021;
    this.extraBackgroundColor1 = d022;
    this.extraBackgroundColor2 = d023;

    console.log('d018 = ' + d018 + '!!!!!!'); ;
    var characterMemoryAddress = 0;
    var characterMemoryBits = (d018 & 0xe) >> 1;
    this.characterMemoryAddress = characterMemoryBits * 2048;

    var screenMemoryBits = (d018 & 0xf0) >> 4;
    this.screenMemoryAddress = screenMemoryBits * 1024;
//    console.log('screen memory = ' + screenMemory + ', character memory = ' + characterMemoryAddress);
     
  }


}
