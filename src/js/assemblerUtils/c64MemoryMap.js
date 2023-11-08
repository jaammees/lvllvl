var C64IORegisters = [
  {
    address: '0000',
    label: '6510 Data Direction Register',    
    chip: '6510',
    bits: [
      { "l": "0-7", "d": "0=Bit in processor port can only be read (input),1=Bit in processor port can be read and written (output)" }
    ],
    description: "This register determines which of the lines on the 6510 I/O port ($0001) are inputs and which are outputs. The default value is xx101111"
  },
  {
    address: '0001',
    label: '6510 I/O Port',    
    chip: '6510',
    bits: [
      { "l": "0", "d": "LORAM 0=Switch BASIC ROM Out" },
      { "l": "1", "d": "HIRAM 0=Switch Kernal ROM Out"},
      { "l": "2", "d": "CHARREN 0=Switch Char ROM In"},
      { "l": "3", "d": "Cassette Data Output Link"},
      { "l": "4", "d": "Cassette Switch Sense, 1=Switch Closed"},
      { "l": "5", "d": "Cassette Motor Control, 0=ON, 1=OFF"},
      { "l": "6-7", "d": "Undefined"}
    ],

    // https://codebase64.org/doku.php?id=base:memory_management
    description: "Default value $37 %xx110111: BASIC ROM visible at $A000-$BFFF,  I/O area visible at $D000-$DFFF, KERNAL ROM visible at $E000-$FFFF.\nThe direction of flow of data for each bit is determined by the corresponding bit of the 6510 Data Direction Register ($0000). Note: If KERNAL isn't mapped in, then BASIC won't map in either. If HIRAM and LORAM are both set to 0, CHARREN is ignored",
    examples: [
      {
        "description": "Setup RAM at $A000-$BFFF and $E000-$FFFF, I/O at $D000-DFFF",
        "code": "  lda #%00110101 ; hex #$35\n  sta $01 "      
      }
    ],
    keywords: "ram kernal basic cassette"
  },

  {
    address: 'd000',
    label: 'Sprite 0 X Coordinate (bits 0-7)',    
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 0. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",
    examples: [
      {
        "description": "Set sprite 0's x position to 259",
        "code": "; set bits 0-7 of x position\nlda #03\nsta $d000\n; set the msb of x position\nlda $d010\nora #%00000001\nsta $d010"
      }
    ]

  },
  {
    address: 'd001',
    label: 'Sprite 0 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 0 (0-255). Only positions 50 - 249 are visible."
  },
  {
    address: 'd002',
    label: 'Sprite 1 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 1. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd003',
    label: 'Sprite 1 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 1 (0-255). Only positions 50 - 249 are visible."
    
  },
  {
    address: 'd004',
    label: 'Sprite 2 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 2. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd005',
    label: 'Sprite 2 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 2 (0-255). Only positions 50 - 249 are visible."
  },
  {
    address: 'd006',
    label: 'Sprite 3 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 3. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd007',
    label: 'Sprite 3 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 3 (0-255). Only positions 50 - 249 are visible."


  },
  {
    address: 'd008',
    label: 'Sprite 4 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 4. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd009',
    label: 'Sprite 4 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 4 (0-255). Only positions 50 - 249 are visible."

  },
  {
    address: 'd00a',
    label: 'Sprite 5 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 5. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd00b',
    label: 'Sprite 5 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 5 (0-255). Only positions 50 - 249 are visible."

  },
  {
    address: 'd00c',
    label: 'Sprite 6 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 6. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd00d',
    label: 'Sprite 6 Y Coordinate',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 6 (0-255). Only positions 50 - 249 are visible."

  },
  {
    address: 'd00e',
    label: 'Sprite 7 X Coordinate',
    chip: 'VIC-II',
    description: "This register controls the X position of sprite 7. The x position of a sprite is a 9 bit number (0 - 512) with the most significant bit held in ($d010). Only positions 23 to 347 are visible on the screen.",

  },
  {
    address: 'd00f',
    label: 'Sprite 7 Y Coordinate ',
    chip: 'VIC-II',
    description: "This register controls the Y position of sprite 7 (0-255). Only positions 50 - 249 are visible."

  },
  {
    address: 'd010',
    label: 'MSBs of X coordinates',
    chip: 'VIC-II',
    bits: [
      { "l": "0-7", "d": "MSB of sprites 0-7" },
    ],
    description: "The most significant bit of the 9 bit value for a sprite's x position. When a bit is set to 1, the corresponding srpite will be displayed in x positions 256 to 511",
    keywords: "sprite msb"
  },
  {
    address: 'd011',
    label: 'VIC Control Register 1',
    chip: 'VIC-II',
    bits: [
      { "l": "0-2", "d": "Vertical raster scroll" },
      { "l": "3", "d": "Screen height (rows). 0 = 24, 1 = 25"},
      { "l": "4", "d": "0 = Screen Off, 1 = Screen On"},
      { "l": "5", "d": "0 = Text Mode, 1 = Bitmap Mode"},
      { "l": "6", "d": "1 = Extended background mode"},
      { "l": "7", "d": "Bit 8 of current raster line"}
    ],
    examples: [
      {
        "description": "Turn on Extended Background Colour Mode",
        "code": "; turn on ecm mode\nlda $d011\nora #%01000000\nsta $d011"      
      }
    ],
    keywords: "vertical scroll text bitmap extended background raster"
  },
  {
    address: 'd012',
    label: 'Raster Read/Write Register',
    chip: 'VIC-II',
    description: "Bits 0-7 of the 9-bit value for the raster position. The MSB is stored in ($d011). Reading this register returns the current raster scan position. Writing to this register sets the raster line where to generate an interrupt",
    examples: [
      {
        "description": "Generate an interrupt at ",
        "code": "  sei           ; disable maskable IRQs" + 
                "  lda #$01   ; this is how to tell the VICII to generate a raster interrupt\n" +
                "  sta $d01a  ; interrupt control register\n" +      
                "  lda #$f0   ; this is how to tell at which rasterline we want the irq to be triggered\n" +
                "  sta $d012\n" +
      
                "  lda $d011  ; as there are more than 256 rasterlines, the topmost bit of $d011 serves as" +
                "  and #$7f   ; the 8th bit for the rasterline we want our irq to be triggered.\n" +
                "  sta $d011  ; clear it\n" +
                "; set up the address of the interrupt routine" +
                "  lda #<irq\n" +
                "  sta $fffe\n" +
                "  lda #>irq\n" +
                "  sta $ffff\n" +                            
                "  cli        ; enable maskable interrupts again\n" +
                "; loop forever..\n" +
                "loop\n" +
                "  jmp loop\n" +

                "; raster interrupt routine  \n" +
                "irq\n" +
                "  pha        ;store register A in stack" +
                "  txa\n" +
                "  pha        ;store register X in stack\n" +
                "  tya\n" +
                "  pha        ;store register Y in stack\n" +                
                "  lda #$ff   ;this is the orthodox and safe way of clearing the interrupt condition of the VICII.\n" +
                "  sta $d019  ;if you don't do this the interrupt condition will be present all the time and you end\n" +
                "             ;up having the CPU running the interrupt code all the time, as when it exists the\n" +
                "             ;interrupt, the interrupt request from the VICII will be there again regardless of the\n" +
                "             ;rasterline counter.\n" +                
                "             ;it's pretty safe to use inc $d019 (or any other rmw instruction) for brevity, they\n" +
                "             ;will only fail on hardware like c65 or supercpu. c64dtv is ok with this though.         "     
      }

    ],
    keywords: "interrupt raster"

  },
  {
    address: 'd013',
    label: 'Light pen X',
    chip: 'VIC-II',
  },
  {
    address: 'd014',
    label: 'Light pen Y',
    chip: 'VIC-II',
  },
  {
    address: 'd015',
    label: 'Sprite enabled',
    chip: 'VIC-II',
  },
  {
    address: 'd016',
    label: 'VIC Control register 2',
    chip: 'VIC-II',

    bits: [
      { "l": "0-2", "d": "Horizontal scroll" },
      { "l": "3", "d": "Screen width (columns). 0 = 38, 1 = 40"},
      { "l": "4", "d": "0 = Multicolour Off, 1 = Multicolor On"},
      { "l": "5", "d": "Always set to 0"},
      { "l": "6-7", "d": "Unused"},
      
    ],    
    keywords: "multicolour multicolor horizontal scroll text bitmap extended background raster"

  },
  {
    address: 'd017',
    label: 'Sprite Y expansion',
    chip: 'VIC-II',
  },
  {
    address: 'd018',
    label: 'VIC Memory setup',
    chip: 'VIC-II',
    description: 'Setup of pointers relative to the VIC bank (set in $dd00)Bits #1-#3: In text mode, pointer to character memory (bits #11-#13), relative to VIC bank, memory address $DD00. Values:'
    + '%000, 0: $0000-$07FF, 0-2047.%001, 1: $0800-$0FFF, 2048-4095.%010, 2: $1000-$17FF, 4096-6143.%011, 3: $1800-$1FFF, 6144-8191.%100, 4: $2000-$27FF, 8192-10239.%101, 5: $2800-$2FFF, 10240-12287.%110, 6: $3000-$37FF, 12288-14335.%111, 7: $3800-$3FFF, 14336-16383.Values %010 and %011 in VIC bank #0 and #2 select Character ROM instead.In bitmap mode, pointer to bitmap memory (bit #13), relative to VIC bank, memory address $DD00. Values:%0xx, 0: $0000-$1FFF, 0-8191.%1xx, 4: $2000-$3FFF, 8192-16383.Bits #4-#7: Pointer to screen memory (bits #10-#13), relative to VIC bank, memory address $DD00. Values:%0000, 0: $0000-$03FF, 0-1023.%0001, 1: $0400-$07FF, 1024-2047.%0010, 2: $0800-$0BFF, 2048-3071.%0011, 3: $0C00-$0FFF, 3072-4095.%0100, 4: $1000-$13FF, 4096-5119.%0101, 5: $1400-$17FF, 5120-6143.%0110, 6: $1800-$1BFF, 6144-7167.%0111, 7: $1C00-$1FFF, 7168-8191.%1000, 8: $2000-$23FF, 8192-9215.%1001, 9: $2400-$27FF, 9216-10239.%1010, 10: $2800-$2BFF, 10240-11263.%1011, 11: $2C00-$2FFF, 11264-12287.%1100, 12: $3000-$33FF, 12288-13311.%1101, 13: $3400-$37FF, 13312-14335.%1110, 14: $3800-$3BFF, 14336-15359.%1111, 15: $3C00-$3FFF, 15360-16383.',
    bits: [
      { "l": "0", "d": "???" },
      { "l": "1-3", "d": "In text mode, pointer to character memory. In bitmap mode, pointer to bitmap memory" },
      { "l": "4-7", "d": "Pointer to screen memory" }
    ],
    keywords: "character memory bitmap",
    examples: [
      {
        "description": "Set character set location to $3800",
        "code": "lda $d018\nora #$0e       ; set chars location to $3800 for displaying the custom font\nsta $d018      ; Bits 1-3 ($400+512bytes * low nibble value) of $d018 sets char location ; $400 + $200*$0E = $3800  "
      }
    ]
  },
  {
    address: 'd019',
    label: 'Interrupt register',
    chip: 'VIC-II',
  },
  {
    address: 'd01a',
    label: 'Interrupt enabled',
    chip: 'VIC-II',
  },
  {
    address: 'd01b',
    label: 'Sprite data priority',
    chip: 'VIC-II',
  },
  {
    address: 'd01c',
    label: 'Sprite multicolour',
    chip: 'VIC-II',
  },
  {
    address: 'd01d',
    label: 'Sprite X expansion',
    chip: 'VIC-II',
  },
  {
    address: 'd01e',
    label: 'Sprite-sprite collision',
    chip: 'VIC-II',
  },
  {
    address: 'd01f',
    label: 'Sprite-data collision',
    chip: 'VIC-II',
  },
  {
    address: 'd020',
    label: 'Border colour',
    chip: 'VIC-II',
  },
  {
    address: 'd021',
    label: 'Background colour 0',
    chip: 'VIC-II',
  },
  {
    address: 'd022',
    label: 'Background colour 1',
    chip: 'VIC-II',
    keywords: "multicolor multicolour"
  },
  {
    address: 'd023',
    label: 'Background colour 2',
    chip: 'VIC-II',
    keywords: "multicolor multicolour"
  },
  {
    address: 'd024',
    label: 'Background colour 3',
    chip: 'VIC-II',
  },
  {
    address: 'd025',
    label: 'Sprite multicolour 0',
    chip: 'VIC-II',
  },
  {
    address: 'd026',
    label: 'Sprite multicolour 1',
    chip: 'VIC-II',
  },
  {
    address: 'd027',
    label: 'Sprite 0 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd028',
    label: 'Sprite 1 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd029',
    label: 'Sprite 2 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd02a',
    label: 'Sprite 3 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd02b',
    label: 'Sprite 4 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd02c',
    label: 'Sprite 5 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd02d',
    label: 'Sprite 6 colour',
    chip: 'VIC-II',
  },
  {
    address: 'd02e',
    label: 'Sprite 7 colour',
    chip: 'VIC-II',
  },

  // SID CHIP
  {
    address: 'd400',
    label: 'Frequency voice 1 low byte',
    chip: 'SID',
  },
  {
    address: 'd401',
    label: 'Frequency voice 1 high byte',
    chip: 'SID',
  },
  {
    address: 'd402',
    label: 'Pulse wave duty cycle voice 1 low byte',
    chip: 'SID',
  },
  {
    address: 'd403',
    label: 'Pulse wave duty cycle voice 1 high byte',
    chip: 'SID',
  },
  {
    address: 'd404',
    label: 'Voice 1 Control Register',
    chip: 'SID',

    bits: [
      { "l": "0", "d": "0 = Voice off; 1 = Voice on" },
      { "l": "1", "d": "Synchronise voice 1 with 3"},
      { "l": "2", "d": "Ring modulate voice 1 with 3"},
      { "l": "3", "d": "Test Bit, 1 = disable voice 1, reset noise generator"},
      { "l": "4", "d": "Triangle Waveform"},
      { "l": "5", "d": "Sawtooth Waveform"},
      { "l": "6", "d": "Pulse Waveform"},
      { "l": "7", "d": "Noise Waveform"}
    ],

    description: "Write only",

  },
  {
    address: 'd405',
    label: 'Voice 1 Attack duration, decay duration',
    chip: 'SID',
  },
  {
    address: 'd406',
    label: 'Voice 1 Sustain level, release duration',
    chip: 'SID',
  },
  {
    address: 'd407',
    label: 'Frequency voice 2 low byte',
    chip: 'SID',
  },
  {
    address: 'd408',
    label: 'Frequency voice 2 high byte',
    chip: 'SID',
  },
  {
    address: 'd409',
    label: 'Pulse wave duty cycle voice 2 low byte',
    chip: 'SID',
  },
  {
    address: 'd40a',
    label: 'Pulse wave duty cycle voice 2 high byte',
    chip: 'SID',
  },
  {
    address: 'd40b',
    label: 'Control register voice 2',
    chip: 'SID',
  },
  {
    address: 'd40c',
    label: 'Attack duration, decay duration Voice 2',
    chip: 'SID',
  },
  {
    address: 'd40d',
    label: 'Sustain level release duration Voice 2',
    chip: 'SID',
  },
  {
    address: 'd40e',
    label: 'Frequency voice 3 low byte',
    chip: 'SID',
  },
  {
    address: 'd40f',
    label: 'Frequency voice 3 high byte',
    chip: 'SID',
  },
  {
    address: 'd410',
    label: 'Pulse wave duty cycle voice 3 low byte',
    chip: 'SID',
  },
  {
    address: 'd411',
    label: 'Pulse wave duty cycle voice 3 high byte',
    chip: 'SID',
  },
  {
    address: 'd412',
    label: 'Control register voice 3',
    chip: 'SID',
  },
  {
    address: 'd413',
    label: 'Attack duration, decay duration voice 3',
    chip: 'SID',
  },
  {
    address: 'd414',
    label: 'Sustain level, release duration voice 3',
    chip: 'SID',
  },
  {
    address: 'd415',
    label: 'Filter cutoff frequency low byte',
    chip: 'SID',
  },
  {
    address: 'd416',
    label: 'Filter cutoff frequency high byte',
    chip: 'SID',
  },
  {
    address: 'd417',
    label: 'Filter resonance and routing',
    chip: 'SID',
  },
  {
    address: 'd418',
    label: 'Filter mode and main volume control',
    chip: 'SID',
    bits: [
      { "l": "0-3", "d": "Volume" },
      { "l": "4", "d": "1 = Low pass enabled"},
      { "l": "5", "d": "1 = Band pass enabled"},
      { "l": "6", "d": "1 = High pass enabled"},
      { "l": "7", "d": "1 = Voice 3 disabled"},
    ],    
  },
  {
    address: 'd419',
    label: 'Paddle x value (read only)',
    chip: 'SID',
  },
  {
    address: 'd41a',
    label: 'Paddle y value (read only)',
    chip: 'SID',
  },
  {
    address: 'd41b',
    label: 'Oscillator voice 3 (read only)',
    chip: 'SID',
  },
  {
    address: 'd41c',
    label: 'Envelope voice 3 (read only)',
    chip: 'SID',
  },

/*
//https://www.c64-wiki.com/wiki/SID
$d400 (54272)	frequency voice 1 low byte
$d401 (54273)	frequency voice 1 high byte
$d402 (54274)	pulse wave duty cycle voice 1 low byte
7..4	3..0
$d403 (54275)	—	pulse wave duty cycle voice 1 high byte
$d404 (54276)	control register voice 1
7	6	5	4	3	2	1	0
noise	pulse	sawtooth	triangle	test	ring modulation with voice 3	synchronize with voice 3	gate
7..4	3..0
$d405 (54277)	attack duration	decay duration voice 1
$d406 (54278)	sustain level	release duration
$d407 (54279)	frequency voice 2 low byte
$d408 (54280)	frequency voice 2 high byte
$d409 (54281)	pulse wave duty cycle voice 2 low byte
7..4	3..0
$d40a (54275)	—	pulse wave duty cycle voice 2 high byte
$d40b (54283)	control register voice 2
7	6	5	4	3	2	1	0
noise	pulse	sawtooth	triangle	test	ring modulation with voice 1	synchronize with voice 1	gate
7..4	3..0
$d40c (54284)	attack duration	decay duration voice 2
$d40d (54285)	sustain level	release duration voice 2
$d40e (54286)	frequency voice 3 low byte
$d40f (54287)	frequency voice 3 high byte
$d410 (54288)	pulse wave duty cycle voice 3 low byte
7..4	3..0
$d411 (54275)	—	pulse wave duty cycle voice 3 high byte
$d412 (54290)	control register voice 3
7	6	5	4	3	2	1	0
noise	pulse	sawtooth	triangle	test	ring modulation with voice 2	synchronize with voice 2	gate
7..4	3..0
$d413 (54291)	attack duration	decay duration voice 3
$d414 (54292)	sustain level	release duration voice 3
$d415 (54293)	—	filter cutoff frequency low byte
$d416 (54294)	filter cutoff frequency high byte
$d417 (54295)	filter resonance and routing
7..4	3	2	1	0
filter resonance	external input	voice 3	voice 2	voice 1
$d418 (54296)	filter mode and main volume control
7	6	5	4	3..0
mute voice 3	high pass	band pass	low pass	main volume
$d419 (54297)	paddle x value (read only)
$d41a (54298)	paddle y value (read only)
$d41b (54299)	oscillator voice 3 (read only)
$d41c (54300)	envelope voice 3 (read only)
*/

  // CIA 1
  {
    address: 'dc00',
    label: 'CIA 1 Data Port A (Keyboard, Joystick, Paddles, Light Pen)',
    chip: 'CIA 1',
    bits: [
      { "l": "0", "d": "Joystick Port 2 Up" },
      { "l": "1", "d": "Joystick Port 2 Down" },
      { "l": "2", "d": "Joystick Port 2 Left" },
      { "l": "3", "d": "Joystick Port 2 Right" },
      { "l": "4", "d": "Joystick Port 2 Fire" },
      { "l": "x (write)", "d": "0=Select keyboard matrix column x" },
      { "l": "6-7 (write)", "d": "Paddle selection: %01=Paddle 1, %10=Paddle 2" }
    ],
    keywords: 'keyboard joystick paddles'
  },
  {
    address: 'dc01',
    label: 'CIA 1 Data Port B (Keyboard, Joystick, Paddles)',
    chip: 'CIA 1',
    bits: [
      { "l": "0", "d": "Joystick Port 1 Up" },
      { "l": "1", "d": "Joystick Port 1 Down" },
      { "l": "2", "d": "Joystick Port 1 Left" },
      { "l": "3", "d": "Joystick Port 1 Right" },
      { "l": "4", "d": "Joystick Port 1 Fire" },
      { "l": "x (read)", "d": "A key is being pressed in row x in the column selected in $dc00" }
    ],
    keywords: 'keyboard joystick paddles'
    
  },
  {
    address: 'dc02',
    label: 'CIA 1 DDRA',
    chip: 'CIA 1'
  },
  {
    address: 'dc03',
    label: 'CIA 1 DDRB',
    chip: 'CIA 1'
  },
  {
    address: 'dc04',
    label: 'Timer A low',
    chip: 'CIA 1'
  },
  {
    address: 'dc05',
    label: 'Timer A high',
    chip: 'CIA 1'
  },
  {
    address: 'dc06',
    label: 'Timer B low',
    chip: 'CIA 1'
  },
  {
    address: 'dc07',
    label: 'Timer B high',
    chip: 'CIA 1'
  },
  {
    address: 'dc08',
    label: 'TOD Clock 1/10 secs',
    chip: 'CIA 1'
  },
  {
    address: 'dc09',
    label: 'TOD Clock Seconds',
    chip: 'CIA 1'
  },
  {
    address: 'dc0a',
    label: 'TOD Clock Minutes',
    chip: 'CIA 1'
  },
  {
    address: 'dc0b',
    label: 'TOD Clock',
    chip: 'CIA 1'
  },
  {
    address: 'dc0c',
    label: 'Serial Data Register',
    chip: 'CIA 1'
  },
  {
    address: 'dc0d',
    label: 'Interrupt Control Register',
    chip: 'CIA 1'
  },
  {
    address: 'dc0e',
    label: 'Control Register A',
    chip: 'CIA 1'
  },
  {
    address: 'dc0f',
    label: 'Control Register B',
    chip: 'CIA 1'
  },



  
  // CIA 2
  {
    address: 'dd00',
    label: 'Data Port A (Serial Bus, RS-232, VIC Memory Control)',
    chip: 'CIA 2',
    bits: [
      { "l": "0-1", "d": "VIC Chip System Memory Bank Select (default  = 11)" },
      { "l": "2", "d": "RS-232 Data Output (User Port)"},
      { "l": "3", "d": "Serial Bus ATN Signal Output"},
      { "l": "4", "d": "Serial Bus Clock Pulse Output"},
      { "l": "5", "d": "Serial Bus Data Output"},
      { "l": "6", "d": "Serial Bus Clock Pulse Input"},
      { "l": "7", "d": "Serial Bus Data Input"},
    ],

    description: "%00, 0: Bank #3, $C000-$FFFF, 49152-65535.%01, 1: Bank #2, $8000-$BFFF, 32768-49151.%10, 2: Bank #1, $4000-$7FFF, 16384-32767.%11, 3: Bank #0, $0000-$3FFF, 0-16383.",
    /*
    description: "Default value $37 %xx110111: BASIC ROM visible at $A000-$BFFF,  I/O area visible at $D000-$DFFF, KERNAL ROM visible at $E000-$FFFF.\nThe direction of flow of data for each bit is determined by the corresponding bit of the 6510 Data Direction Register ($0000). Note: If KERNAL isn't mapped in, then BASIC won't map in either. If HIRAM and LORAM are both set to 0, CHARREN is ignored",
    examples: [
      {
        "description": "Setup RAM at $A000-$BFFF and $E000-$FFFF, I/O at $D000-DFFF",
        "code": "  lda #%00110101 ; hex #$35\n  sta $01 "      
      }
    ],
    */
    keywords: "vic bank"

  },
  {
    address: 'dd01',
    label: 'Data Port B',
    chip: 'CIA 2'
  },
  {
    address: 'dd02',
    label: 'DDRA',
    chip: 'CIA 2'
  },
  {
    address: 'dd03',
    label: 'DDRB',
    chip: 'CIA 2'
  },
  {
    address: 'dd04',
    label: 'Timer A low',
    chip: 'CIA 2'
  },
  {
    address: 'dd05',
    label: 'Timer A high',
    chip: 'CIA 2'
  },
  {
    address: 'dd06',
    label: 'Timer B low',
    chip: 'CIA 2'
  },
  {
    address: 'dd07',
    label: 'Timer B high',
    chip: 'CIA 2'
  },
  {
    address: 'dd08',
    label: 'TOD Clock 1/10 Secs',
    chip: 'CIA 2'
  },
  {
    address: 'dd09',
    label: 'TOD Clock Seconds',
    chip: 'CIA 2'
  },
  {
    address: 'dd0a',
    label: 'TOD Clock Minutes',
    chip: 'CIA 2'
  },
  {
    address: 'dd0b',
    label: 'TOD Clock',
    chip: 'CIA 2'
  },
  {
    address: 'dd0c',
    label: 'Serial Data Register',
    chip: 'CIA 2'
  },
  {
    address: 'dd0d',
    label: 'Interrupt Control Register',
    chip: 'CIA 2'
  },
  {
    address: 'dd0e',
    label: 'Control Register A',
    chip: 'CIA 2'
  },
  {
    address: 'dd0f',
    label: 'Control Register B',
    chip: 'CIA 2'
  },

  {
    address: 'fffa',
    label: 'NMI Service Routine Address Low',
    keywords: 'interrupts'
  },

  {
    address: 'fffb',
    label: 'NMI Service Routine Address High',
    keywords: 'interrupts'
  },

  {
    address: 'fffc',
    label: 'Cold Reset Address Low',
    keywords: 'interrupts'
  },

  {
    address: 'fffd',
    label: 'Cold Reset Address High',
    keywords: 'interrupts'
  },


  {
    address: 'fffe',
    label: 'Interrupt Service Routine Address Low',
    keywords: 'interrupts'
  },

  {
    address: 'ffff',
    label: 'Interrupt Service Routine Address High',
    keywords: 'interrupts'
  }
];

