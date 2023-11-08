/**
 * @author felixturner / http://airtight.cc/
 * Radial sin /cos displacement
 *
 * Ported from http://uglyhack.appspot.com/videofx/
 */

THREE.WobbleShader = {

  uniforms: {

    'tDiffuse': { type: 't', value: null },
    'time':     { type: 'f', value: 0.0 },
    'strength':  { type: 'f', value: 0.001 },
    'size':  { type: 'f', value: 50.0 },
    'speed':  { type: 'f', value: 1.0 }

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
    'uniform float time;',
    
    'uniform float strength;',
        'uniform float size;',
        'uniform float speed;',

    'varying vec2 vUv;',

    'const float TWO_PI = 6.283185307179586;',

    'void main() {',

      'vec2 p = -1.0 + 2.0 * vUv;',
      'float pos = time * TWO_PI + length(p * size);',
      'gl_FragColor = texture2D(tDiffuse, vUv + strength * vec2(cos(pos), sin(pos)));',
    '}'

  ].join('\n')

};