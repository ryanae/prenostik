var React = require('react');

var PendingDataset = React.createClass({
  render: function() {
    return (
      <li>{this.props.datasetName}</li>
    );
  }
});

var PendingDatasetBox = React.createClass({

  render: function() {
    var pdStyles = {
      pendingStyles: {
        position: 'absolute',
        right: '10px',
        top: '300px',
        marginRight: '30px',
        width: '300px',
        zIndex: '1',
        borderRadius: '5px',
        backgroundColor: '#fff',
        paddingLeft: '5px',
        paddingTop: '5px'
      },
      pdHeader: {
        fontSize: '18px',
        fontWeight: '600'
      },
      pdBody: {
        maxHeight: '180px',
        height: '180px',
        overflow: 'scroll'
      }
    };
    return (
        <div
          style={pdStyles.pendingStyles}>
          <div>
            <div style={pdStyles.pdHeader}>
              Pending Datasets
            </div>
            <hr/>
            <div style={pdStyles.pdBody}>
              <ul>
                {function(){
                  return this.props.pendingDatasets.map(function(datasetName, index){
                    return <PendingDataset datasetName={datasetName} key={index}/>
                  });
                }.call(this)}
              </ul>
            </div>
          </div>
        </div>
    );
  }
});

module.exports = PendingDatasetBox;