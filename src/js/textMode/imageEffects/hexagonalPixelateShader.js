THREE.HexagonalPixelateShader = {

  uniforms: {

    "tDiffuse":  { type: "t", value: null },
    "scale":     { type: "f", value: 10 },
    "texSize":   { value: new THREE.Vector2( 320, 200 ) },
    "center":   { value: new THREE.Vector2( 160, 100 ) }

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
    "uniform float scale;",
    "uniform vec2 texSize;",
    "uniform vec2 center;",

    // vUv from 0 to 1
    "varying vec2 vUv;",

    // "const float M_PI = 3.14159265358979323846;",

    // "const mat2 rotation = mat2( cos(M_PI/4.0), sin(M_PI/4.0),",
    //            "-sin(M_PI/4.0), cos(M_PI/4.0));",

    "void main() {",

      //"vec2 p = vUv * rotation;",
      //roate (broken)
      //"vec2 p = vUv * mat2(0.707, -0.707, 0.707, 0.707);",


      "vec2 tex = (vUv * texSize - center) / scale;",
      "tex.y /= 0.866025404;",
      "tex.x -= tex.y * 0.5;",

      "vec2 a;",
      "if (tex.x + tex.y - floor(tex.x) - floor(tex.y) < 1.0) a = vec2(floor(tex.x), floor(tex.y));",
      "else a = vec2(ceil(tex.x), ceil(tex.y));",
      "vec2 b = vec2(ceil(tex.x), floor(tex.y));",
      "vec2 c = vec2(floor(tex.x), ceil(tex.y));",

      "vec3 TEX = vec3(tex.x, tex.y, 1.0 - tex.x - tex.y);",
      "vec3 A = vec3(a.x, a.y, 1.0 - a.x - a.y);",
      "vec3 B = vec3(b.x, b.y, 1.0 - b.x - b.y);",
      "vec3 C = vec3(c.x, c.y, 1.0 - c.x - c.y);",


      "float alen = length(TEX - A);",
      "float blen = length(TEX - B);",
      "float clen = length(TEX - C);",

      "vec2 choice;",
      "      if (alen < blen) {",
      "          if (alen < clen) choice = a;",
      
      "          else choice = c;",
      "      } else {",
      "          if (blen < clen) choice = b;",
      "          else choice = c;",
      "      }",

      "      choice.x += choice.y * 0.5;",
      "      choice.y *= 0.866025404;",
      "      choice *= scale / texSize;",
      "      gl_FragColor = texture2D(tDiffuse, choice + center / texSize);",

/*

      "vec2 p = vUv;",

      "p.x = floor(p.x * pixelsX)/pixelsX + 0.5/pixelsX;",
      "p.y = floor(p.y * pixelsY)/pixelsY + 0.5/pixelsY;",

      "gl_FragColor = texture2D(tDiffuse, p);",
*/
    "}"

  ].join("\n")

};
