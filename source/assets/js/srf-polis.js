let maps = {}; // id => Map object
const REFRESH_INTERVAL = 30000;
// for features like clickable map, tooltips
const DESKTOP_BREAKPOINT = 600;


export function init() {
    let $maps = $(css.polisWrapper);
    if ($maps.length) {
        $maps.each(function () {
            initMap($(this));
        });
    }
}

let css = {
    polisMap: '.polis-map',
    polisWrapper: '.polis-container',
    svgMap: '.chmap--desktop',
    cantonSelect: '.polis-cantons-container .menu',
    cantonSelectHiddenClass: 'polis-select-option--hide',


///////////////////////////////
    'votes': '.vote',
    'regionalResults': '.regional-results',
    'regionalResultsWrapper': '.regional-results-wrapper',
    'regionalResultsMessage': '.regional-results-message',

    'districtItem': '.district li',
    'regionalDistrictToggle': '.regional-results, .toggle-district',

    'resultNavigationSelect': '.regional-results-select select',
    'selection': 'span.selection',
    'mainResultBar': '.main-result-bar',
    'cantonalMajority': '.result.bars.cantonal .bar',
    'absoluteResultYes': '.yes.absolute .result',
    'absoluteResultNo': '.no.absolute .result',
    'barResultYes': '.bar .yes.relative',
    'barResultNo': '.bar .no.relative',
    'relativeResultYes': '.bar .result.yes',
    'relativeResultNo': '.bar .result.no',
    'participation': '.polis-participation',
    'tooltip': '#polis-tooltip'
}

function initMap($container) {
    let $map = $container.find(css.polisMap);
    let id = $map.attr('id') + "";
    let map = new PolisMap(id, $container, $map, $map.data('vote'), $map.data('api'));
    map.fetchData();
    map.registerListener();
    window.setInterval(map.fetchData(), REFRESH_INTERVAL);
    maps[id] = map;
}

function PolisMap(cssId, $container, $map, voteId, apiUrl) {

    this.id = cssId;
    this.$container = $container;
    this.$map = $map;
    this.voteId = voteId;
    this.apiUrl = apiUrl;
    this.caseDate = '';
    this.lastUpdate = '';
    this.isInitialRender = true;
    this.result = null;
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

    this.getCantonById = function (cantonId) {
        if (this.cantons.hasOwnProperty(cantonId)) {
            return this.cantons[cantonId];
        }
    };

    this.registerListener = function () {
        var that = this;
        // mobile canton results navigation
        $('.vote .regional-results-select select').on('change', function () {

        });
        if (screen.width >= DESKTOP_BREAKPOINT) {
            // have tooltips and clickable map
            $(css.svgMap).on("focus mousedown", "a", function () {
                that.onMapMouseDown($(this));
            });
        }
    };

    this.onMapMouseDown = function ($clicked) {
        let cantonId = $clicked.closest('g').attr('id');
        let canton = that.getCantonById(cantonId);
        that.setSelectedCanton(cantonId);
        canton.renderResults();
        // ????
        //$clicked.closest('.vote').find('.regional-results-wrapper').show();
    }

    this.setSelectedCanton = function ($cantonId) {
        this.selectedCanton = $cantonId;
    };

    this.resetSelectedCanton = function () {
        this.selectedCanton = null;
    };

    this.fetchData = function () {
        var that = this;
        $.getJSON(that.apiUrl, function (data) {
            if (data.votes && data.votes[that.voteId]) {
                that.result = data.votes[that.voteId];
                that.caseDate = data.voteCase.date; // TO DO:  moment(data.voteCase.date);

                if (that.isInitialRender) {
                    that.loadResults();
                    that.isInitialRender = false;
                    // that.updateMainBar(domId, vote, myMap);
                } else {
                    that.updateResults();
                    // that.updateMainBar(domId, vote, myMap);
                    //that.updateCantonalMajority(domId, vote);
                }
            }
            else {
                // TO DO: might clear interval..
                console.log(`API error: no data for voteId '${that.voteId}' via endpoint '${that.apiUrl}'`);
            }
        });

    }

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


function Canton(parent, id) {
    this.id = id;
    this.$wrapper = $('#' + parent).closest('.vote');
    this.$element = $('#' + parent + ' #' + id);
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
        var $results = this.$wrapper.find('.regional-results-wrapper');
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
