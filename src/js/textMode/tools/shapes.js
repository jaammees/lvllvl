var Shapes = function() {
  this.editor = null;

  this.grid = null;
  this.width = 0;
  this.height = 0;
  this.depth = 0;


  this.fill = false;

  this.shape = false;
  this.fromX = false;
  this.fromY = false;
  this.fromZ = false;

  this.holder = null;
  this.meshes = [];

  this.expandFromMiddle = false;
}

Shapes.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.width = 40;
    this.height = 25;
    this.depth = 1;

//    this.resizeGrid();

    var shapes = this;

    UI.on('ready', function() {
      return;
      shapes.holder = new THREE.Object3D();
      scene.add(shapes.holder);
    });
  },


  setFill: function(fill) {
    this.fill = fill;
  },
  getGrid: function() {
    if(this.grid == null) {
      this.resizeGrid();
    }

    return this.grid;
  },

  resizeGrid: function() {
    this.grid = [];
    for(var y = 0; y < this.height; y++) {
      var row = [];
      for(var x = 0; x < this.width; x++) {
        row.push({ t: false, fc: false, bc: this.editor.colorPaletteManager.noColor });
      }
      this.grid.push(row);
    }
  },

  clearGrid: function() {
    if(this.grid == null) {
      this.resizeGrid();
    }
    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        this.grid[y][x].t = false;// this.editor.tileSetManager.blankCharacter;
        this.grid[y][x].fc = false;
        this.grid[y][x].bc = this.editor.colorPaletteManager.noColor;

        this.grid[y][x].rx = 0;
        this.grid[y][x].ry = 0;
        this.grid[y][x].rz = 0;
        this.grid[y][x].fh = 0;
        this.grid[y][x].fv = 0;
      }
    }
  },


  startShape: function(shape, fromX, fromY, fromZ, plane, expandFromMiddle) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.expandFromMiddle = false;
    if(typeof expandFromMiddle != 'undefined') {
      this.expandFromMiddle = expandFromMiddle;

    }

    this.plane = 'xy'
    if(typeof plane != 'undefined') {
      this.plane = plane;
    }

    if(this.plane == 'xy') {

      if(gridWidth != this.width || gridHeight != this.height) {
        this.width = gridWidth;
        this.height = gridHeight;
        this.resizeGrid();
      }
    } else if(this.plane == 'xz') {
      console.error('start shape in 3d bit');
      if(gridWidth != this.width || this.editor.grid.depth != this.height) {
        this.width = this.editor.grid.width;
        this.height = this.editor.grid.depth;
        this.resizeGrid();
      }      
    }

    this.editor.grid.setCursorEnabled(false);
    this.clearGrid();

    this.shape = shape;
    this.fromX = fromX;
    this.fromY = fromY;
    this.fromZ = fromZ;

    this.toX = -1;
    this.toY = -1;
    this.toZ = -1;

    this.setShapeTo(this.fromX, this.fromY, this.fromZ);
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw({ allCells: true});

  },

  endShape: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  


    this.editor.history.startEntry('draw shape');

    var args = {};

    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        if(this.grid[y][x].t !== this.editor.tileSetManager.blankCharacter
            && this.grid[y][x].t !== false) {

//          var z = this.editor.grid.getXYGridPosition();
//          var gridY = this.editor.grid.getXZGridPosition();

          args.x = x;
          args.t = this.grid[y][x].t;
          args.fc = this.grid[y][x].fc;
          args.bc = this.grid[y][x].bc;
          args.rx = this.grid[y][x].rx;
          args.ry = this.grid[y][x].ry;
          args.rz = this.grid[y][x].rz;
          args.fh = this.grid[y][x].fh;
          args.fv = this.grid[y][x].fv;
          args.update = false;

          args.y = y;
          args.z = 0;
          layer.setCell(args);

//          console.log('set cell:' + args.t);



          this.editor.grid.grid2d.setMirrorCells(layer, args);

          if(false) {
            // 3d shapes
            if(this.plane == 'xz') {
              args.y = gridY;
              args.z = y;
              this.editor.grid.setCell(args);
            } else {
              args.y = y;
              args.z = z;
              this.editor.grid.setCell(args);
            }
          }
        }
      }
    }

    this.editor.history.endEntry();
    
    this.clearGrid();
    

    if(layer.getBlockModeEnabled()) {
      this.editor.graphic.invalidateAllCells();
      this.editor.graphic.redraw({ allCells: true});
    }  else {
      this.editor.graphic.redraw({ allCells: true});

    }
    this.clearMeshes();
    this.editor.grid.setCursorEnabled(true);
    this.shape = false;
  },


  cancelShape: function() {
    this.clearGrid();

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }
    

    this.clearMeshes();
    this.editor.grid.setCursorEnabled(true);
    this.shape = false;

  },

  getCurrentShape: function() {
    return this.shape;
  },

  addCharacter: function(character, x, y, z, color, bgColor, rx, ry, rz, fh, fv) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var cellWidth = layer.getCellWidth();
    var cellHeight = layer.getCellHeight();

    // TODO: if 2d, dont need to do this..

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(typeof rx == 'undefined') {
      rx = this.editor.currentTile.rotX;
    } 

    if(typeof ry == 'undefined') {
      ry = this.editor.currentTile.rotY;      
    }

    if(typeof rz == 'undefined') {
      rz = this.editor.currentTile.rotZ;      
    }

    if(typeof fh == 'undefined') {
      fh = this.editor.currentTile.flipH;
    }

    if(typeof fv == 'undefined') {
      fv = this.editor.currentTile.flipV;
    }


