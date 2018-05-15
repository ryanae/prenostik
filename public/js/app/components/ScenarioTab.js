var React = require('react');
var cx = require('classnames');

var ScenarioTab = React.createClass({
	removeScenarioHandler: function(e){
		e.stopPropagation();
		console.log('[ScenarioTab] called removeScenarioHandler');
        var $scenarioContainer = $(e.currentTarget)
        	.closest('.scenarioContainer');
		this.props.removeScenario($scenarioContainer, 
			this.props.scenario.id);
	},
    componentDidUpdate: function(){
        $(window).resize();
    },
	render: function() {
        console.log('scenarioId', this.props.scenario.id, 
            this.props.currentScenario)
        var classes = cx({
            "btn": true,
            "btn-scenario": true,
            "active": this.props.scenario.id == this.props.currentScenario
        })
		return (
            <button onClick={this.props.scenarioBtnHandler.bind(null, this.props.scenario.id)} className={classes} data-section={"#forecast-scenario-tab"+this.props.index}>
                <i className="status"></i>&nbsp;<span className="name">{this.props.scenario.title}</span>&nbsp;&nbsp;<i onClick={this.removeScenarioHandler} className="icon-remove-sign"></i>
                <input id="forecastId" type="hidden" value={this.props.scenario.id}/>
            </button>
		);
	}
});

module.exports = ScenarioTab;