var ShaderImport2 = function() {
  this.editor = null;

  this.colors = [];
  this.bgColors = [];
  this.characters = [];

  this.backgroundColorChoose = 'auto';


  this.useMultipleBGColors = false;  

  //this.imageData = null;

  this.srcCanvas = null;

  this.charCanvas = null;
  this.colorCanvas = null;


  this.vectorTileCanvas = null;
  this.vectorTileContext = null;
  this.vectorTileImageData = null;

//  this.shader = "\n\nuniform sampler2D inputImage;\nuniform sampler2D charImage;\nuniform vec2 resolution;\nuniform vec3 fgColor;\nuniform vec3 bgColor;\nuniform int charCount;\nuniform float inputImageWidth;\nuniform float inputImageHeight;\n\n\nvarying vec2 vUv;\n\n\nvec3 RGB2Lab(vec3 rgb){\n    float R = rgb.x;\n    float G = rgb.y;\n    float B = rgb.z;\n    // threshold\n    float T = 0.008856;\n\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\n\n    // Normalize for D65 white point\n    X = X / 0.950456;\n    Y = Y;\n    Z = Z / 1.088754;\n\n    bool XT, YT, ZT;\n    XT = false; YT=false; ZT=false;\n    if(X > T) XT = true;\n    if(Y > T) YT = true;\n    if(Z > T) ZT = true;\n\n    float Y3 = pow(Y,1.0/3.0);\n    float fX, fY, fZ;\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\n\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\n    float a = 500.0 * ( fX - fY );\n    float b = 200.0 * ( fY - fZ );\n\n    return vec3(L,a,b);\n}\n\n\nvec2 findCharacter(float x, float y) {\n\n//  float inputImageWidth = 512.0;\n//  float inputImageHeight = 256.0;\n  int character = 0;\n  float bestScore = 0.00;\n  vec3 fgColorLAB = RGB2Lab(fgColor);\n  vec3 bgColorLAB = RGB2Lab(bgColor);\n\n  // loop through the top row\n  for(int i = 0; i < 32; i++) {\n    if(i < charCount) {\n      float score = 0.0;\n      // loop through xy of input image, compare to character\n      for(int cy = 0; cy < {charHeight}; cy++) {\n        for(int cx = 0; cx < {charWidth}; cx++) {\n          float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\n          float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\n          vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\n\n          float charX = (float(i) * {charWidth}.0 + float(cx)) / 255.0;\n          float charY = ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\n          vec4 charPixel = texture2D(charImage, vec2(charX, charY));\n\n          vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\n\n          if(charPixel.x > 0.3) {\n  //          score = score + abs(imagePixel.x - fgColor.x) + abs(imagePixel.y - fgColor.y) + abs(imagePixel.z - fgColor.z);\n            score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\n\n          } else {\n  //          score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y - bgColor.y) + abs(imagePixel.z - bgColor.z);\n\n            score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\n\n  /*\n            if(imagePixel.w == 0.0) {\n              score += 0.0;\n            } else {\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\n            }\n  */\n\n          }\n\n        }\n      }\n\n      if(i == 0) {\n        bestScore = score;\n        character = i;\n      }\n      if(score < bestScore) {\n        character = i;\n        bestScore = score;\n      }\n    }\n  }\n\n\n\n//character = int(y);\n  return vec2(float(character), bestScore);\n}\n\nvoid main() {\n//  vec4 texel = texture2D( inputImage, vUv / 1.0 );\n//  gl_FragColor = texel;\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, .0, 0.0, 1.0);\n\n  vec2 result =  findCharacter(floor(gl_FragCoord.x), floor(gl_FragCoord.y));\n  float character = result.x / 255.0;\n\n  float score = result.y / 256.0;\n  float scoreL = fract(score);\n  float scoreH = floor(score) / 256.0;\n\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\n\n//  gl_FragColor = vec4(character, score, 0.0, 1.0);\n\n\n\n\n}\n\n      \n      \n\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0;\r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 bgColorLAB = RGB2Lab(vec3(0.0, 0.0, 0.0)); \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      float score = 0.0; \r\n      // loop through xy of input image, compare to character\r\n      for(int cy = 0; cy < {charHeight}; cy++) {\r\n        for(int cx = 0; cx < {charWidth}; cx++) {\r\n          float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n          float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n          vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n\r\n          float charCol = mod(float(i), 16.0);\r\n          float charRow = floor(float(i) / 16.0);\r\n          float charImageHeight = 128.0;\r\n          float charImageWidth = 128.0; \r\n          \r\n          float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n          float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n//          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n          vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n\r\n          vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n\r\n          if(charPixel.x > 0.3) {\r\n  //          score = score + abs(imagePixel.x - 1.0) + abs(imagePixel.y - 1.0) + abs(imagePixel.z - 1.0);\r\n            score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n\r\n          } else {\r\n//            score = score + abs(imagePixel.x - 0.0) + abs(imagePixel.y - 0.0) + abs(imagePixel.z - 0.0);\r\n\r\n            score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n\r\n  /*\r\n            if(imagePixel.w == 0.0) {\r\n              score += 0.0;\r\n            } else {\r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n            }\r\n  */\r\n\r\n          }\r\n \r\n        }\r\n      }\r\n\r\n      if(i == 0.0) {\r\n        bestScore = score;\r\n        character = int(i);\r\n      }\r\n      if(score < bestScore) {\r\n        character = int(i);\r\n        bestScore = score;\r\n      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n  float sourceCol = mod(resultPosition , inputImageCols);\r\n  float sourceRow = floor(resultPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow);\r\n  float character = result.x / 255.0;\r\n  \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, score, 0.0, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          15.5 / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          15.5 / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab( vec3(bgColor.x, bgColor.y, bgColor.z) );  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 13.0;\r\n                }\r\n              } else {  \r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score += 3.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";;

  //this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 5.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score += 5.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score = score + 713.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";    

  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 800.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score = score + 800.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

  this.vertexShader =  ["varying vec2 vUv;",
                        "void main() {",
                        "vUv = uv;",
                        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                        "}"].join("\n");


  this.debug = false;
}

