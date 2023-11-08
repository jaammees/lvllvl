// https://www.gamasutra.com/blogs/KylePittman/20150420/241442/CRT_Simulation_in_Super_Win_the_Game.php


// Timothy Lottes  lotte crt shader
// https://github.com/libretro/glsl-shaders/tree/master/crt/shaders


// mattias gustavsson
//https://github.com/mattiasgustavsson/crtview


//implementation with pico 8
//https://gnomael.com/ranata/crt.html
// https://greggman.github.io/pico-8-post-processing/pico-8-post-processing.js


// hq4xShader 
//https://twitter.com/Gnomael/status/1387900598540963843
// https://github.com/CrossVR/hqx-shader

// pixel art scaling:
// https://en.wikipedia.org/wiki/Pixel-art_scaling_algorithms
// https://casual-effects.com/research/McGuire2021PixelArt/McGuire2021PixelArt.pdf
// https://news.ycombinator.com/item?id=26934973


// colodore
// https://www.colodore.com/


// s. NTSC video uses a non-square pixel that is taller than it is
// wide. It has a pixel aspect ratio of 1:0.906. PAL is just the opposite. Its pixels are wider than they
// are tall with a pixel aspect ratio of 1:1.06


// 1.035, 0.96 = 1.07
// ntsc 1.10


