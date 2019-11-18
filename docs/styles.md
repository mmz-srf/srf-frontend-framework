# CSS/Sass Development Guidelines

## General
- Maintainability should be the primary goal when writing CSS/Sass-Code for the framework. Even if it results in more code.
- Try to create FEF components in a reusable way:
  - The dimensions of atoms should not be fixed (if possible); their dimensions should rather be defined by the parent container.
  - Avoid global styles and code a component block in a way that all its styling is in one Sass file.
  - Only use CSS classes of one [BEM block](#BEM) in a file. Use BEM modifiers if you need to create variants of a block or an element.
  - Avoid CSS specificity: use CSS classes instead of complex selectors as much as possible.
- Top and bottom spaces between components should be ruled by [collapsing margins](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing). The component with the larger margin wins. Therefore only use margins not padding for top and bottom spaces. Sometimes it is necessary to add a wrapper `<div />` to make margins work as desired.

## Formatting
- Use soft tabs (2 spaces) for indentation
- Do not use ID selectors
- When using multiple selectors in a rule declaration, give each selector its own line.
- Put a space before the opening brace `{` in rule declarations
- In properties, put a space after, but not before, the `:` character.
- Put closing braces `}` of rule declarations on a new line
- Put blank lines between rule declarations
- Lint your code before committing: `gulp sass-lint`

**Example**
```scss
.avatar {
  border-radius: 50%;
  border: 2px solid white;
}

.one,
.selector,
.per-line {
  // ...
}
```

## Specificity and selector nesting
Keep CSS [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) as low as possible:

- Whenever possible, use class selectors.
- Avoid complex selectors and the nesting of selectors.
- In any case: Do not nest selectors more than three levels deep!
- If you need to increase the specificity of a CSS class, use its name in a selector twice: `.my-class.my-class`.
- Please **do not** abbreviate and nest class names with the Sass parent selector (`&`). Searching for CSS definitions gets very hard this way.

**Example**

*Bad*
```scss
.sharing-bar {
  &__container { … }
  &__button {
    &--facebook { … }
    &:hover { … }
  }
}
```

*Good*
```scss
.sharing-bar {
  …
}

.sharing-bar__container {
  …
}

.sharing-bar__button {
  &:hover {
    …
  }
}

.sharing-bar__button--facebook {
  …
}
```

## Class naming
- In general, use [BEM](#BEM) for naming classes where sensible. The block names should correspond to the pattern name in patternlab.
- For global and utility classes use the following prefixes:

| Prefix         | Use case   |
| --------------:| ---------- |
| `l-`           | Classes defining the global **l** ayout |
| `h-`           | [Utility/ **h** elper classes](#utility_classes)|
| `js-`          | [**J** ava **s** cript hooks](#js_hooks) |
| `demo-`, `sg-` | Only use to style this patternlab styleguide (**not** part of the FEF patterns). |

## <a id="BEM"></a>BEM
**BEM**, or «Block-Element-Modifier», is a _naming convention_ for classes in HTML and CSS. It was originally developed by Yandex with large codebases and scalability in mind, and can serve as a solid set of guidelines for implementing OOCSS.

We use a variant of BEM called [«Two Dashes style»](https://en.bem.info/methodology/naming-convention/#two-dashes-style):

**Example HTML**
```html
<!-- sharing-bar.twig -->
<div class="sharing-bar">
    <div class="sharing-bar__container">
        <div class="sharing-bar__button sharing-bar__button--facebook">
            <span class="h-offscreen">(externer Link, Popup)</span>
        </div>
        <div class="sharing-bar__button sharing-bar__button--twitter">
            <span class="h-offscreen">(externer Link, Popup)</span>
        </div>
    </div>
</div>
```

**Example SCSS**
```scss
/* sharing-bar.scss */
.sharing-bar { … }
.sharing-bar__container { … }
.sharing-bar__button { … }
.sharing-bar__button--facebook { … }
```

- `.sharing-bar` is the «block» and represents the higher-level component
- `.sharing-bar__container` and `.sharing-bar__button` are «elements» and represents descendants of `.sharing-bar` that helps compose the block as a whole. Elements can be nested in the html structure of the block.
- `.sharing-bar__button--facebook` is a «modifier» and represents a different state or variation on the `.sharing-bar__button` element. Modifiers can be applied to elements and blocks

To keep maintenance simple, it's important that **all styling of a block** and its elements is contained **in one single** Sass file. The name of the Sass file should correspond to the name of the block (i.e. block `.sharing-bar { … }` is defined in a file named `sharing-bar.scss`

- [BEM](https://en.bem.info)
- [GetBEM](http://getbem.com)
- [CSS Trick’s BEM 101](https://css-tricks.com/bem-101/)
- [Harry Roberts’ introduction to BEM](http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/)

## <a id="utility_classes"></a>Utility/helper classes
> A utility class applies a single rule or a very simple, universal pattern. Think .float-right, .align-center, or .font-small for single rules; .list-unstyled, .clearfix, and .visually-hidden for patterns. (Sometimes they’re called «helpers» as in Bootstrap.)
> -- <cite>[David Clark](http://davidtheclark.com/on-utility-classes/)</cite>

Use utility classes very restrictively since they might affect the maintainability of the code in a negative way. In order to stick to the DRY principle, prefer the use of Sass-Mixins (even if it results in duplicate generated css code). Prefix utility/helper classes with `h-`.

```html
<span class="h-offscreen h-offscreen-focusable">This text is for screen readers only</span>
```

- [On utility classes](http://davidtheclark.com/on-utility-classes/)

## <a id="js_hooks"></a>JavaScript hooks
Avoid binding to the same class in both your CSS and JavaScript. Conflating the two often leads to, at a minimum, time wasted during refactoring when a developer must cross-reference each class they are changing, and at its worst, developers being afraid to make changes for fear of breaking functionality.

Therefore, please create JavaScript-specific classes to bind to, prefixed with `js-` and preferably followed by the block name if sensible.

```html
<button class="js-sharing-bar-comment-counter sharing-bar__button sharing-bar__button--comment">123</button>
```

## ID selectors
While it is possible to select elements by ID in CSS, it should generally be considered an anti-pattern. ID selectors introduce an unnecessarily high level of [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity) to your rule declarations, and they are not reusable.

## !important declarations

> `!important` declarations should not be used unless they are absolutely necessary after all other avenues have been exhausted.
> -- <cite>[Louis Lazaris](https://www.smashingmagazine.com/2010/11/the-important-css-declaration-how-and-when-to-use-it/)</cite>

If you really must use an `!important` statement, please comment the reasons for its use in the code.

## Sass-Variables
Prefer dash-cased variable names (e.g. `$my-variable`) over camelCased or snake_cased variable names.

## Comments
Write detailed comments for code that isn’t self-documenting, i.e.:
- Compatibility or browser-specific workarounds
- Calculations
- Usages of z-index

## Browser workarounds
Put browser-specific hacks and workarounds in the `_shame.scss` file.

Remove the workarounds from there when a browser isn't supported anymore.

## Mixins
Mixins should be used to DRY up your code, add clarity, or abstract complexity – in much the same way as well-named functions. Mixins that accept no arguments can be useful for this, but note that if you are not compressing your payload (e.g. gzip), this may contribute to unnecessary code duplication in the resulting styles.

## Extend directive
`@extend` must be avoided because it has unintuitive and potentially dangerous behavior, especially when used with nested selectors. Instead, you can DRY up your stylesheets nicely with **mixins**.

## Colors
Consult <a href="docs/colors.md" data-fef-href="/patterns/00-documentation-30-colors/00-documentation-30-colors.html">Colors in FEF</a> for important information about using Colors in FEF.

## Credits
This style guide was originally based on the [Airbnb CSS / Sass Styleguide](https://github.com/airbnb/css) and might still use some content of it.
