

if (window.performance && window.performance.now) {
  getTimestamp = function() { return window.performance.now(); };
} else {
  if (window.performance && window.performance.webkitNow) {
    getTimestamp = function() { return window.performance.webkitNow(); };
  } else {
    getTimestamp = function() { return new Date().getTime(); };
  }
}


var g_started = false;
var g_lastUpdate = getTimestamp();

function base64ToBuffer( str ) {
  var b = atob( str );
  var buf = new Uint8Array( b.length );

  for ( var i = 0, l = buf.length; i < l; i ++ ) {
    buf[ i ] = b.charCodeAt( i );
  }
  return buf;
}

var isMobileBrowser = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      //return true;
      return (isMobileBrowser.Android() || isMobileBrowser.BlackBerry() || isMobileBrowser.iOS() || isMobileBrowser.Opera() || isMobileBrowser.Windows());
  }
};      


var offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 384;
offscreenCanvas.height = 272;
var offscreenContext = offscreenCanvas.getContext('2d');
var imageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
var mouseInCanvas = false;
var mouseC64X = 0;
var mouseC64Y = 0;
var canvas = document.getElementById('c64-canvas');
canvas.width = 384;
canvas.height = 272; 
var context = canvas.getContext('2d');
var isMobile = isMobileBrowser.any();
var orientation = 0;
if(isMobile) {
  orientation =  window.innerWidth > window.innerHeight ? 90 : 0;
}
var isFullscreen = false;

var onScreenJoystick = null;
var onScreenKeyboard = null;
var overlayOnscreenJoystick = null;
var currentOnscreenControl = 'joystick';
var arrowKeysImage = new Image();
arrowKeysImage.src = 'images/arrowkeys.png';

var zKeyImage = new Image();
zKeyImage.src = 'images/zkey.png';

var xKeyImage = new Image();
xKeyImage.src = 'images/xkey.png';

var controlsImage = new Image();
controlsImage.src = 'images/controls.png'

var orGamepadImage = new Image();
orGamepadImage.src = 'images/orgamepad.png'

var plusImage = new Image();
plusImage.src = 'images/orgamepad.png'

var injectPRG = false;
var prgRandomDelay = false;

var c64Scale = 1;

var userAgent = window.navigator.userAgent;
var platform = window.navigator.platform;
var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
var os = null;

if (macosPlatforms.indexOf(platform) !== -1) {
  os = 'Mac OS';
} else if (iosPlatforms.indexOf(platform) !== -1) {
  os = 'iOS';
} else if (windowsPlatforms.indexOf(platform) !== -1) {
  os = 'Windows';
} else if (/Android/.test(userAgent)) {
  os = 'Android';
} else if (!os && /Linux/.test(platform)) {
  os = 'Linux';
}


canvas.style.cursor = "pointer";

document.addEventListener('keydown', function(event) {

  if(c64_ready) {
    if(c64.joystick.keyDown(event)) {
      return;
    }
    c64_keydown(event);
  }
}, false);

document.addEventListener('keyup', function(event) {
  if(c64_ready) {
    if(c64.joystick.keyUp(event)) {
      return;
    }

    c64_keyup(event);
  }
}, false);

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

canvas.addEventListener('mousedown', function(event) {
  if(!g_started) {
    startContent();
  } else {
    mouseDown(event);
  }
});

canvas.addEventListener('mouseup', function(event) {
  mouseUp(event);
});


canvas.addEventListener('mousemove', function(event) {
  mouseMove(event);
});

canvas.addEventListener('mouseenter', function(event) {
///        mouseEnter();
  mouseInCanvas = true;
});

canvas.addEventListener('mouseleave', function(event) {
//        mouseLeave();
  mouseInCanvas = false;
});

//      var holder = document.getElementById('c64-holder');
window.addEventListener('resize', function(event) {
  resize();
});



document.getElementById('c64-holder').addEventListener('fullscreenchange', function(event) {
  if (document.fullscreenElement) {
  } else {
    isFullscreen = false;
    if(isMobile) {
      g_started = false;
    }
    resize();
  }
});      

var fullscreenButton = document.getElementById('c64-fullscreen');
if(fullscreenButton) {
  fullscreenButton.addEventListener('click', function(event) {
    fullscreen();
  });
}


