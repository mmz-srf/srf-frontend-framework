export function init() {

    let triggers = document.querySelectorAll('.js-filter-bar-trigger');
    for (let i = 0; i < triggers.length; i++) {
        let currentTrigger = triggers[i];
        currentTrigger.addEventListener('click', function(){

            const blockID = this.getAttribute('data-blockid'),
                  allID = 'a2z-all',
                  letterClass = 'filter-bar__letter',
                  letterActiveClass = 'filter-bar__letter--active',
                  blockClass = 'a2z-lists__block',
                  hiddenClass = 'a2z-lists__block--hidden';

            // styles clicked filter-bar-Element as active
            document.querySelectorAll('.' + letterClass).forEach(function(thisNode){
                thisNode.classList.remove(letterActiveClass);
            });
            this.classList.add(letterActiveClass);

            // show/hide selected Block of Elements
            if (blockID == allID) {
                document.querySelectorAll('.' + hiddenClass).forEach(function(thisNode){
                    thisNode.classList.remove(hiddenClass);
                });
            } else {
                document.querySelectorAll('.' + blockClass + '#' + blockID).forEach(function(thisNode){
                    thisNode.classList.remove(hiddenClass);
                });
                document.querySelectorAll('.' + blockClass + ':not(#' + blockID + ')').forEach(function(thisNode){
                    thisNode.classList.add(hiddenClass);
                });
            }

        });
    };
}
