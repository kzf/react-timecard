var Timesheet = React.createClass({
  MIN_WORK_MINUTES: 7.5 * 60,
  START_TIME: new Time(7, 0),
  END_TIME: new Time(7, 0, 'pm'),

  converter: new TimesheetConverter(),
  colorGenerator: new ColorGenerator(),
  workHoursColorGenerator: new ColorGenerator(),
  tooltips: {
    working: 'Work Hours',
  },

  themes: {
    'bootstrap': {
      'ReactTimesheet': '',
      'ReactTimesheet_container': 'row',
      'ReactTimesheet_docks': 'col-sm-4',
      'ReactTimesheet_times': 'col-sm-8',
      'PartitionSelector_parts': 'progress',
      'PartitionSelector_bar': 'progress-bar',
    }
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
    this.workHoursColorGenerator.addColor(undefined, '#fafafa');
    this.workHoursColorGenerator.addColor('working', '#ccc');

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
            )), timeBreaks),
            date = new Date(day.date);
        return {
          name: day.name,
          dayNumber: date.getDate(),
          shortname: day.name.substring(0,3),
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
      shortname: day.shortname,
      dayNumber: day.dayNumber,
      date: day.date,
      partitions: (typeof newPartitions === 'undefined' ? day.partitions : newPartitions),
      partitionsHistory: day.partitionsHistory.concat([day.partitions]),
      partitionsFuture: [],
      workHours: (typeof newWorkHours === 'undefined' ? day.workHours : newWorkHours),
    }
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
                           customClass={'ReactTimesheet_work_hours_select'}
                           getClass={this._class}
                           handlePartitionChange={(w) => this.handleWorkHoursChange(i, w)}
                           validatePartitions={this.validateWorkHours}
                           labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                           colorGenerator={this.workHoursColorGenerator}
                           minorMarkers={15}
                           majorMarkers={60} />
      );
    }
    return (
      <div key={i} className={this._class('ReactTimesheet_part_day')}>
        <div className={this._class('ReactTimesheet_part_titles')}>
          <span className={this._class('ReactTimesheet_part_shortname')}>{day.shortname}</span>
          <span className={this._class('ReactTimesheet_part_dayNumber')}>{day.dayNumber}</span>
        </div>
        <div className={this._class('ReactTimesheet_part_selectors')}>
          {customWorkHours}

          <PartitionSelector partitions={this.applyTooltips(day.partitions)}
                             handlePartitionChange={(p) => this.handlePartitionChange(i, p)}
                             colorGenerator={this.colorGenerator}
                             getClass={this._class}
                             labels={markersAndLabels.labels}
                             handleDrop={(i, cell) => this.tooltips[cell.value] = cell.tooltip}
                             minorMarkers={markersAndLabels.minorMarkers}
                             majorMarkers={markersAndLabels.majorMarkers} />
        </div>
        <div className={this._class('ReactTimesheet_work_hours_toggle')}>
          <label>
            <input type="checkbox" checked={!!day.workHours} onClick={() => this.toggleCustomWorkHours(i)} />
            <span>Custom Work Hours</span>
          </label>
        </div>
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

  _class: function(className) {
    var theme = this.getTheme();
    if (!theme) return className;
    return className + ' ' + (theme[className] || '');
  },

  getTheme: function() {
    var theme = this.props.theme || 'bootstrap';
    if (typeof theme === 'string') {
      return this.themes[theme];
    } else {
      return theme;
    }
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
              onSubmit={this.handleFormSubmit}
              className={this._class('ReactTimesheet')}>

          {this.renderHiddenFields()}

          <div className={this._class('ReactTimesheet_container')}>
            <div className={this._class('ReactTimesheet_times')}>
              {this.renderDayPartitions()}

              {this.renderSubmitButton()}

              {this.renderDayTables()}

              {this.renderSubmitButton()}
            </div>


            <div className={this._class('ReactTimesheet_docks')}>
              <Dock activeActivities={this.getActiveActivities()}
                    colorGenerator={this.colorGenerator}
                    panels={this.props.panels}/>
            </div>
          </div>
        </form>
      );
    }
  }
});