//    bgColor = false;
    var grid = this.editor.grid;


    var meshX = x * cellWidth + cellWidth / 2;
    var meshY = y * cellHeight + cellHeight / 2;
    var meshZ = z * grid.cellSizeZ + grid.cellSizeZ / 2;


    if(x >= gridWidth || x < 0 || y >= gridHeight || y < 0) {//} || z >= grid.depth || z < 0) {
      // outside grid
      return false;
    }


    if(false && g_app.getEnabled('textmode3d')) {

      if(character != 96 && (character != this.editor.tileSetManager.blankCharacter || bgColor !== -1) ) {
        var geometry = null;
        var mesh = null;

        if(bgColor === -1) {  
          var geometry = tileSet.getGeometry(character);

          if(typeof geometry == 'undefined') {
  //          console.log('no geometry!!!!');
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
        mesh.rotation.x = rx * Math.PI * 2;// + Math.PI / 2;
        mesh.rotation.y = ry * Math.PI * 2;
        mesh.rotation.z = rz * Math.PI * 2;

        mesh.position.x = meshX;
        mesh.position.y = meshY;
        mesh.position.z = meshZ;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

  //      cell.mesh = mesh;
        this.holder.add(mesh);
        this.meshes.push(mesh);
      }
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

      var x1 = this.fromX;
      var x2 = this.toX;
      var y1 = this.fromY;
      var y2 = this.toY;
      var z1 = this.fromZ;
      var z2 = this.toZ;


      if(this.expandFromMiddle) {
        x1 = Math.floor(x1 - (x2 - x1));
        y1 = Math.floor(y1 - (y2 - y1));
      }

      switch(this.shape) {
        case 'rect':
          this.rect(x1, y1, z1,x2, y2, z1);//this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
        case 'oval':
          this.oval(x1, y1, z1, x2, y2, z2);//this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
        case 'line':
          this.line(x1, y1, z1, x2, y2, z2);//this.fromX, this.fromY, this.fromZ, this.toX, this.toY, this.toZ);
        break;
      }
    }

  },


  // outer line
  // 
  rect: function(fromX, fromY, fromZ, toX, toY, toZ) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.clearGrid();

    var z = this.editor.grid.xyPosition;
    var gridY = this.editor.grid.xzPosition;

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
      gridHeight = this.editor.grid.depth;
    }


