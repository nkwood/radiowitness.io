/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React    = require('react');
var Helmet   = require('react-helmet');
var Link     = require('react-router').Link;
var metatags = require('../meta-tags.js');


var NavigationBar = React.createClass({
  render: function() {
    return (
      <div className="navigationBar row">
        <Helmet titleTemplate="%s | RadioWitness.io" meta={metatags} />
        <div className="col-sm-12">
          <Link to="/" className="fullWidth">HOME</Link>
        </div>
        <div className="col-sm-12">
          <Link to="/about" className="fullWidth">ABOUT</Link>
        </div>
        <div className="col-sm-12">
          <a href="mailto:info@radiowitness.io" className="fullWidth">EMAIL</a>
        </div>
        <div className="col-sm-12"/>
      </div>
    );
  }
});


module.exports = NavigationBar;
