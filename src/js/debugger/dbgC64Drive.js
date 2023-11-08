
var DbgC64Drive = function() {
  this.machine = null;
  this.visible = true;

  this.disassembly = null;
  this.memory = null;
  this.registers = null;

  this.prefix = '';

  this.driveOn = false;
}

DbgC64Drive.prototype = {
  init: function(args) {

    this.machine = args.machine;
    this.debugger = args.debugger;
    this.prefix = args.prefix;

  },

  setVisible: function(visible) {
    this.visible = visible;
    if(visible) {
      this.forceRedraw();
    }
  },

  getVisible: function() {
    return this.visible;
  },

  buildInterface: function(parentPanel) {
    this.uiComponent = UI.create("UI.SplitPanel");
    parentPanel.add(this.uiComponent);

    this.registersPanel = UI.create("UI.Panel");

    var html = '<div>';

    html += '<div style="margin: 6px 0px 0px 20px">';
    html += 'Drive&nbsp;';
    html += '<label class="rb-container" style="margin-right: 8px">On<input type="radio" name="' + this.prefix + 'DriveOn" id="' + this.prefix + 'DriveOn" value="on"><span class="checkmark"></span> </label>';
    html += '<label class="rb-container" style="margin-right: 8px">Off<input type="radio" checked="checked" name="' + this.prefix + 'DriveOn" id="' + this.prefix + 'DriveOff" value="off"><span class="checkmark"></span> </label>';
    
    html += '</div>';
    this.driveSettingsPanel = UI.create("UI.HTMLPanel", { "html": html });

    this.topSplitPanel = UI.create("UI.SplitPanel");
    this.uiComponent.addNorth(this.topSplitPanel, 74, false);

    this.topSplitPanel.addNorth(this.driveSettingsPanel, 40, false);
    this.topSplitPanel.add(this.registersPanel);

    this.disassemblyPanel = UI.create("UI.Panel");
    this.uiComponent.add(this.disassemblyPanel);




    this.memoryPanel = UI.create("UI.Panel");
    this.uiComponent.addSouth(this.memoryPanel, 200);

    this.registers = new DbgRegisters();
    this.registers.init({ 
      "canWrite": false,
      "showRasterPosition": false,
      "prefix": this.prefix + "Drive",
      "debugger": this, 
      "machine": this.machine });
    this.registers.buildInterface(this.registersPanel);


    this.disassembly = new DbgDisassembly();
    this.disassembly.init({ 
      "canWrite": false,
      "prefix": this.prefix + "Drive",
      "debugger": this, 
      "machine": this.machine });
    this.disassembly.buildInterface(this.disassemblyPanel);


    this.memory = new DbgMemory();
    this.memory.init({
      "debugger": this, 
      "machine": this.machine,
      "prefix": this.prefix + "Drive",
      "maxAddress": 0x800

    });
    this.memory.buildInterface(this.memoryPanel);


    var _this = this;
    UI.on('ready', function() {
      _this.initContent();
      _this.initEvents();
    });
  },

  /*
  resizeCanvas: function() {
    this.context = this.scrollCanvas.getContext();
    this.context.imageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.oImageSmoothingEnabled = false;
  },
*/
  /*** DEBUGGER FUNCTIONS  ****/
/*
  var c1541_getStatus = c64.cwrap('c1541_getStatus', 'number');
var c1541_getPosition = c64.cwrap('c1541_getPosition', 'number');
var c1541_cpuRead = c64.cwrap('c1541_cpuRead', 'number', ['number']);
var c1541_getPC = c64.cwrap('c1541_getPC', 'number');
*/
  blurMachine: function() {
    this.debugger.blurMachine();

  },

  focusMachine: function() {
    this.debugger.focusMachine();
  },

  getPC: function() {
    return c1541_getPC();
  },



  // move these to cpu????
  getRegA: function() {
    return c1541_getRegA();
  },

  getRegX: function() {
    return c1541_getRegX();
  },

  getRegY: function() {
    return c1541_getRegY();    
  },

  getRegSP: function() {
    return c1541_getSP();
  },
  getPC: function() {
    return c1541_getPC();
  },


  getFlagN: function() {
    return c1541_getFlagN();
  },


  getFlagV: function() {
    return c1541_getFlagV();
  },
  getFlagB: function() {
    return c1541_getFlagB();
  },

  getFlagD: function() {
    return c1541_getFlagD();
  },

  getFlagI: function() {
    return c1541_getFlagI();
  },

 
  getFlagZ: function() {
    return c1541_getFlagZ();
  },
  
  getFlagC: function() {
    return c1541_getFlagC();
  },

  getVC: function() {
    return 0;
  },

  getRstY: function() {
    return 0;
  },
  

  getPCBreakpoints: function() {
    return [];
  },


  readByte: function(address) {
    return c1541_cpuRead(address);
  },

  writeByte: function(address, value) {

  },

  getCycleCount: function(address) {
    return 0;
  },

  isRunning: function() {

  },


  
  /********************  END DEBUGGER FUNCTIONS  ************************/



  resize: function () {
    this.forceRedraw();

  },

  initContent: function() {

  },


  initEvents: function() {
    var _this = this;

    $('input[name=' + this.prefix + 'DriveOn]').on('click', function() {
      var value = $('input[name=' + _this.prefix + 'DriveOn]:checked').val();
      if(value == 'on') { 
        c1541_setEnabled(true);
      } else {
        c1541_setEnabled(false);
        
      }
    });

  },


  forceRedraw:function() {
    this.disassembly.forceRedraw();
    this.memory.forceRedraw();
//    this.registers.forceRedraw();
  },


  draw: function(context) {


  },

  update: function() {

    var status = c1541_getStatus();
    if(status == 0) {
      if(this.driveOn) {
        this.driveOn = false;
        $('#' + this.prefix + 'DriveOff').prop('checked', true);
      }
    } else {
      if(!this.driveOn) {
        this.driveOn = true;
        $('#' + this.prefix + 'DriveOn').prop('checked', true);
      }
    }

    this.disassembly.update();
    this.memory.update();
    this.registers.update();
/*
    if(this.visible) {
      this.scrollCanvas.render();
    }


    this.charEditor.draw();
*/    
  }
}