//    var character = this.editor.currentTile.character;
    var characters = this.editor.currentTile.getCharacters();
    var character = this.editor.currentTile.character;
    if(characters.length > 0 && characters[0].length > 0) {
      character = characters[0][0];
    }
    var color = this.editor.currentTile.color;
    var bgColor = this.editor.currentTile.bgColor;


    this.rectCharacters = {
      'amstrad': [
        [
          141, 140, 142,
          133,  -1, 138,
          135, 131, 139
        ],
        [
          137, 140, 134,
          133,  -1, 138,
          134, 131, 137
        ],
        [
          147, 154, 153,
          149,  -1, 149,
          150, 154, 156
        ],
        [
          213, 143, 212,
          143,  -1, 143,
          214, 143, 215 
        ],
        [
          221, 207, 220,
          207, -1,  207,
          222, 207, 223
        ],
        [
          217, 218, 219,
          217,  -1, 219,
          217, 216, 219
        ]
      ],
      'atascii': [
        [
          26,  18,  3,
          124,  -1, 124,
          17,  18,  5,
        ],
        [
          138, 160, 136,
          160,  -1, 160,
          8, 160,  10
        ],
        [
          11, 149,  12,
          153,  -1, 25,
          9,  21,   15
        ],
        [
            7,  14,  6,
           22,  -1,  2,
            6,  13,  7
          ],
        [
          154, 146, 131,
          252,  -1, 252,
          145, 146, 133
        ],
        [
          139,  21, 140,
          25,  -1, 153,
           137, 149, 143
        ]
      ],

      'ibm': [
        [
          192, 196, 217,
          179,  -1, 179,
          218, 196, 191
        ],
        [
          200, 205, 188,
          186,  -1, 186,
          201, 205, 187
        ],
        [
          211, 196, 189,
          186,  -1, 186,
          214, 196, 183
        ],
        [
          212, 205, 190,
          179,  -1, 179,
          213, 205, 184
        ],
        [
          222, 220, 221,
          222,  -1, 221, 
          222, 223, 221 
        ]
      ],
      'sharpmz700_1': [
        [
          50,  60, 51,
          113,  -1,  61,
          114, 112, 115
        ],
        [
           59,  58, 123,
           59,  -1, 123,
           59, 122, 123
        ],
        [
          66,  67,  86,
          67,  -1,  67,
           78,  67,  77
        ],
        [
          91,  58, 108,
          123,  -1,  59,
          108, 122,  91
        ],
        [
          119,  60, 118,
          113,  -1,  61,
          118, 112, 119
        ],
        [
          209, 212, 210,
          209,  -1, 210,
          209, 211, 210
        ],
        [
          214, 208, 213,
          208,  -1, 208,
          216, 208, 215
        ],
        [
          253, 252, 254,
          245,  -1, 250,
          247, 243, 251
        ]
      ],
      'petscii': [
        [
          124, 226, 126,
          225,  -1,  97,
          108,  98, 123
        ],
        [
          109,  64, 125,
          93,   -1,  93,
          112,  64, 110
        ],

        [
          76, 111, 122,
          116,  -1, 103,
          79, 119,  80
        ],

        [
          74,  64,  75,
          93,  -1,  93,
          85,  64,  73
        ],

        [
           77, 111,  78, 
          116,  -1, 103,
           78, 119,  77
        ],

        [
          95, 160, 105,
          160,  -1, 160,
          233, 160, 223
        ],

        [
          252,  98, 254, 
          97,  -1, 225,
          236, 226, 251
        ],

        [
          237, 192, 253,
          221,  -1, 221,
          240, 192, 238
        ],

        [
          204, 239, 250, 
          244,  -1, 231,
          207, 247, 208
        ],

        [
          202, 192, 203, 
          221,  -1, 221,
          213, 192, 201
        ],

        [
          205, 239, 206, 
          244,  -1, 231,
          206, 247, 205
        ],

        [
          127,  98, 255, 
          97,  -1, 225,
          255, 226, 127,
        ],
      ],

      'petscii_shifted': [
        [
          124, 226, 126,
          225,  -1,  97,
          108,  98, 123
        ],
        [
          109,  64, 125,
           93,  -1,  93,
          112,  64, 110
        ],
        [
          127,  98, 255,
          97,  -1, 225,
          255, 226, 127
        ],
        [
          225,  98,  97,
          225,  -1,  97,
          225, 226,  97
        ],
        [
          252,  98, 254,
          97,  -1, 225,
          236, 226, 251
        ],
        [
          237, 192, 253,
          221,  -1, 221, 
          240, 192, 238
        ]
      ]
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var presetName = tileSet.preset;
    var useC64RectType = true;

    if(typeof presetName == 'undefined') {
      useC64RectType = false;
    }

    if(!this.editor.tools.drawTools.drawCharacter) {
      useC64RectType = false;
    }

    if(!$('#drawChangesSmartRect').is(':checked')) {
      useC64RectType = false;
    }

    if(g_app.isMobile()) {
      this.setFill($('#drawShapeFillMobile').is(':checked'));
    } else {
      this.setFill($('#shapeFill').is(':checked'));
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
        rectCharacters = this.rectCharacters['petscii'];
      } else if(presetName == 'petscii_shifted') {

        rectCharacters = this.rectCharacters['petscii_shifted'];
      //} else if(presetName == 'sharpmz700_1') {
      } else if(presetName == 'sharpmz700_1' || presetName == 'sharpmz700_1_japanese' || presetName == 'sharpmz80a') {

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

    var rx = this.editor.currentTile.rotX;
    var ry = this.editor.currentTile.rotY;
    var rz = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;

    if(fromX > toX) {
      var temp = toX;
      toX = fromX;
      fromX = temp;
    }
    for(var x = fromX; x <= toX; x++) {
      if(x >= 0 && x < gridWidth) {


        var y = fromY;        
        var drawCharacter = character;
        if(y >= 0 && y < gridHeight) {

          var cellData = layer.getCell({ x: x, y: y});

          if(!this.editor.tools.drawTools.drawCharacter) {
            character = cellData.t;
            useC64RectType = false;          
          }
          if(!this.editor.tools.drawTools.drawColor) {
            color = cellData.fc;
          }
          if(!this.editor.tools.drawTools.drawBgColor) {
            bgColor = cellData.bc;
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

          this.grid[y][x].bc = bgColor;
          this.grid[y][x].fc = color;
          this.grid[y][x].t = character;

          this.grid[y][x].rx = rx;
          this.grid[y][x].ry = ry;
          this.grid[y][x].rz = rz;

          this.grid[y][x].fh = fh;
          this.grid[y][x].fv = fv;

          if(this.plane == 'xz') {
            this.addCharacter(character, x, gridY, y, color, bgColor, rx, ry, rz);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);            
          }
        }

        var y = toY;        
        if(y >= 0 && y < gridHeight) {

          var cellData = layer.getCell({ x: x, y: y});

          if(!this.editor.tools.drawTools.drawCharacter) {
            character = cellData.t;
            useC64RectType = false;          
          }
          if(!this.editor.tools.drawTools.drawColor) {
            color = cellData.fc;
          }
          if(!this.editor.tools.drawTools.drawBgColor) {
            bgColor = cellData.bc;
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
            this.addCharacter(character, x, gridY, y, color, bgColor, rx, ry, rz);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);            
          }
          this.grid[y][x].bc = bgColor;
          this.grid[y][x].fc = color;
          this.grid[y][x].t = character;

          this.grid[y][x].rx = rx;
          this.grid[y][x].ry = ry;
          this.grid[y][x].rz = rz;

          this.grid[y][x].fh = fh;
          this.grid[y][x].fv = fv;

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
      if(y >= 0 && y < gridHeight) {
        var x = fromX;
        if(x >= 0 && x < gridWidth) {

          var cellData = layer.getCell({ x: x, y: y});

          if(!this.editor.tools.drawTools.drawCharacter) {
            character = cellData.t;
            useC64RectType = false;          
          }
          if(!this.editor.tools.drawTools.drawColor) {
            color = cellData.fc;
          }
          if(!this.editor.tools.drawTools.drawBgColor) {
            bgColor = cellData.bc;
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
            this.addCharacter(character, x, gridY, y, color, bgColor, rx, ry, rz);          
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);          
          }
          this.grid[y][x].bc = bgColor;
          this.grid[y][x].fc = color;
          this.grid[y][x].t = character;

          this.grid[y][x].rx = rx;
          this.grid[y][x].ry = ry;
          this.grid[y][x].rz = rz;

          this.grid[y][x].fh = fh;
          this.grid[y][x].fv = fv;

        }


        var x = toX;
        if(x >= 0 && x < gridWidth) {
          var cellData = layer.getCell({ x: x, y: y});

          if(!this.editor.tools.drawTools.drawCharacter) {
            character = cellData.t;
            useC64RectType = false;          
          }
          if(!this.editor.tools.drawTools.drawColor) {
            color = cellData.fc;
          }
          if(!this.editor.tools.drawTools.drawBgColor) {
            bgColor = cellData.bc;
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
            this.addCharacter(character, x, gridY, y, color, bgColor, rx, ry, rz);
          } else {
            this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);            
          }

          this.grid[y][x].bc = bgColor;
          this.grid[y][x].fc = color;
          this.grid[y][x].t = character;

          this.grid[y][x].rx = rx;
          this.grid[y][x].ry = ry;
          this.grid[y][x].rz = rz;

          this.grid[y][x].fh = fh;
          this.grid[y][x].fv = fv;

        }


      }
    }


    if(this.fill) {
      // fill..
      var characters = this.editor.currentTile.getCharacters();
      var character = this.editor.currentTile.character;
      if(characters.length > 0 && characters[0].length > 0) {
        character = characters[0][0];
      }
      var color = this.editor.currentTile.color;
      var bgColor = this.editor.currentTile.bgColor;


      for(var x = fromX + 1; x < toX; x++) {
        for(var y = fromY + 1; y < toY; y++) {
          if(x >= 0 && x < gridWidth
             && y >= 0 && y < gridHeight) {

              var cellData = layer.getCell({ x: x, y: y});

              if(!this.editor.tools.drawTools.drawCharacter) {
                character = cellData.t;
                useC64RectType = false;          
              }
              if(!this.editor.tools.drawTools.drawColor) {
                color = cellData.fc;
              }
              if(!this.editor.tools.drawTools.drawBgColor) {
                bgColor = cellData.bc;
              }                       

              this.addCharacter(character, x, y, z, color, bgColor, rx, ry, rz);            
              this.grid[y][x].bc = bgColor;
              this.grid[y][x].fc = color;
              this.grid[y][x].t = character;

              this.grid[y][x].rz = rz;

              this.grid[y][x].fh = fh;
              this.grid[y][x].fv = fv;

          }
        }
      }
    }

    

    this.editor.graphic.redraw();
  },

  line: function(fromX, fromY, fromZ, toX, toY, toZ) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.clearGrid();

    var z = this.editor.grid.xyPosition;
    var gridY = this.editor.grid.xzPosition;

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
      gridHeight = this.editor.grid.depth;
    }

    if(this.plane == 'xz') {
      gridHeight = this.editor.grid.depth;
    }
    
