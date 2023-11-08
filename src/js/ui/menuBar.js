UI.MenuItem = function() {
  this.init = function(args) {

    this.id = UI.getID();
    this.enabled = true;
    this.visible = true;

    this.menuBar = false;
    if(typeof args.menuBar !== 'undefined') {
      this.menuBar = args.menuBar;
    }

    this.menu = false;
    if(typeof args.menu !== 'undefined') {
      this.menu = args.menu;
    }

    if(typeof args.label === 'undefined') {
      this.label = '';
    } else {
      this.label = args.label;
    }

    this.visible = true;
    if(typeof(args.visible) != 'undefined') {
      this.visible = args.visible;
      if(!this.visible) {
        this.style += ';display: none';
      }
    }



    if(typeof args.type === 'undefined') {
      this.type = "item";
    } else {
      this.type = args.type;
    }

    if(typeof args.checked !== 'undefined') {
      this.checked = args.checked;
    } else {
      this.checked = false;
    }

    if(typeof args.shortcut === 'undefined') {
      this.shortcut = false;
    } else {
      this.shortcut = args.shortcut;
      if(typeof this.shortcut.cmd == 'undefined') {
        this.shortcut.cmd = false;
      }
      if(typeof this.shortcut.shift == 'undefined') {
        this.shortcut.shift = false;
      }
      if(typeof this.shortcut.ctrl == 'undefined') {
        this.shortcut.ctrl = false;
      }
      if(typeof this.shortcut.alt == 'undefined') {
        this.shortcut.alt = false;
      }
       

      if(UI.os !== 'Mac OS' && this.shortcut.cmd) {
        this.shortcut.cmd = false;
        this.shortcut.ctrl = true;
      }

      if(this.shortcut.key != 'undefined') {
        if(this.shortcut.key.length == 1) {
          this.shortcut.keyLowerCase = this.shortcut.key.toLowerCase();
          this.shortcut.charCode = this.shortcut.key.toLowerCase().charCodeAt(0);
        }
      }
      if(this.menuBar) {
        this.menuBar.addShortcut(this.shortcut, this);
      }
    }
  }


  this.getShortcutHTML = function() {
    var shortcutHtml = '';
    if(this.shortcut !== false) {
      var shortcutHtml = '';
      var shortcut = this.shortcut;
      if(typeof shortcut.ctrl !== 'undefined' && shortcut.ctrl === true) {
        shortcutHtml += 'Ctrl';
      }

      if(typeof shortcut.cmd !== 'undefined' && shortcut.cmd === true) {
        if(UI.os == 'Mac OS') {
          shortcutHtml += 'Cmd';
        } else {
          shortcutHtml += 'Ctrl';
        }
      }

      if(typeof shortcut.alt !== 'undefined' && shortcut.alt === true) {
        if(shortcutHtml != '') {
          shortcutHtml += '+';
        }
        shortcutHtml += 'Alt';
      }

      if(typeof shortcut.shift !== 'undefined' && shortcut.shift === true) {
        if(shortcutHtml != '') {
          shortcutHtml += '+';
        }
        shortcutHtml += 'Shift';
      }

      if(typeof shortcut.key !== 'undefined' ) {
        if(shortcutHtml != '') {
          shortcutHtml += '+';
        }
        shortcutHtml += shortcut.key;             
      }
    }
    return shortcutHtml;
  }


  this.setVisible = function(visible) {
    this.visible = visible;
    if(this.visible) {
      $('#' + this.id).show();
    } else {
      $('#' + this.id).hide();
    }
  }

  this.setChecked = function(checked) {
    this.checked = checked;
    if(this.checked) {
      $('#' + this.id + '-checkmark').html('<div class="ui-menu-item-checkmark"></div>');
    } else {
      $('#' + this.id + '-checkmark').html('');
    }
  }

  this.getChecked = function() {
    return this.checked;
  }

  this.setEnabled = function(enabled) {

    this.enabled = enabled;
    if(enabled) {
      $('#' + this.id).addClass('ui-menu-item');
      $('#' + this.id).removeClass('ui-menu-item-disabled');
    } else {
      $('#' + this.id).addClass('ui-menu-item-disabled');
      $('#' + this.id).removeClass('ui-menu-item');
    }
  }

  this.setLabel = function(label) {
    $('#' + this.id + ' .ui-menu-item-label').html(label);
  }

  this.getElement = function() {
    var element = document.createElement('div');
    element.setAttribute('id', this.id);

    element.setAttribute('style', 'clear: both');
    if(!this.visible) {
      element.setAttribute('style', 'display: none;');
    }

    var html = '';
    if(this.type == 'separator') {
      element.setAttribute('class', 'ui-menu-item-separator');
      html =  this.label;
    } else {
      element.setAttribute('class', 'ui-menu-item');
      html += '<div style="display: inline-block; width: 14px" id="' + this.id + '-checkmark">';
      if(this.checked) {
        html += '<div class="ui-menu-item-checkmark"></div>';;
      }
      html += '</div>';
      html += '<div class="ui-menu-item-label ui-text" data-textid="' + this.label + '">' + this.label + '</div>';;
      var shortcutHtml = this.getShortcutHTML();

      html += '<div class="ui-menu-item-shortcut">';
      if(shortcutHtml != '') {
        html += '&nbsp;&nbsp;&nbsp;&nbsp;' + shortcutHtml;
      }
      html += '</div>';
    }

    element.innerHTML = html;

    var menuItem = this;
    element.onclick = function(event) {
      var element = event.target;
      menuItem.click(event);
    }
    return element;    
  }

  this.click = function(event) {
    if(this.menuBar !== false) {
      this.menuBar.hideMenu();
    }

    if(this.enabled) {
      this.menuBar.trigger('itemclick', this.uiID);
      this.trigger('click', this.uiID);

      if(this.menu !== false) {
        this.menu.flash();
      }
    }

  }
}
UI.registerComponentType("UI.MenuItem", UI.MenuItem);
UI.Menu = function() {
  this.menuItems = [];
  this.element = null;

  this.addItem = function(args) {

    args.menuBar = this.menuBar;
    args.menu = this;

    var menuItem = UI.create("UI.MenuItem", args);
    this.menuItems.push(menuItem);

    if(UI.ready) {
      var thisElement = this.getElement();
      thisElement.append(menuItem.getElement());
    }

    return menuItem;

  }

  this.getItem = function(id) {
    for(var i = 0; i < this.menuItems.length; i++) {
      if(this.menuItems[i].uiID == id) {
        return this.menuItems[i];
      }
    }
    return null;
  }

  this.hasItem = function(id) {
    for(var i = 0; i < this.menuItems.length; i++) {
      if(this.menuItems.uiID == id) {
        return true;
      }
    }
    return false;
  }
  this.removeItem = function(id) {

  }

  this.getItems = function(args) {
    return this.menuItems;
  }

  this.flash = function() {
    $('#' + this.menuBarItemId).addClass('ui-menubar-item-hover');
    var _this = this;
    setTimeout(function() {
      $('#' + _this.menuBarItemId).removeClass('ui-menubar-item-hover');

    }, 120);
  }

  this.addSeparator = function(args) {
    args.menuBar = this.menuBar;
    args.type = "separator";
    var menuItem = UI.create("UI.MenuItem", args);
    this.menuItems.push(menuItem);

    if(UI.ready) {
      var thisElement = this.getElement();
      thisElement.append(menuItem.getElement());
    }

    return menuItem;

/*
    if(typeof args.id === 'undefined') {
      args.id = this.id + "_" + this.menuItems.length;
    }

    if(typeof args.label === 'undefined') {
      args.label = '';
    }
    var menuItem = { label: args.label, id: args.id, type: "separator" };
    this.menuItems.push(menuItem);
*/
  }

  this.getElement = function() {
    if(this.element == null) {
      this.element = document.createElement('div');
      this.element.setAttribute('id', this.id);
      this.element.setAttribute('class', 'ui-menu');
  //    element.innerHTML = '<span style="color: white">hello</span>';
    }
    return this.element;
  }


  this.getHTML = function() {

    var html = '';
    html += '<div class="ui-menu" id="ui-menu-' + this.id + '">';
    for(var i = 0; i < this.menuItems.length; i++) {
      switch(this.menuItems[i].type) {
        case "item":
          html += '<div class="ui-menu-item" id="ui-menu-item-'  + this.menuItems[i].id + '">' + this.menuItems[i].label;
          if(this.menuItems[i].shortcut !== false) {
            var shortcutHtml = '';
            var shortcut = this.menuItems[i].shortcut;
            if(typeof shortcut.ctrl !== 'undefined' && shortcut.ctrl === true) {
              shortcutHtml += 'Ctrl';
            }

            if(typeof shortcut.cmd !== 'undefined' && shortcut.cmd === true) {
              // cmd on osx, ctrl otherwise 
              if(UI.os == 'Mac OS') {
                shortcutHtml += 'Cmd';
              } else {
                shortcutHtml += 'Ctrl';
              }
            }

            if(typeof shortcut.shift !== 'undefined' && shortcut.shift === true) {
              if(shortcutHtml != '') {
                shortcutHtml += '+';
              }
              shortcutHtml += 'Shift';
            }
            if(typeof shortcut.key !== 'undefined' ) {
              if(shortcutHtml != '') {
                shortcutHtml += '+';
              }
              shortcutHtml += shortcut.key;             
            }
            html += '&nbsp;&nbsp;' + shortcutHtml;
          }
          html += '</div>';
          break;
        case "separator":
          html += '<div class="ui-menu-item-separator" id="' + this.menuItems[i].id + '">' + this.menuItems[i].label + '</div>';
          break;
      }


    }
    html += '</div>';

    return html;

  }

}

