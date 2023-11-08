var CA65Assembler = function() {
  this.stdout = '';
  this.stderr = '';
  this.output = '';
  this.report = '';

  this.objectFiles = [];
  
}

CA65Assembler.prototype = {

  init: function(editor) {
    this.editor = editor;
//    this.preprocessor = new AssemblerPreprocessor();
//    this.preprocessor.init(editor);
  },


  assemble: function(files, config, callback) {

    var _this = this;

    this.files = files;

    this.stdout = '';
    this.stderr = '';
    this.output = '';
    this.report = '';
    this.objectFiles = [];


    var options = {};

    options.locateFile = function(url) {
      return 'lib/ca65/' + url;
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
            case 'cfg':
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

    // add the files..
    options.arguments = [];

    if(typeof config.files !== 'undefined') {
      options.arguments.push(config.files);
    } else {
      options.arguments.push('main.asm');
    }

    
//    options.arguments.push('main.asm');
    options.arguments.push('-g');

    options.arguments.push('-o');
    options.arguments.push('output.o');    


/*
    options.arguments = [
      '-g', // add debug info
      '-o', 'output.o',
      '--format', 'cbm',
      '--msvc',
      '-r', 'report'
    ];
*/


    options.postRun = [
      function() {
        if(_this.stderr != '') {
          _this.displayResult();

        } else {
          $('#buildOutputPanel').html(_this.stdout);
          try {
            _this.output = ca65['FS'].readFile('output.o', { encoding: 'binary' });   

            _this.objectFiles.push({ filename: 'output.o', data: _this.output });

            _this.linkObjectFiles(config, callback);

            ca65 = null;
            options = null;

          } catch(e) {
            console.error('file doesn\'t exist');
            console.log(e);
          }
        }
      }
    ];

    // run it..
    var ca65 = CA65(options);
  },

  linkObjectFiles: function(config, callback) {

    var _this = this;


    
    this.stdout = '';
    this.stderr = '';
    this.output = '';
    this.report = '';


    var options = {};


    // get the config content
    var doc = g_app.doc;
    var configDocRecord = null;
    var configFilename = false;
    var configContent = '';

    var configFile = config.cc65ConfigFile;
    
    if(typeof configFile != 'undefined') {
      configDocRecordPath = '/asm/' + config.cc65ConfigFile;
      configDocRecord = doc.getDocRecord(configDocRecordPath);
      if(configDocRecord) {
        configFilename = configDocRecord.name;
        configContent = configDocRecord.data;
      }
    }



    options.locateFile = function(url) {
      return 'lib/ca65/' + url;
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


        

        var doc = g_app.doc;

        /*
        var configDocRecord = null;
        var configDocRecordPath = false;
        var configFilename = false;

        var configFile = config.cc65ConfigFile;
        
        console.log(config);
        console.log('config file = ');
        console.log(configFile);
        if(typeof configFile != 'undefined') {
          configDocRecordPath = '/asm/' + config.cc65ConfigFile;
          configDocRecord = doc.getDocRecord(configDocRecordPath);
          if(configDocRecord) {
            var configFilename = configDocRecord.name;
            var content = configDocRecord.data;
            console.log("LINK ADDING " + filename);
            console.log(content);
            

            options.FS.writeFile(configFilename, content, { encoding: 'utf8' });
          }

        }
        */

        /*
        if(!configDocRecord) {
          console.log('config not set, look for it');
          var files = doc.dir('/asm/cfg');

          for(var i =0 ; i < files.length; i++) {          
            var file = files[i];

            var filename = file.name;
            var content = file.data;

            if(filename == 'nes.cfg' || filename == 'c64-asm.cfg') {
              // only add the config file
              console.log('link adding: ' + filename);
              options.FS.writeFile(filename, content, { encoding: 'utf8' });
            }
          }
        }
        */
        options.FS.writeFile(configFilename, configContent, { encoding: 'utf8' });

        for(var i = 0; i < _this.objectFiles.length; i++) {
          options.FS.writeFile(_this.objectFiles[i].filename, _this.objectFiles[i].data, { encoding: 'binary'});
        }

      }
    ];    
//        'arguments': ['-o', 'example.nes', '-C', 'example.cfg', 'example.o'],

//    var configFilename = 'c64-asm.cfg';
//    var configFile = config.cc65ConfigFile;

    // add the files..
    options.arguments = [];
    options.arguments.push('-o');

    if(config.target == 'nes') {
      options.arguments.push('output.nes');    
    } else {
      options.arguments.push('output.prg');    
    }
//    options.arguments.push('-C');
//    options.arguments.push('nes.cfg');

    if(configFilename !== false) {
      options.arguments.push('-C');
      options.arguments.push(configFilename);
    }

//    options.arguments.push('c64-asm.cfg');

    // object files
    for(var i = 0; i < this.objectFiles.length; i++) {
      options.arguments.push(this.objectFiles[i].filename);
    }



/*
    options.arguments = [
      '-g', // add debug info
      '-o', 'output.o',
      '--format', 'cbm',
      '--msvc',
      '-r', 'report'
    ];
*/


    options.postRun = [
      function() {
        if(_this.stderr != '') {
          _this.displayResult();
        } else {
//          $('#buildOutputPanel').html(_this.stdout);
          try {

            var outputFile = 'output.prg';

            if(config.target == 'nes') {
              outputFile = 'output.nes';
            }

            _this.linkerOutput = ld65['FS'].readFile(outputFile, { encoding: 'binary' });    
            //download(_this.linkerOutput, 'test.prg', "application/prg");   

            // success!!!
            callback({ success: true, prg: _this.linkerOutput });


            ld65 = null;
            options = null;

          } catch(e) {
            console.error('file doesn\'t exist');
            console.log(e);
          }
        }
      }
    ];

    // run it..
    var ld65 = LD65(options);    
  },


  // display assembler output
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

          // get the real line in the file
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
  }



}