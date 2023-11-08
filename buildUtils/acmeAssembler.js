var AcmeAssembler = function() {
  this.editor = null;
  this.preprocessor = null;

  this.stdout = '';
  this.stderr = '';
  this.output = '';
  this.report = '';

  this.errors = [];
  
}

var AcmePseudoOpcodes = [
  {
    "cmd": "byte",
    "desc": "Insert 8 bit values"
  },
  {
    "cmd": "word",
    "desc": "Insert 16 bit values"
  },
  {
    "cmd": "fill",
    "desc": "Fill memory with a value"
  },
  {
    "cmd": "align",
    "desc": ""
  },
  {
    "cmd": "zone",
    "desc": ""
  },
  {
    "cmd": "sl",
    "desc": ""
  },
  {
    "cmd": "convtab",
    "desc": ""
  },
  {
    "cmd": "pet",
    "desc": ""
  },
  {
    "cmd": "raw",
    "desc": ""
  },
  {
    "cmd": "scr",
    "desc": ""
  },
  {
    "cmd": "scrxor",
    "desc": ""
  },
  {
    "cmd": "text",
    "desc": ""
  },
//!do   !endoffile   !for   !if   !ifdef   !ifndef   !set
  {
    "cmd": "do",
    "desc": ""
  },
  {
    "cmd": "endoffile",
    "desc": ""
  },
  {
    "cmd": "for",
    "desc": ""
  },
  {
    "cmd": "if",
    "desc": ""
  },
  {
    "cmd": "ifdef",
    "desc": ""
  },
  {
    "cmd": "ifndef",
    "desc": ""
  },
  {
    "cmd": "set",
    "desc": ""
  },
  {
    "cmd": "binary",
    "desc": ""
  },
  //   !source   !to
  {
    "cmd": "source",
    "desc": ""
  },
  {
    "cmd": "to",
    "desc": ""
  },
  {
    "cmd": "pseudopc",
    "desc": ""
  },
  {
    "cmd": "macro",
    "desc": ""
  }

];

