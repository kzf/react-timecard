var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  
  getInitialState: function() {
    return {
      workHours: [
        {value: 'Not Working', size: 120},
        {value: 'Working', size: 210, tooltip: 'Work Time'},
        {value: 'Not Working', size: 60},
        {value: 'Working', size: 240, tooltip: 'Work Time'},
        {value: 'Not Working', size: 90},
      ],
      partitions: [
        {value: 'A', size: 10, tooltip: 'First Partition'},
        {value: 'B', size: 20, tooltip: 'Second Partition'},
        {value: 'C', size: 40, tooltip: 'C Partition'},
        {value: 'D', size: 5, tooltip: 'LAST Partition'},
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
    return workHours.filter((p) => p.value === 'Working').reduce((a,b) => a + b.size, 0) >= this.MIN_WORK_MINUTES;
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    return (
      <div>
        <PartitionSelector partitions={this.state.workHours}
                           handlePartitionChange={this.handleWorkHoursChange}
                           validatePartitions={this.validateWorkHours}
                           minorMarkers={15}
                           majorMarkers={60} />
        
        <PartitionSelector partitions={this.state.partitions}
                           handlePartitionChange={this.handlePartitionChange}
                           labels={[['test', 10], ['test2', 30]]}
                           minorMarkers={60}
                           majorMarkers={120} />
        <ul>
          {list}
        </ul>
        <TimesheetTable partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
      </div>
    );
  }
});