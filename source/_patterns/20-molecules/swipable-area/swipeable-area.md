Config options:

You can optionally provide the swipeable area element with some data attributes:

* `data-tracking-forward`: Contains the parameters that will be directly added to the forward button to enable the tracking of interactions with it. Example content: `"event_source=My%20super%20Component&event_name=forward%20button"`.
* `data-tracking-back`: Contains the parameters that will be directly added to the back button to enable the tracking of interactions with it. Example content: `"event_source=My%20super%20Component&event_name=back%20button"`.
* `data-swipeable-hinting`: amount of pixels that the swipeable area should be hinted at when hovering over the back/forward button. Example content: `"20"`.
* `data-mark-visible-items`: class that will be applied to visible items, i.e. items that are completely in the visible area and not cut off on either side. Example content: `"my-item--visible"`.
* `data-mark-hidden-items`: class that will be applied to hidden items, i.e. items that are _not_ completely in the visible area. Example content: `"my-item--hidden"`.

Literally all of these are optional and can be used independently of each other. How cool is that!
