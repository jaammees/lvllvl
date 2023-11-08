var MOS6502Opcodes = function() {
  this.searchTerm = false;
  this.prefix = 'dev';
}

MOS6502Opcodes.prototype = {
  init: function(editor, prefix) {
    this.editor = editor;

    if(typeof prefix != 'undefine') {
      this.prefix = prefix;
    }
  },

  buildInterface: function(parentPanel) {
    var _this = this;

    UI.on('ready', function() {
      var html = '';
      
      html += '<div style="padding: 4px" class="panelFill" id="' + _this.prefix + 'mos6502OpcodeDictionary">';
      html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 40px">';
      html += '  <input name="mos6502OpcodeSearch" id="' + _this.prefix + 'mos6502OpcodeSearch" class="assemblerDocsSearch" placeholder="Search For..." size="40">';
      html += '</div>';
    
      html += '<div id="' + _this.prefix + 'mos6502OpcodeInfo" class="assemblerDocsInfo" style="position: absolute; top: 40px; left: 0; right: 0; bottom: 0;">';
      html += 'opcode info opcode info';
      html += '</div>';
    
      html += '</div>';

      this.uiComponent = UI.create("UI.HTMLPanel", { "id": _this.prefix + "mos6502OpcodesPanel", "html": html });
      parentPanel.add(this.uiComponent)
      _this.initEvents();

      /*
      this.uiComponent.load('html/assemblerUtils/mos6502Opcodes.html', function() {
        
      });
      */
    });
  },

  initEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'mos6502OpcodeSearch').on('keyup', function() {
      var value = $(this).val();
      _this.setSearchTerm(value);
    });
    $('#' + this.prefix + 'mos6502OpcodeSearch').on('change', function() {
      var value = $(this).val();
      _this.setSearchTerm(value);
    });

    $('#' + this.prefix + 'mos6502OpcodeSearch').on('focus', function() {
      g_app.setAllowKeyShortcuts(false);
      UI.setAllowBrowserEditOperations(true);
    });

    $('#' + this.prefix + 'mos6502OpcodeSearch').on('blur', function() {
      g_app.setAllowKeyShortcuts(true);
      UI.setAllowBrowserEditOperations(false);
    });


    $('#' + this.prefix + 'mos6502OpcodeInfo').on('click', '.mos6502CommandLink', function(e) {
      var cmd = $(this).attr('data-cmd');

      var section = $(this).attr('data-section');
      var index = $(this).attr('data-index');
    
      $('#' + _this.prefix + 'mos6502OpcodeSearch').val(cmd);
      
      if(typeof section == 'undefined' || typeof index == 'undefined') {
        console.log('set search term: ' + cmd);
        _this.setSearchTerm(cmd);
      } else {
        _this.setSearchResult(section, index);
      }

      e.preventDefault();

    });

    $('#' + this.prefix + 'mos6502OpcodeInfo').on('click', '.docs-link', function(e) {
      var cmd = $(this).attr('data-term');
      var section = $(this).attr('data-section');
      var index = $(this).attr('data-index');
    
      $('#' + _this.prefix + 'mos6502OpcodeSearch').val(cmd);
      
      if(typeof section == 'undefined' || typeof index == 'undefined') {        
        _this.setSearchTerm(cmd);
      } else {
        _this.setSearchResult(section, index);
      }

      e.preventDefault();
    });


    $('#' + this.prefix + 'mos6502OpcodeInfo').on('click', '#' + this.prefix + 'gotoAllInstructions', function() {
      $('' + _this.prefix + '#mos6502OpcodeSearch').val('');
      _this.setSearchTerm('', true);
    });


    $('.mos6502Related').on('click', '.mos6502CommandLink', function() {
      var cmd = $(this).attr('data-cmd');
    
      $('#' + _this.prefix + 'mos6502OpcodeSearch').val(cmd);
      
      _this.setSearchTerm(cmd);
    });


    this.setSearchTerm('');
  },

  setSearchResult: function(section, index) {
    console.log('show: ' + section + ':' + index);
    var html = false;

    if(section == 'ioregisters') {

      html = this.editor.c64MemoryMap.getResultHTML(section, index);
    }

    if(section == '6510instr') {
      html = this.showCmd(index);
    }

    if(html !== false) {
      html = '<div id="' + this.prefix + 'gotoAllInstructions" class="mos6502OpcodeLink">&lt; All Instructions</div>' + html;

      $('#' + this.prefix + 'mos6502OpcodeInfo').html(html);

    }
  },

  setSearchTerm: function(value, forceRefresh) {  
    var searchTerm =  value.trim().toUpperCase();
    if(searchTerm === this.searchTerm && (typeof forceRefresh == 'undefined' || forceRefresh == false)) {
      // no change
      return;
    } 
    this.searchTerm = searchTerm;

    this.foundOpcodes = [];
    this.foundCmds = [];
    
    // is the search term a hex number?

    if(value.length == 2) {
      var opcode = parseInt(value, 16);
      if(isNaN(opcode)) {
        opcode = false;
      } 
    }

    var searchOpcode = '';
    if(opcode !== false) {
      for(var i = 0; i < MOS6510Opcodes.length; i++) {
        if(MOS6510Opcodes[i].opcode == opcode) {
          searchOpcode = MOS6510Opcodes[i].cmd;
        }
      }
    }

    for(var i = 0; i < MOS6510OpcodeCmds.length; i++) {
      if(typeof MOS6510OpcodeCmds[i].cmd !== 'undefined' && MOS6510OpcodeCmds[i].cmd !== '???') {      
        var cmd = MOS6510OpcodeCmds[i].cmd;
        MOS6510OpcodeCmds[i].index = i;
        if(cmd.indexOf(this.searchTerm) === 0 || MOS6510OpcodeCmds[i].cmd === searchOpcode) {
          if(this.foundCmds.indexOf(i) === -1) {
            this.foundCmds.push(i);
          }
        }
      }
    }

    var memoryResults = [];
    
    if(typeof this.editor.c64MemoryMap != 'undefined') {
      memoryResults = this.editor.c64MemoryMap.setSearchTerm(value);
    }

    var html = '';

    if(this.foundCmds.length > 1 || memoryResults.length > 1) {
      html += '<h3>Opcodes</h3>';
      html += this.showCmds(this.foundCmds);
    } else if(this.foundCmds.length == 1) {
      html += '<div id="' + this.prefix + 'gotoAllInstructions" class="mos6502OpcodeLink">&lt; All Instructions</div>'
      html += this.showCmd(this.foundCmds[0]);
    }

    if(memoryResults.length > 0) {
      html += this.editor.c64MemoryMap.getResultsHTML(memoryResults);
    }


    $('#' + this.prefix + 'mos6502OpcodeInfo').html(html);

  },

  showCmds: function(cmdArray) {
    var html = '';

    cmdArray.sort(function(a, b){
      return MOS6510OpcodeCmds[a].cmd.localeCompare(MOS6510OpcodeCmds[b].cmd);
    });

    for(var i =0 ; i < cmdArray.length; i++) {
      var cmd = MOS6510OpcodeCmds[cmdArray[i]].cmd;
      var name = MOS6510OpcodeCmds[cmdArray[i]].name;
      var index = cmdArray[i];

      html += '<span class="opcode-holder">';
      html += '<div class="opcode-link mos6502CommandLink" title="' +  name + '" data-cmd="' + cmd + '" data-index="' + index + '" data-section="6510instr">' + cmd + '</div>';
      html += '</span>';
    }

    return html;
  },


