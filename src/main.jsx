
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
  splitPartition: function(key, event) {
    var partition = this.state.partitions[key];
    console.log('splitting partition', key, partition);
    var partitions = this.state.partitions.concat([]);
    partitions.splice(key, 1, {name: partition.name, size: partition.size - 10});
    partitions.splice(key, 0, {name: 'N', size: 10});
    console.log('new partitions', partitions);
    this.setState({partitions: partitions});
  },
  
  startDragHandle: function(key) {
    console.log('starting dragging', key);
  },
  
  renderPartition: function(partition, key, width) {
    // takes a width in percent e.g. 0.42
    console.log('rendering', partition.name, key ,width);
    var style = {width: this.calculatePercentWidth(width)};
    return (
      <div key={key} className="cell" size={width} style={style} onDoubleClick={(e) => this.splitPartition(key, e)}>
        {partition.name}
        <div className="handle" onDrag={() => this.startDragHandle(key)}></div>
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