MattiasCRTShader = {

  uniforms: {

    "tDiffuse":   { value: null },
    //"time":       { value: 0.0 },
    "curve":       { value: 1.0 },
    "frame":      { value: 1.0 },
    "pixelRatio":  { value: 1.0 },
    "colorBleed":  { value: 0.25 },
    "ghosting":    { value: 1 },
    "scanlineAmount": { value: 0.9 },
    "verticalLineAmount": { value: 1.0 },
    "resolution": { value: new THREE.Vector2(900, 600) }
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  blurfragmentShader: [
    //"varying vec2 uv;",
//        "uniform vec2 blur;"
    "uniform sampler2D tDiffuse;",
    "uniform float curve;",
    "uniform float pixelRatio;",    
    "varying vec2 vUv;",

    "void main( void )",
        "    {",
        "    vec2 uv = vUv;",
        "    vec2 blur = vec2(2.0/960.0, 2.0/600.0);",

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

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float curve;",
    "uniform float frame;",
    "uniform float pixelRatio;",
    "uniform float ghosting;",
    "uniform float colorBleed;",
    "uniform float scanlineAmount;",
    "uniform float verticalLineAmount;",
    "uniform vec2 resolution;",

    "varying vec2 vUv;",

    "#define PI 3.14159265359",

    "vec4 blur(sampler2D samp, vec2 uv, float amount, vec2 resolution) ",
    "{",
    "    vec2 blurSrc = vec2(amount/resolution.x, amount/resolution.y);",

    "    vec4 sum = texture2D( samp, uv ) * 0.2270270270;",
    "    sum += texture2D(samp, vec2( uv.x - 4.0 * blurSrc.x, uv.y - 4.0 * blurSrc.y ) ) * 0.0162162162;",
    "    sum += texture2D(samp, vec2( uv.x - 3.0 * blurSrc.x, uv.y - 3.0 * blurSrc.y ) ) * 0.0540540541;",
    "    sum += texture2D(samp, vec2( uv.x - 2.0 * blurSrc.x, uv.y - 2.0 * blurSrc.y ) ) * 0.1216216216;",
    "    sum += texture2D(samp, vec2( uv.x - 1.0 * blurSrc.x, uv.y - 1.0 * blurSrc.y ) ) * 0.1945945946;",
    "    sum += texture2D(samp, vec2( uv.x + 1.0 * blurSrc.x, uv.y + 1.0 * blurSrc.y ) ) * 0.1945945946;",
    "    sum += texture2D(samp, vec2( uv.x + 2.0 * blurSrc.x, uv.y + 2.0 * blurSrc.y ) ) * 0.1216216216;",
    "    sum += texture2D(samp, vec2( uv.x + 3.0 * blurSrc.x, uv.y + 3.0 * blurSrc.y ) ) * 0.0540540541;",
    "    sum += texture2D(samp, vec2( uv.x + 4.0 * blurSrc.x, uv.y + 4.0 * blurSrc.y ) ) * 0.0162162162;",
    "    return sum;",
    "}",

    "vec3 bsample( sampler2D samp, vec2 tc, float offs, vec2 resolution )",
    "{",
    "    if(pixelRatio == 1.0) {",
    "      tc = tc * vec2(1.035, 0.96) + vec2(-0.0125*0.75, 0.02);",
    "	     tc = tc * 1.2 - 0.1;",
    "    }",
//    "    vec3 s = pow( abs( texture2D( samp, vec2( tc.x, 1.0-tc.y ) ).rgb), vec3( 2.2 ) );",
    "    vec3 s = pow( abs( blur( samp, vec2( tc.x, 1.0-tc.y ), 5.0, resolution ).rgb), vec3( 2.2 ) );",
    "    return s*vec3(1.25);",
    "}",


    "vec3 tsample( sampler2D samp, vec2 tc, float offs, vec2 resolution )",
    "{",
    "    if(pixelRatio == 1.0) {",
    "      tc = tc * vec2(1.035, 0.96) + vec2(-0.0125*0.75, 0.02);",
    "	     tc = tc * 1.2 - 0.1;",
    "    }",
        
    "    vec3 s = pow( abs( texture2D( samp, vec2( tc.x, 1.0-tc.y ) ).rgb), vec3( 2.2 ) );",
    "    return s*vec3(1.25);",
    "    }",




    "vec3 filmic( vec3 LinearColor )",
    "    {",
    "    vec3 x = max( vec3(0.0), LinearColor-vec3(0.004));",
    "    return (x*(6.2*x+0.5))/(x*(6.2*x+1.7)+0.06);",
    "    }",
      
    "vec2 docurve( vec2 uv )",
    "{",
    "    uv = (uv - 0.5) * 2.0;",
    "    uv *= 1.1;",
    "    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);",
    "    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);",
    "    uv  = (uv / 2.0) + 0.5;",
    "    uv =  uv *0.92 + 0.04;",
    "    return uv;",
    "}",
    /*
    "vec2 curve( vec2 uv )"
    "    {"
    "    uv = (uv - 0.5) * 2.0;"
    "    uv *= vec2( 1.049, 1.042);  "
    "    uv -= vec2( -0.008, 0.008 );"
    "    uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);"
    "    uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);"
    "    uv  = (uv / 2.0) + 0.5;"
    "    return uv;"
    "    }"
*/

    "float rand(vec2 co)",
    "    {",
    "    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "    }",

    "void main() {",
      "    float time = 1.0;",
      "    vec2 uv = vUv;",
      "    uv.y = 1.0 - uv.y;",
      "    vec2 resolution = vec2(960.0,600.0);",
      // curve
      "    vec2 curved_uv = uv; ",
      "    if(curve > 0.5) ",
      "      curved_uv = mix( docurve( uv ), uv, 0.8 );",


      //"    float scale = 0.04;",
      "    float scale = 0.13;",

      //"    float scale = 0.12;",
      "    if(pixelRatio == 0.0) {",
      "      scale = 0.0;",
      "    }",
// -0.014 left is bigger than right
// -0.012 left is smaller
// -0.0128 left is bigger by very small amount
      "    if(pixelRatio == 1.0) {",
      "    curved_uv = curved_uv + vec2(-0.0128, 0);",
      "    }",

      "    if(pixelRatio != 1.0) {",
      "    curved_uv = curved_uv + vec2(-0.003, 0);",
      "    }",

      "    vec2 scuv = curved_uv * (1.0 - scale) + scale / 2.0 + vec2(0.003, -0.001);",


       // "   Main color, Bleed \n"
       "    vec3 col;",
       "    float x =  sin(0.1*time+curved_uv.y*13.0)*sin(0.23*time+curved_uv.y*19.0)*sin(0.3+0.11*time+curved_uv.y*23.0)*0.0012;",
       "    float o =sin(gl_FragCoord.y*1.5)/resolution.x;",

              
       "    x += o*0.25;",
       "	  x *= 0.2;",

       // non pc doesn't have the 0.25
//       "    float colorBleed = 0.25; ",
       "    col.r = tsample(tDiffuse,vec2(x+scuv.x+0.0009*colorBleed,scuv.y+0.0009*colorBleed),resolution.y/800.0, resolution ).x+0.02;",
       "    col.g = tsample(tDiffuse,vec2(x+scuv.x+0.0000*colorBleed,scuv.y-0.0011*colorBleed),resolution.y/800.0, resolution ).y+0.02;",
       "    col.b = tsample(tDiffuse,vec2(x+scuv.x-0.0015*colorBleed,scuv.y+0.0000*colorBleed),resolution.y/800.0, resolution ).z+0.02;",
       "    float i = clamp(col.r*0.299 + col.g*0.587 + col.b*0.114, 0.0, 1.0 );",
       "    i = pow( 1.0 - pow(i,2.0), 1.0 );",
       "    i = (1.0-i) * 0.85 + 0.15;",



      // ghosting, needs blur buffer
      
       // ghs = 0.15 for non pc version and 0.85 instead of 0.45
       "    float ghs = 0.05 * ghosting;",//0.05;",
       "    float ghs2 = 0.45 * ghosting;",
       "    float ghs3 = 0.35 * ghosting;",
       "    vec3 r = bsample(tDiffuse, vec2(x-0.014*1.0, -0.027)*ghs2+0.007*vec2( 0.35*sin(1.0/7.0 + 15.0*curved_uv.y + 0.9*time),",
       "        0.35*sin( 2.0/7.0 + 10.0*curved_uv.y + 1.37*time) )+vec2(scuv.x+0.001,scuv.y+0.001),",
       "        5.5+1.3*sin( 3.0/9.0 + 31.0*curved_uv.x + 1.70*time),resolution).xyz*vec3(0.5,0.25,0.25);",
       "    vec3 g = bsample(tDiffuse, vec2(x-0.019*1.0, -0.020)*ghs2+0.007*vec2( 0.35*cos(1.0/9.0 + 15.0*curved_uv.y + 0.5*time),",
       "        0.35*sin( 2.0/9.0 + 10.0*curved_uv.y + 1.50*time) )+vec2(scuv.x+0.000,scuv.y-0.002),",
       "        5.4+1.3*sin( 3.0/3.0 + 71.0*curved_uv.x + 1.90*time),resolution).xyz*vec3(0.25,0.5,0.25);",
       "    vec3 b = bsample(tDiffuse, vec2(x-0.017*1.0, -0.003)*ghs3+0.007*vec2( 0.35*sin(2.0/3.0 + 15.0*curved_uv.y + 0.7*time),",
       "        0.35*cos( 2.0/3.0 + 10.0*curved_uv.y + 1.63*time) )+vec2(scuv.x-0.002,scuv.y+0.000),",
       "        5.3+1.3*sin( 3.0/7.0 + 91.0*curved_uv.x + 1.65*time),resolution).xyz*vec3(0.25,0.25,0.5);",       
       "    col += vec3(ghs*(1.0-0.299))*pow(clamp(vec3(3.0)*r,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);",
       "    col += vec3(ghs*(1.0-0.587))*pow(clamp(vec3(3.0)*g,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);",
       "    col += vec3(ghs*(1.0-0.114))*pow(clamp(vec3(3.0)*b,vec3(0.0),vec3(1.0)),vec3(2.0))*vec3(i);",
      
        // Level adjustment (curves)
        "    col *= vec3(0.95,1.05,0.95);",
        "    col = clamp(col*1.3 + 0.75*col*col + 1.25*col*col*col*col*col,vec3(0.0),vec3(10.0));",
    
        // Vignette
        "    float vig = (0.1 + 1.0*16.0*curved_uv.x*curved_uv.y*(1.0-curved_uv.x)*(1.0-curved_uv.y));",
        "    vig = 1.3*pow(vig,0.5);",
        "    col *= vig;",
        
        // Scanlines
        // non pc has 6.0 * time
        "    float scans = clamp( 0.35+0.18*sin(0.0*time+curved_uv.y*resolution.y*1.5), 0.0, 1.0);",
        //"    float s = pow(scans, sc);",
        "    float s = pow(scans, scanlineAmount);",
        "    col = col * vec3(s);",


        // Vertical lines (shadow mask)
        "    col*=1.0 - 0.23 * verticalLineAmount * (clamp((mod(gl_FragCoord.xy.x, 3.0))/2.0,0.0,1.0));",

        //  Tone map 
        "    col = filmic( col );",

        //  Noise 
        "    vec2 seed = curved_uv*resolution.xy;",
        "    col -= 0.015*pow(vec3(rand( seed +time ), rand( seed +time*2.0 ), rand( seed +time * 3.0 ) ), vec3(1.5) );",

        //  Flicker
        "    col *= (1.0-0.004*(sin(50.0*time+curved_uv.y*2.0)*0.5+0.5));",

        //  Clamp
        " if(frame == 1.0) {" ,
//        "    if (curved_uv.x < 0.025) ",// < 0.01
//        "        col *= max((curved_uv.x-0.015), 0.0) * 100.0;",
//        "    if(curved_uv.x > 0.950) ",
//        "        col *= max((1.0 - (curved_uv.x+.05)), 0.0) * 100.0;",

        "    if(pixelRatio == 1.0) { ",
        "    if (curved_uv.x < 0.028) ",// < 0.01
        "      col *= max((curved_uv.x-0.022), 0.0) * 100.0;",
        "    if(curved_uv.x > 0.947) ",
        "        col *= max((0.953 - curved_uv.x), 0.0) * 100.0;",
        "    if (curved_uv.y < 0.01) ",
        "        col *= curved_uv.y * 100.0;",
        "    if(curved_uv.y > 0.99)",
        "        col *= (1.0 - curved_uv.y) * 100.0;",
        "    }",

        
        "    if(pixelRatio != 1.0 ) { ",
        "    if (curved_uv.x < -0.0001) ",// < 0.01
        "      col *= max((curved_uv.x + 0.0059), 0.0) * 100.0;",
        "    if(curved_uv.x > 0.9955) ",
        "        col *= max((1.0015 - curved_uv.x), 0.0) * 100.0;",
        "    if (curved_uv.y < 0.01) ",
        "        col *= curved_uv.y * 100.0;",
        "    if(curved_uv.y > 0.99)",
        "        col *= (1.0 - curved_uv.y) * 100.0;",
        "    }",


        " }",
        /*
        "    if (curved_uv.x < 0.0 || curved_uv.x > 1.0)",
        "        col *= 0.0;",
        "    if (curved_uv.y < 0.0 || curved_uv.y > 1.0)",
        "        col *= 0.0;",
        */
       
/*
        // Frame texture
        "    vec2 fscale = vec2( -0.019, -0.018 );",
        "	   vec2 fuv=vec2( uv.x, 1.0 - uv.y)*((1.0)+2.0*fscale)-fscale-vec2(-0.0, 0.005);",
        "    vec4 f=texture2D(frametexture, fuv * vec2(0.91, 0.8) + vec2( 0.050, 0.093 ));",
        "    f.xyz = mix( f.xyz, vec3(0.5,0.5,0.5), 0.5 );",
        "    float fvig = clamp( -0.00+512.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y), 0.2, 0.85 );",
        "	   col *= fvig;",
        "    col = mix( col, mix( max( col, 0.0), pow( abs( f.xyz ), vec3( 1.4 ) ), f.w), vec3( use_frame) );",
*/
       "	gl_FragColor = vec4( col, 1.0 );",      
//       "	gl_FragColor = blur(tDiffuse, uv, 1.0, resolution);",      

//"	vec4 texel = texture2D( tDiffuse, vUv );",
//"	gl_FragColor = 1.0 * texel;",


    "}"

  ].join( "\n" )

};
