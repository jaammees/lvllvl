var EditC64Instrument = function() {
  this.music = null;
  this.wavetable = [];
  this.pulsetable = [];
  this.speedtable = [];
  this.filtertable = [];

  this.keyboardCanvas = null;
  this.keyboardContext = null;
  this.whiteKeyWidth = 20;
  this.blackKeyWidth = 10;
  this.keyboardOctave = 5;
  this.keyboardNote = 5;

  this.whiteKey = false;


  this.playingInstrument = false;

//  this.vScrollBarPositionMouseOffset = 0;  

  this.instrumentId = -1;

  this.arpeggioSteps = 2;
}

EditC64Instrument.prototype = {

  init: function(music) {
    this.music = music;
  },


  buildInterface: function(parentPanel) {
    var _this = this;
    this.uiComponent = UI.create("UI.HTMLPanel");
    parentPanel.add(this.uiComponent);

    UI.on('ready', function() {
      _this.uiComponent.load('html/music/sid/editInstrument.html', function() {
        _this.initContent();
        _this.initEvents();
      });
    });
  },

  initContent: function() {
    this.keyboard = new KeyboardCanvas();
    this.keyboard.init('editInstrumentKeyboard');
    //this.keyboard.drawKeyboard();
  },

  initEvents: function() {
    var _this = this;

    this.keyboard.on('keydown', function(octave, note) {
      _this.editInstrumentPlay(octave, note);
    });

    this.keyboard.on('keyup', function() {
//      _this.testFilterOff();

      _this.music.musicPlayer2.stopTestInstrument();
      _this.playingInstrument = false;

    });

    $('input[name=editInstrumentArpeggioMode]').on('change', function() {
      _this.setInstrumentData();
    });

    $('input[name=editInstrumentArpeggioSteps]').on('change', function() {
      _this.setInstrumentData();

      var steps = $('input[name=editInstrumentArpeggioSteps]:checked').val();
      _this.setArpeggioSteps(steps);


    });


/*
    $('input[name=editInstrumentArpeggioType]').on('change', function() {
      if($(this).val() == 'custom') {
        var steps = $('#editInstrumentArpeggioCustomSteps').val();
        _this.setArpeggioSteps(steps);


        $('#editInstrumentArpeggioCustom').show();
        $('#editInstrumentArpeggioDirection').hide();
      } else {
        $('#editInstrumentArpeggioCustom').hide();
        $('#editInstrumentArpeggioDirection').show();
      }

      _this.setInstrumentData();
    });

    $('#editInstrumentArpeggioCustomSteps').on('change', function() {
      var value = $(this).val();
      _this.setArpeggioSteps(value);
      _this.setInstrumentData();

    });
*/

    $('input[name=editInstrumentType]').on('click', function() {
      var type = $(this).val();
      _this.setInstrumentType(type);
      _this.setInstrumentData();

    });

    // ************* ADSR *****************
    $('#editInstrumentAttack').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentDecay').on('change', function() {
      _this.setInstrumentData();
    });
    $('#editInstrumentSustain').on('change', function() {
      _this.setInstrumentData();
    });
    $('#editInstrumentRelease').on('change', function() {
      _this.setInstrumentData();
    });


    // ************* VIBRATO **************
    $('input[name=vibrato]').on('click', function() {
      var vibrato = $(this).val();
      if(vibrato == 'on') {
        $('#vibratoControls').show();
      } else {
        $('#vibratoControls').hide();
      }
      _this.setInstrumentData();

    });

    $('#editInstrumentVibratoDepth').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentVibratoDepth').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentVibratoSpeed').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentVibratoSpeed').on('keyup', function() {
      _this.setInstrumentData();
    });

    
    $('#editInstrumentVibratoDelay').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentVibratoDelay').on('keyup', function() {
      _this.setInstrumentData();
    });

    // ***---------------------------*** //



    // ****** BASIC WAVEFORM ****** //
    $('#editInstrumentWaveform_triangle').on('click', function() {
      _this.setInstrumentData();
    });
    $('#editInstrumentWaveform_sawtooth').on('click', function() {
      _this.setInstrumentData();
    });
    $('#editInstrumentWaveform_pulse').on('click', function() {
      _this.setInstrumentData();
    });
    $('#editInstrumentWaveform_noise').on('click', function() {
      _this.setInstrumentData();
    });
    // **-----------------------------** //



    // ******* BASIC PULSE ***** //
    $('#editInstrumentWaveform_pulse').on('click', function() {
      if($(this).is(':checked')) {
        $('#pulseControls').show();
      } else {
        $('#pulseControls').hide();
      }
      _this.setInstrumentData();

    });

    $('#editInstrumentPMWidth').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentPMWidth').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentPMSpeed').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentPMSpeed').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentPMDepth').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentPMDepth').on('keyup', function() {
      _this.setInstrumentData();
    });


    // ***** TREMOLO ***** //
    $('#editInstrumentTremoloOnSpeed').on('change', function() {
      _this.setInstrumentData();
    });

    $('#editInstrumentTremoloOffSpeed').on('change', function() {
      _this.setInstrumentData();
    });

    // *** ------------------  *** //

    $('input[name="editInstrumentBasicEffect"]').on('click', function() {
      _this.setBasicEffectVisibility();
      _this.setInstrumentData();

    });    


    $('#editInstrumentArpeggioSpeed').on('change', function() {
      _this.setInstrumentData();
    });

//    $('input[name=editInstrumentArpeggioType]')




    $('#wavetableTab').on('click', function() {
      _this.showTable('wavetable');
    });

    $('#pulsetableTab').on('click', function() {
      _this.showTable('pulsetable');
    });


    $('#filtertableTab').on('click', function() {
      _this.showTable('filtertable');
    });

    $('#editInstrumentOK').on('click', function() {

      _this.setInstrumentData();
      _this.backToMusicEditor();
    });

    $('#editInstrumentApply').on('click', function() {
      _this.setInstrumentData();

    });

    $('#editInstrumentCancel').on('click', function() {
      _this.music.doc.data.instruments[_this.instrumentId] = _this.instrumentSave;
      _this.backToMusicEditor();
      
    });


  },

  backToMusicEditor: function() {
    this.music.setView('edit');
    this.music.resize();
  },

  mouseWheel: function(event, delta) {
    var scrollY = $('#editInstrumentHolder').scrollTop();

    var factor = event.deltaFactor;

    $('#editInstrumentHolder').scrollTop(scrollY - event.deltaY * factor);

  },

