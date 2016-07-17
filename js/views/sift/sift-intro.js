/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');


var SiftIntroModal = React.createClass({
  show: function() {
    $("#siftIntroModal").modal('show');
  },
  componentDidMount: function() {
    this.show();
  },
  render: function() {
    return (
      <div className="siftIntroModal">
        <div id="siftIntroModal" className="modal fade" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal">&times;</button>
                <h4 className="modal-title">Hotkeys</h4>
              </div>
              <div className="modal-body">
                <div className="hotKeysRef">
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-play"></span>
                    <span className="col-sm-10">Play and pause calls with space bar.</span>
                  </div>
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-backward"></span>
                    <span className="col-sm-10">Skip around using the arrow keys.</span>
                  </div>
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-list-alt"></span>
                    <span className="col-sm-10">Type <span className="hotKey">T</span> to create a new topic.</span>
                  </div>
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-link"></span>
                    <span className="col-sm-10">Type <span className="hotKey">L</span> to link calls to topics.</span>
                  </div>
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-search"></span>
                    <span className="col-sm-10">Search topics by pressing <span className="hotKey">S</span>.</span>
                  </div>
                  <div className="row">
                    <span className="leftCol col-sm-2 glyphicon glyphicon-question-sign"></span>
                    <span className="col-sm-10">Press <span className="hotKey">?</span> to show this dialog again.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = SiftIntroModal;