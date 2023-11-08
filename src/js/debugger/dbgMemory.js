var hex2Digit = [

];

for(var i = 0; i < 256; i++) {
  var text = ("00" + i.toString(16)).substr(-2);
  var entry = [];
  entry.push(text.charCodeAt(0));
  entry.push(text.charCodeAt(1));
  hex2Digit.push(entry);
}


var hex4Digit = [

];

for(var i = 0; i < 65536; i++) {
  var text = ("0000" + i.toString(16)).substr(-4);
  var entry = [];
  entry.push(text.charCodeAt(0));
  entry.push(text.charCodeAt(1));
  entry.push(text.charCodeAt(2));
  entry.push(text.charCodeAt(3));
  hex4Digit.push(entry);
}


var DbgMemory = function() {

  this.debugger = null;
  this.fontCanvas = null;
  this.fontCharWidth = 10;
  this.fontCharHeight = 16;

  this.hexNumberCanvas = null;
  this.hexNumberPositions = [];

  this.lineHeight = this.fontCharHeight;

  this.previousValues = [];
  this.lastScrollY = false;
  this.lastWidth = false;
  this.lastHeight = false;

  this.machine = null;

  this.addressStartX = 10;
  this.valuesStartX = 100;
  this.valueSpacing = 10;

  this.bytesAcross = 8;//8;//16;


  this.mouseCursorAddress = false;
  this.highlightedMouseCursorAddress = false;

  this.labelMap = {};

  this.inputAddress = false;
  this.enteredAddress = false;

  this.visible = true;
  this.mouseInCanvas = false;

  this.prefix = false;

  this.maxAddress = 0x10000;

  this.drawMode = 'memory';
  this.screenImageData = null;

  this.screenCanvas = null;
  this.screenContext = null;
  this.screenScale = 2;

  this.charData = [];
  this.charWidth = 8;
  this.charHeight = 8;
  this.charsAcross = 40;
  this.charsDown = 25;
}

