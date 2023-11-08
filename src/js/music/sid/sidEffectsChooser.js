var SidEffectsChooser = function() {

  this.patternView = null;
  this.patternId = false;
  this.uiComponent = null;

  this.currentEffects = [];


  this.newEffects = [];

  this.effectStart = false;
  this.effectEnd = false;

  this.paramCanvas = null;

  this.mouseInBar = false;
  this.mouseDownInParams = false;


  this.paramMaxValue = 255;
  this.paramMinValue = 0;

  this.effect = 0;
  this.editingParam = 1;

}

SidEffectsChooser.prototype = {
  init: function(patternView) {
    this.patternView = patternView;
    this.music = this.patternView.music;
  },

  chooseEffect: function(start, end) {
    var _this = this;

    this.effectStart = start;
    this.effectEnd = end;

    this.currentEffects = [];
    this.newEffects = [];

    this.patternId = this.patternView.getPatternId();
    
    // save the current effects
    for(var i = this.effectStart; i <= this.effectEnd; i++) {
      var param = this.music.patterns.getParamAt(this.patternId, "effects", i);
      var effect = 0;
      var value1 = 0;
      var value2 = 0;

      if(param) {
        effect = param.values.effect;
        value1 = param.values.value1;
        value2 = param.values.value2;
      }

      this.currentEffects.push({
        "effect": effect,
        "param":  value1,
        "param2": value2
      });

      switch(effect) {
        case 4: // vibrato
          value2 = value1 & 0xff;
          value1 = (value1 >> 8) & 0xff;
        break;

        case 5: // attack/decay
          value2 = value1 & 0xf;
          value1 = (value1 >> 4) & 0xf;
        break;

        case 6: // sustain/release
          value2 = value1 & 0xf;
          value1 = (value1 >> 4) & 0xf;
        break;
        case 11: // set resonance/channels
          if(i == this.effectStart) {
            // just take channel from first one
            $('#sidEffectFilterChannel_1').prop('checked', (value1 & 0x1) != 0);
            $('#sidEffectFilterChannel_2').prop('checked', (value1 & 0x2) != 0);
            $('#sidEffectFilterChannel_3').prop('checked', (value1 & 0x4) != 0);
          }

          value1 = (value1 >> 4) & 0xff;
        break;
      }

      this.newEffects.push({
        "param":  value1,
        "param2": value2
      });
    }

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "sidEffectsChooser", "title": "Effect", "width": 640 });

