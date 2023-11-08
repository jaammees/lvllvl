UI.SplitPanelResizeMouseDown = function(event, whichpanel, id) {

  var panel = UI.components[id];
  panel.mouseDownX = event.pageX; //UI.mouseX;
  panel.mouseDownY = event.pageY; //UI.mouseY;
  panel.resizePanel = whichpanel;

  var cursor = 'default';

  switch(whichpanel) {
    case 'north':
      cursor = 'n-resize; cursor: row-resize';
      break;
    case 'east':
      cursor = 'e-resize; cursor: col-resize';
      break;
    case 'south':
      cursor = 's-resize; cursor: row-resize';
      break;
    case 'west':
      cursor = 'w-resize; cursor: col-resize';
      break;
  }


  UI.captureMouse(panel, { "cursor": cursor });

  return false;
}

UI.SplitPanel = function(args) {

  this.element = null;


  // set these to make sure there is at least this much space for them when showing
  // eg hide south when full panel, then show center then show south
  this.southDefaultHeight = false;
  this.centerDefaultHeight = false;


  this.centerVisible = true;
  this.centerSizeSave = 0;

  this.north = null;
  this.northSize = 0;
  this.northBarSize = 0;//5;
  this.northBarSizeSave = 0;
  this.northBorder = true;

  this.northLastWidth = false;
  this.northLastHeight = false;

  this.south = null;
  this.southSize = 0;
  this.southBarSize = 0;// 5;
  this.southBorder = true;
  this.southResizeHidden = false;

  this.southLastWidth = false;
  this.southLastHeight = false;

  this.east = null;
  this.eastSize = 0;
  this.eastBarSize = 0;// 5;
  this.eastBorder = true;

  this.eastLastWidth = false;
  this.eastLastHeight = false;

  this.west = null;
  this.westSize = 0;
  this.westBarSize = 0;//5;
  this.westBorder = true;

  this.westLastWidth = false;
  this.westLastHeight = false;


  this.center = null;

  this.centerLastWidth = false;
  this.centerLastHeight = false;

  this.resizePanel = '';

  this.overflow = 'hidden';

  if(typeof args.overflow != 'undefined') {
    this.overflow = args.overflow;
    
  }


  this.minPanelSize = {};

  this.getPanelSize = function(args) {
    var panel = args.panel;

    if(panel == 'north') {
      return this.northSize;
    }

    if(panel == 'south') {
      return this.southSize;
    }
  }

  this.getPanelWidth = function(panel) {
    if(panel == 'center') {
      return $('#' + this.id + 'center').width();
    }
  }

  this.getPanelHeight = function(panel) {
    if(panel == 'center') {
      return $('#' + this.id + 'center').height();
    }
  }

  
  this.resizeThePanel = function(args) {//panel, newSize) {
    var xdiff = 0;
    var ydiff = 0;

    var newSize = false;

    

    if(typeof args != 'undefined') {
      if(typeof args.panel != 'undefined') {
        this.resizePanel = args.panel;
      }

      if(typeof args.size != 'undefined') {
        newSize = args.size;
      }


      if(typeof args.xDiff != 'undefined') {
        xdiff = args.xDiff;
      }

      if(typeof args.yDiff != 'undefined') {
        ydiff = args.yDiff;
      }
    }



    if(this.resizePanel == 'west') {

      if(newSize === false) {
        newSize = this.westSize + xdiff;
      }

      if(typeof this.minPanelSize['west'] != 'undefined' && newSize < this.minPanelSize['west']) {
        return;
        newSize = this.minPanelSize['west'];
      }

      this.westSize = newSize;


      $('#' + this.id + 'west').css('width', this.westSize + 'px');
      $('#' + this.id + 'westbar').css('left', this.westSize + 'px');
      var left = this.westSize + this.westBarSize;
      $('#' + this.id + 'center').css('left', left + 'px');

      /*
      if(this.center && typeof this.center.resize != 'undefined') {
        this.center.resize();
      }    
      if(this.west && typeof this.west.resize != 'undefined') {
        this.west.resize();
      }
      */

      this.resize();
      this.trigger('resizewest', this.westSize);

    } else if(this.resizePanel == 'east') {
      if(typeof this.eastSize == 'undefined' || isNaN(this.eastSize)) {
        this.eastSize = $('#' + this.id + 'east').width();
      }

      if(typeof this.eastBarSize == 'undefined' || isNaN(this.eastSizeBar)) {
        this.eastBarSize = 5;
      }

      if(newSize === false) {
        newSize = this.eastSize - xdiff;
      }
      if(typeof this.minPanelSize['east'] != 'undefined' && newSize < this.minPanelSize['east']) {
        return;
        newSize = this.minPanelSize['east'];
      }

      this.eastSize = newSize;

      $('#' + this.id + 'east').css('width', this.eastSize + 'px');
      var right = 0;

      if(this.east != null) {
        right = this.eastSize + this.eastBarSize;
      }

      $('#' + this.id + 'eastbar').css('right', this.eastSize + 'px');
      $('#' + this.id + 'center').css('right', right + 'px');

      this.resize();


      this.trigger('resizeeast', this.eastSize);


    } else if(this.resizePanel == 'north') {

      
      if(newSize !== false) {
//        this.northSize = newSize;

      } else {
        newSize = this.northSize + ydiff;

        var centerPosition = $('#' + this.id + 'center').position();
        if(typeof centerPosition != 'undefined') {
          var centerBottom = centerPosition.top + $('#' + this.id + 'center').height();
          if(newSize + this.northBarSize > centerBottom - 4) {
            //uh oh
            // seems to be always returning..
            //return;
          }
        }      
      }


      if(typeof this.minPanelSize['north'] != 'undefined' && newSize < this.minPanelSize['north']) {
        return;
      }
      var top = newSize + this.northBarSize;


      this.northSize = newSize;


      $('#' + this.id + 'north').css('height', this.northSize + 'px');
      $('#' + this.id + 'northbar').css('top', this.northSize + 'px');

      $('#' + this.id + 'east').css('top', top + 'px');
      $('#' + this.id + 'eastbar').css('top', top + 'px');
      $('#' + this.id + 'west').css('top', top + 'px');
      $('#' + this.id + 'westbar').css('top', top + 'px');

      if(this.centerVisible) {
        $('#' + this.id + 'center').css('top', top + 'px');
      } else {

        var splitpanelHeight = $('#' + this.id).height();

        this.southSize = splitpanelHeight - this.northSize - this.northBarSize;

        $('#' + this.id + 'south').css('height', this.southSize + 'px');
  
      }

      this.resize();

      this.trigger('resizenorth', this.northSize);



    } else if(this.resizePanel == 'south') {
      if(newSize !== false) {
      } else {
        newSize = this.southSize - ydiff;        
      }
      var bottom = newSize + this.southBarSize;



      
      this.southSize = newSize;


      $('#' + this.id + 'south').css('height', this.southSize + 'px');
      $('#' + this.id + 'southbar').css('bottom', this.southSize + 'px');

      $('#' + this.id + 'east').css('bottom', bottom + 'px');
      $('#' + this.id + 'eastbar').css('bottom', bottom + 'px');
      $('#' + this.id + 'west').css('bottom', bottom + 'px');
      $('#' + this.id + 'westbar').css('bottom', bottom + 'px');

      $('#' + this.id + 'center').css('bottom', bottom + 'px');

      this.resize();
      this.trigger('resizesouth', this.southSize);

      /*
        if(this.south && typeof this.south.resize != 'undefined') {
          this.south.resize();
        }
        if(this.center && typeof this.center.resize != 'undefined') {
          this.center.resize();
        }
        if(this.east && typeof this.east.resize != 'undefined') {
          this.east.resize();
        }
        if(this.west && typeof this.west.resize != 'undefined') {
          this.west.resize();
        }
      */

    }
  }

  this.setMinSize = function(panel, size) {
    this.minPanelSize[panel] = size;


  }

/*
  this.resize = function() {

    
    if(this.center && typeof this.center.resize != 'undefined') {
      this.center.resize();
    }

    if(this.south && typeof this.south.resize != 'undefined') {
      this.south.resize();
    }


    if(this.north && typeof this.north.resize != 'undefined') {
      this.north.resize();
    }

    if(this.east && typeof this.east.resize != 'undefined') {

      this.east.resize();
    }

    if(this.west && typeof this.west.resize != 'undefined') {
      this.west.resize();
    }
  }
*/


  // if its webgl child panel, need to call resize when change size or position....
  this.resize = function() {
    var width = $('#' + this.id).width();
    var height = $('#' + this.id).height();


    if(!this.centerVisible) {
      // uh oh a resize with center not visible
 
      if(this.northSize != 0 && this.southSize != 0) {
        var splitpanelHeight = $('#' + this.id).height();
        this.northSize = splitpanelHeight - this.southSize - this.northBarSize;
        $('#' + this.id + 'north').css('height', this.northSize + 'px');
        $('#' + this.id + 'northbar').css('top', this.northSize + 'px');
      } else if(this.northSize != 0) { 
        var splitpanelHeight = $('#' + this.id).height();

        if(splitpanelHeight != 0) {
          this.northSize = splitpanelHeight;

          $('#' + this.id + 'north').css('height', this.northSize + 'px');
          $('#' + this.id + 'northbar').css('top', this.northSize + 'px');
        }

      } else if(this.southSize != 0) {
        var splitpanelHeight = $('#' + this.id).height();

        if(splitpanelHeight != 0) {
          this.southSize = splitpanelHeight;

          $('#' + this.id + 'south').css('height', this.southSize + 'px');
          $('#' + this.id + 'southbar').hide();//'top', this.northSize + 'px');
        }

      } else if(this.eastSize != 0) {
        var splitpanelWidth = $('#' + this.id).width();

        if(splitpanelWidth != 0) {
          this.eastSize = splitpanelWidth;

          $('#' + this.id + 'east').css('width', this.eastSize + 'px');
          $('#' + this.id + 'eastbar').hide();//'top', this.northSize + 'px');
        }
        
      }
    }
    
    if(this.center && typeof this.center.resize != 'undefined') {
      var centerWidth = width - this.eastSize - this.westSize;
      var centerHeight = height - this.southSize - this.northSize;
      if(true || centerWidth !== this.centerLastWidth || centerHeight !== this.centerLastHeight) {  
        this.centerLastWidth = centerWidth;
        this.centerLastHeight = centerHeight;

        this.center.resize();
      }
    }

    if(this.south && typeof this.south.resize != 'undefined') {
      if(this.southLastHeight !== this.southSize || this.southLastWidth !== width) {
        this.southLastHeight = this.southSize;
        this.southLastWidth = width;
        this.south.resize();
      }
    }


    if(this.north && typeof this.north.resize != 'undefined') {

      if(true || this.northLastHeight !== this.northSize || this.northLastWidth !== width) {
        this.northLastHeight = this.northSize;
        this.northLastWidth = width;

        this.north.resize();
      }
    }

    if(this.east && typeof this.east.resize != 'undefined') {

      if(this.eastLastHeight !== height || this.eastLastWidth !== this.eastSize) {
        this.eastLastHeight = height;
        this.eastLastWidth = this.eastSize;
        this.east.resize();
      }
    }

    if(this.west && typeof this.west.resize != 'undefined') {
      if(this.westLastHeight !== height || this.westLastWidth !== this.westSize) {
        this.westLastHeight = height;
        this.westLastWidth = this.westSize;
        this.west.resize();
      }
    }
  }
  


  this.mouseDown = function(event) {

  }

  this.mouseMove = function(event) {

    var xDiff = event.pageX - this.mouseDownX;
    var yDiff = event.pageY - this.mouseDownY;


    this.resizeThePanel({ xDiff: xDiff, yDiff: yDiff });
    this.mouseDownX = event.pageX
    this.mouseDownY = event.pageY;
    
  }


  this.mouseUp = function(event) {
    var xDiff = event.pageX - this.mouseDownX;
    var yDiff = event.pageY - this.mouseDownY;
    this.resizeThePanel({ xDiff: xDiff, yDiff: yDiff });

//    UI.releaseMouse();
  }

  this.getPanelVisible = function(panel) {
    switch(panel) {
      case 'north':
        return this.northSize != 0;
        break;
      case 'south':
        return this.southSize != 0;
        break;
      case 'east':
        return this.eastSize != 0;
        break;
      case 'west':
        return this.westSize != 0;
        break;
      case 'center':
        return this.centerVisible;
        break;
    }
  }


  this.getPanelVisible = function(panel) {
    if(panel == 'center') {
      return this.centerVisible;
    }
    return $('#' + this.id + panel).is(':visible');
  }


  this.setResizeVisible = function(panel, visible) {
    if(panel == 'south') {
      if(visible) {

        this.southResizeHidden = false;
        if(UI.ready) {

          $('#' + this.id + panel + 'bar').show();
          if(this.southBarSize == 0) {
            this.southBarSize = 5;
            this.southSize -= this.southBarSize;
            $('#' + this.id + 'south').css('height', this.southSize + 'px');
            $('#' + this.id + panel + 'bar').css('height', this.southBarSize + 'px');
            this.south.resize();
          }
        }

        this.southBarSize = 5;

      } else {
        this.southResizeHidden = true;

        if(UI.ready) {
          $('#' + this.id + panel + 'bar').hide();
          // increase south panel size by 5?
          if(this.southBarSize != 0) {
            

            
            this.southSize += this.southBarSize;
            this.southBarSize = 0;


            $('#' + this.id + 'south').css('height', this.southSize + 'px');
            this.south.resize();
          }
        }

        this.southBarSize = 0;


      }
      
    }
  }

  this.setPanelVisible = function(panel, visible, minSize, resizeVisible) {

    var minimumSize = false;
    if(typeof minSize != 'undefined') {
      minimumSize = minSize;
    }

    var forceResizeVisible = false;
    if(typeof resizeVisible != 'undefined') {
      forceResizeVisible = resizeVisible;
    }


    if(typeof visible == 'undefined' || visible) {

      if(this.getPanelVisible(panel)) {
        // already visible
        return;
      }

      $('#' + this.id + panel).show();

      if(panel != 'center') {
        $('#' + this.id + panel + 'bar').show();
      }

      if(panel == 'center') {
        // show center
        this.centerVisible = true;
        // need to check if center had a size when it was visible
        if(this.centerSizeSave == 0) {
          this.centerSizeSave = 200;

          if(minimumSize !== false) {
            this.centerSizeSave = minimumSize;
          }
        }

        if(this.northSize != 0 && this.southSize != 0) {
          var newNorthSize = this.northSize - this.centerSizeSave;
          if(newNorthSize < 100) {
            newNorthSize = 100;
          }
          
          this.northSize = newNorthSize;
          this.northBarSize = this.northBarSizeSave;
          this.southBarSize = this.southBarSizeSave;     
          
          if(forceResizeVisible) {
            this.northBarSize = 5;
            this.southBarSize = 5;
            $('#' + this.id + 'southbar').show();
          }
        } else if(this.northSize != 0) {
  //        var splitpanelHeight = $('#' + this.id).height();

          var newNorthSize = this.northSize - this.centerSizeSave;
          if(newNorthSize < 100) {
            newNorthSize = 100;
          }
          
          this.northSize = newNorthSize;
          this.northBarSize = 5;
          
        } else if(this.southSize != 0) {
//          var splitpanelHeight = $('#' + this.id).height();

          var newSouthSize = this.southSize - this.centerSizeSave;
          if(newSouthSize  < 100) {
            newSouthSize  = 100;
          }
          
          this.southSize = newSouthSize;
          this.southBarSize = 5;
          $('#' + this.id + 'southbar').show();

        } else if(this.eastSize != 0) {
          var newEastSize = this.eastSize - this.centerSizeSave;
          if(newEastSize  < 100) {
            newEastSize  = 100;
          }
          
          this.eastSize = newEastSize;
          this.eastBarSize = 5;
          $('#' + this.id + 'eastbar').show();

        }

      }
      
      if(panel == 'west') {
        if(typeof this.westSizeSave != 'undefined') {
          this.westSize = this.westSizeSave;
          this.westBarSize = this.westBarSizeSave;
        }

      }

      if(panel == 'east') {
        if(typeof this.eastSizeSave != 'undefined') {         
          this.eastSize = this.eastSizeSave;
          this.eastBarSize = this.eastBarSizeSave;
        }
      }       

      if(panel == 'north') {
        // set panel visible
        if(typeof this.northSizeSave != 'undefined') {             
          
          if(!this.centerVisible) {
            var splitpanelHeight = $('#' + this.id).height();            
            if(this.southSize) {

              // centre not visible but south is visible
              this.northBarSize = 5;// this.northBarSizeSave;
              this.northSize = this.northSizeSave;
              if(this.northSize <= 0) {
                this.northSize = 100;
              }
              if(splitpanelHeight - this.northSize < 100) {
                this.northSize = splitpanelHeight - 100;
              }

              this.southSize = splitpanelHeight - this.northSize - this.northBarSize;
              this.southBarSizeSave = this.southBarSize;
              this.southBarSize = 0;
            } else {
              // full panel size
              this.northSize = splitpanelHeight;
              this.southBarSize;
              this.northBarSize = 0;
            }
          } else {

            if(minimumSize !== false) {
              if(this.northSizeSave === false || this.northBarSizeSave < minimumSize) {
                this.northSizeSave = minimumSize;
              }
            }

            if(forceResizeVisible) {
              this.northBarSizeSave = 5;
            }

            if(this.northSizeSave != 0) {
              this.northSize = this.northSizeSave;
              this.northBarSize = this.northBarSizeSave;
            } 

  


            // make sure still enough room for center
            var splitpanelHeight = $('#' + this.id).height();          
            if(this.centerDefaultHeight !== false) {
              if(splitpanelHeight - this.northSize < this.centerDefaultHeight) {
                this.northSize = splitpanelHeight - this.centerDefaultHeight;
                this.northBarSize = 5;
              }
            }

            
          }
        }
      }


      if(panel == 'south') {
        if(!this.centerVisible) {
          var splitpanelHeight = $('#' + this.id).height();            
          if(this.northSize) {
            // center not visible, but north is visible
            this.southBarSize = 0;
            this.northBarSize = this.northBarSizeSave;

            if(forceResizeVisible) {
              this.northBarSize = 5;
            }

            this.southSize = this.southSizeSave;

            if(minimumSize !== false) {
              this.southSize = minimumSize;
            }

            this.northSize = splitpanelHeight - this.southSize - this.northBarSize;
          } else {
            // take up the whole panel
            this.southSize = splitpanelHeight;
            this.southBarSize = 0;
            this.northBarSize = 0;
          }
        } else {
        
          if(typeof this.southSizeSave != 'undefined') {
            this.southSize = this.southSizeSave;
          }

          if(minimumSize !== false) {
            this.southSize = minimumSize;
          }

          // make sure still enough room for center
          var splitpanelHeight = $('#' + this.id).height();          
          if(this.centerDefaultHeight !== false) {
            if(splitpanelHeight - this.southSize < this.centerDefaultHeight) {
              this.southSize = splitpanelHeight - this.centerDefaultHeight;
              this.southBarSizeSave = 5;
            }
          }
          

          if(typeof this.southBarSizeSave != 'undefined')  {
            this.southBarSize = this.southBarSizeSave;
          }

          if(forceResizeVisible) {
            this.southBarSize = 5;
          }
        }
      }      
    } else {
      $('#' + this.id + panel).hide();
      $('#' + this.id + panel + 'bar').hide();

      if(panel == 'center') {
        this.centerVisible = false;        
        
        this.centerSizeSave = $('#' + this.id + panel).height();

        var splitpanelHeight = $('#' + this.id).height();
        var splitpanelWidth = $('#' + this.id).width();
        // if north and south are visible, join them north becomes larger?
        if(this.northSize != 0 && this.southSize != 0) {          
          this.northSize = splitpanelHeight - this.southSize - this.northBarSize;

          this.southBarSizeSave = this.southBarSize;
          this.southBarSize = 0;

          if(forceResizeVisible) {
            this.northBarSize = 5;
          }
//          this.northBarSize = 5;

        } else if(this.northSize != 0) {
          // only north visible
          this.northSize = splitpanelHeight;

          this.northBarSizeSave = this.northBarSize;
          this.northBarSize = 0;

          this.southBarSizeSave = this.southBarSize;
          this.southBarSize = 0;
          
          
        } else if(this.southSize != 0) {
          // only south visible
          this.southSize = splitpanelHeight;

          this.northBarSizeSave = this.northBarSize;
          this.northBarSize = 0;


          this.southBarSizeSave = this.southBarSize;
          this.southBarSize = 0;

        } else if(this.eastSize != 0) {
          this.centerSizeSave = $('#' + this.id + panel).width();
          this.eastSize = splitpanelWidth;

          this.eastBarSizeSave = this.eastBarSize;
          this.eastBarSize = 0;

          this.westBarSizeSave = this.westBarSize;
          this.westBarSize = 0;
        }


//         this.southSize = splitpanelHeight - this.northSize - this.northBarSize;
//        $('#' + this.id + 'south').css('height', this.southSize + 'px');
        

      }
      if(panel == 'west') {

        if(this.westSize != 0) {
          this.westSizeSave = this.westSize;
          this.westBarSizeSave = this.westBarSize;
          this.westSize = 0;
          this.westBarSize = 0;
        } else {
          // already hidden!
          return;
        }
      }

      if(panel == 'east') {
        if(this.eastSize != 0) {
          this.eastSizeSave = this.eastSize;
          this.eastBarSizeSave = this.eastBarSize;
          this.eastSize = 0;
          this.eastBarSize = 0;
        } else {
          // already hidden!
          return;
        }

      }

      if(panel == 'north') {
        this.northSizeSave = this.northSize;
        this.northBarSizeSave = this.northBarSize;
        this.northSize = 0;
        this.northBarSize = 0;

        if(!this.centerVisible) {
          if(this.southSize > 0) {
            var splitpanelHeight = $('#' + this.id).height();
            this.southSize = splitpanelHeight;
            this.southBarSizeSave = this.southBarSize;
            this.southBarSize = 0;
          }
        }

      }


      if(panel == 'south') {
        if(this.southSize != 0) {
          this.southSizeSave = this.southSize;
          this.southBarSizeSave = this.southBarSize;
          this.southSize = 0;
          this.southBarSize = 0;

          if(!this.centerVisible) {
            if(this.northSize > 0) {
              // make north full height
              var splitpanelHeight = $('#' + this.id).height();
              this.northSize = splitpanelHeight;
//              this.southBarSizeSave = this.southBarSize;
//              this.southBarSize = 0;
  
            }
          }
        } else {
          // already hidden
          return;
        }
      }      
    }


    if(panel == 'west') {
      $('#' + this.id + 'west').css('width', this.westSize + 'px');
      $('#' + this.id + 'westbar').css('left', this.westSize + 'px');
      $('#' + this.id + 'westbar').css('width', this.westBarSize + 'px');
      var left = this.westSize + this.westBarSize;

      $('#' + this.id + 'center').css('left', left + 'px');
    }

    if(panel == 'east' && this.east != null) {
      $('#' + this.id + 'east').css('width', this.eastSize + 'px');
      $('#' + this.id + 'eastbar').css('right', this.eastSize + 'px');
      var right = this.eastSize + this.eastBarSize;

      $('#' + this.id + 'center').css('right', right + 'px');

    }


    if(panel == 'north') {
      $('#' + this.id + 'north').css('height', this.northSize + 'px');
      $('#' + this.id + 'northbar').css('top', this.northSize + 'px');
      var top = this.northSize + this.northBarSize;
      $('#' + this.id + 'center').css('top', top + 'px');

      if(!this.centerVisible) {
        $('#' + this.id + 'south').css('height', this.southSize + 'px');
        $('#' + this.id + 'southbar').css('bottom', this.southSize + 'px');
        var bottom = this.southSize + this.southBarSize;
//        $('#' + this.id + 'center').css('bottom', bottom + 'px');
      }

      $('#' + this.id + 'southbar').css('height', this.southBarSize + 'px');
      $('#' + this.id + 'northbar').css('height', this.northBarSize + 'px');

    }

    if(panel == 'south') {
      $('#' + this.id + 'south').css('height', this.southSize + 'px');
      $('#' + this.id + 'southbar').css('bottom', this.southSize + 'px');
      var bottom = this.southSize + this.southBarSize;
      $('#' + this.id + 'center').css('bottom', bottom + 'px');

      if(!this.centerVisible) {
        $('#' + this.id + 'north').css('height', this.northSize + 'px');
        $('#' + this.id + 'northbar').css('top', this.northSize + 'px');
        var top = this.northSize + this.northBarSize;
        $('#' + this.id + 'center').css('top', top + 'px');  
      }
      $('#' + this.id + 'southbar').css('height', this.southBarSize + 'px');
      $('#' + this.id + 'northbar').css('height', this.northBarSize + 'px');

    }


    if(panel == 'center') {
      $('#' + this.id + 'north').css('height', this.northSize + 'px');
      $('#' + this.id + 'northbar').css('top', this.northSize + 'px');
      var top = this.northSize + this.northBarSize;
      $('#' + this.id + 'center').css('top', top + 'px');

      $('#' + this.id + 'south').css('height', this.southSize + 'px');
      $('#' + this.id + 'southbar').css('bottom', this.southSize + 'px');
      var bottom = this.southSize + this.southBarSize;
      $('#' + this.id + 'center').css('bottom', bottom + 'px');

      $('#' + this.id + 'southbar').css('height', this.southBarSize + 'px');
      $('#' + this.id + 'northbar').css('height', this.northBarSize + 'px');

      $('#' + this.id + 'east').css('width', this.eastSize + 'px');


      $('#' + this.id + 'eastbar').css('right', this.eastSize + 'px');

      var right = this.eastSize + this.eastBarSize;
      $('#' + this.id + 'center').css('right', right + 'px');

      $('#' + this.id + 'eastbar').css('width', this.eastBarSize + 'px');


    }

      this.resize();
      /*
      this.resizePanel = 'west';
      this.resizeThePanel();
      this.resizePanel = 'north';
      this.resizeThePanel();
      this.resizePanel = 'south';
      this.resizeThePanel();
      this.resizePanel = 'east';
      this.resizeThePanel();
      */

  }

  this.hidePanel = function(panel) {
    $('#' + this.id + panel).hide();
    $('#' + this.id + panel + 'bar').hide();

  }


  this.addEast = function(east, eastSize, border, hidden) {
    this.east = east;
    this.eastSize = eastSize;

    this.eastHidden = hidden;
    if(typeof hidden == 'undefined') {
      this.eastHidden = false;
    }


    if(typeof(eastSize) == 'undefined') {
      this.eastSize = 100;
    }

    this.eastBarSize = 5;
    if(typeof(border) != 'undefined') {
      this.eastBorder = border;
      if(!this.eastBorder) {
        this.eastBarSize = 0;
      }
    }



    if(this.eastHidden) {
      this.eastSizeSave = this.eastSize;
      this.eastBarSizeSave = this.eastBarSize;
      this.eastBarSize = 0;
      this.eastSize = 0;
    }

    if(UI.ready) {
      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;

      var eastElement = document.createElement('div');
      eastElement.setAttribute('id', this.id + 'east');
      var style = 'position: absolute; overflow-x; ' + this.overflow + '; overflow-y: ' + this.overflow + '; top: ' + top + 'px; right: 0px; bottom: ' + bottom + 'px; width: ' + this.eastSize + 'px; ';
      if(this.eastHidden) {
        style += ' display: none;';
      }
      eastElement.setAttribute('style', style);
      eastElement.appendChild(east.getElement());

      var thisElement = this.getElement();
      thisElement.appendChild(eastElement);

/*
      html += '    <div id="' + this.id + 'east" style="position: absolute; overflow-x; hidden; overflow-y: hidden; top: ' + top + 'px; right: 0px; bottom: ' + bottom + 'px; width: ' + this.eastSize + 'px; " >';
      html += this.east.getHTML();
      html += '    </div>';
*/
      // east resize bar
      if(this.eastBorder) {
        var eastBarElement = document.createElement('div');
        eastBarElement.setAttribute('id', this.id + 'eastbar');
        var style = 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; top: ' + top + 'px; right: ' + this.eastSize + 'px; bottom: ' + bottom + 'px; width: ' + this.eastBarSize + 'px; cursor: e-resize; cursor: col-resize;';
        if(this.eastHidden) {
          style += ' display: none; ';
        }
        eastBarElement.setAttribute('style', style);
        eastBarElement.setAttribute('onmousedown', 'return UI.SplitPanelResizeMouseDown(event, \'east\', \'' + this.id + '\')');
        eastBarElement.setAttribute('onselectstart', 'return false');
        eastBarElement.innerHTML = '<div class="ui-splitpanel-eastresize"><div class="ui-splitpanel-verticalresizehandle"></div></div>';
        thisElement.appendChild(eastBarElement);

        /*
        html += '    <div id="' + this.id + 'eastbar" style="position: absolute; overflow-x: hidden; overflow-y: hidden; top: ' + top + 'px; right: ' + this.eastSize + 'px; bottom: ' + bottom + 'px; width: ' + this.eastBarSize + 'px; cursor: e-resize; cursor: col-resize" onmousedown="return UI.SplitPanelResizeMouseDown(\'east\', \'' + this.id + '\')" onselectstart="return false">';
        html += '      <div class="ui-splitpanel-eastresize">';
//        html += '            <div style="width: ' + this.eastBarSize + 'px; position: absolute; left: 0; right: 0; top: 0; bottom: 0"></div>';
        html += '        <div class="ui-splitpanel-verticalresizehandle"></div> ';
        html += '      </div>';
        html += '    </div>';
        */
      }
      this.resizePanel = 'south'
      this.resizeThePanel();
      this.resizePanel = 'north'
      this.resizeThePanel();

    }

  }

  this.addWest = function(west, westSize, border, hidden) {
    this.westHidden = hidden;
    if(typeof hidden == 'undefined') {
      this.westHidden = false;
    }

    this.west = west;
    if(typeof(westSize) == 'undefined') {
      westSize = 100;
    }
    this.westSize = westSize;

    this.westBarSize = 5;


    if(typeof(border) != 'undefined') {
      this.westBorder = border;
      if(!this.westBorder) {
        this.westBarSize = 0;
      }
    }

    this.westThinBorder = false;

    if(this.westHidden) {
      this.westSizeSave = this.westSize;
      this.westBarSizeSave = this.westBarSize;
      this.westBarSize = 0;
      this.westSize = 0;
    }

    if(UI.ready) {
      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;

      var westElement = document.createElement('div');
      westElement.setAttribute('id', this.id + 'west');
      var style = 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westSize + 'px;';
      if(this.westHidden) {
        style += ' display: none; ';
      }
      westElement.setAttribute('style', style);

      if(this.westThinBorder) {
        style += ' border-right: 1px solid #ff0000; ';  
      }

      westElement.appendChild(west.getElement());

      var thisElement = this.getElement();
      thisElement.appendChild(westElement);

  /*
      html += '    <div id="' + this.id + 'west" style=" position: absolute; overflow-x: hidden; overflow-y: hidden; left: 0; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westSize + 'px" >';
      html += this.west.getHTML();
      html += '    </div>';
  */

      // west resize bar
      if(this.westBorder) {

        var westBarElement = document.createElement('div');
        westBarElement.setAttribute('id', this.id + 'westbar');
        var style = 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: ' + this.westSize + 'px; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westBarSize + 'px;  cursor: w-resize; cursor: col-resize; vertical-align: middle;';
        if(this.westHidden) {
          style += ' display: none';
        }
        westBarElement.setAttribute('style', style);
        westBarElement.setAttribute('onmousedown', 'return UI.SplitPanelResizeMouseDown(event, \'west\', \'' + this.id + '\')');
        westBarElement.setAttribute('onselectstart', 'return false');
        westBarElement.innerHTML = '<div class="ui-splitpanel-westresize"><div class="ui-splitpanel-verticalresizehandle"></div></div>';
        thisElement.appendChild(westBarElement);

        /*
        html += '    <div id="' + this.id + 'westbar"  style="position: absolute; overflow-x: hidden; overflow-y: hidden; left: ' + this.westSize + 'px; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westBarSize + 'px;  cursor: w-resize; cursor: col-resize; vertical-align: middle;" onmousedown="return UI.SplitPanelResizeMouseDown(\'west\', \'' + this.id + '\')" onselectstart="return false">';
        html += '    <div class="ui-splitpanel-westresize">';
  //        html += '            <div style="width: ' + this.westBarSize + 'px; position: absolute; left: 0; right: 0; top: 0; bottom: 0"></div>';
        html += '      <div class="ui-splitpanel-verticalresizehandle"></div> ';
        html += '    </div>';
        html += '    </div>';
        */
      }

      if(this.westHidden) {
        this.westBarSize = 0;
        
      }

      this.resizePanel = 'south'
      this.resizeThePanel();
      this.resizePanel = 'north'
      this.resizeThePanel();      
    }



  }

  this.addNorth = function(north, northSize, border, hidden) {
    this.northHidden = hidden;
    if(typeof hidden == 'undefined') {
      this.northHidden = false;
    }

    this.north = north;
    if(typeof(northSize) == 'undefined') {
      northSize = 100;
    }
    this.northSize = northSize;
    this.northBarSize = 5;

    if(typeof(border) != 'undefined') {
      this.northBorder = border;
      if(!this.northBorder) {
        this.northBarSize = 0;
      }
    }

    if(this.northHidden) {
      this.northSizeSave = this.northSize;
      this.northBarSizeSave = this.northBarSize;
      this.northBarSize = 0;
      this.northSize = 0;
    }


    if(UI.ready) {
      var northElement = document.createElement('div');
      northElement.setAttribute('id', this.id + 'north');
      northElement.setAttribute('style', 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; top: 0; bottom: 0; height: ' + this.northSize + 'px');
      northElement.appendChild(north.getElement());

      var thisElement = this.getElement();
      thisElement.appendChild(northElement);

      if(this.northBorder) {
        var northBarElement = document.createElement('div');
        northBarElement.setAttribute('id', this.id + 'northbar');
        northBarElement.setAttribute('style', 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; top: ' + this.northSize + 'px; height: ' + this.northBarSize + 'px; cursor: n-resize; cursor: row-resize');
        northBarElement.setAttribute('onmousedown', 'return UI.SplitPanelResizeMouseDown(event, \'north\', \'' + this.id + '\')');
        northBarElement.setAttribute('onselectstart', 'return false');
        northBarElement.innerHTML = '<div class="ui-splitpanel-northresize"><div class="ui-splitpanel-horizontalresizehandle"></div></div>';
        thisElement.appendChild(northBarElement);

      }
      this.resizePanel = 'north'
      this.resizeThePanel();
      this.resizePanel = 'south'
      this.resizeThePanel();  
      this.resizePanel = 'east'
      this.resizeThePanel();  
      this.resizePanel = 'west'
      this.resizeThePanel();  
      
    }

    /*
      html += '    <div id="' + this.id + 'north" style="position: absolute; overflow-x: hidden; overflow-y: hidden; left: 0; right: 0; top: 0; bottom: 0; height: ' + this.northSize + 'px"  >';
      html += this.north.getHTML();
      html += '    </div>';

      // north resize bar

      if(this.northBorder) {
        html += '    <div id="' + this.id + 'northbar" style="position: absolute; overflow-x: hidden; overflow-y: hidden; left: 0; right: 0; top: ' + this.northSize + 'px; height: ' + this.northBarSize + 'px; cursor: n-resize; cursor: row-resize"  onmousedown="return UI.SplitPanelResizeMouseDown(\'north\', \'' + this.id + '\')" onselectstart="return false">';
        html += '        <div class="ui-splitpanel-northresize">';
        html += '            <div class="ui-splitpanel-horizontalresizehandle"></div> ';
        html += '        </div>';
        html += '    </div>';
      }    */
  }

  this.addSouth = function(south, southSize, border, hidden) {
    this.southHidden = hidden;
    if(typeof hidden == 'undefined') {
      this.southHidden = false;
    }



    this.south = south;
    if(typeof(southSize) == 'undefined') {
      southSize = 100;
    }
    this.southSize = southSize;
    this.southBarSize = 5;
    
    if(typeof(border) != 'undefined') {
      this.southBorder = border;
      if(!this.southBorder) {
        this.southBarSize = 0;
      }
    }

    if(this.southHidden) {
      this.southSizeSave = this.southSize;
      this.southBarSizeSave = this.southBarSize;
      this.southBarSize = 0;
      this.southSize = 0;
    }


    if(UI.ready) {
      var southElement = document.createElement('div');
      southElement.setAttribute('id', this.id + 'south');
      var style = 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; bottom: 0; height: ' + this.southSize + 'px;';
      if(this.southHidden) {
        style += 'display: none;';
      }
      southElement.setAttribute('style', style);
      southElement.appendChild(south.getElement());

      var thisElement = this.getElement();
      thisElement.appendChild(southElement);

      if(this.southBorder) {
        var southBarElement = document.createElement('div');
        southBarElement.setAttribute('id', this.id + 'southbar');
        var style = 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; bottom: ' + this.southSize + 'px; height: ' + this.southBarSize + 'px; cursor: s-resize; cursor: row-resize;';
        if(this.southHidden) {
          style += 'display: none;';
        }

        southBarElement.setAttribute('style', style);
        southBarElement.setAttribute('onmousedown', 'return UI.SplitPanelResizeMouseDown(event, \'south\', \'' + this.id + '\')');
        southBarElement.setAttribute('onselectstart', 'return false');
        southBarElement.innerHTML = '<div class="ui-splitpanel-southresize"><div class="ui-splitpanel-horizontalresizehandle"></div></div>';
        thisElement.appendChild(southBarElement);

      }

      this.resizePanel = 'north'
      this.resizeThePanel();
      this.resizePanel = 'south'
      this.resizeThePanel();  
      this.resizePanel = 'east'
      this.resizeThePanel();  
      this.resizePanel = 'west'
      this.resizeThePanel();  
      this.resizePanel = 'center';
      this.resizeThePanel();  

    }
  }


  this.add = function(center, hidden) {
    this.center = center;

    if(typeof hidden == 'undefined' || hidden === false) {
      this.centerVisible = true;
    } else {
      this.centerVisible = false;
      
    }

    if(UI.ready) {

      

      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;
      var left = this.westSize + this.westBarSize;
      var right = this.eastSize + this.eastBarSize;
      if(this.east == null) {
        right = 0;
      }
      var centerElement = document.createElement('div');
      centerElement.setAttribute('id', this.id + 'center');
      centerElement.setAttribute('style','position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: ' + left + 'px; top: ' + top + 'px; right: ' + right + 'px; bottom: ' + bottom + 'px;');
      centerElement.appendChild(center.getElement());

      var thisElement = this.getElement();
      thisElement.appendChild(centerElement);
    }
  }


  this.getElement = function() {
    if(this.element == null) {
      this.element = document.getElementById(this.id);
      if(this.element) {
        return this.element;
      }
      this.element = document.createElement('div');
      this.element.setAttribute('id', this.id);
      this.element.setAttribute('style', 'position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow );
    }
    return this.element;
  }
  this.getHTML = function() {
    var html = '';
    html += '<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '" id="' + this.id + '"  >';

    // north

    if(this.north != null) {
      html += '    <div id="' + this.id + 'north" style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; top: 0; bottom: 0; height: ' + this.northSize + 'px;';

      if(this.northHidden) {
        html += ' display: none; ';
      }


      html += '"   >';
      html += this.north.getHTML();
      html += '    </div>';

      // north resize bar

      if(this.northBorder) {
        html += '    <div id="' + this.id + 'northbar" style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; top: ' + this.northSize + 'px; height: ' + this.northBarSize + 'px; cursor: n-resize; cursor: row-resize; ';
        if(this.northHidden) {
          html += ' display: none; ';
        }
        html += '"  onmousedown="return UI.SplitPanelResizeMouseDown(event, \'north\', \'' + this.id + '\')" onselectstart="return false">';
        html += '        <div class="ui-splitpanel-northresize">';
        html += '            <div class="ui-splitpanel-horizontalresizehandle"></div> ';
        html += '        </div>';
        html += '    </div>';
      }
    } else {
      this.northBarSize = 0;
    }

    // south
    if(this.south != null) {

      html += '    <div id="' + this.id + 'south" style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; bottom: 0; height: ' + this.southSize + 'px;';
      if(this.southHidden) {
        html += ' display: none;' 
      }
      html += ' "  >';
      html += this.south.getHTML();
      html += '    </div>';

      // south resize bar
      if(this.southBorder) {
        html += '    <div id="' + this.id + 'southbar"  style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; right: 0; bottom: ' + this.southSize + 'px; height: ' + this.southBarSize + 'px; cursor: s-resize; cursor: row-resize; ';
        if(this.southHidden || !this.centerVisible || this.southResizeHidden) {
          html += ' display: none;';
        }
        html += '"  onmousedown="return UI.SplitPanelResizeMouseDown(event, \'south\', \'' + this.id + '\')" onselectstart="return false">';
        html += '        <div class="ui-splitpanel-southresize">';
        html += '            <div class="ui-splitpanel-horizontalresizehandle"></div> ';
//      html += '            <div style="height: ' + this.southBarSize + 'px; position: absolute; left: 0; right: 0; top: 0; bottom: 0"></div>';
        html += '        </div>';
        html += '    </div>';
      }
    } else {
      this.southBarSize = 0;
    }

    // east
    if(this.east) {
      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;
      html += '    <div id="' + this.id + 'east" style="position: absolute; overflow-x; ' + this.overflow + '; overflow-y: ' + this.overflow + '; top: ' + top + 'px; right: 0px; bottom: ' + bottom + 'px; width: ' + this.eastSize + 'px;';
      if(this.eastHidden) {
        html += ' display: none; ';
      }
      html += ' " >';
      html += this.east.getHTML();
      html += '    </div>';

      // east resize bar
      if(this.eastBorder) {
        html += '    <div id="' + this.id + 'eastbar" style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; top: ' + top + 'px; right: ' + this.eastSize + 'px; bottom: ' + bottom + 'px; width: ' + this.eastBarSize + 'px; cursor: e-resize; cursor: col-resize; ';

        if(this.eastHidden) {
          html += ' display: none ';
        }
        html += ' " onmousedown="return UI.SplitPanelResizeMouseDown(event, \'east\', \'' + this.id + '\')" onselectstart="return false">';
        html += '      <div class="ui-splitpanel-eastresize">';
//        html += '            <div style="width: ' + this.eastBarSize + 'px; position: absolute; left: 0; right: 0; top: 0; bottom: 0"></div>';
        html += '        <div class="ui-splitpanel-verticalresizehandle"></div> ';
        html += '      </div>';
        html += '    </div>';
      }
    } else {
      this.eastBarSize = 0;
    }

    if(this.west) {
      // west
      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;

      html += '    <div id="' + this.id + 'west" style=" position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: 0; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westSize + 'px;';
      if(this.westHidden) {
        html += ' display: none; ';
      }

      if(this.westThinBorder) {
        html += ' border-right: 1px solid #ff0000; ';
      }
      html += '" >';
      html += this.west.getHTML();
      html += '    </div>';

      // west resize bar
      if(this.westBorder) {
        html += '    <div id="' + this.id + 'westbar"  style="position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: ' + this.westSize + 'px; top: ' + top + 'px; bottom: ' + bottom + 'px; width: ' + this.westBarSize + 'px;  cursor: w-resize; cursor: col-resize; vertical-align: middle;';
        if(this.westHidden) {
          html += ' display: none ';
        }

        html += '" onmousedown="return UI.SplitPanelResizeMouseDown(event, \'west\', \'' + this.id + '\')" onselectstart="return false">';
        html += '    <div class="ui-splitpanel-westresize">';
//        html += '            <div style="width: ' + this.westBarSize + 'px; position: absolute; left: 0; right: 0; top: 0; bottom: 0"></div>';
        html += '      <div class="ui-splitpanel-verticalresizehandle"></div> ';
        html += '    </div>';
        html += '    </div>';
      }
    } else {
      this.westBarSize = 0;
    }

    if(this.center) {
      var top = this.northSize + this.northBarSize;
      var bottom = this.southSize + this.southBarSize;
      var left = this.westSize + this.westBarSize;
      var right = this.eastSize + this.eastBarSize;
      html += '    <div id="' + this.id + 'center" style="';
      
      if(!this.centerVisible) {
        html += ' display: none;';
      }
      html += 'position: absolute; overflow-x: ' + this.overflow + '; overflow-y: ' + this.overflow + '; left: ' + left + 'px; top: ' + top + 'px; right: ' + right + 'px; bottom: ' + bottom + 'px; " >';
      html += this.center.getHTML();
      html += '    </div>';
    }

    html += '</div>';

    return html;

  }
}

UI.registerComponentType("UI.SplitPanel", UI.SplitPanel);