ShaderImport2.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.charactersHasSpace = true;
    this.charactersHasBlock = true;
  },

  setColors: function(colors) {
    var noColor = this.editor.colorPaletteManager.noColor;
    this.colors = [];
    for(var i = 0; i < colors.length; i++) {
      if(colors[i] !== 'noColor') {
        this.colors.push(colors[i]);
      }
    }
  },

  setBGColors: function(bgColors) {

    this.bgColors = [];
    for(var i = 0; i < bgColors.length; i++) {
      this.bgColors.push(bgColors[i]);
    }

  },

  setBackgroundColorChoose: function(backgroundColorChoose) {
    this.backgroundColorChoose = backgroundColorChoose;    
  },

  setCharacters: function(characters) {


    var tileSetManager = this.editor.tileSetManager;
    var tileSet = tileSetManager.getCurrentTileSet();

    if(tileSet.getType() == 'vector') {
      this.blankCharacter = tileSet.getBlankTile();
      this.blockCharacter = tileSet.getBlockTile();
    }


    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    this.blankCharacter = false;
    this.blockCharacter = false;

    this.characters = [];
    for(var i = 0; i < characters.length; i++) {
      this.characters.push(characters[i]);

      if(this.blockCharacter === false) {
        var block = true;
        for(var y = 0; y < charHeight; y++) {
          for(var x = 0; x < charWidth; x++) {
            var pixel = tileSet.getPixel(characters[i], x, y) ;
            if(pixel == 0) {
              block = false;
              y = charHeight;
              break;
            }
          }
        }
        if(block == true) {
          this.blockCharacter = characters[i];
        }
      }
      if(this.blankCharacter === false) {
        // check if this is a blank character
        var blank = true;
        for(var y = 0; y < charHeight; y++) {
          for(var x = 0; x < charWidth; x++) {
            var pixel = tileSet.getPixel(characters[i], x, y);
            if(pixel > 0) {
              blank = false;
              y = charHeight;
              break;
            }
          }
        }
        if(blank == true) {
          this.blankCharacter = characters[i];
        }
      }
    }

  },

  setSrcCanvas: function(srcCanvas) {
    this.srcCanvas = srcCanvas;
  },

  setUseMultipleBGColors: function(useMultipleBGColors) {
    this.useMultipleBGColors = useMultipleBGColors;
  },

  setShaderCode: function(shaderCode) {
    this.shader = shaderCode;
  },

  startImport: function() {
//    this.importAtZ = this.editor.grid.getXYGridPosition();
  },

  
  setupRenderTarget: function(width, height) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(this.renderTarget && this.renderTargetWidth == width && this.renderTargetHeight == height) {
      // render target already set up
      return;
    }

    this.renderTargetWidth = width;
    this.renderTargetHeight = height;

    if(!this.renderTargetScene) {
      this.renderTargetScene = new THREE.Scene();
    }

    if(this.renderTargetQuad) {
      this.renderTargetScene.remove(this.renderTargetQuad);
    }

    this.renderTarget = new THREE.WebGLRenderTarget(this.renderTargetWidth, this.renderTargetHeight,
      { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat });

    this.renderTargetPixels = new Uint8Array(this.renderTargetWidth * this.renderTargetHeight * 4);

    var near = 0.5;
    var far = 1000;
    this.renderTargetCamera = new THREE.OrthographicCamera( -this.renderTargetWidth / 2, this.renderTargetWidth / 2, 
                                                            this.renderTargetHeight / 2, -this.renderTargetHeight / 2, near, far );
    this.renderTargetCamera.position.z = 400;

    var vertexShader;
    var fragmentShader;


    var code = this.shader;

    code = code.replace(/{charWidth}/g, tileSet.charWidth);
    code = code.replace(/{charHeight}/g, tileSet.charHeight);


    this.renderTargetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "inputImage": { type: "t", value: null },
        "inputImageWidth": { type: "f", value: null },
        "inputImageHeight": { type: "f", value: null },        
        "inputImageRows": { type: "f", value: null },
        "inputImageCols": { type: "f", value: null },        
        "outputImageWidth": { type: "f", value: null },
        "outputImageHeight": { type: "f", value: null },        
        "charImage": { type: "t", value: null },
        "colorImage": { type: "t", value: null },
