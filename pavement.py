from paver.easy import *
from paver.setuputils import setup
import pprint

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
    version="0.7.2",
    url="http://github.com/toomasr/jspgnviewer",
    author="Toomas Römer",
    author_email="toomasr@gmail.com"
)

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


    # prepare the WP plugin release
    wpDestDir = options.build.dest_dir / "pgnviewer"
    wpDestDir.mkdir()
    sh("cp %s %s" % (options.wp_dir / "pgnviewer.php", wpDestDir))
    sh("cp %s/* %s" % (options.wp_dir , wpDestDir))
    sh("cp -r %s %s" % (options.img_dir, wpDestDir))
    sh("cp %s %s" % (jsDestDir/"jsPgnViewer.js", wpDestDir))
    pass

@task
def clean(options):
    """Cleans the repository of the generated build files"""
    options.build.dest_dir.rmtree()
