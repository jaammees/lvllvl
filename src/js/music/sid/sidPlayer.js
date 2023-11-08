/// old version

var SidPlayer  = function() {
  this.music = null;

  // maps pattern to array of c64 patterns
  this.patternMap = [];

  // maps c64 patterns to pattern + offset into pattern
  this.c64PatternMap = [];

  // maps c64 track pattern index to track pattern index
  this.trackPositionMap = [];



  this.songData = null;
  this.testInstrumentData = null;
  this.testInstrumentIsSetup = false;

  this.playingSid = false;
  this.playingInstrument = false;
  this.requestStopInstrument = false;

  this.currentSongPointer = [0,0,0];
  this.currentPattern = [0,0,0];
  this.currentPatternPointer = [0,0,0];
  this.currentPatternRow = [0, 0, 0];
  this.currentPatternTempo = [0, 0, 0];
  this.currentPatternCounter = [0, 0, 0];
  this.playheadPosition = [0, 0, 0];

  this.playing = false;
  this.testingInstrument = false;

  var jsSID_audioCtx = null;

  var channelPointers = {
    "MT_CHNSONGPTR0": 0x146e,
    "MT_CHNPATTPTR0": 0x1471,
    "MT_CHNSONGNUM0": 0x1498,
    "MT_CHNPATTNUM0": 0x1499,
    "MT_CHNTEMPO0": 0x149a,
    "MT_CHNCOUNTER0": 0x149b,

    "MT_CHNSONGPTR1": 0x146e + 7,
    "MT_CHNPATTPTR1": 0x1471 + 7,
    "MT_CHNSONGNUM1": 0x1498 + 7,
    "MT_CHNPATTNUM1": 0x1499 + 7,
    "MT_CHNTEMPO1": 0x149a + 7,
    "MT_CHNCOUNTER1": 0x149b + 7,

    "MT_CHNSONGPTR2": 0x146e + 14,
    "MT_CHNPATTPTR2": 0x1471 + 14,
    "MT_CHNSONGNUM2": 0x1498 + 14,
    "MT_CHNPATTNUM2": 0x1499 + 14,
    "MT_CHNTEMPO2": 0x149a + 14,
    "MT_CHNCOUNTER2": 0x149b + 14
  };

  this.setPointers = function(pointers) {
    if(typeof SIDplayer == 'undefined') {
      return;
    }
    var memory = SIDplayer.getMemory();

    for(var key in pointers) {
      if(pointers.hasOwnProperty(key)) {
        var memoryLocation = channelPointers[key];
        memory[memoryLocation] = pointers[key];
      }
    }
  }

  this.calculatePointers = function() {

      var memory = SIDplayer.getMemory();
      var patternRowPositions = this.songData.patternRowPositions;
      for(var i = 0; i < 3; i++) {


        var pattern = memory[channelPointers["MT_CHNPATTNUM" + i]];

        var patternPointer = memory[channelPointers["MT_CHNPATTPTR" + i]];

        var patternRow = 0;
        if(pattern < patternRowPositions.length && patternPointer < patternRowPositions[pattern].length) {
          patternRow = patternRowPositions[pattern][patternPointer];
        }



        // position in this channel's track
        var trackPosition = memory[channelPointers["MT_CHNSONGPTR" + i]];
        this.currentSongPointer[i] =  trackPosition;

        // pattern id
        this.currentPattern[i] = pattern;

        // pointer into where in the pattern we are
        this.currentPatternPointer[i] = patternPointer;

        // pattern row
        this.currentPatternRow[i] = patternRow;

//        this.playheadPosition = 0;
        if(trackPosition > 0 && trackPosition - 1  < this.songData.trackPositions[i].length) {

          var playheadPosition = this.songData.trackPositions[i][trackPosition - 1] + patternRow;
          this.playheadPosition[i] = playheadPosition;//this.songData.trackPositions[i][trackPosition - 1] + patternRow;
        }


/*
        // tempo
        this.currentPatternTempo[i] = memory[channelPointers["MT_CHNTEMPO" + i]];

        // tick counter to next row
        this.currentPatternCounter[i] = memory[channelPointers["MT_CHNCOUNTER" + i]];

        this.currentPatternCounter[i] -= 3;
        if(this.currentPatternCounter[i] < 0) {
          this.currentPatternCounter[i] += this.currentPatternTempo[i] + 1;
        }
        this.currentPatternCounter[i] = this.currentPatternTempo[i] - this.currentPatternCounter[i];
*/

      }
  }


  this.setupAudioContext = function() {
    if(typeof jsSID_audioCtx != 'undefined' && jsSID_audioCtx != null) {
      return;
    }

    console.log('setup audio context');
   //create Web Audio context and scriptNode at jsSID object initialization (at the moment only mono output)

    var thisPlayer = this;

    jsSID_audioCtx = null;
    if ( typeof AudioContext !== 'undefined') { 
      jsSID_audioCtx = new AudioContext(); 
    } else { 
      jsSID_audioCtx = new webkitAudioContext(); 
    }

    var samplerate = jsSID_audioCtx.sampleRate; 

    var bufferLength = 4096;//2048;
    SIDplayer = new jsSID(bufferLength, 0.0005, samplerate);   
    InstrumentPlayer = new jsSID(bufferLength, 0.0005, samplerate);   

    jsSID_scriptNode = null;
    if (typeof jsSID_audioCtx.createJavaScriptNode === 'function') { 
      jsSID_scriptNode = jsSID_audioCtx.createJavaScriptNode(bufferLength,0,1); 
    } else { 
      jsSID_scriptNode = jsSID_audioCtx.createScriptProcessor(bufferLength,0,1); 
    }

    jsSID_scriptNode.onaudioprocess = function(e) { 
      //scriptNode will be replaced by AudioWorker in new browsers sooner or later
      SIDplayer.resetChannelDataPos();
      InstrumentPlayer.resetChannelDataPos();

      var outBuffer = e.outputBuffer; 
      var outData = outBuffer.getChannelData(0); 

      if(thisPlayer.playingSid) {

        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample]=SIDplayer.play(); 
        } 

        if(thisPlayer.playingInstrument) {
          for (var sample = 0; sample < outBuffer.length; sample++) { 
            outData[sample] += InstrumentPlayer.play(); 
          }
        }
      } else if(thisPlayer.playingInstrument) {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = InstrumentPlayer.play(); 
        }
      } else {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample]=0;
        }         
      }


      var memory = SIDplayer.getMemory();
      var patternRowPositions = thisPlayer.songData.patternRowPositions;
      for(var i = 0; i < 3; i++) {
        var pattern = memory[channelPointers["MT_CHNPATTNUM" + i]];

//        var patternPointer = memory[channelPointers["MT_CHNPATTPTR" + i]];
        var patternPointer = memory[channelPointers["MT_CHNPATTPTR" + i]];

        var patternRow = 0;
        if(pattern < patternRowPositions.length && patternPointer < patternRowPositions[pattern].length) {
          patternRow = patternRowPositions[pattern][patternPointer];
        }

        // position in this channel's track
        var trackPosition = memory[channelPointers["MT_CHNSONGPTR" + i]];
        thisPlayer.currentSongPointer[i] =  trackPosition;

        // pattern id
        thisPlayer.currentPattern[i] = pattern;

        // pointer into where in the pattern we are
        thisPlayer.currentPatternPointer[i] = patternPointer;

        // pattern row
        thisPlayer.currentPatternRow[i] = patternRow;

        //thisPlayer.playheadPosition = 0;
        if(trackPosition > 0 && trackPosition - 1  < thisPlayer.songData.trackPositions[i].length) {
          thisPlayer.playheadPosition[i] = thisPlayer.songData.trackPositions[i][trackPosition - 1] + patternRow;
          //console.log('here!');
        }


        // tempo
        thisPlayer.currentPatternTempo[i] = memory[channelPointers["MT_CHNTEMPO" + i]];

        // tick counter to next row
        thisPlayer.currentPatternCounter[i] = memory[channelPointers["MT_CHNCOUNTER" + i]];

        thisPlayer.currentPatternCounter[i] -= 3;
        if(thisPlayer.currentPatternCounter[i] < 0) {
          thisPlayer.currentPatternCounter[i] += thisPlayer.currentPatternTempo[i] + 1;
        }
        thisPlayer.currentPatternCounter[i] = thisPlayer.currentPatternTempo[i] - thisPlayer.currentPatternCounter[i];
        
      }
      if(thisPlayer.testingInstrument) {
        var memory = InstrumentPlayer.getMemory();
        var pattern = memory[channelPointers["MT_CHNPATTNUM0"]];
        var patternPointer = memory[channelPointers["MT_CHNPATTPTR0"]];  
        var counter =    memory[channelPointers["MT_CHNCOUNTER" + i]];
        if(patternPointer > 10  && !this.testingInstrumentCleared) {
          thisPlayer.testInstrumentClearStart();            
          this.testingInstrumentCleared = true;
        }
      }
    }
  

    if(!UI.isMobile) {
      this.tuna = new Tuna(jsSID_audioCtx);

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


      this.convolver.wetLevel = 0;

      jsSID_scriptNode.connect(this.overdrive);
      this.overdrive.connect(this.chorus);
      this.chorus.connect(this.convolver);

      //jsSID_scriptNode.connect(this.convolver);
      this.convolver.connect(jsSID_audioCtx.destination);
    } else {
      jsSID_scriptNode.connect(jsSID_audioCtx.destination);    

    }


