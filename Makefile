
VERSION=$(shell date +%Y.%m.%d)
ITERATION=$(shell date +%H%M)

MOUNTPOINT=/mnt/frontend_framework_develop
BUILDDATE=$(date '+%Y%m%d%H%M')


COMMITID=$(git log -n1 --pretty=format:'%h')
COMMITDATE=$(date -d @$(git log -n1 --format="%at") '+%Y%m%d%H%M')

TARGET=$(MOUNTPOINT)/$(BUILDDATE)-$(COMMITDATE)-$(COMMITID)

$(TARGET):	clean composer-install node-install bower-install npm-install gulp-build
	mkdir -p $(TARGET)
	cp -r public $DEPLOYDIR
	cp -r dist $DEPLOYDIR

update-index:
	cd $MOUNTPOINT
	rm index.html
	for i in $(ls -1r |grep 201); do echo "<a href='$i/public/'>$i</a><br \>">>index.html; done
	NEW=$(ls -1t | grep 20 | head -n 2 | tail -n 1)
	OLD=$(ls -1t | grep 20 | head -n 1)
	rdfind -makehardlinks true -makeresultsfile false $OLD $NEW

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -rf dist

composer-install:
	composer install

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

