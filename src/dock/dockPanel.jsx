var DockPanel = React.createClass({
  searchDelay: 400,

  getInitialState: function() {
    return {
      managesOwnActivities: !!this.props.searches,
      activities: [],
      searchTerms: (this.props.searches || []).map((s) => ''),
    };
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
          <div className={this._class('ReactTimesheetDock_panel')}>
            {(this.props.searches || []).map((search, i) => (
              <div key={i} className={this._class('ReactTimesheetDock_search_item')}>
                <input className={this._class('ReactTimesheetDock_search_input')}
                       type="text"
                       placeholder={search.placeholder}
                       value={this.state.searchTerms[i]}
                       onChange={(e) => this.handleSearch(i, e.target.value)} />
              </div>
            ))}
            {activities.map((group, i) => (
              <div key={i}>
                <div href="#" className={this._class('ReactTimesheetDock_label')}>
                  {group.label}
                </div>
                {(group.activities || []).map((activity, j) => (
                  <div key={j} href="#" className={this._class('ReactTimesheetDock_item')}>
                    <div className={this._class('ReactTimesheetDock_item_color')} style={{backgroundColor: this.props.colorGenerator.getColor(activity.value)}}></div>
                    <p className={this._class('ReactTimesheetDock_item_text')}>
                      <span className={this._class('ReactTimesheetDock_item_value')}>{activity.value}</span>
                      {activity.badge ? <span className={this._class('ReactTimesheetDock_item_badge')}>{activity.badge}</span> : ''}
                      <span className={this._class('ReactTimesheetDock_tooltip')}>{activity.tooltip}</span>
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
          <div className={this._class('ReactTimesheetDock_loading')}>
            <div className={this._class('ReactTimesheetDock_loading_item')}>
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
