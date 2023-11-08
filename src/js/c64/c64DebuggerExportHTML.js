var C64DebuggerExportHTML = function () {
  this.uiComponent = null;

  this.assetList = [
    'c64page/index.html',
    'c64page/js/c64.min.js',
    'c64page/js/c64.wasm',
    'c64page/images/arrowkeys.png',
    'c64page/images/c64keychars.png',
    'c64page/images/controls.png',
    'c64page/images/orgamepad.png',
    'c64page/images/plus.png',
    'c64page/images/zkey.png',
    'c64page/images/xkey.png'
  ];

  this.assets = {};
  this.loadedAssetCount = 0;
}

C64DebuggerExportHTML.prototype = {

  loadNextAsset: function() {
    var index = this.loadedAssetCount;
    if(index >= this.assetList.length) {
      console.log(this.assets);
      this.assetsReady();
      return;
    }

    var path = this.assetList[index];
    var dataType = 'text';
    if(path.indexOf('.png') !== -1) {
      dataType = 'image/png';
    }
    var _this = this;

    var oReq = new XMLHttpRequest();
    oReq.open("GET", path + '?v={v}', true);
    oReq.responseType = "arraybuffer";
    
    oReq.onload = function (oEvent) {
      var arrayBuffer = oReq.response; // Note: not oReq.responseText
      /*
      if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
      }
    */
      _this.assets[_this.assetList[index]] = arrayBuffer;
      _this.loadedAssetCount++;
      _this.loadNextAsset();

    };
    
    oReq.send(null);

/*
    $.get(path, {}, function(response) {
      console.log('got response');
      console.log(response);
      _this.assets[_this.assetList[index]] = response;
      _this.loadedAssetCount++;
      _this.loadNextAsset();
    }, dataType);
*/
  },

  loadAssets: function() {
    this.loadNextAsset();

  },

  show: function() {

    var c64Debugger = g_app.c64Debugger;
    if(!c64Debugger.checkSharing()) {
      alert('Sorry, sharing has been disabled for this content');
      return false;
    }


    if(this.uiComponent == null) {
      var width = 420;
      var height = 544;
      this.uiComponent = UI.create("UI.Dialog", { "id": "c64DebuggerExportDialog", "title": "Export", "width": width, "height": height });

      var html = '<h3>Export PRG/D64/CRT as a HTML Page</h3>';

      html += '<p>Download the current PRG/D64/CRT as a zipped HTML page to upload to websites such as itch.io</p>';
      html += '<p>Recommended itch.io viewport dimensions: 800x600</p>';

      html += '<div class="formGroup">';

      html += '  <label class="controlLabel">Content</label>'

      html += '  <div class="radioGroup">';
      html += '    <label class="rb-container">Current PRG'
      html += '      <input type="radio" name="c64DebuggerExportType" value="prg" checked="checked">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <br/>';

      html += '    <label class="rb-container">Current D64 (Autostart)'
      html += '      <input type="radio" name="c64DebuggerExportType" value="d64">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <br/>';

      html += '    <label class="rb-container">Current CRT'
      html += '      <input type="radio" name="c64DebuggerExportType" value="crt">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <br/>';

      html += '    <label class="rb-container">Snapshot'
      html += '      <input type="radio" name="c64DebuggerExportType" value="snapshot">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';


      html += '  </div>';

      html += '</div>';



      html += '<div class="formGroup" id="c64DebuggerExportPRGOptions">';

      html += '  <label class="controlLabel">PRG Load Options</label>'

      html += '  <div class="radioGroup">';
      html += '    <label class="rb-container">Inject Into RAM (faster)'
      html += '      <input type="radio" name="c64DebuggerExportPRGLoad" id="c64DebuggerExportPRGLoad_inject" value="inject" checked="checked">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <br/>';

      html += '    <label class="rb-container">Load From D64'
      html += '      <input type="radio" name="c64DebuggerExportPRGLoad" id="c64DebuggerExportPRGLoad_loadrun" value="loadrun">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '  </div>';

      html += '  <div class="checkboxGroup">';
      html += '    <label class="cb-container">Add a Random Delay'
      html += '      <input type="checkbox" name="c64DebuggerRandomDelay" id="c64DebuggerRandomDelay" value="1" checked="checked">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';

      html += '</div>';



      html += '<div class="formGroup">';
      html += '  <label class="controlLabel">Enable Joysticks</label>'


      html += '  <div class="checkboxGroup">';
      html += '    <label class="cb-container">Port 1';
      html += '      <input type="checkbox" id="c64DebuggerJoystickPort1" name="c64DebuggerJoystickPort" value="port1">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '    <br/>';
      html += '    <label class="cb-container">Port 2';
      html += '      <input type="checkbox" checked="checked" id="c64DebuggerJoystickPort2" name="c64DebuggerJoystickPort" value="port2">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';
      html += '</div>';


      html += '<div class="formGroup">';
      html += '  <label class="controlLabel">Use SID Model</label>';

      html += '  <div class="radioGroup">';
      html += '    <label class="rb-container">6581'
      html += '      <input type="radio" name="c64DebuggerExportSIDModel" value="6581">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <br/>';

      html += '    <label class="rb-container">8580'
      html += '      <input type="radio" checked="checked" name="c64DebuggerExportSIDModel" value="8580">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';
      html += '</div>';


      html += '<div class="formGroup">';
      html += '  <label class="controlLabel">Mobile Controls</label>';

      html += '  <div class="checkboxGroup">';
      html += '    <label class="cb-container">Allow Mobile Keyboard'
      html += '      <input type="checkbox" checked="checked" id="c64DebuggerAllowMobileKeyboard">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '    <br/>';

      html += '    <label class="cb-container">Allow Mobile Joystick'
      html += '      <input type="checkbox" checked="checked" id="c64DebuggerAllowMobileJoystick">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '  </div>';
      html += '</div>';
      

      html += '<div id="c64ExportHTMLLoadingMessage">';
      html += '  <label class="controlLabel">&nbsp;</label>';
      html += '  <img src="images/loading.gif">';
      html += '  <span style="font-weight: 600">loading assets...</font>';
      html += '</div>';

      html += '<div id="c64ExportHTMLDownloadMessage">';
      html += '  <label class="controlLabel">&nbsp;</label>';
      html += '<div id="c64ExportHTMLDownloadButton" class="ui-button ui-button-primary"><img src="icons/svg/glyphicons-basic-199-save.svg"> Download</div>';
      html += '</div>';

      var htmlPanel = UI.create("UI.HTMLPanel", { html: html });
      this.uiComponent.add(htmlPanel);

//      this.okButton = UI.create('UI.Button', { "text": "Create Page", "color": "primary" });
//      this.uiComponent.addButton(this.okButton);

      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });

      this.uiComponent.addButton(this.closeButton);

      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      var _this = this;

      UI.on('ready', function() {
      });

      this.uiComponent.on('close', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });

      UI.showDialog("c64DebuggerExportDialog");    
      $('#c64ExportHTMLLoadingMessage').show();
      $('#c64ExportHTMLDownloadMessage').hide();
      this.loadAssets();

      this.initEvents();



    } else {
      UI.showDialog("c64DebuggerExportDialog");    
    }

    if(typeof g_app.c64Debugger.prgLoadMethod != 'undefined') {
      var value = g_app.c64Debugger.prgLoadMethod;
      var elementId = 'c64DebuggerExportPRGLoad_' + g_app.c64Debugger.prgLoadMethod;
      $('#' + elementId).prop('checked', true);
    }

    this.setPRGLoadVisibility();
    g_app.setAllowKeyShortcuts(false);
    UI.setAllowBrowserEditOperations(true);

  },

  setPRGLoadVisibility: function() {
    var type = $('input[name=c64DebuggerExportType]:checked').val();
    if(type == 'prg') {
      $('#c64DebuggerExportPRGOptions').show();
    } else {
      $('#c64DebuggerExportPRGOptions').hide();
    }
  },
  initEvents: function() {
    var _this = this;

    $('input[name=c64DebuggerExportType]').on('click', function() {
      _this.setPRGLoadVisibility();
    });

    $('#c64ExportHTMLDownloadButton').on('click', function() {
      var args = {};
      args["type"] = $('input[name=c64DebuggerExportType]:checked').val();
      args["prgstart"] = $('input[name=c64DebuggerExportPRGLoad]:checked').val();
      args["prgrandomdelay"] = $('#c64DebuggerRandomDelay').is(':checked');
      args["port1"] = $('#c64DebuggerJoystickPort1').is(':checked');
      args["port2"] = $('#c64DebuggerJoystickPort2').is(':checked');
      args["sid"] = $('input[name=c64DebuggerExportSIDModel]:checked').val();
      args["mobileKeyboard"] = $('#c64DebuggerAllowMobileKeyboard').is(':checked');
      args["mobileJoystick"] = $('#c64DebuggerAllowMobileJoystick').is(':checked');
      

      for(var i = 0; i < 2; i++) {
        var port = i + 1;
        c64.joystick
        args["port" + port + "buttons"] = c64.joystick.getJoystickButtons(i);
        args["port" + port + "buttonactions"] = "['fire','" + c64.joystick.getJoystickButtonAction(i, 1) + "']";
      }
      _this.download(args);

    });    
  },

  assetsReady: function() {
    $('#c64ExportHTMLLoadingMessage').hide();
    $('#c64ExportHTMLDownloadMessage').show();
  },

  download: function(args) {

    var c64Debugger = g_app.c64Debugger;
    if(!c64Debugger.checkSharing()) {
      alert('Sorry, sharing has been disabled for this content');
      return false;
    }

    
    if(g_app.c64Debugger.prgData == null) {
//      alert('sorry, only currently support prg export');
//      return; 
    }

    var data = false;

    var type = 'prg';
    if(typeof args.type != 'undefined') {
      type = args.type;      
    }
    // get the content

    
    var contentjs = '';

    contentjs += 'var g_c64Settings = {';
    contentjs += '"colors":[';
    for(var i = 0; i < c64.colors.colors.length; i++) {
      if(i != 0) {
        contentjs += ',';
      }
      contentjs += '0x' + ('00000000' + c64.colors.colors[i].toString(16)).substr(-8);
//      contentjs += '0xff333366,0xff8877aa,4281350271,4290951538,4289214336,4281967969,4288422967,4284931020,4280374919,4278272341,4284771253,4283256141,4286019447,4286442918,4292370802,4288980132';
    }
    contentjs += '],';

    if(args['port1']) {
      contentjs += '"port1":true,';
    } else {
      contentjs += '"port1":false,';
    }

    if(args['port2']) {
      contentjs += '"port2":true,';
    } else {
      contentjs += '"port2":false,';
    }

    if(typeof args['port1buttons'] != 'undefined') {
      contentjs += '"port1buttons":' + args['port1buttons'] + ',';
    }

    if(typeof args['port2buttons'] != 'undefined') {
      contentjs += '"port2buttons":' + args['port2buttons'] + ',';
    }

    if(typeof args['port1buttonactions'] != 'undefined') {
      contentjs += '"port1buttonactions":' + args['port1buttonactions'] + ',';
    }

    if(typeof args['port2buttonactions'] != 'undefined') {
      contentjs += '"port2buttonactions":' + args['port2buttonactions'] + ',';
    }

    contentjs += '"sid": "' + args['sid'] + '",';

    if(args['mobileJoystick']) {
      contentjs += '"mobileJoystick": true,';
    } else {
      contentjs += '"mobileJoystick": false,';
    }

    if(args['mobileKeyboard']) {
      contentjs += '"mobileKeyboard": true,';
    } else {
      contentjs += '"mobileKeyboard": false,';
    }

    if(type == 'prg' && typeof args['prgstart'] != 'undefined') {
      contentjs += '"prgLoadMethod": "' + args['prgstart'] + '"';

      if(typeof args["prgrandomdelay"] != 'undefined') {
        contentjs += ',';
        contentjs += '"prgRandomDelay": "' + args['prgrandomdelay'] + '"';
      }
    }

    /*
    if(type == 'prg' && g_app.c64Debugger.prgLoadMethod != '')  {
      contentjs += '"prgLoadMethod": "' + g_app.c64Debugger.prgLoadMethod + '"';
    }
    */
    contentjs += '};\n';



    if(type == 'prg') {
      if(g_app.c64Debugger.prgData == null) {
        alert('Please load a prg first');
        return;
      }
      data = bufferToBase64(g_app.c64Debugger.prgData);
      contentjs += 'var g_prg = "';
      contentjs += data;
      contentjs += '";\n';
    }

    if(type == 'd64') {
      if(g_app.c64Debugger.d64Data == null) {
        alert('Please attach or autostart a d64 first');
        return;
      }
      data = bufferToBase64(g_app.c64Debugger.d64Data);
      contentjs += 'var g_d64 = "';
      contentjs += data;
      contentjs += '";\n';
    }
//    console.log('data = ' + data);
    if(type == 'crt') {
      if(g_app.c64Debugger.crtData == null) {
        alert('Please insert a crt first');
        return;
      }
      data = bufferToBase64(g_app.c64Debugger.crtData);
      contentjs += 'var g_crt = "';
      contentjs += data;
      contentjs += '";\n';
    }

    if(type == 'snapshot') {
      var ptr = c64_getSnapshot();
      var len = c64_getSnapshotSize();
    
      var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
      
      var data = bufferToBase64(view);

      contentjs += 'var g_snapshot = "';
      contentjs += data;
      contentjs += '";\n';

    }



    var zip = new JSZip();
//    zip.file("TileSetData" + extension, tileSetBinaryData);
    zip.file('index.html', this.assets['c64page/index.html']);
    zip.file('js/c64.min.js', this.assets['c64page/js/c64.min.js']);
    zip.file('js/c64.wasm', this.assets['c64page/js/c64.wasm']);
    zip.file('js/content.js', contentjs);

    zip.file('images/arrowkeys.png', this.assets['c64page/images/arrowkeys.png']);
    zip.file('images/c64keychars.png', this.assets['c64page/images/c64keychars.png']);
    zip.file('images/controls.png', this.assets['c64page/images/controls.png']);
    zip.file('images/orgamepad.png', this.assets['c64page/images/orgamepad.png']);
    zip.file('images/plus.png', this.assets['c64page/images/plus.png']);
    zip.file('images/zkey.png', this.assets['c64page/images/zkey.png']);
    zip.file('images/xkey.png', this.assets['c64page/images/xkey.png']);


    /*
    'c64page/index.html',
    'c64page/js/c64.min.js',
    'c64page/js/c64.wasm',
    'c64page/images/arrowkeys.png',
    'c64page/images/c64keychars.png',
    'c64page/images/controls.png',
    'c64page/images/orgamepad.png',
    'c64page/images/plus.png',
    'c64page/images/zkey.png'
*/
    var filename = "prg";
    zip.generateAsync({type:"blob"})
    .then(function (blob) {
      download(blob, filename + ".zip", "application/zip");
    });    


  }


}