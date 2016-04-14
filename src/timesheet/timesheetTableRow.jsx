var TimesheetTableRow = React.createClass({
  getInitialState: function() {
    return {
      nonTimeValues: {},
    };
  },

  _class: function(className) {
    return this.props.getClass ? this.props.getClass(className) : className;
  },

  handleEndTimeChange: function(i, value) {
    // time inputs always return a blank value if they are invalid
    var isValidTime = value && this.props.startTime.lessThanEq(new Time(value)),
        nonTimeValues;

    if (isValidTime) {
      this.props.handleEndTimeChange(i, value);
      this.clearNonTimeValue();
    } else {
      nonTimeValues = {};
      nonTimeValues.endTime = value;
      this.setState({nonTimeValues: nonTimeValues});
    }
  },

  handleStartTimeChange: function(i, value) {
    // time inputs always return a blank value if they are invalid
    var isValidTime = value && this.props.previousStartTime.lessThanEq(new Time(value)),
        nonTimeValues;

    if (isValidTime) {
      this.props.handleEndTimeChange(i-1, value);
      this.clearNonTimeValue();
    } else {
      nonTimeValues = {};
      nonTimeValues.startTime = value;
      this.setState({nonTimeValues: nonTimeValues});
    }
  },

  clearNonTimeValue: function() {
    this.setState({nonTimeValues: undefined});
  },

  renderHiddenFields: function() {
    return this.props.hiddenFields.map((f, i) => (
      <input type="hidden"
             name={this.props.generateInputName(this.props.date, this.props.index, f.name)}
             key={i}
             value={f.value} />
    ));
  },

  render: function() {
    var values = Object.assign({}, this.state.nonTimeValues)
        invalidClass = this._class('ReactTimesheetTable_invalid'),
        validClass = this._class('ReactTimesheetTable_valid'),
        inputClass = this._class('ReactTimesheetTable_time_input'),
        nameClass = this._class('ReactTimesheetTable_name_input');
    if (values.endTime === undefined) values.endTime = this.props.endTime.toString24();
    if (values.startTime === undefined) values.startTime = this.props.startTime.toString24();
    return (
      <tr>
        <td>
          <div className={this._class('ReactTimesheetTable_row_color')}
               style={{backgroundColor: this.props.colorGenerator.getColor(this.props.name)}} />
        </td>
        <td>
          <input type="text"
                 className={nameClass}
                 value={this.props.name}
                 readOnly="readonly" />
          {this.renderHiddenFields()}
        </td>
        <td>
          <input type="time"
                 readOnly={this.props.readOnlyStart}
                 className={`${inputClass} ${this.state.nonTimeValues && this.state.nonTimeValues.startTime ? invalidClass : validClass}`}
                 value={values.startTime}
                 onChange={(e) => this.handleStartTimeChange(this.props.index, e.target.value)}
                 onBlur={this.clearNonTimeValue} />
        </td>
        <td>
          <input type="time"
                 readOnly={this.props.readOnlyEnd}
                 className={`${inputClass} ${this.state.nonTimeValues && this.state.nonTimeValues.endTime ? invalidClass : validClass}`}
                 value={values.endTime}
                 onChange={(e) => this.handleEndTimeChange(this.props.index, e.target.value)}
                 onBlur={this.clearNonTimeValue}/>
        </td>
      </tr>
    );
  }
});
