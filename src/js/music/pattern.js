var Patterns = function() {
  this.clipboard = [];

  this.monophonic = true;

  this.noteId = 0;
  this.paramId = 0;
//  this.maxc64PatternLength = 64;
}


/*
var Note = function() {
  noteId: note id
  pos: position
  ins: instrumentId,
  pit: pitch,
  dur: duration,
  vel: velocity,
}

var Param = function() {
  paramId: param id
  pos: position
  val1:
  val2: 
  val3:  
}


var Pattern = function() {
  name:
  duration: 
  notes: []
  params: {
  
  }


}

*/

Patterns.prototype = {
  init: function(music) {
    this.music = music;
  },

  validPatternId: function(patternId) {
    if(patternId === false) {
      return false;
    }

    if(patternId >= this.music.doc.data.patterns.length) {
      return false;
    }
    return true;

  },

  createPattern: function(name, duration) {
    var patternData = {};

    if(typeof name == 'undefined') {
      patternData.name = 'Pattern';
    } else {
      patternData.name = name;
    }

    if(typeof duration == 'undefined') {
      patternData.duration = 64;
    } else {
      patternData.duration = duration;
    }

/*
    patternData.data = [];
    for(var i = 0; i < patternData.duration; i++) {
      patternData.data.push({"start": false, "instrument": 0, "pitch": 0, "duration": 0, "startPosition": i });
    }
*/

    patternData.notes = [];

    patternData.params = {
      "effects": []
    }

    var patternId = this.music.doc.data.patterns.length;

    patternData.patternId = patternId;
    this.music.doc.data.patterns.push(patternData);

    this.music.modified();

    return patternId;
  },

  getPatternCount: function() {
    return this.music.doc.data.patterns.length;
  },

  getPatternId: function(patternIndex) {
    return patternIndex;
  },

  getDuration: function(patternId) {
    return this.music.doc.data.patterns[patternId].duration;
  },

  getName: function(patternId) {
    return this.music.doc.data.patterns[patternId].name;
  },


  getNotes: function(patternId) {

    if(patternId < 0) {
      return null;
    }
    return this.music.doc.data.patterns[patternId].notes;
  },

  getNoteAt: function(patternId, position) {
    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      if(notes[i].pos === position) {
        return notes[i];
      }
    }
    return null;
  },

  getDataCopy: function(patternId) {
    // eg used by drummer to save a copy of the pattern, so it can restore it if the user cancels

return [];

/*
    var pattern = this.music.doc.patterns[patternId];

    var dataCopy = [];
    for(var i = 0; i < pattern.duration; i++) {
      var dataEntry = {};
      for(var key in pattern.data[i]) {
        if(pattern.data[i].hasOwnProperty(key)) {
          dataEntry[key] = pattern.data[i][key];
        }
      }
      dataCopy.push(dataEntry);
    }
    return dataCopy;
*/    
  },


  setFromData: function(patternId, data) {
    // used to restore the pattern data that was copied with get data copy

/*
    var pattern = this.music.doc.patterns[patternId];


//    pattern.data = $.extend(true, {}, data);
//    pattern.duration = data.length;

    pattern.data = [];
    pattern.duration = data.length;

    for(var i = 0; i < pattern.duration; i++) {
      var dataEntry = {};
      for(var key in data[i]) {
        if(data[i].hasOwnProperty(key)) {
          dataEntry[key] = data[i][key];
        }
      }
      pattern.data.push(dataEntry);
    }
*/    
  },


