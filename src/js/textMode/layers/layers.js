var Layers = function() {
  this.editor = null;

  this.backgroundLayerPreview = null;

  this.selectedLayerId = false;

  this.layers = [];


  // layer refs used by undo/redo to identify the layers
  this.layerRefs = [];
  this.layerObjects = {};

  this.nextLayerId = 0;
  this.scrollbar = null;
  // checkerboard pattern
  this.backgroundCanvas = null;

  this.backgroundEnabled = true;
  this.backgroundVisible = true;

  this.layerPropertiesDialog = null;
  this.refLayerId = false;

  this.compositeOperations = [
    { "label": 'Normal', 'operation': 'source-over' },

    { "label": "-" },

    { "label": 'Darken', 'operation': 'darken' },
    { "label": 'Multiply', 'operation': 'multiply' },
    { "label": 'Colour Burn', 'operation': 'color-burn' },

    { "label": "-" },

    { "label": 'Lighten', 'operation': 'lighten' },
    { "label": 'Screen', 'operation': 'screen' },
    { "label": 'Colour Dodge', 'operation': 'color-dodge' },
    { "label": 'Lighter', 'operation': 'lighter' },

    { "label": "-" },

    { "label": 'Overlay', 'operation': 'overlay' },
    { "label": 'Hard Light', 'operation': 'hard-light' },
    { "label": 'Soft Light', 'operation': 'soft-light' },

    { "label": "-" },    
    
    { "label": 'Difference', 'operation': 'difference' },
    { "label": 'Exclusion', 'operation': 'exclusion' },

    /*
    { "label": "-" },

    { "label": 'Hue', 'operation': 'hue' },
    { "label": 'Saturation', 'operation': 'saturation' },
    { "label": 'Colour', 'operation': 'color' },
    { "label": 'Luminosity', 'operation': 'luminosity' },


    { "label": "-" },

    { "label": 'XOR', 'operation': 'xor' },
    { "label": 'Destination In', 'operation': 'destination-in' },
    { "label": 'Destination Out', 'operation': 'destination-out' },
    { "label": 'Destination Over', 'operation': 'destination-over' },
    { "label": 'Destination Atop', 'operation': 'destination-atop' },
    { "label": 'Source In', 'operation': 'source-in' },
    { "label": 'Source Out', 'operation': 'source-out' },
    { "label": 'Source Atop', 'operation': 'source-atop' },
*/

  ];

  this.mouseDownOnLayer = false;
  this.dragLayer = false;
  this.mouseDownX = 0;
  this.mouseDownY = 0;

  this.layerMerge = null;
  this.layesFrames = null;


  this.mobileLayersDialog = null;

}


