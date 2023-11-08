if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var dataURL = this.toDataURL(type, quality).split(',')[1];
      setTimeout(function() {

        var binStr = atob( dataURL ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++ ) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || 'image/png'} ) );

      });
    }
  });
}

var TileSet = function() {
  this.tileSetId = null;
  this.name = '';
  this.label = '';
  this.type = 'petscii';

  this.charWidth = 8;
  this.charHeight = 8;
  this.charDepth = 8;

  this.pixelWidth = 1;
  this.pixelHeight = 1;
  this.pixelDepth = 1;

  // each pixel is 0.25 3d units
  // should really get this from grid, but grid needs a character set at the moment
  this.pixelTo3dUnits = 0.25;


  this.colorType = 'monochrome';
  this.customCharacterset = false;

  this.font = null;
  this.vectorData = [];


  // this is the current frame of each character
  this.currentTileData = [];

  // this is the character data in the doc.
  this.tileData = [];

  // 3d geometries for the characters
  this.characterGeometries = [];
  this.characterBackgroundGeometries = [];
  this.geometryDirty = [];

  // characters as 2d image data
  /*
  this.canvas = null;
  this.context = null;
  this.imageData = null;
  */


  this.importCanvas = null;
  this.importContext = null;

  this.tileCount = 25;
  this.editor = null;

  this.backgroundIsTransparent = true;

  this.paletteMaps = {};

  this.hFlipMap = [
  ];

  this.vFlipMap = [
  ];

  this.characterRotationSets = [
    //sharp corners
    [79,80,122,76],
    //inv. sharp corners
    [250,204,207,208],
    //diagonals
    [77,78,77,78],
    //inv. diagonals
    [206,205],
    //sharp turns
    [112,110,125,109],
    //inv. sharp turns
    [240,238,253,237],
    //soft turns
    [85,73,75,74],
    //inv. soft turns
    [203,202,213,201],
    //t-shapes
    [114,115,113,107],
    //inv. t-shapes
    [243,241,235,242],
    //corner bits
    [126,124,108,123],
    //inv. corner bits
    [236,251,254,252],
    //triangles
    [105,95,233,223],
    //halves
    [98,97,226,225],
    //edges
    [99,103,100,101],
    //inv. edges
    [231,228,229,227],
    //thick edges
    [119,106,111,116],
    //inv. thick edges

    // 3pixel line
    [121,117,120,118], 

    // 4 pixel line
    [98,97,226,225],

    // 5 pixel line
    [246,249,245,248],

    // 6 pixel line
    [234,239,244,247],

    // 7 pixel line
    [231,228,229,227],

    // 1pixel offset line
    [82,84,69,89],

    // 2 pixel offset line
    [70,71,68,72],

    // 3 pixel offset line
    [64,93],
    [66,67],

    // square bracket
    [27,29],
    [155,157],

    // round bracket
    [40,41,41,40],
    [168,169,169,168],

    // lt, gt
    [60,62,62,60],
    [188,190,190,188],

    // arrows
    [30,31,31,30],

    // 1/4 squares
    [127,255],

    // half check
    [92,104,92,104],
    [220,232],


    // full check
    [102,230,102,230],

    // cross
    [86,91],
    [214,219],
    /*
    [247,234,239,244],
    //suits
    [88,83,90,65],
    //inv. suits
    [216,211,218,193]
    */
  ];

  this.glyphCanvas = null;
  // used for vector fonts
  this.unitsPerEm = 1;
  this.ascent = 0;
  this.descent = 0;
  this.blankCharacter = 32;
  this.filledCharacter = false;
  this.vectorPetscii = false;

  this.tile3d = null;
}

