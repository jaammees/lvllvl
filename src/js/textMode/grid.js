var Grid = function() {
  this.editor = null;

  // default grid dimensions
  this.width = 40;
  this.height = 25;
  this.depth = 25;

  // holders for 3d meshes
  this.gridData = null;
  this.holder = null;
  this.ghostHolder = null;
  this.changingGridData = false;


  // each pixel is 0.25 3d units
  this.pixelTo3dUnits = 0.25;

  this.pixelSizeX = 1;
  this.pixelSizeY = 1;
  this.pixelSizeZ = 1;

  this.cellSizeX = 8 * this.pixelSizeX * this.pixelTo3dUnits;
  this.cellSizeY = 8 * this.pixelSizeX * this.pixelTo3dUnits;
  this.cellSizeZ = 8 * this.pixelSizeX * this.pixelTo3dUnits;

  this.handedness = 'right';// 'left';

  this.cursorCharacter = null;
  this.cursorEnabled = true;
  this.cursor = null;

  this.typingCursor = null;

  this.selection = null;
  this.selectionActive = false;
  this.selectionDragControls = null;
  this.selectionDragArrows = null;
  this.selectionDragMode = '';
  this.selectionOffsetX = 0;
  this.selectionOffsetY = 0;



  this.grid2d = null;

  this.border = new THREE.Object3D();
  this.border.visible = true;
  this.borderEnabled = true;


  this.backgroundImageSet = false;

  this.background = new THREE.Object3D();
  this.background.visible = true;

  this.backgroundImage = new THREE.Object3D();
  this.backgroundImage.visible = false;

  this.backgroundImageCanvas = null;
  this.backgroundImageTexture = null;
  this.backgroundImageMaterial = null;


  this.updateEnabled = true;
}

