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
	Convert PGN format to an easier format. The problem
	with PGN is that it is really difficult and ugly to
	accomplish backward moves. 
	
	Let's say we have a move "e4" and we need to go one 
	move back. The only info is that we have placed a pawn
	to e4. We also have to remember from where did we place
	the pawn. To make it easier and to have less calculations
	the PGN is converted into a format where the from square
	with contents is explicit and to square also. There are
	other problems also regarding backward moving and remembering
	which piece was taken.
*/


function Converter(pgn) {
	this.pgn = pgn;
	this.vBoard = new Array(8);
	this.initialBoard = new Array(8);
	this.moves = new Array();
	this.iteIndex = 0;
	this.flippedI = false;
	this.flippedV = false;

	this.wKingX, this.wKingY, this.bKingX, this.bKingY;
	this.bishops = {'wwx':7, 'wwy':5,
						'wbx':7, 'wby':2,
						'bwx':0, 'bwy':2,
						'bbx':0, 'bby':5};
	this.bishopProm = false;

	this.wQueens = 1;
	this.bQueens = 1;
	this.wQueenX, this.wQueenY, this.bQueenX, this.bQueenY;
	this.queenProm = false;
	
	/* Virtual board initialization */
	for(var i = 0; i < 8; i++) {
		this.vBoard[i] = new Array(8);
		for (var j = 0; j < 8; j++) {
			this.vBoard[i][j] = new vSquare();
		}
	}
	
	// pawns
	for (var i = 0;i < 8; i++) {
		this.vBoard[6][i].piece = 'pawn';
		this.vBoard[6][i].color = 'white';
            
		this.vBoard[1][i].piece = 'pawn';
		this.vBoard[1][i].color = 'black';
	}

	// rooks, bishops, knights
	for(var i = 0; i < 2; i++) {
		this.vBoard[7][i*7].piece = 'rook';
		this.vBoard[7][i*7].color = 'white';
          
		this.vBoard[0][i*7].piece = 'rook';
		this.vBoard[0][i*7].color = 'black';
  
		this.vBoard[7][i*5+1].piece = 'knight';
		this.vBoard[7][i*5+1].color = 'white';
          
		this.vBoard[0][i*5+1].piece = 'knight';
		this.vBoard[0][i*5+1].color = 'black';
  
		this.vBoard[7][i*3+2].piece = 'bishop';
		this.vBoard[7][i*3+2].color = 'white';
		this.vBoard[7][i*3+2].type = (i==0)?'black':'white';

		this.vBoard[0][i*3+2].piece = 'bishop';
		this.vBoard[0][i*3+2].color = 'black';
		this.vBoard[0][i*3+2].type = (i==0)?'white':'black';
	}
         
	this.vBoard[7][3].piece = 'queen';
	this.vBoard[7][3].color = 'white';
	this.wQueenX = 7, this.wQueenY = 3;
	
	this.vBoard[7][4].piece = 'king';
	this.vBoard[7][4].color = 'white';
	this.wKingX = 7, this.wKingY = 4;

	this.vBoard[0][3].piece = 'queen';
	this.vBoard[0][3].color = 'black';
	this.bQueenX = 0, this.bQueenY = 3;

	this.vBoard[0][4].piece = 'king';
	this.vBoard[0][4].color = 'black';
	this.bKingX = 0, this.bKingY = 4;

	// let's clone the initial pos
	for (var i = 0;i < 8;i++){
		this.initialBoard[i] = new Array(8);
		for (var j = 0;j < 8;j++) {
			this.initialBoard[i][j] = this.vBoard[i][j].clone();
		}	 
	}
	/* EO Virtual board initialization */
	
	this.convert = function() {
		var move = null;
		do {
			 move = this.convertMove();
			 if (move)
			 	this.moves[this.moves.length] = move;
		}
		while(move);
	}
	
	/*
		Result iterator
	*/

	this.getCurMove = function() {
		if (this.moves.length>this.iteIndex)
			return this.moves[this.iteIndex];
		return null;
	}

	this.getCurMoveNo = function() {
		 return this.iteIndex;
	}
	
	this.nextMove = function() {
		if (this.moves.length>this.iteIndex)
			return this.moves[this.iteIndex++];
		return null;
	}

	this.prevMove = function() {
		if (this.iteIndex>0)
			return this.moves[--this.iteIndex];
		return null;
	}
	
	this.resetToEnd = function() {
		 this.iteIndex = this.moves.length;
	}

	this.resetToStart = function() {
		this.iteIndex = 0;
	}

	/*
		EOF Result Iterator
	*/

	this.getStartPos = function(flipped) {
		if (flipped!=this.flippedI) {
			 this.flipBoard(this.initialBoard);
			 this.flippedI = !this.flippedI;
		}
		return this.initialBoard;
	}

	this.getEndPos = function(flipped) {
		if (flipped!=this.flippedV) {
			this.flipBoard(this.vBoard);
			this.flippedV = !this.flippedV;
		}
		return this.vBoard;
	}

	this.flipBoard = function(board) {
		this.flipped = !this.flipped;
		for (var i = 0;i<8;i++) {
			for (var j = 0;j<4;j++) {
				tmp = board[i][j];
				board[i][j] = board[7-i][7-j];
				board[7-i][7-j] = tmp;
			}
		}
	}
	
	/*
		Convert a move.
	*/
	this.convertMove = function(board) {
		var to = this.pgn.nextMove();
		var oldTo = to;
		if (to == null)
			return;
		var color = to[1];
		to = to[0];
		
		/*
			Check which piece has to move.
			Find the location of the piece.
		*/
		var pawnre = /^[a-z]+[1-8]/;
		var knightre = /^N[0-9]?[a-z]+[1-8]/;
		var bishre = /^B[a-z]+[1-8]/;
		var queenre = /^Q[0-9]?[a-z]+[1-8]/;
		var rookre = /^R[0-9]?[a-z]+[1-8]/;
		var lCastlere = /^(0|O)-(0|O)-(0|O)/i;
		var sCastlere = /^(0|O)-(0|O)/i;
		var kingre = /^K[a-z]+[1-8]/;
		var prom = "";
		
		var toCoords = getSquare(to);
		var fromCoords, from, to, result, tmp, myMove = null, pawnM = false;
		if (pawnre.test(to)) {
			// let see if it is a promotional move
			if (/^[a-z]+[1-8]=[A-Z]/.test(to))
				prom = to.charAt(to.indexOf('=')+1);
			fromCoords = findFromPawn(this.vBoard, to, toCoords, color);
			pawnM = true;
		}
		else if (knightre.test(to)) {
			fromCoords = findFromKnight(this, to, toCoords, color);
		}
		else if (bishre.test(to)) {
			fromCoords = findFromBish(this, this.vBoard, to, toCoords, color);
		}
		else if (queenre.test(to)) {
			fromCoords = findFromQueen(this, this.vBoard, to, toCoords, color) ;
		}
		else if (rookre.test(to)) {
			fromCoords = findFromRook(this, to, toCoords, color);
		}
		else if (kingre.test(to)) {
			fromCoords = findFromKing(this, this.vBoard, color);
		}
		else if (sCastlere.test(to)) {
			var bCoords = new Array('e8','g8','h8','f8');
			var wCoords = new Array('e1','g1','h1','f1');
			
			if (lCastlere.test(to)) {
					bCoords = new Array('e8', 'c8', 'a8', 'd8');
					wCoords = new Array('e1', 'c1', 'a1', 'd1');
			}
			var coords = color=='white'?wCoords:bCoords;
			
			fromCoords = getSquare(coords[0]);
			toCoords = getSquare(coords[1]);
			
			from = this.vBoard[fromCoords[0]][fromCoords[1]];
			to = this.vBoard[toCoords[0]][toCoords[1]];
			// update king location
			if ('king' == from.piece && 'white' == from.color)
				 this.wKingX = toCoords[0], this.wKingY = toCoords[1];
			else if ('king' == from.piece && 'black' == from.color)
				 this.bKingX = toCoords[0], this.bKingY = toCoords[1];

			result = movePiece(this, from, to, prom);
				
			myMove = new MyMove();
			myMove.moveStr = oldTo[0];
			myMove.oPiece = result[2].piece;
			myMove.oColor = result[2].color;
			myMove.pPiece = result[3];

			myMove.add(new MySquare(fromCoords[0], fromCoords[1]
												,result[0].piece, result[0].color));
			
			myMove.add(new MySquare(toCoords[0], toCoords[1]
												,result[1].piece, result[1].color));

			fromCoords = getSquare(coords[2]);
			toCoords = getSquare(coords[3]);
		}
		else {
			throw("Can't figure out which piece to move '"+oldTo+"'");
		}
		from = this.vBoard[fromCoords[0]][fromCoords[1]];
		to = this.vBoard[toCoords[0]][toCoords[1]];
			
		// update king location
		if ('king' == from.piece && 'white' == from.color)
			this.wKingX = toCoords[0], this.wKingY = toCoords[1];
		else if ('king' == from.piece && 'black' == from.color)
			this.bKingX = toCoords[0], this.bKingY = toCoords[1];
		// update bishops location
		else if ('bishop' == from.piece) {
			var x = from.color.charAt(0)+from.type.charAt(0)+'x';
			var y = from.color.charAt(0)+from.type.charAt(0)+'y';
			this.bishops[x] = toCoords[0];
			this.bishops[y] = toCoords[1];
		}
		else if ('queen' == from.piece) {
			if ('white' == from.color) {
				this.wQueenX = toCoords[0],this.wQueenY = toCoords[1];
			}
			else {
				this.bQueenX = toCoords[0],this.bQueenY = toCoords[1];
			}
		}
		
		// we take one queen away
		if ('queen' == to.piece) {
			if ('white' == to.color) {
				this.wQueens--;
			}
			else {
				this.bQueens--;
			}
		}
			
			
		// in case of castling we don't have a null value
		if (!myMove)
			 myMove = new MyMove();
	 	
	 	var enPassante = null
		if (pawnM)
			enPassante = getEnPassante(this, fromCoords[0], fromCoords[1],
														 toCoords[0], toCoords[1]);
		
		if (enPassante) {
			var sq = this.vBoard[enPassante[0]][enPassante[1]];
			var enP = new MySquare(enPassante[0], enPassante[1]
													,sq.piece, sq.color);
			myMove.enP = enP;
			this.vBoard[enPassante[0]][enPassante[1]].color = null;
			this.vBoard[enPassante[0]][enPassante[1]].piece = null;
			this.vBoard[enPassante[0]][enPassante[1]].type = null;
		}
			
		result = movePiece(this, from, to ,prom);
		
		myMove.oPiece = result[2].piece;
		myMove.oColor = result[2].color;
		myMove.pPiece = result[3];
		myMove.moveStr = oldTo[0];
		
		if (prom && "queen" == result[1].piece) {
			if ('white' == result[1].color) {
				this.wQueenX = toCoords[0],this.wQueenY = toCoords[1];
			}
			else {
				this.bQueenX = toCoords[0],this.bQueenY = toCoords[1];
			}
		}

		myMove.add(new MySquare(fromCoords[0], fromCoords[1]
												,result[0].piece, result[0].color));
		
		myMove.add(new MySquare(toCoords[0], toCoords[1]
												,result[1].piece, result[1].color));

		return myMove;
	}
		
	 
	/* FINDING FROM LOCATION FUNCTIONS
		When a SAN (Standard Algebraic Notation) move is given
		we need to figure out from where the move is made. Lets
		say the SAN is "e4" - pawn moves to e4. The from location
		can be e2, e3 or e5. This depends on the color of the player
		and on where the pawn was located. All pieces have different
		logic on finding which piece exactly has to move to the location.
	*/
        
	/*
		Find the pawn from location.
	*/
	findFromPawn = function(pos, to, tmp, color) {
		var x = tmp[1], y = tmp[0];
       
		// taking move or with xtra information
		if (tmp[2][0] != -1 || tmp[3] != -1) {
			var froms = new Array(
				new Array(tmp[0]+1,tmp[1]-1),
				new Array(tmp[0]+1,tmp[1]+1),
				new Array(tmp[0]-1,tmp[1]-1),
				new Array(tmp[0]-1,tmp[1]+1)
			);

			for(var i = 0;i<froms.length;i++) {
				try {
					if (pos[froms[i][0]][froms[i][1]].piece == 'pawn'
							&& pos[froms[i][0]][froms[i][1]].color == color) {
							// we have the file information too
							if (tmp[3] != -1 && tmp[3] == froms[i][1]) {
								// no back taking
								if (y < froms[i][0] && color == "black")
									 continue;
								if (y > froms[i][0] && color == "white")
									 continue;
								return new Array(froms[i][0], froms[i][1]);
							}
							//else
							//	return new Array(froms[i][0], froms[i][1])
					}
				}
				catch (e) {}
			}
		}
		else {
			// non-taking move
			try {
				var j;
				for(var i = 0; i < 8; i++) {
					j = (color == 'white')?7-i:i;
					if (pos[j][x].piece == 'pawn' 
							&& pos[j][x].color == color) {
						if (Math.abs(j-y)>2) {
							 continue;
						}
						// we might be looking at the wrong pawn
						// there can be one between src and dst
						if (2 == Math.abs(j-y)) {
							var j2 = (color == 'white')?(j-1):j+1;
							if (pos[j2][x].piece == 'pawn'
								 && pos[j2][x].color == color) {
								 return new Array(j2, x);
							}
						}
						return new Array(j, x);
					}
				}
			}
			catch (e) {}
		}
		throw("Could not find a move with a pawn '"+toSAN+"'");
	}

	/*
		Find the bishop from location.
	*/
	function findFromBish(board, pos, toSAN, toCoords, color) {
		var to = toCoords;
		var rtrn;
		var coord;
		// if no promotion to bishop has happened we can
		// use the cached version of their locations
		if (!board.bishopProm) {
			var sgC = getSquareColor(to[0], to[1]).charAt(0);
			var x = color.charAt(0)+sgC+"x";
			var y = color.charAt(0)+sgC+"y";
			return new Array(board.bishops[x], board.bishops[y]);
		}
		for(var i = 0;i < 8; i++) {
			// diagonal down right
			try {
				coord = pos[to[0]+i][to[1]+i];
				if (coord.piece == 'bishop' && coord.color == color) {
					return new Array(to[0]+i, to[1]+i);
				}
			}
			catch (e) {}

			try {
				coord = pos[to[0]-i][to[1]-i];
				if (coord.piece == 'bishop' && coord.color == color) {
					return new Array(to[0]-i, to[1]-i);
				}
			}
			catch (e) {}
               
			try {
				coord = pos[to[0]+i][to[1]-i];
				if (coord.piece == 'bishop' && coord.color == color) {
					return new Array(to[0]+i, to[1]-i);
				}
			}
			catch (e) {}

			try {
				coord = pos[to[0]-i][to[1]+i];
				if (coord.piece == 'bishop' && coord.color == color) {
					return new Array(to[0]-i, to[1]+i);
				} 
			}
			catch (e) {}
		}
		throw('No move found for the bishop '+toSAN);
}

	/* 
		Find the king from location.
	*/
	function findFromKing(board, pos, color) {
		var x = board.wKingX, y = board.wKingY;
		if ("black" == color)
			x = board.bKingX, y = board.bKingY;
		return new Array(x,y);
	}

	/* 
		Find the queen's from location.
	*/
	function findFromQueen(board, pos, toSAN, to, color) {
		var op = getOppColor(color);
		var extra = to[2];
		var rtrns = new Array();
		
		if (!board.queenProm) {
			var x = board.wQueenX, y = board.wQueenY;
			if ("black" == color)
				x = board.bQueenX, y = board.bQueenY;
			return new Array(x,y);
		}

		var controlNo = board.wQueens
		if ( "black" == color)
			controlNo = board.bQueens;
					
		var tmp;
		try {
			for (var i = 1;i<8;i++) {
				 tmp = pos[to[0]+i][to[1]];
				 if (tmp && "queen" == tmp.piece && tmp.color == color) {
						rtrns[rtrns.length] = new Array(to[0]+i, to[1]);
						break;
				 }
				 else if (tmp.piece)
						break;
			}
		}
		catch (e) {}
		
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					 tmp = pos[to[0]][to[1]+i];
					 if (tmp && "queen" == tmp.piece && tmp.color == color) {
							rtrns[rtrns.length] = new Array(to[0], to[1]+i);
							break;
					 }
					 else if (tmp.piece)
							break;
				}
			}
			catch (e) {}
		}

		
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					 tmp = pos[to[0]-i][to[1]];
					 if (tmp && "queen" == tmp.piece && tmp.color == color) {
							rtrns[rtrns.length] = new Array(to[0]-i, to[1]);
							break;
					 }
					 else if (tmp.piece)
							break;
				}
			}
			catch (e) {}
		}
		
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					tmp = pos[to[0]][to[1]-i];
					if (tmp && "queen" == tmp.piece && tmp.color == color) {
							rtrns[rtrns.length] = new Array(to[0], to[1]-i);
							break;
					}
					else if (tmp.piece)
						break;
				}
			}
			catch (e) {}
		}
					
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					tmp = pos[to[0]-i][to[1]-i]
					if (tmp && "queen" == tmp.piece && tmp.color == color) {
						rtrns[rtrns.length] = new Array(to[0]-i, to[1]-i);
						break;
					}
					else if (tmp.piece)
						break;
				}
			}
			catch (e) {}
		}
			 
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					tmp = pos[to[0]+i][to[1]+i];
					if (tmp && "queen" == tmp.piece && tmp.color == color) {
						rtrns[rtrns.length] = new Array(to[0]+i, to[1]+i);
						break;
					}
					else if (tmp.piece)
						break;
				}
			}
			catch (e) {}
		}
					
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					tmp = pos[to[0]-i][to[1]+i];
					if (tmp && "queen" == tmp.piece && tmp.color == color) {
						rtrns[rtrns.length] = new Array(to[0]-i, to[1]+i);
						break;
					}
					else if (tmp.piece)
						break;
				}
			}
			catch (e) {}
		}
					
		if (controlNo > rtrns.length) {
			try {
				for (var i = 1;i<8;i++) {
					tmp = pos[to[0]+i][to[1]-i];
					if (tmp && "queen" == tmp.piece && tmp.color == color) {
						rtrns[rtrns.length] = new Array(to[0]+i, to[1]-i);
						break;
					}
					else if (tmp.piece)
						break;
				}
			}
			catch (e) {}
		}
		// only one option
		if (rtrns.length == 1)
			return rtrns[0];
		if (extra[0] != -1 || extra[1] != -1) {
			// more than one queen can move there
			// use the extra informatin (eg b from Qbd7
			for (var i = 0;i < rtrns.length;i++) {
				if (extra[0] != -1 && extra[0] == rtrns[i][1])
					return rtrns[i];
				else if (extra[1] != -1 && extra[1] == rtrns[i][0])
					return rtrns[i];
			}
		}
		throw("No queen move found '"+toSAN+"'");
	}

	/* 
		Find the rook's from location.
	*/
	findFromRook = function(brd, toSAN, toCoords, color) {
		var op = getOppColor(color);
		var to = toCoords;
		var pos = brd.vBoard;
		var extra = to[2];

		// it ain't that simple, what if 2 rooks
		// can move to the same piece but one of
		// them is blocked by another piece
		// then we actually have to go from the dest
		// coord to 4 directions until we find the
		// bloody rook or die trying
		var rtrns = new Array();
		try {
			var tmp
			for (var i = 1;i<8;i++) {
				tmp = pos[to[0]+i][to[1]]
				if (tmp && tmp.piece == 'rook' && tmp.color == color) {
					rtrns[rtrns.length] = new Array(to[0]+i, to[1]);
					break;
				}
				else if (tmp.piece) {
					break;
				}
			}
		}
		catch(e){}
					
		try {
			var tmp
			for (var i = 1;i<8;i++) {
				tmp = pos[to[0]-i][to[1]];
				if (tmp && tmp.piece == 'rook' && tmp.color == color) {
					rtrns[rtrns.length] = new Array(to[0]-i, to[1]);
					break;
				}
				else if (tmp.piece) {
					break;
				}
			}
		}
		catch(e){}

		try {
			var tmp;
			for (var i = 1;i<8;i++) {
				tmp = pos[to[0]][to[1]+i];
				if (tmp && tmp.piece == 'rook' && tmp.color == color) {
					rtrns[rtrns.length] = new Array(to[0], to[1]+i);
					break;
				}
				else if (tmp.piece) {
					break;
				}
			}
		}
		catch(e){}
					
		try {
			var tmp;
			for (var i = 1;i<8;i++) {
				tmp = pos[to[0]][to[1]-i];
				if (tmp && tmp.piece == 'rook' && tmp.color == color) {
					rtrns[rtrns.length] = new Array(to[0], to[1]-i);
					break;
				}
				else if (tmp.piece) {
					break;
				}
			}
		}
		catch(e){}
		
		// only one option
		if (rtrns.length == 1)
			return rtrns[0];

		if (extra[0] != -1 || extra[1] != -1) {
			// more than one rook can move there
			// use the extra informatin (eg b from Rbd7
			for (var i = 0;i < rtrns.length;i++) {
				if (extra[0] != -1 && extra[0] == rtrns[i][1])
					return rtrns[i];
				else if (extra[1] != -1 && extra[1] == rtrns[i][0])
					return rtrns[i];
			}
		}
		else if (2 == rtrns.length) {
			// let's try the check rule, if it fails
			for (var i = 0;i < rtrns.length; i++) {
				var from = pos[rtrns[i][0]][rtrns[i][1]];
				var oldTo = pos[to[0]][to[1]];
				
				pos[rtrns[i][0]][rtrns[i][1]] = new vSquare();
				pos[to[0]][to[1]] = from;

				var checked = isKingChecked(brd,from.color, pos);
				pos[rtrns[i][0]][rtrns[i][1]] = from;
				pos[to[0]][to[1]] = oldTo;
				if (checked)
					continue;
				else
					return rtrns[i];
			}
		}
		throw("No rook move found '"+toSAN+"'");
	}

	/* 
		Find the knight's from location.
	*/
	findFromKnight = function(brd, toSAN, toCoords, color) {
		var to = toCoords;
		var extra = to[2];
		var pos = brd.vBoard;
		var rtrns = new Array();
		var froms = new Array(
						new Array(to[0]+2, to[1]+1),
						new Array(to[0]+2, to[1]-1),

						new Array(to[0]-2, to[1]+1),
						new Array(to[0]-2, to[1]-1),

						new Array(to[0]+1, to[1]+2),
						new Array(to[0]-1, to[1]+2),

						new Array(to[0]+1, to[1]-2),
						new Array(to[0]-1, to[1]-2)
		);

		for (var i = 0;i<froms.length;i++) {
			try{
				var tmp = pos[froms[i][0]][froms[i][1]];
				if (tmp.piece == 'knight' && tmp.color == color) {
					if (extra[0] != -1 && froms[i][1] != extra[0]) {
						continue;
					}
					else if(extra[1] != -1 && froms[i][0] != extra[1]) {
						continue;
					}
					rtrns[rtrns.length] = new Array(froms[i][0], froms[i][1]);
				}
			}
			catch (e) {}
		}
		
		if (rtrns.length>1) {
			for (var i = 0; i< rtrns.length;i++){
				var from = pos[rtrns[i][0]][rtrns[i][1]];
				pos[rtrns[i][0]][rtrns[i][1]] = new vSquare();

				var checked = isKingChecked(brd, from.color, pos);
				pos[rtrns[i][0]][rtrns[i][1]] = from;
				if (checked)
					continue;
				else
					return rtrns[i];
			}
			return rtrns[0];
		}
		else if (rtrns.length == 1)
			return rtrns[0];
		throw("No knight move found. '"+toSAN+"'");
	}

	/**
		Returns "black" if the square specified by x and y
		is black and returns "white" otherwise.
	**/
	function getSquareColor(x, y) {
		x+=1, y+=1;
		if (y%2!=0) {
			if (x%2!=0)
				return "white";
			else
				return "black";
		}
		else {
			if (x%2==0)
				return "white";
			else
				return "black";
		}
	}

	/*
	 * Converts a SAN (Standard Algebraic Notation) into 
	 * board coordinates. The SAN is in the format of
	 * eg e4, dxe4, R2b7. When SAN contains extra information
	 * "taking move", "en passante", "check", "piece from a
	 * specific file or rank" it is also extracted.
	*/
	function getSquare(coord) {
		if (arguments.length != 1) {
			throw "Wrong number of arguments";
		}
		
		var map = new Object();
		// if only from certain file we can make the move
		var extra = new Array(-1,-1);
		var taking = -1;
		map['a'] = 7, map['b'] = 6, map['c'] = 5;
		map['d'] = 4, map['e'] = 3, map['f'] = 2;
		map['g'] = 1, map['h'] = 0;

		// trim the everything from +
		if (coord.indexOf("+") != -1)
			coord = coord.substring(0, coord.indexOf("+"));
		// let's trim the piece prefix
		if (/^[A-Z]/.test(coord)) {
			coord = coord.substr(1);
		}

		// the move is a taking move, we have to look for different
		// files then with pawns
		if (/x/.test(coord)) {
			var tmp = coord.split("x");
			if (tmp[0].length) {
				if (/[a-z]/.test(tmp[0]))
					extra[0] = 7-map[tmp[0]];
				else if (/[0-9]/.test(tmp[0]))
					extra[1] = 8-tmp[0];
			}
			coord = tmp[1];
			taking = 7-map[tmp[0]];
		}
		
		// we have extra information on the from file
		// eg Rbd7
		if (/^[a-z]{2,2}/.test(coord)) {
			extra[0] = 7-map[coord.substring(0,1)];
			coord = coord.substring(1);
		}

		// we have the row no also
		if (/^[0-9][a-z][0-9]/.test(coord)) {
			extra[1] = 8-coord.substring(0,1);
			coord = coord.substring(1);
		}

		var rtrn = new Array(8-coord.charAt(1),
												7-map[coord.charAt(0)],
												extra, taking);
		return rtrn;
	}

	getEnPassante = function(brd, x1, y1, x2, y2) {
		var from = brd.vBoard[x1][y1];
		var to = brd.vBoard[x2][y2];

		// pawn move
		if ("pawn" != from.piece)
			return null;

		// taking move
		if ((y1-y2) == 0)
			return null;

		// destination should be null
		if ( null != to.piece )
			return null;

		// the piece we are looking for
		return new Array(x1, y2);
	}

	getOppColor = function(color) {
		return "white"==color?"black":"white";
	}
        
	movePiece = function(board, from, to, prom) {
		var hist = to.clone();
		var tmpPiece = from.piece;
		var pPiece = null;

		to.piece = from.piece;
		to.color = from.color;
		to.type = from.type;

		from.piece = null;
		from.color = null;
		from.type = null;

		// promoting the piece
		if (prom.length>0) {
			pPiece = tmpPiece;

			switch(prom) {
				case 'R':
					to.piece = 'rook';
					break;
				case 'B':
					to.piece = 'bishop';
					board.bishopProm = true;
					break;
				case 'N':
					to.piece = 'knight';
					break;
				case 'Q':
					to.piece = 'queen';
					if ('white' == to.color) {
						board.wQueens++;
					}
					else {
						board.bQueens++;
					}
					if (board.wQueens>1 || board.bQueens>1) {
						board.queenProm = true;
					}
					break;
				default:
					throw('Unknown promotion');
			}
		}
		return new Array(from, to, hist, pPiece);
	}
		
	isKingChecked = function(brd, col) {
		var op = getOppColor(col);
		
		var x = brd.wKingX, y = brd.wKingY;
		if ("black" == col) {
			x = brd.bKingX, y = brd.bKingY;
		}
		// diagonals, looking for bishops, queens
		var tmp;
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x-i][y-i];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("bishop" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
			
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x+i][y+i];
				if (tmp.color == col)
					break;
					if (tmp.color == op &&
								("bishop" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
			
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x+i][y-i];
					if (tmp.color == col)
						break;
					if (tmp.color == op &&
								("bishop" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
		
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x-i][y+i];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("bishop" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}

		// horizontals, verticals - looking for rooks and queens
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x][y+i];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("rook" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x][y-i];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("rook" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x+1][y];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("rook" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}
		try {
			for (var i = 1;i < 7; i++) {
				tmp = brd.vBoard[x-i][y];
				if (tmp.color == col)
					break;
				if (tmp.color == op &&
							("rook" == tmp.piece || "queen" == tmp.piece))
					return true;
			}
		}
		catch (e) {}

		return false;
	}
}
      
