

MOS6520_AddressingModes = {};

MOS6520_AddressingModes.IMMED = 0; /* Immediate */
MOS6520_AddressingModes.ABSOL = 1; /* Absolute */
MOS6520_AddressingModes.ZEROP = 2; /* Zero Page */
MOS6520_AddressingModes.IMPLI = 3; /* Implied */
MOS6520_AddressingModes.INDIA = 4; /* Indirect Absolute */
MOS6520_AddressingModes.ABSIX = 5; /* Absolute indexed with X */
MOS6520_AddressingModes.ABSIY = 6; /* Absolute indexed with Y */
MOS6520_AddressingModes.ZEPIX = 7; /* Zero page indexed with X */
MOS6520_AddressingModes.ZEPIY = 8; /* Zero page indexed with Y */
MOS6520_AddressingModes.INDIN = 9; /* Indexed indirect (with X) */
MOS6520_AddressingModes.ININD = 10; /* Indirect indexed (with Y) */
MOS6520_AddressingModes.RELAT = 11; /* Relative */
MOS6520_AddressingModes.ACCUM = 12; /* Accumulator */  


var DbgDisassembly = function() {

  this.debugger = null;
  this.fontCanvas = null;
  this.fontCanvasColors = [];
  this.fontCharWidth = 10;
  this.fontCharHeight = 16;

  this.hexNumberCanvas = null;
  this.hexNumberPositions = [];

  this.cmdCanvas = null;
  this.cmdPositions = [];

  this.scrollCanvas = null;
  this.machine = null;
  this.lines = [];
  
  this.paramCounts = [];

  this.breakpointColWidth = 10;

  this.cmdPositionX = 100;
  this.opCodePositionX = 100;
  this.cyclesPositionX = 0;

  this.followPC = true;
  this.disassembleAddress = 0;

  this.visible = true;

  this.prefix = false;

  this.dbgFont = null;

  // map lines to addresses
  this.addressPositions = [];


  this.cursorX = false;
  this.cursorY = false;
  this.cursorWidth = false;
  this.cursorHeight = false;

  this.disassemblyInfo = [];

  this.mouseInCanvas = false;

  this.canWrite = true;
}