window.addEventListener("orientationchange", function(event) {
//  orientation = event.target.screen.orientation.angle;
//  layoutMobile();
});


function setupOnscreenControls() {
  onScreenJoystick = new C64OnscreenJoystick();
  onScreenJoystick.initEvents();

  overlayOnscreenJoystick = new C64OnscreenJoystick();
  overlayOnscreenJoystick.id = 'c64-overlay-onscreen-joystick';
  overlayOnscreenJoystick.initEvents();

  onScreenKeyboard = new C64OnscreenKeyboard();
  onScreenKeyboard.loadFont();
  onScreenKeyboard.initKeyboard();
  onScreenKeyboard.initEvents();

  var keyboardTab = document.getElementById('c64-onscreen-keyboard-tab');
  var joystickTab = document.getElementById('c64-onscreen-joystick-tab');

  keyboardTab.addEventListener('click', function(event) {
    keyboardTab.className = "tab tab-current";
    joystickTab.className = "tab";
    currentOnscreenControl = 'keyboard';
    resize();

  });
  
  joystickTab.addEventListener('click', function(event) {
    keyboardTab.className = "tab";
    joystickTab.className = "tab tab-current";
    currentOnscreenControl = 'joystick';
    resize();

  });

  if(g_c64Settings.mobileJoystick) {
    currentOnscreenControl = 'joystick';
  } else if(g_c64Settings.mobileKeyboard) {
    currentOnscreenControl = 'keyboard';
  }


  // settings
  for(var i = 0; i < 2; i++) {
    var port = i + 1;

    if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {
      onScreenJoystick.setPort(port);
      overlayOnscreenJoystick.setPort(port);


      if(typeof g_c64Settings['port' + port + 'buttons'] != 'undefined') {
        var buttons = parseInt(g_c64Settings['port' + port + 'buttons'], 10);
        onScreenJoystick.setType(buttons);
        overlayOnscreenJoystick.setType(buttons);
      }

      if(typeof g_c64Settings['port' + port + 'buttonactions'] != 'undefined' && typeof g_c64Settings['port' + port + 'buttonactions'].length != 'undefined') {
        var action = g_c64Settings['port' + port + 'buttonactions'][1];
        onScreenJoystick.setSecondButton(action);
        overlayOnscreenJoystick.setSecondButton(action);

      }
        
    }
/*      
    if(typeof g_c64Settings['mousePort' + port] != 'undefined') {
//        c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
    }
*/  
  }


}

function layoutMobile() {

  resize();

}

function startContent() {
  c64.sound.checkAudio();

  canvas.style.cursor = "none";

  if(isMobile) {
    fullscreen();
    layoutMobile();
  }
  c64_reset();

  if(typeof g_prg != 'undefined' && g_prg) {
    if(typeof g_c64Settings != 'undefined' && g_c64Settings.prgLoadMethod != 'undefined') {
      injectPRG = g_c64Settings.prgLoadMethod == 'inject';
    }

    if(typeof g_c64Settings != 'undefined' && g_c64Settings.prgLoadMethod != 'undefined') {
      prgRandomDelay = g_c64Settings.prgRandomDelay;
    }

    var prgData = base64ToBuffer(g_prg);

    var delay = 1;
    if(prgRandomDelay) {
      delay = Math.random() * 100;
    }

    setTimeout(function() {
      c64_loadPRG(prgData, prgData.length, injectPRG);
      if(injectPRG) {
        c64.insertText('run\n');
      } else {
        setTimeout(function() {
          c64.insertText('load "*",8,1\nrun\n');
        }, 2000);
      }
    }, delay);
  }

  if(typeof g_d64 != 'undefined' && g_d64) {
    var d64Data = base64ToBuffer(g_d64);
    c64_insertDisk(d64Data, d64Data.length);
/*
    var prgData = D64Util.getFirstPRG(d64Data);
    c64_loadPRG(prgData, prgData.length, false);   
    c64.insertText('run:\n');
*/
    setTimeout(function() {
      c64.insertText('load "*",8,1\nrun\n');
    }, 2000);

  }

  if(typeof g_crt != 'undefined' && g_crt) {
    var crtData = base64ToBuffer(g_crt);
    c64_loadCRT(crtData, crtData.length);
  }

  if(typeof g_snapshot != 'undefined' && g_snapshot) {
    var snapshotData = base64ToBuffer(g_snapshot);
    c64_loadSnapshot(snapshotData, snapshotData.length);
  }

  g_started = true;        
}

