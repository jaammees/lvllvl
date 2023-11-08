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