DbgDisassembly.prototype = {

  initDisassembly: function(map) {
    this.disassemblyInfo = [];
    var prev = false;
    for(var i = 0; i < 0xffff; i++) {
      this.disassemblyInfo.push({
        label: false,
        bytes: 1,
        cycles: false,
        b: false,
        prev: prev
      });
      prev = i;
    }
  },


  setReport: function(report) {
    
    var html = '';

    this.initDisassembly();

    if(typeof report != 'undefined' && typeof report.sourceMap != 'undefined') {
      for(var i = 0; i < report.sourceMap.length; i++) {
        var address = report.sourceMap[i].address;
        var label = report.sourceMap[i].label;
        this.disassemblyInfo[address].bytes = report.sourceMap[i].byteCount;
        this.disassemblyInfo[address].b = report.sourceMap[i].b;

        if(label) {
          this.disassemblyInfo[address].label = label;
          html += '<option value="' + address + '">';
          html += label;
          html += '</option>';
        }

        if(report.sourceMap[i].byteCount) {
          var nextAddress = address + report.sourceMap[i].byteCount;
          this.disassemblyInfo[nextAddress].prev = address;
        }
      }

      if(typeof report.addressMap != 'undefined') {
        //for(var i = 0; i < report.addressMap.length; i++) {
        for(var addr in report.addressMap) {
          if(report.addressMap.hasOwnProperty(addr)) {
            if(report.addressMap[addr].label !== false) {
              this.disassemblyInfo[addr].label = report.addressMap[addr].label;
            }
          }
        }
      }
    }


    if(html != '') {
      html = '<option value="">Select Label</option>' + html;
      $('#' + this.prefix + 'DebuggerDisassemblyAddressLabels').show();
    } else {
      $('#' + this.prefix + 'DebuggerDisassemblyAddressLabels').hide();
    }

    $('#' + this.prefix + 'DebuggerDisassemblyAddressLabels').html(html);

//console.log(this.disassemblyInfo);

  },


  init: function(args) {

    this.prefix = args.prefix;
    this.machine = args.machine;
    this.debugger = args.debugger;

    if(typeof args.canWrite != 'undefined') {
      this.canWrite = args.canWrite;
    }

    var dbgFont = g_app.dbgFont;
    dbgFont.createFonts();

    this.fontCanvas = dbgFont.fontCanvas;
    this.fontCanvasColors = dbgFont.fontCanvasColors;
    this.hexNumberCanvas = dbgFont.hexNumberCanvas;
    this.cmdCanvas = dbgFont.cmdCanvas;

    this.setFontMetrics();

    this.initDisassembly();
  },


  setFontMetrics: function() {
    var dbgFont = g_app.dbgFont;
    this.fontCharWidth = dbgFont.fontCharWidth;
    this.fontCharHeight = dbgFont.fontCharHeight;
    this.hexNumberPositions = dbgFont.hexNumberPositions;
    this.cmdPositions = dbgFont.cmdPositions;
    this.lineHeight = this.fontCharHeight + 4 * UI.devicePixelRatio;  


    this.cmdPositionX = 23 * this.fontCharWidth;
    this.cyclesPositionX = 19 * this.fontCharWidth;

    this.opCodePositionX = this.breakpointColWidth + this.fontCharWidth * 4 + 20;

  },

  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    var html = '';

    html += '<div style="display: flex">';

    html += '<label class="cb-container">Follow PC'
    html += '<input type="checkbox" checked="checked" id="' + this.prefix + 'DebuggerDisassemblyUsePC">';
    html += '<span class="checkmark"></span>';
    html += '</label>';

//    html += '<label><input type="checkbox" checked="checked" id="' + this.prefix + 'DebuggerDisassemblyUsePC"> Follow PC </label>'

    html += '<div id="' + this.prefix + 'DebuggerDisassemblyAddressHolder" style="display: flex">Show from&nbsp;'
    html += '<input class="number" id="' + this.prefix + 'DebuggerDisassemblyAddress" size="4">';
    html += '<select id="' + this.prefix + 'DebuggerDisassemblyAddressLabels" style="display: none">';

    html += '</select>';
    html += '</div>'

    
    html += '</div>';

    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.uiComponent.addSouth(this.controlsPanel, 30, false);



    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + "DisassemblyCanvas"});
    this.uiComponent.add(this.scrollCanvas);

    var _this = this;

    this.totalLines = 1;
    this.contentHeight = this.totalLines * this.lineHeight;

    this.scrollCanvas.setContentHeight(this.contentHeight);

    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.scrollCanvas.mouseWheel = function(event, delta) {
      event.stopPropagation();  
      event.preventDefault();  
  
      var wheel = normalizeWheel(event);
      var factor = 6;
      if(wheel.spinY > 0) {
        _this.scrollDown(wheel.spinY);
      } else {
        _this.scrollUp(wheel.spinY);
      }
    }

    this.scrollCanvas.on('mousedown', function(event) {
      _this.mouseDown(event);  
    });

    this.scrollCanvas.on('mousemove', function(event) {
      _this.mouseMove(event);  
    });

    this.scrollCanvas.on('mouseup', function(event) {
      _this.mouseUp(event);  
    });

    /*
    this.scrollCanvas.addEventListener('wheel', function(event) {
      _this.mouseWheel(event);
    }, false);
    */

    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  setVisible: function(visible) {
    this.visible = visible;
  },

  getVisible: function() {
    return this.visible;
  },

  initEvents: function() {
    var _this = this;

    var canvasScale = this.scrollCanvas.getScale();

    var width = this.fontCharWidth * 2 / canvasScale;
    var height = this.fontCharHeight / canvasScale + 2;
    var font = 'font: 12px \'Courier New\', Courier, monospace;';
    var inputHtml = '<input class="' + this.prefix + 'DebuggerInput" spellcheck="false"  id="' + this.prefix + 'DebuggerDisassemblyInput" type="text" style="' + font + 'position: absolute; top: 30px; left: 30px; border: 0;';
    inputHtml += 'padding: 0; display: none; width: ' + width + 'px; height: ' + height + 'px"/>';

    var scrollCanvas = $('#' + this.scrollCanvas.getElementId());

    
    var parent = scrollCanvas.parent();
    parent.append(inputHtml);

    scrollCanvas.on('mouseenter', function(event) {
      _this.mouseInCanvas = true;
    });

    scrollCanvas.on('mouseleave', function(event) {
      _this.mouseInCanvas = false;
    });

    $('#' + this.prefix + 'DebuggerDisassemblyInput').on('focus', function() {    
      _this.debugger.blurMachine();
    });
    $('#' + this.prefix + 'DebuggerDisassemblyInput').on('blur', function() {

      _this.assembleEditLine();
      $(this).hide();
      _this.debugger.focusMachine();
    });

    $('#' + this.prefix + 'DebuggerDisassemblyAddress').on('focus', function() {
      _this.debugger.blurMachine();
    });

    $('#' + this.prefix + 'DebuggerDisassemblyAddress').on('blur', function() {
      _this.debugger.focusMachine();
    });
    
    $('#' + this.prefix + 'DebuggerDisassemblyInput').on('keydown', function(event) {

      if(event.keyCode == 13 || event.keyCode == 9) {
        event.preventDefault();
      }

    });

    $('#' + this.prefix + 'DebuggerDisassemblyInput').on('keypress', function(event) {
      if(event.keyCode == 13 || event.keyCode == 9) {
        event.preventDefault();
      }
    });

    $('#' + this.prefix + 'DebuggerDisassemblyInput').on('keyup', function(event) {

      if(_this.cmdEditAddress !== false) {
        _this.cmdEditKeyUp(event);
      }

      if(_this.hexEditAddress !== false) {
        _this.hexEditKeyUp(event);
      }
    });

    $('#' + this.prefix + 'DebuggerDisassemblyUsePC').on('click', function(event) {
      console.log('click follow pc');

      _this.followPC = $(this).is(':checked');
      if(_this.followPC) {
        $('#' + this.prefix + 'DebuggerDisassemblyAddressHolder').hide();
      } else {
        var address = _this.debugger.getPC();
        _this.disassembleAddress = address;
        address =("0000" + address.toString(16)).substr(-4);   
        $('#' + _this.prefix + 'DebuggerDisassemblyAddress').val(address);
        $('#' + _this.prefix + 'DebuggerDisassemblyAddressHolder').show();
        $('#' + _this.prefix + 'DebuggerDisassemblyAddress').focus();
        $('#' + _this.prefix + 'DebuggerDisassemblyAddress').select();

      }
    });

    $('#' + this.prefix + 'DebuggerDisassemblyAddress').on('keyup', function(event) {
      var value = $(this).val();
      value = parseInt(value, 16);

      if(!isNaN(value)) {
        _this.setDisassembleAddress(value);
      }
    });


    $('#'  + this.prefix + 'DebuggerDisassemblyAddressLabels').on('change', function() {
      var value = $(this).val();
      if(value == '') {
        return;
      }

      value = parseInt(value, 10);
      _this.disassembleAddress = value;
      var address =("0000" + value.toString(16)).substr(-4);   

      $('#' + _this.prefix + 'DebuggerDisassemblyAddress').val(address);

    });

//    var canvasScale = this.scrollCanvas.getScale();
    //this.cmdPositionX = 200 * canvasScale;
//    this.opCodePositionX = this.breakpointColWidth + 7 * this.fontCharWidth;

    this.breakpointColWidth = 20 * canvasScale;

    this.cmdPositionX = 23 * this.fontCharWidth;
    this.cyclesPositionX = 19 * this.fontCharWidth;

    this.opCodePositionX = this.breakpointColWidth + this.fontCharWidth * 4 + 20;

  },

  setDisassembleAddress: function(address) {
    if(this.followPC) {
      this.followPC = false;
      $('#' + this.prefix + 'DebuggerDisassemblyUsePC').prop('checked', false);
    }
    this.disassembleAddress = address;
  },

  disableFollowPC: function() {
    this.followPC = false;
    $('#' + this.prefix + 'DebuggerDisassemblyUsePC').prop('checked', false);
    var address = this.debugger.getPC();
    this.disassembleAddress = address;
    address =("0000" + address.toString(16)).substr(-4);   
    $('#' + this.prefix + 'DebuggerDisassemblyAddress').val(address);
    $('#' + this.prefix + 'DebuggerDisassemblyAddressHolder').show();
    $('#' + this.prefix + 'DebuggerDisassemblyAddress').focus();
    $('#' + this.prefix + 'DebuggerDisassemblyAddress').select();

  },

  scrollDown: function(amount) {
    if(this.followPC) {
      this.disableFollowPC();
    }

    if(this.disassembleAddress !== false) {
      this.disassembleAddress = this.disassembleAddress + this.disassemblyInfo[this.disassembleAddress].bytes;
    } else {
      this.disassembleAddress = 0;
    }
    var address =("0000" + this.disassembleAddress.toString(16)).substr(-4);   
    $('#' + this.prefix + 'DebuggerDisassemblyAddress').val(address);

  },

  scrollUp: function(amount) {
    if(this.followPC) {
      this.disableFollowPC();
    }

      // go backwards
//      for(var i = 0; i < goBack; i++) {
    var newAddress = 0;
    if(this.disassembleAddress !== false) {
      newAddress = this.disassemblyInfo[this.disassembleAddress].prev;
    } else {
      this.disassembleAddress = 0;
    }
//      }


    this.disassembleAddress = newAddress;

    var address =("0000" + this.disassembleAddress.toString(16)).substr(-4);   
    $('#' + this.prefix + 'DebuggerDisassemblyAddress').val(address);


  },

  cmdEditKeyUp: function(event) {
    if(event.keyCode == 38 || (event.keyCode == 9 && event.shiftKey) ) {
      // up
      event.preventDefault();
      this.moveEditLine(-1);
    }
    if(event.keyCode == 40 || (event.keyCode == 9 && !event.shiftKey)) {
      // down
      event.preventDefault();
      this.moveEditLine(1);

    }
    if(event.keyCode == 13) {
      event.preventDefault();
      this.assembleEditLine({ gotoNext: true });
    } else {
      this.checkEditLine();
    }
  },

  hexEditKeyUp: function(event) {
    var value = $('#' + this.prefix + 'DebuggerDisassemblyInput').val();
    value = parseInt(value, 16);

    /*
    if(event.keyCode == 38 || (event.keyCode == 9 && event.shiftKey) ) {
      // up
      event.preventDefault();
//      this.moveEditLine(-1);
    }
    if(event.keyCode == 40 || (event.keyCode == 9 && !event.shiftKey)) {
      // down
      event.preventDefault();
//      this.moveEditLine(1);
    }
*/

    if(event.keyCode == 13 || (event.keyCode == 9 && !event.shiftKey)) {
      if(!isNaN(value)) {
        this.setHexFromInput(value);
        this.editHex(this.hexEditAddress + 1);
      }
      event.preventDefault();
    }
  },


  setHexFromInput: function(value) {
    /*
    var cpu = this.machine.getCPU();
    cpu.cpuWrite(this.hexEditAddress, value);
    */
   this.debugger.writeByte(this.hexEditAddress, value);
  },



  mouseDown: function(event) {
    var scrollCanvas = this.scrollCanvas;

    var id = scrollCanvas.getElementId();
    var canvasScale = scrollCanvas.getScale();
    var scrollY = scrollCanvas.getScrollY();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;
    var line = Math.floor(y / this.lineHeight);

    // mouse down on an address, toggle a breakpoint
    if(line < this.addressPositions.length && line >= 0) {
      if(x < this.breakpointColWidth + 4 * this.fontCharWidth && x > 0) {

        var clickAddress = this.addressPositions[line];
        var breakpoints = this.debugger.getPCBreakpoints();

        for(var i = 0; i < breakpoints.length; i++) {
          if(breakpoints[i].address === clickAddress) {
            var enabled = breakpoints[i].enabled;
            if(enabled) {
              this.debugger.setPCBreakpointEnabled({ address: clickAddress, enabled: !enabled });
            } else {
              this.debugger.removePCBreakpoint({ address: clickAddress });
            }
            this.debugger.breakpoints.drawBreakpoints();

            return;
          }
        }

        this.debugger.addPCBreakpoint({ address: clickAddress });
        this.debugger.breakpoints.drawBreakpoints();
      }
    }  
  },

  mouseMove: function(event) {
    var scrollCanvas = this.scrollCanvas;

    var id = scrollCanvas.getElementId();
    var canvasScale = scrollCanvas.getScale();
    var scrollY = scrollCanvas.getScrollY();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

    if(!this.canWrite) {
      return;
    }

    // work out if mouse is over something...
    // if cursorX is false, dont draw the cursor
    this.cursorX = false;
    var line = Math.floor(y / this.lineHeight);
    this.cursorY = line * this.lineHeight;
    this.cursorHeight = this.fontCharHeight;

    if(line < this.addressPositions.length && line >= 0) {
      var address = this.addressPositions[line];
      var paramCount = this.paramCounts[line];

      // is the click on an opcode
      if(x > this.opCodePositionX && x < this.cmdPositionX) {
        x = x - this.opCodePositionX;

        this.cursorWidth = 2 * this.fontCharWidth;
        this.cursorHeight = this.fontCharHeight;
        this.cursorY = line * this.lineHeight;

        if(x > 0 && x < this.fontCharWidth * 2) {
          this.cursorX = this.opCodePositionX;
        }

        if(x > this.fontCharWidth * 3 && x < this.fontCharWidth * 5) {
          if(paramCount > 0) {
            this.cursorX = this.opCodePositionX + this.fontCharWidth * 3;
          }
        }

        if(x > this.fontCharWidth * 6 && x < this.fontCharWidth * 8) {
          if(paramCount > 1) {
            this.cursorX = this.opCodePositionX + this.fontCharWidth * 6;
          }         
        }
      }

      if(x > this.cmdPositionX) {
        this.cursorX = this.cmdPositionX;
        this.cursorWidth = this.fontCharWidth * 23;
      }
    }


  },

  mouseUp: function(event) {
    var scrollCanvas = this.scrollCanvas;

    var id = scrollCanvas.getElementId();
    var canvasScale = scrollCanvas.getScale();
    var scrollY = scrollCanvas.getScrollY();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

    if(!this.canWrite) {
      return;
    }

    
    var line = Math.floor(y / this.lineHeight);
    if(line < this.addressPositions.length && line >= 0) {
      var address = this.addressPositions[line];
      var paramCount = this.paramCounts[line];

      // is the click on an opcode
      if(x > this.opCodePositionX && x < this.cmdPositionX) {
        x = x - this.opCodePositionX;

        if(x > 0 && x < this.fontCharWidth * 2) {
          this.editHex(address, 0);
        }

        if(x > this.fontCharWidth * 3 && x < this.fontCharWidth * 5) {
          if(paramCount > 0) {
            this.editHex(address + 1);
          }
        }

        if(x > this.fontCharWidth * 6 && x < this.fontCharWidth * 8) {
          if(paramCount > 1) {
            this.editHex(address + 2);
          }
          
        }

      }

      if(x > this.cmdPositionX) {
        this.editCmd(address);
      }
    }

  },


  getCmd: function(address) {
//    var cpu = this.machine.getCPU();
//    var cpu = this.machine.getDriveCPU();

    // fetching the next op code in cpu will sent the program counter past the current pc
    var programCounter = address;

//    var opcode = (cpu.cpuRead(programCounter) & 0xff);
    var opcode = this.debugger.readByte(programCounter) & 0xff;

    var opcoderecord = MOS6510Opcodes[opcode]
    var opcodeCmd = '';
    var byteCount = 0;
    var addressing = 0;
    if(typeof opcoderecord != 'undefined') {
      opcodeCmd = opcoderecord.cmd;
      byteCount = opcoderecord.bytes;
      addressing = opcoderecord.addressing;
    } else {
      console.log('unknown opcode: ' + opcode);
    }

    /*
    var param = (cpu.cpuRead(programCounter + 1) & 0xff);
    var param2 = (cpu.cpuRead(programCounter + 2) & 0xff);
    */
   var param = (this.debugger.readByte(programCounter + 1) & 0xff);
   var param2 = (this.debugger.readByte(programCounter + 2) & 0xff);

    param =  ("00" + param.toString(16)).substr(-2);      
    param2 =  ("00" + param2.toString(16)).substr(-2);      

    var paramCount = byteCount - 1;

    var line = '';

    line += opcodeCmd;

    if(paramCount == 2) {
      line += ' ';

      if(addressing == MOS6520_AddressingModes.INDIA) {
        line += '(';
      }
      line += '$';
      
      line +=  param2;
      line += param;
      if(addressing == MOS6520_AddressingModes.ABSIX) {
        line += ',X';
      }
      if(addressing == MOS6520_AddressingModes.INDIA) {
        line += ')';
      }
      if(addressing == MOS6520_AddressingModes.ABSIY) {
        line += ',Y';
      }

    }

    if(paramCount == 1) {
      line += ' ';
      if(addressing == MOS6520_AddressingModes.IMMED) {
        line += '#';
      }
      if(addressing == MOS6520_AddressingModes.RELAT) {
        //console.log('pc: ' + pc + ',param: ' + param);
        //console.log('program counter = ' + programCounter);

        var e1 = programCounter;
        var e2 = parseInt(param, 16);
        if(e2 > 127) {
          e2 = e2 - 256;
        }
        var e3 = e1 + e2 + 2;
        var e4 =("0000" + e3.toString(16)).substr(-4);   
        //console.log(e1 + ',' + e2 + ',' + e3 + ',' + e4);
        //param = parseInt(pc, 16) + parseInt(param);
        param = e4;  
      }

      if(addressing == MOS6520_AddressingModes.ININD) {
        line += '(';
      }

      line += '$' + param;
      if(addressing == MOS6520_AddressingModes.ININD) {
        line += '),Y';
      }

      
      if(addressing == MOS6520_AddressingModes.ABSIX 
          || addressing == MOS6520_AddressingModes.ZEPIX) {
        line += ',X';
      }
    } 

    return line;
  },

  moveEditLine: function(direction) {
    // get the current line
    var line = false;
    for(var i = 0; i < this.addressPositions.length; i++) {
      if(this.addressPositions[i] == this.cmdEditAddress) {
        line = i;
        break;
      }
    }


    if(line !== false) {
      var newAddress = this.cmdEditAddress;
      while(newLine >= 0 && this.cmdEditAddress === newAddress && newLine < this.addressPositions.length) {
        var newLine = line + direction;
        newAddress = this.addressPositions[newLine];
      }

      this.editCmd(newAddress);

    }
  },

  setCursorHex: function(address) {

  },

  editHex: function(address) {

    this.hexEditAddress = address;
    this.cmdEditAddress = false;
//    var cpu = this.machine.getCPU();
    var value = this.debugger.readByte(address);

    value = ("00" + value.toString(16)).substr(-2);  

    $('#' + this.prefix + 'DebuggerDisassemblyInput').val(value);
    this.setInputPosition();

    $('#' + this.prefix + 'DebuggerDisassemblyInput').css('background-color', '#ffffff');
    $('#' + this.prefix + 'DebuggerDisassemblyInput').focus();
    $('#' + this.prefix + 'DebuggerDisassemblyInput').select();
  },

  editCmd: function(address) {

    this.cmdEditAddress = address;
    this.hexEditAddress = false;

    var value = this.getCmd(address);

    $('#' + this.prefix + 'DebuggerDisassemblyInput').val(value);
    this.setInputPosition();

    $('#' + this.prefix + 'DebuggerDisassemblyInput').css('background-color', '#ffffff');
    $('#' + this.prefix + 'DebuggerDisassemblyInput').focus();
    $('#' + this.prefix + 'DebuggerDisassemblyInput').select();
  },

  checkEditLine: function() {
    var address = this.cmdEditAddress;
    var cmd = $('#' + this.prefix + 'DebuggerDisassemblyInput').val();
    var result = g_app.assembler.assembleLine(cmd, this.cmdEditAddress);
    if(!result.success) {
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('background-color', '#ffcccc');
    } else {
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('background-color', '#ffffff');
    }
  },

  assembleEditLine: function(args) {
    var gotoNext = false;
    var address = this.cmdEditAddress;
    var cmd = $('#' + this.prefix + 'DebuggerDisassemblyInput').val();

    if(typeof args != 'undefined') {
      if(typeof args.gotoNext != 'undefined') {
        gotoNext = args.gotoNext;
      }
    }

    var result = g_app.assembler.assembleLine(cmd, this.cmdEditAddress);

    if(result.success) {
      //var cpu = this.machine.getCPU();
//      var cpu = this.machine.getDriveCPU();
      for(var i = 0; i < result.bytes.length; i++) {
        this.debugger.writeByte(address++, result.bytes[i]);
      }

      if(gotoNext) {
        this.editCmd(address);
      }
    } else {
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('background-color', '#ffcccc');
 
    }

  },




  getLabel: function(address) {
    if(address < this.disassemblyInfo.length) {
      return this.disassemblyInfo[address].label;
    }
    return false;
  },

  setInputPosition: function() {
    var scrollY = this.scrollCanvas.getScrollY();   
    var canvasScale = this.scrollCanvas.getScale(); 

    var line = false;
    var lineOffset = 0;

    if(this.hexEditAddress !== false || this.cmdEditAddress !== false) {
      var findAddress = this.hexEditAddress;
      if(findAddress === false) {
        findAddress = this.cmdEditAddress;
      }

      // need to draw first to get all the lines..
      this.draw(this.scrollCanvas.getContext());

      // get the line
      var line = false;
      for(var i =0; i < this.addressPositions.length; i++) {
        if(this.addressPositions[i] === findAddress) {
          // need to skip past labels
          while(i < this.addressPositions.length && this.addressPositions[i] == findAddress) {
            line = i;
            i++;
          }
          lineOffset = 0;
          break;
        }


        if(this.hexEditAddress !== false) {
          var paramCount = this.paramCounts[i];
          if(paramCount > 0 && this.addressPositions[i] + 1 === findAddress) {
            line = i;
            lineOffset = 1;
            break;
          }
          if(paramCount > 1 && this.addressPositions[i] + 2 === findAddress) {
            line = i;
            lineOffset = 2;
            break;
          }
        }

      }


      if(line === false) {
        return;
      }
    }

    if(this.hexEditAddress !== false) {
      var pos = { x: this.opCodePositionX + lineOffset * 3 * this.fontCharWidth, y: line * this.lineHeight };
      var left = pos.x / canvasScale;
      var top = (pos.y - scrollY) / canvasScale;
      var width = 2 * this.fontCharWidth / canvasScale;

      $('#' + this.prefix + 'DebuggerDisassemblyInput').show();
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('width', width + 'px');
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('left', left);
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('top', top + 'px');

    }
    if(this.cmdEditAddress !== false) {
      var pos = { x: this.cmdPositionX, y: line * this.lineHeight };
      var left = pos.x / canvasScale;
      var top = (pos.y - scrollY) / canvasScale;

      $('#' + this.prefix + 'DebuggerDisassemblyInput').show();
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('width', '180px');
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('left', left);
      $('#' + this.prefix + 'DebuggerDisassemblyInput').css('top', top + 'px');

    }
  },

  forceRedraw:function() {
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    this.lastWidth = false;
    this.lastHeight = false;  
    this.visible = true;  
  },

  
  draw: function(context) {

    this.setFontMetrics();
    
    var scrollCanvas = this.scrollCanvas;
    var canvasScale = scrollCanvas.getScale();

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();

    var scrollY = scrollCanvas.getScrollY();

    var pc = this.debugger.getPC();
    var breakpoints = this.debugger.getPCBreakpoints();

    context.fillStyle= '#000000';
    context.fillRect(0, 0, width, height);
    context.fillStyle= '#444444';

    var colorIndex = 1;

    var charWidth = this.fontCharWidth;
    var charHeight = this.fontCharHeight;

    var opcodeCmd = '';
    
    var srcX = 0;
    var srcY = 0;
    var srcWidth = charWidth;
    var srcHeight = charHeight;
    var dstX = 0;
    var dstY = 0;
    var dstWidth = charWidth;
    var dstHeight = charHeight;
    var c = 0;


    var lineCount = Math.ceil(height / this.lineHeight) + 1;

    var position = false;

    // breakpoint dimensions
    var breakpointRadius = 4 * canvasScale;
    var breakpointCount = breakpoints.length;
    var breakpointIndentX = 4 * canvasScale;
    var breakpointIndentY = 1 * canvasScale;


    // work out where to start displaying..
    var showBack = Math.floor(lineCount / 4);
    var goBack = Math.floor(showBack * 2);

    var showAddress = pc;

    if(!this.followPC) {
      showAddress = this.disassembleAddress;
    }

    var programCounter = showAddress;
    
    //else {
    {


      // go backwards
      for(var i = 0; i < goBack; i++) {
        if(programCounter !== false && typeof this.disassemblyInfo[programCounter] != 'undefined') {
          programCounter = this.disassemblyInfo[programCounter].prev;
        }
        if(programCounter === false) {
          goBack = i;
          programCounter = 0;
          break;
        }
      }


      // need to go forward to work out the offset
      var lines = 0;
      for(var i = 0; i < goBack + 5; i++) {       
        var label = this.getLabel(programCounter);// false;// this.machine.getLabel(programCounter);
        if(label != false) {
          lines++;
        }

        var opcode = this.debugger.readByte(programCounter) & 0xff;
        var opcoderecord = MOS6510Opcodes[opcode];

        var cycles = this.debugger.getCycleCount(programCounter);// this.machine.getCycles(programCounter);
        var byteCount = 1;

        if(cycles > 0) {
          if(typeof opcoderecord != 'undefined') {
            opcodeCmd = opcoderecord.cmd;
            byteCount = opcoderecord.bytes;
            addressing = opcoderecord.addressing;
          } else {
            opcodeCmd = "zz";
            byteCount = 1;
          }          
        } else {
          // check the report
          var reportOpcode = this.disassemblyInfo[programCounter].b;
          if(reportOpcode == opcode) {
            // disassembly has the same byte
            byteCount = this.disassemblyInfo[programCounter].bytes;
          }          
        }
        
        var paramCount = byteCount - 1;

        programCounter += 1 + paramCount;

        lines++;

        if(showAddress == programCounter) {
          break;
        }
      }

      var label = this.getLabel(programCounter);// false;// this.machine.getLabel(programCounter);
      if(label != false) {
        lines++;
      }

      for(var i = 0; i < goBack; i++) {
        programCounter = this.disassemblyInfo[programCounter].prev;
      }

      dstY = dstY - (lines - showBack) * this.lineHeight;
      lineCount += (lines - showBack);
    }


    // now start drawing..
    this.paramCounts = [];
    this.addressPositions = [];

    var reachedStartAddress = false;
    var previousAddress = false;
    
    for(var i = 0; i < lineCount; i++) {
      colorIndex = 1;

      if(programCounter >=  0xffff) {
        break;
      }

      // is there a label
      var label = this.getLabel(programCounter);// false;// this.machine.getLabel(programCounter);
      if(label !== false) {
        // draw the label
        var lineLength = label.length;
        dstX += this.breakpointColWidth;

        if(dstY >= 0) {
          for(var j = 0; j < lineLength; j++) {
            var c = label.charCodeAt(j);

            srcX = c * charWidth;
            srcY = 0;
            srcWidth = charWidth;
            srcHeight = charHeight;
            dstWidth = charWidth;
            dstHeight = charHeight;

//            context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
            context.drawImage(this.fontCanvasColors[0], srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
            dstX += charWidth;

          }

          this.addressPositions.push(programCounter);
          this.paramCounts.push(0);
  
        }

        // new line        
        dstY += this.lineHeight * 1;
      }


      dstX = 0;

      // if there is a breakpoint on this line, draw it

      if(dstY >= 0) {
        for(var j = 0; j < breakpointCount; j++) {
          if(breakpoints[j].address == programCounter) {
            context.fillStyle = "#ff0000";
            context.strokeStyle = "#ff0000";
            context.lineWidth = 2;
            context.beginPath();
            context.arc(dstX + breakpointIndentX + breakpointRadius, 
              dstY + breakpointIndentY +  breakpointRadius, 
              breakpointRadius, 0, 2 * Math.PI);

            if(breakpoints[j].enabled) {
              context.fill();          
            } else {
              context.stroke();          
            }
          }
        }
      }

      dstX = this.breakpointColWidth;

      // draw the address
      var addressHigh = (programCounter >> 8) & 0xff;
      var addressLow = (programCounter) & 0xff;

      position = this.hexNumberPositions[addressHigh];
      srcX = position.x;
      srcY = position.y;

      if(dstY >= 0) {
        context.globalAlpha = 0.5;
        context.drawImage(this.hexNumberCanvas[0], 
          srcX, 
          srcY, 
          srcWidth * 2, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth * 2, 
          dstHeight);

        dstX += dstWidth * 2;

        position = this.hexNumberPositions[addressLow];
        srcX = position.x;
        srcY = position.y;

        context.drawImage(this.hexNumberCanvas[0], 
          srcX, 
          srcY, 
          srcWidth * 2, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth * 2, 
          dstHeight);
        context.globalAlpha = 1;

        dstX += dstWidth * 2;        

        dstX += 10;


        dstX = this.opCodePositionX;
      }

      // draw the opcode
      var opcode = this.debugger.readByte(programCounter) & 0xff;
      var opcoderecord = MOS6510Opcodes[opcode];
      opcodeCmd = '';
      var byteCount = 0;
      var addressing = 0;
      var cycles = this.debugger.getCycleCount(programCounter);// this.machine.getCycles(programCounter);
      var label = false;

      if(reachedStartAddress === false) {
        reachedStartAddress = showAddress === programCounter;
      }

      var inReport = false;
      if(!cycles) {
        // debugger doesn't know about this instruction, what about the report?
        var reportOpcode = this.disassemblyInfo[programCounter].b;
        if(reportOpcode == opcode) {
          // disassembly has the same byte
          inReport = true;
        }
      }

      // if its in the report, will know what is it..
      if(!reachedStartAddress && !cycles && !inReport) {
        // dont really know what this instruction is, just show one byte..
        opcodeCmd = "???";
        byteCount = 1;
      } else {

        if(typeof opcoderecord != 'undefined') {
          opcodeCmd = opcoderecord.cmd;
          byteCount = opcoderecord.bytes;
          addressing = opcoderecord.addressing;

          if(typeof opcodeCmd == 'undefined') {
            console.log('undefined opcode');
            console.log(opcoderecord);
          }
        } else {
          opcodeCmd = "???";
          byteCount = 1;
        }
      }


      var param = 0;
      var param2 = 0;

      if(programCounter + 1 < 0xffff) {
        param = this.debugger.readByte(programCounter + 1) & 0xff;
      }

      if(programCounter + 2 < 0xffff) {
        param2 = this.debugger.readByte(programCounter + 2) & 0xff;
      }


      var paramCount = byteCount - 1;
 

      if(dstY >= 0) {
        // record the param count so can know if mouse over
        this.paramCounts.push(paramCount);
        var line = '';// pc + '  ';


        // hex opcode
        position = this.hexNumberPositions[opcode];
        srcX = position.x;
        srcY = position.y;

        context.drawImage(this.hexNumberCanvas[0], 
          srcX, 
          srcY, 
          srcWidth * 2, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth * 2, 
          dstHeight);

        dstX += dstWidth * 2;
        dstX += dstWidth;

        if(paramCount > 0) {
          // hex param 1

          position = this.hexNumberPositions[param];
          srcX = position.x;
          srcY = position.y;

          context.drawImage(this.hexNumberCanvas[0], 
            srcX, 
            srcY, 
            srcWidth * 2, 
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 2, 
            dstHeight);

          dstX += dstWidth * 2;
          dstX += dstWidth;

        } 



        if(paramCount > 1) {
          // hex param2
          position = this.hexNumberPositions[param2];
          srcX = position.x;
          srcY = position.y;
          
          context.drawImage(this.hexNumberCanvas[0],
            srcX, 
            srcY, 
            srcWidth * 2, 
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 2, 
            dstHeight);
          
          dstX += dstWidth * 2;             
        } 


        // draw cycles if known
        if(cycles !== false && cycles < 10) {
          dstX = this.cyclesPositionX;

          // cycle count, can use hex as shouldn't get large enought to matter
          position = this.hexNumberPositions[cycles];
          srcX = position.x + srcWidth;
          srcY = position.y;
        
          if(cycles > 0) {
            context.drawImage(this.hexNumberCanvas[0],
              srcX, 
              srcY, 
              srcWidth, 
              srcHeight, 
              dstX, 
              dstY, 
              dstWidth, 
              dstHeight);
            }
        }
        // opcode command


        dstX = this.cmdPositionX;

        position = this.cmdPositions[opcodeCmd];
        if(typeof position != 'undefined') {
          srcX = position.x;
          srcY = position.y;

          context.drawImage(this.cmdCanvas, 
            srcX, 
            srcY, 
            srcWidth * 3,
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 3, 
            dstHeight);

            dstX += dstWidth * 3;
        } else {
          console.log('not found: ' + opcodeCmd);
        }



        // params

        if(paramCount == 2) {
          line += ' ';

          if(addressing == MOS6510AddressingModes.INDIA) {
            line += '(';
          }
          line += '$';
          
          var lineLength = line.length;
          for(var j = 0; j < lineLength; j++) {
            var c = line.charCodeAt(j);
    
            srcX = c * charWidth;
            srcY = 0;
            srcWidth = charWidth;
            srcHeight = charHeight;
            dstWidth = charWidth;
            dstHeight = charHeight;
    
            context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
            dstX += charWidth;
          }

  //        dstX += charWidth;

          position = this.hexNumberPositions[param2];
          srcX = position.x;
          srcY = position.y;
          
          context.drawImage(this.hexNumberCanvas[colorIndex], 
            srcX, 
            srcY, 
            srcWidth * 2, 
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 2, 
            dstHeight);
          
          dstX += dstWidth * 2;


          position = this.hexNumberPositions[param];
          srcX = position.x;
          srcY = position.y;
          
          context.drawImage(this.hexNumberCanvas[colorIndex],
            srcX, 
            srcY, 
            srcWidth * 2, 
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 2, 
            dstHeight);
          
          dstX += dstWidth * 2;        
  //       line +=  param2;
    //     line += param;


          line = '';
          if(addressing == MOS6510AddressingModes.ABSIX) {
            line += ',X';
          }
          if(addressing == MOS6510AddressingModes.INDIA) {
            line += ')';
          }
          if(addressing == MOS6510AddressingModes.ABSIY) {
            line += ',Y';
          }

        }

        if(paramCount == 1) {
          param2 = false;
          line += ' ';
          if(addressing == MOS6510AddressingModes.IMMED) {
            line += '#';
            colorIndex = 2;
          }
          if(addressing == MOS6510AddressingModes.RELAT) {


            var e1 = programCounter;//parseInt(pc, 16);
            var e2 = param;// parseInt(param, 16);
            if(e2 > 127) {
              e2 = e2 - 256;
            }
            var e3 = e1 + e2 + 2;

            param2 = (e3 >> 8) & 0xff;
            param = e3 & 0xff;
          }

          if(addressing == MOS6510AddressingModes.ININD) {
            line += '(';
          }

          line += '$';
          
          var lineLength = line.length;
          for(var j = 0; j < lineLength; j++) {
            var c = line.charCodeAt(j);
    
            srcX = c * charWidth;
            srcY = 0;
            srcWidth = charWidth;
            srcHeight = charHeight;
            dstWidth = charWidth;
            dstHeight = charHeight;
    
            context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
            dstX += charWidth;
          }      
          

          if(param2 !== false) {
            position = this.hexNumberPositions[param2];
            srcX = position.x;
            srcY = position.y;
            
            context.drawImage(this.hexNumberCanvas[colorIndex], 
              srcX, 
              srcY, 
              srcWidth * 2, 
              srcHeight, 
              dstX, 
              dstY, 
              dstWidth * 2, 
              dstHeight);
            
            dstX += dstWidth * 2;
            
          }

          position = this.hexNumberPositions[param];
          srcX = position.x;
          srcY = position.y;

          context.drawImage(this.hexNumberCanvas[colorIndex], 
            srcX, 
            srcY, 
            srcWidth * 2, 
            srcHeight, 
            dstX, 
            dstY, 
            dstWidth * 2, 
            dstHeight);

          dstX += dstWidth * 2;

          line = '';
          if(addressing == MOS6510AddressingModes.ININD) {
            line += '),Y';
          }

          
          if(addressing == MOS6510AddressingModes.ABSIX 
              || addressing == MOS6510AddressingModes.ZEPIX) {
            line += ',X';
          }
        } 

        if(paramCount == 0) {
  //        line += '      ';
        }

        var lineLength = line.length;
        for(var j = 0; j < lineLength; j++) {
          var c = line.charCodeAt(j);

          srcX = c * charWidth;
          srcY = 0;
          srcWidth = charWidth;
          srcHeight = charHeight;
          dstWidth = charWidth;
          dstHeight = charHeight;

          context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
          dstX += charWidth;
        }


        if(pc === programCounter) {
          context.beginPath();    
          context.lineWidth = 1;

          context.strokeStyle = '#ffffff';            
          context.moveTo(this.breakpointColWidth, dstY + this.fontCharHeight + 0.5);
          context.lineTo(350 * canvasScale, dstY + this.fontCharHeight + 0.5);
          context.stroke();

          if(!this.debugger.isRunning()) {
            context.fillStyle= '#cccccc';
            var trianglePosition = dstY + + this.fontCharHeight / 4;
            var triangleHeight = this.fontCharHeight / 2;
            var triangleWidth = this.breakpointColWidth / 2;
            context.moveTo(4, trianglePosition);
            context.lineTo(4 + triangleWidth, trianglePosition + triangleHeight / 2);
            context.lineTo(4, trianglePosition + triangleHeight);
            context.lineTo(4, trianglePosition);

            context.fill();
          }
      
          
        }
        this.addressPositions.push(programCounter);
      }

      previousAddress = programCounter;
      if(typeof this.disassemblyInfo[programCounter] != 'undefined') {
        this.disassemblyInfo[programCounter].bytes = paramCount + 1;
      }

      programCounter += 1 + paramCount;

      if(isNaN(programCounter)) {
        console.log('program counter is NAN!!!!');
        console.log('param count = ' + paramCount);
      }

      if(typeof this.disassemblyInfo[programCounter] != 'undefined') {
        this.disassemblyInfo[programCounter].prev = previousAddress;
      }

      dstY += this.lineHeight;
      dstX = 0;
    }

    if(this.cursorX !== false && this.mouseInCanvas) {
      context.beginPath();
      context.strokeStyle = "#cccccc";
      context.rect(
          this.cursorX - 0.5, 
          this.cursorY - 0.5, 
          this.cursorWidth, 
          this.cursorHeight);
      context.stroke();
    }
  },

  update: function() {
    if(this.visible) {
      this.scrollCanvas.render();
    }
  }
}
