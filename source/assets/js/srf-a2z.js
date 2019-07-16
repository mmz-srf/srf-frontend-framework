const CONTAINER = '.js-a2z';
const CONTAINER_LETTER_BOX = '.a2z-lists__block';
const CONTAINER_LETTER_BOX_ENTRY = '.js-a2z-filter';
const CONTAINER_FILTER_BAR = '.js-filter-bar';
const CONTAINER_FILTER_BAR_LETTER = '.js-a2z-filter-bar-letter';

const FILTER_SELECT = '.js-select-menu';

const CLASS_ACTIVATE_FILTER_LETTERS = 'filter-bar__letter--active';
const CLASS_HIDE_FILTER_LETTERS = 'filter-bar__letter--inactive';
const CLASS_HIDE_LETTER_BOX = 'a2z-lists__block--hidden';
const CLASS_HIDE_TEASER = 'pseudo-table__row--hidden';


export class A2zFilter {

    constructor() {
        this.startObserver();
    }

    startObserver() {
        $(FILTER_SELECT).on('change', (event) => {
            event.preventDefault();
            this.resetFiltersForSelectBoxFilter();
            $(`${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
            if ($(event.target).val() !== 'all') {
                this.filterTeasersByChannelId($(event.target).val());
            }
            this.toggleLettersAndLetterBoxes();
        });


        $(`${CONTAINER_FILTER_BAR_LETTER}:not([data-blockid="a2z-all"])`).on('click', (event) => {
            event.preventDefault();
            if (!$(event.target).hasClass(CLASS_HIDE_FILTER_LETTERS)) {
                this.resetLetterBoxFilter();
                $(event.target).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
                this.hideLetterBoxesExpectId($(event.target).data('blockid'));
            }
        });

        $(`${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).on('click', (event) => {
            event.preventDefault();
            this.resetLetterBoxFilter();
            $(event.target).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
        });

    }

    resetFiltersForSelectBoxFilter() {
        this.resetLetterBoxFilter();
        this.resetLetterFilter();
        this.resetTeaserFilter();
    }

    resetLetterFilter() {
        $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}`).addClass(CLASS_HIDE_FILTER_LETTERS);
    }

    resetLetterBoxFilter() {
        $(`.${CLASS_HIDE_LETTER_BOX}`).removeClass(CLASS_HIDE_LETTER_BOX);
        $(`.${CLASS_ACTIVATE_FILTER_LETTERS}`).removeClass(CLASS_ACTIVATE_FILTER_LETTERS);
    }

    resetTeaserFilter() {
        $(`.${CLASS_HIDE_TEASER}`).removeClass(CLASS_HIDE_TEASER);
    }


    filterTeasersByChannelId(filterValue) {
        $(`${CONTAINER_LETTER_BOX_ENTRY}:not([data-filter*="${filterValue}"])`).addClass(CLASS_HIDE_TEASER);
    }

    toggleLettersAndLetterBoxes() {
        $(CONTAINER_LETTER_BOX).each(function () {
            if($(this).find(`${CONTAINER_LETTER_BOX_ENTRY}:visible`).length === 0) {
                $(this).addClass(CLASS_HIDE_TEASER);
            } else {
                $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}[data-blockid="${$(this).data('block')}"]`).removeClass(CLASS_HIDE_FILTER_LETTERS);
                $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).removeClass(CLASS_HIDE_FILTER_LETTERS);
            }
        });
    }

    hideLetterBoxesExpectId(targetId) {
        $(`${CONTAINER_LETTER_BOX}:not([data-block="${targetId}"])`).addClass(CLASS_HIDE_LETTER_BOX);
    }

    loadImages() {
            // thisNode.querySelectorAll('img:not(.loaded)').forEach((imageNode) => {
            //                     if (imageNode.hasAttribute('data-src')) {
            //                         imageNode.classList.add('loaded');
            //                         imageNode.src = imageNode.dataset.src;
            //                     }
            //                 });
    }
}

export function init() {
    if ($(CONTAINER).length) {
        new A2zFilter();
    }
}

