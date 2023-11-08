<?php

function buildC64Page() {
  print "BUILD C64 PAGE!!!!!\n";
  $index = file_get_contents(SRCDIR . "/c64page/index.html");

  $searchString = 'src="js/';
  $pos = strpos($index, $searchString);
  
  $source = "";
  
  while($pos !== false) {
    $pos += strlen($searchString);
  
    $endPos = strpos($index, '"', $pos);
    $pos -= 3;
    $filepath = SRCDIR . '/c64page/' . substr($index, $pos, $endPos - $pos);
    $include = true;

    if($include) {
      $qpos = strpos($filepath, "?");
      if($qpos !== false) {
        $filepath = substr($filepath, 0, $qpos);
      }
      print $filepath . "\n";
  
      if(file_exists($filepath)) {
        $source .= file_get_contents($filepath) . "\n\n";
  
      } else {
        print "FILE NOT FOUND $filepath";
        exit();
      }
    }
    $pos = strpos($index, $searchString, $pos);
  }

  $source = str_replace("c64.wasm", "c64.wasm?v=" . VERSION, $source);

  $fp = fopen(BUILDDIR . "/c64page/js/c64.js", "w");
  fwrite($fp, $source);
  fclose($fp);
  
  $cmd = "uglifyjs " . BUILDDIR . "/c64page/js/c64.js --mangle --output " . BUILDDIR . "/c64page/js/c64.min.js";

  exec($cmd);

  
}