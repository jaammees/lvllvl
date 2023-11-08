var ExportCharPad = function() {
  this.editor = null;
}

ExportCharPad.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportCharPadDialog", "title": "Export CharPad", "width": 300, "height": 100 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportCharPad.html', function() {
        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportCharPad();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

    } else {
      this.initContent();
    }

    UI.showDialog("exportCharPadDialog");
  },  

  initContent: function() {
    this.colorPerMode = this.editor.getColorPerMode();
    this.blockModeEnabled = this.editor.getBlockModeEnabled();

    $('#exportCharPadAs').val(g_app.fileManager.filename);

  },

  initEvents: function() {
    var _this = this;
  },

/**
  exportCharPad: function(args) {
    var columns = 16;
    console.log("EXPORT CHARPAD");
    
//    download(screenData, args.filename + '.txt', "application/txt");
  },
**/


  exportCharPadAs: function(args) {

    var currentFrame = this.editor.graphic.getCurrentFrame();

    if(typeof args.filename == 'undefined') {
      args.filename = g_app.fileManager.filename;
    }

    if(typeof args.format == 'undefined') {
      args.format = 'binary';
    }

    if(typeof args.layer == 'undefined') {
      args.layer = 'current';
    }

    if(typeof args.fromFrame == 'undefined') {
      args.fromFrame = currentFrame;
    }

    if(typeof args.toFrame == 'undefined') {
      args.toFrame = currentFrame;
    }


    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var frame = this.editor.graphic.getCurrentFrame();
    var tileSet = layer.getTileSet();
    
    var blockModeEnabled = layer.getBlockModeEnabled();
    var colorPerMode = layer.getColorPerMode();

    var blockCount  = 0;
    var blockWidth = 0;
    var blockHeight = 0;

    var blockSet = null;

    if(blockModeEnabled) {
      blockSet = layer.getBlockSet();
      if(blockSet) {
        blockCount = blockSet.getBlockCount();
        blockWidth = layer.getBlockWidth();
        blockHeight = layer.getBlockHeight();
      }
    }

    // cell, character, block

    //console.log('color per mode' + colorPerMode);



    var characters = [];
    var characterMap = {};
    var tileCount = tileSet.tileCount;




    // get the tiles used...
    if(colorPerMode == 'character') {
      for(var i = 0; i < tileCount; i++) {
        var color = tileSet.getTileColor(i);
        characters.push({
          tileSetIndex: i,
          color: color
        });
      }
    } else if(colorPerMode == 'block') {
      for(var i = 0; i < tileCount; i++) {
        var color = tileSet.getTileColor(i);
        characters.push({
          tileSetIndex: i,
          color: 0
        });
      }
    } else {

      for(var i = 0; i < tileCount; i++) {
        var color = this.editor.currentTile.getColor();
        var key = i + '-' + color;

        characterMap[key] = characters.length;
        characters.push({
          tileSetIndex: i,
          color: color
        });
      }


      var mapWidth = layer.getGridWidth();
      var mapHeight = layer.getGridHeight();

      // need to work out what characters used and what colours
//      for(var y = mapHeight - 1; y >= 0; y--) {
      for(var y = 0; y < mapHeight; y++) {
        for(var x = 0; x < mapWidth; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frame });
          var charIndex = cellData.t;
          var colorIndex = cellData.fc;
          var key = charIndex + '-' + colorIndex;

          if(!characterMap.hasOwnProperty(key)) {
            var index = characters.length;
            characters.push({
              tileSetIndex: charIndex,
              color: colorIndex
            }); 
            characterMap[key] = index;
          }
        }
      }


      // sort the characters here
      characters.sort(function(a, b){
        if(a.tileSetIndex != b.tileSetIndex) {
          return a.tileSetIndex - b.tileSetIndex;
        }

        return a.color - b.color;
      });

      characterMap = {};
      for(var i = 0; i < characters.length; i++) {
        var key = characters[i].tileSetIndex + '-' + characters[i].color;
        characterMap[key] = i;
      }

    }


    this.data = [];
    var data = this.data;

    // file_id CTM
    data.push(67);
    data.push(84);
    data.push(77);

    // version
    data.push(5);



    // colours       [04-07]   4 bytes : Project colours (only the low nybbles are of interest).
    //     [04] = Background/transparent colour.
    //     [05] = Character multi-colour 1.  
    //     [06] = Character multi-colour 2. 
    //     [07] = Character colour. (used for the 'Global' colouring method). 
    data.push(layer.getBackgroundColor(frame));
    data.push(layer.getC64Multi1Color(frame));
    data.push(layer.getC64Multi2Color(frame));
    data.push(0);// content[7];
 
    // colour_method [08]      1 byte  : Character colouring method (values 0-2 are valid).
    //                              (0 = Global, 1 = Per Tile, 2 = Per Character).

    if(colorPerMode == 'cell' || colorPerMode == 'character') {
      data.push(2);
    } else if(colorPerMode == 'block') {
      data.push(1);
    } else {
      // shouldn't get here
      data.push(0);
    }


    //flags         [09]      1 byte  : Various project flags:-  
    //
    //       bit 0 : Tile System (1 = Enabled).
    //       bit 1 : Expanded Data (1 = Yes).
    //       bit 2 : Multi-colour Mode (1 = Enabled). 
    var b = 0;

    if(blockModeEnabled) {
      b += 1;
    }

    if(!blockModeEnabled) {
      b += 2;
    }

    if(this.editor.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
      b += 4;
    }
    data.push(b);


    // Number of Characters
    // num_chars-1   [10,11]   2 bytes : Number of characters -1 (low byte, high byte).
    var numChars = characters.length;
    numChars--;
    data.push(numChars & 0xff);
    data.push((numChars & 0xff00) >> 8);


    // Number of tiles
    //num_tiles-1   [12,13]   2 bytes : Number of tiles -1 (low byte, high byte).
    var numBlocks = 0;

    if(blockModeEnabled) {
      numBlocks = blockCount;
    }
    if(numBlocks > 0) {
      numBlocks--;
    }
    data.push(numBlocks & 0xff);
    data.push((numBlocks & 0xff00) >> 8);

    // Tile Dimensions
    //tile_wid      [14]      1 byte  : Tile width (currently values of 1-8 are valid).
    //tile_hei      [15]      1 byte  : Tile height (currently values of 1-8 are valid).
    var tileWidth = 1;
    var tileHeight = 1;

    if(blockModeEnabled) {
      tileWidth = blockWidth;
      tileHeight = blockHeight;
    }
    data.push(tileWidth);
    data.push(tileHeight);

    //map_wid       [16,17]   2 bytes : Map width (low byte, high byte).
    //map_hei       [18,19]   2 bytes : Map height (low byte, high byte). 

    var mapWidth = Math.ceil(layer.getGridWidth() / tileWidth);
    var mapHeight = Math.ceil(layer.getGridHeight() / tileHeight);


    data.push(mapWidth & 0xff);
    data.push((mapWidth & 0xff00) >> 8);

    data.push(mapHeight & 0xff);
    data.push((mapHeight & 0xff00) >> 8);


    // char_data       The character set. (size = num_chars * 8 bytes).

    //            Each byte in this block represents the pixels of one row (of 8) for each character 
    //            definition, the sequence should be interpreted as groups of eight bytes where the 
    //            first byte in a group represents the topmost row of pixels in a character with the 
    //            following seven bytes representing each further row. 

    var tileCount = characters.length;

    for(var i = 0; i < tileCount; i++) {
      var tileIndex = characters[i].tileSetIndex;
      // get the character's xy position in the char image

      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
            // set the bit
          if(tileSet.getPixel(tileIndex, x, y)) {
            b = b | (1 << (7-x));
          }
        }
