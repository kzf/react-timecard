var TimesheetTable = React.createClass({
  getInitialState: function() {
    return {
    };
  },
  
  handleTimeChange: function(attr, key, value) {
    var times = this.props.times.concat([]),
        newTimeRow = Object.assign({}, this.props.times[key]);
    newTimeRow[attr] = new Time(value);
    times.splice(key, 1, {name: this.props.times[key].name, size: parseInt(value)});
    this.props.handlePartitionChange(partitions);
    this.setState({partitions: partitions});
  },
  
  render: function() {
    return (
      <div>
        <table className="timesheet-table">
          <tbody>
            {this.props.times.map((t, i) => (
              <TimesheetTableRow key={i}
                                 index={i}
                                 name={t.value}
                                 startTime={t.startTime}
                                 endTime={t.endTime}
                                 handleTimeChange={(attr, i, value) => this.handleTimeChange(attr, i, value)} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
});
