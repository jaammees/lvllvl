
var Exomizer = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  return (
function(Exomizer) {
  Exomizer = Exomizer || {};

// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Exomizer !== 'undefined' ? Exomizer : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

Module['arguments'] = [];
Module['thisProgram'] = './this.program';
Module['quit'] = function(status, toThrow) {
  throw toThrow;
};
Module['preRun'] = [];
Module['postRun'] = [];

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// A web environment like Electron.js can have Node enabled, so we must
// distinguish between Node-enabled environments and Node environments per se.
// This will allow the former to do things like mount NODEFS.
ENVIRONMENT_HAS_NODE = typeof process === 'object' && typeof require === 'function';
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (Module['ENVIRONMENT']) {
  throw new Error('Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)');
}


// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)




// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  } else {
    return scriptDirectory + path;
  }
}

if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + '/';

  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  var nodeFS;
  var nodePath;

  Module['read'] = function shell_read(filename, binary) {
    var ret;
    ret = tryParseAsDataURI(filename);
    if (!ret) {
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      ret = nodeFS['readFileSync'](filename);
    }
    return binary ? ret : ret.toString();
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  if (process['argv'].length > 1) {
    Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
  }

  Module['arguments'] = process['argv'].slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });
  // Currently node will swallow unhandled rejections, but this behavior is
  // deprecated, and in the future it will exit with error status.
  process['on']('unhandledRejection', abort);

  Module['quit'] = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
} else
if (ENVIRONMENT_IS_SHELL) {


  if (typeof read != 'undefined') {
    Module['read'] = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  Module['readBinary'] = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof quit === 'function') {
    Module['quit'] = function(status) {
      quit(status);
    }
  }
} else
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE (and not _INSTANCE), this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }


  Module['read'] = function shell_read(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    Module['readBinary'] = function readBinary(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  Module['readAsync'] = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  Module['setWindowTitle'] = function(title) { document.title = title };
} else
{
  throw new Error('environment detection error');
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
// If the user provided Module.print or printErr, use that. Otherwise,
// console.log is checked first, as 'print' on the web will open a print dialogue
// printErr is preferable to console.warn (works better in shells)
// bind(console) is necessary to fix IE/Edge closed dev tools panel behavior.
var out = Module['print'] || (typeof console !== 'undefined' ? console.log.bind(console) : (typeof print !== 'undefined' ? print : null));
var err = Module['printErr'] || (typeof printErr !== 'undefined' ? printErr : ((typeof console !== 'undefined' && console.warn.bind(console)) || out));

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = undefined;

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
assert(typeof Module['memoryInitializerPrefixURL'] === 'undefined', 'Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['pthreadMainPrefixURL'] === 'undefined', 'Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['cdInitializerPrefixURL'] === 'undefined', 'Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead');
assert(typeof Module['filePackagePrefixURL'] === 'undefined', 'Module.filePackagePrefixURL option was removed, use Module.locateFile instead');



// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// {{PREAMBLE_ADDITIONS}}

var STACK_ALIGN = 16;

// stack management, and other functionality that is provided by the compiled code,
// should not be used before it is ready
stackSave = stackRestore = stackAlloc = function() {
  abort('cannot use the stack before compiled code is ready to run, and has provided stack access');
};

function staticAlloc(size) {
  abort('staticAlloc is no longer available at runtime; instead, perform static allocations at compile time (using makeStaticAlloc)');
}

function dynamicAlloc(size) {
  assert(DYNAMICTOP_PTR);
  var ret = HEAP32[DYNAMICTOP_PTR>>2];
  var end = (ret + size + 15) & -16;
  if (end > _emscripten_get_heap_size()) {
    abort('failure to dynamicAlloc - memory growth etc. is not supported there, call malloc/sbrk directly');
  }
  HEAP32[DYNAMICTOP_PTR>>2] = end;
  return ret;
}

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

var asm2wasmImports = { // special asm2wasm imports
    "f64-rem": function(x, y) {
        return x % y;
    },
    "debugger": function() {
        debugger;
    }
};



var jsCallStartIndex = 1;
var functionPointers = new Array(0);

// Wraps a JS function as a wasm function with a given signature.
// In the future, we may get a WebAssembly.Function constructor. Until then,
// we create a wasm module that takes the JS function as an import with a given
// signature, and re-exports that as a wasm function.
function convertJsFunctionToWasm(func, sig) {

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    e: {
      f: func
    }
  });
  var wrappedFunc = instance.exports.f;
  return wrappedFunc;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  var table = wasmTable;
  var ret = table.length;

  // Grow the table
  try {
    table.grow(1);
  } catch (err) {
    if (!err instanceof RangeError) {
      throw err;
    }
    throw 'Unable to grow wasm table. Use a higher value for RESERVED_FUNCTION_POINTERS or set ALLOW_TABLE_GROWTH.';
  }

  // Insert new element
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    table.set(ret, func);
  } catch (err) {
    if (!err instanceof TypeError) {
      throw err;
    }
    assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction');
    var wrapped = convertJsFunctionToWasm(func, sig);
    table.set(ret, wrapped);
  }

  return ret;
}

function removeFunctionWasm(index) {
  // TODO(sbc): Look into implementing this to allow re-using of table slots
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {


  var base = 0;
  for (var i = base; i < base + 0; i++) {
    if (!functionPointers[i]) {
      functionPointers[i] = func;
      return jsCallStartIndex + i;
    }
  }
  throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';

}

function removeFunction(index) {

  functionPointers[index-jsCallStartIndex] = null;
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
  if (!func) return; // on null pointer, return undefined
  assert(sig);
  if (!funcWrappers[sig]) {
    funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
    // optimize away arguments usage in common cases
    if (sig.length === 1) {
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func);
      };
    } else if (sig.length === 2) {
      sigCache[func] = function dynCall_wrapper(arg) {
        return dynCall(sig, func, [arg]);
      };
    } else {
      // general case
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func, Array.prototype.slice.call(arguments));
      };
    }
  }
  return sigCache[func];
}


function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

function dynCall(sig, ptr, args) {
  if (args && args.length) {
    assert(args.length == sig.length-1);
    assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
    return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
  } else {
    assert(sig.length == 1);
    assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
    return Module['dynCall_' + sig].call(null, ptr);
  }
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
}

var getTempRet0 = function() {
  return tempRet0;
}

function getCompilerSetting(name) {
  throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for getCompilerSetting or emscripten_get_compiler_setting to work';
}

var Runtime = {
  // helpful errors
  getTempRet0: function() { abort('getTempRet0() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
  staticAlloc: function() { abort('staticAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
  stackAlloc: function() { abort('stackAlloc() is now a top-level function, after removing the Runtime object. Remove "Runtime."') },
};

// The address globals begin at. Very low in memory, for code size and optimization opportunities.
// Above 0 is static memory, starting with globals.
// Then the stack.
// Then 'dynamic' memory for sbrk.
var GLOBAL_BASE = 1024;




// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html



if (typeof WebAssembly !== 'object') {
  abort('No WebAssembly support found. Build with -s WASM=0 to target JavaScript instead.');
}


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}





// Wasm globals

var wasmMemory;

// Potentially used for direct table calls.
var wasmTable;


//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  assert(returnType !== 'array', 'Return type should not be "array".');
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_DYNAMIC = 2; // Cannot be freed except through sbrk
var ALLOC_NONE = 3; // Do not allocate

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc,
    stackAlloc,
    dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var stop;
    ptr = ret;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
}




/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  abort("this function has been removed - you should use UTF8ToString(ptr, maxBytesToRead) instead!");
}

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}


// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = u8Array[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        if ((u0 & 0xF8) != 0xF0) warnOnce('Invalid UTF-8 leading byte 0x' + u0.toString(16) + ' encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!');
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (u8Array[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      if (u >= 0x200000) warnOnce('Invalid Unicode code point 0x' + u.toString(16) + ' encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF).');
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}


// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr) {
  assert(ptr % 2 == 0, 'Pointer passed to UTF16ToString must be aligned to two bytes!');
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = '';
    while (1) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 2 == 0, 'Pointer passed to stringToUTF16 must be aligned to two bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr) {
  assert(ptr % 4 == 0, 'Pointer passed to UTF32ToString must be aligned to four bytes!');
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(outPtr % 4 == 0, 'Pointer passed to stringToUTF32 must be aligned to four bytes!');
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  assert(array.length >= 0, 'writeArrayToMemory array must have a length (should be an array or typed array)')
  HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}





function demangle(func) {
  return func;
}

function demangleAll(text) {
  var regex =
    /__Z[\w\d_]+/g;
  return text.replace(regex,
    function(x) {
      var y = demangle(x);
      return x === y ? x : (y + ' [' + x + ']');
    });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  var js = jsStackTrace();
  if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
  return demangleAll(js);
}



// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferViews() {
  Module['HEAP8'] = HEAP8 = new Int8Array(buffer);
  Module['HEAP16'] = HEAP16 = new Int16Array(buffer);
  Module['HEAP32'] = HEAP32 = new Int32Array(buffer);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buffer);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buffer);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buffer);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buffer);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buffer);
}


var STATIC_BASE = 1024,
    STACK_BASE = 4505440,
    STACKTOP = STACK_BASE,
    STACK_MAX = 9748320,
    DYNAMIC_BASE = 9748320,
    DYNAMICTOP_PTR = 4505408;

assert(STACK_BASE % 16 === 0, 'stack must start aligned');
assert(DYNAMIC_BASE % 16 === 0, 'heap must start aligned');



var TOTAL_STACK = 5242880;
if (Module['TOTAL_STACK']) assert(TOTAL_STACK === Module['TOTAL_STACK'], 'the stack size can no longer be determined at runtime')

var INITIAL_TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
if (INITIAL_TOTAL_MEMORY < TOTAL_STACK) err('TOTAL_MEMORY should be larger than TOTAL_STACK, was ' + INITIAL_TOTAL_MEMORY + '! (TOTAL_STACK=' + TOTAL_STACK + ')');

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined,
       'JS engine does not provide full typed array support');







// Use a provided buffer, if there is one, or else allocate a new one
if (Module['buffer']) {
  buffer = Module['buffer'];
  assert(buffer.byteLength === INITIAL_TOTAL_MEMORY, 'provided buffer should be ' + INITIAL_TOTAL_MEMORY + ' bytes, but it is ' + buffer.byteLength);
} else {
  // Use a WebAssembly memory where available
  if (typeof WebAssembly === 'object' && typeof WebAssembly.Memory === 'function') {
    assert(INITIAL_TOTAL_MEMORY % WASM_PAGE_SIZE === 0);
    wasmMemory = new WebAssembly.Memory({ 'initial': INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE });
    buffer = wasmMemory.buffer;
  } else
  {
    buffer = new ArrayBuffer(INITIAL_TOTAL_MEMORY);
  }
  assert(buffer.byteLength === INITIAL_TOTAL_MEMORY);
}
updateGlobalBufferViews();


HEAP32[DYNAMICTOP_PTR>>2] = DYNAMIC_BASE;


// Initializes the stack cookie. Called at the startup of main and at the startup of each thread in pthreads mode.
function writeStackCookie() {
  assert((STACK_MAX & 3) == 0);
  HEAPU32[(STACK_MAX >> 2)-1] = 0x02135467;
  HEAPU32[(STACK_MAX >> 2)-2] = 0x89BACDFE;
}

function checkStackCookie() {
  var cookie1 = HEAPU32[(STACK_MAX >> 2)-1];
  var cookie2 = HEAPU32[(STACK_MAX >> 2)-2];
  if (cookie1 != 0x02135467 || cookie2 != 0x89BACDFE) {
    abort('Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x02135467, but received 0x' + cookie2.toString(16) + ' ' + cookie1.toString(16));
  }
  // Also test the global address 0 for integrity.
  if (HEAP32[0] !== 0x63736d65 /* 'emsc' */) abort('Runtime error: The application has corrupted its heap memory area (address zero)!');
}

function abortStackOverflow(allocSize) {
  abort('Stack overflow! Attempted to allocate ' + allocSize + ' bytes on the stack, but stack has only ' + (STACK_MAX - stackSave() + allocSize) + ' bytes available!');
}


  HEAP32[0] = 0x63736d65; /* 'emsc' */



// Endianness check (note: assumes compiler arch was little-endian)
HEAP16[1] = 0x6373;
if (HEAPU8[2] !== 0x73 || HEAPU8[3] !== 0x63) throw 'Runtime error: expected the system to be little-endian!';

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  checkStackCookie();
  assert(!runtimeInitialized);
  runtimeInitialized = true;
  if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  checkStackCookie();
  FS.ignorePermissions = false;
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  checkStackCookie();
  runtimeExited = true;
}

function postRun() {
  checkStackCookie();
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}


assert(Math.imul, 'This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.fround, 'This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.clz32, 'This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');
assert(Math.trunc, 'This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill');

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_max = Math.max;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;



// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            err('still waiting on run dependencies:');
          }
          err('dependency: ' + dep);
        }
        if (shown) {
          err('(end of list)');
        }
      }, 10000);
    }
  } else {
    err('warning: run dependency added without ID');
  }
}

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    err('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;






// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return String.prototype.startsWith ?
      filename.startsWith(dataURIPrefix) :
      filename.indexOf(dataURIPrefix) === 0;
}




var wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABjQIlYAN/f38BfWAEf39/fwF9YAF/AX9gAX8AYAJ/fwBgA39/fwBgAn9/AX9gA39/fwF/YAZ/fH9/f38Bf2ADf35/AX5gAABgAAF/YAV/f39/fwBgBn9/f39/fwBgB39/f39/f38AYAl/f39/f39/f38Bf2AEf39/fwBgBH9/f38Bf2AFf39/f38Bf2AEf39/fgF+YAJ/fgBgAnx8AXxgB39/f39/f38Bf2ADfn9/AX9gAn5/AX9gAXwBfmACfH8BfGADf39/AXxgBX9/f39/AXxgBn9/f39/fwF8YAJ/fwF+YAN/f34AYAN/fn8Bf2ABfwF+YAV/f39/fwF9YAd/f3x/f39/AX9gBH9/fn8BfgLPBSQDZW52BWFib3J0AAoDZW52EmFib3J0U3RhY2tPdmVyZmxvdwADA2Vudg1udWxsRnVuY19maWlpAAMDZW52Dm51bGxGdW5jX2ZpaWlpAAMDZW52C251bGxGdW5jX2lpAAMDZW52EG51bGxGdW5jX2lpZGlpaWkAAwNlbnYMbnVsbEZ1bmNfaWlpAAMDZW52DW51bGxGdW5jX2lpaWkAAwNlbnYNbnVsbEZ1bmNfamlqaQADA2VudgtudWxsRnVuY192aQADA2VudgxudWxsRnVuY192aWkAAwNlbnYNbnVsbEZ1bmNfdmlpaQADA2VudgdfX19sb2NrAAMDZW52C19fX3NldEVyck5vAAMDZW52DV9fX3N5c2NhbGwxNDAABgNlbnYNX19fc3lzY2FsbDE0NQAGA2Vudg1fX19zeXNjYWxsMTQ2AAYDZW52DV9fX3N5c2NhbGwyMjEABgNlbnYLX19fc3lzY2FsbDUABgNlbnYMX19fc3lzY2FsbDU0AAYDZW52C19fX3N5c2NhbGw2AAYDZW52CV9fX3VubG9jawADA2VudhlfZW1zY3JpcHRlbl9nZXRfaGVhcF9zaXplAAsDZW52Fl9lbXNjcmlwdGVuX21lbWNweV9iaWcABwNlbnYXX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAAAgNlbnYFX2V4aXQAAwNlbnYXYWJvcnRPbkNhbm5vdEdyb3dNZW1vcnkAAgNlbnYLc2V0VGVtcFJldDAAAwNlbnYNX19tZW1vcnlfYmFzZQN/AANlbnYMX190YWJsZV9iYXNlA38AA2Vudg10ZW1wRG91YmxlUHRyA38AA2Vudg5EWU5BTUlDVE9QX1BUUgN/AAZnbG9iYWwDTmFOA3wABmdsb2JhbAhJbmZpbml0eQN8AANlbnYGbWVtb3J5AgCAAgNlbnYFdGFibGUBcAGACoAKA5sDmQMCAgsDBAwDBgQCDQ4EAgYEBQMFDwUFBQEABAQDBAUFBwIEEAUCBAQCBQUEBAQEAwICAwUQBQYNERAEEBAKBAQMDAwGAwMQBAMLEQYLAwYGAwsDBgoDCgMKCgMCBAQDBAQCAgYGAwMDAwcCAgYCAgYHAwQDBAcEBgYKCgQGBwICAwMLAwMEBAQCBAIGBwcEBgcHEQMDAwQGBgMDAwcGBgYEBAIHBxIGBQMFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUGBQUFBQUFBQUGBQUFBQUFBQUFBQUFBQUFBQUFBgYFBgYGBQYGBgUFBgYFBgUHBRACBgYCAwMDBQQGBwsDBAwEAwMDAgQGEQQHBhEFAgUCBwkCCwIHBxMUEwICAgIHAgIVBgIHBxEHCAQSFgIDBQIQFxgYBwwGBwsLBwIZGgcbHB0eGhUVGhUZAgYGEQsGBgIGEQMLBgYCBgILCgICAgIHBwYfAgcHICAGBwYCAwIGISECBhECBgIGBgICAwYGBgQHBwcCASIGIwcRJAQFEAABAggGBwkDBAUSBmQQfwEjAgt/ASMDC38BQQALfwFBAAt/AUEAC38BQQALfwFBAAt/AUEAC38BQQALfAFEAAAAAAAAAAALfAEjBAt8ASMFC38BQeD+kgILfwFB4P7SBAt9AUMAAAAAC30BQwAAAAALB9cCGBBfX2dyb3dXYXNtTWVtb3J5ABwRX19fZXJybm9fbG9jYXRpb24ArgIHX2ZmbHVzaAD4AgVfZnJlZQCXAwVfbWFpbgAqB19tYWxsb2MAlgMHX21lbWNweQCcAwhfbWVtbW92ZQCdAwdfbWVtc2V0AJ4DBV9zYnJrAJ8DDGR5bkNhbGxfZmlpaQCgAw1keW5DYWxsX2ZpaWlpAKEDCmR5bkNhbGxfaWkAogMPZHluQ2FsbF9paWRpaWlpAKMDC2R5bkNhbGxfaWlpAKQDDGR5bkNhbGxfaWlpaQClAwxkeW5DYWxsX2ppamkAtAMKZHluQ2FsbF92aQCnAwtkeW5DYWxsX3ZpaQCoAwxkeW5DYWxsX3ZpaWkAqQMTZXN0YWJsaXNoU3RhY2tTcGFjZQAgCnN0YWNrQWxsb2MAHQxzdGFja1Jlc3RvcmUAHwlzdGFja1NhdmUAHgn7EwEAIwELgAqqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDNKoDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOqA6oDqgOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwMzqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOrA6sDqwOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6oCrAOsA6wDrAOsA6wDrAOsA6wDrAOsAyWsAymsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA6wDrAOsA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA8MCrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOtA60DrQOuA64DhwKuA4UChAKuA64DgQKAAv8BrgP9AfwB+wGuA/kB+AGuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgPlAa4DrgOuA64DrgOuA64DrgPcAa4DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA2quA64DkwGuA64DuAHBAa4DjQKVAq4DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOuA64DrgOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DqwKvA7ACsQLZAq8DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DrwOvA68DsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADrAKwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7ADsAOwA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQNydbEDtgGeArEDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsQOxA7EDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgPEArIDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7IDsgOyA7MDiAKzA4YCswOzA4MCggKzA7MDswP+AbMDswOzA/oBswOzA/cB9gH1AfQB8wHyAfEB8AHvAe4B7QHsAesB6gHpAegB5wHmAbMD5AHjAeIB4QHgAd8B3gHdAbMD2wHaAdkB2AHXAdYB1QHUAdMB0gHRAdABzwHOAc0BzAHLAcoByQHIAccBxgHFAcQBswOzA7MDswOzA7MDLC4wMTKzA7MDswOzA7MDswOzA7MDswOzA7MDswPCAbMDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDswOzA7MDCvyGD5kDBgAgAEAACygBAX8jEiEBIxIgAGokEiMSQQ9qQXBxJBIjEiMTTgRAIAAQAQsgAQ8LBQAjEg8LBgAgACQSCwoAIAAkEiABJBML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ACGzBAxYDE8ACwALAkBB9wAhswQMVwxOAAsACwJAQfgAIbMEDFYMTQALAAsCQEH5ACGzBAxVDEwACwALAkBB+gAhswQMVAxLAAsACwJAQfsAIbMEDFMMSgALAAsCQEH8ACGzBAxSDEkACwALAkBB/QAhswQMUQxIAAsACwJAQf4AIbMEDFAMRwALAAsCQEH/ACGzBAxPDEYACwALAkBBgAEhswQMTgxFAAsACwJAQYEBIbMEDE0MRAALAAsCQEGCASGzBAxMDEMACwALAkBBgwEhswQMSwxCAAsACwJAQYQBIbMEDEoMQQALAAsCQEGFASGzBAxJDEAACwALAkBBhgEhswQMSAw/AAsACwJAQYcBIbMEDEcMPgALAAsCQEGIASGzBAxGDD0ACwALAkBBiQEhswQMRQw8AAsACwJAQYoBIbMEDEQMOwALAAsCQEGLASGzBAxDDDoACwALAkBBjAEhswQMQgw5AAsACwJAQY0BIbMEDEEMOAALAAsCQEGOASGzBAxADDcACwALAkBBjwEhswQMPww2AAsACwJAQZABIbMEDD4MNQALAAsCQEGRASGzBAw9DDQACwALAkBBkgEhswQMPAwzAAsACwJAQZMBIbMEDDsMMgALAAsCQEGUASGzBAw6DDEACwALAkBBlQEhswQMOQwwAAsACwJAQZYBIbMEDDgMLwALAAsCQEGXASGzBAw3DC4ACwALAkBBmAEhswQMNgwtAAsACwJAQZkBIbMEDDUMLAALAAsCQEGaASGzBAw0DCsACwALAkBBmwEhswQMMwwqAAsACwJAQZwBIbMEDDIMKQALAAsCQEGdASGzBAwxDCgACwALAkBBngEhswQMMAwnAAsACwJAQZ8BIbMEDC8MJgALAAsCQEGiASGzBAwuDCUACwALAkBBsAEhswQMLQwkAAsACwJAQbsBIbMEDCwMIwALAAsCQEG8ASGzBAwrDCIACwALAkBBygEhswQMKgwhAAsACwJAQYgCIcQDQZcCIbMEDCkMIAALAAsCQEHEACGzBAwmDB8ACwALAkBBxQAhswQMJQweAAsACwJAQcYAIbMEDCQMHQALAAsCQEHQACGzBAwjDBwACwALAkBB0QAhswQMIgwbAAsACwJAQaUBIbMEDCEMGgALAAsBCwELAQsCQAwdDBYACwALAkBBpgEhswQMHAwVAAsACwJA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IABBCGohDyAPQQA2AgAgAEEEaiERIBFBADYCACAAQSxqIQggCCgCACEDIABBHGohFCAUIAM2AgAgAEEUaiEWIBYgAzYCACADIQQgAEEwaiEJIAkoAgAhBSAEIAVqIQYgAEEQaiEVIBUgBjYCAEEAIRAFIAJBIHIhDiAAIA42AgBBfyEQCyAQDwsSAgJ/AX4jEiECIAC9IQMgAw8L9REDC38EfgV8IxIhDCAAvSENIA1CNIghECAQp0H//wNxIQkgCUH/D3EhCgJAAkACQAJAIApBEHRBEHVBAGsOgBAAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAQILAkAgAEQAAAAAAAAAAGIhCCAIBEAgAEQAAAAAAADwQ6IhEyATIAEQ2AIhEiABKAIAIQIgAkFAaiEGIAYhBSASIRUFQQAhBSAAIRULIAEgBTYCACAVIRQMAwALAAsCQCAAIRQMAgALAAsCQCAQpyEDIANB/w9xIQQgBEGCeGohByABIAc2AgAgDUL/////////h4B/gyEOIA5CgICAgICAgPA/hCEPIA+/IREgESEUCwsgFA8LZAEMfyMSIQ4gAEEQaiELIAsoAgAhBCAAQRRqIQwgDCgCACEFIAQgBWshCiAKIAJLIQggCAR/IAIFIAoLIQkgBSEDIAMgASAJEJwDGiAMKAIAIQYgBiAJaiEHIAwgBzYCACACDwv5DwOYAX8CfQR8IxIhmgECQAJAAkACQAJAIAFBAGsOAwABAgMLAkBBGCEoQet+IWZBBCGZAQwEAAsACwJAQTUhKEHOdyFmQQQhmQEMAwALAAsCQEE1IShBznchZkEEIZkBDAIACwALRAAAAAAAAAAAIaABCwJAIJkBQQRGBEAgAEEEaiGFASAAQegAaiGGAQNAAkAghQEoAgAhAyCGASgCACEEIAMgBEkhOyA7BEAgA0EBaiFvIIUBIG82AgAgAywAACEPIA9B/wFxIVkgWSFVBSAAELUCITEgMSFVCyBVELYCITogOkEARiGMASCMAQRADAELDAELCwJAAkACQAJAAkAgVUEraw4DAAIBAgsBCwJAIFVBLUYhUiBSQQFxIVsgW0EBdCF9QQEgfWshiAEghQEoAgAhGiCGASgCACEgIBogIEkhQSBBBEAgGkEBaiF2IIUBIHY2AgAgGiwAACEhICFB/wFxIV4gXiEpIIgBIYcBDAQFIAAQtQIhOCA4ISkgiAEhhwEMBAsADAIACwALAkAgVSEpQQEhhwELCwsgKSErQQAhZwNAAkAgK0EgciF+QfLTAiBnaiEmICYsAAAhIiAiQRh0QRh1IWAgfiBgRiFLIEtFBEAgKyEqIGchlwEMAQsgZ0EHSSFMAkAgTARAIIUBKAIAISMghgEoAgAhJCAjICRJIU0gTQRAICNBAWoheiCFASB6NgIAICMsAAAhJSAlQf8BcSFhIGEhLAwCBSAAELUCITkgOSEsDAILAAUgKyEsCwsgZ0EBaiFsIGxBCEkhSiBKBEAgLCErIGwhZwUgLCEqQQghlwEMAQsMAQsLIJcBQf////8HcSGYAQJAAkACQAJAAkAgmAFBA2sOBgECAgICAAILDAILAkBBFyGZAQwCAAsACwJAIJcBQQNLIU4gAkEARyGTASCTASBOcSGAASCAAQRAIJcBQQhGIU8gTwRADAQFQRchmQEMBAsACyCXAUEARiGWAQJAIJYBBEAgKiEtQQAhaQNAAkAgLUEgciGEAUH70wIgaWohJyAnLAAAIQggCEEYdEEYdSFiIIQBIGJGIVQgVEUEQCAtIS8gaSFqDAQLIGlBAkkhPAJAIDwEQCCFASgCACEJIIYBKAIAIQogCSAKSSE9ID0EQCAJQQFqIXAghQEgcDYCACAJLAAAIQsgC0H/AXEhWiBaIS4MAgUgABC1AiEyIDIhLgwCCwAFIC0hLgsLIGlBAWohbSBtQQNJIVMgUwRAIC4hLSBtIWkFIC4hL0EDIWoMAQsMAQsLBSAqIS8glwEhagsLAkACQAJAAkAgakEAaw4EAQICAAILAkAghQEoAgAhDCCGASgCACENIAwgDUkhPiA+BEAgDEEBaiFxIIUBIHE2AgAgDCwAACEOIA5B/wFxIVwgXCFWBSAAELUCITMgMyFWCyBWQShGIT8gP0UEQCCGASgCACEQIBBBAEYhjQEgjQEEQCMQIaABDAoLIIUBKAIAIREgEUF/aiFyIIUBIHI2AgAjECGgAQwJC0EBIWsDQAJAIIUBKAIAIRIghgEoAgAhEyASIBNJIUAgQARAIBJBAWohcyCFASBzNgIAIBIsAAAhFCAUQf8BcSFdIF0hVwUgABC1AiE0IDQhVwsgV0FQaiGJASCJAUEKSSFCIFdBv39qIYoBIIoBQRpJIUMgQiBDciF/IH9FBEAgV0Gff2ohiwEgiwFBGkkhRCBXQd8ARiFFIEUgRHIhgQEggQFFBEAMAgsLIGtBAWohbiBuIWsMAQsLIFdBKUYhRiBGBEAjECGgAQwJCyCGASgCACEVIBVBAEYhjgEgjgFFBEAghQEoAgAhFiAWQX9qIXQghQEgdDYCAAsgkwFFBEAQrgIhNSA1QRY2AgAgAEIAELMCRAAAAAAAAAAAIaABDAkLIGtBAEYhkAEgkAEEQCMQIaABDAkLIGshZQNAIGVBf2ohZCCOAUUEQCCFASgCACEXIBdBf2ohdSCFASB1NgIACyBkQQBGIY8BII8BBEAjECGgAQwKBSBkIWULDAAACwAMAwALAAsCQCAvQTBGIUcgRwRAIIUBKAIAIRsghgEoAgAhHCAbIBxJIUggSARAIBtBAWoheCCFASB4NgIAIBssAAAhHSAdQf8BcSFfIF8hWAUgABC1AiE3IDchWAsgWEEgciGDASCDAUH4AEYhSSBJBEAgACAoIGYghwEgAhDbAiGdASCdASGgAQwJCyCGASgCACEeIB5BAEYhkgEgkgEEQEEwITAFIIUBKAIAIR8gH0F/aiF5IIUBIHk2AgBBMCEwCwUgLyEwCyAAIDAgKCBmIIcBIAIQ3AIhngEgngEhoAEMBwwCAAsACwJAIIYBKAIAIRggGEEARiGRASCRAUUEQCCFASgCACEZIBlBf2ohdyCFASB3NgIACxCuAiE2IDZBFjYCACAAQgAQswJEAAAAAAAAAAAhoAEMBgALAAsLCwsgmQFBF0YEQCCGASgCACEFIAVBAEYhlAEglAFFBEAghQEoAgAhBiAGQX9qIXsghQEgezYCAAsgAkEARyGVASCXAUEDSyFRIJUBIFFxIYIBIIIBBEAglwEhaANAAkAglAFFBEAghQEoAgAhByAHQX9qIXwghQEgfDYCAAsgaEF/aiFjIGNBA0shUCBQBEAgYyFoBQwBCwwBCwsLCyCHAbIhmwEgmwEjEbaUIZwBIJwBuyGfASCfASGgAQsLIKABDwvyEwOUAX8Zfit8IxIhmAEgAEEEaiF1IHUoAgAhBiAAQegAaiF2IHYoAgAhByAGIAdJITUgNQRAIAZBAWohYyB1IGM2AgAgBiwAACESIBJB/wFxIVAgUCEoBSAAELUCIS0gLSEoCyAoISZBACFYA0ACQAJAAkACQAJAICZBLmsOAwACAQILAkBBCiGXAQwEDAMACwALDAELAkAgJiEsIFghWkEAIV1CACGtAQwCAAsACyB1KAIAIRcgdigCACEYIBcgGEkhSSBJBEAgF0EBaiFkIHUgZDYCACAXLAAAIRkgGUH/AXEhUSBRIScFIAAQtQIhLyAvIScLICchJkEBIVgMAQsLIJcBQQpGBEAgdSgCACEaIHYoAgAhGyAaIBtJITwgPARAIBpBAWohaiB1IGo2AgAgGiwAACEcIBxB/wFxIVMgUyFOBSAAELUCITMgMyFOCyBOQTBGIUQgRARAQgAhqwEDQAJAIHUoAgAhHSB2KAIAIQggHSAISSFFIEUEQCAdQQFqIWsgdSBrNgIAIB0sAAAhCSAJQf8BcSFVIFUhTwUgABC1AiE0IDQhTwsgqwFCf3whowEgT0EwRiFDIEMEQCCjASGrAQUgTyEsQQEhWkEBIV0gowEhrQEMAQsMAQsLBSBOISwgWCFaQQEhXUIAIa0BCwsgLCEpQgAhoAEgWiFZIF0hXEEAIV8grQEhrAFEAAAAAAAA8D8hzwFBACGOAUQAAAAAAAAAACHWAQNAAkAgKUFQaiF4IHhBCkkhRiApQSByIQUgRgRAQRghlwEFIAVBn39qIX0gfUEGSSFHIClBLkYhSCBIIEdyIXMgc0UEQCApISsMAgsgSARAIFxBAEYhfyB/BEAgoAEhoQEgWSFbQQEhXiBfIWEgoAEhrgEgzwEh0QEgjgEhkAEg1gEh2AEFQS4hKwwDCwVBGCGXAQsLIJcBQRhGBEBBACGXASApQTlKIUogBUGpf2ohfiBKBH8gfgUgeAshVyCgAUIIUyFLAkAgSwRAII4BQQR0IW0gVyBtaiEgIF8hYCDPASHQASAgIY8BINYBIdcBBSCgAUIOUyFMIEwEQCBXtyHCASDPAUQAAAAAAACwP6IhwwEgwwEgwgGiIcwBINYBIMwBoCG1ASBfIWAgwwEh0AEgjgEhjwEgtQEh1wEMAgUgV0EARiGMASBfQQBHIY0BII0BIIwBciFwIM8BRAAAAAAAAOA/oiHNASDWASDNAaAhtgEgcAR8INYBBSC2AQsh0gEgcAR/IF8FQQELIXcgdyFgIM8BIdABII4BIY8BINIBIdcBDAILAAsLIKABQgF8IagBIKgBIaEBQQEhWyBcIV4gYCFhIKwBIa4BINABIdEBII8BIZABINcBIdgBCyB1KAIAIQogdigCACELIAogC0khTSBNBEAgCkEBaiFsIHUgbDYCACAKLAAAIQwgDEH/AXEhViBWISoFIAAQtQIhLiAuISoLICohKSChASGgASBbIVkgXiFcIGEhXyCuASGsASDRASHPASCQASGOASDYASHWAQwBCwsgWUEARiGAAQJAIIABBEAgdigCACENIA1BAEYhgQEggQFFBEAgdSgCACEOIA5Bf2ohZSB1IGU2AgALIARBAEYhggEgggEEQCAAQgAQswIFIIEBRQRAIHUoAgAhDyAPQX9qIWYgdSBmNgIAIFxBAEYhgwEggwEggQFyISUgJUUEQCB1KAIAIRAgEEF/aiFnIHUgZzYCAAsLCyADtyG7ASC7AUQAAAAAAAAAAKIhxAEgxAEhzgEFIFxBAEYhhAEghAEEfiCgAQUgrAELIa8BIKABQghTITcgNwRAIKABIaIBII4BIZIBA0ACQCCSAUEEdCFuIKIBQgF8IakBIKIBQgdTITYgNgRAIKkBIaIBIG4hkgEFIG4hkQEMAQsMAQsLBSCOASGRAQsgK0EgciF0IHRB8ABGITggOARAIAAgBBDdAiGbASCbAUKAgICAgICAgIB/USE5IDkEQCAEQQBGIYUBIIUBBEAgAEIAELMCRAAAAAAAAAAAIc4BDAQLIHYoAgAhESARQQBGIYYBIIYBBEBCACGlAQUgdSgCACETIBNBf2ohaCB1IGg2AgBCACGlAQsFIJsBIaUBCwUgdigCACEUIBRBAEYhhwEghwEEQEIAIaUBBSB1KAIAIRUgFUF/aiFpIHUgaTYCAEIAIaUBCwsgrwFCAoYhqgEgqgFCYHwhsAEgsAEgpQF8IZkBIJEBQQBGIYgBIIgBBEAgA7chvAEgvAFEAAAAAAAAAACiIcUBIMUBIc4BDAILQQAgAmsheSB5rCGcASCZASCcAVUhOiA6BEAQrgIhMCAwQSI2AgAgA7chvQEgvQFE////////73+iIcYBIMYBRP///////+9/oiHHASDHASHOAQwCCyACQZZ/aiF6IHqsIZ0BIJkBIJ0BUyE7IDsEQBCuAiExIDFBIjYCACADtyG+ASC+AUQAAAAAAAAQAKIhyAEgyAFEAAAAAAAAEACiIckBIMkBIc4BDAILIJEBQX9KIT4gPgRAIJkBIacBIJEBIZQBINYBIdoBA0ACQCDaAUQAAAAAAADgP2ZFIT8glAFBAXQhHyDaAUQAAAAAAADwv6Ah0wEgP0EBcyFvIG9BAXEhHiAfIB5yIZUBID8EfCDaAQUg0wELIdQBINoBINQBoCHbASCnAUJ/fCGkASCVAUF/SiE9ID0EQCCkASGnASCVASGUASDbASHaAQUgpAEhpgEglQEhkwEg2wEh2QEMAQsMAQsLBSCZASGmASCRASGTASDWASHZAQsgAawhngEgAqwhnwFCICCfAX0hmgEgmgEgpgF8IbEBILEBIJ4BUyFAIEAEQCCxAachUiBSQQBKIRYgFgRAIFIhIkHBACGXAQVBACEkQdQAIXxBwwAhlwELBSABISJBwQAhlwELIJcBQcEARgRAICJBNUghQUHUACAiayF7IEEEQCAiISQgeyF8QcMAIZcBBSADtyGyAUQAAAAAAAAAACG3ASAiISMgsgEhwAELCyCXAUHDAEYEQCADtyG/AUQAAAAAAADwPyB8EN4CIbgBILgBIL8BEN8CIbkBILkBIbcBICQhIyC/ASHAAQsgI0EgSCFCINkBRAAAAAAAAAAAYiGJASCJASBCcSFyIJMBQQFxISEgIUEARiGKASCKASBycSFxIHFBAXEhYiCTASBiaiGWASBxBHxEAAAAAAAAAAAFINkBCyHcASCWAbghwQEgwAEgwQGiIcoBILcBIMoBoCGzASDcASDAAaIhywEgywEgswGgIbQBILQBILcBoSHVASDVAUQAAAAAAAAAAGIhiwEgiwFFBEAQrgIhMiAyQSI2AgALIKYBpyFUINUBIFQQ4QIhugEgugEhzgELCyDOAQ8LuC4D/AJ/HX47fCMSIYEDIxJBgARqJBIjEiMTTgRAQYAEEAELIIEDIfYCIAMgAmohCEEAIAhrIcUCIABBBGohsgIgAEHoAGohswIgASF1QQAh4gEDQAJAAkACQAJAAkAgdUEuaw4DAAIBAgsCQEEHIYADDAQMAwALAAsMAQsCQCB1IXcg4gEh4wFBACHnAUIAIZYDDAIACwALILICKAIAIQkgswIoAgAhFCAJIBRJIZUBIJUBBEAgCUEBaiH2ASCyAiD2ATYCACAJLAAAIR8gH0H/AXEhzQEgzQEhdgUgABC1AiF6IHohdgsgdiF1QQEh4gEMAQsLIIADQQdGBEAgsgIoAgAhKCCzAigCACEtICggLUkhxgEgxgEEQCAoQQFqIfgBILICIPgBNgIAICgsAAAhLiAuQf8BcSHOASDOASHIAQUgABC1AiF8IHwhyAELIMgBQTBGIZIBIJIBBEBCACGVAwNAAkAglQNCf3whkQMgsgIoAgAhLyCzAigCACEwIC8gMEkhnAEgnAEEQCAvQQFqIfoBILICIPoBNgIAIC8sAAAhMSAxQf8BcSHQASDQASHLAQUgABC1AiF/IH8hywELIMsBQTBGIZEBIJEBBEAgkQMhlQMFIMsBIXdBASHjAUEBIecBIJEDIZYDDAELDAELCwUgyAEhdyDiASHjAUEBIecBQgAhlgMLCyD2AkEANgIAIHdBUGoh1QIg1QJBCkkhrAEgd0EuRiGyASCyASCsAXIhCgJAIAoEQCD2AkHwA2ohcyB3IXkgsgEhswFCACGPAyDjASHlASDnASHpAUEAIYACQQAhhwJBACGSAiCWAyGYAyDVAiHWAgNAAkACQCCzAQRAIOkBQQBGIcoBIMoBBEAgjwMhkAMg5QEh5gFBASHqASCAAiGBAiCHAiGIAiCSAiGTAiCPAyGZAwUMAwsFIIcCQf0ASCG3ASCPA0IBfCGUAyB5QTBHIbsBILcBRQRAILsBRQRAIJQDIZADIOUBIeYBIOkBIeoBIIACIYECIIcCIYgCIJICIZMCIJgDIZkDDAMLIHMoAgAhDCAMQQFyIZwCIHMgnAI2AgAglAMhkAMg5QEh5gEg6QEh6gEggAIhgQIghwIhiAIgkgIhkwIgmAMhmQMMAgsglAOnIdIBILsBBH8g0gEFIJICCyG5AiCAAkEARiHvAiD2AiCHAkECdGohciDvAgRAINYCIcQCBSByKAIAIQsgC0EKbCGUAiB5QVBqIUwgTCCUAmoh4AIg4AIhxAILIHIgxAI2AgAggAJBAWoh9AEg9AFBCUYhxQEgxQFBAXEh9QEghwIg9QFqIboCIMUBBH9BAAUg9AELIbsCIJQDIZADQQEh5gEg6QEh6gEguwIhgQIgugIhiAIguQIhkwIgmAMhmQMLCyCyAigCACENILMCKAIAIQ4gDSAOSSHHASDHAQRAIA1BAWoh+wEgsgIg+wE2AgAgDSwAACEPIA9B/wFxIdMBINMBIcwBBSAAELUCIYEBIIEBIcwBCyDMAUFQaiHUAiDUAkEKSSGqASDMAUEuRiGvASCvASCqAXIhECAQBEAgzAEheSCvASGzASCQAyGPAyDmASHlASDqASHpASCBAiGAAiCIAiGHAiCTAiGSAiCZAyGYAyDUAiHWAgUgzAEheCCQAyGLAyDmASHkASDqASHoASCBAiH8ASCIAiGDAiCTAiGOAiCZAyGXA0EfIYADDAQLDAELCyDlAUEARyHzAiCPAyGOAyCAAiH/ASCHAiGGAiCSAiGRAiCYAyGaAyDzAiH1AkEnIYADBSB3IXhCACGLAyDjASHkASDnASHoAUEAIfwBQQAhgwJBACGOAiCWAyGXA0EfIYADCwsCQCCAA0EfRgRAIOgBQQBGIfECIPECBH4giwMFIJcDCyGeAyDkAUEARyHyAiB4QSByIagCIKgCQeUARiGGASDyAiCGAXEhnwIgnwJFBEAgeEF/SiGIASCIAQRAIIsDIY4DIPwBIf8BIIMCIYYCII4CIZECIJ4DIZoDIPICIfUCQSchgAMMAwUgiwMhjQMg/AEh/gEggwIhhQIgjgIhkAIgngMhmwMg8gIh9AJBKSGAAwwDCwALIAAgBRDdAiGGAyCGA0KAgICAgICAgIB/USGHASCHAQRAIAVBAEYh4QIg4QIEQCAAQgAQswJEAAAAAAAAAAAh0wMMAwsgswIoAgAhESARQQBGIeICIOICBEBCACGTAwUgsgIoAgAhEiASQX9qIfcBILICIPcBNgIAQgAhkwMLBSCGAyGTAwsgkwMgngN8IYQDIIsDIYwDIPwBIf0BIIMCIYQCII4CIY8CIIQDIZwDQSshgAMLCyCAA0EnRgRAILMCKAIAIRMgE0EARiHjAiDjAgRAII4DIY0DIP8BIf4BIIYCIYUCIJECIZACIJoDIZsDIPUCIfQCQSkhgAMFILICKAIAIRUgFUF/aiH5ASCyAiD5ATYCACD1AgRAII4DIYwDIP8BIf0BIIYCIYQCIJECIY8CIJoDIZwDQSshgAMFQSohgAMLCwsggANBKUYEQCD0AgRAII0DIYwDIP4BIf0BIIUCIYQCIJACIY8CIJsDIZwDQSshgAMFQSohgAMLCwJAIIADQSpGBEAQrgIheyB7QRY2AgAgAEIAELMCRAAAAAAAAAAAIdMDBSCAA0ErRgRAIPYCKAIAIRYgFkEARiHkAiDkAgRAIAS3Ia4DIK4DRAAAAAAAAAAAoiHCAyDCAyHTAwwDCyCcAyCMA1EhiQEgjANCClMhigEgigEgiQFxIZ0CIJ0CBEAgAkEeSiGLASAWIAJ2IbUCILUCQQBGIYwBIIsBIIwBciGgAiCgAgRAIAS3Ia8DIBa4IbADIK8DILADoiHDAyDDAyHTAwwECwsgA0F+bUF/cSHVASDVAawhhwMgnAMghwNVIY0BII0BBEAQrgIhfSB9QSI2AgAgBLchsQMgsQNE////////73+iIcQDIMQDRP///////+9/oiHFAyDFAyHTAwwDCyADQZZ/aiHGAiDGAqwhiAMgnAMgiANTIY4BII4BBEAQrgIhfiB+QSI2AgAgBLchsgMgsgNEAAAAAAAAEACiIcYDIMYDRAAAAAAAABAAoiHHAyDHAyHTAwwDCyD9AUEARiHlAiDlAgRAIIQCIYkCBSD9AUEJSCGQASCQAQRAIPYCIIQCQQJ0aiFeIF4oAgAhXyD9ASGCAiBfIZYCA0ACQCCWAkEKbCGVAiCCAkEBaiHtASCCAkEISCGPASCPAQRAIO0BIYICIJUCIZYCBQwBCwwBCwsgXiCVAjYCAAsghAJBAWoh7gEg7gEhiQILIJwDpyHPASCPAkEJSCGTASCTAQRAII8CIM8BTCGUASDPAUESSCGWASCUASCWAXEhngIgngIEQCDPAUEJRiGXASCXAQRAIAS3IbMDIPYCKAIAIRcgF7ghtAMgswMgtAOiIcgDIMgDIdMDDAULIM8BQQlIIZgBIJgBBEAgBLchtQMg9gIoAgAhGCAYuCG2AyC1AyC2A6IhyQNBCCDPAWshxwJBsLwBIMcCQQJ0aiFgIGAoAgAhGSAZtyG3AyDJAyC3A6MhvQMgvQMh0wMMBQsgzwFBfWwhBiACQRtqIZcCIJcCIAZqIcgCIMgCQR5KIZkBIPYCKAIAIQcgByDIAnYhtgIgtgJBAEYhmgEgmQEgmgFyIaQCIKQCBEAgBLchuAMgB7ghuQMguAMguQOiIcoDIM8BQXZqIckCQbC8ASDJAkECdGohYSBhKAIAIRogGrchugMgygMgugOiIcsDIMsDIdMDDAULCwsgzwFBCW9Bf3EhqQIgqQJBAEYh5gIg5gIEQEEAITQgzwEhrAIgiQIh+wIFIM8BQX9KIZsBIKkCQQlqITogmwEEfyCpAgUgOgshyQFBCCDJAWshygJBsLwBIMoCQQJ0aiFiIGIoAgAhGyCJAkEARiGeASCeAQRAQQAhMiDPASGqAkEAIfcCBUGAlOvcAyAbbUF/cSHXAUEAITNBACGCAUEAIYoCIM8BIasCA0ACQCD2AiCKAkECdGohYyBjKAIAIRwgHCAbbkF/cSHWASDWASAbbCEdIBwgHWshHiDWASCCAWohOyBjIDs2AgAg1wEgHmwhmAIgigIgM0YhnwEgO0EARiHnAiCfASDnAnEhoQIgM0EBaiE8IDxB/wBxIU0gqwJBd2ohywIgoQIEfyDLAgUgqwILIb4CIKECBH8gTQUgMwshvwIgigJBAWoh7wEg7wEgiQJGIZ0BIJ0BBEAMAQUgvwIhMyCYAiGCASDvASGKAiC+AiGrAgsMAQsLIJgCQQBGIegCIOgCBEAgvwIhMiC+AiGqAiCJAiH3AgUg9gIgiQJBAnRqIWQgiQJBAWoh8AEgZCCYAjYCACC/AiEyIL4CIaoCIPABIfcCCwtBCSDJAWshzAIgzAIgqgJqIT0gMiE0ID0hrAIg9wIh+wILIDQhNUEAIdkBIKwCIa0CIPsCIfwCA0ACQCCtAkESSCGgASCtAkESRiGhASD2AiA1QQJ0aiFlINkBIdgBIPwCIfoCA0ACQCCgAUUEQCChAUUEQCCtAiGuAgwECyBlKAIAISAgIEHf4KUESSGiASCiAUUEQEESIa4CDAQLCyD6AkH/AGohzgJBACGDASDOAiGMAiD6AiH9AgNAAkAgjAJB/wBxIYsCIPYCIIsCQQJ0aiFmIGYoAgAhISAhrSGJAyCJA0IdhiGdAyCDAa0higMgnQMgigN8IYUDIIUDQoCU69wDViGjASCFA6ch4QEgowEEQCCFA0KAlOvcA4AhkgMgkgOnIdEBIJIDQoCU69wDfiGCAyCFAyCCA30hgwMggwOnIeABIOABIT4g0QEhhAEFIOEBIT5BACGEAQsgZiA+NgIAIP0CQf8AaiHPAiDPAkH/AHEhTiCLAiBORyGkASCLAiA1RiGlASCkASClAXIhogIgPkEARiHpAiDpAgR/IIsCBSD9AgshvAIgogIEfyD9AgUgvAILIcACIIsCQX9qIdACIKUBBEAMAQUghAEhgwEg0AIhjAIgwAIh/QILDAELCyDYAUFjaiHNAiCEAUEARiHqAiDqAgRAIM0CIdgBIP0CIfoCBQwBCwwBCwsgrQJBCWohPyA1Qf8AaiHRAiDRAkH/AHEhTyBPIMACRiGmASDAAkH/AGoh0gIg0gJB/wBxIVAgwAJB/gBqIdMCINMCQf8AcSFRIPYCIFFBAnRqIWggpgEEQCD2AiBQQQJ0aiFnIGcoAgAhIiBoKAIAISMgIyAiciGmAiBoIKYCNgIAIFAh/gIFIP0CIf4CCyD2AiBPQQJ0aiFpIGkghAE2AgAgTyE1IM0CIdkBID8hrQIg/gIh/AIMAQsLIDUhOCDYASHcASCuAiGwAiD6AiH/AgNAAkAg/wJBAWohRSBFQf8AcSFWIP8CQf8AaiHZAiDZAkH/AHEhVyD2AiBXQQJ0aiFuIDghNyDcASHbASCwAiGvAgNAAkAgrwJBEkYhrQEgrwJBG0ohrgEgrgEEf0EJBUEBCyG9AiA3ITYg2wEh2gEDQAJAQQAh6wEDQAJAIOsBIDZqIUAgQEH/AHEhUiBSIP8CRiGoASCoAQRAQdwAIYADDAELIPYCIFJBAnRqIWogaigCACEkQezHASDrAUECdGohayBrKAIAISUgJCAlSSGpASCpAQRAQdwAIYADDAELICQgJUshqwEgqwEEQAwBCyDrAUEBaiHxASDxAUECSSGnASCnAQRAQQEh6wEFQdwAIYADDAELDAELCyCAA0HcAEYEQEEAIYADIK0BBEAMBgsLIL0CINoBaiFBIDYg/wJGIbEBILEBBEAg/wIhNiBBIdoBBQwBCwwBCwtBASC9AnQhtAIgtAJBf2oh1wJBgJTr3AMgvQJ2IbgCIDYhOUEAIYUBIDYhjQIgrwIhsQIDQAJAIPYCII0CQQJ0aiFsIGwoAgAhJiAmINcCcSFTICYgvQJ2IbcCILcCIIUBaiFCIGwgQjYCACBTILgCbCGZAiCNAiA5RiG0ASBCQQBGIesCILQBIOsCcSGjAiA5QQFqIUMgQ0H/AHEhVCCxAkF3aiHYAiCjAgR/INgCBSCxAgshwQIgowIEfyBUBSA5CyHCAiCNAkEBaiFEIERB/wBxIVUgVSD/AkYhsAEgsAEEQAwBBSDCAiE5IJkCIYUBIFUhjQIgwQIhsQILDAELCyCZAkEARiHsAiDsAkUEQCBWIMICRiG1ASC1AUUEQAwCCyBuKAIAIScgJ0EBciGnAiBuIKcCNgIACyDCAiE3IEEh2wEgwQIhrwIMAQsLIPYCIP8CQQJ0aiFtIG0gmQI2AgAgwgIhOCBBIdwBIMECIbACIFYh/wIMAQsLQQAh7AFEAAAAAAAAAAAh1gMg/wIh+AIDQAJAIOwBIDZqIUYgRkH/AHEhWCBYIPgCRiG2ASD4AkEBaiFHIEdB/wBxIVkgtgEEQCBZQX9qIdoCIPYCINoCQQJ0aiFvIG9BADYCACBZIfkCBSD4AiH5Agsg1gNEAAAAAGXNzUGiIcwDIPYCIFhBAnRqIXAgcCgCACEpICm4IbsDIMwDILsDoCGfAyDsAUEBaiHyASDyAUECRiHfASDfAQRADAEFIPIBIewBIJ8DIdYDIPkCIfgCCwwBCwsgBLchvAMgnwMgvAOiIc0DINoBQTVqIUggSCADayHbAiDbAiACSCG4ASDbAkEASiEqICoEfyDbAgVBAAshwwIguAEEfyDDAgUgAgshdCB0QTVIIbkBILkBBEBB6QAgdGsh3AJEAAAAAAAA8D8g3AIQ3gIhpwMgpwMgzQMQ3wIhqANBNSB0ayHdAkQAAAAAAADwPyDdAhDeAiGpAyDNAyCpAxDgAiGqAyDNAyCqA6Eh1AMgqAMg1AOgIaADIKgDIaYDIKoDIb4DIKADIdcDBUQAAAAAAAAAACGmA0QAAAAAAAAAACG+AyDNAyHXAwsgNkECaiFJIElB/wBxIVogWiD5AkYhugEgugEEQCC+AyHAAwUg9gIgWkECdGohcSBxKAIAISsgK0GAyrXuAUkhvAECQCC8AQRAICtBAEYh7QIg7QIEQCA2QQNqIUogSkH/AHEhWyBbIPkCRiG9ASC9AQRAIL4DIb8DDAMLCyC8A0QAAAAAAADQP6IhzgMgzgMgvgOgIaEDIKEDIb8DBSArQYDKte4BRiG+ASC+AUUEQCC8A0QAAAAAAADoP6IhzwMgzwMgvgOgIaIDIKIDIb8DDAILIDZBA2ohSyBLQf8AcSFcIFwg+QJGIb8BIL8BBEAgvANEAAAAAAAA4D+iIdADINADIL4DoCGjAyCjAyG/AwwCBSC8A0QAAAAAAADoP6Ih0QMg0QMgvgOgIaQDIKQDIb8DDAILAAsLQTUgdGsh3gIg3gJBAUohwAEgwAEEQCC/A0QAAAAAAADwPxDgAiGrAyCrA0QAAAAAAAAAAGIh7gIg7gIEQCC/AyHAAwUgvwNEAAAAAAAA8D+gIcEDIMEDIcADCwUgvwMhwAMLCyDXAyDAA6AhpQMgpQMgpgOhIdUDIEhB/////wdxIV1BfiAIayHfAiBdIN8CSiHBAQJAIMEBBEAg1QOZIawDIKwDRAAAAAAAAEBDZkUhwgEg1QNEAAAAAAAA4D+iIdIDIMIBQQFzIZsCIJsCQQFxIfMBINoBIPMBaiHdASDCAQR8INUDBSDSAwsh2AMg3QFBMmohLCAsIMUCSiHEASDEAUUEQCB0INsCRyHDASDDASDCAXIhmgIguAEgmgJxIdQBIMADRAAAAAAAAAAAYiHwAiDwAiDUAXEhpQIgpQJFBEAg3QEh3gEg2AMh2QMMAwsLEK4CIYABIIABQSI2AgAg3QEh3gEg2AMh2QMFINoBId4BINUDIdkDCwsg2QMg3gEQ4QIhrQMgrQMh0wMLCwsggQMkEiDTAw8L2QcCVn8KfiMSIVcgAEEEaiFIIEgoAgAhBCAAQegAaiFJIEkoAgAhBSAEIAVJISMgIwRAIARBAWohPSBIID02AgAgBCwAACEQIBBB/wFxITcgNyEyBSAAELUCIR4gHiEyCwJAAkACQAJAIDJBK2sOAwACAQILAQsCQCAyQS1GIScgJ0EBcSE7IEgoAgAhEyBJKAIAIRQgEyAUSSEkICQEQCATQQFqIUAgSCBANgIAIBMsAAAhFSAVQf8BcSE5IDkhNAUgABC1AiEgICAhNAsgNEFQaiFKIEpBCUshJSABQQBHIVAgUCAlcSFHIEcEQCBJKAIAIRYgFkEARiFTIFMEQEKAgICAgICAgIB/IV0FIEgoAgAhFyAXQX9qIUEgSCBBNgIAQQ4hVgsFIDQhGyA7IUYgSiFLQQwhVgsMAgALAAsCQCAyQVBqIQMgMiEbQQAhRiADIUtBDCFWCwsgVkEMRgRAIEtBCUshJiAmBEBBDiFWBSAbIRxBACFVA0ACQCBVQQpsIUUgHEFQaiEaIBogRWohTSBIKAIAIRkgSSgCACEGIBkgBkkhKiAqBEAgGUEBaiFDIEggQzYCACAZLAAAIQcgB0H/AXEhOiA6ITUFIAAQtQIhISAhITULIDVBUGohTCBMQQpJISggTUHMmbPmAEghKSAoIClxIQggCARAIDUhHCBNIVUFDAELDAELCyBNrCFcIExBCkkhLCAsBEAgNSEdIFwhYQNAAkAgYUIKfiFbIB2sIVogWkJQfCFYIFggW3whXyBIKAIAIQkgSSgCACEKIAkgCkkhLiAuBEAgCUEBaiFEIEggRDYCACAJLAAAIQsgC0H/AXEhPCA8ITYFIAAQtQIhIiAiITYLIDZBUGohTiBOQQpJISsgX0Kuj4XXx8LrowFTIS0gKyAtcSEMIAwEQCA2IR0gXyFhBQwBCwwBCwsgTkEKSSEwIDAEQANAAkAgSCgCACENIEkoAgAhDiANIA5JITEgMQRAIA1BAWohPiBIID42AgAgDSwAACEPIA9B/wFxITggOCEzBSAAELUCIR8gHyEzCyAzQVBqIU8gT0EKSSEvIC9FBEAgXyFgDAELDAELCwUgXyFgCwUgXCFgCyBJKAIAIREgEUEARiFRIFFFBEAgSCgCACESIBJBf2ohPyBIID82AgALIEZBAEYhUkIAIGB9IV4gUgR+IGAFIF4LIVkgWSFdCwsgVkEORgRAIEkoAgAhAiACQQBGIVQgVARAQoCAgICAgICAgH8hXQUgSCgCACEYIBhBf2ohQiBIIEI2AgBCgICAgICAgICAfyFdCwsgXQ8LpQIDEn8Cfgl8IxIhEyABQf8HSiEHIAcEQCAARAAAAAAAAOB/oiEXIAFBgXhqIRAgAUH+D0ohCCAXRAAAAAAAAOB/oiEbIAFBgnBqIREgEUH/B0ghAiACBH8gEQVB/wcLIQ4gCAR/IA4FIBALIQwgCAR8IBsFIBcLIRwgDCELIBwhHgUgAUGCeEghCiAKBEAgAEQAAAAAAAAQAKIhGCABQf4HaiEEIAFBhHBIIQkgGEQAAAAAAAAQAKIhGSABQfwPaiEFIAVBgnhKIQMgAwR/IAUFQYJ4CyEPIAkEfyAPBSAECyENIAkEfCAZBSAYCyEdIA0hCyAdIR4FIAEhCyAAIR4LCyALQf8HaiEGIAatIRQgFEI0hiEVIBW/IRYgHiAWoiEaIBoPCxYCAn8BfCMSIQMgACABELwCIQQgBA8LFgICfwF8IxIhAyAAIAEQ4gIhBCAEDwsWAgJ/AXwjEiEDIAAgARDeAiEEIAQPC+IHAy5/LX4IfCMSIS8gAL0hMCABvSExIDBCNIghSyBLpyECIAJB/w9xIRsgMUI0iCFNIE2nIQMgA0H/D3EhHCAwQoCAgICAgICAgH+DIU4gMUIBhiFAIEBCAFEhBwJAIAcEQEEDIS4FIAEQ4wIhNSA1Qv///////////wCDITIgMkKAgICAgICA+P8AViEMIBtB/w9GIQ0gDSAMciErICsEQEEDIS4FIDBCAYYhQyBDIEBWIQ4gDkUEQCBDIEBRIQ8gAEQAAAAAAAAAAKIhYSAPBHwgYQUgAAshZCBkDwsgG0EARiEsICwEQCAwQgyGIUQgREJ/VSERIBEEQEEAISIgRCE3A0ACQCAiQX9qIR0gN0IBhiFFIEVCf1UhECAQBEAgHSEiIEUhNwUgHSEhDAELDAELCwVBACEhC0EBICFrIQQgBK0hPSAwID2GIUYgISEjIEYhVAUgMEL/////////B4MhMyAzQoCAgICAgIAIhCE5IBshIyA5IVQLIBxBAEYhLSAtBEAgMUIMhiFHIEdCf1UhEyATBEBBACEpIEchOANAAkAgKUF/aiEfIDhCAYYhSCBIQn9VIRIgEgRAIB8hKSBIITgFIB8hKAwBCwwBCwsFQQAhKAtBASAoayEGIAatIT8gMSA/hiFJICghKiBJIVwFIDFC/////////weDITQgNEKAgICAgICACIQhPCAcISogPCFcCyAjICpKIRUgVCBcfSFSIFJCf1UhGAJAIBUEQCAYIRkgIyElIFIhUyBUIVYDQAJAIBkEQCBTQgBRIRogGgRADAIFIFMhVwsFIFYhVwsgV0IBhiFKICVBf2ohICAgICpKIRQgSiBcfSFQIFBCf1UhFiAUBEAgFiEZICAhJSBQIVMgSiFWBSAWIRcgICEkIFAhUSBKIVUMBAsMAQsLIABEAAAAAAAAAACiIWIgYiFjDAQFIBghFyAjISQgUiFRIFQhVQsLIBcEQCBRQgBRIQggCARAIABEAAAAAAAAAACiIWAgYCFjDAQFIFEhWAsFIFUhWAsgWEKAgICAgICACFQhCiAKBEAgJCEnIFghWgNAAkAgWkIBhiFBICdBf2ohHiBBQoCAgICAgIAIVCEJIAkEQCAeIScgQSFaBSAeISYgQSFZDAELDAELCwUgJCEmIFghWQsgJkEASiELIAsEQCBZQoCAgICAgIB4fCFPICatITYgNkI0hiFCIE8gQoQhOiA6IVsFQQEgJmshBSAFrSE+IFkgPoghTCBMIVsLIFsgToQhOyA7vyFdIF0hYwsLCyAuQQNGBEAgACABoiFfIF8gX6MhXiBeIWMLIGMPCxICAn8BfiMSIQIgAL0hAyADDwvPAgEgfyMSISAgACEEIARBA3EhESARQQBGIRwCQCAcBEAgACETQQUhHwUgBCEJIAAhFANAAkAgFCwAACEFIAVBGHRBGHVBAEYhGSAZBEAgCSEBDAQLIBRBAWohDCAMIQYgBkEDcSEQIBBBAEYhGCAYBEAgDCETQQUhHwwBBSAGIQkgDCEUCwwBCwsLCyAfQQVGBEAgEyEeA0ACQCAeKAIAIQcgB0H//ft3aiEWIAdBgIGChHhxIQ8gD0GAgYKEeHMhCiAKIBZxIQsgC0EARiEdIB5BBGohDiAdBEAgDiEeBQwBCwwBCwsgB0H/AXEhCCAIQRh0QRh1QQBGIRsgGwRAIB4hFQUgHiECA0ACQCACQQFqIQ0gDSwAACEDIANBGHRBGHVBAEYhGiAaBEAgDSEVDAEFIA0hAgsMAQsLCyAVIRcgFyEBCyABIARrIRIgEg8LQgEHfyMSIQggACABEOYCIQQgBCwAACECIAFB/wFxIQMgAkEYdEEYdSADQRh0QRh1RiEFIAUEfyAEBUEACyEGIAYPC40EATN/IxIhNCABQf8BcSEVIBVBAEYhKAJAICgEQCAAEOQCIRIgACASaiELIAshIQUgACECIAJBA3EhICAgQQBGIS4gLgRAIAAhIgUgAUH/AXEhAyAAISMDQAJAICMsAAAhBCAEQRh0QRh1QQBGIS8gBEEYdEEYdSADQRh0QRh1RiETIC8gE3IhHSAdBEAgIyEhDAULICNBAWohFiAWIQUgBUEDcSEfIB9BAEYhLCAsBEAgFiEiDAEFIBYhIwsMAQsLCyAVQYGChAhsIRkgIigCACEGIAZB//37d2ohJyAGQYCBgoR4cSEcIBxBgIGChHhzIQ8gDyAncSERIBFBAEYhKgJAICoEQCAGIQcgIiExA0ACQCAHIBlzITIgMkH//ft3aiEmIDJBgIGChHhxIRsgG0GAgYKEeHMhDSANICZxIQ4gDkEARiErICtFBEAgMSEwDAQLIDFBBGohFyAXKAIAIQggCEH//ft3aiElIAhBgIGChHhxIRogGkGAgYKEeHMhDCAMICVxIRAgEEEARiEpICkEQCAIIQcgFyExBSAXITAMAQsMAQsLBSAiITALCyABQf8BcSEJIDAhJANAAkAgJCwAACEKIApBGHRBGHVBAEYhLSAKQRh0QRh1IAlBGHRBGHVGIRQgLSAUciEeICRBAWohGCAeBEAgJCEhDAEFIBghJAsMAQsLCwsgIQ8LgQYBRX8jEiFIIxJBEGokEiMSIxNOBEBBEBABCyBIISIgA0EARiE6IDoEf0H88JICBSADCyEzIDMoAgAhBCABQQBGITsCQCA7BEAgBEEARiFAIEAEQEEAIS0FQRMhRwsFIABBAEYhRSBFBH8gIgUgAAshNCACQQBGITwgPARAQX4hLQUgBEEARiE9ID0EQCABLAAAIQUgBUEYdEEYdUF/SiEVIBUEQCAFQf8BcSEYIDQgGDYCACAFQRh0QRh1QQBHIT4gPkEBcSElICUhLQwECxDoAiETIBNBvAFqISYgJigCACEGIAYoAgAhByAHQQBGIT8gASwAACEIID8EQCAIQRh0QRh1IRkgGUH/vwNxIQ8gNCAPNgIAQQEhLQwECyAIQf8BcSEaIBpBvn5qITUgNUEySyEWIBYEQEETIUcMBAsgAUEBaiEjQfC0ASA1QQJ0aiEQIBAoAgAhCSACQX9qIR0gHUEARiFBIEEEQCAJIRIFIAkhESAdIScgIyEuQQshRwsFIAQhESACIScgASEuQQshRwsCQCBHQQtGBEAgLiwAACEKIApB/wFxIRsgG0EDdiELIAtBcGohNiARQRp1ITIgCyAyaiEOIDYgDnIhKCAoQQdLIUIgQgRAQRMhRwwFCyARQQZ0ITEgG0GAf2ohOCA4IDFyISsgJ0F/aiEgICtBAEghRCBEBEAgICEhICshLCAuIS8DQAJAIC9BAWohJCAhQQBGIUYgRgRAICwhEgwFCyAkLAAAIQwgDEFAcSENIA1BGHRBGHVBgH9GIRcgF0UEQEETIUcMCAsgLEEGdCEwIAxB/wFxIRwgHEGAf2ohNyA3IDByISkgIUF/aiEeIClBAEghQyBDBEAgHiEhICkhLCAkIS8FIB4hHyApISoMAQsMAQsLBSAgIR8gKyEqCyAzQQA2AgAgNCAqNgIAIAIgH2shOSA5IS0MBAsLIDMgEjYCAEF+IS0LCwsgR0ETRgRAIDNBADYCABCuAiEUIBRB1AA2AgBBfyEtCyBIJBIgLQ8LEAEDfyMSIQIQ1AIhACAADwsTAQJ/IxIhAyAAIAEQ6gIaIAAPC4oEATJ/IxIhMyABIQIgACEDIAIgA3MhBSAFQQNxIQYgBkEARiERAkAgEQRAIAJBA3EhHyAfQQBGISsgKwRAIAAhEiABISEFIAAhEyABISIDQAJAICIsAAAhByATIAc6AAAgB0EYdEEYdUEARiEqICoEQCATISAMBQsgIkEBaiEWIBNBAWohGyAWIQggCEEDcSEeIB5BAEYhJyAnBEAgGyESIBYhIQwBBSAbIRMgFiEiCwwBCwsLICEoAgAhCSAJQf/9+3dqISYgCUGAgYKEeHEhHSAdQYCBgoR4cyEOIA4gJnEhECAQQQBGIS0gLQRAIAkhCiASIS8gISExA0ACQCAxQQRqIRcgL0EEaiEYIC8gCjYCACAXKAIAIQsgC0H//ft3aiElIAtBgIGChHhxIRwgHEGAgYKEeHMhDSANICVxIQ8gD0EARiEsICwEQCALIQogGCEvIBchMQUgGCEuIBchMAwBCwwBCwsFIBIhLiAhITALIC4hFCAwISNBCiEyBSAAIRQgASEjQQohMgsLIDJBCkYEQCAjLAAAIQwgFCAMOgAAIAxBGHRBGHVBAEYhKSApBEAgFCEgBSAUIRUgIyEkA0ACQCAkQQFqIRkgFUEBaiEaIBksAAAhBCAaIAQ6AAAgBEEYdEEYdUEARiEoICgEQCAaISAMAQUgGiEVIBkhJAsMAQsLCwsgIA8LQAEIfyMSIQggABDkAiECIAJBAWohASABEJYDIQMgA0EARiEGIAYEQEEAIQUFIAMgACABEJwDIQQgBCEFCyAFDwswAQZ/IxIhByAAEOQCIQIgAEEBIAIgARDtAiEDIAMgAkchBCAEQR90QR91IQUgBQ8LmwEBEH8jEiETIAIgAWwhDiABQQBGIREgEQR/QQAFIAILIRAgA0HMAGohDSANKAIAIQQgBEF/SiEJIAkEQCADEMcCIQUgBUEARiEPIAAgDiADENUCIQYgDwRAIAYhCAUgAxDIAiAGIQgLBSAAIA4gAxDVAiEHIAchCAsgCCAORiEKIAoEQCAQIQsFIAggAW5Bf3EhDCAMIQsLIAsPC5sBARJ/IxIhEiAAQcQAaiEJIAkoAgAhAyADQQBGIQ4gDkUEQCAAQYQBaiEKIAooAgAhBCAEQQBGIQ8gBCEFIABBgAFqIQEgD0UEQCABKAIAIQYgBEGAAWohDCAMIAY2AgALIAEoAgAhByAHQQBGIRAgEARAEO8CIQggCEHoAWohDSANIQIFIAdBhAFqIQsgCyECCyACIAU2AgALDwsQAQN/IxIhAhDUAiEAIAAPC7QCARt/IxIhHCMSQRBqJBIjEiMTTgRAQRAQAQsgHCEJIAFB/wFxIQ8gCSAPOgAAIABBEGohGCAYKAIAIQMgA0EARiEWIBYEQCAAENYCIQogCkEARiEXIBcEQCAYKAIAIQIgAiEFQQQhGwVBfyEVCwUgAyEFQQQhGwsCQCAbQQRGBEAgAEEUaiEZIBkoAgAhBCAEIAVJIQwgDARAIAFB/wFxIREgAEHLAGohFCAULAAAIQYgBkEYdEEYdSESIBEgEkYhDiAORQRAIARBAWohEyAZIBM2AgAgBCAPOgAAIBEhFQwDCwsgAEEkaiEaIBooAgAhByAAIAlBASAHQf8AcUGABWoRBwAhCyALQQFGIQ0gDQRAIAksAAAhCCAIQf8BcSEQIBAhFQVBfyEVCwsLIBwkEiAVDwuyAgEZfyMSIRojEkEwaiQSIxIjE04EQEEwEAELIBpBIGohFCAaQRBqIRMgGiESIAEsAAAhAiACQRh0QRh1IQxB/9MCIAwQ5QIhBSAFQQBGIQ8gDwRAEK4CIQYgBkEWNgIAQQAhDgUgARDyAiEIIAAhAyAIQYCAAnIhDSASIAM2AgAgEkEEaiEVIBUgDTYCACASQQhqIRYgFkG2AzYCAEEFIBIQEiEJIAkQrQIhCiAKQQBIIQsgCwRAQQAhDgUgCEGAgCBxIQQgBEEARiERIBFFBEAgEyAKNgIAIBNBBGohFyAXQQI2AgAgE0EIaiEYIBhBATYCAEHdASATEBEaCyAKIAEQ8wIhByAHQQBGIRAgEARAIBQgCjYCAEEGIBQQFBpBACEOBSAHIQ4LCwsgGiQSIA4PC/QBARl/IxIhGSAAQSsQ5QIhAyADQQBGIRUgACwAACECIAJBGHRBGHVB8gBHIQYgBkEBcSEBIBUEfyABBUECCyEKIABB+AAQ5QIhBCAEQQBGIRcgCkGAAXIhDSAXBH8gCgUgDQshEiAAQeUAEOUCIQUgBUEARiEWIBJBgIAgciEOIBYEfyASBSAOCyELIAJBGHRBGHVB8gBGIQcgC0HAAHIhDyAHBH8gCwUgDwshEyACQRh0QRh1QfcARiEIIBNBgARyIRAgCAR/IBAFIBMLIQwgAkEYdEEYdUHhAEYhCSAMQYAIciERIAkEfyARBSAMCyEUIBQPC8oFATl/IxIhOiMSQcAAaiQSIxIjE04EQEHAABABCyA6QShqIS0gOkEYaiEvIDpBEGohLiA6ISwgOkE4aiE4IAEsAAAhAyADQRh0QRh1IRxB/9MCIBwQ5QIhECAQQQBGISQgJARAEK4CIREgEUEWNgIAQQAhIgVBmAkQlgMhEyATQQBGIScgJwRAQQAhIgUgE0EAQZABEJ4DGiABQSsQ5QIhFyAXQQBGISsgKwRAIAEsAAAhBCAEQRh0QRh1QfIARiEZIBkEf0EIBUEECyEbIBMgGzYCAAsgAUHlABDlAiESIBJBAEYhJSAlRQRAICwgADYCACAsQQRqITAgMEECNgIAICxBCGohNSA1QQE2AgBB3QEgLBARGgsgASwAACEFIAVBGHRBGHVB4QBGIRogGgRAIC4gADYCACAuQQRqITYgNkEDNgIAQd0BIC4QESEUIBRBgAhxIQwgDEEARiEmICYEQCAUQYAIciEfIC8gADYCACAvQQRqITEgMUEENgIAIC9BCGohMiAyIB82AgBB3QEgLxARGgsgEygCACEGIAZBgAFyISAgEyAgNgIAICAhCAUgEygCACECIAIhCAsgE0E8aiEdIB0gADYCACATQZgBaiELIBNBLGohDiAOIAs2AgAgE0EwaiEPIA9BgAg2AgAgE0HLAGohByAHQX86AAAgCEEIcSENIA1BAEYhKCAoBEAgOCEJIC0gADYCACAtQQRqITMgM0GTqAE2AgAgLUEIaiE0IDQgCTYCAEE2IC0QEyEVIBVBAEYhKSApBEAgB0EKOgAACwsgE0EgaiEhICFByQA2AgAgE0EkaiE3IDdBxwA2AgAgE0EoaiEjICNByAA2AgAgE0EMaiEYIBhBxgA2AgBBvPCSAigCACEKIApBAEYhKiAqBEAgE0HMAGohHiAeQX82AgALIBMQ9AIhFiATISILCyA6JBIgIg8LUQEIfyMSIQgQ9QIhAyADKAIAIQEgAEE4aiEEIAQgATYCACADKAIAIQIgAkEARiEGIAZFBEAgAkE0aiEFIAUgADYCAAsgAyAANgIAEPYCIAAPCxUBAn8jEiEBQYDxkgIQDEGI8ZICDwsQAQJ/IxIhAUGA8ZICEBUPC8QCASF/IxIhISAAQcwAaiEWIBYoAgAhAiACQX9KIRIgEgRAIAAQxwIhDSANIRQFQQAhFAsgABDuAiAAKAIAIQMgA0EBcSEMIAxBAEchGyAbRQRAEPUCIQ4gAEE0aiEZIBkoAgAhBCAEQQBGIRwgBCEFIABBOGohASAcRQRAIAEoAgAhBiAEQThqIRcgFyAGNgIACyABKAIAIQcgB0EARiEfIAchCCAfRQRAIAdBNGohGiAaIAU2AgALIA4oAgAhCSAJIABGIRMgEwRAIA4gCDYCAAsQ9gILIAAQ+AIhDyAAQQxqIREgESgCACEKIAAgCkH/AHFBgAJqEQIAIRAgECAPciEYIABB4ABqIRUgFSgCACELIAtBAEYhHSAdRQRAIAsQlwMLIBsEQCAUQQBGIR4gHkUEQCAAEMgCCwUgABCXAwsgGA8L8wIBJ38jEiEnIABBAEYhHwJAIB8EQEH0xQEoAgAhAiACQQBGISMgIwRAQQAhEQVB9MUBKAIAIQMgAxD4AiENIA0hEQsQ9QIhCSAJKAIAIRQgFEEARiEhICEEQCARIRsFIBQhFSARIRwDQAJAIBVBzABqIRcgFygCACEEIARBf0ohDyAPBEAgFRDHAiELIAshEgVBACESCyAVQRRqISUgJSgCACEFIBVBHGohJCAkKAIAIQYgBSAGSyEQIBAEQCAVEPkCIQwgDCAcciEZIBkhHQUgHCEdCyASQQBGISIgIkUEQCAVEMgCCyAVQThqIRggGCgCACETIBNBAEYhICAgBEAgHSEbDAEFIBMhFSAdIRwLDAELCwsQ9gIgGyEeBSAAQcwAaiEWIBYoAgAhASABQX9KIQ4gDkUEQCAAEPkCIQogCiEeDAILIAAQxwIhByAHQQBGIRogABD5AiEIIBoEQCAIIR4FIAAQyAIgCCEeCwsLIB4PC4wCAhd/AX4jEiEXIABBFGohFCAUKAIAIQEgAEEcaiESIBIoAgAhAiABIAJLIQggCARAIABBJGohFSAVKAIAIQMgAEEAQQAgA0H/AHFBgAVqEQcAGiAUKAIAIQQgBEEARiERIBEEQEF/IQsFQQMhFgsFQQMhFgsgFkEDRgRAIABBBGohDCAMKAIAIQUgAEEIaiEKIAooAgAhBiAFIAZJIQkgCQRAIAUhDiAGIQ8gDiAPayEQIBCsIRggAEEoaiENIA0oAgAhByAAIBhBASAHQf8AcUGABmoRCQAaCyAAQRBqIRMgE0EANgIAIBJBADYCACAUQQA2AgAgCkEANgIAIAxBADYCAEEAIQsLIAsPC3EBDn8jEiEOIABBzABqIQsgCygCACEBIAFBf0ohCiAKBEAgABDHAiEJIAlBAEYhDCAAKAIAIQMgA0EFdiEEIARBAXEhBSAMBEAgBSEHBSAFIQcLBSAAKAIAIQIgAkEFdiEIIAhBAXEhBiAGIQcLIAcPCzgBBH8jEiEGIxJBEGokEiMSIxNOBEBBEBABCyAGIQMgAyACNgIAIAAgASADEPwCIQQgBiQSIAQPC/IzBIkDfxt+AX0BfCMSIYsDIxJBoAJqJBIjEiMTTgRAQaACEAELIIsDQYgCaiHSAiCLAyHGAiCLA0GEAmohhQMgiwNBkAJqIQQgAEHMAGohoAIgoAIoAgAhDiAOQX9KIa0BIK0BBEAgABDHAiGWASCWASHKAQVBACHKAQsgASwAACEPIA9BGHRBGHVBAEYh5QICQCDlAgRAQQAhpAIFIABBBGohvAIgAEHoAGohyAIgAEH4AGohxwIgAEEIaiG7AiDGAkEKaiGBASDGAkEhaiGCASDGAkEuaiGDASDGAkHeAGohhAEg0gJBBGohAyAPIRtBACFoQQAhoQIgASGtAkIAIaQDQQAhvQIDQAJAIBtB/wFxIdMBINMBELYCIZcBIJcBQQBGIeMCAkAg4wIEQCCtAiwAACEUIBRBGHRBGHVBJUYhvQECQCC9AQRAIK0CQQFqIYoBIIoBLAAAIRUCQAJAAkACQAJAIBVBGHRBGHVBJWsOBgACAgICAQILAkAMBgwDAAsACwJAIK0CQQJqIZoCQQAh7gEgmgIhsgIMAgALAAsCQCAVQf8BcSHgASDgARC+AiGpASCpAUEARiGBAyCBA0UEQCCtAkECaiGTASCTASwAACEdIB1BGHRBGHVBJEYhyQEgyQEEQCCKASwAACEeIB5B/wFxIeoBIOoBQVBqIdMCIAIg0wIQ/QIhqgEgrQJBA2ohbyCqASHuASBvIbICDAQLCyACKAIAIX4gfiEfQQBBBGoh8QEg8QEh8AEg8AFBAWsh7wEgHyDvAWohIEEAQQRqIfUBIPUBIfQBIPQBQQFrIfMBIPMBQX9zIfIBICAg8gFxISEgISEiICIoAgAhIyAiQQRqIX8gAiB/NgIAICMh7gEgigEhsgILCwsgsgIsAAAhJCAkQf8BcSHsASDsARC+AiGsASCsAUEARiGDAyCDAwRAILICIbMCQQAhhwMFILICIbQCQQAhiAMDQAJAIIgDQQpsIaUCILQCLAAAISUgJUH/AXEh7QEgpQJBUGoheSB5IO0BaiHcAiC0AkEBaiGbAiCbAiwAACEnICdB/wFxIesBIOsBEL4CIasBIKsBQQBGIYIDIIIDBEAgmwIhswIg3AIhhwMMAQUgmwIhtAIg3AIhiAMLDAELCwsgswIsAAAhKCAoQRh0QRh1Qe0ARiGuASCzAkEBaiGDAiCuAQRAIO4BQQBHId4CIN4CQQFxIZ8CIIMCLAAAIQYgswJBAmohCyAGISlBACFrIJ8CIXogCyGEAiCDAiG1AkEAIb4CBSAoISkgaCFrQQAheiCDAiGEAiCzAiG1AiC9AiG+AgsCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIClBGHRBGHVBwQBrDjoRGwgbEA8OGxsbGwUbGxsbGxsJGxsbGw0bGwobGxsbGxUbCxoUExIAGQIbARsGGAcbGwwDFxsbFhsEGwsCQCCEAiwAACEqICpBGHRBGHVB6ABGIa8BILUCQQJqIYYCIK8BBH8ghgIFIIQCCyHOAiCvAQR/QX4FQX8LIc8CIM4CIbYCIM8CIckCDBwACwALAkAghAIsAAAhKyArQRh0QRh1QewARiGwASC1AkECaiGHAiCwAQR/IIcCBSCEAgsh0AIgsAEEf0EDBUEBCyHRAiDQAiG2AiDRAiHJAgwbAAsACwJAIIQCIbYCQQMhyQIMGgALAAsBCwJAIIQCIbYCQQEhyQIMGAALAAsCQCCEAiG2AkECIckCDBcACwALAQsBCwELAQsBCwELAQsBCwELAQsBCwELAQsBCwELAQsBCwELAQsBCwJAILUCIbYCQQAhyQIMAgALAAsCQCBrIWwgvgIhxAJBjwEhigMMBgALAAsgtgIsAAAhLCAsQf8BcSHVASDVAUEvcSF9IH1BA0YhsQEg1QFBIHIhqAIgsQEEfyCoAgUg1QELIcoCILEBBH9BAQUgyQILIcsCIMoCQf8BcSGEAwJAAkACQAJAAkAghANBGHRBGHVB2wBrDhQBAwMDAwMDAwADAwMDAwMDAwMDAgMLAkAghwNBAUohLSAtBH8ghwMFQQELIcwCIKQDIaUDIMwCIYkDDAQACwALAkAgpAMhpQMghwMhiQMMAwALAAsCQCDuASDLAiCkAxD+AiBrIWkgoQIhogIgtgIhsQIgpAMhpgMgvgIhwwIMBgwCAAsACwJAIABCABCzAgNAAkAgvAIoAgAhLiDIAigCACEvIC4gL0khsgEgsgEEQCAuQQFqIYgCILwCIIgCNgIAIC4sAAAhMCAwQf8BcSHWASDWASHLAQUgABC1AiGZASCZASHLAQsgywEQtgIhmgEgmgFBAEYh3wIg3wIEQAwBCwwBCwsgyAIoAgAhMiAyQQBGIeACIOACBEAgvAIoAgAhCSAJITYFILwCKAIAITMgM0F/aiGJAiC8AiCJAjYCACCJAiE0IDQhNgsgxwIpAwAhjQMguwIoAgAhNSA2IDVrIdUCINUCrCGcAyCNAyCkA3whkwMgkwMgnAN8IZQDIJQDIaUDIIcDIYkDCwsgiQOsIZ0DIAAgnQMQswIgvAIoAgAhNyDIAigCACE4IDcgOEkhswEgswEEQCA3QQFqIYoCILwCIIoCNgIAIDghOQUgABC1AiGcASCcAUEASCG0ASC0AQRAIGshbCC+AiHEAkGPASGKAwwGCyDIAigCACEHIAchOQsgOUEARiHiAiDiAkUEQCC8AigCACE6IDpBf2ohiwIgvAIgiwI2AgALAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIIQDQRh0QRh1QcEAaw44EBISEg4MChISEhISEhISEhISEhISEhIEEhIAEhISEhIREgEIDw0LEgkSEhISEgYFEhICEgcSEgMSCwELAQsCQCDKAkHjAEYhtQEgygJBEHIhPCA8QfMARiE9AkAgPQRAIMoCQfMARiG3ASDGAkF/QYECEJ4DGiDGAkEAOgAAILcBBEAgggFBADoAACCBAUEANgEAIIEBQQRqQQA6AAAgtgIhrwIFILYCIa8CCwUgtgJBAWohjAIgjAIsAAAhPiA+QRh0QRh1Qd4ARiG4ASC2AkECaiGNAiC4AUEBcSGcAiC4AQR/II0CBSCMAgshtwIgxgIgnAJBgQIQngMaIMYCQQA6AAAgtwIsAAAhPwJAAkACQAJAID9BGHRBGHVBLWsOMQACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgECCwJAILcCQQFqIY4CIJwCQQFzIdoCINoCQf8BcSHXASCDASDXAToAACDXASHbASCOAiG4AgwDAAsACwJAILcCQQFqIY8CIJwCQQFzIdsCINsCQf8BcSHYASCEASDYAToAACDYASHbASCPAiG4AgwCAAsACwJAIJwCQQFzIQwgDEH/AXEhDSANIdsBILcCIbgCCwsguAIhuQIDQCC5AiwAACFAAkACQAJAAkACQAJAIEBBGHRBGHVBAGsOXgADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwEDCwJAIGshbCC+AiHEAkGPASGKAwwgDAQACwALAkAguQIhrwIMBwwDAAsACwJAILkCQQFqIYUBIIUBLAAAIUECQAJAAkACQCBBQRh0QRh1QQBrDl4BAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAAgsBCwJAQS0hRCC5AiG6AgwGDAIACwALAQsguQJBf2ohhgEghgEsAAAhQiBCQf8BcSBBQf8BcUghugEgugEEQCBCQf8BcSHZASDZASGVAQNAAkAglQFBAWohcCDGAiBwaiGHASCHASDbAToAACCFASwAACFDIENB/wFxIdoBIHAg2gFJIbkBILkBBEAgcCGVAQUgQyFEIIUBIboCDAELDAELCwUgQSFEIIUBIboCCwwCAAsACwJAIEAhRCC5AiG6AgsLCyBEQf8BcSHcASDcAUEBaiFxIMYCIHFqIYgBIIgBINsBOgAAILoCQQFqIZECIJECIbkCDAAACwALCyCJA0EBaiFyILUBBH8gcgVBHwshzQEgywJBAUYhuwEgekEARyHmAgJAILsBBEAg5gIEQCDNAUECdCGmAiCmAhCWAyGdASCdAUEARiHnAiDnAgRAQQAhbEEAIcQC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ILsBBEAMAQsgOkEBdCGCAiAwQQRqIdcBINcBKAIAITIgMkF4cSFqIGog9QFGIbgBILgBBEAgMCFJDAQFIIICITogMCFKCwwBCwsggQEg6AE2AgAg6AFBGGoh8gEg8gEgSjYCACDoAUEMaiGOASCOASDoATYCACDoAUEIaiHKASDKASDoATYCAA8LCyBJQQhqIcsBIMsBKAIAITMgM0EMaiGPASCPASDoATYCACDLASDoATYCACDoAUEIaiHNASDNASAzNgIAIOgBQQxqIZABIJABIEk2AgAg6AFBGGoh8wEg8wFBADYCAA8L5wQBBH8gAkGAwABOBEAgACABIAIQFxogAA8LIAAhAyAAIAJqIQYgAEEDcSABQQNxRgRAA0ACQCAAQQNxRQRADAELAkAgAkEARgRAIAMPCyAAIAEsAAA6AAAgAEEBaiEAIAFBAWohASACQQFrIQILDAELCyAGQXxxIQQgBEHAAGshBQNAAkAgACAFTEUEQAwBCwJAIAAgASgCADYCACAAQQRqIAFBBGooAgA2AgAgAEEIaiABQQhqKAIANgIAIABBDGogAUEMaigCADYCACAAQRBqIAFBEGooAgA2AgAgAEEUaiABQRRqKAIANgIAIABBGGogAUEYaigCADYCACAAQRxqIAFBHGooAgA2AgAgAEEgaiABQSBqKAIANgIAIABBJGogAUEkaigCADYCACAAQShqIAFBKGooAgA2AgAgAEEsaiABQSxqKAIANgIAIABBMGogAUEwaigCADYCACAAQTRqIAFBNGooAgA2AgAgAEE4aiABQThqKAIANgIAIABBPGogAUE8aigCADYCACAAQcAAaiEAIAFBwABqIQELDAELCwNAAkAgACAESEUEQAwBCwJAIAAgASgCADYCACAAQQRqIQAgAUEEaiEBCwwBCwsFIAZBBGshBANAAkAgACAESEUEQAwBCwJAIAAgASwAADoAACAAQQFqIAFBAWosAAA6AAAgAEECaiABQQJqLAAAOgAAIABBA2ogAUEDaiwAADoAACAAQQRqIQAgAUEEaiEBCwwBCwsLA0ACQCAAIAZIRQRADAELAkAgACABLAAAOgAAIABBAWohACABQQFqIQELDAELCyADDwtuAQF/IAEgAEggACABIAJqSHEEQCAAIQMgASACaiEBIAAgAmohAANAAkAgAkEASkUE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AJUAyQC8/yr/GgJvAJQAlACUAJQAlADdASQCjgCSALz/vP+8/yr/nAAq/8H/dACUAJQAlACUAJoAmgAq/yr/Kv8q/yr/lAAq/5QAlAAq/5QAKv+iAJAAlgCgAKEAKv8q/9f/1/8q/yr/Kv8q/6MApgAq/7z/vP+8/7z/Kv+eABUAOgHiAbz/Kv+UAKQAqQAq/yr/Kv8q/yr/lAAq/+0BKv8q//IBKv8q/wAAAAAAAAAAAAAAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9g0pUAANeVAADdlQAA6JUAAPCVAADzlQAA+5UAAAGWAAAOlgAAEpYAABiWAAAelgAAJZYAACyWAAA0lgAAOJYAAD2WAABClgAARpYAAEqWAABOlgAAUpYAAFaWAABalgAAXpYAAGKWAABmlgAAapYAAG6WAABylgAAdpYAAHqWAAB+lgAAgpYAAIaWAACKlgAAjpYAAJKWAACWlgAAmpYAAJ6WAACilgAAppYAAKqWAACulgAAspYAALaWAAC6lgAAvpYAAMKWAADGlgAAypYAAM6WAADSlgAA1pYAANqWAADelgAA4pYAAOaWAADqlgAA7pYAAPKWAAD2lgAA+pYAAP6WAAAClwAABpcAAAqXAAAOlwAAEpcAABaXAAAalwAAIZcAACiXAAAtlwAAMZcAADaXAAA9lwAARJcAAEqXAABQlwAAUpcAAFSXAABZlwAAXpcAAGSXAABplwAAbZcAAHGXAAB0lwAAd5cAAHqXAAB+lwAAhZcAAIuXAACSlwAAl5cAAJ2XAACllwAAq5cAALCXAAC1lwAAu5cAAL6XAADElwAAyZcAAM+XAADVlwAA25cAAOKXAADplwAA75cAAPWXAAD6lwAAAAAAAAAAAAAMAA0ADgAPAFEATAASABMAFAAVABYAFwDhAOIATQBTAFQAVQBWAFcAUwBUAFUAVgBXAFgAWQBaAFsATQBOAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAVQBWAFcAOwA8AD0APgA/AEAACgELAUkASgBcAF0ATQBMAEkATABLAE0ATgBMAE8AUABRAE0ATgBMAFUAVgBXAFgAOwA8AD0APgA/AEAAQQBNAE4AAABjAGQAAwAEAEwABgAHAAgACQAKAAsATQBOAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEAQgBDAEQARQBGAEcATAAFAAwADQBPAK8ADQAOAAwADQBMABIAEwAUABUAFgAXABgAGQBMAA0ATAAPAEgAYAASABMAFAAVABYAFwBJAEoAUABRAE0ASABIABEBTAAMAA0ASAAMAA0ATgBIAEwA2gDbAFMAVABVAFYAVwDhAOIATQBMAEgATQBHAE0ASABOAFEATABHAFAARwBOAEsATABJAFQA9QD2APcA+AD5AFQATQBQAFAAXgBNAFEAUQBNAEQAXgAQAAYBBwEIAQkBCgELAf//RwD/////RwARAUwAEwEUAUwAFgH//1IA//9UAFIA//9UAFgA/////1gATQBOAF4A/////14AUwBUAFUAVgBXAP//////////AwAEADMBBgAHAAgACQAKAAsA//87AQ4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8AMAAxADIAMwA0ADUANgA3ADgAOQA6ADsAPAA9AD4APwBAAEEAQgBDAEQARQBGAEcADAANAP//DAANAP//DgAPAP//EQASABMAFAAVABYAFwD///////8MAA0A//8MAA0AYAD//////////00ATgD/////DAANAFMAVABVAFYAVwBNAP///////wwADQBTAFQAVQBWAFcAOwA8AD0APgA/AEAA/////0cA/////0cA//9MAP////9MAP////9SAP//VABSAP//VABYAP//RwBYAP//RwBeAEwA//9eAEwA//////////9UAEcA//9UAFgA//9MAFgA/////14A//9HAF4AVAD/////TABYAP////////////9eAFQA////////WAD/////////////XgANAA4ADwAQABEAEgATABQAFQAWABcAGAAZAA4ADwD/////EgATABQAFQAWABcAUwBUAFUAVgBXAFgAWQBaAFsALQAuAC8AMAAxADIAMwA0ADUANgD//////////zsAPAA9AD4APwBAAEEA/////////////zsAPAA9AD4APwBAAP//TQD//////////00AUwBUAFUAVgBXAFMAVABVAFYAVwBNAP//////////TQBTAFQAVQBWAFcAUwBUAFUAVgBXAE4A//////////9TAFQAVQBWAFcATgD//////////1MAVABVAFYAVwBOAP//////////UwBUAFUAVgBXAE4A//////////9TAFQAVQBWAFcATgD//////////1MAVABVAFYAVwAPAP////8SABMAFAAVABYAFwAPAP////8SABMAFAAVABYAFwAAAAAAYgBqAHAAYgDtAEgAYgBiAGIAYgBiAGIAAwEFASQB9QD2APcA+AD5APUA9gD3APgA+QAGAQcBCAEJARABEQFoAG4AdAB5AH0AgwCLAJMAmwCjAKsAsgC1APcA+AD5AHAAcABwAHAAcABwACwBLQEKAQsB2gDbAAwBSQDjAEoA5gASARMBSwDqAOwA7AAVARYBTADwAPEA8gDzAMIAxgDKAM4A0gDWANkAFwEWAd0A+gD7AAEAAgBNAAMABAAFAAYABwAIADkBFgEJAAoACwAMAA0ADgAPABAAEQASABMAFAAVABYAFwAYABkAGgAbABwAHQAeAB8AIAAhACIAIwAkACUAJgAnACgAKQAqACsALAAtAC4ALwAwADEAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAE4A4ABSAFMA3AD+AGUAawBSAFMATwB/AIcAjwCXAJ8ApwCwALMAUABnAFEAcwDfAEMAggCKAJIAmgCiAKoACgELAR0BHgEnAeUA5wAu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AXoBewF9AX4BgAGBAYIBgwGEAYUBhgGHAYgBigGLAYwBjQGOAY8BkAGRAZIBlAGVAZcBmAGZAZoBmwGcAZ0BngGgAQAAAAAAAAAAAAAAAAADBAYHCAkKCw4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdgYmNkZkxMTExMTExMTEwMDUdMUlRYXmdoaWprbG5vcExYZ2hqa21wZ2hpa2xwaGlqa2xub2hrbXBoa2xnaGlqa2xub2doaWprbG5vZ2hpamtsbm9naGlqa2xub2doaWprbG5vZ2hpamtsbm9YZ2hrZ2hraGhoaGhoaGhoaGhpa2xoaWtsaGlrbGhpa2xoaWtsaGlrbGhrXF1PAGNIBUtMcHFIcEhISHBlcGVMTHBwcHBOU1RVVldwcE5OcHBwTUxxcHFYWVpbSUpNTU1NTU5NTk5NTk1ISE1OTlBRcHBwcHBNTkdNcHBwcHFxZXBwcE1OTlBQUU1NTU5NcFFNcE1NAAAAAAAAAAAAAAAAAABhYmJjY2NjY2NjY2NjY2NkZGRkZGRkZWVmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZ2hpamtsbW5vcHBwcHBwcHBwcHBxcXFxcXFxcXEAAAAAAAAq/yr/swAq/7P/Kv+XANwB6AGlABIAYgHpAG0CdgL0/yv/AAAAAAAAAAAAAAAAAAD//0QARQBGAOsARwBaAFsAXABdAF4AXwBpAGAAYQB7AOQAAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQECAwEBBAEBAQEBAQEBAQEBAQEBAQEBAQIFBgcICQoBCwwNDg8QERITExMTExMTExMTFBUWFxgZARobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIkAQEBATMBNDU2Nzg5Ojs8PSQ+P0BBQkNERUZHSElKSyQBTAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAByAHIAAAAAAAAAAAB3AGQAYwBiAGQATwARAFYAZABbAGQAUgBTAFkAVwBUAFgAZABaAEkAVQASAEsAXABMAGQAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAXgBfAGQAagBpAGoAagBxAHAAcQBxAHIAcwB1AHQAdQBtAGwAYgBOAEoAUAAAAAAAAAAAAAAAAAAAAAAASQBNAF0AYQBgAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAGEAYQBhAFEAaQAAAAAAcAAAAAAAcgB0AG0AbAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAABwAGQBFADgAOQA2AEgAOwA3ADoAPAA9AC4AMgAoADEAHgAfACAAQwA/AEEAGwBCAD4AQAA1ADQAEwAUABUARAApABoAIwAlACQAJgBHAEYAMAAdAC8AMwAnABYAFwAYAC0AKwAhACwAIgAqAAAAAABlAAAAbgAAAAAAAAAAAAAAAAAAAAAAAAAAAAgADgAAAAAAAAAAAAAAAAAQAAAACgACAAMAAAAAAAAAAAAAAAAADwBmAGcAAAAAAAAAAAAEAAkAAAAAAAAAAAAGAGgAbwAAAAAACwAMAAAAAAAAAAcABQANAAAAawAAAAAAAAAAAAAASgBMAE4AUABRAlACUgBUAEQCQwJTAlgCWAJYAk8COgJYAlgCAABYAkYCWAJYAlgCWAJYAlgCRwBYAjwCWAJYAlgCNwJYAjYCSgB9AFQASABGADgCRQBPAIEATACDAIYAXACWAKYANwI2Av0BWAJYAkUCegBYAlgCRAKZAAAAWAJYAlgCQwIAALEAWAJYAgAAWAJBAJEAtACtAJYAegCqAKsAMgJYAlgCMAJYAskAygDQANoAuQDCAOUA3wDmAOcA+ADwAPEABAH7ABEB9QD9ABcBCAEVARYBPAE+ATkBJQHMAEwBWQFJATIBQAFFAVgCWAJRATYBWAI/AWIBAABYAgAAMgJEAUgBZwFmAWoBcwFeAVgCdgF7AXgBaQFvAS4CLQIsAisCKgIpAigCJwImAiUCJAIjAiICIQIgAh0CFwL5AfgB8wHyAfAB7wHuAe0B6wHpAegB5gHkAd0BhQFdAT8BMQEwASkBJAEHAQIB/gD5APYA7ADqAOMAzQCVAJQAjQCMAG4AZABXAHsBfwFYAoEBWAKCAYcBhgGDAYoBjwGOAYwBoAGKAVgCWAKdAZ0BnwGcAZ8BoAFYAqEBWAJYAlgCqgGgAaoBtAGnAakBWAJYAlgCtAG6AcABvgFYAlgCuQG+AcABvAFYAlgCWALPAdEBWAJYAtEB0wHHAVgCWAJYAs0BWAJYAg4CEwIYAh0CIgJmACQCKQIuAgAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADAAMABAAEAAUABQAGAAYACQAJAAoACgAtACsAAwAqAAQAJwAFADAABgAeAC4AHgAeACoAJwApAB4ADAHHAC0AHgArAB4AMwAnAB4ATAAwAC4AJwAeAMYAKQApAC4AHgApAB4AHgAqACcAxQAeADMALQAeACsAHgAzACcAHgBMADAALgAnAB4AKAApACkALgAvACkAMQA8ACgAMgAoADwAMwAvACgAxADDADMAKAAoAFEAKAAyAMIAwQA0ADIAKAAvADEATQBQADQAPAAoADQAKAA8AEAALwAoADUAQAAoACgAUQAoADUAMgBHADQAMgAoAC8AMQBSAE0AUAA0AE8AXQA0AEcATgBAADUAUwBPAEAAXgA1ADUATgA1AE4ANABZAFoATgBzAMAAUgBdAFsAWQBPAFoAcwBHAE4ANQBTAE8AXABeADUANQBOAGAATgBbAFwAvwBOAF8AYQBiAF0AYAC+AFkAvQBaAHMAYgBkAGUAXABfAF4AaQC8AGEAYwC7AFsAZwBcAGoAugBiAGMAYwC5AGAAZgBkAGMAuABsAGIAaQBcAGYAXwBlAGUAYQBoAGcAYwBqAG0AbgBrAGIAaABjAGMAbgBrAGQAbABjAGYAZgBpALcAcgBmAGUAZQC2AG0AZwBjAGoAaABoALUAtAB3AGgAawBrAG4AawBsAHEAZgBmAG8AcgBwALMAeAB9AG8AbQBwAHkAeABoAGgAdgBxAHkAdABrAGsAdwBxAG8AfwBwAHQAdAByAIUAeAB1AHQAfQBvALIAcAB1AHgAhgB8AHEAfAB5AHYAdgB3AHEAbwB/AHAAgAB0AHQAhQB4AIcAiAB0AIsAdQB1AIkAdQCGAHwAigB8AI0AdgB2AJAAiQCOAI8AsQCRAIAAyQDIAMsAzQCHAIgAiwB1AHUAzgCJAMgAzwDRAIoA0ACNANIAkACJANMAjgCPAJEA1ADWAMkAyADLAM0A2QDVANoA2wDcAM4AyADdAM8A0QDQANUA3gDSAOAA5ADTAOUA5gDUANYA6ADVAOkA5wDtANkA1QDaANsA3ADuAO8A3QDwAPUA1QDeAPMA4ADnAOQA5QD0AOYA9gDoANUA6QD6AOcA7QD7AP4A/wCwAAAB7gDvAAQB8AD1AK8A8wCuAOcArQCsAPQAqwD2AKoAqQCoAKcA+gCmAKUA+wD+AP8AAAGkAKMABAEHAQcBBwEHAQcBCAEIAQgBCAEIAQkBCQEJAQkBCQEKAQoBCgEKAQoBCwELAQsBCwELAQ0BDQEOAaIADgEOAQ4BDwEPAaEADwEPAaAAnwCeAJ0AnACbAJoAmQCYAJcAlgCVAJQAkwCSAIQAVwBUAEUAPwA7ADgANwA2ACwAJgAkACAAFwASABEADQAMAAsACAAHAAYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEAAAAAAAAAAAYBAQAHAQcBCAEIAQkBCQEKAQoBCwELAQYBBgEGAQYBBgEGAQYBBgEMAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BBgEGAQYBBgEGAQYBBgEGAQYBDgEGAQYBBgEGAQ8BBgEGAQYBDAEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgENAQYBDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BBgEGAQYBBgEGAQYBBgEOAQYBDwEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BDQENAQ0BBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQAABgEGAQYBBgEGAQYBBgEGAQYBAAEBAQEBAgEBAQEBAQEBAQEDAQQFAQEBAQEEBAQEBAQFBQUFBQUFBQUFBQUFBQUFBQUFBQQEBAQEBAUFBQUFBQUFBQUFBQUFBQUFBQEAAAAAAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALAAsAC0ALgAsAC8ALAAwADEAMgAsADMANAA1ACwALAAsADYANwAOACcAKAApACoAKwAsACwALAAtAC4ALwAsADAAMQAyACwAMwA0ADUALAAsACwANgA3ADgAOgA7ADoAOwA+AD8APgA/AEQARQBEAEUAWABYADwAWAA8AFgAQABYAEAATABYAE0ATgBmAFkAWABPAEoAWABoAFAAZwBRAFgAWgBSAIYAbQBpAFsAUwBYAGMAZABqAEwAZQBNAE4AZgBZAFgATwBxAGgAUABnAFEAcgBaAFIAhgBtAGkAWwBTAFgAYwBkAGoAWABlAFgAfABcAFgAXQB9AHEAawBeAFgAWAByAF8AYACPAGEAbwBYAFgAWABwAGIAbABuAIcAjgBzAHwAXAB0AF0AfQB/AGsAXgBYAIAAXwBgAI8AYQB2AG8AhAB1AHAAYgBsAG4AkACHAI4AcwCMAFgAdACFAIgAfwB3AJEAjQCAAFgAeAB5AIkAdgCKAHUAWABYAIsAWABYAJAAlwBYAJIAjACTALsAhQCIAHcAkQCNAFgAmAB4AHkAiQBYAIoAlACVAFgAiwBYAFgAWACXAJoAWACSAFgAkwC7AJwAWABYAJYAmQCYAFgAWACbAFgAWACUAFgAlQBYAFgAnQCeAJ8AWACaAFgAogCgAFgAWACcAKwAlgClAJkAowCkAJsAWACoAKEArQBYAFgAWACdAKkAngCfALMArgCiALEAoACmAKcArABYAFgApQCjAKQAWACyAKgAoQCtAKoAqwBYAFgAWACpAK8AsACzAK4AsQBYAKYApwBYALoAWABYAFgAygC0ALIAtgBYAMUAqgCrAFgAuADHAFgArwCwAMQAuQC1AMsAtwC8AL0AugDNAMYAWAC+AMoAtABYALYAvwDFAM4AyAC4AMkAxwDCAMMAxAC5ALUAywC3AMwAvAC9AM0AxgDPANAAvgDUAMAAwQDRAL8AzgDIANMAyQDVAMIAwwDYANIA1gDXAFgA2QDMANwA2gDdAN4AzwDQANQAwADBAN8A0QDbAOAA4gDTAOEA1QDjANgA0gDkANYA1wDZAOUA6QDcANoA3QDeAOoA5gDrAOwA7QDfANsA7gDgAOIA4QDnAO8A4wDwAPEA5ADyAPMA5QDpAPYA6AD3APQA+ADqAOYA6wDsAO0A+QD6AO4A+wD+AOcA7wD8APAA9QDxAPIA/QDzAP8A9gDoAPcAAAH0APgAAQECAQMBWAAEAfkA+gAFAfsA/gBYAPwAWAD1AFgAWAD9AFgA/wBYAFgAWABYAAABWABYAAEBAgEDAQQBWABYAAUBOQA5ADkAOQA5AD0APQA9AD0APQBBAEEAQQBBAEEAQwBDAEMAQwBDAEYARgBGAEYARgBXAFcAgQBYAIEAgQCBAIMAgwBYAIMAgwBYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWACEAFgAVACCAH4AewB6AFgAWABYAFYAVQBUAEsASQBIAAYBRwBHAEIAQgANAAYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBBgEGAQYBAAAAAAAAqGAAALBgAAAHAAAAuGAAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuGAAAMhgAAADAAAA0GAAAMhgAAAFAAAAAAAAAAAAAAAAAAAA2GAAALBgAAADAAAAuGAAAOBgAAACAAAA0GAAAOhgAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuGAAAPBgAAAEAAAA0GAAAPBgAAAGAAAAAAAAAAAAAAAAAAAA+GAAAABhAAACAAAAuGAAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuGAAABBhAAAEAAAA0GAAABBhAAAGAAAAAAAAAAAAAAAAAAAAGGEAALBgAAACAAAAuGAAACBhAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuGAAAChhAAAEAAAA0GAAAChhAAAHAAAAAAAAAAAAAAAAAAAAMGEAAPBgAAAGAAAAOGEAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQGEAAMhgAAADAAAAOGEAAMhgAAADAAAASGEAAMhgAAAFAAAAAAAAAAAAAAAAAAAAUGEAALBgAAAEAAAAOGEAAOBgAAACAAAASGEAAOhgAAACAAAAAAAAAAAAAAAAAAAAQGEAAPBgAAAEAAAAOGEAAPBgAAAEAAAASGEAAPBgAAAGAAAAAAAAAAAAAAAAAAAAWGEAAABhAAACAAAAOGEAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOGEAABBhAAAEAAAASGEAABBhAAAGAAAAAAAAAAAAAAAAAAAAYGEAALBgAAACAAAAOGEAACBhAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOGEAAChhAAAEAAAASGEAAChhAAAHAAAAAAAAAAAAAAAAAAAAaGEAALBgAAAGAAAAcGEAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcGEAAMhgAAAEAAAAeGEAAMhgAAAFAAAAAAAAAAAAAAAAAAAAgGEAALBgAAADAAAAcGEAAOBgAAACAAAAeGEAAOhgAAACAAAAAAAAAAAAAAAAAAAAiGEAAPBgAAADAAAAcGEAAPBgAAAEAAAAeGEAAPBgAAAGAAAAAAAAAAAAAAAAAAAAkGEAAABhAAACAAAAcGEAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcGEAABBhAAADAAAAeGEAABBhAAAGAAAAAAAAAAAAAAAAAAAAmGEAALBgAAACAAAAcGEAACBhAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcGEAAChhAAAEAAAAeGEAAChhAAAHAAAAAAAAAAAAAAAAAAAAoGEAALBgAAAGAAAAqGEAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqGEAAMhgAAADAAAAsGEAAMhgAAAFAAAAAAAAAAAAAAAAAAAAuGEAALBgAAAEAAAAqGEAAOBgAAACAAAAsGEAAOhgAAACAAAAiGEAAMBhAAAFAAAAAAAAAAAAAAAAAAAAqGEAAPBgAAAEAAAAsGEAAPBgAAAGAAAAAAAAAAAAAAAAAAAAyGEAAABhAAACAAAAqGEAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqGEAABBhAAAEAAAAsGEAABBhAAAGAAAAAAAAAAAAAAAAAAAA0GEAALBgAAACAAAAqGEAACBhAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqGEAAChhAAAEAAAAsGEAAChhAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2GEAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GEAAMhgAAADAAAA2GEAAMhgAAADAAAA6GEAAMhgAAADAAAAAAAAAAAAAAAAAAAA8GEAALBgAAACAAAAAAAAAAAAAAAAAAAA+GEAALBgAAACAAAAAAAAAAAAAAAAAAAA4GEAAPBgAAAEAAAA2GEAAPBgAAAEAAAA6GEAAPBgAAAEAAAAAAAAAAAAAAAAAAAAAGIAAABhAAACAAAA2GEAAAhhAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4GEAABBhAAAEAAAA2GEAABBhAAAEAAAA6GEAAAhiAAAEAAAAAAAAAAAAAAAAAAAAEGIAALBgAAACAAAA2GEAACBhAAAFAAAAGGIAALBgAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2GEAAChhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIGIAAOBgAAACAAAAKGIAAMBgAAAGAAAAMGIAAOBgAAACAAAAAAAAAAAAAAAAAAAAIGIAAMhgAAADAAAAKGIAAMhgAAADAAAAMGIAAMhgAAADAAAAAAAAAAAAAAAAAAAAOGIAALBgAAACAAAAKGIAAOBgAAACAAAAQGIAALBgAAACAAAAAAAAAAAAAAAAAAAAIGIAAPBgAAAEAAAAKGIAAPBgAAAEAAAAMGIAAPBgAAAEAAAAAAAAAAAAAAAAAAAASGIAAABhAAACAAAAKGIAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIGIAABBhAAAEAAAAKGIAABBhAAAEAAAAMGIAAAhiAAAEAAAAAAAAAAAAAAAAAAAAUGIAALBgAAACAAAAKGIAACBhAAAEAAAAWGIAALBgAAACAAAAAAAAAAAAAAAAAAAAIGIAAChhAAAEAAAAKGIAAChhAAAEAAAAMGIAACBhAAAEAAAAAAAAAAAAAAAAAAAAYGIAAOBgAAACAAAAaGIAAMBgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGIAAMhgAAADAAAAaGIAAMhgAAADAAAAcGIAAMhgAAAFAAAAAAAAAAAAAAAAAAAAeGIAALBgAAACAAAAaGIAAOBgAAACAAAAgGIAALBgAAACAAAAAAAAAAAAAAAAAAAAYGIAAPBgAAAEAAAAaGIAAPBgAAAEAAAAcGIAAPBgAAAGAAAAAAAAAAAAAAAAAAAAiGIAAABhAAACAAAAaGIAAAhhAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGIAABBhAAAEAAAAcGIAABBhAAAGAAAAAAAAAAAAAAAAAAAAkGIAALBgAAACAAAAaGIAACBhAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaGIAAChhAAAEAAAAcGIAAChhAAAHAAAAAAAAAAAAAAAAAAAAmGIAAOBgAAACAAAAoGIAAMBgAAAG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gClhmPwMeFat5nCwY2sADuVt/DE4QkAAc+RA/GU9zPwfMriKmW9r6ggSzMT7hXuYIuwPqE4AAee1gp0wnYLBKiTAUH5rgznngtxlMwgA1ZyClXFDBQr2OGNisvAVBpmAnTXOgrt4F6iPiAG84IEAfnCCf8/QdjIA2592XHEopDhV00fcWfBLPIi0sN0AB5zl/Ge5BbQDSRzg7Y6Gd2UAAfRNFBAsMCkAdN4dFPEP0BAfYabqAXYGRYKBbESJeWdOAp0IRjE40EeCMY0GSERFZbZovxKYn1hmboF0FBTZ3qA6DdoHF6iAR6EaMQItCBsxAOi6ARzc7qoy541zQ6S7J3Qc9wR8oq8KhqBTOLYyOJy2Mj5gtr9Q+vCwK5jFYwEHkvKBMhSg8jIBNGyfXxj5BT0YH//azU6QcN+yRPevqlvu18Dat9gXAxXcDDOAz4PEQG8zJdI1fROSfFUoKxMVVm9HaEDRKUXiIKExOvESoTF0Qa8unUUyIN8M0FeKjX0zJfyQtRnAD9YSA1YWBl5MSDfJAHMxeTdIcO1KSRB0By9SfHqIV6mFHKWAoUQn04ADGD0xJO2030wtObgAkbaB96M+FqQZ6MdHqIAlUhdZJgFWt6NI7TAyZWUGwNMxfRpPrIf/sG46ZC/nAOR6yGQyMhB55oCBNfNBDMyoBSzIAAEAAAAAAAAAAgAAwAMAAMAEAADABQAAwAYAAMAHAADACAAAwAkAAMAKAADACwAAwAwAAMANAADADgAAwA8AAMAQAADAEQAAwBIAAMATAADAFAAAwBUAAMAWAADAFwAAwBgAAMAZAADAGgAAwBsAAMAcAADAHQAAwB4AAMAfAADAAAAAswEAAMMCAADDAwAAwwQAAMMFAADDBgAAwwcAAMMIAADDCQAAwwoAAMMLAADDDAAAww0AANMOAADDDwAAwwAADLsBAAzDAgAMwwMADMMEAAzTAAAAAP////////////////////////////////////////////////////////////////8AAQIDBAUGBwgJ/////////woLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIj////////CgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAAAAAAAAAAAAAAAAAAAEQAKABEREQAAAAAFAAAAAAAACQAAAAALAAAAAAAAAAARAA8KERERAwoHAAETCQsLAAAJBgsAAAsABhEAAAAREREAAAAAAAAAAAAAAAAAAAAACwAAAAAAAAAAEQAKChEREQAKAAACAAkLAAAACQALAAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAwAAAAADAAAAAAJDAAAAAAADAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAANAAAABA0AAAAACQ4AAAAAAA4AAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAADwAAAAAPAAAAAAkQAAAAAAAQAAAQAAASAAAAEhISAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAAAASEhIAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALAAAAAAAAAAAAAAAKAAAAAAoAAAAACQsAAAAAAAsAAAsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAADAAAAAAMAAAAAAkMAAAAAAAMAAAMAAAwMTIzNDU2Nzg5QUJDREVGCgAAAGQAAADoAwAAECcAAKCGAQBAQg8AgJaYAADh9QUAAAAAOWkAAHAFAAA5aQAABQAAAAAAAAAAAAAARgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARwAAAEgAAACKukQAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAAAAAARgAAAAAAAAAAAAAAAAAAAAAAAABJAAAAAAAAAEgAAACor0QAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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byBsb2FkIGFkZHJlc3MsIGRhdGEgbGVuZ3RoIGlzICQlMDRYLgoAIFdyaXRpbmcgIiVzIiBhcyBwcmcsIHNhdmluZyBmcm9tICQlMDRYIHRvICQlMDRYLgoAc2Z4AEVycm9yOiBubyBzdGFydCBhcmd1bWVudCBnaXZlbi4KACwAc3lzAHN5c3RyaW0ARXJyb3I6IGludmFsaWQgdmFsdWUgZm9yIHRoZSBzdGFydCBvZiBiYXNpYyB0ZXh0IGFkZHJlc3MuCgBiYXNpYwBFcnJvcjogaW52YWxpZCB2YWx1ZSBmb3IgdGhlIHN0YXJ0IG9mIGJhc2ljIHZhcmlhYmxlcyBhZGRyZXNzLgoARXJyb3I6IGludmFsaWQgdmFsdWUgZm9yIHRoZSBoaWdoZXN0IGFkZHJlc3MgdXNlZCBieSBiYXNpYyBhZGRyZXNzLgoAYmluAEVycm9yOiBpbnZhbGlkIGFkZHJlc3MgZm9yIDxzdGFydD4sIG11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIFswIC0gMHhmZmZmXQoAbkQ6dDp4Olg6czpmOiVzAGVycm9yOiBpbnZhbGlkIHZhbHVlLCAlZCwgZm9yIC10IG9wdGlvbiwgbXVzdCBiZSBvbmUgb2YgMSwgMjAsIDIzLCA1MiwgNTUsIDE2LCA0LCA2NCwgMTI4LCAxNjIsIDE2OCwgNDAzMiBvciA0ODA3NS4KAEVycm9yOiBpbnZhbGlkIHZhbHVlIGZvciAtRCA8c3ltYm9sPls9PHZhbHVlPl0gb3B0aW9uLgoARXJyb3I6IGludmFsaWQgdmFsdWUgZm9yIC1EIDxzeW1ib2w+PTx2YWx1ZT4gb3B0aW9uLgoAV2FybmluZzogLVAgYml0cyAwIGFuZCAxIGFyZSByZXF1aXJlZCBieSBzZngsIHNldHRpbmcgdGhlbS4KAFdhcm5pbmc6IC1QIGJpdHMgMyBhbmQgMiBhcmUgbm90IHN1cHBvcnRlZCBieSBzZngsIGNsZWFyaW5nIHRoZW0uCgBpX2ZvdXJ0aF9vZmZzZXRfdGFibGUARXJyb3I6IGNhbid0IGNvbWJpbmUgYW55IG9mIHRoZSAtbiwgLXggb3IgLVggZmxhZ3MuCgBpX2VmZmVjdABFcnJvcjogaW52YWxpZCByYW5nZSBmb3IgZWZmZWN0IHNob3J0aGFuZCwgbXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgWzEgLSAzXQoAaV9lZmZlY3RfY3VzdG9tAGVmZmVjdF9jdXN0b20AaV9lZmZlY3Rfc3BlZWQARXJyb3I6IENhbid0IHVzZSBzaG9ydGhhbmQgZm9yIC1YIGZsYWcuCgBpX2VudGVyX2N1c3RvbQBlbnRlcl9jdXN0b20AaV9leGl0X2N1c3RvbQBleGl0X2N1c3RvbQBjcnVuY2hlZF9kYXRhAFN0YXJ0IGFkZHJlc3MgImJhc2ljIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0aGUgJXMgdGFyZ2V0LgoAaV9sb2FkX2FkZHIAaV9hMl9maWxlX3R5cGUARXJyb3I6CiBUaGUgbWVtb3J5IG9mIHRoZSAlcyB0YXJnZXQgZW5kcyBhdCAkJTA0WCBhbmQgY2FuJ3QgaG9sZCB0aGUKIHVuY3J1bmNoZWQgZGF0YSB0aGF0IGNvdmVycyAkJTA0WCB0byAkJTA0WC4KAEVycm9yOiBhbGwgZGF0YSBsb2FkZWQgdG8gdGhlIG1lbW9yeSBob2xlLgoAV2FybmluZywgdHJpbW1pbmcgYWRkcmVzcyBpbnRlcnZhbCB0byAkJTA0WC0kJTA0WC4KAE1lbW9yeSBob2xlIGF0IGludGVydmFsICQwNDAwLSQxMDAwIGluY2x1ZGVkIGluIGNydW5jaC4uCgAgVGFyZ2V0IGlzIHNlbGYtZGVjcnVuY2hpbmcgJXMgZXhlY3V0YWJsZQAKRXJyb3I6IGNhbid0IGZpbmQgc3lzIGFkZHJlc3MgKHRva2VuICQlMDJYKSBhdCBiYXNpYyB0ZXh0IHN0YXJ0ICgkJTA0WCkuCgAsCiBqbXAgYWRkcmVzcyAkJTA0WC4KACwKIGJhc2ljIHN0YXJ0ICgkJTA0WC0kJTA0WCkuCgByX3N0YXJ0X2FkZHIAcl90YXJnZXQAcl9pbl9sb2FkAHJfaW5fbGVuAGlfYmFzaWNfdHh0X3N0YXJ0AGlfYmFzaWNfdmFyX3N0YXJ0AGlfYmFzaWNfaGlnaGVzdF9hZGRyAGlfbGl0ZXJhbF9zZXF1ZW5jZXNfdXNlZABpX21heF9zZXF1ZW5jZV9sZW5ndGhfMjU2AFBhcnNlIGZhaWx1cmUuCgBsb3dlc3RfYWRkcgBtYXhfdHJhbnNmZXJfbGVuAGxvd2VzdF9hZGRyX291dABoaWdoZXN0X2FkZHJfb3V0AGlfdGFibGVfYWRkcgBzdGFnZTNlbmQAenBfbGVuX2xvAHpwX2xlbl9oaQB6cF9zcmNfbG8AenBfYml0c19oaQBpX2VmZmVjdDIAaV9pcnFfZW50ZXIAaV9pcnFfZHVyaW5nAGlfaXJxX2V4aXQAIFdyaXRpbmcgIiVzIiBhcyAlcywgc2F2aW5nIGZyb20gJCUwNFggdG8gJCUwNFguCgBNZW1vcnkgbGF5b3V0OiAgIHxTdGFydCB8RW5kICAgfAoAIENydW5jaGVkIGRhdGEgICB8ICQlMDRYfCAkJTA0WHwKACBEZWNydW5jaGVkIGRhdGEgfCAkJTA0WHwgJCUwNFh8CgAgRGVjcnVuY2ggdGFibGUgIHwgJCUwNFh8ICQlMDRYfAoAIERlY3J1bmNoZXIgICAgICB8ICQwMEZEfCAkJTA0WHwgYW5kIAAkJTAyWCwkJTAyWCwkJTAyWCwkJTAyWCwkJTAyWAoAY19lZmZlY3RfY29sb3IAIERlY3J1bmNoIGVmZmVjdCB3cml0ZXMgdG8gJCUwNFguCgBEZWNydW5jaGVyOiAgfEVudGVyIHxEdXJpbmd8RXhpdCAgfAoAaV9yYW1fZW50ZXIAaV9yYW1fZHVyaW5nAGlfcmFtX2V4aXQAIFJBTSBjb25maWcgIHwgICAkJTAyWHwgICAkJTAyWHwgICAkJTAyWHwKACBJUlEgZW5hYmxlZCB8ICAgJTNkfCAgICUzZHwgICAlM2R8CgBpX25taV9lbnRlcgBpX25taV9kdXJpbmcAaV9ubWlfZXhpdAAgTk1JIGVuYWJsZWQgfCAgICQlMDJYfCAgICQlMDJYfCAgICQlMDJYfAoAJC4lcyAlMDZYICUwNlggJVgAcmF3AGJyZCVzAEVycm9yOiBleGFjdGx5IG9uZSBpbnB1dCBmaWxlIG11c3QgYmUgZ2l2ZW4uCgBFcnJvcjogZmlsZSBub3QgZm91bmQuCgBFcnJvcjogaW52YWxpZCB2YWx1ZSBmb3IgcGxhaW4gZmlsZSBvZmZzZXQuCgBFcnJvciwgdmFsdWUgZm9yIHBsYWluIGZpbGUgbGVuIG11c3Qgbm90IGJlIHplcm8uCgBFcnJvcjogY2FuJ3Qgc2VlayB0byBvZmZzZXQgJWQuCgBFcnJvcjogY2FuJ3QgcmVhZCAlZCBieXRlcyBmcm9tIG9mZnNldCAlZC4KAFJlYWRpbmcgJWQgYnl0ZXMgZnJvbSBvZmZzZXQgJWQuCgBFcnJvcjogdHJpZWQgdG8gcmVhZCAlZCBieXRlcyBidXQgZ290ICVkLgoAIFJlYWRpbmcgJWQgYnl0ZXMgZnJvbSAiJXMiLgoAIERlY3J1bmNoZWQgZGF0YSBleHBhbmRlZCAlZCBieXRlcyAoJTAuMmYlJSkKAGRlc2Z4AGU6JXMAbzpxQnYAbG9hZABFcnJvcjogaW52YWxpZCBhZGRyZXNzIGZvciAtZSBvcHRpb24sIG11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIFswIC0gMHhmZmZmXQoARXJyb3IsIGNhbid0IGZpbmQgZW50cnkgcG9pbnQuCgAgRGVjcnVuY2ggdG9vayAlMC42ZiBNY3ljbGVzLCBzcGVlZCB3YXMgJTAuMmYga0IvTWMgKCUwLjJmIGMvQikuCgAgV3JpdGluZyAiJXMiIGFzIHByZywgc2F2aW5nIGZyb20gJCUwNFggdG8gJCUwNFgsIGVudHJ5IGF0ICQlMDRYLgoALXYALT8AdXNhZ2U6ICVzIGxldmVsfG1lbXxzZnh8cmF3fGRlc2Z4IFtvcHRpb25dLi4uIGluZmlsZVssPGFkZHJlc3M+XS4uLgogIHNlZSB0aGUgaW5kaXZpZHVhbCBjb21tYW5kcyBmb3IgbW9yZSBoZWxwLgoARXJyb3I6IHVucmVjb2duaXNlZCBjb21tYW5kICIlcyIuCgB1c2FnZTogJXMgZGVzZnggW29wdGlvbl0uLi4gaW5maWxlCiAgVGhlIGRlc2Z4IGNvbW1hbmQgZGVjcnVuY2hlcyBmaWxlcyB0aGF0IHByZXZpb3VzbHkgYmVlbiBjcnVuY2hlZCB1c2luZyB0aGUKICBzZnggY29tbWFuZC4KACAgLWUgPGFkZHJlc3M+ICBvdmVycmlkZXMgdGhlIGF1dG9tYXRpYyBlbnRyeSBwb2ludCBkZXRlY3Rpb24sIHVzaW5nICJsb2FkIiBhcwogICAgICAgICAgICAgICAgPGFkZHJlc3M+IHNldHMgaXQgdG8gdGhlIGxvYWQgYWRkcmVzcyBvZiB0aGUgaW5maWxlCgB1c2FnZTogJXMgW29wdGlvbl0uLi4gaW5maWxlCgAgIC1iICAgICAgICAgICAgY3J1bmNoL2RlY3J1bmNoIGJhY2t3YXJkcyBpbnN0ZWFkIG9mIGZvcndhcmQKICAtciAgICAgICAgICAgIHdyaXRlIG91dGZpbGUgaW4gcmV2ZXJzZSBvcmRlcgogIC1kICAgICAgICAgICAgZGVjcnVuY2ggKGluc3RlYWQgb2YgY3J1bmNoKQoAT3JpYwB0YXAAVmljMjAAcHJnAFZpYzIwKzNrQgBWaWMyMCszMmtCAFZpYzIwKzNrQiszMmtCAEMxNgBwbHVzNABDNjQAQzEyOABBcHBsZSBdWysAQXBwbGVTaW5nbGUAQXRhcmkgNDAwLzgwMCBYTC9YRQB4ZXgAUEVUIENCTSA0MDMyAEJCQyBNaWNybyBCAEJCQ0ltL0JCQ1hmZXIgaW5mAHVzYWdlOiAlcyBzZnggYmFzaWNbLDxzdGFydD5bLDxlbmQ+Wyw8aGlnaD5dXV18c3lzW3RyaW1dWyw8c3RhcnQ+XXxiaW58PGptcGFkZHJlc3M+IFtvcHRpb25dLi4uIGluZmlsZVssPGFkZHJlc3M+XS4uLgogIFRoZSBzZnggY29tbWFuZCBnZW5lcmF0ZXMgb3V0ZmlsZXMgdGhhdCBhcmUgaW50ZW5kZWQgdG8gZGVjcnVuY2ggdGhlbXNlbHZlcy4KICBUaGUgYmFzaWMgc3RhcnQgYXJndW1lbnQgd2lsbCBzdGFydCBhIGJhc2ljIHByb2dyYW0uCiAgVGhlIHN5cyBzdGFydCBhcmd1bWVudCB3aWxsIGF1dG8gZGV0ZWN0IHRoZSBzdGFydCBhZGRyZXNzIGJ5IHNlYXJjaGluZyB0aGUKICBiYXNpYyBzdGFydCBmb3IgYSBzeXMgY29tbWFuZC4KICBUaGUgc3lzdHJpbSBzdGFydCBhcmd1bWVudCB3b3JrcyBsaWtlIHRoZSBzeXMgc3RhcnQgYXJndW1lbnQgYnV0IGl0IHdpbGwKICBhbHNvIHRyaW0gdGhlIHN5cyBsaW5lIGZyb20gdGhlIGxvYWRlZCBpbmZpbGUuCgAgIHRoZSA8am1wYWRkcmVzcz4gc3RhcnQgYXJndW1lbnQgd2lsbCBqbXAgdG8gdGhlIGdpdmVuIGFkZHJlc3MuCiAgLXQ8dGFyZ2V0PiAgICBzZXRzIHRoZSBkZWNydW5jaGVyIHRhcmdldCwgbXVzdCBiZSBvbmUgb2YgMSwgMjAsIDIzLCA1MiwgNTUKICAgICAgICAgICAgICAgIDE2LCA0LCA2NCwgMTI4LCAxNjIgb3IgMTY4LCBkZWZhdWx0IGlzIDY0CiAgLVg8Y3VzdG9tIHNsb3cgZWZmZWN0IGFzc2VtYmxlciBmcmFnbWVudD4KICAteFsxLTNdfDxjdXN0b20gZmFzdCBlZmZlY3QgYXNzZW1ibGVyIGZyYWdtZW50PgogICAgICAgICAgICAgICAgZGVjcnVuY2ggZWZmZWN0LCBhc3NlbWJsZXIgZnJhZ21lbnQgKGRvbid0IGNoYW5nZSBYLXJlZywgWS1yZWcKICAgICAgICAgICAgICAgIG9yIGNhcnJ5KSBvciAxIC0gMyBmb3IgZGlmZmVyZW50IGZhc3QgYm9yZGVyIGZsYXNoIGVmZmVjdHMKICAtbiAgICAgICAgICAgIG5vIGVmZmVjdCwgY2FuJ3QgYmUgY29tYmluZWQgd2l0aCAtWCBvciAteAoAICAtRDxzeW1ib2w+PTx2YWx1ZT4KICAgICAgICAgICAgICAgIHByZWRlZmluZXMgc3ltYm9scyBmb3IgdGhlIHNmeCBhc3NlbWJsZXIKICAtczxjdXN0b20gZW50ZXIgYXNzZW1ibGVyIGZyYWdtZW50PgogICAgICAgICAgICAgICAgYXNzZW1ibGVyIGZyYWdtZW50IHRvIGV4ZWN1dGUgd2hlbiB0aGUgZGVjcnVuY2hlciBzdGFydHMuCiAgICAgICAgICAgICAgICAoZG9uJ3QgY2hhbmdlIFktcmVnKQogIC1mPGN1c3RvbSBleGl0IGFzc2VtYmxlciBmcmFnbWVudD4KICAgICAgICAgICAgICAgIGFzc2VtYmxlciBmcmFnbWVudCBvIGV4ZWN1dGUgd2hlbiB0aGUgZGVjcnVuY2hlciBoYXMKICAgICAgICAgICAgICAgIGZpbmlzaGVkCgAgQWxsIGluZmlsZXMgYXJlIG1lcmdlZCBpbnRvIHRoZSBvdXRmaWxlLiBUaGV5IGFyZSBsb2FkZWQgaW4gdGhlIG9yZGVyCiB0aGV5IGFyZSBnaXZlbiBvbiB0aGUgY29tbWFuZC1saW5lLCBmcm9tIGxlZnQgdG8gcmlnaHQuCgBQcm9wYWdhdGluZyBmb3VuZCBydW4gYWRkcmVzcyAkJTA0WC4KAApFcnJvcjogbm90aGluZyBsb2FkZWQgYXQgdGhlIHN0YXJ0IG9mIGJhc2ljIHRleHQgYWRkcmVzcyAoJCUwNFgpLgoAV2FybmluZywgYmFzaWMgd2lsbCBwcm9iYWJseSBub3Qgd29yayBzaW5jZSB0aGUgdmFsdWUgb2YgdGhlIGxvY2F0aW9uIApwcmVjZWVkaW5nIHRoZSBiYXNpYyBzdGFydCAoJCUwNFgpIGlzIG5vdCAwIGJ1dCAlZC4KAHVzYWdlOiAlcyBtZW0gW29wdGlvbl0uLi4gaW5maWxlWyw8YWRkcmVzcz5dLi4uCiAgVGhlIG1lbSBjb21tYW5kIGdlbmVyYXRlcyBvdXRmaWxlcyB0aGF0IGFyZSBpbnRlbmRlZCB0byBiZSBkZWNydW5jaGVkIGZyb20KICBtZW1vcnkgYWZ0ZXIgYmVpbmcgbG9hZGVkIG9yIGFzc2VtYmxlZCB0aGVyZS4KACAgLWwgPGFkZHJlc3M+ICBhZGRzIGxvYWQgYWRkcmVzcyB0byB0aGUgb3V0ZmlsZSwgdXNpbmcgIm5vbmUiIGFzIDxhZGRyZXNzPgogICAgICAgICAgICAgICAgd2lsbCBza2lwIHRoZSBsb2FkIGFkZHJlc3MuCgAgIC1mICAgICAgICAgICAgY3J1bmNoIGZvcndhcmQKAG5vdCAAICBMaXRlcmFsIHNlcXVlbmNlcyBhcmUgJXN1c2VkACwgbGVuZ3RoIDEgc2VxdWVuY2VzIGFyZSAlc3VzZWQALAogIGxlbmd0aCAxMjMgbWlycm9ycyBhcmUgJXN1c2VkACwgbWF4IGxlbmd0aCB1c2VkIGlzICVkACBhbmQKICB0aGUgc2FmZXR5IG9mZnNldCBpcyAlZC4KAHVzYWdlOiAlcyBsZXZlbCBbb3B0aW9uXS4uLiBpbmZpbGVbLDxhZGRyZXNzPl0uLi4KICBUaGUgbGV2ZWwgY29tbWFuZCBnZW5lcmF0ZXMgb3V0ZmlsZXMgdGhhdCBhcmUgaW50ZW5kZWQgdG8gYmUgZGVjcnVuY2hlZCBvbgogIHRoZSBmbHkgd2hpbGUgYmVpbmcgcmVhZC4KACBBbGwgaW5maWxlcyBhcmUgY3J1bmNoZWQgc2VwYXJhdGVseSBhbmQgY29uY2F0ZW5hdGVkIGluIHRoZSBvdXRmaWxlIGluIHRoZQogb3JkZXIgdGhleSBhcmUgZ2l2ZW4gb24gdGhlIGNvbW1hbmQtbGluZS4KAGVuY29kaW5nICVkIHRvICUwLjFmIGJpdHMKAGdhbW1hIHByZWZpeCBjb2RlID0gJWQKAGZsYXQgcHJlZml4ICVkIGJpdHMKAGJhZCBsZW4KADAAaW1wb3J0aW5nIGVuY29kaW5nOiAlcwoAZ290IGJpdHMgJWQKAGltcG9ydGVkIGVuY29kaW5nOiAAbGVuczogICAgICAgICAgICAgAFtlb2xAJWRdCgBvZmZzZXRzIChsZW4gPTEpOiAAb2Zmc2V0cyAobGVuID0yKTogAG9mZnNldHMgKGxlbiA9Myk6IABvZmZzZXRzIChsZW4gPTgpOiAAbGVuIGNvdW50ZXIgd3JhcHBlZCEKAG9mZnNldDAgY291bnRlciB3cmFwcGVkIQoAb2Zmc2V0MSBjb3VudGVyIHdyYXBwZWQhCgBvZmZzZXQyIGNvdW50ZXIgd3JhcHBlZCEKAG9mZnNldDcgY291bnRlciB3cmFwcGVkIQoAb3B0aW1hbC5jAElOIHN0YXJ0ICVkLCBkZXB0aCAlZAoAaW50ZXJ2YWwgc2NvcmU6IFslZDw8JWRbJWQKAE9VVCBkZXB0aCAlZDogAGJpdHMgJWQsIGxvICVkLCBoaSAlZAoAb3V0cHV0dGluZyBuaWJibGUgJWQKAGJpdHN0cmVhbSBmbHVzaGVkIDB4JTAyWAoAYml0YnVmIDB4JTAyWCBhbGlnbmVkICVkCgBvdXRwdXQgYml0czogY291bnQgPSAlZCwgdmFsID0gJWQKAG91dHB1dCBnYW1tYTogY29kZSA9ICVkCgB3YgBDYW4ndCBvcGVuIGZpbGUgIiVzIiBmb3Igb3V0cHV0LgoAYWxsb2NhdGluZyBuZXcgY2h1bmsgJXAKAG91dCBvZiBtZW1vcnkgZXJyb3IgaW4gZmlsZSAlcywgbGluZSAlZAoAY2h1bmtwb29sLmMAcG9zICQlMDRYCgAtLS0tLS0tLS0tLS0KACBwYXNzICVkOiAAaW1wb3J0aW5nICVzCgBvcHRpbWl6aW5nIC4uCgBlcnJvcjogc2VhcmNoX2J1ZmZlcigpIHJldHVybmVkIE5VTEwKACAgc2l6ZSAlMC4xZiBiaXRzIH4lZCBieXRlcwoAIHBhc3MgJWQ6IG9wdGltaXppbmcgLi4KAApQaGFzZSAxOiBJbnN0cnVtZW50aW5nIGZpbGUKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KACBMZW5ndGggb2YgaW5kYXRhOiAlZCBieXRlcy4KACBJbnN0cnVtZW50aW5nIGZpbGUsIGRvbmUuCgAKUGhhc2UgMjogQ2FsY3VsYXRpbmcgZW5jb2RpbmcKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KACBDYWxjdWxhdGluZyBlbmNvZGluZywgZG9uZS4KAApQaGFzZSAzOiBHZW5lcmF0aW5nIG91dHB1dCBmaWxlCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoAIEVuYzogJXMKACBMZW5ndGggb2YgY3J1bmNoZWQgZGF0YTogJWQgYnl0ZXMuCgAgQ3J1bmNoZWQgZGF0YSByZWR1Y2VkICVkIGJ5dGVzICglMC4yZiUlKQoAIEVuY29kaW5nOiAlcwoALS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpFeG9taXplciB2My4wLjIgQ29weXJpZ2h0IChjKSAyMDAyLTIwMTkgTWFnbnVzIExpbmQuIChtYWdsaTE0M0BnbWFpbC5jb20pCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KAFRoaXMgc29mdHdhcmUgaXMgcHJvdmlkZWQgJ2FzLWlzJywgd2l0aG91dCBhbnkgZXhwcmVzcyBvciBpbXBsaWVkIHdhcnJhbnR5LgpJbiBubyBldmVudCB3aWxsIHRoZSBhdXRob3JzIGJlIGhlbGQgbGlhYmxlIGZvciBhbnkgZGFtYWdlcyBhcmlzaW5nIGZyb20KdGhlIHVzZSBvZiB0aGlzIHNvZnR3YXJlLgpQZXJtaXNzaW9uIGlzIGdyYW50ZWQgdG8gYW55b25lIHRvIHVzZSB0aGlzIHNvZnR3YXJlLCBhbHRlciBpdCBhbmQgcmUtCmRpc3RyaWJ1dGUgaXQgZnJlZWx5IGZvciBhbnkgbm9uLWNvbW1lcmNpYWwsIG5vbi1wcm9maXQgcHVycG9zZSBzdWJqZWN0IHRvCnRoZSBmb2xsb3dpbmcgcmVzdHJpY3Rpb25zOgoKACAgIDEuIFRoZSBvcmlnaW4gb2YgdGhpcyBzb2Z0d2FyZSBtdXN0IG5vdCBiZSBtaXNyZXByZXNlbnRlZDsgeW91IG11c3Qgbm90CiAgIGNsYWltIHRoYXQgeW91IHdyb3RlIHRoZSBvcmlnaW5hbCBzb2Z0d2FyZS4gSWYgeW91IHVzZSB0aGlzIHNvZnR3YXJlIGluIGEKICAgcHJvZHVjdCwgYW4gYWNrbm93bGVkZ21lbnQgaW4gdGhlIHByb2R1Y3QgZG9jdW1lbnRhdGlvbiB3b3VsZCBiZQogICBhcHByZWNpYXRlZCBidXQgaXMgbm90IHJlcXVpcmVkLgogICAyLiBBbHRlcmVkIHNvdXJjZSB2ZXJzaW9ucyBtdXN0IGJlIHBsYWlubHkgbWFya2VkIGFzIHN1Y2gsIGFuZCBtdXN0IG5vdAogICBiZSBtaXNyZXByZXNlbnRlZCBhcyBiZWluZyB0aGUgb3JpZ2luYWwgc29mdHdhcmUuCiAgIDMuIFRoaXMgbm90aWNlIG1heSBub3QgYmUgcmVtb3ZlZCBvciBhbHRlcmVkIGZyb20gYW55IGRpc3RyaWJ1dGlvbi4KACAgIDQuIFRoZSBuYW1lcyBvZiB0aGlzIHNvZnR3YXJlIGFuZC9vciBpdCdzIGNvcHlyaWdodCBob2xkZXJzIG1heSBub3QgYmUKICAgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dAogICBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KVGhlIGZpbGVzIHByb2Nlc3NlZCBhbmQvb3IgZ2VuZXJhdGVkIGJ5IHVzaW5nIHRoaXMgc29mdHdhcmUgYXJlIG5vdCBjb3ZlcmVkCm5vciBhZmZlY3RlZCBieSB0aGlzIGxpY2Vuc2UgaW4gYW55IHdheS4KACAgLW8gPG91dGZpbGU+ICBzZXRzIHRoZSBvdXRmaWxlIG5hbWUsIGRlZmF1bHQgaXMgIiVzIgoAICAtcSAgICAgICAgICAgIHF1aWV0IG1vZGUsIGRpc2FibGVzIGFsbCBkaXNwbGF5IG91dHB1dAogIC1CICAgICAgICAgICAgYnJpZWYgbW9kZSwgZGlzYWJsZXMgbW9zdCBkaXNwbGF5IG91dHB1dAogIC12ICAgICAgICAgICAgZGlzcGxheXMgdmVyc2lvbiBhbmQgdGhlIHVzYWdlIGxpY2Vuc2UKICAtLSAgICAgICAgICAgIHRyZWF0cyBhbGwgZm9sbG93aW5nIGFyZ3VtZW50cyBhcyBub24tb3B0aW9ucwogIC0/ICAgICAgICAgICAgZGlzcGxheXMgdGhpcyBoZWxwIHNjcmVlbgoAICAtYyAgICAgICAgICAgIGNvbXBhdGliaWxpdHkgbW9kZSwgZGlzYWJsZXMgdGhlIHVzZSBvZiBsaXRlcmFsIHNlcXVlbmNlcwogIC1DICAgICAgICAgICAgZmF2b3IgY29tcHJlc3Npb24gc3BlZWQgb3ZlciByYXRpbwogIC1lIDxlbmNvZGluZz4gdXNlcyB0aGUgZ2l2ZW4gZW5jb2RpbmcgZm9yIGNydW5jaGluZwogIC1FICAgICAgICAgICAgZG9uJ3Qgd3JpdGUgdGhlIGVuY29kaW5nIHRvIHRoZSBvdXRmaWxlCgAgIC1tIDxvZmZzZXQ+ICAgc2V0cyB0aGUgbWF4aW11bSBzZXF1ZW5jZSBvZmZzZXQsIGRlZmF1bHQgaXMgNjU1MzUKICAtTSA8bGVuZ3RoPiAgIHNldHMgdGhlIG1heGltdW0gc2VxdWVuY2UgbGVuZ3RoLCBkZWZhdWx0IGlzIDY1NTM1CiAgLXAgPHBhc3Nlcz4gICBsaW1pdHMgdGhlIG51bWJlciBvZiBvcHRpbWl6YXRpb24gcGFzc2VzLCBkZWZhdWx0IGlzIDY1NTM1CiAgLVQgPG9wdGlvbnM+ICBiaXRmaWVsZCB0aGF0IGNvbnRyb2xzIGJpdCBzdHJlYW0gdHJhaXRzLiBbMC03XQogIC1QIDxvcHRpb25zPiAgYml0ZmllbGQgdGhhdCBjb250cm9scyBiaXQgc3RyZWFtIGZvcm1hdC4gWzAtMzFdCgBlcnJvciwgaW52YWxpZCBvcHRpb24gIi0lYyIAIHdpdGggYXJndW1lbnQgIiVzIgBFcnJvcjogaW52YWxpZCBvZmZzZXQgZm9yIC1tIG9wdGlvbiwgbXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgWzAgLSA2NTUzNV0KAEVycm9yOiBpbnZhbGlkIG9mZnNldCBmb3IgLW4gb3B0aW9uLCBtdXN0IGJlIGluIHRoZSByYW5nZSBvZiBbMCAtIDY1NTM1XQoARXJyb3I6IGludmFsaWQgdmFsdWUgZm9yIC1wIG9wdGlvbiwgbXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgWzEgLSA2NTUzNV0KAEVycm9yOiBpbnZhbGlkIHZhbHVlIGZvciAtVCBvcHRpb24sIG11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIFswIC0gN10KAEVycm9yOiBpbnZhbGlkIHZhbHVlIGZvciAtUCBvcHRpb24sIG11c3QgYmUgaW4gdGhlIHJhbmdlIG9mIFswIC0gMzFdCgB1bmV4cGVjdGVkIGVuZCBvZiBpbnB1dCBkYXRhCgAlWABbJTAyWF0AWyVkXSBsaXRlcmFsICQlMDJYCgBbJWRdIGxpdGVyYWwgY29weSBsZW4gJWQKAFslZF0gc2VxdWVuY2Ugb2Zmc2V0ID0gJWQsIGxlbiA9ICVkCgBiaXRzIHJlYWQgZm9yIHRoaXMgaXRlcmF0aW9uICVkLCB0b3RhbCAlZC4KAHByb2dyZXNzaW5nXwBzdGFydCAlZCwgZW5kICVkLCBwZmFjdG9yICVmLCBwb2Zmc2V0ICVkCgAgICUqc10NIFsAJWMAU3RhcnRpbmcgcGFyc2UKAFN0YWNrIHNpemUgaW5jcmVhc2VkIHRvICVsdQoARW50ZXJpbmcgc3RhdGUgJWQKAFJlYWRpbmcgYSB0b2tlbjogAE5vdyBhdCBlbmQgb2YgaW5wdXQuCgAlcyAATmV4dCB0b2tlbiBpcwB0b2tlbgBudGVybQAlcyAlcyAoAFNoaWZ0aW5nAFJlZHVjaW5nIHN0YWNrIGJ5IHJ1bGUgJWQgKGxpbmUgJWx1KToKACAgICQlZCA9IAAtPiAkJCA9AFN0YWNrIG5vdwAgJWQAbGluZSAlZCwgJXMKAHN5bnRheCBlcnJvcgBFcnJvcjogcG9wcGluZwBtZW1vcnkgZXhoYXVzdGVkAENsZWFudXA6IGRpc2NhcmRpbmcgbG9va2FoZWFkAENsZWFudXA6IHBvcHBpbmcAc3ludGF4IGVycm9yLCB1bmV4cGVjdGVkICVzLCBleHBlY3RpbmcgJXMgb3IgJXMgb3IgJXMgb3IgJXMAc3ludGF4IGVycm9yLCB1bmV4cGVjdGVkICVzLCBleHBlY3RpbmcgJXMgb3IgJXMgb3IgJXMAc3ludGF4IGVycm9yLCB1bmV4cGVjdGVkICVzLCBleHBlY3RpbmcgJXMgb3IgJXMAc3ludGF4IGVycm9yLCB1bmV4cGVjdGVkICVzLCBleHBlY3RpbmcgJXMAc3ludGF4IGVycm9yLCB1bmV4cGVjdGVkICVzACRlbmQAZXJyb3IAJHVuZGVmaW5lZABJTkNMVURFAElGAERFRklORUQATUFDUk8ATUFDUk9fU1RSSU5HAE9SRwBFUlJPUgBFQ0hPMQBJTkNCSU4ASU5DTEVOAElOQ1dPUkQAUkVTAFdPUkQAQllURQBMREEATERYAExEWQBTVEEAU1RYAFNUWQBBTkQAT1JBAEVPUgBBREMAU0JDAENNUABDUFgAQ1BZAFRTWABUWFMAUEhBAFBMQQBQSFAAUExQAFNFSQBDTEkATk9QAFRZQQBUQVkAVFhBAFRBWABDTEMAU0VDAFJUUwBDTFYAQ0xEAFNFRABKU1IASk1QAEJFUQBCTkUAQkNDAEJDUwBCUEwAQk1JAEJWQwBCVlMASU5YAERFWABJTlkAREVZAElOQwBERUMATFNSAEFTTABST1IAUk9MAEJJVABTWU1CT0wAU1RSSU5HAExBTkQATE9SAExOT1QATFBBUkVOAFJQQVJFTgBDT01NQQBDT0xPTgBYAFkASEFTSABQTFVTAE1JTlVTAE1VTFQARElWAE1PRABMVABHVABFUQBORVEAQVNTSUdOAEdVRVNTAE5VTUJFUgB2TkVHAExBQkVMACRhY2NlcHQAc3RtdHMAc3RtdABhdG9tAGV4cHJzAG9wAGFtX2ltAGFtX2EAYW1fYXgAYW1fYXkAYW1fenAAYW1fenB4AGFtX3pweQBhbV9peABhbV9peQBleHByAGxleHByAG91dCBvZiBkeW5hbWljIG1lbW9yeSBpbiB5eWVuc3VyZV9idWZmZXJfc3RhY2soKQBvdXQgb2YgbWVtb3J5IGV4cGFuZGluZyBzdGFydC1jb25kaXRpb24gc3RhY2sAc3RhcnQtY29uZGl0aW9uIHN0YWNrIHVuZGVyZmxvdwB1bmtub3duIGNoYXJhY3RlciBmb3VuZCAlcwoAZmF0YWwgZmxleCBzY2FubmVyIGludGVybmFsIGVycm9yLS1ubyBhY3Rpb24gZm91bmQAZmF0YWwgZmxleCBzY2FubmVyIGludGVybmFsIGVycm9yLS1lbmQgb2YgYnVmZmVyIG1pc3NlZABmYXRhbCBlcnJvciAtIHNjYW5uZXIgaW5wdXQgYnVmZmVyIG92ZXJmbG93AGlucHV0IGluIGZsZXggc2Nhbm5lciBmYWlsZWQAb3V0IG9mIGR5bmFtaWMgbWVtb3J5IGluIHl5X2dldF9uZXh0X2J1ZmZlcigpAG91dCBvZiBkeW5hbWljIG1lbW9yeSBpbiB5eV9jcmVhdGVfYnVmZmVyKCkAb3V0IG9mIGR5bmFtaWMgbWVtb3J5IGluIHl5X3NjYW5fYnVmZmVyKCkAb3V0IG9mIGR5bmFtaWMgbWVtb3J5IGluIHl5X3NjYW5fYnl0ZXMoKQBiYWQgYnVmZmVyIGluIHl5X3NjYW5fYnl0ZXMoKQBzb3VyY2UgYnVmZmVycyBuZXN0ZWQgdG9vIGRlZXAKAG5vdCBhbGxvd2VkIHRvIHJlZGVmaW5lIHN5bWJvbCAlcwoAc3ltYm9sICVzIG5vdCBmb3VuZAAlcwoAQ2FuJ3QgcmVhZCB3b3JkIGZyb20gb2Zmc2V0ICVkIGluIGZpbGUgIiVzIi4KAHJlc29sdmVfZXhwcjogAGJpbmFyeSBvcCAlZAoAdW5zdXBwb3J0ZWQgb3AgJWQKAHNldHRpbmcgLm9yZyB0byA/Pz8KAGFwcGVuZGluZyA+PiVzPDwgdG8gbWFjcm8KAHJlc29sdmluZyBpZiBleHByZXNzaW9uCgBpZiBleHByIHJlc29sdmVkIHRvICVkCgBp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JWQuCgByYgAgY2FuJ3Qgb3BlbiBmaWxlICIlcyIgZm9yIGlucHV0CgAgY2FuJ3QgcGFyc2UgbG9hZCBhZGRyZXNzIGZyb20gIiVzIgoAIGNhbid0IHBhcnNlIG9mZnNldCBmcm9tICIlcyIKACBjYW4ndCBwYXJzZSBsZW5ndGggZnJvbSAiJXMiCgAlcy5pbmYAJSpzICV4ICV4AEVycm9yOiBGYWlsZWQgdG8gcGFyc2UgQkJDSW0vQkJDWGZlciBpbmYgZnJvbSAiJXMiLgBCQkMgaW5mOiBsb2FkICUwNlgsIHJ1biAlMDZYLgBFcnJvcjogZmFpbGVkIHRvIHJlYWQgZnJvbSBmaWxlLgoARXJyb3I6IGNhbid0IHNlZWsgdG8gZmlsZSBzdGFydC4KAEVycm9yOiBmYWlsZWQgdG8gcmVhZCBBdGFyaSBYRVggaGVhZGVyIGZyb20gZmlsZS4KAEVycm9yOiBub3QgYSB2YWxpZCBBdGFyaSB4ZXgtaGVhZGVyLgBFcnJvcjogdW5leHBlY3RlZCBlbmQgb2YgZmlsZS4ARXJyb3I6IGNvcnJ1cHQgZGF0YSBpbiB4ZXgtZmlsZS4ARm91bmQgeGV4IGluaXRhZCAkJTA0WC4KAEZvdW5kIHhleCBydW5hZCAkJTA0WC4KAEVycm9yOiB1bmV4cGVjdGVkIGVuZCBvZiB4ZXgtZmlsZS4KACB4ZXggY2h1bmsgbG9hZGluZyBmcm9tICQlMDRYIHRvICQlMDRYCgBFcnJvcjogZmFpbGVkIHRvIHJlYWQgT3JpYyBUQVAgaGVhZGVyIGZyb20gZmlsZS4KAEVycm9yOiBub3QgYSB2YWxpZCBPcmljIHRhcC1oZWFkZXIuAEVycm9yOiBiYWQgc3luYyBieXRlIGFmdGVyIGxlYWQtaW4gaW4gT3JpYyB0YXAtZmlsZSBoZWFkZXIsIGdvdCAkJTAyWCBidXQgZXhwZWN0ZWQgJDI0CgBXYXJuaW5nOiBPcmljIHRhcC1maWxlIGNvbnRhaW5zICVkIGJ5dGUocykgZGF0YSBsZXNzIHRoYW4gZXhwZWN0ZWQuCgAgT3JpYyB0YXAtZmlsZSBsb2FkaW5nIGZyb20gJCUwNFggdG8gJCUwNFgKAEVycm9yOiBmYWlsZWQgdG8gcmVhZCBhcHBsZXNpbmdsZSBoZWFkZXIgZnJvbSBmaWxlLgoARXJyb3I6IG5vdCBhIHZhbGlkIEFwcGxlU2luZ2xlLWhlYWRlci4ARXJyb3I6IHVuZXhwZWN0ZWQgZW5kIG9mIEFwcGxlU2luZ2xlIGZpbGUuAEVycm9yOiBkdXBsaWNhdGUgZGVzY3JpcHRvciBmb3IgaWQgJWQKLgBFcnJvcjogdW5hYmxlIHRvIGZpbmQgZGVzY3IgMTEgaW4gQXBwbGVTaW5nbGUgZmlsZQouAEVycm9yOiB1bmFibGUgdG8gZmluZCBkZXNjciAxIGluIEFwcGxlU2luZ2xlIGZpbGUKLgBFcnJvcjogaW52YWxpZCBsZW5ndGggb2YgcHJvZG9zIGVudHJ5ICVkLgoARXJyb3I6IGZhaWxlZCB0byBzZWVrIHRvIHByb2RvcyBlbnRyeSBhdCBvZmZzZXQgJWQuCgBFcnJvcjogdW5zdXBwb3J0ZWQgdmFsdWUgJCVYIGZvciBQUk9ET1MgZmlsZXR5cGUuCgBFcnJvcjogdW5leHBlY3RlZCB2YWx1ZSAkJVggZm9yIFBST0RPUyBhdXggZmlsZXR5cGUuCgBFcnJvcjogZmFpbGVkIHRvIHNlZWsgdG8gZGF0YSBlbnRyeSBhdCBvZmZzZXQgJWQuCgBFcnJvcjogTm8gbG9hZCBhZGRyZXNzIGdpdmVuIGZvciByYXcgZmlsZSAiJXMiLgoARXJyb3I6IHVua25vd24gZmlsZSB0eXBlIGZvciBmaWxlICIlcyIuCgAgUmVhZGluZyAiJXMiLCBsb2FkaW5nIGZyb20gJCUwNFggdG8gJCUwNFguCgBFcnJvcjogTm8gbG9hZCBhZGRyZXNzIGdpdmVuIGZvciByYXcgZmlsZS4ARXJyb3I6IGNhbid0IHNlZWsgdG8gRU9GLgoARXJyb3I6IG9mZnNldCAlZCAoJWQpIG91dCBvZiByYW5nZS4KAEVycm9yOiBzZWVrIHRvIG9mZnNldCAlZCAoJWQpIGZhaWxlZC4KAEVycm9yOiBsZW5ndGggJWQgKCVkKSBvdXQgb2YgcmFuZ2UuCgAuZXhlAC5FWEUAZmF0YWwgZXJyb3IsIGNhbid0IGFsbG9jYXRlIG1lbW9yeSBmb3IgbG9nIGNvbnRleHQKAGZhdGFsIGVycm9yLCBjYW4ndCBhbGxvY2F0ZSBtZW1vcnkgZm9yIGxvZyBvdXRwdXQKAGZhdGFsIGVycm9yLCBjYW4ndCBhbGxvY2F0ZSBtZW1vcnkgZm9yIGxvZyBsb2cKAGVycm9yLCBjYW4ndCByZWFsbG9jYXRlIG1lbW9yeQoAAAECBAcDBgUALSsgICAwWDB4AChudWxsKQAtMFgrMFggMFgtMHgrMHggMHgAaW5mAElORgBOQU4ALgBpbmZpbml0eQBuYW4Acndh';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary() {
  try {
    if (Module['wasmBinary']) {
      return new Uint8Array(Module['wasmBinary']);
    }
    var binary = tryParseAsDataURI(wasmBinaryFile);
    if (binary) {
      return binary;
    }
    if (Module['readBinary']) {
      return Module['readBinary'](wasmBinaryFile);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // if we don't have the binary yet, and have the Fetch api, use that
  // in some environments, like Electron's render process, Fetch api may be present, but have a different context than expected, let's only use it on the Web
  if (!Module['wasmBinary'] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function') {
    return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
      if (!response['ok']) {
        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
      }
      return response['arrayBuffer']();
    }).catch(function () {
      return getBinary();
    });
  }
  // Otherwise, getBinary should be able to get it synchronously
  return new Promise(function(resolve, reject) {
    resolve(getBinary());
  });
}



// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm(env) {

  // prepare imports
  var info = {
    'env': env
    ,
    'global': {
      'NaN': NaN,
      'Infinity': Infinity
    },
    'global.Math': Math,
    'asm2wasm': asm2wasmImports
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    removeRunDependency('wasm-instantiate');
  }
  addRunDependency('wasm-instantiate');


  // Async compilation can be confusing when an error on the page overwrites Module
  // (for example, if the order of elements is wrong, and the one defining Module is
  // later), so we save Module and check it later.
  var trueModule = Module;
  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    assert(Module === trueModule, 'the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?');
    trueModule = null;
      // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
      // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output['instance']);
  }


  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);
      abort(reason);
    });
  }

  // Prefer streaming instantiation if available.
  function instantiateAsync() {
    if (!Module['wasmBinary'] &&
        typeof WebAssembly.instantiateStreaming === 'function' &&
        !isDataURI(wasmBinaryFile) &&
        typeof fetch === 'function') {
      fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        return WebAssembly.instantiateStreaming(response, info)
          .then(receiveInstantiatedSource, function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            instantiateArrayBuffer(receiveInstantiatedSource);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiatedSource);
    }
  }
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      return Module['instantiateWasm'](info, receiveInstance);
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  instantiateAsync();
  return {}; // no exports yet; we'll fill them in later
}

