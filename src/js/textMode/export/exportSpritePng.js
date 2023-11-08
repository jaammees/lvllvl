var ExportSpritePng = function() {
  this.editor = null;

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = UI.devicePixelRatio;


  this.spritesCanvas = null;
  this.spritesContext = null;



  this.scale = 1;
  this.addTransparentPixel = false;

  this.playMode = 'loop';

  this.imageEffectsControl = null;


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;

  this.mouseIsDown = false;

  this.exportLayer = 'all';
  this.showPrevFrameSave = false;
  this.visible = false;

}


ExportSpritePng.prototype = {


  init: function(editor) {
    this.editor = editor;
  },

  htmlComponentLoaded: function() {
    this.componentsLoaded++;
    if(this.componentsLoaded == 2) {

      this.initContent();
      this.initEvents();
    }
  },

  createUI: function() {
    var _this = this;
    
    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSpritePngDialog", "title": "Export PNG", "width": 690 });

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.componentsLoaded = 0;

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "exportSpritePngSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.propertiesSplit = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.propertiesSplit);

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.add(this.htmlComponent);

      this.htmlComponent.load('html/textMode/exportSpritePng.html', function() {
        _this.htmlComponentLoaded();      
      });

      this.previewComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.addNorth(this.previewComponent, 290);

      this.previewComponent.load('html/textMode/exportSpritePngPreview.html', function() {
        _this.htmlComponentLoaded();
        
      });

      this.previewComponent.on('resize', function() {
        _this.resizePreview();
      });

      this.okButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-199-save.svg"> Download', "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.exportPng();
        UI.closeDialog();
      });

      this.copyButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.copyButton);
      this.copyButton.on('click', function(event) {
        _this.copyToClipboard();
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.editor.frames.setShowPrevFrame(_this.showPrevFrameSave);
      });

      this.htmlComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
        event.preventDefault();
      });

      this.htmlComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
        event.preventDefault();
      });

      this.uiComponent.on('mousedown', function(event) {
        _this.mouseDown(event);
      });

      this.uiComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
      });
      this.uiComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
      });


    } else {
      this.initContent();
    }
  },

  show: function() {
    var _this = this;

    this.mouseIsDown = false;
    this.showPrevFrameSave = this.editor.frames.getShowPrevFrame();
    this.editor.frames.setShowPrevFrame(false);

    this.createUI();

    UI.showDialog("exportSpritePngDialog");
    this.visible = true;
    //this.initContent();
    this.resizePreview();

    if(typeof ClipboardItem !== 'undefined') {
      this.copyButton.setVisible(true);
    } else {
      this.copyButton.setVisible(false);
    }

  },  


  resizePreview: function() {
    if(!this.visible) {
      return;
    }

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportSpritePngPreview');
      $('#exportSpritePngPreview').on('mouseenter', function() {
        UI.setCursor('can-drag');
      });
      $('#exportSpritePngPreview').on('mouseleave', function() {
//        UI.setCursor('default');
      });

    }

    var element = $('#exportSpritePngPreviewHolder');
    if(!element || element.length == 0) {
      return;
    }

    var position = element.offset();
    if(position) {
      this.left = position.left;
      this.top = position.top;

      this.width = element.width();
      this.height = element.height();
    }

    this.previewCanvasScale = UI.devicePixelRatio;

    if(this.width != this.previewCanvas.style.width || this.height != this.previewCanvas.style.height) {
      if(this.width != 0 && this.height != 0) {
        
        this.previewCanvas.style.width = this.width + 'px';
        this.previewCanvas.style.height = this.height + 'px';

        this.previewCanvas.width = this.width * this.previewCanvasScale;
        this.previewCanvas.height = this.height * this.previewCanvasScale;
      }
    }

    this.previewContext = UI.getContextNoSmoothing(this.previewCanvas);
    
    this.drawPreview({ redrawLayers: false, applyEffects: false});
  },


  initContent: function() {
    var _this = this;

    $('#exportSpritePNGAs').val(g_app.fileManager.filename);

    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('exportSpritePngPreview');
      this.previewContext = UI.getContextNoSmoothing(this.previewCanvas);
    }


    this.exportLayer = 'current';

    this.addTransparentPixel = $('#exportSpritePNGTransparentPixel').is(':checked');

    var screenWidth =  this.editor.graphic.getGraphicWidth();
    var screenHeight = this.editor.graphic.getGraphicHeight();

    this.previewScale = 1;
    this.previewOffsetX = -screenWidth / 2;
    this.previewOffsetY = -screenHeight / 2;

    this.drawPreview();
    this.resizePreview();

  },

  initEvents: function() {
    var _this = this;


    $("input[type='radio'][name='exportSpritePNGScale']").on('click', function() {
      var scale = $("input[type='radio'][name='exportSpritePNGScale']:checked").val();
      _this.setScale(scale);
      _this.drawPreview();
    });


    $('#exportSpritePNGTransparentPixel').on('click', function() {
      _this.addTransparentPixel = $('#exportSpritePNGTransparentPixel').is(':checked');
      _this.drawPreview();
    });


    $('#exportSpritePngPreview').on('mousedown', function(e) {
      _this.previewMouseDown(e);

    });

    $('#exportSpritePngPreview').on('wheel', function(event) {
      _this.previewMouseWheel(event.originalEvent);
    });    



    $('#spritepngExportPreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#spritepngExportPreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#spritepngExportPreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });


    $('#exportSpritePNGAsFileBrowse').on('click', function() {
      g_electronFiles.saveAsDialog(function(response) {
        console.log('save as response');
        var path = response.path;
        $('#exportSpritePNGAsFile').val(path);    
      });
    });

  },



  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawPreview({ redrawLayers: false, applyEffects: false});

    var displayScale = Math.floor(scale * 100);
    $('#spritepngExportPreviewScale').val(displayScale);
    $('#spritepngExportPreviewScaleText').val(displayScale);
  },

  previewMouseWheel: function(event) {
    event.stopPropagation();  
    event.preventDefault();  

    var wheel = normalizeWheel(event);
    var newScale = this.previewScale - wheel.spinY  / 8;//12;
    if(newScale >= 0.1) {
      this.setPreviewScale(newScale);
    }
  },


  previewMouseDown: function(event) {
    var x = event.offsetX;
    var y = event.offsetY;


    this.mouseDownAtX = event.clientX;
    this.mouseDownAtY = event.clientY;
    this.currentOffsetX = this.previewOffsetX;
    this.currentOffsetY = this.previewOffsetY;

    this.mouseIsDown = true;

    UI.setCursor('drag');
    UI.captureMouse(this);


  },


  mouseDown: function(e) {

  },

  mouseMove: function(e) {
    if(this.mouseIsDown) {

      var x = e.clientX;
      var y = e.clientY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;      

      this.previewOffsetX = this.currentOffsetX + diffX / this.previewScale;
      this.previewOffsetY = this.currentOffsetY + diffY / this.previewScale;

      this.drawPreview({ redrawLayers: false, applyEffects: false});
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  },

  drawPreview: function(args) {
    // need to redraw characters?
    var redrawLayers = true;
    if(typeof args != 'undefined' && typeof args.redrawLayers != 'undefined') {
      redrawLayers = args.redrawLayers;
    }


    var frame = this.editor.graphic.getCurrentFrame();

    if(redrawLayers) {
      this.drawFrames();
    }


//    this.previewContext.fillStyle = 'black';// '#000000';
//    this.previewContext.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 

    var backgroundWidth = this.previewCanvas.width;
    var backgroundHeight = this.previewCanvas.height;
    var checkerboardCanvas = this.editor.checkerboardPattern.getCanvas(backgroundWidth, backgroundHeight);
    //this.previewContext.drawImage(this.backgroundCanvas, 0, 0);
    this.previewContext.drawImage(checkerboardCanvas, 0, 0, backgroundWidth, backgroundHeight, 0, 0, backgroundWidth, backgroundHeight);
    this.previewContext.save();

    this.previewContext.translate( Math.floor(this.previewCanvas.width / 2), Math.floor(this.previewCanvas.height / 2)); 
    this.previewContext.scale(this.previewScale * this.previewCanvasScale, 
      this.previewScale * this.previewCanvasScale);

    this.previewContext.drawImage(this.spritesCanvas, this.previewOffsetX, this.previewOffsetY);
    this.previewContext.restore();

  },


  readParameters: function() {

  },

  setScale: function(scale) {
    var oldScale = this.scale;

    this.scale = scale;

    this.previewOffsetY = Math.floor(this.previewOffsetY * this.scale / oldScale);    
    this.previewOffsetX = Math.floor(this.previewOffsetX * this.scale / oldScale);    
  },

  
  drawFrames: function() {
    if(!this.editor.layers) {
      return;
    }

    var layers = this.editor.layers.getLayers();
    var frameCount = this.editor.graphic.getFrameCount();

    var cellWidth = 21;
    var cellHeight = 24;
    var cellHPadding = 2;

    var spritesWidth = 24;
    var spritesHeight = 0;

    for(var i = layers.length - 1; i >= 0; i--) {
      var layerObject = this.editor.layers.getLayerObject(layers[i].layerId);
      if(layerObject && layerObject.getType() == 'grid') {
        var tileSet = layerObject.getTileSet();
        if(tileSet) {
          var tileWidth = tileSet.getTileWidth();
          var tileHeight = tileSet.getTileHeight();
          var gridWidth = layerObject.getGridWidth();
          var gridHeight = layerObject.getGridHeight();

          var layerWidth = frameCount * gridWidth * tileWidth;

          if(layerWidth > spritesWidth) {
            spritesWidth = layerWidth;
          }
          spritesHeight += gridHeight * tileHeight;

        }
      }

    }

    if(this.spritesCanvas == null) {
      this.spritesCanvas = document.createElement('canvas');
    }


    if(this.spritesContext == null || this.spritesCanvas.width != spritesWidth || this.spritesCanvas.height != spritesHeight) {
      this.spritesCanvas.width = spritesWidth;
      this.spritesCanvas.height = spritesHeight;
      this.spritesContext = UI.getContextNoSmoothing(this.spritesCanvas);
    }


    var canvas = this.spritesCanvas;
    var context = this.spritesContext;


    context.clearRect(0, 0, canvas.width, canvas.height);

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    

    var xPosition = 0;
    var yPosition = 0;


    for(var i = layers.length - 1; i >= 0; i--) {
      xPosition = 0;
      var layerObject = this.editor.layers.getLayerObject(layers[i].layerId);
      if(layerObject && layerObject.getType() == 'grid') {
        var tileSet = layerObject.getTileSet();
        if(tileSet) {
          var tileWidth = tileSet.getTileWidth();
          var tileHeight = tileSet.getTileHeight();
          var gridWidth = layerObject.getGridWidth();
          var gridHeight = layerObject.getGridHeight();

          var spriteWidth = tileWidth * gridWidth;
          var spriteHeight = tileHeight * gridHeight;

          var args = {};
          args['screenMode'] = layerObject.getScreenMode();
          if(args['screenMode'] === TextModeEditor.Mode.INDEXED) {
            args['transparentColorIndex'] = layerObject.getTransparentColorIndex();
          }
    
          args['imageData'] = imageData;

          for(var f = 0; f < frameCount; f++) {
//            xPosition = f * cellWidth;// + cellHPadding;

            for(var y = 0; y < gridHeight; y++) {
              for(var x = 0; x < gridWidth; x++) {
                var cellData = layerObject.getCell({ x: x, y: y, frame: f });
                if(cellData) {
                  args['color'] = cellData.fc;
                  args['bgColor'] = cellData.bc;
                  args['character'] = cellData.t;

                  if(layerObject.getScreenMode() === TextModeEditor.Mode.C64MULTICOLOR) {
                    args['backgroundColor'] = layerObject.getBackgroundColor(f);
                    args['c64Multi1Color'] = layerObject.getC64Multi1Color(f);
                    args['c64Multi2Color'] = layerObject.getC64Multi2Color(f);      
                  }

                  args['x'] = (x * tileWidth + xPosition);
                  args['y'] = (y * tileHeight + yPosition);

                  args['scale'] = 1;
                  tileSet.drawCharacter(args);

                  xPosition += tileWidth;
                  
                }
              }
            }
//            xPosition += this.cellWidth;
          }

          yPosition += cellHeight;
        }
      }
    }

  
    context.putImageData(imageData, 0, 0);


  },

  copyToClipboard: function() {
    this.spritesCanvas.toBlob(function(blob) { 
      var item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]); 
    });
  },


  savePng: function() {
    var path = $('#exportSpritePNGAsFile').val();
    g_electronFiles.saveCanvasAsPNG(this.spritesCanvas, { "path": path }, function(result) {
      console.log('save result  =');
      console.log(result);
    });
    /*
    this.spritesCanvas.toBlob(function(data) {
      var r = new FileReader(); 
      r.onloadend = function() {
        var data = new Uint8Array(r.result);
        var path = $('#exportSpritePNGAsFile').val();

        g_electronFiles.saveFile({
          data: data,
          path: path
        });            
      }

      r.readAsArrayBuffer(data);

    }, 'image/png'); //toDataURL("image/png");    
    */

  },

  exportPng: function() {
    if(g_app.isDesktopApp()) {
      this.savePng();
      return;
    }

    var filename = $('#exportSpritePNGAs').val();

    this.drawPreview();

    if(filename.indexOf('.png') == -1) {
      filename += ".png";
    }


    var dataURL = this.spritesCanvas.toDataURL("image/png");    
    download(dataURL, filename, "image/png");    
  }

}
