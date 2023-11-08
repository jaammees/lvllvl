function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

var DbgC64Basic = function() {
  this.codeEditor = null;
  this.doc = null;

  this.basicTokeniser = new BasicTokeniser();

  this.prefix = 'dbg';

  this.editorElementId = '';
  this.outputElementId = '';

  this.bastext = [
    "null",				/* 0 */		/* 0x0 */
    "ct a",
    "ct b",
    "ct c",
    "ct d",
    "white",
    "ct f",
    "ct g",
    "ct h", /* (disable charset switch (C64)) */
    "ct i", /* (enable charset switch (C64)) */
    "ct j",				/* 10 */
    "ct k",
    "ct l",
    "return",
    "ct n",
    "ct o",
    "ct p",							/* 0x10 */
    "down",
    "reverse on",
    "home",
    "delete",			/* 20 */
    "ct u",
    "ct v",
    "ct w",
    "ct x",
    "ct y",
    "ct z",
    "027", /* (c128) */
    "red",
    "right",
    "green",			/* 30 */
    "blue",
    " ", /* (space) */				/* 0x20 */
    "!",
    "\"",
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",				/* 40 */
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    "0",							/* 0x30 */
    "1",
    "2",				/* 50 */
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",				/* 60 */
    "=",
    ">",
    "?",
    "@",							/* 0x40 */
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",				/* 70 */
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",				/* 80 */	/* 0x50 */
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",				/* 90 */
    "[",
    "pound", /* pound */
    "]",
    "^",
    "arrow left", /* <- */
    "096",							/* 0x60 */
    "097",
    "098",
    "099",
    "100",				/* 100 */
    "101",
    "102",
    "103",
    "104",
    "105",
    "106",
    "107",
    "108",
    "109",
    "110",				/* 110 */
    "111",
    "112",							/* 0x70 */
    "113",
    "114",
    "115",
    "116",
    "117",
    "118",
    "119",
    "120",				/* 120 */
    "121",
    "122",
    "123",
    "124",
    "125",
    "126",
    "127",
    "128",							/* 0x80 */
    "orange",
    "130",				/* 130 */
    "131",
    "132",
    "f1",
    "f3",
    "f5",
    "f7",
    "f2",
    "f4",
    "f6",
    "f8",				/* 140 */
    "141",
    "142",
    "143",
    "black",						/* 0x90 */
    "up",
    "reverse off",
    "clear",
    "148", /* insert */
    "brown",
    "pink",				/* 150 */
    "dark gray",
    "gray",
    "light green",
    "light blue",
    "light gray",
    "156", /* run */
    "left",
    "yellow",
    "cyan",
    "sh space",			/* 160 */	/* 0xA0 */
    "cm k",
    "cm i",
    "cm t",
    "cm @",
    "cm g",
    "cm +",
    "cm m",
    "cm pound",
    "sh pound",
    "cm n",				/* 170 */
    "cm q",
    "cm d",
    "cm z",
    "cm s",
    "cm p",
    "cm a",							/* 0xB0 */
    "cm e",
    "cm r",
    "cm w",
    "cm h",				/* 180 */
    "cm j",
    "cm l",
    "cm y",
    "cm u",
    "cm o",
    "sh @",
    "cm f",
    "cm c",
    "cm x",
    "cm v",				/* 190 */
    "cm b",
    "sh asterisk",					/* 0xC0 */
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",				/* 200 */
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",								/* 0xD0 */
    "Q",
    "R",				/* 210 */
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "sh +",
    "cm -",				/* 220 */
    "sh -",
    "222",
    "cm asterisk",
    "224",								/* 0xE0 */
    "225",
    "226",
    "227",
    "228",
    "229",
    "230",				/* 230 */
    "231",
    "232",
    "233",
    "234",
    "235",
    "236",
    "237",
    "238",
    "239",
    "240",				/* 240 */		/* 0xF0 */
    "241",
    "242",
    "243",
    "244",
    "245",
    "246",
    "247",
    "248",
    "249",
    "250",				/* 250 */
    "251",
    "252",
    "253",
    "254",
    "pi",				/* 255 */		/* 0xFF */
  ];



  this.petcat = [
    "null",				/* 0 */		/* 0x0 */
    "ctrl-a",
    "ctrl-b",
    "stop",
    "ctrl-d",
    "wht",
    "ctrl-f",
    "ctrl-g",
    "dish", /* (disable charset switch (C64)) */
    "ensh", /* (enable charset switch (C64)) */
    "$0a",				/* 10 */
    "ctrl-k",
    "\\f",
    "\\n",
    "swlc",
    "ctrl-o",
    "ctrl-p",							/* 0x10 */
    "down",
    "rvon",
    "home",
    "del",			/* 20 */
    "ctrl-u",
    "ctrl-v",
    "ctrl-w",
    "ctrl-x",
    "ctrl-y",
    "ctrl-z",
    "esc", /* (c128) */
    "red",
    "rght",
    "grn",			/* 30 */
    "blu",
    "space", /* (space) */				/* 0x20 */
    "!",
    "\"",
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",				/* 40 */
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    "0",							/* 0x30 */
    "1",
    "2",				/* 50 */
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",				/* 60 */
    "=",
    ">",
    "?",
    "@",							/* 0x40 */
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",				/* 70 */
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",				/* 80 */	/* 0x50 */
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",				/* 90 */
    "[",
    "\\", /* pound */
    "]",
    "^",
    "arrow left", /* <- */
    "$60",							/* 0x60 */
    "$61",
    "$62",
    "$63",
    "$64",				/* 100 */
    "$65",
    "$66",
    "$67",
    "$68",
    "$69",
    "$6a",
    "$6b",
    "$6c",
    "$6d",
    "$6e",				/* 110 */
    "$6f",
    "$70",							/* 0x70 */
    "$71",
    "$72",
    "$73",
    "$74",
    "$75",
    "$76",
    "$77",
    "$78",				/* 120 */
    "$79",
    "$7a",
    "$7b",
    "$7c",
    "$7d",
    "$7e",
    "$7f",
    "$80",							/* 0x80 */
    "orng",
    "$82",				/* 130 */
    "$83",
    "$84",
    "f1",
    "f3",
    "f5",
    "f7",
    "f2",
    "f4",
    "f6",
    "f8",				/* 140 */
    "stret",
    "swuc",
    "$8f",
    "blk",						/* 0x90 */
    "up",
    "rvof",
    "clr",
    "inst", /* insert */
    "brn",
    "lred",				/* 150 */
    "gry1",
    "gry2",
    "lgrn",
    "lblu",
    "gry3",
    "pur", /* run */
    "left",
    "yel",
    "cyn",
    "$a0",			/* 160 */	/* 0xA0 */
    "cbm-k",
    "cbm-i",
    "cbm-t",
    "cbm-@",
    "cbm-g",
    "cbm-+",
    "cbm-m",
    "cbm-pound",
    "shift-pound",
    "cbm-n",				/* 170 */
    "cbm-q",
    "cbm-d",
    "cbm-z",
    "cbm-s",
    "cbm-p",
    "cbm-a",							/* 0xB0 */
    "cbm-e",
    "cbm-r",
    "cbm-w",
    "cbm-h",				/* 180 */
    "cbm-j",
    "cbm-l",
    "cbm-y",
    "cbm-u",
    "cbm-o",
    "shift-@",
    "cbm-f",
    "cbm-c",
    "cbm-x",
    "cbm-v",				/* 190 */
    "cbm-b",
    "shift-*",					/* 0xC0 */
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",				/* 200 */
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",								/* 0xD0 */
    "Q",
    "R",				/* 210 */
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "shift-+",
    "cbm--",				/* 220 */
    "shift--",
    "{$de}",
    "cbm-*",
    "$e0",								/* 0xE0 */
    "$e1",
    "$e2",
    "$e3",
    "$e4",
    "$e5",
    "$e6",				/* 230 */
    "$e7",
    "$e8",
    "$e9",
    "$ea",
    "$eb",
    "$ec",
    "$ed",
    "$ee",
    "$ef",
    "$f0",				/* 240 */		/* 0xF0 */
    "$f1",
    "$f2",
    "$f3",
    "$f4",
    "$f5",
    "$f6",
    "$f7",
    "$f8",
    "$f9",
    "$fa",				/* 250 */
    "$fb",
    "$fc",
    "$fd",
    "$fe",
    "$ff",				/* 255 */		/* 0xFF */
  ];





  this.c64list = [
    "null",				/* 0 */		/* 0x0 */
    "$01",
    "$02",
    "stop",
    "$04",
    "white",
    "$06",
    "$07",
    "altdis", /* (disable charset switch (C64)) */
    "altena", /* (enable charset switch (C64)) */
    "$0a",				/* 10 */
    "$0b",
    "$0c",
    "$0d",
    "lower",
    "$0f",
    "$10",							/* 0x10 */
    "down",
    "rvrs on",
    "home",
    "backspace",			/* 20 */
    "$15",
    "$16",
    "$17",
    "$18",
    "$19",
    "$1a",
    "$1b", /* (c128) */
    "red",
    "right",
    "green",			/* 30 */
    "blue",
    "space", /* (space) */				/* 0x20 */
    "!",
    "\"",
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",				/* 40 */
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    "0",							/* 0x30 */
    "1",
    "2",				/* 50 */
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",				/* 60 */
    "=",
    ">",
    "?",
    "@",							/* 0x40 */
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",				/* 70 */
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",				/* 80 */	/* 0x50 */
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",				/* 90 */
    "[",
    "pound", /* pound */
    "]",
    "up arrow",
    "back arrow", /* <- */
    "$60",							/* 0x60 */
    "$61",
    "$62",
    "$63",
    "$64",				/* 100 */
    "$65",
    "$66",
    "$67",
    "$68",
    "$69",
    "$6a",
    "$6b",
    "$6c",
    "$6d",
    "$6e",				/* 110 */
    "$6f",
    "$70",							/* 0x70 */
    "$71",
    "$72",
    "$73",
    "$74",
    "$75",
    "$76",
    "$77",
    "$78",				/* 120 */
    "$79",
    "$7a",
    "$7b",
    "$7c",
    "$7d",
    "$7e",
    "$7f",
    "$80",							/* 0x80 */
    "orange",
    "$82",				/* 130 */
    "$83",
    "$84",
    "f1",
    "f3",
    "f5",
    "f7",
    "f2",
    "f4",
    "f6",
    "f8",				/* 140 */
    "shft ret",
    "upper",
    "$8f",
    "black",						/* 0x90 */
    "up",
    "rvrs off",
    "clear",
    "insert", /* insert */
    "brown",
    "lt. red",				/* 150 */
    "gray1",
    "gray2",
    "lt. green",
    "lt. blue",
    "gray3",
    "purple", /* run */
    "left",
    "yellow",
    "cyan",
    "$a0",			/* 160 */	/* 0xA0 */
    "$a1",
    "$a2",
    "$a3",
    "$a4",
    "$a5",
    "$a6",
    "$a7",
    "shft pound",
    "ctrl pound",
    "$aa",				/* 170 */
    "$ab",
    "$ac",
    "$ad",
    "$ae",
    "$af",
    "$b0",							/* 0xB0 */
    "$b1",
    "$b2",
    "$b3",
    "$b4",				/* 180 */
    "$b5",
    "$b6",
    "$b7",
    "$b8",
    "$b9",
    "$ba",
    "$bb",
    "$bc",
    "$bd",
    "$be",				/* 190 */
    "$bf",
    "$c0",					/* 0xC0 */
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",				/* 200 */
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",								/* 0xD0 */
    "Q",
    "R",				/* 210 */
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "$db",
    "$dc",				/* 220 */
    "$dd",
    "$de",
    "$df",
    "$e0",								/* 0xE0 */
    "$e1",
    "$e2",
    "$e3",
    "$e4",
    "$e5",
    "$e6",				/* 230 */
    "$e7",
    "$e8",
    "$e9",
    "$ea",
    "$eb",
    "$ec",
    "$ed",
    "$ee",
    "$ef",
    "$f0",				/* 240 */		/* 0xF0 */
    "$f1",
    "$f2",
    "$f3",
    "$f4",
    "$f5",
    "$f6",
    "$f7",
    "$f8",
    "$f9",
    "$fa",				/* 250 */
    "$fb",
    "$fc",
    "$fd",
    "$fe",
    "$ff",				/* 255 */		/* 0xFF */
  ];

}

