# Build
default:
	@echo "Building ..."
	./res/makeRelease.sh

# Clean
clean:
	@echo "Clean-up crew has entered the building ..."
	./res/makeRelease.sh clean

# Upload the plugin to tom.jabber.ee
wpr:
	./res/makeRelease.sh wpr

# Upload a release to tom.jabber.ee 
jsr:
	./res/makeRelease.sh jsr

# Update tom.jabber.ee test page
test:
	./res/makeRelease.sh test

# Update tom.jabber.ee wordpress instance
wp:
	./res/makeRelease.sh wp

# Upload snap to tom.jabber.ee
snap:
	./res/makeRelease.sh snap

# Upload changelog
change:
	./res/makeRelease.sh change

# Packed test version
packed:
	./res/makeRelease.sh packed

# JSMIN packed test version
jsmin:
	./res/makeRelease.sh jsmin
