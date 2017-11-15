export function init() {
    let CHMap = {};
    $(document).ready(function() {
        CHMap.chmapControl = new chmapController();
        CHMap.chmapControl.init();
    });
}

let chmapController = function() {
    let that = this;
    this.maps = {};

    this.init = function() {
        this.loadData();
        if (!(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))) {
            $('.chmap').addClass('chmap--desktop');
            $('.chmap-wrapper').append('<div class="js-chmap-tooltip chmap-tooltip" style="display: none"></div>');
        }
        this.initObservers();
    };

    this.loadData = function() {
        $('.chmap-wrapper__figure').each(function () { // div around svg
            let mapId = $(this).attr('id').substr(4);
            $.ajax({
                url: $(this).data('src'),
                type: 'GET',
                dataType: 'json',
                success: function(data) {
                    let myMap = that.maps[mapId] = new Map(mapId, data);
                    myMap.loadResults();
                }
            });
        });
    };

    this.initObservers = function() {

        $('.chmap__location', '.chmap--desktop').on('mousemove', function (event) {

            $(':focus').focusout();

            let $wrapper = $(this).closest('.chmap-wrapper'),
                $tooltip = $('.js-chmap-tooltip', $wrapper),
                cssClass = 'left';

            // getting position of mouse pointer within the wrapper (needed for tooltip orientation)
            let parentOffset = $wrapper.offset(),
                pageY = event.pageY - parentOffset.top - 58,
                pageX = event.pageX - parentOffset.left;

            // change orientation of tooltip when mouse pointer is in the right half of the wrapper
            if (pageX > $wrapper.width() / 2) {
                cssClass = 'right';
                pageX = pageX - $tooltip.outerWidth();
            }
            $tooltip.css({'top': pageY, 'left': pageX})
                .removeClass('chmap-tooltip--left chmap-tooltip--right')
                .addClass('chmap-tooltip--' + cssClass);

            // get canton name and show tooltip - only if the map object is available
            let cantonId = $(this).attr('id').split('-')[0];
            let map = that.getMapById(that.getCurrentMapId($(this)));
            if (map) {
                let canton = map.getCantonById(cantonId);
                $tooltip.text(canton.name).show();
            }
        });


        $('.chmap__location', '.chmap--desktop').on('mouseleave', function() {
            $(this).closest('.chmap-wrapper').find('.js-chmap-tooltip').hide();
        });

        $('.chmap-wrapper .chmap--desktop').on('focus mousedown', 'a', function( e ) { // access...
            e.preventDefault();
            e.stopPropagation();
            let mapId = that.getCurrentMapId($(this))
                , map = that.getMapById(mapId)
                , cantonId = that.extractCantonId($(this).find('.chmap__location').attr('id'));
            if (cantonId === '') {
                map.resetSelectedCanton(mapId);
            } else {
                map.setSelectedCanton(cantonId);
            }
        });

        // it's near to impossible to tell whether a select menu is open :( - in order to swap the triangle
        $('.js-chmap-menu').on('change', function () { // canton select navigation
            let cantonId = that.extractCantonId($(this).val())
                , mapId = that.getCurrentMapId($(this))
                , map = that.getMapById(mapId);
            if (cantonId === '') {
                map.resetSelectedCanton(mapId);
            } else {
                map.setSelectedCanton(cantonId);
            }
        });
    };

    this.extractCantonId = function (cantonId) {
        cantonId = cantonId.split('-')[0];
        return cantonId;
    };

    this.getCurrentMapId = function(element) {
        return $(element).closest('.chmap-wrapper').find('.chmap-wrapper__figure').attr('id').substr(4);
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
        this.$element = $('#map-' + parent + ' #' + id);
        this.legend   = undefined;
        this.name     = undefined;
    }

    function Map(id, Result) {
        this.id = id;
        this.result = Result;
        this.cantons = {};
        let reference = this;

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
            if (cantonId === '') {
                $('#infowindow-' + this.id).removeClass('chmap-infowindow--padded');
                return false;
            }
            let map = that.getMapById(this.id)
                , canton = map.getCantonById(cantonId)
                , $map = $('#map-' + this.id);

            // repaint chosen canton (on top)
            $('#selector-' + this.id).attr('xlink:href', '#' + cantonId + '-' + this.id);
            $map.find('.chmap__location').removeClass('chmap__location--shadow');
            $map.find('#' + cantonId + '-' + this.id).addClass('chmap__location--shadow');
            // select menu
            $map.find('.js-chmap-menu option[value="' + cantonId + '"]').prop('selected', true);

            let $tooltip = $('#infowindow-' + this.id);
            if ($tooltip.find('p').length === 0) {
                $tooltip.append('<img class="chmap-infowindow__img" alt=""/><p class="chmap-infowindow__text"></p>');
            }
            $tooltip.find('img').attr('src', '').addClass('chmap-tooltip__img--hide');
            if (canton.img !== '' && canton.img !== false) {
                $tooltip.find('img').attr('src', canton.img).removeClass('chmap-tooltip__img--hide');
            }
            let legend = '';
            if (canton.legend !== '') {
                legend = ' (' + canton.legend + ')';
            }
            $tooltip.find('p').html('<span class="h-offscreen">' + canton.name + legend + '</span>' + canton.txt);
            $tooltip.addClass('chmap-infowindow--padded').show();
            this.updateSelectMenu(cantonId);
        };

        this.resetSelectedCanton = function(mapId) {
            let $tooltip = $('#infowindow-' + mapId);
            $tooltip.html('');
            $('#map-' + this.id + ' .chmap__location').removeClass('chmap__location--shadow');
        };


        this.updateSelectMenu = function(cantonId) {
            $('#map-' + this.id ).parent().find('.js-chmap-menu').val(cantonId+'-'+this.id);
        };


        this.loadResults = function() { // colors
            let that = this;
            $(this.result).each(function() {
                let canton, $canton;
                if (that.cantons.hasOwnProperty(this.id)) {
                    canton = that.cantons[this.id];
                    canton.legend = this.legend;
                    canton.txt = this.description;
                    canton.img = this.image;
                    $canton = $('#' + this.id + '-' + that.id);
                    canton.name = $canton.closest('a').attr('aria-label'); // for rumantsch as well
                    $canton.attr('fill', this.color);
                }
            });
        };
    }
};
