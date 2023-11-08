/*
function handleGDriveClientLoad() {
  gapi.load('client:auth2', initGDriveClient);
}

function initGDriveClient() {
  gapi.client.init({
    apiKey: 'AIzaSyDhavt6Zes2iw_q9pU2N3WlMfRAI3YYbYk',
    clientId: '778997112136-5fdbsmc9o1td7m07fo9jpopkm9gp0gch.apps.googleusercontent.com',
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    scope: 'https://www.googleapis.com/auth/drive.file'
  }).then(function () {
    console.log("INIT DONE!!");

    gapi.auth2.getAuthInstance().isSignedIn.listen(function(isSignedIn) {
      if(typeof g_app != 'undefined' && g_app.gdrive) {
        g_app.gdrive.updateSigninStatus(isSignedIn);
      }
    });
  }, function(error) {
    //appendPre(JSON.stringify(error, null, 2));
  });
}
*/



var GDrive = function() {
  this.clientId = '673634360731-12v9nmqqaeablrq76htpm73jthktae4i.apps.googleusercontent.com';
  
  // '778997112136-5fdbsmc9o1td7m07fo9jpopkm9gp0gch.apps.googleusercontent.com';
  this.apiKey = 'AIzaSyAuSjHOq2_3RYn4fwBRRMqXSOON2SxjxCY';
  // 'AIzaSyDhavt6Zes2iw_q9pU2N3WlMfRAI3YYbYk';



  this.clientId = '778997112136-5fdbsmc9o1td7m07fo9jpopkm9gp0gch.apps.googleusercontent.com';
  this.apiKey = 'AIzaSyDhavt6Zes2iw_q9pU2N3WlMfRAI3YYbYk';

  this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
  this.scopes = 'https://www.googleapis.com/auth/drive.file';
  this.accessToken = '';
  this.currentUser = false;

  this.callback = false;

  this.clientLoaded = false;

  this.currentProjectId = false;
  this.currentProjectName = false;

  this.progressElement = null;
}

