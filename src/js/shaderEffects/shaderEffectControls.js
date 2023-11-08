var ShaderEffectControls = function() {
  this.parentElementId = null;
  this.paramChanged = false;

  this.params = [];
}

ShaderEffectControls.prototype = {
  init: function() {

  },

  setParentElementId: function(elementId) {
    this.parentElementId = elementId;
    this.initEvents();
  },

  on: function(name, callback) {
    if(name == 'paramchanged') {
      this.paramChanged = callback;
    }
  },

  initEvents: function() {
    var _this = this;

//    $('.' + this.htmlElementId + '_effectParamSlider').on('change', function() {
    $('#' + this.parentElementId).on('change', '.effectParamSlider', function() {
      var value = $(this).val();
      var id = $(this).attr('data-id');
      var name = $(this).attr('data-name');
      
      $('#' + id + '_text').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, name, value);

    });

    //$('.' + this.htmlElementId + '_effectParamSlider').on('input', function() {
    $('#' + this.parentElementId).on('input', '.effectParamSlider', function() {      
      var value = $(this).val();
      var id = $(this).attr('data-id');
      var name = $(this).attr('data-name');
      $('#' + id + '_text').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, name, value);

    });

//    $('.' + this.htmlElementId + '_effectParamText').on('keyup', function() {
    $('#' + this.parentElementId).on('keyup', '.effectParamText', function() {  
      var value = $(this).val();
      var id = $(this).attr('data-id');
      var name = $(this).attr('data-name');      
      $('#' + id + '_slider').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, name, value);
    });

    //$('.' + this.htmlElementId + '_effectParamReset').on('click', function() {
    $('#' + this.parentElementId).on('click', '.effectParamReset', function() {  
      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      var name = $(this).attr('data-name');      
      var value = _this.effectDefaultValue(effectIndex);
//      var value = _this.resetEffectParam(effectIndex, param);

      var id = $(this).attr('data-id');

      if($('#' + id + '_slider').length > 0) {  
        $('#' + id + '_slider').val(value);
      }

      if($('#' + id + '_text').length > 0) {
        $('#' + id + '_text').val(value);
      }
      _this.updateEffectParam(effectIndex, name, value);
    });


    $('#' + this.parentElementId).on('click', '.effectParamOption', function() {  
      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('name');
      var value = $(this).val();
      var name = $(this).attr('data-name');

      _this.updateEffectParam(effectIndex, name, value);
    });

  },
  setParams: function(params) {
    this.params = params;
    var html = '';

    for(var i = 0; i < params.length; i++) {
      var param = params[i];
      html += '<div>';
      html += '<div class="shaderEffectParamName">' + param.name + '</div>';

      switch(param.type) {
        case "range":
          html += this.getRangeControlHTML(param, i);
          break;
        case "options":
          html += this.getOptionsControlHTML(param, i);
          break;
      }
      html += '</div>';
    }

    if(this.parentElementId) {
      $('#' + this.parentElementId).html(html);
    }
  },

  updateEffectParam: function(effectIndex, param, value) {
    if(this.paramChanged !== false) {
      this.paramChanged(param, value);
    }
  },

  effectDefaultValue: function(effectIndex, param) {
    return this.params[effectIndex]['default'];
  },


  getId: function(name) {
    return name.trim().toLowerCase().replace(/ /g,"_");
  },

  getRangeControlHTML: function(param, index) {
    var html = '';
    var min = param.min;
    var max = param.max;
    var id = this.getId(param.name);
    
    var paramKey = id;
    var value = param.value;

    html += '<div class="rangeControl">';
    html += '<input type="number" style="width: 30px" "min="' + min + '" max="' + max + '" value="' + value + '" size="2"  class="effectParamText number" id="' + id + '_text"  data-effect-index="' + index + '" data-effect-param="' + paramKey + '" data-name="' + param.name + '" data-id="' + id + '"/>';
    html += '<input style="flex: 1 1; margin: 0 2px" type="range"  min="' + min + '" max="' + max + '" value="' + value + '" size="3" class="effectParamSlider" id="' + id + '_slider" data-effect-index="' + index + '" data-effect-param="' + paramKey + '" data-name="' + param.name + '" data-id="' + id + '"/>';  
    html += '<div type="button" id="' + id + '_reset" class="ui-button effectParamReset" data-effect-index="' + index + '" data-effect-param="' + paramKey + '" data-name="' + param.name + '" data-id="' + id + '">Reset</div>';
    html += '</div>';

    return html;
  },

  getOptionsControlHTML: function(param, index) {
    var html = '';
    var id = this.getId(param.name);

    for(var i = 0; i < param.options.length; i++) {
      var option = param.options[i];
      html += '<label class="rb-container" style="margin-right: 8px">' + option;
      html += '<input type="radio" name="' + id + '"  class="effectParamOption" data-name="' + param.name + '" data-effect-index="' + index + '" value="' + option + '"';
      if(option == param.value) {
        html += ' checked="checked" ';
      }
      
      html += '><span class="checkmark"></span></label>';
    }

    return html;

  },
}