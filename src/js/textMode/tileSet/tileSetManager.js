var TileSetManager = function() {
  this.editor = null;
  this.currentTileSet = null;
  this.tileSetChoosePreset = null;
  this.tileSetChoosePresetMobile = null;
  this.tileSetImport = null;
  this.tileSetSave = null;

  this.newTileSetDialog = null;

  this.blankCharacter = 32;
  this.noTile = -1;
  
  this.tileSets = [];

  this.tileSetCache = {};
}

TileSetManager.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  initNewTileSetDialogContent: function() {
    $('#newTileSetName').val('Tile Set');
    $('#newTileSetName').focus();
    $('#newTileSetName').select();    

  },

  showNewTileSetDialog: function() {
    var _this = this;
    if(this.newTileSetDialog == null) {
      var width = 320;
      var height = 296;
      this.newTileSetDialog = UI.create("UI.Dialog", { "id": "newTileSetDialog", "title": "New Tile Set", "width": width, "height": height });

      this.newTileSetHTML = UI.create("UI.HTMLPanel");
      this.newTileSetDialog.add(this.newTileSetHTML);
      this.newTileSetHTML.load('html/textMode/newTileSet.html', function() {    
        _this.initNewTileSetDialogContent();
      });


      var okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      okButton.on('click', function(event) {

        _this.newTileSetSubmit();
        UI.closeDialog();
      });
 
      var closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.newTileSetDialog.addButton(okButton);
      this.newTileSetDialog.addButton(closeButton);
      UI.showDialog("newTileSetDialog");
    } else {
      UI.showDialog("newTileSetDialog");
      this.initNewTileSetDialogContent();      
    }

    // work out whats being created

  },

  newTileSetSubmit: function() {
    var name = $('#newTileSetName').val();
    var tileCount = $('#newTileSetCount').val();
    
    var newTileSetId = this.createTileSet({ name: name, width: 8, height: 8 }); 

    var newTileSet = this.getTileSet(newTileSetId);
    newTileSet.setTileCount(tileCount);

    if(g_app.getMode() != '3d') {
      // get the current layer
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer != null && layer.getType() == 'grid') {
        layer.setTileSet(newTileSetId);
      }
    } else {
      this.editor.grid3d.setTileSet(newTileSetId);
    }
    

    this.updateTileSetMenu();

    g_app.projectNavigator.reloadTreeBranch('/tile sets');
    g_app.projectNavigator.treeRoot.refreshChildren();
  },


  updateTileSetMenu: function() {
    var tileSetMenu = g_app.tileSetMenu;
    var selectedTileset = null;

    if(g_app.getMode() != '3d') {
      // get the current layer
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer == null || layer.getType() != 'grid') {
        return;
      }
      selectedTileset = layer.getTileSet();
    } else {
      selectedTileset = this.editor.grid3d.getTileSet();
    }

    var tileWidth = selectedTileset.getTileWidth();
    var tileHeight = selectedTileset.getTileHeight();


    // get all matching tilesets..
