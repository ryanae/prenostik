var React = require('react');
var HighChartsBox = require('./HighChartsBox');
var CorrelationTable = require('./CorrelationTable');

var SequenceChart = React.createClass({
  render: function () {
    return (
        <div className="tab-pane" id={"sequence-chart-"+this.props.data.tabId}>
          <div className="well">
              <div className="row-fluid analyze-error">
                  <div className="span12 flashMessages">
                      <div id="sequence-error" className="alert flash-error"></div>
                  </div>
              </div>
              <HighChartsBox 
                chartName={'sequence-chart'} 
                chartOptions={this.props.chartOptions}
                forceChartUpdate={this.props.forceChartUpdate}
                />
                <div className="sequence-table">
                  {function(){
                    if(!_.isEmpty(this.props.shiftData)){
                      return (
                        <CorrelationTable 
                        shiftData={this.props.shiftData} />
                      );
                    }
                  }.call(this)}
                </div>
          </div>
        </div>
    )
  }
});


SequenceChart.propTypes = {
	chartOptions: React.PropTypes.object.isRequired,
	data: React.PropTypes.object.isRequired,
	shiftData: React.PropTypes.object.isRequired,
	tabCount: React.PropTypes.number.isRequired
};

module.exports = SequenceChart;