var Scales = function() {

  this.scales = {
    "major": {
      name: 'Major',
      steps:     'T T s T T T s',//this._genSteps('W W H W W W H'),
      intervals: [2,2,1,2,2,2,1]
    },
    "melodic": {
      name: 'Melodic Minor',
      steps:     'T s T T T T s',//this._genSteps('W H W W W W H'),
      intervals: [2,1,2,2,2,2,1]
    },
    "harmonic": {
      name: 'Harmonic Minor',
      steps:     'T s T T s Ts s',//this._genSteps('W H W W H WH H'),
      intervals: [2,1,2,2,1,3, 1]
    },    
    "dorian": {
      name: 'Dorian',
      steps:     'T s T T T s T',//this._genSteps('W H W W W H W'),
      intervals: [2,1,2,2,2,1,2]      
    },
    "phrygian": {
      name: 'Phrygian',
      steps:     's T T T s T T',//this._genSteps('H W W W H W W'),
      intervals: [1,2,2,2,1,2,2]      
    },
    "lydian": {
      name: 'Lydian',
      steps:     'T T T s T T s',//this._genSteps('W W W H W W H'),
      intervals: [2,2,2,1,2,2,1]
    },
    "mixolydian": {
      name: 'Mixolydian',
      steps:     'T T s T T s T',//this._genSteps('W W H W W H W'),
      intervals: [2,2,1,2,2,1,2]
    },
    "aeolian": {
      name: 'Aeolian',
      steps:     'T s T T s T T',//this._genSteps('W H W W H W W'),
      intervals: [2,1,2,2,1,2,2]
    },
    "locrian": {
      name: 'Locrian',
      steps:     's T T s T T T',//this._genSteps('H W W H W W W'),
      intervals: [1,2,2,1,2,2,2]      
    },
  };
}

Scales.prototype = {
  init: function() {

  },


  getIntervals: function(scale) {
    return this.scales[scale].intervals;

  }
}