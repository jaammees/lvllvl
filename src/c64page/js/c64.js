var C64Joystick = function() {
  this.settingsDialog = null;

  this.portEnabled = [
    false,
    false
  ];

  this.mousePortEnabled = [
    false,
    false
  ];

  this.joystickKeys = [
    [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ],

    [
      false,
      'arrowup',
      false,
      'arrowleft',
      'arrowright',
      false,      
      'arrowdown',
      false,      
      'z',
      'x'
    ]  
  ];


  this.joystickButtons = [
    1, 1
  ];

  this.joystickButtonActions = [
    ['fire','up'],
    ['fire', 'up']
  ],


  // gamepad button mapping
  this.buttonMapping = [
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    C64_JOYSTICK_FIRE,
    false,
    false,
    false,
    false,
    C64_JOYSTICK_UP,
    C64_JOYSTICK_DOWN,
    C64_JOYSTICK_LEFT,
    C64_JOYSTICK_RIGHT
  ];


  this.dialogJoystickKeys = [];
  this.dialogPortEnabled = [];
  this.dialogJoystickButtons = [];
  this.dialogJoystickButtonActions = [
    ['fire', 'up'],
    ['fire', 'up']
  ];
  this.dialogGamepadPortEnabled = [];

  this.defaultGamepadPort = 1;

  this.gamepads = {};

}

C64Joystick.prototype = {
  hasMouse: function() {
    return this.mousePortEnabled[0] || this.mousePortEnabled[1];
  },
  init: function() {
    // prob should check config to see what is what.
    var _this = this;

    if(typeof UI != 'undefined') {
      UI.on('ready', function() {
        _this.loadPrefs();
      });
    } else {

    }

    var _this = this;
    window.addEventListener("gamepadconnected", function(event) {
      var buttons = [];
      for(var i = 0; i < 16; i++) {
        buttons[i] = false;
      }
      _this.gamepads[event.gamepad.id] = {
        port: false, //_this.defaultGamepadPort,
        index: event.gamepad.index,
        up: false,
        down: false,
        left: false,
        right: false,
        buttons: buttons
      };
    });
    
    window.addEventListener("gamepaddisconnected", function(event) {
      delete _this.gamepads[event.gamepad.id];
    });    

  },


  loadPrefs: function() {

    for(var i = 0; i < 2; i++) {
      var enabled = g_app.getPref('c64joystickportenabled-' + i);
      
      if(typeof enabled != 'undefined' && enabled !== null) {
        if(enabled === 'false' || enabled == 'undefined') {
          enabled = false;
        }
        if(enabled === 'true') {
          enabled = true;
        }
        this.setPortEnabled(i + 1, enabled);
      } else if(i == 1) {
        this.setPortEnabled(2, true);
      }


      var buttons = g_app.getPref('c64joystickbuttons-' + i);
      if(typeof buttons == 'undefined' || buttons == null) {
        buttons = 1;
      }

      this.setJoystickButtons(i, buttons);

      var action = g_app.getPref('c64joystickbuttonaction-' + i + '_1');
      if(typeof action == 'undefined' || action == null) {
        action = 'up';
      }

      this.setJoystickButtonAction(i, 1, action);
      

      for(var j = 0; j < this.joystickKeys[i].length; j++) {
        var key = g_app.getPref('c64joystickkey-' + i + '-' + j);
        
        if(typeof key != 'undefined' && key !== null) {
          if(key === 'false') {
            key = false;
          }
          this.joystickKeys[i][j] = key;
        }
      }


      var enabled = g_app.getPref('c64mouseportenabled-' + i);
      
      if(typeof enabled != 'undefined' && enabled !== null) {
        if(enabled === 'false' || enabled == 'undefined') {
          enabled = false;
        }
        if(enabled === 'true') {
          enabled = true;
        }
        this.setMousePortEnabled(i + 1, enabled);
      }
      
    }
  },

  savePrefs: function() {

    for(var i = 0; i < 2; i++) {
      g_app.setPref('c64joystickportenabled-' + i, this.portEnabled[i]);
      g_app.setPref('c64mouseportenabled-' + i, this.mousePortEnabled[i]);



      var buttons = g_app.getPref('c64joystickbuttons-' + i);
      if(typeof buttons == 'undefined' || buttons == null) {
        buttons = 1;
      }


      // button count
      g_app.setPref('c64joystickbuttons' + i, this.joystickButtons[i]);

      // second button action
      g_app.setPref('c64joystickbuttonaction-' + i + '_1', this.joystickButtonActions[i][1]);

      for(var j = 0; j < this.joystickKeys[i].length; j++) {
        g_app.setPref('c64joystickkey-' + i + '-' + j, this.joystickKeys[i][j]);
      }

    }

  },

  hasGamepad: function() {
    for(var key in this.gamepads) {
      return true;
    }

    return false;
  },

  setMousePortEnabled: function(port, enabled) {
    if(port == 1) {
      this.mousePortEnabled[0] = enabled;
      c64_setMousePortEnabled(0, enabled ? 1 : 0);

      if(typeof UI != 'undefined') {
        if(UI.exists('c64-mouse1')) {
          UI('c64-mouse1').setChecked(enabled);
          UI('c64debugger-mouse1').setChecked(enabled);
        }
        g_app.setPref('c64mouseportenabled-0', this.mousePortEnabled[0]);
      }
    }

    if(port == 2) {
      this.mousePortEnabled[1] = enabled;
      c64_setMousePortEnabled(1, enabled ? 1 : 0);

      if(typeof UI != 'undefined') {
        if(UI.exists('c64-mouse2')) {
          UI('c64-mouse2').setChecked(enabled);  
          UI('c64debugger-mouse2').setChecked(enabled);
        }
        g_app.setPref('c64mouseportenabled-1', this.mousePortEnabled[1]);
      }
    }

  },


  getMousePortEnabled: function(port) {
    return this.mousePortEnabled[port];

  },


  setPortEnabled: function(port, enabled) {
    if(port == 1) {
      this.portEnabled[0] = enabled;

      if(typeof UI != 'undefined') {
        if(UI.exists('c64-joystick1')) {
          UI('c64-joystick1').setChecked(enabled);
          UI('c64debugger-joystick1').setChecked(enabled);
        }
        g_app.setPref('c64joystickportenabled-0', this.portEnabled[0]);
      }
    }

    if(port == 2) {
      this.portEnabled[1] = enabled;

      if(typeof UI != 'undefined') {
        if(UI.exists('c64-joystick2')) {
          UI('c64-joystick2').setChecked(enabled);  
          UI('c64debugger-joystick2').setChecked(enabled);
        }
        g_app.setPref('c64joystickportenabled-1', this.portEnabled[1]);
      }
    }

    
    if(typeof g_app != 'undefined' && g_app.c64Debugger) {
      g_app.c64Debugger.updateJoystickInfo();
    }
    
  },

  swap: function() {
    var portEnabled = this.portEnabled[0];

    this.setPortEnabled(1, this.portEnabled[1]);
    this.setPortEnabled(2, portEnabled);

    // swap keys
    for(var i = 0; i < this.joystickKeys[0].length; i++) {
      var saveKey = this.joystickKeys[0][i];
      this.joystickKeys[0][i] = this.joystickKeys[1][i];
      this.joystickKeys[1][i] = saveKey;
    }

    // save preferences

    this.savePrefs();
  },

  buildSettingsDialog: function() {
    var _this = this;
    var width = 630;
    var height = 500;

    this.settingsDialog = UI.create("UI.Dialog", 
                                    { 
                                      "id": "c64JoystickSettings", 
                                      "title": "Joystick Settings", 
                                      "width": width, 
                                      "height": height 
                                    });


    var html = '';
    html = '<div>';

    html += '<div style="margin-bottom: 10px">';
    html += '<h3>Joystick Settings</h3>';

    html += '<div>To set a key, click on a direction and then type the key, or delete to clear.</div>';
    html += '<div>If a gamepad is connected, it will be used for an enabled port.</div>';
    html += '</div>';

    html += '<div style="position: relative">';
    for(var i = 0; i < 2; i++) {
      var port = i + 1;
      var left = 0 + 280 *i;
      html += '<div style="display: inline-block; position: absolute; left: ' + left + 'px; ';
      
      if(i == 1) {
        html += 'border-left: 1px solid #333333; padding-left: 30px';
      }
      
      html += '">';
      html += '<h3 style="border: 0">Port ' + port + '</h3>';

      /*
      html += '<div>';
      html += '<label class="cb-container">Gamepad Enabled (If available)';
      html += '<input type="checkbox" id="c64JoystickSettingsGamepadPortEnabled_' + i + '" name="c64JoystickSettingsGamepadPortEnabled" value="' + i + '">';
      html += '  <span class="checkmark"></span>';
      html += '</label>';
      html += '</div>';
      */

      html += '<div class="formGroup">';
      html += '  <label class="cb-container">Enabled';
      html += '  <input type="checkbox" id="c64JoystickSettingsPortEnabled_' + i + '" name="c64JoystickSettingsPortEnabled" value="' + i + '">';
      html += '    <span class="checkmark"></span>';
      html += '  </label>';
      html += '</div>';

      html += '<div class="formGroup">';
      html += '  <label class="rb-container" style="margin-right: 8px; margin-bottom: 0">1 Button';
      html += '  <input type="radio" checked="checked" id="c64JoystickSettingsButtons_' + i + '_1" name="c64JoystickSettingsButtons_' + i + '" value="1">';
      html += '    <span class="checkmark"></span>';
      html += '  </label>';

      html += '  <label class="rb-container" style="margin-bottom: 0px">2 Button';
      html += '  <input type="radio" id="c64JoystickSettingsButtons_' + i + '_2" name="c64JoystickSettingsButtons_' + i + '" value="2">';
      html += '    <span class="checkmark"></span>';
      html += '  </label>';
      html += '</div>';

//c64JoystickSettingsButton2Action_0
      html += '<div class="formGroup">';
      html += '  <label>Button 2 Action:</label>';
      html += '  <label class="rb-container" style="margin-right: 8px">Up';
      html += '  <input type="radio" checked="checked" id="c64JoystickSettingsButton2Action_' + i + '_Up" name="c64JoystickSettingsButton2Action_' + i + '" value="up">';
      html += '    <span class="checkmark"></span>';
      html += '  </label>';

      html += '  <label class="rb-container">Space Bar';
      html += '  <input type="radio" id="c64JoystickSettingsButton2Action_' + i + '_Space" name="c64JoystickSettingsButton2Action_' + i + '" value="space">';
      html += '    <span class="checkmark"></span>';
      html += '  </label>';

      html += '</div>';


      html += '<div class="formGroup">';

      html += '<div>Keys</div>';
      var keyIndex = 0;
      html += '<table>';
      for(var j = 0; j < 3; j++) {
        html += '<tr>';
        for(var k = 0; k < 3; k++) {
          html += '<td style="padding: 4px">';
          if(j != 1 || k != 1) {
            html += '<div tabindex="' + keyIndex + '" data-keyindex="' + keyIndex + '" data-port="' + i + '" id="c64JoystickSettings' + i + '_' + keyIndex + '" class="c64JoystickSettingsKey" ';
            html += ' style="text-align: center; width: 68px; height: 28px; background-color: #eeeeee; border: 2px solid transparent; color: #444444">ArrowUp</div>'
            keyIndex++;
          }
          html += '</td>';          
        }
        html += '</tr>';
      }


      html += '<tr>';
      html += '<td colspan="3" style="padding: 3px;">';
      html += '<div style="display: inline-block; margin-right: 10px">Button 1</div>';
      html += '<div tabindex="' + keyIndex + '" data-keyindex="' + keyIndex + '" data-port="' + i + '" id="c64JoystickSettings' + i + '_' + keyIndex + '" class="c64JoystickSettingsKey" ';
      html += ' style="text-align: center; display: inline-block; width: 68px; height: 28px; background-color: #eeeeee; border: 2px solid transparent; color: #444444">';
      html += 'ArrowUp';
      html += '</div>';
      keyIndex++;
      html += '</td>';
      html += '</tr>';

      
      html += '<tr>';
      html += '<td colspan="3" style="padding: 3px;">';
      html += '<div style="display: inline-block; margin-right: 10px">Button 2</div>';
      html += '<div tabindex="' + keyIndex + '" data-keyindex="' + keyIndex + '" data-port="' + i + '" id="c64JoystickSettings' + i + '_' + keyIndex + '" class="c64JoystickSettingsKey" ';
      html += ' style="text-align: center; display: inline-block; width: 68px; height: 28px; background-color: #eeeeee; border: 2px solid transparent; color: #444444">';
      html += 'ArrowUp';
      html += '</div>';
      keyIndex++;
      html += '</td>';
      html += '</tr>';


      html += '</table>';


      html += '</div>';

      html += '</div>';

    }
    html += '</div>';

    html += '</div>';                                 
    var htmlComponent = UI.create("UI.HTMLPanel", { "html": html });
    this.settingsDialog.add(htmlComponent);


    this.okButton = UI.create('UI.Button', { "text": "OK", "color": "primary" });
    this.okButton.on('click', function(event) { 
      _this.saveDialogButtons();
      UI.closeDialog();
    });

    this.closeButton = UI.create('UI.Button', { "text": "Cancel", "color": "secondary" });
    this.closeButton.on('click', function(event) {
      UI.closeDialog();
    });

    this.settingsDialog.addButton(this.okButton);
    this.settingsDialog.addButton(this.closeButton);

    this.initEvents();
    this.updateContent();
  },


  initEvents: function() {
    var _this = this;
    $('.c64JoystickSettingsKey').on('keydown', function(event) {

      var port = parseInt($(this).attr('data-port'), 10);
      var index = parseInt($(this).attr('data-keyindex'), 10);
      if(event.key.toLowerCase() == 'delete' || event.key.toLowerCase() == 'backspace') {
        _this.dialogJoystickKeys[port][index] = false;
      } else {
        _this.dialogJoystickKeys[port][index] = event.key.toLowerCase();
      }
      _this.updateContent();
      event.preventDefault();
    });

    $('.c64JoystickSettingsKey').on('click', function() {
      $(this).focus();

    });

    $('.c64JoystickSettingsKey').on('focus', function() {
      $('.c64JoystickSettingsKey').css('border', '2px solid transparent');
      $('.c64JoystickSettingsKey').css('color', '#444444');

      $(this).css('border', '2px solid #99aaff');
      $('.c64JoystickSettingsKey').css('color', '#222222');
    });

    $('.c64JoystickSettingsKey').on('blur', function() {
      $('.c64JoystickSettingsKey').css('border', '2px solid transparent');
      $('.c64JoystickSettingsKey').css('color', '#444444');
    });

    $('input[name=c64JoystickSettingsPortEnabled]').on('click', function() {
      var port = parseInt($(this).val());
      _this.dialogPortEnabled[port] = $(this).is(':checked');
    });

    $('input[name=c64JoystickSettingsGamepadPortEnabled]').on('click', function() {
      var port = parseInt($(this).val());
      _this.dialogGamepadPortEnabled[port] = $(this).is(':checked');
    });

    $('input[name=c64JoystickSettingsButtons_0').on('click', function() {
      var buttons = parseInt($('input[name=c64JoystickSettingsButtons_0]:checked').val(), 10);      
      _this.dialogJoystickButtons[0] = buttons;
    });

    $('input[name=c64JoystickSettingsButtons_1').on('click', function() {
      var buttons = parseInt($('input[name=c64JoystickSettingsButtons_1]:checked').val(), 10);      
      _this.dialogJoystickButtons[1] = buttons;
    });

    $('input[name=c64JoystickSettingsButton2Action_0').on('click', function() {
      var action = $('input[name=c64JoystickSettingsButton2Action_0]:checked').val();
      _this.dialogJoystickButtonActions[0][1] = action;
    });

    $('input[name=c64JoystickSettingsButton2Action_1').on('click', function() {
      var action = $('input[name=c64JoystickSettingsButton2Action_1]:checked').val();
      _this.dialogJoystickButtonActions[1][1] = action;
    });

  },

  updateContent: function() {
    for(var i = 0; i < 2; i++) {
      $('#c64JoystickSettingsPortEnabled_' + i).prop('checked', this.dialogPortEnabled[i]);

      if(this.dialogJoystickButtons[i] == 2) {
        $('#c64JoystickSettingsButtons_' + i + '_2').prop('checked', true);
      } else {
        $('#c64JoystickSettingsButtons_' + i + '_1').prop('checked', true);
      }


      if(this.dialogJoystickButtonActions[i][1] == 'space') {
        $('#c64JoystickSettingsButton2Action_' + i + '_Space').prop('checked', true);
      } else {
        $('#c64JoystickSettingsButton2Action_' + i + '_Up').prop('checked', true);
      }

      for(var j = 0; j < this.dialogJoystickKeys[i].length; j++) {
        var key = this.dialogJoystickKeys[i][j];
        if(key === false) {
          key = '';
        }
        if(key === ' ') {
          key = 'space';
        }
        $('#c64JoystickSettings' + i + '_' + j).html( key );
      }
    }

  },

  showSettingsDialog: function() {

    this.dialogJoystickKeys = [];
    for(var i = 0; i < 2; i++) {
      var keys = [];
      for(var j = 0; j < this.joystickKeys[i].length; j++) {
        keys.push(this.joystickKeys[i][j]);
      }
      this.dialogJoystickKeys.push(keys);
    }

    for(var i = 0; i < 2; i++) {
      this.dialogPortEnabled[i] = this.portEnabled[i];
      this.dialogJoystickButtons[i] = this.joystickButtons[i];
      this.dialogJoystickButtonActions[i][1] = this.joystickButtonActions[i][1];
    }

    if(this.settingsDialog == null) {
      this.buildSettingsDialog();
    }
    UI.showDialog("c64JoystickSettings");
    this.updateContent();
  },

  saveDialogButtons: function() {
    for(var i = 0; i < 2; i++) {
      for(var j = 0; j < this.joystickKeys[i].length; j++) {
        this.joystickKeys[i][j] = this.dialogJoystickKeys[i][j];
        var pref = 'c64joystickkey-' + i + '-' + j;
        console.log('set pref: ' + pref + ' to ' + this.joystickKeys[i][j]);

        g_app.setPref(pref, this.joystickKeys[i][j]);
      }
    }


    for(var i = 0; i < 2; i++) {
      this.setPortEnabled(i + 1, this.dialogPortEnabled[i]);
      g_app.setPref('c64joystickportenabled-' + i, this.dialogPortEnabled[i]);

      this.setJoystickButtons(i, this.dialogJoystickButtons[i]);
      g_app.setPref('c64joystickbuttons-' + i, this.dialogJoystickButtons[i]);

      this.setJoystickButtonAction(i, 1, this.dialogJoystickButtonActions[i][1]);
      g_app.setPref('c64joystickbuttonaction-' + i + '_1', this.dialogJoystickButtonActions[i][1]);

    }

    if(typeof g_app != 'undefined' && g_app.c64Debugger) {
      g_app.c64Debugger.updateJoystickInfo();
    }

  },

  setJoystickButtons: function(port, buttons) {
    this.joystickButtons[port] = buttons;
  },

  getJoystickButtons: function(port) {
    return this.joystickButtons[port];
  },

  setJoystickButtonAction: function(port, button, action) {
    if(typeof action == 'undefined' || action == 'undefined') {
      this.joystickButtonActions[port][button] = 'up';
    } else {
      this.joystickButtonActions[port][button] = action;
    }
  },

  getJoystickButtonAction: function(port, button) {
    return this.joystickButtonActions[port][button];
  },

  gamepadIsActive: function() {
    if(typeof g_app != 'undefined' && g_app.c64Debugger) {
      g_app.c64Debugger.hideOnscreenJoystick();
    }

    if(typeof overlayOnscreenJoystick != 'undefined' && overlayOnscreenJoystick != null) {
      overlayOnscreenJoystick.setHidden(true);
    }

  },

  //https://html5gamepad.com/for-developers
  checkGamepads: function() {
    var gamepads = navigator.getGamepads();
    if(gamepads.length == 0) {
      return;
    }
    if(gamepads[0] == null || typeof gamepads[0].axes == 'undefined') {
      return;
    }

    
    for(var key in this.gamepads) {
      var gamepad = gamepads[this.gamepads[key].index];
      var port = this.gamepads[key].port;

//      if(port === false) {
        // need to assign a port to the controller
        for(var p = 0; p < this.portEnabled.length; p++) {
          if(this.portEnabled[p]) {
            this.gamepads[key].port = p;
            port = p;
  //    }



      if(gamepad.axes[0] <= -0.5) {
        if(!this.gamepads[key].left) {
          c64_joystickPush(port, C64_JOYSTICK_LEFT);
          this.gamepadIsActive();
          this.gamepads[key].left = true;
        }
      } else {
        if(this.gamepads[key].left) {
          c64_joystickRelease(port, C64_JOYSTICK_LEFT);
          this.gamepads[key].left = false;
        }
      }


      if(gamepad.axes[0] >= 0.5) {
        if(!this.gamepads[key].right) {
          c64_joystickPush(port, C64_JOYSTICK_RIGHT);
          this.gamepadIsActive();
          this.gamepads[key].right = true;
        }
      } else {
        if(this.gamepads[key].right) {
          c64_joystickRelease(port, C64_JOYSTICK_RIGHT);
          this.gamepads[key].right = false;
        }
      }

      if(gamepad.axes[1] <= -0.5) {
        if(!this.gamepads[key].up) {
          c64_joystickPush(port, C64_JOYSTICK_UP);
          this.gamepadIsActive();
          this.gamepads[key].up = true;
        }
      } else {
        if(this.gamepads[key].up) {
          c64_joystickRelease(port, C64_JOYSTICK_UP);
          this.gamepads[key].up = false;
        }
      }


      if(gamepad.axes[1] >= 0.5) {
        if(!this.gamepads[key].down) {
          c64_joystickPush(port, C64_JOYSTICK_DOWN);
          this.gamepadIsActive();
          this.gamepads[key].down = true;
        }
      } else {
        if(this.gamepads[key].down) {
          c64_joystickRelease(port, C64_JOYSTICK_DOWN);
          this.gamepads[key].down = false;
        }
      }

      if(typeof gamepad.buttons != 'undefined') {

        for(var i = 0; i < this.buttonMapping.length; i++) {
          if(gamepad.buttons.length > i && this.buttonMapping[i] !== false) {
            var action = this.buttonMapping[i];

            if(this.joystickButtons[port] == 2 && action == C64_JOYSTICK_FIRE) {
              if(i == 1 || i == 3) {
                if(this.getJoystickButtonAction(port, 1) == 'up') {
                  action = C64_JOYSTICK_UP;
                }
                if(this.getJoystickButtonAction(port, 1) == 'space') {
                  action = 'space';
                }

              }
            }

            if(gamepad.buttons[i].pressed) {
              if(!this.gamepads[key].buttons[i]) {

                if(action == 'space') {
                  c64_keyPressed(C64_KEY_SPACE);
                } else {
                  c64_joystickPush(port, action);
                  this.gamepadIsActive();
                }
                this.gamepads[key].buttons[i] = true;
              }
            } else {
              if(this.gamepads[key].buttons[i]) {
                if(action == 'space') {
                  c64_keyReleased(C64_KEY_SPACE);
                } else {
                  c64_joystickRelease(port, action);
                }
                this.gamepads[key].buttons[i] = false;
              }
            }    
          }
        }
      }
    }
  }


    }
  },


  keyDown: function(event) {
    var joystickIndex = 1;

    event.preventDefault();

    var key = event.key.toLowerCase();

    for(var i = 0; i <= 1; i++) {
      if(this.portEnabled[i]) {
        switch(key) {
          case this.joystickKeys[i][0]:  // up/left
            return true;
            break;
          case this.joystickKeys[i][1]: // up        
            c64_joystickPush(i, C64_JOYSTICK_UP);
            return true;
            break;
          case this.joystickKeys[i][2]: // up/right
            return true;
            break;
          case this.joystickKeys[i][3]: // left
            c64_joystickPush(i, C64_JOYSTICK_LEFT);
            return true;
            break;
          case this.joystickKeys[i][4]: // right
            c64_joystickPush(i, C64_JOYSTICK_RIGHT);
            return true;
            break;
          case this.joystickKeys[i][5]: // down/left
            return true;
            break;
          case this.joystickKeys[i][6]: // down
            c64_joystickPush(i, C64_JOYSTICK_DOWN);
            return true;
            break;
          case this.joystickKeys[i][7]: // down/right            
            return true;
            break;
          case this.joystickKeys[i][8]: // button 1
            c64_joystickPush(i, C64_JOYSTICK_FIRE);
            return true;
            break;

          case this.joystickKeys[i][9]: // button 2
            if(this.joystickButtons[i] > 1) {
              if(this.joystickButtonActions[i][1] == 'space') {
                c64_keyPressed(C64_KEY_SPACE);
              } else {
                c64_joystickPush(i, C64_JOYSTICK_UP);
              }

              return true;
            }
            break;

        }
      }
    }

    return false;
  },

  keyUp: function(event) {
    var joystickIndex = 1;

    event.preventDefault();
    var key = event.key.toLowerCase();

    for(var i = 0; i <= 1; i++) {
      if(this.portEnabled[i]) {
        switch(key) {
          case this.joystickKeys[i][0]:  // up/left
            return true;
            break;
          case this.joystickKeys[i][1]: // up
            c64_joystickRelease(i, C64_JOYSTICK_UP);
            return true;
            break;
          case this.joystickKeys[i][2]: // up/right
            return true;
            break;
          case this.joystickKeys[i][3]: // left
            c64_joystickRelease(i, C64_JOYSTICK_LEFT);
            return true;
            break;
          case this.joystickKeys[i][4]: // right
            c64_joystickRelease(i, C64_JOYSTICK_RIGHT);
            return true;
            break;
          case this.joystickKeys[i][5]: // down/left
            return true;
            break;
          case this.joystickKeys[i][6]: // down
            c64_joystickRelease(i, C64_JOYSTICK_DOWN);
            return true;
            break;
          case this.joystickKeys[i][7]: // down/right            
            return true;
            break;
          case this.joystickKeys[i][8]: // fire
            c64_joystickRelease(i, C64_JOYSTICK_FIRE);
            return true;
            break;

          case this.joystickKeys[i][9]: // button 2
            if(this.joystickButtons[i] > 1) {
              if(this.joystickButtonActions[i][1] == 'space') {
                c64_keyReleased(C64_KEY_SPACE);
              } else {
                c64_joystickRelease(i, C64_JOYSTICK_UP);
              }

              return true;
            }
            break;

        }
      }
    }

    return false;
  }

}

