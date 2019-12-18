Sometimes we need an element to have an exact ratio.
It's additionally wrapped in an empty div to prevent flex issues (see https://www.w3.org/TR/css-flexbox-1/#item-margins).

Supported ratios:
* 16:9
* 4:3
* 3:1
* 1:1

Usage:

```twig
{% embed "ratio.twig" with {
    'class': 'my-class-if-needed',
    'ratio': '16:9'
} %}
    {% block ratio_content %}
        {# content goes here. Will be rendered in a box that always has 16:9 ratio. #}
    {% endblock %}
{% endembed %}
```
