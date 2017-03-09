export function init() {

    $(document).ready(function() {

        // Bind mouseenter and mouseleave handlers
        $('[data-tooltip-toggle]').each(function() {

            var $that = $(this);

            $that.title = $that.data('tooltipTitle');
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

                    var topPosition = (tooltip.height() + 20) * -1;

                    tooltip.css('top', Math.ceil(topPosition));
                    // -16 to take care of margin inside the tooltip
                    tooltip.css('left', Math.ceil(leftPosition - 16));
                    tooltip.css('position', 'absolute');
                });

                $that.mouseleave(function() {
                    $that.children('.tooltip').remove();
                });
            } else {
                console.warn("Tooltip used without title, please add data-tooltip-content");
            }
        });
    });
}
