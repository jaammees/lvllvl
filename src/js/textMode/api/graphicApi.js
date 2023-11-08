var GraphicAPI = {};

GraphicAPI.initAPI = function(interpreter, scope) {
  // Graphic Object
  var graphicObj = interpreter.createObjectProto(interpreter.OBJECT_PROTO);
  interpreter.setProperty(scope, 'GraphicAPI', graphicObj);

  // Graphic.getCurrentLayerDetails
  wrapper = function() {
    var result = GraphicAPI.getCurrentLayerDetails();
    return interpreter.nativeToPseudo(result);
  }
  interpreter.setProperty(graphicObj, 'getCurrentLayerDetails',
                          interpreter.createNativeFunction(wrapper, false),
                          Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getFrameCount 
  var wrapper = function(args) {
    var result = GraphicAPI.getFrameCount(interpreter.pseudoToNative(args));
    return interpreter.nativeToPseudo(result);
  }  
  interpreter.setProperty(graphicObj, 'getFrameCount', 
                  interpreter.createNativeFunction(wrapper, false),
                  Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Graphic.setFrameDuration 
  var wrapper = function(args) {
    GraphicAPI.setFrameDuration(interpreter.pseudoToNative(args));
  }  
  interpreter.setProperty(graphicObj, 'setFrameDuration', 
                  interpreter.createNativeFunction(wrapper, false),
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getWidth 
  interpreter.setProperty(graphicObj, 'getGridWidth', 
                  interpreter.createNativeFunction(GraphicAPI['getGridWidth'], false),
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getHeight 
  interpreter.setProperty(graphicObj, 'getGridHeight', 
                  interpreter.createNativeFunction(GraphicAPI['getGridHeight'], false),
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.setCell
  var wrapper = function(args) {
    GraphicAPI.setCell(interpreter.pseudoToNative(args));
  }

  interpreter.setProperty(graphicObj, 'setCell', 
                  interpreter.createNativeFunction(wrapper, false),  
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getCell
  var wrapper = function(args) {
    var result = GraphicAPI.getCell(interpreter.pseudoToNative(args));
    return interpreter.nativeToPseudo(result);
  }

  interpreter.setProperty(graphicObj, 'getCell', 
                interpreter.createNativeFunction(wrapper, false),
                Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getFrameData
  var wrapper = function(args) {
    var result = GraphicAPI.getFrameData(interpreter.pseudoToNative(args));
    return interpreter.nativeToPseudo(result);
  }

  interpreter.setProperty(graphicObj, 'getFrameData', 
                interpreter.createNativeFunction(wrapper, false),
                Interpreter.NONENUMERABLE_DESCRIPTOR);

  // Graphic.setTilePixel
  var wrapper = function(args) {
    GraphicAPI.setTilePixel(interpreter.pseudoToNative(args));
  }

  interpreter.setProperty(graphicObj, 'setTilePixel', 
                  interpreter.createNativeFunction(wrapper, false),  
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getTilePixel
  var wrapper = function(args) {
    var result = GraphicAPI.getPixel(interpreter.pseudoToNative(args));
    return interpreter.nativeToPseudo(result);
  }

  interpreter.setProperty(graphicObj, 'getTilePixel', 
                interpreter.createNativeFunction(wrapper, false),
                Interpreter.NONENUMERABLE_DESCRIPTOR);



  // Graphic.setLayerPixel
  var wrapper = function(args) {
    GraphicAPI.setLayerPixel(interpreter.pseudoToNative(args));
  }

  interpreter.setProperty(graphicObj, 'setLayerPixel', 
                  interpreter.createNativeFunction(wrapper, false),  
                  Interpreter.NONENUMERABLE_DESCRIPTOR);


  // Graphic.getTilePixel
  var wrapper = function(args) {
    var result = GraphicAPI.getLayerPixel(interpreter.pseudoToNative(args));
    return interpreter.nativeToPseudo(result);
  }

  interpreter.setProperty(graphicObj, 'getLayerPixel', 
                interpreter.createNativeFunction(wrapper, false),
                Interpreter.NONENUMERABLE_DESCRIPTOR);




}

GraphicAPI.getPreScript = function() {
  var script = '';

  script += 'var Layer = function() {}\n';
  script += 'Layer.prototype = {';
  script += '  init: function(path, layer) {';
  script += '    this.path = path;';
  script += '    this.layer = layer;';
  script += '  },';
  script += '  setCell: function(args) {';
  script += '    args.path = this.path;';
  script += '    args.layer = this.layer;';
  script += '    GraphicAPI.setCell(args);';
  script += '  },';
  script += '  getCell: function(args) {';
  script += '    args.path = this.path;';
  script += '    args.layer = this.layer;';
  script += '    return GraphicAPI.getCell(args);';
  script += '  },';
  script += '  getFrameData: function(args) {';
  script += '    var frameArgs = {};';
  script += '    if(typeof args !== "undefined" && typeof args.frame !== "undefined") {';
  script += '      frameArgs.frame = args.frame;';
  script += '    }';
  script += '    frameArgs.path = this.path;';
  script += '    frameArgs.layer = this.layer;';
  script += '    return GraphicAPI.getFrameData(frameArgs);';
  script += '  },';

  script += '  setPixel: function(args) {';
  script += '    args.path = this.path;';
  script += '    args.layer = this.layer;';
  script += '    GraphicAPI.setLayerPixel(args);';
  script += '  },';
  script += '  getPixel: function(args) {';
  script += '    args.path = this.path;';
  script += '    args.layer = this.layer;';
  script += '    return GraphicAPI.getLayerPixel(args);';
  script += '  }';
  script += '};';

  script += 'var Tileset = function() {}\n';
  script += 'Tileset.prototype = {';
  script += '  init: function(path) {';
  script += '    this.path = path;';
  script += '  },';

  script += '  setPixel: function(args) {';
  script += '    args.path = this.path;';
  script += '    GraphicAPI.setTilePixel(args);';
  script += '  },';

  script += '  getPixel: function(args) {';
  script += '    args.path = this.path;';
  script += '    return GraphicAPI.getTilePixel(args);';
  script += '  }';

  script += '};';

  script += 'var Graphic = function(args) { this.path = ""; }\n';
  script += ''

  script += 'Graphic.prototype = {';
  script += ' init: function(path) { this.path = path; },';
  script += ' getPath: function() { return this.path; },';
  script += ' getFrameCount: function() {';
  script += '   return GraphicAPI.getFrameCount({ path: this.path });';
  script += ' },';
  script += ' setFrameDuration: function(args) {';
  script += '   args.path = this.path;';
  script += '   return GraphicAPI.setFrameDuration(args);';
  script += ' },';
  script += ' getPath: function() { return this.path; },';
  script += '};';

  script += 'GraphicAPI.getGraphic = function(path) {';
  script += ' let graphic = new Graphic();';
  script += ' graphic.init({ path: path });';
  script += ' return graphic;';
  script += '};';

  script += 'GraphicAPI.getLayer = function(args) {';
  script += ' let layer = new Layer();';
  script += ' layer.init(args.path, args.layer);';
  script += ' return layer';
  script += '};';

  script += 'GraphicAPI.getTileset = function(args) {';
  script += ' let tileset = new Tileset();';
  script += ' tileset.init(args.path);';
  script += ' return tileset';
  script += '};';

  script = script.replace(";", ";\n");
  return script;
}



/* ------------------------------------------------------------------------------------- */
GraphicAPI.getCurrentLayerDetails = function() {
  var editor = g_app.textModeEditor;

  var docName = editor.doc.name;
  var docPath = '/screens/' + docName;
  var layerLabel = editor.layers.getSelectedLayerLabel();
  
  return { path: docPath, layer: layerLabel };
}

GraphicAPI.getFrameCount = function(args) {
  var editor = g_app.textModeEditor;
  return editor.graphic.getFrameCount();
}

GraphicAPI.setFrameDuration = function(args) {
  var path = '';
  var frame = args.frame;
  var duration = args.duration;

  frame = frame - 1;
  var editor = g_app.textModeEditor;
  editor.graphic.setFrameDuration(duration, frame);

  editor.frames.updateFrameDuration();
}

GraphicAPI.getWidth = function() {
  var editor = g_app.textModeEditor;
  return editor.graphic.getWidth();
}

GraphicAPI.getGridWidth = function() {
  var editor = g_app.textModeEditor;
  return editor.graphic.getGridWidth();
}

GraphicAPI.getGridHeight = function() {
  var editor = g_app.textModeEditor;
  return editor.graphic.getGridHeight();
}


/*
GraphicAPI.setCell({
  layer: 'Layer 0',
  x: 10,
  y: 12,
  t: 3,
  fc: 2
});
*/

GraphicAPI.getLayer = function(args) {
  var editor = g_app.textModeEditor;

  var path = '/screens/Untitled';

  if(typeof args.path != 'undefined') {
    path = args.path;
  }

  var layer = null;
  var layerLabel = 'Layer 0';

  var doc = g_app.doc;
  var graphicDoc = doc.getDocRecord(path);

  if(!graphicDoc) {
    return false;
  }



  var layers = graphicDoc.data.layers;
  var layerIndex = false;
  var layer = false;
  var frame = false;
  for(var i = 0; i < layers.length; i++) {
    if(layers[i].label == layerLabel) {
      layerIndex = i;
      layer = layers[i];
      return layer;
    }
  }

  return false;

}

GraphicAPI.getFrame = function(args) {
  var editor = g_app.textModeEditor;

  var path = '/screens/Untitled';

  if(typeof args.path != 'undefined') {
    path = args.path;
  }
  var frameIndex = 0;

  var layer = null;
  var layerLabel = 'Layer 0';

  if(layer === null) {
    layer = editor.layers.getSelectedLayerObject();
    if(layer.getType() != 'grid') {
      return;
    }
  }


  var doc = g_app.doc;
  var graphicDoc = doc.getDocRecord(path);

  if(!graphicDoc) {
    return false;
  }



  var layers = graphicDoc.data.layers;
  var layerIndex = false;
  var layer = false;
  var frame = false;
  for(var i = 0; i < layers.length; i++) {
    if(layers[i].label == layerLabel) {
      layerIndex = i;
      layer = layers[i];
      frame = layer.frames[frameIndex];
      break;
    }
  }

  return frame;
}

GraphicAPI.getFrameData = function(args) {

  var layer = GraphicAPI.getLayer(args);
  if(layer == false) {
    return [];
  }
  
  var frameIndex = 0;
  var frame = layer.frames[frameIndex];
  var frameData = frame.data;
  var frameHeight = frameData.length;
  var frameWidth = frameData[0].length;
  var data = [];

  var blockModeEnabled = layer.blockMode;

//  for(var y = frameHeight - 1; y >= 0; y--) {
  for(var y = 0; y < frameHeight; y++) {
    var row = [];
    for(var x = 0; x < frameWidth; x++) {
      var cell = {};
      cell.t = frameData[y][x].t;
      cell.fc = frameData[y][x].fc;
      cell.bc = frameData[y][x].bc;
      if(blockModeEnabled) {
        cell.b = frameData[y][x].b;
      }
      row.push(cell);
    }
    data.push(row);
  }

  return data;
}

GraphicAPI.getCell = function(args) {
  var editor = g_app.textModeEditor;

  var frame = GraphicAPI.getFrame(args);
  if(frame === false) {
    return false;
  }

  if(typeof args.y != 'undefined') {
// reverseY    args.y = frame.data.length - 1 - args.y;
  }


  if(frame === false) {
    return false;
  }

  if(args.y >= frame.data.length || args.x >= frame.data[args.y].length) {
    return false;
  }


  return frame.data[args.y][args.x];
}

GraphicAPI.setCell = function(args) {

  var editor = g_app.textModeEditor;

  var frame = GraphicAPI.getFrame(args);
  if(frame === false) {
    return false;
  }

  if(typeof args.y != 'undefined') {
// reverseY    args.y = frame.data.length - 1 - args.y;
  }


  if(frame === false) {
    return false;
  }

  if(args.y >= frame.data.length || args.x >= frame.data[args.y].length) {
    return false;
  }


  var cell = frame.data[args.y][args.x];
  cell.t = args.t;
  cell.fc = args.fc;
}

GraphicAPI.setTilePixel = function(args) {
//  var editor = g_app.textModeEditor;

  var path = args.path;
  var doc = g_app.doc;

  var tilesetDoc = doc.getDocRecord(path);

  var tilesetData = tilesetDoc.data.tileData;
  var width = tilesetDoc.data.width;
  var height = tilesetDoc.data.height;

  var tileData = tilesetData[args.t];

  var pos = args.y * width + args.x;
  tileData.data[0][pos] = args.p;

  this.alteredTiles.push(args.t);

} 

GraphicAPI.getTilePixel = function(args) {
  var path = args.path;
  var doc = g_app.doc;

  var tilesetDoc = doc.getDocRecord(path);

  var tilesetData = tilesetDoc.data.tileData;
  var width = tilesetDoc.data.width;

  var tileData = tilesetData[args.t];

  var pos = args.y * width + args.x;
  return tileData.data[0][pos];
}


GraphicAPI.setLayerPixel = function(args) {
  var doc = g_app.doc;

  var layer = GraphicAPI.getLayer(args);
  if(layer === false) {
    return;
  }

  var frameIndex = 0;
  var cellHeight = layer.cellHeight;
  var cellWidth = layer.cellWidth;

  var tileSetId = layer.tileSetId;

  var pixelX = args.x % cellWidth;
  var pixelY = args.y % cellHeight;

  var cellX = Math.floor(args.x / cellWidth);
  var cellY = Math.floor(args.y / cellHeight);

  var frame = layer.frames[frameIndex];

  if(frame === false) {
    return false;
  }

// reverseY  cellY = frame.data.length - 1 - cellY;
  if(cellY >= frame.data.length || cellX >= frame.data[cellY].length) {
    return false;
  }

  var cell = frame.data[cellY][cellX];

  console.log(cell);


  var tilesetDoc = doc.getDocRecordById(tileSetId, '/tile sets');
  if(!tilesetDoc) {
    return;
  }

  var tilesetData = tilesetDoc.data.tileData;
  var width = tilesetDoc.data.width;
  var height = tilesetDoc.data.height;

  var tileData = tilesetData[cell.t];

  var pos = pixelY * width + pixelX;
  tileData.data[0][pos] = args.p;

  this.alteredTiles.push(cell.t);
}

GraphicAPI.getLayerPixel = function(args) {
  var doc = g_app.doc;

  var layer = GraphicAPI.getLayer(args);
  if(layer === false) {
    return;
  }

  var frameIndex = 0;
  var cellHeight = layer.cellHeight;
  var cellWidth = layer.cellWidth;

  var tileSetId = layer.tileSetId;

  var pixelX = args.x % cellWidth;
  var pixelY = args.y % cellHeight;

  var cellX = Math.floor(args.x / cellWidth);
  var cellY = Math.floor(args.y / cellHeight);

  var frame = layer.frames[frameIndex];

  if(frame === false) {
    return false;
  }

//reverseY  cellY = frame.data.length - 1 - cellY;
  if(cellY >= frame.data.length || cellX >= frame.data[cellY].length) {
    return false;
  }

  var cell = frame.data[cellY][cellX];



  var tilesetDoc = doc.getDocRecordById(tileSetId, '/tile sets');
  if(!tilesetDoc) {
    return;
  }

  var tilesetData = tilesetDoc.data.tileData;
  var width = tilesetDoc.data.width;
  var height = tilesetDoc.data.height;

  var tileData = tilesetData[cell.t];

  var pos = pixelY * width + pixelX;
  return tileData.data[0][pos];
}

GraphicAPI.frameStart = function() {
  this.alteredTiles = [];
}

GraphicAPI.frameDone = function() {
  var editor = g_app.textModeEditor;

  // only do this if its the current tileset..
  for(var i = 0; i < this.alteredTiles.length; i++) {
    editor.tileSetManager.getCurrentTileSet().updateCharacterCurrentData(this.alteredTiles[i]);
  }
  editor.tools.drawTools.tilePalette.drawTilePalette();
  editor.sideTilePalette.drawTilePalette();

  editor.graphic.redraw({ allCells: true });

}