/*
  setLength: function(patternId, duration) {
    alert('pattern set length, should be set duration');
    console.error('should use set duration?');
    var pattern = this.music.doc.patterns[patternId];

    while(duration > pattern.data.length) {
      pattern.data.push({"start": false, "instrument": 0, "pitch": 0, "duration": 0, "startPosition": pattern.data.length -1, "effect": 0, "effectParam": 0, "effectParam2": 0 });
    }

    if(pattern.data.length > duration) {
//      alert('shorten to ' + duration);
      pattern.data.splice(duration, pattern.data.length - duration);
    }

    pattern.duration = duration;
  },
  */

  usesInstrument: function(patternId, instrumentId) {
    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      if(notes[i].ins == instrumentId) {
        return true;
      }
    }

    return false;
  },

  removeInstrument: function(patternId, instrumentId) {
    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      if(notes[i].ins == instrumentId) {
        this.eraseNote(patternId, notes[i].noteId);
      }
    }
  },


  removeInstrumentFromAllPatterns: function(instrumentId) {
    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
      this.removeInstrument(this.music.doc.data.patterns[i].patternId, instrumentId);
    }

  },

  shiftInstrumentsAbove: function(patternId, instrumentId, shiftAmount) {
    console.error('should get rid of this');
    var notes = this.getNotes(patternId);

//    var pattern = this.music.doc.patterns[patternId];

    if(typeof shiftAmount == 'undefined') {
      shiftAmount = -1;
    }

    for(var i = 0; i < notes.lenght; i++) {
      if(notes[i].ins == instrumentId) {
        notes[i].ins += shiftAmount;
      }
    }
  },

  usesFilter: function(patternId, filterId) {
    console.error('uses filter');

    /*
    var pattern = this.music.doc.patterns[patternId];

    for(var i = 0; i < pattern.data.length; i++) {
      if(pattern.data[i].effect == 10 && pattern.data[i].effectParam == filterId) {
        return true;
      }
    }
    */
    return false;
  },

  removeFilter: function(patternId, filterId) {
    console.error('remove filter');

    /*
    var pattern = this.music.doc.patterns[patternId];

    for(var i = 0; i < pattern.data.length; i++) {
      if(pattern.data[i].effect == 10 && pattern.data[i].effectParam == filterId) {
        pattern.data[i].effect = 0;
        pattern.data[i].effectParam = 0;
      }
    }
    */
    return false;
  },

  shiftFiltersAbove: function(patternId, filterId, shiftAmount) {
    console.error('shift filters above');

    /*
    var pattern = this.music.doc.patterns[patternId];

    if(typeof shiftAmount == 'undefined') {
      shiftAmount = -1;
    }
    for(var i = 0; i < pattern.data.length; i++) {
      if(pattern.data[i].effect == 10 && pattern.data[i].effectParam > filterId) {
        pattern.data[i].effectParam += shiftAmount;
      }
    }
    */
  },

  setDuration: function(patternId, duration) {
    var pattern = this.music.doc.data.patterns[patternId];
    pattern.duration = duration;

/*
    while(duration > pattern.data.length) {
      pattern.data.push({"start": false, "instrument": 0, "pitch": 0, "duration": 0, "startPosition": pattern.data.length -1,"effect": 0, "effectParam": 0, "effectParam2": 0 });
    }

    if(pattern.data.length > duration) {
      pattern.data.splice(duration, pattern.data.length - duration);
    }
*/    
  },

