JS PGN Viewer
=============

Motivation
----------

Back in 2006 I was trying to share chess games on the web and discovered that it was way more difficult than it should have been. There was no library that would parse the PGN and show a nice board. There were some commandline tools that would generate HTML pages based on your PGN and then you could copy the file to the server. Also you could install a Java Applet or a Flash widget. So I set out to write a library in Javascript that would take a PGN and show a visual board!

Examples
----------

Currently this repository is in intermediate state. In progress of moving from https://code.google.com/p/jspgnviewer to GitHub.

<div id='fen' style="visibility: hidden;display:none">
[Event "SOK theme63 corr"]
[Site "corr"]
[Date "1990.??.??"]
[Round "?"]
[White "Brinkmann, W"]
[Black "Hunstock, J"]
[Result "0-1"]
[ECO "A00"]
[SetUp "1"]
[FEN "r1b2k1B/pppp3p/2n2p2/8/3N2nq/1QP3bN/P2PP1Bp/R4K1R b - - 0 14"]
[PlyCount "21"]
[EventDate "1990.??.??"]
[EventType "tourn (corr)"]
[EventRounds "2"]

14... d6 15. Nf3 Qxh3 16. Qxb7 Bxb7 17. Bxh3 Nce5 18. Kg2 Bf4 19. Bxg4 Nxg4 20. Rhf1 Kf7 21. Kh3 h1=Q+ 22. Rxh1 Nf2+ 23. Kg2 Nxh1 24. Rxh1 Rxh8 0-1
</div>
<script>
 var brd = new Board('fen', {'imagePrefix':'img/zurich/',
           'showMovesPane':true,
          'commentFontSize':'10pt',
          'moveFontColor':'#af0000',
          'commentFontColor':"#006699",
          'squareSize':'32px',
          'markLastMove':false,
          'blackSqColor':'url("img/zurich/board/darksquare.gif")',
          'lightSqColor':'url("img/zurich/board/lightquare.gif")',
          'squareBorder':"0px solid #000000",
          'moveBorder':"1px solid #cccccc"
          });
 brd.init()
</script>
