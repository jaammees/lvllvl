var SongData = function() {
  this.sidStart = 0x1000;
  this.sidEnd = 0;  

  this.tracks = [];
  this.patterns = [];
  this.instruments = [];
  this.filters = [];

  // pattern pointer to row
  this.patternRowPositions = [];

  // track positions to global row, global row where 
  this.trackPositions = [[],[],[]];

  this.wavetable = [];
  this.pulsetable = [];
  this.speedtable = [];  
  this.filtertable = [];
  this.memory = null;


  var freqtbllo = [
  0x17,0x27,0x39,0x4b,0x5f,0x74,0x8a,0xa1,0xba,0xd4,0xf0,0x0e,
  0x2d,0x4e,0x71,0x96,0xbe,0xe8,0x14,0x43,0x74,0xa9,0xe1,0x1c,
  0x5a,0x9c,0xe2,0x2d,0x7c,0xcf,0x28,0x85,0xe8,0x52,0xc1,0x37,
  0xb4,0x39,0xc5,0x5a,0xf7,0x9e,0x4f,0x0a,0xd1,0xa3,0x82,0x6e,
  0x68,0x71,0x8a,0xb3,0xee,0x3c,0x9e,0x15,0xa2,0x46,0x04,0xdc,
  0xd0,0xe2,0x14,0x67,0xdd,0x79,0x3c,0x29,0x44,0x8d,0x08,0xb8,
  0xa1,0xc5,0x28,0xcd,0xba,0xf1,0x78,0x53,0x87,0x1a,0x10,0x71,
  0x42,0x89,0x4f,0x9b,0x74,0xe2,0xf0,0xa6,0x0e,0x33,0x20,0xff];

  /*,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
*/
  var freqtblhi = [
  0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x02,
  0x02,0x02,0x02,0x02,0x02,0x02,0x03,0x03,0x03,0x03,0x03,0x04,
  0x04,0x04,0x04,0x05,0x05,0x05,0x06,0x06,0x06,0x07,0x07,0x08,
  0x08,0x09,0x09,0x0a,0x0a,0x0b,0x0c,0x0d,0x0d,0x0e,0x0f,0x10,
  0x11,0x12,0x13,0x14,0x15,0x17,0x18,0x1a,0x1b,0x1d,0x1f,0x20,
  0x22,0x24,0x27,0x29,0x2b,0x2e,0x31,0x34,0x37,0x3a,0x3e,0x41,
  0x45,0x49,0x4e,0x52,0x57,0x5c,0x62,0x68,0x6e,0x75,0x7c,0x83,
  0x8b,0x93,0x9c,0xa5,0xaf,0xb9,0xc4,0xd0,0xdd,0xea,0xf8,0xff]

  /*,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];  
  */

  var CMD_DONOTHING = 0;
  var CMD_PORTAUP = 1;
  var CMD_PORTADOWN = 2;
  var CMD_TONEPORTA = 3;
  var CMD_VIBRATO = 4;
  var CMD_SETAD = 5;
  var CMD_SETSR = 6;
  var CMD_SETWAVE = 7;
  var CMD_SETWAVEPTR = 8;
  var CMD_SETPULSEPTR = 9;
  var CMD_SETFILTERPTR = 10;
  var CMD_SETFILTERCTRL = 11;
  var CMD_SETFILTERCUTOFF = 12;
  var CMD_SETMASTERVOL = 13;
  var CMD_FUNKTEMPO = 14;
  var CMD_SETTEMPO = 15;

  var WTBL = 0;
  var PTBL = 1;
  var FTBL = 2;
  var STBL = 3;

  var MAX_FILT = 64;
  var MAX_STR = 32;
  var MAX_INSTR = 64;
  var MAX_CHN = 3;
  var MAX_PATT = 208;
  var MAX_TABLES = 4;
  var MAX_TABLELEN = 255;
  var MAX_INSTRNAMELEN = 16;
  var MAX_PATTROWS = 128;
  var MAX_SONGLEN = 254;
  var MAX_SONGS = 32;
  var MAX_NOTES = 96;

  var REPEAT = 0xd0;
  var TRANSDOWN = 0xe0;
  var TRANSUP = 0xf0;
  var LOOPSONG = 0xff;

  var ENDPATT = 0xff;
  var INSTRCHG = 0x00;
  var FX = 0x40;
  var FXONLY = 0x50;
  var FIRSTNOTE = 0x60;
  var LASTNOTE = 0xbc;
  var REST = 0xbd;
  var KEYOFF = 0xbe;
  var KEYON = 0xbf;
  var OLDKEYOFF = 0x5e;
  var OLDREST = 0x5f;

  var WAVEDELAY = 0x1;
  var WAVELASTDELAY = 0xf;
  var WAVESILENT = 0xe0;
  var WAVELASTSILENT = 0xef;
  var WAVECMD = 0xf0;
  var WAVELASTCMD = 0xfe;  

  var instrmap = [];
  var firstLegatoInstrument = false;
  var firstNoHRInstrument = false;

  var labelPositions = {
    "mt_insvibparamminus1": [0x100a,0x123f],
    "mt_speedlefttblminus1": [0x1057,0x1086,0x12ee],
    "mt_speedrighttblminus1": [0x105d,0x12f5,0x12fd],
    "mt_freqtbllo": [0x10bd,0x130d,0x1339],
    "mt_freqtblloplus1": [0x1309],
    "mt_freqtblhi": [0x10c4,0x1315,0x133f],
    "mt_freqtblhiplus1": [0x1312],
    "mt_filttimetbl": [0x115d,0x117e],
    "mt_filttimetblminus1": [0x114c],
    "mt_filtspdtblminus1": [0x1157,0x1163,0x116f,0x1187],
    "mt_songtbllo": [0x11ec],
    "mt_songtblhi": [0x11f1],
    "mt_insgatetimerminus1": [0x1220],
    "mt_insvibdelayminus1": [0x1239],
    "mt_insfirstwaveminus1": [0x124c],
    "mt_inspulseptrminus1": [0x125d],
    "mt_insfiltptrminus1": [0x126a],
    "mt_inswaveptrminus1": [0x1277],
    "mt_inssrminus1": [0x127d],
    "mt_insadminus1": [0x1283],
    "mt_wavetblminus2": [0x12ce],
    "mt_wavetblminus1": [0x12a0],
    "mt_wavetbl": [0x12ba],
    "mt_notetblminus1": [0x12c3],
    "mt_notetblminus2": [0x12d5,0x1431],
    "mt_pulsetimetblminus1": [0x135c],
    "mt_pulsespdtblminus1": [0x1364,0x1370,0x1392],
    "mt_pulsetimetbl": [0x1389],
    "mt_patttbllo": [0x139e],
    "mt_patttblhi": [0x13a3]
  }

  this.init = function() {
    this.memory = new Uint8Array(65536);
    for(var i = 0; i < this.memory.length; i++ ) {
      this.memory[i] =0;
    }

    for(var i = 0; i < 256; i++) {
      instrmap[i] = i;
    }        
  }  


  this.remapInstruments = function() {

    for(var i = 0; i < this.instruments.length; i++) {

      this.instruments[i].originalIndex = i + 1;
      this.instruments[i].isUsed = true;

      if(this.instruments[i].gateTimer & 0x40) {
        this.instruments[i].gateType = 'legato';
      } else if(this.instruments[i].gateTimer & 0x80) {
        this.instruments[i].gateType = 'nohr';
      } else {
        this.instruments[i].gateType = 'normal';
      }
    }


    this.instruments.sort(function(a,b) {
      if(a.originalIndex == 0) {
        return -1;
      }

      if(a.gateType == b.gateType) {
        return 0;
      }

      if(a.gateType == 'normal') {
        return -1;
      }

      if(b.gateType == 'normal') {
        return 1;
      }

      if(a.gateType == 'nohr') {
        return -1;
      }

      if(b.gateType == 'nohr') {
        return 1;
      }

      return 0;

    });


    firstNoHRInstrument = false;
    firstLegatoInstrument = false;
    for(var i = 0; i < this.instruments.length; i++ ) {
      if(this.instruments[i].gateType == 'legato' && firstLegatoInstrument === false) {
        firstLegatoInstrument = i;
      }

      if(this.instruments[i].gateType == 'nohr' && firstNoHRInstrument === false) {
        firstNoHRInstrument = i;
      }

      instrmap[this.instruments[i].originalIndex] = i + 1;
    }

  }

  this.buildTables = function() {
    this.wavetable = [];
    this.pulsetable = [];
    this.speedtable = [];
    this.filtertable = [];


/*
         if ((ltable[c][d] != 0xff) && (ltable[c][d] > 0x80))
            insertbyte(((ltable[c][d] & 0x70) >> 1) | 0x80);
          else
            insertbyte(ltable[c][d]);
          break;

*/

    for(var i = 0; i < this.filters.length; i++) {
      this.filters[i].filterPtr = this.filtertable.length + 1;

      for(var j = 0; j < this.filters[i].filtertable.length; j++) {
        var left = this.filters[i].filtertable[j][0];
        var right = this.filters[i].filtertable[j][1];

        if(left == 0xff) {
          if(right != 0) {
            right = right + this.filters[i].filterPtr - 1;
          }
        } else if(left > 0x80) {
          left = ((left & 0x70) >> 1) | 0x80;
        }
        this.filtertable.push([left, right]);
      }
    }

    for(var i = 0; i < this.instruments.length; i++) {
      this.instruments[i].filtPtr = 0;
      if(this.instruments[i].filtertable.length > 0) {
        this.instruments[i].filtPtr = this.filtertable.length + 1;
        for(var j = 0; j < this.instruments[i].filtertable.length; j++) {
          var left = this.instruments[i].filtertable[j][0];
          var right = this.instruments[i].filtertable[j][1];

          if(left == 0xff) {
            if(right != 0) {
              right = right + this.instruments[i].filtPtr  - 1;
            }
          } else if(left > 0x80) {
            left = ((left & 0x70) >> 1) | 0x80;
          }


          this.filtertable.push([left, right]);
        }
      }
    }   

    var nowavedelay = false;
    for(var i = 0; i < this.instruments.length; i++) {
      this.instruments[i].wavePtr = this.wavetable.length + 1;
      for(var j = 0; j < this.instruments[i].wavetable.length; j++) {

        var wave = this.instruments[i].wavetable[j][0];

        if ((wave >= WAVESILENT) && (wave <= WAVELASTSILENT)) {
          wave &= 0xf;
        }
        if ((wave > WAVELASTDELAY) && (wave <= WAVELASTSILENT) && (!nowavedelay)) {
          wave += 0x10;
        }

        var note = this.instruments[i].wavetable[j][1];

        if(wave == 0xff) {
          if(note != 0) {
            note = note + this.instruments[i].wavePtr - 1;
          }

        } else if ((this.instruments[i].wavetable[j][0] >= WAVECMD) && (this.instruments[i].wavetable[j][0] <= WAVELASTCMD)) {
          // Remap table-referencing commands
          switch (this.instruments[i].wavetable[j][0] - WAVECMD)
          {
            case CMD_PORTAUP:
            case CMD_PORTADOWN:
            case CMD_TONEPORTA:
            case CMD_VIBRATO:
            case CMD_FUNKTEMPO:

              // add the speed from instruments speedtable to the global speedtable
              var speedleft = this.instruments[i].speedtable[note - 1][0];
              var speedright = this.instruments[i].speedtable[note - 1][1];
              var found = false;
              for(var k = 0; k < this.speedtable.length; k++) {
                if(this.speedtable[k][0] == speedleft && this.speedtable[k][1] == speedright) {
                  note = k + 1;
                  found = true;
                }
              }

              if(!found) {
                note = this.speedtable.length + 1;
                this.speedtable.push([speedleft, speedright]);
              }

            break;

            case CMD_SETPULSEPTR:
//            insertbyte(tablemap[PTBL][rtable[c][d]]);
            break;

            case CMD_SETFILTERPTR:
//            insertbyte(tablemap[FTBL][rtable[c][d]]);
            break;

            default:
//            insertbyte(rtable[c][d]);
            break;
          }
        } else if(wave != 0xff) {
          // For normal notes, reverse all right side high bits
          note = this.instruments[i].wavetable[j][1] ^ 0x80;
        }


        this.wavetable.push([wave, note]);
      }
    }

    for(var i = 0; i < this.instruments.length; i++) {
      this.instruments[i].pulsePtr = 0;
      if(this.instruments[i].pulsetable.length > 0) {
        this.instruments[i].pulsePtr = this.pulsetable.length + 1;
        for(var j = 0; j < this.instruments[i].pulsetable.length; j++) {
          var left = this.instruments[i].pulsetable[j][0];
          var right = this.instruments[i].pulsetable[j][1];

          if(left == 0xff) {
            if(right != 0) {
              right = right + this.instruments[i].pulsePtr  - 1;
            }
          } 

          this.pulsetable.push([left, right]);
        }
      }
    }   

    for(var i = 0; i < this.instruments.length; i++) {
      this.instruments[i].vibParam = 0;
      if(this.instruments[i].vibratoSpeed && this.instruments[i].vibratoDepth) {
        this.instruments[i].vibParam = this.speedtable.length + 1;
        this.speedtable.push([this.instruments[i].vibratoSpeed, this.instruments[i].vibratoDepth]);
      }

      for(var j = 0; j < this.instruments[i].speedtable.length; j++) {
//        this.speedtable.push([this.instruments[i].speedtable[j][0], this.instruments[i].speedtable[j][1]]);        
      }

      /*
      if(this.instruments[i].speedtable.length > 0) {
        this.instruments[i].vibParam = this.speedtable.length + 1;
        for(var j = 0; j < this.instruments[i].speedtable.length; j++) {
          var left = this.instruments[i].speedtable[j][0];
          var right = this.instruments[i].speedtable[j][1];
          this.speedtable.push([left, right]);
        }
      }
      */

    }


  };


  this.packpattern= function(src) {
    var rows = src.length / 4;

    this.buildTables();

    var temp1 = [];
    var temp2 = [];
    var dest = [];
    var instr = 0;
    var command = -1;
    var databyte = -1;
    var destsizeim = 0;
    var destsize = 0;
    var c = 0;
    var d = 0;

    // First optimize instrument changes
    for(c = 0; c < rows; c++) {
      if((c) && (src[c*4+1]) && (src[c*4+1] == instr)) {
        // instrument hasn't changed
        temp1[c*4] = src[c*4];
        temp1[c*4+1] = 0;
        temp1[c*4+2] = src[c*4+2];
        temp1[c*4+3] = src[c*4+3];
      } else {
        temp1[c*4] = src[c*4];
        temp1[c*4+1] = src[c*4+1];
        temp1[c*4+2] = src[c*4+2];
        temp1[c*4+3] = src[c*4+3];
        if (src[c*4+1]) {
          instr = src[c*4+1];
        }
      }





/*
      switch(temp1[c*4+2]) {
        // remap speedtable commands
        case CMD_PORTAUP:
        case CMD_PORTADOWN:
          noportamento = 0;
          temp1[c*4+3] = tablemap[STBL][temp1[c*4+3]];
          break;

        case CMD_TONEPORTA:
          notoneporta = 0;
          temp1[c*4+3] = tablemap[STBL][temp1[c*4+3]];
          break;

        case CMD_VIBRATO:
          novib = 0;
          temp1[c*4+3] = tablemap[STBL][temp1[c*4+3]];
          break;
        // Remap table commands
        case CMD_SETWAVEPTR:
          nosetwaveptr = 0;
          temp1[c*4+3] = tablemap[WTBL][temp1[c*4+3]];
          break;

        case CMD_SETPULSEPTR:
          nosetpulseptr = 0;
          nopulse = 0;
          temp1[c*4+3] = tablemap[PTBL][temp1[c*4+3]];
          break;

        case CMD_SETFILTERPTR:
          nosetfiltptr = 0;
          nofilter = 0;
          temp1[c*4+3] = tablemap[FTBL][temp1[c*4+3]];
          break;


        case CMD_FUNKTEMPO:
          nofunktempo = 0;
          temp1[c*4+3] = tablemap[STBL][temp1[c*4+3]];
          break;

        case CMD_SETTEMPO:
          if (temp1[c*4+3] >= 0x80) nochanneltempo = 0;
          else noglobaltempo = 0;
          // Decrease databyte of all tempo commands for the playroutine
          // Do not touch funktempo
          if ((temp1[c*4+3] & 0x7f) >= 3)
            temp1[c*4+3]--;
          break;

      }
*/

    }
    // Write in playroutine format
    for (c = 0; c < rows; c++)
    {
      // Instrument change with mapping
      if (temp1[c*4+1])
      {
        temp2[destsizeim++] = instrmap[INSTRCHG+temp1[c*4+1]];

      }
      // Rest+FX
      if (temp1[c*4] == REST)
      {
        if ((temp1[c*4+2] != command) || (temp1[c*4+3] != databyte))
        {
          command = temp1[c*4+2];
          databyte = temp1[c*4+3];
          temp2[destsizeim++] = FXONLY+command;
          if (command)
            temp2[destsizeim++] = databyte;
        }
        else
          temp2[destsizeim++] = REST;
      }
      else
      {
        // Normal note
        if ((temp1[c*4+2] != command) || (temp1[c*4+3] != databyte))
        {
          command = temp1[c*4+2];
          databyte = temp1[c*4+3];
          temp2[destsizeim++] = FX+command;
          if (command)
            temp2[destsizeim++] = databyte;
        }
        temp2[destsizeim++] = temp1[c*4];
      }
    }


    // Final step: optimize long singlebyte rests with "packed rest"
    for (c = 0; c < destsizeim;) {
      var packok = 1;

      // Never pack first row or sequencer goes crazy
      if (!c) {
        packok = 0;
      }
      
      // There must be no instrument or command changes on the row to be packed
      if (temp2[c] < FX)
      {
        dest[destsize++] = temp2[c++];
        packok = 0;
      }

      var nextRow = false;
      if ((temp2[c] >= FXONLY) && (temp2[c] < FIRSTNOTE))
      {
        var fxnum = temp2[c] - FXONLY;
        dest[destsize++] = temp2[c++];
        if (fxnum) dest[destsize++] = temp2[c++];
        packok = 0;
//        goto NEXTROW;
        nextRow = true;
      }

      if(!nextRow) {
        if (temp2[c] < FXONLY) {
          var fxnum = temp2[c] - FX;
          dest[destsize++] = temp2[c++];
          if (fxnum) dest[destsize++] = temp2[c++];
          packok = 0;
        }

        if (temp2[c] != REST) {
          packok = 0;
        }

        if (!packok) {
          dest[destsize++] = temp2[c++];
        } else {
          for (d = c; d < destsizeim; )
          {
            if (temp2[d] == REST)
            {
              d++;
              if (d-c == 64) break;
            }
            else break;
          }
          d -= c;
          if (d > 1)
          {
            dest[destsize++] = -d;
            c += d;
          }
          else
            dest[destsize++] = temp2[c++];
        }
      }
    }
    // See if pattern too big
    if (destsize > 256) {
      alert('pattern too big!');
      return false;
    }

    // If less than 256 bytes, insert endmark
    if (destsize < 256) {
      dest[destsize++] = 0x00;
    }

    return dest;
  }



  this.packpattern2 = function(patternIndex) {
    var src = this.patterns[patternIndex];
    var rows = src.length / 4;


    var temp1 = [];
    var temp2 = [];
    var dest = [];
    var instr = 0;
    var command = -1;
    var databyte = -1;
    var destsizeim = 0;
    var destsize = 0;
    var c = 0;
    var d = 0;

    // First optimize instrument changes
    for(c = 0; c < rows; c++) {
      if((c) && (src[c*4+1]) && (src[c*4+1] == instr)) {
        // instrument hasn't changed

        // actuall writing out all the instruments??
        temp1[c*4] = src[c*4];
//        temp1[c*4+1] = 0;
        temp1[c*4+1] = src[c*4+1];

        temp1[c*4+2] = src[c*4+2];
        temp1[c*4+3] = src[c*4+3];
      } else {
        temp1[c*4] = src[c*4];
        temp1[c*4+1] = src[c*4+1];
        temp1[c*4+2] = src[c*4+2];
        temp1[c*4+3] = src[c*4+3];
        if (src[c*4+1]) {
          instr = src[c*4+1];
        }
      }


      switch(temp1[c*4+2]) {
        case CMD_SETTEMPO:
          if ((temp1[c*4+3] & 0x7f) >= 3) {
            temp1[c*4+3]--;
          }

        break;
        // remap speedtable commands
        case CMD_PORTAUP:
        case CMD_PORTADOWN:
        case CMD_TONEPORTA:
        case CMD_VIBRATO:
        case CMD_FUNKTEMPO:

          noportamento = 0;
          var speed = temp1[c*4+3];
          if(temp1[c*4+2] == CMD_TONEPORTA && speed == 0) {
            temp1[c*4+3] = 0;
          } else {
              // does this speed already exist in the speed table?
            var speedLeft = speed >> 8;
            var speedRight = speed & 0xff;
            var found = false;
            for(var k = 0; k < this.speedtable.length; k++) {
              if(this.speedtable[k][0] == speedLeft && this.speedtable[k][1] == speedRight) {
                found = true;
                temp1[c*4+3]  = k + 1;
                break;
              }
            }

            if(!found) {
              // need to add it
              temp1[c*4+3]  = this.speedtable.length + 1;
              this.speedtable.push([speedLeft, speedRight]);
            }

            if(temp1[c*4+2] == CMD_VIBRATO) {
              // TODO: whats this
            }


//            temp1[c*4+3] = this.speedtable.length + 1;
//            this.speedtable.push([speed >> 8, speed & 0xff]);
          }
          break;
        case CMD_SETFILTERPTR:
          var filter = temp1[c*4+3] - 1;
          temp1[c*4+3] = this.filters[filter].filterPtr;

          break;
      }


    } 




    var rowPositions = [];
    // Write in playroutine format
    for (c = 0; c < rows; c++)
    {
      var row = c;
      // Instrument change with mapping
      if (temp1[c*4+1])
      {
        rowPositions[destsizeim] = row;
        temp2[destsizeim++] = instrmap[INSTRCHG+temp1[c*4+1]];
      }
      // Rest+FX
      if (temp1[c*4] == REST)
      {
        if ((temp1[c*4+2] != command) || (temp1[c*4+3] != databyte))
        {
          command = temp1[c*4+2];
          databyte = temp1[c*4+3];

          rowPositions[destsizeim] = row;
          temp2[destsizeim++] = FXONLY+command;
          if (command) {
            rowPositions[destsizeim] = row;
            temp2[destsizeim++] = databyte;
          }
        }
        else {
          rowPositions[destsizeim] = row;
          temp2[destsizeim++] = REST;
        }
      }
      else
      {
        // Normal note
        if ((temp1[c*4+2] != command) || (temp1[c*4+3] != databyte))
        {
          command = temp1[c*4+2];
          databyte = temp1[c*4+3];
          rowPositions[destsizeim] = row;
          temp2[destsizeim++] = FX+command;
          if (command) {
            rowPositions[destsizeim] = row;
            temp2[destsizeim++] = databyte;
          }
        }
        rowPositions[destsizeim] = row;        
        temp2[destsizeim++] = temp1[c*4];
      }
    }

    this.patternRowPositions[patternIndex] = rowPositions;

    // Final step: optimize long singlebyte rests with "packed rest"
    for (c = 0; c < destsizeim;) {
      var packok = 1;


      packok = 0;
      // Never pack first row or sequencer goes crazy
      if (!c) {
        packok = 0;
      }
      
      // There must be no instrument or command changes on the row to be packed
      if (temp2[c] < FX)
      {
        dest[destsize++] = temp2[c++];
        packok = 0;
      }

      var nextRow = false;
      if ((temp2[c] >= FXONLY) && (temp2[c] < FIRSTNOTE))
      {
        var fxnum = temp2[c] - FXONLY;
        dest[destsize++] = temp2[c++];
        if (fxnum) dest[destsize++] = temp2[c++];
        packok = 0;
//        goto NEXTROW;
        nextRow = true;
      }

      if(!nextRow) {
        if (temp2[c] < FXONLY) {
          var fxnum = temp2[c] - FX;
          dest[destsize++] = temp2[c++];
          if (fxnum) dest[destsize++] = temp2[c++];
          packok = 0;
        }

        if (temp2[c] != REST) {
          packok = 0;
        }

        if (!packok) {
          dest[destsize++] = temp2[c++];
        } else {
          for (d = c; d < destsizeim; )
          {
            if (temp2[d] == REST)
            {
              d++;
              if (d-c == 64) break;
            }
            else break;
          }
          d -= c;
          if (d > 1)
          {
            dest[destsize++] = -d;
            c += d;
          }
          else
            dest[destsize++] = temp2[c++];
        }
      }
    }


    // See if pattern too big
    if (destsize > 256) {
      alert('too big');
      return false;
    }

    // pad it out to 255 bytes
    while(destsize < 255) {
      dest[destsize++] = 0x00;
    }

    // If less than 256 bytes, insert endmark
    if (destsize < 256) {
      dest[destsize++] = 0x00;
    }

    return dest;
  }

  this.writeSid = function(includePlayer) {
    var result = {};
    var locations = [];

    if(typeof includePlayer == 'undefined') {
      includePlayer = true;
    }

    // work out the track positions, 
    // think this was only used in the old player?
    this.trackPositions = [[],[],[]];
    for(var ch = 0; ch < 3; ch++) {
      if(ch < this.tracks.length) {
        this.trackPositions[ch] = [];
        var offset = 0;
        for(var track = 0; track < this.tracks[ch].length; track++) {
          this.trackPositions[ch][track] = offset;
          var patternID = this.tracks[ch][track];
          offset += this.patterns[patternID].length / 4;
        }
      }
    }


    this.testingInstrument = false;

    this.buildTables();

    this.labels = {};

    var startAddress = 0x1000;
    var address = startAddress;

    locations.push({ name: "Player", address: address });

    result['playerAddress'] = address;
    // write out the player
    for(var i = 0; i < SidPlayer.data.length; i++) {
      if(includePlayer) {
        this.memory[address++] = SidPlayer.data[i];
      } else {
        address++;
      }
    }

    // write out frequency table

    locations.push({ name: "Freq Table Lo", address: address });
    this.labels.mt_freqtbllo = address;
    for(var i = 0; i < freqtbllo.length; i++) {
      this.memory[address++] = freqtbllo[i];
    }

    locations.push({ name: "Freq Table Hi", address: address });
    this.labels.mt_freqtblhi = address;
    for(var i = 0; i < freqtblhi.length; i++) {
      this.memory[address++] = freqtblhi[i];
    }

    result['sidDataAddress'] = address;
    // write out song tables addresses

    locations.push({ name: "Song Table Lo", address: address });
    this.labels.mt_songtbllo = address;

    // have to fill in these addresses when know where it is
    address++;
    address++;
    address++;

    locations.push({ name: "Song Table Hi", address: address });
    this.labels.mt_songtblhi = address;

    // have to fill in these addresses when know where it is
    address++;
    address++;
    address++;

    locations.push({ name: "Pattern Table Lo", address: address });
    this.labels.mt_patttbllo = address;
    address += this.patterns.length;

    locations.push({ name: "Pattern Table Hi", address: address });
    this.labels.mt_patttblhi = address;
    address += this.patterns.length;

    locations.push({ name: "Instruments AD", address: address });
    this.labels.mt_insad = address;

    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].attack << 4;
      this.memory[address] += this.instruments[i].decay;
      address++;
    }

    locations.push({ name: "Instruments SR", address: address });
    this.labels.mt_inssr = address;

    for(var i = 0; i < this.instruments.length; i++) {

      this.memory[address] = this.instruments[i].sustain << 4;
      this.memory[address] += this.instruments[i].release;
      address++;
    }

    locations.push({ name: "Instruments Wave Ptr", address: address });
    this.labels.mt_inswaveptr = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].wavePtr;
      address++;
    }

    locations.push({ name: "Instruments Pulse Ptr", address: address });
    this.labels.mt_inspulseptr = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].pulsePtr;
      address++;
    }

    locations.push({ name: "Instruments Filter Ptr", address: address });
    this.labels.mt_insfiltptr = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].filtPtr;
      address++;
    }

    locations.push({ name: "Instruments Vibrato Param", address: address });
    this.labels.mt_insvibparam = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].vibParam;
      address++;
    }

    locations.push({ name: "Instruments Vibrato Delay", address: address });
    this.labels.mt_insvibdelay = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].vibratoDelay;
      address++;
    }

    locations.push({ name: "Instruments Gate Timer", address: address });
    this.labels.mt_insgatetimer = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].gateTimer & 0x3f;
      address++;
    }

    locations.push({ name: "Instruments First Wave", address: address });
    this.labels.mt_insfirstwave = address;
    for(var i = 0; i < this.instruments.length; i++) {
      this.memory[address] = this.instruments[i].firstWave;
      address++;
    }


    locations.push({ name: "Wave Table Left", address: address });
    this.labels.mt_wavetbl = address;

    for(var i = 0; i < this.wavetable.length; i++) {
      this.memory[address++] = this.wavetable[i][0];
    }    

    locations.push({ name: "Wave Table Right", address: address });
    this.labels.mt_notetbl = address;
    for(var i = 0; i < this.wavetable.length; i++) {
      this.memory[address++] = this.wavetable[i][1];
    }    

    locations.push({ name: "Pulse Table Left", address: address });
    this.labels.mt_pulsetimetbl = address;
    for(var i = 0; i < this.pulsetable.length; i++) {
      this.memory[address++] = this.pulsetable[i][0];
    }

    locations.push({ name: "Pulse Table Right", address: address });
    this.labels.mt_pulsespdtbl = address;
    for(var i = 0; i < this.pulsetable.length; i++) {
      this.memory[address++] = this.pulsetable[i][1];
    }

    locations.push({ name: "Filter Table Left", address: address });
    this.labels.mt_filttimetbl = address;
    for(var i = 0; i < this.filtertable.length; i++) {
      this.memory[address++] = this.filtertable[i][0];
    }

    locations.push({ name: "Filter Table Right", address: address });
    this.labels.mt_filtspdtbl = address;
    for(var i = 0; i < this.filtertable.length; i++) {
      this.memory[address++] = this.filtertable[i][1];
    }

    if(this.filtertable.length == 0) {
      this.memory[address++] = 0;
//      address++;
    }

    var packedPatternData = [];

    for(var pattern = 0; pattern < this.patterns.length; pattern++) {
      var patternData = this.packpattern2(pattern);
      packedPatternData.push(patternData);
    }

    this.memory[address++] = 0;

    locations.push({ name: "Speed Table Left", address: address });
    this.labels.mt_speedlefttbl = address;
    for(var i = 0; i < this.speedtable.length; i++) {
      this.memory[address++] = this.speedtable[i][0];
    }

    this.memory[address++] = 0;
    
    locations.push({ name: "Speed Table Right", address: address });
    this.labels.mt_speedrighttbl = address;
    for(var i = 0; i < this.speedtable.length; i++) {
      this.memory[address++] = this.speedtable[i][1];
    }

    if(this.speedtable.length == 0) {
      this.memory[address++] = 0;

    }

    for(var track = 0; track < this.tracks.length; track++) {
      this.labels['mt_song' + track] = address;
      this.memory[this.labels.mt_songtbllo + track] = address & 0xff;
      this.memory[this.labels.mt_songtblhi + track] = address >> 8;

      locations.push({ name: "Track " + track + " Patterns", address: address });      
      for(var i = 0; i < this.tracks[track].length; i++) {
        this.memory[address++] = this.tracks[track][i];
      }
      this.memory[address++] = 0xff;
      this.memory[address++] = 0x00;
//      this.memory[address++] = this.tracks[track].length;
    }


