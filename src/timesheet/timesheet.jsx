var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  START_TIME: new Time(7, 0),
  END_TIME: new Time(7, 0, 'pm'),
  
  converter: new TimesheetConverter(),
  colorGenerator: new ColorGenerator(),
  
  getInitialState: function() {
    this.colorGenerator.addColor(undefined, '#eee')
    return {
      workHours: [
        {size: 120},
        {value: 'working', size: 210, tooltip: 'Work Time'},
        {size: 60},
        {value: 'working', size: 240, tooltip: 'Work Time'},
        {size: 90},
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
    // TODO: Update the partitions based on the new work hours
    this.setState({workHours: newWorkHours});
  },
  
  handlePartitionChange: function(newPartitions) {
    this.setState({partitions: newPartitions});
  },
  
  validateWorkHours: function(workHours) {
    return workHours.filter((p) => p.value).reduce((a,b) => a + b.size, 0) >= this.MIN_WORK_MINUTES;
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
                           labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                           colorGenerator={this.colorGenerator}
                           minorMarkers={15}
                           majorMarkers={60} />
        
        <PartitionSelector partitions={this.state.partitions}
                           handlePartitionChange={this.handlePartitionChange}
                           colorGenerator={this.colorGenerator}
                           labels={[['10:00AM', 10], ['14:00AM', 30]]}
                           minorMarkers={2}
                           majorMarkers={120} />
        <ul>
          {list}
        </ul>
        <TimesheetTable partitions={this.state.partitions} handlePartitionChange={this.handlePartitionChange} />
      </div>
    );
  }
});