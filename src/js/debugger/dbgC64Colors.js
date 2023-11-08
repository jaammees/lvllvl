var DbgC64Colors = function() {
  this.prefix = 'dbg';
  this.visible = false;
  this.currentColor = false;

  this.colorPaletteLoad = null;


  this.palettes = [
    {
      name: "ccs64",
      colors: [
        4279242768, 4294967295, 4282400992, 4294967136, 4292894944, 4282441792, 4292886592, 4282449919, 4282425568, 4282938524, 4288717055, 4283716692, 4287137928, 4288741280, 4294942880, 4290822336
      ]
    },
    {
      name: "colodore",
      colors: [
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
      ],
    
    },
    {
      name: "frodo",
      colors: [
        4278190080, 4294967295, 4278190284, 4291624704, 4294902015, 4278242304, 4291559424, 4278255615, 4278225151, 4278207624, 4287138047, 4282664004, 4287137928, 4287168392, 4294936712, 4291611852
      ]
    },
    /*
    {
      name: "lvllvl",
      colors: [
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
      ]
    },
    */
    {
      name: "pepto-pal",
      colors: [
        4278190080, 4294967295, 4281022312, 4289897584, 4286987631, 4282617176, 4286130229, 4285515704, 4280635247, 4278204739, 4284049306, 4282664004, 4285295724, 4286894746, 4290076268, 4287993237
      ]
    },
    /*
    {
      name: "ptoing",
      colors: [
        4278190080, 4294967295, 4281613964, 4291280762, 4289939341, 4282493288, 4288819518, 4285652176, 4280639376, 4278207063, 4285364155, 4283716692, 4286611584, 4287163052, 4292505724, 4289440683
      ]
    },
    {
      name: "vice",
      colors: [
        4278190080, 4294770429, 4280556222, 4291225136, 4293008052, 4280209951, 4289600289, 4278908639, 4278469048, 4278465386, 4283910910, 4282402114, 4285494384, 4284087897, 4294857567, 4288849828
      ]
    }
    */
   
  ];

}