Layers.prototype = {

  init: function(editor) {
    this.editor = editor;
  },


  initMobileLayersDialog: function() {

    if(this.mobileLayersDialog === null) {
      var width = UI.getScreenWidth() - 30;
      if(width > 380) {
        width = 380;
      }

      this.mobileLayersDialog = UI.create("UI.Dialog", { "id": "mobileLayersDialog", "title": "Layers", "width": width });

      var html = '<div class="panelFill">';

      html += '<div id="layersHolderMobileButtons" style="position: absolute; left: 10px; top: 10px; height: 30px; right: 10px">';
      html += '<div class="ui-button" id="addLayerMobileButton"><i class="halflings halflings-plus"></i> New Layer</div>';
      html += '&nbsp;';
      html += '<div class="ui-button" id="deleteLayerMobileButton"><i class="halflings halflings-trash"></i> Delete Layer</div>';
      html += '</div>';


      html += '<div id="layersHolderMobile" style="position: absolute; left: 10px; top: 60px; bottom: 60px; right: 10px"></div>';
      html += '</div>';

      html += '<div id="" style="position: absolute; left: 10px; bottom: 10px; height: 30px; right: 10px; display: flex">';
      html += '<div class="ui-button" id="layerPropertiesMobileButton">Properties</div>';
      html += '&nbsp;';
      html += '<div class="ui-button" id="layerMoveUpButton">Move Up</div>';
      html += '&nbsp;';
      html += '<div class="ui-button" id="layerMoveDownButton">Move Down</div>';
      html += '</div>';



      this.mobileLayersDialogHTML = UI.create("UI.HTMLPanel", { html: html });
      this.mobileLayersDialog.add(this.mobileLayersDialogHTML);

      var closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.mobileLayersDialog.addButton(closeButton);
      closeButton.on('click', function(event) {
        UI.closeDialog();
      });


      var _this = this;
      $('#addLayerMobileButton').on('click', function() {
        _this.showNewLayerDialog();
      });

      $('#deleteLayerMobileButton').on('click', function() {

        if(_this.getLayerCount() <= 1) {
          alert('Sorry, you cannot delete this layer');
          return;
        }
        if(confirm('Are you sure you want to delete this layer?')) {
          _this.deleteLayer();
        }
      });

      $('#layerPropertiesMobileButton').on('click', function() {
        var id = _this.getSelectedLayerId();
        if(id !== false) {
          _this.editLayer(id);
        }
      });

      $('#layerMoveUpButton').on('click', function() {
        _this.moveLayer(1);
      });

      $('#layerMoveDownButton').on('click', function() {
        _this.moveLayer(-1);
      });


    } 
  },

  showMobileLayerChooser: function() {
    console.log('show mobile layer chooser');
//    this.initMobileLayersDialog();


/*
    var newParent = document.getElementById('layersHolderMobile');
    var oldParent = document.getElementById('layersHolder');

    while (oldParent.childNodes.length > 0) {
        newParent.appendChild(oldParent.childNodes[0]);
    }
*/

    UI.showDialog('mobileLayersDialog');

  },


  showLayerMerge: function() {
    if(this.layerMerge == null) {
      this.layerMerge = new LayersMerge();
      this.layerMerge.init(this.editor);
    }
    this.layerMerge.show();
  },


  mergeLayers: function(layers) {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    var selectedLayer = this.layers[selectedLayerIndex];
    if(selectedLayer.type != 'grid') {
      alert('Can only merge into a grid layer');
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var blankCharacter = tileSet.getBlankCharacter();
    var noColor = this.editor.colorPaletteManager.noColor;

    // merge layers into the current layer
    var width = this.editor.frames.width;
    var height = this.editor.frames.height;

//{ c: data[z][y][x].c, fc: data[z][y][x].fc, bc: data[z][y][x].bc };

    this.editor.history.startEntry('Merge Layers');


    var data = [];
    for(var y = 0; y < height; y++) {
      data[y] = [];
      for(var x = 0; x < width; x++) {
        data[y][x] = {};
        data[y][x].c = blankCharacter;
        data[y][x].fc = 0;
        data[y][x].bc = noColor;
        data[y][x].x = x;
        data[y][x].y = y;
        data[y][x].z = selectedLayer.gridZ;
        data[y][x].update = false;
      }
    }

    // work out what to do for each cell..
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {

        for(var i = 0; i < this.layers.length; i++) {
          var layerIndex = false;

          if(this.layers[i].visible) {
            if(this.layers[i].type == 'grid') {
              layerIndex = i;
            }
          }

          if(layerIndex !== false) {
            var z = this.layers[layerIndex].gridZ;
            var cell = this.editor.grid.gridData[z][y][x];
            if(cell.c != blankCharacter) {
              data[y][x].c = cell.c;
              data[y][x].fc = cell.fc;
              data[y][x].bc = cell.bc;
            }

            if(layerIndex != selectedLayerIndex) {
              this.editor.grid.setCell({ x: x, y: y, z: z, c: blankCharacter, fc: cell.fc, bc: noColor, update: false });
            }
          }
        }
      }
    }

    var z = selectedLayer.gridZ;
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {

        this.editor.grid.setCell(data[y][x]);
      }
    }

    this.editor.history.endEntry();

//    this.editor.grid.update();

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

    this.updateAllLayerPreviews();
  },

  showLayersToFrames: function() {
    if(this.layersFrames == null) {
      this.layersFrames = new LayersFrames();
      this.layersFrames.init(this.editor);
    }

    this.layersFrames.showLayersToFrames();
  },

  layersToFrames: function() {
    var frameDuration = 12;
    var copyFromFrame = this.editor.frames.currentFrame;

    var width = this.editor.frames.width;
    var height = this.editor.frames.height;

    var selectedLayerIndex = this.getSelectedLayerIndex();
    var selectedLayer = this.layers[selectedLayerIndex];
    if(selectedLayer.type != 'grid') {
      alert('Can only merge into a grid layer');
    }

    this.editor.history.startEntry('Layers To Frames');

    for(var i = 0; i < this.layers.length; i++) {
      var layerIndex = false;

      if(this.layers[i].visible) {
        if(this.layers[i].type == 'grid') {
          layerIndex = i;
        }
      }

      if(layerIndex !== false) {

        this.editor.frames.insertFrame(this.editor.frames.currentFrame, frameDuration);

        var z = this.layers[layerIndex].gridZ;


        for(var y = 0; y < height; y++) {
          for(var x = 0; x < width; x++) {
            var cell = this.editor.frames.frames[copyFromFrame].data[z][y][x];            
            this.editor.grid.setCell({ x: x, y: y, z: selectedLayer.gridZ, c: cell.c, fc: cell.fc, bc: cell.bc, update: false });//cell.character, x, y, importIntoZ, cell.color, cell.rotX, cell.rotY, cell.rotZ);
          }
        }
      }
    }

    this.editor.history.endEntry();
//    this.editor.grid.update();

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }



  },

  showFramesToLayers: function() {
    if(this.layersFrames == null) {
      this.layersFrames = new LayersFrames();
      this.layersFrames.init(this.editor);
    }

    this.layersFrames.showFramesToLayers();
  },


  load: function() {

    this.initMobileLayersDialog();
    this.layerObjects = {};
    this.layerRefs = [];
    var doc = this.editor.doc;

    if(typeof doc.data.layers == 'undefined') {
      doc.data.layers = [];
    }

    this.selectedLayerId = false;

    this.layers = doc.data.layers;

    var html = this.dragLayerHTML();

    if(g_app.isMobile()) {
      $('#layersHolderMobile').html(html);
    } else {
      $('#layersHolder').html(html);
    }



//    $('#layersHolder').html(html);
    if(this.layers.length == 0) {


      console.error('create layers');
      // ok no layers created, need to init
      //this.initLayers();

      this.editor.history.setEnabled(false);
      //this.newLayer({ type: 'background' });
      var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
      var backgroundColor =  colorPalette.getDefaultBackgroundColor();
      var borderColor = colorPalette.getDefaultBorderColor();

      this.newLayer({ type: 'grid', backgroundColor: backgroundColor, borderColor: borderColor });
      this.editor.history.setEnabled(true);
    } else {
      // select non background layer..

      
      for(var i = 0; i < this.layers.length; i++) {
        var layerType = this.layers[i].type;
        var layerId = this.layers[i].layerId;

        switch(layerType) {
          case 'grid':
            var layerRef = this.getLayerRef(layerId);
            var layerGrid = new LayerGrid();
            layerGrid.loadFromDoc(this.editor, layerId, layerRef);            
            this.layerObjects[layerId] = layerGrid;            
          break;
          case 'image':
            var layerRef = this.getLayerRef(layerId);
            var layerRefImage = new LayerRefImage();
            layerRefImage.loadFromDoc(this.editor, layerId, layerRef);            
            this.layerObjects[layerId] = layerRefImage;            
          break;
        }

        /*
        if(this.layers[i].type != 'grid') {
          this.layers[i].canvas = document.createElement('canvas');

          if(this.layers[i].type == 'image') {
            if(typeof this.layers[i].imageData != 'undefined') {
              this.layers[i].image = document.createElement('canvas');

              this.loadRefImageLayer(i);
              // need to load the image
            }
          }
        }
        */

      }

      this.refreshLayersHTML();
      // need to create the html for the layers..
//      console.error('create html for layers, select non background layer');

    }

    if(this.scrollbar) {
      this.scrollbar.update();
    }

  },

  buildInterface: function(parentPanel) {
    var html = '';
    html += '<div id="layerTools" class="activeBackground panelFill">';
    html += '<div class="title" style="background-color: #111111; height: 18px; overflow: none; white-space: nowrap">';
    html += '  <div style="position: absolute; font-size: 10px; top: 2px; left: 6px; right: 30px; overflow: hidden; white-space: nowrap">';
    html += '  Layers';
    html += '  </div>';

    html += '    <div style="position: absolute; top: 2px; right: 2px; width: 20px">';
    html += '       <div id="layerToolsCloseButton" class="ui-button ui-panel-close-button ui-button-danger" style="padding: 1px 4px"><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
    html += '    </div>';

    html += '</div>';


    html += '<div style="margin: 6px 0px 6px 2px; overflow: none; white-space: nowrap">';
    html += '<select id="layersCompositeOperation">';
    for(var i = 0; i < this.compositeOperations.length; i++) {
      if(this.compositeOperations[i].label == '-') {
        html += '<option disabled>──────────</option>';
      } else {
        html += '<option value="' + this.compositeOperations[i].operation + '">' + this.compositeOperations[i].label + '</option>';
      }
    }
    html += '</select>';

    html += '&nbsp;';
    html += '<span style="font-size: 10px">Opacity:&nbsp;</span>';
    html += '<input class="number" type="text" min="0" max="100" size="3" id="layerOpacity"/>';
    html += '</div>';

    html += '  <div style="background-color: #111111; margin: 2px; position: absolute; top: 52px; bottom: 28px; left:0; right: 0; overflow-y: auto; overflow-x: hidden" id="layersHolder">';
    html += '  </div>';


//    html += '<div style="position: absolute; bottom: 2px; left: 2px">';
    html += '<div class="ui-button-holder" style="position: absolute; bottom: 0px; left: 0px; right: 0px; height: 24px; padding: 2px; background-color: #171717">';
    html += '<div class="ui-button" id="layersNewLayer"><i class="halflings halflings-plus"></i>&nbsp;New Layer</div>';
    html += '<div class="ui-button" id="layersDeleteLayer"><i class="halflings halflings-trash"></i>&nbsp;Delete</div>';
    html += '</div>';

    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", {"html": html})

    parentPanel.add(this.uiComponent);

    var _this = this;
    UI.on('ready', function() {
      UI.number.initControls('#layerOpacity');
      if (!Modernizr.cssscrollbar) {
        _this.scrollbar = new PerfectScrollbar('#layersHolder');
      }


      _this.initEvents();
    });

    this.uiComponent.on('resize', function() {
      _this.layersPanelResize();
    });


  },

  layersPanelResize: function() {
    if(this.scrollbar) {
      this.scrollbar.update();
    }
  },

  dragLayerHTML: function() {
    var html = '';
    html += '<div id="layerDrag" style="display: none; opacity: 0.4; position: absolute; z-index: 500; width: 184px; height: 70px; background-color: #3344ff">';
    html += '<canvas width="80" height="50" id="dragLayerCanvas" style="margin: 6px"></canvas>';
    html += '<span style="display: inline-block; width: 80px; padding: 6px" id="dragLayerLabel" class="textModeLayerLabel">Layer 1</span>';    
    html += '</div>';
    return html;    
  },

  initEvents: function() {
    var _this = this;

    $('#layersNewLayer').on('click', function() {
      _this.showNewLayerDialog();
    });

    $('#layersNewRefLayer').on('click', function() {
      _this.newRefLayer();
    });

    $('#layersDeleteLayer').on('click', function() {
      if(confirm('Are you sure you want to delete this layer?')) {
        _this.deleteLayer();
      }
    });

    $('#layersCompositeOperation').on('change', function(event) {
      var operation = $(this).val();
      _this.setSelectedLayerCompositeOperation(operation);

    });

    $('#layerOpacity').on('change', function(event) {
      var opacity = parseInt($(this).val(), 10) / 100;
      if(!isNaN(opacity)) {
        _this.setSelectedLayerOpacity(opacity);
      }
    });

    $('#layerOpacity').on('keyup', function(event) {
      var opacity = parseInt($(this).val(), 10) / 100;
      if(!isNaN(opacity)) {
        _this.setSelectedLayerOpacity(opacity);
      }
    });


    $('#layersHolder').on('contextmenu', function(event) {
      event.preventDefault();
    });

    $('#layersHolder').on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#layersHolder').on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#layerToolsCloseButton').on('click', function() {
      _this.editor.setLayersPanelVisible(false);
    });


    this.setupLayersEvents();
  },

  toggleLayerVisible: function(layerId) {

    var layerIndex = this.getLayerIndex(layerId);

    this.layers[layerIndex].visible = !this.layers[layerIndex].visible;
    var checkHTML = '';
    if(this.layers[layerIndex].visible) {
      //checkHTML = '<i class="halflings halflings-eye-open" style="cursor: pointer; color: #cccccc"></i>';
      checkHTML = '<img src="icons/svg/glyphicons-halflings-25-eye.svg" class="layerVisibleIcon"/>';


    } else {
//      checkHTML = '<i class="halflings halflings-eye-close" style="cursor: pointer; color: #999999"></i>';
      checkHTML = '<img src="icons/svg/glyphicons-halflings-26-eye-off.svg" class="layerHiddenIcon"/>';
    }

    $('#textModeLayerVisible' + this.layers[layerIndex].layerId).html(checkHTML);

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }


  },

  setVisibleLayers: function() {
    console.error('shouldnt get here??');


    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

    
  },

  isBackgroundVisible: function() {

    return this.backgroundVisible;
    /*
    if(this.layers.length > 0 && this.layers[0].type == 'background') {
      return this.layers[0].visible;
    }

    return false;
    */
  },

  setBackgroundVisible: function(visible) {
    if(!this.backgroundEnabled) {
      return;
    }
    
    this.backgroundVisible = visible;
    UI('edit-showbackground').setChecked(visible);
    this.editor.graphic.redraw({ allCells: true });

    // have to redraw everything.

    /*
    if(this.layers.length > 0 && this.layers[0].type == 'background') {
      this.layers[0].visible = visible;

      $('#textModeLayerVisible' + this.layers[0].layerId).prop('checked', visible);
    }
    */
  },

  setBackgroundEnabled: function(enabled) {
    if(enabled) {
      if(this.layers.length > 0 && this.layers[0].type == 'background') {
        $('#textModeLayer' + this.layers[0].layerId).show();
      }      

    } else {
      this.setBackgroundVisible(false);

      if(this.layers.length > 0 && this.layers[0].type == 'background') {
        $('#textModeLayer' + this.layers[0].layerId).hide();
      }      
    }
    this.backgroundEnabled = enabled;
    
  },


  toggleBackground: function() {
    if(!this.backgroundEnabled) {
      return;
    }

    this.setBackgroundVisible(!this.isBackgroundVisible());
  },


  toggleVisible: function() {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      return;
    }

    var layer = this.layers[selectedLayerIndex];
    this.toggleLayerVisible(layer.layerId);
  },

  moveLayer: function(direction) {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(this.layers[selectedLayerIndex].type == 'background') {
      // cant move background layer
      return;
    }

    if(this.getLayerCount() == 0) {
      return;
    }

    var hasBackgroundLayer = this.layers[0].type == 'background';
    selectedLayerIndex += direction;


    if( (!hasBackgroundLayer || selectedLayerIndex > 0) && selectedLayerIndex >= 0 && selectedLayerIndex < this.layers.length) {
      this.moveLayerTo(selectedLayerIndex);
    }
  },

  moveLayerTo: function(index) {
    if(this.getLayerCount() == 0) {
      return;
    }
    
    var selectedLayerIndex = this.getSelectedLayerIndex();
    var layerElement = $('#textModeLayer' + this.layers[selectedLayerIndex].layerId).detach();
//    if(index != 0) {
    if(index > selectedLayerIndex) {
      var moveBeforeId = this.layers[index].layerId;
      $(layerElement).insertBefore('#textModeLayer' + moveBeforeId);
    } else {
      var moveAfterId = this.layers[index].layerId;
      $(layerElement).insertAfter('#textModeLayer' + moveAfterId);

    }

//    }
    this.layers.splice(index, 0, this.layers.splice(selectedLayerIndex, 1)[0]);

    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }
  },


  getSelectedLayerLabel: function() {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      return false;
    }

    return this.layers[selectedLayerIndex].label;

  },

  setSelectedLayerLabel: function(label) {
    var selectedLayerId = this.getSelectedLayerId();
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      return;
    }

    this.layers[selectedLayerIndex].label = label;
    this.updateLayerLabel(selectedLayerId);

  },


  updateLayerLabel: function(layerId) {


    var layerObject = this.getLayerObject(layerId);
    if(layerObject) {
      var label = '<div class="layerLabelName">' + layerObject.getLabel() + '</div>';

      if(layerObject.getType() == 'grid') {
        var screenMode = layerObject.getScreenMode();
        switch(screenMode) {
          case TextModeEditor.Mode.TEXTMODE:
            if(this.editor.graphic.getType() == 'sprite') {
              screenMode = 'Monochrome';
            } else {
              screenMode = 'Text Mode';
            }
          break;
          case TextModeEditor.Mode.C64STANDARD:
            screenMode = 'C64 Standard Colour Mode';
            break;
          case TextModeEditor.Mode.C64ECM:
            screenMode = 'C64 Extended Colour Mode';
            break;
          case TextModeEditor.Mode.C64MULTICOLOR:
            screenMode = 'C64 Multicolour';
            break;
          case TextModeEditor.Mode.NES:
            screenMode = 'NES';
            break;
          case TextModeEditor.Mode.INDEXED:
            screenMode = 'Indexed Colour';
            break;
          case TextModeEditor.Mode.RGB:
            screenMode = 'RGB Colour';
            break;
          case TextModeEditor.Mode.VECTOR:
            screenMode = 'Vector Mode';
            break;
        }
        label += '<div class="layerLabelProperties">' + screenMode + '</div>';

        if(layerObject.getBlockModeEnabled()) {
          label += '<div class="layerLabelProperties">Block Mode</div>';
        }

        label += '<div class="layerLabelProperties">';
        label += '<span style="color: #bbbbbb">Tile Flip</span> ';
        if(layerObject.getHasTileFlip()) {
          label += 'Yes';
        } else {
          label += 'No';
        }
        label += ',';
        label += ' <span style="color: #bbbbbb">Tile Rotate</span> ';
        if(layerObject.getHasTileRotate()) {
          label += 'Yes';
        } else {
          label += 'No';
        }

        label += '</div>';
//        label += '<div class="layerLabelProperties">Tile Rotate: Yes</div>';

      }

      if(layerObject.getType() == 'image') {
        label += '<div class="layerLabelProperties">Image</div>';        
      }
      $('#' + layerId + 'label').html(label);
    }
  },

  setSelectedLayerBackgroundColor: function(backgroundColor) {
    var layer = this.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    layer.setBackgroundColor(backgroundColor);
  },

  setSelectedLayerBorderColor: function(borderColor) {
    var layer = this.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    layer.setBorderColor(borderColor);
  },

  setSelectedLayerOpacity: function(opacity) {
    var selectedLayerId = this.getSelectedLayerId();
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      return;
    }

    this.layers[selectedLayerIndex].opacity = opacity;

    $('#layerOpacity').val(opacity * 100);
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }

  },

  setSelectedLayerCompositeOperation: function(operation) {
    var selectedLayerId = this.getSelectedLayerId();
    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      return;
    }

    this.layers[selectedLayerIndex].compositeOperation = operation;    
    if(g_newSystem) {
      this.editor.gridView2d.draw();
    } else {
      this.editor.grid.update();
    }


    $('#layersCompositeOperation').val(operation);
  },

  setSelectedLayerScreenMode: function(screenMode) {

    var layer = this.getSelectedLayerObject();
    if(!layer || layer.getType() !== 'grid') {
      return;
    }

    layer.setScreenMode(screenMode);

  },

  getSelectedLayerId: function() {

    return this.selectedLayerId;
  },

  getSelectedLayerIndex: function() {
    var selectedLayerId = this.getSelectedLayerId;
    if(selectedLayerId === false) {
      return false;
    }

    return this.getLayerIndex(this.selectedLayerId);
  },

  getSelectedLayerType: function() {
    var selectedLayerIndex = this.getSelectedLayerIndex();

    if(selectedLayerIndex === false) {
      return false;
    }

    return this.layers[selectedLayerIndex].type;
  },


  getLayers: function() {
    return this.layers;
  },

  getLayerId: function(index) {
    if(index < this.layers.length) {
      return this.layers[index].layerId;
    }
    return false;
  },

  getLayerIndex: function(layerId) {
    for(var i = 0; i < this.layers.length; i++) {
      if(this.layers[i].layerId === layerId) {
        return i;
      }
    }
    return false;
  },

  getLayerZFromLabel: function(layerLabel) {
    for(var i = 0; i < this.layers.length; i++) {
      if(this.layers[i].label === layerLabel) {
        return this.layers[i].gridZ;
      }
    }

    return false;
  },

  newRefLayer: function() {
    if(this.layerPropertiesDialog == null) {
      this.layerPropertiesDialog = new LayerPropertiesDialog();      
      this.layerPropertiesDialog.init(this.editor);
    }
    this.refLayerId = false;
    this.layerPropertiesDialog.show();
  },


  showNewLayerDialog: function() {
    var label = 'Layer ' + this.getLayerCount();    

    if(this.layerPropertiesDialog == null) {
      this.layerPropertiesDialog = new LayerPropertiesDialog();      
      this.layerPropertiesDialog.init(this.editor);
    }
    this.refLayerId = false;
    this.layerPropertiesDialog.show();

  },

  setReferenceImage: function(refCanvas, params) {//originalImage, x, y, drawWidth, drawHeight) {

    if(this.refLayerId === false) {
      this.newLayer({
        type: 'image',
        image: refCanvas,
        imageData: refCanvas.toDataURL(),
        opacity: 1,
        compositeOperation: 'source-over',
        params: params
      });
    } else {
      var layerObject = this.getLayerObject(this.refLayerId);
      layerObject.setArgs({ imageData: refCanvas.toDataURL(), image: refCanvas, params: params });
      /*
      var layerIndex = this.getLayerIndex(this.refLayerId);
      this.layers[layerIndex].image = canvas;
      this.layers[layerIndex].imageData = refCanvas.toDataURL();
      this.layers[layerIndex].params = params;
      */
    }

    // now update the grid
    this.editor.graphic.redraw();

  },

  getLayerCount: function() {
    return this.layers.length;
  },


  getLayerHTML: function(layerId, label) {
    var previewWidth = 32;
    var previewHeight = 20;

    var layerHTML = '';
    layerHTML += '<div class="textModeLayer" id="textModeLayer' + layerId + '" data-layer-id="' + layerId + '">';

    layerHTML += '<div style="display: inline-block; width: 18px" >';


    layerHTML += '<span class="textModeLayerVisible" data-layer-id="' + layerId + '" id="textModeLayerVisible' + layerId + '" style="cursor: pointer; padding: 1px">';
    layerHTML += '<img src="icons/svg/glyphicons-halflings-25-eye.svg" class="layerVisibleIcon" style="width: 16px; cursor: pointer"/>'
    layerHTML += '</span>';

    layerHTML += '</div>';

    layerHTML += '<div class="textModeLayerDetails" id="textModeLayerDetails' + layerId + '"  data-layer-id="' + layerId + '">';
    layerHTML += '<canvas id="layer' + layerId + 'preview" width="' + previewWidth + '" height="' + previewHeight + '" style="background-color: #333333; margin: 6px"></canvas>';
    layerHTML += '<span style="display: inline-block; width: 200px; padding: 6px" data-layer-id="' + layerId + '" id="' + layerId + 'label" class="textModeLayerLabel" id="textModeLayerLabel' + layerId + '">' + label + '</span>';
    layerHTML += '</div>';

    layerHTML += '</div>';

    return layerHTML;
  },

  startDragLayer: function(layerId, event) {
    var index = this.getLayerIndex(layerId);
    if(this.layers[index].type == 'background') {
      return;
    }

    this.dragLayer = layerId;
    var dragCanvas = document.getElementById('dragLayerCanvas');
    if(dragCanvas) {
      var dragContext = dragCanvas.getContext('2d');
      var draggedCanvas = document.getElementById('layer' + this.dragLayer + 'preview');
      if(draggedCanvas) {
        var label = this.layers[index].label;
        $('#dragLayerLabel').html(label);
        dragContext.drawImage(draggedCanvas, 0, 0);;
      }
    }
    $('#layerDrag').show();
    UI.captureMouse(this);

  },


  mouseYToLayer: function(y) {

    // hide all red borders
    $('.textModeLayerDetails').css('border-top', '0px solid black');
    $('.textModeLayerDetails').css('border-bottom', '0px solid black');

    var lastLayerId = false;
    for(var i = 0; i < this.layers.length;  i++) {

      var layerId = this.layers[i].layerId;
      var layerDetailsElement = $('#textModeLayerDetails' + layerId);
      if(typeof layerDetailsElement != 'undefined' && layerDetailsElement) {
        var top = layerDetailsElement.position().top;
        var height = layerDetailsElement.height();

        if(y > top && y < top + height) {
          // y is within the layer

          if( (y - top) < height / 2) {
            // highlight the top border
            this.insertDragLayerAt = i + 1;

            $('#textModeLayerDetails' + layerId).css('border-top', '2px solid #ff0000');
          } else {
            if(lastLayerId !== false) {
              this.insertDragLayerAt = i;

              $('#textModeLayerDetails' + lastLayerId).css('border-top', '2px solid #ff0000');            
            } else {
              // ok, its below the first layer
              this.insertDragLayerAt = i;

              $('#textModeLayerDetails' + layerId).css('border-bottom', '2px solid #ff0000');

            }
          }

        }

        lastLayerId = layerId;
      }


    }


  },


  mouseMove: function(event) {
    var x = event.pageX - $('#layersHolder').offset().left;
    var y = event.pageY - $('#layersHolder').offset().top;

    if(this.mouseDownOnLayer !== false) {
      if(this.dragLayer === false) {
        var distance = (event.pageX - this.mouseDownX) * (event.pageX - this.mouseDownX)
                      + (event.pageY - this.mouseDownY) * (event.pageY - this.mouseDownY);
        if(distance > 3) {
          this.startDragLayer(this.mouseDownOnLayer);
        }
      }

      if(this.dragLayer !== false) {
        var layerY = y - this.mouseOffsetY;
        $('#layerDrag').css('top', layerY + 'px');
        $('#layerDrag').css('left', '18px');
        this.mouseYToLayer(y);
      }

    }
  },

  mouseUp: function(event) {
    if(this.dragLayer !== false) {

      this.selectLayer(this.dragLayer);
      var selectedLayerIndex = this.getSelectedLayerIndex();
      if(selectedLayerIndex < this.insertDragLayerAt) {
        this.insertDragLayerAt--;
      }
      if(this.insertDragLayerAt != this.getSelectedLayerIndex()) {
        this.moveLayerTo(this.insertDragLayerAt);
      }

      $('#layerDrag').hide();
      // hide all red borders
      $('.textModeLayerDetails').css('border-top', '0px solid black');
      $('.textModeLayerDetails').css('border-bottom', '0px solid black');


    }
    this.dragLayer = false;
    this.mouseDownOnLayer = false;
  },

  setupLayersEvents: function() {
    var _this = this;

    $('#layersHolder').on('mousedown', '.textModeLayerDetails', function(event) {
      var id = $(this).attr('data-layer-id');
      _this.mouseDownOnLayer = id;
      _this.mouseDownX = event.pageX;
      _this.mouseDownY = event.pageY;

      _this.mouseOffsetY = event.pageY - $(this).offset().top;
    });

    $('#layersHolder').on('click', '.textModeLayerDetails', function() {
      var id = $(this).attr('data-layer-id');
      _this.selectLayer(id);
    });

    $('#layersHolder').on('dblclick', '.textModeLayerDetails', function(event) {
      var id = $(this).attr('data-layer-id');
      _this.editLayer(id);
    });


    $('#layersHolder').on('click', '.textModeLayerVisible', function(event) {
      //_this.setVisibleLayers();
      var layerId = $(this).attr('data-layer-id');
      _this.toggleLayerVisible(layerId);
    });

  },


  refreshLayersHTML: function() {

    var holderElementId = 'layersHolder';

    if(g_app.isMobile()) {
      holderElementId = 'layersHolderMobile';
    }

    var html = this.dragLayerHTML();
    $('#' + holderElementId).html(html);

    for(var i = this.layers.length - 1; i>= 0; i--) {
      var layerId = this.layers[i].layerId;
      var label = this.layers[i].label;

      var layerHTML = this.getLayerHTML(layerId, label);
      $('#' + holderElementId).append(layerHTML);

//      this.layers[i].previewCanvas = document.getElementById('layer' + layerId + 'preview');



      if(this.layers[i].type != 'grid' && this.layers[i].type != 'image') {

        if(typeof this.layers[i].canvas == 'undefined' || this.layers[i].canvas == null ) {
          this.layers[i].canvas = document.createElement('canvas');
        }

        var layerObject = this.getLayerObject(this.layers[i].layerId);
        if(layerObject) {
          layerObject.setPreviewCanvasElementId('layer' + layerId + 'preview');
        }
      } else {

        var layerObject = this.getLayerObject(this.layers[i].layerId);
        if(layerObject) {
          layerObject.setPreviewCanvasElementId('layer' + layerId + 'preview');
        }


      }

      this.updateLayerLabel(layerId);
    }

    if(this.scrollbar) {
      this.scrollbar.update();
    }
  },

  getLayerObject: function(layerId) {
    return this.layerObjects[layerId];
  },


  getLayerObjectFromIndex: function(index) {
    if(index < 0 || index >= this.layers.length) {
      return null;
    }

    return this.getLayerObject(this.layers[index].layerId);
  },

  getLayerObjectFromRef: function(layerRef) {
    if(layerRef < this.layerRefs.length) {
      var layerId = this.layerRefs[layerRef];
      return this.getLayerObject(layerId);
    }

    return null;
  },

  getLayerObjectFromLabel: function(label) {
    for(var i = 0; i < this.layers.length; i++) {
      if(this.layers[i].label == label) {
        return this.getLayerObject(this.layers[i].layerId);
      }
    }

    return null;
  },

  getSelectedLayerObject: function() {  
    return this.layerObjects[this.selectedLayerId];
  },

  getLayerRef: function(layerId) {
    var layerRef = false;

    for(var i = 0; i < this.layerRefs.length; i++) {
      if(this.layerRefs[i] === layerId) {
        return i;
      }
    }

    if(layerRef === false) {
      // need a new layer ref
      layerRef = this.layerRefs.length;
      this.layerRefs.push(layerId);
    }

    return layerRef;
  },

  // need a way of settin
  setLayerTileSet: function(layer, tileSet, presetId, callback) {

    var _this = this;
    if(presetId === false) {
      callback();
      return;
    }

    tileSet.setToPreset(presetId, function() {
      _this.editor.tileSetManager.tileSetUpdated({ updateBlankCells: true, updateSortMethods: true });
      _this.editor.tools.drawTools.tilePalette.drawTilePalette();
      _this.editor.sideTilePalette.drawTilePalette();

      callback();
    });
  },

  setLayerColorPalette: function(layer, colorPalette, presetId, callback) {
    var _this = this;
    if(presetId === false) {
      callback();
      return;
    }

    colorPalette.setToPreset(presetId, function() {
      callback();
    });
  },

  newLayer: function(args) {

    var layerType = 'grid';
    var layerId = false;
     
    var label = 'Layer ' + this.getLayerCount();

    var layerPosition = false;

    var opacity = 1.0;
    var compositeOperation = 'source-over';
    var layerData = false;

    var backgroundColor = this.editor.colorPaletteManager.noColor;
    var borderColor = this.editor.colorPaletteManager.noColor;

    var screenMode = TextModeEditor.Mode.TEXTMODE;

    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    var tileSetId = tileSet.getId();
    var tileSetPresetId = false;

    if(typeof args.tileSet != 'undefined' && args.tileSet == 'new') {
      var tileSetName = args.tileSetName;
      var tileWidth = 8;
      var tileHeight = 8;
      if(typeof args.tileSetCreated != 'undefined' && args.tileSetCreated) {
        tileSetId = this.editor.tileSetManager.createTileSet({ name: tileSetName, width: args.newTileSet.getTileWidth(), height: args.newTileSet.getTileHeight() });
//        tileSet = args.newTileSet;
        tileSet = this.editor.tileSetManager.getTileSet(tileSetId);
        tileSet.copyTileSet(args.newTileSet);
        //tileSetId = tileSet.getId();
      } else {
        tileSetId = this.editor.tileSetManager.createTileSet({ name: tileSetName, width: tileWidth, height: tileHeight });
        tileSet = this.editor.tileSetManager.getTileSet(tileSetId);
        tileSetPresetId = args.tileSetPresetId;
      }
      
    }


    var colorPaletteId = colorPalette.getId();
    var colorPalettePresetId = false;

    if(typeof args.colorPalette != 'undefined' && args.colorPalette == 'new') {
      
      var colorPaletteName = args.colorPaletteName;
      colorPaletteId = this.editor.colorPaletteManager.createColorPalette({ name: colorPaletteName });
      colorPalette = this.editor.colorPaletteManager.getColorPalette(colorPaletteId);

      if(typeof args.colorPaletteCreated != 'undefined' && args.colorPaletteCreated) {
        colorPalette.copyPalette(args.newColorPalette);
        
      } else {
        colorPalettePresetId = args.colorPalettePresetId;
      }
    }

    var tileFlip = false;
    var tileRotate = false;

    if(typeof args !== 'undefined') {
      if(typeof args.type != 'undefined') {
        layerType = args.type;
      }

      if(typeof args.tileFlip != 'undefined') {
        tileFlip = args.tileFlip;
      }

      if(typeof args.tileRotate != 'undefined') {
        tileRotate = args.tileRotate;
      }

      
      if(typeof args.label != 'undefined') {
        label = args.label;
      }
      if(typeof args.opacity != 'undefined') {
        opacity = args.opacity;
      }

      if(typeof args.compositeOperation != 'undefined') {
        compositeOperation = args.compositeOperation;
      }

      if(typeof args.layerId != 'undefined') {
        layerId = args.layerId;
      }

      if(typeof args.layerPosition != 'undefined') {
        layerPosition = args.layerPosition;
      }

      if(typeof args.layerData != 'undefined') {
        layerData = args.layerData;
        label = layerData.label,
        layerType = layerData.type
      }

      if(typeof args.backgroundColor != 'undefined') {
        backgroundColor = args.backgroundColor;
      }

      if(typeof args.screenMode != 'undefined') {
        screenMode = args.screenMode;
      }

      if(typeof args.borderColor != 'undefined') {
        borderColor = args.borderColor;
      }

    }

    if(layerId === false) {
      // layer id not passed in
      layerId = g_app.getGuid();

    }

    var layerRef = this.getLayerRef(layerId);


    if(layerType == 'background') {
      label = 'Background';
    }


    if(layerData === false) {
      layerData = {
        visible: true,
        label: label,
        layerId: layerId,
        type: layerType,
        opacity: opacity,
        compositeOperation: compositeOperation
      };
    }


    var layerHTML = this.getLayerHTML(layerId, label);

    if(this.selectedLayerId === false) {
      if(g_app.isMobile()) {
        $('#layersHolderMobile').append(layerHTML);
      } else {
        $('#layersHolder').append(layerHTML);
      }
    } else {
      $(layerHTML).insertBefore('#textModeLayer' + this.selectedLayerId);
    }

    var selectedLayerIndex = this.getSelectedLayerIndex();
    if(selectedLayerIndex === false) {
      selectedLayerIndex = -1;      
    }

  
  /*  
    if(layerType != 'grid' && layerType != 'image') {
      layer.canvas = document.createElement('canvas');
    } 

*/
    // insert just after selected layer
    this.layers.splice(selectedLayerIndex + 1, 0, layerData);

    if(layerType == 'grid') {
      var width = this.editor.graphic.getGridWidth();
      var height = this.editor.graphic.getGridHeight();
      var frameCount = this.editor.graphic.getFrameCount();

      var layerGrid = new LayerGrid();
      layerGrid.init(this.editor, layerId, layerRef);//, screenMode);
      
      layerGrid.setGridDimensions({ width: width, height: height});
      layerGrid.setColorPalette(colorPaletteId);
      layerGrid.setTileSet(tileSetId);

      layerGrid.setBackgroundColor(backgroundColor);

      layerGrid.setBorderColor(borderColor);
      layerGrid.setFrameCount(frameCount);   
      layerGrid.setPreviewCanvasElementId('layer' + layerId + 'preview');      
      layerGrid.setCurrentFrame(this.editor.graphic.getCurrentFrame());

      layerGrid.setHasTileFlip(tileFlip);
      layerGrid.setHasTileRotate(tileRotate);
      this.layerObjects[layerId] = layerGrid;

      var _this = this;


      // tilesetPresetId is false if preset not chosen
      this.setLayerTileSet(layerGrid, tileSet, tileSetPresetId, function() {
        if(screenMode == 'vector' && tileSetPresetId && typeof tileSetPresetId.indexOf != 'undefined' &&  tileSetPresetId.indexOf('vector:') === 0) {
          // bit of hack, so setscreenmode doesn't try to reset to default vector font when vector.
          layerGrid._setMode('vector');
        }
        _this.setLayerColorPalette(layerGrid, colorPalette, colorPalettePresetId, function() {

          
          layerGrid.setScreenMode(screenMode, function() {
            //layerGrid.clear();
            //console.log('clear layer!');
            
            layerGrid.setBlankTileId(tileSet.getBlankTile());
            layerGrid.setToBlank();
            _this.updateLayerInterface(layerId);
          });
        });
      });


    }


    if(layerType == 'image') {
      var width = this.editor.graphic.getGraphicWidth();
      var height = this.editor.graphic.getGraphicHeight();

      var layerRefImage = new LayerRefImage();
      layerRefImage.init(this.editor, layerId, layerRef);

      layerRefImage.setDimensions(width, height);
      layerRefImage.setArgs(args);
      layerRefImage.setPreviewCanvasElementId('layer' + layerId + 'preview');      
      
      this.layerObjects[layerId] = layerRefImage;
      this.updateLayerInterface(layerId);
    }

    if(layerType == 'background') {
      var width = this.editor.graphic.getGraphicWidth();
      var height = this.editor.graphic.getGraphicHeight();
      var frameCount = this.editor.graphic.getFrameCount();

      var layerBackground = new LayerBackground();
      layerBackground.init(this.editor, layerId, layerRef);
      layerBackground.setDimensions(width, height);
      layerBackground.setPreviewCanvasElementId('layer' + layerId + 'preview');      
      
      this.layerObjects[layerId] = layerBackground;
      this.updateLayerInterface(layerId);

    }


    this.editor.history.startEntry('createlayer');
    this.editor.history.addAction('createlayer', { layerId: layerId, args: args } );
    this.editor.history.endEntry();

    return layerId;
  },

  updateLayerInterface: function(layerId) {


    this.updateLayerPreview(layerId);
    this.selectLayer(layerId);
    this.updateLayerLabel(layerId);

  },

  deleteLayer: function(args) {
    if(this.layers.length == 1) {
      alert("Cannot delete last layer");
      return;
    }

    var layerId = false;
    var layerIndex = false;

    if(typeof args !== 'undefined') {
      if(typeof args.layerId !== 'undefined') {
        layerId = args.layerId;
      }
    }
    if(layerId === false) {
      layerIndex = this.getSelectedLayerIndex();
      if(layerIndex == -1) {
        return;
      }

      layerId = this.layers[layerIndex].layerId;
    }


    if(layerIndex === false) {
      for(var i = 0; i < this.layers.length; i++) {
        if(this.layers[i].layerId == layerId) {
          layerIndex = i;
          break;
        }
      }
    }



    if(this.layers[layerIndex].type == 'background') {
      alert("Cannot delete background layer");
      return;
    }

    if(this.layers[layerIndex].type == 'grid') {

      /*
      // need to clear the grid
      this.editor.history.setEnabled(false);

      var args = {};
      args.t = this.editor.tileSetManager.blankCharacter;
      args.fc = 0;
      args.bc = this.editor.colorPaletteManager.noColor;
      args.z = this.layers[selectedLayerIndex].gridZ;
      args.rx = 0;
      args.ry = 0;
      args.rz = 0;
      args.fh = 0;
      args.fv = 0;
      args.update = false;

      for(args.x = 0; args.x < this.editor.grid.width; args.x++) {
        for(args.y = 0; args.y < this.editor.grid.height; args.y++) {
          this.editor.grid.setCell(args);
        }
      }

      this.editor.history.setEnabled(true);
      */
    } else if(this.layers[layerIndex].type == 'image') {
      // TODO: check memory
    }




    this.editor.history.startEntry('deletelayer');
    this.editor.history.addAction('deletelayer', { layerId: layerId, layerData: this.layers[layerIndex], layerPosition: layerIndex });
    this.editor.history.endEntry();


    this.layerObjects[layerId] = null;

    $('#textModeLayer' + layerId).remove();
    this.layers.splice(layerIndex, 1);

    if(layerIndex < this.layers.length) {
      this.selectLayer(this.layers[layerIndex].layerId);
    } else {
      this.selectLayer(this.layers[layerIndex - 1].layerId);

    }

    this.editor.graphic.redraw({ allCells: true });

  },

  editLayer: function(id) {
    var layerId = false

    if(typeof id == 'undefined') {
      layerId = this.getSelectedLayerId();

    } else {
      layerId = id;
    }
    var layerIndex = this.getLayerIndex(layerId);
    if(layerIndex === false) {
      return;
    }

    if(this.layerPropertiesDialog == null) {
      this.layerPropertiesDialog = new LayerPropertiesDialog();      
      this.layerPropertiesDialog.init(this.editor);
    }
    this.refLayerId = layerId;
    this.layerPropertiesDialog.show(this.layers[layerIndex]);
  },

  moveSelect: function(direction) {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    selectedLayerIndex += direction;
    if(selectedLayerIndex < 0 || selectedLayerIndex >= this.layers.length) {
      return;
    }

    this.selectLayer(this.layers[selectedLayerIndex].layerId);

  },

  getSelectedLayer: function() {
    var selectedLayerIndex = this.getSelectedLayerIndex();
    var selectedLayer = this.layers[selectedLayerIndex];
    return selectedLayer;
  },


  selectLayer: function(layerId) {
    // disable draw so its not repeatedly called
    var tilePalette = this.editor.tools.drawTools.tilePalette;
    var graphic = this.editor.graphic;
    var colorPaletteDisplay = this.editor.colorPalettePanel.colorPaletteDisplay;

    var tilePaletteDisplay = this.editor.tools.drawTools.tilePalette.tilePaletteDisplay;
    var drawTilePaletteEnabledSave = false;

    if(tilePaletteDisplay) {
      drawTilePaletteEnabledSave = tilePaletteDisplay.getDrawEnabled();
      tilePaletteDisplay.setDrawEnabled(false);
    }


    var sideTilePalette = this.editor.sideTilePalette;
    var sideTilePaletteDisplay = this.editor.sideTilePalette.tilePaletteDisplay;
    var drawSideTilePaletteEnabledSave = false;

    if(sideTilePaletteDisplay) {
      drawSideTilePaletteEnabledSave = sideTilePaletteDisplay.getDrawEnabled();
      sideTilePaletteDisplay.setDrawEnabled(false);
    }


    var drawColorPaletteEnabledSave = false;
    if(colorPaletteDisplay) {
      drawColorPaletteEnabledSave = colorPaletteDisplay.getDrawEnabled();
      colorPaletteDisplay.setDrawEnabled(false);
    }

    var drawEnabledSave = graphic.getDrawEnabled();
    graphic.setDrawEnabled(false);


    if(typeof layerId == 'undefined') {
      var gridZ = this.editor.grid.getXYGridPosition();
      for(var i = 0; i < this.layers.length; i++) {
        if(this.layers[i].type == 'grid' && this.layers[i].gridZ == gridZ) {
          this.selectedLayerId = this.layers[i].layerId;
          break;
        }
      }
    } else {
      this.selectedLayerId = layerId;
    }

    var settings = g_app.doc.getDocRecord('/settings');
    settings.data.selectedLayerId = this.selectedLayerId;

    $('.textModeLayerDetails').removeClass('selectedTextModeLayer');
    var currentID = 'textModeLayerDetails' + this.selectedLayerId;
    $('#' + currentID).addClass('selectedTextModeLayer');


    for(var i = 0; i < this.layers.length; i++) {
      if(this.layers[i].layerId == this.selectedLayerId) {
        var compositeOperation = this.layers[i].compositeOperation;
        if(typeof compositeOperation == 'undefined') {
          compositeOperation = 'source-over';
        }

        $('#layersCompositeOperation').val( compositeOperation );

        $('#layerOpacity').val( Math.floor(this.layers[i].opacity * 100));

        if(this.layers[i].type == 'background') {
          $("#layersCompositeOperation").prop('disabled', true);
          $("#layerOpacity").prop('disabled', true);
        } else {
          $("#layersCompositeOperation").prop('disabled', false);
          $("#layerOpacity").prop('disabled', false);          
        }
        break;
      }
    }

//    var screenMode = 'monochrome';

    var layer = this.getSelectedLayerObject();
    if(layer) {
      

      if(typeof layer.getTileSet != 'undefined') {
        var tileSet = layer.getTileSet();

        if(tileSet) {
          this.editor.tileSetManager.setCurrentTileSetFromId(tileSet.getId());
        }
        
      }

      if(typeof layer.getColorPalette != 'undefined') {
        var colorPalette = layer.getColorPalette();
        if(colorPalette) {
          this.editor.colorPaletteManager.setCurrentColorPaletteFromId(colorPalette.getId());
        }
      }

      if(this.editor.graphic.getType() == 'sprite') {
        this.editor.updateCurrentColorToSpriteColor();
        if(g_app.isMobile()) {
          this.editor.spriteFramesMobile.highlightCurrentSprite();
        } else {
          this.editor.spriteFrames.highlightCurrentSprite();
        }
        
      }

      // update tile menu
      this.editor.tileSetManager.updateTileSetMenu();
      this.editor.colorPaletteManager.updateColorPaletteMenu();

      // in sprite mode, set interface screen mode will set the current colour..
      if(typeof layer.getScreenMode != 'undefined') {
        this.editor.setInterfaceScreenMode(layer.getScreenMode());
      }

      if(typeof layer.getBlockModeEnabled != 'undefined' && layer.getBlockModeEnabled()) {
        $('#infoTableBlock').show();
      } else {
        $('#infoTableBlock').hide();
      }

      if(typeof layer.getColorPerMode != 'undefined') {
        this.editor.setInterfaceColorPerMode(layer.getColorPerMode());
      }

      this.editor.updateBlockModeInterface();
      this.editor.updateInterfaceTileOrientation();
    }


    graphic.setDrawEnabled(drawEnabledSave);

//    graphic.invalidateAllCells();
    this.editor.gridView2d.findViewBounds();
    graphic.redraw({ allCells: true });


    // reenable draw tile palette and draw all the tiles
    if(tilePaletteDisplay) {
      tilePaletteDisplay.setDrawEnabled(drawTilePaletteEnabledSave);
      tilePalette.drawTilePalette({ redrawTiles: true });
    }

    if(sideTilePaletteDisplay) {
      sideTilePaletteDisplay.setDrawEnabled(drawSideTilePaletteEnabledSave);
      sideTilePalette.drawTilePalette({ redrawTiles: true });
    }


    if(colorPaletteDisplay) {
      colorPaletteDisplay.setDrawEnabled(drawColorPaletteEnabledSave);    
      colorPaletteDisplay.draw();
    }

  },

  updateAllLayerPreviews: function() {
    if(this.editor.grid.getUpdateEnabled()) {
      for(var i = 0; i < this.layers.length; i++) {
        this.updateLayerPreview(this.layers[i].layerId);
      }
    }
  },

  updateLayerPreview: function(layerId) {

    if(typeof layerId == 'undefined') {
      if(this.selectedLayerId === false) {
        this.selectLayer();
      }
      layerId = this.selectedLayerId;//this.editor.grid.getXYGridPosition();
    }

    var layerObject = this.getLayerObject(layerId);
    if(!layerObject) {
      return;
    }

    layerObject.updatePreview();
  },



}
