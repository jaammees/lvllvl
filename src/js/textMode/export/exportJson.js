var ExportJson = function() {
  this.editor = null;
  this.jsonType = 'native';
}


ExportJson.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportJsonDialog", "title": "Export JSON", "width": 336, "height": 348 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportJson.html', function() {

        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportJson();
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

    UI.showDialog("exportJsonDialog");
  },  

  initContent: function() {


    this.colorPerMode = this.editor.getColorPerMode();
    this.blockModeEnabled = this.editor.getBlockModeEnabled();

    $('#exportJSONAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();

console.log('frame count = ' + frameCount);
//    $('#exportJSONToFrame').val(frameCount);
//    $('#exportJSONFromFrame').val(1);

//    $('#exportJSONFromFrame').attr('max', frameCount);
//    $('#exportJSONToFrame').attr('max', frameCount);

    $('#exportJsonToFrame').val(frameCount);
    $('#exportJsonFromFrame').val(1);

    $('#exportJsonToFrame').attr('max', frameCount);
    $('#exportJsonFromFrame').attr('max', frameCount);

//    $('#exportJsonFromFrame').attr('max', this.editor.frames.frameCount);
//    

  },

  initEvents: function() {
    var _this = this;

    $('#exportJsonType').on('change', function() {
      _this.setJsonType($(this).val());
    });
  },


  setJsonType: function(type) {
    this.jsonType = type;
    if(type == 'native') {
      $('.exportJsonNativeSettings').show();
      $('.exportJsonTiledSettings').hide();

    }

    if(type == 'tiled') {
      $('.exportJsonNativeSettings').hide();
      $('.exportJsonTiledSettings').show();
    }

  },

/*
  getMapJSON: function(fromFrame, toFrame) {
    var frames = this.editor.frames.frames;
    var value = [];
    var layers = this.editor.layers.getLayers();


    for(var i = fromFrame - 1; i < toFrame; i++) {    
      if(i < frames.length) {
        var frameData = [];
        var frame = [];
        var data = frames[i].data;

        var exclude = [
        ];

        if(this.editor.getScreenMode() !== 'multicolor') {
          exclude.push('fh');
          exclude.push('fv');
          exclude.push('rz');
        } else {
          exclude.push('fc');
          exclude.push('bc');
        }

        var colorPerMode = this.editor.getColorPerMode();
        if(colorPerMode == 'character' || colorPerMode == 'block') {
          exclude.push('fc');
          exclude.push('bc');

        } 


//        for(var z = 0; z < data.length; z++) {
        for(var layerIndex = 0; layerIndex < layers.length; layerIndex++) {  
          if(layers[layerIndex].type == 'grid') {
            var z = layers[layerIndex].gridZ;

            var yStart = 0;
            var yEnd = data[z].length;
            var yIncrement = 1;
            if(args.direction == 'bottomtotop') {
              yStart = data[z].length - 1;
              yEnd = -1;
              yIncrement = -1;
            }


            var frameData = [];
            for(var y = yStart; y != yEnd; y += yIncrement) {
              frameData[y] = [];
              for(var x = 0; x < data[z][y].length; x++) {
                var cell = {};
                for(var key in data[z][y][x]) {
                  if(!exclude.includes(key)) {
                    var dstKey = key;
                    if(key == 'c') {
                      dstKey = 't';
                    }
                    cell[dstKey] = data[z][y][x][key];
                  }
                }
                frameData[y][x] = cell;
              }
            }
            frame.push({ 'layer': layers[layerIndex].label, 'data': frameData });
          }
        }

        value.push(frame);
      }
    }

    return value;

  },
*/
  exportTiledJsonAs: function(args) {
    var filename = 'Untitled';
    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var exportFrame = this.editor.graphic.getCurrentFrame();

    /*
    var frames = this.editor.frames;
    var currentFrame = frames.getCurrentFrame();
    */
    var layers = this.editor.layers.getLayers();
    var includeTiles = args.includeTiles;

    var tiles = [];
    var tileMap = {};
    var tileCount = tileSet.tileCount;


    if(includeTiles == 'all') {
      var noColor = this.editor.colorPaletteManager.noColor;
      var color = this.editor.currentTile.getColor();


      for(var i = 0; i < tileCount; i++) {
        var key = i + '-' + color + '-' + noColor;
        tileMap[key] = tiles.length;
        tiles.push({
          tileIndex: i,
          fc: color,
          bc: noColor
        });
      }
    }


    var graphicGridWidth = this.editor.graphic.getGridWidth();
    var graphicGridHeight = this.editor.graphic.getGridHeight();

    // find which tiles used.
    for(var layerIndex = 0; layerIndex < layers.length; layerIndex++) {  
      if(layers[layerIndex].type == 'grid') {
//        var z = layers[layerIndex].gridZ;
        var layer = this.editor.layers.getLayerObject(layers[layerIndex].layerId);
        var gridWidth = layer.getGridWidth()
        var gridHeight = layer.getGridHeight();

        var yStart = 0;
        var yEnd = gridHeight;
        var yIncrement = 1;

        yStart = gridHeight - 1;
        yEnd = -1;
        yIncrement = -1;

        var xStart = 0;
        var xEnd = gridWidth;
        var xIncrement = 1;

        for(var y = yStart; y != yEnd; y += yIncrement) {
          for(var x = xStart; x != xEnd; x += xIncrement) {
            var cellData = layer.getCell({ x: x, y: y, frame: exportFrame });
            var key = cellData.t + '-' + cellData.fc + '-' + cellData.bc;
            if(!tileMap.hasOwnProperty(key)) {
              tileMap[key] = tiles.length;
              tiles.push({
                tileIndex: cellData.t,
                fc: cellData.fc,
                bc: cellData.bc
              });            
            }
          }
        }
      }
    }


    var tileImageMap = [];
    var tileMapWidth = 16;
    var tileMapHeight = Math.ceil(tiles.length / 16);
    var tileIndex = 0;

    for(var y = 0; y < tileMapHeight; y++) {
      tileImageMap.push([]);

      for(var x = 0; x < tileMapWidth; x++) {
        if(tileIndex < tiles.length) {
          tileImageMap[y].push({
            c: tiles[tileIndex].tileIndex,
            fc: tiles[tileIndex].fc,
            bc: tiles[tileIndex].bc

          });
          tileIndex++;
        } else {
          tileImageMap[y].push({
            c: -1,
            fc: -1,
            bc: -1
          }); 
        }
      }
    }
    var tilePng = tileSet.exportPngFromMap({ map: tileImageMap});



    var data = {
      "tiledversion":"1.2.0",
      "type":"map",
      "version":1.2,
      "width": graphicGridWidth,
      "height": graphicGridHeight,
      "renderorder":"right-down",
      "infinite": false,
      "orientation": "orthogonal",
      "tilewidth": tileSet.getTileWidth(),
      "tileheight": tileSet.getTileHeight(),
      /*
      "tilesets":[
        {
          "firstgid":1,
          "source":"test.tsx"
        }],      
      */
     
     "tilesets":[
      {
        "columns": tileMapWidth,
        "firstgid":1,
        "image":"tiles.png",
        "imageheight": tileMapHeight * tileSet.getTileHeight(),
        "imagewidth": tileMapWidth * tileSet.getTileWidth(),
        "margin":0,
        "name":"tile set",
        "spacing":0,
        "tilecount": tiles.length,
        "tileheight":tileSet.getTileWidth(),
        "tilewidth":tileSet.getTileHeight()
      }],
    
    };

    var map = [];
    var layerId = 0;

    for(var layerIndex = 0; layerIndex < layers.length; layerIndex++) {  
      if(layers[layerIndex].type == 'grid') {

        var layer = this.editor.layers.getLayerObject(layers[layerIndex].layerId);
        var gridWidth = layer.getGridWidth();
        var gridHeight = layer.getGridHeight();

        layerId++;  

        var yStart = 0;
        var yEnd = gridHeight;
        var yIncrement = 1;
        if(true) {//args.direction == 'bottomtotop') {
          yStart = gridHeight - 1;
          yEnd = -1;
          yIncrement = -1;
        }

        var xStart = 0;
        var xEnd = gridWidth;
        var xIncrement = 1;
        if(false) {
          xStart = xEnd - 1;
          xEnd = -1;
          xIncrement = -1;
        }


        var layerTileData = [];

        for(var y = yStart; y != yEnd; y += yIncrement) {
          for(var x = xStart; x != xEnd; x += xIncrement) {

            var cellData = layer.getCell({ x: x, y: y, frame: exportFrame });
            var key = cellData.t + '-' + cellData.fc + '-' + cellData.bc;            

            console.log('key = ' + key);
            var index = tileMap[key];

            console.log('index = ' + index);
            layerTileData.push(index + 1);
          }
        }

        map.push({
          "id": layerId,
          "width": gridWidth,
          "height": gridHeight,
          "name": layers[layerIndex].label,
          "opacity": layers[layerIndex].opacity,
          "type": 'tilelayer',
          "visible": true,
          "data": layerTileData,
          x: 0,
          y: 0
        });

      }
    }
    data.layers = map;
    data.nextlayerid = layerId + 1;    
    data.nextobjectid = 1;



    var jsonString = JSON.stringify(data);    


//    download(jsonString, filename, "application/json");

    var zip = new JSZip();
    zip.file(filename + ".json", jsonString);
    zip.file("tiles.png", tilePng);

    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
    });    

  },


  exportJsonAs: function(args) {

    console.log('args = ');
    console.log(args);

    var filename = 'Untitled';
    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var format = 'json';
    if(typeof args.format != 'undefined') {
      format = args.format;
    }



    var direction = 'toptobottom';
    if(typeof args.direction != 'undefined') {
      direction = args.direction;
    }

    var currentFrame = this.editor.graphic.getCurrentFrame();


    var fromFrame = currentFrame;
    if(typeof args.fromFrame != 'undefined') {
      fromFrame = args.fromFrame;
    }
    var toFrame = currentFrame;
    if(typeof args.toFrame != 'undefined') {
      toFrame = args.toFrame;
    }


    var json = {};
    json.version = 1;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(args.exportTileSet) {
      json.tileSet = tileSet.getJSON();
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    if(args.exportColorPalette) {
      json.colorPalette = colorPalette.getJSON();
    }

    if(args.exportMap) {
//      json.tileMap = this.getMapJSON(fromFrame, toFrame);
      if(fromFrame >= 0) {
        fromFrame--;
      }
      if(toFrame < this.editor.graphic.getFrameCount() ) {
        //toFrame--;
      }

      json.tileMap = this.editor.graphic.getJSON({
        fromFrame: fromFrame,
        toFrame: toFrame
      });
    }

    if(filename.indexOf('.json') == -1) {
      filename += ".json";
    }

    var jsonString = JSON.stringify(json);    
    download(jsonString, filename, "application/json");    

  },

  exportJson: function() {
    var args = {};
    
    args.filename = $('#exportJsonAs').val(); 
    args.type = $('#exportJsonType').val();
    args.format = $('input[name=exportJSONFormat]:checked').val();
//    args.variableName = $('#exportJsonAsVariableName').val(); 
    args.direction = $('input[name=exportJsonDirection]:checked').val();

    args.exportMap = $('#exportJSONMapData').is(':checked');
    args.exportTileSet = $('#exportJSONTilesetData').is(':checked');
    args.exportColorPalette = $('#exportJSONColorPaletteData').is(':checked');

    args.includeTiles = $('input[name=exportJsonTiles]:checked').val();

    args.fromFrame = parseInt($('#exportJsonFromFrame').val(), 10);
    args.toFrame = parseInt($('#exportJsonToFrame').val(), 10);


    if(args.type == 'native') {
      this.exportJsonAs(args);
    } else {
      this.exportTiledJsonAs(args);
    }
  }  
}