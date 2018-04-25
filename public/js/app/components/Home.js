var React = require('react');
var ReactDOM = require('react-dom');
var SnapshotListModal = require('./SnapshotListModal'); 

var Home = React.createClass({
  getInitialState: function () {
    return {
      snapshots: null
    }
  },
  loadModal: function(e) {
    var self = this;
    e.preventDefault();

    $(ReactDOM.findDOMNode(this.refs.openSnapshotModal)).modal('show');

    $.ajax({
      url: '/api/snapshots/list',
      dataType: 'json',
      success: function(response) {
        self.setState({snapshots: response});
      }
    });
  },
  render: function() {
    return (
      <div className="row-fluid">
        <div className="span12 analyze-sections">
          <div className="analyze-section section-trending">
            <div id="emptyCalculationMessage">
              <div className="alert alert-info">
                <h3>Welcome.</h3>
                <p>This is where it all begins. You can perform calculations, create new snapshots to easily compare results, and save
                  <a href="/manage/snapshots" data-toggle="tooltip" title="Snapshots are saved calculations"> snapshots </a> to easily recall them later. 
                </p>
                <p className="text-center">
                  <a href="/analyze/trending" className="btn btn-info btn-large-icon btn-wide btn-options-clone">
                    <i className="icon-bar-chart" />
                    Start New Calculation
                  </a>
                  <a href="#" onClick={this.loadModal} className="btn btn-wide btn-large-icon btn-open-worksheet">
                    <i className="icon-folder-open" />
                    Open Snapshot
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <SnapshotListModal ref="openSnapshotModal" 
          snapshots={this.state.snapshots}/>
      </div>
    );
  }
});

module.exports = Home;