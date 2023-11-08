var Tracks = function() {

}

Tracks.prototype = {

  clearTracks: function() {
    this.music.doc.data.tracks = [];
  },

  createTrack: function(name) {
    var trackData = {};

    var trackIndex = this.music.doc.data.tracks.length + 1;

    if(typeof name == 'undefined') {
      trackData.name = 'Track ' + trackIndex;
    } else {
      trackData.name = name;
    }

    trackData.patternInstances = [];
    var trackId = this.music.doc.data.tracks.length;
    trackData.trackId = trackId;

    this.music.doc.data.tracks.push(trackData);

    return trackId;
  },


  init: function(music) {
    this.music = music;
  },

  removePattern: function(trackId, patternIndex) {
    if(patternIndex !== false && patternIndex < this.music.doc.data.tracks[trackId].patternInstances.length) {
      this.music.doc.data.tracks[trackId].patternInstances.splice(patternIndex, 1);
    }
  },


  // TODO: maybe precalculate length when a pattern is added...(or size changed..);
  getLength: function(trackId) {
//    console.error('get length of ' + trackId);
    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;

    if(patternInstances.length == 0) {
      return 0;
    }

    var lastPatternIndex = patternInstances.length - 1;
    var lastPatternDuration = this.music.patterns.getDuration(patternInstances[lastPatternIndex].patternId);
    return patternInstances[lastPatternIndex].position + lastPatternDuration;

  },



  getPatternIndexAt: function(trackId, position) {
    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;    
    var patternIndex = false;

    for(var i = 0; i < patternInstances.length; i++) {
      if(patternInstances[i].position > position) {
        patternIndex = i;
        break;
      }
    }

    if(patternIndex === false) {
      if(patternInstances.length > 0) {
        patternIndex = patternInstances.length - 1;
      }
    } else {
      patternIndex = patternIndex - 1;
    }

    if(patternIndex < 0 || patternIndex === false) {
      return false;
    }
    return patternIndex;
  },

  getPatternIdAtIndex: function(trackId, patternIndex) {
    return this.music.doc.data.tracks[trackId].patternInstances[patternIndex];   
  },

  getPatternPositionAtIndex: function(trackId, patternIndex, position) {

    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;       

    var patternDuration = this.music.patterns.getDuration(patternInstances[patternIndex].patternId);    
    if(position >= patternInstances[patternIndex].position && position < patternInstances[patternIndex].position + patternDuration) {
      return position - patternInstances[patternIndex].position;
    }

    return false;
  },

  getPatternAt: function(trackId, position) {
    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;       
    var patternIndex = false;

    for(var i = 0; i < patternInstances.length; i++) {
      if(patternInstances[i].position > position) {
        patternIndex = i;
        break;
      }
    }

    if(patternIndex === false) {
      if(patternInstances.length > 0) {
        patternIndex = patternInstances.length - 1;
      }
    } else {
      patternIndex = patternIndex - 1;
    }

    if(patternIndex < 0 || patternIndex === false) {
      return false;
    }

    var patternDuration = this.music.patterns.getDuration(patternInstances[patternIndex].patternId);    

    if(position >= patternInstances[patternIndex].position && position < patternInstances[patternIndex].position + patternDuration) {
      return patternInstances[patternIndex].patternId;
    }

    return false;
  },


  getPatternPositionAt: function(trackId, position) {
    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;       

    var patternIndex = false;

    for(var i = 0; i < patternInstances.length; i++) {
      if(patternInstances[i].position > position) {
        patternIndex = i;
        break;
      }
    }

    if(patternIndex === false) {
      if(patternInstances.length > 0) {
        patternIndex = patternInstances.length - 1;
      }
    } else {
      patternIndex = patternIndex - 1;
    }

    if(patternIndex < 0 || patternIndex === false) {
      return false;
    }

    var patternDuration = this.music.patterns.getDuration(patternInstances[patternIndex].patternId);    

    if(position >= patternInstances[patternIndex].position && position < patternInstances[patternIndex].position + patternDuration) {
      return position - patternInstances[patternIndex].position;
    }

    return false;
  },

  getTrackData: function(trackId) {
    return this.music.doc.data.tracks[trackId];
  },

  addPattern: function(trackId, patternId, position) {
    // find where in patterns array to put it
    var insertAt = false;

    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;

    // need to check if beginning overlaps..
    for(var i = 0; i < patternInstances.length; i++) {
      if(patternInstances[i].position > position) {
        // ok, need to insert it here....
        insertAt = i;
        break;
      }
    }

    // see if it overlaps with the previous pattern..
    var previousPatternIndex = false;
    if(insertAt === false) {
      if(patternInstances.length > 0) {
        previousPatternIndex = patternInstances.length - 1;
      }
    } else {
      if(insertAt > 0) {
        previousPatternIndex = insertAt - 1;
      }
    }

    if(previousPatternIndex !== false) {
      if(previousPatternIndex >= 0) {
        var previousPatternId = patternInstances[previousPatternIndex].patternId;
        var previousPatternDuration = this.music.patterns.getDuration(previousPatternId);
        var previousPatternEnd = patternInstances[previousPatternIndex].position + previousPatternDuration;
        if(position < previousPatternEnd) {
          position = previousPatternEnd;
        }
      }
    }


    var patternInstance = {
      patternId: patternId,
      position: position
    };


    if(insertAt === false) {
      // just stick it at the end
      patternInstances.push(patternInstance);
      return patternInstances.length - 1;
    } else {
      var duration = this.music.patterns.getDuration(patternId);      

      // check it will fit
      if(position + duration > patternInstances[insertAt].position) {
        // need to shift everything up.. maybe dont need to shift if there is a gap
        var shiftBy = (position + duration) - patternInstances[insertAt].position;
        for(var i = insertAt; i < patternInstances.length; i++) {
          patternInstances[i].position += shiftBy;
        }
      }

      // splice in the pattern
      patternInstances.splice(insertAt, 0, patternInstance);
      return insertAt;
    }
  },

  getGlobalPosition: function(trackId, patternIndex, patternPosition) {
    var patternInstances = this.music.doc.data.tracks[trackId].patternInstances;
    if(patternIndex >= 0 && patternIndex < patternInstances.length) {
      return patternInstances[patternIndex].position + patternPosition;

    }
    return 0;
  }
}