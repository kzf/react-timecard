var Timesheet = React.createClass({
  getInitialState: function() {
    return {
      workHours: [
        {value: 'Not Working', size: 120},
        {value: 'Working', size: 210},
        {value: 'Not Working', size: 60},
        {value: 'Working', size: 240},
        {value: 'Not Working', size: 90},
      ],
      partitions: [
        {value: 'A', size: 10},
        {value: 'B', size: 20},
        {value: 'C', size: 40},
        {value: 'D', size: 5},
      ],
    };
  },
  
  handleWorkHoursChange: function(newWorkHours) {
    this.setState({workHours: newWorkHours});
  },
  
  handlePartitionChange: function(newPartitions) {
    this.setState({partitions: newPartitions});
  },
  
  validateWorkHours: function(workHours) {
    
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    return (
      <div>
        <PartitionSelector partitions={this.state.workHours} handlePartitionChange={this.handleWorkHoursChange} validatePartition={this.validateWorkHours} minorMarkers={15} majorMarkers={60} />
        
        <PartitionSelector partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} minorMarkers={4} majorMarkers={12} />
        <ul>
          {list}
        </ul>
        <TimesheetTable partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
      </div>
    );
  }
});