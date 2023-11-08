/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Sobel filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

EmbossShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "aspect":    { value: new THREE.Vector2( 512, 512 ) },
    "weight": { type: 'f', value: 1.0 },
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
    "varying vec2 vUv;",
    "uniform vec2 aspect;",
    "uniform float weight;",

    /*
    var matrix = [-1,-1, 0,
            -1, 1, 1,
             0, 1, 1];
             */
  //  "mat3 G[2];",

/*
    -2, -1,  0,
       -1,  1,  1,
        0,  1,  2
        */
    "const mat3 g0 = mat3( -2.0, -1.0, 0.0, -1.0, 1.0, 1.0, 0.0, 1.0, 2.0 );",
//    "const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );",


    "void main(void)",
    "{",

    "vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",

   "vec4 colorSum =",
   "    texture2D(tDiffuse, vUv + texel * vec2(-1, -1)) * g0[0][0] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 0, -1)) * g0[0][1] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 1, -1)) * g0[0][2] +",
   "    texture2D(tDiffuse, vUv + texel * vec2(-1,  0)) * g0[1][0] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 0,  0)) * g0[1][1] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 1,  0)) * g0[1][2] +",
   "    texture2D(tDiffuse, vUv + texel * vec2(-1,  1)) * g0[2][0] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 0,  1)) * g0[2][1] +",
   "    texture2D(tDiffuse, vUv + texel * vec2( 1,  1)) * g0[2][2] ;",
   "gl_FragColor = vec4((colorSum / weight).rgb, 1);",
/*

      "mat3 I;",
      "float cnv[2];",
      "vec3 sample;",

      "G[0] = g0;",
      "G[1] = g1;",

      "for (float i=0.0; i<3.0; i++)",
      "for (float j=0.0; j<3.0; j++) {",
        "sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
        "I[int(i)][int(j)] = length(sample);",
      "}",

      "for (int i=0; i<2; i++) {",
        "float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
        "cnv[i] = dp3 * dp3; ",
      "}",

      "gl_FragColor = vec4(0.5 * sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));",

      */
    "} ",

  ].join( "\n" )

};
