function renderTimesheet(initialTimes, formAction) {
  ReactDOM.render(
    <Timesheet initialTimes={initialTimes} formAction={formAction} />,
    document.getElementById('timesheet')
  );
}
