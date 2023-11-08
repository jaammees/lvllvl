var LotteCRTEffect = function() {
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
      "name": "Saturation",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 50,
      "default": 50
    },
    /*
    {
      "name": "Saturation",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 0
    },
    */

    {
      "name": "Curve",
      "options": ["On", "Off"],
      "type": "options",
      "value": "On",
      "default": "On"
    },

    {
      "name": "Scanline Intensity", //INPUT_THIN
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 63,
      "default": 63
    },

    {
      "name": "Mask Type",  // masktype
      "options": ["None", "Lite", "Normal"],
      "type": "options",
      "value": "Normal",
      "default": "Normal"
    },


    {
      "name": "Vertical Line Intensity",  //INPUT MASK
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 25,
      "default": 25
    },

    {
      "name": "Glow",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 40,
      "default": 40
    },
    {
      "name": "VignetteOffset",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 50,
      "default": 50
    },

    {
      "name": "VignetteDarkness",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 64,
      "default": 64
    }

  ];


  this.curve = 1.0;
  this.contrast = 1.0;
  this.saturation = 0.0;
  this.blurValue = 0.3;
  this.glowValue = 40/50;
  this.scanlineIntensity = 0.63;
  this.maskType = 0;
  this.verticalLineIntensity = 1-0.25;

  this.vignetteOffset = 50 / 50;
  this.vignetteDarkness = 64 / 50;

}

LotteCRTEffect.prototype = {

  getName: function() {
    return "CRT (Lotte)";
  },

  getParams: function() {
    return this.params;
  },

  setParamValue: function(param, value) {
    switch(param) {
      case 'Blur':
        this.blurValue = value / 100;
        this.blurPass.uniforms['amount'].value = this.blurValue;
        break;
      case 'Saturation':
        this.contrast = value / 50;
        if(this.contrast == 0) {
          this.contrast = 0.5/50;
        }
        this.crtPass.uniforms["contrast"].value = this.contrast;
        break;
        /*
      case 'Saturation':
        this.saturation = value / 50;
        this.crtPass.uniforms["saturation"].value = this.saturation;
        break;
*/        

      case 'Scanline Intensity':
        this.scanlineIntensity = value / 100;
        this.crtPass.uniforms['INPUT_THIN'].value = this.scanlineIntensity;
        break;

      case 'Mask Type':
        this.maskType = 2;
        if(value == "Lite") {
          this.maskType = 1;
        } 
        if(value == "Normal") {
          this.maskType = 0;
        }
        this.crtPass.uniforms['masktype'].value = this.maskType;
        break;

      case 'Vertical Line Intensity':
        this.verticalLineIntensity = value / 100;
        this.crtPass.uniforms['INPUT_MASK'].value = 1-this.verticalLineIntensity;
        break;

      case 'Curve':
        this.curve = (value == "On") ? 1 : 0;
        this.crtPass.uniforms['warpscreen'].value = this.curve;
        break;

          
      case 'Glow':
        this.glowValue = value / 50;
        this.bloomPass.copyUniforms["opacity"].value = this.glowValue;
        break;
      case 'VignetteOffset':
        this.vignetteOffset = value / 50;

        this.vignettePass.uniforms['offset'].value = this.vignetteOffset;
        break;
      case 'VignetteDarkness':
        this.vignetteDarkness = value / 50;

        this.vignettePass.uniforms['darkness'].value = this.vignetteDarkness;        
        break;
    }
  },

  setupComposer: function(composer, width, height) {
    
    this.blurPass = new THREE.ShaderPass( BlurShader );  
    this.blurPass.uniforms['resolution'].value = new THREE.Vector2( width, height );
    this.blurPass.uniforms['amount'].value = this.blurValue;

    composer.addPass( this.blurPass);
//    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );    
//    composer.addPass(effectCopy);

    this.crtPass = new THREE.ShaderPass( LotteCRTShader );
    composer.addPass(this.crtPass );
    this.crtPass.uniforms['resolution'].value = new THREE.Vector2( width, height );
    this.crtPass.uniforms['INPUT_X'].value = width / 3;
    this.crtPass.uniforms['INPUT_Y'].value = height / 3;
    this.crtPass.uniforms['INPUT_THIN'].value = this.scanlineIntensity;
    this.crtPass.uniforms['INPUT_MASK'].value = this.verticalLineIntensity;    
    this.crtPass.uniforms['masktype'].value = this.maskType;    
    /*
    "INPUT_X":  { type: 'f', value: 960 / 3 }, //128.0 },
    "INPUT_Y":  { type: 'f', value: 600 / 3 }, // 144.0 },//72.0 },
    */
    this.crtPass.uniforms["contrast"].value = this.contrast;
    //this.crtPass.uniforms["saturation"].value = this.saturation;
    this.crtPass.uniforms['warpscreen'].value = this.curve;


    this.bloomPass = new THREE.BloomPass();
    this.bloomPass.copyUniforms["opacity"].value = this.glowValue; //0.3;//this.effectsList[i].params['opacity'];
    composer.addPass(this.bloomPass);


    this.vignettePass = new THREE.ShaderPass( VignetteShader );
    this.vignettePass.uniforms['offset'].value = this.vignetteOffset;
    this.vignettePass.uniforms['darkness'].value = this.vignetteDarkness;        
    composer.addPass(this.vignettePass);


  }
}