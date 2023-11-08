ColorPaletteChoosePresetMobileCard = function() {
  this.holder = null;
  this.cardHeading = null;
  this.cardOptions = null;
  this.canvas = null;

  this.palette = null;
  this.colorPaletteDisplay = null;


  this.paletteImage = null;


  this.moveHorizonal = false;
  this.moveVertical = false;
  this.touchStartX = 0;
  this.touchStartY = 0;

  this.touchStartScrollY = 0;



  // paletteId is the id of the palette
  // paletteOptionId is the id of the paletteOption
  this.paletteId = false;
  this.paletteOptionId = false;

  this.brightness = 0;
  this.contrast = 0;
  this.saturation = 0;

  this.editor = null;
}

ColorPaletteChoosePresetMobileCard.prototype = {
  init: function(editor, postfix) {
    this.editor = editor;
    this.postfix = postfix;
  },

  initContent: function() {
    this.holder = $('#chooseColorPaletteMobileHolder' + this.postfix);
    this.cardHeading = $('#chooseColorPaletteMobileHeading' + this.postfix);
    this.cardOptions = $('#chooseColorPaletteMobileOptions' + this.postfix);
    this.canvas = document.getElementById('chooseColorPaletteMobileCanvas' + this.postfix);

    if(this.colorPaletteDisplay == null) {
      this.colorPaletteDisplay = new ColorPaletteDisplay();
      this.colorPaletteDisplay.init(this.editor, { canvasElementId: 'chooseColorPaletteMobileCanvas' + this.postfix });
    }

    this.cardWidth = $(window).width();
    this.holder.width(this.cardWidth);


  },

  setPosition: function(left, top) {
    this.holder.css('left', left + 'px');
    this.holder.css('top', top + 'px');
  },

  getPalette: function(presetId) {

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var id =  ColorPalettePresets[category].colorPalettes[i].id;
          if(id == presetId) {
            return ColorPalettePresets[category].colorPalettes[i];
          }
        }
      }
    }
    return null;
  },


  setPalette: function(presetId) {
    if(this.paletteId === presetId) {
      return;
    }

    this.paletteId = presetId;

    this.palette = this.getPalette(presetId);
    var heading = this.palette.name;
    if(typeof this.palette.author !== 'undefined') {
      heading += ' by ' + this.palette.author;
    }

    this.cardHeading.html(heading);

    var info = '';
    $('#chooseColorPaletteMobileInfo').html(info);


    var optionsHtml = '';

    var optionsList = this.palette.options;
    var optionName = 'colorPaletteMobileOption_' + this.paletteId;

    if(typeof optionsList != 'undefined') {
      for(var i = 0; i < optionsList.length; i++) {
        optionsHtml += '<label class="choose-container-tick" ';
        if(i == 0) {
          optionsHtml += ' style="background-color: #666666" ';
        }
        optionsHtml += '>';
        optionsHtml += optionsList[i].name;
        optionsHtml += '<input type="radio" name="' + optionName + '" value="' + optionsList[i].id + '" ';
        if(i == 0) {
          this.paletteId = optionsList[i].id;
          optionsHtml += ' checked="checked" ';
        }
        optionsHtml += '>';
        optionsHtml += '<span class="checkmark"></span>';
        optionsHtml += '</label>';
      }
    }
    this.cardOptions.html(optionsHtml);


    // paletteId is the id of the overall palette
    // selectedPaletteId is the id of the selected sub palette
    this.paletteOptionId = this.paletteId;


    var _this = this;

    $('input[type=radio][name=' + optionName + ']').on('change', function() {
      var name = $(this).attr('name');
      var parent = $(this).parent();
      $('.choose-container-tick').css('background-color', '#333333');
      parent.css('background-color', '#666666');

      _this.paletteOptionId = $('input[name=' + name + ']:checked').val();;

      _this.loadSelectedPalette();
    });


    _this.loadSelectedPalette();
  },



  loadSelectedPalette: function() {
    var filename = this.paletteOptionId + '.png';
    var url = "palettes/" + filename;

    if(this.paletteImage == null) {
      this.paletteImage = new Image();
    }

    var _this = this;
    this.paletteImage.onload = function() {
      _this.displaySelectedPalette();
    }

    this.paletteImage.src = url;
  },

  displaySelectedPalette: function() {

    var charsetUtil = this.editor.tileSetManager.getCurrentTileSet();

    var colors = this.editor.colorPaletteManager.colorPaletteFromPaletteImg(this.paletteImage,
      { brightness: this.brightness, saturation: this.saturation, contrast: this.contrast});
    var colorsCount = colors.colors.length;

    var colorWidth = 16;
    var colorHeight = 16;
    var spacing = 2;
    var colorsAcross = 8;
    var colorsDown = 2;

    colorsAcross = Math.floor(this.paletteImage.naturalWidth / 8);
    colorsDown = Math.floor(this.paletteImage.naturalHeight / 8);

    var colorMap = [];
    var colorIndex = 0;
    for(var y = 0; y < colorHeight; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorWidth; x++) {
        if(y < colorsDown && x < colorsAcross) {
          colorMap[y][x] = colorIndex++;
        } else {
          colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }

      }
    }
    this.colorPaletteDisplay.setColors(colors.colors, { colorMap: colorMap });

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    var maxHeight = screenHeight - 111;

    if(colorsAcross > 6 && screenWidth < 800) {
      this.colorPaletteDisplay.fitToWidth(screenWidth - 20);
    }

