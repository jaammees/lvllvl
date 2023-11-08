importScripts('exomizer.js?35');

var ExomizerWorker = function() {
  this.editor = null;
  this.preprocessor = null;

  this.stdout = '';
  this.stderr = '';
  this.output = '';
  this.report = '';
  this.errors = [];  
}


var exomizer = null;

ExomizerWorker.prototype = {
  init: function() {
  },

  run: function(file, config, callback) {
    var _this = this;

    this.file = file;

    this.stdout = '';
    this.stderr = '';
    this.output = '';

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

        FS.writeFile('input.prg', file, { encoding: 'binary' });
      }
    ]; 
    // -- end options.preRun


    var args = config['arguments'];
    if(typeof args == 'undefined') {
      console.log('args not defined...');
      args = '';
//      args = '--format cbm'
    }

    args = args.split(' ');

    var argsArray = [];
    for(var i = 0; i < args.length; i++) {
      var arg = args[i].trim();
      if(arg != '') {
        argsArray.push(arg);
      }
    }

    //exomizer sfx sys build.prg -o output.prg    


    argsArray.push('sfx');
    argsArray.push('sys');
    argsArray.push('input.prg');
    argsArray.push('-o');
    argsArray.push('output.prg');

    options.arguments = argsArray;


    options.postRun = [
      function() {

        if(_this.stderr != '') {
          console.log('error!!!');
          console.log(_this.stderr);
          exomizer = null;
          options = null;
        } else {
          try {
            _this.output = exomizer['FS'].readFile('output.prg', { encoding: 'binary' });  

            callback({ success: true, prg: _this.output });
            exomizer = null;
            options = null;
          } catch(e) {
            exomizer = null;
            options = null;
            _this.stderr = 'Build failed';
            callback({ success: false, errors: [{ lineNumber: 0, text: "Build Failed" }] });
            console.log('file doesn\'t exist');
            console.log(e);
          }
        }
      }
    ];
    // run it..

//    console.log('options');
//    console.log(options);
    exomizer = Exomizer(options);  
  }
}

var exomizerWorker = new ExomizerWorker();

onmessage = function(e) {
  console.log('Worker: Message received from main script');
  console.log(e.data);
  var data = e.data;

  exomizerWorker.run(data.file, data.config, function(result) {
    exomizer = null;
    postMessage(result);
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