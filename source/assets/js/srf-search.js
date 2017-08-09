export class SrfSearch {

    constructor($inputField, $submitButton, options = {}) {
        this.$inputField = $inputField;
        // inputField and submitButton are distinct html elements for accessibility
        this.$submitButton = $submitButton;
        this.registerListeners();
    }


    registerListeners() {
        this.$inputField.on("keyup", (e) => {
            this.enhanceAccessibility();

        });
    }

    enhanceAccessibility() {
        // a search button only makes sense on desktop - when it's actually working
        if (!(('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0))) {
            // this works mobile as well unlike <enter>-keys an d the likes
            if (this.$inputField.val().length > 2 && this.$submitButton.attr("tabindex") == -1) {
                this.$submitButton.attr("tabindex", 0).attr("aria-hidden", false);
            } else if (this.$inputField.val().length == 0 && this.$submitButton.attr("tabindex") == 0) {
                this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
            }
        }
    }

    clearInput(){
        this.$inputField.val("");
        this.$submitButton.attr("tabindex", -1).attr("aria-hidden", true);
    }
}



