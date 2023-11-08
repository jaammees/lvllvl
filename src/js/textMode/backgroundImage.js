var BackgroundImage = function() {
  this.editor = null;

  this.scale = 1;
  this.canvas = null;
  this.context = null;

  this.bgImage = null;

  this.x = 0;
  this.y = 0;
  this.drawWidth = 0;
  this.drawHeight = 0;

}


BackgroundImage.prototype = {


  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "backgroundImageDialog", "title": "Background Image", "width": 640 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/backgroundImage.html', function() {
        
        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "OK" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.setBackgroundImage();
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
    } else {
      this.initContent();
    }

    UI.showDialog("backgroundImageDialog");
  },  


  initContent: function() {
    console.log('setup canvas!!!');
    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    if(!this.canvas) {
      this.canvas = document.getElementById('bgImageCanvas');
    }

    this.canvas.width = tileSet.charWidth * this.editor.grid.width;
    this.canvas.height = tileSet.charHeight * this.editor.grid.height;

    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;

    if(this.bgImage) {
      this.showImage();
    }


  },

  initEvents: function() {
    var _this = this;



    var mouseDownAtX = 0;
    var mouseDownAtY = 0;
    var mouseDown = false;
    var currentOffsetX = 0;
    var currentOffsetY = 0;

    $('#bgImageX').on('keyup', function() {
      _this.showImage();
    });

    $('#bgImageY').on('keyup', function() {
      _this.showImage();
    });

    $('#bgImageScale').on('keyup', function() {
      _this.showImage();
    });

    $('#bgImageCanvas').on('mousedown', function(e) {
      mouseDownAtX = e.clientX;
      mouseDownAtY = e.clientY;
      currentOffsetX = parseInt($('#bgImageX').val());
      currentOffsetY = parseInt($('#bgImageY').val());

      mouseDown = true;
    });

    $('#bgImageCanvas').on('mousemove', function(e) {
      if(mouseDown) {
        var x = e.clientX;
        var y = e.clientY;

        var diffX = x - mouseDownAtX;
        var diffY = y - mouseDownAtY;

        var newOffsetX = currentOffsetX + diffX;
        $('#bgImageX').val(newOffsetX);

        var newOffsetY = currentOffsetY + diffY;
        $('#bgImageY').val(newOffsetY);

        _this.showImage();        
      }
    });

    $('#bgImageCanvas').on('mouseup', function(e) {
//      console.log(e);
      mouseDown = false;
    });

    $('#bgImageScaleDecrease').on('click', function() {
      var scale = parseInt($('#bgImageScale').val());
      scale -= 5;
      if(scale > 0) {
        $('#bgImageScale').val(scale);
      }
      _this.showImage();        

    });

    $('#bgImageScaleIncrease').on('click', function() {
      var scale = parseInt($('#bgImageScale').val());
      scale += 5;
      if(scale > 0) {
        $('#bgImageScale').val(scale);
      }
      _this.showImage();        

    });


    document.getElementById('bgImageSourceFile').addEventListener("change", function(e) {
      var file = document.getElementById('bgImageSourceFile').files[0];
      _this.chooseImage(file);
    });


  },


  setBackgroundImage: function() {
    this.editor.grid.setBackgroundImage(this.bgImage, this.x, this.y, this.drawWidth, this.drawHeight);
  },

  chooseImage: function(file) {
    if(!this.bgImage) {
      this.bgImage = new Image();
    }

//    this.initCanvas();


    var url = window.URL || window.webkitURL;
    var src = url.createObjectURL(file);
    this.bgImage.src = src;

    var _this = this;
    this.bgImage.onload = function() {
      _this.showImage();
    }
  },


  showImage: function() {

    var drawWidth = this.bgImage.naturalWidth;
    var drawHeight = this.bgImage.naturalHeight;
    var scale = 100;

    if(drawWidth > 320) {
      scale = 320 / this.bgImage.naturalWidth;
      drawWidth = this.bgImage.naturalWidth * scale;
      drawHeight = this.bgImage.naturalHeight * scale;
    }

    if(drawHeight > 200) {
      scale = 200 / this.bgImage.naturalHeight;
      drawWidth = this.bgImage.naturalWidth * scale;
      drawHeight = this.bgImage.naturalHeight * scale;
    }

    scale = parseInt($('#bgImageScale').val());


  //  console.log('scale = ' + scale);
    drawWidth = drawWidth * scale / 100;
    drawHeight = drawHeight * scale / 100;

    this.x = parseInt($('#bgImageX').val());
    this.y = parseInt($('#bgImageY').val());
    this.drawWidth = drawWidth;
    this.drawHeight = drawHeight;

//    console.log('x = ' + x + 'y = ' + y);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.bgImage, this.x, this.y, this.drawWidth, this.drawHeight);


  },

}