//        "resolution": { type: "v2", value: new THREE.Vector2( this.renderTargetWidth, this.renderTargetHeight ) },
        "fgColor": { type: "v4", value: new THREE.Vector3(0, 0, 0, 1) },
        "bgColor": { type: "v4", value: new THREE.Vector4(0, 0, 0, 1) },
        "charCount": { type: "i", value: 32 }
      },
      vertexShader: this.vertexShader,
      fragmentShader: code
    });

    this.renderTargetQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(this.renderTargetWidth, this.renderTargetHeight),
      this.renderTargetMaterial
      );
    this.renderTargetQuad.position.z =0 ;
    this.renderTargetScene.add(this.renderTargetQuad);


    // output of the render
    
//    this.renderCanvas = document.getElementById('outputCanvas');
    this.renderCanvas = document.createElement('canvas');
    this.renderCanvas.width = this.renderTargetWidth;
    this.renderCanvas.height = this.renderTargetHeight;    
    this.renderContext = this.renderCanvas.getContext('2d');
    this.renderImageData = this.renderContext.getImageData(0, 0, this.renderCanvas.width, this.renderCanvas.height);     


  },


  // plot the character on the canvas input to the shader
  plotCharacter: function(x, y, character) {
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(tileSet.getType() == 'vector') {
      this.plotCharacterVector(x, y, character);
      return;
    }
    var tileData = tileSet.getData();

//    var charHeight = tileSet.charHeight;
//    var charWidth = tileSet.charWidth;

    var tileHeight = tileSet.getTileHeight();
    var tileWidth = tileSet.getTileWidth();

    for(var j = 0; j < tileHeight; j++) {
      for(var i = 0; i < tileWidth ; i++) {
        var srcPos = i + j * tileWidth;

        var dstPos = (x * tileWidth + i + (y * tileHeight + j) * this.charImageData.width) * 4;

        if(tileData[character][srcPos] > 0) {
          this.charImageData.data[dstPos] = 255; 
          this.charImageData.data[dstPos + 1] = 255;
          this.charImageData.data[dstPos + 2] = 255;
          this.charImageData.data[dstPos + 3] = 255;

        } else {
          this.charImageData.data[dstPos] = 0; 
          this.charImageData.data[dstPos + 1] = 0;
          this.charImageData.data[dstPos + 2] = 0;
          this.charImageData.data[dstPos + 3] = 255;
        }
      }
    }
  },

  plotCharacterVector: function(x, y, character) {
    
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileHeight = tileSet.getTileHeight();
    var tileWidth = tileSet.getTileWidth();


    if(this.vectorTileCanvas == null) {
      this.vectorTileCanvas = document.createElement('canvas');
    }

    if(this.vectorTileCanvas.width != tileWidth || this.vectorTileCanvas.height != tileHeight || this.vectorTileContext == null) {
      this.vectorTileCanvas.width = tileWidth;
      this.vectorTileCanvas.height = tileHeight;
      this.vectorTileContext = this.vectorTileCanvas.getContext('2d');
    }

    this.vectorTileContext.clearRect(0, 0, this.vectorTileCanvas.width, this.vectorTileCanvas.height);

    var path = tileSet.getGlyphPath(character);
    if(path !== null) {

      var fontScale = tileSet.getFontScale();
      var scale = tileWidth * fontScale;
      var ascent = tileSet.getFontAscent() ;

      var dstX = 0;
      var dstY = 0;
      this.vectorTileContext.setTransform(scale,0,0,-scale, dstX, dstY + ascent * scale);
      this.vectorTileContext.fillStyle = '#ffffff';
      this.vectorTileContext.fill(path);
      this.vectorTileContext.setTransform(1,0,0,1,0,0);
    }

    this.vectorTileImageData = this.vectorTileContext.getImageData(0, 0, this.vectorTileCanvas.width, this.vectorTileCanvas.height);


    for(var j = 0; j < tileHeight; j++) {
      for(var i = 0; i < tileWidth ; i++) {
        var srcPos = (i + j * tileWidth) * 4;

        var dstPos = (x * tileWidth + i + (y * tileHeight + j) * this.charImageData.width) * 4;

//        if(tileData[character][srcPos] > 0) {
        if(this.vectorTileImageData.data[srcPos] > 100) {
          this.charImageData.data[dstPos] = 255; 
          this.charImageData.data[dstPos + 1] = 255;
          this.charImageData.data[dstPos + 2] = 255;
          this.charImageData.data[dstPos + 3] = 255;
        } else {
          this.charImageData.data[dstPos] = 0; 
          this.charImageData.data[dstPos + 1] = 0;
          this.charImageData.data[dstPos + 2] = 0;
          this.charImageData.data[dstPos + 3] = 255;
        }
      }
    }

    this.vectorTileImageData = null;


  },