/*

  mouseDown: function(event) {//button, x, y) {
    this.mouseDownAtY = y;
    this.mouseDownAtX = x;
    this.mouseLastY = y;
    this.mouseLastX = x;


  },

  mouseMove: function(event) {//x, y, deltaX, deltaY) {

    var x = event.ui_offsetX;
    var y = event.ui_offsetY;

    // TODO: fix this..
    y = this.height - y;



    this.keyboard.mouseToKeyboard(x, y);

    this.mouseLastY = y;
    this.mouseLastX = x;
  },


  mouseUp: function(event) {//button, x, y) {
//    this.inScroll = false;

    console.log('mouse up!');

    this.keyboard.mouseUp(x, y);

  },


*/

  filtertableHTML: function() {
    var html = '';
    var checked = '';
    var selected = '';

    var loopTo = 0;

    if(this.filtertable.length > 0) {
      loopTo = this.filtertable[this.filtertable.length - 1][1];
      if(loopTo == 0) {
        loopTo = this.filtertable.length;
      }
    }


    html += '<table width="100%">';
    html += '<thead>';
    html += '<tr>';
    html += '<th>Loop&nbsp;To</th>';
    html += '<th>Action</th>';
    html += '<th>Parameters</th>';
    html += '<th>&nbsp;</th>';
    html += '</tr>';
    html += '</thead>';


    html += '<tbody>';
    if(this.filtertable.length <= 1) {
      html += '<tr>';
      html += '<td colspan="4">';
      html += '<button type="button" class="filtertableAdd" id="row_add">Add Row</button>';
      html += '</td>';
      html += '</tr>'
    }

    for(var i = 0; i < this.filtertable.length; i++) {
      var left = this.filtertable[i][0];
      var right = this.filtertable[i][1];

      html += '<tr>';
      html += '<td>';

      var checked = '';
      if(loopTo == i + 1) {
        checked = ' checked="checked" ';
      }

      html += '<input type="radio" name="filtertableLoop" id="row' + i + '_filtertableLoop" value="' + i + '" ' + checked + '>';
      html += '</td>';


      if(i == this.filtertable.length - 1) {
        // its the last row
        html += '<td colspan="3">&nbsp;</td>';
      } else {
        html += '<td>';

        html += '<select id="row' + i + '_filterrowtype" class="filtertableRowType">';

        selected = '';
        if(this.filtertable[i][0] == 0x00) {
          selected = ' selected="selected" ';
        }
        html += '<option value="cutoff" ' + selected + '>Set Cutoff</option>';

        selected = '';
        if(this.filtertable[i][0] >= 0x01 && this.filtertable[i][0] <= 0x7f) {
          selected = ' selected="selected" ';
        }
        html += '<option value="modulate" ' + selected + '>Modulate Filter</option>';

        selected = '';
        if(this.filtertable[i][0] >= 0x80 && this.filtertable[i][0] <= 0xf0) {
          selected = ' selected="selected" ';
        }
        html += '<option value="filter" ' + selected + '>Set Filter</option>';


        html += '</select>';
        html += '</td>'


        html += '<td>';

        html += '<span id="row' + i + '_filtercutoffParams" ';
        if(left != 0) {
          html += ' style="display:none" ';
        }
        html += '>';
        var cutoff = right;
        html += '<label>Cutoff :</label>';
        html += '<input id="row' + i + '_filtercutoff" class="number editInstrumentFilterCutoff" min="0" max="255" size="4" value="' + cutoff + '"> (0-255)';
        html += '</span>';

        html += '<span id="row' + i + '_filtermodulateParams" ';
        if(left < 1 || left >0x7f) {
          html += 'style="display:none" ';
        }

        html += '>';
        var time = left;
        html += '<label>Modulate for: </label>';
        html += '<input id="row' + i + '_filtertime" class="number editInstrumentFilterTime" min="0" max="127" size="4" value="' + time + '"> Ticks (0-127)';

        var speed = right;
        if(speed > 127) {
          speed = speed - 256;
        }

        if(speed > 127) {
          speed = 127;
        }

        html += '&nbsp;&nbsp;';
        html += '<label>Amount :</label>';
        html += '<input id="row' + i + '_filterspeed" size="4" class="number editInstrumentFilterSpeed" min="-127" max="127" value="' + speed + '"> / Tick (-127 - 127)';

        html += '</span>';


        html += '<span id="row' + i + '_filterParams" ';
        if(left <= 0x7f) {
          html += ' style="display:none" ';
        }
        html += '>';


        html += '<label><input type="checkbox" id="row' + i + '_filtertypelow" value="low" class="editInstrumentFilterChannel" ';
        if(left & 0x10) {
          html += ' checked="checked" ';
        }
        html += '> Lowpass</label>';

        html += '<label><input type="checkbox" id="row' + i + '_filtertypeband" value="band" class="editInstrumentFilterChannel" ';
        if(left & 0x20) {
          html += ' checked="checked" ';
        }
        html += '> Bandpass</label>';
        html += '<label><input type="checkbox" id="row' + i + '_filtertypehigh" value="high" class="editInstrumentFilterChannel" ';
        if(left & 0x40) {
          html += ' checked="checked" ';
        }
        html += '> Highpass</label>';

/*
        html += '<select id="row' + i + '_filtertype">';
        html += '<option value="lowpass" ';
        if(left == 0x90) {
          html += ' selected="selected" ';
        }

        html += '>Lowpass</option>';
        html += '<option value="bandpass" ';
        if(left == 0xa0) {
          html += ' selected="selected" ';
        }
        html += '>Bandpass</option>';
        html += '<option value="highpass" ';
        if(left == 0xc0) {
          html += ' selected="selected" ';
        }
        html += '>Highpass</option>';
        html += '</select>';
*/

        var resonance = (right & 0xf0) >> 4;
        var channel = right & 0xf;
        html += '  <label>Resonance :</label>';
        html += '<input id="row' + i + '_resonance" class="number editInstrumentFilterResonance" min="0" max="15" size="4" value="' + resonance + '"> (0-15)';

        html += '<label><input type="checkbox" id="row' + i + '_channel1" class="editInstrumentFilterChannel" ';
        if(channel & 0x1) {
          html += ' checked="checked" ';
        }
        html += '> Channel 1</label>&nbsp;';

        html += '<label><input type="checkbox" id="row' + i + '_channel2" class="editInstrumentFilterChannel" ';
        if(channel & 0x2) {
          html += ' checked="checked" ';
        }
        html += '> Channel 2</label>&nbsp;';


        html += '<label><input type="checkbox" id="row' + i + '_channel3" class="editInstrumentFilterChannel" ';
        if(channel & 0x4) {
          html += ' checked="checked" ';
        }
        html += '> Channel 3</label>';

        html += '</span>';

        html += '</td>'

        html += '<td>';
        html += '<button type="button" class="filtertableAdd" id="row' + i + '_add">Add Row</button>';
        html += '<button type="button" class="filtertableDelete" id="row' + i + '_delete">Delete Row</button>';
        html += '</td>';
      }

      html += '</tr>';
    }

    html += '</tbody>';
    html += '</table>';

    $('#editFiltertable').html('');
    $('#editInstrumentFiltertable').html(html);
    UI.number.initControls('#editInstrumentFiltertable .number');

    this.setupFiltertableEvents();


  },

  setupFiltertableEvents: function() {
    var _this = this;

   $('.filtertableRowType').on('change', function() {
      var id = $(this).attr('id');
      var value = $(this).val();
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      if(value == 'cutoff') {
        $('#' + row + '_filtercutoffParams').show();
        $('#' + row + '_filtermodulateParams').hide();
        $('#' + row + '_filterParams').hide();
      } else if(value == 'modulate') {
        $('#' + row + '_filtercutoffParams').hide();
        $('#' + row + '_filtermodulateParams').show();
        $('#' + row + '_filterParams').hide();
      } else if(value == 'filter') {
        $('#' + row + '_filtercutoffParams').hide();
        $('#' + row + '_filtermodulateParams').hide();
        $('#' + row + '_filterParams').show();

      }
      _this.setInstrumentData();

    });

   $('.editInstrumentFilterType').on('click', function() {
      _this.setInstrumentData();
   });
   $('.editInstrumentFilterChannel').on('click', function() {
      _this.setInstrumentData();
   });
   $('.editInstrumentFilterResonance').on('keyup', function() {
      _this.setInstrumentData();
   });
   $('.editInstrumentFilterResonance').on('change', function() {
      _this.setInstrumentData();
   });

   $('.editInstrumentFilterCutoff').on('keyup', function() {
      _this.setInstrumentData();
   });

   $('.editInstrumentFilterCutoff').on('change', function() {
      _this.setInstrumentData();
   });

   $('.editInstrumentFilterSpeed').on('keyup', function() {
      _this.setInstrumentData();
   });
   $('.editInstrumentFilterSpeed').on('change', function() {
      _this.setInstrumentData();
   });

   $('.editInstrumentFilterTime').on('keyup', function() {
      _this.setInstrumentData();
   });
   $('.editInstrumentFilterTime').on('change', function() {
      _this.setInstrumentData();
   });


    $('.filtertableAdd').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var rowIndex = -1;
      if(pos > 3) {
        //var row = id.substr(0, pos);
        rowIndex = parseInt(id.substr(3));
      }
      
      _this.writeFiltertable();

      if(_this.filtertable.length == 0) {
        _this.filtertable.push([0x90, 0xf7]);
        _this.filtertable.push([0xff, 0x00]);
      } else {
        _this.filtertable.splice(rowIndex + 1, 0, [0x00, 0x00]);
      }
      _this.filtertableHTML();
      _this.setInstrumentData();

    });

    $('.filtertableDelete').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));

      _this.writeFiltertable();
      _this.filtertable.splice(rowIndex , 1);
      _this.filtertableHTML();    
      _this.setInstrumentData();

    });
