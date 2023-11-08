var BasicTokeniser = function() {
  // https://github.com/catseye/hatoucan/blob/master/script/hatoucan
  //https://www.c64-wiki.com/wiki/BASIC_token
  // tokens start at 128/$80
  this.tokens = [
    "end",    "for",    "next", "data", "input#",  "input",  "dim",    "read",
    "let",    "goto",   "run",  "if",   "restore", "gosub",  "return", "rem",
    "stop",   "on",     "wait", "load", "save",    "verify", "def",    "poke",
    "print#", "print",  "cont", "list", "clr",     "cmd",    "sys",    "open",
    "close",  "get",    "new",  "tab(", "to",      "fn",     "spc(",   "then",
    "not",    "step",   "+",    "-",    "*",       "/",      "^",      "and",
    "or",     ">",      "=",    "<",    "sgn",     "int",    "abs",    "usr",
    "fre",    "pos",    "sqr",  "rnd",  "log",     "exp",    "cos",    "sin",
    "tan",    "atn",    "peek", "len",  "str$",    "val",    "asc",    "chr$",
    "left$",  "right$", "mid$", ""
  ];

  //https://www.c64-wiki.com/wiki/BASIC_keyword_abbreviation#BASIC_2.0
  this.abbreviations = [
    "eN",    "fO",    "nE", "dA", "iN",  "",  "dI",    "rE",
    "lE",    "gO",   "rU",  "",   "reS", "goS",  "reT", "",
    "sT",   "",     "wA", "lO", "sA",    "vE", "dE",    "pO",
    "pR", "?",  "cO", "lI", "cL",     "cM",    "sY",    "oP",
    "clO",  "gE",    "",  "tA", "",      "",     "sP",   "tH",
    "nO",    "stE",   "",    "",    "",       "",      "",      "aN",
    "",     "",      "",    "",    "sG",     "",    "aB",    "uS",
    "fR",    "",    "sQ",  "rN",  "",     "eX",    "",    "sI",
    "",    "aT",    "pE", "",  "stR",    "vA",    "aS",    "cH",
    "leF",  "rI", "mI", ""
  ];

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
    "purple", /* run */
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



  this.prg = [];

  this.currentLine = "";
  this.inQuotes = false;
  this.inRemark = false;
  this.removeSpaces = false;
  this.inUppercase = false;
  this.repeat = 1;
}

