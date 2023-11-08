var UISlider = function() {
  //this.editor = null;
  this.mouseDownAtX = 0;
  this.mouseDownAtY = 0;
  this.focussedControl = null;
  this.initialValue = 0;

  this.thumbWidth = 20;
  this.min = -9999999;
  this.max = -9999999;

}

UISlider.prototype = {
  initEvents: function() {

  },

  getHTML: function(forId) {
    var html = '';
    html += '<div class="ui-slider" data-id="' + forId + '">';
    html += '  <div class="ui-slider-track">';
    html += '  <div class="ui-slider-thumb" data-id="' + forId + '"></div>';
    html += '</div>';
//    hmtl += '</div>';
    return html;
  },

  initControls: function(selector) {
    var _this = this;

    
    $(selector + ' .slider').each(function() {
      console.log('insert html');
      var id = $(this).attr('id');
      var html = _this.getHTML(id);
      $(html).insertAfter(this);
    });

    $(selector + ' .ui-slider-thumb').css('cursor', 'pointer');

    $(selector + ' .ui-slider-thumb').on('mousedown', function(event) {
      console.log('thumb down');
      event.preventDefault();
      _this.mouseDownAtX = event.pageX;
      _this.mouseDownAtY = event.pageY;
      _this.focussedControl = $(this);

      var parent = $(this).parent();
      _this.trackWidth = parent.width();
      console.log('track width = ' + _this.trackWidth);

      var id = $(this).attr('data-id');
      _this.sliderId = id;
      console.log('id = ' + id);

      var position = $(this).position();
      _this.mouseDownLeft = position.left;

      _this.min = false;
      var min = $('#' + id).attr('min');
      if(typeof min != 'undefined') {
        _this.min = parseInt(min);
      }

      _this.max = false;
      var max = $('#' + id).attr('max');
      if(typeof max != 'undefined') {
        _this.max = parseInt(max);
      }

      
      console.log('range = ' + min + ',' + max);

      UI.captureMouse(_this, {"cursor": 'ew-resize'});


    });

//    $(selector).css('cursor', 'ew-resize');
/*
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
*/
  },

  init: function() {
    this.initControls('html');
  },

  mouseMove: function(event) {
    var x = event.pageX;
    var y = event.pageY;

    var dx = x - this.mouseDownAtX ;
    var dy = this.mouseDownAtY - y;

    if(this.focussedControl) {
      console.log('mouse move');

      var newLeft = this.mouseDownLeft + dx;


      if(newLeft < -this.thumbWidth / 2) {
        newLeft = -this.thumbWidth / 2;
      }

      if(newLeft > this.trackWidth - this.thumbWidth / 2) {
        newLeft = this.trackWidth - this.thumbWidth / 2;
      }
      this.focussedControl.css('left', newLeft + 'px');

      var percent = (newLeft + (this.thumbWidth / 2)) / this.trackWidth;
      console.log('percent = ' + percent);
      var value = this.min + Math.round((this.max - this.min) * percent);
      console.log('valkue = ' + value);

      $('#' + this.sliderId).val(value);
      /*
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

      */
      event.preventDefault();
      return true;
    }

    return false;

  },

  mouseUp: function(event) {
    if(this.focussedControl) {

      /*
      if(event.pageX == this.mouseDownAtX && event.pageY == this.mouseDownAtY) {
        this.focussedControl.focus();
        this.focussedControl.select();
      }
      */

      console.log('mouse up');
      this.focussedControl = null;
      event.preventDefault();
      return true;
    }

    return false;
//    this.editor.releaseMouse();
  }

}