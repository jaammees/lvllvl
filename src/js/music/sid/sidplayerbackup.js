var audioContext = null;
var scriptNode = null;

var SidPlayer2 = function() {
  this.music = null;
  this.playing = false;


  this.channels = [];
  this.channelCount = 3;

  this.filterType = 0;
  this.filterCommand = 0;
  this.filtertablePosition = 0;

  this.funktable = [6, 6];

  this.bufferLength = 4096;
  this.sampleRate = 0;

  this.sid = null;
  this.sidMemory = null;


  this.framecnt = 0;
  this.finished = 1;
  this.adparam = 0x0f00;

  this.playheadPosition = 0;

  this.testInstrument = null;
}


SidPlayer2.prototype = {

  init: function(music) {
    this.music = music;
    this.initChannels();
  },

  initChannels: function() {
    this.channels = [];

    for(var i = 0; i < this.channelCount; i++) {
      var channel = {};
      channel.instrument = 1;
      this.channels.push(channel);
    }
  },

  setup: function(sampleRate) {
    this.sampleRate = sampleRate;
    var factor = 1;
    var speed = 1;

    // CIA Timer clock rate 0.985248MHz (PAL) 

    this.C64_PAL_CPUCLK = 985248 * factor; //Hz
    this.PAL_FRAMERATE = 50 * factor; //NTSC_FRAMERATE = 60;
    this.clk_ratio = this.C64_PAL_CPUCLK / this.sampleRate;

    this.sid = new jsSID2(this.bufferLength, 0.0005, this.sampleRate);
    this.sidMemory = this.sid.getMemory();

    this.frame_sampleperiod = this.sampleRate / (this.PAL_FRAMERATE * speed); //Vsync timing

    this.SIDAddr = 0xD400;
  },

  nextSample: function() {
    // volume

    this.framecnt--; 
    if(this.framecnt <= 0) { 
      this.framecnt = this.frame_sampleperiod; 
      this.finished = 0; 
    }

    if(this.finished == 0) {
      // tick..
      this.playRoutine();
      this.finished = 1;
    }
    return this.sid.play();
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

    this.setup(audioContext.sampleRate);

    scriptNode = null;
    if (typeof audioContext.createJavaScriptNode === 'function') { 
      scriptNode = audioContext.createJavaScriptNode(this.bufferLength,0,1); 
    } else { 
      scriptNode = audioContext.createScriptProcessor(this.bufferLength,0,1); 
    }

    var _this = this;
    scriptNode.onaudioprocess = function(e) { 
      var outBuffer = e.outputBuffer; 
      var outData = outBuffer.getChannelData(0); 

      _this.sid.resetChannelDataPos();
      if(_this.playing) {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = _this.nextSample();//Math.sin(sample / 2);// SIDplayer.play(); 
        }         
      } else {
        for (var sample = 0; sample < outBuffer.length; sample++) { 
          outData[sample] = 0;
        }         
      }
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


      this.convolver.wetLevel = 0;

      scriptNode.connect(this.overdrive);
      this.overdrive.connect(this.chorus);
      this.chorus.connect(this.convolver);

      //jsSID_scriptNode.connect(this.convolver);
      this.convolver.connect(audioContext.destination);
    } else {
      scriptNode.connect(audioContext.destination);    
    }
  },

  getPlayheadPosition: function() {
    var position =  this.playheadPosition - 2;
    if(position < 0) {
      return 0;
    }

    return position;
  },


  getChannelData: function() {
    return this.sid.getData();
  },
  isPlaying: function() {
    return this.playing;
  },
  play: function() {

    this.startSong();
    this.playing = !this.playing;
  },


  startSong: function() {
    var multiplier = 1;

    this.playheadPosition = 0;
    this.sid.initSID();
    for(var i = 0; i < this.channelCount; i++) {
      this.sidMemory[this.SIDAddr + 0x0 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x1 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x2 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x3 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x4 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x5 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x6 + 7*i] = 0;


      this.channels[i].songptr = 0;

      this.channels[i].trackPosition = 0;
      this.channels[i].patternPosition = 0;

      this.channels[i].newNote = 0;
      this.channels[i].noteStart = false;
      this.channels[i].gateTimer = this.music.instruments.instruments[1].gateTimer & 0x3f;

      this.channels[i].command = SidPlayer.CMD_DONOTHING;
      this.channels[i].commandData = 0;
      this.channels[i].newCommand = SidPlayer.CMD_DONOTHING;
      this.channels[i].newCommandData = 0;

      this.channels[i].instrument = 0;
      this.channels[i].instrumentDuration = 0;

      this.channels[i].advance = 1;
      this.channels[i].wave = 0;
      this.channels[i].waveTime = 0;
      this.channels[i].wavetablePosition = 0;

      this.channels[i].pulse = 0;
      this.channels[i].pulseTime = 0;
      this.channels[i].pulsetablePosition = 0;


      this.channels[i].speedtablePosition = 0;


      this.channels[i].vibTime = 0;
      this.channels[i].vibDelay = 0;
      this.channels[i].vibSpeed = 0;
      this.channels[i].vibDepth = 0;

//      this.channels[i].ptr[WTBL] = 0;
      this.channels[i].repeat = 0;

      this.channels[i].tempo = this.music.getTempo() - 1;
      this.channels[i].tick = this.channels[i].tempo - 1;

      this.channels[i].finished = false;


    }

    this.filterCutoff = 0;
    this.filterControl = 0;
    this.filterType = 0;

    this.filtertablePosition = 0;
    this.filtertable = [];
    this.filterTime = 0;

    this.masterFader = 0xf;

    this.testInstrument = null;

  },


  playTestInstrument: function(pitch, instrument, ch) {

    this.setupAudioContext();

    this.startSong();

    this.testInstrumentChannel = ch;

    if(typeof this.testInstrumentChannel == 'undefined') {
      this.testInstrumentChannel = 0;
    }

    this.testInstrument = instrument;
    this.channels[this.testInstrumentChannel].newNote = pitch + SidPlayer.FIRSTNOTE;

    if(this.testInstrument.gateTimer & 0x40) {
      this.channels[this.testInstrumentChannel].gate = 0xfe; // Keyoff
      if (!(instrument.gateTimer & 0x80))
      {
        this.sidMemory[this.SIDAddr + 0x5 + this.testInstrumentChannel * 7] = adparam>>8; // Hardrestart
        this.sidMemory[this.SIDAddr + 0x6 + this.testInstrumentChannel * 7] = adparam&0xff;
      }
    }

    this.channels[this.testInstrumentChannel].gate = 0xff;
    this.channels[this.testInstrumentChannel].tick = 1;

//    this.channels[channel].tick = (this.testInstrument.gateTimer & 0x3f)+1;
//    this.channels[channel].gateTimer = this.testInstrument.gateTimer & 0x3f;

    this.playing = true;
    this.masterFader = 0xf;

  },

  stopTestInstrument: function() {
    console.log('player 2 test stop');
    // todo, should prob stop playing as well at some point
    this.channels[this.testInstrumentChannel].gate = 0xfe;
  },
  /*
  sequencer: function(channel) {
    var track = this.music.tracks[channel];
    var patternIndex = track[this.channels[i].trackPosition];

    var pattern = this.music.patterns[patternIndex];
    var patternData = pattern.data;

    if(patternData[this.channels[channel].patternPosition].start) {
    }
  },
  */
  playRoutine: function() {


    // filter table
    if(this.filtertablePosition && this.filtertable[this.filtertablePosition - 1][0] == 0xff) {
      // filter table jump
      this.filtertablePosition = this.filtertable[this.filtertablePosition - 1][1];
    }

    if(this.filtertablePosition) {

      var filterLeft = (this.filtertable[this.filtertablePosition - 1][0] & 0xff);

      if(filterLeft > 0x80) {
//        filterLeft = ((filterLeft & 0x70) >> 1) | 0x80;
      }      

      var filterRight = (this.filtertable[this.filtertablePosition - 1][1] & 0xff);

      if(this.filterTime == 0) {
        // Filter set
        if (filterLeft >= 0x80)
        {
          this.filterType = filterLeft & 0x70;
          this.filterControl = filterRight;
          this.filtertablePosition++;

          // Can be combined with cutoff set
          if (this.filtertablePosition < this.filtertable.length && this.filtertable[this.filtertablePosition - 1][0] == 0x00)
          {
            this.filterCutoff = this.filtertable[this.filtertablePosition - 1][1];
            this.filtertablePosition++;
          }
        } else {
          // New modulation step
          if (filterLeft) {
            this.filterTime = filterLeft;
          } else {
            // Cutoff set
            this.filterCutoff = filterRight;
            this.filtertablePosition++;
          }
        }
      }
      // Filter modulation
      if (this.filterTime)
      {
        this.filterCutoff += (filterRight & 0xff);
        this.filterTime--;
        if (this.filterTime == 0) {
          this.filtertablePosition++;
        }
      }


    }

    // set filter/mastervolume
    this.sidMemory[this.SIDAddr + 0x15] = 0x00;
    this.sidMemory[this.SIDAddr + 0x16] = this.filterCutoff;//filtercutoff;
    this.sidMemory[this.SIDAddr + 0x17] = this.filterControl;//filterctrl;
    this.sidMemory[this.SIDAddr + 0x18] = this.filterType | this.masterFader;//filtertype | masterfader;


    for(var c = 0; c < this.channels.length; c++) {//this.channelCount; c++) {
      var channel = this.channels[c];

      var doWaveExec = true;
      var doTickNEffects = true;
      var doPulseExec = true;
      var doGetNewNotes = true;

      if(!this.channels[c].finished) {
        var instrument = null;
        if(this.testInstrument != null) {
          instrument = this.testInstrument;
          doGetNewNotes = false;
          if(c != 0) {
            continue;
          }
        } else {
          instrument = this.music.instruments.instruments[channel.instrument];
        }
        channel.tick -= 1;


        // Tick N
        // Reload counter
        if(channel.tick < 0) {
          // reset
          if (channel.tempo >= 2) {
            channel.tick = channel.tempo;
          } else {
            // Set funktempo, switch between 2 values
            channel.tick = this.funktable[channel.tempo];
            channel.tempo ^= 1;
          }
          // Check for illegally high gatetimer and stop the song in this case
          if (channel.gateTimer > channel.tick) {
            console.log('illegal gatetimer!!');
            //stopsong();
            // uh oh.
          }
        } else if(channel.tick == 0) {
          // Tick 0
          // TICK0:


//          sequencer(c);

          // Get gatetimer compare-value
          channel.gateTimer = instrument.gateTimer & 0x3f;

          if(channel.newNote) {
//          if(channel.noteStart) {

            channel.note = channel.newNote - SidPlayer.FIRSTNOTE;// - SidPlayer.FIRSTNOTE;

            //console.log('channel note = !!!!' + channel.note);

            channel.command = 0;
            channel.vibDelay = instrument.vibratoDelay + 1;
            channel.vibSpeed = instrument.vibratoSpeed;
            channel.vibDepth = instrument.vibratoDepth;

            channel.commandData = instrument.speedtable[0];

            if (channel.newCommand != SidPlayer.CMD_TONEPORTA) {
              if (instrument.firstWave) {
                if (instrument.firstWave >= 0xfe) {
                  channel.gate = instrument.firstWave;
                } else {
                  channel.wave = instrument.firstWave;
                  channel.gate = 0xff;
                }
              }

              channel.wavetable = instrument.wavetable;
              channel.wavetablePosition = 0;
              if(channel.wavetable.length > 0) {
                channel.wavetablePosition = 1;
              }


              channel.pulsetable = instrument.pulsetable;
              channel.pulsetablePosition = 0;
              if(channel.pulsetable.length > 0) {
                channel.pulsetablePosition = 1;
              }
              channel.pulseTime = 0;

              channel.speedtable = instrument.speedtable;
              channel.speedtablePosition = 0;

              this.filtertable = instrument.filtertable;
              this.filtertablePosition = 0;
              if(this.filtertable.length > 0) {
                this.filtertablePosition = 1;
              }

              this.sidMemory[this.SIDAddr + 0x5 + 7*c] = (instrument.attack << 4) + instrument.decay;
              this.sidMemory[this.SIDAddr + 0x6 + 7*c] = (instrument.sustain << 4) + instrument.release;
            }
          }

          // Tick 0 effects

          switch (channel.newCommand) {
            case SidPlayer.CMD_DONOTHING:
              channel.command = 0;
              channel.commandData = 0;
              // TODO: check this
//              channel.commandData = instrument.speedtable[0];
              break;        


            case SidPlayer.CMD_PORTAUP:
            case SidPlayer.CMD_PORTADOWN:
              channel.vibTime = 0;
              channel.command = channel.newCommand;
              channel.commandData = channel.newCommandData;

              channel.speed = channel.newSpeed;
              channel.speedLeft = channel.newSpeedLeft;
              channel.speedRight = channel.newSpeedRight;
            break;

            case SidPlayer.CMD_TONEPORTA:
            case SidPlayer.CMD_VIBRATO:
              channel.command = channel.newCommand;
              channel.commandData = channel.newCommandData;

              channel.speed = channel.newSpeed;
              channel.speedLeft = channel.newSpeedLeft;
              channel.speedRight = channel.newSpeedRight;


            break;

            case SidPlayer.CMD_SETAD:
              this.sidMemory[this.SIDAddr + 0x5 + 7*c] = channel.newCommandData;
            break;

            case SidPlayer.CMD_SETSR:
              this.sidMemory[this.SIDAddr + 0x6 + 7*c] = channel.newCommandData;
            break;

            case SidPlayer.CMD_SETWAVE:
              channel.wave = channel.newCommandData;
            break;



            case SidPlayer.CMD_SETFILTERPTR:
              var filterIndex = channel.newCommandData;
              this.filtertable = this.music.filters.filters[filterIndex].filtertable;
              if(this.filtertable.length > 0) {
                this.filtertablePosition = 1;
                this.filterTime = 0;

              }
            break;

            case SidPlayer.CMD_STOPFILTER:
              this.filtertable = [];
              this.filtertablePosition = 0;
              this.filterType = 0;
              this.fitlerTime = 0;
              this.filterControl = 0;
              this.filterCutoff = 0;
            break;

            case SidPlayer.CMD_SETFILTERCTRL:
              this.filterControl = channel.newCommandData;
              if (!this.filterControl) {
                this.filtertablePosition = 0;
              }
            break;

            case SidPlayer.CMD_SETFILTERCUTOFF:
              this.filterCutoff = channel.newCommandData;
            break;

/*
            case CMD_SETWAVEPTR:
            cptr->ptr[WTBL] = cptr->newcmddata;
            cptr->wavetime = 0;
            if (cptr->ptr[WTBL])
            {
              // Stop the song in case of jumping into a jump
              if (ltable[WTBL][cptr->ptr[WTBL]-1] == 0xff)
                stopsong();
            }
            break;

            case CMD_SETPULSEPTR:
            cptr->ptr[PTBL] = cptr->newcmddata;
            cptr->pulsetime = 0;
            if (cptr->ptr[PTBL])
            {
              // Stop the song in case of jumping into a jump
              if (ltable[PTBL][cptr->ptr[PTBL]-1] == 0xff)
                stopsong();
            }
            break;


*/

            case SidPlayer.CMD_SETMASTERVOL:
              if (channel.newCommandData < 0x10) {
                this.masterFader = channel.newCommandData;
              }
            break;

            case SidPlayer.CMD_FUNKTEMPO:
              channel.speed = channel.newSpeed;
              channel.speedLeft = channel.newSpeedLeft;
              channel.speedRight = channel.newSpeedRight;

              for(var ch = 0; ch < this.channels.length; ch++) {
                this.channels[ch].tempo = 0;
              }

              this.funktable[0] = channel.speedLeft - 1;
              this.funktable[1] = channel.speedRight - 1;
//              console.log('funk table = ' + this.funktable);
            break;

            case SidPlayer.CMD_SETTEMPO:
            {
              var newTempo = channel.newCommandData & 0x7f;
              if(newTempo >= 3) {
                newTempo--;
              }

              if (channel.newCommandData >= 0x80) {
                channel.tempo = newTempo;
              } else {
                for(var ch = 0; ch < this.channels.length; ch++) {
                  this.channels[ch].tempo = newTempo;
                }

              }
            }
            break;                
          }


          if(channel.newNote) {
            channel.newNote = 0;

            if (channel.newCommand != SidPlayer.CMD_TONEPORTA) {              
            // goto NEXTCHN;
              doWaveExec = false;
              doTickNEffects = false;
              doPulseExec = false;
              doGetNewNotes = false;            
            }
          }

        }

  //      WAVEEXEC:

        if(doWaveExec) {
        
          if(channel.wavetablePosition !== 0) {

            var wave = channel.wavetable[channel.wavetablePosition - 1][0];
            var note = channel.wavetable[channel.wavetablePosition - 1][1];

/*
Wavetable left side:   00    Leave waveform unchanged
                       01-0F Delay this step by 1-15 frames
                       10-DF Waveform values
                       E0-EF Inaudible waveform values $00-$0F
                       F0-FE Execute command 0XY-EXY. Right side is parameter.
                       FF    Jump. Right side tells position ($00 = stop)

Wavetable right side:  00-5F Relative notes
                       60-7F Negative relative notes (lower pitch)
                       80    Keep frequency unchanged
                       81-DF Absolute notes C#0 - B-7
*/


            if(wave > SidPlayer.WAVELASTDELAY) {

              // Normal waveform values
              if (wave < SidPlayer.WAVESILENT) {
                // wave is between 0x10 and 0xdf
                channel.wave = wave;
              } 

              // Values without waveform selected
              if ((wave >= SidPlayer.WAVESILENT) && (wave <= SidPlayer.WAVELASTSILENT)) {
                // between 0xeo and 0xef
                channel.wave = wave & 0xf;
              }

              // Command execution from wavetable
              if ((wave >= SidPlayer.WAVECMD) && (wave <= SidPlayer.WAVELASTCMD)) {
                // wavetable command

                //unsigned char param = rtable[WTBL][cptr->ptr[WTBL]-1];
                var param = channel.wavetable[channel.wavetablePosition - 1][1];

                switch (wave & 0xf)
                {
                  case SidPlayer.CMD_DONOTHING:
                  case SidPlayer.CMD_SETWAVEPTR:
                  case SidPlayer.CMD_FUNKTEMPO:
                    //stopsong();
                  break;

                  case SidPlayer.CMD_PORTAUP:
                  {

                    var speed = 0;
                    if (param)
                    {
                      //speed = (ltable[STBL][param-1] << 8) | rtable[STBL][param-1];
                      speed = (channel.speedtable[param - 1][0] << 8) + channel.speedtable[param - 1][1];
                    }

                    if (speed >= 0x8000)
                    {
                      speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                      speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                      speed >>= channel.speedtable[param - 1][1];
                    }
                    channel.freq += speed;
                  }
                  break;

                  case CMD_PORTADOWN:
                  {
                    var speed = 0;
                    if (param)
                    {
                      //speed = (ltable[STBL][param-1] << 8) | rtable[STBL][param-1];
                      speed = (channel.speedtable[param - 1][0] << 8) + channel.speedtable[param - 1][1];
                    }

                    if (speed >= 0x8000)
                    {
                      speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                      speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                      speed >>= channel.speedtable[param - 1][1];
                    }
                    channel.freq -= speed;
                  }
                  break;

                  case CMD_TONEPORTA:
                  {

                    var targetfreq = SidPlayer.freqtbllo[channel.note] | (SidPlayer.freqtblhi[channel.note] << 8);
                    var speed = 0;

                    if (!param)
                    {
                      channel.freq = targetfreq;
                      channel.vibTime = 0;
                    }
                    else
                    {
                      speed = (channel.speedtable[param - 1][0] << 8) + channel.speedtable[param - 1][1];

                      if (speed >= 0x8000)
                      {
                        speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                        speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                        speed >>= channel.speedtable[param - 1][1];;//rtable[STBL][param-1];
                      }
                      if (channel.freq < targetfreq)
                      {
                        channel.freq += speed;
                        if (channel.freq > targetfreq)
                        {
                          channel.freq = targetfreq;
                          channel.vibTime = 0;
                        }
                      }
                      if (channel.freq > targetfreq)
                      {
                        channel.freq -= speed;
                        if (channel.freq < targetfreq)
                        {
                          channel.freq = targetfreq;
                          channel.vibTime = 0;
                        }
                      }
                    }
                  }
                  break;

                  case SidPlayer.CMD_VIBRATO:
                  {
                    var speed = 0;
                    var cmpvalue = 0;

                    if (param)
                    {
                      cmpvalue = (channel.speedtable[param - 1][0] & 0xff);
                      speed = channel.speedtable[param - 1][1];
                    }
                    if (cmpvalue >= 0x80)
                    {
                      cmpvalue &= 0x7f;
                      speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                      speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                      speed >>= channel.speedtable[param - 1][1];//rtable[STBL][param-1];
                    }

                    if ((channel.vibTime < 0x80) && (channel.vibTime > cmpvalue)) {
                      channel.vibTime ^= 0xff;
                    }

                    channel.vibTime += 0x02;

                    if (channel.vibTime & 0x01) {
                      channel.freq -= speed;
                    } else {
                      channel.freq += speed;
                    }
                  }
                  break;

                  case SidPlayer.CMD_SETAD:
                    this.sidMemory[this.SIDAddr + 0x5+7*c] = param;
                  break;

                  case SidPlayer.CMD_SETSR:
                    this.sidMemory[this.SIDAddr + 0x6+7*c] = param;;
                  break;

                  case SidPlayer.CMD_SETWAVE:
                    channel.wave = param;
                  break;

/*
                  case CMD_SETPULSEPTR:
                    cptr->ptr[PTBL] = param;
                    cptr->pulsetime = 0;
                    if (cptr->ptr[PTBL])
                    {
                      // Stop the song in case of jumping into a jump
                      if (ltable[PTBL][cptr->ptr[PTBL]-1] == 0xff)
                        stopsong();
                    }
                  break;

                  case CMD_SETFILTERPTR:
                    filterptr = param;
                    filtertime = 0;
                    if (filterptr)
                    {
                      // Stop the song in case of jumping into a jump
                      if (ltable[FTBL][filterptr-1] == 0xff)
                      stopsong();
                    }
                  break;
*/
                  case SidPlayer.CMD_SETFILTERCTRL:
                    this.filterControl = param;
                    if (!filterControl) {
                      this.filterPointer = 0;
                    }
                  break;

                  case SidPlayer.CMD_SETFILTERCUTOFF:
                    this.filterCutoff = param;
                  break;

                  case SidPlayer.CMD_SETMASTERVOL:
                  if (channel.newCommandData < 0x10)
                    this.masterFader = param;
                  break;
                }
              }

            } else {
              // Wavetable delay
              if (channel.waveTime != wave)
              {
                // haven't finished delay yet
                channel.waveTime++;
                doWaveExec = false;
    //            goto TICKNEFFECTS;
              }
            }

            if(doWaveExec) {
              // dont want to do this if still in a delay..

              channel.waveTime = 0;

              channel.wavetablePosition++;

              if(channel.wavetable[channel.wavetablePosition - 1][0] == 0xff) {
                // wavetable jump.
                channel.wavetablePosition = channel.wavetable[channel.wavetablePosition - 1][1];
              }

              if ((wave >= SidPlayer.WAVECMD) && (wave <= SidPlayer.WAVELASTCMD)) {
                // this wavetable entry was a command, so dont want to set the freq
                doWaveExec = false;
                doTickNEffects = false;
      //          goto PULSEEXEC;
              }

              if(doWaveExec) {
                if (note != 0x80) {
                  if (note < 0x80) {
                    // relative note
                    note += channel.note;
                  }

                  note &= 0x7f;
                  channel.freq = SidPlayer.freqtbllo[note] | (SidPlayer.freqtblhi[note]<<8);
                  channel.vibTime = 0;
                  channel.lastnote = note;
                  doTickNEffects = false;
                  //goto PULSEEXEC;
                }
              }
            }
          }
        }

        // Tick N command
  //      TICKNEFFECTS:
        if(doTickNEffects && channel.tick) {
          switch(channel.command) {
            case SidPlayer.CMD_PORTAUP:
            {
              var speed = 0;
              if (channel.speed)
              {
                speed = channel.speed;//(ltable[STBL][cptr->cmddata-1] << 8) | rtable[STBL][cptr->cmddata-1];
              }

              if (speed >= 0x8000)
              {
                speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                speed >>= channel.speedRight;//rtable[STBL][cptr->cmddata-1];
              }
              channel.freq += speed;
            }
            break;

            case SidPlayer.CMD_PORTADOWN:
            {
              var speed = 0;
              if (channel.speed)
              {
                speed = channel.speed;//(ltable[STBL][cptr->cmddata-1] << 8) | rtable[STBL][cptr->cmddata-1];
              }
              if (speed >= 0x8000)
              {
                speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                speed >>= channel.speedRight;//rtable[STBL][cptr->cmddata-1];

                /*
                speed = freqtbllo[cptr->lastnote + 1] | (freqtblhi[cptr->lastnote + 1] << 8);
                speed -= freqtbllo[cptr->lastnote] | (freqtblhi[cptr->lastnote] << 8);
                speed >>= rtable[STBL][cptr->cmddata-1];
                */
              }
              channel.freq -= speed;
            }
            break;


            case SidPlayer.CMD_DONOTHING:
                // TODO: check this
//              if ((!channel.commandData) || (!channel.vibDelay)) {
              if (!channel.vibDelay) {
                break;
              }
              if (channel.vibDelay > 1) {
                channel.vibDelay--;
                break;
              }
              // falls through if vibDelay is 1
              case SidPlayer.CMD_VIBRATO:
              {
                var speed = channel.vibSpeed;
                var depth = channel.vibDepth;

                if(channel.command == SidPlayer.CMD_VIBRATO) {
                  speed = (channel.speedLeft & 0xff);
                  depth = (channel.speedRight & 0xff);
                }

//                unsigned short speed = 0;
//                unsigned char cmpvalue = 0;

                if(speed == 0 || depth ==0) {
                  // vibrato not set
                  break;
                }

                // if speed is negative
                if (speed >= 0x80)
                {
                  var tmp = depth;
                  speed &= 0x7f;
                  depth = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                  depth -= SidPlayer.freqtbllo[channel.lastnote] | (freqtblhi[channel.lastnote] << 8);
                  depth >>= depth;//channel.speedRight;
                }


                if( (channel.vibTime < 0x80) && (channel.vibTime > speed)) {
                  channel.vibTime ^= 0xff;
                }

                channel.vibTime = (channel.vibTime + 0x02) & 0xff;
                if(channel.vibTime & 0x01) {
                  channel.freq -= depth;
                } else {
                  channel.freq += depth;

                }

              }
            break;            

            case SidPlayer.CMD_TONEPORTA:
            {

              var targetfreq = SidPlayer.freqtbllo[channel.note] | (SidPlayer.freqtblhi[channel.note] << 8);
              var speed = 0;

              if (!channel.speed)
              {
                channel.freq = targetfreq;
                channel.vibTime = 0;
              }
              else
              {
                speed = channel.speed;//(ltable[STBL][cptr->cmddata-1] << 8) | rtable[STBL][cptr->cmddata-1];

                if (speed >= 0x8000)
                {
                  speed = SidPlayer.freqtbllo[channel.lastnote + 1] | (SidPlayer.freqtblhi[channel.lastnote + 1] << 8);
                  speed -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
                  speed >>= channel.speedRight;//rtable[STBL][cptr->cmddata-1];
                }
                if (channel.freq < targetfreq)
                {
                  channel.freq += speed;
                  if (channel.freq > targetfreq)
                  {
                    channel.freq = targetfreq;
                    channel.vibTime = 0;
                  }
                }
                if (channel.freq > targetfreq)
                {
                  channel.freq -= speed;
                  if (channel.freq < targetfreq)
                  {
                    channel.freq = targetfreq;
                    channel.vibTime = 0;
                  }
                }

              }
            }
            break;

          }

        }


  //      PULSEEXEC:
        if(doPulseExec && channel.tick) {
          if(channel.pulsetablePosition > 0) {

            var left = channel.pulsetable[channel.pulsetablePosition - 1][0];
            var right = channel.pulsetable[channel.pulsetablePosition - 1][1];

            // Pulsetable jump
            if (left == 0xff)
            {
              channel.pulsetablePosition = right;
              if(channel.pulsetablePosition != 0) {
                left = channel.pulsetable[channel.pulsetablePosition - 1][0];
                right = channel.pulsetable[channel.pulsetablePosition - 1][1];
              } else {
                doPulseExec = false;
              }


//              cptr->ptr[PTBL] = rtable[PTBL][cptr->ptr[PTBL]-1];
//              if (!cptr->ptr[PTBL]) goto PULSEEXEC;
            }
/*
Pulsetable left side:  01-7F Pulse modulation step. Left side indicates time
                             and right side the speed (signed 8-bit value).
                       8X-FX Set pulse width. X is the high 4 bits, right
                             side tells the 8 low bits.
                       FF    Jump. Right side tells position ($00 = stop)
*/                       

            if(doPulseExec) {
              if(channel.pulseTime == 0) {
                // Set pulse
                if (left >= 0x80)
                {
                  channel.pulse = (left & 0xf) << 8;//(ltable[PTBL][cptr->ptr[PTBL]-1] & 0xf) << 8;
                  channel.pulse |= right;//rtable[PTBL][cptr->ptr[PTBL]-1];
                  channel.pulsetablePosition++;
                } else {
                  channel.pulseTime = left;
                }
              }

              // pulse modulation
              if(channel.pulseTime != 0) {
                var speed = right;
                if (speed < 0x80)
                {
                  channel.pulse += speed;
                  channel.pulse &= 0xfff;
                } else {
                  channel.pulse += speed;
                  channel.pulse -= 0x100;
                  channel.pulse &= 0xfff;
                }
                channel.pulseTime--;

                if (channel.pulseTime == 0) {
                  channel.pulsetablePosition++;
                }
              }
            }
          }
        }


        // New notes processing
        if(doGetNewNotes) {
          if(channel.tick == channel.gateTimer) {
      //      GETNEWNOTES:
      //        var newnote = this.music.pattern[cptr->pattnum][cptr->pattptr];
            var track = this.music.tracks[c];
            var patternIndex = track[channel.trackPosition];

            var pattern = this.music.patterns[patternIndex];
            var patternData = pattern.data;

            channel.newCommand = patternData[channel.patternPosition].effect;
            channel.newCommandData = patternData[channel.patternPosition].effectParam;
            if(typeof channel.newCommand == 'undefined') {
              channel.newCommand = SidPlayer.CMD_DONOTHING;
            }
            if(typeof channel.newCommandData == 'undefined') {
              channel.newCommandData = 0;
            }



            if(patternData[channel.patternPosition].start && patternData[channel.patternPosition].instrument != 0) {
              // its a new note
              channel.newNote = patternData[channel.patternPosition].pitch + SidPlayer.FIRSTNOTE;

              if(channel.newCommand == SidPlayer.CMD_LEGATO && channel.instrument == patternData[channel.patternPosition].instrument) {
                channel.newCommand = SidPlayer.CMD_TONEPORTA;
                channel.newCommandData = 0;
              }
              channel.instrument = patternData[channel.patternPosition].instrument;
              channel.instrumentDuration = patternData[channel.patternPosition].duration;


              //channel.gate = 0xff;
              if ((channel.newCommand) != SidPlayer.CMD_TONEPORTA) {
                if (!(this.music.instruments.instruments[channel.instrument].gateTimer & 0x40)) {
                  channel.gate = 0xfe;
                  if (!(this.music.instruments.instruments[channel.instrument].gateTimer & 0x80)) {
                    this.sidMemory[this.SIDAddr + 0x5 + 7*c] = this.adparam >> 8;
                    this.sidMemory[this.SIDAddr + 0x6 + 7*c] = this.adparam & 0xff;                                        
                  }
                }
              }
            } else {

              if(channel.instrumentDuration > 0) {
                // instrument currently playing
                channel.instrumentDuration--;
                if(channel.instrumentDuration == 0) {
                  // instrument is over..
                  // KEYOFF
                  channel.gate = 0xfe;
                } else {
                  // instrument still going
                  // REST
                  if(channel.newCommand == SidPlayer.CMD_TONEPORTA) {
                    channel.newNote = patternData[channel.patternPosition].effectParam2 + SidPlayer.FIRSTNOTE;
                  }
                }
              } else {
                // REST
                // no instrument playing..
              }

            }

            // store values here instead of speed table
            if(  channel.newCommand == SidPlayer.CMD_PORTAUP
              || channel.newCommand == SidPlayer.CMD_PORTADOWN
              || channel.newCommand == SidPlayer.CMD_TONEPORTA
              || channel.newCommand == SidPlayer.CMD_VIBRATO
              || channel.newCommand == SidPlayer.CMD_FUNKTEMPO) {
              channel.newSpeed = channel.newCommandData;
              channel.newSpeedLeft = (channel.newSpeed >> 8);
              channel.newSpeedRight = (channel.newSpeed & 0xff);
            }

            channel.patternPosition++;
            if(c == 0) {
              this.playheadPosition++;
            }
            if(channel.patternPosition >= pattern.duration) {
              channel.patternPosition = 0;
              channel.trackPosition++;
              if(channel.trackPosition >= this.music.tracks[c].length) {
                channel.finished = true;
              }
            }
          }
        }

  //      NEXTCHN:
        if (channel.mute) {
          this.sidMemory[this.SIDAddr + 0x4 + 7*c] = 0x08;
//          sidreg[0x4+7*c] = channel.wave = 0x08;
        } else {

          this.sidMemory[this.SIDAddr + 0x0 + 7*c] = channel.freq & 0xff;
          this.sidMemory[this.SIDAddr + 0x1 + 7*c] = channel.freq >> 8;

          this.sidMemory[this.SIDAddr + 0x2 + 7*c] = channel.pulse & 0xfe;
          this.sidMemory[this.SIDAddr + 0x3 + 7*c] = channel.pulse >> 8;

          this.sidMemory[this.SIDAddr + 0x4 + 7*c] = channel.wave & channel.gate;
          this.sid.setWave(this.SIDAddr + 0x4);

//console.log('set adsr ' + this.sidMemory[this.SIDAddr + 0x5 + 7*c]  + ',' + this.sidMemory[this.SIDAddr + 0x6 + 7*c]);

//    this.sidMemory[this.SIDAddr + 0x5 + 7*c] = 185;//0xf2;//0x11;
//    this.sidMemory[this.SIDAddr + 0x6 + 7*c] = 140;//0x8c;//0xaa;

/*
    // accumulator add
    this.sidMemory[this.SIDAddr] = 0xa;
    this.sidMemory[this.SIDAddr + 1] = 0xf;

    // waveform 
    this.sidMemory[this.SIDAddr + 4] = 0x10;
    // test
    this.sidMemory[this.SIDAddr + 4] |= 0x01;

    // SR 
    this.sidMemory[this.SIDAddr + 6] |= 0xaa;

    */

/*
          sidreg[0x0+7*c] = channel.freq & 0xff;
          sidreg[0x1+7*c] = channel.freq >> 8;
          sidreg[0x2+7*c] = channel.pulse & 0xfe;
          sidreg[0x3+7*c] = channel.pulse >> 8;
          sidreg[0x4+7*c] = channel.wave & channel.gate;
*/          
        }
  /*
  // ???
          if (newnote == KEYOFF)
            cptr->gate = 0xfe;
          if (newnote == KEYON)
            cptr->gate = 0xff;
  */          

      }
    }
  }
}
