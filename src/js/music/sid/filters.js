var SidFilters = function() {
  this.music = null;
  this.currentFilter = 1;

  this.defaultColors = [
    0xffebcd,
    0x0000ff,
    0x8a2be2,
    0xa52a2a,
    0xdeb887,
    0x5f9ea0,
    0x7fff00,
    0xd2691e,
    0xff7f50,
    0x6495ed,
    0xfff8dc,
    0xdc143c,
    0x00ffff,
    0x00008b,
    0x008b8b,
    0xb8860b,
    0xa9a9a9,
    0x006400,
    0xbdb76b,
    0x8b008b,
    0x556b2f,
    0xff8c00,
    0x9932cc,
    0x8b0000,
    0xe9967a,
    0x8fbc8f,
    0x483d8b,
    0x2f4f4f,
    0x00ced1,
    0x9400d3,
    0xff1493,
    0x00bfff,
    0x696969,
    0x1e90ff,
    0xb22222,
    0xfffaf0,
    0x228b22,
    0xff00ff,
    0xdcdcdc,
    0xf8f8ff,
    0xffd700,
    0xdaa520,
    0x808080,
    0x008000,
    0xadff2f,
    0xf0fff0,
    0xff69b4,
    0xcd5c5c,
    0x4b0082,
    0xfffff0,
    0xf0e68c,
    0xe6e6fa,
    0xf0f8ff,
    0xfaebd7,
    0x00ffff,
    0x7fffd4,
    0xf0ffff,
    0xf5f5dc,
    0xffe4c4,


  ];


}