function reset() {
  c64_reset();
}

function mouseMove(event) {

  var canvasRect = this.canvas.getBoundingClientRect();
  var canvasLeft = canvasRect.left + document.body.scrollLeft;
  var canvasTop = canvasRect.top + document.body.scrollTop;


  var x = event.pageX - canvasLeft;
  var y = event.pageY - canvasTop;    

  x = Math.floor(x / c64Scale);
  y = Math.floor(y / c64Scale);

  mouseC64X = x;
  mouseC64Y = y + 15;

}


LEFTMOUSEBUTTON = 1;
RIGHTMOUSEBUTTON = 2;
MIDDLEMOUSEBUTTON = 4;

function setButtons(event) {
  if(typeof event.buttons != 'undefined') {
    buttons = event.buttons;
  } else {
    if(typeof event.which !== 'undefined') {
      buttons = event.which;

    } else if(typeof event.nativeEvent !== 'undefined') {
      if(typeof event.nativeEvent.which != 'undefined') {
        buttons = event.nativeEvent.which;
      }
      if(typeof event.nativeEvent.buttons != 'undefined') {
        buttons = event.nativeEvent.buttons;
      }
    }
  }

  if(typeof event.touches != 'undefined' && event.touches.length == 1) {

    buttons = LEFTMOUSEBUTTON;
  }

  if(event.ctrlKey && (buttons & LEFTMOUSEBUTTON)  ) {
    if(os == 'Mac OS') {
      buttons = UI.RIGHTMOUSEBUTTON;
    }
  }
}

function mouseDown(event) {
  setButtons(event);

  // is mouse enabled?
  for(var i = 0; i < 2; i++) {
    if(c64.joystick.getMousePortEnabled(i)) {
      event.preventDefault();
      if(buttons & LEFTMOUSEBUTTON) {
        c64_joystickPush(i, C64_JOYSTICK_FIRE);
      }

      if(buttons & RIGHTMOUSEBUTTON) {
        c64_joystickPush(i, C64_JOYSTICK_UP);
      }     
    }
  }
}

function mouseUp(event) {

  for(var i = 0; i < 2; i++) {
    if(c64.joystick.getMousePortEnabled(i)) {
      event.preventDefault();
      if(buttons & LEFTMOUSEBUTTON) {
        c64_joystickRelease(i, C64_JOYSTICK_FIRE);
      }

      if(buttons & RIGHTMOUSEBUTTON) {
        c64_joystickRelease(i, C64_JOYSTICK_UP);
      }    
    }
  }

}

