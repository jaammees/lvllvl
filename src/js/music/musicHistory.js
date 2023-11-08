var MusicHistory = function() {
  this.music = null;

  this.history = [];
  this.historyLength = 0;
  this.historyPosition = 0; 

  this.changes = []; 

  this.enabled = true;

  this.entryName = '';

  this.enabled = true;
  this.newEntryEnabled = true;


}

MusicHistory.prototype = {

  init: function(music) {
    this.music = music;

  },

  setEnabled: function(enabled) {
    this.enabled = enabled;
  },

  getEnabled: function(enabled) {
    return this.enabled;
  },

  setNewEntryEnabled: function(enabled) {
    this.newEntryEnabled = enabled;
  },


  undo: function() {
    this.setEnabled(false);

    if(this.historyPosition > 0) {
      this.historyPosition--;
      if(this.historyPosition < this.historyLength) {
        var changes = this.history[this.historyPosition];

        var args = {};

        for(var i = changes.actions.length - 1; i >= 0; i--) {
          var actionName = changes.actions[i].name;
          var params = changes.actions[i].params;

          if(actionName == 'addNote') {
            this.music.patterns.eraseNote(params.patternId, params.noteId);

            // only really need to do this if the modified pattern is the displayed one
            this.music.patternView.drawPattern();
          }

          if(actionName == 'eraseNote') {
            this.music.patterns.addNote(params.patternId, params);

            // only really need to do this if the modified pattern is the displayed one
            this.music.patternView.drawPattern();
          }

          if(actionName == 'setNoteDuration') {
            this.music.patterns.setNoteDuration(params.patternId, params.noteId, params.oldDur);
            this.music.patternView.drawPattern();
          }

          if(actionName == 'setNotePitch') {
            this.music.patterns.setNotePitch(params.patternId, params.noteId, params.oldPit);
            this.music.patternView.drawPattern();
          }
  

          if(actionName == 'setNoteStart') {
            this.music.patterns.setNoteStart(params.patternId, params.noteId, params.oldStart);
            this.music.patternView.drawPattern();
          }

        }
      }
    }

    /*
    if(this.historyPosition > 0) {
      this.historyPosition--;
      if(this.historyPosition < this.historyLength) {
        var history = this.history[this.historyPosition];
        if(history.name == 'patternChanges') {

          var changes =  history.actions;
          var patternData = this.music.patterns.getPatternData(history.patternId);

          for(var i = 0; i < changes.length; i++) {
            var position = changes[i].position;
            patternData[position].start = changes[i].oldstart;
            patternData[position].instrument = changes[i].oldinstrument;
            patternData[position].pitch = changes[i].oldpitch;
            patternData[position].duration = changes[i].oldduration;
            patternData[position].startPosition = changes[i].oldstartPosition;
            patternData[position].effect = changes[i].oldeffect;
            patternData[position].effectParam = changes[i].oldeffectParam;
            patternData[position].effectParam2 = changes[i].oldeffectParam2;            

          }

          this.music.patternView.updatePattern();
          this.music.patternView.drawPattern();
        }

      }
    }
    */
    this.setEnabled(true);
  },

  redo: function() {
    this.setEnabled(false);

    if(this.historyPosition < this.historyLength ) {
      var changes = this.history[this.historyPosition];

      for(var i = 0; i < changes.actions.length; i++) {

        var actionName = changes.actions[i].name;
        var params = changes.actions[i].params;

        if(actionName == 'addNote') {
          this.music.patterns.addNote(params.patternId, params);
          // only really need to do this if the modified pattern is the displayed one
          this.music.patternView.drawPattern();

        }

        if(actionName == 'eraseNote') {
          this.music.patterns.eraseNote(params.patternId, params.noteId);

          // only really need to do this if the modified pattern is the displayed one
          this.music.patternView.drawPattern();
        }

        if(actionName == 'setNoteDuration') {
          this.music.patterns.setNoteDuration(params.patternId, params.noteId, params.newDur);
          this.music.patternView.drawPattern();
        }

        if(actionName == 'setNotePitch') {
          this.music.patterns.setNotePitch(params.patternId, params.noteId, params.newPit);
          this.music.patternView.drawPattern();
        }

        if(actionName == 'setNoteStart') {
          this.music.patterns.setNoteStart(params.patternId, params.noteId, params.newStart);
          this.music.patternView.drawPattern();

        }

      }
      this.historyPosition++;

    }

    this.setEnabled(true);
  },

  startEntry: function(name) {
    if(!this.enabled) {
      return;
    }

    if(!this.newEntryEnabled) {
      return;
    }
    // end the last entry in case wasn't ended properly
    this.endEntry();

    this.changes = [];
    this.entryName = name;
  },



  addAction: function(actionName, params) {
    if(!this.enabled) {
      return;
    }

    this.changes.push({ "name": actionName, "params": params });
  },



  endEntry: function() {
    if(!this.enabled) {
      return;
    }

    if(!this.newEntryEnabled) {
      return;
    }

    if(this.changes.length > 0) {
      this.history[this.historyPosition] = {"name": this.entryName, "actions": this.changes };
      this.historyPosition++;
      this.historyLength = this.historyPosition;
    }
    this.changes = [];
  },

  startPatternChange: function(patternId) {
    if(!this.enabled) {
      return;
    }

/*
    var patternData = this.music.patterns.getPatternData(patternId);
    this.originalPattern = [];

    for(var i = 0; i < patternData.length; i++) {

      this.originalPattern[i] = {"start": patternData[i].start, 
                            "instrument": patternData[i].instrument, 
                            "pitch": patternData[i].pitch, 
                            "duration": patternData[i].duration, 
                            "startPosition": patternData[i].startPosition,
                            "effect": patternData[i].effect,
                            "effectParam": patternData[i].effectParam,
                            "effectParam2": patternData[i].effectParam2};      
      }
*/

  },

  endPatternChange: function(patternId) {
    if(!this.enabled) {
      return ;
    }

    /*
    var patternData = this.music.patterns.getPatternData(patternId);
    this.changes = [];

    for(var i = 0; i < patternData.length; i++) {

      if(this.originalPattern[i].instrument != patternData[i].instrument ||
        this.originalPattern[i].pitch != patternData[i].pitch ||
        this.originalPattern[i].duration != patternData[i].duration ||
        this.originalPattern[i].startPosition != patternData[i].startPosition ||
        this.originalPattern[i].start != patternData[i].start ||
        this.originalPattern[i].effect != patternData[i].effect ||
        this.originalPattern[i].effectParam != patternData[i].effectParam ||
        this.originalPattern[i].effectParam2 != patternData[i].effectParam2) {

          var params = {};

          params.position = i;

          params.start = patternData[i].start;
          params.instrument = patternData[i].instrument;
          params.pitch = patternData[i].pitch;
          params.duration = patternData[i].duration;
          params.startPosition = patternData[i].startPosition;
          params.effect = patternData[i].effect;
          params.effectParam = patternData[i].effectParam;
          params.effectParam2 = patternData[i].effectParam2;

          params.oldstart = this.originalPattern[i].start;
          params.oldinstrument = this.originalPattern[i].instrument;
          params.oldpitch = this.originalPattern[i].pitch;
          params.oldduration = this.originalPattern[i].duration;
          params.oldstartPosition = this.originalPattern[i].startPosition;
          params.oldeffect = this.originalPattern[i].effect;
          params.oldeffectParam = this.originalPattern[i].effectParam;
          params.oldeffectParam2 = this.originalPattern[i].effectParam2;

          this.changes.push(params);

      }

    }

    if(this.changes.length > 0) {
      this.history[this.historyPosition] = {"name": "patternChanges", "patternId": patternId, "actions": this.changes };
      this.historyPosition++;
      this.historyLength = this.historyPosition;
    }   
    */ 

  }
}