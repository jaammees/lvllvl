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

GhostShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "amount":   { value: 0.02 },
    "angle":    { value: 0.0 }

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
    "uniform float amount;",
    "uniform float angle;",

    "varying vec2 vUv;",

    "void main() {",

      "vec2 offset = amount * vec2( cos(angle), sin(angle));",
      "vec4 cr = texture2D(tDiffuse, vUv + offset);",
      "vec4 cga = texture2D(tDiffuse, vUv);",
      "vec4 cb = texture2D(tDiffuse, vUv - offset);",
//      "gl_FragColor = vec4(cr.r, cr.g, cr.b, cr.a);",
      "vec4 sum = vec4( 0.0 );",

      "sum += texture2D( tDiffuse, vUv ) * 0.7;",
      "sum += texture2D( tDiffuse, vUv + offset ) * 0.3;",
      "sum += texture2D( tDiffuse, vUv + offset * 2.0 ) * 0.2;",
      "sum += texture2D( tDiffuse, vUv + offset * 3.0 ) * 0.1;",
      "sum += texture2D( tDiffuse, vUv + offset * 4.0 ) * 0.04;",

      "gl_FragColor = sum;",

    "}"

  ].join( "\n" )

};
