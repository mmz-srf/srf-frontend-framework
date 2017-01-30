export function init() {

    var $compBox = $('.srf-image-comparison');

    $compBox.each(function () {
        var $that = $(this),
            $slider = $('<img src="../../assets/img/arrows/image_slider_arrows.png" class="srf-image-comparison-slider" />');
        // add slider-element to this srf-image-comparison-element
        $that.append($slider);


        // run moveElementWithInput function on mouse- or touch-movement
        $that.on('mousemove touchstart touchmove', function (e) {
            var compBoxLeft = $that.offset().left;
            if (e.type === 'touchstart' || e.type === 'touchmove') {
                e = e.originalEvent.touches[0];
            }
            moveElementWithInput(e, compBoxLeft, $that);
        });
    });
}

function moveElementWithInput(e, compBoxLeft, $that) {

    var newPosition = ((e.pageX - compBoxLeft) / $that.outerWidth()) * 100,
        $compBefore = $that.find('.srf-image-comparison-after'),
        $compBeforeMedia = $that.find('.srf-image-comparison-media--after'),
        $sliderElement = $that.find('.srf-image-comparison-slider');

    if (newPosition >= 0 && newPosition <= 100) {
        $compBefore.width(newPosition + '%');
        $compBeforeMedia.width(((100 / newPosition) * 100) + '%');
        $sliderElement.css({'left': newPosition + '%'});
    }
}