TileSet.prototype = {
  setToVector: function(vectorFile, callback) {
    this.setType('vector');

    // test code, load the font
    var _this = this;

    var path = 'vectorsets/' + vectorFile + '.json?3'; 
    $.get(path, function(response) {
      _this.blankCharacter = 0;
      _this.vectorPetscii = false;
      if(vectorFile == 'petscii' || vectorFile == 'petscii-thin') {
        _this.vectorPetscii = true;
        _this.blankCharacter = 32;
      }

      /*
      if(vectorFile == 'imago-mundi-mei') {

        _this.unitsPerEm = 1000; 
        _this.ascent = 800;
        _this.descent = -200;
        _this.tileCount = 600;
      } else {
        _this.unitsPerEm = 720; 
        _this.ascent = 560;
        _this.descent = -160;
        _this.tileCount = 300;
      }
      */
      _this.docRecord.data.vectorData = response.data;
      _this.unitsPerEm = response.unitsPerEm;
      _this.ascent = response.ascent;
      _this.descent = response.descent;

      if(typeof response.blankTile != 'undefined') {
        _this.blankCharacter = response.blankTile;
      }

      if(typeof response.filledCharacter != 'undefined') {
        _this.filledCharacter = response.filledTile;
      }

      _this.vectorData = response.data;
      for(var i = 0; i < _this.vectorData.length; i++) {
        _this.vectorData[i].path2d = null;
      }

      _this.tileCount = _this.vectorData.length;
      var tileWidth = 8;// _this.charWidth;
      var tileHeight = 8;// _this.charHeight;

      if(typeof response.tileWidth != 'undefined') {
        tileWidth = response.tileWidth;
      }

      if(typeof response.tileHeight != 'undefined') {
        tileHeight = response.tileHeight;
      }

      _this.setCharDimensions(tileWidth, tileHeight);      
      _this.setSortMethods();


      if(typeof callback != 'undefined') {
        callback();
      }
    });
  },

  getFontScale: function(fontSize) {
    if(this.vectorData == null) {
      return 1;
    }

    return 1 / this.unitsPerEm;
    //return 1 / 720;
    //return 1 / 1000;

  },

  getFontAscent: function() {
    return this.ascent;
    //return 560;
    //return 800;
  },

  getFontDescent: function() {
    return this.descent;
//    return -160;

//    return -200;
  },


  getSVGPath: function(glyphIndex) {
    if(glyphIndex == this.editor.tileSetManager.noTile) {
      return false;
    }
    if(glyphIndex !== false && glyphIndex < this.vectorData.length) {
      return this.vectorData[glyphIndex].path;
    }    
    return false;
  },


  getGlyphPath: function(glyphIndex) {
    if(this.vectorData == null) {
      return null;
    }
    
    if(glyphIndex == this.editor.tileSetManager.noTile) {
      return null;
    }


//    glyphIndex += 0x800;//1200;

    if(glyphIndex !== false && glyphIndex < this.vectorData.length) {
      if(this.vectorData[glyphIndex].path2d == null) {
        this.vectorData[glyphIndex].path2d = new Path2D(this.vectorData[glyphIndex].path);
      }
      return this.vectorData[glyphIndex].path2d;
    }

    return null;

    /*
    var path = Typr.U.glyphToPath(this.font, glyphIndex);

    return path;
    */
  },




  getDocRecord: function() {
    return g_app.doc.getDocRecordById(this.tileSetId, '/tile sets');
  },

  getName: function() {
    var doc = this.getDocRecord();
    return doc.name;
  },


  modified: function() {
    if(g_app.openingProject) {
      return;
    }

    if(g_app.doc && this.docRecord && this.docRecord.name != null) {
      var path = '/tile sets/' + this.docRecord.name;
      g_app.doc.recordModified(this.docRecord, path);
    }
  },


  init: function(editor, name, id, type) {
    this.editor = editor;

    if(typeof name === 'undefined') {
      this.name = 'Tile Set';
    } else {
      this.name = name;
    }

    if(typeof type != 'undefined') {
      this.type = type;
    }

    this.tileSetId = id;

//    this.docRecord = g_app.doc.getDocRecord('/tile sets/' + this.name);
    this.docRecord = this.getDocRecord();// g_app.doc.getDocRecord('/color palettes/' + this.name);

    this.name = this.docRecord.name;


    if(typeof this.docRecord.data.tileData == 'undefined') {
      if(typeof this.docRecord.data.characterData != 'undefined') {
        this.docRecord.data.tileData = this.docRecord.data.characterData;
      } else {
        this.docRecord.data.tileData = [];
      }
    }
    this.tileData = this.docRecord.data.tileData;
    this.tileCount = this.tileData.length;

    this.charWidth = this.docRecord.data.width;
    this.charHeight = this.docRecord.data.height;
    
    // update the current data
    this.updateAllCharacterCurrentData();

    this.canvas = document.createElement('canvas');

    this.characterGeometries = [];
    this.characterBackgroundGeometries = [];
    this.geometryDirty = [];
    /*
    if(false && g_app.getEnabled('textmode3d')) {
      this.characterGeometries = [];
      this.characterBackgroundGeometries = [];
      for(var i = 0; i < 256; i++) {
        this.characterGeometries[i] = new THREE.Geometry();
        this.characterBackgroundGeometries[i] = new THREE.Geometry();
      }
    }
    */
  },

  nameChanged: function() {
    var record = this.getDocRecord();
    this.name = record.name;
  },
  getPath: function() {
    return '/tile sets/' + this.name;
  },
  
  setLabel: function(label) {
    this.label = label;
  },

  getType: function() {
    return this.type;
  },

  setTileDimensions: function(args) {
    var offsetX = args.offsetX;
    var offsetY = args.offsetY;
    var width = args.width;
    var height = args.height;

    var currentWidth = this.charWidth;
    var currentHeight = this.charHeight;

    this.charWidth = width;
    this.charHeight = height;
    
    this.docRecord.data.width = width;
    this.docRecord.data.height = height;

    // loop through tiles
    for(var t = 0; t < this.tileData.length; t++) {
      // loop through tile frames
      for(var f = 0; f < this.tileData[t].data.length; f++) {
        var currentPixels = this.tileData[t].data[f];
        var newPixels = [];

        for(var y = 0; y < height; y++) {
          for(var x = 0; x < width; x++) {
            newPixels.push(0);
          }
        }
        
        var p = 0;
        for(var y = 0; y < currentHeight; y++) {
          for(var x = 0; x < currentWidth; x++) {
            if(y < height && x < width) {
              newPixels[y * width + x] = currentPixels[y * currentWidth + x];
            }
          }
        }
        this.tileData[t].data[f] = newPixels;
      }
      this.updateCharacterCurrentData(t);
    }
  },
  
  setType: function(type) {

    this.type = type;

    if(g_app.doc && this.editor != null) {
      if(this.getTileWidth() == 8 && this.getTileHeight() == 8) {
        $('#drawTool_linesegment').show();

        // if current tool is linesegment, need to init the charset
        if(this.editor.tools.drawTools.tool == 'linesegment') {        
          this.editor.tools.drawTools.lineSegmentDraw.initCharset();
        }
      } else {
        $('#drawTool_linesegment').hide();
      }
    }
  },


  getId: function() {
    return this.tileSetId;
  },
  getHFlip: function(c) {
    if(this.hFlipMap[c] !== false) {
      return this.hFlipMap[c];
    }
    return c;
  },
  getVFlip: function(c) {
    if(this.vFlipMap[c] !== false) {
      return this.vFlipMap[c];
    }
    return c;
  },



  getCharacterDataCopy: function() {
    var dataCopy = [];
    for(var i = 0; i < this.tileCount; i++) {
      //dataCopy.push([]);
      var charData = [];
      for(var j = 0; j < this.tileData[i].data[0].length; j++) {
        charData.push(this.tileData[i].data[0][j]);
      }
      dataCopy.push(charData);
    }

    return dataCopy;
  },


  restoreCharacterDataFor: function(tileData, alteredCharacters) {
    //for(var i = 0; i < this.tileCount; i++) {
    for(var i =0 ; i < alteredCharacters.length; i++) {
      var c = alteredCharacters[i];
      var charData = tileData[c];
      for(var j = 0; j < this.tileData[c].data[0].length; j++) {
        this.tileData[c].data[0][j] = tileData[c][j];
      }
    }
  },

  getPaletteMap: function(mapName) {
    /*
    if(typeof this.paletteMaps[mapName] != 'undefined') {
      return this.paletteMaps[mapName];
    }
    */
    var docRecord = this.getDocRecord();

    var sortMethods = docRecord.data.sortMethods;
    for(var i = 0; i < sortMethods.length; i++) {
      if(sortMethods[i].id == mapName) {
        if(typeof sortMethods[i].map != 'undefined') {
          return sortMethods[i].map;
        }        
        break;
      }
    }

    return false;
  },

  setPaletteMap: function(mapName, map) {
    var docRecord = this.getDocRecord();

    var sortMethods = docRecord.data.sortMethods;
    var sortMethodIndex = false;
    for(var i = 0; i < sortMethods.length; i++) {
      if(sortMethods[i].id == mapName) {
        sortMethodIndex = i;
        break;
      }
    }

    if(sortMethodIndex === false) {
      sortMethodIndex = sortMethods.length;
      sortMethods.push({ name: mapName, id: mapName })
    }

    var sortMap = {
      rowsPerColumn: map.rowsPerColumn,
      data: []
    }

    for(var y = 0; y < map.length; y++) {
      sortMap.data[y] = [];
      for(var x = 0; x < map.data[y].length; x++) {
        sortMap.data[y][x] = map.data[y][x];
      }
    }

    sortMethods[sortMethodIndex].map = map;
  },

  buildHFlipMap: function() { 
    this.hFlipMap = [];
    for(var i = 0; i < this.tileCount; i++) {
      this.hFlipMap[i] = false;
    }

    if(this.getType() == 'vector') {
      return;
    }

    for(var c1 = 0; c1 < this.tileCount; c1++) {
      var c1Data = this.tileData[c1].data[0];
      for(var c2 = c1 + 1; c2 < this.tileCount; c2++) {
        var c2Data = this.tileData[c2].data[0];
        var foundMatch = true;
        for(var y = 0; y < this.charHeight; y++) {
          var rowPos = y * this.charWidth;
          for(var x = 0; x < this.charWidth; x++) {
            if(c1Data[rowPos + x] != c2Data[rowPos + this.charWidth - 1 - x]) {
              foundMatch = false;
              x = this.charWidth;
              y = this.charHeight;
              break;

            }
          }
        }

        if(foundMatch) {
          this.hFlipMap[c1] = c2;
          this.hFlipMap[c2] = c1;
          break;
        }
      }
    }
  },

  buildVFlipMap: function() { 
    this.vFlipMap = [];
    for(var i = 0; i < this.tileCount; i++) {
      this.vFlipMap[i] = false;
    }

    if(this.getType() == 'vector') {
      return;
    }

    for(var c1 = 0; c1 < this.tileCount; c1++) {
      var c1Data = this.tileData[c1].data[0];
      for(var c2 = c1 + 1; c2 < this.tileCount; c2++) {
        var c2Data = this.tileData[c2].data[0];
        var foundMatch = true;
        for(var y = 0; y < this.charHeight; y++) {
          var row1Pos = y * this.charWidth;
          var row2Pos = (this.charHeight - 1 - y) * this.charWidth;
          for(var x = 0; x < this.charWidth; x++) {
            if(c1Data[row1Pos + x] != c2Data[row2Pos + x]) {
              foundMatch = false;
              x = this.charWidth;
              y = this.charHeight;
              break;

            }
          }
        }

        if(foundMatch) {
          this.vFlipMap[c1] = c2;
          this.vFlipMap[c2] = c1;
          break;
        }
      }
    }

    if(this.type == 'petscii') {
      this.vFlipMap[95] = 233;
      this.vFlipMap[233] = 95;

      this.vFlipMap[105] = 223;
      this.vFlipMap[223] = 105;

    }
  },


  // create a new array to store pixel data for the tile
  newPixelData: function(length) {
    var size = length;

    if(typeof length == 'undefined') {
      size = this.charWidth * this.charHeight;
    }

    var pixelData = [];
    for(var i = 0; i < size; i++) {
      pixelData.push(0);
    }
    return pixelData;
  },

  // current character data has the current frame for each character
  updateCharacterCurrentData: function(character) {
    if(character >= this.tileData.length) {
      return;
    }
    var props = this.tileData[character].props;
    var tileData = this.tileData[character].data;

    while(this.currentTileData.length <= character) {
      this.currentTileData.push([]);
    }
    var frameIndex = 0;

    for(var i = 0; i < tileData[frameIndex].length; i++) {
      this.currentTileData[character][i] = tileData[frameIndex][i];
    }

  },

  findRotatedChar: function(c1) {
    if(this.charWidth != this.charHeight) {
      return c1;
    }

    var c1Data = this.tileData[c1].data[0];
    for(var c2 = 0; c2 < this.tileCount; c2++) {
      var c2Data = this.tileData[c2].data[0];
      var foundMatch = true;
      for(var y = 0; y < this.charHeight; y++) {
        var rowPos = y * this.charWidth;
        for(var x = 0; x < this.charWidth; x++) {
          if(c1Data[rowPos + x] != c2Data[ (this.charWidth - 1 - y) + x * this.charWidth]) {
            foundMatch = false;
            x = this.charWidth;
            y = this.charHeight;
            break;
          }
        }
      }

      if(foundMatch) {
        return c2;
      }
    }

    return c1;
  },

  findHShiftedChar: function(c) {

  },

  findVShiftedChar: function(c) {

  },

  findShiftedInvertedChar: function(c) {

  },

  getTileRotation: function(c, rotation) {
    if(this.type == 'petscii') {
      for(var i = 0; i < this.characterRotationSets.length; i++) {
        for(var j = 0; j < this.characterRotationSets[i].length; j++) {
          if(this.characterRotationSets[i][j] == c) {
            rotation = rotation % this.characterRotationSets[i].length;
            if(rotation < this.characterRotationSets[i].length) {
              return this.characterRotationSets[i][rotation];
            }

            // 
            break;
          }
        }
      }
      return c;
    }

  },

  getCharNextRotation: function(c) {

    if(this.type == 'petscii') {
      for(var i = 0; i < this.characterRotationSets.length; i++) {
        for(var j = 0; j < this.characterRotationSets[i].length; j++) {
          if(this.characterRotationSets[i][j] == c) {
            j++;
            if(j >= this.characterRotationSets[i].length) {
              j = 0;
            }
            return this.characterRotationSets[i][j];
          }
        }
      }
      return false;
    }

    if(this.type !== 'vector') {
      return this.findRotatedChar(c);
    }

    return false;
  },

  // set the current data for all characters
  updateAllCharacterCurrentData: function() {
    for(var i = 0; i < this.tileData.length; i++) {
      this.updateCharacterCurrentData(i);
    }
  },

  getTileCount: function() {

    return this.tileCount;
  },


  copyTile: function(from, to) {

    var fromProps = this.tileData[from].props;
    var fromData = this.tileData[from].data;
    var toProps = this.tileData[to].props;
    var toData = [];

    for(var key in fromProps) {
      if(fromProps.hasOwnProperty(key)) {

        toProps[key] = fromProps[key];
      }
    }

    for(var i = 0; i < fromData.length; i++) {
      var fromFrameData = fromData[i];
      var toFrameData = [];
      for(var j = 0; j < fromFrameData.length; j++) {
        toFrameData.push(fromFrameData[j]);        
      }
      toData.push(toFrameData);


    }
    this.tileData[to].data = toData;


    this.updateAllCharacterCurrentData();
  },

  duplicateTile: function(tile) {


    var newTile = this.tileCount;
    this.setTileCount(this.tileCount + 1);

    // copy tile to new tile
    this.copyTile(tile, newTile);

    return newTile;
  },

  createTile: function() {
    // create a new tile
    var tileId = false;

    var tileCount = this.getTileCount();
    tileId = tileCount;
    this.setTileCount(tileCount + 1);
    return tileId;
  },


  setTileCount: function(tileCount) {

    while(this.tileData.length < tileCount) {
      var pixelCount = this.charWidth * this.charHeight;
      //new Uint16Array(pixelCount)
      // data is array of frames of pixels

      var noColor = g_app.textModeEditor.colorPaletteManager.noColor;

      this.tileData.push({
        data: [ this.newPixelData(pixelCount) ],
        props: {
          animated: false,
          ticksPerFrame: 1,
          frameCount: 1,
          frame: 0,
          lastTick: 0,
          fc: 1,
          bc: noColor
        }
      });
    }
    this.tileCount = tileCount;

    this.modified();

    this.updateAllCharacterCurrentData();
  },

  getTileColor: function(character) {
    if(character !== false && character != this.editor.tileSetManager.noTile && character < this.tileData.length && typeof this.tileData[character].props.fc != 'undefined') {
      return this.tileData[character].props.fc;
    }
    return 1;
  },

  setTileColor: function(character, color) {
    if(character != this.editor.tileSetManager.noTile &&  character < this.tileData.length) {
      this.tileData[character].props.fc = color;
      this.modified();
    }
  },

  getTileBGColor: function(character) {
    if(character != this.editor.tileSetManager.noTile && character < this.tileData.length && typeof this.tileData[character].props.bc != 'undefined') {
      return this.tileData[character].props.bc;
    }
    return 0;
  },

  setTileBGColor: function(character, color) {
    if(character != this.editor.tileSetManager.noTile &&  character < this.tileData.length) {
      this.tileData[character].props.bc = color;
      this.modified();
    }
  },


  getTileMaterial: function(tileId) {
    if(tileId != this.editor.tileSetManager.noTile && tileId !== false 
      && tileId < this.tileData.length && typeof this.tileData[tileId].props.m != 'undefined') {
      return this.tileData[tileId].props.m;
    }
    return 0;
  },

  setTileMaterial: function(tileId, material) {
    if(tileId != this.editor.tileSetManager.noTile &&  tileId < this.tileData.length) {
      this.tileData[tileId].props.m = material;
    }
  },

  getCharacterBGColor: function(character) {
    if(character != this.editor.tileSetManager.noTile && character < this.tileData.length && typeof this.tileData[character].props.bc != 'undefined') {
      return this.tileData[character].props.bc;
    }
    return this.editor.colorPaletteManager.noColor;
  },

  setCharacterBGColor: function(character, color) {

    this.tileData[character].props.bc = color;
    this.modified();
  },

  // clear all data to do with character set
  clear: function() {

  },

  isDefaultTileSet: function(type) {
    // TODO: need to test if default character set..
    return false;
  },

  setToPreset: function(preset, callback) {
    var mode = 'textmode';
    var pos = preset.indexOf(':');
    if(pos != -1) {
      mode = preset.substring(0, pos);
      preset = preset.substring(pos + 1);
    }

    if(mode == 'vector') {
      this.setToVector(preset, callback);
      return;
    }



    var filename = false;
    var charWidth = 8;
    var charHeight = 8;

    var type = 'ascii';
    var name = '';

    // get the width, height and image filename for the preset
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var id =  CharacterSetPresets[category].characterSets[i].id;
          var options = CharacterSetPresets[category].characterSets[i].options;
          var foundOption = false;

          if(typeof options != 'undefined') {
            for(var j = 0; j < options.length; j++) {
              if(preset == options[j].id) {
                charWidth = CharacterSetPresets[category].characterSets[i].width;
                charHeight = CharacterSetPresets[category].characterSets[i].height;
                if(typeof CharacterSetPresets[category].characterSets[i].type != 'undefined') {
                  type = CharacterSetPresets[category].characterSets[i].type;

                }
                if(typeof CharacterSetPresets[category].characterSets[i].name != 'undefined') {
                  name = CharacterSetPresets[category].characterSets[i].name;
                }

                filename = options[j].id + ".png";        
                foundOption = true;
                break;        
              }
            }
          }

          if(foundOption) {
            break;
          }
          if(id == preset) {
            charWidth = CharacterSetPresets[category].characterSets[i].width;
            charHeight = CharacterSetPresets[category].characterSets[i].height;
            if(typeof CharacterSetPresets[category].characterSets[i].type != 'undefined') {
              type = CharacterSetPresets[category].characterSets[i].type;
            }
            if(typeof CharacterSetPresets[category].characterSets[i].name != 'undefined') {
              name = CharacterSetPresets[category].characterSets[i].name;
            }

            filename = id + ".png";
            break;
          }
        }
      }
    }

    if(filename === false) {
      // invalid preset
      return;
    }   

    var _this = this;
    var url = "charsets/" + filename;
    var img = new Image();
    img.onload = function() {
      _this.type = type;

      _this.customCharacterset = preset !== 'petscii';
      _this.type = type;
      _this.label = name;
      _this.preset = preset;

      _this.setCharDimensions(charWidth, charHeight);
      _this.importImage(img);
      _this.setSortMethods();


      if(callback) {
        callback();
      }
    }
    img.src = url;
  },

  copyTileSet: function(srcTileSet) {

    this.type = srcTileSet.getType();
    this.label = srcTileSet.label;
    this.setCharDimensions(srcTileSet.getTileWidth(), srcTileSet.getTileHeight());
    this.docRecord = this.getDocRecord();
    this.docRecord.data.tileData = [];
    this.tileData = this.docRecord.data.tileData;

    var srcTileData = srcTileSet.tileData;

    this.setTileCount(srcTileData.length);
    if(this.type == 'vector') {
      // is this needed?
      this.docRecord.data.type = 'vector';
      console.log(this.docRecord);
      this.vectorData = [];
      var srcVectorData = srcTileSet.vectorData;

      for(var i = 0; i < srcVectorData.length; i++) {
        this.vectorData.push({
          "name": srcVectorData[i].name,
          "unicode": srcVectorData[i].unicode,
          "path": srcVectorData[i].path,
          "path2d": null
        });
      }
      this.docRecord.data.vectorData = this.vectorData;

      this.unitsPerEm = srcTileSet.unitsPerEm; 
      this.ascent = srcTileSet.ascent;
      this.descent = srcTileSet.descent;
      this.setTileCount(srcVectorData.length);        
    }

    for(var c = 0; c < srcTileData.length; c++) {
      this.tileData[c] = srcTileData[c];
      var props = {
        animated: false,
        ticksPerFrame: 1,
        frameCount: 1,
        frame: 0,
        lastTick: 0,
        fc: 1,
        bc: this.editor.colorPaletteManager.noColor          
      };

      if(typeof srcTileData[c].props !== 'undefined') {
        if(typeof srcTileData[c].props.animated != 'undefined') {
          props.animated = srcTileData[c].props.animated;
          props.frameCount = srcTileData[c].props.frames;
          props.ticksPerFrame = srcTileData[c].props.ticksPerFrame;
        } 

        if(typeof srcTileData[c].props.fc != 'undefined') {
          props.fc = srcTileData[c].props.fc;
        }

        if(typeof srcTileData[c].props.bc != 'undefined') {
          props.bc = srcTileData[c].props.bc;
        }

        if(typeof srcTileData[c].props.m != 'undefined') {
          props.m = srcTileData[c].props.m;
        }
      }

      this.tileData[c].props = props;
    }
    
    this.setSortMethods();
    this.updateAllCharacterCurrentData();
    this.refreshFromImageData();
  },


  getSortMethods: function() {
    if(typeof this.docRecord.data.sortMethods == 'undefined') {
      this.setSortMethods();
    }
    return this.docRecord.data.sortMethods;
  },

  setSortMethods: function() {
    if(g_app.doc == null || this.editor == null) {
      return;
    }
    
    if(this.type == 'petscii' || (this.type == 'vector' &&  this.vectorPetscii ) ) {    
      this.docRecord.data.sortMethods =  [
        {
          "name": "Tile Index",
          "id": "source"
        },
        {
          "name": "Columns of 16",
          "id": "columns"
        },
        {
          "name": "Group Similar",
          "id": "similar"
        },

        {
          "name": "Group Graphic",
          "id": "petsciigraphic"
        },
        {
          "name": "Custom",
          "id": "custom"
        }
      ];
    } else {
      this.docRecord.data.sortMethods =  [
        {
          "name": "Tile Index",
          "id": "source"
        },
        {
          "name": "Columns of 16",
          "id": "columns"
        },
        {
          "name": "Custom",
          "id": "custom"
        }

      ];
    }
  },
  
  setCharDimensions: function(width, height) {
    this.charWidth = width;
    this.charHeight = height;

    if(g_app.doc && this.docRecord && this.docRecord.data) {
      this.docRecord.data.width = width;
      this.docRecord.data.height = height;
      this.modified();
    }

    var dataLength = width * height;
    for(var i = 0; i < this.tileData.length; i++) {
      var frames = this.tileData[i].data.length;
      for(var frame = 0; frame < frames; frame++) {
        if(this.tileData[i].data[frame].length != dataLength) {
          this.tileData[i].data[frame] = this.newPixelData(dataLength);
          // copy old data??
        }
      }
    }
  },

  getTileWidth: function() {
    return this.charWidth;
  },

  getTileHeight: function() {
    return this.charHeight;
  },

  getTileDepth: function() {
    return this.charDepth;
  },


  // return blank character if the tileset has one
  getBlankCharacter: function() {
    return this.getBlankTile();
  },

  getBlockTile: function() {
    return this.filledCharacter;
  },

  getBlankTile: function() {
    var blankCharacter = 32;
    var blank = true;

    if(this.tileCount == 0) {
      return 0;
    }

    if(this.type == 'vector') {
      return this.blankCharacter;
    }

    if(blankCharacter > this.tileCount) {
      blankCharacter = this.tileCount - 1;
    }
    // check character 32 first
    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        var pixel = this.getPixel(blankCharacter, x, y);
        if(pixel > 0) {
          blank = false;
          y = this.charHeight;
          break;
        }
      }
    }

    if(blank) {
      return blankCharacter;
    }

    for(var c = 0; c < this.tileCount; c++) {
      var blank = this.isBlank(c);

      if(blank) {
        return c;
      }

    }
    return false;
  },

  isBlank: function(tileIndex) {

    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        var pixel = this.getPixel(tileIndex, x, y);
        if(pixel > 0) {
          return false;
        }
      }
    }

    return true;

  },

  getAttribBinaryData: function(args) {
    var binaryData = new Uint8Array(this.tileCount);
    for(var i = 0; i < this.tileCount; i++) {
      var colour = this.getTileColor(i) & 0xf;
      var material = this.getTileMaterial(i) & 0xf;

      var value = colour + (material << 4);
      binaryData[i] = value;

    }

    return binaryData;

  },
  getBinaryData: function(args) {

    var tileSetData = [];//new Uint8Array(dataSize);
    var index = 0;

    if(typeof args != 'undefined' && args.format == 'c64') {
      tileSetData[index++] = 0x00;
      tileSetData[index++] = 0x38;
    }

    for(var i = 0; i < this.tileCount; i++) {
      var c = i;

      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
            // set the bit
          if(this.getPixel(c, x, y)) {
            b = b | (1 << (7-x));
          }
        }
        //this.charsetData.push(b);
        tileSetData[index++] = b;
      }
    }


    var tileSetBinaryData = new Uint8Array(tileSetData.length);
    for(var i = 0; i < tileSetData.length; i++) {
      tileSetBinaryData[i] = tileSetData[i];
    }

    return tileSetBinaryData;
  },

  exportBinary: function(filename, args) {
    var binaryData = this.getBinaryData(args);
    if(filename.indexOf('.bin') == -1) {
      filename += ".bin";
    }

    download(binaryData, filename, "application/bin");    


  },

  exportPngFromMap: function(args) {
    var map = args.map;

    var height = map.length;
    var width = map[0].length;

    if(this.importCanvas == null) { 
      this.importCanvas = document.createElement("canvas");
    }
    this.importCanvas.width = width * this.charWidth;
    this.importCanvas.height = height * this.charHeight;
    this.importContext = this.importCanvas.getContext("2d");
    this.importContext.clearRect(0, 0, this.importCanvas.width, this.importCanvas.height);

    var imageData = this.importContext.getImageData(0, 0, this.importCanvas.width, this.importCanvas.height);

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        var cell = map[y][x];
        var ch = cell.c;
        var fc = cell.fc;
        var bc = cell.bc;




        if(ch !== -1) {
          var args = {};
          args['imageData'] = imageData;
          args['character'] = ch;
          /*
          args['colorRGB'] = 0xffffff;
          args['bgColorRGB'] = false;//0x000000;
          */

          args['color'] = fc;
          args['bgColor'] = bc;
          args['scale'] = 1;
          args['x'] = x * this.charWidth;
          args['y'] = y * this.charHeight;
          this.drawCharacter(args);
        }

      }
    }


    this.importContext.putImageData(imageData, 0, 0);    
    var dataURL = this.importCanvas.toDataURL("image/png").split(',')[1];

    var binStr = atob( dataURL ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i = 0; i < len; i++ ) {
      arr[i] = binStr.charCodeAt(i);
    }

    return new Blob( [arr], {type:  'image/png'} );
  },


  exportPng: function(args) {
    var filename = false;

    if(this.importCanvas == null) { 
      this.importCanvas = document.createElement("canvas");
    }

    var tileCount = this.getTileCount();
    var tilesAcross = 16;
    var tilesDown = Math.ceil(tileCount / tilesAcross);
    
    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }
      if(typeof args.tilesAcross != 'undefined') {
        tilesAcross = args.tilesAcross;
      }
    }


    //this.importCanvas.width = 16 * this.charWidth;
    //this.importCanvas.height = 16 * this.charHeight;
    this.importCanvas.width = tilesAcross * this.charWidth;
    this.importCanvas.height = tilesDown * this.charHeight;
    this.importContext = this.importCanvas.getContext("2d");
    this.importContext.clearRect(0, 0, this.importCanvas.width, this.importCanvas.height);

    var imageData = this.importContext.getImageData(0, 0, this.importCanvas.width, this.importCanvas.height);

    for(var y = 0; y < tilesDown; y++) {
      for(var x = 0; x < tilesAcross; x++) {
        var tileIndex = x + y * tilesAcross;
        if(tileIndex < tileCount) {
          var args = {};
          args['imageData'] = imageData;
          args['character'] = tileIndex;
          args['colorRGB'] = 0xffffff;
          args['bgColorRGB'] = false;//0x000000;
    
          args['scale'] = 1;
          args['x'] = x * this.charWidth;
          args['y'] = y * this.charHeight;
          this.drawCharacter(args);
    
        }
      }
    }


    this.importContext.putImageData(imageData, 0, 0);



    if(filename !== false) {
      if(filename.indexOf('.png') == -1) {
        filename += ".png";
      }
      var dataURL = this.importCanvas.toDataURL("image/png");

      if(UI.isMobile.any()) {
        mobileDownload({ data: dataURL, filename: filename, mimeType: "image/png" });
//        window.open(dataURL);
      } else {
        download(dataURL, filename, "image/png");    
      }
    } else {
//      return this.importCanvas;

      var dataURL = this.importCanvas.toDataURL("image/png").split(',')[1];

      var binStr = atob( dataURL ),
          len = binStr.length,
          arr = new Uint8Array(len);

      for (var i = 0; i < len; i++ ) {
        arr[i] = binStr.charCodeAt(i);
      }

      return new Blob( [arr], {type:  'image/png'} );
    }
  },



  readJsonData: function(args) {

    var jsonData = args.jsonData;

    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }

    var characterWidth = this.charWidth;
    if(typeof jsonData.data.width != 'undefined') {
      characterWidth = jsonData.data.width;
    }
    var characterHeight = this.charHeight;
    if(typeof jsonData.data.height != 'undefined') {
      characterHeight = jsonData.data.height;
    }

    var scale = 1;
    if(typeof args.scale != 'undefined') {
      scale = args.scale;
    }

    var tileData = jsonData.data.tileData;


    if(dstImageData == null) {
      // importing into this character set. initialise it

      if(g_app.doc) {
        this.docRecord = this.getDocRecord();
        this.docRecord.data.tileData = [];
        this.tileData = this.docRecord.data.tileData;
      } else {
        this.tileData = [];
      }

      this.setCharDimensions(characterWidth, characterHeight);
      this.setTileCount(tileData.length);
    }


    var dstCharactersAcross = 16;
    if(typeof args.dstCharactersAcross != 'undefined') {
      dstCharactersAcross = args.dstCharactersAcross;
    }
    
    var dstCharacterSpacing = 1;//this.gridLineWidth;
    if(typeof args.dstCharacterSpacing != 'undefined') {
      dstCharacterSpacing = args.dstCharacterSpacing;
    }


    for(var c = 0; c < tileData.length; c++) {
      var charData = tileData[c].data[0]; // first frame..

      var dstCharX = c % dstCharactersAcross;
      var dstCharY = Math.floor(c / dstCharactersAcross);

      if(dstImageData == null) {
        // loading, not previewing
        this.tileData[c] = tileData[c];

      } else {
        for(var y = 0; y < characterHeight * scale; y++) {
          for(var x = 0; x < characterWidth * scale; x++) {
            var pos = Math.floor(x / scale) + Math.floor(y / scale) * characterWidth;

            var dstPos = 0;
            if(dstImageData) {
              var dstX = dstCharacterSpacing + dstCharX * (characterWidth * scale + dstCharacterSpacing) + x;
              var dstY = dstCharacterSpacing + dstCharY * (characterHeight * scale + dstCharacterSpacing) + y;
              dstPos = (dstX + dstY * dstImageData.width) * 4;
            }

            var pixelValue = charData[pos];
            var onVal = 255;
            var offVal = 0;

            if(pixelValue > 0) {
              dstImageData.data[dstPos] = onVal;
              dstImageData.data[dstPos + 1] = onVal;
              dstImageData.data[dstPos + 2] = onVal;
              dstImageData.data[dstPos + 3] = onVal;
            } else {
              dstImageData.data[dstPos] = offVal;
              dstImageData.data[dstPos + 1] = offVal;
              dstImageData.data[dstPos + 2] = offVal;
              dstImageData.data[dstPos + 3] = 255;
            }
          }
        }
      }
    }


    if(dstImageData == null) {
      this.updateAllCharacterCurrentData();
      this.refreshFromImageData();    
    }
  },

  readCharPad: function(args) {
    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }

  },


  readJsonDataV1: function(args) {

    var jsonData = args.jsonData;

    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }


    var characterWidth = this.charWidth;
    if(typeof jsonData.width != 'undefined') {
      characterWidth = jsonData.width;
    }
    var characterHeight = this.charHeight;
    if(typeof jsonData.height != 'undefined') {
      characterHeight = jsonData.height;
    }

    var scale = 1;
    if(typeof args.scale != 'undefined') {
      scale = args.scale;
    }

    var tileData = jsonData.tiles;



    if(dstImageData == null) {
      // importing into this character set. initialise it
      this.docRecord = this.getDocRecord();
      this.docRecord.data.tileData = [];
      this.tileData = this.docRecord.data.tileData;

      this.setCharDimensions(characterWidth, characterHeight);
      this.setTileCount(tileData.length);

      if(typeof jsonData.type != 'undefined') {
        if(jsonData.type == 'vector') {
          this.type = 'vector';

          // is this needed?
          this.docRecord.data.type = 'vector';
          console.log(this.docRecord);

          var vectorData = jsonData.vectorData;

          this.vectorData = [];
          for(var i = 0; i < vectorData.length; i++) {
            this.vectorData.push({
              "name": vectorData[i].name,
              "unicode": vectorData[i].unicode,
              "path": vectorData[i].path,
              "path2d": null
            });
          }
          this.docRecord.data.vectorData = this.vectorData;

          this.unitsPerEm = jsonData.unitsPerEm; 
          this.ascent = jsonData.ascent;
          this.descent = jsonData.descent;
          this.setTileCount(vectorData.length);

          
        }
      }
    }



    var dstCharactersAcross = 16;
    if(typeof args.dstCharactersAcross != 'undefined') {
      dstCharactersAcross = args.dstCharactersAcross;
    }
    
    var dstCharacterSpacing = 1;//this.gridLineWidth;
    if(typeof args.dstCharacterSpacing != 'undefined') {
      dstCharacterSpacing = args.dstCharacterSpacing;
    }


    for(var c = 0; c < tileData.length; c++) {
      var charData = tileData[c].data[0]; // first frame..

      var dstCharX = c % dstCharactersAcross;
      var dstCharY = Math.floor(c / dstCharactersAcross);

      if(dstImageData == null) {
        // loading, not previewing
        this.tileData[c] = tileData[c];
        var props = {
          animated: false,
          ticksPerFrame: 1,
          frameCount: 1,
          frame: 0,
          lastTick: 0,
          fc: 1,
          bc: this.editor.colorPaletteManager.noColor          
        };

        if(typeof tileData[c].props !== 'undefined') {
          if(typeof tileData[c].props.animated != 'undefined') {
            props.animated = tileData[c].props.animated;
            props.frameCount = tileData[c].props.frames;
            props.ticksPerFrame = tileData[c].props.ticksPerFrame;
          } 

          if(typeof tileData[c].props.fc != 'undefined') {
            props.fc = tileData[c].props.fc;
          }

          if(typeof tileData[c].props.bc != 'undefined') {
            props.bc = tileData[c].props.bc;
          }

          if(typeof tileData[c].props.m != 'undefined') {
            props.m = tileData[c].props.m;
          }

        }

        this.tileData[c].props = props;


      } else {
        for(var y = 0; y < characterHeight * scale; y++) {
          for(var x = 0; x < characterWidth * scale; x++) {
            var pos = Math.floor(x / scale) + Math.floor(y / scale) * characterWidth;

            var dstPos = 0;
            if(dstImageData) {
              var dstX = dstCharacterSpacing + dstCharX * (characterWidth * scale + dstCharacterSpacing) + x;
              var dstY = dstCharacterSpacing + dstCharY * (characterHeight * scale + dstCharacterSpacing) + y;
              dstPos = (dstX + dstY * dstImageData.width) * 4;
            }

            var pixelValue = charData[pos];
            var onVal = 255;
            var offVal = 0;

            if(pixelValue > 0) {
              dstImageData.data[dstPos] = onVal;
              dstImageData.data[dstPos + 1] = onVal;
              dstImageData.data[dstPos + 2] = onVal;
              dstImageData.data[dstPos + 3] = onVal;
            } else {
              dstImageData.data[dstPos] = offVal;
              dstImageData.data[dstPos + 1] = offVal;
              dstImageData.data[dstPos + 2] = offVal;
              dstImageData.data[dstPos + 3] = 255;
            }
          }
        }
      }
    }

    if(dstImageData == null) {

      if(typeof jsonData.paletteLayouts != 'undefined' && jsonData.paletteLayouts.length > 0) {
        
        this.docRecord.data.sortMethods =  [];
        var sortMethods = this.docRecord.data.sortMethods;
        for(var i = 0; i < jsonData.paletteLayouts.length; i++) {
          var sortMethod = {
            name: jsonData.paletteLayouts[i].name,
            id: jsonData.paletteLayouts[i].id,
          };
          if(typeof jsonData.paletteLayouts[i].map != 'undefined') {
            var rowsPerColumn = jsonData.paletteLayouts[i].map.rowsPerColumn;
            var data = jsonData.paletteLayouts[i].map.data;
            sortMethod.map = {
              rowsPerColumn: rowsPerColumn,
              data: []
            }
            for(var y = 0; y < data.length; y++) {
              sortMethod.map.data[y] = [];
              for(var x = 0; x < data[y].length; x++) {
                sortMethod.map.data[y][x] = data[y][x];
              }
            }
          }

          sortMethods.push(sortMethod);
        }

          

      } else {
        if(typeof jsonData.sortMethods != 'undefined') {

          if(typeof jsonData.type != 'undefined' && jsonData.type == 'vector') {
            this.type = 'vector';
          } else {
            this.type = 'ascii';
            for(var i = 0; i < jsonData.sortMethods.length; i++) {
              if(jsonData.sortMethods[i] == 'petscii') {
                this.type = 'petscii';
                break;
              }
            }        
          }
        } 

        this.setSortMethods();
      }
      this.updateAllCharacterCurrentData();
      this.refreshFromImageData();   

      if(typeof jsonData.blockSet != 'undefined') {
        
        var blockSetPath = '/tile sets/' + this.name + '/block sets/block set';
        var blockSet = this.editor.blockSetManager.getBlockSet(blockSetPath);

//        var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
        blockSet.clear();

        for(var b = 0; b < jsonData.blockSet.length; b++) {
          var args = {};
          args.colorMode = jsonData.blockSet[b].colorMode;
          if(typeof jsonData.blockSet[b].fc != 'undefined') {
            args.fc = jsonData.blockSet[b].fc;
          }
          if(typeof jsonData.blockSet[b].bc != 'undefined') {
            args.bc = jsonData.blockSet[b].bc;
          } else {
            args.bc =  this.editor.colorPaletteManager.noColor;
          }
          args.data = [];
          var tileData = jsonData.blockSet[b].tileData;
          for(var y = 0; y < tileData.length; y++) {
            var blockRow = [];
            for(var x = 0; x < tileData[y].length; x++) {
              var tile = {};
              tile.t = tileData[y][x].t;
              for(var key in tileData[y][x]) {              
                if(key != 't') {
                  tile[key] = tileData[y][x][key];
                }
              }
              blockRow.push(tile);
            }
            args.data.push(blockRow);
          }
          blockSet.createBlock(args);
        }


      }
//      this.updateSortMethods(); 
    }
  },  
  
  getBlockSet: function() {
    var blockSetPath = '/tile sets/' + this.name + '/block sets/block set';
    var blockSet = this.editor.blockSetManager.getBlockSet(blockSetPath);
    return blockSet;
    
  },


  getJSON: function() {
    
    var json = {};

    json.id = this.docRecord.id;
    json.name = this.docRecord.name;
    json.version = 1;
    json.width = this.docRecord.data.width;
    json.height = this.docRecord.data.height;
    json.type = this.type;

    json.sortMethods = [ "index" ];
    if(this.type == 'petscii') {
      json.sortMethods.push("petscii");
    }

    var paletteLayouts = this.docRecord.data.sortMethods;
    json.paletteLayouts = [];
    for(var i = 0; i < paletteLayouts.length; i++) {
      var layout = {};
      layout.name = paletteLayouts[i].name;
      layout.id = paletteLayouts[i].id;
      if(typeof paletteLayouts[i].map != 'undefined') {
        layout.map = paletteLayouts[i].map;
      }
      json.paletteLayouts.push(layout);
    }


    if(json.type == 'vector') {
      var vectorData = [];
      for(var i = 0; i < this.vectorData.length; i++) {
        vectorData.push({
          "name": this.vectorData[i].name,
          "unicode": this.vectorData[i].unicode,
          "path": this.vectorData[i].path
        });
      }
      json.vectorData = vectorData;

      json.unitsPerEm = this.unitsPerEm; 
      json.ascent = this.ascent;
      json.descent = this.descent;
      
    } 
    var data = {};
    var tileData = this.docRecord.data.tileData;
    var colorPerCharacter = this.editor.getColorPerMode() == 'character';

    var saveTileData = [];
    for(var i = 0; i < tileData.length; i++) {
      var tile = {};
      tile.data = tileData[i].data;
      if(tileData[i].props.animated || colorPerCharacter) {
        tile.props = {};
        if(tileData[i].props.animated) {
          tile.props.animated = tileData[i].props.animated;
          tile.props.frames = tileData[i].props.frameCount;
          tile.props.ticksPerFrame = tileData[i].props.ticksPerFrame;
        }

        if(colorPerCharacter) {
          tile.props.fc = tileData[i].props.fc;
          tile.props.bc = tileData[i].props.bc;
        }
      }

      if(typeof tileData[i].props.m != 'undefined') {
        if(typeof tile.props == 'undefined') {
          tile.props = {};
        }
        tile.props.m = tileData[i].props.m;
      }
      saveTileData.push(tile);
    }

    json.tiles = saveTileData;

    var blockSet = this.editor.blockSetManager.getCurrentBlockSet();
    if(blockSet) {

      var blockCount = blockSet.getBlockCount();

      if(blockCount > 0) {
        var blockSetData = blockSet.getBlocks();
        var blockData = [];


        for(var b = 0 ; b < blockSetData.length; b++) {
          var block = {};
          block.colorMode = blockSetData[b].colorMode;

          // if colour per block
          if(block.colorMode == 'perblock') {
            block.fc = blockSetData[b].fc;
            block.bc = blockSetData[b].bc;
          }
          var tileData = [];
          for(var y = 0; y < blockSetData[b].data.length; y++) {
            var blockRow = [];
            for(var x = 0; x < blockSetData[b].data[y].length; x++) {
              var tile = {};
              tile.t = blockSetData[b].data[y][x].t;

              if(block.colorMode == 'percell') {
                tile.fc = blockSetData[b].data[y][x].fc;
                tile.bc = blockSetData[b].data[y][x].bc;
              }
              blockRow.push(tile);
            }
            tileData.push(blockRow);
          }
          block.tileData = tileData;

          blockData.push(block);

        }

        json.blockSet = blockData;
      }
    }

    return json;
  },

  saveAsJson: function(filename) {
    var json = this.getJSON();
    jsonString = JSON.stringify(json);

    if(filename.indexOf('.json') == -1) {
      filename += '.json';
    }
    download(jsonString, filename, "application/json");
  },



  // char data as binary data, used by importc64formats
  readCharData: function(args) {

    var tileData = args.tileData;


    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }


    var characterWidth = this.charWidth;
    if(typeof args.characterWidth != 'undefined') {
      characterWidth = args.characterWidth;
    }

    var characterHeight = this.charHeight;
    if(typeof args.characterHeight != 'undefined') {
      characterHeight = args.characterHeight;
    }

    var tileCount = 256;
    var startChar = 0;

    for(var c = 0; c < tileCount; c++) {
      
      // 16 chars across
      var dstCharX = c % dstCharactersAcross;
      var dstCharY = Math.floor(c / dstCharactersAcross);


      var onVal = 1;
      var offVal = 0;
      if(dstImageData != null) {
        onVal = 255;
        offVal = 0;
      }

      if(dstImageData == null) {
        this.tileData[c].props.animated = false;
      }


      var dstCharactersAcross = 16;
      if(typeof args.dstCharactersAcross != 'undefined') {
        dstCharactersAcross = args.dstCharactersAcross;
      }
      
      var dstCharacterSpacing = 1;//this.gridLineWidth;
      if(typeof args.dstCharacterSpacing != 'undefined') {
        dstCharacterSpacing = args.dstCharacterSpacing;
      }



      for(var y = 0; y < characterHeight; y++) {
        for(var x = 0; x < characterWidth; x++) {

          var dstPos = 0;
          if(dstImageData) {
            var dstX = dstCharacterSpacing + dstCharX * (characterWidth * scale + dstCharacterSpacing) + x;
            var dstY = dstCharacterSpacing + dstCharY * (characterHeight * scale + dstCharacterSpacing) + y;
            dstPos = (dstX + dstY * dstImageData.width) * 4;
          }

          var pos = x + y * characterWidth;

          if(c < tileCount && c >= startChar) {
            if(tileData[c][pos]) {

              if(dstImageData) {
                dstImageData.data[dstPos] = onVal;
                dstImageData.data[dstPos + 1] = onVal;
                dstImageData.data[dstPos + 2] = onVal;
                dstImageData.data[dstPos + 3] = onVal;
              } else {
                this.tileData[c].data[0][pos] = tileData[c][pos];
              }
            } else {
              if(dstImageData) {            
                dstImageData.data[dstPos] = offVal;
                dstImageData.data[dstPos + 1] = offVal;
                dstImageData.data[dstPos + 2] = offVal;
                dstImageData.data[dstPos + 3] = 255;
              } else {
                this.tileData[c].data[0][pos] = tileData[c][pos];
              }
            }
          } else {
            if(dstImageData) {
              dstImageData.data[dstPos] = 40;
              dstImageData.data[dstPos + 1] = 40;
              dstImageData.data[dstPos + 2] = 40;
              dstImageData.data[dstPos + 3] = 255;
            } 

          }
        }
      }
    }


    if(dstImageData == null && g_app.doc != null) {
      // transfer from the doc data to the current characters
      this.updateAllCharacterCurrentData();

      if(this.isPetscii()) {
        this.setType('petscii');        
      } else {
        this.setType('custom');        
      }
      this.setSortMethods();

      // create the 3d geometry id 3d is enabled
      this.refreshFromImageData();    
    }


  },

  

  readBinaryData: function(args) {
    var tileData = args.tileData;
    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }


    var characterWidth = this.charWidth;
    if(typeof args.characterWidth != 'undefined') {
      characterWidth = args.characterWidth;
    }
    var characterHeight = this.charHeight;
    if(typeof args.characterHeight != 'undefined') {
      characterHeight = args.characterHeight;
    }

    var srcCharAcross = 16;
    if(typeof args.charactersAcross != 'undefined') {
      srcCharAcross = args.charactersAcross;
    }

    var startChar = 0;
    if(typeof args.startChar != 'undefined') {
      startChar = args.startChar;
    }


    var characterDataOffset = 0;
    if(typeof args.characterDataOffset != 'undefined') {
      characterDataOffset = args.characterDataOffset;
    }

    var tileCount = 256;
    if(typeof args.tileCount != 'undefined') {
      tileCount = args.tileCount;
    }


    var invert = false;
    if(typeof args.tileSetInvert != 'undefined') {
      invert = args.tileSetInvert;
    }



    var dstCharactersAcross = 16;
    if(typeof args.dstCharactersAcross != 'undefined') {
      dstCharactersAcross = args.dstCharactersAcross;
    }
    
    var dstCharacterSpacing = 1;//this.gridLineWidth;
    if(typeof args.dstCharacterSpacing != 'undefined') {
      dstCharacterSpacing = args.dstCharacterSpacing;
    }


    var scale = 1;
    if(typeof args.scale != 'undefined') {
      scale = args.scale;
    }

    if(dstImageData == null) {
      // importing into this character set. initialise it

      if(g_app.doc != null) {
        this.docRecord = this.getDocRecord();
        this.docRecord.data.tileData = [];
        this.tileData = this.docRecord.data.tileData;
      } else {
        this.tileData = [];
      }


      
      this.setCharDimensions(characterWidth, characterHeight);
      this.setTileCount(tileCount);


    }



    for(var c = 0; c < tileCount; c++) {
      
      var srcCharX = (c - startChar) % srcCharAcross;
      var srcCharY = Math.floor((c - startChar) / srcCharAcross);

      var srcCharPosition = c * (characterWidth * characterHeight);

      // 16 chars across
      var dstCharX = c % dstCharactersAcross;
      var dstCharY = Math.floor(c / dstCharactersAcross);


      var onVal = 1;
      var offVal = 0;
      if(dstImageData != null) {
        onVal = 255;
        offVal = 0;
      }
      if(invert) {
        var temp = onVal;
        onVal = offVal;
        offVal = temp;
      }

      if(dstImageData == null) {
        this.tileData[c].props.animated = false;
      }


      for(var y = 0; y < characterHeight * scale; y++) {
        for(var x = 0; x < characterWidth * scale; x++) {
          var pos = x + y * characterWidth;

          var srcBit = srcCharPosition + Math.floor(x/scale) + Math.floor(y/scale) * characterWidth;
          var srcByte = characterDataOffset + Math.floor(srcBit / 8);
          var srcBitPos = srcBit % 8;
          var byteValue = tileData[srcByte];

          var dstPos = 0;
          if(dstImageData) {
            var dstX = dstCharacterSpacing + dstCharX * (characterWidth * scale + dstCharacterSpacing) + x;
            var dstY = dstCharacterSpacing + dstCharY * (characterHeight * scale + dstCharacterSpacing) + y;
            dstPos = (dstX + dstY * dstImageData.width) * 4;
          }

          if(c < tileCount && c >= startChar) {
            if(byteValue & (1 << (7-srcBitPos) )) {

              if(dstImageData) {
                dstImageData.data[dstPos] = onVal;
                dstImageData.data[dstPos + 1] = onVal;
                dstImageData.data[dstPos + 2] = onVal;
                dstImageData.data[dstPos + 3] = onVal;
              } else {
                this.tileData[c].data[0][pos] = onVal;
              }
            } else {
              if(dstImageData) {            
                dstImageData.data[dstPos] = offVal;
                dstImageData.data[dstPos + 1] = offVal;
                dstImageData.data[dstPos + 2] = offVal;
                dstImageData.data[dstPos + 3] = 255;
              } else {
                this.tileData[c].data[0][pos] = offVal;
              }
            }
          } else {
            if(dstImageData) {
              dstImageData.data[dstPos] = 40;
              dstImageData.data[dstPos + 1] = 40;
              dstImageData.data[dstPos + 2] = 40;
              dstImageData.data[dstPos + 3] = 255;
            } 
          }
        }
      }
    }



    if(dstImageData == null) {
      // transfer from the doc data to the current characters
      this.updateAllCharacterCurrentData();

      if(this.isPetscii()) {
        this.setType('petscii');        
      } else {
        this.setType('custom');        
      }
      this.setSortMethods();

      // create the 3d geometry id 3d is enabled
      this.refreshFromImageData();    
    }
  },


  isPetscii: function() {
    if(g_app.doc == null || this.editor == null) {
      return;
    }

    if(this.getTileWidth() != 8 || this.getTileHeight() != 8) {
      return false;
    }

    if(this.getTileCount() != 256) {
      return false;
    }

    if(this.type == 'vector') {
      return false;
    }

    var byteIndex = 0;
    for(var c = 0; c < 256; c++) {
      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
          if(this.getPixel(c, x, y)) {
            b += (1 << (7-x) );
          }
        }

        if(b != C64CharROM[byteIndex++]) {
          return false;
        }

      }
    }

    return true;

  },

  readVectorData: function(args) {

    var font = args.font;
    var fontSize = args.fontSize;

    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }

    var tileWidth = this.charWidth;
    if(typeof args.tileWidth != 'undefined') {
      tileWidth = args.tileWidth;
    }

    var tileHeight = this.charHeight;
    if(typeof args.tileHeight != 'undefined') {
      tileHeight = args.tileHeight;
    }

    var tileHOffset = 0;
    if(typeof args.tileHOffset != 'undefined') {
      tileHOffset = args.tileHOffset;
    }

    var tileVOffset = 0;
    if(typeof args.tileVOffset != 'undefined') {
      tileVOffset = args.tileVOffset;
    }

    var tileCount = 255;
    if(typeof args.tileCount != 'undefined') {
      tileCount = args.tileCount;
    }

    var startTile = 0;
    
    var firstChar = 0;
    if(typeof args.firstChar != 'undefined') {
      firstChar = args.firstChar;
    }

    if(dstImageData == null) {
      // importing into this character set. initialise it
      this.docRecord = this.getDocRecord();
      this.docRecord.data.tileData = [];
      this.tileData = this.docRecord.data.tileData;

      this.setCharDimensions(tileWidth, tileHeight);
      this.setTileCount(tileCount);
    }


    var dstTilesAcross = 16;
    if(typeof args.dstTilesAcross != 'undefined') {
      dstTilesAcross = args.dstTilesAcross;
    }

    var dstTileSpacing = 1;//this.gridLineWidth;
    if(typeof args.dstTileSpacing != 'undefined') {
      dstTileSpacing = args.dstTileSpacing;
    }

    if(!this.glyphCanvas) {
      this.glyphCanvas = document.createElement("canvas");  
    }
    
    this.glyphCanvas.width = Math.floor(tileWidth);  
    this.glyphCanvas.height = Math.floor(tileHeight); 
    var ctx = this.glyphCanvas.getContext("2d");
    //ctx.font="20px sans";    
    var fontScale = fontSize  / font.head.unitsPerEm;


    for(var c = 0; c < tileCount; c++) {

      
      var tileData = null;
      if(dstImageData == null) {
        this.tileData[c].props.animated = false;
        tileData = this.tileData[c].data[0];
      }

      var dstTileX = c % dstTilesAcross;
      var dstTileY = Math.floor(c / dstTilesAcross);
      var dstPos = 0;

      var onVal = 1;
      var offVal = 0;

      if(dstImageData != null) {
        onVal = 255;
        offVal = 0;
      }

      /*
      if(invert) {
        var temp = onVal;
        onVal = offVal;
        offVal = temp;
      }
      */

      glyphIndex = 0;


      /*
      glyphIndex = c + firstChar;//1772;
      var path = Typr.U.glyphToPath(font, glyphIndex);
      ctx.save();

      ctx.clearRect(0, 0, tileWidth, tileHeight);

      ctx.translate( tileHOffset, tileVOffset  + fontSize);  

      ctx.scale(fontScale,-fontScale);
      ctx.beginPath();
      Typr.U.pathToContext(path, ctx);
      ctx.fillStyle = '#ffffff';    //  
      ctx.fill();

      ctx.restore();
*/

      scale = 1;

      var imageData = ctx.getImageData(0, 0, tileWidth, tileHeight);      

      for(var y = 0; y < tileHeight * scale; y++) {
        for(var x = 0; x < tileWidth * scale; x++) {

          var pos = x + y * tileWidth;

          var srcPos = (y / scale) * tileWidth * 4 + (x / scale) * 4;


          if(dstImageData != null) {
            var dstX = dstTileSpacing + dstTileX * (tileWidth * scale + dstTileSpacing) + x;
            var dstY = dstTileSpacing + dstTileY * (tileHeight * scale + dstTileSpacing) + y;
            dstPos = (dstX + dstY * dstImageData.width) * 4;

          }
          if(c < tileCount && c >= startTile) {
            
            if(imageData.data[srcPos] > 100) {
              if(dstImageData) {
                dstImageData.data[dstPos] = onVal;
                dstImageData.data[dstPos + 1] = onVal;
                dstImageData.data[dstPos + 2] = onVal;
                dstImageData.data[dstPos + 3] = onVal;
              } else {
                tileData[pos] = onVal;
              }
            } else {
              if(dstImageData) {
                dstImageData.data[dstPos] = offVal;
                dstImageData.data[dstPos + 1] = offVal;
                dstImageData.data[dstPos + 2] = offVal;
                dstImageData.data[dstPos + 3] = 255;
              } else {
                tileData[pos] = offVal;                  
              }
            }
          }
  
        }
      }
    }
    if(dstImageData == null) {
      // transfer from the doc data to the current characters
      this.updateAllCharacterCurrentData();

      // create the 3d geometry id 3d is enabled
      this.refreshFromImageData();    
    }

  },

  // import image data into current character set,
  // or draw it into another image data.
  readImageData: function(args) {

    var srcImageData = args.srcImageData;
    var dstImageData = null;
    if(typeof args.dstImageData != 'undefined') {
      dstImageData = args.dstImageData;
    }

    var dstPosIsSrcPos = false;
    if(typeof args.dstPosIsSrcPos != 'undefined') {
      dstPosIsSrcPos = args.dstPosIsSrcPos;
    }

    var mode = "textmode";
    if(typeof args.mode != 'undefined') {
      mode = args.mode;
    }

    var palette = [];
    if(typeof args.palette != 'undefined') {
      palette = args.palette;
    }
    var paletteMap = {};
    if(typeof args.paletteMap != 'undefined') {
      paletteMap = args.paletteMap;
    }

    var tileWidth = this.charWidth;
    if(typeof args.characterWidth != 'undefined') {
      tileWidth = args.characterWidth;
    }
    var tileHeight = this.charHeight;
    if(typeof args.characterHeight != 'undefined') {
      tileHeight = args.characterHeight;
    }

    var characterHSpacing = 0;
    if(typeof args.characterHSpacing != 'undefined') {
      characterHSpacing = args.characterHSpacing;
    }

    var characterVSpacing = 0;
    if(typeof args.characterVSpacing != 'undefined') {
      characterVSpacing = args.characterVSpacing;
    }

    var pixelSpacing = 1;
    if(typeof args.pixelSpacing != 'undefined') {
      pixelSpacing = args.pixelSpacing;
    }

    var characterHOffset = 0;
    if(typeof args.characterHOffset != 'undefined') {
      characterHOffset = args.characterHOffset;
    }

    var characterVOffset = 0;
    if(typeof args.characterVOffset != 'undefined') {
      characterVOffset = args.characterVOffset;
    }

    var srcCharAcross = 16;
    if(typeof args.charactersAcross != 'undefined') {
      srcCharAcross = args.charactersAcross;
    }

    var srcWidth = srcImageData.width;
    var srcHeight = srcImageData.height;

    var tileCount = Math.floor(srcHeight / tileHeight) * srcCharAcross;



    if(typeof args.tileCount != 'undefined') {
      tileCount = args.tileCount;
    }

    var srcCharacterDown = Math.ceil(tileCount / srcCharAcross);

    var startChar = 0;
    if(typeof args.startChar != 'undefined') {
      startChar = args.startChar;
    }

    var tileSetDirection = 'across'
    if(typeof args.charSetDirection != 'undefined') {
      charSetDirection = args.charSetDirection;
    }

    var invert = false;
    if(typeof args.tileSetInvert != 'undefined') {
      invert = args.tileSetInvert;
    }

    var scale = 1;
    if(typeof args.scale != 'undefined') {
      scale = args.scale;
    }

    if(dstImageData == null) {
      // importing into this character set. initialise it
      if(g_app.doc && this.getDocRecord()) {
        this.docRecord = this.getDocRecord();
        this.docRecord.data.tileData = [];
        this.tileData = this.docRecord.data.tileData;
      } else {
        this.tileData = [];
      }

      this.setCharDimensions(tileWidth, tileHeight);
      this.setTileCount(tileCount);
    }


    var dstCharactersAcross = 16;
    if(typeof args.dstCharactersAcross != 'undefined') {
      dstCharactersAcross = args.dstCharactersAcross;
    }

    var dstCharacterSpacing = 1;//this.gridLineWidth;
    if(typeof args.dstCharacterSpacing != 'undefined') {
      dstCharacterSpacing = args.dstCharacterSpacing;
    }

    for(var c = 0; c < tileCount; c++) {
      var srcCharX = (c - startChar) % srcCharAcross;
      var srcCharY = Math.floor((c - startChar) / srcCharAcross);


      if(tileSetDirection == 'down') {
        srcCharY = (c - startChar) % srcCharAcross;
        srcCharX = Math.floor( (c - startChar) / srcCharAcross);
      }


      var tileData = null;
      if(dstImageData == null) {
        this.tileData[c].props.animated = false;
        tileData = this.tileData[c].data[0];
      }


      var dstCharX = c % dstCharactersAcross;
      var dstCharY = Math.floor(c / dstCharactersAcross);
      var dstPos = 0;
      
      var onVal = 1;
      var offVal = 0;

      if(dstImageData != null) {
        onVal = 255;
        offVal = 0;
      }

      if(invert) {
        var temp = onVal;
        onVal = offVal;
        offVal = temp;
      }

      for(var y = 0; y < tileHeight * scale; y++) {
        for(var x = 0; x < tileWidth * scale; x++) {

          var pos = x + y * tileWidth;

          var srcX = (characterHOffset + characterHSpacing + srcCharX * (tileWidth * pixelSpacing + characterHSpacing) 
                        + Math.floor( (x * pixelSpacing) / scale));
          var srcY = (characterVOffset + characterVSpacing + srcCharY * (tileHeight * pixelSpacing + characterVSpacing) 
                        + Math.floor( (y * pixelSpacing) / scale)) ;
          var srcPos = (srcX + srcY * srcWidth) * 4;


          if(dstImageData != null) {
            var dstX = dstCharacterSpacing + dstCharX * (tileWidth * scale + dstCharacterSpacing) + x;
            var dstY = dstCharacterSpacing + dstCharY * (tileHeight * scale + dstCharacterSpacing) + y;
            if(dstPosIsSrcPos) {
              dstPos = srcPos;
            } else {
              dstPos = (dstX + dstY * dstImageData.width) * 4;
            }
          }

          if(srcX < 0 || srcY < 0 || srcX >= srcWidth || srcY >= srcHeight) {
            /*
            dstImageData.data[dstPos] = onVal;
            dstImageData.data[dstPos + 1] = onVal;
            dstImageData.data[dstPos + 2] = onVal;
            dstImageData.data[dstPos + 3] = onVal;
            */
           
          } else if(this.tileSetMulticolor) {

          } else {

            if(c < tileCount && c >= startChar) {

              if(mode != 'indexed' && mode != 'rgb') {
                var r = srcImageData.data[srcPos];
                var g = srcImageData.data[srcPos + 1];
                var b = srcImageData.data[srcPos + 2];
        
                //if(srcImageData.data[srcPos] > 200) {
                if(r + g + b > 200) {
                  if(dstImageData) {
                    dstImageData.data[dstPos] = onVal;
                    dstImageData.data[dstPos + 1] = onVal;
                    dstImageData.data[dstPos + 2] = onVal;
                    dstImageData.data[dstPos + 3] = onVal;
                  } else {
                    tileData[pos] = onVal;
                  }
                } else {
                  if(dstImageData) {
                    dstImageData.data[dstPos] = offVal;
                    dstImageData.data[dstPos + 1] = offVal;
                    dstImageData.data[dstPos + 2] = offVal;
                    dstImageData.data[dstPos + 3] = 255;
                  } else {
                    tileData[pos] = offVal;                  
                  }
                }
              }

              if(mode == 'rgb') {
                var r = srcImageData.data[srcPos] & 0xff;
                var g = srcImageData.data[srcPos + 1] & 0xff;
                var b = srcImageData.data[srcPos + 2] & 0xff;
                var a = srcImageData.data[srcPos + 3] & 0xff;

                var rgb =  (r << 16) | (g << 8) | b;
                var argb = ( (a << 24) | (rgb >>> 0)) >>> 0;

                if(dstImageData) {
                  dstImageData.data[dstPos] = r;//srcImageData.data[srcPos];
                  dstImageData.data[dstPos + 1] = g;//srcImageData.data[srcPos + 1];
                  dstImageData.data[dstPos + 2] = b;//srcImageData.data[srcPos + 2];
                  dstImageData.data[dstPos + 3] = a;//srcImageData.data[srcPos + 3];
                } else {
                  tileData[pos] = argb;
                }
              }

              if(mode == 'indexed') {
                var r = srcImageData.data[srcPos] & 0xff;
                var g = srcImageData.data[srcPos + 1] & 0xff;
                var b = srcImageData.data[srcPos + 2] & 0xff;
                var a = 255;//srcImageData.data[srcPos + 3] & 0xff;

                var rgb =  (r << 16) | (g << 8) | b;
                var argb = ( (a << 24) | (rgb >>> 0)) >>> 0;
                var index = 0;

                if(typeof paletteMap['c' + argb] != 'undefined') {
                  index = paletteMap['c' + argb].index;
                }

/*
                if(typeof colorMap['c' + argb] != 'undefined') {
                  index = colorMap['c' + argb].index;
                  colorMap['c' + argb].count++;
                } else {
                  index = colors.length;
                  colors[index] = argb;
                  colorMap['c' + argb] = { "index": index, "count": 1 };
                }
*/
                if(dstImageData) {
                  dstImageData.data[dstPos] = r;//srcImageData.data[srcPos];
                  dstImageData.data[dstPos + 1] = g;//srcImageData.data[srcPos + 1];
                  dstImageData.data[dstPos + 2] = b;//srcImageData.data[srcPos + 2];
                  dstImageData.data[dstPos + 3] = a;//srcImageData.data[srcPos + 3];
                } else {
                  tileData[pos] = index;
                }

              }
            } else {
            }
          }
        }
      }




    }


    if(dstImageData == null && g_app.doc != null) {
      // transfer from the doc data to the current characters
      this.updateAllCharacterCurrentData();
 
      if(this.isPetscii()) {
        this.setType('petscii');        
      } else {
        this.setType('custom');        
      }
      //this.setSortMethods();


      // create the 3d geometry id 3d is enabled
      this.refreshFromImageData();    
    }

  },

  // create a tile set from an image..
  // assumes tile width and height are already set.
  // and image is 16x16 array.
  // should use character set import??
  // only used by set preset?
  importImage: function(img) {
    if(this.importCanvas == null) { 
      this.importCanvas = document.createElement("canvas");
    }

    var imageWidth = 16 * this.charWidth;
    var imageHeight = 16 * this.charHeight;

    if(typeof img.naturalHeight != 'undefined') {
      imageWidth = img.naturalWidth;
      imageHeight = img.naturalHeight;
    }

    // draw the image onto the canvas.
    this.importCanvas.width = imageWidth;
    this.importCanvas.height = imageHeight;

    this.importContext = this.importCanvas.getContext("2d");
    this.importContext.clearRect(0, 0, this.importCanvas.width, this.importCanvas.height);
    this.importContext.drawImage(img, 0, 0);

    var imageData = this.importContext.getImageData(0, 0, this.importCanvas.width, this.importCanvas.height);
    this.readImageData({
      srcImageData: imageData
    });


    return;

  },



  // this is only used by old loading method, can get rid of
  setFromImageData: function(imageData) {
    if(this.imageData == null || this.imageData.width != imageData.width || this.imageData.height != imageData.height) {
      this.canvas.width = imageData.width;
      this.canvas.height = imageData.height;

      this.context = this.canvas.getContext('2d');
      this.imageData = this.context.getImageData(0, 0, imageData.width, imageData.height);
    }

    this.imageData.data.set(imageData.data);
    this.refreshFromImageData();
  },

  // generate 3d geometry for each tile
  refreshFromImageData: function() {
    if(false && g_app.getEnabled('textmode3d')) {
      for(var i = 0; i < 256; i++) {
        this.generateTileGeometry(i);
        this.generateTileBackgroundGeometry(i);
      }
    } 
  },


  generate3dGeometries: function() {
    for(var i = 0; i < this.tileCount; i++) {

//      this.geometryDirty[i] = false;

      if(i >= this.characterGeometries.length) {
        this.geometryDirty[i] = true;
        this.characterGeometries.push(new THREE.BufferGeometry());
      }

      if(i >= this.characterBackgroundGeometries.length) {
        this.characterBackgroundGeometries.push(new THREE.BufferGeometry());
      }

//      if(this.characterGeometries[i].vertices.length > 0) {
        this.generateTileGeometry(i);
        this.generateTileBackgroundGeometry(i);
//      }
    }

  },


  // https://github.com/mrdoob/three.js/blob/master/src/geometries/BoxGeometry.js
  // https://threejs.org/docs/#api/en/core/BufferGeometry
  // https://threejs.org/docs/#examples/en/utils/BufferGeometryUtils : merge vertices

  // generate 3d geometry for a character, from 2d image data
  generateTileGeometry: function(ch) {
    if(this.tile3d == null) {
      this.tile3d = new Tile3d();
      this.tile3d.init(this);
    }

    return this.tile3d.generateTileGeometry(ch);

    if(ch < this.geometryDirty.length && this.geometryDirty[ch] == false) {
      return;
    }

    while(ch >= this.geometryDirty.length) {
      this.geometryDirty.push(true);
    }

    if(ch == 5) {
      console.error('generate tile geometry:' + ch);
    }

    var frame = 'current';//this.getCharacterFrame(ch);

    var scale = 1/4;

    //var charGeometry = new THREE.Geometry();
    var tileGeometry = new THREE.BufferGeometry();

    var gridCellSizeX = this.charWidth * this.pixelWidth * this.pixelTo3dUnits;
    var gridCellSizeY = this.charHeight * this.pixelHeight * this.pixelTo3dUnits;
    var gridCellSizeZ = this.charDepth * this.pixelDepth * this.pixelTo3dUnits;

    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        var pixel = this.getPixel(ch, x, y, frame) > 0;
//        var srcPos =  ((charX) * this.charWidth + x + ((charY * this.charHeight) 
//          + y) * charsImageData.width) * 4;
//        if(charsImageData.data[srcPos] > 100) {
        if(pixel) {
          var above = false;
          var below = false;
          var left = false;
          var right = false;

          if(y > 0) {
            below = this.getPixel(ch, x, y - 1, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + x + ((charY * this.charHeight) 
              + y - 1) * charsImageData.width) * 4;
            above = charsImageData.data[srcPos] > 100;          
            */
          }

          if(y < this.charHeight - 1) {
            above = this.getPixel(ch, x, y + 1, frame) > 0;

            /*
            var srcPos =  ((charX) * this.charWidth + x + ((charY * this.charHeight) 
              + y + 1) * charsImageData.width) * 4;
            below = charsImageData.data[srcPos] > 100;          
            */
          }


          if(x > 0) {
            /*
            var srcPos =  ((charX) * this.charWidth + (x - 1) + ((charY * this.charHeight) 
              + y) * charsImageData.width) * 4;
            left = charsImageData.data[srcPos] > 100;          
            */
           left = this.getPixel(ch, x - 1, y, frame) > 0;
          }

          if(x < this.charWidth - 1) {
            right = this.getPixel(ch, x + 1, y, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + (x + 1) + ((charY * this.charHeight) 
              + y) * charsImageData.width) * 4;
            right = charsImageData.data[srcPos] > 100;          
            */
          }
          // geometry represents one pixel

          var geometry = new THREE.BoxGeometry( this.pixelTo3dUnits, 
                                                this.pixelTo3dUnits,
                                                gridCellSizeZ 
                                                );


/*
          for(var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].x += x * scale + 0.5 * scale - gridCellSizeX / 2;
            geometry.vertices[i].y += -y * scale - 0.5 * scale + gridCellSizeY / 2;
            geometry.vertices[i].z += 0;
          }

          var newFaces = [];
          for(var i = 0; i < geometry.faces.length; i++) {
            var deleteFace = false;
            if(below) {
              if(geometry.faces[i].normal.y == 1) {
                // delete face
                deleteFace = true;
              }
            }

            if(above) {
              if(geometry.faces[i].normal.y == -1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(left) {
              if(geometry.faces[i].normal.x == -1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(right) {
              if(geometry.faces[i].normal.x == 1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(!deleteFace) {
              newFaces.push(geometry.faces[i]);
            }
          }

          geometry.faces = newFaces;
          charGeometry.merge(geometry);
*/
  //        tileGeometry.merge(geometry);          
          x = 100;
          y = 100;
          tileGeometry = geometry;
          break;

        }

      }
    }

    //BufferGeometryUtils.mergeBufferGeometries(tileGeometry);
