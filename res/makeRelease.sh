#!/bin/bash
# Author Toomas Römer toomasr@gmail.com

# Intended to be used from the project root directory
# or ./res directory

OLD_DIR=`pwd`

DEST_DIR="bin"
SRC_DIR="src"
WP_DIR="wpPlugin"
TEST_DIR="tests"

if [ ! -d $SRC_DIR ];then
	 DEST_DIR="../bin"
	 SRC_DIR="../src"
	 TEST_DIR="../tests"
	 WP_DIR="../wpPlugin"
fi

WP_DEST_DIR=$DEST_DIR/"pgnview"
JS_DEST_DIR=$DEST_DIR/"jspgnviewer"

if  [ ! -d $DEST_DIR ];then
	 mkdir $DEST_DIR
fi

if [ ! -d $JS_DEST_DIR ];then
	 mkdir $JS_DEST_DIR
fi

if [ ! -d $WP_DEST_DIR ];then
	 mkdir $WP_DEST_DIR
fi

cat $SRC_DIR/converter.js > $JS_DEST_DIR/jsPgnViewer.js
cat $SRC_DIR/pgn.js >> $JS_DEST_DIR/jsPgnViewer.js
cat $SRC_DIR/board.js >> $JS_DEST_DIR/jsPgnViewer.js

cp $TEST_DIR/testPage.html $JS_DEST_DIR/
cp $SRC_DIR/README.txt $JS_DEST_DIR/

cp $WP_DIR/pgnview.php $WP_DEST_DIR/pgnview.php

# functions
# functions EOF

if [ $# -eq 1 ];then
	if [ $1 == 'wp' ]; then
		echo "wp"
		scp $WP_DEST_DIR/pgnview.php toomas@jabber.ee:/home/toomas/public_html/chessblog/wp-content/plugins/pgnview/pgnview.php
		scp $WP_DEST_DIR/jsPgnViewer.js toomas@jabber.ee:/home/toomas/public_html/chessblog/wp-content/plugins/pgnview/jsPgnViewer.js
	elif [ $1 == 'test' ];then
		echo "test"
		scp $JS_DEST_DIR/jsPgnViewer.js toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/jsPgnViewer.js
		scp $JS_DEST_DIR/testPage.html toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/index.html
	elif [ $1 == 'wpr' ];then
		cp $WP_DIR/* $WP_DEST_DIR
		cd $DEST_DIR
		NAME="pgnview-"`cat ../wpVersion`".tar.gz"
		tar -cvzf $NAME pgnview
		scp $NAME toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/downloads/$NAME
		cd $OLD_DIR
	elif [ $1 == 'jsr' ];then
		cd $DEST_DIR
		NAME="jspgnviewer-"`cat ../jsVersion`".tar.gz"
		tar -cvzf $NAME jspgnviewer
		scp $NAME toomas@jabber.ee:/home/toomas/public_html/jspgnviewer/downloads/$NAME
		cd $OLD_DIR
	fi
fi

