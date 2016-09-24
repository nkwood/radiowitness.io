/*
 * Copyright (C) 2016 An Honest Effort LLC.
 */

var React = require('react');


var SiftIntroModal = React.createClass({
  show: function() {
    $("#siftIntroModal").modal('show');
  },
  hide: function() {
    $("#siftIntroModal").modal('hide');
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
                <span className="h3 modal-title">Hotkeys</span>
              </div>
              <div className="modal-body">
                <div className="hotKeysRef">
                  <div className="row">
                    <span className="h4 col-xs-12">
                      <span className="glyphicon glyphicon-play"></span>
                      Play and pause calls with space bar.
                    </span>
                  </div>
                  <div className="row">
                    <span className="h4 col-xs-12">
                      <span className="glyphicon glyphicon-backward"></span>
                      Skip around using the arrow keys.
                    </span>
                  </div>
                  <div className="row">
                    <span className="h4 col-xs-12">
                      <span className="glyphicon glyphicon-question-sign"></span>
                      Press <span className="hotKey">?</span> to show this dialog again.
                    </span>
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