//    tileGeometry = THREE.BufferGeometryUtils.mergeVertices(tileGeometry);

    this.characterGeometries[ch] = tileGeometry;
    this.geometryDirty[ch] = false;
    
    //charGeometry.mergeVertices();

//    charGeometry.rotateX(Math.PI / 2);
         /*
    this.characterGeometries[ch].vertices = charGeometry.vertices;
    this.characterGeometries[ch].faces = charGeometry.faces;
    this.characterGeometries[ch].verticesNeedUpdate = true;
    this.characterGeometries[ch].elementsNeedUpdate =true;
    */
  },



  // generate 3d geometry for a character, from 2d image data
  generateTileBackgroundGeometry: function(ch) {

    return;
    var frame = 'current';//this.getCharacterFrame(ch);

    var scale = 1/4;

    var tileGeometry = new THREE.BufferGeometry();

    var gridCellSizeX = this.charWidth * this.pixelWidth * this.pixelTo3dUnits;
    var gridCellSizeY = this.charHeight * this.pixelHeight * this.pixelTo3dUnits;
    var gridCellSizeZ = this.charDepth * this.pixelDepth * this.pixelTo3dUnits;


    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {

        var pixel = this.getPixel(ch, x, y, frame) > 0;
        if(!pixel) {
          
          var above = false;
          var below = false;
          var left = false;
          var right = false;

          if(y > 0) {
            below = this.getPixel(ch, x, y - 1, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + x + ((charY * this.charHeight) 
              + y - 1) * charsImageData.width) * 4;
            above = charsImageData.data[srcPos] < 100;          
            */
          }

          if(y < this.charHeight - 1) {
            above = this.getPixel(ch, x, y + 1, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + x + ((charY * this.charHeight) 
              + y + 1) * charsImageData.width) * 4;
            below = charsImageData.data[srcPos] < 100;          
            */

          }


          if(x > 0) {
            left = this.getPixel(ch, x - 1, y, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + (x - 1) + ((charY * this.charHeight) 
              + y) * charsImageData.width) * 4;
            left = charsImageData.data[srcPos] < 100;          
            */
          }

          if(x < this.charWidth - 1) {
            right = this.getPixel(ch, x + 1, y, frame) > 0;
            /*
            var srcPos =  ((charX) * this.charWidth + (x + 1) + ((charY * this.charHeight) 
              + y) * charsImageData.width) * 4;
            right = charsImageData.data[srcPos] < 100;          
            */
          }

          // geometry for one pixel
          var geometry = new THREE.BoxGeometry( this.pixelTo3dUnits, 
                                                this.pixelTo3dUnits,
                                                gridCellSizeZ
                                                 );

          tileGeometry.merge(geometry);
/*
          for(var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].x += x * scale + 0.5 * scale - gridCellSizeX / 2;
            geometry.vertices[i].y += -y * scale - 0.5 * scale + gridCellSizeY / 2;
            geometry.vertices[i].z += 0;
          }

          var newFaces = [];
          for(var i = 0; i < geometry.faces.length; i++) {
            var deleteFace = false;
            if(above) {
              if(geometry.faces[i].normal.y == -1) {
                // delete face
                deleteFace = true;
              }
            }

            if(below) {
              if(geometry.faces[i].normal.y == 1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(left) {
              if(geometry.faces[i].normal.x == -1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(right) {
              if(geometry.faces[i].normal.x == 1) {
                // delete face
                deleteFace = true;
              }              
            }

            if(!deleteFace) {
              newFaces.push(geometry.faces[i]);
            }
          }

          geometry.faces = newFaces;
          charGeometry.merge(geometry);
*/

        }

      }
    }

    this.characterBackgroundGeometries[ch] = THREE.BufferGeometryUtils.mergeVertices(tileGeometry);

    /*
    charGeometry.mergeVertices();
         
    this.characterBackgroundGeometries[ch].vertices = charGeometry.vertices;
    this.characterBackgroundGeometries[ch].faces = charGeometry.faces;
    this.characterBackgroundGeometries[ch].verticesNeedUpdate = true;
    this.characterBackgroundGeometries[ch].elementsNeedUpdate =true;
*/
  },

  getGeometry: function(c) {

    if(c >= this.characterGeometries.length) {
      this.generate3dGeometries();
    }


    if(this.geometryDirty[c]) {
      this.generateTileGeometry(c);
      this.generateTileBackgroundGeometry(c);
      this.geometryDirty[c] = false;
    }


    return this.characterGeometries[c];
  },


  getBackgroundGeometry: function(c) {
    return this.characterBackgroundGeometries[c];
  },


  getData: function() {
    return this.currentTileData;
  },

  setTileData: function(tileId, tileData) {
    var tileDataLength = this.tileData[tileId].data[0].length;
    if(tileDataLength != tileData.length) {
      return;
    }
    for(var i = 0; i < tileDataLength; i++) {
      this.tileData[tileId].data[0][i] = tileData[i];
    }

    this.modified();    

    this.updateCharacterCurrentData(tileId);
  },

  setPixel: function(character, x, y, set, updateCharacter, frame) {
    if(typeof set == 'undefined') {
      set = true;
    }

    if(typeof frame == 'undefined') {
      frame = 0;
    }

    if(typeof updateCharacter == 'undefined') {
      updateCharacter = true;
    }

    // disable the block to draw on blank chars
    if(false && character == this.editor.tileSetManager.blankCharacter) {
      return;
    }

    var c64ECM = false;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer.getType() == 'grid' && layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      var ecmGroup = Math.floor(character / 256);
      character = (character % 64) + ecmGroup * 256;
      c64ECM = true;
    }


    if(this.tileData[character].props.animated !== false) {

      this.tileData[character].data[frame][x + y * this.charWidth] = set;
//      if(updateCharacter) {
      this.updateCharacterCurrentData(character);

//      }

    /*
      if(frame == 0) {
        this.characterProperties[character].originalData[y][x] = set;
      }
      if(this.characterProperties[character].animatedType == 'frames') {
        this.characterProperties[character].frameData[frame][y][x] = set;
      }
    */

      return;
    }


    var oldValue = this.getPixel(character, x, y);

    var pos = x + y * this.charWidth;
    this.tileData[character].data[0][pos] = set;

