var ShaderEffects = function() {
  this.width = 320;
  this.height = 200;

  this.renderer = null;
  this.camera = null;

  this.renderTarget = null;
  this.renderTargetPixels = null;

  this.plane = null;
  this.planeGeometry = null;
  this.texture = null;
  this.material = null;

  // the source canvas passed in
  this.srcCanvas = null;

  this.textureWidth = 1024;
  this.textureHeight = 1024;
  this.textureCanvas = null;

  this.effect = null;

  this.dstImageData = null;
  this.shaderEffectControls = null;
  this.paramChangedCallback = false;
}


ShaderEffects.prototype = {
  init: function() {
    this.renderer = new THREE.WebGLRenderer();
    
    this.renderer.autoClear = false;    
    this.renderer.setSize( this.width, this.height );
    this.camera = new THREE.OrthographicCamera( this.width / - 2, 
                                                this.width / 2, 
                                                this.height / 2, 
                                                this.height / - 2, 1, 1000 );
    this.camera.position.z = 5;    

    this.scene = new THREE.Scene();

    // texture canvas is what is used when plane is rendered
    this.textureCanvas = document.createElement('canvas');

    this.shaderEffectControls = new ShaderEffectControls();
    this.shaderEffectControls.init();

    var _this = this;
    this.shaderEffectControls.on('paramchanged', function(param, value) {
      if(_this.effect) {
        _this.effect.setParamValue(param, value);
      }

      if(_this.paramChangedCallback) {
        _this.paramChangedCallback(param, value);
      }
    });
  },

  on: function(event,callback) {
    if(event == 'paramchanged') {
      this.paramChangedCallback = callback;
    }
  },

  setControlsParentId: function(elementId) {
    this.shaderEffectControls.setParentElementId(elementId);
  },

  setSize: function(width, height) {
    this.width = width;
    this.height = height;

    this.camera.left = -this.width / (2);
    this.camera.right = this.width / (2);
    this.camera.top = this.height / (2);
    this.camera.bottom = -this.height / (2);        
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.width, this.height );

    if(!this.renderTarget) {
      this.renderTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat
    //          stencilBuffer: true
      });

      this.renderTargetPixels = new Uint8Array(this.width * this.height * 4);    
    }

    if(this.renderTarget.width != this.width || this.renderTarget.height != this.height) {
      this.renderTarget.setSize(this.width, this.height);
      this.renderTargetPixels = new Uint8Array(this.width * this.height * 4);    
    }

    if(this.width > this.textureWidth || this.height > this.textureHeight) {
      if(this.width < 2048 && this.height < 2048) {
        this.textureWidth = 2048;
        this.textureHeight = 2048;
      } else if(this.width < 4096 && this.height < 4096) {
        this.textureWidth = 4096;
        this.textureHeight = 4096;
      } else if(this.width < 8192 && this.height < 8192) {
        this.textureWidth = 8192;
        this.textureHeight = 8192;
      }
    }

    if(this.textureCanvas.width != this.textureWidth || this.textureCanvas.height != this.textureHeight) {

      this.textureCanvas.width = this.textureWidth;
      this.textureCanvas.height = this.textureHeight;
      this.textureContext = this.textureCanvas.getContext('2d');

      if(this.plane) {
        this.scene.remove(this.plane);
      }
      if(this.texture) {
        this.texture.dispose();
      }
      if(this.material) {
        this.material.dispose();
      }
      this.planeGeometry = new THREE.PlaneGeometry( this.textureWidth, this.textureHeight, 5 );
      this.texture = new THREE.Texture( this.textureCanvas );
      this.material = new THREE.MeshBasicMaterial( {color: 0xffffff, map: this.texture, side: THREE.DoubleSide} );
      this.plane = new THREE.Mesh( this.planeGeometry, this.material );
      this.scene.add( this.plane );
    }

    this.plane.position.x = (this.textureWidth - this.width) / 2;
    this.plane.position.y = -(this.textureHeight - this.height) / 2;

    this.setupComposer();

  },

  setEffect: function(effect) {
    this.effect = effect;
    this.shaderEffectControls.setParams(this.effect.getParams());
    this.setupComposer();
    
  },

  setupComposer: function() {
    if(!this.effect || !this.srcCanvas) {
      return;
    }

    this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );
    this.composer.setSize( this.width, this.height );
    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    this.effect.setupComposer(this.composer, this.width, this.height);

    effectCopy = new THREE.ShaderPass( THREE.CopyShader );
    this.composer.addPass(effectCopy);
  },

  setInput: function(srcCanvas) {
    this.srcCanvas = srcCanvas;

    if(srcCanvas.width != this.width || srcCanvas.height != this.height) {
      this.setSize(srcCanvas.width, srcCanvas.height);
    }
  },

  setOutput: function(dstCanvas) {
    this.dstCanvas = dstCanvas;
    this.dstContext = this.dstCanvas.getContext('2d');

    if(!this.dstImageData || this.dstImageData.width != dstCanvas.width || this.dstImageData.height != dstCanvas.height) {
      this.dstImageData = this.dstContext.getImageData(0, 0, this.dstCanvas.width, this.dstCanvas.height);
    }
  },
  
  
  applyEffects: function() {

    if(this.effect == null) {
      this.dstContext.putImageData(this.srcCanvas, 0, 0);      
      return;
    }
    if(this.textureContext == null) {
      return;      
    }


    this.textureContext.clearRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
    this.textureContext.drawImage(this.srcCanvas, 0, 0);
    this.material.map.needsUpdate = true;

    this.renderer.clear();
    this.composer.render();      
    this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.width, this.height, this.renderTargetPixels);

    for(var y = 0; y < this.dstImageData.height; y++) {
      for(var x = 0; x < this.dstImageData.width; x++) {
          var offset = 4 * (y * this.dstImageData.width + x);
          var targetOffset = 4 * ((this.dstImageData.height - 1 - y) * this.dstImageData.width + x);
          this.dstImageData.data[targetOffset] = this.renderTargetPixels[offset];
          this.dstImageData.data[targetOffset + 1] = this.renderTargetPixels[offset + 1];
          this.dstImageData.data[targetOffset + 2] = this.renderTargetPixels[offset + 2];
          this.dstImageData.data[targetOffset + 3] = this.renderTargetPixels[offset + 3];//255;//renderTargetPixels[offset];
      }
    }

    this.dstContext.clearRect(0, 0, this.dstCanvas.width, this.dstCanvas.height);
    this.dstContext.putImageData(this.dstImageData, 0, 0);
    
    
  }  


}