JS PGN Viewer
=============

This is a JavaScript library to show chess games on web pages. The library is fairly old and dates back to 2006. It doesn't have any external dependencies and is written int he old school `document.getElementById()` approach. We have added some dependencies to help with the testing of the library.

Building
--------

We are using [Paver](https://github.com/paver/paver) for the building of the project. There are 3 targets `clean`, `released` and `upload`.

*Prerequisities*

To install all the dependencies just do a npm install.

- `npm install`


Then you can run `./node_modules/karma/bin/karma start` and go from there. To type less you can install karma globally - `npm install -g karma-cli`.

Using It
----------

The end user documentation is available at http://toomasr.github.io/jspgnviewer.
