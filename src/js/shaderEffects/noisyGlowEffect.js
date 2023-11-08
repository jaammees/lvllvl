var NoisyGlowEffect = function() {
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
      "name": "Noise",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 30,
      "default": 30
    },

    {
      "name": "BlurTwo",
      "min": 0,
      "max": 100,
      "type": "range",
      "value": 30,
      "default": 30
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


  this.blurValue = 0.1;
  this.blur2Value = 0.1;
  this.noiseValue = 0.3;
  this.glowValue = 0.3;
  

}

NoisyGlowEffect.prototype = {
  getName: function() {
    return "Noisy Glow";
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

      case 'Noise':
        this.noiseValue = value / 100;
        this.noisePass.uniforms['nIntensity'].value = this.noiseValue;
        break;
      case 'BlurTwo':
        this.blur2Value = value / 100;
        this.blur2Pass.uniforms['amount'].value = this.blur2Value;
        break;
  
      case 'Glow':
        this.glowValue = value / 50;
        this.bloomPass.copyUniforms["opacity"].value = this.glowValue;
        break;
    }
  },
  
  // need glow applied to noise, not noise + src
  // need noise variance
  
  setupComposer: function(composer, width, height) {


    BlurShader.uniforms['amount'].value = this.blurValue;
    BlurShader.uniforms['resolution'].value = new THREE.Vector2( width, height );
    this.blurPass = new THREE.ShaderPass( BlurShader );  
    composer.addPass( this.blurPass);

    var effectCopy = new THREE.ShaderPass( THREE.CopyShader );    
    composer.addPass(effectCopy);

    this.noisePass = new THREE.ShaderPass( NoiseShader );     

    this.noisePass.uniforms['nIntensity'].value = this.noiseValue;
    composer.addPass( this.noisePass);
    effectCopy = new THREE.ShaderPass( THREE.CopyShader );    
    composer.addPass(effectCopy);

    this.blur2Pass = new THREE.ShaderPass( BlurShader );  
    composer.addPass( this.blur2Pass);

    this.bloomPass = new THREE.BloomPass();
    this.bloomPass.copyUniforms["opacity"].value = this.glowValue ;//this.effectsList[i].params['opacity'];
    composer.addPass(this.bloomPass);

  }
}