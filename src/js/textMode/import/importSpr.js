var ImportSPR = function() {
  this.editor = null;

  this.sprites = [];

}
//  Details of the SpritePad SPD format
// https://csdb.dk/forums/index.php?roomid=7&topicid=125812

// https://github.com/Esshahn/spritemate/blob/master/src/js/Load.js
ImportSPR.prototype = {

  init: function(editor) {
    this.editor = editor;
  },

  doImport: function(args) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var multicolor = true;
    if(typeof args !== 'undefined') {
      if(typeof args.multicolor != 'undefined') {
        multicolor = args.multicolor;
      }
    }

    var graphic = this.editor.graphic;
    graphic.setDrawEnabled(false);
    this.editor.history.setEnabled(false);


    var tileWidth = this.getTileWidth();
    var tileHeight = this.getTileHeight();
    //var tiles = this.getTiles();

    var screenWidth = this.getGridWidth();
    var screenHeight = this.getGridHeight();    

    var tileSet = layer.getTileSet();

    var x = 0;
    var y = 0;

    if(multicolor) {
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
    } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);
    }

    layer.setCreateSpriteTiles(false);
    layer.setBlankTileId(0);

    layer.setC64Multi1Color(this.multiColor1);
    layer.setC64Multi2Color(this.multiColor2);


    for(var i = 0; i < this.sprites.length; i++) {
      var spriteData = this.sprites[i].spriteData;

      var tileId = tileSet.createTile();
      var foregroundColor = this.sprites[i].color;

      var tileData = [];

      for(var j = 0; j < spriteData.length; j++) {
        var b = spriteData[j];
        for(var k = 7; k >= 0; k--) {
          var p = (b >>> k) & 1;
          tileData.push(p);
        }
      }

      tileSet.setTileData(tileId, tileData);

      if(i !== 0) {
        var frame = graphic.insertFrame();
        graphic.setCurrentFrame(frame);
      }

      var args = {};
      args.update = false;
      args.x = x;
      args.y = y;
          
      args.t = tileId; 
      args.fc = foregroundColor;
      args.bc = this.editor.colorPaletteManager.noColor;

      layer.setCell(args);
    }

    layer.setCreateSpriteTiles(true);

    this.editor.history.setEnabled(true);

    graphic.setDrawEnabled(true);

  },


  getTileWidth: function() {
    return 24;
  },

  getTileHeight: function() {
    return 21;
  },

  getGridWidth: function() {
    return 1;
  },

  getGridHeight: function() {
    return 1;
  },

  getSprites: function() {
    return this.sprites;
  },

  readSPR: function(content) {
    console.log(content);
    var index = 0;
    var length = content.length;
    // 83, 80, 68
    var address = content[index++];
    var spriteCount = content[index++]; // ??

    length = length - 2;
    this.spriteCount = length / 64;

    console.log('sprite count = ' + this.spriteCount);

    this.sprites = [];
    for(var i = 0; i < this.spriteCount; i++) {
      var spriteData = [];
      for(var j = 0; j < 63; j++) {
        spriteData.push(content[index++]);
      }
      var extraByte = content[index++];;
      this.sprites.push({ 
        spriteData: spriteData,
        color: 1
      });
    }



  }

}
