/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React  = require('react');
var Helmet = require('react-helmet');
var Link   = require('react-router').Link;

var SiftIntroModal   = require('./sift-intro.js');
var SiftCallPlayback = require('./sift-audio.js');

var Ajax    = require('../../util/ajax.js');
var CallDb  = require('../../db/call-db.js');
var TzCache = require('../../cache/tz-cache.js');
var Colors  = require('../../util/colors.js');
var Config  = require('../../config.js');

var CALLS_API_URL = Config.apiEndpoint + "/calls";


var CallsGridHeading = React.createClass({
  handleOptionSelected: function(event) {
    $("#colorBy").blur();
    if (event.target.value == "talkgroup") {
      this.props.callback(Colors.COLOR_BY_GROUP);
    } else {
      this.props.callback(Colors.COLOR_BY_SOURCE);
    }
  },
  inputFor: function(id, label, placeholder) {
    return (
      <div className={(placeholder === 0) ? "form-group has-warning" : "form-group"}>
        <label className="control-label" htmlFor={id}>{label}</label>
        <span id={id} className="callDetail form-control">
          {placeholder}
        </span>
      </div>
    );
  },
  render: function() {
    var defaultCall = { id:0, sourceId:0, groupId:0, startTime:0 };
    var call        = (this.props.call != null) ? this.props.call : defaultCall;

    return (
      <div className="callsGridHeading row">
        <div className="col-xs-6 col-md-3">
          <label htmlFor="colorBy">Color by</label>
          <select id="colorBy" className="form-control" onChange={this.handleOptionSelected}>
            <option defaultValue={this.props.colorBy == Colors.COLOR_BY_GROUP}>talkgroup</option>
            <option defaultValue={this.props.colorBy == Colors.COLOR_BY_SOURCE}>officer</option>
          </select>
        </div>
        <div className="col-xs-6 col-md-3">
          {this.inputFor("callCount", "Call count", this.props.count.toLocaleString())}
        </div>
        <div className="col-xs-4 col-md-2">
          {call.startTime == 0 ?
            this.inputFor("callTimestamp", "Timestamp", 0) :
            this.inputFor("callTimestamp", "Timestamp", moment.utc(call.startTime).tz(this.props.tz).format("h:mm:ss A"))}
        </div>
        <div className="col-xs-4 col-md-2">
          {this.inputFor("officerId", "Officer ID", call.sourceId)}
        </div>
        <div className="col-xs-4 col-md-2">
          {this.inputFor("talkgroupId", "Group ID", call.groupId)}
        </div>
      </div>
    );
  }
});

var CallsGrid = React.createClass({
  spanForCall: function(call, idx) {
    return (idx == this.props.selected) ?
      <span className="glyphicon glyphicon-volume-up"></span> :
      <span className="callDuration">{Math.round(call.duration / 1000)}<span className="callDurationS">s</span></span>;
  },
  handleClick: function(idx) {
    this.props.callback(0, idx);
  },
  render: function() {
    var rows    = [];
    var columns = this.props.calls.map(function(call, idx) {
      return <div key={call.id} className="callsGridCol col-xs-1"
                  style={{backgroundColor : Colors.forCall(this.props.colorBy, call)}}
                  onClick={this.handleClick.bind(this, idx)}>
               {this.spanForCall(call, idx)}
             </div>;
    }.bind(this));

    while (columns.length > 0) {
      rows.push(columns.splice(0, 12));
    }

    return (
      <div className="callsGrid">
        {rows.map(function(row, idx) {
           return <div key={"row-" + idx} className="callsGridRow row">{row}</div>
         })}
      </div>
    );
  }
});

var SiftView = React.createClass({
  stopEvent: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
  },
  getQueryUrl: function() {
    return CALLS_API_URL + "/" + this.state.localityId + "?" +
             "startMs=" + this.state.startMs + "&endMs=" + this.state.endMs;
  },
  loadCalls: function() {
    CallDb.clear();
    Ajax.get(
      this.getQueryUrl(),
      function(data) {
        CallDb.putAll(data.callEvents, function() {
          CallDb.query().where("duration").above(1000).sortBy("startTime", function(calls) {
            this.setState({
              calls    : calls,
              selected : 0
            });
            toastr.clear();
          }.bind(this));
        }.bind(this));
      }.bind(this)
    );
  },
  nextCall: function(relative, absolute) {
    var next = this.state.selected + relative;
    if (next < 0 || next > (this.state.calls.length - 1)) {
      next = 0;
    }

    if (absolute === undefined) {
      this.setState({ selected : next });
    } else {
      this.setState({ selected : absolute });
    }
  },
  handleKey: function(e) {
    switch (e.which) {
      case 32:
        this.audio.togglePlayPause();
        this.stopEvent(e);
        return false;

      case 39:
        this.nextCall(1);
        break;
      case 37:
        this.nextCall(-1);
        break;
      case 38:
        this.nextCall(-12);
        return false;
      case 40:
        this.nextCall(12);
        return false;

      case 191:
        this.intro.show();
        break;
      case 27:
        this.intro.hide();
        break;
    }
    return true;
  },
  getInitialState: function() {
    return {
      tz           : TzCache.get(this.props.params.localityId),
      localityName : this.props.params.localityName,
      localityId   : this.props.params.localityId,
      startMs      : parseInt(this.props.params.startMs),
      endMs        : parseInt(this.props.params.endMs),
      calls        : [],
      selected     : 0,
      colorBy      : Colors.COLOR_BY_GROUP
    };
  },
  componentWillMount: function() {
    toastr.options.timeOut = 10000;
    toastr.success("Loading calls...");
    this.loadCalls();
  },
  componentDidMount: function() {
    document.addEventListener("keydown", this.handleKey);
  },
  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.handleKey);
  },
  render: function() {
    var start = moment.utc(this.state.startMs).tz(this.state.tz);
    var end   = moment.utc(this.state.endMs).tz(this.state.tz);

    return (
      <div className="siftView">
        <Helmet title={this.state.localityName + " Calls"} />
        <div className="pageHeading">
          <h1>{this.state.localityName}</h1>
          <span className="timeSpan">{start.format("dddd, MMMM Do")}, {start.format("h:mm A")} to {end.format("h:mm A")}</span>
        </div>
        <div className="pageContent">
          <SiftIntroModal ref={(r) => this.intro = r} />
          <CallsGridHeading
            tz={this.state.tz} colorBy={this.state.colorBy} count={this.state.calls.length}
            call={this.state.calls[this.state.selected]}
            callback={function(colorBy) {
              this.setState({ colorBy : colorBy });
            }.bind(this)}
          />
          <CallsGrid colorBy={this.state.colorBy} calls={this.state.calls}
            selected={this.state.selected} callback={this.nextCall}
          />
          <SiftCallPlayback
            calls={this.state.calls} selected={this.state.selected}
            ref={(r) => this.audio = r} callback={this.nextCall.bind(this, 1)}
          />
        </div>
      </div>
    );
  }
});


module.exports = SiftView;
