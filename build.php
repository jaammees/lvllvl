<?php

define('SRCDIR','src');
define('BUILDDIR','dist');
define('VERSION',"0.494");


if(!file_exists(BUILDDIR . '/js')) {
  print "making build dir!!!!!!\n";
  mkdir(BUILDDIR . '/js');
}

if(!file_exists(BUILDDIR . '/js/html')) {
  mkdir(BUILDDIR . '/js/html');
}

if(!file_exists(BUILDDIR . '/css')) {
  mkdir(BUILDDIR . '/css');
}


if(!file_exists(BUILDDIR . '/c64')) {
  mkdir(BUILDDIR . '/c64');
}

if(!file_exists(BUILDDIR . '/c64/wasm')) {
  mkdir(BUILDDIR . '/c64/wasm');
}

if(!file_exists(BUILDDIR . '/js/c64')) {
  mkdir(BUILDDIR . '/js/c64');
}

if(!file_exists(BUILDDIR . '/js/c64/wasm')) {
  mkdir(BUILDDIR . '/js/c64/wasm');
}

if(!file_exists(BUILDDIR . '/c64page')) {
  mkdir(BUILDDIR . '/c64page');
}

if(!file_exists(BUILDDIR . '/c64page/js')) {
  mkdir(BUILDDIR . '/c64page/js');
}

include_once("buildUtils/buildUtils.php");
include_once("buildUtils/buildReplacements.php");
include_once("buildUtils/buildC64Page.php");

include_once("buildUtils/buildHTML.php");


$GLOBALS["VARIABLEMAP"] = [];


// concatenate all the js files included with dev.html, 
// except ones that uglify cant handle
$index = file_get_contents(SRCDIR . "/index.html");

$exclude = [ "js/c64/wasm/c64.js", "js/nes/wasm/nes.js","js/nes/nes.js",  "js/c64/c64.js",  "acmeAssembler", "ca65Assembler", "storageManager.js",  "githubClient.js" ];

$searchString = 'src="js/';
$pos = strpos($index, $searchString);

$source = "";

while($pos !== false) {
  $pos += strlen($searchString);

  $endPos = strpos($index, '"', $pos);
  $pos -= 3;
  $filepath = SRCDIR . '/' . substr($index, $pos, $endPos - $pos);
  $include = true;
  foreach($exclude as $ex) {
    if(strpos($filepath, $ex) !== false) {
      $include = false;
    }
  }
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
  } else {
    print "exclude $filepath!!!!!!!!\n";
  }
  $pos = strpos($index, $searchString, $pos);
}



buildC64Page();

$source = str_replace("{v}", VERSION, $source);

$source = replaceConstants($source, "buildUtils/constants.js");
$source = replaceVariables($source, $buildReplacements);

if(!file_exists(BUILDDIR . '/js')) {
  mkdir(BUILDDIR . '/js');
}

$fp = fopen(BUILDDIR . "/js/main.js", "w");
fwrite($fp, $source);
fclose($fp);

$cmd = "uglifyjs " . BUILDDIR . "/js/main.js --mangle --output " . BUILDDIR . "/js/main.js";

exec($cmd);

// collect all the libs together
$searchString = 'src="lib/';
$pos = strpos($index, $searchString);

$libsource = "";


while($pos !== false) {
  $pos += strlen($searchString);

  $endPos = strpos($index, '"', $pos);
  $pos -= 4;
  $filepath = SRCDIR . '/' . substr($index, $pos, $endPos - $pos);
  $include = true;
  foreach($exclude as $ex) {
    if(strpos($filepath, $ex) !== false) {
      $include = false;
    }
  }
  if($include) {
    $qpos = strpos($filepath, "?");
    if($qpos !== false) {
      $filepath = substr($filepath, 0, $qpos);
    }
//    print $filepath . "\n";

    if(file_exists($filepath)) {
      $libsource .= file_get_contents($filepath) . "\n\n";

    } else {
      print "FILE NOT FOUND $filepath";
      exit();
    }
  }
  $pos = strpos($index, $searchString, $pos);
}
$libFp = fopen(BUILDDIR . "/js/libs.js", "w");
fwrite($libFp, $libsource);
fclose($libFp);

// collect all the css together
$searchString = 'href="css/';
$pos = strpos($index, $searchString);

$csssource = "";

$exclude = [];

while($pos !== false) {
  $pos += strlen($searchString);

  $endPos = strpos($index, '"', $pos);
  $pos -= 4;
  $filepath = SRCDIR . '/' . substr($index, $pos, $endPos - $pos);
  $include = true;
  foreach($exclude as $ex) {
    if(strpos($filepath, $ex) !== false) {
      $include = false;
    }
  }
  if($include) {
    $qpos = strpos($filepath, "?");
    if($qpos !== false) {
      $filepath = substr($filepath, 0, $qpos);
    }
    //print $filepath . "\n";

    if(file_exists($filepath)) {
      $csssource .= file_get_contents($filepath) . "\n\n";
print $filepath . "\n";
    } else {
      print "ffffFILE NOT FOUND $filepath";
      exit();
    }
  }
  $pos = strpos($index, $searchString, $pos);
}
$cssFp = fopen(BUILDDIR . "/css/style.css", "w");
fwrite($cssFp, $csssource);
fclose($cssFp);


