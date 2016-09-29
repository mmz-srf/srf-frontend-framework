
VERSION=$(shell date +%Y.%m.%d)
ITERATION=$(shell date +%H%M)
DEB_TARGET := srf-frontend-framework-styleguide.deb

$(DEB_TARGET):	clean install-composer build-styleguide
	fpm \
          -s dir\
          -t deb\
          -n srf-frontend-framework-styleguide\
          -v $(VERSION)\
          --iteration $(ITERATION)\
          -d /var/www/srf-frontend-framework-styleguide\
          -a all\
          --deb-no-default-config-files \
        --package $(DEB_TARGET) public

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -f $(DEB_TARGET)

install-composer:
	composer install

build-styleguide:
	php core/console --generate
	
