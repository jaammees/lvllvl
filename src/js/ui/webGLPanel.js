UI.WebGLPanel = function() {

  this.init = function(args) {
    this.enabled = true;

    UI.webGLComponents.push(this);
  } 

  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; oveflow: hidden" class="ui-webgl-panel ">';
    if(this.html) {
      html += this.html;
    }
    html += '</div>';

    return html;
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

  this.resize = function() {
    if(!this.enabled) {
      return;
    }
    
    var element = $('#' + this.id);

    var position = element.offset();

    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();

    }

    this.trigger('resize', this.left, this.top, this.width, this.height);

  }

  this.setEnabled = function(enabled) {
    this.enabled = enabled;
  }

  this.render = function() {

    if(!this.enabled) {
      return;
    }


    UI.renderer.setViewport( this.left,  UI.getScreenHeight() - this.top - this.height, this.width, this.height );
    UI.renderer.setScissor( this.left, UI.getScreenHeight() - this.top - this.height, this.width, this.height );
    UI.renderer.setScissorTest( true );

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
      UI.renderer.setViewport( left, top, width, height );
      UI.renderer.setScissor( left, top, width, height );
      UI.renderer.setScissorTest( true );

      this.trigger('render', left, top, width, height);
    }

    */
  }
}

UI.registerComponentType("UI.WebGLPanel", UI.WebGLPanel);