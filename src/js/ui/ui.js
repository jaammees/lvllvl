var g_lastUpdate = false;
var g_deltaTime = 0;

var UI = function(componentID) {
  if(UI.ids.hasOwnProperty(componentID)) {
    return UI.ids[componentID];
  } else {

    throw 'UI: Unknown component: ' + componentID;
    return null;
  }
}

UI.LEFTMOUSEBUTTON = 1;
UI.RIGHTMOUSEBUTTON = 2;
UI.MIDDLEMOUSEBUTTON = 4;

UI.LEFTARROWKEY = 37;
UI.RIGHTARROWKEY = 39;
UI.UPARROWKEY = 38;
UI.DOWNARROWKEY = 40;
UI.BACKSPACEKEY = 8;
UI.DELETEKEY = 46;

UI.primaryComponent = null;
UI.componentTypes = {};
UI.components = {};
UI.componentCount = 0;
UI.mouseInComponent = null;
UI.mouseDownInComponent = null;
UI.popup = null;
UI.mouseX = 0;
UI.mouseY = 0;
UI.mouseIsDown = [false, false, false];

UI.windows = [];
UI.readyFunctions = [];
UI.ids = {};

UI.isMobile = false;

UI.statsEnabled = false;
UI.isFullscreen = false;

UI.onKeyDown = null;
UI.onKeyUp = null;
UI.onKeyPress = null;
UI.onUpdate = null;

UI.browserEditOperations = false;
UI.canProcessKeyEvents = true;
UI.canProcessMenuKeys = true;

UI.devicePixelRatio = Math.floor(window.devicePixelRatio);
if(isNaN(UI.devicePixelRatio) || UI.devicePixelRatio < 1) {
  UI.devicePixelRatio = 1;
}


UI.goFullscreen = function() {  
  isFullscreen = true;
  var holder = document.body;// document.getElementById('ui');
  if(holder.requestFullscreen) {
    holder.requestFullscreen();
  } else if (holder.mozRequestFullScreen) { /* Firefox */
    holder.mozRequestFullScreen();
  } else if (holder.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    holder.webkitRequestFullscreen();
  } else if (holder.msRequestFullscreen) { /* IE/Edge */
    holder.msRequestFullscreen();
  }        
}


UI.getContextNoSmoothing = function(canvas) {
  var context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
  context.oImageSmoothingEnabled = false;

  return context;
}


UI.mobileDebug =  function(message) {
  var current = $('#debugBox').val();
  current += '\n----\n' + message;
  $('#debugBox').val(current);
}

UI.isMobile = {
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
      return (UI.isMobile.Android() || UI.isMobile.BlackBerry() || UI.isMobile.iOS() || UI.isMobile.Opera() || UI.isMobile.Windows());
  }
};

UI.getID = function() {
  UI.componentCount++;
  return "ui" + UI.componentCount;
}

UI.on = function(eventName, f) {
  eventName = eventName.toLowerCase();

  if(eventName == 'ready') {
    if(UI.ready) {
      // ui is already ready
      f();
    } else {
      UI.readyFunctions.push(f);
    }
  }

  switch(eventName) {
    case 'keydown':
      UI.onKeyDown = f;
    break;
    case 'keyup':
      UI.onKeyUp = f;
    break;
    case 'keypress':
      UI.onKeyPress = f;
    break;
    case 'update':
      UI.onUpdate = f;
    break;
    case 'focus':
      UI.onFocus = f;
    break;
    case 'blur':
      UI.onBlur = f;
    break;
  }


}


UI.setStatsEnabled = function(enabled) {
  UI.statsEnabled = enabled;
  if(enabled) {
    $('#Stats-output').show();
  } else {
    $('#Stats-output').hide();
  }
}

UI.getStatsEnabled = function() {

  return UI.statsEnabled;
}

var browserState = [];

//https://gomakethings.com/how-to-update-a-url-without-reloading-the-page-using-vanilla-javascript/
UI.browserPushState = function(state, pageTitle, url) {
//  history.pushState(state, pageTitle, url);
//  browserState.push(state);
}

UI.browserPopState = function(historyBack) {
  /*
  if(typeof historyBack !== 'undefined' && historyBack == true) {
    history.go(-1);
  }
  if(browserState.length > 0) {
    var entry = browserState.pop();
    if(entry.type == 'mobile-menu') {
      g_app.textModeEditor.mobileMenu.hideMenu();
    }

    return entry;
  }
  return null;
  */
}