DbgC64Colors.prototype = {
  init: function(args) {
    if(typeof args.prefix) {
      this.prefix = args.prefix;
    }
    this.colorPaletteLoad = new ColorPaletteLoad();
  },


  buildInterface: function(parentPanel) {
    var _this = this;

//    this.uiComponent = UI.create("UI.SplitPanel", { overflow: "unset" });
    this.uiComponent = UI.create("UI.Panel");
    parentPanel.add(this.uiComponent);

    var html = ''; 

    html += '<div style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; overflow: auto; padding: 8px">';

    html += '<div style="font-size: 0">';
    for(var i = 0; i < 8; i++) {
      var colorIndex = i;
      html += '<div class="' + this.prefix + 'colors" data-colorindex="' + colorIndex + '" style="display: inline-block; width: 32px; height: 32px; background-color: #cccccc; border: 2px solid #000000" id="' + this.prefix + 'Color' + colorIndex + '"></div>'
    }
    html += '</div>';

    html += '<div>';
    for(var i = 0; i < 8; i++) {
      var colorIndex = 8 + i;
      html += '<div class="' + this.prefix + 'colors" data-colorindex="' + colorIndex + '" style="display: inline-block; width: 32px; height: 32px; background-color: #cccccc; border: 2px solid #000000" id="' + this.prefix + 'Color' + colorIndex + '"></div>'
    }
    html += '</div>';

    html += '<div>';
    html += '<h3 id="' + this.prefix + 'colorHeading" style="border-bottom: 0">Color</h3>';

    html += '<div>';
    html += '  <input type="color" id="' + this.prefix + 'ColorControl" class="' + this.prefix + 'ColorControl"  value="#ff0000">';
    html += '</div>';

    html += '</div>';

    html += '<form id="' + this.prefix + 'PaletteForm">';
    html += '<input class="formControl"  id="' + this.prefix + 'PaletteFile" type="file"  style="position: absolute; top: -50px; left: -100px" accept=".png,.json,.aco,.act,.ase,.gpl,.txt,.hex,.vpl,.jpg,.jpeg"/>';
    html += '</form>';

    html += '<div>';
    html += '<div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #222222">';
    html += '<div class="ui-button" style="margin-right: 6px" id="' + this.prefix + 'ResetCurrentColor">Reset Current Colour</div>';
    html += '<div class="ui-button" style="margin-right: 6px" id="' + this.prefix + 'ResetAllColors">Reset All Colours</div>';
    html += '<div class="ui-button" id="' + this.prefix + 'LoadPalette">Load Palette...</div>';
    html += '</div>';

    html += '<div>';
    html += '<label>Palette: '
    html += '<select id="' + this.prefix + 'PaletteSelect">';
    for(var i = 0; i < this.palettes.length; i++) {
      html += '<option value="' + i + '" ';
      if(this.palettes[i].name == 'colodore') {
        html += ' selected="selected" ';
      }
      html += '>' + this.palettes[i].name + '</option>';
    }
    html += '</select>';
    html += '</label>';
    html += '</div>';



    html += '</div>';

    html += '</div>'
    

    this.htmlPanel = UI.create("UI.HTMLPanel", { "html": html });
    this.uiComponent.add(this.htmlPanel);

    UI.on('ready', function() {
      _this.initEvents();
    });
  },

  initEvents: function() {
    var _this = this;

    $('#' + this.prefix + 'ResetCurrentColor').on('click', function() {
      _this.resetColor(_this.currentColor);

    });

    $('#' + this.prefix + 'ResetAllColors').on('click', function() {
      for(var i = 0; i < 16; i++) {
        _this.resetColor(i);
      }
    });

    $('#' + this.prefix + 'LoadPalette').on('click', function() {
      _this.choosePaletteFile();
    });


    $('.' + this.prefix + 'colors').on('click', function() {
      var index = $(this).attr('data-colorindex');
      _this.selectColor(index);
    });

    $('.' + this.prefix + 'ColorControl').on('change', function() {
      var value = $(this).val();
      var colorIndex = _this.currentColor;// $(this).attr('data-colorindex');
      _this.setColor(colorIndex, value);
    });

    $('.' + this.prefix + 'ColorControl').on('input', function() {
      var value = $(this).val();
      var colorIndex = _this.currentColor;// $(this).attr('data-colorindex');
      _this.setColor(colorIndex, value);
    });

    $('.' + this.prefix + 'ColorReset').on('click', function() {
      var colorIndex = $(this).attr('data-colorindex');
      _this.resetColor(colorIndex);
    });

    $('#' + this.prefix + 'PaletteSelect').on('change', function() {
      var paletteIndex = parseInt($(this).val(), 10);
      if(isNaN(paletteIndex)) {
        return;
      }
      _this.selectPalette(paletteIndex);
    });

    document.getElementById(this.prefix + 'PaletteFile').addEventListener("change", function(e) {
      var file = document.getElementById(_this.prefix + 'PaletteFile').files[0];
      _this.setImportFile(file);
    });


  },

  selectPalette: function(paletteIndex) {
    var colors = this.palettes[paletteIndex].colors;

/*
    for(var i = 0; i < colors.length; i++) {
      var r = (colors[i] >> 16) & 0xff;
      var g = (colors[i] >> 8) & 0xff;
      var b = (colors[i] ) & 0xff;

      var color = r & 0xff;// ( (r & 0xff) + (g & 0xff) << 8 + (b & 0xff) << 16);
      color += (g & 0xff) << 8;
      color += (b & 0xff) << 16;
  
      color = (color >>> 0) + 0xff000000;
  

      colors[i] = color;
    }
*/
    console.log(colors);

    for(var i = 0; i < colors.length; i++) {
      c64.colors.setColor(i, colors[i]);
      this.updateColor(i);
  
    }

  },

  setImportFile: function(file) {
    var _this = this;
    this.colorPaletteLoad.setImportFile(file, function(colors) {
      if(colors) {
        console.log(colors);
        var colorsLength = colors.length;
        if(colorsLength > 16) {
          colorsLength = 16;
        }

        for(var i = 0; i < colorsLength; i++) {
          var r = (colors[i] >> 16) & 0xff;
          var g = (colors[i] >> 8) & 0xff;
          var b = (colors[i]) & 0xff;
          var color = r & 0xff;// ( (r & 0xff) + (g & 0xff) << 8 + (b & 0xff) << 16);
          color += (g & 0xff) << 8;
          color += (b & 0xff) << 16;
      
          color = (color >>> 0) + 0xff000000;

          c64.colors.setColor(i, color);
          _this.updateColor(i);
      
        }

      }
    });
    
  },

  choosePaletteFile: function() {
    document.getElementById(this.prefix + 'PaletteForm').reset();
    $('#' + this.prefix + 'PaletteFile').click();
  },

  selectColor: function(colorIndex)  {
    this.currentColor = colorIndex;
    $('#' + this.prefix + 'colorHeading').html('Colour ' + colorIndex);

    var color = c64.colors.getColor(colorIndex) & 0xffffff;
    var r = color & 0xff;
    var g = (color >> 8) & 0xff;
    var b = (color >> 16) & 0xff;

    r = ("00" + r.toString(16)).substr(-2);
    g = ("00" + g.toString(16)).substr(-2);
    b = ("00" + b.toString(16)).substr(-2);
    color = '#' + r + g + b;
    $('#' + this.prefix + 'ColorControl').val(color);

    $('.' + this.prefix + 'colors').css('border', '2px solid transparent');
    $('#' + this.prefix + 'Color' + colorIndex).css('border', '2px solid #cccccc');

  },

  resetColor: function(colorIndex) {
    c64.colors.resetColor(colorIndex);
    this.setVisible(true);

  },

  setColor: function(colorIndex, color) {
    colorIndex = parseInt(colorIndex, 10);
    if(isNaN(colorIndex)) {
      return;
    }
    if(color.length == 0) {
      return;
    }
    if(color[0] == '#') {
      color = color.substr(1);
    }

    if(color.length != 6) {
      return;
    }

    var r = parseInt(color.substr(0, 2), 16);
    var g = parseInt(color.substr(2, 2), 16);
    var b = parseInt(color.substr(4, 2), 16);
    if(isNaN(r) || isNaN(g) || isNaN(b)) {
      return;
    }

    var color = r & 0xff;// ( (r & 0xff) + (g & 0xff) << 8 + (b & 0xff) << 16);
    color += (g & 0xff) << 8;
    color += (b & 0xff) << 16;

    color = (color >>> 0) + 0xff000000;

    c64.colors.setColor(colorIndex, color);
    this.updateColor(colorIndex);
  
  },

  updateColor: function(colorIndex) {
    var color = c64.colors.getColor(colorIndex) & 0xffffff;
    var r = color & 0xff;
    var g = (color >> 8) & 0xff;
    var b = (color >> 16) & 0xff;

    r = ("00" + r.toString(16)).substr(-2);
    g = ("00" + g.toString(16)).substr(-2);
    b = ("00" + b.toString(16)).substr(-2);
    color = '#' + r + g + b;
    $('#' + this.prefix + 'Color' + colorIndex).css('background-color',  color);
  },

  setVisible: function(visible) {
    this.visible = visible;

    if(visible) {
      if(this.currentColor === false) {
        this.selectColor(0);
      }
      for(var i = 0; i < 16; i++) {
        var color = c64.colors.getColor(i) & 0xffffff;
        var r = color & 0xff;
        var g = (color >> 8) & 0xff;
        var b = (color >> 16) & 0xff;

        r = ("00" + r.toString(16)).substr(-2);
        g = ("00" + g.toString(16)).substr(-2);
        b = ("00" + b.toString(16)).substr(-2);
        color = '#' + r + g + b;
        console.log('color = ' + color);
        $('#' + this.prefix + 'Color' + i).css('background-color',  color);
//        $('#' + this.prefix + 'ColorControl' + i).val( color);

      }
    }
  },

  
  update: function() {

  }


}