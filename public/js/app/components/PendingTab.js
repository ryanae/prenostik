var React = require('react');

var PendingTab = React.createClass({
  render: function() {
    var tabClasses = "btn btn-tab";
    return (
      <div className={tabClasses}
           data-default="true"
           data-section={this.props.snapshotId}>
           <img src="/img/ajax-loader-circle.gif"/>
           <span className="name">{'Loading Snapshot'}</span> &nbsp;&nbsp; 
      </div>
    );
  }
});


module.exports = PendingTab;