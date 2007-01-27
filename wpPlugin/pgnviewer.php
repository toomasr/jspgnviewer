<?php
/*
Plugin Name: pgnviewer
Plugin URI: http://tom.jabber.ee/chess
Description: Allows to add PGN files to your blog posts that are converted to interactive boards. Easy to share your chess games with your friends.
Version: 0.1
Author: Toomas Römer
Author URI: http://tom.jabber.ee 
*/

/*  Copyright 2006  Toomas Römer  (email : toomasr@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

function tr_pgnview_callback($str) {
	$siteurl = get_option("siteurl");
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
	$rtrn .= '<script>var brd = new Board('.$now.',{"imagePrefix":"'.
				$siteurl.'/wp-content/pgnviewer/img/"});brd.init()</script>';
	$rtrn .= '<noscript>You have JavaScript disabled and you are not seeing a graphical interactive chessboard!</noscript>';

	return $rtrn;
}

function tr_add_script_tags($_) {
	$siteurl = get_option("siteurl");
	echo "<script src='${siteurl}/wp-content/plugins/pgnviewer/jsPgnViewer.js'></script>\n";
}

function tr_pgnview($content) {
	return preg_replace_callback('/<pgn>((.|\n|\r)*?)<\/pgn>/', "tr_pgnview_callback", $content);
}


add_filter('the_content', 'tr_pgnview');
add_action('wp_head', 'tr_add_script_tags');
?>
