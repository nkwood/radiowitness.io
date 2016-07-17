/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var TzCache = function() { };


TzCache.prototype.key = function(localityId) {
  return "f12:timezone:" + localityId;
};

TzCache.prototype.get = function(localityId) {
  return localStorage.getItem(this.key(localityId));
};

TzCache.prototype.set = function(localityId, tz) {
  localStorage.setItem(this.key(localityId), tz);
};


module.exports = new TzCache();