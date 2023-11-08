var ImageShaderEffects = function() {
  this.editor = null;
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

  this.srcCanvas = null;

  this.textureWidth = 1024;
  this.textureHeight = 1024;
  this.textureCanvas = null;

  this.availableEffects = [
/*
    {
      "name": "Bad TV",
      "params": {
        "distortion": { min:0, max: 6, defaultValue: 1 },
        "distortion2": { min:0, max: 6, defaultValue: 1 },
        "time": { type: "hidden", defaultValue: 0}
      }
    },
*/
    {
      "name": "Chroma Key",
      "params": {
        "r": { name: "Red", min: 0, max: 1, defaultValue: 0.06 },
        "g": { name: "Green", min: 0, max: 1, defaultValue: 0.698 },
        "b": { name: "Blue", min: 0, max: 1, defaultValue: 0 },

      }
    },

    {
      "name": "Brightness/Contrast",
      "params": {
        "brightness": { name: "Brightness", min:-1, max: 1, defaultValue: 0 },
        "contrast": { name: "Contrast", min:-1, max: 1, defaultValue: 0 }
      }

    },
    {
      "name": "Bloom",
      "params": {
        "opacity": { name: "Strength", min: 0, max: 5, defaultValue: 1 }
      }
    },

    {
      "name": "Bump",
      "params": {
        "weight": { name: "Weight", min:0.5, max: 2, defaultValue: 1 }
      }
    },
    {
      "name": "Colour Cycle",
      "params": {
        "amount": { name: "Amount", min:0.1, max: 1.0, defaultValue: 0.05 },
        "offset": { name: "Offset", min:0, max: 2, defaultValue: 0.0 },
        "time": { type: "hidden", defaultValue: 0.5 }
      }
    },


    {
      "name": "Colour Halftone",
      "params": {
        "scale": { min:0, max: 6, defaultValue: 2 },
        "angle": { type: "angle", min:0, max: 2, defaultValue: 1.0 }

      }
    },

    {
      "name": "CRT",
      "params": {
        "warpscreen": { type: "options",  options: [ {label: "Off", value: 0}, {label: "On", value: 1 }], defaultValue: 1.0 },
        "INPUT_THIN": { min:0, max: 1, defaultValue: 0.7 },
        "masktype": {  type: "options", options: [{label: "Grille", value: 0},{label: "Grille Lite", value: 1}, {label: "None", value: 2}], defaultValue: 1.0 },
        "INPUT_MASK": { min:0, max: 2, defaultValue: 0.7 },
        "INPUT_X": { type: "hidden", min:0, max: 500, defaultValue: 128.0 },
        "INPUT_Y": { min:0, max: 500, defaultValue: 72.0 },
        "INPUT_BLUR": { type: "hidden", min:-5, max: 3, defaultValue: -2.5 },

      }
    },
    {
      "name": "Denoise",
      "params": {
        "exponent": { min:0, max: 15, defaultValue: 0.2 }
      }
    },



    {
      "name": "Digital Glitch",
      "params": {
        "amount": { min:0, max: 0.02, defaultValue: 0.002 },
        "distortion_x": { min:0, max: 1, defaultValue: 0.2 },
        "distortion_y": { min:0, max: 1, defaultValue: 0.2 },
        "seed": { min:0, max: 4, defaultValue: 0.7 },
        "seed_x": { min:0, max: 1, defaultValue: 0.7 },
        "seed_y": { min:0, max: 1, defaultValue: 0.7 },
      }
    },

    {
      "name": "Diffusion",
      "params": {
        "scale": { min:0, max: 1, defaultValue: 0.2 }
      }
    },


    {
      "name": "Dot Screen",
      "params": {
        "scale": { min:0, max: 5, defaultValue: 3 },
        "angle": { type: "angle", min:0, max: 2, defaultValue: 1 }
      }
    },

    {
      "name": "Edges",
      "params": {
      }
    },
    {
      "name": "Emboss",
      "params": {
      }
    },
/*
// film is covered by other effects: scanline, noise, saturation
    {
      "name": "Film",
      "params": {
        "nIntensity": { min:0, max: 1, defaultValue: 0.5 },
        "sIntensity": { min:0, max: 5, defaultValue: 1.5 },
        "sCount": { min:1, max: 4096, defaultValue: 1.5 },
        "grayscale": { min:0, max: 1, defaultValue: 0 }

      }
    },
*/
    {
      "name": "Ghost",
      "params": {
        "amount": { min:0, max: 0.1, defaultValue: 0.06 },
        "angle": { min:0, max: 300, defaultValue: 0.0 },

      }
    },
    {
      "name": "Hexagonal Pixelate",
      "params": {
        "scale": { name: "Scale", min: 1, max: 100, defaultValue: 10 }
      }
    },



    {
      "name": "Hue/Saturation",
      "params": {
        "hue": { name: "Hue", min: -1, max: 1, defaultValue: 0 },
        "saturation": { name: "Saturation", min: -1, max: 1, defaultValue: 0 },
      }
    },

    {
      "name": "Kaleidoscope",
      "params": {
        "sides": { min:0, max: 6, defaultValue: 1 },
        "angle": { min:0, max: 5, defaultValue: 0 },
      }
    },

    {
      "name": "Noise",
      "params": {
        "nIntensity": { name: "Intensity", min:0, max: 1, defaultValue: 0.2 },
        "time": { name: "time", type:"time", defaultValue: 0}
      }
    },

    {
      "name": "Pixelate",
      "params": {
        "pixelsX": { name: "Pixels X", min: 1, max: 1000, defaultValue: 10 },
        "pixelsY": { name: "Pixels Y", min: 1, max: 1000, defaultValue: 10 }
      }
    },
    /*
    {
      "name": "Plasma",
      "params": {
        "scale": { min:0, max: 6, defaultValue: 1 },
        "amount": { min: 0, max: 1, defaultValue: 0.5 },
        "time": { type: "hidden", defaultValue: 0 }
      }
    },
    */
    
    {
      "name": "Polar Pixelate",
      "params": {
        "pixelsX": { name: "Pixels X", min: 0, max: 1, defaultValue: 0.05 },
        "pixelsY": { name: "Pixels Y", min: 0, max: 1, defaultValue: 0.05 }
      }
    },


    {
      "name": "RGB Shift",
      "params": {
        "amount": { min:0, max: 0.1, defaultValue: 0.05 },
        "angle": { min:0, max: 300, defaultValue: 0.0 },
      }
    },
    {
      "name": "Scanlines",
      "params": {
        "linesAmount": { name: "Amount", min:0, max: 1, defaultValue: 1 },
        "count": { name: "Count", min:0, max: 4096, defaultValue: 499 }
      }
    },

    {
      "name": "Sepia",
      "params": {
        "amount": { name: "Amount", min:0, max: 1, defaultValue: 1 }
      }
    },
    {
      "name": "Technicolour",
      "params": {
      }
    },
    {
      "name": "Triangle Blur",
      "params": {
        "amount": { min: 0, max: 0.05, defaultValue: 0.01 }
      }
    },
    {
      "name": "Vignette",
      "params": {
        "offset": { name: "Offset", min: 0, max: 2, defaultValue: 1 },
        "darkness": { name: "Darkness", min: 0, max: 2, defaultValue: 1 },
      }
    },

    {
      "name": "Wobble",
      "params": {
        "strength": { min: 0, max: 0.1, defaultValue: 0.04 },
        "size": { min: 0, max: 20, defaultValue: 3 },
        //"time": { min: 0, max: 1.0, defaultValue: 0 }        
        "time": { type: "time", min: 0, max: 1, defaultValue: 0 }
      }
    }
  ];

  this.effectsList = [
  ];


}

