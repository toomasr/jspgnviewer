#!/bin/bash
# Author Toomas Römer toomasr[at]gmail

# Intended to be used from the project root directory
# or ./res directory

OLD_DIR=`pwd`

PROJ_DIR="."
DEST_DIR="bin"
LIB_DIR="lib"
SRC_DIR="src"
WP_DIR="wpPlugin"
WP_IMG_DIR="bin/pgnviewer/img"
TEST_DIR="tests"
IMG_DIR="img"

# functions
genPackedFormat() {
		# pack the source with packer
		cd $LIB_DIR
        if [ "`which php5`" = "" ];then
            echo "No PHP5 found. Not using the PHP packer!";
        else
		    php5 packerConf.php
        fi

		cd $OLD_DIR
		
		cp $DEST_DIR/jsPgnViewer.js $JS_DEST_DIR/jsPgnViewerUnpacked.js
		cp $DEST_DIR/jsPgnViewer.js $WP_DEST_DIR/jsPgnViewerUnpacked.js
		
		java -cp $LIB_DIR/jsmin JSMin $DEST_DIR/jsPgnViewer.js > $JS_DEST_DIR/jsPgnViewer.js
		java -cp $LIB_DIR/jsmin JSMin $DEST_DIR/jsPgnViewer.js > $WP_DEST_DIR/jsPgnViewer.js
}

makeRelease() {
    if [ ! -d $SRC_DIR ];then
         DEST_DIR="../bin"
         SRC_DIR="../src"
         TEST_DIR="../tests"
         IMG_DIR="../img"
         WP_DIR="../wpPlugin"
         LIB_DIR="../lib"
         PROJ_DIR="../"
         WP_IMG_DIR="../"$WP_IMG_DIR
    fi

    WP_DEST_DIR=$DEST_DIR/"pgnviewer"
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

    if [ ! -d $WP_IMG_DIR ];then
         mkdir -p $WP_IMG_DIR
    fi

    JS_VERSION=`cat jsVersion`
    echo "/** Version: $JS_VERSION **/" > $JS_DEST_DIR/jsPgnViewer.js
    cat $SRC_DIR/converter.js >> $JS_DEST_DIR/jsPgnViewer.js
    cat $SRC_DIR/pgn.js >> $JS_DEST_DIR/jsPgnViewer.js
    cat $SRC_DIR/yahoo-format.js >> $JS_DEST_DIR/jsPgnViewer.js
    cat $SRC_DIR/board.js >> $JS_DEST_DIR/jsPgnViewer.js
    cp $JS_DEST_DIR/jsPgnViewer.js $DEST_DIR

    cp $TEST_DIR/samplePage.html $JS_DEST_DIR/
    cp $SRC_DIR/README.txt $JS_DEST_DIR/
    cp License.txt $JS_DEST_DIR/

    cp $WP_DIR/pgnviewer.php $WP_DEST_DIR/pgnviewer.php
    WP_VERSION=`cat wpVersion`

# Making jsPgnViewer release
    cp -r $IMG_DIR $JS_DEST_DIR

# Making plugin release
    cp $WP_DIR/* $WP_DEST_DIR
    cp -r $IMG_DIR/* $WP_IMG_DIR
    cp $JS_DEST_DIR/jsPgnViewer.js $WP_DEST_DIR
    chmod -R 775 $DEST_DIR
    perl -pi -e "s/WP_VERSION/$WP_VERSION/" $WP_DEST_DIR/pgnviewer.php

# WPR release
    cd $DEST_DIR
    NAME="pgnviewer-"`cat ../wpVersion`".tar.gz"
    tar --exclude=.svn -cvzf $NAME pgnviewer
    cd $OLD_DIR

# JSR release
    cd $DEST_DIR
    NAME="jspgnviewer-"`cat ../jsVersion`".tar.gz"
    tar --exclude=.svn -cvzf $NAME jspgnviewer
    cd $OLD_DIR
}


if [ $# -ge 1 ];then
	if [ $1 == 'clean' ];then
		echo "clean "$DEST_DIR
		rm -rf $DEST_DIR
    else
        makeRelease
        genPackedFormat
	fi
else
    echo "Usage:"
    echo "  We have the following targets:"
    echo "      release - makes a release"
    echo "      clean - clean the project"
fi

