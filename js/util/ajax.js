/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var Ajax = function() { };


Ajax.prototype.get = function(url, callback) {
  $.ajax({
    url: url,
    dataType: 'json',
    cache: false,
    success: callback,
    error: function(xhr, status, err) {
      console.error(url, status, err.toString());
    }
  });
};

Ajax.prototype.post = function(url, json, callback) {
  $.ajax({
    url: url,
    data: json,
    type: 'POST',
    contentType: 'application/json',
    success: callback,
    error: function(xhr, status, err) {
      console.error(url, status, err.toString());
    }
  });
};

module.exports = new Ajax();