var g_tabIndex = 0;


UI.TabPanel = function(args) {

  this.args = args;
  this.element = null;
  this.components = new Array();
  this.currentTab = 0;
  this.tabMap = new Object();

  this.tabHistory = [];

  this.canCloseTabs = true;



  this.onTabFocus = null;
  if(args.ontabfocus) {
    this.onTabFocus = args.ontabfocus;
  }

  this.onTabBlur = null;
  if(args.ontabblur) {
    this.onTabBlur = args.ontabblur;
  }

  this.onNoTabs = null;
  if(args.onnotabs) {
    this.onNoTabs = args.onnotabs;
  }


  if(typeof args.canCloseTabs != 'undefined') {
    this.canCloseTabs = args.canCloseTabs;
  }


  this.add = function(component) {
    var key = component.title;
    if(component.hasOwnProperty('key')) {
      key = component.key;
    }

    this.components.push({ "key": key, "tabId": g_tabIndex++, "tab": component }); 
  }


  this.getTabs = function() {
    return this.components;
  }

  this.getTabHTML = function(tabIndex) {
    var tab = this.components[tabIndex];
    var html = '';
    html += '<div id="' + this.id + 'tab-' + tab.tabId + '" href="#" class="ui-tab';
    if(tab.tabId == this.currentTab) {
      html += " ui-current-tab";
    }

    if(typeof this.components[tabIndex].tab.isTemp != 'undefined') {
      if(this.components[tabIndex].tab.isTemp) {
        html += ' ui-tab-temp ';
      }

    }
    html += '"  ';

    if(typeof(this.components[tabIndex].tab.visible) != 'undefined' && !this.components[tabIndex].tab.visible) {
      html += ' style="display: none" ';
    }

    html += ' onclick="UI.TabPanelSetTab(\'' + this.id + '\', ' + tab.tabId + ')" ondblclick="UI.TabPanelDblClickTab(\'' + this.id + '\', ' + tab.tabId + ')" onmousedown="return false" onselectstart="return false" ';
    html += '>';

    html += '<div class="ui-tab-label">';
    html += this.components[tabIndex].tab.title;
    html += '</div>';

    if(this.canCloseTabs) {
      html += '<div class="ui-tab-close" onclick="UI.TabPanelCloseTab(\'' + this.id + '\', ' + tab.tabId + ')">';    
      html += '<img src="icons/svg/glyphicons-basic-599-menu-close.svg"/>';    
      html += '</div>';
    }
    html += '</div>';    

    return html;
  },

  this.addTab = function(args, setAsCurrentTab) {
    var key = args.title;
    if(typeof args.key != 'undefined') {
      key = args.key;
    }

    // check if key already exists..

    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].key === key) {

        if(this.currentTab !== this.components[i].tabId) {
          if(typeof setAsCurrentTab != 'undefined' && setAsCurrentTab) {
            this.showTab(key);
          }
        }
    

        return;
      }
    }


    var tabIndex = this.components.length;

    var tab = args;


    if(typeof tab.visible == 'undefined') {
      tab.visible = true;
    }

    if(typeof tab.enabled == 'undefined') {
      tab.enabled = true;
    }

    this.components.push({ "key": key,  "tabId": g_tabIndex++, "tab": tab });

    var headerId = this.id + '-header';
    var tabHTML = this.getTabHTML(tabIndex);

    $('#' + headerId).append(tabHTML);

    if(typeof setAsCurrentTab != 'undefined' && setAsCurrentTab) {
      this.showTab(key);
    }

    return tabIndex;
  }

  this.getCurrentTab = function() {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].tabId === this.currentTab) {
        return this.components[i].key;
      }
    }
    return false;
  }

  this.getTabCount = function() {
    return this.components.length;
  }


  this.getElement = function() {
    if(this.element == null) {
      this.element = document.createElement('div');
      this.element.setAttribute("id", this.id);
      this.element.setAttribute("class", "ui-tab-panel");
      this.element.innerHTML = this.getInnerHTML();

      var tabpanel = this;
      UI.on('ready', function() {
        tabpanel.showTab(0);
      });
  
    }
    return this.element;
  }  

  this.getInnerHTML = function() {
    var html = '';


    html += '<div class="ui-tab-header"  id="' + this.id + '-header">';
    
    for(var tabIndex = 0; tabIndex < this.components.length; tabIndex++) {
      html += this.getTabHTML(tabIndex);
    }

    html += '</div>';

    html += '<div class="ui-tab-bar"></div>';

    return html;
  }

  this.getHTML = function() {
    var html = '';

    html += '<div class="ui-tab-panel" id="' + this.id + '">';
 
    html += this.getInnerHTML();
    html += '</div>';



    var tabpanel = this;
    UI.on('ready', function() {
      tabpanel.showTab(0);
    });

    return html;

  }

  this.setTabLabel = function(tabIndex, label) {
    var id = this.id + 'tab-' + this.components[tabIndex].tabId;
    $('#' + id + ' .ui-tab-label').html(label);
  }

  this.getTabData = function(tabIndex) {
    if(tabIndex >= 0 && tabIndex < this.components.length) {
      return this.components[tabIndex].tab;
    }

    return null;
  }

  this.setTabData = function(tabIndex, data) {
    if(tabIndex < 0 || tabIndex >= this.components.length) {
      return;
    }

//    var tab = this.components[tabIndex].tab;
    for(var p in data) {
      this.components[tabIndex].tab[p] = data[p];
    } 

    if(typeof data.key != 'undefined') {
      this.components[tabIndex].key = data.key;
    }

    if(typeof data.title != 'undefined') {
      this.setTabLabel(tabIndex, data.title);
    }

    if(typeof data.isTemp != 'undefined') {
      var id = this.id + 'tab-' + this.components[tabIndex].tabId;
//      $('#' + id).html(label);
      if(data.isTemp) {
        $('#' + id).addClass('ui-tab-temp');
      } else {
        $('#' + id).removeClass('ui-tab-temp');
      }
    }
  }

  this.getTabKey = function(index) {
    if(index < 0 || index >= this.components.length) {
      return '';
    }
    return this.components[index].key;
  }
  this.getTabIndex = function(key) {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].key === key) {
        return i;
      }
    }
    return -1;
  }

  this.getTabIndexFromId = function(tabId) {
    for(var i = 0; i < this.components.length; i++) {
      if(this.components[i].tabId === tabId) {
        return i;
      }
    }
    return -1;
  }

  this.setEnabled = function(key, enabled) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return;
    }
    this.components[index].tab.enabled = enabled;

    var tabId = this.components[index].tabId;
    if(enabled) {
      $('#' + this.id + 'tab-' + tabId).removeClass('ui-tab-disabled');
      $('#' + this.id + 'tab-' + tabId).addClass('ui-tab');
    } else {
      $('#' + this.id + 'tab-' + tabId).addClass('ui-tab-disabled');
      $('#' + this.id + 'tab-' + tabId).removeClass('ui-tab');
    }
  }

  this.setTabVisible = function(key, visible) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return;
    }
    var tabId = this.components[index].tabId;
    if(visible) {
      $('#' + this.id + 'tab-' + tabId).show();
    } else {
      $('#' + this.id + 'tab-' + tabId).hide();
    }
  }

  this.getTabVisible = function(key) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return false;
    }
    var tabId = this.components[index].tabId;
    return $('#' + this.id + 'tab-' + tabId).css('display') != 'none';
  }

  this.closeTab = function(key) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return;
    }

    if(index >= this.components.length) {
      return;
    }

    if(typeof(this.components[index].tab.enabled) != 'undefined') {
      if(!this.components[index].tab.enabled) {
        return;
      }
    }

    var tabId = this.components[index].tabId;
    $('#' + this.id + 'tab-' +  + tabId).remove();

    this.components.splice(index, 1);


    var tabHistory = [];
    for(var i = 0; i < this.tabHistory.length; i++) {
      if(this.tabHistory[i] !==  tabId) {
        tabHistory.push(this.tabHistory[i]);
      }
    }

    this.tabHistory = tabHistory;
    if(this.tabHistory.length > 0) {
      var lastTabId = this.tabHistory[this.tabHistory.length - 1];
      var tabIndex = this.getTabIndexFromId(lastTabId);
      if(tabIndex !== -1) {
        var key = this.components[tabIndex].key;
        this.showTab(key);
      }
    } else {
      if(this.components.length > 0) {
        var key = this.components[0].key;
        this.showTab(key);

      } else {
        if(this.onNoTabs != null) {
          this.onNoTabs(this);
        }
        this.trigger('notabs', this);


      }
    }
  }


  this.dblClickTab = function(key) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return;
    }

    this.setTabData(index, { isTemp: false });
  }

  this.showTab = function(key) {
    var index = this.getTabIndex(key);
    if(index == -1) {
      return;
    }

    if(index >= this.components.length) {
      return;
    }

    if(typeof(this.components[index].tab.enabled) != 'undefined') {
      if(!this.components[index].tab.enabled) {
        return;
      }
    }

    var tabId = this.components[index].tabId;

    // is tab already the current tab??
    if(this.currentTab === tabId) {
      return;
    }


    if(this.onTabBlur != null) {
      if(!this.onTabBlur(this.getTabKey(this.currentTab), index, this)) {
        return false;
      }
    }

    if(this.trigger('tabblur', this.getTabKey(this.currentTab), key, this) === false) {
      return false;
    }



    this.currentTab = tabId;
    for(var tabIndex = 0; tabIndex < this.components.length; tabIndex++) {
      if(index == tabIndex) {
        $('#' + this.id + 'tab-' + this.components[tabIndex].tabId).addClass('ui-current-tab');
        $('#' + this.id + 'tabcontent' + tabIndex).show();
        if(this.components[tabIndex].tab.layout) {
          this.components[tabIndex].tab.layout();
        }
      } else {
        $('#' + this.id + 'tab-' + this.components[tabIndex].tabId).removeClass('ui-current-tab');
        $('#' + this.id + 'tabcontent' + tabIndex).hide();
      }
    }

    if(this.onTabFocus) {
      this.onTabFocus(index, this);
    }
    this.trigger('tabfocus', key, this);

    this.tabHistory.push(tabId);

  }

}