UI.browserOnPopState = function(event)  {
  /*
  console.log('browser pop state');
  var entry = UI.browserPopState();
  */
}



UI.get = function(id) {
  if(UI.ids.hasOwnProperty(id)) {
    return UI.ids[id];
  } else {
    return null;
  }
}

UI.exists = function(componentID) {
  return UI.ids.hasOwnProperty(componentID);
}


UI.registerComponentType = function(name, component) {
  this.componentTypes[name] = component;
}

UI.removeID = function(id) {
  if(UI.ids.hasOwnProperty(id)) {
    UI.ids[id] = null;
  }
}

UI.create = function(componentType, args) {
  if(!args) {
    args = new Object();
  }

  var component = null;
  if(this.componentTypes.hasOwnProperty(componentType)) {
    component = new this.componentTypes[componentType](args);
    component.id = UI.getID();
    component.ui_type = componentType;
    UI.components[component.id] = component;

    component.uiID = null;
    if(typeof args.id !== 'undefined') {
      if(UI.ids.hasOwnProperty(args.id) && UI.ids[args.id] != null) {
        alert("UI: You have multiple components with id: " + args.id);
      }
      UI.ids[args.id] = component;
      component.uiID = args.id;
    }

    if(typeof component.setVisible == 'undefined') {
      component.setVisible = function(visible) {
        if(visible == true) {
          $('#' + this.id).show();
        } else {
          $('#' + this.id).hide();
        }
      }   
    }

    if(typeof component.getVisible == 'undefined') {
      component.getVisible = function() {
        return $('#' + this.id).css('display') != 'none';
      }
    }

    component.uiEvents = Object();

    if(typeof component.on == 'undefined') {
      component.on = function(eventName, eventHandler) {
        this['uievent_' + eventName] = eventHandler;
      }
    }

    if(typeof component.off == 'undefined') {
      component.off = function(eventName) {
        this['uievent_' + eventName] = null;
      }
    }

    if(typeof component.trigger == 'undefined') {
      component.trigger = function(eventName, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        if( this.hasOwnProperty('uievent_' + eventName)) {
          return this['uievent_' + eventName](arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10);
        }
      }
    }

    if(typeof component.getOffset == 'undefined') {
      component.getOffset = function() {
        return $('#' + this.id).offset();
      }
    }


    if(component.init) {
      component.init(args);
    }
    
  } else {
    alert("UI: Unknown type: '" + componentType + "'");
  }
  return component;

}


UI.add = function(component) {
  UI.primaryComponent = component;
}

UI.addWindow = function(component) {
  UI.windows.push(component);
}


UI.showPopup = function(thePopup, x, y) {
  var popupX = UI.mouseX;
  var popupY = UI.mouseY;
  if(typeof x != 'undefined') {
    popupX = x;
  }
  if(typeof y != 'undefined') {
    popupY = y;
  }

  UI.saveComponent = UI.mouseInComponent;

  var component = UI(thePopup);
  component.show(popupX, popupY);

  
  UI.popup = component;
  UI.capturedMouseComponent = component;

}

UI.hidePopup = function(thePopup) {

  if(typeof thePopup == 'undefined') {
    thePopup = UI.popup;
  }

  if(typeof thePopup == 'undefined') {
    thePopup = UI.capturedMouseComponent;
  }

  if(thePopup != null) {
    thePopup.hide();
  }
  
  UI.popup = null;
  UI.capturedMouseComponent = null;  
  UI.mouseDownInComponent = null;//false;
  UI.mouseInComponent = null;

  
}

UI.dialogStack = [];

UI.showDialog = function(theDialog) {
  if(typeof(theDialog) == 'string') {
    theDialog = UI.get(theDialog);
  }
  UI.dialogStack.push(theDialog);
  theDialog.show();

  UI.mouseInComponent = theDialog;
  UI.canProcessMenuKeys = false;

}

UI.closeDialog = function(theDialog) {
  if(UI.dialogStack.length == 0) {
    return;
  }
  if(typeof theDialog == 'undefined') {
    theDialog = UI.dialogStack[UI.dialogStack.length - 1];
  }
  if(typeof(theDialog) == 'string') {
    theDialog = UI.get(theDialog);
  }

  UI.dialogStack.splice(UI.dialogStack.length - 1, 1);
  UI.mouseDownInComponent = null;//false;
  UI.mouseInComponent = null;
  if(UI.dialogStack.length == 0) {
    UI.canProcessMenuKeys = true;
  }
  theDialog.close();
}

