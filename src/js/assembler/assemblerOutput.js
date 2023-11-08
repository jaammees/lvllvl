function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


var AssemblerOutput = function() {
  this.lines = [];

  this.prefix = '';
}


AssemblerOutput.prototype = {
  init: function(editor, prefix) {
    this.editor = editor;
    if(typeof prefix != 'undefined') {
      this.prefix = prefix;
    }
  },

  buildInterface: function(parentPanel) {
    var _this = this;

    this.uiComponent = UI.create("UI.SplitPanel", { "id": this.prefix + "assemblerOutputSplitPanel"});
    parentPanel.add(this.uiComponent);


    this.tabPanel = UI.create("UI.TabPanel", { canCloseTabs: false });
    this.tabPanel.addTab({ key: 'result',   title: 'Result', isTemp: false }, true);
    this.tabPanel.addTab({ key: 'output',   title: 'Output', isTemp: false }, false);

    this.tabPanel.on('tabfocus', function(key, tabPanel) {      
      var tabIndex = _this.tabPanel.getTabIndex(key);
      if(tabIndex >= 0) {
        _this.showOutputContent(key);
      }
    });


    this.uiComponent.addNorth(this.tabPanel, 30, false);

    this.contentPanel = UI.create("UI.Panel", { "id": this.prefix + "assemblerOutputContent" });
    this.uiComponent.add(this.contentPanel);

    var html = '';
    html += '<div class="panelFill" id="' + this.prefix + 'buildOutputPanel" style="background-color: #111111; color: #cccccc; overflow: auto"></div>';
    this.resultPanel = UI.create("UI.HTMLPanel", { "html": html, "id": this.prefix + "assemblerResultPanel" });
    this.contentPanel.add(this.resultPanel);

    html = '';
    html += '<div class="panelFill" id="' + this.prefix + 'assemblerOutputPanel" style="background-color: #111111; color: #cccccc; overflow: auto"></div>';
    this.outputPanel = UI.create("UI.HTMLPanel", { "html": html, "id": this.prefix + "assemblerOutputPanel" });
    this.contentPanel.add(this.outputPanel);


    var _this = this;
    UI.on('ready', function() {
      _this.initEvents();
      _this.showOutputContent('result');
    });
  },

  showOutputContent: function(panel) {
    switch(panel) {
      case 'result':
        this.contentPanel.showOnly(this.prefix + 'assemblerResultPanel');
        break;
      case 'output':
        this.contentPanel.showOnly(this.prefix + 'assemblerOutputPanel');
        break;
    }
  },

  initEvents: function() {
    var _this = this;
    $('#' + this.prefix + 'buildOutputPanel').on('click', '.assemblerOutputLine', function() {
      
      var dataLineId = $(this).attr('data-line-id');
      _this.selectLine(dataLineId);
    });
  },

  clear: function() {
    this.lines = [];
    $('#' + this.prefix + 'buildOutputPanel').html('');
    this.editor.codeEditor.clearAnnotations();
  },

  // maybe should be add error instead of add output line?
  addOutputLine: function(args) {
    var line = {};
    line.text = args.text;
    line.file = '';
    if(typeof args.file != 'undefined') {
      line.file = args.file;
    }
    line.lineNumber = false;
    if(typeof args.lineNumber != 'undefined') {
      line.lineNumber = args.lineNumber;
    }
    var index = this.lines.length;
    this.lines.push(line);

    if(line.text.indexOf(': Error') !== -1) {

      if('/asm/' + line.file == this.editor.path) {
        this.editor.codeEditor.addAnnotation({
          row: line.lineNumber - 1,
          column: 0,
          text: line.text,
          type: "error" // also warning and information
        });
      }
    }
    //var lineHtml = ''
  },

  showOutput: function() {
    var outputHTML = '';
    for(var i = 0; i < this.lines.length; i++) {

      var line = this.lines[i].text;
      var isError = line.indexOf('Error') !== -1 && this.lines[i].lineNumber !== false;


      outputHTML += '<div class="assemblerOutputLine';

      if(isError) {
        outputHTML += ' error ';
      }
      
      outputHTML += '" id="assemblerOutputLine' + i + '" data-line-id="' + i + '">';

      if(isError) {
        outputHTML += '<div class="assemblerOutputErrorIcon" ><img src="icons/svg/glyphicons-basic-599-menu-close.svg"></div>';
      }
      outputHTML += this.lines[i].text;
      outputHTML += '</div>';
    }
    var _this = this;
    $('#' + this.prefix + 'buildOutputPanel').html(outputHTML);
  },

  addAnnotationsToEditor: function() {
    for(var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i];
      if(line.file != '' && line.lineNumber !== false) {
        var file = '/asm/' + line.file;
        if(file == this.editor.path) {
          // line is about the current file
          this.editor.codeEditor.addAnnotation({
            row: line.lineNumber - 1,
            column: 0,
            text: line.text,
            type: "error" // also warning and information
          });
        }
      }
  
    }

  },

  setReport: function(report) {
    $('#' + this.prefix + 'assemblerOutputPanel').html('<pre>' + htmlEntities(report) + '</pre>');
  },

  selectLine: function(lineIndex) {
    if(lineIndex >= this.lines.length) {
      return;
    }
/*
    $('.assemblerOutputLine').css('background-color', 'white');
    $('.assemblerOutputLine').css('color', '#000000');
    $('#assemblerOutputLine' + lineIndex).css('background-color', '#4586dd');
    $('#assemblerOutputLine' + lineIndex).css('color', '#ffffff');
    */

    $('.assemblerOutputLine').removeClass('selected');
    $('#assemblerOutputLine' + lineIndex).addClass('selected');
    var line = this.lines[lineIndex];


    if(line.file != '' && line.lineNumber !== false) {
      var file = '/asm/' + line.file;

      if(this.prefix != 'c64debugger') {
        g_app.projectNavigator.showDocRecord(file);
      }
      this.editor.showFile(file, line.lineNumber);

      this.editor.codeEditor.addAnnotation({
        row: line.lineNumber - 1,
        column: 0,
        text: line.text,
        type: "error" // also warning and information
      });


    }
  }

}