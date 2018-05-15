var React = require('react');
var ReactDOM = require('react-dom');
var cx = require('classnames');

var ForecastBaselineReference = require('./ForecastBaselineReference');
var ForecastBaselineTest = require('./ForecastBaselineTest');

var ForecastBaselineBox = React.createClass({
	render: function() {
        var classes = cx({
            "tab-pane": true,
            "scenario": true,
            "baseline": true,
            "active": this.props.currentScenario == "baseline"
        });

		return (
	        <div 
                className={classes} 
                id="forecast-scenario-baseline">
                  <ForecastBaselineReference
                    forecastKeyUpHandler={this.props.forecastKeyUpHandler}
                    forecastKeyDownHandler={this.props.forecastKeyDownHandler}
                    forecastChangeHandler={this.props.forecastChangeHandler}
                    scenarioData={this.props.scenarioData}
                    resetScenario={this.props.resetScenario}
                    solveHandler={this.props.solveHandler}
                    forecastSlideHandler={this.props.forecastSlideHandler}
                    forecastSlideChangeHandler={this.props.forecastSlideChangeHandler} />
                  <ForecastBaselineTest
                    scenarioData={this.props.scenarioData}
                    solveHandler={this.props.solveHandler}
                    updateSlider={this.props.updateSlider}
                    forecastSlideHandler={this.props.forecastSlideHandler}
                    forecastSlideChangeHandler={this.props.forecastSlideChangeHandler} />
	        </div>
		)
	}
});


module.exports = ForecastBaselineBox;