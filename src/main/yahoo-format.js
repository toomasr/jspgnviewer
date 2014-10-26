/**
 * Copyright 2008 Toomas Römer
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
   Representation of the Yahoo game format.
*/
function Yahoo(pgn) {
	// properties of the game eg players, ELOs etc
	this.props = new Object();
	this.validProps = ['Title','White','Black','Date'];
	
	// the moves, one move contains the black and white move
	this.moves = new Array();
	// the current move in the game
	this.currentMove = 0;
	// for outputting white and black moves separately
	this.skip = 0;

	// strip newlines
	this.pgnOrig = pgn;
	
	// make double spaces to single spaces
	pgn = pgn.replace(/ +/g,' ');
	
	this.pgn = pgn;
	this.pgnRaw = pgn;
	this.pgnStripped = pgn;
	
	/* constructor */
	
	// Match all properties
	var reprop = /;.*/gi;
	var matches = this.pgn.match(reprop);

	if (matches) {
		// extract information from each matched property
		 for(var i = 0;i < matches.length; i++) {
			 if (matches[i].length == 0)
				 continue;
			 var tmp = matches[i];
			 tmp = tmp.split(":");
			 if (tmp.length == 2) {
				 key = tmp[0].replace(/^\s+|\s+$/g, '').replace(/^;/,'');
				 value = tmp[1].replace(/^\s+|\s+$/g, '');
				 this.props[key] = value;
			 }
		 }
	}

	// remove the properties
	this.pgn = this.pgn.replace(/;.*/gi,'');
	
	//trim
	this.pgn = this.pgn.replace(/^\s+|\s+$/g, '');
	// new lines
	this.pgn = this.pgn.replace(/\n/g," ");

	var gameOverre = new Array(
		/1\/2-1\/2/,
		/0-1/,
		/1-0/,
		/\*/
	);

	
	var elems = this.pgn.split(" ");
	var tmpMove = new Array();
	for (var i = 0;i < elems.length;i++) {
		if (elems[i].length == 0)
			continue;
		// we can skip elements that are just move numbers
		if (elems[i].indexOf(".") != -1)
			continue;
		
		// depending on parity we either have a full move
		// or the last one is a half move
		if (tmpMove.length == 2) {
			var move = new Move(tmpMove[0], tmpMove[1]);
			this.moves[this.moves.length] = move;
			tmpMove = new Array();
		}
		tmpMove[tmpMove.length] = elems[i];
	}

	if (tmpMove.length > 0) {
		var move = new Move(tmpMove[0], tmpMove[1]);
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
			//throw("getComment error, could not find move '"
			//				+move+"'"+", with index '"+idx+"'");
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
								// we might have many comments separated with spaces
								// as we strip all double spaces to single ones we
								// can just check for the next char being '_'
								if (this.pgnStripped.length>k+1 
									 	&& this.pgnStripped.charAt(k+1) == '_') {
									continue;
								}
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
