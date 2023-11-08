var Grid3d = function() {
  this.editor = null;

  this.scene = null;


  this.lastCellSetX = false;
  this.lastCellSetY = false;
  this.lastCellSetZ = false;


  this.frames = [];
  this.currentFrame = false;
  this.frameCount = 0;

  this.layers = [];



  this.shapes = null;
  this.selection = null;



  this.currentLayer = null;

  this.backgroundColorIndex = 0;
  this.backgroundColorRGB = 0x333333;

  this.doc = null;

}

Grid3d.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  initScene: function() {
    this.scene = new THREE.Scene();    

    console.log('create shapes 3d');

    this.shapes = new Shapes3d();
    this.shapes.init(this.editor, this.scene);

    this.selection = new Select3d();
    this.selection.init(this.editor);

    this.initLights();
  },


  initLights: function() {
    // temporary lights..
    var light = new THREE.DirectionalLight( 0x0a0a0a, 1);

    light.position.set( -800, 400, -1500 );
    light.target.position.set( 0, 0, 0 );
    light.castShadow = false;

    /*
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
    light.shadow.bias = -0.00007;
    light.shadow.mapSize.width = SHADOW_MAP_WIDTH * 2;
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT * 2;
    light.shadow.camera.zoom = 12;
*/
    this.scene.add( light );


    var light = new THREE.AmbientLight( 0x555555 ); // soft white light
    this.scene.add( light );


    var light = new THREE.DirectionalLight( 0xffffff, 1);

    light.position.set( 1000, 1000, 1500 );
    light.target.position.set( 0, 0, 0 );
    light.castShadow = false;
/*    
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1200, 2500 ) );
    light.shadow.bias = -0.00007;
    light.shadow.mapSize.width = SHADOW_MAP_WIDTH * 2;
    light.shadow.mapSize.height = SHADOW_MAP_HEIGHT * 2;
    light.shadow.camera.zoom = 12;
*/
    this.scene.add( light );

  },

  createDoc: function(args, callback) {

    var doc = g_app.doc;
    var name = args.name;

    var gridWidth = args.gridWidth;
    var gridHeight = args.gridHeight;
    var gridDepth = args.gridDepth;
    if(typeof gridDepth == 'undefined') {
      gridDepth = 25;
    }

    var parentPath = '/3d scene';
    if(typeof args.parentPath != 'undefined') {
      parentPath = args.parentPath;  
    }

    var name = args.name;

    var id = g_app.getGuid();

    var _this = this;

    var tileSetArgs = {};
    if(typeof args.tileSetArgs != 'undefined') {
      tileSetArgs = args.tileSetArgs;
    } else if(typeof args.tileSet != 'undefined') {
      tileSetArgs.preset = args.tileSet;
    }


    if(typeof args.tileSetId != 'undefined' && args.tileSetId != '') {
      // specific tile set chosen
      tileSetArgs.tileSetId = args.tileSetId;

    }

    var colorPaletteArgs = {};
    colorPaletteArgs.preset = args.colorPalette;
    if(typeof args.colorPaletteId != 'undefined' && args.colorPaletteId != '') {
      colorPaletteArgs.colorPaletteId = args.colorPaletteId;
    }

    var screenMode = TextModeEditor.Mode.TEXTMODE;
    var cellWidth = 8;
    var cellHeight = 8;
    var cellDepth = 8;

    this.editor.colorPaletteManager.addColorPaletteToDoc(colorPaletteArgs, function(colorPaletteId) {
      _this.editor.tileSetManager.addTileSetToDoc(tileSetArgs, function(tileSetId) {


        // a layer as default

        var layerData = {
          label: "Layer 0",
          visible: true,
          opacity: 1,         
          layerId: g_app.getGuid(), 
          screenMode: screenMode,
          colorPerMode: "cell",
          cellWidth: cellWidth,
          cellHeight: cellHeight,
          cellDepth: cellDepth,
          colorPaletteId: colorPaletteId,
          tileSetId: tileSetId,
          type: "grid3d",
          gridWidth: gridWidth,
          gridHeight: gridHeight,
          gridDepth: gridDepth,
          frames: [{ data: null }] 
        };

        var graphicData = {
          id: id,
          frames: [{ duration: 12 }],
          layers: [layerData]
        }
        var record = doc.createDocRecord(parentPath, name, '3d scene', graphicData, id);

        // need to add at least one frame.
        
        if(typeof callback != 'undefined') {
          callback(record);
        }
      });
    });
  },

  connectToDoc: function() {
    var doc = this.editor.doc;


    console.log("CONNECT TO DOC");
    console.log(doc);

    if(doc.data.frames == null) {
      doc.data.frames = [];
    }

    
    if(this.doc !== null && this.doc.id === doc.id) {
      // already connected..
      console.log('already connected to doc');
      return;
    }

    this.doc = doc;
    this.frames = doc.data.frames;
    this.frameCount = this.frames.length;

    if(this.scene == null) {
      this.initScene();
    }

    // remove previous layers
    if(this.layers.length != 0) {
      for(var i = 0; i < this.layers.length; i++) {
        this.layers[i].remove();
      }
    }

    this.layers = [];

    if(this.layers.length == 0) {
      var layers = this.doc.data.layers;
      for(var i = 0; i < layers.length; i++) {
        var layer = new Grid3dLayer();
        layer.init(this.editor, layers[i].layerId, this.scene);
        this.layers.push(layer);
      }
    }

    this.setCurrentLayer(this.layers[0]);

    this.currentFrame = false;
    if(this.frameCount == 0) {
      this.setFrameCount(1);
    }

    this.setCurrentFrame(0);
//    this.initFrame();
    
  },

  setCurrentLayer: function(layer) {
    console.error('grid3d: set current layer!');
    this.currentLayer = layer;

    // set tileset as the current tileset
    // make sure the tile geometry exists
    var tileSet = this.currentLayer.getTileSet();
    if(tileSet) {
      this.editor.tileSetManager.setCurrentTileSetFromId(tileSet.getId());
      tileSet.generate3dGeometries();
    }

    // set colour palette as current color palette
    var colorPalette = this.getColorPalette();
    if(colorPalette) {
      this.editor.colorPaletteManager.setCurrentColorPaletteFromId(colorPalette.getId());
    }

    // update tile menu
    this.editor.tileSetManager.updateTileSetMenu();
    this.editor.colorPaletteManager.updateColorPaletteMenu();

    this.editor.setInterfaceScreenMode(this.getScreenMode());

    this.editor.setInterfaceColorPerMode(this.getColorPerMode());
    this.currentLayer.createGrid();

  },


  setBackgroundColor: function(color) {
    this.backgroundColorIndex = color;

    var colorPalette = this.getColorPalette();
    this.backgroundColorRGB = colorPalette.getHex(color);

    var backgroundColorHexString = '#' + colorPalette.getHexString(color);

    $('#background3dColor').css('background-color', backgroundColorHexString);
  },

  getBackgroundColorRGB: function() {
    return this.backgroundColorRGB;
  },


  /*

  createGrid: function() {


    var scene = this.scene;

    var charWidth = 8;
    var charHeight = 8;
    var charDepth = 8;

    this.cellSizeX = charWidth * 1 * this.pixelTo3dUnits;
    this.cellSizeY = charHeight * 1 * this.pixelTo3dUnits;
    this.cellSizeZ = charDepth * 1 * this.pixelTo3dUnits;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(tileSet) {
      charWidth = tileSet.charWidth;
      charHeight = tileSet.charHeight;
      charDepth = tileSet.charDepth;
      this.cellSizeX = charWidth * tileSet.pixelWidth * this.pixelTo3dUnits;
      this.cellSizeY = charHeight * tileSet.pixelHeight * this.pixelTo3dUnits;
      this.cellSizeZ = charDepth * tileSet.pixelDepth * this.pixelTo3dUnits;

    }


    this.planes = [];

    if(this.xyMesh) {
      scene.remove(this.xyMesh);
      this.xyMesh = null;
    }

    if(this.xzMesh) {
      scene.remove(this.xzMesh);
      this.xzMesh = null; 
    }

    if(this.zyMesh) {
      scene.remove(this.zyMesh);
      this.zyMesh = null;
    }

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    var gridDepth = this.getGridDepth();


    // x/y grid

//    if(this.xyLineMaterial == null) {
      this.xyLineMaterial = new THREE.LineBasicMaterial({
        color: 0x353535,
        transparent: false,
        opacity: 0.5
      });
//    }

    this.xzLineMaterial = new THREE.LineBasicMaterial({
      color: 0x353535,
      transparent: false,
      opacity: 0.5
    });


    this.xyMesh = new THREE.Object3D();
    this.xyGrid = new THREE.Object3D();
    this.xyMesh.add(this.xyGrid);
    scene.add(this.xyMesh);


    // vertical lines
    for(var i = 0; i <= gridWidth; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, gridHeight * this.cellSizeY, 0)// gridDepth * this.cellSizeZ )
      );

      var line = new THREE.Line( geometry, this.xyLineMaterial );
      this.xyGrid.add( line );    
    }

    // horizontal lines
    for(var i = 0; i <= gridHeight; i++) {
      var geometry = new THREE.Geometry();
    
      geometry.vertices.push(      
        new THREE.Vector3( 0, i * this.cellSizeY, 0 ),
        new THREE.Vector3( gridWidth * this.cellSizeX, i * this.cellSizeY, 0 )
      );

      var line = new THREE.Line( geometry, this.xyLineMaterial );
      this.xyGrid.add( line );


    }


    // xy grid backing plane
    var geometry = new THREE.PlaneGeometry(gridWidth * this.cellSizeX, gridHeight * this.cellSizeY);
    this.xyGridBackingMaterial = new THREE.MeshBasicMaterial({ 
      color: this.backingMaterialColor, 
      transparent: true, 
      opacity: this.backingMaterialOpacity, 
      side: THREE.DoubleSide 
    });
    this.xyGridBacking = new THREE.Mesh(geometry, this.xyGridBackingMaterial);
    this.xyGridBacking.position.z = -0.05;
    this.xyGridBacking.position.x = (gridWidth * this.cellSizeX) / 2;
    this.xyGridBacking.position.y = (gridHeight * this.cellSizeY) / 2;
    this.xyGridBacking.gridPlane = 'xy';
    this.xyMesh.add(this.xyGridBacking);

    this.planes.push(this.xyGridBacking);


    // x/z grid
    this.xzMesh = new THREE.Object3D();
    this.xzGrid = new THREE.Object3D();
    this.xzMesh.add(this.xzGrid);
    scene.add(this.xzMesh);

    for(var i = 0; i <= gridWidth; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, 0, gridDepth * this.cellSizeZ )
      );

      var line = new THREE.Line( geometry, this.xzLineMaterial );
      this.xzGrid.add( line );    
    }

    for(var i = 0; i <= gridDepth; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( 0, 0, i * this.cellSizeZ),
        new THREE.Vector3( gridWidth  * this.cellSizeX , 0, i * this.cellSizeZ)
      );

      var line = new THREE.Line( geometry, this.xzLineMaterial );
      this.xzGrid.add( line );
    }

    var geometry = new THREE.PlaneGeometry(gridWidth * this.cellSizeX, gridDepth * this.cellSizeZ);
    this.xzGridBackingMaterial = new THREE.MeshBasicMaterial({ 
      color: this.backingMaterialColor, 
      transparent: true, 
      opacity: this.backingMaterialOpacity, 
      side: THREE.DoubleSide });
    this.xzGridBacking = new THREE.Mesh(geometry, this.xzGridBackingMaterial);

    this.xzGridBacking.rotation.x = -Math.PI / 2;
    this.xzGridBacking.position.y = -0.1;
    this.xzGridBacking.position.x = (gridWidth * this.cellSizeX) / 2;
    this.xzGridBacking.position.z = (gridDepth * this.cellSizeZ) / 2;

    this.xzGridBacking.gridPlane = 'xz';
    this.xzMesh.add(this.xzGridBacking);
    this.planes.push(this.xzGridBacking);

    // floor
    if(this.floor) {
      scene.remove(this.floor);
      this.floor = null;
    }

    var geometry = new THREE.PlaneGeometry(gridWidth * this.cellSizeX, gridDepth * this.cellSizeZ);
    material = new THREE.MeshPhongMaterial({ color: 0x222222,  emissive: 0, 
      specular: 0, shininess: 0, 
      transparent: false, opacity: 1});
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.1;
    this.floor.position.x = (this.width * this.cellSizeX) / 2;
    this.floor.position.z = (this.depth * this.cellSizeZ) / 2;

    scene.add(this.floor);
    this.floor.receiveShadow = true;


    this.setXYPosition(Math.floor(gridDepth / 2));
    this.setXZPosition(0);
  },
*/

  setGridVisible: function(visible) {
    this.currentLayer.setGridVisible(visible);
  },

  getGridVisible: function() {
    return this.currentLayer.getGridVisible();
  },

  getXYGridVisible: function() {
    return this.currentLayer.getXYGridVisible();
  },

  getXZGridVisible: function() {
    return this.currentLayer.getXZGridVisible();
  },

  setXYGridVisible: function(visible) {
    this.currentLayer.setXYGridVisible(visible);
  },

  setXZGridVisible: function(visible) {
    this.currentLayer.setXZGridVisible(visible);
  },

  toggleGrid: function() {
    this.currentLayer.toggleGrid();


  },

  getXZPosition: function() {
    return this.currentLayer.xzPosition;
  },

  setXZPosition: function(position) {
    this.currentLayer.setXZPosition(position);
  },


  getXYPosition: function() {
    return this.currentLayer.getXYPosition();
  },

  setXYPosition: function(position) {
    this.currentLayer.setXYPosition(position);
  },

  showOnlyXY: function(args) {
    this.currentLayer.showOnlyXY(args);

  },

  showOnlyXZ: function() {
    this.currentLayer.showOnlyXZ();
  },

  showAll: function(show) {
    this.currentLayer.showAll(show);
  },

  // maybe some of these should be grid3d, not grid3dLayer

  setTypingCursorMeshVisible: function(visible) {
    if(this.currentLayer != null && this.currentLayer.typingCursorMesh !== null) {
      this.currentLayer.typingCursorMesh.visible = visible;
    }
  },

  setTypingCursorPosition: function(x, y, z) {
    this.currentLayer.setTypingCursorPosition(x, y, z);
  },


  setCursorRotation: function(rotX, rotY, rotZ) {
    this.currentLayer.setCursorRotation(rotX, rotY, rotZ);
  },

  setCursorPosition: function(x, y, z) {
    this.currentLayer.setCursorPosition(x, y, z);
  },

  setCursorEnabled: function(enabled) {
    this.currentLayer.setCursorEnabled(enabled);
  },

  getCursorX: function() {
    return this.currentLayer.getCursorX();
  },

  getCursorY: function() {
    return this.currentLayer.getCursorY();

  },

  getCursorZ: function() {
    return this.currentLayer.getCursorZ();
  },

  getCursorEnabled: function() {
    if(this.currentLayer != null) {
      return this.currentLayer.getCursorEnabled();
    }

    return false;
  },

  setCursorColor: function(colorIndex) {
    this.currentLayer.setCursorColor(colorIndex);
  },

  setCursorTile: function(tileIndex) {
    if(this.currentLayer != null) {
      this.currentLayer.setCursorTile(tileIndex);
    }
  },

  getCell: function(x, y, z, f) {
    return this.currentLayer.getCell(x, y, z, f);
  },

  getCellMesh: function(x, y, z, f) {
    return this.currentLayer.getCellMesh(x, y, z, f);
  },

  setCellFromCursor: function() {
    this.currentLayer.setCellFromCursor();
  },

  getColorPerMode: function() {
    return 'cell';
  },

  getScreenMode: function() {
    return this.currentLayer.getScreenMode();
  },

  getTileSetId: function() {
    return this.currentLayer.getTileSetId();
  },


  setTileSet: function(tileSetId) {
    return this.currentLayer.setTileSet(tileSetId);
  },

  
  getTileSet: function() {
    return this.currentLayer.getTileSet();
  },


  setColorPalette: function(colorPaletteId) {
    return this.currentLayer.setColorPalette(colorPaletteId);
  },

  getColorPalette: function() {
    return this.currentLayer.getColorPalette();
  },
    
  getScene: function() {
    return this.scene;
  },

  getHolder: function() {
    return this.currentLayer.getHolder();
  },  

  getCellSizeX: function() {
    return this.currentLayer.cellSizeX;
  },
  getCellSizeY: function() {
    return this.currentLayer.cellSizeY;

  },
  getCellSizeZ: function() {
    return this.currentLayer.cellSizeZ;

  },


  getGridWidth: function() {
    return this.currentLayer.getGridWidth();
  },

  getGridHeight: function() {
    return this.currentLayer.getGridHeight();
  },

  getGridDepth: function() {
    return this.currentLayer.getGridDepth();
  },

  clearFrame: function(frame) {
    this.currentLayer.clearFrame(frame);

  },

  getFrameCount: function() {
    return this.frameCount;
  },

  getFrameDuration: function(frame) {
    return this.frames[frame].duration;
  },

  setFrameDuration: function(duration, frame) {
    var theFrame = this.currentFrame;

    if(typeof frame !== 'undefined') {
      theFrame = frame;
    }

    if(theFrame < 0 || theFrame >= this.frameCount) {
      return;
    }

    this.frames[theFrame].duration = duration;
  },

  getCurrentLayer: function() {
    return this.currentLayer;
  },


  getCurrentFrame: function() {
    return this.currentFrame;
  },


  setCurrentFrame: function(frameIndex) {
    if(frameIndex === this.currentFrame) {
      return;
    }


    if(frameIndex > this.frameCount || frameIndex < 0) {
      //console.log('not within frame count');
      return false;
    }

    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].setCurrentFrame(frameIndex);
    }
    this.currentFrame = frameIndex;
  },  

  insertFrame: function(frame, duration, frameData, layerFrameData) {

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }
    if(typeof duration == 'undefined') {
      duration = this.frames[this.currentFrame].duration;
    }

    var frameObject = frameData;

    if(typeof frameObject == 'undefined') {
      frameObject = {
        duration: duration
      };
    }

    this.frames.splice(frame + 1, 0, frameObject);

    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].insertFrame(frame, duration);
    }

  
    this.frameCount++;

    this.editor.history.startEntry('insertframe');
    this.editor.history.addAction('insertframe', { position: frame });
    this.editor.history.endEntry();

    return frame + 1;
  },


  deleteFrame: function(frame) {

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frameCount <= 1) {
      return false;
    }



    var frameData = this.frames.splice(frame, 1);

    var layerFrameData = [];
    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].deleteFrame(frame);
    }

