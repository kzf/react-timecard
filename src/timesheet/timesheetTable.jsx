var TimesheetTable = React.createClass({
  getInitialState: function() {
    return {
      
    };
  },
  
  updatePartitionSize: function(key, value) {
    var partitions = this.props.partitions.concat([]);
    partitions.splice(key, 1, {name: this.props.partitions[key].name, size: parseInt(value)});
    this.props.handlePartitionChange(partitions);
    this.setState({partitions: partitions});
  },
  
  render: function() {
    return (
      <div>
        <table>
          <tbody>
            {this.props.partitions.map((p, i) => (
              <TimesheetTableRow key={i} index={i} name={p.name} value={p.size} handleChange={(i, value) => this.updatePartitionSize(i, value)} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
});
