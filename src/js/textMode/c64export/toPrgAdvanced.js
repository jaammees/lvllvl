var ToPRGAdv = function() {
  this.editor = null;  

  this.effects = [
  
    { 
      "name": "Background Flash", 
      "data": ";data \nbgEffectCounter\n!byte 00\nbgEffectColor \n!byte $0,$0,$b,$b,$c,$c,$f,$f,$1,$1,$f,$c,$b",
      "init": ";init\n;this code is executed once on startup\n", 
      "trigger": ";on trigger\n;this code is executed when the effect is triggered\n  lda #$0d\n  sta bgEffectCounter\n",
      "tick": "\n;on tick\n;this code is executed on every tick\n\n  lda bgEffectCounter\n  cmp #00\n  beq bgEffectDone\n    \n  ldy bgEffectCounter\n  lda bgEffectColor,y\n\n  sta $d021\n\n  dey\n  sty bgEffectCounter\n\nbgEffectDone"
    },
  
    {
      "name": "Jitter",
      "data": ";data \neffectJitterCounter\n!byte 00\neffectJitterAmount\n!byte $7,$0,$3,$6,$2,$7,$4",
      "init": ";init\n;this code is executed once on startup\n",
      "trigger": ";on trigger\n;this code is executed when the effect is triggered\n  lda #$06\n  sta effectJitterCounter\n    \n  lda #$07\n  ora $d016\n",
      "tick": ";on tick\n;this code is executed on every tick\n\n  lda effectJitterCounter\n  cmp #00\n  beq effectJitterDone\n  \n  lda $d016                                    ; $d016 is a VIC-II control register which contains the horizontal scroll value\n  and #$F8           \n  sta temp      \n      \n  ldy effectJitterCounter\n  lda effectJitterAmount,y\n  \n  ora temp\n  sta $d016\n\n  dey\n  sty effectJitterCounter\n\neffectJitterDone"
    }

  ];
  this.entries = [];

  this.keyTriggers = [];
  this.instrTriggers = [];

  this.mostUsedCharacters = [];

  this.extendedColorCharsetData = [];
  this.charsetMap = [];
  this.extendedColorBGColors = [];

  this.keymap = {
    'a': 0x21,
    'b': 0x43,
    'c': 0x42,
    'd': 0x22,
    'e': 0x61,
    'f': 0x52,
    'g': 0x23,
    'h': 0x53,
    'i': 0x14,
    'j': 0x24,
    'k': 0x54,
    'l': 0x25,
    'm': 0x44,
    'n': 0x74,
    'o': 0x64,
    'p': 0x15,
    'q': 0x67,
    'r': 0x12,
    's': 0x51,
    't': 0x62,
    'u': 0x63,
    'v': 0x73,
    'w': 0x11,
    'x': 0x72,
    'y': 0x13,
    'z': 0x41,
    '0': 0x34,
    '1': 0x07,
    '2': 0x37,
    '3': 0x01,
    '4': 0x31,
    '5': 0x02,
    '6': 0x32,
    '7': 0x03,
    '8': 0x33,
    '9': 0x04,
    '-': 0x35,
    '=': 0x05
  },

  this.colorSchemes = {
    'vice': [0x000000,0xffffff,0x68372B,0x70A4B2,0x6F3D86,0x588D43,0x352879,0xB8C76F,0x6F4F25,0x433900,0x9A6759,0x444444,0x6C6C6C,0x9AD284,0x6C5EB5,0x959595],
    'ccs64': [0x191D19,0xFCF9FC,0x933A4C,0xB6FAFA,0xD27DED,0x6ACF6F,0x4F44D8,0xFBFB8B,0xD89C5B,0x7F5307,0xEF839F,0x575753,0xA3A7A7,0xB7FBBF,0xA397FF,0xEFE9E7]
    /*
    'c64hq': ['0a0a0a','fff8ff','851f02','65cda8','a73b9f','4dab19','1a0c92','ebe353','a94b02','441e00','d28074','464646','8b8b8b','8ef68e','4d91d1','bababa'],
    'pc64': ['212121','ffffff','b52121','73ffff','b521b5','21b521','2121b5','ffff21','b57321','944221','ff7373','737373','949494','73ff73','7373ff','b5b5b5'],
    'c64s': ['000000','fcfcfc','a80000','54fcfc','a800a8','00a800','0000a8','fcfc00','a85400','802c00','fc5454','545454','808080','54fc54','5454fc','a8a8a8']
    */
  };


  this.c64Asm = null;

}

