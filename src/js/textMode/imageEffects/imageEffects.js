var ImageEffects = function() {
  this.editor = null;

  this.effectList = [
    {
      name: "Blur",
      params: {
        amount: { name: "Amount", min: 0, max: 10, defaultValue: 3 }
      }
    },
    { 
      name: "Bump",
      params: {

      }
    },
    {
      name: "Diffusion",
      params: {
        scale: { name: "Amount", min: 0, max: 100, defaultValue: 4 }
      }
    },
    {
      name: "Edge Detection",
      params: {

      }
    },
    {
      name: "Emboss",
      params: {
        height: { name: "Height", min: 1, max: 10, defaultValue: 1 },
        angle: { name: "Angle", min: 0, max: 360, type: 'angle', defaultValue: 135 },
        elevation: { name: "Elevation", min: 0, max: 180, defaultValue: 30 }
      }
    },

    {
      name: "Gain/Bias",
      params: {
        gain: { name: "Gain", min: 0, max: 1, defaultValue: 0.5 },
        bias: { name: "Bias", min: 0, max: 1,  defaultValue: 0.5 }
      }
    },
    {
      name: "Noise",
      params: {
        amount: { name: "Amount", min: 0, max: 100, defaultValue: 25 },
        density: { name: "Density", min: 0, max: 1, defaultValue: 0.8 },
        mono: { name: "Monochrome", type: "options", options: ['Yes', 'No' ], defaultValue: 'No' }
      }
    },
    {
      name: "Oil Painting",
      params: {
        range: { name: "Amount", min: 0, max: 5, defaultValue: 3 }
      }
    },

    { 
      name: "Brightness",
      params: {
        amount: { name: "Amount", min: -1, max: 1, defaultValue: 0}
      }
    },
    { 
      name: "Hue",
      params: {
        amount: { name: "Amount", min: -1, max: 1, defaultValue: 0}
      }
    },

    { 
      name: "Contrast",
      params: {
        amount: { name: "Amount", min: 0, max: 2, defaultValue: 1}
      }
    },

    { 
      name: "Saturation",
      params: {
        amount: { name: "Amount", min: 0, max: 2, defaultValue: 1}

      }
    },
    { 
      name: "Sepia",
      params: {
        amount: { name: "Amount", min: 0, max: 30, defaultValue: 10}

      }
    },
    {
      name: "Smear",
      params: {
        type:    { name: "Type", type: "options", options: [ 'Circle', 'Line', 'Square' ], defaultValue: 'Circle' },
        // circle has size, cross has distance, line has angle and distance, square has size, density mix
        size:    { name: "Size", min: 1, max: 30, defaultValue: 4  },
        angle:   { name: "Angle", min:0, max: 360, defaultValue: 10, type: "angle" },
        density: { name: "Density", min: 0, max: 1, defaultValue: 0.5 },
        mix:     { name: "Mix", min: 0, max: 1, defaultValue: 0.5 }
      }
    },
    {
      name: "Ripples",
      params: {
        type: { name: "Type", type: "options", options: [ 'Sawtooth', 'Sine', 'Triangle' ], defaultValue: 'Sine' },
        xAmplitude: { name: "X Amplitude", min: 0, max: 20, defaultValue: 5 },
        yAmplitude: { name: "Y Amplitude", min: 0, max: 20, defaultValue: 5 },
        xWavelength: { name: "X Wavelength", min: 0, max: 50, defaultValue: 16 },
        yWavelength: { name: "Y Wavelength", min: 0, max: 50, defaultValue: 16 },
      }
    },
    {
      name: "Vignette",
      params: {
        amount:{ name: "Amount", min: 0, max: 1, defaultValue: 0.3 }
      }
    }

  ];
}

ImageEffects.prototype = {
  init: function() {
    this.initParameters();
  },

  initParameters: function() {

  },

  getEffectsList: function() {
    return this.effectList;
  },

  getParameters: function(effect) {
    switch(effect) {
      case "Blur":
        return JSManipulate.blur.valueRanges;
      break;

    }

  },

  applyEffect: function(effect, imageData, params) {
    switch(effect) {
      case "Blur":
        JSManipulate.blur.filter(imageData, params);
      break;
      case "Bump":
        JSManipulate.bump.filter(imageData, params);
      break;
      case "Diffusion":
        JSManipulate.diffusion.filter(imageData, params);
      break;
      case "Edge Detection":
        JSManipulate.edge.filter(imageData, params);
      break;
      case "Emboss":
        JSManipulate.emboss.filter(imageData, params);
      break;
      case "Gain/Bias":
        JSManipulate.gain.filter(imageData, params);
      break;
      case "Noise":
        params.monochrome = params.mono == 'Yes';
        JSManipulate.noise.filter(imageData, params);      
      break;
      case "Oil Painting":
        JSManipulate.oil.filter(imageData, params);
        break;
      case "Brightness":
        JSManipulate.brightness.filter(imageData, params);
        break;
      case "Hue":
        JSManipulate.hue.filter(imageData, params);
        break;

      case "Contrast":
        JSManipulate.contrast.filter(imageData, params);
        break;
      case "Saturation":
        JSManipulate.saturation.filter(imageData, params);
        break;
      case "Sepia":
        JSManipulate.sepia.filter(imageData, params);
        break;
      case "Smear":
        {
          var type = params.type;
          if(type == 'Circle') {
            JSManipulate.circlesmear.filter(imageData, params);
          } else if(type == 'Cross') { 

            console.log("CROSS SMEAR not wodking??!!");
            params.distance = params.size;

            JSManipulate.crosssmear.filter(imageData, params);

          } else if(type == 'Line') {
            params.distance = params.size;
            JSManipulate.linesmear.filter(imageData, params);
          } else if(type == 'Square') {
            JSManipulate.squaresmear.filter(imageData, params);
          }
        }
        break;
      case "Ripples":
        var type = params.type;
        console.log('ripple type = ' + type);
        if(typeof type == 'undefined') {
          type = 'Sine';
        }

        if(type == 'Sine') {
          JSManipulate.sineripple.filter(imageData, params);
        } else if(type == 'Sawtooth') {
          JSManipulate.sawtoothripple.filter(imageData, params);
        } else if(type == 'Triangle') {
          JSManipulate.triangleripple.filter(imageData, params);
        }
        break;
      case "Vignette":
        JSManipulate.vignette.filter(imageData, params);
        break;
    }
  }
}


