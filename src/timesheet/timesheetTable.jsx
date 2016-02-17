var TimesheetTable = React.createClass({
  getInitialState: function() {
    return {
    };
  },
  
  handleEndTimeChange: function(key, value) {
    var times = this.props.times.concat([]),
        newTimeRow = {
          value: this.props.times[key].value,
          startTime: this.props.times[key].startTime,
          endTime: new Time(value),
        };
    times.splice(key, 1, newTimeRow);
    this.props.handleTimesChange(times);
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
                                 handleEndTimeChange={(attr, i, value) => this.handleEndTimeChange(attr, i, value)} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
});