/*
      this.uiComponent.on('mousedown', function(event) {
        _this.mouseDown(event);
      });

      this.uiComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
      });
      this.uiComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
      });
*/

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/music/sid/sidEffectsChooser.html', function() {
        _this.initContent();
        _this.initEvents();

        UI.showDialog("sidEffectsChooser");

      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.ok();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        _this.cancel();
      });
    } else {
      this.initContent();
      UI.showDialog("sidEffectsChooser");
    }

  },




  ok: function() {



    UI.closeDialog();
  },

  cancel: function() {
    UI.closeDialog();
  },


  setEffect: function() {
    this.effect = parseInt($('#sidEffect').val());
    var param = 0;
    var param2 = 0;

    this.editingParam = 1;

    switch(this.effect) {
      case 1:  // portamento up
      case 2:  // portamento down
        param = parseInt($('#sidEffectPortamentoSpeed').val());
        this.paramMinValue = 0;
        this.paramMaxValue = 65535;
        this.paramMaxValue = 1024;
        this.editingParam = 1;
      break;
      case 3:  // portamento to
        param = parseInt($('#sidEffectPortamentoSpeed').val());
        param2 = parseInt($('#sidEffectPortamentoTo').val());

        this.paramMinValue = 0;
        this.paramMaxValue = 92;

        this.editingParam = 2;

      break;
      case 4: // vibrato
        this.paramMinValue = 0;
        this.paramMaxValue = 127;

//        var speed = parseInt($('#sidEffectVibratoSpeed').val());
//        var depth = parseInt($('#sidEffectVibratoDepth').val());  
//        param = (speed << 8) + (depth & 0xff);
      break;      
      case 5: // set attack/decay

        this.paramMinValue = 0;
        this.paramMaxValue = 15;
        var attack = parseInt($('#sidEffectAttack').val());
        var decay = parseInt($('#sidEffectDecay').val());
        param = (attack << 4) + decay;
      break;
      case 6: // set sustain/release
        this.paramMinValue = 0;
        this.paramMaxValue = 15;

        var sustain = parseInt($('#sidEffectSustain').val());
        var release = parseInt($('#sidEffectRelease').val());
        param = (sustain << 4) + release;
      break;
      case 10: //start filter
        param = parseInt($('#sidEffectFilter').val());
      break;
      case 16: // stop filter
        this.effect = 16;
        param = 0;
      break;

      case 11: // set filter resonance/channels

        this.paramMinValue = 0;
        this.paramMaxValue = 15;

        param = parseInt($('#sidEffectFilterResonance').val());
        param = (param << 4);
        if($('#sidEffectFilterChannel_1').is(':checked')) {
          param = param + 0x01;
        }
        if($('#sidEffectFilterChannel_2').is(':checked')) {
          param = param + 0x02;
        }
        if($('#sidEffectFilterChannel_3').is(':checked')) {
          param = param + 0x04;
        }
      break;

      case 12: // filtercutoff
        this.effect = 12;
        param = parseInt($('#sidEffectFilterCutoff').val());
        this.editingParam = 1;
        this.paramMinValue = 0;
        this.paramMaxValue = 255;
      break;

      case 13: // master volume
        this.effect = 13;
        this.paramMinValue = 0;
        this.paramMaxValue = 15;
      break;
      case 14:
        this.effect = 14;
        param = parseInt($('#sidEffectTempo1').val()) << 8;        
        param += parseInt($('#sidEffectTempo2').val()) & 0xff;        
      break;
      case 15: // set tempo
        this.effect = 15;
        param = parseInt($('#sidEffectTempo').val());        
      break;
      case 17: // legato
        this.effect = 17;
      break;  
    }


    this.updatePattern();
    this.patternView.drawPattern();
    this.drawParamCanvas();
  },


  updatePattern: function() {
    var patternDuration = this.music.patterns.getDuration(this.patternId);

    for(var i = this.effectStart; i <= this.effectEnd; i++) {
      if(i >= 0 && i < patternDuration) {
        var param = this.newEffects[i - this.effectStart].param;
        var param2 = this.newEffects[i - this.effectStart].param2;

        switch(this.effect) {
          case 3: // param to note
            param = parseInt($('#sidEffectPortamentoSpeed').val(), 10);
            param2 = this.newEffects[i - this.effectStart].param2;
          break;
          case 4: // vibrato
//            var speed = parseInt($('#sidEffectVibratoSpeed').val());
//            param2 = parseInt($('#sidEffectVibratoDepth').val());  

            //combine params into one
            param = (param << 8) + (param2 & 0xff);
            param2 = 0;

//            param2 = $('#sidEffectVibratoDepth').val();
          break;

          case 5: // attack/decay
            var attack = param;
            var decay = param2;
            param = (attack << 4) + decay;    
          break;      

          case 6: // sustain/release
            var sustain = param;
            var release  = param2;

            param = (sustain << 4) + release;    
          break;      




          case 10: //start filter
            param = parseInt($('#sidEffectFilter').val());
          break;


          case 11: //set resonance
            param = (param << 4);
            if($('#sidEffectFilterChannel_1').is(':checked')) {
              param = param + 0x01;
            }
            if($('#sidEffectFilterChannel_2').is(':checked')) {
              param = param + 0x02;
            }
            if($('#sidEffectFilterChannel_3').is(':checked')) {
              param = param + 0x04;
            }
          break;
          case 14: // funk tempo
            param = parseInt($('#sidEffectTempo1').val()) << 8;        
            param += parseInt($('#sidEffectTempo2').val()) & 0xff;        
          break;
          case 15: // tempo
            param = parseInt($('#sidEffectTempo').val());        
          break;

        }

        if(typeof param == 'undefined') {
          param = 0;
        }

        if(typeof param2 == 'undefined') {
          param2 = 0;
        }

        this.music.patterns.addParam(this.patternId, "effects", i, 
          { "effect": this.effect, "value1": param, "value2": param2 } );

//        this.music.patterns.addEffect(this.patternId, i, this.effect,param, param2);        
      }
    }
  },
  initEvents: function() {
    var _this = this;

    $('#sidEffect').on('change', function() {
      var effect = $('#sidEffect').val();
      _this.setEffectParamVisible();
      _this.setEffect();
      UI('sidEffectsChooser').fitContent();
    });



    // vibrato
    $('input[name=sidEffectVibratoEditParam]').on('click', function() {
      _this.setVibratoEditParam();
    });


    // attack/decay
    $('input[name=sidEffectAttackDecayEditParam]').on('click', function() {
      _this.setAttackDecayEditParam();
    });


    // sustain/release
    $('input[name=sidEffectSustainReleaseEditParam]').on('click', function() {
      _this.setSustainReleaseEditParam();
    });


    $('#sidEffectTempo1').on('change', function() {
      _this.updatePattern();
    });

    $('#sidEffectTempo2').on('change', function() {
      _this.updatePattern();
    });

    $('#sidEffectTempo').on('change', function() {
      _this.updatePattern();

    });


    var element = document.getElementById('sidEffectsChooser');

    element.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    element.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    element.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);


  },

  initContent: function() {

    var _this = this;
    this.drawParamCanvas();

    // create the notes dropdown
    this.noteMap = [];
    for(var j = 0; j < 92; j++) {
      this.noteMap[j] = '';
    }

    var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    var html = '';
    html = '<select name="sidEffectPortamentoTo" class="formControl" id="sidEffectPortamentoTo">';
    for(var j = 92; j >=0; j--) {
      var noteIndex = j % 12;
      var octave = Math.floor(j / 12);
      var note = notes[noteIndex] + octave;
      this.noteMap[j] = note;

      html += '<option value="' + j + '" >' + note + '</option>';
    }

    html += '</select>';

    $('#sidEffectPortamentoToControl').html(html);



    // create the filters dropdown
    var filterHTML = '';
    filterHTML = '<select id="sidEffectFilter" class="formControl">';
    var filterID = 1;
    for(var i = 1; i < this.music.doc.data.filters.length; i++) {
      filterID = i;
      filterHTML += '<option value="' + filterID + '">' + this.music.doc.data.filters[i].name + '</option>';
      filterID += this.music.doc.data.filters[i].filtertable.length;
    }
    filterHTML += '</select>';
    $('#sidEffectFilterControl').html(filterHTML);
    $('#sidEffectFilter').on('change', function() {
      _this.updatePattern();
    });

    // set to current effect
    if(this.currentEffects.length == 0) {
      return;
    }

    $('#sidEffect').val(this.currentEffects[0].effect);
    this.setEffectParamVisible();


  },


  setVibratoEditParam: function() {
    var param = $('input[name=sidEffectVibratoEditParam]:checked').val();


    if(param == 'speed') {
      $('#sidEffectParamSetVibratoSpeed').hide();
      $('#sidEffectParamSetVibratoDepth').hide();
      this.paramMaxValue = 127;
      this.editingParam = 1;
    }

    if(param == 'depth') {
      $('#sidEffectParamSetVibratoSpeed').hide();
      $('#sidEffectParamSetVibratoDepth').hide();
      this.paramMaxValue = 255;

      this.editingParam = 2;
    }

    this.drawParamCanvas();
  },


  setAttackDecayEditParam: function() {
    var param = $('input[name=sidEffectAttackDecayEditParam]:checked').val();

    if(param == 'attack') {
      $('#sidEffectParamAttack').hide();          
      $('#sidEffectParamDecay').hide();          
      this.editingParam = 1;
    }

    if(param == 'decay') {
      $('#sidEffectParamAttack').hide();          
      $('#sidEffectParamDecay').hide();                
      this.editingParam = 2;
    }

    this.drawParamCanvas();
  },


  setSustainReleaseEditParam: function() {
    var param = $('input[name=sidEffectSustainReleaseEditParam]:checked').val();

    if(param == 'sustain') {
      $('#sidEffectParamSustain').hide();          
      $('#sidEffectParamRelease').hide();          
      this.editingParam = 1;
    }

    if(param == 'release') {
      $('#sidEffectParamSustain').hide();          
      $('#sidEffectParamRelease').hide();                
      this.editingParam = 2;
    }

    this.drawParamCanvas();
  },

  setEffectParamVisible: function() {
    var effect = parseInt($('#sidEffect').val());

    $('.sidEffectParam').hide();
    $('#sidEffectsParamGraph').hide();

    switch(effect) {
      case 1:  // portamento up
      case 2:  // portamento down
//        $('#sidEffectParamPortamentoSpeed').show();
        $('#sidEffectsParamGraph').show();
      break;
      case 3:  // portamento to
//        $('#sidEffectParamPortamentoSpeed').show();
//        $('#sidEffectParamPortamentoTo').show();          
        $('#sidEffectsParamGraph').show();
      break;
      case 4: // set vibrato
//        $('#sidEffectParamSetVibratoSpeed').show();
//        $('#sidEffectParamSetVibratoDepth').show();
        $('#sidEffectVibrato').show();
        $('#sidEffectVibratoEditParam_speed').prop('checked', true);
        $('#sidEffectsParamGraph').show();
        this.setVibratoEditParam();
        
        break;
      case 5: // set attack/decay
        $('#sidEffectAttackDecay').show();
//        $('#sidEffectParamAttack').show();          
//        $('#sidEffectParamDecay').show();          
        $('#sidEffectAttackDecayEditParam_attack').prop('checked', true);
        $('#sidEffectsParamGraph').show();
        this.setAttackDecayEditParam();
      break;

      case 6: // set sustain/release
//        $('#sidEffectParamSustain').show();          
//        $('#sidEffectParamRelease').show();          
        $('#sidEffectSustainRelease').show();

        $('#sidEffectSustainReleaseEditParam_sustain').prop('checked', true);
        $('#sidEffectsParamGraph').show();
        this.setSustainReleaseEditParam();
      break;
      case 10: //start filter
        $('#sidEffectParamFilter').show();          
      break;
      case 11: // set filter resonance/channels
        $('#sidEffectParamFilterResonance').show();          
        $('#sidEffectParamFilterChannels').show();          
        $('#sidEffectsParamGraph').show();
      break;
      case 12: // filter cutoff
        //$('#sidEffectParamFilterCutoff').show();
        $('#sidEffectsParamGraph').show();
      break;

      case 13: // volume
        //$('#sidEffectParamVolume').show();
        $('#sidEffectsParamGraph').show();
      break;
      case 14: // set funk tempo
        $('#sidEffectParamTempo1').show();
        $('#sidEffectParamTempo2').show();      
      break;
      case 15: // set tempo
        $('#sidEffectParamTempo').show();
      break;
      case 17:  // legato

      break;
    }
  },

  setParamValueFromMouse: function() {
    var max = this.paramMaxValue;
    var height = this.paramCanvas.height;
    var value = Math.ceil(((height - this.mouseBarY) / height) * max);
    if(this.editingParam == 1) {
      this.newEffects[this.mouseInBar].param = value;
    } else {
      this.newEffects[this.mouseInBar].param2 = value;
    }
    this.updatePattern();

    this.drawParamCanvas();
    this.updateEffectParamInfo();
  },

  mouseDown: function(event) {
    var x = event.clientX;
    var y = event.clientY;

    var canvasOffset = $('#sidEffectParamCanvas').offset();

    if(x >= canvasOffset.left && x < canvasOffset.left + this.paramCanvas.width &&
       y >= canvasOffset.top && y < canvasOffset.top + this.paramCanvas.height) {

      /*
      var xOffset = x - canvasOffset.left;
      var yOffset = this.paramCanvas.height - (y - canvasOffset.top);
      var bar = Math.floor(xOffset / this.barHolderWidth);

      this.mouseInBar = bar;
      this.mouseBarY = (y - canvasOffset.top);
      */

      this.setParamValueFromMouse();

      this.mouseDownInParams = true;
    }


  },

  updateEffectParamInfo: function() {
    var html = '';
    var highlightedBar = this.mouseInBar;
    var bars = this.effectEnd - this.effectStart + 1;
    if(this.mouseInBar !== false && this.mouseInBar < bars) {
      var patternPosition = this.effectStart + this.mouseInBar;
      html += '<div>';
      html += 'Position: ' + patternPosition;
      html += '</div>';

      var value = 0;
      if(this.editingParam == 1) {
        value = this.newEffects[this.mouseInBar].param;
      } else {
        value = this.newEffects[this.mouseInBar].param2;
      }



      if(typeof value == 'undefined') {
        value = '';
      } else {
        value = parseInt(value, 10);
        if(isNaN(value)) {
          value = '';
        } else {
          if(this.effect == 3) {
            if(value >= 0 && value <= this.noteMap.length) {
              value = this.noteMap[value];
            }
          }
        }
      }


      html += '<div>';
      html += 'Value:' + value;
      html += '</div>';
    } else {
      html = '';
    }

    $('#sidEffectsParamGraphInfo').html(html);

  },

  drawParamCanvas: function() {
    if(this.paramCanvas == null) {
      this.paramCanvas = document.getElementById('sidEffectParamCanvas');
      this.paramContext = this.paramCanvas.getContext('2d');
    }

    this.paramContext.fillStyle = '#000000';
    this.paramContext.fillRect(0, 0, this.paramCanvas.width, this.paramCanvas.height);


    var width = this.paramCanvas.width;
    var height = this.paramCanvas.height;
    var bars = this.effectEnd - this.effectStart + 1;
    this.barHolderWidth = width / bars;
    this.barGap = 2;//barHolderWidth 

    var barMaxHeight = height;

    for(var i = 0; i < bars; i++) {
      var x = i * this.barHolderWidth + this.barGap;

      var max = this.paramMaxValue;
      var value = 0;
      if(this.editingParam == 1) {
        value = this.newEffects[i].param;
      } else {
        value = this.newEffects[i].param2;
      }
      var barHeight = barMaxHeight * value / max;


      var y = 100;// + i * 20;
      if(i === this.mouseInBar) {

        this.paramContext.beginPath();    
        this.paramContext.strokeStyle = styles.music.oscilloscopeLines;
        this.paramContext.lineWidth = 1;        
        this.paramContext.moveTo(x, this.mouseBarY + 0.5);
        this.paramContext.lineTo(x + this.barHolderWidth - (2 * this.barGap), this.mouseBarY + 0.5);
        this.paramContext.stroke();


        this.paramContext.fillStyle = '#eeeeee';
      } else {
        this.paramContext.fillStyle = '#aaaaaa';
      }
      this.paramContext.fillRect(x, height - barHeight, this.barHolderWidth - (2 * this.barGap) , barHeight);
    }
  },

  mouseMove: function(event) {

    var x = event.clientX;
    var y = event.clientY;

    var canvasOffset = $('#sidEffectParamCanvas').offset();

    if(x >= canvasOffset.left && x < canvasOffset.left + this.paramCanvas.width &&
       y >= canvasOffset.top && y < canvasOffset.top + this.paramCanvas.height) {
      var xOffset = x - canvasOffset.left;
      var yOffset = this.paramCanvas.height - (y - canvasOffset.top);
      var bar = Math.floor(xOffset / this.barHolderWidth);

      if(bar != this.mouseInBar || this.mouseBarY != (y - canvasOffset.top)) {

        this.mouseInBar = bar;
        this.mouseBarY = (y - canvasOffset.top);
        this.updateEffectParamInfo();

        if(this.mouseDownInParams) {
          // mouse is currently down
          this.setParamValueFromMouse();
        } else {
          this.drawParamCanvas();
        }

      }
    }
  },

  mouseUp: function(event) {
    this.mouseDownInParams = false;

  }


}
