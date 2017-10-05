export class SrfSwiper {

    constructor(element) {
        this.$element = $(element);
        this.registerListeners();
    }

    registerListeners() {
        this.$element.on("click", ".swipemod-button", () => {
            console.log("Click.");
        });
    }
}
