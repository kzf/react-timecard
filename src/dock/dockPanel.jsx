var DockPanel = React.createClass({
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
    if (this.props.loaded) {
      return (
        <div className="list-group dock-panel">
          {this.props.activities.map((group, i) => (
            <div key={i}>
              <div href="#" className="list-group-item disabled">
                {group.label}
              </div>
              {group.activities.map((activity, j) => (
                <div key={j} href="#" className="list-group-item dock-panel-item">
                  <div className="dock-panel-color" style={{backgroundColor: this.props.colorGenerator.getColor(activity.value)}}></div>
                  <p className="list-group-item-text">
                    <span className="label label-primary">{activity.value}</span>
                    {activity.badge ? <span className="label label-default">{activity.badge}</span> : ''}
                    {activity.tooltip}
                  </p>
                  <PartitionDraggableValue values={{
                                             value: activity.value,
                                             tooltip: activity.tooltip,
                                           }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="list-group">
          <div className="list-group-item">
            Loading...
          </div>
        </div>
      )
    }
  }
});