export function init() {
    AmCharts.ready(function () {
        $('.chart').each(function () {
            loadChart($(this));
        });

        function loadChart($element) {
            var url = $element.data('src');

            $.getJSON(url, function (settings) {

                if (settings['graphs']) {
                    if (settings['graphs'].length >= 5) {
                        $element.addClass('mobile').addClass('line');
                    }
                }
                if (settings['type'] === 'pie') {
                    if (settings['dataProvider'].length >= 7) {
                        $element.addClass('mobile').addClass('pie');
                    }
                }

                var chart = AmCharts.makeChart($element.attr('id'), settings);
                /* if (chart.legend) {
                 chart.legend.addListener("showItem", updateTextLength);
                 chart.legend.addListener("hideItem", updateTextLength);
                 } */
            });
        }
    });
}
