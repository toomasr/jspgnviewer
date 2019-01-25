describe("PGN Game Set 1", function() {
  jasmine.getFixtures().fixturesPath = 'base/src/tests/fixtures/';

  it("works with the PGN set", function() {
    loadFixtures("testPgns.html");
    var i = 1;
    var printInterval = 1000;
    $j("div[id^=testGame]").each(function (idx, el) {
      var pgn = new Pgn(el.innerHTML);
      var conv = new Converter(pgn);
      try {
        conv.convert();
      }
      catch(e) {
        expect("No errors!").toBe(e + ". For game "+el.id);
        return false;
      }
      if (i++ % printInterval == 0) {
        console.log((i-1)+" games processed");
      }
    });
    console.log("Ran tests for "+i+" games");
  });

  it("works with the ChessPastebin 001 PGN set", function() {
    loadFixtures("chesspastebin-001.html");
    var i = 1;
    var printInterval = 1000;
    $j("div[id^=testGame]").each(function (idx, el) {
      var pgn = new ChessGame(el.innerHTML);
      var conv = new Converter(pgn.format);
      try {
        conv.convert();
      }
      catch(e) {
        expect("No errors!").toBe(e + ". For game "+el.id);
        return false;
      }
      if (i++ % printInterval == 0) {
        console.log((i-1)+" games processed");
      }
    });
    console.log("Ran tests for "+i+" games");
  });

  it("works with the ChessPastebin 002 PGN set", function() {
    loadFixtures("chesspastebin-002.html");
    var i = 1;
    var printInterval = 1000;
    $j("div[id^=testGame]").each(function (idx, el) {
      var pgn = new ChessGame(el.innerHTML);
      var conv = new Converter(pgn.format);
      try {
        conv.convert();
      }
      catch(e) {
        expect("No errors!").toBe(e + ". For game "+el.id);
        return false;
      }
      if (i++ % printInterval == 0) {
        console.log((i-1)+" games processed");
      }
    });
    console.log("Ran tests for "+i+" games");
  });

  it("works with the custom PGN set", function() {
    loadFixtures("testPgnsCustom.html");
    var i = 1;
    $j("div[id^=testGame]").each(function (idx, el) {
      var pgn = new Pgn(el.innerHTML);
      var conv = new Converter(pgn);
      try {
        conv.convert();
      }
      catch(e) {
        expect("No errors!").toBe(e + ". For game "+el.id);
        return false;
      }
      i++;
    });
    console.log("Ran tests for "+i+" games");
  });

  it("works with visual board", function() {
    loadFixtures("visual-board.html");
  });

  it("works with visual board yahoo", function() {
    loadFixtures("visual-board-yahoo.html");
  });

  it("works with visual board fen", function() {
    loadFixtures("visual-board-fen.html");
  });
});