//    jsSID_scriptNode.connect(jsSID_audioCtx.destination);    

  }


  this.setOverdrive = function(args) {
    console.log('set overdrive');
    console.log(args);
    if(args.overdriveOn) {
      this.overdrive.bypass = 0;
      this.overdrive.outputGain = args.gain;
      this.overdrive.drive =  args.drive;
      this.overdrive.curveAmount = args.curve;
    } else {
      this.overdrive.bypass = 1;
    }

  }
  this.setReverb = function(args) {
    console.log('set reverb');
    if(args.reverbOn) {
      console.log('reveb on!!');
      this.convolver.wetLevel = args.wet;
      this.convolver.dryLevel = args.dry;

      var impulse = 'impulses/impulse_rev.wav';
      switch(args.type) {
        case 'default':
          impulse = 'impulses/impulse_rev.wav';
        break;
        case 'bottleHall':
          impulse = 'impulses/Bottle Hall.wav';
        break;
        case 'deepSpace':
          impulse = 'impulses/Deep Space.wav';
        break;
        case 'dampedLargeRoom':
          impulse = 'impulses/Highly Damped Large Room.wav';
        break;
        case 'drumRoom':
          impulse = 'impulses/Nice Drum Room.wav'; 
        break;
        case 'cave':
          impulse = 'impulses/Small Prehistoric Cave.wav';
        break;
        case 'garage':
          impulse = 'impulses/Parking Garage.wav';
        break;
        case 'echoHall':
          impulse = 'impulses/Large Wide Echo Hall.wav';
        break;
        case 'church':
          impulse = 'impulses/St Nicolaes Church.wav';
        break;

        case 'rays':
          impulse = 'impulses/Rays.wav';
        break;
        case 'church':
          impulse = 'impulses/On a Star';
        break;
        case 'outside':
          impulse = 'impulses/Chateau de Logne Outside.wav';
          break;

      }

      this.convolver.impulse = impulse;
      this.convolver.buffer = impulse;

      /*
      jsSID_scriptNode.disconnect(jsSID_audioCtx.destination);
      jsSID_scriptNode.connect(this.convolver);
      this.convolver.connect(jsSID_audioCtx.destination);
*/
    } else {
//      jsSID_scriptNode.disconnect(this.convolver);


//      this.convolver.disconnect(jsSID_audioCtx.destination);

      this.convolver.wetLevel = 0;
      this.convolver.dryLevel = 1;

//      jsSID_scriptNode.connect(jsSID_audioCtx.destination);    

    }

  }

  this.setPatternRow = function(channel, patternRow) {
    var patternIndex = this.currentPattern[channel];
    var patternRowPositions = this.songData.patternRowPositions;    
    var patternPointer = 0;
    for(var i = 0; i < patternRowPositions[patternIndex].length; i++) {
      if(patternRowPositions[patternIndex][i] == patternRow) {
        patternPointer = i;
        break;
      }
    }

    var memory = SIDplayer.getMemory(); 
    memory[channelPointers["MT_CHNPATTPTR" + channel]] = patternPointer;

  }

  this.init = function(music) {
    this.music = music;
    this.songData = new SongData();
    this.songData.init();

    this.testInstrumentData = new SongData();
    this.testInstrumentData.init();


//    var sidPlayer = this;

//    var thisPlayer = this;
    if(music && music.oscilloscopes) {
//      this.setupAudioContext();
    }
  }

  this.setChannels = function(channels) {
    console.log('set channels not done yet');
  }

  this.setup = function() {
    this.testInstrumentSetup();    
  }

  this.testInstrumentSetup = function(filterData) {

    if(!jsSID_audioCtx) {
      return;
    }

    this.testInstrumentData.tracks = [[0], [1], [2]];
    this.testInstrumentData.patterns = [];
    for(var j = 0; j < 3; j++) {
      this.testInstrumentData.patterns[j] = [];
      for(var i = 0; i < 64; i++) {
        this.testInstrumentData.patterns[j].push(0xbd);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
      }
      this.testInstrumentData.patterns[j].push(0xff);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
    }


    this.testInstrumentData.instruments = [];
    for(var i = 1; i < this.music.instruments.instruments.length; i++) {
      this.testInstrumentData.instruments.push(this.music.instruments.instruments[i]);
    }

    if(typeof filterData == 'undefined') {
      this.testInstrumentData.filters = [];
      for(var i = 1; i < this.music.filters.filters.length; i++) {
        this.testInstrumentData.filters.push(this.music.filters.filters[i]);
      }
    } else {
      this.testInstrumentData.filters = [];
      this.testInstrumentData.filters.push(filterData);
      this.testInstrumentData.filters.push(filterData);

    }

    this.testInstrumentData.writeSid();
    InstrumentPlayer.setMemory(this.testInstrumentData.memory, 0, this.music.sidSpeed);

    this.testInstrumentIsSetup = true;

  },

  this.testInstrumentStart = function(pitch, duration, instrument, channel, filterData) {
    if(jsSID_audioCtx == null) {
      this.setupAudioContext();
    }

//    if(!this.testInstrumentIsSetup || filterData) {
      this.testInstrumentSetup(filterData);
//    }

    if(typeof channel == 'undefined') {
      channel = 0;
    }

    this.playingInstrument = false;

//    channel = 0;

    for(var ch = 0; ch < 3; ch++) {
      var pos = 0;
      for(var i = 0; i < 64; i++) {
        this.testInstrumentData.patterns[ch][pos++] = 0xbd;
        this.testInstrumentData.patterns[ch][pos++] = 0x00;
        this.testInstrumentData.patterns[ch][pos++] = 0x00;
        this.testInstrumentData.patterns[ch][pos++] = 0x00;
      }
    }

    this.testInstrumentData.patterns[channel][0] = pitch + 0x60;
    this.testInstrumentData.patterns[channel][1] = parseInt(instrument);
//      this.testInstrumentData.patterns[channel][2] = 10;
//      this.testInstrumentData.patterns[channel][3] = 1;
    if(filterData) {
      this.testInstrumentData.patterns[channel][2] = 10;
      this.testInstrumentData.patterns[channel][3] = 1;

    }

    if(duration) {
//      this.testInstrumentData.patterns[channel][duration * 4] = 0xbe;
    }


    var memory = InstrumentPlayer.getMemory();
    var j = channel;
    var patternData = this.testInstrumentData.packpattern2(j);
    address = this.testInstrumentData.labels['mt_patt' + j];
    for(var i = 0; i < patternData.length - 2; i++) {
      memory[address++] = patternData[i];
    }   

    memory[channelPointers["MT_CHNSONGPTR0"]] = 1;
    memory[channelPointers["MT_CHNPATTPTR0"]] = 0;
//    memory[channelPointers["MT_CHNSONGNUM0"]] = 0;
    memory[channelPointers["MT_CHNPATTNUM0"]] = 0;
    memory[channelPointers["MT_CHNCOUNTER0"]] = 0;


    memory[channelPointers["MT_CHNSONGPTR1"]] = 1;
    memory[channelPointers["MT_CHNPATTPTR1"]] = 0;
//    memory[channelPointers["MT_CHNSONGNUM1"]] = 0;
    memory[channelPointers["MT_CHNPATTNUM1"]] = 1;
    memory[channelPointers["MT_CHNCOUNTER1"]] = 0;

    memory[channelPointers["MT_CHNSONGPTR2"]] = 1;
    memory[channelPointers["MT_CHNPATTPTR2"]] = 0;
//    memory[channelPointers["MT_CHNSONGNUM2"]] = 0;
    memory[channelPointers["MT_CHNPATTNUM2"]] = 2;
    memory[channelPointers["MT_CHNCOUNTER2"]] = 0;

//    for(var i = 0; i < 296; i++) { 
    for(var i = 0; i < 8192; i++) {   
      var pc = InstrumentPlayer.doCPU();
    }



    this.testingInstrument = true;
    this.testingInstrumentCleared = false;
    this.playingInstrument = true;



//console.log(' test instrument = ' + instrument + ' channel = ' + channel);
//console.log(this.testInstrumentData.instruments);

  },

  // test an instrument by passing in the instrument's data
  this.testInstrumentSingleStart = function(pitch, duration, instrumentData, channel) {
    if(jsSID_audioCtx == null) {
      this.setupAudioContext();
    }

    // gonna wipe out all the test instrument instruments
    this.testInstrumentIsSetup = false;
    if(typeof channel == 'undefined') {
      channel = 0;
    }

    this.testInstrumentData.tracks = [[0], [1], [2]];
    this.testInstrumentData.patterns = [];
    for(var j = 0; j < 3; j++) {
      this.testInstrumentData.patterns[j] = [];
      for(var i = 0; i < 64; i++) {
        this.testInstrumentData.patterns[j].push(0xbd);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
      }
      this.testInstrumentData.patterns[j].push(0xff);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
    }

    this.testInstrumentData.patterns[channel][0] = pitch + 0x60;
    this.testInstrumentData.patterns[channel][1] = 1;

    if(duration) {
      this.testInstrumentData.patterns[channel][duration * 4] = 0xbe;
    }

    this.testInstrumentData.instruments = [];
    this.testInstrumentData.instruments[0] = instrumentData;
    this.testInstrumentData.instruments[1] = instrumentData;

    this.testInstrumentData.filters = [];
    for(var i = 1; i < this.music.filters.filters.length; i++) {
      this.testInstrumentData.filters.push(this.music.filters.filters[i]);
    }

    this.testInstrumentData.writeSid();
    this.testingInstrument = true;
    this.testingInstrumentCleared = false;
    InstrumentPlayer.setMemory(this.testInstrumentData.memory, 0, this.music.sidSpeed );
//    InstrumentPlayer.playcont();
    this.playingInstrument = true;
  }

  this.testInstrumentClearStart = function() {
    this.testInstrumentData.tracks = [[0], [1], [2]];
    this.testInstrumentData.patterns = [];
    for(var j = 0; j < 3; j++) {
      this.testInstrumentData.patterns[j] = [];
      for(var i = 0; i < 64; i++) {
        this.testInstrumentData.patterns[j].push(0xbd);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);
      }
      this.testInstrumentData.patterns[j].push(0xff);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
 
    }

    var memory = InstrumentPlayer.getMemory();
    for(var j = 0; j < 3; j++) {
      var patternData = this.testInstrumentData.packpattern2(j);
      address = this.testInstrumentData.labels['mt_patt' + j];
      for(var i = 0; i < patternData.length - 2; i++) {
        memory[address++] = patternData[i];
      }   
    } 

  }

  this.testInstrumentStop = function() {

    if(!this.testingInstrument) {
      return;
    }

    this.testInstrumentData.tracks = [[0], [1], [2]];
    this.testInstrumentData.patterns = [];
    for(var j = 0; j < 3; j++) {
      this.testInstrumentData.patterns[j] = [];
      for(var i = 0; i < 64; i++) {
        // check what 0xbe is..
        this.testInstrumentData.patterns[j].push(0xbe);
        this.testInstrumentData.patterns[j].push(0x00);
        this.testInstrumentData.patterns[j].push(0x00);

        // 11 is stop filter?
//        this.testInstrumentData.patterns[j].push(11);
        this.testInstrumentData.patterns[j].push(0x00);
      }
      this.testInstrumentData.patterns[j].push(0xff);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
      this.testInstrumentData.patterns[j].push(0x00);
 
    }

    var memory = InstrumentPlayer.getMemory();

    for(var j = 0; j < 3; j++) {
      var patternData = this.testInstrumentData.packpattern2(j);
      address = this.testInstrumentData.labels['mt_patt' + j];

//      console.log('address is ' + address);
      for(var i = 0; i < patternData.length - 2; i++) {
        memory[address++] = patternData[i];
      }    
    }
  }




  this.createSid = function() {
    this.songData.patterns = [];

    this.c64PatternMap = [];
    this.patternMap = [];
    this.trackPositionMap = [];


    // sid patterns have a length of 64, so have to split up patterns longer than that into 'c64patterns'

    for(var i = 0; i < this.music.patterns.length; i++) {

      var patternData = this.music.patterns[i].getPatternData();
      this.patternMap[i] = [];

      var offset = 0;

      // each pattern might be made up of 1 or more c64 patters (max legth 64)
      for(var j = 0; j < patternData.length; j++) {
        this.patternMap[i].push(this.songData.patterns.length);
        this.c64PatternMap.push({ "pattern": i, "offset": offset, "length": patternData[j].length });

        this.songData.patterns.push(patternData[j]);
        offset += patternData[j].length / 4;
      }
    }


    this.songData.tracks = [];
    for(var i = 0; i < this.music.tracks.length; i++) {
      this.trackPositionMap[i] = [];

      var trackPatterns = [];
      for(var j = 0; j < this.music.tracks[i].length; j++) {
        var patterns = this.patternMap[this.music.tracks[i][j]];

        for(var k = 0; k < patterns.length; k++) {
          trackPatterns.push(patterns[k]);
          this.trackPositionMap[i].push(j);
        }
      }
      this.songData.tracks.push(trackPatterns);
    }


    this.songData.instruments = [];
    for(var i = 1; i < this.music.instruments.instruments.length; i++) {
      this.songData.instruments.push(this.music.instruments.instruments[i]);
    }

    this.songData.filters = [];
    for(var i = 1; i < this.music.filters.filters.length; i++) {
      this.songData.filters.push(this.music.filters.filters[i]);
    }

    return this.songData.writeSid();
  },


  // this function is called when a change has happened that requires the whole sid in memory to be updated
  // and the playhead position needs to be restored afterwards
  this.updateSid = function(force) {

    if(typeof force == 'undefined') {
      force = false;
    }

    if(this.isPlaying() || force) {
      // save the value of playing to restore it later
      var playing = this.isPlaying();
      this.playingSid = false;

      var playheadPosition = this.music.playheadPosition;

      this.createSid();

      if(typeof SIDplayer != 'undefined') {
        SIDplayer.setMemory(this.songData.memory, 0, this.music.sidSpeed);


        for(var i = 0; i < 296; i++) { 
          var pc = SIDplayer.doCPU();
        }
      }

      this.setPlayheadPosition(playheadPosition);

      this.playingSid = playing;
    }
  }

  // called when a pattern has been updated
  this.patternUpdated = function(patternIndex, channel) {
    console.log('pattern updated!');
    if(!this.isPlaying()) {
      // not playing, no need to update pattern
      return;
    }

    if(patternIndex >= this.music.patterns.length) {
      console.log('pattern index too big ' + patternIndex);
      return;
    }

    if(!this.songData.labels) {
      console.log('no song labels');
      // havent written sid to memory yet
      return;
    }


    var patternPointer = this.currentPatternPointer[channel];
    var patternRow = this.currentPatternRow[channel];

    var patternData = this.music.patterns[patternIndex].getPatternData();
    var c64PatternIDs = this.patternMap[patternIndex];
    var memory = SIDplayer.getMemory();

    for(var i = 0; i < c64PatternIDs.length; i++) {
      var c64PatternID = c64PatternIDs[i];

//      console.log('c64 pattern id = ' + c64PatternID);

      this.songData.patterns[c64PatternID] = patternData[i];
      var packedPatternData = this.songData.packpattern2(c64PatternID);

//console.log(packedPatternData);

      var address = this.songData.labels['mt_patt' + c64PatternID];
      for(var j = 0; j < packedPatternData.length - 2; j++) {
        memory[address++] = packedPatternData[j];
      }    

    }
    this.setPatternRow(channel, patternRow);
  }

  this.getPlayheadPosition = function() {
    var position = this.playheadPosition[0] - 2; 
    if(position < 0) {
      position = 0;
    }
    return position;
  }

  this.setPlayheadPosition  = function(globalPosition) {

    // check if the sid has been created yet
    if(!this.patternMap || this.patternMap.length == 0) {
      this.createSid();
    }

    var maxPatternLength = 64;

    var patternRowPositions = this.songData.patternRowPositions;

    var pointers = {};

    // now find pattern number, pattern position for each channel
    for(var ch = 0; ch < 3; ch++) {
      if(ch < this.music.tracks.length) {
        var chPatternNumber = 0;
        var chPatternPosition = 0;
        var position = 0;
        for(var i = 0; i < this.music.tracks[ch].length; i++) {
          chPatternNumber = i;        
          position += this.music.patterns[this.music.tracks[ch][i]].duration;

          if(position > globalPosition) {
            // gone too far
            chPatternPosition = globalPosition - (position - this.music.patterns[this.music.tracks[ch][i]].duration); 
            break;
          } 
        }

        // get the pattern id for the channel
        var patternID = this.music.tracks[ch][chPatternNumber];

        this.music.currentPattern[ch] = chPatternNumber;

        var c64PatternOffset = Math.floor(chPatternPosition / maxPatternLength);
        var c64PatternID = this.patternMap[patternID][c64PatternOffset];

        var c64PatternNumber = 0;
        for(var i = 0; i < this.trackPositionMap[ch].length; i++) {
          if(this.trackPositionMap[ch][i] == chPatternNumber) {
            c64PatternNumber = i + c64PatternOffset;
            break;
          }
        }
        c64PatternNumber++;

        c64PatternPosition = chPatternPosition - c64PatternOffset * maxPatternLength;


        var c64PatternPointer = 0;
        // get the pattern pointer
        for(var i = 0; i < patternRowPositions[c64PatternID].length; i++) {
          var row = patternRowPositions[c64PatternID][i];      
          if(row == c64PatternPosition ) {
            c64PatternPointer = i;
            break;
          }
        }

        pointers["MT_CHNSONGPTR" + ch] = c64PatternNumber;
        pointers["MT_CHNPATTPTR" + ch] = c64PatternPointer;// + 1;
        pointers["MT_CHNPATTNUM" + ch] = c64PatternID;
        pointers["MT_CHNTEMPO" + ch] = parseInt($('#sidTempo').val() - 1);
        pointers["MT_CHNCOUNTER" + ch] = 0;
      }
    }
    this.setPointers(pointers);
  }


  this.downloadWAV = function(filename) {

    this.setupAudioContext();


    var channel1 = $('#exportWAVChannel1').is(':checked');
    var channel2 = $('#exportWAVChannel2').is(':checked');
    var channel3 = $('#exportWAVChannel3').is(':checked');


    var speed = $('input[name=exportWAVSpeed]:checked').val();

    if(speed == 'custom') {
      var ticksPerNote = 6;
      var notesPerBeat = 4;
      var bpm = $('#exportWAVBPM').val();

      bpm = parseInt(bpm);
      if(isNaN(bpm)) {
        return;
      }

      var frameRate = 50;

      speed = (bpm * ticksPerNote * notesPerBeat) / (frameRate * 60);
    }

    // need to add on an end pattern
    var pattern = new Pattern();
    pattern.init('End Pattern', 16);
    var endPatternIndex = this.music.patterns.length;

    this.music.patterns.push(pattern);

    this.music.tracks[0].push(endPatternIndex);
    this.music.tracks[1].push(endPatternIndex);
    this.music.tracks[2].push(endPatternIndex);

    this.createSid();
    SIDplayer.setMemory(this.songData.memory, 0, speed);
    SIDplayer.resetChannelDataPos();    
    SIDplayer.setChannelOn(channel1, channel2, channel3);

    var i=0, vol=0.1,
    sampleRate = SIDplayer.getSampleRate(), 
    wav = new Wav({sampleRate: sampleRate, channels: 1});
//        buffer = new Float32Array(sampleRate * 40);

    var lastPattern = -1;
    var data = [];

    var started = false;





    while(i<sampleRate * 600){
      var value = SIDplayer.play();

      //7700
      if(!started && (value >= 0.006 || value <= -0.006 || i > 9500) ) {
        console.log('starting at ' + i + '!!!!!!!!!!!!!!!!!!!!!!!');;
        started = true;
      }

      if(started) {
        data.push(value);
      }

      i++;


      // check if reached the end pattern, if so break out of the loop
      this.calculatePointers();
      var c64Pattern = this.currentPattern[0];
      if(c64Pattern < this.c64PatternMap.length) {
        var currentPattern = this.c64PatternMap[c64Pattern].pattern;
        if(lastPattern != currentPattern) {
          if(currentPattern == endPatternIndex) {
            console.log('reached end!!!');
            break;
          }
//          console.log('pattern = ' + currentPattern);
          lastPattern = currentPattern;

        }
      }

    }


    // remove the end pattern
    this.music.tracks[0].splice(this.music.tracks[0].length - 1, 1);
    this.music.tracks[1].splice(this.music.tracks[1].length - 1, 1);
    this.music.tracks[2].splice(this.music.tracks[2].length - 1, 1);

    this.music.patterns.splice(this.music.patterns.length - 1, 1);


    var buffer = new Float32Array(data.length);
    for(var i = 0; i < buffer.length; i++) {
      buffer[i] = data[i];
    }
    wav.setBuffer(buffer);

    if(filename.indexOf('.wav') == -1) {
      filename += ".wav";
    }

    wav.download(filename);

    var channel1 = $('#channel1').is(':checked');
    var channel2 = $('#channel2').is(':checked');
    var channel3 = $('#channel3').is(':checked');




    SIDplayer.setChannelOn(channel1, channel2, channel3);

    SIDplayer.resetChannelDataPos();
    this.music.playheadPosition = 0;

    this.updateSid(true);
  }

  this.download = function(filename, format) {
    switch(format) {
      case 'wav':
        return this.downloadWAV(filename);
        break;
      case 'sid':
        return this.downloadSID(filename);
        break;
      case 'prg':
        return this.downloadPRG(filename);
        break;
      case 'goat':
        return this.downloadGoat(filename);
        break;

    }
  }

  this.isPlaying = function() {
    return this.playingSid;
  }

  this.stop = function() {
//    SIDplayer.stop();
    this.playingSid = false;
  }

  this.play = function() {
    if(jsSID_audioCtx == null) {
      this.setupAudioContext();
    }

    this.playingSid = true;
  }

}


