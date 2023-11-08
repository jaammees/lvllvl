

THREE.DiffusionShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "scale":     { type: "f", value: 1.0 }
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "#include <common>",

    "uniform sampler2D tDiffuse;",
    "uniform float scale;",

    "varying vec2 vUv;",


    // "const float M_PI = 3.14159265358979323846;",

    // "const mat2 rotation = mat2( cos(M_PI/4.0), sin(M_PI/4.0),",
    //            "-sin(M_PI/4.0), cos(M_PI/4.0));",

    "void main() {",

      //"vec2 p = vUv * rotation;",
      //roate (broken)
      //"vec2 p = vUv * mat2(0.707, -0.707, 0.707, 0.707);",

      // make some noise
      "float r1 = rand( vUv  );",
      "float r2 = rand( vUv  );",

      "float x = vUv.x - scale * r1 * sin(r2 * 255.0);",
      "float y = vUv.y - scale * r1 * cos(r2 * 255.0);",

      "vec2 p = vUv;",

      "p.x = x;",
      "p.y = y;",


      "gl_FragColor = texture2D(tDiffuse, p);",

    "}"

  ].join("\n")

};
