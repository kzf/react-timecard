var Timesheet = React.createClass({
  getInitialState: function() {
    return {
      partitions: [
        {name: 'A', size: 10},
        {name: 'B', size: 20},
        {name: 'C', size: 40},
        {name: 'D', size: 5},
      ],
    };
  },
  
  handlePartitionChange: function(newPartitions) {
    this.setState({partitions: newPartitions});
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    return (
      <div>
        <PartitionSelector partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} minorMarkers={4} majorMarkers={12} />
        <ul>
          {list}
        </ul>
        <TimesheetTable partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
      </div>
    );
  }
});