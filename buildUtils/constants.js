



  var CMD_DONOTHING = 0;
  var CMD_PORTAUP = 1;
  var CMD_PORTADOWN = 2;
  var CMD_TONEPORTA = 3;
  var CMD_VIBRATO = 4;
  var CMD_SETAD = 5;
  var CMD_SETSR = 6;
  var CMD_SETWAVE = 7;
  var CMD_SETWAVEPTR = 8;
  var CMD_SETPULSEPTR = 9;
  var CMD_SETFILTERPTR = 10;
  var CMD_SETFILTERCTRL = 11;
  var CMD_SETFILTERCUTOFF = 12;
  var CMD_SETMASTERVOL = 13;
  var CMD_FUNKTEMPO = 14;
  var CMD_SETTEMPO = 15;

  var WTBL = 0;
  var PTBL = 1;
  var FTBL = 2;
  var STBL = 3;

  var MAX_FILT = 64;
  var MAX_STR = 32;
  var MAX_INSTR = 64;
  var MAX_CHN = 3;
  var MAX_PATT = 208;
  var MAX_TABLES = 4;
  var MAX_TABLELEN = 255;
  var MAX_INSTRNAMELEN = 16;
  var MAX_PATTROWS = 128;
  var MAX_SONGLEN = 254;
  var MAX_SONGS = 32;
  var MAX_NOTES = 96;

  var REPEAT = 0xd0;
  var TRANSDOWN = 0xe0;
  var TRANSUP = 0xf0;
  var LOOPSONG = 0xff;

  var ENDPATT = 0xff;
  var INSTRCHG = 0x00;
  var FX = 0x40;
  var FXONLY = 0x50;
  var FIRSTNOTE = 0x60;
  var LASTNOTE = 0xbc;
//  var REST = 0xbd;
  var KEYOFF = 0xbe;
  var KEYON = 0xbf;
  var OLDKEYOFF = 0x5e;
  var OLDREST = 0x5f;

  var WAVEDELAY = 0x1;
  var WAVELASTDELAY = 0xf;
  var WAVESILENT = 0xe0;
  var WAVELASTSILENT = 0xef;
  var WAVECMD = 0xf0;
  var WAVELASTCMD = 0xfe;  

  

SidPlayer.CMD_DONOTHING       = 0;
SidPlayer.CMD_PORTAUP         = 1;
SidPlayer.CMD_PORTADOWN       = 2;
SidPlayer.CMD_TONEPORTA       = 3;
SidPlayer.CMD_VIBRATO         = 4;
SidPlayer.CMD_SETAD           = 5;
SidPlayer.CMD_SETSR           = 6;
SidPlayer.CMD_SETWAVE         = 7;
SidPlayer.CMD_SETWAVEPTR      = 8;
SidPlayer.CMD_SETPULSEPTR     = 9;
SidPlayer.CMD_SETFILTERPTR    = 10;
SidPlayer.CMD_SETFILTERCTRL   = 11;
SidPlayer.CMD_SETFILTERCUTOFF = 12;
SidPlayer.CMD_SETMASTERVOL    = 13;
SidPlayer.CMD_FUNKTEMPO       = 14;
SidPlayer.CMD_SETTEMPO        = 15;

SidPlayer.CMD_STOPFILTER      = 16;
SidPlayer.CMD_LEGATO          = 17;

SidPlayer.WTBL = 0;
SidPlayer.PTBL = 1;
SidPlayer.FTBL = 2;
SidPlayer.STBL = 3;

SidPlayer.MAX_FILT = 64;
SidPlayer.MAX_STR = 32;
SidPlayer.MAX_INSTR = 64;
SidPlayer.MAX_CHN = 3;
SidPlayer.MAX_PATT = 208;
SidPlayer.MAX_TABLES = 4;
SidPlayer.MAX_TABLELEN = 255;
SidPlayer.MAX_INSTRNAMELEN = 16;
SidPlayer.MAX_PATTROWS = 128;
SidPlayer.MAX_SONGLEN = 254;
SidPlayer.MAX_SONGS = 32;
SidPlayer.MAX_NOTES = 96;

SidPlayer.REPEAT = 0xd0;
SidPlayer.TRANSDOWN = 0xe0;
SidPlayer.TRANSUP = 0xf0;
SidPlayer.LOOPSONG = 0xff;

SidPlayer.ENDPATT       = 0xff;
SidPlayer.INSTRCHG      = 0x00;
SidPlayer.FX            = 0x40;
SidPlayer.FXONLY        = 0x50;
SidPlayer.FIRSTNOTE     = 0x60;
SidPlayer.LASTNOTE      = 0xbc;
SidPlayer.REST          = 0xbd;
SidPlayer.KEYOFF        = 0xbe;
SidPlayer.KEYON         = 0xbf;
SidPlayer.OLDKEYOFF     = 0x5e;
SidPlayer.OLDREST       = 0x5f;

SidPlayer.WAVEDELAY     = 0x1;
SidPlayer.WAVELASTDELAY = 0xf;
SidPlayer.WAVESILENT    = 0xe0;
SidPlayer.WAVELASTSILENT = 0xef;
SidPlayer.WAVECMD       = 0xf0;
SidPlayer.WAVELASTCMD   = 0xfe;



UI.LEFTMOUSEBUTTON = 1;
UI.RIGHTMOUSEBUTTON = 2;
UI.MIDDLEMOUSEBUTTON = 4;

UI.LEFTARROWKEY = 37;
UI.RIGHTARROWKEY = 39;
UI.UPARROWKEY = 38;
UI.DOWNARROWKEY = 40;
UI.BACKSPACEKEY = 8;
UI.DELETEKEY = 46;


