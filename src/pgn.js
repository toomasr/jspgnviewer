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

/*
	Representation of the PGN format. Different meta information
	about the actual game(s) plus the moves and result of the game.
*/

function Pgn(pgn) {
	// properties of the game eg players, ELOs etc
	this.props = new Object()
	// the moves, one move contains the black and white move
	this.moves = new Array()
	// the current move in the game
	this.currentMove = 0;
	// for outputting white and black moves separately
	this.skip = 0

	this.pgn = pgn

	/* constructor */

	// strip comments
	this.pgn = this.pgn.replace(/\{[^}]*\}/g,'')

	// the properties
	var reprop = /\[([^\]]*)\]/gi
	var matches = this.pgn.match(reprop)
	if (matches) {
		 for(var i = 0;i < matches.length; i++) {
			 // lose the brackets
			 matches[i] = matches[i].substring(1, matches[i].length-1)
			 // split by the first space
			 var key = matches[i].substring(0, matches[i].indexOf(" "))
			 var value = matches[i].substring(matches[i].indexOf(" ")+1)
			 if (value.charAt(0) == '"')
				 value = value.substr(1)
			 if (value.charAt(value.length-1) == '"')
				 value = value.substr(0, value.length-1)
			 
			 this.props[key] = value;
		 }
	}

	var gameOverre = new Array(
		/1\/2-1\/2/,
		/0-1/,
		/1-0/
	)

	// the moves
	var re;
	for(var i = 1;;i++) {
		re = i+"\.(\\n| )([^.]*)"
		
		var result = this.pgn.match(re)
		
		if (result == null)
			break
		var tmp = result[2].replace(/\n/g, " ").split(" ")
		for (var j = 0;j<gameOverre.length;j++) {
			if (gameOverre[j].test(tmp[1]))
			tmp[1] = null
		}
		if (tmp[1] && 0 == tmp[1].length)	
			 tmp[1] = null
		var move = new Move(tmp[0], tmp[1])
		this.moves[this.moves.length] = move
	}

	// no moves
	if (this.moves.length>0) {
		 for(var i = 0; i < gameOverre.length; i++) {
			 if (gameOverre[i].test(this.moves[this.moves.length-1][1])) {
				 this.moves[this.moves.length-1][1] = null
			 }
		 }
	}

	if (/1\/2-1\/2/.test(this.pgn)) {
		this.props['result'] = '1/2-1/2'
	}
	else if (/1-0/.test(this.pgn)) {
		this.props['result'] = '1-0'   
	}
	else if (/0-1/.test(this.pgn)) {
		this.props['result'] = '0-1'
	}
	else {
		this.props['result'] = 'Was not able to extract result info'   
	}

	this.nextMove = function() {
		var rtrn = null
		try{
			if (this.skip) {
				this.skip = 0
				rtrn = new Array(this.moves[this.currentMove].black,
													'black');
				this.currentMove++
			}
			else {
				this.skip = 1
				rtrn = new Array(this.moves[this.currentMove].white,
											'white')
			}
	
			if (rtrn[0] == null) rtrn = null
				return rtrn
			}
		catch (e) {
			return null
		}
	}
}

function Move(white, black) {
	this.white = white
	this.black = black
}

