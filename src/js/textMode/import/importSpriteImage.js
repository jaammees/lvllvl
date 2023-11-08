var ImportSpriteImage = function() {
  this.editor = null;

  this.visible = false;
  this.loadImage = null;
  this.loadImageCanvas = null;
  this.canvasComponent= null;

  this.canvasScale = 5;

  this.spritePreview = null;
  this.spritePreviewIndex = 0;

  this.importCanvas = null;
  this.importContext = null;

  this.spriteSource = null;

  this.spriteCount = 1;
  this.spritesAcross = 10;
  this.spritesDown = 1;
  this.spriteWidth = 24;
  this.spriteHeight = 21;

  this.spriteXOffset = 0;
  this.spriteYOffset = 0;
  this.spriteMarginRight = 0;
  this.spriteMarginBottom = 0;
  this.spriteRects = [];

  this.rectWidth = 24;
  this.rectHeight = 21;

  this.resizeSource = 1;
}

ImportSpriteImage.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "importSpriteImageDialog", "title": "Import", "width": 615, "height": 500 });

      var splitPanel = UI.create("UI.SplitPanel", {});
      this.uiComponent.add(splitPanel);
      
      var html = '    <div class="formGroup">';
      html += '<div style="margin-bottom: 6px">';
      html += ' Choose an image file (.png, .jpg, .gif) containing a sprites';
      html += ' </div>';

      html += '<div class="ui-button ui-button-nextaction" id="importSpriteChooseFile">Choose...</div>';
      html += '<input type="file" id="importSpriteFile" style="position: absolute; top: -50px; left: -100px"/>';
      html += '</div>';


      var controls = UI.create("UI.HTMLPanel", { "html": html })
      splitPanel.addNorth(controls, 50, false);


      var html = '';
      html += '<div id="importSpriteControls">';

      html += 'Sprites:'
      html += '<input type="text" size="2" class="number importSpriteParam" data-param="count" min="1" max="200" value="1" id="importSprite-count">';


      html += 'Reize Source:';
      html += '<select id="importSprite-resize">';
      html += '<option value="100">100%</option>';
      html += '<option value="50">50%</option>';
      html += '<option value="25">25%</option>';
      html += '</select>';
      html += 'X Offset:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="0" max="200" data-param="xoffset" value="0" id="importSprite-xoffset">';

      html += 'Y Offset:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="0" max="200" data-param="yoffset"  value="0" id="importSprite-yoffset">';

      html += 'Margin Right:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="0" max="200" data-param="margin-right" value="0" id="importSprite-margin-right">';

      html += 'Margin Bottom:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="0" max="200" data-param="margin-bottom"  value="0" id="importSprite-margin-bottom">';

      html += 'Rect Width:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="1" max="200" data-param="rect-width" value="24" id="importSprite-rect-width">';

      html += 'Rect Height:'
      html += '<input type="text" size="2" class="number importSpriteParam" min="1" max="200" data-param="rect-height"  value="21" id="importSprite-rect-height">';


      html += '</div>';
      var bottomControls = UI.create("UI.HTMLPanel", { "html": html });
      splitPanel.addSouth(bottomControls, 40, false);


      html = '<div>';

      html += '<canvas id="importSpritePreview" style="border: 1px solid #333333"></canvas>';

      html += '<div>';
      html += '  <div class="ui-button" id="importSpritePreviewPrev">&lt;</div>';
      html += '  &nbsp';
      html += '  <div class="ui-button" id="importSpritePreviewNext">&gt;</div>';
      html += '</div>';


      html += '</div>';
      var spritePreviewPanel = UI.create("UI.HTMLPanel", { "html": html });
      splitPanel.addWest(spritePreviewPanel, 200, false);

      this.canvasComponent = UI.create('UI.CanvasScrollPanel');

      var _this = this;
      this.canvasComponent.draw = function(context) {
        _this.draw(context);
      }

      splitPanel.add(this.canvasComponent);

      this.initContent();
      this.initEvents();


      this.okButton = UI.create('UI.Button', { "text": "Import", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.doImport();
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
    UI("importSpriteImageDialog").setWidth(615);
    UI("importSpriteImageDialog").setHeight(490);

    UI.showDialog("importSpriteImageDialog");

    this.resize();
    this.visible = true;
  },  

  initContent: function() {
    if(this.canvas == null) {
//      this.canvas = document.getElementById('importSpriteImageCanvas');

      this.canvasComponent.resize();      
      this.canvas = this.canvasComponent.getCanvas();
    }

    if(this.loadImageCanvas == null) {
      this.loadImageCanvas = document.createElement('canvas');
    }

    if(this.spritePreview == null) {
      this.spritePreview = document.getElementById('importSpritePreview');
      this.spritePreview.width = 24 * 8;
      this.spritePreview.height = 21 * 8;

      this.spritePreviewContext = this.spritePreview.getContext('2d');
      this.spritePreviewContext.imageSmoothingEnabled = false;
      this.spritePreviewContext.webkitImageSmoothingEnabled = false;
      this.spritePreviewContext.mozImageSmoothingEnabled = false;
      this.spritePreviewContext.msImageSmoothingEnabled = false;
      this.spritePreviewContext.oImageSmoothingEnabled = false;
  
    }
    this.setCanvasSize();
  },  

  setCanvasSize: function() {
    return;
    this.canvas.width = 200;
    this.canvas.height = 200;

    this.context = this.canvas.getContext('2d');
  },

  initEvents: function() {
    var _this = this;

    this.spriteCount = parseInt($('#importSprite-count').val(), 10);
    this.spriteXOffset = parseInt($('#importSprite-xoffset').val(), 10);;
    this.spriteYOffset = parseInt($('#importSprite-yoffset').val(), 10);;
    this.spriteMarginRight = parseInt($('#importSprite-margin-right').val(), 10);;
    this.spriteMarginBottom = parseInt($('#importSprite-margin-bottom').val(), 10);;
    this.rectWidth = parseInt($('#importSprite-rect-width').val(), 10);
    this.rectHeight = parseInt($('#importSprite-rect-height').val(), 10);

    $('#importSpriteChooseFile').on('click', function() {
      $('#importSpriteFile').click();
    });


    document.getElementById('importSpriteFile').addEventListener("change", function(e) {
      var file = document.getElementById('importSpriteFile').files[0];
      _this.chooseImportSpriteFile(file);
    });

    this.uiComponent.on('resize', function() {
      _this.resize();
    });

    UI.number.initControls('#importSpriteControls .number');

    $('.importSpriteParam').on('keyup', function(e) {
      var c = parseInt($(this).val(), 10);
      var type = $(this).attr('data-param');

      if(!isNaN(c)) {
        _this.setParam(type, c);
      }
    });

    $('.importSpriteParam').on('change', function(e) {
      var c = parseInt($(this).val(), 10);
      var type = $(this).attr('data-param');

      if(!isNaN(c)) {
        _this.setParam(type, c);
      }
    });

    $('#importSpritePreviewPrev').on('click', function(e) {
      var index = _this.spritePreviewIndex -1;
      if(index >= 0) {
        _this.setSpritePreviewIndex(index);
      }
    });

    $('#importSpritePreviewNext').on('click', function(e) {
      var index = _this.spritePreviewIndex + 1;
      if(index < _this.spriteCount) {
        _this.setSpritePreviewIndex(index);
      }
    });


    $('#importSprite-resize').on('change', function(e) {
      var resize = parseInt($(this).val(), 10);
      _this.setResizeSource(resize);
    });


  },

  setSpritePreviewIndex: function(index) {
    this.spritePreviewIndex = index;
    this.drawSpritePreview();
  },


  setParam: function(type, c) {
    switch(type) {
      case 'count':
        this.setSpriteCount(c);
      break;
      case 'xoffset':
        this.setSpriteXOffset(c);
      break;
      case 'yoffset':
        this.setSpriteYOffset(c);
      break;
      case 'margin-right':
        this.setSpriteMarginRight(c);
        break;
      case 'margin-bottom':
        this.setSpriteMarginBottom(c);
        break;
      case 'rect-width':
        this.setRectWidth(c);
        break;
      case 'rect-height':
        this.setRectHeight(c);
        break;
    }
  },

  setResizeSource: function(resizeSource) {
    this.resizeSource = resizeSource / 100;
    this.draw(this.context);
  },

  setSpriteCount: function(c) {
    this.spriteCount = c;
    if(this.spritePreviewIndex >= this.spriteCount) {
      this.spritePreviewIndex = this.spriteCount - 1;
    }
    this.setSpriteRects();
    this.draw(this.context);
  },

  setSpriteXOffset: function(c) {
    this.spriteXOffset = c;
    this.setSpriteRects();
    this.draw(this.context);
  },


  setSpriteYOffset: function(c) {
    this.spriteYOffset = c;
    this.setSpriteRects();
    this.draw(this.context);
  },

  setSpriteMarginRight: function(c) {
    this.spriteMarginRight = c;
    this.setSpriteRects();
    this.draw(this.context);
  },

  setSpriteMarginBottom: function(c) {
    this.spriteMarginBottom = c;
    this.setSpriteRects();
    this.draw(this.context);
  },

  setRectWidth: function(c) {
    this.rectWidth = c;
    this.setSpriteRects();
    this.draw(this.context);
  },

  setRectHeight: function(c) {
    this.rectHeight = c;
    this.setSpriteRects();
    this.draw(this.context);
  },

  resize: function() {
    console.log('resize');
    this.canvasComponent.resize();
    this.context = this.canvasComponent.getContext();
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;

    this.draw();
  },

  drawSpriteImageCanvas: function() {

  },

  chooseImportSpriteFile: function(file) {
    if(typeof file == 'undefined') {
      return;
    }

    var _this = this;
    var filename = file.name;
    var dotPos = filename.lastIndexOf('.');
    var extension = filename.split('.').pop().toLowerCase();

    var loadFormat = false;
    switch(extension) {
      case 'png':
      case 'gif':
      case 'jpg':
      case 'jpeg':
        loadFormat = 'image';
        break;
    }

    if(loadFormat === false) {
      return;
    }

    this.loadFormat = loadFormat;

    if(this.loadFormat == 'image') {
      if(!this.loadImage) {
        this.loadImage = new Image();
      }

      var url = window.URL || window.webkitURL;
      var src = url.createObjectURL(file);

      this.loadImage.onload = function() {
        var imageWidth = _this.loadImage.naturalWidth;
        var imageHeight = _this.loadImage.naturalHeight;

        _this.loadImageCanvas.width = imageWidth;
        _this.loadImageCanvas.height = imageHeight;
        _this.loadImageContext = _this.loadImageCanvas.getContext('2d');

        _this.loadImageContext.drawImage(_this.loadImage, 0, 0);

        _this.loadImageData = _this.loadImageContext.getImageData(0, 0, imageWidth, imageHeight);    


        _this.setSpriteSource();

        _this.draw(this.context);


      }

      this.loadImage.src = src;

    }
  },

  setSpriteSource: function() {
    console.log('set sprite source');
    if(this.spriteSource == null) {
      this.spriteSource = document.createElement('canvas');
    }

    this.spriteSource.width = this.loadImageCanvas.width;
    this.spriteSource.height = this.loadImageCanvas.height;

    this.spriteSourceContext = this.spriteSource.getContext('2d');

    this.spriteSourceContext.drawImage(this.loadImageCanvas, 0, 0);

    this.setSpriteRects();
  },

  setSpriteRects: function() {
    this.spriteRects = [];
    var x = 0;
    var y = 10;
    var marginRight = this.spriteMarginRight;
    var marginBottom = this.spriteMarginBottom;

    for(var i = 0; i < this.spriteCount; i++) {
      x = this.spriteXOffset + i * (this.rectWidth + marginRight);
      y = this.spriteYOffset;
      this.spriteRects.push({
        x: x,
        y: y,
        width: this.rectWidth,
        height: this.rectHeight
      });
    }
  },

  drawSpriteRects: function() {

    var context = this.context;
    context.beginPath();
    context.strokeStyle = "#00ff00";
    for(var i = 0; i < this.spriteRects.length; i++) {
      context.rect(
        (this.spriteRects[i].x * this.canvasScale) + 0.5,
        (this.spriteRects[i].y * this.canvasScale) + 0.5,
        this.spriteRects[i].width * this.canvasScale,
        this.spriteRects[i].height * this.canvasScale
      );
    }
    context.stroke();
    

  },

  draw: function(context) {
    if(this.loadImageCanvas) {
      this.context.fillStyle= '#111111';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if(this.spriteSource) {
        this.previewCanvasScale = 1;
        this.context.save();    

//        this.previewContext.translate( Math.floor(this.previewCanvas.width / 2), Math.floor(this.previewCanvas.height / 2) ); 
        this.context.scale(this.canvasScale * this.resizeSource * this.previewCanvasScale, 
          this.canvasScale * this.resizeSource * this.previewCanvasScale);
            
        this.context.drawImage(this.spriteSource, 0, 0);



        this.context.restore();
        this.drawSpriteRects();


        this.drawSpritePreview(0);
      }
    }
  },

  drawSpritePreview: function() {
    var rect = this.spriteRects[this.spritePreviewIndex];
    var scale = 1 / this.resizeSource;

    this.spritePreviewContext.clearRect(0, 0, this.spritePreview.width, this.spritePreview.height);
    this.spritePreviewContext.drawImage(this.spriteSource,
      rect.x * scale,
      rect.y * scale,
      rect.width * scale,
      rect.height * scale,
      0,
      0,
      this.spritePreview.width,
      this.spritePreview.height
    );
  },

  doImport: function() {

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var graphic = this.editor.graphic;
    graphic.setDrawEnabled(false);
    this.editor.history.setEnabled(false);
    var tileSet = layer.getTileSet();

    /*
    if(this.sprMulticolor) {
      layer.setScreenMode(TextModeEditor.Mode.C64MULTICOLOR);
      layer.setC64Multi1Color(this.multiColor1);
      layer.setC64Multi2Color(this.multiColor2);
      } else {
      layer.setScreenMode(TextModeEditor.Mode.TEXTMODE);
    }
*/
    layer.setCreateSpriteTiles(false);
    layer.setBlankTileId(0);

    

    // create the import canvas
    if(this.importCanvas == null) {
      this.importCanvas = document.createElement('canvas');
    }

    this.importCanvas.width = this.spriteWidth;
    this.importCanvas.height = this.spriteHeight;

    this.importContext = this.importCanvas.getContext('2d');
    this.importContext.imageSmoothingEnabled = false;
    this.importContext.webkitImageSmoothingEnabled = false;
    this.importContext.mozImageSmoothingEnabled = false;
    this.importContext.msImageSmoothingEnabled = false;
    this.importContext.oImageSmoothingEnabled = false;

    var foregroundColor = this.editor.currentTile.getColor();;

    for(var i = 0; i < this.spriteCount; i++) {
      var tileId = tileSet.createTile();
      console.log('create tile: ' + tileId);


      this.importContext.clearRect(0, 0, this.importCanvas.width, this.importCanvas.height);
      var srcRect = this.spriteRects[i];
      var drawWidth = srcRect.width;
      var drawHeight = srcRect.height;
      var offsetX = 0;
      var offsetY = 0;
      
      var scale = 1 / this.resizeSource;
  
      this.importContext.drawImage(this.spriteSource,
        srcRect.x * scale,
        srcRect.y * scale,
        srcRect.width * scale,
        srcRect.height * scale,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
        
      var imageData = this.importContext.getImageData(0, 0, this.spriteWidth, this.spriteHeight);

      var tileData = [];

      for(var y = 0; y < this.spriteHeight; y++) {
        for(var x = 0; x < this.spriteWidth; x++) {
          var src = (x + y * this.spriteWidth) * 4;
          if(imageData.data[src] > 100) {
            
            // set pixel
            tileData.push(1);
//            tileSet.setPixel(x, y, 1, false);
          } else {
            // dont set pixel
            tileData.push(0);
//            tileSet.setPixel(x, y, 0, false);
          }
        }
      }

      tileSet.setTileData(tileId, tileData);
      console.log('set tile data: ' + tileId);
      console.log(tileData);

      if(i !== 0) {
        var frame = graphic.insertFrame();
        graphic.setCurrentFrame(frame);
      }

      var args = {};
      args.update = false;
      args.x = 0;
      args.y = 0;
          
      args.t = tileId; 
      args.fc = foregroundColor;
      args.bc = this.editor.colorPaletteManager.noColor;
      console.log(args);
      layer.setCell(args);

    }

    layer.setCreateSpriteTiles(true);
    this.editor.history.setEnabled(true);
    graphic.setDrawEnabled(true);    
    this.editor.spriteFrames.draw({ framesChanged: true });
    this.editor.frames.gotoFrame(0);
    this.editor.graphic.redraw();


  },
  /*
  ,

  previewSprite: function() {
    this.context.drawImage(this.loadImageCanvas, 0, 0);

  }
  */
}