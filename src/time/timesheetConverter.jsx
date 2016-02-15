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
    // e.g. take partitions: [{value:'A', size: 10}, {value:'B', size: 20}, {value:'C', size: 30}],
    //           timeBreaks: [[Time(7.0), Time(7,30)], [Time(8,30), Time(9.0)]]
    // and return [{value: 'A', startTime: 7:00, endTime: 7:10}, 
    //             {value: 'B', startTime: 7:10, endTime: 7:30},
    //             {value: 'C', startTime: 8:00, endTime: 8:30}]
    // ASSUMPTION: partition total size equals timeBreaks total size
    
    // Split any partitions that overlap the boundaries between timeBreaks
    // into a portion before the gap and a portion after
    var splitPartitions = [],
        currentBreakIndex = 0,
        minutesLeftInBreak = timeBreaks[currentBreakIndex][1].minutesAfter(timeBreaks[currentBreakIndex][0]);
    partitions.forEach(function(partition) {
      var size = Math.ceil(partition.size);
      if (minutesLeftInBreak > partition.size) {
        splitPartitions.push({value: partition.value, size: size});
        minutesLeftInBreak -= size;
      } else {
        // TODO: Handle the case where a cell is overlapping TWO time breaks
        splitPartitions.push({value: partition.value, size: minutesLeftInBreak});
        splitPartitions.push({value: partition.value, size: size - minutesLeftInBreak});
        currentBreakIndex++;
        if (currentBreakIndex >= timeBreaks.length) return;
        minutesLeftInBreak = timeBreaks[currentBreakIndex][1].minutesAfter(timeBreaks[currentBreakIndex][0]) - (size - minutesLeftInBreak);
      }
    });
    
    // Now create the times array assuming we always end at a nice gap
    var times = [],
        lastEndTime,
        breakEndTime,
        partitionEndTime,
        currentPartitionIndex = 0,
        currentPartition;
    currentBreakIndex = 0;
    while (currentBreakIndex < timeBreaks.length) {
      lastEndTime = timeBreaks[currentBreakIndex][0];
      breakEndTime = timeBreaks[currentBreakIndex][1];
      while (lastEndTime.lessThan(breakEndTime) && currentPartitionIndex < splitPartitions.length) {
        currentPartition = splitPartitions[currentPartitionIndex];
        partitionEndTime = lastEndTime.addMinutes(currentPartition.size);
        times.push({value: currentPartition.value, startTime: lastEndTime, endTime: partitionEndTime});
        currentPartitionIndex++;
        lastEndTime = partitionEndTime;
      }
      currentBreakIndex++;
    }
    return times;
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