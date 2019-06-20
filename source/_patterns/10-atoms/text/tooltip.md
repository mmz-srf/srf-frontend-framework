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

A custom offset can be set with `data-tooltip-offset="12"` (for 12px). Default is 16 pixels.

A Tooltip can also be triggered manually by manually triggering the events `srf.tooltip.show` and `srf.tooltip.hide` on the parent element: `$myElement.trigger('srf.tooltip.show')`.

If the data attribute `data-tooltip-no-hover` is set (value doesn't matter), the tooltip will not be shown/hidden on user interactions. It can still be triggered manually with the aforementioned events.

Additional changes to the tooltip can be done in your own CSS and then passing that class to the tooltip via `data-tooltip-modifier="my-custom-class"`.


## All possible data attributes
| Data Attribute        | Optional | Possible Values               | Effect                                        |
| --------------------- |:--------:| ----------------------------- | --------------------------------------------- |
|`data-tooltip-toggle`  | No       | "top"/"right"/"bottom"/"left" | Which direction the tooltip opens             |
|`data-tooltip-content` | No       | String or HTML                | Content of the tooltip                        |
|`data-tooltip-touch`   | Yes      | "true"                        | Should tooltip also trogger on touch devices? |
|`data-tooltip-offset`  | Yes      | Number ("12")                 | Size of gap between tooltip and element       |
|`data-tooltip-no-hover`| Yes      | no value needed               | Should hover/touch events be ignored?         |
|`data-tooltip-modifier`| Yes      | String ("my-custom-class")    | Modifier/Custom styles via custom class       |
