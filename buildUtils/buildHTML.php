<?php

require_once('htmlMinifier.php');

global $htmlCache;

$htmlCache = '';
$htmlCache .= "g_htmlCache = {};\n";

function addHTML($file) {
  global $htmlCache;

  $path = SRCDIR . '/html/' . $file;

  $html = file_get_contents($path);


  $minifier = new TinyHtmlMinifier([]);

  $html = $minifier->minify($html);
  $htmlCache .= 'g_htmlCache["html/' . $file . '"] = \'';
  $htmlCache .= str_replace("'", "\\'", $html);
  $htmlCache .= "';\n";

}

function processHTML($directory) {
  $dir = opendir(SRCDIR . '/html/' . $directory); 
  if(!$dir) {
    return;
  }

  $files = [];
  $directories = [];


  while(false !== ( $file = readdir($dir)) ) { 
    

    if (( $file != '.' ) && ( $file != '..' )) { 
      if($directory != '') {
        $file = $directory . '/' . $file;
      }
      if ( is_dir(SRCDIR . '/html/' . $file) ) {
        $directories[] = $file;
      } else { 
        $files[] = $file;
      } 
    } 
  } 
  closedir($dir); 

  foreach($files as $file) {
    addHTML($file);
  }

//  print_r($directories);
  foreach($directories as $d) {
    processHTML($d);
  }
}

processHTML('');

//print $htmlCache;

$fp = fopen(BUILDDIR . '/js/html/htmlcache.js', 'w');
fwrite($fp, $htmlCache);
fclose($fp);