SidPlayer.CMD_DONOTHING       = 0;
SidPlayer.CMD_PORTAUP         = 1;
SidPlayer.CMD_PORTADOWN       = 2;
SidPlayer.CMD_TONEPORTA       = 3;
SidPlayer.CMD_VIBRATO         = 4;
SidPlayer.CMD_SETAD           = 5;
SidPlayer.CMD_SETSR           = 6;
SidPlayer.CMD_SETWAVE         = 7;
SidPlayer.CMD_SETWAVEPTR      = 8;
SidPlayer.CMD_SETPULSEPTR     = 9;
SidPlayer.CMD_SETFILTERPTR    = 10;
SidPlayer.CMD_SETFILTERCTRL   = 11;
SidPlayer.CMD_SETFILTERCUTOFF = 12;
SidPlayer.CMD_SETMASTERVOL    = 13;
SidPlayer.CMD_FUNKTEMPO       = 14;
SidPlayer.CMD_SETTEMPO        = 15;

SidPlayer.CMD_STOPFILTER      = 16;
SidPlayer.CMD_LEGATO          = 17;

SidPlayer.WTBL = 0;
SidPlayer.PTBL = 1;
SidPlayer.FTBL = 2;
SidPlayer.STBL = 3;

SidPlayer.MAX_FILT = 64;
SidPlayer.MAX_STR = 32;
SidPlayer.MAX_INSTR = 64;
SidPlayer.MAX_CHN = 3;
SidPlayer.MAX_PATT = 208;
SidPlayer.MAX_TABLES = 4;
SidPlayer.MAX_TABLELEN = 255;
SidPlayer.MAX_INSTRNAMELEN = 16;
SidPlayer.MAX_PATTROWS = 128;
SidPlayer.MAX_SONGLEN = 254;
SidPlayer.MAX_SONGS = 32;
SidPlayer.MAX_NOTES = 96;

