/**

  Rainbow shader

  offset a rainbow gradient with rg channel

  like: https://www.shadertoy.com/view/lljfzm

  tDiffuse:   base texture
  flatten: amount to flatten into horiz stripes
  offset: color sample offset position

  based on: https://www.airtightinteractive.com/demos/smear/

  @author felixturner / http://airtight.cc/

 */

THREE.RainbowShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'amount': { type: 'f', value: 0.5},
    'offset': { type: 'f', value: 0.5},
    'time': { type: 'f', value: 0.5},


  },

  vertexShader: [

    'varying vec2 vUv;',
    'void main() {',

      'vUv = uv;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}'

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse;',
    'uniform float amount;',
    'uniform float offset;',
    'uniform float time;',

    'varying vec2 vUv;',

    'vec3 rainbow2( in float t ){',
      'vec3 d = vec3(0.0,0.33,0.67);',       
      'return 0.5 + 0.5*cos( 6.28318*(t+d) );',
    '}',


    'void main() {',

      'vec2 p = vUv;',
      'vec3 origCol = texture2D( tDiffuse, p ).rgb;',

      'vec2 off = texture2D( tDiffuse, p ).rg - 0.5;',
      'p += off * offset;',
      'vec3 rb = rainbow2( (p.x + p.y + time * 2.0) * 0.5);',

      'vec3 col = mix(origCol,rb,amount);',

      'gl_FragColor = vec4(col, 1.0);',

    '}'

  ].join('\n')

};