BasicTokeniser.prototype = {
  asciiToPetscii: function(c) {
    var code = false;
    /*
    if(this.inUppercase) {
      code = c.charCodeAt(0);
    } else {
      */
      if(c == c.toLowerCase()) {
        c = c.toUpperCase();
        code = c.charCodeAt(0);
      } else {
        code = c.charCodeAt(0) + 32;
      }
    //}
    return code;
  },

  nextToken: function() {
    this.repeat = 1;

    if(this.removeSpaces) {
      this.currentLine = this.currentLine.trim();
    }

    if(this.currentLine.length == 0) {
      return false;
    }

    if(!this.inQuotes && !this.inRemark) {
      // look for a basic keyword
      for(var i = 0; i < this.tokens.length; i++) {
        if(this.tokens[i] != '' && this.currentLine.startsWith(this.tokens[i])) {
          // found a token!
          var tokenLength = this.tokens[i].length;
          this.currentLine = this.currentLine.substr(tokenLength);
          return i + 128;
        }
      }

      for(var i = 0; i < this.abbreviations.length; i++) {
        if(this.abbreviations[i] != '' && this.currentLine.startsWith(this.abbreviations[i])) {
          var tokenLength = this.abbreviations[i].length;
          this.currentLine = this.currentLine.substr(tokenLength);
          return i + 128;
        }
      }

    }


    var nextChar = this.currentLine[0];
    this.currentLine = this.currentLine.substr(1);


    if(nextChar == '{') {

      var pos = 0;
      var curlyToken = '';

      while((nextChar = this.currentLine[pos++]) != '}') {
        curlyToken += nextChar;
      }
      this.currentLine = this.currentLine.substr(pos);

      
      pos = curlyToken.indexOf('*');
      if(pos != -1) {
        var multiplierString = curlyToken.substr(pos + 1).trim();
        multiplierString = parseInt(multiplierString, 10);
        if(!isNaN(multiplierString)) {
          this.repeat = multiplierString;
        }
        curlyToken = curlyToken.substr(0, pos).trim();

      }

      for(var i = 0; i < this.bastext.length; i++) {
//        if(this.currentLine.startsWith(this.bastext[i] + '}')) {
        if(this.bastext[i] == curlyToken) {
          // found a bastext
          var len = this.bastext[i].length;
          return i;
        }
      }

      for(var i = 0; i < this.petcat.length; i++) {
//        if(this.currentLine.startsWith(this.petcat[i] + '}')) {
        if(this.petcat[i] == curlyToken) {
          // found a petcat
          var len = this.petcat[i].length;
          return i;
        }
      }

      for(var i = 0; i < this.c64list.length; i++) {
//        if(this.currentLine.startsWith(this.c64list[i] + '}')) {
        if(this.c64list[i] == curlyToken) {
          // found a c64list
          var len = this.c64list[i].length;
          return i;
        }
      }

      // is it a number
      for(var i = 0; i < 256; i++) {
        var n = i.toString(10);
        //if(this.currentLine.startsWith(n)) {
        if(curlyToken == n) {
          var len = n.length;
          return i;
        }
      }

      for(var i = 0; i < 100; i++) {
        var n = '0' + i.toString(10);
        //if(this.currentLine.startsWith(n)) {
        if(curlyToken == n) {
          var len = n.length;
          return i;
        }
      }

      for(var i = 0; i < 10; i++) {
        var n = '00' + i.toString(10) + '}';
        //if(this.currentLine.startsWith(n)) {
        if(curlyToken == n) { 
          var len = n.length;
          return i;
        }
      }


    }

    var token = this.asciiToPetscii(nextChar);
    if(nextChar == '"') {
      this.inQuotes = !this.inQuotes;
    }

    return token;
  },

  tokeniseLine: function(line) {
    var lineBytes = [];
    
    this.currentLine = line.trim();
    
    if(this.currentLine == '') {
      return lineBytes;
    }

    this.inQuotes = false;
    this.inRemark = false;
    
    var pos = 0;

    
    var numberRE = /^\d+$/;
    // get the line number
    var c = this.currentLine[pos++];
    var lineNumber = '';
    while(numberRE.test(c)) {
      lineNumber += c.toString();
      c = this.currentLine[pos++];
    }

    pos = lineNumber.length;
    lineNumber = parseInt(lineNumber, 10);
    lineBytes.push(lineNumber & 0xff);
    lineBytes.push( (lineNumber >> 8) & 0xff);

    // rest of the line
    this.currentLine = this.currentLine.substr(pos).trim();
    

    while((token = this.nextToken()) !== false) {
      for(var i = 0; i < this.repeat; i++) {
        lineBytes.push(token);
      }
    }

    lineBytes.push(0x00); // end of lineNumber
    return lineBytes;

  },

  tokenise: function(args) {
    this.prg = [];
    var script = args.script;
    this.inUppercase = args.inUppercase;
    
    if(this.inUppercase) {
      script = script.toLowerCase();
    }
    var address = 0x801;
    // start address
    this.prg.push(address & 0xff);
    this.prg.push((address >> 8) & 0xff);

    var lines = script.split("\n");
    for(var i = 0; i < lines.length; i++) {
      var line = lines[i].replace("\r", "").trim();
      if(line != '') {
        this.tokeniseLine(line);
        var bytes = this.tokeniseLine(line);
        address += bytes.length + 2;

        // write address of next line
        this.prg.push(address & 0xff);
        this.prg.push((address >> 0x8) & 0xff);

        // write thie line bytes
        for(var b = 0; b < bytes.length; b++) {
          this.prg.push(bytes[b]);
        }
      }
    }
    // end of basic
    this.prg.push(0);
    this.prg.push(0);

    var prgBytes = new Uint8Array(this.prg.length);
    for(var i = 0; i < this.prg.length; i++) {
      prgBytes[i] = this.prg[i];
    }

    return prgBytes;
  }
}
