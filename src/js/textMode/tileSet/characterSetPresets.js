
var CharacterSetPresets = [
  {
    category: "8x8",
    characterSets: [
      { "name": "Amiga", "id": "b-strict", width: 8, height: 8,
        "options": [
          { "name": "B Strict", "id": "b-strict"},
          { "name": "B Struct", "id": "b-struct" }
        ]
       },

      { "name": "Amstrad CPC", "id": "amstradcpc_english", width: 8, height: 8 },

      { "name": "Atari ST", "id": "atarist_8x8", width: 8, height: 8 },
      { "name": "ATASCII", "id": "atascii", width: 8, height: 8 },
      { "name": "BBC Micro", "id": "bbcmicrob", width: 8, height: 8,
        "options": [
          { "name": "BBC Micro Model B", "id": "bbcmicrob"},
          { "name": "BBC Micro Master 128", "id": "bbcmaster" }
        ]
       },
      { "name": "Coleco", "id": "coleco", width: 8, height: 8 },

      { "name": "Commodore 128", "id": "c128", width: 8, height: 8, type: "petscii",
        "options": [
          { "name": "C128", "id": "c128" },
          { "name": "C128 Shifted", "id": "c128_shifted" },
        ]
      },
      { "name": "Commodore 16", "id": "c16", width: 8, height: 8, type: "petscii" },
      { "name": "Commodore 64", "id": "petscii", width: 8, height: 8, type: "petscii",
        "options": [
          { "name": "C64", "id": "petscii" },
          { "name": "C64 Shifted", "id": "petscii_shifted" },          
          { "name": "C64 Swedish", "id": "c64_swedish" },          
          { "name": "C64 Swedish Shifted", "id": "c64_swedish_shifted" },
          { "name": "C64 Japanese", "id": "c64_japanese" },
          { "name": "C64 Japanese Shifted", "id": "c64_shifted_japanese" },
        ]
      },
      /*
      { "name": "C64 PETSCII Shifted", "id": "petscii_shifted", width: 8, height: 8, type: "petscii" },
      */
      { "name": "Commodore PET", "id": "pet2001_english", width: 8, height: 8, type: "petscii",
        "options": [
          { "name": "PET English", "id": "pet2001_english" },
          { "name": "PET Japanese", "id": "pet_japanese" }
        ]
      },
      { "name": "Compukit UK101", "id": "compukituk101", width: 8, height: 8 },


      { "name": "8px.", "id": "8px", width: 8, height: 8, "type": "custom", "author": "VectorPixelStar", "authorlink": ' (<a target="_blank" href="https://vectorpixelstar.itch.io/8px">https://vectorpixelstar.itch.io/8px</a>)', "licence": 'CC BY 4.0  <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>', 'notes': 'Tiles have been reordered, some tiles removed' },
      { "name": "Gloop", "id": "gloop", width: 8, height: 8, "type": "custom", "author": "Polyducks", "authorlink": ' (<a target="_blank" href="https://twitter.com/polyducks">https://twitter.com/polyducks</a>)'  },
      { "name": "Rook", "id": "rook_8x8", width: 8, height: 8, "type": "custom", "author": "Quintin Stokes", "authorlink": ' (<a target="_blank" href="https://twitter.com/qujast">https://twitter.com/qujast</a>)' },

      /*
      { "name": "Custom", "id": "gloop", width: 8, height: 8,
        "options": [
          //{ "name": "Capsule", "id": "capsule", "author": "Toothygator" },
          { "name": "Gloop", "id": "gloop", "author": "Polyducks", "authorlink": ' (<a target="_blank" href="https://twitter.com/polyducks">https://twitter.com/polyducks)</a>' },
          { "name": "Rook", "id": "rook_8x8", "author": "Quintin Stokes", "authorlink": ' (<a target="_blank" href="https://twitter.com/qujast">https://twitter.com/qujast)</a>' }
        ]
      },
      */

      { "name": "IBM CGA", "id": "ibm_cga", width: 8, height: 8,
        "options": [
          { "name": "Normal", "id": "ibm_cga" },
          { "name": "Thin", "id": "ibm_cga_thin" }
        ]
      },
      { "name": "Intellivision", "id": "intellivision", width: 8, height: 8 },
      { "name": "Magnavox Odyssey 2/Philips Videopac", "id": "magnavox", width: 8, height: 8},
      { "name": "Mantavision", "id": "diet_petscii", "author": "DataDoor", "authorlink":  ' (<a target="_blank" href="https://twitter.com/datad00r">https://twitter.com/datad00r</a>)', width: 8, height: 8, "type": "custom",
        "options": [
          { "name": "Diet PETSCII", "id": "diet_petscii" },
          { "name": "Circlex", "id": "circlex" },
          { "name": "Filament", "id": "filament" },
          { "name": "Retrotech Romance", "id": "retrotech_romance" }
        ]

      },      
      { "name": "Mattel Aquarius", "id": "aquarius", width: 8, height: 8 },
      /*
      { "name": "IBM CGA Thin", "id": "ibm_cga_thin", width: 8, height: 8 },
      */
      { "name": "MSX", "id": "msx_international", width: 8, height: 8, 
        "options": [
          { "name": "International", "id": "msx_international" },
          { "name": "Japanese", "id": "msx_japanese" },
          { "name": "Korean", "id": "msx_korean" },
          { "name": "Russian", "id": "msx_russian" }
        ]
      },

      { "name": "Robotron", "id": "robotronz9001", width: 8, height: 8,
        "options": [
          { "name": "Robotron Z 9001", "id": "robotronz9001" },
          { "name": "Robotron Z 9001 CGA", "id": "robotronz9001cga" },
          { "name": "Robotron Z 9001 CGA International", "id": "robotronz9001cgai" },
          { "name": "CAOS 33 - 1", "id": "kc85_caos33-1" },
          { "name": "CAOS 33 - 2", "id": "kc85_caos33-2" },
          { "name": "CAOS 45 - 1", "id": "kc85_caos45-1" },
          { "name": "CAOS 45 - 2", "id": "kc85_caos45-2" }
        ]
      },

      { "name": "SC-3000", "id": "sc_3000_export", width: 8, height: 8,
        "options": [
          { "name": "Export", "id": "sc_3000_export" },
          { "name": "Japanese", "id": "sc_3000_japanese" },
          { "name": "Home Basic", "id": "sc_3000_basic"}
        ]
      },

      { "name": "Sharp MZ 700", "id": "sharpmz700_1", width: 8, height: 8, 
        "options": [
          { "name": "First 256", "id": "sharpmz700_1" },
          { "name": "Second 256", "id": "sharpmz700_2" },
          { "name": "First 256 Japanese", "id": "sharpmz700_japanese_1"},
          { "name": "Second 256 Japanese", "id": "sharpmz700_japanese_2"},
          { "name": "Japanese Full Set (512 chars)", "id": "sharpmz700_japanese_full"}
        ]
      },
      { "name": "Sharp MZ 80", "id": "sharpmz80a", width: 8, height: 8,
        "options": [
          { "name": "MZ 80A English", "id": "sharpmz80a" },
          { "name": "MZ 80 Japanese", "id": "sharpmz80_japanese" },
        ]

      },
      { "name": "Tatung Einstein", "id": "einstein", width: 8, height: 8 },      

      /*
      { "name": "Sharp MZ 700 (second 256)", "id": "sharpmz700_2", width: 8, height: 8 },
      */

      { "name": "VIC 20", "id": "vic20", width: 8, height: 8,
        "options": [
          { "name": "VIC 20", "id": "vic20" },
          { "name": "VIC 20 Shifted", "id": "vic20_shifted" },
          { "name": "VIC 20 Japanese", "id": "vic20_japanese" },
          { "name": "VIC 20 Japanese Shifted", "id": "vic20_japanese_shifted" }
        ] 
      },
      { "name": "ZX Spectrum", "id": "zx_spectrum", width: 8, height: 8 },

    ]
  },
  {
    category: "7x8",
    characterSets: [
      { "name": "Apple IIc", "id": "appleIIc", width: 7, height: 8 },
    ]
  },
  {
    category: "8x14",
    characterSets: [
      { "name": "IBM EGA", "id": "ibm_ega", width: 8, height: 14 }
    ]
  },
  {
    category: "8x16",
    characterSets: [
      { "name": "Amiga", "id": "potnoodle", width: 8, height: 16,
        "options": [
          { "name": "P0T-NOoDLE", "id": "potnoodle" },
          { "name": "mOsOul", "id": "mosoul" },
          { "name": "Micro Knight", "id": "microknight" },
          { "name": "Micro Knight Plus", "id": "microknightplus" },
          { "name": "Topaz", "id": "topaz" },
          { "name": "Topaz Plus", "id": "topazplus" },
          { "name": "Topaz 500", "id": "topaz500" },
          { "name": "Topaz 500 Plus", "id": "topaz500plus" }

        ]
      },
      { "name": "Atari ST", "id": "atarist_8x16", width: 8, height: 16 },
      { "name": "IBM VGA", "id": "ibm_vga", width: 8, height: 16 }
    ]
  },
  {
    category: "16x16",
    characterSets: [
      { "name": "Kenny 1 Bit Pack", "id": "kenny1bit", width: 16, height: 16, author: "Kenny", authorlink: ' (<a href="https://www.kenney.nl/assets/bit-pack" target="_blank">https://www.kenney.nl/assets/bit-pack</a>)', type: "custom" },
      { "name": "Patterns and Tiles", 
        "id": "patterns-and-tiles", 
        width: 16, height: 16, 
        author: "VectorPixelStar", 
        authorlink: ' (<a href="https://vectorpixelstar.itch.io/1-bit-patterns-and-tiles" target="_blank">https://vectorpixelstar.itch.io/1-bit-patterns-and-tiles</a>)', 
        "licence": 'CC BY 4.0  <a href="https://creativecommons.org/licenses/by/4.0/">https://creativecommons.org/licenses/by/4.0/</a>',         
        type: "custom" 
      }
    ]
  },
  {
    category: "12x20",
    characterSets: [
      { "name": "Teletext", "id": "teletext_12x20", width: 12, height: 20 }
    ]
  }
  
  /*
  ,{
    category: "128x128",
    characterSets: [
      { "name": "Kreative Square", "id": "ksquare", width: 128, height: 128 },
      { "name": "PETSCII Smooth", "id": "petsciilarge", width: 128, height: 128 }
    ]
  }
  */
  
];
