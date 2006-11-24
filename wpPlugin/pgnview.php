<?php
/*
Plugin Name: pgnview
Plugin URI: http://tom.jabber.ee/chess
Description: Allows to post PGN that are converted to interactive boards.
Version: 0.1
Author: Toomas Römer
Author URI: http://tom.jabber.ee 
*/

/**
 * Copyright 2006 Toomas Römer
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

function tr_pgnview_callback($str) {
	// wow, i had a millisecond collision :)
	// this should sort it out
	$now = time()+mt_rand();
	// tinyMCE might have added <br /> and other tags
	$str = strip_tags($str[0]);
	// strip entities
	$str = str_replace(array('&#8220;', '&#8221;', '&#8243;'), '"', $str);
	// hidden div with the game information
	$rtrn = '<div id="'.$now.'" style="visibility:hidden;display:none">'.$str."</div>\n";
	// the div that will contain the graphical board
	$rtrn .= '<div id="'.$now.'_board"></div>';
	// initialize the board
	$rtrn .= '<script>var brd = new Board('.$now.',"wp-content/img/");brd.init()</script>';

	return $rtrn;
}

function tr_add_script_tags($_) {
	echo "<script src='wp-content/plugins/pgnview/jsPgnViewer.js'></script>\n";
}

function tr_pgnview($content) {
	return preg_replace_callback('/<pgn>((.|\n|\r)*?)<\/pgn>/', "tr_pgnview_callback", $content);
}


add_filter('the_content', 'tr_pgnview');
add_action('wp_head', 'tr_add_script_tags');
?>
