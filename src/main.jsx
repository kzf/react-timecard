function renderTimesheet(initialTimes, formAction, panels) {
  ReactDOM.render(
    <Timesheet initialTimes={initialTimes} formAction={formAction} panels={panels} />,
    document.getElementById('timesheet')
  );
}