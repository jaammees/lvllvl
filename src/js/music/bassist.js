var Bassist = function() {
  this.patternView = null;
  this.music = null;

  this.uiComponent = null;

  this.savedPattern = null;
  this.applyAccents = false;
  this.saveLoopCurrentPattern = false;

  this.patternDataBackup = [];

  this.bassPatterns = [
    {
      "name": "Bass pattern 1"
    },
    {
      "name": "Bass pattern 2"
    }
  ];
}



Bassist.prototype = {
  init: function(music) {
    this.music = music;
  },

  start: function() {
    var _this = this;

    this.pattern = this.music.patternView.getPattern();
    this.savedPattern = this.pattern.getDataCopy();


    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "bassistDialog", "title": "Create A Bass Line", "width": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/music/bassist.html', function() {
        _this.initContent();
      });

      this.okButton = UI.create('UI.Button', { "text": "Import" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {

        _this.music.loopSelection = _this.saveLoopCurrentPattern;

        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        var pattern = _this.music.patternView.getPattern();
        pattern.setFromData(_this.savedPattern);

        _this.music.patternView.drawPattern();
        _this.music.loopSelection = _this.saveLoopCurrentPattern;

        UI.closeDialog();
      });
    }

    this.saveLoopCurrentPattern = this.music.loopSelection;
    this.music.loopSelection = true;

    UI.showDialog("bassistDialog");

  },


  initContent: function() {

    var _this = this;
    var bassPatternListHTML = '';
    for(var i = 0; i < this.bassPatterns.length; i++) {
      var name = this.bassPatterns[i].name;
      bassPatternListHTML += '<div class="bassistPatternListEntry ';
      bassPatternListHTML += '" value="' + i + '">' + name + '</div>';
    }

    $('#bassistPatterns').html(bassPatternListHTML);

    $('.bassistPatternListEntry').on('click', function() {
      var pattern = parseInt($(this).attr('value'), 10);
      $('.bassistPatternListEntry').removeClass('bassistPatternListEntrySelected');
      $(this).addClass('bassistPatternListEntrySelected');
      _this.chooseBassPattern(pattern);
    });
  },

  chooseBassPattern: function(index) {
    console.log('choose bass pattern ' + index);
  }


}