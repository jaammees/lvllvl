UI.Popup = function() {

  this.components = new Array();
  this.backgroundElement = null;
  this.element = null;

  this.init = function(args) {
    this.cssclass = null;
    if(args.cssclass) {
      this.cssclass = args.cssclass;
    }

    this.style = null;
    if(args.style) {
      this.style = args.style;
    }

    this.visible = true;
    if(typeof(args.visible) != 'undefined') {
      this.visible = args.visible;
      if(!this.visible) {
        this.style += ';display: none';
      }
    }

    this.backgroundElement = document.createElement('div');
    this.backgroundElement.setAttribute('id', this.id + '-background');
    this.backgroundElement.setAttribute('style', 'display: none;  position: absolute; top: 0; left: 0; bottom: 0; right: 0');

    var _this = this;
    document.body.append(this.backgroundElement);

    /*
    this.backgroundElement.onclick = function(event) {
      UI.hidePopup(_this);
    };
    */

    this.backgroundElement.addEventListener('click', function(event) {

      event.preventDefault();
      UI.hidePopup(_this);
    }, true);

    this.backgroundElement.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, true);

    this.backgroundElement.addEventListener('mousewheel', function(event) {
      event.preventDefault();
    }, false);



    var width = 100;
    if(typeof args.width != 'undefined') {
      width = args.width;
    }

    var height = 100;
    if(typeof args.height != 'undefined') {
      height = args.height;
    }

    this.element = document.createElement('div');
    this.element.setAttribute('id', this.id);

    if(height === false || height == 'auto') {
      this.element.setAttribute('style', 'display: none; position: absolute; top: 0; left: 0;  width: ' + width + 'px; ');
    } else {
      this.element.setAttribute('style', 'display: none; position: absolute; top: 0; left: 0;  width: ' + width + 'px; height: ' + height + 'px');
    }
    this.element.setAttribute('class', 'ui-popup');
    document.body.append(this.element);
  }

  /**
   * Add a component to the panel
   *
   * @method add
   * @param component {Object} The component to add to the panel
   */

  this.add = function(component) {
    if(component) {
      this.components.push(component);
      if(UI.ready) {

        var thisElement = document.getElementById(this.id);
        thisElement.appendChild(component.getElement());
      }
    }
  }

  this.setDimensions = function(width, height) {
    if(this.element) {
      this.element.style.width = width + 'px';
      if(height === false || height == 'auto') {
        this.element.style.height = 'auto';
      } else {
        this.element.style.height = height + 'px';
      }
      this.resize();
    }
  }

  this.resize = function() {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].resize) {
        this.components[i].resize();
      }
    }
  }

  this.show = function(x, y) {
    this.backgroundElement.style.display = 'block';
    this.backgroundElement.style.zIndex = 1010;
    
    //this.element.style.display = 'block';
    this.element.style.left = x + 'px';
    this.element.style.top = y + 'px';
    this.element.style.zIndex = 2000;

    this.fitOnScreen(x, y);
    $('#' + this.element.id).fadeIn(60);
  }

  this.hide = function() {
    this.backgroundElement.style.display = 'none';
    $('#' + this.element.id).fadeOut(60); 

    this.trigger('close');
    //this.element.style.display = 'none';    
  }

  this.fitOnScreen = function(x, y) {
   // return;
    var position = $('#' + this.id).offset();
    var left = position.left;
    var top = position.top;

    if(typeof x != 'undefined') {
      left = x;
    }

    if(typeof y != 'undefined') {
      top = y;
    }

    var popupMenuWidth = $('#' + this.id).width() + 2;
    if(left + popupMenuWidth > $(window).width()) {
      left = $(window).width() - popupMenuWidth;
    $('#' + this.id).css('left', left + 'px');
    }

    var popupMenuHeight = $('#' + this.id).height() + 2;
    if(top + popupMenuHeight > $(window).height()) {
      top = $(window).height() - popupMenuHeight;
      $('#' + this.id).css('top', top + 'px');
    }

  }

  /**
   *  Show only the child specified, hide all other children
   *
   *  @method showOnly
   *  @param componentID {String} The component to show
   */
  this.showOnly = function(componentID) {

    for(var i = 0; i < this.components.length; i++) {
      var uiID = "";
      if(this.components[i].uiID) {
        uiID = this.components[i].uiID;
      }
      if(this.components[i].ui_type == "UI.Include") {
        uiID = this.components[i].component;
      }

      if(uiID == componentID) {
        UI(uiID).setVisible(true);
      } else {
        UI(uiID).setVisible(false);
      }
    }
  }

  this.getElement = function() {
    if(this.element == null) {
      this.element = document.createElement('div');
      this.element.setAttribute("id", this.id);
    }
    return this.element;
  }

  /*
  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" onmousemove="UI.PanelMouseMove(\'' + this.id + '\')" ';

    if(this.cssclass != null) {
      html += ' class="' + this.cssclass + '" ';
    }

    if(this.style != null) {
      html += ' style="' + this.style + '" ';
    }

    html += '  >';

    for(var i = 0; i < this.components.length; i++ ) {
      if(this.components[i]) {
        html += this.components[i].getHTML();
      }
    }

    html += '</div>';

    return html;
  }
  */


  this.mouseMove = function(event) {
    this.trigger('mousemove', event);
  }

  this.mouseDown = function(event) {
    this.trigger('mousedown', event);
  }

  this.mouseUp = function(event) {
    this.trigger('mouseup', event);

  }

  this.mouseWheel = function(event) {
    this.trigger('mousewheel', event);
  }



  this.scrollTo = function(yPosition) {
    $('#' + this.id).scrollTop(yPosition);
  }
}

UI.registerComponentType("UI.Popup", UI.Popup);