function MyMove() {
	this.actions = new Array();
	this.oPiece = null;
	this.oColor = null;
	// in case of promotion have to remember the prev
	// piece
	this.pPiece = null;
	//
	this.enP = null;
	//
	this.moveStr = null;

	this.add = function(action) {
		this.actions[this.actions.length] = action;
	}

	this.toString = function() {
		return "MyMove -- no. actions "+this.actions.length;
	}
}

function MySquare(x, y, piece, color) {
	var colors = new Array('white','black');
	var pieces = new Array('rook');

	this.x = x;
	this.y = y;
	this.color = color;
	this.piece = piece;

	this.toString = function() {
		return "MySquare -- x = "+this.x+" y="+this.y
							+" color="+this.color
							+ " piece="+this.piece;
	}

	this.clone = function() {
		var sq = new MySquare(this.x, this.y,
		this.piece, this.color);
		return sq;
	}
}

function vSquare() {
	this.piece = null;
	this.color = null;
	this.type = "";
	
	this.toString = function() {
		return "vSquare -- piece = "+this.piece+" color="+this.color
					+" type="+this.type;
	}

	this.clone = function() {
		var sq = new vSquare();
		sq.piece = this.piece;
		sq.color = this.color;
		sq.type = this.type;
		return sq;
	}
}