//        tileSetData[index++] = b;
        data.push(b);
      }
    }



    // char_attribs    The character attributes. (size = num_chars bytes).
    // Each byte should be interpreted as an "MMMMCCCC" bit pattern where 'M' is one of four 
    // material bits and 'C' is one of four colour bits. 
    // The colour attribute nybbles are only useful when colour_method = 2 (Per character)
    // and they should all read zero if any other character colouring method is used.   

    for(var i = 0; i < tileCount; i++) {
      var tileColor = characters[i].color;
      data.push(tileColor);
    }




                      console.log('number blocks = ' + blockCount + ',' + blockHeight + ',' + blockWidth);               
    // tile_data       The tile data. (size = num_tiles * tile_wid * tile_hei * 2 bytes).
    for(var i = 0; i < blockCount; i++) {

      for(var y = 0; y < blockHeight; y++) {
        for(var x = 0; x < blockWidth; x++) {
          var c = blockSet.getCharacterInBlock(i, x, y);

          data.push(c & 0xff);
          data.push( (c & 0xff00) >> 8);
        }
      }

    }

    // tile_colours    The tile colours. (size = num_tiles bytes).
    //            This block only exists if colour_method = 1 (Per tile).

    if(blockModeEnabled && colorPerMode == 'block') {
      for(var i = 0; i < blockCount; i++) {
        var color = blockSet.getBlockColor(i);

        data.push(color);
      }
    }


    // map_data        The map data. (size =  map_wid * map_hei * 2 bytes).

    if(blockModeEnabled) {
      var xIncrement = blockWidth;
      var yIncrement = blockHeight;

      var mapWidth = layer.getGridWidth();
      var mapHeight = layer.getGridHeight();

//      console.log('block: ' + blockWidth + ',' + blockHeight + ',' + mapHeight + ',' + mapWidth);;
      var blockCount = 0;

// reverseY      for(var y = mapHeight - 1; y >= 0; y -= yIncrement) {
      for(var y = 0; y < mapHeight;  y += yIncrement) {
        for(var x = 0; x < mapWidth; x += xIncrement) {
          var cellData = layer.getCell({ x: x, y: y, frame: frame });
          var blockIndex = cellData.b;
          blockCount++;
          console.log(blockCount + ': block index = ' + blockIndex);
          data.push(blockIndex & 0xff);
          data.push((blockIndex & 0xff00) >> 8);
        }
      }

 

    } else {
      // expanded data..
//      for(var y = mapHeight - 1; y >= 0; y--) {
      for(var y = 0; y < mapHeight; y++) {
        for(var x = 0; x < mapWidth; x++) {
          var cellData = layer.getCell({ x: x, y: y, frame: frame });
          var charIndex = cellData.t;
          var color = cellData.fc;
          var key = charIndex + '-' + color;

          if(colorPerMode == 'cell') {
            charIndex = characterMap[key];
          }
          data.push(charIndex & 0xff);
          data.push( (charIndex & 0xff00) >> 8) ;
        }
      }
    }


    var charPadData = new Uint8Array(data.length);
    for(var i = 0; i < charPadData.length; i++) {
      charPadData[i] = data[i];
    }

    var filename = args.filename + '.ctm';
    download(charPadData, filename, "application/ctm");

  },

  exportCharPad: function() {
    var args = {};
    args.filename = $('#exportCharPadAs').val();

    console.log('export char pad');
    this.exportCharPadAs(args);
  }  
}