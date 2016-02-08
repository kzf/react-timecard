var TimesheetTableRow = React.createClass({
  getInitialState: function() {
    return {
      nonIntValue: undefined,
    };
  },
  
  handleChange: function(i, value) {
    var intValue = parseInt(value);
    if (intValue) {
      console.log('handleChange', i, value);
      this.props.handleChange(i, value);
      this.clearNonIntValue();
    } else {
      this.setState({nonIntValue: value});
    }
  },
  
  clearNonIntValue: function() {
    this.setState({nonIntValue: undefined});
  },
  
  render: function() {
    var value = this.state.nonIntValue;
    if (value === undefined) {
      value = this.props.value;
    }
    return (
      <tr>
        <td>{this.props.name}</td>
        <td><input type="text" value={value} onChange={(e) => this.handleChange(this.props.index, e.target.value)} onBlur={this.clearNonIntValue}/></td>
      </tr>
    );
  }
});