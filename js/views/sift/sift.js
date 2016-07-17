/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');
var Link  = require('react-router').Link;

var SiftIntroModal       = require('./sift-intro.js');
var SiftCallPlayback     = require('./sift-audio.js');
var SiftTopicCreateModal = require('./sift-topic-create.js');
var SiftTopicLinkModal   = require('./sift-topic-link.js');

var Ajax     = require('../../util/ajax.js');
var CallDb   = require('../../db/call-db.js');
var TopicsDb = require('../../db/topics-db.js');
var TzCache  = require('../../cache/tz-cache.js');
var Colors   = require('../../util/colors.js');

var CALLS_API_URL = "/api/calls";


var CallsGridHeading = React.createClass({
  handleOptionSelected: function(event) {
    $("#colorBy").blur();
    if (event.target.value == "talkgroup") {
      this.props.callback(Colors.COLOR_BY_GROUP);
    } else {
      this.props.callback(Colors.COLOR_BY_SOURCE);
    }
  },
  defaultCall: function() {
    return {
      id        : 0,
      sourceId  : 0,
      groupId   : 0,
      startTime : 0
    };
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
    var call = (this.props.call != null) ? this.props.call : this.defaultCall()

    return (
      <div className="callsGridHeading row">
        <div className="col-sm-3">
          <label htmlFor="colorBy">Color by</label>
          <select id="colorBy" className="form-control" onChange={this.handleOptionSelected}>
            <option defaultValue={this.props.colorBy == Colors.COLOR_BY_GROUP}>talkgroup</option>
            <option defaultValue={this.props.colorBy == Colors.COLOR_BY_SOURCE}>officer</option>
          </select>
        </div>
        <div className="col-sm-3">
          {this.inputFor("callCount", "Call count", this.props.count.toLocaleString())}
        </div>
        <div className="col-sm-2">
          {call.startTime == 0 ?
            this.inputFor("callTimestamp", "Timestamp", 0) :
            this.inputFor("callTimestamp", "Timestamp", moment.utc(call.startTime).tz(this.props.tz).format("h:mm:ss A"))}
        </div>
        <div className="col-sm-2">
          {this.inputFor("officerId", "Officer ID", call.sourceId)}
        </div>
        <div className="col-sm-2">
          {this.inputFor("talkgroupId", "Talkgroup ID", call.groupId)}
        </div>
      </div>
    );
  }
});

var CallsGrid = React.createClass({
  spanForCall: function(call, index) {
    return (index == this.props.selected) ?
      <span className="glyphicon glyphicon-volume-up"></span> :
      <span className="callDuration">{Math.round(call.duration / 1000)}<span className="callDurationS">s</span></span>;
  },
  handleClick: function(index) {
    this.props.callback(0, index);
  },
  render: function() {
    var rows    = [];
    var columns = this.props.calls.map(function(call, i) {
      return <div key={call.id} className="callsGridCol col-sm-1"
                  style={{backgroundColor : Colors.forCall(this.props.colorBy, call)}}
                  onClick={this.handleClick.bind(this, i)}>
               {this.spanForCall(call, i)}
             </div>;
    }.bind(this));

    while (columns.length > 0) {
      rows.push(columns.splice(0, 12));
    }

    return (
      <div className="callsGrid">
        {rows.map(function(row, i) {
           return <div key={"row-" + i} className="callsGridRow row">{row}</div>
         })}
      </div>
    );
  }
});

var SiftBox = React.createClass({
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

    if (absolute === undefined && this.isPromptActive === false) {
      this.setState({ selected : next });
    } else if (absolute === undefined) {
      this.setState({ selected : this.state.selected });
    } else {
      this.setState({ selected : absolute });
    }
  },
  handleKey: function(e) {
    if (this.isPromptActive) { return; }

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

      case 84:
        this.isPromptActive = true;
        this.topicCreate.show(function(result) {
          this.isPromptActive = false;
          if (result === true) {
            toastr.options.timeOut = 1250;
            toastr.success("Topic created");
          }
        }.bind(this));
        break;

      case 76:
        this.isPromptActive = true;
        this.topicLink.show(function(result) {
          this.isPromptActive = false;
          if (result === true) {
            toastr.options.timeOut = 1250;
            toastr.success("Topic linked");
          }
        }.bind(this));
        break;

      case 83:
        var win = window.open("/#/topics/private", '_blank');
        win.focus();
        break;

      case 191:
        this.intro.show();
        break;
    }
    return true;
  },
  getInitialState: function() {
    this.isPromptActive = false;
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
    document.title = "Radio Witness - " + this.state.localityName;
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
  componentDidUpdate: function(prevProps, prevState) {
    var call = this.state.calls[this.state.selected];
    if (call !== undefined) {
      document.title = "Radio Witness - " + this.state.localityName + " - " +
        moment.utc(call.startTime).tz(this.state.tz).format("h:mm:ss A");
    }
  },
  render: function() {
    var start = moment.utc(this.state.startMs).tz(this.state.tz);
    var end   = moment.utc(this.state.endMs).tz(this.state.tz);

    return (
      <div>
        <h1 className="siftBoxHeading">
          {this.state.localityName}
          <span className="timeSpanSpan">
            {start.format("dddd, MMMM Do")}, {start.format("h:mm A")} to {end.format("h:mm A")}
          </span>
        </h1>
        <div className="siftBox center-block">
          <SiftIntroModal ref={(r) => this.intro = r} />
          <SiftTopicCreateModal
            ref={(r) => this.topicCreate = r}
            call={this.state.calls[this.state.selected]}
          />
          <SiftTopicLinkModal
            ref={(r) => this.topicLink = r}
            call={this.state.calls[this.state.selected]}
          />

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


module.exports = SiftBox;