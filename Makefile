
VERSION=$(shell date +%Y.%m.%d)
ITERATION=$(shell date +%H%M)
DEB_TARGET := srf-frontend-framework-styleguide.deb
PLUGIN_RELOAD := public/pattern-lab/plugin-reload/dist/js/plugin-reload.js
$(DEB_TARGET):	clean install-composer build-styleguide $(PLUGIN_RELOAD)
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

$(PLUGIN_RELOAD):
	mkdir -p $(shell dirname $(PLUGIN_RELOAD))
	cp ./vendor/pattern-lab/plugin-reload/dist/js/plugin-reload.js $(PLUGIN_RELOAD)

clean:
	rm -rf public/patternlab-components/pattern-lab/plugin-reload
	rm -f $(DEB_TARGET)

install-composer:
	composer install

build-styleguide:
	php core/console --generate
	
