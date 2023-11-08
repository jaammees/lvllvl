var AcmeParser = function() {
  /*
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

  */


  this.labels = [];
  this.macros = [];

  this.fileLabels = {};
  this.fileMacros = {};

}

AcmeParser.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  parseAllFiles: function() {
    this.labels = [];
    this.macros = [];

    this.fileLabels = {};
    this.fileMacros = {};

    var files = [];
    this.editor.collectSourceFiles('/asm', files, ['asm', 'folder']);
    for(var i = 0; i < files.length; i++) {
      if(files[i].type == 'asm') {
        this.process(files[i].id, files[i].content);
      }
    }

  },


  getCompletions: function(line, pos) {
    var completions = [];
    // we can use session and pos here to decide what we are going to show

    var firstCharPos = false;
    var firstSpace = false;
    var firstSpaceAfterChar = false;
    var letterNumber = /^[0-9a-zA-Z]+$/;
    var number = /^[0-9]+$/;
    var preceedingCharacter = false;
    var afterPreceedingCharacter = false;

    var columnPos = pos.column;
    var lineLength = line.length;

    // if user typing a number, store it here
    var typingNumber = false;


    // get the first character after a space or the start of the line
    // and the character after that.
    // so preceedingCharacter is the first character after a space (when going backwards)
    while(columnPos >= 0 && line[columnPos] != ' ' && line[columnPos] != "\t") {
      preceedingCharacter = line[columnPos];

      if(columnPos + 1 < lineLength) {
        afterPreceedingCharacter = line[columnPos + 1];
      } else {
        afterPreceedingCharacter = false;
      }

      // if character is a '$' or '#', check if the user is typing a number
      if(columnPos + 1 < lineLength && (line[columnPos] == '$' || line[columnPos] == '#')) {
        var testChar = line[columnPos + 1];
        if(testChar >= '0' && testChar <= '9') {
          console.log('typing number');
          typingNumber = true;
        }
      }

      if(line[columnPos] >= '0' && line[columnPos] <= '9') {
        typingNumber = true;
      }

      columnPos--;
    }

    // make sure its not a comment
    columnPos = pos.column;
    while(columnPos >= 0) {
      if(line[columnPos] == ';') {
        // in a comment, so no auto completion
        return completions;
      }
      columnPos--;
    }

    //console.log('preceeding character = ' + preceedingCharacter);
    
    var hasComma = false;
    for(var i = 0; i < pos.column; i++) {
      var ch = line[i];
      if(ch != ' ' && ch != '\t' && firstCharPos === false) {
        firstCharPos = i;
      }

      if( (ch == ' ' || ch == '\t') && firstSpace === false) {
        firstSpace = i;

      }

      if( (ch == ' ' || ch == '\t') && firstCharPos !== false && firstSpaceAfterChar === false) {
        firstSpaceAfterChar = i;
      }

      if(ch == ',') {
        hasComma = true;
      }

    }

    if(firstSpace === false) {

      // no leading space, could be acme pseudo opcode or a macro
      if(preceedingCharacter != '+') {
        var prefix = '!';

        if(preceedingCharacter == '!') {
          // if user has already typed an !, dont want to code complete it.
          prefix = '';
        }
        for(var i = 0; i < AcmePseudoOpcodes.length; i++) {
          completions.push({
            value: prefix + AcmePseudoOpcodes[i].cmd,
            meta: AcmePseudoOpcodes[i].desc
          });
        }
      }


      if(preceedingCharacter != '!') {
        var prefix = '+';
        if(preceedingCharacter == '+') {
          // if user has already typed a '+', dont want to complete it
          prefix = '';
        }
        for(var i = 0; i < this.macros.length; i++) {

          completions.push({
            value: prefix + this.macros[i].value,
            meta: 'macro' //this.macros[i].meta
          });
        }
      }


    } else if(firstSpace !== false && firstSpaceAfterChar === false) {

      // opcodes or pseudo opcodes
      if(preceedingCharacter != '+') {
        // opcodes
        for(var i = 0; i < MOS6510OpcodeCmds.length; i++) {
          completions.push({
            value: MOS6510OpcodeCmds[i].cmd.toLowerCase(),
            meta: MOS6510OpcodeCmds[i].name
          });
        }

        //pseudo opcodes
        var prefix = '!';

        if(preceedingCharacter == '!') {
          // if user has already typed an !, dont want to code complete it.
          prefix = '';
        }
        
        for(var i = 0; i < AcmePseudoOpcodes.length; i++) {
          completions.push({
            value: prefix + AcmePseudoOpcodes[i].cmd,
            meta: AcmePseudoOpcodes[i].desc
          });
        }

      }

      if(preceedingCharacter != '!') {
        // macros
        for(var i = 0; i < this.macros.length; i++) {

          var prefix = '+';
          if(preceedingCharacter == '+') {
            prefix = '';
          }
          completions.push({
            value: this.macros[i].value,
            meta: 'macro'//this.macros[i].meta
          });
        }
      }
    } else {

      // if there is a comma, dont want completions
      // if start with a number, prob dont want labels either
      if(!hasComma) {

        // labels
        if(!typingNumber) {
          for(var i = 0; i < this.labels.length; i++) {
            
            completions.push({
              value: this.labels[i].value,
              meta: this.labels[i].meta
            });
          }
        }

        if(preceedingCharacter == '$') {
          // c64 io registers

          // f is not really IO registers..
          if(afterPreceedingCharacter == 'd' || afterPreceedingCharacter == 'f') {
            for(var i = 0; i < C64IORegisters.length; i++) {
              var meta = C64IORegisters[i].label;
              if(typeof C64IORegisters[i].chip != 'undefined') {
                meta = C64IORegisters[i].chip + ": " + meta;
              }
              completions.push({
                value: '$' + C64IORegisters[i].address,
                meta: meta
              });
            }
          }
        }
      }

    }

    /*
    for(var i = 0; i < C64IORegisters.length; i++) {
      completions.push({
        value: '$' + C64IORegisters[i].address,
        meta: C64IORegisters[i].description
      });
    }
    */

    return completions;
  },

  process: function(fileId, content) {

    var labels = [];
    var macros = [];

    var lines = content.split("\n");
    for(var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      var line = lines[lineIndex];
      var commentPos = line.indexOf(';');
      if(commentPos != -1) {
        line = line.substring(0, commentPos);
      }
      line = line.trim();

      if(line != '') {
        if(line.length > 1 && line[0] == '*' && line[1] == '=') {
        } else if(line.indexOf('=') !== -1) {
          var parts = line.split('=');
          if(parts.length > 1) {

            var label = parts[0].trim();
            var param = parts[1].trim();
            if(param == '*') {
              labels.push({ value: label, meta: ''});
            } else {

              var value = false;
              
              if (param.match(/^\$[0-9a-f]{1,2}$/i)) {
                // value is a byte
                value = param;//parseInt(param.replace(/^\$/, ""), 16) & 0xff;

                labels.push({ value: label, meta: value});
              } else if (param.match(/^\$[0-9a-f]{3,4}$/i)) {
                // value is a word
                value = param;//parseInt(param.replace(/^\$/, ""), 16) & 0xffff;
                labels.push({ value: label, meta: value});
              } else if(!isNaN(parseInt(param))) {
                value = param;//parseInt(param);
                labels.push({ value: label, meta: value});
              } else {
                value = param;
                  labels.push({ value: label, meta: value});
              }
            }
          }
        } else {
          line = line.replace(/\t/g, ' ');
          var parts = line.split(/\ +/);
          if(parts.length > 0) {
            var opcode = parts[0].toLowerCase();

            /*
            var param = '';
            for(var i = 1; i < parts.length; i++) {
              param += parts[i].trim();
            }
            */
            if(opcode == 'macro' || opcode == '!macro') {
              macros.push({ value:  parts[1], meta: ''});
            } else if(opcode == 'byte' || opcode == '!byte') {
            
            } else {
              // assume its a label
              var label = parts[0];
              if(label.length > 0 && label[0] != '!' && label[0] != '+' && label[0] != '}') {
                if(label[label.length - 1] == ':') {
                  label = label.substring(0, label.length - 1);
                }
                labels.push({ value: label, meta: ''});
              }

              /*
              if(this.pc == block.start && typeof block.label == 'undefined') {
                block.label = label;
              }
              this.addLabel(label, this.pc);
              */
            }
          }


          this.fileLabels[fileId] = labels;
          this.fileMacros[fileId] = macros;
//          this.labels = labels;
        }

      }
    }

    this.combine();
  },

  combine: function() {
    this.labels = [];
    for(var key in this.fileLabels) {
      for(var i = 0; i < this.fileLabels[key].length; i++) {
        this.labels.push({
          value: this.fileLabels[key][i].value,
          meta: this.fileLabels[key][i].meta
        });
      }
    } 

    this.macros = [];
    for(var key in this.fileMacros) {
      for(var i = 0; i < this.fileMacros[key].length; i++) {
        this.macros.push({
          value: this.fileMacros[key][i].value,
          meta: this.fileMacros[key][i].meta
        });
      }
    } 



  }
}