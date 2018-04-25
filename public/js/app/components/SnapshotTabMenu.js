var React = require('react');
var SnapshotTab = require('./SnapshotTab');
var PendingTab = require('./PendingTab');

var SnapshotTabMenu = React.createClass({
  render: function() {
    var allTabs = this.props.tabs.concat(this.props.pendingSnapshotIds);
    var snapshotTabs = allTabs.map(function(tabData, index){
        if(_.contains(this.props.pendingSnapshotIds, tabData)){
          return (
            <PendingTab
              key={index}
              snapshotTab={tabData}
              />
          );

        } else {
          return (
            <SnapshotTab 
              goToSection={this.props.goToSection} 
              currentTab={this.props.currentTab} 
              snapshotData={tabData} 
              removeTab={this.props.removeTab}
              tabCount={this.props.tabCount}  
              key={index} />
          );

        }

    }, this);
    return (
      <div className="btn-group tab-buttons">
        {snapshotTabs}
      </div>
    );
  }
});

SnapshotTabMenu.propTypes = {
  goToSection: React.PropTypes.func.isRequired,
  currentTab: React.PropTypes.string.isRequired,
  tabCount: React.PropTypes.number.isRequired,
  tabs: React.PropTypes.array.isRequired,
  removeTab: React.PropTypes.func.isRequired
};

module.exports = SnapshotTabMenu;