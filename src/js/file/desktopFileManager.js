var DesktopFileManager = function() {
  this.editor = null;


  /*
  this.filename = 'Untitled';
  this.saveTo = 'browserStorage';
  this.googleDriveFileId = false;

  this.saveInProgress = false;
  this.gDriveSaveInProgress = false;

  this.isNew = false;


  this.saveAsDialog = null;
  this.saveAsTemplateDialog = null;
  this.downloadAsDialog = null;
  this.newDialog = null;

  this.importCharPad = null;


  this.dropImage = null;

  this.saveButton = null;
*/
}

DesktopFileManager.prototype = {
  init: function(editor) {
    this.editor = editor;
    console.log('new desktop file manager!!!!!!!!!!!!!!!!!!');
  }
}