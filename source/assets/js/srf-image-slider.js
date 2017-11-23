export function init() {

    let $compBox = $('.image-slider');

    $compBox.each(function () {
        let $that = $(this);
        let currentPosition = 50;

        // run moveSlider function on mouse- or touch-movement
        $that.on('mousemove touchstart touchmove', function (e) {
            let compBoxLeft = $that.offset().left;
            if (e.type === 'touchstart' || e.type === 'touchmove') {
                e = e.originalEvent.touches[0];
            }
            moveSlider(e, compBoxLeft, $that);
        });

        $( window ).resize(function(e) {
            let compBoxLeft = $that.offset().left;
            moveSlider(e, compBoxLeft, $that);
        });

        $that.parent().find('.image-slider__move-left').on('click', function (e) {
            e.preventDefault();
            let newPosition = currentPosition > 0 ? currentPosition - 10 : currentPosition;
            currentPosition = newPosition;
            moveSlider(e, '', $that, newPosition);
        });

        $that.parent().find('.image-slider__move-right').on('click', function (e) {
            e.preventDefault();
            let newPosition = currentPosition < 100 ? currentPosition + 10 : currentPosition;
            currentPosition = newPosition;
            moveSlider(e, '', $that, newPosition);
        });
    });
}

function moveSlider(e, compBoxLeft, $that, newPosition) {
    let position = typeof newPosition == 'undefined' ? ((e.pageX - compBoxLeft) / $that.outerWidth()) * 100 : newPosition;
    let $wrapper = $that.find('.image-slider__cover-wrapper'),
        $coverImage = $that.find('.image-slider__image--cover'),
        $sliderElementLeft = $that.find('.image-slider__slider--left'),
        $sliderElementRight = $that.find('.image-slider__slider--right');

    if (position >= 0 && position <= 100) {
        $wrapper.css('width', position + '%');
        $coverImage.width(((100 / position) * 100) + '%');
        $sliderElementLeft.css({'left': position + '%'});
        $sliderElementRight.css({'left': position + '%'});
    }
}
