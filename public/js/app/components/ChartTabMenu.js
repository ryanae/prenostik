var React = require('react');
var ReactDOM = require('react-dom');
var CorrelationChart = require('./CorrelationChart');
var SequenceChart = require('./SequenceChart');
var BestPredictorChart = require('./BestPredictorChart');
var ForecastChart = require('./ForecastChart');

var ChartTabMenu = React.createClass({
  showChart: function() {
    var elem = ReactDOM.findDOMNode(this.refs.trendingCharts);
    $(elem).show();
  },
  componentDidUpdate: function() {
    console.log('[ChartTabMenu] forecastData', this.props.forecastData);
    if(this.props.data.tabId === this.props.currentTab && 
      this.props.data.data !== null){
      this.showChart();
    }
  },
  componentDidMount: function() {
    console.log('[ChartTabMenu] forecastData', this.props.forecastData);
    if(this.props.data.tabId === this.props.currentTab && 
      this.props.data.data !== null){
      this.showChart();
    }

  },
  render: function () {
    return (
        <div ref="trendingCharts" className="trending-charts">
          <ul className="nav nav-tabs nav-append-content">
            <li className="active"><a href={"#correlation-chart-"+this.props.data.tabId} data-toggle="tab"> Correlation</a></li>
            <li><a href={"#sequence-chart-"+this.props.data.tabId} data-toggle="tab"> Sequence</a></li>
            <li><a href={"#best-predictor-chart-"+this.props.data.tabId} data-toggle="tab"> Best Predictor Model</a></li>
            <li><a href={"#forecast-chart-"+this.props.data.tabId} data-toggle="tab"><i></i> Forecasting</a></li>
          </ul>
          <div className="tab-content">
            <CorrelationChart 
              chartOptions={this.props.correlationChartOptions} 
              data={this.props.data} 
              pendingDatasets={this.props.pendingDatasets}
              forceChartUpdate={this.props.forceChartUpdate}
              shiftData={this.props.shiftData}
              tabCount={this.props.tabCount} />
            <SequenceChart 
              chartOptions={this.props.sequenceChartOptions} 
              data={this.props.data} 
              shiftData={this.props.shiftData}
              tabCount={this.props.tabCount} />
            <BestPredictorChart 
              chartOptions={this.props.bestPredictorChartOptions} 
              data={this.props.data} 
              bestPredictorTableData={this.props.bestPredictorTableData}
              tabCount={this.props.tabCount} 
              error={this.props.error}
              />
            <ForecastChart 
              data={this.props.data} 
              currentTab={this.props.currentTab}
              forceChartUpdate={this.props.forceChartUpdate}
              chartOptions={this.props.correlationChartOptions}
              scenarioData={this.props.forecastData}
              tabCount={this.props.tabCount} 
              error={this.props.error}
              />
          </div>
       </div>
    ) 
  }
});

ChartTabMenu.propTypes = {
	currentTab: React.PropTypes.string.isRequired,
	data: React.PropTypes.object.isRequired,
	tabCount: React.PropTypes.number.isRequired,
	bestPredictorChartOptions: React.PropTypes.object.isRequired,
	correlationChartOptions: React.PropTypes.object.isRequired,
	sequenceChartOptions: React.PropTypes.object.isRequired,
	bestPredictorTableData: React.PropTypes.object.isRequired,
	forecastData: React.PropTypes.object,
	shiftData: React.PropTypes.object.isRequired,
	pendingDatasets: React.PropTypes.arrayOf(React.PropTypes.string),
	error: React.PropTypes.object
};

module.exports = ChartTabMenu;