/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React          = require('react');
var Table          = require('fixed-data-table').Table;
var Column         = require('fixed-data-table').Column;
var Cell           = require('fixed-data-table').Cell;
var browserHistory = require('react-router').browserHistory;

var Ajax      = require('../util/ajax.js');
var TopicsDb  = require('../db/topics-db.js');
var CallCache = require('../cache/call-cache.js');
var Colors    = require('../util/colors.js');
var Config    = require('../config/config');

var TOPIC_API_URL = Config.apiEndpoint + "/topic";


var TopicSelect = React.createClass({
  handleOptionSelected: function(event) {
    this.props.selectCallback(parseInt(event.target.value));
  },
  handlePublish: function(event) {
    for (var i = 0; i < this.props.topics.length; i++) {
      if (this.props.topicId == this.props.topics[i].id) {
        this.props.publishCallback(this.props.topics[i]);
      }
    }
  },
  render: function() {
    var options = this.props.topics.map(function(topic) {
      return (
        <option key={topic.id} value={topic.id} defaultValue={this.props.topicId === topic.id}>
          {topic.name}
        </option>
      );
    }.bind(this));

    return (
      <div className="topicSelect row">
        <div className="col-sm-1"></div>
        <div className="col-sm-8">
          <select className="form-control input-lg" onChange={this.handleOptionSelected}>
            {options}
          </select>
        </div>
        <div className="col-sm-2">
          <button type="button" className="btn btn-primary fullWidth" onClick={this.handlePublish}>
            PUBLISH
          </button>
        </div>
        <div className="col-sm-1"></div>
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
  handleUnlink: function(topicId, callId) {
    TopicsDb.unlinkCall(topicId, callId, function(count) {
      this.props.unlinkCallback(topicId);
    }.bind(this));
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
      width       : $(".viewTopicsPrivateBox").width(),
      columnWidth : $(".viewTopicsPrivateBox").width() / 5
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
        <span className="glyphicon glyphicon-remove" onClick={this.handleUnlink.bind(this, topicId, call.id)}></span>
      </div>
    );
  },
  render: function() {
    if (this.state.width === undefined) {
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

var ViewTopicsPrivateBox = React.createClass({
  loadCalls: function(topicId) {
    if (topicId !== undefined) {
      TopicsDb.linksFor(topicId, function(links) {
        var callIds = links.map(function(link) { return link.callId; });
        CallCache.getAll(callIds, function(calls) {
          this.setState({ calls : calls });
        }.bind(this));
      }.bind(this));
    }
  },
  loadTopics: function() {
    TopicsDb.getTopics(function(topics) {
      var topicId = (this.state.topicId !== undefined) ? this.state.topicId : topics[0].id;
      this.setState({
        topicId : topicId,
        topics  : topics,
        calls   : []
      });
      this.loadCalls(topicId);
    }.bind(this));
  },
  handleTopicChange: function(topicId) {
    this.setState({
      topicId : topicId,
      calls   : []
    });
    this.loadCalls(topicId);
  },
  handlePublishTopic: function(topic) {
    var topicLinks = this.state.calls.map(function(call) { return { callId : call.id }; });
    var topicObj   = { name : topic.name, links : topicLinks };
    Ajax.post(
      TOPIC_API_URL,
      JSON.stringify(topicObj),
      function (topicId) {
        browserHistory.push("/topics/public/" + topicId);
      }.bind(this)
    );
  },
  getInitialState: function() {
    return {
      topicId : undefined,
      topics  : [],
      calls   : []
    };
  },
  componentWillMount: function() {
    document.title = "Radio Witness - private topics";
    this.loadTopics();
  },
  render: function() {
    return (
      <div>
        <h1>Private Topics</h1>
        <div className="viewTopicsPrivateBox center-block">
          <TopicSelect
            topicId={this.state.topicId} topics={this.state.topics}
            selectCallback={this.handleTopicChange} publishCallback={this.handlePublishTopic}
          />
          <TopicCallsTable
            topicId={this.state.topicId} calls={this.state.calls}
            unlinkCallback={this.handleTopicChange}
          />
        </div>
      </div>
    );
  }
});


module.exports = ViewTopicsPrivateBox;
