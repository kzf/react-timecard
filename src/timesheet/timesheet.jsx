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
  
  getActiveActivities: function() {
    var activeActivities = {},
        activeActivitiesArray = [],
        key;
    this.state.partitions.forEach(function(partition) {
      activeActivities[partition.value] = partition;
    });
    for (key in activeActivities) {
      if (activeActivities.hasOwnProperty(key)) {
        activeActivitiesArray.push(activeActivities[key]);
      }
    }
    return [
      {
        label: "Active Activities",
        activities: this.applyTooltips(activeActivitiesArray)
      }
    ];
  },
  
  loadCurrentActivity: function(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', '/api_samples/activity.json', true);
    xhr.onreadystatechange = function() {
      var data, categories;
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          data = JSON.parse(xhr.responseText);
          categories = data.actions.days.map((day) => (
            {
              label: day.date,
              activities: day.actions.map((action) => (
                {
                  value: '#' + action.ticket.id,
                  tooltip: action.ticket.title,
                  badge: action.time,
                }
              )),
            }
          ));
          callback(categories);
        }
      }
    };
    xhr.send();
  },
  
  loadLastWeeksTimesheet: function(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', '/api_samples/last_week.json', true);
    xhr.onreadystatechange = function() {
      var data, categories;
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          data = JSON.parse(xhr.responseText);
          categories = data.map((day) => (
            {
              label: day.date,
              activities: day.work_logs.map((action) => (
                {
                  value: '#' + action.ticket_id,
                  tooltip: action.title,
                }
              )),
            }
          ));
          callback(categories);
        }
      }
    };
    xhr.send();
  },
  
  render: function() {
    var list = this.state.partitions.map((p, i) => (
                 <li key={i}>Partition {p.name}: size {p.size}</li>
               )),
        timeBreaks = this.timeBreaks();
    var times = this.converter.calculateTimesForPartitions(this.state.partitions, timeBreaks);
    var timesUL = times.map((t, i) => (
      <li key={i}>{t.startTime.toString()} - {t.endTime.toString()}</li>
    ));
    return (
      <div className="row">
        <div className="col-sm-7">
          <PartitionSelector partitions={this.applyTooltips(this.state.workHours)}
                             customClass={'work-hours-select'}
                             handlePartitionChange={this.handleWorkHoursChange}
                             validatePartitions={this.validateWorkHours}
                             labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                             colorGenerator={this.colorGenerator}
                             minorMarkers={15}
                             majorMarkers={60} />
          
          <PartitionSelector partitions={this.applyTooltips(this.state.partitions)}
                             handlePartitionChange={this.handlePartitionChange}
                             colorGenerator={this.colorGenerator}
                             labels={this.converter.calculateLabelsForTimeBreaks(timeBreaks)}
                             minorMarkers={15}
                             majorMarkers={60} />
                           
          <TimesheetTable times={times}
                          timeBreaks={timeBreaks}
                          colorGenerator={this.colorGenerator}
                          handleTimesChange={this.handleTimesChange} />
        </div>
        <div className="col-sm-5">
          <Dock activeActivities={this.getActiveActivities()}
                colorGenerator={this.colorGenerator}
                panels={[
                  {
                    title: 'This Week',
                    source: this.loadCurrentActivity,
                  },
                  {
                    title: 'Last Week',
                    source: this.loadLastWeeksTimesheet,
                  }
                ]}/>
        </div>
      </div>
    );
  }
});