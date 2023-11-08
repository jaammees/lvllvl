var g_tick = 0;

// prob not the best name, but can't think of anything better
var SidPatternPlayer = function() {
  this.music = null;

  this.playing = false;

  this.channels = [];
  this.channelCount = 3;

  this.filterType = 0;
  this.filterCommand = 0;
  this.filtertablePosition = 0;

  this.funktable = [6, 6];

  this.sampleRate = 0;

  this.sid = null;
  this.sidMemory = null;


  this.framecnt = 0;
//  this.finished = 1;
  this.hardRestartADSR = 0x0f00;

  this.playheadPosition = 0;
  this.newPlayheadPosition = 0;

  this.testInstrument = null;

  this.testInstrumentChannel = false;

}

SidPatternPlayer.prototype = {
  init: function(music) {
    this.music = music;
    this.initChannels();    
  },

  initChannels: function() {
    this.channels = [];

    for(var i = 0; i < this.channelCount; i++) {
      var channel = {};
      channel.instrument = 1;
      channel.mute = false;
      this.channels.push(channel);
    }
  },

  setMute: function(channel, mute) {
    //this.sid.setMute(channel, mute);
    this.channels[channel].mute = mute;
  },

  getMute: function(channel) {
    return this.channels[channel].mute;
   // return this.sid.getMute(channel);
  },

  setup: function(sampleRate, bufferLength) {

    this.sampleRate = sampleRate;
    this.bufferLength = bufferLength;
    var factor = 1;
    var speed = 1;

    // CIA Timer clock rate 0.985248MHz (PAL) 

    this.C64_PAL_CPUCLK = 985248 * factor; //Hz
    this.PAL_FRAMERATE = 50 * factor; //NTSC_FRAMERATE = 60;
    this.clk_ratio = this.C64_PAL_CPUCLK / this.sampleRate;

    this.sid = new jsSID2(bufferLength, 0.0005, this.sampleRate);
    this.sidMemory = this.sid.getMemory();



    // number of samples per frame
    this.frame_sampleperiod = this.sampleRate / (this.PAL_FRAMERATE * speed); //Vsync timing



    this.SIDAddr = 0xD400;

    this.debugData = [];
    this.lastTime = getTimestamp();
    this.sampleCount = 0;
    this.lastCalledPlay = 0;
  },

  nextSample: function() {
/*
    var time = getTimestamp();
    var timeDiff = time - this.lastTime;
    this.debugData.push(timeDiff);
    this.lastTime = time;
*/  
    this.sampleCount++;
    // framecnt is number of samples per frame.
    this.framecnt--; 
    if(this.framecnt <= 0) { 
      this.framecnt = this.frame_sampleperiod; 
      this.playRoutine();
    }

    /*
      this.finished = 0; 
    }

    if(this.finished == 0) {
      // tick..
      this.playRoutine();
      this.finished = 1;
    }

    */

/*
    this.debugData.push([
      this.sidMemory[this.SIDAddr + 0x0],
      this.sidMemory[this.SIDAddr + 0x1],
      this.sidMemory[this.SIDAddr + 0x2],
      this.sidMemory[this.SIDAddr + 0x3],
      this.sidMemory[this.SIDAddr + 0x4],
      this.sidMemory[this.SIDAddr + 0x5],
      this.sidMemory[this.SIDAddr + 0x6]    
    ]);
*/

    return this.sid.play();
  },

  getPlayheadPosition: function() {
    var position =  this.playheadPosition;// - 2;
    if(position < 0) {
      return 0;
    }

    return position;
  },

  getTick: function() {

    if(this.channels.length == 0) {
      return 0;
    }

    return this.channels[0].tick;
  },

  getTempo: function() {
    if(this.channels.length == 0) {
      return 0;
    }
    return this.channels[0].tempo;
  },
  /*
  getPlayheadPositionPositionFraction: function() {
    var position = ((this.channel[0].tempo - 1) - this.channel[0].tick) / (this.channel[0].tempo - 1);
  }
  */

  getChannelData: function() {

    return this.sid.getData();
  },
  isPlaying: function() {
    return this.playing;
  },
  play: function(startAtPosition) {

    this.debugData = [];
    this.startSong(startAtPosition);
    this.playing = true;
  },

  stop: function() {
    this.playing = false;
//    var data = JSON.stringify(this.debugData);
//    download(data, "test.json", "application/json");
  },



  setPlayheadPosition: function(globalPosition) {

    // find pattern number, pattern position for each channel
    for(var ch = 0; ch < 3; ch++) {
      if(ch < this.music.doc.data.tracks.length) {
        var chPatternNumber = 0;
        var chPatternPosition = 0;
        var position = 0;

        var patternId = this.music.tracks.getPatternAt(ch, globalPosition);

        this.channels[ch].trackPosition = globalPosition;
        this.channels[ch].patternPosition = this.music.tracks.getPatternPositionAt(ch, globalPosition);        
      }
    }

    this.playheadPosition = globalPosition;//- 2;
    this.newPlayheadPosition = globalPosition;
  },

  playTestInstrument: function(pitch, instrument, ch) {

//return;
//    this.setupAudioContext();


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
        this.sidMemory[this.SIDAddr + 0x5 + this.testInstrumentChannel * 7] = this.hardRestartADSR >> 8; // Hardrestart
        this.sidMemory[this.SIDAddr + 0x6 + this.testInstrumentChannel * 7] = this.hardRestartADSR & 0xff;
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
    // todo, should prob stop playing as well at some point
    if(this.testInstrumentChannel !== false) {
      this.channels[this.testInstrumentChannel].gate = 0xfe;
    }
  },



  startSong: function(startAtPosition) {
    if(typeof startAtPosition == 'undefined') {
      startAtPosition = 0;
    }

    var multiplier = 1;

    this.playheadPosition = 0;

    this.sid.initSID();
    for(var i = 0; i < this.channelCount; i++) {

      // reset the sid chip..
      this.sidMemory[this.SIDAddr + 0x0 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x1 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x2 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x3 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x4 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x5 + 7*i] = 0;
      this.sidMemory[this.SIDAddr + 0x6 + 7*i] = 0;


//      this.channels[i].songptr = 0;

      // position in channel's track
      this.channels[i].trackPosition = 0;

      // position in current pattern
      this.channels[i].patternPosition = 0;

      // next note from the pattern
      this.channels[i].newNote = 0;


//      this.channels[i].noteStart = false;

      // the number of ticks before note start that note fetch, gate off happen
      // usually set to 2
      this.channels[i].gateTimer = this.music.instruments.getInstrument(1).gateTimer & 0x3f;
      this.channels[i].gate = 0xfe;

      // current
      this.channels[i].command = SidPlayer.CMD_DONOTHING;
      this.channels[i].commandData = 0;

      // new command and new command data are set when tick is equal to gate timer
      // copied over on tick = 0
      this.channels[i].newCommand = SidPlayer.CMD_DONOTHING;
      this.channels[i].newCommandData = 0;

      this.channels[i].instrument = 0;
      this.channels[i].instrumentDuration = 0;


//      this.channels[i].advance = 1;

      // wave settings for the channel
      this.channels[i].wave = 0;
      this.channels[i].waveTime = 0;
      this.channels[i].wavetablePosition = 0;

      // pulse settings for the channel
      this.channels[i].pulse = 0;
      this.channels[i].pulseTime = 0;
      this.channels[i].pulsetablePosition = 0;


      this.channels[i].speedtablePosition = 0;


      this.channels[i].vibTime = 0;
      this.channels[i].vibDelay = 0;
      this.channels[i].vibSpeed = 0;
      this.channels[i].vibDepth = 0;

//      this.channels[i].ptr[WTBL] = 0;
//      this.channels[i].repeat = 0;

      this.channels[i].tempo = this.music.getTempo() - 1;

      // tick counts down from tempo - 1 to zero
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

    this.setPlayheadPosition(startAtPosition);

  },


/*
tick starts at tempo and counts down

on tick = gatetimer, 
- get the next note, put into new note,
- turn gate off, set adsr for current instrument to hard restart values

on tick 0, 
- new note is copied to current note, 
- gate is turned on
- wave table, filter table, pulse table, etc is set
- wave exec doesn't happen
*/
  playRoutine: function() {


    // first process filter table
    if(this.filtertablePosition > 0 && this.filtertablePosition <= this.filtertable.length 
      && this.filtertable[this.filtertablePosition - 1][0] == 0xff) {
      // filter table jump
      this.filtertablePosition = this.filtertable[this.filtertablePosition - 1][1];
    }


    if(this.filtertablePosition && this.filtertablePosition <= this.filtertable.length) {
      var filterLeft = (this.filtertable[this.filtertablePosition - 1][0] & 0xff);
      var filterRight = (this.filtertable[this.filtertablePosition - 1][1] & 0xff);


//      not sure what this is..
//      if(filterLeft > 0x80) {
//        filterLeft = ((filterLeft & 0x70) >> 1) | 0x80;
//      }      


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

    var playheadUpdated = false;

    for(var c = 0; c < this.channels.length; c++) {//this.channelCount; c++) {
      var channel = this.channels[c];

      // what to execute this time around
      var doWaveExec = true;
      var doTickNEffects = true;
      var doPulseExec = true;
      var doGetNewNotes = true;

      if(true) {//!channel.finished) {
        var instrument = null;

        // if this is the test instrument player, the current instrument is the test instrument
        // only play it on the test instrument channel
        if(this.testInstrument != null) {
          doGetNewNotes = false;

          if(c == this.testInstrumentChannel) {
            instrument = this.testInstrument;
          } else {
            continue;
          }
        } else {
          instrument = this.music.instruments.getInstrument(channel.instrument);
        }

        // next tick
        channel.tick -= 1;

        // Tick N
        // Reload counter
        if(channel.tick < 0) {
          // tick has gone below zero, so reset it.

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


          // update pattern position, track position, playhead, etc
          channel.trackPosition++;

          // update the playhead..
          if(!playheadUpdated) {
            this.playheadPosition = this.newPlayheadPosition;
            this.newPlayheadPosition = this.playheadPosition + 1;
            playheadUpdated = true;
          }


          var track = this.music.doc.data.tracks[c];

          // TODO: track.getLength maybe not efficient
          if(channel.trackPosition >= this.music.tracks.getLength(c)) {

            channel.finished = true;
          } else {
            channel.finished = false;

            if(this.testInstrument == null) {

              var patternIndex = this.music.tracks.getPatternIndexAt(c, channel.trackPosition);
              if(patternIndex !== false) {
                var patternId = this.music.tracks.getPatternIdAtIndex(c, patternIndex); 


                if(patternId !== false) {
                  if(patternId >= this.music.doc.data.patterns.length) {
                    channel.finished = true;
                  } else {                
                    channel.patternPosition = this.music.tracks.getPatternPositionAtIndex(c, patternIndex, channel.trackPosition); 

                  }
                }
              }
            }
          }

        } else if(channel.tick == 0) {
          // Tick 0
          // TICK0:


          // Get gatetimer compare-value
          channel.gateTimer = instrument.gateTimer & 0x3f;

          if(channel.newNote) {
            // need to set up a new note

            channel.note = channel.newNote - SidPlayer.FIRSTNOTE;

            channel.command = 0;
            channel.vibDelay = instrument.vibratoDelay + 1;
            channel.vibSpeed = instrument.vibratoSpeed;
            channel.vibDepth = instrument.vibratoDepth;

            channel.commandData = instrument.speedtable[0];

            if (channel.newCommand != SidPlayer.CMD_TONEPORTA) {
              if (instrument.firstWave) {
                // set channel wave to the first wave
                // Values $00, $FE and $FF have special meaning:
                // leave waveform unchanged and additionally set gate off
                // ($FE), gate on ($FF), or gate unchanged ($00).
                if (instrument.firstWave >= 0xfe) {
                  channel.gate = instrument.firstWave;
                } else {
                  channel.wave = instrument.firstWave;
                  channel.gate = 0xff;
                }
              }

              // set the wavetable for the channel
              channel.wavetable = instrument.wavetable;
              channel.wavetablePosition = 0;
              if(channel.wavetable.length > 0) {
                channel.wavetablePosition = 1;
              }

              // set the pulsetable for the channel
              channel.pulsetable = instrument.pulsetable;
              channel.pulsetablePosition = 0;
              if(channel.pulsetable.length > 0) {
                channel.pulsetablePosition = 1;
              }
              channel.pulseTime = 0;

              channel.speedtable = instrument.speedtable;
              channel.speedtablePosition = 0;

              if(instrument.filtertable.length > 0) {
                this.filtertable = instrument.filtertable;
                this.filtertablePosition = 0;
                if(this.filtertable.length > 0) {
                  this.filtertablePosition = 1;
                }
              }

              // set adsr registers
              this.sidMemory[this.SIDAddr + 0x5 + 7*c] = (instrument.attack << 4) + instrument.decay;
              this.sidMemory[this.SIDAddr + 0x6 + 7*c] = (instrument.sustain << 4) + instrument.release;
            }
          }

          // still on tick 0
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
              // start a new filter.
              var filterIndex = channel.newCommandData;
              if(filterIndex < this.music.doc.data.filters.length) {
                this.filtertable = this.music.doc.data.filters[filterIndex].filtertable;
                if(this.filtertable.length > 0) {
                  this.filtertablePosition = 1;
                  this.filterTime = 0;
                }
              }
            break;

            case SidPlayer.CMD_STOPFILTER:
              // stop current filter
              this.filtertable = [];
              this.filtertablePosition = 0;
              this.filterType = 0;
              this.fitlerTime = 0;
              this.filterControl = 0;
              this.filterCutoff = 0;
            break;

            case SidPlayer.CMD_SETFILTERCTRL:
              // set filter resonance and channel bitmask
              this.filterControl = channel.newCommandData;
              if (!this.filterControl) {
                this.filtertablePosition = 0;
              }
            break;

            case SidPlayer.CMD_SETFILTERCUTOFF:
              this.filterCutoff = channel.newCommandData;
//              console.log('set filter cutoff');

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

            // new note has been processed, so set it to zero
            channel.newNote = 0;

            if (channel.newCommand != SidPlayer.CMD_TONEPORTA) {              
            // goto NEXTCHN;
              doWaveExec = false;
              doTickNEffects = false;
              doPulseExec = false;
              doGetNewNotes = false;            
            }
          }

        } // end if tick == 0


  //      WAVEEXEC:

        if(doWaveExec) {
        
          if(channel.wavetablePosition !== 0 && channel.wavetablePosition <= channel.wavetable.length) {
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
              // its not a delay command

              if (wave < SidPlayer.WAVESILENT) {
                // set channel wave to a normal value
                // wave is between 0x10 and 0xdf
                channel.wave = wave;
              } 

              // Values without waveform selected
              if ((wave >= SidPlayer.WAVESILENT) && (wave <= SidPlayer.WAVELASTSILENT)) {
                // set channel wave to silent value
                // between 0xeo and 0xef
                channel.wave = wave & 0xf;
              }

              // Command execution from wavetable
              if ((wave >= SidPlayer.WAVECMD) && (wave <= SidPlayer.WAVELASTCMD)) {
                // its a wavetable command

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
                    if (param && param <= channel.speedtable.length)
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

                  case SidPlayer.CMD_PORTADOWN:
                  {
                    var speed = 0;
                    if (param && param <= channel.speedtable.length)
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

                  case SidPlayer.CMD_TONEPORTA:
                  {

                    var targetfreq = SidPlayer.freqtbllo[channel.note] | (SidPlayer.freqtblhi[channel.note] << 8);
                    var speed = 0;

                    if (!param)
                    {
                      channel.freq = targetfreq;
                      channel.vibTime = 0;
                    } else {
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
//              console.log('set filter cutoff =param');

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

              // check if continuing with wave exec
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
                  depth -= SidPlayer.freqtbllo[channel.lastnote] | (SidPlayer.freqtblhi[channel.lastnote] << 8);
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
          if(channel.pulsetablePosition > 0 && channel.pulsetablePosition <= channel.pulsetable.length) {

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
                var speed = right & 0xff;
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



        var track = this.music.doc.data.tracks[c];
        var patternId = this.music.tracks.getPatternAt(c, channel.trackPosition);
        var patternDuration = 0;

        if(patternId !== false) {
          patternDuration = this.music.patterns.getDuration(patternId);
        } else {
          if(channel.tick == 0) {
            // no current pattern, so set the gate to off?
            channel.gate = 0xfe;          
          }
        }


        // New notes processing
        if(patternId !== false && doGetNewNotes) {

          if(channel.tick == channel.gateTimer && channel.patternPosition < patternDuration) {
      //      GETNEWNOTES:
              // tick has reached gate timer value, so get the new note data

            if(channel.patternPosition < patternDuration) {
              var effect = this.music.patterns.getParamAt(patternId, "effects", channel.patternPosition);
              if(effect != null) {
                channel.newCommand = effect.values.effect;
                channel.newCommandData = effect.values.value1;
                channel.newCommandData2 = effect.values.value2;

              } else {
                channel.newCommand = 0;
                channel.newCommandData = 0;
                channel.newCommandData2 = 0;
              }


              if(typeof channel.newCommand == 'undefined') {
                channel.newCommand = SidPlayer.CMD_DONOTHING;
              }
              if(typeof channel.newCommandData == 'undefined') {
                channel.newCommandData = 0;
              }

              var patternNote = this.music.patterns.getNoteAt(patternId, channel.patternPosition);

              if(patternNote !== null) {
                // its a new note

                channel.newNote = patternNote.pit + SidPlayer.FIRSTNOTE;

                if(channel.newCommand == SidPlayer.CMD_LEGATO && channel.instrument == patternNote.ins) {
                  channel.newCommand = SidPlayer.CMD_TONEPORTA;
                  channel.newCommandData = 0;
                }

                channel.instrument = patternNote.ins;
                channel.instrumentDuration = patternNote.dur;


                // keyoff = 0xbe
                // only want key off if the instrument is '0'
                /*
                if (channel.newNote == SidPlayer.KEYOFF) {
                  channel.gate = 0xfe;
                }
                */

                // keyon = 0xbf
                // never want keyon??
                /*
                if (channel.newNote == SidPlayer.KEYON) {
                  channel.gate = 0xff;
                }
                */
                //channel.gate = 0xff;
                // last note is 0xbc
                if(channel.newNote <= SidPlayer.LASTNOTE) {
                  if ((channel.newCommand) != SidPlayer.CMD_TONEPORTA) {
                    // its not a portamento note
                    // ff is gate on, fe is gate off
                    // 0x40 for gatetimer disables gateoff
                    // 0x80 for gatetimer disables hard restart

                    if (!(this.music.instruments.getInstrument(channel.instrument).gateTimer & 0x40)) {

                      channel.gate = 0xfe;

                      if (!(this.music.instruments.getInstrument(channel.instrument).gateTimer & 0x80)) {
                        // hard restart
                        /*
                          The hard restart ADSR parameter will especially affect how rapid passages of
                          notes will sound like. 0000 is probably too hard to be useful, except perhaps
                          with gateoff timer value 1. 0F00 (default) is a lot softer, and 0F01 adds also
                          a little bit of release to the gateoff phase for even softer sound. 000F makes
                          the note start very pronounced.
                        */                      
                        this.sidMemory[this.SIDAddr + 0x5 + 7*c] = (this.hardRestartADSR >> 8) & 0xff;
                        this.sidMemory[this.SIDAddr + 0x6 + 7*c] = this.hardRestartADSR & 0xff;                                        
                      }
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
                      channel.newNote = effect.values.value2 + SidPlayer.FIRSTNOTE;
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

  //              console.log('channel new command: ' + channel.newCommand + ':' + channel.newCommandData);
  /*
                if(channel.newCommand == SidPlayer.CMD_VIBRATO) {
                  channel.newSpeedLeft = channel.newCommandData;
                  channel.newSpeedRight = channel.newCommandData2;

                } else {
  */                
                  channel.newSpeed = channel.newCommandData;
                  channel.newSpeedLeft = (channel.newSpeed >> 8);
                  channel.newSpeedRight = (channel.newSpeed & 0xff);

                  if(channel.newCommand == SidPlayer.CMD_FUNKTEMPO) {
//                    console.log('funk tempo: ' + channel.newSpeedLeft + ',' + channel.newSpeedRight);
                  }
  //              }
              }
            
            }
          }
        } else {
          // no current pattern, but check if instrument is over


        }

        // TODO: where to place this block?
        if(channel.tick == 0) {
          /*

          channel.patternPosition++;

          // update the playhead..
          this.playheadPosition = this.newPlayheadPosition;

          if(c == this.channels.length - 1) {
            this.newPlayheadPosition = this.playheadPosition + 1;
          }
          if(channel.patternPosition >= pattern.duration) {
            channel.patternPosition = 0;
            channel.trackPosition++;
            if(channel.trackPosition >= this.music.doc.data.tracks[c].length) {
              channel.finished = true;
            }
          }

          */
        }


  //      NEXTCHN:
        if (channel.mute) {
          this.sidMemory[this.SIDAddr + 0x4 + 7*c] = 0x08;
          this.sid.setWave(this.SIDAddr + 0x4);          
        } else {

          this.sidMemory[this.SIDAddr + 0x0 + 7*c] = channel.freq & 0xff;
          this.sidMemory[this.SIDAddr + 0x1 + 7*c] = channel.freq >> 8;

          this.sidMemory[this.SIDAddr + 0x2 + 7*c] = channel.pulse & 0xfe;
          this.sidMemory[this.SIDAddr + 0x3 + 7*c] = channel.pulse >> 8;

          var prev = this.sidMemory[this.SIDAddr + 0x4 + 7*c];

          if(channel.gate == 255 || channel.gate == 254) {
            this.sidMemory[this.SIDAddr + 0x4 + 7*c] = channel.wave & channel.gate;
          }
          
          if(prev != this.sidMemory[this.SIDAddr + 0x4 + 7*c]) {

//            console.log(channel.gate);
            this.sid.setWave(this.SIDAddr + 0x4 + 7*c);
          
          }
        }




      }
    }


//    console.log(this.channels[0].tick + ',' + this.channels[1].tick + ',' + this.channels[2].tick + '   ' +
//      this.channels[0].patternPosition + ',' + this.channels[1].patternPosition + ',' + this.channels[2].patternPosition);

    var songFinished = true;

    for(var i = 0; i < this.channels.length; i++) {
      if(!this.channels[i].finished) {
        songFinished = false;  
      }
    }

    if(songFinished) {
      // reset to beginning?
//      console.log("RESET PLAYHEAD POSITION!!!!");

      this.playheadPosition = 0;
      this.newPlayheadPosition = 0;
      for(var i = 0; i < this.channels.length; i++) {
        this.channels[i].trackPosition = 0;
        this.channels[i].patternPosition = 0
        this.channels[i].finished = false;
        this.channels[i].tick = this.channels[i].tempo - 1;
      }
    }
  }
}