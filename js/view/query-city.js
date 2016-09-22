/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React  = require('react');
var Helmet = require('react-helmet');
var Link   = require('react-router').Link;

var Ajax    = require('../util/ajax.js');
var TzCache = require('../cache/tz-cache.js');
var Config  = require('../config.js');

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

var TimeSeriesChart = React.createClass({
  handlePlotTimeSeries: function() {
    var options = {
        title: this.props.title,
        target: this.chart,
        top: 16, right: 0, left: 60,
        full_width: true, height: this.props.height,
        y_label: 'call count'
    };

    if (this.props.series.length > 0) {
      options.data = this.props.series;
    } else {
      options.chart_type   = 'missing-data';
      options.missing_text = 'Loading call events...';
    }

    MG.data_graphic(options);
  },
  componentDidMount: function() {
    this.handlePlotTimeSeries();
  },
  componentDidUpdate: function() {
    this.handlePlotTimeSeries();
  },
  render: function() {
    return (
      <div className="timeSeriesChart" ref={(ref) => this.chart = ref}></div>
    );
  }
});

var QueryCityView = React.createClass({
  copyDate: function(source, destination) {
    destination.year(source.year());
    destination.dayOfYear(source.dayOfYear());
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
    var startHour = parseInt(
      (((parseInt(moment.utc(startMs).tz(this.state.tz).startOf('day').format('x')) / 1000) / 60) / 60)
    );
    return TIMESERIES_API_URL + "/" + this.state.localityId + "?startHour=" + startHour;
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
    this.loadTimeSeries(this.state.startMs, this.state.endMs);
  },
  render: function() {
    var start          = moment.utc(this.state.startMs).tz(this.state.tz);
    var end            = moment.utc(this.state.endMs).tz(this.state.tz);
    var seriesTitle    = "Calls recorded " + start.format("dddd, MMMM Do");
    var subSeriesTitle = "Calls recorded between " + start.format("h:mm A") + " & " + end.format("h:mm A");
    var btnStyle       = (this.state.series.length <= 0) ? 'btn-default' : 'btn-primary';

    return (
      <div className="queryCityView">
        <Helmet title={this.state.localityName} />
        <div className="pageHeading">
          <h1>{this.state.localityName}</h1>
        </div>
        <div className="pageContent">
          <div className="queryForm row">
            <div className="col-xs-12 col-md-6">
              <h3 className="row">Chose Date</h3>
              <DateSelectBox uniq="date" tz={this.state.tz} timeMs={this.state.startMs} callback={this.onQueryChanged} />
            </div>
            <div className="col-xs-6 col-md-3">
              <div className="row">
                <h3 className="col-xs-9">Start Time</h3>
                <div className="col-xs-3"></div>
              </div>
              <TimeSelectBox uniq="from" tz={this.state.tz} timeMs={this.state.startMs} callback={this.onQueryChanged} />
            </div>
            <div className="col-xs-6 col-md-3">
              <div className="row">
                <h3 className="col-xs-9">End Time</h3>
                <div className="col-xs-3"></div>
              </div>
              <TimeSelectBox uniq="to" tz={this.state.tz} timeMs={this.state.endMs} callback={this.onQueryChanged} />
            </div>
          </div>

          <div className="row">
            <div className="queryTimeSeries col-xs-10">
              <div className="col-xs-12">
                <TimeSeriesChart uniq="timeSpan" title={subSeriesTitle} series={this.state.subSeries} height={130} />
              </div>
              <div className="col-xs-12">
                <TimeSeriesChart uniq="day" title={seriesTitle} series={this.state.series} height={130} />
              </div>
            </div>
            <div className="listenButton col-xs-2">
              <Link to={this.getNextUrl()} className={"btn " + btnStyle} >LISTEN</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = QueryCityView;
