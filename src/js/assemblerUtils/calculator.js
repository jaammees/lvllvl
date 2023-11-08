// https://codepen.io/NeptunianEclipse/pen/obyBdw

var formatNumber = function(num, n, s) {
  var newString = '';
  var numLength = num.length;
  for(var i = 0; i < numLength; i++) {
    var c = num[numLength - 1 - i];
    if(i % n == 0 && i != 0) {
      newString = s + newString;
    }
    newString = c + newString ;
  }
  return newString;
};


var Calculator = function() {

  // A database of the symbols and functions of every operand. Order of operators determines precedence.
  this.operators = [
  /*
    {
      id: "op-power",
      numOperands: 2,
      symbol: " ^ ",
      calc: function(a, b) {
        return Math.pow(a, b);
      }
    },
    */

    /*
    {
      id: "op-square-root",
      numOperands: 1,
      symbol: " √",
      calc: function(a) {
        return Math.sqrt(a);
      }
    },
    {
      id: "op-log",
      numOperands: 1,
      symbol: " log ",
      calc: function(a) {
        return Math.log10(a);
      }
    },
    {
      id: "op-natural-log",
      numOperands: 1,
      symbol: " ln ",
      calc: function(a) {
        return Math.log(a);
      }
    },
    {
      id: "op-sin",
      numOperands: 1,
      symbol: " sin ",
      calc: function(a) {
        return Math.sin(a);
      }
    },
    {
      id: "op-cos",
      numOperands: 1,
      symbol: " cos ",
      calc: function(a) {
        return Math.cos(a);
      }
    },
    {
      id: "op-tan",
      numOperands: 1,
      symbol: " tan ",
      calc: function(a) {
        return Math.tan(a);
      }
    },
    {
      id: "op-inverse-sin",
      numOperands: 1,
      symbol: " sin-1 ",
      calc: function(a) {
        return Math.asin(a);
      }
    },
    {
      id: "op-inverse-cos",
      numOperands: 1,
      symbol: " cos-1 ",
      calc: function(a) {
        return Math.acos(a);
      }
    },
    {
      id: "op-inverse-tan",
      numOperands: 1,
      symbol: " tan-1 ",
      calc: function(a) {
        return Math.atan(a);
      }
    },
    {
      id: "op-e",
      numOperands: 1,
      symbol: " e ^ ",
      calc: function(a) {
        return Math.exp(a);
      }
    },
    {
      id: "op-nth-root",
      numOperands: 2,
      symbol: "*√",
      calc: function(a, b) {
        return Math.pow(b, 1/a);
      }
    },
    */
    {
      id: "or",
      numOperands: 2,
      symbol: " or ",
      calc: function(a, b) {
        return a | b;
      }
    },
    {
      id: "and",
      numOperands: 2,
      symbol: " and ",
      calc: function(a, b) {
        return a & b;
      }
    },
    {
      id: "xor",
      numOperands: 2,
      symbol: " xor ",
      calc: function(a,b) {
        return a ^ b;
      }
    },

    {
      id: "negate",
      numOperands: 1,
      symbol: " -",
      calc: function(a) {
        return -a;
      }
    },

    {
      id: "multiply",
      numOperands: 2,
      symbol: " x ",
      calc: function(a, b) {
        return a * b;
      }
    },
    {
      id: "divide",
      numOperands: 2,
      symbol: " ÷ ",
      calc: function(a, b) {
        return a / b;
      }
    },
    {
      id: "plus",
      numOperands: 2,
      symbol: " + ",
      calc: function(a, b) {
        return a + b;
      }
    },
    {
      id: "subtract",
      numOperands: 2,
      symbol: " - ",
      calc: function(a, b) {
        return a - b;
      }
    }
  ];
  
  // The number of places to round to
  this.roundPlaces = 15;

  this.numberSize = 'ubyte';//'word';
  // A list of every token (number or operator) currently in the expression
  this.tokenList = [];
  
  // A list of previous results and expressions in the form {out: output, expression: expression string, tokens: list of tokens in the expression}
  //this.calcHistory = [];


  this.mode = 'dec';

  this.prefix = 'dev';

}  


