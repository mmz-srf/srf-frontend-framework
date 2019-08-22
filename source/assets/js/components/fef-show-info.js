const PODCAST_DETAILS_CLASS = 'js-show-info',
    ICON_BUTTON_WITH_ARROW_CLASS = 'show-info__actions-button--active';

export function init() {
    $(`.${PODCAST_DETAILS_CLASS}`).each((index, element) => {
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
        $($actionButton).toggleClass(ICON_BUTTON_WITH_ARROW_CLASS);
    }

    hideAllActionButtonArrows($exceptedActionButton) {
        for (let i = 0; i < this.$actionButtons.length; i++) {
            if (this.$actionButtons[i] !== $exceptedActionButton) {
                $(this.$actionButtons[i]).removeClass(ICON_BUTTON_WITH_ARROW_CLASS);
            }
        }
    }
}
