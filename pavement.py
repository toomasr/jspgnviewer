from paver.easy import *
from paver.setuputils import setup
from github3 import GitHub
from github3 import GitHubError
import pprint
import tarfile
import os
import ConfigParser

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
    version="0.7.3",
    url="http://github.com/toomasr/jspgnviewer",
    author="Toomas Römer",
    author_email="toomasr@gmail.com"
)


@task
@needs("release")
def upload(options, info):
    """Lets upload the release to GitHub"""

    # read the github token
    config = ConfigParser.ConfigParser()
    config.read("personal.properties")
    myToken = config.get("GitHub", "token", 0)

    # lets log in
    print "'%s'" % myToken
    gh = GitHub(token = myToken)
    repo = gh.repository("toomasr", "jspgnviewer")

    # lets do the releases
    try:
        release_name = "JsPgnViewer %s" % options.version
        tag_name = "jspgnviewer-%s" % options.version
        release = repo.create_release(tag_name, name=release_name, prerelease=True)
        f = open("bin/jspgnviewer-%s.tar.gz" % options.version)
        release.upload_asset("application/gzip", "jspgnviewer-%s.tar.gz" %
            options.version, f)
    except GitHubError as e:
        print e.errors

    try:
        release_name = "JsPgnViewer WordPress %s" % options.version
        tag_name = "jspgnviewer-wordpress-%s" % options.version
        release = repo.create_release(tag_name, name=release_name, prerelease=True)
        f = open("bin/pgnviewer-%s.tar.gz" % options.version)
        release.upload_asset("application/gzip", "pgnviewer-%s.tar.gz" %
                options.version, f)
    except GitHubError as e:
        print e.errors
    pass

@task
def release(options, info):
    """Lets build a release!"""

    options.build.dest_dir.mkdir();
    jsDestDir = options.build.dest_dir / "jspgnviewer";
    jsDestDir.mkdir();

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
    tar = tarfile.open(options.dest_dir / ("jspgnviewer-%s.tar.gz" %
        (options.version)), "w:gz" )
    tar.add(jsDestDir, "jspgnviewer")
    tar.close()
    
    tar = tarfile.open(options.dest_dir / ("pgnviewer-%s.tar.gz" %
        (options.version)), "w:gz" )
    tar.add(wpDestDir, "pgnviewer")
    tar.close()
    pass

@task
def clean(options):
    """Cleans the repository of the generated build files"""
    options.build.dest_dir.rmtree()
