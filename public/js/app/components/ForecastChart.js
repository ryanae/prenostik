var React = require('react');
var ReactDOM = require('react-dom');
var ForecastBox = require('./ForecastEqualizer');
var toast = require('../../lib/toast')


var ForecastChart = React.createClass({
    getInitialState: function(){
      return {
        isSliderReady: false
      }
    },
    renderForecastEqualizer: function($forecastContainer, data, addDrawCallback) {
      console.log('renderForecastEqualizer called');
      var self = this;
      var scenarioData = this.props.scenarioData;
      //Hide the chart for now
      var minValue = 0;
      var maxValue = 0;

      $('.forecast-chart').hide();
      $forecastContainer.find('.btn-save-scenario').hide();
      $forecastContainer.find('.btn-rename-scenario').hide();

      //baselineContainer handles interface elements for only the baseline scenario which is generated dynamically - not saved
      var $baselineContainer = $($forecastContainer).find('#forecast-scenario-baseline');
      //First, create the Baseline forecast values that represents the initial default best predictor solution
      var colorIndex = 0;
      var avgPoints = [];

      //work through each independent value, then do the dependent value last so we can solve the equation as the default

      // console.log('breakpoint');

      for (var i = 0; i < scenarioData.baseline.factors.length; i++) {
        //get average value
        var total = 0.0;
        var streamId = scenarioData.baseline.factors[i].datastreamid;
        //NOTE: The datapoints array may not be in the same order as the factors array - so match by datastreamid
        //todo: the average values of each dataset could be computed in the initial server call rather than doing it here each time

        for (var j = 0; j < data.datapoints_shifted.length; j++) {

          if (data.datapoints_shifted[j].datastreamid === streamId) {

            var points = [];
            var paramValue = 0;

            if(data.datapoints_shifted[j].hasOwnProperty('data')){
              for (var k = 0; k < data.datapoints_shifted[j].data.length; k++) {
                total += data.datapoints_shifted[j].data[k].value;
                if (j > 0) {
                  points[k] = data.datapoints_shifted[j].data[k].value;
                }
              }
              paramValue = (k == 0 ? 0 : total / k);
            }


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
        var chartOptions = this.props.chartOptions.toObject();
        $forecastContainer
          .find(".forecast-slider-" + i + " > div.ui-slider-range")
          .css("background-color", chartOptions.colors[colorIndex]);
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
      // var dt = $forecastContainer.find('table.test-data').dataTable();
      // if(dt) {
      //   dt.fnDestroy();
      // }
      
      var dtOptions = {
        "bPaginate": false,
        "bLengthChange": false,
        "bFilter": false,
        "bSort": true,
        "bDestroy": true, 
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
      };

      if(addDrawCallback == true){
        dtOptions['fnDrawCallback'] = function(){
          self.forceUpdate();
        }
      }


      $forecastContainer.find('table.test-data').dataTable(dtOptions);
      if(this.state.isSliderReady){
        return;
      } else {
        this.setState({isSliderReady:true});
      }
    },
    hideError: function(){
      $(ReactDOM.findDOMNode(this.refs.analyzeError)).hide();
    },
    showError: function() {
      $(ReactDOM.findDOMNode(this.refs.analyzeError)).show();
    },
    forceRender: function(){
      console.log('[ForecastChart] forceRender');
      var forecastContainer = $(ReactDOM.findDOMNode(this.refs.forecastContainer));
      this.renderForecastEqualizer(forecastContainer, this.props.data.data, false);
    },
    componentDidUpdate: function(prevProps, prevState) {
      if(!_.isEmpty(this.props.scenarioData)){
        var forecastContainer = $(ReactDOM.findDOMNode(this.refs.forecastContainer));
        this.renderForecastEqualizer(forecastContainer, this.props.data.data, false);
      }

      if(!_.isEmpty(this.props.error)){
        this.showError();
      } else {
        this.hideError();
      }
    },
    componentDidMount: function() {
      if(!_.isEmpty(this.props.scenarioData)){
        var forecastContainer = $(ReactDOM.findDOMNode(this.refs.forecastContainer));
        this.renderForecastEqualizer(forecastContainer, this.props.data.data, true);
      } 
      if(!_.isEmpty(this.props.error)){
        this.showError();
      } else {
        this.hideError();
      }
    },
    getError: function(){
      if(this.props.error.hasOwnProperty('message')){
        return this.props.error.message;
      }  else {
        return "";
      }
    },
    render: function () {
      // console.log(Date.now(), this.props.scenarioData);
      return (
        <div className="tab-pane" id={"forecast-chart-"+this.props.data.tabId}>
          <div ref="analyzeError" className="row-fluid analyze-error">
              <div className="span12 flashMessages">
                  <div id="forecast-error" 
                    className="alert flash-error"
                    dangerouslySetInnerHTML={{__html: this.getError()}}>
                  </div>
              </div>
          </div>
          <div 
          ref="forecastContainer" 
          className="forecast-equalizer">
            {function(){
              if(!_.isEmpty(this.props.scenarioData)){
                return (
                  <ForecastBox 
                    isSliderReady={this.state.isSliderReady}
                    data={this.props.data}
                    forceChartUpdate={this.props.forceChartUpdate}
                    currentTab={this.props.currentTab}
                    forceRender={this.forceRender}
                    tabCount={this.props.tabCount}
                    scenarioData={this.props.scenarioData} />
                ) 
              } else {
                  return (
                    <p>No forecast data was found {JSON.stringify(this.props.scenarioData)}</p>
                  )
              }
            }.call(this)}
          </div>
        </div>
      )
    }
});

ForecastChart.propTypes = {
  data: React.PropTypes.object.isRequired,
  currentTab: React.PropTypes.string.isRequired,
  chartOptions: React.PropTypes.object.isRequired,
  scenarioData: React.PropTypes.object.isRequired,
  tabCount: React.PropTypes.number.isRequired,
  error: React.PropTypes.object
};

module.exports = ForecastChart;