GDrive.prototype = {
  init: function() {
  },

  handleClientLoad: function() {
//    return;
    try {
      var _this = this;
      gapi.load('client:auth2', function() {
        _this.initClient();
      });
    } catch(err) {
      // prob no internet?
    }
  },

  initClient: function() {
    var _this = this;



    gapi.client.init({
      apiKey: this.apiKey,
      clientId: this.clientId,
      discoveryDocs: this.discoveryDocs,
      scope: this.scopes
    }).then(function () {
      _this.clientLoaded = true;

      
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(function(isSignedIn) {
        _this.updateSigninStatus(isSignedIn);
      });

     
      // Handle the initial sign-in state.
      _this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

      g_app.startPage.gdriveStatusUpdated();
    }, function(error) {
      console.log(error);
//      appendPre(JSON.stringify(error, null, 2));
      g_app.startPage.gdriveStatusUpdated();

    });    
  },

  updateSigninStatus: function(isSignedIn) {
    if (isSignedIn) {
//      authorizeButton.style.display = 'none';
//      signoutButton.style.display = 'block';
      this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();
      var authResponse = this.currentUser.getAuthResponse(true);
      this.accessToken = authResponse.access_token;

      $('#startGoogleDriveConnected').show();
      $('#startGoogleDriveNotConnected').hide();

      $('#startGoogleDriveConnectedMobile').show();
      $('#startGoogleDriveNotConnectedMobile').hide();

      $('#saveAsConnectToGDriveButtonSection').hide();
      
      if(this.callback !== false) {
        this.callback();
        this.callback = false;
      }


      this.listProjects({}, function(projects) {
//        console.log(projects);
      });
    } else {
      this.accessToken = '';
      this.currentUser = false;

      $('#startGoogleDriveConnected').hide();
      $('#startGoogleDriveNotConnected').show();
      $('#startGoogleDriveConnectedMobile').hide();
      $('#startGoogleDriveNotConnectedMobile').show();
      $('#saveAsConnectToGDriveButtonSection').show();
      this.listProjects({}, function(projects) {
//        console.log(projects);
      });
      

//      console.log("SIGNED OUT !!!!!!!!");
//      authorizeButton.style.display = 'block';
//      signoutButton.style.display = 'none';
    }
  },

  checkIsSignedIn: function() {
    try {

      if(!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        this.updateSigninStatus(false);
        return false;
      }
      this.currentUser = gapi.auth2.getAuthInstance().currentUser.get();

      if(!this.currentUser) {
        this.updateSigninStatus(false);
        return false;
      }
      var authResponse = this.currentUser.getAuthResponse(true);
//      console.log(authResponse);
      if(!authResponse) {
        this.updateSigninStatus(false);
        return false;
      }
      this.accessToken = authResponse.access_token;
      this.updateSigninStatus(this.accessToken != '');

      return this.accessToken != '';
    } catch(err) {
      this.accessToken = '';
      return false;
    }

  },

  handleAuthClick: function(callback) {
    if(!this.checkIsSignedIn()) {
//      console.log("NOT SIGNED IN, SIGNING IN");
      if(typeof callback != 'undefined') {
        this.callback = callback;
      }
      gapi.auth2.getAuthInstance().signIn();

    } else {
      if(typeof callback != 'undefined') {
//        console.log("SIGNED IN, calling callback");
        callback();
      }
    }
  },

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick: function() {
//    console.log("GDRIVE SIGNOUT");

    try {
      gapi.auth2.getAuthInstance().signOut().then(function() {
        //console.log('signed out');
        gapi.auth2.getAuthInstance().disconnect();
      });
    } catch(err) {
      console.error('error on signout');
      console.log(err);
    }
  },

  handleUploadProgress: function(event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    if (event.lengthComputable) {
      percent = Math.ceil(position / total * 100);
    }
//    console.log(percent);

  },

  uploadToAppFolder: function(file, filename, callbacks) {
//    console.log('looking for lvllvl');
    var _this = this;
    this.getAppFolderId(function(folderId) {
      _this.doUpload(false, folderId, file, filename, callbacks);

    });


    /*
    this.getAppFolder(function(files) {
      if(files.length === 0) {
        _this.createFolder('lvllvl', {
          success: function(response) {
            var folderId = response.id;
            _this.doUpload(folderId, file, filename, callbacks);
            console.log(response);
          }
        }
        );
      } else {
        // folder exists...
        console.log('folder exists');
        console.log(files);
        _this.doUpload(files[0].id, file, filename, callbacks);
      }
    });
    */
  },


  setFolderId: function(folderId, fileId, callback) {
//    console.log('set folder id to ' + folderId);
    var _this = this;
    $.ajax({
        url: "https://www.googleapis.com/drive/v3/files/" + fileId +'?addParents=' + folderId,
        type: "PATCH",
        contentType:"application/json; charset=utf-8",
        dataType:"json",        
        data: JSON.stringify({
          "addParents": folderId,
          "fileId": fileId
        }),
        processData: false,
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer" + " " + _this.accessToken);
        },
        /*
        data:{
            uploadType:"media"
        },
        */
        xhr: function () {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
              myXhr.upload.addEventListener('progress', function(event) { 
              //  _this.handleUploadProgress(event) 
                if(typeof callbacks != 'undefined' && typeof callbacks.progress != 'undefined') {
                  //callbacks.progress(event);
                }
              }, false);
          }
          return myXhr;
        },
        success: function (data) {
//          console.log("SUCCESS!!!");
//          console.log(data);
//          if(typeof callbacks != 'undefined' && typeof callbacks.success != 'undefined') {
            //callbacks.success(data);
            callback(data);
//          }
        },
        error: function (error) {
          if(typeof callbacks != 'undefined' && typeof callbacks.error != 'undefined') {
            //callbacks.error(error);
          }
          console.log("ERROR!!!");
            console.log(error);
        },
        async: true,
//        data: formData,
        cache: false,
//        contentType: false,
        timeout: 60000
    });    

  },

 //https://stackoverflow.com/questions/37860901/how-to-use-google-drive-api-to-download-files-with-javascript


  downloadFile: function(fileId, name, callback) {
//    var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;// or this: gapi.auth.getToken().access_token;

    var xhr = new XMLHttpRequest();

    var signedIn = false;
    if(typeof gapi != 'undefined' && typeof gapi.auth2 != 'undefiend') {
      signedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    if(signedIn) {
      xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+fileId+'?alt=media', true);
      var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
      xhr.setRequestHeader('Authorization','Bearer ' + accessToken);
    } else {
//      var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
//      console.log("ACCESS TOKEN = ");
//      console.log(accessToken);
//      xhr.open("GET", "https://www.googleapis.com/drive/v3/files/"+fileId+'?alt=media', true);
//      console.log("GET" + "https://drive.google.com/uc?export=download&id=" + fileId);
      xhr.open("GET", "https://drive.google.com/uc?export=download&id=" + fileId, true);
    }


    /*
    xhr.responseType = 'arraybuffer';
    xhr.responseType = 'blob';
    xhr.responseType = 'document';
    */
    xhr.responseType = 'blob';//json';
    xhr.onload = function(){
        //base64ArrayBuffer from https://gist.github.com/jonleighton/958841
//        var base64 = 'data:image/png;base64,' + base64ArrayBuffer(xhr.response);
    
        //do something with the base64 image here
//        console.log(xhr.response);

        if(typeof callback != 'undefined') {
          callback(xhr.response);
        }
    
    }
    xhr.send();
  },

      
  // https://gist.github.com/tanaikech/bd53b366aedef70e35a35f449c51eced

  doUpload: function(fileId, folderId, file, filename, callbacks) {
    try {
      var mimeType = 'application/bin';
      var extension = '';
      var pos = filename.lastIndexOf(".");
      if(pos !== -1) {
        extension = filename.substr(pos + 1).toLowerCase();
      }

//      console.log("GOT EXTENSION" + extension);
      switch(extension) {
        case 'gif':
          mimeType = 'image/gif';
        break;
        case 'png':
          mimeType = 'image/png';
        break;
        case 'json':
          mimeType = 'application/json';
        break;
        case 'zip':
          mimeType = 'application/zip';
        break;

      }


      var metadata = {
        'name': filename, // Filename at Google Drive
        'mimeType': mimeType, // mimeType at Google Drive
        'parents': [folderId], // Folder ID at Google Drive
      };


      var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
      var form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);
      
      var xhr = new XMLHttpRequest();

      if(fileId !== false) {
        xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + fileId );//+ '?uploadType=multipart&fields=id,name');
//        console.log('PATCH: ' + 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=multipart&fields=id');
      } else {
        xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name');
      }
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onload = function() {
        if(typeof callbacks != 'undefined' && typeof callbacks.success != 'undefined') {
          callbacks.success(xhr.response);
        }
  //        console.log(xhr.response.id); // Retrieve uploaded file ID.
      };
      xhr.send(form);
    } catch(err) {
      if(typeof callbacks != 'undefined' && typeof callbacks.error != 'undefined') {
        callbacks.error(err);
      }
    }
  },
  doUploadold: function(folderId, file, filename, callbacks) {


    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", file, filename);
    formData.append("upload_file", true);
    formData.append("uploadType", "media");
//    formData.append("parents", JSON.stringify([{ "id": folderId }]));
    formData.append("parents", JSON.stringify([ folderId ]));
//    formData.append("parents", folderId);

    var _this = this;
    $.ajax({
        type: "POST",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer" + " " + _this.accessToken);
        },
        url: "https://www.googleapis.com/upload/drive/v3/files",
        xhr: function () {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
              myXhr.upload.addEventListener('progress', function(event) { 
              //  _this.handleUploadProgress(event) 
                if(typeof callbacks != 'undefined' && typeof callbacks.progress != 'undefined') {
                  callbacks.progress(event);
                }
              }, false);
          }
          return myXhr;
        },
        success: function (data) {
          if(typeof callbacks != 'undefined' && typeof callbacks.success != 'undefined') {
            var fileId = data.id;
//            _this.setFolderId(folderId, fileId, function(response) {
//              console.log(response);
              callbacks.success(data);
//            });

          }
//            console.log(data);
        },
        error: function (error) {
          if(typeof callbacks != 'undefined' && typeof callbacks.error != 'undefined') {
            callbacks.error(error);
          }

            console.log(error);
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
  },

  createFolderold: function(name) {
    var fileMetadata = {
      'name': 'lvllvl',
      'mimeType': 'application/vnd.google-apps.folder'
    };

    gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
//        console.log('Folder Id: ', file.id);
      }
    });
  },


  createFolder: function(parentFolderId, name, callbacks) {
    try {
      var mimeType = 'application/vnd.google-apps.folder';

      var metadata = {
        'name': name, // Filename at Google Drive
        'mimeType': mimeType // mimeType at Google Drive
      };

      if(parentFolderId !== false) {
        metadata['parents'] = [parentFolderId];
      }

      //console.log(metadata);

      var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.

      var form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      
      
      var xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?fields=id');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onload = function() {
        if(typeof callbacks != 'undefined' && typeof callbacks.success != 'undefined') {
          callbacks.success(xhr.response);
        }
      };
      xhr.send(form);
    } catch(err) {
      if(typeof callbacks != 'undefined' && typeof callbacks.error != 'undefined') {
        callbacks.error(err);
      }
    }
  },


  createFolderOld2: function(name, callbacks) {

    /*
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("title", name);
    formData.append("mimeType", 'application/vnd.google-apps.folder');
*/
    var _this = this;
    $.ajax({
        url: "https://www.googleapis.com/drive/v2/files",
        type: "POST",
        contentType:"application/json; charset=utf-8",
        dataType:"json",        
        data: JSON.stringify({
          "title": name,
//          "name": name,
          "mimeType": 'application/vnd.google-apps.folder'
        }),
        processData: false,
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer" + " " + _this.accessToken);
        },
        /*
        data:{
            uploadType:"media"
        },
        */
        xhr: function () {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
              myXhr.upload.addEventListener('progress', function(event) { 
              //  _this.handleUploadProgress(event) 
                if(typeof callbacks != 'undefined' && typeof callbacks.progress != 'undefined') {
                  callbacks.progress(event);
                }
              }, false);
          }
          return myXhr;
        },
        success: function (data) {
          if(typeof callbacks != 'undefined' && typeof callbacks.success != 'undefined') {
            callbacks.success(data);
          }
//            console.log(data);
        },
        error: function (error) {
          if(typeof callbacks != 'undefined' && typeof callbacks.error != 'undefined') {
            callbacks.error(error);
          }

            console.log(error);
        },
        async: true,
//        data: formData,
        cache: false,
//        contentType: false,
        timeout: 60000
    });
  },  