C64_JOYSTICK_UP    =  0x1;
C64_JOYSTICK_DOWN  =  0x2;
C64_JOYSTICK_LEFT  =  0x4;
C64_JOYSTICK_RIGHT =  0x8;
C64_JOYSTICK_FIRE  =  0x10;

function elementOffset(el) {
  var rect = el.getBoundingClientRect(),
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}


var C64OnscreenJoystick = function() {
  this.debugger = null;

  this.button1X = 0;
  this.button1Y = 0;
  this.button1Radius = 0;

  this.button2X = 0;
  this.button2Y = 0;
  this.button2Radius = 0;

  this.joystickX = 0;
  this.joystickY = 0;
  this.joystickRadius1 = 0;
  this.joystickRadius2 = 0;
  this.maxRadius = 100;


  this.button1Down = false;
  this.button2Down = false;
  this.joystickDirectionDown = false;

  this.port = 2;
  this.twoButton = false;
  this.button2Function = 'up';

  this.canvas = null;

  this.id = 'c64-onscreen-joystick';
  this.showPortSelection = false;


  this.hidden = false;
}

C64OnscreenJoystick.prototype = {
  init: function(args) {
    this.debugger = args.debugger;
    this.debugger.setOnscreenJoystickPort(2);

    this.port = 2;

    if(typeof args.id != 'undefined') {
      this.id = args.id;
    }

    if(typeof args.showPortSelection != 'undefined') {
      this.showPortSelection = args.showPortSelection;
    }
  },


  setHidden: function(hidden) {
    this.hidden = hidden;
    this.draw();
  },

  getHTML: function(args) {
    var opacity = 1;
    if(typeof args != 'undefined') {
      if(typeof args.opacity != 'undefined') {
        opacity = args.opacity;
      }
    }
    var html = '';

    html += '<div id="' + this.id + '" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0">';

    if(this.showPortSelection) {
      html += '  <div>';
      html += '    <label class="rb-container" style="margin-right: 4px">Port 1';
      html += '      <input type="radio" id="mobileC64JoystickPort1" name="mobileC64JoystickPort" value="1">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';
      html += '    <label class="rb-container" style="margin-right: 4px">Port 2';
      html += '      <input type="radio" id="mobileC64JoystickPort2" name="mobileC64JoystickPort" checked="checked"  value="2">';
      html += '      <span class="checkmark"></span>';
      html += '    </label>';                
      html += '  </div>';
    }
    html += '  <canvas id="' + this.id + '-canvas"';
    if(opacity != 1) {
      html += ' style="';
      html += ' opacity: ' + opacity + ';';
      html += ' position: absolute; left: 2px; bottom: 40px; '
      html += '"';
  
    }


    
    html += '></canvas>'
    html += '</div>';

    return html;
  },

  buildInterface: function(parentPanel) {
    var html = this.getHTML();
    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "c64OnscreenJoystick", "html": html });
    parentPanel.add(this.uiComponent);

    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
    });
  },


  initEvents: function() {
    var _this = this;
    var _this = this;

    this.canvas = document.getElementById(this.id + '-canvas');

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, false);


    this.canvas.addEventListener("touchstart", function(event){
      event.preventDefault();
      _this.touchStart(event);
      

    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      _this.touchMove(event);
      return false;
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      event.preventDefault();
      _this.touchEnd(event);
    }, false);    

    if(this.showPortSelection) {
      if(typeof $ != 'undefined') {
        $('input[name=mobileC64JoystickPort]').on('click', function(event) {
          var port = $('input[name=mobileC64JoystickPort]:checked').val();
          port = parseInt(port, 10);
          if(!isNaN(port)) {
            _this.port = port;
          }
          _this.debugger.setJoystickPort(port);
        });
      }
    }
  },

  setPort: function(port) {
    this.port = port;
  },

  setType: function(type) {
    switch(type) {
      case 1:
        this.twoButton = false;
        break;
      case 2:
        this.twoButton = true;
        break;
    }
    this.draw();
  },

  setSecondButton: function(button2Function) {
    this.button2Function = button2Function;
  },
  processButtonTouches: function(touches) {
    var button1Down = false;
    var button2Down = false;

    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      var distance = (this.button1X - x) * (this.button1X - x)  
      + (this.button1Y - y) * (this.button1Y - y) ;

      if( distance  < this.button1Radius * this.button1Radius) {
        button1Down = true;
      }

      var distance = (this.button2X - x) * (this.button2X - x)  
      + (this.button2Y - y) * (this.button2Y - y) ;

      if( distance  < this.button2Radius * this.button2Radius) {
        button2Down = true;
      }
    }

    if(button1Down != this.button1Down) {
      this.button1Down = button1Down;
      if(this.button1Down) {
        this.joystickPush('fire');
      } else {
        this.joystickRelease('fire');
      }
    }

    if(button2Down != this.button2Down) {
      this.button2Down = button2Down;
      switch(this.button2Function) {
        case 'space':
          if(this.button2Down) {
            c64_keyPressed(C64_KEY_SPACE);
          } else {
            c64_keyReleased(C64_KEY_SPACE);
          }
          break;

        case 'up':
          if(this.button2Down) {
            //c64_keyPressed(C64_KEY_SPACE);
            this.joystickPush('up');
          } else {
            //c64_keyReleased(C64_KEY_SPACE);
            this.joystickRelease('up');
          }
          break;
  
      }

    }
  },

  processJoystickTouches: function(touches) {
    var currentDirection = this.joystickDirectionDown;

    this.joystickDirectionDown = false;

    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      var distance = (this.joystickX - x) * (this.joystickX - x)  
      + (this.joystickY - y) * (this.joystickY - y) ;
      distance = Math.sqrt(distance);

      if(distance > this.joystickRadius1 && distance < this.joystickRadius2) {
        var angle = Math.atan( (y - this.joystickY) / (x - this.joystickX) );

        if(x >= this.joystickX) {
          angle += Math.PI / 2;
        } else {
          angle += Math.PI  + Math.PI / 2;
        }


        for(var j = 0; j < 8; j++) {
          var sRadian = - (2 * Math.PI / 16) + j * (2 * Math.PI / 8) ;
          var eRadian = sRadian + 2 * Math.PI / 8;

          if(sRadian < 0) {
            sRadian += Math.PI * 2;
            if(angle > sRadian || angle < eRadian) {
              this.joystickDirectionDown = j;
              break;
            }
          } else {

            if(angle > sRadian && angle < eRadian) {
              this.joystickDirectionDown = j;
              break;
            }
          }

          
        }        

      }

    }

    if(this.joystickDirectionDown !== currentDirection) {

      switch(currentDirection) {
        case 0:
          this.joystickRelease('up');
          break;
        case 1:
          this.joystickRelease('up');
          this.joystickRelease('right');
          break;

        case 2:
          this.joystickRelease('right');
          break;
        case 3:
          this.joystickRelease('right');
          this.joystickRelease('down');
          break;
        case 4: 
          this.joystickRelease('down');
        break;
        case 5:
          this.joystickRelease('down');
          this.joystickRelease('left');
          break;
        case 6: 
          this.joystickRelease('left');
          break;
        case 7: 
          this.joystickRelease('left');
          this.joystickRelease('up');
          break;
      }

      switch(this.joystickDirectionDown) {
        case 0:
          this.joystickPush('up');
          break;
        case 1:
          this.joystickPush('up');
          this.joystickPush('right');
          break;

        case 2:
          this.joystickPush('right');
          break;
        case 3:
          this.joystickPush('down');
          this.joystickPush('right');
          break;
        case 4: 
          this.joystickPush('down');
        break;
        case 5:
          this.joystickPush('down');
          this.joystickPush('left');
          break;
        case 6: 
          this.joystickPush('left');
          break;
        case 7: 
          this.joystickPush('up');
          this.joystickPush('left');
          break;
      }


    }
  },

  touchStart: function(event) {
    this.hidden = false;
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();
  },

  touchMove: function(event) {
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();

  },

  touchEnd: function(event) {
    this.processButtonTouches(event.touches);
    this.processJoystickTouches(event.touches);
    this.draw();
  },


  joystickPush: function(direction) {
    switch(direction) {
      case 'up':
        //this.debugger.joystickPush(C64_JOYSTICK_UP);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_UP);
        break;
      case 'down':
        //this.debugger.joystickPush(C64_JOYSTICK_DOWN);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_DOWN);
        break;
      case 'left':
        //this.debugger.joystickPush(C64_JOYSTICK_LEFT);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_LEFT);
        break;
      case 'right':
        //this.debugger.joystickPush(C64_JOYSTICK_RIGHT);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_RIGHT);
        break;
      case 'fire':
        //this.debugger.joystickPush(C64_JOYSTICK_FIRE);
        c64_joystickPush(this.port - 1, C64_JOYSTICK_FIRE);
        break;
    }
  },

  joystickRelease: function(direction) {
    switch(direction) {
      case 'up':
        //this.debugger.joystickRelease(C64_JOYSTICK_UP);
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_UP);
        break;
      case 'down':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_DOWN);
        //this.debugger.joystickRelease(C64_JOYSTICK_DOWN);
        break;
      case 'left':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_LEFT);
        //this.debugger.joystickRelease(C64_JOYSTICK_LEFT);
        break;
      case 'right':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_RIGHT);
        //this.debugger.joystickRelease(C64_JOYSTICK_RIGHT);
        break;
      case 'fire':
        c64_joystickRelease(this.port - 1, C64_JOYSTICK_FIRE);
        //  this.debugger.joystickRelease(C64_JOYSTICK_FIRE);
        break;
    }
  },


  layout: function() {
    var holder = document.getElementById(this.id);
    if(!holder) {
      return;
    }

    if(this.canvas == null) {
      return;
    }

    var canvasWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    
    this.canvas.width = canvasWidth;

    /*
    this.canvas.height = 300;

    if(holder.clientHeight != 0) {
      this.canvas.height = holder.clientHeight;
    }
    */


    
    
    this.joystickRadius1 = 44;
    this.joystickRadius2 = 80;

    if(this.joystickRadius2 > this.maxRadius) {
      this.joystickRadius2 = this.maxRadius;
      if(this.joystickRadius2 - this.joystickRadius1 < 30) {
        this.joystickRadius1 = this.joystickRadius2 - 30;
      }
    }

    var portSelectionSize = 0;
    if(this.showPortSelection) {
      portSelectionSize = 30;
    }

    this.joystickX = this.joystickRadius2 + 20;//100;
    this.canvas.height = 2 * this.joystickRadius2 + 20;


    var yPos = this.canvas.height / 2;
    this.joystickY = yPos;

    if(this.twoButton) {
      var buttonsStartX = canvasWidth - 40;
      var buttonRadius = 30;

      // button 2 first
      this.button2X = buttonsStartX;
      this.button2Y = yPos - 20;//yPos + 50;
      this.button2Radius = buttonRadius;

      this.button1X = buttonsStartX - buttonRadius * 2.2; //  buttonsStartX - canvasWidth - 120;
      this.button1Y = yPos - 20 + 1.8 * buttonRadius;
      this.button1Radius = buttonRadius;
    
    } else {
      this.button1X = canvasWidth - 70;
      this.button1Y = yPos;
      this.button1Radius = 40;

    }
  

    // center it??
    var topSpacing = Math.floor( 5 * (holder.clientHeight - portSelectionSize - this.canvas.height) / 8);
    if(topSpacing < 0) {
      topSpacing = 0;
    }
    this.canvas.style.marginTop = '18px';// topSpacing + 'px';

  },

  
  draw: function() {

    this.layout();

    if(this.canvas == null) {
      return;
    }
    this.context = this.canvas.getContext('2d');

    var holder = document.getElementById(this.id);
    if(!holder) {
      console.log('no holder');
      return;
    }
    var canvasWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    this.canvas.width = canvasWidth;

    this.context = this.canvas.getContext('2d');


    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    
    if(this.hidden) {
      return;
    }

    this.context.fillStyle = '#ee1111';
    if(this.button1Down) {
      this.context.fillStyle = '#991111';
    }
    this.context.beginPath();
    // x, y, r, startAngle, end angle
    this.context.arc(this.button1X, this.button1Y, this.button1Radius, 0, 2 * Math.PI);
    //this.context.stroke();
    this.context.fill();


    if(this.twoButton) {
      this.context.fillStyle = '#ee1111';
      if(this.button2Down) {
        this.context.fillStyle = '#991111';
      }
      this.context.beginPath();
      // x, y, r, startAngle, end angle
      this.context.arc(this.button2X, this.button2Y, this.button2Radius, 0, 2 * Math.PI);
      //this.context.stroke();
      this.context.fill();
    }
/*

    var x = 100;
    var y = 70;
    var outerRadius = 50;
    var innerRadius = 30;
*/
    for(var i = 0; i < 8; i++) {
      var sRadian = 0 - Math.PI / 2 - (2 * Math.PI / 16) + i * (2 * Math.PI / 8);
      var eRadian = sRadian + 2 * Math.PI / 8;
      this.context.fillStyle = '#555555';

      if(i === this.joystickDirectionDown) {
        this.context.fillStyle = '#999999';
      }

      this.context.beginPath();
      this.context.arc(this.joystickX, this.joystickY, this.joystickRadius2, sRadian, eRadian, false); // Outer: CCW
      this.context.arc(this.joystickX, this.joystickY, this.joystickRadius1, eRadian, sRadian, true); // Inner: CW
      this.context.closePath();   
      this.context.fill(); 
    }


  }
}




var C64OnscreenKeyboard = function() {
  this.debugger = null;
  this.fontImage = null;
  this.fontCanvas = null;

  this.keyPositions = [];
  this.deletePosition = {};

  this.keyIndexDown = false;

  this.keysDown = [];
  this.touchUsed = [];

  this.id = 'c64-onscreen-keyboard';
}

var C64_KEY_NONE = -1;

