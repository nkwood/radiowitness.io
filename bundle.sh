#!/bin/bash
browserify -t [ babelify --presets [ es2015 react ] ] js/main.js -o bundle.js
lessc css/bundle.less bundle.css
