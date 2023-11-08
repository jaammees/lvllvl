var ImageEffectsControl = function() {
  this.htmlElementId = '';

  this.imageEffects = null;

  this.effectsList = [];
  this.availableEffects = null;

  this.callbacks = {};
}

ImageEffectsControl.prototype = {
  init: function(args) {

    if(typeof args != 'undefined' && typeof args.htmlElementId != 'undefined') {
      this.htmlElementId = args.htmlElementId;
    }

    if(typeof args != 'undefined' && typeof args.availableEffects != 'undefined') {
      this.availableEffects = args.availableEffects;
    } else {

      this.imageEffects = new ImageEffects();
      this.imageEffects.init();
      this.availableEffects = this.imageEffects.getEffectsList();
    }

    this.controlHTML();
  },

  on: function(event, callback) {
    this.callbacks[event] = callback;
  },

  trigger: function(event) {
    if(this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event]();
    }
  },

  controlHTML: function() {
    var html = '';
    var _this = this;

    var unavailableEffects = [
      'Chroma Key'
    ];

    for(var i = 0; i < this.effectsList.length; i++) {
      
      var selectedEffectIndex = false;
      html += '<div class="imageControlEffect">';
      html += '<div class="imageControlEffect_selector">';
      html += '<select id="' + this.htmlElementId + '_effect_' + i + '" class="' + this.htmlElementId + '_effect" data-effect-index="' + i + '">';
      html += '<option>Select Effect</option>';
      for(var j = 0; j < this.availableEffects.length; j++) {
        //if(this.availableEffects[j].name != 'Chroma Key') {
        if(unavailableEffects.indexOf(this.availableEffects[j].name) === -1) {
          html += '<option value="' + this.availableEffects[j].name + '" ';
          if(this.effectsList[i].effect == this.availableEffects[j].name) {
            selectedEffectIndex = j;
            html += ' selected="selected" ';
          }
          html += '>' + this.availableEffects[j].name + '</option>';
        }

      }
      html += '</select>';

      html += '<div class="ui-button ui-button-danger ' + this.htmlElementId + '_remove imageControlEffect_remove" data-effect-index="' + i + '">x</div>';

      html += '</div>';
      if(selectedEffectIndex !== false) {
        var params = this.availableEffects[selectedEffectIndex].params;
        for(paramKey in params) {
          if(params.hasOwnProperty(paramKey)) {
            var param = params[paramKey];
            var paramName = paramKey;
            if(typeof param.name != 'undefined') {
              paramName = param.name;
            }

            var paramType = 'range';
            if(typeof param.type != 'undefined') {
              paramType = param.type;
            }

            if(paramType != 'hidden') {

              if(paramType == 'range' || paramType == 'angle') {
                var value = param.defaultValue;

                if(typeof this.effectsList[i].params[paramKey] != 'undefined') {
                  value = this.effectsList[i].params[paramKey];
                }

                var id = this.htmlElementId + '_effect_' + i + '_param_' + paramKey;

                var min = 0;
                var max = 100;


                if(paramType == 'range') {
                  if(param['min'] == -1 && param['max'] == 1) {
                    min = -100;
                    max = 100;
                    value = min + parseInt((max - min) * ((value - param['min']) / ( param['max'] - param['min'])), 10);
                  } else {
                    value = parseInt(100 * ((value - param['min']) / ( param['max'] - param['min'])), 10);
                  }
                }
                if(paramType == 'angle') {
                  min = 0;
                  max = 360;
                }


                html += '<div class="formRow">';
                html += '<label class="controlLabel">' + paramName  +  '</label>';

                html += '<input type="text" style="width: 30px" "min="' + min + '" max="' + max + '" value="' + value + '" size="2"  class="' + this.htmlElementId + '_effectParamText number" id="' + id + '_text"  data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '"/>';

                html += '<input style="flex: 1 1; margin: 0 2px" type="range"  min="' + min + '" max="' + max + '" value="' + value + '" size="3" class="' + this.htmlElementId + '_effectParamSlider" id="' + id + '_slider" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '"/>';
                

                html += '<div type="button" id="' + id + '_reset" class="ui-button ' + this.htmlElementId + '_effectParamReset" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '">Reset</div>';
                html += '</div>';


              }
/*
              if(paramType == 'onoff') {
                var value = param.defaultValue;
                if(typeof this.effectsList[i].params[paramKey] != 'undefined') {
                  value = this.effectsList[i].params[paramKey];
                }

                var id = this.htmlElementId + '_effect_' + i + '_param_' + paramKey;

                html += '<div class="formRow">';
                html += '<label class="controlLabel">' + paramName + '</label>';


                html += '<div style="display: inline-block">';
                html += '<label>';
                html += '<input type="radio" name="' + id + '" value="0" ';
                if(value == 0) {
                  html += ' checked="checked" ';
                }
                html += ' class="' + this.htmlElementId + '_effectParamRadio" id="' + id + '_slider" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '" ';
                html += '>';
                html += 'Off';
                html += '</label>';


                html += '<label>';
                html += '<input type="radio" name="' + id + '" value="1" ';
                if(value == 1) {
                  html += ' checked="checked" ';
                }
                html += ' class="' + this.htmlElementId + '_effectParamRadio" id="' + id + '_slider" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '" ';
                html += '>';
                html += 'On';
                html += '</label>';


                html += '</div>';

                html += '</div>';

              }
*/

              if(paramType == 'options') {
                var value = param.defaultValue;

                if(typeof this.effectsList[i].params[paramKey] != 'undefined') {
                  value = this.effectsList[i].params[paramKey];
                }

                var id = this.htmlElementId + '_effect_' + i + '_param_' + paramKey;

                html += '<div class="formRow">';
                html += '<label class="controlLabel">' + paramName + '</label>';


                html += '<div style="display: inline-block">';
                for(var j = 0; j < param.options.length; j++) {
                  var optionValue  = param.options[j];
                  var optionLabel = param.options[j];

                  if(typeof optionValue.value != 'undefined') {
                    optionValue = optionValue['value'];
                    optionLabel = optionLabel['label'];

                  }
/*                  
                  html += '<label>';
                  html += '<input type="radio" name="' + id + '" value="' + optionValue + '" ';
                  if(optionValue == value) {
                    html += ' checked="checked" ';
                  }

                  html += ' class="' + this.htmlElementId + '_effectParamRadio" id="' + id + '_slider" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '" ';
                  html += '>';
                  html += optionLabel;
                  html += '</label>';
*/

                  html += '<label class="rb-container">';
                  html +=  optionLabel;
                  html += '<input type="radio" name="' + id + '" value="' + optionValue + '" ';
                  if(optionValue == value) {
                    html += ' checked="checked" ';
                  }
                  html += ' class="' + this.htmlElementId + '_effectParamRadio" id="' + id + '_slider" data-effect-index="' + i + '" data-effect-param="' + paramKey + '" data-id="' + id + '" ';
                  html += '/>';

                  html += '<span class="checkmark"></span>';
                  html += '</label>';


                  html += '<br/>';
                }
                html += '</div>';

                html += '</div>';

              }
            }
//            html += '</div>';

          }
        }
      }

      html += '</div>';
    }

    html += '<div  class="ui-button imageControlEffect_add" id="' + this.htmlElementId + '_addEffect"><i class="halflings halflings-plus"></i>&nbsp;Add An Effect</div>';
    $('#' + this.htmlElementId).html(html);

    UI.number.initControls('#' + this.htmlElementId + ' .number');



    $('#' + this.htmlElementId + '_addEffect').on('click', function() {
      _this.addEffect();
    });

    $('.' + this.htmlElementId + '_effectParamSlider').on('change', function() {
      var value = $(this).val();
      var id = $(this).attr('data-id');
      $('#' + id + '_text').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, param, value);

    });

    $('.' + this.htmlElementId + '_effectParamSlider').on('input', function() {
      var value = $(this).val();
      var id = $(this).attr('data-id');
      $('#' + id + '_text').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, param, value);

    });

    $('.' + this.htmlElementId + '_effectParamText').on('keyup', function() {
      var value = $(this).val();
      var id = $(this).attr('data-id');
      $('#' + id + '_slider').val(value);

      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      _this.updateEffectParam(effectIndex, param, value);;
    });

    $('.' + this.htmlElementId + '_effectParamReset').on('click', function() {
      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');
      var value = _this.resetEffectParam(effectIndex, param);

      var id = $(this).attr('data-id');
      $('#' + id + '_slider').val(value);
      $('#' + id + '_text').val(value);
    });

    $('.' + this.htmlElementId + '_effectParamRadio').on('click', function() {
      //var value = $(this).val();
      var id = $(this).attr('data-id');
      var value = $('input[name=' + id + ']:checked').val();
      var effectIndex = $(this).attr('data-effect-index');
      var param = $(this).attr('data-effect-param');

      console.log('param = ' + param + ', value = ' + value);

      _this.updateEffectParam(effectIndex, param, value);;

    });


    $('.' + this.htmlElementId + '_effect').on('change', function() {
      var effect = $(this).val();
      var effectIndex = parseInt($(this).attr('data-effect-index'), 10);

      _this.setEffect(effectIndex, effect);

    });

    $('.' + this.htmlElementId + '_remove').on('click', function() {
      var effect = $(this).val();
      var effectIndex = parseInt($(this).attr('data-effect-index'), 10);

      _this.removeEffect(effectIndex);

    });


  },

  addEffect: function() {
    this.effectsList.push({});
    this.controlHTML();
  },

  setEffect: function(index, effect) {
    this.effectsList[index].effect = effect;    
    this.effectsList[index].params = {};

    // find the effect and add the defaults
    for(var i = 0; i < this.availableEffects.length; i++) {
      if(this.availableEffects[i].name == effect ) {
        for(var param in this.availableEffects[i].params) {
          if(this.availableEffects[i].params.hasOwnProperty(param)) {
            this.effectsList[index].params[param] = this.availableEffects[i].params[param].defaultValue;
          }
        }
      }
    }

    this.controlHTML();
    this.trigger('update');
  },

  removeEffect: function(index) {
    this.effectsList.splice(index, 1);
    this.controlHTML();
    this.trigger('update');

  },

  resetEffectParam: function(effectIndex, param) {
    console.log('reset effect ' + effectIndex);
    var effect = this.effectsList[effectIndex].effect;
    var value = 0;
    var min = 0;
    var max = 1;

//    console.log('reset to ' + this.effectsList[effectIndex].defaultValue);
    for(var i = 0; i < this.availableEffects.length; i++) {
      if(effect == this.availableEffects[i].name) {
        value = this.availableEffects[i].params[param].defaultValue;
        min = this.availableEffects[i].params[param].min;
        max = this.availableEffects[i].params[param].max;
        break;
      }
    }

    this.effectsList[effectIndex].params[param] = value;

    this.trigger('updateParam');

    var displayMin = 0;
    var displayMax = 100;

    if(min == -1 && max == 1) {
      displayMin = -100;
      displayMax = 100;

      // -100 + (100 + 100) * (0 + 1) / 200
      value = displayMin + parseInt((displayMax - displayMin) * ((value - min) / ( max - min)), 10);
    } else {
      displayMin = 0;
      displayMax = 100;
      value = parseInt(100 * ((value - min) / ( max - min)), 10);
    }

    return value;

  },

  updateEffectParam: function(effectIndex, param, value) {


    var effect = this.effectsList[effectIndex].effect;

    for(var i = 0; i < this.availableEffects.length; i++) {
      if(effect == this.availableEffects[i].name) {
        var type = 'range';

        if(typeof this.availableEffects[i].params[param].type != 'undefined') {
          type = this.availableEffects[i].params[param].type;
        }

        if(type == 'range') {
          var min = this.availableEffects[i].params[param].min;
          var max = this.availableEffects[i].params[param].max;

          if(min == -1 && max == 1) {
            var displayMin = -100;
            var displayMax = 100;
            value = min + ((value - displayMin) * (max - min)) / (displayMax - displayMin)

          } else {
            value = min + value / 100 * (max-min);
          }

        }
      }
    }

    this.effectsList[effectIndex].params[param] = value;
    this.trigger('updateParam');
  },

  getEffectsList: function() {
    return this.effectsList;
  },

  getEffectsCount: function() {
    return this.effectsList.length;
  },

  applyEffects: function(imageData) {
    for(var i = 0; i < this.effectsList.length; i++) {
      var effect = this.effectsList[i].effect;
      var params = this.effectsList[i].params;

      if(effect != '') {
        this.imageEffects.applyEffect(effect, imageData, params);
      }
    }

  }
}
