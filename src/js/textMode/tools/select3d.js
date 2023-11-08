var Select3d = function() {
  this.selectionMesh = null;
  this.selectionDragControls = null;
  this.selectionDragArrows = null;
  this.selectionDragMode = '';
  this.selectionOffsetX = 0;
  this.selectionOffsetY = 0;

  this.clipboardData = [];

  this.enabled = true;

}

Select3d.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

  },

  createMesh: function() {
    var grid3d = this.editor.grid3d;
    var scene = grid3d.scene;

    // create selection mesh
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshPhongMaterial( { 
                                  color: 0xffffff, 
                                  specular: 0, 
                                  shininess: 0, 
                                  transparent: true, 
                                  opacity: 0.3 });
    material.flatShading = true;

    this.selectionMesh = new THREE.Mesh(geometry, material);
    this.selectionMesh.frustumCulled = false;
    this.selectionMesh.visible = false;
    scene.add(this.selectionMesh);

    this.setupSelectionDragControls();
  },


  setupSelectionDragControls: function() {
    var grid3d = this.editor.grid3d;
    var scene = grid3d.scene;


    this.selectionDragArrows = [];

    this.selectionDragControls = new THREE.Object3D();
    this.selectionDragControls.position.x = 20;
    this.selectionDragControls.position.y = 20;
    this.selectionDragControls.position.z = 30;

    scene.add(this.selectionDragControls);

    // CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
    var dragUpGeometry = new THREE.CylinderGeometry(0, 0.8, 2, 4, 1);
    var material = new THREE.MeshPhongMaterial( { 
                                    color: 0xff0000, 
                                    specular: 0, 
                                    shininess: 0, 
                                    transparent: false, 
                                    opacity: 0.6 });
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
    var material = new THREE.MeshPhongMaterial( { 
                                color: 0x00ff00, 
                                specular: 0, 
                                shininess: 0, 
                                transparent: false, 
                                opacity: 0.6 });

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
    var material = new THREE.MeshPhongMaterial( { 
                                  color: 0x0000ff, 
                                  specular: 0, 
                                  shininess: 0, 
                                  transparent: false, 
                                  opacity: 0.6 });
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


  setSelectionFromInput: function() {

    var min = new THREE.Vector3();
    var max = new THREE.Vector3();

    min.x = parseInt($('#selectX1').val());
    min.y = parseInt($('#selectY1').val());
    min.z = parseInt($('#selectZ1').val());

    if(isNaN(min.x) || isNaN(min.y) || isNaN(min.z)) {
      return;
    }

    max.x = parseInt($('#selectX2').val());
    max.y = parseInt($('#selectY2').val());
    max.z = parseInt($('#selectZ2').val());

    if(isNaN(max.x) || isNaN(max.y) || isNaN(max.z)) {
      return;
    }

    if(max.z > min.z) {
      max.z++;
    }

    if(min.z > max.z) {
      min.z++;
    }

    this.setSelection(min, max, false);

  },

  nudgeSelection: function(x, y, z) {
    var min = new THREE.Vector3();
    var max = new THREE.Vector3();

    min.x = this.selectionMesh.minX + x;
    min.y = this.selectionMesh.minY + y;
    min.z = this.selectionMesh.minZ + z;

    max.x = this.selectionMesh.maxX + x - 1;
    max.y = this.selectionMesh.maxY + y - 1;
    max.z = this.selectionMesh.maxZ + z;

    this.setSelection(min, max);


  },


  selectAll: function() {

    var min = { "x": 0, "y": 0, "z": 0 };
    var max = { "x": this.width, "y": this.height, "z": this.depth };

    if(this.editor.layoutType == '2d') {
      min.z = this.xyPosition;
      max.z = this.xyPosition + 1;

    }
    this.setSelection(min, max, true);


  },

  unselectAll: function() {
    

    var min = { "x": 0, "y": 0, "z": 0 };
    var max = { "x": 0, "y": 0, "z": 0 };
    this.setSelection(min, max, true);

    this.enabled = false;
    this.selectionMesh.visible = false;
    this.selectionDragControls.visible = false;
  },

  startSelection: function(x, y, z) {

    console.log('start selection: ' + x + ',' + y + ',' + z);
    if(!this.selectionMesh) {
      this.createMesh();
    }

    this.setSelection(
      { x: x, y: y, z: z },
      { x: x, y: y, z: z }
    );

    this.selectionStartX = x;
    this.selectionStartY = y;
    this.selectionStartZ = z;
  },

  selectionTo: function(x, y, z) {
    
    this.setSelection(
      { x: this.selectionStartX, y: this.selectionStartY, z: this.selectionStartZ },
      { x: x, y: y, z: z }
    );

  },



  // update input = update input controls for entering selection
  setSelection: function(min, max, updateInput) {

    var grid3d = this.editor.grid3d;

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
    }    



    if(minZ > maxZ) {
      minZ = max.z - 1;

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


//    console.log('miny = ' + minY + 'maxY = ' + maxY);



/*
    if(minZ > maxZ) {
      minZ = maxZ;
      maxZ = min.z;
    }


    if(minZ == maxZ) {
      maxZ += 1;
    }
*/
//    maxY += 1;

    this.selectionMesh.minX = minX;
    this.selectionMesh.minY = minY;
    this.selectionMesh.minZ = minZ;

    this.selectionMesh.maxX = maxX+1;
    this.selectionMesh.maxY = maxY+1;
    this.selectionMesh.maxZ = maxZ+1;



    var offset = 0.1;


    maxY += 1;
    maxX += 1;
    maxZ += 1;

    // view coords are top left is 0, 0
    //handedness
    var temp = maxY;
//    maxY = this.height - minY;
//    minY = this.height - temp;

    minX *= grid3d.getCellSizeX();
    minY *= grid3d.getCellSizeY();
    minZ *= grid3d.getCellSizeZ();

    maxX *= grid3d.getCellSizeX();
    maxY *= grid3d.getCellSizeY();
    maxZ *= grid3d.getCellSizeZ();


    minX -= offset;
    minY -= offset;
    minZ -= offset;

    maxX += offset;
    maxY += offset;
    maxZ += offset;

    var selectionGeometry = this.selectionMesh.geometry;
    var selectionMesh = this.selectionMesh;



    selectionGeometry.vertices[0].x = maxX;
    selectionGeometry.vertices[0].y = maxY;
    selectionGeometry.vertices[0].z = maxZ;

    selectionGeometry.vertices[1].x = maxX;
    selectionGeometry.vertices[1].y = maxY;
    selectionGeometry.vertices[1].z = minZ;

    selectionGeometry.vertices[2].x = maxX;
    selectionGeometry.vertices[2].y = minY;
    selectionGeometry.vertices[2].z = maxZ;

    selectionGeometry.vertices[3].x = maxX;
    selectionGeometry.vertices[3].y = minY;
    selectionGeometry.vertices[3].z = minZ;

    selectionGeometry.vertices[4].x = minX;
    selectionGeometry.vertices[4].y = maxY;
    selectionGeometry.vertices[4].z = minZ;

    selectionGeometry.vertices[5].x = minX;
    selectionGeometry.vertices[5].y = maxY;
    selectionGeometry.vertices[5].z = maxZ;

    selectionGeometry.vertices[6].x = minX;
    selectionGeometry.vertices[6].y = minY;
    selectionGeometry.vertices[6].z = minZ;

    selectionGeometry.vertices[7].x = minX;
    selectionGeometry.vertices[7].y = minY;
    selectionGeometry.vertices[7].z = maxZ;

    selectionGeometry.verticesNeedUpdate = true;

    if(typeof updateInput == 'undefined' || updateInput == true) {
      $('#selectX1').val(selectionMesh.minX);
      $('#selectY1').val(selectionMesh.minY);
      $('#selectZ1').val(selectionMesh.minZ);

      $('#selectX2').val(selectionMesh.maxX - 1);
      $('#selectY2').val(selectionMesh.maxY - 1);
      $('#selectZ2').val(selectionMesh.maxZ - 1);
    }


    selectionMesh.position.x = 0;
    selectionMesh.position.y = 0;
    selectionMesh.position.z = 0;

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

//    selectionMesh.visible = true;

    this.enabled = true;
    this.selectionMesh.visible = true;
    this.selectionDragControls.visible = true;


  },


  offsetSelectionBy: function(xOffset, yOffset, zOffset) {

    console.log('offset selectin by ' + yOffset);
    var grid3d = this.editor.grid3d;

    var cellSizeX = grid3d.getCellSizeX();
    var cellSizeY = grid3d.getCellSizeY();
    var cellSizeZ = grid3d.getCellSizeZ();


    var selectionMesh = this.selectionMesh;

    selectionMesh.position.x = xOffset * cellSizeX;
    selectionMesh.position.y = yOffset * cellSizeY;
    selectionMesh.position.z = zOffset * cellSizeZ;

    selectionMesh.offsetX = xOffset;
    selectionMesh.offsetY = yOffset;
    selectionMesh.offsetZ = zOffset;


    this.selectionDragControls.position.x = this.selectionDragControls.originalPosition.x + xOffset * cellSizeX;
    this.selectionDragControls.position.y = this.selectionDragControls.originalPosition.y + yOffset * cellSizeY;
    this.selectionDragControls.position.z = this.selectionDragControls.originalPosition.z + zOffset * cellSizeZ;


    var width = selectionMesh.maxX - selectionMesh.minX;
    var depth = selectionMesh.maxZ - selectionMesh.minZ;
    var height = selectionMesh.maxY - selectionMesh.minY;

    
    for(var z = 0; z < depth; z++) {
      for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
//          var cell = grid3d.gridData[selectionMesh.minZ + z][selectionMesh.minY + y][selectionMesh.minX + x];
          var cell = grid3d.getCell(selectionMesh.minX + x, selectionMesh.minY + y, selectionMesh.minZ + z);
          //console.log(cell.t);
          if(cell && cell.t >= 0) {
            //console.log(cell);  
            var mesh = grid3d.getCellMesh(selectionMesh.minX + x, selectionMesh.minY + y, selectionMesh.minZ + z);
            mesh.position.x = mesh.originalPosition.x + xOffset * cellSizeX;
            mesh.position.y = mesh.originalPosition.y + yOffset * cellSizeY;
            mesh.position.z = mesh.originalPosition.z + zOffset * cellSizeZ;
          }
        }
      }
    }
    


  },



  mouseDown: function(x,y, gridView3d) {
    if(!this.selectionDragControls) {
      return false;
    }

    this.mouseDownX = x;
    this.mouseDownY = y;


    var grid3d = this.editor.grid3d;
    y = gridView3d.height - y;

    var grid3d = this.editor.grid3d;

    this.mouse.x = (x / gridView3d.width) * 2 - 1;
    this.mouse.y = (y / gridView3d.height) * 2 - 1;


    this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

    this.dragUpControl.scale.x = 1;
    this.dragUpControl.scale.y = 1;
    this.dragUpControl.scale.z = 1;


    this.dragRightControl.scale.x = 1;
    this.dragRightControl.scale.y = 1;
    this.dragRightControl.scale.z = 1;


    var objects = Array();
    objects = this.raycaster.intersectObjects(this.selectionDragArrows);
    if(objects.length > 0) {
      var object = objects[0].object;
      object.scale.x = 1.2;
      object.scale.y = 1.2;
      object.scale.z = 1.2;

      this.dragArrowsMouseDownX = x;//this.mouse.x;
      this.dragArrowsMouseDownY = y;//this.mouse.y;

      this.selectionDragMode = object.dragType;

      if(object.dragType == 'dragRight' || object.dragType == 'dragUp') {
        // find where the mouse intersects the drag plane
        var dragPlaneZ = this.selectionDragControls.position.z;

        var ray = this.raycaster.ray;
        var factor = (dragPlaneZ - ray.origin.z) / ray.direction.z;

        var x = ray.origin.x + ray.direction.x * factor;
        var y = ray.origin.y + ray.direction.y * factor;

        this.dragArrowsMouseDownX = x;
        this.dragArrowsMouseDownY = y;
        this.selectPositionX = this.selectionMesh.position.x;
        this.selectPositionY = this.selectionMesh.position.y;
      }


      if(object.dragType == 'dragForward') {
        var dragPlaneY = this.selectionDragControls.position.y;

        var ray = this.raycaster.ray;
        var factor = (dragPlaneY - ray.origin.y) / ray.direction.y;

        var z = ray.origin.z + ray.direction.z * factor;
        var x = ray.origin.x + ray.direction.x * factor;

        this.dragArrowsMouseDownZ = z;
        this.dragArrowsMouseDownX = x;
        this.selectPositionZ = this.selectionMesh.position.z;
        this.selectPositionX = this.selectionMesh.position.x;

      }


      return true;
    }

    this.selectionDragMode = '';
    return false;

  },

  mouseMove: function(x,y, gridView3d) {

    if(!this.selectionDragControls) {
      return;
    }

    y = gridView3d.height - y;

    var grid3d = this.editor.grid3d;

    this.mouse.x = (x / gridView3d.width) * 2 - 1;
    this.mouse.y = (y / gridView3d.height) * 2 - 1;


    // is the selection being dragged??
    if(this.selectionDragMode != '') {

      // dragging the selection vertically
      if(this.selectionDragMode == 'dragUp') {

        this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

        // find where the mouse intersects the drag plane
        var dragPlaneZ = this.selectionDragControls.position.z;

        var ray = this.raycaster.ray;
        // find out where it intersects ground;

        var factor = (dragPlaneZ - ray.origin.z) / (ray.direction.z);
        var x = ray.origin.x + ray.direction.x * factor;
        var y = ray.origin.y + ray.direction.y * factor;


        var yDiff = Math.floor(y / grid3d.getCellSizeY()) - Math.floor(this.dragArrowsMouseDownY / grid3d.getCellSizeY());

        this.offsetSelectionBy(0, yDiff, 0);
        return true;
      }


      // dragging the selection horizontally
      if(this.selectionDragMode == 'dragRight') {

        this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

        // find where the mouse intersects the drag plane
        var dragPlaneZ = this.selectionDragControls.position.z;

        var ray = this.raycaster.ray;
        // find out where it intersects ground;
        var factor = (dragPlaneZ - ray.origin.z) / (ray.direction.z);
        var x = ray.origin.x + ray.direction.x * factor;
        var y = ray.origin.y + ray.direction.y * factor;

        var xDiff = Math.floor(x / grid3d.getCellSizeX()) - Math.floor(this.dragArrowsMouseDownX / grid3d.getCellSizeX());

        this.offsetSelectionBy(xDiff, 0, 0);
        return true;
      }      


      if(this.selectionDragMode == 'dragForward') {

        this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

        // find where the mouse intersects the drag plane
        var dragPlaneY = this.selectionDragControls.position.y;

        var ray = this.raycaster.ray;
        // find out where it intersects ground;

        var factor = (dragPlaneY - ray.origin.y) / (ray.direction.y);
        var z = ray.origin.z + ray.direction.z * factor;
        var x = ray.origin.x + ray.direction.x * factor;


        var zDiff = Math.floor(z / grid3d.getCellSizeZ()) - Math.floor(this.dragArrowsMouseDownZ / grid3d.getCellSizeZ());

        this.offsetSelectionBy(0, 0, zDiff);
        return true;
      }
    }

    //chech if mouse over drag arrows
    this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

    this.dragUpControl.scale.x = 1;
    this.dragUpControl.scale.y = 1;
    this.dragUpControl.scale.z = 1;

    this.dragRightControl.scale.x = 1;
    this.dragRightControl.scale.y = 1;
    this.dragRightControl.scale.z = 1;


    this.dragForwardControl.scale.x = 1;
    this.dragForwardControl.scale.y = 1;
    this.dragForwardControl.scale.z = 1;


    var objects = Array();
    objects = this.raycaster.intersectObjects(this.selectionDragArrows);
    if(objects.length > 0) {

      var object = objects[0].object;
      object.scale.x = 1.2;
      object.scale.y = 1.2;
      object.scale.z = 1.2;

      this.selectionDragMode = object.dragType + 'Over';
    }

    return false;
  },  



  mouseUp: function(x, y, gridView3d) {
    if(!this.selectionDragControls) {
      return;
    }

    if(x == this.mouseDownX && y == this.mouseDownY) {
      this.unselectAll();
    }

    y = gridView3d.height - y;

    var grid3d = this.editor.grid3d;

    this.mouse.x = (x / gridView3d.width) * 2 - 1;
    this.mouse.y = (y / gridView3d.height) * 2 - 1;


    this.raycaster.setFromCamera(this.mouse, gridView3d.camera);

    if(this.selectionDragMode == 'dragRight' || this.selectionDragMode == 'dragUp' || this.selectionDragMode == 'dragForward') {

//      this.editor.grid.clearCellOffsets();
      var offsetX = this.selectionMesh.offsetX;
      var offsetY = this.selectionMesh.offsetY;
      var offsetZ = this.selectionMesh.offsetZ;

      if(offsetX != 0 || offsetY != 0 || offsetZ != 0) {
        this.offsetSelectionBy(0, 0, 0);

        this.cut(); 
        this.nudgeSelection(offsetX, offsetY, offsetZ);
        this.paste();
      }

    }

    this.selectionDragMode = '';

    return;

  },  



  clear: function() {
    var noTile = this.editor.tileSetManager.noTile;
    var grid3d = this.editor.grid3d;

    this.editor.history.startEntry('Clear');
    var selection = this.selectionMesh;
    for(var z = selection.minZ; z < selection.maxZ; z++) {
      for(var y = selection.minY; y < selection.maxY; y++) {
        for(var x = selection.minX; x < selection.maxX; x++) {
          grid3d.setCell({
            x: x, y: y, z: z,
            t: noTile
          });
        }
      }
    }
    this.editor.history.endEntry();

  },

  cut: function() {

    this.copy();
    this.clear();

  },

  copy: function() {
    var noTile = this.editor.tileSetManager.noTile;
    var selection = this.selectionMesh;
    var grid3d = this.editor.grid3d;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var gridDepth = grid3d.getGridDepth();

    this.clipboardData = [];

    var width = selection.maxX - selection.minX;
    var depth = selection.maxZ - selection.minZ;
    var height = selection.maxY - selection.minY;

    for(var z = 0; z < depth; z++) {
      this.clipboardData[z] = [];
      for(var y = 0; y < height; y++) {
        this.clipboardData[z][y] = [];
        for(var x = 0; x < width; x++) {

          if(selection.minZ + z >= 0 && selection.minZ + z < gridDepth
             && selection.minY + y >= 0 && selection.minY + y < gridHeight
             && selection.minX + x >= 0 && selection.minX + x < gridWidth) {

            var cell = grid3d.getCell(selection.minX + x, selection.minY + y, selection.minZ + z);
            this.clipboardData[z][y][x] = { t: cell.t, 
                                  fc: cell.fc,
                                  bc: cell.bc, 
                                  rx: cell.rx, 
                                  ry: cell.ry,
                                  rz: cell.rz };
          } else {
            this.clipboardData[z][y][x] = {
              t: noTile,
              fc: 0,
              bc: 0,
              rx: 0,
              ry: 0,
              rz: 0

            
            }
          }
        }
      }
    }


  },

  paste: function(args) {
    if(typeof args == 'undefined') {
      args = {};
    }

    var noTile = this.editor.tileSetManager.noTile;
    var grid3d = this.editor.grid3d;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var gridDepth = grid3d.getGridDepth();

    var pasteWhitespace = true;
    var pasteOnWhitespaceOnly = false;

//    pasteWhitespace = $('#pasteWhitespace').is(':checked');

//    var pasteOnWhitespaceOnly = $('#pasteOnWhitespace').is(':checked');

    this.editor.history.startEntry('Paste');
    var selection = this.selectionMesh;

//    var pasteRotation = parseInt($('#pasteRotation').val());
    var pasteRotation = false;

    var clipboardData = this.clipboardData;
    console.log(clipboardData);


    for(var z = 0; z < clipboardData.length; z++) {
      for(var y = 0; y < clipboardData[z].length; y++) {
        for(var x = 0; x < clipboardData[z][y].length; x++) {



          var t = clipboardData[z][y][x].t;
          var fc = clipboardData[z][y][x].fc;
          var bc = clipboardData[z][y][x].bc;
          var rx = clipboardData[z][y][x].rx;
          var ry = clipboardData[z][y][x].ry;
          var rz = clipboardData[z][y][x].rz;
/*
          if(args.hflip) {
            var charX = this.data[z][y].length - 1 - x;
            character = this.data[z][y][charX].character;
            character = this.editor.petscii.getFlipHChar(character);
            color = this.data[z][y][charX].color;
            rotX = this.data[z][y][charX].rotX;
            rotY = this.data[z][y][charX].rotY;
            rotZ = this.data[z][y][charX].rotZ;
            bgColor = this.data[z][y][charX].bgColor;
          }

          if(args.vflip) {
            var charY = this.data[z].length - 1 - y;
            character = this.data[z][charY][x].character;
            character = this.editor.petscii.getFlipVChar(character);
            color = this.data[z][charY][x].color;
            rotX = this.data[z][charY][x].rotX;
            rotY = this.data[z][charY][x].rotY;
            rotZ = this.data[z][charY][x].rotZ;
            bgColor = this.data[z][charY][x].bgColor;

          }
*/

          var pasteX = x;
//          var pasteY = y - 1;//-this.data[z].length  + y;

//          var pasteY = -this.data[z].length  + y;
          var pasteY = y - clipboardData[z].length;;
          var pasteZ = z;

          /*
          switch(pasteRotation) {
            case 90:
              rotY += 0.75;
              pasteX = z;
              pasteZ = x;
              break;
            case 180:
              rotY += 0.5;
              pasteX = -x;
              pasteZ = z;
              break;
            case 270:
              rotY += 0.75;
              pasteX = z;
              pasteZ = -x;
              break;
          }
          */

          /*
          while(rotY >= 1) {
            rotY -= 1;
          }

          while(rotY < 0) {
            rotY += 1;
          }
*/
          pasteX += selection.minX;
//          pasteY += selection.minY + 1;
          pasteY += selection.maxY ;

          pasteZ += selection.minZ;
          if(pasteX >= 0 && pasteY >= 0 && pasteZ >= 0 
            && pasteX < gridWidth && 
            pasteY < gridHeight
            && pasteZ < gridDepth) {

            var cell = grid3d.getCell(pasteX, pasteY, pasteZ);

            if(cell.t == noTile || !pasteOnWhitespaceOnly) {

              if(t != noTile || pasteWhitespace) {
                grid3d.setCell({
                  x: pasteX, 
                  y: pasteY,
                  z: pasteZ,
                  t: t,
                  fc: fc,
                  bc: bc,
                  rx: rx,
                  ry: ry,
                  rz: rz
                });
              }
            }
          }
        }
      }
    }
    this.editor.history.endEntry();
  },




}