console.log("DRAW  Palette!!");
    this.colorPaletteDisplay.draw();

  },  


}

var ColorPaletteChoosePresetMobile = function() {
  this.editor = null;
  this.uiComponent = null;


  this.colorPaletteSampleImage = null;
  this.sampleImageCanvas = null;
  this.sampleImageContext = null;


  this.cardPosition = 0;
  this.paletteCardA = null;
  this.paletteCardB = null;

  this.callback = false;

  this.touchVelocity = null;
  this.cardMoving = false;

  this.nextPreloadImage = null;
  this.prevPreloadImage = null;


}

ColorPaletteChoosePresetMobile.prototype = {
  init: function(editor) {
    this.editor = editor;

    this.touchVelocity = new TouchVelocity();   

  },

  setupSampleImage: function(callback) {
    this.colorPaletteSampleImage = new Image();
    this.colorPaletteSampleImage.onload = callback;

    this.colorPaletteSampleImage.src = 'images/color_palette_sample.png';
  },

  show: function(args) {
    var _this = this;
    var width = 500;
    var height = 100;

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    width = screenWidth - 30;
    height = screenHeight - 30;

    if(typeof args != 'undefined') {
      if(typeof args.callback != 'undefined') {
        this.callback = args.callback;
      }
    }


    if(this.uiComponent == null) {
      this.uiComponent = UI.create("UI.MobilePanel", { "id": "colorPaletteChoosePresetMobileDialog", "title": "Colours", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/colorPaletteChoosePresetMobile.html', function() {
        _this.setupSampleImage(function() {
          _this.initContent();
          _this.initEvents();
        });
      });

      this.okButton = UI.create('UI.Button', { "text": "Choose" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        if(_this.callback) {
          _this.callback(_this.paletteCardA.paletteOptionId);
        }
        UI.closeDialog();
      });
    }

    UI.showDialog("colorPaletteChoosePresetMobileDialog");

  },

  initContent: function() {
    var listHTML = '';



    var _this = this;

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {
        var categoryName = ColorPalettePresets[category].category;

        listHTML += '<optgroup label="' + categoryName + '">';

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var name = ColorPalettePresets[category].colorPalettes[i].name;
          var id =  ColorPalettePresets[category].colorPalettes[i].id;

          listHTML += '<option value="' + id + '" ';

          if(id == 'c64_colodore') {
            listHTML += ' selected="selected" ';
          }
          listHTML += '>' + name + '</option>';

        }

        listHTML += '</optgroup>';
      }
    }


    this.paletteCardA = new ColorPaletteChoosePresetMobileCard();
    this.paletteCardA.init(this.editor, "A");
    this.paletteCardA.initContent();
    this.paletteCardA.setPosition(0, 0);

    this.paletteCardB = new ColorPaletteChoosePresetMobileCard();
    this.paletteCardB.init(this.editor, "B");
    this.paletteCardB.initContent();

    this.paletteCardB.setPosition(10000, 0);

    $('#colorPaletteChoosePresetMobileList').html(listHTML);

    $('#colorPaletteChoosePresetMobileList').on('change', function() {
      var preset = $(this).val();
      _this.selectPalettePreset(preset);
    });

    $('#chooseColorPaletteMobilePrev').on('click', function(event) {
      _this.prevPreset();
    });

    $('#chooseColorPaletteMobileNext').on('click', function(event) {
      _this.nextPreset();
    });

/*
    this.currentCardHolder = $('#chooseColorPaletteMobileHolder');
    this.currentCardHeading = $('#chooseColorPaletteMobileHeading');
    this.currentCardOptions = $('#chooseColorPaletteMobileOptions');
    this.previewCanvas = document.getElementById('chooseColorPaletteMobilePreview');

    this.nextCardHolder = $('#chooseColorPaletteMobileHolderNext');
    this.nextCardHeading = $('#chooseColorPaletteMobileHeadingNext');
    this.nextCanvas = document.getElementById('chooseColorPaletteMobilePreviewNext');
    this.nextCardOptions = $('#chooseColorPaletteMobileOptionsNext');
    this.nextCardHolder.css('left', '5000px');

*/

