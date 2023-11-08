/*** THIS IS THE NEW EXPORT!!!!! ****/
var ExportC64 = function() {
  this.editor = null;


  this.effects = [
  
    { 
      "name": "Background Flash", 
      "data": ";data \nbgEffectCounter\n!byte 00\nbgEffectColor \n!byte $0,$0,$b,$b,$c,$c,$f,$f,$1,$1,$f,$c,$b",
      "init": ";init\n;this code is executed once on startup\n", 
      "trigger": ";on trigger\n;this code is executed when the effect is triggered\n  lda #$0d\n  sta bgEffectCounter\n",
      "tick": "\n;on tick\n;this code is executed on every tick\n\n  lda bgEffectCounter\n  cmp #00\n  beq bgEffectDone\n    \n  ldy bgEffectCounter\n  lda bgEffectColor,y\n\n  sta $d021\n\n  dey\n  sty bgEffectCounter\n\nbgEffectDone"
    },
  
    {
      "name": "Jitter",
      "data": ";data \neffectJitterCounter\n!byte 00\neffectJitterAmount\n!byte $7,$0,$3,$6,$2,$7,$4",
      "init": ";init\n;this code is executed once on startup\n",
      "trigger": ";on trigger\n;this code is executed when the effect is triggered\n  lda #$06\n  sta effectJitterCounter\n    \n  lda #$07\n  ora $d016\n",
      "tick": ";on tick\n;this code is executed on every tick\n\n  lda effectJitterCounter\n  cmp #00\n  beq effectJitterDone\n  \n  lda $d016                                    ; $d016 is a VIC-II control register which contains the horizontal scroll value\n  and #$F8           \n  sta temp      \n      \n  ldy effectJitterCounter\n  lda effectJitterAmount,y\n  \n  ora temp\n  sta $d016\n\n  dey\n  sty effectJitterCounter\n\neffectJitterDone"
    }

  ];

  // holds the player.asm
  this.c64Asm = null;

  this.colorSchemes = {
    'vice': [0x000000,0xffffff,0x68372B,0x70A4B2,0x6F3D86,0x588D43,0x352879,0xB8C76F,0x6F4F25,0x433900,0x9A6759,0x444444,0x6C6C6C,0x9AD284,0x6C5EB5,0x959595],
    'ccs64': [0x191D19,0xFCF9FC,0x933A4C,0xB6FAFA,0xD27DED,0x6ACF6F,0x4F44D8,0xFBFB8B,0xD89C5B,0x7F5307,0xEF839F,0x575753,0xA3A7A7,0xB7FBBF,0xA397FF,0xEFE9E7]
    /*
    'c64hq': ['0a0a0a','fff8ff','851f02','65cda8','a73b9f','4dab19','1a0c92','ebe353','a94b02','441e00','d28074','464646','8b8b8b','8ef68e','4d91d1','bababa'],
    'pc64': ['212121','ffffff','b52121','73ffff','b521b5','21b521','2121b5','ffff21','b57321','944221','ff7373','737373','949494','73ff73','7373ff','b5b5b5'],
    'c64s': ['000000','fcfcfc','a80000','54fcfc','a800a8','00a800','0000a8','fcfc00','a85400','802c00','fc5454','545454','808080','54fc54','5454fc','a8a8a8']
    */
  };

  this.files = [];

}

ExportC64.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.c64Asm = new C64ASM();
    this.c64Asm.init(this.editor);

    this.sourceList = [
      'c64export/animatedbgcolors.asm',
      'c64export/animatedchars.asm',
      'c64export/checkinstrument.asm',
      'c64export/constants.asm',
      'c64export/copycharset.asm',
      'c64export/copydata.asm',
      'c64export/displaynextframe.asm',
      'c64export/getframeinfo.asm',
      'c64export/init.asm',
      'c64export/keyboard.asm',
      'c64export/main.asm',
      'c64export/player.asm',
      'c64export/playframes.asm',
      'c64export/setupinterrupts.asm',
      'c64export/triggers.asm',
      'c64export/zeropage.asm',
    ];

    this.loadedAssetCount = 0;
    this.sourceFiles = {};

  },

  assetsReady: function() {
    console.log('assets ready!');
    console.log(this.sourceFiles);

    this.sourceLoadedCallback();
  },

  loadNextAsset: function() {
    var index = this.loadedAssetCount;
    if(index >= this.sourceList.length) {
      this.assetsReady();
      return;
    }

    var path = this.sourceList[index];
    var dataType = 'text';
    var _this = this;

    var oReq = new XMLHttpRequest();
    oReq.open("GET", path + '?v={v}', true);
    oReq.responseType = dataType;
    
    oReq.onload = function (oEvent) {
      //var arrayBuffer = oReq.response; // Note: not oReq.responseText
      /*
      if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
      }
    */
      var key = _this.sourceList[index];
      key = key.substr('c64export/'.length);

      _this.sourceFiles[key] = oReq.responseText;
      _this.loadedAssetCount++;
      _this.loadNextAsset();

    };
    
    oReq.send(null);

  },

  loadSource: function(callback) {
    this.loadNextAsset();
    this.sourceLoadedCallback = callback;
  },

  addSourceFile: function(filename) {
    var fileId = this.files.length;
    var fileName = filename;

    var fileContent = this.sourceFiles[filename];

    var fileType = 'asm';
    this.files.push({
      id: fileId,
      name: fileName,
      content: fileContent,
      filePath: 'asm/' + fileName,
      type: fileType
    });


  },

  doExport: function( args ) {

    console.log("DO EXPORT!!!!!!!");
    console.log(args);

    this.files = [];

    this.files.push({
      id: 1,
      name: 'asm',
      content: '',
      filePath: 'asm',
      type: 'folder'
    });

    this.files.push({
      id: 2,
      name: 'bin',
      content: '',
      filePath: 'data',
      type: 'folder'
    });

    var mainAsm = '';
    var frameFilesAsm = '';

    var initAsm = '';
    var charsetAsm = '';
    var animatedTileTableAsm = '';
    var animatedTileDataAsm = '';
    var frameTableAsm = '';
    var isPETSCIISingle = false;
    var hasSID = false;
    var type = args.type;


    var layer = this.editor.layers.getSelectedLayerObject();

    if( ! layer || layer.getType() != 'grid' ) {
      alert( 'Please choose a grid layer' );
      return;
    }

    var filename = 'c64.prg';
    if(typeof(args.filename) != 'undefined') {
      filename = args.filename;
    } 
    
    var downloadPRG = true;
    if(typeof args.download != 'undefined') {
      downloadPRG = args.download;
    }

    var extendedColorMode = args.mode == 'extended';
    var multicolorMode = args.mode == 'multicolor';
    var monochrome = args.mode == 'monochrome';

    this.monochromeColor = 6;
    if(monochrome && typeof args.monochromeColor != 'undefined') {
      this.monochromeColor = args.monochromeColor;
    }

    var colorPalette = layer.getColorPalette();
    var tileSet = layer.getTileSet();
    var customTileSet = !tileSet.isPetscii();
    customTileSet = true;

    var colorPerMode = layer.getColorPerMode();
    var frameCount = 0;
    var firstFrameBGColor = 0;

    if( layer.getBlockModeEnabled() ) {
      layer.updateTilesFromBlocks();
    }
    if(colorPerMode == 'character') {
      layer.updateGridColorsFromTiles();
    }

    var scrolling = false;
    var gridWidth =  args.gridWidth;
    var gridHeight = args.gridHeight;

    if(!scrolling) {
      if(gridWidth > 40) {
        gridWidth = 40;
      }
      if(gridHeight > 25) {
        gridHeight = 25;
      }
    }

    this.createColorMap(colorPalette);

    var tileCount = tileSet.getTileCount();
    this.charsetMap = [];
    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = i;
    }


    var inputData = args.frames;

    var code = this.c64Asm.files.load('/main.asm');
    effectsCode = '\ninit_effects\n' + this.effectsCode();
    code = code.replace('\ninit_effects', effectsCode); 
    this.assembleCode(code);
    var memoryMap = [];

    var blocks = [];
    for(var i = 0; i < this.blocks.length; i++) {
      blocks.push({ "type": "Code", "start": this.blocks[i].start, "end": this.blocks[i].end, "label": this.blocks[i].label });
    }    