// https://www.c64-wiki.com/wiki/LDA
  showCmd: function(cmdIndex) {

    cmd = MOS6510OpcodeCmds[cmdIndex].cmd;
    var name = '';
    var description = '';
    var flags = '';
    var allFlags = [
      'N',
      'V',
      '-',
      'B',
      'D',
      'I',
      'Z',
      'C'
    ];
    var flagInfo = {};

    for(var i = 0; i < MOS6510OpcodeCmds.length; i++) {
      if(MOS6510OpcodeCmds[i].cmd == cmd) {
        name = MOS6510OpcodeCmds[i].name;
        description = MOS6510OpcodeCmds[i].desc;
        flags = MOS6510OpcodeCmds[i].flags;
        if(typeof MOS6510OpcodeCmds[i].flagInfo != 'undefined') {
          flagInfo = MOS6510OpcodeCmds[i].flagInfo;
        }
        break;
      }
    }

    var flagsString = '';
    var flagInfoString = '';
    for(var i = 0; i < allFlags.length; i++) {
      if(flags.indexOf(allFlags[i]) !== -1) {
        flagsString += allFlags[i];
      } else {
        flagsString += '-';
      }

      if(typeof flagInfo[allFlags[i]] !== 'undefined') {
        flagInfoString += '<tr>';
        flagInfoString += '<th>' + allFlags[i] + '</th>';
        flagInfoString += '<td>' + flagInfo[allFlags[i]] + '</td>';
        flagInfoString == '</tr>';
      }
    }

    


    var html = '';

//    html += '<div id="gotoAllInstructions" class="mos6502OpcodeLink">&lt; All Instructions</div>'

    html += '<h2>' + cmd + '</h2>';

    html += '<div class="mos6502Name">' + name + '</div>';

    html += '<div style="position: absolute; top: 80px; left: 0; right: 0; bottom: 0; overflow: auto; padding: 0 8px 8px 8px">';

    html += '<div class="mos6502Description">' + description + '</div>';

    html += '<div class="mos6502Flags">';
    html += '<h3>Flags</h3> ';
    html += '<div class="mos6502FlagList">' + flagsString + '</div>';
    

    if(flagInfoString != '') {
      html += '<div class="mos6502FlagInfo">';
      html += '<table>';
      html += flagInfoString;
      html += '</table>';
      html += '</div>';
    }

    html += '</div>';


    html += '<h3>Addressing Modes</h3>';
    html += '<table class="addressingModeTable">';
    html += '<tr>';
    html += '<th>Opcode</th>';
    html += '<th>Format</th>';
    html += '<th>Mode</th>';
    html += '<th>Bytes</th>';
    html += '<th>Cycles</th>';

    html += '</tr>';

    var cycleNoteFlags = 0;

    for(var i = 0; i < MOS6510Opcodes.length; i++) {
      if(MOS6510Opcodes[i].cmd == cmd) {
        var opcode = MOS6510Opcodes[i];
        var hexOpcode = opcode.opcode;
        var example = opcode.example;

        var addressingString = '';
        switch(opcode.addressing) {
          case MOS6510AddressingModes.IMMED: /* Immediate */
            addressingString = 'Immediate';
            break;
          case MOS6510AddressingModes.ABSOL: /* Absolute */
            addressingString = 'Absolute';
            break;
          case MOS6510AddressingModes.ZEROP: /* Zero Page */
            addressingString = 'Zero Page';
            break;
          case MOS6510AddressingModes.IMPLI: /* Implied */
            addressingString = 'Implied';
            break;
          case MOS6510AddressingModes.INDIA: /* Indirect Absolute */
            addressingString = 'Indirect Absolute';
            break;
          case MOS6510AddressingModes.ABSIX: /* Absolute indexed with X */
            addressingString = 'Absolute indexed with X';
            break;
          case MOS6510AddressingModes.ABSIY: /* Absolute indexed with Y */
            addressingString = 'Absolute indexed with Y';
            break;
          case MOS6510AddressingModes.ZEPIX: /* Zero page indexed with X */
            addressingString = 'Zero Page indexed with X';
            break;
          case MOS6510AddressingModes.ZEPIY: /* Zero page indexed with Y */
            addressingString = 'Zero Page Indexed with Y';
            break;
          case MOS6510AddressingModes.INDIN: /* Indexed indirect (with X) */
            addressingString = 'Indexed Indirect (with X)';
            break;
          case MOS6510AddressingModes.ININD: /* Indirect indexed (with Y) */
            addressingString = 'Indirect indexed (with Y)';
            break;
          case MOS6510AddressingModes.RELAT: /* Relative */
            addressingString = 'Relative';
            break;
          case MOS6510AddressingModes.ACCUM: /* Accumulator */  
            addressingString = 'Accumulator';
            break;
        }
// NV-BDIZC
        
        hexOpcode = ("00" + hexOpcode.toString(16)).substr(-2);
        html += '<tr>';
        html += '<td class="addressingModeNumber">0x' + hexOpcode + '</td>';
        html += '<td class="addressingModeExample">' + example + '</td>';

        html += '<td>' + addressingString + '</td>';

        html += '<td class="addressingModeNumber">' + opcode.bytes + '</td>';
        html += '<td class="addressingModeNumber">' + opcode.cycles;

        if(typeof opcode.cycleextra != 'undefined') {
          cycleNoteFlags |= opcode.cycleextra;
          html += '*';
        }

        html += '</td>';
        html += '</tr>';
      }
    }

    html += '</table>';

    if(cycleNoteFlags != 0) {
      html += '<div style="display:inline-block; width: 10px; vertical-align: top">*</div>';

      html += '<div style="display: inline-block">';
      if(cycleNoteFlags & MOS6510Cycles.CYCLES_CROSS_PAGE_ADDS_ONE) {
        html += '<div>1 cycle added if page boundary crossed</div>';
      } 
      
      if(cycleNoteFlags & MOS6510Cycles.CYCLES_BRANCH_TAKEN_ADDS_ONE) {
        html += '<div>1 cycle added if branch taken</div>';
      }
      html += '</div>';
    }

    /*
    html += '<div class="mos6502Related">';
    html += '<h3>Related</h3>';

    for(var i = 0; i < MOS6510OpcodeCmds.length; i++) {
      if(MOS6510OpcodeCmds[i].flags.indexOf('Z') !== -1) {        
        html += '<div class="opcode-link mos6502CommandLink" title="' +  MOS6510OpcodeCmds[i].name + '" data-cmd="' + MOS6510OpcodeCmds[i].cmd + '">' + MOS6510OpcodeCmds[i].cmd + '</div>';
      }
    }
    html += '</div>';
    */

    html += '</div>';

    return html;
  }
}
