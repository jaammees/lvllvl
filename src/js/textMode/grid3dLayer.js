
function disposeArray() {
  this.array = null;
}

var Grid3dLayer = function() {
  this.editor = null;
  this.layerId = '';
  this.scene = null;

  this.pixelTo3dUnits = 0.25;
  this.pixelSizeX = 1;
  this.pixelSizeY = 1;
  this.pixelSizeZ = 1;

  this.cellSizeX = 1;
  this.cellSizeY = 1;
  this.cellSizeZ = 1;

  this.xyMesh = null;
  this.xzMesh = null;
  this.zyMesh = null;
  this.xyLineMaterial = null;

  this.cursorMesh = null;
  this.cursorMeshMaterial = null;

  this.typingCursorMesh = null;
  this.typingCursorMeshMaterial = null;
  this.lastTypingBlink = 0;

  this.cursorX = 0;
  this.cursorY = 0;
  this.cursorZ = 0;
  this.cursorRotX = 0;
  this.cursorRotY = 0;
  this.cursorRotZ = 0;
  this.cursorColor = 0;
  this.cursorTileIndex = false;
  this.cursorEnabled = true;

  this.cubeMesh = null;

  this.floor = null;


  this.frames = [];
  this.meshFrames = [];
  this.currentFrame = false;
  this.frameCount = 0;


  // is the grid data currently changing..
  this.changingGridData = false;

//  this.shapes = null;
  this.selection = null;

  // the grid data
  this.gridData = [];

  this.gridMeshes = [];
  this.holder = null;

  this.backingMaterialColor = 0xffffff;
  this.backingMaterialOpacity = 0.5;

}

