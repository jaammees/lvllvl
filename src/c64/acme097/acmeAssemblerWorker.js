//importScripts('foo.js', 'bar.js');       /* imports two scripts */
//importScripts('../../lib/acmeo/acme.js?35');
importScripts('acme.js?3115');


function base64ToBuffer( str ) {

  var b = atob( str );
  var buf = new Uint8Array( b.length );

  for ( var i = 0, l = buf.length; i < l; i ++ ) {
    buf[ i ] = b.charCodeAt( i );
  }
  return buf;
}

var acme = null;

var AcmeAssemblerWorker = function() {
  this.editor = null;
  this.preprocessor = null;

  this.stdout = '';
  this.stderr = '';
  this.output = '';
  this.report = '';
  this.errors = [];  
}


AcmeAssemblerWorker.prototype = {
  init: function() {
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
      //return '../../lib/acmeo/' + url;
      return url;
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

//    console.log(argsArray);

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
//          _this.displayResult();
          var errors = _this.getAssemblerErrors();
          
          callback({ success: false, errors: errors });
          acme = null;
          options = null;          
        } else {
          try {
//            _this.report = acme['FS'].readFile('report', { encoding: 'utf8' });    
//            _this.labelDump = acme['FS'].readFile('labeldump', { encoding: 'utf8' });    
//            _this.output = acme['FS'].readFile('output.prg', { encoding: 'binary' });  
            _this.output = options.FS.readFile('output.prg', { encoding: 'binary' });
            _this.report = options.FS.readFile('report', { encoding: 'utf8' });      
            _this.labelDump = options.FS.readFile('labeldump', { encoding: 'utf8' });    

            var report = _this.parseReport(_this.report);
            // success!!!
            callback({ success: true, prg: _this.output, report: report, reportRaw: _this.report });
            //_this.displayResult();

//            console.log(_this.report);
//            console.log('labeldump-------');
//            console.log(_this.labelDump);
//            console.log('endlabeldump------');
            acme = null;
            options = null;
          } catch(e) {
            _this.stderr = 'Build failed';
            callback({ success: false, errors: [{ lineNumber: 0, text: "Build Failed" }] });
//            _this.displayResult();
            console.log('file doesn\'t exist');
            console.log(e);
            acme = null;
            options = null;            
          }
        }
      }
    ];

    // run it..
    acme = Acme(options);
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

        // get rid of comments, erase everything after and including ;        
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
//          console.log('address str = "' + addressStr + '"');
          var address = parseInt(addressStr, 16);
          var firstByte = 0;
          var byteCount = 0;

          if(!isNaN(address)) {
//            console.log('nan');
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
          }
//          } else {
            if(lastLabel !== false) {
              var info = {
                address: address,
                label: lastLabel,
                file: lastFile,
                lineNumber: lineNumber
              }
              reportInfo.memoryMap.push(info);
            }
  //        }
          lastLabel = false;
        } else if(labelStr != '') {
//          console.log('set last label to : ' + labelStr);
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

  getAssemblerErrors: function() {
    var errors = [];
    
//    var assemblerOutput = this.editor.assemblerOutput;

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
          
          /*
          assemblerOutput.addOutputLine({
            text: errorLines[i],
            file: file,
            lineNumber: lineNumber
          });
          */
         errors.push({
          text: errorLines[i],
          file: file,
          lineNumber: lineNumber
         });

        }
      }
    }

    return errors;
  }
}


var acmeAssembler = new AcmeAssemblerWorker();

onmessage = function(e) {
  var data = e.data;

  acmeAssembler.assemble(data.files, data.config, function(result) {
//    console.log("DONE!");
//    console.log(result);
    postMessage(result);
    console.log('assembler worker done');
    acme = null;
  });


  /*
  let result = e.data[0] * e.data[1];
  if (isNaN(result)) {
    postMessage('Please write two numbers');
  } else {
    let workerResult = 'Result: ' + result;
    console.log('Worker: Posting message back to main script');
    postMessage(workerResult);
  }
  */
}