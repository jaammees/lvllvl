// https://lvllvl.com/c64/?gid=3e3292afb713c7884546b936d799d584

var DbgSID = function() {
  this.machine = null;
  this.visible = true;

  this.canvas = null;
  this.context = null;
  this.offscreenCanvas = null;
  this.offscreenContext = null;
  this.offscreenImageData = null;

  this.charEditor = null;  

  this.bitmapAddress = false;
  this.fgColor = 0x6;
  this.bgColor = 0xe;
  this.highlightChar = false;

  this.prefix = '';

  this.mouseRasterY = 0;
  this.mouseRasterX = 0;

}

DbgSID.prototype = {
  init: function(args) {

    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

    this.canvasElementId = this.prefix + "SIDCanvas";

  },

  setVisible: function(visible) {
    this.visible = visible;
    if(visible) {
      this.forceRedraw();
    }
  },

  getVisible: function() {
    return this.visible;
  },

  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    this.bitmapSplitPanel = UI.create("UI.SplitPanel");

    var html = '';
    html += '<div class="panelFill">';




    html += '</div>';

    var infoPanel = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.addNorth(infoPanel, 40, false);


    this.uiComponent.add(this.bitmapSplitPanel);


    

    this.scrollCanvas = UI.create("UI.CanvasScrollPanel", { "id": this.prefix + 'SIDCanvas'});
    this.bitmapSplitPanel.add(this.scrollCanvas);




    html = '';
    html += '<div class="panelFill">';

    for(var i = 0; i < 4; i++) {
      var voice = i + 1;
      html += '      <label class="cb-container">Voice ' + voice;
      html += '        <input type="checkbox" id="' + this.prefix + 'SIDVoice_' + i + '" checked="checked" value="1">';
      html += '        <span class="checkmark"></span>';
      html += '      </label>';    
    }
    html += '</div>'

    this.htmlSouthPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.bitmapSplitPanel.addSouth(this.htmlSouthPanel, 65, false);


    var _this = this;
    UI.on('ready', function() {
      _this.initContent();
      _this.initEvents();
    });
  },

  resizeCanvas: function() {
    this.context = UI.getContextNoSmoothing(this.scrollCanvas.getCanvas());
    /*
    this.context = this.scrollCanvas.getContext();

    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
    */
  },

  resize: function () {


  },

  initContent: function() {
    this.canvas = this.scrollCanvas.getCanvas();
    this.canvasElementId = this.canvas.id;



  },


  initEvents: function() {
    var _this = this;

    this.scrollCanvas.draw = function(context) {
      _this.draw(context);
    }
    /*

    this.scrollCanvas.on('resize', function() {
      _this.resizeCanvas();
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
*/
    for(var i = 0; i < 3; i++) {
      $('#' + this.prefix + 'SIDVoice_' + i).on('click', function() {
        _this.setActiveVoices();
      });
    }
  },

  setActiveVoices() {
    for(var i = 0; i < 3; i++) {
      if($('#' + this.prefix + 'SIDVoice_' + i).is(':checked')) {
        sid_setVoiceEnabled(i, 1);
      } else {
        sid_setVoiceEnabled(i, 0);
      }
    }
  },


  mouseDown: function(event) {
    
  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

  },

  mouseUp: function(event) {

  },

  mouseLeave: function(event) {

  },

  forceRedraw:function() {
    if(this.scrollCanvas) {
      this.scrollCanvas.resize();
    }
    this.lastWidth = false;
    this.lastHeight = false;    
  },


  //https://dustlayer.com/vic-ii/2013/4/26/vic-ii-for-beginners-screen-modes-cheaper-by-the-dozen
  //http://www.coding64.org/?p=164

  // https://sta.c64.org/cbm64disp.html
  

  drawChannel: function(context) {
    this.audioBufferLength = 4096; // 2048;

    for(var ch = 0; ch < 4; ch++) {
      var ptr = sid_getAudioBufferCh(ch);
      var data = new Float32Array(c64.HEAPF32.subarray( (ptr >> 2), (ptr >> 2) + this.audioBufferLength));  
      var dataPos = 0;

      var scale = 2.8;//3.5;
      /*
      if(ch == 3) {
        scale = 30000;
      }

      */
     
     var width = this.scrollCanvas.getWidth();
     var height = this.scrollCanvas.getHeight();
     var hScale = 4;
     scale = height / 280;
     var yOffset = 50 * scale + 60 * ch * scale;// 100 +  180 * ch * scale;


     var step = Math.floor(this.audioBufferLength / (width * hScale));
     if(step == 0) {
       step = 1;
     }


     // trigger the wave
     var triggerOffset = Math.floor(this.audioBufferLength / 2);  // need to center on midpoint
     while(data[triggerOffset] < 2 && triggerOffset < this.audioBufferLength + 500) {
       triggerOffset++;
     }
     while(data[triggerOffset] >= 1.95 && triggerOffset < this.audioBufferLength + 500) {
       triggerOffset++;
     }

     // now go back
     triggerOffset -= Math.floor(this.audioBufferLength / 2);

     var sample = 0;
     dataPos = Math.floor(triggerOffset + sample) % this.audioBufferLength;



      var x = -1;
      var y = yOffset + data[0];
      context.strokeStyle = '#ffffff';
      context.beginPath();
      context.moveTo(x, y);
      for(var i = 1; i < this.audioBufferLength; i+= step) {
        x++;
        y = data[dataPos] * scale + yOffset;

        dataPos = (dataPos + step) % this.audioBufferLength;

        context.lineTo(x, y);
      }
      context.stroke();
    }

  },

  draw: function(context) {

    this.context = context;
    if(this.context) {
      this.context.fillStyle = '#111111';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    

      this.drawChannel(context);
    }
    /*
    this.scale = 2 * UI.devicePixelRatio;
    this.context.drawImage(this.offscreenCanvas, 
                          0, 
                          0, 
                          this.offscreenCanvas.width * this.scale, 
                          this.offscreenCanvas.height * this.scale);
    */                          
  },

  update: function() {

    if(this.visible) {
      
      this.scrollCanvas.render();
    }
  }
}