// Provide an "asm.js function" for the application, called to "link" the asm.js module. We instantiate
// the wasm module at that time, and it receives imports and provides exports and so forth, the app
// doesn't need to care that it is wasm or asm.js.

Module['asm'] = function(global, env, providedBuffer) {
  // memory was already allocated (so js could use the buffer)
  env['memory'] = wasmMemory
  ;
  // import table
  env['table'] = wasmTable = new WebAssembly.Table({
    'initial': 1280,
    'maximum': 1280,
    'element': 'anyfunc'
  });
  // With the wasm backend __memory_base and __table_base and only needed for
  // relocatable output.
  env['__memory_base'] = 1024; // tell the memory segments where to place themselves
  // table starts at 0 by default (even in dynamic linking, for the main module)
  env['__table_base'] = 0;

  var exports = createWasm(env);
  assert(exports, 'binaryen setup failed (no wasm support?)');
  return exports;
};

// === Body ===

var ASM_CONSTS = [];





// STATICTOP = STATIC_BASE + 4504416;
/* global initializers */ /*__ATINIT__.push();*/








/* no memory initializer */
var tempDoublePtr = 4505424
assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}

function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}

// {{PRE_LIBRARY}}


  function ___lock() {}

  
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      }};
  
  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      else err('failed to set errno from JS');
      return value;
    }
  
  var PATH_FS={resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(19);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function (stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(6);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(5);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(11);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(6);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(5);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = new Buffer(BUFSIZE);
              var bytesRead = 0;
  
              var isPosixPlatform = (process.platform != 'win32'); // Node doesn't offer a direct check, so test by exclusion
  
              var fd = process.stdin.fd;
              if (isPosixPlatform) {
                // Linux and Mac cannot use process.stdin.fd (which isn't set up as sync)
                var usingDevice = false;
                try {
                  fd = fs.openSync('/dev/stdin', 'r');
                  usingDevice = true;
                } catch (e) {}
              }
  
              try {
                bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
              } catch(e) {
                // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
                // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
                if (e.toString().indexOf('EOF') != -1) bytesRead = 0;
                else throw e;
              }
  
              if (usingDevice) { fs.closeSync(fd); }
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
            } else
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(1);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
        return;
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[2];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(39);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(39);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(22);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          // If memory can grow, we don't want to hold on to references of
          // the memory Buffer, as they may get invalidated. That means
          // we need to do a copy here.
          // FIXME: this is inefficient as the file packager may have
          //        copied the data into memory already - we may want to
          //        integrate more there and let the file packager loading
          //        code be able to query if memory growth is on or off.
          if (canOwn) {
            warnOnce('file packager has copied file data into memory, but in memory growth we are forced to copy it again (see --no-heap-copy)');
          }
          canOwn = false;
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(22);
          }
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(19);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(12);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function (stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(19);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        if (!req) {
          return callback("Unable to connect to IndexedDB");
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          if (!fileStore.indexNames.contains('timestamp')) {
            fileStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          try {
            var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
            transaction.onerror = function(e) {
              callback(this.error);
              e.preventDefault();
            };
  
            var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
            var index = store.index('timestamp');
  
            index.openKeyCursor().onsuccess = function(event) {
              var cursor = event.target.result;
  
              if (!cursor) {
                return callback(null, { type: 'remote', db: db, entries: entries });
              }
  
              entries[cursor.primaryKey] = { timestamp: cursor.key };
  
              cursor.continue();
            };
          } catch (e) {
            return callback(e);
          }
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function(e) {
          done(this.error);
          e.preventDefault();
        };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
        var flags = process["binding"]("constants");
        // Node.js 4 compatibility: it has no namespaces for constants
        if (flags["fs"]) {
          flags = flags["fs"];
        }
        NODEFS.flagsForNodeMap = {
          "1024": flags["O_APPEND"],
          "64": flags["O_CREAT"],
          "128": flags["O_EXCL"],
          "0": flags["O_RDONLY"],
          "2": flags["O_RDWR"],
          "4096": flags["O_SYNC"],
          "512": flags["O_TRUNC"],
          "1": flags["O_WRONLY"]
        };
      },bufferFrom:function (arrayBuffer) {
        // Node.js < 4.5 compatibility: Buffer.from does not support ArrayBuffer
        // Buffer.from before 4.5 was just a method inherited from Uint8Array
        // Buffer.alloc has been added with Buffer.from together, so check it instead
        return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer);
      },mount:function (mount) {
        assert(ENVIRONMENT_HAS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(22);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // Node.js on Windows never represents permission bit 'x', so
            // propagate read bits to execute bits
            stat.mode = stat.mode | ((stat.mode & 292) >> 2);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(-e.errno); // syscall errnos are negated, node's are not
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsForNode:function (flags) {
        flags &= ~0x200000 /*O_PATH*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
        flags &= ~0x800 /*O_NONBLOCK*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
        flags &= ~0x8000 /*O_LARGEFILE*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
        flags &= ~0x80000 /*O_CLOEXEC*/; // Some applications may pass it; it makes no sense for a single process.
        var newFlags = 0;
        for (var k in NODEFS.flagsForNodeMap) {
          if (flags & k) {
            newFlags |= NODEFS.flagsForNodeMap[k];
            flags ^= k;
          }
        }
  
        if (!flags) {
          return newFlags;
        } else {
          throw new FS.ErrnoError(22);
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            path = fs.readlinkSync(path);
            path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
            return path;
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(-e.errno);
          }
        },read:function (stream, buffer, offset, length, position) {
          // Node.js < 6 compatibility: node errors on 0 length reads
          if (length === 0) return 0;
          try {
            return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
          } catch (e) {
            throw new FS.ErrnoError(-e.errno);
          }
        },write:function (stream, buffer, offset, length, position) {
          try {
            return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
          } catch (e) {
            throw new FS.ErrnoError(-e.errno);
          }
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(-e.errno);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(22);
          }
  
          return position;
        }}};
  
  var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:function (mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
        var root = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0);
        var createdParents = {};
        function ensureParent(path) {
          // return the parent node, creating subdirs as necessary
          var parts = path.split('/');
          var parent = root;
          for (var i = 0; i < parts.length-1; i++) {
            var curr = parts.slice(0, i+1).join('/');
            // Issue 4254: Using curr as a node name will prevent the node
            // from being found in FS.nameTable when FS.open is called on
            // a path which holds a child of this node,
            // given that all FS functions assume node names
            // are just their corresponding parts within their given path,
            // rather than incremental aggregates which include their parent's
            // directories.
            if (!createdParents[curr]) {
              createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
            }
            parent = createdParents[curr];
          }
          return parent;
        }
        function base(path) {
          var parts = path.split('/');
          return parts[parts.length-1];
        }
        // We also accept FileList here, by using Array.prototype
        Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
          WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
        });
        (mount.opts["blobs"] || []).forEach(function(obj) {
          WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
        });
        (mount.opts["packages"] || []).forEach(function(pack) {
          pack['metadata'].files.forEach(function(file) {
            var name = file.filename.substr(1); // remove initial slash
            WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack['blob'].slice(file.start, file.end));
          });
        });
        return root;
      },createNode:function (parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
          node.size = contents.size;
          node.contents = contents;
        } else {
          node.size = 4096;
          node.contents = {};
        }
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          return {
            dev: 1,
            ino: undefined,
            mode: node.mode,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: undefined,
            size: node.size,
            atime: new Date(node.timestamp),
            mtime: new Date(node.timestamp),
            ctime: new Date(node.timestamp),
            blksize: 4096,
            blocks: Math.ceil(node.size / 4096),
          };
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(2);
        },mknod:function (parent, name, mode, dev) {
          throw new FS.ErrnoError(1);
        },rename:function (oldNode, newDir, newName) {
          throw new FS.ErrnoError(1);
        },unlink:function (parent, name) {
          throw new FS.ErrnoError(1);
        },rmdir:function (parent, name) {
          throw new FS.ErrnoError(1);
        },readdir:function (node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newName, oldPath) {
          throw new FS.ErrnoError(1);
        },readlink:function (node) {
          throw new FS.ErrnoError(1);
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          if (position >= stream.node.size) return 0;
          var chunk = stream.node.contents.slice(position, position + length);
          var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
          buffer.set(new Uint8Array(ab), offset);
          return chunk.size;
        },write:function (stream, buffer, offset, length, position) {
          throw new FS.ErrnoError(5);
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.size;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(22);
          }
          return position;
        }}};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH_FS.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(40);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(40);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); }
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); }
            }
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return 13;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return 13;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return 13;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return 13;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return 17;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 20;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 16;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 21;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return 2;
        }
        if (FS.isLink(node.mode)) {
          return 40;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 21;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(24);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(29);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          console.log('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(err) {
          assert(FS.syncFSRequests > 0);
          FS.syncFSRequests--;
          return callback(err);
        }
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(16);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(16);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(20);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(22);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(22);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(1);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:function (path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 17) throw e;
          }
        }
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(2);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(2);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(1);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(16);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(2);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(18);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(22);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(39);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(1);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(16);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(1);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(16);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(20);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(1);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(16);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(2);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(22);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(2);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(1);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(1);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(9);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(1);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(9);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(22);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(1);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(21);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(22);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(9);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(22);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(2);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(17);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(2);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(20);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            console.log("FS.trackingDelegate error on read file: " + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(9);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:function (stream) {
        return stream.fd === null;
      },llseek:function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(9);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(29);
        }
        if (whence != 0 /* SEEK_SET */ && whence != 1 /* SEEK_CUR */ && whence != 2 /* SEEK_END */) {
          throw new FS.ErrnoError(22);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(22);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(9);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(9);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(21);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(22);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(29);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(22);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(9);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(9);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(21);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(22);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position !== 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(29);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+stream.path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(9);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(22);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(9);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(19);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(95);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(13);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(13);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(19);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },msync:function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:function (stream) {
        return 0;
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(25);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data === 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(2);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(20);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function(stream, buffer, offset, length, pos) { return length; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else
        if (ENVIRONMENT_IS_NODE) {
          // for nodejs with or without crypto support included
          try {
            var crypto_module = require('crypto');
            // nodejs has crypto support
            random_device = function() { return crypto_module['randomBytes'](1)[0]; };
          } catch (e) {
            // nodejs doesn't have crypto support
          }
        } else
        {}
        if (!random_device) {
          // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
          random_device = function() { abort("no cryptographic support found for random_device. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };"); };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:function () {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: function() {
            var node = FS.createNode('/proc/self', 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: function(parent, name) {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(9);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: function() { return stream.path } }
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        var stdout = FS.open('/dev/stdout', 'w');
        var stderr = FS.open('/dev/stderr', 'w');
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          // Node.js compatibility: assigning on this.stack fails on Node 4 (but fixed on Node 8)
          if (this.stack) Object.defineProperty(this, "stack", { value: (new Error).stack, writable: true });
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [2].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
          'IDBFS': IDBFS,
          'NODEFS': NODEFS,
          'WORKERFS': WORKERFS,
        };
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        var fflush = Module['_fflush'];
        if (fflush) fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH_FS.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(5);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(11);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(5);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(5);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: function() {
                if(!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: function() {
                if(!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(5);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(5);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init(); // XXX perhaps this method should move onto Browser?
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:function (dirfd, path) {
        if (path[0] !== '/') {
          // relative path
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(9);
            dir = dirstream.path;
          }
          path = PATH.join2(dir, path);
        }
        return path;
      },doStat:function (func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -20;
          }
          throw e;
        }
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode;
        HEAP32[(((buf)+(16))>>2)]=stat.nlink;
        HEAP32[(((buf)+(20))>>2)]=stat.uid;
        HEAP32[(((buf)+(24))>>2)]=stat.gid;
        HEAP32[(((buf)+(28))>>2)]=stat.rdev;
        HEAP32[(((buf)+(32))>>2)]=0;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)]=tempI64[0],HEAP32[(((buf)+(44))>>2)]=tempI64[1]);
        HEAP32[(((buf)+(48))>>2)]=4096;
        HEAP32[(((buf)+(52))>>2)]=stat.blocks;
        HEAP32[(((buf)+(56))>>2)]=(stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)]=0;
        HEAP32[(((buf)+(64))>>2)]=(stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)]=0;
        HEAP32[(((buf)+(72))>>2)]=(stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(76))>>2)]=0;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(80))>>2)]=tempI64[0],HEAP32[(((buf)+(84))>>2)]=tempI64[1]);
        return 0;
      },doMsync:function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags);
      },doMkdir:function (path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function (path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -22;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function (path, buf, bufsize) {
        if (bufsize <= 0) return -22;
        var ret = FS.readlink(path);
  
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf+len];
        stringToUTF8(ret, buf, bufsize+1);
        // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
        // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
        HEAP8[buf+len] = endChar;
  
        return len;
      },doAccess:function (path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -22;
        }
        var node;
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -13;
        }
        return 0;
      },doDup:function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = UTF8ToString(SYSCALLS.get());
        return ret;
      },getStreamFromFD:function () {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream) throw new FS.ErrnoError(9);
        return stream;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      var HIGH_OFFSET = 0x100000000; // 2^32
      // use an unsigned operator on low and shift high by 32-bits
      var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  
      var DOUBLE_LIMIT = 0x20000000000000; // 2^53
      // we also check for equality since DOUBLE_LIMIT + 1 == DOUBLE_LIMIT
      if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
        return -75;
      }
  
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((result)>>2)]=tempI64[0],HEAP32[(((result)+(4))>>2)]=tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall145(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // readv
      var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      return SYSCALLS.doReadv(stream, iov, iovcnt);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      return SYSCALLS.doWritev(stream, iov, iovcnt);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall221(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // fcntl64
      var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -22;
          }
          var newStream;
          newStream = FS.open(stream.path, stream.flags, 0, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 12:
        /* case 12: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
          
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)]=2;
          return 0;
        }
        case 13:
        case 14:
        /* case 13: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 14: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
          
          
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -22; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
          ___setErrNo(22);
          return -1;
        default: {
          return -22;
        }
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall5(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // open
      var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get() // optional TODO
      var stream = FS.open(pathname, flags, mode);
      return stream.fd;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
      switch (op) {
        case 21509:
        case 21505: {
          if (!stream.tty) return -25;
          return 0;
        }
        case 21510:
        case 21511:
        case 21512:
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -25;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -25;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)]=0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -25;
          return -22; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -25;
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -25;
          return 0;
        }
        default: abort('bad ioctl syscall ' + op);
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___unlock() {}

  function _emscripten_get_heap_size() {
      return HEAP8.length;
    }

  function _exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      exit(status);
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
    }
  
   

   

   

  
  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('Cannot enlarge memory arrays to size ' + requestedSize + ' bytes (OOM). Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + HEAP8.length + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
    }
  
  function emscripten_realloc_buffer(size) {
      var PAGE_MULTIPLE = 65536;
      size = alignUp(size, PAGE_MULTIPLE); // round up to wasm page size
      var oldSize = buffer.byteLength;
      // native wasm support
      // note that this is *not* threadsafe. multiple threads can call .grow(), and each
      // presents a delta, so in theory we may over-allocate here (e.g. if two threads
      // ask to grow from 256MB to 512MB, we get 2 requests to add +256MB, and may end
      // up growing to 768MB (even though we may have been able to make do with 512MB).
      // TODO: consider decreasing the step sizes in emscripten_resize_heap
      try {
        var result = wasmMemory.grow((size - oldSize) / 65536); // .grow() takes a delta compared to the previous size
        if (result !== (-1 | 0)) {
          // success in native wasm memory growth, get the buffer from the memory
          buffer = wasmMemory.buffer;
          return true;
        } else {
          return false;
        }
      } catch(e) {
        console.error('emscripten_realloc_buffer: Attempted to grow from ' + oldSize  + ' bytes to ' + size + ' bytes, but got error: ' + e);
        return false;
      }
    }function _emscripten_resize_heap(requestedSize) {
      var oldSize = _emscripten_get_heap_size();
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
      assert(requestedSize > oldSize);
  
  
      var PAGE_MULTIPLE = 65536;
      var LIMIT = 2147483648 - PAGE_MULTIPLE; // We can do one page short of 2GB as theoretical maximum.
  
      if (requestedSize > LIMIT) {
        err('Cannot enlarge memory, asked to go up to ' + requestedSize + ' bytes, but the limit is ' + LIMIT + ' bytes!');
        return false;
      }
  
      var MIN_TOTAL_MEMORY = 16777216;
      var newSize = Math.max(oldSize, MIN_TOTAL_MEMORY); // So the loop below will not be infinite, and minimum asm.js memory size is 16MB.
  
      // TODO: see realloc_buffer - for PTHREADS we may want to decrease these jumps
      while (newSize < requestedSize) { // Keep incrementing the heap size as long as it's less than what is requested.
        if (newSize <= 536870912) {
          newSize = alignUp(2 * newSize, PAGE_MULTIPLE); // Simple heuristic: double until 1GB...
        } else {
          // ..., but after that, add smaller increments towards 2GB, which we cannot reach
          newSize = Math.min(alignUp((3 * newSize + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
        }
  
        if (newSize === oldSize) {
          warnOnce('Cannot ask for more memory since we reached the practical limit in browsers (which is just below 2GB), so the request would have failed. Requesting only ' + HEAP8.length);
        }
      }
  
  
      var start = Date.now();
  
      if (!emscripten_realloc_buffer(newSize)) {
        err('Failed to grow the heap from ' + oldSize + ' bytes to ' + newSize + ' bytes, not enough memory!');
        return false;
      }
  
      updateGlobalBufferViews();
  
  
  
      return true;
    } 

FS.staticInit();Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;;
if (ENVIRONMENT_HAS_NODE) { var fs = require("fs"); var NODEJS_PATH = require("path"); NODEFS.staticInit(); };
var ASSERTIONS = true;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {String} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


// ASM_LIBRARY EXTERN PRIMITIVES: Int8Array,Int32Array


function nullFunc_fiii(x) { err("Invalid function pointer called with signature 'fiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_fiiii(x) { err("Invalid function pointer called with signature 'fiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_ii(x) { err("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iidiiii(x) { err("Invalid function pointer called with signature 'iidiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iii(x) { err("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiii(x) { err("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_jiji(x) { err("Invalid function pointer called with signature 'jiji'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vi(x) { err("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vii(x) { err("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viii(x) { err("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  err("Build with ASSERTIONS=2 for more info.");abort(x) }

var asmGlobalArg = {}

var asmLibraryArg = {
  "abort": abort,
  "setTempRet0": setTempRet0,
  "getTempRet0": getTempRet0,
  "abortStackOverflow": abortStackOverflow,
  "nullFunc_fiii": nullFunc_fiii,
  "nullFunc_fiiii": nullFunc_fiiii,
  "nullFunc_ii": nullFunc_ii,
  "nullFunc_iidiiii": nullFunc_iidiiii,
  "nullFunc_iii": nullFunc_iii,
  "nullFunc_iiii": nullFunc_iiii,
  "nullFunc_jiji": nullFunc_jiji,
  "nullFunc_vi": nullFunc_vi,
  "nullFunc_vii": nullFunc_vii,
  "nullFunc_viii": nullFunc_viii,
  "___lock": ___lock,
  "___setErrNo": ___setErrNo,
  "___syscall140": ___syscall140,
  "___syscall145": ___syscall145,
  "___syscall146": ___syscall146,
  "___syscall221": ___syscall221,
  "___syscall5": ___syscall5,
  "___syscall54": ___syscall54,
  "___syscall6": ___syscall6,
  "___unlock": ___unlock,
  "_emscripten_get_heap_size": _emscripten_get_heap_size,
  "_emscripten_memcpy_big": _emscripten_memcpy_big,
  "_emscripten_resize_heap": _emscripten_resize_heap,
  "_exit": _exit,
  "abortOnCannotGrowMemory": abortOnCannotGrowMemory,
  "emscripten_realloc_buffer": emscripten_realloc_buffer,
  "tempDoublePtr": tempDoublePtr,
  "DYNAMICTOP_PTR": DYNAMICTOP_PTR
}
// EMSCRIPTEN_START_ASM
var asm =Module["asm"]// EMSCRIPTEN_END_ASM
(asmGlobalArg, asmLibraryArg, buffer);

var real____errno_location = asm["___errno_location"];
asm["___errno_location"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real____errno_location.apply(null, arguments);
};

var real__fflush = asm["_fflush"];
asm["_fflush"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__fflush.apply(null, arguments);
};

var real__free = asm["_free"];
asm["_free"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__free.apply(null, arguments);
};

var real__main = asm["_main"];
asm["_main"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__main.apply(null, arguments);
};

var real__malloc = asm["_malloc"];
asm["_malloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__malloc.apply(null, arguments);
};

var real__memmove = asm["_memmove"];
asm["_memmove"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__memmove.apply(null, arguments);
};

var real__sbrk = asm["_sbrk"];
asm["_sbrk"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real__sbrk.apply(null, arguments);
};

var real_establishStackSpace = asm["establishStackSpace"];
asm["establishStackSpace"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_establishStackSpace.apply(null, arguments);
};

var real_stackAlloc = asm["stackAlloc"];
asm["stackAlloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackAlloc.apply(null, arguments);
};

var real_stackRestore = asm["stackRestore"];
asm["stackRestore"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackRestore.apply(null, arguments);
};

var real_stackSave = asm["stackSave"];
asm["stackSave"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return real_stackSave.apply(null, arguments);
};
Module["asm"] = asm;
var ___errno_location = Module["___errno_location"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["___errno_location"].apply(null, arguments)
};

var _emscripten_replace_memory = Module["_emscripten_replace_memory"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_emscripten_replace_memory"].apply(null, arguments)
};

var _fflush = Module["_fflush"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_fflush"].apply(null, arguments)
};

var _free = Module["_free"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_free"].apply(null, arguments)
};

var _main = Module["_main"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_main"].apply(null, arguments)
};

var _malloc = Module["_malloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_malloc"].apply(null, arguments)
};

var _memcpy = Module["_memcpy"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_memcpy"].apply(null, arguments)
};

var _memmove = Module["_memmove"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_memmove"].apply(null, arguments)
};

var _memset = Module["_memset"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_memset"].apply(null, arguments)
};

var _sbrk = Module["_sbrk"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["_sbrk"].apply(null, arguments)
};

var establishStackSpace = Module["establishStackSpace"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["establishStackSpace"].apply(null, arguments)
};

var stackAlloc = Module["stackAlloc"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["stackAlloc"].apply(null, arguments)
};

var stackRestore = Module["stackRestore"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["stackRestore"].apply(null, arguments)
};

var stackSave = Module["stackSave"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["stackSave"].apply(null, arguments)
};

var dynCall_fiii = Module["dynCall_fiii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_fiii"].apply(null, arguments)
};

var dynCall_fiiii = Module["dynCall_fiiii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_fiiii"].apply(null, arguments)
};

var dynCall_ii = Module["dynCall_ii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_ii"].apply(null, arguments)
};

var dynCall_iidiiii = Module["dynCall_iidiiii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_iidiiii"].apply(null, arguments)
};

var dynCall_iii = Module["dynCall_iii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_iii"].apply(null, arguments)
};

var dynCall_iiii = Module["dynCall_iiii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_iiii"].apply(null, arguments)
};

var dynCall_jiji = Module["dynCall_jiji"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_jiji"].apply(null, arguments)
};

var dynCall_vi = Module["dynCall_vi"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_vi"].apply(null, arguments)
};

var dynCall_vii = Module["dynCall_vii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_vii"].apply(null, arguments)
};

var dynCall_viii = Module["dynCall_viii"] = function() {
  assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
  assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
  return Module["asm"]["dynCall_viii"].apply(null, arguments)
};
;



// === Auto-generated postamble setup entry stuff ===

Module['asm'] = asm;

if (!Module["intArrayFromString"]) Module["intArrayFromString"] = function() { abort("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["intArrayToString"]) Module["intArrayToString"] = function() { abort("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["ccall"]) Module["ccall"] = function() { abort("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["cwrap"]) Module["cwrap"] = function() { abort("'cwrap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["setValue"]) Module["setValue"] = function() { abort("'setValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getValue"]) Module["getValue"] = function() { abort("'getValue' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["allocate"]) Module["allocate"] = function() { abort("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["getMemory"] = getMemory;
if (!Module["AsciiToString"]) Module["AsciiToString"] = function() { abort("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToAscii"]) Module["stringToAscii"] = function() { abort("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF8ArrayToString"]) Module["UTF8ArrayToString"] = function() { abort("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF8ToString"]) Module["UTF8ToString"] = function() { abort("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF8Array"]) Module["stringToUTF8Array"] = function() { abort("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF8"]) Module["stringToUTF8"] = function() { abort("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF8"]) Module["lengthBytesUTF8"] = function() { abort("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF16ToString"]) Module["UTF16ToString"] = function() { abort("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF16"]) Module["stringToUTF16"] = function() { abort("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF16"]) Module["lengthBytesUTF16"] = function() { abort("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["UTF32ToString"]) Module["UTF32ToString"] = function() { abort("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stringToUTF32"]) Module["stringToUTF32"] = function() { abort("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["lengthBytesUTF32"]) Module["lengthBytesUTF32"] = function() { abort("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["allocateUTF8"]) Module["allocateUTF8"] = function() { abort("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackTrace"]) Module["stackTrace"] = function() { abort("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPreRun"]) Module["addOnPreRun"] = function() { abort("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnInit"]) Module["addOnInit"] = function() { abort("'addOnInit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPreMain"]) Module["addOnPreMain"] = function() { abort("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnExit"]) Module["addOnExit"] = function() { abort("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addOnPostRun"]) Module["addOnPostRun"] = function() { abort("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeStringToMemory"]) Module["writeStringToMemory"] = function() { abort("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeArrayToMemory"]) Module["writeArrayToMemory"] = function() { abort("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeAsciiToMemory"]) Module["writeAsciiToMemory"] = function() { abort("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
if (!Module["ENV"]) Module["ENV"] = function() { abort("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
Module["FS"] = FS;
Module["FS_createFolder"] = FS.createFolder;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createLink"] = FS.createLink;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
if (!Module["GL"]) Module["GL"] = function() { abort("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["dynamicAlloc"]) Module["dynamicAlloc"] = function() { abort("'dynamicAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["warnOnce"]) Module["warnOnce"] = function() { abort("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["loadDynamicLibrary"]) Module["loadDynamicLibrary"] = function() { abort("'loadDynamicLibrary' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["loadWebAssemblyModule"]) Module["loadWebAssemblyModule"] = function() { abort("'loadWebAssemblyModule' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getLEB"]) Module["getLEB"] = function() { abort("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getFunctionTables"]) Module["getFunctionTables"] = function() { abort("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["alignFunctionTables"]) Module["alignFunctionTables"] = function() { abort("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["registerFunctions"]) Module["registerFunctions"] = function() { abort("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["addFunction"]) Module["addFunction"] = function() { abort("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["removeFunction"]) Module["removeFunction"] = function() { abort("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getFuncWrapper"]) Module["getFuncWrapper"] = function() { abort("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["prettyPrint"]) Module["prettyPrint"] = function() { abort("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["makeBigInt"]) Module["makeBigInt"] = function() { abort("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["dynCall"]) Module["dynCall"] = function() { abort("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getCompilerSetting"]) Module["getCompilerSetting"] = function() { abort("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackSave"]) Module["stackSave"] = function() { abort("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackRestore"]) Module["stackRestore"] = function() { abort("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["stackAlloc"]) Module["stackAlloc"] = function() { abort("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["establishStackSpace"]) Module["establishStackSpace"] = function() { abort("'establishStackSpace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["print"]) Module["print"] = function() { abort("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["printErr"]) Module["printErr"] = function() { abort("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["getTempRet0"]) Module["getTempRet0"] = function() { abort("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["setTempRet0"]) Module["setTempRet0"] = function() { abort("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["Pointer_stringify"]) Module["Pointer_stringify"] = function() { abort("'Pointer_stringify' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["writeStackCookie"]) Module["writeStackCookie"] = function() { abort("'writeStackCookie' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["checkStackCookie"]) Module["checkStackCookie"] = function() { abort("'checkStackCookie' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["abortStackOverflow"]) Module["abortStackOverflow"] = function() { abort("'abortStackOverflow' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["intArrayFromBase64"]) Module["intArrayFromBase64"] = function() { abort("'intArrayFromBase64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };
if (!Module["tryParseAsDataURI"]) Module["tryParseAsDataURI"] = function() { abort("'tryParseAsDataURI' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") };if (!Module["ALLOC_NORMAL"]) Object.defineProperty(Module, "ALLOC_NORMAL", { get: function() { abort("'ALLOC_NORMAL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_STACK"]) Object.defineProperty(Module, "ALLOC_STACK", { get: function() { abort("'ALLOC_STACK' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_DYNAMIC"]) Object.defineProperty(Module, "ALLOC_DYNAMIC", { get: function() { abort("'ALLOC_DYNAMIC' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });
if (!Module["ALLOC_NONE"]) Object.defineProperty(Module, "ALLOC_NONE", { get: function() { abort("'ALLOC_NONE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)") } });



// Modularize mode returns a function, which can be called to
// create instances. The instances provide a then() method,
// must like a Promise, that receives a callback. The callback
// is called when the module is ready to run, with the module
// as a parameter. (Like a Promise, it also returns the module
// so you can use the output of .then(..)).
Module['then'] = function(func) {
  // We may already be ready to run code at this time. if
  // so, just queue a call to the callback.
  if (Module['calledRun']) {
    func(Module);
  } else {
    // we are not ready to call then() yet. we must call it
    // at the same time we would call onRuntimeInitialized.
    var old = Module['onRuntimeInitialized'];
    Module['onRuntimeInitialized'] = function() {
      if (old) old();
      func(Module);
    };
  }
  return Module;
};

/**
 * @constructor
 * @extends {Error}
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  var argc = args.length+1;
  var argv = stackAlloc((argc + 1) * 4);
  HEAP32[argv >> 2] = allocateUTF8OnStack(Module['thisProgram']);
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
  }
  HEAP32[(argv >> 2) + argc] = 0;


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
      exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      var toLog = e;
      if (e && typeof e === 'object' && e.stack) {
        toLog = [e, e.stack];
      }
      err('exception thrown: ' + toLog);
      Module['quit'](1, e);
    }
  } finally {
    calledMain = true;
  }
}




/** @type {function(Array=)} */
function run(args) {
  args = args || Module['arguments'];

  if (runDependencies > 0) {
    return;
  }

  writeStackCookie();

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
  checkStackCookie();
}
Module['run'] = run;

function checkUnflushedContent() {
  // Compiler settings do not allow exiting the runtime, so flushing
  // the streams is not possible. but in ASSERTIONS mode we check
  // if there was something to flush, and if so tell the user they
  // should request that the runtime be exitable.
  // Normally we would not even include flush() at all, but in ASSERTIONS
  // builds we do so just for this check, and here we see if there is any
  // content to flush, that is, we check if there would have been
  // something a non-ASSERTIONS build would have not seen.
  // How we flush the streams depends on whether we are in SYSCALLS_REQUIRE_FILESYSTEM=0
  // mode (which has its own special function for this; otherwise, all
  // the code is inside libc)
  var print = out;
  var printErr = err;
  var has = false;
  out = err = function(x) {
    has = true;
  }
  try { // it doesn't matter if it fails
    var flush = Module['_fflush'];
    if (flush) flush(0);
    // also flush in the JS FS layer
    ['stdout', 'stderr'].forEach(function(name) {
      var info = FS.analyzePath('/dev/' + name);
      if (!info) return;
      var stream = info.object;
      var rdev = stream.rdev;
      var tty = TTY.ttys[rdev];
      if (tty && tty.output && tty.output.length) {
        has = true;
      }
    });
  } catch(e) {}
  out = print;
  err = printErr;
  if (has) {
    warnOnce('stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.');
  }
}

function exit(status, implicit) {
  checkUnflushedContent();

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && Module['noExitRuntime'] && status === 0) {
    return;
  }

  if (Module['noExitRuntime']) {
    // if exit() was called, we may warn the user if the runtime isn't actually being shut down
    if (!implicit) {
      err('exit(' + status + ') called, but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)');
    }
  } else {

    ABORT = true;
    EXITSTATUS = status;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  Module['quit'](status, new ExitStatus(status));
}

var abortDecorators = [];

function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  if (what !== undefined) {
    out(what);
    err(what);
    what = '"' + what + '"';
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';
  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = abort;

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

  Module["noExitRuntime"] = true;

run();





// {{MODULE_ADDITIONS}}





  return Exomizer
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = Exomizer;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return Exomizer; });
    else if (typeof exports === 'object')
      exports["Exomizer"] = Exomizer;
    