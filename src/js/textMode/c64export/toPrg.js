var ToPRG = function() {
  this.editor = null;

  this.sidData = null;
  this.sidLoadAddr = 0;
  this.sidInitAddr = 0;
  this.sidPlayAddr = 0;
  this.sidMultispeed = 0;

  this.mostUsedCharacters = [];

  this.charsetData = [];
  this.extendedColorCharsetData = [];
  this.extendedColorCharsetMap = [];
  this.extendedColorBGColors = [];

  this.prg = [];
  this.blocks = [];

  this.exportC64 = null;
}

ToPRG.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  start: function() {


    var toPrg = this;

    if(this.exportC64 == null) {
      this.exportC64 = new ExportC64();
      this.exportC64.init(this.editor);

    }

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "toPrgDialog", "title": "Export C64 PRG", "width": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/toPrg.html', function() {
        toPrg.initContent();
        toPrg.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        toPrg.exportPrg();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });


    } else {
      this.initContent();
    }

    UI.showDialog("toPrgDialog");
  },


  initContent: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();

    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    // check screen settings

    if(layer && layer.getType() == 'grid' && (layer.hasCellBackgroundColors() || layer.getMode() == TextModeEditor.Mode.C64ECM) ) {
      $('#exportPRGColorModeExtended').prop('checked', true);
    }
    var screenMode = this.editor.getScreenMode();
    if(screenMode == TextModeEditor.Mode.C64MULTICOLOR) {
      $('#exportPRGColorModeMulticolor').prop('checked', true);
    }


    $('#exportPRGAs').val(g_app.fileManager.filename);

    var frameCount = this.editor.graphic.getFrameCount();


    $('#exportPRGToFrame').val(frameCount);
    $('#exportPRGFromFrame').val(1);


    $('#exportPRGFromFrame').attr('max', frameCount);
    $('#exportPRGToFrame').attr('max', frameCount);

    var playMode = $('#playMode').val();
    if(playMode != 'once') {
      $('#exportPRGLoopType').val(playMode);
    } 

    this.editor.toPrg.sidData = null;
    clearInputFile(document.getElementById('exportPRGSIDFile'));
    $('#exportPRGSIDFileInfo').html('');

    this.monochromeColor = this.editor.currentTile.color;

    $('#exportPRGMonochromeColor').css('background-color', '#' + colorPalette.getHexString(this.monochromeColor));


    // get the music..
    var musicHTML = '';
    var musicDir = g_app.doc.dir('/music');
    var selectedMusic = $('#exportPRGMusic').val();
    if(typeof selectedMusic == 'undefined') {
      selectedMusic = false;
    }

    musicHTML += '<option value="no">No Music</option>';
    for(var i = 0; i < musicDir.length; i++) {
      var value = '/music/' + name;
      var name = musicDir[i].name;
      musicHTML += '<option value="/music/' + name + '"';
      if( (!selectedMusic && i == 0) || value == selectedMusic) {
        musicHTML += ' selected="selected" ';
      }
      musicHTML += '>' + musicDir[i].name + '</option>';

    }
    musicHTML += '<option value="sid">Use A SID File</option>';    
    $('#exportPRGMusic').html(musicHTML);
