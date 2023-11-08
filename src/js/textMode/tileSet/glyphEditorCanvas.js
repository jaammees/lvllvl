var GlyphEditorCanvas = function() {
  this.canvasElementId = false;
  this.canvas = null;
  this.tile = false;

}

GlyphEditorCanvas.prototype = {
  init: function(editor, args) {
    this.editor = editor;
    this.canvasElementId = args.canvasElementId;
    this.setupGlyphEditor();
  },

  setupGlyphEditor: function() {
    if(this.canvas === null) {
      this.canvas = document.getElementById(this.canvasElementId);
      if(this.canvas == null) {
        // still not ready
        return;
      }
      this.initEvents();
      this.resize();
    }
  },

  initEvents: function() {
    var _this = this;

    $('#' + this.canvasElementId).on('mousedown', function(event) {
      _this.mouseDown(event);
    });

    $('#' + this.canvasElementId).on('mousemove', function(event) {
      _this.mouseMove(event);
    });

    $('#' + this.canvasElementId).on('mouseup', function(event) {
      _this.mouseUp(event);
    });

    $('#' + this.canvasElementId).on('mouseleave', function(event) {
      _this.mouseLeave(event);
    });
    
    $('#' + this.canvasElementId).on('contextmenu', function(event) {
      event.preventDefault();
    });


    $('#' + this.canvasElementId).on('mouseenter', function(event) {
      _this.mouseEnter(event);
    });

  },

  resize: function() {
    this.context = this.canvas.getContext('2d');
  },

  setTile: function(tile) {
    this.tile = tile;
    this.draw();
  },

  draw: function() {
    if(this.tile === false) {
      return;
    }

    if(this.context == null) {
      return;
    }

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();
    if(!tileSet) {
      return;
    }

    var dstX = 0;
    var dstY = 0;
    var tileWidth = this.canvas.width;
    var tileHeight = this.canvas.height;

    this.context.fillStyle = '#111111';
    this.context.fillRect(dstX, dstY, tileWidth, tileHeight);

      
    var path = tileSet.getGlyphPath(this.tile);
    if(path !== null) {
      var cellSize = tileWidth;
      var fontScale = tileSet.getFontScale();
      var scale = cellSize * fontScale;
      var ascent = tileSet.getFontAscent() ;

      //context.fillStyle = '#ffffff';
      this.context.setTransform(scale,0,0,-scale, dstX, dstY + ascent * scale);

/*
        if(flipH) {
          context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
          context.scale(-1,1);
          context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
        }

        if(flipV) {
          context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );              
          context.scale(1,-1);
          context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
        }            

        if(rotateZ != 0) {
          context.translate(1 / (2 * fontScale),  -1 / (2*fontScale)  + ascent  );
          context.rotate(rotateZ * 90 * Math.PI / 180);            
          context.translate(-1 / (2 * fontScale), 1 / (2 * fontScale) - ascent );                
        }
*/
      this.context.fillStyle = '#eeeeee';

      this.context.fill(path);
      this.context.setTransform(1,0,0,1,0,0);
    }

  },


  mouseDown: function(event) {

  },

  mouseMove: function(event) {

  },

  mouseUp: function(event) {

  },

  mouseEnter: function(event) {

  },

  mouseLeave: function(event) {

  }
}