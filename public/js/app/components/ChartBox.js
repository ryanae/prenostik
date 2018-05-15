var React = require('react');
var ReactDOM = require('react-dom');
var AnalyzeErrors = require('./AnalyzeErrors');
var ChartTabMenu = require('./ChartTabMenu');
var Immutable = require('immutable');

var ChartBox = React.createClass({
  sortOrderIds: [],
  getInitialState: function() {
    return {
      bestPredictorChartOptions: {},
      correlationChartOptions: {},
      sequenceChartOptions: {},
      bestPredictorTableData: {},
      forecastData: {},
      shiftData: {},
      error: {},
      pendingDatasets: [],
      lastPendingData: {},
      forceChartUpdate: false,
      numOfDatapoints: 0,
      originalDatapoints:{} 
    };
  },

  getForecastData: function(data) {

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

    return scenarioData;
  },
  getBestPredictorTableData: function(data, fillSortOrder) {
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

    var bestPredData = {
      autofactorreduce: data.autofactorreduce,
      shiftType: data.params.shiftType
    };

    if(fillSortOrder){
      var reducedData = _.map(bestPredData.autofactorreduce.factors, function(obj){
        return obj.datastreamid;
      });

      this.sortOrderIds = $.merge(this.sortOrderIds, reducedData);
    }

    return bestPredData;
  },
  getCorrelationTableData: function(data, fillSortOrder) {
    var shifts = _.chain(data.autocorrelate.shifts || [])
      .sortBy(function(o) {
        return -o.pecentagecorrelated;
      }).map(function(o) {
        var cloned = _.clone(o);
        cloned.pecentagecorrelated = (cloned.pecentagecorrelated || 0).toFixed(2) + '%';
        return cloned;
      }).value();

    var shiftData = {
      shifts: shifts,
      shiftType: data.params.shiftType
    };

    if(fillSortOrder){
      var reducedData = _.map(shiftData.shifts, function(obj){
        return obj.datastreamid;
      });

      this.sortOrderIds = _.uniq($.merge(this.sortOrderIds, reducedData));
    }

    return shiftData;
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

    var chartOptions = {
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
    };

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

    return _.clone(chartOptions);
  },

  getCorrelationChartOptions: function(data, optionValues) {

    var originalData = {};
    var localTabCount = this.props.tabCount;

    var series, combined, shift, values, ref_min, ref_max, val, mean_min=0, mean_max=0,
      selections = optionValues,
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

    // console.log('what is originalData >>>>', originalData);
    Highcharts.Point.prototype.tooltipFormatter = function(useHeader) {
      var point = this,
        series = point.series;
      // console.log('HERE TOOLTIP >>',series.name, point.y, series.options.originalData[series.name], series.options.originalData[series.name][point.y]);
      // console.log(series.options);
      return ['<span style="color:' + series.color + '">', (point.name || series.name), '</span>: ',
        (!useHeader ? ('<b>x = ' + (point.name || point.x) + ',</b> ') : ''),

        '<b>', (!useHeader ? 'y = ' : ''), Highcharts.numberFormat(point.y, 2), '</b><br/>'].join('');

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
        y: 60,
        style: {
          fontWeight: 'bold',
          color: '#333',
          fontSize: '18px'
        },
        maxHeight: 185
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

    return _.clone(chartOptions);
  },
  componentDidMount: function() {
    var self = this;
    var shouldUpdate = _.isEmpty(this.state.correlationChartOptions);
    var forceChartUpdate = this.state.forceChartUpdate;

    if(forceChartUpdate === true){
      shouldUpdate = true; 
    }

    if(this.props.data.tabId === this.props.currentTab){
      $(ReactDOM.findDOMNode(this.refs.analyzeSection)).show();
    } else {
      $(ReactDOM.findDOMNode(this.refs.analyzeSection)).hide();
    }

    if(this.props.data.data !== null && shouldUpdate){
      $(ReactDOM.findDOMNode(this.refs.chartLoader)).show()
      console.log('[ChartBox] componentDidMount', 
        Immutable.Map(this.props.data.data).toObject());

      var data = this.props.data.data;
      this.sortOrderIds = [];
      var bestPredictorChartOptions = {};
      var bestPredictorTableData = {};
      var forecastData = {};
      var pendingDatasets = [];

      var correlationChartOptions = this.getCorrelationChartOptions(data, this.props.data.options);
      var sequenceChartOptions = this.getSequenceChartOptions(data);
      var errorObject = {};

      var hasError = data.autofactorreduce.error ? true : false;
      if(!hasError){
        bestPredictorTableData = this.getBestPredictorTableData(data, true);
      }

      var shiftData = this.getCorrelationTableData(data, true);

      var origData = _.clone(data);

      var allDatasets = data.datapoints.map(function(dp){
        return dp.datastreamname;
      });
      
      console.log('[ChartBox] allDatasets', allDatasets);

      data.datapoints = data.datapoints.filter(function(dp) {
        return _.has(dp, 'data');
      });

      data.datapoints_shifted = data.datapoints.filter(function(dp) {
        return _.has(dp, 'data');
      });

      var firstDatasets = data.datapoints.map(function(dp){
        return dp.datastreamname;
      });

      pendingDatasets = _.difference(allDatasets, firstDatasets);
      console.log('[ChartBox] pendingDatasets', pendingDatasets);

      var correlationChartOptions = this.getCorrelationChartOptions(data, this.props.data.options);
      var sequenceChartOptions = this.getSequenceChartOptions(data);

      shiftData = this.getCorrelationTableData(data);

      if(hasError){
        var errorMessage = 'Error: ' + data.autofactorreduce.error.code + ' - ' + data.autofactorreduce.error.message;
        errorMessage += '<br/>Modify the snapshot parameters to increase the number of data set rows and/or decrease the number of data sets in the analysis.';

        errorObject = {
          message: errorMessage
        }
      } else {
        bestPredictorChartOptions = this.getBestPredictorChartOptions(data);
        bestPredictorTableData = this.getBestPredictorTableData(data);
        forecastData = this.getForecastData(data);
      }

      $(ReactDOM.findDOMNode(this.refs.emptyMessage)).hide()
      $(ReactDOM.findDOMNode(this.refs.chartLoader)).hide()

      var pendingDatasetIds = [];
      origData.datapoints.forEach(function(datapoint){
        if(_.contains(pendingDatasets, datapoint.datastreamname)){
          pendingDatasetIds.push(datapoint.datastreamid);
        }
      });

      if(pendingDatasetIds.length > 0){
        forceChartUpdate = true;
      } 

      if(pendingDatasetIds.length===0){
        forceChartUpdate = false;
      }

      var nextState = {
        bestPredictorChartOptions: Immutable.Map(bestPredictorChartOptions),
        correlationChartOptions: Immutable.Map(correlationChartOptions),
        sequenceChartOptions: Immutable.Map(sequenceChartOptions),
        bestPredictorTableData: bestPredictorTableData,
        forecastData: forecastData,
        shiftData: shiftData,
        error: errorObject,
        pendingDatasets: pendingDatasets,
        originalDatapoints: origData,
        forceChartUpdate: false
      };

      this.setState(nextState, function(){
        if(pendingDatasetIds.length > 0){
          self.props.getPendingDatasets(pendingDatasetIds.slice(0, 5), 
            forceChartUpdate);
        }
      });

    }



  },

  componentDidUpdate: function(prevProps, prevState) {
    // console.log('[ChartBox] componentDidUpdate', this.props.data.data);
    var self = this;
    var shouldUpdate = _.isEmpty(this.state.correlationChartOptions); 
    var forceChartUpdate = false;
    if(this.props.data.data === null){
      return;
    }
    /* Reasons to update
    * if there was no data previously
    * If there was a pending dataset that is now loaded
    * If there was a 
    */

    if(this.props.data.tabId === this.props.currentTab){
      $(ReactDOM.findDOMNode(this.refs.analyzeSection)).show();
    } else {
      $(ReactDOM.findDOMNode(this.refs.analyzeSection)).hide();
    }

    var hasAllData = true;
    _.each(this.props.data.data.datapoints, function(dp){
        if(!_.has(dp, 'data')){
          hasAllData = false;
        }
    });

    if(!_.isEmpty(this.state.correlationChartOptions) 
      && this.props.pendingData === this.state.lastPendingData
      && hasAllData){
      return;
    }

    $(ReactDOM.findDOMNode(this.refs.chartLoader)).show()

    var data = this.props.data.data;
    this.sortOrderIds = [];
    var pendingDatasets = [];

    var bestPredictorChartOptions = prevState.bestPredictorChartOptions;
    var bestPredictorTableData = prevState.bestPredictorTableData;
    var forecastData = prevState.forecastData;
    var hasError = false;
    var errorObject = {};
    var hasError = data.autofactorreduce.error ? true : false;
    if(!hasError){
      bestPredictorTableData = this.getBestPredictorTableData(data, true);
    }

    var shiftData = this.getCorrelationTableData(data, true);


    console.log('[ChartBox] datapoints', data.datapoints);
    var allDatasets = [];
    if(!_.isEmpty(this.state.originalDatapoints)){
      console.log('OD', this.state.originalDatapoints);
      allDatasets = this.state.originalDatapoints.datapoints.map(function(dp){
        return dp.datastreamname;
      });
    }
    console.log('[ChartBox] allDatasets', allDatasets);

    // _.each(this.state.pendingDatasets, function(pendingDataset){
    //   if(allDatasets.indexOf(pendingDataset) === -1){
    //     allDatasets.push(pendingDataset);
    //   }
    // });


    data.datapoints = data.datapoints.filter(function(dp){
      return _.has(dp, 'data');
    })

    data.datapoints_shifted = data.datapoints_shifted.filter(function(dp){
      return _.has(dp, 'data');
    });

    console.log('[ChartBox] datapoints', data.datapoints);
    var firstDatasets = data.datapoints.map(function(dp){
      return dp.datastreamname;
    });
    console.log('[ChartBox] firstDatasets', firstDatasets);

    pendingDatasets = _.difference(allDatasets, firstDatasets);
    console.log('[ChartBox] pendingDatasets', pendingDatasets);

    var correlationChartOptions = this.getCorrelationChartOptions(data, 
      this.props.data.options);
    var sequenceChartOptions = this.getSequenceChartOptions(data);

    shiftData = this.getCorrelationTableData(data);

    if(hasError){
      var errorMessage = 'Error: ' + data.autofactorreduce.error.code + ' - ' + data.autofactorreduce.error.message;
      errorMessage += '<br/>Modify the snapshot parameters to increase the number of data set rows and/or decrease the number of data sets in the analysis.';

      errorObject = {
        message: errorMessage
      }
    } else {
      bestPredictorTableData = this.getBestPredictorTableData(data);
      bestPredictorChartOptions = this.getBestPredictorChartOptions(data);
      forecastData = this.getForecastData(data);
    }

    $(ReactDOM.findDOMNode(this.refs.emptyMessage)).hide()
    $(ReactDOM.findDOMNode(this.refs.chartLoader)).hide()


    var pendingDatasetIds = [];
    if(!_.isEmpty(this.state.originalDatapoints)){
      this.state.originalDatapoints.datapoints.forEach(function(datapoint){
        if(_.contains(pendingDatasets, datapoint.datastreamname)){
          pendingDatasetIds.push(datapoint.datastreamid);
        }
      });
    }

    if(pendingDatasetIds.length > 0){
      forceChartUpdate = true;
      // console.log(pendingDatasetIds)
    } 

    if(this.state.pendingDatasets.length !== pendingDatasets.length){
      forceChartUpdate = true;
    }


    var newState = {
      bestPredictorChartOptions: Immutable.Map(bestPredictorChartOptions),
      correlationChartOptions: Immutable.Map(correlationChartOptions),
      sequenceChartOptions: Immutable.Map(sequenceChartOptions),
      bestPredictorTableData: bestPredictorTableData,
      forecastData: forecastData,
      shiftData: shiftData,
      error: errorObject,
      pendingDatasets: pendingDatasets,
      forceChartUpdate: forceChartUpdate,
    };


    _.each(this.state.pendingDatasets, function(pendingDataset){
      if(allDatasets.indexOf(pendingDataset) === -1){
          newState.pendingDatasets.slice(pendingDataset);
      }
    });

    if(this.props.pendingData 
      && this.props.pendingData !== this.state.lastPendingData){
      newState.lastPendingData = this.props.pendingData;
    }

    if(allDatasets 
      && allDatasets.length > 0 
      && allDatasets.length != this.state.numOfDatapoints){
      newState.numOfDatapoints = allDatasets.length;
    }


    self.setState(newState, function(){
      if(pendingDatasetIds.length > 0){
        console.log('[ChartBox] getting pending datasets');
        self.props.getPendingDatasets(pendingDatasetIds.slice(0, 5), 
          forceChartUpdate);
      }
    });


  },
  render: function () {
    var sectionClasses = "analyze-section section-" + this.props.data.tabId;
    if(this.props.data.tabId !== this.props.currentTab){
      sectionClasses += " hide";
    }
    return (
      <div className="row-fluid">
        <div ref="analyzeSection" className="span12 analyze-sections">
          <div className={sectionClasses}>
              <div ref="emptyMessage" id="emptyCalculationMessage" className="well">Select Parameters to generate a chart.</div>
              <div ref="chartLoader" id="trendingChartLoader" className="well">
                  <img src="/img/ajax-loader-circle.gif"/> &nbsp; Generating Charts...
              </div>
              <ChartTabMenu 
                currentTab={this.props.currentTab} 
                data={this.props.data} 
                tabCount={this.props.tabCount}
                bestPredictorChartOptions={this.state.bestPredictorChartOptions}
                correlationChartOptions={this.state.correlationChartOptions}
                sequenceChartOptions={this.state.sequenceChartOptions}
                forceChartUpdate={this.state.forceChartUpdate}
                bestPredictorTableData={this.state.bestPredictorTableData}
                forecastData={this.state.forecastData}
                shiftData={this.state.shiftData}
                pendingDatasets={this.state.pendingDatasets}
                error={this.state.error}
                />
          </div>
        </div>
      </div>
    ) 
  }
});

ChartBox.propTypes = {
  data: React.PropTypes.object.isRequired,
  forceChartUpdate: React.PropTypes.bool,
  useInitialSort: React.PropTypes.bool,
  getPendingDatasets: React.PropTypes.func.isRequired,
  currentTab: React.PropTypes.string.isRequired,
  currentPageNumber: React.PropTypes.number,
  tabCount: React.PropTypes.number.isRequired
};

module.exports = ChartBox;