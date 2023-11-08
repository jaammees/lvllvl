var Tools = function() {
  this.editor = null;

  this.mode = 'draw';
  
  this.drawTools = null;

}

Tools.prototype = {
  init: function(editor) {
    this.editor = editor;
  },

  buildInterface: function(parentPanel) {

//    var tabPanel = UI.create("UI.TabPanel");
//    parentPanel.add(tabPanel);

    var drawPanel = UI.create("UI.Panel");
//    tabPanel.add({"title": "Draw", "content": drawPanel });

    parentPanel.add(drawPanel);
    this.drawTools = new DrawTools();
    this.drawTools.init(this.editor);
    this.drawTools.buildInterface(drawPanel);


    this.pixelDrawTools = new PixelDrawTools();
    this.pixelDrawTools.init(this.editor);
    this.pixelDrawTools.buildInterface(drawPanel);


/*
    var selectPanel = UI.create("UI.HTMLPanel", { "html": "<span style='color: white'>Select panel</span>" } );
    tabPanel.add({"title": "Select", "content": selectPanel });

    var pixelCharPanel = UI.create("UI.HTMLPanel", { "html": "<span style='color: white'>Pixel Char panel</span>" } );
    tabPanel.add({"title": "Pixel Characters", "content": pixelCharPanel });

    var typePanel = UI.create("UI.HTMLPanel", { "html": "<span style='color: white'>Type panel</span>" } );
    tabPanel.add({"title": "Type", "content": typePanel });
*/
  },

  keyDown: function(event) {
    var tool = this.drawTools.tool;

    /*
    if(typeof this.editor.gridView2d != 'undefined') {
      this.editor.gridView2d.keyDown(event);
    }
    */

    // changing colours works across all modes.
    var commodoreKey = event.altKey;
    if(commodoreKey) {
      var color = false;
      if(event.keyCode >= 49 && event.keyCode <= 56) {
        color = event.keyCode - 49;

        if(event.shiftKey) {
          color += 8;
        }
      }

      if(color !== false) {
        this.editor.currentTile.setColor(color);
        return;
      }
    }

    this.drawTools.keyDown(event);    


  },

  keyUp: function(event) {
    if(typeof this.editor.gridView2d != 'undefined') {
      this.editor.gridView2d.keyUp(event);
    }
    
    if(this.drawTools.tool == 'type') {
      this.drawTools.typing.keyUp(event);
    }

    if(this.drawTools.tool != 'type') {
      this.drawTools.keyUp(event);
    }

  },

  keyPress: function(event) {
    if(this.drawTools.tool == 'type') {
      this.drawTools.typing.keyPress(event);
    }
    if(this.drawTools.tool != 'type') {
      this.drawTools.keyPress(event);
    }


  }

}
