const DEFAULT_HEIGHT = 600,
    DEFAULT_WIDTH= 944,
    DEFAULT_MEDIA_QUERY = 'screen',
    DEFAULT_IS_TOOLBAR_SHOWN = 'yes', // work with 'yes' and 'no' because of Windows 7 does not like '1' and '0' … kind of
    DEFAULT_IS_MENUBAR_SHOWN = 'yes',
    DEFAULT_IS_LOCATION_SHOWN = 'yes',
    DEFAULT_IS_SCROLLBARS_SHOWN = 'yes',
    DEFAULT_IS_STATUS_SHOWN = 'no',
    DEFAULT_IS_RESIZABLE_SHOWN = 'yes';

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
        this.isToolbarShown = this.$element.attr('data-popup-is-toolbar-shown') || DEFAULT_IS_TOOLBAR_SHOWN;
        this.isMenubarShown = this.$element.attr('data-popup-is-menubar-shown') || DEFAULT_IS_MENUBAR_SHOWN;
        this.isLocationShown = this.$element.attr('data-popup-is-location-shown') || DEFAULT_IS_LOCATION_SHOWN;
        this.isScrollbarsShown = this.$element.attr('data-popup-is-scrollbars-shown') || DEFAULT_IS_SCROLLBARS_SHOWN;
        this.isStatusShown = this.$element.attr('data-popup-is-status-shown') || DEFAULT_IS_STATUS_SHOWN;
        this.isResizableShown = this.$element.attr('data-popup-is-resizable-shown') || DEFAULT_IS_RESIZABLE_SHOWN;
        this.mediaQuery = this.$element.data('popup-media-query') || DEFAULT_MEDIA_QUERY;
        this.triggerEvent = this.$element.data('popup-trigger-event') || null;
    }

    openPopup(event) {
        if (matchMedia(this.mediaQuery).matches) {
            event.preventDefault();
            let parameters = [
                'width=' + this.width,
                'height=' + this.height,
                'toolbar=' + this.isToolbarShown,
                'scrollbars=' + this.isScrollbarsShown,
                'location=' + this.isLocationShown,
                'status=' + this.isStatusShown,
                'menubar=' + this.isMenubarShown,
                'resizable=' + this.isResizableShown
            ];
            if (this.triggerEvent) {
                $(window).trigger(this.triggerEvent);
            }
            console.log(parameters.join(','));
            window.open(this.target, '_blank', parameters.join(','));
        }
    }
}
