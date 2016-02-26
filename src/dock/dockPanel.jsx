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
        <div className="list-group">
          {this.props.activities.map((activity, i) => (
            <div key={i} data-abc={console.log(activity, i)} href="#" className="list-group-item">
              {activity.badge ? <span className="badge">7:30 PM</span> : ''}
              <h4 className="list-group-item-heading">{activity.value}</h4>
              <p className="list-group-item-text">
                {activity.tooltip}
              </p>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="list-group">
          {this.props.activities.map((activity, i) => (
            <div key={i} data-abc={console.log(activity, i)} href="#" className="list-group-item">
              {activity.badge ? <span className="badge">7:30 PM</span> : ''}
              <h4 className="list-group-item-heading">{activity.value}</h4>
              <p className="list-group-item-text">
                {activity.tooltip}
              </p>
            </div>
          ))}
        </div>
      )
    }
  }
});