Grid.prototype = {



  init: function(editor) {
    this.editor = editor;

    this.grid2d = new Grid2d();
    this.grid2d.init(editor);

//    console.log('create grid');
//    this.createGrid();
  },


  initTypingCursor: function() {
    var geometry = new THREE.BoxGeometry( this.cellSizeX, this.cellSizeY, this.cellSizeZ );
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0, shininess: 0 });//, transparent: true, opacity: 0.6 } ) ;
    material.flatShading = true;

    if(this.typingCursor) {
      scene.remove(this.typingCursor);
      this.typingCursor = null;
    }
    this.typingCursor = new THREE.Mesh(geometry, material);
    this.typingCursor.frustumCulled = false;
    this.typingCursor.visible = false;
    this.typingCursor.gridX = 0;
    this.typingCursor.gridY = 0;
    this.typingCursor.gridZ = 0;
    this.typingCursor.lastChangeTime = 0;

    scene.add(this.typingCursor);
  },

  setTypingCursorPosition: function(x, y, z) {
    if(typeof x == 'undefined') {
      x = this.cursorCharacter.gridX;
      y = this.cursorCharacter.gridY;
      z = this.cursorCharacter.gridZ;
    }

    this.typingCursor.position.x = x * this.cellSizeX + this.cellSizeX / 2;
    this.typingCursor.position.y = (y * this.cellSizeY + this.cellSizeY / 2);
    this.typingCursor.position.z = z * this.cellSizeZ + this.cellSizeZ / 2;


    this.typingCursor.gridX = x;
    this.typingCursor.gridY = y;
    this.typingCursor.gridZ = z;

  },

  setupSelectionDragControls: function() {

    this.selectionDragArrows = [];

    this.selectionDragControls = new THREE.Object3D();
    this.selectionDragControls.position.x = 20;
    this.selectionDragControls.position.y = 20;
    this.selectionDragControls.position.z = 30;

    scene.add(this.selectionDragControls);

    // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
    var dragUpGeometry = new THREE.CylinderGeometry(0, 0.8, 2, 4, 1);
    var material = new THREE.MeshPhongMaterial( { color: 0xff0000, specular: 0, shininess: 0, transparent: false, opacity: 0.6 });//, transparent: true, opacity: 0.6 } ) ;
    material.flatShading = true;

    this.dragUpControl = new THREE.Mesh(dragUpGeometry, material);
    this.dragUpControl.position.y = 5;

    this.dragUpControl.dragType = 'dragUp';

//    this.dragUpControl.renderDepth = 1000;


    this.selectionDragArrows.push(this.dragUpControl);

    var dragUpArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 3, 1);
    var dragUpArm = new THREE.Mesh(dragUpArmGeometry, material);
    dragUpArm.position.y = 2.5;
    this.selectionDragControls.add(dragUpArm);


    this.selectionDragControls.add(this.dragUpControl);


    var dragRightGeometry = new THREE.CylinderGeometry(0, 0.8, 2, 4, 1);
    var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0, shininess: 0, transparent: false, opacity: 0.6 });//, transparent: true, opacity: 0.6 } ) ;
    material.flatShading = true;

    this.dragRightControl = new THREE.Mesh(dragUpGeometry, material);
    this.dragRightControl.rotation.z = -Math.PI / 2;
    this.dragRightControl.position.x = 5;

    this.dragRightControl.dragType = 'dragRight';

    this.selectionDragArrows.push(this.dragRightControl);
    this.selectionDragControls.add(this.dragRightControl);


    var dragRightArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 3, 1);
    var dragRightArm = new THREE.Mesh(dragRightArmGeometry, material);
    dragRightArm.position.x = 2.5;
    dragRightArm.rotation.z = -Math.PI / 2;
    this.selectionDragControls.add(dragRightArm);





    var dragForwardGeometry = new THREE.CylinderGeometry(0, 0.8, 2, 4, 1);
    var material = new THREE.MeshPhongMaterial( { color: 0x0000ff, specular: 0, shininess: 0, transparent: false, opacity: 0.6 });//, transparent: true, opacity: 0.6 } ) ;
    material.flatShading = true;

    this.dragForwardControl = new THREE.Mesh(dragForwardGeometry, material);
    this.dragForwardControl.rotation.x = Math.PI / 2;
    this.dragForwardControl.position.z = 5;

    this.dragForwardControl.dragType = 'dragForward';

    this.selectionDragArrows.push(this.dragForwardControl);
    this.selectionDragControls.add(this.dragForwardControl);


    var dragForwardArmGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 3, 1);
    var dragForwardArm = new THREE.Mesh(dragForwardArmGeometry, material);
    dragForwardArm.position.z = 2.5;
    dragForwardArm.rotation.x = Math.PI / 2;
    this.selectionDragControls.add(dragForwardArm);

    this.selectionDragControls.visible = false;
  },


  initSelection: function() {
    // create selection mesh
    var geometry = new THREE.BoxGeometry( this.cellSizeX, this.cellSizeY, this.cellSizeZ );
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0, shininess: 0, transparent: true, opacity: 0.3 });//, transparent: true, opacity: 0.6 } ) ;
    material.flatShading = true;

    if(this.selection) {
      scene.remove(this.selection);
      this.selection = null;
    }
    this.selection = new THREE.Mesh(geometry, material);
    this.selection.frustumCulled = false;
    this.selection.visible = false;
    scene.add(this.selection);

    $('#selectX1').attr('max', this.width);
    $('#selectX2').attr('max', this.width);
    $('#selectY1').attr('max', this.height);
    $('#selectY2').attr('max', this.height);
    $('#selectZ1').attr('max', this.depth);
    $('#selectZ2').attr('max', this.depth);


    this.setupSelectionDragControls();
  },

  // update input = update input controls for entering selection
  setSelection: function(min, max, updateInput) {
    this.selectionActive = true;
    var minX = min.x;
    var minY = min.y;
    var minZ = min.z;

    var maxX = max.x;
    var maxY = max.y;
    var maxZ = max.z;


    if(minX > maxX) {
      minX = maxX;
      maxX = min.x;
    }


    if(minY > maxY) {
      minY = maxY;
      maxY = min.y;      
    }

    if(minZ == maxZ) {
      maxZ += 1;
//      console.log('add one');
    }    



    if(minZ > maxZ) {
      minZ = max.z - 1;

      console.log('minz = ' + minZ + ' maxz = ' + maxZ);
      if(maxZ - minZ == 1) {
        //minZ -= 1;
      }
      maxZ = min.z ;
    } else {
      maxZ -= 1;
    }


    if(minX < 0) {
      minX = 0;
    }

    if(minX >= this.width) {
      minX = this.width - 1;
    }

    if(maxX >= this.width) {
      maxX = this.width - 1;
    }

    if(maxX < 0) {
      maxX = 0;
    }

    if(minY < 0) {
      minY = 0;
    }

    if(minY >= this.height) {
      minY = this.height - 1;
    }

    if(maxY >= this.height)  {
      maxY = this.height - 1;
    }

    if(maxY < 0) {
      maxY = 0;
    }

    if(minZ < 0) {
      minZ = 0;
    }

    if(minZ >= this.depth) {
      minZ = this.depth - 1;
    }

    if(maxZ < 0) {
      maxZ = 0;
    }

    if(maxZ >= this.depth) {
      maxZ = this.depth - 1;
    }

    this.selection.minX = minX;
    this.selection.minY = minY;
    this.selection.minZ = minZ;

    this.selection.maxX = maxX+1;
    this.selection.maxY = maxY+1;
    this.selection.maxZ = maxZ+1;

    var offset = 0.1;


    maxY += 1;
    maxX += 1;
    maxZ += 1;

    // view coords are top left is 0, 0
    //handedness
    var temp = maxY;
//    maxY = this.height - minY;
//    minY = this.height - temp;

    minX *= this.cellSizeX;
    minY *= this.cellSizeY;
    minZ *= this.cellSizeZ;

    maxX *= this.cellSizeX;
    maxY *= this.cellSizeY;
    maxZ *= this.cellSizeZ;


    minX -= offset;
    minY -= offset;
    minZ -= offset;

    maxX += offset;
    maxY += offset;
    maxZ += offset;




    this.selection.geometry.vertices[0].x = maxX;
    this.selection.geometry.vertices[0].y = maxY;
    this.selection.geometry.vertices[0].z = maxZ;

    this.selection.geometry.vertices[1].x = maxX;
    this.selection.geometry.vertices[1].y = maxY;
    this.selection.geometry.vertices[1].z = minZ;

    this.selection.geometry.vertices[2].x = maxX;
    this.selection.geometry.vertices[2].y = minY;
    this.selection.geometry.vertices[2].z = maxZ;

    this.selection.geometry.vertices[3].x = maxX;
    this.selection.geometry.vertices[3].y = minY;
    this.selection.geometry.vertices[3].z = minZ;

    this.selection.geometry.vertices[4].x = minX;
    this.selection.geometry.vertices[4].y = maxY;
    this.selection.geometry.vertices[4].z = minZ;

    this.selection.geometry.vertices[5].x = minX;
    this.selection.geometry.vertices[5].y = maxY;
    this.selection.geometry.vertices[5].z = maxZ;

    this.selection.geometry.vertices[6].x = minX;
    this.selection.geometry.vertices[6].y = minY;
    this.selection.geometry.vertices[6].z = minZ;

    this.selection.geometry.vertices[7].x = minX;
    this.selection.geometry.vertices[7].y = minY;
    this.selection.geometry.vertices[7].z = maxZ;

    this.selection.geometry.verticesNeedUpdate = true;


    if(typeof updateInput == 'undefined' || updateInput == true) {

      if(this.editor.invertY) {
        $('#selectX1').val(this.selection.minX);
        $('#selectY2').val(this.editor.frames.height - this.selection.minY - 1);
        $('#selectZ1').val(this.selection.minZ);

        $('#selectX2').val(this.selection.maxX - 1);
        $('#selectY1').val(this.editor.frames.height - (this.selection.maxY - 1) - 1) ;
        $('#selectZ2').val(this.selection.maxZ - 1);

      } else {
        $('#selectX1').val(this.selection.minX);
        $('#selectY1').val(this.selection.minY);
        $('#selectZ1').val(this.selection.minZ);

        $('#selectX2').val(this.selection.maxX - 1);
        $('#selectY2').val(this.selection.maxY - 1);
        $('#selectZ2').val(this.selection.maxZ - 1);
      }
    }


    this.selection.position.x = 0;
    this.selection.position.y = 0;
    this.selection.position.z = 0;

    if(this.editor.mode !== 'type') {
      this.selectionDragControls.visible = true;//true;
    } else {
      this.selectionDragControls.visible = false;//true;

    }
    this.selectionDragControls.position.x = (minX + maxX) / 2;
    this.selectionDragControls.position.y = (minY + maxY) / 2;
    this.selectionDragControls.position.z = maxZ;//(minZ + maxZ) / 2;

    this.selectionDragControls.originalPosition = {};
    this.selectionDragControls.originalPosition.x = this.selectionDragControls.position.x;
    this.selectionDragControls.originalPosition.y = this.selectionDragControls.position.y;
    this.selectionDragControls.originalPosition.z = this.selectionDragControls.position.z;

    this.selection.visible = true;

  },

  offsetSelectionBy: function(xOffset, yOffset, zOffset) {
    console.log('offset selection by ' + xOffset + ',' + yOffset + ',' + zOffset);
    
    this.selection.position.x = xOffset * this.cellSizeX;
    this.selection.position.y = yOffset * this.cellSizeY;
    this.selection.position.z = zOffset * this.cellSizeZ;

    this.selection.offsetX = xOffset;
    this.selection.offsetY = yOffset;
    this.selection.offsetZ = zOffset;

    this.selectionDragControls.position.x = this.selectionDragControls.originalPosition.x + xOffset * this.cellSizeX;
    this.selectionDragControls.position.y = this.selectionDragControls.originalPosition.y + yOffset * this.cellSizeY;
    this.selectionDragControls.position.z = this.selectionDragControls.originalPosition.z + zOffset * this.cellSizeZ;


    var width = this.selection.maxX - this.selection.minX;
    var depth = this.selection.maxZ - this.selection.minZ;
    var height = this.selection.maxY - this.selection.minY;

    for(var z = 0; z < depth; z++) {
      for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
          var cell = this.gridData[this.selection.minZ + z][this.selection.minY + y][this.selection.minX + x];
          if(cell.c >= 0 && cell.c != this.editor.tileSetManager.blankCharacter) {
            cell.mesh.position.x = cell.mesh.originalPosition.x + xOffset * this.cellSizeX;
            cell.mesh.position.y = cell.mesh.originalPosition.y + yOffset * this.cellSizeY;
            cell.mesh.position.z = cell.mesh.originalPosition.z + zOffset * this.cellSizeZ;
          }
        }
      }
    }



  },


  clearCellOffsets: function() {
    for(var z = 0; z < this.depth; z++) {
      for(var y = 0; y < this.height; y++) {
        for(x = 0; x < this.width; x++) {
          var cell = this.gridData[z][y][x];
          if(cell && cell.c != this.editor.tileSetManager.blankCharacter) {
            cell.mesh.position.x = cell.mesh.originalPosition.x;
            cell.mesh.position.y = cell.mesh.originalPosition.y;
            cell.mesh.position.z = cell.mesh.originalPosition.z;
          }
        }
      }
    }
  },


  createGrid: function() {
    alert('create grid!');
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

    // x/y grid

    if(this.xyLineMaterial == null) {
      this.xyLineMaterial = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: false,
        opacity: 0.5
      });
    }

    this.xyMesh = new THREE.Object3D();
    scene.add(this.xyMesh);

    this.xyGrid = new THREE.Object3D();
    this.xyMesh.add(this.xyGrid);

    // vertical lines
    for(var i = 0; i <= this.width; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, this.height * this.cellSizeY, 0 )
      );

      var line = new THREE.Line( geometry, this.xyLineMaterial );
      this.xyGrid.add( line );    
    }

    // horizontal lines
    for(var i = 0; i <= this.height; i++) {
      var geometry = new THREE.Geometry();
    
      geometry.vertices.push(      
        new THREE.Vector3( 0, i * this.cellSizeY, 0 ),
        new THREE.Vector3( this.width * this.cellSizeX, i * this.cellSizeY, 0 )
      );

      var line = new THREE.Line( geometry, this.xyLineMaterial );
      this.xyGrid.add( line );
    }

    // xy grid backing plane
    var geometry = new THREE.PlaneGeometry(this.width * this.cellSizeX, this.height * this.cellSizeY);
    this.xyGridBackingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
    this.xyGridBacking = new THREE.Mesh(geometry, this.xyGridBackingMaterial);
    this.xyGridBacking.position.z = -0.05;
    this.xyGridBacking.position.x = (this.width * this.cellSizeX) / 2;
    this.xyGridBacking.position.y = (this.height * this.cellSizeY) / 2;
    this.xyGridBacking.gridPlane = 'xy';
    this.xyMesh.add(this.xyGridBacking);

    this.planes.push(this.xyGridBacking);


    this.xzLineMaterial = new THREE.LineBasicMaterial({
      color: 0x353535,
      transparent: false,
      opacity: 0.5
    });

    // x/z grid
    this.xzMesh = new THREE.Object3D();
    this.xzGrid = new THREE.Object3D();
    this.xzMesh.add(this.xzGrid);
    scene.add(this.xzMesh);

    for(var i = 0; i <= this.width; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( this.cellSizeX * i, 0, 0 ),
        new THREE.Vector3( this.cellSizeX * i, 0, this.depth * this.cellSizeZ )
      );

      var line = new THREE.Line( geometry, this.xzLineMaterial );
      this.xzGrid.add( line );    
    }

    for(var i = 0; i <= this.depth; i++) {
      var geometry = new THREE.Geometry();
      
      geometry.vertices.push(      
        new THREE.Vector3( 0, 0, i * this.cellSizeZ),
        new THREE.Vector3( this.width  * this.cellSizeX , 0, i * this.cellSizeZ)
      );

      var line = new THREE.Line( geometry, this.xzLineMaterial );
      this.xzGrid.add( line );
    }

    var geometry = new THREE.PlaneGeometry(this.width * this.cellSizeX, this.depth * this.cellSizeZ);
    this.xzGridBackingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05, side: THREE.DoubleSide });
    this.xzGridBacking = new THREE.Mesh(geometry, this.xzGridBackingMaterial);

    this.xzGridBacking.rotation.x = -Math.PI / 2;
    this.xzGridBacking.position.y = -0.1;
    this.xzGridBacking.position.x = (this.width * this.cellSizeX) / 2;
    this.xzGridBacking.position.z = (this.depth * this.cellSizeZ) / 2;

    this.xzGridBacking.gridPlane = 'xz';
    this.xzMesh.add(this.xzGridBacking);
    this.planes.push(this.xzGridBacking);


    // floor
    if(this.floor) {
      scene.remove(this.floor);
      this.floor = null;
    }

    var geometry = new THREE.PlaneGeometry(this.width * this.cellSizeX, this.depth * this.cellSizeZ);
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


    this.xyPosition = Math.floor(this.depth / 2);
    this.xyMesh.position.z = this.xyPosition * this.cellSizeZ;