//    this.buildTables();
    for(var pattern = 0; pattern < this.patterns.length; pattern++) {
      locations.push({ name: "Pattern " + pattern, address: address });
      this.memory[this.labels.mt_patttbllo + pattern] = address & 0xff; 
      this.memory[this.labels.mt_patttblhi + pattern] = address >> 8; 

      this.labels['mt_patt' + pattern] = address;


//      var patternData = this.packpattern2(pattern);

      var patternData = packedPatternData[pattern];

      for(var i = 0; i < patternData.length - 2; i++) {
        this.memory[address++] = patternData[i];
      }
      this.memory[address++] = 0x00;

    }


    this.sidEnd = address;
    result['sidEndAddress'] = address;


    // tempo

    var tempo = parseInt($('#sidTempo').val());
    if(firstNoHRInstrument === false) {
      firstNoHRInstrument = 0xfe;
    }

    if(firstLegatoInstrument === false) {
      firstLegatoInstrument = 0xff;
    }

    this.memory[0x1134] = tempo - 1;
    this.memory[0x1401] = firstNoHRInstrument;
    this.memory[0x1427] = firstLegatoInstrument;


    for(var label in labelPositions) {
      var offset = 0;

      var positions = labelPositions[label];

      var pos = label.indexOf('minus1');
      if(pos != -1) {
        offset = -1;
        label = label.substring(0, pos);
      }

      var pos = label.indexOf('minus2');
      if(pos != -1) {
        offset = -2;
        label = label.substring(0, pos);
      }

      var pos = label.indexOf('plus1');
      if(pos != -1) {
        offset = 1;
        label = label.substring(0, pos);
      }

      if(label == 'mt_freqtbllo') {
        //offset = offset - 0x60;
      }

      if(label == 'mt_freqtblhi') {
        //offset = offset - 0x60;
      }

      var labelAddress = this.labels[label] + offset;

      var labelAddressLo = labelAddress & 0xff;
      var labelAddressHi = labelAddress >> 8;

      for(var i = 0; i < positions.length; i++) {

        this.memory[positions[i]] = labelAddressLo;
        this.memory[positions[i] + 1] = labelAddressHi;
      }
    }

    console.log(locations);
    return result;

  }  

  this.getSIDData = function() {
    var data = [];
    var index = 0;

    for(var i = 0; i < SidPlayer.driver.length; i++) {
//      data[index++] = SidPlayer.driver[i];
    }

    for(var i = this.sidStart; i < this.sidEnd; i++) {
      data[index++] = this.memory[i];
    }

    return data;

    var length = index;
    var output = new Uint8Array(length);  

    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }

    data = null;
    return output;


  }
  this.downloadPRG = function(args) {
    console.log('download prg: ');
    console.log(args);

    var filename = 'music';
    var allInstruments = true;
    var type = 'prg';

    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }

      if(typeof args.allInstruments != 'undefined') {
        allInstruments = args.allInstruments;
      }

      if(typeof args.type != 'undefined') {
        type = args.type;
      }
    }


    var data = [];
    var index = 0;

    if(type == 'prg') {
      for(var i = 0; i < SidPlayer.driver.length; i++) {
        data[index++] = SidPlayer.driver[i];
      }
    }

    for(var i = this.sidStart; i < this.sidEnd; i++) {
      data[index++] = this.memory[i];
    }

    var length = data.length;
    var output = new Uint8Array(length);  

    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }

