// dynamic styling
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Using_dynamic_styling_information


var Icons = {};

Icons.get = function(type) {
  console.log('get icon for ' + type);
  switch(type) {
    case 'graphic':
      return 'icons/svg/glyphicons-basic-37-file.svg';
      break;
    case 'asm':
      return 'icons/svg/glyphicons-basic-37-file.svg';
      break;
    default:
      return 'icons/svg/glyphicons-basic-37-file.svg';
      break;
  }
}
var keys = {
  textMode: {
    play: { keyCode: 32, shift: false },

    toolsPencil: { key: 'N' },
    toolsErase: { key: 'L' },
    toolsBucket: { key: 'K' },
    toolsEyedropper: { key: 'I' },
    toolsPixel: { key: 'P' },
    toolsCharPixel: { key: 'O' },
    toolsMarquee: { key: 'M' },
    toolsShape: { key: 'U' },
    toolsZoom: { key: 'Z' },
    toolsType: { key: 'T' },
    toolsHand: { key: 'H' },
    toolsMove: { key: 'V' },
    toolsBlock: { key: 'B' },

    drawCharacter: { key: 'C' },
    drawFGColor: { key: 'F' },
    drawBGColor: { key: 'G' },


    cursorUp: { },


    // selection
    selectDrawWithSelection: { key: 'D' },
    selectFlipSelectionH: { key: 'F' },
    selectFlipSelectionV: { key: 'G' },
    selectFillSelection: { key: 'C' },

    drawCharacter: { key: false }, //'C' },
    drawFGColor: { key: false }, //'F' },
    drawBGColor: { key: false }, //'G' },

    drawTileFlipH: { key: 'F' },
    drawTileFlipV: { key: 'G' },

    lineSegmentHorizontal: { key: 'F' },
    lineSegmentVertical: { key: 'G' },


    c64MultiFG: { key: '2' },
    c64MultiBG: { key: '1' },
    c64MultiMC1: { key: '3' },
    c64MultiMC2: { key: '4' },

    tilePaletteLeft: { keyCode: 65, shift: false },       // a
    tilePaletteRight: { keyCode: 68, shift: false },      // d
    tilePaletteUp: { keyCode: 87, shift: false },         // w
    tilePaletteDown: { keyCode: 83, shift: false },       // s
    characterRecentNext: { keyCode: 69, shift: false },        // e
    characterRecentPrev: { keyCode: 81, shift: false },        // q
    characterRotate: { keyCode: 82, shift: false },            // r
    showTilePicker: { key: '/' },

    colorPaletteLeft: { keyCode: 65, shift: true },       // a
    colorPaletteRight: { keyCode: 68, shift: true },      // d
    colorPaletteUp: { keyCode: 87, shift: true },         // w
    colorPaletteDown: { keyCode: 83, shift: true },       // s
    colorPaletteRecentNext: { keyCode: 69, shift: true },
    colorPaletteRecentPrev: { keyCode: 81, shift: true },
    switchColors: { key: 'x' },
    showColorPicker: { key: '?' },

    framesNext: { key: '.' },
    framesPrev: { key: ',' }

//    tilePaletteCycle: 
  }
};

var styles = {
  text: {
    blockName: 'Meta Tile'
  },
  ui: {
    scrollbarWidth: 10,
    scrollbarHolder: '#111111',
    scrollbar: '#555555',
  },

  textMode: {
    tilePaletteFg: '#d0d0d0',
    tilePaletteBg: '#222222',

    gridView2dBackground: '#010101',

    gridView2dPixelGridLine: '#555555',
    gridView2dPixelGridLineWidth: 0.2,


    gridView2dGridLine: '#888888',
    gridView2dGridLineWidth: 0.3,

    gridView2dGridBlockLine: '#ffffff',
    gridView2dGridBlockLineWidth: 0.3,

    gridView2dSelectLineDark: '#444444',//#444444',
    gridView2dSelectLineLight: '#dddddd',//#dd0000'


    typingKeyboardKeyHighlight: '#aaaaaa',
    typingKeyboardLines: '#333333',//#444444',
    typingKeyboardBackground: '#eeeeee',

    currentTileBackground: '#222222',

    tileEditorGridBg: '#000000',
    tileEditorGridFg: '#ffffff',
    tileEditorGridLines: '#aaaaaa', //'#444444',
    tileEditorGridBorder: '#c9c9c9',


    popupTextColor: '#eeeeee'
//    popupBackground: '#111111'
  },

  tilePalette: {
    selectOutline: '#1ea0ff',
    highlightOutline: '#888888'
  },

  colorPalette: {
    highlightOutline: '#ff0000'
  },

  music: {
    selectFill:    '#7777ff',
    selectOutline: '#bbbbff',

    rulerBackground: '#222222',
    rulerLines: '#666666',
    rulerBarLines: '#aaaaaa',

    oscilloscopeBackground: '#111111',
    oscilloscopeLines: '#eeeeee',

    effectsBackground: '#555555',
    effectsText: '#333333',
    effectsFill: '#aaaaaa',
    effectsOutline: '#333333',
    effectsCursor: '#0000ff',
    effectsCursorOutline: '#00ff00',

    cursorOutline: '#0000ff',

    pianoRollBlackKey: '#000000',
    pianoRollWhiteKey: '#ffffff',
    pianoRollKeyOutline: '#222222',
    pianoRollHighlightedNote: '#aaaaff',
    pianoRollSelectedNote: '#7777aa',

    noteOutline: '#cccccc',
    ghostNoteOutline: '#dddddd',
    selectedNoteOutline: '#aaaaff',


    gridBackground: '#333333',
    gridBlackNotes: '#1b1b1b',
    gridWhiteNotes: '#333333',
    gridLines: '#444444',
    gridOctaveLines: '#595959',
    gridBarLines: '#9a9a9a',
    gridBeatLines: '#666666'

  }
}