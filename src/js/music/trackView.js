var TrackView = function() {
  this.music = null;

  this.mode = 'draw';
  this.lastClickTime = 0;

  this.mouseDragPlayhead = false;
  this.mouseCaptured = false;

  this.patterns = [];

  this.lastMouseX = 0;
  this.lastMouseY = 0;

  this.movingPlayhead = false;


  this.selectedTrack = 0;

  // used for add/edit pattern
  this.selectedPosition = 0;

  this.highlightedTrack = false;
  this.highlightedPatternIndex = false;
  this.selectedTrack = false;
  this.selectedPatternIndex = false;
  this.selectedpatternId = 0;

  this.trackCanvas = null;
  this.trackInfoCanvas = null;
  this.trackHeight = 22;
  this.trackInfoWidth = 100;
  this.rulerHeight = 20;
  this.patternCellWidth = 2;

  this.cursor = {
    track: 0,
    duration: 64,
    position: 128,
    type: "add",

    visible: false
  }


  this.scrollClick = false;

  this.vScrollBarWidth = styles.ui.scrollbarWidth;
  this.vScrollBarHeight = 0;
  this.vScrollBarPosition = null;
  this.vScrollBarPositionMin = 0;
  this.vScrollBarPositionMax = 0;
  this.vScrollBarPositionMouseOffset = 0;
  this.vScroll = false;

//  this.hScrollBar = null;
  this.hScrollBarHeight = styles.ui.scrollbarWidth;
  this.hScrollBarWidth = 0;
  this.hScrollBarPosition = null;
  this.hScrollBarPositionMin = 0;
  this.hScrollBarPositionMax = 0;
  this.hScrollBarPositionMouseOffset = 0;
  this.hScroll = false;

  this.scrollX = 0;
  this.scrollY = 0;

  this.mouseDownAtScrollX = 0;
  this.mouseDownAtScrollY = 0;


  // ---------------
  this.muteIcon = null;
  this.unmuteIcon = null;

  this.context = null;
}

