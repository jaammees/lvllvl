var ReplaceColorDialog = function() {
  this.uiComponent = null;

  this.replaceColor = false;
  this.replaceWithColor = false;

  this.replaceFG = true;
  this.replaceBG = false;


  this.frames = 'current';
}

ReplaceColorDialog.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  show: function() {
    if(this.uiComponent == null) {

      var _this = this;
      this.uiComponent = UI.create("UI.Dialog", { "id": "replaceColorDialog", "title": "Replace Color", "width": 300, "height": 240 });

      this.uiComponent.on('close', function() {
        _this.editor.colorPaletteManager.closeColorPicker();
      });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/replaceColor.html', function() {        
        _this.initContent();
        _this.initEvents();
      });


      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.doReplaceColor();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    }

    UI.showDialog("replaceColorDialog");


  },

  setReplaceColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.replaceColor = color;

    $('#replaceColor').css('background-color', '#' + colorPalette.getHexString(color));
  },

  setReplaceWithColor: function(color) {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    this.replaceWithColor = color;

    $('#replaceWithColor').css('background-color', '#' + colorPalette.getHexString(color));

  },

  initContent: function() {
    var currentColor = this.editor.currentTile.getColor();
    this.setReplaceColor(currentColor);
    this.setReplaceWithColor(currentColor);

  },


  initEvents: function() {
    var _this = this;

    $('#replaceColor').on('click', function(event) {

      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setReplaceColor(color);
      }
      var x = event.pageX;
      var y = event.pageY;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });


    $('#replaceWithColor').on('click', function(event) {
      
      var args = {};
      args.colorPickedCallback = function(color) {
        _this.setReplaceWithColor(color);
      }

      args.hasNone = true;

      var x = event.pageX;
      var y = event.pageY;
      _this.editor.colorPaletteManager.showColorPicker(x, y, args);

    });

  },

  readSettings: function() {
    this.replaceFG = $('#replaceColorFG').is(':checked');
    this.replaceBG = $('#replaceColorBG').is(':checked');
    this.frames = $('input[name=replaceColorFrame]:checked').val();
  },

  doReplaceColor: function() {
    this.readSettings();

    var layer = this.editor.layers.getSelectedLayerObject();
    if(!layer || layer.getType() != 'grid') {
      return false;
    }

    var fromX = 0;
    var toX = layer.getGridWidth();
    var fromY = 0;
    var toY = layer.getGridHeight();

    var fromFrame = 0;
    var toFrame = this.editor.graphic.getFrameCount();

    console.log('frames = ' + this.frames);

    if(this.frames == 'current') {
      fromFrame = this.editor.graphic.getCurrentFrame();
      toFrame = this.editor.graphic.getCurrentFrame() + 1;
    }

    var args = {};
    this.editor.history.startEntry('Replace Colour');


    for(var frameIndex = fromFrame; frameIndex < toFrame; frameIndex++) {

      for(var y = fromY; y < toY; y++) {
        for(var x = fromX; x < toX; x++) {


          var cellData = layer.getCell({ x: x, y: y, frame: frameIndex });
          if(   (this.replaceFG && cellData.fc == this.replaceColor &&  this.replaceWithColor !== false) 
              || (this.replaceBG && cellData.bc == this.replaceColor) ) {

            var args = {};
            args.x = x;
            args.y = y;
            args.frame = frameIndex;

            
            for(var key in cellData) {
              if(cellData.hasOwnProperty(key)) {
                args[key] = cellData[key];
              }
            }

            if(this.replaceFG && cellData.fc == this.replaceColor &&  this.replaceWithColor !== false) {
              args.fc = this.replaceWithColor;
            }

            if(this.replaceBG && cellData.bc == this.replaceColor) {
              args.bc = this.replaceWithColor;
            }

            layer.setCell(args);
          }
  
        }
      }


    }

    this.editor.history.endEntry();
    this.editor.graphic.invalidateAllCells();
    this.editor.graphic.redraw();
    

//    this.editor.frames.setCurrentFrame(currentFrame);

  }

}
