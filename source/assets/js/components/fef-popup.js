const DEFAULT_HEIGHT = 600,
    DEFAULT_WIDTH= 944,
    DEFAULT_MEDIA_QUERY = 'screen';

export function init() {
    $(document).on('click', '.js-popup', (event) => {
        let popup = new FefPopup($(event.currentTarget));
        popup.openPopup(event);
    });
}

class FefPopup {

    /**
     * @param $element jQuery.element
     */
    constructor ($element) {
        this.$element = $element;
        this.target = this.$element.attr('href');
        this.width = this.$element.data('popup-width') || DEFAULT_WIDTH;
        this.height = this.$element.data('popup-height') || DEFAULT_HEIGHT;
        this.mediaQuery = this.$element.data('popup-media-query') || DEFAULT_MEDIA_QUERY;
        this.triggerEvent = this.$element.data('popup-trigger-event') || null;
    }

    openPopup(event) {
        if (matchMedia(this.mediaQuery).matches) {
            event.preventDefault();
            let parameters = [
                'width='+this.width,
                'height='+this.height,
                'toolbar=1',
                'scrollbars=1',
                'location=1',
                'status=0',
                'menubar=1',
                'resizable=1'
            ];
            if (this.triggerEvent) {
                $(window).trigger(this.triggerEvent);
            }
            window.open(this.target, '_blank', parameters.join(','));
        }
    }
}