copyWithReplace(SRCDIR . '/js/utils/storageManager.js', BUILDDIR . '/js/storageManager.js');
copyWithReplace(SRCDIR . '/js/file/githubClient.js', BUILDDIR . '/js/githubClient.js');
copy(SRCDIR . '/js/assembler/acmeAssembler.js', BUILDDIR . '/js/acmeAssembler.js');
copy(SRCDIR . '/js/assembler/ca65Assembler.js', BUILDDIR . '/js/ca65Assembler.js');

copy(SRCDIR . '/manifest.json', BUILDDIR . '/manifest.json');
//copy('index.html', 'c64/index.html');

copyIndex(SRCDIR . '/indexTemplate.html', BUILDDIR . '/index.html');
copyIndex(SRCDIR . '/indexTemplate.html', BUILDDIR . '/c64/index.html');

$c64Index = file_get_contents(BUILDDIR . '/c64/index.html');
$c64Index = str_replace('<head>', '<head>' . "\n" . '<base href="../">', $c64Index);
$c64Index = str_replace('<title>lvllvl</title>', '<title>C64</title>', $c64Index);
$c64Index = str_replace('Draw pictures using text characters', 'Commodore 64 Emulator in a Web Browser', $c64Index);
$c64Index = str_replace('https://lvllvl.com/images/logo-large.png', 'https://lvllvl.com/images/c64.png', $c64Index);
$c64Index = str_replace('https://lvllvl.com/images/logo32.png', 'https://lvllvl.com/images/c64logo32.png', $c64Index);
$c64Index = str_replace('https://lvllvl.com/images/logo16.png', 'https://lvllvl.com/images/c64logo16.png', $c64Index);

$fp = fopen(BUILDDIR . '/c64/index.html', "w");
fwrite($fp, $c64Index);
fclose($fp);
//copy('c64/index.html', '../lvllvl/public/c64/index.html');

//copyIndex('index.html', '../lvllvl/public/c64/index.html');

//print "COPY STORAGE MANAGER\n";
//copyWithReplace(SRCDIR . '/js/utils/storageManager.js', BUILDDIR . '/storageManager.js');
//print "\n\nCOPY GITHUB CLIENT\n";
//copyWithReplace(SRCDIR . '/js/file/githubClient.js', BUILDDIR . '/githubClient.js');

//copy(SRCDIR . '/js/assembler/acmeAssembler.js', BUILDDIR . '/acmeAssembler.js');
//copy(SRCDIR . '/js/assembler/ca65Assembler.js', BUILDDIR . '/ca65Assembler.js');
copy(SRCDIR . '/js/c64/c64.js', BUILDDIR . '/js/c64/c64.js');

//copy('js/nes/nes.js', BUILDDIR . '/js/nes/nes.js');

//copy('js/c64/wasm/c64.js', BUILDDIR . '/js/c64/wasm/c64.js');

/*
$source = file_get_contents(SRCDIR . '/js/nes/wasm/nes.js');
$source = str_replace("nes.wasm", "nes.wasm?v=" . $GLOBALS["VERSION"], $source);
$fp = fopen('../lvllvl/public/js/nes/wasm/nes.js', "w");
fwrite($fp, $source);
fclose($fp);  
*/


//copy('js/nes/wasm/nes.wasm', '../lvllvl/public/js/nes/wasm/nes.wasm');
//copy('js/nes/wasm/nes.wasm', 'c64page/js/nes.wasm');


//copy('js/c64/nowasm/c64.js', '../lvllvl/public/js/c64/nowasm/c64.js');
//copy('js/c64/nowasm/c64.js.mem', '../lvllvl/public/js/c64/nowasm/c64.js.mem');

//recursive_copy('build', '../lvllvl/public/build/.');
//recursive_copy(SRCDIR . '/lib', BUILDDIR . '/lib/');
//recursive_copy(SRCDIR . '/html', BUILDDIR . '/html/');

recursive_copy(SRCDIR . '/palettes', BUILDDIR . '/palettes/');
recursive_copy(SRCDIR . '/charsets', BUILDDIR . '/charsets/');
recursive_copy(SRCDIR . '/vectorsets', BUILDDIR . '/vectorsets/');
recursive_copy(SRCDIR . '/icons', BUILDDIR . '/icons/');
recursive_copy(SRCDIR . '/css', BUILDDIR . '/css/');
recursive_copy(SRCDIR . '/cursors', BUILDDIR . '/cursors/');
recursive_copy(SRCDIR . '/fonts', BUILDDIR . '/fonts/');
recursive_copy(SRCDIR . '/images', BUILDDIR . '/images/');
recursive_copy(SRCDIR . '/c64page', BUILDDIR . '/c64page/');
recursive_copy(SRCDIR . '/c64', BUILDDIR . '/c64/');

$source = file_get_contents(SRCDIR . '/c64/c64/c64.js');
$source = str_replace("c64.wasm", "c64.wasm?v=" . VERSION, $source);
$fp = fopen(BUILDDIR . '/c64/c64/c64.js', "w");
fwrite($fp, $source);
fclose($fp);  

copy(SRCDIR . '/c64/c64/c64.wasm', BUILDDIR . '/js/c64/wasm/c64.wasm');
copy(SRCDIR . '/c64/c64/c64.wasm', BUILDDIR . '/c64page/js/c64.wasm');

$src = SRCDIR . "/c64page/index.html";
$dest = BUILDDIR . "/c64page/index.html";

$source = file_get_contents($src) . "\n\n";
$source = str_replace("{v}", VERSION, $source);

$fp = fopen($dest, "w");
fwrite($fp, $source);
fclose($fp);  


print("done\n");