SidFilters.prototype = {


  init: function(music) {
    this.music = music;
  },


  buildInterface: function(parentPanel) {
//    var html = '<div id="filtersHolder" style="background-color: white;overflow-y: auto; overflow-x: hidden" class="panelFill"></div>';
    var html = '<div id="sidFilters" class="panelFill" style="background-color: #444444;">';

    html += ' <h4 style="margin-left: 10px; margin-bottom: 4px; margin-top: 6px">Filters</h4>';
    html += '  <div style="background-color: #333333; margin: 10px; position: absolute; top: 14px; bottom: 24px; left:0; right: 0; overflow-y: auto; overflow-x: hidden" id="filtersHolder">';
    html += '  </div>';
    html += '  <div style="" class="instrumentButtons">';
    html += '    <button type="button" id="editFilterButton">Edit</button>';
    html += '    <button type="button" id="addFilterButton">Add</button>';
    html += '    <button type="button" id="duplicateFilterButton">Duplicate</button>';
    html += '    <button type="button" id="deleteFilterButton">Delete</button>';
    html += '  </div>';
    html += '</div>';

    this.uiComponent = UI.create("UI.HTMLPanel", { "html": html});
    parentPanel.add(this.uiComponent);

    this.initEvents();

  },

  initEvents: function() {
    var filters = this;
    $('#editFilterButton').on('click', function() {
      filters.music.setView('editFilter');
      filters.music.editFilter.editFilter(filters.currentFilter);
    });



    $('#addFilterButton').on('click', function() {
      filters.music.setView('editFilter');
      filters.music.editFilter.newFilter();
    });

    $('#deleteFilterButton').on('click', function() {
      filters.deleteFilter(parseInt(filters.currentFilter));

    });

    $('#duplicateFilterButton').on('click', function() {
      filters.duplicateFilter(parseInt(filters.currentFilter));
    });

  },

  getJSON: function() {
    /*
    return JSON.stringify(this.filters, function(key, value) {
      if(key == 'material') {
        return undefined;
      }
      return value;
    });
  */
  },

  clearFilters: function() {
    this.music.doc.data.filters = [];
  },


  selectFilter: function(filterId) {

    this.currentFilter = filterId;
    $('.filter').removeClass('selectedFilter');
    var currentID = 'filter' + this.currentFilter;
    $('#' + currentID).addClass('selectedFilter');

//    if(this.music && this.music.sidPlayer) {  
//      this.music.sidPlayer.testInstrumentStart(36, 5, this.instruments[this.currentInstrument]);
//    }

  },


  createMinimalFilters: function() {

    this.music.doc.data.filters.push({
      name: "Filter 0",
      filtertable: [

      ]
    });

    this.music.doc.data.filters.push({
      name: "Lowpass Sweep Up",
      type: "advanced",
      filtertable: [
        [0x90, 0xf7],
        [0x00, 0x00],
        [0x01, 0x01],
        [0x02, 0x00],
        [0xff, 0x03]
      ]
    });

    this.updateFilters();
  },


  createDefaultFilters: function() {

    this.music.doc.data.filters = [];    

    this.music.doc.data.filters.push({
      name: "Filter 0",
      filtertable: [

      ]
    });

    this.music.doc.data.filters.push({
      name: "Lowpass Sweep Up",
      type: "basic",

      filtertable: [
        [0x90, 0xf7],
        [0x00, 0x00],
        [0x01, 0x01],
        [0x02, 0x00],
        [0xff, 0x03]
      ],

      basicFilterType: 0x10,
      basicFilterResonance: 0xf,
      basicFilterChannels: 0x7,
      basicCutoff: 0x40,
      basicModulationDirection: 'up',
      basicModulationTime: 1,
      basicModulationSpeed: 1,
      basicModulationRepeat: 1

    });

    this.music.doc.data.filters.push({
      name: "Bandpass Sweep Up/Down",
      type: "advanced",

      filtertable: [
        [0xa0, 0xf7],
        [0x00, 0x00],
        [0x18, 0x01],
        [0x18, 0xff],
        [0xff, 0x03]
      ]
    });

    this.music.doc.data.filters.push({
      name: "Highpass Sweep Down",
      type: "advanced",

      filtertable: [
        [0xc0, 0xf7],
        [0x00, 0x64],
        [0x01, 0xff],
        [0x03, 0x00],
        [0xff, 0x03]
      ]

    });


    this.music.doc.data.filters.push({
      name: "Tremolo",
      type: "advanced",

      filtertable: [
        [0x90, 0xf7],
        [0x00, 0xff],
        [0x05, 0x00],
        [0x00, 0x0],
        [0x05, 0x00],
        [0xff, 0x02]
      ],

      basicFilterType: 0x10,
      basicFilterResonance: 0xf,
      basicFilterChannels: 0x7,
      basicCutoff: 0x40,
      basicModulationDirection: 'up',
      basicModulationTime: 1,
      basicModulationSpeed: 1,
      basicModulationRepeat: 1

    });



    this.updateFilters();
  },
  updateFilterHTML: function() {
    var filters = this;

    var html = '';

    // instrument 0 is not selectable
    for(var i = 1; i < this.music.doc.data.filters.length; i++) {
      var id = i;
      html += '<div class="filter" id="filter' + id + '">';

      var color = "#" + ((1 << 24) + this.music.doc.data.filters[i].color).toString(16).slice(1);
      html += '<div style="margin-top: 2px; margin-right: 4px; display: inline-block; width: 12px; height: 12px; background-color: ' + color + '"></div>';
      html += '<span style="margin-bottom: 2px" id="filterName' + id + '">';
      html += this.music.doc.data.filters[i].name;
      html += '</span>';
      html += '</div>';

    }

    //html = '<div style="height: 600px">' + html + '</div>';
    $('#filtersHolder').html(html);

    $('.filter').on('click', function() {
      var id = $(this).attr('id');
      id = id.replace('filter', '');
      filters.selectFilter(id);

    });

    this.selectFilter(1);
  },



  duplicateFilter: function(filterId) {
    var filter = {};
    for(var key in this.music.doc.data.filters[filterId]) {
      if(key == 'filtertable') {
        filter[key] = [];
        for(var i = 0; i < this.music.doc.data.filters[filterId][key].length; i++) {
          filter[key].push([ this.music.doc.data.filters[filterId][key][i][0],
                                this.music.doc.data.filters[filterId][key][i][1] ]);
        }
      } else {
        filter[key] = this.music.doc.data.filters[filterId][key];
      }
    }

    var newfilterId = filterId + 1;

    filter.name += " Copy";
    this.music.doc.data.filters.splice(newfilterId, 0, filter);


    for(var i = 0; i < this.music.patterns.length; i++) {
      this.music.patterns[i].shiftFiltersAbove(filterId, 1);
    }


    this.updateFilters();
    this.music.sidPlayer.testInstrumentSetup();
    this.music.updateSid(true);

    this.music.patternView.drawPattern();
    this.selectFilter(newfilterId, false);
  },

  deleteFilter: function(filterId) {


    var filterInUse = false;
    // check if filter is in use
    for(var i = 0; i < this.music.patterns.length; i++) {
      if(this.music.patterns[i].usesFilter(filterId)) {
        filterInUse = true;
      }
    }

    if(filterInUse) {
      if(!confirm("This filter is being used, are you sure you want to delete it?")){
        return;
      }

      for(var i = 0; i < this.music.patterns.length; i++) {
        this.music.patterns[i].removeFilter(filterId);
      }

    }

    this.music.doc.data.filters.splice(filterId, 1);

    for(var i = 0; i < this.music.patterns.length; i++) {
      this.music.patterns[i].shiftFiltersAbove(filterId);
    }

    if(this.music.doc.data.filters.length == 1) {
      // uh oh, no instruments left
      this.music.doc.data.filters = [];
      this.createMinimalFilters();
    }

    this.updateFilters();
    this.music.sidPlayer.testInstrumentSetup();
    this.music.updateSid(true);

    this.music.patternView.drawPattern();
    this.music.patternView.updatePattern();


  },

  updateFilters: function() {
    this.updateFilterHTML();

  }
}