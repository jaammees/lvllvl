var TextMode = {};
TextMode.update = null;
TextMode.tick = null;

TextMode.getCurrentColorPalette = function() {
  var colorPalette = g_app.textModeEditor.colorPaletteManager.getCurrentColorPalette();

  var colorPaletteAPI = new ColorPaletteAPI();
  colorPaletteAPI.init(colorPalette);
  return colorPaletteAPI;

}

TextMode.getCurrentFrame = function() {
  var frame = new FrameAPI();
  frame.init(g_app.textModeEditor, g_app.textModeEditor.frames.currentFrame);
  return frame;
}

TextMode.getFrameCount = function() {

}

TextMode.on = function(eventType, callback) {
  switch(eventType) {
    case 'update':
      TextMode.update = callback;
    break;
    case 'tick':
      TextMode.tick = callback;
    break;
  }
}