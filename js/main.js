/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React       = require('react');
var ReactDOM    = require('react-dom');
var Router      = require('react-router').Router;
var Route       = require('react-router').Route;
var hashHistory = require('react-router').hashHistory;

var Login           = require('./views/login.js');
var ViewCities      = require('./views/view-cities.js');
var QueryCity       = require('./views/query-city.js');
var Sift            = require('./views/sift/sift.js');
var ViewTopics      = require('./views/view-topics.js');
var ViewTopicPublic = require('./views/view-topic-public.js');
var BadBrowser      = require('./views/bad-browser.js');

var AuthService = require('./util/auth-service.js');
var CallDb      = require('./db/call-db.js');
var TopicsDb    = require('./db/topics-db.js');


function requireDexie(nextState, replace) {
  if (!Modernizr.indexeddb) {
    replace({ pathname: "/bad-browser" });
    return false;
  } else {
    CallDb.init();
    TopicsDb.init();
    return true;
  }
}

function requireAuth(nextState, replace) {
  if (requireDexie(nextState, replace) === true) {
    if (!AuthService.loggedIn()) {
      replace({ pathname: "/login" });
    }
  }
}


ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/login" component={Login} onEnter={requireDexie} />
    <Route path="/" component={ViewCities} onEnter={requireAuth} />
    <Route path="/city/:localityName/:localityId" component={QueryCity} onEnter={requireAuth} />
    <Route path="/sift/:localityName/:localityId/:startMs/:endMs" component={Sift} onEnter={requireAuth} />
    <Route path="/topics" component={ViewTopics} onEnter={requireAuth} />
    <Route path="/shared/:shareId" component={ViewTopicPublic} onEnter={requireAuth} />
    <Route path="/bad-browser" component={BadBrowser} />
  </Router>
), document.getElementById("content"));