Grid3dLayer.prototype = {
  init: function(editor, layerId, scene) {
    this.editor = editor;
    this.scene = scene;
    this.layerId = layerId;


    this.connectToDoc({
      layerId: layerId
    });
  },

  removeAllTileMeshes: function(frame) {
    var holder = this.meshFrames[frame].holder;
    while(holder.children.length > 0) {
      var mesh = holder.children[0];
      while(mesh.children.length > 0) {
        mesh.remove(mesh.children[0]);
      }
      holder.remove(mesh);
    }

    var meshData = this.meshFrames[frame].data;

    for(var z = 0; z < meshData.length; z++) {
      for(var y = 0; y < meshData[z].length; y++) {
        for(var x = 0; x < meshData[z][y].length; x++) {
          if(meshData[z][y][x].mesh) {
            meshData[z][y][x].mesh.box = null;
            meshData[z][y][x].mesh = null;
          }
//          meshData[z][y][x] = null;
        }
      }
    }  
  },

  remove: function() {

    // Because geometries get cached inside the renderer, 
    // you should always call geometry.dispose() if you delete/free an instance of Geometry or BufferGeometry.
    
    console.log("REMOVE LAYER!!!");
    // need to destroy geometry and materials
    this.xyMesh.remove(this.xyGrid);
    this.scene.remove(this.xyMesh);

    this.xyGrid = null;
    this.xyMesh = null;

    this.xzMesh.remove(this.xzGrid);
    this.scene.remove(this.xzMesh);

    for(var i = 0; i < this.meshFrames.length; i++) {

      this.removeAllTileMeshes(i);

      this.scene.remove(holder);
      
      this.meshFrames[i].holder = null;
    }

  },
    
  // find the layer's data in the doc..
  connectToDoc: function(args) {

    // dont need to connect if already connected..
    console.log("CONNECT TO DOC!!!!!!!!!!!");
    var doc = null;

    if(typeof args != 'undefined') {
      if(typeof args.doc != 'undefined') {
        doc = args.doc;
      }
      if(typeof args.layerId != 'undefined') {
        this.layerId = args.layerId;
      }
      if(typeof args.editor != 'undefined') {
        this.editor = args.editor;
      }
    }
    
    if(doc == null) {
      doc = this.editor.doc;
    }

    var layers = doc.data.layers;
    for(var i = 0; i < layers.length; i++) {
      if(layers[i].layerId == this.layerId) {

        // create frames if they dont exist
        if(typeof layers[i].frames == 'undefined') {
          layers[i].frames = [];
        }
        //need frames with meshes and frames with doc data
        this.frames = layers[i].frames;

        // mesh frames needs to be stored in layer
        this.meshFrames = [];

        // if there are already frames, need to create the meshes..
        this.createMeshFrames();

        // this.doc just points to this layer
        this.doc = layers[i];
        this.frameCount = this.frames.length;

        // defaults
        if(typeof this.doc.colorPerMode == 'undefined') {
          this.doc.colorPerMode = 'cell';
        }

        if(typeof this.doc.screenMode == 'undefined') {
          this.doc.screenMode = TextModeEditor.Mode.TEXTMODE;
        }

      }
    }

    // create the meshes from the grid data.
    this.createMeshes();
  },


  // create meshes from the grid data
  createMeshes: function() {

    var charWidth = 8;
    var charHeight = 8;
    var charDepth = 8;

    this.cellSizeX = charWidth * 1 * this.pixelTo3dUnits;
    this.cellSizeY = charHeight * 1 * this.pixelTo3dUnits;
    this.cellSizeZ = charDepth * 1 * this.pixelTo3dUnits;
        
    var tileSet = this.getTileSet();
    var colorPalette = this.getColorPalette();

    for(var i = 0; i < this.frames.length; i++) {

      var gridData = this.frames[i].data;

      if(this.meshFrames[i].data == null) {
        this.initMeshFrameData(i);
      }

      this.gridMeshes = this.meshFrames[i].data;
      var holder = this.meshFrames[i].holder;

      var gridWidth = this.getGridWidth();
      var gridHeight = this.getGridHeight();
      var gridDepth = this.getGridDepth();
  
      var cell = {};

      //var key = x + ',' + y + ',' + z;

      for(var key in gridData) {
        var cellExists = gridData.hasOwnProperty(key);
        if(cellExists) {
          cell = gridData[key];
          var x = cell.x;
          var y = cell.y;
          var z = cell.z;
          var t = cell.t;



          if(x < 0 || x >= gridWidth
             || y < 0 || y >= gridHeight
             || z < 0 || z >= gridDepth) {
              continue;
          }

          var cellMesh = null;

          
          cellMesh = this.gridMeshes[z][y][x];

          // remove mesh for current cell if it exists
          if(cellMesh && typeof cellMesh.mesh != 'undefined' && cellMesh.mesh != null) {

            while(cellMesh.mesh.children.length > 0) {
              cellMesh.remove(cellMesh.mesh.children[0]);
            }
            this.holder.remove(cellMesh.mesh);
            if(cellMesh.mesh.box) {
              cellMesh.mesh.box = null;
            }
            cellMesh.mesh = null;
          }


          if(cell.t == this.editor.tileSetManager.noTile) {
            // erasing the cell
          } else {

            var mesh = null;

            if(cell.bc == this.editor.colorPaletteManager.noColor && cell.bc !== false) {
              var geometry = tileSet.getGeometry(cell.t);
              var material = colorPalette.getMaterial(cell.fc);

              if(typeof geometry == 'undefined') {
                console.log('no geometry!!!!');
                continue;
              }
              mesh = new THREE.Mesh(geometry, material );//this.materials[color]);
            } else {
              var geometry = tileSet.getGeometry(cell.t);
              var bgGeometry = tileSet.getBackgroundGeometry(cell.t);
              var material = colorPalette.getMaterial(cell.fc);
              var bgMaterial = colorPalette.getMaterial(cell.bc);

              if(typeof geometry == 'undefined' || typeof bgGeometry == 'undefined') {
                console.log('no geometry!!!!');
                continue;
              }

              mesh = new THREE.Mesh(bgGeometry, bgMaterial);
              fgMesh = new THREE.Mesh(geometry, material);
              mesh.add(fgMesh);
            }


            var meshX = x * this.cellSizeX + this.cellSizeX / 2;
            var meshY = y * this.cellSizeY + this.cellSizeY / 2;
            var meshZ = z * this.cellSizeZ + this.cellSizeZ / 2;
                
            mesh.rotation.order = 'YXZ';
            mesh.rotation.x = cell.rx * Math.PI * 2;// + Math.PI / 2;
            mesh.rotation.y = cell.ry * Math.PI * 2;
            mesh.rotation.z = cell.rz * Math.PI * 2;

            mesh.position.x = meshX;//x * this.cellSize + this.cellSize / 2;
            mesh.position.y = meshY;//y * this.cellSize + this.cellSize / 2;
            mesh.position.z = meshZ;//z * this.cellSize + this.cellSize / 2;

            // need to retain the original position for when moving selection
            mesh.originalPosition = {};
            mesh.originalPosition.x = meshX;
            mesh.originalPosition.y = meshY;
            mesh.originalPosition.z = meshZ;

            mesh.gridX = x;
            mesh.gridY = y;
            mesh.gridZ = z;

            mesh.box = new THREE.Box3(new THREE.Vector3(meshX - this.cellSizeX / 2, 
                                                        meshY - this.cellSizeY / 2, 
                                                        meshZ - this.cellSizeZ / 2),
                                      new THREE.Vector3(meshX + this.cellSizeX / 2, 
                                                        meshY + this.cellSizeY / 2, 
                                                        meshZ + this.cellSizeZ / 2));

            mesh.box.gridPosition = new THREE.Vector3(x, y, z);

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //      mesh.castShadow = true;
            //      mesh.receiveShadow = true;

            cellMesh.mesh = mesh;
            holder.add(mesh);
          }
        }
      }
    }

  },

  createMeshFrames: function() {
    this.meshFrames = [];

    for(var i = 0; i < this.frames.length; i++) {
      var holder = new THREE.Object3D();
      holder.visible = false;
      this.meshFrames.push({ data: null, holder: holder });
    }

  },




  getCellMesh: function(x, y, z, f) {
    var frame = this.currentFrame;
    if(typeof f != 'undefined') {
      frame = f;
    }


    if(frame >= 0 && frame < this.meshFrames.length) {
      if(!this.meshFrames[frame].data) {
        return null;
      }
      return this.meshFrames[frame].data[z][y][x].mesh;
    }

    return null;

  },

  getCell: function(x, y, z, f) {//x, y, z) {

    var frame = this.currentFrame;
    if(typeof f != 'undefined') {
      frame = f;
    }


    if(frame >= 0 && frame < this.frames.length) {
      var gridData = this.frames[frame].data;
      var key = x + ',' + y + ',' + z;
      if(gridData.hasOwnProperty(key)) {
        return gridData[key];
      }
    }

    return {
      t: this.editor.tileSetManager.noTile,
      fc: 0,
      bc: this.editor.colorPaletteManager.noColor,
      rx: 0,
      ry: 0,
      rz: 0
    }
  },

  createGrid: function() {
    console.log('create grid');

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


    this.xyLineMaterial = new THREE.LineBasicMaterial({
      color: 0x353535,
      transparent: false,
      opacity: 0.5
    });

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
    console.log('create vertical lines');
    for(var i = 0; i <= gridWidth; i++) {
      var geometry = new THREE.BufferGeometry();
      var positions = [];
      
      positions.push(this.cellSizeX * i, 0, 0);
      positions.push(this.cellSizeX * i, gridHeight * this.cellSizeY, 0);

      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );

      /*
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, gridHeight * this.cellSizeY, 0)// gridDepth * this.cellSizeZ )
      );
      */

      var line = new THREE.Line( geometry, this.xyLineMaterial );
      this.xyGrid.add( line );    
    }

    // horizontal lines
    for(var i = 0; i <= gridHeight; i++) {
      var geometry = new THREE.BufferGeometry();
      var positions = [];

      positions.push(0, i * this.cellSizeY, 0);
      positions.push(gridWidth * this.cellSizeX, i * this.cellSizeY, 0);
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );

      /*
      geometry.vertices.push(      
        new THREE.Vector3( 0, i * this.cellSizeY, 0 ),
        new THREE.Vector3( gridWidth * this.cellSizeX, i * this.cellSizeY, 0 )
      );
*/
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


    // do this better!
    for(var i = 0; i <= gridWidth; i++) {
      var geometry = new THREE.BufferGeometry();
      var positions = [];
      positions.push(this.cellSizeX * i, 0, 0);
      positions.push(this.cellSizeX * i, 0, gridDepth * this.cellSizeZ);

      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );
      //geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
      //geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 4 ).onUpload( disposeArray ) );

      /*
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, 0, gridDepth * this.cellSizeZ )
      );
      */

      var line = new THREE.Line( geometry, this.xzLineMaterial );
      this.xzGrid.add( line );    
    }

    for(var i = 0; i <= gridDepth; i++) {
      var geometry = new THREE.BufferGeometry();
      positions = [];
      positions.push(0, 0, i * this.cellSizeZ);
      positions.push(gridWidth  * this.cellSizeX , 0, i * this.cellSizeZ);
      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).onUpload( disposeArray ) );

  /*    
      geometry.vertices.push(      
        new THREE.Vector3( 0, 0, i * this.cellSizeZ),
        new THREE.Vector3( gridWidth  * this.cellSizeX , 0, i * this.cellSizeZ)
      );
*/
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

    /*
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

*/
    this.setXYPosition(Math.floor(gridDepth / 2));
    this.setXZPosition(0);


    $('#gridXYPosition').attr('max', gridDepth);
    $('#gridXZPosition').attr('max', gridHeight);
  },


  toggleGrid: function() {
    if(this.xzMesh.visible || this.xyMesh.visible) {
      this.xzMesh.visible = true;
      this.xyMesh.visible = true;
    } else {
      this.xzMesh.visible = false;
      this.xyMesh.visible = false;
    }

  },


  setGridVisible: function(visible) {
    this.xzMesh.visible = visible;
    this.xyMesh.visible = visible;
  },

  getGridVisible: function() {
    return this.xzMesh.visible || this.xyMesh.visible;
  },


  getXYGridVisible: function() {
    return this.xyMesh.visible;
  },

  getXZGridVisible: function() {
    return this.xzMesh.visible;
  },


  setXYGridVisible: function(visible) {
    this.xyMesh.visible = visible;
  },

  setXZGridVisible: function(visible) {
    this.xzMesh.visible = visible;
  },


  getXZPosition: function() {
    return this.xzPosition;
  },

  setXZPosition: function(position) {
    if(position < 0 || position >= this.getGridHeight()) {
      return;
    }
    $('#gridXZPosition').val(position);
    this.xzPosition = position;
    this.xzMesh.position.y = this.xzPosition * this.cellSizeY;
  },


  getXYPosition: function() {
    return this.xyPosition;
  },

  setXYPosition: function(position) {
    if(position < 0 || position >= this.getGridDepth()) {
      return;
    }
    $('#gridXYPosition').val(position);
    this.xyPosition = position;
    this.xyMesh.position.z = this.xyPosition * this.cellSizeZ;
  },

  showOnlyXY: function(args) {
    if(!this.gridMeshes || this.changingGridData) {
      return;
    }

    var option = ''
    if(typeof args != 'undefined') {
      if(args.behind) {
        option = 'behind';
      }

      if(args.front) {
        option = 'front';
      }
    }

    var gridDepth = this.getGridDepth();
    var gridHeight = this.getGridHeight();
    var gridWidth = this.getGridWidth();

    for(var z = 0; z < gridDepth; z++) {
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {

          if(this.gridMeshes[z][y][x].mesh) {

            /*
            if(option == 'visibleLayers') {
              this.gridData[z][y][x].mesh.visible = this.visibleLayers[z];
            } else 
            */
            if(option == 'behind') {
              this.gridMeshes[z][y][x].mesh.visible = z <= this.xyPosition;
            } else if(option == 'front') {
              this.gridMeshes[z][y][x].mesh.visible = z >= this.xyPosition;
            } else {
              this.gridMeshes[z][y][x].mesh.visible = z == this.xyPosition;
            }

          }

          /*
          if(this.ghostGridData) {
            if(this.ghostGridData[z][y][x].mesh) {
              if(option == 'visibleLayers') {
                this.ghostGridData[z][y][x].mesh.visible = this.visibleLayers[z];
              } else if(option == 'behind') {
                this.ghostGridData[z][y][x].mesh.visible = z <= this.xyPosition;
              } else if(option == 'front') {
                this.ghostGridData[z][y][x].mesh.visible = z >= this.xyPosition;
              } else {
                this.ghostGridData[z][y][x].mesh.visible = z == this.xyPosition;
              }

            }
          }
          */
        }
      }
    }
  },

  showOnlyXZ: function() {
    if(!this.gridMeshes || this.changingGridData) {
      return;
    }

    var gridDepth = this.getGridDepth();
    var gridHeight = this.getGridHeight();
    var gridWidth = this.getGridWidth();


    for(var z = 0; z < gridDepth; z++) {
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          if(this.gridMeshes[z][y][x].mesh) {
            this.gridMeshes[z][y][x].mesh.visible = y == this.xzPosition;
          }
          /*
          if(this.ghostGridData) {
            if(this.ghostGridData[z][y][x].mesh) {
              this.ghostGridData[z][y][x].mesh.visible = y == this.xzPosition;
            }
          }  
          */        
        }
      }
    }
  },

  showAll: function(show) {
    if(!this.gridMeshes || this.changingGridData) {
      return;
    }

    if(typeof showAll == 'undefined') {
      show = true;
    }

    var gridDepth = this.getGridDepth();
    var gridHeight = this.getGridHeight();
    var gridWidth = this.getGridWidth();


    for(var z = 0; z < gridDepth; z++) {
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          if(this.gridMeshes[z][y][x].mesh) {
            this.gridMeshes[z][y][x].mesh.visible = show;
          }

          /*
          if(this.ghostGridData) {
            if(this.ghostGridData[z][y][x].mesh) {
              this.ghostGridData[z][y][x].mesh.visible = show;
            }
          }
          */
        
        }
      }
    }
  },


  setTypingCursorPosition: function(x, y, z) {

    if(this.typingCursorMesh == null) {
      var geometry = new THREE.BoxGeometry( this.cellSizeX * 1.01, this.cellSizeY * 1.01, this.cellSizeZ * 1.01 );
      this.typingCursorMeshMaterial =  new THREE.MeshPhongMaterial( { 
        color: 0xffffff, 
        specular: 0, 
        shininess: 0,  
        transparent: true, 
        opacity: 0.8 
      });
      this.typingCursorMeshMaterial.flatShading = true;
      this.typingCursorMesh = new THREE.Mesh(geometry, this.typingCursorMeshMaterial);    
      this.scene.add(this.typingCursorMesh);
    }

    this.typingCursorMesh.position.x = x * this.cellSizeX + this.cellSizeX / 2;
    this.typingCursorMesh.position.y = y * this.cellSizeY + this.cellSizeY / 2;
    this.typingCursorMesh.position.z = z * this.cellSizeZ + this.cellSizeZ / 2;


  },


  setCursorRotation: function(rotX, rotY, rotZ) {
    if(this.cursorMesh == null) {
      return;
    }

    this.cursorRotX = rotX;
    this.cursorRotY = rotY;
    this.cursorRotZ = rotZ;

    this.cursorMesh.rotation.x = rotX * Math.PI * 2;
    this.cursorMesh.rotation.y = rotY * Math.PI * 2;
    this.cursorMesh.rotation.z = rotZ * Math.PI * 2;

  },

  setCursorPosition: function(x, y, z) {
    this.cursorX = x;
    this.cursorY = y;
    this.cursorZ = z;

    if(this.cursorMesh != null) {
      this.cursorMesh.position.x = x * this.cellSizeX + this.cellSizeX / 2;
      this.cursorMesh.position.y = y * this.cellSizeY + this.cellSizeY / 2;
      this.cursorMesh.position.z = z * this.cellSizeZ + this.cellSizeZ / 2;
    }
    if(g_app.isMobile()) {
      this.cursorMesh.visible = false;
    } 

  },

  getCursorX: function() {
    return this.cursorX;
  },

  getCursorY: function() {
    return this.cursorY;
  },

  getCursorZ: function() {
    return this.cursorZ;
  },
 
  setCursorEnabled: function(enabled) {
    this.cursorEnabled = enabled;

    if(g_app.isMobile()) {
      this.cursorMesh.visible = false;
    } else {
      if(this.cursorMesh) {
        this.cursorMesh.visible = enabled;
      }
    }
  },

  getCursorEnabled: function() {
    return this.cursorEnabled;
  },

  setCursorColor: function(colorIndex) {
    this.cursorColor = colorIndex;
    var colorPalette = this.getColorPalette();
    var rgbColor = colorPalette.getHex(colorIndex);

    if(this.cursorMeshMaterial) {
      this.cursorMeshMaterial.color.set(rgbColor);
    }

  },

  setCursorTile: function(tileIndex) {

    if(this.cursorMesh != null && this.cursorTileIndex === tileIndex) {
      return;
    }

    if(this.cursorMesh) {
      this.scene.remove(this.cursorMesh);
      this.cursorMesh = null;
    }

    var tileSet = this.getTileSet();
    var colorPalette = this.getColorPalette();

    var geometry = null;

    if(tileIndex == this.editor.tileSetManager.noTile) {
      if(this.cubeMesh == null) {
        var geometry = new THREE.BoxGeometry( this.cellSizeX * 1.01, this.cellSizeY * 1.01, this.cellSizeZ * 1.01 );
        var material =  new THREE.MeshPhongMaterial( { 
          color: 0xffffff, 
          specular: 0, 
          shininess: 0,  
          transparent: true, 
          opacity: 0.4 
        });
        material.flatShading = true;
        this.cubeMesh = new THREE.Mesh(geometry, material);
      }
      this.cursorMesh = this.cubeMesh;

    } else {
      var geometry = tileSet.getGeometry(tileIndex);

      if(this.cursorMeshMaterial == null) {
        var color = this.editor.currentTile.getColor();
        var rgbColor = colorPalette.getHex(color);
    
        this.cursorMeshMaterial = new THREE.MeshPhongMaterial( { 
          color: rgbColor, 
          specular: 0, 
          shininess: 0,  
          transparent: true, 
          opacity: 0.6 
        });
        this.cursorMeshMaterial.flatShading = true;
      }

      this.cursorMesh = new THREE.Mesh(geometry, this.cursorMeshMaterial);
      this.cursorMesh.rotation.order = 'YXZ';
      this.cursorMesh.castShadow  = false;
    }

    this.setCursorPosition(this.cursorX, this.cursorY, this.cursorZ);
    this.setCursorRotation(this.cursorRotX, this.cursorRotY, this.cursorRotZ);

    this.scene.add(this.cursorMesh);

//    this.cursorMesh.tileIndex = tileIndex;
    this.cursorTileIndex = tileIndex;

  },

  setCellFromCursor: function() {

    var drawTools = this.editor.tools.drawTools;
    if(!this.cursorEnabled) {
      return;
    }

    var args = {};
    args.x = this.cursorX;
    args.y = this.cursorY;
    args.z = this.cursorZ;
    args.t = this.cursorTileIndex;
    args.fc = this.editor.currentTile.getColor();
    args.bc = this.editor.currentTile.getBGColor();

    var tool = this.editor.tools.drawTools.tool;
    if(tool == 'erase') {
      args.t = this.editor.tileSetManager.noTile;
    } else {
      var cell = this.getCell(args.x, args.y, args.z);
      if(!drawTools.drawCharacter) {
        args.t = cell.t;
      }
      if(!drawTools.drawColor) {
        args.fc = cell.fc;
      }
      if(!drawTools.drawBGColor) {
        args.bc = cell.bc;
      }
    }

    this.setCell(args);


    var grid3d = this.editor.grid3d;

    grid3d.lastCellSetX = args.x;
    grid3d.lastCellSetY = args.y;
    grid3d.lastCellSetZ = args.z;
  

  },

  getColorPerMode: function() {
    return 'cell';
  },

  getScreenMode: function() {
    return TextModeEditor.Mode.TEXTMODE;
  },

  getTileSetId: function() {
    return this.doc.tileSetId;
  },

  setTileSet: function(tileSetId) {
    this.doc.tileSetId = tileSetId;

    this.editor.modified();

    // need to update interface..
    this.editor.tileSetManager.setCurrentTileSetFromId(tileSetId);

    // need to switch geometry for meshes

    for(var i = 0; i < this.frames.length; i++) {
      this.removeAllTileMeshes(i);
    }

    this.createMeshes();
    // set the frame again to create the meshes.
    var currentFrame = this.currentFrame;
    this.currentFrame = false;
    this.setCurrentFrame(currentFrame);

  },
  
  getTileSet: function() {
    if(this.doc.tileSetId) {
      return this.editor.tileSetManager.getTileSet(this.doc.tileSetId);
    } 

    return null;
    
    /*else {

      return this.editor.tileSetManager.getCurrentTileSet();
    }*/
  },


  setColorPalette: function(colorPaletteId) {
//    this.colorPaletteId = colorPaletteId;
    this.doc.colorPaletteId = colorPaletteId;
  },

  getColorPalette: function() {
    var colorPalette = null;
    if(this.doc.colorPaletteId) {
      return this.editor.colorPaletteManager.getColorPalette(this.doc.colorPaletteId);
    } else {
      return this.editor.colorPaletteManager.getCurrentColorPalette();
    }
  },
    
  getScene: function() {
    return this.scene;
  },

  getHolder: function(frameIndex) {
    if(typeof frameIndex == 'undefined') {
      return this.holder;
    }

    if(frameIndex >= 0 && frameIndex < this.meshFrames.length) {
      return this.meshFrames[frameIndex].holder;  
    }

    return null;
  },  

  getGridWidth: function() {
    return this.doc.gridWidth;
  },

  getGridHeight: function() {
    return this.doc.gridHeight;
  },

  getGridDepth: function() {
    return this.doc.gridDepth;
  },

  clearFrame: function(frame) {

  },

  getFrameCount: function() {
    return this.frameCount;
  },

  getFrameDuration: function(frame) {
    return 12;
  },

  setFrameDuration: function(duration, frame) {

  },

  getCurrentFrame: function() {
    return this.currentFrame;
  },

  initMeshFrameData: function(frameIndex) {
    if(frameIndex > this.frameCount || frameIndex < 0) {
      return false;
    }

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    var gridDepth = this.getGridDepth();


    // init the mesh frames
    var data = [];
    for(var z = 0; z < gridDepth; z++) {
      data[z] = [];
      for(var y = 0; y < gridHeight; y++) {
        data[z][y] = [];
        for(var x = 0; x < gridWidth; x++) {
          data[z][y][x] = { 
            mesh: null
          };
        }
      }
    }

    this.meshFrames[frameIndex].data = data;    
  },

  initFrameData: function(frameIndex) {
    if(frameIndex > this.frameCount || frameIndex < 0) {
      return false;
    }


    this.frames[frameIndex].data = {};
    /*
    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    var gridDepth = this.getGridDepth();

    var data = [];

    var noTile = this.editor.tileSetManager.noTile;

    for(var z = 0; z < gridDepth; z++) {
      data[z] = [];
      for(var y = 0; y < gridHeight; y++) {
        data[z][y] = [];
        for(var x = 0; x < gridWidth; x++) {
          data[z][y][x] = { 
            t: noTile, 
            fc: 1, 
            bc: false, 
            rx: 0, 
            ry: 0, 
            rz: 0
          };
        }
      }
    }

    this.frames[frameIndex].data = data;
    */
  },

  setCurrentFrame: function(frameIndex) {
    if(frameIndex === this.currentFrame) {
      // frame hasnt changed
      return;
    }

    if(frameIndex > this.frameCount || frameIndex < 0) {
      
      return false;
    }

    if(this.frames[frameIndex].data == null) {
      this.initFrameData(frameIndex);
    }

    if(this.meshFrames[frameIndex].data == null) {
      this.initMeshFrameData(frameIndex);
    }

//    this.editor.grid.setGridData(this.frames[frame].data, this.frames[frame].holder);

    this.changingGridData = true;

    if(this.holder) {
      this.scene.remove(this.holder);
      this.holder.visible = false;
    }

    this.holder = this.meshFrames[frameIndex].holder;
    this.holder.visible = true;
    this.scene.add(this.holder);

    this.currentFrame = frameIndex;
    this.gridMeshes = this.meshFrames[frameIndex].data;
    this.gridData = this.frames[frameIndex].data;

    this.changingGridData = false;
  },  

  deleteFrame: function(frame) {

    if(typeof frame == 'undefined') {
      frame = this.currentFrame;
    }

    if(this.frames.length <= 1) {
      
      return false;
    }

    var frameData = this.frames.splice(frame, 1);
    var meshFrameData = this.meshFrames.splice(frame, 1);
    var meshData = meshFrameData[0].data;
    var holder = meshFrameData[0].holder;
    //for(var i = 0; i < holder.children.length; i++) {

    //}
    while(holder.children.length > 0) {
      holder.remove(holder.children[0]);
    }
    for(var z = 0; z < meshData.length; z++) {
      for(var y = 0; y < meshData[z].length; y++) {
        for(var x = 0; x < meshData[z][y].length; x++) {
          if(meshData[z][y][x].mesh) {
            meshData[z][y][x].mesh.box = null;
            meshData[z][y][x].mesh = null;
          }
          meshData[z][y][x] = null;
        }
      }
    }

    this.scene.remove(holder);
    meshFrameData.holder = null;
    
    console.log("NEED TO CLEAR MESH FRAME DATA!!!!!!");


    var newFrameCount = this.frameCount - 1;
    this.setFrameCount(newFrameCount);
  },

  insertFrame: function(frame, duration) {
    if(typeof duration == 'undefined') {
      duration = 12;
    }

    var frameObject = { data: null };
    this.frames.splice(frame + 1, 0, frameObject);

    var holder = new THREE.Object3D();
    holder.castShadow = true;
    holder.receiveShadow = true;
    var meshFrameObject = { data: null, holder: holder } 
    this.meshFrames.splice(frame + 1, 0, meshFrameObject);

    this.frameCount++;
//    this.setCurrentFrame(frame);
    return frame + 1;

  },

  duplicateFrame: function(fromFrame, toFrame) {
    if(fromFrame < 0 || fromFrame >= this.frames.length || toFrame < 0 || toFrame >= this.frames.length) {
      return;
    }

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    var gridDepth = this.getGridDepth();

    var noTile = this.editor.tileSetManager.noTile;

    var args = {};
    args.z = 0;

    for(args.z = 0; args.z < gridDepth; args.z++) {
      for(args.y = 0; args.y < gridHeight; args.y++) {
        for(args.x = 0; args.x < gridWidth; args.x++) {
          var cell = this.getCell( args.x, args.y, args.z, fromFrame );

          if(cell.t !== noTile && cell.t !== false) {

            for(var key in cell) {
              if(cell.hasOwnProperty(key)) {
                args[key] = cell[key];
              }
            }

            args.frame = toFrame;
            args.update = false;
            console.log(args);
            this.setCell(args);
          }

        }
      }
    }

  },

  setFrameCount: function(frameCount) {
    while(frameCount > this.frames.length) {
      var holder = new THREE.Object3D();
      holder.visible = false;

      this.frames.push({ data: null });
      this.meshFrames.push({ data: null, holder: holder });
    }

    if(frameCount < this.frameCount) {
      for(var i = frameCount; i < this.frameCount; i++) {
        this.clearFrame(i);
      }

    }
    this.frameCount = frameCount;

  },


  setCell: function(args) {
    if(typeof args.t == 'undefined') {
      return;
    }

    var frame = this.currentFrame;
    if(typeof args.frame != 'undefined') {
      frame = args.frame;
    }

//    var gridData = this.gridData;
//    var gridMeshes = this.gridMeshes;

    var x = args.x;
    var y = args.y;
    var z = args.z;


    // the tile id
    var t = args.t;

    // the block
    var b = false;
    if(typeof args.b !== 'undefined') {
      b = args.b;
    }


    var fc = this.editor.currentTile.color;
    if(typeof args.fc !== 'undefined') {
      fc = args.fc;
    }

    var rx = this.editor.currentTile.rotX;
    if(typeof args.rx !== 'undefined') {
      rx = args.rx;
    }

    var ry = this.editor.currentTile.rotY;
    if(typeof args.ry !== 'undefined') {
      ry = args.ry;
    }

    var rz = this.editor.currentTile.rotZ;
    if(typeof args.rz !== 'undefined') {
      rz = args.rz;
    }


    fh = 0;
    if(typeof args.fh !== 'undefined') {
      fh = args.fh;
    }

    fv = 0;
    if(typeof args.fv !== 'undefined') {
      fv = args.fv;
    }  

    var gridWidth = this.getGridWidth();
    var gridHeight = this.getGridHeight();
    var gridDepth = this.getGridDepth();

    if(x >= gridWidth || x < 0 || y >= gridHeight || y < 0 || z >= gridDepth || z < 0) {
      // outside grid

      return;
    }


    if(frame < 0 || frame >= this.frames.length) {
      // outside frame range
      return;
    }
    
    var gridData = this.frames[frame].data;
    var gridMeshes = this.meshFrames[frame].data;
    var key = x + ',' + y + ',' + z;

    
    var cell = {
      t: this.editor.tileSetManager.noTile,
      rx: 0,
      ry: 0,
      rz: 0,
      fc: 0,
      bc: this.editor.colorPaletteManager.noColor
    };

    var cellExists = gridData.hasOwnProperty(key);
    if(cellExists) {
      cell = gridData[key];
    }

//    var cell = gridData[z][y][x];
    var cellMesh = gridMeshes[z][y][x];
    var bc = this.editor.currentTile.bgColor;


    if(typeof args.bc !== 'undefined') {
      bc = args.bc;
    } else {
      if(typeof cell.bc != 'undefined') {
        bc = cell.bc
      } 
    }    


    if(cellExists) {

        // check if cell has changed
      if(cell.t === t 
        && cell.fc === fc
        && cell.bc === bc      
        && cell.rx == rx
        && cell.ry == ry
        && cell.rz == rz
      ) {
        // no change
        return;
      }
    }

    /*
    if(!doc.blockMode) {

      // check if cell has changed
      if(cell.t == t && cell.fc == fc
        && cell.rz == rz
        && cell.fh == fh
        && cell.fv == fv
        &&  (!this.hasCharRotation || (cell.rx == rx && cell.ry == ry && cell.rz == rz)) 
        && cell.bc === bc) {
        // no change
        return;
      }
    }
*/
    // remove mesh for current cell if it exists
    if(cellMesh && typeof cellMesh.mesh != 'undefined' && cellMesh.mesh != null) {
      this.holder.remove(cellMesh.mesh);
      cellMesh.mesh.box = null;
      cellMesh.mesh = null;
      
    }


    if(t == this.editor.tileSetManager.noTile) {
      // erasing the cell
    } else {
      var tileSet = this.getTileSet();
      var colorPalette = this.getColorPalette();

      var mesh = null;

      if(bc == this.editor.colorPaletteManager.noColor && bc !== false) {
        var geometry = tileSet.getGeometry(t);
        var material = colorPalette.getMaterial(fc);

        if(typeof geometry == 'undefined') {
          console.log('no geometry!!!!');
          return;
        }
        mesh = new THREE.Mesh(geometry, material );//this.materials[color]);
      } else {
        var geometry = tileSet.getGeometry(t);
        var bgGeometry = tileSet.getBackgroundGeometry(t);
        var material = colorPalette.getMaterial(fc);
        var bgMaterial = colorPalette.getMaterial(bc);

        if(typeof geometry == 'undefined' || typeof bgGeometry == 'undefined') {
          console.log('no geometry!!!!');
          return;
        }

        mesh = new THREE.Mesh(bgGeometry, bgMaterial);
        fgMesh = new THREE.Mesh(geometry, material);
        mesh.add(fgMesh);
      }

      var meshX = x * this.cellSizeX + this.cellSizeX / 2;
      var meshY = y * this.cellSizeY + this.cellSizeY / 2;
      var meshZ = z * this.cellSizeZ + this.cellSizeZ / 2;
          
      mesh.rotation.order = 'YXZ';
      mesh.rotation.x = rx * Math.PI * 2;// + Math.PI / 2;
      mesh.rotation.y = ry * Math.PI * 2;
      mesh.rotation.z = rz * Math.PI * 2;

      mesh.position.x = meshX;//x * this.cellSize + this.cellSize / 2;
      mesh.position.y = meshY;//y * this.cellSize + this.cellSize / 2;
      mesh.position.z = meshZ;//z * this.cellSize + this.cellSize / 2;

      // need to retain the original position for when moving selection
      mesh.originalPosition = {};
      mesh.originalPosition.x = meshX;
      mesh.originalPosition.y = meshY;
      mesh.originalPosition.z = meshZ;

      mesh.gridX = x;
      mesh.gridY = y;
      mesh.gridZ = z;

      mesh.box = new THREE.Box3(new THREE.Vector3(meshX - this.cellSizeX / 2, 
                                                  meshY - this.cellSizeY / 2, 
                                                  meshZ - this.cellSizeZ / 2),
                                new THREE.Vector3(meshX + this.cellSizeX / 2, 
                                                  meshY + this.cellSizeY / 2, 
                                                  meshZ + this.cellSizeZ / 2));

      mesh.box.gridPosition = new THREE.Vector3(x, y, z);

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      //      mesh.castShadow = true;
      //      mesh.receiveShadow = true;

      cellMesh.mesh = mesh;
      this.holder.add(mesh);
    }

    // record the action
    var params = { 
                   "x": x, "y": y, "z": z,
//                   "layerRef": this.layerRef,
                   "oldCharacter": cell.t,
                   "oldColor": cell.fc,
                   "oldBgColor": cell.bc,
                   "oldRx": cell.rx,
                   "oldRy": cell.ry,
                   "oldRz": cell.rz,
                   "newCharacter": t, 
                   "newColor": fc,
                   "newBgColor": bc,
                   "newRx": fh,
                   "newRy": fv,
                   "newRz": rz,
                   "frame": frame
                 };
    this.editor.history.addAction("setCell3d", params);

                 /*
    if(this.getBlockModeEnabled() && b !== false) {
      params["oldB"] = cell.b;
      params["newB"] = b;
    }

    if(this.hasCharRotation) {
      params["oldRx"] = cell.rx;
      params["oldRy"] = cell.ry;
//      params["oldRotZ"] = cell.rz;
      params["newRx"] = rx;
      params["newRy"] = ry;
//      params["newRotZ"] = rz;
    }                   
*/

    cell.x = x;
    cell.y = y;
    cell.z = z;

    cell.t = t;
    cell.fc = fc;
    cell.bc = bc;
    cell.fh = fh;
    cell.fv = fv;
    cell.rx = rx;
    cell.ry = ry;
    cell.rz = rz;

    if(!cellExists) {
      gridData[key] = cell;
    }

    this.editor.modified();
  },

  /*
  update: function() {
    var time = getTimestamp();

    var tool = this.editor.tools.drawTools.tool;
    
    if(tool == 'type') {
      if(time - this.lastTypingBlink > 700) {

        this.lastTypingBlink = time;

        if(this.typingCursorMesh != null) {
          this.typingCursorMesh.visible = !this.typingCursorMesh.visible;
        }
      }
    }
  }
  */
}
