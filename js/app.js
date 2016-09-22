/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React          = require('react');
var ReactDOM       = require('react-dom');
var Router         = require('react-router').Router;
var Route          = require('react-router').Route;
var IndexRoute     = require('react-router').IndexRoute;
var browserHistory = require('react-router').browserHistory;

var Navigation = require('./view/navigation.js');
var BadBrowser = require('./view/bad-browser.js');
var About      = require('./view/about.js');
var Cities     = require('./view/cities.js');
var QueryCity  = require('./view/query-city.js');
var Sift       = require('./view/sift/sift.js');
var CallDb     = require('./db/call-db.js');

var BOT_REGEX = new RegExp("/bot|googlebot|crawler|spider|robot|crawling/i");


function requireDexie(nextState, replace) {
  if (BOT_REGEX.test(navigator.userAgent)) {
    return true;
  } else if (!Modernizr.indexeddb) {
    replace({ pathname: '/bad-browser' });
    return false;
  } else {
    CallDb.init();
    return true;
  }
}

var App = React.createClass({
  render: function() {
    return (
      <div className="app">
        <div className="row">
          <div className="col-xs-12 col-md-1">
            <Navigation/>
          </div>
          <div className="col-xs-12 col-md-11">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Cities} onEnter={requireDexie} />
      <Route path="/about" component={About} />
      <Route path="/city/:localityName/:localityId" component={QueryCity} onEnter={requireDexie} />
      <Route path="/sift/:localityName/:localityId/:startMs/:endMs" component={Sift} onEnter={requireDexie} />
      <Route path="/bad-browser" component={BadBrowser} />
    </Route>
  </Router>
), document.getElementById('root'));