UI.TabPanelCloseTab = function(id, tabId) {
  var tabPanel = UI.components[id];

  var tabIndex = false;
  for(var i = 0; i < tabPanel.components.length; i++) {
    if(tabPanel.components[i].tabId === tabId) {
      tabIndex = i;
      break;
    }
  }


  if(tabIndex < tabPanel.components.length) {
    var tabKey = tabPanel.components[tabIndex].key;
    tabPanel.closeTab(tabKey);
  }

}

UI.TabPanelSetTab = function(id, tabId) {
  var tabPanel = UI.components[id];

  var tabIndex = false;
  for(var i = 0; i < tabPanel.components.length; i++) {
    if(tabPanel.components[i].tabId === tabId) {
      tabIndex = i;
      break;
    }
  }

  if(tabIndex === false) {
    return;
  }
  if(tabIndex < tabPanel.components.length) {
    var tabKey = tabPanel.components[tabIndex].key;
    tabPanel.showTab(tabKey);
  }
}



UI.TabPanelDblClickTab = function(id, tabId) {
  var tabPanel = UI.components[id];

  var tabIndex = false;
  for(var i = 0; i < tabPanel.components.length; i++) {
    if(tabPanel.components[i].tabId === tabId) {
      tabIndex = i;
      break;
    }
  }

  if(tabIndex === false) {
    return;
  }
  if(tabIndex < tabPanel.components.length) {
    var tabKey = tabPanel.components[tabIndex].key;
    tabPanel.dblClickTab(tabKey);
  }
}


UI.registerComponentType("UI.TabPanel", UI.TabPanel);

