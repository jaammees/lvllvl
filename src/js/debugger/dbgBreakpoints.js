
var DbgBreakpoints = function() {

  this.debugger = null;
  this.fontCanvas = null;
  this.fontCharWidth = 10;
  this.fontCharHeight = 16;
  this.lineHeight = this.fontCharHeight;
  this.lastScrollY = 0;

  this.machine = null;
  this.debugger = null;
  this.breakpointColWidth = 10;
  this.deletePositionX = 0;

  this.breakpointType = 'pc';
  this.memoryBreakpointsY = 0;
  this.rasterYBreakpointsY = 0;

  this.visible = true;

  this.prefix = '';
}

DbgBreakpoints.prototype = {
  init: function(args) {
    this.prefix = args.prefix;
    this.machine = args.machine;
    this.debugger = args.debugger;

    var dbgFont = g_app.dbgFont;
    dbgFont.createFonts();

    this.fontCanvas = dbgFont.fontCanvas;

    this.hexNumberCanvas = dbgFont.hexNumberCanvas[0];
    this.hexNumberPositions = dbgFont.hexNumberPositions;

    this.cmdCanvas = dbgFont.cmdCanvas;
    this.cmdPositions = dbgFont.cmdPositions;

    this.breakpointColWidth = 20 * UI.devicePixelRatio;
    this.deletePositionX = 200 * UI.devicePixelRatio;

    this.setFontMetrics();
  },


  setFontMetrics: function() {
    var dbgFont = g_app.dbgFont;
    this.fontCharWidth = dbgFont.fontCharWidth;
    this.fontCharHeight = dbgFont.fontCharHeight;
    this.hexNumberPositions = dbgFont.hexNumberPositions;
    this.cmdPositions = dbgFont.cmdPositions;
    this.lineHeight = this.fontCharHeight + 4 * UI.devicePixelRatio;  


    this.cmdPositionX = 23 * this.fontCharWidth;
    this.cyclesPositionX = 19 * this.fontCharWidth;

    this.opCodePositionX = this.breakpointColWidth + this.fontCharWidth * 4 + 20;


//    this.deletePositionX = 50 * this.fontCharWidth;
  },

  setVisible: function(visible) {
    this.visible = visible;
  },

  getVisible: function() {
    return this.visible;
  },

  buildInterface: function(parentPanel) {

    this.uiComponent = UI.create("UI.SplitPanel", { "id": this.prefix + "BreakpointsCanvas"});
    parentPanel.add(this.uiComponent);

    var html = '';

    html += '<div class="panelFill" style="background-color: #111111">';
    html += 'Breakpoints';
    html += '</div>';
    this.headingPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.addNorth(this.headingPanel, 24, false);



    html = '';
    html += '<div class="panelFill" style="background-color: #111111">';    
    html += '  <div>';
    html += '    <select id="' + this.prefix + 'BreakpointType">';
    html += '      <option value="pc">PC</option>';
    html += '      <option value="memory">Memory</option>';
    html += '      <option value="rasterY">Raster Y</option>';
    html += '    </select>';

    html += '    <input id="' + this.prefix + 'BreakpointAddress" size="4"/>'

    html += '    <div id="' + this.prefix + 'BreakpointMemoryOptions" style="display: inline-block;">';
    html += '      <select id="' + this.prefix + 'BreakpointOp">';
    html += '        <option value="0">==</option>';
    html += '        <option value="1">!=</option>';
    html += '        <option value="2">&lt;</option>';
    html += '        <option value="3">&gt;</option>';
    html += '      </select>';
    html += '      <input id="' + this.prefix + 'BreakpointValue" maxlength="2" size="4"/>';
    html += '    </div>';

    html += '    <div id="' + this.prefix + 'AddBreakpoint" class="ui-button">Add</div>';
    html += '  </div>';
    html += '</div>';

    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.uiComponent.addSouth(this.controlsPanel, 34, false);

    this.scrollCanvas = UI.create("UI.CanvasScrollPanel");
    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }

    this.uiComponent.add(this.scrollCanvas);

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
      _this.setBreakpointType('pc');
    });

    this.scrollCanvas.on('resize', function() {
      _this.drawBreakpoints();
    });

    this.scrollCanvas.on('mousedown', function(event) {
      _this.mouseDown(event);
    });
  },


  setBreakpointType: function(type) {
    this.breakpointType = type;

    switch(type)  {
      case 'pc':
      case 'address':
      case 'rasterY':
        
        $('#' + this.prefix + 'BreakpointMemoryOptions').hide();
        break;
      case 'memory':
        $('#' + this.prefix + 'BreakpointMemoryOptions').show();
        break;
    }

  },

  mouseDown: function(event) {
    var id = this.scrollCanvas.getElementId();
    var canvasScale = this.scrollCanvas.getScale();

    var x = event.pageX - $('#' + id).offset().left;
    var y = event.pageY - $('#' + id).offset().top;

    x = x * canvasScale;
    y = y * canvasScale;

    // pc breakpoints

    var breakpoints = this.debugger.getPCBreakpoints();

    
    var line = Math.floor(y / this.lineHeight);

    if(line < breakpoints.length) {
      var address = breakpoints[line].address;
      var enabled = breakpoints[line].enabled;

      //if(x < this.breakpointColWidth) {
      if(x < this.deletePositionX) {
        this.debugger.setPCBreakpointEnabled({ address: address, enabled: !enabled });
        this.drawBreakpoints();
        return;
      }

      if(x > this.deletePositionX && x < this.deletePositionX + this.fontCharWidth) {
        this.debugger.removePCBreakpoint({ address: address });
        this.drawBreakpoints();
        return;

      }
    }


    // memory breakpoints
    breakpoints = this.debugger.getMemoryBreakpoints();// this.machine.memoryBreakpoints;   
    line =  Math.floor(   (y - this.memoryBreakpointsY) / this.lineHeight);

    if(line >= 0 && line < breakpoints.length) {
      var address = breakpoints[line].address;
      var enabled = breakpoints[line].enabled;
      var op = breakpoints[line].op;
      var value = breakpoints[line].value;

      //if(x < this.breakpointColWidth) {
      if(x < this.deletePositionX) {
        this.debugger.setMemoryBreakpointEnabled({ address: address, op: op, value: value, enabled: !enabled });
        this.drawBreakpoints();
      }

      if(x > this.deletePositionX && x < this.deletePositionX + this.fontCharWidth) {
        
        this.debugger.removeMemoryBreakpoint({ address: address, op: op, value: value });
        this.drawBreakpoints();

      }
    }


    // rasterY breakpoints
    breakpoints = this.debugger.getRasterYBreakpoints();   
    line =  Math.floor(   (y - this.rasterYBreakpointsY) / this.lineHeight);

    if(line >= 0 && line < breakpoints.length) {
      var rasterY = breakpoints[line].rasterY;
      var enabled = breakpoints[line].enabled;

//      if(x < this.breakpointColWidth) {
      if(x < this.deletePositionX) {
        this.debugger.setRasterYBreakpointEnabled({ rasterY: rasterY, enabled: !enabled });
        this.drawBreakpoints();
      }

      if(x > this.deletePositionX && x < this.deletePositionX + this.fontCharWidth) {
        
        this.debugger.removeRasterYBreakpoint({ rasterY: rasterY });
        this.drawBreakpoints();

      }
    }


  },

  initEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'BreakpointType').on('change', function() {
      var value = $(this).val();
      _this.setBreakpointType(value);
    });

    $('#' + this.prefix + 'AddBreakpoint').on('click', function() {

      var type = $('#' + _this.prefix + 'BreakpointType').val();
      if(type == 'pc') {

        var address = parseInt($('#' + _this.prefix + 'BreakpointAddress').val(), 16);
        $('#' + _this.prefix + 'BreakpointAddress').val('');
        if(isNaN(address)) {
          alert('Please enter valid address');
          return;
        }
        if(address < 0 || address >= 64 * 1024) {
          alert('Please enter a valid address');
          return;
        }
  
        var args = {
          "address": address,
          "enabled": true
        }
        _this.addPCBreakpoint(args);
      }

      if(type == 'memory') {
        var address = parseInt($('#' + _this.prefix + 'BreakpointAddress').val(), 16);
        $('#' + _this.prefix + 'BreakpointAddress').val('');
        if(isNaN(address)) {
          alert('Please enter valid address');
          return;
        }
        if(address < 0 || address >= 64 * 1024) {
          alert('Please enter a valid address');
          return;
        }

        var op = $('#' + _this.prefix + 'BreakpointOp').val();
        var value = parseInt($('#' + _this.prefix + 'BreakpointValue').val(), 16);
        $('#' + _this.prefix + 'BreakpointValue').val('');
        
        if(!isNaN(value) && !isNaN(address)) {
          var args = {
            "address": address,
            "enabled": true,
            "op": op,
            "value": value
          }
          _this.addMemoryBreakpoint(args);
        }
      }

      if(type == 'rasterY') {
        var address = parseInt($('#' + _this.prefix + 'BreakpointAddress').val(), 10);
        $('#' + _this.prefix + 'BreakpointAddress').val('');
        
        var args = {
          "rasterY": address,
          "enabled": true
        }
        _this.addRasterYBreakpoint(args);

      }
    });

    $('#' + this.prefix + 'BreakpointAddress').on('focus', function() {
      _this.debugger.blurMachine();
    });
    $('#' + this.prefix + 'BreakpointAddress').on('blur', function() {
      _this.debugger.focusMachine();
    });
    $('#' + this.prefix + 'BreakpointValue').on('focus', function() {
      _this.debugger.blurMachine();
    });
    $('#' + this.prefix + 'BreakpointValue').on('blur', function() {
      _this.debugger.focusMachine();
    });


  },

  addPCBreakpoint: function(args) {
    this.debugger.addPCBreakpoint(args);
    this.drawBreakpoints();
  },

  addMemoryBreakpoint: function(args) {
    this.debugger.addMemoryBreakpoint(args);
    this.drawBreakpoints();
  },

  addRasterYBreakpoint: function(args) {
    this.debugger.addRasterYBreakpoint(args);
    this.drawBreakpoints();

  },


  
  draw: function(context) {

    this.setFontMetrics();

    var scrollCanvas = this.scrollCanvas;

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();

    var scrollY = scrollCanvas.getScrollY();

    if(scrollY !== this.lastScrollY 
      || width !== this.lastWidth 
      || height !== this.lastHeight) {
      
      this.lastScrollY = scrollY;
      this.lastWidth = width;
      this.lastHeight = height;
//      this.doClear();
      // redraw everything
      this.drawBreakpoints();
      return;

    }
    

     

    // need to update the memory breakpoints  
    // draw current value of memory breakpoints    
    var breakpoints = this.debugger.getMemoryBreakpoints();

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

    dstY = this.memoryBreakpointsY;
    var breakpointCount = breakpoints.length; 
    for(var i = 0; i < breakpointCount; i++) {
      dstX = this.breakpointColWidth + charWidth * 5 ;
      var address = breakpoints[i].address;
      var value = this.debugger.readByte(address);


      // draw the type

      // draw the value
      var line = ("00" + value.toString(16)).substr(-2);
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstY += this.lineHeight;


    }

  },


  updateContentSize: function() {
    var breakpointCount = 0;
    var breakpoints = this.debugger.getPCBreakpoints();
    breakpointCount += breakpoints.length;
    breakpoints = this.debugger.getMemoryBreakpoints();
    breakpointCount += breakpoints.length;
    breakpoints = this.debugger.getMemoryBreakpoints();
    breakpointCount += breakpoints.length;

    

    this.contentHeight = breakpointCount * this.lineHeight;

    this.scrollCanvas.setContentHeight(this.contentHeight);

  },


  drawBreakpoints: function() {

    this.setFontMetrics();    
    this.updateContentSize();
    var scrollCanvas = this.scrollCanvas;

    var context = scrollCanvas.getContext();

    var width = scrollCanvas.getWidth();
    var height = scrollCanvas.getHeight();
    context.fillStyle= '#000000';
    context.fillRect(0, 0, width, height);
    context.fillStyle= '#444444';
    var scrollY = scrollCanvas.getScrollY();

    this.deletePositionX = width - this.fontCharWidth * 2;

    var line = "";



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

    dstY = -scrollY; //- (scrollY % this.lineHeight);


    var breakpointRadius = 4 * UI.devicePixelRatio;
    var breakpointIndentX = 4 * UI.devicePixelRatio;
    var breakpointIndentY = Math.floor( (charHeight - breakpointRadius * 2) / 2)   ;//  1 * UI.devicePixelRatio;

    
    // program counter breakpoints...
    breakpoints = this.debugger.getPCBreakpoints();

    var breakpointCount = breakpoints.length; 
    for(var i = 0; i < breakpointCount; i++) {
      dstX = 0;
      var address = breakpoints[i].address;
      var enabled = breakpoints[i].enabled;

      // enabled circle
      context.fillStyle = "#ff0000";
      context.strokeStyle = "#ff0000";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(dstX + breakpointIndentX + breakpointRadius, 
        dstY + breakpointIndentY +  breakpointRadius, 
        breakpointRadius, 0, 2 * Math.PI);

      if(enabled) {
        context.fill();          
      } else {
        context.stroke();          
      }


      dstX = this.breakpointColWidth;

      var lineLength = 0;

      line = "PC = ";
      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstX += charWidth;
      dstX += charWidth;
      dstX += charWidth;

      line = ("0000" + address.toString(16)).substr(-4);

      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      if(breakpoints[i].file) {
        dstX += charWidth * 2;
        line = breakpoints[i].file;
        if(breakpoints[i].lineNumber) {
          line += "(" + breakpoints[i].lineNumber + ")";
        }

        lineLength = line.length;
        for(var j = 0; j < lineLength; j++) {
          var c = line.charCodeAt(j);
  
          srcX = c * charWidth;
          srcY = 0;
          srcWidth = charWidth;
          srcHeight = charHeight;
          dstWidth = charWidth;
          dstHeight = charHeight;
  
          context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
          dstX += charWidth;
        }
  
      }

      dstX = this.deletePositionX;
      line = 'X';
      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstY += this.lineHeight;      
    }

    // memory breakpoints

    this.memoryBreakpointsY = dstY;
    breakpoints = this.debugger.getMemoryBreakpoints();
    var breakpointCount = breakpoints.length; 
    for(var i = 0; i < breakpointCount; i++) {
      dstX = 0;
      var address = breakpoints[i].address;
      var op = breakpoints[i].op;
      var value = breakpoints[i].value;
      var enabled = breakpoints[i].enabled;

      // enabled circle
      context.fillStyle = "#ff0000";
      context.strokeStyle = "#ff0000";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(dstX + breakpointIndentX + breakpointRadius, 
        dstY + breakpointIndentY +  breakpointRadius, 
        breakpointRadius, 0, 2 * Math.PI);

      if(enabled) {
        context.fill();          
      } else {
        context.stroke();          
      }
      dstX = this.breakpointColWidth;

      line = "MEM";
      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }
      dstX += charWidth;
      dstX += charWidth;

      // draw the address..
      line = ("0000" + address.toString(16)).substr(-4);
      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstX = this.breakpointColWidth + 9 * charWidth;

      // draw the operator
      //line = op;

      switch(op) {
        case 0:
          line = '==';
          break;
        case 1:
          line = '!=';
          break;
        case 2:
          line = '<';
          break;
        case 3:
          line = '>';
          break;
      }

      
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstX += 10;

      // draw the value
      var line = ("00" + value.toString(16)).substr(-2);
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      // draw the delete button
      dstX = this.deletePositionX;
      line = 'X';
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstY += this.lineHeight;      
    }



    // raster breakpoints
    breakpoints = this.debugger.getRasterYBreakpoints();   

    this.rasterYBreakpointsY = dstY;

    breakpointCount = breakpoints.length; 
    for(var i = 0; i < breakpointCount; i++) {
      dstX = 0;
      var rasterY = breakpoints[i].rasterY;
      var enabled = breakpoints[i].enabled;

      // enabled circle
      context.fillStyle = "#00ff00";
      context.strokeStyle = "#00ff00";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(dstX + breakpointIndentX + breakpointRadius, 
        dstY + breakpointIndentY +  breakpointRadius, 
        breakpointRadius, 0, 2 * Math.PI);

      if(enabled) {
        context.fill();          
      } else {
        context.stroke();          
      }
      dstX = this.breakpointColWidth;

      line = "RY";
      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstX += charWidth;
      dstX += charWidth;
      dstX += charWidth;

      line = rasterY.toString(10);//("0000" + address.toString(16)).substr(-4);

      lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstX = this.deletePositionX;
      line = 'X';
      var lineLength = line.length;
      for(var j = 0; j < lineLength; j++) {
        var c = line.charCodeAt(j);

        srcX = c * charWidth;
        srcY = 0;
        srcWidth = charWidth;
        srcHeight = charHeight;
        dstWidth = charWidth;
        dstHeight = charHeight;

        context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
        dstX += charWidth;
      }

      dstY += this.lineHeight;      
    }

  },

  update: function() {
    if(this.visible) {
      this.scrollCanvas.render();
    }


  }

}