ImageShaderEffects.prototype = {
  init: function(args) {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.autoClear = false;    
    this.renderer.setSize( this.width, this.height );
    this.camera = new THREE.OrthographicCamera( this.width / - 2, 
                                                this.width / 2, 
                                                this.height / 2, 
                                                this.height / - 2, 1, 1000 );
    this.camera.position.z = 5;    

    this.scene = new THREE.Scene();

    this.textureCanvas = document.createElement('canvas');

  },

  resize: function() {
    this.camera.left = -this.width / (2);
    this.camera.right = this.width / (2);
    this.camera.top = this.height / (2);
    this.camera.bottom = -this.height / (2);        
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.width, this.height );

    if(this.renderTarget.width != this.width || this.renderTarget.height != this.height) {
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

      this.renderTarget.setSize(this.width, this.height);
      this.renderTargetPixels = new Uint8Array(this.width * this.height * 4);    
    }
  },

  setInput: function(srcCanvas, dstCanvas) {

    this.srcCanvas = srcCanvas;

    this.dstCanvas = dstCanvas;
    this.dstContext = this.dstCanvas.getContext('2d');
    this.dstImageData = this.dstContext.getImageData(0, 0, this.dstCanvas.width, this.dstCanvas.height);  

    this.width = srcCanvas.width;
    this.height = srcCanvas.height;

    var rtParameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
//          stencilBuffer: true
    };

    if(!this.renderTarget) {
      this.renderTarget = new THREE.WebGLRenderTarget( this.width, this.height, rtParameters);
      this.renderTargetPixels = new Uint8Array(this.width * this.height * 4);
    }

    this.resize();


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
//      }

  }

    this.plane.position.x = (this.textureWidth - this.width) / 2;
    this.plane.position.y = -(this.textureHeight - this.height) / 2;


    this.setupComposer();
  },

  setEffects: function(effectsList) {
    this.effectsList = effectsList;
    this.setupComposer();

  },

  setEffectParams: function(effectsList) {

    if(effectsList.length != this.effectsList.length) {
      this.setEffects(effectsList);
    }

    for(var i = 0; i < this.effectsList.length; i++) {
      if(this.effectsList[i].effect == "Bloom") {
        this.effectsList[i].pass.copyUniforms["opacity"].value = this.effectsList[i].params['opacity'];
      } else {
        for(var paramName in effectsList[i].params) {          
          
          if(this.effectsList[i].pass.uniforms.hasOwnProperty(paramName)) {
            this.effectsList[i].pass.uniforms[paramName].value = effectsList[i].params[paramName];
          }
        }
      }
    }
  },


  hasTimeEffects: function() {
    for(var i = 0; i < this.effectsList.length; i++) {

      for(var paramName in this.effectsList[i].params) {
        if(paramName == 'time') {
          return true;
        }

      }
    }

    return false;

  },

  setTime: function(time) {
    for(var i = 0; i < this.effectsList.length; i++) {

      for(var paramName in this.effectsList[i].params) {
        if(paramName == 'time') {
          this.effectsList[i].pass.uniforms[paramName].value = time;
        }

      }
    }

  },


  setupComposer: function() {
    this.composer = new THREE.EffectComposer( this.renderer, this.renderTarget );

    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

    for(var i = 0; i < this.effectsList.length; i++) {
      switch(this.effectsList[i].effect) {

        case 'Bad TV':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.BadTVShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Chroma Key':
          this.effectsList[i].pass = new THREE.ShaderPass( ChromaKeyShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Bloom':
          this.effectsList[i].pass = new THREE.BloomPass();//new THREE.ShaderPass(THREE.BadTVShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;


        case 'Brightness/Contrast':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.BrightnessContrastShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Bump':
          this.effectsList[i].pass = new THREE.ShaderPass(BumpShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Colour Cycle':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.RainbowShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;



        case 'Colour Halftone':
          this.effectsList[i].pass = new THREE.ShaderPass(ColorHalftoneShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'CRT':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.CRT2Shader);
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Denoise':
          this.effectsList[i].pass = new THREE.ShaderPass(DenoiseShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Diffusion':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.DiffusionShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Digital Glitch':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.DigitalGlitch);
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Dot Screen':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.DotScreenShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Edges':
          this.effectsList[i].pass = new THREE.ShaderPass( EdgeShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Emboss':
          this.effectsList[i].pass = new THREE.ShaderPass( EmbossShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Film':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.FilmShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Ghost':
          this.effectsList[i].pass = new THREE.ShaderPass( GhostShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Hexagonal Pixelate':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.HexagonalPixelateShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Hue/Saturation':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.HueSaturationShader );
          this.composer.addPass(this.effectsList[i].pass);          
          break;
        case 'Kaleidoscope':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.KaleidoShader );
          this.composer.addPass(this.effectsList[i].pass);          
          break;
        case 'Noise':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.NoiseShader );
          this.composer.addPass(this.effectsList[i].pass);          
          break;  
        case 'Pixelate':
          this.effectsList[i].pass = new THREE.ShaderPass(THREE.PixelateShader);
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Plasma':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.PlasmaShader );
          this.composer.addPass(this.effectsList[i].pass);          
          break;  
        case 'Polar Pixelate':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.PolarPixelateShader );
          this.composer.addPass(this.effectsList[i].pass);          
          break;
        case 'RGB Shift':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.RGBShiftShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Scanlines':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.ScanlinesShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;

        case 'Sepia':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.SepiaShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Technicolour':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.TechnicolorShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Triangle Blur':

          this.effectsList[i].pass = new THREE.ShaderPass( THREE.TriangleBlurShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Vignette':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.VignetteShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
        case 'Wobble':
          this.effectsList[i].pass = new THREE.ShaderPass( THREE.WobbleShader );
          this.composer.addPass(this.effectsList[i].pass);
          break;
      }
    }



/*
        var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
        effect.uniforms[ 'amount' ].value = 0.045;
        effect.uniforms[ 'angle' ].value = 151.15;
        this.composer.addPass(effect);

        var shaderSepia = THREE.SepiaShader;

        var effectSepia = new THREE.ShaderPass( shaderSepia );

        this.composer.addPass(effectSepia);

        effectSepia.uniforms[ "amount" ].value = 1;
*/


/*
    var dotEffect = new THREE.ShaderPass( THREE.DotScreenShader );
    dotEffect.uniforms[ 'scale' ].value = 0.1;
    this.composer.addPass( dotEffect );
*/

/*
        this.effectDigitalGlitch = new THREE.ShaderPass(THREE.DigitalGlitch);
        this.effectDigitalGlitch.uniforms['amount'].value = 0.01;
        this.effectDigitalGlitch.uniforms['distortion_x'].value = -0.1;
        this.effectDigitalGlitch.uniforms['distortion_y'].value = -0.1;
        this.effectDigitalGlitch.uniforms['seed'].value = Math.random();

        this.composer.addPass(this.effectDigitalGlitch);
*/
/*
        this.rgbShift = new THREE.ShaderPass( THREE.RGBShiftShader );
        this.rgbShift.uniforms[ 'amount' ].value = 0.045;
        this.rgbShift.uniforms[ 'angle' ].value = 1.15;
        this.composer.addPass(this.rgbShift);
*/

//        this.effectFilm = new THREE.FilmPass( 0.35, 1.125, 648, false );

/*
        this.effectFilm = new THREE.ShaderPass(THREE.FilmShader);
        this.effectFilm.uniforms['sIntensity'].value = 1.5;
        this.effectFilm.uniforms['sCount'].value = 100;
        this.effectFilm.uniforms['grayscale'].value = 0;

        this.composer.addPass(this.effectFilm);
*/

    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
//    effectCopy.renderToScreen = true;
    this.composer.addPass(effectCopy);


  },


  applyEffects: function() {
    if(this.textureContext == null) {
      return;      
    }

    for(var i = 0; i < this.effectsList.length; i++) {
      if(this.effectsList[i].effect == 'CRT' || this.effectsList[i].effect == 'Denoise') {
        this.effectsList[i].pass.uniforms['iResolution'].value.set(this.width, this.height);
      }

      /*
      for(var paramName in effectsList[i].params) {
        if(this.effectsList[i].pass.uniforms.hasOwnProperty(paramName)) {
          this.effectsList[i].pass.uniforms[paramName].value = effectsList[i].params[paramName];
        }
      }
      */
    }



    this.textureContext.clearRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);
    this.textureContext.drawImage(this.srcCanvas, 0, 0);
    this.material.map.needsUpdate = true;


    var delta = 1;
    this.renderer.clear();
    this.composer.render();      

    this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.width, this.height, this.renderTargetPixels);

//    this.dstContext = this.dstCanvas.getContext('2d');
//    this.dstImageData = this.dstContext.getImageData(0, 0, this.dstCanvas.width, this.dstCanvas.height);  


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
//    this.dstContext.drawImage(this.textureCanvas, 0, 0);
  },

/*
  addEffect: function() {
    this.effects.push({"name": ""});
  },
  
  getEffectsHTML: function() {
    var html = '';
    for(var i = 0; i < this.effects.length; i++) {
      var effect = this.effects[i].name;

      html += '<div>';

      html += '<select>';
      for(var j = 0; j < this.availableEffects.length; j++) {
        html += '<option value="">' + this.availableEffects[j].name + '</option>';
      }
      html += '</select>';

      html += '</div>';
    }

    $('#' + this.effectsHTMLElementId).html(html);
  }
*/  
}
