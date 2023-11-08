
var Assembler = function() {
  this.memory = null;

  this.pc = 0x1000;

  this.labels = {};

  this.lines = [];
  this.start = 0;
  this.end = 0;

  this.errors = [];

  this.opcodes = {
    "adc": {"im":0x69,"zp":0x65,"zpx":0x75,"abs":0x6d,"absx":0x7d,"absy":0x79,"indx":0x61,"indy":0x71},
    "and": {"im":0x29,"zp":0x25,"zpx":0x35,"abs":0x2d,"absx":0x3d,"absy":0x39,"indx":0x21,"indy":0x31},
    "asl": {"zp":0x6,"zpx":0x16,"abs":0xe,"absx":0x1e,"sngl":0xa},
    "bit": {"zp":0x24,"abs":0x2c},
    "bpl": {"bra":0x10},
    "bmi": {"bra":0x30},
    "bvc": {"bra":0x50},
    "bvs": {"bra":0x70},
    "bcc": {"bra":0x90},
    "bcs": {"bra":0xb0},
    "bne": {"bra":0xd0},
    "beq": {"bra":0xf0},
    "brk": {"sngl":0x0},
    "cmp": {"im":0xc9,"zp":0xc5,"zpx":0xd5,"abs":0xcd,"absx":0xdd,"absy":0xd9,"indx":0xc1,"indy":0xd1},
    "cpx": {"im":0xe0,"zp":0xe4,"abs":0xec},
    "cpy": {"im":0xc0,"zp":0xc4,"abs":0xcc},
    "dec": {"zp":0xc6,"zpx":0xd6,"abs":0xce,"absx":0xde},
    "eor": {"im":0x49,"zp":0x45,"zpx":0x55,"abs":0x4d,"absx":0x5d,"absy":0x59,"indx":0x41,"indy":0x51},
    "clc": {"sngl":0x18},
    "sec": {"sngl":0x38},
    "cli": {"sngl":0x58},
    "sei": {"sngl":0x78},
    "clv": {"sngl":0xb8},
    "cld": {"sngl":0xd8},
    "sed": {"sngl":0xf8},
    "inc": {"zp":0xe6,"zpx":0xf6,"abs":0xee,"absx":0xfe},
    "jmp": {"abs":0x4c,"ind":0x6c},
    "jsr": {"abs":0x20},
    "lda": {"im":0xa9,"zp":0xa5,"zpx":0xb5,"abs":0xad,"absx":0xbd,"absy":0xb9,"indx":0xa1,"indy":0xb1},
    "ldx": {"im":0xa2,"zp":0xa6,"zpy":0xb6,"abs":0xae,"absy":0xbe},
    "ldy": {"im":0xa0,"zp":0xa4,"zpx":0xb4,"abs":0xac,"absx":0xbc},
    "lsr": {"zp":0x46,"zpx":0x56,"abs":0x4e,"absx":0x5e,"sngl":0x4a},
    "nop": {"sngl":0xea},
    "ora": {"im":0x9,"zp":0x5,"zpx":0x15,"abs":0xd,"absx":0x1d,"absy":0x19,"indx":0x1,"indy":0x11},
    "tax": {"sngl":0xaa},
    "txa": {"sngl":0x8a},
    "dex": {"sngl":0xca},
    "inx": {"sngl":0xe8},
    "tay": {"sngl":0xa8},
    "tya": {"sngl":0x98},
    "dey": {"sngl":0x88},
    "iny": {"sngl":0xc8},
    "ror": {"zp":0x66,"zpx":0x76,"abs":0x6e,"absx":0x7e,"sngl":0x6a},
    "rol": {"zp":0x26,"zpx":0x36,"abs":0x2e,"absx":0x3e,"sngl":0x2a},
    "rti": {"sngl":0x40},
    "rts": {"sngl":0x60},
    "sbc": {"im":0xe9,"zp":0xe5,"zpx":0xf5,"abs":0xed,"absx":0xfd,"absy":0xf9,"indx":0xe1,"indy":0xf1},
    "sta": {"zp":0x85,"zpx":0x95,"abs":0x8d,"absx":0x9d,"absy":0x99,"indx":0x81,"indy":0x91},
    "txs": {"sngl":0x9a},
    "tsx": {"sngl":0xba},
    "pha": {"sngl":0x48},
    "pla": {"sngl":0x68},
    "php": {"sngl":0x8},
    "plp": {"sngl":0x28},
    "stx": {"zp":0x86,"zpy":0x96,"abs":0x8e},
    "sty": {"zp":0x84,"zpx":0x94,"abs":0x8c}
    };
}

