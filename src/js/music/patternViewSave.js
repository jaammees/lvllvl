var PatternView2 = function() {
  this.cellHeight = 15;
  this.cellWidth = 20;

  this.gridHeight = 93;//120;//84;//96;
  this.gridWidth = 100;


  this.pianoRollWidth = 0;
  this.whiteKeyHeight = 0;

  this.left = 0;
  this.top = 0;
  this.width = 0;
  this.height = 0;

  this.rulerHeight = 20;
  this.effectsHeight = this.cellHeight;


  this.playheadPosition = 0;

  this.gridCanvas = null;
  this.gridContext = null;
  this.rulerCanvas = null;
  this.pianoRollCanvas = null;
  this.pianoRollHighlightedNote = -1;
  this.pianoRollSelectedNote = -1;

  this.mouseDownAtX = 0;
  this.mouseDownAtY = 0;
  this.mouseDownAtGridX = 0;
  this.mouseDownAtGridY = 0;
  this.mouseDownAtScrollX = 0;
  this.mouseDownAtScrollY = 0;

  this.lastMouseX = 0;
  this.lastMouseY = 0;

  this.scrollX = 0;
  this.scrollY = 1300;
  this.xScrollSpeed = 0;
  this.yScrollSpeed = 0;

  this.partsPerBeat = 1;
  this.snapToGrid = true;

  this.channel = 0;
  this.patternId = -1;

  this.cursor = {
    duration: 1,
    position: 0,
    pitch: 0,
    visible: false
  };


  this.currentNotePosition = -1;
  this.currentNoteId = false;

  this.selectedNotes = [];
  this.selectedFirstNotePosition = 0;


  this.clipboard = [];

  this.effectStart = -1;

  this.dragOffsetX = 0;
  this.dragOffsetY = 0;
  this.inDrag = false;

  this.resizeNote = false;
  this.resizeDirection = false;
  this.resizeAmount = 0;
  this.inResize = false;




//  this.vScrollBar = null;
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


  this.patternViewPopup = null;


  this.lastTime = 0;
  this.lastScrollTime = 0;

  this.music = null;

  this.mode = 'draw';

  this.effectsChooser = null;

}

