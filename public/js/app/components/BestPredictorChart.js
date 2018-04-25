var React = require('react');
var ReactDOM = require('react-dom');
var HighChartsBox = require('./HighChartsBox');
var BestPredictorModelTable = require('./BestPredictorModelTable');

var BestPredictorChart = React.createClass({
  hideError: function(){
    $(ReactDOM.findDOMNode(this.refs.analyzeError)).hide();
  },
  showError: function() {
    $(ReactDOM.findDOMNode(this.refs.analyzeError)).show();
  },
  hideTable: function() {
    $(ReactDOM.findDOMNode(this.refs.bestPredTable)).hide();
    $('.best-predictor-table').hide();
  },
  componentDidUpdate: function() {
    if(!_.isEmpty(this.props.error)){
      this.showError();
      this.hideTable();
    } else {
      this.hideError();
    }
  },
  componentDidMount: function() {
    if(!_.isEmpty(this.props.error)){
      this.showError();
      this.hideTable();
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
    return (
      <div className="tab-pane" id={"best-predictor-chart-"+this.props.data.tabId}>
        <div className="well">
          <div ref="analyzeError" className="row-fluid analyze-error">
              <div className="span12 flashMessages">
                  <div id="best-predictor-error" 
                    className="alert flash-error"  
                    dangerouslySetInnerHTML={{__html: this.getError()}}>
                  </div>
              </div>
          </div>
          {function(){
            if(_.isEmpty(this.props.error)){
              return(
                <div>
                  <HighChartsBox 
                  	chartName={'best-predictor-chart'} 
                    chartOptions={this.props.chartOptions}
                    forceChartUpdate={this.props.forceChartUpdate}
                    />
                  <div ref="bestPredTable" className="best-predictor-table">
                    <BestPredictorModelTable 
                      bestPredData={this.props.bestPredictorTableData}/>
                  </div>
                </div>
              );
            }           
          }.call(this)}
        </div>
      </div>
    );
  }
});


BestPredictorChart.propTypes = {
	chartOptions: React.PropTypes.object.isRequired,
	data: React.PropTypes.object.isRequired,
	bestPredictorTableData: React.PropTypes.object.isRequired,
	tabCount: React.PropTypes.number.isRequired,
	error: React.PropTypes.object,
};

module.exports = BestPredictorChart;