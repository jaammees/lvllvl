var AssemblerFileRecord = function(filename, type) {
  this.filename = filename;
  this.type = type;
  this.children = [];
  this.content = '';
}

AssemblerFileRecord.prototype = {
  createChild: function(filename, type) {
    var childFileRecord = new AssemblerFileRecord(filename, type);
    this.children.push(childFileRecord);
    return childFileRecord;
  },

  createFile: function(filename) {
    return this.createChild(filename, 'file');
  },

  createFolder: function(filename) {
    return this.createChild(filename, 'folder');
  },

  getChild: function(filename) {
    for(var i = 0; i < this.children.length; i++) {
      if(this.children[i].filename == filename) {
        return this.children[i];
      }
    }
    return null;
  },

  setContent: function(content) {
    this.content = content;
  },

  getContent: function() {
    return this.content;
  }

}

var AssemblerFiles = function() {
  this.editor = null;
  this.currentDirectory = '/';
  this.root = new AssemblerFileRecord("/", "dir");

}


AssemblerFiles.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  getParentPath: function(path) {
    var lastSlashPosition = path.lastIndexOf('/');
    if(lastSlashPosition == -1) {
      return '';
    }
    return path.substring(0, lastSlashPosition + 1);
  },

  getFilename: function(path) {
    var lastSlashPosition = path.lastIndexOf('/');
    if(lastSlashPosition == -1) {
      return path;
    }
    return path.substring(lastSlashPosition + 1);

  },

  getFileRecord: function(path) {
    // trimLeft, trimRight
    if(path == '/') {
      return this.root;
    }

    path = path.trim();

    if(path.length == 0 || path[0] != '/') {
      path = this.currentDirectory + path;
    }

    var pathParts = path.split('/');

    var currentRecord = this.root;
    for(var i = 1; i < pathParts.length; i++) {
      var filename = pathParts[i];

      currentRecord = currentRecord.getChild(filename);
      if(currentRecord == null) {
        return null;
      }
    }

    return currentRecord;

  },

  dir: function(path) {
    var fileRecord = this.getFileRecord(path);
    if(fileRecord == null) {
      return null;
    }

    return fileRecord.children;

  },

  createFile: function(path, type) {
    if(typeof type == 'undefined') {
      type = 'file';
    }
    var parentPath = this.getParentPath(path);
    var filename = this.getFilename(path);

    var parentRecord = this.getFileRecord(parentPath);

    if(!parentRecord) {
      return null;
    }
    return parentRecord.createChild(filename, type);
  },

  createFolder: function(path) {
    return this.createFile(path, 'folder');
  },

  deleteFile: function(path) {
    var parentPath = this.getParentPath(path);
    var filename = this.getFilename(path);
    var parentRecord = this.getFileRecord(parentPath);

    if(!parentRecord) {
      return false;
    }

    return parentRecord.deleteChild(filename);

  },

  load: function(path) {
    var fileRecord = this.getFileRecord(path);
    if(fileRecord == null) {
      return '<no file>';
    }
    return fileRecord.getContent();

  },

  save: function(path, content) {
    var fileRecord = this.getFileRecord(path);
    if(fileRecord == null) {
      return false;
    }

    return fileRecord.setContent(content);

  }
}
