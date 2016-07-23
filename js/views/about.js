/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React         = require('react');
var NavigationBar = require('./navigation.js');


var AboutBox = React.createClass({
  componentWillMount: function() {
    document.title = "Radio Witness - about";
  },
  render: function() {
    return (
      <div>
        <NavigationBar/>
        <h1>About</h1>
        <div className="aboutBox center-block">
          <p className="aboutText lead">
            The Radio Witness Project began in 2015 with the goal of making police
            radio broadcasts more accessible to journalists. Use of this service is
            free and all recorded audio is licensed under Creative Commons non-commercial
            with attribution, commercial licenses are negotiated on a case-by-case
            basis. Radio Witness is a not-for-profit project that in no way represents
            any police department or municipality.

            <br/><br/>

            If you would like to support the project financially you may do so
            via <a href="https://patreon.com/radiowitness">Patreon</a>
            , <a href="https://blockchain.info/address/13QQdpXoktH8axnY3K6Lvu1DyBGbq3CPQM">Bitcoin</a>
            , or <a href="https://etherchain.org/account/0x3ffc132784c89a7edda93e3ad3d669ab6c013cfd">Ethereum</a>.
            Nearly all the software behind this service is Open Source with collaboration
            organized through <a href="https://github.com/radiowitness/radiowitness.io/wiki">Github</a>.
          </p>
        </div>
      </div>
    );
  }
});


module.exports = AboutBox;