var Drummer = function() {
  this.patternView = null;
  this.music = null;

  this.uiComponent = null;

  this.savedPattern = null;
  this.saveLoopCurrentPattern = false;


  this.keys = [
  ];

  this.drumPatterns = [
    {
      "name": "Drum pattern 1",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,0],[1,0,0,0],[0,0,0,2],[1,0,2,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,3,0],[1,0,2,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },

    {
      "name": "Drum pattern 2",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,2,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,2],[1,2,0,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,2,0,0],[1,0,3,0]],
        "hihatClosed": [[0,0,1,2],[0,0,1,0],[0,0,1,2],[0,0,1,0],[0,0,1,2],[0,0,1,0],[0,0,2,1],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }
    },

    {
      "name": "Drum pattern 3",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,0,1,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,1,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[0,1,1,1],[0,0,1,1],[0,1,0,1],[0,0,1,1],[0,1,1,1],[0,0,1,1],[0,1,1,1],[0,0,1,1]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }
    },



    {
      "name": "Drum pattern 4",
      "pattern": {
        "bass":        [[1,0,0,3],[0,0,0,0],[1,0,2,0],[0,0,0,3],[1,0,0,0],[0,0,0,3],[1,0,2,0],[0,0,0,3]],
        "snare":       [[0,3,0,0],[1,0,0,2],[0,3,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,2,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,2,0],[0,3,0,3],[0,3,1,0],[0,3,1,0],[0,0,2,0],[0,0,0,3],[0,3,1,0]]
      },
      "settings": {
        "bass":        { value: 2 },
        "snare":       { value: 2 },
        "hihatClosed": { value: 2 }
      }
    },

    {
      "name": "Drum pattern 5",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,2,0,0],[0,0,0,0],[1,0,2,0],[0,0,3,2],[0,0,2,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2],[0,0,0,0],[1,0,0,0],[0,0,0,3],[1,0,0,0]],
        "hihatClosed": [[3,3,1,0],[0,0,0,2],[0,0,1,0],[0,0,1,0],[3,3,0,0],[0,0,0,0],[3,3,0,0],[0,0,0,0]],
        "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,0],[0,0,0,0]],
      },
      "settings": {
        "bass":        { value: 2 },
        "snare":       { value: 2 },
        "hihatClosed": { value: 2 },
        "hihatOpen":   { value: 2 }
      }

    },

    {
      "name": "Drum pattern 6",
      "pattern": {
        "bass":        [[1,0,0,1],[0,0,1,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[0,0,0,1],[0,0,1,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,1,0,1],[0,1,1,0],[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,1,0,0],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 2 },
        "snare":       { value: 2 },
        "hihatClosed": { value: 2 },
        "hihatOpen":   { value: 2 }
      }

    },

    {
      "name": "Drum pattern 7",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,3],[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,3]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "bongo":       [[0,2,1,3],[0,3,1,0],[0,1,0,2],[0,0,1,0],[0,2,1,3],[0,3,1,0],[0,1,0,2],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 2 },
        "snare":       { value: 1 },
        "bongo":       { value: 1 }
      }
    },

    {
      "name": "Drum pattern 8",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,3],[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,3]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "tom":         [[0,0,0,0],[0,0,0,1],[0,0,0,0],[0,1,0,1],[0,1,0,1],[0,0,0,0],[0,1,1,1],[0,1,1,1]],
        "hihatClosed": [[0,2,1,3],[0,3,1,0],[0,0,1,2],[0,0,1,0],[0,2,1,3],[0,3,1,0],[0,0,0,2],[0,0,0,0]],
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "tom":         { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },

    {
      "name": "Drum pattern 9",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[3,2,1,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[3,2,1,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,2,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,2,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[2,0,0,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[2,0,0,0],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },

    {
      "name": "Drum pattern 10",
      "pattern": {
        "bass":        [[1,0,0,1],[0,0,0,0],[1,0,1,0],[0,0,0,1],[1,2,0,1],[0,0,0,0],[1,0,1,0],[0,0,0,1]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,2,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,2,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,2],[0,0,0,2],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,2],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },

    {
      "name": "Drum pattern 11",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0]],
        "hihatOpen":   [[0,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[0,0,1,0],[1,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,2,0],[1,0,1,0]],
        "woodblock":   [[0,0,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,1],[0,1,0,0],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatOpen":   { value: 1 },
        "hihatClosed": { value: 1 },
        "woodblock":   { value: 1 }

      }

    },

    {
      "name": "Drum pattern 12",
      "pattern": {
        "bass":        [[1,0,0,1],[0,0,0,0],[0,0,1,0],[0,0,0,1],[2,3,0,1],[0,0,0,0],[1,2,1,0],[0,0,0,2]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,2],[1,0,0,2],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,2],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },
    {
      "name": "Drum pattern 13",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[0,0,1,0],[0,0,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0],[0,0,0,2]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[1,0,0,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[1,0,0,0],[0,0,1,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
      }

    },
    {
      "name": "Drum pattern 14",
      "pattern": {
        "bass":        [[1,0,2,0],[0,0,0,3],[0,1,0,2],[0,0,0,0],[1,0,2,0],[0,0,0,3],[0,2,0,1],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2]],
        "hihatClosed": [[0,1,0,0],[0,0,1,0],[0,0,0,0],[0,0,1,0],[0,1,0,0],[0,0,1,0],[0,0,0,0],[0,0,1,0]],
       // "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        "woodblock":   [[0,0,0,1],[0,1,0,3],[2,0,0,0],[0,0,0,0],[0,0,0,1],[0,1,0,0],[2,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 2 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 },
//        "hihatOpen":   { value: 1 },
        "woodblock":   { value: 1 }
      }

    },
    {
      "name": "Drum pattern 15",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,3],[0,1,0,1],[0,0,0,0],[1,0,0,0],[0,0,0,0],[0,1,0,2],[0,2,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[1,0,1,0],[1,0,1,0],[0,0,1,0],[0,0,1,0],[1,0,1,0],[0,0,1,0]],
       // "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        //"woodblock":   [[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 },
//        "hihatOpen":   { value: 1 },
//        "woodblock":   { value: 0 }
      },
    },
    {
      "name": "Drum pattern 16",
      "pattern": {
        "bass":        [[1,0,1,0],[0,0,0,3],[0,0,1,1],[0,0,0,0],[1,0,1,0],[0,0,0,0],[0,0,1,2],[0,2,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,2]],
        "hihatClosed": [[0,0,0,0],[0,0,1,0],[1,0,0,0],[0,0,1,0],[0,0,0,0],[0,0,1,0],[1,0,0,0],[0,0,1,0]],
       // "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        //"woodblock":   [[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 },
//        "hihatOpen":   { value: 1 },
//        "woodblock":   { value: 0 }
      },
    },    
    {
      "name": "Drum pattern 17",
      "pattern": {
        "bass":        [[0,0,0,1],[0,1,0,0],[1,0,0,1],[0,1,0,0],[0,0,0,1],[0,1,0,0],[1,0,1,1],[0,1,0,1]],
        "snare":       [[0,0,1,0],[1,0,0,0],[0,0,1,0],[1,0,0,0],[0,0,1,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[1,0,0,0],[0,0,0,1],[0,0,0,0],[0,0,0,1],[1,0,0,0],[0,0,0,1],[1,0,1,0],[0,0,1,0]],
        "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0]],
        //"woodblock":   [[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 },
        "hihatOpen":   { value: 1 }
//        "woodblock":   { value: 0 }
      },



    },
    {

      "name": "Drum pattern 18",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[0,0,1,0],[0,0,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0],[0,0,0,0]],
        "snare":       [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "hihatClosed": [[0,0,1,0],[0,0,1,0],[1,0,0,0],[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0],[0,0,1,1]],
        "hihatOpen":   [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
        //"woodblock":   [[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,2,0,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 },
        "hihatOpen":   { value: 1 }
//        "woodblock":   { value: 0 }
      }
    

    },

    {

      "name": "Drum pattern 19",
      "pattern": {
        "bass":        [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0]],
        "snare":       [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,0,0,0]],
        "hihatClosed": [[1,2,1,2],[0,2,1,2],[1,2,1,2],[0,2,1,2],[1,2,1,2],[0,2,1,2],[1,0,0,2],[0,2,1,2]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
    //        "woodblock":   { value: 0 }
      }   
    },
    
    {

      "name": "Drum pattern 20",
      "pattern": {
        "bass":        [[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,0,0],[0,0,0,0]],
        "clap":        [[0,0,0,0],[1,0,0,0],[0,0,0,0],[1,0,1,0],[0,0,0,0],[1,0,0,0],[0,1,0,1],[1,0,1,0]],
        "hihatClosed": [[0,2,2,2],[0,0,2,2],[0,0,2,2],[0,0,0,0],[0,2,2,2],[0,0,2,2],[0,0,0,0],[0,0,0,0]]
      },
      "settings": {
        "bass":        { value: 1 },
        "snare":       { value: 1 },
        "hihatClosed": { value: 1 }
    //        "woodblock":   { value: 0 }
      }   
    },













  ];

}


