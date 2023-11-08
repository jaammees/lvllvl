var MobileMenu = function() {
  this.editor = null;

  this.uiComponent = null;

  this.menuPosition = 0;

  this.touchStartX = 0;
  this.touchStartY = 0;

  this.touchStartScrollY = 0;

  this.moveHorizonal = false;
  this.moveVertical = false;

  this.touchVelocity = null;
}

MobileMenu.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.touchVelocity = new TouchVelocity();
  },

  initEvents: function() {
    var _this = this;
    $('.mobileMenuItem').on('click', function(event) {
      var value = $(this).attr('data-value');
      _this.menuItemSelected(value);
    });


  },

  getMenuHTML: function() {
    var menuItems = [
    /*
      { "label": "Project Explorer", "id": "projectexplorer", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-21-home.svg"/>' },
      { "label": "Save", "id": "save", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-199-save.svg"/>' },
      { "label": "Save As", "id": "saveas", "icon": '<img  height="25"  src="icons/svg/glyphicons-basic-200-save-as.svg">' },      
      { "label": "Save To GitHub...", "id": "savetogithub", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-545-cloud-upload.svg"/>' },
      */
      { "className": "screen-menu-item", "label": "Dimensions", "id": "dimensions", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-69-ruler.svg"/>' },
      { "label": "Screen Mode", "id": "screenmode", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-87-tv.svg"/>' },

      { "label": "Reference Image", "id": "referenceimage", "icon": '<img  height="25" src="icons/svg/glyphicons-halflings-15-picture.svg"/>' },

      { "className": "screen-menu-item", "label": "Choose A Character Set", "id": "tilesetpreset", "icon": '<img height="25" src="icons/svg/glyphicons-basic-422-book-library.svg"/>' },
      { "label": "Choose A Colour Palette", "id": "colorpalettepreset", "icon": '<img height="25" src="icons/svg/glyphicons-basic-444-sampler.svg"/>' },
      { "className": "screen-menu-item", "label": "Import Image / Video", "id": "importimage", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-399-import.svg">' },
//      { "label": "Download", "id": "download" },
//icons/svg/glyphicons-basic-400-export.svg
      { "label": "Export GIF/PNG", "id": "exportimage", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-199-save.svg">' },

      { "label": "Export PNG", "id": "exportpng", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-199-save.svg">' },
      { "label": "Export GIF", "id": "exportgif", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-199-save.svg">' },
      { "className": "screen-menu-item", "label": "Export Tileset", "id": "exporttileset", "icon": '<img  height="25" src="icons/svg/glyphicons-basic-199-save.svg">' },

      { "label": "Toggle Grid", "id": "togglegrid", "icon": '<img height="25" src="icons/material/grid_on-24px.svg"/>' },
      { "label": "Toggle Show Previous Frame", "id": "toggleprev" },
      { "label": "Minimal Interface", "id": "minimalinterface" },
      { "label": "Desktop Mode", "id": "desktopview" },
    ];

    var html = '';

    html += '<div class="mobile-menu-header" style="position: absolute; top: 0; left: 0; right: 0; height: 200px; background-color: #111111">';

/*
    html += '<div style="padding: 0 20px">';
    html += '<h2>lvllvl</h2>';
    html += '</div>';
*/

    html += '<div id="mobileMenuUserInfo"></div>';

    html += '<div style="padding: 0 10px 0 10px">';

    html += '<div style="padding: 0 0 10px 0">';
    if(SHOWUNFINISHED) {
      html += '<div class="ui-button ui-button-primary" id="mobileMenuProjectExplorer"> <img height="25" src="icons/svg/glyphicons-basic-21-home.svg">&nbsp;Project Explorer</div>';
      html += '&nbsp;'
    }

    html += '<div class="ui-button ui-button-info" id="mobileMenuSave" style="margin-right: 10px"> <img  height="25" src="icons/svg/glyphicons-basic-199-save.svg"/>&nbsp;<span class="ui-text" data-textid="Save">' + TextStore.get("Save") + '</div>';
//    html += '&nbsp;'
    html += '<div class="ui-button ui-button-info" id="mobileMenuSaveAs"> <img  height="25"  src="icons/svg/glyphicons-basic-200-save-as.svg"/>&nbsp;<span class="ui-text" data-textid="Save As">' + TextStore.get("Save As") + '</span>...</div>';

    html += '</div>';

    html += '<div style="padding: 10px 0">';
    html += '<div class="ui-button ui-button-info" id="mobileMenuGitHub"> <img  height="25" src="icons/svg/glyphicons-basic-545-cloud-upload.svg"/>&nbsp;<span class="ui-text" data-textid="Commit To GitHub">' + TextStore.get("Commit To GitHub") + '</span>...</div>';
    html += '</div>';


    html += '</div>';


    html += '</div>';
    html += '<div id="mobile-menu-content" style="position: absolute; top: 200px; left: 0; right: 0; bottom: 0; overflow-y: auto; background-color: #222222">';
    for(var i = 0; i < menuItems.length; i++) {
      var className = menuItems[i].className;
      html += '<div';
      if(typeof className != 'undefined') {
        html += ' class="' + className + '"';
      }
      html += '>';

      html += '<a href="javascript: void(0)"  class="mobile-menu-item" data-id="' + menuItems[i].id + '">';
      html += '<div class="rippleJS-manual"></div>';
      html += '<div class="mobile-menu-icon" >';
      if(menuItems[i].icon) {
        html += menuItems[i].icon;
      }
      html += '</div>';
      html += '<span class="ui-text" data-textid="' + menuItems[i].label + '" id="mobile-menu-item-' + menuItems[i].id + '">';
      html += TextStore.get(menuItems[i].label);
      html += '</span>';
      
      html += '</a>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  },

  show: function() {
    var _this = this;
//    this.callback = args.colorPickedCallback;
    if(this.uiComponent == null) {

      var screenWidth = UI.getScreenWidth();
      var screenHeight = UI.getScreenHeight();

      _this.menuWidth = screenWidth - 80;
      _this.menuHeight = screenHeight;

      if(_this.menuWidth > 330) {
        _this.menuWidth = 330;
      }

      

      this.uiComponentHolder = document.createElement('div');
      this.uiComponentHolder.setAttribute('id', 'mobile-menu-holder');
      this.uiComponentHolder.setAttribute('style', 'position: absolute; z-index: 90; top: 0; bottom: 0; left: 0; right:0; background-color: black; opacity: 0.6; display: none');
      document.body.append(this.uiComponentHolder);
      $('#mobile-menu-holder').on('click', function(e) {
        _this.hideMenu();
      });


      this.uiComponent = document.createElement('div');
      this.uiComponent.setAttribute('id', 'mobile-menu');
      this.uiComponent.setAttribute('style', 'position: absolute; z-index: 100; display: none');
      document.body.append(this.uiComponent);

      $('#mobile-menu').css('top', '0');
      $('#mobile-menu').css('bottom', '0');
      $('#mobile-menu').css('overflow', 'auto');
      $('#mobile-menu').css('left', '-' + this.menuWidth + 'px');
      $('#mobile-menu').css('width', this.menuWidth + 'px');
      $('#mobile-menu').css('background-color', '#222222');

      var menuHtml = this.getMenuHTML();
      $('#mobile-menu').html(menuHtml);

      g_app.displayUserDetails();

      $('.mobile-menu-item').on('click', function(e) {
        var id = $(this).attr('data-id');
        _this.hideMenu(id);
      });

      $('.mobile-menu-header').on('contextmenu', function(e) {
        e.preventDefault();
      });

      $('.mobile-menu-header').on('touchstart', function(e) {
        _this.touchStart(e);
      });
      $('.mobile-menu-header').on('touchmove', function(e) {
        _this.touchMove(e);
      });
      $('.mobile-menu-header').on('touchend', function(e) {
        _this.touchEnd(e);
      });




      $('.mobile-menu-item').on('contextmenu', function(e) {
   //     e.preventDefault();
      });

      $('.mobile-menu-item').on('touchstart', function(e) {
        _this.touchStart(e);
      });

      $('.mobile-menu-item').on('touchmove', function(e) {
        _this.touchMove(e);
      });


      $('.mobile-menu-item').on('touchend', function(e) {
        _this.touchEnd(e);
      });


      $('#mobile-menu-content').on('scroll', function(e) {
        var scroll = $(this).scrollTop();

        var diff = (_this.touchStartScrollY - scroll);
        if(diff < 0) {
          diff = - diff;
        }

        if(diff > 5) {
          _this.moveVertical = true;
        }

      });


      $('#mobileMenuProjectExplorer').on('click', function() {
        _this.hideMenu();
        g_app.showProjectNavigator();
      });

      $('#mobileMenuSave').on('click', function() {
        _this.hideMenu();
        g_app.fileManager.save();
      });

      $('#mobileMenuSaveAs').on('click', function() {
        _this.hideMenu();
        g_app.fileManager.showSaveAs();
      });

      $('#mobileMenuGitHub').on('click', function() {
        _this.hideMenu();        
        g_app.github.save(); 
      });
    }

    if(this.editor.graphic.getType() == 'sprite') {
      $('#mobile-menu-content .screen-menu-item').hide();
    } else {
      $('#mobile-menu-content .screen-menu-item').show();
    }

    if(this.editor.getGridVisible()) {
      this.setMenuItemText('togglegrid', "Hide Grid");
    } else {
      this.setMenuItemText('togglegrid', "Show Grid");
    }

    if(this.editor.frames.showPrevFrame) {
      this.setMenuItemText('toggleprev', "Hide Prev Frame");
    } else {
      this.setMenuItemText('toggleprev', "Show Prev Frame");

    }
//    $('#mobile-menu-holder').fadeIn(100);
    $('#mobile-menu').show();
    $('#mobile-menu-holder').show();

    var duration = 300 * (-this.menuPosition/this.menuWidth);


    $('#mobile-menu').animate({
      left: '0px'
    }, {
      duration: 300,
      step: function(now, tween) {
        var position = $('#mobile-menu').position();
        var left = position.left;

        var complete = (_this.menuWidth + left) / _this.menuWidth;
        var opacity = 0.6 * complete;
        $('#mobile-menu-holder').css('opacity', opacity);

      },

      complete: function() {
        UI.browserPushState({ type: "mobile-menu" }, "lvllvl Menu", window.location.href);
        _this.menuPosition = 0;
      }
    });

    /*
    $('#mobile-menu').animate({
      left: '0px'
    }, 300, function() {
      _this.menuPosition = 0;

    });
*/

//    UI.showDialog("mobileMenu");  
  },

  setMenuItemText: function(id, text) {
    $('#mobile-menu-item-' + id).html(text);
  },

  setMenuPosition: function(position) {
    this.menuPosition = position;
    $('#mobile-menu').css('left', position + 'px');

    var complete = (this.menuWidth + this.menuPosition) / this.menuWidth;
    var opacity = 0.6 * complete;
    $('#mobile-menu-holder').css('opacity', opacity);

  },

  showRipple: function() {
    console.log('show ripple');
//    this.touchAt.target = document.getElementById(this.touchAt.elementId);
    var element = getHolderWithRippleJsClass(this.touchAt, 'rippleJS-manual');
    startRipple('touchstart', this.touchAt, element);
  },

  touchStart: function(e) {
    this.touchVelocity.touchStart(e);

    var touches = e.touches;

    this.touchStartScrollY = $('#mobile-menu-content').scrollTop();

    if(touches.length > 0) {
      var x = touches[0].pageX;
      var y = touches[0].pageY;      

      this.touchStartX = x;
      this.touchStartY = y;      


      this.touchAt = {
        offsetX: touches[0].offsetX,
        offsetY: touches[0].offsetY,
        clientX: touches[0].clientX,
        clientY: touches[0].clientY,
        target: touches[0].target
      }

      console.log(this.touchAt);
      console.log(touches[0].target);

      var _this = this;
      //
      // check if movingn or menu selection
      setTimeout(function() {
        if(!_this.moveHorizonal && !_this.moveVertical) {
          _this.showRipple();
        }
        
      }, 170);
    }
  },

  touchMove: function(e) {
    this.touchVelocity.touchMove(e);

    var touches = e.touches;


    if(touches.length > 0) {
      var x = touches[0].pageX;
      var y = touches[0].pageY; 

      if(this.moveVertical) {
        return;
      }     

      var diffX = x - this.touchStartX;
      var hDist = -16;
      if(diffX < hDist) {
        this.moveHorizonal = true;
      }

      if(this.moveHorizonal) {
        diffX = x - this.touchStartX - hDist;
        if(diffX > 0) {
          diffX = 0;
        }
        this.setMenuPosition(diffX);
      }
    
    }

  },

  touchEnd: function(e) {
    this.touchVelocity.touchEnd(e);

    var touches = e.touches;

    this.moveHorizonal = false;  
    this.moveVertical = false;  
    var closeDistance = this.menuWidth / 3.5;
    if(closeDistance < -95) {
      closeDistance = -95;
    }

    var velocity = this.touchVelocity.getVelocity();

    if(-this.menuPosition > closeDistance || velocity.vx < -1.5) {
      this.hideMenu(false, velocity);
    } else {
      this.show();
    }

  },

  hideMenu: function(id, velocity) {
    var _this = this;

    var duration = 300 ;//* (this.menuWidth + this.menuPosition) / this.menuWidth;

    // get the current position
    var position = $('#mobile-menu').position();
    var left = position.left;
    var destPosition = -this.menuWidth;

    var distance = left - destPosition;

    if(typeof velocity != 'undefined') {
      duration = -distance / velocity.vx;
      if(duration > 300) {
        duration = 300;
      }

    }


//    $('#mobile-menu-holder').fadeOut(100);
    $('#mobile-menu').animate({
      left: '-' + this.menuWidth + 'px'
    }, duration, function() {
      $('#mobile-menu').hide();
      $('#mobile-menu-holder').fadeOut(10);
      if(typeof id != 'undefined' && id !== false) {
        _this.menuItemSelected(id);
      }
    });
  },

  menuItemSelected: function(item) {
    if(this.moveHorizonal) {
      return;
    }
    UI.closeDialog();
    switch(item) {

      case 'projectexplorer':
        g_app.showProjectNavigator();
      break;

      case 'dimensions':        
        this.editor.showDimensionsDialog();      
      break;
      case 'screenmode':
        this.editor.showScreenModeDialog();
      break;
      case 'referenceimage':
        this.editor.showReferenceImageDialog();
      break;
      case 'tilesetpreset':
        this.editor.tileSetManager.showChoosePreset({});        
      break;
      case 'colorpalettepreset':
        this.editor.colorPaletteManager.showChoosePreset({});
      break;
      case 'save':
        g_app.fileManager.save();
      break;
      case 'saveas':
        g_app.fileManager.showSaveAs();

      break;

      case 'savetogithub':
        g_app.github.save(); 
      break;

      case 'download':
        g_app.fileManager.showDownload();

      break;
      case 'exportimage':
        this.editor.exportImage();
        break;
      case 'exportpng':
        this.editor.exportPng();      
      break;
      case 'exportgif':
        this.editor.exportGif();
      break;
      case 'exporttileset':
        this.editor.exportTileset();
      break;      
      case 'importimage':
        this.editor.importImage.start();
      break;
      case 'togglegrid':
//        this.editor.grid.toggleGrid();
        this.editor.setGridVisible(!this.editor.getGridVisible());
      break;
      case 'toggleprev':
        this.editor.frames.setShowPrevFrame(!this.editor.frames.showPrevFrame);
      break;
      case 'minimalinterface':
        if(g_app.getMobileInterfaceType() == 'full') {
          g_app.mobileReduceInterface();
        } else {
          g_app.mobileRestoreInterface();
        }
        break;
      case 'desktopview':
        if(confirm("Are you sure you want to switch to desktop mode?")) {
          g_app.setDeviceType('desktop');
        }
      break;
    }

  }
}

