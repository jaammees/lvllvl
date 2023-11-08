/**
 * A Button
 *
 *
 * @class UI.Button
 */

UI.Button = function(args) {

  /**
   * <p>The tag for UI.Button</p>
   *
   * <p>Example:</p>
   * <pre>
   * &lt;wtui:button id="examplebutton" /&gt;
   *
   * @method &lt;wtui:button/&gt;
   * @tag
   * @param id {String} (optional) The id of the button
   * @param class {String} (optional) The css class to give the button
   * @param style {String} (optional) The style to give the button
   * @param icon {String} (optional) the URL of an icon to use in the button
   * @param onclick {Function} (optional) The javascript function to call when the button is clicked
   */

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

    this.icon = null;
    if(args.icon) {
      this.icon = args.icon;
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

//    var rippleElement = document.createElement('div');
//    rippleElement.setAttribute('class', 'rippleJS');
//    this.element.appendChild(rippleElement);

    this.element.onclick = function(event) {
      UI.ButtonClick(button.id);
    }

    this.element.innerHTML = this.getInnerHTML();

    return this.element;
  }

  this.getInnerHTML = function() {
    var html = '';
    if(this.icon) {
      html += '<i class="button-icon icon-' + this.icon + '"></i>&nbsp;'; 
    }
    html += this.args.text;

    html += '<div class="rippleJS"></div>';
    return html;

  }

  this.getHTML = function() {
    var html = '';
    
//    html += '<button type="button" id="' + this.id + '" ';
    html += '<div id="' + this.id + '" ';
    html += ' onclick="UI.ButtonClick(\'' + this.id + '\')" ';
    if(this.cssclass) {
      html += ' class="' + this.cssclass + '" ';
    } else {
      if(this.enabled) {
        html += ' class="ui-button';
        if(this.colour != '') {
          html += ' ui-button-' + this.colour;
        }
        html += '" ';
      } else {
        html += ' class="ui-button-disabled" ';
      }
    }
    if(this.style) {
      html += ' style="' + this.style + '" ';
    }
    html += '>';

    if(this.icon) {
      html += '<i class="button-icon icon-' + this.icon + '"></i>&nbsp;'; 
    }
//    html += '<span id="' + this.style + 'text">' + this.args.text + '</span>';
    html += this.args.text;

    html += '<div class="rippleJS"></div>';
    html += '</div>';

    return html;

/*
    html = '<a id="' + this.id + '"   ';
    html += ' onclick="UI.ButtonClick(\'' + this.id +  '\')" ';
    if(this.cssclass) {
      html += ' class="' + this.cssclass + '" ';
    } else {
      if(this.enabled) {
        html += ' class="ui-button" ';
      } else {
        html += ' class="ui-button-disabled" ';
      }
    }

    if(this.style) {
      html += ' style="' + this.style + '" ';
    }

    html += ' onmousedown="return false" ';
    html += '>';


    html += '<span ';

    html += ' onmousedown="return false" onselectstart="return false" ';

    html += ' id="' + this.id + 'text">';

    html += this.args.text;
    if(this.icon != '') {
      html += '<img src="' + this.icon + '"/>';
    }
    html += '</span>';
    html += '</a>';

    return html;
*/
  }

  /**
   * Fired when the button is clicked<br/><br/>
   * Example:<br/>
   * <pre>
   * WTUIComponent('buttonid').on('click', function() {
   * &nbsp;&nbsp;alert('The button was clicked');
   * });
   *
   * </pre>
   * @event click
   */
  this.click = function() {
    if(this.enabled) {
      if(this.onclick) {
        this.onclick(this);
      }
      if(this.args.onclick) {
        this.args.onclick(this);
      }

      this.trigger('click', this);
    }
  }

  /**
   * <p>Enable or disable the button</p>
   *
   * @method setEnabled
   * @param enabled {bool} Set to true to enable the button
   */
  this.setEnabled = function(enabled) {
    this.enabled = enabled;
    if(enabled) {
      //$('#' + this.id).addClass('ui-button');
      $('#' + this.id).removeClass('ui-button-disabled');
    } else {
//      $('#' + this.id).attr('disabled', 'true');
      $('#' + this.id).addClass('ui-button-disabled');
      //$('#' + this.id).removeClass('ui-button');
    }
  }

  /**
   * <p>Set the text for the button</p>
   *
   * @method setText
   * @param text {String} The text for the button
   */
  this.setText = function(text) {
    this.args.text = text;
    $('#' + this.id + 'text').html(text);
  }

  this.getText = function() {
    return this.args.text;
  }
}

UI.registerComponentType("UI.Button", UI.Button);

UI.ButtonMouseDown = function(id) {
}


UI.ButtonClick = function(id) {
  UI.components[id].click();
}
