var SpriteEditor = function() {
}

SpriteEditor.prototype = {
  init: function() {
    var _this = this;
  },

  buildInterface: function(parentPanel) {


    var spriteEditor = UI.create("UI.SplitPanel", { "id": "spriteEditor"});
    parentPanel.add(spriteEditor);

    // tools panel is loaded by drawtools.js
    var toolsHTMLPanel = UI.create("UI.HTMLPanel", { "id": "spriteToolsPanel",});
    spriteEditor.addWest(toolsHTMLPanel, 72, true);

    // tools panel is loaded by drawtools.js
    var layersHTMLPanel = UI.create("UI.HTMLPanel", { "id": "spriteLayersPanel",});
    spriteEditor.addEast(layersHTMLPanel, 172, true);


    var gridHolder = UI.create("UI.Panel", { "id": "spriteGridPanel" });
    spriteEditor.add(gridHolder);


  }

}