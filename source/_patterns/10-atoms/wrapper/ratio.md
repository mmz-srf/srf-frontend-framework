Sometimes we need an element to have an exact ratio.
It's additionally wrapped in an empty div to prevent flex issues (see https://www.w3.org/TR/css-flexbox-1/#item-margins).

Generally Supported ratios:
* 16:9
* 4:3
* 3:1
* 1:1

Mobile-only ratios:
* 1:1

To add your own, see `ratio.twig` and `ratio.scss`.

Usage:

```twig
{% embed "ratio.twig" with {
    'class': 'my-class-if-needed',
    'ratio': '16:9',
    'mobileRatio': '1:1'
} %}
    {% block ratio_content %}
        {# content goes here. Will be rendered in a box that always has 16:9 ratio and 1:1 ratio on mobile #}
    {% endblock %}
{% endembed %}
```