/*
    // electro
    var patterns = [
      ['bass', '', 'hihatClosed', ''],
      ['snare', '', 'hihatClosed', 'tom'],
      ['bass', '', 'hihatClosed', ''],
      ['snare', 'tom', 'hihatClosed', 'tom'],
      ['bass', 'tom', 'hihatClosed', 'tom'],
      ['snare', '', 'hihatClosed', ''],
      ['bass', 'tom', 'tom', 'tom'],
      ['snare', 'tom', 'tom', 'tom']
    ];
*/

/*

    // rock
    var patterns = [
      ['bass', '', 'hihatClosed', ''],
      ['snare', '', 'hihatClosed', ''],
      ['bass', '', 'bass', ''],
      ['snare', '', 'hihatClosed', ''],
      ['bass', '', 'hihatClosed', ''],
      ['snare', '', 'hihatClosed', 'bass'],
      ['bass', '', 'bass', ''],
      ['snare', '', 'hihatClosed', '']
    ];
    drumPatterns.push(patterns);

*/

Drummer.prototype = {
  init: function(music) {
//    this.patternView = thispatternView;
    this.music = music;
  },

  start: function() {
    var _this = this;

    this.patternId = this.music.patternView.getPatternId();
    this.savedPattern = this.music.patterns.getDataCopy(this.patternId);

    var patternLength = this.music.patterns.getDuration(this.patternId);
    this.bars = Math.ceil(patternLength / 16);


    while(this.keys.length < this.bars) {
      this.keys.push({
        key: 0,
        scale: "major"
      });
    }


    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "drummerDialog", "title": "Create A Beat", "width": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/music/drummer.html', function() {
        _this.initContent();
      });

      this.okButton = UI.create('UI.Button', { "text": "Import", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {

//        _this.startImport();
        _this.music.loopSelection = _this.saveLoopCurrentPattern;

        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        _this.music.patterns.setFromData(_this.patternId, _this.savedPattern);

        _this.music.patternView.drawPattern();
        _this.music.loopSelection = _this.saveLoopCurrentPattern;

        UI.closeDialog();
      });
    } else {
      // need to clear previous selection
      this.chooseDrumPattern(false);

    }

    this.saveLoopCurrentPattern = this.music.loopSelection;
    this.music.loopSelection = true;



    UI.showDialog("drummerDialog");

  },


  initContent: function() {

    var _this = this;
    var drumPatternListHTML = '';
    for(var i = 0; i < this.drumPatterns.length; i++) {
      var name = this.drumPatterns[i].name;
      drumPatternListHTML += '<div class="drummerPatternListEntry ';
      drumPatternListHTML += '" value="' + i + '">' + name + '</div>';
    }

    $('#drummerPatterns').html(drumPatternListHTML);

    $('.drummerPatternListEntry').on('click', function() {
      var pattern = parseInt($(this).attr('value'), 10);
      $('.drummerPatternListEntry').removeClass('drummerPatternListEntrySelected');
      $(this).addClass('drummerPatternListEntrySelected');
      _this.chooseDrumPattern(pattern);
    });
  },


  keyChooserHTML: function() {
    var html = "";

    var keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    for(var bar = 0; bar < this.bars; bar++) {
      html += '<div>';

      var barNumber = bar + 1;

      html += 'Bar ' + barNumber;
      html += 'Key:';
      html += '<select class="drummerBarKey"  data-bar="' + bar + '" id="drummerBarKey_' + bar + '">';
      for(var i = 0; i < keys.length; i++) {
        html += '<option value="' + i + '" ';
        if(i == this.keys[bar].key) {
          html += ' selected="selected" ';
        }

        html += '>';
        html += keys[i];
        html += '</option>';
      }
      html += '</select>';

      html += 'Scale:';


      html += '<select class="drummerBarScale"  data-bar="' + bar + '" id="drummerBarScale_' + bar + '">';
//        for(var i = 0; i < this.music.scales.scales.length; i++) {
      for(var scaleOption in this.music.scales.scales) {
        html += '<option value="' + scaleOption + '" ';
        if(scaleOption == this.keys[bar].scale) {
          html += ' selected="selected" ';
        }
        html += '>';
        html += this.music.scales.scales[scaleOption].name;
        html += '</option>';
      }
      html += '</select>';

      html += '</div>';
    }

    $('#drummerKeys').html('KEYS' + html);

    var _this = this;


    $('.drummerBarKey').on('change', function() {
      var bar = $(this).attr('data-bar');
      var key = parseInt($('#drummerBarKey_' + bar).val(), 10);
      console.log('set key to ' + key);
      _this.keys[bar].key = key;
      _this.applyDrumPattern();
    });


    $('.drummerBarScale').on('change', function() {
      var bar = $(this).attr('data-bar');
      var scale = $('#drummerBarScale_' + bar).val();
      console.log('set scale to ' + scale);
      _this.keys[bar].scale = scale;
      _this.applyDrumPattern();
    });    


  },


  setVolumeValues: function(instrument) {
    this.drumPatterns[this.selectedDrumPatternIndex].settings[instrument].volume = [];
    for(var i = 0; i < 4; i++) {
      var volume = parseInt($('#drummerInstrumentEffect_' + instrument + '_volume_' + i).val(), 10);
      this.drumPatterns[this.selectedDrumPatternIndex].settings[instrument].volume.push(volume);
    }
  },

  setPortamentoValues: function(instrument) {
    this.drumPatterns[this.selectedDrumPatternIndex].settings[instrument].portamento = [];
    for(var i = 0; i < 4; i++) {
      var portamento = parseInt($('#drummerInstrumentEffect_' + instrument + '_portamento_' + i).val(), 10);
      this.drumPatterns[this.selectedDrumPatternIndex].settings[instrument].portamento.push(portamento);
    }
  },

  chooseDrumPattern: function(index) {

    if(index === false) {
      this.patternId = false;
      $('#drummerParameters').html('Choose a Drum Pattern');

      return;
    }

    var instruments = {};
    instruments['snare'] = 1;
    instruments['tom'] = 2;
    instruments['bass'] = 3;
    instruments['hihatOpen'] = 4;
    instruments['hihatClosed'] = 5;
    instruments['clap'] = 7;
    instruments['bongo'] = 8;
    instruments['woodblock'] = 9;

    this.selectedDrumPatternIndex = index;
    this.patternId = this.music.patternView.getPatternId();

    var instrumentPatterns = this.drumPatterns[index].pattern;
    var controlsHTML = '';
    for(var instrument in instrumentPatterns) {
      if(instrumentPatterns.hasOwnProperty(instrument)) {
        var min = 0;
        var max = 1;

        for(var i = 0; i < instrumentPatterns[instrument].length; i++) {
          for(var j = 0; j < instrumentPatterns[instrument][i].length; j++) {
            if(instrumentPatterns[instrument][i][j] < min) {
              min = instrumentPatterns[instrument][i][j];
            }
            if(instrumentPatterns[instrument][i][j] > max) {
              max = instrumentPatterns[instrument][i][j];
            }
          }
        }
        var value = 1;
        var mappedTo =  instruments[instrument];

        if(typeof this.drumPatterns[index].settings == 'undefined') {
          this.drumPatterns[index].settings = {};
        }

        if(typeof this.drumPatterns[index].settings[instrument] == 'undefined') {
          this.drumPatterns[index].settings[instrument] = {};
        }

        if(typeof this.drumPatterns[index].settings[instrument].value != 'undefined') {
          value = this.drumPatterns[index].settings[instrument].value;
        } else {
          this.drumPatterns[index].settings[instrument] = { "value": value };
        }

        if(typeof this.drumPatterns[index].settings[instrument].mappedTo == 'undefined') {
          // map the drum pattern instrument to player instrument
          this.drumPatterns[index].settings[instrument].mappedTo = mappedTo;
        } else {
          mappedTo = this.drumPatterns[index].settings[instrument].mappedTo;
        }

        var effect = 'none';
        if(typeof this.drumPatterns[index].settings[instrument].effect == 'undefined') {
          this.drumPatterns[index].settings[instrument].effect = 'none';
        } else {
          effect = this.drumPatterns[index].settings[instrument].effect;
        }


        var pitch = 'constant';
        if(typeof this.drumPatterns[index].settings[instrument].pitch == 'undefined') {
          this.drumPatterns[index].settings[instrument].pitch = 'constant';
        } else {
          pitch = this.drumPatterns[index].settings[instrument].pitch;
        }

        var key = 0;
        if(typeof this.drumPatterns[index].settings[instrument].key == 'undefined') {
          this.drumPatterns[index].settings[instrument].key = 0;
        } else {
          key = this.drumPatterns[index].settings[instrument].key;
        }


        var scale = 'major';
        if(typeof this.drumPatterns[index].settings[instrument].scale == 'undefined') {
          this.drumPatterns[index].settings[instrument].scale = scale;
        } else {
          scale = this.drumPatterns[index].settings[instrument].scale;
        }

        var notes = [0, 2, 4];
        if(typeof this.drumPatterns[index].settings[instrument].notes == 'undefined') {
          this.drumPatterns[index].settings[instrument].notes = notes;
        } else {
          notes = this.drumPatterns[index].settings[instrument].notes;
        }

        var octaves = [4];
        if(typeof this.drumPatterns[index].settings[instrument].octaves == 'undefined') {
          this.drumPatterns[index].settings[instrument].octaves = octaves;
        } else {
          octaves = this.drumPatterns[index].settings[instrument].octaves;
        }

        var instrumentName = instrument;
        switch(instrumentName) {
          case 'bass':
            instrumentName = 'Kick';
            break;
          case 'snare':
            instrumentName = 'Snare';
            break;
          case 'hihatClosed':
            instrumentName = 'Hihat Closed';
            break;
          case 'hihatOpen':
            instrumentName = 'Hihat Open';
            break;
          case 'tom':
            instrumentName = 'Tom';
            break;
          case 'bongo':
            instrumentName = 'Bongo';
            break;
          case 'woodblock':
            instrumentName = 'Woodblock';
            break;

        }

        controlsHTML += '<div style="padding-bottom: 4px">';
        controlsHTML += '<h3 style="margin: 8px 0 2px 0; padding-bottom: 4px; font-size: 16px; border-bottom: 1px solid #aaaaaa">' + instrumentName + "</h3>";
        controlsHTML += '<div class="formRow">';
        controlsHTML += '<label class="controlLabel">Amount</label>'
        controlsHTML += '<input style="width: 300px" type="range" min="' + min + '" max="' + max + '" value="' + value + '" class="drummerInstrumentSlider" data-instrument="' + instrument + '" id="drummerInstrument-' + instrument + '">';
        controlsHTML += '</div>';

        controlsHTML += '<div class="formRow">';
        controlsHTML += '<label class="controlLabel">Mapped To</label>';
        controlsHTML += '<select class="drummerInstrumentMapping" data-instrument="' + instrument + '" id="drummerInstrumentMapping-' + instrument + '">';
        for(var i = 1; i < this.music.doc.data.instruments.length; i++) {
          controlsHTML += '<option value="' + i + '" ';
          if(mappedTo == i) {
            controlsHTML += ' selected="selected" ';
          }
          controlsHTML += '>' + this.music.doc.data.instruments[i].name + '</option>';

        }
        controlsHTML += '</select>';
        controlsHTML += '</div>';


        controlsHTML += '<div class="formRow">';
        controlsHTML += '<label class="controlLabel">Effect</label>';
        controlsHTML += '<label><input type="radio" ';
        if(effect == 'none') {
          controlsHTML += ' checked="checked" ';
        }
        controlsHTML += ' class="drummerInstrumentEffect"  name="drummerInstrumentEffect_' + instrument + '" value="none" data-instrument="' + instrument + '">None</label>';

        controlsHTML += '<label><input type="radio" ';
        if(effect == 'volume') {
          controlsHTML += ' checked="checked" ';
        }
        controlsHTML += ' class="drummerInstrumentEffect"  name="drummerInstrumentEffect_' + instrument + '" value="volume" data-instrument="' + instrument + '">Volume</label>';

        controlsHTML += '<label><input type="radio" ';
        if(effect == 'portamento') {
          controlsHTML += ' checked="checked" ';
        }
        controlsHTML += ' class="drummerInstrumentEffect"  name="drummerInstrumentEffect_' + instrument + '" value="portamento" data-instrument="' + instrument + '">Portamento</label>';


        controlsHTML += '</div>';



        // volume
        controlsHTML += '<div class="formRow" id="drummerInstrumentVolumeRow_' + instrument + '" ';

        if(effect != 'volume') {
          controlsHTML += ' style="display: none" ';
        }

        controlsHTML += '>';
        controlsHTML += '<label class="controlLabel">Volume</label>';
        for(var i = 0; i < 4; i++) {
          var volume = 12;
          switch(i) {
            case 0:
              volume = 14;
            break;
            case 1:
              volume = 8;
            break;
            case 2:
              volume = 10;
            break;
            case 3:
              volume = 5;
            break;            
          }
          if(typeof this.drumPatterns[index].settings[instrument].volume  != 'undefined' &&
            this.drumPatterns[index].settings[instrument].volume.length > i) {
            volume = this.drumPatterns[index].settings[instrument].volume[i];

          }

          controlsHTML += '<select class="drummerVolume" data-instrument="' + instrument + '" id="drummerInstrumentEffect_' + instrument + '_volume_' + i + '">';
          for(var j = 0; j < 16; j++) {
            controlsHTML += '<option value="' + j + '" ';
            if(j == volume) {
              controlsHTML += ' selected="selected" ';
            }
            controlsHTML += '>' + j + '</optiopn>';
          }
          controlsHTML += '</select>';
          controlsHTML += '&nbsp;&nbsp;';
        }
        controlsHTML += '</div>';




        // portamento
        controlsHTML += '<div class="formRow" id="drummerInstrumentPortamentoRow_' + instrument + '" ';

        if(effect != 'portamento') {
          controlsHTML += ' style="display: none" ';
        }

        controlsHTML += '>';
        controlsHTML += '<label class="controlLabel">Portamento</label>';
        for(var i = 0; i < 4; i++) {
          var portamento = 12;
          switch(i) {
            case 0:
              portamento = 14;
            break;
            case 1:
              portamento = 8;
            break;
            case 2:
              portamento = 10;
            break;
            case 3:
              portamento = 5;
            break;            
          }
          if(typeof this.drumPatterns[index].settings[instrument].portamento  != 'undefined' &&
            this.drumPatterns[index].settings[instrument].portamento.length > i) {
            portamento = this.drumPatterns[index].settings[instrument].portamento[i];

          }

          controlsHTML += '<select class="drummerPortamento" data-instrument="' + instrument + '" id="drummerInstrumentEffect_' + instrument + '_portamento_' + i + '">';
          for(var j = 0; j < 64; j++) {
            var value = j - 32;
            controlsHTML += '<option value="' + value + '" ';
            if(value == portamento) {
              controlsHTML += ' selected="selected" ';
            }
            controlsHTML += '>' + value + '</optiopn>';
          }
          controlsHTML += '</select>';
          controlsHTML += '&nbsp;&nbsp;';
        }
        controlsHTML += '</div>';


        controlsHTML += '<div class="formRow">';
        controlsHTML += '<label class="controlLabel">Pitch</label>';
        controlsHTML += '<label><input type="radio" ';
        if(pitch == 'constant') {
          controlsHTML += ' checked="checked" ';
        }
        controlsHTML += ' class="drummerInstrumentPitch"  name="drummerInstrumentPitch_' + instrument + '" value="constant" data-instrument="' + instrument + '">Constant</label>';

        controlsHTML += '<label><input type="radio" ';
        if(pitch == 'variable') {
          controlsHTML += ' checked="checked" ';
        }
        controlsHTML += ' class="drummerInstrumentPitch"  name="drummerInstrumentPitch_' + instrument + '" value="variable" data-instrument="' + instrument + '">Variable</label>';
        controlsHTML += '</div>';



        controlsHTML += '<div class="formRow" id="drummerInstrumentNotesHolder_' + instrument + '" ';
        if(pitch != 'variable') {
          controlsHTML += ' style="display: none" ';
        }
        controlsHTML += '>';

        controlsHTML += '<label class="controlLabel">Notes</label>';
        for(var i = 0; i < this.music.scales.scales[scale].intervals.length; i++) {
          var checked = '';
          for(var j = 0; j < notes.length; j++) {
            if(notes[j] == i) {
              checked = ' checked="checked" ';
            }
          }
          var note = i + 1;
          controlsHTML += '<label> <input type="checkbox"  ' + checked + ' value="' + i + '" class="drummerInstrumentNotes"  data-instrument="' + instrument + '" name="drummerInstrumentNotes_' + instrument + '">' + note + '</label>&nbsp;&nbsp';
        }
        controlsHTML += '</div>';


        controlsHTML += '<div class="formRow" id="drummerInstrumentOctavesHolder_' + instrument + '" ';

        if(pitch != 'variable') {
          controlsHTML += ' style="display: none" ';
        }

        controlsHTML += '>';
        controlsHTML += '<label class="controlLabel">Octaves</label>';
        for(var i = 0; i < 8; i++) {
          var checked = '';
          for(var j = 0; j < octaves.length; j++) {
            if(octaves[j] == i) {
              checked = ' checked="checked" ';
            }
          }
          controlsHTML += '<label> <input type="checkbox"  ' + checked + ' value="' + i + '" class="drummerInstrumentOctaves"  data-instrument="' + instrument + '" name="drummerInstrumentOctaves_' + instrument + '">' + i + '</label>&nbsp;&nbsp';
        }
        controlsHTML += '</div>';
      }
    }

    controlsHTML += '<div id="drummerKeys"></div>';

    $('#drummerParameters').html(controlsHTML);

    var _this = this;

    $('.drummerInstrumentSlider').on('input', function() {
      var value = $(this).val();
      var id = $(this).attr('id');
      var instrument = $(this).attr('data-instrument');
      console.log('instrument = ' + instrument + ' value = ' + value);
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].value = parseInt(value, 10);
      _this.applyDrumPattern();
    });

    $('.drummerInstrumentMapping').on('change', function() {
      var mappedTo = $(this).val();
      var instrument = $(this).attr('data-instrument');
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].mappedTo = parseInt(mappedTo, 10);
      _this.applyDrumPattern();
    });

    $('.drummerInstrumentEffect').on('click', function() {
      var instrument = $(this).attr('data-instrument');
      var effect = $('input[name=drummerInstrumentEffect_' + instrument + ']:checked').val();

      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].effect = effect;

      if(effect == 'volume') {
        $('#drummerInstrumentVolumeRow_' + instrument).show();
        _this.setVolumeValues(instrument);
      } else {
        $('#drummerInstrumentVolumeRow_' + instrument).hide();        
      }

      if(effect == 'portamento') {
        $('#drummerInstrumentPortamentoRow_' + instrument).show();
        _this.setPortamentoValues(instrument);

      } else {
        $('#drummerInstrumentPortamentoRow_' + instrument).hide();
      }
      _this.applyDrumPattern();
    });


    $('.drummerVolume').on('change', function() {
      var instrument = $(this).attr('data-instrument');

      _this.setVolumeValues(instrument);
      _this.applyDrumPattern();
    });

    $('.drummerPortamento').on('change', function() {
      var instrument = $(this).attr('data-instrument');

      _this.setPortamentoValues(instrument);
      _this.applyDrumPattern();
    });

    $('.drummerInstrumentPitch').on('click', function() {
      var instrument = $(this).attr('data-instrument');
      var pitch = $('input[name=drummerInstrumentPitch_' + instrument + ']:checked').val();
      console.log('set pitch to ' + pitch);

      if(pitch === 'variable') {
        $('#drummerInstrumentNotesHolder_' + instrument).show();
        $('#drummerInstrumentOctavesHolder_' + instrument).show();
      } else {
        $('#drummerInstrumentNotesHolder_' + instrument).hide();
        $('#drummerInstrumentOctavesHolder_' + instrument).hide();        
      }
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].pitch = pitch;
      _this.applyDrumPattern();
    });