PatternView2.prototype = {

  setMode: function(mode) {
    this.mode = mode;
    switch(mode) {
      case 'draw':
        $('#patternViewModeAdd').prop('checked', true);
        UI.setCursor('default');
      break;
      case 'erase':
        $('#patternViewModeErase').prop('checked', true);
        UI.setCursor('default');
        break;
      case 'select':
        $('#patternViewModeSelect').prop('checked', true);
        UI.setCursor('box-select');
        break;
    }

    this.music.trackView.setMode(mode);

  },

  getMode: function() {
    return this.mode;
  },


  buildInterface: function(canvasPanel) {
    var _this = this;

    this.uiComponent = canvasPanel;

    this.uiComponent.on('resize', function(left, top, width, height) {
      _this.resize(left, top, width, height);
    });

    this.uiComponent.on('contextmenu', function(event) {
      event.preventDefault();
      _this.showContextMenu(event);
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

    this.canvas = this.uiComponent.getCanvas();

    this.gridCanvas = document.createElement('canvas');
    this.pianoRollCanvas = document.createElement('canvas');
    this.rulerCanvas = document.createElement('canvas');
    this.setPatternSize(64, 93);
    this.resize();


    this.scrollY = 600;

//    this.initEffectDialog();

  },

  init: function(music) {

    this.music = music;
    this.effectsChooser = new SidEffectsChooser();
    this.effectsChooser.init(this);

  },

  unselectAllNotes: function() {
    if(this.patternId == -1) {
      return;
    }

    this.selectedNotes = [];
    this.music.patterns.deselectAllNotes(this.patternId);
  },

  selectNote: function(noteId) {
    if(this.patternId == -1) {
      return;
    }

    var noteSelected = false;
    for(var i = 0; i < this.selectedNotes.length; i++) {
      if(this.selectedNotes[i] == noteId) {
        noteSelected = true;
        break;
      }
    }

    if(!noteSelected) {
      this.selectedNotes.push(noteId);
    }
    this.music.patterns.setNoteSelected(this.patternId, noteId, true);
  },

  unselectNote: function(note) {

  },



  selectAll: function() {
    if(this.patternId == -1) {
      return;
    }
    this.selectedNotes = [];

    var notes = this.music.patterns.getNotes(this.patternId);
    for(var i = 0; i < notes.length; i++) {
      this.selectedNotes.push(notes[i].noteId);
      this.music.patterns.setNoteSelected(this.patternId, notes[i].noteId, true);
    }

    this.drawPattern();
  },


  cut: function() {
    this.copy();
    this.clearSelected();

  },


  copy: function() {
    this.music.patterns.copySelectedNotes(this.patternId);
  },


  // paste at new position and pitch
  paste: function(pastePosition, pitchOffset, movePlayhead) {
    if(this.patternId == -1) {
      return;
    }

    if(typeof pastePosition == 'undefined') {
      pastePosition = Math.floor(this.playheadPosition);
    }

    if(typeof pitchOffset == 'undefined') {
      pitchOffset = 0;
    }

    if(typeof movePlayhead == 'undefined') {
      movePlayhead = true;
    }

    if(this.music.isPlaying()) {
      movePlayhead = false;
    }


    var endPosition = this.music.patterns.pasteNotes(this.patternId, pastePosition, pitchOffset);

    if(movePlayhead) {
      this.setPlayheadPosition(endPosition);
    }
    this.drawPattern();

  },

  clearSelected: function() {

    if(this.patternId == -1) {
      return;
    }

    this.music.history.startPatternChange(this.patternId);   
    this.music.patterns.clearSelectedNotes(this.patternId);
    this.music.history.endPatternChange(this.patternId);   

    this.drawPattern();
  },

  getPatternId: function() {
    return this.patternId;
  },


  setPattern: function(patternId, channel, trackIndex) {
    if(!this.music.patterns.validPatternId(patternId)) {
      return false;
    }

    this.unselectAllNotes();

    this.channel = channel;
    this.trackIndex = trackIndex;
    this.patternId = patternId;
    var patternDuration = this.music.patterns.getDuration(patternId);
    var patternName = this.music.patterns.getName(patternId);

    if(patternDuration != this.gridWidth) {
      this.setPatternSize(patternDuration, this.gridHeight);
    }
    this.drawPattern();


    $('#patternLabel').html(patternName);    
  },  

  setPatternSize: function(columns, rows) {
    this.gridWidth = columns;
    this.gridHeight = rows;

    this.gridCanvas.width = this.gridWidth * this.cellWidth;
    this.gridCanvas.height = this.gridHeight * this.cellHeight;
    this.gridContext = this.gridCanvas.getContext('2d');

    this.pianoRollWidth = 3 * this.cellWidth;
    this.pianoRollCanvas.width = this.pianoRollWidth;
    this.pianoRollCanvas.height = this.gridHeight * this.cellHeight;
    this.pianoRollContext = this.pianoRollCanvas.getContext('2d');   

    this.rulerCanvas.width = this.gridWidth * this.cellWidth;
    this.rulerCanvas.height = this.rulerHeight + this.effectsHeight;
    this.rulerContext = this.rulerCanvas.getContext('2d'); 

    this.drawGrid();
    this.drawPianoRoll();
    this.drawRuler();


  },

  layout: function() {

  },




  setXScroll: function(scrollX) {
    var viewWidth = this.width - this.pianoRollWidth - this.vScrollBarWidth;
    if(scrollX + viewWidth > this.gridWidth * this.cellWidth) {
      scrollX = this.gridWidth * this.cellWidth - viewWidth;
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

    var viewHeight = this.height - this.rulerHeight - this.effectsHeight - this.hScrollBarHeight;

    if(scrollY + viewHeight > this.gridHeight * this.cellHeight) {
      scrollY = this.gridHeight * this.cellHeight - viewHeight;
    }

    this.scrollY = scrollY;

  },


  setPlayheadPosition: function(position) {

    if(this.patternId < 0) {
      return;
    }

    var patternDuration = this.music.patterns.getDuration(this.patternId);


    if(position < 0 || position > patternDuration) {
      return;
    }
    this.playheadPosition = position;

    var globalPosition = this.music.getGlobalPosition(this.channel, this.trackIndex, position);
    this.music.setPlayheadPosition(globalPosition);
  },

  mouseToGrid: function(x, y, round) {
    var gridX = 0;

    x -= this.pianoRollWidth;
    y -= this.hScrollBarHeight;


    if(typeof round == 'undefined') {
      round = false;
    }

    if(round) {
      gridX = Math.round((x + this.scrollX) / this.cellWidth) * this.partsPerBeat;
    } else {
      if(this.snapToGrid) {
        gridX = Math.floor((x + this.scrollX) / this.cellWidth) * this.partsPerBeat;
      } else {
        gridX = Math.floor((x + this.scrollX) * this.partsPerBeat / this.cellWidth);
      }
    }
    var gridY = Math.floor((y + this.scrollY) / this.cellHeight);

    return {"x": gridX, "y": gridY};

  },


  keyCodeToNote: function(keyCode) {
    var note = -1;
    switch(keyCode) {
      case 65: // a
        note = 0;
      break;
      case 87: // w
        note = 1;
      break;
      case 83: // s
        note = 2;
      break;
      case 69: // e
        note = 3;
      break;
      case 68: // d
        note = 4;
      break;
      case 70: // f
        note = 5;
      break;
      case 84: // t
        note = 6;
        break;
      case 71: // g
        note = 7;
      break;
      case 89: // y
        note = 8;
      break;
      case 72: // h
        note = 9;
      break;
      case 85: // u
        note = 10;
      break;
      case 74: // j
        note = 11;
      break;
      case 75: // k
        note = 12;
      break;
      case 79: //o
        note = 13;
        break;
      case 76: // l
        note = 14;
      break;
      case 80: // p
        note = 15;
      break;
      case 186: // ;
        note = 16;
      break;
      case 222:
        note = 17;
      break;
    }    
    return note;
  },


  keyDown: function(event) {
    var keyCode = event.keyCode;

    if(keyCode == 39) {
      // right arrow
      this.setPlayheadPosition(Math.floor(this.playheadPosition  + 1));
    }

    if(keyCode == 37) {
      // left arrow
      this.setPlayheadPosition(Math.floor(this.playheadPosition  - 1));
    }

    var note = this.keyCodeToNote(keyCode);
    var octave = 3;


    if(note != -1 && note != this.keyboardNote) {
      var pitch = note + 12 * octave;
      var instrumentId = this.music.instruments.currentInstrumentId;
      var length = this.partsPerBeat;

      if(!this.snapToGrid) {
        length = 1;
      }




      this.recordMode = $('#sidRecord').is(':checked');
      if(this.recordMode) {

        if(!this.keyboardPlayingNote) {
          this.music.history.startPatternChange(this.patternId);   
        }

        this.lastDuration = length;
        var position = Math.floor(this.playheadPosition);

        // key down add note
        this.music.doc.patterns[this.patternId].addNote(position, 
                                                    instrumentId, 
                                                    pitch, 
                                                    length);
        this.currentNotePosition = position;

        var legato = $('#legato').is(':checked');
        if(legato) {
          this.music.patterns.addEffect(this.patternId, position, 17, 0, 0);
        }


//      this.updatePattern();
        this.drawPattern();

      }

      this.keyboardPlayingNote = true;
      this.highlightNoteInPianoRoll(pitch);

      if(this.music) {
        this.music.musicPlayer2.playTestInstrument(pitch, this.music.instruments.getInstrument(instrumentId), this.channel);
      }


    }
    this.keyboardNote = note;
  },


  keyUp: function(event) {
    var keyCode = event.keyCode;


    if(this.keyboardPlayingNote) {
      var note = this.keyCodeToNote(keyCode);

      if(note == this.keyboardNote) {
        this.keyboardPlayingNote = false;
        this.keyboardNote = -1;

        if(this.recordMode) {


          if(this.currentNotePosition != -1) {

            var position = Math.floor(this.playheadPosition);
            var noteDuration = position - this.currentNotePosition;
            if(noteDuration > 0) {
              // key up
              if(this.music.patterns.setNoteDuration(this.patternId, this.currentNotePosition, noteDuration)) {
              }
            }
            this.currentNotePosition = -1;
          }

          this.music.history.endPatternChange(this.patternId);   

//          this.updatePattern();
          this.drawPattern();
        }

        this.music.musicPlayer2.stopTestInstrument();
        this.unhighlightNoteInPianoRoll();
      }
    }
  },

  mouseDownPianoRoll: function(button, x, y) {

    if(this.pianoRollHighlightedNote != -1) {
      if(this.pianoRollHighlightedNote != this.pianoRollSelectedNote) {
        this.pianoRollSelectedNote = this.pianoRollHighlightedNote;
        var instrumentId = this.music.instruments.currentInstrumentId;


        if(this.music) {
          this.music.musicPlayer2.playTestInstrument(this.pianoRollSelectedNote, 
            this.music.instruments.getInstrument(instrumentId), this.channel);
        }


        this.drawPianoRoll();
      }
    }
  },

  mouseDownRuler: function(button, x, y) {

    var grid = this.mouseToGrid(x, y, true);
    this.movingPlayHead = true;
    this.setPlayheadPosition(grid.x);

  },

  mouseDownEffectsDraw: function(button, x, y) {
    var grid = this.mouseToGrid(x, y);
    this.effectStart = grid.x;


  },

  mouseDownGridSelect: function(button, x, y) {
    var grid = this.mouseToGrid(x, y);

    this.mouseDownAtGridX = grid.x;
    this.mouseDownAtGridY = grid.y;

    if(this.resizeNote !== false) {

      // mouse is over a note
      var pattern = this.music.doc.patterns[this.patternId];
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;

      if(!this.music.patterns.getNoteSelected(this.patternId, this.resizeNote)) {
        // dragging a note thats not selected
        this.unselectAllNotes();
        this.selectNote(this.resizeNote);

      }
      this.setFirstSelectedNotePosition();
      this.inDrag = true;
      this.drawPattern();


    } else {

      var position = grid.x;
      var pitch = grid.y;

      this.inSelect = true;
      this.selectStartX = x + this.scrollX - this.pianoRollWidth;
      this.selectStartY = y + this.scrollY;
      this.selectRight = this.selectLeft =  this.selectStartX;
      this.selectTop = this.selectBottom =  this.selectStartY;

      // unselect any selected notes
      this.unselectAllNotes();
      this.drawPattern();

    }

  },

  mouseDownGridErase: function(button, x, y) {
    var grid = this.mouseToGrid(x, y);

    var noteId = this.gridToNoteId(grid.x, grid.y);
    if(note !== false) {
      this.selectNote(noteId);
      this.drawPattern();      
    }

  },

  mouseDownGridDraw: function(button, x, y) {
    var grid = this.mouseToGrid(x, y);

    this.mouseDownAtGridX = grid.x;
    this.mouseDownAtGridY = grid.y;

    if(this.resizeNote !== false) {
      // mouse is over a resize

      this.music.history.startPatternChange(this.patternId);   

      this.inResize = true;
      this.resizeAmount = 0;

      this.drawPattern();
      if(this.resizeDirection == 'east') {  
//        this.currentNotePosition = this.resizeNote;
      } else if(this.resizeDirection == 'west') {

/*
        // need to find the end of the note..
        this.currentNotePosition = this.resizeNote;

        var pattern = this.music.doc.patterns[this.patternId];
        var instrument = pattern.data[this.currentNotePosition].instrument;
        this.currentNotePosition++;
        while(this.currentNotePosition < pattern.data.length &&
              pattern.data[this.currentNotePosition].start == false &&
              pattern.data[this.currentNotePosition].instrument == instrument) {
          this.currentNotePosition++;
        }
        this.currentNotePosition--;

        */
      } else if(this.resizeDirection == 'grab') {        

        console.log('drag ' +  + this.currentNoteId);

        UI.setCursor('drag');


        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.unselectAllNotes();
        this.selectNote(this.currentNoteId);
        this.setFirstSelectedNotePosition();
        this.inDrag = true;

        this.drawPattern();


      } else {
      }

    } else {
      // draw a note

      var position = grid.x;
      var pitch = grid.y;
      var legato = $('#legato').is(':checked');

      if(pitch != this.pianoRollSelectedNote) {
        this.pianoRollSelectedNote = pitch;
        this.drawPianoRoll();
      }

      var instrumentId = this.music.instruments.currentInstrumentId;
      var length = 1;


        if(this.music) {            
          this.music.musicPlayer2.playTestInstrument(pitch, 
            this.music.instruments.getInstrument(instrumentId), 
            this.channel);
        }



      if(position >= 0) {
        if(this.patternId == -1) {
          return;
        }

        this.music.history.startPatternChange(this.patternId);

        this.currentNoteId = this.music.patterns.addNote(this.patternId, { position: position, 
                                                                           instrumentId: instrumentId, 
                                                                           pitch: pitch, 
                                                                           length: length });

        if(legato) {
          this.music.patterns.addEffect(this.patternId, position, 17, 0, 0);
        }

        this.inResize = true;
        this.resizeNote = position;
        this.resizeAmount = 0;

        this.resizeDirection = 'east';
        this.drawPattern();
      }
    }
  },


  showContextMenu: function(event) {
    if(this.patternId == -1) {
      return;
    }

    var selectedInstrument = false;
    if(this.currentNoteId !== false) {
      var note = this.music.patterns.getNote(this.patternId, this.currentNoteId);
      selectedInstrument = note.ins;
    }

    if(this.patternViewPopup == null) {
      this.patternViewPopup = new PatternViewPopup();

      var _this = this;
      this.patternViewPopup.init(this.music, function() {
        // can't show it until the html has loaded..
        _this.patternViewPopup.show({ "selectedInstrument": selectedInstrument });
      });
    } else {
      this.patternViewPopup.show({ "selectedInstrument": selectedInstrument });
    }
  },


  mouseDownVScroll: function(button, x, y) {
    y = this.height - y;

    if(y < this.rulerHeight + this.effectsHeight + this.vScrollBarPosition) {
      this.setYScroll(this.scrollY + 20);

    } else if(y > this.rulerHeight + this.effectsHeight +  this.vScrollBarPosition + this.vScrollBarPositionHeight) {
      this.setYScroll(this.scrollY - 20);
    } else {
      this.vScroll = true;
    }


  },

  mouseDownHScroll: function(button, x, y) {
    x = x - this.pianoRollWidth;

    if(x < this.hScrollBarPosition) {
      this.setXScroll(this.scrollX - 20);
    } else if(x > this.hScrollBarPosition + this.hScrollBarPositionWidth) {
      this.setXScroll(this.scrollX + 20);
    } else {
      this.hScroll = true;
    }
  },

  mouseDown: function(event) {
    var x = event.offsetX;
    var y = event.offsetY;

    // TODO: fix this..
    y = this.height - y;

    var button = event.ui_button;

    if(button == 1) {
      // middle button
      return;
    }

    if(button == 2) {
      // right click
//      this.showContextMenu();
      return;
    }
    this.movingPlayHead = false;

    this.mouseDownAtX = x;
    this.mouseDownAtY = y;
    this.mouseDownAtScrollX = this.scrollX;
    this.mouseDownAtScrollY = this.scrollY;

    this.effectStart = -1;


    // is mouse down in vertical scroll bar
    if(x > this.width - this.vScrollBarWidth && y < this.height - (this.rulerHeight + this.effectsHeight )) {
      return this.mouseDownVScroll(button, x, y);
    }

    // is mouse down in horizontal scroll bar
    if(x > this.pianoRollWidth && y < this.hScrollBarHeight) {
      return this.mouseDownHScroll(button, x, y);
    }

    if(x < this.pianoRollWidth) {
      return this.mouseDownPianoRoll(button, x, y);
    }


    if(x > this.pianoRollWidth) {
      if(y > this.height - (this.rulerHeight )) {
        return this.mouseDownRuler(button, x, y);
      } else if(y > this.height - (this.rulerHeight + this.effectsHeight)) {
        return this.mouseDownEffectsDraw(button, x, y);
      } else {
        if(this.mode == 'draw') {
          return this.mouseDownGridDraw(button, x, y);
        } else if(this.mode == 'select') {
          return this.mouseDownGridSelect(button, x, y);          
        } else if (this.mode == 'erase') {
          return this.mouseDownGridErase(button, x, y);
        }

      }
    }
  },

  mouseWheel: function(event, delta) {
    console.log('mouse wheel, stop propagation');
    event.stopPropagation();  
    event.preventDefault();  

    var factor = 1;

    factor = event.deltaFactor / 6;


    this.setYScroll(this.scrollY + event.deltaY * factor);
    this.setXScroll(this.scrollX + event.deltaX * factor);

  },

  // select the notes under the select box
  selectNotes: function() {
    if(this.patternId == -1) {
      return;
    }
//    var pattern = this.music.doc.patterns[this.patternId];

    var patternDuration = this.music.patterns.getDuration(this.patternId);
    var patternData = this.music.patterns.getPatternData(this.patternId);

    var prevSelectedNotes = [];
    for(var i = 0; i < this.selectedNotes.length; i++) {
      prevSelectedNotes.push(this.selectedNotes[i]);
    }

    var selectedNotesChanged = false;

    var selectFrom = Math.floor(this.selectLeft / this.cellWidth);
    var selectTo = Math.floor(this.selectRight / this.cellWidth);

    var selectTop = Math.floor(this.selectTop / this.cellHeight);
    var selectBottom = Math.floor(this.selectBottom / this.cellHeight);

    if(!this.music.shiftDown && !this.music.ctrlDown && !this.music.cmdDown) {
      this.unselectAllNotes();
    }

    if(selectFrom < 0) {
      selectFrom = 0;
    }

    if(selectTo >= patternDuration) {
      selectTo = patternDuration - 1;
    }    

    for(var i = selectFrom; i <= selectTo; i++) {
      var instrument = patternData[i].instrument;
      var pitch = patternData[i].pitch;
      var duration = patternData[i].duration;

      if(instrument != 0 && pitch >= selectBottom && pitch <= selectTop) {

        if(patternData[i].start == true && !patternData[i].selected) {
          patternData[i].selected = true;
          this.selectedNotes.push(i);
        } else {
          for(var j = i; j >= 0; j--) {
            if(patternData[j].start == true) {
              if(!patternData[j].selected) {
                this.selectedNotes.push(j);
                patternData[j].selected = true;
              }
              break;
            }
          }
        }
      }
    }

    if(this.selectedNotes.length != prevSelectedNotes.length) {
      selectedNotesChanged = true;
    } else {
      if(this.selectedNotes.length != 0) {
        for(var i = 0; i < this.selectedNotes.length; i++) {
          var found = false;
          for(var j = 0; j < prevSelectedNotes.length; j++) {
            if(this.selectedNotes[i] == prevSelectedNotes[j]) {
              found = true;
              break;
            }
          }
        }

        if(!found) {
          selectedNotesChanged = true;
        }
      }
    }
    if(selectedNotesChanged) {
      // find the position of the first selected note.
      this.setFirstSelectedNotePosition();

      this.drawPattern();
    }
  },

  // find the position of the first selected note
  setFirstSelectedNotePosition: function() {
    var patternData = this.music.patterns.getPatternData(this.patternId);

    this.selectedFirstNotePosition = 0;
    for(var i = 0; i < patternData.length; i++) {
      if(patternData[i].selected) {
        this.selectedFirstNotePosition = i;
        break;
      }
    }


  },

  mouseMoveGridSelect: function(x, y, deltaX, deltaY) {
    if(this.inSelect) {
      x = x + this.scrollX - this.pianoRollWidth;
      y = y + this.scrollY;

      if(x == this.selectStartX) {
        x++;
      }

      if(y == this.selectStartY) {
        y++;
      }

      if(x > this.selectStartX) {
        this.selectLeft = this.selectStartX;
        this.selectRight = x;

      } else {
        this.selectLeft = x;
        this.selectRight = this.selectStartX;;        
      }

      if(y > this.selectStartY) {
        this.selectBottom = this.selectStartY;
        this.selectTop = y;
      } else {
        this.selectBottom = y;
        this.selectTop = this.selectStartY;
      }  

      this.selectNotes();
    } else {
      if(this.patternId == -1) {
        return;
      }


      this.resizeNote = false;
      this.resizeDirection = false;

      var grid = this.mouseToGrid(x, y);
      var pitch = grid.y;
      var position = grid.x;

      var patternDuration = this.music.patterns.getDuration(this.patternId);
      var patternData = this.music.patterns.getPatternData(this.patternId);

      if(position >= patternDuration) {
        position = patternDuration - 1;
      }

      var noteId = this.gridToNoteId(position, pitch);
      if(noteId !== false) {
//      if(patternData[position].pitch == pitch && patternData[position].instrument != 0) {
        // mouse is over a note..

/*
        // find the start of the note
        while(!patternData[position].start && position > 0) {
          position--;
        }
*/
        this.currentNoteId = noteId;
        this.resizeDirection = 'grab';
        UI.setCursor('can-drag');        
      } else {
        UI.setCursor('box-select');
      }
    }
  },

  gridToNoteId: function(position, pitch) {
    if(this.patternId == -1) {
      return;
    }

    if(position >= this.gridWidth || pitch > this.gridHeight) {
      return false;
    }

    var noteId = this.music.patterns.getNoteId(this.patternId, position, pitch);
    return noteId;

/*
    var patternData = this.music.patterns.getPatternData(this.patternId);


    if(patternData[position].pitch != pitch || patternData[position].instrument == 0) {
      return false;
    }

    // find the start of the note
    while(!patternData[position].start && position > 0) {
      position--;
    }

    return position;
*/
  },

  mouseMoveGridDraw: function(x, y, deltaX, deltaY) {
    if(this.patternId == -1) {
      return;
    }

    var grid = this.mouseToGrid(x, y);
    var position = grid.x;

    var patternDuration = this.music.patterns.getDuration(this.patternId);

    if(position >= patternDuration) {
      position = patternDuration - 1;
    }

    var pitch = grid.y;
    UI.setCursor('draw');   

    // is a note being resized?
    if(this.inResize && this.currentNoteId !== false) {
      // get the note being resized
      var resizeNote = this.music.patterns.getNote(this.patternId, this.currentNoteId);

      var resizeNoteStart = resizeNote.pos;
      var resizeNoteDuration = resizeNote.dur;
      if(this.resizeDirection == 'east') {
        this.resizeAmount = position - (resizeNoteStart + resizeNoteDuration) + 1;
      } else if(this.resizeDirection == 'west') {
        this.resizeAmount = resizeNoteStart - position;
      }

      return;
    }

    // is a note selected
    if(this.currentNotePosition != -1) {
      // resizing a note..

      if(this.resizeDirection == 'west') {
        this.music.patterns.setNoteStart(this.patternId, this.currentNoteId, grid.x);

//        this.music.patterns.setNoteStart(this.patternId, this.currentNotePosition, grid.x);

        this.drawPattern();

      } else if(this.resizeDirection == 'east') {
//        console.log('set note duration');

        var noteDuration = position + 1 - this.currentNotePosition;
        if(noteDuration > 0) {

          // resizing a note..
          this.music.patterns.setNoteDuration(this.patternId, this.currentNoteId, noteDuration);
          this.drawPattern();
/*
          if(this.music.patterns.setNoteDuration(this.patternId, this.currentNotePosition, noteDuration)) {
            this.drawPattern();
          }
*/          
        }
      }
    }


    // if no note is selected, show the cursor, work out if the mouse if over resize or drag regions of a note
    if(this.currentNotePosition == -1) {

      this.cursor.position = grid.x;
      this.cursor.pitch = grid.y;
      this.cursor.duration = 1;
      this.cursor.visible = true;

      if(this.pianoRollHighlightedNote != this.cursor.pitch) {
        this.pianoRollHighlightedNote = this.cursor.pitch;
        this.drawPianoRoll();
      }

      this.resizeNote = false;
      this.resizeDirection = false;

      // no note selected
      var noteId = this.gridToNoteId(position, pitch);
      if(noteId !== false) {
        var note = this.music.patterns.getNote(this.patternId, noteId);

        var notePosition = note.pos;
        var noteStartX = this.pianoRollWidth + notePosition * this.cellWidth - this.scrollX;
        var noteDuration = note.dur;//this.music.patterns.getNoteDuration(this.patternId, notePosition);
        var noteEndX = noteStartX + noteDuration * this.cellWidth;

        if(x > noteStartX && x < noteStartX + this.cellWidth / 6) {
          this.resizeNote = notePosition;
          this.currentNoteId = noteId;
          this.resizeDirection = 'west';
          UI.setCursor('w-resize');   
        } else if(x < noteEndX && x > noteEndX - this.cellWidth / 4) {
          this.resizeNote = notePosition;
          this.currentNoteId = noteId;
          this.resizeDirection = 'east';
          UI.setCursor('e-resize');        
        } else {
          if(this.currentNotePosition !== -1) {
            if(this.resizeDirection == 'east') {
              UI.setCursor('e-resize');        
            } else if(this.resizeDirection == 'west') {
              UI.setCursor('w-resize');                          
            }

          } else {
            this.resizeNote = notePosition;
            this.resizeDirection = 'grab';
            UI.setCursor('can-drag');        

          }
        }

      }

    }
  },


  mouseMovePianoRoll: function(x, y, deltaX, deltaY) {
    var grid = this.mouseToGrid(x, y, true);
    var pitch = grid.y;

    // dont want to highlight black notes if not over them
    if(x > this.blackKeyWidth) {
      y = y + this.scrollY;
      var whiteKey = Math.floor(y / this.whiteKeyHeight);
      var octave = Math.floor(whiteKey / 7);
      var octaveNote = whiteKey % 7;
      switch(octaveNote) {
        case 0:
          octaveNote = 0;
        break;
        case 1:
          octaveNote = 2;
        break;
        case 2:
          octaveNote = 4;
        break;
        case 3:
          octaveNote = 5;
        break;
        case 4:
          octaveNote = 7;          
        break;
        case 5:
          octaveNote = 9;          
        break;
        case 6:
          octaveNote = 11;          
        break;
      }
      var pitch = octave * 12 + octaveNote;


    } else {
      pitch = grid.y;
    }

    if(this.pianoRollHighlightedNote != pitch) {
      this.pianoRollHighlightedNote = pitch;
      this.drawPianoRoll();
    }
  },


  mouseMoveDrag: function(x, y, deltaX, deltaY) {
    var grid = this.mouseToGrid(x, y);
    this.dragOffsetX = grid.x - this.mouseDownAtGridX;
    this.dragOffsetY = grid.y - this.mouseDownAtGridY;

    if(this.selectedFirstNotePosition + this.dragOffsetX < 0) {
      this.dragOffsetX = -this.selectedFirstNotePosition;
    }
  },


  mouseMovePlayhead: function(x, y, deltaX, deltaY) {
    var grid = this.mouseToGrid(x, y, true);
    this.setPlayheadPosition(grid.x);
  },

  mouseMoveEffectsDraw: function(x, y, deltaX, deltaY) {
    var grid = this.mouseToGrid(x, y);

    this.cursor.position = grid.x;
    this.cursor.pitch = -1;
    this.cursor.duration = 1;
    this.cursor.visible = true;


    if(this.effectStart > -1) {    
      // currently drawing an effect
      this.effectsEnd = grid.x;
  
      this.cursor.position = this.effectStart;
      this.cursor.duration = this.effectsEnd - this.effectStart + 1;
    }

  },

  dragView: function(x, y, deltaX, deltaY) {
      //UI.setCursor('move');
    this.setYScroll(this.scrollY - deltaY);
    this.setXScroll(this.scrollX - deltaX);
  },

  mouseMoveVScroll: function(x, y, deltaX, deltaY) {
    var scale = this.vScrollBarHeight / (this.gridHeight * this.cellHeight);
    var diffY = (y - this.mouseDownAtY) / scale;

//    this.setYScroll(this.scrollY - deltaY / scale);
    this.setYScroll(this.mouseDownAtScrollY + diffY);
  },

  mouseMoveHScroll: function(x, y, deltaX, deltaY) {
    var scale = this.hScrollBarWidth / (this.gridWidth * this.cellWidth);
    var diffX = (x - this.mouseDownAtX) / scale;
//    this.setXScroll(this.scrollX + deltaX / scale);
    this.setXScroll(this.mouseDownAtScrollX + diffX);
  },

  mouseMove: function(event) {//x, y, deltaX, deltaY) {
    var x = event.ui_offsetX;
    var y = event.ui_offsetY;

    // TODO: fix this..
    y = this.height - y;

    var deltaX = x - this.lastMouseX;
    var deltaY = y - this.lastMouseY;

    this.lastMouseX = x;
    this.lastMouseY = y;


    this.cursor.visible = false;

    // check middle button
    if(UI.mouseIsDown[1]) {
      this.dragView(x, y, deltaX, deltaY);
    }

    // currently horzontal scrolling?
    if(this.hScroll) {
      this.mouseMoveHScroll(x, y, deltaX, deltaY);
      return;
    }

    // currently vertically scrolling?
    if(this.vScroll) {
      this.mouseMoveVScroll(x, y, deltaX, deltaY);
      return;
    }

    // if left button is down, scroll the view if mouse is outside it
    if(UI.mouseIsDown[0]) {

      // left button
      // scroll view if mouse goes outside it
      if(x > this.width) {
        this.setXScroll(this.scrollX + 2);
        this.xScrollSpeed = 1;
      }
      if(x < this.pianoRollWidth && !this.pianoRollMouseDown) {
        this.setXScroll(this.scrollX - 2);
        this.xScrollSpeed = -1;
      }

      if(!this.movingPlayHead && this.effectStart == -1) {
        if(y < 0 ) {
          this.setYScroll(this.scrollY - 2);
          this.yScrollSpeed = 1;
        }

        if(y > this.height || (this.currentNotePosition != -1 && y >= this.height - this.rulerHeight - this.effectsHeight - 2)) {
          this.setYScroll(this.scrollY + 2);
          this.yScrollSpeed = -1;
        }
      }

    }

    // is mouse over vertical scroll bar?
    if(x > this.width - this.vScrollBarWidth && y < this.height - (this.rulerHeight + this.effectsHeight )) {
      UI.setCursor('default');      
      return;
    }

    // is mouse over horizontal scroll bar
    if(x > this.pianoRollWidth && y < this.hScrollBarHeight) {
      UI.setCursor('default');      
      return;
    }


    // is mouse in piano roll?
    if(x < this.pianoRollWidth) {
      UI.setCursor('pointer');   
      this.mouseMovePianoRoll(x, y, deltaX, deltaY);   
      return;
    }

    if(this.movingPlayHead) {
      return this.mouseMovePlayhead(x, y, deltaX, deltaY);
    }
    if(this.inDrag) {
      // currently dragging notes
      return this.mouseMoveDrag(x, y, deltaX, deltaY);
    }

//    if(this.effectStart > -1) {

    if(y > this.height - this.rulerHeight) {
      UI.setCursor('ew-resize');
      return;
    }
    // is mouse in effects?
    if(y > this.height - (this.rulerHeight + this.effectsHeight) || this.effectStart > -1) {
      if(this.mode == 'erase') {
        UI.setCursor('erase');
      }
      if(this.mode == 'draw') {
        UI.setCursor('draw');
      }
      return this.mouseMoveEffectsDraw(x, y, deltaX, deltaY);
    }


    if(x > this.pianoRollWidth) {
      if(y > this.height - (this.rulerHeight + this.effectsHeight)) {
      } else {
        if(this.mode == 'erase') {
          UI.setCursor('erase');
        }
        if(this.mode == 'draw') {
          return this.mouseMoveGridDraw(x, y, deltaX, deltaY);
        } 
        if(this.mode == 'select') {
          return this.mouseMoveGridSelect(x, y, deltaX, deltaY);
        }
      }
    }

  },

  mouseUpDrag: function(button, x, y) {
    if(this.patternId == -1) {
      return;
    }


    this.music.history.startPatternChange(this.patternId);   

    // dont want to record the individual cut and paste actions
    this.music.history.setEnabled(false);

    this.cut();

    var position = 0;
    // find position of first note

    var patternData = this.music.patterns.getPatternData(this.patternId);
    for(var i = 0; i < patternData.length; i++) {
      if(patternData[i].selected) {
        position = i;
        break;
      }
    }

    position += this.dragOffsetX;
    var pitchOffset = this.dragOffsetY;


    // dont update playhead on paste
    this.paste(position, pitchOffset, false);

    this.music.history.setEnabled(true);
    this.music.history.endPatternChange(this.patternId);       

  },

  mouseUpEffectsDraw: function(button, x, y) {
    var grid = this.mouseToGrid(x,y);
    this.effectEnd = grid.x;

//    this.chooseEffect(this.effectStart, grid.x);

    this.effectsChooser.chooseEffect(this.effectStart, this.effectEnd);

    this.effectStart = -1;
  },

  mouseUpErase: function(button, x, y) {
    var grid = this.mouseToGrid(x,y);

    var noteId = this.gridToNoteId(grid.x, grid.y);
    // mouse is up on the note it was down on, so erase
    if(this.selectedNotes.length > 0 && this.selectedNotes[0] == noteId) {
      this.music.history.startPatternChange(this.patternId);
//      this.music.doc.patterns[this.patternId].eraseNote(note);
      this.music.patterns.eraseNote(this.patternId, noteId);
      
      this.music.history.endPatternChange(this.patternId);
//      this.updatePattern();

    }

    if(this.selectedNotes.length > 0) {
      this.unselectAllNotes();
      this.drawPattern();
    }
  },

  mouseUp: function(event) {
    var x = event.offsetX;
    var y = event.offsetY;

    // TODO: fix this..
    y = this.height - y;


    var button = event.ui_button;

//    y = window.innerHeight - y - 1;

    if(this.inDrag) {
      this.mouseUpDrag(button, x, y);

      if(this.mode == 'draw') {
        this.unselectAllNotes();
        this.drawPattern();
      } else {

        var patternData = this.music.patterns.getPatternData(this.patternId);

        // need to update selected notes now they;ve moved
        this.selectedNotes = [];
        for(var i = 0; i < patternData.length; i++) {
          if(patternData[i].selected) {
            this.selectedNotes.push(i);
          }
        }
      }

      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    } else if(this.inResize) {

      if(this.resizeAmount != 0 && this.resizeNote !== false) {

        if(this.resizeDirection == 'west') {
          var position = this.resizeNote - this.resizeAmount;
          this.music.patterns.setNoteStart(this.patternId, this.resizeNote, position);

          this.drawPattern();

        } else if(this.resizeDirection == 'east') {
          var noteDuration = this.music.patterns.getNoteDuration(this.patternId, this.resizeNote) + this.resizeAmount;

          if(noteDuration > 0) {

            // mouse up
            this.music.patterns.setNoteDuration(this.patternId, this.currentNoteId, noteDuration);
            this.drawPattern();
            /*
            if(this.music.patterns.setNoteDuration(this.patternId, this.resizeNote, noteDuration)) {
              this.drawPattern();
            }
            */
          }
        }
        this.music.history.endPatternChange(this.patternId);   

      }



    } else {
      if(this.mode == 'erase') {
        this.mouseUpErase(button, x, y);      
      }

      if(this.currentNotePosition >= 0) {
        this.music.history.endPatternChange(this.patternId);
//        this.music.updatePattern(this.patternId, this.channel);

      }

    }

    if(this.effectStart > -1) {
      this.mouseUpEffectsDraw(button, x, y);
    }

    this.currentNotePosition = -1;
    this.music.musicPlayer2.stopTestInstrument();

    this.inSelect = false;
    this.inDrag = false;
    this.effectStart = -1;
    this.movingPlayHead = false;
    this.vScroll = false;
    this.hScroll = false;

    this.inResize = false;
    this.resizeNote = false;
    this.resizeAmount = 0;   

    this.currentNoteId = false;

    this.drawPattern(); 

    if(this.pianoRollSelectedNote != -1) {
      this.pianoRollSelectedNote = -1;
      this.drawPianoRoll();
    }

    UI.setCursor('default');


//    this.selectedNotes = [];
  },

  drawPianoRoll: function() {

    // white keys
    this.whiteKeyHeight = (12 / 7) * this.cellHeight;
    this.pianoRollWidth = 3 * this.cellWidth;

    this.pianoRollContext.fillStyle = styles.music.pianoRollWhiteKey;
    this.pianoRollContext.fillRect(0, 0, this.pianoRollWidth, this.gridHeight * this.cellHeight);

    this.pianoRollContext.beginPath();    
    this.pianoRollContext.strokeStyle = styles.music.pianoRollKeyOutline;//'#222222';    
    var whiteKeyCount = 0;

    var highlightedNote = this.pianoRollHighlightedNote;
    var selectedNote = this.pianoRollSelectedNote;

    for(var i = 0; i < (this.gridHeight / 12) * 7 ; i++) {
      var keyPositionY = Math.floor((this.gridHeight * this.cellHeight) - (i + 1) * this.whiteKeyHeight);
      this.pianoRollContext.moveTo(0, keyPositionY + 0.5);
      this.pianoRollContext.lineTo(this.pianoRollWidth, keyPositionY + 0.5);
      whiteKeyCount++;

      var whiteNoteInOctave = i % 7;
      var note = 0;
      switch(whiteNoteInOctave) {
        case 0:
          note = 0;
        break;
        case 1:
          note = 2;
        break;
        case 2:
          note = 4;
        break;
        case 3:
          note = 5;
        break;
        case 4:
          note = 7;
        break;
        case 5:
          note = 9;
        break;
        case 6:
          note = 11;
        break;
      }

      note += 12 * Math.floor(i / 7);

      if(note == highlightedNote && note != selectedNote) {
        this.pianoRollContext.fillStyle = styles.music.pianoRollHighlightedNote;//'#ffff00';
        this.pianoRollContext.fillRect(0, keyPositionY + 0.5, this.pianoRollWidth, this.whiteKeyHeight - 1);
      }

      if(note == selectedNote) {
        this.pianoRollContext.fillStyle = styles.music.pianoRollSelectedNote;//'#00ffff';
        this.pianoRollContext.fillRect(0, keyPositionY + 0.5, this.pianoRollWidth, this.whiteKeyHeight - 1);        
      }
    }

    this.pianoRollContext.stroke();

    this.pianoRollContext.font = "10px Verdana";
    this.pianoRollContext.fillStyle = "#000000";

    for(var i = 0; i <= whiteKeyCount / 7; i++) {
      var octave = i;
      var keyPositionY = Math.floor((this.gridHeight * this.cellHeight) - (octave) * 7 * this.whiteKeyHeight) - 4;
      this.pianoRollContext.fillText("C" + octave, this.pianoRollWidth - 16, keyPositionY);
                           //i*this.whiteKeyWidth*7 +2,56);

    }


    // black keys
    this.blackKeyHeight = this.cellHeight;
    this.blackKeyWidth = this.pianoRollWidth / 2.1;
    for(var i = 0; i < this.gridHeight; i++) {
      var note = i % 12;
      if(note == 1 || note == 3 || note == 6 || note == 8 || note == 10) {
        var keyPositionY = Math.floor((this.gridHeight * this.cellHeight) - (i + 1) * this.blackKeyHeight);
        if(i == selectedNote) {
          this.pianoRollContext.fillStyle = styles.music.pianoRollSelectedNote;//'#00ffff';
        } else if(i == highlightedNote) {
          this.pianoRollContext.fillStyle = styles.music.pianoRollHighlightedNote;//'#ffff00';
        } else {  
          this.pianoRollContext.fillStyle = styles.music.pianoRollBlackKey;//'#000000';
        }
        this.pianoRollContext.fillRect(0, keyPositionY, this.blackKeyWidth, this.blackKeyHeight);
      }
    }
  },

  drawRuler: function() {
    // ruler
    this.rulerContext.fillStyle= styles.music.rulerBackground;
    this.rulerContext.fillRect(0, 0, this.gridWidth * this.cellWidth, this.rulerHeight);

    // effects
    this.rulerContext.fillStyle = styles.music.effectsBackground;
    this.rulerContext.fillRect(0, this.rulerHeight, this.gridWidth * this.cellWidth, this.effectsHeight);

    // draw grid lines
    this.rulerContext.beginPath();    
    this.rulerContext.strokeStyle = styles.music.rulerLines;

    for(var i = 0; i < this.gridWidth; i++) {
      var lineHeight = this.effectsHeight + 4;
      if(i % 16 != 0) {
        if(i % 4 == 0) {
          lineHeight += 6;
        }

        var lineYPosition = this.rulerHeight + this.effectsHeight - lineHeight;
        this.rulerContext.moveTo(i * this.cellWidth + 0.5, lineYPosition);
        this.rulerContext.lineTo(i * this.cellWidth + 0.5, lineYPosition + lineHeight);
      }
    }

    this.rulerContext.stroke();


    // draw grid lines
    this.rulerContext.beginPath();    
    this.rulerContext.strokeStyle = styles.music.rulerBarLines;//'#aaaaaa';    

    this.rulerContext.font = "10px Verdana";
    this.rulerContext.fillStyle = "#eeeeee";

    var bar = 1;
    for(var i = 0; i < this.gridWidth; i++) {
      var lineHeight = this.effectsHeight + 4;
      if(i % 16 == 0) {
        lineHeight = this.effectsHeight + this.rulerHeight;        
        this.rulerContext.fillText(bar, i * this.cellWidth + 4, this.rulerHeight - 4);
        bar++;

        var lineYPosition = this.rulerHeight + this.effectsHeight - lineHeight;
        this.rulerContext.moveTo(i * this.cellWidth + 0.5, lineYPosition);
        this.rulerContext.lineTo(i * this.cellWidth + 0.5, lineYPosition + lineHeight);
      }
    }

    this.rulerContext.stroke();


  },


  drawEffects: function() {
    this.drawRuler();

    if(this.patternId == -1 || this.patternId >= this.music.doc.patterns.length) {
      return;
    }

//    var pattern = this.music.doc.patterns[this.patternId];


    this.rulerContext.beginPath();    
    this.rulerContext.strokeStyle = styles.music.effectsOutline;
    this.rulerContext.font = "12px Verdana";

    var patternData = this.music.patterns.getPatternData(this.patternId);

    for(var i = 0; i < patternData.length; i++) {
      var effect = patternData[i].effect;
      var effectParam = patternData[i].effectParam;
      var duration = 1;

      if(effect && effect != 0) {
        var width = this.cellWidth;
        var height = this.cellHeight; 
  
        var material = this.effectsMaterial;

        var effectCode = 'E';

        switch(effect) {
          case 1:
            effectCode = 'Pu';
          break;
          case 2:
            effectCode = 'Pd';
          break;
          case 3:
            effectCode = 'Pn';
          break;
          case 4:
            effectCode = 'V';          
          break;
          case 5:
            effectCode = 'AD';          
          break;
          case 6:
            effectCode = 'SR';          
          break;
          case 7:
          break;
          case 8:
          break;
          case 9:
          break;
          case 10:
            effectCode = 'Fon';

          break;
          case 11:
            effectCode = 'FRC';
          break;
          case 12:
            effectCode = 'FC';
          break;
          case 13:
            effectCode = 'Mv';
          break;
          case 14:
            effectCode = 'FT';
          break;
          case 15:
            effectCode = 'T';          
          break;
          case 16:
            effectCode = 'Foff';

          break;
          case 17:
            effectCode = 'L';
          break;
        }

//        var width = this.cellWidth / this.partsPerBeat * duration;
//        var height = this.cellHeight; 
        var x = i * this.cellWidth;
        var y = this.rulerHeight;//  tthis.gridHeight * this.cellHeight - (pitch + 1) * this.cellHeight;

        this.rulerContext.fillStyle = styles.music.effectsFill;
        this.rulerContext.fillRect(x, y, 
          duration * this.cellWidth, this.cellHeight);

        // draw the box around the effect
        this.rulerContext.moveTo(x + 0.5, y + 0.5);
        this.rulerContext.lineTo(x + width + 0.5, y + 0.5);
        this.rulerContext.lineTo(x + width + 0.5, y + height + 0.5);
        this.rulerContext.lineTo(x + 0.5, y + height + 0.5);
        this.rulerContext.lineTo(x + 0.5, y + 0.5);


        this.rulerContext.fillStyle = styles.music.effectsText;//"#000000";

        var textWidth = this.rulerContext.measureText(effectCode).width
        var textX = x + (this.cellWidth - textWidth) / 2;
        this.rulerContext.fillText(effectCode, textX, y + 12);

      }
    }

    this.rulerContext.stroke();
  },

  drawNotes: function() {
    if(this.patternId == -1) {
      return;
    }
    var patternData = this.music.patterns.getPatternData(this.patternId);

    var notes = this.music.patterns.getNotes(this.patternId);

    this.gridContext.beginPath();    
    this.gridContext.strokeStyle = styles.music.noteOutline;

    var note = null;
    for(var i = 0; i < notes.length; i++) {
      note = notes[i];

      var position = note.pos;
      var pitch = note.pit;
      var instrumentId = note.ins;
      var duration = note.dur;
      var selected = false;

      var noteColor = 'ff0000';

      if(instrumentId !== false) {
        var noteColor = this.music.instruments.getColor(instrumentId);
        noteColor = ("000000" + noteColor.toString(16) ).substr(-6);        
      }

      var width = this.cellWidth / this.partsPerBeat * duration;
      var height = this.cellHeight; 
      var x = position * this.cellWidth;
      var y = this.gridHeight * this.cellHeight - (pitch + 1) * this.cellHeight;

      if( ( (selected || i == this.resizeNote) && this.inDrag) || (i === this.resizeNote && this.inResize)) {
        this.gridContext.globalAlpha = 0.2;
//            instrumentColor = 'ff0000';
      }

      this.gridContext.fillStyle = '#' + noteColor;
      this.gridContext.fillRect(x, y, width, height);

      if(!selected) {
        // draw the box around the note
        this.gridContext.moveTo(x + 0.5, y + 0.5);
        this.gridContext.lineTo(x + width + 0.5, y + 0.5);
        this.gridContext.lineTo(x + width + 0.5, y + height + 0.5);
        this.gridContext.lineTo(x + 0.5, y + height + 0.5);
        this.gridContext.lineTo(x + 0.5, y + 0.5);
      }

      if( ( (selected || i == this.resizeNote) && this.inDrag) || (i === this.resizeNote && this.inResize)) {
        this.gridContext.globalAlpha = 1;
      }
    }

    this.gridContext.stroke();

    return;
/*
    var note = null;
    for(var i = 0; i < patternData.length; i++) {
      note = patternData[i];

      if(note.start == true) {

        var drawNote = true;

        var pitch = note.pitch;
        var instrumentId = note.instrument;
        var duration = note.duration;
        var selected = note.selected;

        if(instrumentId != 0) {
          var instrumentColor = this.music.instruments.getColor(instrumentId);
          instrumentColor = ("000000" + instrumentColor.toString(16) ).substr(-6);
          var width = this.cellWidth / this.partsPerBeat * duration;
          var height = this.cellHeight; 
          var x = i * this.cellWidth;
          var y = this.gridHeight * this.cellHeight - (pitch + 1) * this.cellHeight;

          if( ( (selected || i == this.resizeNote) && this.inDrag) || (i === this.resizeNote && this.inResize)) {
            this.gridContext.globalAlpha = 0.2;
//            instrumentColor = 'ff0000';
          }

          this.gridContext.fillStyle = '#' + instrumentColor;
          this.gridContext.fillRect(x, y, 
            width, height);

          if(!selected) {
            // draw the box around the note
            this.gridContext.moveTo(x + 0.5, y + 0.5);
            this.gridContext.lineTo(x + width + 0.5, y + 0.5);
            this.gridContext.lineTo(x + width + 0.5, y + height + 0.5);
            this.gridContext.lineTo(x + 0.5, y + height + 0.5);
            this.gridContext.lineTo(x + 0.5, y + 0.5);
          }

          if( ( (selected || i == this.resizeNote) && this.inDrag) || (i === this.resizeNote && this.inResize)) {
            this.gridContext.globalAlpha = 1;
          }


        }
      }
    }

    this.gridContext.stroke();
*/

    if(this.selectedNotes.length > 0) {
      this.gridContext.beginPath();    
      this.gridContext.strokeStyle = styles.music.ghostNoteOutline;//'#ffffff';    

      var note = null;
      for(var i = 0; i < patternData.length; i++) {
        note = patternData[i];
        if(note.start == true) {
          var pitch = note.pitch;
          var instrumentId = note.instrument;
          var duration = note.duration;
          var selected = note.selected;

          if(instrumentId != 0 && selected) {
            var instrumentColor = this.music.instruments.getColor(instrumentId);
            instrumentColor = ("000000" + instrumentColor.toString(16) ).substr(-6);
            var width = this.cellWidth / this.partsPerBeat * duration;
            var height = this.cellHeight; 
            var x = i * this.cellWidth;
            var y = this.gridHeight * this.cellHeight - (pitch + 1) * this.cellHeight;

            // draw the box around the note
            this.gridContext.moveTo(x + 0.5, y + 0.5);
            this.gridContext.lineTo(x + width + 0.5, y + 0.5);
            this.gridContext.lineTo(x + width + 0.5, y + height + 0.5);
            this.gridContext.lineTo(x + 0.5, y + height + 0.5);
            this.gridContext.lineTo(x + 0.5, y + 0.5);
          }
        }
      }
      this.gridContext.stroke();
    }
  },

  drawCursor: function() {
    if(!this.cursor.visible) {
      return;
    }

    var viewHeight = this.height - this.rulerHeight - this.effectsHeight - this.hScrollBarHeight;
    var pitch = this.cursor.pitch;
    var position = this.cursor.position;
    var instrumentId = this.music.instruments.currentInstrumentId;
    var duration = this.cursor.duration;

    var width = this.cellWidth / this.partsPerBeat * duration;
    var height = this.cellHeight; 
    var x = this.pianoRollWidth - Math.round(this.scrollX) + position * this.cellWidth;
    var y = 0;
    var cursorColor = '#ff0000';

    if(pitch == -1) {
      // cursor is in effects area
      y = this.rulerHeight;// + this.effectsHeight + this.scrollY - (this.gridHeight * this.cellHeight - viewHeight)
              + (this.gridHeight * this.cellHeight) - ((pitch + 1) * this.cellHeight);
      cursorColor = styles.music.effectsCursor;
    } else {

      var instrumentColor = this.music.instruments.getColor(instrumentId);
      cursorColor = '#' + ("000000" + instrumentColor.toString(16) ).substr(-6);

      var y = this.rulerHeight + this.effectsHeight + Math.round(this.scrollY) - (this.gridHeight * this.cellHeight - viewHeight)
              + (this.gridHeight * this.cellHeight) - ((pitch + 1) * this.cellHeight);
    }


    this.context.globalAlpha = 0.2;
    this.context.fillStyle =  cursorColor;
    this.context.fillRect(x, y, 
      width, height);

    // draw the box around the note

    if(pitch == -1) {
      this.context.strokeStyle = styles.music.effectsCursorOutline;
    } else {  
      this.context.strokeStyle = styles.music.cursorOutline;
    }
    this.context.beginPath();
    this.context.moveTo(x + 0.5, y + 0.5);
    this.context.lineTo(x + width + 0.5, y + 0.5);
    this.context.lineTo(x + width + 0.5, y + height + 0.5);
    this.context.lineTo(x + 0.5, y + height + 0.5);
    this.context.lineTo(x + 0.5, y + 0.5);
    this.context.stroke();

    this.context.globalAlpha = 1;

  },
  drawSelectedNotes: function() {
    var xOffset = this.dragOffsetX * this.cellWidth;//       this.cellWidth;
    var yOffset = this.dragOffsetY * this.cellHeight;//this.cellHeight;

//    var pattern = this.music.doc.patterns[this.patternId];
    var patternData = this.music.patterns.getPatternData(this.patternId);

    var viewHeight = this.height - this.rulerHeight - this.effectsHeight - this.hScrollBarHeight;


    this.context.beginPath();
    this.context.strokeStyle = styles.music.selectedNoteOutline;
    this.context.lineWidth = 2;

    for(var i = 0; i < this.selectedNotes.length; i++) {
      var note = patternData[this.selectedNotes[i]];

      var position = this.selectedNotes[i];
      var pitch = note.pitch;
      var instrumentId = note.instrument;
      var duration = note.duration;

      if(instrumentId != 0) {
        var instrumentColor = this.music.instruments.getColor(instrumentId);
        instrumentColor = ("000000" + instrumentColor.toString(16) ).substr(-6);
        var width = this.cellWidth / this.partsPerBeat * duration;
        var height = this.cellHeight; 
        var x =  this.pianoRollWidth - Math.round(this.scrollX) + position * this.cellWidth + xOffset;
//        var y = this.rulerHeight + this.effectsHeight - this.scrollY 
//                  + (this.gridHeight * this.cellHeight) - ((pitch + 1) * this.cellHeight) - yOffset ;

        var y = this.rulerHeight + this.effectsHeight + Math.round(this.scrollY) - (this.gridHeight * this.cellHeight - viewHeight)
                + (this.gridHeight * this.cellHeight) - ((pitch + 1) * this.cellHeight) - yOffset;

        this.context.globalAlpha = 0.8;
        this.context.fillStyle = '#' + instrumentColor;
        this.context.fillRect(x, y, 
          duration * this.cellWidth, this.cellHeight);
        this.context.globalAlpha = 1;

        // draw the box around the note
        this.context.moveTo(x + 0.5, y + 0.5);
        this.context.lineTo(x + width + 0.5, y + 0.5);
        this.context.lineTo(x + width + 0.5, y + height + 0.5);
        this.context.lineTo(x + 0.5, y + height + 0.5);
        this.context.lineTo(x + 0.5, y + 0.5);
      }
    }
    this.context.stroke();
  },


  drawResizeNote: function() {
    if(this.resizeNote === false || !this.inResize || this.inDrag) {
      return;
    }

    var patternData = this.music.patterns.getPatternData(this.patternId);

    var viewHeight = this.height - this.rulerHeight - this.effectsHeight - this.hScrollBarHeight;


    var note = patternData[this.resizeNote];
    var position = this.resizeNote;
    var pitch = note.pitch;
    var instrumentId = note.instrument;
    var duration = note.duration;
    duration = duration + this.resizeAmount;

    if(this.resizeDirection == 'west') {
      position -= this.resizeAmount;

    }

    if(instrumentId != 0) {
      var instrumentColor = this.music.instruments.getColor(instrumentId);
      
      instrumentColor = ("000000" + instrumentColor.toString(16) ).substr(-6);
      var width = this.cellWidth / this.partsPerBeat * duration;
      var height = this.cellHeight; 
      var x =  this.pianoRollWidth - Math.round(this.scrollX) + position * this.cellWidth ;
      var y = this.rulerHeight + this.effectsHeight + Math.round(this.scrollY) - (this.gridHeight * this.cellHeight - viewHeight)
              + (this.gridHeight * this.cellHeight) - ((pitch + 1) * this.cellHeight);

      this.context.globalAlpha = 0.8;
      this.context.fillStyle = '#' + instrumentColor;
      this.context.fillRect(x, y, 
        width, this.cellHeight);
      this.context.globalAlpha = 1;


      this.context.beginPath();
      this.context.strokeStyle = styles.music.ghostNoteOutline;
      this.context.lineWidth = 1;

      // draw the box around the note
      this.context.moveTo(x + 0.5, y + 0.5);
      this.context.lineTo(x + width + 0.5, y + 0.5);
      this.context.lineTo(x + width + 0.5, y + height + 0.5);
      this.context.lineTo(x + 0.5, y + height + 0.5);
      this.context.lineTo(x + 0.5, y + 0.5);

      this.context.stroke();
    }

  },


  drawPattern: function() {
    if(this.patternId == -1 || this.patternId >= this.music.doc.patterns.length) {
      return;
    }
    
    this.drawGrid();
    this.drawEffects();
    this.drawNotes();
  },

  drawGrid: function() {
    this.gridContext.fillStyle = styles.music.gridWhiteNotes;
    this.gridContext.fillRect(0, 0, this.gridWidth * this.cellWidth, this.gridHeight * this.cellHeight);

    // draw the background..
    for(var i = 0; i < this.gridHeight; i++) {
      if(i >= 96) {
      } else {
        // darker for black notes.
        var note = i % 12;
        if(note == 1 || note == 3 || note == 6 || note == 8 || note == 10) {
          this.gridContext.fillStyle = styles.music.gridBlackNotes;
          this.gridContext.fillRect(0, this.gridHeight * this.cellHeight - (i + 1) * this.cellHeight, this.gridWidth * this.cellWidth, this.cellHeight);
        }
      }
    }

    // draw grid lines
    this.gridContext.beginPath();    
    this.gridContext.strokeStyle = styles.music.gridLines;

    for(var i = 0; i < this.gridHeight; i++) {
      if( (i + 3) % 12 != 0) {
        this.gridContext.moveTo(0, i * this.cellHeight + 0.5);
        this.gridContext.lineTo(this.gridWidth * this.cellWidth, i * this.cellHeight + 0.5);
      }
    }

    for(var i = 0; i < this.gridWidth; i++) {
      if(i % 16 != 0) {
        this.gridContext.moveTo(i * this.cellWidth + 0.5, 0);
        this.gridContext.lineTo(i * this.cellWidth + 0.5, this.gridHeight * this.cellHeight);
      }
    }
    this.gridContext.stroke();


    this.gridContext.beginPath();    
    this.gridContext.strokeStyle = styles.music.gridOctaveLines;

    for(var i = 0; i < this.gridHeight; i++) {
      if( (i + 3) % 12 == 0) {
        this.gridContext.moveTo(0, i * this.cellHeight + 0.5);
        this.gridContext.lineTo(this.gridWidth * this.cellWidth, i * this.cellHeight + 0.5);
      }
    }

    this.gridContext.stroke();



    // draw grid lines every 4
    this.gridContext.beginPath();    
    this.gridContext.strokeStyle = styles.music.gridBeatLines;    

    for(var i = 0; i < this.gridWidth; i++) {
      if(i % 4 == 0 && i % 16 != 0) {
        this.gridContext.moveTo(i * this.cellWidth + 0.5, 0);
        this.gridContext.lineTo(i * this.cellWidth + 0.5, this.gridHeight * this.cellHeight);
      }
    }

    this.gridContext.stroke();


    // draw grid lines every 16
    this.gridContext.beginPath();    
    this.gridContext.strokeStyle = styles.music.gridBarLines;

    for(var i = 0; i < this.gridWidth; i++) {
      if(i % 16 == 0) {
        this.gridContext.moveTo(i * this.cellWidth + 0.5, 0);
        this.gridContext.lineTo(i * this.cellWidth + 0.5, this.gridHeight * this.cellHeight);
      }
    }

    this.gridContext.stroke();

  },

  drawPlayhead: function() {

    var playheadPositionX = this.pianoRollWidth + this.cellWidth * this.playheadPosition + 0.5 - Math.round(this.scrollX);
    this.context.fillStyle= '#bbbbbb';
    var playHeadWidth = 13;
    var playheadHeight = 12;
    this.context.fillRect(playheadPositionX - playHeadWidth / 2 + 0.5, this.rulerHeight - playheadHeight, playHeadWidth, playheadHeight);

    this.context.beginPath();    
    this.context.strokeStyle = '#bbbbbb';    

    this.context.moveTo(playheadPositionX, this.rulerHeight);
    this.context.lineTo(playheadPositionX, this.height);
    this.context.stroke();

  },


  updatePlayheadPosition: function() {

    // TODO: need more efficient way of doing this..
    this.playheadPosition = this.music.playheadPosition 
                            + this.music.playheadPositionFraction 
                            - this.music.getGlobalPosition(this.channel, this.trackIndex, 0);

  },


  calculateScroll: function() {
    this.vScrollBarHeight = this.gridViewHeight;

    this.vScrollBarPositionHeight = this.vScrollBarHeight  * this.gridViewHeight / (this.gridHeight * this.cellHeight);
    if(this.vScrollBarPositionHeight > this.vScrollBarHeight) {
      this.vScrollBarPositionHeight = this.vScrollBarHeight;
    }

//    this.vScrollBarPosition = this.hScrollBarHeight - 1 + (- this.scrollY) * this.vScrollBarHeight / (this.gridHeight * this.cellHeight);
    this.vScrollBarPosition = this.vScrollBarHeight - this.vScrollBarPositionHeight - Math.round(this.scrollY) * this.vScrollBarHeight / (this.gridHeight * this.cellHeight);

//    this.vScrollBarPosition =  (this.scrollY) * this.vScrollBarHeight / this.srcHeight;


    this.hScrollBarWidth = this.gridViewWidth;
    this.hScrollBarPositionWidth = this.hScrollBarWidth  * this.gridViewWidth / (this.gridWidth * this.cellWidth);
    if(this.hScrollBarPositionWidth > this.hScrollBarWidth) {
      this.hScrollBarPositionWidth = this.hScrollBarWidth;
    }

    this.hScrollBarPosition = (this.scrollX) * this.hScrollBarWidth / (this.gridWidth * this.cellWidth);


//    var position = -this.scrollY;

/*
    this.vScrollBarPosition.position.y = - this.height / 2 + this.vScrollBarPositionHeight / 2 + this.hScrollBarHeight; 
    this.vScrollBarPosition.position.y += this.vScrollBarHeight * position / this.gridHeight + 1;

    this.vScrollBarPositionMin = this.vScrollBarPosition.position.y - this.vScrollBarPositionHeight / 2 + this.height / 2;
    this.vScrollBarPositionMax = this.vScrollBarPosition.position.y + this.vScrollBarPositionHeight / 2 + this.height / 2;
*/

  },

  resize: function(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;

    this.context = this.canvas.getContext("2d");    
  },


  render: function() {//left, top, width, height) {
    var time = getTimestamp();
    var delta = time - this.lastTime;
    this.lastTime = time;

// scrolling if mouse moves outside
    if(time - this.lastScrollTime > 30) {
      if(this.xScrollSpeed != 0 ) {
        this.lastScrollTime = time;
        //TODO: readd this
//        this.mouseMove(this.lastMouseX, this.lastMouseY, 0, 0);
      } else if(this.yScrollSpeed != 0 ) {
        this.lastScrollTime = time;
        // TODO: readd this
//        this.mouseMove(this.lastMouseX, this.lastMouseY, 0, 0);
      }
    }

    if(this.context == null) {
      this.context = this.canvas.getContext("2d");    
    }
    
//    this.context.fillStyle= '#333333';
//    this.context.fillStyle= '#000000';
//    this.context.fillRect(0, 0,this.width, this.height);


    this.updatePlayheadPosition();

    this.gridViewWidth = this.width - this.pianoRollWidth - this.vScrollBarWidth;
    this.gridViewHeight = this.height - (this.effectsHeight + this.rulerHeight) - this.hScrollBarHeight;
    // canvas, clip rectx, clip rect y, src rect width, src rect heigth

    // draw grid
    this.context.drawImage(this.gridCanvas, Math.round(this.scrollX), this.gridHeight * this.cellHeight - this.gridViewHeight - Math.round(this.scrollY),  
                            this.gridViewWidth, this.gridViewHeight, 

                            this.pianoRollWidth, this.rulerHeight + this.effectsHeight, 
                            this.gridViewWidth, this.gridViewHeight);

    this.drawSelectedNotes();

    this.drawResizeNote();

    // draw the cursor if its in the grid
    if(this.cursor.visible && this.cursor.pitch >= 0) {
      this.drawCursor();
    }

    // draw select rect
    if(this.inSelect) {
      var x = this.selectLeft - Math.round(this.scrollX) + this.pianoRollWidth;
      var y = this.height - (this.selectBottom - Math.round(this.scrollY));
      var width = this.selectRight - this.selectLeft;
      var height = this.selectBottom - this.selectTop;

      this.context.globalAlpha = 0.2;

      this.context.fillStyle = styles.music.selectFill;
      this.context.fillRect(x, y, width, height);

      this.context.globalAlpha = 1;
      this.context.beginPath();    
      this.context.strokeStyle = styles.music.selectOutline;

      this.context.moveTo(0.5 + this.selectLeft - Math.round(this.scrollX) + this.pianoRollWidth, 0.5 + this.height - (this.selectBottom - Math.round(this.scrollY))) ;
      this.context.lineTo(0.5 + this.selectRight - Math.round(this.scrollX) + this.pianoRollWidth, 0.5 + this.height - (this.selectBottom - Math.round(this.scrollY)));
      this.context.lineTo(0.5 + this.selectRight - Math.round(this.scrollX) + this.pianoRollWidth, 0.5 + this.height - (this.selectTop - Math.round(this.scrollY)));
      this.context.lineTo(0.5 + this.selectLeft - Math.round(this.scrollX) + this.pianoRollWidth, 0.5 + this.height - (this.selectTop - Math.round(this.scrollY)));
      this.context.lineTo(0.5 + this.selectLeft - Math.round(this.scrollX) + this.pianoRollWidth, 0.5 + this.height - (this.selectBottom - Math.round(this.scrollY)));
      this.context.stroke();

    }

    // draw ruler
    this.context.drawImage(this.rulerCanvas, Math.round(this.scrollX), 0, this.width - this.pianoRollWidth,  this.rulerHeight + this.effectsHeight, this.pianoRollWidth, 0, this.width- this.pianoRollWidth, this.rulerHeight + this.effectsHeight);

    // draw the cursor if its in the effects
    if(this.cursor.visible && this.cursor.pitch == -1) {
      this.drawCursor();
    }


    this.drawPlayhead();

    // draw piano roll
    this.context.drawImage(this.pianoRollCanvas, 0, this.gridHeight * this.cellHeight - this.gridViewHeight - Math.round(this.scrollY), 
                            this.pianoRollWidth, this.gridViewHeight + this.hScrollBarHeight, 0, this.rulerHeight + this.effectsHeight, 

                            this.pianoRollWidth, this.gridViewHeight + this.hScrollBarHeight);//, this.toPetsciiCanvas.width, this.toPetsciiCanvas.height);


    // after the grid
    if(this.gridCanvas.width < this.gridViewWidth) {
      this.context.fillStyle = '#050505';
      this.context.fillRect(this.pianoRollWidth + this.gridCanvas.width, 0, 
        this.gridViewWidth - (this.gridCanvas.width), 
        this.gridViewHeight + this.rulerHeight + this.effectsHeight);
    }


    // ruler heading
    this.context.fillStyle = '#111111';
    this.context.fillRect(0, 0, this.pianoRollWidth, this.rulerHeight);

    // draw effects label
    this.context.fillStyle = '#666666';
    this.context.fillRect(0, this.rulerHeight, this.pianoRollWidth, this.effectsHeight);
    this.context.font = "10px Verdana";
    this.context.fillStyle = "#222222";
    this.context.fillText("Effects:", 4, this.rulerHeight + this.effectsHeight - 4);


    // draw the scroll bars
    this.calculateScroll();

    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';

    // horizontal scroll
    this.context.fillRect(this.pianoRollWidth, this.height - this.hScrollBarHeight, this.gridViewWidth, this.hScrollBarHeight);
    this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';
    this.context.fillRect(this.pianoRollWidth + this.hScrollBarPosition, this.height - this.hScrollBarHeight + 1, this.hScrollBarPositionWidth, this.hScrollBarHeight - 2);

    // vertical scroll
    this.context.fillStyle= styles.ui.scrollbarHolder;//'#111111';
    this.context.fillRect(this.width - this.vScrollBarWidth, this.rulerHeight + this.effectsHeight, this.vScrollBarWidth, this.gridViewHeight);
    this.context.fillStyle= styles.ui.scrollbar;//'#cccccc';
    this.context.fillRect(this.width - this.vScrollBarWidth + 1, this.rulerHeight + this.effectsHeight + this.vScrollBarPosition, this.vScrollBarWidth - 2, this.vScrollBarPositionHeight);

  }
}