ToPRGAdv.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.c64Asm = new C64ASM();
    this.c64Asm.init(this.editor);

    var _this = this;
    $('#exportPRGAdvCancel').on('click', function() {
      $('#exportPRGAdvTools').hide();
      _this.editor.setLayoutType(_this.editor.saveLayout);
    });

    $('#exportPRGAdvOK').on('click', function() {
      var mode = $('input[name=prgAdvMode]:checked').val();
      var filename = "c64.prg";
      var music = $('input[name=prgAdvMusic]:checked').val() == 'include';
      if(music) {
        music = 'yes';
      } else {
        music = 'no';
      }
      var layers = $('input[name=exportPRGAdvLayer]:checked').val();
      var scrollV = $('#exportPRGAdvScrollV').is(':checked');

      _this.createPRG({ "mode": mode, "filename": filename, "music": music, "layers": layers, "scrollV": scrollV });
    });

    $('#exportPRGAdvMonochromeColor').on('click', function(event) {
      _this.editor.colorPickerPopupMenu.createColorPicker(function(color) {

        _this.monochromeColor = color;
        var color = _this.editor.petscii.getColor(_this.monochromeColor);
        var colorHex = Number(color).toString(16);
        while (colorHex.length < 6) {
          colorHex = "0" + colorHex;
        }
        $('#exportPRGAdvMonochromeColor').css('background-color', '#' + colorHex);


      });

      editor.showPopupMenu('colorPickerPopupMenu', function(item) {
      });      

    });


    $('input[name=prgAdvMode]').on('click', function() {
      var mode = $('input[name=prgAdvMode]:checked').val();
      if(mode == 'monochrome') {
        $('#exportPRGAdvMonochromeColorRow').show();
      } else {
        $('#exportPRGAdvMonochromeColorRow').hide();
      }
    });

    this.entries = [];
    this.addRow();

    this.entries.push({ "type": "frameJump", "jumpTo": 1 });

    this.tableHTML();
    this.keyTriggersHTML();
    this.instrTriggersHTML();
  },

  editCode: function() {
    this.c64Asm.editCode();
  },

  start: function() {

    this.monochromeColor = this.editor.tools.currentColor;

    var color = this.editor.petscii.getColor(this.monochromeColor);
    var colorHex = Number(color).toString(16);
    while (colorHex.length < 6) {
      colorHex = "0" + colorHex;
    }
    $('#exportPRGAdvMonochromeColor').css('background-color', '#' + colorHex);


    this.tableHTML();
    this.keyTriggersHTML();
    this.instrTriggersHTML();

    $('#exportPRGAdvTools').show();

  },


  writeKeyTriggersTable: function() {
    var keyTriggers = this.keyTriggers;

    var rows = keyTriggers.length; 

    keyTriggers = [];

    for(var i = 0; i < rows; i++) {
      //var trigger = 'key';
      var triggerKey = $('#prgkeytrigger' + i + '_key').val();;
      var gotoRow = parseInt($('#prgkeytrigger' + i + '_goto').val());

      var charsetID = parseInt($('#prgkeytrigger' + i + '_charset').val());

      var action = $('#prgkeytrigger' + i + '_action').val();

      keyTriggers.push({"triggerKey": triggerKey, "action": action, "gotoRow": gotoRow, "charsetID": charsetID })

    }

    this.keyTriggers = keyTriggers;
  },


  keyTriggersHTML: function() {
    var keyTriggers = this.keyTriggers;

    var html = '';
    html += '<button id="prgAddKeyTriggerRow">Add Key Trigger</button>';
    html += '<table>';

    for(var i = 0; i < this.keyTriggers.length; i++) {
      html += '<tr>';

      html += '<td>';

      var triggerKey = keyTriggers[i].triggerKey;
      var action = keyTriggers[i].action;
      if(typeof action == 'undefined') {
        action = 'gotorow';
      }
      if(typeof triggerKey == 'undefined') {
        triggerKey = '';
      }
      html += '<label>Key: <input size="4" id="prgkeytrigger' + i + '_key" value="';
      html += triggerKey;
      html += '"></label>';
      html += '</td>';

      html += '<td>';
      html += '<select class="prgKeyTriggerAction" id="prgkeytrigger' + i + '_action">';
      html += '<option value="gotorow" ';
      if(action == 'gotorow') {
        html += ' selected="selected" ';
      }
      html += '>Goto Row</option>';


      html += '<option value="nextframe" ';
      if(action == 'nextframe') {
        html += ' selected="selected" ';
      }

      html += '>Goto Next Frame</option>';


      html += '<option value="changecharset" ';
      if(action == 'changecharset') {
        html += ' selected="selected" ';
      }

      html += '>Change Character Set</option>';

      for(var j = 0; j < this.effects.length; j++) {
        html += '<option value="' + j + '" ';
        if(parseInt(action) == j) {
          html += ' selected="selected" ';
        }
        html += '>' + this.effects[j].name + '</option>';

      }



      html += '</select>';
      html += '</td>'

      html += '<td>';
      var gotoRow = keyTriggers[i].gotoRow;
      if(typeof gotoRow == 'undefined') {
        gotoRow = 1;
      }

      html += '<span id="prgkeytrigger' + i + '_gotosection"';
      if(action != 'gotorow') {
        html += ' style="display:none" ';
      }
      html += '>';

      html += '<label>Goto Row: <input size="4" id="prgkeytrigger' + i + '_goto" value="';
      html += gotoRow;
      html += '"></label>';
      html += '</span>';



      var charsetID = keyTriggers[i].charsetID;
      if(typeof charsetID == 'undefined') {
        charsetID = 0;
      }

      html += '<span id="prgkeytrigger' + i + '_charsetsection"';
      if(action != 'changecharset') {
        html += ' style="display:none" ';
      }
      html += '>';
      html += '<select id="prgkeytrigger' + i + '_charset">';
      for(var j = 0; j < this.editor.tileSets.length; j++) {
        html += '<option value="' + j + '"';

        if(j == charsetID) {
          html += ' selected="selected" ';
        }

        html += '>' + this.editor.tileSets[j].name + '</option>';
      }
      html += '</select>';
      html += '</span>';

      html += '</td>';

      html += '<td>';
      html += '<button type="button" class="prgDeleteKeyTrigger" id="prgkeytrigger' + i + '_delete">Delete Trigger</button>';
      html += '</td>';

      html += '</tr>';


    }
    html += '</table>';

    $('#exportPRGAdvTriggers').html(html);

    this.setupKeyTriggerEvents();


  },

  setupKeyTriggerEvents: function() {
    var _this = this;

    $('#prgAddKeyTriggerRow').on('click', function() {
      _this.addKeyTrigger();
    });




    $('.prgKeyTriggerAction').on('change', function() {
      var id = $(this).attr('id');

      var pos = id.indexOf('_');
      var row = id.substr(0, pos);



      if($(this).val() == 'gotorow') {
        $('#' + row + '_gotosection').show();
      } else {
        $('#' + row + '_gotosection').hide();        
      }

      if($(this).val() == 'changecharset') {
        $('#' + row + '_charsetsection').show();
      } else {
        $('#' + row + '_charsetsection').hide();
      }

    });

    $('.prgDeleteKeyTrigger').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(13));

      _this.writeKeyTriggersTable();
      _this.keyTriggers.splice(rowIndex , 1);
      _this.keyTriggersHTML();    

    });

  },

  addKeyTrigger: function(rowIndex) {

    if(typeof rowIndex == 'undefined') {
      rowIndex = 0;
    }

    this.writeKeyTriggersTable();
    if(this.keyTriggers.length == 0) {
      this.keyTriggers.push({  "type": "gotorow", "gotoRow": 1 });
    } else {
      this.keyTriggers.splice(rowIndex , 0, { "type": "gotorow", "gotoRow": 1 });
    }

    this.keyTriggersHTML();    
  },



  // instrument triggers ----------------------------

  writeInstrTriggersTable: function() {
    var instrTriggers = this.instrTriggers;

    var rows = instrTriggers.length; 

    instrTriggers = [];

    for(var i = 0; i < rows; i++) {
      var triggerInstr = $('#prginstrtrigger' + i + '_instr').val();;
      var action = $('#prginstrtrigger' + i + '_action').val();

      var gotoRow = parseInt($('#prginstrtrigger' + i + '_goto').val());


      var charsetID = parseInt($('#prginstrtrigger' + i + '_charset').val());


      instrTriggers.push({"triggerInstr": triggerInstr, "action": action, "gotoRow": gotoRow, "charsetID": charsetID })

    }

    this.instrTriggers = instrTriggers;
  },


  instrTriggersHTML: function() {
    var instrTriggers = this.instrTriggers;

    var html = '';
    html += '<button id="prgAddInstrTriggerRow">Add Instrument Trigger (ch 1)</button>';
    html += '<table>';

    for(var i = 0; i < this.instrTriggers.length; i++) {
      html += '<tr>';

      html += '<td>';

      var triggerInstr = instrTriggers[i].triggerInstr;
      var action = instrTriggers[i].action;
      if(typeof action == 'undefined') {
        action = 'gotorow';
      }
      if(typeof triggerInstr == 'undefined') {
        triggerInstr = '';
      }
      html += '<label>Instrument:';

      html += '<select id="prginstrtrigger' + i + '_instr">';
      for(var j = 1; j < g_app.music.instruments.instruments.length; j++) {
        html += '<option value="' + j + '"';
        if( j == triggerInstr) {
          html += ' selected="selected" ';
        }

        html += '>';
        html += g_app.music.instruments.instruments[j].name;
        html += '</option>';
      }
      html += '</select>';

//      html += ' <input size="4" id="prginstrtrigger' + i + '_instr" value="';
//      html += triggerInstr;
//      html += '"></label>';
      html += '</td>';

      html += '<td>';
      html += '<select class="prgInstrTriggerAction" id="prginstrtrigger' + i + '_action">';
      html += '<option value="gotorow" ';
      if(action == 'gotorow') {
        html += ' selected="selected" ';
      }
      html += '>Goto Row</option>';


      html += '<option value="nextframe" ';
      if(action == 'nextframe') {
        html += ' selected="selected" ';
      }
      html += '>Goto Next Frame</option>';



      html += '<option value="changecharset" ';
      if(action == 'changecharset') {
        html += ' selected="selected" ';
      }
      html += '>Change Character Set</option>';

      for(var j = 0; j < this.effects.length; j++) {
        html += '<option value="' + j + '" ';
        if(parseInt(action) == j) {
          html += ' selected="selected" ';
        }
        html += '>' + this.effects[j].name + '</option>';

      }


      html += '</select>';
      html += '</td>'


      html += '<td>';

      var gotoRow = instrTriggers[i].gotoRow;
      if(typeof gotoRow == 'undefined') {
        gotoRow = 1;
      }

      html += '<span id="prginstrtrigger' + i + '_gotosection"';
      if(action != 'gotorow') {
        html += ' style="display:none" ';
      }
      html += '>';
      html += '<label>Goto Row: <input size="4" id="prginstrtrigger' + i + '_goto" value="';
      html += gotoRow;
      html += '"></label>';

      html += '</span>';




      var charsetID = instrTriggers[i].charsetID;
      if(typeof charsetID == 'undefined') {
        charsetID = 0;
      }
      html += '<span id="prginstrtrigger' + i + '_charsetsection"';
      if(action != 'changecharset') {
        html += ' style="display:none" ';
      }
      html += '>';
      html += '<select id="prginstrtrigger' + i + '_charset">';
      for(var j = 0; j < this.editor.tileSets.length; j++) {
        html += '<option value="' + j + '"';

        if(j == charsetID) {
          html += ' selected="selected" ';
        }

        html += '>' + this.editor.tileSets[j].name + '</option>';
      }
      html += '</select>';
      html += '</span>';

      html += '</td>';

      html += '<td>';
      html += '<button type="button" class="prgDeleteInstrTrigger" id="prginstrtrigger' + i + '_delete">Delete Trigger</button>';
      html += '</td>';

      html += '</tr>';


    }
    html += '</table>';

    $('#exportPRGAdvInstrTriggers').html(html);

    this.setupInstrTriggerEvents();


  },

  setupInstrTriggerEvents: function() {
    var toPrgAdv = this;

    $('#prgAddInstrTriggerRow').on('click', function() {
      toPrgAdv.addInstrTrigger();
    });


    $('.prgInstrTriggerAction').on('change', function() {
      var id = $(this).attr('id');

      var pos = id.indexOf('_');
      var row = id.substr(0, pos);



      if($(this).val() == 'gotorow') {
        $('#' + row + '_gotosection').show();
      } else {
        $('#' + row + '_gotosection').hide();        
      }

      if($(this).val() == 'changecharset') {
        $('#' + row + '_charsetsection').show();
      } else {
        $('#' + row + '_charsetsection').hide();
      }


    });
    $('.prgDeleteInstrTrigger').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(13));

      toPrgAdv.writeInstrTriggersTable();
      toPrgAdv.instrTriggers.splice(rowIndex , 1);
      toPrgAdv.instrTriggersHTML();    

    });

  },

  addInstrTrigger: function(rowIndex) {

    if(typeof rowIndex == 'undefined') {
      rowIndex = 0;
    }

    this.writeInstrTriggersTable();
    if(this.instrTriggers.length == 0) {
      this.instrTriggers.push({  "type": "gotorow", "gotoRow": 1 });
    } else {
      this.instrTriggers.splice(rowIndex , 0, { "type": "gotorow", "gotoRow": 1 });
    }

    this.instrTriggersHTML();    
  },



  tableHTML: function() {

    var firstFrame = 1;
    var lastFrame = 1;

    if(this.editor.graphic) {
      lastFrame = this.editor.graphic.getFrameCount();
    }
    var instructions = 'Choose frames between <strong>1</strong> and <strong>' + lastFrame + '</strong>';
    $('#exportPRGFramesInstructions').html(instructions);

    var html = '';

    html += '<button id="prgAddRow">Add Row</button>';
    html += '<table>';

    for(var i = 0; i < this.entries.length; i++) {
      var row = i + 1;
      html += '<tr>';
      html += '<td>' + row + '</td>';
      html += '<td>';
      html += '<select class="prgrowtype" id="prgrow' + i + '_type">';
      html += '<option value="frame">Frame</option>';
      html += '<option value="frameRange"';
      if(this.entries[i].type == 'frameRange') {
        html += ' selected="selected" ';
      }
      html += '>Frame Range</option>';

      html += '<option value="frameJump"';
      if(this.entries[i].type == 'frameJump') {
        html += 'selected="selected" ';
      }
      html += '>Jump To</option>';

      html += '</select>';
      html += '</td>';

      var frame = 1;
      if(typeof this.entries[i].frame != 'undefined') {
        frame = this.entries[i].frame;
      }

      var duration = 12;
      if(typeof this.entries[i].duration != 'undefined') {
        duration = this.entries[i].duration;
      }

      var from = 1;
      if(typeof this.entries[i].from != 'undefined') {
        from = this.entries[i].from;
      }
      var to = 1;
      if(typeof this.entries[i].to != 'undefined') {
        to = this.entries[i].to;
      }

      var jumpTo = 1;
      if(typeof this.entries[i].jumpTo != 'undefined') {
        jumpTo = this.entries[i].jumpTo;
      }


      html += '<td>';
      html += '<span id="prgrow' + i + '_frameParams"';
      if(this.entries[i].type != 'frame') {
        html += ' style="display: none" ';
      }
      html += '>';

      html += '<label>Frame: <input size="3" value="';
      html += frame;
      html += '" id="prgrow' + i + '_frame"/></label>';

      html += '&nbsp;&nbsp;';
      html += '<label>Duration: <input size="3" value="';
      html += duration;
      html += '" id="prgrow' + i + '_duration"/> ticks</label>';


      html += '</span>';

      html += '<span id="prgrow' + i + '_frameRangeParams"';

      if(this.entries[i].type != 'frameRange') {
        html += ' style="display: none" ';
      }

      html += '>';

      html += 'From: <input size="3" value="' + from + '" id="prgrow' + i + '_from"/>';
      html += '&nbsp;To: <input size="3" value="' + to + '" id="prgrow' + i + '_to"/>';
      html += '</span>';



      html += '<span id="prgrow' + i + '_frameJumpParams"';
      if(this.entries[i].type != 'frameJump') {
        html += ' style="display: none" ';
      }
      html += '>';
      html += 'Row: <input size="3" value="' + jumpTo + '" id="prgrow' + i + '_jumpTo"/>';
      html += '</span>';

      html += '</td>';

      html += '<td>';

      html += '<button type="button" class="prgAddRow" id="prgrow' + i + '_add">Add Row</button>';
      html += '&nbsp;';
      html += '<button type="button" class="prgDeleteRow" id="prgrow' + i + '_delete">Delete Row</button>';

      html += '</td>';

      html += '</tr>';
    }

    html += '</table>';

    $('#exportPRGAdvTable').html(html);

    this.setupTableEvents();
  },

  setupTableEvents: function() {
    var toPrgAdv = this;

    $('#prgAddRow').on('click', function() {
      toPrgAdv.addRow();
    });

    $('.prgrowtype').on('change', function() {
      var id = $(this).attr('id');
      var value = $(this).val();
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);

      if(value == 'frame') {
        $('#' + row + '_frameParams').show();
        $('#' + row + '_frameRangeParams').hide();
        $('#' + row + '_frameJumpParams').hide();

      } else if(value == 'frameRange') {
        $('#' + row + '_frameParams').hide();
        $('#' + row + '_frameRangeParams').show();
        $('#' + row + '_frameJumpParams').hide();
      } else if(value == 'frameJump') {
        $('#' + row + '_frameParams').hide();
        $('#' + row + '_frameRangeParams').hide();
        $('#' + row + '_frameJumpParams').show();

      }
    });

    $('.prgAddRow').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(6)) + 1;

      toPrgAdv.addRow(rowIndex);
      

    });

    $('.prgDeleteRow').on('click', function() {
      var id = $(this).attr('id');
      var pos = id.indexOf('_');
      var row = id.substr(0, pos);
      var rowIndex = parseInt(id.substr(6));

      toPrgAdv.writeEntriesTable();
      toPrgAdv.entries.splice(rowIndex , 1);
      toPrgAdv.tableHTML();    

    });

  },

  writeEntriesTable: function() {
    var rows = this.entries.length; 

    this.entries = [];

    for(var i = 0; i < rows; i++) {
      var type = $('#prgrow' + i + '_type').val();
      if(type == 'frame') {
        var frame = parseInt($('#prgrow' + i + '_frame').val());
        var duration = parseInt($('#prgrow' + i + '_duration').val());
        this.entries.push({ "type": "frame", "frame": frame, "duration": duration });
      } else if(type == 'frameRange') {
        var from = parseInt($('#prgrow' + i + '_from').val());
        var to = parseInt($('#prgrow' + i + '_to').val());
        this.entries.push({ "type": "frameRange", "from": from, "to": to });

      } else if(type == 'frameJump') {
        var jumpTo = parseInt($('#prgrow' + i + '_jumpTo').val());

        this.entries.push({ "type": "frameJump", "jumpTo": jumpTo });
      }

    }
  },


  addRow: function(rowIndex) {

    if(typeof rowIndex == 'undefined') {
      rowIndex = 0;
    }
    this.writeEntriesTable();

    if(this.entries.length == 0) {
      this.entries.push({ "type": "frame", "frame": 1, "duration": 12 });
    } else {
      this.entries.splice(rowIndex , 0, { "type": "frame", "frame": 1, "duration": 12 });
    }

    this.tableHTML();    
  },



  getMostUsedCharacters: function(args, framesToExport) {


    var layer = this.editor.layers.getSelectedLayerObject();
    var tileSet = layer.getTileSet();
    var tileCount = tileSet.getTileCount();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      this.mostUsedCharacters = [];
      
      for(var i = 0; i < tileCount; i++) {
        this.mostUsedCharacters.push({ "c": i, "timesUsed": 0 });
      }
    } else {    

      this.mostUsedCharacters = [];
      for(var i = 0; i < tileCount; i++) {
        this.mostUsedCharacters.push({ "c": i, "timesUsed": 0 });
      }

      var z = 0;
      var gridWidth = args.gridWidth;
      var gridHeight = args.gridHeight;
      var frames = args.frames;

      for(var frameIndex = 0; frameIndex < framesToExport.length; frameIndex++) {
        var frame = framesToExport[frameIndex];

        for(var y = 0; y < gridHeight; y++) {
          for(var x = 0; x < gridWidth; x++) {
            var cellData = layer.getCell({ x: x, y: y, frame: frame});
  //          var c = frames[frame].frameData.data[0][gridHeight - 1 - y][x].t;
            var c = cellData.t;
            if(c < this.mostUsedCharacters.length) {
              this.mostUsedCharacters[c].timesUsed++;
            }
          }
        }      
      }

      this.mostUsedCharacters.sort(function(a, b) {
        return b.timesUsed - a.timesUsed;
      });
    }


  },


  getCharsetData: function(tileSet) {

    var tileCount = tileSet.getTileCount();

    this.charsetData = [];
    // should work out what characters are used..

    this.charsetMap = [];

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = 0;
    }

    for(var i = 0; i < tileCount; i++) {
      var c = i;//this.mostUsedCharacters[i].c;

      if(tileCount > tileCount) {
        c = this.mostUsedCharacters[i].c;
        this.charsetMap[c] = i;  
      } else {
        this.charsetMap[i] = i;
      }
      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
          if(x < charWidth && y < charHeight) {
            if(tileSet.getPixel(c, x, y)) {
              // set the bit
              b = b | (1 << (7-x));
            }
          }
        }
        this.charsetData.push(b);
      }
    }
  },


  getTallerCharsetData: function(tileSet, index, extendedColorMode) {
//    var tileSet = this.editor.tileSetManager.getTileSet(index);

    if(typeof extendedColorMode == 'undefined') {
      extendedColorMode = false;
    }

    this.charsetData = [];
    this.extendedColorCharsetData = [];


    this.charsetMap = [];
    // should work out what characters are used..

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    var tileCount = tileSet.getTileCount();

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = 0;
    }

    // each character is made of 2 characters, 128 is the limit
    var numberOfCharacters = 128;
    if(extendedColorMode) {
      numberOfCharacters = 32;
    }

    // write the top 8 rows of the characters
    for(var i = 0; i < numberOfCharacters; i++) {
      var c = this.mostUsedCharacters[i].c;
      this.charsetMap[c] = i;

      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
          if(x < charWidth && y < charHeight) {

            if(tileSet.getPixel(c, x, y)) {
              // set the bit
              b = b | (1 << (7-x));
            }
          }
        }
        if(extendedColorMode) {
          this.extendedColorCharsetData.push(b);
        } else {
          this.charsetData.push(b);
        }
      }
    }


    // write the bottom rows
    for(var i = 0; i < numberOfCharacters; i++) {
      var c = this.mostUsedCharacters[i].c;
      this.charsetMap[c] = i;

      for(var y = 8; y < 16; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
          if(x < charWidth && y < charHeight) {
            if(tileSet.getPixel(c, x, y)) {
              // set the bit
              b = b | (1 << (7-x));
            }
          }
        }

        if(extendedColorMode) {
          this.extendedColorCharsetData.push(b);
        } else {
          this.charsetData.push(b);
        }

      }
    }
  },



  getExtendedColorCharsetData: function(tileSet, index) {

    this.extendedColorCharsetData = [];
    this.charsetMap = [];

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = 0;
    }

    // extended color mode uses 64 chars
    for(var i = 0; i < 256; i++) {
      var c = this.mostUsedCharacters[i].c;
      this.charsetMap[c] = i;

      if(i < 64) {
        for(var y = 0; y < 8; y++) { 
          var b = 0;
          for(var x = 0; x < 8; x++) {
            if(x < charWidth && y < charHeight) {

              if(tileSet.getPixel(c, x, y)) {
                // set the bit
                b = b | (1 << (7-x));
              }
            }
          }
          this.extendedColorCharsetData.push(b);
        }
      }
    }
  },


  // get the 4 most used bg colors
  getExtendedColorBGColors: function(args, framesToExport) {
    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }
    this.extendedColorBGColors = [];

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      // is in ecm mode..
      var frame = framesToExport[0];
      for(var i = 0; i < 4; i++) {
        // times used doesn't matter
        this.extendedColorBGColors.push({ "color": layer.getC64ECMColor(i, frame), "timesUsed": 10 });
      }
    } else {
      var z = 0;
      
      var gridWidth = args.gridWidth;
      var gridHeight = args.gridHeight;
      var frames = args.frames;

      var bgColors = [];
      for(var i = 0; i < 16; i++) {
        bgColors[i] = { "color": i, "timesUsed": 0 };
      }

      for(var frameIndex = 0; frameIndex < framesToExport.length; frameIndex++) {
        var frame = framesToExport[frameIndex];

        for(var y = 0; y < gridHeight; y++) {
          for(var x = 0; x < gridWidth; x++) {
            var color = 0;
            var cellData = layer.getCell({ x: x, y: y, frame: frame});
            color = cellData.bc;//frames[frame].frameData.data[z][gridHeight - 1 - y][x].bc;

            color = this.getC64Color(color);

            if(typeof color != 'undefined' && color !== false) {
              bgColors[color].timesUsed++;
            } else {
              if(frames[frame].frameData.bgColor < 16) {
                bgColors[frames[frame].frameData.bgColor].timesUsed++;
              }
            }
          }
        }      
      }

      bgColors.sort(function(a, b) {
        return b.timesUsed - a.timesUsed;
      });

      for(var i = 0; i < 4; i++) {
        this.extendedColorBGColors[i] = bgColors[i];
      }
    }


    return true;

  },

  effectsCode: function() {

    var code = '';

    // effects init code
    for(var i = 0; i < this.effects.length; i++) {
      code += '  jsr effect' + i + '_init\n';
    }
    code += '  rts\n';

    // effects trigger code
    code += 'effects_trigger\n';
//    code += '  inc $d020\n';
    var effectIndex = 0;
    var nextEffectIndex = 0;
    for(var i = 0; i < this.effects.length; i++) {
      effectIndex = i + 4;
      nextEffectIndex = effectIndex + 1;
      code += 'effect_trigger_' + effectIndex + '\n';
      code += '  cmp #' + effectIndex + '\n';
      code += '  bne effect_trigger_' + nextEffectIndex + '\n';
      code += '  jmp effect' + i + '_trigger' + '\n';
    }

    code += 'effect_trigger_' + nextEffectIndex + '\n';
    code += '  rts\n';

    code += 'effects_tick\n';
    for(var i = 0; i < this.effects.length; i++) {
      code += ' jsr effect' + i + '_tick\n';
    }
    code += '  rts\n';

    for(var i = 0; i < this.effects.length; i++) {
      code += 'effect' + i + '_data\n';
      code += this.effects[i].data + "\n";
//      code += '  rts\n';


      code += 'effect' + i + '_init\n';
      code += this.effects[i].init + "\n";
      code += '  rts\n';

      code += 'effect' + i + '_trigger\n';
      code += this.effects[i].trigger + "\n";
      code += '  rts\n';

      code += 'effect' + i + '_tick\n';
      code += this.effects[i].tick + "\n";
      code += '  rts\n';

    }
    return code;

  },


  getC64Color: function(index) {

    if(this.colorMap[index] !== false) {
      return this.colorMap[index];
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(colorPalette.getIsC64Palette()) {
      // using the c64 palette, so no need to try to match..
      return index;
    }

    var color = colorPalette.getColor(index);

    // TODO: need to be calculating laba??
    if(typeof color.laba == 'undefined') {
      return index;
    }


    var c64Color = 0;
    var bestScore = false;


    for(var i = 0; i < this.c64Colors.length; i++) {
      var testScore = 0;

      testScore += Math.abs(color.laba.values[0] - this.c64Colors[i].laba.values[0]);
      testScore += Math.abs(color.laba.values[1] - this.c64Colors[i].laba.values[1]);
      testScore += Math.abs(color.laba.values[2] - this.c64Colors[i].laba.values[2]);

      if(bestScore === false || testScore < bestScore) {
        bestScore = testScore;
        c64Color = i;
      }

    }


    this.colorMap[index] = c64Color;
    return this.colorMap[index];

  },


  assembleCode: function(code) {

    var frameWidth = this.editor.frames.width;
    var height = this.editor.frames.width;

    var verticalScrollMaxHigh = (((height - 24) * frameWidth) >> 8) & 0xff;
    var verticalScrollMaxLow = (((height - 24) * frameWidth) ) & 0xff;

    args = {};
    args['FRAMEWIDTHHIGH'] = '#0';
    args['FRAMEWIDTHLOW'] = '#' + frameWidth;
    args['VERTICALSCROLLMAXHIGH'] = '#' + verticalScrollMaxHigh;
    args['VERTICALSCROLLMAXLOW'] = '#' + verticalScrollMaxLow;

    for(var key in args) {
      if(args.hasOwnProperty(key)) {
        var value = args[key];
        code = code.replace(new RegExp(key, 'g'), value);
      }
    }


    var assembler = g_app.assembler;

    var result = assembler.assemble(code, 0x801);
    if(result.success) {


      var memory = assembler.getMemory();
      var index = 0;
      this.prg = [];
      this.prg[index++] = 0x01;
      this.prg[index++] = 0x08;

      for(var i = result.start; i < result.end; i++) {
        this.prg[index++] = memory[i];
      }

      this.blocks = result.blocks;

      var out = '';
      for(var i =0 ; i < this.prg.length; i++) {
        out += this.prg[i].toString(16) + "\n";
      }

      out = assembler.getDisassembly();

      $('#c64PRGCodeEditorResult').val(out);
    } else {
      var out = 'ERRORS FOUND:\n';
      for(var i = 0; i < result.errors.length; i++) {
        out += result.errors[i].message + "\n";
      }
      $('#c64PRGCodeEditorResult').val(out);
    }

  },

  // get the background color for the selected layer, if no colour, go down the layers
  getBackgroundColor: function(frame) {

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      return this.editor.colorPaletteManager.noColor;
    }

    var color = layer.getBackgroundColor(frame);
    if(color != this.editor.colorPaletteManager.noColor) {
      return color;
    }


    var layerIndex = this.editor.layers.getSelectedLayerIndex();
    while(layerIndex > 0) {
      layerIndex--;
      var layer = this.editor.layers.getLayerObjectFromIndex(layerIndex);

      if(layer && typeof layer.getBackgroundColor != 'undefined') {
        color = layer.getBackgroundColor(frame);
        if(color != this.editor.colorPaletteManager.noColor) {
          return color;
        }
      }
    }

    return this.editor.colorPaletteManager.noColor;
  },


  // get the background color for the selected layer, if no colour, go down the layers
  getBorderColor: function() {

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      return this.editor.colorPaletteManager.noColor;
    }

    var color = layer.getBorderColor();
    if(color != this.editor.colorPaletteManager.noColor) {
      return color;
    }


    var layerIndex = this.editor.layers.getSelectedLayerIndex();
    while(layerIndex > 0) {
      layerIndex--;
      var layer = this.editor.layers.getLayerObjectFromIndex(layerIndex);

      if(layer && typeof layer.getBorderColor != 'undefined') {
        color = layer.getBorderColor();
        if(color != this.editor.colorPaletteManager.noColor) {
          return color;
        }
      }
    }

    return this.editor.colorPaletteManager.noColor;
  },  

  createPRG: function(args) {

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    if(layer.getBlockModeEnabled()) {
//      layer.updateTilesFromBlocks();
    }


    var colorPalette = layer.getColorPalette();
    var tileSet = layer.getTileSet();
    var colorPerMode = layer.getColorPerMode();


    if(colorPerMode == 'character') {
      layer.updateGridColorsFromTiles();
    }

    var filename = 'c64.prg';
    var downloadPRG = true;


    var layers = 'current';
    if(typeof args.layers != 'undefined') {
      layers = args.layers;
    }

    if(typeof args.download != 'undefined') {
      downloadPRG = args.download;
    }


    var gridWidth =  args.gridWidth;
    var gridHeight = args.gridHeight;

    if(tileSet.getTileHeight() > 8) {
      gridHeight = gridHeight * 2;
    }


    var scrolling = false;
    if(gridHeight > 25 || gridWidth > 40) {
      if(typeof args.scrollV != 'undefined') {
        scrolling = args.scrollV;
      }
    }

    if(!scrolling) {
      if(gridWidth > 40) {
        gridWidth = 40;
      }
      if(gridHeight > 25) {
        gridHeight = 25;
      }
    }


    // work out if colours need to be converted..
    if(colorPalette.getColorCount() == 16) {
      
      this.colorMap = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colorMap.push(i);
      }
    } else {
      
      // map colours to c64 colours
      this.colorMap = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colorMap.push(false);
      }
    }

    this.c64Colors = [];
    for(var i = 0; i < this.colorSchemes.vice.length; i++) {
      var color = {};
      color.hex = this.colorSchemes.vice[i];
      var r = (color.hex >> 16) & 255;
      var g = (color.hex >> 8) & 255;
      var b = color.hex & 255;  

      color.r = r / 255;
      color.g = g / 255;
      color.b = b / 255;

      var c = {};
      c.values = [r,g,b,255];

      color.hsv = Colour.converters[Colour.RGBA][Colour.HSVA](c);
      color.laba = Colour.converters[Colour.RGBA][Colour.LABA](c);
      this.c64Colors.push(color);
    }

    var extendedColorMode = args.mode == 'extended';
    var multicolorMode = args.mode == 'multicolor';
    var monochrome = args.mode == 'monochrome';

    if(monochrome && typeof args.monochromeColor != 'undefined') {
      this.monochromeColor = args.monochromeColor;
    }

    var customTileSet = false;
    var music = args.music;
    if(typeof music == 'undefined') {
      music = 'no';
    }

    var customTileSet = !tileSet.isDefaultTileSet('c64');

    var tileCount = tileSet.getTileCount();
    if(tileCount != 256) {
      customTileSet = true;
    } else {

      for(var i = 0; i < tileCount; i++) {
        if(tileSet.tileData[i].props.animated !== false) {
          customTileSet = true;
          break;
        }
      }
    }

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = i;
    }

