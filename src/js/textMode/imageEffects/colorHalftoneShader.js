/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

ColorHalftoneShader= {

  uniforms: {

    "tDiffuse": { value: null },
    "tSize":    { value: new THREE.Vector2( 256, 256 ) },
    "center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
    "angle":    { value: 1.57 },
    "scale":    { value: 1.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    "uniform vec2 center;",
    "uniform float angle;",
    "uniform float scale;",
    "uniform vec2 tSize;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "float pattern(float a) {",

      "float s = sin( a ), c = cos( a );",

      "vec2 tex = vUv * tSize - center;",

      "vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

      "return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

    "}",

    "void main() {",

      "vec4 color = texture2D( tDiffuse, vUv );",
      "vec3 cmy = 1.0 - color.rgb;",
      "float k = min(cmy.x, min(cmy.y, cmy.z));",
      "cmy = (cmy - k) / (1.0 - k);",
      "cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179), pattern(angle + 1.30899), pattern(angle)), 0.0, 1.0);",

      "k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);",
      "gl_FragColor = vec4(1.0 - cmy - k, color.a);",
      //"float average = ( color.r + color.g + color.b ) / 3.0;",

      //"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

    "}"

  ].join( "\n" )

};
