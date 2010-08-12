# Build
default:
	@echo "Building ..."
	./makeRelease.sh

# Clean
clean:
	@echo "Clean-up crew has entered the building ..."
	./makeRelease.sh clean

# Upload the plugin to tom.jabber.ee
wpr:
	./makeRelease.sh wpr

# Upload a release to tom.jabber.ee 
jsr:
	./makeRelease.sh jsr

# Update tom.jabber.ee test page
test:
	./makeRelease.sh test

# Update tom.jabber.ee wordpress instance
wp:
	./makeRelease.sh wp

# Upload snap to tom.jabber.ee
snap:
	./makeRelease.sh snap

# Upload changelog
change:
	./makeRelease.sh change

# Packed test version
packed:
	./makeRelease.sh packed

# JSMIN packed test version
jsmin:
	./makeRelease.sh jsmin

# Packed wp
packedwp:
	./makeRelease.sh wp packed

# Packed test
packedtest:
	./makeRelease.sh test packed
