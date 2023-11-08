var TextDialog = function() {
  this.uiComponent = null;
}

TextDialog.prototype = {

  buildInterface: function() {
    var _this = this;

    this.uiComponent = UI.create("UI.Dialog", { "id": "textDialog", "title": "", "width": 680 });

    var html = '';
    html += '<div class="panelFill">';
//    html += '<textarea id="textDialogText" style="position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; width: calc(100% - 25px)"></textarea>';

    html += '<div id="textDialogText" style="position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; width: calc(100% - 25px)"></div>';

    html += '</div>';
    this.htmlComponent = UI.create("UI.HTMLPanel", { html: html });
    this.uiComponent.add(this.htmlComponent);

    this.copyButton = UI.create('UI.Button', { "text": "Copy To Clipboard", "color": "primary" });
    this.uiComponent.addButton(this.copyButton);
    this.copyButton.on('click', function(event) {
      _this.copyText();
    });


    this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
    this.uiComponent.addButton(this.closeButton);
    this.closeButton.on('click', function(event) {
      UI.closeDialog();
    });

    this.editor = ace.edit("textDialogText");
    this.editor.getSession().setTabSize(2);
    this.editor.getSession().setUseSoftTabs(true);
    this.editor.on('focus', function() {
      g_app.setAllowKeyShortcuts(false);
      UI.setAllowBrowserEditOperations(true);
    });

    this.editor.on('blur', function() {
      g_app.setAllowKeyShortcuts(true);
      UI.setAllowBrowserEditOperations(false);
    });
    var mode = 'ace/mode/assembly_6502';
    if(this.mode == 'javascript') {
      mode = 'ace/mode/javascript';
    }
    this.editor.getSession().setMode(mode);//"ace/mode/assembly_6502");
    this.editor.setShowInvisibles(true);

  },


  copyText: function() {
    var sel = this.editor.selection.toJSON(); // save selection
    this.editor.selectAll();
    this.editor.focus();
    document.execCommand('copy');
    this.editor.selection.fromJSON(sel); // restore selection
  },
  show: function() {
    if(this.uiComponent == null) {
      this.buildInterface();
    }

    UI.showDialog("textDialog");
  },

  setText: function(text) {
    if(this.uiComponent == null) {
      this.buildInterface();
    }
    this.editor.setValue(text, -1);
//    $('#textDialogText').val(text);

  }
}