var AssemblerPreprocessor = function() {
  this.editor = null;
  this.scriptProcessor = null;

  this.output = '';
  this.lineMap = [];
  
}

AssemblerPreprocessor.prototype = {
  init: function(editor) {
    this.editor = editor;

    var _this = this;
    this.scriptProcessor = new Scripting();
    this.scriptProcessor.init();
    this.scriptProcessor.registerAPI(function(interpreter, scope) {
      _this.initAPI(interpreter, scope);
    });


  },

  initAPI: function(interpreter, scope) {
    // console.log
    var _this = this;
    var writeLn = function(line, sourceLine) {//, lineNumber) {
      _this.output += line + "\n";

      // should count newline characters also...
      if(typeof sourceLine != 'undefined') {  
        _this.lineMap[_this.currentLine] = sourceLine;
      } else {
        _this.lineMap[_this.currentLine] = _this.lineMap[_this.currentLine - 1];
      }
      _this.currentLine++;
    }
    var write = function(line, sourceLine) {//, lineNumber) {
      _this.output += line;
    }

    interpreter.setProperty(scope, 'writeLn',
        interpreter.createNativeFunction(writeLn, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'write',
        interpreter.createNativeFunction(write, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    var createBin = function(args) {
      console.log("CREATE BIN!!!!");
    }

    // Graphic.setFrameDuration 
    var wrapper = function(args) {
      var result = g_app.textModeEditor.createBin(interpreter.pseudoToNative(args));
      if(result.success) {
        return '"' + result.path + '"';
      } else {
        return "error!!!";
      }
    }  


    interpreter.setProperty(scope, 'createBin', 
                    interpreter.createNativeFunction(wrapper, false),
                    Interpreter.NONENUMERABLE_DESCRIPTOR);


  },

  preprocess: function(code) {
    
    var output = '';
    var line = '';
    var inScript = false;
    var scriptMode = 'normal';
    var hasScript = false;

    var sourceLine = 0;

    // put end of line character at end if it doesn't have one
//    console.log(code[code.length - 1]);
    if(code[code.length - 1] != '\n') {
      code += '\n';
    }

    var codeLength = code.length;
    for(var i = 0; i < codeLength; i++) {
      var ch = code[i];
      var nextCh = '';
      if(i < codeLength + 1) {
        nextCh = code[i + 1];
      }

      if(ch == '\r') {
        // ignore
      } else if(ch == '\n') {
        if(inScript) {
          switch(scriptMode) {
            case 'normal':
              // just normal script, not outputting
              output += line + '\n';
              break;
          }
        } else {
          // outputting asm
          output += 'writeLn(' + JSON.stringify(line) + ', ' + sourceLine + ');' + '\n';
        }
        sourceLine ++;
        line = '';
      } else if(ch == '<' && nextCh == '%') {
        // entering script..
        inScript = true;
        hasScript = true;

        // if theres anything in the line, output it
        if(line != '') {
          output += 'write(' + JSON.stringify(line) + ', ' + sourceLine + ');' + '\n';
          line = '';
        }

        i++;
        scriptMode = 'normal';

        if(i < codeLength + 1) {
          nextCh = code[i + 1];
        }

        if(nextCh == '=') {
          // its a <%= tag
          scriptMode = 'output';
          i++;
        }

      } else if(ch == '%' && nextCh == '>') {
        inScript = false;
        i++;

        // if theres anything in the line, output it
        if(line.trim() != '') {
          switch(scriptMode) {
            case 'normal':
              output += line;
            break;
            case 'output':
              output += 'write(' + line + ', ' + sourceLine + ');';
            break;
          }
        }
        line = '';
      } else {
        line += ch;
      }
    }

    this.lineMap = [];

    if(hasScript) {

      this.output = '';
      this.lineMap = [];
      this.currentLine = 0;
      var errors = [];

      this.scriptProcessor.runScripts([ {content: output, filePath: 'asmcode'} ], { errorHandler: function(error) {
        errors.push(error);
      }});


      if(errors.length > 0) {
        return { success: false, errors: errors };
      } else {
        return { success: true, content: this.output, lineMap: this.lineMap };
      }
    } else {
      // no preprocessing needed
      return { success: true, content: code, lineMap: this.lineMap };
    }
  },


  preprocessSourceFiles: function(sourceFiles) {  

    var doc = g_app.doc;
    var files = doc.dir('/asm');
    
    var errors = [];

    // preprocess and write out the asm files
//    for(var i =0 ; i < files.length; i++) {
    for(var i = 0; i < sourceFiles.length; i++) {  
      var file = sourceFiles[i];

      if(file.type === 'asm') {
        var content = file.content;
        var result = this.preprocess(content);

        if(result.success) {
          file.content = result.content;
          file.lineMap = result.lineMap;
        } else {
          //var errors = result.errors;
          for(var k = 0; k < result.errors.length; k++) {
            errors.push({
              filePath: file.filePath,// remove filepath?
              file: file.filePath,  
              lineNumber: result.errors[k].lineNumber,
              message: result.errors[k].message,  // remove message?
              text: result.errors[k].message
            });
          }
        }
      }
    }



    if(errors.length === 0) {
      return {
        success: true
      };
    } else {
      return {
        success: false,
        errors: errors

      };
    }

  }

}