var ParamGraph = function() {
  this.canvasElementId = '';
  this.canvas = null;
  this.context = null;

  this.min = 0;
  this.max = 255;

  this.data = []; //[ 40, 50, 30, 100 ];
  this.mouseInBar = false;

  this.mouseValue = 0;

  this.paramChanged = false;
  this.mouseUpHandler = false;

  this.paddingY = 12;
}

ParamGraph.prototype = {
  init: function(args) {
    this.canvasElementId = args.canvasElementId;    

  },

  on: function(eventName, f) {
    if(eventName == 'paramchanged') {
      this.paramChanged = f;
    }
    if(eventName == 'mouseup') {
      this.mouseUpHandler = f;
    }
  },

  setup: function() {
    if(this.canvas === null) {
      this.canvas = document.getElementById(this.canvasElementId);
      this.initEvents();
    }


    this.canvasScale = Math.floor(window.devicePixelRatio);

    var width = 300;
    var height = 300;

    this.canvas.width = width * this.canvasScale;
    this.canvas.height = height * this.canvasScale;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.context = this.canvas.getContext('2d');
    this.context.scale(this.canvasScale, this.canvasScale);

    this.width = width;
    this.height = height - this.paddingY * 2;

  },


  initEvents: function() {
    var _this = this;
    $('#' + this.canvasElementId).on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#' + this.canvasElementId).on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.canvasElementId).on('mouseup', function(event) {
      _this.mouseUp(event);
    });


    $('#' + this.canvasElementId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    $('#' + this.canvasElementId).on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });

    $('#' + this.canvasElementId).on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });
  },

  setBounds: function(min, max) {
    this.min = min;
    this.max = max;
  },

  setData: function(data) {
    this.data = [];
    for(var i = 0; i < data.length; i++) {
      this.data.push(data[i]);
    }
  },

  setButtons: function(event) {
    if(event.buttons != 'undefined') {
      this.buttons = event.buttons;
    }
    if(event.buttons === 'undefined' && event.nativeEvent !== 'undefined') {
      this.buttons = event.nativeEvent.buttons;
    }

    if(typeof event.touches != 'undefined' && event.touches.length == 1) {
      this.buttons = UI.LEFTMOUSEBUTTON;
    }
    // ctrl click
    if(event.ctrlKey && this.buttons == 1) {
      this.buttons = UI.RIGHTMOUSEBUTTON;
    }

    // cmd + click
    if(event.metaKey && this.buttons == 1) {
      this.buttons = 4;
    }

  },
  mouseDown: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);
    }

    if(this.mouseInBar !== false && this.mouseInBar >= 0 && this.mouseInBar < this.data.length) {
      this.setParamValueFromMouse();
      UI.captureMouse(this);
    }

  },

  mouseMove: function(event) {
    var x = event.pageX - $('#' + this.canvasElementId).offset().left;
    var y = event.pageY - $('#' + this.canvasElementId).offset().top;

    var button = 0;
    this.buttons = UI.LEFTMOUSEBUTTON;
    if(!UI.isMobile.any()) {
      button = event.button;
      this.setButtons(event);
    }


    var bar = Math.floor(x / this.barHolderWidth);

    if(bar >= 0 && bar <= this.data.length) {
      var value = this.height - y;
      if(bar !== this.mouseInBar || this.mouseValue !== value) { 

        if(value < -this.paddingY) {
          value = -this.paddingY;
        }

        if(value > this.height - this.paddingY) {
          value = this.height - this.paddingY;
        }
        this.mouseInBar = bar;
        this.mouseValue = value;


        if(this.buttons & UI.LEFTMOUSEBUTTON) {
          // mouse is currently down
          this.setParamValueFromMouse();
        }
      }
    }


    this.draw();
  },

  mouseUp: function(event) {

    if(this.mouseUpHandler !== false) {
      this.mouseUpHandler(false);
    }

  },

  mouseEnter: function(event) {

  },

  mouseLeave: function(event) {

  },


  setParamValueFromMouse: function() {
    var max = this.max;
    var height = this.height;
    var value = Math.floor(( (this.mouseValue + this.paddingY) / height) * max);

    if(value < this.min) {
      value = this.min;
    }

    if(value >= this.max) {
      value = this.max;
    }

    if(this.mouseInBar !== false && this.mouseInBar >= 0 && this.mouseInBar < this.data.length) {
      this.data[this.mouseInBar] = value;

      if(this.paramChanged !== false) {
        this.paramChanged(this.mouseInBar, value)
      }

    }

    this.draw();

  },


  draw: function() {
    if(!this.canvas) {
      this.setup();
    }

    if(!this.context) {
      return;
    }

    var width = this.width;
    var height = this.height;

    this.barCount = this.data.length;
    this.barHolderWidth = width / this.barCount;
    this.barGap = 2;
    var barMaxHeight = height;

    this.context.fillStyle = '#111111';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


    this.context.font = "8px Verdana";
    for(var i = 0; i < this.barCount; i++) {
      var x = Math.floor(i * this.barHolderWidth + this.barGap);

      var max = this.max;
      var value = this.data[i];
      var barHeight = barMaxHeight * value / max;
      var barWidth = this.barHolderWidth - (2 * this.barGap)

      var y = height - barHeight + this.paddingY;

      this.context.fillStyle = "#eeeeee";
      this.context.fillText(value,  x, this.height + this.paddingY * 2 - 3); 


      if(i === this.mouseInBar) {

        this.context.fillStyle = '#eeeeee';
        this.context.fillRect(x, y, barWidth , barHeight);


        var value = Math.floor(( (this.mouseValue + this.paddingY) / this.height) * this.max);
        if(value < this.min) {
          value = this.min;          
        }

        if(value > this.max) {
          value = this.max;
        }


        var mouseValueY = this.height - this.mouseValue;
        this.context.beginPath();    
        this.context.strokeStyle = '#eeeeee';
        this.context.fillStyle = "#eeeeee";

        if(value < this.data[i]) {
          this.context.strokeStyle = '#222222';
          this.context.fillStyle = "#222222";
        }

        this.context.lineWidth = 1;        
        this.context.moveTo(x, mouseValueY + 0.5);
        this.context.lineTo(x + this.barHolderWidth - (2 * this.barGap), mouseValueY + 0.5);
        this.context.stroke();

        // draw the value just above the line


        this.context.fillText(value, x, mouseValueY - 3); 


      } else {
        this.context.fillStyle = '#aaaaaa';
        this.context.fillRect(x, y, barWidth , barHeight);
      }





      this.context.beginPath();    
      this.context.strokeStyle = styles.music.oscilloscopeLines;
      this.context.lineWidth = 1;        
      this.context.moveTo(0, this.height + this.paddingY + 0.5);
      this.context.lineTo(this.width, this.height + this.paddingY + 0.5);
      this.context.stroke();


    }


  }
}
