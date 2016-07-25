
var PartitionSelector = React.createClass({
  getInitialState: function() {
    return {
      partitions: [
        {name: 'A', size: 10},
        {name: 'B', size: 40},
        {name: 'C', size: 20},
        {name: 'D', size: 10},
      ]
    };
  },
  totalSize: function() {
    return this.state.partitions.map(p => p.size).reduce((a,b) => a + b, 0);
  },
  calculatePercentWidth: function(width) {
    return Math.round(width * 10000) / 100 + '%';
  },
  renderPartition: function(partition, key, width) {
    // takes a width in percent e.g. 0.42
    console.log('rendering', key ,width);
    var style = {width: this.calculatePercentWidth(width)};
    return (
      <div key={key} className="cell" size={width} style={style}>
        {partition.name}
        <div className="handle"></div>
      </div>
    );
  },
  render: function() {
    var totalSize = this.totalSize();
    var partitions = this.state.partitions.map(function(partition, i) {
      return this.renderPartition(partition, i, partition.size / totalSize);
    }.bind(this));
    return (
      <div className="partition-selector">
        {partitions}
      </div>
    );
  }
});

ReactDOM.render(
  <PartitionSelector />,
  document.getElementById('bar')
);