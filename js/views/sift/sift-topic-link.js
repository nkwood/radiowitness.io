/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React    = require('react');
var TopicsDb = require('../../db/topics-db.js');


var SiftTopicLinkModal = React.createClass({
  handleSave: function(e) {
    if (e !== undefined) { e.preventDefault(); }

    var topicId = parseInt($("option[name='topicId']:selected").val());
    var callId  = parseInt($("#linkRecordId").val());

    TopicsDb.linkCall(topicId, callId, function() {
      this.callback(true);
      this.callback = undefined;
      $("#siftTopicLinkModal").modal('hide');
    }.bind(this));
  },
  show: function(callback) {
    this.callback = callback;
    $("#siftTopicLinkModal").modal('show');
  },
  getInitialState: function() {
    return { options : [] };
  },
  componentDidMount: function() {
    $("#siftTopicLinkModal").on("shown.bs.modal", function (e) {
      $("#siftTopicSelect").focus();
    });
    $("#siftTopicLinkModal").on("hidden.bs.modal", function (e) {
      if (this.callback !== undefined) { this.callback(false); }
    }.bind(this));
  },
  componentWillReceiveProps: function(nextProps) {
    TopicsDb.getTopics(function(topics) {
      var options = topics.map(function(topic, i) {
        return <option name="topicId" key={topic.id} value={topic.id} defaultValue={(i === 0)}>{topic.name}</option>;
      });
      this.setState({ options : options });
    }.bind(this));
  },
  render: function() {
    return (
      <div className="siftTopicLinkModal">
        <div id="siftTopicLinkModal" className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Link To Topic</h4>
              </div>
              <div className="modal-body">
                <form className="form-horizontal" onSubmit={this.handleSave}>
                  <input type="hidden" id="linkRecordId" value={(this.props.call === undefined) ? 0 : this.props.call.id} />
                  <select id="siftTopicSelect" className="form-control">{this.state.options}</select>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
                <button type="button" className="btn btn-primary" onClick={this.handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});


module.exports = SiftTopicLinkModal;