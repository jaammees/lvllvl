CharacterSetChoosePresetMobileCard = function() {
  this.holder = null;
  this.cardHeading = null;
  this.cardOptions = null;
  this.canvas = null;

  this.charset = null;


  this.charsetImage = null;
  this.charsetId = false;
  this.charsetOptionId = false;

  this.moveHorizonal = false;
  this.moveVertical = false;
  this.touchStartX = 0;
  this.touchStartY = 0;

  this.touchStartScrollY = 0;

  this.type = 'character';

  this.editor = null;

}

CharacterSetChoosePresetMobileCard.prototype = {
  init: function(editor, postfix) {
    this.editor = editor;
    this.postfix = postfix;
 
  },

  initContent: function() {
    this.holder = $('#chooseCharacterSetMobileHolder' + this.postfix);
    this.cardHeading = $('#chooseCharacterSetMobileHeading' + this.postfix);
    this.cardOptions = $('#chooseCharacterSetMobileOptions' + this.postfix);
    this.canvas = document.getElementById('chooseCharacterSetMobileCanvas' + this.postfix);


    this.cardWidth = $(window).width();
    this.holder.width(this.cardWidth);


  },

  setPosition: function(left, top) {
    this.holder.css('left', left + 'px');
    this.holder.css('top', top + 'px');
  },




  getCharset: function(presetId) {

    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var id =  CharacterSetPresets[category].characterSets[i].id;
          if(id == presetId) {
            charWidth = CharacterSetPresets[category].characterSets[i].width;
            charHeight = CharacterSetPresets[category].characterSets[i].height;
            if(typeof CharacterSetPresets[category].characterSets[i].type == 'undefined') {
              CharacterSetPresets[category].characterSets[i].type = 'ascii';
            }

            return CharacterSetPresets[category].characterSets[i];

          }
        }
      }
    }

    return null;
  },

  setCharset: function(presetId) {


    if(this.charsetId === presetId) {
      return;
    }

    this.charsetId = presetId;
    this.charset = this.getCharset(presetId);

    var heading = this.charset.name;
    if(typeof this.charset.author != 'undefined') {
      heading += ' by ' + this.charset.author;
    }
    this.cardHeading.html(heading);


    var optionsHtml = '';
    var charsetId = this.charset.id;
    var optionsList = this.charset.options;

    var optionName = 'charsetMobileOption_' + charsetId;
    if(typeof optionsList != 'undefined') {
      for(var i = 0; i < optionsList.length; i++) {
        optionsHtml += '<label class="choose-container-tick" ';
        if(i == 0) {
          optionsHtml += ' style="background-color: #666666" ';
        }
        optionsHtml += '>';
        optionsHtml += optionsList[i].name;

        if(typeof optionsList[i].author != 'undefined') {
          optionsHtml += ' by ' + optionsList[i].author;
        }
        optionsHtml += '<input type="radio" name="' + optionName + '" value="' + optionsList[i].id + '" ';
        if(i == 0) {
          this.charsetId = optionsList[i].id;
          optionsHtml += ' checked="checked" ';
        }
        optionsHtml += '>';
        optionsHtml += '<span class="checkmark"></span>'
        optionsHtml += '</label>';
      }

    }

    this.cardOptions.html(optionsHtml);
    this.charsetOptionId = this.charsetId;


    var _this = this;

    $('input[type=radio][name=' + optionName + ']').on('change', function() {
      var name = $(this).attr('name');
      var parent = $(this).parent();
      $('.choose-container-tick').css('background-color', '#333333');
      parent.css('background-color', '#666666');

      _this.charsetOptionId = $('input[name=' + name + ']:checked').val();;

      _this.loadSelectedCharset();
    });


    _this.loadSelectedCharset();
  },



  loadSelectedCharset: function() {
    var filename = this.charsetOptionId + '.png';
    var url = "charsets/" + filename;


    if(this.charsetImage == null) {
      this.charsetImage = new Image();
    }

    var _this = this;
    this.charsetImage.onload = function() {
      _this.displaySelectedCharset();
    }

    this.charsetImage.src = url;
  },

  displaySelectedCharset: function() {

    var tileSet = this.editor.tileSetManager.getCurrentTileSet();

    var charset = this.charset;


    var spacing = 2;
    var scale = 2;
    if(charset.height > 10) {
      scale = 1;
    }

    this.canvas.width = scale * charset.width * 16 + spacing * 17;
    this.canvas.height = scale * charset.height * 16 + spacing * 17;

    var context = this.canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);

    if(this.charCanvas == null) {
      this.charCanvas = document.createElement('canvas');
    }

    this.charCanvas.width = this.charsetImage.naturalWidth;
    this.charCanvas.height = this.charsetImage.naturalHeight;
    var charContext = this.charCanvas.getContext('2d');
    charContext.drawImage(this.charsetImage, 0, 0);
    var charImageData = charContext.getImageData(0, 0, this.charCanvas.width, this.charCanvas.height);


    var args = {};
    args.srcImageData = charImageData;
    args.dstImageData = imageData;
    args.characterWidth = charset.width;
    args.characterHeight = charset.height;
    args.dstCharacterSpacing = 2;
    args.scale = scale;

    tileSet.readImageData(args);
    context.putImageData(imageData, 0, 0);  

  },  


}

