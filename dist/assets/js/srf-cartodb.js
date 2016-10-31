var CartodbMap = function ($container) {
    var that = this;
    this.jsonUrl = $container.data('json-url');
    this.isMobile = $container.data('is-mobile') || $("#mobile").length;
    this.startZoom = (this.isMobile === true) ? $container.data('start-zoom-mobile') : $container.data('start-zoom-desktop');
    this.minZoom = $container.data('min-zoom');
    this.maxZoom = $container.data('max-zoom');
    this.latitude = $container.data('latitude');
    this.longitude = $container.data('longitude');
    this.layers = $container.data('layers');
    this.trackingId = $container.data('tracking-id');
    this.layer_index = false;

    this.init = function () {
        var options = this.getVisOptions();
        cartodb.createVis('cartodb-map', that.jsonUrl, options)
            .on('done', function (vis, layers) {

                    // Set min/max zoom
                    if ($container.data("zoom-option") === 1) {
                        vis.map.set({
                            minZoom: that.minZoom,
                            maxZoom: that.maxZoom
                        });
                    } else {
                        $("#cartodb-map").find(".cartodb-zoom").hide();
                        var zoomable_map = vis.getNativeMap();
                        zoomable_map.touchZoom.disable();
                        zoomable_map.doubleClickZoom.disable();
                        zoomable_map.scrollWheelZoom.disable();
                        zoomable_map.keyboard.disable();
                    }
                    if ($container.data("pan-option") === 0) {
                        var pannable_map = vis.getNativeMap();
                        pannable_map.dragging.disable();
                        pannable_map.keyboard.disable();
                    }

                    var layer = layers[1],
                        sublayerCount = layer.getSubLayerCount(),
                        sublayer = [],
                        cartoCSS = [];

                    // Enable/Disable layers
                    $.each(that.layers, function (index, value) {
                        if (index < sublayerCount) {
                            sublayer[index] = layer.getSubLayer(index);
                            sublayer[index].setInteraction(value.interactive);

                            var $template = $('#infowindow_template');
                            if (value.interactive && $template.length) {
                                sublayer[index].infowindow.set({sanitizeTemplate: false});
                                sublayer[index].infowindow.set('template', $template.html());
                            }

                            if (that.isMobile) {
                                cartoCSS[index] = sublayer[index].getCartoCSS();
                                if (cartoCSS[index] === undefined || (cartoCSS[index].indexOf("polygon-fill: #") === -1 &&
                                    cartoCSS[index].indexOf("marker-file: url(http://www.srfcdn.ch/srf-editorial-frontend/_assets/cartodb/images/icon") === -1 &&
                                    cartoCSS[index].indexOf("marker-file: url(http://www.srfcdn.ch/srf-editorial-frontend/_assets/cartoIcons/icon-article.png") === -1)) {
                                    cartoCSS[index] = false;
                                }
                                sublayer[index].infowindow.set(false);
                            }
                        }
                    });

                    if (that.isMobile) {

                        // infowindow setup
                        var $infoWPanel = $("#static_tooltip"),
                            $infoWPanelC = $('.infowindow-panel-content'),
                            $infoWPanelClose = $('.infowindow-panel-close');

                        // close button
                        $infoWPanelClose.on("click", function (e) {
                            e.preventDefault();
                            $infoWPanel.removeClass("active");
                            $infoWPanelC.html("");
                            if (cartoCSS[that.layer_index]) {
                                sublayer[that.layer_index].setCartoCSS(cartoCSS[that.layer_index]);
                            }
                        });

                        $(window).resize(function () {
                            var iframe = $infoWPanel.find("iframe");
                            if (iframe.length) { // resize iframe ...
                                clearTimeout($.data(this, "resizeTimer"));
                                $.data(this, "resizeTimer", setTimeout(function () {
                                    that.setIframeHeight(that.getIframeWidthHeight(iframe.get(0).outerHTML), "#static_tooltip");
                                }, 200));
                            }
                        });
                    }

                    layer.on('featureClick', function (e, latlng, pos, data, layer) {

                        // altering tooltip display for mobile
                        if (that.isMobile) {
                            // remove previous marker
                            if (cartoCSS[that.layer_index]) {
                                sublayer[that.layer_index].setCartoCSS(cartoCSS[that.layer_index]);
                            }

                            // set infowindow content
                            $infoWPanelC.html();
                            var $infoPanel,
                                infoPanelContent = that.populateMobileInfoWindow(data);

                            if (infoPanelContent.length > 0) {
                                $infoPanel = $(infoPanelContent);
                                $infoWPanel.addClass("active");
                                $infoWPanelC.html($infoPanel);

                                if (cartoCSS[layer]) {
                                    var cssid = cartoCSS[layer].match('\#.*?\s|{\g'),
                                        newCartoCSS;

                                    if (cartoCSS[layer].indexOf("polygon-fill: #") !== -1) {
                                        // colored area
                                        newCartoCSS = '\n' + cssid + '[cartodb_id=' + data.cartodb_id + '] {polygon-fill: #222222;}';
                                    } else {
                                        // colored pin
                                        newCartoCSS = '\n' + cssid + '[cartodb_id=' + data.cartodb_id + '] {marker-file:url(http://www.srf.ch/extension/srf_shared/design/standard/images/icons/icon-active.svg)}';
                                    }
                                    sublayer[layer].setCartoCSS(cartoCSS[layer] + newCartoCSS);
                                }
                            } else { // no content
                                $infoWPanel.removeClass("active");
                                if (cartoCSS[layer]) {
                                    sublayer[layer].setCartoCSS(cartoCSS[layer]);
                                }
                            }
                            // set current layer
                            that.layer_index = layer;
                        } else { // end mobile only
                            if (data.embed) { // resize oversized iframe ...
                                that.setIframeHeight(that.getIframeWidthHeight(data.embed), ".cartodb-infowindow");
                            }
                        }

                        that.track('srg_evname=pin-' + data.tracking + '-clicked');
                        $('.cartodb-infowindow').off().on('click', 'a:not(a.close)', function () {
                            that.track('srg_evname=link-' + data.tracking + '-clicked');
                        });
                    });
                    that.track('srg_evname=frontend_app_loaded');
                }
            )
    };

    this.populateMobileInfoWindow = function (data) {
        var data_embed = '',
            data_name = '',
            data_image = '',
            data_description = '',
            data_url = '',
            data_tracking = '';
        if (data.name) {
            data_name = "<h3>" + data.name + "</h3>";
        }
        if (data.image) {
            data_image = "<img src=\"" + data.image + "\" />";
        }
        if (data.embed) {
            data_embed = data.embed;
            that.setIframeHeight(that.getIframeWidthHeight(data.embed), "#static_tooltip");
        }
        if (data.description) {
            data_description = "<p>" + data.description + "</p>";
        }
        if (data.tracking) {
            data_tracking = data.tracking;
        }
        if (data.url) {
            data_url = "<p class=\"articlelink\"><a href=\"" + data.url + "\" target=\"_parent\" data-trck=\"link-" + data_tracking + '-clicked\">' + data.url_text + "</a></p>";
        }

        return data_name + data_image + data_embed + data_description + data_url;
    };

    this.getIframeWidthHeight = function (data_embed_string) {
        var regEx = /(src|width|height)=["']([^"']*)["']/gi;
        var embed_width, embed_height;
        data_embed_string.replace(regEx, function (all, type, value) {
            if (type == "width") {
                embed_width = value || 0;
            }
            if (type == "height") {
                embed_height = value || 0;
            }
        });
        return {width: embed_width, height: embed_height};
    };

    this.setIframeHeight = function (iframe_dims, container) {

        var tooltip_content = $(container);
        var timerId = setInterval(function () {
            if (tooltip_content.find(".loading").length === 0 && iframe_dims.width > 0) {
                var iframe = tooltip_content.find("iframe"); // the "player" will be displayed "over" the video
                iframe.css("height", (iframe_dims.height / (iframe_dims.width / iframe.width())) + "px");
                clearInterval(timerId);
            }
        }, 200);
    };

    this.track = function (event) {
        if (that.trackingId.length) {
            var params = [
                'ns_type=hidden',
                'srg_medien=Infografik_Event',
                'srg_evgroup=CartoDB_' + that.trackingId,
                'srg_identifier=CartoDB_' + that.trackingId
            ];
            params.push(event);
            statistics.comscore.eventTrack(params.join('&'));
        }
    };

    this.getVisOptions = function () {
        var options = {
            tiles_loader: true,
            cartodb_logo: false,
            tooltip: false,
            zoom: parseInt(that.startZoom)
        };

        if (this.latitude != '' && this.longitude != '') {
            options.center = [this.latitude, this.longitude];
        }

        return options;
    };

};
export function init() {
    var $container = $("#cartodb-map");
    if (typeof cartodb === "object" && $container.length) {
        var map = new CartodbMap($container);
        map.init();
    }
}
