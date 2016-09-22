/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React    = require('react');
var Helmet   = require('react-helmet');
var Link     = require('react-router').Link;
var metatags = require('../meta-tags.js');


var Navigation = React.createClass({
  render: function() {
    return (
      <div className="navigation">
        <Helmet titleTemplate="%s | RadioWitness.io" meta={metatags} />
        <div className="col-xs-2 col-md-12">
          <h3><Link to="/">HOME</Link></h3>
        </div>
        <div className="col-xs-2 col-md-12">
          <h3><Link to="/about">ABOUT</Link></h3>
        </div>
        <div className="col-xs-2 col-md-12">
          <h3><a href="mailto:info@radiowitness.io">EMAIL</a></h3>
        </div>
        <div className="col-xs-6 col-md-0"></div>
      </div>
    );
  }
});


module.exports = Navigation;