TrackView.prototype = {
  buildInterface: function(canvasPanel) {

    var _this = this;

    this.uiComponent = canvasPanel;

/*
    this.uiComponent.on('render', function(left, top, width, height) {
      _this.render(left, top, width, height);
    });
*/

/*
    this.uiComponent.on('mouseleave', function() {
      _this.cursor.visible = false;
    });


    this.uiComponent.on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    this.uiComponent.on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    this.uiComponent.on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    this.uiComponent.on('mousewheel', function(event) {
      _this.mouseWheel(event);
    });
*/
    this.canvas = this.uiComponent.getCanvas();

    this.trackCanvas = document.createElement('canvas');
    this.trackInfoCanvas = document.createElement('canvas');
    this.rulerCanvas = document.createElement('canvas');

//    this.setTrackSize(this.music.doc.tracks.length, 60 * 16);
    this.initAddPatternDialog();
    this.initEditPatternDialog();

    UI.on('ready', function() {
      _this.initEvents();
    });

//    this.resize();

  },

  tracksUpdated: function() {
    if(typeof this.music.doc.data.tracks != 'undefined') {
//      this.setTrackSize(this.music.doc.data.tracks.length, 60 * 16);
      this.setTrackSize(this.music.doc.data.tracks.length, 128 * 16);
    }
  },

  initEvents: function() {
//    console.error('init track events!');
    var _this = this;
    this.uiComponent.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);

    });    

    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);

    this.canvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);


    this.canvas.addEventListener('mouseleave', function(event) {
      _this.cursor.visible = false;

    }, false);

    this.canvas.addEventListener('mouseenter', function(event) {
    }, false);

  },

  init: function(music) {
    this.music = music;

    this.patternsLoaded = false;

    this.selectedPatternIndex = 0;
    this.selectedTrack = 0;

    this.muteIcon = document.createElement("img");
    this.muteIcon.src = "icons/svg/glyphicons-halflings-96-volume-off.svg";
    this.unmuteIcon = document.createElement("img");
    this.unmuteIcon.src = "icons/svg/glyphicons-halflings-98-volume-up.svg";
  },


  loadPatterns: function() {

    return;



    // build patterns from music.patterns

    this.patterns = [];
    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      this.patterns[track] = [];
      var position = 0;

      for(var pattern = 0; pattern < this.music.doc.data.tracks[track].length; pattern++) {

        var patternID = this.music.doc.data.tracks[track][pattern];

        if(this.music.doc.data.patterns[patternID].name.indexOf('BLANK') !== 0) {//} != 'BLANK') {
          this.patterns[track].push({ patternID: patternID, position: position });
        }
        position += this.music.doc.data.patterns[patternID].getLength();
      }
    }

    this.setPatterns();

  },


  sortPatterns: function(track) {
    var tracks = [];
    if(typeof track != 'undefined') {
      tracks.push(track);
    } else {
      for(var i = 0; i < this.patterns.length; i++) {
        tracks.push(i);
      }
    }

    for(var i = 0; i < tracks.length; i++) {
      var sortTrack = tracks[i];

      this.patterns[sortTrack].sort(function(a, b) {
        return a.position - b.position;
      });      
    }
  },

  // convert the view tracks to music tracks with blank patterns in gaps
  setPatterns: function() {

    return;
    var songLength = 0;

    this.sortPatterns();

    // find total length of song..
    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      var lastPattern = this.patterns[track].length - 1;
      if(lastPattern >= 0) {
        var lastPatternID = this.patterns[track][lastPattern].patternID;
        var trackLength = this.patterns[track][lastPattern].position + this.music.doc.data.patterns[lastPatternID].getLength();
        if(trackLength > songLength) {
          songLength = trackLength;
        }
      }
    }


    // recreate the tracks, inserting blank if needed
    var tracks = [];
    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      tracks[track] = [];

      var lastPosition = 0;
      for(var i = 0; i < this.patterns[track].length; i++) {
        var patternID = this.patterns[track][i].patternID;
        var position = this.patterns[track][i].position;

        if(position > lastPosition) {
          // there is a gap between this and the last pattern
          var blankPatternLength =  position - lastPosition;
          var blankPatternID = this.getBlankPatternID(blankPatternLength);
          tracks[track].push(blankPatternID);
        }
        this.patterns[track][i].patternPosition = tracks[track].length;

        tracks[track].push(patternID);
        lastPosition = position + this.music.doc.data.patterns[patternID].getLength();
      }

      if(lastPosition < songLength) {
        var blankPatternID = this.getBlankPatternID(songLength - lastPosition);
        tracks[track].push(blankPatternID);
      }
    }

    this.music.doc.data.tracks = tracks;

  },

  getBlankPatternID: function(lengthRequired) {
    console.error('get blank pattern!!!');
    var blankPatternID = -1;


    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
//      if(this.music.patterns[i].name == 'BLANK') {
      if(this.music.doc.data.patterns[i].name == 'BLANK ' + lengthRequired) {
        if(this.music.doc.data.patterns[i].getLength() == lengthRequired) {
          return i;
        }
      }
    }


    if(blankPatternID < 0) {
      var pattern = new Pattern();
      pattern.init('BLANK ' + lengthRequired, lengthRequired);
      var blankPatternID = this.music.doc.data.patterns.length;
      this.music.doc.data.patterns.push(pattern);
    }
    return blankPatternID;
  },

  insertBlankPatterns: function() {


    // if there are blank patterns at the end of tracks, remove them...
    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      var trackLength = this.music.doc.data.tracks[track].length - 1;
      for(var pattern = this.music.doc.data.tracks[track].length - 1; pattern >= 0; pattern--) {
        var patternID = this.music.doc.data.tracks[track][pattern];
        trackLength = pattern;
//        if(this.music.patterns[patternID].name == 'BLANK') {
        if(this.music.doc.data.patterns[patternID].name.indexOf('BLANK') === 0) {
        } else {
          break;
        }
      }
      trackLength++;
      if(trackLength != this.music.doc.data.tracks[track].length) {
        this.music.doc.data.tracks[track].splice(trackLength, this.music.doc.data.tracks[track].length - trackLength);
      }
    }


    // find the length of the longest track..
    var songDuration = 0;
    var trackDuration = [];
    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      trackDuration[track] = 0;

      for(var pattern = 0; pattern < this.music.doc.data.tracks[track].length; pattern++) {
        var patternID = this.music.doc.data.tracks[track][pattern];
        /*
        if(this.music.patterns[patternID].name == 'BLANK') {

        }
        */

        trackDuration[track] += this.music.doc.data.patterns[patternID].getLength();
      }
      if(trackDuration[track] > songDuration) {
        songDuration = trackDuration[track];
      }
    }


    // add blank patterns so all tracks are the same length
    for(var track = 0; track < trackDuration.length; track++) {
      var lengthRequired = songDuration - trackDuration[track];
      if(lengthRequired > 0) {
        var blankPatternID = this.getBlankPatternID(lengthRequired);
        this.music.doc.data.tracks[track].push(blankPatternID);
      }
    }
  },

  movePattern: function(fromTrackId, fromIndex, toTrackId, toPosition) {
    var fromTrack = this.music.doc.data.tracks[fromTrackId];
    var patternId = fromTrack.patternInstances[fromIndex].patternId;
    this.music.tracks.removePattern(fromTrackId, fromIndex);

    var toTrack = this.music.doc.data.tracks[toTrackId];
    var patternIndex = this.music.tracks.addPattern(toTrackId, patternId, toPosition);

    this.selectPattern(toTrackId, patternIndex);
    this.drawPatterns();

  },

  setMode: function(mode) {
    console.error("shouldnt call SET MODE??");
    switch(mode) {
      case 'draw':
        $('.sidTrack').css('cursor','url(images/pen.png) 0 0, pointer');
        $('.sidPattern').css('cursor','default');
      break;
      case 'erase':
        $('.sidTrack').css('cursor', 'url(images/eraser.png) 2 14, pointer');
        $('.sidPattern').css('cursor', 'url(images/eraser.png) 2 14, pointer');
      break;
    }

    this.mode = mode;
  },


  initAddPatternDialog: function() {
    var _this = this;

    this.addPatternDialog = UI.create("UI.Dialog", 
                                  { "id": "addPatternDialog", 
                                    "title": "Add A Pattern", 
                                    "width": 640 });

    var html = '';

    this.addPatternDialogHTML = UI.create("UI.HTMLPanel", { "html": html});
    this.addPatternDialog.add(this.addPatternDialogHTML);

    this.addPatternDialogHTML.load('html/music/addAPatternDialog.html', function() {

      var patternLengthHTML = '';
      for(var i = 4; i <= 256; i += 4) {
        patternLengthHTML += '<option value="' + i + '"';
        if(i == 64) {
          patternLengthHTML += ' selected="selected" ';
        }
        patternLengthHTML += '>' + i + '</option>';
      }
      $('#sidPatternLength').html(patternLengthHTML);

      $('input[name="sidAddPattern"]').on('click', _this.setAddPatternType);

    });

    this.addPatternOkButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
    this.addPatternDialog.addButton(this.addPatternOkButton);
    this.addPatternOkButton.on('click', function(event) {

      var value = $('input[name="sidAddPattern"]:checked').val();
      if(value == 'create') {
        var newPatternName = $('#sidPatternName').val();
        var patternLength = parseInt($('#sidPatternLength').val());
        _this.addPattern(_this.selectedTrack, _this.selectedPosition, patternLength, newPatternName);
      } else if(value == 'existing') {  
        var patternID = parseInt($('#sidExistingPatterns').val());  
        _this.addExistingPattern(_this.selectedTrack, _this.selectedPosition, patternID);   
      }

      _this.cursor.visible = false;

      UI.closeDialog();
    });

    this.addPatternCloseButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
    this.addPatternDialog.addButton(this.addPatternCloseButton);
    this.addPatternCloseButton.on('click', function(event) {
      UI.closeDialog();
    });
    var trackView = this;
  },

  initEditPatternDialog: function() {
    var trackView = this;

    var patternLengthHTML = '';
    for(var i = 4; i <= 256; i += 4) {
      patternLengthHTML += '<option value="' + i + '"';
      if(i == 64) {
        patternLengthHTML += ' selected="selected" ';
      }
      patternLengthHTML += '>' + i + '</option>';
    }
    
    $('#sidEditPatternLength').html(patternLengthHTML);



    $('#sidEditPatternDialogOK').on('click', function() {
      var value = $('input[name="sidEditPattern"]:checked').val();
      if(value == 'rename') {
        var newPatternName = $('#sidPatternEditName').val();
        trackView.renamePattern(trackView.selectedPatternId, newPatternName);
        var patternLength = parseInt($('#sidEditPatternLength').val());

        trackView.setPatternLength(trackView.selectedPatternId, patternLength);
      } else if(value == 'replace') {  
        var patternID = parseInt($('#sidPatternReplaceWith').val());  
        trackView.replacePattern(trackView.selectedTrack, trackView.selectedPosition, patternID);
      }

      trackView.music.editor.hideDialog();      
    });

    $('#sidEditPatternDialogCancel').on('click', function() {
      trackView.music.editor.hideDialog();      
    });

    $('input[name="sidEditPattern"]').on('click', this.setEditPatternType);

  },