SidPlayer.REPEAT = 0xd0;
SidPlayer.TRANSDOWN = 0xe0;
SidPlayer.TRANSUP = 0xf0;
SidPlayer.LOOPSONG = 0xff;

SidPlayer.ENDPATT       = 0xff;
SidPlayer.INSTRCHG      = 0x00;
SidPlayer.FX            = 0x40;
SidPlayer.FXONLY        = 0x50;
SidPlayer.FIRSTNOTE     = 0x60;
SidPlayer.LASTNOTE      = 0xbc;
SidPlayer.REST          = 0xbd;
SidPlayer.KEYOFF        = 0xbe;
SidPlayer.KEYON         = 0xbf;
SidPlayer.OLDKEYOFF     = 0x5e;
SidPlayer.OLDREST       = 0x5f;

SidPlayer.WAVEDELAY     = 0x1;
SidPlayer.WAVELASTDELAY = 0xf;
SidPlayer.WAVESILENT    = 0xe0;
SidPlayer.WAVELASTSILENT = 0xef;
SidPlayer.WAVECMD       = 0xf0;
SidPlayer.WAVELASTCMD   = 0xfe;


SidPlayer.freqtbllo = [
  0x17,0x27,0x39,0x4b,0x5f,0x74,0x8a,0xa1,0xba,0xd4,0xf0,0x0e,
  0x2d,0x4e,0x71,0x96,0xbe,0xe8,0x14,0x43,0x74,0xa9,0xe1,0x1c,
  0x5a,0x9c,0xe2,0x2d,0x7c,0xcf,0x28,0x85,0xe8,0x52,0xc1,0x37,
  0xb4,0x39,0xc5,0x5a,0xf7,0x9e,0x4f,0x0a,0xd1,0xa3,0x82,0x6e,
  0x68,0x71,0x8a,0xb3,0xee,0x3c,0x9e,0x15,0xa2,0x46,0x04,0xdc,
  0xd0,0xe2,0x14,0x67,0xdd,0x79,0x3c,0x29,0x44,0x8d,0x08,0xb8,
  0xa1,0xc5,0x28,0xcd,0xba,0xf1,0x78,0x53,0x87,0x1a,0x10,0x71,
  0x42,0x89,0x4f,0x9b,0x74,0xe2,0xf0,0xa6,0x0e,0x33,0x20,0xff,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00 ];

SidPlayer.freqtblhi = [
  0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x02,
  0x02,0x02,0x02,0x02,0x02,0x02,0x03,0x03,0x03,0x03,0x03,0x04,
  0x04,0x04,0x04,0x05,0x05,0x05,0x06,0x06,0x06,0x07,0x07,0x08,
  0x08,0x09,0x09,0x0a,0x0a,0x0b,0x0c,0x0d,0x0d,0x0e,0x0f,0x10,
  0x11,0x12,0x13,0x14,0x15,0x17,0x18,0x1a,0x1b,0x1d,0x1f,0x20,
  0x22,0x24,0x27,0x29,0x2b,0x2e,0x31,0x34,0x37,0x3a,0x3e,0x41,
  0x45,0x49,0x4e,0x52,0x57,0x5c,0x62,0x68,0x6e,0x75,0x7c,0x83,
  0x8b,0x93,0x9c,0xa5,0xaf,0xb9,0xc4,0xd0,0xdd,0xea,0xf8,0xff,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];