C64OnscreenKeyboard.prototype = {
  init: function(args) {
    this.debugger = args.debugger;
    this.initKeyboard();
  },

  getHTML: function() {
    var html = '<div style="text-align: center; position: absolute; top: 0; bottom: 0; left: 0; right: 0" id="' + this.id + '">';
    html +=  '<canvas id="c64OnscreenKeyboardCanvas" style="background-color: #440000"></canvas>'
    html += '</div>';
    return html;
  },


  buildInterface: function(parentPanel) {
    var html = this.getHTML();

    this.uiComponent = UI.create("UI.HTMLPanel", { "id": "c64OnscreenKeyboard", "html": html });
    parentPanel.add(this.uiComponent);
    this.initEvents();
    this.loadFont();

  },

  loadFont: function() {
    var _this = this;
    this.fontImage = new Image();
    this.fontImage.onload = function() {
      _this.createFontCanvas();
    }
    this.fontImage.src = c64keycharsImageData;//'images/c64keychars.png';

  },

  createFontCanvas: function() {
    var width = this.fontImage.naturalWidth;
    var height = this.fontImage.naturalHeight;

    this.fontCanvas = document.createElement('canvas');
    this.fontCanvas.width = width;
    this.fontCanvas.height = height;
    this.fontContext = this.fontCanvas.getContext('2d');

    this.fontContext.drawImage(this.fontImage, 0, 0, width, height);
    this.draw();

  },

  initEvents: function() {

    this.canvas = document.getElementById('c64OnscreenKeyboardCanvas');

    if(typeof $ != 'undefined') {
      $('#c64OnscreenKeyboardCanvas').on('contextmenu', function(e) {
        e.preventDefault();
      });
    }

    var _this = this;

    this.canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    }, false);
 

    this.canvas.addEventListener("touchstart", function(event){
      event.preventDefault();
      _this.touchStart(event);


    }, false);

    this.canvas.addEventListener("touchmove", function(event){
      event.preventDefault();
      _this.touchMove(event);
    }, false);

    this.canvas.addEventListener("touchend", function(event) {
      event.preventDefault();
      _this.touchEnd(event);
    }, false);    
  },

  processStartTouches: function(touches) {

    // these are all new touches

    var keyWasShift = false;

    var keysDown = [];
    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;

      for(var i = 0; i < this.keyPositions.length; i++) {
        var keyX = this.keyPositions[i].x;
        var keyY = this.keyPositions[i].y;
        var keyWidth = this.keyPositions[i].width;
        var keyHeight = this.keyPositions[i].height;

        if(x > keyX && x < keyX + keyWidth
           && y > keyY && y < keyY + keyHeight) {
          var keyIndex = this.keyPositions[i].keyIndex;

          if(keyIndex === C64_KEY_SHIFT_LEFT 
             || keyIndex === C64_KEY_SHIFT_RIGHT) {
            keyWasShift = false;
          }

          keysDown.push({keyIndex: keyIndex, identifier: touch.identifier});
          break;        
        }
      }
    }


    // check if shift is already down
    var shiftIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_SHIFT_LEFT 
         || this.keysDown[j] === C64_KEY_SHIFT_RIGHT) {
        shiftIsDown = true;
        break;
      }
    }

    var commodoreIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_COMMODORE ) {
        commodoreIsDown = true;
        break;
      }
    }

    var ctrlIsDown = false;
    for(var j = 0; j < this.keysDown.length; j++) {
      if(this.keysDown[j] === C64_KEY_CTRL ) {
        ctrlIsDown = true;
        break;
      }
    }



    // transfer the keys to this.keysdown
    for(var i = 0; i < keysDown.length; i++) {
      var keyIndex = keysDown[i].keyIndex;
      var found = false;
      var foundIndex = false;
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] == keysDown[i].keyIndex) {
          found = true;
          foundIndex = j;
          break;
        }
      }

      if(!found) {
        this.keyDown(keysDown[i].keyIndex);
        this.keysDown.push(keysDown[i].keyIndex);
      }

      /*
      // if shift is down and its pressed again, then release it
      if(found 
          && (keyIndex === C64_KEY_SHIFT_LEFT
              || keyIndex === C64_KEY_SHIFT_RIGHT)) {
        this.keysDown.splice(foundIndex, 1);          
        this.keyUp(keyIndex);
      }
      */
    }


    this.releaseShiftLeft = false;
    this.releaseShiftRight = false;
    this.releaseCommodore = false;
    this.releaseCtrl = false;

    if(shiftIsDown) {
      // release shift key if it was down
      // prob dont want to release if still touch on shift
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_SHIFT_LEFT) {
          this.releaseShiftLeft = true;
          this.keysDown.splice(j, 1);
          j = 0;
        }
        if(this.keysDown[j] === C64_KEY_SHIFT_RIGHT) {
          this.releaseShiftRight = true;
          this.keysDown.splice(j, 1);
          j = 0;
        }
      }
    }

    if(commodoreIsDown) {
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_COMMODORE) {
          this.releaseCommodore = true;
          this.keysDown.splice(j, 1);          
          break;
        }
      }
    }

    if(ctrlIsDown) {
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] === C64_KEY_CTRL) {
          this.releaseCtrl = true;
          this.keysDown.splice(j, 1);          
          break;
        }
      }
    }


  },

  // called on touch move and touch end
  processTouches: function(touches) {

    var keysDown = [];
    for(var i = 0; i < touches.length; i++) {
      var touch = touches[i];

      var x = touch.pageX - elementOffset(this.canvas).left;
      var y = touch.pageY - elementOffset(this.canvas).top;



      for(var i = 0; i < this.keyPositions.length; i++) {
        var keyX = this.keyPositions[i].x;
        var keyY = this.keyPositions[i].y;
        var keyWidth = this.keyPositions[i].width;
        var keyHeight = this.keyPositions[i].height;

        if(x > keyX && x < keyX + keyWidth
           && y > keyY && y < keyY + keyHeight) {
          var keyIndex = this.keyPositions[i].keyIndex;

          if(keyIndex !== C64_KEY_SHIFT_LEFT 
             && keyIndex !== C64_KEY_SHIFT_RIGHT 
             && keyIndex !== C64_KEY_COMMODORE
             && keyIndex !== C64_KEY_CTRL) {
            keysDown.push({keyIndex: keyIndex, identifier: touch.identifier});
          }
          break;        
        }
      }
    }

    // find the differences..

    var currentKeys = [];

    // first which keys released
    for(var i = 0; i < this.keysDown.length; i++) {

      if(this.keysDown[i] !== C64_KEY_SHIFT_LEFT 
         && this.keysDown[i] !== C64_KEY_SHIFT_RIGHT
         && this.keysDown[i] !== C64_KEY_COMMODORE
         && this.keysDown[i] !== C64_KEY_CTRL) {
        var found = false;
        for(var j = 0; j < keysDown.length; j++) {
          if(this.keysDown[i] == keysDown[j].keyIndex) {
            found = true;
            break;
          }
        }

        if(!found) {
          this.keyUp(this.keysDown[i]);
        } else {
          currentKeys.push(this.keysDown[i]);
        }
      } else {
        // if shift is down, keep it down
        currentKeys.push(this.keysDown[i]);
        
      }
    }

    this.keysDown = currentKeys;


    /*

    // now which keys pressed
    for(var i = 0; i < keysDown.length; i++) {
      var found = false;
      for(var j = 0; j < this.keysDown.length; j++) {
        if(this.keysDown[j] == keysDown[i].keyIndex) {
          found = true;
          break;
        }
      }

      if(!found) {
        this.keyDown(keysDown[i].keyIndex);
      }
    }

    this.keysDown = [];
    for(var i = 0; i < keysDown.length; i++) {
      this.keysDown.push(keysDown[i].keyIndex);
    }

    */
//    this.keysDown = keysDown;


  },

  keyDown: function(keyIndex) {
    c64_keyPressed(keyIndex);
  },


  keyUp: function(keyIndex) {
    c64_keyReleased(keyIndex);

  },

  touchStart: function(event) {
    var touches = event.touches;
    this.processStartTouches(event.changedTouches);
    this.draw();

  },

  touchMove: function(event) {
    this.processTouches(event.touches);
    this.draw();
  },

  touchEnd: function(event) {
    this.processTouches(event.touches);

    if(this.releaseCommodore) {
      this.keyUp(C64_KEY_COMMODORE);
      this.releaseCommodore = false;
    }

    if(this.releaseCtrl) {
      this.keyUp(C64_KEY_CTRL);
      this.releaseCtrl = false;
    }

    // check if also need to release shift
    if(this.releaseShiftLeft) {
      this.keyUp(C64_KEY_SHIFT_LEFT);
      this.releaseShiftLeft = false;
    }

    if(this.releaseShiftRight) {
      this.keyUp(C64_KEY_SHIFT_RIGHT);
      this.releaseShiftRight = false;
    }


    this.draw();

  },

  initKeyboard: function() {

    this.petsciiKeyboardFull = [
      [ 
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  

        { width: 1, keyIndex: C64_KEY_ONE,        charCode: 49,  shiftedCode: 33, altCode: -1, colorCode: 0 },   // 1
        { width: 1, keyIndex: C64_KEY_TWO,        charCode: 50,  shiftedCode: 34, altCode: -1, colorCode: 1 },   // 2
        { width: 1, keyIndex: C64_KEY_THREE,      charCode: 51,  shiftedCode: 35, altCode: -1, colorCode: 2 },   // 3
        { width: 1, keyIndex: C64_KEY_FOUR,       charCode: 52,  shiftedCode: 36, altCode: -1, colorCode: 3 },   // 4
        { width: 1, keyIndex: C64_KEY_FIVE,       charCode: 53,  shiftedCode: 37, altCode: -1, colorCode: 4 },   // 5
        { width: 1, keyIndex: C64_KEY_SIX,        charCode: 54,  shiftedCode: 38, altCode: -1, colorCode: 5 },   // 6
        { width: 1, keyIndex: C64_KEY_SEVEN,      charCode: 55,  shiftedCode: 39, altCode: -1, colorCode: 6 },   // 7
        { width: 1, keyIndex: C64_KEY_EIGHT,      charCode: 56,  shiftedCode: 40, altCode: -1, colorCode: 7 },   // 8
        { width: 1, keyIndex: C64_KEY_NINE,       charCode: 57,  shiftedCode: 41, altCode: -1 },   // 9
        { width: 1, keyIndex: C64_KEY_ZERO,       charCode: 48,  shiftedCode: 42, altCode: -1 },   // 0
        { width: 1, keyIndex: C64_KEY_PLUS,       charCode: 43,  shiftedCode: 95, altCode: -1 },  // -
        { width: 1, keyIndex: C64_KEY_MINUS,      charCode: 45,  shiftedCode: 43, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_POUND,      charCode: 28,  shiftedCode: 43, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace
      ],


      [ 
        { width: 1.5, keyIndex: 9, charCode: -1, shiftedCode: -1, altCode: -1 },  // tab
        { width: 1, keyIndex: C64_KEY_Q, charCode: 17,  shiftedCode: 81, altCode: 195 }, //q
        { width: 1, keyIndex: C64_KEY_W, charCode: 23,  shiftedCode: 87, altCode: 180 }, //w
        { width: 1, keyIndex: C64_KEY_E, charCode: 5,  shiftedCode: 69, altCode: 193 }, //e
        { width: 1, keyIndex: C64_KEY_R, charCode: 18,  shiftedCode: 82, altCode: 194 }, //r
        { width: 1, keyIndex: C64_KEY_T, charCode: 20,  shiftedCode: 84, altCode: 204 }, //t
        { width: 1, keyIndex: C64_KEY_Y, charCode: 25,  shiftedCode: 89, altCode: 185 }, //y
        { width: 1, keyIndex: C64_KEY_U, charCode: 21,  shiftedCode: 85, altCode: 202 }, //u
        { width: 1, keyIndex: C64_KEY_I, charCode: 9,  shiftedCode: 73, altCode: 203 }, //i
        { width: 1, keyIndex: C64_KEY_O, charCode: 15,  shiftedCode: 79, altCode: -1 }, //o
        { width: 1, keyIndex: C64_KEY_P, charCode: 16,  shiftedCode: 80, altCode: -1 }, //p
        { width: 1, keyIndex: C64_KEY_AT, charCode: 0, shiftedCode: 123, altCode: -1 }, //[
        { width: 1, keyIndex: C64_KEY_STAR, charCode: 42, shiftedCode: 125, altCode: -1 }, //]
        { width: 1.5, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 124, altCode: -1 } //
      ],

      [ 
        { width: 1.75, keyIndex: C64_KEY_RUN_STOP, charCode: -1, shiftedCode: -1 }, // caps lock
        { width: 1, keyIndex: C64_KEY_A, charCode: 1, shiftedCode: 65, altCode: 218 },  // a
        { width: 1, keyIndex: C64_KEY_S, charCode: 19, shiftedCode: 83, altCode: 191 },  // s
        { width: 1, keyIndex: C64_KEY_D, charCode: 4, shiftedCode: 68, altCode: 179 },  // d
        { width: 1, keyIndex: C64_KEY_F, charCode: 6, shiftedCode: 70, altCode: 196 },  // f
        { width: 1, keyIndex: C64_KEY_G, charCode: 7, shiftedCode: 71, altCode: 201 },  // g
        { width: 1, keyIndex: C64_KEY_H, charCode: 8, shiftedCode: 72, altCode: 187 },  // h
        { width: 1, keyIndex: C64_KEY_J, charCode: 10, shiftedCode: 74, altCode: 186 },  // j
        { width: 1, keyIndex: C64_KEY_K, charCode: 11, shiftedCode: 75, altCode: 205 },  // k
        { width: 1, keyIndex: C64_KEY_L, charCode: 12, shiftedCode: 76, altCode: 195 },  // l
        { width: 1, keyIndex: C64_KEY_COLON, charCode: 58, shiftedCode: 58, altCode: 195 }, // ;
        { width: 1, keyIndex: C64_KEY_SEMICOLON, charCode: 59, shiftedCode: 34, altCode: 195 }, // '
        { width: 1, keyIndex: C64_KEY_EQUALS, charCode: 61, shiftedCode: 34, altCode: 195 }, // '
        { width: 1.25, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter
      ],

      [ 
        { width: 2.25, keyIndex: C64_KEY_SHIFT_LEFT, charCode: -1, shiftedCode: -1 }, // left shift
        { width: 1, keyIndex: C64_KEY_Z,      charCode: 26, shiftedCode: 90, altCode: 192 },  // z
        { width: 1, keyIndex: C64_KEY_X,      charCode: 24, shiftedCode: 88, altCode: 217 },  // x
        { width: 1, keyIndex: C64_KEY_C,      charCode: 3, shiftedCode: 67, altCode: 197 },  // c
        { width: 1, keyIndex: C64_KEY_V,      charCode: 22, shiftedCode: 86, altCode: 195  },  // v
        { width: 1, keyIndex: C64_KEY_B,      charCode: 2, shiftedCode: 66, altCode: 200 },  // b
        { width: 1, keyIndex: C64_KEY_N,      charCode: 14, shiftedCode: 78, altCode: 188 },  // n
        { width: 1, keyIndex: C64_KEY_M,      charCode: 13, shiftedCode: 77, altCode: 206 },  // m
        { width: 1, keyIndex: C64_KEY_COMMA,  charCode: 44, shiftedCode: 60, altCode: 195 }, // ,
        { width: 1, keyIndex: C64_KEY_PERIOD, charCode: 46, shiftedCode: 62, altCode: 195 }, // .
        { width: 1, keyIndex: C64_KEY_SLASH,  charCode: 47, shiftedCode: 63, altCode: 195 }, // /
        { width: 2.75, keyIndex: C64_KEY_SHIFT_RIGHT, charCode: -1, shiftedCode: -1 }  // right shift
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_COMMODORE, charCode: -1 }, // left ctrl
        { width: 1.25, keyIndex: 91 }, // left windows
        { width: 1.5, keyIndex: 18 },  // left alt
        { width: 6.5, keyIndex: C64_KEY_SPACE, charCode: 32, shiftedCode: 32, altCode: 32 }, // space
        { width: 1.5, keyIndex: 18 },  // right alt
        { width: 1.25, keyIndex: 92 },  // right windows
        { width: 1.5, keyIndex: 17 }   // right ctrl
      ]    
    ];

    this.petsciiKeyboardSmall = [

      [ 
        /*
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  
        */
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 31, altCode: -1  },  // `  
        { width: 1, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 94, altCode: -1 }, //

        { width: 1.5, keyIndex: C64_KEY_F1, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 0 },   // 1
        { width: 1.5, keyIndex: C64_KEY_F3, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 1 },   // 2
        { width: 1.5, keyIndex: C64_KEY_F5, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 2 },   // 3
        { width: 1.5, keyIndex: C64_KEY_F7, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4
        { width: 2, keyIndex: C64_KEY_RESTORE, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4

        { width: 2, keyIndex: C64_KEY_INS_DEL, charCode: -1,  shiftedCode: -1, altCode: -1 },  // =
/*        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace */

      ],

      [ 
        /*
        { width: 1, keyIndex: C64_KEY_ARROW_LEFT, charCode: 31, shiftedCode: 126, altCode: -1  },  // `  
        */
        { width: 1, keyIndex: C64_KEY_ONE,        charCode: 49,  shiftedCode: 33, altCode: -1, colorCode: 0 },   // 1
        { width: 1, keyIndex: C64_KEY_TWO,        charCode: 50,  shiftedCode: 34, altCode: -1, colorCode: 1 },   // 2
        { width: 1, keyIndex: C64_KEY_THREE,      charCode: 51,  shiftedCode: 35, altCode: -1, colorCode: 2 },   // 3
        { width: 1, keyIndex: C64_KEY_FOUR,       charCode: 52,  shiftedCode: 36, altCode: -1, colorCode: 3 },   // 4
        { width: 1, keyIndex: C64_KEY_FIVE,       charCode: 53,  shiftedCode: 37, altCode: -1, colorCode: 4 },   // 5
        { width: 1, keyIndex: C64_KEY_SIX,        charCode: 54,  shiftedCode: 38, altCode: -1, colorCode: 5 },   // 6
        { width: 1, keyIndex: C64_KEY_SEVEN,      charCode: 55,  shiftedCode: 39, altCode: -1, colorCode: 6 },   // 7
        { width: 1, keyIndex: C64_KEY_EIGHT,      charCode: 56,  shiftedCode: 40, altCode: -1, colorCode: 7 },   // 8
        { width: 1, keyIndex: C64_KEY_NINE,       charCode: 57,  shiftedCode: 41, altCode: -1 },   // 9
        { width: 1, keyIndex: C64_KEY_ZERO,       charCode: 48,  shiftedCode: -1, altCode: -1 },   // 0
        { width: 1, keyIndex: C64_KEY_PLUS,       charCode: 43,  shiftedCode: 91, altCode: -1 },  // -
        { width: 1, keyIndex: C64_KEY_MINUS,      charCode: 45,  shiftedCode: 93, altCode: -1 },  // =
        { width: 1, keyIndex: C64_KEY_POUND,      charCode: 28,  shiftedCode: 105, altCode: -1 },  // =
/*        { width: 1, keyIndex: C64_KEY_INS_DEL,    charCode: -1,   shiftedCode: -1 }     // backspace */

      ],


      [ 
        /*
        { width: 1.5, keyIndex: 9, charCode: -1, shiftedCode: -1, altCode: -1 },  // tab
        */
        { width: 0.5, keyIndex: C64_KEY_NONE, charCode: -1,  shiftedCode: -1, altCode: -1 }, //q

        { width: 1, keyIndex: C64_KEY_Q, charCode: 17,  shiftedCode: 81, altCode: 107 }, //q
        { width: 1, keyIndex: C64_KEY_W, charCode: 23,  shiftedCode: 87, altCode: 115 }, //w
        { width: 1, keyIndex: C64_KEY_E, charCode: 5,   shiftedCode: 69, altCode: 113 }, //e
        { width: 1, keyIndex: C64_KEY_R, charCode: 18,  shiftedCode: 82, altCode: 114 }, //r
        { width: 1, keyIndex: C64_KEY_T, charCode: 20,  shiftedCode: 84, altCode: 99 }, //t
        { width: 1, keyIndex: C64_KEY_Y, charCode: 25,  shiftedCode: 89, altCode: 119 }, //y
        { width: 1, keyIndex: C64_KEY_U, charCode: 21,  shiftedCode: 85, altCode: 120 }, //u
        { width: 1, keyIndex: C64_KEY_I, charCode: 9,  shiftedCode: 73, altCode: 98 }, //i
        { width: 1, keyIndex: C64_KEY_O, charCode: 15,  shiftedCode: 79, altCode: 121 }, //o
        { width: 1, keyIndex: C64_KEY_P, charCode: 16,  shiftedCode: 80, altCode: 111 }, //p
        { width: 1, keyIndex: C64_KEY_AT, charCode: 0, shiftedCode: 122, altCode: 100 }, //[
        { width: 1, keyIndex: C64_KEY_STAR, charCode: 42, shiftedCode: 70, altCode: 95 }, //]


        { width: 0.5, keyIndex: C64_KEY_NONE, charCode: -1,  shiftedCode: -1, altCode: -1 }, //q

        /*
        { width: 1.5, keyIndex: C64_KEY_ARROW_UP, charCode: 30, shiftedCode: 124, altCode: -1 } //
        */
      ],

      [ 
        { width: 1, keyIndex: C64_KEY_RUN_STOP, charCode: -1, shiftedCode: -1 }, // caps lock
        { width: 1, keyIndex: C64_KEY_A, charCode: 1, shiftedCode: 65, altCode: 112 },  // a
        { width: 1, keyIndex: C64_KEY_S, charCode: 19, shiftedCode: 83, altCode: 110 },  // s
        { width: 1, keyIndex: C64_KEY_D, charCode: 4, shiftedCode: 68, altCode: 108 },  // d
        { width: 1, keyIndex: C64_KEY_F, charCode: 6, shiftedCode: 70, altCode: 123 },  // f
        { width: 1, keyIndex: C64_KEY_G, charCode: 7, shiftedCode: 71, altCode: 101 },  // g
        { width: 1, keyIndex: C64_KEY_H, charCode: 8, shiftedCode: 72, altCode: 116 },  // h
        { width: 1, keyIndex: C64_KEY_J, charCode: 10, shiftedCode: 74, altCode: 117 },  // j
        { width: 1, keyIndex: C64_KEY_K, charCode: 11, shiftedCode: 75, altCode: 97 },  // k
        { width: 1, keyIndex: C64_KEY_L, charCode: 12, shiftedCode: 76, altCode: 118 },  // l
        { width: 1, keyIndex: C64_KEY_COLON, charCode: 58, shiftedCode: 27, altCode: 27 }, // ;
        { width: 1, keyIndex: C64_KEY_SEMICOLON, charCode: 59, shiftedCode: 29, altCode: 29 }, // '
        { width: 1, keyIndex: C64_KEY_EQUALS, charCode: 61, shiftedCode: 61, altCode: 61 }, // '
        /*
        { width: 1.25, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter
        */
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_SHIFT_LEFT, charCode: -1, shiftedCode: -1 }, // left shift
        { width: 1, keyIndex: C64_KEY_Z,      charCode: 26, shiftedCode: 90, altCode: 109 },  // z
        { width: 1, keyIndex: C64_KEY_X,      charCode: 24, shiftedCode: 88, altCode: 125 },  // x
        { width: 1, keyIndex: C64_KEY_C,      charCode: 3, shiftedCode: 67, altCode: 124 },  // c
        { width: 1, keyIndex: C64_KEY_V,      charCode: 22, shiftedCode: 86, altCode: 126  },  // v
        { width: 1, keyIndex: C64_KEY_B,      charCode: 2, shiftedCode: 66, altCode: 127 },  // b
        { width: 1, keyIndex: C64_KEY_N,      charCode: 14, shiftedCode: 78, altCode: 106 },  // n
        { width: 1, keyIndex: C64_KEY_M,      charCode: 13, shiftedCode: 77, altCode: 103 },  // m
        { width: 1, keyIndex: C64_KEY_COMMA,  charCode: 44, shiftedCode: 60, altCode: 60 }, // ,
        { width: 1, keyIndex: C64_KEY_PERIOD, charCode: 46, shiftedCode: 62, altCode: 62 }, // .
        { width: 1, keyIndex: C64_KEY_SLASH,  charCode: 47, shiftedCode: 63, altCode: 63 }, // /

        { width: 1.5, keyIndex: C64_KEY_RETURN, charCode: -1, shiftedCode: -1 } // enter

        /*
        { width: 1.5, keyIndex: C64_KEY_INS_DEL, charCode: -1,   shiftedCode: -1 }
        */
        /*
        { width: 2.75, keyIndex: C64_KEY_SHIFT_RIGHT, charCode: -1, shiftedCode: -1 }  // right shift
        */
      ],

      [ 
        { width: 1.5, keyIndex: C64_KEY_COMMODORE, charCode: -1 }, // left commodore
        { width: 1.25, keyIndex: C64_KEY_CTRL, charCode: -1 }, // left ctrl
//        { width: 1.5, keyIndex: -1 },  // left alt
        { width: 6.5, keyIndex: C64_KEY_SPACE, charCode: 32, shiftedCode: 32, altCode: 32 }, // space
//        { width: 1.5, keyIndex: -1 },  // right alt
//        { width: 1.25, keyIndex: -1 },  // right windows

//        { width: 1.25, keyIndex: C64_KEY_INS_DEL, charCode: -1,   shiftedCode: -1 }

        /*
        { width: 1.5, keyIndex: 17 }   // right ctrl
        */
      ]    
    ];

    this.keyboard = this.petsciiKeyboardSmall;
  },

  draw: function() {

    if(this.fontCanvas == null) {
      return;
    }


    var index = 0;
    if(this.keyPositions.length == 0) {

      for(var i = 0; i < 256; i++) {
        this.keyPositions[i] = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }
    }

    this.context = this.canvas.getContext('2d');

    var keys = this.keyboard;


    var charHeight = 8;//tileSet.charHeight;
    var charWidth = 8;//tileSet.charWidth;

    var scale = 1;


  //  var screenWidth = UI.getScreenWidth() - 4;
    var holder = document.getElementById(this.id);
    if(!holder) {
      console.log('no holder');
      return;
    }
    var screenWidth = holder.clientWidth - 4; //UI.getScreenWidth() - 4;
    var screenHeight = holder.clientHeight - 4;

    var maxKeyWidth = Math.floor(screenWidth / 15);
    if(keyWidth * scale > maxKeyWidth) {
      keyWidth = Math.floor(maxKeyWidth / scale);
    }

    
    var minKeyHeight = Math.floor(charHeight * 1.8);
    var minKeyWidth = Math.floor(charWidth * 1.8);

    var keysAcross = 13;
//    var screenWidth =  UI.getScreenWidth() - 4;
    var keyWidth = Math.floor(screenWidth / keysAcross);
    var keyHeight = keyWidth;
    
    if(keyHeight * 6 > screenHeight) {
      keyHeight = Math.floor(screenHeight / 6);
      if(keyWidth > 1.35 * keyHeight) {
        keyWidth = Math.floor(1.35 * keyHeight);
      }
    }



    if(scale == 1) {
//      keyHeight = Math.floor(charHeight * 1.4);
//      keyWidth = Math.floor(charWidth * 1.4);
    }

    if(keyHeight > keyWidth) {
      keyWidth = keyHeight;
    }

    if(keyWidth < charWidth) {
      // too narrow..
      keyWidth = charWidth;
    }
//    keyHeight = keyWidth;


    var keyboardHeight = keyHeight * 7.5;
    var keyboardWidth = keyWidth * 13;
    this.canvas.height = keyboardHeight * scale + 1;
    this.canvas.width =  keyboardWidth * scale + 1;
    this.context = this.canvas.getContext('2d');

    /*
    this.deletePosition.x = keyboardWidth - (keyWidth * 2);
    this.deletePosition.y = keyHeight * 0.2;
    this.deletePosition.width = keyWidth * 2;
    this.deletePosition.height = keyHeight;
*/

    this.shiftDown = false;
    this.commodoreDown = false;

    for(var i = 0; i < this.keysDown.length; i++) {
      if(this.keysDown[i] == C64_KEY_SHIFT_LEFT 
          || this.keysDown[i] == C64_KEY_SHIFT_RIGHT) {
        this.shiftDown = true;
      }
      if(this.keysDown[i] == C64_KEY_COMMODORE ) {
        this.commodoreDown = true;
      }
    }

    /*
        typingKeyboardKeyHighlight: '#aaaaaa',
    typingKeyboardLines: '#333333',//#444444',
    typingKeyboardBackground: '#eeeeee',
    */

    this.context.fillStyle = '#151515';//styles.textMode.typingKeyboardBackground;
    this.context.fillRect(0, 0, this.canvas.width * scale, this.canvas.height * scale);

    this.context.fillStyle = '#aaaaaa';// styles.textMode.typingKeyboardKeyHighlight;

    var keyboardPositionY = 0;//Math.floor(keyHeight * 1.2);
    this.context.moveTo(0, keyboardPositionY);
    for(var y = 0; y < 6; y++) {
      this.context.moveTo(0, keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo(keyboardWidth * scale + 1, keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

      var x = 0;
      for(var i = 0; i < keys[y].length; i++) {

        keys[y][i].top = keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5;
        keys[y][i].left = Math.floor(x * keyWidth * scale) + 0.5;

        var keyDown = false;
        for(var j = 0; j < this.keysDown.length; j++) {
          if(this.keysDown[j] == keys[y][i].keyIndex) {
            keyDown = true;
          }
        }

        if(keyDown) {
          this.context.fillRect(
            keys[y][i].left, 
            keyboardPositionY + keys[y][i].top, 
            keyWidth * keys[y][i].width * scale, 
            keyHeight * scale);
        }

        this.keyPositions[index++] = {
          x: keys[y][i].left,
          y: keyboardPositionY + keys[y][i].top,
          width: keyWidth * keys[y][i].width * scale,
          height:  keyHeight * scale,
          keyIndex: keys[y][i].keyIndex
        };

        this.context.moveTo(
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

        this.context.lineTo( 
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor( (y + 1) * keyHeight * scale) + 0.5);
        x += keys[y][i].width;
      }
      this.context.moveTo(
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
      this.context.lineTo( 
                Math.floor(x * keyWidth * scale) + 0.5, 
                keyboardPositionY + Math.floor( (y + 1) * keyHeight * scale) + 0.5);
    }

    this.context.moveTo(
                0, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);
    this.context.lineTo(
                keyboardWidth * scale + 1, 
                keyboardPositionY + Math.floor(y * keyHeight * scale) + 0.5);

    this.context.strokeStyle = '#333333';// styles.textMode.typingKeyboardLines;
    this.context.lineWidth = 1.5;
    this.context.stroke();

    /*
    this.context.beginPath();
    this.context.rect(this.deletePosition.x,
                      this.deletePosition.y,
                      this.deletePosition.width,
                      this.deletePosition.height);
    this.context.stroke();
*/
    var x = 13; 
    var y = 13;
    var character = 4;

    var x = 0;
    var y = 0;
    for(var row = 0; row < keys.length; row++) {
      x = 0;
      y = row;
      for(var i = 0; i < keys[row].length; i++) {
        //var keyCode = keys[row][i].keyCode;

        var currentKeyWidth = keys[row][i].width * keyWidth * scale;

        var keyX = Math.floor((x) * keyWidth * scale + (currentKeyWidth - charWidth * scale) / 2);
        var keyY = keyboardPositionY + Math.floor((y) * keyHeight * scale + ((keyHeight * scale) - charHeight * scale) / 2);


        var character = this.keyboard[row][i].charCode;
        if(this.shiftDown) {
          character = this.keyboard[row][i].shiftedCode;
        }


        var color = false;
        if(this.commodoreDown) {
          character = this.keyboard[row][i].altCode;

          if(character == -1 && typeof this.keyboard[row][i].colorCode != 'undefined') {
            color = this.keyboard[row][i].colorCode;

            if(this.shiftDown) {
              color += 8;
            }
          }
        }


        if(typeof(character) == 'undefined') {
          character = -1;
        }
        if(character >= 0) {
          var charX = character % 16;
          var charY = Math.floor(character / 16);
          var srcX = charX * 8;
          var srcY = charY * 8;
          var srcWidth = 8;
          var srcHeight = 8;

          var dstX = keyX;
          var dstY = keyY;
          var dstWidth = 8;//keyWidth;
          var dstHeight = 8;//keyHeight;

          this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
            dstX, dstY, dstWidth, dstHeight);  
    
        } else {

          var keyIndex = this.keyboard[row][i].keyIndex;
          var chars = [];

          if(keyIndex == C64_KEY_F1 || keyIndex == C64_KEY_F3 || keyIndex == C64_KEY_F5 || keyIndex == C64_KEY_F7) {
            chars.push(6);
            var character = 49;
            switch(keyIndex) {
              case C64_KEY_F3:
                character += 2;
              break;
              case C64_KEY_F5:
                character += 4;
              break;
              case C64_KEY_F7:
                character += 6;
              break;
            }
            if(this.shiftDown) {
              character++;
            }
            
            chars.push(character);

          }

          if(keyIndex == C64_KEY_COMMODORE) {
            chars.push(3);
            chars.push(61);
          }

          if(keyIndex == C64_KEY_CTRL) {
            chars.push(3);
            chars.push(20);
            chars.push(18);
            chars.push(12);
          }

          if(keyIndex == C64_KEY_SHIFT_LEFT) {
            chars.push(19);
            chars.push(8);
            chars.push(6);
            chars.push(20);

          }

          if(keyIndex == C64_KEY_RESTORE) {
            chars.push(18);
            chars.push(19);
            chars.push(20);
            chars.push(18);
          }

          if(keyIndex == C64_KEY_INS_DEL) {
            chars.push(4);
            chars.push(5);
            chars.push(12);

          }

          if(keyIndex == C64_KEY_RETURN) {
            chars.push(18);
            chars.push(20);
            chars.push(14);

          }

          if(keyIndex == C64_KEY_RUN_STOP) {
            chars.push(18);
            chars.push(47);
            chars.push(19);
          }

          var keyX = Math.floor((x) * keyWidth * scale + (currentKeyWidth - chars.length * charWidth * scale) / 2);

          for(var k = 0; k < chars.length; k++) {
            character = chars[k];

            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX + k * 8;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;


            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

          }


/*          
          if(keyIndex == C64_KEY_F1 || keyIndex == C64_KEY_F3 || keyIndex == C64_KEY_F5 || keyIndex == C64_KEY_F7) {
            character = 6;
            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;

            keyX += 8;

            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

            character = 49
            switch(keyIndex) {
              case C64_KEY_F3:
                character += 2;
              break;
              case C64_KEY_F5:
                character += 4;
              break;
              case C64_KEY_F7:
                character += 6;
              break;
            }
            var charX = character % 16;
            var charY = Math.floor(character / 16);
            var srcX = charX * 8;
            var srcY = charY * 8;
            var srcWidth = 8;
            var srcHeight = 8;

            var dstX = keyX;
            var dstY = keyY;
            var dstWidth = 8;//keyWidth;
            var dstHeight = 8;//keyHeight;

            this.context.drawImage(this.fontCanvas, srcX, srcY, srcWidth, srcHeight,
              dstX, dstY, dstWidth, dstHeight);  

          }
*/
          /*
          keyIndex: C64_KEY_F1, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 0 },   // 1
        { width: 1.5, keyIndex: C64_KEY_F3, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 1 },   // 2
        { width: 1.5, keyIndex: C64_KEY_F5, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 2 },   // 3
        { width: 1.5, keyIndex: C64_KEY_F7, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4
        { width: 2, keyIndex: C64_KEY_RESTORE, charCode: -1,  shiftedCode: -1, altCode: -1, colorCode: 3 },   // 4

        { width: 2, keyIndex: C64_KEY_INS_DEL, charCode: -1,  shiftedCode: -1, altCode: -1 },  // =
        */
//          this.context.fillStyle = '#993322';
//          this.context.fillRect(keyX, keyY, keyWidth, keyHeight);
        }



/*
        var highlight = false;
        if(character >= 0) {
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": character, "colorRGB": 0x666666, "highlight": highlight, "scale": scale })          
        } else if(color !== false) {
          var colorHex = 0x334455;
          tileSet.drawCharacter({"imageData": imageData, "x": keyX, "y": keyY, "character": -1, "colorRGB": colorHex, "highlight": highlight, "scale": scale })                    
        }

*/
        x += keys[row][i].width;
      } 
    }


//    this.context.putImageData(imageData, 0, 0);
  }
}


var c64keycharsImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAOk0lEQVR4Xu2d4XYbuw2Em/d/6PTIp+tSEIBvBqQs21H/9MZcgsBgMABXcvLnP//739+/f/9e/337/z9//vxZ/3z77+uZuBb3Zvs7+3R2Zn89g9ZX36+Y1hhiXFmc5GN3BtmvcI25qXwm+51vH0neMaDsJ/vregd+RsqOmBWAjj9rEVCiKl9OxXeRfiXjDZPqzxdeXbwPBIjGTic4qsrEvqpMXQV1iSWlq4hIBMjUxyFwhl0kQKbixwgQHYgMq1oIVY5akQQgrWfVksmjYidLhkIAp7VmBL5htcZxnAAnKpQSShW8u3/X/ndVAGUGcBU8nQEuJis9ZCLhXYJ/4gzg9PhT8XVnUgGt65+TfjflqgarFpDJbMZmkl5qQUpvzs6g+Mj/uF7dkqignPgcAnT+P1z1qt72/vnvROCuBZyq4JsdelfQKUCsUqpQdz22LXd/9XxVwYqCZAPfaq9T6B1qSu8BTgFUSaAaPEmoun6aADR0VreDbN8ag3tjUG5b0eZLCFAxVp2+dwnZDa7TGcElsUKaDCfCiOaolgBVC1ABn7YQFzzVn0wRsns0na9KeFeBylqHX+djbA9VC80IVV4Ds/5DEluxT2U7sZvOp/UUgP995qH0WCWJp15XuyrZtZmKILc9EgGoApx7sOKoe41S/fsIePDunBSCei/NANW7gZMzQOWjTIAIwgVm10+du74KUqcyqoLEs6ilqASIVavET/Kd4b5i3yl1przpDFDJzfvnPwsBRYkeSOqEqFYYVZRqp6u8a5hzKoQqedKeHPy+47PWm0A1cRMCZFJIQ526rsokVdA0foV4X02Oz1icgycAdBNoHMq6d/kE4rOn+Gef7+Rh99k1j0cUgBwiRVildzLkxf0KkbIBqRquOgVxCN4NiR2G6qBIechanEUA5YAK2GqvetVx7uArYCoZSP5/gwJkMT6dABnrKkVYSVJ9+cGxpyafkkvrisJ1AybZVwvPKZJPpVWNKwFUtnYBqiZ+5xNFNU51zlHtOc+pKqTirBDrSxTAAeFffXY3+VPcpG8EKUyiKZzWJ4OW8qZtVa5uCCP/aH2agG5mUluYMvNU/ksfBxMBSOJpPUv+7Wf0/YHKLzrv9Prp5KuJr8jjfJYi/V5ArCJykOSM+uzngFJ8UreSw51NsrN3CUEFoqwrA1ynYMoZ2TMPXwlbPy0jJmXMVwNxpnxienZPVq+XEZRIvmo9knBHBahgXNtKDi58jrSA3SqsXnRUILsVS9VB9oiAboJ2CmfdOyX5uu8IAYjBuwDTflrfJcCufTpfXSeiUR6y/dItoKrQOKR1PcqZors+rUr0tDp27J9IkDLRV4pEbSnD9f0egLJ2aH1SnYeObs3YBLgFMv3e21cEVJ2hJkB9zu3j1ZxE59E6xUuYWwQgeZo62znZDYgkeatd1Tf1ua8mwCRWSv6HTeWhlb3dFDoBjxJM/tE7CXfAmsQQz8iSVRWPch4VXkb0yweyf/e3S2Rgx2/Rxme6+3xFHEpqRzJn7wkFcMBX4p28W4l2qQWvBPz2BFAreNrr1NfJlVI4t5dMCYjMlKCuupU1si+3AIWFdNi0ert91EJ2CaDI+05cLmaZInUqRfZlAmRAT+VsB7DpXgJCmRVUG46PKoGrat9VGJkASlDPAEg5V3lG9a17TrWh+EPt4lpX+v3a8+PZ5LM0BDoBUa/OPmwiJ5UWcEKNVD+IJJQ0GpwVDNWcoMLgA8YvT5Lj2Xr36aMSpNoTlWFulwB0Y8jsq2euM5g7OHc5LlvA6lhlQHWkdWD5ZU3VXiVz8efqZxUxCZSULpFdTybl6KTcJUAV0wNGVLXdewA1YacJQFUfgaQE0zr1VVLRTsmcW4pCIIWAd898BQFW9mYOUsWteyop7yReTbDqh6MAKjmUYqr8iwXhEGW7BVCA2cBDFUqkrPZPW8C1b4cAkeTqx9HqmdQCspZNw+gHjgR21Uepv152s+l8OrFT5WU+kf8x+ZXfmQpVSSbgVXJQ66l8Ukj1+YxKgK6P7a4pDlcVQLKoSKvrv+rvNIFflZNbHPgiqOutCnBOi8jsEdhqf3eS0c0cVZtR7FMshOfu/sz+0wlAQdE6Bf1KAnTq0rWrqSoRFoTlryRANcARWLRezQbKjOC2KzVxqs+qvdtzP14BXkEApYJpYFWJ5LSjic1tAuz2eGIrsX63BUTQKnsuuFMCdDMXYe36eEQByCmlWjoSfCcCOLFMZ4CdoZuwesoM8GoCnGoBpyq/8qeaC6rbw6SaVdVZz3x5CyACqUC4rYCeX/1yKv/XESAbQiaATCfjSSJUUtH88dEjk38/Udk3keMVo4z4SoVXb1mrQkIFeBPg8R/QfBPgYFVQpewqAFUwqQXtr8hAcdG+lygAgaEwX3km+4SQPkBx5HhCGsVv55lTBEgn96UA6dZA63ct4E0AJ8X9sxWWrqJkdlwbWRv/VJhn93iyT5UyqebJHlWS43OKct1du4bt8xQ1HxSBEuQcrCbzJ7WA06q4U71OLlRCpy1g6uSbAJyiKbZsWXviQQGqpHW9hwYLus/GdffueoWqEi4bILM2Ub0cov3ZxL7GGL+VRH+u2kzls2Kv/BbWzeiOgRWcCkCyv67HZzP7CkBZ3536FxPctQXyn9aVqT+20OrPSrwfvxmUJWCHwZRwSuDufrJP61mSFCJWz6gKN7k5rPmLcR0nAB2QDZQKcJRwFcDYGrLKnQ6gShwKAZzWWvnfFW2Wgw7fBwXoJEhhlNIS3AqsKlKVZpVg3QxwigCrsk79j77sKHhKgF3Advbv9EiS0CmBKVHODHMqvu5MB//P3w7uZFY1WLWAlbGZTLsSH22QQqjn79wCstZSEafCk1rs024Bmey/f/ZvIHDXAk5VcNfnFAWgClcVSalo5RqsnldVMCnQuo9uINWgO6Xrt5gBnB6rDJmUsG6ImtinodYZIFfSujcGaoW39fRNIAF2er1iK7F/OsQpg9fODORUsDqoTjGqFKLEtnqR4LwqjeC5LeArFeCqAoUUWWI7Ce4qUFnrWnCHUYb/moNq/UOZsh5IkkZTbPeqtJPDZytAVlXV5wnPkN+sMIj8lAtHfbL4JQLQEOPcg59BANW/KwHxykYtjpJEvZdmgEqNTpJQagFUuRFotSdTggjg3f0k96cIECssa6OxhZB8R2ymLejCMB0CM2l4/+znIaAo0UNLUaqeKpQqiNZd+xmbuyn+ZB918PoJFMK/KNIZMtSW0Enyet7UnjJxu/3VmV3UYfaVBLl8fDoBuitIHMqU6iJwpz1Slc9nnf+VZLgb2hXQSaLJeaUFKBKuVPZFKvLJaQudCjoE74bEzl91UFRifsiFQwDlgArYaq8qxUryszu9Gt+/oABp61UBmiS/Uo5KEbL+n/VeUhQ1ma4KkPx3Hz51M8Suwir72/cAanJPAasCuQbWvZpewZ3KLIE4jV3FViEI2XJx/TjzKxSAHH+vP/5L6V+FifSNIKqOrAIf3jiFX4nqiKe0iDjsdUOkMkTREErrpxK2nqMWp7Kn8l/6PgARwO3JykC3Jpjkd/f83f2nk68mXp1huvik3wuIFU4OugmLBLv+XH1SV1U/+VX12VMEmMZN/V9RMCrSlSyrnw9fCes+HqYAnUC6oY7OUVqEer0k8lXrkYQ7KkDxurYVhf0srizho2my+KdlMueVBEYVqBickc71nxRAlVo3UV1M2Vq0PyX5XfGdIAAxeBdg2k/rJI+0n9bJ/ql1IhjlIS3Gqs9mEl0xUOlRzhSdBUL7ad1pT5m8K/ZPJGg9R5lpnPksxVU9hIJ7r/cITKrzKzC1XwTdAqlI812DpOpXezElhOLvlO00ppUqP8wzjgKQPBEABGA3MFZ7Vf9V39TnlOFWGR7pPMJ8gtkd4V0A183V2z7VZuxfE4KoZxHQ6qDW+dglq1pT/HJIEJ8l+/g3ha63hCz46Yc0arLVBJM9AqIigAO+Quhp0Sh+ZM9Q3C8nwG6CqdfFWw6dFwGbTP+VT+69vWohdEuhohy1AOW6QWyjKp2sP5sAURky8Cd+T1tOV+UdMcohkyoiA+D62VTOdgCb7lXJ2T2n2nB8VAl8V7XFXzY5URj7GqgMQSqpHKB2n1WT9xMIkM0a02ukNAPsgr867Lx6Vs6tEqYmPKssIjCRxEmG46fzbKfcdzETyMqrYrLRyVxGCLJXyWHmq+O/CjCRrpoTsn3qmbGIphjFfdJbPWeqzRx7JgEyOYwzCvlfTf6TSl7jd2YkhQjKM9VwWWHwIwlAk3CsQEowrT9UTfjomwa5rlqdayq1nnhORcA7BVVYThWkyFFmwwm+6mmKxKsJViusk/KoACo5aO7oWkAsCIco2wpAAWYvJahCK0JllX+iBVSySX50FaZeyVTS0Qyw2iGbK44SATKQq8pTZMjpjdnAR6RyW0QXXzfTVElWVJXayuTcq7CIAGu8MgEUmZ8+ozhcVQBN5Iq0un6r/jpJVmwqzzix3Ozhi6Ao8S6gTotwWZ+RQgXJfa4C1ql29Uy39ThJfyAlJXSXADvOUd97NQE67LpBkTB/E2BBQK0addKfDnw02yhyr8byJsA3J4BSwc5VUVVJaqeXHcW/z0Kgh6kFkFNkn4KnqnErPypABK2y54I7JUCHN2Ht+vjRQilBbwL8/98OJqxWMk9nAMK7KxgqlnTIpqDIIWIl2d9VgKqnExikHBT3xG/yaR1qR9Wc/HYW5eflCkAOqkBQQmlI66R/QuLvogCELxKAZI0qgfZTVawBqImgoB2f1TOJYOqZygxQvQm9nUEfAD2sOwFSsijISVW8CfD3b3d1pVaF67+dABQfqQXtP31nf6kCEBhU4ep6JmH0SjWTNwLf2aP6rj43VUslB09rAcrhKgDdc/8SASIOrqJkOXFtZHPYZ1txkkHJJ9a/YgbYASu7lqkJrYpp1x/KAa1Hv+5uAZRA1TjJuUO63SFwF/DTqrjrD+WA1t8EIITC+m8nwH8Bc2k1JUw12cwAAAAASUVORK5CYII=';

var C64Scripting = function() {
  this.scriptProcessor = null;
}

C64Scripting.prototype = {
  init: function() {
    var _this = this;

    this.scriptProcessor = new Scripting();
    this.scriptProcessor.init({
      outputElementId: this.outputElementId
    });
    this.scriptProcessor.registerAPI(function(interpreter, scope) {
      _this.initAPI(interpreter, scope);
    });

    this.scriptProcessor.setPrescript('c64', this.apiPreScript());

    /*
    this.scriptProcessor.on('start', function() {
      _this.scriptStart();
    });

    this.scriptProcessor.on('end', function() {
      _this.scriptEnd();
    });
    */
  },

/*
  scriptStart: function() {
    $('#' + this.prefix + 'ScriptingRun').html('Stop Script');
  },

  scriptEnd: function() {
    $('#' + this.prefix + 'ScriptingRun').html('Start Script');
  },
*/

  getCompletions:  function(line, pos) {
    var completions = [];

    completions.push({
      value: 'c64.setColor',
      meta: 'Set C64 Colour'
    });

    return completions;

  },

  apiPreScript: function() {
    var script = '';
    var lineBreak = ";";//\n";

    script += 'c64.eventHandlers = {};' + lineBreak;

    script += 'c64.on = function(eventType, callback) {' + lineBreak;
//    script += ' console.log("add event handler" + eventType);' + lineBreak;

    script += ' Editor.on("c64." + eventType, callback);' + lineBreak;
    //script += ' Editor.on("c64." + eventType, function() { console.log("HERE") });' + lineBreak;
    /*
    script += '  if(eventType === "run") { ' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  } else {' + lineBreak;
    script += '    Editor.hasEventHandlers = true;' + lineBreak;
    script += '    Editor.eventHandlers[eventType] = callback;' + lineBreak;
    script += '  }';
    */
    script += '}' + lineBreak;

    script += 'c64.rasterY = function(rasterY, callback) { ' + lineBreak;
    script += '  console.log("rastery:" + rasterY);';
    script += '}' + lineBreak;

    return script;
  },


  initAPI: function(interpreter, scope) {
    var _this = this;

    var c64Read = function(address) {//, lineNumber) {      
      return c64_cpuRead(address);
    }

    var c64Write = function(address, value) {      
      c64_cpuWrite(address, value);
    }

    var c64SetColor = function(index, r, g, b) {
      index = index & 0xf;
      var color = r & 0xff;// ( (r & 0xff) + (g & 0xff) << 8 + (b & 0xff) << 16);
      color += (g & 0xff) << 8;
      color += (b & 0xff) << 16;

      color = (color >>> 0) + 0xff000000;
      c64_setColor(index, color);
    }

    // mouse down/mouse up events
    // screen refresh?


    // Graphic Object
    var c64Obj = interpreter.createObjectProto(interpreter.OBJECT_PROTO);
    interpreter.setProperty(scope, 'c64', c64Obj);

    /*
    // Graphic.getCurrentLayerDetails
    wrapper = function() {
      var result = GraphicAPI.getCurrentLayerDetails();
      return interpreter.nativeToPseudo(result);
    }
    */
    interpreter.setProperty(c64Obj, 'cpuWrite',
                            interpreter.createNativeFunction(c64_cpuWrite, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'cpuRead',
                            interpreter.createNativeFunction(c64_cpuRead, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'getPC',
                            interpreter.createNativeFunction(c64_getPC, false), 
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setPC',
                            interpreter.createNativeFunction(c64_setPC, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);
                            
    interpreter.setProperty(c64Obj, 'setColor',
                            interpreter.createNativeFunction(c64SetColor, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(c64Obj, 'getA',
                            interpreter.createNativeFunction(c64_getRegA, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setA',
                            interpreter.createNativeFunction(c64_setRegA, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);
                            
    interpreter.setProperty(c64Obj, 'getX',
                            interpreter.createNativeFunction(c64_getRegX, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setX',
                            interpreter.createNativeFunction(c64_setRegX, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'getY',
                            interpreter.createNativeFunction(c64_getRegY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

    interpreter.setProperty(c64Obj, 'setY',
                            interpreter.createNativeFunction(c64_setRegY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);

                            
    interpreter.setProperty(c64Obj, 'getRasterY',
                            interpreter.createNativeFunction(c64_getRasterY, false),
                            Interpreter.NONENUMERABLE_DESCRIPTOR);



    interpreter.setProperty(scope, 'c64Write',
        interpreter.createNativeFunction(c64_cpuWrite, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64Read',
        interpreter.createNativeFunction(c64_cpuRead, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64GetPC',
        interpreter.createNativeFunction(c64_getPC, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetPC',
        interpreter.createNativeFunction(c64_setPC, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     


    interpreter.setProperty(scope, 'c64GetRegA',
        interpreter.createNativeFunction(c64_getRegA, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegA',
        interpreter.createNativeFunction(c64_setRegA, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     


    interpreter.setProperty(scope, 'c64GetRegX',
        interpreter.createNativeFunction(c64_getRegX, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegX',
        interpreter.createNativeFunction(c64_setRegX, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64GetRegY',
        interpreter.createNativeFunction(c64_getRegY, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64SetRegY',
        interpreter.createNativeFunction(c64_setRegY, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     



    interpreter.setProperty(scope, 'c64SetColor',
        interpreter.createNativeFunction(c64SetColor, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.     

    interpreter.setProperty(scope, 'c64_reset',
        interpreter.createNativeFunction(c64_reset, false),
        Interpreter.NONENUMERABLE_DESCRIPTOR);       // Property descriptor of non-enumerable properties.                 
  },



}

var C64Sound = function() {
  this.audioEnabled = true;
}

C64Sound.prototype = {
  init: function() {
    this.loadPrefs();
  },

  loadPrefs: function() {
    if(typeof UI != 'undefined') {
      var _this = this;
      UI.on('ready', function() {
        _this.setModel(g_app.getPref('c64sidmodel'));
      });
    }
  },

  checkAudio: function() {
    if(this.audioEnabled) {//} && !this.audioStarted) {
      // need to start the audio
//      console.log('start audio!');
      this.startAudio();      
    }
  },

  setModel: function(model) {
    switch(model) {
      case '6581':
        sid_setModel(0);
        if(typeof UI != 'undefined') {
          if(UI.exists('c64debugger-sound6581') && UI.exists('c64debugger-sound8580')) {
            UI('c64debugger-sound6581').setChecked(true);
            UI('c64debugger-sound8580').setChecked(false);
          }
          g_app.setPref('c64sidmodel', model);

        }
  
        break;
      case '8580':
        sid_setModel(1);
        if(typeof UI != 'undefined') {
          if(UI.exists('c64debugger-sound6581') && UI.exists('c64debugger-sound8580')) {
            UI('c64debugger-sound6581').setChecked(false);
            UI('c64debugger-sound8580').setChecked(true);
          }
          g_app.setPref('c64sidmodel', model);

        }
        break;
    }
  },

  toggleAudio: function() {
    if(this.audioEnabled) {
      this.stopAudio();
    } else {
      this.startAudio();
    }

    UI('c64debugger-sound').setChecked(this.audioEnabled);
  },

  getAudioEnabled: function() {
    return this.audioEnabled;
  },


  //this.audioEnabled && !this.audioStarted
  startAudio: function() {
    var AudioContext = window.AudioContext 
                       || window.webkitAudioContext 
                       || false;

    if (!AudioContext) {
      return;
    }

    var _this = this;

    this.stopAudio();

    // windows 48000 sample rate

    try {
      this.audioBufferLength = 4096; // 2048;
      this.audioCtx = new AudioContext;//new window.AudioContext();
      this.sampleRate = this.audioCtx.sampleRate;
//      console.log('sample rate = ' + this.audioCtx.sampleRate);
      sid_setSampleRate(this.sampleRate);

      this.scriptNode = this.audioCtx.createScriptProcessor(this.audioBufferLength, 0, 1);
      this.scriptNode.onaudioprocess = function(e) {
        _this.audioProcess(e);
      }
      this.scriptNode.connect(this.audioCtx.destination);

      this.audioEnabled = true;
      if(typeof UI != 'undefined') {
        UI('c64-sound').setChecked(this.audioEnabled);
      }
    } catch(err) {
      console.log(err);
      this.audioEnabled = false;
    }

  },

  stopAudio: function() {
    if (this.scriptNode) {
      this.scriptNode.disconnect(this.audioCtx.destination);
      this.scriptNode.onaudioprocess = null;
      this.scriptNode = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(function(error) {
      });
      this.audioCtx = null;
    }

    this.audioEnabled = false;
    if(typeof UI != 'undefined') {
      UI('c64-sound').setChecked(this.audioEnabled);
    }
  },

  audioProcess: function(e) {
    var outBuffer = e.outputBuffer; 
    var channelData = outBuffer.getChannelData(0);

    if(debugger_isRunning() && !document.hidden && this.lastUpdate != g_lastUpdate) {
      this.lastUpdate = g_lastUpdate;
      var ptr = sid_getAudioBuffer();

      var view = new Float32Array(c64.HEAPF32.subarray( (ptr >> 2), (ptr >> 2) + this.audioBufferLength));  

      channelData.set(view);
    } else {
      for(var i = 0; i < this.audioBufferLength; i++) {
        channelData[i] = 0;
      }
    }
  }

}

var C64Colors = function() {
  this.colors = [
    0xFF000000,
    0xFFffffff,
    0xFF383381,
    0xFFc8ce75,
    0xFF973c8e,
    0xFF4dac56,
    0xFF9b2c2e,
    0xFF71f1ed,
    0xFF29508e,
    0xFF003855,
    0xFF716cc4,
    0xFF4a4a4a,
    0xFF7b7b7b,
    0xFF9fffa9,
    0xFFeb6d70,
    0xFFb2b2b2
  ];
  
  /*
  this.colors = [
    0xff000000,
    0xffffffff,
    0xff30387f,
    0xffc2b972,
    0xffa83780,
    0xff39a561,
    0xff9c2437,
    0xff66dbcc,
    0xff215687,
    0xff014155,
    0xff646bb5,
    0xff4d4d4d,
    0xff777777,
    0xff7deda6,
    0xffd86172,
    0xffa4a4a4
  ];
  */
}

C64Colors.prototype = {
  init: function() {
  },


  setColor: function(colorIndex, color) {
    if(isNaN(colorIndex) || colorIndex < 0 || colorIndex > 15) {
      return;
    }
    this.colors[colorIndex] = color;
    if(c64_ready) {
      c64_setColor(colorIndex, color);
    }
  },

  getColor: function(colorIndex) {
    if(colorIndex < 0 || colorIndex > 15) {
      return;
    }
    return this.colors[colorIndex];
  },

  setAllColors: function() {
    if(c64_ready) {

      for(var i = 0; i < 16; i++) {
        c64_setColor(i, this.colors[i]);
      }
    }
  },

  resetColor: function(colorIndex) {
    /*
    var colors = [
      0xff000000,
      0xffffffff,
      0xff30387f,
      0xffc2b972,
      0xffa83780,
      0xff39a561,
      0xff9c2437,
      0xff66dbcc,
      0xff215687,
      0xff014155,
      0xff646bb5,
      0xff4d4d4d,
      0xff777777,
      0xff7deda6,
      0xffd86172,
      0xffa4a4a4
    ];
*/
    var colors = [
      0xFF000000,
      0xFFffffff,
      0xFF383381,
      0xFFc8ce75,
      0xFF973c8e,
      0xFF4dac56,
      0xFF9b2c2e,
      0xFF71f1ed,
      0xFF29508e,
      0xFF003855,
      0xFF716cc4,
      0xFF4a4a4a,
      0xFF7b7b7b,
      0xFF9fffa9,
      0xFFeb6d70,
      0xFFb2b2b2
    ];
      
    this.setColor(colorIndex, colors[colorIndex]);

  },

  resetColors: function() {
    this.colors = [
      0xFF000000,
      0xFFffffff,
      0xFF383381,
      0xFFc8ce75,
      0xFF973c8e,
      0xFF4dac56,
      0xFF9b2c2e,
      0xFF71f1ed,
      0xFF29508e,
      0xFF003855,
      0xFF716cc4,
      0xFF4a4a4a,
      0xFF7b7b7b,
      0xFF9fffa9,
      0xFFeb6d70,
      0xFFb2b2b2
    ];
     /* 
    this.colors = [
      0xff000000,
      0xffffffff,
      0xff30387f,
      0xffc2b972,
      0xffa83780,
      0xff39a561,
      0xff9c2437,
      0xff66dbcc,
      0xff215687,
      0xff014155,
      0xff646bb5,
      0xff4d4d4d,
      0xff777777,
      0xff7deda6,
      0xffd86172,
      0xffa4a4a4
    ];
*/
    this.setAllColors();
  }
}



var C64 = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(C64) {
  C64 = C64 || {};

var Module=typeof C64!=="undefined"?C64:{};var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}var arguments_=[];var thisProgram="./this.program";var quit_=function(status,toThrow){throw toThrow};var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_HAS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_HAS_NODE=typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string";ENVIRONMENT_IS_NODE=ENVIRONMENT_HAS_NODE&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary,setWindowTitle;var nodeFS;var nodePath;if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";read_=function shell_read(filename,binary){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);return nodeFS["readFileSync"](filename,binary?null:"utf8")};readBinary=function readBinary(filename){var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){thisProgram=process["argv"][1].replace(/\\/g,"/")}arguments_=process["argv"].slice(2);process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",abort);quit_=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){read_=function shell_read(f){return read(f)}}readBinary=function readBinary(f){var data;if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){arguments_=scriptArgs}else if(typeof arguments!="undefined"){arguments_=arguments}if(typeof quit==="function"){quit_=function(status){quit(status)}}if(typeof print!=="undefined"){if(typeof console==="undefined")console={};console.log=print;console.warn=console.error=typeof printErr!=="undefined"?printErr:print}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(_scriptDir){scriptDirectory=_scriptDir}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}{read_=function shell_read(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=function readBinary(url){var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}setWindowTitle=function(title){document.title=title}}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var STACK_ALIGN=16;function dynamicAlloc(size){var ret=HEAP32[DYNAMICTOP_PTR>>2];var end=ret+size+15&-16;if(end>_emscripten_get_heap_size()){abort()}HEAP32[DYNAMICTOP_PTR>>2]=end;return ret}function getNativeTypeSize(type){switch(type){case"i1":case"i8":return 1;case"i16":return 2;case"i32":return 4;case"i64":return 8;case"float":return 4;case"double":return 8;default:{if(type[type.length-1]==="*"){return 4}else if(type[0]==="i"){var bits=parseInt(type.substr(1));assert(bits%8===0,"getNativeTypeSize invalid bits "+bits+", type "+type);return bits/8}else{return 0}}}}function warnOnce(text){if(!warnOnce.shown)warnOnce.shown={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;err(text)}}function convertJsFunctionToWasm(func,sig){if(typeof WebAssembly.Function==="function"){var typeNames={"i":"i32","j":"i64","f":"f32","d":"f64"};var type={parameters:[],results:sig[0]=="v"?[]:[typeNames[sig[0]]]};for(var i=1;i<sig.length;++i){type.parameters.push(typeNames[sig[i]])}return new WebAssembly.Function(type,func)}var typeSection=[1,0,1,96];var sigRet=sig.slice(0,1);var sigParam=sig.slice(1);var typeCodes={"i":127,"j":126,"f":125,"d":124};typeSection.push(sigParam.length);for(var i=0;i<sigParam.length;++i){typeSection.push(typeCodes[sigParam[i]])}if(sigRet=="v"){typeSection.push(0)}else{typeSection=typeSection.concat([1,typeCodes[sigRet]])}typeSection[1]=typeSection.length-2;var bytes=new Uint8Array([0,97,115,109,1,0,0,0].concat(typeSection,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));var module=new WebAssembly.Module(bytes);var instance=new WebAssembly.Instance(module,{"e":{"f":func}});var wrappedFunc=instance.exports["f"];return wrappedFunc}function addFunctionWasm(func,sig){var table=wasmTable;var ret=table.length;try{table.grow(1)}catch(err){if(!(err instanceof RangeError)){throw err}throw"Unable to grow wasm table. Use a higher value for RESERVED_FUNCTION_POINTERS or set ALLOW_TABLE_GROWTH."}try{table.set(ret,func)}catch(err){if(!(err instanceof TypeError)){throw err}assert(typeof sig!=="undefined","Missing signature argument to addFunction");var wrapped=convertJsFunctionToWasm(func,sig);table.set(ret,wrapped)}return ret}function removeFunctionWasm(index){}var funcWrappers={};function dynCall(sig,ptr,args){if(args&&args.length){return Module["dynCall_"+sig].apply(null,[ptr].concat(args))}else{return Module["dynCall_"+sig].call(null,ptr)}}var tempRet0=0;var setTempRet0=function(value){tempRet0=value};var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var noExitRuntime;if(Module["noExitRuntime"])noExitRuntime=Module["noExitRuntime"];if(typeof WebAssembly!=="object"){err("no native wasm support detected")}function setValue(ptr,value,type,noSafe){type=type||"i8";if(type.charAt(type.length-1)==="*")type="i32";switch(type){case"i1":HEAP8[ptr>>0]=value;break;case"i8":HEAP8[ptr>>0]=value;break;case"i16":HEAP16[ptr>>1]=value;break;case"i32":HEAP32[ptr>>2]=value;break;case"i64":tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=1?tempDouble>0?(Math_min(+Math_floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math_ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];break;case"float":HEAPF32[ptr>>2]=value;break;case"double":HEAPF64[ptr>>3]=value;break;default:abort("invalid type for setValue: "+type)}}var wasmMemory;var wasmTable=new WebAssembly.Table({"initial":219,"maximum":219+0,"element":"anyfunc"});var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}function getCFunc(ident){var func=Module["_"+ident];assert(func,"Cannot call unknown function "+ident+", make sure it is exported");return func}function ccall(ident,returnType,argTypes,args,opts){var toC={"string":function(str){var ret=0;if(str!==null&&str!==undefined&&str!==0){var len=(str.length<<2)+1;ret=stackAlloc(len);stringToUTF8(str,ret,len)}return ret},"array":function(arr){var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return ret}};function convertReturnValue(ret){if(returnType==="string")return UTF8ToString(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func.apply(null,cArgs);ret=convertReturnValue(ret);if(stack!==0)stackRestore(stack);return ret}function cwrap(ident,returnType,argTypes,opts){argTypes=argTypes||[];var numericArgs=argTypes.every(function(type){return type==="number"});var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return function(){return ccall(ident,returnType,argTypes,arguments,opts)}}var ALLOC_NONE=3;var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(u8Array[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=u8Array[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|u8Array[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function stringToUTF8(str,outPtr,maxBytesToWrite){return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function writeArrayToMemory(array,buffer){HEAP8.set(array,buffer)}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}var WASM_PAGE_SIZE=65536;function alignUp(x,multiple){if(x%multiple>0){x+=multiple-x%multiple}return x}var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferAndViews(buf){buffer=buf;Module["HEAP8"]=HEAP8=new Int8Array(buf);Module["HEAP16"]=HEAP16=new Int16Array(buf);Module["HEAP32"]=HEAP32=new Int32Array(buf);Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);Module["HEAPU16"]=HEAPU16=new Uint16Array(buf);Module["HEAPU32"]=HEAPU32=new Uint32Array(buf);Module["HEAPF32"]=HEAPF32=new Float32Array(buf);Module["HEAPF64"]=HEAPF64=new Float64Array(buf)}var STACK_BASE=10826544,DYNAMIC_BASE=10826544,DYNAMICTOP_PTR=5583504;var INITIAL_TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(Module["wasmMemory"]){wasmMemory=Module["wasmMemory"]}else{wasmMemory=new WebAssembly.Memory({"initial":INITIAL_TOTAL_MEMORY/WASM_PAGE_SIZE})}if(wasmMemory){buffer=wasmMemory.buffer}INITIAL_TOTAL_MEMORY=buffer.byteLength;updateGlobalBufferAndViews(buffer);HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var Math_abs=Math.abs;var Math_ceil=Math.ceil;var Math_floor=Math.floor;var Math_min=Math.min;var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}what+="";out(what);err(what);ABORT=true;EXITSTATUS=1;what="abort("+what+"). Build with -s ASSERTIONS=1 for more info.";throw new WebAssembly.RuntimeError(what)}var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}var wasmBinaryFile="c64.wasm?v=0.491";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(){try{if(wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(wasmBinaryFile)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary()})}return new Promise(function(resolve,reject){resolve(getBinary())})}function createWasm(){var info={"env":asmLibraryArg,"wasi_snapshot_preview1":asmLibraryArg};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");function receiveInstantiatedSource(output){receiveInstance(output["instance"])}function instantiateArrayBuffer(receiver){return getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}function instantiateAsync(){if(!wasmBinary&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch==="function"){fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,info);return result.then(receiveInstantiatedSource,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");instantiateArrayBuffer(receiveInstantiatedSource)})})}else{return instantiateArrayBuffer(receiveInstantiatedSource)}}if(Module["instantiateWasm"]){try{var exports=Module["instantiateWasm"](info,receiveInstance);return exports}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync();return{}}var tempDouble;var tempI64;var ASM_CONSTS={2288:function(){c64_frame()}};var _readAsmConstArgsArray=[];function readAsmConstArgs(sigPtr,buf){var args=_readAsmConstArgsArray;args.length=0;var ch;while(ch=HEAPU8[sigPtr++]){if(ch===100||ch===102){buf=buf+7&~7;args.push(HEAPF64[buf>>3]);buf+=8}else{buf=buf+3&~3;args.push(HEAP32[buf>>2]);buf+=4}}return args}function _emscripten_asm_const_iii(code,sigPtr,argbuf){var args=readAsmConstArgs(sigPtr,argbuf);return ASM_CONSTS[code].apply(null,args)}__ATINIT__.push({func:function(){___wasm_call_ctors()}});function demangle(func){return func}function demangleAll(text){var regex=/\b_Z[\w\d_]+/g;return text.replace(regex,function(x){var y=demangle(x);return x===y?x:y+" ["+x+"]"})}function jsStackTrace(){var err=new Error;if(!err.stack){try{throw new Error(0)}catch(e){err=e}if(!err.stack){return"(no stack trace available)"}}return err.stack.toString()}function _emscripten_get_heap_size(){return HEAP8.length}function _emscripten_get_sbrk_ptr(){return 5583504}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest)}function emscripten_realloc_buffer(size){try{wasmMemory.grow(size-buffer.byteLength+65535>>16);updateGlobalBufferAndViews(wasmMemory.buffer);return 1}catch(e){}}function _emscripten_resize_heap(requestedSize){var oldSize=_emscripten_get_heap_size();var PAGE_MULTIPLE=65536;var maxHeapSize=2147483648-PAGE_MULTIPLE;if(requestedSize>maxHeapSize){return false}var minHeapSize=16777216;for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignUp(Math.max(minHeapSize,requestedSize,overGrownHeapSize),PAGE_MULTIPLE));var replacement=emscripten_realloc_buffer(newSize);if(replacement){return true}}return false}var PATH={splitPath:function(filename){var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:function(parts,allowAboveRoot){var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up;up--){parts.unshift("..")}}return parts},normalize:function(path){var isAbsolute=path.charAt(0)==="/",trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(function(p){return!!p}),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path},dirname:function(path){var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir},basename:function(path){if(path==="/")return"/";var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)},extname:function(path){return PATH.splitPath(path)[3]},join:function(){var paths=Array.prototype.slice.call(arguments,0);return PATH.normalize(paths.join("/"))},join2:function(l,r){return PATH.normalize(l+"/"+r)}};var SYSCALLS={buffers:[null,[],[]],printChar:function(stream,curr){var buffer=SYSCALLS.buffers[stream];if(curr===0||curr===10){(stream===1?out:err)(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}},varargs:0,get:function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret},getStr:function(){var ret=UTF8ToString(SYSCALLS.get());return ret},get64:function(){var low=SYSCALLS.get(),high=SYSCALLS.get();return low},getZero:function(){SYSCALLS.get()}};function _fd_write(fd,iov,iovcnt,pnum){try{var num=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){SYSCALLS.printChar(fd,HEAPU8[ptr+j])}num+=len}HEAP32[pnum>>2]=num;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return e.errno}}function _setTempRet0($i){setTempRet0($i|0)}var ASSERTIONS=false;var asmLibraryArg={"emscripten_asm_const_iii":_emscripten_asm_const_iii,"emscripten_get_sbrk_ptr":_emscripten_get_sbrk_ptr,"emscripten_memcpy_big":_emscripten_memcpy_big,"emscripten_resize_heap":_emscripten_resize_heap,"fd_write":_fd_write,"memory":wasmMemory,"setTempRet0":_setTempRet0,"table":wasmTable};var asm=createWasm();Module["asm"]=asm;var ___wasm_call_ctors=Module["___wasm_call_ctors"]=function(){return(___wasm_call_ctors=Module["___wasm_call_ctors"]=Module["asm"]["__wasm_call_ctors"]).apply(null,arguments)};var _c64_setModel=Module["_c64_setModel"]=function(){return(_c64_setModel=Module["_c64_setModel"]=Module["asm"]["c64_setModel"]).apply(null,arguments)};var _c64_getModel=Module["_c64_getModel"]=function(){return(_c64_getModel=Module["_c64_getModel"]=Module["asm"]["c64_getModel"]).apply(null,arguments)};var _c64_joystick_push=Module["_c64_joystick_push"]=function(){return(_c64_joystick_push=Module["_c64_joystick_push"]=Module["asm"]["c64_joystick_push"]).apply(null,arguments)};var _c64_joystick_release=Module["_c64_joystick_release"]=function(){return(_c64_joystick_release=Module["_c64_joystick_release"]=Module["asm"]["c64_joystick_release"]).apply(null,arguments)};var _c64_mouse_position=Module["_c64_mouse_position"]=function(){return(_c64_mouse_position=Module["_c64_mouse_position"]=Module["asm"]["c64_mouse_position"]).apply(null,arguments)};var _c64_set_mouse_port_enabled=Module["_c64_set_mouse_port_enabled"]=function(){return(_c64_set_mouse_port_enabled=Module["_c64_set_mouse_port_enabled"]=Module["asm"]["c64_set_mouse_port_enabled"]).apply(null,arguments)};var _c64_getPixelBuffer=Module["_c64_getPixelBuffer"]=function(){return(_c64_getPixelBuffer=Module["_c64_getPixelBuffer"]=Module["asm"]["c64_getPixelBuffer"]).apply(null,arguments)};var _c64_init=Module["_c64_init"]=function(){return(_c64_init=Module["_c64_init"]=Module["asm"]["c64_init"]).apply(null,arguments)};var _c64_reset=Module["_c64_reset"]=function(){return(_c64_reset=Module["_c64_reset"]=Module["asm"]["c64_reset"]).apply(null,arguments)};var _c64_setColor=Module["_c64_setColor"]=function(){return(_c64_setColor=Module["_c64_setColor"]=Module["asm"]["c64_setColor"]).apply(null,arguments)};var _c64_getDriveEnabled=Module["_c64_getDriveEnabled"]=function(){return(_c64_getDriveEnabled=Module["_c64_getDriveEnabled"]=Module["asm"]["c64_getDriveEnabled"]).apply(null,arguments)};var _c64_setDriveEnabled=Module["_c64_setDriveEnabled"]=function(){return(_c64_setDriveEnabled=Module["_c64_setDriveEnabled"]=Module["asm"]["c64_setDriveEnabled"]).apply(null,arguments)};var _c64_insertDisk=Module["_c64_insertDisk"]=function(){return(_c64_insertDisk=Module["_c64_insertDisk"]=Module["asm"]["c64_insertDisk"]).apply(null,arguments)};var _c64_loadPRG=Module["_c64_loadPRG"]=function(){return(_c64_loadPRG=Module["_c64_loadPRG"]=Module["asm"]["c64_loadPRG"]).apply(null,arguments)};var _c64_loadCartridge=Module["_c64_loadCartridge"]=function(){return(_c64_loadCartridge=Module["_c64_loadCartridge"]=Module["asm"]["c64_loadCartridge"]).apply(null,arguments)};var _c64_removeCartridge=Module["_c64_removeCartridge"]=function(){return(_c64_removeCartridge=Module["_c64_removeCartridge"]=Module["asm"]["c64_removeCartridge"]).apply(null,arguments)};var _c64_getRasterX=Module["_c64_getRasterX"]=function(){return(_c64_getRasterX=Module["_c64_getRasterX"]=Module["asm"]["c64_getRasterX"]).apply(null,arguments)};var _c64_getRasterY=Module["_c64_getRasterY"]=function(){return(_c64_getRasterY=Module["_c64_getRasterY"]=Module["asm"]["c64_getRasterY"]).apply(null,arguments)};var _c64_getVicCycle=Module["_c64_getVicCycle"]=function(){return(_c64_getVicCycle=Module["_c64_getVicCycle"]=Module["asm"]["c64_getVicCycle"]).apply(null,arguments)};var _c64_getPC=Module["_c64_getPC"]=function(){return(_c64_getPC=Module["_c64_getPC"]=Module["asm"]["c64_getPC"]).apply(null,arguments)};var _c64_getRegX=Module["_c64_getRegX"]=function(){return(_c64_getRegX=Module["_c64_getRegX"]=Module["asm"]["c64_getRegX"]).apply(null,arguments)};var _c64_getRegY=Module["_c64_getRegY"]=function(){return(_c64_getRegY=Module["_c64_getRegY"]=Module["asm"]["c64_getRegY"]).apply(null,arguments)};var _c64_getRegA=Module["_c64_getRegA"]=function(){return(_c64_getRegA=Module["_c64_getRegA"]=Module["asm"]["c64_getRegA"]).apply(null,arguments)};var _c64_getSP=Module["_c64_getSP"]=function(){return(_c64_getSP=Module["_c64_getSP"]=Module["asm"]["c64_getSP"]).apply(null,arguments)};var _c64_getFlagN=Module["_c64_getFlagN"]=function(){return(_c64_getFlagN=Module["_c64_getFlagN"]=Module["asm"]["c64_getFlagN"]).apply(null,arguments)};var _c64_getFlagC=Module["_c64_getFlagC"]=function(){return(_c64_getFlagC=Module["_c64_getFlagC"]=Module["asm"]["c64_getFlagC"]).apply(null,arguments)};var _c64_getFlagD=Module["_c64_getFlagD"]=function(){return(_c64_getFlagD=Module["_c64_getFlagD"]=Module["asm"]["c64_getFlagD"]).apply(null,arguments)};var _c64_getFlagZ=Module["_c64_getFlagZ"]=function(){return(_c64_getFlagZ=Module["_c64_getFlagZ"]=Module["asm"]["c64_getFlagZ"]).apply(null,arguments)};var _c64_getFlagV=Module["_c64_getFlagV"]=function(){return(_c64_getFlagV=Module["_c64_getFlagV"]=Module["asm"]["c64_getFlagV"]).apply(null,arguments)};var _c64_getFlagI=Module["_c64_getFlagI"]=function(){return(_c64_getFlagI=Module["_c64_getFlagI"]=Module["asm"]["c64_getFlagI"]).apply(null,arguments)};var _c64_getFlagU=Module["_c64_getFlagU"]=function(){return(_c64_getFlagU=Module["_c64_getFlagU"]=Module["asm"]["c64_getFlagU"]).apply(null,arguments)};var _c64_getFlagB=Module["_c64_getFlagB"]=function(){return(_c64_getFlagB=Module["_c64_getFlagB"]=Module["asm"]["c64_getFlagB"]).apply(null,arguments)};var _c64_setPC=Module["_c64_setPC"]=function(){return(_c64_setPC=Module["_c64_setPC"]=Module["asm"]["c64_setPC"]).apply(null,arguments)};var _c64_setRegX=Module["_c64_setRegX"]=function(){return(_c64_setRegX=Module["_c64_setRegX"]=Module["asm"]["c64_setRegX"]).apply(null,arguments)};var _c64_setRegY=Module["_c64_setRegY"]=function(){return(_c64_setRegY=Module["_c64_setRegY"]=Module["asm"]["c64_setRegY"]).apply(null,arguments)};var _c64_setRegA=Module["_c64_setRegA"]=function(){return(_c64_setRegA=Module["_c64_setRegA"]=Module["asm"]["c64_setRegA"]).apply(null,arguments)};var _c64_setFlagN=Module["_c64_setFlagN"]=function(){return(_c64_setFlagN=Module["_c64_setFlagN"]=Module["asm"]["c64_setFlagN"]).apply(null,arguments)};var _c64_setFlagC=Module["_c64_setFlagC"]=function(){return(_c64_setFlagC=Module["_c64_setFlagC"]=Module["asm"]["c64_setFlagC"]).apply(null,arguments)};var _c64_setFlagD=Module["_c64_setFlagD"]=function(){return(_c64_setFlagD=Module["_c64_setFlagD"]=Module["asm"]["c64_setFlagD"]).apply(null,arguments)};var _c64_setFlagZ=Module["_c64_setFlagZ"]=function(){return(_c64_setFlagZ=Module["_c64_setFlagZ"]=Module["asm"]["c64_setFlagZ"]).apply(null,arguments)};var _c64_setFlagV=Module["_c64_setFlagV"]=function(){return(_c64_setFlagV=Module["_c64_setFlagV"]=Module["asm"]["c64_setFlagV"]).apply(null,arguments)};var _c64_setFlagI=Module["_c64_setFlagI"]=function(){return(_c64_setFlagI=Module["_c64_setFlagI"]=Module["asm"]["c64_setFlagI"]).apply(null,arguments)};var _c64_setFlagU=Module["_c64_setFlagU"]=function(){return(_c64_setFlagU=Module["_c64_setFlagU"]=Module["asm"]["c64_setFlagU"]).apply(null,arguments)};var _c64_setFlagB=Module["_c64_setFlagB"]=function(){return(_c64_setFlagB=Module["_c64_setFlagB"]=Module["asm"]["c64_setFlagB"]).apply(null,arguments)};var _c64_getCycleCount=Module["_c64_getCycleCount"]=function(){return(_c64_getCycleCount=Module["_c64_getCycleCount"]=Module["asm"]["c64_getCycleCount"]).apply(null,arguments)};var _c64_step=Module["_c64_step"]=function(){return(_c64_step=Module["_c64_step"]=Module["asm"]["c64_step"]).apply(null,arguments)};var _c64_update=Module["_c64_update"]=function(){return(_c64_update=Module["_c64_update"]=Module["asm"]["c64_update"]).apply(null,arguments)};var _c64_getDataLength=Module["_c64_getDataLength"]=function(){return(_c64_getDataLength=Module["_c64_getDataLength"]=Module["asm"]["c64_getDataLength"]).apply(null,arguments)};var _free=Module["_free"]=function(){return(_free=Module["_free"]=Module["asm"]["free"]).apply(null,arguments)};var _malloc=Module["_malloc"]=function(){return(_malloc=Module["_malloc"]=Module["asm"]["malloc"]).apply(null,arguments)};var _c64_getData=Module["_c64_getData"]=function(){return(_c64_getData=Module["_c64_getData"]=Module["asm"]["c64_getData"]).apply(null,arguments)};var _sid_readNS=Module["_sid_readNS"]=function(){return(_sid_readNS=Module["_sid_readNS"]=Module["asm"]["sid_readNS"]).apply(null,arguments)};var _c64_ramWrite=Module["_c64_ramWrite"]=function(){return(_c64_ramWrite=Module["_c64_ramWrite"]=Module["asm"]["c64_ramWrite"]).apply(null,arguments)};var _c64_ramRead=Module["_c64_ramRead"]=function(){return(_c64_ramRead=Module["_c64_ramRead"]=Module["asm"]["c64_ramRead"]).apply(null,arguments)};var _keyboard_keyPressed=Module["_keyboard_keyPressed"]=function(){return(_keyboard_keyPressed=Module["_keyboard_keyPressed"]=Module["asm"]["keyboard_keyPressed"]).apply(null,arguments)};var _keyboard_keyReleased=Module["_keyboard_keyReleased"]=function(){return(_keyboard_keyReleased=Module["_keyboard_keyReleased"]=Module["asm"]["keyboard_keyReleased"]).apply(null,arguments)};var _vic_getRegisterAt=Module["_vic_getRegisterAt"]=function(){return(_vic_getRegisterAt=Module["_vic_getRegisterAt"]=Module["asm"]["vic_getRegisterAt"]).apply(null,arguments)};var _vic_readNS=Module["_vic_readNS"]=function(){return(_vic_readNS=Module["_vic_readNS"]=Module["asm"]["vic_readNS"]).apply(null,arguments)};var _c64_vicRead=Module["_c64_vicRead"]=function(){return(_c64_vicRead=Module["_c64_vicRead"]=Module["asm"]["c64_vicRead"]).apply(null,arguments)};var _c64_vicReadRegister=Module["_c64_vicReadRegister"]=function(){return(_c64_vicReadRegister=Module["_c64_vicReadRegister"]=Module["asm"]["c64_vicReadRegister"]).apply(null,arguments)};var _c64_vicReadAbsolute=Module["_c64_vicReadAbsolute"]=function(){return(_c64_vicReadAbsolute=Module["_c64_vicReadAbsolute"]=Module["asm"]["c64_vicReadAbsolute"]).apply(null,arguments)};var _cia1_getRegisterAt=Module["_cia1_getRegisterAt"]=function(){return(_cia1_getRegisterAt=Module["_cia1_getRegisterAt"]=Module["asm"]["cia1_getRegisterAt"]).apply(null,arguments)};var _cia1_readNS=Module["_cia1_readNS"]=function(){return(_cia1_readNS=Module["_cia1_readNS"]=Module["asm"]["cia1_readNS"]).apply(null,arguments)};var _cia2_getRegisterAt=Module["_cia2_getRegisterAt"]=function(){return(_cia2_getRegisterAt=Module["_cia2_getRegisterAt"]=Module["asm"]["cia2_getRegisterAt"]).apply(null,arguments)};var _cia2_readNS=Module["_cia2_readNS"]=function(){return(_cia2_readNS=Module["_cia2_readNS"]=Module["asm"]["cia2_readNS"]).apply(null,arguments)};var _c64_cpuRead=Module["_c64_cpuRead"]=function(){return(_c64_cpuRead=Module["_c64_cpuRead"]=Module["asm"]["c64_cpuRead"]).apply(null,arguments)};var _c64_cpuReadNS=Module["_c64_cpuReadNS"]=function(){return(_c64_cpuReadNS=Module["_c64_cpuReadNS"]=Module["asm"]["c64_cpuReadNS"]).apply(null,arguments)};var _c64_cpuWrite=Module["_c64_cpuWrite"]=function(){return(_c64_cpuWrite=Module["_c64_cpuWrite"]=Module["asm"]["c64_cpuWrite"]).apply(null,arguments)};var _sid_setModel=Module["_sid_setModel"]=function(){return(_sid_setModel=Module["_sid_setModel"]=Module["asm"]["sid_setModel"]).apply(null,arguments)};var _sid_setSampleRate=Module["_sid_setSampleRate"]=function(){return(_sid_setSampleRate=Module["_sid_setSampleRate"]=Module["asm"]["sid_setSampleRate"]).apply(null,arguments)};var _sid_setVoiceEnabled=Module["_sid_setVoiceEnabled"]=function(){return(_sid_setVoiceEnabled=Module["_sid_setVoiceEnabled"]=Module["asm"]["sid_setVoiceEnabled"]).apply(null,arguments)};var _sid_dumpBuffer=Module["_sid_dumpBuffer"]=function(){return(_sid_dumpBuffer=Module["_sid_dumpBuffer"]=Module["asm"]["sid_dumpBuffer"]).apply(null,arguments)};var _sid_setChannelBuffersEnabled=Module["_sid_setChannelBuffersEnabled"]=function(){return(_sid_setChannelBuffersEnabled=Module["_sid_setChannelBuffersEnabled"]=Module["asm"]["sid_setChannelBuffersEnabled"]).apply(null,arguments)};var _sid_getAudioBuffer=Module["_sid_getAudioBuffer"]=function(){return(_sid_getAudioBuffer=Module["_sid_getAudioBuffer"]=Module["asm"]["sid_getAudioBuffer"]).apply(null,arguments)};var _sid_getAudioBufferCh=Module["_sid_getAudioBufferCh"]=function(){return(_sid_getAudioBufferCh=Module["_sid_getAudioBufferCh"]=Module["asm"]["sid_getAudioBufferCh"]).apply(null,arguments)};var _sid_getWaveformByte=Module["_sid_getWaveformByte"]=function(){return(_sid_getWaveformByte=Module["_sid_getWaveformByte"]=Module["asm"]["sid_getWaveformByte"]).apply(null,arguments)};var _breakpoints_pcClearAll=Module["_breakpoints_pcClearAll"]=function(){return(_breakpoints_pcClearAll=Module["_breakpoints_pcClearAll"]=Module["asm"]["breakpoints_pcClearAll"]).apply(null,arguments)};var _breakpoints_pcAdd=Module["_breakpoints_pcAdd"]=function(){return(_breakpoints_pcAdd=Module["_breakpoints_pcAdd"]=Module["asm"]["breakpoints_pcAdd"]).apply(null,arguments)};var _breakpoint_pcSetEnabled=Module["_breakpoint_pcSetEnabled"]=function(){return(_breakpoint_pcSetEnabled=Module["_breakpoint_pcSetEnabled"]=Module["asm"]["breakpoint_pcSetEnabled"]).apply(null,arguments)};var _breakpoint_pcRemove=Module["_breakpoint_pcRemove"]=function(){return(_breakpoint_pcRemove=Module["_breakpoint_pcRemove"]=Module["asm"]["breakpoint_pcRemove"]).apply(null,arguments)};var _breakpoints_memoryAdd=Module["_breakpoints_memoryAdd"]=function(){return(_breakpoints_memoryAdd=Module["_breakpoints_memoryAdd"]=Module["asm"]["breakpoints_memoryAdd"]).apply(null,arguments)};var _breakpoint_memorySetEnabled=Module["_breakpoint_memorySetEnabled"]=function(){return(_breakpoint_memorySetEnabled=Module["_breakpoint_memorySetEnabled"]=Module["asm"]["breakpoint_memorySetEnabled"]).apply(null,arguments)};var _breakpoint_memoryRemove=Module["_breakpoint_memoryRemove"]=function(){return(_breakpoint_memoryRemove=Module["_breakpoint_memoryRemove"]=Module["asm"]["breakpoint_memoryRemove"]).apply(null,arguments)};var _breakpoints_rasterYAdd=Module["_breakpoints_rasterYAdd"]=function(){return(_breakpoints_rasterYAdd=Module["_breakpoints_rasterYAdd"]=Module["asm"]["breakpoints_rasterYAdd"]).apply(null,arguments)};var _breakpoint_rasterYSetEnabled=Module["_breakpoint_rasterYSetEnabled"]=function(){return(_breakpoint_rasterYSetEnabled=Module["_breakpoint_rasterYSetEnabled"]=Module["asm"]["breakpoint_rasterYSetEnabled"]).apply(null,arguments)};var _breakpoint_rasterYRemove=Module["_breakpoint_rasterYRemove"]=function(){return(_breakpoint_rasterYRemove=Module["_breakpoint_rasterYRemove"]=Module["asm"]["breakpoint_rasterYRemove"]).apply(null,arguments)};var _debugger_set_inspect_at=Module["_debugger_set_inspect_at"]=function(){return(_debugger_set_inspect_at=Module["_debugger_set_inspect_at"]=Module["asm"]["debugger_set_inspect_at"]).apply(null,arguments)};var _debugger_set_speed=Module["_debugger_set_speed"]=function(){return(_debugger_set_speed=Module["_debugger_set_speed"]=Module["asm"]["debugger_set_speed"]).apply(null,arguments)};var _debugger_get_speed=Module["_debugger_get_speed"]=function(){return(_debugger_get_speed=Module["_debugger_get_speed"]=Module["asm"]["debugger_get_speed"]).apply(null,arguments)};var _debugger_get_sprite_pointer=Module["_debugger_get_sprite_pointer"]=function(){return(_debugger_get_sprite_pointer=Module["_debugger_get_sprite_pointer"]=Module["asm"]["debugger_get_sprite_pointer"]).apply(null,arguments)};var _debugger_pause=Module["_debugger_pause"]=function(){return(_debugger_pause=Module["_debugger_pause"]=Module["asm"]["debugger_pause"]).apply(null,arguments)};var _debugger_play=Module["_debugger_play"]=function(){return(_debugger_play=Module["_debugger_play"]=Module["asm"]["debugger_play"]).apply(null,arguments)};var _debugger_isRunning=Module["_debugger_isRunning"]=function(){return(_debugger_isRunning=Module["_debugger_isRunning"]=Module["asm"]["debugger_isRunning"]).apply(null,arguments)};var _debugger_step=Module["_debugger_step"]=function(){return(_debugger_step=Module["_debugger_step"]=Module["asm"]["debugger_step"]).apply(null,arguments)};var _debugger_update=Module["_debugger_update"]=function(){return(_debugger_update=Module["_debugger_update"]=Module["asm"]["debugger_update"]).apply(null,arguments)};var _c1541_getStatus=Module["_c1541_getStatus"]=function(){return(_c1541_getStatus=Module["_c1541_getStatus"]=Module["asm"]["c1541_getStatus"]).apply(null,arguments)};var _c1541_cpuRead=Module["_c1541_cpuRead"]=function(){return(_c1541_cpuRead=Module["_c1541_cpuRead"]=Module["asm"]["c1541_cpuRead"]).apply(null,arguments)};var _c1541_getPC=Module["_c1541_getPC"]=function(){return(_c1541_getPC=Module["_c1541_getPC"]=Module["asm"]["c1541_getPC"]).apply(null,arguments)};var _c1541_getRegX=Module["_c1541_getRegX"]=function(){return(_c1541_getRegX=Module["_c1541_getRegX"]=Module["asm"]["c1541_getRegX"]).apply(null,arguments)};var _c1541_getRegY=Module["_c1541_getRegY"]=function(){return(_c1541_getRegY=Module["_c1541_getRegY"]=Module["asm"]["c1541_getRegY"]).apply(null,arguments)};var _c1541_getRegA=Module["_c1541_getRegA"]=function(){return(_c1541_getRegA=Module["_c1541_getRegA"]=Module["asm"]["c1541_getRegA"]).apply(null,arguments)};var _c1541_getSP=Module["_c1541_getSP"]=function(){return(_c1541_getSP=Module["_c1541_getSP"]=Module["asm"]["c1541_getSP"]).apply(null,arguments)};var _c1541_getFlagN=Module["_c1541_getFlagN"]=function(){return(_c1541_getFlagN=Module["_c1541_getFlagN"]=Module["asm"]["c1541_getFlagN"]).apply(null,arguments)};var _c1541_getFlagC=Module["_c1541_getFlagC"]=function(){return(_c1541_getFlagC=Module["_c1541_getFlagC"]=Module["asm"]["c1541_getFlagC"]).apply(null,arguments)};var _c1541_getFlagD=Module["_c1541_getFlagD"]=function(){return(_c1541_getFlagD=Module["_c1541_getFlagD"]=Module["asm"]["c1541_getFlagD"]).apply(null,arguments)};var _c1541_getFlagZ=Module["_c1541_getFlagZ"]=function(){return(_c1541_getFlagZ=Module["_c1541_getFlagZ"]=Module["asm"]["c1541_getFlagZ"]).apply(null,arguments)};var _c1541_getFlagV=Module["_c1541_getFlagV"]=function(){return(_c1541_getFlagV=Module["_c1541_getFlagV"]=Module["asm"]["c1541_getFlagV"]).apply(null,arguments)};var _c1541_getFlagI=Module["_c1541_getFlagI"]=function(){return(_c1541_getFlagI=Module["_c1541_getFlagI"]=Module["asm"]["c1541_getFlagI"]).apply(null,arguments)};var _c1541_getFlagU=Module["_c1541_getFlagU"]=function(){return(_c1541_getFlagU=Module["_c1541_getFlagU"]=Module["asm"]["c1541_getFlagU"]).apply(null,arguments)};var _c1541_getFlagB=Module["_c1541_getFlagB"]=function(){return(_c1541_getFlagB=Module["_c1541_getFlagB"]=Module["asm"]["c1541_getFlagB"]).apply(null,arguments)};var _c1541_getPosition=Module["_c1541_getPosition"]=function(){return(_c1541_getPosition=Module["_c1541_getPosition"]=Module["asm"]["c1541_getPosition"]).apply(null,arguments)};var _c64_getSnapshotSize=Module["_c64_getSnapshotSize"]=function(){return(_c64_getSnapshotSize=Module["_c64_getSnapshotSize"]=Module["asm"]["c64_getSnapshotSize"]).apply(null,arguments)};var _c64_getSnapshot=Module["_c64_getSnapshot"]=function(){return(_c64_getSnapshot=Module["_c64_getSnapshot"]=Module["asm"]["c64_getSnapshot"]).apply(null,arguments)};var _c64_loadSnapshot=Module["_c64_loadSnapshot"]=function(){return(_c64_loadSnapshot=Module["_c64_loadSnapshot"]=Module["asm"]["c64_loadSnapshot"]).apply(null,arguments)};var ___errno_location=Module["___errno_location"]=function(){return(___errno_location=Module["___errno_location"]=Module["asm"]["__errno_location"]).apply(null,arguments)};var _setThrew=Module["_setThrew"]=function(){return(_setThrew=Module["_setThrew"]=Module["asm"]["setThrew"]).apply(null,arguments)};var stackSave=Module["stackSave"]=function(){return(stackSave=Module["stackSave"]=Module["asm"]["stackSave"]).apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return(stackAlloc=Module["stackAlloc"]=Module["asm"]["stackAlloc"]).apply(null,arguments)};var stackRestore=Module["stackRestore"]=function(){return(stackRestore=Module["stackRestore"]=Module["asm"]["stackRestore"]).apply(null,arguments)};var __growWasmMemory=Module["__growWasmMemory"]=function(){return(__growWasmMemory=Module["__growWasmMemory"]=Module["asm"]["__growWasmMemory"]).apply(null,arguments)};var dynCall_ii=Module["dynCall_ii"]=function(){return(dynCall_ii=Module["dynCall_ii"]=Module["asm"]["dynCall_ii"]).apply(null,arguments)};var dynCall_vii=Module["dynCall_vii"]=function(){return(dynCall_vii=Module["dynCall_vii"]=Module["asm"]["dynCall_vii"]).apply(null,arguments)};var dynCall_vi=Module["dynCall_vi"]=function(){return(dynCall_vi=Module["dynCall_vi"]=Module["asm"]["dynCall_vi"]).apply(null,arguments)};var dynCall_fifffi=Module["dynCall_fifffi"]=function(){return(dynCall_fifffi=Module["dynCall_fifffi"]=Module["asm"]["dynCall_fifffi"]).apply(null,arguments)};var dynCall_viii=Module["dynCall_viii"]=function(){return(dynCall_viii=Module["dynCall_viii"]=Module["asm"]["dynCall_viii"]).apply(null,arguments)};var dynCall_iiii=Module["dynCall_iiii"]=function(){return(dynCall_iiii=Module["dynCall_iiii"]=Module["asm"]["dynCall_iiii"]).apply(null,arguments)};var dynCall_jiji=Module["dynCall_jiji"]=function(){return(dynCall_jiji=Module["dynCall_jiji"]=Module["asm"]["dynCall_jiji"]).apply(null,arguments)};var dynCall_iidiiii=Module["dynCall_iidiiii"]=function(){return(dynCall_iidiiii=Module["dynCall_iidiiii"]=Module["asm"]["dynCall_iidiiii"]).apply(null,arguments)};Module["asm"]=asm;Module["ccall"]=ccall;Module["cwrap"]=cwrap;var calledRun;Module["then"]=function(func){if(calledRun){func(Module)}else{var old=Module["onRuntimeInitialized"];Module["onRuntimeInitialized"]=function(){if(old)old();func(Module)}}return Module};function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function run(args){args=args||arguments_;if(runDependencies>0){return}preRun();if(runDependencies>0)return;function doRun(){if(calledRun)return;calledRun=true;if(ABORT)return;initRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}noExitRuntime=true;run();


  return C64
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = C64;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return C64; });
    else if (typeof exports === 'object')
      exports["C64"] = C64;
    

var c64_ready = false;
var c64_model = 'pal';
var g_c64Settings = typeof g_c64Settings == 'undefined' ?  false : g_c64Settings;

var options = {};
var c64 = C64(options);
var c64_setModel = c64.cwrap('c64_setModel', null, ['number']);
var c64_getModel = c64.cwrap('c64_getModel', 'number');


var c64_cpuRead = c64.cwrap('c64_cpuRead', 'number', ['number']);
var c64_cpuWrite = c64.cwrap('c64_cpuWrite', null, ['number','number']);
var c64_cpuReadNS = c64.cwrap('c64_cpuReadNS', 'number', ['number']);

var c64_getPC = c64.cwrap('c64_getPC', 'number');
var c64_getRegX = c64.cwrap('c64_getRegX', 'number');
var c64_getRegY = c64.cwrap('c64_getRegY', 'number');
var c64_getRegA = c64.cwrap('c64_getRegA', 'number');
var c64_getSP = c64.cwrap('c64_getSP', 'number');

var c64_getFlagN = c64.cwrap('c64_getFlagN', 'number');
var c64_getFlagC = c64.cwrap('c64_getFlagC', 'number');
var c64_getFlagD = c64.cwrap('c64_getFlagD', 'number');
var c64_getFlagZ = c64.cwrap('c64_getFlagZ', 'number');
var c64_getFlagV = c64.cwrap('c64_getFlagV', 'number');
var c64_getFlagI = c64.cwrap('c64_getFlagI', 'number');
var c64_getFlagU = c64.cwrap('c64_getFlagU', 'number');
var c64_getFlagB = c64.cwrap('c64_getFlagB', 'number');
var c64_getVicCycle = c64.cwrap('c64_getVicCycle', 'number');
var c64_getRasterY = c64.cwrap('c64_getRasterY', 'number');
var c64_getCycleCount = c64.cwrap('c64_getCycleCount','number', ['number']);


var c64_setPC = c64.cwrap('c64_setPC', null, ['number']);
var c64_setRegX = c64.cwrap('c64_setRegX', null, ['number']);
var c64_setRegY = c64.cwrap('c64_setRegY', null, ['number']);
var c64_setRegA = c64.cwrap('c64_setRegA', null, ['number']);

var c64_setFlagN = c64.cwrap('c64_setFlagN', null, ['number']);
var c64_setFlagC = c64.cwrap('c64_setFlagC', null, ['number']);
var c64_setFlagD = c64.cwrap('c64_setFlagD', null, ['number']);
var c64_setFlagZ = c64.cwrap('c64_setFlagZ', null, ['number']);
var c64_setFlagV = c64.cwrap('c64_setFlagV', null, ['number']);
var c64_setFlagI = c64.cwrap('c64_setFlagI', null, ['number']);
var c64_setFlagU = c64.cwrap('c64_setFlagU', null, ['number']);
var c64_setFlagB = c64.cwrap('c64_setFlagB', null, ['number']);


var c64_setColor = c64.cwrap('c64_setColor', null, ['number', 'number']);

var c64_vicRead = c64.cwrap('c64_vicRead', 'number', ['number']);
var c64_vicReadNS = c64.cwrap('vic_readNS', 'number', ['number']);
var c64_vicReadAbsolute = c64.cwrap('c64_vicReadAbsolute', 'number', ['number']);
var c64_vicReadRegister = c64.cwrap('c64_vicReadRegister', 'number', ['number']);

var c64_vicReadRegisterAt = c64.cwrap('vic_getRegisterAt', 'number', ['number', 'number', 'number']);

var c64_cia1ReadNS = c64.cwrap('cia1_readNS', 'number', ['number']);
var c64_cia2ReadNS = c64.cwrap('cia2_readNS', 'number', ['number']);
var c64_cia1ReadRegisterAt = c64.cwrap('cia1_getRegisterAt', 'number', ['number', 'number', 'number']);
var c64_cia2ReadRegisterAt = c64.cwrap('cia2_getRegisterAt', 'number', ['number', 'number', 'number']);

var c64_init = c64.cwrap('c64_init');
var c64_reset = c64.cwrap('c64_reset');
var c64_getPixelBuffer = c64.cwrap('c64_getPixelBuffer', 'number');

var c64_getData = c64.cwrap('c64_getData', 'number', ['array','number']);
var c64_getDataLength = c64.cwrap('c64_getDataLength', 'number');

var c64_update = c64.cwrap('c64_update');
var c64_step = c64.cwrap('c64_step');
var c64_loadPRG = c64.cwrap('c64_loadPRG', null, ['array','number','number']);
var c64_loadCRT = c64.cwrap('c64_loadCartridge', null, ['array', 'number']);
var c64_removeCartridge = c64.cwrap('c64_removeCartridge');

var c64_insertDisk = c64.cwrap('c64_insertDisk', null, ['array','number']);


var sid_dumpBuffer = c64.cwrap('sid_dumpBuffer');

var debugger_pause = c64.cwrap('debugger_pause');
var debugger_isRunning = c64.cwrap('debugger_isRunning');
var debugger_play = c64.cwrap('debugger_play');
var debugger_set_speed = c64.cwrap('debugger_set_speed');
var debugger_step = c64.cwrap('debugger_step');
var debugger_update = c64.cwrap('debugger_update','number', ['number']);

var c64_debugger_set_inspect_at = c64.cwrap('debugger_set_inspect_at',null, ['number','number']);
var c64_debugger_get_sprite_pointer = c64.cwrap('debugger_get_sprite_pointer','number',['number']);

var c64_pcBreakpointAdd = c64.cwrap('breakpoints_pcAdd', null, ['number']);
var c64_pcBreakpointSetEnabled = c64.cwrap('breakpoint_pcSetEnabled', null, ['number','number']);
var c64_pcBreakpointRemove = c64.cwrap('breakpoint_pcRemove', null, ['number']);

var c64_memoryBreakpointAdd = c64.cwrap('breakpoints_memoryAdd', null, ['number','number','number']);
var c64_memoryBreakpointSetEnabled = c64.cwrap('breakpoint_memorySetEnabled', null, ['number','number','number','number']);
var c64_memoryBreakpointRemove = c64.cwrap('breakpoint_memoryRemove', null, ['number','number','number']);

var c64_rasterYBreakpointAdd = c64.cwrap('breakpoints_rasterYAdd', null, ['number']);
var c64_rasterYBreakpointSetEnabled = c64.cwrap('breakpoint_rasterYSetEnabled', null, ['number','number']);
var c64_rasterYBreakpointRemove = c64.cwrap('breakpoint_rasterYRemove', null, ['number']);


var c64_keyPressed = c64.cwrap('keyboard_keyPressed', null, ['number']);
var c64_keyReleased = c64.cwrap('keyboard_keyReleased', null, ['number']);

var c64_joystickPush = c64.cwrap('c64_joystick_push', null, ['number', 'number']);
var c64_joystickRelease = c64.cwrap('c64_joystick_release', null, ['number', 'number']);
var c64_mousePosition = c64.cwrap('c64_mouse_position', null, ['number', 'number']);
var c64_setMousePortEnabled = c64.cwrap('c64_set_mouse_port_enabled', null, ['number', 'number']);

var c1541_setEnabled = c64.cwrap('c64_setDriveEnabled', null, ['number']);
var c1541_getStatus = c64.cwrap('c1541_getStatus', 'number');
var c1541_getPosition = c64.cwrap('c1541_getPosition', 'number');
var c1541_cpuRead = c64.cwrap('c1541_cpuRead', 'number', ['number']);
var c1541_getPC = c64.cwrap('c1541_getPC', 'number');

var c1541_getRegX = c64.cwrap('c1541_getRegX', 'number');
var c1541_getRegY = c64.cwrap('c1541_getRegY', 'number');
var c1541_getRegA = c64.cwrap('c1541_getRegA', 'number');
var c1541_getSP = c64.cwrap('c1541_getSP', 'number');

var c1541_getFlagN = c64.cwrap('c1541_getFlagN', 'number');
var c1541_getFlagC = c64.cwrap('c1541_getFlagC', 'number');
var c1541_getFlagD = c64.cwrap('c1541_getFlagD', 'number');
var c1541_getFlagZ = c64.cwrap('c1541_getFlagZ', 'number');
var c1541_getFlagV = c64.cwrap('c1541_getFlagV', 'number');
var c1541_getFlagI = c64.cwrap('c1541_getFlagI', 'number');
var c1541_getFlagU = c64.cwrap('c1541_getFlagU', 'number');
var c1541_getFlagB = c64.cwrap('c1541_getFlagB', 'number');




var sid_setModel = c64.cwrap('sid_setModel', '', ['number']);

var sid_setChannelBuffersEnabled = c64.cwrap('sid_setChannelBuffersEnabled', '', ['number']);
var sid_getAudioBuffer = c64.cwrap('sid_getAudioBuffer', 'number');
var sid_getAudioBufferCh = c64.cwrap('sid_getAudioBufferCh', 'number');
var sid_setSampleRate = c64.cwrap('sid_setSampleRate', 'number');
var sid_setVoiceEnabled = c64.cwrap('sid_setVoiceEnabled', 'number');
var sid_readNS = c64.cwrap('sid_readNS', 'number', ['number']);


var c64_getSnapshot = c64.cwrap('c64_getSnapshot', 'number');
var c64_getSnapshotSize = c64.cwrap('c64_getSnapshotSize', 'number');
var c64_loadSnapshot = c64.cwrap('c64_loadSnapshot', null, ['array','number']);

c64['onRuntimeInitialized'] = function() { 

  var model = c64_model;
  
  if(g_c64Settings !== false) {
    if(typeof g_c64Settings.model != 'undefined') {
      model = g_c64Settings.model;
    }
  }

  if(model == 'pal') {
    c64_setModel(1);
  } else if(model == 'ntsc') {
    c64_setModel(2);
  }

  c64_init();

  c64.pastingText = false;
  c64.textToPaste = [];

//  c64.scripting = new C64Scripting();
  c64.colors = new C64Colors();
  c64.colors.init();

  c64.joystick = new C64Joystick();
  c64.joystick.init();


  c64.sound = new C64Sound();
  c64.sound.init();

  if(g_c64Settings !== false) {
    c64.setSettings();

  }

  c64_ready = true;
  c64.colors.setAllColors();

  if(typeof onC64Ready != 'undefined') {
    onC64Ready();
  }
}

c64.setSettings = function() {
  if(typeof g_c64Settings.colors != 'undefined' && typeof g_c64Settings.colors.length != 'undefined') {
    if(g_c64Settings.colors.length == 16) {
      for(var i = 0; i < g_c64Settings.colors[i]; i++) {
        c64.colors.setColor(i, g_c64Settings.colors[i]);
      }
    }
  }

  if(typeof g_c64Settings.port1 != 'undefined') {
    c64.joystick.setPortEnabled(1, g_c64Settings.port1);
  }

  if(typeof g_c64Settings.port2 != 'undefined') {
    c64.joystick.setPortEnabled(2, g_c64Settings.port2);
  }

  if(typeof g_c64Settings.port1Buttons != 'undefined') {
    c64.joystick.setJoystickButtons(0, g_c64Settings.port1Buttons);
  }

  if(typeof g_c64Settings.port2Buttons != 'undefined') {
    c64.joystick.setJoystickButtons(1, g_c64Settings.port2Buttons);
  }

  if(typeof g_c64Settings.port1Button1Action != 'undefined') {
    c64.joystick.setJoystickButtonAction(0, 1, g_c64Settings.port1Button1Action);
  }

  if(typeof g_c64Settings.port2Button1Action != 'undefined') {
    c64.joystick.setJoystickButtonAction(1, 1, g_c64Settings.port2Button1Action);
  }

  if(typeof g_c64Settings.mousePort1 != 'undefined') {
    c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
  }

  if(typeof g_c64Settings.mousePort2 != 'undefined') {
    c64.joystick.setMousePortEnabled(2, g_c64Settings.mousePort2);
  }

  for(var i = 0; i < 2; i++) {
    var port = i + 1;

    if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {

      c64.joystick.setPortEnabled(port, true);

      if(typeof g_c64Settings['port' + port + 'buttons'] != 'undefined') {
        var buttons = parseInt(g_c64Settings['port' + port + 'buttons'], 10);
        c64.joystick.setJoystickButtons(i, buttons);
        
      }

      if(typeof g_c64Settings['port' + port + 'buttonactions'] != 'undefined' && typeof g_c64Settings['port' + port + 'buttonactions'].length != 'undefined') {
        var action = g_c64Settings['port' + port + 'buttonactions'][1];
        c64.joystick.setJoystickButtonAction(i, 1, action);
      }
        
    }
/*      
    if(typeof g_c64Settings['mousePort' + port] != 'undefined') {
//        c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
    }
*/  
  }

  if(typeof g_c64Settings.sid != 'undefined') {
    c64.sound.setModel(g_c64Settings.sid);
  }
}


c64.insertScreenCodes = function(screenCodes) {
  c64.textToPaste = [];
  for(var i = 0; i < screenCodes.length; i++) {
    c64.textToPaste.push(screenCodes[i]);
  }

  c64.processPasteText();
}

// http://sta.c64.org/cbm64pet.html
http://retro64.altervista.org/blog/commodore-64-keyboard-buffer-tricks-deleting-and-creating-basic-lines-from-basic/

c64.insertText = function(text) {

  //var keycodes = [];
  c64.textToPaste = [];
  text = text.toUpperCase();

//  text = text.replace("\r\n", "\n");
  text = text.split("\r\n").join("\n");
    
  for(var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    switch(code) {
      case 10:
        code = 13;
        break;
    }
    c64.textToPaste.push(code);
  }

  c64.processPasteText();
}

c64.processPasteText = function() {


  if(c64.textToPaste.length == 0) {
    c64.pastingText = false;
  }

  c64.pastingText = true;
  // check if buffer is empty yet
  var bufferLength = c64_cpuRead(0xc6);
  if(bufferLength != 0) {
    // still waiting for buffer to empty
    return;
  }

  // address of keyboard buffer
  var bufferAddress = 0x277;

  var textLength = c64.textToPaste.length;
  var index = 0;

  var bufferLength = textLength;
  if(bufferLength > 8) {
    bufferLength = 8;
  }

  // write text into buffer
  c64_cpuWrite(0xc6, bufferLength);
  for(var i = 0; i < bufferLength; i++) {
    var keyCode = c64.textToPaste.shift();
    c64_cpuWrite(bufferAddress++, keyCode);
  }

  if(c64.textToPaste.length == 0) {
    c64.pastingText = false;
  }

}

  /*
  // time to increment by before checking buffer again
  var dTime = 5;

  while(textLength > 0) {
    var bufferLength = textLength;
    if(bufferLength > 8) {
      bufferLength = 8;
    }
    textLength -= bufferLength;

    address = 0x277;
//    pla.cpuWrite(0xc6, bufferLength);

    // write text into buffer
    c64_cpuWrite(0xc6, bufferLength);
    for(var i = 0; i < bufferLength; i++) {
//      pla.cpuWrite(address++, keycodes[index++]);
      c64_cpuWrite(address++, keycodes[index++]);
    }

    // wait until buffer goes to 0 length
    var count = 0;
    while(true) {
      count++;
      if(count > 20) {
        console.log('count too big!');
        break;
      }
//        eventScheduler.clock();
      debugger_update(dTime)
      bufferLength = c64_cpuRead(0xc6);
      if(bufferLength == 0) {
        break;
      }
    }

    console.log('buffer is zero!');
  }
}
*/



var C64_KEY_ARROW_LEFT = 0;
var C64_KEY_ONE = 1;
var C64_KEY_TWO = 2;
var C64_KEY_THREE = 3;
var C64_KEY_FOUR = 4;
var C64_KEY_FIVE = 5;
var C64_KEY_SIX = 6;
var C64_KEY_SEVEN = 7;
var C64_KEY_EIGHT = 8;
var C64_KEY_NINE = 9;
var C64_KEY_ZERO = 10;
var C64_KEY_PLUS = 11;
var C64_KEY_MINUS = 12;
var C64_KEY_POUND = 13;
var C64_KEY_CLEAR_HOME = 14;
var C64_KEY_INS_DEL = 15;
var C64_KEY_CTRL = 16;
var C64_KEY_Q = 17;
var C64_KEY_W = 18;
var C64_KEY_E = 19;
var C64_KEY_R = 20;
var C64_KEY_T = 21;
var C64_KEY_Y = 22;
var C64_KEY_U = 23;
var C64_KEY_I = 24;
var C64_KEY_O = 25;
var C64_KEY_P = 26;
var C64_KEY_AT = 27;
var C64_KEY_STAR = 28;
var C64_KEY_ARROW_UP = 29;
var C64_KEY_RUN_STOP = 30;
var C64_KEY_A = 31;
var C64_KEY_S = 32;
var C64_KEY_D = 33;
var C64_KEY_F = 34;
var C64_KEY_G = 35;
var C64_KEY_H = 36;
var C64_KEY_J = 37;
var C64_KEY_K = 38;
var C64_KEY_L = 39;
var C64_KEY_COLON = 40;
var C64_KEY_SEMICOLON = 41;
var C64_KEY_EQUALS = 42;
var C64_KEY_RETURN = 43;
var C64_KEY_COMMODORE = 44;
var C64_KEY_SHIFT_LEFT = 45;
var C64_KEY_Z = 46;
var C64_KEY_X = 47;
var C64_KEY_C = 48;
var C64_KEY_V = 49;
var C64_KEY_B = 50;
var C64_KEY_N = 51;
var C64_KEY_M = 52;
var C64_KEY_COMMA = 53;
var C64_KEY_PERIOD = 54;
var C64_KEY_SLASH = 55;
var C64_KEY_SHIFT_RIGHT = 56;
var C64_KEY_CURSOR_UP_DOWN = 57;
var C64_KEY_CURSOR_LEFT_RIGHT = 58;
var C64_KEY_SPACE = 59;
var C64_KEY_F1 = 60;
var C64_KEY_F3 = 61;
var C64_KEY_F5 = 62;
var C64_KEY_F7 = 63;
var C64_KEY_RESTORE = 64;

var C64_JOYSTICK_UP = 0x1;
var C64_JOYSTICK_DOWN = 0x2;
var C64_JOYSTICK_LEFT = 0x4;
var C64_JOYSTICK_RIGHT = 0x8;
var C64_JOYSTICK_FIRE = 0x10;


var keyDownMap = {};
var joystickEnabled = true;



function shiftedKey(index, keyCode, eventType) {

  if(eventType == 'keydown') {
    c64_keyPressed(C64_KEY_SHIFT_LEFT);
  } else {
    c64_keyReleased(C64_KEY_SHIFT_LEFT);
  }
  if(eventType == 'keyup') {
    index = keyDownMap['kc' + keyCode];
  }
  return index;
}

function nonShiftedKey(index) {
  c64_keyReleased(C64_KEY_SHIFT_LEFT);
  c64_keyReleased(C64_KEY_SHIFT_RIGHT);

  return index;
}

function keyCodeToMatrixIndex(keyCode, e) {
    var eventType = e.type.toLowerCase();
    var index = false;

    if(eventType == 'keydown') {
      if(e.shiftKey) {
//        var kte = C64.KeyTableEntry["matrix"][C64.KeyTableEntry["SHIFT_LEFT"]];
//        this.c64.keyboard.keyPressed(kte);        
        c64_keyPressed(C64_KEY_SHIFT_LEFT); 
      } else {
        
        if(keyCode != 38 && keyCode != 37) {
          // if keycode not up or left
          c64_keyReleased(C64_KEY_SHIFT_RIGHT);
          c64_keyReleased(C64_KEY_SHIFT_LEFT);

          /*
          var kte = C64.KeyTableEntry["matrix"][C64_KEY_SHIFT_RIGHT];
          this.c64.keyboard.keyReleased(kte);        
          var kte = C64.KeyTableEntry["matrix"][C64_KEY_SHIFT_LEFT];
          this.c64.keyboard.keyReleased(kte);        
          */
        }

      }

      if(typeof keyDownMap['kc' + keyCode] != 'undefined' && keyDownMap['kc' + keyCode] !== false) {
        return false;
      }
    }

    e.preventDefault();

    if(typeof e.key != 'undefined') {

      var key = e.key.toLowerCase();

      switch(key) {
        case 'enter': // enter
          index = 43;
        break;
        case ' ': // space
          index = 59;
        break;
        case '`': // `
          index = C64_KEY_ARROW_LEFT;
          break;
        case '~':
          index = C64_KEY_ARROW_UP;
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
        break;
        case '1':  // 1
          index = 1;
        break;
        case '2':  // 2
          index = 2;
        break;
        case '3': //3
          index = 3;
        break;
        case '4':  //4
          index = 4;
        break;
        case '5': //5
          index = 5;
        break;
        case '6':  //6
          index = 6;
        break;
        case '7':  //7
          index = 7;
        break;
        case '8':  //8
          index = 8;
        break;
        case '9':  //9
          index = 9;
        break;
        case '0'://0
          index = 10;
        break;

        case '\\': // \
          index = C64_KEY_POUND;
        break;

        case '-': // -
         index = 12;
        break;


        case 'backspace': // ins delete
        case 'delete':
          index = 15;
        break;

        case 'tab': // tab
          index = C64_KEY_CTRL;
        break;
        case 'control': // ctrl
          index = C64_KEY_COMMODORE;
        break;
        case 'q': // q
          index = 17;
        break;
        case 'w': // w
          index = 18;
        break;
        case 'e': // e
          index = 19;
        break;
        case 'r': // r
          index = 20;
        break;
        case 't': // t
          index = 21;
        break;      
        case 'y': // y
          index = 22;
        break;
        case 'u': // u
          index = 23;
        break;
        case 'i':  // i
          index = 24;
        break;
        case 'o':  //o 
          index = 25;
        break;
        case 'p': // p
          index = 26;
        break;

        case 'escape': // escape
          index = 30;
        break;


        case 'a': // a
          index = 31;
        break;
        case 's': // s
          index = 32;
        break;
        case 'd': // d
          index = 33;
        break;
        case 'f': // f
          index = 34;
        break;
        case 'g': // g
          index = 35;
        break;
        case 'h': // h
          index = 36;
        break;
        case 'j': // j
          index = 37;
        break;
        case 'k': // k
          index = 38;
        break;
        case 'l': // l
          index = 39;
        break;
        case ':':
          index = C64_KEY_COLON;
          if(eventType == 'keydown') {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
            c64_keyReleased(C64_KEY_SHIFT_RIGHT);
          }
        break;
        case ';':
          index = C64_KEY_SEMICOLON;
        break;

        case '[':
          index = C64_KEY_COLON;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

          break;
        case ']':
          index = C64_KEY_SEMICOLON;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

          break;


        case '=':
          index = 42;
        break;

        case 'capslock':
          index = 44;
        break;

        case 'z': // z
          index = 46;
        break;
        case 'x': // x
          index = 47;
        break;
        case 'c': // c
          index = 48;
        break;
        case 'v': // v
          index = 49;
        break;
        case 'b': // b
          index = 50;
        break;
        case 'n': // n
          index = 51;
        break;
        case 'm': // m
          index = 52;
        break;

        case ',': // ,
        case '<':
          index = C64_KEY_COMMA;
        break;

        case '.': // .
        case '>':
          index = C64_KEY_PERIOD;
        break;

        case '/':
        case '?':
          index = C64_KEY_SLASH;
        break;


        case 'arrowup': // up          
          index = C64_KEY_CURSOR_UP_DOWN;

          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }

          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'arrowdown': // down
          index = C64_KEY_CURSOR_UP_DOWN;
        break;
        case 'arrowleft': // left
          index = C64_KEY_CURSOR_LEFT_RIGHT;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'arrowright':  // right
          index = C64_KEY_CURSOR_LEFT_RIGHT;

        break;

        case '!':
          index = shiftedKey(C64_KEY_ONE, keyCode, eventType);
/*
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
*/
          break;

        case '"':
          index = shiftedKey(C64_KEY_TWO, keyCode, eventType);
          /*
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
          */
          break;
        case '#':
          index = shiftedKey(C64_KEY_THREE, keyCode, eventType);
          break;
        case '$':
          index = shiftedKey(C64_KEY_FOUR, keyCode, eventType);
          /*
          index = C64_KEY_FOUR;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }
          */
          break;

        case '%': 
          index = shiftedKey(C64_KEY_FIVE, keyCode, eventType);
        break;

        case '&':
          index = shiftedKey(C64_KEY_SIX, keyCode, eventType);
          break;

        case "'":
          index = shiftedKey(C64_KEY_SEVEN, keyCode, eventType);          
          break;

        case '(':
          index = shiftedKey(C64_KEY_EIGHT, keyCode, eventType);          
          break;
        case ')':
          index = shiftedKey(C64_KEY_NINE, keyCode, eventType);          
        break;


        
        case '@':
          index = nonShiftedKey(C64_KEY_AT);
        break;

        case '^':
          index = nonShiftedKey(C64_KEY_ARROW_UP);
        break;

        case '*': 
          index = nonShiftedKey(C64_KEY_STAR);
        break;
        case '+': 
          index = nonShiftedKey(C64_KEY_PLUS);
        break;


        case 'f1': // f1
          index = C64_KEY_F1;
        break;
        case 'f2': // f2
          index = C64_KEY_F1;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'f3': // f3
          index = C64_KEY_F3;
        break;
        case 'f4': // f4
          index = C64_KEY_F3;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
          if(eventType == 'keyup') {
            index = keyDownMap['kc' + keyCode];
          }

        break;
        case 'f5': // f5
          index = C64_KEY_F5;
        break;
        case 'f6': // f6
          index = C64_KEY_F5;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);

          }

        break;
        case 'f7': // f7
          index = C64_KEY_F7;
        break;
        case 'f8': // f8
          index = C64_KEY_F7;
          if(eventType == 'keydown') {
            c64_keyPressed(C64_KEY_SHIFT_LEFT);
          } else {
            c64_keyReleased(C64_KEY_SHIFT_LEFT);
          }
        break;
        case 'shift': // shift left
          index = 45;
        break;

      }
    }

    if(eventType == 'keydown') {
      keyDownMap['kc' + keyCode] = index;
    } else {
      keyDownMap['kc' + keyCode] = false;
    }


    return index;
  }


function c64_keydown(e) {
  e.preventDefault();

  var keyCode = e.keyCode;
  var matrixIndex = this.keyCodeToMatrixIndex(keyCode, e);
  if(matrixIndex === false) {
    return;
  }
  c64_keyPressed(matrixIndex);

}

function c64_keyup(e) {
  e.preventDefault();

  var keyCode = e.keyCode;
  var matrixIndex = this.keyCodeToMatrixIndex(keyCode, e);
  if(matrixIndex === false) {
    return;
  }
  c64_keyReleased(matrixIndex);

}


// emscripten functions


// start of new frame
function c64_frame() {
//  g_app.assemblerEditor.debuggerCompact.scripting.scriptProcessor.triggerEvent('c64.frame');
  if(c64.scripting) {
    c64.scripting.scriptProcessor.triggerEvent('c64.frame');
  }
}

function c64_rasterY(rasterY) {

  if(c64.scripting) {
//    c64.scripting.scriptProcessor.triggerEvent('c64.rastery');
  }
}

var D64Util = {};

D64Util.trackInfo = [
  { track:  0, numSectors:0,  sectorsIn:  0, d64Offset: 0x00000 }, // for 1-based track indexing
  { track:  1, numSectors:21, sectorsIn:  0, d64Offset: 0x00000 },
  { track:  2, numSectors:21, sectorsIn: 21, d64Offset: 0x01500 },
  { track:  3, numSectors:21, sectorsIn: 42, d64Offset: 0x02A00 },
  { track:  4, numSectors:21, sectorsIn: 63, d64Offset: 0x03F00 },
  { track:  5, numSectors:21, sectorsIn: 84, d64Offset: 0x05400 },
  { track:  6, numSectors:21, sectorsIn:105, d64Offset: 0x06900 },
  { track:  7, numSectors:21, sectorsIn:126, d64Offset: 0x07E00 },
  { track:  8, numSectors:21, sectorsIn:147, d64Offset: 0x09300 },
  { track:  9, numSectors:21, sectorsIn:168, d64Offset: 0x0A800 },
  { track: 10, numSectors:21, sectorsIn:189, d64Offset: 0x0BD00 },
  { track: 11, numSectors:21, sectorsIn:210, d64Offset: 0x0D200 },
  { track: 12, numSectors:21, sectorsIn:231, d64Offset: 0x0E700 },
  { track: 13, numSectors:21, sectorsIn:252, d64Offset: 0x0FC00 },
  { track: 14, numSectors:21, sectorsIn:273, d64Offset: 0x11100 },
  { track: 15, numSectors:21, sectorsIn:294, d64Offset: 0x12600 },
  { track: 16, numSectors:21, sectorsIn:315, d64Offset: 0x13B00 },
  { track: 17, numSectors:21, sectorsIn:336, d64Offset: 0x15000 },
  { track: 18, numSectors:19, sectorsIn:357, d64Offset: 0x16500 },
  { track: 19, numSectors:19, sectorsIn:376, d64Offset: 0x17800 },
  { track: 20, numSectors:19, sectorsIn:395, d64Offset: 0x18B00 },
  { track: 21, numSectors:19, sectorsIn:414, d64Offset:0x19E00 },
  { track: 22, numSectors:19, sectorsIn:433, d64Offset:0x1B100 },
  { track: 23, numSectors:19, sectorsIn:452, d64Offset:0x1C400 },
  { track: 24, numSectors:19, sectorsIn:471, d64Offset:0x1D700 },
  { track: 25, numSectors:18, sectorsIn:490, d64Offset:0x1EA00 },
  { track: 26, numSectors:18, sectorsIn:508, d64Offset:0x1FC00 },
  { track: 27, numSectors:18, sectorsIn:526, d64Offset:0x20E00 },
  { track: 28, numSectors:18, sectorsIn:544, d64Offset:0x22000 },
  { track: 29, numSectors:18, sectorsIn:562, d64Offset:0x23200 },
  { track: 30, numSectors:18, sectorsIn:580, d64Offset:0x24400 },
  { track: 31, numSectors:17, sectorsIn:598, d64Offset:0x25600 },
  { track: 32, numSectors:17, sectorsIn:615, d64Offset:0x26700 },
  { track: 33, numSectors:17, sectorsIn:632, d64Offset:0x27800 },
  { track: 34, numSectors:17, sectorsIn:649, d64Offset:0x28900 },
  { track: 35, numSectors:17, sectorsIn:666, d64Offset:0x29A00 },
  { track: 36, numSectors:17, sectorsIn:683, d64Offset:0x2AB00 },
  { track: 37, numSectors:17, sectorsIn:700, d64Offset:0x2BC00 },
  { track: 38, numSectors:17, sectorsIn:717, d64Offset:0x2CD00 },
  { track: 39, numSectors:17, sectorsIn:734, d64Offset:0x2DE00 },
  { track: 40, numSectors:17, sectorsIn:751, d64Offset:0x2EF00 }
];

/*
function petsciiToScreen(p) {
  if (p >= 0 && p < 32) {
    return p + 128;
  } else if (p >= 32 && p < 64) {
    return p;
  } else if (p >= 64 && p < 96) {
    return p - 64;
  } else if (p >= 96 && p < 128) {
    return p - 32;
  } else if (p >= 128 && p < 160) {
    return p + 64;
  } else if (p >= 160 && p < 192) {
    return p - 64;
  } else if (p >= 192 && p < 224) {
    return p - 128;
  } else if (p >= 224 && p < 255) {
    return p - 128;
  } else if (p == 255) {
    return 94;
  } else {
//    throw new Error('impossible - bug above');
  }
}
*/
/*
function petsciiToScreenArray(petscii) {
  //const dst = new Uint8Array(petscii.length);
  var dst = '';
  for (var i = 0; i < petscii.length; i++) {
    //dst += String.fromCharCode(petsciiToScreen(petscii[i]));
    dst += String.fromCharCode(petscii[i]);
  }
  return dst;
}
*/

D64Util.getOffset = function(track, sector) {
  return D64Util.trackInfo[track].d64Offset + sector*256;
}

// each sector is 256 bytes, first byte is next track next byte is next sector
D64Util.d64ReadFile = function(d64Binary, track, sector) {
  var data = [];

  while(1) {
    var offset = D64Util.getOffset(track, sector);
    var nextTrack = d64Binary[offset + 0];
    var nextSector = d64Binary[offset + 1];
    
    var bytesToRead = 254;
    if(nextTrack == 0) {
      bytesToRead = nextSector - 1;
    }

    for(var i = 0; i < bytesToRead; i++) {
      data.push(d64Binary[offset + i + 2]);
    }

    if(nextTrack == 0) {
      break;
    }
    track = nextTrack;
    sector = nextSector;
  }

  return new Uint8Array(data);
}

D64Util.getFirstPRG = function(d64Binary) {

  var dirEntries = D64Util.readDirectory(d64Binary);
  var prgIndex = false;
  for(var i = 0; i < dirEntries.length; i++) {
    if(dirEntries[i].type == 'prg') {
      prgIndex = i;
      break;
    }
  }

  if(prgIndex === false) {
    return null;
  }
  
  var file = D64Util.d64ReadFile(d64Binary, dirEntries[prgIndex].track, dirEntries[prgIndex].sector);
  return file;

}

// http://unusedino.de/ec64/technical/formats/d64.html

/*
The directory track should be contained totally on track 18. Sectors 1-18
contain the entries and sector 0 contains the BAM (Block Availability  Map)
and disk name/ID. Since the directory is only 18 sectors large (19 less one
for the BAM), and each sector can contain only  8  entries  (32  bytes  per
entry), the maximum number of directory entries is 18 * 8 = 144. The  first
directory sector is always 18/1,
*/
D64Util.readDirectory = function(d64Binary) {
  var dirEntries = [];

  var deTrack = 18
  var deSector = 1;
  while (deTrack != 0) {
    var deOffset = D64Util.getOffset(deTrack, deSector);

    var offset = deOffset;
    for (var i = 0; i < 8; i++, offset += 32) {
      // 02: File type.
      var fileType = d64Binary[offset + 2];

      console.log("file type = " + fileType);
      /*
        Typical values for this location are:
          $00 - Scratched (deleted file entry)
          80 - DEL
          81 - SEQ
          82 - PRG
          83 - USR
          84 - REL      
      */
      if (fileType == 0) {
        continue;
      }
      switch (fileType & 7) {
        case 0: 
          fileType = 'del'; 
          break;
        case 1: 
          fileType = 'seq'; 
          break;
        case 2: 
          fileType = 'prg'; 
          break;
        case 3: 
          fileType = 'usr'; 
          break;
        case 4: 
          fileType = 'rel'; 
          break;
        default: 
          fileType = 'unk';
          break;
//        default:
//          throw new Error('Unknown directory entry file type');
      }
      var petsciiName = d64Binary.slice(offset + 0x05, offset + 0x15);

      //03-04: Track/sector location of first sector of file
      var track = d64Binary[offset + 3];
      var sector = d64Binary[offset + 4];
      var sectors = d64Binary[offset + 0x1f] * 256 + d64Binary[offset + 0x1e];

      var name = '';
      for (var i = 0; i < petsciiName.length; i++) {
        name += String.fromCharCode(petsciiName[i]);
      }

      
      dirEntries.push({
        type: fileType,
//        petsciiName,
//        screencodeName: petsciiToScreenArray(petsciiName),
        name: name,
        d64FileOffset: offset + 0x05,
        track: track,
        sector: sector,
        sectors: sectors
      })
    }

    // The first two bytes of the sector ($12/$04) indicate the location of  the
    // next track/sector of the directory (18/4). If the track is set to $00, then
    // it is the last sector of the directory.

    deTrack  = d64Binary[deOffset + 0];
    deSector = d64Binary[deOffset + 1];
    console.log('de track = ' + deTrack + ':' + deSector);
    if (deTrack == 0) {
      break;
    }
  }

  console.log(dirEntries);


  return dirEntries;
}




if (window.performance && window.performance.now) {
  getTimestamp = function() { return window.performance.now(); };
} else {
  if (window.performance && window.performance.webkitNow) {
    getTimestamp = function() { return window.performance.webkitNow(); };
  } else {
    getTimestamp = function() { return new Date().getTime(); };
  }
}


var g_started = false;
var g_lastUpdate = getTimestamp();

function base64ToBuffer( str ) {
  var b = atob( str );
  var buf = new Uint8Array( b.length );

  for ( var i = 0, l = buf.length; i < l; i ++ ) {
    buf[ i ] = b.charCodeAt( i );
  }
  return buf;
}

var isMobileBrowser = {
  Android: function() {
      return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
      return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function() {
      //return true;
      return (isMobileBrowser.Android() || isMobileBrowser.BlackBerry() || isMobileBrowser.iOS() || isMobileBrowser.Opera() || isMobileBrowser.Windows());
  }
};      


var offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 384;
offscreenCanvas.height = 272;
var offscreenContext = offscreenCanvas.getContext('2d');
var imageData = offscreenContext.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
var mouseInCanvas = false;
var mouseC64X = 0;
var mouseC64Y = 0;
var canvas = document.getElementById('c64-canvas');
canvas.width = 384;
canvas.height = 272; 
var context = canvas.getContext('2d');
var isMobile = isMobileBrowser.any();
var orientation = 0;
if(isMobile) {
  orientation =  window.innerWidth > window.innerHeight ? 90 : 0;
}
var isFullscreen = false;

var onScreenJoystick = null;
var onScreenKeyboard = null;
var overlayOnscreenJoystick = null;
var currentOnscreenControl = 'joystick';
var arrowKeysImage = new Image();
arrowKeysImage.src = 'images/arrowkeys.png';

var zKeyImage = new Image();
zKeyImage.src = 'images/zkey.png';

var xKeyImage = new Image();
xKeyImage.src = 'images/xkey.png';

var controlsImage = new Image();
controlsImage.src = 'images/controls.png'

var orGamepadImage = new Image();
orGamepadImage.src = 'images/orgamepad.png'

var plusImage = new Image();
plusImage.src = 'images/orgamepad.png'

var injectPRG = false;
var prgRandomDelay = false;

var c64Scale = 1;

var userAgent = window.navigator.userAgent;
var platform = window.navigator.platform;
var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
var os = null;

if (macosPlatforms.indexOf(platform) !== -1) {
  os = 'Mac OS';
} else if (iosPlatforms.indexOf(platform) !== -1) {
  os = 'iOS';
} else if (windowsPlatforms.indexOf(platform) !== -1) {
  os = 'Windows';
} else if (/Android/.test(userAgent)) {
  os = 'Android';
} else if (!os && /Linux/.test(platform)) {
  os = 'Linux';
}


canvas.style.cursor = "pointer";

document.addEventListener('keydown', function(event) {

  if(c64_ready) {
    if(c64.joystick.keyDown(event)) {
      return;
    }
    c64_keydown(event);
  }
}, false);

document.addEventListener('keyup', function(event) {
  if(c64_ready) {
    if(c64.joystick.keyUp(event)) {
      return;
    }

    c64_keyup(event);
  }
}, false);

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

canvas.addEventListener('mousedown', function(event) {
  if(!g_started) {
    startContent();
  } else {
    mouseDown(event);
  }
});

canvas.addEventListener('mouseup', function(event) {
  mouseUp(event);
});


canvas.addEventListener('mousemove', function(event) {
  mouseMove(event);
});

canvas.addEventListener('mouseenter', function(event) {
///        mouseEnter();
  mouseInCanvas = true;
});

canvas.addEventListener('mouseleave', function(event) {
//        mouseLeave();
  mouseInCanvas = false;
});

//      var holder = document.getElementById('c64-holder');
window.addEventListener('resize', function(event) {
  resize();
});



document.getElementById('c64-holder').addEventListener('fullscreenchange', function(event) {
  if (document.fullscreenElement) {
  } else {
    isFullscreen = false;
    if(isMobile) {
      g_started = false;
    }
    resize();
  }
});      

var fullscreenButton = document.getElementById('c64-fullscreen');
if(fullscreenButton) {
  fullscreenButton.addEventListener('click', function(event) {
    fullscreen();
  });
}


window.addEventListener("orientationchange", function(event) {
//  orientation = event.target.screen.orientation.angle;
//  layoutMobile();
});


function setupOnscreenControls() {
  onScreenJoystick = new C64OnscreenJoystick();
  onScreenJoystick.initEvents();

  overlayOnscreenJoystick = new C64OnscreenJoystick();
  overlayOnscreenJoystick.id = 'c64-overlay-onscreen-joystick';
  overlayOnscreenJoystick.initEvents();

  onScreenKeyboard = new C64OnscreenKeyboard();
  onScreenKeyboard.loadFont();
  onScreenKeyboard.initKeyboard();
  onScreenKeyboard.initEvents();

  var keyboardTab = document.getElementById('c64-onscreen-keyboard-tab');
  var joystickTab = document.getElementById('c64-onscreen-joystick-tab');

  keyboardTab.addEventListener('click', function(event) {
    keyboardTab.className = "tab tab-current";
    joystickTab.className = "tab";
    currentOnscreenControl = 'keyboard';
    resize();

  });
  
  joystickTab.addEventListener('click', function(event) {
    keyboardTab.className = "tab";
    joystickTab.className = "tab tab-current";
    currentOnscreenControl = 'joystick';
    resize();

  });

  if(g_c64Settings.mobileJoystick) {
    currentOnscreenControl = 'joystick';
  } else if(g_c64Settings.mobileKeyboard) {
    currentOnscreenControl = 'keyboard';
  }


  // settings
  for(var i = 0; i < 2; i++) {
    var port = i + 1;

    if(typeof g_c64Settings['port' + port] != 'undefined' && g_c64Settings['port' + port]) {
      onScreenJoystick.setPort(port);
      overlayOnscreenJoystick.setPort(port);


      if(typeof g_c64Settings['port' + port + 'buttons'] != 'undefined') {
        var buttons = parseInt(g_c64Settings['port' + port + 'buttons'], 10);
        onScreenJoystick.setType(buttons);
        overlayOnscreenJoystick.setType(buttons);
      }

      if(typeof g_c64Settings['port' + port + 'buttonactions'] != 'undefined' && typeof g_c64Settings['port' + port + 'buttonactions'].length != 'undefined') {
        var action = g_c64Settings['port' + port + 'buttonactions'][1];
        onScreenJoystick.setSecondButton(action);
        overlayOnscreenJoystick.setSecondButton(action);

      }
        
    }
/*      
    if(typeof g_c64Settings['mousePort' + port] != 'undefined') {
//        c64.joystick.setMousePortEnabled(1, g_c64Settings.mousePort1);
    }
*/  
  }


}

function layoutMobile() {

  resize();

}

function startContent() {
  c64.sound.checkAudio();

  canvas.style.cursor = "none";

  if(isMobile) {
    fullscreen();
    layoutMobile();
  }
  c64_reset();

  if(typeof g_prg != 'undefined' && g_prg) {
    if(typeof g_c64Settings != 'undefined' && g_c64Settings.prgLoadMethod != 'undefined') {
      injectPRG = g_c64Settings.prgLoadMethod == 'inject';
    }

    if(typeof g_c64Settings != 'undefined' && g_c64Settings.prgLoadMethod != 'undefined') {
      prgRandomDelay = g_c64Settings.prgRandomDelay;
    }

    var prgData = base64ToBuffer(g_prg);

    var delay = 1;
    if(prgRandomDelay) {
      delay = Math.random() * 100;
    }

    setTimeout(function() {
      c64_loadPRG(prgData, prgData.length, injectPRG);
      if(injectPRG) {
        c64.insertText('run\n');
      } else {
        setTimeout(function() {
          c64.insertText('load "*",8,1\nrun\n');
        }, 2000);
      }
    }, delay);
  }

  if(typeof g_d64 != 'undefined' && g_d64) {
    var d64Data = base64ToBuffer(g_d64);
    c64_insertDisk(d64Data, d64Data.length);
/*
    var prgData = D64Util.getFirstPRG(d64Data);
    c64_loadPRG(prgData, prgData.length, false);   
    c64.insertText('run:\n');
*/
    setTimeout(function() {
      c64.insertText('load "*",8,1\nrun\n');
    }, 2000);

  }

  if(typeof g_crt != 'undefined' && g_crt) {
    var crtData = base64ToBuffer(g_crt);
    c64_loadCRT(crtData, crtData.length);
  }

  if(typeof g_snapshot != 'undefined' && g_snapshot) {
    var snapshotData = base64ToBuffer(g_snapshot);
    c64_loadSnapshot(snapshotData, snapshotData.length);
  }

  g_started = true;        
}

function reset() {
  c64_reset();
}

function mouseMove(event) {

  var canvasRect = this.canvas.getBoundingClientRect();
  var canvasLeft = canvasRect.left + document.body.scrollLeft;
  var canvasTop = canvasRect.top + document.body.scrollTop;


  var x = event.pageX - canvasLeft;
  var y = event.pageY - canvasTop;    

  x = Math.floor(x / c64Scale);
  y = Math.floor(y / c64Scale);

  mouseC64X = x;
  mouseC64Y = y + 15;

}


LEFTMOUSEBUTTON = 1;
RIGHTMOUSEBUTTON = 2;
MIDDLEMOUSEBUTTON = 4;

function setButtons(event) {
  if(typeof event.buttons != 'undefined') {
    buttons = event.buttons;
  } else {
    if(typeof event.which !== 'undefined') {
      buttons = event.which;

    } else if(typeof event.nativeEvent !== 'undefined') {
      if(typeof event.nativeEvent.which != 'undefined') {
        buttons = event.nativeEvent.which;
      }
      if(typeof event.nativeEvent.buttons != 'undefined') {
        buttons = event.nativeEvent.buttons;
      }
    }
  }

  if(typeof event.touches != 'undefined' && event.touches.length == 1) {

    buttons = LEFTMOUSEBUTTON;
  }

  if(event.ctrlKey && (buttons & LEFTMOUSEBUTTON)  ) {
    if(os == 'Mac OS') {
      buttons = UI.RIGHTMOUSEBUTTON;
    }
  }
}

function mouseDown(event) {
  setButtons(event);

  // is mouse enabled?
  for(var i = 0; i < 2; i++) {
    if(c64.joystick.getMousePortEnabled(i)) {
      event.preventDefault();
      if(buttons & LEFTMOUSEBUTTON) {
        c64_joystickPush(i, C64_JOYSTICK_FIRE);
      }

      if(buttons & RIGHTMOUSEBUTTON) {
        c64_joystickPush(i, C64_JOYSTICK_UP);
      }     
    }
  }
}

function mouseUp(event) {

  for(var i = 0; i < 2; i++) {
    if(c64.joystick.getMousePortEnabled(i)) {
      event.preventDefault();
      if(buttons & LEFTMOUSEBUTTON) {
        c64_joystickRelease(i, C64_JOYSTICK_FIRE);
      }

      if(buttons & RIGHTMOUSEBUTTON) {
        c64_joystickRelease(i, C64_JOYSTICK_UP);
      }    
    }
  }

}

function redraw() {
  var ptr = c64_getPixelBuffer();
  var len = 384*272*4;

  var view = new Uint8Array(c64.HEAPU8.subarray(ptr, ptr+len)); // create a new view
  var data = imageData.data;
  data.set(view);

  offscreenContext.putImageData(imageData, 0, 0);
  context.drawImage(
                      offscreenCanvas, 
                      0, 0, offscreenCanvas.width, offscreenCanvas.height,
                      0, 0, canvas.width, canvas.height
                    );

  if(!g_started) {
    var width = canvas.width;
    var height = canvas.height;

    var triangleWidth = 50;
    var triangleHeight = 60;
    if(canvas.width < 400) {
      triangleWidth = 25;
      triangleHeight = 30;
    }

    var triangleLeft = Math.floor( (width - triangleWidth) / 2);
    var triangleTop = Math.floor( (height - triangleHeight) / 2);

    if(mouseInCanvas) {
      context.fillStyle = '#ffffff';
    } else {
      context.fillStyle = '#cccccc';
    }
    context.beginPath();
    context.moveTo(triangleLeft, triangleTop);
    context.lineTo(triangleLeft + triangleWidth, triangleTop + triangleHeight / 2);
    context.lineTo(triangleLeft, triangleTop + triangleHeight);
    context.fill();          

    if(g_c64Settings.mobileJoystick && !isMobile && typeof arrowKeysImage.naturalWidth != 'undefined') {
      context.filter = 'brightness(90%)';

        var scale = 1;
        if(canvas.width < 400) {
          scale = 0.5;
        }

        var center = Math.floor(width / 2);

        var yOffset = 60 * scale;
        var xOffset = 30 * scale;
  
        var controlsTop = triangleTop + triangleHeight + yOffset;

        var controlsImageLeft = center - controlsImage.naturalWidth * scale - xOffset;
        var controlsImageTop = controlsTop;
        controlsImageTop += 30 * scale;
        context.drawImage(controlsImage, 
                          controlsImageLeft, 
                          controlsImageTop, 
                          controlsImage.naturalWidth * scale, controlsImage.naturalHeight * scale);

        if(c64.joystick.hasGamepad()) {
          var orGamepadImageLeft = center + xOffset;
          var orGamepadImageTop = controlsTop + (arrowKeysImage.naturalHeight + 12) * scale;
          context.drawImage(orGamepadImage, 
            orGamepadImageLeft, 
            orGamepadImageTop,
            orGamepadImage.naturalWidth * scale, orGamepadImage.naturalHeight * scale);
        }

        var arrowKeysImageLeft = center + xOffset; 
        //var arrowKeysImageLeft = center - xOffset - arrowKeysImage.naturalWidth;
        var arrowKeysImageTop = controlsTop;
        context.drawImage(arrowKeysImage, 
          arrowKeysImageLeft, 
          arrowKeysImageTop,
          arrowKeysImage.naturalWidth * scale,
          arrowKeysImage.naturalHeight * scale);


        var zKeyImageLeft = center + arrowKeysImage.naturalWidth * scale + xOffset * 2;

        var zKeyImageTop = triangleTop + triangleHeight + yOffset + 32 * scale;//16;
        context.drawImage(zKeyImage, 
          zKeyImageLeft, zKeyImageTop,
          zKeyImage.naturalWidth * scale,
          zKeyImage.naturalHeight * scale);


        if(c64.joystick.getJoystickButtons(0) > 1 || c64.joystick.getJoystickButtons(1) > 1) {
            var xKeyImageLeft = center + arrowKeysImage.naturalWidth * scale + zKeyImage.naturalWidth * scale + xOffset * 2.2;

          var xKeyImageTop = triangleTop + triangleHeight + yOffset + 32 * scale;//16;
          context.drawImage(xKeyImage, 
            xKeyImageLeft, xKeyImageTop,
            xKeyImage.naturalWidth * scale,
            xKeyImage.naturalHeight * scale);

        }
            
      }

      context.filter = 'none';
    }
}

function showControls() {
  console.log("SHOW CONTROLs");
}


function fullscreen() {
  isFullscreen = true;
  var holder = document.getElementById('c64-holder');
  if(holder.requestFullscreen) {
    holder.requestFullscreen();
  } else if (holder.mozRequestFullScreen) { /* Firefox */
    holder.mozRequestFullScreen();
  } else if (holder.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    holder.webkitRequestFullscreen();
  } else if (holder.msRequestFullscreen) { /* IE/Edge */
    holder.msRequestFullscreen();
  }        

  if(isMobile) {
    setupOnscreenControls();          
  }
  resize();
}


function onC64Ready() {
}

function resize() {
  var pixelMultiple = true;

  var c64Width = 384;
  var c64Height = 272;

  var holder = document.getElementById('c64-holder');
  var width = holder.clientWidth;
  var height = holder.clientHeight;

  if(isMobile) {
    var tabsHolder = document.getElementById('c64-onscreen-tabs');
    var joystickHolder = document.getElementById('c64-onscreen-joystick');
    var keyboardHolder = document.getElementById('c64-onscreen-keyboard');
    var joystickOverlay = document.getElementById('c64-overlay-onscreen-joystick');

    if(isFullscreen) {
      var mobileControlsHeight = 210;
      var mobileTabsHeight = 40;

      if(orientation == 90) {
        // landscape
        mobileControlsHeight = 0;
        mobileTabsHeight = 0;
      }

      height = height - mobileControlsHeight - mobileTabsHeight;

      if(g_c64Settings.mobileKeyboard && g_c64Settings.mobileJoystick) {
        if(mobileTabsHeight == 0) {
          tabsHolder.style.display = 'none';
        } else {
          tabsHolder.style.bottom = mobileControlsHeight + 'px';
          tabsHolder.style.height = mobileTabsHeight + 'px';
          tabsHolder.style.display = 'block';
        }
      }

      joystickHolder.style.height = mobileControlsHeight + 'px';
      if(g_c64Settings.mobileJoystick && currentOnscreenControl == 'joystick' && mobileControlsHeight > 0) {
        joystickHolder.style.display = 'block';
      } else {
        joystickHolder.style.display = 'none';
      }

      keyboardHolder.style.height = mobileControlsHeight + 'px';
      if(g_c64Settings.mobileKeyboard && currentOnscreenControl == 'keyboard' && mobileControlsHeight > 0) {
        keyboardHolder.style.display = 'block';
      } else {
        keyboardHolder.style.display = 'none';
      }

      if(orientation != 0 && g_c64Settings.mobileJoystick) {
        joystickOverlay.style.display = 'block';
        overlayOnscreenJoystick.draw();
      } else {
        joystickOverlay.style.display = 'none';
      }
    } else {
      tabsHolder.style.display = 'none';
      joystickHolder.style.display = 'none';
      keyboardHolder.style.display = 'none';
      joystickOverlay.style.display = 'none';
    }
  }


  // set the scale of the c64 canvas
  var scale = 1;
  var deviceScale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
  var highDeviceScale = isMobile;

  var hScale = width / c64Width;
  var vScale = height / c64Height;

  if(hScale > vScale) {
    scale = vScale;
  } else {
    scale = hScale;
  }

  if(scale > 1 && pixelMultiple && !highDeviceScale) {
    scale = Math.floor(scale);
  }

  var cssWidth = Math.round(c64Width * scale);
  var cssHeight = Math.round(c64Height * scale);

  c64Scale = scale;

  if(highDeviceScale) {
    canvas.width = Math.round(c64Width * scale * deviceScale);
    canvas.height = Math.round(c64Height * scale * deviceScale);
    canvas.style.width = cssWidth +  'px';
    canvas.style.height = cssHeight +  'px';

  } else {
    canvas.width = Math.round(c64Width * scale);
    canvas.height = Math.round(c64Height * scale);
  }

//  canvas.width = Math.round(c64Width * scale);
//  canvas.height = Math.round(c64Height * scale);
  context = canvas.getContext('2d');



  var top = Math.floor((height - cssHeight) / 2);
  var left = Math.floor((width - cssWidth) / 2);

  canvas.style.top = top + 'px';
  canvas.style.left = left + 'px';

  //if(scale == Math.floor(scale)) {
  if(scale >= 1 && (pixelMultiple || highDeviceScale)) {
    context.imageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.oImageSmoothingEnabled = false;
  } else {
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.msImageSmoothingEnabled = true;
    context.oImageSmoothingEnabled = true;
  }

  var fullscreenHolder = document.getElementById('c64-fullscreen-holder');
  if(fullscreenHolder) {
    if(isMobile) {
      fullscreenHolder.style.display = 'none';
    } else {
      var left = left + cssWidth - 18;
      var top = top + cssHeight + 2;
      fullscreenHolder.style.display = 'block';
      fullscreenHolder.style.left = left + 'px';
      fullscreenHolder.style.top = top + 'px';
    }
  }

  if(isMobile && orientation != 0 && isFullscreen) {
    // need to make sure controls fit
    var sideSpace = Math.floor( (width - cssWidth) / 2 );
    var maxRadius = Math.floor(( (sideSpace - 40) / 2));
    if(maxRadius < 70) {
      maxRadius = 70;
    }
    overlayOnscreenJoystick.maxRadius = maxRadius;
    overlayOnscreenJoystick.draw();
  }

  if(c64_ready) {
    redraw();
  }
}

function render(timestamp) {
  var dTime = timestamp - g_lastUpdate;

  g_lastUpdate = timestamp;
  

  if(onScreenJoystick) {
    onScreenJoystick.draw();
  }

  if(onScreenKeyboard) {
    onScreenKeyboard.draw();
  }
  if(c64_ready) {

    c64.joystick.checkGamepads();
    c64_mousePosition(mouseC64X, mouseC64Y);

    if(c64.pastingText) {
      c64.processPasteText();
    }

    if(isMobile) {
      var currentOrientation = window.innerWidth > window.innerHeight ? 90 : 0;
      if(currentOrientation != orientation) {
        orientation = currentOrientation;
        layoutMobile();
      }

    }
    // refresh screen if debugger says its time, or need to update if currently paused
    if(debugger_update(dTime) || !debugger_isRunning()) {
      redraw();
    }
  }

  requestAnimationFrame( render );
}

render();

resize();


