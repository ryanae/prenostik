var React = require('react');
var ReactDOM = require('react-dom');
var FactorSliderRow = require('./FactorSliderRow');

var cx = require('classnames');

var ScenarioBox = React.createClass({
	componentDidMount: function() {
		var elem = ReactDOM.findDOMNode(this.refs.referenceForecastSlider);
		var minValueElem = ReactDOM.findDOMNode(this.refs.minValue);
		var paramValueElem = ReactDOM.findDOMNode(this.refs.avgValue);
		var maxValueElem = ReactDOM.findDOMNode(this.refs.maxValue);

		if(this.props.scenario.factors[0].hasOwnProperty('sliderParams')){
			var sliderParams = _.clone(this.props.scenario.factors[0].sliderParams);
			console.log('found slider params', sliderParams);
			var color = sliderParams.color;
			sliderParams.disabled = true;
			delete sliderParams.color;
			$(elem).slider(sliderParams)
	        $(elem).find("div.ui-slider-range").css(
	        	"background-color", color);
			$(elem).slider('value', $(elem).slider('value'));
			$(minValueElem).text(sliderParams.min);
			$(paramValueElem).text(sliderParams.value);
			$(maxValueElem).text(sliderParams.max);
		}

		var elem = ReactDOM.findDOMNode(this.refs.referenceForecastSlider);
		$(elem).on('slidechange', this.props.forecastSlideChangeHandler);
		$(elem).on('slide', this.props.forecastSlideHandler);
        var forecastElem = ReactDOM.findDOMNode(this.refs.forecastElem);
		if(this.props.scenario.baselinematrix){
			$(forecastElem).data('baselinematrix', this.props.scenario.baselinematrix)
		}

		var testDataTable = ReactDOM.findDOMNode(this.refs.testDataTable);
		var referenceDataTable = ReactDOM.findDOMNode(this.refs.referenceDataTable);
		var solvingButton = ReactDOM.findDOMNode(this.refs.solvingButton);

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


	    $(testDataTable).dataTable(dtOptions);

	    if(this.props.scenario.hasOwnProperty('period')){
	    	$('.forecast-period').text(this.props.scenario.period);
	    }

	    if(this.props.scenario.hasOwnProperty('forecastDate')){
	    	$('.forecast-date').text(this.props.scenario.forecastDate);
	    }

	    // TODO check to see if slider has been initialized
	    if(this.props.isSliderReady){
			$(elem).slider('value', this.props.scenario.factors[0]['state'].value);
			if(solvingButton){
				$(solvingButton).click();
			}
		    //this.triggerReset();
	    }

	},
	triggerReset: function() {
		var el = ReactDOM.findDOMNode(this.refs.scenarioBox);
	    var scenario = $(el).closest('#scenario-content').find('.scenario.user');
	    scenario.find(".solve[data-resetvalue='true']").click();
		scenario.find('.forecast').each(function(forecastElem){
			this.props.updateSlider(forecastElem);
		});
	},
	componentDidUpdate: function(nextProps, nextState) {
		console.log('[ScenarioBox] componentDidUpdate triggered')
		var elem = ReactDOM.findDOMNode(this.refs.referenceForecastSlider);
		var solvingButton = ReactDOM.findDOMNode(this.refs.solvingButton);
		if(this.props.isSliderReady && nextProps.isSliderReady){
			return;
		}
	    if(this.props.isSliderReady){
			$(elem).slider('value', this.props.scenario.factors[0]['state'].value);
			if(solvingButton){
				$(solvingButton).click();
			}
	    }
	},
	render: function() {
		var baselinematrix = null;
		if(this.props.scenario.baselinematrix){
			baselinematrix = this.props.scenario.baselinematrix;
		}
		var factorSliderRows = this.props.scenario.factors.map(function(factor, indx){
			if(indx > 0){
				return (
					<FactorSliderRow 
						key={indx}
						index={indx}
						factor={factor}
						triggerReset={this.triggerReset}
	                	forecastKeyUpHandler={this.props.forecastKeyUpHandler}
	                	forecastKeyDownHandler={this.props.forecastKeyDownHandler}
	                	forecastChangeHandler={this.props.forecastChangeHandler}
	                	updateSlider={this.props.updateSlider}
	                	baselinematrix={baselinematrix}
	                	isSliderReady={this.props.isSliderReady}
						solveHandler={this.props.solveHandler}
						forecastSlideHandler={this.props.forecastSlideHandler}
						forecastSlideChangeHandler={this.props.forecastSlideChangeHandler}
					/>
				);
			}
		}, this);

        var classes = cx({
            "tab-pane": true,
            "scenario": true,
            "user": true,
            "active": this.props.scenario.id == this.props.currentScenario
        })
		return (
	        <div ref="scenarioBox" className={classes} id={"forecast-scenario-tab"+this.props.index}>
	            <table ref="referenceDataTable" 
	            	className="table table-striped table-semi-condensed reference-data">
	                <thead>
	                <tr>
	                    <th>Reference Data</th>
	                    <th className="text-center">Forecast<br/>Period<br/>({this.props.baseline.shiftType})</th>
	                    <th className="text-center">Forecast<br/>Date</th>
	                    <th className="text-center">Confidence<br/>Interval</th>
	                    <th className="text-center"><div className="pull-left">-200%</div><span className="avgValue">Avg</span><div className="pull-right">+200%</div></th>
	                    <th>Forecast</th>
	                </tr>
	                </thead>
	                <tbody>
	                        <tr id="factorRow-0" className="factorRow">
	                            <td className="span3 datastream-name">{this.props.scenario.factors[0].datastreamname}</td>
	                            <td className="span1 text-center forecast-period">##</td>
	                            <td className="span1 text-center forecast-date">&nbsp;</td>
	                            <td className="span1 text-center alpha" 
	                            	data-resetvalue={this.props.scenario.factors[0]['state'].alpha} >95%
	                            </td>
	                            <td className="span3">
	                                <div ref="referenceForecastSlider" 
	                                	className="forecast-slider forecast-slider-0 dependent ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" 
	                                	aria-disabled="true" 
	                                	value={this.props.scenario.factors[0]['state'].value}>
	                                    <div className="confidenceWindow" data-original-title="" data-toggle="tooltip"></div>
	                                </div>
	                                <div className="range range-0 muted text-center" style={{width:"100%"}}>
	                                    <span ref="minValue" className="pull-left text-left minValue">0</span>
	                                    <span ref="avgValue" className="text-center avgValue"></span>
	                                    <span ref="maxValue" className="pull-right text-right maxValue"></span>
	                                </div>
	                            </td>
	                            <td className="span3">
	                                <div className="input-prepend input-append">
	                                        {function() { 
	                                        	if(this.props.scenario.factors[0]['state'].solveId) {
		                                        	return (
					                                    <div className="btn-group">
				                                            <input 
				                                            	className="forecast forecast-0 dependent span2" 
						                                    	onKeyUp={this.props.forecastKeyUpHandler}
						                                    	onKeyDown={this.props.forecastKeyDownHandler}
						                                    	onChange={this.props.forecastChangeHandler}
						                                    	ref="forecastElem"
				                                            	id="forecast-0" 
				                                            	type="text" 
				                                            	defaultValue={this.props.scenario.factors[0]['state'].value} 
				                                            	disabled="true" 
				                                            	data-solve-id={this.props.scenario.factors[0]['state'].solveId}
				                                            	data-stream-id={this.props.scenario.factors[0].datastreamid}
				                                            	data-resetvalue={this.props.scenario.factors[0]['state'].value}
				                                            	data-intercept={this.props.scenario.intercept}
				                                            	data-residualstandarderror={this.props.scenario.residualStandardError}
				                                            	data-degreesoffreedom={this.props.scenario.degreesOfFreedom}/>
				                                            <button 
				                                            	id="solve-0" 
				                                            	onClick={this.props.solveHandler} 
				                                            	ref="solvingButton"
				                                            	className="btn solve dependent solving icon-star" 
				                                            	type="button" 
				                                            	data-resetvalue="true" 
				                                            	data-original-title="Currently solving for the reference value" 
				                                            	data-toggle="tooltip">
				                                            </button>
				                                        </div>
	                                        		);
	                                        	} else {
	                                        		return (
					                                    <div className="btn-group">
				                                            <input 
						                                    	onKeyUp={this.props.forecastKeyUpHandler}
						                                    	onKeyDown={this.props.forecastKeyDownHandler}
						                                    	onChange={this.props.forecastChangeHandler}
				                                            	className="forecast forecast-0 dependent span2" 
						                                    	ref="forecastElem"
				                                            	id="forecast-0" 
				                                            	type="text" 
				                                            	defaultValue={this.props.scenario.factors[0]['state'].value}
				                                            	data-stream-id={this.props.scenario.factors[0].datastreamid}
				                                            	data-resetvalue={this.props.scenario.factors[0]['state'].value}
				                                            	data-intercept={this.props.scenario.intercept}
				                                            	data-residualstandarderror={this.props.scenario.residualStandardError}
				                                            	data-degreesoffreedom={this.props.scenario.degreesOfFreedom}/>
				                                            <button id="solve-0" 
				                                            	onClick={this.props.solveHandler}
				                                            	className="btn solve dependent icon-star-empty" 
				                                            	type="button" 
				                                            	data-resetvalue="" 
				                                            	data-original-title="Click to solve for the reference value" 
				                                            	data-toggle="tooltip">
				                                            </button>
				                                        </div>
                                    				);
	                                        	}
	                                        }.call(this)}
	                                </div>
	                            </td>
	                        </tr>
	                </tbody>
	            </table>
	            <table ref="testDataTable" 
	            	className="table table-striped table-semi-condensed tablesorter test-data">
	                <thead>
	                <tr>
	                    <th className="">Test Data</th>
	                    <th className="text-center">Time<br/>Shift<br/>({this.props.baseline.shiftType})</th>
	                    <th className="text-center">&nbsp;&nbsp;&nbsp;Rank&nbsp;&nbsp;&nbsp;</th>
	                    <th className="text-center">Coefficient</th>
	                    <th className="text-center"><div className="pull-left">-100%</div>Avg<div className="pull-right">+100%</div></th>
	                    <th>Forecast</th>
	                </tr>
	                </thead>
	                <tbody>
	                {factorSliderRows}
	                </tbody>
	            </table>
	        </div>
		);	
	}

});

ScenarioBox.propTypes = {
	index: React.PropTypes.number.isRequired,
	baseline: React.PropTypes.object.isRequired,
	forecastKeyUpHandler: React.PropTypes.func.isRequired,
	forecastKeyDownHandler: React.PropTypes.func.isRequired,
	forecastChangeHandler: React.PropTypes.func.isRequired,
	solveHandler: React.PropTypes.func.isRequired,
	updateSlider: React.PropTypes.func.isRequired,
	forecastSlideHandler: React.PropTypes.func.isRequired,
	forecastSlideChangeHandler: React.PropTypes.func.isRequired,
	scenario: React.PropTypes.object.isRequired
};

module.exports = ScenarioBox;