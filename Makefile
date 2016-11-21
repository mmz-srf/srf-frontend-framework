
BUILDDATE :=$(shell date '+%Y%m%d-%H%M')
MAKEFILE_PATH := $(abspath $(lastword $(MAKEFILE_LIST)))
COMMIT_ID := $(shell git log -n1 --pretty=format:'%h')

%-test:   export MOUNTPOINT :=/mnt/frontend_framework_test
%-master: export MOUNTPOINT :=/mnt/frontend_framework_master
export TARGET=$(MOUNTPOINT)/$(BUILDDATE)-$(COMMIT_ID)


# default: Build the assets and styleguide
all: composer-install node-install bower-install npm-install gulp-build

install-master: install

install-test: install

# this stuff only is needed on jenkins where we have the NFS shares available
install: all
	# copy all created files to the defined mountpoint for BRANCH
	mkdir -p $(TARGET)
	cp -r public dist $(TARGET)
	./bin/deduplicate-deployed-versions $(MOUNTPOINT)

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
