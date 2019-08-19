# CSS/Sass Development Guidelines

## General considerations
- The main idea behind our [BEM blocks](#BEM) is that they could be used independently and anywhere. A vision is that – when we are ready to use http/2 – each block will have a separate generated CSS file so that just the styles for blocks used on a web page need to be included. Therefore: Avoid global styles and code a block in a way that all its styling is in one Sass file.
- Maintainability should be the primary goal when writing CSS/Sass-Code for the framework even if it results in more code.
- Top and bottom spaces between components should be ruled by [collapsing margins](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing). The component with the larger margin wins. Therefore only use margins not padding for top and bottom spaces. Sometimes it is necessary to add a wrapper `<div />` to make margins work as desired.

## Formatting
- Use soft tabs (2 spaces) for indentation
- Do not use ID selectors
- When using multiple selectors in a rule declaration, give each selector its own line.
- Put a space before the opening brace `{` in rule declarations
- In properties, put a space after, but not before, the `:` character.
- Put closing braces `}` of rule declarations on a new line
- Put blank lines between rule declarations
- Order your regular CSS and `@include` declarations logically (see below)
- Use the `.scss` syntax, never the original `.sass` syntax

### Example
#### Bad
```scss
.avatar{
  border-radius:50%;
  border:2px solid white; }
.no, .nope, .not_good {
  // ...
}
#lol-no {
  // ...
}
```

#### Good
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

## Nesting selectors
Avoid the nesting of selectors in order to reduce [specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity); whenever possible, use class selectors.

But in any case: **Do not nest selectors more than three levels deep!**

```scss
.page-container {
  .content {
    .profile {
      // STOP!
    }
  }
}
```

When selectors become this long, you’re likely writing CSS that is:

- Strongly coupled to the HTML (fragile) _—OR—_
- Overly specific (powerful) _—OR—_
- Not reusable

Please do not abbreviate and nest class names with the sass parent selector (`&`). Searching for CSS definitions gets very hard this way.

### Example
#### Bad
```scss
.sharing-bar {
  &__container { … }
  &__button {
    &--facebook { … }
    &:hover { … }
  }
}
```

#### Good
```scss
.sharing-bar { … }

.sharing-bar__container { … }

.sharing-bar__button {
  &:hover { … }
}

.sharing-bar__button--facebook { … }
```

## Ordering of property declarations
1.  Property declarations
    List all standard property declarations, anything that isn’t an `@include` or a nested selector.

    ```scss
    .btn-green {
      background: green;
      font-weight: bold;
      …
    }
    ```

2.  `@include` declarations
    Grouping `@include` declarations at the end makes it easier to read the entire selector.

    ```scss
    .btn-green {
      background: green;
      font-weight: bold;
      @include transition(background 0.5s ease);
      …
    }
    ```

3.  Nested selectors
    Nested selectors, _if necessary_, go last, and nothing goes after them. Add whitespace between your rule declarations and nested selectors, as well as between adjacent nested selectors. Apply the same guidelines as above to your nested selectors.

    ```scss
    .block-link {
      background: #ddd;
      font-weight: bold;
      @include transition(background 0.5s ease);

      &:hover {
        background: #fff;
      }
    }
    ```

## Comments
- Prefer line comments (`//` in Sass-Files) to block comments.
- Write detailed comments for code that isn’t self-documenting, i.e.:
 - Uses of z-index
 - Compatibility or browser-specific hacks

## Class naming
- In general, use BEM for naming classes where sensible. The block names should correspond to the pattern name in patternlab.
- For global and utility classes use the following prefixes:

| Prefix         | Use case   |
| --------------:| ---------- |
| `l-`           | Classes defining the global **l** ayout |
| `h-`           | [Utility/ **h** elper classes](#utility_classes)|
| `js-`          | [**J** ava **s** cript hooks](#js_hooks) |
| `demo-`, `sg-` | Class names beginning with `demo-` or `sg-` are **not** part of the SRF Frontend Framework patterns. Use them only to style this patternlab styleguide. |

### BEM
**BEM**, or «Block-Element-Modifier», is a _naming convention_ for classes in HTML and CSS. It was originally developed by Yandex with large codebases and scalability in mind, and can serve as a solid set of guidelines for implementing OOCSS.

We use a variant of BEM called [«Two Dashes style»](https://en.bem.info/methodology/naming-convention/#two-dashes-style):

#### Example HTML
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

#### Example SCSS
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

The main principle behind our BEM blocks should be that they can be used anywhere, independent of their context. In the future, each block will have a separate generated CSS file so that just the styles for the block have to be included when its added somewhere. Therefore it's important that all styling of a block and its elements is contained in one single Sass file. The name of the sass file should correspond to the name of the block (i.e. block `.sharing-bar { … }` is defined in a file named `sharing-bar.scss`

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
This statement says it all:

> `!important` declarations should not be used unless they are absolutely necessary after all other avenues have been exhausted.
> -- <cite>[Louis Lazaris](https://www.smashingmagazine.com/2010/11/the-important-css-declaration-how-and-when-to-use-it/)</cite>

If you really must use an `!important` statement, please comment the reasons for its use in the code.

## Sass-Variables
Prefer dash-cased variable names (e.g. `$my-variable`) over camelCased or snake_cased variable names. It is acceptable to prefix variable names that are intended to be used only within the same file with an underscore (e.g. `$_my-variable`).

## Colors in FEF
Switch to Global/Colors to learn more about the topic «Colors on SRF.ch» by opening the Pattern Infos (Gear-/Settings-Icon in the top right corner).

## Mixins
Mixins should be used to DRY up your code, add clarity, or abstract complexity–in much the same way as well-named functions. Mixins that accept no arguments can be useful for this, but note that if you are not compressing your payload (e.g. gzip), this may contribute to unnecessary code duplication in the resulting styles.

## Extend directive
`@extend` must be avoided because it has unintuitive and potentially dangerous behavior, especially when used with nested selectors. Even extending top-level placeholder selectors can cause problems if the order of selectors ends up changing later (e.g. if they are in other files and the order the files are loaded shifts). Gzipping should handle most of the savings you would have gained by using `@extend`, and you can DRY up your stylesheets nicely with **mixins**.

## Credits
This style guide is based on the [Airbnb CSS / Sass Styleguide](https://github.com/airbnb/css) with adaptations for the SRF Frontend Framework.