//    filename = 'c64.prg';

    if(type == 'prg') {
      if(filename.indexOf('.prg') == -1) {
        filename += ".prg";
      }
      download(output, filename, "application/prg"); 
    } else {
      if(filename.indexOf('.bin') == -1) {
        filename += ".bin";
      }      
      download(output, filename, "application/bin");
    }

  }


  this.downloadGoat = function(args) {//filename, title, author, released) {
    var filename = 'music';
    var title = 'SID Title';
    var author = 'SID Author';
    var released = 'SID Released';
    var allInstruments = true;

    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }

      if(typeof args.title != 'undefined') {
        title = args.title;
      }

      if(typeof args.author != 'undefined') {
        author = args.author;
      }

      if(typeof args.released != 'undefined') {
        released = args.released;
      }

      if(typeof args.allInstruments != 'undefined') {
        allInstruments = args.allInstruments;
      }

    }

    var data = [];
    var index = 0;


    /*
 6.1.1 Song header
-----------------

Offset  Size    Description
+0      4       Identification string GTS5
+4      32      Song name, padded with zeros
+36     32      Author name, padded with zeros
+68     32      Copyright string, padded with zeros
+100    byte    Number of subtunes

    */
    var idString = "GTS5";
    for(var i = 0; i < idString.length; i++) {
      data[index++] = idString.charCodeAt(i);
    }

    var songName = title;
    if(songName.length > 32) {
      songName = songName.substring(0, 32);
    }
    for(var i = 0; i < songName.length; i++) {
      data[index++] = songName.charCodeAt(i);
    }
    for(var i = songName.length; i < 32; i++) {
      data[index++] = 0x00;
    }

    var authorName = author;
    if(authorName.length > 32) {
      authorName = authorName.substring(0, 32);
    }
    for(var i = 0; i < authorName.length; i++) {
      data[index++] = authorName.charCodeAt(i);
    }
    for(var i = authorName.length; i < 32; i++) {
      data[index++] = 0x00;
    }

    var copyright = released;
    if(copyright.length > 32) {
      copyright = copyright.substring(0, 32);
    }
    for(var i = 0; i < copyright.length; i++) {
      data[index++] = copyright.charCodeAt(i);
    }
    for(var i = copyright.length; i < 32; i++) {
      data[index++] = 0x00;
    }

    // number of subtunes
    data[index++] = 1;

    /*
      Song orderlists

      Offset  Size    Description
      +0      byte    Length of this channel's orderlist n, not counting restart pos.
      +1      n+1     The orderlist data:
                Values $00-$CF are pattern numbers
                Values $D0-$DF are repeat commands
                Values $E0-$FE are transpose commands
                Value $FF is the RST endmark, followed by a byte that indicates
                the restart position

    */



    for(var i = 0; i < this.tracks.length; i++) {
      data[index++] = this.tracks[i].length + 1;
      for(var j = 0; j < this.tracks[i].length; j++) {
        data[index++] = this.tracks[i][j];
      }
      data[index++] = 0xff;
      data[index++] = 0;
    }


    var wavetable = [];
    var pulsetable = [];
    var speedtable = [];
    var filtertable = [];

    var pointers = [];


    // global filters need to be in filtertable first
    for(var i = 0; i < this.filters.length; i++) {
      var filterStart = filtertable.length;

      for(var j = 0; j < this.filters[i].filtertable.length; j++) {
        var left = this.filters[i].filtertable[j][0];
        var right = this.filters[i].filtertable[j][1];
        if(left == 0xff) {
          if(right != 0) {
            right = right + filterStart;
          }
        }
        filtertable.push([left, right]);
      }
    }



    for(var i = 0; i < this.instruments.length; i++) {

      pointers[i] = {};
      pointers[i].wavetableStart = wavetable.length;

      if(this.instruments[i].wavetable.length > 1) {
        for(var j = 0; j < this.instruments[i].wavetable.length; j++) {
          var left = this.instruments[i].wavetable[j][0];
          var right = this.instruments[i].wavetable[j][1];


          // Remap table-referencing commands
          switch (this.instruments[i].wavetable[j][0] - WAVECMD)
          {
            case CMD_PORTAUP:
            case CMD_PORTADOWN:
            case CMD_TONEPORTA:
            case CMD_VIBRATO:
            case CMD_FUNKTEMPO:


              // add the speed from instruments speedtable to the global speedtable
              var speedleft = this.instruments[i].speedtable[right - 1][0];
              var speedright = this.instruments[i].speedtable[right - 1][1];

              var found = false;
              for(var k = 0; k < speedtable.length; k++) {
                if(speedtable[k][0] == speedleft && speedtable[k][1] == speedright) {
                  right = k + 1;
                  found = true;
                }
              }

              if(!found) {
                right = speedtable.length + 1;
                speedtable.push([speedleft, speedright]);
              }

            break;

            case CMD_SETPULSEPTR:
            break;

            case CMD_SETFILTERPTR:
            break;

            default:
            break;
          }


          if(left == 0xff && right != 0) {
            right = right + pointers[i].wavetableStart;
          }
          wavetable.push([left, right]);
        }
      } else {
        pointers[i].wavetableStart = -1;
      }

      pointers[i].pulsetableStart = pulsetable.length;

      if(this.instruments[i].pulsetable.length > 1) {
        // check if already have entries matching this pulse table
  
        var match = false;

        for(var k = 0; k <= pulsetable.length - this.instruments[i].pulsetable.length; k++) {
          match = true;
          for(var j = 0; j < this.instruments[i].pulsetable.length; j++) {

            if(pulsetable[k + j][0] != this.instruments[i].pulsetable[j][0]
              || pulsetable[k + j][1] != this.instruments[i].pulsetable[j][1]) {
              match = false;
              break;
            }
          }

          if(match) {
//            alert('match');
            pointers[i].pulsetableStart = k;
            break;
          }

        }

        if(!match) {
          // wasnt found so add it in
          for(var j = 0; j < this.instruments[i].pulsetable.length; j++) {
            var left = this.instruments[i].pulsetable[j][0];
            var right = this.instruments[i].pulsetable[j][1];
            if(left == 0xff && right != 0) {
              right = right + pointers[i].pulsetableStart;
            }

            pulsetable.push([left, right]);
          }
        }
      } else {
        pointers[i].pulsetableStart = -1;
      }


      this.instruments[i].vibParam = 0;
      if(this.instruments[i].vibratoSpeed && this.instruments[i].vibratoDepth) {
        var speedLeft = this.instruments[i].vibratoSpeed;
        var speedRight = this.instruments[i].vibratoDepth;
        var found = false;
        for(var k = 0; k < speedtable.length; k++) {
          if(speedtable[k][0] == speedLeft && speedtable[k][1] == speedRight) {
            found = true;
            this.instruments[i].vibParam  = k + 1;
            break;
          }
        }

        if(!found) {
          // need to add it
          this.instruments[i].vibParam = speedtable.length + 1;
          speedtable.push([speedLeft, speedRight]);
        }


//        this.instruments[i].vibParam = speedtable.length + 1;
//        speedtable.push([, ]);
      }

      for(var j = 0; j < this.instruments[i].speedtable.length; j++) {
        speedtable.push([this.instruments[i].speedtable[j][0], this.instruments[i].speedtable[j][1]]);
      }

      this.instruments[i].filtPtr = 0;
      if(this.instruments[i].filtertable.length > 0) {
        this.instruments[i].filtPtr = filtertable.length + 1;


        for(var j = 0; j < this.instruments[i].filtertable.length; j++) {
          var left = this.instruments[i].filtertable[j][0];
          var right = this.instruments[i].filtertable[j][1];

          if(left == 0xff) {
            if(right != 0) {
              right = right + this.instruments[i].filtPtr - 1;
            }
          }

          filtertable.push([left, right]);

        }
      }
    }



    // update pointers for filtertable, speedtable, 
    for(var i = 0; i < this.patterns.length; i++) {
      for(var j = 0; j < this.patterns[i].length; j += 4) {
        var note = this.patterns[i][j];
        var instrument = this.patterns[i][j + 1];
        var effect = this.patterns[i][j + 2];
        var effectParam = this.patterns[i][j + 3];

        switch(effect) {
          case CMD_PORTAUP:
          case CMD_PORTADOWN:
          case CMD_TONEPORTA:
          case CMD_VIBRATO:  
          case CMD_FUNKTEMPO:
                  
            noportamento = 0;
            var speed = effectParam

            if(effect == CMD_TONEPORTA && speed == 0) {
              this.patterns[i][j + 3] = 0;
            } else {
              // does this speed already exist in the speed table?
              var speedLeft = speed >> 8;
              var speedRight = speed & 0xff;
              var found = false;
              for(var k = 0; k < speedtable.length; k++) {
                if(speedtable[k][0] == speedLeft && speedtable[k][1] == speedRight) {
                  found = true;
                  this.patterns[i][j + 3] = k + 1;
                  break;
                }
              }

              if(!found) {
                // need to add it
                this.patterns[i][j + 3] = speedtable.length + 1;
                speedtable.push([speedLeft, speedRight]);
              }
            }
            break;

          case CMD_SETFILTERPTR:
            var filter = effectParam - 1;
            this.patterns[i][j + 3] = this.filters[filter].filterPtr;

            break;


        }
      }
    }




