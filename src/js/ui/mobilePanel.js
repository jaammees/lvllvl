
UI.MobilePanel = function(args) {


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

    this.closeButton = UI.create("UI.Button", {"text": "<span style=\"vertical-align: 2px; line-height: 10px\">x</span>", "style": "padding: 1px 4px", "cssclass": "ui-dialog-close-button" });

    this.element = this.getElement();
    document.body.append(this.element);

    $('#' + this.id + 'titlebar').on('touchmove', function(e) {
      e.preventDefault();
    });

/*
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

    */


  }

  this.add = function(component) {
    this.components.push(component);

    document.getElementById(this.id + '-content').append(component.getElement());
  }

  this.addButton = function(button) {
    var buttonsElement = document.getElementById(this.id + '-buttons');
    //if(UI.os == 'Mac OS' || UI.isMobile.any()) {
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

    if(this.mouseDownOn == 'eastresize' || this.mouseDownOn == 'northeastresize' || this.mouseDownOn == 'southeastresize') {
      this.width += xdiff;
      $('#' + this.id).css('width', this.width);
    }


    if(this.mouseDownOn == 'westresize' || this.mouseDownOn == 'northwestresize' || this.mouseDownOn == 'southwestresize') {
      this.left += xdiff;
      this.width -= xdiff;
      $('#' + this.id).css('left', this.left);
      $('#' + this.id).css('width', this.width);
    }
 
    if(this.mouseDownOn == 'northresize' || this.mouseDownOn == 'northeastresize' || this.mouseDownOn == 'northwestresize') {
      this.top += ydiff;
      this.height -= ydiff;
      $('#' + this.id).css('height', this.height);
      $('#' + this.id).css('top', this.top);
      
    }

    if(this.mouseDownOn == 'southresize' || this.mouseDownOn == 'southeastresize' || this.mouseDownOn == 'southwestresize') {
      this.height += ydiff;
      $('#' + this.id).css('height', this.height);
    }

    this.trigger('resize');
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


    if(this.mouseDownOn == 'titlebar') {
      this.top = this.top + ydiff;
      this.left = this.left + xdiff;

      $('#' + this.id).css('top', this.top + 'px');
      $('#' + this.id).css('left', this.left + 'px');
      this.mouseDownX = mouseX;
      this.mouseDownY = mouseY;
      return;
    } else if(this.mouseDownOn !== false) {
      this.resizeDialog(xdiff, ydiff);
      this.mouseDownX = mouseX;
      this.mouseDownY = mouseY;
      return;
    }

    this.trigger('mousemove', event);
  }
  
  this.mouseUp = function(event) {
    var xdiff = event.pageX - this.mouseDownX;
    var ydiff = event.pageY - this.mouseDownY;


    if(this.mouseDownOn == 'titlebar') {
      this.top = this.top + ydiff;
      this.left = this.left + xdiff;

      $('#' + this.id).css('top', this.top + 'px');
      $('#' + this.id).css('left', this.left + 'px');
      this.mouseDownOn = false;
      return;
    } else if(this.mouseDownOn !== false) {
      this.resizeDialog(xdiff, ydiff);
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
    this.element.setAttribute('class', 'ui-mobilepanel');
    this.element.setAttribute('style', 'display: none; width: ' + this.width + 'px; height: ' + this.height + 'px; top: ' + this.top + 'px; left: ' + this.left + 'px; z-index: 1000');

    this.element.innerHTML = this.getInnerHTML();

    return this.element;
  }

  this.getInnerHTML = function() {
    var html = '';

    var resizeSize = 4;
/*
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
    html += this.title + "MOBILE!!!";
    html += '    </div>';
    html += '    <div id="' + this.id + 'titlebarclose" onclick="UI.DialogClose(\'' + this.id + '\')" class="ui-dialog-titlebar-close">';
//    html += 'x';
    html += this.closeButton.getHTML();
    html += '</div>';
    html += '  </div>';
*/

    html += '  <div id="' + this.id + 'titlebar" class="ui-mobilepanel-titlebar">';

    html += '  <div class="ui-mobile-button" style="width: 48px; height: 48px; display: inline-block" onclick="UI.MobilePanelClose(\'' + this.id + '\')"><img style="; width: 42px; height: 42px" src="icons/material/ic_arrow_back_48px.svg"/></div>'
    html += '  <div id="' + this.id + 'titleheading" class="ui-mobilepanel-titlebar-heading">' + this.title + '</div>';

    html += '  <div id="' + this.id + '-buttons" class="ui-mobilepanel-titlebar-buttons">';
    for(var i = 0; i < this.buttons.length; i++) {
      html += '&nbsp;&nbsp;' + this.buttons[i].getHTML();
    }
    html += '  </div>';

    html += '  </div>';


    html += '  <div id="' + this.id + '-content" class="ui-mobilepanel-content ui-mouseevents" ';
    html += '>';

    for(var i = 0; i < this.components.length; i++ ) {
      html += this.components[i].getHTML();
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
    html += '    <div id="' + this.id + 'titlebarclose" onclick="UI.DialogClose(\'' + this.id + '\')" class="ui-mobile-button">';
//    html += 'x';
    html += this.closeButton.getHTML();
    html += '</div>';
    html += '  </div>';

    html += '  <div id="' + this.id + 'content" class="ui-mobilepanel-content" ';
    html += '>';

    for(var i = 0; i < this.components.length; i++ ) {
      html += this.components[i].getHTML();
    }

    html += '  </div>';

    html += '  <div id="' + this.id + 'buttons" class="ui-dialog-buttons" style="position: absolute; bottom:0; height: 0">';
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

    $('#' + this.id + '-background').fadeIn(1000);
    g_dialogZIndex++;

    this.width = UI.getScreenWidth();
    this.height = UI.getScreenHeight();
    $('#' + this.id).css('width', this.width + 'px');
    $('#' + this.id).css('height', this.height + 'px');

    if(true) {

      this.left = 0;
      this.top = 0;
      $('#' + this.id).css('top', this.top + 'px');
      $('#' + this.id).css('left', '-' + this.width + 'px');
      $('#' + this.id).css('z-index', g_dialogZIndex);
      g_dialogZIndex++;


      $('#' + this.id).show();
      $('#' + this.id).animate({
        left: '0px',
        top: '0px'
      }, 200, function() {});

      g_dialogZIndex++;

    } else {

     
      $('#' + this.id).css('z-index', g_dialogZIndex);
      $('#' + this.id).show();

      g_dialogZIndex++;

      
      this.left = 0;
      this.top = 0;
      $('#' + this.id).css('top', this.top + 'px');
      $('#' + this.id).css('left', this.left + 'px');
    }

    g_dialogStack.push(this);    
  }

  /**
   * <p>Close the dialog</p>
   *
   * @method close
   */
  this.close = function() {

    var _this = this;

    if(true) {
      $('#' + this.id).animate({
        left: '-' + this.width + 'px',
        top: '0px'
      }, 200, function() {
        console.log("CLOSED!");
        $('#' + this.id).hide();
        $('#' + this.id + '-background').fadeOut(100);
        _this.trigger('close');
      });


    } else {
      $('#' + this.id).hide();
      $('#' + this.id + '-background').hide();
    }

    g_dialogZIndex -= 2;
    g_dialogStack.pop();

/*
    var id = this.id;
    $('#' + id).remove();
*/

  }
}

UI.MobilePanelClose = function(id) {
//  UI.components[id].close();
  UI.closeDialog();
}

UI.registerComponentType("UI.MobilePanel", UI.MobilePanel);