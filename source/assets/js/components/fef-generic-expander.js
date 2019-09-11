import {KEYCODES} from '../utils/fef-keycodes';

const HOOK_CLASS        = '.js-genex';
const TOGGLE_CLASS      = '.js-genex-toggle';
const ANIMATION_DEFAULT_EASING = 'easeInOutCubic';

let ANIMATION_DEFAULT_DURATION = 400;

if (window.matchMedia('(prefers-reduced-motion)').matches) {
    ANIMATION_DEFAULT_DURATION = 0;
}

export function init() {
    $(HOOK_CLASS).each((index, element) => {
        new FefGenericExpander(element);
    });
}
export class FefGenericExpander {
    constructor(element) {
        this.$element = $(element);
        this.openToggleClass = this.$element.attr('data-genex-open-toggle-class') || 'js-genex-toggle-open';
        this.openPanelClass  = this.$element.attr('data-genex-open-panel-class')  || 'js-genex-panel-open';

        this.eventSource = this.$element.attr('data-event-source');
        this.eventValue = this.$element.attr('data-event-value');

        this.initA11Y();
        this.bindEvents();

        this.$lastToggle = undefined;
    }

    initA11Y() {
        // set aria-expand attribute
        $(TOGGLE_CLASS).attr('aria-expanded', false);

        // set aria-controls attribute
        $('[data-genex-target-id]').each((index, element) => {
            $(element).attr('aria-controls', $(element).attr('data-genex-target-id'));
        });
    }

    bindEvents() {
        let clickHandler = (event) => {
            event.preventDefault();
            this.togglePanels(event);
        };

        let keyboardHandler = (event) => {
            if (event.keyCode === KEYCODES.enter || event.keyCode === KEYCODES.space) {
                event.preventDefault();
                this.togglePanels(event);
            }
        };

        this.$element.on('click', TOGGLE_CLASS, clickHandler);
        this.$element.on('keydown', TOGGLE_CLASS, keyboardHandler);
    }

    togglePanels(event) {
        let $lastToggle = $('.' + this.openToggleClass);

        if($lastToggle.length > 0) {
            this.closeOpenPanels(event);
        } else {
            this.openCurrentPanel(event);
        }
    }

    closeOpenPanels(event) {
        this.setA11YState($(TOGGLE_CLASS), false);
        this.doTracking(event, false);
        const self = this;
        $('.' + this.openPanelClass)
            .removeClass(this.openPanelClass)
            .slideUp(ANIMATION_DEFAULT_DURATION, ANIMATION_DEFAULT_EASING, () => {
                self.openCurrentPanel(event);
                $('.' + this.openToggleClass).removeClass(this.openToggleClass);
            });
    }

    openCurrentPanel(event) {
        let $currentToggle = $(event.currentTarget);
        let $currentPanel  = $('#' + $currentToggle.attr('data-genex-target-id'));

        if(this.$lastToggle === undefined || this.$lastToggle.get(0) !== $currentToggle.get(0) || !$currentToggle.hasClass(this.openToggleClass)) {
            this.doTracking(event, true);
            this.setA11YState($currentToggle, true);
            $currentPanel.slideDown(
                ANIMATION_DEFAULT_DURATION,
                ANIMATION_DEFAULT_EASING,
                () => {
                    $currentToggle.addClass(this.openToggleClass);
                    $currentPanel.addClass(this.openPanelClass);
                }
            );
        }

        this.$lastToggle = $currentToggle;
    }

    setA11YState($element, isActive) {
        if(isActive) {
            $element.attr('aria-expanded', 'true');
        } else {
            $element.attr('aria-expanded', 'false');
        }
    }

    doTracking(event, panelWillBeOpen) {
        if(this.eventSource && this.eventValue) {
            let trackingData = {
                event_type: event.type === 'keydown' ? 'keypress' : 'click',
                event_source: this.eventSource,
                event_name:  panelWillBeOpen ? 'Open': 'Close',
                event_value: this.eventValue
            };

            $(window).trigger('fef.track.interaction', trackingData);
            $(window).trigger('fef.expandable.interaction', trackingData);
        }
    }
}