//    this.chooseDialogSelect(petsciiId);

    this.cardWidth = $(window).width();

//    this.currentCardHolder.width(this.cardWidth);
//    this.nextCardHolder.width(this.cardWidth);


    this.selectPalettePreset('c64_colodore');


  },

  initEvents: function() {
    var _this = this;


    // do this with callbacks??
    var holderElement = document.getElementById('chooseColorPaletteMobileHolderA');

    holderElement.addEventListener("touchstart", function(event){
      _this.touchStart(event);
    }, false);

    holderElement.addEventListener("touchmove", function(event){
      _this.touchMove(event);          
    }, false);

    holderElement.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);


    var holderElement = document.getElementById('chooseColorPaletteMobileHolderB');

    holderElement.addEventListener("touchstart", function(event){
      _this.touchStart(event);
    }, false);

    holderElement.addEventListener("touchmove", function(event){
      _this.touchMove(event);          
    }, false);

    holderElement.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);

  },



  touchStart: function(e) {
    this.touchVelocity.touchStart(e);    

    var touches = e.touches;


    this.startScrollYA = $('#chooseColorPaletteMobileOptionsA').scrollTop();
    this.startScrollYB = $('#chooseColorPaletteMobileOptionsB').scrollTop();


    if(touches.length > 0) {
      var x = touches[0].pageX;
      var y = touches[0].pageY;      

      this.touchStartX = x;
      this.touchStartY = y;     

    }
  },

  touchMove: function(e) {
    this.touchVelocity.touchMove(e);    

    var touches = e.touches;

    if(touches.length > 0) {
      var x = touches[0].pageX;
      var y = touches[0].pageY;    

/*
      var diffX = x - this.touchStartX;
      this.setCardPosition(diffX);  
*/
      if(this.moveVertical) {
        return;
      }   


      var diffX = x - this.touchStartX;

      var hDist = -16;
      if(diffX < hDist) {
        this.moveHorizonal = true;
        diffX = x - this.touchStartX - hDist;
        if(diffX > 0) {
          diffX = 0;
        }
      }

      if(diffX > -hDist) {
        this.moveHorizonal = true;
        diffX = x - this.touchStartX + hDist;
        if(diffX < 0) {
          diffX = 0;
        }
      }

      if(this.moveHorizonal && !this.cardMoving) {
        this.setCardPosition(diffX);
      }

      if($(e.target).hasClass('choose-container-tick')) {
        var parent = $(this).parent();
        var scroll = $(parent).scrollTop();

      } else {
        e.preventDefault();
      }

    }

  },

  touchEnd: function(e) {
    this.touchVelocity.touchEnd(e);    

    var touches = e.touches;
    this.hideNext();  
    this.moveHorizonal = false;  
    this.moveVertical = false;      
  },



  hideNext: function(args) {
    var _this = this;

    var duration = 2000 ;

    var moveTo = 0;

    var nextDistance = this.cardWidth / 3.6;
    if(nextDistance > 90) {
      nextDistance = 90;
    }


    if(this.cardPosition > nextDistance) {
      moveTo = this.cardWidth;
    } else if(this.cardPosition < -nextDistance) {
      moveTo = -this.cardWidth;
    } else {
      moveTo = 0;
    }


    if(typeof args !== 'undefined') {
      if(args.gotoNext) {
        moveTo = -this.cardWidth;
      }
      if(args.gotoPrev) {
        moveTo = this.cardWidth;
      }
    }

    var velocity = this.touchVelocity.getVelocity();

    if(velocity && velocity.vx) {
      if(moveTo == 0) {
        // card is not set to change, but does velocity mean it should?
        if(velocity.vx < -1.2) {
          moveTo = -this.cardWidth;
        }
        if(velocity.vx > 1.2) {
          moveTo = this.cardWidth;
        }

      } 

      if(moveTo !== 0) {
        // how far to go?
        var distance = moveTo - this.cardPosition;
        console.log('distance = ' + distance);
        if(distance != 0) {
          duration = distance / velocity.vx;
        }
      }

      console.log('duration = ' + duration);
    }
    if(duration > 250 || duration < 0) {
      duration = 250;
    }

    this.cardMoving = true;
    
    
    this.paletteCardA.holder.animate({
      left: moveTo + 'px'
    }, {

      duration: duration,
      progress: function(animation, now, tween) {
        var position = _this.paletteCardA.holder.position();
        _this.cardPosition = position.left;
        var left = position.left;

        if(left < 0) {
          var nextPosition = left + _this.cardWidth;
          _this.paletteCardB.holder.css('left', nextPosition + 'px');
          
        } else {
          var nextPosition = left - _this.cardWidth;
          _this.paletteCardB.holder.css('left', nextPosition + 'px');
        }
      },

      complete: function() {
        _this.cardMoving = false;

        if(moveTo !== 0) {
          var presetId = _this.paletteCardB.paletteId;
          var temp = _this.paletteCardB;
          _this.paletteCardB = _this.paletteCardA;
          _this.paletteCardA = temp;
          console.log('set cvard position to 0!!!!!');
          _this.cardPosition = 0;

          _this.selectPalettePreset(presetId);
        }
      }
    });
  },


  setCardPosition: function(position) {


    this.cardPosition = position;
    var cardWidth = this.paletteCardA.cardWidth;

    //this.cardPosition = position;
    //this.currentCardHolder.css('left', position + 'px');

    var left = position;
    var top = 0;
    this.paletteCardA.setPosition(left, top);

    if(position < 0) {
      var cardBLeft = position + cardWidth ;
      this.paletteCardB.setPosition(cardBLeft, 0);
      this.setCardBContent();
    } else {
      var cardBLeft = position - cardWidth ;
      this.paletteCardB.setPosition(cardBLeft, 0);
      this.setCardBContent();
    }
  },

  getPrevPresetId: function() {
    var currentId = this.presetId;

    var prev = false;
    var foundCurrent = false;

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {
        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var id =  ColorPalettePresets[category].colorPalettes[i].id;
          if(id == currentId) {
            if(prev === false) {
              return false;
            }
            foundCurrent = true;
            return prev;

          }
          prev = id;
        }
      }
    }

    return false;
  },

  getNextPresetId: function() {
    var currentId = this.presetId;
    var foundCurrent = false;

    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var id =  ColorPalettePresets[category].colorPalettes[i].id;

          if(foundCurrent) {
            //$('#colorPaletteChoosePresetMobileList').val(id);
            return id;
          }
          if(id == currentId) {
            foundCurrent = true;
          }
        }
      }
    }   

    return false; 
  },
  setCardBContent: function() {
    if(this.cardPosition < 0) {
      var nextPresetId = this.getNextPresetId();
      if(nextPresetId !== false) {
        this.paletteCardB.setPalette(nextPresetId);
      }
    }

    if(this.cardPosition > 0) {
      var prevPresetId = this.getPrevPresetId();
      if(prevPresetId !== false) {
        this.paletteCardB.setPalette(prevPresetId);
      }
    }
  },


  preloadNextPrev: function(presetId) {
    // make sure next and prev are preloaded
    var nextPresetId = this.getNextPresetId();
    if(nextPresetId !== false) {
      var palette = this.paletteCardA.getPalette(nextPresetId);
      var paletteId = palette.id;
      var optionsList = palette.options;
  
      if(typeof optionsList != 'undefined' && optionsList.length > 0) {
        paletteId = optionsList[0].id;
      }
      var filename = paletteId + '.png';
      var url = "palettes/" + filename;
  
      console.log('preload ' + filename);

      if(this.nextPreloadImage == null) {
        this.nextPreloadImage = new Image();
      }
      this.nextPreloadImage.src = url;
  
    }

    var prevPresetId = this.getPrevPresetId();
    if(prevPresetId !== false) {
      var palette = this.paletteCardA.getPalette(prevPresetId);
      var paletteId = palette.id;
      var optionsList = palette.options;
  
      if(typeof optionsList != 'undefined' && optionsList.length > 0) {
        paletteId = optionsList[0].id;
      }

      var filename = paletteId + '.png';
      var url = "palettes/" + filename;
        console.log('preload ' + filename);

      if(this.prevPreloadImage == null) {
        this.prevPreloadImage = new Image();
      }
      this.prevPreloadImage.src = url;
    }

  },

  selectPalettePreset: function(presetId) {
    this.presetId = presetId;
    $('#colorPaletteChoosePresetMobileList').val(this.presetId);

    this.paletteCardA.setPalette(this.presetId);
    this.preloadNextPrev(this.presetId);
  },

  nextPreset: function() {
    console.log('next!' + this.cardPosition);
    if(this.cardPosition === 0) {
      var nextPresetId = this.getNextPresetId();
      console.log('preset id = ' + nextPresetId);
      if(nextPresetId !== false) {
        this.paletteCardB.setPalette(nextPresetId);
        this.hideNext({ gotoNext: true});
      }
    }

  },

  prevPreset: function() {
    console.log('prev');
    if(this.cardPosition === 0) {
      var prevPresetId = this.getPrevPresetId();
      if(prevPresetId !== false) {
        this.paletteCardB.setPalette(prevPresetId);
        this.hideNext({ gotoPrev: true });
      }
    }

  },



