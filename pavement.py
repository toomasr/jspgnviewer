# -*- coding: utf-8 -*-

from paver.easy import *
from paver.setuputils import setup
from github3 import GitHub
from github3 import GitHubError
import pprint
import os
import configparser

options(
    build = Bunch(
        lib_dir = path("lib"),
        dest_dir = path("bin"),
        test_dir = path("examples"),
        src_dir = path("src/main"),
        img_dir = path("img"),
        wp_dir = path("wpPlugin")
    )
)

setup(
    name="jsPgnViewer",
    version="dummy",
    url="http://github.com/toomasr/jspgnviewer",
    author="Toomas Römer",
    author_email="toomasr@gmail.com"
)


@task
@needs("release")
def upload(options, info):
    """Lets upload the release to GitHub"""

    # read the github token
    config = configparser.ConfigParser()
    config.read("personal.properties")
    myToken = config.get("GitHub", "token")

    # lets log in
    print("'%s'" % myToken)
    gh = GitHub(token = myToken)
    repo = gh.repository("toomasr", "jspgnviewer")

    # lets do the releases
    try:
        release_name = "JsPgnViewer %s" % options.version
        tag_name = "jspgnviewer-%s" % options.version
        release = repo.create_release(tag_name, name=release_name, prerelease=True)
        f = open("bin/jspgnviewer-%s.zip" % options.version)
        release.upload_asset("application/zip", "jspgnviewer-%s.zip" %
            options.version, f)
    except GitHubError as e:
        print(e.errors)

    try:
        release_name = "JsPgnViewer WordPress %s" % options.version
        tag_name = "jspgnviewer-wordpress-%s" % options.version
        release = repo.create_release(tag_name, name=release_name, prerelease=True)
        f = open("bin/pgnviewer-%s.zip" % options.version)
        release.upload_asset("application/zip", "pgnviewer-%s.zip" %
                options.version, f)
    except GitHubError as e:
        print(e.errors)
    pass

@task
def release(options, info):
    """Lets build a release!"""

    options.build.dest_dir.mkdir();
    jsDestDir = options.build.dest_dir / "jspgnviewer";
    jsDestDir.mkdir();

    options['version'] = open('version', 'r').read().strip()

    # prepare the JS release
    jsDestFile = jsDestDir / "jsPgnViewer.js"
    jsDestFile.write_text("/** Version: %s **/\n" % (options.version))

    sh("cat %s/chess-game.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/converter.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/pgn.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/yahoo-format.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/board.js >> %s" % (options.src_dir, jsDestFile))

    sh("cp %s %s" % (jsDestFile, options.build.dest_dir))
    sh("cp %s %s" % (options.test_dir / "samplePage.html", options.build.dest_dir))
    sh("cp %s %s" % (options.src_dir / "README.txt", options.build.dest_dir))
    sh("cp %s %s" % ("License.txt", options.build.dest_dir))
    sh("cp -r %s %s" % (options.img_dir, jsDestDir))

    # lets make a copy of the jspgnviewer file and pack the original
    sh("cp %s %s" % (jsDestDir / "jsPgnViewer.js", jsDestDir /
        "jsPgnViewerUnpacked.js"))
    sh("./node_modules/uglify-js/bin/uglifyjs %s > %s" % (jsDestDir / "jsPgnViewerUnpacked.js",
        jsDestDir / "jsPgnViewer.js")) 


    # prepare the WP plugin release
    wpDestDir = options.build.dest_dir / "pgnviewer"
    wpDestDir.mkdir()
    sh("cp %s %s" % (options.wp_dir / "pgnviewer.php", wpDestDir))
    sh("cp %s/* %s" % (options.wp_dir , wpDestDir))
    sh("cp -r %s %s" % (options.img_dir, wpDestDir))
    sh("cp %s %s" % (jsDestDir/"jsPgnViewer.js", wpDestDir))
    sh("cp %s %s" % (jsDestDir/"jsPgnViewerUnpacked.js", wpDestDir))
    sh("perl -pi -e \"s/WP_VERSION/%s/\" %s/pgnviewer.php" %
            (options.version, wpDestDir))

    # lets package the folders as archives
    sh("cd %s && zip -r jspgnviewer-%s.zip jspgnviewer"
            % (options.build.dest_dir, options.version))

    # lets package the folders as archives
    sh("cd %s && zip -r pgnviewer-%s.zip pgnviewer"
            % (options.build.dest_dir, options.version))
    pass

@task
def clean(options):
    """Cleans the repository of the generated build files"""
    options.build.dest_dir.rmtree()
