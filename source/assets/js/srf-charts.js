export function init() {
    if (typeof AmCharts !== 'undefined') {
        if (AmCharts.isReady) {
            $('.chart').each(function () {
                loadChart($(this));
            });
        } else {
            AmCharts.ready(function () {
                $('.chart').each(function () {
                    loadChart($(this));
                });
            });
        }
    }
}

function loadChart($element) {

    $.getJSON($element.data('src'), function (settings) {

        if (settings['graphs']) {
            if (settings['graphs'].length >= 5) {
                $element.addClass('line');
            }
        }
        if (settings['type'] === 'pie') {
            if (settings['dataProvider'].length >= 7) {
                $element.addClass('pie');
            }
        }

        let chart = AmCharts.makeChart($element.attr('id'), settings);
        chart.addListener('drawn', updateTextLength);
        updateTextLength();
    });
}

function updateTextLength() {
    let boxWidth = 0;
    $('.chart').each(function () {
        let chart = $(this);
        let legend = chart.find('.amcharts-legend-bg');
        if (legend.length) {
            boxWidth = parseInt(legend[0].getBoundingClientRect().width, 10) - 24;
            let string = '';
            chart.find('.amcharts-legend-label').each(function () {
                let that = $(this);
                string = that.find('tspan');
                if (that[0].getBoundingClientRect().width >= boxWidth) {
                    let k = 6;
                    let end = parseInt((boxWidth / k), 10);
                    if (string.text().length <= end) {
                        k = 7;
                        end = parseInt((boxWidth / k), 10);
                    }
                    string.text(string.text().substring(0, end) + ' ...');
                }
            });
        }
    });
}