/*
       Instruments

       Offset  Size    Description
       +0      byte    Amount of instruments n

       Then, this structure repeats n times for each instrument. Instrument 0 (the
       empty instrument) is not stored.

       Offset  Size    Description
       +0      byte    Attack/Decay
       +1      byte    Sustain/Release
       +2      byte    Wavepointer
       +3      byte    Pulsepointer
       +4      byte    Filterpointer
       +5      byte    Vibrato param. (speedtable pointer)
       +6      byte    Vibraro delay
       +7      byte    Gateoff timer
       +8      byte    Hard restart/1st frame waveform
       +9      16      Instrument name

*/
    data[index++] = this.instruments.length;
    for(var i = 0; i < this.instruments.length; i++) {
      data[index++] = (this.instruments[i].attack << 4) + this.instruments[i].decay;
      data[index++] = (this.instruments[i].sustain << 4) + this.instruments[i].release;
      data[index++] = pointers[i].wavetableStart + 1;
      data[index++] = pointers[i].pulsetableStart + 1;
      data[index++] = this.instruments[i].filtPtr;
      data[index++] = this.instruments[i].vibParam;
      if(this.instruments[i].vibParam != 0) {
        data[index++] = this.instruments[i].vibratoDelay + 1;
      } else {
        data[index++] = this.instruments[i].vibratoDelay;
      }
      data[index++] = this.instruments[i].gateTimer;
      data[index++] = this.instruments[i].firstWave;


      var instrumentName = this.instruments[i].name;
      if(instrumentName.length > 16) {
        instrumentName = instrumentName.substring(0, 16);
      }
      for(var j = 0; j < instrumentName.length; j++) {
        data[index++] = instrumentName.charCodeAt(j);
      }
      for(var j = instrumentName.length; j < 16; j++) {
        data[index++] = 0x00;
      }

    }
   