//    console.log("MUSIC:");
//    console.log(musicDir);
  },


  initEvents: function() {
    var _this = this;
    document.getElementById('exportPRGSIDFile').addEventListener("change", function(e) {
      var file = document.getElementById('exportPRGSIDFile').files[0];
      var url = window.URL || window.webkitURL;
      var src = url.createObjectURL(file);

      _this.selectSIDFile(file);
    });

    $('input[name=exportPRGColorMode]').on('click', function(event) {
      var val = $('input[name=exportPRGColorMode]:checked').val();
      if(val == 'monochrome') {
        $('#exportPRGMonochromeSection').show();
      } else {
        $('#exportPRGMonochromeSection').hide();
      }
    });

    $('#exportPRGMonochromeColor').on('click', function(event) {
      var args = {};
      args.colorPickedCallback = function(color) {
        var colorPalette = _this.editor.colorPaletteManager.getCurrentColorPalette();
        _this.monochromeColor = color;
        $('#exportPRGMonochromeColor').css('background-color', '#' + colorPalette.getHexString(color));
      }

      var x = event.pageX;
      var y = event.pageY;
      args.currentColor = _this.monochromeColor;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);
    });

    $('#exportPRGType').on('change', function(event) {
      var value = $(this).val();
      if(value == 'd64') {
        $('#exportPRGD64Options').show();
      } else {
        $('#exportPRGD64Options').hide();        
      }
    });

    $('#exportPRGMusic').on('change', function(event) {
      var value = $(this).val();
      if(value == 'sid') {
        $('#exportPRGSidFileSection').show();
      } else {
        $('#exportPRGSidFileSection').hide();
      }

    });


  },


  calculatePRGSize: function() {
    var fromFrame = 1;
    var toFrame = this.editor.graphic.getFrameCount();
    var details = this.saveAs('', fromFrame, toFrame, false, 0, false, false);
    var blocks = details.blocks;
    var bytesFree = 0;
    var lastBlockEnd = 4096;
    for(var i = 0; i < blocks.length; i++) {
      var difference = blocks[i].start - lastBlockEnd;
      if(difference > 1000) {
        bytesFree += difference;
      }
      lastBlockEnd = blocks[i].end;
    }
    var difference =  0xd000 - lastBlockEnd;
    if(difference > 1000) {
      bytesFree += difference;
    }

    $('#editorInfo').html(bytesFree + ' Bytes Free');
  },


  exportPrg: function() {
    var filename = $('#exportPRGAs').val();

    var monochrome = $('#exportPRGMonochrome').is(':checked') ;
    var extendedColorMode = $('#exportPRGExtendedColorMode').is(':checked');



    var fromFrame = parseInt($('#exportPRGFromFrame').val());
    if(isNaN(fromFrame) || fromFrame < 1 || fromFrame > this.editor.graphic.getFrameCount()) {
      alert("Invalid From Frame");
      return;
    }

    var toFrame = parseInt($('#exportPRGToFrame').val());
    if(isNaN(toFrame) || toFrame < 1 || toFrame > this.editor.graphic.getFrameCount()) {
      alert("Invalid To Frame");
      return;
    }


    if(fromFrame > toFrame) {
      alert("From must be greater than to");
      return;
    }

    this.saveAs(filename, fromFrame, toFrame, monochrome, this.monochromeColor, extendedColorMode);

  },
  saveAs: function(filename, fromFrame, toFrame, monochrome, monochromeColor, extendedColorMode, download) {
    if(typeof download == 'undefined') {
      download = true;
    }
    
    /*
    var music = "";
    var selected = $('#exportPRGMusic').val();
    */
    var music = $('#exportPRGMusic').val();

    var loopType = $('#exportPRGLoopType').val();


    var args = {};

    args.download = download;
    args.filename = filename;

    args.mode = $('input[name=exportPRGColorMode]:checked').val();
    if(args.mode == 'monochrome') {
      args.monochromeColor = this.monochromeColor;      
    }


    args.music = music;

    if(music == 'sid') {
      args.sidData = this.sidData;

      args.sidLoadAddr = this.sidLoadAddr;
      args.sidInitAddr = this.sidInitAddr;
      args.sidPlayAddr = this.sidPlayAddr;
      args.sidSpeed = this.sidMultispeed;
      
    }


    args.scrollV = false;
    if($('#exportPRGScrollV').is(':checked')) {
      args.scrollV = true;
    }


    args.entries = [];
    args.keyTriggers = [];
    args.instrTriggers = [];

    args.entries = [];



    if(fromFrame == toFrame) {
      args.entries[0] = {};
      args.entries[0].type = 'frame';
      args.entries[0].frame = 1;
      args.entries[0].duration = 255;

      args.entries[1] = {};
      args.entries[1].type = 'gotorow';
      args.entries[1].gotoRow = 1;

    } else {
      args.entries[0] = {};
      args.entries[0].type = 'frameRange';
      args.entries[0].from = fromFrame;
      args.entries[0].to = toFrame;

      if(loopType == 'pingpong') {


        args.entries[1] = {};
        args.entries[1].type = 'frameRange';
        args.entries[1].from = toFrame - 1;
        args.entries[1].to = fromFrame + 1;


        args.entries[2] = {};
        args.entries[2].type = 'frameJump';
        args.entries[2].jumpTo = 1;


      } else {
        args.entries[1] = {};
        args.entries[1].type = 'frameJump';
        args.entries[1].jumpTo = 1;
      }
    }

    args.layers = $('input[name=exportPRGLayer]:checked').val();
    args.type = $('#exportPRGType').val();

    if(args.type == 'd64') {
      args.diskName = $('#exportPRGDiskName').val();
      args.prgName = $('#exportPRGName').val();
    }


    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return;
    }

    if(layer.getBlockModeEnabled()) {
     // console.log("UPDATE TILES FROM BLOCKS!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      layer.updateTilesFromBlocks();
    }
    if(layer.getColorPerMode() == 'character') {
      layer.updateGridColorsFromTiles();
    }    
      

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    args.frames = [];
    var frameCount = this.editor.graphic.getFrameCount();
    for(var i = 0; i < frameCount; i++) {
      var frameDataOriginal = layer.getFrameData(i);
      var frameData = frameDataOriginal;

      if(gridWidth < 40 || gridHeight < 25) {
        // ok need to create a full screen of frameData
        frameData = {
          bgColor: frameDataOriginal.bgColor,
          borderColor: frameDataOriginal.borderColor,
          data: []
        };
        var blankTile = 32;
        var noColor = this.editor.colorPaletteManager.noColor;

        // create a blank frame
        for(var y = 0; y < 25; y++) {
          frameData.data.push([]);
          for(var x = 0; x < 40; x++) {
            frameData.data[y][x] = {
              t: blankTile,
              fc: 0,
              bc: noColor,
              fh: 0,
              fv: 0,
              rz: 0
            }
          }
        }

        var offsetX = Math.floor((40 - gridWidth) / 2);
        var offsetY = Math.floor((25 - gridHeight) / 2);
        // now put in the data
        for(var y = 0; y < gridHeight; y++) {
          for(var x= 0; x < gridWidth; x++) {
            var destX = x + offsetX;
            var destY = y + offsetY;
            if(destX >= 0 && destX < 40 && destY >= 0 && destY < 25) {
              frameData.data[destY][destX] = {
                t: frameDataOriginal.data[y][x].t,
                fc: frameDataOriginal.data[y][x].fc,
                bc: frameDataOriginal.data[y][x].bc,
                fh: frameDataOriginal.data[y][x].fh,
                fv: frameDataOriginal.data[y][x].fv,
                rz: frameDataOriginal.data[y][x].rz,
              }
            }
          }
        }
      }

      var frame = {};
      frame.frameData = frameData;//layer.getFrameData(i);
      frame.duration = this.editor.graphic.getFrameDuration(i);
      args.frames.push(frame);
    }

    if(gridWidth < 40 || gridHeight < 25) {
      args.gridWidth = 40;
      args.gridHeight = 25;
    } else {

      args.gridWidth = layer.getGridWidth();
      args.gridHeight = layer.getGridHeight();
    }

    this.editor.toPrgAdv.createPRG( args );
    

    /*
    if(true) {
      return this.exportC64.doExport( args );
    } else {
      return this.editor.toPrgAdv.createPRG( args );
    }
    */

    
  },




  getSIDInfo: function() {
    var samplerate = 1;

    var filedata = this.sidData;

    var //emulated machine constants
    C64_PAL_CPUCLK = 985248, //Hz
    PAL_FRAMERATE = 50, //NTSC_FRAMERATE = 60;
    SID_CHANNEL_AMOUNT = 3,
    OUTPUT_SCALEDOWN = 0x10000 * SID_CHANNEL_AMOUNT * 16;
    var SIDamount_vol=[0,  1, 0.6, 0.4]; //how much to attenuate with more 2SID/3SID to avoid master-output overflows

    //SID playback related arrays/variables
    var SIDtitle = new Uint8Array(0x20); var SIDauthor = new Uint8Array(0x20); var SIDinfo = new Uint8Array(0x20); var timermode = new Uint8Array(0x20);
    var loadaddr=0x1000, initaddr=0x1000, playaddf=0x1003, playaddr=0x1003, subtune = 0, subtune_amount=1, playlength=0; //framespeed = 1;
    var preferred_SID_model=[8580.0,8580.0,8580.0]; var SID_model=8580.0; var SID_address=[0xD400,0,0];
    var memory = new Uint8Array(65536); //for(var i=0;i<memory.length;i++) memory[i]=0;
    var loaded=0, initialized=0, finished=0, loadcallback=null, startcallback=null; endcallback=null, playtime=0, ended=0;
    var clk_ratio = C64_PAL_CPUCLK/samplerate;
    var frame_sampleperiod = samplerate/PAL_FRAMERATE; //samplerate/(PAL_FRAMERATE*framespeed);
    var framecnt=1, volume=1.0, CPUtime=0, pPC;
    var SIDamount=1, mix=0;

     var i,strend, offs=filedata[7];
     loadaddr=filedata[8]+filedata[9]? filedata[8]*256+filedata[9] : filedata[offs]+filedata[offs+1]*256;

     for (i=0; i<32; i++) {
       timermode[31-i] = filedata[0x12+(i>>3)] & Math.pow(2,7-i%8);
     }

     this.sidMultispeed = timermode[0];
     for(i=0;i<memory.length;i++) {
       memory[i]=0;
     }
     for (i=offs+2; i<filedata.byteLength; i++) {
       if (loadaddr+i-(offs+2)<memory.length) {
         memory[loadaddr+i-(offs+2)]=filedata[i];
       }
     }
     strend=1;
     for(i=0; i<32; i++) {
       if(strend!=0) {
         strend=SIDtitle[i]=filedata[0x16+i];
       } else {
         strend=SIDtitle[i]=0;
       }
     }

   strend=1;
   for(i=0; i<32; i++) {
     if(strend!=0) {
       strend=SIDauthor[i]=filedata[0x36+i];
     } else {
       strend=SIDauthor[i]=0;
     }
   }

   strend=1;
   for(i=0; i<32; i++) {
     if(strend!=0) {
       strend=SIDinfo[i]=filedata[0x56+i];
     } else {
       strend=SIDinfo[i]=0;
     }
   }

   initaddr=filedata[0xA]+filedata[0xB]? filedata[0xA]*256+filedata[0xB] : loadaddr;
   playaddr=playaddf=filedata[0xC]*256+filedata[0xD];
   subtune_amount=filedata[0xF];
   preferred_SID_model[0] = (filedata[0x77]&0x30)>=0x20? 8580 : 6581;
   preferred_SID_model[1] = (filedata[0x77]&0xC0)>=0x80 ? 8580 : 6581; preferred_SID_model[2] = (filedata[0x76]&3)>=3 ? 8580 : 6581;

   SID_address[1] = filedata[0x7A]>=0x42 && (filedata[0x7A]<0x80 || filedata[0x7A]>=0xE0) ? 0xD000+filedata[0x7A]*16 : 0;
   SID_address[2] = filedata[0x7B]>=0x42 && (filedata[0x7B]<0x80 || filedata[0x7B]>=0xE0) ? 0xD000+filedata[0x7B]*16 : 0;
   SIDamount=1+(SID_address[1]>0)+(SID_address[2]>0);
   loaded=1;

  this.sidLoadAddr = loadaddr;
  this.sidInitAddr = initaddr;
  this.sidPlayAddr = playaddr;

   var sidInfo = '';

   sidInfo += '<div style="margin: 2px 0 0 4px"><strong>Size:</strong> ' + this.sidData.length + ' bytes</div>';
   sidInfo += '<div style="margin: 2px 0 0 4px"><strong>Load Address:</strong> $' + loadaddr.toString(16) + '</div>';
   sidInfo += '<div style="margin: 2px 0 0 4px"><strong>Init Address:</strong> $' + initaddr.toString(16) + '</div>';
   sidInfo += '<div style="margin: 2px 0 0 4px"><strong>Play Address:</strong> $' + playaddr.toString(16) + '</div>';
   $('#exportPRGSIDFileInfo').html(sidInfo);


  },

  selectSIDFile: function(file) {
    var _this = this;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {

      _this.sidData = new Uint8Array(e.target.result);
      _this.getSIDInfo();

    }
    fileReader.readAsArrayBuffer(file);
  },
}
