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
    var currentTimeBreakIndex = 0,
        timeRows = [];
    this.props.times.map(function (t, i) {
      var finalRow = this.props.timeBreaks[currentTimeBreakIndex][1].lessThanEq(t.endTime);
      timeRows.push(<TimesheetTableRow
                         key={2*i}
                         readOnly={finalRow}
                         index={i}
                         name={t.value}
                         startTime={t.startTime}
                         endTime={t.endTime}
                         handleEndTimeChange={(attr, i, value) => this.handleEndTimeChange(attr, i, value)} />);
      if (finalRow) {
        timeRows.push(
          <tr key={2*i + 1}
              className="time-break active">
            <td colSpan="3"></td>
          </tr>
        );
        currentTimeBreakIndex++;
      }
    }.bind(this));             
    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <a data-toggle="collapse" href="#">Timesheet Table</a>
          </div>
          <div className="panel-collapse collapse in">
            <table className="table timesheet-table">
              <tbody>
                {timeRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
});
