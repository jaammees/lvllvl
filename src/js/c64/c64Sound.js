var C64Sound = function() {
  this.audioEnabled = true;
}

C64Sound.prototype = {
  init: function() {
    this.loadPrefs();
  },

  loadPrefs: function() {
    if(typeof UI != 'undefined') {
      var _this = this;
      UI.on('ready', function() {
        _this.setModel(g_app.getPref('c64sidmodel'));
      });
    }
  },

  checkAudio: function() {
    if(this.audioEnabled) {//} && !this.audioStarted) {
      // need to start the audio
//      console.log('start audio!');
      this.startAudio();      
    }
  },

  setModel: function(model) {
    switch(model) {
      case '6581':
        sid_setModel(0);
        if(typeof UI != 'undefined') {
          if(UI.exists('c64debugger-sound6581') && UI.exists('c64debugger-sound8580')) {
            UI('c64debugger-sound6581').setChecked(true);
            UI('c64debugger-sound8580').setChecked(false);
          }
          g_app.setPref('c64sidmodel', model);

        }
  
        break;
      case '8580':
        sid_setModel(1);
        if(typeof UI != 'undefined') {
          if(UI.exists('c64debugger-sound6581') && UI.exists('c64debugger-sound8580')) {
            UI('c64debugger-sound6581').setChecked(false);
            UI('c64debugger-sound8580').setChecked(true);
          }
          g_app.setPref('c64sidmodel', model);

        }
        break;
    }
  },

  toggleAudio: function() {
    if(this.audioEnabled) {
      this.stopAudio();
    } else {
      this.startAudio();
    }

    UI('c64debugger-sound').setChecked(this.audioEnabled);
  },

  getAudioEnabled: function() {
    return this.audioEnabled;
  },


  //this.audioEnabled && !this.audioStarted
  startAudio: function() {
    var AudioContext = window.AudioContext 
                       || window.webkitAudioContext 
                       || false;

    if (!AudioContext) {
      return;
    }

    var _this = this;

    this.stopAudio();

    // windows 48000 sample rate

    try {
      this.audioBufferLength = 4096; // 2048;
      this.audioCtx = new AudioContext;//new window.AudioContext();
      this.sampleRate = this.audioCtx.sampleRate;
//      console.log('sample rate = ' + this.audioCtx.sampleRate);
      sid_setSampleRate(this.sampleRate);

      this.scriptNode = this.audioCtx.createScriptProcessor(this.audioBufferLength, 0, 1);
      this.scriptNode.onaudioprocess = function(e) {
        _this.audioProcess(e);
      }
      this.scriptNode.connect(this.audioCtx.destination);

      this.audioEnabled = true;
      if(typeof UI != 'undefined') {
        UI('c64-sound').setChecked(this.audioEnabled);
      }
    } catch(err) {
      console.log(err);
      this.audioEnabled = false;
    }

  },

  stopAudio: function() {
    if (this.scriptNode) {
      this.scriptNode.disconnect(this.audioCtx.destination);
      this.scriptNode.onaudioprocess = null;
      this.scriptNode = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(function(error) {
      });
      this.audioCtx = null;
    }

    this.audioEnabled = false;
    if(typeof UI != 'undefined') {
      UI('c64-sound').setChecked(this.audioEnabled);
    }
  },

  audioProcess: function(e) {
    var outBuffer = e.outputBuffer; 
    var channelData = outBuffer.getChannelData(0);

    if(debugger_isRunning() && !document.hidden && this.lastUpdate != g_lastUpdate) {
      this.lastUpdate = g_lastUpdate;
      var ptr = sid_getAudioBuffer();

      var view = new Float32Array(c64.HEAPF32.subarray( (ptr >> 2), (ptr >> 2) + this.audioBufferLength));  

      channelData.set(view);
    } else {
      for(var i = 0; i < this.audioBufferLength; i++) {
        channelData[i] = 0;
      }
    }
  }

}