//    var character = this.editor.currentTile.character;

    var characters = this.editor.currentTile.getCharacters();
    var character = this.editor.currentTile.character;
    if(characters.length > 0 && characters[0].length > 0) {
      character = characters[0][0];
    }


    var color = this.editor.currentTile.color;
    var bgColor = this.editor.currentTile.bgColor;
    var rx = this.editor.currentTile.rotX;
    var ry = this.editor.currentTile.rotY;
    var rz = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;

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

            var cellData = layer.getCell({ x: x, y: y });

            if(!this.editor.tools.drawTools.drawCharacter) {
              character = cellData.t;
            }
            if(!this.editor.tools.drawTools.drawColor) {
              color = cellData.fc;
            }
            if(!this.editor.tools.drawTools.drawBgColor) {
              bgColor = cellData.bc;
            }                       

            if(this.plane == 'xz') {
              this.addCharacter(character, x, gridY, y, color, bgColor);          
            } else {
              this.addCharacter(character, x, y, z, color, bgColor);          
            }


            this.grid[y][x].t = character;
            this.grid[y][x].bc = bgColor;
            this.grid[y][x].fc = color;
            this.grid[y][x].rx = rx;
            this.grid[y][x].ry = ry;
            this.grid[y][x].rz = rz;

            this.grid[y][x].fh = fh;
            this.grid[y][x].fv = fv;
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
            var cellData = layer.getCell({ x: x, y: y });


            if(!this.editor.tools.drawTools.drawCharacter) {
              character = cellData.t;
            }
            if(!this.editor.tools.drawTools.drawColor) {
              color = cellData.fc;
            }
            if(!this.editor.tools.drawTools.drawBgColor) {
              bgColor = cellData.bc;
            }                       



            if(this.plane == 'xz') {
              this.addCharacter(character, x, gridY, y, color, bgColor);          
            } else {
              this.addCharacter(character, x, y, z, color, bgColor);          
            }

            this.grid[y][x].t = character;
            this.grid[y][x].bc = bgColor;
            this.grid[y][x].fc = color;
            this.grid[y][x].rx = rx;
            this.grid[y][x].ry = ry;
            this.grid[y][x].rz = rz;

            this.grid[y][x].fh = fh;
            this.grid[y][x].fv = fv;

            
          }

        }
      }
    }


    this.editor.graphic.redraw();


  },

  singleCell: function(x, y, z) {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    if(x < 0 || x >= gridWidth
       || y < 0 || y >= gridHeight) {
//       || z < 0 || z >= this.editor.grid.depth) {
      return;
    }

//    var character = this.editor.currentTile.character;
    var characters = this.editor.currentTile.getCharacters();
    var character = this.editor.currentTile.character;
    if(characters.length > 0 && characters[0].length > 0) {
      character = characters[0][0];
    }

    var color = this.editor.currentTile.color;
    var bgColor = this.editor.currentTile.bgColor;
    var rx = this.editor.currentTile.rotX;
    var ry = this.editor.currentTile.rotY;
    var rz = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;


    var cellData = layer.getCell({ x: x, y: y });

    if(!this.editor.tools.drawTools.drawCharacter) {
      character = cell.t;
    }
    if(!this.editor.tools.drawTools.drawColor) {
      color = cell.fc;
    }
    if(!this.editor.tools.drawTools.drawBgColor) {
      bgColor = cell.bc;
    }                       

    this.addCharacter(character, x, y, z, color, bgColor);          
    this.grid[y][x].bc = bgColor;
    this.grid[y][x].fc = color;
    this.grid[y][x].t = character;
    this.grid[y][x].rx = rx;
    this.grid[y][x].ry = ry;
    this.grid[y][x].rz = rz;

    this.grid[y][x].fh = fh;
    this.grid[y][x].fv = fv;

    this.editor.graphic.redraw();

  },

  oval: function(fromX, fromY, fromZ,  toX, toY, toZ) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }    

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    this.clearGrid();

    var z = this.editor.grid.xyPosition;
    var gridY = this.editor.grid.xzPosition;

    if(fromX == toX && fromY == toY && fromZ == toZ) {
      if(this.plane == 'xy') {
        this.singleCell(fromX, fromY, z);
      } 

      if(this.plane == 'xz') {
        this.singleCell(fromX, gridY, fromZ);        
      }
      return;
    }

    if(g_app.isMobile()) {
      this.setFill($('#drawShapeFillMobile').is(':checked'));
    } else {
      this.setFill($('#shapeFill').is(':checked'));
    }

    if(this.plane == 'xz') {
      gridHeight = this.editor.grid.depth;
    }

