var UINumber = function() {
  //this.editor = null;
  this.mouseDownAtX = 0;
  this.mouseDownAtY = 0;
  this.focussedControl = null;
  this.initialValue = 0;

  this.min = -9999999;
  this.max = -9999999;

}

UINumber.prototype = {

  initControls: function(selector) {
    var _this = this;

    $(selector).css('cursor', 'ew-resize');

    $(selector).on('mousedown', function(event) {
      event.preventDefault();
//      editor.captureMouse(number);
      _this.mouseDownAtX = event.pageX;
      _this.mouseDownAtY = event.pageY;

      $(this).blur();

      _this.focussedControl = $(this);


      _this.initialValue = parseInt($(this).val());

      _this.min = false;
      var min = $(this).attr('min');
      if(typeof min != 'undefined') {
        _this.min = parseInt(min);
      }

      _this.max = false;
      var max = $(this).attr('max');
      if(typeof max != 'undefined') {
        _this.max = parseInt(max);
      }

      UI.captureMouse(_this, {"cursor": 'ew-resize'});
    });

/*
    $(selector).on('mouseup', function(event) {
      $(this).focus();
      $(this).select();
    });
*/

    $(selector).keypress(function(event) {
      if(!event.which) {
        return;
      }

      // Backspace, tab, enter, end, home, left, right
      // We don't support the del key in Opera because del == . == 46.
      var controlKeys = [8, 9, 13, 35, 36, 37, 39];
      // IE doesn't support indexOf
      var isControlKey = controlKeys.join(",").match(new RegExp(event.which));
      // Some browsers just don't raise events for control keys. Easy.
      // e.g. Safari backspace.

      if (
          (event.which == 45) || // minus sign
          (48 <= event.which && event.which <= 57) || // Always 1 through 9
          (48 == event.which && $(this).attr("value")) || // No 0 first digit
          isControlKey) { // Opera assigns values for control keys.
        return;
      } else {
        event.preventDefault();
      }
    });

    $(selector).on('blur', function() {
      var v = parseInt($(this).val());


      var min = $(this).attr('min');
      if(typeof min != 'undefined' && v < min) {
        $(this).val(min);
        return;
      }

      var max = $(this).attr('max');
      if(typeof max != 'undefined' && v > max) {
        $(this).val(max);
        return;
      }


    });

  },

  init: function() {
    this.initControls('.number');
  },

  mouseMove: function(event) {
    var x = event.pageX;
    var y = event.pageY;

    var dx = x - this.mouseDownAtX ;
    var dy = this.mouseDownAtY - y;

    if(this.focussedControl) {
      var v = this.initialValue + Math.floor((dx + dy) / 4);

      if(this.min !== false && v < this.min) {
        v = this.min;        
      }
      if(this.max !== false && v > this.max) {
        v = this.max;
      }

      this.focussedControl.val(v);
      this.focussedControl.trigger('change');
      this.focussedControl.trigger('keyup');
      event.preventDefault();
      return true;
    }

    return false;

  },

  mouseUp: function(event) {
    if(this.focussedControl) {
      if(event.pageX == this.mouseDownAtX && event.pageY == this.mouseDownAtY) {
        this.focussedControl.focus();
        this.focussedControl.select();
      }

      this.focussedControl = null;
      event.preventDefault();
      return true;
    }

    return false;
//    this.editor.releaseMouse();
  }

}