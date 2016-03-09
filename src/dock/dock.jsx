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
          loading: panel.loading || ((i + 2 === key) && !panel.loaded && this.loadPanel(panel, i)),
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
        }, {
          title: 'Search',
          loaded: true,
          searches: [{
            source: '../custom/samples/ticket_autocomplete.json',
            placeholder: 'Search Tickets...',
            getActivities: function(data) {
              return {
                label: 'Search Results',
                activities: data.map((d) => ({
                  value: '#' + d.value,
                  tooltip: d.description,
                }))
              };
            }
          }, {
            source: '../custom/samples/project_autocomplete.json',
            placeholder: 'Search Projects...',
            getActivities: function(data) {
              return {
                label: 'Search Results',
                activities: data.map((d) => ({
                  value: d.value,
                  tooltip: d.customer + ' - ' + d.pool,
                }))
              };
            }
          }]
        }].concat(this.state.panels);
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
        {panels.map((panel, i) => (
          <DockPanel key={i}
                     colorGenerator={this.props.colorGenerator}
                     visible={i === this.state.activePanel}
                     name={panel.title}
                     loaded={panel.loaded}
                     searches={panel.searches}
                     activities={panel.activities}/>
        ))}
      </div>
    );
  }
});