//https://threejs.org/docs/#manual/introduction/How-to-update-things

var ColorPalette = function() {

  this.editor = null;

  this.colorPaletteId = null;
  this.docRecord = null;

  this.defaultBackgroundColor = 6;
  this.defaultBorderColor = 14;

  this.colors = [];
  this.materials = [];

  this.isC64Palette = true;

  this.paletteCanvas = null;

  this.sortOrderMethod = 'default';
  this.sortOrder = [];

  // how the colors map to the grid.
  this.currentMap = [];

  this.trackModified = true;
}

ColorPalette.prototype = {

  setTrackModified: function(track) {
    this.trackModified = track;
  },

  modified: function() {
    if(g_app.openingProject || !this.trackModified) {
      return;
    }
    var path = '/color palettes/' + this.docRecord.name;
    g_app.doc.recordModified(this.docRecord, path);
  },

  init: function(editor, name, id) {
    this.editor = editor;

    if(typeof name === 'undefined') {
      this.name = 'Color Palette';
    } else {
      this.name = name;
    }

    this.colorPaletteId = id;
    this.version = 1;


    this.docRecord = g_app.doc.getDocRecordById(id, '/color palettes');// g_app.doc.getDocRecord('/color palettes/' + this.name);

    this.name = this.docRecord.name;


    if(typeof this.docRecord.data.colors == 'undefined') {
      this.docRecord.data.colors = [];
    }

    // check if contains alpha
    var containsAlpha = false;
    for(var i = 0; i < this.docRecord.data.colors.length; i++) {
      var alpha = (this.docRecord.data.colors[i] >>> 24) & 0xff;
      if(alpha > 0) {
        containsAlpha = true;
      }
    }

    if(!containsAlpha) {
      for(var i = 0; i < this.docRecord.data.colors.length; i++) {
        this.docRecord.data.colors[i] = this.docRecord.data.colors[i] >>> 0;
      }
    }

    /*
    if(typeof this.docRecord.data.version == 'undefined') {
      for(var i = 0; i < this.docRecord.data.colors.length; i++) {
        this.docRecord.data.colors[i] = this.docRecord.data.colors[i] >>> 0;
      }
      this.docRecord.data.version = this.version;
    }
    */

    if(typeof this.docRecord.data.colorsAcross == 'undefined') {
      this.docRecord.data.colorsAcross = 8;
    }

    if(typeof this.docRecord.data.colorsDown == 'undefined') {
      this.docRecord.data.colorsDown = 2;
    }


  },

  nameChanged: function() {
    this.name = this.docRecord.name;
  },

  setName: function(name) {
    this.name = name;
    this.docRecord.name = name;

  },

  getId: function() {
    return this.colorPaletteId;
  },

  getName: function() {
    var colorPalette = g_app.doc.getDocRecordById(this.colorPaletteId, '/color palettes');
    return colorPalette.name;
  },

  getPath: function() {
    var colorPalette = g_app.doc.getDocRecordById(this.colorPaletteId, '/color palettes');
    if(!colorPalette) {
      return false;
    }

    return '/color palettes/' + colorPalette.name;
  },

  // clear all data to do with color palette
  clear: function() {
    this.docRecord.data.colors = [];
  },

  getColors: function() {
    return this.colors;
  },

  clearPaletteMaps: function() {
    var path = this.getPath();

    var colorMapsPath = path + '/maps';
    var colorMaps = g_app.doc.getDocRecord(colorMapsPath);    
    
    if(!colorMaps) {
      return;
    }
    colorMaps.children = [];
  },

  setColorPaletteMap: function(name, colorPaletteMap) {

    var colorMap = [];
    for(var y = 0; y < colorPaletteMap.length; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorPaletteMap[y].length; x++) {
        colorMap[y][x] = colorPaletteMap[y][x];
      }
    }

    if(this.docRecord) {    
      var path = this.getPath();
      var colorMapsPath = path + '/maps';
      var colorMaps = g_app.doc.getDocRecord(colorMapsPath);    
      
      if(!colorMaps) {
        colorMaps = g_app.doc.createDocRecord(path, 'maps', 'folder', {});
      }
  
      var colorMapPath = colorMapsPath + '/' + name;
      var colorMapRecord = g_app.doc.getDocRecord(colorMapPath);
      if(!colorMapRecord) {
        colorMapRecord = g_app.doc.createDocRecord(colorMapsPath, name, "color map", {  map: colorMap })
      } else {
        colorMapRecord.data.map = colorMap;
      }

      return colorMapRecord.id;
    } else {
      this.colorMap = colorMap;
    }

  },


  getColorPaletteMaps: function() {
    var path = this.getPath();
    if(path === false) {
      return [];
    }

    var colorMapsPath = path + '/maps';

    var colorMaps = g_app.doc.getDocRecord(colorMapsPath);    
    if(!colorMaps) {
      // no maps
      return [];
    }

    

    var names = [];
    var dir = g_app.doc.dir(colorMapsPath);
    for(var i = 0; i < dir.length; i++) {
      names.push({ "id": dir[i].id, "name": dir[i].name});
    }
    return names;

  },


  getDefaultColorPaletteMap: function() {
    if(!this.docRecord) {
      return this.colorMap;
    }
    var path = this.getPath();

    var colorMapsPath = path + '/maps';
    var colorMaps = g_app.doc.getDocRecord(colorMapsPath);    
    if(!colorMaps) {
      // no maps
      return false;
    }

    var names = [];
    var dir = g_app.doc.dir(colorMapsPath);
    if(dir.length == 0) {
      return false;
    }

    return dir[0].data.map;

  },

  getColorPaletteMapById: function(id) {

    var path = this.getPath();
    var colorMapsPath = path + '/maps';
    var mapRecord = g_app.doc.getDocRecordById(id, colorMapsPath);

    if(!mapRecord) {
      return false;
    }

    return mapRecord.data.map;

  },

  getColorsAcross: function() {
    if(this.docRecord) {
      return this.docRecord.data.colorsAcross;
    } else if(this.colorMap && this.colorMap.length) {
      return this.colorMap[0].length;
    } else {
      return 16;
    }
  },

  getColorsDown: function() {
    if(this.docRecord) {
      return this.docRecord.data.colorsDown;
    } else if(this.colorMap) {
      return this.colorMap.length;
    } else {
      return 16;
    }
  },

  setIsC64Palette: function(isC64Palette) {
    this.isC64Palette = true;
  },
  getIsC64Palette: function() {
    return this.isC64Palette;
  },

  setSortOrderMethod: function(sortOrderMethod) {

//    alert('set sort order');

    $('#colorPaletteSortOrder').val(sortOrderMethod);

    var colors = this.docRecord.data.colors;
    var colorsAcross = this.getColorsAcross();

    this.sortOrderMethod = sortOrderMethod;
    this.sortOrder = this.editor.colorPaletteManager.sortColors(colors, { 'sortMethod': sortOrderMethod });

    var colorMap = [];

    var index = 0;
    var colorsDown = Math.ceil(this.sortOrder.length / colorsAcross);
    for(var y = 0; y < colorsDown; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorsAcross; x++) {
        if(index < this.sortOrder.length) {
          colorMap[y][x] = this.sortOrder[index];
        } else {
          colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }
        index++;
      }
    }

    this.currentMap = colorMap;

    return this.sortOrder;
  },

  getColorMap: function(sortOrderMethod, across) {

    if(sortOrderMethod == 'default') {
      var colorMap = this.getDefaultColorPaletteMap();
      if(colorMap !== false) {
        return colorMap;
      }
    } else if( $.isNumeric(sortOrderMethod)) {

      console.log('here!');
      if(this.docRecord) {
        var colorMapId = parseInt(sortOrderMethod, 10);
        var colorMap =  this.getColorPaletteMapById(colorMapId);      

        return colorMap;
      } else {
        return this.colorMap;
      }
    } 


    var colors = null;
    if(this.docRecord) {
      colors = this.docRecord.data.colors;
    } else {
      colors = this.noDocColors;
    }

    var colorsAcross = across;
    if(typeof across == 'undefined') {
      colorsAcross = this.getColorsAcross();
    }


    var sortOrder = this.editor.colorPaletteManager.sortColors(colors, { 'sortMethod': sortOrderMethod });

    var colorMap = [];

    var index = 0;
    var colorsDown = Math.ceil(sortOrder.length / colorsAcross);
    for(var y = 0; y < colorsDown; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorsAcross; x++) {
        if(index < sortOrder.length) {
          colorMap[y][x] = sortOrder[index];
        } else {
          colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }
        index++;
      }
    }
    return colorMap;

  },

  setCurrentColorMap: function(colorMapId) {
    
    var colorMap = this.getColorPaletteMapById(colorMapId);
    if(colorMap === false) {
      return false;
    }

    this.currentMap = colorMap;
    return colorMap;

  },

  
  getCurrentColorMap: function() {
    return this.currentMap;
  },  
  getSortOrderMethod: function() {
    return this.sortOrderMethod;
  },

  getSortOrder: function() {
    return this.sortOrder;
  },

  setAcrossDown: function(across, down) {

    if(typeof across != 'undefined' && typeof down != 'undefined') {
      this.docRecord.data.colorsAcross = across;
      this.docRecord.data.colorsDown = down;
      return;
    }

    if(typeof across != 'undefined' && typeof down == 'undefined') {
      this.docRecord.data.colorsAcross = across;
      this.docRecord.data.colorsDown = Math.ceil(this.colors.length / this.docRecord.data.colorsAcross);
      return;
    }


    var colorsAcross = 4;
    var colorsDown = 4;

    switch(this.colors.length) {
      case 2:
        colorsAcross = 2;
        colorsDown = 1;
      break;
      case 4:
        colorsAcross = 4;
        colorsDown = 1;
      break;
      case 8:
        colorsAcross = 4;
        colorsDown = 2;      
      break;
      case 16:
        colorsAcross = 4;
        colorsDown = 4;
      break;
      case 32:
        this.colorsAcross = 8;
        this.colorsDown = 4;      
      break;
      case 64:
        this.colorsAcross = 8;
        this.colorsDown = 8;      
      break;
      case 128:
        this.colorsAcross = 16;
        this.colorsDown = 8;      
      break;
      case 256:
        this.colorsAcross = 16;
        this.colorsDown = 16;      
      break;
    }    

    this.docRecord.data.colorsAcross = colorsAcross;
    this.docRecord.data.colorsDown = colorsDown;

    this.modified();
  },


  // should only be called when loading?
  setColorsFromDoc: function() {
    var colors = this.docRecord.data.colors;

    for(var i = 0; i < colors.length; i++) {
      this.createColorMeta(i);
    }

    var colorsAcross = 8;
    var colorsDown = Math.ceil(colors.length / colorsAcross);

    if(typeof this.docRecord.data.colorsAcross != 'undefined') {
      colorsAcross = this.docRecord.data.colorsAcross;
    }

    if(typeof this.docRecord.data.colorsDown != 'undefined') {
      colorsDown = this.docRecord.data.colorsDown;
    }

    this.setAcrossDown(colorsAcross, colorsDown);
    this.paletteChanged();

    if(this.docRecord.name.indexOf('c64') != -1) {
      this.isC64Palette = true;
    } else {
      this.isC64Palette = false;
    }

  },

  copyPalette: function(colorPalette) {
    this.setColors(colorPalette.noDocColors, colorPalette.colorsAcross, colorPalette.colorsDown);
  },

  // replace the colors
  setColors: function(colors, colorsAcross, colorsDown) {
    //console.error('set colours');
    this.isC64Palette = false;
    var currentColorCount = this.colors.length;

    var colorMap = [];

    // save the existing materials so can reuse
    var existingMaterials = [];



    for(var i = 0; i < this.colors.length; i++) {
      var rgba = this.getRGBA(i);
      var smallestDistance = false;
      var smallestIndex = false;

      for(var j = 0; j < colors.length; j++) {
        var a = (colors[j] >>> 24) & 0xff;
        var r = (colors[j] >>> 16) & 0xff;
        var g = (colors[j] >>> 8) & 0xff;
        var b = (colors[j] >>> 0) & 0xff;          

        var distance = (rgba[0] - r) * (rgba[0] - r)
                       + (rgba[1] - g) * (rgba[1] - g)
                       + (rgba[2] - b) * (rgba[2] - b);
        if(smallestDistance === false || distance < smallestDistance) {
          smallestDistance = distance;
          smallestIndex = j;
        }
      }

      if(smallestIndex !== false) {
        colorMap[i] = smallestIndex;
      }
    }



    if(this.docRecord) {
      var layers = this.editor.layers;
      var layerCount = layers.getLayerCount();
  
      for(var i = 0; i < layerCount; i++) {
        var layer = layers.getLayerObjectFromIndex(i);
        for(var j = 0; j < this.colors.length; j++) {
          layer.replaceColor(j, colorMap[j]);
        }
      }


      this.docRecord.data.colors = [];
      this.colors = []; 

      for(var i = 0; i < colors.length; i++) {
        this.addColor(colors[i]);
        this.createColorMeta(i);
      }

      this.setAcrossDown(colorsAcross, colorsDown);
      this.paletteChanged();

      this.editor.graphic.redraw({ allCells: true });
      this.editor.syncColorPickers();

      this.modified();
    } else {
      this.noDocColors = colors;
      this.colorsAcross = colorsAcross;
      this.colorsDown = colorsDown;

      for(var i = 0; i < colors.length; i++) {
        this.createColorMeta(i);
      }

    }


  },

  setColorRGB: function(colorIndex, rgb) {
    var argb = (0xff000000 | (rgb >>> 0)) >>> 0;
    this.docRecord.data.colors[colorIndex] = argb;
    this.modified();

    this.createColorMeta(colorIndex);

  },

  addColor: function(colorHex) {
    this.docRecord.data.colors.push(colorHex);    
    this.modified();
    this.createColorMeta(this.docRecord.data.colors.length - 1);
  },

  createColorMeta: function(colorIndex) {
    var colorHex = 0;
    if(this.docRecord) {
      colorHex = this.docRecord.data.colors[colorIndex];
    } else {
      colorHex = this.noDocColors[colorIndex];
    }

    var color = {};
    color.argb = colorHex;//this.docRecord.data.colors[colorIndex];
    color.hex = colorHex & 0xffffff;
    color.emissiveHex = 0;
    color.specularHex = 0;
    color.shininess = 0;

    color.index = this.colors.length;

    var a = (color.hex >>> 24) & 0xff;
    var r = (color.hex >>> 16) & 0xff;
    var g = (color.hex >>> 8) & 0xff;
    var b = (color.hex >>> 0) & 0xff;  

    color.a = a / 255;
    color.r = r / 255;
    color.g = g / 255;
    color.b = b / 255;

    var c = {};
    c.values = [r, g, b, a];

    color.hsv = Colour.converters[Colour.RGBA][Colour.HSVA](c);
    color.rgb = c.values;

    if(color.hsv.values[1] < 0.1) {
      color.isGrey = true;
    } else {
      color.isGrey = false;
    }
    color.laba = Colour.converters[Colour.RGBA][Colour.LABA](c);


    color.material = null;

    if(colorIndex < this.materials.length && this.materials[colorIndex] != null) {
      this.materials[colorIndex].color.set(color.hex);
    }

/*
    color.material = new THREE.MeshPhongMaterial( 
      { color: color.hex, 
        emissive: color.emissiveHex, 
        specular: color.specularHex, 
        shininess: color.shininess 
      }) ;
*/
//    this.colors.push(color);
    this.colors[colorIndex] = color;
  },

  getColorCount: function() {
    return this.colors.length;
  },

  getDefaultBackgroundColor: function() {
    if(this.colors.length > this.defaultBackgroundColor) {
      // this is the c64 default
      return this.defaultBackgroundColor;
    }
    return 0;
  },

  getDefaultBorderColor: function() {
    if(this.colors.length > this.defaultBorderColor) {
      // this is the c64 default
      return this.defaultBorderColor;
    }
    return 0;
  },


  getRGBA: function(color) {
    if(color === false || color === this.editor.colorPaletteManager.noColor) {
      return [0, 0, 0, 0];
    }
    if(color < this.colors.length) {
      return this.colors[color].rgb;
    }
    return [0,0,0,0];
  },

  getARGB: function(color) {
    if(color === false || color === this.editor.colorPaletteManager.noColor) {
      return 0x000000;
    }
    if(color < this.colors.length) {
      return this.colors[color].argb;
    }
    return 0x000000;

  },

  getHex: function(color) {
    if(color === false || color === this.editor.colorPaletteManager.noColor) {
      return 0x000000;
    }
    if(color < this.colors.length) {
      return this.colors[color].hex;
    }
    return 0x000000;
  },


  // TODO: better name for this?
  getHexString: function(color) {
    if(color !== false && color >= 0 && color < this.colors.length) {
      return ("000000" + this.colors[color].hex.toString(16)).substr(-6);      
    }

    return "ffffff";
  },

  getIsGrey: function(color) {
    // TODO: should be looking at index, not array position to get color
    if(color === false) {
      return false;
    }
    if(color < this.colors.length) {
      return this.colors[color].isGrey;
    }
    return false;
  },


  getColor: function(color) {
    if(color < this.colors.length) {
      return this.colors[color];
    }
    return false;
  },

  getMaterial: function(colorIndex) {
    if(colorIndex < this.colors.length) {
      // materials are in the materials array
      while(colorIndex >= this.materials.length) {
        this.materials.push(null);
      }

      if(this.materials[colorIndex] == null) {
        var color = this.colors[colorIndex];

        this.materials[colorIndex] = new THREE.MeshPhongMaterial( 
          { color: color.hex, 
            emissive: color.emissiveHex, 
            specular: color.specularHex, 
            shininess: color.shininess 
          }) ;
      }

      return this.materials[colorIndex];
      /*
      if(this.colors[color].material == null) {
        this.colors[color].material = new THREE.MeshPhongMaterial( { color: this.colors[color].hex });
      }
      */

//      return this.colors[color].material; 
    }

    return null;
  },


  paletteChanged: function() {
    this.editor.colorPaletteManager.colorPaletteUpdated();
    // TODO: need to check current selected color, bg color, border color, etc
  },


  setToPreset: function(presetId, callback) {
    g_app.textModeEditor.colorPaletteManager.choosePreset(presetId, {
      colorPalette: this,
      callback: callback
    });

  },

  saveAsPNG: function(filename, colorPaletteMap, cellWidth, cellHeight) {

    var colorMap = colorPaletteMap;

    if(typeof colorPaletteMap == 'undefined') {
      colorMap = this.currentMap;
    }

    if(this.paletteCanvas == null) {
      this.paletteCanvas = document.createElement('canvas');
    }

    var colorWidth = 8;
    var colorHeight = 8;
    if(typeof cellWidth != 'undefined') {
      colorWidth = cellWidth;
    }

    if(typeof cellHeight != 'undefined') {
      colorHeight = cellHeight;
    }

    var colorsAcross = 0;
    var colorsDown = 0;
    for(var y = 0; y < colorMap.length; y++) {
      for(var x = 0; x < colorMap[y].length; x++) {
        if(colorMap[y][x] != this.editor.colorPaletteManager.noColor) {
          if(x + 1 > colorsAcross) {
            colorsAcross = x + 1;
          }
          colorsDown = y + 1;
        }
      }
    }

    this.paletteCanvas.width = colorsAcross * colorWidth;
    this.paletteCanvas.height = colorsDown * colorHeight;

    this.paletteCanvasContext = this.paletteCanvas.getContext('2d');

    for(var y = 0; y < colorsDown; y++) {
      for(var x = 0; x < colorsAcross; x++) {
        var colorIndex = colorMap[y][x];
        if(colorIndex !== this.editor.colorPaletteManager.noColor) {
          var color = this.getHexString(colorIndex);
          var colorHexString = ("000000" + color.toString(16)).substr(-6);

          this.paletteCanvasContext.fillStyle = '#' + colorHexString;
          this.paletteCanvasContext.fillRect(x * colorWidth, y * colorHeight, colorWidth,  colorHeight);
        } 
      }
    }

    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }

    var dataURL = this.paletteCanvas.toDataURL("image/png");
    download(dataURL, filename, "image/png");
  },


  loadFromJSON: function(jsonString) {
//    this.docRecord = g_app.doc.getDocRecord('/color palettes/' + this.name);
//    this.docRecord.data.colors = [];

    var colorJson = {};
//    try {
      var colors = [];
      var colorsAcross = 8;
      var colorsDown = 1;

//      colorJson = $.parseJSON(jsonString);
// test if its a string of object..
      colorJson = jsonString;
      if(typeof colorJson.colorPalette != 'undefined') {
        colorJson = colorJson.colorPalette;
      }

      var colors = [];
      var colorMap = [];

      if(typeof colorJson.data != 'undefined') {
        for(var i = 0; i < colorJson.data.length; i++) {
          colors.push(colorJson.data[i]);
        }
      }

      if(typeof colorJson.across != 'undefined') {
        colorsAcross = colorJson.across;
      } else {
        //this.autoColorsAcross();
        colorsAcross = colors.length; 
        colorsDown = 1;
      }


      if(typeof colorJson.maps != 'undefined' && colorJson.maps.length > 0) {
        var srcMap = colorJson.maps[0];

        for(var y = 0; y < srcMap.map.length; y++) {
          colorMap[y] = [];
          for(var x = 0; x < srcMap.map[y].length; x++) {
            colorMap[y][x] = srcMap.map[y][x];
          }
        }
      } else {
//        this.loadMap = false;
      }

      if(colors.length > 0) {
        /*
        this.docRecord = g_app.doc.getDocRecord('/color palettes/' + this.name);
        this.docRecord.data.colors = colors;
        this.colors = colors;
        this.docRecord.colorsAcross = colorsAcross;
        this.docRecord.colorsDown = colorsDown;
        */

//        this.setColors(colors, colorsAcross, colorsDown);

        this.docRecord.data.colors = [];
        this.colors = [];

        for(var i = 0; i < colors.length; i++) {
          this.addColor(colors[i]);
          this.createColorMeta(i);
        }
        
        this.clearPaletteMaps();

        if(colorMap.length > 0) {
          this.setColorPaletteMap('Default Layout', colorMap);
        }



      } else {
        this.errorMessage('No colours found');

      }
/*
    } catch(err) {
      console.error('Sorry, unable to interpret file');
    }
*/
  },

  getJSON: function() {
    var json = {};//

    if(this.docRecord) {
      json.id = this.docRecord.id;
      json.name = this.docRecord.name;
      json.version = 1;
      //json.data = this.docRecord.data;
      json.data = this.docRecord.data.colors;
      json.across = this.docRecord.data.colorsAcross;
      json.down = this.docRecord.data.colorsDown;

      json.maps = [];

      var path = this.getPath();

      var colorMapsPath = path + '/maps';
      var colorMaps = g_app.doc.getDocRecord(colorMapsPath);    
      
      if(colorMaps) {
        for(var i = 0; i < colorMaps.children.length; i++) {
          json.maps.push({
            name: colorMaps.children[i].name,
            map: colorMaps.children[i].data.map
          });
        }
      }
    } else {
      json.data = this.noDocColors;
      json.across = this.colorsAcross;
      json.down = this.colorsDown;
      json.maps = [];
      json.maps.push({
        name: 'default',
        map: this.colorMap
      });

    }

    return json;
  },

  saveAsJSON: function(filename) {

    var json = this.getJSON();

    var jsonString = JSON.stringify(json);
    if(filename.indexOf('.json') == -1) {
      filename += '.json';
    }
    download(jsonString, filename, "application/json");
  },

  getMapColorIndexOrder: function(map) {
    var colors = [];
    for(var y = 0; y < map.length; y++) {
      for(var x = 0; x < map[y].length; x++) {
        var colorIndex = map[y][x];

        if(colorIndex !== this.editor.colorPaletteManager.noColor) {
          colors.push(colorIndex);
        }
      }
    }
    return colors;
  },

  saveAsGPL: function(filename, map) {
    var data = '';
    data += 'GIMP Palette\n';
    data += '#Palette Name: palette\n';
    data += '#Description: exported palette\n';
    data += '#Colors: ' + this.colors.length + '\n';

    var colorIndexes = false;
    if(typeof map !== 'undefined') {
      colorIndexes = this.getMapColorIndexOrder(map);
    }

    for(var i = 0; i < this.colors.length; i++) {
      var color = this.getHex(i);
      if(colorIndexes !== false) {
        color = this.getHex(colorIndexes[i]);
      }

      data += (color >> 16) & 0xff;
      data += '\t';
      data += (color >> 8) & 0xff;
      data += '\t';
      data += (color) & 0xff;
      data += '\t';
      data += '#' + this.getHexString(i);
      data += '\n';      
    }
    if(filename.indexOf('.gpl') == -1) {
      filename += '.gpl';
    }
    download(data, filename, "application/gpl");
  },

  saveAsTxt: function(filename, map) {
    var data = '';

    data += ';paint.net Palette File\n';
    data += ';Palette Name: ' + 'palette name\n';
    data += ';Description: ' + ' palette description\n';
    data += ';Colors: ' + this.colors.length + '\n';

    var colorIndexes = false;
    if(typeof map !== 'undefined') {
      colorIndexes = this.getMapColorIndexOrder(map);
    }


    for(var i = 0; i < this.colors.length; i++) {
      var colorIndex = i;
      if(colorIndexes !== false) {
        colorIndex = colorIndexes[i];
      }
      data += 'FF' + this.getHexString(colorIndex) + '\n';
    }
    if(filename.indexOf('.txt') == -1) {
      filename += '.txt';
    }
    download(data, filename, "txt/plain");

  },

  saveAsHex: function(filename, map) {
    var data = '';

    var colorIndexes = false;
    if(typeof map !== 'undefined') {
      colorIndexes = this.getMapColorIndexOrder(map);
    }


    for(var i = 0; i < this.colors.length; i++) {
      var colorIndex = i;
      if(colorIndexes !== false) {
        colorIndex = colorIndexes[i];
      }

      data += this.getHexString(colorIndex) + '\n';
    }
    if(filename.indexOf('.hex') == -1) {
      filename += '.hex';
    }
    download(data, filename, "application/hex");

  },

  saveAsAco: function(filename, map) {
    var aco = new ACO();
    var data = null;
    if(typeof map !== 'undefined') {
      var colors = [];
      var colorIndexes = this.getMapColorIndexOrder(map);
      for(var i = 0; i < this.colors.length; i++) {
        var colorIndex = colorIndexes[i];
        var color = this.colors[colorIndex];
        colors.push(color);        
      }
      data = aco.writePalette(colors);
    } else {
      data = aco.writePalette(this.colors);
    }
    if(filename.indexOf('.aco') == -1) {
      filename += '.aco';
    }
    download(data, filename, "application/aco");
  },

  saveAsAse: function(filename, map) {
    var ase = new ASE();
    var data = null;

    if(typeof map !== 'undefined') {
      var colors = [];
      var colorIndexes = this.getMapColorIndexOrder(map);
      for(var i = 0; i < this.colors.length; i++) {
        var colorIndex = colorIndexes[i];
        var color = this.colors[colorIndex];
        colors.push(color);        
      }
      data = ase.writePalette(colors);
    } else {

      data = ase.writePalette(this.colors);
    }
    if(filename.indexOf('.ase') == -1) {
      filename += '.ase';
    }
    download(data, filename, "application/ase");
  }



}