
ChromaKeyShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "r": { type: 'f', value: 0.06 },
    "g": { type: 'f', value: 0.698 },
    "b": { type: 'f', value: 0.0 }
//    "strength":   { type: 'f', value: 0.02 },
//    "exponent":    { type: 'f', value: 0.1 },
//    "iResolution": { type: 'v2', value: new THREE.Vector2(320, 200) }
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float r;",
    "uniform float g;",
    "uniform float b;",

//    "uniform float strength;",
//    "uniform float exponent;",
//    "uniform vec2 iResolution;",


    "varying vec2 vUv;",

    "void main() {",

    "  vec3 screen = vec3(r, g, b);",
    "  mediump vec3 tColor = texture2D( tDiffuse, vUv ).rgb;",
    "  mediump float a = (length(tColor - screen) - 0.5) * 7.0;",
    "  gl_FragColor = vec4(tColor, a);",
  


/*
    "  vec4 screen = vec4(0.0, 0.0, 0.0, 1.0);",
    "  float screenWeight = 1.0; ",
    "  float clipBlack = 0.0;",
    "  float clipWhite = 1.0;",
    "  float balance = 1.0;",

    " vec4 sourcePixel = texture2D( tDiffuse, vUv );",


    " float screenfmin = min(min(screen.r, screen.g), screen.b);",  // min val of RGB
    " float screenfmax = max(max(screen.r, screen.g), screen.b);", //Max. value of RGB

    " vec3 screenPrimary = step(screenfmax, screen.rgb);",
    " float screenSecondaryComponents = dot(1.0 - screenPrimary, screen.rgb);",
    " float screenSat = screenfmax - mix(screenSecondaryComponents - screenfmin, screenSecondaryComponents / 2.0, balance);",



    " float fmin = min(min(sourcePixel.r, sourcePixel.g), sourcePixel.b);", //Min. value of RGB
    " float fmax = max(max(sourcePixel.r, sourcePixel.g), sourcePixel.b);", //Max. value of RGB   
    " vec3 pixelPrimary = step(fmax, sourcePixel.rgb);", 

    " float secondaryComponents = dot(1.0 - pixelPrimary, sourcePixel.rgb);",
    " float pixelSat = fmax - mix(secondaryComponents - fmin, secondaryComponents / 2.0, balance);",

    // solid pixel if primary color component is not the same as the screen color
    " float diffPrimary = dot(abs(pixelPrimary - screenPrimary), vec3(1.0));",
    " float solid = step(1.0, step(pixelSat, 0.1) + step(fmax, 0.1) + diffPrimary);",
//    Semi-transparent pixel if the primary component matches but if saturation is less
//    than that of screen color. Otherwise totally transparent
    " float alpha = max(0.0, 1.0 - pixelSat / screenSat); ",
    " alpha = smoothstep(clipBlack, clipWhite, alpha);",
    " vec4 semiTransparentPixel = vec4((sourcePixel.rgb - (1.0 - alpha) * screen.rgb * screenWeight) / max(0.00001, alpha), alpha);",
    " vec4 pixel = mix(semiTransparentPixel, sourcePixel, solid);",

    " gl_FragColor = pixel; ",//vec4(pixel.r, pixel.g, alpha, 1.0);",
*/

    "}"

  ].join( "\n" )

};
