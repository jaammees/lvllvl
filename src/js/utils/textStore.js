// https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Web_Localizability/Localization_formats
// https://www.transifex.com/blog/2016/common-localization-file-formats/


// ui-text
// data-text
var TextStore = { };

TextStore.language = "en";//"ja";//en-gb";


TextStore.setLanguage = function(language) {
  this.language = language;

  $('.ui-text').each(function() {
    var textId = $(this).attr('data-textid');

    //console.log(textId);
    $(this).html(TextStore.get(textId));
  });

}

TextStore.get = function(stringId) {

  var translation = TextStore.content[stringId];
  if(typeof translation === 'undefined') {
    return stringId;
  }

  var language = TextStore.language;
  var translationText = translation[language];
  if(typeof translationText !== 'undefined') {
    return  translationText;
  }

//  if(language == 'en-gb' || language == 'en-us') {
  // default to english
  translationText = translation['en'];
  if(typeof translationText !== 'undefined') {
    return translationText;
  }
  //}

  return stringId;

}


TextStore.content = {
  // menu
  "Project": {
    "en": "Project",
    "ja": "プロジェクト",    
    "fr": "",
    "de": "",
    "it": "",
    "zh": ""
  },
  "Save": {
    "en": "Save",
    "ja": "保存する",  
  },
  "Save As...": {
    "ja": "名前を付けて保存"

  },
  "Save Project To GitHub...": {
    "ja": "GitHubに保存"

  },
  "Save To GitHub": {

  },
  "Commit Changes To GitHub...": {
    "ja": "GitHubへの変更のコミット"

  },
  "Download Project...": {
    "ja": "ダウンロード"

  },
  "Go To Home Screen": {
    "ja": "ホーム画面へ"

  },

  "Edit": {
    "ja": "エディット"

  },

  "Undo": {
    "ja": "元に戻す"

  },

  "Redo": {

  },
  "Cut": {

  },
  "Copy": {

  },
  "Paste": {

  },
  "Clear All": {

  },
  "Clear...": {

  },

  "Select All": {

  },

  "Deselect": {

  },

  "Export": {

  },

  "Export PNG": {

  },

  "Export GIF": {

  },

  "Export Tileset": {

  },

  "Toggle Grid": {

  },

  "Toggle Show Previous Frame": {

  },

  "Visual Formats": {

  },

  "C64 Formats": {

  },

  "C64 Assembly Source...": {

  },

  "Dev Formats": {

  },

  "Binary Data...": {

  },

  "Import": {

  },

  "2d Formats": {

  },

  "Import Image / Video": {

  },

  "Image / Video...": {

  },

  "Screen": {

  },

  "Dimensions": {

  },

  "Screen Mode": {

  },

  "Mode": {

  },

  "Text mode": {

  },

  "C64 Multicolour": {

  },

  "Indexed Colour": {

  },

  "Block Mode": {

  },

  "Block Size": {

  },

  "Colour Mode": {

  },

  "Colour Per Cell": {

  },

  "Colour Per Tile": {

  },
  "Colour Per Block": {

  },
  "Reference Image": {

  },
  "Set Reference Image": {

  },
  "Sprite": {

  },
  "Monochrome": {

  },
  "Help": {

  },
  "Layers": {

  },
  "New Layer": {

  },
  "Layer Properties": {

  },
  "Delete Layer": {

  },
  "Bring Forward": {

  },
  "Send Backward": {

  },
  "Toggle Layer Visibility": {

  },
  "Select Above": {

  },
  "Select Below": {

  },
  "Tiles": {

  },
  "Show Tile Editor": {

  },
  "Choose A Character Set": {

  },
  "Choose A Tile Set": {

  },
  "Load / Import Tile Set": {

  },
  "Save Tile Set": {

  },
  "Colours": {
    "en-gb": "Colours",
    "en-us": "Colors"
  },
  "Show Colour Editor": {
    "en-gb": "Show Colour Editor",
    "en-us": "Show Color Editor"    
  },
  "Choose A Colour Palette": {
    "en-gb": "Choose A Colour Palette",
    "en-us": "Choose A Color Palette"    
  },
  "Edit Colour Palette": {
    "en-gb": "Edit Colour Palette",
    "en-us": "Edit Color Palette"
  },
  "Load Colour Palette": {
    "en-gb": "Load Colour Palette",
    "en-us": "Load Color Palette"
  },
  "Save Colour Palette": {
    "en-gb": "Save Colour Palette",
    "en-us": "Save Color Palette"
  },
  "View": {

  },
  "Zoom In": {

  },
  "Zoom Out": {

  },
  "Fit On Screen": {

  },
  "Actual Pixels": {

  },
  "Show / Hide Grid": {

  },
  "Show / Hide Border": {

  },
  "Show / Hide Background": {

  },
  "Scripting": {

  },
  "Project View": {

  },
  "Mouse / Keyboard shortcuts": {

  },
  "Scripting API": {

  },
  "Video": {

  },

  "Color": {
    "en-us": "Color",
    "en-gb": "Colour",
    "ja": ""
  },

  // start page.html
  "New Project": {
    "ja": "新しいプロジェクト"

  },
  "Load From GitHub Repository": {
    "ja": "GitHubリポジトリからロードする"

  },
  "Open Local File": {
    "ja": "ローカルファイルを開く"
  },
  "Sign In With GitHub": {
    "ja": ""
  },
  "Sign Out": {

  },


  // drawTools.html
  "Tile Tools": {

  },
  "Cell": {

  },
  "Frame": {

  },
  "Pencil": {

  },
  "Blank": {

  },
  "Fill Bucket": {

  },
  "Eyedropper": {

  },
  "Line": {

  },
  "Rect": {

  },
  "Oval": {

  },
  "Marquee": {

  },
  "Type": {

  },
  "Pixel": {

  },
  "Block": {

  },
  "Zoom": {

  },
  "Hand": {

  },
  "Move": {

  }
}