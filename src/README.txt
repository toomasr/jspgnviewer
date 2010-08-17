********************************************************************
*                               jsPgnViewer                        *
*                                                                  *
* Javascript PGN viewer is a cross-browser library for viewing PGN *
* files with a graphical board in your browser. It is intended to  *
* be as minimal as possible and easily configurable.               *
*                                                                  *
* The features include traversing the game back- and forward. You  *
*	can view the moves and skip to any position. Just as simple as   *
*	that.                                                            *
*                                                                  *
* Toomas Römer (toomasr[at]gmail.com)                              *
*                                                                  *
* Consult the License.txt for usage - Apache License ver 2.0       *
*                                                                  *
********************************************************************
* Site: http://www.pgnview.com
********************************************************************


You have downloaded the archive and you want to use it for your own
webpage or maybe even write a plugin for blog software?

* Extract the archive.
* Include the jsPgnViewer.js in your webpage.
* Make the img folder from the archive available somewhere in your
	project.
* To initialize the board
		o Make a hidden div with an id
			- (<div style="visibility:hidden;display:none" id="id_of_the_pgn_div></div>)
		o Paste a PGN into the div
		o Make another div where ever you want the board to appear.
		o The div's id has to have the suffix _board. In the current example it
			should be id_of_the_pgn_div_board.
		o Somewhere in the <script> tags add
					+ var board = new Board("id_of_the_pgn_div")
					+ board.init() 
* If you want to reference the images from another directory you can use the
	imagePrefix attribute of the Board object.
		o board.imagePrefix = "someDirectory/" 
* If you don't want the movesPane to show up
		o board.showMovesPane=true 
* Easier way to set options
		o var board = new Board("id_of_the_pgn_div",
														{'showMovesPane':true,
														'imagePrefix':'someDirectory/'}) 

Have fun!