var sampleC64BasicScript = '10 print "hello"\n20 goto 10\n';
DbgC64Basic.prototype = {
  init: function(args) {
    if(typeof args.prefix) {
      this.prefix = args.prefix;
    }

  },


  buildInterface: function(parentPanel) {
    var _this = this;

    this.uiComponent = UI.create("UI.SplitPanel", { overflow: "unset" });
    parentPanel.add(this.uiComponent);

    var controlsHTML = '';
    
    controlsHTML += '<div class="panelFill">';
    controlsHTML += '<div id="' + this.prefix + 'BasicButtonPanel" style="position:absolute; overflow: hidden; white-space: nowrap; top: 0px; left:0px; right:0px; height:26px; padding: 4px">';
    controlsHTML += '  <div style="margin-right: 6px" class="ui-button ui-button-primary" id="' + this.prefix + 'BasicRun"><i class="halflings halflings-play"></i> RUN (F5)</div>';
    controlsHTML += '  <div style="margin-right: 6px" class="ui-button" id="' + this.prefix + 'BasicStop"><i class="halflings halflings-stop"></i> STOP</div>';
    controlsHTML += '  <div style="margin-right: 6px" class="ui-button" id="' + this.prefix + 'BasicDownload"><img src="icons/svg/glyphicons-basic-199-save.svg"> Download PRG</div>';
    controlsHTML += '  <div style="margin-right: 6px" class="ui-button" id="' + this.prefix + 'BasicShare"><img src="icons/material/share-24px.svg">&nbsp;Share</div>';
    
    controlsHTML += '</div>';


    controlsHTML += '<div style="position: absolute; top: 34px; left: 2px; right: 0; height: 64px">';
    controlsHTML += '<div style="margin: 4px 0"><label style="" class="cb-container">BASIC is in Uppercase  <input type="checkbox" id="' + this.prefix + 'BasicUppercase" value="1"><span class="checkmark"></span></label></div>';    


    controlsHTML += '<div>';
    controlsHTML += '<div style="margin: 4px 0">Bas Text, petcat and C64List PETSCII codes can be used</div>';
    controlsHTML += '<div style="margin: 4px 0"><a href="https://www.c64-wiki.com/wiki/PETSCII_Codes_in_Listings" target="_blank">PETSCII BASIC Codes</a></div>';
    controlsHTML += '</div>';


    controlsHTML += '</div>';

/*
    controlsHTML += '<div style="position: absolute; top: 54px; left: 2px; right: 0; height: 34px">';
    controlsHTML += '<button id="">Binary To DATA</button>';
    controlsHTML += '<input type="file" id="binaryToDataFile"/>'
    controlsHTML += '</div>';
*/
    controlsHTML += '</div>';


    this.controlsPanel = UI.create("UI.HTMLPanel", { "html": controlsHTML });
    this.uiComponent.addSouth(this.controlsPanel, 120, true);

    var codeEditorPanel = UI.create("UI.Panel");
    this.uiComponent.add(codeEditorPanel);

    this.codeEditor = new CodeEditor();
    this.codeEditor.init('c64basic');

    this.codeEditor.on('run', function() {
      _this.run();
    });
    this.codeEditor.buildInterface(codeEditorPanel);
    this.codeEditor.on('change', function(event) {
      _this.codeEditorChange();
    });

    UI.on('ready', function() {
      _this.initEvents();

      /*
      $('#binaryToDataFile').on('change', function(event) {
        _this.binaryToData(event);
      });
      */
    });
  },

  binaryToData: function(event) {
    var file = document.getElementById('binaryToDataFile').files[0];
    var fileReader = new FileReader();

    fileReader.onload = function(e) {
      var byteArray = new Uint8Array(e.target.result);

      var output = "";
      var lineNumber = 800;
      for(var i = 0; i < byteArray.length - 2; i++) {
        if(i % 8 == 0) {
          output += "\n";
          lineNumber += 10;
          output += lineNumber + " DATA ";
        } else {
          output += ",";
        }
        output += byteArray[i + 2];
      }
      output += "\n";


    }
    fileReader.readAsArrayBuffer(file);


  },

  initEvents: function() {
    var _this = this;
    $('#' + this.prefix + 'BasicRun').on('click', function() {
      _this.run();
    });

    $('#' + this.prefix + 'BasicStop').on('click', function() {
      _this.stop();
    });

    $('#' + this.prefix + 'BasicDownload').on('click', function() {
      _this.download();
    });

    $('#' + this.prefix + 'BasicShare').on('click', function() {
      if(g_app.c64Debugger) {
        g_app.c64Debugger.share({ "type": 'basic' });
      }        
    });
      
  },

  shiftCode: function(key) {
    switch(key.toLowerCase()) {
      case '@': //64
        return 186;
        break;
      case 'asterisk':  // 42
        return 99;
        break;
      case 'pound':
        return 169;
        break;
    }

    if(key.length == 1) {
      return key.toUpperCase().charCodeAt(0);
    }

    return "";
  },

  cbmCode: function(key) {
    var character = false;
    switch(key.toLowerCase()) {
      case 'asterisk':
        return 127;
        break;
      case 'pound':
        return 162;
        break;
      case 'a':
//        character = 112;
        character = 112 + 64;
        break;
      case 'b':
        character = 127 + 64;
        break;
      case 'c':
        character = 124 + 64;
        break;
      case 'd':
        character = 108 + 64;
        break;
      case 'e':
        character = 113 + 64;
        break;
      case 'f':
        character = 123 + 64;
        break;
      case 'g':
        character = 101 + 64;
        break;
      case 'h':
        character = 116 + 64;
        break;
      case 'i':
        character = 98 + 64;
        break;
      case 'j':
        character = 117 + 64;
        break;
      case 'k':
        character = 97 + 64;
        break;
      case 'l':
        character = 118 + 64;
        break;
      case 'm':
        character = 103 + 64;
        break;
      case 'n':
        character = 106 + 64;
        break;
      case 'o':
        character = 121 + 64;
        break;
      case 'p':
        character = 111 + 64;
        break;
      case 'q':
        character = 107 + 64;
        break;
      case 'r':
        character = 114 + 64;
        break;
      case 's':
        character = 110 + 64;
        break;
      case 't':
        character = 99 + 64;
        break;
      case 'u':
        character = 120 + 64;
        break;
      case 'v':
        character = 126 + 64;
        break;
      case 'w':
        character = 115 + 64;
        break;
      case 'x':
        character = 125 + 64;
        break;
      case 'y':
        character = 119 + 64;
        break;
      case 'z':
        character = 109 + 64;
        break;
    }

    return character;
  },

  setBAS: function(script) {
    this.path = '/scripts/c64.bas';
    var record = g_app.doc.getDocRecord(this.path);
    if(record ) {
      record.data = script;
    } 
    this.codeEditor.setValue(script);
  },

  download: function() {
    var inUppercase = $('#c64preBasicUppercase').is(':checked');

    var script = '';
    this.path = '/scripts/c64.bas';
    var record = g_app.doc.getDocRecord(this.path);
    if(record && record.data != '') {
      script = record.data;
    } else {  
      script = this.codeEditor.getValue();
    }


    var prg = this.basicTokeniser.tokenise({
      script: script,
      inUppercase: inUppercase
    });

    download(prg, 'basic.prg', "application/prg");   
  },

  run: function() { 
    var inUppercase = $('#c64preBasicUppercase').is(':checked');

    var script = '';
    this.path = '/scripts/c64.bas';
    var record = g_app.doc.getDocRecord(this.path);
    if(record && record.data != '') {
      script = record.data;
    } else {  
      script = this.codeEditor.getValue();
    }


    var prg = this.basicTokeniser.tokenise({
      script: script,
      inUppercase: inUppercase
    });

//    c64_reset();
    if(g_app.c64Debugger) {
      this.codeEditor.blur();
      g_app.c64Debugger.focusMachine();
      g_app.c64Debugger.startPRG(prg, true);
    }

    return;

    c64_reset();
    var text = script;
    //text += "\r\n";
    
    if(inUppercase) {
      text += "\nRUN\n";
    } else {
      text += "\nrun\n";
    }
//    text = text.replace("\r\n", "\n");

    var symbols = [];
//    text = text.replace(/[\r\n]*/g, "\n");


    text = text.split("\r\n").join("\n");

    
    for(var i = 0; i < text.length; i++) {
      var c = text[i];
      var symbol = c;
      if(c == '{') {
        i++;
        symbol = '';
        while(i < text.length && text[i] != '}') {
          symbol += text[i];
          i++;
        }
      }

      if(c != symbol) {
        var code = false;

        var multiplier = 1;
        var asteriskPos = symbol.indexOf('*');
        if(asteriskPos != -1) {
          multiplier = symbol.substr(asteriskPos + 1);
          console.log('multiplier = ' + multiplier);
          multiplier = parseInt(multiplier, 10);
          if(isNaN(multiplier)) {
            multiplier = 1;
          }
          symbol = symbol.substr(0, asteriskPos).trim();
        }

        for(var j = 0; j < this.bastext.length; j++) {
          if(this.bastext[j] == symbol) {
            code = j;
            break;
          }

        }
        console.log("bastext code = " + code);


        if(code === false) {
          var lowercaseSymbol = symbol.toLowerCase();
          for(var j = 0; j < this.petcat.length; j++) {
            if(this.petcat[j] == lowercaseSymbol) {
              code = j;
              break;
            }
          }
          console.log("petcat code = " + code);

        }

        if(code === false) {
          var lowercaseSymbol = symbol.toLowerCase();
          for(var j = 0; j < this.c64list.length; j++) {
            if(this.c64list[j] == lowercaseSymbol) {
              code = j;
              break;
            }
          }

          console.log("c64list code = " + code);
        }

        if(code === false) {
          var lowerCaseSymbol = symbol.toLowerCase();

          if(isNumeric(symbol)) {
            code = parseInt(symbol);

          } else if(lowerCaseSymbol.indexOf("shift") == 0) {
            symbol = symbol.substring("SHIFT-".length);
            code = symbol.toUpperCase().charCodeAt(0) + 32; 
            code = this.shiftCode(symbol);
          } else if(lowerCaseSymbol.indexOf("sh ") == 0) {
            symbol = symbol.substring("sh ".length);
            code = this.shiftCode(symbol);
          } else if(lowerCaseSymbol.indexOf("cbm") == 0) {
            symbol = symbol.substring("CBM-".length);
            code = this.cbmCode(symbol);
          } else if(lowerCaseSymbol.indexOf("cm ") == 0) {
            symbol = symbol.substring("cm ".length);
            code = this.cbmCode(symbol);
          } else {
            symbol = symbol.toLowerCase();
            
            switch(symbol) {
              case 'blk':
              case 'black':
                code = 144;
                break;
              case 'wht':
              case 'white':
                  code = 5;
                break;
              case 'red':
              case 'red':
                code = 28;
                break;

              case 'cyn':
              case 'cyan':
                code = 159;
                break;
              case 'pur':
              case 'purple':
                code = 156;
                break;
              case 'grn':
              case 'green':              
                code = 153;
                break;
              case 'blu':
              case 'blue':              
                code = 31;
                break;
              case 'yel':
              case 'yellow':              
                code = 158;
                break;
              case 'orng':
              case 'orange':
                  code = 129;
                break;
              case 'brn':
              case 'brown':
                  code = 149;
                break;
              case 'lred':
              case 'pink':
              case 'lightred':
              case 'light red':
                  code = 150;
                break;

              case 'lgrn':
              case 'lightgreen':
              case 'light green':
                    code = 153;
                break;
              case 'lblu':
              case 'light blue':
              case 'lightblue':                              
                code = 154;
                break;
              case 'dark gray':
              case 'gry1':
              case 'grey 1':
              case 'grey1':
                code = 151;
                break;
              case 'medium gray':
              case 'gry2':
              case 'grey2':
              case 'grey 2':              
                code = 152
                break;

              case 'light gray':
              case 'gry3':
              case 'grey3':              
              case 'grey 3':              
                code = 155;
                break;
                  
              case 'rvon':
              case 'reverse on':              
              case 'rvs on':
                code = 18;
                break;
              case 'rvof':
              case 'rvs off':
              case 'reverse off':
                code = 146;
                break;
              case 'clr':
              case 'clear':
                code = 147;
                break;
              case 'home':
                code = 19;
                break;

              case 'inst':
                code = 148;
                break;
              case 'del':
                code = 20;
                break;
              case 'up':
                code = 145;
                break;
              case 'down':
                code = 17;
                break;

              case 'left':
                code = 157;
                break;
              case 'rght':
              case 'right':              
                code = 29;
                break;                
            }
          }
        }

        if(code !== false) {
          for(var m = 0; m < multiplier; m++) {
            symbols.push(code);
          }
        }

        console.log('symbols = ');
        console.log(symbols);
      } else {
        var code = false;

        if(inUppercase) {
          code = c.charCodeAt(0);
        } else {
          if(c == c.toLowerCase()) {
            c = c.toUpperCase();
            code = c.charCodeAt(0);
          } else {
            code = c.charCodeAt(0) + 32;
          }
        }
        switch(code) {
          case 10:
            symbols.push(157);
            code = 13;
            break;
        }        
        symbols.push(code);
      }
    }
    c64.insertScreenCodes(symbols);

    if(g_app.c64Debugger) {
      g_app.c64Debugger.focusMachine();
    }

  },
    

  stop: function() {
    c64_keyPressed(C64_KEY_RUN_STOP);
    setTimeout(function() {
      c64_keyReleased(C64_KEY_RUN_STOP);
    }, 100);

  },

  show: function() {
    this.path = '/scripts/c64.bas';

    var record = g_app.doc.getDocRecord(this.path);

    if(record == null) {
      // create it?
      var scripts = g_app.doc.getDocRecord('/scripts');
      if(scripts) {
        g_app.doc.createDocRecord('/scripts', 'c64.bas', 'script', "");
        record = g_app.doc.getDocRecord(this.path);
      }
    }

    if(record != null) {
      if(record.data == '') {
        record.data = sampleC64BasicScript;
      }
      this.codeEditor.setValue(record.data);
      this.doc = record;
    }

  },

  codeEditorChange: function() {
    if(this.doc != null) {
      this.doc.data = this.codeEditor.getValue();
    } 
  },


}