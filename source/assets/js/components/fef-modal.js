import { DOM_CHANGED_EVENT } from '../classes/fef-dom-observer';
import { FefResponsiveHelper } from '../classes/fef-responsive-helper';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';

let ANIMATION_SPEED = 200;

if (window.matchMedia('(prefers-reduced-motion)').matches) {
    ANIMATION_SPEED = 0;
}
const KEYCODES = {
    'enter': 13,
    'tab': 9,
    'escape': 27
};
const END_OF_MODAL = '.js-end-of-modal';

let existingModals = {};
let scrollbarWidth = 0;

$(window).on(DOM_CHANGED_EVENT, (e) => {
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    $('[data-modal-id]').each((index, element) => {

        $(element).on('click', () => {
            let $caller = $(element);
            let modalId = $caller.attr('data-modal-id');
            let $modalElement = $(`[data-id=${modalId}]`);

            if (existingModals[modalId]) {
                existingModals[modalId].show();
            } else if ($modalElement.length > 0) {
                existingModals[modalId] = new FefModal($modalElement, $caller);
            }
        });
    });
});

/**
 * Handles showing and hiding a modal element
 */
export class FefModal {

    /**
     * @param $element jQuery element
     * @param $caller jQuery element
     */
    constructor($element, $caller) {
        this.$element = $element;
        this.$caller = $caller;
        this.$focusTarget = this.$element.find('.js-focus-target').first();
        this.$mainWrapper = this.$element.find('.js-modal-main-wrapper');
        this.$mainContent = this.$element.find('.js-modal-main-content');
        this.animation = this.$element.attr('data-animation');
        this.previousScrollPosition = null;

        // Accsessibility: when opening the modal, set all other content on the page to aria-hidden, so that screenreaders can't access them anymore.
        this.$A11YElements = this.$element.siblings('div, section, footer, span, h1, a, img');

        $element.append('<a class="js-end-of-modal h-offscreen" href="#"></a>');
        this.$mainWrapper.append('<a class="js-close-modal h-offscreen h-offscreen-focusable h-offscreen-focusable--top" href="#">Schliessen</a>');

        this.bindEvents();

        if (this.$element.hasClass('js-min-height-of-masthead')) {
            this.$mainContent.css('min-height', $('.js-masthead').outerHeight());
        }

        this.postInit();
    }

    postInit() {
        this.show();
    }

    /**
     * Binds the relevant events for this modal:
     * - Click on a close-button or the overlay
     * - Pressing Escape
     */
    bindEvents() {
        this.$element.find('.js-close-modal, .js-modal-overlay').on('click', (event) => {
            event.stopPropagation();
            this.close();
        });

        this.$element.on('keydown', (e) => {
            if (e.keyCode === KEYCODES.escape) {
                this.close();
            }
        });

        // A11Y Helper: when tabbing out of the modal --> on focus, close modal, set focus to the caller
        $(END_OF_MODAL).on('focus', () => {
            this.close();
        });
    }

    /**
     * Show the modal, depending on the provided animation.
     */
    show() {
        this.$caller.attr({'aria-expanded': true, 'aria-haspopup': true});

        switch (this.animation) {
            case 'scale-from-origin':
                this.scaleFromOrigin(() => this.onShowFinished());
                break;
            case 'fade-in-out':
                this.$element.stop(true, true).fadeIn(ANIMATION_SPEED, () => this.onShowFinished());
                break;
            default:
                this.$element.show(() => this.onShowFinished());
                break;
        }
    }

    onShowFinished() {
        this.preventScrolling();

        this.setA11YProperties(true);

        if (this.$focusTarget && this.$focusTarget.length === 1) {
            this.setFocus(this.$focusTarget);
        }
    }

    /**
     * Hide the modal, depending on the provided animation.
     */
    close() {
        this.scrollToPreviousPosition();

        this.$caller.attr({'aria-expanded': false, 'aria-haspopup': false});

        switch (this.animation) {
            case 'fade-in-out':
                this.$element.stop(true, true).fadeOut(ANIMATION_SPEED);
                break;
            default:
                this.$element.hide();
                break;
        }

        this.setA11YProperties(false);

        this.setFocus(this.$caller);
    }

    /**
     * Simply using .focus() doesn't suffice.
     *
     * @param $element jQuery.Element
     */
    setFocus($element) {
        $element.attr('tabindex', -1).on('blur focusout', () => {
            $element.removeAttr('tabindex');
        }).focus();
    }

    /**
     * Fancy menu opening animation:
     * - fades the modal in
     * - 'opens' it from the originating element
     * - fades in the content (otherwise it'll be resized)
     * - calls an optional callback
     *
     * For aesthetical reasons we have to animate to the previous height and not 100% max-height directly.
     */
    scaleFromOrigin(callBack) {
        this.$mainContent.css('opacity', 0);
        this.$element.show();

        let originalHeight = this.$mainWrapper.height();
        let box = this.$caller[0].getBoundingClientRect();
        this.$mainWrapper.css({
            'left': box.left,
            'width': box.width,
            'max-height': box.height,
            'top': box.top,
            'opacity': 0
        }).animate({
            'left': 0,
            'width': '100%',
            'max-height': originalHeight,
            'top': 0,
            'opacity': 1
        }, ANIMATION_SPEED, 'easeInOutSine', () => {
            // remove the scrollbars
            this.$mainWrapper.css({
                'max-height': '100%',
                'width': `calc(100% + ${scrollbarWidth}px)`,
                'margin-right': scrollbarWidth
            });
            this.$mainContent.animate({
                'opacity': 1
            }, ANIMATION_SPEED, callBack);
        });
    }

    /**
     * Prevent scrollable page when the modal is open.
     * We achieve this by setting the body to overflow: hidden and setting the height to 100%, thus
     * effectively cutting the rest of the page off. This scrolls to the top of the page, so we
     * also have to save the previous scroll state.
     *
     * We only do this if the modal covers the whole page and on mobile/tablet.
     */
    preventScrolling() {
        if (this.$mainContent.outerHeight() >= $(window).outerHeight() && (FefResponsiveHelper.isTablet() || FefResponsiveHelper.isSmartphone())) {
            this.previousScrollPosition = $(window).scrollTop();
            $('html').addClass('h-prevent-scrolling');

            //disableBodyScroll(this.$mainContent[0]);

            //
            this.$element.on('touchmove', (e) => {
                // eslint-disable-next-line no-console
                console.log(e);
                e.preventDefault();
            });
        }
    }

    /**
     * If, upon opening the modal, the ability to scroll was removed, we give it back now. This means:
     * - removing the class that prevents the scrolling
     * - scrolling back to the previously saved scroll position
     *
     * This makes it appear as if we never even scrolled away.
     */
    scrollToPreviousPosition() {
        if (this.previousScrollPosition !== null) {
            $('html').removeClass('h-prevent-scrolling');
            $(window).scrollTop(this.previousScrollPosition);
            this.previousScrollPosition = null;

        }
        //enableBodyScroll(this.$mainContent[0]);
    }

    /**
     * When the modal is open, make it accessible to screenreaders and
     * hide the rest of the page from them.
     *
     * @param modalIsOpened {boolean}
     */
    setA11YProperties(modalIsOpened) {
        this.$A11YElements.attr({
            'aria-hidden': modalIsOpened,
            'role': modalIsOpened ? 'presentation': ''
        });
    }
}