UI.closeAllDialogs = function() {
  var c = 0;
  while(UI.dialogStack.length > 0) {
    c++;
    if(c > 100) {
      break;
    }
    UI.closeDialog();
  }
}

UI.runReadyFunctions = function() {
    for(var i = 0; i < UI.readyFunctions.length; i++) {
      UI.readyFunctions[i]();
    }
    UI.readyFunctions = new Array();
}


UI.setAllowBrowserEditOperations = function(set) {
  UI.browserEditOperations = set;
}


UI.getMouseIsCaptured = function() {
  return  UI.capturedMouseComponent != null;
}

UI.captureMouse = function(component, args) {
  /*
  if(typeof args  === 'undefined') {
    args = {};
  }

  if(typeof args.cursor === 'undefined') {
    args.cursor = UI.currentCursor;//'default';
  }

  if(typeof args.addLayer === 'undefined') {
    args.addLayer = true;
  }
  */


  var cursor = UI.currentCursorDefinition;
  if(typeof args != 'undefined') {
    if(typeof args.cursor != 'undefined') {
      cursor = args.cursor;
    }
  }
  if (document.all) {
    document.onselectstart = function () { return false; };
  }


//  if(args.addLayer) {
//
  $('#ui').append('<div id="uimousecapture" style=" position: absolute; top: 0; left: 0; bottom: 0; right: 0; z-index: 10000; cursor: ' + cursor + '"></div>');
//  }

  UI.capturedMouseComponent = component;


  function capturedMouseDown(event) {
    if(UI.capturedMouseComponent != null && typeof UI.capturedMouseComponent.mouseDown != 'undefined') {
      UI.capturedMouseComponent.mouseDown(event);
    }
  }


  function capturedMouseMove(event) {
    if(UI.capturedMouseComponent != null && typeof UI.capturedMouseComponent.mouseMove != 'undefined') {
      UI.capturedMouseComponent.mouseMove(event);
    }
  }

  function capturedMouseUp(event) {
    var capturedComponent = UI.capturedMouseComponent;
    UI.releaseMouse();

    window.removeEventListener('mousedown', capturedMouseDown, { capture: true, passive: false});
    window.removeEventListener('mousemove', capturedMouseMove, { capture: true, passive: false});
    window.removeEventListener('mouseup', capturedMouseUp, { capture: true, passive: false});

    if(capturedComponent != null && typeof capturedComponent.mouseUp != 'undefined') {
      capturedComponent.mouseUp(event);
    }

  }

  window.addEventListener('mousedown', capturedMouseDown, { capture: true, passive: false }); 

  window.addEventListener('mousemove', capturedMouseMove, { capture: true, passive: false }); 

  window.addEventListener('mouseup', capturedMouseUp, { capture: true, passive: false }); 


}

UI.releaseMouse = function() {
  $('#uimousecapture').remove();
  UI.capturedMouseComponent = null;

  if (document.all) {
    document.onselectstart = null;
  }
}

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;


var scene = null;

UI.setWebGLEnabled = function(enabled) {
  UI.webGLEnabled = enabled;
  if(!enabled) {
    $('#WebGL-output').hide();
  } else {
    $('#WebGL-output').show();

  }
}