function redraw() {
  var ptr = c64_getPixelBuffer();
  var len = 384*272*4;

  var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
  var data = imageData.data;
  data.set(view);

  offscreenContext.putImageData(imageData, 0, 0);
  context.drawImage(
                      offscreenCanvas, 
                      0, 0, offscreenCanvas.width, offscreenCanvas.height,
                      0, 0, canvas.width, canvas.height
                    );

  if(!g_started) {
    var width = canvas.width;
    var height = canvas.height;

    var triangleWidth = 50;
    var triangleHeight = 60;
    if(canvas.width < 400) {
      triangleWidth = 25;
      triangleHeight = 30;
    }

    var triangleLeft = Math.floor( (width - triangleWidth) / 2);
    var triangleTop = Math.floor( (height - triangleHeight) / 2);

    if(mouseInCanvas) {
      context.fillStyle = '#ffffff';
    } else {
      context.fillStyle = '#cccccc';
    }
    context.beginPath();
    context.moveTo(triangleLeft, triangleTop);
    context.lineTo(triangleLeft + triangleWidth, triangleTop + triangleHeight / 2);
    context.lineTo(triangleLeft, triangleTop + triangleHeight);
    context.fill();          

    if(g_c64Settings.mobileJoystick && !isMobile && typeof arrowKeysImage.naturalWidth != 'undefined') {
      context.filter = 'brightness(90%)';

        var scale = 1;
        if(canvas.width < 400) {
          scale = 0.5;
        }

        var center = Math.floor(width / 2);

        var yOffset = 60 * scale;
        var xOffset = 30 * scale;
  
        var controlsTop = triangleTop + triangleHeight + yOffset;

        var controlsImageLeft = center - controlsImage.naturalWidth * scale - xOffset;
        var controlsImageTop = controlsTop;
        controlsImageTop += 30 * scale;
        context.drawImage(controlsImage, 
                          controlsImageLeft, 
                          controlsImageTop, 
                          controlsImage.naturalWidth * scale, controlsImage.naturalHeight * scale);

        if(c64.joystick.hasGamepad()) {
          var orGamepadImageLeft = center + xOffset;
          var orGamepadImageTop = controlsTop + (arrowKeysImage.naturalHeight + 12) * scale;
          context.drawImage(orGamepadImage, 
            orGamepadImageLeft, 
            orGamepadImageTop,
            orGamepadImage.naturalWidth * scale, orGamepadImage.naturalHeight * scale);
        }

        var arrowKeysImageLeft = center + xOffset; 
        //var arrowKeysImageLeft = center - xOffset - arrowKeysImage.naturalWidth;
        var arrowKeysImageTop = controlsTop;
        context.drawImage(arrowKeysImage, 
          arrowKeysImageLeft, 
          arrowKeysImageTop,
          arrowKeysImage.naturalWidth * scale,
          arrowKeysImage.naturalHeight * scale);


        var zKeyImageLeft = center + arrowKeysImage.naturalWidth * scale + xOffset * 2;

        var zKeyImageTop = triangleTop + triangleHeight + yOffset + 32 * scale;//16;
        context.drawImage(zKeyImage, 
          zKeyImageLeft, zKeyImageTop,
          zKeyImage.naturalWidth * scale,
          zKeyImage.naturalHeight * scale);


        if(c64.joystick.getJoystickButtons(0) > 1 || c64.joystick.getJoystickButtons(1) > 1) {
            var xKeyImageLeft = center + arrowKeysImage.naturalWidth * scale + zKeyImage.naturalWidth * scale + xOffset * 2.2;

          var xKeyImageTop = triangleTop + triangleHeight + yOffset + 32 * scale;//16;
          context.drawImage(xKeyImage, 
            xKeyImageLeft, xKeyImageTop,
            xKeyImage.naturalWidth * scale,
            xKeyImage.naturalHeight * scale);

        }
            
      }

      context.filter = 'none';
    }
}

function showControls() {
  console.log("SHOW CONTROLs");
}


function fullscreen() {
  isFullscreen = true;
  var holder = document.getElementById('c64-holder');
  if(holder.requestFullscreen) {
    holder.requestFullscreen();
  } else if (holder.mozRequestFullScreen) { /* Firefox */
    holder.mozRequestFullScreen();
  } else if (holder.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    holder.webkitRequestFullscreen();
  } else if (holder.msRequestFullscreen) { /* IE/Edge */
    holder.msRequestFullscreen();
  }        

  if(isMobile) {
    setupOnscreenControls();          
  }
  resize();
}


function onC64Ready() {
}