/*

    Tables

    This structure repeats for each of the 4 tables (wavetable, pulsetable,
    filtertable, speedtable).

    Offset  Size    Description
    +0      byte    Amount n of rows in the table
    +1      n       Left side of the table
    +1+n    n       Right side of the table
*/

    data[index++] = wavetable.length;
    for(var i = 0; i < wavetable.length; i++) {
      data[index++] = wavetable[i][0];
    }
    for(var i = 0; i < wavetable.length; i++) {
      data[index++] = wavetable[i][1];
    }

    data[index++] = pulsetable.length;
    for(var i = 0; i < pulsetable.length; i++) {
      data[index++] = pulsetable[i][0];
    }
    for(var i = 0; i < pulsetable.length; i++) {
      data[index++] = pulsetable[i][1];
    }

    data[index++] = filtertable.length;
    for(var i = 0; i < filtertable.length; i++) {
      data[index++] = filtertable[i][0];
    }
    for(var i = 0; i < filtertable.length; i++) {
      data[index++] = filtertable[i][1];
    }


    data[index++] = speedtable.length;
    for(var i = 0; i < speedtable.length; i++) {
      data[index++] = speedtable[i][0];
    }
    for(var i = 0; i < speedtable.length; i++) {
      data[index++] = speedtable[i][1];
    }



