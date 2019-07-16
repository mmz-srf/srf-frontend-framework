const CONTAINER = '.js-a2z';
const CONTAINER_LETTER_BOX = '.a2z-lists__block';
const CONTAINER_LETTER_BOX_ENTRY = '.js-a2z-filter';
const CONTAINER_FILTER_BAR = '.js-filter-bar';
const CONTAINER_FILTER_BAR_LETTER = '.js-a2z-filter-bar-letter';
const FILTER_SELECT = '.js-select-menu';
const CLASS_HIDE = 'a2z--hidden';
const CLASS_HIDE_FILTER_LETTERS = 'filter-bar__letter--inactive';

export class A2zFilter {

    constructor($container) {
        this.$container = $container;
        this.startObserver();
    }

    startObserver() {
        this.$container.on('change', FILTER_SELECT, (event) => {
            event.preventDefault();

            this.resetFilters();
            if ($(event.target).val() !== 'all') {
                this.filterTeasersByChannelId($(event.target).val());
            }
            this.toggleLettersAndLetterBoxes();
        });
    }

    resetFilters() {
        $(`.${CLASS_HIDE}`).removeClass(CLASS_HIDE);
        $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}`).addClass(CLASS_HIDE_FILTER_LETTERS);
    }

    filterTeasersByChannelId(filterValue) {
        $(`${CONTAINER_LETTER_BOX_ENTRY}:not([data-filter*="${filterValue}"])`).addClass(CLASS_HIDE);
    }

    toggleLettersAndLetterBoxes() {
        $(CONTAINER_LETTER_BOX).each(function () {
            if($(this).find(`${CONTAINER_LETTER_BOX_ENTRY}:visible`).length === 0) {
                $(this).addClass(CLASS_HIDE);
            } else {
                $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}[data-blockid="${$(this).data('block')}"]`).removeClass(CLASS_HIDE_FILTER_LETTERS);
                $(`${CONTAINER_FILTER_BAR} ${CONTAINER_FILTER_BAR_LETTER}[data-blockid="a2z-all"]`).removeClass(CLASS_HIDE_FILTER_LETTERS);
            }
        });
    }

    loadImages() {

    }
}

export function init() {

    let $container = $(CONTAINER);
    if ($container.length) {
        let a2zFilter = new A2zFilter($container);
    }


    let triggers = document.querySelectorAll('.js-filter-bar-trigger');
    for (let i = 0; i < triggers.length; i++) {
        let currentTrigger = triggers[i];
        currentTrigger.addEventListener('click', function(e) {
            e.preventDefault();

            const blockID = this.getAttribute('data-blockid'),
                allID = 'a2z-all',
                letterClass = 'filter-bar__letter',
                letterActiveClass = 'filter-bar__letter--active',
                blockClass = 'a2z-lists__block',
                hiddenClass = 'a2z-lists__block--hidden';

            // styles clicked filter-bar-Element as active
            document.querySelectorAll('.' + letterClass).forEach(function(thisNode) {
                thisNode.classList.remove(letterActiveClass);
            });
            this.classList.add(letterActiveClass);

            // show/hide selected Block of Elements
            if (blockID === allID) {
                document.querySelectorAll('.' + hiddenClass).forEach(function(thisNode) {
                    thisNode.classList.remove(hiddenClass);
                });
            } else {
                document.querySelectorAll('.' + blockClass + '[data-block="' + blockID + '"]').forEach(function(thisNode) {
                    thisNode.classList.remove(hiddenClass);
                    thisNode.querySelectorAll('img:not(.loaded)').forEach((imageNode) => {
                        if (imageNode.hasAttribute('data-src')) {
                            imageNode.classList.add('loaded');
                            imageNode.src = imageNode.dataset.src;
                        }
                    });
                });
                document.querySelectorAll('.' + blockClass + ':not([data-block="' + blockID + '"])').forEach(function(thisNode) {
                    thisNode.classList.add(hiddenClass);
                });
            }

        });
    }
}

