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

	function Board(divId) {
		var pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);
		this.conv = new Converter(pgn)
		this.conv.convert()

		this.flipped = false
		this.id = (new Date()).getTime()
		window[this.id] = this

		// static
		this.imagePrefix = "img/"
		if (arguments.length == 2)
			 this.imagePrefix = arguments[1]
		var imageNames = {
			"white" : {"rook":"wRook.gif"
								 ,"bishop":"wBishop.gif"
								 ,"knight":"wKnight.gif"
								 ,"queen":"wQueen.gif"
								 ,"king":"wKing.gif"
								 ,"pawn":"wPawn.gif"}
            
			,"black" : {"rook":"bRook.gif"
								 ,"bishop":"bBishop.gif"
								 ,"knight":"bKnight.gif"
								 ,"queen":"bQueen.gif"
								 ,"king":"bKing.gif"
								 ,"pawn":"bPawn.gif"}
			,"btns" : {"ffward":"buttons/ffward.gif"
									,"rwind":"buttons/rwind.gif"
									,"forward":"buttons/forward.gif"
									,"back":"buttons/back.gif"
									,"toggle":"buttons/toggle.gif"
									,"flip":"buttons/flip.gif"}
		};
		for ( i in imageNames)
			 for (j in imageNames[i])
					imageNames[i][j] = this.imagePrefix+imageNames[i][j]
		// end of static
		this.pos = new Array()

		for(var i = 0;i<8;i++)
			this.pos[i] = new Array()
      
	 this.init = function() {
		 // the main frame
		 var boardFrame = document.getElementById(divId+"_board");
		 
		 // toplevel table
		 var topTable = document.createElement("table")
		 var topTableTb = document.createElement("tbody")
		 topTable.appendChild(topTableTb)
		 
		 topTable.style.border = "1px solid #000000"

		 var boardTd = document.createElement("td")
		 var btnTd = document.createElement("td")
		 var propsTd = document.createElement("td")
		 
		 // movesTable
		 var movesTd = document.createElement("td")
		 this.movesTd = movesTd
		 movesTd.style.width = "400px"
		 movesTd.rowSpan = 3
		 movesTd.valign = "top"
		 
		 var tmp = document.createElement("tr")
		 tmp.appendChild(boardTd)
		 //tmp.appendChild(movesTd)
		 topTableTb.appendChild(tmp)

		 topTableTb.appendChild(document.createElement("tr")).appendChild(btnTd)
		 topTableTb.appendChild(document.createElement("tr")).appendChild(propsTd)


		 var board = document.createElement("table")
		 var boardTb = document.createElement("tbody")
		 board.appendChild(boardTb)
		 
		 board.style.top = boardFrame.style.top;
		 board.style.left = boardFrame.style.left;
		 board.style.borderCollapse = "collapse"
		 
		 boardFrame.appendChild(topTable);
		 boardTd.appendChild(board)
		 
		 var width = 31;
		 var height = 31;

		 // white pieces
		 for(var i = 0; i < 8; i++) {
				var tr = document.createElement("tr")
				var flip = (i % 2)?1:0;
				for(var j = 0; j < 8; j++) {
				 var td = document.createElement("td")   

				 td.style.height = height+"px"
				 td.style.width = width+"px"
				 td.style.border = "1px solid #000000"
				 td.style.padding = "0px"
				 var color = !flip?(j%2)?"#4b4b4b":"#ffffff":!(j%2)?"#4b4b4b":"#ffffff";
				 
				 td.style.background = color

				 this.pos[i][j] = td;
				 tr.appendChild(td)
				}
				boardTb.appendChild(tr)
		 }
		 this.populatePieces()
		 this.populateProps(propsTd)
		 this.populateMoves(movesTd)
	 
		 // in java i could do Board.this in anon function
		 var tmp = this
		 // button td
		 btnTd.align = 'center'

		 // rwnd
		 var hrefS = document.createElement("a")
		 hrefS.href = "javascript:void(0)"
		 var href = hrefS.cloneNode(false)
		 var input = this.getImg("rwind","btns")
		 href.appendChild(input)
		 
		 input.onclick = function() {
				startPosition(tmp)
		 }
		 btnTd.appendChild(href)

		 // back
		 input = this.getImg("back","btns")
		 href = hrefS.cloneNode(false)
		 href.appendChild(input)
		 
		 input.onclick = function() {
			makeBwMove(tmp)
		 }
			
		 btnTd.appendChild(href)
		
		 // flip the board
		 input = this.getImg("flip","btns")
		 href = hrefS.cloneNode(false)
		 href.appendChild(input)
		 
		 input.onclick = function() {
			flipBoard(tmp)
		 }

		 btnTd.appendChild(href)
		 
		 // hide
		 input = this.getImg("toggle","btns")
		 href = hrefS.cloneNode(false)
		 href.appendChild(input)
		 
		 input.onclick = function() {
			hideMoves(tmp)
		 }

		 //btnTd.appendChild(href)
		 
		 // next btn
		 input = this.getImg("forward","btns")
		 href = hrefS.cloneNode(false)
		 href.appendChild(input)

		 input.onclick = function() {
			makeMove(tmp)
		 }

		 btnTd.appendChild(href)
		 
		 // ffwd
		 input = this.getImg("ffward","btns")
		 href = hrefS.cloneNode(false)
		 href.appendChild(input)

		 input.onclick = function() {
				endPosition(tmp)
		 }
		 btnTd.appendChild(href)
	 }

		flipBoard = function(board) {
			board.deMarkLastMove(true)
			var frst, snd, tmp
			board.flipped = !board.flipped
			for (var i = 0;i<8;i++) {
				for (var j = 0;j<4;j++){
					frst = board.pos[i][j]
					snd = board.pos[7-i][7-j]

					try {
						 tmp = frst.removeChild(frst.firstChild)
					}
					catch (e) {tmp=null}

					try{
						 frst.appendChild(snd.removeChild(snd.firstChild))
					}
					catch (e) {}
					
					if (tmp)
						snd.appendChild(tmp)
				} 
			}
		}

					this.skipToMove = function(no, color) {
						var rNo = no*2+color+1
						if (this.conv.getCurMoveNo()<rNo) {
							 while(this.conv.getCurMoveNo()<rNo)
							 	makeMove(this)
						}
						else if (this.conv.getCurMoveNo()>rNo) {
							while(this.conv.getCurMoveNo()>rNo) {
								 makeBwMove(this)
							}
						}
					}

					endPosition = function(board) {
						board.deMarkLastMove(true)
						var vBoard = board.conv.getEndPos(board.flipped)
						board.syncBoard(vBoard);
						board.conv.resetToEnd()
						board.markLastMove()
					}

					startPosition = function(board) {
						board.deMarkLastMove(true)
						var vBoard = board.conv.getStartPos(board.flipped)
						board.syncBoard(vBoard)
						board.conv.resetToStart()
					}

					makeBwMove = function(board) {
						board.deMarkLastMove(true)
						var move = board.conv.prevMove()
						if (move == null)
							 return;

						for(var i=move.actions.length;i > 1;i-=2) {
							var frst = move.actions[i-1].clone()
							var snd = move.actions[i-2].clone()
							var tmpM = new MySquare()
							tmpM.piece = frst.piece
							tmpM.color = frst.color
							frst.piece = snd.piece
							frst.color = snd.color
							snd.piece = tmpM.piece
							snd.color = tmpM.color

							frst.piece = move.oPiece
							frst.color = move.oColor
							
							if (move.pPiece)
								 snd.piece = move.pPiece

							board.drawSquare(frst)
							board.drawSquare(snd)
						}
						if (move.enP) {
							 var x = move.enP.x, y = move.enP.y
							 if (board.flipped) {
								 x=7-x
								 y=7-y
							}
							var sq = board.pos[x][y]
							sq.appendChild(board.getImg(move.enP.piece, move.enP.color))
						}
						board.markLastMove()
					}

					this.markLastMove = function() {
						try {
							 var move = this.conv.moves[this.conv.iteIndex-1].actions[1]
							 var piece = this.pos[move.x][move.y]
							 if (this.flipped) {
							 	piece = this.pos[7-move.x][7-move.y]
							 }
							 // on konq the bg contains "initial initial initial "
							 // i guess xtra information. Anyways setting the
							 // background to a color containing the "initial"
							 // parts fails. Go figure
							 piece.lastBg = piece.style.background.replace(/initial/g, "")
							 piece.style.background = "#e89292"
						}
						catch (e) {}
					}

					this.deMarkLastMove = function() {
						var move = this.conv.moves[this.conv.iteIndex-2]
						if (arguments.length || !move) {
							move = this.conv.moves[this.conv.iteIndex-1]
						}

						if (move) {
							move = move.actions[1]
							
							var piece = this.pos[move.x][move.y]
							if (this.flipped) 
								piece = this.pos[7-move.x][7-move.y]
							if (piece.lastBg)
								piece.style.background = piece.lastBg
						}
					}

					hideMoves = function(board) {
						if (board.movesTd.style.display != "none") {
							 board.movesTd.style.display = "none"
							 board.movesTd.style.visibility = "hidden"
						}
						else {
							 board.movesTd.style.display = "block"
							 board.movesTd.style.visibility = "visible"
						}
					}

					makeMove = function(board) {
						var move = board.conv.nextMove()
						if (move == null)
							 return;
						
						for(var i=0;i < move.actions.length;i++) {
							board.drawSquare(move.actions[i]);	 
						}
						
						board.drawEnPassante(move)

						board.deMarkLastMove()
						board.markLastMove()
					}

					this.drawEnPassante = function(move) {
						if (!move.enP)
							 return;
						var x = move.enP.x, y = move.enP.y
						if (this.flipped) {
							x = 7-x
							y = 7-y
						}
						var sq = this.pos[x][y]
						
						sq.color = null
						sq.piece = null

						sq.removeChild(sq.firstChild)
					}

					this.drawSquare = function(square) {
						var x = square.x, y = square.y
						if (this.flipped) {
							x=7-x
							y=7-y
						}
						var sq = this.pos[x][y]

						sq.color = square.color
						sq.piece = square.piece

						if (sq.firstChild)
							sq.removeChild(sq.firstChild)

						if (sq.piece) {
							sq.appendChild(this.getImg(sq.piece,sq.color))
						}
					}
         
         /*
         * Draw the board with all the pieces in the initial
         * position
         */
         this.populatePieces = function() {
          // pawns
          for (var i = 0;i < 8; i++) {
						img = this.getImg('pawn','white')
            this.pos[6][i].appendChild(img);
            this.pos[6][i].piece = 'pawn';
            this.pos[6][i].color = 'white';
            
						img = this.getImg('pawn','black')
            this.pos[1][i].appendChild(img);
            this.pos[1][i].piece = 'pawn';
            this.pos[1][i].color = 'black';
          }

         // rooks, bishops, knights
         for(var i = 0; i < 2; i++) {
						img = this.getImg('rook','white')
            this.pos[7][i*7].appendChild(img)
            this.pos[7][i*7].piece = 'rook'
            this.pos[7][i*7].color = 'white'
          
						img = this.getImg('rook','black')
            this.pos[0][i*7].appendChild(img)
            this.pos[0][i*7].piece = 'rook'
            this.pos[0][i*7].color = 'black'
          
						img = this.getImg('knight','white')
            this.pos[7][i*5+1].appendChild(img)
            this.pos[7][i*5+1].piece = 'knight'
            this.pos[7][i*5+1].color = 'white'
         
						img = this.getImg('knight','black')
            this.pos[0][i*5+1].appendChild(img)
            this.pos[0][i*5+1].piece = 'knight'
            this.pos[0][i*5+1].color = 'black'
         
						img = this.getImg('bishop','white')
            this.pos[7][i*3+2].appendChild(img)
            this.pos[7][i*3+2].piece = 'bishop'
            this.pos[7][i*3+2].color = 'white'
         
						img = this.getImg('bishop','black')
            this.pos[0][i*3+2].appendChild(img)
            this.pos[0][i*3+2].piece = 'bishop'
            this.pos[0][i*3+2].color = 'black'
         }
         
					img = this.getImg('queen','white')
					this.pos[7][3].appendChild(img)
					this.pos[7][3].piece = 'queen'
					this.pos[7][3].color = 'white'

					img = this.getImg('king','white')
					this.pos[7][4].appendChild(img)
					this.pos[7][4].piece = 'king'
					this.pos[7][4].color = 'white'

					img = this.getImg('queen','black')
					this.pos[0][3].appendChild(img)
					this.pos[0][3].piece = 'queen'
					this.pos[0][3].color = 'black'

					img = this.getImg('king','black')
					this.pos[0][4].appendChild(img)
					this.pos[0][4].piece = 'king'
					this.pos[0][4].color = 'black'
				}

				this.populateMoves = function(cont) {
					cont.vAlign = "top"
					var tmp2=this.conv.pgn.moves
					var p = document.createElement("p")
					p.style.fontSize = "9pt"
					p.style.fontFace = "Tahoma, Arial, sans-serif"
					p.style.fontWeight = "bold"
					var txt = document.createTextNode(this.conv.pgn.props['White']
										+" - "+this.conv.pgn.props['Black'])
					p.appendChild(txt)
					cont.appendChild(p)

					for (var i = 0;i < tmp2.length;i++) {
						var link = document.createElement("a")
						var tmp = document.createTextNode(tmp2[i].white)
						var tmp3 = document.createElement("b")

						tmp3.style.fontFamily = "Tahoma, Arial, sans-serif"
						tmp3.appendChild(document.createTextNode(" "+(i+1)+". "))
						cont.appendChild(tmp3)
						
						link.href = 'javascript:void(window['+this.id+']'
												+'.skipToMove('+i+','+0+'))'
						link.appendChild(tmp)
						cont.appendChild(link)

						if (tmp2[i].black != null) {
							cont.appendChild(document.createTextNode(" "))
							tmp = document.createTextNode(tmp2[i].black)
							link = document.createElement("a")
							link.appendChild(tmp)
							link.href = 'javascript:void(window['+this.id+']'
												+'.skipToMove('+i+','+1+'))'
							cont.appendChild(link)
						}
					}
					txt = document.createTextNode("  "+this.conv.pgn.props['result'])
					tmp2 = document.createElement("b")
					tmp2.appendChild(txt)
					cont.appendChild(tmp2)
				}

				this.populateProps = function(container) {
					// init the style
					var tdS = document.createElement('td')
					tdS.style.fontFamily = "Tahoma, Arial, sans-serif"
					tdS.style.fontSize = "8pt"
					tdS.align = 'center'
					// end of init the style
					
					var tbl = document.createElement('table')
					var tblTb = document.createElement("tbody")
					tbl.appendChild(tblTb)

					tbl.width = "100%"
					container.appendChild(tbl)
					
					// white - black
					var tr = document.createElement('tr')
					tblTb.appendChild(tr)
					
					var td = tdS.cloneNode(false)
					td.style.fontWeight = "bold"
					tr.appendChild(td)

					var txt = document.createTextNode('')
					txt.nodeValue = this.conv.pgn.props['White']+" - "+
													this.conv.pgn.props['Black']
					td.appendChild(txt)
					//
					
					// ELO
					tr = document.createElement('tr')
					tblTb.appendChild(tr)
					
					td = tdS.cloneNode(false)
					tr.appendChild(td)

					txt = document.createTextNode('')
					txt.nodeValue = this.conv.pgn.props['WhiteElo']+" - "+
													this.conv.pgn.props['BlackElo']
					td.appendChild(txt)
					//
					
					// Date 
					tr = document.createElement('tr')
					tblTb.appendChild(tr)
					
					td = tdS.cloneNode(false)
					tr.appendChild(td)

					txt = document.createTextNode('')
					txt.nodeValue = this.conv.pgn.props['Event']+", "
													+this.conv.pgn.props['Date']
					td.appendChild(txt)
					//

					return;

					// white - black
					var td = document.createElement('td')
					tr.appendChild(td)
					td.appendChild(document.createTextNode(
						this.conv.pgn.props['White']
					))
					td.align = 'right'
					
					td = document.createElement('td')
					td.appendChild(document.createTextNode(
						this.conv.pgn.props['Black']
					))
					tr.appendChild(td)
					// end of white - black
					
					// white - black
					tr = document.createElement('tr')
					tblTb.appendChild(tr)
					
					td = document.createElement('td')
					td.width = "50%"
					tr.appendChild(td)
					td.appendChild(document.createTextNode(
						this.conv.pgn.props['WhiteElo']
					))
					td.align = 'right'
					
					td = document.createElement('td')
					td.appendChild(document.createTextNode(
						this.conv.pgn.props['BlackElo']
					))
					tr.appendChild(td)
					// end of white - black
					
					var p =document.createTextNode('')
				}

				this.getImg = function(piece, color) {
					var img = new Image()
					img.src = imageNames[color][piece]
					img.border = 0
					
					return img
				}

				this.syncBoard = function(result) {
					for(var i=0;i<8;i++) {
						for(var j=0;j<8;j++) {
							this.syncSquare(result[i][j]
													,this.pos[i][j])
						}
					}
				}

				this.syncSquare = function(from, to) {
					to.piece = from.piece
					to.color = from.color

					if (to.firstChild)
						 to.removeChild(to.firstChild)
					if (to.piece) {
						to.appendChild(this.getImg(to.piece, to.color))
					}
				}

				function setUp(board, divId) {
					var pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);
					var conv = new Converter(pgn)
					conv.convert()      
					 
					var brd = new Board(conv)
					brd.init()
				}
			}
