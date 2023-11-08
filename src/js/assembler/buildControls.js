var BuildControls = function() {
  this.settingsDialog = null;


  this.c64Cfg = '';
  this.c64Cfg += 'FEATURES {\n';
  this.c64Cfg += 'STARTADDRESS: default = $0801;\n';
  this.c64Cfg += '}\n';
  this.c64Cfg += 'SYMBOLS {\n';
  this.c64Cfg += '__LOADADDR__: type = import;\n';
  this.c64Cfg += '}\n';
  this.c64Cfg += 'MEMORY {\n';
  this.c64Cfg += 'ZP:       file = "", start = $0002,  size = $00FE,      define = yes;\n';
  this.c64Cfg += '  LOADADDR: file = %O, start = %S - 2, size = $0002;\n';
  this.c64Cfg += '  MAIN:     file = %O, start = %S,     size = $D000 - %S;\n';
  this.c64Cfg += '}\n';
  this.c64Cfg += 'SEGMENTS {\n';
  this.c64Cfg += '  ZEROPAGE: load = ZP,       type = zp,  optional = yes;\n';
  this.c64Cfg += '  LOADADDR: load = LOADADDR, type = ro;\n';
  this.c64Cfg += '  EXEHDR:   load = MAIN,     type = ro,  optional = yes;\n';
  this.c64Cfg += '  CODE:     load = MAIN,     type = rw;\n';
  this.c64Cfg += '  RODATA:   load = MAIN,     type = ro,  optional = yes;\n';
  this.c64Cfg += '  DATA:     load = MAIN,     type = rw,  optional = yes;\n';
  this.c64Cfg += '  BSS:      load = MAIN,     type = bss, optional = yes, define = yes;\n';
  this.c64Cfg += '}';


  this.nesCfg = '';
  this.nesCfg += 'MEMORY { \n';
  this.nesCfg += '  ZP:     start = $00,    size = $0100, type = rw, file = "";\n';
  this.nesCfg += '  OAM:    start = $0200,  size = $0100, type = rw, file = "";\n';
  this.nesCfg += '  RAM:    start = $0300,  size = $0500, type = rw, file = "";\n';
  this.nesCfg += '  HDR:    start = $0000,  size = $0010, type = ro, file = %O, fill = yes, fillval = $00;\n';
  this.nesCfg += '  PRG:    start = $8000,  size = $8000, type = ro, file = %O, fill = yes, fillval = $00;\n';
  this.nesCfg += '  CHR:    start = $0000,  size = $2000, type = ro, file = %O, fill = yes, fillval = $00;\n';
  this.nesCfg += '}\n';

  this.nesCfg += 'SEGMENTS {\n';
  this.nesCfg += '  ZEROPAGE: load = ZP,  type = zp;\n';
  this.nesCfg += '  OAM:      load = OAM, type = bss, align = $100;\n';
  this.nesCfg += '  BSS:      load = RAM, type = bss;\n';
  this.nesCfg += '  HEADER:   load = HDR, type = ro;\n';
  this.nesCfg += '  CODE:     load = PRG, type = ro,  start = $8000;\n';
  this.nesCfg += '  RODATA:   load = PRG, type = ro;\n';
  this.nesCfg += '  VECTORS:  load = PRG, type = ro,  start = $FFFA;\n';
  this.nesCfg += '  TILES:    load = CHR, type = ro;\n';
  this.nesCfg += '}\n';

  this.prefix = '';

}


