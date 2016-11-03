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
                        $element.addClass('line');
                    }
                }
                if (settings['type'] === 'pie') {
                    if (settings['dataProvider'].length >= 7) {
                        $element.addClass('pie');
                    }
                }

                var chart = AmCharts.makeChart($element.attr('id'), settings);
                chart.addListener("drawn", updateTextLength);
            });
        }
    });

    function updateTextLength() {
        var boxWidth = 0;
        $(".chart").each(function(i) {
            var legend = $(this).find(".amcharts-legend-bg");
            if (legend.length) {
                boxWidth = parseInt(legend[0].getBoundingClientRect().width, 10) - 24;
                var string = "";
                $(this).find(".amcharts-legend-label").each(function(j) {
                    string = $(this).find("tspan");
                    if ($(this)[0].getBoundingClientRect().width >= boxWidth) {
                        var k = 6;
                        var end = parseInt((boxWidth / k), 10);
                        if (string.text().length <= end) {
                            k = 7;
                            end = parseInt((boxWidth / k), 10);
                        }
                        string.text(string.text().substring(0, end) + " ...");
                    }
                });
            }
        });
    }

    //* there's no init event :( *//
    $( document ).ready(function() {
        if ($(".chart").length) {
            setTimeout(function () {
                updateTextLength();
            }, 500);
        }
    });
}