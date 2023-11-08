C64_JOYSTICK_UP    =  0x1;
C64_JOYSTICK_DOWN  =  0x2;
C64_JOYSTICK_LEFT  =  0x4;
C64_JOYSTICK_RIGHT =  0x8;
C64_JOYSTICK_FIRE  =  0x10;

function elementOffset(el) {
  var rect = el.getBoundingClientRect(),
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}


var C64OnscreenJoystick = function() {
  this.debugger = null;

  this.button1X = 0;
  this.button1Y = 0;
  this.button1Radius = 0;

  this.button2X = 0;
  this.button2Y = 0;
  this.button2Radius = 0;

  this.joystickX = 0;
  this.joystickY = 0;
  this.joystickRadius1 = 0;
  this.joystickRadius2 = 0;
  this.maxRadius = 100;


  this.button1Down = false;
  this.button2Down = false;
  this.joystickDirectionDown = false;

  this.port = 2;
  this.twoButton = false;
  this.button2Function = 'up';

  this.canvas = null;

  this.id = 'c64-onscreen-joystick';
  this.showPortSelection = false;


  this.hidden = false;
}

C64OnscreenJoystick.prototype = {
  init: function(args) {
    this.debugger = args.debugger;
    this.debugger.setOnscreenJoystickPort(2);

    this.port = 2;

    if(typeof args.id != 'undefined') {
      this.id = args.id;
    }

    if(typeof args.showPortSelection != 'undefined') {
      this.showPortSelection = args.showPortSelection;
    }
  },


  setHidden: function(hidden) {
    this.hidden = hidden;
    this.draw();
  },

  getHTML: function(args) {
    var opacity = 1;
    if(typeof args != 'undefined') {
      if(typeof args.opacity != 'undefined') {
        opacity = args.opacity;
      }
    }
    var html = '';

    html += '<div id="' + this.id + '" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0">';

    if(this.showPortSelection) {
      html += '  <div>';
      html += '    <label class="rb-container" style="margin-right: 4px">Port 1';
      html += '      <input type="radio" id="mobileC64JoystickPort1" name="mobileC64JoystickPort" value="1">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '    <label class="rb-container" style="margin-right: 4px">Port 2';
      html += '      <input type="radio" id="mobileC64JoystickPort2" name="mobileC64JoystickPort" checked="checked"  value="2">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';                
      html += '  </div>';
    }
    html += '  <canvas id="' + this.id + '-canvas"';
    if(opacity != 1) {
      html += ' style="';
      html += ' opacity: ' + opacity + ';';
      html += ' position: absolute; left: 2px; bottom: 40px; '
      html += '"';
  
    }


    
    html += '></canvas>'
    html += '</div>';

    return html;
  },

  buildInterface: function(parentPanel) {
    var html = this.getHTML();
    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "c64OnscreenJoystick", "html": html });
    parentPanel.add(this.uiComponent);

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },


  initEvents: function() {
    var _this = this;
    var _this = this;

    this.canvas = document.getElementById(this.id + '-canvas');

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, false);


    this.canvas.addEventListener("touchstart", function(event){
      event.preventDefault();
      _this.touchStart(event);
      

    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      _this.touchMove(event);
      return false;
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      event.preventDefault();
      _this.touchEnd(event);
    }, false);    

    if(this.showPortSelection) {
      if(typeof $ != 'undefined') {
        $('input[name=mobileC64JoystickPort]').on('click', function(event) {
          var port = $('input[name=mobileC64JoystickPort]:checked').val();
          port = parseInt(port, 10);
          if(!isNaN(port)) {
            _this.port = port;
          }
          _this.debugger.setJoystickPort(port);
        });
      }
    }
  },

  setPort: function(port) {
    this.port = port;
  },

  setType: function(type) {
    switch(type) {
      case 1:
        this.twoButton = false;
        break;
      case 2:
        this.twoButton = true;
        break;
    }
    this.draw();
  },

  setSecondButton: function(button2Function) {
    this.button2Function = button2Function;
  },
  processButtonTouches: function(touches) {
    var button1Down = false;
    var button2Down = false;

    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      var distance = (this.button1X - x) * (this.button1X - x)  
      + (this.button1Y - y) * (this.button1Y - y) ;

      if( distance  < this.button1Radius * this.button1Radius) {
        button1Down = true;
      }

      var distance = (this.button2X - x) * (this.button2X - x)  
      + (this.button2Y - y) * (this.button2Y - y) ;

      if( distance  < this.button2Radius * this.button2Radius) {
        button2Down = true;
      }
    }

    if(button1Down != this.button1Down) {
      this.button1Down = button1Down;
      if(this.button1Down) {
        this.joystickPush('fire');
      } else {
        this.joystickRelease('fire');
      }
    }

    if(button2Down != this.button2Down) {
      this.button2Down = button2Down;
      switch(this.button2Function) {
        case 'space':
          if(this.button2Down) {
            c64_keyPressed(C64_KEY_SPACE);
          } else {
            c64_keyReleased(C64_KEY_SPACE);
          }
          break;

        case 'up':
          if(this.button2Down) {
            //c64_keyPressed(C64_KEY_SPACE);
            this.joystickPush('up');
          } else {
            //c64_keyReleased(C64_KEY_SPACE);
            this.joystickRelease('up');
          }
          break;
  
      }

    }
  },

  processJoystickTouches: function(touches) {
    var currentDirection = this.joystickDirectionDown;

    this.joystickDirectionDown = false;

    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      var distance = (this.joystickX - x) * (this.joystickX - x)  
      + (this.joystickY - y) * (this.joystickY - y) ;
      distance = Math.sqrt(distance);

      if(distance > this.joystickRadius1 && distance < this.joystickRadius2) {
        var angle = Math.atan( (y - this.joystickY) / (x - this.joystickX) );

        if(x >= this.joystickX) {
          angle += Math.PI / 2;
        } else {
          angle += Math.PI  + Math.PI / 2;
        }


        for(var j = 0; j < 8; j++) {
          var sRadian = - (2 * Math.PI / 16) + j * (2 * Math.PI / 8) ;
          var eRadian = sRadian + 2 * Math.PI / 8;

          if(sRadian < 0) {
            sRadian += Math.PI * 2;
            if(angle > sRadian || angle < eRadian) {
              this.joystickDirectionDown = j;
              break;
            }
          } else {

            if(angle > sRadian && angle < eRadian) {
              this.joystickDirectionDown = j;
              break;
            }
          }

          
        }        

      }

    }

    if(this.joystickDirectionDown !== currentDirection) {

      switch(currentDirection) {
        case 0:
          this.joystickRelease('up');
          break;
        case 1:
          this.joystickRelease('up');
          this.joystickRelease('right');
          break;

        case 2:
          this.joystickRelease('right');
          break;
        case 3:
          this.joystickRelease('right');
          this.joystickRelease('down');
          break;
        case 4: 
          this.joystickRelease('down');
        break;
        case 5:
          this.joystickRelease('down');
          this.joystickRelease('left');
          break;
        case 6: 
          this.joystickRelease('left');
          break;
        case 7: 
          this.joystickRelease('left');
          this.joystickRelease('up');
          break;
      }

      switch(this.joystickDirectionDown) {
        case 0:
          this.joystickPush('up');
          break;
        case 1:
          this.joystickPush('up');
          this.joystickPush('right');
          break;

        case 2:
          this.joystickPush('right');
          break;
        case 3:
          this.joystickPush('down');
          this.joystickPush('right');
          break;
        case 4: 
          this.joystickPush('down');
        break;
        case 5:
          this.joystickPush('down');
          this.joystickPush('left');
          break;
        case 6: 
          this.joystickPush('left');
          break;
        case 7: 
          this.joystickPush('up');
          this.joystickPush('left');
          break;
      }


    }
  },

  touchStart: function(event) {
    this.hidden = false;
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();
  },

  touchMove: function(event) {
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();

  },

  touchEnd: function(event) {
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();
  },


  joystickPush: function(direction) {
    switch(direction) {
      case 'up':
        //this.debugger.joystickPush(C64_JOYSTICK_UP);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_UP);
        break;
      case 'down':
        //this.debugger.joystickPush(C64_JOYSTICK_DOWN);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_DOWN);
        break;
      case 'left':
        //this.debugger.joystickPush(C64_JOYSTICK_LEFT);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_LEFT);
        break;
      case 'right':
        //this.debugger.joystickPush(C64_JOYSTICK_RIGHT);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_RIGHT);
        break;
      case 'fire':
        //this.debugger.joystickPush(C64_JOYSTICK_FIRE);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_FIRE);
        break;
    }
  },

  joystickRelease: function(direction) {
    switch(direction) {
      case 'up':
        //this.debugger.joystickRelease(C64_JOYSTICK_UP);
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_UP);
        break;
      case 'down':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_DOWN);
        //this.debugger.joystickRelease(C64_JOYSTICK_DOWN);
        break;
      case 'left':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_LEFT);
        //this.debugger.joystickRelease(C64_JOYSTICK_LEFT);
        break;
      case 'right':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_RIGHT);
        //this.debugger.joystickRelease(C64_JOYSTICK_RIGHT);
        break;
      case 'fire':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_FIRE);
        //  this.debugger.joystickRelease(C64_JOYSTICK_FIRE);
        break;
    }
  },


  layout: function() {
    var holder = document.getElementById(this.id);
    if(!holder) {
      return;
    }

    if(this.canvas == null) {
      return;
    }

    var canvasWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    
    this.canvas.width = canvasWidth;

    /*
    this.canvas.height = 300;

    if(holder.clientHeight != 0) {
      this.canvas.height = holder.clientHeight;
    }
    */


    
    
    this.joystickRadius1 = 44;
    this.joystickRadius2 = 80;

    if(this.joystickRadius2 > this.maxRadius) {
      this.joystickRadius2 = this.maxRadius;
      if(this.joystickRadius2 - this.joystickRadius1 < 30) {
        this.joystickRadius1 = this.joystickRadius2 - 30;
      }
    }

    var portSelectionSize = 0;
    if(this.showPortSelection) {
      portSelectionSize = 30;
    }

    this.joystickX = this.joystickRadius2 + 20;//100;
    this.canvas.height = 2 * this.joystickRadius2 + 20;


    var yPos = this.canvas.height / 2;
    this.joystickY = yPos;

    if(this.twoButton) {
      var buttonsStartX = canvasWidth - 40;
      var buttonRadius = 30;

      // button 2 first
      this.button2X = buttonsStartX;
      this.button2Y = yPos - 20;//yPos + 50;
      this.button2Radius = buttonRadius;

      this.button1X = buttonsStartX - buttonRadius * 2.2; //  buttonsStartX - canvasWidth - 120;
      this.button1Y = yPos - 20 + 1.8 * buttonRadius;
      this.button1Radius = buttonRadius;
    
    } else {
      this.button1X = canvasWidth - 70;
      this.button1Y = yPos;
      this.button1Radius = 40;

    }
  

    // center it??
    var topSpacing = Math.floor( 5 * (holder.clientHeight - portSelectionSize - this.canvas.height) / 8);
    if(topSpacing < 0) {
      topSpacing = 0;
    }
    this.canvas.style.marginTop = '18px';// topSpacing + 'px';

  },

  
  draw: function() {

    this.layout();

    if(this.canvas == null) {
      return;
    }
    this.context = this.canvas.getContext('2d');

    var holder = document.getElementById(this.id);
    if(!holder) {
      console.log('no holder');
      return;
    }
    var canvasWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    this.canvas.width = canvasWidth;

    this.context = this.canvas.getContext('2d');


    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    
    if(this.hidden) {
      return;
    }

    this.context.fillStyle = '#ee1111';
    if(this.button1Down) {
      this.context.fillStyle = '#991111';
    }
    this.context.beginPath();
    // x, y, r, startAngle, end angle
    this.context.arc(this.button1X, this.button1Y, this.button1Radius, 0, 2 * Math.PI);
    //this.context.stroke();
    this.context.fill();


    if(this.twoButton) {
      this.context.fillStyle = '#ee1111';
      if(this.button2Down) {
        this.context.fillStyle = '#991111';
      }
      this.context.beginPath();
      // x, y, r, startAngle, end angle
      this.context.arc(this.button2X, this.button2Y, this.button2Radius, 0, 2 * Math.PI);
      //this.context.stroke();
      this.context.fill();
    }
/*

    var x = 100;
    var y = 70;
    var outerRadius = 50;
    var innerRadius = 30;
*/
    for(var i = 0; i < 8; i++) {
      var sRadian = 0 - Math.PI / 2 - (2 * Math.PI / 16) + i * (2 * Math.PI / 8);
      var eRadian = sRadian + 2 * Math.PI / 8;
      this.context.fillStyle = '#555555';

      if(i === this.joystickDirectionDown) {
        this.context.fillStyle = '#999999';
      }

      this.context.beginPath();
      this.context.arc(this.joystickX, this.joystickY, this.joystickRadius2, sRadian, eRadian, false); // Outer: CCW
      this.context.arc(this.joystickX, this.joystickY, this.joystickRadius1, eRadian, sRadian, true); // Inner: CW
      this.context.closePath();   
      this.context.fill(); 
    }


  }
}