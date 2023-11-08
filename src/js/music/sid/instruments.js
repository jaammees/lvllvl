function LightenDarkenColor(col,amt) {

  var r = (col >> 16) + amt;

  if ( r > 255 ) r = 255;
  else if  (r < 0) r = 0;

  var b = ((col >> 8) & 0x00FF) + amt;

  if ( b > 255 ) b = 255;
  else if  (b < 0) b = 0;

  var g = (col & 0x0000FF) + amt;

  if ( g > 255 ) g = 255;
  else if  ( g < 0 ) g = 0;

  //return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);

  return g | (b << 8) | (r << 16);
}


var C64Instruments = function() {
  this.music = null;
  this.currentInstrumentId = 1;

//  this.instruments = [];
  this.colorIndex = 0;

  this.recentInstruments = [5,4,3,2,1];

    this.defaultColors = [
      0xffebcd,
      0x0000ff,
      0x8a2be2,
      0xa52a2a,
      0xdeb887,
      0x5f9ea0,
      0x7fff00,
      0xd2691e,
      0xff7f50,
      0x6495ed,
      0xfff8dc,
      0xdc143c,
      0x00ffff,
      0x00008b,
      0x008b8b,
      0xb8860b,
      0xa9a9a9,
      0x006400,
      0xbdb76b,
      0x8b008b,
      0x556b2f,
      0xff8c00,
      0x9932cc,
      0x8b0000,
      0xe9967a,
      0x8fbc8f,
      0x483d8b,
      0x2f4f4f,
      0x00ced1,
      0x9400d3,
      0xff1493,
      0x00bfff,
      0x696969,
      0x1e90ff,
      0xb22222,
      0xfffaf0,
      0x228b22,
      0xff00ff,
      0xdcdcdc,
      0xf8f8ff,
      0xffd700,
      0xdaa520,
      0x808080,
      0x008000,
      0xadff2f,
      0xf0fff0,
      0xff69b4,
      0xcd5c5c,
      0x4b0082,
      0xfffff0,
      0xf0e68c,
      0xe6e6fa,
      0xf0f8ff,
      0xfaebd7,
      0x00ffff,
      0x7fffd4,
      0xf0ffff,
      0xf5f5dc,
      0xffe4c4,


    ];


}

C64Instruments.prototype = {


  init: function(music) {
    this.music = music;
  },


  buildInterface: function(parentPanel) {

    var html = '<div id="sidInstruments" class="panelFill" style="background-color: #444444;">';
    html += '<h4 style="margin-left: 10px; margin-bottom: 4px; margin-top: 6px">Instruments</h4>';
    html += '<div id="instrumentsHolder" style="background-color: #333333; margin: 10px; position: absolute; top: 14px; bottom: 24px; left:0; right: 0px; overflow-y: auto; overflow-x: hidden"></div>';
    html += '  <div style="position: absolute; bottom: 6px" class="instrumentButtons">';
    html += '    <button type="button" id="editInstrumentButton">Edit</button>';
    html += '    <button type="button" id="addInstrumentButton">Add</button>';
    html += '    <button type="button" id="duplicateInstrumentButton">Duplicate</button>';
    html += '    <button type="button" id="deleteInstrumentButton">Delete</button>';
    html += '  </div>';

    html += '</div>';
    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html});
    parentPanel.add(this.uiComponent);

