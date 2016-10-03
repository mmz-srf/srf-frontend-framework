
VERSION=$(shell date +%Y.%m.%d)
ITERATION=$(shell date +%H%M)
DEB_TARGET := srf-frontend-framework-styleguide.deb
$(DEB_TARGET):	clean composer-install node-install bower-install npm-install gulp-build
	fpm \
          -s dir\
          -t deb\
          -C public \
          -n srf-frontend-framework-styleguide\
          -v $(VERSION)\
          --iteration $(ITERATION)\
          --prefix /var/www/srf-frontend-framework-styleguide\
          -a all\
          --deb-no-default-config-files \
        --package $(DEB_TARGET) 

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -f $(DEB_TARGET)
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
	gulp build dist

