const CONTAINER_LETTER_BOX = '.js-a2z-letter-box';
const CONTAINER_TEASER = '.js-a2z-teaser';
const CONTAINER_FILTER_BAR = '.js-a2z-filter-bar';
const CONTAINER_FILTER_BAR_LETTER = '.js-a2z-filter-bar-letter';
const CONTAINER_FILTER_SELECT = '.js-a2z-select-menu';
const CONTAINER_INPUT_SEARCH = '.js-a2z-search-input';
const CONTAINER_INPUT_SEARCH_CLOSE = '.js-search-close';

const CLASS_ACTIVATE_FILTER_LETTERS = 'filter-bar__letter--active';
const CLASS_HIDE_FILTER_LETTERS = 'filter-bar__letter--inactive';
const CLASS_HIDE_LETTER_BOX = 'a2z-lists__block--hidden';
const CLASS_HIDE_TEASER = 'pseudo-table__row--hidden';
const CLASS_HIDE_KEYMATCH = 'pseudo-table__row-keymatch--hidden';


export class A2zFilter {

    constructor() {
        this.startObserver();
    }

    startObserver() {

        $(CONTAINER_INPUT_SEARCH).on('input', (event) => {
            event.preventDefault();
            this.resetLetterBoxFilter();
            this.resetLetterFilter();
            this.resetKeymatchFilter();

            if (event.target.value.length) {
                this.filterKeymatches(event.target.value);
            }

            this.toggleLettersAndLetterBoxes();
            this.loadImages();
        });

        $(CONTAINER_INPUT_SEARCH_CLOSE).on('click', () => {
            this.resetLetterBoxFilter();
            this.resetLetterFilter();
            this.resetKeymatchFilter();
            this.toggleLettersAndLetterBoxes();
            this.loadImages();
        });


        $(CONTAINER_FILTER_SELECT).on('change', (event) => {
            event.preventDefault();
            this.resetFiltersForSelectBoxFilter();
            $(`${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
            if ($(event.target).val() !== 'all') {
                this.filterTeasersByChannelId($(event.target).val());
            }
            this.toggleLettersAndLetterBoxes();
            this.loadImages();
        });


        $(`${CONTAINER_FILTER_BAR_LETTER}:not([data-blockid="a2z-all"])`).on('click', (event) => {
            event.preventDefault();
            if (!$(event.target).hasClass(CLASS_HIDE_FILTER_LETTERS)) {
                this.resetLetterBoxFilter();
                $(event.target).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
                this.hideLetterBoxesExpectId($(event.target).data('blockid'));
                this.loadImages();
            }
        });

        $(`${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).on('click', (event) => {
            event.preventDefault();
            this.resetLetterBoxFilter();
            $(event.target).addClass(CLASS_ACTIVATE_FILTER_LETTERS);
            this.loadImages();
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

    resetKeymatchFilter() {
        $(`.${CLASS_HIDE_KEYMATCH}`).removeClass(CLASS_HIDE_KEYMATCH);
    }


    filterTeasersByChannelId(filterValue) {
        $(`${CONTAINER_TEASER}:not([data-filter*="${filterValue}"])`).addClass(CLASS_HIDE_TEASER);
    }

    filterKeymatches(filterValue) {
        $(`${CONTAINER_TEASER}:not([data-keymatches*="${filterValue.toLowerCase()}"])`).addClass(CLASS_HIDE_KEYMATCH);
    }

    toggleLettersAndLetterBoxes() {
        $(CONTAINER_LETTER_BOX).each(function () {
            if($(this).find(`${CONTAINER_TEASER}:visible`).length === 0) {
                $(this).addClass(CLASS_HIDE_LETTER_BOX);
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
        // Scroll a little bit to trigger image lazyloading for images in viewport
        $(window).scrollTop($(window).scrollTop() + 2);
        $(window).scrollTop($(window).scrollTop() - 2);
    }
}

export function init() {
    if ($(CONTAINER_FILTER_BAR).length) {
        new A2zFilter();
    }
}

