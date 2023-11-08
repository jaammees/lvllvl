function bufferToBase64(buf) {
  var binstr = Array.prototype.map.call(buf, function (ch) {
      return String.fromCharCode(ch);
  }).join('');
  return btoa(binstr);
}

function base64ToBuffer(base64) {
  var binstr = atob(base64);
  var buf = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, function (ch, i) {
    buf[i] = ch.charCodeAt(0);
  });
  return buf;
}

function isString (value) {
  return typeof value === 'string' || value instanceof String;
}

var Document = function() {
  this.data = {};


  this.savingToBrowserStorage = false;

  this.binaryExtensions = [
    'prg',
    'bin',
    'rom',
    'nes'
  ];

//  this.nesConfig = '';

  this.modified = {};
}

Document.prototype = {
  /*
  initNESConfig: function() {
    this.nesConfig = 'MEMORY { \n';
    this.nesConfig += '  ZP:     start = $00,    size = $0100, type = rw, file = "";\n';
    this.nesConfig += '  OAM:    start = $0200,  size = $0100, type = rw, file = "";\n';
    this.nesConfig += '  RAM:    start = $0300,  size = $0500, type = rw, file = "";\n';
    this.nesConfig += '  HDR:    start = $0000,  size = $0010, type = ro, file = %O, fill = yes, fillval = $00;\n';
    this.nesConfig += '  PRG:    start = $8000,  size = $8000, type = ro, file = %O, fill = yes, fillval = $00;\n';
    this.nesConfig += '  CHR:    start = $0000,  size = $2000, type = ro, file = %O, fill = yes, fillval = $00;\n';
    this.nesConfig += '}\n\n';

    this.nesConfig += 'SEGMENTS {\n';
    this.nesConfig += '  ZEROPAGE: load = ZP,  type = zp;\n';
    this.nesConfig += '  OAM:      load = OAM, type = bss, align = $100;\n';
    this.nesConfig += '  BSS:      load = RAM, type = bss;\n';
    this.nesConfig += '  HEADER:   load = HDR, type = ro;\n';
    this.nesConfig += '  CODE:     load = PRG, type = ro,  start = $8000;\n';
    this.nesConfig += '  RODATA:   load = PRG, type = ro;\n';
    this.nesConfig += '  VECTORS:  load = PRG, type = ro,  start = $FFFA;\n';
    this.nesConfig += '  TILES:    load = CHR, type = ro;\n';
    this.nesConfig += '}\n';
  },
*/
/*
  initData: function() {
    alert('is this used???');

    this.data = {

    };

    this.initNESConfig();

    var content = '';

    content += '*= $0801;       doc version... The program counter definition\n';
    content += '!byte    $0E, $08, $0A, $00, $9E, $20, $28,  $33, $30, $37, $32, $29, $00, $00, $00\n';
    content += '*= $0c00;\n';

    content += '   lda   #03\n';
    content += '   sta   $d020\n';
    content += 'loop\n';
    content += '   jmp   loop\n';


    var content2 = '; file two..';

    this.data = {
      children: [
        {
          id:   1,
          name: "settings",
          type: "hiddenfile",
          data: {
            "guid": 1

          }
        },
        {
          id:   2,
          name: "asm",
          type: "folder",
          children: [
            {
              name: "main.asm",
              type: "c64asm",
              data: content
            }, 
            {
              name: "nes.cfg",
              type: "c64asm",
              data: this.nesConfig
            },
            {
              name: "stdlib.asm",
              type: "c64asm",
              data: content2

            }
          ]
        },
        {
          id:   3,          
          name: "music",
          type: "folder",
          children: [
            {
              name: "default",
              type: "c64music",
              data: {
                
              }
            }
          ]
        },
        {
          id:   4,          
          name: "color palettes",
          type: "folder",
          children: [
          ]
        },
        {
          id:   5,
          name: "tile sets",
          type: "folder",
          children: [
            {
              name: "default",
              type: "preset",
              data: {
                width: 8,
                height: 8,
                tiles: [
                ]
              }

            }
          ]
        },
        {
          id:   6,
          name: "block sets",
          type: "folder",
          children: [
          ]
        },
        {
          id:   7,          
          name: "screens",
          type: "folder",
          children: [
            {
              name: "default",
              type: "textmode",
              settings: {
                "width": 40,
                "height": 25,
                "depth": 1
              },
              data: {
                "layers": [
                ],
                "frames": [
                ]
              }
            }
          ]
        }
      ]
    };

  },
*/

  // init gets called every time a document is created
  init: function(editor) {
    if(typeof editor != 'undefined') {
      this.editor = editor;
    } else {
      this.editor = g_app;
    }
    this.data = {
      children: [
        {
          id:   1,
          name: "settings",
          type: "hiddenfile",
          data: {
            "guid": 1

          }
        }
      ]
    };
  },


  deleteDocRecord: function(path) {

    // need to get the parent record..
    var slashPos = path.lastIndexOf('/');
    if(slashPos == -1) {
      // uh oh
      return false;
    }

    var parentPath = path.substring(0, slashPos);
    var recordName = path.substring(slashPos + 1);

    var parentRecord = this.getDocRecord(parentPath);
    if(!parentRecord) {
      return false;
    }

    // find the index of the record to delete
    var children = parentRecord.children;
    var recordIndex = false;
    for(var i = 0; i < children.length; i++) {
      if(children[i].name == recordName) {
        recordIndex = i;
        break;
      }
    }

    // couldn't find record to delete..
    if(recordIndex === false) {
      return false;
    }

    var record = children[recordIndex];

//    children.splice(recordIndex, 1);

    // just mark it as deleted
    // delete properly when saving..
    children[recordIndex].deleted = true;

    this.recordModified(record, path);


    return true;

  },


  getTypeFromPath: function(path) {

    if(path.length === 0) {
      return;
    }

    if(path[0] == '/') {
      path = path.substr(1);
    }
    var pathArray = path.split('/');
    var extension = '';
    var dotPos = path.lastIndexOf('.');

    if(dotPos != -1) {
      extension = path.substr(dotPos + 1);
      extension = extension.toLowerCase().trim();
    }

    if(extension != '' && extension != 'json') {
      // ok can determins type from extension
      return extension;
    }

    // need to look at path to get type
    switch(pathArray[0]) {
      case 'screens':
        return 'screen';
      break;
      case 'sprites':
        return 'sprite';
        break;
      case '3d scenes':
        return '3d scene';
        break;
      
    }


  },
  // set a doc record, create if doesn't exist
  setDocRecord: function(path, content) {
    
    var docRecord = this.getDocRecord(path);
    if(docRecord) {
      docRecord.data = content;
    } else {
      var pathArray = path.split('/');
      var parentPath = '';
      for(var i = 1; i < pathArray.length; i++) {
        var name = pathArray[i];
        parentPath = parentPath + '/';
        var docRecord  = this.getDocRecord(parentPath  + name);
        if(!docRecord) {
          // need to create it
          type = 'folder';
          data = {};

          if(i == pathArray.length - 1) {
            // ok this is the actual doc, need to look at extension to get type
            type = this.getTypeFromPath(path);
            data = content;
          }

          // need to get rid of the last slash
          if(parentPath.length > 1) {
            parentPath = parentPath.substr(0, parentPath.length - 1);
          }
          this.createDocRecord(parentPath, name, type, data);
          // put the slash back
          if(parentPath.length > 1) {
            parentPath += '/';
          }
        }
        parentPath += name;
      }
    }

    // make sure the parent path exists

  },

  createDocRecord: function(parentPath, name, type, data, createAsId) {
    var id = createAsId;
    if(typeof createAsId == 'undefined' || createAsId === false) {
      id = g_app.getGuid();
    }


    var parent = this.getDocRecord(parentPath);
    var record = { id: id, name: name, type: type, data: data, children: [] };

    parent.children.push(record);

    if(parentPath[parentPath.length - 1] != '/') {
      parentPath += '/';
    }
    
    this.recordModified(record, parentPath + name);
    

    return record;
  },


  getDocRecordById: function(id, parentPath) {
    var parentRecord = null;
    if(typeof parentPath != 'undefined') {
      var parentRecord = this.getDocRecord(parentPath);
    }

    if(parentRecord) {
      var children = parentRecord.children;
      for(var j = 0; j < children.length; j++) {
        if(children[j].id == id) {
          return children[j];
        }
      }
    }
    return null;
  },

  // what if doesnt have a sha, does that mean this version is later version??
  // check if have the version corresponding to the sha
  hasVersion: function(path, sha) {
    if(path.length > 0 && path[0] != '/') {
      path = '/' + path;
    }

    var record = this.getDocRecord(path);
    if(record == null) {
      // dont have this doc...
      console.log("record doesn't exist!!!!!!");
      return false;
    }

    if(typeof record.sha == 'undefined') {
      // dont have a sha... is this a later version??
      console.log('record doesnt have a sha!!!');
      return true;
    }

    if(record.sha != sha) {
      // sha doesnt match

      // shoud this return true or false?
      if(record.sha != 'modified') {
        return false;
      }
    }

    return false;
  },

  recordSaved: function(id) {
    if(this.modified.hasOwnProperty(id)) {
      delete this.modified[id];
    }
  },

  recordModified: function(record, path) {

    var id = record.id;

    if(record.sha !== 'modified') {
      record.sha = 'modified';
      g_app.projectNavigator.updateModifiedList();

    }
    // check if file already in modified list
    if(!this.modified.hasOwnProperty(id)) {
      this.modified[id] = {
        path: path
      }
    }
  },

  getDocRecord: function(path) {
    // trimLeft, trimRight
    if(path == '/') {
      return this.data;
    }

    path = path.trim();

    if(path.length == 0 || path[0] != '/') {
      path = this.currentDirectory + path;
    }

    var pathParts = path.split('/');


    var currentRecord = this.data;
    for(var i = 1; i < pathParts.length; i++) {
      var filename = pathParts[i];

      var children = currentRecord.children;

      currentRecord = null;

      for(var j = 0; j < children.length; j++) {
        if(children[j].name == filename) {
          currentRecord = children[j];
          break;
        }
      }

      if(currentRecord == null) {
        return null;
      }
    }

    return currentRecord;

  },


  dir: function(path) {
    var fileRecord = this.getDocRecord(path);
    if(fileRecord == null) {
      return null;
    }
    return fileRecord.children;
  },

  folderExists: function(path, create) {
    var createFolder = false;
    if(typeof create != 'undefined') {
      createFolder = create;
    }

    var pathParts = path.split('/');
    var currentPath = '';
    var parentRecord = this.getDocRecord('/');
    var exists = true;

    for(var i = 0; i < pathParts.length; i++) {
      var name = pathParts[i].trim();
      var parentPath =  currentPath;
      if(name !== '') {
        currentPath += '/' + name;
      }
      var record = this.getDocRecord(currentPath);
      if(record == null) {
        exists = false;
        if(create) {
          this.createDocRecord(parentPath, name, 'folder', {});
        } else {
          return false;
        }
      }
      
    }

    return exists;
  },


  checkFormat: function(data) {
    // check the format
    var oldFormat = false;

    if(typeof data.children == 'undefined') {
      return;
    }
    for(var i = 0; i < data.children.length; i++) {
      if(data.children[i].name == 'screens') {
        if(data.children[i].children[0].type == 'textmode') {
          // convert it..
          oldFormat = true;
          break;
        }
      }
    }

    if(oldFormat) {
      var importOld = new ImportOld();
      importOld.read(data);            
    }

  },

  loadJSONExport: function(data, callback) {
    
    //g_app.textModeEditor.colorPaletteManager.clear();

    g_app.newProject({}, function() {
      if(typeof data.tileSet != 'undefined') {
        var tileSet = g_app.textModeEditor.tileSetManager.getCurrentTileSet();
        if(tileSet) {
          tileSet.readJsonDataV1({ jsonData: data.tileSet });
          // need to redraw it
          g_app.textModeEditor.tileSetManager.tileSetUpdated({ updateBlankCells: true, updateSortMethods: true });
        }
      }

      if(typeof data.colorPalette != 'undefined') {
        var colorPalette = g_app.textModeEditor.colorPaletteManager.getCurrentColorPalette();
        if(colorPalette) {
          colorPalette.loadFromJSON(data.colorPalette);
        }
      }

      if(typeof data.tileMap != 'undefined') {
        g_app.textModeEditor.graphic.loadJSON(data.tileMap);

      }

      callback();
    });
  },

  loadLocalFile: function(contents, callback) {
    // is it zip file or json?

    if(contents[0] == '{' || contents[0] == '[') {
      var data = $.parseJSON(contents);


      if( (typeof data.tileMap != 'undefined' && typeof data.tileMap.layers != 'undefined')
          || (typeof data.tileSet != 'undefined' && typeof data.tileSet.tiles != 'undefined')
          || (typeof data.colorPalette != 'undefined' && typeof data.colorPalettel.data != 'undefiend') ) {
        // load export file
        this.loadJSONExport(data, callback);
        return;
      }

      this.checkFormat(data);
      this.data = data;
      if(callback != 'undefined') {
        callback();
      }
    } else {
      var _this = this;
      var zip = new JSZip();
      zip.loadAsync(contents, { base64: true }).then(function(zip) {
        zip.file("data.json").async("string").then(function(data) {
          
          var data =  $.parseJSON(data);

          _this.checkFormat(data);

          _this.data = data;
          if(callback != 'undefined') {
            callback();
          }
        });
      });
    }


  },

  downloadAs: function(filename, args) {
    var data = JSON.stringify(this.data);
/*
    var zip = new JSZip();
    zip.file("data.json", data);

    zip.generateAsync({
      type:"base64",
      compression:"DEFLATE",
      compressionOptions: {
        level: 9
      }
     })
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
    });    
*/
/*
    if(filename.indexOf('.json') == -1) {
      filename += ".json";
    }
    download(data, filename, "application/json");    
*/

    if(filename.indexOf('.zip') == -1) {
      filename += '.zip';
    }    

    this.createZipFile({}, function(blob) {
      download(blob, filename, "application/zip");
    });
  },

  addRecord: function(args) {
    var path = args.path;
    var data = args.content;
    var sha = args.sha;

    var deleted = false;
    if(typeof args.deleted != 'undefined') {
      deleted = args.deleted;
    }

    if(path.length > 0 && path[0] != '/') {
      path = '/' + path;
    }
    var id = args.id; // dont need this..


    try {
      var slashPos = path.lastIndexOf('/');
      var parentPath = path.substring(0, slashPos).trim();
      while(parentPath.length > 0 && parentPath[0] === '/') {
        parentPath = parentPath.substr(1);
      }
      
      var name = path.substring(slashPos + 1);
      var extension = '';
      var dotPos = name.lastIndexOf('.');
      if(dotPos !== -1) {
        extension = name.substring(dotPos + 1).trim().toLowerCase();
      }

      // if extension is json, remove it from the name
      // only do this for color palette, screen, etc?
      if(extension == 'json' 
          && (
            parentPath == 'color palettes'
            || parentPath == 'tile sets'
            || parentPath == 'screens'
            || parentPath == 'sprites'
            || parentPath == 'music'
            || parentPath == '3d scenes'
          )
      
      ) {
        name = name.substring(0, dotPos);
      }




      // make sure the parent path exists
      this.folderExists(parentPath, true);

      // get the record if it already exists
      var record = this.getDocRecord(path);

      switch(parentPath) {
        case 'color palettes':
          if(isString(data)) {
            data = $.parseJSON(data);
          }
          var id = data.id;

          if(!record) {
            // need to create record
            var colorPaletteId = g_app.textModeEditor.colorPaletteManager.createColorPalette({
              id: id,
              name: name
            });
            record = this.getDocRecordById(colorPaletteId, '/color palettes');
          } else {
            if(typeof id != 'undefined') {
              record.id = id;
            }
          }

          var colorPalette = g_app.textModeEditor.colorPaletteManager.getColorPalette(record.id);
          colorPalette.loadFromJSON(data);      
        break;
        case 'tile sets':
          if(isString(data)) {
            data = $.parseJSON(data);
          }

          if(data != null) {

            var id = data.id;

            if(!record) {
              // need to create the record
              var tileSetId = g_app.textModeEditor.tileSetManager.createTileSet({
                id: id,
                name: name
              });

              record = this.getDocRecordById(tileSetId, '/tile sets');
            } else {
              if(typeof id != 'undefined') {
                record.id = id;
              }
            }

            var tileSet = g_app.textModeEditor.tileSetManager.getTileSet(record.id);
            tileSet.readJsonDataV1({ jsonData: data });      
          } else {
            console.error('tileset data is NULL!!!!!!');
            console.log(g_app.doc);
          }
        break;
        case 'screens':
        case 'sprites':
          if(isString(data)) {
            data = $.parseJSON(data);
          }

          if(typeof data.id === 'undefined') {                
            data.id = g_app.getGuid();
          }
          if(!record) {
            record = this.createDocRecord('/' + parentPath, name, 'graphic', data, data.id);      
          } else {

            record.id = data.id;

            record.data = data;
          }
        break;
        case '3d scenes':
          console.error('ADD A 3d SCENE!!!');
          if(isString(data)) {
            data = $.parseJSON(data);
          }

          if(typeof data.id === 'undefined') {                
            data.id = g_app.getGuid();
          }
          if(!record) {
            record = this.createDocRecord('/' + parentPath, name, '3d scene', data, data.id);      
          } else {
            record.id = data.id;
            record.data = data;
          }
          break;
        case 'music':
          if(isString(data)) {
            data = $.parseJSON(data);
          }

          if(typeof data.id == 'undefined') {                
            data.id = g_app.getGuid();
          }
          if(!record) {
            record = this.createDocRecord('/' + parentPath, name, 'music', data, data.id);      
          } else {
            record.id = data.id;
            record.data = data;
          }
        break;
        default:

          var type = '';
          if(extension == 's' || extension == 'asm' || extension == 'dasm') {
            // its an asm file
            type = 'asm';
          } else if(extension == 'js') {
            type = 'script';
          } else {
            type = extension;
          }        

          // not sure why check for type != '' was in there..
          if(!record) {//} || type != '') {
            record = this.createDocRecord('/' + parentPath, name, type, data);
          } else {
            record.data = data;
          }

          break;
      }

      record.sha = sha;
      record.deleted = deleted;
    } catch(err) {
      console.log('error');
      console.log(err);
    }

  },

  // check if file is binary by looking at filename
  isBinary: function(filename) {
    var extension = '';
    var pos = filename.lastIndexOf('.');
    if(pos !== -1) {
      extension = filename.substr(pos + 1).toLowerCase();
    }
    
    return this.binaryExtensions.indexOf(extension) !== -1;
  },


  processZipContents: function(files, fileIndex, zip, callback) {
    var _this = this;
    var zipEntry = files[fileIndex].zipEntry;
    var relativePath = files[fileIndex].relativePath;

    var filename = zipEntry.name;
    var extension = '';
    var pos = filename.lastIndexOf('.');
    if(pos !== -1) {
      extension = filename.substr(pos + 1).toLowerCase();
    }
    
    var type ='text';
    var isBinaryFile = _this.binaryExtensions.indexOf(extension) !== -1;

    if(isBinaryFile) {
      type = 'base64';
    }

    zip.file(filename).async(type).then(function(data) {
      if(extension == 'json') {
        data = $.parseJSON(data);
      }

      _this.addRecord({
        path: filename,
        content: data,
        sha: ''
      });

      fileIndex++;
      if(fileIndex >= files.length) {
        callback();
      } else {
        _this.processZipContents(files, fileIndex, zip, callback);
      }

    });

  },

  loadZipFile: function(file, callback) {
    var _this = this;
    JSZip.loadAsync(file)                                   
    .then(function(zip) {
      try {
        var fileCount = 0;
        var files = [];

        // only want to process the files, not directories
        // also need to know how many files
        zip.forEach(function (relativePath, zipEntry) {  
          if(!zipEntry.dir) {
            fileCount++;
            files.push({relativePath: relativePath, zipEntry: zipEntry });
          }
        });

        var filesProcessed = 0;

        _this.processZipContents(files, 0, zip, function() {
          _this.openDoc();

          if(typeof callback != 'undefined') {
            callback();
          }
        });

      } catch(err) {
        console.log('error');
        console.log(err);
      }
    }, function (e) {
      console.log(e);
      // error
    });
  },

  createZipFile: function(args, callback) {
    var files = this.getFiles({});

    var zip = new JSZip();

    var zipFolders = {};

    // get the folders..
    for(var i = 0; i < files.length; i++) {

      if(typeof files[i].deleted == 'undefined' || files[i].deleted !== true) {
        var type = 'file';
        if(typeof files[i].type !== 'undefined') {
          type = files[i].type;
        }
        var path = files[i].path.split('/');
        var folderPath = '';
        var parentFolder = zip;

        var folderPathLength = path.length - 1;
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
    }

    // compression = "STORE" means no compression

//    filename = 'stuff';
    zip.generateAsync({
      type:"blob" ,
      compression: "DEFLATE",
      compressionOptions: {
          level: 9
      }
      
    }).then(function (blob) {
      if(typeof callback != 'undefined') {
        callback(blob);
      }
//      download(blob, filename + ".zip", "application/zip");
    });   
  },


  // set this doc as currently being edited
  // open the view for the doc
  openDoc: function(args) {

    try {
      g_app.doc = this;

      var view = false;

      if(typeof args != 'undefined') {
        if(typeof args.view !== 'undefined') {
          view = args.view;
        }
      }


      g_app.projectNavigator.refreshTree();


      // get the first screen so can make it the default view.
      var dir = g_app.doc.dir('/screens');

      if(dir && dir.length > 0) {
        var firstScreen = dir[0].name;
        if(view === false) {
          view = '/screens/' + firstScreen;
        }

        view = view.trim();
        if(view.length > 0 && view[0] != '/') {
          view = '/' + view;
        }
      }

      if(view !== false) {
        var record = g_app.doc.getDocRecord(view);
        if(!record) {
          // uh oh, the view doesn't exist...
          view = false;
        }
      }

      if(view != false) {
        g_app.projectNavigator.showDocRecord(view);
      } else {
        g_app.setMode('none');
      }

    } catch(err) {
      console.log(err);
    }
  },

  // get the list of files with sha set to modified..
  getModifiedRecordsList: function(args) {
    var parentFolder = '';
    var files = [];

    if(typeof args != 'undefined') {
      if(typeof args.parentFolder != 'undefined') {
        parentFolder = args.parentFolder;
      }
    }


    var doc = g_app.doc;
    var docRecords = doc.dir(parentFolder);
    for(var i = 0; i < docRecords.length; i++) {
      if(docRecords[i].type != 'hiddenfile') {
        var file = docRecords[i];
        var type = file.type;
        var id = file.id;
        var name = file.name;
        var sha = '';
        if(typeof file.sha !== 'undefined') {
          sha = file.sha;
        }

        var extension = '';
        var dotPos = name.lastIndexOf('.');
        if(dotPos !== -1) {
          extension = name.substring(dotPos + 1).toLowerCase();
        }

        var type = docRecords[i].type;
        switch(type) {
          case 'folder':
            var folder = parentFolder + '/' + name;
            var folderFiles = this.getModifiedRecordsList({ parentFolder: folder });
            if(folderFiles.length > 0) {
              for(var j = 0; j < folderFiles.length; j++) {
                files.push(folderFiles[j]);
              }
            }
            break;
          default:
            if(sha === 'modified') {
              files.push({
                name: name,
                path: parentFolder + '/' + name
              });
            }
            break;
        }
      }
    }
    return files;
  },

  // get the files as a flat list
  getFiles: function(args) {
    var parentFolder = '';
    var doStringify = false;
    var includeEmptyFolders = true;
    var files = [];

    if(typeof args != 'undefined') {
      if(typeof args.parentFolder != 'undefined') {
        parentFolder = args.parentFolder;
      }

      if(typeof args.doStringify != 'undefined') {
        doStringify = args.doStringify;
      }

      if(typeof args.includeEmptyFolders != 'undefined') {
        includeEmptyFolders = args.includeEmptyFolders;
      }
    }

    
    var doc = g_app.doc;
    var docRecords = doc.dir(parentFolder);
    for(var i = 0; i < docRecords.length; i++) {
      if(docRecords[i].type != 'hiddenfile') {
        var file = docRecords[i];
        var type = file.type;
        var id = file.id;
        var name = file.name;
        var sha = '';
        var deleted = false;

        if(typeof file.sha !== 'undefined') {
          sha = file.sha;
        }

        if(typeof file.deleted != 'undefined') {
          deleted = file.deleted;
        }

        var extension = '';
        var dotPos = name.lastIndexOf('.');
        if(dotPos !== -1) {
          extension = name.substring(dotPos + 1).toLowerCase();
        }
        var isBinary = this.binaryExtensions.indexOf(extension) !== -1;
        

        var type = docRecords[i].type;
        switch(type) {
          case 'folder':
            var folder = parentFolder + '/' + name;
            var folderFiles = this.getFiles({ doStringify: doStringify, parentFolder: folder, includeEmptyFolders: includeEmptyFolders });
            if(folderFiles.length > 0) {
              for(var j = 0; j < folderFiles.length; j++) {
                files.push(folderFiles[j]);
              }
            } else {
              if(includeEmptyFolders) {
                // empty folder
                files.push({
                  id: id,
                  deleted: deleted,
                  name: name,
                  content: '',
                  type: 'folder',
                  path: parentFolder + '/' + name,
                });
              }
            }
            break;
          case 'tile set':
            
            var tileset = g_app.textModeEditor.tileSetManager.getTileSet(id);
            if(tileset) {
              var tilesetJson = tileset.getJSON();
              var filename = name + '.json';

              var content = tilesetJson;
              if(doStringify) {
                content = JSON.stringify(tilesetJson);
              }

              files.push({
                type: 'json',
                deleted: deleted,
                sha: sha,
                id: id,
                content: content,                
                path: parentFolder + '/' + filename,
              });
            }

            break;
          case 'color palette':
            var colorPalette = g_app.textModeEditor.colorPaletteManager.getColorPalette(id);
            if(colorPalette) {
              var colorPaletteJson = colorPalette.getJSON();
              //var path = repositoryFolder + '/color palettes/' + name;
              var filename = name + '.json';


              var content = colorPaletteJson;
              if(doStringify) {
                content = JSON.stringify(colorPaletteJson);
              }
              
              files.push({
                id: id,
                deleted: deleted,
                type: 'json',
                sha: sha,
                content: content,              
                path: parentFolder + '/' + filename
              });
            }

            break;
          case 'music':
            var json = file.data;
            var filename = name + '.json';

            var content = json;

            if(doStringify) {
              content = JSON.stringify(json);
            }

            files.push({
              id: id,
              deleted: deleted,
              type: 'json',
              sha: sha,
              content: content,
              path: parentFolder + '/' + filename
            });

            break;
            
          case 'graphic':
          case '3d scene':
            var json = file.data;//g_app.textModeEditor.frames.getJSON();
            var filename = name + '.json';

            var content = json;
            if(doStringify) {
              content = JSON.stringify(json);
            }


            files.push({
              id: id,
              deleted: deleted,
              type: 'json',
              sha: sha,
              content: content,
              path: parentFolder + '/' + filename
            });
            break;
          
          case 'asm':
          default:
            var content = file.data;
            var type = 'string';
            var encoding = '';
            if(isBinary) {
              type = 'blob';
              encoding = 'base64';
            } else {
              if(extension == 'json' && doStringify && !isString(content)) {
                content = JSON.stringify(content, null, 2);
              }
            }

            files.push({
              id: id,
              deleted: deleted,
              type: type,
              sha: sha,
              encoding: encoding,
              content: content,
              path: parentFolder + '/' + name
            });
            break;
            
        }
      }
    }

    return files;


  },



  // recursively called to save files in this.filesToSave array.

  saveFilesToBrowser: function(callback) {
    var fileManager = g_app.fileManager;

    var _this = this;
    var file = this.filesToSave[this.savedFiles];

    var projectFileIndex = false;
    var fileId = false;

    // see if already have this file
    for(var i = 0; i < this.projectFiles.length; i++) {
      if(this.projectFiles[i].path == file.path) {
        fileId = this.projectFiles[i].id;
        projectFileIndex = i;
        break;
      }
    }

    // blank the content if the file is deleted
    if(typeof file.deleted != 'undefined' && file.deleted) {
      file.content = '';
    }

    fileManager.saveFile({
      file: file,
      fileId: fileId
    }, function(result) {

      // store file info in the project (in memory, to write to storage when done
      var sha = '';
      if(typeof file.sha != 'undefined') {
        sha = file.sha;
      }
      var deleted = false;
      if(typeof file.deleted != 'undefined') {
        deleted = file.deleted;
      }

      var date = new Date();
      var fileRecord = {
        path: file.path,
        lastModified: date.getTime(),
        sha: sha,
        id: result.fileId,
        deleted: deleted
      };

      if(projectFileIndex !== false) {
        _this.projectFiles[projectFileIndex] = fileRecord;
      } else {
        _this.projectFiles.push(fileRecord);
      }

      // mark this file as saved
      _this.recordSaved(file.id);
      _this.savedFiles++;

      if(_this.savedFiles >= _this.filesToSave.length) {

        // done!
        _this.filesToSave = [];
        _this.savedFiles = 0;


        // done, so save the updated project record
        localforage.setItem(_this.currentProjectId, _this.projectFiles, function(err) {
          // now call the callback
          callback({
          });
        });

      } else {
        // not finished yet, so save the next file..
        _this.saveFilesToBrowser(callback);
      }

    });


    /*
    return;

    fileManager.saveFileToProject( { projectId: this.currentProjectId, file: file }, function(err) {
      _this.recordSaved(file.id);
      _this.savedFiles++;
      if(_this.savedFiles >= _this.filesToSave.length) {

        // done!
        _this.filesToSave = [];
        this.savedFiles = 0;

        // done, so call the callback
        callback({
        });

      } else {
        _this.saveFilesToBrowser(callback);
      }
    });

    */
  },


  // save the project to browser storage...  
  saveToBrowserStorage: function(args, callback) {
    var _this = this;
    var time = getTimestamp();

    if(this.savingToBrowserStorage) {
      // save in progress, if save is going for more than 4 secs, assume something gone wrong
      if(time - this.saveStartedAt < 5000) {
        return;
      }
    }

    /*
    console.log("SAVING MODIFIED...");
    console.log('---------------');
    for(var key in this.modified) {
      console.log('modified:' + key + ':' + this.modified[key].path);
    }

*/    


    var thumbnailData = null;

    // record time save started
    this.saveStartedAt = time;

    // current action is saving to browser storage
    this.savingToBrowserStorage = true;

    // save status of project
    var currentEditor = g_app.projectNavigator.getCurrentEditor();
    var currentPath = g_app.projectNavigator.getCurrentPath();
    var projectNavVisible = g_app.projectNavigator.getVisible();

    console.log("GET THUMBNAIL CANAS FROM EDITOR");

    // is there a thumbnail, if so get the data
    try {
      if(currentEditor && typeof currentEditor.getThumbnailCanvas !== 'undefined') {
        thumbnailCanvas = currentEditor.getThumbnailCanvas();
        if(thumbnailCanvas) {
          thumbnailData = thumbnailCanvas.toDataURL();
        }
      }
    } catch(err) {
      // uh oh, couldn't get a thumbnail
    }

    var name = args.filename;
    var type = 'project';

    var fileManager = g_app.fileManager;

    // make an array of the files to save
    this.filesToSave = this.getFiles();
    this.savedFiles = 0;


    var projectDetails = {
      name: name,
      type: type
    }

    projectDetails['currentPath'] = currentPath;
    projectDetails['projectNavVisible'] = projectNavVisible;
    projectDetails['thumbnailData'] = thumbnailData;

    if(typeof args.owner != 'undefined') {
      projectDetails['owner'] = args.owner;
    }

    if(typeof args.repository != 'undefined') {
      projectDetails['repository'] = args.repository;
    }

    // first save the project record
    fileManager.saveProject(projectDetails, function(result) {

      // keep a record of the current project id
      _this.currentProjectId = result.projectId;

      // get the current project files
      fileManager.getProjectFiles({ projectId: _this.currentProjectId }, function(result) {
        _this.projectFiles = result.files;

        _this.saveFilesToBrowser(function() {
          // save is done!
          var saveTime = getTimestamp() - _this.saveStartedAt;

          _this.savingToBrowserStorage = false;
          console.log('save done, took: ' + saveTime);
          if(typeof callback != 'undefined') {
            callback();
          }
        });
      });

      
    });

  },


  // recursively called to open files in this.filesToOpen array
  openFilesFromBrowser: function(callback) {
    if(this.filesToOpen.length == 0) {
      // no files to open...
      callback({});
      return;
    }

    var fileManager = g_app.fileManager;

    var _this = this;
    var file = this.filesToOpen[this.filesOpenedCount];
    var path = file.path;
    var fileId = file.id;
    var sha = '';
    if(typeof file.sha != 'undefined') {
      sha = file.sha;
    }
    var deleted = false;
    if(typeof file.deleted != 'undefined') {
      deleted = file.deleted;
    }

    fileManager.getBrowserFile( { fileId: fileId }, function(result) {

      _this.addRecord({
        path: path,
        id: fileId,
        deleted: deleted,
        sha: sha,
        content: result.content
      });

      _this.filesOpenedCount++;

      if(_this.filesOpenedCount >= _this.filesToOpen.length) {
        _this.filesOpenedCount = 0;
        _this.filesToOpen = [];

        callback({
        });
      } else {
        _this.openFilesFromBrowser(callback);
      }
    });
  },


  // open a project stored in browser storage.
  openBrowserStorageProject: function(args, callback) {

    var projectId = args.projectId;
    var githubOwner = false;//args.githubOwner;
    var githubRepository = false;// args.githubRepository;
    var githubCheck = true;

    if(typeof args.githubOwner != 'undefined' && typeof args.githubRepository != 'undefined') {
      githubOwner = args.githubOwner;
      githubRepository = args.githubRepository;

      if(typeof args.githubCheck != 'undefined') {
        githubCheck = args.githubCheck;
      }
    }

    var _this = this;
    var fileManager = g_app.fileManager;
     
    // get the list of files in the project
    fileManager.getProjectFiles({ projectId: projectId }, function(result) {


      _this.filesToOpen = result.files;
      _this.filesOpenedCount = 0;

      
      _this.openFilesFromBrowser(function(result) {
        // if there is a repository, check repository for updates..
        if(githubOwner && githubRepository) {
          g_app.github.setRepositoryDetails(githubOwner, githubRepository);

          if(!g_app.isOnline()) {
            // not online, alert user..
            if(confirm('You do not seem to be online, do you want to load offline version?')) {
              callback(result);
            }
          } else if(githubCheck) {
            // set the branch
            // check for updated files, prompt to update. 
            g_app.github.doCheckForUpdatedFiles(function() {
              callback(result);
            });
          } else {
            callback(result);
          }
        } else {
          callback(result);
        }
      });
    });
  }

}

