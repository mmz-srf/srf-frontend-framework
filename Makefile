
DEB_VERSION:= 1
DEB_ITERATION := 1200
DEB_TARGET := srf-frontend-framework-styleguide.deb

$(DEB_TARGET):	clean install-composer build-styleguide
	fpm \
          -s dir\
          -t deb\
          -n srf-frontend-framework-styleguide\
          -v $(DEB_VERSION)\
          --iteration $(DEB_ITERATION)\
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
	
