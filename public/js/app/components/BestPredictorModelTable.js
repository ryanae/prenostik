var React = require('react');

var FactorRow = React.createClass({
	render: function() {
		return (
			<tr>
				<td>{this.props.factor.datastreamname}</td>
				<td className="span1 text-center">{this.props.factor.shiftfactor}</td>
				<td className="span1 text-center">
					<div data-toggle="tooltip" 
						data-original-title={"P value: "+this.props.factor.pvalformatted}>{this.props.factor.rank}</div>
				</td>
				<td className="span1 text-center">{this.props.factor.adjustedpercentagecorrelated}</td>
                <td className="span1 text-right">{this.props.factor.coefficientformatted}</td>
			</tr>
		);
	}
});

var BestPredictorModelTable = React.createClass({
	render: function() {
	    console.log('BPTABLE', this.props.bestPredictorTableData);
		return (
			<div className="well best-predictor-model-table-container">
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Test Data</th>
							<th className="text-center">Time Shift ({this.props.bestPredData.shiftType})</th>
							<th className="text-center">Rank</th>
			                <th className="text-center">Percentage Correlated</th>
			                <th className="text-center">Coefficient</th>
						</tr>
					</thead>
					<tbody>
						{function(){
							if(this.props.bestPredData.autofactorreduce && this.props.bestPredData.autofactorreduce.factors){
								return this.props.bestPredData.autofactorreduce.factors.map(function(factor, index){
									return (
										<FactorRow factor={factor} key={index} />	
									);
								}, this);
							}
						}.call(this)}
					</tbody>
				</table>

				<div className="well well-small">
					<h6 className="text-center">
						{function() {
							if(this.props.bestPredData.autofactorreduce){
								return 	(
									<b>Combined Percentage Correlation: {this.props.bestPredData.autofactorreduce.percentagecorrelatedrounded}%</b>
								);
							}	
						}.call(this)}
					</h6>
				</div>
			</div>
		);
	}
});

module.exports = BestPredictorModelTable;