var ColorPaletteLoadFromURL = function() {
  this.uiComponent = null;
  this.visible = false;
  this.callback = false;
}

ColorPaletteLoadFromURL.prototype = {
  init: function() {

  },

  show: function(args) {
    this.callback = args.callback;

    if(this.uiComponent == null) {
      var _this = this;
      this.uiComponent = UI.create("UI.Dialog", 
      { "id": "colorPaletteLoadURLDialog", "title": "Load Lospec Palette", "width": 384, "height": 170 });

      var html = '<div style="padding: 10px">';
      html += '<div style="margin-bottom: 10px">Enter the URL of a <a href="https://lospec.com/palette-list" target="_blank">Lospec palette</a></div>';
      html += '<div style="margin: 6px 0" id="colorPaletteLoadStatus">&nbsp;</div>';
      html += '<input type="text" style="width: 320px" id="colorPaletteLoadURL" placeholder="https://lospec.com/palette-list/palette-slug">';
      html += '</div>';

      var htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
      this.uiComponent.add(htmlPanel);

      this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        _this.submit();
      });

      this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

      this.uiComponent.on('close', function() {
        _this.visible = false;
      });

      this.visible = true;
      UI.showDialog("colorPaletteLoadURLDialog");
      $('#colorPaletteLoadStatus').html('&nbsp;');
      this.initEvents();
      $('#colorPaletteLoadURL').focus();
    } else {
      this.visible = true;
      $('#colorPaletteLoadStatus').html('&nbsp;');
      UI.showDialog("colorPaletteLoadURLDialog");
      $('#colorPaletteLoadURL').focus();
    }

  },

  initEvents: function() {
    var _this = this;
    $('#colorPaletteLoadURL').on('keypress', function(event) {
      if(event.keyCode == 13) {
        _this.submit();
      }
    });
  },

  submit: function() {
    var _this = this;
    var url = $('#colorPaletteLoadURL').val();

    $('#colorPaletteLoadStatus').html('loading...');
    this.loadURL({
      url: url,
      callback: function(response) {
        if(response.success == false) {
          $('#colorPaletteLoadStatus').html('<div style="color: red; display: inline-block">Error</div> unable to load url');
        } else {
          $('#colorPaletteLoadStatus').html('&nbsp;');
          _this.callback(response);
          UI.closeDialog();
        }
      } 
    });
  },
  loadURL: function(args) {
    var url = args.url;
    var callback = args.callback;
    var slug = url;

    var parts = url.split('/');
    if(parts.length > 0) {
      var next = false;
      for(var i = 0; i < parts.length; i++) {
        if(next && parts[i].trim() != '') {
          slug = parts[i];
        }
        if(parts[i].toLowerCase() == 'palette-list') {
          next = true;
        }
      }
    }
    console.log(parts);

    console.log('slug == ' + slug);

    var pos = slug.indexOf('.csv');
    if(pos !== -1) {
      slug = slug.substring(0, pos);
    }

    if(slug.indexOf('.json') == -1) {
      slug += '.json';
    }

    url = "https://lospec.com/palette-list/" + slug;

    console.log('slug = ' + slug);
    console.log('url = ' + url);

    try {
      $.get({
        url: url,
        error: function() {
          callback({
            success: false,
            message: ''
          });

        },
        success: function(response) {
          try {
            response = $.parseJSON(response);
            callback({
              success: true,
              response: response
            });
          } catch(e) {
            callback({
              success: false,
              message: e.getMessage()
            });
            console.log(response);
          }
        }
      });
    } catch(e) {
      callback({
        success: false,
        message: e.getMessage()
      });

    }
    /*
    console.log("LOAD " + url);
    
      console.log('response:');
      console.log(response);
    });

    */
  }
}