/*
    var editorFrames = {};
    if(typeof args.frames != 'undefined') {
      editorFrames = args.frames;
    } else {
      editorFrames = layer.getFrames();//this.editor.frames;
    }
    */

    var inputData = args.frames;


    var fgPosition = this.editor.grid.xyPosition;
    if(typeof args.fgPosition != 'undefined') {
      fgPosition = args.fgPosition;
    }
    var bgPosition = 0;// this.editor.grid.xyPosition;


/*
    if(this.editor.bgInPrevLayer) {
      bgPosition = bgPosition - 1;
    }

    if(typeof args.bgPosition != 'undefined') {
      bgPosition = args.bgPosition;
    }

*/
    if(scrolling) {
      code = C64ASMScroll;
    } else {
      code = this.c64Asm.files.load('/main.asm');
      //code = C64ASMSource;//this.editor.baseCodeEditor.getCode();
    }

    effectsCode = '\ninit_effects\n' + this.effectsCode();

    code = code.replace('\ninit_effects', effectsCode); 

    var frameWidthLow = gridWidth & 0xff;
    var frameWidthHigh = (gridWidth >> 8) & 0xff;

    var verticalScrollMaxHigh = (((gridHeight - 24) * gridWidth) >> 8) & 0xff;
    var verticalScrollMaxLow = (((gridHeight - 24) * gridWidth) ) & 0xff;

