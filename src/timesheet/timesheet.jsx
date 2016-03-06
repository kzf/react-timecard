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
    var duration = this.MIN_WORK_MINUTES;
    this.colorGenerator.addColor(undefined, '#eee');
    return {
      workHours: [
        {size: 120},
        {value: 'working', size: 210},
        {size: 60},
        {value: 'working', size: 240},
        {size: 90},
      ],
      days: [
        {
          name: 'Monday',
          partitions: [{size: duration}],
        },
        {
          name: 'Tuesday',
          partitions: [{size: duration}],
        },
        {
          name: 'Wednesday',
          partitions: [{size: duration}],
        },
        {
          name: 'Thursday',
          partitions: [{size: duration}],
        },
        {
          name: 'Friday',
          partitions: [{size: duration}],
        },
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
  
  handleWorkHoursChange: function(key, newWorkHours) {
    // TODO: Update the partitions based on the new work hours
    var partitions = this.state.days[key].partitions,
        newDays = this.state.days.concat([]),
        newTotalSize = newWorkHours.filter((p) => p.value == 'working').reduce((a, b) => a + b.size, 0),
        oldTotalSize = partitions.reduce((a, b) => a + b.size, 0),
        multiplier = newTotalSize/oldTotalSize;
    newDays.splice(key, 1, {
      name: this.state.days[key].name,
      partitions: partitions.map((p) => ({value: p.value, size: p.size * multiplier})),
    })
    this.setState({
      workHours: newWorkHours,
      days: newDays,
      // resize partitions to have the correct size
    });
  },
  
  handlePartitionChange: function(key, newPartitions) {
    var newDays = this.state.days.concat([]);
    newDays.splice(key, 1, {
      name: this.state.days[key].name,
      partitions: newPartitions
    });
    this.setState({days: newDays});
  },
  
  applyTooltips: function(partitions) {
    return partitions.map((partition) => (
      {value: partition.value, size: partition.size, tooltip: this.tooltips[partition.value]}
    ));
  },
  
  handleTimesChange: function(key, newTimes) {
    console.log('handle times change', key, newTimes);
    var newDays = this.state.days.concat([]);
    newDays.splice(key, 1, {
      name: this.state.days[key].name,
      partitions: this.converter.calculatePartitionsForTimes(newTimes, this.timeBreaks())
    });
    this.setState({days: newDays});
  },
  
  validateWorkHours: function(workHours) {
    return workHours.filter((p) => p.value).reduce((a,b) => a + b.size, 0) >= this.MIN_WORK_MINUTES;
  },
  
  getActiveActivities: function() {
    var activeActivities = {},
        activeActivitiesArray = [],
        key;
    this.state.days.forEach(function(day) {
      day.partitions.forEach(function(cell) {
        if (cell.value) activeActivities[cell.value] = cell;
      });
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
  
  renderDayPartitions: function(timeBreaks) {
    return (
      this.state.days.map((day, i) => (
        <div key={i}>
          <h4>{day.name}</h4>
          <PartitionSelector partitions={this.applyTooltips(day.partitions)}
                             handlePartitionChange={(p) => this.handlePartitionChange(i, p)}
                             colorGenerator={this.colorGenerator}
                             labels={this.converter.calculateLabelsForTimeBreaks(timeBreaks)}
                             minorMarkers={15}
                             majorMarkers={60} />
        </div>
      ))
    );
  },
  
  renderDayTables: function(timeBreaks) {
    var times = this.state.days.map((day) => (
      {
        name: day.name,
        array: this.converter.calculateTimesForPartitions(day.partitions, timeBreaks),
      }
    ));
    return times.map((time, i) => (
      <div key={i}>
        <h4>{time.name}</h4>
        <TimesheetTable times={time.array}
                        timeBreaks={timeBreaks}
                        colorGenerator={this.colorGenerator}
                        handleTimesChange={(times) => this.handleTimesChange(i, times)} />
      </div>
    ));
  },
  
  render: function() {
    var timeBreaks = this.timeBreaks();
    return (
      <div className="row">
        <div className="col-sm-7">
          <PartitionSelector partitions={this.applyTooltips(this.state.workHours)}
                             customClass={'work-hours-select'}
                             handlePartitionChange={(w) => this.handleWorkHoursChange(0, w)}
                             validatePartitions={this.validateWorkHours}
                             labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                             colorGenerator={this.colorGenerator}
                             minorMarkers={15}
                             majorMarkers={60} />
                           
          {this.renderDayPartitions(timeBreaks)}
          {this.renderDayTables(timeBreaks)}
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