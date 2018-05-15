var React = require('react');
var store = require('store');

var SnapshotTab = React.createClass({
  openTab: function() {
    this.props.goToSection(this.props.snapshotData.tabId);
  },
  componentDidUpdate: function() {
    this.toggleButtons();
  },
  componentDidMount: function() {
    this.toggleButtons();
  },
  toggleButtons: function() {
    if (this.props.snapshotData.isNew) {
      $('.tab-toolbar .btn-save-worksheet').show();
      $('.tab-toolbar .btn-rename-tab')
        .hide()
        .parent()
        .removeClass('btn-group');
    } else {
      $('.tab-toolbar .btn-rename-tab').show();
      $('.tab-toolbar .btn-save-worksheet')
        .hide()
        .parent()
        .removeClass('btn-group');
    }
  },
  removeTabHandler: function(e) {
    e.preventDefault();

    var self = this;
    var currentTab = $('.btn-tab.active');
    var snapshotName = currentTab.find('span.name').text();
    if(!currentTab.data('default') && currentTab.children('.unsaved-indicator').length > 0){
      var html = '<p class="lead text-center">Are you sure you want to delete unsaved snapshot?</p>';
      bootbox.confirm(html, function(result){
        if(result){
          var snapshots = store.get('snapshots');
          if (snapshots) {
            delete snapshots[snapshotName];
            store.set('snapshots', snapshots);
            store.remove(snapshotName);
          }
          self.props.removeTab(currentTab.data('section'));
        }
      });
    } else {

      var snapshots = store.get('snapshots');
      if (snapshots) {
        delete snapshots[snapshotName];
        store.set('snapshots', snapshots);
        store.remove(snapshotName);
      }
      this.props.removeTab(currentTab.data('section'));
    }
  },
  render: function() {
    var tabClasses = "btn btn-tab";
    if(this.props.currentTab === this.props.snapshotData.tabId){
      tabClasses += " active";
    }
    return (
      <div className={tabClasses}
           data-default="true"
           data-section={this.props.snapshotData.tabId}
           onClick={this.openTab}>
          {function(){
            if(this.props.snapshotData.isNew){
              return <i className="icon-asterisk unsaved-indicator"></i>;
            } else {
              return (
                <input 
                  type="hidden" 
                  id="worksheetId" 
                  value={this.props.snapshotData.worksheetId} >
                </input>
              );
            }
          }.call(this)}
          <span className="name">{this.props.snapshotData.name}</span> &nbsp;&nbsp; 
          <i onClick={this.removeTabHandler} className="icon-remove-sign"></i>
      </div>
    );
  }
});

SnapshotTab.propTypes = {
  goToSection: React.PropTypes.func.isRequired,
  currentTab: React.PropTypes.string.isRequired,
  tabCount: React.PropTypes.number.isRequired,
  snapshotData: React.PropTypes.object.isRequired,
  removeTab: React.PropTypes.func.isRequired
};

module.exports = SnapshotTab;