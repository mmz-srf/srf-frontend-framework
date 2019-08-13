import {FefDebounceHelper} from '../classes/fef-debounce-helper';
import {FefResponsiveHelper} from '../classes/fef-responsive-helper';

const KEYCODES = {
    'escape': 27
};
const SUBNAV_CLASS = 'js-subnav-container',
    INNER_CONTAINER_CLASS = 'js-subnav-content',
    BUTTON_BACK_CLASS = 'js-subnav-button-back',
    BUTTON_FORWARD_CLASS = 'js-subnav-button-forward',
    BUTTON_ACTIVE_CLASS = 'subnav__pager--visible',
    MASK_LEFT_CLASS = 'js-subnav-mask-left',
    MASK_RIGHT_CLASS = 'js-subnav-mask-right',
    MASK_VISIBLE_CLASS = 'subnav__mask--visible',
    ITEM_ACTIVE_CLASS = 'js-active-subnav-item',
    ITEM_GROUP_CLASS = 'js-nav-group',
    ITEM_OPEN_GROUP_CLASS = 'js-nav-group-open',
    ITEM_GROUP_WRAPPER_CLASS = 'js-nav-group-wrapper',
    OUTSIDE_CLICK_LISTENER_NAME = 'click.nav-group',
    OUTSIDE_KEYPRESS_LISTENER_NAME = 'keydown.nav-group',
    FOCUSOUT_LISTENER_NAME = 'focusout.js-nav-group-wrapper',
    DEBOUNCETIME = 10,
    THROTTLETIME = 100,
    RIGHT_OFFSET = 24,
    BUTTON_BACK_THRESHOLD = 2,
    INNER_CONTAINER_SCROLL_PADDING = 84,
    ITEM_GROUP_MARGIN = 16,
    DEFAULT_SCROLL_TIME = 200;

export function init() {
    $(`.${SUBNAV_CLASS}`).each((index, element) => {
        new FefSubnav($(element));
    });
}

/**
 * This component handles the behaviour of the subnav, such as paging buttons and paging
 * functionality of a horizontally scrollable items list as well as the masks for
 * overflowing navigation items and 3rd-level navigation.
 */
export class FefSubnav {

    /**
     * @param $element jQuery element
     */
    constructor($element) {
        this.itemLeftPositions = new Array();
        this.itemRightPositions = new Array();
        this.$element = $element;
        this.$innerContainer = $(`.${INNER_CONTAINER_CLASS}`, this.$element);
        this.$buttonBack = $(`.${BUTTON_BACK_CLASS}`, this.$element);
        this.$buttonForward = $(`.${BUTTON_FORWARD_CLASS}`, this.$element);
        this.$maskLeft = $(`.${MASK_LEFT_CLASS}`, this.$element);
        this.$maskRight = $(`.${MASK_RIGHT_CLASS}`, this.$element);
        this.lastLeftScrollPos = 0;

        this.init();
        this.initItemPositions();
        this.registerListeners();

        // Immediately centering the nav bar doesn't work correctly - move to bottom of stack for correct results.
        setTimeout(() => {
            this.centerActiveItem();
        }, 0);
    }

    init() {
        this.updateButtonStatus();
        this.updateMaskStatus();
    }

    initItemPositions() {
        this.$innerContainer.children().each( (index, element) => {
            this.itemLeftPositions.push($(element).position().left);
            this.itemRightPositions.push($(element).position().left + $(element).innerWidth());
        });
    }

    onResize() {
        let openNav = this.$element.find(`.${ITEM_OPEN_GROUP_CLASS}`);
        if (openNav.length > 0) {
            this.positionAndStretchSubNavGroup(openNav);
        }
    }

