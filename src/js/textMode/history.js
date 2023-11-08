var History = function() {
  this.editor = null;

  this.history = [];
  this.historyLength = 0;
  this.historyPosition = 0;
  this.changes = [];
  this.entryName = '';

  this.enabled = true;
  this.newEntryEnabled = true;
}

History.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  setEnabled: function(enabled) {
    this.enabled = enabled;
  },

  getEnabled: function(enabled) {
    return this.enabled;
  },

  setNewEntryEnabled: function(enabled) {
    this.newEntryEnabled = enabled;
  },

  undo: function() {
    // dont record history actions while undoing
    this.setEnabled(false);


    var updateWholeGrid = false;

    if(this.historyPosition > 0) {
      this.historyPosition--;
      if(this.historyPosition < this.historyLength) {
        var changes = this.history[this.historyPosition];

        var tileSet = this.editor.tileSetManager.getCurrentTileSet();
        var changedCharacters = [];

        var gridCellsChanged = false;

        var args = {};

        for(var i = changes.actions.length - 1; i >= 0; i--) {

          var actionName = changes.actions[i].name;
          var params = changes.actions[i].params;


          if(actionName == 'setCell' || actionName == 'setCell3d') {
            gridCellsChanged = true;


            if(this.editor.graphic.getCurrentFrame() != params.frame) {
              this.editor.frames.gotoFrame(params.frame);
            }

            var layerRef = params.layerRef;            
            args.t = params.oldCharacter;
            args.x = params.x;
            args.y = params.y;
            args.z = params.z;
            args.fc = params.oldColor;
            args.bc = params.oldBgColor;

            if(actionName == 'setCell3d') {
              args.rx = params.oldRx;
              args.ry = params.oldRy;
            }
            args.rz = params.oldRz;
            args.fh = params.oldFh;
            args.fv = params.oldFv;

            if(typeof params.oldB !== false) {
              args.b = params.oldB;
            } else {
              args.b = 0;
            }
            args.update = false;

            if(actionName == 'setCell') {
              var layer = this.editor.layers.getLayerObjectFromRef(layerRef);
              if(layer) {
                layer.setCell(args);
              }
            } else if(actionName == 'setCell3d') {
              this.editor.grid3d.setCell(args);
            }
          }

          if(actionName == 'setBlockCell') {
            updateWholeGrid = true;
            var blockSet = this.editor.blockSetManager.getCurrentBlockSet();

            blockSet.setCharacterInBlock(params.b, params.x, params.y, params.oldCharacter);
          }

          if(actionName == 'cursorLocation') {
            this.editor.gridView2d.setLastCursorLocation(params);
          }

          if(actionName == 'cursorPixelLocation') {
            this.editor.tools.drawTools.pixelDraw.setLastCursorPixelLocation(params);
          }

          if(actionName == 'setSelection') {
            this.editor.tools.drawTools.select.setSelection({ from: params.lastFrom, to: params.lastTo, enabled: params.lastEnabled});
            this.editor.graphic.redraw({ allCells: true }); 
          }

          if(actionName == 'pixelSetSelection') {
            this.editor.tools.drawTools.pixelSelect.setSelection({ from: params.lastFrom, to: params.lastTo, enabled: params.lastEnabled});
          }

          if(actionName == 'setCharPixel') {
            tileSet.setPixel(params.c, params.x, params.y, params.oldValue, false);

            var found = false;
            for(var j = 0; j < changedCharacters.length; j++) {
              if(params.c == changedCharacters[j]) {
                found = true;
                break;
              }
            }
            if(!found) {
              changedCharacters.push(params.c);
            }
          }
          if(actionName == 'setBackgroundColor') {
            this.editor.tools.currentBackgroundColor = params.oldColor;
            this.editor.setBackgroundColor(params.oldColor);
          }

          if(actionName == 'setBorderColor') {
            this.editor.tools.currentBorderColor = params.oldColor;
            this.editor.grid.setBorderColor(params.oldColor);
          }

          if(actionName == 'insertframe') {
            this.editor.frames.deleteFrame(params.position + 1);
          }

          if(actionName == 'deleteframe') {
            this.editor.frames.insertFrame(params.position - 1, false, params.frameData, params.layerFrameData);
          }

          if(actionName == 'deletelayer') {
            this.editor.layers.newLayer({
              layerId: params.layerId,
              layerPosition: params.layerPosition,
              layerData: params.layerData,
            });

            this.editor.graphic.redraw({ allCells: true });
          }

          if(actionName == 'createlayer') {
            this.editor.layers.deleteLayer({ layerId: params.layerId });
          }


        }

        if(updateWholeGrid) { 

          if(g_newSystem) {
            this.editor.graphic.invalidateAllCells();
            this.editor.gridView2d.draw();
          } else {
            this.editor.grid.update({ allCells: true });
          }
      
        } else if(gridCellsChanged) {

          if(g_newSystem) {
            this.editor.gridView2d.draw();
          } else {
            this.editor.grid.update();
          }
                
          this.editor.layers.updateAllLayerPreviews();
        }

        if(changedCharacters.length > 0) {
          for(var i = 0; i < changedCharacters.length; i++) {
            tileSet.updateCharacter(changedCharacters[i]);
          }
          this.editor.tileSetManager.tileSetUpdated();

          this.editor.graphic.invalidateAllCells();
//          this.editor.grid.update({ allCells: true });
          if(g_newSystem) {
            this.editor.gridView2d.draw();
          } else {
            this.editor.grid.update({ allCells: true });
          }


        }
      }
    }



    this.setEnabled(true);
  },

  redo: function() {
    //console.log('redo');
    // dont record history actions while redoing
    this.setEnabled(false);

    if(this.historyPosition < this.historyLength ) {
      var changes = this.history[this.historyPosition];

      var tileSet = this.editor.tileSetManager.getCurrentTileSet();
      var changedCharacters = [];
      var gridCellsChanged = false;


      var args = {};
      for(var i = 0; i < changes.actions.length; i++) {

        var actionName = changes.actions[i].name;
        var params = changes.actions[i].params;
        if(actionName == 'setCell' || actionName == 'setCell3d') {

          gridCellsChanged = true;
          if(this.editor.graphic.getCurrentFrame() != params.frame) {
            this.editor.frames.gotoFrame(params.frame);
          }

          var layerRef = params.layerRef;
          args.t = params.newCharacter;
          args.x = params.x;
          args.y = params.y;
          args.z = params.z;
          args.fc = params.newColor;
          args.bc = params.newBgColor;
          args.rx = params.newRx;
          args.ry = params.newRy;
          args.rz = params.newRz;
          args.fh = params.newFh;
          args.fv = params.newFv;

          if(typeof params.newB !== false) {
            args.b = params.newB;
          } else {
            args.b = 0;
          }

          args.update = false;

          if(actionName == 'setCell') {
            var layer = this.editor.layers.getLayerObjectFromRef(layerRef);
            if(layer) {
              layer.setCell(args);
            }
          } else if(actionName == 'setCell3d') {
            this.editor.grid3d.setCell(args);
          }
        }

        if(actionName == 'setBlockCell') {
          gridCellsChanged = true;
          var blockSet = this.editor.blockSetManager.getCurrentBlockSet();

          blockSet.setCharacterInBlock(params.b, params.x, params.y, params.newCharacter);
        }

        if(actionName == 'setCharPixel') {
            tileSet.setPixel(params.c, params.x, params.y, params.newValue, false);

            var found = false;
            for(var j = 0; j < changedCharacters.length; j++) {
              if(params.c == changedCharacters[j]) {
                found = true;
                break;
              }
            }
            if(!found) {
              changedCharacters.push(params.c);
            }

        }
        if(actionName == 'setBackgroundColor') {
          this.editor.tools.currentBackgroundColor = params.newColor;
          this.editor.setBackgroundColor(params.newColor);
        }

        if(actionName == 'setBorderColor') {
          this.editor.tools.currentBorderColor = params.newColor;
          this.editor.grid.setBorderColor(params.newColor);
        }



        if(actionName == 'setSelection') {
          this.editor.tools.drawTools.select.setSelection({ from: params.from, to: params.to, enabled: params.enabled});
          this.editor.graphic.redraw({ allCells: true }); 
        }

        if(actionName == 'pixelSetSelection') {
          this.editor.tools.drawTools.pixelSelect.setSelection({ from: params.from, to: params.to, enabled: params.enabled});
        }

        if(actionName == 'insertframe') {

          this.editor.frames.insertFrame(params.position);
        }

        if(actionName == 'deleteframe') {
          this.editor.frames.deleteFrame(params.position);
        }


        if(actionName == 'deletelayer') {

          this.editor.layers.deleteLayer({ layerId: params.layerId });
/*
          this.editor.layers.newLayer({
            layerId: params.layerId,
            layerPosition: params.layerPosition,
            layerData: params.layerData,
          });

            this.editor.graphic.redraw({ allCells: true });
*/

        }

        if(actionName == 'createlayer') {
//          this.editor.layers.deleteLayer({ layerId: params.layerId });
          this.editor.layers.newLayer({
            layerId: params.layerId
          });
        }


/*
        if(changes[i].action == 'createframe') {
          this.createFrame(40, 25, true);
        this.displayFrames();

        }

        if(changes[i].action == 'gotoframe') {
          this.gotoFrame(changes[i].newframe, true);              
        }
*/

      }

      if(gridCellsChanged) {

        if(actionName == 'setCharPixel') {
          this.editor.graphic.invalidateAllCells();
        }

        //this.editor.grid.update();
        if(g_newSystem) {
          this.editor.gridView2d.draw();
        } else {
          this.editor.grid.update({ allCells: true });
        }

        
        this.editor.layers.updateAllLayerPreviews();

      }

      if(changedCharacters.length > 0) {
        for(var i = 0; i < changedCharacters.length; i++) {
          tileSet.updateCharacter(changedCharacters[i]);
        }
        this.editor.tileSetManager.tileSetUpdated();

        this.editor.graphic.invalidateAllCells();

        if(g_newSystem) {
          this.editor.gridView2d.draw();
        } else {
          this.editor.grid.update({ allCells: true });
        }

//        this.editor.grid.update({ allCells: true });
        
      }


      this.historyPosition++;
    }


    this.setEnabled(true);
  },

  startEntry: function(name) {
    if(!this.enabled) {
      return;
    }

    if(!this.newEntryEnabled) {
      return;
    }
    // end the last entry in case wasn't ended properly
    this.endEntry();

    this.changes = [];
    this.entryName = name;
  },

  addAction: function(actionName, params) {
    if(!this.enabled) {
      return;
    }


    if(actionName == 'setCell' || actionName == 'setCell3d') {
      for(var i = this.changes.length - 1; i >= 0; i--) {
        // if cell has been set before, remove this entry
        // this is so one history entry doesn't set same cell twice??
        if(this.changes[i].name == actionName && 
          this.changes[i].params.x == params.x && 
          this.changes[i].params.y == params.y && 
          this.changes[i].params.z == params.z && 
          this.changes[i].params.frame == params.frame) {

          params.layerRef = this.changes[i].params.layerRef;
          params.oldCharacter = this.changes[i].params.oldCharacter;
          params.oldColor = this.changes[i].params.oldColor;
          params.oldBgColor = this.changes[i].params.oldBgColor;
          params.oldRotX = this.changes[i].params.oldRotX;
          params.oldRotY = this.changes[i].params.oldRotY;
          params.oldRotZ = this.changes[i].params.oldRotZ;
          this.changes.splice(i, 1);
        }
      }
    }
    this.changes.push({ "name": actionName, "params": params });
//    console.log(this.changes.length);
  },



  endEntry: function() {
    if(!this.enabled) {
      return;
    }

    if(!this.newEntryEnabled) {
      return;
    }

    if(this.changes.length > 0) {
      this.history[this.historyPosition] = {"name": this.entryName, "actions": this.changes };
      this.historyPosition++;
      this.historyLength = this.historyPosition;
    }
   // console.log(this.history);
    this.changes = [];
  }
}