/*
    Patterns header

    Offset  Size    Description
    +0      byte    Number of patterns n

*/
    data[index++] = this.patterns.length;


/*
    Patterns

    Repeat n times, starting from pattern number 0.

    Offset  Size    Description
    +0      byte    Length of pattern in rows m
    +1      m*4     Groups of 4 bytes for each row of the pattern:
                    1st byte: Notenumber
                              Values $60-$BC are the notes C-0 - G#7
                              Value $BD is rest
                              Value $BE is keyoff
                              Value $BF is keyon
                              Value $FF is pattern end
                    2nd byte: Instrument number ($00-$3F)
                    3rd byte: Command ($00-$0F)
                    4th byte: Command databyte    
*/


    for(var i = 0; i < this.patterns.length; i++) {
      data[index++] = (this.patterns[i].length / 4) + 1;
      for(var j = 0; j < this.patterns[i].length; j++) {
        data[index++] = this.patterns[i][j];
      }
      data[index++] = 0xff;
      data[index++] = 0;
      data[index++] = 0;
      data[index++] = 0;
    }



    var length = index;
    var output = new Uint8Array(length);

    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }

//    filename = 'c64.sng';

    if(filename.indexOf('.sng') == -1) {
      filename += ".sng";
    }

    download(output, filename, "application/sng");


  }

  this.downloadSID = function(args) {
    var filename = 'music';
    var title = 'SID Title';
    var author = 'SID Author';
    var released = 'SID Released';
    var allInstruments = true;

    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }

      if(typeof args.title != 'undefined') {
        title = args.title;
      }

      if(typeof args.author != 'undefined') {
        author = args.author;
      }

      if(typeof args.released != 'undefined') {
        released = args.released;
      }

      if(typeof args.allInstruments != 'undefined') {
        allInstruments = args.allInstruments;
      }

    }


    var data = [];
    var index = 0;

