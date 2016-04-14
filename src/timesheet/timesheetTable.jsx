var TimesheetTable = React.createClass({
  getInitialState: function() {
    return {
    };
  },

  _class: function(className) {
    return this.props.getClass ? this.props.getClass(className) : className;
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
        timeRows = [],
        previousStartTime;
    this.props.times.map(function (t, i) {
      var finalRow = this.props.timeBreaks[currentTimeBreakIndex][1].lessThanEq(t.endTime),
          initialRow = t.startTime.lessThanEq(this.props.timeBreaks[currentTimeBreakIndex][0]);
      timeRows.push(<TimesheetTableRow
                         key={2*i}
                         colorGenerator={this.props.colorGenerator}
                         date={i}
                         getClass={this._class}
                         index={i}
                         hiddenFields={this.props.getHiddenFieldsForValue(t.value)}
                         generateInputName={this.props.generateInputName}
                         readOnlyStart={initialRow}
                         readOnlyEnd={finalRow}
                         index={i}
                         name={t.value}
                         previousStartTime={previousStartTime}
                         startTime={t.startTime}
                         endTime={t.endTime}
                         handleEndTimeChange={(attr, i, value) => this.handleEndTimeChange(attr, i, value)} />);
      if (finalRow) {
        timeRows.push(
          <tr key={2*i + 1}
              className={this._class('ReactTimesheetTable_time_break')}>
            <td colSpan="4"></td>
          </tr>
        );
        currentTimeBreakIndex++;
      }
      previousStartTime = t.startTime;
    }.bind(this));
    return (
      <div>
        <div className={this._class('ReactTimesheetTable_day')}>
          <div className={this._class('ReactTimesheetTable_day_name')}>
            {this.props.name}
          </div>
          <div className={this._class('ReactTimesheetTable_day_panel')}>
            <table className={this._class('ReactTimesheetTable_day_table')}>
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
