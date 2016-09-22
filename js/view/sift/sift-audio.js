/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');
var Link  = require('react-router').Link;

var CallCache = require('../../cache/call-cache.js');


var SiftCallPlayback = React.createClass({
  loadCall: function(props) {
    var call = props.calls[props.selected];
    if (call != null) {
      CallCache.get(call.id, function(fetched) {
        this.setState({ audioUrl : fetched.audioSource });
      }.bind(this));
    } else {
      this.setState({ audioUrl : null });
    }
  },
  play: function() {
    $("#siftAudio").get(0).play();
    this.setState({ autoPlay : true });
  },
  pause: function() {
    $("#siftAudio").get(0).pause();
    this.setState({ autoPlay : false });
  },
  togglePlayPause: function() {
    if ($("#siftAudio").get(0).paused) {
      this.play();
    } else {
      this.pause();
    }
  },
  getInitialState: function() {
    return {
      audioUrl : null,
      autoPlay : true
    };
  },
  componentWillMount: function() {
    this.loadCall(this.props);
  },
  componentDidMount: function() {
    $("#siftAudio").bind("ended", function() {
      this.props.callback();
    }.bind(this));
    $("#siftAudio").bind("loadeddata", function() {
      if (this.state.autoPlay) {
        this.play();
      }
    }.bind(this));
    if (this.state.audioUrl != null) {
      $("#siftAudio").load();
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.loadCall(nextProps);
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return this.props          !== nextProps ||
           this.state.audioUrl !== nextState.audioUrl;
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.audioUrl != null) {
      $("#siftAudio").load();
    }
  },
  render: function() {
    return (
      <div className="siftCallPlayback">
        <audio controls id="siftAudio">
          {(this.state.audioUrl != null) ?
             <source src={this.state.audioUrl} type="audio/x-wav" /> :
             <source type="audio/x-wav" />}
        </audio>
      </div>
    );
  }
});


module.exports = SiftCallPlayback;
