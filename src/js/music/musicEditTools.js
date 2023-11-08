var MusicEditTools = function() {
  this.music = null;
}

MusicEditTools.prototype = {
  init: function(music) {
    this.music = music;

  },

  buildInterface: function(parentPanel) {
    var musicEditTools = this;
    this.uiComponent = UI.create("UI.HTMLPanel");
    parentPanel.add(this.uiComponent);
    
    UI.on('ready', function() {
      musicEditTools.uiComponent.load('html/music/musicEditTools.html', function() {
        musicEditTools.initEvents();
      });
    });

  },

  initEvents: function() {
    var _this = this;

    $('.musicTool').on('click', function(e) {
      var tool = $(this).attr('data-tool');
      _this.music.patternView.setMode(tool);

    });

    /*
    $('input[name=patternViewMode]').on('click', function() {
      _this.music.patternView.setMode($(this).val());
    });
    */


    $('#patternCreateBeat').on('click', function() {
      _this.music.drummer.start();

    });

    $('#patternCreateBassLine').on('click', function() {
      _this.music.bassist.start();

    });


    $('#musicScripting').on('click', function() {
      if(!_this.music.musicScripting) {
        _this.music.musicScripting = new MusicScripting();
        _this.music.musicScripting.init(music);
      }

      _this.music.musicScripting.start();
    });
  }



}