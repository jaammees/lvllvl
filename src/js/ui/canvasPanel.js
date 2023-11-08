UI.CanvasPanel = function() {

  this.init = function(args) {

    UI.canvasComponents.push(this);
    this.canvas = null;

    this.scale = 1;
    this.left = false;
    this.top = false;
    this.width = false;
    this.height = false;
  } 

  this.getElement = function() {
    this.element = document.createElement('div');
    this.element.setAttribute('id', this.id);
    this.element.setAttribute('style', 'position: absolute; top: 0; bottom: 0; left: 0; right: 0');
    this.element.setAttribute('class', 'ui-canvas-panel ui-mouseevents');
    
    this.element.innerHTML = '<canvas style="" id="' + this.id + '-canvas"></canvas>';

    return this.element;

  }

  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0" class="ui-canvas-panel ui-mouseevents">';

    html += '<canvas style="" id="' + this.id + '-canvas"></canvas>';
    html += '</div>';


    return html;
  }


  this.getCanvas = function() {
    if(this.canvas == null) {
      this.canvas =  document.getElementById(this.id + '-canvas');
    } 
    return this.canvas;

  }

  this.contextMenu = function(event) {
    this.trigger('contextmenu', event);
  }


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

  this.mouseEnter = function(event) {
    this.trigger('mouseenter', event);
  }

  this.mouseLeave = function(event) {
    this.trigger('mouseleave', event);
  }

  this.resize = function(args) {
//    console.error("RESIZE CANVAS!!!!!");
    var force = false;
    if(typeof args != 'undefined') {
      if(typeof args.force != 'undefined') {
        force = args.force;
      }
    }


    var element = $('#' + this.id);

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }



    this.canvas = this.getCanvas();
    if(this.width != this.canvas.style.width || this.height != this.canvas.style.height || force) {
      if(this.width != 0 && this.height != 0) {
        
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';


        this.canvas.width = this.width * UI.devicePixelRatio;
        this.canvas.height = this.height * UI.devicePixelRatio;

        this.scale = UI.devicePixelRatio;

      }
    }


    this.trigger('resize', this.left, this.top, this.width, this.height);
  }

  this.getScale = function() {
    return this.scale;

  }
  this.render = function() {
    return;

    if(this.left === false) {
      this.resize();
    }

    if(this.width == 0 || this.height == 0) {
      return;
    }


    this.canvas = this.getCanvas();

    if(this.width != this.canvas.style.width || this.height != this.canvas.style.height) {

      if(this.width != 0 && this.height != 0) {
        this.canvas.style.width = this.width;
        this.canvas.style.height = this.height;

        this.canvas.width = this.width * UI.devicePixelRatio;
        this.canvas.height = this.height * UI.devicePixelRatio;

        this.scale = UI.devicePixelRatio;

      }
    }

    this.trigger('render', this.left, this.top, this.width, this.height);

    /*
    // need to work out the size
    var element = $('#' + this.id);
    var position = element.offset();
    if(position) {
      var left = position.left;
      var top = position.top;

      var width = element.width();
      var height = element.height();

      this.canvas = this.getCanvas();
      if(width != this.canvas.width || height != this.canvas.height) {
        // TODO: shouldn't get the here if canvas isnt visible
        if(width != 0 && height != 0) {
          this.canvas.width = width;
          this.canvas.height = height;
        }
      }

      this.trigger('render', this.left, this.top, this.width, this.height);
    }
    */

  }

}

UI.registerComponentType("UI.CanvasPanel", UI.CanvasPanel);