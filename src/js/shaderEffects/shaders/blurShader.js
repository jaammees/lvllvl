BlurShader = {

  uniforms: {

    "tDiffuse":     { value: null },
    "amount":       { value: 1.0 },
    "resolution":   { value: new THREE.Vector2( 960.0, 600 ) },
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
    "uniform vec2 resolution;",
    "varying vec2 vUv;",

    "void main( void )",
        "    {",
        "    vec2 uv = vUv;",
        "    vec2 blur = vec2(amount/resolution.x, amount/resolution.y);",

        "    vec4 sum = texture2D( tDiffuse, uv ) * 0.2270270270;",
        "    sum += texture2D(tDiffuse, vec2( uv.x - 4.0 * blur.x, uv.y - 4.0 * blur.y ) ) * 0.0162162162;",
        "    sum += texture2D(tDiffuse, vec2( uv.x - 3.0 * blur.x, uv.y - 3.0 * blur.y ) ) * 0.0540540541;",
        "    sum += texture2D(tDiffuse, vec2( uv.x - 2.0 * blur.x, uv.y - 2.0 * blur.y ) ) * 0.1216216216;",
        "    sum += texture2D(tDiffuse, vec2( uv.x - 1.0 * blur.x, uv.y - 1.0 * blur.y ) ) * 0.1945945946;",
        "    sum += texture2D(tDiffuse, vec2( uv.x + 1.0 * blur.x, uv.y + 1.0 * blur.y ) ) * 0.1945945946;",
        "    sum += texture2D(tDiffuse, vec2( uv.x + 2.0 * blur.x, uv.y + 2.0 * blur.y ) ) * 0.1216216216;",
        "    sum += texture2D(tDiffuse, vec2( uv.x + 3.0 * blur.x, uv.y + 3.0 * blur.y ) ) * 0.0540540541;",
        "    sum += texture2D(tDiffuse, vec2( uv.x + 4.0 * blur.x, uv.y + 4.0 * blur.y ) ) * 0.0162162162;",
        "    gl_FragColor = sum;",
        "    }   "
  ].join("\n"),

};
