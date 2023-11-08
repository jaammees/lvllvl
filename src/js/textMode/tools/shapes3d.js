var Shapes3d = function() {
  this.editor = null;

  this.grid = null;
  this.width = 0;
  this.height = 0;
  this.depth = 0;


  this.shape = '';
  this.fromX = false;
  this.fromY = false;
  this.fromZ = false;

  this.holder = null;
  this.meshes = [];
}

Shapes3d.prototype = {
  init: function(editor, scene) {
    this.editor = editor;

    this.width = 40;
    this.height = 25;
    this.depth = 1;

    this.resizeGrid();

    this.holder = new THREE.Object3D();
    scene.add(this.holder);
  },

  resizeGrid: function() {
    this.grid = [];
    for(var y = 0; y < this.height; y++) {
      var row = [];
      for(var x = 0; x < this.width; x++) {
        row.push({ character: false, color: false, bgColor: false });
      }
      this.grid.push(row);
    }
  },

  clearGrid: function() {
    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        this.grid[y][x].character = false;
        this.grid[y][x].color = false;
        this.grid[y][x].bgColor = false;

        this.grid[y][x].rotX = 0;
        this.grid[y][x].rotY = 0;
        this.grid[y][x].rotZ = 0;
      }
    }
  },


  startShape: function(shape, fromX, fromY, fromZ, plane) {
    var grid3d = this.editor.grid3d;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var gridDepth = grid3d.getGridDepth();

    if(typeof plane == 'undefined') {
      plane = 'xy';
    }

    console.log('start shape, plane = ' + plane + ',:' + fromX + ',' + fromY + ',' + fromZ);

    this.plane = plane;

    if(plane == 'xy') {

      if(gridWidth != this.width || gridHeight != this.height) {
        this.width = gridWidth;
        this.height = gridHeight;
        this.resizeGrid();
      }
    } else if(plane == 'xz') {
      if(gridWidth != this.width || gridDepth != this.height) {
        this.width = gridWidth;
        this.height = gridDepth;
        this.resizeGrid();
      }      
    }

//    this.editor.grid.setCursorEnabled(false);
    this.clearGrid();

    this.shape = shape;
    this.fromX = fromX;
    this.fromY = fromY;
    this.fromZ = fromZ;

    this.toX = -1;
    this.toY = -1;
    this.toZ = -1;

    this.setShapeTo(this.fromX, this.fromY, this.fromZ);
  },

  endShape: function() {
    var grid3d = this.editor.grid3d;

    this.editor.history.startEntry('draw shape');

    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        if(this.grid[y][x].character !== false) {
          var z = grid3d.getXYPosition();
          var gridY = grid3d.getXZPosition();

          if(this.plane == 'xz') {
            grid3d.setCell({
              t: this.grid[y][x].character, 
              x: x, 
              y: gridY, 
              z: y, 
              bc: this.grid[y][x].color, 
              rx: this.grid[y][x].rotX, 
              ry: this.grid[y][x].rotY, 
              rz: this.grid[y][x].rotZ, 
              bc: this.grid[y][x].bgColor});
          } else {
            grid3d.setCell({
              t: this.grid[y][x].character, 
              x: x, 
              y: y, 
              z: z, 
              fc: this.grid[y][x].color, 
              rx: this.grid[y][x].rotX, 
              ry: this.grid[y][x].rotY, 
              rz: this.grid[y][x].rotZ, 
              bc: this.grid[y][x].bgColor});
          }
        }
      }
    }

    this.editor.history.endEntry();
    
    this.clearGrid();
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }


    this.clearMeshes();
    this.editor.grid.setCursorEnabled(true);
  },


  addCharacter: function(character, x, y, z, color, bgColor, rotX, rotY, rotZ) {

    var colorPaletteManager = this.editor.colorPaletteManager;
    var tileSetManager = this.editor.tileSetManager;
    var currentTile = this.editor.currentTile;
    var grid3d = this.editor.grid3d;
    var colorPalette = grid3d.getColorPalette();

    if(typeof rotX == 'undefined') {
      rotX = currentTile.getRx();
    } 

    if(typeof rotY == 'undefined') {
      rotY = currentTile.getRy();      
    }

    if(typeof rotZ == 'undefined') {
      rotZ = currentTile.getRz();
    }

//    bgColor = false;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var gridDepth = grid3d.getGridDepth();

    var tileSet = grid3d.getTileSet();

    var cellSizeX = grid3d.getCellSizeX();
    var cellSizeY = grid3d.getCellSizeY();
    var cellSizeZ = grid3d.getCellSizeZ();

    var meshX = x * cellSizeX + cellSizeX / 2;
    var meshY = y * cellSizeY + cellSizeY / 2;
    var meshZ = z * cellSizeZ + cellSizeZ / 2;


    if(x >= gridWidth || x < 0 || y >= gridHeight || y < 0 || z >= gridDepth || z < 0) {
      // outside grid
      return false;
    }
/*
    if(x >= this.editor.grid.width || x < 0 || y >= this.editor.grid.height || y < 0 || z >= this.editor.grid.depth || z < 0) {
      // outside grid
      return false;
    }
*/
/*
    if(color >= grid.materials.length) {
      // bad color
      return false;
    }
*/

    if(character != 96 && (character != 32 || bgColor !== colorPaletteManager.noColor) ) {
      var geometry = null;
      var mesh = null;

      if(bgColor === colorPaletteManager.noColor) {  
        var geometry = tileSet.getGeometry(character);

        if(typeof geometry == 'undefined') {
          console.log('no geometry!!!!');
        }

        var mesh = new THREE.Mesh(geometry, colorPalette.getMaterial(color));
      } else {
        var geometry = tileSet.getBackgroundGeometry(character);
        var mesh = new THREE.Mesh(geometry, colorPalette.getMaterial(bgColor));
        var geometry = tileSet.getGeometry(character);
        var fgMesh = new THREE.Mesh(geometry, colorPalette.getMaterial(color));
        mesh.add(fgMesh);
      }

      mesh.rotation.order = 'YXZ';
      mesh.rotation.x = rotX * Math.PI * 2;// + Math.PI / 2;
      mesh.rotation.y = rotY * Math.PI * 2;
      mesh.rotation.z = rotZ * Math.PI * 2;

      mesh.position.x = meshX;
      mesh.position.y = meshY;
      mesh.position.z = meshZ;


/*
      // need to retain the original position for when moving selection
      mesh.originalPosition = {};
      mesh.originalPosition.x = meshX;
      mesh.originalPosition.y = meshY;
      mesh.originalPosition.z = meshZ;

      mesh.gridX = x;
      mesh.gridY = y;
      mesh.gridZ = z;
      mesh.box = new THREE.Box3(new THREE.Vector3(meshX - grid.cellSizeX / 2, meshY - grid.cellSizeY / 2, meshZ - grid.cellSizeZ / 2),
                                new THREE.Vector3(meshX + grid.cellSizeX / 2, meshY + grid.cellSizeY / 2, meshZ + grid.cellSizeZ / 2));
      mesh.box.gridPosition = new THREE.Vector3(x, y, z);
*/
      mesh.castShadow = true;
      mesh.receiveShadow = true;

//      cell.mesh = mesh;
      this.holder.add(mesh);
      this.meshes.push(mesh);
    }

    return true;
  },

  clearMeshes: function() {
    for(var i = 0; i < this.meshes.length; i++) {
      this.holder.remove(this.meshes[i]);
    }
    this.meshes = [];
  },

  setShapeTo: function(toX, toY, toZ) {

    if(this.toX != toX || this.toY != toY || this.toZ != toZ) {
      this.toX = toX;
      this.toY = toY;
      this.toZ = toZ;

      this.clearMeshes();

      switch(this.shape) {
        case 'rect':
          this.rect(this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
        case 'oval':
          this.oval(this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
        case 'line':
          this.line(this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
      }
    }

  },


  // outer line
  // 
  
  rect: function(fromX, fromY, fromZ, toX, toY, toZ) {
    this.clearGrid();

    var grid3d = this.editor.grid3d;
    var z = grid3d.getXYPosition();
    var gridY = grid3d.getXZPosition();
    var drawTools = this.editor.tools.drawTools;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    var currentTile = this.editor.currentTile;


    if(fromX == toX && fromY == toY && fromZ == toZ) {
      if(this.plane == 'xy') {
        this.singleCell(fromX, fromY, z);
      } 

      if(this.plane == 'xz') {
        this.singleCell(fromX, gridY, fromZ);        
      }
      return;
    }

    if(this.plane == 'xz') {
      // swap y and z
      var temp = fromY;
      fromY = fromZ;
      toY = toZ;
      fromZ = temp;
      toZ = temp;
    }

    if(this.plane == 'xz') {
      gridHeight = grid3d.getGridDepth();
    }

//    var cell = grid3d.getCell(x, y, z);
    var characters = currentTile.getCharacters();
    var character = characters[0][0];
    var color = currentTile.getColor();
    var bgColor = currentTile.getBGColor();



    this.rectCharacters = {
      'amstrad': [
        [
          135, 131, 139,
          133,  -1, 138,
          141, 140, 142
        ],
        [
          134, 131, 137,
          133,  -1, 138,
          137, 140, 134
        ],
        [
          150, 154, 156,
          149,  -1, 149,
          147, 154, 153
        ],
        [
          214, 143, 215, 
          143,  -1, 143,
          213, 143, 212
        ],
        [
          222, 207, 223,
          207, -1,  207,
          221, 207, 220
        ],
        [
          217, 216, 219,
          217,  -1, 219,
          217, 218, 219
        ]
      ],
      'atascii': [
        [
           17,  18,  5,
          124,  -1, 124,
           26,  18,  3
        ],
        [
             8, 160,  10,
           160,  -1, 160,
           138, 160, 136
        ],
        [
            9,  21,   15,
          153,  -1,   25,
           11, 149,  12  
        ],
        [
            6,  13,  7,
           22,  -1,  2,
            7,  14,  6
        ],
        [
          145, 146, 133,
          252,  -1, 252,
          154, 146, 131
        ],
        [
          137, 149, 143,
           25,  -1, 153,
          139,  21, 140
        ]
      ],

      'ibm': [
        [
          218, 196, 191,
          179,  -1, 179,
          192, 196, 217
        ],
        [
          201, 205, 187,
          186,  -1, 186,
          200, 205, 188
        ],
        [
          214, 196, 183,
          186,  -1, 186,
          211, 196, 189
        ],
        [
          213, 205, 184,
          179,  -1, 179,
          212, 205, 190
        ],
        [
          222, 223, 221, 
          222,  -1, 221, 
          222, 220, 221
        ]
      ],
      'sharpmz700_1': [
        [
          114, 112, 115,
          113,  -1,  61,
           50,  60, 51
        ],
        [
           59, 122, 123,
           59,  -1, 123,
           59,  58, 123 
        ],
        [
           78,  67,  77,
           67,  -1,  67,
           66,  67,  86
        ],
        [
          108, 122,  91,
          123,  -1,  59,
           91,  58, 108
        ],
        [
          118, 112, 119,
          113,  -1,  61,
          119,  60, 118
        ],
        [
          209, 211, 210,
          209,  -1, 210,
          209, 212, 210
        ],
        [
          216, 208, 215,
          208,  -1, 208,
          214, 208, 213
        ],
        [
          247, 243, 251,
          245,  -1, 250,
          253, 252, 254
        ]
      ],
      'petscii': [
        [
          108,  98, 123,
          225,  -1,  97,
          124, 226, 126
        ],
        [
          112,  64, 110,
          93,   -1,  93,
          109,  64, 125
        ],

        [
           79, 119,  80,
          116,  -1, 103,
           76, 111, 122 
        ],

        [
           85,  64,  73,
           93,  -1,  93,
           74,  64,  75
        ],

        [
           78, 119,  77,
          116,  -1, 103,
           77, 111,  78 
        ],

        [
          233, 160, 223,
          160,  -1, 160,
           95, 160, 105 
        ],

        [
          236, 226, 251,
           97,  -1, 225,
          252,  98, 254 
        ],

        [
          240, 192, 238,
          221,  -1, 221,
          237, 192, 253 
        ],

        [
          207, 247, 208,
          244,  -1, 231,
          204, 239, 250 
        ],

        [
          213, 192, 201,
          221,  -1, 221,
          202, 192, 203 
        ],

        [
          206, 247, 205,
          244,  -1, 231,
          205, 239, 206 
        ],

        [
          255, 226, 127,
           97,  -1, 225,
          127,  98, 255 
        ],
      ],

      'petscii_shifted': [
        [
          108,  98, 123,
          225,  -1,  97,
          124, 226, 126 
        ],
        [
          112,  64, 110,
           93,  -1,  93,
          109,  64, 125
        ],
        [
          255, 226, 127,
           97,  -1, 225,
          127,  98, 255
        ],
        [
          225, 226,  97,
          225,  -1,  97,
          225,  98,  97
        ],
        [
          236, 226, 251,
           97,  -1, 225,
          252,  98, 254
        ],
        [
          240, 192, 238,
          221,  -1, 221, 
          237, 192, 253
        ]
      ]
    }

//    var characterSet = this.editor.getCharacterSet();
    var presetName = '';// characterSet.preset;
    var useC64RectType = false;//true;

    console.log('preset name = ' + presetName);
    if(typeof presetName == 'undefined') {
      useC64RectType = false;
    }

    if(!this.editor.drawCharacter) {
      useC64RectType = false;
      //character = this.editor.grid.gridData[gridCoords.z][gridCoords.y][gridCoords.x].character;
    }

    if(!$('#drawChangesSmartRect').is(':checked')) {
      useC64RectType = false;
    }

    var rectCharacters = null;

    if(useC64RectType) {
      if(presetName.indexOf('ibm') != -1) {
        rectCharacters = this.rectCharacters['ibm'];
      } else if(presetName.indexOf('amstrad') != -1) {
        rectCharacters = this.rectCharacters['amstrad'];
      } else if(presetName.indexOf('atascii') != -1) {
        rectCharacters = this.rectCharacters['atascii'];
      } else if(presetName == 'petscii') {
        console.log('use petscrii rect characters');
        rectCharacters = this.rectCharacters['petscii'];
      } else if(presetName == 'petscii_shifted') {

        rectCharacters = this.rectCharacters['petscii_shifted'];
      } else if(presetName == 'sharpmz700_1') {
        rectCharacters = this.rectCharacters['sharpmz700_1'];
      }

      // check if a rect type character is selected
      useC64RectType = false;


      if(rectCharacters != null) {
        for(var i = 0; i < rectCharacters.length; i++) {
          for(var j = 0; j < rectCharacters[i].length; j++) {
            if(rectCharacters[i][j] == character) {
              useC64RectType = i;
              break;
            }
          }
        }
      }
    }

    var rotX = currentTile.getRx();
    var rotY = currentTile.getRy();      
    var rotZ = currentTile.getRz();


    if(fromX > toX) {
      var temp = toX;
      toX = fromX;
      fromX = temp;
    }
    for(var x = fromX; x <= toX; x++) {
      if(x >= 0 && x < this.editor.grid.width) {

        var y = fromY;        
        if(y >= 0 && y < gridHeight) {

          var cell = grid3d.getCell(x, y, z);
          if(!drawTools.drawCharacter) {
            useC64RectType = false;
            character = cell.t;
          }
          if(!drawTools.drawColor) {
            color = cell.fc;
          }
          if(!drawTools.drawBgColor) {
            bgColor = cell.bc;
          }                       
    
          if(useC64RectType !== false) {

            if(toY < fromY) {
              if(x == fromX) {
                character = rectCharacters[useC64RectType][0];
              } else if(x == toX) {
                character = rectCharacters[useC64RectType][2];
              } else {
                character = rectCharacters[useC64RectType][1];
              }
            } else {
              if(x == fromX) {
                character = rectCharacters[useC64RectType][6];
              } else if(x == toX) {
                character = rectCharacters[useC64RectType][8];
              } else {
                character = rectCharacters[useC64RectType][7];
              }              
            }

          } else {

          }

          this.grid[y][x].bgColor = bgColor;
          this.grid[y][x].color = color;
          this.grid[y][x].character = character;

          this.grid[y][x].rotX = rotX;
          this.grid[y][x].rotY = rotY;
          this.grid[y][x].rotZ = rotZ;

          if(this.plane == 'xz') {
            this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);            
          }
        }

        var y = toY;        
        if(y >= 0 && y < gridHeight) {

          var cell = grid3d.getCell(x, y, z);
          if(!drawTools.drawCharacter) {
            useC64RectType = false;
            character = cell.t;
          }
          if(!drawTools.drawColor) {
            color = cell.fc;
          }
          if(!drawTools.drawBgColor) {
            bgColor = cell.bc;
          }                       


          if(useC64RectType !== false) {

            if(toY > fromY) {
              if(x == fromX) {
                character = rectCharacters[useC64RectType][0];
              } else if(x == toX) {
                character = rectCharacters[useC64RectType][2];
              } else {
                character = rectCharacters[useC64RectType][1];
              }
            } else {
              if(x == fromX) {
                character = rectCharacters[useC64RectType][6];
              } else if(x == toX) {
                character = rectCharacters[useC64RectType][8];
              } else {
                character = rectCharacters[useC64RectType][7];
              }              
            }

          } else {


          }

          if(this.plane == 'xz') {
            this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);            
          }
          this.grid[y][x].bgColor = bgColor;
          this.grid[y][x].color = color;
          this.grid[y][x].character = character;

          this.grid[y][x].rotX = rotX;
          this.grid[y][x].rotY = rotY;
          this.grid[y][x].rotZ = rotZ;

        }
      }
    }

    if(fromY > toY) {
      var temp = toY;
      toY = fromY;
      fromY = temp;
      //toY++;
    } else {
      //toY++;

    }

    for(var y = fromY; y <= toY; y++) {
      console.log('!!');
      if(y >= 0 && y < gridHeight) {
        var x = fromX;
        if(x >= 0 && x < this.editor.grid.width) {

          var cell = grid3d.getCell(x, y, z);
          if(!drawTools.drawCharacter) {
            useC64RectType = false;
            character = cell.t;
          }
          if(!drawTools.drawColor) {
            color = cell.fc;
          }
          if(!drawTools.drawBgColor) {
            bgColor = cell.bc;
          }                       


          if(useC64RectType !== false) {

            if(toX > fromX) {
              if(y == fromY) {
                character = rectCharacters[useC64RectType][6];
              } else if(y == toY) {
                character = rectCharacters[useC64RectType][0];
              } else {
                character = rectCharacters[useC64RectType][3];
              }
            } else {
              if(y == fromY) {
                character = rectCharacters[useC64RectType][8];
              } else if(y == toY) {
                character = rectCharacters[useC64RectType][2];
              } else {
                character = rectCharacters[useC64RectType][5];
              }              
            }

          } else {

          }

          if(this.plane == 'xz') {
            this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);          
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);          
          }
          this.grid[y][x].bgColor = bgColor;
          this.grid[y][x].color = color;
          this.grid[y][x].character = character;

          this.grid[y][x].rotX = rotX;
          this.grid[y][x].rotY = rotY;
          this.grid[y][x].rotZ = rotZ;

        }


        var x = toX;
        if(x >= 0 && x < this.editor.grid.width) {

          var cell = grid3d.getCell(x, y, z);
          if(!drawTools.drawCharacter) {
            useC64RectType = false;
            character = cell.t;
          }
          if(!drawTools.drawColor) {
            color = cell.fc;
          }
          if(!drawTools.drawBgColor) {
            bgColor = cell.bc;
          }                       

          if(useC64RectType !== false) {

            if(toX < fromX) {
              if(y == fromY) {
                character = rectCharacters[useC64RectType][6];
              } else if(y == toY) {
                character = rectCharacters[useC64RectType][0];
              } else {
                character = rectCharacters[useC64RectType][3];
              }
            } else {
              if(y == fromY) {
                character = rectCharacters[useC64RectType][8];
              } else if(y == toY) {
                character = rectCharacters[useC64RectType][2];
              } else {
                character = rectCharacters[useC64RectType][5];
              }              
            }

          } else {
          }

          if(this.plane == 'xz') {
            this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);            
          }

          this.grid[y][x].bgColor = bgColor;
          this.grid[y][x].color = color;
          this.grid[y][x].character = character;

          this.grid[y][x].rotX = rotX;
          this.grid[y][x].rotY = rotY;
          this.grid[y][x].rotZ = rotZ;

        }


      }
    }
  },

  line: function(fromX, fromY, fromZ, toX, toY, toZ) {
    this.clearGrid();

    var grid3d = this.editor.grid3d;
    var z = grid3d.getXYPosition();
    var gridY = grid3d.getXZPosition();
    var drawTools = this.editor.tools.drawTools;
    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    if(this.plane == 'xz') {
      gridHeight = grid3d.getGridDepth();
    }
    var currentTile = this.editor.currentTile;
    var characters = currentTile.getCharacters();
    var character = characters[0][0];
    var color = currentTile.getColor();
    var bgColor = currentTile.getBGColor();
    var rotX = currentTile.getRx();
    var rotY = currentTile.getRy();      
    var rotZ = currentTile.getRz();


    if(fromX == toX && fromY == toY && fromZ == toZ) {
      if(this.plane == 'xy') {
        this.singleCell(fromX, fromY, z);
      } 

      if(this.plane == 'xz') {
        this.singleCell(fromX, gridY, fromZ);        
      }
      return;
    }

    if(this.plane == 'xz') {
      // swap y and z
      var temp = fromY;
      fromY = fromZ;
      toY = toZ;
      fromZ = temp;
      toZ = temp;
    }


    var deltaX = toX - fromX;
    if(deltaX < 0) {
      deltaX = -deltaX; 
    }
    var deltaY = toY - fromY;
    if(deltaY < 0) {
      deltaY = -deltaY;
    }

    if(deltaX > deltaY) {

      if(fromX > toX) {
        var temp = toX;
        toX = fromX;
        fromX = temp;

        temp = toY;
        toY = fromY;
        fromY = temp;

      }


      for(var x = fromX; x <= toX; x++) {
        if(x >= 0 && x < gridWidth) {

          var y = Math.round(fromY + (toY - fromY) * (x - fromX) / (toX - fromX));        
          if(y >= 0 && y < gridHeight) {

            if(!drawTools.drawCharacter) {
              character = cell.t;
            }
            if(!drawTools.drawColor) {
              color = cell.fc;
            }
            if(!drawTools.drawBgColor) {
              bgColor = cell.bc;
            }                       
      
            if(this.plane == 'xz') {
              this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);          
            } else {
              this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);
            }


            this.grid[y][x].character = character;
            this.grid[y][x].bgColor = bgColor;
            this.grid[y][x].color = color;
            this.grid[y][x].rotX = rotX;
            this.grid[y][x].rotY = rotY;
            this.grid[y][x].rotZ = rotZ;
  
          }

        }
      }
    } else {

      if(fromY > toY) {
        var temp = toY;
        toY = fromY;
        fromY = temp;

        temp = toX;
        toX = fromX;
        fromX = temp;

      }


      for(var y = fromY; y <= toY; y++) {

        if(y >= 0 && y < gridHeight) {
          var x = Math.round(fromX + (toX - fromX) * (y - fromY) / (toY - fromY));


          if(x >= 0 && x < gridWidth) {

            if(!drawTools.drawCharacter) {
              character = cell.t;
            }
            if(!drawTools.drawColor) {
              color = cell.fc;
            }
            if(!drawTools.drawBgColor) {
              bgColor = cell.bc;
            }                       
      

            if(this.plane == 'xz') {
              this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);          
            } else {
              this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);
            }

            this.grid[y][x].character = character;
            this.grid[y][x].bgColor = bgColor;
            this.grid[y][x].color = color;
            this.grid[y][x].rotX = rotX;
            this.grid[y][x].rotY = rotY;
            this.grid[y][x].rotZ = rotZ;
  
          }

        }
      }
    }
  },

  singleCell: function(x, y, z) {
    var currentTile = this.editor.currentTile;
    var drawTools = this.editor.tools.drawTools;
    var grid3d = this.editor.grid3d;

    var characters = currentTile.getCharacters();
    var character = 0;
    if(characters.length > 0 && characters[0].length > 0) {
      character = characters[0][0];
    }

    var color = currentTile.getColor();
    var bgColor = currentTile.getBGColor();
    var rx = currentTile.getRx();
    var ry = currentTile.getRy();
    var rz = currentTile.getRz();

    var cell = grid3d.getCell(x, y, z);

    if(!drawTools.drawCharacter) {
      character = cell.t;
    }
    if(!drawTools.drawColor) {
      color = cell.fc;
    }
    if(!drawTools.drawBGColor) {
      bgColor = cell.bc;
    }                       
    this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);          
    this.grid[y][x].bgColor = bgColor;
    this.grid[y][x].color = color;
    this.grid[y][x].character = character;
    this.grid[y][x].rotX = rx;
    this.grid[y][x].rotY = ry;
    this.grid[y][x].rotZ = rz;

  },

  oval: function(fromX, fromY, fromZ,  toX, toY, toZ) {
    this.clearGrid();
    var drawTools = this.editor.tools.drawTools;
    var grid3d = this.editor.grid3d;
    var currentTile = this.editor.currentTile;
    var rotX = currentTile.getRx();
    var rotY = currentTile.getRy();      
    var rotZ = currentTile.getRz();

    var z = grid3d.getXYPosition();
    var gridY = grid3d.getXZPosition();

    if(fromX == toX && fromY == toY && fromZ == toZ) {
      if(this.plane == 'xy') {
        this.singleCell(fromX, fromY, z);
      } 

      if(this.plane == 'xz') {
        this.singleCell(fromX, gridY, fromZ);        
      }
      return;
    }


    var gridWidth = grid3d.getGridWidth();
    var gridHeight = grid3d.getGridHeight();
    if(this.plane == 'xz') {
      gridHeight = grid3d.getGridDepth();
    }

//    var cell = grid3d.getCell(x, y, z);
/*
    var character = cell.t;
    var color = cell.fc;
    var bgColor = cell.bc;
*/
    var characters = currentTile.getCharacters();
    var character = characters[0][0];
    var color = currentTile.getColor();
    var bgColor = currentTile.getBGColor();

    if(fromX == toX && fromY == toY) {
      this.singleCell(fromX, fromY, z);
      return;
    }


    if(fromX > toX) {
      var temp = toX;
      toX = fromX;
      fromX = temp;
    }

    if(fromY > toY) {
      var temp = toY;
      toY = fromY;
      fromY = temp;
    }

    if(this.plane == 'xz') {
      // swap y and z
      var temp = fromY;
      fromY = fromZ;
      toY = toZ;
      fromZ = temp;
      toZ = temp;
    }


    var centerY = (toY + fromY) / 2;
    var centerX = (toX + fromX) / 2;


    var centerY = fromY + (toY - fromY) / 2;
    var centerX = fromX + (toX - fromX) / 2;

    var width = toX - fromX;
    var height = toY - fromY;

    var widthScale = 1;
    var heightScale = 1;

    if(width > height) {

      heightScale = height / width;
      radius = width / 2;
    } else {
      widthScale = width / height;
      radius = height / 2;
    }


    var segments = 300;
    var angle = 0;
    for(var i = 0; i < segments; i++) {
      angle = (2 * Math.PI) * i / segments;

      var x = Math.round(centerX + widthScale * radius * Math.cos(angle));
      var y = Math.round(centerY + heightScale * radius * Math.sin(angle));
      var cell = grid3d.getCell(x, y, z);

      if(!drawTools.drawCharacter) {
        character = cell.t;
      }
      if(!drawTools.drawColor) {
        color = cell.fc;
      }
      if(!drawTools.drawBgColor) {
        bgColor = cell.bc;
      }                       

      if(x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {

        if(this.plane == 'xz') {
          this.addCharacter(character, x, gridY, y, color, bgColor, rotX, rotY, rotZ);
        } else {
          this.addCharacter(character, x, y, z, color, bgColor, rotX, rotY, rotZ);
        }
        this.grid[y][x].bgColor = bgColor;
        this.grid[y][x].color = color;
        this.grid[y][x].character = character;
        this.grid[y][x].rotX = rotX;
        this.grid[y][x].rotY = rotY;
        this.grid[y][x].rotZ = rotZ;

      }

    }

//    this.editor.grid.update();

  }
}