UI.init3d = function() {

  UI.renderer = new THREE.WebGLRenderer({ antialias: true });
  UI.renderer.setSize( window.innerWidth, window.innerHeight );
  UI.renderer.shadowMap.enabled = false;
  UI.renderer.shadowMap.type = THREE.PCFShadowMap;

  $('#WebGL-output').append(UI.renderer.domElement);
//  UI.setWebGLEnabled(true);

  UI.stats = new Stats();
  UI.stats.setMode(0);
  UI.stats.domElement.style.position = 'absolute';
  UI.stats.domElement.style.right = '0px';
  UI.stats.domElement.style.top = '0px';
  $('#Stats-output').append(UI.stats.domElement);

return;

  scene = new THREE.Scene();


  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  $('#WebGL-output').append(UI.renderer.domElement);

  
/*
  UI.stats = new Stats();
  UI.stats.setMode(0);
  UI.stats.domElement.style.position = 'absolute';
  UI.stats.domElement.style.right = '0px';
  UI.stats.domElement.style.top = '0px';
  $('#Stats-output').append(UI.stats.domElement);
*/

// temporary lights..
  var light = new THREE.DirectionalLight( 0x0a0a0a, 1);

  light.position.set( -800, 400, -1500 );
  light.target.position.set( 0, 0, 0 );
  light.castShadow = false;
  light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
  light.shadow.bias = -0.00007;
  light.shadow.mapSize.width = SHADOW_MAP_WIDTH * 2;
  light.shadow.mapSize.height = SHADOW_MAP_HEIGHT * 2;
  light.shadow.camera.zoom = 12;

  scene.add( light );


  var light = new THREE.AmbientLight( 0x555555 ); // soft white light
  scene.add( light );


  var light = new THREE.DirectionalLight( 0xffffff, 1);

  light.position.set( 1000, 1000, 1500 );
  light.target.position.set( 0, 0, 0 );
  light.castShadow = false;
  light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
  light.shadow.bias = -0.00007;
  light.shadow.mapSize.width = SHADOW_MAP_WIDTH * 2;
  light.shadow.mapSize.height = SHADOW_MAP_HEIGHT * 2;
  light.shadow.camera.zoom = 12;

  scene.add( light );

  var lights = [];
  lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
  lights[ 1 ] = new THREE.PointLight( 0xffffff, 0.8, 0 );
  lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

  lights[ 0 ].position.set( 0, 200, 0 );
  lights[ 1 ].position.set( 100, 200, 100 );
  lights[ 2 ].position.set( - 100, - 200, - 100 );

  UI.setWebGLEnabled(true);
}

UI.webGLComponents = [];
UI.canvasComponents = [];
UI.menuComponents = [];

UI.canvasRender = function() {
  if(UI.dialogStack.length > 0) {
    return;
  }
  for(var i = 0; i < UI.canvasComponents.length; i++) {
    UI.canvasComponents[i].render();
  }
}
UI.webGLRender = function() {
  if(UI.dialogStack.length > 0) {
    return;
  }

  if(UI.webGLEnabled === false) {
    return;
  }
  for(var i = 0; i < UI.webGLComponents.length; i++) {
    UI.webGLComponents[i].render();
  }
}

UI.getScreenWidth = function() {
  return $(window).width();
//  return window.innerWidth;
}

UI.getScreenHeight = function() {
  return $(window).height();
//  return window.innerHeight;
}

UI.blur = function(event) {
  if(this.onBlur) {
    this.onBlur(event);
  }
}
UI.focus = function(event) {
  if(this.onFocus) {
    this.onFocus(event);
  }
}
UI.resize = function() {
  if(UI.vrMode) {
    UI.vrEditor.resize();
    return;
  }

  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;

  if(SCREEN_WIDTH % 2) {
    SCREEN_WIDTH -= 1;
  }

  if(SCREEN_HEIGHT % 2) {
    SCREEN_HEIGHT -= 1;
  }
 

  UI.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);    

  //this.layout();
  if(UI.primaryComponent && typeof UI.primaryComponent.resize != 'undefined') {
    UI.primaryComponent.resize();
  }
}


UI.contextMenu = function(event) {
  if(UI.mouseInComponent && typeof UI.mouseInComponent.contextMenu != 'undefined')  {
    UI.mouseInComponent.contextMenu(event);
  } else {
    if(!UI.mouseInComponent) {
      event.preventDefault();
    } else {
    }
  }
}


UI.doubleClick = function(event) {
  if(UI.mouseInComponent) {
    if(typeof UI.mouseInComponent.doubleClick != 'undefined') {
      UI.mouseInComponent.doubleClick(event);
    }

    // TODO: need to take into account which button
    UI.mouseDownInComponent = UI.mouseInComponent;
  }
}
/*
    $('.ui-mouseevents').on('mouseenter', function(event) {
      if(UI.mouseDownInComponent) {
        return;
      }

      var id = $(this).attr('id');
*/

UI.composedPath = function(el) {
  var path = [];

  while(el) {
    path.push(el);

    if(el.tagName === "HTML") {
      path.push(document);
      path.push(window);
      return path;
    }
    el = el.parentElement;
  }
}