//    this.calculateScroll();

  },

  writeFiltertable: function() {
    var rows = this.filtertable.length; 

    this.filtertable = [];

    for(var i = 0; i < rows - 1; i++) {
      var left = 0;
      var right = 0;
      var type = $('#row' + i + '_filterrowtype').val();

      if(type == 'cutoff') {
        left = 0;
        right = $('#row' + i + '_filtercutoff').val();

      } else if(type == 'modulate') {
        left =  $('#row' + i + '_filtertime').val();
        if(left < 0) {
          left = 1;
        }
        if(left > 0x7f) {
          left = 0x7f;
        }
        speed =  parseInt($('#row' + i + '_filterspeed').val());
        right = speed;
        if(right < 0) {
          right = 256 + speed;
        }

      } else if(type == 'filter') {
        //var filterType = $('#row' + i + '_filtertype').val();
        left = 0x80;
        if($('#row' + i + '_filtertypelow').is(':checked')) {
          left = left | 0x10;
        }
        if($('#row' + i + '_filtertypeband').is(':checked')) {
          left = left | 0x20;
        }
        if($('#row' + i + '_filtertypehigh').is(':checked')) {
          left = left | 0x40;
        }

        var resonance = parseInt($('#row' + i + '_resonance').val());
        var channel = 0;

        if($('#row' + i + '_channel1').is(':checked')) {
          channel |= 1;

        }
        if($('#row' + i + '_channel2').is(':checked')) {
          channel |= 2;
          
        }
        if($('#row' + i + '_channel3').is(':checked')) {
          channel |= 4;          
        }


        right = (resonance << 4) | channel;


      }
      this.filtertable.push([parseInt(left), parseInt(right)]);      
    } 

    if(this.filtertable.length == 0) {
      return;
    }

    var filtertableLoop = parseInt($('input[name=filtertableLoop]:checked').val());
    if(filtertableLoop == this.filtertable.length ) {
      filtertableLoop = 0;
    } else { 
      filtertableLoop += 1;
    }

    if(isNaN(filtertableLoop)) {
      filtertableLoop = 0;
    }
    this.filtertable.push([0xff, filtertableLoop]);

    if(this.filtertable.length == 1) {
      this.filtertable = [];
    }
    this.logTable('filtertable', this.filtertable);

  },

  pulsetableHTML: function() {

//    alert('pulse table html');

    var html = '';
    html += '<table width="100%"">';

    html += '<thead>';
    html += '<tr>';
    html += '<th>Loop&nbsp;To</th>';
    html += '<th>Action</th>';
    html += '<th>Parameters</th>';
    html += '<th>&nbsp;</th>';
    html += '</tr>';
    html += '</thead>';


    html += '<tbody>';
    var loopTo = 0;
    if(this.pulsetable.length > 0) {
      loopTo = this.pulsetable[this.pulsetable.length - 1][1];
      if(loopTo == 0) {
        loopTo = this.pulsetable.length;
      } 
    }


    for(var row = 0; row < this.pulsetable.length; row++) {
      var left = this.pulsetable[row][0];
      var right = this.pulsetable[row][1];

      html += '<tr>';


      if(this.pulsetable.length <= 1) {
        html += '<td colspan="5">';
        html += '<button type="button" class="pulsetableAdd" id="row' + row + '_pulsetableAdd">Add Row</button>';
        html += '</td>';

      }  else {

        var checked = '';
        if(row + 1 == loopTo) {
          checked = ' checked="checked" ';
        }
        html += '<td>';
        html += '<input type="radio" name="pulsetableLoop" id="row' + row + '_pulsetableLoop" value="' + row + '" ' + checked + '>';
        html += '</td>';

        if(row < this.pulsetable.length - 1) {
          html += '<td>';

          html += '<select class="pulsetableType" id="row' + row + '_pulseTableType">';

          selected = '';
          if(left <= 0x7f) {
            selected = ' selected="selected" ';
          }
          html += '<option value="stepPulse" ' + selected + '>Step Pulse Modulation</option>';

          selected = '';
          if(left > 0x7f) {
            selected = ' selected="selected" ';
          }
          html += '<option value="setPulse" ' + selected + '>Set Pulse Width</option>'
          html += '</select>';
          html += '</td>';

          html += '<td>';

          html += '<span id="row' + row + '_stepPulseValues"';
          if(left > 0x7f) {
            html += ' style="display: none"';
          }
          html += '>';
          html += 'Time:';
          var time = left;
          if(time > 127) {
            time = 127;
          }
          html += '<input id="row' + row + '_pulsetableTime" class="editInstrumentPulsetableTime" size="4" class="number" min="0" max="127" value="' + time + '"> (1-127)';

          html += 'Speed:';
          var speed = right;
          if(speed > 127) {
            speed = speed - 256;
          }

          if(speed > 127) {
            speed = 127;
          }
          html += '<input id="row' + row + '_pulsetableSpeed" class="editInstrumentPulsetableSpeed" class="" size="4" class="number" min="-127" max="127" value="' + speed + '"> (-127 - +127)';

          html += '</span>';


          html += '<span id="row' + row + '_setPulseValues"';
          if(left <= 0x7f) {
            html += ' style="display: none"';          
          }
          html += '>';

          pulseWidth = (left & 0x0f) * 256;
          pulseWidth += right;

          html += 'Width: <input class="editInstrumentPulseWidth" id="row' + row + '_pulseWidth" class="number" min="0" max="4095" size="6" value="' + pulseWidth + '"> (0-4095)';
          html += '</span>';

          html += '</td>';

          html += '<td>';
          html += '<button type="button" class="pulsetableAdd" id="row' + row + '_pulsetableAdd">Add Row</button>';
          html += '<button type="button" class="pulsetableDelete" id="row' + row + '_pulsetableDelete">Delete Row</button>';

          html += '</td>';
        } else {
          html += '<td colspan="3">&nbsp;</td>';
        }
      }
      html += '</tr>';
    }

    html += '</tbody>';

    html += '</table>';
    $('#editInstrumentPulsetable').html(html);

    this.setupPulsetableEvents();

    UI.number.initControls('#editInstrumentPulsetable .number');

//    this.calculateScroll();

  },


  setupPulsetableEvents: function() {
    var _this = this;


    $('.pulsetableType').on('change', function() {
      var id = $(this).attr('id');
      var value = $(this).val();
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);


      if(value == "stepPulse") {
        $('#' + row + '_stepPulseValues').show();
        $('#' + row + '_setPulseValues').hide();
      }

      if(value == "setPulse") {
        $('#' + row + '_stepPulseValues').hide();
        $('#' + row + '_setPulseValues').show();

      }


      _this.setInstrumentData();

    });


    $('.pulsetableAdd').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));
      

      _this.writePulsetable();

      if(_this.pulsetable.length <= 1) {
        _this.pulsetable = [[0x88,0x00],[0xff,0x0]];
      } else {
        _this.pulsetable.splice(rowIndex + 1, 0, [0x00, 0x00]);
      }
      _this.pulsetableHTML();   

      _this.setInstrumentData();

    });

    $('.pulsetableDelete').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));

      _this.writePulsetable();
      _this.pulsetable.splice(rowIndex , 1);
      _this.pulsetableHTML();

      _this.setInstrumentData();

    });


    $('.editInstrumentPulseWidth').on('change', function() {
      _this.setInstrumentData();
    });

    $('.editInstrumentPulseWidth').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('.editInstrumentPulsetableTime').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('.editInstrumentPulsetableTime').on('change', function() {
      _this.setInstrumentData();
    });

    $('.editInstrumentPulsetableSpeed').on('keyup', function() {
      _this.setInstrumentData();
    });

    $('.editInstrumentPulsetableSpeed').on('change', function() {
      _this.setInstrumentData();
    });

  },  

  wavetableHTML: function() {
    var html = '';

    var checked = '';
    var selected = '';


    html += '<table width="100%">';

    html += '<thead>';
    html += '<tr>';
    html += '<th>Loop&nbsp;To</th>';
    html += '<th>Action</th>';
    html += '<th>Parameters</th>';
    html += '<th>Gate</th>';
    html += '<th>Pitch</th>';
    html += '</tr>';
    html += '</thead>';


    html += '<tbody>';
    var loopTo = 0;

    if(this.wavetable.length > 0) {
      loopTo = this.wavetable[this.wavetable.length - 1][1];
      if(loopTo == 0) {
        loopTo = this.wavetable.length;
      }
    }

    for(var i = 0; i < this.wavetable.length; i++) {
      html += '<tr>';

      if(this.wavetable.length <= 1) {
        html += '<td colspan="5">';
        html += '<button type="button" class="wavetableAdd" id="row' + i + '_add">Add Row</button>';
        html += '</td>';

      }  else {

        html += '<td>';
        var checked = '';
        if(loopTo == i + 1) {
          checked = ' checked="checked" ';
        }

        html += '<input type="radio" name="wavetableLoop" id="row' + i + '_wavetableLoop" value="' + i + '" ' + checked + '>';
        html += '</td>';



        if(i == this.wavetable.length - 1) {
          // its the last row
          html += '<td colspan="5">&nbsp;</td>';
        } else {
          html += '<td>';

          html += '<select id="row' + i + '_type" class="wavetableRowType">';

          selected = '';
          if(this.wavetable[i][0] >= 0x10) {
            selected = ' selected="selected" ';
          }
          html += '<option value="wave" ' + selected + '>Set Wave</option>';

          selected = '';
          if(this.wavetable[i][0] <= 0x0f) {
            selected = ' selected="selected" ';
          }
          html += '<option value="delay" ' + selected + '>Delay</option>';
          selected = '';
          if(this.wavetable[i][0] == 0xf2) {
            selected = ' selected="selected" ';
          }
          html += '<option value="portamentodown" ' + selected + '>Portamento Down</option>';

          selected = '';
          if(this.wavetable[i][0] == 0xf1) {
            selected = ' selected="selected" ';
          }
          html += '<option value="portamentoup" ' + selected + '>Portamento Up</option>';


          selected = '';
          if(this.wavetable[i][0] == 0xf4) {
            selected = ' selected="selected" ';
          }
          html += '<option value="vibrato" ' + selected + '>Vibrato</option>';


          selected = '';
          if(this.wavetable[i][0] == 0xf5) {
            selected = ' selected="selected" ';
          }
          html += '<option value="attackDecay" ' + selected + '>Set Attack/Decay</option>';


          selected = '';
          if(this.wavetable[i][0] == 0xf6) {
            selected = ' selected="selected" ';
          }
          html += '<option value="sustainRelease" ' + selected + '>Set Sustain/Release</option>';
          html += '</select>';


          html += '</td><td>';

          var value = 0;
          html += '<span id="row' + i + '_portamentoSpeed"';
          if(this.wavetable[i][0] != 0xf1 && this.wavetable[i][0] != 0xf2) {
            html += ' style="display: none" ';

          } else {
            var speedtableIndex = this.wavetable[i][1] - 1;
            if(this.speedtable && speedtableIndex < this.speedtable.length) {
              value = (this.speedtable[speedtableIndex][0] << 8) + this.speedtable[speedtableIndex][1];
            }

          }
          html += '>';
          html += 'Speed: <input size="4" value="' + value + '" class="number editInstrumentWavetableParam" min="0" max="65535" id="row' + i + '_portamentoSpeedValue"/> (0-65535)';
          html += '</span>';


          // vibrato
          var vibratoSpeed = 0;
          var vibratoDepth = 0;
          html += '<span id="row' + i + '_vibrato"';
          if(this.wavetable[i][0] != 0xf4) {
            html += ' style="display: none" ';
          } else {
            var speedtableIndex = this.wavetable[i][1] - 1;
            if(this.speedtable && speedtableIndex < this.speedtable.length) {
              vibratoSpeed = this.speedtable[speedtableIndex][0];
              vibratoDepth = this.speedtable[speedtableIndex][1];
            }

          }
          html += '>';


          html += '<label>';
          html += 'Cycle Time';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0"  max="127" value="' + vibratoSpeed + '" id="row' + i + '_vibratoSpeed"/> Ticks (0-127)';
          html += '</label>';

          html += '&nbsp;&nbsp;';

          html += '<label>';
          html += 'Depth';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0" max="255" value="' + vibratoDepth + '" id="row' + i + '_vibratoDepth"/> / Tick (0-255)';
          html += '</label>';

          html += '</span>';

          // attack/decay
          var attack = 0;
          var decay = 0;
          var value = this.wavetable[i][1];
          html += '<span id="row' + i + '_attackDecay"';
          if(this.wavetable[i][0] != 0xf5) {
            html += ' style="display: none" ';
          } else {
            attack = (value & 0xf0) >> 4;
            decay = value & 0xf;

          }
          html += '>';


          html += '<label>';
          html += 'Attack ';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0" max="15" value="' + attack + '" id="row' + i + '_attack"/> (0-15)';
          html += '</label>';

          html += '<label>';
          html += 'Decay ';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0" max="15" value="' + decay + '" id="row' + i + '_decay"/> (0-15)';
          html += '</label>';

          html += '</span>';

          // sustain/release
          var sustain = 0;
          var release = 0;
          var value = this.wavetable[i][1];

          html += '<span id="row' + i + '_sustainRelease"';
          if(this.wavetable[i][0] != 0xf6) {
            html += ' style="display: none" ';
          } else {
            sustain = (value & 0xf0) >> 4;
            release = value & 0xf;          
          }
          html += '>';


          html += '<label>';
          html += 'Sustain ';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0" max="15" value="' + sustain + '" id="row' + i + '_sustain"/> (0-15)';
          html += '</label>';

          html += '<label>';
          html += 'Release ';
          html += '<input size="4" class="number editInstrumentWavetableParam" min="0" max="15" value="' + release + '" id="row' + i + '_release"/> (0-15)';
          html += '</label>';

          html += '</span>';


          // delay
          html += '<span id="row' + i + '_delay"';
          if(this.wavetable[i][0] > 0x0f) {
            html += ' style="display: none" ';
          }
          html += '>';
          html += 'Delay:';
  //        html += '<input id="row' + i + '_delayAmount" value="' + this.wavetable[i][0] + '" size="4">';
  //
  //
          html += '<select id="row' + i + '_delayAmount" value="' + this.wavetable[i][0] + '">';
          for(var j = 0; j <= 15; j++) {
            selected = '';
            if(j == this.wavetable[i][0]) {
              selected = ' selected="selected" ';
            }
            var delay = j + 1;
            html += '<option value="' + j + '" ' + selected + '>' + delay + '</option>';      
          }
          html += '</select>';

          html += '</span>';

          html += '<span id="row' + i + '_waveTypes"';
          if(this.wavetable[i][0] <= 0x0f || this.wavetable[i][0] > 0xf0) {
            html += ' style="display: none" ';
          }
          html += '>';
          var checked = '';
          if(this.wavetable[i][0] & 0x10) {
            checked = ' checked="checked" ';
          }
          html += '<label><input id="row' + i + '_tri" class="advWavetableWaveform" type="checkbox" ' + checked + '>Tri</label>&nbsp;';

          var checked = '';
          if(this.wavetable[i][0] & 0x20) {
            checked = ' checked="checked" ';
          }      
          html += '<label><input id="row' + i + '_saw" class="advWavetableWaveform" type="checkbox" ' + checked + '>Saw</label>&nbsp;';

          var checked = '';
          if(this.wavetable[i][0] & 0x40) {
            checked = ' checked="checked" ';
          }            
          html += '<label><input id="row' + i + '_pulse" class="advWavetableWaveform" type="checkbox" ' + checked + '>Pulse</label>&nbsp;';

          var checked = '';
          if(this.wavetable[i][0] & 0x80) {
            checked = ' checked="checked" ';
          }            
          html += '<label><input id="row' + i + '_noise" class="advWavetableWaveform" type="checkbox" ' + checked + '>Noise</label>&nbsp;';

          var checked = '';
          if(this.wavetable[i][0] & 0x02) {
            checked = ' checked="checked" ';
          }            
          html += '<label><input id="row' + i + '_sync" class="advWavetableWaveform" type="checkbox" ' + checked + '>Sync</label>&nbsp;';


          var checked = '';
          if(this.wavetable[i][0] & 0x04) {
            checked = ' checked="checked" ';
          }            
          html += '<label><input id="row' + i + '_ring" class="advWavetableWaveform" type="checkbox" ' + checked + '>Ring Mod</label>&nbsp;';

          var checked = '';
          if(this.wavetable[i][0] & 0x08) {
            checked = ' checked="checked" ';
          }            
          html += '<label><input id="row' + i + '_test" class="advWavetableWaveform" type="checkbox" ' + checked + '>Testbit</label>&nbsp;';


          html += '</span>';
          html += '</td>';

          // gate
          html += '<td>'
          var checked = '';
          if(this.wavetable[i][0] & 0x01) {
            checked = ' checked="checked" ';
          }            
          html += '<input  id="row' + i + '_gate" class="advWavetableGate" type="checkbox" ' + checked;
          if(this.wavetable[i][0] <= 0x0f || this.wavetable[i][0] > 0xf0) {
            html += ' style="display: none" ';
          }

          html += '>';
          html += '</td>';

          // pitch
          html += '<td>';

          html += '<span id="row' + i + '_pitch"';

          if(this.wavetable[i][0] > 0xf0) {
            html += ' style="display:none" ';
          }
          html += '>';

          html += '<select class="wavetablePitchType" id="row' + i + '_pitchType" name="row' + i + '_pitchType">';



          selected = '';
          if(this.wavetable[i][1] == 0x80) {
            selected = ' selected="selected" ';
          }

          html += '<option value="noChange" ' + selected + '>No Change</option>'


          selected = '';
          if(this.wavetable[i][1] <= 0x7f) {
            selected = ' selected="selected" ';
          }
          html += '<option value="relative" ' + selected + '>Relative</option>'

          selected = '';
          if(this.wavetable[i][1] > 0x80) {
            selected = ' selected="selected" ';
          }

          html += '<option value="absolute" ' + selected + '>Absolute</option>'
          html += '</select>';

          html += '<select class="advPitchRelative" id="row' + i + '_pitchRelative"';
          if(this.wavetable[i][1] >= 0x80) {
            html += ' style="display:none" ';
          }        
          html += '>';


          for(var j = 94; j > 0; j--) {
            var selected = '';
            if(this.wavetable[i][1] ==  j) {
              selected = ' selected="selected" ';
            }
            html += '<option value="' + j + '" ' + selected + '>+' + j + '</option>';
          }

          selected = '';
          if(this.wavetable[i][1] == 0 || this.wavetable[i][1] == 0x80) {
            selected = ' selected="selected" ';
          }
          html += '<option value="0" ' + selected + '>+0</option>';

          for(var j = 1; j > -30; j--) {
            var selected = '';
            if(this.wavetable[i][1] == 0x80 + j) {
              selected = ' selected="selected" ';
            }

            html += '<option value="' + j + '" ' + selected + '>' + j + '</option>';
          }


          /*
          for(var j = -30; j < 0; j++) {
            var selected = '';
            if(this.wavetable[i][1] == 0x80 + j) {
              selected = ' selected="selected" ';
            }
            html += '<option value="' + j + '" ' + selected + '>' + j + '</option>';
          }

          selected = '';
          if(this.wavetable[i][1] == 0 || this.wavetable[i][1] == 0x80) {
            selected = ' selected="selected" ';
          }
          html += '<option value="0" ' + selected + '>+0</option>';

          for(var j = 1; j < 95; j++) {
            var selected = '';
            if(this.wavetable[i][1] ==  j) {
              selected = ' selected="selected" ';
            }

            html += '<option value="' + j + '" ' + selected + '>+' + j + '</option>';
          }
  
          */

          html += '</select>';

          var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          html += '<select class="advPitchAbsolute" id="row' + i + '_pitchAbsolute"';
          selected = '';
          if(this.wavetable[i][1] <= 0x80) {
            html += ' style="display: none" ';
          }

          html += '>';
          for(var j = 92; j >= 0; j--) {
//          for(var j = 0; j < 92; j++) {
            var selected = '';
            var noteIndex = j % 12;
            var octave = Math.floor(j / 12);
            var note = notes[noteIndex] + octave;

            if(j + 0x81 == this.wavetable[i][1]) {
              selected = ' selected="selected" ';
            }
            html += '<option value="' + j + '" ' + selected + '>' + note + '</option>';
          }
          html += '</select>';



          html += '</span>';
          html += '</td>';
          html += '<td>';
          html += '<button type="button" class="wavetableAdd" id="row' + i + '_add">Add Row</button>';
          html += '<button type="button" class="wavetableDelete" id="row' + i + '_delete">Delete Row</button>';
          html += '</td>';
        }
      }

      html += '</tr>';

    }

    html += '</tbody>';
    html += '</table>';
    $('#editInstrumentWavetable').html(html);

    UI.number.initControls('#editInstrumentWavetable .number');

    this.setupWavetableEvents();

//    this.calculateScroll();
  },

  setupWavetableEvents: function() {
    var _this = this;

    $('.wavetablePitchType').on('change', function() {
      var id = $(this).attr('id');
      var value = $(this).val();
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      if(value == 'noChange') {
        $('#' + row + '_pitchAbsolute').hide();
        $('#' + row + '_pitchRelative').hide();
      } else if(value == 'absolute') {
        $('#' + row + '_pitchAbsolute').val(48); // c4
        $('#' + row + '_pitchAbsolute').show();
        $('#' + row + '_pitchRelative').hide();
      } else {
        // relative
        $('#' + row + '_pitchRelative').val(0);
        $('#' + row + '_pitchAbsolute').hide();
        $('#' + row + '_pitchRelative').show();
      }
      _this.setInstrumentData();      
    });

    $('.wavetableRowType').on('change', function() {
      var id = $(this).attr('id');
      var value = $(this).val();
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);

      if(value == 'wave') {
        $('#' + row + '_waveTypes').show();
        $('#' + row + '_gate').show();
        $('#' + row + '_delay').hide();
        $('#' + row + '_pitch').show();        
        $('#' + row + '_portamentoSpeed').hide();
        $('#' + row + '_vibrato').hide();
        $('#' + row + '_attackDecay').hide();
        $('#' + row + '_sustainRelease').hide();

      } else if(value == 'delay') {
        $('#' + row + '_waveTypes').hide();
        $('#' + row + '_gate').hide();
        $('#' + row + '_delay').show();
        $('#' + row + '_pitch').show();        
        $('#' + row + '_portamentoSpeed').hide();
        $('#' + row + '_vibrato').hide();
        $('#' + row + '_attackDecay').hide();
        $('#' + row + '_sustainRelease').hide();
      } else if(value == 'portamentoup' || value == 'portamentodown') {
        $('#' + row + '_waveTypes').hide();
        $('#' + row + '_gate').hide();
        $('#' + row + '_delay').hide();
        $('#' + row + '_pitch').hide();        
        $('#' + row + '_portamentoSpeed').show();
        $('#' + row + '_vibrato').hide();
        $('#' + row + '_attackDecay').hide();
        $('#' + row + '_sustainRelease').hide();
      } else if(value == 'vibrato') {
        $('#' + row + '_waveTypes').hide();
        $('#' + row + '_gate').hide();
        $('#' + row + '_delay').hide();
        $('#' + row + '_pitch').hide();        
        $('#' + row + '_portamentoSpeed').hide();
        $('#' + row + '_vibrato').show();
        $('#' + row + '_attackDecay').hide();
        $('#' + row + '_sustainRelease').hide();

      } else if(value == 'attackDecay') {
        $('#' + row + '_waveTypes').hide();
        $('#' + row + '_gate').hide();
        $('#' + row + '_delay').hide();
        $('#' + row + '_pitch').hide();        
        $('#' + row + '_portamentoSpeed').hide();
        $('#' + row + '_vibrato').hide();
        $('#' + row + '_attackDecay').show();
        $('#' + row + '_sustainRelease').hide();
      } else if(value == 'sustainRelease') {
        $('#' + row + '_waveTypes').hide();
        $('#' + row + '_gate').hide();
        $('#' + row + '_delay').hide();
        $('#' + row + '_pitch').hide();        
        $('#' + row + '_portamentoSpeed').hide();
        $('#' + row + '_vibrato').hide();
        $('#' + row + '_attackDecay').hide();
        $('#' + row + '_sustainRelease').show();

      }
      _this.setInstrumentData();      
    }); 

    $('.wavetableAdd').on('click', function() {

      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));
      

      _this.writeWaveTable();
      if(_this.wavetable.length <= 1) {
        _this.wavetable = [[0x41,0x0], [0xff,0x0]];

      } else {
        _this.wavetable.splice(rowIndex + 1, 0, [0x00, 0x00]);
      }

      _this.wavetableHTML();    
      _this.setInstrumentData();
    });

    $('.wavetableDelete').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));

      _this.writeWaveTable();
      _this.wavetable.splice(rowIndex , 1);
      _this.wavetableHTML();
      _this.setInstrumentData();
    });

    $('.advWavetableWaveform').on('click', function() {
      _this.setInstrumentData();
    });

    $('.advWavetableGate').on('click', function() {
      _this.setInstrumentData();
    });

    $('.advPitchAbsolute').on('change', function() {
      _this.setInstrumentData();
    });

    $('.advPitchRelative').on('change', function() {
      console.log('adv pitch relative');
      _this.setInstrumentData();
    });

    $('.advWavetableWaveform').on('change', function() {
      _this.setInstrumentData();
    });

    $('input[name=wavetableLoop]').on('click', function() {
      _this.setInstrumentData();
    });


    $('.editInstrumentWavetableParam').on('change', function() {
      _this.setInstrumentData();
    });


    $('.editInstrumentWavetableParam').on('keyup', function() {
      _this.setInstrumentData();
    });


  },


  writePulsetable: function() {
    var instrumentType = $('input:radio[name=editInstrumentType]:checked').val();

    if(instrumentType == 'basic') {
      var width = parseInt($('#editInstrumentPMWidth').val());      
      width = Math.floor(4096 * width / 100);
      var speed = $('#editInstrumentPMSpeed').val();      
      var depth = $('#editInstrumentPMDepth').val();      
      if(depth > 127) {
        depth = 127;
      }


      this.pulsetable = [];

      var left = width & 0xf00;
      left = left >> 8;
      left = left | 0x80;
      right = width & 0xff;

      this.pulsetable.push([left, right]);
      if(speed == 0) {
        this.pulsetable.push([0xff, 0x00]);
      } else {
        var speedParts = speed;
        while(speedParts > 127) {
          this.pulsetable.push([127, depth]);
          speedParts -= 127;
        }
        this.pulsetable.push([speedParts, depth]);
        depth = 256 - depth;
//        this.pulsetable.push([speed, depth]);

        var speedParts = speed;
        while(speedParts > 127) {
          this.pulsetable.push([127, depth]);
          speedParts -= 127;
        }
        this.pulsetable.push([speedParts, depth]);

        
        this.pulsetable.push([0xff, 0x02]);
      }

      this.pulsetableHTML();
    } else if(instrumentType == 'advanced') {
      var rows = this.pulsetable.length; 

      this.pulsetable = [];
      for(var i = 0; i < rows - 1; i++) {
        var left = 0;
        var right = 0;
        var type = $('#row' + i + '_pulseTableType').val();

        if(type == "stepPulse") {
          left = parseInt($('#row' + i + '_pulsetableTime').val());

          if(left > 127) {
            left = 127;
            $('#row' + i + '_pulsetableTime').val(left)
          }
          right = parseInt($('#row' + i + '_pulsetableSpeed').val());
          if(right > 127) {
            right = 127;
            $('#row' + i + '_pulsetableSpeed').val(right);
          }
          if(right < -127) {
            right = -127;
            $('#row' + i + '_pulsetableSpeed').val(right);
          }

          if(right < 0) {
            right = 256+right;
          }
        }

        if(type == "setPulse") {
          var pulseWidth = parseInt($('#row' + i + '_pulseWidth').val());
          var left = 0x80 + ((pulseWidth & 0xf00) >> 8);
          var right = pulseWidth & 0xff;


  //        left = parseInt($('#row' + i + '_pulsetableTime').val());
  //        right = parseInt($('#row' + i + '_pulsetableSpeed').val());

        }

        this.pulsetable.push([left, right]);
      }

      var pulsetableLoop = parseInt($('input[name=pulsetableLoop]:checked').val());
      if(pulsetableLoop == this.pulsetable.length ) {
        pulsetableLoop = 0;
      } else { 
        pulsetableLoop += 1;
      }


      this.pulsetable.push([0xff, pulsetableLoop]);
    } else if(instrumentType == 'drum') {
      var drumType = $('input:radio[name=editInstrumentDrumType]:checked').val();      
      this.pulsetable = [];
      switch(drumType) {
        case 'bass':
          this.pulsetable.push([0x88,0x00]);
          this.pulsetable.push([0xff,0x0]);
        break;
        case 'tom':
          this.pulsetable.push([0x88,0x00]);
          this.pulsetable.push([0xff,0x0]);
        break;
        case 'snare':
          this.pulsetable.push([0x88,0x00]);
          this.pulsetable.push([0xff,0x0]);
        break;
        case 'hihat':
          this.pulsetable.push([0x88,0x00]);
          this.pulsetable.push([0xff,0x0]);
        break;
      }
//      this.pulsetable.push([0xff, 0x00]);
      this.pulsetableHTML();

    }

    if(this.pulsetable.length == 1) {
      this.pulsetable = [];
    }
    
  },


  getArpeggioIntervals: function(args) {
    var mode = args.mode;
    var steps = args.steps;

    if(steps == 2) {
      return [0, 12];
    }

    var notes = [];
    if(steps == 3) {
      notes = [1, 3, 5];
    }


    if(steps == 4) {
      notes = [1, 2, 3, 5];
    }

    if(steps == 8) {
      notes = [1, 2, 3, 4, 5, 6, 7, 8];      
    }





    console.log('get arpeggio intervals = ' + mode + ',' + steps);
    var modeIntervals = this.music.scales.getIntervals(mode);
    var intervals = [];
    for(var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var interval = 0;

      var octave = Math.floor(note / 8);
      var note = note % 8;

      interval = octave * 12;

      for(var j = 0; j < note - 1; j++) {
        interval += modeIntervals[j];
      }
      intervals.push(interval);
    }

    console.log(modeIntervals);
    console.log('arp intervals:');
    console.log(intervals);

    return intervals;

  },

  writeWaveTable: function() {
//    var basic = $('#editInstrumentType_basic').is(':checked');
    var instrumentType = $('input:radio[name=editInstrumentType]:checked').val();

    this.speedtable = [];

    if(instrumentType == 'basic') {
      this.wavetable = [];
      var left = 0x01;
      var right = 0;

      if($('#editInstrumentWaveform_triangle').is(':checked')) {
        left = left | 0x10;
      }
      if($('#editInstrumentWaveform_sawtooth').is(':checked')) {
        left = left | 0x20;
      }
      if($('#editInstrumentWaveform_pulse').is(':checked')) {
        left = left | 0x40;
      }
      if($('#editInstrumentWaveform_noise').is(':checked')) {
        left = left | 0x80;
      }
      this.wavetable.push([left, right]);

      var waveform = left;

      var effect = $('input[name=editInstrumentBasicEffect]:checked').val();

      if(effect == 'tremolo') {
        var onSpeed = parseInt($('#editInstrumentTremoloOnSpeed').val()) - 2;
        var offSpeed = parseInt($('#editInstrumentTremoloOffSpeed').val()) - 2;


        // need to loop over no pitch effect so portamento works
        var waveformOff = waveform & 0xf0;
        if(onSpeed >= 0) {
          this.wavetable.push([onSpeed, 0x80]);
        }
        this.wavetable.push([waveformOff, 0x80])
        if(offSpeed >= 0) {
          this.wavetable.push([offSpeed, 0x80]);
        }
        this.wavetable.push([waveform, 0x80])
        this.wavetable.push([0xff, 0x02]);

      } else if(effect == 'arpeggio') {
        var arpeggioSpeed = parseInt($('#editInstrumentArpeggioSpeed').val());

//        var arpeggioType = $('input[name=editInstrumentArpeggioType]:checked').val();
//        var arpeggioDir = $('input[name=editInstrumentArpeggioDir]:checked').val();

        var arpeggioMode = $('input[name=editInstrumentArpeggioMode]:checked').val();
        var arpeggioSteps = $('input[name=editInstrumentArpeggioSteps]:checked').val();

        if(arpeggioSpeed != 0) {
          var intervals = this.getArpeggioIntervals({ "mode": arpeggioMode, "steps": arpeggioSteps });

          if(intervals.length == 0) {
            // uh oh
          } else {
            // remove the waveform with 0 relative offset, to replace with first step
            this.wavetable.pop();

            // add first entry back in
            var value = intervals[0];
            this.wavetable.push([left, value]);;
            left = arpeggioSpeed - 1;
            if(left < 0) {
              left = 0;
            } 

            for(var i = 1; i < intervals.length; i++) {
              var delay = left;
              if(i == 1 && delay > 1) {
                delay--;
              }
              var value = intervals[i];
              this.wavetable.push([delay, value]);;
            }
            if(left > 1) {
              // add in final delay
              this.wavetable.push([left, 0x80]);
            }
            // loop back to start
            this.wavetable.push([0xff, 0x01]);
          }

        }


/*

        if(false && arpeggioSpeed != 0 && arpeggioType != 'none') {
          if(arpeggioSpeed > 15) {
            arpeggioSpeed = 15;          
          }

          if(arpeggioType == 'custom') {

            this.wavetable.pop();
            var value = parseInt($('#editInstrumentArpeggioStep0').val());
            this.wavetable.push([left, value]);;
            left = arpeggioSpeed - 1;
            if(left < 0) {
              left = 0;
            } 
            for(var i = 1; i < this.arpeggioSteps; i++) {
              var delay =left;
              if(i == 1 && delay > 1) {
                delay--;
              }
              var value = parseInt($('#editInstrumentArpeggioStep' + i).val());
              this.wavetable.push([delay, value]);;
            }

            if(left > 1) {
              this.wavetable.push([left, 0x80]);
            }
//            this.wavetable.push([left, right]);
            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'octave') {
            left = arpeggioSpeed - 2;
            if(left < 0) {
              left = 0;
            } 
            right = 12;
            this.wavetable.push([left, right]);
            left = arpeggioSpeed - 1;
            right = 0;
            this.wavetable.push([left, right]);
            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'minor') {

            if(arpeggioDir == 'up' || arpeggioDir == 'updown') {
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 3;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 7;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'up') {
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);            
            }
            if(arpeggioDir == 'updown') {
              left = arpeggioSpeed - 1; 
              right = 3;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'down') {

              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 0x80 -5;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 

              right = 0x80 -9;
              this.wavetable.push([left, right]);            
              right = 0;
              this.wavetable.push([left, right]);
            }

            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'major') {
            left = arpeggioSpeed; 

            if(arpeggioDir == 'up') {          
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 7;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'down') {          
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 0x80 - 5;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0x80 - 8;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);
            }


            if(arpeggioDir == 'updown') { 
              left = arpeggioSpeed - 2;  
              if(left < 0) {
                left = 0;
              } 

              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;               
              right = 7;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;               
              right = 0;
              this.wavetable.push([left, right]);
            }

            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'diminished') {

            if(arpeggioDir == 'up' || arpeggioDir == 'updown') {
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 3;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 6;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'up') {
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);            
            }
            if(arpeggioDir == 'updown') {
              left = arpeggioSpeed - 1; 
              right = 3;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'down') {

              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 0x80 -6;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 

              right = 0x80 -9;
              this.wavetable.push([left, right]);            
              right = 0;
              this.wavetable.push([left, right]);
            }

            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'augmented') {
            left = arpeggioSpeed; 

            if(arpeggioDir == 'up') {          
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 8;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'down') {          
              left = arpeggioSpeed - 2; 
              if(left < 0) {
                left = 0;
              } 

              right = 0x80 - 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0x80 - 8;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 0;
              this.wavetable.push([left, right]);
            }


            if(arpeggioDir == 'updown') { 
              left = arpeggioSpeed - 2;  
              if(left < 0) {
                left = 0;
              } 

              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;               
              right = 7;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1; 
              right = 4;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;               
              right = 0;
              this.wavetable.push([left, right]);
            }

            this.wavetable.push([0xff, 0x01]);

          } else if(arpeggioType == 'majorscale') {
            if(arpeggioDir == 'up') {               
              left = arpeggioSpeed - 2;  
              if(left < 0) {
                left = 0;
              } 
              right = 2;
              this.wavetable.push([left, right]);
              right = 4;
              left = arpeggioSpeed - 1;               
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 9;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);
              right = 12;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'down') {               
              left = arpeggioSpeed - 2;  
              if(left < 0) {
                left = 0;
              } 
              right = 0x80 - 1;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;                             
              right = 0x80 - 3;
              this.wavetable.push([left, right]);
              right = 0x80 - 5;
              this.wavetable.push([left, right]);
              right = 0x80 - 7;
              this.wavetable.push([left, right]);
              right = 0x80 - 8;
              this.wavetable.push([left, right]);
              right = 0x80 - 10;
              this.wavetable.push([left, right]);
              right = 0x80 - 12;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }

            if(arpeggioDir == 'updown') {               
              left = arpeggioSpeed - 2;  
              if(left < 0) {
                left = 0;
              } 
              right = 2;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;                             

              right = 4;
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 9;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);
              right = 12;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);                        
              right = 9;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 4;
              this.wavetable.push([left, right]);
              right = 2;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }


            this.wavetable.push([0xff, 0x01]);
          } else if(arpeggioType == 'minorscale') {
            left = arpeggioSpeed; 

            if(arpeggioDir == 'up') {
              left = arpeggioSpeed - 2;
              if(left < 0) {
                left = 0;
              }
              right = 2;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;
              right = 3;
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 8;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);
              right = 12;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }
            if(arpeggioDir == 'down') {
              left = arpeggioSpeed - 2;
              if(left < 0) {
                left = 0;
              }
              right = 0x80-1;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;
              right = 0x80-4;
              this.wavetable.push([left, right]);
              right = 0x80-5;
              this.wavetable.push([left, right]);
              right = 0x80-7;
              this.wavetable.push([left, right]);
              right = 0x80-9;
              this.wavetable.push([left, right]);
              right = 0x80-10;
              this.wavetable.push([left, right]);
              right = 0x80-12;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);
            }            

            if(arpeggioDir == 'updown') {
              left = arpeggioSpeed - 2;
              if(left < 0) {
                left = 0;
              }
              right = 2;
              this.wavetable.push([left, right]);
              left = arpeggioSpeed - 1;
              right = 3;
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 8;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);
              right = 12;
              this.wavetable.push([left, right]);
              right = 11;
              this.wavetable.push([left, right]);
              right = 8;
              this.wavetable.push([left, right]);
              right = 7;
              this.wavetable.push([left, right]);
              right = 5;
              this.wavetable.push([left, right]);
              right = 3;
              this.wavetable.push([left, right]);
              right = 2;
              this.wavetable.push([left, right]);
              right = 0;
              this.wavetable.push([left, right]);


            }
            this.wavetable.push([0xff, 0x01]);
          }
  //        $('input[name=radioName]:checked').val();
        }

        */
      } else if(effect == 'pitch') {
        var pitchEffect = $('input[name=editInstrumentPitchEffect]:checked').val();
        var ticks = parseInt($('#editInstrumentPitchEffectTicks').val());
        var speed = parseInt($('#editInstrumentPitchEffectSpeed').val());
        if(pitchEffect == 'bendup') {
          // portamento down
          left = 0xf2;  
          var downamount = ticks * speed;
          var speedtableLeft = (downamount & 0xff00) >> 8;
          var speedtableRight = downamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          right = this.speedtable.length;
          this.wavetable.push([left, right]);
          var upamount = speed;
          var speedtableLeft = (upamount & 0xff00) >> 8;
          var speedtableRight = upamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          left = 0xf1;  
          right = this.speedtable.length;
          for(var i = 0; i < ticks; i++) {
            this.wavetable.push([left, right]);
          }
          this.wavetable.push([0xff, 0x00]);

          // 


        }

        if(pitchEffect == 'benddown') {
          // portamento up
          left = 0xf1;  
          var downamount = ticks * speed;
          var speedtableLeft = (downamount & 0xff00) >> 8;
          var speedtableRight = downamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          right = this.speedtable.length;
          this.wavetable.push([left, right]);
          var upamount = speed;
          var speedtableLeft = (upamount & 0xff00) >> 8;
          var speedtableRight = upamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          left = 0xf2;  
          right = this.speedtable.length;
          for(var i = 0; i < ticks; i++) {
            this.wavetable.push([left, right]);
          }
          this.wavetable.push([0xff, 0x00]);
          
        }


        if(pitchEffect == 'drop') {
          // portamento down
          left = 0xf2;  
          var downamount = ticks * speed;
          var speedtableLeft = (downamount & 0xff00) >> 8;
          var speedtableRight = downamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          right = this.speedtable.length;
          this.wavetable.push([left, right]);
          this.wavetable.push([0xff, this.wavetable.length]);

        }

        if(pitchEffect == 'rise') {
          // portamento up
          left = 0xf1;  
          var upamount = ticks * speed;
          var speedtableLeft = (upamount & 0xff00) >> 8;
          var speedtableRight = upamount & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          right = this.speedtable.length;
          this.wavetable.push([left, right]);
          this.wavetable.push([0xff, this.wavetable.length]);

        }

      } else {

        this.wavetable.push([0xff, 0x00]);
      }
      this.wavetableHTML();
    } else if(instrumentType == 'advanced') {
      var rows = this.wavetable.length;
      for(var i = 0; i < rows - 1; i++) {
       
        var left = 0;
        var right = 0; 


        var type = $('#row' + i + '_type').val();
        if(type == 'portamentodown' || type == 'portamentoup') {

          if(type == 'portamentoup') {
            left = 0xf1;  

          } else {
            left = 0xf2;  
          }

          var speed = parseInt($('#row' + i + '_portamentoSpeedValue').val());       
          var speedtableLeft = (speed & 0xff00) >> 8;
          var speedtableRight = speed & 0xff;
          this.speedtable.push([speedtableLeft, speedtableRight]);
          right = this.speedtable.length;
        } else if(type == 'vibrato') {
          left = 0xf4;
          var speed = parseInt($('#row' + i + '_vibratoSpeed').val());  
          var depth = parseInt($('#row' + i + '_vibratoDepth').val());  
          this.speedtable.push([speed, depth]);
          right = this.speedtable.length;


        } else if(type == 'delay') {
          left = parseInt($('#row' + i + '_delayAmount').val());

        } else if(type == 'wave') {
          if($('#row' + i + '_tri').is(':checked')) {
            left = left | 0x10;
          }
          if($('#row' + i + '_saw').is(':checked')) {
            left = left | 0x20;
          }
          if($('#row' + i + '_pulse').is(':checked')) {
            left = left | 0x40;
          }

          if($('#row' + i + '_noise').is(':checked')) {
            left = left | 0x80;
          }
          if($('#row' + i + '_sync').is(':checked')) {
            left = left | 0x02;
          }
          if($('#row' + i + '_ring').is(':checked')) {
            left = left | 0x04;
          }
          if($('#row' + i + '_test').is(':checked')) {
            left = left | 0x08;
          }

          if($('#row' + i + '_gate').is(':checked')) {
            left = left | 0x01;
          }
        } else if(type == 'attackDecay') {
          left = 0xf5;
          var attack = parseInt($('#row' + i + '_attack').val()) & 0xf;       
          var decay = parseInt($('#row' + i + '_decay').val()) & 0xf;    

          right = (attack << 4) + decay;

        } else if(type == 'sustainRelease') {
          left = 0xf6;

          var sustain = parseInt($('#row' + i + '_sustain').val()) & 0xf;       
          var release = parseInt($('#row' + i + '_release').val()) & 0xf;    


          right = (sustain << 4) + release;


        }


        if(type != 'portamentodown' && type != 'portamentoup' && type != 'vibrato' && type != 'attackDecay' && type != 'sustainRelease') {
          if($('#row' + i + '_pitchType').val() == 'noChange') {
            right = 0x80;
          } else if($('#row' + i + '_pitchType').val() == 'absolute') {
            right = 0x81 + parseInt($('#row' + i + '_pitchAbsolute').val());
            //alert(right);
          } else {
            right = parseInt($('#row' + i + '_pitchRelative').val());
     
            if(right <= 0) {
              if(right != 0) {
                right = 0x80 + right
              }
            } else {
              right = right;
            }
          }
        }

        this.wavetable[i] = [left, right];
      }

      var wavetableLoop = parseInt($('input[name=wavetableLoop]:checked').val());
      if(wavetableLoop == this.wavetable.length - 1) {
        wavetableLoop = 0;
      } else { 
        wavetableLoop += 1;
      }

      this.wavetable[this.wavetable.length - 1] = [0xff, wavetableLoop];
    } else if(instrumentType == 'drum') {
      var drumType = $('input:radio[name=editInstrumentDrumType]:checked').val(); 
      left = 0;
      if($('#editInstrumentDrumWaveform_triangle').is(':checked')) {
        left = left | 0x10;
      }
      if($('#editInstrumentDrumWaveform_sawtooth').is(':checked')) {
        left = left | 0x20;
      }
      if($('#editInstrumentDrumWaveform_pulse').is(':checked')) {
        left = left | 0x40;
      }

      if(left == 0) {
        left = 0x40;
      }


      this.wavetable = [];
      switch(drumType) {
        case 'bass':
          this.wavetable.push([0x81,0xd8]);
          this.wavetable.push([left | 0x1,0xa6]);
          this.wavetable.push([left | 0x1,0xa0]);
          this.wavetable.push([left,0x98]);
          this.wavetable.push([0x00,0x94]);
          this.wavetable.push([0xff,0x0]);     
        break;
        case 'tom':
          this.wavetable.push([0x81,0xc8]);
          this.wavetable.push([left | 0x1,0x0]);
          this.wavetable.push([left | 0x1,0x7f]);
          this.wavetable.push([left,0x7e]);
          this.wavetable.push([left,0x7d]);
          this.wavetable.push([0x00,0x7c]);
          this.wavetable.push([0x00,0x7b]);
          this.wavetable.push([0x00,0x7a]);
          this.wavetable.push([0x00,0x79]);
          this.wavetable.push([0x00,0x78]);
          this.wavetable.push([0x00,0x77]);
          this.wavetable.push([0x00,0x76]);
          this.wavetable.push([0x00,0x75]);
          this.wavetable.push([0xff,0x0]);        
        break;
        case 'snare':
          this.wavetable.push([0x81,0xd0]);
          this.wavetable.push([left | 0x1,0xaa]);
          this.wavetable.push([left | 0x1,0xa4]);
          this.wavetable.push([0x80,0xd4]);
          this.wavetable.push([0x80,0xd1]);
          this.wavetable.push([0xff,0x0]);     
        break;
        case 'hihat':
          this.wavetable.push([0x81,0xde]);
          this.wavetable.push([0x80,0xdc]);
          this.wavetable.push([0xff,0x0]);
        break;
      }
      this.wavetableHTML();      
    }

    if(this.wavetable.length == 1) {
      this.wavetable = [];
    }


  },

  setInstrumentType: function(type) {
    switch(type) {
      case 'basic':
        $('#editInstrumentAdvanced').hide();
        $('#editInstrumentBasic').show();
        $('#editInstrumentDrum').hide();
        this.setBasicEffectVisibility();
        break;
      case 'advanced':
        $('#editInstrumentAdvanced').show();
        $('#editInstrumentBasic').hide();
        $('#editInstrumentDrum').hide();
        this.showTable('wavetable');
        break;
      case 'drum':
        $('#editInstrumentAdvanced').hide();
        $('#editInstrumentBasic').hide();
        $('#editInstrumentDrum').show();
        break;

    }
  },

  showTable: function(table) {
    switch(table) {
      case 'wavetable':
        $('#wavetableTab').addClass('instrumentActiveTab');
        $('#pulsetableTab').removeClass('instrumentActiveTab');
        $('#filtertableTab').removeClass('instrumentActiveTab');
        $('#editInstrumentWavetable').show();
        $('#editInstrumentPulsetable').hide();
        $('#editInstrumentFiltertable').hide();
        break;
      case 'pulsetable':
        $('#wavetableTab').removeClass('instrumentActiveTab');
        $('#pulsetableTab').addClass('instrumentActiveTab');
        $('#filtertableTab').removeClass('instrumentActiveTab');
        $('#editInstrumentWavetable').hide();
        $('#editInstrumentPulsetable').show();
        $('#editInstrumentFiltertable').hide();
        break;
      case 'filtertable':
        $('#wavetableTab').removeClass('instrumentActiveTab');
        $('#pulsetableTab').removeClass('instrumentActiveTab');
        $('#filtertableTab').addClass('instrumentActiveTab');
        $('#editInstrumentWavetable').hide();
        $('#editInstrumentPulsetable').hide();
        $('#editInstrumentFiltertable').show();
        break;

    }
//    this.calculateScroll();

  },

  setArpeggioSteps: function(steps) {
    this.arpeggioValues = [];
    for(var i = 0; i < this.arpeggioSteps; i++) {
      var offset = $('#editInstrumentArpeggioStep' + i).val();
      if(typeof offset == 'undefined' || offset == '') {
        offset = 0;
      }
      this.arpeggioValues.push(offset);
    }
    this.arpeggioSteps = steps;

    var html = '';
    for(var i = 0; i < this.arpeggioSteps; i++) {
      var value = 0;
      if(i < this.arpeggioValues.length) {
        value = this.arpeggioValues[i];
      }
      html += '<input size="1" class="number" value="' + value + '" id="editInstrumentArpeggioStep' + i + '">&nbsp;';
    }
    $('#editInstrumentsArpeggioSteps').html(html);
    UI.number.initControls('#editInstrumentsArpeggioSteps .number');

  },



  keyDown: function(event) {
    var keyCode = event.keyCode;


    var note = this.music.patternView.keyCodeToNote(keyCode);
    var octave = 3;



    if(note != -1 && note !== this.keyboardNote) {
      /*
      var pitch = note + 12 * octave;
      var instrument = this.music.instruments.currentInstrument;
      var length = this.partsPerBeat;

      if(!this.snapToGrid) {
        length = 1;
      }

      */

      this.keyboardPlayingNote = true;

      if(this.music && this.music.musicPlayer) {  

        this.editInstrumentPlay(octave, note);


      }


    }
    this.keyboardNote = note;    

  },

  keyUp: function(event) {
    this.music.musicPlayer2.stopTestInstrument();
    this.playingInstrument = false;
    this.keyboardNote = false;

  },


  setBasicEffectVisibility: function() {
    var effect = $('input[name=editInstrumentBasicEffect]:checked').val();
    $('.editInstrumentBasicEffect').hide();
    switch(effect) {
      case 'tremolo':
        $('#editInstrumentTremolo').show();
      break;
      case 'arpeggio':
        $('#editInstrumentArpeggio').show();
      break;
      case 'pitch':
        $('#editInstrumentPitch').show();
      break;
    }

  },


  newInstrument: function() {

    this.instrumentId = -1;

    $('#instrumentName').val("New Instrument");

    this.setInstrumentType('basic');

    $('#editInstrumentAttack').val(0);
    $('#editInstrumentDecay').val(0);
    $('#editInstrumentSustain').val(4);
    $('#editInstrumentRelease').val(4);

    $('#editInstrumentVibratoSpeed').val(0);
    $('#editInstrumentVibratoDepth').val(0);
    $('#editInstrumentVibratoDelay').val(0);


    var effect = 'none';
    $('input[name="editInstrumentBasicEffect"][value="' + effect + '"]').prop('checked', true);

    $('input[name="vibrato"][value="off"]').prop('checked', true);
    $('#vibratoControls').hide();

    this.setBasicEffectVisibility();

    $('#editInstrumentWaveform_triangle').prop('checked', false);
    $('#editInstrumentWaveform_sawtooth').prop('checked', false);
    $('#editInstrumentWaveform_pulse').prop('checked', true);
    $('#pulseControls').show();

    $('#editInstrumentWaveform_noise').prop('checked', false);

    $('#editInstrumentPMWidth').val(50);
    $('#editInstrumentPMSpeed').val(0);
    $('#editInstrumentPMDepth').val(0);


  },

  editInstrument: function(instrumentId) {


    this.instrumentId = instrumentId;

    var instrument = this.music.instruments.getInstrument(this.instrumentId);
    this.instrumentSave = $.extend(true, {}, instrument);

    var data = instrument.data;

    $('#instrumentName').val(instrument.name);

    this.setInstrumentType(instrument.type);
    if(instrument.type == 'basic') {
      $('#editInstrumentType_basic').prop('checked', true);

      // basic values

      var effect = instrument.basicEffect;
      if(typeof effect == 'undefined') {
        effect = 'none';
      }

      $('input[name="editInstrumentBasicEffect"][value="' + effect + '"]').prop('checked', true);

      if(instrument.basicWaveform & 0x10) {
        $('#editInstrumentWaveform_triangle').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_triangle').prop('checked', false);
      }

      if(instrument.basicWaveform & 0x20) {
        $('#editInstrumentWaveform_sawtooth').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_sawtooth').prop('checked', false);
      }

      if(instrument.basicWaveform & 0x40) {
        $('#editInstrumentWaveform_pulse').prop('checked', true);
        $('#pulseControls').show();
      } else {
        $('#editInstrumentWaveform_pulse').prop('checked', false);
        $('#pulseControls').hide();
      }

      if(instrument.basicWaveform & 0x80) {
        $('#editInstrumentWaveform_noise').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_noise').prop('checked', false);
      }


      this.setBasicEffectVisibility();

      if(!instrument.pulseWidth) {
        instrument.pulseWidth = 50;
      }
      $('#editInstrumentPMWidth').val(instrument.pulseWidth);
      $('#editInstrumentPMSpeed').val(instrument.pulseModulationSpeed);
      $('#editInstrumentPMDepth').val(instrument.pulseModulationDepth);

      var arpeggioSpeed = instrument.arpeggioSpeed;
      if(typeof arpeggioSpeed == 'undefined' || arpeggioSpeed < 1 ) {
        arpeggioSpeed = 3;
      }

      $('#editInstrumentArpeggioSpeed').val(arpeggioSpeed);
      if(!instrument.arpeggioType) {
        instrument.arpeggioType = 'none';
      }


/*
      $('input:radio[name=editInstrumentArpeggioType][value=' + instrument.arpeggioType + ']').prop('checked', true);

      if(instrument.arpeggioDirection) {
        $('input:radio[name=editInstrumentArpeggioDir][value=' + instrument.arpeggioDirection + ']').prop('checked', true);
      }

      if(instrument.arpeggioType == 'custom') {
        $('#editInstrumentArpeggioCustom').show();

        var steps = instrument.arpeggioValues.length;
        $('#editInstrumentArpeggioCustomSteps').val(steps);
        this.setArpeggioSteps(steps);
        for(var i = 0; i < steps; i++) {
          $('#editInstrumentArpeggioStep' + i).val(instrument.arpeggioValues[i]);        
        }
      } else {
        $('#editInstrumentArpeggioCustom').hide();

      }
*/

      if(typeof instrument.tremoloOn == 'undefined') {
        instrument.tremoloOn = 6;
      }
      if(typeof instrument.tremoloOff == 'undefined') {
        instrument.tremoloOff = 6;
      }
      $('#editInstrumentTremoloOnSpeed').val(instrument.tremoloOn);
      $('#editInstrumentTremoloOffSpeed').val(instrument.tremoloOff);



    }


    if(instrument.type == 'advanced') {
      $('#editInstrumentType_advanced').prop('checked', true);
    }


    if(instrument.type == 'drum') {
      $('#editInstrumentType_drum').prop('checked', true);
      $('#editInstrumentDrumType_' + instrument.drumType).prop('checked', true);
      if(instrument.drumWaveform & 0x10) {
        $('#editInstrumentDrumWaveform_triangle').prop('checked', true);
      } else {
        $('#editInstrumentDrumWaveform_triangle').prop('checked', false);
      }

      if(instrument.drumWaveform & 0x20) {
        $('#editInstrumentDrumWaveform_sawtooth').prop('checked', true);
      } else {
        $('#editInstrumentDrumWaveform_sawtooth').prop('checked', false);        
      }

      if(instrument.drumWaveform & 0x40) {
        $('#editInstrumentDrumWaveform_pulse').prop('checked', true);
      } else {
        $('#editInstrumentDrumWaveform_pulse').prop('checked', false);        
      }


    }

    $('.instrumentCheckbox').prop('checked', false);


    $('#editInstrumentAttack').val(instrument.attack);
    $('#editInstrumentDecay').val(instrument.decay);
    $('#editInstrumentSustain').val(instrument.sustain);
    $('#editInstrumentRelease').val(instrument.release);

    if(instrument.vibratoSpeed == 0) {
      $('input[name="vibrato"][value="off"]').prop('checked', true);
      $('#vibratoControls').hide();


    } else {
      $('input[name="vibrato"][value="on"]').prop('checked', true);
      $('#vibratoControls').show();

      $('#editInstrumentVibratoSpeed').val(instrument.vibratoSpeed);
      $('#editInstrumentVibratoDepth').val(instrument.vibratoDepth);
      $('#editInstrumentVibratoDelay').val(instrument.vibratoDelay);
    }



    this.wavetable = [];
    for(var i = 0; i < instrument.wavetable.length; i++) {
      this.wavetable.push( [instrument.wavetable[i][0], instrument.wavetable[i][1]] ); 
    }

    // fill in basic values
    if(this.wavetable.length > 0) {
      var left = this.wavetable[0][0];
      var right = this.wavetable[0][1];

      if(left & 0x10) {
        $('#editInstrumentWaveform_triangle').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_triangle').prop('checked', false);        
      }

      if(left & 0x20) {
        $('#editInstrumentWaveform_sawtooth').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_sawtooth').prop('checked', false);        
      }

      if(left & 0x40) {
        $('#editInstrumentWaveform_pulse').prop('checked', true);
        $('#pulseControls').show();
      } else {
        $('#editInstrumentWaveform_pulse').prop('checked', false);        
        $('#pulseControls').hide();
      }

      if(left & 0x80) {
        $('#editInstrumentWaveform_noise').prop('checked', true);
      } else {
        $('#editInstrumentWaveform_noise').prop('checked', false);        
      }


    }

    // write advanced values
    this.wavetableHTML();


    this.pulsetable = [];
    for(var i = 0; i < instrument.pulsetable.length; i++) {
      this.pulsetable.push( [instrument.pulsetable[i][0], instrument.pulsetable[i][1]] );
    }

    this.pulsetableHTML();


    this.speedtable = [];
    for(var i = 0; i < instrument.speedtable.length; i++) {
      this.speedtable.push( [instrument.speedtable[i][0], instrument.speedtable[i][1]] ); 
    }


    this.filtertable = [];
    for(var i = 0; i < instrument.filtertable.length; i++) {
      this.filtertable.push([instrument.filtertable[i][0], instrument.filtertable[i][1]]);
    }

    this.filtertableHTML();
  },

  setInstrumentData: function() {

    if(this.instrumentId == -1) {
      this.instrumentId = this.music.instruments.createInstrument({ name: $('#instrumentName').val(), wavetable: [], pulsetable: [], filtertable: [], speedtable: [], gateTimer: 0x2, firstWave: 0x9 });      
      this.music.instruments.updateInstruments();
      this.music.instruments.selectInstrument(this.instrumentId, false);
    }

    var id = this.music.instruments.currentInstrumentId;
    var instrument = this.music.instruments.getInstrument(id);

    instrument.name = $('#instrumentName').val();

    instrument.type = $('input:radio[name=editInstrumentType]:checked').val();

    instrument.attack = parseInt($('#editInstrumentAttack').val());
    instrument.decay = parseInt($('#editInstrumentDecay').val());
    instrument.sustain = parseInt($('#editInstrumentSustain').val());
    instrument.release = parseInt($('#editInstrumentRelease').val());

    var vibrato = $('input[name="vibrato"]:checked').val();

    if(vibrato == 'on') {
      instrument.vibratoSpeed = parseInt($('#editInstrumentVibratoSpeed').val());
      instrument.vibratoDepth = parseInt($('#editInstrumentVibratoDepth').val());
      instrument.vibratoDelay = parseInt($('#editInstrumentVibratoDelay').val());
  
      if(!instrument.vibratoDepth || !instrument.vibratoSpeed) {    
        instrument.vibratoDelay = 0;
      }
    } else {
      instrument.vibratoSpeed = 0;
      instrument.vibratoDepth = 0;
      instrument.vibratoDelay = 0;
    }

//    instrument.waveform = '';

    if(instrument.type == 'basic') {
      instrument.basicWaveform = 0;
      if($('#editInstrumentWaveform_triangle').is(':checked')) {
        instrument.basicWaveform |= 0x10;
      } 
      if($('#editInstrumentWaveform_sawtooth').is(':checked')) {
        instrument.basicWaveform |= 0x20;
      } 
      if($('#editInstrumentWaveform_pulse').is(':checked')) {
        instrument.basicWaveform |= 0x40;
      } 
      if($('#editInstrumentWaveform_noise').is(':checked')) {
        instrument.basicWaveform |= 0x80;
      } 

      instrument.pulseWidth = parseInt($('#editInstrumentPMWidth').val());
      instrument.pulseModulationSpeed = parseInt($('#editInstrumentPMSpeed').val());
      instrument.pulseModulationDepth = parseInt($('#editInstrumentPMDepth').val());

      instrument.basicEffect = $('input[name=editInstrumentBasicEffect]:checked').val();
      instrument.arpeggioSpeed = parseInt($('#editInstrumentArpeggioSpeed').val());
//      instrument.arpeggioType = $('input:radio[name=editInstrumentArpeggioType]:checked').val();
//      instrument.arpeggioDirection = $('input:radio[name=editInstrumentArpeggioDir]:checked').val();

      instrument.arpeggioMode = $('input[name=editInstrumentArpeggioMode]:checked').val();
      instrument.arpeggioSteps = parseInt($('input[name=editInstrumentArpeggioMode]:checked').val());
      

      if(instrument.basicEffect == 'arpeggio' && instrument.arpeggioType == 'custom') {
        instrument.arpeggioValues = [];
        for(var i = 0; i < this.arpeggioSteps; i++) {
          var offset = $('#editInstrumentArpeggioStep' + i).val();
          if(typeof offset == 'undefined' || offset == '') {
            offset = 0;
          }
          instrument.arpeggioValues.push(offset);
        }
      }

      instrument.tremoloOn = parseInt($('#editInstrumentTremoloOnSpeed').val());
      instrument.tremoloOff = parseInt($('#editInstrumentTremoloOffSpeed').val());

      for(var key in instrument) {
        if(instrument.hasOwnProperty(key)) {
          if(isNaN(instrument[key])) {
//            instrument[key] = 0;
          }
        }
      }
    }

    if(instrument.type == 'drum') {
      instrument.drumType = $('input:radio[name=editInstrumentDrumType]:checked').val();      
      instrument.drumWaveform = 0;
      if($('#editInstrumentDrumWaveform_triangle').is(':checked')) {
        instrument.drumWaveform |= 0x10;
      } 
      if($('#editInstrumentDrumWaveform_sawtooth').is(':checked')) {
        instrument.drumWaveform |= 0x20;
      } 
      if($('#editInstrumentDrumWaveform_pulse').is(':checked')) {
        instrument.drumWaveform |= 0x40;
      } 
    }


    instrument.speedtable = [];

    this.writeWaveTable();

    instrument.wavetable = [];
    for(var i = 0; i < this.wavetable.length; i++) {
      instrument.wavetable[i] = [this.wavetable[i][0], this.wavetable[i][1]];
    }

    this.writePulsetable();
    instrument.pulsetable = [];
    for(var i = 0; i < this.pulsetable.length; i++) {
      instrument.pulsetable[i] = [this.pulsetable[i][0], this.pulsetable[i][1]];
    }

    this.writeFiltertable();
    instrument.filtertable = [];
    for(var i = 0; i < this.filtertable.length; i++) {
      instrument.filtertable[i] = [this.filtertable[i][0], this.filtertable[i][1]];
    }

    for(var i = 0; i < this.speedtable.length; i++) {
      instrument.speedtable[i] = [this.speedtable[i][0], this.speedtable[i][1]];
    }


    $('#instrumentName' + id).html($('#instrumentName').val());
  },

  editInstrumentPlay: function(octave, note) {
    if(this.playingInstrument && this.playingNote == note) {
      return;
    }
    this.playingInstrument = true;
    this.playingNote = note;

    var instrument = {};
    instrument.attack = parseInt($('#editInstrumentAttack').val());
    instrument.decay = parseInt($('#editInstrumentDecay').val());
    instrument.sustain = parseInt($('#editInstrumentSustain').val());
    instrument.release = parseInt($('#editInstrumentRelease').val());

    var vibrato = $('input[name="vibrato"]:checked').val();

    if(vibrato == 'on') {
   
      instrument.vibratoSpeed = parseInt($('#editInstrumentVibratoSpeed').val());
      instrument.vibratoDepth = parseInt($('#editInstrumentVibratoDepth').val());
      instrument.vibratoDelay = parseInt($('#editInstrumentVibratoDelay').val());
      if(!instrument.vibratoDepth || !instrument.vibratoSpeed) {
        instrument.vibratoDelay = 0;
      }

    } else {
      instrument.vibratoSpeed = 0;
      instrument.vibratoDepth = 0;
      instrument.vibratoDelay = 0;
    }
    instrument.speedtable = [];

    instrument.gateTimer = 0x2;
    instrument.firstWave = 0x9;

    this.writeWaveTable();
    instrument.wavetable = [];
    for(var i = 0; i < this.wavetable.length; i++) {
      instrument.wavetable[i] = [this.wavetable[i][0], this.wavetable[i][1]];
    }

//    this.logTable('wavetable', instrument.wavetable);

    this.writePulsetable();
    instrument.pulsetable = [];
    for(var i = 0; i < this.pulsetable.length; i++) {
      instrument.pulsetable[i] = [this.pulsetable[i][0], this.pulsetable[i][1]];
    }

    this.writeFiltertable();
    instrument.filtertable = [];
    for(var i = 0; i < this.filtertable.length; i++) {
      instrument.filtertable[i] = [this.filtertable[i][0], this.filtertable[i][1]];
    }

    for(var i = 0; i < this.speedtable.length; i++) {
      instrument.speedtable[i] = [this.speedtable[i][0], this.speedtable[i][1]];
    }

    var pitch = octave * 12 + note;// this.keyboardOctave * 12 + this.keyboardNote;

    var duration = 8;


    duration = false;

    this.music.musicPlayer2.playTestInstrument(pitch, instrument);

    this.keyboard.keyboardOctave = octave;
    this.keyboard.keyboardNote = note;

    this.keyboard.drawKeyboard();
    this.keyboard.playingInstrument = true;
  },

  logTable: function(tablename, table) {
    console.log('table: ' + tablename);
    for(var i = 0; i < table.length; i++) {
      var pos = i + 1;
      pos = pos.toString(16);
      var left = table[i][0].toString(16);
      var right = table[i][1].toString(16);

      console.log(pos + ':' + left + ',' + right);
    }

  }


}
