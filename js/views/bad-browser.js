/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');


var BadBrowserBox = React.createClass({
  componentWillMount: function() {
    document.title = "Radio Witness - bad browser :(";
  },
  render: function() {
    return (
      <div>
        <h1>Bad Browser :(</h1>
        <div className="badBrowserBox center-block">
          <p className="badBrowserText lead">
            This browser does not support the IndexedDB Web Standard, please switch to
            Google Chrome, Firefox, or Opera to continue. Pretty much anything other
            than Safari and Internet Explorer will be alright.
          </p>
        </div>
      </div>
    );
  }
});


module.exports = BadBrowserBox;