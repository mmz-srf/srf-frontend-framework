# srf-frontend-framework
SRF Frontend Framework

URL: http://www.srfcdn.ch/assets/test/latest/public/

## Minimalistic installation guide:

0. Clone via preferred method
1. `composer install`
2. `npm install`
3. `gulp`

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