var React = require('react');

var ShiftRow = React.createClass({
	render: function() {
		return (
			<tr>
				<td>{this.props.shiftItem.datastreamname}</td>
				<td>{this.props.shiftItem.shiftfactor}</td>
				<td>{this.props.shiftItem.adjustedpecentagecorrelated}</td>
			</tr>
		);
	}
});

var CorrelationTable = React.createClass({
	componentDidMount: function(){
	},
	componentDidUpdate: function(prevProps, prevState) {
	},
	render: function() {
		var shiftRows = null; 
		if(this.props.shiftData.shifts){
			shiftRows =  this.props.shiftData.shifts.map(function(shiftItem, index){
				return <ShiftRow shiftItem={shiftItem} key={index} />
			}, this);
		}
		return (
			<div className="well top-correlation-table-container">
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Test Data</th>
							<th>Time Shift ({this.props.shiftData.shiftType})</th>
							<th>Percentage Correlated</th>
						</tr>
					</thead>
					<tbody>
						{shiftRows}
					</tbody>
				</table>
			</div>
		);	
	}
});

CorrelationTable.propTypes = {
	shiftData: React.PropTypes.object.isRequired	
}


module.exports = CorrelationTable;