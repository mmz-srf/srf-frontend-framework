const REFRESH_INTERVAL = 30000;
// in px; for non-touch features like clickable map, tooltips
const DESKTOP_BREAKPOINT = 500;

const CANTON_NAMES = ["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Genf", "Glarus", "Graubünden", "Jura", "Luzern", "Neuenburg", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Tessin", "Thurgau", "Uri", "Waadt", "Wallis", "Zug", "Zürich"];
const CANTON_SHORT_NAMES = ["AG", "AR", "AI", "BL", "BS", "BE", "FR", "GE", "GL", "GR", "JU", "LU", "NE", "NW", "OW", "SH", "SZ", "SO", "SG", "TI", "TG", "UR", "VD", "VS", "ZG", "ZH"];

export function init() {
    let $maps = $(css.polisWrapper);
    if ($maps.length) {
        $maps.each(function () {
            initMap($(this));
        });
    }
}

let css = {
    // map
    polisMap: '.polis-map',
    polisWrapper: '.polis-container',
    cantonSelect: '.js-polis-menu',
    hiddenClass: 'polis--hide',
    tooltip: '#polis-tooltip',
    tooltipTextYes: 'chmap-tooltip-text--yes',
    tooltipTextNo: 'chmap-tooltip-text--no',
    mapPolygons: '.chmap--no-touch g',
    // main bar
    mainBarContainer: '.polis-result-container--main',
    totalAbsoluteYesResult: '.js-polis-result-total--absoluteYes',
    totalAbsoluteNoResult: '.js-polis-result-total--absoluteNo',
    totalRelativeYesBar: '.js-polis-result-total--yesBar',
    totalRelativeNoBar: '.js-polis-result-total--noBar',
    totalRelativeYesResult: '.js-polis-result-total-relativeYes',
    totalRelativeNoResult: '.js-polis-result-total-relativeNo',
    cantonalMajorityYesBar: '.js-polis-result-cantonalmajority--yesBar',
    cantonalMajorityNoBar: '.js-polis-result-cantonalmajority--noBar',
    cantonalMajorityYesResult: '.js-polis-result-cantonalmajority-yesResult',
    cantonalMajorityNoResult: '.js-polis-result-cantonalmajority-noResult',
    defaultColor: 'polis-result--default',
    participation: 'js-polis-participation',
    statusLine: '.js-polis-result-total--statusline',
    // canton detail view
    cantonContainer: '.polis-cantons-container',
    cantonTitle: '.polis-result-title--canton-name',
    cantonTitleTime: '.polis-result-title--canton-time',
    districtsWrapper: '.polis-districts-wrapper',
    districtContainer: '.polis-district-container',
    cantonalMainResult: '.polis-result-container--canton'
};

function initMap($container) {
    let $map = $container.find(css.polisMap);
    let id = $map.attr('id') + "";
    let map = new PolisMap(id, $container, $map, $map.data('vote'), $map.data('api'), $map.data("has-cantonal-majority"));
    map.fetchData();
    map.registerListener();
    window.setInterval(map.fetchData.bind(map), REFRESH_INTERVAL);
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
    this.$tooltip = null;
    this.caseDate = '';
    this.lastUpdate = '';
    this.isInitialRender = true;
    this.result = null;
    this.selectedCanton = undefined;

    this.cantonIdMap = {};
    this.cantons = {};
    let $cantonContainer = this.$container.find(css.cantonContainer);
    CANTON_SHORT_NAMES.forEach(abbr => {
        this.cantons[abbr + ""] = new Canton(this.id, abbr, $cantonContainer);
    });
    this.getCantonById = function (cantonId) {
        if (this.cantons.hasOwnProperty(cantonId)) {
            return this.cantons[cantonId];
        }
    };

    this.registerListener = function () {
        let that = this;

        that.$container.find(css.cantonSelect).on('change', function () {
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

        $polygons.on('focus click', function (event) {
            event.preventDefault();
            that.onMapClick($(this));
        }).on('mousemove', function (event) {
            that.onMapMouseMove(event.pageX, event.pageY);
        }).on('mouseenter', function () {
            that.onMapMouseEnter($(this));
        }).on('mouseleave', function () {
            that.onMapMouseLeave($(this));
        });

        // for polygons with shadow (clicked)
        $("#selector-" + voteId).on('mouseenter', function () {
            that.onMapMouseEnter($(this));
        }).on('mousemove', function (event) {
            that.onMapMouseMove(event.pageX, event.pageY);
        }).on('mouseleave', function () {
            that.onMapMouseLeave($(this));
        });
    };

    this.onMapMouseEnter = function ($target) {
        let cantonId = '';
        if ($target.is('.polis-initial') && this.$tooltip) {
            return;
        } else if ($target.is("use")) {
            cantonId = this.extractCantonId($target.attr("xlink:href").substr(1));
        } else {
            cantonId = this.extractCantonId($target.attr('id'));
        }
        let canton = this.getCantonById(cantonId);
        let html = this.getToolTipContent(canton.name, canton.yes, canton.no);
        if ($(css.tooltip).length === 0) {
            $('body').append('<div id="polis-tooltip" class="chmap-tooltip polis--hide">' + html + '</div>');
        } // there's only one tooltip per page
        if (this.$tooltip === null) {
            this.$tooltip = $(css.tooltip);
        }
        this.$tooltip.html(html);
        if (canton.yes && canton.no) {
            this.$tooltip.removeClass(css.hiddenClass);
        }
    };

    this.extractCantonId = function (cantonId) {
        cantonId = cantonId.split("-")[0];
        return cantonId;
    };

    this.onMapMouseLeave = function ($target) {
        this.$tooltip.addClass(css.hiddenClass);
    };

    this.onMapMouseMove = function (x, y) {
        let pageY = y - this.$tooltip.outerHeight() - 20; // 90;
        let pageX = x;

        let cssClass = "left";
        if (pageX > $(window).width() / 2) {
            cssClass = "right";
            pageX = pageX - this.$tooltip.outerWidth();
        }

        this.$tooltip.css({"top": pageY, "left": pageX})
            .removeClass("chmap-tooltip--left chmap-tooltip--right")
            .addClass("chmap-tooltip--" + cssClass);
    };

    this.onMapClick = function ($clicked) {
        if ($clicked.is('.polis-initial')) {
            return;
        }
        let cantonId = this.extractCantonId($clicked.closest('g').attr('id'));
        let canton = this.getCantonById(cantonId);
        this.selectedCanton = cantonId;
        this.$container.find(css.cantonSelect).val(cantonId);
        canton.renderResults();
        this.markSelectedCanton(cantonId);
    };

    this.onCantonSelect = function ($clicked) {
        let cantonId = $clicked.val();
        let canton = this.getCantonById(cantonId);
        this.selectedCanton = cantonId;
        canton.renderResults();
        this.markSelectedCanton(cantonId);
    };

    this.markSelectedCanton = function (cantonId) {
        // repaint chosen canton (on top)
        $("#selector-" + this.id).attr("xlink:href", "#" + cantonId + "-" + this.id);
        this.$container.find(".chmap__location").removeClass("chmap__location--shadow");
        this.$container.find("#" + cantonId + "-" + this.id).addClass("chmap__location--shadow");
    };

    this.getToolTipContent = function (name = "", yes = "", no = "") {
        let noClass = '';
        let yesClass = '';

        if (no > yes) {
            noClass = css.tooltipTextNo;
        } else {
            yesClass = css.tooltipTextYes;
        }
        return `<p class="chmap-tooltip__title">${name}</p>
                    <p class="chmap-tooltip-text ${yesClass}">${yes}% JA</p>&nbsp;
                    <p class="chmap-tooltip-text ${noClass}">${no}% NEIN</p>`;
    };

    this.fetchData = function () {
        let that = this;
        $.getJSON(that.apiUrl, function (data) {
            if (data.votes && data.votes[that.voteId]) {
                that.result = data.votes[that.voteId];
                that.caseDate = data.voteCase.date;

                if (that.isInitialRender) {
                    that.loadResults();
                    that.isInitialRender = false;
                    that.$mainBar = that.$container.find(css.mainBarContainer);
                    that.mainBar = new MainBar(that);
                    that.mainBar.update();
                    that.renderCantonSelect();
                } else {
                    that.updateResults();
                    that.mainBar.update();
                }
            }
        });
    };

    this.loadResults = function () {
        let cantonsWithData = [];
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

    this.getCantonSelectOption = function (cantonId) {
        let index = CANTON_SHORT_NAMES.indexOf(cantonId);
        let selected = this.selectedCanton === cantonId ? 'selected' : '';
        return `<option value="${cantonId}" ${selected}>${CANTON_NAMES[index]}</option> `;
    }

    // no hiding of options via CSS because of Safari
    this.renderCantonSelect = function () {
        let $select = this.$container.find(css.cantonSelect);
        let options = '';
        let i = 0;
        for (let cantonId in this.cantons) {
            if (this.cantons[cantonId].hasResults()) {
                options += this.getCantonSelectOption(cantonId);
                i++;
            }
        }
        options = `<option value="">Kanton wählen</option>${options}`;
        $select.html(options);
        if (i === 0) { // inactive menu if there's no option to select
            $select.attr("disabled", true);
        } else {
            $select.attr("disabled", false)
            $select.removeClass("menu--inactive");
        }
    };
}

function MainBar(map) {
    this.map = map;

    this.update = function () {
        this.map.$mainBar.find(".polis-result__bar--main").removeClass(css.defaultColor);
        if (this.map.result.results && this.map.result.results.nationalResults) {
            let nationalResults = new ResultSet(this.map.result.results.nationalResults, map) || {};
            let cantonalResults = new ResultSet(this.map.result.cantonalResult, map) || {};
            this.render(nationalResults, cantonalResults, this.calcLastUpdated(this.map.result));
        }
        else {
            this.map.$mainBar.find(".polis-result__bar--main").addClass(css.defaultColor);
            this.map.$container.find(css.statusLine).text("Noch keine Resultate");
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
        this.renderMainBar(nationalResults);
        this.renderStateLine(nationalResults, lastMod);
        this.renderCantonalMajority(cantonalResults);
    };

    this.renderMainBar = function (nationalResults) {
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
            let $participation = this.map.$mainBar.closest(css.polisWrapper).find(css.participation);
            // content.find('.polis-participation').text(SRF.i18n.tr('Stimmbeteiligung', 'frontend/votes')+': '+resultSet.relative.participation+'%');
            $participation.text(nationalResults.relative.participation);
            $participation.closest(css.hiddenClass).removeClass(css.hiddenClass);
        }
    };

    this.renderStateLine = function (nationalResults, lastMod) {
        let $statusLine = this.map.$container.find(css.statusLine);
        if (nationalResults.num_cantons < 26) {
            $statusLine.html(`
                <span class="polis-result-title__type">${nationalResults.state}</span> 
                vom <time class="polis-result-title__time">${lastMod.getDate()}.${lastMod.getMonth() + 1}.${lastMod.getFullYear()}</time> 
                um <time class="polis-result-title__time">${lastMod.getHours()}:${('0' + lastMod.getMinutes()).slice(-2)}</time> Uhr (${nationalResults.num_cantons} von 26 Kantonen)
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

function Canton(parentId, id, $container) {
    this.id = id;
    this.$element = $('#' + parentId + ' #' + id + "-" + parentId);
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
        // hidden on page load only
        this.$container.find(css.districtsWrapper).show();

        let lastUpdate = new Date(this.results.last_update);
        let min = lastUpdate.getMinutes();
        let hours = lastUpdate.getHours() - 1;

        this.$container.find(css.cantonTitle).text(this.name);
        this.$container.find(css.cantonTitleTime).html(hours + ':' + ((min > 9) ? min : "0" + min));

        this.renderMainResults();
        this.renderDistricts();
    };

    this.renderMainResults = function () {
        let $results = this.$container.find(css.cantonalMainResult);
        $results.find(css.totalAbsoluteYesResult).text(this.results.absolute.yes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
        $results.find(css.totalAbsoluteNoResult).text(this.results.absolute.no.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'"));

        //bars
        $results.find(css.totalRelativeYesBar).width(this.results.relative.yes + "%");
        $results.find(css.totalRelativeNoBar).width(this.results.relative.no + "%");
        //relative values
        $results.find(css.totalRelativeYesResult).html(parseFloat(this.results.relative.yes).toFixed(1));
        $results.find(css.totalRelativeNoResult).html(parseFloat(this.results.relative.no).toFixed(1));

    };

    this.getDistrictContent = function (name = "", yes = 0, no = 0) {
        let yesClass = yes > no ? 'polis-district--yes' : '';
        let noClass = no > yes ? 'polis-district--no' : '';
        return `
            <li class="polis-district">
                <span class="polis-district__name">${name}</span>
                <span class="polis-district__votes ${yesClass}">${yes.toFixed(1)}% JA</span>
                <span class="polis-district__votes ${noClass}">${no.toFixed(1)}% NEIN</span>
            </li>`;
    };
    this.renderDistricts = function () {
        let $districtContainer = this.$container.find(css.districtContainer);
        let html = '';
        for (let district in this.districtResults) {
            html += this.getDistrictContent(district, this.districtResults[district].relative.yes, this.districtResults[district].relative.no);
        }
        $districtContainer.html('').html(html);
    };

    this.setYes = function (yes) {
        this.yes = yes;
        this.setColor();
    };

    this.setColor = function () {
        if (this.yes === undefined || this.yes === "") {
            this.$element.attr('class', 'polis-initial chmap__location');
        } else {
            this.$element.attr('class', this.decorator.getColorForPercent(this.yes) + ' chmap__location');
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

    this.last_update = result.update;
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