//    for(var i = 0; i < SidPlayer.driver.length; i++) {
//      data[index++] = SidPlayer.driver[i];
//    }

    // magic id
    data[index++] = 0x50;
    data[index++] = 0x53;
    data[index++] = 0x49;
    data[index++] = 0x44;

    // version
    data[index++] = 0x00;
    data[index++] = 0x02;

    // data offset
    data[index++] = 0x00;
    data[index++] = 0x7c;
    // 0x76 for version 1

    // load address, or 00 for first 2 bytes are load address
    data[index++] = 0x10;
    data[index++] = 0x00;

    // init address, 0 for same as load address
    data[index++] = 0x10;
    data[index++] = 0x00;

    // play address
    data[index++] = 0x10;
    data[index++] = 0x03;

    // songs
    data[index++] = 0x00;
    data[index++] = 0x01;

    // start song
    data[index++] = 0x00;
    data[index++] = 0x01;

    // speed
    data[index++] = 0x00;
    data[index++] = 0x00;
    data[index++] = 0x00;
    data[index++] = 0x00;


    // title, 32 bytes
//    var title = title;
    if(title.length > 32) {
      title = title.substring(0, 32);
    }
    for(var i = 0; i < title.length; i++) {
      data[index++] = title.charCodeAt(i);
    }
    for(var i = title.length; i < 32; i++) {
      data[index++] = 0x00;      
    }

    // author, 32 bytes
