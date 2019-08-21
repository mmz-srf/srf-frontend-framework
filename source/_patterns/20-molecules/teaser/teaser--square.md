### Teaser Square

A square teaser just displays a square image wrapped in a link.

Markupwise, it's basically just a teaser with a `teaser__medium-wrapper` containing a square media image and
a `teaser__content`. All other teaser elements are omitted.

`teaser__content` is just used for accessibility fallback texts and therefore visually hidden via css.

Example HTML: 

```
<div class="teaser teaser--square">
    <a class="teaser__main" href="#">
        <div class="teaser__medium-wrapper ratio-wrapper ">
            <div class="ratio ratio--1-1">
                <div class="teaser__medium">
                    <div class="media-still media-still--dynamic">
                        <div class="media-still__image">
                            <div class="image image--media-still-dynamic">
                                <img src="../../assets/demo/img/bild2/bild_mobile_max.jpg" alt="">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="teaser__content">
            Alternative text
        </div>
    </a>
</div>
```
