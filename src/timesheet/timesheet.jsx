var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  START_TIME: new Time(7, 0),
  END_TIME: new Time(7, 0, 'pm'),
  
  TIME_BREAKS: [[new Time(9,0), new Time(12,30,'pm')], [new Time(1,30,'pm'), new Time(5,30,'pm')]],
  
  converter: new TimesheetConverter(),
  colorGenerator: new ColorGenerator(),
  
  getInitialState: function() {
    console.log('aa', this.converter.calculatePartitionsForTimes([
      {value: 'A', startTime: new Time('7:00'), endTime: new Time('7:10')}, 
      {value: 'B', startTime: new Time('7:10'), endTime: new Time('7:30')},
      {value: 'C', startTime: new Time('8:00'), endTime: new Time('8:30')}],
      [[new Time(7,0), new Time(7,30)], [new Time(8,30), new Time(9,0)]]
    ));
    
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
        {value: 'A', size: 150, tooltip: 'First Partition'},
        {value: 'B', size: 100, tooltip: 'Second Partition'},
        {value: 'C', size: 70, tooltip: 'C Partition'},
        {value: 'D', size: 130, tooltip: 'LAST Partition'},
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
  
  handleTimesChange: function(newTimes) {
    this.setState({partitions: this.converter.calculatePartitionsForTimes(newTimes, this.TIME_BREAKS)});
  },
  
  validateWorkHours: function(workHours) {
    return workHours.filter((p) => p.value).reduce((a,b) => a + b.size, 0) >= this.MIN_WORK_MINUTES;
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    var times = this.converter.calculateTimesForPartitions(this.state.partitions, this.TIME_BREAKS);
    var timesUL = times.map((t, i) => (
      <li key={i}>{t.startTime.toString()} - {t.endTime.toString()}</li>
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
                           labels={[['10:00AM', 60], ['14:00AM', 180]]}
                           minorMarkers={60}
                           majorMarkers={120} />
        <ul>
          {list}
        </ul>
        <ul>
          {timesUL}
        </ul>
        <TimesheetTable times={times}
                        handleTimesChange={this.handleTimesChange} />
      </div>
    );
  }
});