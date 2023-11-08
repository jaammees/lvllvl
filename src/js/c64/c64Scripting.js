var C64Scripting = function() {
  this.scriptProcessor = null;
}

C64Scripting.prototype = {
  init: function() {
    var _this = this;

    this.scriptProcessor = new Scripting();
    this.scriptProcessor.init({
      outputElementId: this.outputElementId
    });
    this.scriptProcessor.registerAPI(function(interpreter, scope) {
      _this.initAPI(interpreter, scope);
    });

    this.scriptProcessor.setPrescript('c64', this.apiPreScript());

    /*
    this.scriptProcessor.on('start', function() {
      _this.scriptStart();
    });

    this.scriptProcessor.on('end', function() {
      _this.scriptEnd();
    });
    */
  },

/*
  scriptStart: function() {
    $('#' + this.prefix + 'ScriptingRun').html('Stop Script');
  },

  scriptEnd: function() {
    $('#' + this.prefix + 'ScriptingRun').html('Start Script');
  },
*/

  getCompletions:  function(line, pos) {
    var completions = [];

    completions.push({
      value: 'c64.setColor',
      meta: 'Set C64 Colour'
    });

    return completions;

  },

  apiPreScript: function() {
    var script = '';
    var lineBreak = ";";//\n";

    script += 'c64.eventHandlers = {};' + lineBreak;

    script += 'c64.on = function(eventType, callback) {' + lineBreak;
//    script += ' console.log("add event handler" + eventType);' + lineBreak;

    script += ' Editor.on("c64." + eventType, callback);' + lineBreak;
    //script += ' Editor.on("c64." + eventType, function() { console.log("HERE") });' + lineBreak;
    /*
    script += '  if(eventType === "run") { ' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  } else {' + lineBreak;
    script += '    Editor.hasEventHandlers = true;' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  }';
    */
    script += '}' + lineBreak;

    script += 'c64.rasterY = function(rasterY, callback) { ' + lineBreak;
    script += '  console.log("rastery:" + rasterY);';
    script += '}' + lineBreak;

    return script;
  },


  initAPI: function(interpreter, scope) {
    var _this = this;

    var c64Read = function(address) {//, lineNumber) {      
      return c64_cpuRead(address);
    }

    var c64Write = function(address, value) {      
      c64_cpuWrite(address, value);
    }

    var c64SetColor = function(index, r, g, b) {
      index = index & 0xf;
      var color = r & 0xff;// ( (r & 0xff) + (g & 0xff) << 8 + (b & 0xff) << 16);
      color += (g & 0xff) << 8;
      color += (b & 0xff) << 16;

      color = (color >>> 0) + 0xff000000;
      c64_setColor(index, color);
    }

    // mouse down/mouse up events
    // screen refresh?


    // Graphic Object
    var c64Obj = interpreter.createObjectProto(interpreter.OBJECT_PROTO);
    interpreter.setProperty(scope, 'c64', c64Obj);

    /*
    // Graphic.getCurrentLayerDetails
    wrapper = function() {
      var result = GraphicAPI.getCurrentLayerDetails();
      return interpreter.nativeToPseudo(result);
    }
    */
    interpreter.setProperty(c64Obj, 'cpuWrite',
                            interpreter.createNativeFunction(c64_cpuWrite, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'cpuRead',
                            interpreter.createNativeFunction(c64_cpuRead, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'getPC',
                            interpreter.createNativeFunction(c64_getPC, false), 
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setPC',
                            interpreter.createNativeFunction(c64_setPC, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);
                            
    interpreter.setProperty(c64Obj, 'setColor',
                            interpreter.createNativeFunction(c64SetColor, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(c64Obj, 'getA',
                            interpreter.createNativeFunction(c64_getRegA, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setA',
                            interpreter.createNativeFunction(c64_setRegA, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);
                            
    interpreter.setProperty(c64Obj, 'getX',
                            interpreter.createNativeFunction(c64_getRegX, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setX',
                            interpreter.createNativeFunction(c64_setRegX, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'getY',
                            interpreter.createNativeFunction(c64_getRegY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setY',
                            interpreter.createNativeFunction(c64_setRegY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

                            
    interpreter.setProperty(c64Obj, 'getRasterY',
                            interpreter.createNativeFunction(c64_getRasterY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);



    interpreter.setProperty(scope, 'c64Write',
        interpreter.createNativeFunction(c64_cpuWrite, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64Read',
        interpreter.createNativeFunction(c64_cpuRead, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64GetPC',
        interpreter.createNativeFunction(c64_getPC, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetPC',
        interpreter.createNativeFunction(c64_setPC, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     


    interpreter.setProperty(scope, 'c64GetRegA',
        interpreter.createNativeFunction(c64_getRegA, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegA',
        interpreter.createNativeFunction(c64_setRegA, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     


    interpreter.setProperty(scope, 'c64GetRegX',
        interpreter.createNativeFunction(c64_getRegX, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegX',
        interpreter.createNativeFunction(c64_setRegX, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64GetRegY',
        interpreter.createNativeFunction(c64_getRegY, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegY',
        interpreter.createNativeFunction(c64_setRegY, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     



    interpreter.setProperty(scope, 'c64SetColor',
        interpreter.createNativeFunction(c64SetColor, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64_reset',
        interpreter.createNativeFunction(c64_reset, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.                 
  },



}