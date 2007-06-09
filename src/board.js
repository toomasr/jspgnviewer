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

	function Board(divId, options) {
		var pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);
		this.conv = new Converter(pgn);
		this.conv.convert();
		this.movesOnPane = new Array();

		this.flipped = false;
		this.id = (new Date()).getTime();
		window[this.id] = this;
		if (!options)
			options={};
		this.moveInput = null;
		this.lastBold = null;
		this.lastBoldIdx = null;
		this.lastSquare = null;
		this.visuals = {"pgn":{}};

		this.opts = [];
		this.opts['imagePrefix'] = "img/default/";
		this.opts['moveFontSize'] = "8pt";
		this.opts['moveFontColor'] = "#537c3a";
		this.opts['moveFont'] = 'Tahoma, Arial, sans-serif';

		this.opts['commentFontSize'] = "8pt";
		this.opts['commentFontColor'] = "#6060df";
		this.opts['commentFont'] = 'Tahoma, Arial, sans-serif';
		
		this.opts['boardSize'] = '257px';
		this.opts['squareSize'] = '31px';
			
		this.opts['blackSqColor'] = "#4b4b4b";
		this.opts['whiteSqColor'] = "#ffffff";
		this.opts['flipped'] = false;
		this.opts['showMovesPane'] = true;

		var optionNames = ['flipped', 'moveFontSize', 'moveFontColor',
										'moveFont', 'commentFontSize',
										'commentFontColor', 'commentFont',
										'boardSize', 'squareSize',
										'blackSqColor', 'whiteSqColor',
										'imagePrefix', 'showMovesPane',
										'movesPaneWidth'];

		// if keys in options define new values then
		// set the this.opts for that key with the 
		// custom value
		for (var i=0;i<optionNames.length;i++) {
			if (options && typeof(options[optionNames[i]]) != 'undefined') {
				this.opts[optionNames[i]] = options[optionNames[i]];
			}
		}
		
		var brdI = new BoardImages();
		var imageNames = brdI.imageNames['default'];
		brdI = null;
		// end of static
		this.pos = new Array();

		for(var i = 0;i<8;i++)
			this.pos[i] = new Array();

		this.init = function() {
			// the main frame
			var boardFrame = document.getElementById(divId+"_board");

			var mainTable = document.createElement("table");
			mainTable.border = 0;
			var mainTableTb = document.createElement("tbody");
			mainTable.appendChild(mainTableTb);
			mainTable.style.border = "1px solid #000000";
			var tmp = document.createElement("tr");
			mainTableTb.appendChild(tmp);
			var topLeftTd = document.createElement("td");
			topLeftTd.vAlign = "top";
			topLeftTd.style.width = this.opts['boardSize'];
			tmp.appendChild(topLeftTd);
			var topRightTd = document.createElement("td");
			topRightTd.vAlign = "top";
			tmp.appendChild(topRightTd);

			// toplevel table;
			var topTable = document.createElement("table");
			topLeftTd.appendChild(topTable);
			topTable.border = 0;
			var topTableTb = document.createElement("tbody");
			topTable.appendChild(topTableTb);
			
			var boardTd = document.createElement("td");
			boardTd.style.width = this.opts['boardSize'];
			boardTd.style.height = this.opts['boardSize'];
			boardTd.vAlign = "top";
			var btnTdNext = document.createElement("td");
			btnTdNext.vAlign = 'top';
			btnTdNext.align = 'center';
			btnTdNext.style.height = '10px';
			var btnTd = document.createElement("td");
			btnTd.vAlign = 'top';
			btnTd.style.height = '10px';
			var propsTd = document.createElement("td");
			propsTd.style.height = '10px';
			
			// movesTable
			var movesTd = document.createElement("td");
			this.movesTd = movesTd;
			if (this.opts['movesPaneWidth'])
				movesTd.style.width = this.opts['movesPaneWidth'];
			else
				movesTd.style.overflow = "hidden";
			movesTd.vAlign = "top";
			topRightTd.appendChild(movesTd);
			
			var tmp = document.createElement("tr");
			tmp.style.height = "0%";
			tmp.appendChild(boardTd);
			topTableTb.appendChild(tmp);

			topTableTb.appendChild(document.createElement("tr")).appendChild(btnTd);
			topTableTb.appendChild(document.createElement("tr")).appendChild(btnTdNext);
			topTableTb.appendChild(document.createElement("tr")).appendChild(propsTd);
			tmp = document.createElement("td");
			var tmpStr = document.createTextNode("");
			tmp.style.height = "auto";
			tmp.appendChild(tmpStr);
			topTableTb.appendChild(document.createElement("tr")).appendChild(tmp);


			var board = document.createElement("table");
			var boardTb = document.createElement("tbody");
			board.appendChild(boardTb);

			board.style.top = boardFrame.style.top;
			board.style.left = boardFrame.style.left;
			board.style.borderCollapse = "collapse";

			boardFrame.appendChild(mainTable);
			boardTd.appendChild(board);
			
			var whiteC = this.opts['whiteSqColor'];
			var blackC = this.opts['blackSqColor'];

			// white pieces
			for(var i = 0; i < 8; i++) {
				var tr = document.createElement("tr");
				var flip = (i % 2)?1:0;
				for(var j = 0; j < 8; j++) {
					var td = document.createElement("td");

					td.style.height = this.opts['squareSize'];
					td.style.width = this.opts['squareSize'];
					td.style.border = "1px solid #000000";
					td.style.padding = "0px";
					td.vAlign = "middle";
					td.align = "center";
					var color = !flip?(j%2)?blackC:whiteC:!(j%2)?blackC:whiteC;
					
					td.style.background = color;

					this.pos[i][j] = td;
					tr.appendChild(td);
				}
				boardTb.appendChild(tr);
			}
			this.populatePieces();
			if (this.opts['flipped'])
				flipBoard(this);
			this.populateProps(propsTd);
			this.populateMoves(movesTd);

			// in java i could do Board.this in anon function;
			var tmp = this;
			// button td
			btnTd.align = 'center';
			btnTd.valign = 'middle';

			// rwnd;
			var hrefS = document.createElement("a");
			hrefS.href = "javascript:void(0)";
			var href = hrefS.cloneNode(false);
			var input = this.getImg("rwind","btns");
			input.alt = 'Rewind to the beginning';
			input.title = 'Rewind to the beginning';
			href.appendChild(input);
			
			input.onclick = function() {
				startPosition(tmp);
			};
			btnTd.appendChild(href);

			// back
			input = this.getImg("back","btns");
			input.alt = 'One move back';
			input.title = 'One move back';
			href = hrefS.cloneNode(false);
			href.appendChild(input);
			
			input.onclick = function() {
				makeBwMove(tmp);
			};

			btnTd.appendChild(href);
			
			// flip the board
			input = this.getImg("flip","btns");
			input.alt = 'Flip the board';
			input.title = 'Flip the board';
			href = hrefS.cloneNode(false);
			href.appendChild(input);
			
			input.onclick = function() {
				flipBoard(tmp);
			};

			btnTd.appendChild(href);

			// current move
			// it is initialized in updateMoveInfo
			var input = document.createElement("input");
			input.style.fontSize = "7pt";
			input.size = "9";
			input.style.border = "0px solid #000000";
			input.style.textAlign = 'center';
			this.moveInput = input;
			btnTdNext.appendChild(input);
			// end of current move

			// hide
			input = this.getImg("toggle","btns");
			input.alt = 'Show moves pane';
			input.title = 'Show moves pane';
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
				toggleMoves(tmp, "flip");
			};

			btnTd.appendChild(href);

			// next btn
			input = this.getImg("forward","btns");
			input.alt = 'Play one move';
			input.title = 'Play one move';
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
				makeMove(tmp);
			};

			btnTd.appendChild(href);

			// ffwd
			input = this.getImg("ffward","btns");
			input.alt = 'Fast-forward to the end';
			input.title = 'Fast-forward to the end';
			href = hrefS.cloneNode(false);
			href.appendChild(input);

			input.onclick = function() {
					endPosition(tmp);
			};
			btnTd.appendChild(href);
			updateMoveInfo(this);
	 };

		flipBoard = function(board) {
			board.deMarkLastMove(true);
			var frst, snd, tmp;
			board.flipped = !board.flipped;
			for (var i = 0;i<8;i++) {
				for (var j = 0;j<4;j++){
					frst = board.pos[i][j];
					snd = board.pos[7-i][7-j];

					try {
						 tmp = frst.removeChild(frst.firstChild);
					}
					catch (e) {tmp=null}

					try{
						 frst.appendChild(snd.removeChild(snd.firstChild));
					}
					catch (e) {}
					
					if (tmp)
						snd.appendChild(tmp);
				}
			}
		};

					this.skipToMove = function(no, color) {
						var rNo = no*2+color+1;
						if (this.conv.getCurMoveNo()<rNo) {
							var i = 0;
							while(this.conv.getCurMoveNo()<rNo && i < 200) {
								makeMove(this, true);
								i++;
							}
							updateMoveInfo(this);
							updateMovePane(this);
							this.deMarkLastMove();
							this.markLastMove();
						}
						else if (this.conv.getCurMoveNo()>rNo) {
							var i = 0;
							while(this.conv.getCurMoveNo()>rNo && i < 200) {
								makeBwMove(this, true);
								i++;
							};
							updateMoveInfo(this);
							updateMovePane(this);
							this.deMarkLastMove();
							this.markLastMove();
						}
					};

					endPosition = function(board) {
						board.deMarkLastMove();
						var vBoard = board.conv.getEndPos(board.flipped);
						board.syncBoard(vBoard);;
						board.conv.resetToEnd();
						updateMoveInfo(board);
						updateMovePane(board, true);
						board.markLastMove();
					};

					this.startPosition = function() {
						startPosition(this)
					};

					startPosition = function(board) {
						board.deMarkLastMove(true);
						var vBoard = board.conv.getStartPos(board.flipped);
						board.syncBoard(vBoard);
						board.conv.resetToStart();
						updateMoveInfo(board);
						updateMovePane(board);
					};

					makeBwMove = function(board, noUpdate) {
						var move = board.conv.prevMove();
						if (move == null)
							 return;
						
						if (!noUpdate) {
							board.deMarkLastMove(true);
							board.markLastMove();
							updateMoveInfo(board);
							updateMovePane(board, true);
						}

						for(var i=move.actions.length;i > 1;i-=2) {
							var frst = move.actions[i-1].clone();
							var snd = move.actions[i-2].clone();
							var tmpM = new MySquare();
							tmpM.piece = frst.piece;
							tmpM.color = frst.color;
							frst.piece = snd.piece;
							frst.color = snd.color;
							snd.piece = tmpM.piece;
							snd.color = tmpM.color;

							frst.piece = move.oPiece;
							frst.color = move.oColor;

							if (move.pPiece)
								 snd.piece = move.pPiece;

							board.drawSquare(frst);
							board.drawSquare(snd);
						}
						if (move.enP) {
							 var x = move.enP.x, y = move.enP.y;
							 if (board.flipped) {
								 x=7-x;
								 y=7-y;
							}
							var sq = board.pos[x][y];
							sq.appendChild(board.getImg(move.enP.piece, move.enP.color));
						}
					};

					this.markLastMove = function() {
						try {
							var move = this.conv.moves[this.conv.iteIndex-1].actions[1];;
							var piece = this.pos[move.x][move.y];
							if (this.flipped) {
								piece = this.pos[7-move.x][7-move.y];
							}
							// on konq the bg contains "initial initial initial "
							// i guess xtra information. Anyways setting the
							// background to a color containing the "initial"
							// parts fails. Go figure
							piece.lastBg = piece.style.background.replace(/initial/g, "");
							piece.style.background = "#e89292";
							this.lastSquare = piece;
						}
						catch (e) {}
					};

					this.deMarkLastMove = function() {
						var move = this.conv.moves[this.conv.iteIndex-2];
						if (arguments.length && arguments[0]) {
							move = this.conv.moves[this.conv.iteIndex-1];
						}
						
						if (this.conv.iteIndex+1 == this.conv.moves.length)
							 move = this.conv.getCurMove();

						if (move) {
							move = move.actions[1];
							
							var piece = this.pos[move.x][move.y];
							if (this.flipped)
								piece = this.pos[7-move.x][7-move.y];
							if (piece.lastBg)
								piece.style.background = piece.lastBg;
						}
						if (this.lastSquare && this.lastSquare.lastBg) {
							this.lastSquare.style.background = this.lastSquare.lastBg;
							this.lastSquare = null;
						}
					};

					/*
						Toggle moves pane, actually not toggle but
						showing it depending the 'flag'.
					*/
					this.toggleMoves = function(flag) {
						if (flag == "flip")
							flag = this.movesTd.style.visibility=="hidden";
						if (flag) {
							this.movesTd.style.display = "block";
							this.movesTd.style.visibility = "visible";
						}
						else {
							this.movesTd.style.display = "none";
							this.movesTd.style.visibility = "hidden";
						}
					};

					/*
						Non-member toggle function. The onClick that I'm
						setting must not be a member function. I'm just
						using it to proxy.
					*/
					toggleMoves = function(board, flag) {
						board.toggleMoves(flag);
					};

					updateMoveInfo = function(board) {
						var idx = board.conv.getCurMoveNo()-1;
						if (board.conv.getCurMoveNo() == board.conv.moves.length-1)
							idx = board.conv.getCurMoveNo();
						var move = board.conv.moves[idx];
						if (move && move.moveStr) {
							 var str = Math.floor((idx==0?1:idx)/2+1)+". "+move.moveStr;
							 board.moveInput.value = str;
						}
						else
							 board.moveInput.value = "...";
					};

					makeMove = function(board, noUpdate) {
						var move = board.conv.nextMove();
						if (move == null)
							 return;
						
						if (!noUpdate) {
							 board.deMarkLastMove();
							 board.markLastMove();

							 updateMoveInfo(board);
							 updateMovePane(board);
						}
						
						for(var i=0;i < move.actions.length;i++) {
							board.drawSquare(move.actions[i]);
						}
						
						board.drawEnPassante(move);
					};

					updateMovePane = function(board, bw) {
						// highlight the move in the move's pane
						var idx = board.conv.getCurMoveNo();
						board.movesOnPane[this.lastBoldIdx] = deMakeBold(this.lastBold);
						if (bw)
							 idx+=1;
						this.lastBold = null;
						this.lastBoldIdx = null;
						if (board.movesOnPane[idx-1]) {
							board.movesOnPane[idx-1] = makeBold(board.movesOnPane[idx-1]);
							this.lastBold = board.movesOnPane[idx-1];
							this.lastBoldIdx = idx-1;
						}
					};

					makeBold = function(el) {
						var b = document.createElement("b");
						b.appendChild(el.cloneNode(true));
						el.parentNode.replaceChild(b, el);
						return b;
					};

					deMakeBold = function(el) {
						if (!el)
							 return;
						var rtrn = el.firstChild.cloneNode(true);
						el.parentNode.replaceChild(rtrn, el);
						return rtrn;
					};

					this.drawEnPassante = function(move) {
						if (!move.enP)
							 return;
						var x = move.enP.x, y = move.enP.y;
						if (this.flipped) {
							x = 7-x;
							y = 7-y;
						}
						var sq = this.pos[x][y];
						
						sq.color = null;
						sq.piece = null;

						sq.removeChild(sq.firstChild);
					};

					this.drawSquare = function(square) {
						var x = square.x, y = square.y;
						if (this.flipped) {
							x=7-x;
							y=7-y;
						}
						var sq = this.pos[x][y];

						sq.color = square.color;
						sq.piece = square.piece;

						if (sq.firstChild)
							sq.removeChild(sq.firstChild);

						if (sq.piece) {
							sq.appendChild(this.getImg(sq.piece,sq.color));
						}
					};

					this.updatePGNInfo = function() {
						if (this.conv.pgn.props['White'])
							this.visuals['pgn']['players'].nodeValue = 
									this.conv.pgn.props['White']+" - "+
									this.conv.pgn.props['Black'];
						if (this.visuals['pgn']['WhiteElo'])
							this.visuals['pgn']['elos'].nodeValue = 
									this.conv.pgn.props['WhiteElo']+" - "+
									this.conv.pgn.props['BlackElo'];
						if (this.visuals['pgn']['Event'])
							this.visuals['pgn']['event'].nodeValue =
									this.conv.pgn.props['Event']+", "
									+this.conv.pgn.props['Date'];
					};

					this.updateSettings = function() {
						var blacks = this.opts['blackSqColor'];
						var whites = this.opts['whiteSqColor'];
						
						for(var i=0;i<8;i++){
							var flip = (i%2)?true:false;
							for(var j=0;j<8;j++){
								var color = flip?(j%2)?whites:blacks:!(j%2)?whites:blacks;
								this.pos[i][j].style.background = color;
							}
						}
					};

					/*
					 * Draw the board with all the pieces in the initial
					 * position
					*/
					this.populatePieces = function() {
					// pawns
					for (var i = 0;i < 8; i++) {
						img = this.getImg('pawn','white');
						this.pos[6][i].appendChild(img);
						this.pos[6][i].piece = 'pawn';
						this.pos[6][i].color = 'white';
            
						img = this.getImg('pawn','black');
						this.pos[1][i].appendChild(img);
						this.pos[1][i].piece = 'pawn';
						this.pos[1][i].color = 'black';
					}

					// rooks, bishops, knights
					for(var i = 0; i < 2; i++) {
						img = this.getImg('rook','white');
						this.pos[7][i*7].appendChild(img);
						this.pos[7][i*7].piece = 'rook';
						this.pos[7][i*7].color = 'white';

						img = this.getImg('rook','black');
						this.pos[0][i*7].appendChild(img);
						this.pos[0][i*7].piece = 'rook';
						this.pos[0][i*7].color = 'black';

						img = this.getImg('knight','white');
						this.pos[7][i*5+1].appendChild(img);
						this.pos[7][i*5+1].piece = 'knight';
						this.pos[7][i*5+1].color = 'white';

						img = this.getImg('knight','black');
						this.pos[0][i*5+1].appendChild(img);
						this.pos[0][i*5+1].piece = 'knight';
						this.pos[0][i*5+1].color = 'black';

						img = this.getImg('bishop','white');
						this.pos[7][i*3+2].appendChild(img);
						this.pos[7][i*3+2].piece = 'bishop';
						this.pos[7][i*3+2].color = 'white';

						img = this.getImg('bishop','black');
						this.pos[0][i*3+2].appendChild(img);
						this.pos[0][i*3+2].piece = 'bishop';
						this.pos[0][i*3+2].color = 'black';
					}

					img = this.getImg('queen','white');
					this.pos[7][3].appendChild(img);
					this.pos[7][3].piece = 'queen';
					this.pos[7][3].color = 'white';

					img = this.getImg('king','white');
					this.pos[7][4].appendChild(img);
					this.pos[7][4].piece = 'king';
					this.pos[7][4].color = 'white';

					img = this.getImg('queen','black');
					this.pos[0][3].appendChild(img);
					this.pos[0][3].piece = 'queen';
					this.pos[0][3].color = 'black';

					img = this.getImg('king','black');
					this.pos[0][4].appendChild(img);
					this.pos[0][4].piece = 'king';
					this.pos[0][4].color = 'black';
				};

				this.populateMoves = function(cont) {
					if (!this.opts['showMovesPane']) {
						 cont.style.visibility="hidden";
						 cont.style.display="none";
					}
					cont.vAlign = "top";
					var tmp2=this.conv.pgn.moves;
					var p = document.createElement("p");
					p.style.fontSize = "9pt";
					p.style.fontFace = "Tahoma, Arial, sans-serif";
					p.style.fontWeight = "bold";
					var txt = document.createTextNode("");
					if (this.conv.pgn.props['White'])
						var txt = document.createTextNode(this.conv.pgn.props['White']
										+" - "+this.conv.pgn.props['Black']);
					p.appendChild(txt);
					cont.appendChild(p);
					
					var link, tmp, tmp3;
					var lastMoveIdx = 0;
					var comment;

					for (var i = 0;i < tmp2.length;i++) {
						link = document.createElement("a");
						tmp = document.createTextNode(tmp2[i].white);
						tmp3 = document.createElement("b");

						tmp3.style.fontFamily = "Tahoma, Arial, sans-serif";
						tmp3.style.fontSize = "8pt";
						tmp3.style.color = "black";
						tmp3.appendChild(document.createTextNode(" "+(i+1)+". "));
						cont.appendChild(tmp3);
						
						link.href = 'javascript:void(window['+this.id+']'
												+'.skipToMove('+i+','+0+'))';
						link.appendChild(tmp);
						link.style.fontFamily = this.opts['moveFont'];
						link.style.fontSize = this.opts['moveFontSize'];
						link.style.color = this.opts['moveFontColor'];
						link.style.textDecoration = "none";
						cont.appendChild(link);

						comment = this.conv.pgn.getComment(tmp2[i].white,lastMoveIdx);
						if (comment[0]) {
							var tmp4 = document.createElement("span");
							tmp4.style.fontFamily = this.opts['commentFont'];
							tmp4.style.fontSize = this.opts['commentFontSize'];
							tmp4.style.color = this.opts['commentFontColor'];
							tmp4.appendChild(document.createTextNode(comment[0]));
							cont.appendChild(tmp4);
							lastMoveIdx = comment[1];
						}

						this.movesOnPane[this.movesOnPane.length] = link;

						if (tmp2[i].black != null) {
							cont.appendChild(document.createTextNode(" "));
							tmp = document.createTextNode(tmp2[i].black);
							link = document.createElement("a");
							link.style.fontFamily = this.opts['moveFont'];
							link.style.fontSize = this.opts['moveFontSize'];
							link.style.color = this.opts['moveFontColor'];
							link.style.textDecoration = "none";
							link.appendChild(tmp);
							link.href = 'javascript:void(window['+this.id+']'
												+'.skipToMove('+i+','+1+'))';
							cont.appendChild(link);
							comment = this.conv.pgn.getComment(tmp2[i].black,lastMoveIdx);
							if (comment[0]) {
								var tmp4 = document.createElement("span");
								tmp4.style.fontFamily = this.opts['commentFont'];
								tmp4.style.fontSize = this.opts['commentFontSize'];
								tmp4.style.color = this.opts['commentFontColor'];
								tmp4.appendChild(document.createTextNode(comment[0]));
								cont.appendChild(tmp4);
								lastMoveIdx = comment[1];
							}
							this.movesOnPane[this.movesOnPane.length] = link;
						}
					}
					txt = document.createTextNode("  "+this.conv.pgn.props['result']);
					tmp2 = document.createElement("b");
					tmp2.appendChild(txt);
					tmp2.style.fontSize = "9pt";
					cont.appendChild(tmp2);
					this.movesOnPane[this.movesOnPane.length] = tmp2;
				};

				this.populateProps = function(container) {
					// init the style
					var tdS = document.createElement('td');
					tdS.style.fontFamily = "Tahoma, Arial, sans-serif";
					tdS.style.fontSize = "8pt";
					tdS.align = 'center';
					// end of init the style;
					
					var tbl = document.createElement('table');
					tbl.cellPadding = "0";
					tbl.cellSpacing = "0";
					var tblTb = document.createElement("tbody");
					tbl.appendChild(tblTb);

					tbl.width = "100%";
					container.appendChild(tbl);

					// white - black;
					var tr = document.createElement('tr');
					tblTb.appendChild(tr);

					var td = tdS.cloneNode(true);
					td.style.fontWeight = "bold";
					tr.appendChild(td);

					var txt = document.createTextNode('');
					this.visuals['pgn']['players'] = txt;
					td.appendChild(txt);
					//
					
					// ELO
					tr = document.createElement('tr');
					tblTb.appendChild(tr);

					td = tdS.cloneNode(false);
					tr.appendChild(td);

					txt = document.createTextNode('');
					this.visuals['pgn']['elos'] = txt;
					td.appendChild(txt);
					//
					
					// Date 
					tr = document.createElement('tr');
					tblTb.appendChild(tr);

					td = tdS.cloneNode(false);
					tr.appendChild(td);

					txt = document.createTextNode('');
					this.visuals['pgn']['event'] = txt;
					td.appendChild(txt);
					//;
					this.updatePGNInfo();
				};

				this.getImg = function(piece, color) {
					var img = document.createElement("img");
					img.src = this.opts['imagePrefix'] + imageNames[color][piece];
					img.border = 0;
					img.style.padding = "0px";
					img.style.margin = "0px";
					img.style.border = "0px solid #cccccc";

					return img;
				};

				this.syncBoard = function(result) {
					for(var i=0;i<8;i++) {
						for(var j=0;j<8;j++) {
							this.syncSquare(result[i][j]
													,this.pos[i][j]);
						}
					}
				};

				this.syncSquare = function(from, to) {
					to.piece = from.piece;
					to.color = from.color;

					if (to.firstChild)
						 to.removeChild(to.firstChild);
					if (to.piece) {
						to.appendChild(this.getImg(to.piece, to.color));
					}
				};

				function setUp(board, divId) {
					var pgn = new Pgn(document.getElementById(divId).firstChild.nodeValue);
					var conv = new Converter(pgn);
					conv.convert();

					var brd = new Board(conv);
					brd.init();
				};
			};

	/*
		Provides support for different chess & button sets. Takes
		two optional arguments. The first argument specifies the SET
		identifier (defults to 'default') and the second is the
		image prefix (defaults to "").
	*/
	function BoardImages() {
		this.set = "default";
		this.pref = "";
		if (arguments.length>0)
			this.set = arguments[0];
		if (arguments.length>1)
			this.pref = arguments[1];
		this.imageNames = {
			"default": {
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
			}
		};

		this.preload = function() {
			var set = this.set;
			var pref = this.pref;
			if (arguments.length>0)
				set = arguments[0];
			if (arguments.length>1)
				pref = arguments[1];
			var img;
			for (i in this.imageNames[set]) {
				for (j in this.imageNames[set][i]) {
					img = new Image();
					img.src = this.imageNames[set][i][j];
				}
			}
		};
	};
