var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  START_TIME: new Time(7, 0),
  END_TIME: new Time(7, 0, 'pm'),

  converter: new TimesheetConverter(),
  colorGenerator: new ColorGenerator(),
  tooltips: {
    working: 'Work Hours',
  },

  getInitialState: function() {
    // TODO: Handle timeBreaks for non-default work hours being reloaded
    var defaultWorkHours = [
          {size: 120},
          {value: 'working', size: 210},
          {size: 60},
          {value: 'working', size: 240},
          {size: 90},
        ],
        timeBreaks = this.timeBreaks(defaultWorkHours);

    this.colorGenerator.addColor(undefined, '#eee');
    this.colorGenerator.addColor('working', '#aaa');

    this.props.initialTimes.forEach(function(day) {
      day.times.forEach(function(time) {
        this.tooltips[time.value] = time.tooltip;
      }.bind(this))
    }.bind(this));
    return {
      defaultWorkHours: defaultWorkHours,
      days: this.props.initialTimes.map(function(day) {
        var partitions = this.converter.calculatePartitionsForInitialTimes(day.times.map((time) => (
              {
                value: time.value,
                id: time.id,
                tooltip: time.tooltip,
                startTime: time.startTime && new Time(time.startTime),
                endTime: time.endTime && new Time(time.endTime),
              }
            )), timeBreaks);
        return {
          name: day.name,
          date: day.date,
          partitions: partitions,
          partitionsHistory: [],
          partitionsFuture: [],
          workHours: false,
        };
      }.bind(this)),
    };
  },

  timeBreaks: function(workHours) {
    return this.converter.calculateTimesForPartitions(
             workHours || this.state.defaultWorkHours,
             [[this.START_TIME, this.END_TIME]]
           ).filter(
             (t) => t.value
           ).map(
             (t) => [t.startTime, t.endTime]
           );
  },

  handleWorkHoursChange: function(key, newWorkHours, valueToChangeTo) {
    // TODO: Update the partitions based on the new work hours
    var partitions = this.state.days[key].partitions,
        newDays = this.state.days.concat([]),
        newTotalSize = newWorkHours.filter((p) => p.value == 'working').reduce((a, b) => a + b.size, 0),
        oldTotalSize = partitions.reduce((a, b) => a + b.size, 0),
        multiplier = newTotalSize/oldTotalSize;
    if (typeof valueToChangeTo === 'undefined') valueToChangeTo = newWorkHours;
    newDays.splice(key, 1, this.getUpdatedDay(this.state.days[key], partitions.map((p) => ({value: p.value, size: p.size * multiplier})), valueToChangeTo));
    this.setState({
      days: newDays,
    });
  },

  getUpdatedDay: function(day, newPartitions, newWorkHours) {
    return {
      name: day.name,
      date: day.date,
      partitions: (typeof newPartitions === 'undefined' ? day.partitions : newPartitions),
      partitionsHistory: day.partitionsHistory.concat([day.partitions]),
      partitionsFuture: [],
      workHours: (typeof newWorkHours === 'undefined' ? day.workHours : newWorkHours),
    }
  },

  undo: function(key) {

  },

  toggleCustomWorkHours: function(key) {
    var day = this.state.days[key];
    if (day.workHours) {
      this.handleWorkHoursChange(key, this.state.defaultWorkHours, false);
    } else {
      this.handleWorkHoursChange(key, this.state.defaultWorkHours);
    }
  },

  handlePartitionChange: function(key, newPartitions) {
    var newDays = this.state.days.concat([]);
    newDays.splice(key, 1, this.getUpdatedDay(this.state.days[key], newPartitions));
    this.setState({days: newDays});
  },

  applyTooltips: function(partitions) {
    return partitions.map((partition) => (
      {value: partition.value, size: partition.size, tooltip: this.tooltips[partition.value]}
    ));
  },

  handleTimesChange: function(key, newTimes) {
    var newDays = this.state.days.concat([]);
    newDays.splice(key, 1, this.getUpdatedDay(this.state.days[key], this.converter.calculatePartitionsForTimes(newTimes, this.timeBreaks())));
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

  getHiddenFieldsForValue: function(value) {
    if (value && value[0] === '#') {
      return [{
        name: 'ticket_id',
        value: value.substr(1),
      }];
    } else {
      return [{
        name: 'project_code',
        value: value,
      }];
    }
  },

  generateInputName: function(date, index, nameBase) {
    return 'user[work_logs_attributes][][' + nameBase + ']';
  },

  renderHiddenFields: function() {
    return (
      <div>
        <input type="hidden" name="method" value="_patch" />
        {this.props.initialTimes.map((day, i) => (
          <div key={i}>
            {day.times.map((time, j) => (
              <div key={j}>
                <input type="hidden" name={this.generateInputName(day.date, i, 'id')} value={time.id}/>
                <input type="hidden" name={this.generateInputName(day.date, i, '_destroy')} value="true"/>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },

  renderDayPartition: function(day, i) {
    var timeBreaks = this.timeBreaks(day.workHours || this.state.defaultWorkHours),
        markersAndLabels = this.converter.calculateMarkersAndLabelsForTimeBreaks(timeBreaks),
        customWorkHours = null;
    if (day.workHours) {
      customWorkHours = (
        <PartitionSelector partitions={this.applyTooltips(day.workHours || this.state.defaultWorkHours)}
                           customClass={'work-hours-select'}
                           handlePartitionChange={(w) => this.handleWorkHoursChange(i, w)}
                           validatePartitions={this.validateWorkHours}
                           labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                           colorGenerator={this.colorGenerator}
                           minorMarkers={15}
                           majorMarkers={60} />
      );
    }
    return (
      <div key={i} className="timesheet-partition-day">
        <h4>{day.name}</h4>
        <label>
          <input type="checkbox" checked={!!day.workHours} onClick={() => this.toggleCustomWorkHours(i)}/>
          Custom Work Hours
        </label>
        {customWorkHours}

        <PartitionSelector partitions={this.applyTooltips(day.partitions)}
                           handlePartitionChange={(p) => this.handlePartitionChange(i, p)}
                           colorGenerator={this.colorGenerator}
                           labels={markersAndLabels.labels}
                           handleDrop={(i, cell) => this.tooltips[cell.value] = cell.tooltip}
                           minorMarkers={markersAndLabels.minorMarkers}
                           majorMarkers={markersAndLabels.majorMarkers} />
      </div>
    );
  },

  renderDayPartitions: function(timeBreaks) {
    return (
      this.state.days.map((day, i) => this.renderDayPartition(day, i))
    );
  },

  renderDayTables: function() {
    var times = this.state.days.map(function (day) {
      var timeBreaks = this.timeBreaks(day.workHours || this.state.defaultWorkHours);
      return {
        name: day.name,
        array: this.converter.calculateTimesForPartitions(day.partitions, timeBreaks),
        timeBreaks: timeBreaks,
      };
    }.bind(this));
    return times.map((time, i) => (
      <div key={i}>
        <TimesheetTable times={time.array}
                        name={time.name}
                        getHiddenFieldsForValue={this.getHiddenFieldsForValue}
                        generateInputName={this.generateInputName}
                        timeBreaks={time.timeBreaks}
                        colorGenerator={this.colorGenerator}
                        handleTimesChange={(times) => this.handleTimesChange(i, times)} />
      </div>
    ));
  },

  renderSubmitButton: function() {
    return (
      <div className="row">
          <div className="col-xs-12">
              <div className="text-right">
                  <button type="submit" className="btn btn-primary">Submit</button>
              </div>
          </div>
      </div>
    );
  },

  render: function() {
    if (this.settings) {
      return (
        <div>
          <div className="row">

          </div>
        </div>
      );
    } else {
      return (
        <form ref='timesheetForm'
              action={this.props.formAction}
              method={this.props.formMethod || 'post'}
              onSubmit={this.handleFormSubmit}>

          {this.renderHiddenFields()}

          <div className="row">
            <div className="col-sm-7">
              {this.renderDayPartitions()}

              {this.renderSubmitButton()}

              {this.renderDayTables()}

              {this.renderSubmitButton()}
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
        </form>
      );
    }
  }
});
