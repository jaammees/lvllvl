
THREE.ScanlinesShader = {

  uniforms: {

    "tDiffuse":   { value: null },
    "time":       { value: 0.0 },
    "linesAmount": { value: 0.05 },
    "count":     { value: 4096 }

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
    "uniform float time;",
    "uniform float count;",
    "uniform float linesAmount;",

    "varying vec2 vUv;",

    "#define PI 3.14159265359",

    "highp float rand( const in vec2 uv ) {",
      "const highp float a = 12.9898, b = 78.233, c = 43758.5453;",
      "highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );",
      "return fract(sin(sn) * c);",
    "}",

    "void main() {",

      
      // add noise
//      "float dx = rand( vUv + time );",
//      "vec3 cResult = cTextureScreen.rgb * dx * noiseAmount;",



      // get us a sine and cosine
//      "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

      // add scanlines
//      "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

      // interpolate between source and result by intensity
//      "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",


/*
      // sample the source
      "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

      // make some noise
      "float dx = rand( vUv + time );",

      // add noise
      "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

      // get us a sine and cosine
      "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

      // add scanlines
      "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

      // interpolate between source and result by intensity
      "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",
*/


      // sample the source
      "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

      
      // add scanlines

      // get us a sine and cosine
      "vec2 sc = vec2( sin( (vUv.y) * count ), cos( (vUv.y) * count) );",

      // add scanlines
      "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * linesAmount;",

      // interpolate between source and result by intensity
//      "cResult = cTextureScreen.rgb +  ( cResult - cTextureScreen.rgb );",

      // interpolate between source and result by intensity
//      "cResult = cTextureScreen.rgb + ( cResult );",

      "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

    "}"

  ].join( "\n" )

};
