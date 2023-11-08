var Tile3d = function() {
  this.tileSet = null;

  this.geometry = null;
  this.numberOfVertices = 0;
  this.groupStart = 0;
  this.indices = [];
  this.vertices = [];
  this.normals = [];
  this.uvs = [];  
}

Tile3d.prototype = {
  init: function(tileSet) {
    this.tileSet = tileSet;
  },

  // generate 3d geometry for a character, from 2d image data
  generateTileGeometry: function(ch) {
    var tileSet = this.tileSet;

    if(ch < tileSet.geometryDirty.length && tileSet.geometryDirty[ch] == false) {
      return;
    }

    while(ch >= tileSet.geometryDirty.length) {
      tileSet.geometryDirty.push(true);
    }

    var frame = 'current';

    var tileGeometry = new THREE.BufferGeometry();

//    var gridCellSizeX = this.charWidth * this.pixelWidth * this.pixelTo3dUnits;
//    var gridCellSizeY = this.charHeight * this.pixelHeight * this.pixelTo3dUnits;
    var gridCellSizeZ = tileSet.charDepth * tileSet.pixelDepth * tileSet.pixelTo3dUnits;

    var tileHeight = tileSet.getTileHeight();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight3d = tileHeight * tileSet.pixelTo3dUnits;
    var tileWidth3d = tileWidth * tileSet.pixelTo3dUnits;

    this.indices = [];
    this.vertices = [];
    this.normals = [];
    this.uvs = [];  
    this.numberOfVertices = 0;
    this.groupStart = 0;
 
  
    for(var y = 0; y < tileHeight; y++) {
      for(var x = 0; x < tileWidth; x++) {
        var pixel = tileSet.getPixel(ch, x, y, frame) > 0;
        if(pixel) {
          var above = false;
          var below = false;
          var left = false;
          var right = true;

          if(y > 0) {
            above = tileSet.getPixel(ch, x, y - 1, frame) > 0;
          }

          if(y < tileSet.charHeight - 1) {
            below = tileSet.getPixel(ch, x, y + 1, frame) > 0;
          }


          if(x > 0) {
            left = tileSet.getPixel(ch, x - 1, y, frame) > 0;
          }

          if(x < tileWidth - 1) {
            right = tileSet.getPixel(ch, x + 1, y, frame) > 0;
          }
          // geometry represents one pixel

          var width = tileSet.pixelTo3dUnits;
          var depth = gridCellSizeZ;
          var height = tileSet.pixelTo3dUnits;
          var widthSegments = 1;
          var depthSegments = 1;
          var heightSegments = 1;

          var offsetX = x * width - tileWidth3d / 2;
          var offsetY = (tileHeight - y - 1) * height - tileHeight3d / 2;
          var offsetZ = 0;

          //buildPlane: function( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex ) {

          // right side
          if(!right) {
            
            this.buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0, offsetX, offsetY, offsetZ ); // px
          }

          // left side
          if(!left) {
            this.buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1 ,  offsetX, offsetY, offsetZ); // nx
          }

          // top side
          if(!above) {
            this.buildPlane( 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2, offsetX, offsetY, offsetZ ); // py
          }
          
          // bottom side
          if(!below) {
            this.buildPlane( 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3, offsetX, offsetY, offsetZ ); // ny          
          }

          // front
          this.buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4, offsetX, offsetY, offsetZ ); // pz

          // back
          this.buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5, offsetX, offsetY, offsetZ ); // nz
        }

      }
    }

    //BufferGeometryUtils.mergeBufferGeometries(tileGeometry);
//    tileGeometry = THREE.BufferGeometryUtils.mergeVertices(tileGeometry);


    tileGeometry.setIndex( this.indices );
    tileGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
    tileGeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( this.normals, 3 ) );
    tileGeometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( this.uvs, 2 ) );
    //tileGeometry =

    tileSet.characterGeometries[ch] =  THREE.BufferGeometryUtils.mergeVertices(tileGeometry);
    tileSet.geometryDirty[ch] = false;
    
    //charGeometry.mergeVertices();

//    charGeometry.rotateX(Math.PI / 2);
         /*
    this.characterGeometries[ch].vertices = charGeometry.vertices;
    this.characterGeometries[ch].faces = charGeometry.faces;
    this.characterGeometries[ch].verticesNeedUpdate = true;
    this.characterGeometries[ch].elementsNeedUpdate =true;
    */
  },


  buildPlane: function( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex, offsetX, offsetY, offsetZ ) {

    var segmentWidth = width / gridX;
    var segmentHeight = height / gridY;

    var widthHalf = width / 2;
    var heightHalf = height / 2;
    var depthHalf = depth / 2;

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var vertexCounter = 0;
    var groupCount = 0;

    var vector = new THREE.Vector3();

    // generate vertices, normals and uvs

    for ( var iy = 0; iy < gridY1; iy ++ ) {

      var y = iy * segmentHeight - heightHalf;

      for ( var ix = 0; ix < gridX1; ix ++ ) {

        var x = ix * segmentWidth - widthHalf;

        // set values to correct vector component

        vector[ u ] = x * udir;
        vector[ v ] = y * vdir;
        vector[ w ] = depthHalf;

        // now apply vector to vertex buffer

        vector.set(vector.x + offsetX, vector.y + offsetY, vector.z + offsetZ);

        this.vertices.push( vector.x, vector.y, vector.z );

        // set values to correct vector component

        vector[ u ] = 0;
        vector[ v ] = 0;
        vector[ w ] = depth > 0 ? 1 : - 1;

        // now apply vector to normal buffer

        this.normals.push( vector.x, vector.y, vector.z );

        // uvs

        this.uvs.push( ix / gridX );
        this.uvs.push( 1 - ( iy / gridY ) );

        // counters

        vertexCounter += 1;

      }

    }

    // indices

    // 1. you need three indices to draw a single face
    // 2. a single segment consists of two faces
    // 3. so we need to generate six (2*3) indices per segment

    for ( var iy = 0; iy < gridY; iy ++ ) {

      for ( var ix = 0; ix < gridX; ix ++ ) {

        var a = this.numberOfVertices + ix + gridX1 * iy;
        var b = this.numberOfVertices + ix + gridX1 * ( iy + 1 );
        var c = this.numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
        var d = this.numberOfVertices + ( ix + 1 ) + gridX1 * iy;

        // faces

        this.indices.push( a, b, d );
        this.indices.push( b, c, d );

        // increase counter

        groupCount += 6;

      }

    }

    // add a group to the geometry. this will ensure multi material support

    //scope.addGroup( groupStart, groupCount, materialIndex );

    // calculate new start value for groups

    this.groupStart += groupCount;

    // update total number of vertices

    this.numberOfVertices += vertexCounter;

  }
}