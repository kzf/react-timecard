var Dock = React.createClass({
  getInitialState: function() {
    return {
      panels: this.props.panels,
      activePanel: 0,
    };
  },

  _class: function(className) {
    return this.props.getClass ? this.props.getClass(className) : className;
  },

  loadPanel: function(panel, i) {
    if (!panel.loaded && !panel.loading) {
      panel.source(function(categories) {
        var newPanels = this.state.panels.concat([]);
        newPanels.splice(i, 1, {
          title: newPanels[i].title,
          activities: categories,
          loaded: true,
        });
        this.setState({panels: newPanels});
      }.bind(this));
    }
    return true;
  },

  setActivePanel: function(key) {
    this.setState({
      panels: this.state.panels.map((panel, i) => (
        {
          title: panel.title,
          activities: panel.activities,
          source: panel.source,
          loading: panel.loading || (!panel.loaded && this.loadPanel(panel, i)),
          loaded: panel.loaded,
        }
      )),
      activePanel: key,
    });
  },

  defaultPanels: function() {
    var panels = [{
      title: 'Active',
      activities: this.props.activeActivities,
      loaded: true,
    }];
    if (this.props.searches) {
      panels.push({
        title: 'Search',
        loaded: true,
        searches: this.props.searches,
      });
    }
    return panels;
  },

  render: function() {
    var activeClass = this._class('ReactTimesheetDock_active'),
        panels = this.defaultPanels().concat(this.state.panels);
    return (
      <div>
        <ul className={this._class('ReactTimesheetDock_types')}>
          {panels.map((panel, i) => (
            <li key={i}
                role="presentation"
                className={`${i === this.state.activePanel ? activeClass : ''}`}>
              <a href="#" onClick={() => this.setActivePanel(i)}>{panel.title}</a>
            </li>
          ))}
        </ul>
        {panels.map((panel, i) => (
          <DockPanel key={i}
                     colorGenerator={this.props.colorGenerator}
                     visible={i === this.state.activePanel}
                     getClass={this._class}
                     name={panel.title}
                     loaded={panel.loaded}
                     searches={panel.searches}
                     activities={panel.activities}/>
        ))}
      </div>
    );
  }
});
