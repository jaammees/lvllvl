var audioContext = null;
var scriptNode = null;

var SidPlayer2 = function() {
  this.music = null;

  this.musicPlayer = null;
  this.instrumentPlayer = null;
  this.bufferLength = 2048 * 2;//4096;

  this.exportGoatTracker = null;
  this.exportSID = null;
}


SidPlayer2.prototype = {

  init: function(music) {
    this.music = music;

    this.musicPlayer = new SidPatternPlayer();
    this.musicPlayer.init(music);

    this.instrumentPlayer = new SidPatternPlayer();
    this.instrumentPlayer.init(music);

    this.songData = new SongData();
    this.songData.init();

  },

  setupAudioContext: function() {
    if(audioContext != null) {
      return;
    }

    audioContext = null;
    if ( typeof AudioContext !== 'undefined') { 
      audioContext = new AudioContext(); 
    } else { 
      audioContext = new webkitAudioContext(); 
    }

    this.musicPlayer.setup(audioContext.sampleRate, this.bufferLength);
    this.instrumentPlayer.setup(audioContext.sampleRate, this.bufferLength);

    scriptNode = null;

    // createJavaScriptNode is obsolete, renamed to createScriptProcessor
    // createScriptProcessor is to be replaced by AudioWorklet
    // var scriptProcessor = audioCtx.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels);
    if (typeof audioContext.createJavaScriptNode === 'function') { 
      scriptNode = audioContext.createJavaScriptNode(this.bufferLength,0,1); 
    } else { 
      scriptNode = audioContext.createScriptProcessor(this.bufferLength,0,1); 
    }

    var _this = this;
    scriptNode.onaudioprocess = function(e) { 
      var outBuffer = e.outputBuffer; 
      var outData = outBuffer.getChannelData(0); 

      _this.musicPlayer.sid.resetChannelDataPos();
      _this.instrumentPlayer.sid.resetChannelDataPos();


      if(_this.musicPlayer.playing && !_this.instrumentPlayer.playing) {
        var sample = 0;
        for (sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = _this.musicPlayer.nextSample();
        }                 
      } else if( (!_this.musicPlayer.playing) && _this.instrumentPlayer.playing) {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = _this.instrumentPlayer.nextSample();
        }                 
      } else if(_this.musicPlayer.playing && _this.instrumentPlayer.playing) {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = _this.musicPlayer.nextSample() + _this.instrumentPlayer.nextSample();
        }                 
      } else {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = 0;
        }
      }

      /*
      outData[]
      if(_this.playing) {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = _this.nextSample();//Math.sin(sample / 2);// SIDplayer.play(); 
        }         
      } else {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = 0;
        }         
      }
      */
    }

    if(!UI.isMobile) {
      this.tuna = new Tuna(audioContext);

      this.convolver = new this.tuna.Convolver({
          highCut: 22050,                         //20 to 22050
          lowCut: 20,                             //20 to 22050
          dryLevel: 0.8,                            //0 to 1+
          wetLevel: 0.7,                            //0 to 1+
          level: 1,                               //0 to 1+, adjusts total output of both wet and dry
          impulse: "impulses/impulse_rev.wav",    //the path to your impulse response
          bypass: 0
      });  

      this.chorus = new this.tuna.Chorus({
          rate: 1.5,         //0.01 to 8+
          feedback: 0.2,     //0 to 1+
          delay: 0.0045,     //0 to 1
          bypass: 1          //the value 1 starts the effect as bypassed, 0 or 1
      });


      this.overdrive = new this.tuna.Overdrive({
          outputGain: 0.1,         //0 to 1+
          drive: 0.7,              //0 to 1
          curveAmount: 1,          //0 to 1
          algorithmIndex: 0,       //0 to 5, selects one of our drive algorithms
          bypass: 1
      });


      this.filter = new this.tuna.Filter({
        frequency: 440, // 20 to 22050
        Q: 1, // 0.001 to 100
        gain: 0, // -40 to 40
        filterType: "lowpass", //lowpass, highpass, bandpass, lowshelf, highshelf, peaking
        bypass: 0
      });

      this.cabinet = new this.tuna.Cabinet({
        makeupGain: 1,
        impulsePath: "impulses/impulse_guitar.wav", // path to speaker impulse
        bypass: 0
      });

      this.moog = new this.tuna.MoogFilter({
        cutoff: 0.765, // 0 to 1
        resonance: 0.5, // 0 to 4

        /*
        cutoff: 0.065, // 0 to 1
        resonance: 3.5, // 0 to 4
        */
        bufferSize: 4096 // 256 to 16384
      });

      this.convolver.wetLevel = 0;

/*
      scriptNode.connect(this.overdrive);
      this.overdrive.connect(this.chorus);
      this.chorus.connect(this.convolver);

      //jsSID_scriptNode.connect(this.convolver);
      this.convolver.connect(audioContext.destination);
*/
      scriptNode.connect(this.moog);
      this.moog.connect(audioContext.destination);      
    } else {
      scriptNode.connect(audioContext.destination);    
    }
  },

  setPlayheadPosition: function(position) {
    return this.musicPlayer.setPlayheadPosition(position);
  },

  getPlayheadPosition: function() {
    return this.musicPlayer.getPlayheadPosition();
  },


  setMute: function(channel, mute) {
    this.musicPlayer.setMute(channel, mute);
  },

  getMute: function(channel) {
    return this.musicPlayer.getMute(channel);
  },

  getPlayheadPositionFraction: function() {
    var tick = this.musicPlayer.getTick();
    var tempo = this.musicPlayer.getTempo();

    return tick / (tempo + 1);

  },

  getInstrumentChannelData: function() {
    return this.instrumentPlayer.getChannelData();
  },
  getChannelData: function() {

    return this.musicPlayer.getChannelData();
  },

  isPlayingInstrument: function() {
    return this.instrumentPlayer.isPlaying();
  },
  
  isPlaying: function() {
    return this.musicPlayer.isPlaying();
  },

  play: function(startAtPosition) {
    this.musicPlayer.play(startAtPosition);
  },

  stop: function() {
    this.musicPlayer.stop();
  },

  playTestInstrument: function(pitch, instrument, ch) {
    this.setupAudioContext();
    this.instrumentPlayer.playTestInstrument(pitch, instrument, ch);
  },

  stopTestInstrument: function() {
    this.instrumentPlayer.stopTestInstrument();
  },

  getBlankPatternData: function(duration) {

    if(duration == 0) {
      return;
    }
    var patternData = [];

    for(var i = 0; i < duration; i++) {
      patternData.push(0xbe);
      patternData.push(0);
      patternData.push(0);
      patternData.push(0);

    }

    return patternData;
  },

  getC64PatternData: function(patternId) {
    this.maxc64PatternLength = 64;

    //var patternData = this.music.patterns.getPatternData(patternId);
    var patternData = [];

    var notes = this.music.patterns.getNotes(patternId);
    var patternDuration = this.music.patterns.getDuration(patternId);

    // initialise pattern data
    var patternData = [];
    for(var i = 0; i < patternDuration; i++) {
      patternData.push({
        instrument: 0,
        start: false,
        duration: 0,
        pitch: 0,
        effect: 0,
        effectParam: 0,
        effectParam2: 0        
      });
    }

    // fill in pattern data with the instruments
    for(var i = 0; i < notes.length; i++) {
      var note = notes[i];
      for(var j = note.pos; j < note.pos+note.dur; j++) {

        if(j < patternData.length) {
          patternData[j].instrument = note.ins;
          patternData[j].start = j == note.pos;
          patternData[j].duration = note.dur;
          patternData[j].pitch = note.pit;
        }
      }
    }

    var effects = this.music.patterns.getParams(patternId, "effects");

    for(var i = 0; i < effects.length; i++) {
      var position = effects[i].pos;
      if(position < patternData.length) {
        patternData[position].effect = effects[i].values.effect;
        patternData[position].effectParam = effects[i].values.value1;
        patternData[position].effectParam2 = effects[i].values.value2;
      }

    }

    var c64PatternData = [];
    var c64Patterns = [];

    var lastInstrument = -1;
    var currentInstrument = 0;
    var i = 0;

    var startPosition = 0;

    while(i < patternData.length) {

      var instrument = parseInt(patternData[i].instrument);

      var pitch = 0;
      var duration = 0;   
      if(instrument == 0) {
        // silence
        var totalDuration = 0;
        var first = true;
        lastInstrument = 0;

        while(i < patternData.length && patternData[i].instrument == 0) {
          var effect = 0;
          var effectParam = 0;
          if(patternData[i].effect) {
            effect = parseInt(patternData[i].effect);
            effectParam = parseInt(patternData[i].effectParam);
            effectParam2 = parseInt(patternData[i].effectParam2);

            if(effect == 16) {
              // cant have legato here
              effect = 11;
              effectParam = 0;
              effectParam2 = 0;
            }

            if(effect == 17) {
              // cant have legato here
              effect = 0;
            }
          }

          i++;
          totalDuration++;

          if(first) {
            c64PatternData.push(0xbe);
          } else {
            c64PatternData.push(0xbd);
          }
          c64PatternData.push(0x00);

          c64PatternData.push(effect);
          c64PatternData.push(effectParam);

          if(c64PatternData.length >= this.maxc64PatternLength * 4) {
            // length has gone over the max allowed, split this up into multiple patterns
//            patternData.push(0xff);
//            patternData.push(0x00);
//            patternData.push(0x00);
//            patternData.push(0x00);    
            c64Patterns.push(c64PatternData);
            c64PatternData = [];
          }


        }


      } else if(patternData[i].start) {

        // note start
        var totalDuration = patternData[i].duration;

        var effect = 0;
        var effectParam = 0;
        var effectParam2 = 0;
        pitch = patternData[i].pitch;

        if(patternData[i].effect) {
          effect = parseInt(patternData[i].effect);
          effectParam = parseInt(patternData[i].effectParam);
          effectParam2 = parseInt(patternData[i].effectParam2);

/*
          if(effect == 4) {  // vibrato, need to stick these in speed table
            effectParam = effectParam2 + (effectParam << 8);
          }
          if(effect == 14) {  // funktempo, need to stick these in speed table
            effectParam = effectParam2 + (effectParam << 8);
          }
*/          

          if(effect == 16) {
            // stop filter
            effect = 11;
            effectParam = 0;
            effectParam2 = 0;
          }


          if(effect == 17) {
            if(lastInstrument == instrument) {
              // can only do legato if last instrument was same
              effect = 3;
              effectParam = 0;
              effectParam2 = pitch;
            } else {
              effect = 0;
            }
          }
        }

        i++;

//        i += totalDuration;
/*
                1st byte: Notenumber
                          Values $60-$BC are the notes C-0 - G#7
                          Value $BD is rest
                          Value $BE is keyoff
                          Value $BF is keyon
                          Value $FF is pattern end
*/
        if(effect == 3) {
          //portamento to effect
          c64PatternData.push(effectParam2 + 0x60);
        } else {
          c64PatternData.push(pitch + 0x60);
        }
        c64PatternData.push(instrument);
        c64PatternData.push(effect);
        c64PatternData.push(effectParam);

//        patternData.push(0x00);
//        patternData.push(0x00);
        totalDuration--;

        if(c64PatternData.length >= this.maxc64PatternLength * 4) {
          // length has gone over the max allowed, split this up into multiple patterns
/*
          patternData.push(0xff);
          patternData.push(0x00);
          patternData.push(0x00);
          patternData.push(0x00);    
*/          
          c64Patterns.push(c64PatternData);
          c64PatternData = [];
        }


        lastInstrument = instrument;

        while(totalDuration >0){

          var effect = 0;
          var effectParam = 0;
          var effectParam2 = 0;
          if(patternData[i].effect) {
            effect = parseInt(patternData[i].effect);
            effectParam = parseInt(patternData[i].effectParam);
            effectParam2 = parseInt(patternData[i].effectParam2);

/*
            if(effect == 4) {  // vibrato, need to stick these in speed table
              effectParam = effectParam2 + (effectParam << 8);
            }

            if(effect == 14) {  // funktempo, need to stick these in speed table
              effectParam = effectParam2 + (effectParam << 8);
            }
*/
            if(effect == 16) {
              // stop filter
              effect = 11;
              effectParam = 0;
              effectParam2 = 0;
            }

            if(effect == 17) {
              // cant have legato here
              effect = 0;
            }
          }

          if(effect == 3) {
            //portamento to effect
            c64PatternData.push(effectParam2 + 0x60);
          } else {
            c64PatternData.push(0xbd);
          }
          c64PatternData.push(0x00);
          c64PatternData.push(effect);
          c64PatternData.push(effectParam);
//          patternData.push(0x00);
//          patternData.push(0x00);
          totalDuration--;          
          i++;

          if(c64PatternData.length >= this.maxc64PatternLength * 4) {
            // length has gone over the max allowed, split this up into multiple patterns
/*            
            patternData.push(0xff);
            patternData.push(0x00);
            patternData.push(0x00);
            patternData.push(0x00);    
*/            
            c64Patterns.push(c64PatternData);
            c64PatternData = [];
          }


        }

      } else {
        c64PatternData.push(0xbd);
        c64PatternData.push(0x00);
        c64PatternData.push(0x00);
        c64PatternData.push(0x00);

        i++;
        totalDuration++;

      }

         
    }

    if(c64PatternData.length > 0) {
/*      
      patternData.push(0xff);
      patternData.push(0x00);
      patternData.push(0x00);
      patternData.push(0x00);    
*/      
      c64Patterns.push(c64PatternData);
    }
    return c64Patterns;
  },

  exportAsType: function(type) {
    switch(type) {
      case 'goattracker':
//        this.createSid();
//        this.songData.downloadGoat('untitled', 'title', 'author', 'released');
        if(this.exportGoatTracker == null) {
          this.exportGoatTracker = new ExportGoatTracker();
          this.exportGoatTracker.init(this);
        }

        this.exportGoatTracker.start();

      break;
      case 'prg':
        if(this.exportPRG == null) {
          this.exportPRG = new ExportSIDPRG();
          this.exportPRG.init(this);
        }

        this.exportPRG.start();
      break;
      case 'sid':

        if(this.exportSID == null) {
          this.exportSID = new ExportSID();
          this.exportSID.init(this);
        }

        this.exportSID.start();
  
//        this.createSid();
//        this.songData.downloadSID('untitled', 'title', 'author', 'released');
      break;
      case 'wav':
      break;
    }

  },

  createSid: function() {
    this.songData.patterns = [];

    this.c64PatternMap = [];
    this.patternMap = [];

    var tracks = this.music.doc.data.tracks;

    // get the length of the song (max track length)
    var songLength = 0;
    for(var i = 0; i < tracks.length; i++) {
      var trackId = tracks[i].trackId;
      var trackLength = this.music.tracks.getLength(trackId);
      if(trackLength > songLength) {
        songLength = trackLength;
      }
    }

    var patternCount = this.music.patterns.getPatternCount();
    for(var i = 0; i < patternCount; i++) {
      var patternId = this.music.patterns.getPatternId(i);      
      var patternDuration = this.music.patterns.getDuration(patternId);

      // split the pattern up into patterns of max length 64
      // convert patterns into an array of bytes
      var patternData = this.getC64PatternData(patternId);

      this.patternMap[i] = [];

      var offset = 0;

      // each pattern might be made up of 1 or more c64 patters (max length 64)
      for(var j = 0; j < patternData.length; j++) {
        this.patternMap[i].push(this.songData.patterns.length);
        this.c64PatternMap.push({ "pattern": i, "offset": offset, "length": patternData[j].length });

        this.songData.patterns.push(patternData[j]);
        offset += patternData[j].length / 4;
      }
    }

    var blankPatternMap = {};

    // make empty patterns to space out the tracks
    for(var i = 0; i < this.music.doc.data.tracks.length; i++) {
      var patternInstances = this.music.doc.data.tracks[i].patternInstances;

      var lastPosition = 0;
      for(var j = 0; j < patternInstances.length; j++) {
        var patternInstanceStart = patternInstances[j].position;
        var patternId = patternInstances[j].patternId;
        var patternInstanceEnd = patternInstanceStart + this.music.patterns.getDuration(patternId) ;

        var gap = patternInstanceStart - lastPosition;
        lastPosition = patternInstanceEnd;

        if(gap > 64) {
          var extraGap = gap % 64;

          if(typeof blankPatternMap[64] == 'undefined') {
            var blankData = this.getBlankPatternData(64);
            var blankIndex = this.songData.patterns.length;
            this.songData.patterns.push(blankData);

            blankPatternMap[64] = blankIndex;
          }

          if(extraGap > 0 && typeof blankPatternMap[extraGap] == 'undefined') {
            var blankData = this.getBlankPatternData(extraGap);
            var blankIndex = this.songData.patterns.length;
            this.songData.patterns.push(blankData);

            blankPatternMap[extraGap] = blankIndex;
          }
        } else {
          if(gap != 0 && typeof blankPatternMap[gap] == 'undefined') {
            var blankData = this.getBlankPatternData(gap);
            var blankIndex = this.songData.patterns.length;
            this.songData.patterns.push(blankData);

            blankPatternMap[gap] = blankIndex;
          }
        }
      }


      var gapAtEnd = songLength - lastPosition;
      if(gapAtEnd > 64) {
        var extraGap = gapAtEnd % 64;

        if(typeof blankPatternMap[64] == 'undefined') {
          var blankData = this.getBlankPatternData(64);
          var blankIndex = this.songData.patterns.length;
          this.songData.patterns.push(blankData);

          blankPatternMap[64] = blankIndex;
        }

        if(extraGap > 0 && typeof blankPatternMap[extraGap] == 'undefined') {
          var blankData = this.getBlankPatternData(extraGap);
          var blankIndex = this.songData.patterns.length;
          this.songData.patterns.push(blankData);

          blankPatternMap[extraGap] = blankIndex;
        }
      } else {
        if(gapAtEnd != 0 && typeof blankPatternMap[gapAtEnd] == 'undefined') {
          var blankData = this.getBlankPatternData(gapAtEnd);
          var blankIndex = this.songData.patterns.length;
          this.songData.patterns.push(blankData);

          blankPatternMap[gapAtEnd] = blankIndex;
        }

      }
    }



    this.songData.tracks = [];
    for(var i = 0; i < this.music.doc.data.tracks.length; i++) {
      var patternInstances = this.music.doc.data.tracks[i].patternInstances;

//      this.trackPositionMap[i] = [];

      var trackPatterns = [];

      var lastPosition = 0;
      for(var j = 0; j < patternInstances.length; j++) {
        var patternInstanceStart = patternInstances[j].position;
        var patternId = patternInstances[j].patternId;
        var patternInstanceEnd = patternInstanceStart + this.music.patterns.getDuration(patternId) ;

        var gap = patternInstanceStart - lastPosition;
        lastPosition = patternInstanceEnd;

        var blank64Count = Math.floor(gap / 64);
        var blankRemaining = gap % 64;
        for(var k = 0; k < blank64Count; k++) {
          var blankIndex = blankPatternMap[64];
          trackPatterns.push(blankIndex);
        }

        if(blankRemaining > 0) {
          var blankIndex = blankPatternMap[blankRemaining];
          trackPatterns.push(blankIndex);
        }

        var patterns = this.patternMap[patternInstances[j].patternId];

        for(var k = 0; k < patterns.length; k++) {
          trackPatterns.push(patterns[k]);
//          this.trackPositionMap[i].push(j);
        }
      }

      var gapAtEnd = songLength - lastPosition;
      var blank64Count = Math.floor(gapAtEnd / 64);
      var blankRemaining = gapAtEnd % 64;
      for(var k = 0; k < blank64Count; k++) {
        var blankIndex = blankPatternMap[64];
        trackPatterns.push(blankIndex);
      }

      if(blankRemaining > 0) {
        var blankIndex = blankPatternMap[blankRemaining];
        trackPatterns.push(blankIndex);
      }

      
      this.songData.tracks.push(trackPatterns);
    }


    this.songData.instruments = [];
    for(var i = 1; i < this.music.doc.data.instruments.length; i++) {
      this.songData.instruments.push(this.music.instruments.getInstrument(i));
    }

    this.songData.filters = [];
    for(var i = 1; i < this.music.doc.data.filters.length; i++) {
      this.songData.filters.push(this.music.doc.data.filters[i]);
    }

    return this.songData.writeSid();


  }
}
