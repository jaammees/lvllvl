var ExportSvg = function() {
  this.editor = null;

  this.uiComponent = null;
  this.htmlComponent = null;
  this.visible = false;
}

ExportSvg.prototype = {
  init: function(editor) {
    this.editor = editor;
  },


  initContent: function() {
    $('#exportSVGAs').val('Untitled');
  },
  
  show: function() {
    var _this = this;

    if(this.uiComponent == null) {

      this.uiComponent = UI.create("UI.Dialog", { "id": "exportSVGDialog", "title": "Export SVG", "width": 300, "height": 120 });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);

      this.htmlComponent.load('html/textMode/exportSvg.html', function() {
        _this.initContent();
      });

      this.okButton = UI.create('UI.Button', { "text": '<img src="icons/svg/glyphicons-basic-199-save.svg"> Download', "color": "primary" }); 
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        var filename = $('#exportSVGAs').val();
        _this.exportSVG({ filename: filename });
      });
  
      this.closeButton = UI.create('UI.Button', { "text": "Close", "color": "secondary" });
      this.uiComponent.addButton(this.closeButton);
      this.closeButton.on('click', function(event) {
        UI.closeDialog();
      });
  
      this.uiComponent.on('close', function() {
        _this.visible = false;
      });

    }

    UI.showDialog("exportSVGDialog");
    this.visible = true;


  },

  exportSVG: function(args) {

    var filename = 'Untitled';
    if(typeof args.filename != 'undefined') {
      filename = args.filename;
    }

    var cellWidth = 32;
    var cellHeight =32;

    var width = 40;
    var height = 25;
    var data = '';


    var layer = this.editor.layers.getSelectedLayerObject();

    if(!layer || layer.getType() != 'grid') {
      alert('Please choose a grid layer');
      return;
    }

    var gridWidth = layer.getGridWidth()
    var gridHeight = layer.getGridHeight();

    var tileSet = layer.getTileSet();
    var colorPalette = layer.getColorPalette();
    var tileCount = tileSet.getTileCount();

    var backgroundColorIndex = layer.getBackgroundColor();
    var backgroundColor = colorPalette.getRGBA(backgroundColorIndex);


    var svgWidth = cellWidth * gridWidth;
    var svgHeight = cellHeight * gridHeight;

    data += '<?xml version="1.0" standalone="no"?>';
    data += '<svg width="' + svgWidth + '" height="' + svgHeight + '" xmlns:xlink="http://www.w3.org/1999/xlink">';

    for(var y = 0; y < gridHeight; y++) {
      var yPosition = y * cellHeight;
      data += '<g transform="translate(0 ' + yPosition + ')">';

      for(var x = 0; x < width; x++) {

        var bgColor = backgroundColor;
        var cellData = layer.getCell({ x: x, y: y });
        if(cellData.bc !== this.editor.colorPaletteManager.noColor) {
          bgColor = colorPalette.getRGBA(cellData.bc);
        }
        

        var xPosition = x * cellWidth;
        data += '<g transform="translate(' + xPosition + ')">';
        data += '<svg height="' + cellHeight + '" width="' + cellWidth + '" viewBox="0 0 800 800" fill="rgb(' + bgColor[0] + ',' + bgColor[1] + ',' + bgColor[2] + ')"><rect width="100%" height="100%"></rect></svg>';
        data += '</g>';
      }
      data += '</g>';
    }

    var cellSize = cellWidth;
    var fontScale = tileSet.getFontScale();
    var scale = cellSize * fontScale;
    var ascent = tileSet.getFontAscent() ;
    var scaledAscent = ascent * scale;


    for(var y = 0; y < height; y++) {
      var yPosition = y * cellHeight;

      var rowData = '';

      for(var x = 0; x < width; x++) {


        var cellData = layer.getCell({ x: x, y: y });
        var t = cellData.t;
        var foregroundColor = cellData.fc;
        var backgroundColor = cellData.bc;
        var color = colorPalette.getRGBA(foregroundColor);

        var xPosition = x * cellWidth;

        var path = tileSet.getSVGPath(t);

        if(path !== false && path.indexOf('lyph glyph-name') === 0) {
          path = false;
        }

        if(path !== false) {
          rowData += '<g transform="translate(' + xPosition + ')">';
          rowData += '<svg height="' + cellHeight + '" width="' + cellWidth + '" viewBox="0 0 ' + cellWidth + ' ' + cellHeight + '">';


          // The rotate(<a> [<x> <y>]) transform function specifies a rotation by a degrees about a given point.
          if(path !== false) {
  
            var yOffset = cellHeight - (cellHeight - scaledAscent); // - ascent * cellHeight;
            rowData += '<g transform=" translate(0 ' + yOffset + ') scale(1) translate( 0 0 ) scale( ' + scale + ' -' + scale + ' ) rotate( 0 400 400) translate( 0 0 ) ">';
            rowData += '<path d="' + path + '" fill="rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')"/>';
            rowData += '</g>';
          }

          rowData += '</svg>';
          rowData += '</g>';
        }


      }

      if(rowData != '') {
        data += '<g transform="translate(0 ' + yPosition + ')">';
        data += rowData;
        data += '</g>';
      }

    }

    data += '</svg>';

    if(filename.indexOf('.svg') == -1) {
      filename += ".svg";
    }

    download(data, filename, "application/svg");    


  }
}