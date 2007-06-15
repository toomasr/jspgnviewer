/**
 * Copyright 2006 Toomas R�mer
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
	this.props = new Object();
	this.validProps = ['Event','Site','Date','Round',
								'White','Black','Result','FEN'];
	// the moves, one move contains the black and white move
	this.moves = new Array();
	// the current move in the game
	this.currentMove = 0;
	// for outputting white and black moves separately
	this.skip = 0;

	this.pgn = pgn;
	this.pgnRaw = pgn;
	this.pgnStripped = stripIt(pgn);

	/* constructor */

	// strip comments
	this.pgn = stripIt(pgn,true);

	// Match all properties
	var reprop = /\[([^\]]*)\]/gi;
	var matches = this.pgn.match(reprop);
	if (matches) {
		// extract information from each matched property
		for(var i = 0;i < matches.length; i++) {
			// lose the brackets
			tmpMatches = matches[i].substring(1, matches[i].length-1);
			// split by the first space
			var key = tmpMatches.substring(0, tmpMatches.indexOf(" "));
			var value = tmpMatches.substring(tmpMatches.indexOf(" ")+1);
			if (value.charAt(0) == '"')
				value = value.substr(1);
			if (value.charAt(value.length-1) == '"')
				value = value.substr(0, value.length-1);
			 
			this.props[key] = value;
			this.pgn = this.pgn.replace(matches[i], "");
		 }
	}

	// remove the properties
	this.pgn = this.pgn.replace(/\[[^\]]*\]/g,'');
	// newlines to spaces
	this.pgn = this.pgn.replace(/\n/g, " ");
	//trim
	this.pgn = this.pgn.replace(/^\s+|\s+$/g, '');

	var gameOverre = new Array(
		/1\/2-1\/2/,
		/0-1/,
		/1-0/,
		/\*/
	);

	// the moves;
	var re;
	var themoves = this.pgn.split(" ");
	var tmp = new Array();
	tmp[1] = null;
	var tmpidx = 0;	//make this 1 if FEN and black to move
	
	if (this.props["FEN"]) {
		var fen = this.props['FEN'].split(/\/| /g);
		if (fen[8] == 'b') {
			tmpidx = 1;
			this.skip = 1;
		}
	}
	
	for (var i=0;i<themoves.length-1;i++) {	//don't handle game end bit
		if (themoves[i]) {
			themoves[i] = themoves[i].replace(/^\s+|\s+$/g, '');
		}
		if (!themoves[i]) {
			continue;
		}
		var c = themoves[i].charAt(0);
		if (c >= '1' && c <= '9') {	//move number
			c = themoves[i].charAt(themoves[i].length-1);
			if (c == '.') {	//ends with . so nothing but a move
				continue;
			}
			var found = false;
			for (var j=0;j<themoves[i].length;j++) {
				c = themoves[i].charAt(j);
				if ((c >= '0' && c <= '9') || c == '.') {
					continue;
				}
				else {
					found = true;
					themoves[i] = themoves[i].substring(j);	//strip move number
					break;
				}
			}
			if (!found) {
				continue;
			}
		}
		tmp[tmpidx] = themoves[i];
		if (tmpidx == 1) {	//black's move or last move
			var move = new Move(tmp[0], tmp[1]);
			this.moves[this.moves.length] = move;
			tmpidx = 0;
			tmp = new Array();
			tmp[1] = null;
		}
		else {
			tmpidx = 1;
		}
	}
	if (tmp[0] || tmp[1]) {
		var move = new Move(tmp[0], tmp[1]);
		this.moves[this.moves.length] = move;
	}

	this.nextMove = function() {
		var rtrn = null;
		try{
			if (this.skip) {
				this.skip = 0;
				rtrn = new Array(this.moves[this.currentMove].black,
													'black');
				this.currentMove++;
			}
			else {
				this.skip = 1;
				rtrn = new Array(this.moves[this.currentMove].white,
											'white');
			}

			if (rtrn[0] == null || rtrn[0].length == 0)
				rtrn = null;
			return rtrn;
		}
		catch (e) {
			return null;
		}
	};

	this.getComment = function(move, idx) {
		var i = this.pgnStripped.indexOf(move,idx);
		if (i == -1) {
			alert("getComment error, could not find move");
			return [null,idx];
		}
		
		for (var j=i+move.length;j<this.pgnStripped.length;j++) {
			var c = this.pgnStripped.charAt(j);
			switch (c) {
				case ' ':
					break;
				case '_':	//found comment
					for (var k=j;k<this.pgnStripped.length;k++) {
						var c2 = this.pgnStripped.charAt(k);
						switch (c2) {
							case '_':	//found comment
								break;
							default:	//no comment
								return [this.pgnRaw.substring(j,k),k];
						}
					}
					break;
				default:	//no comment
					return [null,idx];
			}
		}
		return [null,idx];
	};
};

function Move(white, black) {
	this.white = white;
	this.black = black;

	this.toString = function() {
		return this.white+" "+this.black;
	};
};

function stripIt(val, strip) {
	var count = 0;
	var out = new Array();
	for (var i=0;i<val.length;i++) {
		var c = val.charAt(i);
		switch (c) {
			case '(':
				if (!strip) {
					out[out.length] = '_';
				}
				count++;
				break;
			case '{':
				if (!strip) {
					out[out.length] = '_';
				}
				count++;
				break;
			case '}':
				count--;
				if (!strip) {
					out[out.length] = '_';
				}
				break;
			case ')':
				count--;
				if (!strip) {
					out[out.length] = '_';
				}
				break;
			default:
				if (count > 0) {
					if (!strip) {
						out[out.length] = '_';
					}
				}
				else {
					out[out.length] = c;
				}
		}
	}
	return out.join("");
};