/*
  getAppFolder: function(callback) {
    gapi.client.drive.files.list({
      'q': "name='lvllvl'",
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name, parents)"
    }).then(function(response) {
      console.log('get app folder');
      console.log(response);
      callback(response.result.files);
    });
  },

*/
  getAppFolderId: function(callback) {
    var _this = this;
    gapi.client.drive.files.list({
      'q': "name='lvllvl' and trashed != true",
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name, parents)"
    }).then(function(response) {
      var files = response.result.files;

      if(files.length === 0) {
        // need to create it
        _this.createFolder(false, 'lvllvl', {
          success: function(response) {
            var folderId = response.id;
            callback(folderId);
          }
        });
      } else {
        // folder exists...
//        console.log('folder exists');
//        console.log(files);
        callback(files[0].id);
      }
    });
  },

  getProjectFolderId: function(callback) {
    var _this = this;
    this.getAppFolderId(function(appFolderId) {
      gapi.client.drive.files.list({
        'q': "name='projects' and '" + appFolderId + "' in parents and trashed != true",
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name, parents)"
      }).then(function(response) {
        var files = response.result.files;
        if(files.length === 0) {
          // need to create it

//          console.log("CREATE PROJECTSS FOLDER");

          // create projects folder
          _this.createFolder(appFolderId, 'projects', {
            success: function(response) {
//              console.log("SUCCESS!!!");
              var folderId = response.id;
              callback(folderId);
            }
          });
        } else {
          // folder exists...
//          console.log('folder exists');
//          console.log(files);
          callback(files[0].id);
        }
   
      });

    });
  },


  listFiles: function(callback) {
    gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then(function(response) {
//      appendPre('Files:');
      var files = response.result.files;
      callback(files);

      /*
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          console.log(file);
        }
      } else {
      }
      */
    });
  },


  listProjects: function(args, callback) {
/*
    if(!this.checkIsSignedIn()) {
      startPage.googleDriveProjectList = [];
      startPage.drawProjects();
      return;
    }
*/
    var startPage = g_app.startPage;
    // checking if signed in calls this, so cant call checkIsSignedIn
    if(this.accessToken == '') {
      startPage.googleDriveProjectList = [];
      startPage.drawProjects();
      return;
    }    
    var _this = this;

    this.getProjectFolderId(function(projectsFolderId) {
      var q = " '" + projectsFolderId + "' in parents  and trashed != true";
      if(typeof args != 'undefined') {
        if(typeof args.name != 'undefined') {
          var name = args.name;
          q += " and ( name = '" + name + "' or name = '" + name + ".zip')"
        }
      }
  
//      console.log('query = ' + q);
      gapi.client.drive.files.list({
        'pageSize': 100,
        'fields': "nextPageToken, files(id, name,modifiedTime,size,webContentLink,webViewLink, mimeType)",
        'q': q

      }).then(function(response) {

        var files = response.result.files;

        if(typeof callback != 'undefined') {
          callback(files);
        }
        var startPage = g_app.startPage;
        startPage.googleDriveProjectList = [];

        for(var i = 0; i < files.length; i++) {
          var lastModified = Date.parse(files[i].modifiedTime);

          startPage.googleDriveProjectList.push({
            name: files[i].name,
            id: files[i].id,
            webContentLink: files[i].webContentLink,
            webViewLink: files[i].webViewLink,
            lastModified: lastModified

          });

        }

        startPage.drawProjects();
      });
    });
  },

  uploadToProjectFolder: function(file, fileId, filename, callbacks) {
    var _this = this;

    this.getProjectFolderId(function(folderId) {
      _this.doUpload(fileId, folderId, file, filename, callbacks);

    });

    /*
    this.getAppFolder(function(files) {
      if(files.length === 0) {
        _this.createFolder('lvllvl', {
          success: function(response) {
            var folderId = response.id;
            _this.doUpload(folderId, file, filename, callbacks);
            console.log(response);
          }
        }
        );
      } else {
        // folder exists...
        console.log('folder exists');
        console.log(files);
        _this.doUpload(files[0].id, file, filename, callbacks);
      }
    });
    */
  },

  showProgress: function(type) {

    var progressType = 'save';
    if(typeof type != 'undefined') {
      progressType = type;
    }
    var width = 180;
    var height = 30;
    if(this.progressElement == null) {
      this.progressElement = document.createElement('div');
      this.progressElement.setAttribute('id', 'gdriveProgress');
      this.progressElement.setAttribute('style', 'display: none; color: #aaaaaa; background-color: #111111; position: absolute; top: 0; right: 0;  width: ' + width + 'px; height: ' + height + 'px');
      //this.progressElement.setAttribute('class', 'ui-popup');
      document.body.append(this.progressElement);    
    }
    var html = '';
    if(progressType == 'save') {
      html += '<div style="display: flex; justify-content: center; align-items: center; padding: 4px">';
      html += '<img src="icons/GoogleDriveIcon512.png" height="20">';
      html += '<span style="margin-left: 8px">Saving to Google Drive...</span>';
      html += '</div>';
    }
    if(progressType == 'open') {
      html += '<div style="display: flex; justify-content: center; align-items: center; padding: 4px">';
      html += '<img src="icons/GoogleDriveIcon512.png" height="20">';
      html += '<span style="margin-left: 8px">Opening From Google Drive...</span>';
      html += '</div>';

    }
    $('#gdriveProgress').html(html);
    $('#gdriveProgress').show();
  },

  hideProgress: function() {
    $('#gdriveProgress').hide();
  },

  saveProject: function(args, callback) {

    var filename = 'untitled';
    var fileId = false;
    var showProgress = false;

    if(typeof args != 'undefined') {
      if(typeof args.filename != 'undefined') {
        filename = args.filename;
      }

      if(typeof args.fileId != 'undefined') {
        fileId = args.fileId;
      }

      if(typeof args.showProgress != 'undefined') {
        showProgress = args.showProgress;
      }
    }

    filename += '.zip';

    if(showProgress) {
      this.showProgress();
    }
    var _this = this;
    g_app.doc.createZipFile({}, function(blob) {
//      console.log('upload zip blob..');
      _this.uploadToProjectFolder(blob, fileId, filename, {
          success: function(result) {
            if(showProgress) {
              _this.hideProgress();
            }
            callback(result);
          }
        }
      );
    });
    return;

    
    var data = JSON.stringify(g_app.doc.data);

    var extension = '';
    var pos = filename.lastIndexOf(".");
    if(pos !== -1) {
      extension = filename.substr(pos + 1).toLowerCase();
    }

    if(extension != 'json') {
      filename += '.json';
    }


    this.uploadToProjectFolder(data, filename, {
        success: callback
      }
    );

    console.log("SAVE TO GOOGLE DRIVE!!!!");
  },



  
  openProject: function(args) {

    var _this = this;

//    console.log("OPEN PROJECT");
//    console.log(args);

    this.showProgress('open');
    this.downloadFile(args.id, args.name, function(response) {
//      console.log(response);
      g_app.doc = new Document();    
      g_app.doc.init(g_app);
      g_app.createDocumentStructure( g_app.doc);

      g_app.doc.loadZipFile(response, function() {
        var name = args.name;
        var dotPos = name.lastIndexOf('.');
        if(dotPos != -1) {
          name = name.substr(0, dotPos);
        }

        g_app.fileManager.saveTo = 'googleDrive';
        g_app.fileManager.filename = name;
        g_app.fileManager.googleDriveFileId = args.id;

        _this.currentProjectId = args.id;
        _this.currentProjectName = name;
        _this.hideProgress();
      });

    });
  }

}

