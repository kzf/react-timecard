var Dock = React.createClass({
  getInitialState: function() {
    var activePanel = {
          title: 'Active',
          active: (this.props.panels.filter((p) => p.active).length == 0),
          activities: this.props.activeActivities,
          loaded: true,
        };
        console.log('pannels', this.props.panels);
    return {
      panels: [activePanel].concat(this.props.panels)
    };
  },
  
  loadPanel: function(panel, i) {
    if (!panel.loaded && !panel.loading) {
      panel.source(function(categories) {
        console.log('loaded panel', i, 'with', categories)
        var newPanels = this.state.panels.concat([]);
        newPanels.splice(i, 1, {
          title: newPanels[i].title,
          active: newPanels[i].active,
          activities: categories,
          loaded: true,
        });
        this.setState({panels: newPanels});
      }.bind(this));
    }
    return true;
  },
  
  setActivePanel: function(key) {
    this.setState({panels: this.state.panels.map((panel, i) => (
      {
        title: panel.title,
        active: i === key,
        activities: panel.activities,
        source: panel.source,
        loading: panel.loading || ((i === key) && !panel.loaded && this.loadPanel(panel, i)),
        loaded: panel.loaded,
      }
    ))});
  },
  
  render: function() {
    var activePanel = this.state.panels.filter((panel) => panel.active)[0];
    return (
      <div>
        <ul className="nav nav-tabs dock-types">
          {this.state.panels.map((panel, i) => (
            <li key={i}
                role="presentation"
                className={`${panel.active ? 'active' : ''}`}>
              <a href="#" onClick={() => this.setActivePanel(i)}>{panel.title}</a>
            </li>
          ))}
        </ul>
        <DockPanel name={activePanel.title}
                   loaded={activePanel.loaded}
                   activities={activePanel.activities}/>
      </div>
    );
  }
});