/*
  // CAN DELETE THIS???!!!
  getPatternDataOld: function(patternId) {
    console.error('need to shift this');
    var c64Patterns = Array();

    var patternData = Array();

    var lastInstrument = -1;
    var currentInstrument = 0;
    var i = 0;

    var startPosition = 0;

    while(i < this.data.length) {
      var instrument = parseInt(this.data[i].instrument);

      var pitch = 0;
      var duration = 0;   
      if(instrument == 0) {
        // silence
        var totalDuration = 0;
        var first = true;
        lastInstrument = 0;

        while(i < this.data.length && this.data[i].instrument == 0) {
          var effect = 0;
          var effectParam = 0;
          if(this.data[i].effect) {
            effect = parseInt(this.data[i].effect);
            effectParam = parseInt(this.data[i].effectParam);
            effectParam2 = parseInt(this.data[i].effectParam2);


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
            patternData.push(0xbe);
          } else {
            patternData.push(0xbd);
          }
          patternData.push(0x00);

          patternData.push(effect);
          patternData.push(effectParam);

//          patternData.push(0x00);
//          patternData.push(0x00);


          if(patternData.length >= this.maxc64PatternLength * 4) {
            // length has gone over the max allowed, split this up into multiple patterns
//            patternData.push(0xff);
//            patternData.push(0x00);
//            patternData.push(0x00);
//            patternData.push(0x00);    
            c64Patterns.push(patternData);
            patternData = [];
          }


        }


      } else if(this.data[i].start) {

        // note start
        var totalDuration = this.data[i].duration;
        var portamento = this.data[i].portamento;

        var effect = 0;
        var effectParam = 0;
        var effectParam2 = 0;
        pitch = this.data[i].pitch;

        if(this.data[i].effect) {
          effect = parseInt(this.data[i].effect);
          effectParam = parseInt(this.data[i].effectParam);
          effectParam2 = parseInt(this.data[i].effectParam2);

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
        if(effect == 3) {
          //portamento to effect
          patternData.push(effectParam2 + 0x60);
        } else {
          patternData.push(pitch + 0x60);
        }
        patternData.push(instrument);
        patternData.push(effect);
        patternData.push(effectParam);

//        patternData.push(0x00);
//        patternData.push(0x00);
        totalDuration--;

        if(patternData.length >= this.maxc64PatternLength * 4) {
          // length has gone over the max allowed, split this up into multiple patterns
          c64Patterns.push(patternData);
          patternData = [];
        }


        lastInstrument = instrument;

        while(totalDuration >0){

          var effect = 0;
          var effectParam = 0;
          var effectParam2 = 0;
          if(this.data[i].effect) {
            effect = parseInt(this.data[i].effect);
            effectParam = parseInt(this.data[i].effectParam);
            effectParam2 = parseInt(this.data[i].effectParam2);

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
            patternData.push(effectParam2 + 0x60);
          } else {
            patternData.push(0xbd);
          }
          patternData.push(0x00);
          patternData.push(effect);
          patternData.push(effectParam);
//          patternData.push(0x00);
//          patternData.push(0x00);
          totalDuration--;          
          i++;

          if(patternData.length >= this.maxc64PatternLength * 4) {
            // length has gone over the max allowed, split this up into multiple patterns
            c64Patterns.push(patternData);
            patternData = [];
          }


        }

      } else {
        patternData.push(0xbd);
        patternData.push(0x00);
        patternData.push(0x00);
        patternData.push(0x00);

        i++;
        totalDuration++;

        console.log('shouldnt be here!!!!!!');
      }

         
    }

    if(patternData.length > 0) {
      c64Patterns.push(patternData);
    }


//console.log(c64Patterns);
//console.log(patternData);
//    return patternData;
    return c64Patterns;
  },
*/

