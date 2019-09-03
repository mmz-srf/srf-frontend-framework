# SRF Frontend Framework (FEF)

SRF Frontend Framework (FEF) is a frontend component library which serves as a basis for the SRF websites.
It tries to follow the principles of atomic design and uses the BEM methodology to organise the styles.

FEF is based on patternlab as a showcase for the components. The generated FEF patternlab website can be viewed here:
https://frontend-framework.herokuapp.com

## Minimalistic installation guide

0. Clone FEF repository via preferred method
1. `composer install`
2. `npm install`

## Documentation
Documentation is located in `/docs` and an overview can be found [here](docs/intro.md).

It's also accessible from the start page of the FEF patternlab website.

## Useful commands
* `gulp` generates the patternlab website and starts a local browsersync webserver (URL is displayed in the
output of the gulp task)

* `gulp sass-lint` lint all sass files

* `gulp js-lint` lint all JS files