//    this.intersectionLine.position.z = this.xyMesh.position.z;

    this.xzPosition = this.height - 1;
    if(this.handedness == 'right') {
      this.xzPosition = 0;
      this.xzMesh.position.y = this.xzPosition * this.cellSizeY;
    } else {
      this.xzPosition = this.height - 1;
      this.xzMesh.position.y = this.height * this.cellSizeY - 1 - this.xzPosition * this.cellSizeY - this.cellSizeY / 2;
    }

    this.initSelection();
    this.initTypingCursor();
    this.setupBackgroundImage();

    // set limits for input controls
    $('#xyPosition').attr('max', this.depth);
    $('#xzPosition').attr('max', this.height);



    console.error("2d shouldn't call this");

  },

  toggleGrid: function() {
    this.xyMesh.visible = !this.xyMesh.visible;
    this.xzMesh.visible = !this.xzMesh.visible;
//    this.update();
  },


  setBorderEnabled: function(enabled) {
    this.border.visible = this.border.visible & enabled;
    this.borderEnabled = enabled;
  },

  toggleBorder: function() {
    if(!this.borderEnabled) {
      return;
    }
    this.border.visible = !this.border.visible;
    UI('edit-showborder').setChecked(this.border.visible);
  },

  toggleBackground: function() {
    this.background.visible = !this.background.visible;
  },

  setupBackgroundImage: function() {
    return;

    this.backgroundImageScale = 1;

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!this.backgroundImageCanvas) {
      this.backgroundImageCanvas = document.createElement("canvas");
    }

    this.backgroundImageCanvas.width = tileSet.charWidth * (this.width) * this.backgroundImageScale;
    this.backgroundImageCanvas.height = tileSet.charHeight * (this.height) * this.backgroundImageScale;
    this.backgroundImageContext = this.backgroundImageCanvas.getContext("2d");
    this.backgroundImageContext.imageSmoothingEnabled = false;
    this.backgroundImageContext.webkitImageSmoothingEnabled = false;
    this.backgroundImageContext.mozImageSmoothingEnabled = false;
    this.backgroundImageContext.msImageSmoothingEnabled = false;
    this.backgroundImageContext.oImageSmoothingEnabled = false;


    if(!this.backgroundImageTexture) {
      this.backgroundImageTexture = new THREE.Texture(this.backgroundImageCanvas);
      this.backgroundImageTexture.magFilter = THREE.NearestFilter;
      this.backgroundImageTexture.minFilter = THREE.NearestFilter;
      this.backgroundImageTexture.generateMipmaps = false;
    }

    this.backgroundImageContext.clearRect(0, 0, this.backgroundImageCanvas.width, this.backgroundImageCanvas.height);

    this.backgroundImageTexture.needsUpdate = true;

    if(!this.backgroundImageMaterial) {
      this.backgroundImageMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: this.backgroundImageTexture });
    }

    var geometry = new THREE.PlaneGeometry(this.width * this.cellSizeX, this.height * this.cellSizeY);  
    this.backgroundImage = new THREE.Mesh(geometry, this.backgroundImageMaterial);
    this.backgroundImage.position.z = -0.1;
    this.backgroundImage.position.x = (this.width * this.cellSizeX) / 2;
    this.backgroundImage.position.y = (this.height * this.cellSizeY) / 2;
    this.xyMesh.add(this.backgroundImage);

