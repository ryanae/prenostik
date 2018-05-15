var React = require('react');
var cx = require('classnames');


var AnalyzeErrors = React.createClass({
  render: function () {
  	var cName = cx({
  		'hide': this.props.errorMessage ? true : false,
  		'error-box': true	
  	});
    return (
      <div className={cName}>
      	<div>
	      	<p>{this.props.errorMessage.toString()}</p>
      	</div>
      </div>
    );
  }
});


module.exports = AnalyzeErrors;