Assembler.prototype = {
  init: function() {

    // TODO: only create memory when first run instead??
    this.memory = new Uint8Array(65536);
  },

  getMemory: function() {
    return this.memory;
  },

  logError: function(message) {
    this.errors.push({ "line": this.lineNumber, "message": message });
  },

  // just assemble a single line
  assembleLine: function(line, address) {

    this.pc = address;
    var startAddress = this.pc;

    var parts = line.split(/\ +/);
    if(parts.length > 0) {
      var opcode = parts[0].toLowerCase();
      var param = '';
      for(var i = 1; i < parts.length; i++) {
        param += parts[i].trim();
      }

      if(this.opcodes.hasOwnProperty(opcode)) {

        if(this.opcodeLine(this.opcodes[opcode], param, false) === false) {
          return {
            success: false,
            error: "Invalid param: " + param

          };
        }
      } else {
        console.log('unknown instruction: ' + opcode);
        return {
          success: false,
          error: "Unknown instruction: " + opcode
        };
      }

      /*
      if(opcode == 'byte' || opcode == '!byte') {
        this.bytesLine(param);
        console.log(param);
      } else if(this.opcodes.hasOwnProperty(opcode)) {

        console.log(this.opcodes[opcode]);
        console.log(param);
        this.opcodeLine(this.opcodes[opcode], param);
      } else {
        // assume its a label
        var label = parts[0];

        if(this.pc == block.start && typeof block.label == 'undefined') {
          block.label = label;
        }

        console.log(label);
        this.addLabel(label, this.pc);
      }
      */
    }

    var bytes = [];
    var endAddress = this.pc;
    for(var address = startAddress; address < endAddress; address++) {
//      console.log(this.memory[address].toString(16));
      bytes.push(this.memory[address]);
    }
    var result = {
      success: true,
      bytes: bytes      
    }

    return result;
  },

  assemble: function(code, location) {
    var blocks = [];
    this.errors = [];

    if(typeof location == 'undefined') {
      location = 0x801;
    }
    this.lines = [];
    this.labels = {};
    for(var i = 0; i < this.memory.length; i++ ) {
      this.memory[i] =0;
    }

    var block = {};

    this.pc = location;
    this.start = this.pc;

    block.start = this.pc;

    var lines = code.split("\n");
    for(var lineIndex = 0; lineIndex < lines.length; lineIndex++) {

      var line = lines[lineIndex];
      this.lineNumber = lineIndex;

      var srcLine = line;

      var memStart = this.pc;

      var commentPos = line.indexOf(';');
      if(commentPos != -1) {
        line = line.substring(0, commentPos);
      }

      line = line.trim();
      if(line != '') {
        if(line.length > 1 && line[0] == '*' && line[1] == '=') {
          // set program counter
          line = line.substring(2).trim();

          block.end = this.pc;
          if(block.end != block.start) {
            blocks.push(block);
          }
          block = {};

          if (line.match(/^\$[0-9a-f]{3,4}$/i)) {
            this.pc = parseInt(line.replace(/^\$/, ""), 16) & 0xffff;
          } else {
            this.logError('bad address: ' + line);
          }
          block.start = this.pc;


        } else if(line.indexOf('=') !== -1) {
          // set a label
          var parts = line.split('=');
          if(parts.length > 1) {
            var label = parts[0].trim();
            var param = parts[1].trim();
            if(param == '*') {
              this.addLabel(label, this.pc);
            } else {

              var value = false;
              
              if (param.match(/^\$[0-9a-f]{1,2}$/i)) {
                // value is a byte
                value = parseInt(param.replace(/^\$/, ""), 16) & 0xff;

                this.addLabel(label, value);
              } else if (param.match(/^\$[0-9a-f]{3,4}$/i)) {
                // value is a word
                value = parseInt(param.replace(/^\$/, ""), 16) & 0xffff;
                this.addLabel(label, value);
              } else if(!isNaN(parseInt(param))) {
                value = parseInt(param);
                this.addLabel(label,value);
              } else {
                value = this.parseParam(param);
                if(value !== false) {
                  this.addLabel(label,value);
                }

/*
                var action = false;
                if(param[0] == '<') {
                  action = 'lowerbyte';
                  param = param.substr(1);
                } else if(param[0] == '>') {
                  action = 'upperbyte';
                  param = param.substr(1);
                }

                var error = false;
                var parts = param.split(/(?:\+|\-| )+/);
                for(var i = 0; i < parts.length; i++) {
                  var key = parts[i];
                  if(this.labels.hasOwnProperty(key)) {
                    param = param.replace(key, this.labels[key].value);
                  } else if(isNaN(key)) {
                    this.logError('unknown value: ' + param);
                    error = true;
                  }
                }
                console.log('new param = ' + param);
console.log(parts);

                if(!error) {
                  value = eval(param);

                  if(action == 'lowerbyte') {
                    value = value & 0xff;
                  } else if(action == 'upperbyte') {
                    value = (value >> 8) & 0xff;
                  }
                  this.addLabel(label,value);
                  console.log("result= " + value);
                } else {

//                console.log(this.labels);
                  this.logError('unknown value: ' + param);
                }
*/


              }
            }
          }
        } else {
          var parts = line.split(/\ +/);
          if(parts.length > 0) {
            var opcode = parts[0].toLowerCase();
            var param = '';
            for(var i = 1; i < parts.length; i++) {
              param += parts[i].trim();
            }

            if(opcode == 'byte' || opcode == '!byte') {
              this.bytesLine(param);
            } else if(this.opcodes.hasOwnProperty(opcode)) {
              this.opcodeLine(this.opcodes[opcode], param);

            } else {
              // assume its a label
              var label = parts[0];
              if(this.pc == block.start && typeof block.label == 'undefined') {
                block.label = label;
              }
              this.addLabel(label, this.pc);
            }
          }
        }
      }

      var memEnd = this.pc;
      this.lines.push({ "src": srcLine, "lineIndex": lineIndex + i, "memStart": memStart, "memEnd": memEnd });
    }


    this.processLabels();
    this.end = this.pc;
    block.end = this.pc;
    if(block.end != block.start) {
      blocks.push(block);
    }

    var success = this.errors.length == 0;

    return {"success": success, "errors": this.errors, "start": this.start, "end": this.end, "blocks": blocks };
  },

  parseParam: function(param) {

    var action = false;
    if(param[0] == '<') {
      action = 'lowerbyte';
      param = param.substr(1);
    } else if(param[0] == '>') {
      action = 'upperbyte';
      param = param.substr(1);
    }

    var error = false;
    var parts = param.split(/(?:\+|\-| )+/);
    for(var i = 0; i < parts.length; i++) {
      var key = parts[i];
      if(this.labels.hasOwnProperty(key)) {
        param = param.replace(key, this.labels[key].value);
      } else if(isNaN(key)) {
        this.logError('unknown value: ' + param);
        error = true;
      }
    }

    if(!error) {
      value = eval(param);

      if(action == 'lowerbyte') {
        value = value & 0xff;
      } else if(action == 'upperbyte') {
        value = (value >> 8) & 0xff;
      }

      return value;
    } else {

  //                console.log(this.labels);
      this.logError('unknown value: ' + param);
    }

    return false;
  },


  getDisassembly: function() {
    var output = '';
    for(var i = 0; i < this.lines.length; i++) {
//      var address = this.lines[i].memStart.toString(16);
      var address = ("0000" + this.lines[i].memStart.toString(16)).substr(-4);
      output += address
      output += '  ';
      for(var j = this.lines[i].memStart; j < this.lines[i].memEnd; j++) {
        var val = this.memory[j].toString(16);
        if(val.length == 1) {
          val = "0" + val;
        }
        output += val + ' ';
      }
      for(var j = 0; j < 4 - (this.lines[i].memEnd - this.lines[i].memStart); j++) {
        output += '   ';
      }
      output += this.lines[i].src;
      output += '\n';
    }   
    return output; 

  },
  addLabel: function(label, value) {
    if(typeof this.labels[label] == 'undefined') {
      this.labels[label] = {};
    }
    this.labels[label].value = value;
  },



  processLabels: function() {
    for(var label in this.labels) {

      var value = this.parseParam(label);
      if(value === false) {//typeof this.labels[label].value == 'undefined') {
        // error
        this.logError('undefined label: ' + label);
      } else {
        for(var mode in this.labels[label]) {

          switch(mode) {
            case 'w':
              // word


              for(var i = 0; i < this.labels[label]['w'].length; i++) {
//                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location++] = value & 0xff; 
                this.memory[location] = (value >> 8) & 0xff; 
              }
            break;
            case 'r':
              // relative
              for(var i = 0; i < this.labels[label]['r'].length; i++) {
//                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                if(value < location) {
                  this.memory[location++] = 0xff - (location - value) + 1;
                } else {
                  this.memory[location++] = value - location;
                }
              }
            break;
            case 'h':
            // high byte
              // word
              for(var i = 0; i < this.labels[label]['h'].length; i++) {
                //var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location] = (value >> 8) & 0xff; 
              }

            break;
            case 'l':
            // low byte
            // word
              for(var i = 0; i < this.labels[label]['l'].length; i++) {

                //var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location] = value & 0xff; 
              }

            break;
          }
        }
      }
    }
  },


