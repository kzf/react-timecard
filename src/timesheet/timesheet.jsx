var Timesheet = React.createClass({
  converter: new TimesheetConverter(),

  colorGenerator: new ColorGenerator(),
  workHoursColorGenerator: new ColorGenerator(),


  tooltips: {
    working: 'Work Hours',
  },


  /*
  * A theme gives a way to modify the classes given to the various elements within
  * the timesheet so that classes from a CSS framework can be used.
  * One or more custom class names can be specified for each of the default class
  * names used by the timesheet.
  */
  themes: Timesheet.themes || {},

  // Accepts a {className} and will concatenate any custom class names that
  // are defined by the current theme
  _class: function(className) {
    var theme = this.getTheme();
    if (!theme) return className;
    return className + ' ' + (theme[className] || '');
  },

  // Get the curently active theme
  getTheme: function() {
    var theme = this.props.theme || 'bootstrap';
    if (typeof theme === 'string') {
      return this.themes[theme];
    } else {
      return theme;
    }
  },

  handleSubmit: function(e) {
    if (this.props.handleSubmit) {
      this.props.handleSubmit(e, this.refs.timesheetForm);
    }
  },

  getInitialState: function() {
    this.MIN_WORK_MINUTES = this.props.minWorkMinutes;
    this.START_TIME = new Time(this.props.startTime);
    this.END_TIME = new Time(this.props.endTime);

    // TODO: Handle timeBreaks for non-default work hours being reloaded
    var defaultWorkTimes = this.props.defaultWorkHours.map((t) => ({endTime: new Time(t.endTime), startTime: new Time(t.startTime), value: 'working'}));

    // TODO: Make localstorage can be saved via form
    if (this.props.saveDefaultWorkHours && window.localStorage && window.localStorage.getItem('ReactTimesheet_defaultWorkHours')) {
      defaultWorkTimes = JSON.parse(window.localStorage.getItem('ReactTimesheet_defaultWorkHours')).map((t) => ({endTime: new Time(t.endTime), startTime: new Time(t.startTime), value: 'working'}));
    }

    var defaultWorkHours = this.converter.calculatePartitionsForInitialTimes(defaultWorkTimes, [[this.START_TIME, this.END_TIME]]);
    var defaultTimeBreaks = this.timeBreaks(defaultWorkHours);

    this.colorGenerator.addColor(undefined, '#eee');
    this.workHoursColorGenerator.addColor(undefined, '#fafafa');
    this.workHoursColorGenerator.addColor('working', '#ccc');

    this.props.initialTimes.forEach(function(day) {
      day.times.forEach(function(time) {
        this.tooltips[time.value] = time.tooltip;
      }.bind(this))
    }.bind(this));
    return {
      inSettings: false,
      defaultWorkHours: defaultWorkHours,
      days: this.props.initialTimes.map(function(day) {
        var localTimeBreaks = defaultTimeBreaks,
            workHours;
        if (day.workHours) {
          localTimeBreaks = day.workHours.map((t) => ([new Time(t.startTime), new Time(t.endTime)]));
          workHours = this.converter.calculatePartitionsForInitialTimes(
            day.workHours.map((t) => ({
              endTime: new Time(t.endTime),
              startTime: new Time(t.startTime),
              value: 'working',
            })),
            [[this.START_TIME, this.END_TIME]]
          );
        }
        var partitions = this.converter.calculatePartitionsForInitialTimes(day.times.map((time) => (
              {
                value: time.value,
                id: time.id,
                tooltip: time.tooltip,
                startTime: time.startTime && new Time(time.startTime),
                endTime: time.endTime && new Time(time.endTime),
              }
            )), localTimeBreaks),
            date = new Date(day.date);
        return {
          name: day.name,
          dayNumber: date.getDate(),
          shortname: day.name.substring(0,3),
          date: day.date,
          partitions: partitions,
          partitionsHistory: [],
          partitionsFuture: [],
          workHours: workHours,
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

  handleDefaultWorkHoursChange: function(newWorkHours) {
    var newTotalSize = newWorkHours.filter((p) => p.value === 'working').reduce((a, b) => a + b.size, 0),
        newDays = this.state.days.map(function(day) {
          var partitions = day.partitions,
              oldTotalSize = partitions.reduce((a, b) => a + b.size, 0),
              multiplier = newTotalSize/oldTotalSize;
          return this.getUpdatedDay(day, partitions.map((p) => ({value: p.value, size: p.size * multiplier})));
        }.bind(this));
    this.setState({
      days: newDays,
      defaultWorkHours: newWorkHours,
    });

    if (this.props.saveDefaultWorkHours && window.localStorage) {
      var times = this.converter.calculateTimesForPartitions(newWorkHours, [[this.START_TIME, this.END_TIME]]);
      times = times.filter((t) => t.value === 'working')
                   .map((t) => ({endTime: t.endTime.toString(), startTime: t.startTime.toString()}))
      window.localStorage.setItem('ReactTimesheet_defaultWorkHours', JSON.stringify(times));
    }
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

  toggleSettings: function(e) {
    if (this.state.inSettings) {
      this.setState({inSettings: false});
    } else {
      this.setState({inSettings: true});
    }
    e.preventDefault();
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
            <input type="checkbox" checked={!!day.workHours} onChange={() => this.toggleCustomWorkHours(i)} />
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
                        getClass={this._class}
                        getHiddenFieldsForValue={this.getHiddenFieldsForValue}
                        generateInputName={this.generateInputName}
                        timeBreaks={time.timeBreaks}
                        colorGenerator={this.colorGenerator}
                        handleTimesChange={(times) => this.handleTimesChange(i, times)} />
      </div>
    ));
  },

  // Render a row containing the submit button for the containing form
  renderSubmitButton: function() {
    return (
      <div className={this._class('ReactTimesheet_submit_row')}>
        <div className={this._class('ReactTimesheet_submit_container')}>
          <button onClick={this.toggleSettings} className={this._class('ReactTimesheet_settings_btn')}>Settings</button>
          <button type="submit" onClick={this.handleSubmit} className={this._class('ReactTimesheet_submit_btn')}>Submit</button>
        </div>
      </div>
    );
  },

  render: function() {
    if (this.state.inSettings) {
      return (
        <div className={this._class('ReactTimesheet')}>
          <div className={this._class('ReactTimesheet_settings')}>
            <h2>Settings</h2>
            <h3>Default Work Hours</h3>
              <PartitionSelector partitions={this.applyTooltips(this.state.defaultWorkHours)}
                                 customClass={'ReactTimesheet_default_work_hours_select'}
                                 getClass={this._class}
                                 handlePartitionChange={(w) => this.handleDefaultWorkHoursChange(w)}
                                 validatePartitions={this.validateWorkHours}
                                 labels={this.converter.calculateLabelsFor(this.START_TIME, this.END_TIME)}
                                 colorGenerator={this.workHoursColorGenerator}
                                 minorMarkers={15}
                                 majorMarkers={60} />
            <div className={this._class('ReactTimesheet_submit_settings')}>
              <button onClick={this.toggleSettings} className={this._class('ReactTimesheet_settings_btn')}>Save</button>
            </div>
          </div>
        </div>
      );
    } else {
      var tables = (
        <div style={{display: (this.props.showTables ? null : 'none')}}>
          {this.renderDayTables()}
          {this.renderSubmitButton()}
        </div>
      );
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

              {tables}
            </div>


            <div className={this._class('ReactTimesheet_docks')}>
              <Dock activeActivities={this.getActiveActivities()}
                    colorGenerator={this.colorGenerator}
                    getClass={this._class}
                    panels={this.props.panels}
                    searches={this.props.searches}/>
            </div>
          </div>
        </form>
      );
    }
  }
});
