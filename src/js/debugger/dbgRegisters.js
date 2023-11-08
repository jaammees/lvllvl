

var DbgRegisters = function() {
  this.fontCanvas = null;
  this.fontCharWidth = 10;
  this.fontCharHeight = 16;
  this.lineHeight = this.fontCharHeight;

  this.lastScrollY = false;
  this.lastWidth = false;
  this.lastHeight = false;

  this.machine = null;
  this.clear = false;

  this.pcLocationX = 0;
  this.aLocationX = 0;
  this.xLocationX = 0;
  this.yLocationX = 0;
  this.spLocationX = 0;

  this.visible = true;
  this.showRasterPosition = false;
  this.canWrite = true;
 
  this.prefix = false;
}


DbgRegisters.prototype = {
  init: function(args) {
    this.prefix = args.prefix;
    this.machine = args.machine;
    this.debugger = args.debugger;
    if(typeof args.showRasterPosition != 'undefined') {
      this.showRasterPosition = args.showRasterPosition;
    }

    if(typeof args.canWrite != 'undefined') {
      this.canWrite = args.canWrite;
    }

    var dbgFont = g_app.dbgFont;
    dbgFont.createFonts();

    this.fontCanvas = dbgFont.fontCanvas;
    this.hexNumberCanvas = dbgFont.hexNumberCanvas[0];
    this.cmdCanvas = dbgFont.cmdCanvas;

    this.setFontMetrics();

  },

  setFontMetrics: function() {
    var dbgFont = g_app.dbgFont;
    this.fontCharWidth = dbgFont.fontCharWidth;
    this.fontCharHeight = dbgFont.fontCharHeight;
    this.hexNumberPositions = dbgFont.hexNumberPositions;
    this.cmdPositions = dbgFont.cmdPositions;
    this.lineHeight = this.fontCharHeight + 4 * UI.devicePixelRatio;  
  },


  setVisible: function(visible) {
    this.visible = visible;
  },

  getVisible: function() {
    return this.visible;
  },

  buildInterface: function(parentPanel) {
    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + "RegistersCanvas" });
    parentPanel.add(this.scrollCanvas);

    var _this = this;

    this.totalLines = 2;
    this.contentHeight = 1;//this.totalLines * this.lineHeight;

    this.scrollCanvas.setContentHeight(this.contentHeight);

    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.scrollCanvas.on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    this.scrollCanvas.on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    this.scrollCanvas.on('mouseup', function(event) {
      _this.mouseUp(event);
    });


    this.scrollCanvas.on('resize', function() {
      _this.doClear();
    });

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  initEvents: function() {
    var canvasScale = this.scrollCanvas.getScale();
    var width = this.fontCharWidth * 4 / canvasScale;
    var height = this.fontCharHeight / canvasScale + 2;

    var font = 'font: 12px \'Courier New\', Courier, monospace;';
    var inputHtml = '<input class="' + this.prefix + 'DebuggerInput" spellcheck="false"  id="' + this.prefix + 'RegistersInput" type="text" ';
    inputHtml += ' style="' + font + 'position: absolute; top: 0px; left: 0px; border: 0;';
    inputHtml += 'padding: 0;display: none; width: ' + width + 'px; height: ' + height + 'px"/>';
//    console.log(inputHtml);

    var scrollCanvas = $('#' + this.scrollCanvas.getElementId());
    var parent = scrollCanvas.parent();
    parent.append(inputHtml);

    var _this = this;
    $('#' + this.prefix + 'RegistersInput').on('focus', function() {    
      _this.debugger.blurMachine();
    });
    $('#' + this.prefix + 'RegistersInput').on('blur', function() {
      $('#' + this.prefix + 'RegistersInput').hide();
      _this.debugger.focusMachine();
    });

    $('#' + this.prefix + 'RegistersInput').on('keyup', function(event) {
      _this.keyUp(event)
    });
  },

  mouseDown: function(event) {
    var id = this.scrollCanvas.getElementId();
    var canvasScale = this.scrollCanvas.getScale();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

  },

  mouseMove: function(event) {
    var id = this.scrollCanvas.getElementId();
    var canvasScale = this.scrollCanvas.getScale();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

  },

  mouseUp: function(event) {
    var id = this.scrollCanvas.getElementId();
    var canvasScale = this.scrollCanvas.getScale();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

    if(!this.canWrite) {
      return;
    }

    if(y > this.lineHeight) {
      if(x > this.pcLocationX && x < this.pcLocationX + this.fontCharWidth * 4 && y > this.lineHeight) {
        this.editPC();
      }

      if(x > this.aLocationX && x < this.aLocationX + this.fontCharWidth * 2) {
        this.editRegister('a');
      }

      if(x > this.xLocationX && x < this.xLocationX + this.fontCharWidth * 2) {
        this.editRegister('x');
      }
      if(x > this.yLocationX && x < this.yLocationX + this.fontCharWidth * 2) {
        this.editRegister('y');
      }
      if(x > this.spLocationX && x < this.spLocationX + this.fontCharWidth * 2) {
        this.editRegister('sp');
      }

    }

  },

  keyUp: function(event) {
    var keyCode = event.keyCode;
    var value = $('#' + this.prefix + 'RegistersInput').val();

    value = parseInt(value, 16);
    if(isNaN(value)) {
      return;
    }

    if(!this.canWrite) {
      return;
    }

    var address = value;
    if(keyCode == 13) {
      if(this.isEditingPC !== false) {
        this.setPC(address);
      }

      if(this.isEditingRegister !== false) {
  //      var cpu = this.machine.getCPU();

//        var registers = cpu.registers;

        switch(this.isEditingRegister) {
          case 'a':
            this.debugger.setRegA(value);
//            registers[REGA] = value;
            break;
          case 'x':
            this.debugger.setRegX(value);
//              registers[REGX] = value;
            break;
          case 'y':
            this.debugger.setRegY(value);
//              registers[REGY] = value;
            break;
          case 'sp':
            this.debugger.setRegSP(value);

//            registers[REGSP] = value;
            break;
        }

      }
      $('#' + this.prefix + 'RegistersInput').hide();
      
    }
  },

  editRegister: function(type) {
    var scrollCanvas = this.scrollCanvas;
    var canvasScale = scrollCanvas.getScale();

//    var cpu = this.machine.getCPU();
//    var registers = cpu.registers;


    this.isEditingRegister = type;
    this.isEditingPC = false;

    var left = this.aLocationX / canvasScale;
    var top = this.lineHeight / canvasScale;
    var value = 0;

    switch(type) {
      case 'a':
        left = this.aLocationX / canvasScale;
        value = ("00" + this.debugger.getRegA().toString(16)).substr(-2); 
        break;
      case 'x':
        left = this.xLocationX / canvasScale;
        value = ("00" + this.debugger.getRegX().toString(16)).substr(-2); 
        break;
      case 'y':
        left = this.yLocationX / canvasScale;
        value = ("00" + this.debugger.getRegY().toString(16)).substr(-2); 
        break;
      case 'sp':
        left = this.spLocationX / canvasScale;
        value = ("00" + this.debugger.getRegSP().toString(16)).substr(-2); 
        break;
    }

    var width = 2 * this.fontCharWidth / canvasScale;
    $('#' + this.prefix + 'RegistersInput').css('left', left + 'px');
    $('#' + this.prefix + 'RegistersInput').css('top', top + 'px');
    $('#' + this.prefix + 'RegistersInput').css('width', width + 'px');
    $('#' + this.prefix + 'RegistersInput').val(value);
    $('#' + this.prefix + 'RegistersInput').show();
    $('#' + this.prefix + 'RegistersInput').focus();
    $('#' + this.prefix + 'RegistersInput').select();

  },
  editPC: function() {
    this.isEditingRegister = false;
    this.isEditingPC = true;

    var scrollCanvas = this.scrollCanvas;
    var canvasScale = scrollCanvas.getScale();

    var programCounter = this.debugger.getPC();
    programCounter = programCounter.toString(16);


    var left = this.pcLocationX / canvasScale;
    var top = this.lineHeight / canvasScale;
    var width = 4 * this.fontCharWidth / canvasScale;
    $('#' + this.prefix + 'RegistersInput').css('left', left + 'px');
    $('#' + this.prefix + 'RegistersInput').css('top', top + 'px');
    $('#' + this.prefix + 'RegistersInput').css('width', width + 'px');
    $('#' + this.prefix + 'RegistersInput').val(programCounter);
    $('#' + this.prefix + 'RegistersInput').show();
    $('#' + this.prefix + 'RegistersInput').focus();
    $('#' + this.prefix + 'RegistersInput').select();

  },

  setPC: function(address) {
    var cpu = this.debugger.setPC(address);

  },

  doClear: function() {
    this.clear = true;
  },


  draw: function(context) {
    this.setFontMetrics();
    
    var scrollCanvas = this.scrollCanvas;
    var canvasScale = scrollCanvas.getScale();

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();
    var scrollY = scrollCanvas.getScrollY();
    if(scrollY !== this.lastScrollY || width !== this.lastWidth || height !== this.lastHeight) {
      this.lastScrollY = scrollY;
      this.lastWidth = width;
      this.lastHeight = height;
      this.doClear();

      context.fillStyle= '#000000';
      context.fillRect(0, 0, width, height);
    }
    context.fillStyle= '#444444';


    var programCounter = this.debugger.getPC();
//    var cpu = this.machine.getCPU();
//    var registers = cpu.registers;

    var charWidth = this.fontCharWidth;
    var charHeight = this.fontCharHeight;
    
    var srcX = 0;
    var srcY = 0;
    var srcWidth = charWidth;
    var srcHeight = charHeight;
    var dstX = 0;
    var dstY = 0;
    var dstWidth = charWidth;
    var dstHeight = charHeight;
    this.breakpointColWidth = 20 * canvasScale;
    this.pcLocationX = this.breakpointColWidth;
    this.aLocationX = this.pcLocationX + 6 * this.fontCharWidth;
    this.xLocationX = this.pcLocationX + 9 * this.fontCharWidth;
    this.yLocationX = this.pcLocationX + 12 * this.fontCharWidth;
    this.spLocationX = this.pcLocationX + 15 * this.fontCharWidth;

    
    if(this.clear) {
      context.fillStyle= '#000000';
      context.fillRect(0, 0, width, height);

      var line = "PC    A  X  Y  SP  NV-BDIZC";

      if(this.showRasterPosition) {
        line += "  VC  RY  RX";
      }
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstX = this.breakpointColWidth + j * charWidth;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
      }
    }

    dstY += this.lineHeight;

    line = '';
    line += ("0000" + programCounter.toString(16)).substr(-4);      
    line += "  ";
    line += ("00" + this.debugger.getRegA().toString(16)).substr(-2);      
    line += " ";
    line += ("00" + this.debugger.getRegX().toString(16)).substr(-2);      
    line += " ";
    line += ("00" + this.debugger.getRegY().toString(16)).substr(-2);      
    line += " ";
    line += ("00" + this.debugger.getRegSP().toString(16)).substr(-2);      
    line += "  ";

    if(this.debugger.getFlagN()) {
      line += '1';          
    } else {
      line += '0';          
    } 

    if(this.debugger.getFlagV()) {
      line += '1';
    } else {
      line += '0';
    }

    line += '-';

    if(this.debugger.getFlagB()) {
      line += '1';
    } else {
      line += '0';
    }

    if(this.debugger.getFlagD()) {
      line += '1';
    } else {
      line += '0';
    }

    if(this.debugger.getFlagI()) {
      line += '1';
    } else {
      line += '0';
    }

    if(this.debugger.getFlagZ()) {
      line += '1';
    } else {
      line += '0';
    }

    if(this.debugger.getFlagC()) {
      line += '1';
    } else {
      line += '0';
    }

    if(this.showRasterPosition) {
      line += "  ";
      var vc =  this.debugger.getVC();// - 10;
      if(vc < 0) {
        vc += 63;
      }
      line += ("000" + vc.toString(10)).substr(-3);      
      line += " ";
      line += ("000" + this.debugger.getRstY().toString(10)).substr(-3);      
      line += " ";
      var rx = vc * 8;//this.debugger.getRstX();
      line += ("000" + rx.toString(10)).substr(-3);      
    }


    lineLength = line.length;
    for(var j = 0; j < lineLength; j++) {
      var c = line.charCodeAt(j);

      srcX = c * charWidth;
      srcY = 0;
      srcWidth = charWidth;
      srcHeight = charHeight;
      dstX = this.breakpointColWidth + j * charWidth;
      dstWidth = charWidth;
      dstHeight = charHeight;

      context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
    }

    this.clear = false;
    
  },

  update: function() {
    if(this.visible) {
      this.scrollCanvas.render();
    }
  }


}