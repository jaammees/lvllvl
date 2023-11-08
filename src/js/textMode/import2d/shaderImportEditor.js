var ImportShaderEditor = function() {
  this.uiComponent = null;
  this.importImage = null;

  this.sourceCanvas = null;
  this.sourceContext = null;

  this.outputCanvas = null;
  this.outputContext = null;

  this.scale = 1;

//  this.shader = "\n\nuniform sampler2D inputImage;\nuniform sampler2D charImage;\nuniform vec2 resolution;\nuniform vec3 fgColor;\nuniform vec3 bgColor;\nuniform int charCount;\nuniform float inputImageWidth;\nuniform float inputImageHeight;\n\n\nvarying vec2 vUv;\n\n\nvec3 RGB2Lab(vec3 rgb){\n    float R = rgb.x;\n    float G = rgb.y;\n    float B = rgb.z;\n    // threshold\n    float T = 0.008856;\n\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\n\n    // Normalize for D65 white point\n    X = X / 0.950456;\n    Y = Y;\n    Z = Z / 1.088754;\n\n    bool XT, YT, ZT;\n    XT = false; YT=false; ZT=false;\n    if(X > T) XT = true;\n    if(Y > T) YT = true;\n    if(Z > T) ZT = true;\n\n    float Y3 = pow(Y,1.0/3.0);\n    float fX, fY, fZ;\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\n\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\n    float a = 500.0 * ( fX - fY );\n    float b = 200.0 * ( fY - fZ );\n\n    return vec3(L,a,b);\n}\n\n\nvec2 findCharacter(float x, float y) {\n\n//  float inputImageWidth = 512.0;\n//  float inputImageHeight = 256.0;\n  int character = 0;\n  float bestScore = 0.00;\n  vec3 fgColorLAB = RGB2Lab(fgColor);\n  vec3 bgColorLAB = RGB2Lab(bgColor);\n\n  // loop through the top row\n  for(int i = 0; i < 32; i++) {\n    if(i < charCount) {\n      float score = 0.0;\n      // loop through xy of input image, compare to character\n      for(int cy = 0; cy < {charHeight}; cy++) {\n        for(int cx = 0; cx < {charWidth}; cx++) {\n          float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\n          float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\n          vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\n\n          float charX = (float(i) * {charWidth}.0 + float(cx)) / 255.0;\n          float charY = ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\n          vec4 charPixel = texture2D(charImage, vec2(charX, charY));\n\n          vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\n\n          if(charPixel.x > 0.3) {\n  //          score = score + abs(imagePixel.x - fgColor.x) + abs(imagePixel.y - fgColor.y) + abs(imagePixel.z - fgColor.z);\n            score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\n\n          } else {\n  //          score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y - bgColor.y) + abs(imagePixel.z - bgColor.z);\n\n            score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\n\n  /*\n            if(imagePixel.w == 0.0) {\n              score += 0.0;\n            } else {\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\n            }\n  */\n\n          }\n\n        }\n      }\n\n      if(i == 0) {\n        bestScore = score;\n        character = i;\n      }\n      if(score < bestScore) {\n        character = i;\n        bestScore = score;\n      }\n    }\n  }\n\n\n\n//character = int(y);\n  return vec2(float(character), bestScore);\n}\n\nvoid main() {\n//  vec4 texel = texture2D( inputImage, vUv / 1.0 );\n//  gl_FragColor = texel;\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, .0, 0.0, 1.0);\n\n  vec2 result =  findCharacter(floor(gl_FragCoord.x), floor(gl_FragCoord.y));\n  float character = result.x / 255.0;\n\n  float score = result.y / 256.0;\n  float scoreL = fract(score);\n  float scoreH = floor(score) / 256.0;\n\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\n\n//  gl_FragColor = vec4(character, score, 0.0, 1.0);\n\n\n\n\n}\n\n      \n      \n\n      ";

// this shader does all fg and bg colours in one
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      float score = 0.0; \r\n      // loop through xy of input image, compare to character\r\n      for(int cy = 0; cy < {charHeight}; cy++) {\r\n        for(int cx = 0; cx < {charWidth}; cx++) {\r\n          float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n          float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n          vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n\r\n          float charCol = mod(float(i), 16.0);\r\n          float charRow = floor(float(i) / 16.0);\r\n          float charImageHeight = 128.0;\r\n          float charImageWidth = 128.0; \r\n          \r\n          float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n          float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n//          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n          vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n\r\n          vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n\r\n          if(charPixel.x > 0.3) {\r\n  //          score = score + abs(imagePixel.x - 1.0) + abs(imagePixel.y - 1.0) + abs(imagePixel.z - 1.0);\r\n            score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n\r\n          } else {\r\n//            score = score + abs(imagePixel.x - 0.0) + abs(imagePixel.y - 0.0) + abs(imagePixel.z - 0.0);\r\n\r\n            score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n\r\n  /*\r\n            if(imagePixel.w == 0.0) {\r\n              score += 0.0;\r\n            } else {\r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n            }\r\n  */\r\n\r\n          }\r\n \r\n        }\r\n      }\r\n\r\n      if(i == 0.0) {\r\n        bestScore = score;\r\n        character = int(i);\r\n      }\r\n      if(score < bestScore) {\r\n        character = int(i);\r\n        bestScore = score;\r\n      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / 256.0);\r\n  float colorIndex = mod(resultPosition , 256.0);\r\n  \r\n  float fgColorIndex = mod(colorIndex, 16.0);\r\n  float bgColorIndex = floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / 16.0, \r\n          15.5 / 16.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / 16.0,\r\n          15.5 / 16.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";


  // this shader just does fg colour and passed in bg color
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      float score = 0.0; \r\n      // loop through xy of input image, compare to character\r\n      for(int cy = 0; cy < {charHeight}; cy++) {\r\n        for(int cx = 0; cx < {charWidth}; cx++) {\r\n          float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n          float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n          vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n\r\n          float charCol = mod(float(i), 16.0);\r\n          float charRow = floor(float(i) / 16.0);\r\n          float charImageHeight = 128.0;\r\n          float charImageWidth = 128.0; \r\n          \r\n          float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n          float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n//          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n          vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n\r\n          vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n\r\n          if(charPixel.x > 0.3) {\r\n  //          score = score + abs(imagePixel.x - 1.0) + abs(imagePixel.y - 1.0) + abs(imagePixel.z - 1.0);\r\n            score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n\r\n          } else {\r\n//            score = score + abs(imagePixel.x - 0.0) + abs(imagePixel.y - 0.0) + abs(imagePixel.z - 0.0);\r\n\r\n            score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n\r\n  /*\r\n            if(imagePixel.w == 0.0) {\r\n              score += 0.0;\r\n            } else {\r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n            }\r\n  */\r\n\r\n          }\r\n \r\n        }\r\n      }\r\n\r\n      if(i == 0.0) {\r\n        bestScore = score;\r\n        character = int(i);\r\n      }\r\n      if(score < bestScore) {\r\n        character = int(i);\r\n        bestScore = score;\r\n      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / 16.0);\r\n  float colorIndex = mod(resultPosition , 16.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / 16.0, \r\n          15.5 / 16.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / 16.0,\r\n          15.5 / 16.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / 16.0);\r\n  float colorIndex = mod(resultPosition , 16.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / 16.0, \r\n          15.5 / 16.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / 16.0,\r\n          15.5 / 16.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          15.5 / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          15.5 / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec3 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(bgColor);  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

  //this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab( vec3(bgColor.x, bgColor.y, bgColor.z) );  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n  \r\n              score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";

//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 13.0;\r\n                }\r\n              } else {  \r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
//this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score += 3.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";;

  //this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score = score + 13.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";
  this.shader = "\r\n\r\nuniform sampler2D inputImage;\r\nuniform sampler2D charImage;\r\nuniform sampler2D colorImage;\r\nuniform vec3 fgColor;\r\nuniform vec4 bgColor;\r\nuniform int charCount;\r\nuniform float inputImageWidth;\r\nuniform float inputImageHeight;\r\nuniform float inputImageCols;\r\nuniform float inputImageRows;\r\nuniform float outputImageWidth;\r\nuniform float outputImageHeight;\r\n\r\n\r\nvarying vec2 vUv;\r\n\r\n\r\nvec3 RGB2Lab(vec3 rgb){\r\n    float R = rgb.x;\r\n    float G = rgb.y;\r\n    float B = rgb.z;\r\n    // threshold\r\n    float T = 0.008856;\r\n\r\n    float X = R * 0.412453 + G * 0.357580 + B * 0.180423;\r\n    float Y = R * 0.212671 + G * 0.715160 + B * 0.072169;\r\n    float Z = R * 0.019334 + G * 0.119193 + B * 0.950227;\r\n\r\n    // Normalize for D65 white point\r\n    X = X / 0.950456;\r\n    Y = Y;\r\n    Z = Z / 1.088754;\r\n\r\n    bool XT, YT, ZT;\r\n    XT = false; YT=false; ZT=false;\r\n    if(X > T) XT = true;\r\n    if(Y > T) YT = true;\r\n    if(Z > T) ZT = true;\r\n\r\n    float Y3 = pow(Y,1.0/3.0);\r\n    float fX, fY, fZ;\r\n    if(XT){ fX = pow(X, 1.0/3.0);} else{ fX = 7.787 * X + 16.0/116.0; }\r\n    if(YT){ fY = Y3; } else{ fY = 7.787 * Y + 16.0/116.0 ; }\r\n    if(ZT){ fZ = pow(Z,1.0/3.0); } else{ fZ = 7.787 * Z + 16.0/116.0; }\r\n\r\n    float L; if(YT){ L = (116.0 * Y3) - 16.0; }else { L = 903.3 * Y; }\r\n    float a = 500.0 * ( fX - fY );\r\n    float b = 200.0 * ( fY - fZ );\r\n\r\n    return vec3(L,a,b);\r\n}\r\n\r\n\r\nvec2 findCharacter(float x, float y, vec4 fgColorVec4, vec4 bgColorVec4) {\r\n\r\n//  float inputImageWidth = 512.0;\r\n//  float inputImageHeight = 256.0; \r\n  int character = 0;\r\n  float bestScore = 0.00;\r\n\r\n//  vec3 fgColorLAB = RGB2Lab(vec3(1.0, 1.0, 1.0));\r\n  vec3 fgColorLAB = RGB2Lab( vec3(fgColorVec4.x, fgColorVec4.y, fgColorVec4.z));\r\n  //vec3 bgColorLAB = RGB2Lab(vec3(bgColorVec4.x, bgColorVec4.y, bgColorVec4.z)); \r\n  vec3 bgColorLAB = RGB2Lab(vec3(bgColor.x, bgColor.y, bgColor.z));  \r\n\r\n  // loop through the top row\r\n  for(float i = 0.0; i < 256.0; i++) {\r\n      if(int(i) < charCount) {\r\n        float score = 0.0; \r\n        // loop through xy of input image, compare to character\r\n        for(int cy = 0; cy < {charHeight}; cy++) {\r\n          for(int cx = 0; cx < {charWidth}; cx++) {\r\n            float imageX = (x * {charWidth}.0 + float(cx)) / inputImageWidth;\r\n            float imageY = (inputImageHeight - 1.0 - y * {charHeight}.0 - float(cy)) / inputImageHeight;\r\n            vec4 imagePixel = texture2D(inputImage, vec2(imageX, imageY) );\r\n  \r\n            float charCol = mod(float(i), 16.0);\r\n            float charRow = floor(float(i) / 16.0);\r\n            float charImageHeight = 128.0;\r\n            float charImageWidth = 128.0; \r\n            \r\n            float charX = (charCol * {charWidth}.0 + float(cx)) / charImageWidth;\r\n            float charY = (charImageHeight - charRow * {charHeight}.0 - 1.0  - float(cy)) / charImageHeight;\r\n  //          float charY =   ({charHeight}.0 - 1.0 - float(cy)) / ({charHeight}.0 - 1.0);\r\n            vec4 charPixel = texture2D(charImage, vec2(charX, charY));\r\n  \r\n            vec3 imagePixelLAB = RGB2Lab(vec3(imagePixel.x, imagePixel.y, imagePixel.z));\r\n  \r\n            if(charPixel.x > 0.3) {\r\n    //          score = score + abs(imagePixel.x - fgColorVec4.x) + abs(fgColorVec4.y - 1.0) + abs(fgColorVec4.z - 1.0);\r\n              if(imagePixel.w < 0.4) {\r\n                  // its transparent\r\n                  score += 3.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - fgColorLAB.x) + abs(imagePixelLAB.y - fgColorLAB.y) + abs(imagePixelLAB.z - fgColorLAB.z);\r\n              }\r\n  \r\n            } else {\r\n  //            score = score + abs(imagePixel.x - bgColor.x) + abs(imagePixel.y -bgColor.y) + abs(imagePixel.z -bgColor.z);\r\n\r\n              if(imagePixel.w < 0.3) {\r\n                // its transparent\r\n                if(bgColor.w == 0.0) {\r\n                  // good match..\r\n                  score += 0.0;\r\n                } else {\r\n                  score += 3.0;\r\n                }\r\n              } else {  \r\n                if(bgColor.w == 0.0) {\r\n                  score = score + 713.0;\r\n                } else {\r\n                  score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n                }\r\n              }\r\n  \r\n    /*\r\n              if(imagePixel.w == 0.0) {\r\n                score += 0.0;\r\n              } else {\r\n                score = score + abs(imagePixelLAB.x - bgColorLAB.x) + abs(imagePixelLAB.y - bgColorLAB.y) + abs(imagePixelLAB.z  - bgColorLAB.z);\r\n              }\r\n    */\r\n  \r\n            }\r\n   \r\n          }\r\n        }\r\n  \r\n  //      if(character < charCount) {\r\n          if(i == 0.0) {\r\n            bestScore = score;\r\n            character = int(i);\r\n          }\r\n          \r\n          \r\n          if(score < bestScore) {\r\n            character = int(i);\r\n            if(character < charCount) {\r\n              bestScore = score;\r\n            }\r\n          }\r\n    }\r\n//      }\r\n  }\r\n\r\n\r\n\r\n//character = int(y);\r\n  return vec2(float(character), bestScore);\r\n}\r\n\r\n\r\n// by default gl_FragCoord assumes lower left origin\r\n// and assumes pixel centers a located at half pixel centers\r\n// gl_FragCoord is in screen coordinates, not normalised \r\n\r\nvoid main() {\r\n\r\n  // gl_FragCoord.x goes 0.5, 1.5, 2.5, etc\r\n  float resultPosition =  floor(gl_FragCoord.x) + floor(gl_FragCoord.y)  * outputImageWidth;\r\n\r\n\r\n  // 16 colours\r\n  float colorPosition = floor(resultPosition / {shaderColors}.0);\r\n  float colorIndex = mod(resultPosition , {shaderColors}.0);\r\n  \r\n  float fgColorIndex = colorIndex;//mod(colorIndex, 16.0);\r\n  float bgColorIndex = 0.0;//floor(colorIndex / 16.0);\r\n  \r\n  vec4 fgColorVec4 = texture2D(colorImage, vec2(fgColorIndex / {shaderColors}.0, \r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n  vec4 bgColorVec4 = texture2D(colorImage, vec2(bgColorIndex / {shaderColors}.0,\r\n          ({shaderColors}.0 - 0.5) / {shaderColors}.0));\r\n          \r\n  float sourceCol = mod(colorPosition , inputImageCols);\r\n  float sourceRow = floor(colorPosition / inputImageCols);\r\n  \r\n  vec2 result = vec2(0,0);\r\n  \r\n  result =  findCharacter(sourceCol, sourceRow, fgColorVec4, bgColorVec4);\r\n  float character = result.x / 255.0;\r\n   \r\n \r\n  float score = result.y / 256.0;\r\n  float scoreL = fract(score); \r\n  float scoreH = floor(score) / 256.0;\r\n\r\n//  gl_FragColor = vec4(gl_FragCoord.x / 255.0, scoreL, scoreH, 1.0);\r\n\r\n//  gl_FragColor = vec4(inputImageCols / 255.0, 2.0, 3.0, 4.0);\r\n  gl_FragColor = vec4(character, scoreL, scoreH, 1.0);\r\n\r\n}\r\n\r\n      \r\n      \r\n\r\n      ";  
  this.shaderImport = null;

}


