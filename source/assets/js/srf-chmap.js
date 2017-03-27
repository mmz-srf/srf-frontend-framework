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
        $('.chmap-wrapper').each(function() { // div around svg
            var mapId = $(this).attr("id").substr(4);
            $.ajax({
                url: $(this).data('src'),
                type: "GET",
                dataType: "json",
                success: function(data) {
                    var myMap = that.maps[mapId] = new Map(mapId, data);
                    myMap.loadResults();
                }
            });
        });
    };

    this.initObservers = function() {

        // tooltips for cantons
        $('.chmap-wrapper .chmap--desktop').on('mousemove', function (event) {
            var $target = $(event.target);
            if ($target.hasClass("chmap--desktop")) {
                return
            }
            $(':focus').focusout();
            var parentOffset = $('.chmap--desktop').parent().offset(),
            	pageY = event.pageY - parentOffset.top - 58,
                pageX = event.pageX - parentOffset.left,
                $tooltip = $("#chmap-tooltip"),
                mapId = that.getCurrentMapId($target),
                map = that.getMapById(mapId),
                canton = null;
            if ($target.is("use")) {
                canton = map.getCantonById($target.attr("xlink:href").substr(1));
            } else {
                canton = map.getCantonById($target.parent().attr("id"));
            }

            // if not there yet: create it
            if ($tooltip.length === 0) {
                // TODO: check what happens if there are two maps!
                $("#map-" + mapId).append('<div id="chmap-tooltip" class="chmap-tooltip"></div>');
                $tooltip = $("#chmap-tooltip"); // :(
            }

            // tooltip positioning
            var cssClass = "left";
            if (pageX > $(this).parent().width() / 2) {
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

        // it's near to impossible to tell whether a select menu is open :( - in order to swap the triangle
        $('.menu').on('change', function() { // canton select navigation
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
        return $(element).closest(".chmap-wrapper").attr("id").substr(4);
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

        $(this.result).each(function() {
            reference.cantons[this.id] = new Canton(reference.id, this.id);
        });

        this.getCantonById = function(cantonId) {
            if (this.cantons.hasOwnProperty(cantonId)) {
                return this.cantons[cantonId];
            }
        };

        // infowindow (beneath select menu)
        this.setSelectedCanton = function(cantonId) {
            if (cantonId === "") {
                $("#infowindow-" + this.id).removeClass("chmap-infowindow--padded");
                return false;
            }
            var map = that.getMapById(this.id)
                , canton = map.getCantonById(cantonId)
                , $map = $("#map-" + this.id);

            // repaint chosen canton (on top)
            $("#selector-" + this.id).attr('xlink:href', "#" + cantonId);
            $map.find(".chmap__location").removeClass("chmap__location--shadow");
            $map.find("#" + cantonId).addClass("chmap__location--shadow");
            // select menu
            $map.find(".menu option[value='" + cantonId + "']").prop('selected', true);

            var $tooltip = $("#infowindow-" + this.id);
            if ($tooltip.find("p").length === 0) {
                $tooltip.append("<img class=\"chmap-infowindow__img\" alt=\"\"/><p class=\"chmap-infowindow__text\"></p>");
            }
            $tooltip.find("img").attr("src", "").addClass("chmap-tooltip__img--hide");
            if (canton.img !== "" && canton.img !== false) {
                $tooltip.find("img").attr("src", canton.img).removeClass("chmap-tooltip__img--hide");
            }
            var legend = "";
            if (canton.legend !== "") {
                legend = " (" + canton.legend + ")";
            }
            $tooltip.find("p").html("<span class=\"h-offscreen\">" + canton.name + legend + "</span>" + canton.txt);
            $tooltip.addClass('chmap-infowindow--padded').show();
        };

        this.resetSelectedCanton = function(mapId) {
            var $tooltip = $("#infowindow-" + mapId);
            $tooltip.html("");
            $("#map-" + this.id + " .chmap__location").removeClass("chmap__location--shadow");
        };

        this.loadResults = function() { // colors
            var that = this;
            $(this.result).each(function() {
                var canton, $canton;
                if (that.cantons.hasOwnProperty(this.id)) {
                    canton = that.cantons[this.id];
                    canton.legend = this.legend;
                    canton.txt = this.description;
                    canton.img = this.image;
                    $canton = $("#" + this.id);
                    canton.name = $canton.find("title").text(); // for rumantsch as well
                    $canton.attr("fill", this.color);
                }
            });
        };
    }
};