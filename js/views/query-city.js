/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');
var Link  = require('react-router').Link;

var NavigationBar = require('./navigation.js');
var Ajax          = require('../util/ajax.js');
var TzCache       = require('../cache/tz-cache.js');
var Config        = require('../config/config');

var TIMESERIES_API_URL = Config.apiEndpoint + "/timeseries";


function convertSeriesToMinutes(tz, series, min, max) {
  series   = series.sort();
  var data = [];

  var index       = 0;
  var minuteCount = 0;
  var nextMinute  = series[0] + (1000 * 60);

  while (index < series.length) {
    if (series[index++] < nextMinute) {
      minuteCount++;
    } else {
      var minute = nextMinute - (1000 * 60);

      if ((min == null || minute >= min) && (max == null || minute <= max)) {
        data.push({
          date  : moment(moment.utc(minute).tz(tz).format("YYYY-MM-DD HH:mm:ss")).toDate(),
          value : minuteCount
        });
      }

      nextMinute  = series[index] + (1000 * 60);
      minuteCount = 0;
    }
  }

  return data;
}

var DateSelectBox = React.createClass({
  onDateChanged: function(event) {
    if (!this.ignoreCallback) {
      this.props.callback(this.props.uniq, event.date);
    }
  },
  getInitialState: function() {
    return { datetime : moment(this.props.timeMs).tz(this.props.tz) };
  },
  componentDidMount: function() {
    $('#datePickerDate').datetimepicker({
      inline      : true,
      format      : 'YYYY-MM-DD',
      defaultDate : this.state.datetime
    });
    $('#datePickerDate').on('dp.change', this.onDateChanged);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({ datetime : moment(nextProps.timeMs).tz(nextProps.tz) });
  },
  componentDidUpdate: function(prevProps, prevState) {
    this.ignoreCallback = true;
    $('#datePickerDate').data('DateTimePicker').date(this.state.datetime);
    this.ignoreCallback = false;
  },
  render: function() {
    return (
      <div className="dateSelectBox">
        <div id="datePickerDate"></div>
      </div>
    );
  }
});

var TimeSelectBox = React.createClass({
  onTimeChanged: function(event) {
    if (!this.ignoreCallback) {
      this.props.callback(this.props.uniq, event.date);
    }
  },
  getInitialState: function() {
    return {
      id       : ("timePicker" + this.props.uniq),
      datetime : moment(this.props.timeMs).tz(this.props.tz)
    };
  },
  componentDidMount: function() {
    $("#" + this.state.id).datetimepicker({
      inline      : true,
      format      : 'h:mm A',
      defaultDate : this.state.datetime
    });
    $("#" + this.state.id).on('dp.change', this.onTimeChanged);
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      id       : ("timePicker" + nextProps.uniq),
      datetime : moment(nextProps.timeMs).tz(nextProps.tz)
    });
  },
  componentDidUpdate: function(prevProps, prevState) {
    this.ignoreCallback = true;
    $("#" + this.state.id).data('DateTimePicker').date(this.state.datetime);
    this.ignoreCallback = false;
  },
  render: function() {
    return (
      <div className="timeSelectBox">
        <div id={this.state.id}></div>
      </div>
    );
  }
});

var TimeSeries = React.createClass({
  getId: function() {
    return "timeSeriesChart" + this.props.uniq;
  },
  handlePlotTimeSeries: function() {
    if (this.props.series.length > 0) {
      MG.data_graphic({
        title: this.props.title,
        data: this.props.series,
        target: "#" + this.getId(),
        full_width: true,
        top: 16,
        left: 60,
        height: this.props.height,
        y_label: "call count"
      });
    } else {
      MG.data_graphic({
        title: this.props.title,
        chart_type: "missing-data",
        missing_text: " ",
        target: "#" + this.getId(),
        full_width: true,
        top: 16,
        left: 60,
        height: this.props.height,
        y_label: "call count"
      });
    }
  },
  componentDidMount: function() {
    this.handlePlotTimeSeries();
  },
  componentDidUpdate: function() {
    this.handlePlotTimeSeries();
  },
  componentWillUnmount: function() {
    $("#" + this.getId()).html("");
  },
  render: function() {
    return (
      <div className="timeSeriesChart">
        <div id={this.getId()}></div>
      </div>
    );
  }
});