/*


  colorPaletteDialogSelect: function(preset) {
    var colorPalette = this.getColorPaletteDescription(preset);
    this.previewColorPalette = colorPalette;

    $('#chooseColorPaletteMobileHeading').html(this.previewColorPalette.name);
    var info = '';
    $('#chooseColorPaletteMobileInfo').html(info);

    var description = '';
    if(typeof this.previewColorPalette.description != 'undefined') {
      description = this.previewColorPalette.description;
    }

//    $('#chooseColorPaletteMobileDescription').html(description);


    var options = '';
    var paletteId = colorPalette.id;
    var optionsList = colorPalette.options;
    var optionName = 'colorPaletteMobileOption_' + paletteId;

    if(typeof optionsList != 'undefined') {
      for(var i = 0; i < optionsList.length; i++) {
        options += '<label class="choose-container">';
        options += optionsList[i].name;
        options += '<input type="radio" name="' + optionName + '" value="' + optionsList[i].id + '" ';
        if(i == 0) {
          paletteId = colorPalette.options[i].id;
          options += ' checked="checked" ';
        }
        options += '>';
        options += '<span class="checkmark"></span>';
        options += '</label>';
      }
    }
    $('#chooseColorPaletteMobileOptions').html(options);

    var _this = this;

    $('input[type=radio][name=' + optionName + ']').on('change', function() {
      var name = $(this).attr('name');
      var parent = $(this).parent();
      $('.choose-container').css('background-color', '#333333');
      parent.css('background-color', '#666666');


      var paletteId = $('input[name=' + name + ']:checked').val();
      _this.previewColorPalette.selectedPaletteId = paletteId;
      var filename = paletteId + '.png';
      var url = "palettes/" + filename;
      _this.previewFromPaletteImage(url);
    });


    this.previewColorPalette.selectedPaletteId = paletteId;
    var filename = paletteId + '.png';
    var url = "palettes/" + filename;
    this.previewFromPaletteImage(url);
  },



  previewFromPaletteImage: function(url) {

    if(this.img == null) {
      this.img = new Image();
    }

    var _this = this;
    this.img.onload = function() {
      _this.paletteImage = _this.img;
      _this.previewPalette();      
    }

    this.img.src = url;
  },

  previewPalette: function() {

    var charsetUtil = this.editor.tileSetManager.getCurrentTileSet();

    var colors = this.editor.colorPaletteManager.colorPaletteFromPaletteImg(this.paletteImage,
      { brightness: this.brightness, saturation: this.saturation, contrast: this.contrast});
    var colorsCount = colors.colors.length;

    var colorWidth = 16;
    var colorHeight = 16;
    var spacing = 2;
    var colorsAcross = 8;
    var colorsDown = 2;

    colorsAcross = Math.floor(this.paletteImage.naturalWidth / 8);
    colorsDown = Math.floor(this.paletteImage.naturalHeight / 8);

    var colorMap = [];
    var colorIndex = 0;
    for(var y = 0; y < colorHeight; y++) {
      colorMap[y] = [];
      for(var x = 0; x < colorWidth; x++) {
        if(y < colorsDown && x < colorsAcross) {
          colorMap[y][x] = colorIndex++;
        } else {
          colorMap[y][x] = this.editor.colorPaletteManager.noColor;
        }

      }
    }
    this.colorPaletteDisplay.setColors(colors.colors, { colorMap: colorMap });

    var screenWidth = UI.getScreenWidth();
    var screenHeight = UI.getScreenHeight();

    var maxHeight = screenHeight - 111;

    if(colorsAcross > 6 && screenWidth < 800) {
      this.colorPaletteDisplay.fitToWidth(screenWidth - 20);
    }

    this.colorPaletteDisplay.draw();



    //this.showSampleImage(colors.colors);
  },  


  getColorPaletteDescription: function(preset) {
    for(var category in ColorPalettePresets) {
      if(ColorPalettePresets.hasOwnProperty(category)) {

        for(var i = 0; i < ColorPalettePresets[category].colorPalettes.length; i++) {
          var id =  ColorPalettePresets[category].colorPalettes[i].id;
          if(id == preset) {
            return ColorPalettePresets[category].colorPalettes[i];
          }
        }
      }
    }
    return null;
  }

*/

}