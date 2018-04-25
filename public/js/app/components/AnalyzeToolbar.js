var React = require('react');
var SnapshotTabMenu = require('./SnapshotTabMenu');

var AnalyzeToolbar = React.createClass({
  render: function() {
    return (

      <div id="analyzeToolbar">
        <div className="row-fluid">
          <div className="span12">
            <div className="btn-toolbar">
              <div className="btn-group">
                <button onClick={this.props.loadModal} className="btn" data-toggle="tooltip" title="Open Snapshot">
                  <i className="icon-folder-open" />
                </button>
              </div>
              <SnapshotTabMenu 
              	goToSection={this.props.goToSection} 
                currentTab={this.props.currentTab} 
                pendingSnapshotIds={this.props.pendingSnapshotIds}
                tabCount={this.props.tabCount} 
                tabs={this.props.tabs} 
                removeTab={this.props.removeTab}
                />
              <div className="btn-group">
                <button onClick={this.props.createSnapshotTab} data-toggle="tooltip" title="Create Snapshot" className="btn">
                  <i className="icon-plus" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

AnalyzeToolbar.propTypes = {
	loadModal: React.PropTypes.func.isRequired,
	createSnapshotTab: React.PropTypes.func.isRequired,
	goToSection: React.PropTypes.func.isRequired,
	tabCount: React.PropTypes.number.isRequired,
	currentTab: React.PropTypes.string,
	removeTab: React.PropTypes.func.isRequired,
	tabs: React.PropTypes.array
};

module.exports = AnalyzeToolbar;