//    var character = this.editor.currentTile.character;

    var characters = this.editor.currentTile.getCharacters();
    var character = this.editor.currentTile.character;
    if(characters.length > 0 && characters[0].length > 0) {
      character = characters[0][0];
    }

    var color = this.editor.currentTile.color;
    var bgColor = this.editor.currentTile.bgColor;
    var rx = this.editor.currentTile.rotX;
    var ry = this.editor.currentTile.rotY;
    var rz = this.editor.currentTile.rotZ;

    var fh = this.editor.currentTile.flipH;
    var fv = this.editor.currentTile.flipV;

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

    var rows = [];

    var segments = 300;
    var angle = 0;
    for(var i = 0; i < segments; i++) {
      angle = (2 * Math.PI) * i / segments;

      var x = Math.round(centerX + widthScale * radius * Math.cos(angle));
      var y = Math.round(centerY + heightScale * radius * Math.sin(angle));

      var found = false;
      for(var j = 0; j < rows.length; j++) {
        if(rows[j].y === y) {
          found = true;
          if(rows[j].x1 !== x) {
            rows[j].x2 = x;
          }
          break;
        }
      }

      if(!found) {
        rows.push({ y: y, x1: x, x2: false });
      }

      var cellData = layer.getCell({ x: x, y: y });
      if(!this.editor.tools.drawTools.drawCharacter) {
        character = cellData.t;
      }
      if(!this.editor.tools.drawTools.drawColor) {
        color = cellData.fc;
      }
      if(!this.editor.tools.drawTools.drawBgColor) {
        bgColor = cellData.bc;
      }                       

      if(x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {

        if(this.plane == 'xz') {
          this.addCharacter(character, x, gridY, y, color, bgColor);
        } else {
          this.addCharacter(character, x, y, z, color, bgColor);
        }
        this.grid[y][x].bc = bgColor;
        this.grid[y][x].fc = color;
        this.grid[y][x].t = character;
        this.grid[y][x].rx = rx;
        this.grid[y][x].ry = ry;
        this.grid[y][x].rz = rz;

        this.grid[y][x].fh = fh;
        this.grid[y][x].fv = fv;

      }

    }


    if(this.fill) {
      // fill...
      for(var j = 0; j < rows.length; j++) {
        var fromX = rows[j].x1;
        var toX = rows[j].x2;
        if(toX !== false) {
          if(fromX > toX) {
            var temp = toX;
            toX = fromX;
            fromX = temp;      
          }

          y = rows[j].y;
          for(var x = fromX + 1; x < toX; x++) {
            var cellData = layer.getCell({ x: x, y: y });

            if(!this.editor.tools.drawTools.drawCharacter) {
              character = cellData.t;
            }
            if(!this.editor.tools.drawTools.drawColor) {
              color = cellData.fc;
            }
            if(!this.editor.tools.drawTools.drawBgColor) {
              bgColor = cellData.bc;
            }                       

            if(x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {

              this.addCharacter(character, x, y, z, color, bgColor);
              this.grid[y][x].bc = bgColor;
              this.grid[y][x].fc = color;
              this.grid[y][x].t = character;
              this.grid[y][x].rx = rx;
              this.grid[y][x].ry = ry;
              this.grid[y][x].rz = rz;

              this.grid[y][x].fh = fh;
              this.grid[y][x].fv = fv;

            }
          }
        }
      }
    }

    this.editor.graphic.redraw();
  }
}