//    console.log('CODE = ');
//    console.log(code);

    this.entries = [];
    if(typeof args.entries != 'undefined') {
      this.entries = args.entries;
    }

    this.keyTriggers = [];
    if(typeof args.keyTriggers != 'undefined') {
      this.keyTriggers = args.keyTriggers;
    }

    this.instrTriggers = [];
    if(typeof args.instrTriggers != 'undefined') {
      this.instrTriggers = args.instrTriggers;
    }

    if(this.entries.length == 1 && this.entries[0].type == 'frame') {
      isPETSCIISingle = true;
    }
    if(this.entries.length == 2 && this.entries[0].type == 'frame' && this.entries[1].type == 'gotorow') {
      isPETSCIISingle = true;
    }


    isPETSCIISingle = false;

    this.getNeededFrames();

    this.setSIDData(args);

    hasSID = this.sidData != null;


    // the base prg.
    var prg = this.prg;


    var data = new Uint8Array(64000);
    var index = 0;
    var borderColor = this.getBorderColor();
    var backgroundColor = this.getBackgroundColor();

    // write out the base prg --------------------------
    index = 0;
    var dataFrom = index;
    for(var i = 0; i < prg.length; i++) {
      data[index++] = prg[i];
    }
    dataTo = index;
    memoryMap.push({ "type": "Code", "from": dataFrom, "to": dataTo });


    // write out the charsets
    var tileSetCount = 1;//this.editor.tileSetManager.getTileSetCount();
    // custom charsets ---------------------------

    var charsetData = [];

    if(extendedColorMode) {

      // extended color mode can only use 64 characters
      if(this.getExtendedColorBGColors(args, this.framesToExport)) {

        this.getMostUsedCharacters(args, this.framesToExport);

        // TODO: only include charactersets if they are used..
        // TODO: put this into its own function? take into account which vic bank?
        var charBlock = 0;

        for(var i = 0; i < tileSetCount; i++) {
          tileSet = layer.getTileSet();//this.editor.tileSetManager.getTileSet(i);
          this.getExtendedColorCharsetData(tileSet, i);
          customTileSet = true;

          // write out the custom characters for extended color mode
          // custom characters start at 0x3800
          index = (0x3800 - 0x801 + 2) - 0x800 * charBlock;

          tileSet.memoryLocation = (7 - charBlock) << 1;
          var dataFrom = index;
          for(var j = 0; j < this.extendedColorCharsetData.length; j++) {
            data[index++] = this.extendedColorCharsetData[j];
            charsetData.push(this.extendedColorCharsetData[j]);
          }
          var dataTo = index;
          memoryMap.push({ "type": "Character Data", "from": dataFrom, "to": dataTo });

          blocks.push({ "type": "Character Set Data", 
            start: (dataFrom + 0x801 - 2), 
            end: (dataTo + 0x801 - 2) });

          charBlock++;
        }

      } else {
        // trouble working out bg colors, dont use extended color mode
        extendedColorMode = false;
      }

    } else {
      // counter for the character block being written out
      var charBlock = 0;
      this.getMostUsedCharacters(args, this.framesToExport);

      for(var i = 0; i < tileSetCount; i++) {
        tileSet = layer.getTileSet();

        if(tileSet.isDefaultTileSet('c64')) {
          tileSet.memoryLocation = 4;
        } else {

          index = (0x3800 - 0x801 + 2) - 0x800 * charBlock;
          //this.editor.tileSets[i].memoryLocation = (7 - charBlock) << 1;
          tileSet.memoryLocation = (7 - charBlock) << 1;

          var dataFrom = index;
          this.getCharsetData(tileSet);   

          for(var j = 0; j < this.charsetData.length; j++) {
            data[index++] = this.charsetData[j];
            charsetData.push(this.charsetData[j]);
          }
          var dataTo = index;

          blocks.push({ "type": "Character Set Data (" + tileSet.name + ")", start: dataFrom + 0x801 - 2, end: dataTo + 0x801 - 2 });
          charBlock++;
        }
      }
    }

    charsetAsm = 'CHARSET_DATA\n';
    charsetAsm += this.formatBytes(charsetData);

    // ----------------------- write sid
    // set index to just before 0x1000....code may overlap this tho, need to check
    index = 0xfff - 0x801 + 2;

    // is there a sid?
    if(this.sidData) {
      console.log('strip sid header');
      var sidBytes = [];
      for(var i = this.sidHeaderLength; i < this.sidData.length; i++) {
        sidBytes.push(this.sidData[i]);
      }

      console.log('sid bytes ===== ');
      console.log(sidBytes);
      
      var fileName = 'sid.bin';
      var fileType = 'bin';

      if(type != 'source') {
        sidBytes = bufferToBase64(sidBytes);
      }

      this.files.push({
        id: 'sidfile',
        name: fileName,
        content: sidBytes,
        filePath: 'data/' + fileName,
        type: fileType
      });      

      this.sidLength = sidBytes.length;
      this.sidEndAddress = this.sidLoadAddr + sidBytes.length;


      /*
      var address = index + 0x801 - 2;

      if(address > this.sidLoadAddr) {
        // gone past where sid should be...
        this.sidData = null;
      } else {

        index = this.sidLoadAddr - 0x801 + 2;

        var dataFrom = index;
        for(var i = this.sidHeaderLength; i < this.sidData.length; i++) {
          data[index++] = this.sidData[i];  
        }
        var dataTo = index;
        memoryMap.push({ "type": "SID", "from": dataFrom, "to": dataTo });

        blocks.push({"type": "SID", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});

      }

      */
    } else {

    }
    // ----------------------- end write sid



    // ------------------------ frames table
    // index is set to just after sid.
    var framePtrTableAddr = index;
    console.log('frame ptr table addr:' + framePtrTableAddr);

    dataFrom = index;

    // just leave 300 space for the table for the moment..need to fit in trigger table as well
    index += 600;

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Frames Table", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Frames Table", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }


    // ------------------------ end frames table


    // ------------------------ animated chars table
    
    // are there animated characters?

