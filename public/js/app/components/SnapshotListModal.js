var React = require('react');
var ReactDOM = require('react-dom');

var SnapshotRow = React.createClass({
	closeWhenOpen: function(e){
		e.preventDefault();
		console.log('prevented');
		this.props.closeModal();
		console.log('grabbing link')
		var href = "/analyze/trending/" +this.props.snapshot.id;
	    window.router.navigate(href, {trigger: true});
	},
	render: function () {
		return (
			<tr>
				<td>{this.props.snapshot.name}</td>
				<td>{this.props.snapshot.createdFormatted}</td>
				<td><a ref="snapshotLink" 
					  className="btn btn-mini btn-primary btn-open" 
					  onClick={this.closeWhenOpen}
					  data-worksheetid={this.props.snapshot.id}>
					  <i className="icon-folder-open"></i> Open</a>
				</td>
			</tr>

		)
	}
});

var SnapshotsTable = React.createClass({
	render: function () {
		var snapshotRows = this.props.snapshots.map(function(snapshot){
			return <SnapshotRow key={snapshot.id} closeModal={this.props.closeModal} snapshot={snapshot} />
		}, this);
		if(!snapshotRows){
			snapshotRows = <p>You have not saved any snapshots yet.</p>;
		}
		return (
			<table className="table table-striped">
				<thead>
					<tr>
						<th>Name</th>
						<th>Created</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{snapshotRows}
				</tbody>
			</table>
		)	
	}
});

SnapshotsTable.propTypes = {
	snapshots: React.PropTypes.array
}

var SnapshotListModal = React.createClass({
	closeModal: function(){
		console.log('called');
		$(ReactDOM.findDOMNode(this.refs.snapModal)).modal('hide');
	},

	shouldComponentUpdate: function(nextProps, nextState) {
		return nextProps.snapshots != this.props.snapshots;
	},

	render: function () {
		return (
			<div id="openWorksheetModal" ref="snapModal" className="modal hide fade">
			    <div className="modal-header">
			        <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			        <h3>Open Snapshot</h3>
			    </div>
			    <div className="modal-body">
			    	{function(){
			    		if(this.props.snapshots) {
					    	return <SnapshotsTable closeModal={this.closeModal} snapshots={this.props.snapshots} />
			    		} else {
			    			return <div className="well"><img src="/img/ajax-loader-circle.gif"/> &nbsp; Loading Snapshots...</div>
			    		}
				 	}.call(this)}
			    </div>
			    <div className="modal-footer">
			        <a href="#" className="btn" data-dismiss="modal">Cancel</a>
			    </div>
			</div>
		)
	}
});

SnapshotListModal.propTypes = {
	snapshots: React.PropTypes.array
}


module.exports = SnapshotListModal;