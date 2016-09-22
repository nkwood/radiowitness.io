/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var Ajax         = require('../util/ajax.js');
var Config       = require('../config.js');
var CALL_API_URL = Config.apiEndpoint + "/call";
var CallCache    = function() { };


CallCache.prototype.key = function(id) {
  return "f12:call-cache:" + id;
};

CallCache.prototype.get = function(id, callback) {
  var existing = sessionStorage.getItem(this.key(id));
  if (existing != null) {
    callback(JSON.parse(existing));
    return;
  }

  Ajax.get(
    CALL_API_URL + "/" + id,
    function(call) {
      sessionStorage.setItem(this.key(call.id), JSON.stringify(call));
      callback(call);
    }.bind(this)
  );
};

CallCache.prototype.getAll = function(ids, callback) {
  var calls = [];

  ids.forEach(function(id, i) {
    this.get(id, function(call) {
      calls.push(call);
      if (i === (ids.length - 1)) {
        callback(calls);
      }
    });
  }.bind(this));
};


module.exports = new CallCache();
