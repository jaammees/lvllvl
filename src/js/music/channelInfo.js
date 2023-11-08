var ChannelInfo = function() {

  this.camera = null;
  this.scene = null;

  this.holder = null;

  this.sampleCount = 800;
  this.track1 = null;


  this.channel = 0;
  this.prefix = 'sidCh';

  this.showControlRegister = true;
  this.showFilter = true;

  this.adsrColor = '#f8a998';
  this.pulseWidthColor = '#98c2a9';
}

ChannelInfo.prototype = {

  getHTML: function() {
    var html = '';

    if(this.showControlRegister) {
      html += '<span id="' + this.prefix + this.channel + 'gate" class="sidChannelInfo" style="">';
      html += 'GATE';
      html += '</span>';

      html += '<span id="' + this.prefix + this.channel + 'adsr" class="sidChannelInfo" style="display: inline-block; text-align: right; width: 22px">';
      html += '';
      html += '</span>';


      html += '<span id="' + this.prefix  + this.channel + 'sync" class="sidChannelInfo" style="">';
      html += 'SYNC';
      html += '</span>';

      html += '<span id="' + this.prefix  + this.channel + 'ring" class="sidChannelInfo" style="">';
      html += 'RING';
      html += '</span>';

      html += '<span id="' + this.prefix  + this.channel + 'test" class="sidChannelInfo" style="">';
      html += 'TEST';
      html += '</span>';

      html += '<span class="sidChannelInfoSpace"></span>';

      html += '<span id="' + this.prefix  + this.channel + 'triangle" class="sidChannelInfo" style="">';
      html += 'TRIANGLE';
      html += '</span>';
      html += '<span id="' + this.prefix  + this.channel + 'sawtooth" class="sidChannelInfo" style="">';
      html += 'SAWTOOTH';
      html += '</span>';
      html += '<span id="' + this.prefix  + this.channel + 'pulse" class="sidChannelInfo" style="margin-right: 0">';
      html += 'PULSE';
      html += '</span>';

      html += '<span id="' + this.prefix  + this.channel + 'pw" class="sidChannelInfo" style="margin-left: 0; display: inline-block; text-align: right;width: 26px">';
      html += '';
      html += '</span>';


      html += '<span id="' + this.prefix  + this.channel + 'noise" class="sidChannelInfo" style="">';
      html += 'NOISE';
      html += '</span>';

      html += '<span id="' + this.prefix  + this.channel + 'freq" class="sidChannelInfo" style="display: inline-block; text-align: right;width: 48px">';
      html += '';
      html += '</span>';

      html += '<span id="' + this.prefix  + this.channel + 'note" class="sidChannelInfo" style="display: inline-block; text-align: right; width: 22px">';
      html += '';
      html += '</span>';


      html += '<span class="sidChannelInfoSpace"></span>';
    }


    if(this.showFilter) {
      html += '<span id="' + this.prefix  + this.channel + 'lowpass" class="sidChannelInfo" style="">';
      html += 'LOWPASS';
      html += '</span>';
      html += '<span id="' + this.prefix  + this.channel + 'bandpass" class="sidChannelInfo" style="">';
      html += 'BANDPASS';
      html += '</span>';
      html += '<span id="' + this.prefix  + this.channel + 'highpass" class="sidChannelInfo" style="">';
      html += 'HIGHPASS';
      html += '</span>';


      if(this.showControlRegister) {
        html += '<span id="' + this.prefix  + this.channel + 'cutoff" class="sidChannelInfo" style="display: inline-block; text-align: right;width: 48px">';
        html += '';
        html += '</span>';

        html += '<span id="' + this.prefix  + this.channel + 'res" class="sidChannelInfo" style="display: inline-block; text-align: right; width: 16px">';
        html += '';
        html += '</span>';

      } else {
        html += '<span id="' + this.prefix  + this.channel + 'cutoffLabel" class="sidChannelInfo" style="">';
        html += 'CUTOFF:';
        html += '</span>';

        html += '<span id="' + this.prefix  + this.channel + 'cutoff" class="sidChannelInfo" style="display: inline-block; text-align: right;width: 32px">';
        html += '';
        html += '</span>';


        html += '<span id="' + this.prefix  + this.channel + 'resLabel" class="sidChannelInfo" style="">';
        html += 'RES:';
        html += '</span>';


        html += '<span id="' + this.prefix  + this.channel + 'res" class="sidChannelInfo" style="display: inline-block; text-align: right; width: 16px">';
        html += '';
        html += '</span>';
      }

      html += '<span class="sidChannelInfoSpace"></span>';
    }

    $('#' + this.prefix + this.channel + 'Info').html(html);
  },
/*
  setMeshUV: function(mesh, x, y, width, height) {
    var textureWidth = 512;//this.canvas.width;
    var textureHeight = 512;//this.canvas.height;

    var offsetY = (textureHeight - y - height) / textureHeight;
    var offsetX = x / textureWidth;

    var width = width / textureWidth;
    var height = height / textureHeight;

    mesh.geometry.faceVertexUvs[0][0][0].x = offsetX;
    mesh.geometry.faceVertexUvs[0][0][0].y = offsetY + height;
    mesh.geometry.faceVertexUvs[0][0][1].x = offsetX;
    mesh.geometry.faceVertexUvs[0][0][1].y = offsetY;
    mesh.geometry.faceVertexUvs[0][0][2].x = offsetX + width;
    mesh.geometry.faceVertexUvs[0][0][2].y = offsetY + height;

    mesh.geometry.faceVertexUvs[0][1][0].x = offsetX;
    mesh.geometry.faceVertexUvs[0][1][0].y = offsetY;
    mesh.geometry.faceVertexUvs[0][1][1].x = offsetX + width;
    mesh.geometry.faceVertexUvs[0][1][1].y = offsetY;
    mesh.geometry.faceVertexUvs[0][1][2].x = offsetX + width;
    mesh.geometry.faceVertexUvs[0][1][2].y = offsetY + height;

    mesh.geometry.uvsNeedUpdate = true;

  },

*/
  init: function(music, args) {
    if(typeof args.prefix != 'undefined') {
      this.prefix = args.prefix;
    }

    if(typeof args.showControlRegister != 'undefined') {
      this.showControlRegister = args.showControlRegister;
    }

    this.music = music;
    this.channel = args.channel;


    var near = 1;
    var far = 1000;
    var width = 40;
    var height = 40;
    this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

    this.camera.position.z = 100;

    this.getHTML();


    this.scene = new THREE.Scene();  
    this.holder = new THREE.Object3D();
    this.scene.add(this.holder);




  },

  updateInfo: function(args) {
    if(args.waveform & 0x01) {
      $('#' + this.prefix + this.channel + 'gate').css('background-color', "#ffffff");
      $('#' + this.prefix + this.channel + 'adsr').css('background-color', this.adsrColor);
    } else {
      $('#' + this.prefix + this.channel + 'gate').css('background-color', "#444444");
      $('#' + this.prefix + this.channel + 'adsr').css('background-color', "#444444");
    }

    if(args.waveform & 0x02) {
      $('#' + this.prefix + this.channel + 'sync').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'sync').css('background-color', "#444444");
    }

    if(args.waveform & 0x04) {
      $('#' + this.prefix + this.channel + 'ring').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'ring').css('background-color', "#444444");

    }

    if(args.waveform & 0x08) {
      $('#' + this.prefix + this.channel + 'test').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'test').css('background-color', "#444444");
    }


    if(args.waveform & 0x10) {
      $('#' + this.prefix + this.channel + 'triangle').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'triangle').css('background-color', "#444444");
    }

    if(args.waveform & 0x20) {
      $('#' + this.prefix + this.channel + 'sawtooth').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'sawtooth').css('background-color', "#444444");
    }

    if(args.waveform & 0x40) {
      $('#' + this.prefix + this.channel + 'pulse').css('background-color', "#ffffff");
      $('#' + this.prefix + this.channel + 'pw').css('background-color', this.pulseWidthColor);
    } else {
      $('#' + this.prefix + this.channel + 'pulse').css('background-color', "#444444");
      $('#' + this.prefix + this.channel + 'pw').css('background-color', "#444444");
    }

    if(args.waveform & 0x80) {
      $('#' + this.prefix + this.channel + 'noise').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'noise').css('background-color', "#444444");
    }


    $('#' + this.prefix + this.channel + 'freq').html(args.freq);
    $('#' + this.prefix + this.channel + 'note').html(args.note);

    if(args.filterActive && ((args.filter & 0x10) >> 4) ) {
      $('#' + this.prefix + this.channel + 'lowpass').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'lowpass').css('background-color', "#444444");
    }

    if(args.filterActive && ((args.filter & 0x20) >> 4) ) {
      $('#' + this.prefix + this.channel + 'bandpass').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'bandpass').css('background-color', "#444444");
    }

    if(args.filterActive && ((args.filter & 0x40) >> 4) ) {
      $('#' + this.prefix + this.channel + 'highpass').css('background-color', "#ffffff");
    } else {
      $('#' + this.prefix + this.channel + 'highpass').css('background-color', "#444444");
    }

    if(args.filterActive) {
      $('#' + this.prefix + this.channel + 'cutoff').css('background-color', "#ffffff");
      $('#' + this.prefix + this.channel + 'res').css('background-color', "#ffffff");

    } else {
      $('#' + this.prefix + this.channel + 'cutoff').css('background-color', "#444444");
      $('#' + this.prefix + this.channel + 'res').css('background-color', "#444444");

    }

    $('#' + this.prefix + this.channel + 'cutoff').html(args.cutoff);
    $('#' + this.prefix + this.channel + 'res').html(args.res);

    var adsr = ("0000" + args.adsr.toString(16) ).substr(-4);
    $('#' + this.prefix + this.channel + 'adsr').html('$' + adsr);


    $('#' + this.prefix + this.channel + 'pw').html(args.pulsewidth);

  },

  render: function(left, bottom, width, height) {
//width = this.sampleCount;//width * 4;
    this.holder.position.x = - width / 2;
//    this.holder.position.y = - height / 2;
    this.scale = 1;
    this.camera.left = -width / (2 * this.scale);
    this.camera.right = width / (2 * this.scale);
    this.camera.top = height / (2 * this.scale);
    this.camera.bottom = -height / (2 * this.scale);    
    this.camera.updateProjectionMatrix();

    renderer.render( this.scene, this.camera );    
  }
}