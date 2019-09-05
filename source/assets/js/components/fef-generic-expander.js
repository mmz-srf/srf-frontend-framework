import {KEYCODES} from '../utils/fef-keycodes';

const HOOK_CLASS      = '.js-genex',
      TOGGLE_CLASS    = '.js-genex-toggle',
      PANEL_CLASS     = '.js-genex-panel';

export function init() {
    $(HOOK_CLASS).each((index, element) => {
        new FefGenericExpander(element);
    });
}

export class FefGenericExpander {


    constructor(element) {
        this.$element = $(element);
        this.openToggleClass = this.$element.attr('data-genex-open-toggle-class') ? this.$element.attr('data-genex-open-toggle-class') : 'js-genex-open-toggle';
        this.openPanelClass = this.$element.attr('data-genex-open-panel-class') ? this.$element.attr('data-genex-open-panel-class') : 'js-genex-open-panel';

        this.bindEvents();

        $(PANEL_CLASS).hide();
    }

    bindEvents() {
        let clickHandler = (event) => {
            this.togglePanels(event);
        };

        let keyboardHandler = (event) => {
            if (event.keyCode === KEYCODES.enter || event.keyCode === KEYCODES.space) {
                this.togglePanels(event);
            }
        };


        this.$element.on("click", TOGGLE_CLASS, clickHandler);
        this.$element.on("keydown", TOGGLE_CLASS, keyboardHandler);
    }

    togglePanels(event){
        let $toggle = $(event.target);
        let $panel  = $('#'+$toggle.attr('data-genex-target-id'));

        let isAlreadyOpen = $toggle.hasClass(this.openToggleClass);

        $(PANEL_CLASS).removeClass(this.openPanelClass).hide();
        $(TOGGLE_CLASS).removeClass(this.openToggleClass);

        if(!isAlreadyOpen){
            $toggle.addClass(this.openToggleClass);
            $panel.addClass(this.openPanelClass);
            $panel.show();
        }
    }

}