/*
    var layers = this.editor.layers.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].type == 'grid') {
        var layerGrid = this.editor.layers.getLayerObject(layers[i].layerId);
        var gridData = layerGrid.getFrameData(frame);


        layerFrameData.push({ layerId: layers[i].layerId, gridData: gridData });
        layerGrid.deleteFrame(frame);
      }
    }
*/



    var newFrameCount = this.frameCount - 1;
    this.setFrameCount(newFrameCount);

    
//    this.editor.history.startEntry('deleteframe');
//    this.editor.history.addAction('deleteframe', { position: frame, frameData: frameData[0], layerFrameData: layerFrameData });
//    this.editor.history.endEntry();

    return true;
  },


  duplicateFrame: function(frame) {
    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    var newFrame = frame+1;

    this.editor.history.startEntry('Duplicate3d');
    this.editor.history.setNewEntryEnabled(false);

    this.insertFrame(frame);
    this.setCurrentFrame(newFrame);

    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].duplicateFrame(frame,newFrame);
    }

    this.editor.history.setNewEntryEnabled(true);

    this.editor.history.endEntry();
    this.editor.grid.update();

    return newFrame;
  },

  setFrameCount: function(frameCount) {

    while(frameCount > this.frames.length) {
      this.frames.push({ duration: 12 });
    }

    if(frameCount < this.frameCount) {
      this.frames.length = frameCount;
    }


    for(var i = 0; i < this.layers.length; i++) {
      this.layers[i].setFrameCount(frameCount);
    }
    this.frameCount = frameCount;

  },

  setCell: function(args) {
    this.currentLayer.setCell(args);    
  },

  update: function() {
    var time = getTimestamp();

    var tool = this.editor.tools.drawTools.tool;
    /*
    if(tool == 'type') {
      if(time - this.lastTypingBlink > 700) {

        this.lastTypingBlink = time;

        if(this.typingCursorMesh != null) {
          this.typingCursorMesh.visible = !this.typingCursorMesh.visible;
        }
      }
    }
    */
  }

}
