import { FefResponsiveHelper } from '../classes/fef-responsive-helper';
import { FefBouncePrevention } from './fef-bounce-prevention';
import { KEYCODES } from '../utils/fef-keycodes';
import { DOM_HEIGHT_CHANGE_EVENT, DOM_MUTATION_EVENTS } from '../utils/fef-events';
import { setFocus } from '../components/fef-a11y';

const ANIMATION_FADE_IN_OUT = 'fade-in-out';
const ANIMATION_SCALE_FROM_ORIGIN = 'scale-from-origin';
const ANIMATION_FLYOUT = 'as-flyout-from-origin';
const ANIMATION_SLIDE_FROM_BOTTOM = 'slide-from-bottom';

const ANIMATION_SPEED = (window.matchMedia('(prefers-reduced-motion)').matches) ? 0 : 200;
const END_OF_MODAL = '.js-end-of-modal';


let existingModals = {};
let scrollbarWidth = 0;

$(window).on(DOM_MUTATION_EVENTS, () => {
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    $('[data-modal-id]').each((_, element) => {

        $(element).off('click').on('click', (event) => {
            event.preventDefault();

            let $caller = $(element);
            let modalId = $caller.attr('data-modal-id');
            let $modalElement = $(`[data-id=${modalId}]`);

            if (existingModals[modalId]) {
                existingModals[modalId].setCaller($caller);
                existingModals[modalId].load();
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
        this.$contentContainer = this.$element.find('.js-modal-content-container');
        this.animation = this.$element.attr('data-animation');
        this.previousScrollPosition = null;
        this.browserSupportsElasticScrolling = FefBouncePrevention.checkSupport();

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
        this.load();
    }

    /**
     * Binds the relevant events for this modal:
     * - Click on a close-button or the overlay
     * - Pressing Escape
     */
    bindEvents() {
        this.$element.find('.js-close-modal, .js-modal-overlay').on('click', (event) => {
            event.preventDefault();
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

    load() {
        if (this.$caller.data('remote-content') !== undefined) {
            $.get(this.$caller.data('remote-content'), (content) => {
                this.$contentContainer.html(content);
                $(document).trigger('fef.modal.loaded', {container: this.$contentContainer});
                this.show();
            });
        } else {
            this.show();
        }

    }
    /**
     * Show the modal, depending on the provided animation.
     * The actual _showing_ of the modal is done by jQuery ($.show() or $.fadeIn()).
     */
    show() {
        this.$caller.attr({'aria-expanded': true, 'aria-haspopup': true});

        switch (this.animation) {
            case ANIMATION_SCALE_FROM_ORIGIN:
                this.scaleFromOrigin(() => this.onShowFinished());
                break;
            case ANIMATION_FLYOUT:
                this.asFlyoutFromOrigin(() => this.onShowFinished());
                break;
            case ANIMATION_FADE_IN_OUT:
                this.$element.stop(true, true).fadeIn(ANIMATION_SPEED, () => this.onShowFinished());
                break;
            case ANIMATION_SLIDE_FROM_BOTTOM:
                this.slideFromBottom(() => this.onShowFinished());
                break;
            default:
                this.$element.show(() => this.onShowFinished());
                break;
        }
    }

    onShowFinished() {
        if (this.shouldPreventScrolling()) {
            this.preventScrolling();
        }

        if (this.animation !== ANIMATION_FLYOUT) {
            this.setA11YProperties(true);
        }

        if (this.$focusTarget && this.$focusTarget.length === 1) {
            setFocus(this.$focusTarget);
        }

        // while the modal is open, height changes of elements could make the
        // modal taller than the viewport --> scrolling must be prevented:
        if (FefResponsiveHelper.isTablet() || FefResponsiveHelper.isSmartphone()) {
            $(window)
                .off(DOM_HEIGHT_CHANGE_EVENT)
                .on(DOM_HEIGHT_CHANGE_EVENT, () => this.onContentHeightChanged());
        }
    }

    /**
     * Hide the modal, depending on the provided animation.
     */
    close() {
        this.scrollToPreviousPosition();

        // stop listening to any height-changing animations on the page
        $(window).off(DOM_HEIGHT_CHANGE_EVENT);

        this.$caller.attr({'aria-expanded': false, 'aria-haspopup': false});

        switch (this.animation) {
            case ANIMATION_FADE_IN_OUT:
                this.$element.stop(true, true).fadeOut(ANIMATION_SPEED, () => setFocus(this.$caller));
                this.setA11YProperties(false);
                break;
            case ANIMATION_FLYOUT:
                this.$element.fadeOut(ANIMATION_SPEED, () => setFocus(this.$caller)).hide();
                break;
            case ANIMATION_SLIDE_FROM_BOTTOM:
                this.slideFromBottomClose();
                this.setA11YProperties(false);
                break;
            default:
                this.$element.hide(ANIMATION_SPEED, '', () => setFocus(this.$caller));
                this.setA11YProperties(false);
                break;
        }
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
     * Flyout opening animation:
     * - used for flyout-modals
     * - smartphone: flyout is fixed to the bottom of the viewport
     * - tablet-up: flyout is centered over the caller element (i.e. a button)
     */
    asFlyoutFromOrigin(callBack) {
        // clear existing inline styles on flyout (in case a resizing of the viewport happened)
        this.$element.attr('style', '');

        this.$element.css({
            'display': 'block',
            'opacity': 0
        });

        if (!FefResponsiveHelper.isSmartphone()) {
            // a flyout can be placed anywhere in the dom. but for positioning it relative to the caller (while staying
            // at place on scrolling), it must be positioned absolutely relative to the page. that's why we move it in
            // the DOM to be a first-level child of the body element, if needed.

            if(this.$element.parent().get(0).tagName !== 'BODY') {
                $('body').append(this.$element);
            }

            let callerBox = this.$caller.offset();
            let flyoutBox = this.$element[0].getBoundingClientRect();

            let newPosLeft = Math.ceil(callerBox.left + (this.$caller.width()/2) - (flyoutBox.width/2));
            let newPosTop = Math.ceil(callerBox.top + (this.$caller.height()/2) - (flyoutBox.height/2));

            this.$element.css({
                'position': 'absolute',
                'left': newPosLeft+'px',
                'top': newPosTop+'px'
            });
        }

        this.$element.animate({
            'opacity': 1
        }, ANIMATION_SPEED, 'easeInOutSine', callBack);
    }

    /**
     * modal opening animation:
     * - slides the modal in from the bottom
     * - adjusts the animation speed depending on modal height
     * - calls an optional callback
     */
    slideFromBottom(callBack = () => {}) {
        this.$element.show();
        let modalHeight = this.$mainWrapper.outerHeight();
        let animationSpeed = (ANIMATION_SPEED > 0) ? ANIMATION_SPEED + (Math.floor(modalHeight / 100) * 25) : 0; // adjusting animation speed

        // bind listener for transitionend to invoke callback after transition ended
        this.$mainWrapper.one('transitionend', () => callBack());

        this.$mainWrapper.css({
            'bottom': `-${modalHeight}px`,
            'transition': `transform ${animationSpeed}ms ease-in-out`,
            'transform': `translateY(-${modalHeight}px)`
        });
    }

    /**
     * corresponding closing animation for slideFromBottom:
     * - slides the modal out to the bottom
     * - sets the focus to the caller
     */
    slideFromBottomClose() {
        this.$mainWrapper.one('transitionend', () => {
            this.$element.hide();
            setFocus(this.$caller);
        });

        this.$mainWrapper.css({
            'transform': 'translateY(0)'
        });
    }

    /**
     * When the height of the content changes while the modal is opened,
     * scrolling may have to be prevented or the prevention has to be undone.
     */
    onContentHeightChanged() {
        if (this.shouldPreventScrolling()) {
            this.preventScrolling();
        } else {
            this.scrollToPreviousPosition();
        }
    }

    /**
     * Quick and simple check to see if the scrolling should be prevented.
     * This is the case on mobile + tablet and if the content is larger than
     * the modal itself (i.e. the modal is scrollable).
     */
    shouldPreventScrolling() {
        return this.$mainContent.outerHeight() >= $(window).outerHeight() && (FefResponsiveHelper.isTablet() || FefResponsiveHelper.isSmartphone());
    }

    /**
     * Prevent scrollable page when the modal is open.
     * We achieve this by setting the body to overflow: hidden and setting the
     * height to 100%, thus effectively cutting the rest of the page off. This
     * scrolls to the top of the page, so we also have to save the previous
     * scroll state.
     *
     * Additionally, we prevent bouncy body scrolling which can lead to subpar
     * experience on iOS devices.
     *
     * One day, this can be solved by `overscroll-behavior: contain;` which
     * "contains" the scrolling to the current container (exactly what we
     * need), but for now it's not supported everywhere yet:
     * https://caniuse.com/#feat=css-overscroll-behavior
     */
    preventScrolling() {
        this.previousScrollPosition = $(window).scrollTop();
        $('html').addClass('h-prevent-scrolling');

        if (this.browserSupportsElasticScrolling) {
            FefBouncePrevention.enable();
        }
    }

    /**
     * If, upon opening the modal, the ability to scroll was removed, we give it back now. This means:
     * - removing the class that prevents the scrolling
     * - scrolling back to the previously saved scroll position
     * - additionally we re-enable bouncy body scrolling
     *
     * This makes it appear as if we never even scrolled away.
     */
    scrollToPreviousPosition() {
        if (this.previousScrollPosition !== null) {
            $('html').removeClass('h-prevent-scrolling');
            $(window).scrollTop(this.previousScrollPosition);
            this.previousScrollPosition = null;

        }

        if (this.browserSupportsElasticScrolling) {
            FefBouncePrevention.disable();
        }
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

    /**
     * In some cases the same modal may be opened by different caller.
     *
     * @param $caller jQuery.Element
     */
    setCaller($caller) {
        this.$caller = $caller;
    }
}
