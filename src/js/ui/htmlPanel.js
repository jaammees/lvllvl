UI.HTMLPanel = function() {

  this.init = function(args) {
    this.html = '';
    if(args.html) {
      this.html = args.html;
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


  } 


  this.setHTML = function(html) {
    this.html = html;
    $('#' + this.id).html(html);
  }

  this.htmlLoaded = function(response, callback) {
    var _this = this;

//    this.html = response;

    $('#' + _this.id).html(response);

    if(typeof UI.number != 'undefined') {
      UI.number.initControls('#' + _this.id + ' .number');
    } else {
      console.error('weird error');        
    }

    if(typeof UI.slider != 'undefined') {
      UI.slider.initControls('#' + _this.id);
    } else {
      console.error('weird error');        
    }

    $('#' + _this.id + ' .nodrag').on('touchmove', function(e) {
      e.preventDefault();
    });

    if(typeof callback != 'undefined') {
      callback();
    }
    _this.trigger('loaded');
  }

  this.load = function(url, callback) {
    var htmlPanel = this;
    var _this = this;
    if(typeof g_htmlCache != 'undefined' && typeof g_htmlCache[url] != 'undefined') {
      this.htmlLoaded(g_htmlCache[url], callback);
    } else {
      $.get(url + '?9', function(response) {
        _this.htmlLoaded(response, callback);
      });
    }
  }

  this.resize = function() {
    this.trigger('resize');
  }

  this.getElement = function() {
    var element = document.createElement("div");
    element.setAttribute("id", this.id);
    element.setAttribute("class", "ui-html-panel ui-mouseevents");
    if(!this.visible) {
      element.setAttribute('style', 'display: none;');

    }
    
    if(typeof this.html != 'undefined' && this.html !== '') {
      element.innerHTML = this.html;
    }

    return element;
  }

  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" class="ui-html-panel ui-mouseevents" ';
    if(this.style != null) {
      html += ' style="' + this.style + '" ';
    }
    html += '>';
    if(this.html) {
      html += this.html;
    }
    html += '</div>';
    return html;
  }

  this.mouseEnter = function(event) {    
    this.trigger('mouseenter', event);
  }
  this.mouseLeave = function(event) {
    this.trigger('mouseleave', event);
  }

  this.mouseMove = function(event) {
    this.trigger('mousemove', event);
  }

  this.doubleClick = function(event) {
    this.trigger('dblclick', event);
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

  this.contextMenu = function(event) {
    this.trigger('contextmenu', event);
  }


}

UI.registerComponentType("UI.HTMLPanel", UI.HTMLPanel);