UI.elementToComponent = function(element) {
  var path = UI.composedPath(element);
  if(path) {
    for(var i = 0; i < path.length; i++) {
      var id = path[i].id;
      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        if(component) {
          return component;
        }
      }
    }
  }
  return null;
}

UI.findMouseInComponent = function(event) {
  // set the element the mouse was down in
  //
  var path = event.path || (event.composedPath && event.composedPath()) || UI.composedPath(event.target);

  if(path) {

    for(var i = 0; i < path.length; i++) {
      var id = path[i].id;
      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        UI.mouseInComponent = component;
        break;
      }
    }
  }
},


UI.keyDown = function(event) {
  if(true) {//UI.canProcessKeyEvents) {

    var keyCode = event.keyCode;
    if(keyCode == 9) { // tab
  //    return;
    }
    var c = String.fromCharCode(keyCode).toLowerCase();

    // if not mac need to use control
    var cmdDown = event.metaKey;
    var ctrlDown = event.ctrlKey;
    var shiftDown = event.shiftKey;


    if( (cmdDown || ctrlDown) && (c == 'c' || c == 'x' || c == 'z' || c == 'v' || c == 'a')) {
      if(UI.browserEditOperations) {
        // is a browser edit operation..
        return;
      }
    }


    if(UI.canProcessMenuKeys) {
      for(var i = 0; i < this.menuComponents.length; i++) {
        if(this.menuComponents[i].keyDown(event)) {
          event.preventDefault();
          return;
        }
      }
    }


    if(UI.popup !== null) {
      UI.popup.trigger('keydown', event);
      return;
    }


    if(UI.dialogStack.length > 0) {
      UI.dialogStack[UI.dialogStack.length - 1].trigger('keydown', event);
      return;
    }
  }

  if(typeof UI.onKeyDown != 'undefined' && UI.onKeyDown !== null) {
    return UI.onKeyDown(event);
  }
  return false;
}

UI.keyUp = function(event) {
  if(true) {//UI.canProcessKeyEvents) {


    var keyCode = event.keyCode;
    if(keyCode == 9) { // tab
      //return;
    }

    if(UI.canProcessMenuKeys) {

      for(var i = 0; i < this.menuComponents.length; i++) {
        if(this.menuComponents[i].keyUp(event)) {
          event.preventDefault();
          return;
        }
      }
    }

    if(UI.popup !== null) {
      UI.popup.trigger('keyup', event);
      return;
    }

    if(UI.dialogStack.length > 0) {
      UI.dialogStack[UI.dialogStack.length - 1].trigger('keyup', event);
      return;
    }
  }

  if(UI.onKeyUp) {
    return UI.onKeyUp(event);
  }
  return false;
}

UI.keyPress = function(event) {
  if(true) {//UI.canProcessKeyEvents) {

    
    if(UI.canProcessKeyEvents) {
      for(var i = 0; i < this.menuComponents.length; i++) {
        if(this.menuComponents[i].keyPress(event)) {
          event.preventDefault();
          return;
        }
      }
    }

    if(UI.popup !== null) {
      UI.popup.trigger('keypress', event);
    }

    if(UI.dialogStack.length > 0) {
      UI.dialogStack[UI.dialogStack.length - 1].trigger('keypress', event);
      return;
    }
  }

  if(UI.onKeyPress) {
    return UI.onKeyPress(event);
  }
  return false;
}


