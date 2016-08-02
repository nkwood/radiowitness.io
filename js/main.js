/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React       = require('react');
var ReactDOM    = require('react-dom');
var Router      = require('react-router').Router;
var Route       = require('react-router').Route;
var IndexRoute  = require('react-router').IndexRoute;
var hashHistory = require('react-router').hashHistory;

var Navigation        = require('./views/navigation.js');
var BadBrowser        = require('./views/bad-browser.js');
var About             = require('./views/about.js');
var ViewCities        = require('./views/view-cities.js');
var QueryCity         = require('./views/query-city.js');
var Sift              = require('./views/sift/sift.js');
var ViewTopicsPrivate = require('./views/view-topics-private.js');
var ViewTopicPublic   = require('./views/view-topic-public.js');

var CallDb   = require('./db/call-db.js');
var TopicsDb = require('./db/topics-db.js');

var BOT_REGEX = new RegExp("/bot|googlebot|crawler|spider|robot|crawling/i");


function requireDexie(nextState, replace) {
  if (BOT_REGEX.test(navigator.userAgent)) {
    return true;
  } else if (!Modernizr.indexeddb) {
    replace({ pathname: "/bad-browser" });
    return false;
  } else {
    CallDb.init();
    TopicsDb.init();
    return true;
  }
}

var App = React.createClass({
  render: function() {
    return (
     <div>
       <Navigation />
       {this.props.children}
     </div>
    );
  }
});

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={ViewCities} onEnter={requireDexie} />
      <Route path="/bad-browser" component={BadBrowser} />
      <Route path="/about" component={About} />
      <Route path="/city/:localityName/:localityId" component={QueryCity} onEnter={requireDexie} />
      <Route path="/sift/:localityName/:localityId/:startMs/:endMs" component={Sift} onEnter={requireDexie} />
      <Route path="/topics/private" component={ViewTopicsPrivate} onEnter={requireDexie} />
      <Route path="/topics/public/:topicId" component={ViewTopicPublic} onEnter={requireDexie} />
    </Route>
  </Router>
), document.getElementById("content"));