//    var currentMenuItems = tileSetMenu.getItems();


    var tileSets = g_app.doc.dir('/tile sets');
    for(var i = 0; i < tileSets.length; i++) {
      var tileSetData = tileSets[i].data;
      
      if(tileWidth === tileSetData.width && tileHeight === tileSetData.height) {
        // tile set dimensions ok..
        var name = tileSets[i].name;
        var id = tileSets[i].id;
        var menuId = 'tileset-select-' + id;
        var menuItem = tileSetMenu.getItem(menuId);
        if(menuItem) {
          menuItem.setLabel(name);
        } else {
          menuItem = tileSetMenu.addItem({ "label": name, "id": menuId });
        }

        if(id == selectedTileset.getId()) {
          menuItem.setChecked(true);
        } else {
          menuItem.setChecked(false);
        }
      }
    }
  },

  selectTileSet: function(tileSetId) {

    if(g_app.getMode() != '3d') {

      // get the current layer
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer != null && layer.getType() == 'grid') {
        layer.setTileSet(tileSetId);
        this.editor.graphic.redraw({ allCells: true });
      }
    } else {
      this.editor.grid3d.setTileSet(tileSetId);
    }
    this.updateTileSetMenu();

  },


  getCurrentTileSetId: function() {
    if(this.currentTileSet == null) {
      return false;
    }

    return this.currentTileSet.tileSetId;
  },
  
  createTileSet: function(args) {
    var width = 8;
    var height = 8;
    var name = "Tile Set";
    if(typeof args.name !== 'undefined') {
      name = args.name
    }
    var id = false;
    if(typeof args.id !== 'undefined') {
      id = args.id;
    }

    if(typeof args.width != 'undefined') {
      width = args.width;
    }

    if(typeof args.height != 'undefined') {
      height = args.height;
    }


    // make sure the name is unique
    var testName = name;
    var count = 0;
    while(g_app.doc.getDocRecord('/tile sets/' + testName)) {
      count++;
      testName = name + '_' + count
    }
    name = testName;

    var tileSet = g_app.doc.createDocRecord(
                "/tile sets", 
                name, 
                "tile set", 
                { width: width, height: height, tileData: [] },
                id);
    
    return tileSet.id;
  },

  reset: function() {
    for(var i = 0; i < this.tileSets.length; i++) {
      this.tileSets[i].clear();
    }
    this.tileSets = [];
    this.tileSetCache = {};
  },

  getTileSetCount: function() {
    return this.tileSets.length;
  },

  getTileCount: function() {
    return 256;
  },

  /*
  getTileSet: function(index) {
    return this.tileSets[index];
  },
  */
  // call this when whole charcter set has changed
  tileSetUpdated: function(args) {

    var updateBlankCells = false;
    var updateSortMethods = false;


    if(!this.currentTileSet) {
      return;
    }

    if(typeof args != 'undefined') {
      if(typeof args.updateBlankCells != 'undefined') {
        updateBlankCells = args.updateBlankCells;
      }
      if(typeof args.updateSortMethods != 'undefined') {
        updateSortMethods = args.updateSortMethods;
      }
    }

    this.editor.tools.drawTools.tilePalette.initCharPalette();
    this.editor.sideTilePalette.initCharPalette();
//    this.editor.tools.drawTools.tilePalette.setCharPaletteMapType(this.currentTileSet.type);
   

    var blankCharacter = this.currentTileSet.getBlankCharacter();

    if(updateBlankCells && blankCharacter != this.blankCharacter && blankCharacter !== false && this.blankCharacter !== false) {
      var layers = this.editor.layers.getLayers();
      for(var i = 0; i < layers.length; i++) {
        var layerId = layers[i].layerId;
        var layer = this.editor.layers.getLayerObject(layerId);

        // if a layer is using this tileset, update which tile it thinks is the blank one..
        if(layer && layer.getType() == 'grid') {
          if(layer.getTileSetId() == this.currentTileSet.getId()) {
            layer.setBlankTileId(blankCharacter, true);
          }
        }

      }
    } else {
      var layers = this.editor.layers.getLayers();
      for(var i = 0; i < layers.length; i++) {
        var layerId = layers[i].layerId;
        var layer = this.editor.layers.getLayerObject(layerId);

        // if a layer is using this tileset, update which tile it thinks is the blank one..
        if(layer && layer.getType() == 'grid') {
          if(layer.getTileSetId() == this.currentTileSet.getId()) {
            layer.setBlankTileId(blankCharacter, false);
          }
        }

      }

    }

    this.blankCharacter = blankCharacter;
    
    if(g_app.getMode() == '3d') {
      this.currentTileSet.generate3dGeometries();
    } else if(g_app.getMode() == '2d') {
      this.editor.graphic.redraw();
    }

    if(updateSortMethods) {
      this.updateSortMethods();
    }

    this.redrawCharacters();

    if(this.editor.type == '2d') {
      this.editor.layers.updateAllLayerPreviews();
    }

    var width = this.currentTileSet.getTileWidth();
    var height = this.currentTileSet.getTileHeight();
    var name = this.currentTileSet.label + " (" + width + "x" + height + ")";
//    name = '';
//    $('#tilePaletteName').html(name);

//    console.error(this.currentTileSet.name);

    $('#tilePaletteTileSize').html(" " + width + "x" + height);
    $('#sidetilePaletteTileSize').html(" " + width + "x" + height);    


  },


  getSavedSortMethod: function() {  
    var sortMethod = false;
    // return the saved sort method for the current tileset
    if(!this.currentTileSet) {
      return;
    }

    if(this.currentTileSet.isPetscii()) {

      sortMethod = g_app.getPref("textmode.petsciisortmethod");
      if(typeof sortMethod == 'undefined' || sortMethod == null) {
        sortMethod = 'petsciigraphic';
      }
    }

    // make sure the sort method exists
    var sortMethods = this.currentTileSet.getSortMethods();
    for(var i = 0; i < sortMethods.length; i++) {
      if(sortMethods[i].id == sortMethod) {
        return sortMethod;
      }
    }
    
    return false;
  },

  // update the dropdown used to set the tile palette sorting
  updateSortMethods: function(sortMethods) {

    var tilePalette = this.editor.tools.drawTools.tilePalette;
    var sideTilePalette = this.editor.sideTilePalette;

    var sortMethods = this.currentTileSet.getSortMethods();


    var hasSimilar = false;
    var optionsHtml = '';
    var mobileOptionsHtml = '';

    var screenMode = this.editor.getScreenMode();
    for(var i = 0; i < sortMethods.length; i++) {

      if(sortMethods[i].id != 'similar' || screenMode != TextModeEditor.Mode.C64ECM) {
        optionsHtml += '<option value="' + sortMethods[i].id + '">' + sortMethods[i].name + '</option>';

        if(sortMethods[i].id != 'columns') {
          mobileOptionsHtml += '<option value="' + sortMethods[i].id + '">' + sortMethods[i].name + '</option>';
        }

        if(sortMethods[i].id == 'similar') {
          hasSimilar = true;
        }
      }
    }
    var sidecharPaletteSortOrder = $('#sidecharPaletteSortOrder');

    $('#charPaletteSortOrder').html(optionsHtml);
    if(sidecharPaletteSortOrder) {
      sidecharPaletteSortOrder.html(optionsHtml);
    }
    if(hasSimilar) {
      var savedSortMethod = this.getSavedSortMethod();
      if(!savedSortMethod || savedSortMethod == '') {
        savedSortMethod = 'similar';
      }

      $('#charPaletteSortOrder').val(savedSortMethod);
      if(sidecharPaletteSortOrder) {
        sidecharPaletteSortOrder.val(savedSortMethod);
      }
      tilePalette.setCharPaletteMapType(savedSortMethod);
      sideTilePalette.setCharPaletteMapType(savedSortMethod);
    } else {
      $('#charPaletteSortOrder').val('columns');
      tilePalette.setCharPaletteMapType('columns');
      sideTilePalette.setCharPaletteMapType('columns');
    }
    tilePalette.updateTileCountHTML();
    sideTilePalette.updateTileCountHTML();

    if(this.editor.currentTile.tilePaletteChooserMobile !== null) {
      var selectedType = $('#charPaletteSortOrderMobileChoose').val();
      
      $('#charPaletteSortOrderMobileChoose').html(mobileOptionsHtml);

      if(typeof selectedType == 'undefined' || !selectedType) {
        selectedType = 'source';
        if(hasSimilar) {
          selectedType = 'similar';
        }
      }
      this.editor.currentTile.tilePaletteChooserMobile.setCharPaletteMapType(selectedType);
      $('#charPaletteSortOrderMobilePicker').val(selectedType);
      $('#charPaletteSortOrderMobileChoose').val(selectedType);
    }

    // currently importing an image?
    if(this.editor.importImage && this.editor.importImage.importImageMobile && this.editor.importImage.importImageMobile.tilePaletteChooserMobile) {
      var selectedType = $('#charPaletteSortOrderMobileChoose').val();

      if(typeof selectedType == 'undefined' || !selectedType ) {
        selectedType = $('#charPaletteSortOrderMobilePicker').val();
      }


      $('#charPaletteSortOrderMobilePicker').html(mobileOptionsHtml);
      if(typeof selectedType == 'undefined' || !selectedType) {
        selectedType = 'source';
        if(hasSimilar) {
          selectedType = 'similar';
        }
      }
      this.editor.importImage.importImageMobile.tilePaletteChooserMobile.setCharPaletteMapType(selectedType);
      $('#charPaletteSortOrderMobilePicker').val(selectedType);

    }


  },


  // redraw all characters where they appear
  redrawCharacters: function() {
    this.editor.tools.drawTools.tilePalette.drawTilePalette({ redrawTiles: true });
    this.editor.sideTilePalette.drawTilePalette({ redrawTiles: true });

    if(this.editor.tileEditor) {
      this.editor.tileEditor.draw();
    }

    this.editor.currentTile.canvasDrawCharacters();

    if(this.editor.tools.drawTools.tool == 'type') {
      this.editor.tools.drawTools.typing.updateTypeCanvas();
    }
  },

  addTileSet: function(tileSet) {
    alert('ADD TILE SET');
    this.tileSets.push(tileSet);
  },


  outputCache: function(section) {
    console.log('=========================> ' + section);
    for(var key in this.tileSetCache) {
      console.log('key = ' + key);
      console.log('tile set id = ' + this.tileSetCache[key].getId());
    }
    console.log(this.tileSetCache);

  },

  addTileSetToDoc: function(args, callback) {


    if(typeof args.tileSetId != 'undefined' && args.tileSetId != '') {
      // tile set already exists in doc..prob should check tho..
      if(typeof callback != 'undefined') {
        callback(args.tileSetId);
      }
      return;
    }


    if(typeof args.preset != 'undefined' && args.preset != '' && args.preset != false) {
      // adding from a preset
      this.addTileSetFromPreset(args, callback);
      return;
    } 


    // new tile set..
    var width = 8;
    var height = 8;
    var name = 'Tile Set';

    if(typeof args.tileSetName != 'undefined') {
      name = args.tileSetName;
    }

    if(args.name != 'undefined') {
      name = args.name;
    }
    if(args.width != 'undefined') {
      width = args.width;
    }
    if(args.height != 'undefined') {
      height = args.height;
    }

    var tileSetId = this.createTileSet({ name: name, width: width, height: height });


    var tileSet = new TileSet();
    tileSet.init(this.editor, name, tileSetId, '');
    this.tileSetCache[tileSetId] = tileSet;

    if(typeof args.tileSet != 'undefined' && args.tileSet != null) {
      tileSet.copyTileSet(args.tileSet);
    }

    if(typeof callback != 'undefined') {
      callback(tileSetId);
    }

  },

  addTileSetFromPreset: function(args, callback) {
    var preset = args.preset;
    var name = "Tile Set";

    if(typeof args.tileSetName != 'undefined') {
      name = args.tileSetName;
    }
    var tileSetId = this.createTileSet({ name: name });

    var tileSet = new TileSet();
    tileSet.init(this.editor, preset, tileSetId);
    this.tileSetCache[tileSetId] = tileSet;

    tileSet.setToPreset(preset, function() {    
      if(typeof callback != 'undefined') {
        callback(tileSetId);
      }
    });

  },

  usePresetTileSet: function(preset, callback) {


    var tileSet = this.currentTileSet;
    if(tileSet == null) {
      var tileSetId = this.createTileSet({ name: preset });
      tileSet = new TileSet();
      tileSet.init(this.editor, preset, tileSetId);
      this.currentTileSet = tileSet;
      this.tileSetCache[tileSetId] = tileSet;

    }



//    this.currentTileSet = new TileSet();
//    this.currentTileSet.init(this.editor, 'Default');
    this.currentTileSet.setToPreset(preset, callback);

    // TODO: shouldn't create new one, should just set current to preset, init should create a character set instead??
    if(this.tileSets.length > 0) {
      this.tileSets[0] = this.currentTileSet;
    } else {
      this.tileSets.push(this.currentTileSet);
    }
  },

  createBin: function(args) {
    var tileSetId = args.tileSetId;
    var binPath = args.binPath;
    var name = args.name;

    var binType = 'char';
    if(typeof args.binType != 'undefined') {
      binType = args.binType;
    }

    name = name + ' - ' + binType + ' data.bin';

    var tileSet = this.getTileSet(tileSetId);

    var binData = null;
    
    switch(binType) {
      case 'attrib':
        binData = tileSet.getAttribBinaryData();
        break;
      default:
        binData = tileSet.getBinaryData();
        break;
    } 

    var data = bufferToBase64(binData);

    var type = 'bin';
    var parentPath = '/asm/bin';

    var record = g_app.doc.getDocRecord(parentPath + '/' + name);
    if(record) {
      record.data = data;
    } else {
      var newDocRecord = g_app.doc.createDocRecord(parentPath, name, type, data);
    }

    g_app.projectNavigator.reloadTreeBranch('/asm/bin');
    g_app.projectNavigator.treeRoot.refreshChildren();

    return { success: true, path: 'bin/' + name }
    
  },

  getTileSet: function(tileSetId) {

    if(this.tileSetCache.hasOwnProperty(tileSetId)) {
      return this.tileSetCache[tileSetId];
    }

    var tileSetRecord = g_app.doc.getDocRecordById(tileSetId, "/tile sets");
    if(tileSetRecord) {
      var tileSet = new TileSet();
      tileSet.init(this.editor, tileSetRecord.name, tileSetId);

      this.tileSetCache[tileSetId] = tileSet;

      return tileSet;
    }


    return null;
  },




  setCurrentTileSetFromId: function(tileSetId) {

    var tileSet = this.getTileSet(tileSetId);

    if(tileSet) {
      if(this.currentTileSet && this.currentTileSet.tileSetId == tileSetId) {
//        console.log('already set to this tileset!!!');
        // already set.
        return;
      }

      this.currentTileSet = tileSet;
      this.tileSetUpdated({ updateBlankCells: false, updateSortMethods: true });
    }

  },

  setCurrentTileSet: function(index) {
    console.error("SET CURRENT TILE SET ***** get rid of this ***");
    if(index >= this.tileSets.length) {
      return;
    }
    this.currentTileSet = this.tileSets[index];

//    this.blankCharacter = this.currentTileSet.getBlankCharacter();
  },


  getCurrentTileSet: function() {
    return this.currentTileSet;
  },


  
  showImport: function(args) {

    args.showImport = true;
    this.showChoosePreset(args);

    /*
    if(this.tileSetImport == null) {
      this.tileSetImport = new TileSetImport();
      this.tileSetImport.init(this.editor);
    }
    this.tileSetImport.start(args);
    */

  },



  showChoosePreset: function(args) {
    //var args = {};
    var _this = this;

    args.type = 'character';

    if(g_app.getMode() != 'tile set') {    
      var layer = this.editor.layers.getSelectedLayerObject();
      if(layer && layer.getMode() == 'vector') {
        args.type = 'vector';
      }
    }

    // called when tileset is chosen
    args.callback = function(args) { //type, tileSetId) {
      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      // find how many places it's used..

      var type = 'textmode';
      
      type = args.type;
      var tileSetId = args.presetId;


      if(type == 'vector') {
        // check if the current layer is vector, switch it if not
        var layer = this.editor.layers.getSelectedLayerObject();
        if(layer.getMode() != 'vector') {
          layer.setMode({ "mode": 'vector', "tileSet": tileSetId }, function() {
            layer.setHasTileFlip(true);
            layer.setHasTileRotate(true);
            // redraw the layer
            _this.editor.layers.updateLayerInterface(layer.getId());

            _this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: true, updateSortMethods: true });
            _this.editor.graphic.setCellDimensionsFromTiles();
            _this.editor.graphic.redraw({ allCells: true });

          });
        } else {
          tileSet.setToVector(tileSetId, function() {
            _this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: true, updateSortMethods: true });
            _this.editor.graphic.setCellDimensionsFromTiles();
            _this.editor.graphic.redraw({ allCells: true });
          });
        }

      } else {

        var layer = this.editor.layers.getSelectedLayerObject();
        if(layer.getMode() == 'vector') {
          layer.setMode(TextModeEditor.Mode.TEXTMODE);

        }


        tileSet.setToPreset(tileSetId, function() {

          // only really want to do this if graphic is currently being displayed
          _this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: true, updateSortMethods: true });
          _this.editor.layers.updateLayerInterface(layer.getId());

          if(g_app.getMode() == 'tile set') {
            g_app.tileSetEditor.redraw();
          } else {
            _this.editor.tools.drawTools.tilePalette.drawTilePalette();
            _this.editor.sideTilePalette.drawTilePalette();

            if(g_app.getMode() == '3d') {

            } else {
              _this.editor.graphic.setCellDimensionsFromTiles();
              _this.editor.graphic.redraw({ allCells: true });
            }
            
          }
        });
      }
    }

    if(g_app.isMobile()) {
      if(this.tileSetChoosePresetMobile == null) {
        this.tileSetChoosePresetMobile = new CharacterSetChoosePresetMobile();
        this.tileSetChoosePresetMobile.init(this.editor);
      }

      this.tileSetChoosePresetMobile.show(args);

    } else {
      var dialog = this.getChoosePresetDialog();
      dialog.show(args);
      /*
      if(this.tileSetChoosePreset == null) {
        this.tileSetChoosePreset = new TileSetChoosePreset();
        this.tileSetChoosePreset.init(this.editor);
      }

      this.tileSetChoosePreset.show(args);
      */
    }
  },

  getChoosePresetDialog: function() {
    if(this.tileSetChoosePreset == null) {
      this.tileSetChoosePreset = new TileSetChoosePreset();
      this.tileSetChoosePreset.init(this.editor);
    }
    return this.tileSetChoosePreset;
  },


  showSave: function() {
    if(this.tileSetSave == null) {
      this.tileSetSave = new TileSetSave();
      this.tileSetSave.init(this.editor);
    }

    this.tileSetSave.show();

  },

  showCharacterPicker: function(x, y, args) {
    if(this.tilePickerPopup == null) {
      this.tilePickerPopup = new TilePickerPopup();
      this.tilePickerPopup.init(this.editor);
    }
    this.tilePickerPopup.show(x, y, args);
  },



}