AcmeAssembler.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.preprocessor = new AssemblerPreprocessor();
    this.preprocessor.init(editor);
  },

  assemble: function(files, config, callback) {

    var _this = this;

    this.files = files;

    this.stdout = '';
    this.stderr = '';
    this.output = '';
    this.report = '';


    var options = {};

    options.locateFile = function(url) {
      return 'lib/acmeo/' + url;
    }

    options.preRun = [
      function() {
        // set up stdin, stdout, stderr
        options.FS.init(
          // stdin
          function() {
            return null;
          },
          // stdout
          function(c) {
            if(c !== null) {
              _this.stdout += String.fromCharCode(c);
            }
          },
          // std err
          function(c) {
            _this.stderr += String.fromCharCode(c);
          }
        );

        var FS = options.FS;

        // write the files
        for(var i = 0; i < files.length; i++) {
          var file = files[i];

          switch(file.type) {
            case 'folder':
              FS.mkdir(file.filePath);
            break;
            case 'asm':
              FS.writeFile(file.filePath, file.content, { encoding: 'utf8' });
            break;
            case 'bin':
              var content = base64ToBuffer(file.content);
              FS.writeFile(file.filePath, content, { encoding: 'binary' });
            break;
          }
        } 
      }
    ]; 

    var args = config['arguments'];
    if(typeof args == 'undefined') {
      console.log('args not defined...');
      args = '--format cbm'
    }

    args = args.split(' ');

    var argsArray = [];
    for(var i = 0; i < args.length; i++) {
      var arg = args[i].trim();
      if(arg != '') {
        argsArray.push(arg);
      }
    }

    //https://sourceforge.net/p/acme-crossass/code-0/94/tree/trunk/docs/QuickRef.txt
    // output errors in MS IDE format
    argsArray.push('-l');
    argsArray.push('labeldump');

    argsArray.push('--msvc');

    // -r This creates a text listing containing the original line
    //number, the resulting memory address, the byte value(s) put
    // there and the original text line from the source file.
    argsArray.push('-r');
    argsArray.push('report');
    argsArray.push('-o');
    argsArray.push('output.prg');

    //--cpu 65c02    

    /*
    options.arguments = [
      '-o', 'output.prg',
      '--format', 'cbm',
//      '--cpu', '65c02',
      '--msvc',
      '-r', 'report'
    ];
*/
    options.arguments = argsArray;

/*
options.arguments = [
  '-o', 'output.prg'
//  '--format', 'cbm'
];
*/

   if(false && typeof config.files !== 'undefined') {
     options.arguments.push(config.files);
   } else {
     options.arguments.push('main.asm');
   }


//    // add the files..
//    options.arguments.push('main.asm');

    options.postRun = [
      function() {

        if(_this.stderr != '') {
          _this.displayResult();
        } else {
          try {
            _this.report = acme['FS'].readFile('report', { encoding: 'utf8' });    
            _this.labelDump = acme['FS'].readFile('labeldump', { encoding: 'utf8' });    
            _this.output = acme['FS'].readFile('output.prg', { encoding: 'binary' });  

            console.log(_this.report);

            var report = _this.parseReport(_this.report);
            // success!!!
            callback({ success: true, prg: _this.output, report: report });
            _this.displayResult();

//            console.log(_this.report);
//            console.log('labeldump-------');
//            console.log(_this.labelDump);
//            console.log('endlabeldump------');
            acme = null;
            options = null;
          } catch(e) {
            _this.stderr = 'Build failed';
            _this.displayResult();
            console.log('file doesn\'t exist');
            console.log(e);
          }
        }
      }
    ];

    // run it..
    var acme = Acme(options);
  },

  parseReport: function(report) {

    var lines = report.split("\n");
    var lastLabel = false;
    var lastFile = '';
    var lastAddress = '';

    var reportInfo = {
      memoryMap: [],
      sourceMap: [],
      lineMap: {}, // map line numbers to addresses
      addressMap: {}, // map addresses to line numbers
    };

    
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if(line != '' && line != "\r") {
        

        if(line[0] == ';') {
//          console.log('comment: ' + line);
        } else {
//          console.log("'" +  line + "'");
        }

        // get rid of comments, erase everything after and including ;        
        var pos = 0;
        var lineLength = 0;// line.length;
        var lineNumberStr = '';
        var labelStr = '';
        var instructionStr = '';
        var lineNumber = 0;
        var sourceLabel = '******** Source:';

        pos = line.indexOf(sourceLabel);
        if(pos != -1) {
          // got a file
          lastFile = line.substr(pos + sourceLabel.length).trim();
          if(typeof reportInfo.lineMap[lastFile] == 'undefined') {
            reportInfo.lineMap[lastFile] = [];
          }
        }

        pos = line.indexOf(';');
        if(pos != -1) {
          line = line.substr(0, pos);
        }
        pos = 0;

        lineLength = line.length;

        // parse the line number
        while(pos < lineLength && line[pos] != ' ') {
          lineNumberStr += line[pos++];
        }

        if(lineNumberStr != '') {
          var lineNo = parseInt(lineNumberStr, 10);
          if(!isNaN(lineNo)) {
            lineNumber = lineNo;
          }
        }

        // go past the spaces, count number of spaces
        var spaceCount = 0;
        while(pos < lineLength && line[pos] == ' ') {
          pos++;
          spaceCount++;
        }


        // next could be an address, read in until next space
        var addressStr = '';
        while(pos < lineLength && line[pos] != ' ') {
          addressStr += line[pos++];
        }


        if(spaceCount > 4) {
          // ok its prob not an address, is it a label tho?
          if(addressStr != '') {
            var firstChar = addressStr[0];
            // if first char is alpha, then prob a label
            if(firstChar.toLowerCase() != firstChar.toUpperCase()) {
              labelStr = addressStr;
              if(line.indexOf('=') != -1) {
                // its an assignment not an address label
                labelStr = '';
              }
            }
          }

          // its not an address, so blank address str
          addressStr = '';
        }
        // got to next non space
        while(pos < lineLength && line[pos] == ' ') {
          pos++;
        }

        // could now be bytes
        var bytesStr = '';
        while(pos < lineLength && line[pos] != ' ') {
          bytesStr += line[pos++];
        }

        // go past spaces
        while(pos < lineLength && line[pos] == ' ') {
          pos++;
        }

        // read until next space, could be an instruction
        while(pos < lineLength && line[pos] != ' ') {
          instructionStr += line[pos++];
        }

        if(instructionStr != '') {
          // want it to be an opcode instruction
          if(instructionStr[0].toLowerCase() == instructionStr[0].toUpperCase()) {
            // if non alpha, then its not an instruction
            instructionStr = '';
          } else {
          }
        }

        // if address is not blank, then have a line with an address
        if(addressStr != '') {
          var address = parseInt(addressStr, 16);
          var firstByte = 0;
          var byteCount = 0;

          if(!isNaN(address)) {
            lastAddress = address;
            byteCount = bytesStr.length / 2;
            // get the first byte
            if(bytesStr.length > 1) {
              var firstByteStr = bytesStr.substr(0, 2);
              firstByte = parseInt(firstByteStr, 16);
            }
            /*
            console.log('line number: ' + lineNumberStr);
            console.log('addr' + addressStr);
            console.log('bytes = ' + bytesStr);
            console.log('address = ' + address);
            console.log('first byte = ' + firstByte);
            console.log('instruction = ' + instructionStr);
            */
          }

          // addressmap should just replace sourcemap and memorymap?
          reportInfo.addressMap[address] = {
            lineNumber: lineNumber,
            label: lastLabel,
            file: lastFile,
            lineNumber: lineNumber
          };

          // if got an instruction, push it onto the report
          if(instructionStr != '') {
            var info = {
              address: address,
              b: firstByte,
              byteCount: byteCount,
              label: lastLabel,
              file: lastFile,
              lineNumber: lineNumber
            };
            reportInfo.sourceMap.push(info);
          } else {
            if(lastLabel !== false) {
              var info = {
                address: address,
                label: lastLabel,
                file: lastFile,
                lineNumber: lineNumber
              }
              reportInfo.memoryMap.push(info);
            }
          }
          lastLabel = false;
        } else if(labelStr != '') {
          lastLabel = labelStr;          
        }

        if(lineNumberStr != '') {
          while(reportInfo.lineMap[lastFile].length < lineNumber) {
            reportInfo.lineMap[lastFile].push(false);
          }
          reportInfo.lineMap[lastFile][lineNumber] = lastAddress;
        }
        

      }
    }


    return reportInfo;

  },

  displayResult: function() {


    
    var assemblerOutput = this.editor.assemblerOutput;

    var files = this.files;

    if(this.stderr != '') {
      var errorLines = this.stderr.split("\n");
      for(var i = 0; i < errorLines.length; i++) {
        var errorLine = errorLines[i].trim();

        if(errorLine != '') {

          var file = '';
          var lineNumber = false;

          var fileInfoPos = errorLine.indexOf(':');
          if(fileInfoPos > 0) {
            var fileInfo = errorLine.substring(0, fileInfoPos);
            var lineNumberPos = fileInfo.indexOf('(');
            if(lineNumberPos > 0) {
              var lineNumberText = fileInfo.substring(lineNumberPos + 1);
              lineNumberTextEnd = lineNumberText.indexOf(')');
              if(lineNumberTextEnd > 0) {
                lineNumberText = lineNumberText.substring(0, lineNumberTextEnd);
                lineNumber = parseInt(lineNumberText);
              }
              file = fileInfo.substring(0, lineNumberPos);
            }  
          }

          for(var j = 0; j < files.length; j++) {
            if(file == files[j].filePath) {
              if(typeof files[j].lineMap != 'undefined' && lineNumber < files[j].lineMap.length) {
                lineNumber = files[j].lineMap[lineNumber];
              }
            }
          }
          
          assemblerOutput.addOutputLine({
            text: errorLines[i],
            file: file,
            lineNumber: lineNumber
          });
        }
      }
    }
    assemblerOutput.showOutput();
    assemblerOutput.setReport(this.report);
  }
}