//    var author = "SID Author";
    if(author.length > 32) {
      author = author.substring(0, 32);
    }

    for(var i = 0; i < author.length; i++) {
      data[index++] = author.charCodeAt(i);
    }
    for(var i = author.length; i < 32; i++) {
      data[index++] = 0x00;      
    }

    // released, 32 bytes
  //  var released = "SID Released";
    if(released.length > 32) {
      released = released.substring(0, 32);
    }

    for(var i = 0; i < released.length; i++) {
      data[index++] = released.charCodeAt(i);
    }
    for(var i = released.length; i < 32; i++) {
      data[index++] = 0x00;      
    }

    // flags
    data[index++] = 0x00;
    data[index++] = 0x00;


    // start page
    data[index++] = 0x00;
    // page length    
    data[index++] = 0x00;

    // second sid address
    data[index++] = 0x00;


    // third sid address
    data[index++] = 0x00;


    for(var i = this.sidStart; i < this.sidEnd; i++) {
      data[index++] = this.memory[i];
    }

    var length = index;
    var output = new Uint8Array(length);  

    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }

//    filename = 'c64.sid';

    if(filename.indexOf('.sid') == -1) {
      filename += ".sid";
    }

    download(output, filename, "application/sid");   
  }



  this.logTable = function(tablename, table) {
    console.log('table: ' + tablename);
    for(var i = 0; i < table.length; i++) {
      var pos = i + 1;
      pos = pos.toString(16);
      var left = table[i][0].toString(16);
      var right = table[i][1].toString(16);

      console.log(pos + ':' + left + ',' + right);
    }

  }


}
