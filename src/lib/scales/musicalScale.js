/**
 * MusicalScale
 * generate a scale of music
 * https://codepen.io/jakealbaugh/pen/NrdEYL/
 *
 * @param key {String} 
     the root of the key. flats will be converted to sharps.
       C, C#, D, D#, E, F, F#, G, G#, A, A#, B
 * @param mode {String} 
     desired mode.
       ionian, dorian, phrygian, lydian, mixolydian, aeolian, locrian, 
     can also pass in:
       major, minor, melodic, harmonic
 *
 * @return {Object}
     _scale: scale info
     key: the scale key
     mode: the scale mode id
     notes: an array of notes
       step: index of note in key
       note: the actual note
       rel_octave: 0 || 1, in root octave or next
       triad: major, minor, diminished, or augmented triad for this note
         interval: I, ii, etc
         type: min, maj, dim, aug
         notes: array of notes in the triad
           note: the note
           rel_octave: 0 || 1 || 2, relative to key root octave
 */

class MusicalScale {
  constructor(params) {
    this.dict = this._loadDictionary();
    let errors = this._errors(params);
    if(errors) return;
    this.updateScale = this.pubUpdateScale;

    this._loadScale(params);
  };
  
  pubUpdateScale(params) {
    let errors = this._errors(params);
    if(errors) return;
    this._loadScale(params);
  };
  
  _loadScale(params) {
    // clean up the key param
    this.key = this._paramKey(params.key);
    // set the mode
    this.mode = params.mode;
    this.notes = [];
    this._scale = this.dict.scales[this._paramMode(this.mode)];
    
    // notes to cycle through
    let keys = this.dict.keys;
    // starting index for key loop
    let offset = keys.indexOf(this.key);
    for(let s = 0; s < this._scale.steps.length; s++) {
      let step = this._scale.steps[s];
      let idx = (offset + step) % keys.length;
      // relative octave. 0 = same as root, 1 = next ocave up
      let rel_octave = (offset + step) > keys.length - 1 ? 1 : 0;
      // generate the relative triads
      let triad = this._genTriad(s, idx, rel_octave, this._scale.triads[s]);
      // define the note
      let note = { step: s, note: keys[idx], rel_octave: rel_octave, triad: triad };
      // add the note
      this.notes.push(note);
    }
  };
  
  // create a chord of notes based on chord type
  _genTriad(s, offset, octave, t) {
    // get the steps for this chord type
    let steps = this.dict.triads[t];
    // instantiate the chord
    let chord = { type: t, interval: this._intervalFromType(s, t), notes: [] };
    // load the notes
    let keys = this.dict.keys;
    for(let i = 0; i < steps.length; i++) {
      let step = steps[i];
      let idx = (offset + step) % keys.length;
      // relative octave to base
      let rel_octave = (offset + step) > keys.length - 1 ? octave + 1 : octave;
      // define the note
      chord.notes.push({ note: keys[idx], rel_octave: rel_octave });
    }
    return chord;
  };
  
  // proper interval notation from the step and type
  _intervalFromType(step, type) {
    let steps = 'i ii iii iv v vi vii'.split(' ');
    let s = steps[step];
    switch(type) {
      case 'maj':
        s = s.toUpperCase(); break;
      case 'min':
        s = s; break;
      case 'aug':
        s = s.toUpperCase() + '+'; break;
      case 'dim':
        s = s + '°'; break;
    }
    return s;
  };
  
  _errors(params) {
    if(this.dict.keys.indexOf(params.key) === -1) {
      if(Object.keys(this.dict.flat_sharp).indexOf(params.key) === -1) {
        return console.error(`${params.key} is an invalid key. ${this.dict.keys.join(', ')}`);
      }
    } else if(this.dict.modes.indexOf(params.mode) === -1) {
      return console.error(`${params.mode} is an invalid mode. ${this.dict.modes.join(', ')}`);
    } else {
      return false;
    }
  };
  
