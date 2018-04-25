var React = require('react');
var ReactDOM = require('react-dom');
var Q = require('q');
var store = require('store');
var cx = require('classnames');
var toast = require('../../lib/toast');
var Immutable = require('immutable');

var SnapshotListModal = require('./SnapshotListModal'); 
var SnapshotBox = require('./SnapshotBox');
var AnalyzeToolbar = require('./AnalyzeToolbar');


var Analyze = React.createClass({
  filterList: {},
  unbind: function(){

  },
  remove: function(){

  },
  prepareRemove: function(cb){
    var self = this;

    var unsavedTabs = $('.tab-buttons .unsaved-indicator');
    var hasEmptyTabs = false;

    if(unsavedTabs.length > 0){

      for(var i = 0; i < unsavedTabs.length; i++){
        var elem = $(unsavedTabs[i]).parent();
        if(elem.data('default')){
          hasEmptyTabs = true;
          break;
        }
      }
    }

    var html ='';
    if(hasEmptyTabs){
      html = '<p class="lead text-center">Empty snapshots will be lost. Are you sure you want to continue?</p>';
      bootbox.confirm(html, function(result){
        cb(result);
      });
    } else if(unsavedTabs.length > 0){
      html = '<p class="lead text-center">Unsaved snapshots will be lost. Are you sure you want to continue?</p>';
      bootbox.confirm(html, function(result){
        cb(result);
      });
    } else {
      cb(true);
    }

  },
  getInitialState: function () {
    return {
      snapshotList: null,
      tabCount: 0,
      tabs: [],
      pendingData: {},
      datasets: [],
      currentTab: '',
      currentPageNumber: 1,
      useInitialSort: false,
      pendingSnapshotIds: [],
    };
  },
  updatePageNumber: function(pageNumber) {
    // load snap again and update data.data
    var self = this;
    var tabList = this.state.tabs;
    _.each(tabList, function(elem){
      if(elem.tabId == this.state.currentTab){
        var list = self.filterList[pageNumber];
        var filter = '?datasetfilter=' + list;
        self.loadSnapshot(elem.worksheetId, filter).then(function(data){
          data = data.toObject();
          elem.data = data.data;
          return self.setState({
            currentPageNumber: pageNumber,
            tabs: tabList 
          });
        });
      } else {
        return;
      }
    });
  },
  componentWillMount: function() {
    this.props.ctxSocket.on('CALCULATE_TRENDING_CHARTS_COMPLETE', 
      this.onCalculateTrendingChartsComplete);
  },
  componentDidUpdate: function(prevProps, prevState) {
    if(this.props.snapshotId != prevProps.snapshotId){
      this.createSnapshotFromId(this.props.snapshotId);
    }
    $(window).resize();
  },
  createSnapshots: function(snapshotList) {
    var self = this;
    var promises = [];
    if(snapshotList.length === 0){
      this.createSnapshotTab();
    } else {

      console.log('SNAPSHOT LIST', snapshotList);
      _.each(snapshotList, function(snapshotId, idx, sArr){
        self.loadSnapshot(snapshotId, null, true)
          .then(self.createSnapshotFromData);
      });

    }

  },
  componentDidMount: function() {
    // Check cache here or load empty snapshot

    var self = this;
    // var datasets = store.get('datasets');
    var datasets = false; // DO NOT CACHE DATASETS

    var newState = {}
    var cachedSnapshots = [];
    var snapshotCache = store.get('snapshots');
    if(snapshotCache){
      cachedSnapshots = Object.keys(snapshotCache);
    }

    if(datasets){
        newState.datasets = datasets;
        if(self.props.snapshotId && 
          cachedSnapshots.indexOf(self.props.snapshotId) === -1){
          cachedSnapshots.unshift(self.props.snapshotId);
        } 
        newState.pendingSnapshotIds = cachedSnapshots;
        self.setState(newState);
        self.createSnapshots(cachedSnapshots);
    } else {
        $.ajax({
            beforeSend: function() {
               $.isLoading({ text: "Loading Analyze View"});
            },
            url: '/analyze/render',
            dataType: 'json',
            complete: function() {
              $.isLoading('hide');
            },
            success: function(response) {
              newState.datasets = response;
              // store.set('datasets', response);
              if(self.props.snapshotId && 
                cachedSnapshots.indexOf(self.props.snapshotId) === -1){

                cachedSnapshots.unshift(self.props.snapshotId);
              } 
              newState.pendingSnapshotIds = cachedSnapshots;
              self.setState(newState);
              self.createSnapshots(cachedSnapshots);
            }
        });

    }
  },
  cacheSnapshot: function(snapshotId) {
    var snapshots = store.get('snapshots');
    if (!snapshots) {
      snapshots = {};
    }
    snapshots[snapshotId] = 1;
    store.set('snapshots', snapshots);
  },
  createSnapshotFromData: function(data){
    data = data.toObject();
    if(data.error){
      var failedSnapshotId = data.error;
      var pendingSnapshotIds = this.state.pendingSnapshotIds.filter(function(worksheetId){
        return worksheetId != failedSnapshotId.toString();
      });
      this.setState({pendingSnapshotIds: pendingSnapshotIds});
      return;
    }
    var self = this;
    var displayCount = self.state.tabCount + 1;
    var tabData = {
      tabId: "tab"+self.state.tabCount,
      options: {
        startDate: data.data.params.startDate,
        endDate: data.data.params.endDate,
        testIDs: data.data.params.testIDs,
        referenceData: data.data.params.referenceData,
        shiftRange: data.data.params.shiftRange,
        shiftType: data.data.params.shiftType
      },
      isNew: false,
      data: data.data,
      hasData: true,
      worksheetId: data.id,
      name: data.name 
    };

    var newState = {};
    newState.currentTab =  tabData.tabId;

    console.log('PENDING TABS', self.state.pendingSnapshotIds);
    console.log(tabData.worksheetId.toString());
    newState.pendingSnapshotIds = self.state.pendingSnapshotIds.filter(function(worksheetId){
      return worksheetId != tabData.worksheetId.toString();
    });
    console.log('PENDING TABS', newState.pendingSnapshotIds);

    self.state.tabs.push(tabData);
    newState.tabs =  self.state.tabs;
    newState.tabCount = self.state.tabCount+1;

    self.setState(newState);
  },
  createSnapshotFromId: function(snapshotId){
      console.log('func called');
      var self = this;
      
      self.loadSnapshot(self.props.snapshotId)
        .then(self.createSnapshotFromData);
  },
  loadSnapshot: function(snapshotId, filter, withoutModal) {
    var self = this;
    var deferred = Q.defer();

    var options = {};

    if(filter){

        options = {
            url: '/api/snapshots/get/' + snapshotId,
            data: { 
              dataparams: filter 
            },     
            beforeSend: function() {
              if(withoutModal && withoutModal === true){
              } else {
                $.isLoading({ text: "Loading Snapshot"});
              }
            },
            complete: function(){
              if(withoutModal && withoutModal === true){
              } else {
                $.isLoading('hide');
              }
            },
            dataType: 'json',
            success: function(response) {
              console.log("SNAP RECEIVED", response);
              var data = Immutable.Map(response);
              self.cacheSnapshot(snapshotId);
              deferred.resolve(data);
            },
            error: function(){
              deferred.resolve(Immutable.Map({'error': snapshotId}));
            }
        };
    } else {

      options = {
          url: '/api/snapshots/get/' + snapshotId,
          data: { 
            dataparams: '?priorityonly=true' 
          },     
          beforeSend: function() {
              if(withoutModal && withoutModal === true){
              } else {
                $.isLoading({ text: "Loading Snapshot"});
              }
          },
          complete: function(){
              if(withoutModal && withoutModal === true){
              } else {
                $.isLoading('hide');
              }
          },
          dataType: 'json',
          success: function(response) {
            var page = 1;
            if(response.error){
              toast.notifyError('Error', response.error);
              deferred.reject();
            } else {
              response.data.datapoints.map(function(data, i) {
                    if(typeof self.filterList[page] === 'undefined'){
                      self.filterList[page] = [];
                    }
                    self.filterList[page].push(data.datastreamid);
                    if(i+1 % 5 === 0){
                      page += 1;
                    }
              });
              var data = Immutable.Map(response);
              console.log('[Analyze] loadSnapshot priorityonly', 
                data.toObject().data);
              self.cacheSnapshot(snapshotId);
              deferred.resolve(data);
            }
          }
      };
    }

    $.ajax(options);

    return deferred.promise;
  },
  goToSection: function(tabId) {
    // SnapshotBox needs to be updated based on tab data
    // Basically currentTab and currentSection need to be all
    // managed here
    if(tabId !== this.state.currentTab){
      this.setState({'currentTab': tabId});
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
        self.setState({snapshotList: response});
      }
    });
  },
  calculateTrendingCharts: function(options) {
    var updatedTabs = this.state.tabs.map(function(tab){
      if(tab.tabId === this.state.currentTab){
        tab.options = options;
        tab.forceChartUpdate = true;
        return tab;
      } else {
        return tab;
      }
    }, this);

    this.setState({tabs: updatedTabs});
    this.props.ctxSocket.emit('CALCULATE_TRENDING_CHARTS', options);
  },
  onCalculateTrendingChartsComplete: function(results) {
    // This guy will have to pass data to all the necessary components
    // build all charts but show correlation first
    // if there are errors use AnalyzeErrors
    console.log(results);
    if(results.params.section == this.state.currentTab){
      console.log('[App] calculateTrendingChartsComplete');

      // this is reactive! updating should be all
      var updatedTabs = this.state.tabs.map(function(tab){
        if(tab.tabId === this.state.currentTab){
          tab.data = results;
          tab.hasData = true;
          return tab;
        } else {
          return tab;
        }
      }, this);
      this.setState({tabs: updatedTabs});
    }
  },
  removeTab: function(tabId) {
    var self = this;
    var newTabs = this.state.tabs.filter(function(tab){
      return tab.tabId !== tabId;
    });
    console.log('newTabs', newTabs);

    var currentTab = this.state.currentTab;
    console.log('current tab', currentTab);
    if(this.state.currentTab === tabId && newTabs.length > 0){
      currentTab = newTabs[newTabs.length - 1].tabId;
    }

    var tab  = this.getTabData(tabId);
    var snapshots = store.get('snapshots');
    console.log('Removing tab', tab);
    if (snapshots && tab.worksheetId) {
      delete snapshots[tab.worksheetId];
      store.set('snapshots', snapshots);
      //store.remove(snapshotName);
    }

    this.setState({
      tabs: newTabs,
      currentTab: currentTab,
    }, function(){
      if(tab.worksheetId === self.props.snapshotId){
        // navigate url
        var href = "/analyze/trending/";
        window.router.navigate(href, {trigger: true});
      }
    });
  },
  getCurrentTabData: function(){
    var self = this;
    return this.state.tabs.filter(function(tab){
      return tab.tabId == self.state.currentTab;
    })[0];
  },
  getTabData: function(tabId) {
    var self = this;
    return this.state.tabs.filter(function(tab){
      return tab.tabId == tabId;
    })[0];
  },
  createSnapshotTab: function(e) {
    // this will call createTab in a component kind of way
    var displayCount = this.state.tabCount + 1;
    var tabData = {
      tabId: "tab"+this.state.tabCount,
      options: {
        startDate: "2011-01-01",
        endDate: "2012-01-01",
        testIDs: [],
        referenceData: "0",
        shiftRange: "6",
        shiftType: "month"
      },
      isNew: true,
      hasData: false,
      updateCharts: false,
      forceChartUpdate: false,
      data: null,
      worksheetId: null,
      name: "New Snapshot "+displayCount
    };

    var newState = {};
    newState.currentTab =  tabData.tabId;

    this.state.tabs.push(tabData);
    newState.tabs =  this.state.tabs;
    newState.tabCount = this.state.tabCount+1;

    this.setState(newState);
  },
  copySnapshotToTab: function(){
    var displayCount = this.state.tabCount + 1;
    var tabData = _.clone(this.getCurrentTabData());
    tabData.tabId =  "tab"+this.state.tabCount,
    tabData.name = `New Snapshot ${displayCount}`;
    tabData.isNew = true;

    var newState = {};
    newState.currentTab =  tabData.tabId;

    this.state.tabs.push(tabData);
    newState.tabs =  this.state.tabs;
    newState.tabCount = this.state.tabCount+1;

    this.setState(newState);
  },
  saveSnapshot: function(name) {

    var self = this;
    var worksheetNames = [];

    $.ajax({
      url: '/api/snapshots/list',
      dataType:'json',
      success: function(response) {
        for(var j = 0; j < response.length; j++) {
          var obj1 = response[j];
          worksheetNames.push(obj1.name);
        }
      }
    });

    var div = bootbox.prompt('Snapshot Name', 'Cancel', 'Ok', function(tabName) {
      if(_.contains(worksheetNames, tabName)) {
        toastr.error("Snapshot Name Already Exists", '<i class="icon-ban-circle"></i>');
        return;
      }

      if (tabName === null || tabName.length === 0) return;

      $('.tab-buttons .btn.active .name').text(tabName);

      var tabData = self.getCurrentTabData();
      var rawData = tabData.data;

      try {
        var limit = rawData.datapoints.length < 5 ?  rawData.datapoints.length : 5;

        rawData.datapoints = rawData.datapoints.map(function(data, i) {
            if(i <= limit){
              data.priority = i;
            } else {
              data.priority = null;
            }
            return data;
        });
        rawData.datapoints_shifted = rawData.datapoints_shifted.map(function(data, i) {
            if(i <= limit){
              data.priority = i;
            } else {
              data.priority = null;
            }
            return data;
        });

      } catch(e) {
        console.error(e);
      }

      $.ajax({
        url: '/api/snapshots/add',
        data: {
          rawResults: JSON.stringify(rawData),
          options: JSON.stringify(tabData.options),
          name: tabName
        },
        beforeSend: function() {
          $.isLoading({ text: "Saving Snapshot"});
        },
        complete: function(){
          $.isLoading('hide');
        },
        method: 'post',
        dataType: 'json',
        success: function(response) {
          if(response.success) {
            self.updateSavedSnapshot(response.id);
            toast.notifySuccess('Success', 'Snapshot saved successfully.');
            var snapshots = store.get('snapshots');
            if (snapshots) {
              delete snapshots[name];
              store.set('snapshots', snapshots);
              store.remove(name);
            }
          } else {
            toast.notifyError('Error', 'Unable to save snapshot.');
          }
        }
      });
    }, name);

    $(div).find('input').css({
      'margin-bottom': '80px'
    });
  },

  renameSnapshot: function(){
    var self = this;

    var currentTabData = this.getCurrentTabData();
    var currentTabName = currentTabData.name;
    var rawDataText = JSON.stringify(currentTabData.data);

    var getSnapshots = function(){
      var deferred = Q.defer();
      var worksheetNames = [];

      $.ajax({
        url: '/api/snapshots/list',
        dataType: 'json',
        beforeSend: function() {
          $.isLoading({
            text: "Loading All Snapshot Names",
            position:'overlay'});
        },
        complete: function(){
          $.isLoading('hide');
        },
        error: function(msg){
          deferred.reject(msg);
        },
        success: function(response) {
          for (var j = 0; j < response.length; j++) {
            var obj1 = response[j];
            worksheetNames.push(obj1.name);
          }
          deferred.resolve(worksheetNames);
        }
      });
      return deferred.promise;
    };

    getSnapshots().then(function(worksheetNames){

        var worksheetId = null;

        var div = bootbox.prompt('Rename/Copy Snapshot', 'Cancel', 'Rename', function(tabName, cloneRequest) {
          if(!cloneRequest){
            if (_.contains(worksheetNames, tabName)) {
              toastr.error("Snapshot Name Already Exists", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
              return;
            }
          }

          if (tabName === null) {
            tabName = self.state.currentTab;
          } else if(cloneRequest){
            if(tabName === currentTabName){
              var newTabName;
              var counter = 1;
              while(1){
                newTabName = tabName + ' ('+ counter +')';
                if(worksheetNames.indexOf(newTabName) === -1){
                  tabName = newTabName;
                  break;
                }
                counter++;
              }
            }

           worksheetId = currentTabData.worksheetId;

            var cloneSnapshot = function() {
              var deferred = Q.defer();

              $.ajax({
                url: '/api/snapshots/clone/' + worksheetId,
                data: {
                  name: tabName
                },
                method: 'post',
                dataType: 'json',
                beforeSend: function() {
                  $.isLoading({
                    text: "Copying Snapshot",
                    position:'overlay'});
                },
                complete: function(){
                  $.isLoading('hide');
                },
                error: function(res){
                  deferred.reject(res);
                },
                success: function(response) {
                  if (response.id) {
                    toast.notifySuccess('Success', 'Snapshot cloned successfully.');
                    deferred.resolve(response.id);
                  } else {
                    toast.notifyError('Error', 'Unable to clone snapshot:' + response.error);
                    deferred.reject(response);
                  }
                }
              });

              return deferred.promise;

            };


            cloneSnapshot().then(function(worksheetId){
              var href = "/analyze/trending/" +worksheetId;
              window.router.navigate(href, {trigger: true});
            });


          } else {
            //var $tab = $('.tab-buttons .btn.active');
            worksheetId = currentTabData.worksheetId;

            $.ajax({
              url: '/api/snapshots/update',
              data: {
                id: worksheetId,
                data: rawDataText,
                name: tabName
              },
              method: 'post',
              dataType: 'json',
              success: function(response) {
                if (response.success) {
                  toast.notifySuccess('Success', 'Snapshot updated successfully.');
                  self.updateRenamedSnapshot(tabName);
                } else {
                  toast.notifyError('Error', 'Unable to update worksheet:' + response.error);
                }
              }
            });
          }
        }, currentTabName, 'Copy');

        $(div).find('input').css({
          'margin-bottom': '80px'
        });

        setTimeout(function(){
          $(div).find('input').autocomplete({
            source: function(request, response) {
              var results = $.ui.autocomplete.filter(worksheetNames, request.term);
              response(results.slice(0, 5));
            }
          });
        }, 500);

    });
  },

  updateSavedSnapshot: function(snapshot){
    var newTabs = this.state.tabs.map(function(tab, index){
      if(tab.tabId == this.state.currentTab){
        tab.worksheetId = snapshot.id;
        tab.name = snapshot.name;
        tab.isNew = false;
      }
      return tab;
    }, this);
    this.setState({tabs: newTabs});
  },
  updateRenamedSnapshot: function(tabName) {
    var newTabs = this.state.tabs.map(function(tab, index){
      if(tab.tabId == this.state.currentTab){
        tab.name = tabName;
      }
      return tab;
    }, this);
    this.setState({tabs: newTabs});
  },
  getPendingDatasets: function(datasetList, forceChartUpdate) {
    console.log('called', datasetList);
    var self = this;
    var datasetfilter = '?datasetfilter='+ datasetList.join(',');
    var tab = self.getCurrentTabData();
    var snapshotId = tab.worksheetId;

    this.loadSnapshot(snapshotId, datasetfilter, true).then(function(response){
      response = response.toObject();

      var currentDatapoints = tab.data.datapoints.filter(function(dp){
        return !_.contains(datasetList, dp.datastreamid);
      });

      var currentDatapointsShifted = tab.data.datapoints_shifted.filter(function(dp){
        return !_.contains(datasetList, dp.datastreamid);
      });

      response.data.datapoints.forEach(function(datapoint){
        if(_.contains(datasetList, datapoint.datastreamid) && _.has(datapoint, 'data')){
          currentDatapoints.push(datapoint);
        }
      });

      response.data.datapoints_shifted.forEach(function(datapoint){
        if(_.contains(datasetList, datapoint.datastreamid) && _.has(datapoint, 'data')){
          currentDatapointsShifted.push(datapoint);
        }
      });

      tab.data.datapoints = currentDatapoints;
      tab.data.datapoints_shifted = currentDatapointsShifted;
      tab.forceChartUpdate = forceChartUpdate;

      var newTabs = self.state.tabs.map(function(tb, index){
        if(tb.worksheetId == snapshotId){
          return tab;
        } else {
          return tb;
        }
      }, self);
      console.log('[Anaylze] new tabs after loading pending data', newTabs);

      setTimeout(function(){
        console.log('[Anaylze] setting state after loading pending data');
        self.setState({
          tabs: newTabs,
          pendingData: response.data,
          useInitialSort: false
        });

      }, 2000);
    });
  },
	render: function() {
		return (
			<div className="analyze-view">
				<AnalyzeToolbar 
          loadModal={this.loadModal} 
          createSnapshotTab={this.createSnapshotTab} 
          goToSection={this.goToSection}
          tabCount={this.state.tabCount}
          pendingSnapshotIds={this.state.pendingSnapshotIds}
          currentTab={this.state.currentTab} 
          removeTab={this.removeTab}
          tabs={this.state.tabs} />
          <SnapshotBox 
            datasets={this.state.datasets} 
            snapshots={this.state.tabs} 
            saveSnapshot={this.saveSnapshot}
            renameSnapshot={this.renameSnapshot}
            calculateTrendingCharts={this.calculateTrendingCharts}
            pendingSnapshotIds={this.state.pendingSnapshotIds}
            copySnapshotToTab={this.copySnapshotToTab}
            pendingData={this.state.pendingData}
            currentTab={this.state.currentTab} 
            tabCount={this.state.tabCount}
            filterList={this.filterList}
            useInitialSort={this.state.useInitialSort}
            getPendingDatasets={this.getPendingDatasets}
            currentPageNumber={this.state.currentPageNumber}
          />
        <SnapshotListModal ref="openSnapshotModal"
          snapshots={this.state.snapshotList}/>
			</div>
		);
	}
});

Analyze.propTypes = {
  snapshotId: React.PropTypes.string,
  ctxSocket: React.PropTypes.object.isRequired
};

module.exports = Analyze;