/*
UI.touchStart = function(e) {

  var event = {};


  if(typeof event.offsetX === 'undefined') {
    event.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;     
    event.offsetY = e.touches[0].pageY - e.touches[0].target.offsetTop;
  } else {
    event.offsetX = e.touches[0].offsetX;
    event.offsetY = e.touches[0].offsetY;
  }
  event.button = 0;
//  event.offsetX = e.touches[0].offsetX;
//  event.offsetY = e.touches[0].offsetY;
  event.clientX = e.touches[0].pageX;
  event.clientY = e.touches[0].pageY;
  event.pageX = e.touches[0].pageX;
  event.pageY = e.touches[0].pageY;
  event.target = e.touches[0].target;
  event.path = e.touches[0].path || (e.touches[0].composedPath && e.touches[0].composedPath()) || UI.composedPath(e.touches[0].target);

  this.mouseDown(event);


}
UI.touchMove = function(e) {
  var event = {};
  if(typeof event.offsetX === 'undefined') {
    event.offsetX = e.touches[0].pageX - e.touches[0].target.offsetLeft;
    event.offsetY = e.touches[0].pageY - e.touches[0].target.offsetTop;
  } else {
    event.offsetX = e.touches[0].offsetX;
    event.offsetY = e.touches[0].offsetY;
  }

  event.clientX = e.touches[0].pageX;
  event.clientY = e.touches[0].pageY;
  event.pageX = e.touches[0].pageX;
  event.pageY = e.touches[0].pageY;
  event.target = e.touches[0].target;


  this.mouseMove(event);


}

UI.touchEnd = function(e) {
  var event = {};
  event.button = 0;
  event.offsetX = e.touches[0].offsetX;
  event.offsetY = e.touches[0].offsetY;
  event.clientX = e.touches[0].pageX;
  event.clientY = e.touches[0].pageY;
  event.pageX = e.touches[0].pageX;
  event.pageY = e.touches[0].pageY;

  this.mouseUp(event);

}
*/
UI.cut = function(event) {
}

UI.copy = function(event) {

}

UI.paste = function(event) {

}


UI.setOperatingSystem = function() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

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

  UI.os = os;
}

UI.setOperatingSystem();



UI.loadScript = function(scriptSrc, callback) {
  var tagName = 'script';

  var id = scriptSrc.replace("/", "-");


  var js, fjs = document.getElementsByTagName(tagName);

  fjs = fjs[fjs.length-1];

  if (document.getElementById(id)) { 
    if(callback) {
      callback();
    }
    return; 
  }

  js = document.createElement(tagName); 
  js.id = id;

  js.onload = function(){
//      alert(scriptSrc);
      // remote script has loaded
      if(callback) {
        callback();
      }
  };

  js.src = scriptSrc;

  fjs.parentNode.insertBefore(js, fjs);    
}


UI.requireScripts = function(scripts, callback) {
  var numScripts = scripts.length;
  var scriptsLoaded = 0;
  for(var i = 0; i < scripts.length; i++) {
    UI.loadScript(scripts[i], function() {
      scriptsLoaded++;
      if(numScripts == scriptsLoaded && callback) {
        callback();
      }
    });
  }

}

UI.getCursor = function() {
  return UI.currentCursor;
}

UI.setCursor = function(cursorType) {
  if(UI.isMobile.any()) {
    return;
  }



  if(cursorType != UI.currentCursor) {
    
    UI.currentCursor = cursorType;
    UI.currentCursorDefinition = cursorType;

    var cursorDefinition = cursorType;
    switch(cursorType) {
      case 'not-allowed':
        cursorDefinition = 'not-allowed';
      break;
      case 'draw':
        cursorDefinition = 'none';
//        cursorDefinition = 'url(cursors/pen.png) 0 0, pointer';
        cursorDefinition = 'url(cursors/pencil.png) 0 23, pointer';
        cursorDefinition = 'url(cursors/penciloutline.png) 0 15, pointer';
      break;
      case 'erase':
        cursorDefinition = 'url(cursors/eraser.png) 2 14, pointer';
      break;
      case 'text':
        cursorDefinition = 'text';
      break;


      case 'zoom':
        cursorDefinition = 'url(cursors/zoom.png) 2 14, pointer';
      break;


      case 'can-move':
        cursorDefinition = 'url(cursors/move.png) 2 2, pointer';

      break;
      case 'move':
        cursorDefinition = 'url(cursors/move.png) 2 2, pointer';
      break;

      case 'can-drag-scroll':
        cursorDefinition = 'url(cursors/openhand.png) 2 14, pointer';
        //cursorDefinition = 'grab';
      break;
      case 'drag-scroll':

        cursorDefinition = 'url(cursors/closedhand.png) 2 14, pointer';
        //cursorDefinition = 'grabbing';
      break;


      case 'can-drag':
        cursorDefinition = 'url(cursors/openhand.png) 2 14, pointer';
      break;
      case 'drag':
        cursorDefinition = 'url(cursors/closedhand.png) 2 14, pointer';
      break;

      case 'can-drag-selection-outline':
        cursorDefinition = 'url(cursors/openhand.png) 2 14, pointer';
      break;
      case 'drag-selection-outline':
        cursorDefinition = 'url(cursors/closedhand.png) 2 14, pointer';
      break;

      case 'fill':
        cursorDefinition = 'url(cursors/fill16.png) 17 14, pointer';
      break;
      case 'eyedropper':
//        cursorDefinition = 'url(cursors/eyedropper16.png) 2 16, pointer';
        cursorDefinition = 'url(cursors/eyedropper.png) 2 20, pointer';
//        cursorDefinition = 'url(cursors/eyedropperoutline.png) 1 20, pointer';
      break;
      case 'crosshair':
        cursorDefinition = 'crosshair';
        break;
      case 'pixel':
        cursorDefinition = 'url(cursors/pixel2.png) 1 20, pointer';        
      break;
      case 'box-select':
        cursorDefinition = 'crosshair';
      break;
      case 'e-resize':
        cursorDefinition = 'e-resize';
      break;
      case 'w-resize':
        cursorDefinition = 'w-resize';
      break;
      case 'ew-resize':
        cursorDefinition = 'ew-resize';
      break;
      case 'default':
        cursorDefinition = 'default';
      break;
    }

    UI.currentCursorDefinition = cursorDefinition;
    $('#WebGL-output').css('cursor',cursorDefinition);
    $('#WebGL-output canvas').css('cursor',cursorDefinition);
    $('#uimousecapture').css('cursor', cursorDefinition);
    $('.ui-webgl-panel').css('cursor', cursorDefinition);
    $('body canvas').css('cursor',cursorDefinition);

  }
  
}

