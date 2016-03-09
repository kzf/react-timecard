var DockPanel = React.createClass({
  searchDelay: 400,
  
  getInitialState: function() {
    return {
      managesOwnActivities: !!this.props.searches,
      activities: [],
      searchTerms: (this.props.searches || []).map((s) => ''),
    };
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
  
  handleSearch: function(key, value) {
    this.setState({
      searchTerms: this.state.searchTerms.map((term, i) => ((i === key) ? value : ''))
    });
    this.asyncSearch(key, value);
  },
  
  asyncSearch: function(i, value) {
    var search = this.props.searches[i],
        self = this;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(function() {
      var xhr = new XMLHttpRequest();
      xhr.open('get', search.source, true);
      xhr.onreadystatechange = function() {
        var data;
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            data = JSON.parse(xhr.responseText);
            self.setState({
              activities: [search.getActivities(data)]
            });
          }
        }
      };
      xhr.send({q: value});
    }, this.searchDelay);
  },
  
  render: function() {
    var activities = this.state.managesOwnActivities ? this.state.activities : this.props.activities;
    if (this.props.visible) {
      if (this.props.loaded) {
        return (
          <div className="list-group dock-panel">
            {(this.props.searches || []).map((search, i) => (
              <div key={i} className="list-group-item">
                <input className="form-control"
                       type="text"
                       placeholder={search.placeholder}
                       value={this.state.searchTerms[i]}
                       onChange={(e) => this.handleSearch(i, e.target.value)} />
              </div>
            ))}
            {activities.map((group, i) => (
              <div key={i}>
                <div href="#" className="list-group-item disabled">
                  {group.label}
                </div>
                {(group.activities || []).map((activity, j) => (
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
    } else {
      return <div />;
    }
  }
});