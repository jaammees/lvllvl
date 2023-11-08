var PlaybackControls = function() {
  this.music = null;
}

PlaybackControls.prototype = {
  init: function(music) {
    this.music = music;
  },

  buildInterface: function(parentPanel) {
    var playbackControls = this;
    this.uiComponent = UI.create("UI.HTMLPanel");
    parentPanel.add(this.uiComponent);

    UI.on('ready', function() {
      playbackControls.uiComponent.load('html/music/playbackControls.html', function() {
        playbackControls.initEvents();
      });
    });
  },

  initEvents: function() {

    var _this = this;


    $('#musicStop').on('click', function() {
      _this.music.stopMusic();
    });

    $('#musicPlay').on('click', function() {
      _this.music.usePlayer2 = true;
      if(_this.music.musicPlayer2.isPlaying()) {
        _this.music.stopMusic();
      } else {
        _this.music.playMusic();
      }
    });


    $('#playSidTest').on('click', function() {
      _this.music.usePlayer2 = false;
      if(_this.music.musicPlayer.isPlaying()) {
        _this.music.stopMusic();
      } else {
        _this.music.playMusicTest();
      }

//      playbackControls.music.playSidTest();
//      playbackControls.sidplayer2.play();
    });


    $('input[type=radio][name=sidSpeed]').on('click', function() {
      var value = parseInt($(this).val());
      _this.music.setSpeed(value);
    });



    $('#sidLoop').on('click', function() {
      _this.music.loopSelection = $('#sidLoop').is(':checked');

    });
    _this.music.loopSelection = $('#sidLoop').is(':checked');


  }



}