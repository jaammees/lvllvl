var Export3dGif = function() {
  this.editor = null;

  this.canvas = null;

  this.context = null;

  this.borderWidth = 4 * 8;
  this.borderHeight = 4 * 8;

  this.scale = 1;

  this.playMode = 'loop';

  this.previewCanvas = null;
  this.previewContext = null;
  this.previewCanvasScale = null;

  this.exportGifActive = false;

  this.playDirection = 1;
  this.lastFrameTime = 0;
  this.lastTickTime = 0;
  this.playFrames = true;
  this.currentFrame = 0;
  this.tick = 0;
  this.startFrame = 0;
  this.endFrame = 0;


  this.exportGIFFormat = 'gif';
  this.recordingVideo = false;
  this.exportLayer = 'all';


  this.previewOffsetX = 0;
  this.previewOffsetY = 0;
  this.previewScale = 1;
  this.mouseIsDown = false;

  this.fromFrame = 0;
  this.toFrame = 0;

  this.shaderTime = 0;

  this.msPerTick = 50;
  this.totalTicks = 0;

  this.framesTickCount = 0;
  this.frameTick = 0;

  this.exportProgressDialog = null;

  this.showPrevFrameSave = false;

  this.renderer = null;
  this.rendererCanvas = null;

  this.exportWidth = false;
  this.exportHeight = false;

  this.camera = null;
  this.orbitControls = null;

  this.cameraTarget = null;

  this.cursorEnabledSave = false;


}


