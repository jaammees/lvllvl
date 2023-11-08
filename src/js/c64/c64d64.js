var D64Util = {};

D64Util.trackInfo = [
  { track:  0, numSectors:0,  sectorsIn:  0, d64Offset: 0x00000 }, // for 1-based track indexing
  { track:  1, numSectors:21, sectorsIn:  0, d64Offset: 0x00000 },
  { track:  2, numSectors:21, sectorsIn: 21, d64Offset: 0x01500 },
  { track:  3, numSectors:21, sectorsIn: 42, d64Offset: 0x02A00 },
  { track:  4, numSectors:21, sectorsIn: 63, d64Offset: 0x03F00 },
  { track:  5, numSectors:21, sectorsIn: 84, d64Offset: 0x05400 },
  { track:  6, numSectors:21, sectorsIn:105, d64Offset: 0x06900 },
  { track:  7, numSectors:21, sectorsIn:126, d64Offset: 0x07E00 },
  { track:  8, numSectors:21, sectorsIn:147, d64Offset: 0x09300 },
  { track:  9, numSectors:21, sectorsIn:168, d64Offset: 0x0A800 },
  { track: 10, numSectors:21, sectorsIn:189, d64Offset: 0x0BD00 },
  { track: 11, numSectors:21, sectorsIn:210, d64Offset: 0x0D200 },
  { track: 12, numSectors:21, sectorsIn:231, d64Offset: 0x0E700 },
  { track: 13, numSectors:21, sectorsIn:252, d64Offset: 0x0FC00 },
  { track: 14, numSectors:21, sectorsIn:273, d64Offset: 0x11100 },
  { track: 15, numSectors:21, sectorsIn:294, d64Offset: 0x12600 },
  { track: 16, numSectors:21, sectorsIn:315, d64Offset: 0x13B00 },
  { track: 17, numSectors:21, sectorsIn:336, d64Offset: 0x15000 },
  { track: 18, numSectors:19, sectorsIn:357, d64Offset: 0x16500 },
  { track: 19, numSectors:19, sectorsIn:376, d64Offset: 0x17800 },
  { track: 20, numSectors:19, sectorsIn:395, d64Offset: 0x18B00 },
  { track: 21, numSectors:19, sectorsIn:414, d64Offset:0x19E00 },
  { track: 22, numSectors:19, sectorsIn:433, d64Offset:0x1B100 },
  { track: 23, numSectors:19, sectorsIn:452, d64Offset:0x1C400 },
  { track: 24, numSectors:19, sectorsIn:471, d64Offset:0x1D700 },
  { track: 25, numSectors:18, sectorsIn:490, d64Offset:0x1EA00 },
  { track: 26, numSectors:18, sectorsIn:508, d64Offset:0x1FC00 },
  { track: 27, numSectors:18, sectorsIn:526, d64Offset:0x20E00 },
  { track: 28, numSectors:18, sectorsIn:544, d64Offset:0x22000 },
  { track: 29, numSectors:18, sectorsIn:562, d64Offset:0x23200 },
  { track: 30, numSectors:18, sectorsIn:580, d64Offset:0x24400 },
  { track: 31, numSectors:17, sectorsIn:598, d64Offset:0x25600 },
  { track: 32, numSectors:17, sectorsIn:615, d64Offset:0x26700 },
  { track: 33, numSectors:17, sectorsIn:632, d64Offset:0x27800 },
  { track: 34, numSectors:17, sectorsIn:649, d64Offset:0x28900 },
  { track: 35, numSectors:17, sectorsIn:666, d64Offset:0x29A00 },
  { track: 36, numSectors:17, sectorsIn:683, d64Offset:0x2AB00 },
  { track: 37, numSectors:17, sectorsIn:700, d64Offset:0x2BC00 },
  { track: 38, numSectors:17, sectorsIn:717, d64Offset:0x2CD00 },
  { track: 39, numSectors:17, sectorsIn:734, d64Offset:0x2DE00 },
  { track: 40, numSectors:17, sectorsIn:751, d64Offset:0x2EF00 }
];

/*
function petsciiToScreen(p) {
  if (p >= 0 && p < 32) {
    return p + 128;
  } else if (p >= 32 && p < 64) {
    return p;
  } else if (p >= 64 && p < 96) {
    return p - 64;
  } else if (p >= 96 && p < 128) {
    return p - 32;
  } else if (p >= 128 && p < 160) {
    return p + 64;
  } else if (p >= 160 && p < 192) {
    return p - 64;
  } else if (p >= 192 && p < 224) {
    return p - 128;
  } else if (p >= 224 && p < 255) {
    return p - 128;
  } else if (p == 255) {
    return 94;
  } else {
//    throw new Error('impossible - bug above');
  }
}
*/
/*
function petsciiToScreenArray(petscii) {
  //const dst = new Uint8Array(petscii.length);
  var dst = '';
  for (var i = 0; i < petscii.length; i++) {
    //dst += String.fromCharCode(petsciiToScreen(petscii[i]));
    dst += String.fromCharCode(petscii[i]);
  }
  return dst;
}
*/

