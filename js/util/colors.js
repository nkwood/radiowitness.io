/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var randomcolor = require('randomcolor');
var Colors      = function() { };

var HUES       = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
var LUMINOSITY = ["bright", "light"];

Colors.prototype.COLOR_BY_GROUP  = 0;
Colors.prototype.COLOR_BY_SOURCE = 1;


Colors.prototype.forCall = function(colorBy, call) {
  var seed  = (colorBy == this.COLOR_BY_GROUP) ? call.groupId : call.sourceId;
      seed += 1;

  return randomcolor({
    seed       : seed,
    hue        : HUES[(seed % HUES.length)],
    luminosity : LUMINOSITY[(seed % LUMINOSITY.length)]
  });
};


module.exports = new Colors();