//    var tileSet = this.editor.getTileSet();
    var animatedCount = 0;
    var animatedCharsTableAddr = index;
    var dataFrom = index;

    var tileCount = tileSet.getTileCount();


    var animatedTileData = [];


    animatedTileTableAsm = 'ANIMATED_CHARS_TABLE\n';

    for(var i = 0; i < tileCount; i++) {
      var tileAnimatedType = tileSet.getAnimatedType(i);
      var tileProperties = tileSet.getTileProperties(i);

      if(tileAnimatedType !== false) {
        console.log('tile animated type:');
        console.log(tileAnimatedType);
        console.log(tileProperties);
        console.log('--------------');

        var ch = 0;
        
        if(i < this.charsetMap.length) {
          ch = this.charsetMap[i]
        }
        customTileSet = true;


        data[index++] = tileProperties.ticksPerFrame;
        data[index++] = tileProperties.ticksPerFrame;
        data[index++] = (ch * 8) & 0xff;
        data[index++] = (ch * 8) >> 8;

        animatedTileTableAsm += '!byte ';
        animatedTileTableAsm += '$' + this.toHex(tileProperties.ticksPerFrame) + ',';
        animatedTileTableAsm += '$' + this.toHex(tileProperties.ticksPerFrame) + ',';
        animatedTileTableAsm += '$' + this.toHex((ch * 8) & 0xff) + ',';
        animatedTileTableAsm += '$' + this.toHex((ch * 8) >> 8) + ',';


        switch(tileAnimatedType) {
          case 'right':
            data[index++] = 1;

            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;

            animatedTileTableAsm += '$' + this.toHex(1) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0);

            break;
          case 'up':
            data[index++] = 2;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;

            animatedTileTableAsm += '$' + this.toHex(2) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0);

            break;
          case 'down':
            data[index++] = 3;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;

            animatedTileTableAsm += '$' + this.toHex(3) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0);

            break;
          case 'blink':
            data[index++] = 4;

            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;

            animatedTileTableAsm += '$' + this.toHex(4) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0);
            
            break;
          default:
          case 'left':
            data[index++] = 0;

            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;
            data[index++] = 0;

            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ',';
            animatedTileTableAsm += '$' + this.toHex(0);


            break;
          case 'frames':
            data[index++] = 5;
            data[index++] = tileProperties.frameCount;
            data[index++] = 0; // current frame

            var tileFrames = [];
            for(var f = 0; f < tileProperties.frameCount; f++) {
              tileFrames.push({
                frame: f,
                charData: this.getCharData(tileSet, ch, f)
              });
            }

            animatedTileTableAsm += '$' + this.toHex(5) + ',';
            animatedTileTableAsm += '$' + this.toHex(tileProperties.frameCount) + ',';
            animatedTileTableAsm += '$' + this.toHex(0) + ','; // current frame
            animatedTileTableAsm += '<ANIM_CHAR_' + animatedTileData.length + ',';
            animatedTileTableAsm += '>ANIM_CHAR_' + animatedTileData.length;

            animatedTileData.push({
              addressPosition: index,
              frames: tileFrames
            });

            data[index++] = 0; // frames address low
            data[index++] = 0; // frames address high


            break;
        }
        animatedCount++;
        animatedTileTableAsm += '\n';
      }
    }

    animatedTileTableAsm += '!byte $00\n'
    // end of table
    data[index++] = 0;


    console.log("TILE FRAMES!");
    console.log(tileFrames);
    

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Animated Characters Table", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Animated Characters Table", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }

    // ------------------------ end animated chars table

    // -------------------------- animated colors
    dataFrom = index;

    for(var i = 0; i < 4; i++) {
      data[index++] = 6;//tileSet.characterProperties[i].ticksPerFrame;
      data[index++] = 6;//tileSet.characterProperties[i].ticksPerFrame;
      data[index++] = i;
    }
    // end of table
    data[index++] = 0;


    var animatedBGColorsTableAddr = dataFrom;

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Animated BG Colours Table", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Animated BG Colours Table", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }

    // -------------------------- end animated colors


    // -------------------------- animated chars data
    /*
              tileFrames.push({
                frame: f,
                addressPosition: index,
                charData: this.getCharData(tileSet, ch, f)
              });
    */

    console.log('animated data position = ' + index);              
    var dataFrom = index;

    animatedTileDataAsm = '';

    for(var a = 0; a < animatedTileData.length; a++) {
      var tileFrames = animatedTileData[a].frames;
      var address = index + 0x801 - 2;

      console.log("Animated char address = " + address);
      console.log("Animated char address = " + address.toString(16));
      var addressPos = animatedTileData[a].addressPosition;
      data[addressPos] = address & 0xff;
      data[addressPos + 1] = (address >> 8) & 0xff;

      var animatedCharData = [];  
      for(var i = 0; i < tileFrames.length; i++) {
        for(var d = 0; d < tileFrames[i].charData.length; d++) {
          data[index++] = tileFrames[i].charData[d];

          animatedCharData.push(tileFrames[i].charData[d]);
        }
      }

      animatedTileDataAsm += 'ANIM_CHAR_' + a + '\n';
      animatedTileDataAsm += this.formatBytes(animatedCharData);
      animatedTileDataAsm += '\n\n';
    }

    var dataTo = index;
    if(dataTo != dataFrom) {
      memoryMap.push({ "type": "Animated Chars Data", "from": dataFrom, "to": dataTo });
      blocks.push({"type": "Animated Chars Data", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2});
    }


    // -------------------------- end animated chars data

    var dataStartAddress = index;
    
    // -------------------- write config

    // update the config ------------
    var configStart = 0x0810 - 0x0801 + 2;
    var configPos = configStart;

    // border color
    data[configPos++]   = this.getC64Color(borderColor);
    // extended color mode


    // custom characters

    if(customTileSet) {
      data[configPos++] = 1;
    } else {
      data[configPos++] = 0;
    }

  
    if(this.sidData) {
      // has sid
      data[configPos++] = 1;

      // sid speed
      data[configPos++] = this.sidSpeed;

      // sid init addr low
      data[configPos++] = this.sidInitAddr & 0xff;

      // sid init addr high
      data[configPos++] = this.sidInitAddr >> 8;

      // sid play addr low
      data[configPos++] = this.sidPlayAddr & 0xff;

      // sid play addr high
      data[configPos++] = this.sidPlayAddr >> 8;

    } else {

      // has no sid
      data[configPos++] = 0;

      // sid speed
      data[configPos++] = 0;

      // sid init addr low
      data[configPos++] = 0;

      // sid init addr high
      data[configPos++] = 0;

      // sid play addr low
      data[configPos++] = 0;

      // sid play addr high
      data[configPos++] = 0;
    }

    data[configPos++] = (framePtrTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (framePtrTableAddr + 0x0801 - 2) >> 8;

    data[configPos++] = (animatedCharsTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (animatedCharsTableAddr + 0x0801 - 2) >> 8;

    
    data[configPos++] = (animatedBGColorsTableAddr + 0x0801 - 2) & 0xff;
    data[configPos++] = (animatedBGColorsTableAddr + 0x0801 - 2) >> 8;    
    // -------------------- end write config


    for(var frameIndex = 0; frameIndex < this.frames.length; frameIndex++) {
      var frame = this.frames[frameIndex].frame - 1; 

      if(extendedColorMode) {
        // work out the background colors for this frame..
        this.getExtendedColorBGColors(args, [frame]);
      } else {
        this.extendedColorBGColors = [];

        backgroundColor = this.getBackgroundColor(frame);

        if(multicolorMode) {
          var multicolor1 = layer.getC64Multi1Color();
          var multicolor2 = layer.getC64Multi2Color();

          this.extendedColorBGColors.push({'color': this.getC64Color(backgroundColor) });
          this.extendedColorBGColors.push({'color': this.getC64Color(multicolor1) });  // multicolor 1
          this.extendedColorBGColors.push({'color': this.getC64Color(multicolor2) });  // multicolor 2
          this.extendedColorBGColors.push({'color': 0});

        } else {
          this.extendedColorBGColors.push({'color': this.getC64Color(backgroundColor) });
          this.extendedColorBGColors.push({'color': 0});  // multicolor 1
          this.extendedColorBGColors.push({'color': 0});  // multicolor 2
          this.extendedColorBGColors.push({'color': 0});
        }
      }


      // 1 is full frame
      var charFrameType = 1;
      var charData = [];
      var charChanges = [];
      var charRLE = [];


      var colorFrameType = 1;      
      var colorData = [];
      var colorChanges = [];

      for(var y = 0; y < gridHeight; y++) {
        for(var x = 0; x < gridWidth; x++) {

          var tile = this.editor.tileSetManager.blankCharacter;
          var row = y;


          var color = inputData[frame].frameData.data[row][x].fc;
          var bgColor = false;

          /*
          if(layers == 'merge') {
            for(var testZ = editorFrames.depth - 1; testZ >= 0; testZ--) {
              char = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].t;
              if(char != this.editor.tileSetManager.blankCharacter || editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].bc !== -1) {
                color = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].fc;                
                bgColor = editorFrames.frames[frame].data[testZ][editorFrames.height - 1 - row][x].bc;                
                break;
              }
            }
          } else {
            tile = inputData[frame].frameData.data[row][x].t;
          }
*/
          tile = inputData[frame].frameData.data[row][x].t;

          if(monochrome) {
            color = this.monochromeColor;
          }

          if(tile < this.charsetMap.length) {
            tile = this.charsetMap[tile];
          } else {
            tile = 0;
          }

//          if(charOffset)

          if(extendedColorMode) {
            // work out background color

//            if(layers !== 'merge') {
              if(this.editor.bgInPrevLayer) {
                bgColor = inputData[frame].frameData.data[row][x].fc;
              } else {
                bgColor = inputData[frame].frameData.data[row][x].bc;              
              }
  //          }

            if(typeof bgColor == 'undefined' || bgColor === false) {
              bgColor = this.getBackgroundColor(frame);//editorFrames.frames[frame].bgColor;
            }

            if(layer.getScreenMode() !== TextModeEditor.Mode.C64ECM) {
              bgColor = this.getC64Color(bgColor);

              for(var i = 0; i < this.extendedColorBGColors.length; i++) {
                if(bgColor == this.extendedColorBGColors[i].color) {
                  bgColor = i;
                  break;
                }
              }
              bgColor = bgColor & 0x3;
              tile = tile | bgColor << 6;        
  
            } else {
              // layer is in c64 ecm already
              bgColor = inputData[frame].frameData.data[row][x].bc;    

              if(bgColor == this.editor.colorPaletteManager.noColor) {

                //bgColor = 0;
                // tile index should be actual tile
              } else {
                // tile has a background colour set
                bgColor = bgColor & 0x3;
                tile = tile | bgColor << 6;        
              }
  
            }

          }

          charData.push(tile);
          colorData.push(this.getC64Color(color));

        }
      }

//      aaav

      var lastChar = -1;
      var repeatLength = 0;

      var maxRepeatLength = 250;


      // work out the rle data
      for(var i = 0; i < charData.length; i++) {

        repeatLength = 0;
        lastChar = charData[i];

        while(i < charData.length && lastChar == charData[i] && repeatLength < maxRepeatLength) {
          i++;
          repeatLength++;
        }
        charRLE.push(repeatLength);
        charRLE.push(lastChar);
        if(repeatLength > 0) {
          i--;
        }
      }
      charRLE.push(0);


      // can this frame be written as a series of changes
      if(this.frames[frameIndex].canWriteAsChanges) {

        var previousFrame = this.frames[frameIndex].previousFrame;
        var previousFrameIndex = -1;

        // find where the char/color data is in the frames aray
        for(var i = 0; i < this.frames.length; i++) {
          if(this.frames[i].frame == previousFrame) {
            previousFrameIndex = i;
            break;
          }
        }

        if(previousFrameIndex != -1) {
          var offset = 0;

          for(var i = 0; i < charData.length; i++) {
            var newChar = charData[i];
            var oldChar = this.frames[previousFrameIndex].frameData.charData[i];

            if(newChar != oldChar || offset > 200) {
              charChanges.push(offset);
              charChanges.push(newChar);
              offset = 0;
            }

            offset++;
          }

          if(charChanges.length == 1) {
            // need at least 1 entry, just set it for first character
            charChanges.push(this.frames[previousFrameIndex].frameData.charData[0]);
          }

          charChanges.push(0);
    
          if(charChanges.length < 900) {

            charFrameType = 2;
          }


          var offset = 0;

          for(var i = 0; i < colorData.length; i++) {
            var newColor = colorData[i];
            var oldColor = this.frames[previousFrameIndex].frameData.colorData[i];

            if(newColor != oldColor || offset > 200) {
              colorChanges.push(offset);
              colorChanges.push(newColor);
              offset = 0;
            }

            offset++;
          }

          colorChanges.push(0);
          if(colorChanges.length == 1) {
            // need at least 1 entry, just set it for first color
            colorChanges.push(this.frames[previousFrameIndex].frameData.colorData[0]);
            colorChanges.push(0);          
          }
    
          if(colorChanges.length < 240) {  
            colorFrameType = 2;
          }

        }

      }


      if(this.frames[frameIndex].canWriteAsRLE) {
        // need to work out optimal value..

        if(charFrameType == 1 && charRLE.length < 600 && charRLE.length != 0) {//charData.length) {
          charFrameType = 3;
        }
      }

      if(scrolling) {
        // scrolling needs all the data
        charFrameType = 1;
        colorFrameType = 1;
      }

      var duration = inputData[frame].duration;

      if(duration > 255) {
        duration = 255;    
      }

      if(duration < 7) {
        duration = 7;
      }

      var frameData = {
        charFrameType:  charFrameType,          // full frame
        colorFrameType: colorFrameType,          // color type
        duration: duration,
        charData:  charData,
        charChangesData: charChanges,
        charRLEData: charRLE,
        colorData: colorData,
        colorChangesData: colorChanges,

        bgColor1: this.extendedColorBGColors[0].color,
        bgColor2: this.extendedColorBGColors[1].color,
        bgColor3: this.extendedColorBGColors[2].color,
        bgColor4: this.extendedColorBGColors[3].color
      };
//      framesData.push(frameData);
      this.frames[frameIndex].frameData = frameData;
    }


    // ------------------------------------------------------0     write char data

    var customCharsIndex = 0x3800 - 0x801 + 2;
    var customCharsLength = 2048;
    if(extendedColorMode) {
      customCharsLength = this.extendedColorCharsetData.length;
    }


    var index = dataStartAddress;
    var frameTableIndex = framePtrTableAddr;

    var framesExported = 0;

    var nextColorDataPosition = false;


    // write out the data -------------------------------------
    for(var i = 0; i < this.frames.length; i++) {


      var frameData = this.frames[i].frameData;

      var frameMapData = [];
      var frameColorData = [];

      // length should be the smaller length of the data type...

      var charDataLength = frameData.charData.length;
      var colorDataLength = frameData.colorData.length;
      if(frameData.colorFrameType == 2) {
        colorDataLength = frameData.colorChangesData.length;
      }

      var foundLocation = false;
      while(!foundLocation) {
        foundLocation = true;
        for(var j = 0; j < blocks.length; j++) {
          if( (index + 0x801 - 2) < blocks[j].end && (index + charDataLength + 0x801 - 2) >= blocks[j].start) {

            // overlaps with this block, start search from end of block
            foundLocation = false;
            index = blocks[j].end -0x801 + 2;


//            var location = index +0x801-2;


          }
        }
      }

//      var location = index +0x801-2;

      if(index + charDataLength + colorDataLength > 0xd000 - 0x801) {

        // reached IO memory, cant go further
        break;
      }

/*
      if(customTileSet) {
        // dont want to write over the custom charset
        if(index < customCharsIndex && index + charDataLength > customCharsIndex) {
          index = customCharsIndex + customCharsLength;
        }
      }
*/

      var charDataAddress = index;


      var dataFrom = index;

      if(frameData.charFrameType == 1) {
        for(var j = 0; j < frameData.charData.length; j++) {
          data[index++] = frameData.charData[j]; 
          frameMapData.push(frameData.charData[j]);
        }
      } else if(frameData.charFrameType == 2) {

        for(var j = 0; j < frameData.charChangesData.length; j++) {
          data[index++] = frameData.charChangesData[j]; 
          frameMapData.push(frameData.charChangesData[j]);
        }  
      } else if(frameData.charFrameType == 3) {
        for(var j = 0; j < frameData.charRLEData.length; j++) {
          data[index++] = frameData.charRLEData[j]; 
          frameMapData.push(frameData.charRLEData[j]);
        }  

      } else {
        alert('???');
      }

      var dataTo = index;
      memoryMap.push( { "type": "Frame Data", "from": dataFrom, "to": dataTo });

      blocks.push({"type": "Frame " + i + " Char Data", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})

      var frameMapDataAsm = 'FRAME_' + i + '_MAP\n';
      frameMapDataAsm += this.formatBytes(frameMapData);

      this.files.push({
        id: this.files.length + 1,
        name: 'frame_' + i + '_map.asm',
        content: frameMapDataAsm,
        filePath: 'data/frame_' + i + '_map.asm',
        type: 'asm'
      });

      frameFilesAsm += '!source "data/frame_' + i + '_map.asm"\n';
  
/*
      // write color data
      if(customTileSet) {
        // dont want to write over the custom charset
        if(index < customCharsIndex && index + frameData.colorData.length > customCharsIndex) {
          index = customCharsIndex + customCharsLength;
        }
      }
*/
      var colorDataAddress = index;
      var colorData4Bit = false;

      if(!scrolling) {
        colorData4Bit = true;
      }

      if(isPETSCIISingle && !hasSID) {
        colorData4Bit = false;
      }


      frameColorData = [];

      if(frameData.colorFrameType == 1) {

        if(nextColorDataPosition !== false && colorData4Bit) {

          // interleavinv 4 bit color data
          var dataFrom = nextColorDataPosition;
          colorDataAddress = nextColorDataPosition;
          for(var j = 0; j < frameData.colorData.length; j++) {
            data[nextColorDataPosition] = frameData.colorData[j];

            j++;
            data[nextColorDataPosition] = data[nextColorDataPosition] | (frameData.colorData[j] << 4);

            frameColorData.push(data[nextColorDataPosition]);
            frameColorData.push(0);

            nextColorDataPosition += 2;
          }

          var dataTo = nextColorDataPosition;
          blocks.push({"type": "Frame " + i + " Color Data (4 bit)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})

          // next time color data needs to be a new block
          nextColorDataPosition = false;
        } else {

          // find where to put the color data
          var foundLocation = false;
          while(!foundLocation) {
            foundLocation = true;
            for(var j = 0; j < blocks.length; j++) {
              if( (index + 0x801 - 2) < blocks[j].end && (index + colorDataLength + 1 + 0x801 - 2) >= blocks[j].start) {
                foundLocation = false;
                index = blocks[j].end - 0x801 + 2;
              }
            }
          }


          colorDataAddress = index;
          var dataFrom = index;          

          if(colorData4Bit) {

            for(var j = 0; j < frameData.colorData.length; j++) {
              data[index] = frameData.colorData[j];

              j++;
              data[index] = data[index] | (frameData.colorData[j] << 4);

              frameColorData.push(data[index]);
              frameColorData.push(0);

              index += 2;
            }
            // next color block will end one after this one..
            index++;
          } else {
            for(var j = 0; j < frameData.colorData.length; j++) {
              data[index++] = frameData.colorData[j];
              frameColorData.push(frameData.colorData[j]);
            }
            index++;

          }



          var dataTo = index;
          memoryMap.push({ "type": "Frame Color Data", "from": dataFrom, "to": dataTo });

          nextColorDataPosition = colorDataAddress + 1;
          blocks.push({"type": "Frame " + i + " Color Data (4 bit)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})
        }


      } else if(frameData.colorFrameType == 2) {


        // find where to put the color data
        var foundLocation = false;
        while(!foundLocation) {
          foundLocation = true;
          for(var j = 0; j < blocks.length; j++) {
            if( (index + 0x801 - 2) < blocks[j].end && (index + colorDataLength + 1 + 0x801 - 2) >= blocks[j].start) {
              foundLocation = false;
              index = blocks[j].end - 0x801 + 2;
            }
          }
        }

        colorDataAddress = index;
        var dataFrom = index;          

        for(var j = 0; j < frameData.colorChangesData.length; j++) {
          data[index++] = frameData.colorChangesData[j];
          frameColorData.push(frameData.colorChangesData[j]);
        }        

        var dataTo = index;
        memoryMap.push({ "type": "Frame Color Data", "from": dataFrom, "to": dataTo });
        blocks.push({"type": "Frame " + i + " Color Data (changes)", "start": dataFrom + 0x801 - 2, "end": dataTo + 0x801 - 2})


      } else {
        alert('???');
      }

      var frameColorDataAsm = 'FRAME_' + i + '_COLORS\n';
      frameColorDataAsm += this.formatBytes(frameColorData);

      this.files.push({
        id: this.files.length + 1,
        name: 'frame_' + i + '_colors.asm',
        content: frameColorDataAsm,
        filePath: 'data/frame_' + i + '_colors.asm',
        type: 'asm'
      });

      frameFilesAsm += '!source "data/frame_' + i + '_colors.asm"\n';
      framesExported++;

      this.frames[i].charAddress = (charDataAddress + 0x0801 - 2);
      this.frames[i].colorAddress = (colorDataAddress + 0x0801 - 2) ;

/*
      // char data entry
      data[frameTableIndex++] = framesData[i].charFrameType;
      // char data addr low
      data[frameTableIndex++] = (charDataAddress + 0x0801 - 2) & 0xff;
      // char data addr high
      data[frameTableIndex++] = (charDataAddress + 0x0801 - 2) >> 8;
      // char data addr duration
      data[frameTableIndex++] = framesData[i].duration;

      // color data entry
      data[frameTableIndex++] = framesData[i].colorFrameType;
      // color data addr low
      data[frameTableIndex++] = (colorDataAddress + 0x0801 - 2) & 0xff;
      // color data addr high
      data[frameTableIndex++] = (colorDataAddress + 0x0801 - 2)  >> 8;

      data[frameTableIndex++] = framesData[i].bgColor1;
      data[frameTableIndex++] = framesData[i].bgColor2;
      data[frameTableIndex++] = framesData[i].bgColor3;
      data[frameTableIndex++] = framesData[i].bgColor4;

*/
      var frameTableAddr = frameTableIndex + 0x801 - 2;


    }


    var dataFrom = frameTableIndex;

    var rowOffset = [];
    rowOffset[0] = 0;

    var firstFrame = true;
    var keyTableIndex = false;
    var instrTableIndex = false;

    console.log('frame table index = ' + frameTableIndex);

    frameTableAsm = '';
    frameTableAsm += 'FRAMETABLE\n';

    for(var i = 0; i < this.entries.length; i++) {
      var row = i + 1;
      rowOffset[row] = frameTableIndex;
      frameTableAsm += 'FRAMETABLE_ROW_' + row + '\n';

      if(this.entries[i].type == 'frame') {
        var frame = parseInt(this.entries[i].frame);
        for(var j = 0; j < this.frames.length; j++) {
          
          if(this.frames[j].frame == frame) {
            frameCount++;

            var frameData = this.frames[j].frameData;

            var duration = parseInt(this.entries[i].duration);
            if(duration < 6) {
              duration = 6;
            }
            if(duration > 255) {
              duration = 255;
            }


            console.log('char frame type = ' + frameData.charFrameType);

            // char data entry
            data[frameTableIndex++] = frameData.charFrameType;
            // char data addr low
            data[frameTableIndex++] = this.frames[j].charAddress & 0xff;
            // char data addr high
            data[frameTableIndex++] = this.frames[j].charAddress >> 8;
            // char data addr duration
            data[frameTableIndex++] = duration;

            // color data entry
            data[frameTableIndex++] = frameData.colorFrameType;
            // color data addr low
            data[frameTableIndex++] = this.frames[j].colorAddress & 0xff;
            // color data addr high
            data[frameTableIndex++] = this.frames[j].colorAddress >> 8;

            data[frameTableIndex++] = frameData.bgColor1;
            data[frameTableIndex++] = frameData.bgColor2;
            data[frameTableIndex++] = frameData.bgColor3;
            data[frameTableIndex++] = frameData.bgColor4;

            
            frameTableAsm += '!byte ';
            frameTableAsm += '$' + this.toHex(frameData.charFrameType) + ',';
            frameTableAsm += '<FRAME_' + j + '_MAP,';
            frameTableAsm += '>FRAME_' + j + '_MAP,';
            frameTableAsm += '$' + this.toHex(duration) + ',';

            frameTableAsm += '$' + this.toHex(frameData.colorFrameType) + ',';
            frameTableAsm += '<FRAME_' + j + '_COLORS,';
            frameTableAsm += '>FRAME_' + j + '_COLORS,';


            firstFrameBGColor = frameData.bgColor1;
            frameTableAsm += '$' + this.toHex(frameData.bgColor1) + ',';
            frameTableAsm += '$' + this.toHex(frameData.bgColor2) + ',';
            frameTableAsm += '$' + this.toHex(frameData.bgColor3) + ',';
            frameTableAsm += '$' + this.toHex(frameData.bgColor4) + ',';


            // effect

            if(firstFrame && this.keyTriggers.length > 0) {
              data[frameTableIndex++] = 1; // turn on key triggers
              keyTableIndex = frameTableIndex;
              data[frameTableIndex++] = 0; // key trigger table low
              data[frameTableIndex++] = 0; // key trigger table high
            }

            if(firstFrame && this.instrTriggers.length > 0) {
              data[frameTableIndex++] = 3; // turn on instr triggers
              instrTableIndex = frameTableIndex;
              data[frameTableIndex++] = 0; // instr trigger table low
              data[frameTableIndex++] = 0; // instr trigger table high
            }


            firstFrame = false;
            data[frameTableIndex++] = 0;

            frameTableAsm += '$' + this.toHex(0) + '\n';

          }
        }
      } else if(this.entries[i].type == 'frameRange') {
        var from = this.entries[i].from;
        var to = this.entries[i].to;
        var found = false;

        var direction = 1;
        if(to < from) {
          direction = -1;
        }

//        for(var frame = from; frame <= to; frame++) {
        for(var frame = from; frame != (to + direction); frame += direction) {
          for(var j = 0; j < this.frames.length; j++) {
            if(this.frames[j].frame == frame) {
              frameCount++;

              var startFrame = frameTableIndex;

              var frameData = this.frames[j].frameData;
              // char data entry
              data[frameTableIndex++] = frameData.charFrameType;
              // char data addr low
              data[frameTableIndex++] = this.frames[j].charAddress & 0xff;
              // char data addr high
              data[frameTableIndex++] = this.frames[j].charAddress >> 8;
              // char data addr duration
              data[frameTableIndex++] = frameData.duration;

              // color data entry
              data[frameTableIndex++] = frameData.colorFrameType;
              // color data addr low
              data[frameTableIndex++] = this.frames[j].colorAddress & 0xff;
              // color data addr high
              data[frameTableIndex++] = this.frames[j].colorAddress >> 8;

              
              data[frameTableIndex++] = frameData.bgColor1;
              data[frameTableIndex++] = frameData.bgColor2;
              data[frameTableIndex++] = frameData.bgColor3;
              data[frameTableIndex++] = frameData.bgColor4;
            // effect
            
              frameTableAsm += '!byte ';
              frameTableAsm += '$' + this.toHex(frameData.charFrameType) + ',';
              frameTableAsm += '<FRAME_' + j + '_MAP,';
              frameTableAsm += '>FRAME_' + j + '_MAP,';
              frameTableAsm += '$' + this.toHex(duration) + ',';

              frameTableAsm += '$' + this.toHex(frameData.colorFrameType) + ',';
              frameTableAsm += '<FRAME_' + j + '_COLORS,';
              frameTableAsm += '>FRAME_' + j + '_COLORS,';

              firstFrameBGColor = frameData.bgColor1;
              frameTableAsm += '$' + this.toHex(frameData.bgColor1) + ',';
              frameTableAsm += '$' + this.toHex(frameData.bgColor2) + ',';
              frameTableAsm += '$' + this.toHex(frameData.bgColor3) + ',';
              frameTableAsm += '$' + this.toHex(frameData.bgColor4) + ',';

              if(firstFrame && this.keyTriggers.length > 0) {
                data[frameTableIndex++] = 1; // turn on key triggers
                keyTableIndex = frameTableIndex;
                data[frameTableIndex++] = 0; // key trigger table low
                data[frameTableIndex++] = 0; // key trigger table high
              }

              if(firstFrame && this.instrTriggers.length > 0) {

                data[frameTableIndex++] = 3; // turn on instr triggers
                instrTableIndex = frameTableIndex;
                data[frameTableIndex++] = 0; // instr trigger table low
                data[frameTableIndex++] = 0; // instr trigger table high
              }


              firstFrame = false;


              data[frameTableIndex++] = 0;
              frameTableAsm += '$' + this.toHex(0) + '\n';

              var endFrame = frameTableIndex;
              break;
            }
          }
        }
      } else if(this.entries[i].type == 'frameJump') {
        var jumpTo = this.entries[i].jumpTo;
        var frameTableAddress = rowOffset[jumpTo] + 0x0801 - 2;
        data[frameTableIndex++] = 0;
        data[frameTableIndex++] = (frameTableAddress) & 0xff;
        data[frameTableIndex++] = (frameTableAddress) >> 8;

        frameTableAsm += '!byte ';
        frameTableAsm += '$' + this.toHex(0) + ',';
        frameTableAsm += '<FRAMETABLE_ROW_' + jumpTo + ',';
        frameTableAsm += '>FRAMETABLE_ROW_' + jumpTo + '\n';
      }
    }

    data[frameTableIndex++] = 0;

    // then the address of the frame to loop to
    data[frameTableIndex++] = (framePtrTableAddr + 0x0801 - 2) & 0xff;
    data[frameTableIndex++] = (framePtrTableAddr + 0x0801 - 2) >> 8;

    frameTableAsm += '!byte ';
    frameTableAsm += '$' + this.toHex(0) + ',';
    frameTableAsm += '<FRAMETABLE_ROW_1,';
    frameTableAsm += '>FRAMETABLE_ROW_1\n';

    // write the trigger table...
    //var this.keyTriggers = this.this.keyTriggers;
    if(this.keyTriggers.length > 0) {
      // need to write in trigger table
      var keyTriggerTableAddr = frameTableIndex + 0x801 - 2;
      data[keyTableIndex++] = keyTriggerTableAddr & 0xff;
      data[keyTableIndex] = keyTriggerTableAddr >> 8;

    }
    for(var i = 0; i < this.keyTriggers.length; i++) {
      var gotoRow = this.keyTriggers[i].gotoRow;
      var frameTableAddress = rowOffset[gotoRow] + 0x0801 - 2;

      var keyCode = this.keyTriggers[i].triggerKey.toLowerCase();
      data[frameTableIndex++] = this.keymap[keyCode];

      if(this.keyTriggers[i].action == 'gotorow') {
        data[frameTableIndex++] = 0;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(this.keyTriggers[i].action == 'nextframe') {
        data[frameTableIndex++] = 1;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(this.keyTriggers[i].action =='changecharset') {
        data[frameTableIndex++] = 2;//action;
        var charsetID = this.keyTriggers[i].charsetID;

        data[frameTableIndex++] = this.editor.tileSets[charsetID].memoryLocation;//4;//frameTableAddress & 0xff;   // should put the charset to change to
        data[frameTableIndex++] = frameTableAddress >>8;;     // should put the ticks to change
      } else {
        // custom effect

        var effectIndex = parseInt(this.keyTriggers[i].action);
        if(!isNaN(effectIndex)) {
          effectIndex += 4;
          data[frameTableIndex++] = effectIndex;
          data[frameTableIndex++] = 0;
          data[frameTableIndex++] = 0;

        } else {
          alert('unknown effect ' + this.keyTriggers[i].action);
        }
      }
      
    }

    // write the trigger table...
    //var this.instrTriggers = this.this.instrTriggers;
    if(this.instrTriggers.length > 0) {
      // need to write in trigger table
      var instrTriggerTableAddr = frameTableIndex + 0x801 - 2;
      data[instrTableIndex++] = instrTriggerTableAddr & 0xff;
      data[instrTableIndex] = instrTriggerTableAddr >> 8;

    }
    for(var i = 0; i < this.instrTriggers.length; i++) {
      var gotoRow = this.instrTriggers[i].gotoRow;
      var frameTableAddress = rowOffset[gotoRow] + 0x0801 - 2;

      var instrCode = parseInt(this.instrTriggers[i].triggerInstr);

      data[frameTableIndex++] = instrCode;

      if(this.instrTriggers[i].action == 'gotorow') {
        data[frameTableIndex++] = 0;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;;
      } else if(this.instrTriggers[i].action == 'nextframe') {
        data[frameTableIndex++] = 1;//action;
        data[frameTableIndex++] = frameTableAddress & 0xff;
        data[frameTableIndex++] = frameTableAddress >>8;
      } else if(this.instrTriggers[i].action == 'changecharset') {

        var charsetID = this.instrTriggers[i].charsetID;
        data[frameTableIndex++] = 2;//action;
        data[frameTableIndex++] = this.editor.tileSets[charsetID].memoryLocation;//4;//frameTableAddress & 0xff;   // should put the charset to change to
        data[frameTableIndex++] = frameTableAddress >>8;;     // should put ticks
      } else {

        var effectIndex = parseInt(this.instrTriggers[i].action);
        if(!isNaN(effectIndex)) {
          effectIndex += 4;
          data[frameTableIndex++] = effectIndex;
          data[frameTableIndex++] = 0;
          data[frameTableIndex++] = 0;

        } else {
          alert('unknown effect ' + this.instrTriggers[i].action);
        }

      }
      
    }

    data[frameTableIndex++] = 0;  // end

    frameTableAsm += '!byte ';
    frameTableAsm += '$' + this.toHex(0) + '\n';


    var dataTo = frameTableIndex;
    memoryMap.push({ "type": "Frame Table Data", "from": dataFrom, "to": dataTo });

    // copy data into uintarray and download
    var length = index + 0x801 - 2;

    if(customTileSet) {
      // custom char set is 2k from 0x3800, must include this...
      // TODO: shift it if it can fit?
      var charSetEnd = 0x3800 + 2 - 0x0801 + 2048;
      if(length < charSetEnd) {
        length = charSetEnd;
      }

    }


    memoryMap.sort(function(a, b) {
      return a.from - b.from;
    });


    blocks.sort(function(a, b) {
      return a.start - b.start;
    });

    var memoryLayout = '<table>';
    memoryLayout += '<tr><th>Start</th><th>End</th><th>Bytes</th><th>Contents</th></tr>';
    for(var i = 0; i < blocks.length; i++) {

      if(blocks[i].end > length) {
        length = blocks[i].end;
      }
      memoryLayout += '<tr>';
      var start = ("0000" + blocks[i].start.toString(16)).substr(-4);
      var end = ("0000" + blocks[i].end.toString(16)).substr(-4);
      var bytes = blocks[i].end - blocks[i].start;

      memoryLayout += '<td style="text-align: right">';
      memoryLayout += start;
      memoryLayout += '</td>';
      memoryLayout += '<td style="text-align: right">';
      memoryLayout += end;
      memoryLayout += '</td>';
      memoryLayout += '<td style="text-align: right">';
      memoryLayout += bytes;
      memoryLayout += '</td>';
      memoryLayout += '<td>';
      memoryLayout += blocks[i].type;
      if(blocks[i].type == 'Code' && typeof blocks[i].label != 'undefined') {
        memoryLayout += ' (' + blocks[i].label + ')';
      }

      memoryLayout += '</td>';

    }
    memoryLayout += '</table>'

    $('#exportPRGAdvMemory').html(memoryLayout);


    console.log("FRAME COUNT = " + frameCount);
    
    initAsm += '\n';
    initAsm += '; border colour\n';
    initAsm += '  lda #' + this.getC64Color(borderColor) + '\n';;
    initAsm += '  sta $d020' + '\n';

    if(isPETSCIISingle && !hasSID) {
      initAsm += '; background colour\n';
      initAsm += '  lda #' + this.getC64Color(firstFrameBGColor) + '\n';
      initAsm += '  sta $d021' + '\n';  
    }

    if(!multicolorMode) {
      initAsm += '; turn multicolour mode off\n';
      initAsm += '  lda #%00001000\n';
      initAsm += '  sta $d016\n';
    }
    if(extendedColorMode) {
      data[configPos++] = 1;

      initAsm += '; turn ecm on\n';
      initAsm += '  lda #%01011011\n';
      initAsm += '  sta $d011\n';
    } else if(multicolorMode) {
      data[configPos++] = 2;
      initAsm += '; turn multicolour mode on\n';
      initAsm += '  lda #%00011000\n';
      initAsm += '  sta $d016\n';
    } else {
      data[configPos++] = 0;      
    }

    initAsm += '\n';

    if(!isPETSCIISingle) {
      initAsm += 'select_vic_bank\n';
      initAsm += '  lda $dd00\n';
      initAsm += '  and #%11111100\n';
      initAsm += '  ora #VIC_BANK\n'; 
      initAsm += '  sta $dd00\n\n';
      
      initAsm += 'setup_character_memory\n';
      //  ; bits 1-3 are pointer to character memory
      initAsm += '  lda $d018\n';
      initAsm += '  and #%11110001\n';
      initAsm += '  ora #CHARSET_POINTER\n';
      initAsm += '  sta $d018\n';

      initAsm += '\nsetup_screen\n';
      //; set the screen location to 0400    xxx1 xxxx
      initAsm += '  lda $d018\n';
      initAsm += '  and #$0f\n';
      initAsm += '  ora #SCREEN_MEMORY_1\n';
      initAsm += '  sta $d018\n';
    }
  
    if(!isPETSCIISingle) {
      // if multiple frames then need front/back buffer
      //; front buffer is 0400, back buffer is 0800
      initAsm += '  lda #SCREEN_BUFFER_1\n';
      initAsm += '  sta front_buffer_high\n';
      initAsm += '  lda #SCREEN_BUFFER_2\n';
      initAsm += '  sta back_buffer_high\n';
    }

    initAsm += '\n';


    if(!isPETSCIISingle) {
      initAsm += '; setup the interrupt routine\n';
      initAsm += '; irq in asm/player.asm is called once per frame\n';
      initAsm += '  sei\n';
      initAsm += '!source "asm/setupinterrupts.asm"\n';
      
      initAsm += '; copy charset into the correct place\n';
      initAsm += '  jsr copy_charset\n';
      
      initAsm += '; load first frame into back buffer\n';
      initAsm += '  lda #<FRAMETABLE\n';
      initAsm += '  sta frame_ptr_low\n';
      initAsm += '  lda #>FRAMETABLE\n';
      initAsm += '  sta frame_ptr_high\n';
      
      initAsm += '  jsr get_next_frame_info\n';
      initAsm += '  jsr tick4\n';
      initAsm += '  lda #$01\n';
      initAsm += '  sta delay_counter\n';
      
      if(hasSID) {
        initAsm += '\n; init sid\n';
  
        initAsm += '  jsr SID_INIT_ADDRESS\n';
        //$' + ('0000' + this.sidInitAddr.toString(16)).substr(-4);
      }
  
      initAsm += '; reenable interrupts\n';
      initAsm += '  cli\n';
    } else {
      // one frame, so just need to copy the data and then loop forever..

      if(hasSID) {
        initAsm += '  sei\n';
        initAsm += '!source "asm/setupinterrupts.asm"\n';        
        initAsm += '; reenable interrupts\n';
        initAsm += '  cli\n';        
      }

      initAsm += '  ldx #0\n';
      initAsm += 'copy_data\n';
      initAsm += '  lda FRAME_0_MAP,x\n';
      initAsm += '  sta $400,x\n';
      initAsm += '  lda FRAME_0_MAP + $100,x\n';
      initAsm += '  sta $400 + $100,x\n';
      initAsm += '  lda FRAME_0_MAP + $200,x\n';
      initAsm += '  sta $400 + $200,x\n';
      initAsm += '  lda FRAME_0_MAP + $2e8,x\n';
      initAsm += '  sta $400 + $2e8,x\n';
      
      initAsm += '  lda FRAME_0_COLORS,x\n';
      initAsm += '  sta $d800,x\n';
      initAsm += '  lda FRAME_0_COLORS + $100,x\n';
      initAsm += '  sta $d800 + $100,x\n';
      initAsm += '  lda FRAME_0_COLORS + $200,x\n';
      initAsm += '  sta $d800 + $200,x\n';
      initAsm += '  lda FRAME_0_COLORS + $2e8,x\n';
      initAsm += '  sta $d800 + $2e8,x\n';
      initAsm += '  dex\n';
      initAsm += '  bne copy_data\n';

        
//      initAsm += '; copy charset into the correct place\n';
//      initAsm += '  jsr copy_charset\n';
    }
    
    initAsm += '; loop forever	\n';
    initAsm += 'loop\n';
    initAsm += '  jmp loop\n';
    
    if(!isPETSCIISingle) {
      initAsm += 'nmi\n';
      initAsm += '  rti\n';
    }
    

    if(!isPETSCIISingle) {
      mainAsm += '!source "asm/zeropage.asm"\n\n';
    }

    if(!isPETSCIISingle) {
      mainAsm += '; constants\n';
      mainAsm += 'VIC_BANK = $0\n';
      mainAsm += '; high byte of screen buffers\n';
      mainAsm += 'SCREEN_BUFFER_1 = $c0\n';
      mainAsm += 'SCREEN_BUFFER_2 = $c4\n';

      mainAsm += '; pointers to screen buffers\n';
      mainAsm += 'SCREEN_MEMORY_1 = $00\n';
      mainAsm += 'SCREEN_MEMORY_2 = $10\n';

      mainAsm += 'CHARSET_ADDRESS = $c800\n';
      mainAsm += 'CHARSET_POINTER = %00000010\n';

      if(hasSID) {
        mainAsm += 'SID_INIT_ADDRESS = $' + ('0000' + this.sidInitAddr.toString(16)).substr(-4) + '\n';
        mainAsm += 'SID_PLAY_ADDRESS = $' + ('0000' + this.sidPlayAddr.toString(16)).substr(-4) + '\n';;
      }
    }



    mainAsm += '\n';
    mainAsm += '*=$801\n';
    mainAsm += 'basic_start_code\n';
    mainAsm += '!byte    $0B, $08, $0A, $00, $9E, $32, $30, $38, $30, $00, $00, $00\n';
    mainAsm += '\n*=$0820\n';
    mainAsm += '  jmp start\n';

    mainAsm += '\n*=$0823 ; set this to whereever code should start..\n';
    mainAsm += 'start';
    mainAsm += initAsm;
    mainAsm += '\n';


    if(!isPETSCIISingle) {
      mainAsm += '!source "asm/copycharset.asm"\n';
      mainAsm += '!source "asm/player.asm"\n';

      mainAsm += '!source "asm/copydata.asm";\n';
      mainAsm += '!source "asm/displaynextframe.asm"\n';
      mainAsm += '!source "asm/getframeinfo.asm"\n';
      
      mainAsm += '!source "asm/playframes.asm"\n';
      mainAsm += '!source "asm/animatedchars.asm"\n';
      
    }

    if(isPETSCIISingle && hasSID) {
      mainAsm += 'irq\n';
      mainAsm += '  rti\n';
    }


    

    if(this.sidData) {
      let sidAddressHex = ('0000' + this.sidLoadAddr.toString(16)).substr(-4);
      let sidEndAddressHex = ('0000' + this.sidEndAddress.toString(16)).substr(-4);

      mainAsm += '\n; sid file ' + this.sidLength + ' bytes ($' + sidAddressHex + ' - $' + sidEndAddressHex + ')\n';
      mainAsm += '*=$' + sidAddressHex + '\n';
      mainAsm += '!binary "data/sid.bin"\n';
    }

    if(!isPETSCIISingle) {
      mainAsm += '\n';
      mainAsm += '!source "data/frameTable.asm"\n';
      
      mainAsm += '!source "data/animatedCharsTable.asm"\n';
      mainAsm += '!source "data/animatedCharsData.asm"\n';

      mainAsm += '!source "data/charset.asm"\n';
    }

    mainAsm += frameFilesAsm;

    
    this.files.push({
      id: this.files.length + 1,
      name: 'main.asm',
      content: mainAsm,
      filePath: 'main.asm',
      type: 'asm'
    });

    /*
    this.files.push({
      id: this.files.length + 1,
      name: 'init.asm',
      content: initAsm,
      filePath: 'init.asm',
      type: 'asm'
    });
    */


    this.files.push({
      id: this.files.length + 1,
      name: 'charset.asm',
      content: charsetAsm,
      filePath: 'data/charset.asm',
      type: 'asm'
    });


    if(!isPETSCIISingle) {
      this.files.push({
        id: this.files.length + 1,
        name: 'animatedCharsTable.asm',
        content: animatedTileTableAsm,
        filePath: 'data/animatedCharsTable.asm',
        type: 'asm'
      });

      this.files.push({
        id: this.files.length + 1,
        name: 'animatedCharsData.asm',
        content: animatedTileDataAsm,
        filePath: 'data/animatedCharsData.asm',
        type: 'asm'
      });

      this.files.push({
        id: this.files.length + 1,
        name: 'frameTable.asm',
        content: frameTableAsm,
        filePath: 'data/frameTable.asm',
        type: 'asm'
      });
    }


    this.addSourceFile('copycharset.asm');
    if(!isPETSCIISingle) {
      this.addSourceFile('copydata.asm');
      this.addSourceFile('animatedchars.asm');
      this.addSourceFile('displaynextframe.asm');
      this.addSourceFile('getframeinfo.asm');
      this.addSourceFile('player.asm');
      this.addSourceFile('playframes.asm');
      this.addSourceFile('setupinterrupts.asm');
      this.addSourceFile('zeropage.asm');    
    }
    //    this.addSourceFile('constants.asm');

    //    this.addSourceFile('init.asm');
    //    this.addSourceFile('keyboard.asm');
    //    this.addSourceFile('main.asm');
    //    this.addSourceFile('triggers.asm');


    length = length - 0x801 + 2;

    var output = new Uint8Array(length);  
    for(var i = 0; i < length; i++) {
      output[i] = data[i];
    }

    if(type != 'source') {
      this.assemble(args);
    } else {
      this.downloadZip();
    }



    return;

    if(downloadPRG) {

      var type = 'prg';
      if(typeof args.type != 'undefined') {
        type = args.type;
      }

      if(type == 'prg') {
        if(filename.indexOf('.prg') == -1) {
          filename += ".prg";
        }
        download(output, filename, "application/prg");   


        var data = new Uint8Array(12261);
        for(var i = 0; i < data.length; i++) {
          data[i] = output[i + 0x800];
        }
        download(data, 'data.bin', 'application/bin');

        
      } else {

        if(filename.indexOf('.d64') == -1) {
          filename += ".d64";
        }


        var d64 = new D64();
        d64.diskName = args.diskName;
        d64.addFile(args.prgName, output, "prg");

        d64.createD64(filename);
      }


    }

    console.log(blocks);

  },

  downloadZip: function() {
    console.log('download zip!');
    console.log(this.files);

    var zip = new JSZip();
    var zipFolders = {};

    var files = this.files
    var projectFilename = 'source';

    for(var i = 0; i < files.length; i++) {
      var type = 'file';
      var extension = '';
      var dotPos = files[i].filePath.lastIndexOf('.');
      if(dotPos != -1) {
        extension = files[i].filePath.substr(dotPos + 1);
      }

      if(extension == '' && files[i].content == '') {
        // prob a folder
        type = 'folder';
      }

      var path = files[i].filePath.split('/');
      var folderPath = '';
      var parentFolder = zip;

      var folderPathLength = path.length - 1;
      // only include last if its a folder
      if(type == 'folder') {
        folderPathLength++;
      }

      for(var j = 0; j < folderPathLength; j++) {
        if(j != 0) {
          folderPath += '/';
        }
        folderPath += path[j];

        if(typeof zipFolders[folderPath] == 'undefined') {
          parentFolder = parentFolder.folder(path[j]);
          zipFolders[folderPath] = parentFolder;
        } else {
          parentFolder = zipFolders[folderPath];
        }
      }

      // if its not a folder, add it to the zip
      if(type != 'folder') {
        var filename = path[path.length - 1];
        var extension = '';
        var pos = filename.lastIndexOf('.');
        if(pos !== -1) {
          extension = filename.substr(pos + 1).toLowerCase();
        }

        var content = '';
        if(extension == 'prg' || extension == 'bin') {
          // binary file..
          parentFolder.file(filename, files[i].content, { base64: true });
        } else {
          if(typeof files[i].content !== 'string') {
            content = JSON.stringify(files[i].content);
          } else {
            content = files[i].content;
          }
          parentFolder.file(filename, content);
        }
      }
    }

    zip.generateAsync({
      type:"blob" ,
      compression: "DEFLATE",
      compressionOptions: {
          level: 9
      }
      
    }).then(function (blob) {
      /*
      if(typeof callback != 'undefined') {
        callback(blob);
      }
      */
      console.log('download!!!');
      download(blob, projectFilename + ".zip", "application/zip");
    });   

  },

  assemble: function(args) {
    console.log('assemble');
    var sourceFiles = [];
/*
    sourceFiles.push({
      id: file.id,
      name: file.name,
      content: file.data,
      filePath: file.name,
      type: file.type
    });
*/
/*
    var fileId = 1;
    var fileName = 'main.asm';

    var fileContent = '';
    fileContent += '*=$801\n';
    fileContent += '!byte    $0B, $08, $0A, $00, $9E, $32, $30, $38, $30, $00, $00, $00\n';

    fileContent += '*=$810\n';
    fileContent += '  lda #00  \n'; 
    fileContent += '  sta $d020  ; border colour\n';
    fileContent += '  sta $d021  ; background colour\n';
    fileContent += 'loop\n';
    fileContent += ';  inc $d021    ; increase background colour\n';
    fileContent += '  jmp loop     ; loop forever\n';

    var fileType = 'asm';
    sourceFiles.push({
      id: fileId,
      name: fileName,
      content: fileContent,
      filePath: fileName,
      type: fileType
    });

*/
    /*
    // adding binary data
    var binData = new Uint8Array(e.target.result);
    var data = bufferToBase64(binData);
*/


//console.log(this.files);

    var filename = args.filename;

    g_app.assemblerEditor.assemble(function(results) {
//      console.log('done');
//      console.log(results);
      var filename = 'output.prg';

      if(filename.indexOf('.prg') == -1) {
        filename += ".prg";
      }
      download(results.prg, filename, "application/prg");   

    }, this.files);
  },

  assembleCode: function(code) {

    var frameWidth = this.editor.frames.width;
    var height = this.editor.frames.width;

    var verticalScrollMaxHigh = (((height - 24) * frameWidth) >> 8) & 0xff;
    var verticalScrollMaxLow = (((height - 24) * frameWidth) ) & 0xff;

    args = {};
    args['FRAMEWIDTHHIGH'] = '#0';
    args['FRAMEWIDTHLOW'] = '#' + frameWidth;
    args['VERTICALSCROLLMAXHIGH'] = '#' + verticalScrollMaxHigh;
    args['VERTICALSCROLLMAXLOW'] = '#' + verticalScrollMaxLow;

    for(var key in args) {
      if(args.hasOwnProperty(key)) {
        var value = args[key];
        code = code.replace(new RegExp(key, 'g'), value);
      }
    }


    var assembler = g_app.assembler;

    var result = assembler.assemble(code, 0x801);
    if(result.success) {


      var memory = assembler.getMemory();
      var index = 0;
      this.prg = [];
      this.prg[index++] = 0x01;
      this.prg[index++] = 0x08;

      for(var i = result.start; i < result.end; i++) {
        this.prg[index++] = memory[i];
      }

      this.blocks = result.blocks;

      var out = '';
      for(var i =0 ; i < this.prg.length; i++) {
        out += this.prg[i].toString(16) + "\n";
      }

      out = assembler.getDisassembly();

      $('#c64PRGCodeEditorResult').val(out);
    } else {
      var out = 'ERRORS FOUND:\n';
      for(var i = 0; i < result.errors.length; i++) {
        out += result.errors[i].message + "\n";
      }
      $('#c64PRGCodeEditorResult').val(out);
    }

  },  

  effectsCode: function() {

    var code = '';

    // effects init code
    for(var i = 0; i < this.effects.length; i++) {
      code += '  jsr effect' + i + '_init\n';
    }
    code += '  rts\n';

    // effects trigger code
    code += 'effects_trigger\n';
//    code += '  inc $d020\n';
    var effectIndex = 0;
    var nextEffectIndex = 0;
    for(var i = 0; i < this.effects.length; i++) {
      effectIndex = i + 4;
      nextEffectIndex = effectIndex + 1;
      code += 'effect_trigger_' + effectIndex + '\n';
      code += '  cmp #' + effectIndex + '\n';
      code += '  bne effect_trigger_' + nextEffectIndex + '\n';
      code += '  jmp effect' + i + '_trigger' + '\n';
    }

    code += 'effect_trigger_' + nextEffectIndex + '\n';
    code += '  rts\n';

    code += 'effects_tick\n';
    for(var i = 0; i < this.effects.length; i++) {
      code += ' jsr effect' + i + '_tick\n';
    }
    code += '  rts\n';

    for(var i = 0; i < this.effects.length; i++) {
      code += 'effect' + i + '_data\n';
      code += this.effects[i].data + "\n";
//      code += '  rts\n';


      code += 'effect' + i + '_init\n';
      code += this.effects[i].init + "\n";
      code += '  rts\n';

      code += 'effect' + i + '_trigger\n';
      code += this.effects[i].trigger + "\n";
      code += '  rts\n';

      code += 'effect' + i + '_tick\n';
      code += this.effects[i].tick + "\n";
      code += '  rts\n';

    }
    return code;
  },


  setSIDData: function(args) {
    console.log('set sid data');
    console.log(args);
    this.sidData = null;

    var music = args.music;
    if(typeof music == 'undefined') {
      music = 'no';
    }

    if(music != 'no' && music != 'sid') {
      var path = music;

      if(g_app.doc.getDocRecord(path) != null) {

        g_app.music.show(path);

        var sidStartAddress = 0x1000;

        this.sidHeaderLength = 0;
        this.sidLoadAddr = sidStartAddress;
        this.sidInitAddr = sidStartAddress;
        this.sidPlayAddr = sidStartAddress + 3; 
        this.sidSpeed = g_app.music.sidSpeed; 

        g_app.music.createSid();
        if(typeof g_app.music.musicPlayer2.songData != 'undefined' 
          && typeof g_app.music.musicPlayer2.songData.getSIDData != 'undefined') {
          
          this.sidData = g_app.music.musicPlayer2.songData.getSIDData();
        } else {
          alert('sorry, the current music play does not support sid data export');
          this.sidData = null;
        }
      }
    } 

    if(music == "no") {
      this.sidData = null;

    }

    if(music == "sid") {

      this.sidHeaderLength = 126;
      this.sidLoadAddr = args.sidLoadAddr;
      this.sidInitAddr = args.sidInitAddr;
      this.sidPlayAddr = args.sidPlayAddr; 
      this.sidSpeed = args.sidSpeed;
      
      if(this.sidSpeed < 1) {
        this.sidSpeed = 1;
      }
      this.sidData = args.sidData;
    }

  },



  // get the 4 most used bg colors
  getExtendedColorBGColors: function(args, framesToExport) {
    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    this.extendedColorBGColors = [];

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      // is in ecm mode..
      var frame = framesToExport[0];
      for(var i = 0; i < 4; i++) {
        // times used doesn't matter
        this.extendedColorBGColors.push({ "color": layer.getC64ECMColor(i, frame), "timesUsed": 10 });
      }
    } else {
      
      var gridWidth = args.gridWidth;
      var gridHeight = args.gridHeight;
      var frames = args.frames;

      var bgColors = [];
      for(var i = 0; i < 16; i++) {
        bgColors[i] = { "color": i, "timesUsed": 0 };
      }

      for(var frameIndex = 0; frameIndex < framesToExport.length; frameIndex++) {
        var frame = framesToExport[frameIndex];

        for(var y = 0; y < gridHeight; y++) {
          for(var x = 0; x < gridWidth; x++) {
            var color = 0;
            var cellData = layer.getCell({ x: x, y: y, frame: frame});
            color = cellData.bc;//frames[frame].frameData.data[z][gridHeight - 1 - y][x].bc;

            color = this.getC64Color(color);

            if(typeof color != 'undefined' && color !== false) {
              bgColors[color].timesUsed++;
            } else {
              if(frames[frame].frameData.bgColor < 16) {
                bgColors[frames[frame].frameData.bgColor].timesUsed++;
              }
            }
          }
        }      
      }

      bgColors.sort(function(a, b) {
        return b.timesUsed - a.timesUsed;
      });

      for(var i = 0; i < 4; i++) {
        this.extendedColorBGColors[i] = bgColors[i];
      }
    }
    return true;
  },

  getMostUsedCharacters: function(args, framesToExport) {
    var layer = this.editor.layers.getSelectedLayerObject();
    var tileSet = layer.getTileSet();
    var tileCount = tileSet.getTileCount();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    if(layer.getScreenMode() == TextModeEditor.Mode.C64ECM) {
      this.mostUsedCharacters = [];
      
      for(var i = 0; i < tileCount; i++) {
        this.mostUsedCharacters.push({ "c": i, "timesUsed": 0 });
      }
    } else {    

      this.mostUsedCharacters = [];
      for(var i = 0; i < tileCount; i++) {
        this.mostUsedCharacters.push({ "c": i, "timesUsed": 0 });
      }

      var z = 0;
      var gridWidth = args.gridWidth;
      var gridHeight = args.gridHeight;
      var frames = args.frames;

      for(var frameIndex = 0; frameIndex < framesToExport.length; frameIndex++) {
        var frame = framesToExport[frameIndex];

        for(var y = 0; y < gridHeight; y++) {
          for(var x = 0; x < gridWidth; x++) {
            var cellData = layer.getCell({ x: x, y: y, frame: frame});
  //          var c = frames[frame].frameData.data[0][gridHeight - 1 - y][x].t;
            var c = cellData.t;
            if(c < this.mostUsedCharacters.length) {
              this.mostUsedCharacters[c].timesUsed++;
            }
          }
        }      
      }

      this.mostUsedCharacters.sort(function(a, b) {
        return b.timesUsed - a.timesUsed;
      });
    }
  },


  getCharData: function(tileSet, char, frame) {
    var charData = [];

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();

    
    for(var y = 0; y < 8; y++) {
      var b = 0;
      for(var x = 0; x < 8; x++) {
        if(x < charWidth && y < charHeight) {
          if(tileSet.getPixel(char, x, y, frame)) {
            // set the bit
            b = b | (1 << (7-x));
          }
        }
      }
      charData.push(b);
    }

    return charData;
  },


  getCharsetData: function(tileSet) {

    var tileCount = tileSet.getTileCount();

    this.charsetData = [];
    // should work out what characters are used..

    this.charsetMap = [];

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = 0;
    }

    for(var i = 0; i < tileCount; i++) {
      var c = i;//this.mostUsedCharacters[i].c;

      if(tileCount > tileCount) {
        c = this.mostUsedCharacters[i].c;
        this.charsetMap[c] = i;  
      } else {
        this.charsetMap[i] = i;
      }
      for(var y = 0; y < 8; y++) {
        var b = 0;
        for(var x = 0; x < 8; x++) {
          if(x < charWidth && y < charHeight) {
            if(tileSet.getPixel(c, x, y)) {
              // set the bit
              b = b | (1 << (7-x));
            }
          }
        }
        this.charsetData.push(b);
      }
    }
  },

  getExtendedColorCharsetData: function(tileSet, index) {

    this.extendedColorCharsetData = [];
    this.charsetMap = [];

    var charWidth = tileSet.getTileWidth();
    var charHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();

    for(var i = 0; i < tileCount; i++) {
      this.charsetMap[i] = 0;
    }

    // extended color mode uses 64 chars
    for(var i = 0; i < 256; i++) {
      var c = this.mostUsedCharacters[i].c;
      this.charsetMap[c] = i;

      if(i < 64) {
        for(var y = 0; y < 8; y++) { 
          var b = 0;
          for(var x = 0; x < 8; x++) {
            if(x < charWidth && y < charHeight) {

              if(tileSet.getPixel(c, x, y)) {
                // set the bit
                b = b | (1 << (7-x));
              }
            }
          }
          this.extendedColorCharsetData.push(b);
        }
      }
    }
  },  


  // get the background color for the selected layer, if no colour, go down the layers
  getBackgroundColor: function(frame) {

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      return this.editor.colorPaletteManager.noColor;
    }

    var color = layer.getBackgroundColor(frame);
    if(color != this.editor.colorPaletteManager.noColor) {
      return color;
    }


    var layerIndex = this.editor.layers.getSelectedLayerIndex();
    while(layerIndex > 0) {
      layerIndex--;
      var layer = this.editor.layers.getLayerObjectFromIndex(layerIndex);

      if(layer && typeof layer.getBackgroundColor != 'undefined') {
        color = layer.getBackgroundColor(frame);
        if(color != this.editor.colorPaletteManager.noColor) {
          return color;
        }
      }
    }

    return this.editor.colorPaletteManager.noColor;
  },


  // get the background color for the selected layer, if no colour, go down the layers
  getBorderColor: function() {

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      return this.editor.colorPaletteManager.noColor;
    }

    var color = layer.getBorderColor();
    if(color != this.editor.colorPaletteManager.noColor) {
      return color;
    }


    var layerIndex = this.editor.layers.getSelectedLayerIndex();
    while(layerIndex > 0) {
      layerIndex--;
      var layer = this.editor.layers.getLayerObjectFromIndex(layerIndex);

      if(layer && typeof layer.getBorderColor != 'undefined') {
        color = layer.getBorderColor();
        if(color != this.editor.colorPaletteManager.noColor) {
          return color;
        }
      }
    }

    return this.editor.colorPaletteManager.noColor;
  },  

  createColorMap: function(colorPalette) {

    // work out if colours need to be converted..
    if(colorPalette.getColorCount() == 16) {      
      this.colorMap = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colorMap.push(i);
      }
    } else {
      
      // map colours to c64 colours
      this.colorMap = [];
      for(var i = 0; i < colorPalette.getColorCount(); i++) {
        this.colorMap.push(false);
      }
    }

    this.c64Colors = [];
    for(var i = 0; i < this.colorSchemes.vice.length; i++) {
      var color = {};
      color.hex = this.colorSchemes.vice[i];
      var r = (color.hex >> 16) & 255;
      var g = (color.hex >> 8) & 255;
      var b = color.hex & 255;  

      color.r = r / 255;
      color.g = g / 255;
      color.b = b / 255;

      var c = {};
      c.values = [r,g,b,255];

      color.hsv = Colour.converters[Colour.RGBA][Colour.HSVA](c);
      color.laba = Colour.converters[Colour.RGBA][Colour.LABA](c);
      this.c64Colors.push(color);
    }
  },

  getC64Color: function(index) {

    if(this.colorMap[index] !== false) {
      return this.colorMap[index];
    }

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    if(colorPalette.getIsC64Palette()) {
      // using the c64 palette, so no need to try to match..
      return index;
    }

    var color = colorPalette.getColor(index);

    // TODO: need to be calculating laba??
    if(typeof color.laba == 'undefined') {
      return index;
    }


    var c64Color = 0;
    var bestScore = false;


    for(var i = 0; i < this.c64Colors.length; i++) {
      var testScore = 0;

      testScore += Math.abs(color.laba.values[0] - this.c64Colors[i].laba.values[0]);
      testScore += Math.abs(color.laba.values[1] - this.c64Colors[i].laba.values[1]);
      testScore += Math.abs(color.laba.values[2] - this.c64Colors[i].laba.values[2]);

      if(bestScore === false || testScore < bestScore) {
        bestScore = testScore;
        c64Color = i;
      }

    }


    this.colorMap[index] = c64Color;
    return this.colorMap[index];

  },


  // return true if the frame is jumped to
  getIsJumpToFrame: function(frame) {
    var entries = this.entries;

    // find out if this frame is a jump to frame, 
    // check all the jump to frames
    for(var j = 0; j < entries.length; j++) {

      if(entries[j].type == 'frameJump') {
        var jumpTo = parseInt(entries[j].jumpTo) - 1;
        var jumpToFrame = 0;
        if(entries[jumpTo].type == 'frame') {
          jumpToFrame = entries[jumpTo].frame;
        } else if(entries[jumpTo].type == 'frameRange') {
          jumpToFrame = entries[jumpTo].from;
        }

        if(frame == jumpToFrame) {
          return true;
        }
      }
    }
    return false;
  },

  getIsTriggerJumpToFrame: function(frame) {
    var entries = this.entries;
    var keyTriggers = this.keyTriggers;
    var instrTriggers = this.instrTriggers;

    // check if any triggers go to this frame
    for(var j = 0; j < keyTriggers.length; j++) {
      if(keyTriggers[j].action == 'gotorow') {
        var gotoRow = parseInt(keyTriggers[j].gotoRow) - 1;
        var gotoFrame = 0;

        // find the first frame in the goto row
        if(entries[gotoRow].type == 'frame') {
          gotoFrame = entries[gotoRow].frame;
        } else if(entries[gotoRow].type == 'frameRange') {
          gotoFrame = entries[gotoRow].from;
        }

        // is trigger going to this row..
        if(frame == gotoFrame) {
          return true;
        }
      }
    }

    // check if any triggers go to this frame
    for(var j = 0; j < instrTriggers.length; j++) {
      if(instrTriggers[j].action == 'gotorow') {
        var gotoRow = parseInt(instrTriggers[j].gotoRow) - 1;
        var gotoFrame = 0;

        // find the first frame in the goto row
        if(entries[gotoRow].type == 'frame') {
          gotoFrame = entries[gotoRow].frame;
        } else if(entries[gotoRow].type == 'frameRange') {
          gotoFrame = entries[gotoRow].from;
        }

        // is trigger going to this row..
        if(frame == gotoFrame) {
          return true;
        }
      }

    }

    return false;

  },


  getNeededFrames: function() {
    // work out what frames are needed
    this.frames = [];
    this.framesToExport = [];

    // the previous frame displayed
    var previousFrame = -1;

    var entries = this.entries;

    for(var i = 0; i < entries.length; i++) {

      if(entries[i].type == 'frame') {

        // display a single frame
        var frame = parseInt(entries[i].frame);
        var found = false;
        var isJumpToFrame = this.getIsJumpToFrame(frame);
        var isTriggerJumpToFrame = this.getIsTriggerJumpToFrame(frame);

        if(isTriggerJumpToFrame) {
          isJumpToFrame = true;
        }

        for(var j = 0; j < this.frames.length; j++) {
          if(this.frames[j].frame == frame) {
            if(previousFrame != this.frames[j].previousFrame) {
              // frame has multiple frames before it, need to write data for whole frame
              this.frames[j].canWriteAsChanges = false;
            }
            found = true;
          }
        }

        if(!found) {
          this.frames.push(
            { 
              frame: frame, 
              previousFrame: previousFrame, 
              canWriteAsRLE: (!isJumpToFrame) & !(isTriggerJumpToFrame),  
              canWriteAsChanges: (previousFrame != -1) & !isJumpToFrame  
            }
          );
          this.framesToExport.push( (frame - 1) ) ;
        }

        previousFrame = frame;

      } else if(entries[i].type == 'frameRange') {

        // display a looping range of frames
        var from = parseInt(entries[i].from);
        var to = parseInt(entries[i].to);
        var direction = 1;
        if(to < from) {
          direction = -1;
        }

        for(var frame = from; frame != (to + direction); frame += direction) {
          var isJumpToFrame = this.getIsJumpToFrame(frame);
          var isTriggerJumpToFrame = this.getIsTriggerJumpToFrame(frame);

          if(isTriggerJumpToFrame) {
            isJumpToFrame = true;
          }

          var found = false;
          for(var j = 0; j < this.frames.length; j++) {
            if(this.frames[j].frame == frame) {
              if(previousFrame != this.frames[j].previousFrame) {
                // frame has multiple frames before it, need to write data for whole frame
                this.frames[j].canWriteAsChanges = false;
              }
              found = true;
            }
          }
          if(!found) {
            this.frames.push(
              { 
                frame: frame, 
                previousFrame: previousFrame,  
                canWriteAsRLE: (!isJumpToFrame) & !(isTriggerJumpToFrame),  
                canWriteAsChanges: (previousFrame != -1) & !isJumpToFrame  
              }
            );
            this.framesToExport.push( (frame - 1) );
          }

          previousFrame = frame;

        }
      }
    }
  },

  toHex: function(b) {
    if(typeof b != 'undefined') {
      return ("00" + b.toString(16)).substr(-2);   
    }

    return "00";

  },

  formatBytes: function(bytes, args) {
    var hex = true;//args.numberFormat != 'dec';

    var byteLabel = '!byte ';//this.getByteLabel(args);
    var lineEnding = '\n';//this.lineEnding;
    var column = 0;
    var columns = 16;

    /*
    if(typeof args.columns !== 'undefined') {
      columns = args.columns;
    }
    */

    var data = '';
    for(var i = 0; i < bytes.length; i++) {
      var b = bytes[i];
      if(column !== 0) {
        data += ',';
      } else {
        data += byteLabel;
      }

      if(hex) {
        data += '$';
        data += ("00" + b.toString(16)).substr(-2);   
      } else {
        data += b.toString(10);
      }
      column++;

      if(column == columns) {
        column = 0;
        data += lineEnding;
      }

    }
    return data;
  },  

}