    registerListeners() {
        $(window).on('resize', FefDebounceHelper.debounce(() => this.onResize(), DEBOUNCETIME));
        this.$innerContainer.on('scroll', FefDebounceHelper.debounce(() => this.init(), DEBOUNCETIME));
        this.$innerContainer.on('scroll', FefDebounceHelper.throttle((e) => this.handleScroll(e), THROTTLETIME));
        this.$buttonBack.on('click', () => { this.pageBack(); });
        this.$buttonForward.on('click', () => { this.pageForward(); });

        this.$element.on('click', `.${ITEM_GROUP_CLASS}`, (e) => {
            if ($(e.target).parent().hasClass(ITEM_GROUP_CLASS)) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSubNav($(e.currentTarget));
            }
        });
    }

    handleScroll(e) {
        // firefox sends scroll events just after a click on 2nd level nav items with children. this would close a
        // corresponding 3rd level nav immediately after opening. that's why we check for a changed scroll position here.
        if (e.target.scrollLeft !== this.lastLeftScrollPos) {
            this.lastLeftScrollPos = e.target.scrollLeft;
            this.closeAllSubNavs();
        }
    }

    closeAllSubNavs() {
        $(document).off(`${OUTSIDE_CLICK_LISTENER_NAME} ${OUTSIDE_KEYPRESS_LISTENER_NAME}`);
        let openNavs = this.$element.find(`.${ITEM_OPEN_GROUP_CLASS}`);

        openNavs.each((index, el) => this.closeSubNav($(el)));
    }

    /**
     * Close a subnav-group by fading it out and then setting the styles/classes etc.
     */
    closeSubNav($navItem) {
        let $wrapper = $navItem.find(`.${ITEM_GROUP_WRAPPER_CLASS}`);
        $navItem.find('.expand-icon').removeClass('expand-icon--open');

        this.$element.removeClass('subnav--open-3rd-level');
        $('body').removeClass('l-dimmed-background');

        $wrapper.animate({'opacity': 0}, 200, 'easeInOutCubic', () => {
            $navItem.removeClass(`${ITEM_OPEN_GROUP_CLASS} nav-group--open`);
            $navItem.children('a').attr({'aria-expanded': false, 'aria-haspopup': false});

            // reset previously applied styles
            $wrapper.css({'left': '', 'right': '', 'opacity': '', 'max-height': ''});
            $wrapper.find('.nav-group__list').width('');
        });
    }

    toggleSubNav($navItem) {
        let isClosing = $navItem.hasClass(ITEM_OPEN_GROUP_CLASS);

        this.closeAllSubNavs();

        if (isClosing) {
            return;
        }

        $navItem.children('a').attr({'aria-expanded': true, 'aria-haspopup': true});

        this.$element.addClass('subnav--open-3rd-level');

        if(FefResponsiveHelper.isSmartphone()) {
            $('body').addClass('l-dimmed-background');
        }

        // Listen to clicks outside of the element and Escape keypress --> close element
        $(document).on(OUTSIDE_CLICK_LISTENER_NAME, (e) => {
            if (!$(e.target).hasClass('nav-item')) {
                this.closeAllSubNavs();
            }
        }).on(OUTSIDE_KEYPRESS_LISTENER_NAME, (e) => {
            if(e.keyCode === KEYCODES.escape) {
                this.closeAllSubNavs();
            }
        }).on(FOCUSOUT_LISTENER_NAME, (e) => {
            if ($(e.target).hasClass('nav-item--third-level') && $(e.target).closest('li').index() === $(e.target).closest('ul').children().length - 1) {
                this.closeAllSubNavs();
            }
        });

        $navItem.addClass(`${ITEM_OPEN_GROUP_CLASS} nav-group--open`);
        $navItem.find('.expand-icon').addClass('expand-icon--open');

        if (!FefResponsiveHelper.isSmartphone()) {
            this.positionAndStretchSubNavGroup($navItem);
        } else {
            // Mobile: don't let the nav-group be taller than the space under the masthead. Make it scrollable and set a max-height to guarantee it.
            $navItem.find(`.${ITEM_GROUP_WRAPPER_CLASS}`).css({'max-height': `calc(100vh - ${$('.js-affix').outerHeight(true)}px)`});
        }
    }

    positionAndStretchSubNavGroup($navItem) {
        const $list = $navItem.find('.nav-group__list'),
            $listWrapper = $navItem.find(`.${ITEM_GROUP_WRAPPER_CLASS}`),
            navItemOffset = Math.max(ITEM_GROUP_MARGIN, $navItem.offset().left), // compensate for the 16px negative margin on the NavGroup
            listWidth = Math.max($navItem.outerWidth(), 200, $list.outerWidth());

        // If the parental nav item is wider than the list, make them the same size (compensate for margin)
        if ($navItem.outerWidth() + ITEM_GROUP_MARGIN > $list.outerWidth()) {
            $list.width($navItem.outerWidth() + ITEM_GROUP_MARGIN);
        }

        // if there's not enough space on the right side, align with the right side of the window
        if (navItemOffset + listWidth >= $(window).outerWidth()) {
            $listWrapper.css({'left': '', 'right': 0});
        } else {
            $listWrapper.css({'left': navItemOffset, 'right': ''});
        }
    }

    updateButtonStatus() {
        if (FefResponsiveHelper.isDesktop() || FefResponsiveHelper.isDesktopWide()) {
            // show forward button if needed
            if (this.isAtScrollEnd()) {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            } else if (this.hasScrollableOverflow()) {
                this.$buttonForward.addClass(BUTTON_ACTIVE_CLASS);
            } else {
                this.$buttonForward.removeClass(BUTTON_ACTIVE_CLASS);
            }

            // show back button if needed
            if (this.hasScrollableOverflow() && this.$innerContainer.scrollLeft() > BUTTON_BACK_THRESHOLD) {
                this.$buttonBack.addClass(BUTTON_ACTIVE_CLASS);
            } else {
                this.$buttonBack.removeClass(BUTTON_ACTIVE_CLASS);
            }
        }
    }

    updateMaskStatus() {
        if (FefResponsiveHelper.isSmartphone() || FefResponsiveHelper.isTablet()) {
            // show right mask if needed
            if (this.isAtScrollEnd()) {
                this.$maskRight.removeClass(MASK_VISIBLE_CLASS);
            } else if (this.hasScrollableOverflow()) {
                this.$maskRight.addClass(MASK_VISIBLE_CLASS);
            } else {
                this.$maskRight.removeClass(MASK_VISIBLE_CLASS);
            }

            // show left mask if needed
            if (this.hasScrollableOverflow() && this.$innerContainer.scrollLeft() > BUTTON_BACK_THRESHOLD) {
                this.$maskLeft.addClass(MASK_VISIBLE_CLASS);
            } else {
                this.$maskLeft.removeClass(MASK_VISIBLE_CLASS);
            }
        }
    }

    pageForward() {
        let visibleAreaRightEdge = this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth(),
            nextItem = this.itemRightPositions.findIndex(rightEdge => rightEdge > visibleAreaRightEdge),
            newPosition = this.itemLeftPositions[nextItem] - INNER_CONTAINER_SCROLL_PADDING;

        this.scrollToPosition(newPosition);
    }

    pageBack() {
        let visibleAreaLeftEdge = this.$innerContainer.scrollLeft() + INNER_CONTAINER_SCROLL_PADDING,
            nextItem = this.itemRightPositions.findIndex(rightEdge => rightEdge > visibleAreaLeftEdge),
            newPosition = this.itemLeftPositions[nextItem] - this.$innerContainer.innerWidth() + INNER_CONTAINER_SCROLL_PADDING;

        this.scrollToPosition(newPosition);
    }

    centerActiveItem() {
        let $active = $(`.${ITEM_ACTIVE_CLASS}`, this.$element);

        if ($active.length !== 1) {
            return;
        }

        let containerLeftEdge = this.$innerContainer.offset().left,
            containerMiddle = containerLeftEdge + .5 * this.$innerContainer.outerWidth(),
            activeLeftEdge = $active.offset().left,
            activeMiddle = activeLeftEdge + .5 * $active.outerWidth(),
            diff = activeMiddle - containerMiddle,
            currentScroll = this.$innerContainer.scrollLeft(),
            newScrollPos = currentScroll + diff;

        this.scrollToPosition(newScrollPos);
        this.lastLeftScrollPos = newScrollPos;
    }

    scrollToPosition(position, time) {
        time = typeof time === 'undefined' ? DEFAULT_SCROLL_TIME : time;

        this.$innerContainer
            .stop(true, false)
            .animate( { scrollLeft: position }, time);
    }

    hasScrollableOverflow() {
        return this.$innerContainer[0].scrollWidth > this.$innerContainer.innerWidth() + RIGHT_OFFSET;
    }

    isAtScrollEnd() {
        return this.$innerContainer.scrollLeft() + this.$innerContainer.innerWidth() >= this.$innerContainer[0].scrollWidth;
    }
}
