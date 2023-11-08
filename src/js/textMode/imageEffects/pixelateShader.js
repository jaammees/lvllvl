
/**
 * @author felixturner / http://airtight.cc/
 *
 * Pixelate Shader
 * make into pixels
 *
 */

THREE.PixelateShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "pixelsX":     { type: "f", value: 10 }, //number of pixels on x
    "pixelsY":     { type: "f", value: 10 } //number of pixels on  Y

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float pixelsX;",
    "uniform float pixelsY;",

    "varying vec2 vUv;",

    // "const float M_PI = 3.14159265358979323846;",

    // "const mat2 rotation = mat2( cos(M_PI/4.0), sin(M_PI/4.0),",
    //            "-sin(M_PI/4.0), cos(M_PI/4.0));",

    "void main() {",

      //"vec2 p = vUv * rotation;",
      //roate (broken)
      //"vec2 p = vUv * mat2(0.707, -0.707, 0.707, 0.707);",


      "vec2 p = vUv;",

      "p.x = floor(p.x * pixelsX)/pixelsX + 0.5/pixelsX;",
      "p.y = floor(p.y * pixelsY)/pixelsY + 0.5/pixelsY;",

      "gl_FragColor = texture2D(tDiffuse, p);",

    "}"

  ].join("\n")

};


/**
 * @author felixturner / http://airtight.cc/
 *
 * Polar Pixelate Shader ported from GPUImage
 *
 */

THREE.PolarPixelateShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "pixelsX":     { type: "f", value: 0.05 }, //number of pixels on x
    "pixelsY":     { type: "f", value: 0.05 } //number of pixels on  Y

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float pixelsX;",
    "uniform float pixelsY;",

    "varying vec2 vUv;",

    "void main() {",


      "vec2 normCoord = 2.0 * vUv - 1.0;",
        //"vec2 normCenter = 2.0 * center - 1.0;",
         
        //"normCoord -= normCenter;",
         
        "float r = length(normCoord);", // to polar coords
        "float phi = atan(normCoord.y, normCoord.x);", // to polar coords
         
        "r = r - mod(r, pixelsX) + 0.03;",
        "phi = phi - mod(phi, pixelsY);",
         
        "normCoord.x = r * cos(phi);",
        "normCoord.y = r * sin(phi);",
         
       // "normCoord += normCenter;",
         
        "vec2 textureCoordinateToUse = normCoord / 2.0 + 0.5;",
         
        "gl_FragColor = texture2D(tDiffuse, textureCoordinateToUse );",


    "}"

  ].join("\n")

};