/*
UI.cbHTML = function(args) {
  var style = '';
  var label = '';
  var value = '';
  var id = '';

  var html = '';

  html += '<label class="cb-container" ';
  if(style != '') {
    html += ' style="margin-right: 4px; display: inline-block";
  }
  html += '>';

  html += '<span class="cb-label">' + label + '</span>';
  html += '<input type="checkbox" value="' + value + '" class="showMouseInfo"  id="' + this.prefix + 'mouseInspect"><span class="checkmark"></span></label>';

  return html;
}
*/
UI.initEvents = function() {
  window.addEventListener('resize', function() {
    UI.resize();
  }, false);

  window.addEventListener('popstate', function(event) {
    UI.browserOnPopState(event);
  }, false);

  window.addEventListener('focus', function(event) {
    UI.focus(event);
  }, false);

  window.addEventListener('blur', function(event) {
    UI.blur(event);
  }, false);

/*
  window.addEventListener('dblclick', function(event) {
    UI.doubleClick(event);
  }, false);

  window.addEventListener('mousedown', function(event) {
    UI.mouseDown(event);
  }, false); 

  window.addEventListener('mousemove', function(event) {
    UI.mouseMove(event); 
  }, false); 

  window.addEventListener('mouseup', function(event) {
    UI.mouseUp(event);
  }, false); 
*/
  document.addEventListener('keydown', function(event) {
    UI.keyDown(event);
  }, false);

  document.addEventListener('keyup', function(event) {
    UI.keyUp(event);
  }, false);

  document.addEventListener('keypress', function(event) {
    UI.keyPress(event);
  }, false);

/*
  document.addEventListener("touchstart", function(e){
    if(e.touches.length == 1) {
      UI.touchStart(e);
    }
  }, false);

  document.addEventListener("touchmove", function(e){
    if(e.touches.length == 1) {
      UI.touchMove(e);
    }
    return false;
  }, false);

  document.addEventListener("touchend", function(e){
    if(e.touches.length == 1) {
      UI.touchEnd(e);
    }
  }, false);
*/
/*  
  document.addEventListener('contextmenu', function(event) {
//    event.preventDefault();
//    return false;
    UI.contextMenu(event);
  }, false);
*/

  document.addEventListener('undo', function(event) {
    alert('undo');
  });

  document.addEventListener('cut', function(event) {
    UI.cut();
  });
  document.addEventListener('copy', function(event) {
    UI.copy();
  });

  document.addEventListener('paste', function(event) {
    UI.paste();
  });


}

