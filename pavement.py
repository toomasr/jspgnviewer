from paver.easy import *
from paver.setuputils import setup
import pprint

options(
    build = Bunch(
        lib_dir = path("lib"),
        dest_dir = path("bin"),
        src_dir = path("src/main")
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

    options.dest_dir.mkdir();
    jsDestDir = options.dest_dir / "jspgnviewer";
    jsDestDir.mkdir();

    jsDestFile = jsDestDir / "jsPgnViewer.js"
    jsDestFile.write_text("/** Version: %s **/\n" % (options.version))

    sh("cat %s/chess-game.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/converter.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/pgn.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/yahoo-format.js >> %s" % (options.src_dir, jsDestFile))
    sh("cat %s/board.js >> %s" % (options.src_dir, jsDestFile))
    
    sh("cp %s %s" % (jsDestFile, options.dest_dir))
    pass

@task
def clean(options):
    """Cleans the repository of the generated build files"""
    options.dest_dir.rmtree()
