export function init() {

    $(document).ready(function() {

        // Bind mouseenter and mouseleave handlers
        $('[data-tooltip-toggle]').each(function() {

            var $that = $(this);

            $that.title = $that.data('tooltipContent');
            $that.originalWidth = $that.width();

            $that.template = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div>'
                           + '<div class="tooltip-content"></div></div>';

            // Only bind if title is set
            if (typeof $that.title !== 'undefined') {
                $that.mouseenter(function() {
                    $that.append($that.template);
                    $that.css('position', 'relative');

                    $that.find('.tooltip-content').html($that.title);

                    var tooltip = $that.children('.tooltip');
                    //tooltip.css('white-space', 'nowrap');

                    // Move tooltip in right position relative to its parent
                    var leftPosition = ($that.originalWidth - tooltip.width()) / 2;

                    var topPosition = (tooltip.height() + 25) * -1;

                    tooltip.css('top', topPosition);
                    tooltip.css('left', leftPosition - 8);
                    tooltip.css('position', 'absolute');
                });

                $that.mouseleave(function() {
                    $that.children('.tooltip').remove();
                });
            } else {
                console.warn("Tooltip used without content, please add data-tooltip-content");
            }
        });
    });
}
