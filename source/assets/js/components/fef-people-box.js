$(document).ready(() => {
    $(".js-people").each((index, elem) => {
        new FefPeopleBox($(elem));
    });
});

export class FefPeopleBox {

    /**
     * @param $element jQuery element
     */
    constructor ($element) {
        this.$arrow = $element.find(".expand-icon");
        this.$body = $element.find(".js-people-body");

        this.bindEvents($element);
    }

    /**
     * @param $element
     */
    bindEvents ($element) {
        $element.find(".js-people-header").on('click', () => {
            let willBeShown = !$element.hasClass("people--expanded");

            $element.toggleClass("people--expanded", willBeShown);
            this.$arrow.toggleClass('expand-icon--open', !willBeShown);

            if (willBeShown) {
                this.$body.slideDown(300);
            } else {
                this.$body.slideUp(300);
            }
        });
    }
}
