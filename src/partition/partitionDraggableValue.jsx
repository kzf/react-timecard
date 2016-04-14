var PartitionDraggableValue = React.createClass({
  getInitialState: function() {
    return {};
  },

  _class: function(className) {
    return this.props.getClass ? this.props.getClass(className) : className;
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
      <div className={this._class('PartitionSelector_draggable')}
           draggable="true"
           onDragStart={this.handleDragStart}>
        {this.props.children}
      </div>
    );
  }
});
