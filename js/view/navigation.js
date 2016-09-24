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
        <span>
          <span className="h3 col-md-12">
            <Link to="/">HOME</Link>
          </span>
          <span className="h3 col-md-12">
            <Link to="/about">ABOUT</Link>
          </span>
          <span className="h3 col-md-12">
            <a href="mailto:info@radiowitness.io">EMAIL</a>
          </span>
        </span>
      </div>
    );
  }
});


module.exports = Navigation;