//    this.createDefaultInstruments();

    this.initEvents();

  },

  initEvents: function() {
    var _this = this;
    $('#editInstrumentButton').on('click', function() {
      _this.music.setView('editInstrument');
      _this.music.editInstrument.editInstrument(parseInt(_this.currentInstrumentId));
    });


    $('#addInstrumentButton').on('click', function() {
      _this.music.setView('editInstrument');
      _this.music.editInstrument.newInstrument();
    });

    $('#deleteInstrumentButton').on('click', function() {
      _this.deleteInstrument(parseInt(_this.currentInstrumentId));

    });

    $('#duplicateInstrumentButton').on('click', function() {
      _this.duplicateInstrument(parseInt(_this.currentInstrumentId));
    });

  },
  getJSON: function() {

    /*
    return JSON.stringify(this.instruments, function(key, value) {
      if(key == 'material') {
        return undefined;
      }
      return value;
    });
    */

  },


  clearInstruments: function() {
    this.music.doc.data.instruments = [];
  },

  getInstrument: function(instrumentId) {
    return this.music.doc.data.instruments[instrumentId];
  },


  getColor: function(instrumentId) {
    return this.music.doc.data.instruments[instrumentId].color;
  },  


  getHighlightColor: function(instrumentId) {
    if(typeof this.music.doc.data.instruments[instrumentId].highlightColor == 'undefined') {
      this.music.doc.data.instruments[instrumentId].highlightColor = LightenDarkenColor(this.music.doc.data.instruments[instrumentId].color, 20);
    }
    return this.music.doc.data.instruments[instrumentId].highlightColor;
  },


  getBorderColor: function(instrumentId) {
    if(typeof this.music.doc.data.instruments[instrumentId].borderColor == 'undefined') {
      this.music.doc.data.instruments[instrumentId].borderColor = LightenDarkenColor(this.music.doc.data.instruments[instrumentId].color, -20);
    }
    return this.music.doc.data.instruments[instrumentId].borderColor;
  },


  selectDefaultInstrument: function() {
    this.selectInstrument(this.defaultInstrument, false);

  },
  selectInstrument: function(instrumentId, playInstrument) {


    var inRecent = false;
    for(var i = 0; i < this.recentInstruments.length; i++) {
      if(this.recentInstruments[i] == instrumentId) {
        inRecent = true;
        break;
      }
    }

    if(!inRecent) {
      this.recentInstruments.push(instrumentId);
      if(this.recentInstruments.length > 8) {
        this.recentInstruments.shift();
      }

    }



    this.currentInstrumentId = parseInt(instrumentId);
    $('.instrument').removeClass('selectedInstrument');
    var currentID = 'instrument' + this.currentInstrumentId;
    $('#' + currentID).addClass('selectedInstrument');

    if(this.music && this.music.musicPlayer2 && (typeof playInstrument == 'undefined' || playInstrument)  ) {  
      var pitch = 48;
      var channel = 0;
      if(typeof this.music.patternView.channel != 'undefined') {
        channel = this.music.patternView.channel;
      }

      this.music.musicPlayer2.playTestInstrument(pitch, this.music.doc.data.instruments[this.currentInstrumentId]);

      var _this = this;
      setTimeout(function() { 
        _this.music.musicPlayer2.stopTestInstrument();
      }, 600);
    }

  },


  mouseWheel: function(event, delta) {

  },


  mouseDown: function(x, y) {

  },

  mouseMove: function(x, y) {
    y = window.innerHeight - y - 1;
  },

  mouseUp: function(x, y) {

  },

  updateInstrumentHTML: function() {
    var instruments = this;

    var html = '';

    // instrument 0 is not selectable
    for(var i = 1; i < this.music.doc.data.instruments.length; i++) {
      var id = i;
      html += '<div class="instrument" id="instrument' + id + '">';

      var color = "#" + ((1 << 24) + this.music.doc.data.instruments[i].color).toString(16).slice(1);
      html += '<div style="margin-top: 2px; margin-right: 4px; display: inline-block; width: 12px; height: 12px; background-color: ' + color + '"></div>';
      html += '<span style="margin-bottom: 2px" id="instrumentName' + id + '">';
      html += this.music.doc.data.instruments[i].name;
      html += '</span>';
      html += '</div>';

    }

    //html = '<div style="height: 600px">' + html + '</div>';
    $('#instrumentsHolder').html(html);

    $('.instrument').on('click', function() {

      var id = $(this).attr('id');
      id = id.replace('instrument', '');
      instruments.selectInstrument(id, true);

    });

    this.defaultInstrument = 10;
    if(this.music.doc.data.instruments.length < 10) {
      this.defaultInstrument = 1;
    }
    this.selectInstrument(this.defaultInstrument, false);
//    this.calculateScroll();
  },


  createInstrument: function(args) {
    var instrumentId = this.music.doc.data.instruments.length;
    this.music.doc.data.instruments.push(args);
    return instrumentId;
  },

  createMinimalInstruments: function() {

    // first instrument is blank
    var instrument = {
      name:"instrument 0",
      "color": 0x000000,
      attack:0x0,
      decay:0x0,
      sustain:0x0,
      release:0x0,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,

      wavePtr: 0x00,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x0,
      firstWave: 0x0,
      wavetable: [
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };

    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"C64 Lead",
      type:"advanced",
      "color": 0x553377,
      attack:0x2,
      decay:0x0,
      sustain:0x5,
      release:0x5,
      vibratoSpeed: 0x1,
      vibratoDepth: 0x18,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x80,0x10],
        [0x20,0x40],
        [0x40,0xe0],
        [0x40,0x20],
        [0xff, 0x3]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);

    for(var i = 0; i < this.music.doc.data.instruments.length; i++) {
      if(i < this.defaultColors.length) {
        this.music.doc.data.instruments[i].color = this.defaultColors[this.colorIndex++];
//        this.music.doc.data.instruments[i].highlightColor = LightenDarkenColor(this.music.doc.data.instruments[i].color, 40);

      }
    }


    this.updateInstruments();



  },

  createDefaultInstruments: function() {
    this.music.doc.data.instruments = [];

    // reset color index
    this.colorIndex  = 0;

    // first instrument is blank
    var instrument = {
      name:"instrument 0",
      "color": 0x000000,
      attack:0x0,
      decay:0x0,
      sustain:0x0,
      release:0x0,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,

      wavePtr: 0x00,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x0,
      firstWave: 0x0,
      wavetable: [
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],


    };

    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"Snare",
      type:"drum",
      "color": 0x553377,
      attack:0x0,
      decay:0x2,
      sustain:0x8,
      release:0x8,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,  
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xd0],
        [0x41,0xaa],
        [0x41,0xa4],
        [0x80,0xd4],
        [0x80,0xd1],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x00],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],




      //drum
      drumType: 'snare',
      drumWaveform: 0x40

    };
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Tomdrum",
      type:"drum",
      "color": 0x553377,
      attack:0x0,
      decay:0x2,
      sustain:0x8,
      release:0x8,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,     
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xc8],
        [0x41,0x0],
        [0x41,0x7f],
        [0x40,0x7e],
        [0x40,0x7d],
        [0x00,0x7c],
        [0x00,0x7b],
        [0x00,0x7a],
        [0x00,0x79],
        [0x00,0x78],
        [0x00,0x77],
        [0x00,0x76],
        [0x00,0x75],
        [0xff,0x0]

      ],
      pulsetable: [
        [0x88,0x00],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      //drum
      drumType: 'tom',
      drumWaveform: 0x40

    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Kick Drum",
      type:"drum",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0xa,
      release:0x8,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,     
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xd8],
        [0x11,0xa6],
        [0x11,0xa0],
        [0x10,0x98],
        [0x00,0x94],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x00],
        [0x18,0x40],
        [0x08,0xc0],
        [0x08,0x40],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      drumType: 'bass',
      drumWaveform: 0x10

    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Hihat open",
      type:"drum",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x8,
      release:0x9,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xde],
        [0x80,0xdc],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x00],
        [0x18,0x40],
        [0x08,0xc0],
        [0x08,0x40],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      drumType: 'hihat',
      drumWaveform: 0x00
    };
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Hihat closed",
      type:"drum",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x4,
      release:0x2,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xde],
        [0x80,0xdc],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x00],
        [0x18,0x40],
        [0x08,0xc0],
        [0x08,0x40],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      drumType: 'hihat',
      drumWaveform: 0x00

    };
    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"Rim Click",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x2,
      sustain:0x1,
      release:0x8,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0x0],
        [0x80,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Clap",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x0b,
      release:0x5,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0xc8],
        [0x41,0x9b],
        [0x81,0xc8],
        [0x80,0xb8],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88, 0x00],
        [0xff, 0x00]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Bongo",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x3,
      sustain:0x7,
      release:0x4,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0x01,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x71,0x9e],
        [0x11,0x0],
        [0x02,0x0],
        [0x10,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88, 0],
        [0xff, 0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Woodblock",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x0,
      release:0x3,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0x01,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x11,0xcd],
        [0x10,0xca],
        [0xff,0x0]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Square Wave",
      type: "basic",
      color: 0xff0000,
      attack:0x0,
      decay:0x0,
      sustain:0x6,
      release:0x9,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,      
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x89,0x99],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      // basic
      basicWaveform: 0x40,
      basicEffect: "none",
      pulseWidth: 50,
      pulseModulationSpeed:0,
      pulseModulationDepth:0,

    };
    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"Electric Piano",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x6,
      release:0x8,
      vibratoSpeed: 0x1,
      vibratoDepth: 0x0b,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0x01,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x11,0x0],
        [0x51,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x84, 0],
        [0xff, 0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Electric Guitar",
      type:"advanced",
      "color": 0x553377,
      attack:0x0,
      decay:0x0,
      sustain:0x6,
      release:0x6,
      vibratoSpeed: 0x04,
      vibratoDepth: 0x06,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0x01,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x21,0x0],
        [0x01,0x0],
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x86, 0],
        [0xff, 0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"Bass (filtered on ch1)",
      type:"advanced",

      color: 0xff0000,
      attack:0x2,
      decay:0x0,
      sustain:0x6,
      release:0x9,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,      
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0x01,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x89,0x99],
        [0xff,0x0]
      ],
      filtertable: [
        [0x90, 0xf1],
        [0x00, 0x0c],
        [0x02, 0x01],
        [0xff, 0x00]

      ],
      speedtable: [
      ],

      // basic
      basicWaveform: 0x40,
      basicEffect: "none",
      pulseWidth: 60,
      pulseModulationSpeed:0,
      pulseModulationDepth:0,

    }
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Flute",
      type:"advanced",
      "color": 0x553377,
      attack:0x8,
      decay:0xa,
      sustain:0x8,
      release:0x9,
      vibratoSpeed: 0x1,
      vibratoDepth: 0x0c,   
      vibratoDelay: 0x1,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0x11,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x0],
        [0xff, 0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    };
    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"C64 Lead",
      type:"advanced",
      "color": 0x553377,
      attack:0x2,
      decay:0x0,
      sustain:0x5,
      release:0x5,
      vibratoSpeed: 0x1,
      vibratoDepth: 0x18,   
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x80,0x10],
        [0x20,0x40],
        [0x40,0xe0],
        [0x40,0x20],
        [0xff, 0x3]
      ],
      filtertable: [
      ],
      speedtable: [
      ]
    };
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Major Arp",


      type:"basic",

      "color": 0x00ff00,

      attack:0xb,
      decay:0x9,
      sustain:0x4,
      release:0x6,

      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,      
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0x01,0x7b],
        [0x01,0x78],
        [0x01,0x0],
        [0xff,0x2]
      ],
      pulsetable: [
        [0x82,0x66],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      // basic
      basicWaveform: 0x40,
      basicEffect: "arpeggio",
      pulseWidth: 15,
      pulseModulationSpeed:0,
      pulseModulationDepth:0,
      arpeggioSpeed:1,
      arpeggioType:'major',
      arpeggioDirection:'up',


    }
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"instrument 3",
      type:"basic",

      "color": 0x00ff00,
      attack:0xb,
      decay:0x9,
      sustain:0x8,
      release:0xc,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,      
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x11,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x0],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],

      // basic
      basicWaveform: 0x10,
      pulseWidth: 0,
      pulseModulationSpeed:0,
      pulseModulationDepth:0,
      arpeggioSpeed:0,
      arpeggioType:'none',
      arpeggioDirection:'up',
    }
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"instrument 4",
      type:"advanced",

      "color": 0x0000ff,
      attack:0x0,
      decay:0x9,
      sustain:0x0,
      release:0x9,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,  
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0x0],
        [0x0,0xc],
        [0x0,0x6c],
        [0xff,0x1]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }

    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"instrument 5",
      type:"advanced",

      attack:0x0,
      decay:0x8,
      sustain:0x5,
      release:0x0,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x0],
        [0x0,0xc],
        [0x0,0x6c],
        [0xff,0x00]
      ],
      pulsetable: [
        [0x88,0x0],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"instrument 6",
      type:"advanced",

      attack:0x9,
      decay:0x0,
      sustain:0xf,
      release:0x0,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x41,0x7f],
        [0x2,0x7e],
        [0x2,0x7d],
        [0x2,0x7c],
        [0x2,0x7b],
        [0x32,0x7a],
        [0x2,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x0],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"instrument 7",
      type:"advanced",

      attack:0x0,
      decay:0x6,
      sustain:0x0,
      release:0xa,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,

      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x81,0x0],
        [0x81,0x0],
        [0x41,0x7f],
        [0xb,0x7e],
        [0xb,0x7d],
        [0xb,0x7c],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x88,0x0],
        [0xff,0x0]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }

    this.music.doc.data.instruments.push(instrument);

    var instrument = {
      name:"instrument 8",
      type:"advanced",

      attack:0x0,
      decay:0x7,
      sustain:0x7,
      release:0x0,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,
      
      wavePtr: 0x01,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [0x11,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Tremolo",
      type:"advanced",

      attack:0xa,
      decay:0x0,
      sustain:13,
      release:0x3,
      vibratoSpeed: 0x0,
      vibratoDepth: 0x0,
      vibratoDelay: 0x0,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,
      vibParam: 0x0,
      vibDelay: 0x0,
      gateTimer: 0x2,
      firstWave: 0x9,
      wavetable: [
        [17,0x0],
        [1,128],
        [16,128],
        [1,128],
        [17,128],
        [255,2]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Solo",
      type:"advanced",

      attack:0x0,
      decay:0x3,
      sustain:0x9,
      release:0x0,
      vibratoSpeed: 0x01,
      vibratoDepth: 0x07,
      vibratoDelay: 0x01,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x07,
      vibDelay: 0x01,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x17,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);


    var instrument = {
      name:"Chord",
      type:"advanced",

      attack:0xe,
      decay:0x5,
      sustain:0x4,
      release:0xe,
      vibratoSpeed: 0x00,
      vibratoDepth: 0x00,
      vibratoDelay: 0x00,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x00,
      vibDelay: 0x00,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x41,0x0],
        [0x41,0x0],
        [0x41,0x0],
        [0x41,0x0],
        [0x41,0x07],
        [0x41,0x07],
        [0x41,0x07],
        [0x41,0x07],
        [0x41,0x0c],
        [0x41,0x0c],
        [0x41,0x0c],
        [0x41,0x0c],
        [0x41,0x07],
        [0x41,0x07],
        [0x41,0x07],
        [0x41,0x07],
        [0xff,0x01]
      ],
      pulsetable: [
        [0x84, 0x00],
        [0x20, 0x20],
        [0x20, 0xe0],
        [0xff, 0x01],
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Solo",
      type:"advanced",

      attack:0x0,
      decay:0x0,
      sustain:0x8,
      release:0x9,
      vibratoSpeed: 0x00,
      vibratoDepth: 0x00,
      vibratoDelay: 0x00,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x07,
      vibDelay: 0x01,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x41,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x84, 0x00],
        [0x18, 0x50],
        [0x18, 0xb0],
        [0xff, 0x01]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);



    var instrument = {
      name:"Bass",
      type:"advanced",

      attack:0x0,
      decay:0x0,
      sustain:0xf,
      release:0x8,
      vibratoSpeed: 0x00,
      vibratoDepth: 0x00,
      vibratoDelay: 0x00,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x07,
      vibDelay: 0x01,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x41,0x0],
        [0x41,0x0],
        [0x40,0x0],
        [0xff,0x0]
      ],
      pulsetable: [
        [0x80, 0x30],
        [0x20, 0x50],
        [0xff, 0x00]
      ],
      filtertable: [
        [0x90, 0xf3],
        [0x00, 0x2f],
        [0x0a, 0xff],
        [0x80, 0x00],
        [0xff, 0x00]
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);




    var instrument = {
      name:"Kick",
      type:"advanced",

      attack:0x0,
      decay:0x0,
      sustain:0xf,
      release:0xa,
      vibratoSpeed: 0x00,
      vibratoDepth: 0x00,
      vibratoDelay: 0x00,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x07,
      vibDelay: 0x01,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x81,0xdf],
        [0x11,0xaa],
        [0x11,0xa7],
        [0x11,0xa5],
        [0x10,0xa0],
        [0x10,0x9b],
        [0x10,0x92],
        [0xff,0x0]
      ],
      pulsetable: [
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);




    var instrument = {
      name:"Glass",
      type:"advanced",

      attack:0x0,
      decay:0x0,
      sustain:0x6,
      release:0x6,
      vibratoSpeed: 0x00,
      vibratoDepth: 0x00,
      vibratoDelay: 0x00,
      
      wavePtr: 0x07,
      pulsePtr: 0,
      filtPtr: 0,

      vibParam: 0x07,
      vibDelay: 0x01,
      gateTimer: 0x02,
      firstWave: 0x09,
      wavetable: [
        [0x81,0xda],
        [0x40,0x0c],
        [0x10,0x00],
        [0xff,0x00]
      ],
      pulsetable: [
        [0x88, 0x00],
        [0x01, 0x40],
        [0xff, 0x02]
      ],
      filtertable: [
      ],
      speedtable: [
      ],
    }
    this.music.doc.data.instruments.push(instrument);

    for(var i = 0; i < this.music.doc.data.instruments.length; i++) {
      if(i < this.defaultColors.length) {
        this.music.doc.data.instruments[i].color = this.defaultColors[this.colorIndex++];

      }
    }


    this.updateInstruments();


  },



  duplicateInstrument: function(instrumentId) {
    var instrument = {};
    for(var key in this.music.doc.data.instruments[instrumentId]) {
      if(key == 'wavetable' || key == 'filtertable' || key == 'pulsetable' || key == 'speedtable') {
        instrument[key] = [];
        for(var i = 0; i < this.music.doc.data.instruments[instrumentId][key].length; i++) {
          instrument[key].push([ this.music.doc.data.instruments[instrumentId][key][i][0],
                                this.music.doc.data.instruments[instrumentId][key][i][1] ]);
        }
      } else {
        instrument[key] = this.music.doc.data.instruments[instrumentId][key];
      }
    }

    instrument.color = this.defaultColors[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % this.defaultColors.length;
//    instrument.material = new THREE.MeshBasicMaterial({ color: instrument.color });


    var newInstrumentId = instrumentId + 1;

    instrument.name += " Copy";
    this.music.doc.data.instruments.splice(newInstrumentId, 0, instrument);


console.error(' fix duplicate instrument');
    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
      this.music.doc.data.patterns[i].shiftInstrumentsAbove(instrumentId, 1);
    }


    this.updateInstruments();
    this.music.sidPlayer.testInstrumentSetup();


//    this.music.updateSid(true);

    this.music.patternView.drawPattern();

    this.selectInstrument(newInstrumentId, false);
  },

  deleteInstrument: function(instrumentId) {
console.error('fix delete instrument');

    var instrumentInUse = this.music.patterns.instrumentUsed(instrumentId);

    if(instrumentInUse) {
      if(!confirm("This instrument is being used, are you sure you want to delete it?")){
        return;
      }

      this.music.patterns.removeInstrumentFromAllPatterns(instrumentId);
    }

    this.music.doc.data.instruments.splice(instrumentId, 1);

    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
      this.music.doc.data.patterns[i].shiftInstrumentsAbove(instrumentId);
    }

    if(this.music.doc.data.instruments.length == 1) {
      // uh oh, no instruments left
      this.music.doc.data.instruments = [];
      this.createMinimalInstruments();
    }

    this.updateInstruments();
    this.music.sidPlayer.testInstrumentSetup();
    this.music.updateSid(true);

    this.music.patternView.drawPattern();
    this.music.patternView.updatePattern();


  },

  updateInstruments: function() {

    for(var i = 0; i < this.music.doc.data.instruments.length; i++) {
      if(typeof this.music.doc.data.instruments[i].color == 'undefined') {
        if(i < this.defaultColors.length) {
          this.music.doc.data.instruments[i].color = this.defaultColors[this.colorIndex];
//          this.music.doc.data.instruments[i].highlightColor = LightenDarkenColor(this.music.doc.data.instruments[i].color, 40);

//          console.log('color: ' + this.music.doc.data.instruments[i].highlightColor);
  
          this.colorIndex = (this.colorIndex + 1) % this.defaultColors.length;

        }
      }
    }
    this.updateInstrumentHTML();



  }
}
