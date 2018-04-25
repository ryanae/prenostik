var React = require('react');
var ReactDOM = require('react-dom');

var HighChartsBox = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState){
    if(nextProps.hasOwnProperty('forceChartUpdate') 
        && nextProps.forceChartUpdate === true){
      return true;
    }
    return this.props.chartOptions !== nextProps.chartOptions;
  },
  destroyChart: function(){
    var self = this;
    var chart = $(ReactDOM.findDOMNode(self.refs[self.props.chartName])).highcharts();
    if(chart){
      chart.destroy();
      return true;
    } else {
      return false
    }

  },
  componentDidUpdate: function() {
    var self = this;
    var chartOptions = this.props.chartOptions.toObject();
    var didDestroyChart = this.destroyChart();
    $(ReactDOM.findDOMNode(self.refs[self.props.chartName]))
      .highcharts('StockChart', chartOptions);
  },
  render: function () {
    return (
      <div 
        ref={this.props.chartName} 
        className={this.props.chartName} >
      </div>
    ) 
  }
});

HighChartsBox.propTypes = {
	chartName: React.PropTypes.string.isRequired,
	chartOptions: React.PropTypes.object.isRequired,
  forceChartUpdate: React.PropTypes.bool
}

module.exports = HighChartsBox;