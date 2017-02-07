export function init() {

    var $compBox = $('.srf-image-comparison');

    $compBox.each(function () {
        var $that = $(this);
        var currentPosition = 50;

        // run moveElementWithInput function on mouse- or touch-movement
        $that.on('mousemove touchstart touchmove', function (e) {
            var compBoxLeft = $that.offset().left;
            if (e.type === 'touchstart' || e.type === 'touchmove') {
                e = e.originalEvent.touches[0];
            }
            moveElementWithInput(e, compBoxLeft, $that);
        });

        $that.parent().find('.srf-image-comparison-moveleft').on('click', function (e) {
            e.preventDefault();
            var newPosition = currentPosition > 0 ? currentPosition - 10 : currentPosition;
            currentPosition = newPosition;
            moveElementWithInput(e, '', $that, newPosition);
        });

        $that.parent().find('.srf-image-comparison-moveright').on('click', function (e) {
            e.preventDefault();
            var newPosition = currentPosition < 100 ? currentPosition + 10 : currentPosition;
            currentPosition = newPosition;
            moveElementWithInput(e, '', $that, newPosition);
        });
    });
}

function moveElementWithInput(e, compBoxLeft, $that, newPosition) {
    var newPosition = typeof newPosition == 'undefined' ? ((e.pageX - compBoxLeft) / $that.outerWidth()) * 100 : newPosition;
    var $compBefore = $that.find('.srf-image-comparison-after'),
        $compBeforeMedia = $that.find('.srf-image-comparison-media--after'),
        $sliderElement = $that.find('.srf-image-comparison-slider');

    if (newPosition >= 0 && newPosition <= 100) {
        $compBefore.width(newPosition + '%');
        $compBeforeMedia.width(((100 / newPosition) * 100) + '%');
        $sliderElement.css({'left': newPosition + '%'});
    }
}