BuildControls.prototype = {
  init: function(editor, prefix) {
    this.editor = editor;

    if(typeof prefix != 'undefined') {
      this.prefix = prefix;
    }
  },


  buildInterface: function(parentPanel) {

    var html = '<div class="panelFill" style="background-color:#333333;">';
    html += '<div class="ui-button ui-button-primary" style="margin: 0px 5px" id="' + this.prefix + 'assemblerRun" ><div class="rippleJS"></div>';
    html += '<i class="halflings halflings-play"></i>&nbsp;';
    html += 'Build and Run';

    if(!g_app.isMobile()) {
      html += ' (F5)';
    }
    html += '</div>';

    html += '<div class="ui-button ui-button-secondary" style="margin: 0px 5px"  id="' + this.prefix + 'assemblerBuild"><div class="rippleJS"></div>Build';
    if(!g_app.isMobile()) {
      html += ' (F6)';
    }
    html += '</div>';


    html += '<span>Assembler <a href="https://sourceforge.net/projects/acme-crossass/" target="_blank">ACME 0.97</a></span>';


    html += '<div class="ui-button ui-button-secondary" style="margin: 0px 5px"  id="' + this.prefix + 'assemblerBuildAndDownload"><div class="rippleJS"></div>';
    html += '<img src="icons/svg/glyphicons-basic-199-save.svg">&nbsp;';
    html += 'Build and Download</div>';

    if(this.prefix == 'c64debugger') {
      html += '<div style="margin-right: 6px" class="ui-button ui-button-secondary" id="' + this.prefix + 'assemblerShare"><img src="icons/material/share-24px.svg">&nbsp;Share</div>';
    }


    /*

    html += '<div class="ui-button ui-button-secondary" style="margin: 0px 5px"  id="assemblerSettings">';
    html += '<img src="icons/material/settings_applications-24px.svg">&nbsp;';
    html += '<div class="rippleJS"></div>Settings...</div>';

    
    // share button
    html += '<div class="ui-button ui-button-secondary" style="margin: 0px 5px"  id="assemblerShare">';
    html += '<img src="icons/material/share-24px.svg">&nbsp;';
    html += '<div class="rippleJS"></div>Share</div>';
    */

    //glyphicons-basic-578-share.svg

    //share-24px.svg

    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html});

    parentPanel.add(this.uiComponent);


    var buildControls = this;
    UI.on('ready', function() {
      buildControls.initEvents();
    });
  },

  initContent: function() {
  },

  build: function() {
    this.editor.build();
  },

  run: function() { 
    this.editor.run();
  },

  runBuildAndDownload: function() {
    this.editor.buildAndDownload();
  },


  showShare: function() {

    //var files = [];

    var sourceFiles = [];
    this.editor.collectSourceFiles('/asm', sourceFiles, ['asm', 'folder']);

    
    this.editor.collectSourceFiles('/asm', sourceFiles, ['bin']);

    for(var i = 0; i < sourceFiles.length; i++) {
      sourceFiles[i].filePath = 'asm/' + sourceFiles[i].filePath;
    }


    // get the config file
    var config = g_app.doc.getDocRecord('/config/assembler.json');
    if(config) {
      var content = config.data;
      if(!isString(content)) {
        content = JSON.stringify(content, null, 2);
      }


      sourceFiles.push({
        name: 'assembler.json',
        filePath: 'config/assembler.json',
        content: content
      });
    } else {
      console.log('no config!!');
    }


    var files = {};
    for(var i = 0; i < sourceFiles.length; i++) {
      if(sourceFiles[i].type != 'folder') {
        var filename = sourceFiles[i].filePath;//name;

        filename = filename.replace(/\//g, g_gistPathSeparator);

        files[filename] = {
          content: sourceFiles[i].content
//          description: sourceFiles[i].filePath

        }
        /*
        files.push({
          name: sourceFiles[i].filePath,
          content: sourceFiles[i].content
        });
        */
      }
    }

    g_app.gist.share({ files: files });


  },

  assemblerSettings: function() {
    var _this = this;
    if(this.settingsDialog == null) {
      var html = '';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="assemblerTarget">Target:</label>';
      html += '  <select name="assemblerTarget" id="assemblerTarget">';
      html += '    <option value="c64" selected="selected">C64</option>';
      html += '    <option value="nes">NES</option>';
      html += '    <option value="x16">X16</option>';
      html += '  </select>';
      html += '</div>';

      html += '<div class="formGroup">';
      html += '  <label class="controlLabel" for="useAssembler">Assembler:</label>';
      html += '  <select name="useAssembler" id="useAssembler">';
      html += '    <option value="acme" selected="selected">ACME</option>';
      html += '    <option value="ca65">CA65</option>';
      html += '  </select>';
      html += '</div>';


      html += '<div class="formGroup" id="cc65configfilegroup">';
      html += '  <label class="controlLabel" for="assemblerConfigFilePath">Config File:</label>';
      html += '  <input id="assemblerConfigFilePath" type="text" value="">';
      html += '</div>';

      var width = 300;
      var height = 200;
      this.settingsDialog = UI.create("UI.Dialog", { "id": "assemblerSettingsDialog", "title": "Assembler Settings", "width": width, "height": height });

      this.settingsHTML = UI.create("UI.HTMLPanel", { "html": html });
      this.settingsDialog.add(this.settingsHTML);

      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {
        _this.setSettings();
        UI.closeDialog();
      });
 
      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.settingsDialog.addButton(okButton);
      this.settingsDialog.addButton(closeButton);    
    }

    UI.showDialog("assemblerSettingsDialog");
    this.initSettingsContent();
  },

  initSettingsContent: function() {
    console.log('init settings');

    var config = this.editor.readConfig();
    var target = 'c64';
    var assembler = 'acme';
    var configFile = 'cfg/nes-asm.cfg';

    if(config != null && typeof config.error == 'undefined') {
      if(typeof config.target != 'undefined') {
        target = config.target;
      }

      if(typeof config.assembler != 'undefined') {
        assembler = config.assembler;
      }

      if(typeof config.cc65ConfigFile != 'undefined') {
        configFile = config.cc65ConfigFile;
      }

    }

    $('#assemblerTarget').val(target);
    $('#useAssembler').val(assembler);
    $('#assemblerConfigFilePath').val(configFile);

  },

  setSettings: function() {
    var config = this.editor.readConfig();
    if(config == null || typeof config.error != 'undefined') {
      config = {};
    }

    var target = $('#assemblerTarget').val();
    var assembler = $('#useAssembler').val();
    var configFile = $('#assemblerConfigFilePath').val();

    config.target = target;
    config.assembler = assembler;

    if(assembler == 'ca65') {
      config.cc65ConfigFile = configFile;
    } else {
      delete config.cc65ConfigFile;
    }

    console.log("SET SETTINGS");
    console.log(config);

    this.editor.setConfig(config);

    if(assembler == 'ca65') {
      this.createCfg(config.cc65ConfigFile, target);
    }
  },

  createCfg: function(filePath, type) {
    console.log('create config for ' + type);
    var srcFolder = '/asm';
    var doc = g_app.doc;
    var cfgFolder = g_app.doc.getDocRecord(srcFolder + "/cfg");
    if(!cfgFolder) {
      g_app.doc.createDocRecord(srcFolder, 'cfg', 'folder', {});//: function(parentPath, name, type, data, createAsId) {      
      g_app.projectNavigator.refreshTreeNodeFromPath(srcFolder);
    }


    if(type == 'c64') {    
      g_app.doc.createDocRecord(srcFolder + '/cfg', 'c64-asm.cfg', 'cfg', this.c64Cfg);
    } 
    if(type == 'nes') {
      g_app.doc.createDocRecord(srcFolder + '/cfg', 'nes-asm.cfg', 'cfg', this.nesCfg);      
    }
    g_app.projectNavigator.refreshTreeNodeFromPath(srcFolder + '/cfg');
    g_app.projectNavigator.treeRoot.refreshChildren();

console.log(g_app.doc);



  },

  initEvents: function() {
    var _this = this;
    $('#' + this.prefix + 'assemblerBuild').on('click', function() {
      _this.build();
    });
    $('#' + this.prefix + 'assemblerRun').on('click', function() {
      _this.run();
    });

    $('#' + this.prefix + 'assemblerBuildAndDownload').on('click', function() {
      _this.runBuildAndDownload();
    });

    $('#' + this.prefix + 'assemblerShare').on('click', function() {
      if(g_app.c64Debugger) {
        g_app.c64Debugger.share({ "type": 'assembly' });
      }                      
    });

    /*

    $('#assemblerSettings').on('click', function() {
      _this.assemblerSettings();
    });

    $('#assemblerShare').on('click', function() {
      _this.showShare();
    });
    */

/*
    $('#newFile').on('click', function() {
      _this.newFile();
    });
*/    
  },

/*
  newFile: function() {
    alert('new file!');
  },
*/

  start: function() {

  }
}