var EditSidFilter = function() {
  this.music = null;

  this.filterId = 0;
  this.filtertable = [];  
  this.filterType = 'basic';
}

EditSidFilter.prototype = {


  init: function(music) {
    this.music = music;

  },


  buildInterface: function(parentPanel) {
    var editInstrument = this;
    this.uiComponent = UI.create("UI.HTMLPanel");
    parentPanel.add(this.uiComponent);

    UI.on('ready', function() {
      editInstrument.uiComponent.load('html/music/sid/editFilter.html', function() {
        editInstrument.initContent();
        editInstrument.initEvents();
      });
    });
  },
  initContent: function() {

    this.keyboard = new KeyboardCanvas();
    this.keyboard.init('editFilterKeyboard');

  },

  initEvents: function() {

    var editFilter = this;


    this.keyboard.on('keydown', function(octave, note) {
      editFilter.testFilterOn(octave, note);
    });

    this.keyboard.on('keyup', function() {
      editFilter.testFilterOff();
    });

    $('#editFilterOK').on('click', function() {
      editFilter.setFilterData();
      editFilter.music.setView('edit');
    });

    $('#editFilterApply').on('click', function() {
      editFilter.setFilterData();
    });

    $('#editFilterCancel').on('click', function() {
      editFilter.music.setView('edit');
    });

    $('input[name=editFilterType]').on('click', function() {
      var value = $('input[name=editFilterType]:checked').val();

      editFilter.setFilterType(value);
    });

  },

  testFilterOn: function(octave, note) {

    this.writeFiltertable();
    var filter = { 'filtertable': this.filtertable };
    var pitch = octave * 12 + note;
//    this.music.musicPlayer.testInstrumentStart(pitch, false, this.music.instruments.currentInstrument, 0, filter);
  },

  testFilterOff: function() {
  //  this.music.musicPlayer.testInstrumentStop();

  },
  newFilter: function() {
    this.filterId = -1;
    this.filtertable = [[0xff, 0x00]];

    $('#filterName').val("New Filter");

    this.filtertableHTML();

  },

  editFilter: function(filterId) {

    this.filterId = filterId;
    var filter = this.music.doc.data.filters[filterId];


    if(typeof filter.type == 'undefined' || filter.type == 'advanced') {
      this.setFilterType('advanced');
      this.filtertable = [];
      for(var i = 0; i < filter.filtertable.length; i++) {
        this.filtertable.push( [filter.filtertable[i][0], filter.filtertable[i][1]] ); 
      }
    } else {

      this.setFilterType('basic');     

      /*
      var basicFilter = filter.basicFilter;
      if(typeof basicFilter == 'undefined') {
        basicFilter = 0xf7;
      } 
      */

      var cutoff = filter.basicCutoff;
      if(typeof cutoff == 'undefined') {
        cutoff = 0x40;
      }
      $('#filterBasicCutoff').val(cutoff);

      var filterType = filter.basicFilterType;

      if(typeof filterType == 'undefined') {
        filterType = 0x10;
      }

      $('#filterBasicType_low').prop('checked', filterType & 0x10);
      $('#filterBasicType_band').prop('checked', filterType & 0x20);
      $('#filterBasicType_high').prop('checked', filterType & 0x40);

      var resonance = filter.basicFilterResonance;
      if(typeof resonance == 'undefined') {
        resonance = 0xf;
      }
      $('#filterBasicResonance').val(resonance);

      var channels = filter.basicFilterChannels;
      if(typeof channels == 'undefined') {
        channels = 0x7;
      }
      $('#filterBasicAffects_channel1').prop('checked', channels & 0x1);
      $('#filterBasicAffects_channel2').prop('checked', channels & 0x2);
      $('#filterBasicAffects_channel3').prop('checked', channels & 0x4);


      $('input[name=filterBasicModulateType][value=' + filter.basicModulationDirection + ']').prop('checked', true);
      $('#filterBasicModulateTicks').val(filter.basicModulationTime);
      $('#filterBasicModulateAmount').val(filter.basicModulationSpeed);
      if(filter.basicModulationRepeat  == 1) {
        $('#filterBasicModulateRepeat').prop('checked', true);
      } else {
        $('#filterBasicModulateRepeat').prop('checked', false);        
      }

      this.writeFiltertable();
    }

    $('#filterName').val(filter.name);

    this.filtertableHTML();
//    var data = .data;
  },

  setFilterType: function(type) {
    if(type == 'basic') {
      $('#editFilterBasic').show();
      $('#editFilterAdvanced').hide();
      $('#editFilterType_basic').prop('checked', true);
    } else {
      this.writeFiltertable();
      this.filtertableHTML();
      $('#editFilterBasic').hide();
      $('#editFilterAdvanced').show();
      $('#editFilterType_advanced').prop('checked', true);
    }
    this.filterType = type;
  },

  setFilterData: function() {

    if(this.filterId == -1) {
      this.music.doc.data.filters.push({ "name": $('#filterName').val(), "filtertable": [] });

      this.filterId = this.music.doc.data.filters.length - 1;
      this.music.filters.updateFilters();
      this.music.filters.selectFilter(this.filterId);
    }
    var filter = this.music.doc.data.filters[this.filterId];

    filter.name = $('#filterName').val();
    filter.type = 'advanced';

    this.writeFiltertable();
    filter.filtertable = [];
    for(var i = 0; i < this.filtertable.length; i++) {
      filter.filtertable.push([this.filtertable[i][0], this.filtertable[i][1]]);
    }


    if(this.filterType == 'basic') {
      filter.type = 'basic';
      var channels = 0;
      var filterType = 0;


      if($('#filterBasicAffects_channel1').is(':checked')) {
        channels |= 1;
      }
      if($('#filterBasicAffects_channel2').is(':checked')) {
        channels |= 2;        
      }
      if($('#filterBasicAffects_channel3').is(':checked')) {
        channels |= 4;          
      }


      if($('#filterBasicType_low').is(':checked')) {
        filterType = filterType | 0x10;
      }
      if($('#filterBasicType_band').is(':checked')) {
        filterType = filterType | 0x20;
      }
      if($('#filterBasicType_high').is(':checked')) {
        filterType = filterType | 0x40;
      }


      filter.basicFilterType = filterType;
      filter.basicFilterResonance = $('#filterBasicResonance').val();
      filter.basicFilterChannels = channels;
      filter.basicCutoff = $('#filterBasicCutoff').val();
      filter.basicModulationDirection = $('input[name=filterBasicModulateType]:checked').val();
      filter.basicModulationTime = parseInt($('#filterBasicModulateTicks').val());
      filter.basicModulationSpeed = parseInt($('#filterBasicModulateAmount').val());
      if($('#filterBasicModulateRepeat').is(':checked')) {
        filter.basicModulationRepeat = 1;
      } else {
        filter.basicModulationRepeat = 0;        
      }

    }
    $('#filterName' + this.filterId).html(filter.name);


  },

  filtertableHTML: function() {
    var html = '';//wavetable';

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
    html += '<tr>';
    html += '<th>loop to</th>';
    html += '<th>type</th>';
    html += '<th>filter</th>';
    html += '<th>pitch</th>';
    html += '</tr>';

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
        html += '<input id="row' + i + '_filtercutoff" class="number" min="0" max="255" size="4" value="' + cutoff + '"> (0-255)';
        html += '</span>';

        html += '<span id="row' + i + '_filtermodulateParams" ';
        if(left < 1 || left >0x7f) {
          html += 'style="display:none" ';
        }

        html += '>';
        var time = left;
        html += '<label>Modulate For:</label>';
        html += '<input id="row' + i + '_filtertime" class="number" min="0" max="127" size="4" value="' + time + '"> Ticks(0-127)';

        var speed = right;
        if(speed > 127) {
          speed = speed - 256;
        }

        if(speed > 127) {
          speed = 127;
        }

        html += '&nbsp;&nbsp;';
        html += '<label>Amount :</label>';
        html += '<input id="row' + i + '_filterspeed" size="4" class="number" min="-127" max="127" value="' + speed + '"> per Tick(-127 - 127)' ;

        html += '</span>';


        html += '<span id="row' + i + '_filterParams" ';
        if(left <= 0x7f) {
          html += ' style="display:none" ';
        }

        html += '>';

        


        html += '<label><input type="checkbox" id="row' + i + '_filtertypelow" value="low" ';
        if(left & 0x10) {
          html += ' checked="checked" ';
        }
        html += '> Lowpass</label>';

        html += '<label><input type="checkbox" id="row' + i + '_filtertypeband" value="band" ';
        if(left & 0x20) {
          html += ' checked="checked" ';
        }
        html += '> Bandpass</label>';
        html += '<label><input type="checkbox" id="row' + i + '_filtertypehigh" value="high" ';
        if(left & 0x40) {
          html += ' checked="checked" ';
        }
        html += '> Highpass</label>';


        var resonance = (right & 0xf0) >> 4;
        var channel = right & 0xf;
        html += '<label>Resonance :</label>';
        html += '<input id="row' + i + '_resonance" class="number" min="0" max="15" size="4" value="' + resonance + '"> (0-15)';

        html += '<label><input type="checkbox" id="row' + i + '_channel1" ';
        if(channel & 0x1) {
          html += ' checked="checked" ';
        }
        html += '> Channel 1</label>&nbsp;';

        html += '<label><input type="checkbox" id="row' + i + '_channel2" ';
        if(channel & 0x2) {
          html += ' checked="checked" ';
        }
        html += '> Channel 2</label>&nbsp;';


        html += '<label><input type="checkbox" id="row' + i + '_channel3" ';
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
    html += '</table>';
    $('#editFiltertable').html(html);
    $('#editInstrumentFiltertable').html('');

    this.setupFiltertableEvents();

    UI.number.initControls('#editFiltertable .number');


  },

  setupFiltertableEvents: function() {
    var editFilter = this;

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
    });


    $('.filtertableAdd').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));
      

      editFilter.writeFiltertable();
      if(editFilter.filtertable.length == 0) {
        editFilter.filtertable.push([0x90, 0xf7]);
        editFilter.filtertable.push([0xff, 0x00]);
      } else if(editFilter.filtertable.length == 1) {
        editFilter.filtertable.splice(rowIndex + 1, 0, [0x90, 0xf7]);
      } else {

        editFilter.filtertable.splice(rowIndex + 1, 0, [0x00, 0x00]);
      }
      editFilter.filtertableHTML();    
    });

    $('.filtertableDelete').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(3));

      editFilter.writeFiltertable();
      editFilter.filtertable.splice(rowIndex , 1);
      editFilter.filtertableHTML();    
    });

  },

  writeFiltertable: function() {
    if(this.filterType == 'basic') {
      this.filtertable = [];
      var left = 0;
      var right = 0;
      // first add row to set the filter type
      left = 0x80;
      if($('#filterBasicType_low').is(':checked')) {
        left = left | 0x10;
      }
      if($('#filterBasicType_band').is(':checked')) {
        left = left | 0x20;
      }
      if($('#filterBasicType_high').is(':checked')) {
        left = left | 0x40;
      }
      var resonance = parseInt($('#filterBasicResonance').val());
      var channel = 0;

      if($('#filterBasicAffects_channel1').is(':checked')) {
        channel |= 1;

      }
      if($('#filterBasicAffects_channel2').is(':checked')) {
        channel |= 2;
        
      }
      if($('#filterBasicAffects_channel3').is(':checked')) {
        channel |= 4;          
      }


      right = (resonance << 4) | channel;

      this.filtertable.push([parseInt(left), parseInt(right)]);      

      // set the cutoff      

      left = 0;
      right = parseInt($('#filterBasicCutoff').val());
      this.filtertable.push([parseInt(left), parseInt(right)]);      

      // set modulation
      var modulationType = $('input[name=filterBasicModulateType]:checked').val();
      var modulationTime = $('#filterBasicModulateTicks').val();
      var modulationAmount = $('#filterBasicModulateAmount').val();
      var modulationRepeat = $('#filterBasicModulateRepeat').is(':checked');

      if(modulationType == 'up') {
        left = modulationTime;
        right = modulationAmount;
        this.filtertable.push([parseInt(left), parseInt(right)]);      

        left = 0xff;
        if(modulationRepeat) {
          right = 0x03;
        } else {
          right = 0x00;
        }
        this.filtertable.push([parseInt(left), parseInt(right)]);      

      } else if(modulationType == 'down') {
        left = modulationTime;
        right = (-modulationAmount) + 256;
        this.filtertable.push([parseInt(left), parseInt(right)]);      

        left = 0xff;
        if(modulationRepeat) {
          right = 0x03;
        } else {
          right = 0x00;
        }
        this.filtertable.push([parseInt(left), parseInt(right)]);      


      } else if(modulationType == 'updown') {
        left = modulationTime;
        right = modulationAmount;
        this.filtertable.push([parseInt(left), parseInt(right)]);      

        left = modulationTime;
        right = (-modulationAmount) + 256;
        this.filtertable.push([parseInt(left), parseInt(right)]);      

        left = 0xff;
        if(modulationRepeat) {
          right = 0x03;
        } else {
          right = 0x00;
        }
        this.filtertable.push([parseInt(left), parseInt(right)]);      


      } else {
        var filtertableLoop = 0;
        this.filtertable.push([0xff, filtertableLoop]);
      }

    } else {
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

      var filtertableLoop = parseInt($('input[name=filtertableLoop]:checked').val());
      if(filtertableLoop == this.filtertable.length ) {
        filtertableLoop = 0;
      } else { 
        filtertableLoop += 1;
      }
      this.filtertable.push([0xff, filtertableLoop]);
    }

    this.logTable('filter', this.filtertable);
  },

  mouseDown: function(button, x, y) {
    this.keyboard.mouseDown(x, y);
  },

  mouseUp: function(button, x, y) {
    this.keyboard.mouseUp(x, y);
  },

  mouseMove: function(x, y, deltaX, deltaY) {
    this.keyboard.mouseToKeyboard(x, y);
    
  },

  logTable: function(tablename, table) {
    console.log('table: ' + tablename);
    for(var i = 0; i < table.length; i++) {
      var pos = i + 1;
      pos = pos.toString(16);
      var left = table[i][0].toString(16);
      var right = table[i][1].toString(16);

      console.log(pos + ':0x' + left + ',0x' + right);
    }

  }



}