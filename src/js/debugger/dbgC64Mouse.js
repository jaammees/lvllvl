var DbgC64Mouse = function() {
  this.prefix = 'dbg';
  this.visible = false;
  this.mouseX = false;
  this.mouseY = false;
}

DbgC64Mouse.prototype = {
  init: function(args) {
    if(typeof args.prefix) {
      this.prefix = args.prefix;
    }
  }
}