$(document).ready(function() {

  UI.ready = true;

  
  var html = '';
  html += '<div id="ui-menu-background" style="display: none; position: absolute; top: 30px; left: 0; right: 0; bottom: 0; background-color: black; z-index: 300; opacity: 0;"></div>';
  html += '<div id="Stats-output" style="display: none; position: absolute; top: 0; right: 0; z-index: 10000"></div><div id="WebGL-output"></div><div id="ui" style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow: visible" ></div>';
  html += '<textarea id="debugBox" style="display: none; position: absolute; width: 100%; bottom: 0; left: 0; right: 0; height: 400px; z-index: 4000"></textarea>';
//  html += '<canvas style="background-color: black; position: absolute; top: 20px; left: 80px; border: 2px solid red; z-index: 3000" id="debugCanvas"></canvas>';
  $('body').html(html);
  UI.init3d();
  UI.initEvents();


  if(UI.primaryComponent != null) {
    var html = UI.primaryComponent.getHTML();
    for(var i = 0; i < UI.windows.length; i++) {
      html += UI.windows[i].getHTML();
    }

/*
    html += '<div id="ui_dragcomponent" style="display: none; position: absolute; top: 0; left: 0; z-index: 2000">&nbsp;&nbsp; drag</div>';

    html += '<div id="gui-background"  class="wt-progress-background" style="text-align: center; z-index: 3000">';
    html += '<div id="formprogress" style="background-color: black; padding: 10px; border-radius: 10px; color: #999; font-size: 20px; position: absolute; top: 50%;  left: 50%; margin-top: -40px; margin-left: -150px ">';
    html += '<div id="formprogressspinner"><div id="formprogressspinnertext">Uploading...</div><img src="/wtv2/wtui/images/spinner.gif"/></div>';
    html += '<div id="formprogressbar" style="display: none">';
    var formprogress = WTUI.create("WTUI.ProgressBar", { "id": "formprogress" });
    html += formprogress.getHTML();
    html += '</div>';

    html += '</div></div>';
*/

    $('#ui').html(html);

    UI.number = new UINumber();
    UI.number.init();

    UI.slider = new UISlider();
    UI.slider.init();


    $(document).keyup(function(e) {
      if(e.which == 27) {
        
        if(g_dialogStack.length > 0) {
//          g_dialogStack[g_dialogStack.length - 1].close();
        }
      }
    });

    $('.ui-mouseevents').on('mouseenter', function(event) {
      if(UI.mouseDownInComponent) {
        return;
      }

      var id = $(this).attr('id');

      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        UI.mouseInComponent = component;

        if(typeof component.mouseEnter !== 'undefined') {
          component.mouseEnter(event);
        }
      }
    });

    $('.ui-mouseevents').on('mouseleave', function(event) {
      if(UI.mouseDownInComponent) {
        return;
      }

      var id = $(this).attr('id');
      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        UI.mouseInComponent = null;

        if(typeof component.mouseLeave !== 'undefined') {
          component.mouseLeave(event);
        }
      }
    });

    UI.runReadyFunctions();

    UI.vrMode = false;

    var g_startTime = false;
    
    function render(timestamp) {

      if(g_startTime === false) {
        g_startTime = timestamp;
      }

      g_deltaTime = timestamp - g_lastUpdate;      

//      console.log(elapsed);
      g_lastUpdate = timestamp;

      if(UI.statsEnabled) {
        UI.stats.update();
      }
      TWEEN.update();          

      if(UI.vrMode) {
        UI.vrEditor.vrEffect.requestAnimationFrame( render );
      } else {
        requestAnimationFrame( render );
      }

      if(UI.onUpdate !== null) {
        UI.onUpdate();
      }
      UI.webGLRender();
//      UI.canvasRender();
    }

    render(0);        

  }

});

// TODO: put this somewhere else
if (window.performance && window.performance.now) {
  getTimestamp = function() { return window.performance.now(); };
} else {
  if (window.performance && window.performance.webkitNow) {
    getTimestamp = function() { return window.performance.webkitNow(); };
  } else {
    getTimestamp = function() { return new Date().getTime(); };
  }
}



// TODO: put this somewhere else
function clearInputFile(f){
  if(f.value){
    try{
        f.value = ''; //for IE11, latest Chrome/Firefox/Opera...
    }catch(err){ }
    if(f.value){ //for IE5 ~ IE10
        var form = document.createElement('form'),
            parentNode = f.parentNode, ref = f.nextSibling;
        form.appendChild(f);
        form.reset();
        parentNode.insertBefore(f,ref);
    }
  }
}



// polyfill for append..
// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('append')) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();
        
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.appendChild(docFrag);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);


