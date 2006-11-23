#!/bin/bash

cp tests/testPage.html bin/testPage.html
cat src/converter.js > bin/jsPgnViewer.js
cat src/pgn.js >> bin/jsPgnViewer.js
cat src/board.js >> bin/jsPgnViewer.js
