var TimesheetTableRow = React.createClass({
  getInitialState: function() {
    return {
      nonTimeValues: {},
    };
  },
  
  handleTimeChange: function(attr, i, value) {
    // time inputs always return a blank value if they are invalid
    var isValidTime = !!value,
        nonTimeValues;
    
    if (isValidTime) {
      this.props.handleTimeChange(attr, i, value);
      this.clearNonIntValue();
    } else {
      nonTimeValues = {};
      nonTimeValues[attr] = value;
      this.setState({nonTimeValues: nonTimeValues});
    }
  },
  
  clearNonTimeValue: function() {
    this.setState({nonTimeValues: undefined});
  },
  
  render: function() {
    var values = Object.assign({}, this.state.nonTimeValues);
    if (values.startTime === undefined) values.startTime = this.props.startTime.toString24();
    if (values.endTime === undefined) values.endTime = this.props.endTime.toString24();
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>
          <input type="time"
                 className={`${this.state.nonTimeValues && this.state.nonTimeValues.startTime ? 'invalid' : 'valid'}`}
                 value={values.startTime}
                 onChange={(e) => this.handleTimeChange('startTime', this.props.index, e.target.value)}
                 onBlur={this.clearNonTimeValue}/>
        </td>
        <td>
          <input type="time"
                 className={`${this.state.nonTimeValues && this.state.nonTimeValues.endTime ? 'invalid' : 'valid'}`}
                 value={values.endTime}
                 onChange={(e) => this.handleTimeChange('endTime', this.props.index, e.target.value)}
                 onBlur={this.clearNonTimeValue}/>
        </td>
      </tr>
    );
  }
});