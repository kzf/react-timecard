class TimesheetConverter {
  calculateLabelsFor(startTime, endTime) {
    var labels = [],
        totalMinutes = endTime.minutesAfter(startTime),
        currentTime = startTime.getNextHourMark();
    while (currentTime.lessThan(endTime)) {
      labels.push([currentTime.toString(), currentTime.minutesAfter(startTime)]);
      currentTime = currentTime.getNextHourMark();
    }
    return labels;
  }
  
  calculateTimesForPartitions(partitions, timeBreaks) {
    // e.g. take [{value:'A', size: 10}, {value:'B', size: 20}, {value:'C', size: 30}],
    //           [[Time(7.0), Time(7,30)], [Time(8,30), Time(9.0)]]
    // and return [{value: 'A', startTime: 7:00, endTime: 7:10}, 
    //             {value: 'B', startTime: 7:10, endTime: 7:30},
    //             {value: 'C', startTime: 8:00, endTime: 8:30}]
    // ASSUMPTION: partition total size equals timeBreaks total size
    // TODO: Convert partitions into times
    
  }
  
  calculatePartitionsForTimes(times, timeBreaks) {
    // e.g. take [{value:'A', size: 10}, {value:'B', size: 20}, {value:'C', size: 30}],
    //           [[Time(7.0), Time(7,30)], [Time(8,30), Time(9.0)]]
    // and return [{value: 'A', startTime: 7:00, endTime: 7:10}, 
    //             {value: 'B', startTime: 7:10, endTime: 7:30},
    //             {value: 'C', startTime: 8:00, endTime: 8:30}]
    // ASSUMPTION: partition total size equals timeBreaks total size
    // TODO: Convert times into partitions
  }
}