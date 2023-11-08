/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

DenoiseShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "strength":   { type: 'f', value: 0.02 },
    "exponent":    { type: 'f', value: 0.1 },
    "iResolution": { type: 'v2', value: new THREE.Vector2(320, 200) }
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
    "uniform float strength;",
    "uniform float exponent;",
    "uniform vec2 iResolution;",


    "varying vec2 vUv;",

    "void main() {",

    "  vec4 center = texture2D(tDiffuse, vUv);",
    "  vec4 color = vec4(0.0);",
    "  float total = 0.0;",
    "  for (float x = -4.0; x <= 4.0; x += 1.0) {",
    "    for (float y = -4.0; y <= 4.0; y += 1.0) {",
    "      vec4 sample = texture2D(tDiffuse, vUv + vec2(x, y) / iResolution);",
    "      float weight = 1.0 - abs(dot(sample.rgb - center.rgb, vec3(0.25)));",
    "      weight = pow(weight, exponent);",
    "      color += sample * weight;",
    "      total += weight;",
    "    }",
    "  }",
    " gl_FragColor = color / total;",
    "}"

  ].join( "\n" )

};
