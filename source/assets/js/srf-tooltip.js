export function init() {

    $(document).ready(function() {

        var clientTouchSupported = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

        // Bind mouseenter and mouseleave handlers
        $('[data-tooltip-toggle]').each(function() {

            var $that = $(this);

            $that.title = $that.data('tooltipContent');

            // Set correct value for touch enabled flag (YAGNI?)
            $that.touchEnabled = (typeof $that.data('tooltipTouch')) !== 'undefined';

            $that.tooltipEnabled = false;

            // Explicit check for provided data-tooltip-content attribute
            if (typeof $that.title !== 'undefined') {
                $that.tooltipEnabled = true;
            } else {
                console.warn("Tooltip used without content, please add data-tooltip-content to enable tooltip");
            }

            // We need the original size before insertion of tooltip content
            $that.originalWidth = $that.width();

            $that.template = '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div>'
                           + '<div class="tooltip-content"></div></div>';


            // Disable on touch devices if not explicitly set
            if (clientTouchSupported && !$that.touchEnabled) {
                $that.tooltipEnabled = false;
            }

            // Only bind if tooltip is enabled
            if ($that.tooltipEnabled) {
                $that.mouseenter(function() {
                    $that.append($that.template);
                    $that.css('position', 'relative');

                    $that.find('.tooltip-content').html($that.title);

                    var tooltip = $that.children('.tooltip');

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
            }
        });
    });
}