Calculator.prototype = {
  init: function(editor, prefix) {
    this.editor = editor;

    if(typeof prefix != 'undefined') {
      this.prefix = prefix;
    }
  },

  buildInterface: function(parentPanel) {
    var _this = this;

    UI.on('ready', function() {
      this.uiComponent = UI.create("UI.HTMLPanel", { "id": _this.prefix + "calculatorPanel" });
      parentPanel.add(this.uiComponent)

      this.uiComponent.load('html/assemblerUtils/calculator.html', function() {
        _this.initEvents();
      });
    });
  },

  initEvents: function() {
    var _this = this;
    // Catches all button clicks on the page
    $(".calculator-button").click(function(event) {
      $(event.target).blur();
      _this.processButton(event.target);
    });

    $('.calculator-mode').on('click', function(event) {
      var mode = $(this).attr('data-mode');
      _this.setMode(mode);
    });

    $('input[name=calculator-size]').on('click', function() {
      var numberSize = $('input[name=calculator-size]:checked').val();
      $('.calculator').focus();
      _this.setNumberSize(numberSize);
    });

    $('.calculator').on('focus', function() {
      g_app.setAllowKeyShortcuts(false);
      UI.setAllowBrowserEditOperations(true); 
    });
    $('.calculator').on('blur', function() {
      g_app.setAllowKeyShortcuts(true);
      UI.setAllowBrowserEditOperations(false);
    });

    $('.calculator').on('keydown', function(event) {
      _this.keyDown(event);
    });

    $('.calculator').on('keyup', function(event) {
      _this.keyUp(event);
    });

    this.setMode('dec');
  },

  keyDown: function(event) {
    if(typeof event.key != 'undefined') {
      switch(event.key.toLowerCase()) {
        case '(':
          this.addToken('bracket-left');
        break;
        case ')':
          this.addToken('bracket-right');
        break;
        case '0': // 0
          this.addToken('0');
        break;
        case '1': // 1
          this.addToken('1');
        break;
        case '2': // 2
          this.addToken('2');
        break;
        case '3': // 3
          this.addToken('3');
        break;
        case '4': // 4
          this.addToken('4');
        break;
        case '5': // 5
          this.addToken('5');
        break;
        case '6': // 6
          this.addToken('6');
        break;
        case '7': // 7
          this.addToken('7');
        break;
        case '8': // 8
          this.addToken('8');
        break;
        case '9': // 9
          this.addToken('9');
        break;
        case '*':
          this.addToken('multiply');
        break;
        case 'enter': // enter
        case '=':
          this.calculate();
        break;
        case 'backspace':
        case 'delete':
          this.deleteLast();
        break;
        case '+': 
          this.addToken('plus');
        break;
        case '-': 
          this.addToken('subtract');
        break;
      }

      if(this.mode == 'hex') {
        switch(event.key.toLowerCase()) {
          case 'a':
            this.addToken('A');
            break;
          case 'b':
            this.addToken('B');
            break;
          case 'c':
            this.addToken('C');
            break;

          case 'd':
            this.addToken('D');
            break;
          case 'e':
            this.addToken('E');  
            break;
          case 'f':
            this.addToken('F');
          break;
        
        }
      }

    }

    /* else {
      return;
      switch(event.key Code) {
        case 48: // 0

        if(event.shiftKey) {
          this.addToken('bracket-right');
        } else {
          this.addToken('0');
        }
        break;
        case 49: // 1
          this.addToken('1');
        break;
        case 50: // 2
          this.addToken('2');
        break;
        case 51: // 3
          this.addToken('3');
        break;
        case 52: // 4
          this.addToken('4');
        break;
        case 53: // 5
          this.addToken('5');
        break;
        case 54: // 6
          this.addToken('6');
        break;
        case 55: // 7
          this.addToken('7');
        break;
        case 56: // 8
        if(event.shiftKey) {
          this.addToken('multiply');
        } else {
          this.addToken('8');
        }
        break;
        case 57: // 9
          if(event.shiftKey) {
            this.addToken('bracket-left');
          } else {
            this.addToken('9');
          }
        break;
        case 13: // enter
          this.calculate();
        break;
        case 8:
          this.deleteLast();
        break;
        case 187: // =/+
          if(event.shiftKey) {
            this.addToken('plus');
          } else {
            this.calculate();
          }
        break;
        case 189: // - 
          this.addToken('subtract');
        break;
      }

      if(this.mode == 'hex') {
        switch(event.key Code) {
          case 65:
            this.addToken('A');
            break;
          case 66:
            this.addToken('B');
            break;
          case 67:
            this.addToken('C');
            break;

          case 68:
            this.addToken('D');
            break;
          case 69:
            this.addToken('E');  
            break;
          case 70:
            this.addToken('F');
          break;
        
        }
      }

    }
    */
  },

  keyUp: function(event) {

  },
  // set number size to byte, ubyte, word, dword
  setNumberSize: function(numberSize) {
    this.numberSize = numberSize;

    if(this.tokenList.length > 0) {
      var lastToken = this.tokenList[this.tokenList.length - 1];
      var value = this.getTokenValue(lastToken);
      value = this.limitToNumberSize(value);
      var token = this.getTokenFromValue(value);
      this.tokenList[this.tokenList.length - 1] = token;

      this.output(value);
      this.displayEquation();
  
    }
  },

  setMode: function(mode) {

    for(var i = 0; i < this.tokenList.length; i++) {
      if(this.isANumber(this.tokenList[i])) {
        var value = this.tokenList[i];
        switch(this.mode) {
          case 'hex':
            value = parseInt(value, 16);
            break;
          case 'dec':
            value = parseInt(value, 10);
            break;
          case 'bin':
            value = parseInt(value, 2);
            break;
        }


        switch(mode) {
          case 'hex':
              if(this.numberSize == 'byte') {
                if(value > 127) {
                  value -= 256;
                }
              }
              value = value.toString(16);
            break;
          case 'dec':
            if(this.numberSize == 'byte') {
              if(value > 127) {
                value -= 256;
              }
            }
            value = value.toString(10);
            break;
          case 'bin':
            if(value < 0) {
              if(this.numberSize == 'byte') {
                value += 256;
              }
            }
            value = value.toString(2);
            break;
        }

        this.tokenList[i] = value.toUpperCase();
      }
    }

    this.mode = mode;

    this.displayEquation();

    $('.calculator-mode').removeClass('calculator-mode-selected');

    $('.calculator-mode-' + mode).addClass('calculator-mode-selected');

    $('.calculator-buttons .num').addClass('disabled');
    $('.calculator-buttons .' + mode).removeClass('disabled');

  },

  // Get the operator object for a given operator ID
  getOperator: function(opID) {
    for(var i = 0; i < this.operators.length; i++) {
      if(this.operators[i].id === opID) {
        return this.operators[i];
      }
    }
    return undefined;
  },
  
  // Get the precedence of an operator given its ID
  getOpPrecedence: function(opID) {
    for(var i = 0; i < this.operators.length; i++) {
      if(this.operators[i].id === opID) {
        return i;
      }
    }
    
    // If the given ID does not return an operator, then return a large value that will always lose in precedence
    return 1000;
  },
      
  // Returns true if op1 ID has equal or higher precedence than op2 ID, false otherwise
  hasPrecedence: function(op1, op2) {
    if(typeof this.getOperator(op1) != 'undefined') {
      return this.getOpPrecedence(op1) <= this.getOpPrecedence(op2);
    }
  },
  
  // Converts the given radian value to degrees
  toDegrees: function(radians) {
    return radians * (180 / Math.PI);
  },
  
  // Converts the given degrees value to radians
  toRadians: function(degrees) {
    return degrees * (Math.PI / 180);
  },
  
  
  // Evaluates the expression and outputs the result
  calculate: function() {
    // Check if brackets are balanced

    var count = 0;
    for(var i = 0; i < this.tokenList.length; i++) {
      if(this.tokenList[i] === "bracket-left") {
        count++;
      } else if(this.tokenList[i] === "bracket-right") {
        count--;
      }
    }
    if(count != 0) {
      this.output("Error: unbalanced brackets");
      return;
    }
    
    // Evaluate the expression using a modified version of the shunting yard algorithm
    var valStack = [];
    var opStack = [];
    
    for(var i = 0; i < this.tokenList.length; i++) {
      if(this.isANumber(this.tokenList[i])) {
        var value = this.tokenList[i];
        switch(this.mode) {
          case 'dec':
            value = parseInt(value, 10);
          break;
          case 'hex':
            value = parseInt(value, 16);
          break;
          case 'bin':
            value = parseInt(value, 2);
          break;
        }
        valStack.push(value);//this.tokenList[i]);
      } else if(this.tokenList[i] === "num-pi") {
        valStack.push(Math.PI);
      } else if(this.tokenList[i] === "bracket-left") {
        opStack.push(this.tokenList[i]);
      } else if(this.tokenList[i] === "bracket-right") {
        while(opStack[opStack.length - 1] !== "bracket-left") {
          var operator = this.getOperator(opStack.pop());
          if(operator.numOperands === 1)
            valStack.push(this.applyOperator(operator, [valStack.pop()]));
          else
            valStack.push(this.applyOperator(operator, [valStack.pop(), valStack.pop()]));
        }
        opStack.pop();
      } else {
        while(opStack.length > 0 && this.hasPrecedence(opStack[opStack.length - 1], this.tokenList[i])) {
          var operator = this.getOperator(opStack.pop());
          if(operator.numOperands === 1)
            valStack.push(this.applyOperator(operator, [valStack.pop()]));
          else
            valStack.push(this.applyOperator(operator, [valStack.pop(), valStack.pop()]));
        }
        opStack.push(this.tokenList[i]);
      }
    }
    
    while(opStack.length > 0) {
      var operator = this.getOperator(opStack.pop());
      if(operator.numOperands === 1)
        valStack.push(this.applyOperator(operator, [valStack.pop()]));
      else
        valStack.push(this.applyOperator(operator, [valStack.pop(), valStack.pop()]));
    }
    
    var value = Math.floor(valStack[0]);

    value = this.limitToNumberSize(value);

    // Output the calculated result and the original expression
    this.tokenList = [];

    var valueToken = value;
    switch(this.mode) {
      case 'dec':
        valueToken = value.toString(10);
      break;
      case 'hex':
        valueToken = value.toString(16).toUpperCase();
      break;
      case 'bin':
        valueToken = value.toString(2);
      break;
    }

    this.tokenList.push(valueToken);

    this.output(value);
    this.displayEquation();
  },
  
  // Returns the result of applying the given unary or binary operator on the top values of the value stack
  applyOperator: function(operator, vals) {
    var valA = vals[0];
    var result;
    
    if(vals.length === 1) {
      result = operator.calc(parseFloat(valA));
    } else {
      var valB = vals[1];
      result = operator.calc(parseFloat(valB), parseFloat(valA));
    }

    return result;
  },
  
  // Updates the equation and calc history with the given output
  output: function(out) {
    out = +out.toFixed(this.roundPlaces);

    switch(this.numberSize) {
      case 'byte':
        out = out & 0xff;
        if(out > 127) {
          out = out - 256;
        }
      break;
      case 'ubyte':
        out = out & 0xff;
      break;
      case 'word':
        out = out & 0xffff;
      break;
      case 'dword':
        out = out & 0xffffffff;
      break;
    }


    var outString = out;
    switch(this.mode) {
      case 'dec':
        outString = out.toString(10);
      break;
      case 'hex':
        outString = out.toString(16);
      break;
      case 'bin':
        outString = out.toString(2);
      break;
    }

    this.showOutputValue(outString.toUpperCase());
    this.updateModeValues(out);
  
  },

  showOutputValue: function(value) {
    switch(this.mode) {
      case 'dec':
        if(typeof value != 'string') {
          value = value.toString(10);
        }
        value = formatNumber(value, 3, ',');
      break;
      case 'hex':
        if(typeof value != 'string') {
          value = value.toString(16);
        }
        value = formatNumber(value, 4, ' ').toUpperCase();
      break;
      case 'bin':
        if(typeof value != 'string') {
          value = value.toString(2);
        }        
        value = formatNumber(value, 4, ' ');
      break;
    }
    $(".calculator-value").html(value);
  },
  isANumber: function(value) {
    if(value === false) {
      return false;
    }

    // make sure not an operator
    var ops = ['rol', 'ror', 'or', 'xor', 'not', 'and', 'lsh', 'rsh'];
    if(value == 'and') {
      return false;
    }

    if(!isNaN(value)) {
      return true;
    }

    if(this.mode == 'hex') {
      value = parseInt(value, 16);
      return !isNaN(value);
//      return (value == 'A' || value == 'B' || value == 'C' || value == 'D' || value == 'E' || value == 'F');
    }

    return false;
  },

  limitToNumberSize: function(value) {
    switch(this.numberSize) {
      case 'byte':
        value = value & 0xff;
        if(value & 0x80) {
          // its negative...
          value = -128 + (value & 0x7F);
        } else {
          value = value;
        }
        break;
      case 'ubyte':
        value = value & 0xff;
      break;
      case 'word':
        value = value & 0xffff;
      break;
      case 'dword':
        value = value & 0xffffffff;
      break;
    }

    return value;
  },

  getTokenFromValue: function(value) {
    var token = value;

    switch(this.mode) {
      case 'dec':
        token = value.toString(10);
      break;
      case 'hex':
        token = value.toString(16);
      break;
      case 'bin':
        if(value < 0) {
          if(this.numberSize == 'byte') {
            value += 256;
          }
        }
        token = value.toString(2);
      break;
    }

    return token;

  },


  getTokenValue: function(token) {
    var value = token;

    switch(this.mode) {
      case 'dec':
        value = parseInt(value, 10);
      break;
      case 'hex':
        value = parseInt(value, 16);
      break;
      case 'bin':
        value = parseInt(value, 2);
      break;
    }

    return value;

  },

  // Adds a token to the token list and updates the display
  addToken: function(token) {


    var lastToken = false;
    if(this.tokenList.length > 0) {
      lastToken = this.tokenList[this.tokenList.length - 1];
    }

    if(!this.isANumber(token)) {

      if(!this.isANumber(lastToken) && lastToken !== "bracket-right" && token !== "bracket-left") {
        return;
      }

      if((token === "bracket-left") && this.isANumber(lastToken)) {
        this.tokenList.push("multiply");
      }
      this.tokenList.push(token);
    } else {
      // its a number
      if(this.isANumber(lastToken)) {
        var newValue = lastToken + token;
        var value = this.getTokenValue(newValue);
        // is the new token in the correct bounds?
        switch(this.numberSize) {
          case 'byte':
            if(value < -128 || value > 127) {
              value = false;
            }
          break;
          case 'ubyte':
            if(value < 0 || value > 0xff) {
              value = false;
            }
          break;
          case 'word':
            if(value < 0 || value > 0xffff) {
              value = false;
            }
          break;
          case 'dword':
            if(value < 0 || value > 0xffffffff) {
              value = false;
            }
          break;
        }

        if(value !== false) {
          this.tokenList[this.tokenList.length - 1] = lastToken + token;
        }

      } else {
        if(this.isANumber(token) && (lastToken === "bracket-right")) {
          this.tokenList.push("multiply");
        }
        this.tokenList.push(token);
      }
    }
        
    this.displayEquation();
  },


  // Updates the expression display's HTML
  displayEquation: function() {
    var htmlString = "";

    var lastNumber = "0";
    var tokenList = this.tokenList;


    for(var i = 0; i < tokenList.length; i++) {

      if(!this.isANumber(tokenList[i])) {
        if(tokenList[i] === "bracket-left") {
          htmlString += " (";
        } else if(tokenList[i] === "bracket-right") {
          htmlString += ") ";
          /*
        } else if(tokenList[i] === "num-pi") {
          htmlString += " π ";
          */
        } else {
          htmlString += this.getOperator(tokenList[i]).symbol;
        }
      } else {
        if(i != tokenList.length - 1) {
          htmlString += tokenList[i];
        }
        lastNumber = tokenList[i];
      }
    }

    $(".calculator-expression").html(htmlString);

    var lastNumberString = lastNumber;
    if(typeof lastNumber === 'string') {
      this.showOutputValue(lastNumber.toUpperCase());
    } else {
      this.showOutputValue(lastNumber);
    }


    // parse the last value
    var lastValue = lastNumber;
    if(typeof lastValue == 'string') {
      lastValue = this.getTokenValue(lastNumber);
    }

    this.updateModeValues(lastValue);
  },

  updateModeValues: function(value) {
    var decValue = value.toString(10);

    var negative = value < 0;

    var hexValue = '';
    var binValue = '';
    switch(this.numberSize) {
      case 'byte':
        if(value < 0) {
          value += 256;
        }
        binValue = ("00000000" + value.toString(2)).substr(-8);
        
        if(value > 127) {
          value = value - 256;
        }
        decValue = value.toString(10);

        hexValue = ("00" + value.toString(16)).substr(-2);
        break;
      case 'ubyte':
        hexValue = ("00" + value.toString(16)).substr(-2);
        binValue = ("00000000" + value.toString(2)).substr(-8);
      break;
      case 'word':
        hexValue = ("0000" + value.toString(16)).substr(-4);
        binValue = ("0000000000000000" + value.toString(2)).substr(-16);
      break;
      case 'dword':
        hexValue = ("00000000" + value.toString(16)).substr(-8);
        binValue = ("00000000000000000000000000000000" + value.toString(2)).substr(-32);
      break;
    }


    binValue = formatNumber(binValue, 4, ' ');
    hexValue = formatNumber(hexValue, 4, ' ');
    decValue = formatNumber(decValue, 3, ',');

    $('.calculator-value-hex').html(hexValue.toUpperCase());
    $('.calculator-value-bin').html(binValue);
    $('.calculator-value-dec').html(decValue);


  },
  
  // Deletes the last entered token
  deleteLast: function () {
    if(!this.isANumber(this.tokenList[this.tokenList.length - 1])) {
      this.tokenList.pop();
    } else {
      this.tokenList[this.tokenList.length - 1] = this.tokenList[this.tokenList.length - 1].slice(0, -1);
      if(this.tokenList[this.tokenList.length -1].length === 0) {
        this.tokenList.pop();
      }
    }
    
    this.displayEquation();
  },
  
  /*
  // Shows/hides the advanced this.operators panel
  toggleAdvanced: function() {
    $("#advanced-buttons").toggle();
    if($("#advanced-buttons").is(":visible")) {
      $("#toggle-advanced").removeClass("button-off");
      $("#toggle-advanced span").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
    } else {
      $("#toggle-advanced").addClass("button-off");
      $("#toggle-advanced span").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
    }
  },
  */

  bitshift: function(op) {

    var value = 0;
    if(this.tokenList.length > 0) {
      value = this.tokenList[this.tokenList.length - 1];
      switch(this.mode) {
        case 'hex':
          value = parseInt(value, 16);
          break;
        case 'dec':
          value = parseInt(value, 10);
          break;
        case 'bin':
          value = parseInt(value, 2);
          break;
      }
    }

    switch(op) {
      case 'rol':
        var msb = 0;
        switch(this.numberSize) {
          case 'byte':
          case 'ubyte':
            msb = (value >> 7) & 1;
          break;
          case 'word':
            msb = (value >> 15) & 1;
          break;
          case 'dword':
            msb = (value >> 32) & 1;
          break;
        }
        value = (value << 1) | msb;

      break;
      case 'ror':
        var lsb = value & 1;
        switch(this.numberSize) {
          case 'byte':
          case 'ubyte':
            lsb = (lsb << 7);
          break;
          case 'word':
            lsb = (lsb << 15);
          break;
          case 'dword':
            lsb = (value << 32);
          break;
        }
        value = (value >> 1) | lsb;
      break;
      case 'lsh':
        value = value << 1;
      break;
      case 'rsh':
        value = value >> 1;
      break;
      case 'not':
        value = ~value;
        break;
    }


    switch(this.numberSize) {
      case 'byte':
      case 'ubyte':
        value = value & 0xff;
      break;
      case 'word':
        value = value & 0xffff;
      break;
      case 'dword':
        value = value & 0xffffffff;
      break;
    }


    var valueToken = value;
    switch(this.mode) {
      case 'dec':
        valueToken = value.toString(10);
      break;
      case 'hex':
        valueToken = value.toString(16).toUpperCase();
      break;
      case 'bin':
        valueToken = value.toString(2);
      break;
    }

    if(this.tokenList.length > 0) {
      this.tokenList[this.tokenList.length - 1] = valueToken;
    } else if(value !== 0) {
      this.tokenList.push(valueToken);
    }

//    this.tokenList.push(value);
    this.output(value);

    this.displayEquation();

  },
  
  // Triggers the appropriate action for each button that can be pressed
  processButton: function (button) {
    var op = $(button).attr('data-op');
    switch(op) {
      case "rol":
      case "ror":
      case "lsh":
      case "rsh":
      case "not":
        this.bitshift(op);
        break;
      case "delete":
          this.deleteLast();
        break;
      case "clear":
        this.tokenList.length = 0;
        this.displayEquation();
        break;

      case "equals":
        this.calculate();
        break;
      default:
        if(!$(button).hasClass('disabled')) {
          if($(button).hasClass("num")) {
            this.addToken($(button).attr('data-value'));
          } else {
            this.addToken($(button).attr("data-op"));
          }
        }
    }
  }
}
