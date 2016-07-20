/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React         = require('react');
var hashHistory   = require('react-router').hashHistory;
var AuthService   = require('../util/auth-service.js');
var NavigationBar = require('./navigation.js');


var LoginBox = React.createClass({
  handleLogin: function (e) {
    if (e !== undefined) {
      e.preventDefault();
    }

    AuthService.login($("#user").val(), $("#pass").val(), function(err) {
      if (err === null) {
        hashHistory.push('/');
      } else {
        toastr.warning("Login failed");
      }
    }.bind(this));
  },
  componentWillMount: function() {
    document.title = "Radio Witness - login";
    AuthService.logout();
    toastr.options.timeOut = 2000;
  },
  render: function() {
    return (
      <div>
        <NavigationBar/>
        <h1>Login</h1>
        <div className="loginBox center-block">
          <form className="form-signin" onSubmit={this.handleLogin}>
            <input type="text" id="user" className="form-control" placeholder="Username" required autofocus />
            <input type="password" id="pass" className="form-control" placeholder="Password" required />
            <button type="submit" className="btn btn-lg btn-primary btn-block" onClick={this.handleLogin}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }
});


module.exports = LoginBox;