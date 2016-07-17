/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');
var Link  = require('react-router').Link;

var Ajax    = require('../util/ajax.js');
var TzCache = require('../cache/tz-cache.js');

var LOCALITY_API_URL    = "/api/locality";
var REFRESH_INTERVAL_MS = 2000;


var CityListItem = React.createClass({
  getText: function() {
    return this.props.locality.name + " " + this.props.locality.callCount.toLocaleString();
  },
  getCityUrl: function() {
    return "/city/" + this.props.locality.name + "/" + this.props.locality.id;
  },
  render: function() {
    return (
      <div className={"cityListItem row" + ((this.props.isLast) ? " cityListItemLast" : "")}>
        <div className="cityListItemPlus col-xs-1">+</div>
        <Link to={this.getCityUrl()} className="col-xs-11">{this.getText()}</Link>
      </div>
    );
  }
});

var CityList = React.createClass({
  getInitialState: function() {
    return {
      items    : [],
      itemRefs : []
    };
  },
  componentWillReceiveProps: function(nextProps) {
    var items    = [];
    var itemRefs = [];
    var i;

    for (i = 0; i < nextProps.localities.length; i++) {
      var locality = nextProps.localities[i];
      if (i === (nextProps.localities.length - 1)) {
        items.push(<CityListItem locality={locality} isLast={true} key={locality.id} ref={(ref) => itemRefs.push(ref)} />);
      } else {
        items.push(<CityListItem locality={locality} isLast={false} key={locality.id} ref={(ref) => itemRefs.push(ref)} />);
      }
    }

    this.setState({
      items    : items,
      itemRefs : itemRefs
    });
  },
  componentDidUpdate: function(prevProps, prevState) {
    var targetWidth = $("#mockListItem").width();
    var itemText    = null;
    var fontSize    = 16;

    this.state.itemRefs.forEach(function(item) {
      if (itemText === null) {
        itemText = item.getText();
      } else if (itemText.length < item.getText().length) {
        itemText = item.getText();
      }
    });

    $("#testDiv").text("+" + itemText);
    $("#testDiv").css("font-size", fontSize + "px");

    while ($("#testDiv").width() < targetWidth) {
      $("#testDiv").css("font-size", ++fontSize + "px");
    }

    $(".citiesBox").css("font-size", (--fontSize) + "px");
  },
  componentWillUnmount: function() {
    $("#testDiv").text("");
    $("#testDiv").css("font-size", "1px");
  },
  render: function() {
    return (
      <div className="cityList">
        <div className="cityListItem row">
          <div className="col-xs-1"></div>
          <div className="col-xs-11" id="mockListItem"></div>
        </div>
        {this.state.items}
      </div>
    );
  }
});

var CitiesCallSum = React.createClass({
  render: function() {
    var sum = 0;
    this.props.localities.forEach(function(locality) {
      sum += locality.callCount;
    });

    return (
      <div className="citiesCallSum row">
        <div className="col-xs-12">
          {(sum > 0) ? (sum.toLocaleString() + " calls") : ""}
        </div>
      </div>
    );
  }
});

var CitiesBox = React.createClass({
  loadLocalities: function() {
    Ajax.get(
      LOCALITY_API_URL,
      function(data) {
        if (this.hackMounted === true) {
          data.localities.forEach(function (locality) {
            TzCache.set(locality.id, locality.tzName);
          });
          this.setState({
            localities : data.localities,
            timeoutId  : setTimeout(this.loadLocalities, REFRESH_INTERVAL_MS)
          });
          toastr.clear();
        }
      }.bind(this)
    );
  },
  getInitialState: function() {
    return {
      localities : [],
      timeoutId  : 0
    };
  },
  componentWillMount: function() {
    document.title = "Radio Witness - cities";
    toastr.options.timeOut = 10000;
    toastr.success("Loading available cities...");
    this.loadLocalities();
  },
  componentDidMount: function() {
    this.hackMounted = true;
  },
  componentWillUnmount: function() {
    this.hackMounted = false;
    clearTimeout(this.state.timeoutId);
  },
  render: function() {
    return (
      <div>
        <h1>Cities</h1>
        <div className="citiesBox center-block">
          <CityList localities={this.state.localities} />
          <CitiesCallSum localities={this.state.localities} />
        </div>
      </div>
    );
  }
});


module.exports = CitiesBox;