UI.MenuBar = function() {
  this.menus = [];

  this.shortcuts = [];

  this.menuShownId = false;
  this.menuBarItemShownId = false;  
  this.element = null;

  this.init = function(args) {
    UI.menuComponents.push(this);

    this.visible = true;
    if(typeof(args.visible) != 'undefined') {
      this.visible = args.visible;
      if(!this.visible) {
        this.style += ';display: none';
      }
    }

  }

  this.addShortcut = function(shortcut, menuItem) {
    this.shortcuts.push({ shortcut: shortcut, "menuItem": menuItem, enabled: true });
  }


  this.setShortcutEnabled = function(shortcut, enabled) {
    if(typeof shortcut.cmd == 'undefined') {
      shortcut.cmd = false;
    }
    if(typeof shortcut.shift == 'undefined') {
      shortcut.shift = false;
    }
    if(typeof shortcut.ctrl == 'undefined') {
      shortcut.ctrl = false;
    }

    if(UI.os !== 'Mac OS' && shortcut.cmd) {
      shortcut.cmd = false;
      shortcut.ctrl = true;
    }

    for(var i = 0; i < this.shortcuts.length; i++) {
      if(this.shortcuts[i].shortcut.key == shortcut.key 
        && this.shortcuts[i].shortcut.shift == shortcut.shift
        && this.shortcuts[i].shortcut.cmd == shortcut.cmd
        && this.shortcuts[i].shortcut.ctrl == shortcut.ctrl) {
        this.shortcuts[i].enabled = enabled;
      }

    }

  }
/*
  this.enableShortcut = function(shortcut) {
    for(var i = 0; i < this.shortcuts.length; i++) {
      if(this.shortcuts[i].shortcut.key == shortcut.key 
        && this.shortcuts[i].shortcut.shift == shortcut.shift
        && this.shortcuts[i].shortcut.cmd == shortcut.cmd
        && this.shortcuts[i].shortcut.ctrl == shortcut.ctrl) {
        this.shortcuts[i].enabled = true;
      }

    }
    
  }
*/
  this.addMenu = function(args) {
    var menu = new UI.Menu();
    menu.id = UI.getID();//this.menus.length;
    menu.menuBarItemId = UI.getID();
    menu.label = args.label;
    menu.menuBar = this;

    this.menus.push(menu);

    if(UI.ready) {
      var thisElement = this.getElement();
      var menuBarItemElement = document.createElement('div');
      menuBarItemElement.setAttribute('id', menu.menuBarItemId);
      var classNames = 'ui-menubar-item ui-text';
      if(typeof args.className) {
        classNames += ' ' + args.className;
      }
      menuBarItemElement.setAttribute('class', classNames);

      menuBarItemElement.setAttribute('data-textid', menu.label);
      menuBarItemElement.innerHTML = menu.label;
      thisElement.append(menuBarItemElement);

      var menuBar = this;
      menuBarItemElement.onclick = function(event) {
        var element = event.target;
        menuBar.showMenu(element.id);
      }

      menuBarItemElement.onmouseover = function(event) {
        var element = event.target;//srcElement;

        if(menuBar.menuBarItemShownId !== false  && menuBar.menuBarItemShownId !== element.id) {
          menuBar.showMenu(element.id);
        }        
      }

      var menuElement = menu.getElement();
      document.body.append(menuElement);
    }

    return menu;
  }


  this.showOnly = function(className) {
    $('#' + this.id + ' .ui-menubar-item').hide();
    $('#' + this.id + ' .' + className).show();
  }

  this.getElement = function() {
    if(this.element == null) {
      this.element = document.createElement('div');
      this.element.setAttribute("id", this.id);
      this.element.setAttribute("class", "ui-menubar-panel ui-mouseevents");    
      if(!this.visible) {
        this.element.setAttribute('style', 'display: none;');
      }    
      this.homeLink = document.createElement("a");
      this.homeLink.setAttribute("href", "/");
      this.element.append(this.homeLink);

      this.logo = document.createElement("img");
      this.logo.setAttribute("src", "images/logo16t.png");
      this.logo.setAttribute("height", "16");
      this.logo.setAttribute("style", "padding: 3px 3px 3px 5px");
      this.logo.setAttribute("class", "ui-menu-icon");
      this.homeLink.append(this.logo);
    }


    return this.element;
  }

  this.getHTML = function() {
    var html = '';
    html += '<div class="ui-menubar" style="';
    if(!this.visible) {
      html += ' display: none; ';
    }
    html += '" id="' + this.id + '">';

    for(var i = 0; i < this.menus.length; i++) {
      html += '<div class="ui-menubar-item" id="ui-menubar-item-' + this.menus[i].id + '">' + this.menus[i].label;
      html += '</div>';
    }
    html += '</div>';

    var menuHtml = '';
    for(var i = 0; i < this.menus.length; i++) {
      menuHtml += this.menus[i].getHTML();
    }
    $('body').append(menuHtml);

    var menuBar = this;
    UI.on('ready', function() {
      menuBar.initEvents();
    });
    return html;

  }


  this.keyDown = function(event) {

    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode);//

    if(keyCode == 93) {
      // cmd key
      c = '';
    }
    c = c.toLowerCase();

    if(keyCode == 189) {
      c = '-';
    }
    if(keyCode == 187) {
      c = '=';
    }

    if(keyCode == 109) {
      c = '-';
    }
    if(keyCode == 173) {
      c = '-';
    }
    if(keyCode == 219) {
      c = '[';
    }

    if(keyCode == 221) {
      c = ']';
    }


    if(keyCode == 220) {
      c = '\\';
    }

    if(keyCode == 91) {
      // command key?
      c = '';
    }
    // if not mac need to use control
    var cmdDown = event.metaKey;
    var ctrlDown = event.ctrlKey;
    var shiftDown = event.shiftKey;
    var altDown = event.altKey;

    for(var i = 0; i < this.shortcuts.length; i++) {

      if(this.shortcuts[i].enabled && c == this.shortcuts[i].shortcut.keyLowerCase) {
        if(this.shortcuts[i].shortcut.cmd == cmdDown && this.shortcuts[i].shortcut.shift == shiftDown 
           && this.shortcuts[i].shortcut.ctrl == ctrlDown
           && this.shortcuts[i].shortcut.alt == altDown) {

          this.shortcuts[i].menuItem.click();
          event.preventDefault();
          return true;
        }
      }
    }
    return false;    
  }

  this.keyUp = function(event) {

    var keyCode = event.keyCode;
    var c = String.fromCharCode(keyCode).toLowerCase();
    if(keyCode == 189) {
      c = '-';
    }
    if(keyCode == 109) {
      c = '-';
    }
    if(keyCode == 173) {
      c = '-';
    }

    if(keyCode == 187) {
      c = '=';
    }

    // if not mac need to use control
    var cmdDown = event.metaKey;
    var ctrlDown = event.ctrlKey;
    var shiftDown = event.shiftKey;
    var altDown = event.altKey;

    for(var i = 0; i < this.shortcuts.length; i++) {

      if(this.shortcuts[i].enabled && c == this.shortcuts[i].shortcut.keyLowerCase) {
        if(this.shortcuts[i].shortcut.cmd == cmdDown && this.shortcuts[i].shortcut.shift == shiftDown
           && this.shortcuts[i].shortcut.ctrl == ctrlDown
           && this.shortcuts[i].shortcut.alt == altDown ) {
          event.preventDefault();
          return true;
        }
      }
    }
    return false;
  }

  this.keyPress = function(event) {
    return this.keyUp(event);
  }



  this.hideMenu = function() {
    if(this.menuBarItemShownId !== false) {
      $('#' + this.menuBarItemShownId).removeClass('ui-menubar-item-selected');
    }
    if(this.menuShownId !== false) {
      $('#' + this.menuShownId).fadeOut(20);
    }
    $('#ui-menu-background').hide();
//    UI.releaseMouse();
    this.menuBarItemShownId = false;
    this.menuShownId = false;
  }

  this.showMenu = function(menuBarItemId) {
    var index = false;
    var id = '';
    for(var i = 0; i < this.menus.length; i++) {
      if(this.menus[i].menuBarItemId == menuBarItemId) {
        index = i;
        id = this.menus[i].id;

      }
    }

    if(index === false) {
      return;
    }

    this.hideMenu();

    this.menuBarItemShownId = menuBarItemId;
    this.menuShownId = id;
    $('#ui-menu-background').show();

    var menuBar = this;
    var backgroundElement = document.getElementById('ui-menu-background');
    backgroundElement.onclick = function() {
      menuBar.hideMenu();
    }
//    UI.captureMouse(this, { "addLayer": false });

    var menuBarItemPosition = $('#' + menuBarItemId).offset();

    var menuPosition = {};
    menuPosition.left = menuBarItemPosition.left;
    menuPosition.top = menuBarItemPosition.top + 25;

    $('#' + menuBarItemId).addClass('ui-menubar-item-selected');

    $('#' + id).css('top', menuPosition.top + 'px');
    $('#' + id).css('left', menuPosition.left + 'px');
    $('#' + id).fadeIn(20);
  }

  this.initMenuBarItemEvents = function(id) {
    var menuBar = this;
    $('#ui-menubar-item-' + id).on('click', function() {
      menuBar.showMenu(id);
    });

    $('#ui-menubar-item-' + id).on('mouseover', function() {
      if(menuBar.menuShownId !== ''  && menuBar.menuShownId !== id) {
        menuBar.showMenu(id);
      }
    });
  }

  this.menuClick = function(id) {

  }

  this.initEvents = function() {
    var menuBar = this;    
    for(var i = 0; i < this.menus.length; i++) {
      var id =  this.menus[i].id;
      this.initMenuBarItemEvents(id);
    }

    $('.ui-menu-item').on('click', function() {
      menuBar.hideMenu();
      var id = $(this).attr('id');
      menuBar.menuClick(id);
    });   

    $('#ui-menu-background').on('click', function() {
      menuBar.hideMenu();
    });
  }
}

UI.registerComponentType("UI.MenuBar", UI.MenuBar);