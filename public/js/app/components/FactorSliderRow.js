var React = require('react');
var ReactDOM = require('react-dom');

var FactorSliderRow = React.createClass({
	componentDidMount: function() {
		var elem = ReactDOM.findDOMNode(this.refs.factorRowSlider);
		var minValueElem = ReactDOM.findDOMNode(this.refs.minValue);
		var paramValueElem = ReactDOM.findDOMNode(this.refs.avgValue);
		var maxValueElem = ReactDOM.findDOMNode(this.refs.maxValue);
		if(this.props.factor.hasOwnProperty('sliderParams')){
	        $(elem).find('div.ui-slider-range').remove();
			var sliderParams = _.clone(this.props.factor.sliderParams);
			var color = sliderParams.color;
			delete sliderParams.color;
			delete sliderParams.disabled;
			$(elem).slider(sliderParams);
	        $(elem).find("div.ui-slider-range").css(
	        	"background-color", color);
			$(elem).slider("value", $(elem).slider('value'))
			$(minValueElem).text(sliderParams.min);
			$(paramValueElem).text(sliderParams.value);
			$(maxValueElem).text(sliderParams.max);
		}


        var forecastElem = ReactDOM.findDOMNode(this.refs.forecastElem);
		var elem = ReactDOM.findDOMNode(this.refs.factorRowSlider);
		var solvingButton = ReactDOM.findDOMNode(this.refs.solvingButton);

		if(this.props.baselinematrix){
			$(forecastElem).data('baselinematrix', this.props.baselinematrix)
		}

		$(elem).on('slidechange', 
			this.props.forecastSlideChangeHandler);
		$(elem).on('slide', 
			this.props.forecastSlideHandler);

		// if(this.props.isSliderReady){
	 //        $(elem).slider("value", this.props.factor['state'].value)
		// 	if(solvingButton){
		// 		$(solvingButton).click();
		// 	}
		// 	//this.props.triggerReset();
		// }
	},
	componentDidUpdate:function(nextProps, nextState){
		var elem = ReactDOM.findDOMNode(this.refs.factorRowSlider);
		var solvingButton = ReactDOM.findDOMNode(this.refs.solvingButton);
		if(this.props.isSliderReady && nextProps.isSliderReady){
			return;
		}
		if(this.props.isSliderReady){
	        $(elem).slider("value", this.props.factor['state'].value)
			if(solvingButton){
				$(solvingButton).click();
			}
		}
	},
	render: function () {
		return (
            <tr id={"factorRow-"+this.props.index} ref="factorRowElem" className="factorRow">
                <td className="span3 datastream-name">{this.props.factor.datastreamname}</td>
                <td className="span1 text-center shift-factor">{this.props.factor.shiftfactor}</td>
                <td className="span1 text-center rank">{this.props.factor.rank}</td>
                <td className="span1 text-right coefficent-formatted">{this.props.factor.coefficientFormatted}</td>
                <td className="span3">
                    <div ref="factorRowSlider" 
                    	className={"forecast-slider forecast-slider-"+this.props.index+" independent ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"}
                    	aria-disabled="false" 
                    	value={this.props.factor['state'].value}></div>
                    <div className={"range range-"+this.props.index+" muted text-center"} style={{width:"100%"}}>
                        <span ref="minValue" className="pull-left text-left minValue">0</span>
                        <span ref="avgValue" className="text-center avgValue"></span>
                        <span ref="maxValue" className="pull-right text-right maxValue"></span>
                    </div>
                </td>
                <td className="span3">
                    <div className="input-prepend input-append">
                            {function() {
                            	if(this.props.factor['state'].solveId){
                            		return (
				                        <div className="btn-group">
				                            <input 
		                                    	onKeyUp={this.props.forecastKeyUpHandler}
		                                    	onKeyDown={this.props.forecastKeyDownHandler}
		                                    	onChange={this.props.forecastChangeHandler}
		                                    	ref="forecastElem"
				                            	className={"forecast forecast-"+this.props.index+" independent span2"}
				                            	id={"forecast-"+this.props.index}
				                            	type="text" 
				                            	disabled="true" 
				                            	data-stream-id={this.props.factor.datastreamid}
				                            	data-resetvalue={this.props.factor['state'].value} 
				                            	data-solve-id={this.props.factor['state'].solveId}
				                            	defaultValue={this.props.factor['state'].value} 
				                            	data-coefficient={this.props.factor.coefficient}/>
				                            <button id={"solve-"+this.props.index} 
				                            	className="btn solve independent solving icon-star" 
				                            	onClick={this.props.solveHandler}
				                            	type="button" 
				                            	data-resetvalue="true" 
				                            	data-original-title="Currently solving for this test value" 
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
					                            className={"forecast forecast-"+this.props.index+" independent span2"} 
		                                    	ref="forecastElem"
				                            	id={"forecast-"+this.props.index}
				                            	type="text" 
				                            	data-stream-id={this.props.factor.datastreamid}
				                            	data-resetvalue={this.props.factor['state'].value}
				                            	defaultValue={this.props.factor['state'].value}
				                            	data-coefficient={this.props.factor.coefficient} />
				                            <button id={"solve-"+this.props.index}
				                            	className="btn solve independent icon-star-empty" 
				                            	onClick={this.props.solveHandler}
				                            	type="button" 
				                            	ref="solvingButton"
				                            	data-resetvalue="" 
				                            	data-original-title="Click to solve for this test value" 
				                            	data-toggle="tooltip">
				                            </button>
				                        </div>
                        			);
                            	}
                            }.call(this)}
                    </div>
                </td>
            </tr>
		);
	}

});

FactorSliderRow.propTypes = {
	index: React.PropTypes.number.isRequired,
	factor: React.PropTypes.object.isRequired,
	triggerReset: React.PropTypes.func.isRequired,
	forecastKeyUpHandler: React.PropTypes.func.isRequired,
	forecastKeyDownHandler: React.PropTypes.func.isRequired,
	forecastChangeHandler: React.PropTypes.func.isRequired,
	updateSlider: React.PropTypes.func.isRequired,
	solveHandler: React.PropTypes.func.isRequired,
	forecastSlideHandler: React.PropTypes.func.isRequired,
	forecastSlideChangeHandler: React.PropTypes.func.isRequired
};

module.exports = FactorSliderRow;