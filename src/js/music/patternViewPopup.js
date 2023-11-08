var PatternViewPopup = function() {
  this.music = null;
  this.uiComponent = null;

}

PatternViewPopup.prototype = {
  init: function(music, callback) {
    this.music = music;
    var _this = this;

    this.uiComponent = UI.create("UI.Popup", { "id": "patternViewPopup", "width": 300, "height": 300 });
    
    this.htmlComponent = UI.create("UI.HTMLPanel", { "html": '<span style="color: red">loading...</span>' });
    this.uiComponent.add(this.htmlComponent);


    this.htmlComponent.load('html/music/patternViewPopup.html', function() {
      _this.initEvents();
      if(typeof callback != 'undefined') {
        callback();
      }
    });

  },

  initEvents: function() {
    var _this = this;
    $('.patternViewPopupItem').on('click', function() {
      var value = $(this).attr('data-value');
      console.log('set mode to ' + value);
      _this.music.patternView.setMode(value);
      UI.hidePopup();
    });
  },

  recentInstrumentHtml: function() {
    var _this = this;
    var html = '';

    if(this.selectedInstrument !== false) {
      html += '<div style="clear: both" class="ui-menu-item-separator">Selected Instrument</div>';
      var instrumentId = this.selectedInstrument;
      var instrument = this.music.instruments.getInstrument(instrumentId);
      var color = "#" + ((1 << 24) + instrument.color).toString(16).slice(1);

      html += '<div class="ui-menu-item patternViewPopupInstrument"  data-value="' + instrumentId + '">';
      //html += '<div style="display: inline-block; width: 14px"></div>';
      html += '<div style="margin-top: 2px; margin-right: 4px; display: inline-block; width: 12px; height: 12px; background-color: ' + color + '"></div>';
      html += instrument.name;
      html += '</div>';

      html += '<div class="ui-menu-item patternViewPopupEditInstrument"  data-value="' + instrumentId + '">';
      html += 'Edit ' + instrument.name;
      html += '</div>';

    }

    html += '<div style="clear: both" class="ui-menu-item-separator">Recent Instruments</div>';
    for(var i = this.music.instruments.recentInstruments.length - 1; i >= 0; i--) {
      var instrumentId = this.music.instruments.recentInstruments[i];
      var instrument = this.music.instruments.getInstrument(instrumentId);
      
      var color = "#" + ((1 << 24) + instrument.color).toString(16).slice(1);

      html += '<div class="ui-menu-item patternViewPopupInstrument"  data-value="' + instrumentId + '">';
      //html += '<div style="display: inline-block; width: 14px"></div>';
      html += '<div style="margin-top: 2px; margin-right: 4px; display: inline-block; width: 12px; height: 12px; background-color: ' + color + '"></div>';
      html += instrument.name;
      html += '</div>';

    }

    $('#patternViewPopupInstruments').html(html);

    $('.patternViewPopupInstrument').on('click', function() {
      var instrumentId = parseInt($(this).attr('data-value'), 10);
      _this.music.instruments.selectInstrument(instrumentId, false);
      UI.hidePopup();
    });

    $('.patternViewPopupEditInstrument').on('click', function() {
      var instrumentId = parseInt($(this).attr('data-value'), 10);
      //console.log('edit instrument!!');
      _this.music.setView('editInstrument');      
      _this.music.instruments.selectInstrument(instrumentId, false);
      _this.music.editInstrument.editInstrument(parseInt(instrumentId));


      //_this.music.instruments.selectInstrument(instrumentId, false);
      UI.hidePopup();
    });

  },


  show: function(args) {
    var x = args.x;
    var y = args.y;


    this.selectedInstrument = false;

    if(typeof args['selectedInstrument'] != 'undefined') {
      this.selectedInstrument = args['selectedInstrument'];
    }

    var mode = this.music.patternView.getMode();
    $('.patternViewPopupCheck').html('');

    var checkedId = '';
    switch(mode) {
      case 'draw':
        checkedId = 'patternViewPopupDrawCheckmark';
      break;
      case 'erase':
        checkedId = 'patternViewPopupEraseCheckmark';
      break;
      case 'select':
        checkedId = 'patternViewPopupSelectCheckmark';
      break;

    }

    $('#' + checkedId).html('*');

    this.recentInstrumentHtml();

    var width = 200;
    var height = 300;
    this.uiComponent.setDimensions(width, height);
    UI.showPopup("patternViewPopup", x, y);    
  }

}