//  setNoteStart: function(patternId, notePosition, newStart) {
  setNoteStart: function(patternId, noteId, newStart, checkOverlap) {

//    var pattern = this.music.doc.patterns[patternId];
//    var notes = this.music.doc.patterns[patternId].notes;
    var note = this.getNote(patternId, noteId);
    if(!note) {
      console.error('no note!');
      return false;
    }


    // history
    var noteDetails = {
      patternId: patternId,
      noteId: noteId,
      oldStart: note.pos,
      newStart: newStart
    };
    this.music.history.addAction('setNoteStart', noteDetails);
    

    note.pos = newStart;

    if(this.monophonic && (typeof checkOverlap == 'undefined' || checkOverlap)) {
      this.checkNoteOverlap(patternId, noteId);

    }


  },

  getNoteDuration: function(patternId, noteId) {
    var note = this.getNote(patternId, noteId);
    return note.dur;
  },


  getNote: function(patternId, noteId) {
    var pattern = this.music.doc.data.patterns[patternId];
    for(var i = 0; i < pattern.notes.length; i++) {
      if(pattern.notes[i].noteId == noteId) {
        return pattern.notes[i];
      }
    }

    return null;
  },

  getNoteId: function(patternId, position, pitch) {
    var notes = this.music.doc.data.patterns[patternId].notes;
    for(var i = 0; i < notes.length; i++) {
      if(notes[i].pit == pitch 
         && notes[i].pos <= position 
         && (notes[i].pos + notes[i].dur) > position) {
        return notes[i].noteId;
      }
    }
    return false;
  },


  // modify notes so there is no overlap
  checkNoteOverlap: function(patternId, noteId) {
    var notes = this.getNotes(patternId);
    var note = this.getNote(patternId, noteId);

    var noteStart = note.pos;
    var noteEnd = note.pos + note.dur;

    for(var i = 0; i < notes.length; i++) {
      if(notes[i].noteId != noteId) {
        if(notes[i].pos < noteStart && notes[i].pos + notes[i].dur > noteStart) {
          // check note begins before start and ends after start

          var newDuration = noteStart - notes[i].pos;

          // history
          var noteDetails = {
            patternId: patternId,
            noteId: notes[i].noteId,
            oldDur: notes[i].dur,
            newDur: newDuration
          };
          this.music.history.addAction('setNoteDuration', noteDetails);
      
          notes[i].dur = newDuration;

        } else if(notes[i].pos >= noteStart && notes[i].pos < noteEnd) {
          // check note begins within passed in note
          if(notes[i].pos + notes[i].dur <= noteEnd) {
            // note also ends within, so erase it
            this.eraseNote(patternId, notes[i].noteId);
            // erasing a note, so need to move counter backwards
            i--;
          } else {
            // note ends after so change start pos 
            var newDuration = notes[i].dur - (noteEnd - notes[i].pos);

            // history
            var noteDetails = {
              patternId: patternId,
              noteId: notes[i].noteId,
              oldDur: notes[i].dur,
              newDur: newDuration
            };
            this.music.history.addAction('setNoteDuration', noteDetails);
  
            notes[i].dur = newDuration;


            // history
            var noteDetails = {
              patternId: patternId,
              noteId: notes[i].noteId,
              oldStart: notes[i].pos,
              newStart: noteEnd
            };
            this.music.history.addAction('setNoteStart', noteDetails);

            notes[i].pos = noteEnd;  

          }
        }
      }
    }
  },
  setNotePitch: function(patternId, noteId, newPitch) {

//    var pattern = this.music.doc.data.patterns[patternId];
    var note = this.getNote(patternId, noteId);

    note.pit = newPitch;
    this.music.modified();
  },

  setNoteDuration: function(patternId, noteId, newDuration) {

    var pattern = this.music.doc.data.patterns[patternId];
    var note = this.getNote(patternId, noteId);

    if(note.pos + newDuration > pattern.duration) {
      return false;
    }

    var currentDuration = note.dur;

    if(currentDuration == newDuration) {
      return false;
    }

    var noteDetails = {
      patternId: patternId,
      noteId: noteId,
      oldDur: note.dur,
      newDur: newDuration
    };
    this.music.history.addAction('setNoteDuration', noteDetails);

    note.dur = newDuration;

    // dont want to call if in middle of undo/redo
    // should do different test?
    if(this.music.history.getEnabled()) {
      if(this.monophonic && newDuration > currentDuration) {
        this.checkNoteOverlap(patternId, noteId);
        // need to check overlap.
      }
    }

    this.music.modified();
    return;
  },

  newParamId: function() {
    return this.paramId++;
  },

  getParams: function(patternId, paramType) {
    var pattern = this.music.doc.data.patterns[patternId];

    if(typeof pattern.params[paramType] == 'undefined') {
      return [];
    }

    return pattern.params[paramType];

  },


  // param type is only effects at the moment?
  addParam: function(patternId, paramType, position, values) {
    var pattern = this.music.doc.data.patterns[patternId];

    if(typeof pattern.params[paramType] == 'undefined') {
      pattern.params[paramType] = [];
    }
    var params = pattern.params[paramType];

    var param = {};
    param.paramId = this.newParamId();
    param.pos = position;
    param.values = {};
    for(var key in values) {
      if(values.hasOwnProperty(key)) {
        param.values[key] = values[key];
      }
    }


    var replace = false;
    for(var i = 0; i < params.length; i++) {
      if(params[i].pos == position) {
        params[i] = param;
        replace = true;
      }
    }

    if(!replace) {
      params.push(param);
    }

    this.music.modified();
    return param.paramId;
  },

  removeParam: function(patternId, paramType, position) {
    var pattern = this.music.doc.data.patterns[patternId];
    if(typeof pattern.params[paramType] == 'undefined') {
      return null;
    }
    var paramIndex = false;

    var params = pattern.params[paramType];
    for(var i = 0; i < params.length; i++) {
      if(params[i].position == position) {
        paramIndex = i;
        break;
      }
    }

    params.splice(paramIndex, 1);
    this.music.modified();

  },

  getParamAt: function(patternId, paramType, position) {
    var pattern = this.music.doc.data.patterns[patternId];
    if(typeof pattern.params[paramType] == 'undefined') {
      console.error('unknown param type: ' + paramType);
      return null;
    }
    var params = pattern.params[paramType];
    for(var i = 0; i < params.length; i++) {
      if(params[i].pos == position) {
        return params[i];
      }
    }
    return null;
  },


  // set noteId to the max note id, so the next one will be unique
  getMaxNoteId: function() {
    var patterns = this.music.doc.data.patterns;

    for(var i = 0; i < patterns.length; i++) {
      var pattern = patterns[i];
      for(var j = 0; j < pattern.notes.length; j++) {
        if(this.noteId <= pattern.notes[j].noteId) {
          this.noteId = pattern.notes[j].noteId + 1;
        }
      }

      // do the same for params
      for(var paramType in pattern.params) {
        var params = pattern.params[paramType];
        for(var j = 0; j < params.length; j++) {
          if(this.paramId <= params[j].paramId) {
            this.paramId = params[j].paramId + 1;
          }
        }
      }
    }
  },

  genNoteId: function() {
    return this.noteId++;
  },

  addNote: function(patternId, args) { //position, instrument, pitch, duration) {
    var position = false;
    var pitch = false;
    var duration = 1;
    var instrumentId = false;

    if(typeof args.position != 'undefined') {
      position = args.position;
    }

    if(typeof args.pos !== 'undefined') {
      position = args.pos;
    }

    if(typeof args.pitch != 'undefined') {
      pitch = args.pitch;
    }

    if(typeof args.pit != 'undefined') {
      pitch = args.pit;
    }

    if(typeof args.duration != 'undefined') {
      duration = args.duration;
    }

    if(typeof args.dur != 'undefined') {
      duration = args.dur;
    }

    if(typeof args.instrumentId != 'undefined') {
      instrumentId = args.instrumentId;
    }

    if(typeof args.ins != 'undefined') {
      instrumentId = args.ins;
    }

    if(position === false || pitch === false) {
      return false;
    }


    var noteId = 0;
    if(typeof args.noteId != 'undefined') {
      noteId = args.noteId;
    } else {
      noteId = this.genNoteId();

    }

    var pattern = this.music.doc.data.patterns[patternId];

    if(position < 0 || position >= pattern.duration) {
      console.error('position out of bounds');
      return false;
    }

    if(position + duration > pattern.duration) {
      // doesn't fit..
      duration = pattern.duration - position;
      if(duration <= 0) {
        console.error('duration is negative' + duration);
        return false;
      }
    }


    var note = {};
    note.noteId = noteId;
    note.pos = position;
    note.pit = pitch;
    note.dur = duration;
    note.ins = instrumentId;
    note.vel = 1;

    // find where to stick the note..
    var insertAt = false;
    for(var i = 0; i < pattern.notes.length; i++) {
      if(pattern.notes[i].pos > note.pos) {
        insertAt = i;
        break;
      }
    }

    // just put at end for now..
    pattern.notes.push(note);

    var noteDetails = {};
    for(var key in note) {
      if(note.hasOwnProperty(key)) {
        noteDetails[key] = note[key];
      }
    }
    noteDetails.patternId = patternId;

    this.music.history.addAction('addNote', noteDetails);

    if(this.monophonic) {
      this.checkNoteOverlap(patternId, note.noteId);
    }


    this.music.modified();

    return note.noteId;
  },

  // TODO: should really be part of patternView?
  setNoteSelected: function(patternId, noteId, selected) {
    var note = this.getNote(patternId, noteId);
    note.sel = selected;
  },

  getNoteSelected: function(patternId, noteId) {
    var note = this.getNote(patternId, noteId);
    if(!note) {
      return false;
    }
    if(typeof note.sel == 'undefined') {
      return false;
    }

    return note.sel;
  },


  // select notes within a box selection
  selectNotesIn: function(patternId, fromPosition, toPosition, fromPitch, toPitch) {
    var notes = this.getNotes(patternId);

    for(var i = 0; i < notes.length; i++) {
      var noteStart = notes[i].pos;
      var noteEnd = noteStart + notes[i].dur;

      if(noteStart <= toPosition && noteEnd > fromPosition) {
        if(notes[i].pit >= fromPitch && notes[i].pit <= toPitch) {
          notes[i].sel = true;
        }
      }
    }

  },

  selectAllNotes: function(patternId) {
    var notes = this.getNotes(patternId);

    for(var i = 0; i < notes.length; i++) {
      notes[i].sel = true;
    }
  },

  deselectAllNotes: function(patternId) {
    var notes = this.getNotes(patternId);

    for(var i = 0; i < notes.length; i++) {
      notes[i].sel = false;
    }
  },

  copySelectedNotes: function(patternId) {
    if(patternId == -1) {
      return;
    }

    this.clipboard = [];

    var minPosition = this.getDuration(patternId);
    var lastSelectedPosition = 0;

    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      if(typeof notes[i].sel !== 'undefined' && notes[i].sel) {
        var note = notes[i];

        if(note.pos < minPosition) {
          minPosition = note.pos;
        }
        if(note.pos > lastSelectedPosition) {
          lastSelectedPosition = note.pos;
        }

        var data = {
          "pos": note.pos,
          "ins": note.ins,
          "pit": note.pit,
          "dur": note.dur,
          "vel": note.vel
        };

        this.clipboard.push(data);

      }
    }

    // loop from min to last selected and copy effects

    // move all clipboard notes to be offset from zero
    for(var i = 0; i < this.clipboard.length; i++) {
      this.clipboard[i].pos -= minPosition;
    }

  },


  clearSelectedNotes: function(patternId) {

    if(patternId == -1) {
      return;
    }

    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      if(typeof notes[i].sel != 'undefined' && notes[i].sel) {
        this.eraseNote(patternId, notes[i].noteId);
        i--;
      }
    }



  },

  offsetSelectedNotes: function(patternId, positionOffset, pitchOffset) {
    console.log('need to check bounds and note overlap');


    var notes = this.getNotes(patternId);


    if(this.monophonic) {
      // prob want to move silence as well, so clear everything in the range
      var patternDuration = this.getDuration(patternId);

      var rangeStart = patternDuration;
      var rangeEnd = 0;

      for(var i = 0; i < notes.length; i++) {
        if(typeof notes[i].sel != 'undefined' && notes[i].sel) {
          if(notes[i].pos < rangeStart) {
            rangeStart = notes[i].pos;
          }
          if(notes[i].pos + notes[i].dur > rangeEnd) {
            rangeEnd = notes[i].pos + notes[i].dur;
          }
        }
      }

      rangeStart += positionOffset;
      rangeEnd += positionOffset;
      if(rangeStart < 0) {
        rangeStart = 0;
      }
      if(rangeEnd < 0) {
        rangeEnd = 0;
      }
      if(rangeStart >= patternDuration) {
        rangeStart = patternDuration - 1;
      }
      if(rangeEnd >= patternDuration) {
        rangeEnd = patternDuration - 1;
      }

      // clear all notes between range start and range end, excluding selected notes
      for(var i = 0; i < notes.length; i++) {
        if(typeof notes[i].sel == 'undefined' || !notes[i].sel) {
          var noteStart = notes[i].pos;
          var noteEnd = notes[i].pos + notes[i].dur;

          if(noteEnd > rangeStart && noteStart < rangeStart) {
            // need to shorten note
            var newDuration = rangeStart - notes[i].pos;

            // history
            var noteDetails = {
              patternId: patternId,
              noteId: notes[i].noteId,
              oldDur: notes[i].dur,
              newDur: newDuration
            };
            this.music.history.addAction('setNoteDuration', noteDetails);

            notes[i].dur = newDuration;
          } else if(noteStart >= rangeStart && noteEnd <= rangeEnd) {
            // delete the note
            this.eraseNote(patternId, notes[i].noteId);
            i--;
          } else if(noteStart < rangeEnd && noteEnd > rangeEnd) {
            // need to cut off start and keep end the same

            var newDuration = noteEnd - rangeEnd;
            // history
            var noteDetails = {
              patternId: patternId,
              noteId: notes[i].noteId,
              oldDur: notes[i].dur,
              newDur: newDuration
            };
            this.music.history.addAction('setNoteDuration', noteDetails);

            
            notes[i].dur = newDuration;

            // history
            var noteDetails = {
              patternId: patternId,
              noteId: notes[i].noteId,
              oldStart: notes[i].pos,
              newStart: rangeEnd
            };
            this.music.history.addAction('setNoteStart', noteDetails);

            notes[i].pos = rangeEnd;
          }
        }
      }

    }


    for(var i = 0; i < notes.length; i++) {
      if(typeof notes[i].sel != 'undefined' && notes[i].sel) {
        var newStart = notes[i].pos + positionOffset;
        // history
        var noteDetails = {
          patternId: patternId,
          noteId: notes[i].noteId,
          oldStart: notes[i].pos,
          newStart: newStart
        };
        this.music.history.addAction('setNoteStart', noteDetails);
        
        notes[i].pos = newStart;

        var newPitch = notes[i].pit + pitchOffset;

        var noteDetails = {
          patternId: patternId,
          noteId: notes[i].noteId,
          oldPit: notes[i].pit,
          newPit: newPitch
        };
        this.music.history.addAction('setNotePitch', noteDetails);
    
        notes[i].pit = newPitch;
      }
    }
    this.music.modified();


  },
  // paste at new position and pitch
  pasteNotes: function(patternId, pastePosition, pitchOffset) {
    // clear selected notes, want to select new pasted notes
    var notes = this.getNotes(patternId);
    for(var i = 0; i < notes.length; i++) {
      notes[i].sel = false;
    }


    var maxPosition = 0;
    var patternDuration = this.getDuration(patternId);

    if(this.monophonic) {
      // clear notes in the paste range
      var rangeStart = patternDuration;
      var rangeEnd = 0;
      for(var i = 0; i < this.clipboard.length; i++) {
        if(this.clipboard[i].pos < rangeStart) {
          rangeStart = this.clipboard[i].pos;
        }
        if(this.clipboard[i].pos + this.clipboard[i].dur > rangeEnd) {
          rangeEnd = this.clipboard[i].pos + this.clipboard[i].dur;
        }
      }

      rangeStart += pastePosition;
      rangeEnd += pastePosition;

      // clear all notes between range start and range end, excluding selected notes
      for(var i = 0; i < notes.length; i++) {
        var noteStart = notes[i].pos;
        var noteEnd = notes[i].pos + notes[i].dur;

        if(noteEnd > rangeStart && noteStart < rangeStart) {
          // need to shorten note
          notes[i].dur = rangeStart - notes[i].pos;
        } else if(noteStart >= rangeStart && noteEnd <= rangeEnd) {
          // delete the note
          this.eraseNote(patternId, notes[i].noteId);
          i--;
        } else if(noteStart < rangeEnd && noteEnd > rangeEnd) {
          // need to cut off start and keep end the same
          notes[i].dur = noteEnd - rangeEnd;
          notes[i].pos = rangeEnd;
        }
      }
    }

//    this.music.history.startPatternChange(patternId);
    for(var i = 0; i < this.clipboard.length; i++) {
      var note = {};
      note.position = this.clipboard[i].pos + pastePosition;
      note.pitch = this.clipboard[i].pit + pitchOffset;
      note.instrumentId = this.clipboard[i].ins;
      note.duration = this.clipboard[i].dur;
       
      if(note.position >= 0 && note.position < patternDuration) {
        if(note.position + note.duration > patternDuration) {
          note.duration = patternDuration - note.position;
        }

        var noteId = this.addNote(patternId, note)
        if(noteId !== false) {
          this.setNoteSelected(patternId, noteId, true);

          if(note.position + note.duration > maxPosition) {
            maxPosition = note.position + note.duration;
          }
        }
      }
    }

    this.music.modified();

//    this.music.history.endPatternChange();
    return maxPosition;
  },


  clearPatterns: function() {
    this.music.doc.data.patterns = [];
  },

  clear: function(patternId) {
    var pattern = this.music.doc.data.patterns[patternId];

    pattern.notes = [];

    this.music.modified();

  },

  eraseNote: function(patternId, noteId) {
    var pattern = this.music.doc.data.patterns[patternId];
    var notes = this.getNotes(patternId);
    var noteIndex = false;
    for(var i = 0; i < notes.length; i++) {
      if(notes[i].noteId == noteId) {
        noteIndex = i;
        break;
      }
    }

    var note = notes[i];

    var noteDetails = {};
    for(var key in note) {
      if(note.hasOwnProperty(key)) {
        noteDetails[key] = note[key];
      }
    }
    noteDetails.patternId = patternId;
    console.error('erase note');
    console.log(noteDetails);
    this.music.history.addAction('eraseNote', noteDetails);

    notes.splice(noteIndex, 1);
    this.music.modified();

  },

  instrumentUsed: function(instrumentId) {
    // check if instrument is in use
    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
      if(this.usesInstrument(this.music.doc.data.patterns[i].patternId, instrumentID)) {
        return true;
      }
    }
    return false;
  }
}
