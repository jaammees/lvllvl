var exportFileDialog = false;

function mobileOpenNewWindow(base64ImageData, contentType) {
  var base64Pos = base64ImageData.indexOf('base64,');
  if(base64Pos !== -1) {
    base64Pos += 7;
    base64ImageData = base64ImageData.substr(base64Pos);
  }


  var byteCharacters = atob(base64ImageData);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += 1024) {
    var slice = byteCharacters.slice(offset, offset + 1024);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }
  var blob = new Blob(byteArrays, {type: contentType});
  var blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, '_blank');
}


function mobileDownload(args) {
  var data = args.data;
  var filename = args.filename;
  var mimeType = args.mimeType;

//  data, strFileName, strMimeType
  if(UI.isMobile.iOS()) {  
    //window.open(data);  

    if(exportFileDialog === false) {

      var html = '';

      html += '<div id="exportFileDialog" style="position: absolute; background-color: black; top: 0; left: 0; right: 0; bottom: 0; z-index: 2000">';

      html += '  <div style="text-align: center">';
      html += '  <div style="padding: 20px 0 0 0 ">';

      html += ' Tap and hold on the image to save';
      html += '  </div>';

      html += '<div style="text-align: center">';

      html += '    <div style="margin: 20px auto; max-width: 90%; max-height: 300px; overflow: scroll">';
//      html += '      <img id="exportFileDialogImage" class="downloadable-image" src="' + data + '">';
      html += '      <img id="mobileExportFileDialogImage" class="downloadable-image" >';
      html += '    </div>';

      html += '</div>';

      html += '    <div style="margin-bottom: 20px">';
      html += '      <div class="ui-button" id="exportFileDialogDownloadButton">Open In New Window</div>';
      html += '    </div>';


      html += '    <div>';
      html += '      <div class="ui-button" id="exportFileDialogClose">Close</div>';
      html += '    </div>';


      html += '  </div>';

      html += '</div>';

//      $('#exportGIFMobileProgress').html(html);
//          html += '<div>Hold finger to save</div>';

      $('body').append(html);
      exportFileDialog = true;


      var exportFileDialogImage = document.getElementById('mobileExportFileDialogImage');

      console.log('data = ');
      console.log(data);
      exportFileDialogImage.src = data;

      
      $('#exportFileDialogClose').on('click', function() {

        $('#exportFileDialog').hide();
      });

      $('#exportFileDialogDownloadButton').on('click', function() {
        mobileOpenNewWindow(data, mimeType);
        //window.open(data);
      });


    } else {
      console.log("data = ");
      console.log(data);
      var exportFileDialogImage = document.getElementById('mobileExportFileDialogImage');
      exportFileDialogImage.src = data;
      $('#exportFileDialog').show();
    }


  } else {
    download(data, filename, mimeType);    
  }
}
