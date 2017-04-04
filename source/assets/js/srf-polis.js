let maps = {}; // id => Map object
const REFRESH_INTERVAL = 30000;
// for features like clickable map, tooltips
const DESKTOP_BREAKPOINT = 600;
const CANTONS = ['AG', 'AR', 'AI', 'BL', 'BS', 'BE', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SH', 'SZ', 'SO', 'SG', 'TI', 'TG', 'UR', 'VD', 'VS', 'ZG', 'ZH'];

export function init() {
    let $maps = $(css.polisWrapper);
    if ($maps.length) {
        $maps.each(function () {
            initMap($(this));
        });
    }
}

let css = {
    // map stuff and general stuff
    polisMap: '.polis-map',
    polisWrapper: '.polis-container',
    svgMap: '.chmap--desktop',
    cantonSelect: '.polis-cantons-container .menu',
    cantonSelectHiddenClass: 'polis-select-option--hide',
    tooltip: '#polis-tooltip',
    tooltipTextYes: '.chmap-tooltip-text__yes',
    tooltipTextYesClass: 'chmap-tooltip-text__yes',
    tooltipTextNo: '.chmap-tooltip-text__no',
    tooltipTextNoClass: 'chmap-tooltip-text__no',
    tooltipText: '.chmap-tooltip-text',
    tooltipTitle: '.chmap-tooltip__title',
    mapPolygons: '.chmap--no-touch g',

    // main bar stuff
    mainBar: '.polis-result-container--main',
    totalAbsoluteYesResult: '.polis-result-total--absoluteYes',
    totalAbsoluteNoResult: '.polis-result-total--absoluteNo',
    totalRelativeYesBar: '.polis-result-total--yesBar',
    totalRelativeNoBar: '.polis-result-total--noBar',
    totalRelativeYesResult: '.polis-result-total-relativeYes',
    totalRelativeNoResult: '.polis-result-total-relativeNo',
    cantonalMajorityYesBar: '.polis-result-cantonalmajority--yesBar',
    cantonalMajorityNoBar: '.polis-result-cantonalmajority--noBar',
    cantonalMajorityYesResult: '.polis-result-cantonalmajority-yesResult',
    cantonalMajorityNoResult: '.polis-result-cantonalmajority-noResult',
    participation: '.polis-map__participation',
    statusLine: '.polis-result-total--statusline',


// cantonal stuff
    cantonContainer: '.polis-cantons-container',

}

function initMap($container) {
    let $map = $container.find(css.polisMap);
    let id = $map.attr('id') + "";
    let map = new PolisMap(id, $container, $map, $map.data('vote'), $map.data('api'), $map.data("has-cantonal-majority"));
    map.fetchData();
    map.registerListener();
    window.setInterval(map.fetchData(), REFRESH_INTERVAL);
    maps[id] = map;
}

function PolisMap(cssId, $container, $map, voteId, apiUrl, hasCantonalMajority) {

    this.id = cssId;
    this.$container = $container;
    this.$map = $map;
    this.voteId = voteId;
    this.apiUrl = apiUrl;
    // cantonalMajority = Ständemehr
    this.hasCantonalMajority = hasCantonalMajority == 1 ? true : false;
    this.mainBar = null;
    this.$mainBar = null;
    this.caseDate = '';
    this.lastUpdate = '';
    this.isInitialRender = true;
    this.result = null;
    this.selectedCanton = undefined;

    this.cantonIdMap = {};
    this.cantons = {};
    let $cantonContainer = this.$container.find(css.cantonContainer);
    CANTONS.forEach((canton) => {
        this.cantons[canton + ""] = new Canton(this.id, canton, $cantonContainer);
    });


    this.getCantonById = function (cantonId) {
        if (this.cantons.hasOwnProperty(cantonId)) {
            return this.cantons[cantonId];
        }
    };

    this.registerListener = function () {
        let that = this;

        $(css.cantonSelect).on('change', function () {
            that.onCantonSelect($(this));
        });
        if (screen.width >= DESKTOP_BREAKPOINT) {
            that.registerWideScreenListener();
        }
    };

    // have tooltips and clickable map
    this.registerWideScreenListener = function () {
        let that = this;
        let $polygons = that.$container.find(css.mapPolygons);
        $polygons.on('click', function () {

        }).on('mousemove', function (event) {
            that.onMapMouseMove(event.pageX, event.pageY);
        }).on('mouseenter', function () {
            that.onMapMouseEnter($(this));
        }).on('mouseleave', function () {
            that.onMapMouseLeave($(this));
        });

    };
    this.onMapMouseEnter = function ($target) {
        console.log("onmapmouseenter");
        if ($target.is('.initial')) {
            $(css.tooltip).hide();
            return;
        }
        let canton = this.getCantonById($target.attr('id'));
        if ($(css.tooltip).length === 0) {

            $('body').append('<div id="polis-tooltip" class="chmap-tooltip">' +
                '<p class="chmap-tooltip__title"></p>' +
                '<p class="chmap-tooltip-text"><span class="chmap-tooltip-text__yes"></span>% JA</p>&nbsp;' +
                '<p class="chmap-tooltip-text"><span class="chmap-tooltip-text__no"></span>% NEIN</p>' +
                '</div>');
        }
        let $tooltip = $(css.tooltip);

        $tooltip.find(css.tooltipTextYes).text(canton.yes);
        $tooltip.find(css.tooltipTextNo).text(canton.no);
        $tooltip.find(css.tooltipText).removeClass(css.tooltipTextNoClass + " " + css.tooltipTextYesClass);
        if (canton.no > canton.yes) {
            $tooltip.find(css.tooltipTextNo)
                .closest(css.tooltipText)
                .addClass(css.tooltipTextNoClass);
        } else {
            $tooltip.find(css.tooltipTextYes)
                .closest(css.tooltipText)
                .addClass(css.tooltipTextYesClass);
        }
        $tooltip.find(css.tooltipTitle).text(canton.name);
        $tooltip.show();
    };
    this.onMapMouseLeave = function ($target) {
        console.log("onmapmouseenter");

        $target.attr('class', $target.attr('class').replace(' hover', ''));
    };

    this.onMapMouseMove = function (x, y) {

        let parentOffset = $('.chmap--desktop').parent().offset();
        let pageY = y - 90; // event.pageY - parentOffset.top - 58,
        let pageX = x - parentOffset.left + 15;
        let $tooltip = $(css.tooltip);

        let cssClass = "left";
        if (pageX > $('.chmap--desktop').parent().width() / 2) {
            cssClass = "right";
            pageX = pageX - $tooltip.outerWidth();
        }
        $tooltip.css({"top": pageY, "left": pageX})
            .removeClass("chmap-tooltip--left chmap-tooltip--right")
            .addClass("chmap-tooltip--" + cssClass);
    };

    this.onMapMouseDown = function ($clicked) {
        let cantonId = $clicked.closest('g').attr('id');
        let canton = that.getCantonById(cantonId);
        this.selectedCanton = cantonId;
        canton.renderResults();
        // ????
        //$clicked.closest('.vote').find('.regional-results-wrapper').show();
    };

    this.onCantonSelect = function ($clicked) {
        let cantonId = $clicked.val();
        this.selectedCanton = cantonId;
        let canton = this.getCantonById(cantonId);
        canton.renderResults();

        // TO DO: show districts toggle if district results are available

    };


    this.fetchData = function () {
        let that = this;
        $.getJSON(that.apiUrl, function (data) {
            if (data.votes && data.votes[that.voteId]) {
                that.result = data.votes[that.voteId];
                that.caseDate = data.voteCase.date; // TO DO:  moment(data.voteCase.date);

                if (that.isInitialRender) {
                    that.loadResults();
                    that.isInitialRender = false;
                    that.$mainBar = that.$container.find(css.mainBar);
                    that.mainBar = new MainBar(that);
                    that.mainBar.update();
                } else {
                    that.updateResults();
                    that.mainBar.update();
                }
            }
            else {
                // TO DO: might clear interval..
                console.log(`API error: no data for voteId '${that.voteId}' via endpoint '${that.apiUrl}'`);
            }
        });

    };


    this.loadResults = function () {
        let cantonsWithData = [];

        // build canton id map
        this.cantonIdMap = {};

        if (this.result && this.result.results) {

            // build a map cantonId -> cantonShortName
            this.result.results.results.forEach(function (result) {
                if (result.location.type.id == 2) {
                    this.cantonIdMap[result.location.id] = result.location.shortName;
                }
            }.bind(this));

            this.result.results.results.forEach(function (result) {
                let canton;
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
                        let cantonShortName = this.cantonIdMap[result.location.parentLocationId];
                        if (this.cantons.hasOwnProperty(cantonShortName)) {
                            let resultSet = new ResultSet(result, this);
                            canton = this.cantons[cantonShortName];
                            canton.setResultForDistrict(result.location.locationName, resultSet);
                        }
                    }
                }
            }.bind(this));


        }

        // reset those cantons without data
        Object.keys(this.cantons).forEach(function (canton) {
            if (cantonsWithData.indexOf(canton) == -1) {
                this.cantons[canton].reset();

                // if selected canton has no data anymore, reset it
                if (this.selectedCanton === canton) {
                    this.resetSelectedCanton();
                }
            }
        }.bind(this));


    };

    this.updateResults = function (vote) {
        this.loadResults();
        this.renderCantonSelect();
        if (this.selectedCanton && this.cantons[this.selectedCanton]) {
            this.cantons[this.selectedCanton].renderResults();
        }
    };

    this.renderCantonSelect = function () {
        let $select = this.$container.find(css.cantonSelect);
        $select.find("option").addClass(css.cantonSelectHiddenClass);
        for (let cantonId in this.cantons) {
            if (this.cantons[cantonId].hasResults()) {
                $select.find("option[value=" + cantonId + "]").removeClass(css.cantonSelectHiddenClass);
            }
        }
    };
}