/*
  initTicks: function() {
    var html = '';
    var left = this.patternStart;
    var top = 6;
    for(var i = 1; i < 60; i++) {
      html += '<div style="color: #999999;  font-size: 6px;position: absolute; height: 6px; padding-left: 2px; width: 1px; left: ' + left + 'px; top: ' + top + 'px; border-left: 1px solid #777777">';
      html += i;
      html += '</div>';
      left += 16;

    }
    $('#sidTrackPosition').html(html);
  },
*/


  // track count is number of tracks
  // track length is lenght of tracks
  setTrackSize: function(trackCount, trackLength) {
    this.trackCount = trackCount;

    this.trackLength = trackLength;
    this.canvasScale = this.uiComponent.getScale();

//    this.vScrollBarWidth = styles.ui.scrollbarWidth * this.canvasScale;
//    this.hScrollBarHeight = styles.ui.scrollbarWidth * this.canvasScale;
  
    this.trackCanvas.height = trackCount * this.trackHeight * this.canvasScale;
    this.trackCanvas.width = trackLength * this.patternCellWidth * this.canvasScale;
    this.trackContext = this.trackCanvas.getContext('2d');
    this.trackContext.scale(this.canvasScale, this.canvasScale);


    this.trackInfoCanvas.height = (trackCount * this.trackHeight + this.rulerHeight) * this.canvasScale;
    this.trackInfoCanvas.width = this.trackInfoWidth * this.canvasScale;

    this.trackInfoContext = this.trackInfoCanvas.getContext('2d');
    this.trackInfoContext.scale(this.canvasScale, this.canvasScale);

    this.rulerCanvas.height = this.rulerHeight * this.canvasScale;
    this.rulerCanvas.width = trackLength * this.patternCellWidth * this.canvasScale;;
    this.rulerContext = this.rulerCanvas.getContext('2d');
    this.rulerContext.scale(this.canvasScale, this.canvasScale);

    this.drawGrid();
    this.drawRuler();
    this.drawTrackInfo();
    this.drawPatterns();    

    this.setTrackDimensions();
  },

  getHTML: function() {

    console.log("TRACK VIEW GET HTML");

    return;


    var channelOn = [true, true, true];
    if(typeof SIDplayer != 'undefined' && SIDplayer) {
      channelOn = SIDplayer.getChannelOn();
    }
    this.loadPatterns();

    for(var track = 0; track < this.music.doc.data.tracks.length; track++) {
      var html = '';
      var channel = track + 1;
      html += '<div class="sidTrackLabel" style="position: absolute; ';
      html += ' width: 92px; top: 1px; left: 0px;';
      html += ' height: 16px; padding: 2px"><label><input type="checkbox" id="channel' + channel + '"';
      if(channelOn[track]) {
        html += ' checked="checked" ';
      }
      html += '> Channel ' + channel + '</label></div>';
      var left = this.patternStart;

      for(var i = 0; i < this.patterns[track].length; i++) {
        var patternID = this.patterns[track][i].patternID;
        var position = this.patterns[track][i].position;
        var pattern = this.music.doc.data.patterns[patternID];
        var width = pattern.getLength();

        left = this.patternStart + position;

        html += '<div class="sidPattern" channel="' + track + '" position="' + i + '" id="sidPattern' + track + '_' + i + '" pattern="' + patternID + '"';

        var padding = 2;
        var border = 1;
        var boxWidth = width - 2*padding - border;
        html += ' style="position: absolute; padding: ' + padding +'px;';
        html += ' border: ' + border +'px solid #aaaaaa;';
        html += ' width: ' + boxWidth + 'px; height: 16px;';
        html += ' top: 0px;'
        html += ' left: ' + left + 'px"';
        html += '>';
        html += pattern.name;
//        html += '<div style="width: 100%;  padding: 2px; border: 1px solid white;">' + pattern.name + '</div>';
        html += '</div>';
      }      

      var boxWidth = 64;
      html += '<div id="sidAddPattern' + track + '" ';
      html += ' style="position: absolute; display: none; padding: ' + padding +'px;';
      html += ' border: ' + border +'px solid #aaaaaa;';
      html += ' width: ' + boxWidth + 'px; height: 16px;';
      html += ' top: 0px;'
      html += ' left: ' + left + 'px"';
      html += '>';

      html += '+ Pattern';
      html += '</div>';

      $('#sidTrack' + track).html(html);

    }

//    this.setupPatternEvents();

  },


  setAddPatternType: function() {
    var value = $('input[name="sidAddPattern"]:checked').val();
    if(value == 'create') {
      $('#sidAddPatternCreateControl').show();
      $('#sidAddPatternLengthControl').show();
      $('#sidAddPatternExistingControl').hide();

    } else if(value == 'existing') {
      $('#sidAddPatternCreateControl').hide();
      $('#sidAddPatternLengthControl').hide();
      $('#sidAddPatternExistingControl').show();
    }
  },

  showAddPattern: function(track, position, duration) {

    if(typeof duration == 'undefined') {
      duration = 64;
    }

    $('#sidPatternLength').val(duration);

    this.selectedTrack = track;
    this.selectedPosition = position;

    var options = '';
    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
      options += '<option value="' + i + '">';
      options += this.music.doc.data.patterns[i].name;
      options += '</option>'

    }
    var patternIndex = this.music.doc.data.patterns.length + 1;
    var newPatternName = 'Pattern ' + patternIndex;
    $('#sidPatternName').val(newPatternName);

    $('#sidExistingPatterns').html(options);

    this.setAddPatternType();
    UI.showDialog('addPatternDialog');
  },

  addPattern: function(trackId, position, len, newPatternName) {
    var patternLength = parseInt(len);
    //len = parseInt(len);
    //var pattern = new Pattern();
    //var id = this.music.doc.patterns.length + 1;

    var patternId = this.music.patterns.createPattern(newPatternName, patternLength);
    var patternIndex = this.music.tracks.addPattern(trackId, patternId, position);
    this.selectPattern(trackId, patternIndex);
    this.drawPatterns();

/*
    pattern.init(newPatternName, len);
    pattern.patternId = this.music.doc.patterns.length;

    this.music.doc.patterns.push(pattern);

    var patternIndex = this.music.tracks.addPattern(trackId, pattern.patternId, position);

    this.selectPattern(trackId, patternIndex);
    this.drawPatterns();
*/

  },




  addExistingPattern: function(trackId, position, patternId) {

    var patternIndex = this.music.tracks.addPattern(trackId, patternId, position);
    this.selectPattern(trackId, patternIndex);
    this.drawPatterns();
  },

  erasePattern: function(trackId, patternIndex) {
    this.music.tracks.removePattern(trackId, patternIndex);
    this.drawPatterns();
  },


  renamePattern: function(patternId, newName) {
    this.music.doc.data.patterns[patternId].name = newName;
    this.drawPatterns();

  },


  setPatternLength: function(patternId, len) {
    len = parseInt(len);

    if(this.music.patterns.getDuration(patternId) != len) {
      this.music.patterns.setDuration(patternId, len);
      this.drawPatterns();

      this.music.patternView.patternLengthUpdated();

      console.error('need to check if all pattern instances will fit');

    }

  },

  replacePattern: function(track, position, patternId) {
    this.music.doc.data.tracks[track][position] = patternId;
    this.drawPatterns();
    this.music.updateSid(true);    
  },


  setEditPatternType: function() {
    var value = $('input[name="sidEditPattern"]:checked').val();
    if(value == 'rename') {
      $('#sidEditPatternNameControl').show();
      $('#sidEditPatternReplaceControl').hide();

    } else if(value == 'replace') {
      $('#sidEditPatternNameControl').hide();
      $('#sidEditPatternReplaceControl').show();
    }
  },

  showEditPattern: function(patternID) {

    var options = '';
    for(var i = 0; i < this.music.doc.data.patterns.length; i++) {
//      if(this.music.patterns[i].name != 'BLANK') {
      if(this.music.doc.data.patterns[i].name.indexOf('BLANK') !== 0) {  
        options += '<option value="' + i + '">';
        options += this.music.doc.data.patterns[i].name;
        options += '</option>'
      }

    }

    $('#sidPatternEditName').val(this.music.doc.data.patterns[patternID].name);
    $('#sidEditPatternLength').val(this.music.doc.data.patterns[patternID].duration);
    $('#sidPatternReplaceWith').html(options);

    this.setEditPatternType();

    this.music.editor.showDialog('sidEditPatternDialog');    
  },


  selectPattern: function(trackIndex, patternIndex) {

    this.selectedTrack = trackIndex;
    this.selectedPatternIndex = patternIndex;
    var track = this.music.doc.data.tracks[trackIndex];


    this.selectedPatternId = track.patternInstances[patternIndex].patternId;
    var patternPosition = track.patternInstances[patternIndex].position;

    this.music.selectFrom = patternPosition;
    this.music.selectTo = this.music.selectFrom + this.music.patterns.getDuration(this.selectedPatternId);

    this.music.patternView.setPattern(this.selectedPatternId, trackIndex, patternIndex);
  },


  mouseToTrack: function(y) {
    // TODO: the 3 shouldn't be here
    y = this.height - y - 3;
    y -= this.rulerHeight;

    y = y + (this.scrollY / this.canvasScale);

    var track = Math.floor(y / this.trackHeight);

    if(track < 0 || track >= this.music.doc.data.tracks.length) {
      track = -1;
    }
    return track;
  },

  mouseToPatternIndex: function(x, trackIndex) {
    x = x - this.trackInfoWidth;
//    x = x + (this.scrollX / this.canvasScale);

    if(trackIndex < 0 || trackIndex === false || isNaN(trackIndex)) {
      return false;
    }

    var tracks = this.music.doc.data.tracks;

    if(trackIndex >= tracks.length) {
      return false;
    }

    var track = tracks[trackIndex];

    if(track.patternInstances.length == 0) {
      return false;
    }

    this.previousPatternIndex = -1;
    this.nextPatternIndex = 9999;
    for(var i = 0; i < track.patternInstances.length; i++) {

      var patternId = track.patternInstances[i].patternId;
      var position = track.patternInstances[i].position;

      var duration = this.music.patterns.getDuration(patternId);


      if(x >= position * this.patternCellWidth && x <= (position + duration) * this.patternCellWidth) {
        return i;
      }

      if(x >= (position + duration) * this.patternCellWidth) {
        if(this.previousPatternIndex < i) {
          this.previousPatternIndex = i;
        }
      }

      if(x < position * this.patternCellWidth) {
        if(this.nextPatternIndex > i) {
          this.nextPatternIndex = i;  
        }
      }
    }

    return false;
  },

  mouseToTrackPosition: function(x, y) {
    

    if(typeof y != 'undefined' && y < this.height - this.rulerHeight) {
      return -1;
    }

    x = x - this.trackInfoWidth;
//    x = x + (this.scrollX / this.canvasScale);
    if(x < 0) {
      return -1;
    }

    var trackPosition =  Math.floor(x / this.patternCellWidth);

    return trackPosition;
  },



  mouseDownVScroll: function(button, x, y) {
    //y = this.height - y;

    if(y * this.canvasScale < this.rulerCanvas.height + this.vScrollBarPosition) {
      
      this.setYScroll(this.scrollY - 40);
    } else if(y * this.canvasScale > this.rulerCanvas.height +  this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY + 40);
    } else {
      this.vScroll = true;
    }
    this.render();
  },

  mouseDownHScroll: function(button, x, y) {
    x = x - this.trackInfoWidth;

    if(x * this.canvasScale < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 40);
    } else if(x * this.canvasScale > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 40);
    } else {
      this.hScroll = true;
    }

    this.render();
  },  



  mouseDownRuler: function(button, x, y) {

    if(button == 0) {

      var position = this.mouseToTrackPosition(x, y);
      if(position > -1) {
        this.movingPlayhead = true;

        this.music.setPlayheadPosition(position);
      }

    }
  },


  mouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  
  },

  setButtons: function(event) {
    if(typeof event.buttons != 'undefined') {
      this.buttons = event.buttons;
    } else {
      if(typeof event.which !== 'undefined') {
        this.buttons = event.which;

      } else if(typeof event.nativeEvent !== 'undefined') {
        if(typeof event.nativeEvent.which != 'undefined') {
          this.buttons = event.nativeEvent.which;
        }
        if(typeof event.nativeEvent.buttons != 'undefined') {
          this.buttons = event.nativeEvent.buttons;
        }
      }
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {

      this.buttons = UI.LEFTMOUSEBUTTON;
    }

    if(event.ctrlKey && (this.buttons & UI.LEFTMOUSEBUTTON)  ) {
      if(UI.os == 'Mac OS') {
        this.buttons = UI.RIGHTMOUSEBUTTON;
      }
    }
    // cmd + click
    /*
    if(event.metaKey && this.buttons == 1) {
      this.buttons = UI.MIDDLEMOUSEBUTTON;
    }
    */

  },


  toggleMute: function(track) {
    this.music.setMute(track, !this.music.getMute(track));
    this.drawTrackInfo();
    this.render();
  },

  mouseDown: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    this.mouseCaptured = false;

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);

      if(this.buttons & UI.RIGHTMOUSEBUTTON) {
        return;
      }

      if(this.buttons & UI.LEFTMOUSEBUTTON) {
        this.leftMouseUp = false;
      }

      UI.captureMouse(this);
      this.mouseCaptured = true;
      this.mouseIsDown = true;
    }


    // need separate variables for this until inverted y problem fixed
    this.scrollMouseDownAtX = x;
    this.scrollMouseDownAtY = y;
    this.mouseDownAtScrollX = this.scrollX;
    this.mouseDownAtScrollY = this.scrollY;


    // is mouse down in vertical scroll bar
    if(x > this.width - this.vScrollBarWidth - 1 && y < this.height && y > this.rulerHeight) {
      this.scrollClick = true;
      return this.mouseDownVScroll(button, x, y);
    }

    // is mouse down in horizontal scroll bar
    if(x > this.trackInfoWidth && y > this.height - this.hScrollBarHeight) {
      this.scrollClick = true;
      return this.mouseDownHScroll(button, x, y);
    }


    y = this.height - y;