/*
    this.editor.baseCodeEditor.setPRG(code, { FRAMEWIDTHLOW: '#' + frameWidthLow, FRAMEWIDTHHIGH: '#' + frameWidthHigh,
                                               VERTICALSCROLLMAXHIGH: '#' + verticalScrollMaxHigh, VERTICALSCROLLMAXLOW: '#' + verticalScrollMaxLow });
*/
    this.assembleCode(code);

    var memoryMap = [];

    var blocks = [];
    for(var i = 0; i < this.blocks.length; i++) {
      blocks.push({ "type": "Code", "start": this.blocks[i].start, "end": this.blocks[i].end, "label": this.blocks[i].label });
    }


    if(typeof(args.filename) != 'undefined') {
      filename = args.filename;
    } 

    var entries = [];
    // construct frame entries table
    if(typeof args.entries == 'undefined') {
      this.writeEntriesTable();
      entries = this.entries;
    } else {
//      this.entries = args.entries;
      entries = args.entries;
    }

    var keyTriggers = [];
    if(typeof args.keyTriggers == 'undefined') {
      this.writeKeyTriggersTable();
      keyTriggers = this.keyTriggers;
    } else {
      keyTriggers = args.keyTriggers;
    }

    var instrTriggers = [];
    if(typeof args.instrTriggers == 'undefined') {
      this.writeInstrTriggersTable();
      instrTriggers = this.instrTriggers;
    } else {
      instrTriggers = args.instrTriggers;
    }


    // work out what frames are needed
    var frames = [];
    var framesToExport = [];
    var previousFrame = -1;

    for(var i = 0; i < entries.length; i++) {
      if(entries[i].type == 'frame') {
        var frame = parseInt(entries[i].frame);
        var found = false;
        var isJumpToFrame = false;
        var isTriggerJumpToFrame = false;

        // find out if this frame is a jump to frame
        for(var j = 0; j < entries.length; j++) {

          if(entries[j].type == 'frameJump') {
            var jumpTo = parseInt(entries[j].jumpTo) - 1;
            var jumpToFrame = 0;
            if(entries[jumpTo].type == 'frame') {
              jumpToFrame = entries[jumpTo].frame;
            } else if(entries[jumpTo].type == 'frameRange') {
              jumpToFrame = entries[jumpTo].from;
            }

            if(frame == jumpToFrame) {
              isJumpToFrame = true;
              break;
            }
          }
        }

        // check if any triggers go to this frame
        for(var j = 0; j < keyTriggers.length; j++) {
          if(keyTriggers[j].action == 'gotorow') {
            var gotoRow = parseInt(keyTriggers[j].gotoRow) - 1;
            var gotoFrame = 0;

            // find the first frame in the goto row
            if(entries[gotoRow].type == 'frame') {
              gotoFrame = entries[gotoRow].frame;
            } else if(entries[gotoRow].type == 'frameRange') {
              gotoFrame = entries[gotoRow].from;
            }

            // is trigger going to this row..
            if(frame == gotoFrame) {
              isJumpToFrame = true;
              isTriggerJumpToFrame = true;
              break;
            }
          }

        }


        // check if any triggers go to this frame
        for(var j = 0; j < instrTriggers.length; j++) {
          if(instrTriggers[j].action == 'gotorow') {
            var gotoRow = parseInt(instrTriggers[j].gotoRow) - 1;
            var gotoFrame = 0;

            // find the first frame in the goto row
            if(entries[gotoRow].type == 'frame') {
              gotoFrame = entries[gotoRow].frame;
            } else if(entries[gotoRow].type == 'frameRange') {
              gotoFrame = entries[gotoRow].from;
            }

            // is trigger going to this row..
            if(frame == gotoFrame) {
              isJumpToFrame = true;
              isTriggerJumpToFrame = true;
              break;
            }
          }

        }




        for(var j = 0; j < frames.length; j++) {
          if(frames[j].frame == frame) {
            if(previousFrame != frames[j].previousFrame) {
              // frame has multiple frames before it, need to write data for whole frame
              frames[j].canWriteAsChanges = false;
            }
            found = true;

            break;
          }
        }

        if(!found) {
          frames.push({ frame: frame, previousFrame: previousFrame, canWriteAsRLE: (!isJumpToFrame) & !(isTriggerJumpToFrame),  canWriteAsChanges: (previousFrame != -1) & !isJumpToFrame  });
          framesToExport.push( (frame - 1)) ;
        }

        previousFrame = frame;

      } else if(entries[i].type == 'frameRange') {
        var from = parseInt(entries[i].from);
        var to = parseInt(entries[i].to);
        var direction = 1;
        if(to < from) {
          direction = -1;
        }

        for(var frame = from; frame != (to + direction); frame += direction) {
          var isJumpToFrame = false;
          var isTriggerJumpToFrame = false;

          // find out if this frame is a jump to frame
          for(var j = 0; j < entries.length; j++) {
            if(entries[j].type == 'frameJump') {
              var jumpTo = parseInt(entries[j].jumpTo) - 1;
              var jumpToFrame = 0;
              if(entries[jumpTo].type == 'frame') {
                jumpToFrame = entries[jumpTo].frame;
              } else if(entries[jumpTo].type == 'frameRange') {
                jumpToFrame = entries[jumpTo].from;
              }
              if(frame == jumpToFrame) {
                isJumpToFrame = true;
                break;
              }
            }
          }


          // check if any triggers go to this frame
          for(var j = 0; j < keyTriggers.length; j++) {
            if(keyTriggers[j].action == 'gotorow') {

              var gotoRow = parseInt(keyTriggers[j].gotoRow) - 1;
              var gotoFrame = 0;

              // find the first frame in the goto row
              if(entries[gotoRow].type == 'frame') {
                gotoFrame = entries[gotoRow].frame;
              } else if(entries[gotoRow].type == 'frameRange') {
                gotoFrame = entries[gotoRow].from;
              }

              // is trigger going to this row..
              if(frame == gotoFrame) {
                isJumpToFrame = true;
                isTriggerJumpToFrame = true;
                break;
              }
            }

          }

          // check if any triggers go to this frame
          for(var j = 0; j < instrTriggers.length; j++) {
            if(instrTriggers[j].action == 'gotorow') {

              var gotoRow = parseInt(instrTriggers[j].gotoRow) - 1;
              var gotoFrame = 0;

              // find the first frame in the goto row
              if(entries[gotoRow].type == 'frame') {
                gotoFrame = entries[gotoRow].frame;
              } else if(entries[gotoRow].type == 'frameRange') {
                gotoFrame = entries[gotoRow].from;
              }

              // is trigger going to this row..
              if(frame == gotoFrame) {
                isJumpToFrame = true;
                isTriggerJumpToFrame = true;
                break;
              }
            }

          }


          var found = false;
          for(var j = 0; j < frames.length; j++) {
            if(frames[j].frame == frame) {
              if(previousFrame != frames[j].previousFrame) {
                // frame has multiple frames before it, need to write data for whole frame
                frames[j].canWriteAsChanges = false;
              }

              found = true;
              break;
            }
          }
          if(!found) {
            frames.push({ frame: frame, previousFrame: previousFrame,  canWriteAsRLE: (!isJumpToFrame) & !(isTriggerJumpToFrame),  canWriteAsChanges: (previousFrame != -1) & !isJumpToFrame  });
            framesToExport.push( (frame - 1) );
          }

          previousFrame = frame;

        }
      }
    }

    this.sidData = null;

