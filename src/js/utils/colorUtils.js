var ColorUtils = {};

ColorUtils.hexStringToInt = function(v) {
  if(v.length == 0) {
    return 0;
  }

  if(v[0] == '#') {
    v = v.substring(1);
  }

  return parseInt(v, 16);
}

ColorUtils.intToHexString = function(v) {
  return ("000000" + v.toString(16)).substr(-6);      

}