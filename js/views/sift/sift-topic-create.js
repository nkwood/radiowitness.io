/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React    = require('react');
var TopicsDb = require('../../db/topics-db.js');


var SiftTopicCreateModal = React.createClass({
  handleSave: function(e) {
    if (e !== undefined) { e.preventDefault(); }

    var topicName = $("#topicName").val();
    var linkCall  = $("#linkRecord:checked").val() == "on";
    var callId    = (linkCall === true) ? parseInt($("#topicRecordId").val()) : undefined;

    TopicsDb.createTopic(topicName, function() {
      this.callback(true);
      this.callback = undefined;
      $("#siftTopicCreateModal").modal('hide');
    }.bind(this), callId);
  },
  show: function(callback) {
    this.callback = callback;
    $("#siftTopicCreateModal").modal('show');
  },
  componentDidMount: function() {
    $("#siftTopicCreateModal").on("shown.bs.modal", function (e) {
      $("#topicName").focus();
    });
    $("#siftTopicCreateModal").on("hidden.bs.modal", function (e) {
      if (this.callback !== undefined) { this.callback(false); }
      $("#topicName").val("");
    }.bind(this));
  },
  render: function() {
    return (
      <div className="siftTopicCreateModal">
        <div id="siftTopicCreateModal" className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Create New Topic</h4>
              </div>
              <div className="modal-body">
                <form className="form-horizontal" onSubmit={this.handleSave}>
                  <input type="hidden" id="topicRecordId" value={(this.props.call === undefined) ? 0 : this.props.call.id} />
                  <div className="form-group row">
                    <label className="col-sm-3 control-label" htmlFor="topicName">Topic name</label>
                    <div className="col-md-9">
                      <input type="text" className="form-control input-md" id="topicName" />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-offset-3 col-sm-9">
                      <div className="checkbox">
                        <label>
                          <input type="checkbox" id="linkRecord" defaultChecked={true} />
                          link current call
                        </label>
                      </div>
                    </div>
                  </div>
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


module.exports = SiftTopicCreateModal;