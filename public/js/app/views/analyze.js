var toast = require('../../lib/toast'),
  hbs = require('hbsfy/runtime'),
  _ = require('underscore'),
  form = require('../../lib/form'),
  store = require('store'),
  Q = require('q'),
  db = require('../../lib/db'),
  Backbone = require('backbone');

  // templates
var analyzeViewTpl = require('../../../templates/trending.hbs'),
  listWorksheetsTableTpl = require('../../../templates/list-worksheets-table.hbs'),
  trendingChartsTpl = require('../../../templates/trending-charts.hbs'),
  topCorrelationTableTpl = require('../../../templates/top-correlation-table.hbs'),
  bestPredictorModelTableTpl = require('../../../templates/best-predictor-model-table.hbs'),
  forecastEqualizerTpl = require('../../../templates/forecast-equalizer.hbs');


var PrenostikUser = require('../../app/PrenostikUser');
var accountsCommon = require('../../app/accountsCommon');

Backbone.$ = $;

var dateToUTC = function(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
};


var AnalyzeView = Backbone.View.extend({

  el: $('#container'),

  template: analyzeViewTpl,

  events: {
      'click .btn-tab': 'tabHandler',
      'click .btn-remove-tab': 'removeTabHandler',
      'click .btn-create-tab': 'createTabHandler',
      'click .btn-rename-tab': 'renameTabHandler',
      'click .btn-tab .icon-remove-sign': 'secondaryRemoveTabHandler',
      'click .btn-save-worksheet': 'saveWorksheetHandler',
      'click a[href="#simple"]': 'printHandlerSimple',
      'click a[href="#all"]': 'printHandler',
      'click .btn-options-clone': 'optionsHandler',
      'click .btn-cancel': 'optionsHandler',
      'click .btn-save' : 'saveModalHandler',
      'click .btn-open-worksheet': 'openWsModalHandler',
      'click .btn-open': 'openWorksheetHandler',
      'click .disable-click': 'disableClickHandler'
  },

  initialize: function(socket, snapshotId) {
    _.bindAll(this, 'render', 'close');
    var self = this;
    this.ctx = '.analyze-controller';
    this.socket = socket;
    this.ctxSocket = socket;
    this.snapshotId = snapshotId;
    this.updateCachedSnapshots().then(function(){
      self.render();
    });

    this.ctxTrending = null;
    this.ctxForecast = null;
    this.snapshotFutures = [];

    this.filterList = {};

    /*LH ========== */
    var mathMin = Math.min,
    mathMax = Math.max,
    mathRound = Math.round;
    Highcharts.wrap(Highcharts.Legend.prototype, 'handleOverflow', function (proceed, legendHeight) {
            var legend = this,
                chart = this.chart,
                renderer = chart.renderer,
                options = this.options,
                optionsY = options.y,
                alignTop = options.verticalAlign === 'top',
                spaceHeight = chart.spacingBox.height + (alignTop ? -optionsY : optionsY) - this.padding,
                maxHeight = options.maxHeight,
                clipHeight,
                clipRect = this.clipRect,
                navOptions = options.navigation,
                animation = Highcharts.pick(navOptions.animation, true),
                arrowSize = navOptions.arrowSize || 12,
                nav = this.nav,
                pages = this.pages,
                padding = this.padding,
                lastY,
                allItems = this.allItems,
                clipToHeight = function (height) {
                    clipRect.attr({
                        height: height
                    });

                    // useHTML
                    if (legend.contentGroup.div) {
                        legend.contentGroup.div.style.clip = 'rect(' + padding + 'px,9999px,' + (padding + height) + 'px,0)';
                    }
                };


            // Adjust the height
            if (options.layout === 'horizontal') {
                spaceHeight /= 2;
            }
            if (maxHeight) {
                spaceHeight = mathMin(spaceHeight, maxHeight);
            }

            // Reset the legend height and adjust the clipping rectangle
            pages.length = 0;
            if (legendHeight > spaceHeight) {

                this.clipHeight = clipHeight = mathMax(spaceHeight - 20 - this.titleHeight - padding, 0);
                this.currentPage = Highcharts.pick(this.currentPage, 1);
                this.fullHeight = legendHeight;

                // Fill pages with Y positions so that the top of each a legend item defines
                // the scroll top for each page (#2098)
                Highcharts.each(allItems, function (item, i) {
                    var y = item._legendItemPos[1],
                        h = mathRound(item.legendItem.getBBox().height),
                        len = pages.length;

                    if (!len || (y - pages[len - 1] > clipHeight && (lastY || y) !== pages[len - 1])) {
                        pages.push(lastY || y);
                        len++;
                    }

                    if (i === allItems.length - 1 && y + h - pages[len - 1] > clipHeight) {
                        pages.push(y);
                    }
                    if (y !== lastY) {
                        lastY = y;
                    }
                });

                // Only apply clipping if needed. Clipping causes blurred legend in PDF export (#1787)
                if (!clipRect) {
                    clipRect = legend.clipRect = renderer.clipRect(0, padding, 9999, 0);
                    legend.contentGroup.clip(clipRect);
                }

                clipToHeight(clipHeight);

                // Add navigation elements
                if (!nav) {
                    this.nav = nav = renderer.g().attr({
                        zIndex: 1
                    }).add(this.group);
                    this.up = renderer.symbol('triangle', 0, 0, arrowSize, arrowSize)
                        .on('click', function () {//UP
                        console.log('up...', self.snapshotId);
                        //get from self.filterList and scroll next set from list
                        var list = self.filterList[self.snapshotId];
                        var filter = '?datasetfilter='+list[0];//start with ref ID
                        var from = list[list.length-1].from;//5
                        var to = list[list.length-1].to;//-1 because last index is range //8
                        var limit = from < 5 ?  from : 5;//limit to 5 or less for now
                        //GET THE NEXT DATASTREAMIDs
                        for(var i = 0; i < limit; i++){//go backwards to limit
                          filter += ','+list[limit-i];
                        }
                        //UPDATE filterList from and to
                        self.filterList[self.snapshotId][list.length-1].from = (from-limit);
                        self.filterList[self.snapshotId][list.length-1].to = from;
                        console.log('filterList after previous:', self.filterList);
                        legend.scroll(-1, animation);
                        //RECALL TO LOADSNAPSHOT WITH FILTER
                        self.loadSnapshot(parseInt(self.snapshotId), null, true, filter );
                        //self.loadSnapshot(parseInt(self.snapshotId), true, true, '?datasetfilter=879,487,876,875,877,866' );
                    })
                        .add(nav);
                    this.pager = renderer.text('', 15, 10)
                        .css(navOptions.style)
                        .add(nav);
                    this.down = renderer.symbol('triangle-down', 0, 0, arrowSize, arrowSize)
                        .on('click', function () {//DOWN
                          console.log('down...', self.snapshotId);
                          //get from self.filterList and scroll next set from list
                          var list = self.filterList[self.snapshotId];
                          var filter = '?datasetfilter='+list[0];//start with ref ID
                          var from = list[list.length-1].from;
                          var to = list[list.length-1].to;//-1 because last index is range
                          var limit = (list.length-1-to) < 5 ?  (list.length-1-to) : 5;//limit to 5 or less for now
                          //GET THE NEXT DATASTREAMIDs
                          for(var i = to+1; i < (to+limit); i++){//+1 to start with the one after to
                            filter += ','+list[i];
                          }
                          //UPDATE filterList from and to
                          self.filterList[self.snapshotId][list.length-1].from = to;
                          self.filterList[self.snapshotId][list.length-1].to = to+limit;
                          console.log('filterList after next:', self.filterList);
                          legend.scroll(1, animation);
                          //RECALL TO LOADSNAPSHOT WITH FILTER
                          self.loadSnapshot(parseInt(self.snapshotId), null, true, filter ).then(function(results){
                            console.log("snapshot received: ", results, chart.series);
                            /*for(var i = 0; i < chart.series.length; i++){
                              chart.series[i].setData(results.data.datapoints[i].data, true);//true / false to redraw
                              console.log(results.data.datapoints[i].data);
                            }*/
                            //this.renderChart($(tabSelector + ' .correlation-chart'), this.getCorrelationChartOptions(data.data));
                            var tabId = $('.btn-tab.active').data('section').replace('tab','');//this.parent.tabCount;
                            this.renderChart($('.section-tab'+tabId+' .correlation-chart'), this.getCorrelationChartOptions(results.data));

                          });
                          //self.loadSnapshot(parseInt(self.snapshotId), true, true, '?datasetfilter=879,878,497' );

                    })
                        .add(nav);
                }

                // Set initial position
                legend.scroll(0);

                legendHeight = spaceHeight;

            } else if (nav) {
                clipToHeight(chart.chartHeight);
                nav.hide();
                this.scrollGroup.attr({
                    translateY: 1
                });
                this.clipHeight = 0; // #1379
            }

            return legendHeight;


        });
    //==========

  },

  close: function(){
    if(this.ctxTrending){
      this.ctxTrending.remove();
    }

    if(this.ctxForecast){
      this.ctxForecast.remove();
    }
  },

  remove: function() {
      this.$el.empty().off(); /* off to unbind the events */
      this.stopListening();
      return this;
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

    if(hasEmptyTabs){
      var html = '<p class="lead text-center">Empty snapshots will be lost. Are you sure you want to continue?</p>';
      bootbox.confirm(html, function(result){
        cb(result);
      });
    } else if(unsavedTabs.length > 0){
      var html = '<p class="lead text-center">Unsaved snapshots will be lost. Are you sure you want to continue?</p>';
      bootbox.confirm(html, function(result){
        cb(result);
      });
    } else {
      cb(true);
    }


  },

  render: function() {
    $.isLoading({ text: "Loading Analyze View"});
    var self = this;
    self.delegateEvents(self.events);
    $.ajax({
        url: '/analyze/render',
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
          var data = {
            datasets: response
          };
          hbs.registerHelper('YYYY-MM-DD', function(date) {
            return moment(date).utc().format('YYYY-MM-DD');
          });

          // console.log(data);

          $('#container').html(self.template(data));
          $.isLoading('hide');
          Highcharts.setOptions({
            chart: {
              style: {
                fontFamily: '"Lato", sans-serif'
              }
            }
          });

          self.ctxTrending = new TrendingView({parent: self});
          self.ctxForecast = new ForecastView({parent: self});
          form.init();

          var snapshotData,
            cachedSnapshots = [];
          var snapshotsObj = store.get('snapshots');
          if (snapshotsObj) {
            var cachedSnapshots = Object.keys(snapshotsObj);
            // console.log('all cached', cachedSnapshots);
          }

          $.isLoading({
            text: "Loading Snapshots",
            position:'overlay'});
          self.snapshotFutures = [];
          if (cachedSnapshots.length > 0) {
            for(var i = 0; i < cachedSnapshots.length; i++){
              var snapshot = cachedSnapshots[i];
              snapshotData = store.get(snapshot);
              // console.log("Snapshot data", snapshotData);
              if(snapshotData.worksheetId && !isNaN(parseInt(snapshotData.worksheetId))){
                if(parseInt(snapshotData.worksheetId) !== parseInt(self.snapshotId)){
                  self.snapshotFutures.push(self.createPendingTab('savedSnapshot', snapshotData));
                }
              } else {
                self.snapshotFutures.push(self.createPendingTab('newCachedSnapshot', snapshotData));
              }
            }
          }

          if(self.snapshotId){
            self.snapshotFutures.push(self.createPendingTab('savedSnapshot', {worksheetId: parseInt(self.snapshotId)}));
          }

          if(cachedSnapshots.length <= 0 && !self.snapshotId) {
              self.snapshotFutures.push(self.createPendingTab('new', null));
          }

          self.applyEvents();

          var futureCount = 0;

          if(self.snapshotFutures.length > 0){
              $('.analyze-section.section-trending').hide()
          }


          self.futureWhile(function(){
            return self.snapshotFutures.length > 0;
          }, function() {
            // console.log("Waiting for " + self.snapshotFutures.length + " futures");
            self.waitAny(self.snapshotFutures)
              .then(function(result){
                self.removeTabLoadingGif(result.tabId);
                futureCount++;
                if(futureCount === 1){
                  self.goToSection(result.tabId)
                  $.isLoading('hide');
                } else {
                  if(result.name){
                    $('[data-section="'+result.tabId+'"]').find('.name').text(result.name);
                  }
                }
                self.checkFulfilled(result.tabId);
              }, function(err){
                console.error(err);
              }).done();
          });

        }
      });

    $('html').attr('class', 'analyze-controller trending-template');
  },

  checkFulfilled: function(tabId) {
    for(var x = 0; x < this.snapshotFutures.length; x++){
      var fut = this.snapshotFutures[x];
      if(Q.isFulfilled(fut)){
        if(!Q.isPromise(fut) && fut.tabId === tabId){
          var index = this.snapshotFutures.indexOf(fut);
          if(index != -1){
            this.snapshotFutures.splice(index, 1);
          }
          break;
        } else if(fut.inspect().value.tabId == tabId){
          var index = this.snapshotFutures.indexOf(fut);
          if(index != -1){
            this.snapshotFutures.splice(index, 1);
          }
          break;
        }
      } else {
        console.log("status of future:", fut.inspect());
      }
    }
  },

  futureWhile: function(condition, action){
    var deferred = Q.defer();

    var loop = function() {
      if(!condition()) return deferred.resolve();
      Q.delay(500).then(function(){
        Q.when(action(), loop);
      });
    };

    Q.nextTick(loop);
    return deferred.promise;
  },

  waitAny: function(futures){
    var deferred = Q.defer();
    for(var i = 0; i < futures.length; i++){
      var fut = futures[i];
      Q.when(fut, deferred.resolve);
    }
    return deferred.promise;
  },

  applyEvents: function(){
    this.delegateEvents(this.events);
    this.ctxTrending.delegateEvents(this.ctxTrending.events);
    this.ctxForecast.delegateEvents(this.ctxForecast.events);
    form.init();
    //this.ctxTrending.validateForm();
  },
  disableClickHandler: function(e){
    e.stopImmediatePropogation()
    e.stopPropagation()
    e.preventDefault();
  },
  removeTabLoadingGif: function(tabId) {
    // console.log('removing loading gif for tab: '+ tabId);
    $('#pending-'+tabId)
      .parent()
      .removeClass('disable-click');
    $('#pending-'+tabId).remove();
  },

  queryAndBuildTab: function(tabId) {
    var self = this;
    db.get(tabId).then(function(tab){
        var data = JSON.parse(tab.data);
        console.log("grabbing tab", tabId, tab);
        $('.section-' + tabId + ' #emptyCalculationMessage').hide();
        $('.section-' + tabId + ' #trendingChartLoader').show();
        $('[data-section="'+tabId+'"]').find('.name').text(data.name);
        if(typeof data.data === 'string'){
          data.data = JSON.parse(data.data);
        }
        $('[data-section="'+tabId+'"]').data('data_raw', JSON.stringify(data.data))
        self.ctxTrending.buildWorksheetInTab(data, '.section-' + tabId);
        self.ctxTrending.setOptionValues(data.data.params);
        self.ctxTrending.saveOptionsToTab();
        self.ctxTrending.cacheOptions();
      });
  },

  openWsModalHandler: function(e) {
    e.preventDefault();
    this.loadModal();
  },

  openWorksheetHandler: function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#openWorksheetModal').modal('hide');
    var worksheetId = $(e.currentTarget).data('worksheetid');
    console.log("Opening snapshot:", worksheetId);
    var href = '/analyze/trending/' + worksheetId;
    window.router.navigate(href, {trigger: false});
    // debugger;
    this.loadSnapshot(parseInt(worksheetId), true);
  },

  saveModalHandler: function(e) {
    this.showSaveModal();
  },

  tabHandler: function(e){
    this.goToSection($(e.currentTarget).data('section'));
  },

  removeTabHandler: function(e) {
    var self = this;
    var currentTab = this.getCurrentTab();
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
          self.removeTab(self.getCurrentTab().data('section'));
        }
      });
    } else {

      var snapshots = store.get('snapshots');
      if (snapshots) {
        delete snapshots[snapshotName];
        store.set('snapshots', snapshots);
        store.remove(snapshotName);
      }
      this.removeTab(this.getCurrentTab().data('section'));
    }
  },

  secondaryRemoveTabHandler: function(e) {
    var self = this;
    var currentTab = $(e.currentTarget).parent();
    var snapshotName = currentTab.find('span.name').text();
    e.stopPropagation();
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
          self.removeTab(currentTab.data('section'));

        }
      });
    } else {
      var snapshots = store.get('snapshots');
      if (snapshots) {
        delete snapshots[snapshotName];
        store.set('snapshots', snapshots);
        store.remove(snapshotName);
      }
      self.removeTab(currentTab.data('section'));

    }

  },

  createTabHandler: function(){
    this.createTab();
  },

  renameTabHandler: function(e) {
    var self = this;
    var currentTabName = this.getCurrentTab().find('span.name').text();
    var worksheetNames = [];

    var $tab = $('.tab-buttons .btn.active');
    var rawDataText = $tab.data('data_raw');

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


        var div = bootbox.prompt('Rename/Copy Snapshot', 'Cancel', 'Rename', function(tabName, cloneRequest) {
          if(!cloneRequest){
            if (_.contains(worksheetNames, tabName)) {
              toastr.error("Snapshot Name Already Exists", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
              return;
            }
          }

          if (tabName === null) {
            tabName = self.currentTabName;
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

            var worksheetId = self.getCurrentTab().find('input#worksheetId').val();

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

              $.ajax({
                  url: '/api/snapshots/get/'+worksheetId,
                  dataType: 'json',
                  beforeSend: function() {
                    $.isLoading({
                      text: "All done! Opening Copied Snapshot",
                      position:'overlay'});
                  },
                  complete: function(){
                    $.isLoading('hide');
                  },
                  success: function(response) {
                    if(response.data !== ''){
                      self.createTabForWorksheet(response);
                    }
                  }
                });

            });


          } else {
            //var $tab = $('.tab-buttons .btn.active');
            //var name = $('.tab-buttons .btn.active .name').text();

            //var options = $tab.data('options');
            //var data_correlation = $tab.data('data_correlation');
            //var data_correlationtable = $tab.data('data_correlationtable');
            //var data_sequence = $tab.data('data_sequence');
            //var data_sequencetable = $tab.data('data_sequencetable');
            //var data_bestpredictor = $tab.data('data_bestpredictor');
            //var data_bestpredictortable = $tab.data('data_bestpredictortable');
            var worksheetId = self.getCurrentTab().find('input#worksheetId').val();

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
                  self.renameTab(self.getCurrentTab(), tabName);
                  self.onSaveWorksheetSuccess(response);
                  toast.notifySuccess('Success', 'Snapshot updated successfully.');
                  self.renameTab(self.getCurrentTab(), tabName);
                } else {
                  if (response.error === 'Worksheet does not exist') {
                    self.renameTab(self.getCurrentTab(), tabName);
                  } else {
                    toast.notifyError('Error', 'Unable to update worksheet:' + response.error);
                  }
                }
              }
            });
          }
        }, currentTabName, 'Copy');

        $(div).find('input').css({
          'margin-bottom': '80px'
        })

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
  printHandlerSimple: function(e) {
    var self = this;
    $(".correlation-table, .table-striped").css("display","none");
    window.print();
    $(".correlation-table, .table-striped").css("display","block");
  },
  printHandler: function(e) {
    var self = this;
    window.print();

    //LH: get section class analyze-section with display is block. Meaning the current shown chart section
    //var section = $('<div/>').append($(".analyze-section[style*='display: block']").clone()).html();
    //var section = $('<div/>').append($("html").clone()).html();
    //var $head =  $('<div/>').append($("head").clone()).html();
    //var $body =  $('<div/>').append($("body").clone()).html();

        //var mywindow = window.open('', 'Correlation Chart', 'height=800,width=900');
        //mywindow.document.write('<html><head><title>Correlation Chart</title>');
        //mywindow.document.write('<link rel="stylesheet" href="/css/app2.css" type="text/css" />');
        //mywindow.document.write('</head><body>');
        //mywindow.document.write(section);
        //mywindow.document.write('<script src="/js/app.min.js"></script>');
        //mywindow.document.write('</body></html>');
        //
        mywindow.document.write('<html lang="en" class="analyze-controller trending-template"><head>');
        mywindow.document.write($head);
       // mywindow.document.write('<link rel="stylesheet" href="/css/app2.css" type="text/css" />');
        mywindow.document.write('</head><body>');
        mywindow.document.write($body);
        mywindow.document.write('</body></html>');
        mywindow.document.close();
        mywindow.focus();

        //setTimeout(function(){
          //mywindow.print();
         // mywindow.close();
        //}, 1000);//wait for highchart to finished
  },
  saveWorksheetHandler: function(e) {
    var self = this;
    var $tab = $('.tab-buttons .btn.active');
    var name = $('.tab-buttons .btn.actibe .name').text();
    //var filterIDs = "?datasetfilter=";//LH - for assigning the filter
    //var filterList = {};

    //LH - BEFORE SAVE, set the priority flags for each data set
    // debugger;
    try{
      var rawData = JSON.parse($tab.data('data_raw'));
      var limit = rawData.datapoints.length < 5 ?  rawData.datapoints.length : 5;//limit to 5 or less for now

      //LH- SET PRIORITY BEFORE SAVING
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

      // set datasetfilter
      /*rawData.datapoints.map(function(data, i) {
          if(i <= limit){
            filterIDs += ','+data.datastreamid;
          }
      });*/



      $tab.data('data_raw', JSON.stringify(rawData));
      // debugger;
    }catch(e){
      console.log(e);
    }



    var worksheetNames = [];
    // for checking existing snapshot names
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
        toastr.error("Snapshot Name Already Exists", '<i class="icon-ban-circle"></i>')
        return;
      }

      if (tabName === null || tabName.length === 0) return;

      $('.tab-buttons .btn.active .name').text(tabName);


      var rawData = JSON.parse($tab.data('data_raw'));
      console.log("Chart Options before", rawData.chartOptions);
      delete rawData.chartOptions;
      console.log("Chart Options after", rawData.chartOptions);

      //save filterList to local storage
      //filterList[tabName] = filterIDs;//save by tabName as no snapshotid exists yet
      // Put the object into storage
      //sessionStorage.setItem('filterList', JSON.stringify(filterList));

      // debugger;

      $.ajax({
        url: '/api/snapshots/add',
        data: {
          rawResults: JSON.stringify(rawData),//rawResults: $tab.data('data_raw'), //*LH* should have priority flags set
          options: $.data($tab[0], 'options'),
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
            self.onSaveWorksheetSuccess(response);
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
    })


    setTimeout(function(){
      $(div).find('input').autocomplete({
        source: function(request, response) {
          var results = $.ui.autocomplete.filter(worksheetNames, request.term);
          response(results.slice(0, 5));
        }
      });
    }, 500);

  },

  clickOptions: function() {
    $('.btn-options').trigger('click');

  },

  optionsHandler: function(e) {
      e.preventDefault();
      this.clickOptions();
  },

  //LH loadSnapshot is taking longer than createTabWithOptions
  loadSnapshot: function(snapshotId, isLast, isPromise, filter) {
    var self = this;
    var deferred = Q.defer();
    var filter = true;

    if(!isPromise){
      var openSnapshots = this.getOpenSnapshotIds();
      if(openSnapshots.indexOf(snapshotId) > -1){
        toastr.error("Snapshot Already Opened", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
        return false;
      }
    }

    var options = {
      url: '/api/snapshots/get/' + snapshotId,
      //data: { dataparams: '?priorityonly=true' }, //LH setting ?priorityonly flag or ?datasetfilter=1,2,3 flag
      // data: {dataparams: '?datasetfilter=879,878,497'},
      beforeSend: function() {
        if (!isPromise){
          $('body').isLoading({
            text: "Opening Snapshot",
            position: "overlay"
          });
        }
      },
      complete: function(){
        if(!isPromise && isLast){
          setTimeout(function(){
            $('body').isLoading('hide');
          }, 500);
        }
      },
      dataType: 'json',
      success: function(response) {
        // debugger;
        //FILTER LOGIC STARTS
        var filterIDs = [];
        //var limit = response.data.datapoints.length < 5 ?  rawData.data.datapoints.length : 5;//limit to 5 or less for now

        // set datasetfilter
        response.data.datapoints.map(function(data, i) {
              filterIDs.push(data.datastreamid);//yes show
        });
        filterIDs.push({from: 0, to: 5});//set range indexes to last of array
        //save all datastreamids to the filterList
        self.filterList[snapshotId] = filterIDs;//save by snapshotId
        //FILTER LOGIC ENDS
        // debugger;

        if(!isPromise){
          if(response.data === '') {
            self.createTabForWorksheetAndSubmit(response);
          } else {
            self.createTabForWorksheet(response);
          }
        } else {
          deferred.resolve(response);
        }
      }
    };
    //overrides
    if(filter){

      options = {
        url: '/api/snapshots/get/' + snapshotId,
        //data: { dataparams: '?priorityonly=true' }, //LH setting ?priorityonly flag or ?datasetfilter=1,2,3 flag
        beforeSend: function() {

          if (!isPromise){
            $('body').isLoading({
              text: "Opening Snapshot",
              position: "overlay"
            });
          }
        },
        complete: function(){
          if(!isPromise && isLast){
            setTimeout(function(){
              $('body').isLoading('hide');
            }, 500);
          }
        },
        dataType: 'json',
        success: function(response) {
          // debugger;
          if(!isPromise){
            if(response.data === '') {
              self.createTabForWorksheetAndSubmit(response);
            } else {
              self.createTabForWorksheet(response);
            }
          } else {
            deferred.resolve(response);
          }
        }
      }

    }

    $.ajax(options);

    return deferred.promise;
  },

  checkRemainingTabs: function () {
    var remainingTabs = $('.btn-tab');
    if(remainingTabs.length === 0) {
      $('.btn-options').hide();
      $('.btn-rename-tab').hide()
      $('.btn-save-worksheet').hide()
      if ($('#trendingOptions').hasClass('open')) {
        $('#trendingOptions').removeClass('open');
        $('#trendingOptions').css('visibility', 'hidden');
      }
    } else {
      $('.btn-options').show();
    }
  },

  updateCachedSnapshots: function() {
      var deferred = Q.defer();

      var filterWorksheets = function(worksheets) {
        var snapshots = [];
        for(var i = 0; i < worksheets.length; i++){
           snapshots.push(worksheets[i].name);
        }
        return snapshots;
      }

      var self = this;
      var snapshots = store.get('snapshots');
      self.snapshots = snapshots;
      if(snapshots && typeof snapshots !== "undefined"){
        $.ajax({
          url: '/api/snapshots',
          dataType: 'json',
          beforeSend: function() {
              $('body').isLoading({
                text: "Updating Cache",
                position: "overlay"
              });
          },
          complete: function(){
              $('body').isLoading('hide');
          },
          success: function(data) {
            var validSnapshots = filterWorksheets(data);
            for (var key in self.snapshots){
              if (snapshots.hasOwnProperty(key) && validSnapshots.indexOf(key) === -1) {
                // delete snapshot from cache and from view
                delete snapshots[key];
                store.remove(key);

                // check if snapshot is already displaying, then remove
                var tabs = $('.btn.btn-tab');
                if(tabs.length > 0) {
                  $('.btn.btn-tab').each(function(i, elem){
                      var snapshotName = $(elem).find('.name').text();
                      if(snapshotName === key) {
                        self.removeTab($(elem).data('section'), 'called');
                      }
                  })
                }
              }
              store.set('snapshots', snapshots);
              delete self[snapshots];
            }

            deferred.resolve();
          },
          error: function(e) {
            console.log(e);
            delete self[snapshots];
          }
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
  },

  tabCount: 0,

  analyzeToolbarSelector: '#analyzeToolbar',
  tabsArray: [],

  currentSection: null,

  getOpenSnapshotIds: function() {
     var snapshotIds = [];
     var openTabs = [];
     var cachedTabs = [];

     var tabs = $('.btn.btn-tab');
     console.log("Number of tabs queried", tabs.length);

     _.each(tabs, function(elem){
        openTabs.push($.trim($(elem).text()));
     });

     var snapshotsObj = store.get('snapshots');
     if(snapshotsObj){
       cachedTabs = Object.keys(snapshotsObj);
     }

     console.log("Cached Tabs", cachedTabs);
     console.log("Open Tabs", openTabs);

     unOpenedSnapshots = _.difference(cachedTabs, openTabs);

     console.log('unOpenedSnapshots', unOpenedSnapshots);

     for(var i = 0; i < tabs.length; i++){
       var tab = tabs[i];
       var worksheetId = parseInt($(tab).find('#worksheetId').val());
       console.log('worksheetID: ', worksheetId);
        if(typeof worksheetId !== 'undefined' && !isNaN(worksheetId)){
          console.log(worksheetId);
          snapshotIds.push(worksheetId);
        }
     }
     return snapshotIds;
  },

  goToSection: function(name, noCalculate) {

      if(noCalculate === null || typeof noCalculate === 'undefined'){
        var noCalculate = false;
      }

      var self = this;
      if ($('.section-' + this.currentSection)) {
        if ($('.tab-buttons .btn.active .unsaved-indicator').length) {
          self.ctxTrending.saveOptionsToTab();
        }
        $('.section-' + this.currentSection).hide();
      }
      this.currentSection = name;
      $('.section-' + name).show();
      $('.btn', this.analyzeToolbarSelector).removeClass('active');
      $('.btn[data-section="' + name + '"]', this.analyzeToolbarSelector).addClass('active');
      if (name.indexOf('tab') !== -1) {
        $('.tab-toolbar').show();
        if ($('.tab-buttons .btn.active .unsaved-indicator').length) {
          $('.tab-toolbar .btn-save-worksheet').show();
          $('.tab-toolbar .btn-rename-tab').hide().parent().removeClass('btn-group');
        } else {
          $('.tab-toolbar .btn-rename-tab').show();
          $('.tab-toolbar .btn-save-worksheet').hide().parent().removeClass('btn-group');
        }
      } else {
        $('.tab-toolbar').hide();
      }
      if ($('#trendingOptions').hasClass('open')) {
        $('#trendingOptions').removeClass('open');
        setTimeout(function() {
          $('#trendingOptions').css('visibility', 'hidden');
        }, 250);
      }

      this.setOptionsFromTab();
      self.ctxTrending.saveOptionsToTab();

      var presetOptions = $('.btn[data-section="' + this.currentSection + '"]').data('options');
      var isDefaultTab = $('.tab-buttons .btn.active').data('default');
      // if (presetOptions) {
      //   var presetOptionsObj = JSON.parse(presetOptions);
      //   var defaultOptionsObj = self.ctxTrending.getDefaultOptionValues();
      //   delete presetOptionsObj.dataStreamStart;
      //   delete presetOptionsObj.dataStreamEnd;
      //   delete presetOptionsObj.section;
      //   $(window).trigger('resize');
      //   if (_.isEqual(presetOptionsObj, defaultOptionsObj)) {
      //     isDefaultTab = true;
      //   } else {
      //     isDefaultTab = false;
      //   }
      // }

      if (isDefaultTab === true) {
        $('.tab-toolbar .btn-save-worksheet').hide();
      }

      tabSetup = store.get(name);
      // console.log('Cached tab setup', tabSetup);
      if(tabSetup) {
        // ensure open tab and options events are working
        self.delegateEvents(self.events);
        self.ctxTrending.delegateEvents(self.ctxTrending.events);
        self[tabSetup.setupFn](name);
        store.remove(name);
        self.checkFulfilled(name);
        noCalculate = true;
      }

      if ($('.section-' + name).children('#emptyCalculationMessage').is(':visible') && presetOptions && !isDefaultTab && !noCalculate) {
        setTimeout(function() {
          self.ctxTrending.performChartCalculations();
        }, 250);
      }

  },

  setOptionsFromTab: function() {
      if ($('.btn[data-section="' + this.currentSection + '"]').data('options')) {
        this.ctxTrending.setOptionValues(JSON.parse($('.btn[data-section="' + this.currentSection + '"]').data('options')));
      } else {
        this.ctxTrending.setDefaultOptionValues();
      }
  },

  createPendingTab: function(tabType, data, isLast) {
    var displayedTabCount = this.tabCount;
    displayedTabCount++;
    //This will be a promise that will call the necessary func
    // to build the tab
    // This will likely be used for opening all tabs in the future

    //TODO add spinner to each tab
    //<img src="/img/ajax-loader-circle.gif"/>
    var deferred = Q.defer();
    var self = this;

    var $tab;
    // return tabId for finishing promise
    var tabId = "tab" + this.tabCount;
    // console.log('create pending tab'+tabId);
    var tabNumber = null;
    if(tabType == 'savedSnapshot') {
      // if worksheet id
      var snapshotName = "";
      if(data.name){
        snapshotName = data.name;
      } else {
        snapshotName = 'Loading Snapshot';
      }
      tabNumber = 0;
      $tab = $('<div class="btn btn-tab disable-click" data-section="tab' + this.tabCount + '">\
                  <img id="pending-'+tabId+'" src="/img/ajax-loader-circle.gif"/>\
                  <span class="name">' + snapshotName + '</span> &nbsp;&nbsp; \
                  <i class="icon-remove-sign"></i><input id="worksheetId" type="hidden" value="' + data.worksheetId + '"/>\
                </div>');

    } else if(tabType == 'newCachedSnapshot'){
      // if new but cached
      if (data.isUnsaved) {
        tabNumber = 1;
        $tab = $('<div class="btn btn-tab disable-click" data-section="tab' + this.tabCount + '">\
                  <img id="pending-'+tabId+'" src="/img/ajax-loader-circle.gif"/>\
                    <i class="icon-asterisk unsaved-indicator"></i>\
                    <span class="name">' + data.name + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i>\
                  </div>');
      } else {
        tabNumber = 2;
        $tab = $('<div class="btn btn-tab disable-click" data-section="tab' + this.tabCount + '">\
                  <img id="pending-'+tabId+'" src="/img/ajax-loader-circle.gif"/>\
                      <span class="name">' + data.name + '</span> &nbsp;&nbsp; \
                      <i class="icon-remove-sign"></i>\
                      <input id="worksheetId" type="hidden" value="'+ data.worksheetId+'"/>\
                  </div>');
      }
    } else {
      // if new
      tabNumber = 3;
      $tab = $('<div class="btn btn-tab disable-click" data-default=true data-section="tab' + this.tabCount + '">\
                  <img id="pending-'+tabId+'" src="/img/ajax-loader-circle.gif"/>\
                    <i class="icon-asterisk unsaved-indicator"></i>\
                    <span class="name">New Snapshot ' + displayedTabCount + '</span> &nbsp;&nbsp; \
                    <i class="icon-remove-sign"></i>\
                </div>');
    }


    $('.tab-buttons').append($tab);

    // Disable open and params events
    // var newEvents = _.clone(self.events);
    // del newEvents['click .btn-tab'];
    // self.delegateEvents(newEvents);
    var trendingEvents = _.clone(self.ctxTrending.events);
    delete trendingEvents["click .btn-options"];
    self.ctxTrending.delegateEvents(trendingEvents);

    var $section = $('.analyze-section.section-trending').clone();
    $section.removeClass('section-trending');
    $section.addClass('section-tab' + this.tabCount);
    $section.hide();
    $('.analyze-sections').append($section);
    this.ctxTrending.buildChartContainer($section);

    switch(tabNumber) {
      case 0:
        // load snapshot
        // resolve and store in indexeddb
        // then when tab is requested
        // build tab
        console.log("retrieive snapshot: ", data.worksheetId);
        self.loadSnapshot(data.worksheetId, null, true).then(function(results){
          console.log("snapshot received: ", results);
          var tabObj = {}
          tabObj = {
              tabId: tabId,
              data: JSON.stringify(results)
          };
          
          if(results.error){
            toastr.error("Error occured", results.error);
          }

          console.log("caching snapshot");

          db.set(tabId, tabObj).then(function(data){
            console.log("Data cached", data);

            self.tabsArray.push({
              tab: $tab,
              section: $section,
              name: tabId
            });

            store.set(tabId, {setupFn: 'queryAndBuildTab'});

            setTimeout(function(){
              deferred.resolve({tabId:tabId, name:results.name});
            }, 200);
          });
        });
        break;
      case 1:
      case 2:
        $('.section-tab' + this.tabCount + ' .trending-charts').hide();
        $tab.data('options', data.data);

        this.tabsArray.push({
          tab: $tab,
          section: $section,
          name: "tab" + this.tabCount
        });

        deferred.resolve({
          tabId: tabId,
        });
        break;

      case 3:
        $('.section-tab' + this.tabCount + ' .trending-charts').hide();
        this.tabsArray.push({
          tab: $tab,
          section: $section,
          name: "tab" + this.tabCount
        });
        store.set(tabId, {setupFn: 'clickOptions'});

        deferred.resolve({
          tabId: tabId,
        });
        break;
    }

    this.tabCount++;
    this.checkRemainingTabs();

    return deferred.promise;
  },

  createTabWithOptionsAndSubmit: function() {
    var self = this;
    var displayedTabCount = this.tabCount;
    displayedTabCount++;

    var $tab = $('<div class="btn btn-tab" data-section="tab' + this.tabCount + '"><i class="icon-asterisk unsaved-indicator"></i><span class="name">New Snapshot ' + displayedTabCount + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i></div>');
    $('.tab-buttons').append($tab);

    var $section = $('.analyze-section.section-trending').clone();
    $section.removeClass('section-trending');
    $section.addClass('section-tab' + this.tabCount);
    $section.hide();
    $('.analyze-sections').append($section);
    self.ctxTrending.buildChartContainer($section);
    $('.section-tab' + this.tabCount + ' .trending-charts').hide();

    var options = self.ctxTrending.getOptionValues();
    $tab.data('options', JSON.stringify(options));

    this.goToSection('tab' + this.tabCount);
    this.tabsArray.push({
      tab: $tab,
      section: $section,
      name: "tab" + this.tabCount
    });

    setTimeout(function() {
      self.ctxTrending.performChartCalculations();
    }, 250);

    this.tabCount++;
    self.checkRemainingTabs();
  },

  createTabWithOptions: function(snapshotData, isLast) {
    var self = this;
    var $tab;
    if (snapshotData.isUnsaved) {
      $tab = $('<div class="btn btn-tab" data-section="tab' + this.tabCount + '"><i class="icon-asterisk unsaved-indicator"></i><span class="name">' + snapshotData.name + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i></div>');
    } else {
      $tab = $('<div class="btn btn-tab" data-section="tab' + this.tabCount + '"><span class="name">' + snapshotData.name + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i><input id="worksheetId" type="hidden" value="'+ snapshotData.worksheetId+'"/></div>');
    }
    $('.tab-buttons').append($tab);

    var $section = $('.analyze-section.section-trending').clone();
    $section.removeClass('section-trending');
    $section.addClass('section-tab' + this.tabCount);
    $section.hide();
    $('.analyze-sections').append($section);
    self.ctxTrending.buildChartContainer($section);
    $('.section-tab' + this.tabCount + ' .trending-charts').hide();

    $tab.data('options', snapshotData.data);

    this.tabsArray.push({
      tab: $tab,
      section: $section,
      name: "tab" + this.tabCount
    });

    if (isLast) {
      this.goToSection('tab' + this.tabCount, true);
      setTimeout(function() {
        self.ctxTrending.performChartCalculations();
      }, 250);
    }
    //ctxTrending.performChartCalculations();

    this.tabCount++;
    self.checkRemainingTabs();
  },

  createTab: function() {
    var displayedTabCount = this.tabCount;
    displayedTabCount++;

    var $tab = $('<div class="btn btn-tab" data-default=true data-section="tab' + this.tabCount + '"><i class="icon-asterisk unsaved-indicator"></i><span class="name">New Snapshot ' + displayedTabCount + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i></div>');
    $('.tab-buttons').append($tab);

    var $section = $('.analyze-section.section-trending').clone();
    $section.removeClass('section-trending');
    $section.addClass('section-tab' + this.tabCount);
    $section.hide();
    $('.analyze-sections').append($section);
    this.ctxTrending.buildChartContainer($section);
    $('.section-tab' + this.tabCount + ' .trending-charts').hide();
    this.goToSection('tab' + this.tabCount);
    this.tabsArray.push({
      tab: $tab,
      section: $section,
      name: "tab" + this.tabCount
    });

    this.tabCount++;
    this.checkRemainingTabs();
  },

  createTabForWorksheet: function(data) {
    $('body').isLoading({
          text: "Generating data",
          position: "overlay"
        });
    var self = this;
    var tabName = data.name;

    var $tab = $('<div class="btn btn-tab" data-section="tab' + this.tabCount + '"><span class="name">' + tabName + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i><input id="worksheetId" type="hidden" value="' + data.id + '"/></div>');
    $('.tab-buttons').append($tab);

    var rawData = data.data;
    $tab.data('data_raw', JSON.stringify(rawData)); //so we can manipulate scenarios

    var $section = $('.analyze-section.section-trending').clone();
    $section.removeClass('section-trending');
    $section.addClass('section-tab' + this.tabCount);
    $section.hide();
    $('.analyze-sections').append($section);
    self.ctxTrending.buildChartContainer($section);
    $('.section-tab' + this.tabCount + ' #emptyCalculationMessage').hide();
    $('.section-tab' + this.tabCount + ' #trendingChartLoader').show();
    this.goToSection('tab' + this.tabCount);
    self.ctxTrending.buildWorksheetInTab(data, '.section-tab' + this.tabCount);
    self.ctxTrending.setOptionValues(data.data.params);

    self.ctxTrending.saveOptionsToTab();
    self.ctxTrending.cacheOptions();
    this.tabsArray.push({
      tab: $tab,
      section: $section,
      name: "tab" + this.tabCount
    });
    this.tabCount++;
    self.checkRemainingTabs();
    $('body').isLoading('hide');
  },

  createTabForWorksheetAndSubmit: function(data) {
      var self = this;
      var displayedTabCount = this.tabCount;
      displayedTabCount++;

      var tabName = data.name;

      var $tab = $('<div class="btn btn-tab" data-section="tab' + this.tabCount + '"><span class="name">' + tabName + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i><input id="worksheetId" type="hidden" value="' + data.id + '"/></div>');
      $('.tab-buttons').append($tab);
      var $section = $('.analyze-section.section-trending').clone();
      $section.removeClass('section-trending');
      $section.addClass('section-tab' + this.tabCount);
      $section.hide();

      $('.analyze-sections').append($section);
      $('.section-tab' + this.tabCount + ' #emptyCalculationMessage').hide();
      $('.section-tab' + this.tabCount + ' #trendingChartLoader').show();
      this.goToSection('tab' + this.tabCount);
      self.ctxTrending.showChartLoader();
      self.ctxTrending.buildChartContainer($section);
      this.tabsArray.push({
        tab: $tab,
        section: $section,
        name: "tab" + this.tabCount
      });

      var rawData = data.data;
      if(!rawData || typeof rawData === 'undefined'){
        self.ctxTrending.setOptionValuesFromResponse(data);
        rawData = '';
      }

      $tab.data('data_raw', JSON.stringify(rawData)); //so we can manipulate scenarios

      var options = self.ctxTrending.getOptionValues();
      $tab.data('options', JSON.stringify(options));
      // self.ctxTrending.renderForecastEqualizer($('.section-tab' + this.tabCount + ' .forecast-equalizer'), data.data);

      setTimeout(function() {
        self.ctxTrending.performChartCalculations();
        self.ctxTrending.hideChartLoader();
      }, 250);

      this.tabCount++;
      self.checkRemainingTabs();
    },


  removeTab: function(section) {
    if (this.tabsArray.length > 0) {
      for (var i = 0; i < this.tabsArray.length; i++) {
        var tabData = this.tabsArray[i];
        if (tabData.name == section) {
          this.tabsArray.splice(i, 0);
          break;
        }
      }
    }
    if (this.tabsArray.length > 0) {
      this.goToSection(this.tabsArray[this.tabsArray.length - 1].name);
    } else {
      $('.analyze-section.section-trending').show();
    }
    $('.btn-tab[data-section="' + section + '"]').remove();
    $('.analyze-section.section-' + section).remove();
    this.checkRemainingTabs();
  },

  getCurrentTab: function() {
    return $('.btn-tab.active');
  },

  renameTab: function(tab, name) {
    tab.find('span.name').html(name);
  },

  toggleSaveVisibility: function() {
    var numTabs = $('#analyzeToolbar .tab-buttons .btn-tab').length;
    if (numTabs > 0) {
      $('#analyzeToolbar .btn-save').show();
      $('.analyze-section-toolbar, .tab-toolbar').addClass('square-corner');
    } else {
      $('#analyzeToolbar .btn-save').hide();
      $('.analyze-section-toolbar, .tab-toolbar').removeClass('square-corner');
    }
  },

  showSaveModal: function() {
    var $tabList = '';
    $('.btn-tab').each(function(i, el) {
      if ($('span.name', el).length === 0) return;
      $tabList += '<label for="checkbox1"><input type="checkbox" id="checkbox1" checked style="display: none;"><span class="custom checkbox checked"></span> ' + $('span.name', el).text() + '</label>';

    });
    $('#saveModal .tabs-to-save').html($tabList);
  },

  allowTabCreation: function() {
    $('.btn-create-tab').show();
  },

  onSaveWorksheetSuccess: function(response) {
    $('.tab-buttons .btn.active').find('.unsaved-indicator').remove();
    $('.tab-toolbar .btn-save-worksheet').hide().parent().removeClass('btn-group');
    $('.tab-toolbar .btn-rename-tab').show();
    if (response && response.id) {
      $('<input>').attr({
          type: 'hidden',
          id: 'worksheetId',
          value: response.id.id
        }).appendTo(this.getCurrentTab());
    }
  },

  loadModal: function() {
    $('#openWorksheetModal').find('.modal-body').html('<div class="well"><img src="/img/ajax-loader-circle.gif"/> &nbsp; Loading Snapshots...</div>');
    $('#openWorksheetModal').modal('show');

    $.ajax({
      url: '/api/snapshots/list',
      dataType: 'json',
      success: function(response) {
        var data = {
          worksheets: response
        };
        var html = listWorksheetsTableTpl(data);
        $('#openWorksheetModal').find('.modal-body').html(html);
      }
    });
  },

  openWorksheet: function(id) {
    console.log('analyze::openWorksheet...', id);
    var openSnapshots = this.getOpenSnapshotIds();
    console.log(openSnapshots, id);
    $('#openWorksheetModal').modal('hide');
    if(openSnapshots.indexOf(id) > -1){
      toastr.error("Snapshot Already Opened", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
      return false;
    }
    var self = this;
    $('#openWorksheetModal').modal('hide');
    self.ctxTrending.showChartLoader();
    $.ajax({
      url: '/api/snapshots/get/' + id,
      //      url: '/api/snapshots/get/' + id,// + '/' + ids,//
      dataType: 'json',
      success: function(response) {
        self.ctxTrending.hideChartLoader();
        if (response.data !== '') {
          self.createTabForWorksheet(response);
        } else {
          toastr.error("Snapshot Not Found", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
        }
      }
    });
  },

  updateWorksheet: function(id) {
    var self = this;
    self.ctxTrending.showChartLoader();
    $.ajax({
      url: '/manage/worksheets/update' + id,
      dataType: 'json',
      success: function(response) {
        self.ctxTrending.hideChartLoader();
      }
    });
  }
});

var TrendingView = Backbone.View.extend({

  el: $('#container'),

  $el_trendingOptions: $('#trendingOptions'),

  events: {
    'click .btn-submit': 'submitHandler',
    'click .btn-options': 'toggleTrendingOptions',
    'change .field-offset-type': 'onOffsetChange',
    'change .field-start-date, .field-end-date': 'onDateChange',
    'change .field-test-data .field-reference-data': 'fieldTestChangeHandler',
    'click #preset-dates a': 'onPresetDateClick'
  },

/*LH - called on submit for create new or clone of snapshot. before save */
  initialize: function(options){
    var self = this;
    _.bindAll(this, 'render', 'onOffsetChange');
    this.parent = options.parent;
    this.sortOrderIDs = [];//LH
    // socket events
    this.parent.ctxSocket.on('CALCULATE_TRENDING_CHARTS_COMPLETE', function(results){
      console.log('initialize::results', results);

      if(results.params.section === self.parent.currentSection){
        console.log('[App] calculateTrendingChartsComplete');
        console.log(results);

        if($('.tab-buttons .btn.active').find('.unsaved-indicator').length > 0) {
          $('.tab-buttons .btn.active').data('default', false);
          $('.tab-toolbar .btn-save-worksheet').show();
        }

        self.hideChartLoader();
        self.saveRawResults(results);

        var sectionName = results.params.section;
        $('.section-' + sectionName + ' .trending-charts').show();

        var chartOptions = self.getCorrelationChartOptions(results);
        //context.renderChart($('.forecast-chart' + lastTrendingChartContainerCount), context.getSavedCorrelationChartOptions());

        if (results.autofactorreduce.error) {
          //display error messages...
          var errorMessage = 'Error: ' + results.autofactorreduce.error.code + ' - ' + results.autofactorreduce.error.message;
          errorMessage += '<br/>Modify the snapshot parameters to increase the number of data set rows and/or decrease the number of data sets in the analysis.';
          console.log(self.chartContainerCount);
          $('#best-predictor-chart-tab' + (self.chartContainerCount - 1) + ' #best-predictor-error').html(errorMessage);
          $('#best-predictor-chart-tab' + (self.chartContainerCount - 1) + ' .analyze-error').show();
          $('.section-' + self.parent.currentSection).find('.trending-charts ul li a[href^="#best-predictor"]').addClass('icon-warning-sign');
          //hide any previous best predictor results
          $('.best-predictor-chart').hide();
          $('.best-predictor-table').hide();

          $('#forecast-chart-tab' + (self.chartContainerCount - 1) + ' #forecast-error').html(errorMessage);
          $('#forecast-chart-tab' + (self.chartContainerCount - 1) + ' .analyze-error').show();
          $('.section-' + self.parent.currentSection).find('.trending-charts ul li a[href^="#forecast"]').addClass('icon-warning-sign');
          //hide any previous forecast results
          $('.section-' + sectionName + ' .forecast-equalizer').hide();
          if(results.autofactorreduce.error.code === 1010){
            $('.section-' + self.parent.currentSection + '#analyze-error-message')
              .text('Error: ' + results.autofactorreduce.error.message)
              .show(); 
          }

        } else {

          $('.section-' + self.parent.currentSection + '#analyze-error-message')
            .hide()
          $('#best-predictor-chart-tab' + (self.chartContainerCount - 1) + ' .analyze-error').hide();
          //hide any previous best predictor results
          $('.best-predictor-chart').show();
          $('.best-predictor-table').show();
          $('#forecast-chart-tab' + (self.chartContainerCount - 1) + ' .analyze-error').hide();
          $('.section-' + sectionName + ' .forecast-equalizer').show();
          $('.section-' + self.parent.currentSection).find('.trending-charts ul li a[href^="#forecast"]').removeClass('icon-warning-sign');
          $('.section-' + self.parent.currentSection).find('.trending-charts ul li a[href^="#best-predictor"]').removeClass('icon-warning-sign');
          self.renderBestPredictorModelTable($('.section-' + sectionName + ' .best-predictor-table'), results);//self.getSavedBestPredictorModelTableData());
          var data = results;//self.getSavedBestPredictorModelTableData();
          data.chartOptions = chartOptions;
          self.renderForecastEqualizer($('.section-' + sectionName + ' .forecast-equalizer'), data);
        }


        self.renderTopCorrelationTable($('.section-' + sectionName + ' .correlation-table'), results);
        self.renderTopCorrelationTable($('.section-' + sectionName + ' .sequence-table'), results);

        //LH sort data.data base on order from this.sortOrderIDs
        // var temp = [];
        // _.each(self.sortOrderIDs, function(element, index, list){
        //     temp.push( _.find(results.datapoints, function(chr) {
        //       return chr.datastreamid == element;
        //     }) );
        // });
        // console.log('temp final here :', temp);
        // results.datapoints = $.merge([_.first(results.datapoints)], temp);
        // results.datapoints_shifted = $.merge([_.first(results.datapoints_shifted)], temp);

        self.saveTopCorrelationData(results);
        self.saveBestPredictorModelTableData(results);
        
        if(!results.hasOwnProperty('datapoints')){
          return; 
        }

        var chartOptions = self.getBestPredictorChartOptions(results);
        //self.saveBestPredictorChartOptions(chartOptions);
        self.renderChart($('.section-' + sectionName + ' .best-predictor-chart'), chartOptions);//self.getSavedBestPredictorChartOptions());

        var chartOptions = self.getSequenceChartOptions(results);
        //self.saveSequenceChartOptions(chartOptions);
        self.renderChart($('.section-' + sectionName + ' .sequence-chart'), chartOptions);//self.getSavedSequenceChartOptions());

        var chartOptions = self.getCorrelationChartOptions(results);
        //self.saveCorrelationChartOptions(chartOptions);
        self.renderChart($('.section-' + sectionName + ' .correlation-chart'), chartOptions);//self.getSavedCorrelationChartOptions());

        self.saveDataToTab();
      }
    });

    this.parent.ctxSocket.on('CALCULATE_TRENDING_CHARTS_ERROR', function(results) {
      self.hideChartLoader();
      toast.notifyError('Error', 'Error performing chart calculation.');
    });

    this.render();
  },

  render: function() {
    $('.field-offset-limit').off('spinstop').on('spinstop', this.onOffsetChange).on('spinchange', this.onOffsetChange);
    this.calculateAdjustedDates();
  },

  fieldTestChangeHandler: function() {
    this.validateForm();
    // cache what is selected
    var referenceData = $('.field-reference-data').find('option:selected').val();
    var testData = [];
    $('.field-test-data').find('option:selected').each(function(i, elem) {
      testData.push($(elem).val());
    });

    // ok need to manage each snapshot as an object
    // this means converting back and forth from JSON
    var currentSnapshot = $('.btn-tab.active').find('span.name').text();
    var snapshotData = store.get(currentSnapshot);
    if(!snapshotData) snapshotData = {};
    snapshotData.referenceData = referenceData;
    snapshotData.testData = testData;
    store.set(currentSnapshot, snapshotData);

  },

  submitHandler: function(e) {
    e.preventDefault();
    if (this.validateReferenceAndTestData()) {
      if ($('.tab-buttons .btn.active').find('.unsaved-indicator').length > 0) {
        this.toggleTrendingOptions();
        this.saveOptionsToTab();
        this.performChartCalculations();
        this.cacheOptions();
      } else {
        this.parent.createTabWithOptionsAndSubmit();
      }
    }
  },

  __correlationChartOptions: {},
  __correlationData: {},
  __sequenceChartOptions: {},
  __bestPredictorChartOptions: {},
  __bestPredictorModelTableData: {},
  __scenarioData: {},
  __rawResults: {},
  sectionSelector: '.section-trending',
  optionsSelector: '#trendingOptions',
  panelCount: 0,
  chartContainerCount: 0,
  lastTrendingChartContainerCount: 0,
  setOptionValues: function(data) {
    this.clearOptionErrors();
    var $el_trendingOptions = $('#trendingOptions'),
      $el_startDate = $('.field-start-date', $el_trendingOptions),
      $el_endDate = $('.field-end-date', $el_trendingOptions),
      $el_testData = $('.field-test-data', $el_trendingOptions),
      $el_referenceData = $('.field-reference-data', $el_trendingOptions),
      $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
      $el_offsetType = $('.field-offset-type', $el_trendingOptions);

    $el_startDate.val(data.startDate);
    $el_endDate.val(data.endDate);
    $el_testData.select2('val', data.testIDs);
    $el_referenceData.select2('val', data.referenceData);
    $el_offsetLimit.val(data.shiftRange);
    $el_offsetType.select2('val', data.shiftType);
    dataStreamStart = data.dataStreamStart;
    dataStreamEnd = data.dataStreamEnd;
  },

  setDefaultOptionValues: function() {
    this.clearOptionErrors();
    var $el_trendingOptions = $('#trendingOptions'),
      $el_startDate = $('.field-start-date', $el_trendingOptions),
      $el_endDate = $('.field-end-date', $el_trendingOptions),
      $el_testData = $('.field-test-data', $el_trendingOptions),
      $el_referenceData = $('.field-reference-data', $el_trendingOptions),
      $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
      $el_offsetType = $('.field-offset-type', $el_trendingOptions);

    $el_startDate.val("2011-01-01");
    $el_endDate.val("2012-01-01");
    $el_testData.select2('val', "");
    $el_referenceData.select2('val', "0");
    $el_offsetLimit.val("6");
    $el_offsetType.select2('val', "month");
  },
  getDefaultOptionValues: function() {
    return {
      startDate: "2011-01-01",
      endDate: "2012-01-01",
      testIDs: [],
      referenceData: "0",
      shiftRange: "6",
      shiftType: "month"
    };
  },
  getOptionValues: function() {
    var $el_trendingOptions = $('#trendingOptions'),
      $el_startDate = $('.field-start-date', $el_trendingOptions),
      $el_endDate = $('.field-end-date', $el_trendingOptions),
      $el_testData = $('.field-test-data', $el_trendingOptions),
      $el_referenceData = $('.field-reference-data', $el_trendingOptions),
      $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
      $el_offsetType = $('.field-offset-type', $el_trendingOptions);

    var selectedOptions = $.makeArray($el_testData.find('option:selected')).concat($.makeArray($el_referenceData.find('option:selected'))),
      dataStreamStart = _.min(
      selectedOptions.map(function(o) {
        return $(o).attr('data-start');
      })
      ),
      dataStreamEnd = _.max(
      selectedOptions.map(function(o) {
        return $(o).attr('data-end');
      })
      );

    return {
      startDate: $el_startDate.val(),
      endDate: $el_endDate.val(),
      testIDs: $el_testData.select2('val'),
      referenceData: $el_referenceData.select2('val'),
      shiftRange: $el_offsetLimit.val(),
      shiftType: $el_offsetType.select2('val'),
      dataStreamStart: dataStreamStart,
      dataStreamEnd: dataStreamEnd,
      section: this.parent.currentSection
    };
  },

  setOptionValuesFromResponse: function(response) {
      var $el_trendingOptions = $('#trendingOptions'),
        $el_startDate = $('.field-start-date', $el_trendingOptions),
        $el_endDate = $('.field-end-date', $el_trendingOptions),
        $el_testData = $('.field-test-data', $el_trendingOptions),
        $el_referenceData = $('.field-reference-data', $el_trendingOptions),
        $el_offsetLimit = $('.field-offset-limit', $el_trendingOptions),
        $el_offsetType = $('.field-offset-type', $el_trendingOptions);
      var startDate = moment(new Date(response.start)).format('YYYY-MM-DD');
      var endDate = moment(new Date(response.end)).format('YYYY-MM-DD');
      var testData = response.relativeDatasetIds.map(function(i) {
        return parseInt(i, 10);
      });
      $el_startDate.val(startDate);
      $el_endDate.val(endDate);
      $el_testData.select2("val",  testData);
      $el_referenceData.select2("val", response.baseDatasetId);
      $el_offsetLimit.val(response.shiftRange);
      $el_offsetType.val(response.unit);

    },

  saveOptionsToTab: function() {
    var $tab = $('.btn[data-section="' + this.parent.currentSection + '"]');
    var options = this.getOptionValues();
    console.log(options);
    $tab.data('options', JSON.stringify(options));
  },

  cacheOptions: function() {
    var $tab = $('.btn[data-section="' + this.parent.currentSection + '"]');
    var data = $tab.data('options');
    var snapshotName = $('.btn-tab.active').find('span.name').text();
    var isUnsaved = $('.btn-tab.active').find('.icon-asterisk').length;
    var worksheetId = parseInt($('.btn-tab.active').find('#worksheetId').val());
    var snapshotData = {
      name: snapshotName,
      isUnsaved: isUnsaved,
      worksheetId: worksheetId,
      data: data
    };
    this.cacheSnapshot(snapshotName);
    store.set(snapshotName, snapshotData);
  },

  cacheSnapshot: function(snapshotName) {
    var snapshots = store.get('snapshots');
    if (!snapshots) {
      snapshots = {};
    }
    snapshots[snapshotName] = 1;
    store.set('snapshots', snapshots);
  },

  saveDataToTab: function() {
    var self = this;
    var $tab = $('.btn[data-section="' + this.parent.currentSection + '"]');
    $tab.data('data_correlation', JSON.stringify(self.getSavedCorrelationChartOptions()));
    $tab.data('data_correlationtable', JSON.stringify(self.getSavedTopCorrelationData()));
    $tab.data('data_sequence', JSON.stringify(self.getSavedSequenceChartOptions()));
    $tab.data('data_sequencetable', JSON.stringify(self.getSavedTopCorrelationData()));
    $tab.data('data_bestpredictor', JSON.stringify(self.getSavedBestPredictorChartOptions()));
    $tab.data('data_bestpredictortable', JSON.stringify(self.getSavedBestPredictorModelTableData()));
    $tab.data('data_raw', JSON.stringify(self.getSavedRawResults()));
  },

  hideEmptyCalculationMessage: function() {
    $('.section-' + this.parent.currentSection + ' #emptyCalculationMessage').hide();
  },

  showChartLoader: function() {
    $('.section-' + this.parent.currentSection + ' #trendingChartLoader').show();
  },

  hideChartLoader: function() {
    $('.section-' + this.parent.currentSection + ' #trendingChartLoader').hide();
  },

  hideCharts: function() {
    $('.trending-charts', this.sectionSelector).hide();
  },

  hideOptionsWindow: function() {
    var $dropdown = $(this.optionsSelector);
    if ($dropdown.hasClass('open')) {
      $('[data-dropdown="' + $dropdown.attr('id') + '"]').trigger('click');
    }
  },

  showCharts: function() {
    $('.trending-charts', this.sectionSelector).show();
  },

  resetCharts: function(selector) {
    $(selector).find('.trending-charts').remove();
    this.buildChartContainer($(selector));
  },

  performChartCalculations: function() {
    var self = this;
    this.hideOptionsWindow();
    this.hideEmptyCalculationMessage();
    this.showChartLoader();
    this.parent.ctxSocket.emit('CALCULATE_TRENDING_CHARTS', self.getOptionValues());
  },

  onCalculateTrendingChartsError: function() {
    this.hideChartLoader();
    toast.notifyError('Error', 'Error performing chart calculation.');
  },

  onCalculateTrendingChartsComplete: function(results) {
    var self = this;
    console.log('[App] calculateTrendingChartsComplete');

    this.hideChartLoader();
    this.saveRawResults(results);

    var sectionName = results.params.section;
    $('.section-' + sectionName + ' .trending-charts').show();

    var chartOptions = this.getBestPredictorChartOptions(results);
    this.saveBestPredictorChartOptions(chartOptions);
    this.renderChart($('.section-' + sectionName + ' .best-predictor-chart'), this.getSavedBestPredictorChartOptions());
    this.saveBestPredictorModelTableData(results);

    var chartOptions = this.getCorrelationChartOptions(results);
    this.saveCorrelationChartOptions(chartOptions);
    // debugger;
    this.renderChart($('.section-' + sectionName + ' .correlation-chart'), this.getSavedCorrelationChartOptions());
    this.saveTopCorrelationData(results);

    var chartOptions = self.ctxTrending.getSequenceChartOptions(results);
    this.saveSequenceChartOptions(chartOptions);
    this.renderChart($('.section-' + sectionName + ' .sequence-chart'), this.getSavedSequenceChartOptions());

    var chartOptions = this.getCorrelationChartOptions(results);
    //context.renderChart($('.forecast-chart' + lastTrendingChartContainerCount), context.getSavedCorrelationChartOptions());

    this.renderTopCorrelationTable($('.section-' + sectionName + ' .correlation-table'), this.getSavedTopCorrelationData());
    this.renderTopCorrelationTable($('.section-' + sectionName + ' .sequence-table'), this.getSavedTopCorrelationData());

    if (results.autofactorreduce.error) {
      //display error messages...
      var errorMessage = 'Error: ' + results.autofactorreduce.error.code + ' - ' + results.autofactorreduce.error.message;
      errorMessage += '<br/>Modify the snapshot parameters to increase the number of data set rows and/or decrease the number of data sets in the analysis.';
      $('#best-predictor-chart-tab' + (this.chartContainerCount - 1) + ' #best-predictor-error').html(errorMessage);
      $('#best-predictor-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').show();
      $('.section-' + this.parent.currentSection).find('.trending-charts ul li a[href^="#best-predictor"]').addClass('icon-warning-sign');
      //hide any previous best predictor results
      $('.best-predictor-chart').hide();
      $('.best-predictor-table').hide();

      $('#forecast-chart-tab' + (this.chartContainerCount - 1) + ' #forecast-error').html(errorMessage);
      $('#forecast-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').show();
      $('.section-' + this.parent.currentSection).find('.trending-charts ul li a[href^="#forecast"]').addClass('icon-warning-sign');
      //hide any previous forecast results
      $('.section-' + sectionName + ' .forecast-equalizer').hide();

      if(results.autofactorreduce.error.code === 1010){
        $('.section-' + this.parent.currentSection + '#analyze-error-message')
          .text('Error: ' + results.autofactorreduce.error.message)
          .show(); 
      }

    } else {
      $('.section-' + this.parent.currentSection + '#analyze-error-message').hide();
      $('#best-predictor-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').hide();
      //hide any previous best predictor results
      $('.best-predictor-chart').show();
      $('.best-predictor-table').show();
      $('#forecast-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').hide();
      $('.section-' + sectionName + ' .forecast-equalizer').show();
      $('.section-' + this.parent.currentSection).find('.trending-charts ul li a[href^="#forecast"]').removeClass('icon-warning-sign');
      $('.section-' + this.parent.currentSection).find('.trending-charts ul li a[href^="#best-predictor"]').removeClass('icon-warning-sign');
      this.renderBestPredictorModelTable($('.section-' + sectionName + ' .best-predictor-table'), this.getSavedBestPredictorModelTableData());
      var data = this.getSavedBestPredictorModelTableData();
      data.chartOptions = chartOptions;
      this.renderForecastEqualizer($('.section-' + sectionName + ' .forecast-equalizer'), data);
    }
    this.saveDataToTab();
    /*context.renderChart($('.correlation-chart' + (chartContainerCount - 1)), context.getCorrelationChartOptions(data.data));
     context.renderChart($('.best-predictor-chart' + (chartContainerCount - 1)), context.getBestPredictorChartOptions(data.data));
     context.renderChart($('.sequence-chart' + (chartContainerCount - 1)), context.getSequenceChartOptions(data.data));
     var chartOptions = context.getCorrelationChartOptions(data.data);
     context.renderChart($('.forecast-chart' + (chartContainerCount - 1)), chartOptions);

     context.renderTopCorrelationTable($('.correlation-table' + (chartContainerCount - 1)), data.data);
     context.renderTopCorrelationTable($('.sequence-table' + (chartContainerCount - 1)), data.data);
     context.renderBestPredictorModelTable($('.best-predictor-table' + (chartContainerCount - 1)), data.data);
     data.data.chartOptions = chartOptions;
     context.renderForecastEqualizer($('.forecast-equalizer' + (chartContainerCount - 1)), data.data);*/
  },

  saveTopCorrelationData: function(data) {
    this.__correlationData = data;
  },

  getSavedTopCorrelationData: function() {
    return this.__correlationData;
  },

  saveBestPredictorModelTableData: function(data) {
    this.__bestPredictorModelTableData = data;
  },

  getSavedBestPredictorModelTableData: function() {
    return this.__bestPredictorModelTableData;
  },

  saveCorrelationChartOptions: function(chartOptions) {
    this.__correlationChartOptions = jQuery.extend(true, {}, chartOptions);
  },

  getSavedCorrelationChartOptions: function() {
    var newObj = jQuery.extend(true, {}, this.__correlationChartOptions);
    return newObj;
  },

  saveSequenceChartOptions: function(chartOptions) {
    this.__sequenceChartOptions = jQuery.extend(true, {}, chartOptions);
  },

  getSavedSequenceChartOptions: function() {
    var newObj = jQuery.extend(true, {}, this.__sequenceChartOptions);
    return newObj;
  },

  saveBestPredictorChartOptions: function(chartOptions) {
    this.__bestPredictorChartOptions = jQuery.extend(true, {}, chartOptions);
  },

  getSavedBestPredictorChartOptions: function() {
    var newObj = jQuery.extend(true, {}, this.__bestPredictorChartOptions);
    return newObj;
  },

  saveRawResults: function(results) {
    this.__rawResults = results;
  },

  getSavedRawResults: function() {
    return this.__rawResults;
  },

  buildChartContainer: function($container) {
    var data = {
      count: this.chartContainerCount
    };
    var html = trendingChartsTpl(data);
    $container.append(html);
    this.chartContainerCount++;
    //when a tab is deleted, the chartContainerCount gets out of sync with tabCount
    this.panelCount = this.panelCount + 3;
  },

  renderChart: function($container, chartOptions) {
    $container.highcharts('StockChart', chartOptions);
  },

/*LH*/
  renderTopCorrelationTable: function($container, data) {
    console.log('[App] renderTopCorrelationTable');

    var shifts = _.chain(data.autocorrelate.shifts || []).sortBy(function(o) {
      return -o.pecentagecorrelated;
    }).map(function(o) {
      var cloned = _.clone(o);
      cloned.pecentagecorrelated = (cloned.pecentagecorrelated || 0).toFixed(2) + '%';
      return cloned;
    }).value();

    var data2 = {
      shifts: shifts,
      shiftType: data.params.shiftType
    };
    var html = topCorrelationTableTpl(data2);
    //console.log('renderTopCorrelationTable::html -> ', html);
    console.log('renderTopCorrelationTable::data2 -> ', data2);
    if($container.attr('class').indexOf('correlation-table') != -1){
      //correlation-table
      var reducedData = _.map(data2.shifts, function(obj){
                 //return obj.datastreamname;
                 return obj.datastreamid
             });
      this.sortOrderIDs = _.uniq($.merge(this.sortOrderIDs, reducedData));
      console.log('renderTopCorrelationTable::this.sortOrderIDs -> ', this.sortOrderIDs);
    }
    $container.html(html);
  },

/*LH*/
  renderBestPredictorModelTable: function($container, data) {
    console.log('[App] renderBestPredictorModelTable');

    var presentedFactors = {
      factors: _.chain(data.autofactorreduce.factors || []).map(function(o) {
        var cloned = _.clone(o);
        var coefficientFormatted = parseFloat(cloned.coefficient || 0);
        coefficientFormatted = (1 > coefficientFormatted && coefficientFormatted > -1) ? coefficientFormatted.toExponential(3) : coefficientFormatted.toFixed(3);
        cloned.coefficientFormatted = coefficientFormatted;
        return cloned;
      }).value()
    };
    data.autofactorreduce.factors = presentedFactors.factors;
    data.autofactorreduce.percentagecorrelatedrounded = Math.round(data.autofactorreduce.percentagecorrelated);

    var data2 = {
      autofactorreduce: data.autofactorreduce,
      shiftType: data.params.shiftType
    };
    var html = bestPredictorModelTableTpl(data2);
    //console.log('renderBestPredictorModelTable::html -> ', html);
    console.log('renderBestPredictorModelTable::data2 -> ', data2);
    var reducedData = _.map(data2.autofactorreduce.factors, function(obj){
               //return obj.datastreamname;
               return obj.datastreamid
           });
    this.sortOrderIDs = $.merge(this.sortOrderIDs, reducedData);
    console.log('renderBestPredictorModelTable::this.sortOrderIDs -> ', this.sortOrderIDs);
    $container.html(html);
    $container.find('[data-toggle=tooltip]').tooltip({
      container: 'body'
    }); //initialize tooltips
  },

  renderForecastEqualizer: function($forecastContainer, data) {
    console.log('[App] renderForecastEqualizer ');

    var equationData = {
      factors: _.chain(data.autofactorreduce.factors || []).map(function(o, index) {
        var cloned = _.clone(o);
        return cloned;
      }).value()
    };

    equationData.factors.unshift({
      'datastreamid': data.datapoints[0].datastreamid,
      'datastreamname': data.datapoints[0].datastreamname,
      'shiftfactor': 0,
      'adjustedpercentagecorrelated': '100%'
    });

    var scenarioData = {};
    scenarioData.baseline = {
      factors: equationData.factors,
      shiftType: data.params.shiftType,
      intercept: data.autofactorreduce.intercept,
      degreesOfFreedom: data.autofactorreduce.degreesoffreedom,
      residualStandardError: data.autofactorreduce.residualstandarderror
    };
    scenarioData.scenario = [];
    if(data.forecasts){
      for(var x = 0; x < data.forecasts.length; x++){
        var forecast = data.forecasts[x];
        if(forecast.data){
          var scenario_data = JSON.parse(forecast.data);
          if (scenario_data) {
            var scenario = {};
            scenario.shiftType = data.params.shiftType;
            scenario.id = forecast.id;
            scenario.intercept = data.autofactorreduce.intercept;
            scenario.degreesOfFreedom = data.autofactorreduce.degreesoffreedom;
            scenario.residualStandardError = data.autofactorreduce.residualstandarderror;
            scenario.title = forecast.name;
            scenario.factors = [];
            //scenario.factors = _.clone(equationData.factors);
            for (var j = 0; j < scenario_data.factors.length; j++) {
              scenario.factors[j] = _.clone(equationData.factors[j]);
              scenario.factors[j].state = _.clone(scenario_data.factors[j].state[x]);
            }
        scenarioData.scenario[x] = scenario;
          }

        }
      }

    }
    var html = forecastEqualizerTpl(scenarioData);

    //forecastContainer handles interface elements for all scenarios (including baseline)
    $forecastContainer.html(html);

    //Hide the chart for now
    $('.forecast-chart').hide();
    $forecastContainer.find('.btn-save-scenario').hide();
    $forecastContainer.find('.btn-rename-scenario').hide();

    //baselineContainer handles interface elements for only the baseline scenario which is generated dynamically - not saved
    var $baselineContainer = $($forecastContainer).find('#forecast-scenario-baseline');
    //First, create the Baseline forecast values that represents the initial default best predictor solution
    var colorIndex = 0;
    var avgPoints = [];

    //work through each independent value, then do the dependent value last so we can solve the equation as the default
    for (var i = 0; i < scenarioData.baseline.factors.length; i++) {
      //get average value
      var total = 0.0;
      var streamId = scenarioData.baseline.factors[i].datastreamid;
      //NOTE: The datapoints array may not be in the same order as the factors array - so match by datastreamid
      //todo: the average values of each dataset could be computed in the initial server call rather than doing it here each time
      for (var j = 0; j < data.datapoints_shifted.length; j++) {
        if (data.datapoints_shifted[j].datastreamid == streamId) {
          var points = new Array();
          for (var k = 0; k < data.datapoints_shifted[j].data.length; k++) {
            total += data.datapoints_shifted[j].data[k].value;
            if (j > 0) {
              points[k] = data.datapoints_shifted[j].data[k].value;
            }
          }
          paramValue = (k == 0 ? 0 : total / k);
          if (j > 0) {
            avgPoints.push(points);
          }
          j = data.datapoints_shifted.length;
        }
      }

      if (i == 0) {
        //dependent values
        if (paramValue > 0) {
          minValue = -paramValue;
          maxValue = paramValue * 3;
        } else {
          if (paramValue < 0) {
            minValue = paramValue * 3;
            maxValue = -paramValue;
          } else {
            //
          }
        }
      } else {
        //independent values
        if (paramValue > 0) {
          minValue = 0;
          maxValue = paramValue * 2;
        } else {
          if (paramValue < 0) {
            minValue = paramValue * 2;
            maxValue = 0;
          } else {
            //
          }
        }
      }

      //determine proper range and decimal places to display
      var places = 0;
      var step = 1;
      if (Math.abs(paramValue) < 1) {
        places = 2;
        step = 0.01;
      } else {
        if (Math.abs(paramValue) < 10) {
          places = 1;
          step = 0.1;
        }
      }

      minValue = Math.round(minValue * Math.pow(10, places)) / Math.pow(10, places);
      paramValue = Math.round(paramValue * Math.pow(10, places)) / Math.pow(10, places);
      maxValue = Math.round(maxValue * Math.pow(10, places)) / Math.pow(10, places);

      if (i == 0) {
        //these values are set for all scenarios...
        $forecastContainer.find(".forecast-" + i).data('baselinematrix', avgPoints);
        //these values only apply to the baseline...
        $baselineContainer.find(".forecast-" + i)
          .data('resetvalue', paramValue)
          .prop("disabled", true);
        colorIndex = 0;
      } else {
        //all values...
        $forecastContainer.find("#forecast-" + i).data('coefficient', data.autofactorreduce.factors[i - 1].coefficient);
        //baseline only...
        $baselineContainer.find("#forecast-" + i)
          .data('resetvalue', paramValue)
          .val(paramValue);
        colorIndex = 2 * i - 1;
      }
      //all values...
      $forecastContainer.find(".range-" + i + " .minValue").text(minValue);
      $forecastContainer.find(".range-" + i + " .avgValue").text(paramValue); //.data('resetvalue',paramValue);
      $forecastContainer.find(".range-" + i + " .maxValue").text(maxValue);
      $baselineContainer.find(".forecast-slider-" + i).slider({
        "orientation": "horizontal",
        "range": "min",
        "min": minValue,
        "max": maxValue,
        "value": paramValue,
        "disabled": i == 0,
        "step": step
      });
      $forecastContainer.find(".forecast-slider-" + i).slider({
        "orientation": "horizontal",
        "range": "min",
        "min": minValue,
        "max": maxValue,
        //"value": value is set in the template for saved user scenarios
        //"disabled": i == 0,
        "step": step
      });
      //TODO: The order of the datasets in the graph may be different than the sorted list, correct this when finalizing the graph type
      $forecastContainer.find(".forecast-slider-" + i + " > div.ui-slider-range").css("background-color", data.chartOptions.colors[colorIndex]);
    }
    //var datasetPeriod = Math.round((data.params.dataStreamEnd-data.params.dataStreamStart)/(1000*60*60*24*30));
    var forecastPeriod = Math.round((Date.parse(data.params.endDate) - Date.parse(data.params.startDate)) / (1000 * 60 * 60 * 24 * 30));
    $forecastContainer.find(".forecast-period").text(forecastPeriod);

    var endDate = new Date.parse(data.params.endDate);
    endDate.setMonth(endDate.getMonth() + forecastPeriod);
    var curr_day = endDate.getDate();
    var curr_month = endDate.getMonth() + 1; //Months are zero based
    var curr_year = endDate.getFullYear();
    $forecastContainer.find(".forecast-date").text(curr_month + '/' + curr_day + '/' + curr_year);

    //remember the average values from which to establish baseline calculations
    $forecastContainer.find(".forecast-0").data('baselinematrix', avgPoints);
    //trigger initial solve for baseline scenario
    $baselineContainer.find(".forecast-slider-0").slider('value', 0);
    $forecastContainer.find(".scenario.user .solving").click();
    //trigger initial solve for all user scenarios
    $forecastContainer.find(".scenario.user .forecast").change();
    //establish tooltips on new elements
    $forecastContainer.find('[data-toggle=tooltip]').tooltip({
      container: 'body'
    });

    //Initialize baseline table configuration
    //$forecastContainer.find('div.scenario.baseline table.test-data').dataTable( {
    //Initialize common settings for all table configurations
    $forecastContainer.find('table.test-data').dataTable({
      "bPaginate": false,
      "bLengthChange": false,
      "bFilter": false,
      "bSort": true,
      "bInfo": false,
      "bAutoWidth": false,
      "aaSorting": [[2, "asc"]], //DataTables initialization overwrites attributes established in html template
      "aoColumns": [
        /* Test Data */ null,
        /* Time Shift */ null,
        /* Forecast Date */ null,
        /* Confidence Interval */ null,
        /* Slider */ {
          "bSearchable": false,
          "bSortable": false
        },
        /* Forecast */ {
          "bSearchable": false,
          "bSortable": false
        }
      ]
    });

    //Initialize user table configurations
    //todo: establish aaSorting when initializing data structure if this feature is wanted
    /*$forecastContainer.find('div.scenario.user table.test-data').each(function(index){
     this.dataTable().fnSort(
     aaSorting[index] //[[ 2, "asc" ]]
     );
     });*/

    //todo: we may need to align table column widths manually...
    //var header = $forecastContainer.find('.test-data thead tr th');
    //for(i=0;i<header.length;i++){
    //$('.reference-data thead tr th[i]').
    //	var width = $(header[i]).width();
    //}
  },


/*LH*/
  getCorrelationChartOptions: function(data) {
    //console.log('[App] renderCorrelationChart');
    //console.log('this.tabCount >>>>>>>>>>>2>', this.parent.tabCount);
    //console.log($('.btn-tab.active').data('section').replace('tab',''));

    console.log('data passed to correlation', data);
    var originalData = {};
    var localTabCount = $('.btn-tab.active').data('section').replace('tab','');//this.parent.tabCount;

    var series, combined, shift, values, ref_min, ref_max, val, mean_min=0, mean_max=0,
      selections = this.getOptionValues(),
      shifts = _.map(selections.testIDs, function(o) {
        return o + ':' + selections.shiftRange;
      }).join('|'),
      valuePeaks = {},
      adjustData = function(data, suffix) {
        suffix = suffix || '';

        return _.map(data, function(o, key) {
          valuePeaks[o.datastreamid] = valuePeaks[o.datastreamid] || {};
          return {
            'datastreamname': o.datastreamname + suffix,
            'datastreamid': o.datastreamid,//both non-shifted and shifted share same id
            'data': _.map(o.data, function(o2) {
              //find the lowest min and highest max of each series
              valuePeaks[o.datastreamid].min = valuePeaks[o.datastreamid].min || o2.value;
              valuePeaks[o.datastreamid].max = valuePeaks[o.datastreamid].max || o2.value;
              valuePeaks[o.datastreamid].min = Math.min(o2.value, valuePeaks[o.datastreamid].min);
              valuePeaks[o.datastreamid].max = Math.max(o2.value, valuePeaks[o.datastreamid].max);
              valuePeaks.all_min = valuePeaks[o.datastreamid].min;
              valuePeaks.all_max = valuePeaks[o.datastreamid].max;
              return {
                'date': new Date(o2.date), //Date.parseExact(o2.date, 'yyyyMMdd'),
                'value': o2.value
              };
            })
          };

        });

      },
      normal = adjustData(data.datapoints, ''),
      shifted = adjustData(data.datapoints_shifted, ' (shifted)');

    combined = [];

/*
          //get min and max of ref data
          if (key === 0 && suffix != "") {
            ref_min = valuePeaks[o.datastreamid].min;
            ref_max = valuePeaks[o.datastreamid].max;
          }else{
            //check if this needs to be normalize
            if(valuePeaks[o.datastreamid].min > ref_max || valuePeaks[o.datastreamid].max < ref_min){
              valuePeaks[o.datastreamid].normalize = true;
            }
          }
 */

    //getting the order to display and get mean of mins and maxs
    _.each(normal, function(o, key) {
      if (key === 0) {//reference line
        ref_min = valuePeaks[o.datastreamid].min;
        ref_max = valuePeaks[o.datastreamid].max;
        //mean_min +=ref_min;
        //mean_max +=ref_max;
        combined.push(o);
        //combined.push(o);//second ref line
      } else {//everything else
        //check if this needs to be normalize
        if(valuePeaks[o.datastreamid].min > ref_max || valuePeaks[o.datastreamid].max < ref_min){
          valuePeaks[o.datastreamid].normalize = true;
        }
        //mean_min +=valuePeaks[o.datastreamid].min;
        //mean_max +=valuePeaks[o.datastreamid].max;
        combined.push(o);
        combined.push(shifted[key]);
      }
    });

      series = _.chain(combined).flatten(true).map(function(o, index) {

      values = _.chain(o.data).pluck('value').value();

      _.each(o.data, function(obj, key) {
        var oKey = values[key]
        if (typeof originalData[o.datastreamname] === 'undefined') {
          originalData[o.datastreamname] = {};
        }
        originalData[o.datastreamname][oKey] = obj.value;
      });

      return {
        'id': o.datastreamid,
        'name': o.datastreamname,
        'lineWidth': (index === 0) ? 5 : 1,
        'originalData': originalData,
        //'yAxis': (index === 0) ? 0 : index,
        'dashStyle': (index === 0) ? 'shortdash' : 'solid',
        'data': _.map(o.data, function(o, key) {
          return [o.date.toUTC(), values[key]];
        })
      };
    }).sortBy(function(o) {
      if (shifts && shifts.shifts) {
        shift = _.find(shifts.shifts, function(s) {
          return s.datastreamname === o.name;
        });
      }

      return (shift && shift.shiftfactor) ? shift.shiftfactor + shift.datastreamid : -1;
    }).value();

    ////console.log('what is originalData >>>>', originalData);
    Highcharts.Point.prototype.tooltipFormatter = function(useHeader) {
      var point = this,
        series = point.series;
      ////console.log('HERE TOOLTIP >>',series.name, point.y, series.options.originalData[series.name][point.y]);
      return ['<span style="color:' + series.color + '">', (point.name || series.name), '</span>: ',
        (!useHeader ? ('<b>x = ' + (point.name || point.x) + ',</b> ') : ''),

        '<b>', (!useHeader ? 'y = ' : ''), Highcharts.numberFormat(series.options.originalData[series.name][point.y], 2), '</b><br/>'].join('');

    };


    var chartOptions = {
      'chart': {
        'type': 'spline',
        backgroundColor: null,
        height: 500,
        zoomType: 'xy' //add back zoom
      },
      'title': {
        'text': ''
      },
      'yAxis': {
        'title': {
          'text': 'Value'
        },
        'labels': {
          'enabled': true
        }
      },
      navigator: {
        series: {
          color: '#1abc9c',
          lineColor: '#16a085'
        }
      },
      //http://api.highcharts.com/highcharts#plotOptions.series.events.legendItemClick
        plotOptions: {
            series: {//for series, vs line, column etc
                events: {
                    legendItemClick: function (event) {
                        //var gtoggle = $("input[name='my-checkbox']").val();
                        var gtoggle = $("input[name='my-checkbox"+localTabCount+"']").is(":checked");
                        //console.log('localTabCount >>> ', localTabCount);
                        var visibility = this.visible ? 'visible' : 'hidden';
                        //console.log('Targeted series is currently: ' + visibility);
                        //console.log("gtoggle: "+gtoggle);
                        //console.log('done0', this.chart.series[0]);

                        //Step 1. Set the target indexes
                        var targetIndex = event.target._i;

                        if(targetIndex === 0) return false;//return if reference is clicked

                        var _min = event.target.dataMin, _max = event.target.dataMax;

                        var targetSibIndex = targetIndex+1;//assume next is sibling
                        if((event.target.name).indexOf("(shifted)") > -1){//contains shifted?
                          targetSibIndex = targetIndex-1;//get previous element (sibling)

                          _min = this.chart.series[targetSibIndex].dataMin;//make sure to get original's min&max
                          _max = this.chart.series[targetSibIndex].dataMax;
                        }
                        var visibilitySib = this.chart.series[targetSibIndex].visible;
                        //console.log('Sibling currently: ' + visibilitySib);

                        /*if(gtoggle && this.chart.series[targetSibIndex]){
                          _min = Math.min(event.target.dataMin, this.chart.series[targetSibIndex].dataMin);
                          _max = Math.max(event.target.dataMax, this.chart.series[targetSibIndex].dataMax);
                        }*/

                        // Step 2. Reset to make all visible
                        $(this.chart.series).each(function(index, value){
                              this.setVisible(true, true);//second false to not redraw each one
                        });
                        //this.chart.redraw();//redraw all at once

                        //if (!confirm('The series is currently ' +
                        //             visibility + '. Do you want to change that?')) {

                        //this.chart.series[event.target._i].name
                        //event.target.name - gives me the current clicked target
                        //event.target.data
                        //event.target.dataMin
                        //event.target.dataMax

                        // Step 1. Hide all series
                        $(this.chart.series).each(function(index, value){
                            var size = this.chart.series.length-1;
                            //console.log('size: ', size);
                            //console.log('index0: ', index);
                            if(index !== 0 && index !== size){//if not ref line, this.chart.series.length-1 === 'navigator'
                            //console.log('inside...: ');
                              if(gtoggle){ //SHOW BOTH = TRUE
                                //Do not hide if it's ref (index=0), the target clicked, or it's sibling
                                if(index !== targetIndex && index !== targetSibIndex){
                                  //console.log('this.chart.series.length: ', this.chart.series.length);
                                  //console.log('index1: ', index);
                                  //console.log('targetIndex1: ', targetIndex);
                                  //console.log('targetSibIndex1: ', targetSibIndex);
                                  this.setVisible(false, false);//second false to not redraw each one
                                }
                              }
                              else{//SHOW BOTH = FALSE

                                /*
                                console.log('targetIndex: ', targetIndex);
                                console.log('targetSibIndex: ', targetSibIndex);
                                console.log('visibility: ', visibility);
                                console.log('visibilitySib: ', visibilitySib);*/
                                if(index === targetIndex){//target was hidden
                                  if( visibility === 'visible' ){
                                    //console.log('index2: ', index);
                                    this.setVisible(false, false);//second false to not redraw each one
                                  }
                                }
                                else if(index === targetSibIndex && visibilitySib){
                                  //do nothing as it's already visible
                                }
                                else{// hide everyting else
                                  //console.log('index3: ', index);
                                  this.setVisible(false, false);//second false to not redraw each one
                                }

                              }
                            }
                        });
                        //this.chart.redraw();//redraw all at once

                        // Step 2. get new nomalized data set for reference line from min and max of clicked series.
                        var _parent = this;
                        function asyncEvent() {
                          var dfd = jQuery.Deferred();
                          //console.log('done _min: ', _min);
                          //console.log('done _max: ', _max);
                          //console.log('done new 1: ', _parent.chart.series[0]);
                          var newData = _.chain(_parent.chart.series[0].data).pluck('y').normalize([_min, _max]).value();//get new normalized y dataset
                          //console.log('done new 2: ',newData);
                          if(newData){
                              dfd.resolve( newData );
                          }else{
                            dfd.reject( newData );
                          }
                          // Return the Promise so caller can't change the Deferred
                        //  console.log('done1');
                          return dfd.promise();
                        }
                        $.when( asyncEvent() ).then(function( ydata ) {
                          //console.log('done2', ydata);
                          //_parent.chart.series[0].setData(data);
                          $(ydata).each(function(index, value){
                            //console.log('index:', index);
                            //console.log('value', value);
                            _parent.chart.series[0].data[index].update(value, false);//false not draw yet
                          });
                          //now redraw at once
                          _parent.chart.redraw();
                          console.log(_parent.chart.series[0]);
                        });


                        return false;//false will not continue with the chart's action - like hidding series
                    }
                }
            }
        },
      'rangeSelector': {
        'enabled': true,
        'selected': 5,
        inputPosition: {
          'align': 'right',
          'verticalAlign': 'top'
        },
        inputDateFormat: '%Y-%m-%d',
        inputEditDateFormat: '%Y-%m-%d'
      },
      'legend': {
        'enabled': true,
        'borderWidth': 0,
        'width': 300,
        verticalAlign: 'top',
        adjustChartSize: true,
        itemWidth: 300,
        align: 'right',
        y: 50,
        style: {
            fontWeight: 'bold',
            color: '#333',
            fontSize: '18px'
        }
      },
      credits: {
        enabled: true
      },

      colors: [
        '#1abc9c', // turqoise
        '#3498db', // peter-river
        '#2980b9', // belize-hole
        '#9b59b6', // amethyst
        '#8e44ad', // wisteria
        '#f1c40f', // sun-flower
        '#f39c12', // orange
        '#2ecc71', // emerald
        '#27ae60', // nephritis
        '#e74c3c', // alizarin
        '#c0392b', // pomegranate
        '#1abc9c', // turqoise
        '#16a085', // green-sea
        '#e67e22', // carrot
        '#d35400', // pumpkin
        '#34495e', // wet-asphalt
        '#2c3e50' // mignight-blue
      ],

      'series': series
    };

    //activate the bootstrap-switch
    $("[name='my-checkbox"+localTabCount+"']").bootstrapSwitch();
    //console.log('adding localTabCount >>2> ', localTabCount);
    return chartOptions;
  },

  getSequenceChartOptions: function(data) {
    console.log('[App] renderSequenceChart');

    var colors = [
      '#1abc9c', // turqoise
      '#3498db', // peter-river
      '#9b59b6', // amethyst
      '#e67e22', // carrot
      '#34495e', // wet-asphalt
      '#e74c3c', // alizarin
      '#16a085', // green-sea
      '#2980b9', // belize-hole
      '#8e44ad', // wisteria
      '#d35400', // pumpkin
      '#2c3e50', // mignight-blue
      '#c0392b', // pomegranate
      '#f1c40f', // sun-flower
      '#27ae60', // nephritis
      '#f39c12' // orange
    ];


    var reference = {
        'datastreamid': data.datapoints[0].datastreamid,
        'datastreamname': data.datapoints[0].datastreamname,
        'pecentagecorrelated': 100,
        'shiftfactor': 0,
        //'borderColor': '#000',
        //'borderWidth': 2,
        'pointWidth': 20
      },
      sequencedata = _.chain([data.autocorrelate.shifts, reference]).flatten().sortBy(function(o) {
        return o.shiftfactor;
      }).map(function(o, index) {
        var color = colors[index];

        var y = parseFloat(o.pecentagecorrelated.toFixed(2), 10);
        if (o.negativecorrelation)
          y *= -1;
        var ret = {
          'category': o.shiftfactor,
          'series': {
            'name': o.datastreamname,
            'color': color,
            'pointWidth': reference.pointWidth,
            'y': y,
            'borderColor': o.borderColor || color // Outline any bars with red if negatively correlated
          }
        };
        //if (o.negativecorrelation) ret.series.borderWidth = 2;
        return ret;
      }).value(),
      categories = _.range(
      _.min(sequencedata, function(o) {
        return o.category;
      }).category,
      _.max(sequencedata, function(o) {
          return o.category;
        }).category + 1,
      1
      ),
      series = _.chain(sequencedata).map(function(o) {
        var data = _.map(categories, function(o) {
          return 0;
        });
        data[categories.indexOf(o.category)] = o.series;

        return {
          'name': o.series.name,
          'data': data,
          'pointWidth': o.series.pointWidth
        };
      }).value();

    if (!categories.length) {
      categories = [0];
    }

    /* Reverse the order. This can be optimized later. */
    categories = _.sortBy(categories, function(o, key) {
      return -key;
    });
    series = _.map(series, function(oSeries, kSeries) {
      oSeries.data = _.sortBy(oSeries.data, function(oData, kData) {
        return -kData;
      });
      return oSeries;
    });

    var chartOptions = {
      'chart': {
        'type': 'column',
        backgroundColor: null
      },
      colors: colors,
      'title': {
        'text': ''
      },
      'xAxis': {
        categories: categories,
        'title': {
          'text': 'Event Sequence (' + data.params.shiftType + ')'
        },
        labels: {
          formatter: function() {
            return categories[this.value];
          }
        }
      },
      'yAxis': {
        'title': {
          'text': 'Percentage Correlated'
        },
        'max': 100
      },
      tooltip: {
        shared: false,
        'formatter': function() {
          return '<b>' + this.series.name + '</b>: ' + this.y;
        }
      },
      scrollbar: {
        enabled: false
      },
      'useStockChart': true,
      'navigator': {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },
      'legend': {
        'enabled': true,
        'layout': 'vertical',
        'align': 'center',
        'verticalAlign': 'bottom',
        'borderWidth': 0,
        'width': 300,
        y: 0
      },
      credits: {
        enabled: false
      },
      'series': series
    };

    return chartOptions;
  },

  getBestPredictorChartOptions: function(data) {
    console.log('[App] renderBestResultsChart');

    var colors = [
      '#1abc9c', // turqoise
      '#3498db', // peter-river
      '#9b59b6', // amethyst
      '#e67e22', // carrot
      '#34495e', // wet-asphalt
      '#e74c3c', // alizarin
      '#16a085', // green-sea
      '#2980b9', // belize-hole
      '#8e44ad', // wisteria
      '#d35400', // pumpkin
      '#2c3e50', // mignight-blue
      '#c0392b', // pomegranate
      '#f1c40f', // sun-flower
      '#27ae60', // nephritis
      '#f39c12' // orange
    ];

    var factors, arr, categories, series;

    var chartOptions = jQuery.extend(true, {}, {
      'chart': {
        'type': 'column',
        backgroundColor: null
      },
      colors: colors,
      'title': {
        'text': ''
      },
      xAxis: {
        'title': {
          'text': 'Time Shift (' + data.params.shiftType + ')'
        },
        labels: {
          formatter: function() {
            return categories[this.value];
          }
        }
      },
      'yAxis': {
        'title': {
          'text': 'Percentage Correlated'
        },
        'max': 100
      },
      'tooltip': {
        shared: false,
        'formatter': function() {
          return '<b>' + this.series.name + '</b>: ' + this.y;
        }
      },
      scrollbar: {
        enabled: false
      },
      'useStockChart': true,
      'navigator': {
        enabled: false
      },
      rangeSelector: {
        enabled: false
      },
      'legend': {
        'enabled': true,
        'layout': 'vertical',
        'align': 'center',
        'verticalAlign': 'bottom',
        'borderWidth': 0,
        'width': 300,
        y: 0
      },
      credits: {
        enabled: false
      }
    });

    if (data && data.autofactorreduce && data.autofactorreduce.factors) {
      factors = _.clone(data.autofactorreduce.factors);
      factors.push({
        'datastreamid': data.datapoints[0].datastreamid,
        'datastreamname': data.datapoints[0].datastreamname + ' (Reference)',
        'negativecorrelation': false,
        'percentagecorrelated': 100,
        'rank': 0,
        'shiftfactor': 0,
        //'color': '#1abc9c',
        //'borderColor': '#000',
        'borderWidth': 0,
        'pointWidth': 20
      });

      factors = _.sortBy(factors, function(o) {
        return o.shiftfactor;
      });

      arr = _.map(_.range(factors.length), function() {
        return 0;
      });

      categories = _.pluck(factors, 'shiftfactor');
      series = _.map(factors, function(o, key) {
        var ret,
          data = _.clone(arr);

        data[key] = parseFloat(Math.abs(o.percentagecorrelated).toFixed(2), 10);

        if (o.negativecorrelation) {
          data[key] *= -1;
        }

        ret = {
          'name': o.datastreamname,
          'data': data
        };

        if (o.negativecorrelation) {
          //ret.borderColor = '#e74c3c';
          //ret.borderWidth = 2
        }

        ret.color = colors[key];
        ret.pointWidth = 20;

        return ret;
      });

      /* Reverse the order. This can be optimized later. */
      categories = _.sortBy(categories, function(o, key) {
        return -key;
      });
      series = _.map(series, function(oSeries, kSeries) {
        oSeries.data = _.sortBy(oSeries.data, function(oData, kData) {
          return -kData;
        });
        return oSeries;
      });
      chartOptions.xAxis.categories = categories;
      chartOptions.series = series;

    } else {
      chartOptions.xAxis.categories = [];
      chartOptions.series = [];
    }

    return chartOptions;
  },

 /*EXISTING WORKSHEETS*/
  buildWorksheetInTab: function(data, tabSelector) {
    $('.analyze-section.section-trending').hide()
    $(tabSelector + ' .trending-charts').show();
    $(tabSelector + ' #trendingChartLoader').hide();

    if(typeof data.data === 'string'){
      data.data = JSON.parse(data);
    }
    //RENDERS THE TABLES
    this.renderBestPredictorModelTable($(tabSelector + ' .best-predictor-table'), data.data);
    this.renderTopCorrelationTable($(tabSelector + ' .correlation-table'), data.data);
    this.renderTopCorrelationTable($(tabSelector + ' .sequence-table'), data.data);
    //sort data.data base on order from this.sortOrderIDs
    /*var temp = [];
    _.each(this.sortOrderIDs, function(element, index, list){
        temp.push( _.find(data.data.datapoints, function(chr) {
          return chr.datastreamid == element;
        }) );
    });
    console.log('temp final:', temp);
    data.data.datapoints = $.merge([_.first(data.data.datapoints)], temp);
    data.data.datapoints_shifted = $.merge([_.first(data.data.datapoints_shifted)], temp);*/
    //RENDERS THE CHARTS
    this.renderChart($(tabSelector + ' .correlation-chart'), this.getCorrelationChartOptions(data.data));
    this.renderChart($(tabSelector + ' .sequence-chart'), this.getSequenceChartOptions(data.data));

    console.log(data.data.autofactorreduce);

    if (data.data.autofactorreduce.error) {
      //display error messages...
      var errorMessage = 'Error: ' + data.data.autofactorreduce.error.code + ' - ' + data.data.autofactorreduce.error.message;
      errorMessage += '<br/>Modify the snapshot parameters to increase the number of data set rows and/or decrease the number of data sets in the analysis.';
      $('#best-predictor-chart-tab' + (this.chartContainerCount - 1) + ' #best-predictor-error').html(errorMessage);
      $('#best-predictor-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').show();
      $(tabSelector).find('.trending-charts ul li a[href^="#best-predictor"]').addClass('icon-warning-sign');

      $('#forecast-chart-tab' + (this.chartContainerCount - 1) + ' #forecast-error').html(errorMessage);
      $('#forecast-chart-tab' + (this.chartContainerCount - 1) + ' .analyze-error').show();
      $(tabSelector).find('.trending-charts ul li a[href^="#forecast"]').addClass('icon-warning-sign');

      if(data.data.autofactorreduce.error.code === 1010){
        $('#analyze-error-message')
          .text('Error: ' + data.data.autofactorreduce.error.message)
          .show(); 
      }
    } else {
      $('#analyze-error-message').hide();
      this.renderChart($(tabSelector + ' .best-predictor-chart'), this.getBestPredictorChartOptions(data.data));
      var chartOptions = this.getCorrelationChartOptions(data.data);
      this.renderChart($(tabSelector + ' .forecast-chart'), chartOptions);
      //this.renderBestPredictorModelTable($(tabSelector + ' .best-predictor-table'), data.data);
      data.data.chartOptions = chartOptions;
      this.renderForecastEqualizer($(tabSelector + ' .forecast-equalizer'), data.data);
    }
  },

/*LH*/
  copyChartsToTab: function(tabSelector) {
    $(tabSelector).find('.trending-charts').show();
    this.renderBestPredictorModelTable($('.best-predictor-table' + (this.chartContainerCount - 1)), this.getSavedBestPredictorModelTableData());
    this.renderTopCorrelationTable($('.correlation-table' + (this.chartContainerCount - 1)), this.getSavedTopCorrelationData());
    this.renderTopCorrelationTable($('.sequence-table' + (this.chartContainerCount - 1)), this.getSavedTopCorrelationData());


    this.renderChart($('.correlation-chart' + (this.chartContainerCount - 1)), this.getSavedCorrelationChartOptions());
    this.renderChart($('.best-predictor-chart' + (this.chartContainerCount - 1)), this.getSavedBestPredictorChartOptions());
    this.renderChart($('.sequence-chart' + (this.chartContainerCount - 1)), this.getSavedSequenceChartOptions());

  },

  onDateChange: function() {
    this.calculateAdjustedDates();
    this.validateForm();
    var startDate = $('.field-start-date').val();
    var endDate = $('.field-end-date').val();
    var currentSnapshot = $('.btn-tab.active').find('span.name').text();
    var snapshotData = store.get(currentSnapshot);
    if (!snapshotData) {
      snapshotData = {};
    }
    snapshotData.startDate = startDate;
    snapshotData.endDate = endDate;
    store.set(currentSnapshot, snapshotData);
  },

  onOffsetChange: function(e) {

    this.calculateAdjustedDates();
    this.validateForm();
  },

  calculateAdjustedDates: function() {
    var start = Date.parseExact($('.field-start-date').val(), 'yyyy-MM-dd');
    var end = Date.parseExact($('.field-end-date').val(), 'yyyy-MM-dd');

    var offset = $('.field-offset-limit').val();
    var offsetType = $('.field-offset-type').select2('val');

    if (start !== null && end !== null && $.isNumeric(offset)) {

      offset = parseInt(offset);

      if (offset != 0) {
        if (offsetType === 'day') {
          start.add({
            days: offset * -1
          });
          end.add({
            days: offset
          });
        }
        if (offsetType === 'week') {
          start.add({
            days: offset * 7 * -1
          });
          end.add({
            days: offset * 7
          });
        }
        if (offsetType === 'month') {
          start.add({
            months: offset * -1
          });
          end.add({
            months: offset
          });
        }
        if (offsetType === 'year') {
          start.add({
            years: offset * -1
          });
          end.add({
            years: offset
          });
        }
      }

      var startString = start.toString('yyyy-MM-dd');
      var endString = end.toString('yyyy-MM-dd');

      $('.adjusted-start-date', this.optionsSelector).val(startString);
      $('.adjusted-end-date', this.optionsSelector).val(endString);
    }
  },

  validateForm: function() {
    var _this = this;

    this.clearOptionErrors();

    var start = Date.parseExact($('.field-start-date').val(), 'yyyy-MM-dd');
    var end = Date.parseExact($('.field-end-date').val(), 'yyyy-MM-dd');
    var effectiveStart = Date.parseExact($('.adjusted-start-date').val(), 'yyyy-MM-dd');
    var effectiveEnd = Date.parseExact($('.adjusted-end-date').val(), 'yyyy-MM-dd');

    if (start === null) {
      $('.field-start-date').addClass('error').after('<small class="label label-important error error-message">Invalid Date</small>');
    }

    if (end === null) {
      $('.field-end-date').addClass('error').after('<small class="label label-important error error-message">Invalid Date</small>');
    }

    if (!$.isNumeric($('.field-offset-limit').customspinner('value'))) {
      $('.field-offset-limit').addClass('error');
    }

    // validate reference data ranges
    $('.field-reference-data').find('option:selected').each(function(i, el) {
      if (parseInt($(el).val() === 0)) return;
      var optionStart = Date.parse(dateToUTC(new Date($(el).data('start'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');
      var optionEnd = Date.parse(dateToUTC(new Date($(el).data('end'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');

      if (start.compareTo(optionStart) < 0) {
        _this.addOptionWarning($(el).text() + ' data begins on ' + optionStart.toString('yyyy-MM-dd'));
      }
      if (end.compareTo(optionEnd) > 0) {
        _this.addOptionWarning($(el).text() + ' data ends on ' + optionEnd.toString('yyyy-MM-dd'));
      }
    });

    // validate test-data ranges
    $('.field-test-data').find('option:selected').each(function(i, el) {
      if (parseInt($(el).val()) === 0) return;
      var optionStart = Date.parse(dateToUTC(new Date($(el).data('start'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');
      var optionEnd = Date.parse(dateToUTC(new Date($(el).data('end'))).toString('yyyy-MM-dd'), 'yyyy-MM-dd');

      if (effectiveStart.compareTo(optionStart) < 0) {
        _this.addOptionWarning($(el).text() + ' data begins on ' + optionStart.toString('yyyy-MM-dd'));
      }
      if (effectiveEnd.compareTo(optionEnd) > 0) {
        _this.addOptionWarning($(el).text() + ' data ends on ' + optionEnd.toString('yyyy-MM-dd'));
      }
    });

    if (start.compareTo(end) >= 0) {
      this.addOptionError('Analysis Start Date must occur before Analysis End Date');
    }

    if (this.hasOptionErrors()) {
      $('.btn-submit', this.optionsSelector).addClass('disabled').attr('disabled', 'disabled');
      return false;
    } else {
      $('.btn-submit', this.optionsSelector).removeClass('disabled').removeAttr('disabled');
      return true;
    }
  },

  validateReferenceAndTestData: function() {
    this.validateForm();

    var valid = true;
    if ($('.field-test-data').find('option:selected').length == 0) {
      this.addOptionError('You must select Test Data to Analyze.');
      valid = false;
    }
    if ($('.field-reference-data').find('option:selected').val() == 0) {
      this.addOptionError('You must select Reference Data to Analyze.');
      valid = false;
    }

    return valid;
  },

  addOptionError: function(msg) {
    $('.errors', this.optionsSelector).append('<div class="flat-alert flat-alert-error flat-alert-thin"><i class="icon-ban-circle"></i> ' + msg + '</div>');
  },

  addOptionWarning: function(msg) {
    $('.errors', this.optionsSelector).append('<div class="flat-alert flat-alert-thin"><i class="icon-warning-sign"></i> ' + msg + '</div>');
  },

  clearOptionErrors: function() {
    $('.field-start-date', this.optionsSelector).removeClass('error').parent().find('.error-message').remove();
    $('.field-end-date', this.optionsSelector).removeClass('error').parent().find('.error-message').remove();
    $('.field-offset-limit', this.optionsSelector).removeClass('error');
    $('.errors', this.optionsSelector).html('');
  },

  hasOptionErrors: function() {
    return $(this.optionsSelector).find('.error, .flat-alert-error').length > 0;
  },

  getQuarter: function(d) {
    var d = d || new Date();
    var q = [1, 2, 3, 4];
    return q[Math.floor(d.getMonth() / 3)];
  },

  getFirstMonthOfQuarter: function(q) {
    return ((q - 1) * 3);
  },

  onPresetDateClick: function() {
    var preset = $(this).data('preset');

    var $start = $('.field-start-date');
    var $end = $('.field-end-date');
    var start = Date.parseExact($start.val(), 'yyyy-MM-dd');
    var end = Date.parseExact($end.val(), 'yyyy-MM-dd');

    if (preset === 'today') {
      start = Date.today();
      end = Date.today();
    }
    if (preset === 'ytd') {
      start = Date.today().set({
        month: 0,
        day: 1
      });
      end = Date.today();
    }
    if (preset === 'qtd') {
      start = Date.today().set({
        month: this.getFirstMonthOfQuarter(this.getQuarter()),
        day: 1
      });
      end = Date.today();
    }
    if (preset === 'mtd') {
      start = Date.today().moveToFirstDayOfMonth();
      end = Date.today();
    }
    if (preset === 'wtd') {
      start = Date.today().moveToDayOfWeek(0, -1);
      end = Date.today();
    }

    if (preset === 'last-year') {
      start = Date.today().add({
        years: -1
      }).set({
        month: 0,
        day: 1
      });
      end = Date.today().add({
        years: -1
      }).set({
        month: 11
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-quarter') {
      var firstMonthOfCurrentQuarter = this.getFirstMonthOfQuarter(this.getQuarter());
      var dateInLastQuarter = Date.today().set({
        month: firstMonthOfCurrentQuarter,
        day: 1
      }).add({
        days: -1
      });
      var firstMonthOfLastQuarter = this.getFirstMonthOfQuarter(this.getQuarter(dateInLastQuarter));
      var lastMonthOfLastQuarter = firstMonthOfLastQuarter + 2;
      start = Date.today().set({
        month: firstMonthOfLastQuarter,
        day: 1
      });
      end = Date.today().set({
        month: lastMonthOfLastQuarter
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-month') {
      start = Date.today().add({
        months: -1
      }).set({
        day: 1
      });
      end = Date.today().add({
        months: -1
      }).moveToLastDayOfMonth();
    }
    if (preset === 'last-week') {
      start = Date.today().moveToDayOfWeek(0, -1).add({
        days: -1
      }).moveToDayOfWeek(0, -1);
      end = Date.today().moveToDayOfWeek(0, -1).add({
        days: -1
      }).moveToDayOfWeek(0, -1).add({
        days: 6
      });
    }

    $start.val(start.toString('yyyy-MM-dd'));
    $end.val(end.toString('yyyy-MM-dd'));

    this.calculateAdjustedDates();
    this.validateForm();

    var $dropdown = $('#preset-dates', this.optionsSelector);
    if ($dropdown.hasClass('open')) {
      $('a[data-dropdown="' + $dropdown.attr('id') + '"]').trigger('click');
    }
  },

  toggleTrendingOptions: function(e) {
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
  }
});


var ForecastView = Backbone.View.extend({

    el: $('#container'),

    //template: hbs.handlebars.compile($('#forecast-equalizer-template')),

    events: {
      'click .solve': 'solveHandler',
      'change .forecast': 'forecastChangeHandler',
      'keyup .forecast' : 'forecastKeyUpHandler',
      'keydown .forecast': 'forecastKeyDownHandler',
      'click .btn-scenario': 'scenarioBtnHandler',
      'slide .forecast-slider': 'forecastSlideHandler',
      'slidechange .forecast-slider': 'forecastSlideChangeHandler',
      'click .btn-reset-scenario': 'resetScenarioHandler',
      'click .btn-save-scenario' : 'saveScenarioHandler',
      'click .btn-rename-scenario': 'renameScenarioHandler',
      'click .btn-copy-scenario' : 'copyScenarioHandler',
      'click .btn-scenario .icon-remove-sign': 'removeScenarioHandler'
    },

    initialize: function(options) {
      console.log('Forecast options', options);
      this.parent = options.parent;
      _.bindAll(this, 'render');
      this.render();
    },

    render: function() {
      console.log('forecast ready');

    },

    removeScenarioHandler: function(e) {
      var self = this;
      e.stopPropagation();

      var $scenarioTab = $(e.currentTarget).closest('button');
      if ($scenarioTab.hasClass('active')) {
        var $scenarioContent = $($scenarioTab.data('section'));
        var $scenarioToolbar = $(e.currentTarget).closest('.btn-toolbar');

        var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
        // remove
        self.deleteScenario($scenarioContainer, function(response) {
          if (response.success) {
            $scenarioTab.remove();
            $scenarioContent.remove();
            //default action displays the baseline when a scenario is removed
            $scenarioToolbar.find("button[data-section='#forecast-scenario-baseline']").click();
            toast.notifySuccess('Success', 'Scenario removed successfully.');
          } else {
            toast.notifyError('Error', 'Unable to remove scenario.');
          }
        });
      }
    },

    copyScenarioHandler: function(e) {
      //create the new tab
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      var tabId = $scenarioContainer.find('.btn-group.scenario button:last').data('section');
      if (tabId == null) {
        this.parent.tabCount = 0;
      } else {
        this.parent.tabCount = parseInt(tabId.replace('#forecast-scenario-tab', ''));
        this.parent.tabCount++;
      }

      var tabName = $scenarioContainer.find('.btn-scenario.active span.name').text();
      var newTabName = 'New Scenario ' + (this.parent.tabCount + 1);
      var $scenarioTab = $('<button class="btn btn-scenario" data-section="#forecast-scenario-tab' + this.parent.tabCount + '"><i class="status"></i>&nbsp;<span class="name">' + newTabName + '</span> &nbsp;&nbsp; <i class="icon-remove-sign"></i></button>');
      $scenarioContainer.find('.btn-group.scenario').append($scenarioTab);

      //deep copy the content
      var $existingScenario = $scenarioContainer.find('.tab-pane.active.scenario');
      //cloning event handlers does not work successfully so clone without events and data
      var $newScenario = $scenarioContainer.find('.tab-pane.active.scenario').clone();
      $existingScenario.removeClass('active');
      $newScenario.attr('id', 'forecast-scenario-tab' + this.parent.tabCount);
      $newScenario.removeClass('baseline');
      $newScenario.addClass('user');
      //remove existing slider range element, it will be recreated when initializing the slider
      $newScenario.find('.forecast-slider div.ui-slider-range').remove();
      $scenarioContainer.find('#scenario-content').append($newScenario);

      //restore properties and data
      var $insertedScenario = $scenarioContainer.find('.tab-pane.active.scenario');
      var $slider = $insertedScenario.find('.forecast-slider');
      var $forecast = $insertedScenario.find('.forecast');
      for (var i = 0; i < $newScenario.find('.forecast-slider').length; i++) {
        //initialize slider
        var minValue = $($existingScenario.find('.forecast-slider')[i]).slider('option', 'min');
        var paramValue = $($existingScenario.find('.forecast-slider')[i]).slider('option', 'value');
        var maxValue = $($existingScenario.find('.forecast-slider')[i]).slider('option', 'max');
        var step = $($existingScenario.find('.forecast-slider')[i]).slider('option', 'step');
        var disabled = $($existingScenario.find('.forecast-slider')[i]).slider('option', 'disabled');
        $($slider[i]).slider({
          "orientation": "horizontal",
          "range": "min",
          "min": minValue,
          "max": maxValue,
          "value": paramValue,
          "disabled": disabled,
          "step": step
        });
        var color = $($existingScenario.find('.forecast-slider')[i]).find("div.ui-slider-range").css("background-color");
        $($slider[i]).find("div.ui-slider-range").css("background-color", color);

        //initialize forecast input
        if (i == 0) {
          var intercept = $($existingScenario.find('.forecast')[i]).data('intercept');
          var residualStandardError = $($existingScenario.find('.forecast')[i]).data('residualstandarderror');
          var degreesOfFreedom = $($existingScenario.find('.forecast')[i]).data('degreesoffreedom');
          var baselineMatrix = $($existingScenario.find('.forecast')[i]).data('baselinematrix');
          $($forecast[i]).data('intercept', intercept);
          $($forecast[i]).data('residualstandarderror', residualStandardError);
          $($forecast[i]).data('degreesoffreedom', degreesOfFreedom);
          $($forecast[i]).data('baselinematrix', baselineMatrix);
        } else {
          var coefficient = $($existingScenario.find('.forecast')[i]).data('coefficient');
          $($forecast[i]).data('coefficient', coefficient);
        }
        var resetValue = $($existingScenario.find('.forecast')[i]).data('resetvalue');
        $($forecast[i]).data('resetvalue', resetValue);
      }

      $insertedScenario.find('[data-toggle=tooltip]').tooltip({
        container: 'body'
      });
      /*$insertedScenario.find(".test-data").tablesorter({
       //sort by rank - third column, order asc
       sortList: [[2,0]],
       headers: {
       4: {sorter: false},
       5: {sorter: false},
       6: {sorter: false}
       }
       });*/

      //Initialize scenario table manipulation
      var sort = [];
      $existingScenario.find('table.test-data th').each(function(index) {
        if ($(this).hasClass('sorting_asc')) {
          sort.push([index, 'asc']);
        }
        if ($(this).hasClass('sorting_desc')) {
          sort.push([index, 'desc']);
        }
      });
      $insertedScenario.find('.table.test-data').dataTable({
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": false,
        "bSort": true,
        "bInfo": false,
        "bAutoWidth": false,
        "aaSorting": sort, //[[ 2, "asc" ]],
        "aoColumns": [
          /* Test Data */ null,
          /* Time Shift */ null,
          /* Forecast Date */ null,
          /* Confidence Interval */ null,
          /* Slider */ {
            "bSearchable": false,
            "bSortable": false
          },
          /* Forecast */ {
            "bSearchable": false,
            "bSortable": false
          }
        ]
      });

      $scenarioContainer.find("button[data-section='#forecast-scenario-tab" + this.parent.tabCount + "']").click();

      var $scenarioTab = $scenarioContainer.find('.btn-scenario');
      var scenarioNames = $scenarioTab.find('span.name').map(function() {
        return $(this).text();
      }).get();
      scenarioNames.pop();

      if (_.contains(scenarioNames, newTabName)) {
        //todo: the initial create is needy...cannot revert back to existing name because it exists...hmmmm
        $scenarioContainer.find('.btn-rename-scenario').click();
      } else {
        // create new
        this.createScenario($scenarioContainer, newTabName, function(response) {
          if (response.created) {
            toast.notifySuccess('Success', 'Scenario created successfully.');
            // place id on scenario tab
            $('.btn-scenario.active').append('<input id="forecastId" type="hidden" value="'+response.id+'">');
          } else {
            toast.notifyError('Error', 'Unable to save new scenario.');
          }
        });
      }
    },

    renameScenarioHandler: function(e) {
      var self = this;
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var currentTabName = $currentTab.find('span.name').text();
      var $scenarioTab = $scenarioContainer.find('.btn-scenario');
      var scenarioNames = $scenarioTab.find('span.name').map(function() {
        return $(e.currentTarget).text();
      }).get();

      bootbox.prompt('Rename Scenario', 'Cancel', 'Ok', function(tabName) {
        if (_.contains(scenarioNames, tabName)) {
          toastr.error("Scenario Name Already Exists", '<i class="icon-ban-circle"></i> <span>' + "Error" + '</span>');
          return;
        }
        if (tabName === null) {
          tabName = currentTabName;
        } else {
          // update (rename)
          self.updateScenarios($scenarioContainer, tabName, function(response) {
            if (response.success) {
              $currentTab.find('span.name').text(tabName);
              //$scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
              toast.notifySuccess('Success', 'Scenario renamed successfully.');
              self.updateStatus($scenarioContainer);
            } else {
              toast.notifyError('Error', 'Unable to rename scenario.');
            }
          });
        }
      }, currentTabName);
    },

    saveScenarioHandler: function(e, behavior) {
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      var $scenario = $(e.currentTarget).closest('#scenario-content').find('.active.scenario');
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var currentTabName = $currentTab.find('span.name').text();
      var self = this;
      // update
      this.updateScenarios($scenarioContainer, currentTabName, function(response) {
        if (response.success) {
          // update resetvalue attributes
          $scenario.find(".solve").data('resetvalue', '').attr('data-resetvalue', '');
          $scenario.find(".solving").data('resetvalue', 'true').attr('data-resetvalue', 'true');
          var elemForecast = $scenario.find('.forecast');
          for (i = 0; i < elemForecast.length; i++) {
            $(elemForecast[i]).data('resetvalue', $(elemForecast[i]).val());
          }
          toast.notifySuccess('Success', 'Scenario saved successfully.');
          $scenarioContainer.find('.btn.btn-scenario.active i.status').removeClass('icon-asterisk unsaved-indicator');
          self.updateStatus($scenarioContainer);
        } else {
          toast.notifyError('Error', 'Unable to save scenario.');
        }
      });
    },

    resetScenarioHandler: function(e) {
      var $scenario = $(e.currentTarget).closest('#scenario-content').find('.active.scenario');
      $scenario.find(".solve[data-resetvalue='true']").click();
      var elemForecast = $scenario.find('.forecast');
      for (i = 0; i < elemForecast.length; i++) {
        //reset the slider and input field value
        $(elemForecast[i]).val($(elemForecast[i]).data('resetvalue'));
        $(elemForecast[i]).change();
      }

      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      $scenarioContainer.find('.btn.btn-scenario.active i.status').removeClass('icon-asterisk unsaved-indicator');
      this.updateStatus($scenarioContainer);
    },

    forecastSlideChangeHandler: function(e, ui) {
      var $scenario = $(e.currentTarget).closest('#scenario-content .tab-pane.scenario');
      var $solveRow = $scenario.find('.solving').closest('tr');
      var existingResult = parseFloat($solveRow.find('.forecast').val());
      //todo: use the data object rather than the container
      var result = this.solve($scenario);
      if (result != existingResult) {
        //update with the new solution
        $solveRow.find('.forecast').val(result);
        $solveRow.find('.forecast-slider').slider('value', result);

        //update the ui confidence interval
        var range = $scenario.find('.forecast-slider:first').slider('option', 'max');
        var min = $scenario.find('.forecast-slider:first').slider('option', 'min');
        var offset = parseFloat(min + (range - min) / 2);
        range += (range / 3);
        var bound = this.getBounds();
        var interval = bound.upper - bound.lower;

        if (isNaN(interval)) {
          $scenario.find('.confidenceWindow').hide();
        } else {
          //get percentage of range represented by the conf window
          var widthPercentage = 100 * (interval) / range;
          var dependent = this.getDependent();
          var leftPercentage = 100 * (dependent + offset) / range - .5 * widthPercentage;

          var places = 0;
          if ((result % 1) != 0) {
            places = result.toString().split(".")[1].length + 1;
          }

          $scenario.find('.confidenceWindow').css('width', widthPercentage + '%')
            .css('left', leftPercentage + '%')
            .attr('data-original-title', bound.lower.toFixed(places) + ' ... [\u00b1' + (interval / 2).toFixed(places) + '] ... ' + bound.upper.toFixed(places))
            .show();
        }
        var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
        $scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
        this.updateStatus($scenarioContainer);
      }
    },

    forecastSlideHandler: function(e, ui) {
      $(e.currentTarget).closest('tr').find('.forecast').val(ui.value);
    },

    scenarioBtnHandler: function(e) {
      var thisName = $(e.currentTarget).data('section');
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      $scenarioContainer.find('#scenario-content .scenario')
        .removeClass('active')
        .hide();
      $scenarioContainer.find('#scenario-content ' + thisName)
        .addClass('active')
        .show();
      $scenarioContainer.find('.btn-scenario').removeClass('active');
      $scenarioContainer.find('.btn-scenario[data-section="' + thisName + '"]').addClass('active');
      if ($(this).closest('.baseline').length > 0) {
        $scenarioContainer.find('#scenario-content .btn-save-scenario').hide()
        $scenarioContainer.find('#scenario-content .btn-rename-scenario').hide()
      } else {
        $scenarioContainer.find('#scenario-content .btn-save-scenario').show()
        $scenarioContainer.find('#scenario-content .btn-rename-scenario').show()
      }
    },

    forecastKeyDownHandler: function(e) {
      if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
      } else {
        // Ensure that it is a number and stop the keypress
        if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
          e.preventDefault();
        }
      }
    },

    forecastKeyUpHandler: function(e) {
      $(e.currentTarget).change();
    },

    forecastChangeHandler: function(e) {
      $(e.currentTarget).closest('tr').find('.forecast-slider').slider("value", $(e.currentTarget).prop('value'));
    },

    solveHandler: function(e) {
      var $scenario = $(e.currentTarget).closest('.scenario');
      $scenario.find('tr').removeClass('warning');
      $scenario.find('.solve').removeClass('icon-star')
        .removeClass('solving')
        .addClass('icon-star-empty')
        .attr('data-original-title', 'Click to solve for this test value');
      $scenario.find('.solve.dependent').attr('data-original-title', 'Click to solve for the reference value');
      $scenario.find('.forecast').prop("disabled", false);
      $scenario.find('.forecast-slider').slider("enable");
      //modify this member
      var $row = $(e.currentTarget).closest('tr');
      $row.addClass('warning');
      $row.find('.forecast-slider').slider("disable");
      $row.find('.forecast').prop("disabled", true);
      //$(this).closest('tr').find('.forecast-slider').slider("disable");
      //$(this).closest('tr').find('.forecast').prop("disabled", true);
      $(e.currentTarget).removeClass('icon-star-empty');
      $(e.currentTarget).addClass('icon-star');
      $(e.currentTarget).addClass('solving');
      if ($(e.currentTarget).hasClass('dependent')) {
        $(e.currentTarget).attr('data-original-title', 'Currently solving for the reference value');
      } else {
        $(e.currentTarget).attr('data-original-title', 'Currently solving for this test value');
      }
      var $scenarioContainer = $(e.currentTarget).closest('.scenarioContainer');
      $scenarioContainer.find('.btn.btn-scenario.active i.status').addClass('icon-asterisk unsaved-indicator');
      this.updateStatus($scenarioContainer);
    },

    alphaLevel: 0.025,
    residualStandardError: 0.0,
    intercept: 0.0,
    degreesOfFreedom: 0,
    startMatrix: [],
    startTransposeMatrix: [],
    sscpMatrix: [],
    sscpInverseMatrix: [],
    newMatrix: [],
    newTransposeMatrix: [],
    insideSquareRoot: 0.0,
    meanSquare: 0.0,
    tStatInv: 0.0,
    yPredicted: 0.0,
    upperBound: 0.0,
    lowerBound: 0.0,

    getBounds: function() {
      return {
        'lower': this.lowerBound,
        'upper': this.upperBound
      };
    },

    getDependent: function() {
      return this.yPredicted;
    },

    setBaselineMatrices: function(matrix) {
      if (matrix.length) {
        var baselineMatrix = new Array();
        for (var i = 0; i < matrix.length; i++) {
          baselineMatrix[i] = matrix[i];
        }
        var intercept = new Array();
        for (var i = 0; i < matrix[0].length; i++) {
          intercept.push(1);
        }
        baselineMatrix.unshift(intercept);
        this.startTransposeMatrix = baselineMatrix;
        //step 5 - Transpose
        this.startMatrix = jStat.transpose(this.startTransposeMatrix);
        return true;
      } else {
        return false;
      }
    },

    insertIntercept: function(matrix) {
      var intercept = new Array();
      for (var i = 0; i < matrix.length; i++) {
        matrix[i].unshift(1);
      }
    },

    setConfidenceInterval: function() {
      //purpose: Step through process to compute confidence interval

      //step 6 - Sum of Squares and Cross Products (SSCP)
      this.sscpMatrix = jStat.multiply(this.startTransposeMatrix, this.startMatrix);
      //step 7 - Inverse of the SSCP Matrix
      this.sscpInverseMatrix = jStat.inv(this.sscpMatrix);
      //step 8a - Create matrix of new variables
      this.newTransposeMatrix = jStat.transpose(this.newMatrix);
      //step 8b - Calculate inside square root
      var insideStepA = jStat.multiply(this.sscpInverseMatrix, this.newTransposeMatrix);
      var insideStepATranspose = jStat.transpose(insideStepA);
      this.insideSquareRoot = jStat.dot(insideStepATranspose, this.newMatrix);
      //step 9 - Calculate Mean Square Error
      this.meanSquareError = this.residualStandardError * this.residualStandardError;
      //step 10 - Calculate value inside square root
      this.insideSquareRootValue = Math.sqrt(this.meanSquareError * this.insideSquareRoot);
      //step 11 - Calculate t-statistic
      this.tStatInv = jStat.studentt.inv(this.alphaLevel, this.degreesOfFreedom);
      //step 12 - Calculate Prediction Value
      //yPredicted = 0; // should be previously solved
      //step 13 - Calculate lower bound
      var plusMinus = this.tStatInv * this.insideSquareRootValue;
      this.lowerBound = this.yPredicted - plusMinus;
      //step 14 - Calculate upper bound
      this.upperBound = this.yPredicted + plusMinus;
    },

    solve: function($scenario) {
      //accepts a jQuery object
      //creates a linear equation by iterating through forecast values
      //returns a value representing the solved linear equation
      var dependent = 0.0;
      var coefficient = [];
      var independents = 0.0;
      var error = 0.0;
      var forecast = $scenario.find('.forecast');
      //var intercept = 0.0;

      var result = 0.0;

      //TODO: use better data package than ui elements
      if (this.setBaselineMatrices($(forecast[0]).data('baselinematrix'))) {

        this.intercept = $(forecast[0]).data('intercept');
        this.residualStandardError = $(forecast[0]).data('residualstandarderror');
        this.degreesOfFreedom = $(forecast[0]).data('degreesoffreedom');


        var independent = [1];
        for (var i = 1; i < forecast.length; i++) {
          //independent.push(parseFloat($(forecast[i]).val()));
          independent.push(parseFloat($scenario.find('#forecast-' + i).val()));
        }
        this.newMatrix = independent;

        //TODO: Could jstat linear algebra library solve this more generically?

        var independent = [];
        if ($scenario.find('#solve-0').hasClass('solving')) {
          //solve for the dependent variable (reference data set)
          for (var i = 1; i < forecast.length; i++) {
            coefficient[i - 1] = $(forecast[i]).data('coefficient');
            independent[i - 1] = parseFloat($(forecast[i]).val());
            independents += coefficient[i - 1] * independent[i - 1];
          }
          result = this.yPredicted = this.intercept + independents + error;
        } else {
          //solve for an independent variable (test data sets)
          //TODO: use the high precision value rather than the integer display value as default.
          dependent = this.yPredicted = parseFloat($(forecast[0]).val());
          for (var k = 1; k < forecast.length; k++) {
            if ($scenario.find('#solve-' + k).hasClass('solving')) {
              var coefDivisor = $(forecast[k]).data('coefficient');
            } else {
              independents += $(forecast[k]).data('coefficient') * $(forecast[k]).val();
            }
          }
          result = (dependent - error - this.intercept - independents) / coefDivisor;
        }

        var places = 0;
        this.setConfidenceInterval();
        if (Math.abs(result) < 1) {
          places = 2;
        } else {
          if (Math.abs(result) < 10) {
            places = 1;
          }
        }

        return Math.round(result * Math.pow(10, places)) / Math.pow(10, places);
      } else {
        return 0;
      }
    },

    getScenarioState: function($scenarioContainer, action) {

      //return all current data of the active scenario as well as all the reset value data of all other scenarios
      //action is optional and can be 'rename' or 'remove'

      var $scenarioTab = $($scenarioContainer).find('.scenario-buttons.scenario');
      var scenarioNames = $scenarioTab.find('span.name').map(function() {
        if (action == 'remove' && $(this).closest('button').hasClass('active')) {
          //ignore to remove it
        } else {
          return {
            title: $(this).text()
          };
        }
      }).get();
      var data_scenario = {};
      data_scenario.titles = scenarioNames;
      data_scenario.factors = [];

      //todo: save the table sort order for each scenario
      //scrape each scenario interface to get current values of the active scenario and reset values of other scenarios
      $factorRows = $scenarioContainer.find('.tab-pane.scenario.baseline .factorRow');
      for (var factorIndex = 0; factorIndex < $factorRows.length; factorIndex++) {
        var thisFactor = {};
        thisFactor.state = [];

        $scenarioContainer.find('.tab-pane.scenario.user #factorRow-' + factorIndex).each(function(scenarioIndex) {
          var scenarioPane = $(this).closest('.tab-pane.scenario.user');
          if (action == 'remove' && $(scenarioPane).hasClass('active')) {
            //skip this one to delete it
          } else {
            var thisState = {};
            thisState.datasetId = $(this).find('.forecast').data('stream-id');
            if (action == '' && $(scenarioPane).hasClass('active')) {
              //this is the one we are saving, use current values
              if (factorIndex == 0) {
                thisState.alpha = $(this).find('.alpha').data('resetvalue');
                //thisState.alpha = $(this).find('.alpha').val();
              }
              thisState.value = $(this).find('.forecast').val();
              if ($(this).find('.solve').hasClass('solving')) {
                thisState.solveId = true;
              }
            } else {
              //use reset values for all other scenarios
              if (factorIndex == 0) {
                thisState.alpha = $(this).find('.alpha').data('resetvalue');
              }
              thisState.value = $(this).find('.forecast').data('resetvalue');
              if ($(this).find('.solve').data('resetvalue')) {
                thisState.solveId = true;
              }
            }
            thisFactor.state.push(thisState);
          }
        });
        if (thisFactor.state.length > 0) {
          data_scenario.factors.push(thisFactor);
        }
      }
      return data_scenario
    },

    updateScenarios: function($scenarioContainer, tabName, cb) {

      var data_scenario = this.getScenarioState($scenarioContainer, '');

      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var forecastId = $currentTab.find('#forecastId').val();
      var snapshotId = this.parent.getCurrentTab().find('input#worksheetId').val();

      var data = {
        name: tabName,
        data: JSON.stringify(data_scenario)
      }

      $.ajax({
        url: '/api/snapshots/'+snapshotId+'/forecasts/update/'+forecastId,
        data: data,
        method: 'post',
        dataType: 'json',
        success: cb
      });

    },

    deleteScenario: function($scenarioContainer, cb){
      var $currentTab = $scenarioContainer.find('.btn-scenario.active');
      var forecastId = $currentTab.find('#forecastId').val();

      var snapshotId = this.parent.getCurrentTab().find('input#worksheetId').val();

      $.ajax({
        url: '/api/snapshots/'+snapshotId+'/forecasts/delete/'+forecastId,
        method: 'get',
        dataType: 'json',
        success: cb
      });

    },

    createScenario: function($scenarioContainer, tabName, cb){
      var data_scenario = this.getScenarioState($scenarioContainer, '');
      var $tab = $('.tab-buttons .btn.active');
      // make sure $tab has a length of 1
      // var rawData = JSON.parse($tab.data('data_raw'));
      // rawData.scenario = data_scenario;
      // var rawDataText = JSON.stringify(rawData);
      // $tab.data('data_raw', rawDataText);
      var data = {
        name: tabName,
        data: JSON.stringify(data_scenario)
      }

      var snapshotId = this.parent.getCurrentTab().find('input#worksheetId').val();

      $.ajax({
        url: '/api/snapshots/'+snapshotId+'/forecasts/add',
        data: data,
        method: 'post',
        dataType: 'json',
        success: cb
      });

    },

    updateStatus: function($scenarioContainer) {
      var $changedScenario = $scenarioContainer
        .find('.btn-scenario i.icon-asterisk.unsaved-indicator');
      var sectionName = $scenarioContainer
        .closest('.trending-charts')
        .find('li.active a')
        .attr('href');

      if ($changedScenario.length > 0) {
        $scenarioContainer
          .closest('.trending-charts')
          .find('li.active a i')
          .addClass('icon-asterisk unsaved-indicator');
        //$('#analyzeToolbar').find('[data-section="' + sectionName.replace('#forecast-chart-','') + '"]').prepend('<i class="icon-asterisk unsaved-indicator"></i>');
      } else {
        $scenarioContainer
          .closest('.trending-charts')
          .find('li.active a i')
          .removeClass('icon-asterisk unsaved-indicator');
        //$('#analyzeToolbar').find('[data-section="' + sectionName.replace('#forecast-chart-','') + '"]').removeClass('icon-asterisk unsaved-indicator');
      }
    }
  });

module.exports = AnalyzeView;
