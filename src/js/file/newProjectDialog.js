var NewProjectDialog = function() {
  this.uiComponent = null;
  this.htmlPanel = null;

  this.mode = 'textmode';
  this.colorPaletteId = 'c64_colodore';
  this.colorPalette = null;
  this.colorPaletteCreated = false;
  this.colorPaletteName = 'C64';

  this.tileSetId = 'petscii';
  this.tileSetCreated = false;
  this.tileSet = null;
  this.tileSetName = 'C64 PETSCII';
  

}

NewProjectDialog.prototype = {
  init: function(editor) {
  },

  initEvents: function() {
    var _this = this;

    if($('#newProjectChooseTileSetButton').length > 0) {
      $('#newProjectChooseTileSetButton').on('click', function() {
        _this.chooseTileSet();

      });
    }

    if($('#newProductChooseColourPaletteButton').length > 0) {
      $('#newProductChooseColourPaletteButton').on('click', function() {
        _this.chooseColorPalette();
      });
    }

    $('input[name=newProjectMode]').on('click', function() {
      var value = $('input[name=newProjectMode]:checked').val();
      _this.setMode(value);
    });
  },


  setMode: function(mode) {
    if(this.mode !== mode) {
      this.mode = mode;
      if(mode == 'vector') {
        this.tileSetId = 'vector:modular-shapes';
        $('#newProjectTileSet').html('Modular Shapes');
        this.tileSetName = 'Modular Shapes';
        $('#enableFlipRotateRow').show();
      } else if(mode == 'petscii') {
        this.tileSetId = 'petscii';
        $('#newProjectTileSet').html('C64 PETSCII');
        this.tileSetName = 'C64 PETSCII';
        $('#enableFlipRotateRow').hide();
      } else {
        this.tileSetId = 'petscii';
        $('#newProjectTileSet').html('C64 PETSCII');
        this.tileSetName = 'C64 PETSCII';
        $('#enableFlipRotateRow').show();
      }
    }
  },

  chooseTileSet: function() {
    var _this = this;
    var args = {};
    if(this.mode == 'vector') {
      args.type = 'vector';
    } else {
      args.type = 'character';
    }
    
    args.callback = function(args) { //type, tileSetId, description) {
      

      var type = args.type;
      var tileSetId = args.presetId;
      var description = args.description;

      _this.tileSetCreated = args.tileSetCreated;
      _this.tileSet = args.tileSet;
      _this.mode = args.mode;

      if(type == 'vector') {
        $('input[name=newProjectMode][value=vector]').prop('checked', true);
        _this.tileSetId = 'vector:' + tileSetId;
      } else {
        $('input[name=newProjectMode][value=textmode]').prop('checked', true);
        _this.tileSetId = tileSetId;
      }


      if(_this.mode == 'indexed') {
        _this.colorPalette = args.colorPalette;
        _this.colorPaletteCreated = true;
        $('#newProjectColorPalette').html(description.name + ' Palette');
        this.colorPaletteName = description.name;
      }

      if(description) {
        var width = description.width;
        var height = description.height;
        $('#newProjectTileSet').html(description.name);
        this.tileSetName = description.name;
      }

    }

    var tileSetManager = g_app.textModeEditor.tileSetManager;
    var dialog = tileSetManager.getChoosePresetDialog();
    dialog.show(args);
  },

  chooseColorPalette: function() {
    var _this = this;
    var args = {};
    args.setColorPalette = false;
    args.callback = function(args) {//presetId, description) {
      var description = args.description;
      _this.colorPaletteCreated = args.colorPaletteCreated;

      if(!args.colorPaletteCreated) {
        _this.colorPaletteId = args.presetId;
        _this.colorPalette = null;
      } else {
        _this.colorPaletteId = false;
        _this.colorPalette = args.colorPalette;
      }

      if(description) {
        $('#newProjectColorPalette').html(description.name);
        this.colorPaletteName = description.name;
      }

//      _this.choosePreset(presetId, args);
    }

    var colorPaletteManager = g_app.textModeEditor.colorPaletteManager;
    var dialog = colorPaletteManager.getChoosePresetDialog();
    dialog.show(args);

  },

  show: function() {
    var isMobile = UI.isMobile.any();

    if(this.uiComponent == null) {
      var _this = this;
      var width = 380;
      var height = 254;

      if(isMobile) {
        height = 580;
        width = 500;
      }
      this.uiComponent = UI.create("UI.Dialog", { "id": "newProjectDialog", "title": "New Project", "width": width, "height": height });

      var html = '<div id="newProjectDialog">';

      if(isMobile) {
        html += '<div style="margin-bottom: 10px"></div>';
        html += '    <div class="formRow">';
        html += '      <div><label class="formControlLabel" for="newProjectMode">Mode</label></div>';
        html += '      <div style="margin-bottom: 8px"><label class="rb-container" style="margin-right: 10px; margin-bottom: 0"><input type="radio" name="newProjectMode" value="petscii"><span class="rb-label">PETSCII</span><span class="checkmark"></span></label></div>';
        html += '      <div style="margin-bottom: 8px"><label class="rb-container" style="margin-right: 10px; margin-bottom: 0"><input type="radio" name="newProjectMode" value="textmode" checked="checked"><span class="rb-label">Text Mode</span><span class="checkmark"></span></label></div>';
        html += '      <div style="margin-bottom: 8px"><label class="rb-container" style="margin-bottom: 0px;"><input type="radio" name="newProjectMode" value="vector"><span class="rb-label">Vector Mode</span><span class="checkmark"></span></label></div>';
        html += '    </div>';

      } else {
        html += '    <div class="formRow">';
        html += '      <label class="formControlLabel" for="newProjectMode">Mode</label>';
        html += '      <label class="rb-container" style="margin-right: 10px; margin-bottom: 0"><input type="radio" name="newProjectMode" value="petscii"><span class="rb-label">PETSCII</span><span class="checkmark"></span></label>';
        html += '      <label class="rb-container" style="margin-right: 10px; margin-bottom: 0"><input type="radio" name="newProjectMode" value="textmode" checked="checked"><span class="rb-label">Text Mode</span><span class="checkmark"></span></label>';
        html += '      <label class="rb-container" style="margin-bottom: 0px;"><input type="radio" name="newProjectMode" value="vector"><span class="rb-label">Vector Mode</span><span class="checkmark"></span></label>';
        html += '    </div>';
      }

      html += '    <div class="formRow">';
      html += '      <label class="formControlLabel" for="newProjectTileSet">Tile Set</label>';

      html += '      <div style="display: flex; align-items: center; padding: 2px 2px 2px 4px; background-color: #222222; min-height: 26px">';
      html += '        <div style="display: inline-block; width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" id="newProjectTileSet">C64 PETSCII</div>';

      if(!isMobile) {
        html += '        <div class="ui-button" id="newProjectChooseTileSetButton">Choose...</div>';
      }
      html += '      </div>';
      html += '    </div>';

      html += '    <div class="formRow">';
      html += '      <label class="formControlLabel" for="newProjectColorPalette">Colour Palette</label>';

      html += '      <div style="display: flex; align-items: center; padding: 2px 2px 2px 4px; background-color: #222222; min-height: 26px">';
      html += '      <div style="display: inline-block; width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis" id="newProjectColorPalette">C64</div>';

      if(!isMobile) {
        html += '      <div class="ui-button" id="newProductChooseColourPaletteButton">Choose...</div>';
      }

      html += '      </div>';
      html += '    </div>';


      html += '    <div class="formRow">';
      html += '      <label class="formControlLabel" for="newProjectWidth">Dimensions</label>';

      html += '      <div style="display: flex">';
      html += '      <input type="number" style="width: 30px" class="formControl number dimensionsNumber" min="1" id="newProjectWidth" size="4" value="40"/>';
      html += '      <div>&nbsp;x&nbsp;</div>';
      html += '      <input type="number" style="width: 30px" class="formControl number dimensionsNumber" min="1" id="newProjectHeight" size="4" value="25"/>';
      html += '      </div>';

      html += '    </div>';


      html += '    <div class="formRow" id="enableFlipRotateRow">';
      html += '      <label class="formControlLabel" for="">Enable</label>';
//      html += '      '

      html += '  <div class="checkboxGroup">';
      html += '    <label class="cb-container no-margin">Tile Rotate'
      html += '      <input type="checkbox"  id="newProjectTileRotate" value="1" checked="checked">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '    <label class="cb-container no-margin">Tile Flip'
      html += '      <input type="checkbox"  id="newProjectTileFlip" value="1" checked="checked">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';

      html += '  </div>';


      html += '    </div>';


      // html += '<div>For PETSCII disable Rotate and Flip </div>';


      html += '</div>';
      this.htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(this.htmlPanel);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.okButton.on('click', function(event) {
        _this.createNewProject();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.addButton(this.okButton);
      this.uiComponent.addButton(this.closeButton);

      UI.on('ready', function() {
        UI.number.initControls('#newProjectDialog' + ' .number');
        _this.initEvents();
      });
    } 

    UI.showDialog("newProjectDialog");

  },

  createNewProject: function() {

    var width = parseInt($('#newProjectWidth').val(), 10);
    var height = parseInt($('#newProjectHeight').val(), 10);

    var tileRotate = $('#newProjectTileRotate').is(':checked');
    var tileFlip = $('#newProjectTileFlip').is(':checked');
    var args = {};
    args.canFlipTile = tileFlip;
    args.canRotateTile = tileRotate;

    args.screenMode = $('input[name=newProjectMode]:checked').val();
    args.tileSetPresetId = this.tileSetId;

    args.tileSetCreated = this.tileSetCreated;
    args.tileSet = this.tileSet;
    args.tileSetName = this.tileSetName;
    if(args.tileSet) {
      args.screenMode = this.mode;
    }

    if(args.screenMode == 'vector') {
      if(this.tileSetId.indexOf('vector') !== 0) {
        this.tileSetId = 'vector:modular-shapes';
      }
      args.canFlipTile = true;
      args.canRotateTile = true;
    } else {
      if(this.tileSetId && this.tileSetId.indexOf('vector') == 0) {
        args.tileSet = 'petscii';
      }
    }

    if(args.screenMode == 'petscii') {
      args.canFlipTile = false;
      args.canRotateTile = false;
      args.screenMode = TextModeEditor.Mode.C64STANDARD;
    }

    args.colorPalettePresetId = this.colorPaletteId;
    args.colorPalette = this.colorPalette;
    args.colorPaletteName = this.colorPaletteName;
    args.width = width;
    args.height = height;

    g_app.newProject(args);
  }

}