//    this.lastMouseX = x;
//    this.lastMouseY = y;


    if(button == 1) {
      // middle button
      return;
    }

    this.movingPlayhead = false;
    this.cursor.type = 'add';
    this.cursor.dragPatternIndex = false;

    this.mouseDownAtScrollX = this.scrollX;
    this.mouseDownAtScrollY = this.scrollY;


/*
    if(x < this.trackInfoWidth) {
      return;
    }
*/

    if(y > this.height - this.rulerHeight) {
      // mouse down in ruler
      x = x + this.scrollX / this.canvasScale;

      return this.mouseDownRuler(button, x, y);
    }


    var track = this.mouseToTrack(y);
    if(track < 0 || typeof track == 'undefined' || track >= this.music.doc.data.tracks.length) {
      return;
    }


    if(x < this.trackInfoWidth) {

      if(x < 20) {
        UI.setCursor('pointer');
        if(track >= 0 )      
        this.toggleMute(track);
      } else {
        UI.setCursor('default');      
      }

      return;
    }


    x = x + this.scrollX / this.canvasScale;

    this.mouseDownAtX = x;
    this.mouseDownAtY = y;

    // check if mouse down in a track
    var patternIndex = this.mouseToPatternIndex(x, track);

    this.highlightedTrack = track;
    this.highlightedPatternIndex = patternIndex;

    if(this.highlightedTrack !== false && this.highlightedPatternIndex !== false) {

      this.selectedTrack = this.highlightedTrack;
      this.selectedPatternIndex = this.highlightedPatternIndex;

      var track = this.music.doc.data.tracks[this.selectedTrack];
      var patternId = track.patternInstances[this.highlightedPatternIndex].patternId;
      var patternPosition = track.patternInstances[this.highlightedPatternIndex].position;
      var patternDuration = this.music.patterns.getDuration(patternId);

      var patternEndX = (patternPosition + patternDuration) * this.patternCellWidth;
      var trackX = x - this.trackInfoWidth;

      if(patternEndX - trackX < 8) {
        // change to resize
        this.cursor.resizePatternIndex = this.highlightedPatternIndex;
        this.cursor.resizePatternTrack = this.highlightedTrack;
        this.cursor.resizePatternId = patternId;//this.patterns[this.cursor.dragPatternTrack][this.cursor.dragPatternIndex].patternID;
        this.cursor.duration = patternDuration;//this.music.patterns[this.cursor.dragPatternID].getLength();
        this.cursor.position = patternPosition;
        this.cursor.track = this.highlightedTrack; 
        this.cursor.type = 'resize';
      } else {
        this.cursor.dragOffsetX = trackX - (patternPosition * this.patternCellWidth);

        this.cursor.dragPatternIndex = this.highlightedPatternIndex;
        this.cursor.dragPatternTrack = this.highlightedTrack;
        this.cursor.dragPatternID = patternId;
        this.cursor.duration = patternDuration;
        this.cursor.type = 'drag';
      }

      if(this.mode == 'draw' || this.mode == 'select') {
        this.selectPattern(this.selectedTrack, this.selectedPatternIndex);
      } 

    }
    this.drawPatterns();
  },


  mouseWheel: function(event, delta) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var factor = 4;

    this.setYScroll(this.scrollY + wheel.spinY * factor);
    this.setXScroll(this.scrollX + wheel.spinX * factor);

    this.render();
  },


  dragView: function(x, y, deltaX, deltaY) {
    //UI.setCursor('move');
    this.setYScroll(this.scrollY - deltaY);
    this.setXScroll(this.scrollX - deltaX);
    this.render();
  },

  
  mouseMoveVScroll: function(x, y, deltaX, deltaY) {
    var scale = this.vScrollBarHeight / (this.tracksHeight);
    var diffY = (y - this.scrollMouseDownAtY) / scale;

  //    this.setYScroll(this.scrollY - deltaY / scale);
    this.setYScroll(this.mouseDownAtScrollY + diffY);
    this.render();

  },

  mouseMoveHScroll: function(x, y, deltaX, deltaY) {
    

    var scale = this.hScrollBarWidth / (this.tracksWidth);
    var diffX = ((x - this.scrollMouseDownAtX) / scale) * this.canvasScale;

    this.setXScroll(this.mouseDownAtScrollX + diffX);
    this.render();

  },
  
  mouseMove: function(event) {

    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    var deltaX = x - this.lastMouseX;
    var deltaY = y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;

/*
    if(this.buttons & UI.LEFTMOUSEBUTTON || this.buttons & UI.MIDDLEMOUSEBUTTON) {
      if(!this.mouseCaptured) {
        UI.captureMouse(this);
        this.mouseCaptured = true;
      }
    }
    */

  /*  
    // is mouse down in vertical scroll bar
    if(x > this.width - this.vScrollBarWidth && y < this.height - (this.rulerHeight )) {
      return this.mouseDownVScroll(button, x, y);
    }

    // is mouse down in horizontal scroll bar
    if(x > this.trackInfoWidth && y > this.height - this.hScrollBarHeight) {
      return this.mouseDownHScroll(button, x, y);
    }
*/

    if( (this.buttons & UI.MIDDLEMOUSEBUTTON) ) {
      UI.setCursor('drag-scroll');
      this.scrollClick = true;
      this.dragView(x, y, deltaX, deltaY);
      return;
    }


    // currently horzontal scrolling?
    if(this.hScroll || x > this.trackInfoWidth && y > this.height - this.hScrollBarHeight) {
      UI.setCursor('default');      

      if(this.hScroll) {
        this.mouseMoveHScroll(x, y, deltaX, deltaY);
      }
      return;
    }

    // currently vertically scrolling?
    if(this.vScroll || x > this.width - this.vScrollBarWidth && y < this.height - (this.rulerHeight )) {
      UI.setCursor('default');      
      if(this.vScroll) {
        this.mouseMoveVScroll(x, y, deltaX, deltaY);
      }
      return;
    }


    // TODO: fix this..
    y = this.height - y;

//    this.lastMouseX = x;
//    this.lastMouseY = y;

    var highlightedTrack = false;
    var highlightedPatternIndex = false;
    this.cursor.visible = false;

    if(this.movingPlayhead) {
      x += this.scrollX / this.canvasScale;

      var position = this.mouseToTrackPosition(x);
      if(position > -1) {
        this.music.setPlayheadPosition(position);
      }

      this.setHighlightedPattern(highlightedTrack, highlightedPatternIndex);
      return;
    }

    if(y > this.height - this.rulerHeight) {
      // mouse down in ruler
//      return this.mouseDownRuler(button, x, y);
      UI.setCursor('ew-resize');
      this.setHighlightedPattern(highlightedTrack, highlightedPatternIndex);
      return;
    }

    var track = this.mouseToTrack(y);
    
    if(track < 0 || isNaN(track)) {


      UI.setCursor('default');      
      this.setHighlightedPattern(highlightedTrack, highlightedPatternIndex);
      return;
    }

    if(x < this.trackInfoWidth) {

      if(x < 20) {
        UI.setCursor('pointer');      
      } else {
        UI.setCursor('default');      
      }
      this.setHighlightedPattern(highlightedTrack, highlightedPatternIndex);
      return;
    }

    x += this.scrollX / this.canvasScale;

    if(this.cursor.type == 'drag') {
      // currently dragging a pattern

      var cursorPosition = Math.floor((x - this.trackInfoWidth - this.cursor.dragOffsetX) / this.patternCellWidth);
      cursorPosition = Math.floor(cursorPosition / 16) * 16;
      if(cursorPosition < 0) {
        cursorPosition = 0;
      }

      this.cursor.track = track;
      this.cursor.position = cursorPosition;//previousPatternPosition + previousPatternLength;
      this.cursor.visible = true;


      UI.setCursor('move');        
    } else if(this.cursor.type == 'resize') {
      var deltaX = x - this.mouseDownAtX;
      var deltaCells = (deltaX / this.patternCellWidth);
      deltaCells = Math.floor(deltaCells / 16) * 16;
      var patternDuration = this.music.patterns.getDuration(this.cursor.resizePatternId) + deltaCells;

      if(patternDuration < 16) {
        patternDuration = 16;
      }
      this.cursor.duration = patternDuration;//mousePosition - this.cursor.position;
      this.cursor.visible = true;
    } else {
      var patternIndex = this.mouseToPatternIndex(x, track);
      highlightedTrack = track;
      highlightedPatternIndex = patternIndex;

      if(highlightedPatternIndex === false && highlightedTrack !== false) {
        // mouse isn't on a pattern..

        if(this.mode == 'erase') {
          UI.setCursor('default');      
          this.cursor.visible = false;
        } else {
          var cursorPosition = Math.floor((x - this.trackInfoWidth) / this.patternCellWidth);
          cursorPosition = Math.floor(cursorPosition / 16) * 16;

          this.cursor.track = highlightedTrack;
          this.cursor.position = cursorPosition;//previousPatternPosition + previousPatternLength;
          this.cursor.duration = 64;
          this.cursor.visible = true;


          // TODO: readd this
          /*          
          // find if its overlapping any patterns
          for(var i = 0; i < this.patterns[this.highlightedTrack].length; i++) {
            if(this.cursor.position < this.patterns[this.highlightedTrack][i].position && this.cursor.position + this.cursor.duration > this.patterns[this.highlightedTrack][i].position) {
              this.cursor.duration = this.patterns[this.highlightedTrack][i].position - this.cursor.position;
            }
          }
          */


          UI.setCursor('draw');   
        }

      } else {
        if(this.mode == 'erase') {
          UI.setCursor('erase');
        } else {
          var track = this.music.doc.data.tracks[highlightedTrack];
          var patternId = track.patternInstances[highlightedPatternIndex].patternId;
          var position =  track.patternInstances[highlightedPatternIndex].position;

          var patternDuration = this.music.patterns.getDuration(patternId);

          var patternEndX = (position + patternDuration) * this.patternCellWidth;
          var trackX = x - this.trackInfoWidth;


          if(patternEndX - trackX < 8) {
            // change to resize
            UI.setCursor('e-resize');                  
          } else {
            UI.setCursor('can-move');        
          }
        }
      }
    }
    this.setHighlightedPattern(highlightedTrack, highlightedPatternIndex);
  },

  setHighlightedPattern: function(track, patternIndex) {
    if(this.highlightedTrack !== track || this.highlightedPatternIndex !== patternIndex) {
      this.highlightedTrack = track;
      this.highlightedPatternIndex = patternIndex;
      this.drawPatterns();
    }
  },

  mouseUp: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;
    this.buttons = 0;
    y = this.height - y;
    
    var button = event.ui_button;

    if(this.hScroll || this.vScroll || this.scrollClick) {
      this.vScroll = false;
      this.hScroll = false;
      this.scrollClick = false;
    } else {

      if(this.highlightedPatternIndex === false && this.highlightedTrack !== false) {
        // mouse isn't on a pattern..
        // kind of hack to set cursor.visible

        if(this.mode != 'erase') {
          this.cursor.track = this.highlightedTrack;
          //this.cursor.position = cursorPosition;
          this.cursor.duration = 64;
          this.cursor.visible = true;
        }
      }


      if(this.selectedTrack !== false && this.highlightedPatternIndex !== false) {
        if(this.mode == 'erase') {
          if(confirm('Are you sure you want to delete this pattern?')) {
            this.erasePattern(this.selectedTrack, this.selectedPatternIndex);
          }
        }
      } else if(this.cursor.type == 'add' && this.cursor.visible) {
        this.showAddPattern(this.cursor.track, this.cursor.position, this.cursor.duration);
      } else if(this.cursor.type == 'drag' && this.cursor.visible) {
        this.movePattern(this.cursor.dragPatternTrack, this.cursor.dragPatternIndex, this.cursor.track, this.cursor.position);
        // find the pattern
        this.cursor.visible = false;
      } else if(this.cursor.type == 'resize' && this.cursor.visible) {

        var patternId = this.cursor.resizePatternId;
        var newDuration = this.cursor.duration;
        var currentDuration = this.music.patterns.getDuration(patternId);

        if(newDuration != currentDuration) {
          var track = this.cursor.track;
          var position = this.cursor.position;
          this.setPatternLength(patternId, newDuration);
    
          this.drawPatterns();
          this.cursor.visible = false;


        }
      }
    }
