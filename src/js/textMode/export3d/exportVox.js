var ExportVox = function() {
  this.editor = null;

  this.data = null;
  this.voxels = [];
  this.palette = [];

  this.width = 0;
  this.height = 0;
  this.depth = 0;

  this.uiComponent = null;
}


//https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt

ExportVox.prototype = {

  init: function(editor) {
    this.editor = editor;   

    for (var i = 256; --i > -1;) {
      this.palette.push(0xff000000 | i | (i << 8) | (i << 16));
    }

    this.voxels = [];

  },

  start: function() {

    var _this = this;
    if(this.uiComponent == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="exportVoxFilename">Filename:</label>';
      html += '  <input type="text" class="formControl submitOnEnter" id="exportVoxFilename" size="20"/>';
      html += '</div>';


      var width = 200;
      var height = 200;
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportVoxDialog", "title": "Export VOX", "width": width, "height": height });

      this.exportVoxHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.exportVoxHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        var filename = $('#exportVoxFilename').val();
        _this.doExport({
          filename: filename
        });
        UI.closeDialog();
      });
 
      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.addButton(okButton);
      this.uiComponent.addButton(closeButton);    
    }

    UI.showDialog("exportVoxDialog");
    this.initContent();
  },

  initContent: function() {

  },

  doExport: function(args) {
    var filename = args.filename;
    console.log('do export to ' + filename);
  },

  setVoxel: function(x, y, z, i) {
    i |= 0;
    x |= 0;
    y |= 0;
    z |= 0;

    if (i >= 0 && i < 256 && x >= 0 && y >= 0 && z >= 0 && x < this.width && z < this.height && y < this.depth) {
      var key = x + "_" + y + "_" + z
      if (i > 0) {
        if (!this.voxels[key]) this.vcount++;
        this.voxels[key] = i;
      } else {
        if (this.voxels[key]) this.vcount--;
        delete this.voxels[key];
      }
    }
  },


  writeString: function(str) {
    for (var i = 0, j = str.length; i < j; ++i) {
      this.data.push(str.charCodeAt(i));
    }
  },

  writeUInt32: function(n) {
    this.data.push(n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff);
  },
 
  writeRGBA: function(n) {
    this.data.push((n >>> 16) & 0xff,(n >>> 8) & 0xff, n & 0xff, (n >>> 24) & 0xff);
  },
  
  writeVoxel: function(key) {
    var v = key.split("_");
    this.data.push(v[0], v[1], v[2], this.voxels[key]);
  },



  doExport: function(args) {
    var filename = 'Untitled';
    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;

      }
    }
    this.data = [];
    this.voxels = [];
    this.vcount = 0;

    var grid3d = this.editor.grid3d;
    var layer = grid3d.getCurrentLayer();
    var colorPalette = layer.getColorPalette();
    var tileSet = layer.getTileSet();

    var colorCount = colorPalette.getColorCount();

    for(var i = 0; i < colorCount; i++) {
      var color = colorPalette.getHex(i)
      this.palette[i] = colorPalette.getHex(i);

    }

    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();
    var tileDepth = tileSet.getTileDepth();

    // z is y
    var sizeX = layer.getGridWidth() * tileWidth;
    var sizeY = layer.getGridDepth() * tileDepth;
    var sizeZ = layer.getGridHeight() * tileHeight;

    var max = 126;
    // 126 is the max size, need to round it to the neareset tile width
    var maxSizeX = Math.floor(max / tileWidth) * tileWidth;
    var maxSizeY = Math.floor(max / tileDepth) * tileDepth;
    var maxSizeZ = Math.floor(max / tileHeight) * tileHeight;

    this.width = sizeX;
    this.height = sizeZ;
    this.depth = sizeY;

    if(this.width > maxSizeX) {
      this.width = maxSizeX;
      sizeX = maxSizeX;
    }

    if(this.height > maxSizeZ) {
      this.height = maxSizeZ;
      sizeZ = maxSizeZ;
    }

    if(this.depth > maxSizeY) {
      this.depth = maxSizeY;
      sizeY = sizeY;
    }

    var frame = 0;


    var gridWidth = sizeX / tileWidth;
    var gridHeight = sizeZ / tileHeight;
    var gridDepth = sizeY / tileDepth;
    var noTile = this.editor.tileSetManager.noTile;

    var yOffset = 0;//this.editor.frames.height - gridHeight;
    
    for(var z = 0; z < gridDepth; z++) {
      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {
          var cell = layer.getCell(x, y, z);
          var tileIndex = cell.t;
          var tileFGColor = cell.fc;


          if(tileIndex != noTile) {
            for(var j = 0; j < tileHeight; j++) {
              for(var i = 0; i < tileWidth; i++) {
                var srcX = i;
                var srcY = j;

                if(tileSet.getPixel(tileIndex, srcX, srcY)) {

                  // need to look at rotation..
                  for(k = 0; k < tileDepth; k++) {
                    this.setVoxel(x * tileWidth + i, 
                                  z * tileDepth + k, 
                                  y * tileHeight + j, 
                                  tileFGColor + 1);
                  }

                } else {

                }

              }
            }
          }
        }
      }
    }

    var voxelCount = this.vcount;

    this.writeString("VOX ");
    this.writeUInt32(150);


    // chunk id
    this.writeString("MAIN");
    // chunk size
    this.writeUInt32(0);

    // bytes of children chunks
    this.writeUInt32(voxelCount * 4 + 0x434);


    // model size
    this.writeString("SIZE");
    // chunk size
    this.writeUInt32(12);

    // bytes of children chunks
    this.writeUInt32(0);

    this.writeUInt32(sizeX);
    this.writeUInt32(sizeY);
    this.writeUInt32(sizeZ);

    // model voxels
    this.writeString("XYZI");

    this.writeUInt32(4 + voxelCount * 4);
    this.writeUInt32(0);

    // number of voxels
    this.writeUInt32(voxelCount);


    // voxel x, y, z, color index
    for (var key in this.voxels) {
      this.writeVoxel(key);
    }

    // palette
    this.writeString("RGBA");
    this.writeUInt32(0x400);
    this.writeUInt32(0);


    for (var i = 0; i < 256; i++) {
      this.writeRGBA(this.palette[i]);
    }

    var data = new Uint8Array(this.data.length);   

    for(var i = 0; i < this.data.length; i++) {
      data[i] = this.data[i];
    }


    if(filename.indexOf('.vox') == -1) {
      filename += ".vox";
    }
    download(data, filename, "application/vox");
  }
}