/*
  // get the image data in laba space
  // https://en.wikipedia.org/wiki/Lab_color_space
  imageDataToLABA: function() {
    this.imageDataLABA = [];

    var data = [];
    var color = {};
    for(var i = 0; i < this.imageData.data.length; i += 4) {
      data[0] = this.imageData.data[i];
      data[1] = this.imageData.data[i + 1];
      data[2] = this.imageData.data[i + 2];
      data[3] = this.imageData.data[i + 3];
      var labc = convert.rgb.lab(data);

      this.imageData.data[i] = labc[0] + 128;
      this.imageData.data[i+1] = labc[1] + 128;
      this.imageData.data[i+2] = labc[2] + 128;
    }
  },    
*/


  canvasToCharacters: function(canvas) {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    } 

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var maxColors = 32;
    var shaderColors = 16;

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();

    var shaderInputCols = 40;
    var shaderInputRows = 25;


    var colorsAcross = 16;
    var colorsDown = 16;


    // if !this.useMultipleBGColors then dont include the bgcolour
    if(!this.useMultipleBGColors && this.bgColors.length > 0) {
      for(var i = 0; i < this.colors.length; i++) {
        var removeIndex = false;
        if(this.colors[i] == this.bgColors[i]) {
          removeIndex = i;
          break;
        }
      }

      if(removeIndex !== false) {
        this.colors.splice(removeIndex, 1);
      }

    }

    var colorCount = this.colors.length;

    if(colorCount > 16) {
      shaderColors = 32;
      colorsAcross = 32;
      colorsDown = 32;

      shaderInputCols = 20;
    }


    this.importColorUtils = new ImportColorUtils();
    this.importColorUtils.init(this.editor);


    var cols = layer.getGridWidth();
    var rows = layer.getGridHeight();    

    this.result = [];
    for(var y = 0; y < rows; y++) {
      this.result[y] = [];
      for(var x = 0; x < cols; x++) {
        this.result[y][x] = { character: this.editor.tileSetManager.blankCharacter, color: 0, score: false };
      }
    }

    var rgbColors = [];
    for(var i = 0; i < colorPalette.getColorCount(); i++) {  
      rgbColors.push(colorPalette.getHex(i));
    }

    // use 512 as a test
    // if each pixel represents a character score, need widthxheightx256
    var renderTargetWidth = 128;  // 512x512 = 262,144, 128 * 128 = 16384, shader does 1000 cells with 16 colours each
    this.setupRenderTarget(renderTargetWidth, renderTargetWidth);


    // input canvas width is going to be 40 x char width + 25 * charHeight


    var shaderInputWidth =  shaderInputCols * charWidth;
    var importCanvasWidth = shaderInputWidth;
    var shaderInputHeight = shaderInputRows * charHeight;
    var importCanvasHeight = shaderInputHeight; 


    if(importCanvasWidth <= 512) {
      importCanvasWidth = 512;
    } else if(importCanvasWidth <= 1024) {
      importCanvasWidth = 1024;
    } else if(importCanvasWidth <= 2048) {
      importCanvasWidth = 2048;

    } else if(importCanvasWidth <= 4096) {
      importCanvasWidth = 4096;
    }

    if(importCanvasHeight <= 512) {
      importCanvasHeight = 512;
    } else if(importCanvasHeight <= 1024) {
      importCanvasHeight = 1024;
    } else if(width <= 2048) {
      importCanvasHeight = 2048;
    } else if(importCanvasHeight <= 4096) {
      importCanvasHeight = 4096;
    }




    // draw the source image onto the input texture
    if(!this.importCanvas) {
      this.importCanvas = document.createElement('canvas');
    }
    this.importContext = this.importCanvas.getContext('2d');

    this.importCanvas.width = importCanvasWidth;
    this.importCanvas.height = importCanvasHeight;


    this.inputTexture = new THREE.Texture(this.importCanvas);
    this.inputTexture.minFilter = THREE.NearestFilter;
    this.inputTexture.magFilter = THREE.NearestFilter;

    // find out the most used colours
    this.imageData = this.importContext.getImageData(0, 0, this.importCanvas.width, this.importCanvas.height);

    // not used??
