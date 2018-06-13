### OnAirNav Link

Represents an link in the OnAir-Navigation.

Available:

styleModifier =
  onairnav-link--arrow
  onairnav-link--program
  onairnav-link--compact

styleModifierMedia =
  onairnav-link__media--live
  onairnav-link__media--radiologo

media ("LIVE" or url)
media2x (url)
media3x (url)
mediaAlt (text)

title (text)

styleModifierTitle =
  onairnav-link__title--radiostation

progress

Example:

{% include 'atoms-onairnav-link' with { 'styleModifier': '', 'url': '', 'styleModifierMedia': '', 'media': '', 'media2x': '', 'media3x': '', 'mediaAlt': '', 'title': '', 'styleModifierTitle': '', 'progress': '' } %}
