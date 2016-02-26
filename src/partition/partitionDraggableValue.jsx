var PartitionDraggableValue = React.createClass({
  getInitialState: function() {
    return {};
  },
  
  handleDragStart: function(e) {
    var values = this.props.values,
        key;
    for (key in values) {
      if (values.hasOwnProperty(key)) {
        if (values[key]) e.dataTransfer.setData(key, values[key]);
      }
    }
  },
  
  render: function() {
    return (
      <div className="partition-draggable-value"
           draggable="true"
           onDragStart={this.handleDragStart}>
        {this.props.children}
      </div>
    );
  }
});