var GridDimensionsDialog = function() {
  this.editor = null;

  this.canvas = null;

  this.currentWidth = 0;
  this.currentHeight = 0;

  this.dimensionsDialog = null;

  this.draggingScreen = false;

  this.bigger = true;
}


GridDimensionsDialog.prototype = {
  init: function(editor) {
    this.editor = editor;

  },


  initEvents: function() {
    var _this = this;

    if(this.canvas == null) {
      this.canvas = document.getElementById('settingsDimensionsOffsetCanvas');      
    }

    $('.dimensionsNumber').on('change', function(e) {
      _this.updateDimensions();
    });
    $('.dimensionsNumber').on('keyup', function(e) {
      _this.updateDimensions();
    });

    this.canvas.addEventListener('mousedown', function(event) {
      _this.mouseDown(event);
    }, false);

    this.canvas.addEventListener('mousemove', function(event) {
      _this.mouseMove(event);
    }, false);

    this.canvas.addEventListener('mouseup', function(event) {
      _this.mouseUp(event);
    }, false);


    this.canvas.addEventListener("touchstart", function(event){
      _this.touchStart(event);

    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      _this.touchMove(event);
      return false;
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);



  },


  showDimensions: function() {
    var _this = this;


    if(this.dimensionsDialog == null) {
      var width = 330;
      var height = 465;

      if(UI.isMobile.any()) {
        width = 280;
        height = 550;
      }

      this.dimensionsDialog = UI.create("UI.Dialog", { "id": "dimensionsDialog", "title": "Dimensions", "width": width, "height": height });

      this.dimensionsHTML = UI.create("UI.HTMLPanel");
      this.dimensionsDialog.add(this.dimensionsHTML);
      this.dimensionsHTML.load('html/textMode/dimensionsDialog.html', function() {
        _this.initEvents();
        _this.initContent();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.dimensionsDialog.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        var args = {};

        
        var graphic = _this.editor.graphic;

        // have to set tile dimensions first
        if(graphic.getType() == 'sprite') {      
      
          var layer = _this.editor.layers.getSelectedLayerObject();
          if(layer && layer.getType() == 'grid') {
            var tileSet = layer.getTileSet();
            var currentTileWidth = tileSet.getTileWidth();
            var currentTileHeight = tileSet.getTileHeight();

            args = {};
            args.width = parseInt($('#settingsDimensionsTileWidth').val(), 10);
            args.height = parseInt($('#settingsDimensionsTileHeight').val(), 10);
            args.offsetX = 0;
            args.offsetY = 0;

            if(args.tileWidth != currentTileWidth || args.tileHeight != currentTileHeight) {
              tileSet.setTileDimensions(args);

              // need to resize the layers..
            }
          }
        }

        args = {};
        args.width = parseInt($('#settingsDimensionsWidth').val(), 10);
        args.height = parseInt($('#settingsDimensionsHeight').val(), 10);
        var depth = $('#settingsDimensionsDepth').val();

        args.offsetX = parseInt($('#settingsDimensionsOffsetX').val(), 10);
        args.offsetY = parseInt($('#settingsDimensionsOffsetY').val(), 10);


        _this.editor.graphic.setGridDimensions(args);//width, height, offsetX, offsetY);



        
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.dimensionsDialog.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent();
    }

    UI.showDialog("dimensionsDialog");


  },



  initContent: function() {

    var graphic = this.editor.graphic;


    if(graphic.getType() == 'sprite') {
      $('#settingsDimensionsTile').show();
    } else {
      $('#settingsDimensionsTile').hide();
    }

    this.currentWidth = graphic.getGridWidth();
    this.currentHeight = graphic.getGridHeight();

    var tileWidth = 8;
    var tileHeight = 8;
    var layer = this.editor.layers.getSelectedLayerObject();
    if(layer && layer.getType() == 'grid') {
      var tileSet = layer.getTileSet();
      tileWidth = tileSet.getTileWidth();
      tileHeight = tileSet.getTileHeight();
    }


    $('#settingsDimensionsTileWidth').val(tileWidth);
    $('#settingsDimensionsTileHeight').val(tileHeight);

    $('#settingsDimensionsWidth').val(this.currentWidth);
    $('#settingsDimensionsHeight').val(this.currentHeight);
    $('#settingsDimensionsOffsetX').val(0);
    $('#settingsDimensionsOffsetY').val(0);

    this.updateDimensions();
//    $('#settingsDimensionsDepth').val(depth);
  },

  updateDimensions: function() {

    this.context = this.canvas.getContext('2d');

    this.width = parseInt($('#settingsDimensionsWidth').val(), 10);
    this.height = parseInt($('#settingsDimensionsHeight').val(), 10);

    this.offsetX = parseInt($('#settingsDimensionsOffsetX').val(), 10);
    this.offsetY = parseInt($('#settingsDimensionsOffsetY').val(), 10);

    this.bigger = true;

    if(this.currentHeight > this.height) {
      this.bigger = false;
    }

    if(this.currentWidth > this.width) {
      this.bigger = false;
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scale = this.canvas.width / this.width;


    if(this.canvas.height / this.height < this.scale) {
      this.scale = this.canvas.height / this.height;
    }


    // is the screen going smaller?
    if(this.canvas.height / this.currentHeight < this.scale) {
      this.bigger = false;
      this.scale = this.canvas.height / this.currentHeight;
    }

    if(this.canvas.width / this.currentWidth < this.scale) {
      this.bigger = false;
      this.scale = this.canvas.width / this.currentWidth;
    }

    var newScreenX = 0;
    var newScreenY = 0;

    // draw the new screen
    this.context.fillStyle = '#333333';
    this.context.fillRect(newScreenX, newScreenY, this.width * this.scale, this.height * this.scale);


    // draw the current screen
    this.currentScreenX = this.offsetX * this.scale;
    this.currentScreenY = this.offsetY * this.scale;
    this.currentScreenWidth = this.currentWidth * this.scale;
    this.currentScreenHeight = this.currentHeight * this.scale;
    this.context.fillStyle = '#999999';
    this.context.fillRect(this.currentScreenX, this.currentScreenY, this.currentScreenWidth, this.currentScreenHeight);

    if(!this.bigger) {
      this.context.strokeStyle = '#333333';

      this.context.beginPath();
      this.context.lineWidth = 2;
      this.context.rect(newScreenX, newScreenY, this.width * this.scale, this.height * this.scale);
      this.context.stroke();

    }

  },

  toolStart: function(x, y, event) {
    this.mouseDownX = x;//event.pageX;
    this.mouseDownY = y;//event.pageY;

    this.mouseDownOffsetX = this.offsetX;
    this.mouseDownOffsetY = this.offsetY;

    if(x > this.currentScreenX && x < this.currentScreenX + this.currentScreenWidth) {
      if(y > this.currentScreenY && y < this.currentScreenY + this.currentScreenHeight) {
        console.log('mouse down on current screen');
        this.draggingScreen = true;
      }
    }

  },

  toolMove: function(x, y, event) {
    var mouseX = x;// event.pageX;
    var mouseY = y;//event.pageY;

    if(this.draggingScreen) {
      console.log('drag screen' + this.scale);
      var newOffsetX = Math.round(this.mouseDownOffsetX + (mouseX - this.mouseDownX) / this.scale);
      $('#settingsDimensionsOffsetX').val(newOffsetX);
      var newOffsetY = Math.round(this.mouseDownOffsetY + (mouseY - this.mouseDownY) / this.scale);
      $('#settingsDimensionsOffsetY').val(newOffsetY);
      this.updateDimensions();
    }

  },

  toolEnd: function(event) {
    this.draggingScreen = false;
  },


  touchStart: function(event) {
    event.preventDefault();

    var touches = event.touches;
    if(touches.length == 1) {
      var x = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      var y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      this.toolStart(x, y, touches[0]);
      UI.captureMouse(this);
    }

  },
  

  touchMove: function(event) {
    var touches = event.touches;
    if(touches.length == 1) {
      var x = touches[0].pageX - $('#' + this.canvas.id).offset().left;
      var y = touches[0].pageY - $('#' + this.canvas.id).offset().top;

      this.toolMove(x, y, touches[0]);
    }

  },

  touchEnd: function(event) {
    this.toolEnd(event);
  },

  mouseDown: function(event) {
    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    this.toolStart(x, y, event);
    UI.captureMouse(this);

  },

  mouseMove: function(event) {

    var x = event.pageX - $('#' + this.canvas.id).offset().left;
    var y = event.pageY - $('#' + this.canvas.id).offset().top;

    this.toolMove(x, y, event);
  },

  mouseUp: function(event) {
    this.toolEnd(event);
  },

}
