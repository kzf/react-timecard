var Dock = React.createClass({
  getInitialState: function() {
    return {
      panels: this.props.panels,
      activePanel: 0,
    };
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
          loading: panel.loading || ((i + 1 === key) && !panel.loaded && this.loadPanel(panel, i)),
          loaded: panel.loaded,
        }
      )),
      activePanel: key,
    });
  },
  
  render: function() {
    var panels = [{
          title: 'Active',
          activities: this.props.activeActivities,
          loaded: true,
        }].concat(this.state.panels),
        activePanel = panels[this.state.activePanel];
    return (
      <div>
        <ul className="nav nav-tabs dock-types">
          {panels.map((panel, i) => (
            <li key={i}
                role="presentation"
                className={`${i === this.state.activePanel ? 'active' : ''}`}>
              <a href="#" onClick={() => this.setActivePanel(i)}>{panel.title}</a>
            </li>
          ))}
        </ul>
        <DockPanel colorGenerator={this.props.colorGenerator}
                   name={activePanel.title}
                   loaded={activePanel.loaded}
                   activities={activePanel.activities}/>
      </div>
    );
  }
});