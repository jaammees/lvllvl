
// TODO; fix this.

UI.DialogResizeMouseDown = function(event, whichedge, id) {
  var dialog = UI.components[id];

  dialog.mouseDownX = event.pageX;
  dialog.mouseDownY = event.pageY;

  dialog.mouseDownDialogWidth = dialog.width;
  dialog.mouseDownDialogHeight = dialog.height;
  dialog.mouseDownDialogX = dialog.left;
  dialog.mouseDownDialogY = dialog.top;

  dialog.mouseDownOn = whichedge;

  var cursor = 'default';
  switch(whichedge) {
    case 'northresize':
      cursor = 'n-resize';
      break;
    case 'northeastresize':
      cursor = 'ne-resize';
      break;
    case 'eastresize':
      cursor = 'e-resize';
      break;
    case 'southeastresize':
      cursor = 'se-resize';
      break;
    case 'southresize':
      cursor = 's-resize';
      break;
    case 'southwestresize':
      cursor = 'sw-resize';
      break;
    case 'westresize':
      cursor = 'w-resize';
      break;
    case 'northwestresize':
      cursor = 'nw-resize';
      break;
  }

  UI.captureMouse(dialog, { cursor: cursor });

  return false;


}


UI.DialogTitleMouseDown = function(event, id) {

  var dialog = UI.components[id];
  dialog.mouseDownX = event.pageX;
  dialog.mouseDownY = event.pageY;

  dialog.mouseDownOn = 'titlebar';


  dialog.mouseDownDialogX = dialog.left;
  dialog.mouseDownDialogY = dialog.top;

  UI.captureMouse(dialog, {cursor: 'move' });

  return false;
  
  
}

/*
UI.DialogTitleMouseUp = function(id) {
  var dialog = UI.components[id];
  var xdiff = UI.mouseX - dialog.mouseDownX;
  var ydiff = UI.mouseY - dialog.mouseDownY;

  dialog.top = dialog.top + ydiff;
  dialog.left = dialog.left + xdiff;

  $('#' + dialog.id).css('top', dialog.top + 'px');
  $('#' + dialog.id).css('left', dialog.left + 'px');

  return false;
}
*/


