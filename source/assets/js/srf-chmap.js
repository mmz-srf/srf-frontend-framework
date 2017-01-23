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
    this.mapID = null;

    this.init = function() {
        // $("#loader").addClass("active");
        this.mapID = $('.chmap__wrapper').attr("id").substr(4);
        this.initObservers();
        this.loadData();
        if (!(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))) {
            $(".chmap").addClass("chmap--desktop");
        }
    };

    this.loadData = function() {
        $('.chmap__wrapper').each(function() { // div around svg
            $.ajax({
                url: $(this).data('src'),
                type: "GET",
                dataType: "xml",
                success: function(data) {
                    var $canton = $(data).find("canton"),
                        myMap = that.maps[that.mapID] = new Map(that.mapID, $canton);
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
                pageX = event.pageX + 0,
                $tooltip = $('#chmap-tooltip');
                that.doMouseEnter($(event.target).parent());
            var cssClass = "left";
            if (event.pageX > $(window).width() / 2) {
                cssClass = "right";
                pageX = pageX - $tooltip.outerWidth();
            }
            $tooltip.removeClass("chmap-tooltip--left chmap-tooltip--right");
            $tooltip.css({"top": pageY, "left": pageX}).addClass("chmap-tooltip--" + cssClass);
        }).on("mouseleave", "a", function() {
            // remove tooltip!
            that.doMouseLeave();
        });

        // access...
        $(".chmap--desktop").on("focus mousedown", "a", function( e ) {
            e.preventDefault();
            e.stopPropagation();
            var map = that.getMapById(that.mapID),
            cantonId = $(this).find(".chmap__location").attr("id");
            if (cantonId === '') {
                map.resetSelectedCanton();
            } else {
                map.setSelectedCanton(cantonId);
            }
        });

        // mobile canton results navigation
        $('.menu').on('change', function() {
            var cantonId = $(this).val(),
                map = that.getMapById(that.mapID);
            if (cantonId === '') {
                map.resetSelectedCanton();
            } else {
                map.setSelectedCanton(cantonId);
            }
        });
    };

    this.getMapById = function(mapId) {
        if (this.maps.hasOwnProperty(mapId)) {
            return this.maps[mapId];
        }
        return false;
    };

    this.doMouseEnter = function($target) {

        var map = that.getMapById(this.mapID);
        var canton = map.getCantonById($target.attr("id"));
        var $tooltip = $("#chmap-tooltip");
        if ($tooltip.length === 0) {
            that.makeTooltip();
        }

        $tooltip.html(canton.name);
        $tooltip.show();
    };

    this.doMouseLeave = function() {
        $('#chmap-tooltip').hide();
    };

    this.makeTooltip = function() {
        $(".chmap__wrapper").append('<div id="chmap-tooltip" class="chmap-tooltip--flyout"></div>');
    };

    // private methods
    function Canton(parent, id) {
        this.id = id;
        this.$element = $("#map-" + parent + " #" + id);
        this.legend   = undefined;
        this.name     = undefined;
        this.results  = undefined;

        this.hasResults = function() {
            return (this.results !== undefined) ? true : false;
        };

        this.setColor = function(bgcolor) {
            $("#" + this.$element.attr("id")).attr("fill", bgcolor);
        };
    }

    function Map(id, Result) {
        this.id = id;
        this.result = Result;
        this.cantons = {};
        var that = this;
        var canton = null;
        Result.children().each(function () {
            canton = $(this).attr("short");
            // that.cantons[canton] = new Canton(that.mapID, canton);
        });
       this.cantons = {
            'AG': new Canton(this.id, 'AG'),
            'AR': new Canton(this.id, 'AR'),
            'AI': new Canton(this.id, 'AI'),
            'BL': new Canton(this.id, 'BL'),
            'BS': new Canton(this.id, 'BS'),
            'BE': new Canton(this.id, 'BE'),
            'FR': new Canton(this.id, 'FR'),
            'GE': new Canton(this.id, 'GE'),
            'GL': new Canton(this.id, 'GL'),
            'GR': new Canton(this.id, 'GR'),
            'JU': new Canton(this.id, 'JU'),
            'LU': new Canton(this.id, 'LU'),
            'NE': new Canton(this.id, 'NE'),
            'NW': new Canton(this.id, 'NW'),
            'OW': new Canton(this.id, 'OW'),
            'SH': new Canton(this.id, 'SH'),
            'SZ': new Canton(this.id, 'SZ'),
            'SO': new Canton(this.id, 'SO'),
            'SG': new Canton(this.id, 'SG'),
            'TI': new Canton(this.id, 'TI'),
            'TG': new Canton(this.id, 'TG'),
            'UR': new Canton(this.id, 'UR'),
            'VD': new Canton(this.id, 'VD'),
            'VS': new Canton(this.id, 'VS'),
            'ZG': new Canton(this.id, 'ZG'),
            'ZH': new Canton(this.id, 'ZH')
        };
        console.log(this.cantons)

        this.getCantonById = function(cantonId) {
            if (this.cantons.hasOwnProperty(cantonId)) {
                return this.cantons[cantonId];
            }
        };

        this.setSelectedCanton = function(cantonId) {
            var map = that.getMapById(this.id),
             canton = map.getCantonById(cantonId);

            // repaint chosen canton (on top)
            $("#selector-" + that.mapID).attr('xlink:href', "#" + cantonId);
            $(".chmap__location").removeClass("chmap__location--shadow");
            $("#" + cantonId).addClass("chmap__location--shadow");
            // select menu
            $(".menu option[value='" + cantonId + "']").prop('selected', true);

            var $tooltip = $("#chmap-tooltip-" + that.mapID);
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

        this.resetSelectedCanton = function() {
            this.selectedCanton = null;
            var $tooltip = $("#chmap-tooltip-" + that.mapID);
            $tooltip.html("");
        };

        this.loadResults = function() { // colors
            var that = this;
            this.result.children().each(function () {
                var canton;
                var shortName = $(this).attr("short"),
                    fullName  = $("#" + shortName).find("title").text(), // for rumantsch as well
                    bgcolor   = $(this).attr("bgcolor"),
                    legend    = $(this).find("legend").text();
                if (that.cantons.hasOwnProperty(shortName)) {
                    canton = that.cantons[shortName];
                    canton.name = fullName;
                    canton.legend = legend;
                    canton.txt = $(this).find("text_content").text();
                    canton.img = $(this).find("canton_img").text();
                    canton.setColor(bgcolor);
                }
            });
            // $(".svg-container #loader").remove();
        };
    }
};