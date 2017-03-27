export function init() {
    var POLIS = {};
    $(document).ready(function(){
        POLIS.mapControl = new polisController();
        POLIS.mapControl.init();
    });
}

var polisController = function() {
    var that = this;
    this.eventDate = false;
    this.refreshInterval = 30000;
    this.maps = {};

    this.init = function() {
        this.initObservers();
        this.update();
        this.schedule();
    };

    this.msie = function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
            return true;

        return false;
    };

    this.update = function() {
        $('.polis-map').each(function(){
            that.handleMapInstance($(this));
        });
    };

    this.pad = function(number) {
        return (number < 10 ? '0' : '') + number
    };

    this.schedule = function() {
        window.setInterval(this.update, this.refreshInterval);
    };

    this.initObservers = function() {
        // clicker for titles
        $('.chmap .vote h3').on('click', function(){
            $(this).closest('.vote').toggleClass('active passive');
        });
        //district results toggle
        $('.toggle-district').on('click', function(e){
            e.preventDefault();
            $(this).closest('.regional-results-wrapper').toggleClass('active passive');
        });
        // render regional results
        // $('.chmap--desktop').on('click', '.chmap g:not(.initial) polygon', function(){
        $('.polis-map .chmap--desktop').on("focus mousedown", "a", function (e) { // access...
            var mapId = $(this).closest('.polis-map').attr('id'),
                cantonId = $(this).closest('g').attr('id'),
                map = that.getMapById(mapId),
                canton = map.getCantonById(cantonId);
            map.setSelectedCanton(cantonId);
            canton.renderResults();
            // TODO:
            $(this).closest('.vote').find('.regional-results-wrapper').show();
        });

        $('.polis-map .chmap--desktop').on('mouseenter', '.chmap', function () {
            that.doMouseEnter($(this), false);
        }).on('mouseleave', '.chmap g:not(.initial)', function(){
            that.doMouseLeave($(this), false);
        });

        // tooltip for cantons
        $('.polis-map .chmap--desktop').on('mousemove', '.chmap', function (event) {
            var pageY = event.pageY-90,
                pageX = event.pageX,
                $tooltip = $('#polis-tooltip'),
                breakpoint = (window.innerWidth/2)-80;

            if(pageX > breakpoint) {
                $tooltip.addClass('arrow-right');
                pageX -= 300;
            } else {
                $tooltip.removeClass('arrow-right');
            }
            $tooltip.css('top', pageY).css('left', pageX);
        });
        //mobile canton results navigation
        $('.vote .regional-results-select select').on('change', function() {
            // if not all cantons are ready => hide them
            var $vote = $(this).closest('.vote'),
                cantonId = $(this).val(),
                mapId = $vote.find('.polis-map').attr('id'),
                map = that.getMapById(mapId);
            $vote.find('.regional-results-message').hide();
            if (cantonId === '') {
                $vote.find('.regional-results, .toggle-district').hide();
                map.resetSelectedCanton();
            }
            else {
                var canton = map.getCantonById(cantonId);
                map.setSelectedCanton(cantonId);
                if(canton.hasResults()) {
                    canton.renderResults();
                    $vote.find('.regional-results').show();
                    // show districts toggle if district results are available
                    if (canton.getNumberOfDistricts() > 0) {
                        $vote.find('.toggle-district').css('display', 'table');
                    }
                    else {
                        $vote.find('.toggle-district').hide();
                        $vote.find('.toggle-district').closest('.regional-results-wrapper').removeClass('active').addClass('passive');
                    }
                }
                else {
                    //show message if no results are available
                    $vote.find('.regional-results-message').show();
                    $vote.find('.regional-results').hide();
                    $vote.find('.toggle-district').hide();
                }
            }
            $(this).parent().find('span.selection').text($(this).find(":selected").text());
        });
    };

    this.handleMapInstance = function($map) {
        this.getMapData($map.attr('id'), $map.data('vote'), $map.data('api'));
    };

    this.getMapById = function(mapId) {
        if (this.maps.hasOwnProperty(mapId)) {
            return this.maps[mapId];
        }
        return false;
    };

    this.getMapData = function(domId, voteId, dataSrc) {
        $.getJSON(dataSrc, function(data) {
            var vote = data.votes[voteId],
                myMap = that.getMapById(domId);
            that.eventDate = data.voteCase.date; // moment(data.voteCase.date);

            if (myMap === false) { // initial call
                that.maps[domId] = new Map(domId, vote);
                myMap = that.maps[domId];
                myMap.loadResults();
                that.updateMainBar(domId, vote, myMap);
            } else {
                myMap.updateResults(vote);
                that.updateMainBar(domId, vote, myMap);
                that.updateCantonalMajority(domId, vote);
            }
        });
    };

    this.updateMainBar = function(domId, vote, map) {
        var $parent = $('#'+domId).closest('.content').find('.main-result-bar');

        if (vote.results && vote.results.nationalResults) { // undefined??
            that.paintMainBar($parent, new ResultSet(vote.results.nationalResults, map), this.calcLastUpdated(vote));
        }
    };

    this.calcLastUpdated = function(vote) {
        var lastUpdated = null;
        vote.results.results.forEach(function(result) {
            // if (lastUpdated == null || moment(result.update) > lastUpdated) {
            if (lastUpdated == null || result.update > lastUpdated) {
                lastUpdated = result.update; // moment(result.update);
            }
        }.bind(this));

        return lastUpdated;
    };

    this.updateCantonalMajority = function(domId, vote){
        var $parent = $('#'+domId).closest('.content').find('.result.bars.cantonal .bar');
        this.paintCantonalMajorityBar($parent, vote.cantonalResult);
    };

    this.paintMainBar = function($parent, resultSet, lastUpdateTime){
        var content = $parent.closest('.content');

        //absolute
        $parent.find('.yes.absolute .result').text(resultSet.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        $parent.find('.no.absolute .result').text(resultSet.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        //bars
        $parent.find('.bar .no.relative').width(resultSet.relative.no+'%');
        $parent.find('.bar .yes.relative').width(resultSet.relative.yes+'%');
        //relative values
        $parent.find('.bar .result.yes').html(parseFloat(resultSet.relative.yes).toFixed(1)+'<span class="symbol">%</span>');
        $parent.find('.bar .result.no').html(parseFloat(resultSet.relative.no).toFixed(1)+'<span class="symbol">%</span>');

        if (resultSet.relative.participation) {
            // content.find('.polis-participation').text(SRF.i18n.tr('Stimmbeteiligung', 'frontend/votes')+': '+resultSet.relative.participation+'%');
            content.find('.polis-participation').text('Stimmbeteiligung' + ': ' + resultSet.relative.participation + '%');
        } else {
            content.find('.polis-participation').text('');
        }
        //state line
        var ut=lastUpdateTime;

        if (resultSet.num_cantons < 26) {
            content.find('.result-state span.num').text(resultSet.num_cantons);
            content.find('.result-state span.num').show();
            content.find('.result-state span.update-time').show();
            content.find('.result-state span.partial').show();
        } else {
            content.find('.result-state span.num').hide();
            content.find('.result-state span.update-time').hide();
            content.find('.result-state span.partial').hide();
            ut = that.eventDate;
        }

        content.find('.result-state strong.state').text(resultSet.state);

        if (ut && typeof ut.date === 'function') {
            // content.find('.result-state span.date').text(SRF.i18n.tr('vom', 'frontend/votes') + ' ' + this.pad(ut.date()) + "." + this.pad(ut.month() + 1) + "." + ut.year());
            // content.find('.result-state span.time').text(SRF.i18n.tr('um', 'frontend/votes') + ' ' + ut.hour() + ":" + that.pad(ut.minute()));
            content.find('.result-state span.date').text('vom' + ' ' + this.pad(ut.date()) + "." + this.pad(ut.month() + 1) + "." + ut.year());
            content.find('.result-state span.time').text('um' + ' ' + ut.hour() + ":" + that.pad(ut.minute()));
        }
    };

    this.paintCantonalMajorityBar = function($parent, results){
        //absolute
        $parent.find('.yes.result').text(results.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        $parent.find('.no.result').text(results.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        //bars
        $parent.find('.no.relative').width(results.relative.no+'%');
        $parent.find('.yes.relative').width(results.relative.yes+'%');
    };

    this.doMouseEnter = function($target, isIEWorkaround){
        if ($target.is('.initial')) {
            $('#polis-tooltip').hide();
            return;
        }
        if (!that.msie()) {
            $target.attr('class', $target.attr('class') + ' hover');
            $target.closest('svg').append($target);
        }

        //show tooltip with data
        var mapId = $target.closest('.polis-map').attr('id');
        var map = that.getMapById(mapId);
        var canton = map.getCantonById($target.attr('id'));
        if ($('#polis-tooltip').length === 0) {
            // $('body').append('<div id="polis-tooltip" class="polis-flyout"><div class="polis-flyout-wrapper"><h3></h3><p><strong>'+SRF.i18n.tr('JA', 'frontend/votes')+'</strong> <span class="yes"></span>% / <strong>'+SRF.i18n.tr('NEIN', 'frontend/votes')+'</strong> <span class="no"></span>%</p></div></div>');
            $('body').append('<div id="polis-tooltip" class="polis-flyout"><div class="polis-flyout-wrapper"><h3></h3><p><strong>' + 'JA' + '</strong> <span class="yes"></span>% / <strong>'+ 'NEIN' +'</strong> <span class="no"></span>%</p></div></div>');
        }
        var $tooltip = $('#polis-tooltip');
        $tooltip.find('.yes').text(canton.yes);
        $tooltip.find('.no').text(canton.no);
        $tooltip.find('h3').text(canton.name);
        $tooltip.show();
    };

    this.doMouseLeave = function($target, isIEWorkaround){
        $target.attr('class', $target.attr('class').replace(' hover', ''));

        $('#polis-tooltip').hide();
    };

    //private methods
    function Canton(parent, id) {
        this.id = id;
        this.$wrapper = $('#' + parent).closest(".polis-container"); // :/
        this.$element = $('#'+parent+' #'+id);
        this.yes = undefined;
        this.no = undefined;
        this.name = undefined;
        this.results = undefined;
        this.decorator = new ColorDecorator();
        this.districtResults = {};

        this.hasResults = function() {
            return this.results !== undefined;
        };

        this.setResultForDistrict = function(key, result) {
            this.districtResults[key] = result;
        };

        this.getNumberOfDistricts = function() {
            return Object.keys(this.districtResults).length;
        };

        this.renderResults = function() {
            console.log(this.$wrapper)
            var $results = this.$wrapper.find('.regional-results-wrapper');
            $results.find('.cantonal h4 span.canton').text(this.name);
            var min = this.results.last_update.minute();
            $results.find('.cantonal h4 span.time').html(this.results.last_update.hour()+':' + ((min > 9) ? min : "0" + min));
            $results.find('.icon').html($('#logo-'+this.id).clone(true));
            $results.find('.icon svg g').attr('class', this.$element.attr('class'));
            //canton
            this.paintResult($results.find('.cantonal'), this.results);

            var $lis = $results.find('.district li'),
                numberOfDistricts = this.getNumberOfDistricts();
            if (numberOfDistricts === 0) {
                $results.find('.toggle-district').hide();
                $results.removeClass('active').addClass('passive');
                return;
            } else {
                $results.find('.toggle-district').show();
            }
            while ($lis.length > numberOfDistricts) {
                $($lis.get(0)).remove();
                $lis = $results.find('.district li');
            }
            while ($lis.length < numberOfDistricts) {
                var newLi = $($lis.get(0)).clone(true);
                $lis.closest('ul').append(newLi);
                $lis = $results.find('.district li');
            }
            $lis = $results.find('.district li');
            var i = 0;
            for (var district in this.districtResults) {
                // important check that this is objects own property
                // not from prototype prop inherited
                if(this.districtResults.hasOwnProperty(district)){
                    $($lis[i]).find('h5').text(district);
                    this.paintResult($($lis[i]), this.districtResults[district]);
                    i++;
                }
            }
        };

        this.paintResult = function($parent, resultSet){
            $parent.find('.yes.absolute .result').text(resultSet.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
            $parent.find('.no.absolute .result').text(resultSet.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
            //bars
            $parent.find('.bar .no.relative').width(resultSet.relative.no+'%');
            $parent.find('.bar .yes.relative').width(resultSet.relative.yes+'%');
            //relative values
            $parent.find('.bar .result.yes').html(parseFloat(resultSet.relative.yes).toFixed(1)+'<span class="symbol">%</span>');
            $parent.find('.bar .result.no').html(parseFloat(resultSet.relative.no).toFixed(1)+'<span class="symbol">%</span>');

            $parent.find('.yes.absolute strong:not(.static)').text(parseFloat(resultSet.relative.yes).toFixed(1)+"%");
            $parent.find('.no.absolute strong:not(.static)').text(parseFloat(resultSet.relative.no).toFixed(1)+"%");
        };

        this.setYes = function(yes) {
            this.yes = yes;
            this.setColor();
        };

        this.setColor = function() {
            if (this.yes === undefined || this.yes === "") {
                this.$element.attr('class', 'initial');
            } else {
                this.$element.addClass(this.decorator.getColorForPercent(this.yes)); // attr('class', this.decorator.getColorForPercent(this.yes));
            }
        };

        this.reset = function() {
            this.yes = undefined;
            this.no = undefined;
            this.results = undefined;
            this.setColor();
        };
    }

    function Map(id, Result) {
        this.id = id;
        this.result = Result;
        this.selectedCanton = undefined;
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

        this.cantonIdMap = {};

        this.getCantonById = function(cantonId) {
            if (this.cantons.hasOwnProperty(cantonId)) {
                return this.cantons[cantonId];
            }
        };

        this.setSelectedCanton = function($cantonId) {
            this.selectedCanton = $cantonId;
        };

        this.resetSelectedCanton = function() {
            this.selectedCanton = null;
        };

        this.setResults = function(vote) {
            this.result = vote;
        };

        this.loadResults = function() {
            var cantonsWithData = [];
            // var that = this;

            // build canton id map
            this.cantonIdMap = {};

            if (this.result && this.result.results) {
                this.result.results.results.forEach(function (result) {
                    var canton;
                    if (result.resultCondition.id == 2 || result.resultCondition.id == 3) { // 2: accepted, 3: declined
                        // its a canton
                        if (result.location.type.id == 2) {
                            if (this.cantons.hasOwnProperty(result.location.shortName)) {
                                canton = this.cantons[result.location.shortName];
                                canton.setYes(result.relative.yes);
                                canton.no = result.relative.no;
                                canton.name = result.location.locationName;
                                canton.results = new ResultSet(result, this);
                                cantonsWithData.push(result.location.shortName);
                            }
                        } else if (result.location.type.id == 3) { // its a district
                            var cantonShortName = this.cantonIdMap[result.location.parentLocationId];
                            if (this.cantons.hasOwnProperty(cantonShortName)) {
                                var resultSet = new ResultSet(result, this);
                                canton = this.cantons[cantonShortName];
                                canton.setResultForDistrict(result.location.locationName, resultSet);
                            }
                        }
                    }
                }.bind(this));

                this.result.results.results.forEach(function (result) {
                    if (result.location.type.id == 2) {
                        this.cantonIdMap[result.location.id] = result.location.shortName;
                    }
                }.bind(this));
            }

            // reset those cantons without data
            Object.keys(this.cantons).forEach(function(canton) {
                if (cantonsWithData.indexOf(canton) == -1) {
                    this.cantons[canton].reset();

                    // if selected canton has no data anymore, reset it
                    if (this.selectedCanton === canton) {
                        this.resetSelectedCanton();
                    }
                }
            }.bind(this));

            this.generateMobileNavigation();
        };

        this.updateResults = function(vote) {
            this.setResults(vote);
            this.loadResults();
            this.generateMobileNavigation();
            if (this.selectedCanton && this.cantons[this.selectedCanton]) {
                this.cantons[this.selectedCanton].renderResults();
            }
        };

        this.generateMobileNavigation = function() {
            var $select = $('#' + this.id).closest('.polis-container').find('.menu');
            // console.log($select.find("option"))
            $select.find("option").addClass("polis-select-option--hide");
            for (var cantonId in this.cantons) {
                console.log(this.cantons[cantonId]);
                if (this.cantons[cantonId].hasResults()) {
                    $select.find("option[value" + cantonId + "]").removeClass("polis-select-option--hide");
                }
            }
        };
    }

    function ResultSet(result, map) {

        this.last_update = result.update; // moment(result.update);
        this.relative = {
            yes: result.relative.yes,
            no: result.relative.no,
            participation: result.relative.participation
        };
        this.absolute = {
            yes: result.absolute.yes,
            no: result.absolute.no
        };

        this.map = map;

        this.num_cantons = Object.keys(map.cantonIdMap).length;
        // this.state = (this.num_cantons == 26) ? SRF.i18n.tr('Endresultat', 'frontend/votes') : SRF.i18n.tr('Zwischenresultat', 'frontend/votes');
        this.state = (this.num_cantons == 26) ? 'Endresultat' : 'Zwischenresultat';
    }

    function ColorDecorator() {
        this.getColorForPercent = function(percent) {
            return 'res-'+this.getBracket(percent);
        };
        this.getBracket = function(x) {
            if (x <= 35) {
                return 0;
            }
            if (x <= 40) {
                return 40;
            }
            if (x <= 45) {
                return 45;
            }
            if (x <= 50) {
                return 50;
            }
            if (x <= 55) {
                return 55;
            }
            if (x <= 60) {
                return 60;
            }
            if (x <= 65) {
                return 65;
            }
            return 100;
        };
    }
};
