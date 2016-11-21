

ifndef BRANCH
BRANCH := local
MOUNTPOINT := "../ezpublish-community"
endif

ifeq ('BRANCH', 'master')
MOUNTPOINT :=/mnt/frontend_framework_master
endif

ifeq ('BRANCH', 'test')
MOUNTPOINT :=/mnt/frontend_framework_develop
endif

BUILDDATE :=$(shell date '+%Y%m%d-%H%M')
MAKEFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
COMMIT_ID := $(shell git log -n1 --pretty=format:'%h')
TARGET := $(MOUNTPOINT)/$(BUILDDATE)-$(COMMIT_ID)


$(TARGET):	clean composer-install node-install bower-install npm-install gulp-build
	mkdir -p $(TARGET)
	cp -r public $(DEPLOYDIR)
	cp -r dist $(DEPLOYDIR)

update-develop-index:
	ifdef MOUNTPOINT
	cd $(MOUNTPOINT) && make -f $(MAKEFILE_PATH) update-index
	endif

update-index:
	rm -f index.html
	for i in $(find -maxdepth 1 -type d | sort); do echo "<a href='$i/public/'>$i</a><br \>">>index.html; done
	LATEST=$(find -maxdepth 1 -type d | sort | tail -2)
	rdfind -makehardlinks true -makeresultsfile false $(LATEST)

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -rf dist

composer-install:
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

upload-assets:
	test -w $(DEVELOP_DIR) || { echo "$(DEVELOP_DIR) is not writable"; exit 1; }
	if test -d "/mnt/frontend_framework_develop"/c0dd2dc; then echo "fail"; exit 1; fi

