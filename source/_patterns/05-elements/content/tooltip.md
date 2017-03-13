Tooltips are triggered on all elements with the data attribute `data-tooltip-toggle` set to one of the following values:

 - top
 - bottom (not implemented yet)
 - left (not implemented yet)
 - right (not implemented yet)


The given HTML will be injected into the DOM element with the data attribute.
 
Furthermore the data attribute `data-tooltip-content` needs to be set. This content will be displayed inside the
triggered tooltip. (HTML can be used as well).

To enable a tooltip on a touch device (will show on a tap), explicitly add the data attribute `data-tooltip-touch` with
the value `true`.