DbgMemory.prototype = {
  init: function(args) {
    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

    if(typeof args.maxAddress != 'undefined') {
      this.maxAddress = args.maxAddress;
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

  setBytesAcross: function(bytesAcross) {
    bytesAcross = parseInt(bytesAcross, 10);
    if(isNaN(bytesAcross)) {
      return;
    }
    this.bytesAcross = bytesAcross;
    this.forceRedraw();

  },

  setReport: function(report) {
    this.labelMap = {};


    var memoryMap = [];
    
    if(typeof report != 'undefined' && typeof report.memoryMap != 'undefined') {
      memoryMap = report.memoryMap;
    }

    if(memoryMap.length == 0) {
      $('#' + this.prefix + 'DebuggerMemoryLabelSelect').hide();
    } else {
      var html = '';
      html += '<option value="">Select Label</option>';

      for(var i = 0; i < memoryMap.length; i++) {
        this.labelMap[memoryMap[i].address] = memoryMap[i].label;

        html += '<option value="' + memoryMap[i].address + '">';
        html += memoryMap[i].label;
        html += '</option>';
      }

      $('#' + this.prefix + 'DebuggerMemoryLabelSelect').html(html);
      $('#' + this.prefix + 'DebuggerMemoryLabelSelect').show();
    }
  },

  setVisible: function(visible) {
    this.visible = visible;
  },

  getVisible: function() {
    return this.visible;
  },

  doClear: function() {
    this.clear = true;
    this.previousValues = [];
  },

  buildInterface: function(parentPanel) {

    this.uiComponent = UI.create("UI.SplitPanel",{ overflow: "unset" });
    parentPanel.add(this.uiComponent);

    var infoHTML = '';

    infoHTML += '<div class="panelFill" style="background-color: #111111; z-index: 10000">';
    infoHTML += '<span class="debuggerMemoryInfoAddress" id="' + this.prefix + 'DebuggerMemoryHoverAddress">0000</span>';
    infoHTML += '<span class="debuggerMemoryInfoValue" id="' + this.prefix + 'DebuggerMemoryHoverValueDec">00</span>';
    infoHTML += '<span class="debuggerMemoryInfoValue" id="' + this.prefix + 'DebuggerMemoryHoverValueHex">00</span>';
    infoHTML += '<span id="' + this.prefix + 'DebuggerMemoryHoverValueBin">00000000</span>';
    infoHTML += '<span id="' + this.prefix + 'DebuggerMemoryHoverLabel">00000000</span>';
    infoHTML += '</div>';

    this.infoPanel = UI.create("UI.HTMLPanel", { "html": infoHTML });
    this.uiComponent.addNorth(this.infoPanel, 20, false);

    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + 'MemoryCanvas'});
    this.uiComponent.add(this.scrollCanvas);


    var html = '';
    html += '<div class="panelFill" style="background-color: black">';
    
    
    html += '<div style="margin: 2px 0">';
    html += '<label>Goto'
    html += '<input id="' + this.prefix + 'DebuggerMemoryAddress" style="width: 80px">';
    html += '</label>';

    html += '<select style="display: none" id="' + this.prefix + 'DebuggerMemoryLabelSelect">'
    html += '</select>';

    html += '<label> Bytes Across';
    html += '<input id="' + this.prefix + 'DebuggerMemoryBytesAcross" style="width: 40px" value="8">';
    html += '</label>';

    html += '<label>';
    html += '<input type="checkbox" id="' + this.prefix + 'DebuggerViewAsScreen"> View As Screen';
    html += '</label>';

    html += '</div>';

    html += '</div>';

    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.addSouth(this.controlsPanel, 30, false);


    /*

    // memory search controls at bottom
    html = '';
    html += '<div class="panelFill" style="background-color: black">';

    html += '<div id="' + this.prefix + 'DebuggerMemoryControl">';
    html += '</div>';

    html += '<label>Find:'
    html += '<input id="' + this.prefix + 'DebuggerMemoryValue">';
    html += '</label>';

    html += '<div class="ui-button">Find</div>';
    html += '<div class="ui-button">Find Prev</div>';
    html += '</div>';

    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.addSouth(this.controlsPanel, 60, false);
    */



    var _this = this;

//    this.totalLines = 64 * 1024 / this.bytesAcross;
    this.totalLines = Math.ceil(this.maxAddress / this.bytesAcross);
    this.contentHeight = this.totalLines * this.lineHeight;

    UI.on('ready', function() {
      _this.initEvents();
    });

    this.scrollCanvas.setContentHeight(this.contentHeight);

    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.scrollCanvas.on('resize', function() {
      _this.doClear();
    });

    this.scrollCanvas.on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    this.scrollCanvas.on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    this.scrollCanvas.on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#' + this.prefix + 'DebuggerMemoryLabelSelect').on('change', function() {
      if(value != '') {
        var value = parseInt($(this).val(), 10);

        $('#' + _this.prefix + 'DebuggerMemoryAddress').val(value.toString(16));

        _this.gotoAddress(value);
      }
    });


  },


  outputC64DebuggerMemoryControl: function() {
    //var cpu = this.machine.getCPU();
//    var cpu = this.machine.getDriveCPU();
 
    var cpuControlValue = this.debugger.readByte(01);//cpu.cpuRead(01);

    if(cpuControlValue !== this.cpuControlValue) {
      var LORAM = cpuControlValue & 1;
      var HIRAM = cpuControlValue & 2;
      var CHAREN = cpuControlValue & 4;

      var html = '';
      html += '<div style="margin-bottom: 4px; background-color: black">';

//      html += '<div>';
//      html += 'PORT REGISTER: ' + cpuControlValue.toString(16);
//      html += '</div>';

      html += '<div>';
      // $A000-$BFFF
      html += '<label title="BASIC ROM $A000-$BFFF banked in">LORAM</label>: ';
      if(LORAM) {
        html += '1';
      } else {
        html += '0';
      }
      html += '  ';

      html += '<label title="KERNAL ROM $E000-$FFFF banked in">HIRAM</label>: ';
      if(HIRAM) {
        html += '1';
      } else {
        html += '0';
      }

      html += '  ';

      html += '<label title="Character generator ROM $D000-$DFFF banked in">CHAREN</label>: ';
      if(CHAREN) {
        html += '1';
      } else {
        html += '0';
      }

      html += '</div>';

      html += '</div>';
      $('#' + this.prefix + 'DebuggerMemoryControl').html(html);

      this.cpuControlValue = cpuControlValue;
    }
  },


  mouseDown: function(event) {
    var id = this.scrollCanvas.getElementId();
    var canvasScale = this.scrollCanvas.getScale();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

  },

  memoryValueNavKey: function(event) {
    var keyCode = event.keyCode;
    var shift = event.shiftKey;
    var currentAddress = this.inputAddress;
    var gotoAddress = currentAddress;

    switch(keyCode) {
      case 9: // tab
        if(shift) {
          gotoAddress--;
        } else {
          gotoAddress++;
        }
        break;
      case 13:  // enter
        // go to next address
        gotoAddress ++;
        break;
      case 37: // left
      gotoAddress--;
        break;
      case 38:
        // 
        gotoAddress -= this.bytesAcross;
        break; // up
      case 39:
          gotoAddress++;
        break; // right
      case 40:
          gotoAddress += this.bytesAcross
        break; // down
    }

    if(gotoAddress !== currentAddress) {
      if(gotoAddress >= 0 && gotoAddress < (64 * 1024)) {
        event.preventDefault();
        this.editAddress(gotoAddress);
      }
    }
  },
  editNextAddress: function() {
    this.editAddress(this.inputAddress+1);
  },

  editAddress: function(address) {
    this.inputAddress = address;
//    var cpu = this.machine.getCPU();

    var value = this.debugger.readByte(address);
    value = value.toString(16);
    $('#' + this.prefix + 'DebuggerMemoryValueInput').val(value);
    this.setInputPosition();


    $('#' + this.prefix + 'DebuggerMemoryValueInput').show();
    $('#' + this.prefix + 'DebuggerMemoryValueInput').focus();
    $('#' + this.prefix + 'DebuggerMemoryValueInput').select();

  },

  setValueFromInput: function(value) {
//    var cpu = this.machine.getCPU();
//    cpu.cpuWrite(this.inputAddress, value);
    this.debugger.writeByte(this.inputAddress, value);
  },


  setMouseCursorAddress: function(address) {
    this.mouseCursorAddress = address;

    if(address === false) {
      return;
    }
     
    var text = ("0000" + address.toString(16)).substr(-4);
    $('#' + this.prefix + 'DebuggerMemoryHoverAddress').html(text);

//    var cpu = this.machine.getCPU();

    var value = this.debugger.readByte(address);

    text = ("00" + value.toString(16)).substr(-2);
    $('#' + this.prefix + 'DebuggerMemoryHoverValueHex').html(text);

    $('#' + this.prefix + 'DebuggerMemoryHoverValueBin').html(value);


    text = ("00000000" + value.toString(2)).substr(-8);
    $('#' + this.prefix + 'DebuggerMemoryHoverValueBin').html(text);

    if(typeof this.labelMap[address] != 'undefined') {
      $('#' + this.prefix + 'DebuggerMemoryHoverLabel').html(this.labelMap[address]);
    } else {
      $('#' + this.prefix + 'DebuggerMemoryHoverLabel').html('');
    }
  },


  mouseMove: function(event) {

    var scrollCanvas = this.scrollCanvas;

    var id = scrollCanvas.getElementId();
    var canvasScale = scrollCanvas.getScale();
    var scrollY = scrollCanvas.getScrollY();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    if(this.drawMode == 'screen') {
      x = Math.floor(x / this.charWidth);
      y = Math.floor(y / this.charHeight);
      

      var startAddress = 0x400;

      if(this.enteredAddress !== false) {
        startAddress = this.enteredAddress;
      }

      var address = startAddress + (y * this.charsAcross) + x;

      this.setMouseCursorAddress(address);

    } else {
      x = x * canvasScale;
      y = y * canvasScale;

  //    if(x > this.valuesStartX) {
        var line = Math.floor((scrollY + y) / this.lineHeight);
        var xByteAcross = Math.floor( (x - this.valuesStartX) / (this.fontCharWidth* 2 + this.valueSpacing));


        if(xByteAcross >= 0 && xByteAcross < this.bytesAcross) {
          var address = line * this.bytesAcross + xByteAcross;
          this.setMouseCursorAddress(address);
        } else {
          this.setMouseCursorAddress(false);
        }
  //    }
      }
  },

  mouseUp: function(event) {
    if(this.drawMode == 'screen') {
      return;
    } else {
      if(this.mouseCursorAddress !== false) {
        this.editAddress(this.mouseCursorAddress);
      }
    }

  },

  forceRedraw:function() {
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    this.lastWidth = false;
    this.lastHeight = false;    
  },

  createImageData: function(context) {
    var width = 320;
    var height = 200;

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = width;
    this.screenCanvas.height = height;
    this.screenContext = UI.getContextNoSmoothing(this.screenCanvas); //this.screenCanvas.getContext('2d');
    this.screenImageData = context.createImageData(width, height);

  },

  readCharset: function() {
    var vicRegisters = [];

    for(var i = 0; i < 0x40; i++) {
      vicRegisters[i] = c64_vicReadRegister(i);// c64_cpuReadNS(0xd000 + i);//c64_vicReadAbsolute(0xd000 + i);
    }

    var charmembase = (vicRegisters[0x18] & 0x0e) << 10;
    //var multicolorMode = (vicRegisters[0x16] & 0x10) > 0;    
    var dd00 = false;
    dd00 = c64_cpuReadNS(0xdd00);
    var isROMCharset = false;
    var vicBankStart = 0;
    switch (dd00 & 0x3) {
      case 0:
        vicBankStart = 49152;
        break;
      case 1:
        vicBankStart = 32768;
        if(charmembase == 0x1000) {
          isROMCharset = true;
        }
        break;
      case 2:
        vicBankStart = 16384;
        break;
      case 3:
        vicBankStart = 0;
        if(charmembase == 0x1000) {
          isROMCharset = true;
        }
        break;
    }
    for(var i = 0; i < 2048; i++) {
      this.charData[i] = c64_vicReadAbsolute(vicBankStart + charmembase + i);
    }
  },

  drawScreen: function(context) {
    if(this.screenImageData == null) {
      this.createImageData(context);
    }

    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.oImageSmoothingEnabled = false;

    var scrollCanvas = this.scrollCanvas;

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();
    context.fillStyle= '#111111';
    context.fillRect(0, 0, width, height);    

    var startAddress = 0x400;

    if(this.enteredAddress !== false) {
      startAddress = this.enteredAddress;
    }

    this.readCharset();

    var fgR = 255;
    var fgG = 255;
    var fgB = 255;

    var bgR = 0;
    var bgG = 0;
    var bgB = 0;

    var address = startAddress;
    var charsAcross = this.charsAcross;
    var charsDown = this.charsDown;
    for(var y = 0; y < charsDown; y++) {
      for(var x = 0; x < charsAcross; x++) {
        var dstCharPos = (y * charsAcross * 8 + x) * 8 * 4;
        var value = this.debugger.readByte(address) * 8;
        for(var i = 0; i < 8; i++) {
          var charValue = this.charData[value + i];
          for(var j = 0; j < 8; j++) {
            var dstPos = dstCharPos + (j * 4);
            if(charValue & (1 << (7-j) )) {
              this.screenImageData.data[dstPos] = fgR;//onVal;
              this.screenImageData.data[dstPos + 1] = fgG; //onVal;
              this.screenImageData.data[dstPos + 2] = fgB; //onVal;
              this.screenImageData.data[dstPos + 3] = 255;
            } else {
              this.screenImageData.data[dstPos] = bgR; //offVal;
              this.screenImageData.data[dstPos + 1] = bgG; //offVal;
              this.screenImageData.data[dstPos + 2] = bgB; //offVal;
              this.screenImageData.data[dstPos + 3] = 255;
            }
          }
          dstCharPos += this.screenImageData.width * 4;
        }

        address++;
      }
    }

    var yOffset = 0;

    this.screenContext.putImageData(this.screenImageData, 0, 0);

    //context.putImageData(this.screenImageData, 0, yOffset);
    context.drawImage(this.screenCanvas, 0, 0, width, height, 0, 0, width * this.screenScale, height * this.screenScale);
    var charWidth = this.charWidth;
    var charHeight = this.charHeight;

    context.strokeStyle = '#999';
    context.lineWidth = 1;
    context.beginPath();
    
    for(x = 0; x < charsAcross; x++) {
      context.moveTo(x * charWidth * this.screenScale + 0.5, yOffset);
      context.lineTo(x * charWidth * this.screenScale + 0.5, yOffset + charHeight * charsDown * this.screenScale);
    }
    context.stroke();

    context.beginPath();
    for(y = 0; y < charsDown; y++) {
      context.moveTo(0, yOffset + y * charHeight * this.screenScale + 0.5);
      context.lineTo(charsAcross * charWidth * this.screenScale, yOffset + y * charHeight * this.screenScale + 0.5);
    }
    context.stroke();

  },

  draw: function(context) {
    if(this.drawMode == 'screen') {
      this.drawScreen(context);
      return;
    }


    this.setFontMetrics();
    
    this.addressStartX = 10;
    this.valuesStartX = this.addressStartX + 5 * this.fontCharWidth;
    this.valueSpacing = this.fontCharWidth;

    
    this.outputC64DebuggerMemoryControl();

    var scrollCanvas = this.scrollCanvas;

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();

    var scrollY = scrollCanvas.getScrollY();

    if(scrollY !== this.lastScrollY 
      || width !== this.lastWidth 
      || height !== this.lastHeight
      || this.mouseCursorAddress != this.highlightedMouseCursorAddress) {

      
      this.lastScrollY = scrollY;
      this.lastWidth = width;
      this.lastHeight = height;
      this.doClear();

      context.fillStyle= '#000000';
      context.fillRect(0, 0, width, height);
      this.setInputPosition();
    }

    context.fillStyle= '#444444';
    
//    var cpu = this.machine.getCPU();
//    var cpu = this.machine.getDriveCPU();

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
//    var lineCount = this.lines.length;

    var lineCount = Math.ceil(height / this.lineHeight) + 1;
    var startAddress = Math.floor(scrollY / this.lineHeight) * this.bytesAcross;

    dstY = - (scrollY % this.lineHeight);

    var address = startAddress;
    var lineLength = 0;
    var c = 0;
    var charCodes = false;


    srcY = 0;
    srcWidth = charWidth;
    srcHeight = charHeight;
    dstWidth = charWidth;
    dstHeight = charHeight;

    var count = 0;

    for(var line = 0; line < lineCount; line++) {
      var dstX = this.addressStartX;

      // only draw the address if context has been cleared
      if(this.clear && address >= 0 && address < this.maxAddress) {          
        var addressHigh = (address >> 8) & 0xff;
        var addressLow = (address) & 0xff;

        var position = this.hexNumberPositions[addressHigh];
        srcX = position.x;
        srcY = position.y;

        context.globalAlpha = 0.5;
        context.drawImage(this.hexNumberCanvas, 
          srcX, 
          srcY, 
          srcWidth * 2, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth * 2, 
          dstHeight);

        dstX += dstWidth * 2;

        var position = this.hexNumberPositions[addressLow];
        srcX = position.x;
        srcY = position.y;

        context.drawImage(this.hexNumberCanvas, 
          srcX, 
          srcY, 
          srcWidth * 2, 
          srcHeight, 
          dstX, 
          dstY, 
          dstWidth * 2, 
          dstHeight);
        context.globalAlpha = 1;

        dstX += dstWidth * 2;        
      }
      dstX = this.valuesStartX;

      // draw the memory
      for(var i = 0; i < this.bytesAcross; i++) {
        
        if(address < this.maxAddress) {
          var value = this.debugger.readByte(address);
          if(typeof value == 'undefined') {
            console.log(address);
          }
          if(count >= this.previousValues.length || this.previousValues[count] !== value) {
            this.previousValues[count] = value;
            var position = this.hexNumberPositions[value];
            srcX = position.x;
            srcY = position.y;

            context.drawImage(this.hexNumberCanvas, 
              srcX, 
              srcY, 
              srcWidth * 2, 
              srcHeight, 
              dstX, 
              dstY, 
              dstWidth * 2, 
              dstHeight);
          }

          dstX += dstWidth * 2 + this.valueSpacing;
        }
        count++
        address++;
      }

      dstY += this.lineHeight;

    }  

    if(this.enteredAddress !== false) {
      var pos = this.addressToXY(this.enteredAddress);

      context.beginPath();
      context.strokeStyle = "#a3a8cc";
      context.rect(pos.x - 1.5, pos.y - 1.5 - scrollY, this.fontCharWidth * 2 + 2, this.fontCharHeight + 2);
      context.stroke();

    }


    if(this.mouseCursorAddress !== this.highlightedMouseCursorAddress && this.mouseInCanvas) {

      if(this.mouseCursorAddress !== false) {
        var pos = this.addressToXY(this.mouseCursorAddress);

        context.beginPath();
        context.strokeStyle = "#cccccc";
        context.rect(pos.x - 1.5, pos.y - 1.5 - scrollY, this.fontCharWidth * 2 + 2, this.fontCharHeight + 2);
        context.stroke();



        var info = '$' +  ('0000' + this.mouseCursorAddress.toString(16)).substr(-4);
        var infoXPos = pos.x;
        var infoYPos = pos.y - 20 - scrollY;
        var infoWidth = 50;
        var infoHeight = 14;

//        context.globalAlpha = 0.8;
        context.fillStyle =  '#222222';
        context.fillRect(infoXPos - 1, infoYPos - 1,
          infoWidth + 2, infoHeight + 4);

        context.font = "14px Verdana";
        context.fillStyle = "#accaff";
        context.fillText(info, infoXPos, infoYPos + 12);
    
        
//        context.globalAlpha = 1;

      }


      this.highlightedMouseCursorAddress = this.mouseCursorAddress;
    }
    
    this.clear = false;
  },

  addressToXY: function(address) {
    var line = Math.floor(address / this.bytesAcross);
    var column = address % this.bytesAcross;
    var x = this.valuesStartX + column * (this.fontCharWidth * 2 + this.valueSpacing);
    var y = line * this.lineHeight;
    return { x: x, y: y };
  },

  gotoAddress: function(address) {
    this.enteredAddress = parseInt(address, 10);
    var line = Math.floor(address / this.bytesAcross);
    var scrollY = line * this.lineHeight - 8;
    if(scrollY < 0) {
      scrollY = 0;
    }
    this.scrollCanvas.setScrollY(scrollY);

  },


  setInputPosition: function() {
    var scrollY = this.scrollCanvas.getScrollY();   
    var canvasScale = this.scrollCanvas.getScale(); 
    var pos = this.addressToXY(this.inputAddress);
    var left = pos.x / canvasScale;
    var top = (pos.y - scrollY) / canvasScale - 1;


    $('#' + this.prefix + 'DebuggerMemoryValueInput').css('left', left);
    $('#' + this.prefix + 'DebuggerMemoryValueInput').css('top', top + 'px');

  },

  initEvents: function() {
    var _this = this;
    $('#' + this.prefix + 'DebuggerMemoryAddress').on('focus', function() {
      _this.debugger.blurMachine();

    });
    $('#' + this.prefix + 'DebuggerMemoryAddress').on('blur', function() {
//      _this.debugger.focusC64();
    });

    $('#' + this.prefix + 'DebuggerMemoryAddress').on('change', function(event) {
      var address = parseInt($(this).val(), 16);
      if(isNaN(address)) {
        return;
      }
      _this.gotoAddress(address);
    });

    
    $('#' + this.prefix + 'DebuggerMemoryAddress').on('keyup', function(event) {
      var address = parseInt($(this).val(), 16);
      if(isNaN(address)) {
        return;
      }
      _this.gotoAddress(address);

    });

    $('#' + this.prefix + 'DebuggerMemoryBytesAcross').on('focus', function(event) {
      _this.debugger.blurMachine();
    });

    $('#' + this.prefix + 'DebuggerMemoryBytesAcross').on('blur', function(event) {
    });

    $('#' + this.prefix + 'DebuggerMemoryBytesAcross').on('change', function(event) {
      var across = parseInt($(this).val(), 10);
      if(isNaN(across)) {
        return;
      }
      _this.setBytesAcross(across);
    });

    $('#' + this.prefix + 'DebuggerMemoryBytesAcross').on('keyup', function(event) {
      var across = parseInt($(this).val(), 10);
      if(isNaN(across)) {
        return;
      }
      _this.setBytesAcross(across);
    });


    $('#' + this.prefix + 'DebuggerViewAsScreen').on('click', function(event) {
      if($(this).is(':checked')) {
        _this.drawMode = 'screen';
      } else {
        _this.drawMode = 'memory';
      }
      _this.forceRedraw();      
    });

    var canvasScale = this.scrollCanvas.getScale();

    this.addressStartX = 6 * canvasScale;
    this.valuesStartX  = this.addressStartX + 6 * this.fontCharWidth;
    this.valueSpacing  = 4 * canvasScale;

    var width = this.fontCharWidth * 2 / canvasScale;
    var height = this.fontCharHeight / canvasScale + 2;
    var font = 'font: 12px \'Courier New\', Courier, monospace;';
    var inputHtml = '<input class="' + this.prefix + 'DebuggerInput" type="text" spellcheck="false" maxlength="2" id="' + this.prefix + 'DebuggerMemoryValueInput" type="text" style="' + font + 'position: absolute; top: 30px; left: 30px; border: 0;';
    inputHtml += 'padding: 0; display: none; width: ' + width + 'px; height: ' + height + 'px"/>';

    var scrollCanvas = $('#' + this.scrollCanvas.getElementId());
    var parent = scrollCanvas.parent();
    parent.append(inputHtml);

    scrollCanvas.on('mouseenter', function(event) {
      _this.mouseInCanvas = true;
    });

    scrollCanvas.on('mouseleave', function(event) {
      _this.mouseInCanvas = false;
    });


    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('focus', function() {
      _this.debugger.blurMachine();
    });

    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('blur', function() {
      _this.hideValueInput();
    });

    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('change', function(event) {
      var value = parseInt($(this).val(), 16);
      if(isNaN(value)) {
        return;
      }
      _this.setValueFromInput(value);
    });

    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('keypress', function(event) {
      var keyCode = event.keyCode;
      var allow = "[0-9a-fA-F]";


      if ( keyCode != null && keyCode !=0 && keyCode !=8 && keyCode !=9 && keyCode !=13 && keyCode !=27 ) {

        var re = new RegExp(allow);
        var key = String.fromCharCode(keyCode);
        if(!key.match(re)) {
          event.preventDefault();
          return false;
        }
      }
    });

    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('keydown', function(event) {
      var value = $(this).val();

      _this.keydownValueAddress = _this.inputAddress;
      _this.keydownValueLength = value.length;

      var keyCode = event.keyCode;
      if(keyCode == 13 || keyCode == 9 ||  (keyCode >= 37 && keyCode <= 40) ) {
        event.preventDefault();
      }

    });

    /*
    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('keypress', function(event) {
      var keyCode = event.keyCode;
      if(keyCode == 13 || keyCode == 9 ||  (keyCode >= 37 && keyCode <= 40) ) {
        event.preventDefault();
      }
    });
    */

    $('#' + this.prefix + 'DebuggerMemoryValueInput').on('keyup', function(event) {
      var keyCode = event.keyCode;

      if(event.key == 'Escape') {
        console.log("ESCAPE!!!!!!");

      }
      if(keyCode == 13 || keyCode == 9 ||  (keyCode >= 37 && keyCode <= 40) ) {
        _this.memoryValueNavKey(event);
        return;
      }

      var value = $(this).val();

      _this.keyupValueAddress = _this.inputAddress;
      _this.keyupValueLength = value.length;


      value = parseInt(value, 16);

      if(isNaN(value)) {
        return;
      }
      _this.setValueFromInput(value);
      if(_this.keyupValueAddress == _this.keydownValueAddress
        && _this.keydownValueLength != _this.keyupValueLength
        && _this.keyupValueLength == 2) {
        _this.editNextAddress();
      }
    });



  },

  hideValueInput: function() {
    $('#' + this.prefix + 'DebuggerMemoryValueInput').hide();
    this.debugger.focusMachine();
  },

  update: function() {
    if(this.visible) {
      this.scrollCanvas.render();
    }
  }

}