var C64MemoryMap = function() {
  this.searchTerm = '';
}

C64MemoryMap.prototype = {
  init: function(editor) {
    this.editor = editor;

    // build the keywords
    for(var i = 0; i < C64IORegisters.length; i++) {
      var keywords = '';
      if(typeof C64IORegisters[i].address != 'undefined') {
        keywords += C64IORegisters[i].address + ' ';
      }

      if(typeof C64IORegisters[i].chip != 'undefined') {
        keywords += C64IORegisters[i].chip;
      }

      if(typeof C64IORegisters[i].label != 'undefined') {
        keywords += C64IORegisters[i].label;
      }
      keywords = keywords.toLowerCase();

      if( typeof C64IORegisters[i].keywords == 'undefined' ) {
        C64IORegisters[i].keywords = '';
      }

      C64IORegisters[i].keywords += keywords;
      C64IORegisters[i].index = i;
    }

  },

  buildInterface: function(parentPanel) {
    var _this = this;

    UI.on('ready', function() {
      this.uiComponent = UI.create("UI.HTMLPanel", { "id": "c64MemoryMapPanel" });
      parentPanel.add(this.uiComponent)

      this.uiComponent.load('html/assemblerUtils/c64MemoryMap.html', function() {
        _this.initEvents();
      });
    });
  },

  initEvents: function() {
    var _this = this;

    $('#c64MemoryMapSearch').on('keyup', function() {
      var value = $(this).val();
      _this.setSearchTerm(value);
    });
    $('#c64MemoryMapSearch').on('change', function() {
      var value = $(this).val();
      _this.setSearchTerm(value);
    });
  },

  setSearchTerm: function(value) {    
    
    this.searchTerm = value.trim().toLowerCase();

    /*
    if( value.length < 2) {
      return [];
    }
    */
    
    var results = [];
    for( var i = 0; i < C64IORegisters.length; i++ ) {
      if( value == '' || C64IORegisters[i].keywords.indexOf(value) != -1 ) {
        results.push(C64IORegisters[i]);      
      }
    }

    return results;
  },

  getResultHTML: function(section, index) {
    var result = C64IORegisters[index];
    var html = '';

      // single result
      html += '<h2>' + result.address + '</h2>';
      html += '<div>';
      html += result.chip;
      html += '</div>';
      html += '<div>';
      html += result.label;
      html += '</div>';

      if(typeof result.description != 'undefined') {
        html += '<div>';
        html += result.description;
        html += '</div>';
      }

      if(typeof result.bits != 'undefined') {
        html += '<div>';
        html += '<h3>Bits</h3>';
        html += '<table>';
        for(var i = 0; i < result.bits.length; i++) {
          html += '<tr>';
          html += '<td style="white-space: nowrap">' + result.bits[i].l + '</td>';
          html += '<td>' + result.bits[i].d + '</td>';
          html += '</tr>';
        }
        html += '</table>';
        html += '</div>';
      }

      if(typeof result.examples != 'undefined') {
        html += '<div>';
        html += '<h3>Examples</h3>';
        for(var i = 0; i < result.examples.length; i++) {
          html += '<h4>' + result.examples[i].description + '</h4>';
          html += '<pre>';
          html += result.examples[i].code;
          html += '</pre>';
          html += '<a href="#">Copy To Clipboard</a>';
        }
        html += '</div>';
      }
      return html;
  },

  getResultsHTML: function(results) {
    var html = '';

    html += '<div id="gotoAllInstructions" class="mos6502OpcodeLink">&lt; All Instructions</div>';
    
    if(results.length == 1) {
      html = this.getResultHTML('ioregisters', results[0].index);
//      var result = results[0];

    } else {
      html += '<h3>Registers</h3>';
      html += '<table>';
      html += '<tr>';
      html += '<th>Address</th>';
      html += '<th>Chip</th>';
      html += '<th>Description</th>';
      html += '</tr>';
      for(var i = 0; i < results.length; i++) {
        html += '<tr>';
        html += '<td>' + '<a href="#" class="docs-link" data-term="' + results[i]['address'] + '" data-section="ioregisters" data-index="' + results[i].index + '">' + results[i]['address'] + '</a>' + '</td>';
        html += '<td>';
        if(typeof results[i].chip != 'undefined') {
          html += results[i].chip;
        } else {
          html += '&nbsp;'
        }
        html += '</td>';
        html += '<td>' + results[i]['label'] + '</td>';
        html += '</tr>';
      }
      html += '</table>';
    }


    return html;
  }
}
