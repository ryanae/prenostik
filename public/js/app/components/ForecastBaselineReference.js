var React = require('react');
var ReactDOM = require('react-dom');


var ForecastBaselineReference = React.createClass({
	componentDidMount: function() {
		var elem = ReactDOM.findDOMNode(this.refs.fSlider);
		$(elem).on('slidechange', this.props.forecastSlideChangeHandler);
		$(elem).on('slide', this.props.forecastSlideHandler);
	},
	componentDidUpdate: function(){
        console.log('[ForecastBaselineReference] componentDidUpdate');
	},
	render: function(){
		return (
            <table className="table table-striped table-semi-condensed reference-data">
                <thead>
                    <tr>
                        <th>Reference Data</th>
                        <th className="text-center">Forecast
                        	<br/>Period
                        	<br/>({this.props.scenarioData.baseline.shiftType})
                        </th>
                        <th className="text-center">Forecast<br/>Date</th>
                        <th className="text-center">Confidence<br/>Interval</th>
                        <th className="text-center">
                        	<div className="pull-left">-200%</div>
                        	<span className="avgValue">Avg</span>
                        	<div className="pull-right">+200%</div>
                    	</th>
                        <th>Forecast</th>
                    </tr>
                </thead>
                <tbody>
                	{function(){
                		if(this.props.scenarioData.baseline.factors && this.props.scenarioData.baseline.factors.length > 0){
                			return (
			                    <tr id="factorRow-0" className="factorRow warning">
			                        <td className="span3 datastream-name">{this.props.scenarioData.baseline.factors[0].datastreamname}</td>
			                        <td className="span1 text-center forecast-period">##</td>
			                        <td className="span1 text-center forecast-date">&nbsp;</td>
			                        <td className="span1 text-center alpha" data-resetvalue="95" >95%
			                        </td>
			                        <td className="span3">
			                            <div ref="fSlider" className="forecast-slider forecast-slider-0 dependent ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" 
			                            	aria-disabled="false">
			                                <div className="confidenceWindow" title="" data-toggle="tooltip"></div>
			                            </div>
			                            <div className="range range-0 muted text-center" style={{width:"100%"}}>
			                                <span className="pull-left text-left minValue">0</span>
			                                <span className="text-center avgValue"></span>
			                                <span className="pull-right text-right maxValue"></span>
			                            </div>
			                        </td>
			                        <td className="span3">
			                            <div className="input-prepend input-append">
			                                <div className="btn-group">
			                                    <input 
			                                    	onKeyUp={this.props.forecastKeyUpHandler}
			                                    	onKeyDown={this.props.forecastKeyDownHandler}
			                                    	onChange={this.props.forecastChangeHandler}
			                                    	className="forecast forecast-0 dependent span2" 
			                                    	id="forecast-0" 
			                                    	type="text" 
			                                    	ref="baselineForecastElem"
			                                    	data-stream-id={this.props.scenarioData.baseline.factors[0].datastreamid}
			                                    	data-resetvalue="" 
			                                    	data-intercept={this.props.scenarioData.baseline.intercept}
			                                    	data-residualstandarderror={this.props.scenarioData.baseline.residualStandardError} 
				                                    data-degreesoffreedom={this.props.scenarioData.baseline.degreesOfFreedom}/>
			                                    <button id="solve-0" 
			                                    	className="btn solve dependent icon-star solving" 
			                                    	onClick={this.props.solveHandler}
			                                    	type="button" 
			                                    	data-resetvalue="true" 
			                                    	data-original-title="Currently solving for the reference value" 
			                                    	data-toggle="tooltip"></button>
			                                </div>
			                            </div>
			                        </td>
			                    </tr>
                			);
                		}
                	}.call(this)}
                </tbody>
            </table>
		)
	}
});

module.exports = ForecastBaselineReference;