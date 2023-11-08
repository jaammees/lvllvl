//https://www.bidouille.org/prog/plasma

THREE.PlasmaShader = {

  uniforms: {

    "tDiffuse":   { value: null },
    "time":       { value: 0.0 },
    "scale":      { value: 1.0 },
    "amount":     { value: 0.5 }

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
    "uniform float scale;",  
    "uniform float amount;",  

    "varying vec2 vUv;",

    "#define PI 3.14159265359",


//uniform float u_time;
//uniform vec2 u_k;
//varying vec2 v_coords;
 
    "void main() {",
    // sample the source
    "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",
    "float v = 0.0;",
    "vec2 c = vUv * scale - scale/2.0;",
    "v += sin((c.x+time));",
    "v += sin((c.y+time)/2.0);",
    "v += sin((c.x+c.y+time)/2.0);",
    "c += scale/2.0 * vec2(sin(time/3.0), cos(time/2.0));",
    "v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+time);",
    "v = v/2.0;",
    "vec3 col = vec3(1, sin(PI*v), cos(PI*v));",
//    "gl_FragColor = (1.0 - amount) * cTextureScreen + amount * cTextureScreen * vec4(col*.5 + .5, 1);",
    "gl_FragColor = (1.0 - amount) * cTextureScreen + amount  * vec4(col*.5 + .5, 1);",
//    "gl_FragColor = cTextureScreen * vec4(col*.5 + .5, 1);",
    "}"
  ].join( "\n" )
}