var CharacterSetChoosePresetMobile = function() {
  this.editor = null;
  this.uiComponent = null;

  this.cardWidth = false;
  this.cardPosition = 0;

  this.charsetCardA = null;
  this.charsetCardB = null;

  this.moving = false;
  this.touchVelocity = null;
  this.cardMoving = false;

  this.nextPreloadImage = null;
  this.prevPreloadImage = null;

  this.preloadImages = [];
  this.preloadImageIndex = 0;


}

CharacterSetChoosePresetMobile.prototype = {
  init: function(editor) {
    this.editor = editor;
    this.touchVelocity = new TouchVelocity();   
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

      this.uiComponent = UI.create("UI.MobilePanel", { "id": "chooseCharacterSetPresetMobileDialog", "title": "Character Set", "width": width, "height": height });

      this.htmlComponent = UI.create("UI.HTMLPanel");
      this.uiComponent.add(this.htmlComponent);
      this.htmlComponent.load('html/textMode/characterSetChoosePresetMobile.html', function() {
        _this.initContent();
        _this.initEvents();
      });

      this.okButton = UI.create('UI.Button', { "text": "Choose" });
      this.uiComponent.addButton(this.okButton);
      this.okButton.on('click', function(event) {
        if(_this.callback !== false) {
          _this.callback({ 
            "type": _this.type, 
            "presetId": _this.charsetCardA.charsetOptionId
          });
        }

        UI.closeDialog();
      });
    }

    UI.showDialog("chooseCharacterSetPresetMobileDialog");
  },

  initContent: function() {

    var listHTML = '';

    var _this = this;

    var petsciiId = '';
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
        var categoryName = CharacterSetPresets[category].category;

        listHTML += '<optgroup label="' + categoryName + '">';

        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var name = CharacterSetPresets[category].characterSets[i].name;
          var id =  CharacterSetPresets[category].characterSets[i].id;

          listHTML += '<option value="' + id + '"';
          if(id == 'petscii') {
            petsciiId = id;
            listHTML += ' selected="selected" ';
          }
          listHTML += '>';
          listHTML += name;
          listHTML += '</option>';

        }

        listHTML += '</optgroup>';
      }
    }
    $('#characterSetChoosePresetMobileList').html(listHTML);


    this.charsetCardA = new CharacterSetChoosePresetMobileCard();
    this.charsetCardA.init(this.editor, "A");
    this.charsetCardA.initContent();
    this.charsetCardA.setPosition(0, 0);

    this.charsetCardB = new CharacterSetChoosePresetMobileCard();
    this.charsetCardB.init(this.editor, "B");
    this.charsetCardB.initContent();

    this.charsetCardB.setPosition(10000, 0);

    this.cardWidth = $(window).width();

    this.selectCharsetPreset(petsciiId);

  },


  initEvents: function() {
    var _this = this;
    $('#characterSetChoosePresetMobileList').on('change', function(event) {
      _this.selectCharsetPreset($(this).val());
    });

    $('#chooseCharacterSetMobilePrev').on('click', function(event) {
      _this.prevPreset();
    });

    $('#chooseCharacterSetMobileNext').on('click', function(event) {
      _this.nextPreset();
    });


    var holderElement = document.getElementById('chooseCharacterSetMobileHolderA');

    holderElement.addEventListener("touchstart", function(event){
      _this.touchStart(event);
    }, false);

    holderElement.addEventListener("touchmove", function(event){
      _this.touchMove(event);          
    }, false);

    holderElement.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);


    var holderElement = document.getElementById('chooseCharacterSetMobileHolderB');

    holderElement.addEventListener("touchstart", function(event){
      _this.touchStart(event);
    }, false);

    holderElement.addEventListener("touchmove", function(event){
      _this.touchMove(event);          
    }, false);

    holderElement.addEventListener("touchend", function(event) {
      _this.touchEnd(event);
    }, false);


    $('#chooseCharacterSetMobileOptionsA').on('scroll', function(e) {

      var scroll = $(this).scrollTop();

      var diff = (_this.startScrollYA - scroll);
      if(diff < 0) {
        diff = - diff;
      }
      if(diff > 5) {
        _this.moveVertical = true;
      }

    });


    $('#chooseCharacterSetMobileOptionsB').on('scroll', function(e) {
      var scroll = $(this).scrollTop();

      var diff = (_this.startScrollYB - scroll);
      if(diff < 0) {
        diff = - diff;
      }
      if(diff > 5) {
        _this.moveVertical = true;
      }

    });

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
        if(distance != 0) {
          duration = distance / velocity.vx;
        }
      }
    }
    if(duration > 250 || duration < 0) {
      duration = 250;
    }

    this.cardMoving = true;
    this.charsetCardA.holder.animate({
      left: moveTo + 'px'
    }, {

      duration: duration,


      //step: function(now, tween) {
      progress: function(animation, now, tween) {
        var position = _this.charsetCardA.holder.position();
        _this.cardPosition = position.left;
        var left = position.left;

        if(left < 0) {
          var nextPosition = left + _this.cardWidth;
          _this.charsetCardB.holder.css('left', nextPosition + 'px');
          
        } else {
          var nextPosition = left - _this.cardWidth;
          _this.charsetCardB.holder.css('left', nextPosition + 'px');
        }
      },

      complete: function() {

        _this.cardMoving = false;
        if(moveTo !== 0) {
          var presetId = _this.charsetCardB.charsetId;
          var temp = _this.charsetCardB;
          _this.charsetCardB = _this.charsetCardA;
          _this.charsetCardA = temp;
          _this.cardPosition = 0;

          _this.selectCharsetPreset(presetId);



        }
      }
    });
  },


  preloadImage: function(src) {

    if(this.preloadImageIndex >= this.preloadImages.length) {
      this.preloadImages.push(new Image());
    }

    this.preloadImages[this.preloadImageIndex].src = src;
    this.preloadImageIndex = 0;

  },

  preloadNextPrev: function(presetId) {
    this.preloadImageIndex = 0;

    // preload current options
    if(presetId !== false) {
      var charset = this.charsetCardA.getCharset(presetId);

      if(typeof charset != 'undefined') {
        var charsetId = charset.id;
        var optionsList = charset.options;

        var optionIndex = false;

        if(typeof optionsList != 'undefined' && optionsList.length > 0) {
          optionIndex = 0;
          charsetId = optionsList[optionIndex].id;
          for(var i = 1; i < optionsList.length; i++) {
            this.preloadImage("charsets/" + optionsList[i].id + '.png');
          }
        }      
      }
    }

    // make sure next and prev are preloaded
    var nextPresetId = this.getNextPresetId();
    if(nextPresetId !== false) {
      var charset = this.charsetCardA.getCharset(nextPresetId);

      if(typeof charset != 'undefined') {
        var charsetId = charset.id;
        var optionsList = charset.options;

        var optionIndex = false;

    
        if(typeof optionsList != 'undefined' && optionsList.length > 0) {
          optionIndex = 0;
          charsetId = optionsList[optionIndex].id;
          for(var i = 0; i < optionsList.length; i++) {
            this.preloadImage("charsets/" + optionsList[i].id + '.png');
          }
        } else {
          this.preloadImage("charsets/" + charsetId + '.png');
        }
      }
    }

    var prevPresetId = this.getPrevPresetId();
    if(prevPresetId !== false) {
      var charset = this.charsetCardA.getCharset(prevPresetId);

      if(typeof charset != 'undefined') {
        var charsetId = charset.id;
        var optionsList = charset.options;
    
        if(typeof optionsList != 'undefined' && optionsList.length > 0) {
          optionIndex = 0;
          charsetId = optionsList[optionIndex].id;
          for(var i = 0; i < optionsList.length; i++) {
            this.preloadImage("charsets/" + optionsList[i].id + '.png');
          }
        } else {
          this.preloadImage("charsets/" + charsetId + '.png');
        }
      }

    }

  },

  setCardPosition: function(position) {


    this.cardPosition = position;
    var cardWidth = this.charsetCardA.cardWidth;

    //this.cardPosition = position;
    //this.currentCardHolder.css('left', position + 'px');

    var left = position;
    var top = 0;
    this.charsetCardA.setPosition(left, top);

    if(position < 0) {
      var cardBLeft = position + cardWidth ;
      this.charsetCardB.setPosition(cardBLeft, 0);
      this.setCardBContent();
    } else {
      var cardBLeft = position - cardWidth ;
      this.charsetCardB.setPosition(cardBLeft, 0);
      this.setCardBContent();
    }
  },

  getPrevPresetId: function() {

    var prev = false;
    var foundCurrent = false;
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
//        var categoryName = CharacterSetPresets[category].category;


        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var id =  CharacterSetPresets[category].characterSets[i].id;

          if(this.presetId == id) {
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
    var foundCurrent = false;
    for(var category in CharacterSetPresets) {
      if(CharacterSetPresets.hasOwnProperty(category)) {
        for(var i = 0; i < CharacterSetPresets[category].characterSets.length; i++) {
          var id =  CharacterSetPresets[category].characterSets[i].id;

          if(foundCurrent) {
            return id;
          }
          if(this.presetId == id) {
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
        this.charsetCardB.setCharset(nextPresetId);
      }
    }

    if(this.cardPosition > 0) {
      var prevPresetId = this.getPrevPresetId();
      if(prevPresetId !== false) {
        this.charsetCardB.setCharset(prevPresetId);
      }
    }
  },

  selectCharsetPreset: function(presetId) {
    this.presetId = presetId;
    $('#characterSetChoosePresetMobileList').val(this.presetId);

    this.charsetCardA.setCharset(this.presetId);
    this.preloadNextPrev(this.presetId);

  },



  touchStart: function(e) {
    this.touchVelocity.touchStart(e);    
    var touches = e.touches;

    this.startScrollYA = $('#chooseCharacterSetMobileOptionsA').scrollTop();
    this.startScrollYB = $('#chooseCharacterSetMobileOptionsB').scrollTop();


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
        // if card is not auto moving, set its position
        this.setCardPosition(diffX);
      }

      if($(e.target).hasClass('choose-container-tick')) {
        var parent = $(this).parent();
        var scroll = $(parent).scrollTop();

      } else {
        e.preventDefault();
      }

//      var diffX = x - this.touchStartX;
//      this.setCardPosition(diffX);  
    }

  },

  touchEnd: function(e) {
    this.touchVelocity.touchEnd(e);    
    var touches = e.touches;
    this.hideNext();  
    this.moveHorizonal = false;  
    this.moveVertical = false;  

  },


  nextPreset: function() {
    if(this.cardPosition === 0) {
      var nextPresetId = this.getNextPresetId();
      if(nextPresetId !== false) {
        this.charsetCardB.setCharset(nextPresetId);
        this.hideNext({ gotoNext: true});
      }
    }
  },

  prevPreset: function() {
    if(this.cardPosition === 0) {
      var prevPresetId = this.getPrevPresetId();
      if(prevPresetId !== false) {
        this.charsetCardB.setCharset(prevPresetId);
        this.hideNext({ gotoPrev: true });
      }
    }
  },

}
