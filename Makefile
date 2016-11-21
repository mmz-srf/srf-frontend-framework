
BUILDDATE :=$(shell date '+%Y%m%d-%H%M')
MAKEFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
COMMIT_ID := $(shell git log -n1 --pretty=format:'%h')

ifndef BRANCH
BRANCH := local
endif

ifeq ('BRANCH', 'master')
MOUNTPOINT :=/mnt/frontend_framework_master
TARGET := $(MOUNTPOINT)/$(BUILDDATE)-$(COMMIT_ID)
endif

ifeq ('BRANCH', 'test')
MOUNTPOINT :=/mnt/frontend_framework_develop
TARGET := $(MOUNTPOINT)/$(BUILDDATE)-$(COMMIT_ID)
endif

# default: Build the assets and styleguide
all: composer-install node-install bower-install npm-install gulp-build

ifdef TARGET
# this stuff only is needed on jenkins where we have the NFS shares available
install: all
	# copy all created files to the defined mountpoint for BRANCH
	mkdir -p $(TARGET)
	cp -r public dist $(TARGET)
	# update and deduplicate the uploaded files on NFS share
	@cd $(MOUNTPOINT) && make -f $(MAKEFILE_PATH) BRANCH=$(BRANCH) update-and-deduplicate-directory

update-and-deduplicate-directory:
	@rm -f index.html
	@for i in $(find -maxdepth 1 -type d | sort); do echo "<a href='$i/public/'>$i</a><br \>">>index.html; done
	@LATEST=$(find -maxdepth 1 -type d | sort | tail -2)
	@rdfind -makehardlinks true -makeresultsfile false $(LATEST)
endif

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -rf dist

composer-install:
ifdef TARGET
	composer remove pattern-lab/plugin-reload
else
	composer require pattern-lab/plugin-reload
endif
	composer --prefer-dist --no-interaction install

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
