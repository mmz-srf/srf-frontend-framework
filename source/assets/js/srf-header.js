const KEYCODES = {
    'enter': 13,
    'tab': 9,
    'escape': 27
};

export function init() {
    $('.header').each((i, elem) => {
        new SrfHeader(
            elem,
            (isOpen) => {/* Header is now open or closed */}
        );
    });
}

export class SrfHeader {

    constructor(element, onMenuToggle) {
        this.$element = $(element);
        this.menuToggleCallback  = this.checkFunctionParam(onMenuToggle);

        this.$menuButton = this.$element.find('.js-menu-button');
        this.menuIsOpen = false;
        this.isInTransition = false;

        // A11Y
        this.$navigation = this.$element.find('.js-header-navigation');
        this.$A11YElements = $('body > div, body > section, body > footer').not('.header');
        this.setA11YProperties(this.menuIsOpen);

        this.registerListeners();

        // Set initial state
        this.$navigation.hide();
    }

    /**
     * Make sure a parameter is actually a function - return an empty function if it's not.
     *
     * @param param any
     * @return {function()}
     */
    checkFunctionParam(param) {
        return param && typeof param == 'function' ? param : () => {};
    }

    registerListeners() {
        this.$menuButton.on('click', event => this.onMenuButtonClicked(event) );
        this.$menuButton.on('keydown', event => this.onMenuButtonKeyPressed(event));

        $(document).on('touchstart click', event => this.onDocumentClicked(event) );

        $(document).on('keydown.header', event => this.onKeyPressed(event));

        // A11Y Helper: when tabbing out of the menu, the first element is and will always be a breadcrumb. --> on focus, close the menu.
        $('.breadcrumb__link').first().on('focus', event => this.closeIfOpen());
        $('.footer-bottom__link').last().on('focus', event => this.closeIfOpen());
    }

    /**
     * Click on any element outside of the header or on the root element of the header itself should close the menu if
     * it's open.
     *
     * @param e {jQuery.Event}
     */
    onDocumentClicked(e) {
        if (this.menuIsOpen && !$.contains(this.$element[0], e.target)) {
            this.close();
        }
    }

    closeIfOpen() {
        if (this.menuIsOpen) {
            this.close();
        }
    }

    onMenuButtonClicked(e) {
        typeof e !== 'undefined' ? e.preventDefault() : null;

        if (!this.isInTransition) {
            this.changeMenuState(!this.menuIsOpen);
            return false;
        }
    }

    /**
     * Keypress on menu is slightly different than a click.
     * Only the enter key is relevant here and it should set the focus to the
     * appropriate element inside (see SetMenuFocus())
     *
     * @param e {jQuery.event}
     * @return {boolean}
     */
    onMenuButtonKeyPressed(e) {
        if (e.keyCode === KEYCODES.enter && !this.isInTransition) {
            typeof e !== 'undefined' ? e.preventDefault() : null;

            this.changeMenuState(!this.menuIsOpen, true);

            if( this.menuIsOpen) {
                this.setInnerFocus();
            }
            return false;
        }
    }

    /**
     * Core functionality: Open or close the menu.
     * The menu wrapper is hidden when not opened and has to be animated, so opening it
     * consists of showing and then animating it (by setting a class). Hiding means
     * removing the class and then hiding it ('then' = on transition end).
     *
     * Additionally, other elements in the body will be hidden from screenreaders.
     *
     * @param newState {boolean}
     */
    changeMenuState(newState) {
        this.menuIsOpen = newState;

        // Show then animate via class OR animate via class then hide
        if (this.menuIsOpen) {
            this.$navigation.show();

            this.$element.addClass('header--open');

            this.isInTransition = true;
            this.$navigation.one('transitionend', () => {
                $('html').toggleClass('menu--opened', this.menuIsOpen);
                this.isInTransition = false;
            });
        } else {
            $('html').toggleClass('menu--opened', this.menuIsOpen);

            window.scrollTo(0, 0);

            this.$element.removeClass('header--open');

            this.isInTransition = true;
            this.$navigation.one('transitionend', () => {
                this.$navigation.hide();
                this.isInTransition = false;
            });
        }

        this.setA11YProperties(this.menuIsOpen);
        this.menuToggleCallback(this.menuIsOpen);
    }

    /**
     * The following key events concern us:
     * - Escape if the menu's open --> close it
     *
     * @param e {jQuery.Event}
     */
    onKeyPressed(e) {
        if (e.keyCode === KEYCODES.escape) {
            this.closeIfOpen();
        }
    }

    close() {
        this.changeMenuState(false);
    }

    /**
     * When the menu is open, make the navigation accessible to screenreaders and
     * hide the rest of the page from them.
     *
     * @param menuIsOpened {boolean}
     */
    setA11YProperties(menuIsOpened) {
        this.$navigation.attr({
            'aria-hidden': !menuIsOpened,
            'role': menuIsOpened ? '' : 'presentation'
        });

        this.$A11YElements.attr({
            'aria-hidden': menuIsOpened,
            'role': menuIsOpened ? 'presentation': ''
        });
    }

    /**
     * don't stay on the same element when opening the menu - focus on the first element inside of the menu.
     * Which element that is depends on the screen width as the inner search field is hidden on 720px+
     */
    setInnerFocus() {
        if ($(window).width() > 720) {
            this.$navigation.find('.navigation-link').first().focus();
        } else {
            this.$navigation.find('.searchbox__input').first().focus();
        }
    }
}