ImportShaderEditor.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.mode = 'ace/mode/assembly_6502';
    if(typeof mode != 'undefined') {
      this.mode = mode;
    }

  },

  show: function() {
    var _this = this;

    if(this.shaderImport == null) {
      this.shaderImport = new ShaderImport2();
      this.shaderImport.init(this.editor);

    }

    if(!this.uiComponent) {

      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "importShaderEditor", "title": "Edit Import Shader", "width": 940, "height": 620 });

      this.splitPanel = UI.create("UI.SplitPanel", { "id": "importShaderEditorSplitPanel" });
      this.uiComponent.add(this.splitPanel);

      this.sidePanel = UI.create("UI.SplitPanel");
      this.splitPanel.addEast(this.sidePanel, 380);

      var html = '';

      html += '<h3>Source</h3>';
      html += '<div class="formGroup">';
      html += '<label class="controlLabel" for="importShaderEditorSourceFile">File To Import:</label>';
      html += '<input class="formControl"  id="importShaderEditorSourceFile" type="file" accept="image/*"/>';
      html += '</div>';

      html += '<div>';
      html += '<canvas  width="320" height="200" id="importShaderEditorInputCanvas" style="border:1px solid white; background: transparent"></canvas>';
      html += '</div>';

      html += '<div style="margin: 6px">';
      html += '<button id="importShaderEditorRun">Run Import</button>';
      html += '&nbsp;&nbsp;';
      html += '<button id="importShaderExportJSON">Export JSON</button>';
      html += '</div>';
      this.inputPanel = UI.create("UI.HTMLPanel", { html: html });
      this.sidePanel.addNorth(this.inputPanel, 300);

      html = '';
      html += '<h3>Output</h3>';
      html += '<div>';
      html += '<canvas  width="320" height="200" id="importShaderEditorOutputCanvas" style="border:1px solid white; background: transparent"></canvas>';
      html += '</div>';

      html += '<div>';
      html += 'Display: ';
      html += '<label><input type="checkbox" id="importShaderEditorOutputCharacter" checked="checked">Character</label>';
      html += '<label><input type="checkbox" id="importShaderEditorOutputColor" checked="checked">FG Colour</label>';
      html += '<label><input type="checkbox" id="importShaderEditorOutputBGColor" checked="checked">BG Colour</label>';
      html += '<label><input type="checkbox" id="importShaderEditorOutputOriginalImage" checked="checked">Original Image</label>';
      html += '</div>';

      this.outputPanel = UI.create("UI.HTMLPanel", { html: html });
      this.sidePanel.add(this.outputPanel);


      this.codePanel = UI.create("UI.SplitPanel");
      this.splitPanel.add(this.codePanel);


      var html = '<button id="importShaderEditorRun">Run</button>';
      var html = '';
      this.buttonPanel = UI.create("UI.HTMLPanel", { html: html });

      this.codePanel.addSouth(this.buttonPanel, 30);;

      var html = '<div class="panelFill" style="background-color:#333333;">';
      html += '  <div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0" id="importShaderCodeEditor"></div>';
      html += '</div>';

      this.codeEditorPanel = UI.create("UI.HTMLPanel", { "html": html})
      //this.splitPanel.add(this.codeEditorPanel);
      this.codePanel.add(this.codeEditorPanel);

      this.codeEditorPanel.on('resize', function() {
        console.log('resize html panel!');
        if(_this.codeEditor && _this.codeEditor.resize) {
          _this.codeEditor.resize();
        }

      });



      this.closeButton = UI.create('UI.Button', { "text": "Close" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('resize', function() {
        _this.resize();
      });

      this.initContent();
    }

    UI.showDialog("importShaderEditor");
  },

  resize: function() {
    if(this.codeEditor && this.codeEditor.resize) {
      this.codeEditor.resize();
    }
  },


  initContent: function() {
    var _this = this;
    this.codeEditor = ace.edit("importShaderCodeEditor");

    this.codeEditor.getSession().setTabSize(2);
    this.codeEditor.getSession().setUseSoftTabs(true);
    this.codeEditor.on('focus', function() {
      UI.setAllowBrowserEditOperations(true);
    });

    this.codeEditor.on('blur', function() {
      UI.setAllowBrowserEditOperations(false);
    });

    var mode = 'ace/mode/assembly_6502';
    if(this.mode == 'javascript') {
      mode = 'ace/mode/javascript';
    }
    this.codeEditor.getSession().setMode(mode);//"ace/mode/assembly_6502");
    this.codeEditor.setShowInvisibles(true);
//    this.editor.setValue(C64ASM);
    this.codeEditor.gotoLine(1);


    this.sourceCanvas = document.getElementById('importShaderEditorInputCanvas');
    this.sourceContext = this.sourceCanvas.getContext('2d');


    this.outputCanvas = document.getElementById('importShaderEditorOutputCanvas');
    this.outputContext = this.outputCanvas.getContext('2d');

    this.importWidth = this.outputCanvas.width;
    this.importHeight = this.outputCanvas.height;

    document.getElementById('importShaderEditorSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('importShaderEditorSourceFile').files[0];
      _this.setImportImage(file);
    });

    $('#importShaderEditorRun').on('click', function() {
      _this.runImport();
    });

    $('#importShaderExportJSON').on('click', function() {
      _this.exportJSON();
    });

    $('#importShaderEditorOutputCharacter').on('click', function() {
      _this.drawResult();
    });

    $('#importShaderEditorOutputColor').on('click', function() {
      _this.drawResult();
    });

    $('#importShaderEditorOutputBGColor').on('click', function() {
      _this.drawResult();
    });

    $('#importShaderEditorOutputOriginalImage').on('click', function() {
      _this.drawResult();
    });

    this.codeEditor.setValue(this.shader, -1);                          
  },


  scaleImageToFit: function() {
    if(this.importImage == null) {
      return;
    }

    var drawWidth = this.importImage.naturalWidth;
    var drawHeight = this.importImage.naturalHeight;

    this.scale = 1;

    // scale to fit width first
    if(drawWidth > this.importWidth) {
      this.scale = this.importWidth / this.importImage.naturalWidth;
    }

    // scale to fit height
    if(drawHeight > this.importHeight) {
      this.scale = this.importHeight / this.importImage.naturalHeight;
    }


    if(drawWidth < this.importWidth && this.scale == 1) {
      this.scale = this.importWidth / this.importImage.naturalWidth;
    }

    if(drawHeight < this.importHeight && this.scale == 1) {
      this.scale = this.importHeight / this.importImage.naturalHeight;
    }

  },


  runImport: function() {
    console.log('run import');
    var startTime = getTimestamp();

    var colors = [];
    var bgColors = [];
    var characters = [];


    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var colorCount = colorPalette.getColorCount();
    //colorCount = 4;

    for(var i = 0; i < colorCount; i++) {
      colors.push(i);
      bgColors.push(i);
    }      


    for(var i =0 ; i < 256; i++) {
      characters.push(i);
    }


    var shaderCode = this.codeEditor.getValue();
//    console.log(shaderCode);

    this.shaderImport.setShaderCode(shaderCode);
    this.shaderImport.setColors(colors);
    this.shaderImport.setBGColors(bgColors);
    this.shaderImport.setCharacters(characters);
    this.shaderImport.setUseMultipleBGColors(true);//this.multipleBackgroundColors);
//    this.shaderImport.startImport();

    this.shaderImport.setSrcCanvas(this.sourceCanvas);

    // do the conversion
    this.shaderImport.convert();

    this.drawResult();

    var endTime = getTimestamp();
    var timeTaken = endTime - startTime;

    console.log('time taken = ' + timeTaken);

  },

  exportJSON: function() {
    var shaderCode = this.codeEditor.getValue();

    var js = JSON.stringify(shaderCode) + ';';
    console.log(js);


  },


  drawResult: function() {

    var drawCharacter = $('#importShaderEditorOutputCharacter').is(':checked');
    var drawColor = $('#importShaderEditorOutputColor').is(':checked');
    var drawBGColor = $('#importShaderEditorOutputBGColor').is(':checked');
    var drawOriginalImage = $('#importShaderEditorOutputOriginalImage').is(':checked');


    if(drawOriginalImage) {
      console.log('draw original image!');
      var width = this.importImage.naturalWidth * this.scale;
      var height = this.importImage.naturalHeight * this.scale;

      console.log('width = ' + width + ', height = ' + height + ', scale = ' + this.scale);

      this.outputContext.drawImage(this.importImage, 0, 0, width, height);
    }


    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var result = this.shaderImport.getResult();
//    console.log(result);

    var charHeight = tileSet.charHeight;
    var charWidth = tileSet.charWidth;

//    this.scale = 1;

    this.outputScale = 1;

    var imageData = this.outputContext.getImageData(0, 0, this.outputCanvas.width, this.outputCanvas.height);

    this.useMultipleBGColors = true;
    this.charactersHasSpace = true;

    for(var y = 0; y < result.length; y++) {
      for(var x = 0; x < result[0].length; x++) {


        var ch = result[y][x].character;
        var color = result[y][x].color;
        var bgColor = result[y][x].bgColor;

        if(this.useMultipleBGColors) {
          if(color == bgColor) {  
            if(this.charactersHasSpace) {
              ch = this.editor.tileSetManager.blankCharacter;
            }
          }
        } else {
          if(color === frameBgColor) {  
            if(this.charactersHasSpace) {
              //console.log('color = ' + color + ', bgcolor = ' + bgColor);
              ch = this.editor.tileSetManager.blankCharacter;
            }
          }
        }


        var args = {};
        args['scale'] = this.outputScale;
        args['imageData'] = imageData;


        if(drawCharacter) {
          args['character'] = ch;
        } else {
          args['character'] = -1;
        }

        if(drawColor) {
          args['color'] = color;

          if(drawBGColor) {
            if(bgColor !== false) {
              args['bgColor'] = bgColor;
            }
          } else {
            args['bgColorRGB'] = 0x333333;            
          }
        } else {

          if(drawBGColor && !drawCharacter) {
            if(bgColor !== false) {
              args['color'] = bgColor;
            } else {
              args['character'] = this.editor.tileSetManager.blankCharacter;
            }
          } else if(drawBGColor && drawCharacter) {
            args['colorRGB'] = 0xffffff;
            if(bgColor !== false) {
              args['bgColor'] = bgColor;
            }

          } else {

            args['colorRGB'] = 0xffffff;
            args['bgColorRGB'] = 0x333333;
          }
        }

  //      args['color'] = 2;
        args['x'] = x * (charWidth * this.outputScale);
        args['y'] = y * (charHeight * this.outputScale);
        tileSet.drawCharacter(args);
      }
    }
    this.outputContext.putImageData(imageData, 0, 0);

  },

  setImportImage: function(file) {
    if(!this.importImage) {
      this.importImage = new Image();
    }

    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    this.importImage.src = src;
    var _this = this;
    this.importImage.onload = function() {
      _this.updateImportImage();
    }
  },

  updateImportImage: function() {
    if(this.importImage == null) {
      return;
    }

    this.scaleImageToFit();

    var width = this.importImage.naturalWidth * this.scale;
    var height = this.importImage.naturalHeight * this.scale;

    this.sourceContext.drawImage(this.importImage, 0, 0, width, height);

  }
}
