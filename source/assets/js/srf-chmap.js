export function init() {
    var CHMap = {};
    $(document).ready(function() {
        CHMap.chmapControl = new chmapController();
        CHMap.chmapControl.init();
    });
}

var chmapController = function() {
    var that = this;
    this.maps = {};

    this.init = function() {
        // $("#loader").addClass("active");
        this.loadData();
        if (!(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))) {
            $(".chmap").addClass("chmap--desktop");
        }
        this.initObservers();
    };

    this.loadData = function() {
        $('.chmap__wrapper').each(function() { // div around svg
            var mapId = $(this).attr("id").substr(4);
            $.ajax({
                url: $(this).data('src'),
                type: "GET",
                dataType: "xml",
                success: function(data) {
                    var $canton = $(data).find("canton")
                        , myMap = that.maps[mapId] = new Map(mapId, $canton);
                    myMap.loadResults();
                }
            });
        });
    };

    this.initObservers = function() {

        // tooltips for cantons
        $('.chmap--desktop').on('mouseenter', 'a', function( event ) {
            $(':focus').focusout();
            var pageY = event.pageY - 50,
                pageX = event.pageX + 0;
            // that.doMouseEnter($(event.target).parent());

            var mapId = that.getCurrentMapId($(event.target))
                , map = that.getMapById(mapId)
                , canton = map.getCantonById($(event.target).parent().attr("id"))
                , $tooltip = $("#chmap-tooltip");
            // if not there yet: create it
            if ($tooltip.length === 0) {
                // TODO: check what happens if there are two maps!
                $("#map-" + mapId).append('<div id="chmap-tooltip" class="chmap-tooltip--flyout"></div>');
                $tooltip = $("#chmap-tooltip"); // :(
            }

            // tooltip positioning
            var cssClass = "left";
            if (pageX > $(window).width() / 2) {
                cssClass = "right";
                pageX = pageX - $tooltip.outerWidth();
            }
            $tooltip.css({"top": pageY, "left": pageX})
                .removeClass("chmap-tooltip--left chmap-tooltip--right")
                .addClass("chmap-tooltip--" + cssClass);

            // naming it
            $tooltip.html(canton.name);
            $tooltip.show();

        }).on("mouseleave", "a", function() {
            // hide tooltip!
            $('#chmap-tooltip').hide();
        }).on("focus mousedown", "a", function( e ) { // access...
            e.preventDefault();
            e.stopPropagation();
            var mapId = that.getCurrentMapId($(this))
                , map = that.getMapById(mapId)
                , cantonId = $(this).find(".chmap__location").attr("id");
            if (cantonId === '') {
                map.resetSelectedCanton(mapId);
            } else {
                map.setSelectedCanton(cantonId);
            }
        });

        // does not work: it's neat to impossible to tell whether a select menu is open
        $('.menu').on('focus', function() {
            $(".menu__arrow").addClass("menu__arrow--active");
        }).on('blur', function() {
            $(".menu__arrow").addClass("menu__arrow--active");
        }).on('change', function() { // canton select navigation
            $(".menu__arrow").removeClass("menu__arrow--active");
            var cantonId = $(this).val()
                , mapId = that.getCurrentMapId($(this))
                , map = that.getMapById(mapId);
            if (cantonId === '') {
                map.resetSelectedCanton(mapId);
            } else {
                map.setSelectedCanton(cantonId);
            }
        });
    };

    this.getCurrentMapId = function(element) {
        return $(element).closest(".chmap__wrapper").attr("id").substr(4);
    };

    this.getMapById = function(mapId) {
        if (this.maps.hasOwnProperty(mapId)) {
            return this.maps[mapId];
        }
        return false;
    };

    // private methods
    function Canton(parent, id) {
        this.id = id;
        this.$element = $("#map-" + parent + " #" + id);
        this.legend   = undefined;
        this.name     = undefined;
    }

    function Map(id, Result) {
        this.id = id;
        this.result = Result;
        this.cantons = {};
        var reference = this;
        var canton = null;

        Result.children().each(function () {
            canton = $(this).attr("short");
            reference.cantons[canton] = new Canton(reference.id, canton);
        });

        this.getCantonById = function(cantonId) {
            if (this.cantons.hasOwnProperty(cantonId)) {
                return this.cantons[cantonId];
            }
        };

        // infowindow (beneath select menu)
        this.setSelectedCanton = function(cantonId) {
            var map = that.getMapById(this.id)
                , canton = map.getCantonById(cantonId);

            // repaint chosen canton (on top)
            $("#selector-" + this.id).attr('xlink:href', "#" + cantonId);
            $(".chmap__location").removeClass("chmap__location--shadow");
            $("#" + cantonId).addClass("chmap__location--shadow");
            // select menu
            $(".menu option[value='" + cantonId + "']").prop('selected', true);

            var $tooltip = $("#chmap-tooltip-" + this.id);
            if ($tooltip.find("p").length === 0) {
                $tooltip.append("<table><tr><td><img alt=\"\"/></td><td><p></p></td></tr></table>");
            }
            $tooltip.find("img").attr("src", "").addClass("hide");
            if (canton.img !== "") {
                $tooltip.find("img").attr("src", canton.img).removeClass("hide");
            }
            $tooltip.find("p").html("<span class=\"h-offscreen\">" + canton.name + " (" + canton.legend + ")</span>" + canton.txt);
            $tooltip.show();
        };

        this.resetSelectedCanton = function(mapId) {
            var $tooltip = $("#chmap-tooltip-" + mapId);
            $tooltip.html("");
        };

        this.loadResults = function() { // colors
            var that = this;
            this.result.children().each(function () {
                var canton, element,
                    shortName = $(this).attr("short");
                if (that.cantons.hasOwnProperty(shortName)) {
                    element = $(this);
                    canton = that.cantons[shortName];
                    canton.legend = element.find("legend").text();
                    canton.txt = element.find("text_content").text();
                    canton.img = element.find("canton_img").text();
                    canton.name = $("#" + shortName).find("title").text(); // for rumantsch as well
                    $("#" + shortName).attr("fill", $(this).attr("bgcolor"));
                }
            });
        };
    }
};