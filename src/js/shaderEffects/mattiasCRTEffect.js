var MattiasCRTEffect = function() {
  this.params = [
    {
      "name": "Blur",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 30,
      "default": 30
    },
    {
      "name": "Curve",
      "options": ["On", "Off"],
      "type": "options",
      "value": "On",
      "default": "On"
    },
    {
      "name": "Frame",
      "options": ["On", "Off"],
      "type": "options",
      "value": "On",
      "default": "On"
    },
    {
      "name": "Pixel Shape",
      "options": ["Square", "Tall"],
      "type": "options",
      "value": "Tall",
      "default": "Tall"


    },
    {
      "name": "Colour Bleed",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 12,
      "default": 12
    },
    {
      "name": "Ghosting",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 25,
      "default": 25
    },
    {
      "name": "Scanline Intensity",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 90,
      "default": 90
    },


    {
      "name": "Vertical Line Intensity",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 100,
      "default": 100
    },
    {
      "name": "Glow",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 30,
      "default": 30
    }
  ];


  this.pixelRatio = 1;
  this.curve = 1;
  this.frame = 1;
  this.blurValue = 0.3;
  this.ghosting = 1;
  this.colorBleed = 0.25;
  this.scanlineIntensity = 0.9;
  this.verticalLineIntensity = 1.0;
  this.glowValue = 0.3;

  
}

MattiasCRTEffect.prototype = {
  getName: function() {
    return "CRT (Mattias)";
  },

  getParams: function() {
    return this.params;
  },

  setParamValue: function(param, value) {
    switch(param) {
      case 'Curve':
        this.curve = (value == "On") ? 1 : 0;
        this.crtPass.uniforms['curve'].value = this.curve;
        break;
      case 'Frame':
        this.frame = (value == "On") ? 1 : 0;
        this.crtPass.uniforms['frame'].value = this.frame;
        break;
        case 'Pixel Shape':
        switch(value) {
          case "Square":
            this.pixelRatio = 0;
            break;
          case "Tall":
            this.pixelRatio = 1;
            break;
          case "TV":
            this.pixelRatio = 2;
            break;
        }
        this.crtPass.uniforms['pixelRatio'].value = this.pixelRatio;
        break;
      case 'Colour Bleed':
        this.colorBleed = value / 50;
        this.crtPass.uniforms['colorBleed'].value = this.colorBleed;
        break;
      case 'Ghosting':
        this.ghosting = value / 25;
        this.crtPass.uniforms['ghosting'].value = this.ghosting;
        break;
    
      case 'Scanline Intensity':
        this.scanlineIntensity = value / 100;
        this.crtPass.uniforms['scanlineAmount'].value = this.scanlineIntensity;
        break;
      case 'Vertical Line Intensity':
        this.verticalLineIntensity = value / 100;
        this.crtPass.uniforms['verticalLineAmount'].value = this.verticalLineIntensity;
        break;

      case 'Blur':
        //console.log('set blur to ' + value);
        this.blurValue = value / 100;
        this.blurPass.uniforms['amount'].value = this.blurValue;

        break;
      case 'Glow':
        this.glowValue = value / 50;
        this.bloomPass.copyUniforms["opacity"].value = this.glowValue;
        break;
    }
  },
  
  
  setupComposer: function(composer, width, height) {

    // BLUR
    this.blurPass = new THREE.ShaderPass( BlurShader );  
    this.blurPass.uniforms['resolution'].value = new THREE.Vector2( width, height );
    this.blurPass.uniforms['amount'].value = this.blurValue;
    composer.addPass( this.blurPass );

    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );    
    composer.addPass(effectCopy);

    
    // CRT
    this.crtPass = new THREE.ShaderPass( MattiasCRTShader );

    this.crtPass.uniforms['resolution'].value = new THREE.Vector2( width, height );
    this.crtPass.uniforms['curve'].value = this.curve;
    this.crtPass.uniforms['frame'].value = this.frame;
    this.crtPass.uniforms['pixelRatio'].value = this.pixelRatio;
    this.crtPass.uniforms['colorBleed'].value = this.colorBleed;
    this.crtPass.uniforms['ghosting'].value = this.ghosting;
    this.crtPass.uniforms['scanlineAmount'].value = this.scanlineIntensity;
    this.crtPass.uniforms['verticalLineAmount'].value = this.verticalLineIntensity;
    
    composer.addPass( this.crtPass );


    // BLOOM
    this.bloomPass = new THREE.BloomPass();
    this.bloomPass.copyUniforms["opacity"].value = this.glowValue;
    composer.addPass(this.bloomPass);

  }
}