var g_dialogZIndex = 1000;
var g_dialogStack = new Array();
UI.Dialog = function(args) {


  this.init = function(args) {
    this.element = null;
    this.args = args;

    this.top = 10;
    this.left = 10;

    this.width = 900;
    if(args.width) {
      this.width = args.width;
    }
    this.height = 560;
    if(args.height) {
      this.height = args.height;
    }

    this.showCloseButton = true;
    if(typeof args.showCloseButton !== 'undefined') {
      this.showCloseButton = false;
    }

    if(typeof args.fullScreen != 'undefined' && args.fullScreen) {

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();

      this.width = screenWidth - 10;// - 30;
      this.height = screenHeight - 10;

      if(typeof args.maxWidth != 'undefined' && this.width > args.maxWidth) {
        this.width = args.maxWidth;      
      }

      if(typeof args.maxHeight != 'undefined' && this.height > args.maxHeight) {
        this.height = args.maxHeight;
      }

    }

    this.mouseDownX = 0;
    this.mouseDownY = 0;
    this.mouseDownOn = false;


    this.components = new Array();
    this.buttons = new Array();


    this.closeButton = UI.create("UI.Button", 
      {"text": "<img src=\"icons/svg/glyphicons-basic-599-menu-close.svg\">", "style": "padding: 1px 4px", "cssclass": "ui-button ui-dialog-close-button ui-button-danger" });
      //{"text": "<span style=\"vertical-align: 2px; line-height: 10px\">x</span>", "style": "padding: 1px 4px", "cssclass": "ui-dialog-close-button" });

    this.element = this.getElement();
    document.body.append(this.element);

    //TODO: do this better..
    $('.ui-mouseevents').on('mouseenter', function(event) {
      var id = $(this).attr('id');

      // remove the -content from id
      id = id.replace('-content', '');

      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        UI.mouseInComponent = component;
        if(typeof component.mouseEnter !== 'undefined') {
          component.mouseEnter(event);
        }

      }
    });

    $('.ui-mouseevents').on('mouseleave', function(event) {
      var id = $(this).attr('id');

      id = id.replace('-content', '');

      if(UI.components.hasOwnProperty(id)) {
        var component = UI.components[id];
        UI.mouseInComponent = null;

        if(typeof component.mouseLeave !== 'undefined') {
          component.mouseLeave(event);
        }
      }
    });


  }

  this.add = function(component) {
    this.components.push(component);

    document.getElementById(this.id + '-content').append(component.getElement());
  }

  this.addButton = function(button) {
    var buttonsElement = document.getElementById(this.id + '-buttons');
    if( (UI.os == 'Mac OS' || UI.isMobile.any()) && typeof buttonsElement.prepend != 'undefined') {
      this.buttons.unshift(button);
      buttonsElement.prepend(button.getElement());
    } else {
//      this.buttons.push(button);
      this.buttons.push(button);
      buttonsElement.append(button.getElement());

    }

  }


  this.resizeDialog = function(xdiff, ydiff) {
    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

/*    
    dialog.mouseDownWidth = dialog.width;
    dialog.mouseDownHeight = dialog.height;
    dialog.mouseDownX = dialog.left;
    dialog.mouseDownY = dialog.top;
*/
    
    if(this.mouseDownOn == 'eastresize' || this.mouseDownOn == 'northeastresize' || this.mouseDownOn == 'southeastresize') {
      var newWidth = this.mouseDownDialogWidth + xdiff;

      if(newWidth < 160) {
        newWidth = 160;
      }

      if(this.left + newWidth < screenWidth - 12) {
        this.width = newWidth;
      } else {
        this.width = screenWidth - 12 - this.left;
      }
      $('#' + this.id).css('width', this.width);
    }


    if(this.mouseDownOn == 'westresize' || this.mouseDownOn == 'northwestresize' || this.mouseDownOn == 'southwestresize') {
      var newLeft = this.mouseDownDialogX + xdiff;

      if(newLeft > 8) {
      } else {
        xdiff = - this.mouseDownDialogX + 8;

      }
      this.left = this.mouseDownDialogX + xdiff;
      this.width = this.mouseDownDialogWidth - xdiff;

      $('#' + this.id).css('left', this.left);
      $('#' + this.id).css('width', this.width);
    }
 
    if(this.mouseDownOn == 'northresize' || this.mouseDownOn == 'northeastresize' || this.mouseDownOn == 'northwestresize') {
      var newTop = this.mouseDownDialogY + ydiff;

      if(newTop > 8) {
      } else {
        ydiff = -this.mouseDownDialogY + 8;
      }

      this.top = this.mouseDownDialogY + ydiff;
      this.height = this.mouseDownDialogHeight - ydiff;

      $('#' + this.id).css('height', this.height);
      $('#' + this.id).css('top', this.top);
    
    }

    if(this.mouseDownOn == 'southresize' || this.mouseDownOn == 'southeastresize' || this.mouseDownOn == 'southwestresize') {

      var newHeight = this.mouseDownDialogHeight + ydiff;

      if(newHeight < 80) {
        newHeight = 80;
      }

      if(this.top + newHeight < screenHeight - 12) {
        this.height = newHeight;
      } else {
        this.height = screenHeight - 12 - this.top;
      }
      $('#' + this.id).css('height', this.height);
    }

    this.trigger('resize');
    for(var i = 0; i < this.components.length; i++) {
      if(typeof this.components[i].resize != 'undefined') {
        this.components[i].resize();
      }
    }
  }

  /**
   * <p>Set the width of the dialog</p>
   *
   * @method setWidth
   * @param width {Number} The new width of the dialog
   */
  this.setWidth = function(width) {
    this.width = width;
    $('#' + this.id).css('width', this.width);
  }

  /**
   * <p>Set the height of the dialog</p>
   *
   * @method setHeight
   * @param height {Number} The new height of the dialog
   */
  this.setHeight = function(height) {
    this.height = height;
    $('#' + this.id).css('height', this.height);
  }

  this.mouseDown = function(event) {
    this.trigger('mousedown', event);
  }

  this.mouseMove = function(event) {

    var mouseX = event.pageX;
    var mouseY = event.pageY;

    var xdiff = event.pageX - this.mouseDownX;
    var ydiff = event.pageY - this.mouseDownY;

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();


    if(this.mouseDownOn == 'titlebar') {
      
      

      if(this.mouseDownDialogY + ydiff > 4) {
        if(this.mouseDownDialogY + this.height + ydiff < screenHeight - 12) {
          this.top = this.mouseDownDialogY + ydiff;
        } else {
          this.top = screenHeight - 12 - this.height;
        }
      } else {
        this.top = 4;
      }
      $('#' + this.id).css('top', this.top + 'px');

      if(this.mouseDownDialogX + xdiff > 4 ) {
        if(this.mouseDownDialogX + this.width + xdiff < screenWidth - 12) {
          this.left = this.mouseDownDialogX + xdiff;
        } else {
          this.left = screenWidth - 12 - this.width;
        }
      } else {
        this.left = 4;
      }

      $('#' + this.id).css('left', this.left + 'px');

//      this.mouseDownX = mouseX;
//      this.mouseDownY = mouseY;

      return;
    } else if(this.mouseDownOn !== false) {
      this.resizeDialog(xdiff, ydiff);
//      this.mouseDownX = mouseX;
//      this.mouseDownY = mouseY;
      return;
    }


    this.trigger('mousemove', event);
  }
  
  this.mouseUp = function(event) {
    var xdiff = event.pageX - this.mouseDownX;
    var ydiff = event.pageY - this.mouseDownY;


    if(this.mouseDownOn == 'titlebar') {
      /*
      this.top = this.top + ydiff;
      this.left = this.left + xdiff;

      $('#' + this.id).css('top', this.top + 'px');
      $('#' + this.id).css('left', this.left + 'px');
      */
      this.mouseDownOn = false;
      return;
    } else if(this.mouseDownOn !== false) {
//      this.resizeDialog(xdiff, ydiff);
      this.mouseDownOn = false;
      return;
    }

    this.trigger('mouseup', event);
    this.mouseDownOn = false;
  }

  this.title = "New Window";
  if(args.title) {
    this.title = args.title;
  }

  this.getElement = function() {
    if(this.element) {
      // has already been created..
      return this.element;
    }

    this.backgroundElement = document.createElement('div');
    this.backgroundElement.setAttribute('id', this.id + '-background');
//    this.backgroundElement.setAttribute('style', 'display: none;  position: absolute; top: 0; left: 0; bottom: 0; right: 0');
    this.backgroundElement.setAttribute('class', 'ui-dialog-background');
    document.body.append(this.backgroundElement);

    this.element = document.createElement('div');
    this.element.setAttribute('id', this.id);
    this.element.setAttribute('class', 'ui-dialog');
    this.element.setAttribute('style', 'display: none; width: ' + this.width + 'px; height: ' + this.height + 'px; top: ' + this.top + 'px; left: ' + this.left + 'px; z-index: 1000');

    this.element.innerHTML = this.getInnerHTML();

    return this.element;
  }

  this.getInnerHTML = function() {
    var html = '';

    var resizeSize = 4;

    html += '  <div id="' + this.id + 'northresize" onmousedown="return UI.DialogResizeMouseDown(event, \'northresize\', \'' + this.id + '\')" style=" position: absolute; top: 0; left: ' + resizeSize+ 'px; right: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: n-resize"></div>';

    html += '  <div id="' + this.id + 'northeastresize" onmousedown="return UI.DialogResizeMouseDown(event, \'northeastresize\', \'' + this.id + '\')" style="position: absolute; top: 0; right: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: ne-resize"></div>';

    html += '  <div id="' + this.id + 'eastresize" onmousedown="return UI.DialogResizeMouseDown(event, \'eastresize\', \'' + this.id + '\')" style=" position: absolute; top: ' + resizeSize + 'px; bottom: ' + resizeSize + 'px; right: 0px; width: ' + resizeSize + 'px; cursor: e-resize"></div>';

    html += '  <div id="' + this.id + 'southeastresize" onmousedown="return UI.DialogResizeMouseDown(event, \'southeastresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; right: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: se-resize"></div>';

    html += '  <div id="' + this.id + 'southresize" onmousedown="return UI.DialogResizeMouseDown(event, \'southresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; left: ' + resizeSize + 'px; right: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: s-resize"></div>';

    html += '  <div id="' + this.id + 'southwestresize" onmousedown="return UI.DialogResizeMouseDown(event, \'southwestresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; left: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: sw-resize"></div>';

    html += '  <div id="' + this.id + 'westresize" onmousedown="return UI.DialogResizeMouseDown(event, \'westresize\', \'' + this.id + '\')" style="position: absolute; top: ' + resizeSize + 'px; bottom: ' + resizeSize + 'px; left: 0px; width: ' + resizeSize + 'px; cursor: w-resize"></div>';

    html += '  <div id="' + this.id + 'northwestresize" onmousedown="return UI.DialogResizeMouseDown(event, \'northwestresize\', \'' + this.id + '\')" style=" position: absolute; top: 0; left: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: nw-resize"></div>';

    html += '  <div id="' + this.id + 'titlebar" class="ui-dialog-titlebar">';
    html += '    <div id="' + this.id + 'titlebaricon" class="ui-dialog-titlebar-icon">o</div>'; 
    html += '    <div id="' + this.id + 'titleheading" class="ui-dialog-titlebar-heading" onmousedown="return UI.DialogTitleMouseDown(event, \'' + this.id + '\')" >';
    html += this.title;
    html += '    </div>';
    html += '    <div id="' + this.id + 'titlebarclose" onclick="UI.DialogClose(\'' + this.id + '\')" class="ui-dialog-titlebar-close">';
//    html += 'x';

    if(this.showCloseButton) {
      html += this.closeButton.getHTML();
    }
    html += '    </div>';
    html += '  </div>';

    html += '  <div id="' + this.id + '-content" class="ui-dialog-content ui-mouseevents" ';
    html += '>';

    for(var i = 0; i < this.components.length; i++ ) {
      html += this.components[i].getHTML();
    }

    html += '  </div>';

    html += '  <div id="' + this.id + '-buttons" class="ui-dialog-buttons" >';
//    html += '<div style="padding-bottom: 5px; padding-right: 30px; right: 0px; bottom: 0px; position: absolute">';
    for(var i = 0; i < this.buttons.length; i++) {
      html += '&nbsp;&nbsp;' + this.buttons[i].getHTML();
    }
    html += '  </div>';

    return html;
  }

  this.getHTML = function() {
    var html = '';

    html += '<div id="' + this.id + '-background" class="ui-dialog-background"></div>';
    html += '<div id="' + this.id + '" class="ui-dialog" style="display: none; width: ' + this.width + 'px; height: ' + this.height + 'px; top: ' + this.top + 'px; left: ' + this.left + 'px; z-index: 1000">';

    var resizeSize = 4;

    html += '  <div id="' + this.id + 'northresize" onmousedown="return UI.DialogResizeMouseDown(\'northresize\', \'' + this.id + '\')" style=" position: absolute; top: 0; left: ' + resizeSize+ 'px; right: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: n-resize"></div>';

    html += '  <div id="' + this.id + 'northeastresize" onmousedown="return UI.DialogResizeMouseDown(\'northeastresize\', \'' + this.id + '\')" style="position: absolute; top: 0; right: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: ne-resize"></div>';

    html += '  <div id="' + this.id + 'eastresize" onmousedown="return UI.DialogResizeMouseDown(\'eastresize\', \'' + this.id + '\')" style=" position: absolute; top: ' + resizeSize + 'px; bottom: ' + resizeSize + 'px; right: 0px; width: ' + resizeSize + 'px; cursor: e-resize"></div>';

    html += '  <div id="' + this.id + 'southeastresize" onmousedown="return UI.DialogResizeMouseDown(\'southeastresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; right: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: se-resize"></div>';

    html += '  <div id="' + this.id + 'southresize" onmousedown="return UI.DialogResizeMouseDown(\'southresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; left: ' + resizeSize + 'px; right: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: s-resize"></div>';

    html += '  <div id="' + this.id + 'southwestresize" onmousedown="return UI.DialogResizeMouseDown(\'southwestresize\', \'' + this.id + '\')" style="position: absolute; bottom: 0; left: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: sw-resize"></div>';

    html += '  <div id="' + this.id + 'westresize" onmousedown="return UI.DialogResizeMouseDown(\'westresize\', \'' + this.id + '\')" style="position: absolute; top: ' + resizeSize + 'px; bottom: ' + resizeSize + 'px; left: 0px; width: ' + resizeSize + 'px; cursor: w-resize"></div>';

    html += '  <div id="' + this.id + 'northwestresize" onmousedown="return UI.DialogResizeMouseDown(\'northwestresize\', \'' + this.id + '\')" style=" position: absolute; top: 0; left: 0; width: ' + resizeSize + 'px; height: ' + resizeSize + 'px; cursor: nw-resize"></div>';

    html += '  <div id="' + this.id + 'titlebar" class="ui-dialog-titlebar">';
    html += '    <div id="' + this.id + 'titlebaricon" class="ui-dialog-titlebar-icon">o</div>'; 
    html += '    <div id="' + this.id + 'titleheading" class="ui-dialog-titlebar-heading" onmousedown="return UI.DialogTitleMouseDown(\'' + this.id + '\')" >';
    html += this.title;
    html += '    </div>';
    html += '    <div id="' + this.id + 'titlebarclose" onclick="UI.DialogClose(\'' + this.id + '\')" class="ui-dialog-titlebar-close">';
//    html += 'x';

    if(this.showCloseButton) {
      html += this.closeButton.getHTML();
    }
    html += '</div>';
    html += '  </div>';

    html += '  <div id="' + this.id + 'content" class="ui-dialog-content" ';
    html += '>';

    for(var i = 0; i < this.components.length; i++ ) {
      html += this.components[i].getHTML();
    }

    html += '  </div>';

    html += '  <div id="' + this.id + 'buttons" class="ui-dialog-buttons" >';
//    html += '<div style="padding-bottom: 5px; padding-right: 30px; right: 0px; bottom: 0px; position: absolute">';
    for(var i = 0; i < this.buttons.length; i++) {
      html += '&nbsp;&nbsp;' + this.buttons[i].getHTML();
    }
    html += '  </div>';
    html += '</div>';

    return html;
  }

  this.fitContent = function() {
    //TODO: add this
  }

  /**
   * <p>Set the title for the dialog</p>
   *
   * @method setText
   * @param text {String}  The text for the title
   */
  this.setTitle = function(title) {
    this.title = title;
    $('#' + this.id + 'titleheading').html(title);
  }

  /**
   * <p>Show the dialog if it is not visible </p>
   *
   * @method show
   */
  this.show = function() {

    $('#' + this.id  + '-background').css('z-index', g_dialogZIndex);
    //$('#' + this.id + '-background').show();
    $('#' + this.id + '-background').fadeIn(200);
   
    g_dialogZIndex++;
    $('#' + this.id).css('z-index', g_dialogZIndex);
    $('#' + this.id).fadeIn(100);
    //$('#' + this.id).show();

    g_dialogZIndex++;

    
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var dialogWidth = this.width;
    var dialogHeight = this.height;
    if(UI.isMobile.any()) {
      this.top = 00;


      this.top = 40;//Math.floor((windowHeight - dialogHeight) / 3.6);
      if(this.top < 15) {
        this.top = 0;
      }
      
      dialogWidth += 10;

    } else {
      this.top = 20;
    }
    this.left = (windowWidth - dialogWidth) / 2;



    if(this.top + dialogHeight > windowHeight && windowHeight > 300) {
      this.height = windowHeight - 30;
      $('#' + this.id).css('height', this.height);
      
    }

    if(this.left + dialogWidth > windowWidth && windowWidth > 300) {
      this.width = windowWidth - 38;
      this.left = 15;
      $('#' + this.id).css('width', this.width);
      
    }    

    $('#' + this.id).css('top', this.top + 'px');
    $('#' + this.id).css('left', this.left + 'px');

    // TODO: doing this also in UI ??
    g_dialogStack.push(this);
    
  }

  /**
   * <p>Close the dialog</p>
   *
   * @method close
   */
  this.close = function() {
    this.trigger('close');

    //$('#' + this.id + '-background').hide();
    $('#' + this.id + '-background').fadeOut(200);
    //$('#' + this.id).hide();
    $('#' + this.id).fadeOut(100);

    g_dialogZIndex -= 2;
    g_dialogStack.pop();

/*
    var id = this.id;
    $('#' + id).remove();
*/

  }
}


UI.DialogClose = function(id) {
//  UI.components[id].close();
  UI.closeDialog();
}

UI.registerComponentType("UI.Dialog", UI.Dialog);