Export3dGif.prototype = {

  initExportProgress: function() {
    var html = '<div>';
    html += '<h2>Export Progress</h2>';
    html += '<div id="export3dGifProgressText"></div>';
    html += '</div>';

    this.exportProgressDialog = UI.create("UI.Dialog", 
      { "id": "export3dGifProgressDialog", "title": "Export Progress", "width": 280, "height": 120 });



    this.exportProgressHTML = UI.create("UI.HTMLPanel", {"html": html});
    this.exportProgressDialog.add(this.exportProgressHTML);

  },

  init: function(editor) {
    this.editor = editor;

  },


  resizePreview: function() {
    if(this.previewCanvas == null) {
      this.previewCanvas = document.getElementById('export3dGifPreview');
      $('#export3dGifPreview').on('mouseenter', function() {
        UI.setCursor('can-drag');
      });
      $('#export3dGifPreview').on('mouseleave', function() {
//        UI.setCursor('default');
      });

    }

    if(this.previewCanvas == null) {
      return;
    }

    var element = $('#export3dGifPreviewHolder');

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

    this.previewContext = this.previewCanvas.getContext('2d');
    this.previewContext.imageSmoothingEnabled = false;
    this.previewContext.webkitImageSmoothingEnabled = false;
    this.previewContext.mozImageSmoothingEnabled = false;
    this.previewContext.msImageSmoothingEnabled = false;
    this.previewContext.oImageSmoothingEnabled = false;

  },

  initRenderer: function() {


    var width = 640;
    var height = 480;

    this.fov = 30;

    if(this.renderer == null) {
//      this.rendererCanvas = document.getElementById('export3dGifRenderCanvas');
      this.rendererCanvas.width = width;
      this.rendererCanvas.height = height;
      this.renderer = new THREE.WebGLRenderer({ canvas: this.rendererCanvas, antialias: true }); //antialias: true
      this.renderer.setSize( width, height );
    }


    this.exportWidth = width;
    this.exportHeight = height;
    this.renderer.setSize( this.exportWidth, this.exportHeight );

    this.renderScale = this.editor.gridView3d.getScale();

    this.camera.left = -this.exportWidth / (this.renderScale);
    this.camera.right = this.exportWidth / (this.renderScale);
    this.camera.top = this.exportHeight / (this.renderScale);
    this.camera.bottom = -this.exportHeight / (this.renderScale);        

    this.camera.aspect = this.exportWidth / this.exportHeight;
    this.camera.updateProjectionMatrix();

     
  },

  drawFrame: function(args) { 


    if(this.rendererCanvas == null) {
      // html component not loaded yet
      return;
    }

    var redrawLayers = true;

    if(typeof args != 'undefined') {
      if(typeof args.redrawLayers) {
        redrawLayers = args.redrawLayers;
      }

    }


    // make sure renderer is set up
    this.initRenderer();

    if(this.previewCanvas == null) {
      this.resizePreview();
    }

    if(this.previewCanvas == null) {
      return;
    }
    

    this.previewContext.fillStyle = '#000000';
    this.previewContext.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 


    if(redrawLayers) {
      // draw the frame
      var grid3d = this.editor.grid3d;
      grid3d.setCurrentFrame(this.currentFrame);
      var scene = grid3d.getScene();

      var xyGridVisible = grid3d.getXYGridVisible();
      var xzGridVisible = grid3d.getXZGridVisible();

      grid3d.setGridVisible(false);


      this.renderer.setClearColor( 0x222222 );

      grid3d.showAll();

      this.renderer.setClearColor( grid3d.getBackgroundColorRGB() );

      this.renderer.render( scene, this.camera);


      // set it back to the normal target
      grid3d.setXYGridVisible(xyGridVisible);
      grid3d.setXZGridVisible(xzGridVisible);

    }

    // draw to the preview canvas
    this.previewContext.save();
    this.previewContext.translate( Math.floor(this.previewCanvas.width / 2), Math.floor(this.previewCanvas.height / 2) ); 
    this.previewContext.scale(this.previewScale * this.previewCanvasScale, this.previewScale * this.previewCanvasScale);
    this.previewContext.drawImage(this.rendererCanvas, 
                                  this.previewOffsetX - this.exportWidth / 2, 
                                  this.previewOffsetY - this.exportHeight / 2);

    this.previewContext.restore();
  },

  htmlComponentLoaded: function() {
    this.componentsLoaded++;
    if(this.componentsLoaded == 3) {
      this.splitPanel.setPanelVisible('east', true);
      this.splitPanel.resize();

      var scale = 1;

      this.rendererCanvas = document.getElementById('export3dGifRenderCanvas');

      this.setScale(scale);
      this.initContent();
      this.initEvents();
    }

  },


  start: function() {
    var _this = this;

    this.lastTickTime = getTimestamp();

    this.showPrevFrameSave = this.editor.frames.getShowPrevFrame();
    this.editor.frames.setShowPrevFrame(false);

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "export3dGifDialog", "title": "Export GIF", "width": 734, "height": 626 });

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "export3dGifSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.uiComponent.on('resize', function() {
        _this.resizePreview();
      });


      this.componentsLoaded = 0;

      this.exportGIFFramesPanel = UI.create("UI.HTMLPanel");
      this.splitPanel.addEast(this.exportGIFFramesPanel, 324);

      this.exportGIFFramesPanel.load('html/textMode/export3dAsGifFrames.html', function() {
        _this.htmlComponentLoaded();
      });


            /*

      this.effectsSplitPanel = UI.create("UI.SplitPanel");
      this.splitPanel.addEast(this.effectsSplitPanel, 324);

      this.exportGIFFramesPanel = UI.create("UI.HTMLPanel");
      this.effectsSplitPanel.addNorth(this.exportGIFFramesPanel, 140);
      this.exportGIFFramesPanel.load('html/textMode/exportGifFrames.html', function() {
        _this.htmlComponentLoaded();
      });
     
      this.effectsHtmlComponent = UI.create("UI.HTMLPanel");
      this.effectsSplitPanel.add(this.effectsHtmlComponent);
      this.effectsHtmlComponent.load('html/textMode/exportGifEffects.html', function() {
        _this.htmlComponentLoaded();        
      });
      */


      this.propertiesSplit = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.propertiesSplit);
      this.htmlComponent = UI.create("UI.HTMLPanel");
      //this.splitPanel.add(this.htmlComponent);
      this.propertiesSplit.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/export3dAsGif.html', function() {
        _this.htmlComponentLoaded();        
      });

      this.previewComponent = UI.create("UI.HTMLPanel");
      this.propertiesSplit.addNorth(this.previewComponent, 330);

      this.previewComponent.load('html/textMode/export3dAsGifPreview.html', function() {
        _this.htmlComponentLoaded();
      });

      this.previewComponent.on('resize', function() {
        _this.resizePreview();
//        console.log('resize preview component');
      });


      this.okButton = UI.create('UI.Button', { "text": "Download", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.doExport();
      });

      /*
      this.gdriveButton = UI.create('UI.Button', { "text": "Save To GDrive", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.gdriveButton.on('click', function(event) {
        _this.saveToGDrive();
//        UI.closeDialog();
      });
      */

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.editor.grid3d.setCursorEnabled(_this.cursorEnabledSave);
        _this.cameraTarget.visible = false;        
        _this.editor.frames.setShowPrevFrame(_this.showPrevFrameSave);
        _this.exportGifActive = false;
      });

      this.initExportProgress();
    } else {
      this.initContent();
    }

    UI.showDialog("export3dGifDialog");
    this.exportGifActive = true;
  },  

  saveToGDrive: function() {
    g_app.gdrive.handleAuthClick();
  },

  initContent: function() {
    var _this = this;

    $('#export3dGIFAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.grid3d.getFrameCount();

    this.cursorEnabledSave = this.editor.grid3d.getCursorEnabled();
    this.editor.grid3d.setCursorEnabled(false);

    $('#export3dGIFToFrame').val(frameCount);
    $('#export3dGIFFromFrame').val(1);

    $('#export3dGIFFromFrame').attr('max', frameCount);
    $('#export3dGIFToFrame').attr('max', frameCount);

    this.playMode = $('#exportGIFLoopType').val();


    this.fov = 50;
    if(this.camera == null) {
      this.camera = new THREE.PerspectiveCamera( this.fov, 640/480, 0.1, 1000 );
      this.orbitControls = new THREE.OrbitControls( this.camera, document.getElementById('export3dGifRenderCanvas') );

      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      var material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
      this.cameraTarget = new THREE.Mesh( geometry, material );
      this.editor.grid3d.scene.add( this.cameraTarget );      
    }


    // copy the camera
    var gridViewCamera = this.editor.gridView3d.getCamera();
    this.camera.copy(gridViewCamera, true);
    this.camera.updateProjectionMatrix();



    $('#export3dCameraX').val(this.camera.position.x);
    $('#export3dCameraY').val(this.camera.position.y);
    $('#export3dCameraZ').val(this.camera.position.z);

    $('#export3dRotationX').val(this.camera.rotation.x * 180 / Math.PI);
    $('#export3dRotationY').val(this.camera.rotation.y * 180 / Math.PI);
    $('#export3dRotationZ').val(this.camera.rotation.z * 180 / Math.PI);


    $('#export3dCameraFOV').val(this.camera.fov);
    


    this.resizePreview();
    this.setFrameParameters();
    this.setCameraType();
//    this.calculateGifInfo();

  },

  initEvents: function() {
    var _this = this;
/*

    $('input[name=exportGIFFormat]').on('click', function() {
      _this.exportGIFFormat = $('input[name=exportGIFFormat]:checked').val();
    });

*/


    $('#export3dGifPreview').on('mousedown', function(event) {
      _this.previewMouseDown(event);

    });


    $('#export3dGifPreview').on('wheel', function(event) {
      _this.previewMouseWheel(event.originalEvent);
    });    


    $('#export3dGIFLoopType').on('change', function(event) {
      _this.setFrameParameters();
//      _this.playMode = $('#exportGIFLoopType').val();
    });

    $('#export3dGIFToFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#export3dGIFFromFrame').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#export3dGIFRepeat').on('change', function(event) {
      _this.setFrameParameters();
    });

    $('#export3dGIFSpeed').on('change', function(event) {
      if($(this).val() == 'custom') {
        $('#custom3dSpeedSection').show();
      } else {
        $('#custom3dSpeedSection').hide();

      }
      _this.setFrameParameters();
    });

    $('#export3dGIFMSPerTick').on('change', function() {
      _this.setFrameParameters();
    });


    $('#export3dGifPreviewScale').on('input', function(event) {
      var scale = $(this).val();
      _this.setPreviewScale(scale / 100);

    });

    $('#export3dGifPreviewScaleText').on('keyup', function(event) {
      var scale = parseInt($(this).val());
      if(isNaN(scale)) {
        return;
      }

      _this.setPreviewScale(scale / 100);
    });

    $('#export3dGifPreviewScaleReset').on('click', function() {
      _this.setPreviewScale(1);
    });

    $('.export3dCameraPosition').on('change', function() {
      _this.setCameraPosition();
    });

    $('.export3dCameraRotation').on('change', function() {
      _this.setCameraRotation();
    });

    $('#export3dCameraFOV').on('change', function() {
      _this.setCameraFOV();
    });


    $('.export3dCameraTarget').on('change', function() {
      _this.setCameraTarget();
      _this.drawFrame({ drawLayers: true });

    });

    $('#export3dAzimuthAngle').on('change', function() {
      _this.setCameraTarget();
      _this.drawFrame({ drawLayers: true });


    });

    $('#export3dAltitudeAngle').on('change', function() {
      _this.setCameraTarget();
      _this.drawFrame({ drawLayers: true });


    });
    $('#export3dCameraDistance').on('change', function() {
      _this.setCameraTarget();
      _this.drawFrame({ drawLayers: true });
    });

    $('input[name=export3dGIFCameraType]').on('click', function() {
      _this.setCameraType();
    });

    $('#export3dCameraAutorotate').on('click', function() {
      _this.setCameraType();
    });

  },


  setCameraType: function() {
    this.cameraType = $('input[name=export3dGIFCameraType]:checked').val();
    if(this.cameraType == 'position') {
      this.setCameraPosition();
      this.setCameraRotation();
      this.cameraTarget.visible = false;
      $('.export3dCameraPositionControls').show();
      $('.export3dCameraOrbitControls').hide();
    }

    if(this.cameraType == 'orbit') {
      this.setCameraTarget();
      this.cameraTarget.visible = true;
      this.cameraAutorotate = $('#export3dCameraAutorotate').is(':checked');
      $('.export3dCameraPositionControls').hide();
      $('.export3dCameraOrbitControls').show();
    }
  },


  doAutorotate: function(dAngle) {
    
    var azimuthAngle = parseInt($('#export3dAzimuthAngle').val(), 10);
    if(typeof dAngle !== 'undefined') {
      azimuthAngle = (azimuthAngle + dAngle) % 360;
    } else {
      azimuthAngle = (azimuthAngle + 1) % 360;
    }
    $('#export3dAzimuthAngle').val(azimuthAngle);

    this.setCameraTarget();
  },

  setCameraTarget: function() {
    var x = parseInt($('#export3dCameraTargetX').val(), 10);
    var y = parseInt($('#export3dCameraTargetY').val(), 10);
    var z = parseInt($('#export3dCameraTargetZ').val(), 10);

    var azimuthAngle = parseInt($('#export3dAzimuthAngle').val(), 10) * Math.PI / 180;
    var altitudeAngle = parseInt($('#export3dAltitudeAngle').val(), 10) * Math.PI / 180;
    var cameraDistance = parseInt($('#export3dCameraDistance').val(), 10);
    if(isNaN(x) || isNaN(y) || isNaN(z) || isNaN(azimuthAngle) || isNaN(altitudeAngle) || isNaN(cameraDistance)) {
      return;
    }

/*
    this.orbitControls.setPolarAngle(altitudeAngle);
    this.orbitControls.setAzimuthalAngle(azimuthAngle);
    this.orbitControls.target.set(x, y, z);

    this.orbitControls.update();
*/    
   

    //https://en.wikipedia.org/wiki/Spherical_coordinate_system
   this.camera.position.x = x;
   this.camera.position.y = y;
   this.camera.position.z = z;


//   this.camera.position.x += cameraDistance * Math.cos(azimuthAngle);
   this.camera.position.y += cameraDistance * Math.sin(altitudeAngle);
   this.camera.position.z += cameraDistance * Math.cos(altitudeAngle);

   var radius = Math.sqrt((this.camera.position.x  - x ) * (this.camera.position.x  - x ) + 
                          (this.camera.position.z - z) * (this.camera.position.z - z));

   this.camera.position.x = x + (radius) * Math.cos(azimuthAngle);
   this.camera.position.z = z + (radius) * Math.sin(azimuthAngle);


    this.cameraTarget.position.x = x;
    this.cameraTarget.position.y = y;
    this.cameraTarget.position.z = z;

    this.camera.lookAt(x, y, z);


  },

  setCameraPosition: function() {
    var x = parseInt($('#export3dCameraX').val(), 10);
    var y = parseInt($('#export3dCameraY').val(), 10);
    var z = parseInt($('#export3dCameraZ').val(), 10);
    if(isNaN(x) || isNaN(y) || isNaN(z)) {
      return;
    }

    this.camera.position.x = x;
    this.camera.position.y = y;
    this.camera.position.z = z;
    this.drawFrame({ redrawLayers: true });

  },

  setCameraRotation: function() {
    var x = parseInt($('#export3dRotationX').val(), 10);
    var y = parseInt($('#export3dRotationY').val(), 10);
    var z = parseInt($('#export3dRotationZ').val(), 10);
    if(isNaN(x) || isNaN(y) || isNaN(z)) {
      return;
    }

    this.camera.rotation.x = x * Math.PI / 180;
    this.camera.rotation.y = y * Math.PI / 180;
    this.camera.rotation.z = z * Math.PI / 180;
    this.drawFrame({ redrawLayers: true });
  },

  setCameraFOV: function() {
    var fov = parseInt($('#export3dCameraFOV').val(), 10);
    if(isNaN(fov)) {
      return;
    }

    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  },

  setFrameParameters: function() {
    this.playMode = $('#export3dGIFLoopType').val();
    var frameCount = this.editor.grid3d.getFrameCount();

    var fromFrame = parseInt($('#export3dGIFFromFrame').val(), 10);
    if(!isNaN(fromFrame) && fromFrame >= 1 && fromFrame <= frameCount) {
      this.fromFrame = fromFrame;
    }

    var toFrame = parseInt($('#export3dGIFToFrame').val(), 10);
    if(!isNaN(toFrame) && toFrame >= 1 && toFrame <= frameCount) {
      this.toFrame = toFrame;
    }

    this.repeat = 1;

    this.speed = $('#export3dGIFSpeed').val();

    this.msPerTick = 50;
    if(this.speed == 'custom') {
      this.msPerTick = parseInt($('#export3dGIFMSPerTick').val(), 10);
    }  else {
      this.msPerTick = FRAMERATE / parseInt(this.speed, 10);
    }  

//    this.calculateGifInfo();
  },


  mouseDown: function(e) {

  },

  setPreviewScale: function(scale) {
    this.previewScale = scale;
    this.drawFrame({ redrawLayers: false });

    var displayScale = Math.floor(scale * 100);
    $('#export3dGifPreviewScale').val(displayScale);
    $('#export3dGifPreviewScaleText').val(displayScale);
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

    UI.setCursor('drag');
    this.mouseIsDown = true;
    UI.captureMouse(this, {"cursor": 'url(cursors/closedhand.png) 2 14, pointer'});
  },

  mouseMove: function(e) {

    if(this.mouseIsDown) {
      var x = e.clientX;
      var y = e.clientY;

      var diffX = x - this.mouseDownAtX;
      var diffY = y - this.mouseDownAtY;      

      this.previewOffsetX = this.currentOffsetX + diffX / (this.previewScale );
      this.previewOffsetY = this.currentOffsetY + diffY / (this.previewScale);

      this.drawFrame({ redrawLayers: false, applyEffects: false});
    }
  },

  mouseUp: function(event) {
    this.mouseIsDown = false;
  },

  setScale: function(scale) {
    var oldScale = this.scale;
    this.scale = scale;

    this.previewOffsetY = Math.floor(this.previewOffsetY * this.scale / oldScale);    
    this.previewOffsetX = Math.floor(this.previewOffsetX * this.scale / oldScale);    

  },

  calculateGifInfo: function() {
    /*
    this.drawFrame();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var includeBorder = $('#exportGIFIncludeBorder').is(':checked') ;
   
    if(includeBorder) {
      this.borderWidth = 4 * 8;
      this.borderHeight = 4 * 8;
    } else {
      this.borderWidth = 0;
      this.borderHeight = 0;
    }


    var graphicWidth = this.editor.graphic.getGraphicWidth();
    var graphicHeight = this.editor.graphic.getGraphicHeight();

    var width = (graphicWidth + this.borderWidth * 2) * this.scale ;
    var height = (graphicHeight + this.borderHeight * 2) * this.scale;


    var ticks = 0;
    for(var i = this.fromFrame - 1; i < this.toFrame; i++) {
      ticks += this.editor.graphic.getFrameDuration(i);
    }

    if(this.playMode == 'pingpong') {
      ticks *= 2;
    }

    var characterTicks = tileSet.getAnimatedCharacterTicks();

    // make sure enough ticks to cycle through animation
    for(var i = 0; i < characterTicks.length; i++) {
      if(ticks < characterTicks[i]) {
        ticks = characterTicks[i];
      }
    }


    this.totalTicks = ticks;
    var length = (ticks * this.msPerTick) / 1000;
    length = length.toFixed(2);
    var html = 'Dimensions: ' + width + 'x' + height + ' pixels, Length ' + length + ' seconds';

    $('#exportGIFInfo').html(html);
    */
  },


  doExport: function() {
    var filename = $('#export3dGIFAs').val();
  

    if(this.fromFrame > this.toFrame) {
      alert("From must be greater than to");
      return;
    }

    var scale = this.scale;

    $('#export3dGifProgressText').html('');
    UI.showDialog("export3dGifProgressDialog");

    this.exportGIFFormat = 'gif';
    if(this.exportGIFFormat == 'gif') {

      this.exportGif(filename, scale, this.speed, this.fromFrame, this.toFrame);
    }

  },



  exportGif: function(filename, scale, speed, fromFrame, toFrame) {
//This actually due to the MP4 conversion: total frames duration must be a multiple of 12/15 fps. this work on my pixels gif  =)

// 15fps = 0.0666 secs / frame
// 15fps = 66.66 msecs/frame
// 12 fps = 83.3333 ms/frame

    this.playMode = 'once';// $('#exportGIFLoopType').val();

    var autorotate = this.cameraAutorotate;

    this.cameraTarget.visible = false;


    var msPerTick = 50;
    if(speed == 'custom') {
      msPerTick = parseInt($('#expor3dtGIFMSPerTick').val(), 10);
    }  else {
      msPerTick = FRAMERATE / speed      
    }   


    this.scale = scale;      


    // all of the ticks of each element, eg animated characters, frames
    var elementTicks = [];

    var tileSet =  this.editor.tileSetManager.getCurrentTileSet();

    var characterTicks = tileSet.getAnimatedCharacterTicks();

//    var twitterExport = $('#exportGIFShorten').is(':checked');
    var twitterExport = false;

    var gif = new GIF({
      workers: 4,
      workerScript: 'lib/gif/gif.worker.js',
      quality: 10,
      width: this.rendererCanvas.width,
      height: this.rendererCanvas.height,
      background: '#000000',
      repeat: 0
    });

    var maxFrameRate = 30;

//    var hasTimeBasedEffects = this.shaderEffects.hasTimeEffects();

if(true) {//characterTicks.length > 0) {
      // has animated characters...
      var ticks = 0;
      for(var i = fromFrame - 1; i < toFrame; i++) {
        ticks += this.editor.grid3d.getFrameDuration(i);
      }

      if(this.playMode == 'pingpong' && toFrame != fromFrame) {
        ticks *= 2;
      }

      console.log('ticks = ' + ticks);

      elementTicks.push(ticks);

      // make sure enough ticks to cycle through character animation
      for(var i = 0; i < characterTicks.length; i++) {
        elementTicks.push(characterTicks[i]);
        if(ticks < characterTicks[i]) {
          ticks = characterTicks[i];
        }
      }


      function gcd(a, b) {
          return !b ? a : gcd(b, a % b);
      }

      function lcm(a, b) {
          return (a * b) / gcd(a, b);   
      }

      var multiple = elementTicks[0];
      elementTicks.forEach(function(n) {
          multiple = lcm(multiple, n);
      });

      ticks = multiple;

      var tick = 0;
      var frame = fromFrame-1;
      var thisFrameTicks = 0;
      var lastFrameTick = 0;


      // find out how often to updated effect time
      //msPerTick

      var maxFrameRate = 9;
      var ticksPerSecond = 1000 / msPerTick;
      var updateEffectsEvery = 1;

      if(ticksPerSecond > maxFrameRate) {
        updateEffectsEvery = Math.ceil(ticksPerSecond / maxFrameRate);
      }

      this.shaderTime = 0;

      var effectsUpdated = false;


      
      // need to make sure number of ticks is greater than character animation frames
      tileSet.update(tick);
      this.currentFrame = frame;
      this.drawFrame();
      
      var dAngle = 2;
      if(autorotate) {
        ticks = 360 / dAngle;

      }
//      updateEffectsEvery = 6;



      var frameDirection = 1
      for(var tick = 1; tick < ticks; tick++) {
        thisFrameTicks++;

        var charsUpdated = tileSet.update(tick);
        var nextFrame = this.editor.grid3d.getFrameDuration(frame) <= thisFrameTicks;

        if(nextFrame) {
          frame += frameDirection;
          thisFrameTicks = 0;

          if(frame == toFrame) {
            if(this.playMode == 'pingpong' && toFrame != fromFrame) {
              frame--;
              frameDirection = -frameDirection;
            } else {
              frame = fromFrame -1;
            }
          }
        }
        if(charsUpdated || nextFrame || effectsUpdated || autorotate) {
          // need to add gif frame
          var duration = (tick - lastFrameTick) * msPerTick;

          if(twitterExport) {
            gif.addFrame(this.rendererCanvas, {copy: true, delay: duration / 2 });
            gif.addFrame(this.rendererCanvas, {copy: true, delay: duration / 2 });

          } else {
            gif.addFrame(this.rendererCanvas, {copy: true, delay: duration });
          }
          // now draw next frame
          lastFrameTick = tick;

          this.currentFrame = frame;
          this.drawFrame();

//          this.drawFrame(frame, whichLayers);
        }


        if(autorotate) {
          console.log('do auto rotate!');
          this.doAutorotate(dAngle);
        }
      }

      // need to draw last frame
      var duration = (tick - lastFrameTick) * msPerTick;

      if(twitterExport) {
        gif.addFrame(this.rendererCanvas, {copy: true, delay: duration / 2 });
      } else {
        gif.addFrame(this.rendererCanvas, {copy: true, delay: duration });
      }
    }


    var _this = this;
    gif.on('finished', function(blob) {

      if(filename.indexOf('.gif') == -1) {
        filename += ".gif";
      }    

      console.log("DOWNLOAD!!!!!");
      download(blob, filename, "application/gif");    

      _this.exportGifFinished();

    });

    gif.on('progress', function(p) {
      var progress = p * 100;
      var html = progress.toFixed(2) + '%';

      $('#export3dGifProgressText').html(html);
    });

    gif.render();

  },

  exportGifFinished: function() {
    // close both dialogs
    UI.closeDialog();
    UI.closeDialog();

  },



  // need to integrate this with Frames.update
  updateFrame: function() {
    
  
    this.startFrame = this.fromFrame - 1;
    this.endFrame = this.toFrame;//this.editor.frames.frameCount;

    var time = getTimestamp();

//    if(time - this.lastTickTime >= this.msPerTick) {
    while(time - this.lastTickTime >= this.msPerTick) {
      this.tick++;
      this.frameTick++;
      this.lastTickTime = this.lastTickTime + this.msPerTick;

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      tileSet.update(this.tick);

      // call the scripting tick function
      if(TextMode.tick) {
        TextMode.tick(this.tick);
      }


      // update shader time...
//      var tickCount = this.tick % this.totalTicks;

  //    this.shaderTime = tickCount / this.totalTicks;

/*
      this.shaderTime += 0.01;
      while(this.shaderTime >= 1) {
        this.shaderTime -= 1;
      }
*/

      // TODO: animate color palette
    }



    if(this.playFrames) {
      if(this.currentFrame < 0 || this.currentFrame >= this.editor.grid3d.getFrameCount() ) {
        this.currentFrame = 0;
      }
      var frameDuration = this.editor.grid3d.getFrameDuration(this.currentFrame);      
 //     if(time - this.lastFrameTime > this.editor.frames.frames[this.currentFrame].duration * this.msPerTick) {
      if(this.frameTick >= frameDuration) {
        this.frameTick = 0;

        this.framesTickCount += frameDuration;

        var frame = this.currentFrame;

        frame += this.playDirection;

        if(this.playMode == "pingpong") {
          if(frame === this.startFrame) {
            this.playDirection = 1;
          }
          if(frame === this.endFrame - 1) {
            this.playDirection = -1;
          }

          if(frame >= this.endFrame) {
            frame = this.startFrame;
          } else if(frame < this.startFrame) {
            frame = this.startFrame;
          }
        } else if(this.playMode == "once") {
          if(frame >= this.endFrame) {
            frame = this.startFrame;

          }          
        } else {
          if(frame >= this.endFrame) {

            frame = this.startFrame;
          }
        }

        this.currentFrame = frame;
        //this.setCurrentFrame(frame);
        this.lastFrameTime = time;
      }
    }

  },

  update: function() {
    if(!this.exportGifActive) {
      return false;
    }

    if(this.cameraAutorotate) {
      this.doAutorotate();
    }
    this.updateFrame();
    this.drawFrame();
    return true;
  }
}
