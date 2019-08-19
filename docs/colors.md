# Colors in FEF

There is a distinctive color palette for SRF, defined by the companies own design departement. It contains 10+ tints and shades of the corporate «SRF Red» and its four square color harmonies «SRF Yellow», «SRF Green», «SRF Blue» and «SRF Purple» – each being brand colors of SRF subsidiaries on their own (Yellow = Sport, Purple = Kultur, and so forth). The palette furthermore contains tints and shades of a «SRF Warmgrey», representing a identity-grey for SRF. And some neutral white, grey and black tints and shades.

All colors used in FEF should origin from this palette *and this palette only*.

You should never use colors not specified in the palette – if you do so, you should double and tribble check with the design team. Every color used in their files should origin from the SRF Color Palette.

## Variablify all the Colors!
All the colors from the SRF Color Palette are available throughout the FEF as sass variables with logical names like `color-srf-red-100` or `color-srf-warmgrey-800`. The number represents the tint or shade of the color.

If your Designer-Teammate decides to use a new tint/shade of a SRF-Color in her/his designs (like `color-srf-red-150` that has not yet been represented in the variables) or a completely new color: PLEASE add the new tint/shade or new color to the globally available color variables. Do also add those new values to <a href="01-global/10-colors.twig" data-fef-href="/patterns/01-global-10-colors/01-global-10-colors.html">01-global/10-colors.twig</a> (details see below).

You must never use a color-code in FEF anywhere else than in <a href="_colors.scss" data-fef-href="/patterns/_colors.scss">_colors.scss</a>!

On all places in the FEF where you use a color, you must use a color variable. This way we can assure a comfortable and quick setup of stuff like Dark Modes and other alternative themes or general color changes throughout the FEF – and therefore its end-products.

## Alphas / Transparencies
There are also variables for colors with alpha-values / transparencies. They have suffixes like `a00`, `a12` or `a24` – of course `a` stands for «alpha» and the two-digit number represents the alpha-value from 0 to 99 (100 would mean no alpha, duh).

Example: `$color-srf-red-600a24` translates to `rgba(201,16,36,.24)`, which is the brand color «SRF Red» (#c91024) with a transparency / an alpha-channel of 24%.

## Fancy Visual Overview of all FEF Colors
You will find a fancy visual overview of all the color variables with all tints and shades of the SRF Color Palette with all Used-by-FEF alphas at <a href="01-global/10-colors.twig" data-fef-href="/patterns/01-global-10-colors/01-global-10-colors.html">Colors</a>

**REMINDER: Do not forget to add all newly created colors, tints, shades and alphas to <a href="01-global/10-colors.twig" data-fef-href="/patterns/01-global-10-colors/01-global-10-colors.html">01-global/10-colors.twig</a>**
