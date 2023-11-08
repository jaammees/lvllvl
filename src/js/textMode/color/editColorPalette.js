var EditColorPaletteDialog = function() {
  this.editor = null;
  this.uiComponent = null;

  this.canvas = null;
  this.colorWidth = 16;
  this.colorHeight = 16;
  this.colorSpacing = 2;

  this.colorsAcross = 16;
  this.colorsDown = 16;

  this.colors = [];
}

EditColorPaletteDialog.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  htmlComponentLoaded: function() {
    this.canvas = document.getElementById('editColorPaletteCanvas')
    this.canvas.width = 16 * (this.colorWidth + this.colorSpacing) + this.colorSpacing;
    this.canvas.height = 16 * (this.colorHeight + this.colorSpacing) + this.colorSpacing;

    this.initColors();
    this.drawPalette();

  },

  initColors: function() {
    var colorPalette = this.editor.colorPaletteManager.getCurrentColorPalette();
    console.log('colour count = ' + colorPalette.getColorCount());

    this.colors = [];
    for(var i = 0; i < 256; i++) {
      this.colors.push({ color: false });
    }

    for(var i = 0; i < colorPalette.getColorCount(); i++) {
      this.colors[i].color = colorPalette.getHex(i);
    }

  },

  show: function() {
    var _this = this;
    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", 
        { "id": "editColorPalette", "title": "Edit/Create Colour Palette", "width": 810 });

      this.editColorPanel = UI.create("UI.HTMLPanel");
      this.editColorPanel.load('html/textMode/editColorPalette.html', function() {
        _this.htmlComponentLoaded();
      });
      this.uiComponent.add(this.editColorPanel);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('mousedown', function(event) {
        _this.mouseDown(event);
      });

      this.uiComponent.on('mouseup', function(event) {
        _this.mouseUp(event);
      });

      this.uiComponent.on('mousemove', function(event) {
        _this.mouseMove(event);
      });
    }

    UI.showDialog("editColorPalette");

  },

  mouseDown: function(event) {
    console.log('mouse down');
  },

  mouseMove: function(event) {
//    console.log(event);
    var x = event.clientX;
    var y = event.clientY;

    var canvasOffset = $('#editColorPaletteCanvas').offset();
//    console.log(canvasOffset);
//    console.log('mouse move' + x + ',' + y);

    if(x > canvasOffset.left && x < canvasOffset.left + this.canvas.width 
        && y > canvasOffset.top && y < canvasOffset.top + this.canvas.height) {
      console.log('in canvas');
    }
  },

  mouseUp: function(event) {
    console.log('mouse up');
  },

  drawPalette: function() {
    this.context = this.canvas.getContext('2d');

    var colorIndex = 0;
    for(var y = 0; y < this.colorsDown; y++) {
      for(var x = 0; x < this.colorsAcross; x++) {
        var xPos = this.colorSpacing + x * (this.colorWidth + this.colorSpacing);
        var yPos = this.colorSpacing + y * (this.colorHeight + this.colorSpacing);

        if(colorIndex < this.colors.length) {
          var color = this.colors[colorIndex].color;
          if(color !== false) {
            var colorHexString = ("000000" + color.toString(16)).substr(-6);

            console.log(this.colors[colorIndex].color);
            console.log('color hex string = ' + colorHexString);
            this.context.fillStyle = '#' + colorHexString;

            this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
          } else {
            this.context.fillStyle = '#444444';
            this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);

          }
        } else {
//          console.log('color hex string = ' + colorHexString);

          this.context.fillStyle = '#984323';
          this.context.fillRect(xPos, yPos, this.colorWidth, this.colorHeight);
        }

        colorIndex++;

      }

    }

  }
}