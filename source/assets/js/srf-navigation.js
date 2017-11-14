export function init() {
    $(".js-navigation").each((i, elem) => {
        new SrfNavigation(
            elem,
            (isOpen) => {console.log("Submenu is now " + (isOpen ? "open" : "closed"));}
        );
    });
}

export class SrfNavigation {
    constructor(element, onSubmenuToggle) {
        this.$element = $(element);
        this.$submenuWrapper = this.$element.find(".navigation--subnav-wrapper");
        this.$subMenuButton = this.$element.find(".js-expand-arrow");
        this.$arrow = this.$element.find(".expand-arrow");
        this.submenuToggleCallback  = this.checkFunctionParam(onSubmenuToggle);

        this.$a11yElem = this.$element.find(".js-navigation-subnav-a11y");

        this.registerListeners();
    }

    /**
     * Make sure a parameter is actually a function - return an empty function if it's not.
     *
     * @param param any
     * @return {function()}
     */
    checkFunctionParam(param) {
        return param && typeof param == 'function' ? param : () => {};
    }

    registerListeners() {
        this.$subMenuButton.on("click", event => this.onSubMenuButtonClicked(event) );
    }

    onSubMenuButtonClicked(e) {
        typeof e !== "undefined" ? e.preventDefault() : null;

        let subMenuIsOpen = !this.$arrow.hasClass("expand-arrow--open");

        this.$arrow.toggleClass("expand-arrow--open", subMenuIsOpen);
        this.$subMenuButton.attr("aria-expanded", subMenuIsOpen);
        this.$submenuWrapper.toggleClass("navigation--subnav-wrapper--open", subMenuIsOpen);
        this.submenuToggleCallback(subMenuIsOpen);

        this.$a11yElem.attr({
            "aria-hidden": !subMenuIsOpen,
            "role": subMenuIsOpen ? "" : "presentation"
        });
    }
}