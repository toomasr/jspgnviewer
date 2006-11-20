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

function vSquare() {
	this.piece = null
	this.color = null
	
	this.toString = function() {
		return "vSquare -- piece = "+this.piece+" color="+this.color
	}

	this.clone = function() {
		var sq = new vSquare()
		sq.piece = this.piece
		sq.color = this.color
		return sq
	}
}

function Converter(pgn) {
	this.pgn = pgn
	this.vBoard = new Array(8)
	this.initialBoard = new Array(8)
	this.moves = new Array()
	this.iteIndex = 0
	this.flippedI = false
	this.flippedV = false
	
	/* Virtual board initialization */
	for(var i = 0; i < 8; i++) {
		this.vBoard[i] = new Array(8)
		for (var j = 0; j < 8; j++) {
			this.vBoard[i][j] = new vSquare()
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
		this.vBoard[7][i*7].piece = 'rook'
		this.vBoard[7][i*7].color = 'white'
          
		this.vBoard[0][i*7].piece = 'rook'
		this.vBoard[0][i*7].color = 'black'
  
		this.vBoard[7][i*5+1].piece = 'knight'
		this.vBoard[7][i*5+1].color = 'white'    
          
		this.vBoard[0][i*5+1].piece = 'knight'
		this.vBoard[0][i*5+1].color = 'black'
  
		this.vBoard[7][i*3+2].piece = 'bishop'
		this.vBoard[7][i*3+2].color = 'white'
       
        
		this.vBoard[0][i*3+2].piece = 'bishop'
		this.vBoard[0][i*3+2].color = 'black'
	}
         
	this.vBoard[7][3].piece = 'queen'
	this.vBoard[7][3].color = 'white'
	
	this.vBoard[7][4].piece = 'king'
	this.vBoard[7][4].color = 'white'

	this.vBoard[0][3].piece = 'queen'
	this.vBoard[0][3].color = 'black'

	this.vBoard[0][4].piece = 'king'
	this.vBoard[0][4].color = 'black'

	// let's clone the initial pos
	for (var i = 0;i < 8;i++){
		this.initialBoard[i] = new Array(8)
		for (var j = 0;j < 8;j++) {
			this.initialBoard[i][j] = this.vBoard[i][j].clone()
		}	 
	}
	/* EO Virtual board initialization */
	
	this.convert = function() {
		var move = null;
		do {
			 move = this.convertMove()
			 this.moves[this.moves.length] = move
		}
		while(move);
	}
	
	/*
		Result iterator
	*/

	this.getCurMoveNo = function() {
		 return this.iteIndex
	}
	
	this.nextMove = function() {
		if (this.moves.length>(this.iteIndex+1))
			return this.moves[this.iteIndex++]
		return null
	}

	this.prevMove = function() {
		if (this.iteIndex>0)
			return this.moves[--this.iteIndex]
		return null
	}
	
	this.resetToEnd = function() {
		 this.iteIndex = this.moves.length-1
	}

	this.resetToStart = function() {
		this.iteIndex = 0
	}

	/*
		EOF Result Iterator
	*/

	this.getStartPos = function(flipped) {
		if (flipped!=this.flippedI) {
			 this.flipBoard(this.initialBoard)
			 this.flippedI = !this.flippedI
		}
		return this.initialBoard;
	}

	this.getEndPos = function(flipped) {
		if (flipped!=this.flippedV) {
			this.flipBoard(this.vBoard)
			this.flippedV = !this.flippedV
		}
		return this.vBoard;	 
	}

	this.flipBoard = function(board) {
		this.flipped = !this.flipped
		for (var i = 0;i<8;i++) {
			for (var j = 0;j<4;j++) {
				tmp = board[i][j]
				board[i][j] = board[7-i][7-j]
				board[7-i][7-j] = tmp
			}
		}
	}
	
	/*
		Convert a move.
	*/
	this.convertMove = function(board) {
		var to = this.pgn.nextMove()
		if (to == null)
			return;
		var color = to[1]
		to = to[0]
		
		/*
			Check which piece has to move.
			Find the location of the piece.
		*/
		var pawnre = /^[a-z]+[1-8]/
		var knightre = /^N[0-9]?[a-z]+[1-8]/
		var bishre = /^B[a-z]+[1-8]/
		var queenre = /^Q[a-z]+[1-8]/
		var rookre = /^R[0-9]?[a-z]+[1-8]/
		var lCastlere = /^(0|O)-(0|O)-(0|O)/i
		var sCastlere = /^(0|O)-(0|O)/i
		var kingre = /^K[a-z]+[1-8]/
		var prom = ""
		
		var toCoords = getSquare(to)
		var fromCoords, from, to, result, tmp, myMove = null
		if (pawnre.test(to)) {
			// let see if it is a promotional move
			if (/^[a-z]+[1-8]=[A-Z]/.test(to))
				prom = to.charAt(to.indexOf('=')+1)
				fromCoords = findFromPawn(this.vBoard, to, color)
			}
			else if (knightre.test(to)) {
				fromCoords = findFromKnight(this.vBoard, to, color)
			}
			else if (bishre.test(to)) {
				fromCoords = findFromBish(this.vBoard, to, color)
			}
			else if (queenre.test(to)) {
				fromCoords = findFromQueen(this.vBoard, to, color) 
			}
			else if (rookre.test(to)) {
				fromCoords = findFromRook(this.vBoard, to, color)
			}
			else if (kingre.test(to)) {
				fromCoords = findFromKing(this.vBoard, to, color)   
			}
			else if (sCastlere.test(to)) {
				var bCoords = new Array('e8','g8','h8','f8')
				var wCoords = new Array('e1','g1','h1','f1')
				
				if (lCastlere.test(to)) {
						bCoords = new Array('e8', 'c8', 'a8', 'd8')
						wCoords = new Array('e1', 'c1', 'a1', 'd1')
				}
				var coords = color=='white'?wCoords:bCoords
				
				fromCoords = getSquare(coords[0])
				toCoords = getSquare(coords[1])
				
				from = this.vBoard[fromCoords[0]][fromCoords[1]]
				to = this.vBoard[toCoords[0]][toCoords[1]]
				
				result = movePiece(from, to, prom)
				
				myMove = new MyMove()
				myMove.oPiece = result[2].piece
				myMove.oColor = result[2].color
				myMove.pPiece = result[3]

				myMove.add(new MySquare(fromCoords[0], fromCoords[1]
													,result[0].piece, result[0].color))
			
				myMove.add(new MySquare(toCoords[0], toCoords[1]
													,result[1].piece, result[1].color))

				fromCoords = getSquare(coords[2])
				toCoords = getSquare(coords[3])
			}
			else {
				alert("can't figure out which piece to move "+to)   
			}
			from = this.vBoard[fromCoords[0]][fromCoords[1]]
			to = this.vBoard[toCoords[0]][toCoords[1]]
			
			result = movePiece(from, to ,prom)
			// in case of castling we don't have a null value
			if (!myMove)
				 myMove = new MyMove()
			
			myMove.oPiece = result[2].piece
			myMove.oColor = result[2].color
			myMove.pPiece = result[3]

			myMove.add(new MySquare(fromCoords[0], fromCoords[1]
													,result[0].piece, result[0].color))
			
			myMove.add(new MySquare(toCoords[0], toCoords[1]
													,result[1].piece, result[1].color))
			
			return myMove
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
		function findFromPawn(pos, to, color) {
			var tmp = getSquare(to)
			var x = tmp[1], y = tmp[0]
       
			if (tmp[2][0] != -1 || tmp[3] != -1) {
				var froms = new Array(
					new Array(tmp[0]+1,tmp[1]-1),
					new Array(tmp[0]+1,tmp[1]+1),
					new Array(tmp[0]-1,tmp[1]-1),
					new Array(tmp[0]-1,tmp[1]+1)
				)
              
				for(var i = 0;i<froms.length;i++) {
					try {
						if (pos[froms[i][0]][froms[i][1]].piece == 'pawn'
								&& pos[froms[i][0]][froms[i][1]].color == color)
								
								return new Array(froms[i][0], froms[i][1])
					}
					catch (e) {}
				}
			}
			else {
				try {
					for(var i = 0; i < 8; i++) {
						if (pos[i][x].piece == 'pawn' 
								&& pos[i][x].color == color) {
								
								return new Array(i, x);
						}
					}
				}
				catch (e) {}
			}
			alert('Could not find a move with a pawn')
		}

        /*
          Find the bishop from location.
        */
        function findFromBish(pos, to, color) {
					var oldTo = to
          to = getSquare(to)
          var rtrn
             for(var i = 0;i < 8; i++) {
							 // diagonal down right
               try {
                  var coord = pos[to[0]+i][to[1]+i]
									//alert(oldTo+" '"+coord.color+"' and "+coord.piece+" looking '"+color+"' "+(coord.color==color)+" "+(coord.piece=='bishop'))
									//alert(coord.color==color+" and "+coord.piece)
                  if (coord.piece == 'bishop'
                     && coord.color == color) {
                     return new Array(to[0]+i, to[1]+i)
                  }
               }
               catch (e) {}
               
               try {
                  var coord = pos[to[0]-i][to[1]-i]
                  if (coord.piece == 'bishop'
                     && coord.color == color) {
                     return new Array(to[0]-i, to[1]-i)
                  }
               }
               catch (e) {}
               
               try {
                  var coord = pos[to[0]+i][to[1]-i]
                  if (coord.piece == 'bishop'
                     && coord.color == color) {
                     return new Array(to[0]+i, to[1]-i)
                  }
               }
               catch (e) {}
               
               try {
                  var coord = pos[to[0]-i][to[1]+i]
                  if (coord.piece == 'bishop'
                     && coord.color == color) {
                     return new Array(to[0]-i, to[1]+i)
                  } 
               }
               catch (e) {}
             } 
          alert('No move found for the bishop '+oldTo)
        }

        /* 
          Find the king from location.
        */
        function findFromKing(pos, to, color) {
          to = getSquare(to)
          var froms = new Array(
            new Array(to[0], to[1]+1),
            new Array(to[0], to[1]-1),
            new Array(to[0]+1, to[1]),
            new Array(to[0]-1, to[1]),

            new Array(to[0]+1, to[1]+1),
            new Array(to[0]+1, to[1]-1),
            new Array(to[0]-1, to[1]+1),
            new Array(to[0]-1, to[1]-1) 
           )

          for(var i=0;i<froms.length;i++) {
            try {
              var tmp = pos[froms[i][0]][froms[i][1]]
              if (tmp.piece == 'king' && tmp.color == color)
                return froms[i]
            }
            catch (e) {}
          }
          alert('No king move found')
        }

        /* 
          Find the queen's from location.
        */
        function findFromQueen(pos, to, color) {
          to = getSquare(to) 

          // the lines
          for (var i = 0; i < 8; i++) {
             var tmp
             
             try {
              tmp = pos[i][to[1]]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(i, to[1])
             }
             catch (e) {}

             try {
              tmp = pos[to[0]][i]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(to[0],i)
             }
             catch (e) {}
             
             try {
              tmp = pos[to[0]+i][to[1]+i]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(to[0]+i, to[1]+i)
             }
             catch (e) {}

             try {
              tmp = pos[to[0]-i][to[1]-i]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(to[0]-i,to[1]-i)
             }
             catch (e) {}
             
             try {
              tmp = pos[to[0]+i][to[1]-i]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(to[0]+i, to[1]-i)
             }
             catch (e) {}
             
             try {
              tmp = pos[to[0]-i][to[1]+i]
              if (tmp.piece == 'queen' && tmp.color == color)
                 return new Array(to[0]-i, to[1]+i)
             }
             catch (e) {}
          }

        }

        /* 
          Find the rook's from location.
        */
        function findFromRook(pos, to, color) {
          to = getSquare(to)
          var extra = to[2]
          var froms = new Array()

          for(var i = 0;i < 8; i++) {
            froms[froms.length] = new Array(to[0], i)
            froms[froms.length] = new Array(i,to[1])
          }
          
          var rtrns = new Array();
          for (var i=0;i<froms.length;i++) {
             var tmp = pos[froms[i][0]][froms[i][1]]
             if (tmp.piece == 'rook' && tmp.color == color){
              if (extra[0] != -1 && froms[i][1] != extra[0]) {
                continue;
              }
              else if(extra[1] != -1 && froms[i][0] != extra[1]) {
                continue;
              }
              rtrns[rtrns.length] = froms[i]
             }
          }
          
          if (rtrns.length<2) {
             return rtrns[0]
          }
          else {
             var a = rtrns[0]
             var b = rtrns[1]
             // if on the same row/line, the closes has to move
             // this is a case where no extra information about
             // the rook to move is given, the closest moves
             if (Math.abs(to[0]-a[0]) < Math.abs(to[0]-b[0])
                || Math.abs(to[1]-a[1]) < Math.abs(to[1]-b[1])) {
              return a
             }
             else {
                //alert("2nd "+to+" ... " + a + " ... " + b)
              return b
             }
          }
          alert('No rook move found')
        }

        /* 
          Find the knight's from location.
        */
        function findFromKnight(pos, to, color) {
           to = getSquare(to)
           var extra = to[2]
           var froms = new Array(
            new Array(to[0]+2, to[1]+1),
            new Array(to[0]+2, to[1]-1),
            
            new Array(to[0]-2, to[1]+1),
            new Array(to[0]-2, to[1]-1),

            new Array(to[0]+1, to[1]+2),
            new Array(to[0]-1, to[1]+2),

            new Array(to[0]+1, to[1]-2),
            new Array(to[0]-1, to[1]-2)
           )
           
           for (var i = 0;i<froms.length;i++) {
             try{
              var tmp = pos[froms[i][0]][froms[i][1]]
              if (tmp.piece == 'knight' && tmp.color == color) {
                 if (extra[0] != -1 && froms[i][1] != extra[0]) {
                  continue;
                 }
                 else if(extra[1] != -1 && froms[i][0] != extra[1]) {
                  continue;
                 }
                 return new Array(froms[i][0], froms[i][1])
              }
             }
             catch (e) {}
           }
           alert('No knight move found')
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
        		throw "Wrong number of arguments"
        	}
          var map = new Object();
          // if only from certain file we can make the move
          var extra = new Array(-1,-1)
          var taking = -1
          map['a'] = 7, map['b'] = 6, map['c'] = 5;
          map['d'] = 4, map['e'] = 3, map['f'] = 2;
          map['g'] = 1, map['h'] = 0;
          
          // trim the everything from +
          if (coord.indexOf("+") != -1)
            coord = coord.substring(0, coord.indexOf("+"))
          // let's trim the piece prefix
          if (/^[A-Z]/.test(coord))
            coord = coord.substring(1)
          // the move is a taking move, we have to look for different
          // files then with pawns
          if (/x/.test(coord)) {
            var tmp = coord.split("x")   
            coord = tmp[1]
            taking = 7-map[tmp[0]]
          }
          // we have extra information on the from file
          // eg Rbd7
          if (/^[a-z]{2,2}/.test(coord)) {
             extra[0] = 7-map[coord.substring(0,1)]
             coord = coord.substring(1)
          }

          // we have the row no also
          if (/^[0-9][a-z][0-9]/.test(coord)) {
            extra[1] = 8-coord.substring(0,1)
            coord = coord.substring(1)
          }

          var rtrn = new Array(8-coord.charAt(1),
															7-map[coord.charAt(0)],
															extra, taking)
					return rtrn;
        }
        
				movePiece = function(from, to, prom) {
					var hist = to.clone()
					var tmpPiece = from.piece
					var pPiece = null
					
					to.piece = from.piece
					to.color = from.color

					from.piece = null
					from.color = null

          // promoting the piece
					if (prom.length>0) {
						var image = new Image();
						pPiece = tmpPiece

						switch(prom) {
							case 'R':
								to.piece = 'rook'
								break
							case 'B':
								to.piece = 'bishop'
								break
							case 'N':
								to.piece = 'knight'
								break
							case 'Q':
								to.piece = 'queen'
								break
							default:
								alert('Unknown promotion')
						}
					}	 
					return new Array(from, to, hist, pPiece)
				}
	}
      
      function MyMove() {
        this.actions = new Array()
				this.oPiece = null
				this.oColor = null
				// in case of promotion have to remember the prev
				// piece
				this.pPiece = null

				this.add = function(action) {
					 this.actions[this.actions.length] = action
				}

				this.toString = function() {
					return "MyMove -- no. actions "+this.actions.length	 
				}
      }
      
      function MySquare(x, y, piece, color) {
        var colors = new Array('white','black')
        var pieces = new Array('rook')
        
        this.x = x
        this.y = y
        this.color = color
        this.piece = piece

				this.toString = function() {
					return "MySquare -- x = "+this.x+" y="+this.y
								+" color="+this.color
								+ " piece="+this.piece
				}

				this.clone = function() {
					var sq = new MySquare(this.x, this.y,
																this.piece, this.color)	 
					return sq
				}
      }
