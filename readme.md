# [TINY]ROADBOOK
<!--
[![Build Status](https://secure.travis-ci.org/chrisbo246/tinyroadbook.svg?branch=master)](http://travis-ci.org/chrisbo246/tinyroadbook) [![Coverage Status](https://coveralls.io/repos/chrisbo246/tinyroadbook/badge.png?branch=master)](https://coveralls.io/r/chrisbo246/tinyroadbook?branch=master)
-->

[website](https://chrisbo246.github.io/tinyroadbook/) | [twitter](https://twitter.com/tinyroadbook)

Edit a compact paper roadbook with just few clicks on a map. Always on hand, battery free and costless. That's all you need for long way road trips!

![[TINY]ROADBOOK](screenshot.png)

<dl class="dl-horizontal">
    <dt>Geocoding</dt>
    <dd>This application is powered by the <strong>fair use</strong> Nominatim web service provided by <a href="https://www.openstreetmap.org" target="_blank">OpenStreetMap</a>.<dd>
    <dt>Maps</dt>
    <dd>Maps are provided by <a href="https://www.openstreetmap.org/" target="_blank">openstreetmap.org</a>, <a href="http://www.opencyclemap.org/" target="_blank">opencyclemap.org</a>, <a href="http://open.mapquest.com/" target="_blank">open.mapquest.com</a> and <a href="http://www.waymarkedtrails.org/" target="_blank">waymarkedtrails.org</a> (lonvia).</dd>
    <dt>Libraries</dt>
    <dd>Twitter <a href="https://getbootstrap.com/" target="_blank">Bootstrap</a>, <a href="http://openlayers.org/" target="_blank">Openlayers</a>, <a href="http://yeoman.io/" target="_blank">Yeoman</a> and other awesome open-source libraries.</dd>
</dl>


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisities

Install [Node](https://nodejs.org/en/download/) on your local machine then download dependencies.

```
npm install -g gulp-cli bower yo generator-webapp
```

### Installing

Install NPM and Bower required packages.

```
npm install
bower install
```

### Testing

```
gulp serve
```

[http://localhost:9000/](http://localhost:9000/)

## Deployment

```
gulp build
```

Then upload the **dist** directory content to your web server.

<!--
## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
-->

## Bugs

Please use the [GitHub issue tracker](https://github.com/chrisbo246/tinyroadbook/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

## Author

[chrisbo246](https://github.com/chrisbo246)

See also the list of [contributors](https://github.com/chrisbo246/tinyroadbook/contributors) who participated in this project.

<!--
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
-->
