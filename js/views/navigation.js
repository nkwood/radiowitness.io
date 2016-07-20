/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');
var Link  = require('react-router').Link;


var NavigationBar = React.createClass({
  render: function() {
    return (
      <div className="navigationBar row">
        <div className="col-sm-1">
          <Link to="/about" className="fullWidth">ABOUT</Link>
        </div>
        <div className="col-sm-1">
          <a href="mailto:rhodey@anhonesteffort.org" className="fullWidth">EMAIL</a>
        </div>
        <div className="col-sm-10"/>
      </div>
    );
  }
});


module.exports = NavigationBar;