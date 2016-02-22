var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  START_TIME: new Time(7, 0),
  END_TIME: new Time(7, 0, 'pm'),
  
  converter: new TimesheetConverter(),
  colorGenerator: new ColorGenerator(),
  tooltips: {
    'A': 'First Tooltip',
    'B': 'Second Tooltip',
    'C': 'Third Tooltip',
    'D': 'Fourth Tooltip',
    'working': 'Work Hours',
  },
  
  getInitialState: function() {
    this.colorGenerator.addColor(undefined, '#eee');
    return {
      workHours: [
        {size: 120},
        {value: 'working', size: 210},
        {size: 60},
        {value: 'working', size: 240},
        {size: 90},
      ],
      partitions: [
        {value: 'A', size: 150},
        {value: 'B', size: 100},
        {value: 'C', size: 70},
        {value: 'D', size: 130},
      ],
    };
  },
  
  timeBreaks: function() {
    return this.converter.calculateTimesForPartitions(
             this.state.workHours,
             [[this.START_TIME, this.END_TIME]]
           ).filter(
             (t) => t.value
           ).map(
             (t) => [t.startTime, t.endTime]
           );
  },
  
  handleWorkHoursChange: function(newWorkHours) {
    // TODO: Update the partitions based on the new work hours
    var newTotalSize = newWorkHours.filter((p) => p.value == 'working').reduce((a, b) => a + b.size, 0),
        oldTotalSize = this.state.partitions.reduce((a, b) => a + b.size, 0),
        multiplier = newTotalSize/oldTotalSize;
        console.log(newTotalSize, oldTotalSize, multiplier);
    this.setState({
      workHours: newWorkHours,
      partitions: this.state.partitions.map((p) => ({value: p.value, size: p.size * multiplier})),
      // resize partitions to have the correct size
    });
  },
  
  handlePartitionChange: function(newPartitions) {
    this.setState({partitions: newPartitions});
  },
  
  applyTooltips: function(partitions) {
    return partitions.map((partition) => (
      {value: partition.value, size: partition.size, tooltip: this.tooltips[partition.value]}
    ));
  },
  
  handleTimesChange: function(newTimes) {
    this.setState({partitions: this.converter.calculatePartitionsForTimes(newTimes, this.timeBreaks())});
  },
  
  validateWorkHours: function(workHours) {
    return workHours.filter((p) => p.value).reduce((a,b) => a + b.size, 0) >= this.MIN_WORK_MINUTES;
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
      <li key={i}>Partition {p.name}: size {p.size}</li>
    ));
    var times = this.converter.calculateTimesForPartitions(this.state.partitions, this.timeBreaks());
    var timesUL = times.map((t, i) => (
      <li key={i}>{t.startTime.toString()} - {t.endTime.toString()}</li>
    ));
    return (
      <div>
        <PartitionSelector partitions={this.applyTooltips(this.state.workHours)}
                           handlePartitionChange={this.handleWorkHoursChange}
                           validatePartitions={this.validateWorkHours}
                           labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                           colorGenerator={this.colorGenerator}
                           minorMarkers={15}
                           majorMarkers={60} />
        
                         <PartitionSelector partitions={this.applyTooltips(this.state.partitions)}
                           handlePartitionChange={this.handlePartitionChange}
                           colorGenerator={this.colorGenerator}
                           labels={this.converter.calculateLabelsForTimeBreaks(this.timeBreaks())}
                           minorMarkers={15}
                           majorMarkers={60} />
        <ul>
          {list}
        </ul>
        <ul>
          {timesUL}
        </ul>
        <TimesheetTable times={times}
                        timeBreaks={this.timeBreaks()}
                        handleTimesChange={this.handleTimesChange} />
      </div>
    );
  }
});