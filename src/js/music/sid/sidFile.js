var SidFile = function() {
  this.music = null;
}

SidFile.prototype = {
  init: function(music) {
    this.music = music;
  },


  limitString: function(s, limit) {
    if(!s) {
      return;
    }

    if(s.length > limit) {
      s = s.substring(0, limit);
    }
    return s;

  },

  isArray: function(test) {
    if(test.constructor === Array) {
      return true;
    }
    console.log('is not array');
    return false;
  },
  load: function(data) {
    var music = this.music;
    music.clearAll();

    if(typeof data.header == 'undefined') {
      console.log('no header');
      return;
    }
    music.name = this.limitString(data.header.name, 32);
    music.author = this.limitString(data.header.author, 32);
    music.copyright = this.limitString(data.header.copyright, 32);
    music.tempo = parseInt(data.header.tempo);
    music.setTempo(music.tempo);

    var speed = 1;
    if(data.header.speed) {
      speed = parseInt(data.header.speed);
    }

    music.setSpeed(speed);

//    console.log("music name = " + music.name);
    music.tracks = [];
    if(!this.isArray(data.tracks)) {
      return;
    }

    if(data.tracks.length != 3) {
      // should have 3 channels
      console.log('not 3 channel' + data.tracks.length);
      return;
    }
    for(var i = 0; i < data.tracks.length; i++) {
      music.tracks[i] = [];
      for(var j = 0; j < data.tracks[i].length; j++) {
        music.tracks[i][j] = data.tracks[i][j];
      }
    }

    if(!this.isArray(data.instruments)) {
      return;
    }

    var instruments = [];
    for(var i = 0; i < data.instruments.length; i++) {
      var instrument = {};
      instrument.name = this.limitString(data.instruments[i].name, 16);
      instrument.type = this.limitString(data.instruments[i].type, 16);
      instrument.color = parseInt(data.instruments[i].color);

      instrument.attack = parseInt(data.instruments[i].a);
      instrument.decay = parseInt(data.instruments[i].d);
      instrument.sustain = parseInt(data.instruments[i].s);
      instrument.release = parseInt(data.instruments[i].r);

      instrument.vibratoSpeed = parseInt(data.instruments[i].vSp);
      instrument.vibratoDepth = parseInt(data.instruments[i].vDp);
      instrument.vibratoDelay = parseInt(data.instruments[i].vDl);


      instrument.gateTimer = parseInt(data.instruments[i].gT);
      instrument.firstWave = parseInt(data.instruments[i].fW);

      instrument.vibParam = 0;


      instrument.wavetable = [];
      instrument.filtertable = [];
      instrument.pulsetable = [];
      instrument.speedtable = [];


      if(instrument.type == 'basic') {
        instrument.basicWaveform = parseInt(data.instruments[i].bW);


        if(typeof data.instruments[i].bE == 'undefined') {
          data.instruments[i].bE = 'none';
        }
        instrument.basicEffect = this.limitString(data.instruments[i].bE, 16);
        instrument.pulseWidth = parseInt(data.instruments[i].pW);
        instrument.pulseModulationSpeed = parseInt(data.instruments[i].pMS);
        instrument.pulseModulationDepth = parseInt(data.instruments[i].pMD);

        if(instrument.basicEffect == 'arpeggio') {
          instrument.arpeggioSpeed = parseInt(data.instruments[i].aS);
          instrument.arpeggioType = this.limitString(data.instruments[i].aT, 16);
          instrument.arpeggioDirection = this.limitString(data.instruments[i].aD, 8);

          if(instrument.arpeggioType == 'custom') {
            instrument.arpeggioValues = [];
            for(var j = 0; j < data.instruments[i].aV.length; j++) {
              instrument.arpeggioValues.push(data.instruments[i].aV[j]);
            }
          }
        }

        if(instrument.basicEffect == 'tremolo') {
          instrument.tremoloOn  = parseInt(data.instruments[i].tOn);
          instrument.tremoloOff = parseInt(data.instruments[i].tOf);
        }

      } else if(instrument.type == 'drum') {
        instrument.drumType = data.instruments[i].dT;
        instrument.drumWaveform = data.instruments[i].dW;
      } else if(instrument.type == 'advanced') {

        instrument.wavetable = [];
        for(var j = 0; j < data.instruments[i].wt.length; j++) {
          instrument.wavetable.push([data.instruments[i].wt[j][0], data.instruments[i].wt[j][1]]);
        }
        instrument.pulsetable = [];
        for(var j = 0; j < data.instruments[i].pt.length; j++) {
          instrument.pulsetable.push([data.instruments[i].pt[j][0], data.instruments[i].pt[j][1]]);
        }
        instrument.filtertable = [];
        for(var j = 0; j < data.instruments[i].ft.length; j++) {
          instrument.filtertable.push([data.instruments[i].ft[j][0], data.instruments[i].ft[j][1]]);
        }
        instrument.speedtable = [];
        for(var j = 0; j < data.instruments[i].st.length; j++) {
          instrument.speedtable.push([data.instruments[i].st[j][0], data.instruments[i].st[j][1]]);
        }
      }

      if(instrument.wavetable.length > 0) {
        instrument.wavePtr = 0x01;
      } else {
        instrument.wavePtr = 0;
      }
      if(instrument.pulsetable.length > 0) {
        instrument.pulsePtr = 0x01;
      } else {
        instrument.pulsePtr = 0x0;
      }

      if(instrument.filtertable.length > 0) {
        instrument.filtPtr = 0x01;
      } else {
        instrument.filtPtr = 0x0;
      }
      instruments.push(instrument);

    }

    music.instruments.instruments = instruments;

    for(var i = 0; i < music.instruments.instruments.length; i++) {
      music.instruments.currentInstrument = i;

      if(music.instruments.instruments[i].type == 'basic') {

        music.editInstrument.editInstrument(i);
        music.editInstrument.setInstrumentData();

      }
      if(music.instruments.instruments[i].type == 'drum') {
        music.editInstrument.editInstrument(i);
        music.editInstrument.setInstrumentData();
      }
    }

    music.instruments.updateInstrumentHTML();
    music.instruments.updateInstruments();
    if(typeof music.sidPlayer != 'undefined') {
      music.sidPlayer.testInstrumentSetup();
    }



    if(!this.isArray(data.filters)) {
      console.log('filters is not array');
      return;
    }

    var filters = [];
    for(var i = 0; i < data.filters.length; i++) {
      var filter = {};
      filter.name = this.limitString(data.filters[i].name, 16);
      filter.type = data.filters[i].type;
      if(filter.type == 'undefined') {
        filter.type = 'advanced';
      }
      filter.color = parseInt(data.filters[i].color);
      if(isNaN(filter.color)) {
        filter.color = 0;
      }
      filter.filtertable = [];
      for(var j = 0; j < data.filters[i].ft.length; j++) {
        filter.filtertable.push([data.filters[i].ft[j][0], data.filters[i].ft[j][1]]);
      }

      if(filter.type == 'basic') {
        filter.basicFilterType = data.filters[i].bFt;
        filter.basicFilterResonance = parseInt(data.filters[i].bRes);
        filter.basicFilterChannels = parseInt(data.filters[i].bCh);
        filter.basicCutoff = parseInt(data.filters[i].bCu);
        filter.basicModulationDirection = data.filters[i].bMd;
        filter.basicModulationTime = parseInt(data.filters[i].bMt);
        filter.basicModulationSpeed = parseInt(data.filters[i].bMs);
        filter.basicModulationRepeat = parseInt(data.filters[i].bRe);
      }


      filters.push(filter);
    }

    music.filters.filters = filters;
    for(var i = 0; i < music.filters.filters.length; i++) {
      if(music.filters.filters[i].type == 'basic') {
        music.editFilter.editFilter(i);
        music.editFilter.setFilterData();
 
      }
    }
    music.filters.updateFilterHTML();



    if(!this.isArray(data.patterns)) {
      console.log('patterns is not array');
      return;
    }

    for(var i = 0; i < data.patterns.length; i++) {
      var patternLength = data.patterns[i].data.length;
      var patternName = data.patterns[i].name;

      var pattern = new Pattern();
      pattern.init(patternName, patternLength);
      music.patterns.push(pattern);


      for(var j = 0; j < data.patterns[i].data.length; j++) {
        var row = data.patterns[i].data[j];

        music.patterns[i].data[j].start = (row[0] == j);
        music.patterns[i].data[j].startPosition = row[0];
        music.patterns[i].data[j].instrument = row[1];
        music.patterns[i].data[j].pitch = row[2];
        music.patterns[i].data[j].duration = row[3];
        music.patterns[i].data[j].effect = row[4];
        music.patterns[i].data[j].effectParam = row[5];
        music.patterns[i].data[j].effectParam2 = row[6];

      }
    }

    music.trackView.drawPatterns();

  },

  getSaveData: function() {
    var music = this.music;

    var data = {};
    var header = {};
    header.name = this.limitString(music.name, 32);
    header.author = this.limitString(music.author, 32);
    header.copyright = this.limitString(music.copyright, 32);
    header.tempo = music.getTempo();
    header.speed = music.getSpeed();

    data.header = header;

    var tracks = [];
    for(var i = 0; i < music.tracks.length; i++) {
      tracks[i] = [];
      for(var j = 0; j < music.tracks[i].length; j++) {
        tracks[i][j] = music.tracks[i][j];
      }
    }

    data.tracks = tracks;

    var dataInstruments = [];
    var instruments = music.instruments.instruments;

    for(var i = 0; i < instruments.length; i++) {
      var instrument = {};
      instrument.name = this.limitString(instruments[i].name, 16);
      if(typeof instruments[i].type == 'undefined') {
        instruments[i].type = 'advanced';
      }
      instrument.type = this.limitString(instruments[i].type, 16);
      instrument.color = instruments[i].color;
      instrument.a = instruments[i].attack;
      instrument.d = instruments[i].decay;
      instrument.s = instruments[i].sustain;
      instrument.r = instruments[i].release;
      instrument.vSp = instruments[i].vibratoSpeed;
      instrument.vDp = instruments[i].vibratoDepth;
      instrument.vDl = instruments[i].vibratoDelay;
      instrument.gT = instruments[i].gateTimer;
      instrument.fW = instruments[i].firstWave;

      if(instrument.type == 'basic') {
        instrument.bW = instruments[i].basicWaveform;

        instrument.bE = instruments[i].basicEffect;
        if(typeof instrument.bE == 'undefined') {
          instrument.bE = 'none';
        }

        instrument.pW = instruments[i].pulseWidth;
        instrument.pMS = instruments[i].pulseModulationSpeed;
        instrument.pMD = instruments[i].pulseModulationDepth;

        if(instrument.bE == 'arpeggio') {
          instrument.aS = instruments[i].arpeggioSpeed;
          instrument.aT = instruments[i].arpeggioType;
          instrument.aD = instruments[i].arpeggioDirection;
          if(instruments[i].arpeggioType == 'custom') {
            instrument.aV = [];
            for(var j = 0; j < instruments[i].arpeggioValues.length; j++) {
              instrument.aV.push(instruments[i].arpeggioValues[j]);
            }
          }
        }

        if(instrument.bE == 'tremolo') {
          instrument.tOn = instruments[i].tremoloOn;
          instrument.tOf = instruments[i].tremoloOff;
        }

      } else if(instrument.type == 'advanced') {
        instrument.wt = [];
        for(var j = 0; j < instruments[i].wavetable.length; j++) {
          instrument.wt.push([instruments[i].wavetable[j][0], instruments[i].wavetable[j][1]]);
        }
        instrument.pt = [];
        for(var j = 0; j < instruments[i].pulsetable.length; j++) {
          instrument.pt.push([instruments[i].pulsetable[j][0], instruments[i].pulsetable[j][1]]);
        }
        instrument.ft = [];
        for(var j = 0; j < instruments[i].filtertable.length; j++) {
          instrument.ft.push([instruments[i].filtertable[j][0], instruments[i].filtertable[j][1]]);
        }
        instrument.st = [];
        for(var j = 0; j < instruments[i].speedtable.length; j++) {
          instrument.st.push([instruments[i].speedtable[j][0], instruments[i].speedtable[j][1]]);
        }

      } else if(instrument.type == 'drum') {
        instrument.dT = instruments[i].drumType;
        instrument.dW = instruments[i].drumWaveform; 
      }

      dataInstruments.push(instrument);

    }

    data.instruments = dataInstruments



    var dataFilters = [];
    var filters = music.filters.filters;

    for(var i = 0; i < filters.length; i++) {
      var filter = {};
      filter.name = filters[i].name;
      filter.type = filters[i].type;
      if(filter.type == 'basic') {
        filter.bFt = parseInt(filters[i].basicFilterType);
        filter.bRes = parseInt(filters[i].basicFilterResonance);
        filter.bCh = parseInt(filters[i].basicFilterChannels);
        filter.bCu = parseInt(filters[i].basicCutoff);
        filter.bMd = filters[i].basicModulationDirection;
        filter.bMt = parseInt(filters[i].basicModulationTime);
        filter.bMs = parseInt(filters[i].basicModulationSpeed);
        filter.bRe = parseInt(filters[i].basicModulationRepeat);
      }
      filter.ft = [];
      for(var j = 0; j < filters[i].filtertable.length; j++) {
        filter.ft.push([filters[i].filtertable[j][0], filters[i].filtertable[j][1]]);
      }
      dataFilters.push(filter);
    }    

    data.filters = dataFilters;

    var patterns = [];
    for(var i = 0; i < music.patterns.length; i++) {
      var pattern = {};
      pattern.name = music.patterns[i].name;
      pattern.data = [];

      for(var j = 0; j < music.patterns[i].data.length; j++) {
        var row = [];
        var startPosition = parseInt(music.patterns[i].data[j].startPosition);
        if(music.patterns[i].data[j].start) {
          startPosition = j;
        }
        row[0] = startPosition;
        row[1] = parseInt(music.patterns[i].data[j].instrument);
        row[2] = parseInt(music.patterns[i].data[j].pitch);
        row[3] = parseInt(music.patterns[i].data[j].duration);
        row[4] = parseInt(music.patterns[i].data[j].effect);
        row[5] = parseInt(music.patterns[i].data[j].effectParam);
        row[6] = parseInt(music.patterns[i].data[j].effectParam2);

        for(var k = 0; k < row.length; k++) {
          if(typeof row[k] == 'undefined' || isNaN(row[k]) || row[k] == null) {
            row[k] = 0;
          }
        }
        pattern.data.push(row);

//        console.log(row);

      }

      patterns.push(pattern);
    }

    data.patterns = patterns;



    return data;
  }
}