//    if(music === "yes" || music === true) {
    if(music != 'no' && music != 'sid') {
      var path = music;

      if(g_app.doc.getDocRecord(path) != null) {


        g_app.music.show(path);

        var sidStartAddress = 0x1000;

        this.sidHeaderLength = 0;
        this.sidLoadAddr = sidStartAddress;
        this.sidInitAddr = sidStartAddress;
        this.sidPlayAddr = sidStartAddress + 3; 
        this.sidSpeed = g_app.music.sidSpeed; 

        g_app.music.createSid();
        if(typeof g_app.music.musicPlayer2.songData != 'undefined' 
          && typeof g_app.music.musicPlayer2.songData.getSIDData != 'undefined') {
          
          this.sidData = g_app.music.musicPlayer2.songData.getSIDData();
        } else {
          alert('sorry, the current music play does not support sid data export');
          this.sidData = null;
        }
      }
    } 

    if(music == "no") {
      this.sidData = null;

    }

    if(music == "sid") {

      this.sidHeaderLength = 126;
      this.sidLoadAddr = args.sidLoadAddr;
      this.sidInitAddr = args.sidInitAddr;
      this.sidPlayAddr = args.sidPlayAddr; 
      this.sidSpeed = args.sidSpeed;
      
      if(this.sidSpeed < 1) {
        this.sidSpeed = 1;
      }

      this.sidData = args.sidData;


    }


    // the base prg.
    var prg = this.prg;

    var data = new Uint8Array(64000);
    var index = 0;
    var borderColor = this.getBorderColor();
    var backgroundColor = this.getBackgroundColor();



    // write out the base prg --------------------------
    index = 0;
    var dataFrom = index;
    for(var i = 0; i < prg.length; i++) {
      data[index++] = prg[i];
    }
    dataTo = index;
    memoryMap.push({ "type": "Code", "from": dataFrom, "to": dataTo });



    var tileSetCount = 1;//this.editor.tileSetManager.getTileSetCount();

    // custom charsets ---------------------------
    if(extendedColorMode) {

      // extended color mode can only use 64 characters
      if(this.getExtendedColorBGColors(args, framesToExport)) {

        this.getMostUsedCharacters(args, framesToExport);


        // TODO: only include charactersets if they are used..
        // TODO: put this into its own function? take into account which vic bank?
        var charBlock = 0;

        for(var i = 0; i < tileSetCount; i++) {
          tileSet = layer.getTileSet();//this.editor.tileSetManager.getTileSet(i);

          if(tileSet.getTileHeight() > 8) {
            this.getTallerCharsetData(tileSet, i, extendedColorMode);   
          } else {
            this.getExtendedColorCharsetData(tileSet, i);
          }

          customTileSet = true;

          // write out the custom characters for extended color mode
          // custom characters start at 0x3800
          index = (0x3800 - 0x801 + 2) - 0x800 * charBlock;      

//          this.editor.tileSets[i].memoryLocation = (7 - charBlock) << 1;

          tileSet.memoryLocation = (7 - charBlock) << 1;
          var dataFrom = index;
          for(var j = 0; j < this.extendedColorCharsetData.length; j++) {
            data[index++] = this.extendedColorCharsetData[j];
          }
          var dataTo = index;
          memoryMap.push({ "type": "Character Data", "from": dataFrom, "to": dataTo });

          blocks.push({ "type": "Character Set Data", 
            start: (dataFrom + 0x801 - 2), 
            end: (dataTo + 0x801 - 2) });


          charBlock++;
        }

      } else {
        // trouble working out bg colors, dont use extended color mode
        extendedColorMode = false;
      }

    } else {

      if(tileSet.getTileHeight() > 8) {

        // can only use 128 characters, so sort characters by most used
        this.getMostUsedCharacters(args, framesToExport);
        var charBlock = 0;
        for(var i = 0; i < tileSetCount; i++) {
          tileSet = layer.getTileSet();//this.editor.tileSetManager.getTileSet(i);

          index = (0x3800 - 0x801 + 2) - 0x800 * charBlock;   
//          this.editor.tileSets[i].memoryLocation = (7 - charBlock) << 1;
          tileSet.memoryLocation = (7 - charBlock) << 1;

          var dataFrom = index;
          this.getTallerCharsetData(tileSet, i);   

          for(var j = 0; j < this.charsetData.length; j++) {
            data[index++] = this.charsetData[j];
          }
          var dataTo = index;

          blocks.push({ "type": "Character Set Data (" + tileSet.name + ")", start: dataFrom + 0x801 - 2, end: dataTo + 0x801 - 2 });
          charBlock++;
        }

      } else {
        // counter for the character block being written out
        var charBlock = 0;
        this.getMostUsedCharacters(args, framesToExport);

        for(var i = 0; i < tileSetCount; i++) {
          tileSet = layer.getTileSet();

          if(tileSet.isDefaultTileSet('c64')) {
            tileSet.memoryLocation = 4;
          } else {

            index = (0x3800 - 0x801 + 2) - 0x800 * charBlock;   
            //this.editor.tileSets[i].memoryLocation = (7 - charBlock) << 1;
            tileSet.memoryLocation = (7 - charBlock) << 1;

            var dataFrom = index;
            this.getCharsetData(tileSet);   

            for(var j = 0; j < this.charsetData.length; j++) {
              data[index++] = this.charsetData[j];
            }
            var dataTo = index;

            blocks.push({ "type": "Character Set Data (" + tileSet.name + ")", start: dataFrom + 0x801 - 2, end: dataTo + 0x801 - 2 });
            charBlock++;
          }
        }
      }
    }


    // set index to just before 0x1000....code may overlap this tho, need to check
    index = 0xfff - 0x801 + 2;

    // is there a sid?
    if(this.sidData) {

      var address = index + 0x801 - 2;

      if(address > this.sidLoadAddr) {
        // gone past where sid should be...
        this.sidData = null;
      } else {

        index = this.sidLoadAddr - 0x801 + 2;

        var dataFrom = index;
        for(var i = this.sidHeaderLength; i < this.sidData.length; i++) {
          data[index++] = this.sidData[i];  
        }
        var dataTo = index;
        memoryMap.push({ "type": "SID", "from": dataFrom, "to": dataTo });

        blocks.push({"type": "SID", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});

/*
        if(this.sidLoadAddr > 0x2000) {
          index = 0xfff - 0x801 + 2;
        }
*/

      }
    } else {

    }


    // index is set to just after sid.
    var framePtrTableAddr = index;
    console.log('frame ptr table addr:' + framePtrTableAddr);

    // just leave 300 space for the table for the moment..need to fit in trigger table as well
    index += 600;

    var animatedCharsTableAddr = false;
    // are there animated characters?

