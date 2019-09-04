const SHOW_INFO_CLASS = 'js-show-info',
    BUTTON_ACTIVE_CLASS = 'button--active';

export function init() {
    $(`.${SHOW_INFO_CLASS}`).each((index, element) => {
        new FefPodcastDetails(element);
    });
}

export class FefPodcastDetails {
    constructor(element) {
        this.$element = $(element);
        this.$actionButtons = $('[data-expander-id]');

        for (let i = 0; i < this.$actionButtons.length; i++) {
            this.bindEvents(this.$actionButtons[i]);
        }
    }

    bindEvents($actionButton) {
        let clickHandler = () => {
            this.toggleActionButtonArrow($actionButton);
        };

        $($actionButton).on('click', clickHandler);
    }

    toggleActionButtonArrow($actionButton) {
        this.hideAllActionButtonArrows($actionButton);
        $($actionButton).toggleClass(BUTTON_ACTIVE_CLASS);
    }

    hideAllActionButtonArrows($exceptedActionButton) {
        for (let i = 0; i < this.$actionButtons.length; i++) {
            if (this.$actionButtons[i] !== $exceptedActionButton) {
                $(this.$actionButtons[i]).removeClass(BUTTON_ACTIVE_CLASS);
            }
        }
    }
}
