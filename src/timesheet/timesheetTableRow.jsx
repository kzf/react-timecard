var TimesheetTableRow = React.createClass({
  getInitialState: function() {
    return {
      nonTimeValues: {},
    };
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
  
  clearNonTimeValue: function() {
    this.setState({nonTimeValues: undefined});
  },
  
  render: function() {
    var values = Object.assign({}, this.state.nonTimeValues);
    if (values.endTime === undefined) values.endTime = this.props.endTime.toString24();
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>
          <input type="time"
                 className="valid"
                 value={this.props.startTime.toString24()}
                 readOnly="readonly" />
        </td>
        <td>
          <input type="time"
                 readOnly={this.props.readOnly}
                 className={`${this.state.nonTimeValues && this.state.nonTimeValues.endTime ? 'invalid' : 'valid'}`}
                 value={values.endTime}
                 onChange={(e) => this.handleEndTimeChange(this.props.index, e.target.value)}
                 onBlur={this.clearNonTimeValue}/>
        </td>
      </tr>
    );
  }
});