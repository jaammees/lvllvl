var ExportX16Basic = function() {
  this.editor = null;
}


ExportX16Basic.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  start: function() {
    console.log('export x16 basic start...');
    var _this = this;

    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.Dialog", { "id": "exportX16BasicDialog", "title": "Export X16 Basic", "width": 800, "height": 600 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/exportX16Basic.html', function() {
        _this.initContent();
        _this.initEvents();
      });

      this.displayButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-614-copy.svg"/> Copy To Clipboard', "color": "primary" });
      this.uiComponent.addButton(this.displayButton);
      this.displayButton.on('click', function(event) {
        //UI.closeDialog();
        _this.copyToClipboard();
      });


      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });

    } else {
      this.initContent();
    }

    UI.showDialog("exportX16BasicDialog");
  },    

  initEvents: function() {

  },

  initContent: function() {

    if(this.basicEditor == null) {
      this.basicEditor = ace.edit("exportX16BasicSource");
      this.basicEditor.getSession().setTabSize(2);
      this.basicEditor.getSession().setUseSoftTabs(true);
      this.basicEditor.on('focus', function() {
        g_app.setAllowKeyShortcuts(false);
        UI.setAllowBrowserEditOperations(true);
      });

      this.basicEditor.on('blur', function() {
        g_app.setAllowKeyShortcuts(true);
        UI.setAllowBrowserEditOperations(false);
      });
      var mode = 'ace/mode/assembly_6502';
      if(this.mode == 'javascript') {
        mode = 'ace/mode/javascript';
      }
      this.basicEditor.getSession().setMode(mode);//"ace/mode/assembly_6502");
      this.basicEditor.setShowInvisibles(false);
    }
    this.generateX16Basic();

  },


  copyToClipboard: function() {
    var sel = this.basicEditor.selection.toJSON(); // save selection
    this.basicEditor.selectAll();
    this.basicEditor.focus();
    document.execCommand('copy');
    this.basicEditor.selection.fromJSON(sel); // restore selection  
  },

  getLine: function(statement) {
    var line = this.lineNumber + " " + statement + "\n";
    this.lineNumber += 10;
    return line;
  },

  toHex: function(value, digits) {
    if(digits == 2) {
      return ("00" + value.toString(16)).substr(-2).toUpperCase(); 
    }
    return ("0000" + value.toString(16)).substr(-4).toUpperCase(); 
  },

  generateX16Basic: function() {

    //IF PEEK($D9)<>80 THEN SYS $FF5F : REM SWITCH TO 80 CHARACTER MODE
    //10 IF PEEK($D9)<>40 THEN SYS $FF5F
    //490 POKE 646,1  set fg/bg color
    //PRINT CHR$(147) :REM CLEAR SCREEN WITH NEW BACKGROUND

    //10 PRINT CHR$(147): REM clear the screen


    // default layer 0 map is at 0
    // default layer 0 tiles are at $1f000

    var tileSetManager = this.editor.tileSetManager;
    var colorPaletteManager = this.editor.colorPaletteManager;
    var colorPalette = colorPaletteManager.getCurrentColorPalette();
    var colorCount = colorPalette.getColorCount();


    var layer = this.editor.layers.getSelectedLayerObject();

    var x16MapWidth = 128;

    var gridWidth = layer.getGridWidth();
    var gridHeight = layer.getGridHeight();

    var tileSet = layer.getTileSet();
    var tileWidth = tileSet.getTileWidth();
    var tileHeight = tileSet.getTileHeight();
    var tileCount = tileSet.getTileCount();


    var mode = 0;
    var cols = 40;
    var rows = 25;

    var byteCount = rows * cols * 2;
    var lastByte = byteCount - 1;

    var rowByteCount = cols * 2;
    var rowLastByte = rowByteCount - 1;
    var lastRow = gridHeight - 1;

    var screenMemoryAddress = 0;

    var x16RowByteCount = x16MapWidth * 2;

    this.lineNumber = 10;
    var lines = '';
    lines += this.getLine("REM LVLLVL OUTPUT");
    lines += this.getLine("REM SET THE MODE TO MODE 0, AND LAYER 0 ENABLED");

    var modeHex = 1 + (mode << 5);
    lines += this.getLine("VPOKE $F,$2000,$" + this.toHex(modeHex, 2));

    lines += this.getLine("REM SWITCH TO 40 CHARACTER MODE");
    lines += this.getLine("IF PEEK($D9) <> 40 THEN SYS $FF5F");
    lines += this.getLine("REM CLEAR THE SCREEN");
    lines += this.getLine("PRINT CHR$(147)");


    var colorByteCount = colorCount * 2;
    var lastColorByte = colorByteCount - 1;
    lines += this.getLine("REM SET THE COLOUR PALETTE");
    lines += this.getLine("FOR I = 0 TO " + lastColorByte);
    lines += this.getLine("READ D");
    lines += this.getLine("VPOKE $F,$1000+I,D");
    lines += this.getLine("NEXT");

    var tileByteCount = tileCount * 8;
    var lastTileByte = tileByteCount - 1;
    lines += this.getLine("REM SET THE TILES");
    lines += this.getLine("FOR I = 0 TO " + lastTileByte);
    lines += this.getLine("READ D");
    lines += this.getLine("VPOKE $1,$F000+I,D");
    lines += this.getLine("NEXT");



    lines += this.getLine("REM SET THE MAP");
    lines += this.getLine("RADDR=0");
    lines += this.getLine("FOR ROW=0 TO " + lastRow);
    lines += this.getLine("FOR COL=0 TO " + rowLastByte);
    lines += this.getLine("READ D");
    lines += this.getLine("VPOKE 0,RADDR+COL,D");
    lines += this.getLine("NEXT COL");
    lines += this.getLine("RADDR = RADDR + " + x16RowByteCount);
    lines += this.getLine("NEXT ROW");



    lines += this.getLine("GOTO " + this.lineNumber);

    var line = "";
    var columns = 16;
    var column = 0;


    lines += this.getLine("REM COLOR PALETTE");
    column = 0;
    for(var i = 0; i < colorCount; i++) {
      var color = colorPalette.getHex(i);

      var r = (color >>> 20) & 0xf;
      var g = (color >>> 12) & 0xf;
      var b = (color >>> 4) & 0xf;  

      var byte0 = (g << 4) + b;
      var byte1 = r;

      if(column !== 0) {
        line += ',';
      } else {
        line += "DATA ";
      }
      line += '$';
      line += this.toHex(byte0, 2);
      line += ',';
      line += '$';        
      line += this.toHex(byte1, 2);
      column += 2;
      if(column >= columns || i == colorCount - 1) {
        column = 0;
        lines += this.getLine(line);
        line = "";
      }        
    }

    lines += this.getLine("REM TILE DATA");
    line = "";
    for(var t = 0; t < tileCount; t++) {

      for(var y = 0; y < tileHeight; y++) {
        var b = 0;
        for(var x = 0; x < tileWidth; x++) {
            // set the bit
          if(tileSet.getPixel(t, x, y)) {
            b = b | (1 << (7-x));
          }
        }

        if(column !== 0) {
          line += ',';
        } else {
          line += "DATA ";
        }
        line += '$';
        line += this.toHex(b, 2);  
        column++;

        if(column == columns) {
          column = 0;
          lines += this.getLine(line);
          line = "";
        }

      }
    }


    lines += this.getLine("REM SCREEN DATA");
    line = "";
    for(var y = 0; y < rows; y++) {
      for(var x = 0; x < cols; x++) {
        var cellData = layer.getCell({ x: x, y: y });

        var colorByte = cellData.fc;
        if(cellData.bc !== this.editor.colorPaletteManager.noColor) {
          colorByte += (cellData.bc << 4);
        }

        if(column !== 0) {
          line += ',';
        } else {
          line += "DATA ";
        }
        line += '$';
        line += this.toHex(cellData.t, 2);
        line += ',';
        line += '$';        
        line += this.toHex(colorByte, 2);
        column += 2;
        if(column >= columns) {
          column = 0;
          lines += this.getLine(line);
          line = "";
        }        
      }
    }

    this.basicEditor.setValue(lines, -1);

  }


}