//    var tileSet = this.editor.getTileSet();
    var animatedCount = 0;
    var dataFrom = index;

    var tileCount = tileSet.getTileCount();


    for(var i = 0; i < tileCount; i++) {
      var tileAnimatedType = tileSet.getAnimatedType(i);
      var tileProperties = tileSet.getTileProperties(i);

      if(tileAnimatedType !== false) {
        var ch = 0;
        
        if(i < this.charsetMap.length) {
          ch = this.charsetMap[i]
        }
        customTileSet = true;


        data[index++] = tileProperties.ticksPerFrame;
        data[index++] = tileProperties.ticksPerFrame;
        data[index++] = (ch * 8) & 0xff;
        data[index++] = (ch * 8) >> 8;

        switch(tileAnimatedType) {
          case 'right':
            data[index++] = 1;
            break;
          case 'up':
            data[index++] = 2;
            break;
          case 'down':
            data[index++] = 3;
            break;
          case 'blink':
            data[index++] = 4;
            break;
          default:
          case 'left':
            data[index++] = 0;
            break;

        }


        animatedCount++;
      }
    }

    // end of table
    data[index++] = 0;

    var animatedCharsTableAddr = dataFrom;

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Animated Characters Table", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Animated Characters Table", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }



    var dataFrom = index;

    for(var i = 0; i < 4; i++) {
      data[index++] = 6;//tileSet.characterProperties[i].ticksPerFrame;
      data[index++] = 6;//tileSet.characterProperties[i].ticksPerFrame;
      data[index++] = i;
    }
    // end of table
    data[index++] = 0;


    var animatedBGColorsTableAddr = dataFrom;

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Animated BG Colours Table", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Animated BG Colours Table", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }


    var dataStartAddress = index;


    // update the config ------------
    var configStart = 0x0810 - 0x0801 + 2;
    var configPos = configStart;

    // border color
    data[configPos++]   = this.getC64Color(borderColor);
    // extended color mode


    if(extendedColorMode) {
      data[configPos++] = 1;
    } else if(multicolorMode) {
      data[configPos++] = 2;
    } else {
      data[configPos++] = 0;      
    }

    // custom characters

    if(customTileSet) {
      data[configPos++] = 1;
    } else {
      data[configPos++] = 0;
    }

    if(this.sidData) {
      // has sid
      data[configPos++] = 1;

      // sid speed
      data[configPos++] = this.sidSpeed;

      // sid init addr low
      data[configPos++] = this.sidInitAddr & 0xff;

      // sid init addr high
      data[configPos++] = this.sidInitAddr >> 8;

      // sid play addr low
      data[configPos++] = this.sidPlayAddr & 0xff;

      // sid play addr high
      data[configPos++] = this.sidPlayAddr >> 8;

    } else {

      // has no sid
      data[configPos++] = 0;

      // sid speed
      data[configPos++] = 0;

      // sid init addr low
      data[configPos++] = 0;

      // sid init addr high
      data[configPos++] = 0;

      // sid play addr low
      data[configPos++] = 0;

      // sid play addr high
      data[configPos++] = 0;
    }

    data[configPos++] = (framePtrTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (framePtrTableAddr + 0x0801 - 2) >> 8;

    data[configPos++] = (animatedCharsTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (animatedCharsTableAddr + 0x0801 - 2) >> 8;

    
    data[configPos++] = (animatedBGColorsTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (animatedBGColorsTableAddr + 0x0801 - 2) >> 8;

    var framesData = [];

    var z = 0;// fgPosition;// this.editor.grid.xyPosition;
    for(var frameIndex = 0; frameIndex < frames.length; frameIndex++) {
      var frame = frames[frameIndex].frame - 1; 
      if(extendedColorMode) {
        // work out the background colors for this frame..
        this.getExtendedColorBGColors(args, [frame]);


      } else {
        this.extendedColorBGColors = [];

        backgroundColor = this.getBackgroundColor(frame);

        if(multicolorMode) {
          var multicolor1 = layer.getC64Multi1Color();
          var multicolor2 = layer.getC64Multi2Color();

          this.extendedColorBGColors.push({'color': this.getC64Color(backgroundColor) });
          this.extendedColorBGColors.push({'color': this.getC64Color(multicolor1) });  // multicolor 1
          this.extendedColorBGColors.push({'color': this.getC64Color(multicolor2) });  // multicolor 2
          this.extendedColorBGColors.push({'color': 0});

        } else {
          this.extendedColorBGColors.push({'color': this.getC64Color(backgroundColor) });
          this.extendedColorBGColors.push({'color': 0});  // multicolor 1
          this.extendedColorBGColors.push({'color': 0});  // multicolor 2
          this.extendedColorBGColors.push({'color': 0});
        }
      }


      // 1 is full frame
      var charFrameType = 1;
      var charData = [];
      var charChanges = [];
      var charRLE = [];


      var colorFrameType = 1;      
      var colorData = [];
      var colorChanges = [];




      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {

          var tile = this.editor.tileSetManager.blankCharacter;
          var row = y;
          var charOffset = 0;

          if(tileSet.charHeight > 8) {
            row = Math.floor(row / 2);
            if(y % 2 != 0) {
              charOffset = 128;
              if(extendedColorMode) {
                charOffset = 32;
              }
            }
          }


          var color = inputData[frame].frameData.data[row][x].fc;
          var bgColor = false;

          if(layers == 'merge') {
            /*
            for(var testZ = editorFrames.depth - 1; testZ >= 0; testZ--) {
              char = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].t;
              if(char != this.editor.tileSetManager.blankCharacter || editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].bc !== -1) {
                color = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].fc;                
                bgColor = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].bc;                
                break;
              }
            }
            */
          } else {
            tile = inputData[frame].frameData.data[row][x].t;
          }

          if(monochrome) {
            color = this.monochromeColor;
          }

          if(tile < this.charsetMap.length) {
            tile = this.charsetMap[tile] + charOffset;
          } else {
            tile = 0;
          }

//          if(charOffset)

          if(extendedColorMode) {
            // work out background color

            if(layers !== 'merge') {
              if(this.editor.bgInPrevLayer) {
                bgColor = inputData[frame].frameData.data[row][x].fc;
              } else {
                bgColor = inputData[frame].frameData.data[row][x].bc;              
              }
            }

            if(typeof bgColor == 'undefined' || bgColor === false) {
              bgColor = this.getBackgroundColor(frame);//editorFrames.frames[frame].bgColor;
            }

            if(layer.getScreenMode() !== TextModeEditor.Mode.C64ECM) {
              bgColor = this.getC64Color(bgColor);

              for(var i = 0; i < this.extendedColorBGColors.length; i++) {
                if(bgColor == this.extendedColorBGColors[i].color) {
                  bgColor = i;
                  break;
                }
              }
              bgColor = bgColor & 0x3;
              tile = tile | bgColor << 6;        
  
            } else {
              // layer is in c64 ecm already
              bgColor = inputData[frame].frameData.data[row][x].bc;    

              if(bgColor == this.editor.colorPaletteManager.noColor) {

                //bgColor = 0;
                // tile index should be actual tile
              } else {
                // tile has a background colour set
                bgColor = bgColor & 0x3;
                tile = tile | bgColor << 6;        
              }
  
            }

          }

          charData.push(tile);

          colorData.push(this.getC64Color(color));

        }
      }

//      aaav

      var lastChar = -1;
      var repeatLength = 0;

      var maxRepeatLength = 250;

      for(var i = 0; i < charData.length; i++) {

        repeatLength = 0;
        lastChar = charData[i];

        while(i < charData.length && lastChar == charData[i] && repeatLength < maxRepeatLength) {
          i++;
          repeatLength++;
        }
        charRLE.push(repeatLength);
        charRLE.push(lastChar);
        if(repeatLength > 0) {
          i--;
        }

      }

      charRLE.push(0);

      // can this frame be written as a series of changes
      if(frames[frameIndex].canWriteAsChanges) {

        var previousFrame = frames[frameIndex].previousFrame;
        var previousFrameIndex = -1;

        // find where the char/color data is in the frames aray
        for(var i = 0; i < frames.length; i++) {
          if(frames[i].frame == previousFrame) {
            previousFrameIndex = i;
            break;
          }
        }

        if(previousFrameIndex != -1) {


          var offset = 0;

          for(var i = 0; i < charData.length; i++) {
            var newChar = charData[i];
            var oldChar = frames[previousFrameIndex].frameData.charData[i];

            if(newChar != oldChar || offset > 200) {
              charChanges.push(offset);
              charChanges.push(newChar);
              offset = 0;
            }

            offset++;
          }

          if(charChanges.length == 1) {
            // need at least 1 entry, just set it for first character
            charChanges.push(frames[previousFrameIndex].frameData.charData[0]);
          }

          charChanges.push(0);
    
          if(charChanges.length < 900) {

            charFrameType = 2;
          }


          var offset = 0;

          for(var i = 0; i < colorData.length; i++) {
            var newColor = colorData[i];
            var oldColor = frames[previousFrameIndex].frameData.colorData[i];

            if(newColor != oldColor || offset > 200) {
              colorChanges.push(offset);
              colorChanges.push(newColor);
              offset = 0;
            }

            offset++;
          }

          colorChanges.push(0);
          if(colorChanges.length == 1) {
            // need at least 1 entry, just set it for first color
            colorChanges.push(frames[previousFrameIndex].frameData.colorData[0]);
            colorChanges.push(0);          
          }
    
          if(colorChanges.length < 240) {  
            colorFrameType = 2;
          }

        }

      }


      if(frames[frameIndex].canWriteAsRLE) {
        // need to work out optimal value..

        if(charFrameType == 1 && charRLE.length < 600 && charRLE.length != 0) {//charData.length) {
          charFrameType = 3;
        }
      }

      if(scrolling) {
        // scrolling needs all the data
        charFrameType = 1;
        colorFrameType = 1;
      }

      var duration = inputData[frame].duration;

      if(duration > 255) {
        duration = 255;    
      }

      if(duration < 7) {
        duration = 7;
      }

      var frameData = {
        charFrameType:  charFrameType,          // full frame
        colorFrameType: colorFrameType,          // color type
        duration: duration,
        charData:  charData,
        charChangesData: charChanges,
        charRLEData: charRLE,
        colorData: colorData,
        colorChangesData: colorChanges,

        bgColor1: this.extendedColorBGColors[0].color,
        bgColor2: this.extendedColorBGColors[1].color,
        bgColor3: this.extendedColorBGColors[2].color,
        bgColor4: this.extendedColorBGColors[3].color
      };
//      framesData.push(frameData);
      frames[frameIndex].frameData = frameData;

    }


    var customCharsIndex = 0x3800 - 0x801 + 2;
    var customCharsLength = 2048;
    if(extendedColorMode) {
      customCharsLength = this.extendedColorCharsetData.length;
    }


    var index = dataStartAddress;
    var frameTableIndex = framePtrTableAddr;

    var framesExported = 0;

    var nextColorDataPosition = false;


    // write out the data -------------------------------------
    for(var i = 0; i < frames.length; i++) {
      var frameData = frames[i].frameData;

      // length should be the smaller length of the data type...

      var charDataLength = frameData.charData.length;
      var colorDataLength = frameData.colorData.length;
      if(frameData.colorFrameType == 2) {
        colorDataLength = frameData.colorChangesData.length;
      }

      var foundLocation = false;
      while(!foundLocation) {
        foundLocation = true;
        for(var j = 0; j < blocks.length; j++) {
          if( (index + 0x801 - 2) < blocks[j].end && (index + charDataLength + 0x801 - 2) >= blocks[j].start) {


            // overlaps with this block, start search from end of block
            foundLocation = false;
            index = blocks[j].end -0x801 + 2;


            var location = index +0x801-2;


          }
        }
      }

      var location = index +0x801-2;

      if(index + charDataLength + colorDataLength > 0xd000 - 0x801) {

        // reached IO memory, cant go further
        break;
      }

/*
      if(customTileSet) {
        // dont want to write over the custom charset
        if(index < customCharsIndex && index + charDataLength > customCharsIndex) {
          index = customCharsIndex + customCharsLength;
        }
      }
*/

      var charDataAddress = index;


      var dataFrom = index;

      if(frameData.charFrameType == 1) {
        for(var j = 0; j < frameData.charData.length; j++) {
          data[index++] = frameData.charData[j]; 
        }
      } else if(frameData.charFrameType == 2) {

        for(var j = 0; j < frameData.charChangesData.length; j++) {
          data[index++] = frameData.charChangesData[j]; 
        }  
      } else if(frameData.charFrameType == 3) {
        for(var j = 0; j < frameData.charRLEData.length; j++) {
          data[index++] = frameData.charRLEData[j]; 
        }  

      } else {
        alert('???');
      }

      var dataTo = index;
      memoryMap.push( { "type": "Frame Data", "from": dataFrom, "to": dataTo });

      blocks.push({"type": "Frame " + i + " Char Data", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})



/*
      // write color data
      if(customTileSet) {
        // dont want to write over the custom charset
        if(index < customCharsIndex && index + frameData.colorData.length > customCharsIndex) {
          index = customCharsIndex + customCharsLength;
        }
      }
*/
      var colorDataAddress = index;
      var colorData4Bit = false;

      if(!scrolling) {
        colorData4Bit = true;
      }



      if(frameData.colorFrameType == 1) {

        if(nextColorDataPosition !== false && colorData4Bit) {

          // interleavinv 4 bit color data
          var dataFrom = nextColorDataPosition;
          colorDataAddress = nextColorDataPosition;
          for(var j = 0; j < frameData.colorData.length; j++) {
            data[nextColorDataPosition] = frameData.colorData[j];

            j++;
            data[nextColorDataPosition] = data[nextColorDataPosition] | (frameData.colorData[j] << 4);
            nextColorDataPosition += 2;
          }

          var dataTo = nextColorDataPosition;
          blocks.push({"type": "Frame " + i + " Color Data (4 bit)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})

          // next time color data needs to be a new block
          nextColorDataPosition = false;
        } else {

          // find where to put the color data
          var foundLocation = false;
          while(!foundLocation) {
            foundLocation = true;
            for(var j = 0; j < blocks.length; j++) {
              if( (index + 0x801 - 2) < blocks[j].end && (index + colorDataLength + 1 + 0x801 - 2) >= blocks[j].start) {
                foundLocation = false;
                index = blocks[j].end - 0x801 + 2;
              }
            }
          }


          colorDataAddress = index;
          var dataFrom = index;          

          if(colorData4Bit) {

            for(var j = 0; j < frameData.colorData.length; j++) {
              data[index] = frameData.colorData[j];

              j++;
              data[index] = data[index] | (frameData.colorData[j] << 4);
              index += 2;
            }
            // next color block will end one after this one..
            index++;
          } else {
            for(var j = 0; j < frameData.colorData.length; j++) {
              data[index++] = frameData.colorData[j];
            }
            index++;

          }

          var dataTo = index;
          memoryMap.push({ "type": "Frame Color Data", "from": dataFrom, "to": dataTo });

          nextColorDataPosition = colorDataAddress + 1;
          blocks.push({"type": "Frame " + i + " Color Data (4 bit)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})
        }


      } else if(frameData.colorFrameType == 2) {


        // find where to put the color data
        var foundLocation = false;
        while(!foundLocation) {
          foundLocation = true;
          for(var j = 0; j < blocks.length; j++) {
            if( (index + 0x801 - 2) < blocks[j].end && (index + colorDataLength + 1 + 0x801 - 2) >= blocks[j].start) {
              foundLocation = false;
              index = blocks[j].end - 0x801 + 2;
            }
          }
        }

        colorDataAddress = index;
        var dataFrom = index;          

        for(var j = 0; j < frameData.colorChangesData.length; j++) {
          data[index++] = frameData.colorChangesData[j];
        }        

        var dataTo = index;
        memoryMap.push({ "type": "Frame Color Data", "from": dataFrom, "to": dataTo });
        blocks.push({"type": "Frame " + i + " Color Data (changes)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})


      } else {
        alert('???');
      }




      framesExported++;

      frames[i].charAddress = (charDataAddress + 0x0801 - 2);
      frames[i].colorAddress = (colorDataAddress + 0x0801 - 2) ;

/*
      // char data entry
      data[frameTableIndex++] = framesData[i].charFrameType;
      // char data addr low
      data[frameTableIndex++] = (charDataAddress + 0x0801 - 2) & 0xff;
      // char data addr high
      data[frameTableIndex++] = (charDataAddress + 0x0801 - 2) >> 8;
      // char data addr duration
      data[frameTableIndex++] = framesData[i].duration;

      // color data entry
      data[frameTableIndex++] = framesData[i].colorFrameType;
      // color data addr low
      data[frameTableIndex++] = (colorDataAddress + 0x0801 - 2) & 0xff;
      // color data addr high
      data[frameTableIndex++] = (colorDataAddress + 0x0801 - 2)  >> 8;

      data[frameTableIndex++] = framesData[i].bgColor1;
      data[frameTableIndex++] = framesData[i].bgColor2;
      data[frameTableIndex++] = framesData[i].bgColor3;
      data[frameTableIndex++] = framesData[i].bgColor4;

*/
      var frameTableAddr = frameTableIndex + 0x801 - 2;


    }


    console.log('frame table index = ' + frameTableIndex);
    var dataFrom = frameTableIndex;

    var rowOffset = [];
    rowOffset[0] = 0;

    var firstFrame = true;
    var keyTableIndex = false;
    var instrTableIndex = false;

    for(var i = 0; i < entries.length; i++) {
      var row = i + 1;
      rowOffset[row] = frameTableIndex;

      if(entries[i].type == 'frame') {
        var frame = parseInt(entries[i].frame);
        for(var j = 0; j < frames.length; j++) {
          if(frames[j].frame == frame) {
            var frameData = frames[j].frameData;

            var duration = parseInt(entries[i].duration);
            if(duration < 6) {
              duration = 6;
            }
            if(duration > 255) {
              duration = 255;
            }


            // char data entry
            data[frameTableIndex++] = frameData.charFrameType;
            // char data addr low
            data[frameTableIndex++] = frames[j].charAddress & 0xff;
            // char data addr high
            data[frameTableIndex++] = frames[j].charAddress >> 8;
            // char data addr duration
            data[frameTableIndex++] = duration;

            // color data entry
            data[frameTableIndex++] = frameData.colorFrameType;
            // color data addr low
            data[frameTableIndex++] = frames[j].colorAddress & 0xff;
            // color data addr high
            data[frameTableIndex++] = frames[j].colorAddress >> 8;

            data[frameTableIndex++] = frameData.bgColor1;
            data[frameTableIndex++] = frameData.bgColor2;
            data[frameTableIndex++] = frameData.bgColor3;
            data[frameTableIndex++] = frameData.bgColor4;

            // effect

            if(firstFrame && keyTriggers.length > 0) {
              data[frameTableIndex++] = 1; // turn on key triggers
              keyTableIndex = frameTableIndex;
              data[frameTableIndex++] = 0; // key trigger table low
              data[frameTableIndex++] = 0; // key trigger table high
            }

            if(firstFrame && instrTriggers.length > 0) {
              data[frameTableIndex++] = 3; // turn on instr triggers
              instrTableIndex = frameTableIndex;
              data[frameTableIndex++] = 0; // instr trigger table low
              data[frameTableIndex++] = 0; // instr trigger table high
            }


            firstFrame = false;
            data[frameTableIndex++] = 0;

          }
        }
      } else if(entries[i].type == 'frameRange') {
        var from = entries[i].from;
        var to = entries[i].to;
        var found = false;

        var direction = 1;
        if(to < from) {
          direction = -1;
        }

//        for(var frame = from; frame <= to; frame++) {
        for(var frame = from; frame != (to + direction); frame += direction) {
          for(var j = 0; j < frames.length; j++) {
            if(frames[j].frame == frame) {


              var startFrame = frameTableIndex;

              var frameData = frames[j].frameData;
              // char data entry
              data[frameTableIndex++] = frameData.charFrameType;
              // char data addr low
              data[frameTableIndex++] = frames[j].charAddress & 0xff;
              // char data addr high
              data[frameTableIndex++] = frames[j].charAddress >> 8;
              // char data addr duration
              data[frameTableIndex++] = frameData.duration;

              // color data entry
              data[frameTableIndex++] = frameData.colorFrameType;
              // color data addr low
              data[frameTableIndex++] = frames[j].colorAddress & 0xff;
              // color data addr high
              data[frameTableIndex++] = frames[j].colorAddress >> 8;

              data[frameTableIndex++] = frameData.bgColor1;
              data[frameTableIndex++] = frameData.bgColor2;
              data[frameTableIndex++] = frameData.bgColor3;
              data[frameTableIndex++] = frameData.bgColor4;
            // effect
            
              if(firstFrame && keyTriggers.length > 0) {
                data[frameTableIndex++] = 1; // turn on key triggers
                keyTableIndex = frameTableIndex;
                data[frameTableIndex++] = 0; // key trigger table low
                data[frameTableIndex++] = 0; // key trigger table high
              }

              if(firstFrame && instrTriggers.length > 0) {

                data[frameTableIndex++] = 3; // turn on instr triggers
                instrTableIndex = frameTableIndex;
                data[frameTableIndex++] = 0; // instr trigger table low
                data[frameTableIndex++] = 0; // instr trigger table high
              }


              firstFrame = false;


              data[frameTableIndex++] = 0;

              var endFrame = frameTableIndex;
              break;
            }
          }
        }
      } else if(entries[i].type == 'frameJump') {
        var jumpTo = entries[i].jumpTo;
        var frameTableAddress = rowOffset[jumpTo] + 0x0801 - 2;
        data[frameTableIndex++] = 0;
        data[frameTableIndex++] = (frameTableAddress) & 0xff;
        data[frameTableIndex++] = (frameTableAddress) >> 8;

      }
    }

    data[frameTableIndex++] = 0;

    // then the address of the frame to loop to
    data[frameTableIndex++] = (framePtrTableAddr + 0x0801 - 2) & 0xff;
    data[frameTableIndex++] = (framePtrTableAddr + 0x0801 - 2) >> 8;

    // write the trigger table...
    //var keyTriggers = this.keyTriggers;
    if(keyTriggers.length > 0) {
      // need to write in trigger table
      var keyTriggerTableAddr = frameTableIndex + 0x801 - 2;
      data[keyTableIndex++] = keyTriggerTableAddr & 0xff;
      data[keyTableIndex] = keyTriggerTableAddr >> 8;

    }
    for(var i = 0; i < keyTriggers.length; i++) {
      var gotoRow = keyTriggers[i].gotoRow;
      var frameTableAddress = rowOffset[gotoRow] + 0x0801 - 2;

      var keyCode = keyTriggers[i].triggerKey.toLowerCase();
      data[frameTableIndex++] = this.keymap[keyCode];

      if(keyTriggers[i].action == 'gotorow') {
        data[frameTableIndex++] = 0;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(keyTriggers[i].action == 'nextframe') {
        data[frameTableIndex++] = 1;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(keyTriggers[i].action =='changecharset') {
        data[frameTableIndex++] = 2;//action;
        var charsetID = keyTriggers[i].charsetID;

        data[frameTableIndex++] = this.editor.tileSets[charsetID].memoryLocation;//4;//frameTableAddress & 0xff;   // should put the charset to change to
        data[frameTableIndex++] = frameTableAddress >>8;;     // should put the ticks to change
      } else {
        // custom effect

        var effectIndex = parseInt(keyTriggers[i].action);
        if(!isNaN(effectIndex)) {
          effectIndex += 4;
          data[frameTableIndex++] = effectIndex;
          data[frameTableIndex++] = 0;
          data[frameTableIndex++] = 0;

        } else {
          alert('unknown effect ' + keyTriggers[i].action);
        }
      }
      
    }

    // write the trigger table...
    //var instrTriggers = this.instrTriggers;
    if(instrTriggers.length > 0) {
      // need to write in trigger table
      var instrTriggerTableAddr = frameTableIndex + 0x801 - 2;
      data[instrTableIndex++] = instrTriggerTableAddr & 0xff;
      data[instrTableIndex] = instrTriggerTableAddr >> 8;

    }
    for(var i = 0; i < instrTriggers.length; i++) {
      var gotoRow = instrTriggers[i].gotoRow;
      var frameTableAddress = rowOffset[gotoRow] + 0x0801 - 2;

      var instrCode = parseInt(instrTriggers[i].triggerInstr);

      data[frameTableIndex++] = instrCode;

      if(instrTriggers[i].action == 'gotorow') {
        data[frameTableIndex++] = 0;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(instrTriggers[i].action == 'nextframe') {
        data[frameTableIndex++] = 1;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;
      } else if(instrTriggers[i].action == 'changecharset') {

        var charsetID = instrTriggers[i].charsetID;
        data[frameTableIndex++] = 2;//action;
        data[frameTableIndex++] = this.editor.tileSets[charsetID].memoryLocation;//4;//frameTableAddress & 0xff;   // should put the charset to change to
        data[frameTableIndex++] = frameTableAddress >>8;;     // should put ticks
      } else {

        var effectIndex = parseInt(instrTriggers[i].action);
        if(!isNaN(effectIndex)) {
          effectIndex += 4;
          data[frameTableIndex++] = effectIndex;
          data[frameTableIndex++] = 0;
          data[frameTableIndex++] = 0;

        } else {
          alert('unknown effect ' + instrTriggers[i].action);
        }

      }
      
    }

    data[frameTableIndex++] = 0;  // end


    var dataTo = frameTableIndex;
    memoryMap.push({ "type": "Frame Table Data", "from": dataFrom, "to": dataTo });

    // copy data into uintarray and download
    var length = index + 0x801 - 2;

    if(customTileSet) {
      // custom char set is 2k from 0x3800, must include this...
      // TODO: shift it if it can fit?
      var charSetEnd = 0x3800 + 2 - 0x0801 + 2048;
      if(length < charSetEnd) {
        length = charSetEnd;
      }

    }


    memoryMap.sort(function(a, b) {
      return a.from - b.from;
    });


    blocks.sort(function(a, b) {
      return a.start - b.start;
    });

    var memoryLayout = '<table>';
    memoryLayout += '<tr><th>Start</th><th>End</th><th>Bytes</th><th>Contents</th></tr>';
    for(var i = 0; i < blocks.length; i++) {

      if(blocks[i].end > length) {
        length = blocks[i].end;
      }
      memoryLayout += '<tr>';
      var start = ("0000" + blocks[i].start.toString(16)).substr(-4);
      var end = ("0000" + blocks[i].end.toString(16)).substr(-4);
      var bytes = blocks[i].end - blocks[i].start;

      memoryLayout += '<td style="text-align: right">';
      memoryLayout += start;
      memoryLayout += '</td>';
      memoryLayout += '<td style="text-align: right">';
      memoryLayout += end;
      memoryLayout += '</td>';
      memoryLayout += '<td style="text-align: right">';
      memoryLayout += bytes;
      memoryLayout += '</td>';
      memoryLayout += '<td>';
      memoryLayout += blocks[i].type;
      if(blocks[i].type == 'Code' && typeof blocks[i].label != 'undefined') {
        memoryLayout += ' (' + blocks[i].label + ')';
      }

      memoryLayout += '</td>';

    }
    memoryLayout += '</table>'

    $('#exportPRGAdvMemory').html(memoryLayout);


    length = length - 0x801 + 2;

    var output = new Uint8Array(length);  
    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }


    if(downloadPRG) {

      var type = 'prg';
      if(typeof args.type != 'undefined') {
        type = args.type;
      }

      if(type == 'prg') {
        if(filename.indexOf('.prg') == -1) {
          filename += ".prg";
        }
        download(output, filename, "application/prg");   
      } else {

        if(filename.indexOf('.d64') == -1) {
          filename += ".d64";
        }


        var d64 = new D64();
        d64.diskName = args.diskName;
        d64.addFile(args.prgName, output, "prg");

        d64.createD64(filename);
      }


    }


    return {
      blocks: blocks
    };


  }
}
