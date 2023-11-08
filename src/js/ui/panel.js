UI.Panel = function() {

  this.components = new Array();
  this.element = null;

  this.width = false;
  this.height = false;

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

  this.resize = function() {

    /*
    var element = $('#' + this.id);


    var width = element.width();
    var height = element.height();
//    panels arent always full width/height?
//    so they dont always resize to fill what they're in

//    if(width !== this.width || height !== this.height) {
      console.log('resize');

      
      this.width = width;
      this.height = height;
*/
      
      for(var i = 0; i < this.components.length; i++) {
        if(typeof this.components[i].resize != 'undefined') {
          this.components[i].resize();
        }
      }
      this.trigger('resize');
//    }
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
      if(!this.visible) {
        this.setAttribute('style', 'display: none;');

      }

    }
    return this.element;
  }
  
  this.getHTML = function() {
    var html = '';
    html += '<div id="' + this.id + '" ';

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

  this.scrollTo = function(yPosition) {
    $('#' + this.id).scrollTop(yPosition);
  }
}

UI.registerComponentType("UI.Panel", UI.Panel);