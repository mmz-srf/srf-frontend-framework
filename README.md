
# srf-frontend-framework
SRF Frontend Framework

Test: https://frontend-framework-test.herokuapp.com

Stage: https://frontend-framework-stage.herokuapp.com

Master: https://frontend-framework.herokuapp.com

Doc: https://srfmmz.atlassian.net/wiki/display/PRODS/SRF+Frontend+Framework

## Minimalistic installation guide:

0. Clone via preferred method
1. `composer install`
2. `npm install`

## Useful commands
`gulp sass-lint` lint all sass files

`gulp js-lint` lint all JS files

## Other

In case of the following error:

```bash
[09:04:04] 'patternlab' errored after 2.08 s

[09:04:04] Error: Command failed: php core/console --generate
```

Try this:
* delete public/
* delete vendor/
* start over with the install procedure from above
