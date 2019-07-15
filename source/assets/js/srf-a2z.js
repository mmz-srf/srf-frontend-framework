export function init() {

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

    $('.js-select-menu').on('change', function (e) {
        e.preventDefault();
        $('.js-a2z-filter').removeClass('pseudo-table__row--hidden');
        if ($(this).val() !== 'all') {
            $('.js-a2z-filter:not([data-filter*="' + $(this).val() + '"])').addClass('pseudo-table__row--hidden');
        }

        $('.a2z-lists__block').removeClass('a2z-lists__block--hidden').each(function (e) {
            if($(this).find('.js-a2z-filter:visible').length === 0) {
                $(this).addClass('a2z-lists__block--hidden');
            }
        });
    });
}
