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
	this.validProps = ['Event','Site','Date','Rount',
							 'White','Black'];
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
	this.pgn = this.pgn.replace(/\{[^}]*\}/g,'');
	// remove RAVs
	this.pgn = this.pgn.replace(/\([^)]*\)/g,'')

	// the properties;
	var reprop = /\[([^\]]*)\]/gi;
	var matches = this.pgn.match(reprop);
	if (matches) {
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

	var gameOverre = new Array(
		/1\/2-1\/2/,
		/0-1/,
		/1-0/,
		/\*/
	);

	// the moves;
	var re;
	for(var i = 1;1!=2;i++) {
		re = i+"\\.(\\n| )?([^.]*)";
		
		var result = this.pgn.match(re);
		if (result == null)
			break;
		// newlines to spaces
		result[2] = result[2].replace(/\n/g, " ");
		// leave only one space in the middle
		while(result[2].indexOf("  ")!=-1)
			 result[2] = result[2].replace("  ", " ");
		// possible first space gets removed
		if (" "==result[2].charAt(0))
			result[2] = result[2].substring(1);
		var tmp = result[2].split(" ");
		for (var j = 0;j<gameOverre.length;j++) {
			if (gameOverre[j].test(tmp[1]))
				tmp[1] = null;
		}
		if (tmp[1] && 0 == tmp[1].length)
			 tmp[1] = null;
		var move = new Move(tmp[0], tmp[1]);
		this.moves[this.moves.length] = move;
	}

	// no moves
	if (this.moves.length>0) {
		 for(var i = 0; i < gameOverre.length; i++) {
			 if (gameOverre[i].test(this.moves[this.moves.length-1][1])) {
				 this.moves[this.moves.length-1][1] = null;
			 }
		 }
	}

	if (/1\/2-1\/2/.test(this.pgn)) {
		this.props['result'] = '1/2-1/2';
	}
	else if (/1-0/.test(this.pgn)) {
		this.props['result'] = '1-0';
	}
	else if (/0-1/.test(this.pgn)) {
		this.props['result'] = '0-1';
	}
	else {
		this.props['result'] = '';
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

function stripIt(val) {
	var count = 0;
	var out = new Array();
	for (var i=0;i<val.length;i++) {
		var c = val.charAt(i);
		switch (c) {
			case '(':
				out[out.length] = '_';
				count++;
				break;
			case '{':
				out[out.length] = '_';
				count++;
				break;
			case '}':
				count--;
				out[out.length] = '_';
				break;
			case ')':
				count--;
				out[out.length] = '_';
				break;
			default:
				if (count > 0) {
					out[out.length] = '_';
				}
				else {
					out[out.length] = c;
				}
		}
	}
	return out.join("");
}

