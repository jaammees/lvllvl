
UI.ProgressBar = function(args) {


  this.init = function(args) {
    this.args = args;

    this.enabled = true;
    if(typeof(args.enabled) != 'undefined') {
      this.enabled = args.enabled;
    }

    this.cssclass = null;
    if(args.cssclass) {
      this.cssclass = args.cssclass;
    }

    this.style = null;
    if(args.style) {
      this.style = args.style;
    }

    this.colour = '';
    if(args.colour) {
      this.colour = args.colour;
    }

    if(args.color) {
      this.colour = args.color;
    }


    this.name = '';
    if(args.name) {
      this.name = args.name;
    }


    this.onclick = null;

  }

  this.getElement = function() {
    var button = this;
    this.element = document.createElement('div');
    this.element.setAttribute('id', this.id);
    if(this.enabled) {
      var cssClass = 'ui-button';
      if(this.colour != '') {
        cssClass += ' ui-button-' + this.colour;
      }

      this.element.setAttribute('class', cssClass);
    } else {
      this.element.setAttribute('class', 'ui-button-disabled');      
    }

    this.element.onclick = function(event) {
      UI.ButtonClick(button.id);
    }

    this.element.innerHTML = this.getInnerHTML();

    return this.element;
  }

  this.setProgress = function(progress) {
    var p = 100 * progress;
    $('#' + this.id + '-progress').css('width', p + '%');
  },
  /*
  this.getInnerHTML = function() {
    var html = '';
    if(this.icon) {
      html += '<i class="button-icon icon-' + this.icon + '"></i>&nbsp;'; 
    }
    html += this.args.text;
    return html;

  }
  */

  this.getHTML = function() {
    var html = '';

    html += '<div id="' + this.id + '" ';

    if(this.cssclass) {
      html += ' class="' + this.cssclass + '" ';
    } else {
      html += ' class="ui-progress-bar ' + this.cssclass + '" ';
    }
    html += '>';

    html += '<div id="' + this.id + '-progress" class="ui-progress-bar-progress"/>';

    html += '</div>';


    html += '</div>';

    return html;

  }


  /**
   * <p>Enable or disable the button</p>
   *
   * @method setEnabled
   * @param enabled {bool} Set to true to enable the button
   */
  this.setEnabled = function(enabled) {
    this.enabled = enabled;
  }

}

UI.registerComponentType("UI.ProgressBar", UI.ProgressBar);