function resize() {
  var pixelMultiple = true;

  var c64Width = 384;
  var c64Height = 272;

  var holder = document.getElementById('c64-holder');
  var width = holder.clientWidth;
  var height = holder.clientHeight;

  if(isMobile) {
    var tabsHolder = document.getElementById('c64-onscreen-tabs');
    var joystickHolder = document.getElementById('c64-onscreen-joystick');
    var keyboardHolder = document.getElementById('c64-onscreen-keyboard');
    var joystickOverlay = document.getElementById('c64-overlay-onscreen-joystick');

    if(isFullscreen) {
      var mobileControlsHeight = 210;
      var mobileTabsHeight = 40;

      if(orientation == 90) {
        // landscape
        mobileControlsHeight = 0;
        mobileTabsHeight = 0;
      }

      height = height - mobileControlsHeight - mobileTabsHeight;

      if(g_c64Settings.mobileKeyboard && g_c64Settings.mobileJoystick) {
        if(mobileTabsHeight == 0) {
          tabsHolder.style.display = 'none';
        } else {
          tabsHolder.style.bottom = mobileControlsHeight + 'px';
          tabsHolder.style.height = mobileTabsHeight + 'px';
          tabsHolder.style.display = 'block';
        }
      }

      joystickHolder.style.height = mobileControlsHeight + 'px';
      if(g_c64Settings.mobileJoystick && currentOnscreenControl == 'joystick' && mobileControlsHeight > 0) {
        joystickHolder.style.display = 'block';
      } else {
        joystickHolder.style.display = 'none';
      }

      keyboardHolder.style.height = mobileControlsHeight + 'px';
      if(g_c64Settings.mobileKeyboard && currentOnscreenControl == 'keyboard' && mobileControlsHeight > 0) {
        keyboardHolder.style.display = 'block';
      } else {
        keyboardHolder.style.display = 'none';
      }

      if(orientation != 0 && g_c64Settings.mobileJoystick) {
        joystickOverlay.style.display = 'block';
        overlayOnscreenJoystick.draw();
      } else {
        joystickOverlay.style.display = 'none';
      }
    } else {
      tabsHolder.style.display = 'none';
      joystickHolder.style.display = 'none';
      keyboardHolder.style.display = 'none';
      joystickOverlay.style.display = 'none';
    }
  }


  // set the scale of the c64 canvas
  var scale = 1;
  var deviceScale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
  var highDeviceScale = isMobile;

  var hScale = width / c64Width;
  var vScale = height / c64Height;

  if(hScale > vScale) {
    scale = vScale;
  } else {
    scale = hScale;
  }

  if(scale > 1 && pixelMultiple && !highDeviceScale) {
    scale = Math.floor(scale);
  }

  var cssWidth = Math.round(c64Width * scale);
  var cssHeight = Math.round(c64Height * scale);

  c64Scale = scale;

  if(highDeviceScale) {
    canvas.width = Math.round(c64Width * scale * deviceScale);
    canvas.height = Math.round(c64Height * scale * deviceScale);
    canvas.style.width = cssWidth +  'px';
    canvas.style.height = cssHeight +  'px';

  } else {
    canvas.width = Math.round(c64Width * scale);
    canvas.height = Math.round(c64Height * scale);
  }

//  canvas.width = Math.round(c64Width * scale);
//  canvas.height = Math.round(c64Height * scale);
  context = canvas.getContext('2d');



  var top = Math.floor((height - cssHeight) / 2);
  var left = Math.floor((width - cssWidth) / 2);

  canvas.style.top = top + 'px';
  canvas.style.left = left + 'px';

  //if(scale == Math.floor(scale)) {
  if(scale >= 1 && (pixelMultiple || highDeviceScale)) {
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.oImageSmoothingEnabled = false;
  } else {
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.msImageSmoothingEnabled = true;
    context.oImageSmoothingEnabled = true;
  }

  var fullscreenHolder = document.getElementById('c64-fullscreen-holder');
  if(fullscreenHolder) {
    if(isMobile) {
      fullscreenHolder.style.display = 'none';
    } else {
      var left = left + cssWidth - 18;
      var top = top + cssHeight + 2;
      fullscreenHolder.style.display = 'block';
      fullscreenHolder.style.left = left + 'px';
      fullscreenHolder.style.top = top + 'px';
    }
  }

  if(isMobile && orientation != 0 && isFullscreen) {
    // need to make sure controls fit
    var sideSpace = Math.floor( (width - cssWidth) / 2 );
    var maxRadius = Math.floor(( (sideSpace - 40) / 2));
    if(maxRadius < 70) {
      maxRadius = 70;
    }
    overlayOnscreenJoystick.maxRadius = maxRadius;
    overlayOnscreenJoystick.draw();
  }

  if(c64_ready) {
    redraw();
  }
}

function render(timestamp) {
  var dTime = timestamp - g_lastUpdate;

  g_lastUpdate = timestamp;
  

  if(onScreenJoystick) {
    onScreenJoystick.draw();
  }

  if(onScreenKeyboard) {
    onScreenKeyboard.draw();
  }
  if(c64_ready) {

    c64.joystick.checkGamepads();
    c64_mousePosition(mouseC64X, mouseC64Y);

    if(c64.pastingText) {
      c64.processPasteText();
    }

    if(isMobile) {
      var currentOrientation = window.innerWidth > window.innerHeight ? 90 : 0;
      if(currentOrientation != orientation) {
        orientation = currentOrientation;
        layoutMobile();
      }

    }
    // refresh screen if debugger says its time, or need to update if currently paused
    if(debugger_update(dTime) || !debugger_isRunning()) {
      redraw();
    }
  }

  requestAnimationFrame( render );
}

render();

resize();
