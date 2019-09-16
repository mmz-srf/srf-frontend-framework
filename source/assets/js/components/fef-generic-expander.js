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

        this.isTogglingAllowed = true;
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
        //prevent toggling of multiple panels
        if (this.isTogglingAllowed) {
            let isSwitching = false;

            const $lastToggle = $('.' + this.openToggleClass, this.$element);
            const $currentToggle = $(event.currentTarget);
            const $openPanel = $('.' + this.openPanelClass, this.$element);

            if ($openPanel.length > 0) {
                if ($lastToggle.get(0) !== $currentToggle.get(0)) {
                    isSwitching = true;
                    this.closeOpenPanels(event, $lastToggle, $openPanel, () => {
                        this.openCurrentPanel(event, $currentToggle);
                    });
                } else {
                    this.closeOpenPanels(event, $lastToggle, $openPanel);
                }
            } else {
                this.openCurrentPanel(event, $currentToggle);
            }
            //blocking toggling for duration of animation
            //if panels are switched 2 animations are played consecutively, so the duration is doubled
            this.isTogglingAllowed = false;
            setTimeout(() => {this.isTogglingAllowed = true;}, !isSwitching ? ANIMATION_DEFAULT_DURATION : ANIMATION_DEFAULT_DURATION * 2);
        }
    }

    closeOpenPanels(event, $lastToggle, $openPanel, callbackFunction) {
        this.setA11YState($(TOGGLE_CLASS), false);
        this.doTracking(event, false);

        $lastToggle.removeClass(this.openToggleClass);

        $openPanel.slideUp(ANIMATION_DEFAULT_DURATION, ANIMATION_DEFAULT_EASING, () => {
            $openPanel.removeClass(this.openPanelClass);
            //callback function to open another panel after closing one, respectively when switching panels.
            if (callbackFunction !== undefined) {
                callbackFunction();
            }
        });
    }

    openCurrentPanel(event, $currentToggle) {
        const $currentPanel = $('#' + $currentToggle.attr('data-genex-target-id'));

        this.doTracking(event, true);
        this.setA11YState($currentToggle, true);
        $currentToggle.addClass(this.openToggleClass);

        $currentPanel.slideDown(
            ANIMATION_DEFAULT_DURATION,
            ANIMATION_DEFAULT_EASING,
            () => {
                $currentPanel.addClass(this.openPanelClass);
                //Prevent focus of the wrong toggle when clicking on another one while this one opens the panel
                $currentToggle.focus();
            }
        );
    }

    setA11YState($element, isActive) {
        $element.attr('aria-expanded', isActive);
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