function MainBar(map) {
    this.map = map;

    this.update = function () {
        if (this.map.result.results && this.map.result.results.nationalResults) {
            let nationalResults = new ResultSet(this.map.result.results.nationalResults, map) || {};
            let cantonalResults = new ResultSet(this.map.result.cantonalResult, map) || {};
            this.render(nationalResults, cantonalResults, this.calcLastUpdated(this.map.result));
        }
    };

    this.calcLastUpdated = function (vote) {
        let lastUpdated = null;
        vote.results.results.forEach(function (result) {
            let ts = new Date(result.update).getTime();
            if (lastUpdated == null || ts > lastUpdated) {
                lastUpdated = ts;
            }
        }.bind(this));
        return new Date(lastUpdated);
    };

    this.render = function (nationalResults, cantonalResults, lastMod) {
        // to do: LOADS of dom access here, that could be done once only...
        this.renderMainBar(nationalResults);
        this.renderStateLine(nationalResults, lastMod);
        this.renderCantonalMajority(cantonalResults);
    };
    this.renderMainBar = function (nationalResults) {
        let $content = this.map.$mainBar.closest('.content');

        //absolute
        this.map.$mainBar.find(css.totalAbsoluteYesResult).text(nationalResults.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        this.map.$mainBar.find(css.totalAbsoluteNoResult).text(nationalResults.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        //bars
        this.map.$mainBar.find(css.totalRelativeYesBar).width(nationalResults.relative.yes + '%');
        this.map.$mainBar.find(css.totalRelativeNoBar).width(nationalResults.relative.no + '%');
        //relative values
        this.map.$mainBar.find(css.totalRelativeYesResult).html(parseFloat(nationalResults.relative.yes).toFixed(1));
        this.map.$mainBar.find(css.totalRelativeNoResult).html(parseFloat(nationalResults.relative.no).toFixed(1));

        // stimmbeteiligung text
        if (nationalResults.relative.participation) {
            // content.find('.polis-participation').text(SRF.i18n.tr('Stimmbeteiligung', 'frontend/votes')+': '+resultSet.relative.participation+'%');
            $content.find(css.participation).text('Stimmbeteiligung' + ': ' + nationalResults.relative.participation + '%');
        } else {
            $content.find(css.participation).text('');
        }
    };
    this.renderStateLine = function (nationalResults, lastMod) {
        let $statusLine = this.map.$container.find(css.statusLine);
        if (nationalResults.num_cantons < 26) {
            $statusLine.html(`
                <span class="polis-result-title__type">${nationalResults.state}</span> 
                vom <time class="polis-result-title__time">${lastMod.getDate()}.${lastMod.getMonth() + 1}.${lastMod.getFullYear()}</time> 
                um <time class="polis-result-title__time">${lastMod.getHours()}:${lastMod.getMinutes()}</time> Uhr (${nationalResults.num_cantons} von 26 Kantonen)
            `);
        } else {
            lastMod = new Date(this.map.caseDate);
            $statusLine.html(`
                <span class="polis-result-title__type">${nationalResults.state}</span>  
                vom <time class="polis-result-title__time">${lastMod.getDate()}.${lastMod.getMonth() + 1}.${lastMod.getFullYear()}</time> 
            `);
        }
    };
    this.renderCantonalMajority = function (cantonalResults) {
        if (this.map.hasCantonalMajority) {
            this.map.$container.find(css.cantonalMajorityYesResult).text(cantonalResults.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
            this.map.$container.find(css.cantonalMajorityNoResult).text(cantonalResults.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
            this.map.$container.find(css.cantonalMajorityYesBar).width(cantonalResults.relative.yes + '%');
            this.map.$container.find(css.cantonalMajorityNoBar).width(cantonalResults.relative.no + '%');
        }
    }
}

function Canton(parent, id, $container) {
    this.id = id;
    this.$element = $('#' + parent + ' #' + id);
    this.$container = $container;
    this.yes = undefined;
    this.no = undefined;
    this.name = undefined;
    this.results = undefined;
    this.decorator = new ColorDecorator();
    this.districtResults = {};

    this.hasResults = function () {
        return this.results !== undefined;
    };

    this.setResultForDistrict = function (key, result) {
        this.districtResults[key] = result;
    };

    this.getNumberOfDistricts = function () {
        return Object.keys(this.districtResults).length;
    };

    this.renderResults = function () {
        var $results = this.$container.find(css.regionalResultWrapper);
        $results.find('.cantonal h4 span.canton').text(this.name);
        var min = this.results.last_update.minute();
        $results.find('.cantonal h4 span.time').html(this.results.last_update.hour() + ':' + ((min > 9) ? min : "0" + min));
        $results.find('.icon').html($('#logo-' + this.id).clone(true));
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
            if (this.districtResults.hasOwnProperty(district)) {
                $($lis[i]).find('h5').text(district);
                this.paintResult($($lis[i]), this.districtResults[district]);
                i++;
            }
        }
    };

    this.paintResult = function ($parent, resultSet) {
        $parent.find('.yes.absolute .result').text(resultSet.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        $parent.find('.no.absolute .result').text(resultSet.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        //bars
        $parent.find('.bar .no.relative').width(resultSet.relative.no + '%');
        $parent.find('.bar .yes.relative').width(resultSet.relative.yes + '%');
        //relative values
        $parent.find('.bar .result.yes').html(parseFloat(resultSet.relative.yes).toFixed(1) + '<span class="symbol">%</span>');
        $parent.find('.bar .result.no').html(parseFloat(resultSet.relative.no).toFixed(1) + '<span class="symbol">%</span>');

        $parent.find('.yes.absolute strong:not(.static)').text(parseFloat(resultSet.relative.yes).toFixed(1) + "%");
        $parent.find('.no.absolute strong:not(.static)').text(parseFloat(resultSet.relative.no).toFixed(1) + "%");
    };

    this.setYes = function (yes) {
        this.yes = yes;
        this.setColor();
    };

    this.setColor = function () {
        if (this.yes === undefined || this.yes === "") {
            this.$element.attr('class', 'initial');
        } else {
            this.$element.attr('class', this.decorator.getColorForPercent(this.yes));
        }
    };

    this.reset = function () {
        this.yes = undefined;
        this.no = undefined;
        this.results = undefined;
        this.setColor();
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
    this.getColorForPercent = function (percent) {
        return 'res-' + this.getBracket(percent);
    };
    this.getBracket = function (x) {
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
