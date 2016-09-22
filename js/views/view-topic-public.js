/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React  = require('react');
var Helmet = require('react-helmet');
var Table  = require('fixed-data-table').Table;
var Column = require('fixed-data-table').Column;
var Cell   = require('fixed-data-table').Cell;

var Ajax          = require('../util/ajax.js');
var CallCache     = require('../cache/call-cache.js');
var Colors        = require('../util/colors.js');
var Config        = require('../config/config.js');

var TOPIC_API_URL = Config.apiEndpoint + "/topic";


var PublicTopicHeading = React.createClass({
  render: function() {
    return (
      <div className="publicTopicHeading row">
        <div className="col-sm-4"></div>
        <div className="col-sm-4">{this.props.name}</div>
        <div className="col-sm-4"></div>
      </div>
    );
  }
});

var TopicCallsTable = React.createClass({
  handleToggleAudio: function(audioId) {
    var audio = document.getElementById(audioId);
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  },
  getInitialState: function() {
    return {
      headerHeight : 50,
      rowHeight    : 70,
      height       : window.innerHeight * 0.70
    };
  },
  componentDidMount: function() {
    this.setState({
      width       : $(".publicTopicBox").width(),
      columnWidth : $(".publicTopicBox").width() / 5
    });
  },
  componentWillReceiveProps: function(nextProps) {
    var maxHeight = window.innerHeight * 0.70;
    this.setState({
      height : Math.min(maxHeight, (nextProps.calls.length * 70) + 52)
    });
  },
  componentDidUpdate: function (prevProps, prevState) {
    Array.prototype.forEach.call(document.getElementsByClassName("audioSource"), function(node) {
      node.load();
    });
  },
  badgeFor: function(colorBy, call) {
    return (
      <div className="idBadge" style={{backgroundColor : Colors.forCall(colorBy, call)}}>
        <div className="idBadgeNumbers">
          {(colorBy == Colors.COLOR_BY_GROUP) ? call.groupId : call.sourceId}
        </div>
      </div>
    );
  },
  glyphControlsFor: function(topicId, call) {
    return (
      <div className="glyphControls">
        <span className="glyphicon glyphicon-play" onClick={this.handleToggleAudio.bind(this, "audio" + call.id)}></span>
        <a href={call.audioSource}><span className="glyphicon glyphicon-cloud-download"></span></a>
        <audio className="audioSource" src={call.audioSource} id={"audio" + call.id} type="audio/x-wav" />
      </div>
    );
  },
  render: function() {
    if (this.props.calls.length <= 0) {
      return (<div className="topicCallsTable"></div>);
    }

    return (
      <div className="topicCallsTable">
        <Table rowHeight={this.state.rowHeight} rowsCount={this.props.calls.length}
               width={this.state.width} height={this.state.height} headerHeight={this.state.headerHeight}>

          <Column header={<Cell className="colHeader">City</Cell>}
                  cell={props => (
                    <Cell {...props} className="callCell">
                      {this.props.calls[props.rowIndex].localityName}
                    </Cell>
                  )}
                  fixed={true} width={this.state.columnWidth} />

          <Column header={<Cell className="colHeader">Talkgroup</Cell>}
                  cell={props => (
                    <Cell {...props} className="callCell">
                      {this.badgeFor(Colors.COLOR_BY_GROUP, this.props.calls[props.rowIndex])}
                    </Cell>
                  )}
                  fixed={true} width={this.state.columnWidth} />

          <Column header={<Cell className="colHeader">Officer</Cell>}
                  cell={props => (
                    <Cell {...props} className="callCell">
                      {this.badgeFor(Colors.COLOR_BY_SOURCE, this.props.calls[props.rowIndex])}
                    </Cell>
                  )}
                  fixed={true} width={this.state.columnWidth} />

          <Column header={<Cell className="colHeader">Time</Cell>}
                  cell={props => (
                    <Cell {...props} className="callCell">{
                      moment.utc(this.props.calls[props.rowIndex].startTime)
                            .tz(this.props.calls[props.rowIndex].tzName)
                            .format("MM/DD/YY h:mm:ss A")
                    }</Cell>
                  )}
                  fixed={true} width={this.state.columnWidth} />

          <Column header={<Cell className="colHeader">Controls</Cell>}
                  cell={props => (
                    <Cell {...props} className="callCell">
                      {this.glyphControlsFor(this.props.topicId, this.props.calls[props.rowIndex])}
                    </Cell>
                  )}
                  fixed={true} width={this.state.columnWidth} />
        </Table>
      </div>
    );
  }
});

var PublicTopicBox = React.createClass({
  loadTopic: function(topicId) {
    Ajax.get(
      TOPIC_API_URL + "/" + topicId,
      function(topic) {
        this.setState({ name : topic.name });
        var callIds = topic.links.map(function(link) { return link.callId; });
        CallCache.getAll(callIds, function(calls) {
          this.setState({ calls : calls });
          toastr.clear();
        }.bind(this));
      }.bind(this)
    );
  },
  getInitialState: function() {
    return {
      name  : "",
      calls : []
    };
  },
  componentWillMount: function() {
    toastr.options.timeOut = 10000;
    toastr.success("Loading topic links...");
    this.loadTopic(this.props.params.topicId);
  },
  render: function() {
    return (
      <div>
        <Helmet title={"Topic: " + this.state.name} />
        <h1>Public Topic</h1>
        <div className="publicTopicBox center-block">
          <PublicTopicHeading name={this.state.name} />
          <TopicCallsTable calls={this.state.calls} />
        </div>
      </div>
    );
  }
});


module.exports = PublicTopicBox;
