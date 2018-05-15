var React = require('react');
var ReactDOM = require('react-dom');
var cx = require('classnames');

var FactorRowBox = React.createClass({
	componentDidMount: function() {
		var elem = ReactDOM.findDOMNode(this.refs.fSlider);
		$(elem).on('slidechange', this.props.forecastSlideChangeHandler);
		$(elem).on('slide', this.props.forecastSlideHandler);
	},
	componentDidUpdate: function() {
	},
	render: function() {
		var fslider = "forecast-slider-"+this.props.index;
		var cd1 = {
			  "forecast-slider": true,
			  "independent": true,
			  "ui-slider": true,
			  "ui-slider-horizontal": true,
			  "ui-widget": true,
			  "ui-widget-content": true,
			  "ui-corner-all": true,
		}
		cd1[fslider] = true;
		var classNameDict1 = cx(cd1);

		var rangeIndexClass = "range-"+this.props.index;
		var cd2 = {
		  "range": true,
		  "muted": true,
		  "text-center": true,
		}
		cd2[rangeIndexClass] = true;
		var classNameDict2 = cx(cd2);
		return (
            <tr id={"factorRow-"+this.props.index} className="factorRow">
                <td className="span3 datastream-name">{this.props.factor.datastreamname}</td>
                <td className="span1 text-center shift-factor">{this.props.factor.shiftfactor}</td>
                <td className="span1 text-center">
                	<div data-toggle="tooltip" 
                		data-pvalformatted={this.props.factor.pvalformatted}
	                	data-original-title={"P value: "+this.props.factor.pvalformatted}
	                	className="pval rank">{this.props.factor.rank}
                	</div>
            	</td>
                <td className="span1 text-right coefficient-formatted">{this.props.factor.coefficientFormatted}</td>
                <td className="span3">
                    <div ref="fSlider" 
                        className={classNameDict1} 
                    	aria-disabled="false"></div>
                    <div className={classNameDict2} style={{width: "100%"}}>
                        <span className="pull-left text-left minValue">0</span>
                        <span className="text-center avgValue"></span>
                        <span className="pull-right text-right maxValue"></span>
                    </div>
                </td>
                <td className="span3">
                    <div className="input-prepend input-append">
                        <div className="btn-group">
                            <input className={"forecast forecast-"+this.props.index+" independent span2"}
                            	id={"forecast-"+this.props.index}
                            	type="text" 
                            	data-stream-id={this.props.factor.datastreamid}
                            	data-resetvalue="" 
                            	data-coefficient={this.props.factor.coefficient}/>
                            <button id={"solve-"+this.props.index} 
                            	className="btn solve independent icon-star-empty" 
                            	onClick={this.props.solveHandler}
                            	type="button" 
                            	data-resetvalue="" 
                            	data-original-title="Click to solve for this test value" 
                            	data-toggle="tooltip">
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
		);
	}
});

FactorRowBox.propTypes = {
	index: React.PropTypes.number.isRequired,
	factor: React.PropTypes.object.isRequired,
	solveHandler: React.PropTypes.func.isRequired,
	updateSlider: React.PropTypes.func.isRequired,
	forecastSlideHandler: React.PropTypes.func.isRequired,
	forecastSlideChangeHandler: React.PropTypes.func.isRequired,
}

module.exports = FactorRowBox;