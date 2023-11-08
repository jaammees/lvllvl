//  http://unusedino.de/ec64/technical/formats/d64.html
var D64 = function() {
  this.diskName = 'DEFAULT';
  this.diskId = 'LODIS';//lodis';
  this.diskSize = 174848;
  this.nrTracks = 35;
  this.extraTracksBamOffset = 0xc0;
  this.sectorInterleave = 10;
   
  this.useTrack18 = false;
  this.track18Split = true;
  this.d64Image = null;
  this.files = [];

/*
  Track   Sectors/track   # Sectors   Storage in Bytes
  -----   -------------   ---------   ----------------
   1-17        21            357           7820
  18-24        19            133           7170
  25-30        18            108           6300
  31-40(*)     17             85           6020
*/

  this.sectorsPerTrack = [ 21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,
                           19,19,19,19,19,19,19,
                           18,18,18,18,18,18,
                           17,17,17,17,17,
                           17,17,17,17,17 ];

}


D64.prototype = {

  addFile: function(filename, fileData, fileType) {

    // convert string to uppercase
    filename = filename.toUpperCase();

    this.files.push({
      fileType: fileType,
      filename: filename,
      fileData: fileData,
      sectorInterleave: this.sectorInterleave,
      track: 0,
      sector: 0,
      nrSectors: 0
    });
  },

  sectorLocation: function(track, sector) {
    if(track < 1 || track > this.nrTracks) {
      console.error('Illegal track: ' + track);
      return false;
    }

    if(sector < 0 || sector >= this.sectorsPerTrack[track - 1]) {
      console.error('Illegal sector: ' + sector);
    }

    var location = 0;
    for(var i = 0; i < track - 1; i++) {
      location += this.sectorsPerTrack[i];
    }
    location += sector;
    return location;
  },

  isSectorFree: function(track, sector) {
    var bamLocation = this.sectorLocation(18, 0) * 256;

    if(track > 35) {
      track -= 35;
      bamLocation = this.sectorLocation(18, 0) * 256 + this.extraTracksBamOffset;
    }

    var location = bamLocation + track * 4 + 1;
    var sectorByte = (sector / 8) & 0xf;
    var sectorBit = 7 - (sector&7);

    return (this.d64Image[location + sectorByte] & (1 << sectorBit)) != 0;
  },

  markSector: function(track, sector, free) {
    var bamLocation = this.sectorLocation(18, 0) * 256;

    if(free != this.isSectorFree(track, sector)) {
      if(track > 35) {
        track -= 35;
        bamLocation = this.sectorLocation(18, 0) * 256 + this.extraTracksBamOffset;
      }

      if(free) {
        this.d64Image[bamLocation + track * 4 + 0]++;
      } else {
        this.d64Image[bamLocation + track * 4 + 0]--;
      }

      var location = bamLocation + track * 4 + 1;
      var sectorByte = Math.floor(sector / 8) ;//& 0xff;
      var sectorBit = 7 - (sector & 7);


/*
    unsigned char *bitmap=d64image+bam+track*4+1;
    int byte=sector/8;
    int bit=7-(sector&7);

    if (free)
      bitmap[byte]|=1<<bit;
    else
      bitmap[byte]&=~(1<<bit);
*/


      if(free) {
        this.d64Image[location + sectorByte] |= (1 << sectorBit);
      } else {
        this.d64Image[location + sectorByte] &= ~(1 << sectorBit);
      }
    }
  },

  init: function() {
  },

  createD64: function(filename) {

    /*
      The standard D64 is a 174848 byte file comprised of 256 byte
      sectors arranged in 35 tracks with a varying number of  sectors  per  track
      for a total of 683 sectors. Track counting starts at 1, not 0, and goes  up
      to 35. Sector counting starts at 0, not 1, for the first sector,  therefore
      a track with 21 sectors will go from 0 to 20.
    */


    this.diskSize = 174848;
    if(this.nrTracks > 35) {
      this.diskSize += 5 * 17 * 256;
    }

    // create and clear image
    this.d64Image = new Uint8Array(this.diskSize);
    for(var i = 0; i < this.diskSize; i++) {
      this.d64Image[i] = 0;
    }

    /*
      The directory track should be contained totally on track 18. Sectors 1-18
      contain the entries and sector 0 contains the BAM (Block Availability  Map)
      and disk name/ID.    
    */


    /*
      Bytes:$00-01: Track/Sector location of the first directory sector (should
                    be set to 18/1 but it doesn't matter, and don't trust  what
                    is there, always go to 18/1 for first directory entry)
                02: Disk DOS version type (see note below)
                      $41 ("A")
                03: Unused
    */

    var bamLocation = this.sectorLocation(18, 0) * 256;
    this.d64Image[bamLocation + 0] = 0x12;
    this.d64Image[bamLocation + 1] = 0x1;
    this.d64Image[bamLocation + 2] = 0x41;
    this.d64Image[bamLocation + 3] = 0x0;


    // mark all the sectors as free
    for(var t = 1; t < this.nrTracks; t++) {
      for(var s = 0; s < this.sectorsPerTrack[t - 1]; s++) {
        this.markSector(t, s, true);
      }
    }

    // write out the disk name

    /*
      BAM
        90-9F: Disk Name (padded with $A0)
    */

    this.diskName = this.diskName.toUpperCase();
    for(var i = 0; i < 16; i++) {
      if(i < this.diskName.length) {
        this.d64Image[bamLocation + 0x90 + i] = this.diskName.charCodeAt(i);
      } else {
        this.d64Image[bamLocation + 0x90 + i] = 0xa0;
      }
    }

    /*
     BAM
         A0-A1: Filled with $A0
    */
    this.d64Image[bamLocation + 0xa0] = 0xa0;
    this.d64Image[bamLocation + 0xa1] = 0xa1;

    /*
         A2-A3: Disk ID
            A4: Usually $A0
    */
    for(var i = 0; i < 2; i++) {
      if(i < this.diskId.length) {
        this.d64Image[bamLocation + 0xa2 + i] = this.diskId.charCodeAt(i);
      } else {
        this.d64Image[bamLocation + 0xa2 + i] = 0xa0;
      }
    }
    this.d64Image[bamLocation + 0xa4] = 0xa0;

    /*
     A5-A6: DOS type, usually "2A" ???
    */
    this.d64Image[bamLocation + 0xa5] = 0x32;
    this.d64Image[bamLocation + 0xa6] = 0x41;


    /*
    A7-AA: Filled with $A0
    AB-FF: Normally unused ($00), except for 40 track extended format,
             see the following two entries:
    */
    this.d64Image[bamLocation+0xa7]=0xa0;
    this.d64Image[bamLocation+0xa8]=0xa0;
    this.d64Image[bamLocation+0xa9]=0xa0;
    this.d64Image[bamLocation+0xaa]=0xa0;

    // Reserve space for BAM+directory
    this.markSector(18, 0, false);

    /*
      if (usetrack18)
      {
        printf("Tagging %d blocks on track 18 for directory structure\n", nrFiles/8+1);
        for (int i=0; i<nrFiles/8+1; i++)
          markSector(d64image, 18, i+1, false);
      }
    */

    // write files and mark sectors in bam
    var track = 1;
    var sector = 0;
    var bytesToWrite = 0;
    var lastTrack = track;
    var lastSector = sector;
    var lastOffset = this.sectorLocation(lastTrack, lastSector) * 256;
 
    for(var i = 0; i < this.files.length; i++) {
      var fileSize = this.files[i].fileData.length;
      var fileData = this.files[i].fileData;


      var byteOffset = 0;
      var bytesLeft = fileSize;
      while(bytesLeft > 0) {
        // Find free track&sector, starting from current T/S forward one revolution, then the next track etc... skip T18
        // If the file didn't fit before track 18 then restart on track 19 and try again.
        // If the file didn't fit before track 36 then the disk is full.

        var found = false;
        var findSector=0;
  
        while(!found) {
          for (var s = sector; s < sector + this.sectorsPerTrack[track-1]; s++) {
            findSector = s % this.sectorsPerTrack[track-1];
            if (this.isSectorFree(track, findSector)) {
              found=true;
              break;
            }
          }

          if(!found) {
            track++;
            sector=0;
            if(!this.useTrack18) {
              if(track == 18) {
                // Delete old fragments and restart file
                if(!this.track18Split) {
                  if (this.files[i].nrSectors>0) {
                    var deltrack = this.files[i].track;
                    var delsector = this.files[i].sector;
                    while(deltrack!=0)  {
                      this.markSector(deltrack, delsector, true);
                      var offset = this.sectorLocation(deltrack, delsector)*256;
                      deltrack = this.d64Image[offset+0];
                      delsector = this.d64Image[offset+1];
                      for(var j = 0; j < 256; j++) {
                        this.d64Image[offset + j] = 0;
                      }
                    }
                  }

                  bytesLeft = fileSize;
                  byteOffset = 0;
                  this.files[i].nrSectors = 0;
                }
                track = 19;
              }
            }
          
            if (track == this.nrTracks+1) {
              console.error('disk full!');
              return false;
            }
          }
        }
        sector = findSector;
        var offset = this.sectorLocation(track, sector) * 256;

        if(bytesLeft==fileSize) {
          this.files[i].track = track;
          this.files[i].sector = sector;
          lastTrack = track;
          lastSector = sector;
          lastOffset=offset;
        } else {
          this.d64Image[lastOffset+0] = track;
          this.d64Image[lastOffset+1] = sector;
        }

        // Write sector
        bytesToWrite = 254;//min(254, bytesLeft);
        if(bytesLeft < bytesToWrite) {
          bytesToWrite = bytesLeft;
        }
        for (var j=0; j < bytesToWrite; j++) {
          this.d64Image[offset + 2 + j] = fileData[j+byteOffset];
        }

        bytesLeft -= bytesToWrite;
        byteOffset += bytesToWrite;
      
        lastTrack = track;
        lastSector = sector;
        lastOffset = offset;

        this.markSector(track, sector, false);
        //lastByteOnSector[track-1][sector]=bytesToWrite+1;

        sector += this.files[i].sectorInterleave;
        this.files[i].nrSectors++;
      }

      this.d64Image[lastOffset+0] = 0x00;
      this.d64Image[lastOffset+1] = bytesToWrite+1;
    }


    // Create directory entries
    /*
      Bytes: $00-1F: First directory entry
          00-01: Track/Sector location of next directory sector ($00 $00 if
                 not the first entry in the sector)
             02: File type.
                 Typical values for this location are:
                   $00 - Scratched (deleted file entry)
                    80 - DEL
                    81 - SEQ
                    82 - PRG
                    83 - USR
                    84 - REL
                 Bit 0-3: The actual filetype
                          000 (0) - DEL
                          001 (1) - SEQ
                          010 (2) - PRG
                          011 (3) - USR
                          100 (4) - REL
                          Values 5-15 are illegal, but if used will produce
                          very strange results. The 1541 is inconsistent in
                          how it treats these bits. Some routines use all 4
                          bits, others ignore bit 3,  resulting  in  values
                          from 0-7.
                 Bit   4: Not used
                 Bit   5: Used only during SAVE-@ replacement
                 Bit   6: Locked flag (Set produces ">" locked files)
                 Bit   7: Closed flag  (Not  set  produces  "*", or "splat"
                          files)
          03-04: Track/sector location of first sector of file
          05-14: 16 character filename (in PETASCII, padded with $A0)
          15-16: Track/Sector location of first side-sector block (REL file
                 only)
             17: REL file record length (REL file only, max. value 254)
          18-1D: Unused (except with GEOS disks)
          1E-1F: File size in sectors, low/high byte  order  ($1E+$1F*256).
                 The approx. filesize in bytes is <= #sectors * 254
          20-3F: Second dir entry. From now on the first two bytes of  each
                 entry in this sector  should  be  $00  $00,  as  they  are
                 unused.
          40-5F: Third dir entry
          60-7F: Fourth dir entry
          80-9F: Fifth dir entry
          A0-BF: Sixth dir entry
          C0-DF: Seventh dir entry
          E0-FF: Eighth dir entry
    */

    //var nrFiles = this.files.length;
    var curFile = 0;
    var filesLeft = this.files.length;//nrFiles;
    sector = 1;
    var entryOnSector=0;
    while(filesLeft > 0) {
      var entryOffset = this.sectorLocation(18,sector) * 256 + entryOnSector * 32;

      this.markSector(18, sector, false);

      if ((entryOnSector == 0) && (filesLeft > 8)) {
        this.d64Image[entryOffset + 0] = 18;
        this.d64Image[entryOffset + 1] = sector + 1;
      } else {
        this.d64Image[entryOffset + 0] = 0;
        this.d64Image[entryOffset + 1] = 0;
      }

      var fileType = 0x82;
      switch(this.files[curFile].fileType) {
        case 'del':
          fileType = 0x80;
        break;
        case 'seq':
          fileType = 0x81;
        case 'prg':
          fileType = 0x82;
        break;
        case 'usr':
          fileType = 0x83;
        break;
        case 'rel':
          fileType = 0x84;
        break;
      }
      this.d64Image[entryOffset + 2] = fileType;//0x82;
      this.d64Image[entryOffset + 3] = this.files[curFile].track; //Track
      this.d64Image[entryOffset + 4] = this.files[curFile].sector;  //Sector

      for (var i=0; i < 16; i++) {
        if(i < this.files[curFile].filename.length) {
          this.d64Image[entryOffset + 5 + i] = this.files[curFile].filename.charCodeAt(i);
        } else {
          this.d64Image[entryOffset + 5 + i] = 0xa0;
        }
      }

      this.d64Image[entryOffset + 0x1e] = this.files[curFile].nrSectors & 255;  // lo size
      this.d64Image[entryOffset + 0x1f] = this.files[curFile].nrSectors >> 8; // hi size

      filesLeft--;
      curFile++;
      entryOnSector++;
      if (entryOnSector == 8) {
        sector++;
        entryOnSector=0;
      }
    }


/*
//  printf("%s (%s,%s):\n", image, name,id);
//    console.log(image + "(" + name + "," + id + ")");
    for (var i=0; i<this.files.length; i++) {
//    printf("%3d \"%s\" => \"%s\" (SL:%d)", files[i].nrSectors, files[i].localname, files[i].filename, files[i].sectorInterleave);
      console.log(this.files[i].nrSectors + " " + this.files[i].filename + " SL: " + this.files[i].sectorInterleave);
      var track = this.files[i].track;
      var sector = this.files[i].sector;
      var j=0;
      while(track!=0) {
        if (j==0) {
//          console.log("     ");
//                printf("\n    ");
        }
//        console.log(track + "/" + sector);
//      printf("%02d/%02d ",track,sector);
        var offset = this.sectorLocation(track,sector) * 256;
        track = this.d64Image[offset+0];
        sector = this.d64Image[offset+1];
        j++;
        if(j==10) {
          j=0;
        }
      }
//    printf("\n");
    }

*/

    // work out sectors free..
    var sectorsFree=0;
    var sectorsFreeOnTrack18=0;
    for(var t = 1; t <= this.nrTracks; t++) {
//    printf("%2d: ",t);
//      console.log(t + ": ");
      for(var s=0; s < this.sectorsPerTrack[t-1]; s++) {
        if(this.isSectorFree(t, s)) {
//          console.log("0");
        //printf("0");
          if (t != 18) {
            sectorsFree++;
          } else {
            sectorsFreeOnTrack18++;
          }
        } else {
//          console.log("1");
//          printf("1");
        }
      }
      //printf("\n");
    }

//console.log(this.d64Image);
    download(this.d64Image, filename, "application/d64");   

    var blocksFree = sectorsFree + sectorsFreeOnTrack18;
//    console.log(sectorsFree + " (" + blocksFree + ") BLOCKS FREE");
//  printf("%3d (%d) BLOCKS FREE\n", sectorsFree, sectorsFree+sectorsFreeOnTrack18);

//  // Save image
//  FILE *f=fopen(image, "wb");//
//  fwrite(d64image, diskSize, 1, f);
//  fclose(f);

  }
}


/*
var d64 = new D64();
var data = new Uint8Array(600);
for(var i = 0; i < 100; i++) {
  data[i] = 16 + i;
}
d64.addFile("test", data, "prg");
d64.addFile("hello del", data, "del");
//d64.addFile("test.del", new Uint8Array(1));

d64.createD64();

*/