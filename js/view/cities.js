/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React  = require('react');
var Link   = require('react-router').Link;
var Helmet = require('react-helmet');

var Ajax    = require('../util/ajax.js');
var TzCache = require('../cache/tz-cache.js');
var Config  = require('../config.js');

var LOCALITY_API_URL    = Config.apiEndpoint + "/locality";
var REFRESH_INTERVAL_MS = 2000;


var CityListItem = React.createClass({
  getCityUrl: function() {
    return "/city/" + this.props.locality.name + "/" + this.props.locality.id;
  },
  render: function() {
    return (
      <div className={"cityListItem " + ((this.props.isLast) ? " cityListItemLast" : "")}>
        <div className="row">
          <div className="cityListItemPlus col-xs-1 col-md-2">
            <span className="h2">+</span>
          </div>
          <div className="col-xs-5 col-md-6">
            <Link to={this.getCityUrl()}>
              <span className="h2">{this.props.locality.name}</span>
            </Link>
          </div>
          <div className="col-xs-6 col-md-4">
            <span className="h2">{this.props.locality.callCount.toLocaleString('en-US')}</span>
          </div>
        </div>
      </div>
    );
  }
});

var CityList = React.createClass({
  render: function() {
    var items = this.props.localities.map(function(loc, idx, arr) {
      if (idx === (arr.length - 1)) {
        return (<CityListItem key={loc.id} locality={loc} isLast={true} />);
      } else {
        return (<CityListItem key={loc.id} locality={loc} isLast={false} />);
      }
    });

    return (
      <div className="cityList">
        {items}
      </div>
    );
  }
});

var CitiesCallSum = React.createClass({
  render: function() {
    var sum = this.props.localities.reduce(function(sum, locality) {
      return sum + locality.callCount;
    }, 0);
    var text = (sum <= 0) ? "" : sum.toLocaleString('en-US') + " calls";

    return (
      <div className="citiesCallSum">
        <div className="row">
          <div className="col-xs-offset-6 col-xs-6 col-md-offset-8 col-md-4">
            <span className="h2">{text}</span>
          </div>
        </div>
      </div>
    );
  }
});

var CitiesView = React.createClass({
  loadLocalities: function() {
    Ajax.get(
      LOCALITY_API_URL,
      function(data) {
        data.localities.forEach(function (locality) {
          TzCache.set(locality.id, locality.tzName);
        });
        this.setState({
          localities : data.localities,
          timeoutId  : setTimeout(this.loadLocalities, REFRESH_INTERVAL_MS)
        });
        toastr.clear();
      }.bind(this)
    );
  },
  getInitialState: function() {
    return {
      localities : [],
      timeoutId  : -1
    };
  },
  componentWillMount: function() {
    toastr.options.timeOut = 10000;
    toastr.success("Loading available cities...");
    this.loadLocalities();
  },
  componentWillUnmount: function() {
    clearTimeout(this.state.timeoutId);
  },
  render: function() {
    return (
      <div className="citiesView">
        <Helmet title="Citites" />
        <div className="pageHeading">
          <span className="h1">Cities</span>
        </div>
        <div className="pageContent">
          <CityList localities={this.state.localities} />
          <CitiesCallSum localities={this.state.localities} />
        </div>
      </div>
    );
  }
});


module.exports = CitiesView;