/*
    $('.drummerInstrumentKey').on('change', function() {
      var instrument = $(this).attr('data-instrument');
      var key = parseInt($('#drummerInstrumentKey_' + instrument).val(), 10);
      console.log('set key to ' + key);
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].key = key;
      _this.applyDrumPattern();
    });


    $('.drummerInstrumentScale').on('change', function() {
      var instrument = $(this).attr('data-instrument');
      var scale = $('#drummerInstrumentScale_' + instrument).val();
      console.log('set scale to ' + scale);
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].scale = scale;
      _this.applyDrumPattern();
    });    
*/

    $('.drummerInstrumentNotes').on('click', function() {
      var instrument = $(this).attr('data-instrument');
      var notes = [];
      $('input[name=drummerInstrumentNotes_' + instrument + ']:checked').each(function() {
        notes.push( parseInt($(this).val(), 10));
      });

      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].notes = notes;
      _this.applyDrumPattern();

    });


    $('.drummerInstrumentOctaves').on('click', function() {
      var instrument = $(this).attr('data-instrument');
      var octaves = [];
      $('input[name=drummerInstrumentOctaves_' + instrument + ']:checked').each(function() {
        octaves.push( parseInt($(this).val(), 10));
      });

      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].octaves = octaves;
      _this.applyDrumPattern();

    });    

    this.keyChooserHTML();

    this.applyDrumPattern();
  },

  setMappings: function() {
    var _this = this;

    $('.drummerInstrumentMapping').each(function() {
      var mappedTo = $(this).val();
      var instrument = $(this).attr('data-instrument');
      _this.drumPatterns[_this.selectedDrumPatternIndex].settings[instrument].mappedTo = parseInt(mappedTo, 10);
    });

  },
  applyDrumPattern: function() {

    var patternId = this.patternId;
    if(patternId === false) {
      return;
    }

    this.setMappings();
    var drumPattern = this.drumPatterns[this.selectedDrumPatternIndex];

    //pattern.clear();
    this.music.patterns.clear(patternId);

    var patternLength = this.music.patterns.getDuration(patternId);

    // want to go through instruments backwards..
    var instrumentList = [];
    for(var instrument in drumPattern.pattern) {
      if(drumPattern.pattern.hasOwnProperty(instrument)) {
        instrumentList.push(instrument);
      }
    }

//    for(var instrument in drumPattern.pattern) {
    for(var k = instrumentList.length - 1; k >= 0; k--) {
      var instrument = instrumentList[k];
      var instrumentIndex = this.drumPatterns[this.selectedDrumPatternIndex].settings[instrument].mappedTo;
      if(typeof instrumentIndex != 'undefined') {
//        instrumentIndex = instruments[instrument];
        var instrumentPattern = drumPattern.pattern[instrument];
        var value = drumPattern.settings[instrument].value;
        var settings = drumPattern.settings[instrument];

        for(var notePosition = 0; notePosition < patternLength; notePosition += this.music.sidSpeed) {
          var bar = Math.floor(notePosition / 16);

          var i = Math.floor(notePosition / (4 * this.music.sidSpeed));
          i = i % instrumentPattern.length;
          var j = (notePosition / this.music.sidSpeed) % 4;

          if(instrumentPattern[i][j] && instrumentPattern[i][j] <= value ) {

            var pitch = 48;//36;            
            var duration = this.music.patternView.partsPerBeat;

            if(settings.pitch == 'variable') {
//              var key = parseInt(settings.key, 10);
//              var scale = settings.scale;

              var key = this.keys[bar].key;
              var scale = this.keys[bar].scale;

              var notes = settings.notes;
              var octaves = settings.octaves;

              var modeIntervals = this.music.scales.getIntervals(scale);

              var noteIndex = Math.floor( Math.random() * notes.length );
              noteIndex = noteIndex % notes.length;
              var note = notes[noteIndex];

//console.log('key = ' + key);
              var octaveIndex = Math.floor(Math.random() * octaves.length )
              octaveIndex = octaveIndex % octaves.length;
              var octave = octaves[octaveIndex];

              var pitch  = key + octave * 12;

              for(var j = 0; j < note; j++) {
                pitch += modeIntervals[j];
              }
            }

//            this.music.patterns.addNote(patternId, notePosition, instrumentIndex, pitch, duration);
            this.music.patterns.addNote(patternId, {
                                                      position: notePosition, 
                                                      instrumentId: instrumentIndex, 
                                                      pitch: pitch, 
                                                      duration: duration
                                                   });

            if(settings.effect == 'volume') {
              var volume = settings.volume;

              var sustainReleaseEffect = 6;

              var instrument = this.music.instruments.getInstrument(instrumentIndex);
              var sustain = instrument.sustain;
              var release = instrument.release;


              var barPosition = notePosition % 4;

              sustain = volume[barPosition];
/*
              if(notePosition % 4 == 0) {
                sustain = 15;
              } else {
                sustain = 3;
              }
*/
  
              var effect = sustainReleaseEffect;
              var param = (sustain << 4) + release;
              var param2 = 0;
              this.music.patterns.addParam(patternId, "effects", notePosition, {
                effect: effect,
                value1: param,
                value2: param2
              });
            }

            if(settings.effect == 'portamento') {
              var effect = 1;
              var param = 5000;
              var param2 = 0;

              var portamento = settings.portamento;              
              var barPosition = notePosition % 4;
              param = portamento[barPosition];
              if(param < 0) {
                param = -param;
                effect = 2;
              }

              param = param * 100;

/*
              if(notePosition % 4 == 0) {
                param = 5000;
              } else {
                param = 1000;
              }
*/
//              this.music.patterns.addEffect(patternId, notePosition, effect, param, param2);
              this.music.patterns.addParam(patternId, "effects", notePosition, {
                effect: effect,
                value1: param,
                value2: param2
              });

            }


          }
        }
      }
    } 


    this.music.patternView.drawPattern();

//    if(!this.music.musicPlayer2a.isPlaying()) {
    this.music.playMusic();
//    }
  },

}