//    this.backgroundImage.visible = false;
  },

  setBackgroundImage: function(image, x, y, drawWidth, drawHeight) {

    x *= this.backgroundImageScale;
    y *= this.backgroundImageScale;
    drawWidth *= this.backgroundImageScale;
    drawHeight *= this.backgroundImageScale;

    this.backgroundImageContext.clearRect(0, 0, this.backgroundImageCanvas.width, this.backgroundImageCanvas.height);

    this.backgroundImageContext.drawImage(image, x, y, drawWidth, drawHeight);
    this.backgroundImageTexture.needsUpdate = true;

    this.backgroundImageSet = true;
    this.backgroundImage.visible = true;
//    this.showBackgroundImage(true);

  },

  toggleBackgroundImage: function() {
    if(!this.backgroundImageSet) {
      this.editor.backgroundImage.start();
    }

    this.backgroundImage.visible = !this.backgroundImage.visible;
  },


  getXYGridPosition: function() {
    console.error('get xy grid position');
    return 0;
    return this.xyPosition;
  },

  moveXYGrid: function(direction) {
    var newPosition = this.xyPosition + direction;
    if(newPosition < 0 || newPosition >= this.depth) {
      return;
    }


    this.xyPosition = newPosition;
    this.xyMesh.position.z = this.xyPosition * this.cellSizeZ;
//    this.intersectionLine.position.z = this.xyMesh.position.z;

    $('#xyPosition').val(this.xyPosition);


    if(this.cursorCharacter) {
      this.setCursorPosition(
        this.cursorCharacter.gridX,
        this.cursorCharacter.gridY,
        newPosition        
        );
    }

  },

  setXYGridPosition: function(position) {
    var difference = position - this.xyPosition ;
    this.moveXYGrid(difference);
  },

  getXZGridPosition: function() {
    return this.xzPosition;
  },  

  setXZGridPosition: function(position) {
    var difference = position - this.xzPosition ;
    this.moveXZGrid(difference);
  },


  moveXZGrid: function(direction) {
    var newPosition = this.xzPosition + direction;
    if(newPosition < 0 || newPosition >= this.height) {
      return;
    }
    this.xzPosition = newPosition;

    if(this.handedness == 'right') {
      this.xzMesh.position.y = this.xzPosition * this.cellSizeY ;//- this.cellSize / 2;

    } else {
      this.xzMesh.position.y = this.height * this.cellSizeY - 1 - this.xzPosition * this.cellSizeY - this.cellSizeY / 2;
    }
//    this.intersectionLine.position.y = this.xzMesh.position.y;

    $('#xzPosition').val(this.xzPosition);

  },

  getXZGridPosition: function() {
    return this.xzPosition;
  },  

  getCursorEnabled: function() {
    if(this.cursorCharacter === null) {
      return false;
    }

    return this.cursorCharacter.visible;
  },

  setCursorEnabled: function(enabled) {
    if(this.cursorCharacter !== null && this.cursorCharacter.visible === enabled) {
      // already there.
//      return;
    }

    if(this.cursorCharacter !== null) {
      this.cursorCharacter.visible = enabled;
    }
    this.grid2d.setCursorEnabled(enabled);
  },


  setCursorPosition: function(x, y, z) {
    if(this.cursorCharacter == null) {
      return;
    }

    this.grid2d.setCursorPosition(x, y);

    this.cursorCharacter.position.x = x * this.cellSizeX + this.cellSizeX / 2;
    this.cursorCharacter.position.y = (y * this.cellSizeY + this.cellSizeY / 2);
    this.cursorCharacter.position.z = z * this.cellSizeZ + this.cellSizeZ / 2;

    this.cursorCharacter.gridX = x;
    this.cursorCharacter.gridY = y;
    this.cursorCharacter.gridZ = z;
  },

  setCursorRotation: function(rotX, rotY, rotZ) {
    if(this.cursorCharacter == null) {
      return;
    }

    this.cursorCharacter.rotation.x = rotX * Math.PI * 2;
    this.cursorCharacter.rotation.y = rotY * Math.PI * 2;
    this.cursorCharacter.rotation.z = rotZ * Math.PI * 2;

  },

  setCursorColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.grid2d.setCursorColor(color);

    if(this.cursorCharacter) {
      this.cursorCharacter.material.color.setHex(colorPalette.getHex(color));
      this.cursorCharacter.color = color;
    }

    if(this.typingCursor) {
      this.typingCursor.material = colorPalette.getMaterial(color);
    }
  },

  setCursorBGColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.grid2d.setCursorBGColor(color);

    // TODO need to add cursor background geometry
    /*
    if(this.cursorCharacter) {
      this.cursorCharacter.material.color.setHex(colorPalette.getHex(color));
      this.cursorCharacter.color = color;
    }
    */

  },




  setCursorCharacter: function(c, color) {
    this.grid2d.setCursorCharacter(c);

    var currentTile = this.editor.currentTile;

    if(typeof color == 'undefined') {
      color = currentTile.color;
    }

    return;

    if(this.cursorCharacter && (this.cursorCharacter.character != c
      || this.cursorCharacter.color != color
      )) {
      scene.remove(this.cursorCharacter);
      this.cursorCharacter = null;
    }

    if(!this.cursorCharacter) {
      var rgbColor = 0x000000;
      var material = null;

      if(color == -1) {
        // erase mode
        rgbColor = 0xffffff;
      } else {
        rgbColor = this.editor.colorPaletteManager.currentColorPalette.getHex(color);
      }
      material = new THREE.MeshPhongMaterial( { color: rgbColor, specular: 0, shininess: 0,  transparent: true, opacity: 0.6 });
      material.flatShading = true;

      var geometry = null;

      if(this.editor.tools.drawTools.tool == 'erase' 
          || this.editor.tools.drawTools.tool == 'eyedropper' 
          || this.editor.tools.drawTools.tool == 'type' 
          || !this.editor.tools.drawTools.drawCharacter) {
        c = -1;

        geometry = new THREE.BoxGeometry(this.cellSizeX, this.cellSizeY, this.cellSizeZ);
      } else {
        geometry = this.editor.tileSetManager.currentTileSet.getGeometry(c);
      }


      this.cursorCharacter = new THREE.Mesh(geometry, material);
      this.cursorCharacter.rotation.order = 'YXZ';

      this.cursorCharacter.castShadow  = false;

      if(this.editor.tools.drawTools.tool == 'erase' 
          || this.editor.tools.drawTools.tool == 'eyedropper' 
          || this.editor.tools.drawTools.tool == 'type'           
          || !this.editor.tools.drawTools.drawCharacter) {
        this.cursorCharacter.scale.x = 1.05;
        this.cursorCharacter.scale.y= 1.05;
        this.cursorCharacter.scale.z = 1.05;
      }

      scene.add(this.cursorCharacter);
    }

  },

  setCursorCharacterAndPosition: function(c, x, y, z, color) {
    var currentTile = this.editor.currentTile;
    if(typeof color == 'undefined') {
      color = currentTile.color;
    }

    if(typeof x == 'undefined') {
      x = 0;
      y = 0;
      z = 0;
      if(this.cursorCharacter) {
        x = this.cursorCharacter.gridX;
        y = this.cursorCharacter.gridY;
        z = this.cursorCharacter.gridZ;
      }
    }

    var bgColor = this.editor.currentTile.bgColor;
    // TODO: shouldn't set x, y here
    this.grid2d.setCursor(x, y, c, color, bgColor);

    this.setCursorCharacter(c);

/*
    if(this.editor.mode != 'select' && this.editor.mode != 'animation') {
      this.setCursorEnabled(true);
    }
*/

    /*
    this.cursorCharacter.position.x = x * this.cellSizeX + this.cellSizeX / 2;
    this.cursorCharacter.position.y = (y * this.cellSizeY + this.cellSizeY / 2);
    this.cursorCharacter.position.z = z * this.cellSizeZ + this.cellSizeZ / 2;

    this.cursorCharacter.rotation.x = currentTile.rotX * Math.PI * 2;
    this.cursorCharacter.rotation.y = currentTile.rotY * Math.PI * 2;
    this.cursorCharacter.rotation.z = currentTile.rotZ * Math.PI * 2;

    this.cursorCharacter.gridX = x;
    this.cursorCharacter.gridY = y;
    this.cursorCharacter.gridZ = z;
    this.cursorCharacter.character = c;
    this.cursorCharacter.color = color;

    */
  },

  setCursorCell: function(character, color, bgColor) {

    if(!this.cursorCharacter) {
      return;
    }

    if(!this.cursorEnabled) {
      return;
    }

    if(typeof character == 'undefined') {

      character = this.editor.currentTile.character;
    }

    if(typeof color == 'undefined') {
      color = this.editor.currentTile.color;
    }

    if(typeof bgColor == 'undefined') {
      bgColor = this.editor.currentTile.bgColor;
    }


    var rotX = this.editor.currentTile.rotX;
    var rotY = this.editor.currentTile.rotY;
    var rotZ = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;

    var characters = this.editor.currentTile.characters;
    var args = {};
    args.fc = color;
    args.bc = bgColor;
    args.update = false;

    args.fh = fh;
    args.fv = fv;
    args.rz = rotZ;

    for(var currentTileY = 0; currentTileY < characters.length; currentTileY++) {
      for(var currentTileX = 0; currentTileX < characters[currentTileY].length; currentTileX++) {
        var x = this.cursorCharacter.gridX + currentTileX;
        var y = this.cursorCharacter.gridY + (characters.length - currentTileY - 1);
        var z = this.cursorCharacter.gridZ;

        if(   x !== false && x >= 0 && x < this.width
           && y !== false && y >= 0 && y < this.height
           && z !== false && z >= 0 && z < this.depth) {

          args.x = x;
          args.y = y;
          args.z = z;

          args.c = characters[currentTileY][currentTileX];

          if(!this.editor.tools.drawTools.drawCharacter) {
            args.c = this.gridData[z][y][x].c;


            args.rx = this.gridData[z][y][x].rx;
            args.ry = this.gridData[z][y][x].ry;
            args.rz = this.gridData[z][y][x].rz;

            args.fh = this.gridData[z][y][x].fh;
            args.fv = this.gridData[z][y][x].fv;
          }

          if(!this.editor.tools.drawTools.drawColor) {
            args.fc = this.gridData[z][y][x].fc;
          }
          if(!this.editor.tools.drawTools.drawBgColor) {
            args.bc = this.gridData[z][y][x].bc;
          }

          this.setCell(args);
        }

      }
    }

    this.update();

  },

  eyedropperCursorCell: function() {

    if(!this.cursorCharacter) {
      return;
    }

    if(!this.cursorEnabled) {
      return;
    }

    var x = this.cursorCharacter.gridX;
    var y = this.cursorCharacter.gridY;
    var z = this.cursorCharacter.gridZ;

    if(   x === false || x < 0 || x >= this.width
       || y === false || y < 0 || y >= this.height
       || z === false || z < 0 || z >= this.depth) {
      return;
    }

    if(this.editor.tools.drawTools.drawCharacter) {
      var character = this.gridData[z][y][x].c;
      this.editor.currentTile.setCharacter(character);
    }

    if(this.editor.tools.drawTools.drawColor) {
      var color = this.gridData[z][y][x].fc;
      this.editor.currentTile.setColor(color);
    }

    if(this.editor.tools.drawTools.drawBGColor) {
      var bgColor = this.gridData[z][y][x].bc;
      this.editor.currentTile.setBGColor(bgColor);
    }

    if(this.editor.tools.drawTools.tilePalette) {
      this.editor.tools.drawTools.tilePalette.drawCharPalette();
      this.editor.sideTilePalette.drawCharPalette();
    }
  },

  eraseCursorCell: function() {
    this.eraseCell(this.cursorCharacter.gridX, this.cursorCharacter.gridY, this.cursorCharacter.gridZ);
  },


  eraseCell: function(x, y, z) {
    if(x < 0 || x >= this.width
      || y < 0 || y >= this.height
      || z < 0 || z >= this.depth) {
      return;
    }

    var args = {};
    args.x = x;
    args.y = y;
    args.z = z;

    args.c = this.gridData[z][y][x].c;
    if(this.editor.tools.drawTools.drawCharacter) {
      args.c = this.editor.tileSetManager.blankCharacter;
    }
    
    args.fc = this.gridData[z][y][x].fc;
    if(this.editor.tools.drawTools.drawColor) {
      args.fc = this.editor.tools.currentBackgroundColor;
    } 

    args.bc = this.gridData[z][y][x].bc;
    if(this.editor.tools.drawTools.drawBGColor) {
      args.bc = this.editor.colorPaletteManager.noColor;
    }     

    args.rx = 0;
    args.ry = 0;
    args.rz = 0;
    args.fh = 0;
    args.fv = 0;

    this.setCell(args);

  },

  setBackgroundColor: function(color) {
    // TODO: implement..
  },

  setGridGhostData: function(gridData, holder) {
    // TODO: implement.
  },

  setGridData: function(gridData, holder) {

    // TODO: if 2d, don't care about the holder/etc stuff

    this.changingGridData = true;

    if(this.gridData) {
      scene.remove(this.holder);
      this.holder.visible = false;
    }

    this.holder = holder;
    if(holder) {
      scene.add(holder);
      holder.visible = true;
    }
    this.gridData = gridData;


/*
    // if this was a ghost frame, set the materials back
    if(typeof holder.ghostFrame !== 'undefined' && holder.ghostFrame) {

      console.log('set grid data ghost frame..');
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();      
      for(var z = 0; z < this.depth; z++) {
        for(var y = 0; y < this.height; y++) {
          for(var x = 0; x < this.width; x++) {
            if(this.gridData[z][y][x].mesh) {
              this.gridData[z][y][x].mesh.material = colorPalette.getMaterial(this.gridData[z][y][x].fc);
              //this.materials[this.gridData[z][y][x].color];
            }            
          }      
        }        
      }
    }

    holder.ghostFrame = false;

*/

    this.changingGridData = false;
  },


  getWidth: function() {
    return this.width;
  },

  getHeight: function() {
    return this.height;
  },

  // args.c - character
  // args.x - x pos
  // args.y - y pos
  // args.z - z pos
  // args.fc - foreground color
  // args.bc - background color
  // args.rx - rotation x
  // args.ry - rotation y
  // args.rz - rotation z
  // args.update - gridview needs to be updated

  setCell: function(args) {
    console.error("?????");
    this.editor.frames.setCell(args);

    // whether to redraw the grid.
    var update = true;
    if(typeof args.update !== 'undefined') {
      update = args.update;
    }


    if(update) {
      var x = args.x;
      var y = args.y;
      var z = args.z;
      
      this.grid2d.update();
    }

  },


  getUpdateEnabled: function(updateEnabled) {
    return this.editor.graphic.getDrawEnabled();

//    return this.updateEnabled;
    
  },
  setUpdateEnabled: function(updateEnabled) {
    this.editor.graphic.setDrawEnabled(updateEnabled);
//    this.updateEnabled = updateEnabled;

  },

  update: function(args) {

//    console.log('update called ' + this.updateEnabled);
    if(this.editor.type == '2d' && this.updateEnabled) {

      // need to update layer preview first cos of selection.(not sure why)
      this.grid2d.update(args);
      this.editor.layers.updateLayerPreview();
    }
  }

}
