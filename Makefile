
BUILDDATE :=$(shell date '+%Y%m%d-%H%M')
MAKEFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
COMMIT_ID := $(shell git log -n1 --pretty=format:'%h')

# master version
MOUNTPOINT := /mnt/frontend_framework_master
TARGET := $(MOUNTPOINT)/$(BUILDDATE)-$(COMMIT_ID)

# test version
TEST_MOUNTPOINT := /mnt/frontend_framework_test
TEST_TARGET := $(TEST_MOUNTPOINT)/$(BUILDDATE)

# default: Build the assets and styleguide
all: composer-install node-install bower-install npm-install gulp-build

install-master:
	# copy all created files to the defined mountpoint for BRANCH
	mkdir -p $(TARGET)
	cp -r public $(TARGET)/
	./bin/deduplicate-deployed-versions $(MOUNTPOINT)

install-test:
	mkdir -p $(TEST_TARGET)
	cp -r public $(TEST_TARGET)/
	./bin/deduplicate-deployed-versions $(TEST_MOUNTPOINT)
	unlink $(TEST_MOUNTPOINT)/latest
	ln -s -r $(TEST_MOUNTPOINT)/$(BUILDDATE) $(TEST_MOUNTPOINT)/latest

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -rf dist vendor node_modules

composer-install:
	composer --prefer-dist --no-interaction install
	composer remove pattern-lab/plugin-reload

bower-install:
	bower install

npm-install:
	npm install

node-install:
	@node --version | grep -q v\[6789\] || {\
          clear; echo "Deine nodejs version ist ein bisserl aelter...";\
          echo "Bitte installiere ein stabiles nodejs mit:";\
          echo "npm install -g n";\
          echo "n stable";\
          exit 1;\
        }

gulp-build:
	gulp build