D64Util.getOffset = function(track, sector) {
  return D64Util.trackInfo[track].d64Offset + sector*256;
}

// each sector is 256 bytes, first byte is next track next byte is next sector
D64Util.d64ReadFile = function(d64Binary, track, sector) {
  var data = [];

  while(1) {
    var offset = D64Util.getOffset(track, sector);
    var nextTrack = d64Binary[offset + 0];
    var nextSector = d64Binary[offset + 1];
    
    var bytesToRead = 254;
    if(nextTrack == 0) {
      bytesToRead = nextSector - 1;
    }

    for(var i = 0; i < bytesToRead; i++) {
      data.push(d64Binary[offset + i + 2]);
    }

    if(nextTrack == 0) {
      break;
    }
    track = nextTrack;
    sector = nextSector;
  }

  return new Uint8Array(data);
}

D64Util.getFirstPRG = function(d64Binary) {

  var dirEntries = D64Util.readDirectory(d64Binary);
  var prgIndex = false;
  for(var i = 0; i < dirEntries.length; i++) {
    if(dirEntries[i].type == 'prg') {
      prgIndex = i;
      break;
    }
  }

  if(prgIndex === false) {
    return null;
  }
  
  var file = D64Util.d64ReadFile(d64Binary, dirEntries[prgIndex].track, dirEntries[prgIndex].sector);
  return file;

}

// http://unusedino.de/ec64/technical/formats/d64.html

/*
The directory track should be contained totally on track 18. Sectors 1-18
contain the entries and sector 0 contains the BAM (Block Availability  Map)
and disk name/ID. Since the directory is only 18 sectors large (19 less one
for the BAM), and each sector can contain only  8  entries  (32  bytes  per
entry), the maximum number of directory entries is 18 * 8 = 144. The  first
directory sector is always 18/1,
*/
D64Util.readDirectory = function(d64Binary) {
  var dirEntries = [];

  var deTrack = 18
  var deSector = 1;
  while (deTrack != 0) {
    var deOffset = D64Util.getOffset(deTrack, deSector);

    var offset = deOffset;
    for (var i = 0; i < 8; i++, offset += 32) {
      // 02: File type.
      var fileType = d64Binary[offset + 2];

      console.log("file type = " + fileType);
      /*
        Typical values for this location are:
          $00 - Scratched (deleted file entry)
          80 - DEL
          81 - SEQ
          82 - PRG
          83 - USR
          84 - REL      
      */
      if (fileType == 0) {
        continue;
      }
      switch (fileType & 7) {
        case 0: 
          fileType = 'del'; 
          break;
        case 1: 
          fileType = 'seq'; 
          break;
        case 2: 
          fileType = 'prg'; 
          break;
        case 3: 
          fileType = 'usr'; 
          break;
        case 4: 
          fileType = 'rel'; 
          break;
        default: 
          fileType = 'unk';
          break;
//        default:
//          throw new Error('Unknown directory entry file type');
      }
      var petsciiName = d64Binary.slice(offset + 0x05, offset + 0x15);

      //03-04: Track/sector location of first sector of file
      var track = d64Binary[offset + 3];
      var sector = d64Binary[offset + 4];
      var sectors = d64Binary[offset + 0x1f] * 256 + d64Binary[offset + 0x1e];

      var name = '';
      for (var i = 0; i < petsciiName.length; i++) {
        name += String.fromCharCode(petsciiName[i]);
      }

      
      dirEntries.push({
        type: fileType,
//        petsciiName,
//        screencodeName: petsciiToScreenArray(petsciiName),
        name: name,
        d64FileOffset: offset + 0x05,
        track: track,
        sector: sector,
        sectors: sectors
      })
    }

    // The first two bytes of the sector ($12/$04) indicate the location of  the
    // next track/sector of the directory (18/4). If the track is set to $00, then
    // it is the last sector of the directory.

    deTrack  = d64Binary[deOffset + 0];
    deSector = d64Binary[deOffset + 1];
    console.log('de track = ' + deTrack + ':' + deSector);
    if (deTrack == 0) {
      break;
    }
  }

  console.log(dirEntries);


  return dirEntries;
}