//    this.selectedTrack = false
//    this.selectedPatternIndex = false;
    this.movingPlayhead = false;
    this.cursor.type = 'add';
    this.cursor.dragPatternIndex = false;
  },

/*
  setPlayheadPosition: function(position) {
    position = this.patternStart + position;
    $('#sidTrackPlayheadLine').css('left', position + 'px');

    position -= 3;
    $('#sidTrackPlayhead').css('left', position + 'px');

  },
*/
  drawRuler: function() {
    this.rulerContext.fillStyle = '#3d3d3d';
    this.rulerContext.fillRect(0, 0, this.rulerCanvas.width, this.rulerCanvas.height);


    this.rulerContext.beginPath();    
    this.rulerContext.strokeStyle = '#555555';    

    this.rulerContext.font = "8px Verdana";
    this.rulerContext.fillStyle = "#eeeeee";

    for(var i = 0; i < this.trackLength; i++) {
      if(i % 16 == 0) {
        this.rulerContext.moveTo(i * this.patternCellWidth + 0.5, 2);        
        this.rulerContext.lineTo(i * this.patternCellWidth + 0.5, this.rulerCanvas.height / this.canvasScale);

        var bar = 1 + (i / 16);
        this.rulerContext.fillText(bar, i * this.patternCellWidth + 4, this.rulerCanvas.height / this.canvasScale - 9);

      } else {
        this.rulerContext.moveTo(i * this.patternCellWidth + 0.5, 
          this.rulerCanvas.height / this.canvasScale - ((1 * this.rulerCanvas.height / this.canvasScale) / 4) );        
        this.rulerContext.lineTo(i * this.patternCellWidth + 0.5, this.rulerCanvas.height / this.canvasScale);        
      }
    }

    this.rulerContext.stroke();

  },



  drawPlayhead: function() {
    var playheadPositionX = this.trackInfoWidth + this.patternCellWidth * this.music.playheadPosition + 0.5 - Math.round(this.scrollX / this.canvasScale);
    this.context.fillStyle= '#bbbbbb';
    var playHeadWidth = 8;
    var playheadHeight = 7;
    this.context.fillRect( (playheadPositionX - playHeadWidth / 2 + 0.5) * this.canvasScale, 
      (this.rulerHeight - playheadHeight -1) * this.canvasScale, 
      playHeadWidth * this.canvasScale, playheadHeight * this.canvasScale);

    this.context.beginPath();    
//    this.context.strokeStyle = '#bbbbbb';    
    this.context.strokeStyle = '#bbbbbb';    

    this.context.moveTo(playheadPositionX * this.canvasScale, (this.rulerHeight - 1) * this.canvasScale);
    this.context.lineTo(playheadPositionX * this.canvasScale, (this.rulerHeight - 1) * this.canvasScale + this.tracksHeight);
    this.context.stroke();

  },



  drawTrackInfo: function() {
    this.trackInfoContext.fillStyle = '#333333';
    this.trackInfoContext.fillRect(0, 0, this.trackInfoCanvas.width, this.trackInfoCanvas.height);

    this.trackInfoContext.fillStyle = '#2e2e2e';
    this.trackInfoContext.fillRect(0, this.rulerHeight, this.trackInfoCanvas.width, this.trackInfoCanvas.height - this.rulerHeight);

    // draw grid lines
    this.trackInfoContext.beginPath();    
    this.trackInfoContext.strokeStyle = '#222222';    

    this.trackInfoContext.font = "11px Verdana";
    this.trackInfoContext.fillStyle = "#eeeeee";

    for(var i = 0; i < this.music.doc.data.tracks.length; i++) {
      var track = this.music.doc.data.tracks[i];
      this.trackInfoContext.moveTo(0, this.rulerHeight + i * this.trackHeight + 0.5);
      this.trackInfoContext.lineTo(this.trackInfoCanvas.width, this.rulerHeight + i * this.trackHeight + 0.5);
      this.trackInfoContext.fillText(track.name , 26, this.rulerHeight + i * this.trackHeight + 15);

      var muteIcon = this.unmuteIcon;
      if(this.music.getMute(i)) {
        muteIcon = this.muteIcon;        
      }
      if(muteIcon) {
        this.trackInfoContext.filter = "invert(80%)";
        var iconHeight = 16;
        var iconWidth = muteIcon.naturalWidth * iconHeight / muteIcon.naturalHeight;
        this.trackInfoContext.drawImage(muteIcon, 5, this.rulerHeight + i * this.trackHeight + 3 , iconWidth, iconHeight);

        this.trackInfoContext.filter = "none";
      }
    }
    this.trackInfoContext.stroke();  

  },

  drawGrid: function() {

    this.trackContext.fillStyle = '#333333';
    this.trackContext.fillRect(0, 0, this.trackCanvas.width, this.trackCanvas.height);

    this.trackContext.beginPath();    
    this.trackContext.strokeStyle = '#555555';    
    for(var i = 0; i < this.trackLength; i += 16) {
      this.trackContext.moveTo(i * this.patternCellWidth + 0.5, 0);
      this.trackContext.lineTo(i * this.patternCellWidth + 0.5, this.trackCanvas.height);
    }
    this.trackContext.stroke();


    // draw grid lines
    this.trackContext.beginPath();    
    this.trackContext.strokeStyle = '#222222';    
    for(var i = 0; i < this.music.doc.data.tracks.length; i++) {
      this.trackContext.moveTo(0, i * this.trackHeight + 0.5);
      this.trackContext.lineTo(this.trackCanvas.width, i * this.trackHeight + 0.5);
    }
    this.trackContext.stroke();


  },

  drawCursor: function() {
    if(!this.cursor.visible) {
      return;
    }

    var trackCount = this.patterns.length;

    var viewHeight = this.height - this.rulerHeight - this.hScrollBarHeight;
    var track = this.cursor.track;
    var position = this.cursor.position;

    var width = this.cursor.duration * this.patternCellWidth;
    var height = this.trackHeight - 4; 
    var x = this.trackInfoWidth - Math.round(this.scrollX / this.canvasScale) + position * this.patternCellWidth;
    var y = 0;

    var y = this.rulerHeight - Math.round(this.scrollY / this.canvasScale) + track * this.trackHeight + 2;

    // - (trackCount * this.trackHeight - viewHeight)
    //        + (trackCount * this.trackHeight) - ((track + 1) * this.trackHeight);


//    this.context.scale(this.canvasScale, this.canvasScale);
    var cursorColor = 'aaaaff';
    var textColor = 'ffffff';
    this.context.globalAlpha = 0.4;//0.2;
    this.context.fillStyle = '#' + cursorColor;
    this.context.fillRect(x * this.canvasScale, y * this.canvasScale, 
      width * this.canvasScale, height * this.canvasScale);

    if(this.cursor.type == 'add') {
      this.context.font = "10px Verdana";
      this.context.fillStyle = "#" + textColor;
      this.context.fillText("New Pattern", (x + 4)  * this.canvasScale, (y + 12)  * this.canvasScale);
    } else if(this.cursor.type == 'drag') {
      if(this.cursor.dragPatternIndex !== false) {
        var name = this.music.doc.data.patterns[this.cursor.dragPatternID].name;
        this.context.font = "10px Verdana";
        this.context.fillStyle = "#" + textColor;
        this.context.fillText(name, (x + 4)  * this.canvasScale, (y + 12)  * this.canvasScale);      
      }
    }

    this.context.beginPath();
    this.context.strokeStyle = '#ffffff';    

    // draw the box around the note
    this.context.moveTo( (x + 0.5) * this.canvasScale, (y + 0.5) * this.canvasScale);
    this.context.lineTo( (x + width + 0.5)  * this.canvasScale , (y + 0.5)  * this.canvasScale);
    this.context.lineTo( (x + width + 0.5)  * this.canvasScale, (y + height + 0.5)  * this.canvasScale);
    this.context.lineTo( (x + 0.5) * this.canvasScale, (y + height + 0.5) * this.canvasScale);
    this.context.lineTo( (x + 0.5) * this.canvasScale, (y + 0.5) * this.canvasScale);
    this.context.stroke();

    this.context.globalAlpha = 1;
//    this.context.scale(1, 1);

  },

  drawPatterns: function() {

    var selected = false;

    this.drawGrid();





    var tracks = this.music.doc.data.tracks;

    for(var i = 0; i < tracks.length; i++) {

      for(var j = 0; j < tracks[i].patternInstances.length; j++) {
        var patternInstance = tracks[i].patternInstances[j];

        var patternId = patternInstance.patternId;
        var position = patternInstance.position;

        var patternDuration = this.music.patterns.getDuration(patternId);  
        var patternName = this.music.patterns.getName(patternId);    
//        this.highlightedTrack = false;
//        this.highlightedPatternIndex = false;
      
        var x = position * this.patternCellWidth;
        var y = i * this.trackHeight + 2;
        var width = patternDuration * this.patternCellWidth - 1;
        var height = this.trackHeight - 4;


        var patternColor = '444444'
        var textColor = 'eeeeee';
        var borderColor = '555555';

        if(i === this.selectedTrack && j == this.selectedPatternIndex) {
          patternColor = 'dddddd';
          borderColor = 'dfdfdf';
          textColor = '333333';
        } else if(i == this.highlightedTrack && this.highlightedPatternIndex == j) {
          patternColor = '606060';
          textColor = 'eeeeee';
        } else if(patternId === this.selectedPatternId) {
          patternColor = '777777';
          textColor = '333333';
//          borderColor = '0000ff';
        }
        this.trackContext.fillStyle = '#' + patternColor;
        this.trackContext.fillRect(x, y, width, height);

        this.trackContext.fillStyle = '#' + textColor;
        this.trackContext.fillText(patternName, x + 4, y + 12);

        this.trackContext.beginPath();    
//        this.trackContext.strokeStyle = '#aaaaaa';    
        this.trackContext.font = "9px Verdana";
    
        this.trackContext.strokeStyle = '#' + borderColor;
        //if(!selected) {
          // draw the box around the note
          this.trackContext.moveTo(x + 0.5, y + 0.5);
          this.trackContext.lineTo(x + width + 0.5, y + 0.5);
          this.trackContext.lineTo(x + width + 0.5, y + height + 0.5);
          this.trackContext.lineTo(x + 0.5, y + height + 0.5);
          this.trackContext.lineTo(x + 0.5, y + 0.5);
        //}
        this.trackContext.stroke();

      }
    }
  



    return;
    this.trackContext.beginPath();    
    this.trackContext.strokeStyle = '#aaaaaa';    
    this.trackContext.font = "9px Verdana";


    for(var i = 0; i < this.patterns.length; i++) {
      for(var j = 0; j < this.patterns[i].length; j++) {
        var patternID = this.patterns[i][j].patternID;
        var position = this.patterns[i][j].position;
        var pattern = this.music.doc.data.patterns[patternID];
        var patternLength = pattern.getLength();

        var x = position * this.patternCellWidth;
        var y = i * this.trackHeight + 2;
        var width = patternLength * this.patternCellWidth - 1;
        var height = this.trackHeight - 4;

        var patternColor = '444444'
        var textColor = 'eeeeee';

        if(i === this.selectedTrack && j == this.selectedPatternIndex) {
          patternColor = 'dddddd';
          textColor = '333333';
        } else if(patternID == this.selectedPatternId) {
          patternColor = '777777';
          textColor = '333333';
        }
        this.trackContext.fillStyle = '#' + patternColor;
        this.trackContext.fillRect(x, y, width, height);

        this.trackContext.fillStyle = '#' + textColor;
        this.trackContext.fillText(pattern.name, x + 4, y + 12);

        if(!selected) {
          // draw the box around the note
          this.trackContext.moveTo(x + 0.5, y + 0.5);
          this.trackContext.lineTo(x + width + 0.5, y + 0.5);
          this.trackContext.lineTo(x + width + 0.5, y + height + 0.5);
          this.trackContext.lineTo(x + 0.5, y + height + 0.5);
          this.trackContext.lineTo(x + 0.5, y + 0.5);
        }


      }
    }
    this.trackContext.stroke();

  },


  resize: function(left, top, width, height) {


    if(typeof left != 'undefined') {
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
    }

    this.context = this.canvas.getContext("2d");    

    this.setTrackDimensions();
  },

  setTrackDimensions: function() {
    this.tracksHeight = this.trackCount * this.trackHeight * this.canvasScale;    
    this.tracksWidth = this.trackLength * this.patternCellWidth * this.canvasScale;

    this.trackViewWidth = this.canvas.width - this.trackInfoCanvas.width - this.vScrollBarWidth * this.canvasScale;
    this.trackViewHeight = this.canvas.height - this.rulerCanvas.height - this.hScrollBarHeight * this.canvasScale;
  },




  setXScroll: function(scrollX) {
//    scrollX *= this.canvasScale;
    if(scrollX + this.trackViewWidth > this.tracksWidth) {
      scrollX = this.tracksWidth - this.trackViewWidth;
    }

    if(scrollX < 0) {
      scrollX = 0;
    }
    this.scrollX = scrollX;

  },

  scrollToX: function(x) {
    this.setXScroll(x);

  },

  scrollToY: function(y) {
    this.setYScroll(y);
  },

  setYScroll: function(scrollY) {

    if(scrollY < 0) {
      scrollY = 0;
    }

    if(scrollY + this.trackViewHeight > this.tracksHeight) {
      scrollY = this.tracksHeight - this.trackViewHeight;
    }

    if(scrollY < 0) {
      scrollY = 0;
    }

    this.scrollY = scrollY;

  },

  calculateScroll: function() {

    // calculate size of vertical scroll bar
    this.vScrollBarHeight = this.trackViewHeight;

    this.vScrollBarPositionHeight = this.vScrollBarHeight * this.trackViewHeight / (this.tracksHeight);

    if(this.vScrollBarPositionHeight > this.vScrollBarHeight) {
      this.vScrollBarPositionHeight = this.vScrollBarHeight;
    }

//    this.vScrollBarPosition = this.vScrollBarHeight - this.vScrollBarPositionHeight - Math.round(this.scrollY) * this.vScrollBarHeight / (this.tracksHeight);
    // calculate the position of the vertical scroll bar
    this.vScrollBarPosition = (this.scrollY) * this.vScrollBarHeight / this.tracksHeight;


    // calculate the size of the horizontal scroll bar
    this.hScrollBarWidth = this.trackViewWidth;
    this.hScrollBarPositionWidth = this.hScrollBarWidth  * this.trackViewWidth / (this.tracksWidth);
    if(this.hScrollBarPositionWidth > this.hScrollBarWidth) {
      this.hScrollBarPositionWidth = this.hScrollBarWidth;
    }

    // calculate the position of the horizontal scroll bar
    this.hScrollBarPosition = (this.scrollX) * this.hScrollBarWidth / (this.tracksWidth);
  },


  render: function() {

    if(this.context == null) {
      this.context = this.canvas.getContext("2d");    
    }

//    this.scrollX = 0;
//    this.scrollY = 0;


    // canvas, clip rectx, clip rect y, src rect width, src rect heigth


    // draw grid
    this.context.drawImage(
                            this.trackCanvas, 

                            Math.round(this.scrollX),// * this.canvasScale, 
                            Math.round(this.scrollY),
                            this.canvas.width * this.canvasScale, 
                            this.canvas.height * this.canvasScale, 


                            this.trackInfoWidth * this.canvasScale, 
                            this.rulerHeight * this.canvasScale, 
                            this.canvas.width * this.canvasScale, 
                            this.canvas.height * this.canvasScale
                          );


    if(this.cursor.visible) {
      this.drawCursor();
    }

    // the ruler
    this.context.drawImage(
                            this.rulerCanvas, 

                            Math.round(this.scrollX),// * this.canvasScale, 
                            0,
                            this.canvas.width * this.canvasScale, 
                            this.rulerCanvas.height * this.canvasScale, 

                            this.trackInfoWidth * this.canvasScale, 
                            0, 
                            this.canvas.width * this.canvasScale, 
                            this.rulerCanvas.height * this.canvasScale
                          );


    this.drawPlayhead();


    // track info
    this.context.drawImage(
                            this.trackInfoCanvas, 
                            0, 
                            Math.round(this.scrollY),// this.trackCanvas.height - this.canvas.height - Math.round(this.scrollY),  
                            this.trackInfoCanvas.width * this.canvasScale, 
                            this.trackInfoCanvas.height * this.canvasScale, 

                            0, 
                            0, 
                            this.trackInfoCanvas.width * this.canvasScale, 
                            this.trackInfoCanvas.height * this.canvasScale
                            );




    // draw the scroll bars
    this.calculateScroll();

    this.context.fillStyle = styles.ui.scrollbarHolder;//'#111111';

    // horizontal scroll
    this.context.fillRect(
        this.trackInfoWidth * this.canvasScale, 
//        (this.height - this.hScrollBarHeight) * this.canvasScale, 
        this.canvas.height - this.hScrollBarHeight * this.canvasScale,

        this.canvas.width - this.trackInfoWidth * this.canvasScale - this.vScrollBarWidth * this.canvasScale, 
        this.hScrollBarHeight * this.canvasScale);
    this.context.fillStyle = styles.ui.scrollbar;//'#cccccc';

    this.context.fillRect(
      this.trackInfoWidth * this.canvasScale + this.hScrollBarPosition, 
      this.canvas.height - (this.hScrollBarHeight - 1) * this.canvasScale, 
      this.hScrollBarPositionWidth, 
      (this.hScrollBarHeight - 2) * this.canvasScale );

    // vertical scroll
    this.context.fillStyle = styles.ui.scrollbarHolder;//'#111111';
    this.context.fillRect(
      this.canvas.width - this.vScrollBarWidth * this.canvasScale, 
      this.rulerCanvas.height,// * this.canvasScale, 
      this.vScrollBarWidth * this.canvasScale, 
      this.canvas.height  - this.rulerCanvas.height - this.hScrollBarHeight * this.canvasScale);


    this.context.fillStyle = styles.ui.scrollbar;//'#cccccc';
    this.context.fillRect(
      this.canvas.width - (this.vScrollBarWidth - 1) * this.canvasScale, 
      this.rulerCanvas.height +  this.vScrollBarPosition, 
      (this.vScrollBarWidth - 2) * this.canvasScale , 

      this.vScrollBarPositionHeight);//this.vScrollBarPositionHeight);//this.canvasScale;

      
  }

}