//    this.imageColors = this.importColorUtils.findColors2(canvas, this.colors);
//    this.imageColors = this.importColorUtils.findColors(this.imageData, this.colors);


/*
    this.imageColors = [];
    for(var i = 0; i < this.colors.length; i++) {
      this.imageColors.push({ color: i});
    }
*/

    // create the canvas of colours.. and then the colour texture
    if(!this.colorCanvas) {
      this.colorCanvas = document.createElement('canvas');

      if(this.debug) {
        document.body.appendChild(this.colorCanvas);
        this.colorCanvas.style.position = 'absolute';
        this.colorCanvas.style.top = '10px';
        this.colorCanvas.style.left = '700px';
      }
    }


    this.colorCanvas.width = colorsAcross;
    this.colorCanvas.height = colorsDown;


    this.colorContext = this.colorCanvas.getContext('2d');
    this.colorContext.clearRect(0, 0, this.colorCanvas.width, this.colorCanvas.height);
    this.colorImageData = this.colorContext.getImageData(0, 0, this.colorCanvas.width, this.colorCanvas.height);


    for(var i = 0; i < colorCount; i++) {
      var colorIndex = this.colors[i];

      var color = colorPalette.getHex(colorIndex);
        //var color = this.colorsLABA[i];
      this.colorImageData.data[i * 4] = (color >> 16) & 0xff;
      this.colorImageData.data[i * 4 + 1] = (color >> 8) & 0xff;
      this.colorImageData.data[i * 4 + 2] = (color) & 0xff;
      this.colorImageData.data[i * 4 + 3] = 255;
    }
    this.colorContext.putImageData(this.colorImageData, 0, 0);

    this.colorTexture = new THREE.Texture(this.colorCanvas);
    this.colorTexture.minFilter = THREE.NearestFilter;
    this.colorTexture.magFilter = THREE.NearestFilter;
    this.colorTexture.needsUpdate = true;



    // create the canvas of characters.. and then the canvas texture
    if(!this.charCanvas) {
      this.charCanvas = document.createElement('canvas');

      if(this.debug) {
        document.body.appendChild(this.charCanvas);
        
        this.charCanvas.style.position = 'absolute';
        this.charCanvas.style.top = '10px';
        this.charCanvas.style.left = '805px';
      }

    }

    var charactersAcross = 16;
    var charactersDown = 16;

    // this canvas is 32x1 row of characters
    this.charCanvas.width = charWidth * charactersAcross;
    this.charCanvas.height = charHeight * charactersDown;

    this.charContext = this.charCanvas.getContext('2d');
    this.charImageData = this.charContext.getImageData(0, 0, this.charCanvas.width, this.charCanvas.height);

    // draw the characters into the image data..
    var charRows = Math.ceil(this.characters.length / charactersAcross);
    for(var charRow = 0; charRow < charRows; charRow++) {
      var charOffset = charRow * charactersAcross;

      // char count is the number of characters in the row..
      var charCount = charactersAcross;

      // gone over the number of characters??
      if(charOffset + charCount > this.characters.length) {
        charCount = this.characters.length - charOffset;
      }

      for(var c = 0; c < charCount; c++) {
        this.plotCharacter(c, charRow, this.characters[c + charOffset]);
      }

    }
    this.charContext.putImageData(this.charImageData, 0, 0);
    this.charTexture = new THREE.Texture(this.charCanvas);
    this.charTexture.minFilter = THREE.NearestFilter;
    this.charTexture.magFilter = THREE.NearestFilter;
    this.charTexture.needsUpdate = true;



    // setup uniforms for shader

    var code = this.shader;

    code = code.replace(/{charWidth}/g, tileSet.charWidth);
    code = code.replace(/{charHeight}/g, tileSet.charHeight);
    code = code.replace(/{shaderColors}/g, shaderColors);

    this.renderTargetMaterial.fragmentShader = code;



    this.renderTargetMaterial.uniforms.inputImage.value = this.inputTexture;
    this.renderTargetMaterial.uniforms.inputImageWidth.value = importCanvasWidth;
    this.renderTargetMaterial.uniforms.inputImageHeight.value = importCanvasHeight;

    this.renderTargetMaterial.uniforms.inputImageCols.value = shaderInputCols;
    this.renderTargetMaterial.uniforms.inputImageRows.value = shaderInputRows;

    this.renderTargetMaterial.uniforms.outputImageWidth.value = renderTargetWidth;
    this.renderTargetMaterial.uniforms.outputImageHeight.value = renderTargetWidth;


    this.renderTargetMaterial.uniforms.charImage.value = this.charTexture;//this.charTexture;
    this.renderTargetMaterial.uniforms.colorImage.value = this.colorTexture;
    this.renderTargetMaterial.uniforms.charCount.value = this.characters.length;



    var regionsAcross = Math.ceil(cols / shaderInputCols);
    var regionsDown = Math.ceil(rows / shaderInputRows);


    for(var regionX = 0; regionX < regionsAcross; regionX++) {
      for(var regionY = 0; regionY < regionsDown; regionY++) {

        var srcX = regionX * shaderInputWidth;
        var srcY = regionY * shaderInputHeight;
        var srcWidth = shaderInputWidth;
        var srcHeight = shaderInputHeight;

        this.importContext.clearRect(0, 0, srcWidth, srcHeight);

        this.importContext.drawImage(canvas, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);
        this.inputTexture.needsUpdate = true;


        //var bgColorCount = this.imageColors.length;
        //bgColorCount = 16;

        var bgColorCount = this.bgColors.length;

        for(var bgColor = -1; bgColor < bgColorCount; bgColor++) {

          var bgColorIdx = bgColor;
          if(bgColor >= 0 && bgColor < bgColorCount) {//>= 0) {
            var bgColorIdx =  this.bgColors[bgColor];//this.imageColors[bgColor].color;


            var bgRgbColor = rgbColors[bgColorIdx];
    //      var bgRgbColor = this.colorsLABA[bgColorIdx]; 


            this.renderTargetMaterial.uniforms.bgColor.value.set( ((bgRgbColor >> 16) & 0xff) / 255,
                                                            ((bgRgbColor >> 8) & 0xff) / 255,
                                                            ((bgRgbColor) & 0xff) / 255, 
                                                            1.0 );
          } else {
            // last bgcolor is transparent
            this.renderTargetMaterial.uniforms.bgColor.value.set(0.0, 0.0, 0.0, 0.0);
          }

          this.renderTargetMaterial.needsUpdate = true;

          // render...
//          UI.renderer.render( this.renderTargetScene, this.renderTargetCamera, this.renderTarget, true );
          UI.renderer.setRenderTarget(this.renderTarget);
          UI.renderer.render( this.renderTargetScene, this.renderTargetCamera);

          // read out the data..
          UI.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, this.renderTargetWidth, this.renderTargetHeight, this.renderTargetPixels);
          UI.renderer.setRenderTarget(null);


          // get the data out
          var outputData = this.renderTargetPixels;

          var cellOffsetX = shaderInputCols * regionX;
          var cellOffsetY = shaderInputRows * regionY;
          for(var i = 0; i < outputData.length; i += 4) {

            // number of rows in frame x num of cols in frame * num of colours

            if(i < shaderInputRows * shaderInputCols * 4 * shaderColors) {
              
              var resultIndex = i / 4;

              var colorPosition = Math.floor(resultIndex / shaderColors);
              var colorIndex = resultIndex % shaderColors;
              if(colorIndex < colorCount) {
                var fgColorIndex = this.colors[colorIndex];

                var col = (colorPosition) % shaderInputCols;
                var row = Math.floor( (colorPosition) / shaderInputCols);
                var frameRow = row  + cellOffsetY;
                var frameCol = col + cellOffsetX;
                if( (frameCol) < cols && (frameRow) < rows) {

                  var score = outputData[i + 1] + outputData[i + 2] * 256;

                  if(this.result[frameRow][frameCol].score === false || score < this.result[frameRow][frameCol].score) {

                    if(outputData[i] < this.characters.length) {
                      this.result[frameRow][frameCol].character = this.characters[outputData[i]];
                      this.result[frameRow][frameCol].color = fgColorIndex;
                      this.result[frameRow][frameCol].bgColor = bgColorIdx;
                      this.result[frameRow][frameCol].score = score;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return this.result;    

  },


  findBGColor: function() {

    // do one import to find the background color
    this.saveBGColors = [];

    // save the bg colours
    for(var i = 0; i < this.bgColors.length; i++) {
      this.saveBGColors.push(this.bgColors[i]);
    }

    // colors get removed by canvas to characters, so save them
    var saveColors = [];
    var maxColor = 0;
    // now set bgColors to all the colours
    this.bgColors = [];
    for(var i = 0; i < this.colors.length; i++) {
      if(this.colors[i] > maxColor) {
        maxColor = this.colors[i];
      }
      this.bgColors.push(this.colors[i]);        
      saveColors.push(this.colors[i]);
    }


    // convert using all the colours
    this.canvasToCharacters(this.srcCanvas);

    this.colors = [];
    for(var i = 0; i < saveColors.length; i++) {
      this.colors.push(saveColors[i]);
    }

    var colorScores = [];
    for(var i = 0; i <= maxColor; i++) {
      colorScores[i] = 0;
    }

    for(var y = 0; y < this.result.length; y++) {
      for(var x = 0; x < this.result[y].length; x++) {
        var t = this.result[y][x].character;
        var fc = this.result[y][x].color;
        var bc = this.result[y][x].bgColor;
        if(fc == bc || t === this.blockCharacter || t === this.blankCharacter) {  
          // tile colour doesn't get a score
        } else {
          colorScores[fc]++;
          if(bc != this.editor.colorPaletteManager.noColor) {
            colorScores[bc]++;
          }
        }
      }
    }


    var bestColor = 0;
    var bestScore = 0;
    for(var i = 0; i < colorScores.length; i++) {
      if(colorScores[i] > bestScore) {
        bestColor = i;
        bestScore = colorScores[i];
      }
    }

    // set the bg color
    this.bgColors = [];
    this.bgColors.push(bestColor);
  },


  convert: function() {
    if(!this.useMultipleBGColors && this.backgroundColorChoose == 'auto') {
      this.findBGColor();
    }
    this.canvasToCharacters(this.srcCanvas);
  },

  getResult: function() {
    return this.result;
  },

  updateFrame: function() {
    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }  


    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();


    if(!this.useMultipleBGColors) {

      if(this.backgroundColorChoose == 'auto') {
        if(this.bgColors.length > 0) {
          layer.setBackgroundColor(this.bgColors[0]);
          this.editor.updateBackgroundColorPicker();
        }
      }
    }

    var frameBgColor = layer.getBackgroundColor();


    var args = {};
//    args.z = this.importAtZ;
    args.update = false;

    for(args.y = 0; args.y < this.result.length; args.y++) {
      for(args.x = 0; args.x < this.result[args.y].length; args.x++) {


        args.t = this.result[args.y][args.x].character;
        args.fc = this.result[args.y][args.x].color;
        args.bc = this.result[args.y][args.x].bgColor;

        if(this.useMultipleBGColors) {

          if(args.fc == args.bc) {  
            if(this.blankCharacter !== false) {
              args.t = this.blankCharacter;
            }
          }

          // block tile  needs a background color
          if(args.bc == this.editor.colorPaletteManager.noColor && args.t === this.blockCharacter) {
            args.bc = this.bgColors[0];
          }

          layer.setCell(args);
        } else {
          if(args.fc === frameBgColor) {  
            if(this.blankCharacter !== false) {
              args.t = this.blankCharacter;
            }
          }
          args.bc = this.editor.colorPaletteManager.noColor;

          layer.setCell(args);
        }
      }
    }
    this.editor.graphic.redraw();
  }

}