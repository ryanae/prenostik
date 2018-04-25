var React = require('react');
var ReactDOM = require('react-dom');

var FactorRowBox = require('./FactorRowBox')

var ForecastBaselineTest = React.createClass({
    componentDidMount: function(){

    },
    componentDidUpdate: function(){
        console.log('[ForecastBaselineTest] componentDidUpdate');
    },
	render: function(){
		return (
            <table className="table table-striped table-semi-condensed test-data">
                <thead>
                    <tr>
                        <th>Test Data</th>
                        <th className="text-center">Time<br/>Shift<br/>({this.props.scenarioData.baseline.shiftType})</th>
                        <th className="text-center sorting_asc">&nbsp;&nbsp;&nbsp;Rank&nbsp;&nbsp;&nbsp;</th>
                        <th className="text-center">Coefficient</th>
                        <th className="text-center">
                        	<div className="pull-left">-100%</div>Avg
                        	<div className="pull-right">+100%</div>
                        </th>
                        <th>Forecast</th>
                    </tr>
                </thead>
                <tbody>
                	{function() {
                		if(this.props.scenarioData.baseline.factors && this.props.scenarioData.baseline.factors.length > 0){
                			return this.props.scenarioData.baseline.factors.map(function(baseFactor, idx){
                				if(idx > 0){
	                				return (
		                				<FactorRowBox 
		                					key={idx} 
		                					index={idx} 
		                					factor={baseFactor} 
		                					solveHandler={this.props.solveHandler}
		                					updateSlider={this.props.updateSlider}
		                					forecastSlideHandler={this.props.forecastSlideHandler}
		                					forecastSlideChangeHandler={this.props.forecastSlideChangeHandler}
		                				/>
                					);
                				}
                			}, this);
                		}
                	}.call(this)}
                </tbody>
            </table>
		)
	}
})

module.exports = ForecastBaselineTest;