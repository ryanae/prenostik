var React = require('react');
var ReactDOM = require('react-dom');
var SnapshotOptions = require('./SnapshotOptions');
var ChartBox = require('./ChartBox');
var cx = require('classnames');

var SnapshotBox = React.createClass({
  getInitialState: function() {
    return {
      newTabs: {

      }
    }
  },
  toggleOptions: function(e) {
    if(e && e.preventDefault){
      e.preventDefault();
    }
    if ($('#trendingOptions').hasClass('open')) {
      $('#trendingOptions').removeClass('open');
      setTimeout(function() {
        $('#trendingOptions').css('visibility', 'hidden');
      }, 250);
    } else {
      $('#trendingOptions').css('visibility', 'visible').addClass('open');
    }

  },

  openOptions: function() {
    if(!$('#trendingOptions').hasClass('open')){
      $('#trendingOptions')
        .css('visibility', 'visible')
        .addClass('open');
    }
  },

  hideOptions: function() {
    if ($('#trendingOptions').hasClass('open')) {
      $('#trendingOptions').removeClass('open');
      setTimeout(function() {
        $('#trendingOptions').css('visibility', 'hidden');
      }, 250);
    }
  },

  componentDidUpdate: function() {
    // Todo check if new snapshot by props
    var self = this;
    if(this.props.currentTab !== ''){
      _.each(this.props.snapshots, function(tab){
        if(tab.tabId == self.props.currentTab){
          if(tab.isNew){
            // if tab has already been opened
            // do not open options again
            //self.openOptions();
          }
        }
      });
    }
  },
  printHandlerSimple: function(e) {
    e.preventDefault();
    var self = this;
    $(".correlation-table, .table-striped").css("display","none");
    window.print();
    $(".correlation-table, .table-striped").css("display","block");
  },
  printHandler: function(e) {
    e.preventDefault();
    var self = this;
    window.print();
    // mywindow.document.write('<html lang="en" class="analyze-controller trending-template"><head>');
    // mywindow.document.write($head);
    // mywindow.document.write('</head><body>');
    // mywindow.document.write($body);
    // mywindow.document.write('</body></html>');
    // mywindow.document.close();
    // mywindow.focus();

  },
  saveSnapshotHandler: function(e) {
    e.preventDefault();
    var name = $('.tab-buttons .btn.active .name').text();
    this.props.saveSnapshot(name);
  },

  renameSnapshotHandler: function(e){
    e.preventDefault();
    this.props.renameSnapshot();
  },

  render: function() {
    var self = this;
    // toggle options on view change
    var chartContainers = this.props.snapshots.filter(function(snapshot){
        return this.props.pendingSnapshotIds.slice(snapshot.worksheetId) !== 1
    }, this).map(function(snapshot, index){
       return (
          <ChartBox 
            data={snapshot} 
            key={index} 
            forceChartUpdate={snapshot.forceChartUpdate}
            pendingData={this.props.pendingData}
            useInitialSort={this.props.useInitialSort}
            getPendingDatasets={this.props.getPendingDatasets}
            currentTab={this.props.currentTab} 
            currentPageNumber={this.props.currentPageNumber}
            tabCount={this.props.tabCount} />
        );
    }, this);

    var currentTabOptions = {};
    var isNew = false;
    var hasData = true;
    _.each(this.props.snapshots, function(tab){
      if(tab.tabId == self.props.currentTab){
        currentTabOptions = tab.options;
        if(tab.isNew) isNew = true;
        if(tab.hasData === false) hasData = false; 
        console.log(tab);
      }
    });

    var btnGroupClasses = cx({
      'btn-group': false,
      'pull-right': true
    });
    
    return (
      <div id="sectionContainer" className="">
        <div className="row-fluid">
          {function(){
            if(this.props.snapshots.length > 0){
              return (
                  <div className="span12 tab-toolbar">
                    <div className="btn-group">
                      <a onClick={this.toggleOptions} 
                        ref="optionsButton" 
                        className="btn btn-primary" 
                        href="#">
                      Parameters&nbsp;
                      <i className="icon-cog"></i>
                      </a>
                    </div>
                    <div className={btnGroupClasses}>
                      {function(){
                        if(isNew === true && hasData === true){
                          return (
                            <div onClick={this.saveSnapshotHandler} 
                              className="btn btn-save-snapshot">
                              <i className="icon-save"></i> Save
                            </div>
                          );
                        }
                      }.call(this)}
                      {function(){
                        if(isNew === false){
                          return (
                            <div onClick={this.renameSnapshotHandler} 
                                className="btn-rename-tab btn">
                              <i className="icon-pencil"></i> Edit
                            </div>
                          )
                        }
                      }.call(this)}
                      <div className="btn-group">
                        <a className="btn dropdown-toggle" data-toggle="dropdown" href="#">
                          <i className="icon-print"></i> Print
                          <span className="caret"></span>
                        </a>
                        <ul className="dropdown-menu">
                          <li><a href="#simple" onClick={this.printHandlerSimple}>Simple</a></li>
                          <li><a href="#all" onClick={this.printHandler}>All</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="span12 tab-toolbar">
                  </div>
                );
              }
            }.call(this)}
        </div>
        {function() {
          if(this.props.snapshots.length > 0){
            return (
              <SnapshotOptions 
                toggleOptions={this.toggleOptions} 
                hideOptions={this.hideOptions} 
                openOptions={this.openOptions}
                calculateTrendingCharts={this.props.calculateTrendingCharts} 
                copySnapshotToTab={this.props.copySnapshotToTab}
                options={currentTabOptions} 
                isNew={isNew}
                ref="options" 
                currentTab={this.props.currentTab}
                datasets={this.props.datasets} >
              </SnapshotOptions>
            );
          }
        }.call(this)}
        {chartContainers}
      </div>
    )
  }
});

SnapshotBox.propTypes = {
	datasets: React.PropTypes.array.isRequired,
	snapshots: React.PropTypes.array.isRequired,
	saveSnapshot: React.PropTypes.func.isRequired,
	renameSnapshot: React.PropTypes.func.isRequired,
	calculateTrendingCharts: React.PropTypes.func.isRequired,
	copySnapshotToTab: React.PropTypes.func.isRequired,
	currentTab: React.PropTypes.string.isRequired,
	tabCount: React.PropTypes.number.isRequired,
	filterList: React.PropTypes.object,
	useInitialSort: React.PropTypes.bool,
	getPendingDatasets: React.PropTypes.func,
	currentPageNumber: React.PropTypes.number
}

module.exports = SnapshotBox;