//    if(updateCharacter) {
    this.updateCharacterCurrentData(character);

//    }



//    this.setImageDataPixel(character, x, y, set);

    // record the action
    var params = { 
                   "c": character,
                   "x": x, "y": y,
                   "oldValue": oldValue,
                   "newValue": set
                  }

    this.editor.history.addAction("setCharPixel", params);


    if(updateCharacter) {
      this.updateCharacter(character);
    }
    this.modified();    

    this.customCharacterset = true;
  },

  // call this when a character has been updated
  updateCharacter: function(character) {

    // update the geometry if used in 3d
    if(character < this.characterGeometries.length) {
      this.generateTileGeometry(character);
      this.generateTileBackgroundGeometry(character);    
    }

    /*
    //    if(false && g_app.getEnabled('textmode3d')) {
    if(g_app.mode == '3d') {
     // if(this.editor.layoutType != '2d') {
        this.generateTileGeometry(character);
        this.generateTileBackgroundGeometry(character);    
     // }
    } else {
      if(character < this.geometryDirty.length) {
        this.geometryDirty[character] = true;
      }
    }
*/
    // TODO: need better way of doing this.. dont want to need to redisplay the whole character set
    // to update one character

    this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true, tiles: [character] });
    this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true, tiles: [character] });
//    this.editor.selectTileSet(this.editor.currentTileSetID, false);

  },



  // draw character into image data, use current character data?
  drawCharacter: function( args ) {//imageData, character, color, x, y, highlight) {

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(typeof args['colorPaletteId'] != 'undefined') {
      colorPalette = this.editor.colorPaletteManager.getColorPalette(args['colorPaletteId']);
    }
    var screenMode = false;
    if(typeof args['screenMode'] != 'undefined') {
      screenMode = args['screenMode'];
    } else {
      screenMode = this.editor.getScreenMode();
    }

    var transparentColorIndex = 0;
    if(typeof args['transparentColorIndex'] != 'undefined') {
      transparentColorIndex = args['transparentColorIndex'];
    }

    var charHeight = this.charHeight;
    var charWidth = this.charWidth;

    if(typeof args['charHeight'] != 'undefined') {
      charHeight = args['charHeight'];
    }
    if(typeof args['charWidth'] != 'undefined') {
      charWidth = args['charWidth'];
    }
    var charsAcross = 32;
    if(typeof args['charsAcross'] != 'undefined')  {
      charsAcross = args['charsAcross'];
    }

    var tileData = null;
    var imageData = args['imageData'];
    var character = args['character'];
    var colorIndex = -1;
    var bgColor = -1;

    if(typeof args['color'] != 'undefined') {
      colorIndex = args['color'];
    }

    var backgroundIsTransparent = false;
    if(typeof args['backgroundIsTransparent'] != 'undefined') {
      backgroundIsTransparent = args['backgroundIsTransparent'];
    }
    if(typeof args['bgColor'] != 'undefined') {
      bgColor = args['bgColor'];
    }
 
    if(character === false) {
      return;
    }
    tileData = this.currentTileData;

    if(character >= 0 && character < this.tileData.length) {
      if(typeof args['characterFrame'] != 'undefined' && args['characterFrame'] < this.tileData[character].data.length) {
        // want a character frame rather than current character data
        tileData = this.tileData[character].data[args['characterFrame']];
      } else {
        tileData = tileData[character];
      }
    }

    var flipH = false;
    var flipV = false;
    var rotateZ = 0;

    if(typeof args['flipH'] != 'undefined') {
      flipH = args['flipH'];      
    }

    if(typeof args['flipV'] != 'undefined') {
      flipV = args['flipV'];
    }

    if(typeof args['rotZ'] != 'undefined') {
      rotateZ = args['rotZ'];
    }


    var colorRGB = false;//0xffffff;
    var colorR = false;
    var colorG = false;
    var colorB = false;

    if(typeof args['colorRGB'] != 'undefined') {
      colorRGB = args['colorRGB'];
      colorR = (colorRGB >> 16) & 255;
      colorG = (colorRGB >> 8) & 255;
      colorB =  colorRGB & 255;
    }

    var bgColorRGB = false;
    var bgColorR = false;
    var bgColorG = false;
    var bgColorB = false;
    if(typeof args['bgColorRGB'] != 'undefined') {
      bgColorRGB = args['bgColorRGB'];      

      if(bgColorRGB !== false) {
        bgColorR = (bgColorRGB >> 16) & 255;
        bgColorG = (bgColorRGB >> 8) & 255;
        bgColorB =  bgColorRGB & 255;
      }

    }

    if(bgColor != -1) {
      bgColorRGB = colorPalette.getHex(bgColor);//this.editor.petscii.getColor(bgColor);

      bgColorR = (bgColorRGB >> 16) & 255;
      bgColorG = (bgColorRGB >> 8) & 255;
      bgColorB =  bgColorRGB & 255;
    }

    var colors = [];
    if(screenMode === TextModeEditor.Mode.C64MULTICOLOR) {
      //var backgroundColor = this.editor.frames.getBackgroundColor();
      var cellColor = this.editor.currentTile.color;

      if(typeof args['color'] != 'undefined') {
        cellColor = args['color'];
      }

      if(this.editor.graphic.getType() !== 'sprite') {
        if(cellColor < 8) {
          screenMode = TextModeEditor.Mode.TEXTMODE;
        } else {
          cellColor -= 8;
        }
      }

      /*
      var backgroundColor = this.editor.frames.getBackgroundColor();
      var multi1 = this.editor.frames.getC64Multi1Color();
      var multi2 = this.editor.frames.getC64Multi2Color();
      */


      var backgroundColor = args['bgColor'];
      var multi1 = args['c64Multi1Color'];
      var multi2 = args['c64Multi2Color'];

      if(typeof args['backgroundColor'] != 'undefined') {
        backgroundColor = args['backgroundColor'];
      }

      backgroundIsTransparent = backgroundColor == this.editor.colorPaletteManager.noColor;

      // colour order is different for sprites and chars in c64 multicolour mode
      var colors = [];

      if(this.editor.graphic.getType() == 'sprite') {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(cellColor));
        colors.push(colorPalette.getColor(multi2));
      } else {
        colors.push(colorPalette.getColor(backgroundColor));
        colors.push(colorPalette.getColor(multi1));
        colors.push(colorPalette.getColor(multi2));
        colors.push(colorPalette.getColor(cellColor));
      }

      // if color not defined, use the current color
      if(colorIndex == -1 && colorRGB === false) {
        colorIndex = cellColor;
      }

      
    }


    var x = args['x'];
    var y = args['y'];

    var highlight = false;
    if(typeof args['highlight'] == 'undefined') {
      highlight = false;

    } else {
      highlight = args['highlight'];
    }


    var select = false;
    if(typeof args['select'] == 'undefined') {
      select = false;

    } else {
      select = args['select'];
    }


    var scale = 2;

    if(typeof args['scale'] != 'undefined') {
      scale = args['scale'];
    }

    var padding = 0;
    if(typeof args['padding'] != 'undefined') {
      padding = args['padding'];
    }

    /*
    if(typeof highlight == 'undefined') {
      highlight = false;
      if(x == this.highlightX && y == this.highlightY) {
        highlight = true;
      }

    }
    */

    if(highlight) {
      for(var j = -1; j < charHeight * scale + padding * 2 + 1; j++) {
        for(var i = -1; i < charWidth * scale + padding * 2 + 1; i++) {
          var dstPos = ((x) + i + x * padding 
              + ((y) + j + y * padding) * imageData.width) * 4;
          if(dstPos > 0 && (dstPos + 3) < imageData.data.length) {
            imageData.data[dstPos] = 255; 
            imageData.data[dstPos + 1] = 0;
            imageData.data[dstPos + 2] = 0;
            imageData.data[dstPos + 3] = 255;
          }
        }
      }
    }

    if(select) {
      for(var j = -1; j < charHeight * scale + padding * 2 + 1; j++) {
        for(var i = -1; i < charWidth * scale + padding * 2 + 1; i++) {
          var dstPos = ((x) + i + x * padding 
              + ((y) + j + y * padding) * imageData.width) * 4;
          if(dstPos > 0 && (dstPos + 3) < imageData.data.length) {
            imageData.data[dstPos] = 255; 
            imageData.data[dstPos + 1] = 0;
            imageData.data[dstPos + 2] = 0;
            imageData.data[dstPos + 3] = 255;
          }
        }
      }

    }


    if(!tileData) {
      return;
    }


    if(character == -1) {
      // draw solid block of color

      if(colorIndex != -1) {
        var color = colorPalette.getHex(colorIndex);//this.editor.petscii.getColor(color);
        colorR = (color >> 16) & 255;
        colorG = (color >> 8) & 255;
        colorB =  color & 255;
      }


      if(imageData != null) {
        for(var j = 0; j < charHeight * scale; j++) {
          for(var i = 0; i < charWidth * scale; i++) {
            var dstPos = ((x) + i + (x + 1) * padding 
                + ((y) + j + (y + 1) * padding) * imageData.width) * 4;
            imageData.data[dstPos] = colorR; 
            imageData.data[dstPos + 1] = colorG;
            imageData.data[dstPos + 2] = colorB;
            imageData.data[dstPos + 3] = 255;
          }
        }
      }

    } else {

      var charX = character % charsAcross;
      var charY = Math.floor(character / charsAcross);    


      if(colorIndex != -1) {
        var color = colorPalette.getHex(colorIndex);
        colorR = (color >> 16) & 255;
        colorG = (color >> 8) & 255;
        colorB =  color & 255;
      }


      if(this.getType() == 'vector') {
        var context = args['context'];
        var tileIndex = args['character'];
        var tileWidth = charWidth * args['scale'];
        var tileHeight = charHeight * args['scale'];

        var bgColor = false;
        var fgColor = false;

        var bgColorIndex = args['bgColor'];
        if(typeof bgColorIndex != 'undefined' && bgColorIndex != -1) {
          bgColor = '#' + colorPalette.getHexString(bgColorIndex);
        }
        if(typeof args['bgColorRGB'] != 'undefined') {
          bgColor = 'rgb(' + bgColorR + ',' + bgColorG + ',' + bgColorB + ')';
        }


        var colorIndex = args['color'];
        if(typeof colorIndex != 'undefined') {
          fgColor = '#' + colorPalette.getHexString(colorIndex);
          
        }

        if(typeof args['colorRGB'] != 'undefined') {
          //fgColor = args['colorRGB'];
          fgColor = 'rgb(' + colorR + ',' + colorG + ',' + colorB + ')';
        }

        if(typeof context != 'undefined') {

          var dstX = x * args['scale'];
          var dstY = y * args['scale'];

          
          if(bgColor !== false) {
          //if(bgColorIndex !== -1) {
          //  var bgColor = '#' + colorPalette.getHexString(bgColorIndex);

            context.fillStyle = bgColor;
            context.fillRect(dstX, dstY, tileWidth, tileHeight);
          } else {
            if(backgroundIsTransparent) {
              context.clearRect(dstX, dstY, tileWidth, tileHeight);
            } else if(bgColorRGB !== false) {
              context.fillStyle = 'rgb(' + bgColorR + ',' + bgColorG + ',' + bgColorB + ')';
              context.fillRect(dstX, dstY, tileWidth, tileHeight);
            }
          }

          var path = this.getGlyphPath(tileIndex);
          if(path !== null) {
            var cellSize = tileWidth;
            var fontScale = this.getFontScale();
            var scale = cellSize * fontScale;
            var ascent = this.getFontAscent() ;


            //context.fillStyle = '#ffffff';
            context.setTransform(scale,0,0,-scale, dstX, dstY + ascent * scale);


            if(flipH) {
              context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
              context.scale(-1,1);
              context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
            }

            if(flipV) {
              context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
              context.scale(1,-1);
              context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
            }            

            if(rotateZ != 0) {
              context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );
              context.rotate(rotateZ * 90 * Math.PI / 180);            
              context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
            }

            context.fillStyle = fgColor;

            context.fill(path);
            context.setTransform(1,0,0,1,0,0);

          }
        }


        /*
        var tileWidth = charWidth * args['scale'];
        var tileHeight = charHeight * args['scale'];
        var dstX = x * args['scale'];
        var dstY = y * args['scale'];
        var bgColorIndex = args['bgColor'];
        var colorIndex = args['color'];
        
        
        // drawing into context not imagedata
        var context = args['context'];

        if(typeof context != 'undefined') {

          if(typeof bgColorIndex == 'undefined') {
            console.log('bg colour not defined');
          }

          var path = this.getGlyphPath(args['character']);
          if(path !== null) {
            var fontSize = tileWidth + 1;
            var fontScale = this.getFontScale(fontSize);
            var fontDescender = this.getFontDescender() * fontScale;

            context.save();             
            
            if(bgColorIndex !== -1) {
              var bgColor = '#' + colorPalette.getHexString(bgColorIndex);

              context.fillStyle = bgColor;
              context.fillRect(dstX, dstY, tileWidth, tileHeight);
            } else {
              context.clearRect(dstX, dstY, tileWidth, tileHeight);
            }

            context.translate( dstX, dstY + fontSize + fontDescender);      
            if(rotateZ != 0) {
              context.translate(fontSize / 2, -(fontSize) / 2 - fontDescender);
              context.rotate(rotateZ * 90 * Math.PI / 180);            
              context.translate(-fontSize / 2, (fontSize) / 2 + fontDescender);
            }

            context.scale(fontScale,-fontScale);

  
            context.beginPath();
            Typr.U.pathToContext(path, context);
            context.fillStyle = '#' + colorPalette.getHexString(colorIndex);//'#000000';    //  
            context.fill();

            context.restore();
          }
        }
        */


      } else {

        if(!imageData) {
          return;
        }

        
        for(var j = 0; j < charHeight * scale; j++) {
          for(var i = 0; i < charWidth * scale; i++) {
            var colorIndex = 0;
            var srcX = Math.floor(i / scale);
            var srcY = Math.floor(j / scale);

            if(flipH) {
              srcX = (charWidth - srcX - 1);
            }

            if(flipV) {
              srcY = (charHeight - srcY - 1);
            }

            if(rotateZ != 0 && charWidth === charHeight) {
              var tempX = srcX;
              var tempY = srcY;
              if(rotateZ === 1) {
                srcY = (charWidth - tempX - 1);
                srcX = tempY;
              } 
              if(rotateZ === 2) {
                srcX = (charWidth - tempX - 1);
                srcY = (charHeight - tempY - 1);
              }

              if(rotateZ === 3) {
                srcY = tempX;
                srcX = (charHeight - tempY - 1); 
              }
            }
            var srcPos = srcX + srcY * charWidth;

            colorIndex = tileData[srcPos];


            var dstX = i;
            var dstY = j;

            var dstPos = ((x) + dstX + (x + 1) * padding 
                + ((y) + dstY + (y + 1) * padding) * imageData.width) * 4;

            if(!highlight) {

              if(screenMode === TextModeEditor.Mode.RGB) {
                colorR = (colorIndex >>> 16) & 255;
                colorG = (colorIndex >>> 8) & 255;
                colorB = colorIndex & 255;
                var colorA = (colorIndex >>> 24) & 255;

                imageData.data[dstPos] = colorR;
                imageData.data[dstPos + 1] = colorG;
                imageData.data[dstPos + 2] = colorB;
                imageData.data[dstPos + 3] = colorA;
              } else if(screenMode === TextModeEditor.Mode.INDEXED) {

                if(colorIndex === transparentColorIndex) {
                  imageData.data[dstPos] = 0;
                  imageData.data[dstPos + 1] = 0;
                  imageData.data[dstPos + 2] = 0;
                  imageData.data[dstPos + 3] = 0;

                } else {
                  // TODO: speed this up
                  var color = colorPalette.getHex(colorIndex);  
                  colorR = (color >> 16) & 255;
                  colorG = (color >> 8) & 255;
                  colorB = color & 255;
                  imageData.data[dstPos] = colorR;
                  imageData.data[dstPos + 1] = colorG;
                  imageData.data[dstPos + 2] = colorB;
                  imageData.data[dstPos + 3] = 255;
                }

              } else if(screenMode == TextModeEditor.Mode.NES) {
                if(colorIndex >= 4) {
                  colorIndex = 1;
                }
                          
                // TODO: speed this up..
                colorIndex = this.editor.colorPaletteManager.colorSubPalettes.getColor(colorIndex);

                var color = colorPalette.getHex(colorIndex);

  //              var color = colorPalette.getNESColor(colorIndex);
                imageData.data[dstPos] = (color >> 16) & 255;  
                imageData.data[dstPos + 1] = (color >> 8) & 255;
                imageData.data[dstPos + 2] = color & 255;
                imageData.data[dstPos + 3] = 255;

              } else if(screenMode == TextModeEditor.Mode.TEXTMODE 
                || screenMode == TextModeEditor.Mode.C64ECM
                || screenMode == TextModeEditor.Mode.C64STANDARD) {
                if(colorIndex > 0) {
                  imageData.data[dstPos] = colorR; 
                  imageData.data[dstPos + 1] = colorG;
                  imageData.data[dstPos + 2] = colorB;
                  imageData.data[dstPos + 3] = 255;
                } else if(bgColorRGB !== false) {                
                  imageData.data[dstPos] = bgColorR;
                  imageData.data[dstPos + 1] = bgColorG;
                  imageData.data[dstPos + 2] = bgColorB
                  imageData.data[dstPos + 3] = 255;            
                } 
              } else if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
                var value = 0;

                // upper bit
                if(colorIndex > 0) {
                  value += 2;
                }


  //              srcPos += 4;
                // TODO: need to fix this

                // lower bit
                colorIndex = tileData[srcPos + 1];
                if(colorIndex > 0) {
                  value += 1;
                }
                var color = colors[value];

                for(var k = 0; k < scale; k++) {
                  if(value === 0 && backgroundIsTransparent) {
                    imageData.data[dstPos + 3] = 0;
                    i++;
                    imageData.data[dstPos + 7] = 0;
                    i++;
                  } else {
                    imageData.data[dstPos] = color.r * 255; 
                    imageData.data[dstPos + 1] = color.g * 255;
                    imageData.data[dstPos + 2] = color.b * 255;
                    imageData.data[dstPos + 3] = 255;

                    i++;
                    imageData.data[dstPos + 4] = color.r * 255; 
                    imageData.data[dstPos + 5] = color.g * 255;
                    imageData.data[dstPos + 6] = color.b * 255;
                    imageData.data[dstPos + 7] = 255;

                    i++;
                  }
                  dstPos += 8;
                }
                i--;

  //              i += scale;


              }
            } else {
              // unknown mode, make everything grey
              if(colorIndex > 0) {
                imageData.data[dstPos] = 40; 
                imageData.data[dstPos + 1] = 40;
                imageData.data[dstPos + 2] = 40;
                imageData.data[dstPos + 3] = 40;

              } else {
                /*
                imageData.data[dstPos] = 200;//backgroundR;
                imageData.data[dstPos + 1] = 200;//backgroundG;
                imageData.data[dstPos + 2] = 200;//backgroundB;
                imageData.data[dstPos + 3] = 255;
                */
              }

            }

          }
        }
      }
    }

  },


  getPixel: function(character, x, y, frame) {

    if(typeof frame == 'undefined') {
      // should frame be 1 or 0?
      frame = 0;
    }

    if(character === false || character < 0 || character >= this.tileData.length) {
      return false;
    }

    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid' && layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      var ecmGroup = Math.floor(character / 256);
      character = (character % 64) + ecmGroup * 256;
    }

    var srcPos = x + y * this.charWidth;


    if(frame == 'current') {
      // character data stores the current frame...
      return this.currentTileData[character][srcPos];
    }
    
    var frameIndex = 0;
    if(this.tileData[character].props.animated == 'frames' && frame < this.tileData[character].data.length) {
      // return the requested frame
      return this.tileData[character].data[frame][srcPos];
    }

    // return frame zero
    return this.tileData[character].data[0][srcPos];

  },

  setAnimatedTicksPerFrame: function(character, ticksPerFrame) {
    this.tileData[character].props.ticksPerFrame = ticksPerFrame;
    this.modified();    

//    this.characterProperties[character].ticksPerFrame = ticksPerFrame;
  },

  setAnimatedType: function(character, type) {

    if(type == 'none') {
      this.setCharacterFrame(character, 0);
    }
    this.tileData[character].props.animated = type;

    if(type == 'frames') {
      this.tileData[character].props.frameCount = 1;
 
    } else {
      // not true for non square characters...
      this.tileData[character].props.frameCount = this.charWidth;
//      this.characterProperties[character].frameCount = this.charWidth;
    }
    this.modified();    
 
  },

  hasAnimatedTiles: function() {
    for(var i = 0; i < this.tileData.length; i++) {
      if(typeof this.tileData[i].props !== 'undefined') {
        if(typeof this.tileData[i].props.animated != 'undefined' && this.tileData[i].props.animated != false) {
          return true;
        }
      }
    }
    return false;

  },

  insertFrame: function(character, insertAfter) {
    var newFrameData = this.newPixelData();

    // copy the frame to insert after
    for(var i = 0; i < this.tileData[character].data[insertAfter].length; i++) {
      newFrameData[i] = this.tileData[character].data[insertAfter][i];
    }

    // insert it
    this.tileData[character].data.splice(insertAfter + 1, 0, newFrameData);
    this.tileData[character].props.frameCount = this.tileData[character].data.length;
    this.modified();    

    /*
    for(var y = 0; y < this.charHeight; y++) {
      newFrameData[y] = [];
      for(var x = 0; x < this.charWidth; x++) {
        newFrameData[y][x] = this.getPixel(character, x, y, this.insertAfter);
      }
    }

    this.characterProperties[character].frameData.splice(insertAfter + 1, 0, newFrameData);
    this.characterProperties[character].frameCount = this.characterProperties[character].frameData.length;
    */
  },

  deleteFrame: function(character, frame) {
    if(this.tileData[character].data.length <= 1) {
      return;
    }

    this.tileData[character].data.splice(frame, 1);
    this.tileData[character].props.frameCount = this.tileData[character].data.length;
    this.modified();    

  },

  getAnimatedType: function(character) {
    return this.tileData[character].props.animated;
  },

  getTileProperties: function(character) {
    if(character!== false && character >= 0 && character < this.tileData.length) {
      return this.tileData[character].props;
    }

    return false;
  },



  getCharacterFrame: function(character) {
    return this.tileData[character].props.frame;
  },

  setAnimated: function(character, animated) {

    this.customCharacterset = true;

    this.tileData[character].props.animated = animated;
    this.tileData[character].props.lastTick = 0;
    this.tileData[character].props.frame = 0;

    if(animated === false) {
      this.setCharacterFrame(character, 0);
    }

    this.modified();    

    /*
    this.characterProperties[character].animated = animated;
    this.characterProperties[character].lastTick = 0;
    this.characterProperties[character].frame = 0;
    */
  },




  invertPixels: function(character, invert) {
    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        var dst = x + y * this.charWidth;
        var pixel = this.getPixel(character, x, y);

        if(invert) {
          if(pixel !== 0) {
            this.currentTileData[character][dst] = 0;
          } else {
            this.currentTileData[character][dst] = 1;            
          }
//          this.setImageDataPixel(character, x, y, !this.getPixel(character, x, y));
        } else {
          this.currentTileData[character][dst] = pixel;
//          this.setImageDataPixel(character, x, y, this.getPixel(character, x, y));          
        }
      }
    }
    this.updateCharacter(character);
    this.modified();    

  },


  // copy the rotated character into the current character data
  rotatePixels: function(character, h, v) {

    var temp = [];
    for(var y = 0; y < this.charHeight; y++) {
      temp[y] = [];
      for(var x = 0; x < this.charWidth; x++) {
        temp[y][x] = this.getPixel(character, x, y);
      }
    }

    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        var srcX = (x + h + this.charWidth) % this.charWidth;
        var srcY = (y + v + this.charHeight) % this.charHeight;

        this.currentTileData[character][x + y * this.charWidth] = temp[srcY][srcX];

//        this.setImageDataPixel(character, x, y, temp[srcY][srcX]);

//        this.setPixel(character, x, y, temp[srcY][srcX], false);
      }
    }
    this.updateCharacter(character);
    this.modified();    

  },


  // copy the character frame into the current character data
  setCharacterFrame: function(character, frame) {

    if(frame >= this.tileData[character].data.length) {
      return;
    }

    for(var i = 0; i < this.tileData[character].data[frame].length; i++) {
      this.currentTileData[character][i] = this.tileData[character].data[frame][i];
    }

    /*
    for(var y = 0; y < this.charHeight; y++) {
      for(var x = 0; x < this.charWidth; x++) {
        this.setImageDataPixel(character, x, y, this.characterProperties[character].frameData[frame][y][x]);
      }
    }
    */
    this.updateCharacter(character);
  },

  getAnimatedCharacterTicks: function() {
    var ticks = [];
    for(var i = 0; i < this.tileData.length; i++) {
      if(this.tileData[i].props.animated !== false) {
        var frameCount = this.getFrameCount(i, this.tileData[i].props.animated);
        ticks.push(frameCount * this.tileData[i].props.ticksPerFrame);
      }
    }


    return ticks;
  },

  getFrameCount: function(character, type) {
    var frameCount = 0;
    switch(type) {
      case 'right':
      case 'left':
        frameCount = this.charWidth;
        break;
      case 'up':
      case 'down':
        frameCount = this.charHeight;
        break;
      case 'blink':
        frameCount = 2;
        break;
      case 'frames':
        frameCount = this.tileData[character].props.frameCount;
        break;
    }
    return frameCount;
  },

  update: function(tick) {
    var updatedCharacters = [];
    var tileCount = this.tileData.length;
    for(var i = 0; i < tileCount; i++) {
      if(this.tileData[i].props.animated !== false) {

        var frameCount = this.getFrameCount(i, this.tileData[i].props.animated);

        var frame = Math.floor(tick / this.tileData[i].props.ticksPerFrame) % frameCount;

        //if(typeof this.characterProperties[i].lastTick == 'undefined' || tick >= this.characterProperties[i].lastTick + this.characterProperties[i].ticksPerFrame) {
        if(this.tileData[i].props.frame != frame) {
          this.tileData[i].props.frame = frame;
          this.tileData[i].props.lastTick = tick;

//          this.characterProperties[i].frame = (this.characterProperties[i].frame + 1) % frameCount;
          switch(this.tileData[i].props.animated) {
            case 'right':
              this.rotatePixels(i, -frame, 0);
              break;
            case 'up':
              this.rotatePixels(i, 0, frame);
              break;
            case 'down':
              this.rotatePixels(i, 0, -frame);
              break;
            case 'blink':
              this.invertPixels(i, frame);
              break;
            default:
            case 'left':
              this.rotatePixels(i, frame, 0);
              break;
            case 'frames':
              this.setCharacterFrame(i, frame);
              break;

          }
          updatedCharacters.push(i);

          if(g_app.getMode() == '3d') {
//            this.generateTileGeometry(i);
//            this.generateTileBackgroundGeometry(i);
          }
        }
      }
    }

    if(updatedCharacters.length > 0) {
      if(this.editor.type == '2d') {
        this.editor.currentTile.canvasDrawCharacters();
        this.editor.graphic.invalidateAllCells();
        this.editor.graphic.redraw({ animatedTilesOnly: true });//{ allCells: true });
      }
      return true;
    }

    return false;
  }


}
