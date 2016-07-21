/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var Config      = require('../config/config');
var ENDPOINT    = Config.apiEndpoint + '/login'; 
var KEY_USER    = "auth:user";
var KEY_PASS    = "auth:pass";
var AuthService = function() { };


AuthService.prototype.getUser = function() {
  return localStorage.getItem(KEY_USER);
};

AuthService.prototype.getPass = function() {
  return localStorage.getItem(KEY_PASS);
};

AuthService.prototype.loggedIn = function() {
  return this.getUser() != null && this.getPass() != null;
};

AuthService.prototype.login = function(user, pass, callback) {
  $.ajax({
    url: ENDPOINT,
    cache: false,
    success: function(data) {
      localStorage.setItem(KEY_USER, user);
      localStorage.setItem(KEY_PASS, pass);
      callback(null);
    }.bind(this),
    error: function(xhr, status, err) {
      callback(err);
    }.bind(this),
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", "Basic " + btoa(user + ":" + pass));
    }.bind(this)
  });
};

AuthService.prototype.logout = function() {
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem(KEY_PASS);
};


module.exports = new AuthService();
