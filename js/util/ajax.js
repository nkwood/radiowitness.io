/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var hashHistory = require('react-router').hashHistory;
var AuthService = require('./auth-service.js');
var Ajax        = function() { };


Ajax.prototype.handleXhrAuth = function(xhr) {
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(AuthService.getUser() + ":" + AuthService.getPass())
  );
}

Ajax.prototype.get = function(url, callback) {
  $.ajax({
    url: url,
    dataType: 'json',
    cache: false,
    success: callback,
    error: function(xhr, status, err) {
      if (xhr.status == 420) {
        hashHistory.push('/login');
      } else {
        console.error(url, status, err.toString());
      }
    },
    beforeSend: this.handleXhrAuth
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
      if (xhr.status == 420) {
        hashHistory.push('/login');
      } else {
        console.error(url, status, err.toString());
      }
    },
    beforeSend: this.handleXhrAuth
  });
};

module.exports = new Ajax();