  _loadDictionary() {
    return {
      keys: 'C C# D D# E F F# G G# A A# B'.split(' '),
      scales: {
        ion: {
          name: 'Ionian',
          steps: this._genSteps('W W H W W W H'),
          dominance: [3,0,1,0,2,0,1],
          triads: this._genTriads(0)
        },
        dor: {
          name: 'Dorian',
          steps: this._genSteps('W H W W W H W'),
          dominance: [3,0,1,0,2,2,1],
          triads: this._genTriads(1)
        },
        phr: {
          name: 'Phrygian',
          steps: this._genSteps('H W W W H W W'),
          dominance: [3,2,1,0,2,0,1],
          triads: this._genTriads(2)
        },
        lyd: {
          name: 'Lydian',
          steps: this._genSteps('W W W H W W H'),
          dominance: [3,0,1,2,2,0,1],
          triads: this._genTriads(3)
        },
        mix: {
          name: 'Mixolydian',
          steps: this._genSteps('W W H W W H W'),
          dominance: [3,0,1,0,2,0,2],
          triads: this._genTriads(4)
        },
        aeo: {
          name: 'Aeolian',
          steps: this._genSteps('W H W W H W W'),
          dominance: [3,0,1,0,2,0,1],
          triads: this._genTriads(5)
        },
        loc: {
          name: 'Locrian',
          steps: this._genSteps('H W W H W W W'),
          dominance: [3,0,1,0,3,0,0],
          triads: this._genTriads(6)
        },
        mel: {
          name: 'Melodic Minor',
          steps: this._genSteps('W H W W W W H'),
          dominance: [3,0,1,0,3,0,0],
          triads: 'min min aug maj maj dim dim'.split(' ')
        },
        har: {
          name: 'Harmonic Minor',
          steps: this._genSteps('W H W W H WH H'),
          dominance: [3,0,1,0,3,0,0],
          triads: 'min dim aug min maj maj dim'.split(' ')
        }
      },
      modes: [
        'ionian', 'dorian', 'phrygian', 
        'lydian', 'mixolydian', 'aeolian',
        'locrian', 'major', 'minor', 
        'melodic', 'harmonic'
      ],
      flat_sharp: {
        Cb: 'B',
        Db: 'C#',
        Eb: 'D#',
        Fb: 'E',
        Gb: 'F#',
        Ab: 'G#',
        Bb: 'A#'
      },
      triads: {
        maj: [0,4,7],
        min: [0,3,7],
        dim: [0,3,6],
        aug: [0,4,8]
      }
    };
  };
    
  _paramMode(mode) {
    return {
      minor: 'aeo',
      major: 'ion',
      ionian: 'ion',
      dorian: 'dor',
      phrygian: 'phr',
      lydian: 'lyd',
      mixolydian: 'mix',
      aeolian: 'aeo',
      locrian: 'loc',
      melodic: 'mel',
      harmonic: 'har'
    }[mode];
  };
  
  _paramKey(key) {
    if(this.dict.flat_sharp[key]) return this.dict.flat_sharp[key];
    return key;
  };

  _genTriads(offset) {
    // this is ionian, each mode bumps up one offset.
    let base = 'maj min min maj maj min dim'.split(' ');
    let triads = [];
    for(let i = 0; i < base.length; i++) {
      triads.push(base[(i + offset) % base.length]);
    }
    return triads;
  };
  
  _genSteps(steps_str) {
    let arr = steps_str.split(' ');
    let steps = [0];
    let step = 0;
    for(let i = 0; i < arr.length - 1; i++) {
      let inc = 0;
      switch(arr[i]) {
        case 'W':
          inc = 2; break;
        case 'H':
          inc = 1; break;
        case 'WH':
          inc = 3; break;
      }
      step += inc;
      steps.push(step);
    }
    return steps;
  };
};

/**
  ArpeggioPatterns
  https://codepen.io/jakealbaugh/pen/PzpzEO/
  returns arrays of arpeggio patterns for a given length of notes
  @param steps {Integer} number of steps
  @return {Object}
    patterns: {Array} of arpeggiated index patterns
 */

class ArpeggioPatterns {
  constructor(params) {
    this.steps = params.steps;
    this._loadPatterns();
    this.updatePatterns = this.pubUpdatePatterns;
  };
  
  pubUpdatePatterns(params) {
    this.steps = params.steps;
    this._loadPatterns();
  };
  
  _loadPatterns() {
    this.arr = [];
    this.patterns = [];
    for(let i = 0; i < this.steps; i++) { this.arr.push(i); }
    this._used = [];
    this.permutations = this._permute(this.arr);
    this.looped = this._loop();
    this.patterns = {
      straight: this.permutations,
      looped: this.looped
    };
  };
  
  _permute(input, permutations) {
    permutations = permutations || [];
    var i, ch;
    for (i = 0; i < input.length; i++) {
      ch = input.splice(i, 1)[0];
      this._used.push(ch);
      if (input.length === 0) {
        permutations.push(this._used.slice());
      }
      this._permute(input, permutations);
      input.splice(i, 0, ch);
      this._used.pop();
    }
    return permutations;
  };
  
  _loop() {
    let looped = [];
    for(let p = 0; p < this.permutations.length; p++) {
      let perm = this.permutations[p];
      let arr = Array.from(perm);
      for(let x = 1; x < perm.length - 1; x++) {
        arr.push(perm[perm.length - 1 - x]);
      }
      looped.push(arr);
    }
    return looped;
  };
  
};