/*
  processLabels: function() {
    for(var label in this.labels) {
      if(typeof this.labels[label].value == 'undefined') {
        // error
        this.logError('undefined label: ' + label);
      } else {
        for(var mode in this.labels[label]) {

          switch(mode) {
            case 'w':
              // word


              for(var i = 0; i < this.labels[label]['w'].length; i++) {
                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location++] = value & 0xff; 
                this.memory[location] = (value >> 8) & 0xff; 
              }
            break;
            case 'r':
              // relative
              for(var i = 0; i < this.labels[label]['r'].length; i++) {
                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                if(value < location) {
                  this.memory[location++] = 0xff - (location - value) + 1;
                } else {
                  this.memory[location++] = value - location;
                }
              }
            break;
            case 'h':
            // high byte
              // word
              for(var i = 0; i < this.labels[label]['h'].length; i++) {
                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location] = (value >> 8) & 0xff; 
              }

            break;
            case 'l':
            // low byte
            // word
              for(var i = 0; i < this.labels[label]['l'].length; i++) {

                var value = this.labels[label].value;
                var location = this.labels[label][mode][i].location;
                var offset = this.labels[label][mode][i].offset;
                value += offset;

                this.memory[location] = value & 0xff; 
              }

            break;
          }
        }
      }
    }
  },


*/
  addLabelPlaceholder: function(label, location, type, offset) {
    if(typeof this.labels[label] == 'undefined') {
      this.labels[label] = {};
    }

    if(type == 'w') {
      // label word placeholder
      if(typeof this.labels[label]['w'] == 'undefined') {
        this.labels[label]['w'] = [];
      }
      this.labels[label]['w'].push({"location":location, "offset": offset});
    } else if(type == 'r') {
      // relative to location
      if(typeof this.labels[label]['r'] == 'undefined') {
        this.labels[label]['r'] = [];
      }
      this.labels[label]['r'].push({"location":location, "offset": offset});
    } else if(type == 'h') {
      // label high byte placeholder
      if(typeof this.labels[label]['h'] == 'undefined') {
        this.labels[label]['h'] = [];
      }
      this.labels[label]['h'].push({"location":location, "offset": offset});
    } else  {
      // label low byte placeholder
      if(typeof this.labels[label]['l'] == 'undefined') {
        this.labels[label]['l'] = [];
      }
      this.labels[label]['l'].push({"location":location, "offset": offset});
    }
  },

  bytesLine: function(param) {
    var parts = param.split(',');
    for(var i = 0; i < parts.length; i++) {
      var value = false;
      if (parts[i].match(/^\$[0-9a-f]{1,2}$/i)) {
        value = parseInt(parts[i].replace(/^\$/, ""), 16) & 0xff;
      } else if(!isNaN(parseInt(parts[i]))) {
        value = parseInt(parts[i]);
      } else {
        value = this.parseParam(parts[i]);
      }

      if(value === false || isNaN(value)) {
        this.logError('unrecognised byte: ' + parts[i]);
      } else {
        this.memory[this.pc++] = value;
      }
    }
  },

  opcodeLine: function(opcodes, param, allowLabels) {
//    if(parts.length == 1) {
    if(param == '') {
      if(!opcodes.hasOwnProperty('sngl')) {
        this.logError('missing parameter');
        return false;
      }
      this.memory[this.pc++] = opcodes['sngl'];
      return true;
    }

    var canHaveLabels = true;
    if(typeof allowLabels != 'undefined') {
      canHaveLabels = allowLabels;      
    }

//    var param = parts[1];
    var value = 0;
    var number;

    var labelOffset = 0;

    /*
    if(param.indexOf('+') !== -1) {
      var pos = param.indexOf('+');
      labelOffset = parseInt(param.substring(pos + 1));
      param = param.substring(0, pos);

    }

    if(param.indexOf('-') !== -1) {
      var pos = param.indexOf('-');
      labelOffset = -parseInt(param.substring(pos + 1));
      param = param.substring(0, pos);

    }

    */


    // Immediate addressing is an addressing form in which the byte value to be used or retrieved in the instruction, is located immediately after the opcode for the instruction itself.
    // immediate hex  #$xx

    if(opcodes.hasOwnProperty('im')) {
      if (param.match(/^#\$[0-9a-f]{1,2}$/i)) {
        value = parseInt(param.replace(/^#\$/, ""), 16) & 0xff;
        var hex = value.toString(16);

        this.memory[this.pc++] = opcodes['im'];
        this.memory[this.pc++] = value;
        return "im";
      }

      if (param.match(/^#\%[0-1]{1,8}$/i)) {
        value = parseInt(param.replace(/^#\%/, ""), 2) & 0xff;
        var hex = value.toString(16);

        this.memory[this.pc++] = opcodes['im'];
        this.memory[this.pc++] = value;
        return "im";
      }


      // immediate decimal  #xx
      if (param.match(/^#[0-9]{1,3}$/i)) {
        value = parseInt(param.replace(/^#/, ""), 10) & 0xff;

        if(!opcodes.hasOwnProperty('im')) {
          return false;
        }

        this.memory[this.pc++] = opcodes['im'];
        this.memory[this.pc++] = value;
        return "im"
      }

      if(canHaveLabels) {
        // immediate label  
          // Label lo/hi
        if (param.match(/^#[<>]\w+$/)) {
          label = param.replace(/^#[<>](\w+)$/, "$1");
          hl = param.replace(/^#([<>]).*$/, "$1");
          this.memory[this.pc++] = opcodes['im'];
          // need to do label placeholder
          if(hl == '>') {
            this.addLabelPlaceholder(label, this.pc, "h", labelOffset);
            this.memory[this.pc++] = 0x00;
          } else {
            this.addLabelPlaceholder(label, this.pc, "l", labelOffset);
            this.memory[this.pc++] = 0x00;
          }
          return true;
        }
      }


      if(canHaveLabels) {
        if(param[0] == '#') {
          label = param.substr(1);
          this.memory[this.pc++] = opcodes['im'];

          this.addLabelPlaceholder(label, this.pc, "l", labelOffset);
          
          this.memory[this.pc++] = 0x00;      
          return true;
        }
      }



    }




    //  zero page $xx
    if(opcodes.hasOwnProperty('zp')) {
      if (param.match(/^\$[0-9a-f]{1,2}$/i)) {
        value = parseInt(param.replace(/^\$/, ""), 16) & 0xff;

        this.memory[this.pc++] = opcodes['zp'];
        this.memory[this.pc++] = value;
        return true;
      }

      if(canHaveLabels) {
        // zero page label
        if(this.labels.hasOwnProperty(param) && this.labels[param].hasOwnProperty('value') && this.labels[param].value <= 0xff) {
          this.memory[this.pc++] = opcodes['zp'];
          this.memory[this.pc++] = this.labels[param].value;
          return true;        
        }
      }

    }


    // test zero page x $xx,x
    if(opcodes.hasOwnProperty('zpx')) {
      if (param.match(/^\$[0-9a-f]{1,2},x/i)) {
        value = parseInt(param.replace(/^\$([0-9a-f]{1,2}),x/i, "$1"), 16) & 0xff;
        //value = parseInt(number, 16);

        this.memory[this.pc++] = opcodes['zpx'];
        this.memory[this.pc++] = value;

        return "zpx";
      }

      if(canHaveLabels) {
        // zero page x label   label,x
        if (param.match(/^\w+,x$/i)) {   
          var label = param.replace(/,x$/i, "");

          if(this.labels.hasOwnProperty(label) && this.labels[label].hasOwnProperty('value') && this.labels[label].value <= 0xff) {
            this.memory[this.pc++] = opcodes['zpx'];
            this.memory[this.pc++] = this.labels[label].value;
            returntrue ;        
          }
        }
      }



    }


    // test zero page y  $xx,y
    if(opcodes.hasOwnProperty('zpy')) {


      if (param.match(/^\$[0-9a-f]{1,2},y/i)) {

        value = parseInt(param.replace(/^\$([0-9a-f]{1,2}),y/i, "$1"), 16) & 0xff;

        this.memory[this.pc++] = opcodes['zpy'];
        this.memory[this.pc++] = value;

        return "zpy";
      }

      if(canHaveLabels) {
        // zero page y label   label,y
        if (param.match(/^\w+,y$/i)) {   
          var label = param.replace(/,y$/i, "");

          if(this.labels.hasOwnProperty(label) && this.labels[label].hasOwnProperty('value') && this.labels[label].value <= 0xff) {
            this.memory[this.pc++] = opcodes['zpy'];
            this.memory[this.pc++] = this.labels[label].value;
            return true;        
          }
        }
      }


    }


    // test absolute x   $xxxx,x
    if(opcodes.hasOwnProperty('absx')) {
      if (param.match(/^\$[0-9a-f]{3,4},x$/i)) {
        value = parseInt(param.replace(/^\$([0-9a-f]*),x/i, "$1"), 16) & 0xffff;

        this.memory[this.pc++] = opcodes['absx'];
        this.memory[this.pc++] = value & 0xff;
        this.memory[this.pc++] = value >> 8;
        return true;
      }

      if(canHaveLabels) {
        // test absolute x with label
        if (param.match(/^\w+,x$/i)) {
          var label = param.replace(/,x$/i, "");

          this.memory[this.pc++] = opcodes['absx'];

          this.addLabelPlaceholder(label, this.pc, "w", labelOffset);
          this.memory[this.pc++] = 0x00;
          this.memory[this.pc++] = 0x00;
          return true;
        }
      }
    }


    // test absolute y $xxxx,y
    if(opcodes.hasOwnProperty('absy')) {

      if (param.match(/^\$[0-9a-f]{3,4},y$/i)) {
        value = parseInt(param.replace(/^\$([0-9a-f]*),y/i, "$1"), 16) & 0xffff;

        this.memory[this.pc++] = opcodes['absy'];
        this.memory[this.pc++] = value & 0xff;
        this.memory[this.pc++] = value >> 8;

        return "aby";
      }

      // test absolute y with label
//      if (param.match(/^\w+,y$/i)) {

      if(canHaveLabels) {
        if(param.indexOf(',y') != -1 && param[0] != '(') {
          var label = param.replace(/,y$/i, "");

          this.memory[this.pc++] = opcodes['absy'];
          this.addLabelPlaceholder(label, this.pc, "w", labelOffset);
          this.memory[this.pc++] = 0x00;
          this.memory[this.pc++] = 0x00;
          return "absy";

        }
      }
    }


    // test indirect  ($xxxx)
    if(opcodes.hasOwnProperty('ind')) {
      if (param.match(/^\(\$[0-9a-f]{4}\)$/i)) {
        value = parseInt(param.replace(/^\(\$([0-9a-f]{4}).*$/i, "$1"), 16) & 0xffff;

        this.memory[this.pc++] = opcodes['ind'];
        this.memory[this.pc++] = value & 0xff;
        this.memory[this.pc++] = value >> 8;

        return "ind";
      }
    }


    // indexed indirect x ($xx,x)
    if(opcodes.hasOwnProperty('indx')) {
      if (param.match(/^\(\$[0-9a-f]{1,2},x\)$/i)) {
        value = parseInt(param.replace(/^\(\$([0-9a-f]{1,2}).*$/i, "$1"), 16) & 0xff;

        this.memory[this.pc++] = opcodes['indx'];
        this.memory[this.pc++] = value & 0xff;

        return "indx";
      }

      if(canHaveLabels) {
        if (param.match(/^\(\w+\,x\)$/i)) {
          var label = param.replace(/,x\)$/i, "");
          label = label.substring(1);
          if(this.labels.hasOwnProperty(label) && this.labels[label].hasOwnProperty('value') && this.labels[label].value <= 0xff) {
            this.memory[this.pc++] = opcodes['indx'];
            this.memory[this.pc++] = this.labels[label].value;
            return true;        
          }

        }
      }

    }


    // indirect indexed y ($xx),y
    if(opcodes.hasOwnProperty('indy')) {
      if (param.match(/^\(\$[0-9a-f]{1,2}\),y$/i)) {
        value = parseInt(param.replace(/^\([\$]([0-9a-f]{1,2}).*$/i, "$1"), 16) & 0xff;
          alert(value);

        this.memory[this.pc++] = opcodes['indy'];
        this.memory[this.pc++] = value & 0xff;
        return "indy";
      }

      if(canHaveLabels) {
        if (param.match(/^\(\w+\),y$/i)) {
          var label = param.replace(/\),y$/i, "");
          label = label.substring(1);

          if(this.labels.hasOwnProperty(label) && this.labels[label].hasOwnProperty('value') && this.labels[label].value <= 0xff) {
            this.memory[this.pc++] = opcodes['indy'];
            this.memory[this.pc++] = this.labels[label].value;
            return true;        
          }
        }
      }

    }



    // absolute 
    if(opcodes.hasOwnProperty('abs')) {

      // absolute $xxxx
      if (param.match(/^\$[0-9a-f]{3,4}$/i)) {
        value = parseInt(param.replace(/^\$/, ""), 16) & 0xffff;

        this.memory[this.pc++] = opcodes['abs'];
        this.memory[this.pc++] = value & 0xff;
        this.memory[this.pc++] = value >> 8;


        return "abs";
      }


      // absolute label
//      if (param.match(/^\w+$/)) {

      if(canHaveLabels) {

        this.memory[this.pc++] = opcodes['abs'];

        this.addLabelPlaceholder(param, this.pc, "w", labelOffset);
        this.memory[this.pc++] = 0x00;
        this.memory[this.pc++] = 0x00;

        return "abs";
      }
//      }
    }


    // branch
    if(opcodes.hasOwnProperty('bra')) {
      if(param.indexOf('$') === 0) {

        this.memory[this.pc++] = opcodes['bra'];

        // ok they put in an address...
        var addr = param.substr(1);
        addr = parseInt(addr, 16);
        var difference = addr - (this.pc + 1);

        if(difference < 0) {
          difference = 256 + difference; 
        }
        this.memory[this.pc++] = difference;

        return true;

        // -128 is 128
        // -127 is 129
        // -126 is 130
      } else if (param.match(/\w+/)) {
        if(canHaveLabels) {
          this.memory[this.pc++] = opcodes['bra'];

          this.addLabelPlaceholder(param, this.pc, "r", labelOffset);
          this.memory[this.pc++] = 0x00;
          return true;
        }
//        this.memory[this.pc++] = 0x00;
      }
    }


    return false;

  }



}

