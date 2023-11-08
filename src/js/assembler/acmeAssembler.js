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
      return 'c64/acmeo/' + url;
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

  processAssemblerResponse: function(result, callback) {
    var _this = this;

    var assemblerOutput = this.assemblerOutput;
    if(result.success) {
      assemblerOutput.setReport(result.reportRaw);

      this.assemblerOutput.addOutputLine({
        text: "Done"
      });       

      var size = result.prg.length;
      this.assemblerOutput.addOutputLine({
        text: "Size: " + size.toLocaleString()
      });     

/*
      if(typeof result.report.addressMap !== 'undefined') {
        var addressMap = result.report.addressMap;
        var text = '';

        var i = 0;
        var label = 'entry point';
        text += ('0000' + addressMap[i].address.toString(16)).substr(-4);

        text += ": " + label;
        this.assemblerOutput.addOutputLine({
          text: text
        });     

      }
*/

      this.assemblerMemoryMap = [];
      if(typeof result.report.memoryMap !== 'undefined') {
        var memoryMap = result.report.memoryMap;
        for(var i = 0; i < memoryMap.length; i++) {
          var text = '';
          text += ('0000' + memoryMap[i].address.toString(16)).substr(-4);
          text += ": " + memoryMap[i].label;
          this.assemblerMemoryMap.push(text);

          /*
          this.assemblerOutput.addOutputLine({
            text: text
          });     
          */
        }
      }


      //this.assemblerOutput.showOutput();

      callback(result);

      // disable exomizer for now

      if(false) {
        this.assemblerOutput.addOutputLine({
          text: "Running Exomizer..."
        });       
        this.runExomizer(result.prg, function(exomizerResult) {

          var size = exomizerResult.prg.length;
          console.log(exomizerResult);
//          callback(exomizerResult);

          _this.assemblerOutput.addOutputLine({
            text: "Exomizer Size: " + size.toLocaleString()
          });       
          for(var i = 0; i < _this.assemblerMemoryMap.length; i++) {
            _this.assemblerOutput.addOutputLine({
              text: _this.assemblerMemoryMap[i]
            });
          }
          _this.assemblerOutput.showOutput();


        });
      }

    } else {
      if(typeof result.errors != 'undefined') {
        for(var i = 0; i < result.errors.length; i++) {
          assemblerOutput.addOutputLine(result.errors[i]);
        }
      }
      assemblerOutput.showOutput();
      assemblerOutput.setReport('');
    }
  }
}