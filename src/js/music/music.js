var Music = function() {

  this.lastUpdate = 0;

  this.name = 'Song Name';
  this.author = 'Author Name';
  this.copyright = 'Copyright';

  this.instruments = null;
  this.editInstrument = null;   
  this.musicScripting = null;

  this.filters = null;
  this.editFilter = null;

  this.patternView = null;
  this.patterns = null;

  this.oscilloscopes = null;
  this.adsrGraph = null;
  this.filterGraph = null;

  this.view = 'edit';

  this.playheadPosition = 0;

  this.trackView = null;
  this.tracks = null;

  this.drummer = null;
  this.bassist = null;

  this.history = null;

  this.sidSpeed = 1;
  this.loopSelection = false;
  this.selectFrom = 0;
  this.selectTo = 16;

  this.sidFile = null;

  this.usePlayer2 = true;

  this.scales = null;

  this.startTime = false;
  this.endTime = false;

  this.histories = {};

}

Music.prototype = {

  init: function() {

    this.musicPlayer2 = new SidPlayer2();
    this.musicPlayer2.init(this);

//    this.history = new MusicHistory();
//    this.history.init(this);

    this.drummer = new Drummer();
    this.drummer.init(this);

    this.bassist = new Bassist();
    this.bassist.init(this);
    
    this.scales = new Scales();
  },

  buildInterface: function(parentPanel) {

    var content = UI.create("UI.SplitPanel", { "id": "musicEditor"});
    parentPanel.add(content);

    var playbackPanel = UI.create("UI.Panel", { "id": "musicPlaybackPanel" });
    content.addSouth(playbackPanel, 34, false);

    var sidePanel = UI.create("UI.SplitPanel", { "id": "musicSidePanel" });
    content.addEast(sidePanel, 240);
    content.setMinSize('east', 240);

    var instrumentsPanel = UI.create("UI.Panel");
    sidePanel.add(instrumentsPanel);

    var filtersPanel = UI.create("UI.Panel");
    sidePanel.addSouth(filtersPanel, 140);


    var mainPanel = UI.create("UI.Panel", { "id": "musicMainPanel" })
    content.add(mainPanel);

    var mainSplitPanel = UI.create("UI.SplitPanel", { "id": "musicMainSplitpanel"});
    mainPanel.add(mainSplitPanel);

    var graphPanel = UI.create("UI.CanvasPanel", { "id": "musicGraphPanel" });
    mainSplitPanel.addNorth(graphPanel, 120);

    this.viewPanel = UI.create("UI.Panel");
    mainSplitPanel.add(this.viewPanel);

    var editInstrumentPanel = UI.create("UI.Panel", { "id": "editInstrumentPanel"});
    this.viewPanel.add(editInstrumentPanel);

    var editFilterPanel = UI.create("UI.Panel", { "id": "editFilterPanel"});
    this.viewPanel.add(editFilterPanel);

    var musicEditorPanel = UI.create("UI.SplitPanel", { "id": "musicEditorPanel"});
    this.viewPanel.add(musicEditorPanel);

    var patternEditorPanel = UI.create("UI.SplitPanel", { "id": "patternEditorPanel"});
    musicEditorPanel.add(patternEditorPanel);

    var patternPanel = UI.create("UI.CanvasPanel", { "id": "musicPatternPanel" });
    patternEditorPanel.add(patternPanel);

    var editControlsPanel = UI.create("UI.Panel", { "id": "musicEditControlsPanel" });
    patternEditorPanel.addSouth(editControlsPanel, 30);

    var trackPanel = UI.create("UI.CanvasPanel", { "id": "trackPanel" });
    musicEditorPanel.addSouth(trackPanel, 87 + styles.ui.scrollbarWidth);

    this.sidFile = new SidFile();
    this.sidFile.init(this);

    
    var _this = this;

    UI.on('ready', function() {

      _this.viewPanel.showOnly("musicEditorPanel");

      _this.instruments = new C64Instruments();
      _this.instruments.init(_this);
      _this.instruments.buildInterface(instrumentsPanel);


      _this.filters = new SidFilters();
      _this.filters.init(_this);
      _this.filters.buildInterface(filtersPanel);


      _this.patternView = new PatternView2();
      _this.patternView.init(_this);
      _this.patternView.buildInterface(patternPanel);

      _this.patterns = new Patterns();
      _this.patterns.init(_this);


      // TODO: start new needs to be before track view, but after pattern view

//      _this.startNew({ defaultInstruments: true });

      _this.trackView = new TrackView();
      _this.trackView.init(_this);
      _this.trackView.buildInterface(trackPanel);

      _this.tracks = new Tracks();
      _this.tracks.init(_this);

      _this.playbackControls = new PlaybackControls();
      _this.playbackControls.init(_this);
      _this.playbackControls.buildInterface(playbackPanel);

      _this.musicEditTools = new MusicEditTools();
      _this.musicEditTools.init(_this);
      _this.musicEditTools.buildInterface(editControlsPanel);

      _this.editInstrument = new EditC64Instrument();
      _this.editInstrument.init(_this);
      _this.editInstrument.buildInterface(editInstrumentPanel);
      
      _this.editFilter = new EditSidFilter();
      _this.editFilter.init(_this);
      _this.editFilter.buildInterface(editFilterPanel);


      _this.oscilloscopes = [];
      for(var i = 0; i < 3; i++) {
        var channel = i + 1;

        _this.oscilloscopes[i] = new Oscilloscope();
        _this.oscilloscopes[i].init(_this, i, graphPanel);
      }
    });
  },


  resize: function() {
    UI('musicPatternPanel').resize();
    UI('trackPanel').resize();

  },

  setView: function(view) {
    this.view = view;
    switch(view) {
      case 'edit':
        this.viewPanel.showOnly("musicEditorPanel");
        
      break;
      case 'editInstrument':
        this.viewPanel.showOnly("editInstrumentPanel");

      break;
      case 'editFilter':
        this.viewPanel.showOnly("editFilterPanel");

      break;
    }

  },


/*


  setOverdrive: function() {
    var args = {};

    args.overdriveOn = $('#audioEnableOverdrive').is(':checked');

    args.gain = 0.5;
    var gain = parseFloat($('#overdriveGain').val());
    if(!isNaN(gain)) {
      args.gain = gain / 100;
    }


    args.drive = 0.5;
    var drive = parseFloat($('#overdriveDrive').val());
    if(!isNaN(drive)) {
      args.drive = drive / 100;
    }

    args.curve = 0.5;
    var curve = parseFloat($('#overdriveCurve').val());
    if(!isNaN(curve)) {
      args.curve = curve / 100;
    }

    this.musicPlayer.setOverdrive(args);

  },

  setReverb: function() {
    var reverb = $('#audioEnableReverb').is(':checked');
    var args = {};
    args.reverbOn = reverb;

    args.wet = 0;
    var wet = parseFloat($('#reverbWet').val());
    if(!isNaN(wet)) {
      args.wet = wet / 100;
    }

    args.dry = 0;
    var dry = parseFloat($('#reverbDry').val());
    if(!isNaN(dry)) {
      args.dry = dry / 100;
    }

    args.type = $('#reverbType').val();


    this.musicPlayer.setReverb(args);
  },

  initAudioOptionsDialog: function() {
    var _this = this;

    $('#audioEnableReverb').on('click', function() {
      _this.setReverb();
    });

    $('#reverbWet').on('keyup', function() {
      console.log('wet key up!');
      _this.setReverb();
    });

    $('#reverbDry').on('keyup', function() {
      _this.setReverb();
    });

    $('#reverbType').on('change', function() {
      _this.setReverb();
    });

    $('#audioEnableOverdrive').on('click', function() {
      _this.setOverdrive();
    });

    $('#overdriveGain').on('keyup', function() {
      _this.setOverdrive();
    });

    $('#overdriveDrive').on('keyup', function() {
      _this.setOverdrive();
    });

    $('#overdriveCurve').on('keyup', function() {
      _this.setOverdrive();
    });

    $('#audioOptionsOK').on('click', function() {
      _this.editor.hideDialog();
    });
    $('#audioOptionsCancel').on('click', function() {
      _this.editor.hideDialog();
    });

  },



  showAudioOptions: function() {
    this.editor.showDialog('audioOptionsDialog');
  },

*/

  clearAll: function() {
    this.tracks.clearTracks();
    this.patterns.clearPatterns();
    this.instruments.clearInstruments();
    this.filters.clearFilters();
  },

  isPlaying: function() {
    return this.musicPlayer2.isPlaying();
  },

  getTempo: function() {
    return parseInt($('#sidTempo').val());
  },  

  setTempo: function(tempo) {
    tempo = parseInt(tempo);
    if(isNaN(tempo)) {
      return;
    }
    $('#sidTempo').val(tempo);

  },

  setSpeed: function(speed) {
    this.sidSpeed = speed;
  },

  getSpeed: function() {
    return this.sidSpeed;
  },


  // setup/restorehistory
  setupHistory: function() {

    var id = this.doc.id;

    // setup/restore the history
    if(this.histories.hasOwnProperty(id)) {
      this.history = this.histories[id];
    } else {
      this.history = new MusicHistory();
      this.history.init(this);
      this.histories[id] = this.history;
    }
  },



  // doc has been modified
  modified: function() {
    if(g_app.openingProject) {
      return;
    }
    g_app.doc.recordModified(this.doc, this.path);
  },


  // set the doc
  show: function(path) {
    if(this.isPlaying()) {
      this.stopMusic();
    }


    this.doc = g_app.doc.getDocRecord(path);
    this.path = path;
    this.setupHistory();

    console.log(g_app.doc);

    this.trackView.tracksUpdated();
    this.instruments.updateInstrumentHTML();
    this.filters.updateFilterHTML();

    if(this.doc.data.tracks.length > 0 && this.doc.data.tracks[0].patternInstances.length > 0) {
      this.trackView.selectPattern(0, 0);
    }
    this.instruments.selectDefaultInstrument();
    this.patterns.getMaxNoteId();
  },
  
  saveSettings: function() {

  },

  startNew: function(args) {
    var name = 'Untitled Music';
    if(typeof args != 'undefined') {
      if(typeof args.name != 'undefined') {
        name = args.name;
      }
    }

    var record = g_app.doc.createDocRecord('/music', name, 'music', {});

    this.doc = g_app.doc.getDocRecord('/music/' + name);
    this.doc.data.tracks = [];
    this.doc.data.patterns = [];

    if(typeof args == 'undefined') {
      args = {};
    }

    this.clearAll();

    if(args.defaultInstruments) {
      this.instruments.createDefaultInstruments();
      this.filters.createDefaultFilters();
    } else {
      this.instruments.createMinimalInstruments();
      this.filters.createMinimalFilters();
    }


    // create 3 tracks
    this.tracks.clearTracks();
    this.tracks.createTrack();
    this.tracks.createTrack();
    this.tracks.createTrack();

    for(var i = 1; i <= this.doc.data.tracks.length; i++) {

      var patternId = this.patterns.createPattern('Pattern ' + i, 64);
      this.tracks.addPattern(i - 1, patternId, 0);
    }


//    this.updateSid(true);

//    this.musicPlayer.setup();


/*
    this.patternView.drawPattern();

    this.filters.updateFilterHTML();


    this.trackView.tracksUpdated();
    this.trackView.selectPattern(0, 0);
*/
    return record;    

  },


  load: function(data) {
    this.stopMusic();

    this.sidFile.load(data);

    this.trackView.getHTML();
    this.trackView.selectPattern(0,0);

    this.setView('edit');
  },

  save: function() {
    var data = this.sidFile.save();
    data = JSON.stringify(data);
    var filename = "c64song.json";
    download(data, filename, "application/json");
  },

  keyDown: function(event) {

    this.shiftDown = event.shiftKey;
    this.ctrlDown = event.ctrlKey;
    this.altDown = event.altKey;
    this.cmdDown = event.metaKey;    

    var keyCode = event.keyCode;

    if(keyCode == 46 || keyCode == 8) { // delete
      if(this.view == 'edit') {
        this.patternView.clearSelected();
      }
      return;
    }

    if(keyCode == 32) {   // space bar

      if(this.musicPlayer2.isPlaying()) {
        this.stopMusic();
      } else {
        this.playMusic();
      }

      return;
    }

    // select all 
    if( (this.cmdDown || this.ctrlDown) && event.keyCode == 65) {
      if(this.shiftDown) {
        this.patternView.unselectAll();
      } else {
        this.patternView.selectAll();
      }
      event.preventDefault();
      return;
    }


    // undo / redo
    if( (this.cmdDown || this.ctrlDown) && event.keyCode == 90) {
      // ctrl/cmd-z
      if(this.shiftDown) {
        this.history.redo();
      } else {
        this.history.undo();
      }
      event.preventDefault();
      return;
    }

    if( (this.cmdDown || this.ctrlDown) && event.keyCode == 89) {
      // ctrl/cmd-y
      if(this.shiftDown) {
        this.history.undo();
      } else {
        this.history.redo();
      }
      event.preventDefault();
    }

    if(this.view == 'editInstrument') {
      this.editInstrument.keyDown(event);
    }

    if(this.view == 'edit') {
      this.patternView.keyDown(event);
    }
  },


  keyUp: function(event) {

    this.shiftDown = event.shiftKey;
    this.ctrlDown = event.ctrlKey;
    this.altDown = event.altKey;
    this.cmdDown = event.metaKey;    


    if(this.view == 'editInstrument') {
      this.editInstrument.keyUp(event);
    }
    if(this.view == 'edit') {
      this.patternView.keyUp(event);
    }

  },

  keyPress: function(event) {

  },

  cut: function() {
    this.patternView.cut();

  },

  copy: function() {
    this.patternView.copy();

  },

  paste: function() {
    this.patternView.paste();

  },

  selectAll: function() {
    this.patternView.selectAll();
  },

  clearSelect: function() {
    this.patternView.unselectAllNotes();

  },


  setMute: function(track, mute) {
    this.musicPlayer2.setMute(track, mute);

  },

  getMute: function(track) {
    return this.musicPlayer2.getMute(track);
  },


  playMusic: function() {
    var startAtPosition = this.playheadPosition;

    if(this.musicPlayer2.isPlaying()) {
      // already playing
      return;
    }

    if(this.loopSelection) {
      startAtPosition = this.selectFrom;
    }

    this.musicPlayer2.setupAudioContext();
    this.musicPlayer2.play(startAtPosition);
  },

  stopMusic: function() {
    this.patternView.started = false;

    this.musicPlayer2.stop();
  },


  exportAsType: function(type) {
    this.musicPlayer2.exportAsType(type);
    /*
    switch(type) {
      case 'sid':
        this.downloadSidAsSID('untitled.sid', 'title', 'author', 'copyright');
      break;
      case 'goattracker':
      console.log('download goat');
        this.downloadSidAsGoat('untitled.gt', 'title', 'author', 'copyright');
      break;
      case 'wav':

      break;
    }
    */

  },


  downloadSidAsPRG: function() {
//    this.createSid();
    this.musicPlayer2.songData.downloadPRG();

  },


  // update the whole sid..
  updateSid: function(force) {
    console.log('move this to sidplayer');
    this.musicPlayer.updateSid(force);
  },


/*
  updatePattern: function(patternIndex, channel) {
    console.log('remove update pattern');
//    this.musicPlayer.patternUpdated(patternIndex, channel);
  },
*/

  createSid: function() {
    return this.musicPlayer2.createSid();
  },

  // convert the position in a pattern in a channel into a global position
  getGlobalPosition: function(channel, trackIndex, patternPosition) {
    //console.log('channel = ' + channel);
//    return this.doc.tracks[channel].getGlobalPosition(trackIndex, patternPosition);
    return this.tracks.getGlobalPosition(channel, trackIndex, patternPosition);
  },

  setPlayheadPosition: function(globalPosition) {
    this.musicPlayer2.setPlayheadPosition(globalPosition);
  },


  update: function() {
    var time = getTimestamp();
    var delta = time - this.lastUpdate;
    this.lastUpdate = time;  

    this.playheadPositionFraction = 0;

    this.playheadPosition = this.musicPlayer2.getPlayheadPosition();
    



    if(this.playheadPosition === 16 && this.startTime === false) {
      this.startTime = getTimestamp();
      this.endTime = false;
    }

    if(this.playheadPosition === 112 && this.endTime === false)  {
      this.endTime = getTimestamp();

      var timeDiff = this.endTime - this.startTime;
      console.log('time diff = ' + timeDiff);
      this.startTime = false;

    }

    // has the playhead reached a looping point?
    if(this.loopSelection && (this.playheadPosition >= this.selectTo || this.playheadPosition < this.selectFrom - 1)) {
//      this.setPlayheadPosition(this.selectFrom);
//      this.playheadPosition = this.musicPlayer.getPlayheadPosition();
    }

    var channelData = null;

    if(this.view == 'edit' || this.musicPlayer2.isPlaying()) {
      if(this.musicPlayer2.isPlaying()) {
        channelData = this.musicPlayer2.getChannelData();
      } else if(this.musicPlayer2.isPlayingInstrument()) {
        channelData = this.musicPlayer2.getInstrumentChannelData();      
      }

    } else if( (this.view == 'editInstrument' || this.view == 'editFilter') && this.usePlayer2) {
      if(this.musicPlayer2.isPlayingInstrument()) {
        channelData = this.musicPlayer2.getInstrumentChannelData();
      }
    } else if( (this.view == 'editInstrument' || this.view == 'editFilter') && typeof InstrumentPlayer != 'undefined') {

//console.log('get instrumnt player data@########');
      channelData = InstrumentPlayer.getData();      
    }

    for(var i = 0; i < 3; i++) {
      if(channelData) {
        this.oscilloscopes[i].outputData(channelData[i]);
      } else {
        this.oscilloscopes[i].outputData(false);
      }
    }

    this.trackView.render();
    this.patternView.render();

  }

}