var QueryCityBox = React.createClass({
  copyDate: function(source, destination) {
    destination.year(source.year());
    destination.dayOfYear(source.dayOfYear());
  },
  getDayBounds: function(tz, utcMs) {
    return {
      start : parseInt(moment.utc(utcMs).tz(tz).startOf('day').format('x')),
      end   : parseInt(moment.utc(utcMs).tz(tz).endOf('day').format('x'))
    };
  },
  getNextUrl: function() {
    var start = moment.utc(this.state.startMs).tz(this.state.tz);
    var end   = moment.utc(this.state.endMs).tz(this.state.tz);

    start.millisecond(0);
    end.millisecond(0);
    start.second(0);
    end.second(0);

    return '/sift/' + this.state.localityName + '/' + this.state.localityId + '/' +
             start.format('x') + '/' + end.format('x');
  },
  getTimeSeriesUrl: function(startMs) {
    var bounds = this.getDayBounds(this.state.tz, startMs);
    return TIMESERIES_API_URL + "/" + this.state.localityId + "?" +
             "startMs=" + bounds.start + "&endMs=" + bounds.end;
  },
  loadTimeSeries: function(startMs, endMs) {
    toastr.options.timeOut = 10000;
    toastr.success("Loading call events...");
    Ajax.get(
      this.getTimeSeriesUrl(startMs),
      function(data) {
        this.setState({
          times     : data.times,
          series    : convertSeriesToMinutes(this.state.tz, data.times, null, null),
          subSeries : convertSeriesToMinutes(this.state.tz, data.times, startMs, endMs)
        });
        toastr.clear();
      }.bind(this)
    );
  },
  onQueryChanged: function(param, datetime) {
    var fromMoment = moment.utc(this.state.startMs).tz(this.state.tz);
    var toMoment   = moment.utc(this.state.endMs).tz(this.state.tz);
    var prevMoment = fromMoment.clone();

    if (param == "from") {
      fromMoment = datetime.clone();
      this.copyDate(fromMoment, toMoment);
    } else if (param == "to") {
      toMoment = datetime.clone();
      this.copyDate(toMoment, fromMoment);
    } else {
      this.copyDate(datetime, fromMoment);
      this.copyDate(datetime, toMoment);
    }

    var startMs = parseInt(fromMoment.format('x'));
    var endMs   = parseInt(toMoment.format('x'));

    if (prevMoment.year() != fromMoment.year() || prevMoment.dayOfYear() != fromMoment.dayOfYear()) {
      this.loadTimeSeries(startMs, endMs);
      this.setState({
        startMs : startMs,
        endMs   : endMs
      });
    } else {
      this.setState({
        startMs   : startMs,
        endMs     : endMs,
        subSeries : convertSeriesToMinutes(this.state.tz, this.state.times, startMs, endMs)
      });
    }
  },
  getInitialState: function() {
    var tz = TzCache.get(this.props.params.localityId);
    return {
      localityName : this.props.params.localityName,
      localityId   : this.props.params.localityId,
      tz           : tz,
      startMs      : parseInt(moment().tz(tz).subtract(2, "hours").format("x")),
      endMs        : parseInt(moment().tz(tz).format("x")),
      times        : [],
      series       : [],
      subSeries    : []
    };
  },
  componentWillMount: function() {
    document.title = "Radio Witness - " + this.state.localityName;
    this.loadTimeSeries(this.state.startMs, this.state.endMs);
  },
  render: function() {
    var start          = moment.utc(this.state.startMs).tz(this.state.tz);
    var end            = moment.utc(this.state.endMs).tz(this.state.tz);
    var seriesTitle    = "Calls recorded " + start.format("dddd, MMMM Do");
    var subSeriesTitle = "Calls recorded between " + start.format("h:mm A") + " & " + end.format("h:mm A");

    return (
      <div>
        <NavigationBar/>
        <h1>{this.state.localityName}</h1>
        <div className="queryCityBox center-block">
          <div className="queryFormHeadings row">
            <div className="col-sm-4"><span>Date</span></div>
            <div className="col-sm-3"><span>From</span></div>
            <div className="col-sm-3"><span>To</span></div>
            <div className="col-sm-2"></div>
          </div>

          <div className="queryForm row">
            <div className="col-sm-4">
              <DateSelectBox uniq="date" tz={this.state.tz} timeMs={this.state.startMs} callback={this.onQueryChanged} />
            </div>
            <div className="col-sm-3">
              <TimeSelectBox uniq="from" tz={this.state.tz} timeMs={this.state.startMs} callback={this.onQueryChanged} />
            </div>
            <div className="col-sm-3">
              <TimeSelectBox uniq="to" tz={this.state.tz} timeMs={this.state.endMs} callback={this.onQueryChanged} />
            </div>
            <div className="col-sm-2">
              <Link to={this.getNextUrl()} className="btn btn-primary fullWidth">NEXT</Link>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <TimeSeries uniq="timeSpan" title={subSeriesTitle} series={this.state.subSeries} height={130} />
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <TimeSeries uniq="day" title={seriesTitle} series={this.state.series} height={130} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = QueryCityBox;
