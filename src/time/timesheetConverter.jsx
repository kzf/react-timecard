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
  
  splitPartitionsFromTimeBreaks(partitions, timeBreaks) {
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
        // TODO: Handle the case where a cell is overlapping TWO or more time breaks
        splitPartitions.push({value: partition.value, size: minutesLeftInBreak});
        splitPartitions.push({value: partition.value, size: size - minutesLeftInBreak});
        currentBreakIndex++;
        if (currentBreakIndex >= timeBreaks.length) return;
        minutesLeftInBreak = timeBreaks[currentBreakIndex][1].minutesAfter(timeBreaks[currentBreakIndex][0]) - (size - minutesLeftInBreak);
      }
    });
    return splitPartitions;
  }
  
  calculateTimesForSplitPartitions(splitPartitions, timeBreaks) {
    // ASSUMPTION: the boundaries of timeBreaks always line up exactly
    // with a boundary between two cells in splitPartitions i.e.
    // we never have a partition cell that overlaps a boundary
    var times = [],
        lastEndTime,
        breakEndTime,
        partitionEndTime,
        currentBreakIndex = 0,
        currentPartitionIndex = 0,
        currentPartition;
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
  
  calculateTimesForPartitions(partitions, timeBreaks) {
    // e.g. take partitions: [{value:'A', size: 10}, {value:'B', size: 20}, {value:'C', size: 30}],
    //           timeBreaks: [[Time(7.0), Time(7,30)], [Time(8,30), Time(9.0)]]
    // and return [{value: 'A', startTime: 7:00, endTime: 7:10}, 
    //             {value: 'B', startTime: 7:10, endTime: 7:30},
    //             {value: 'C', startTime: 8:00, endTime: 8:30}]
    // ASSUMPTION: partition total size equals timeBreaks total size
    return this.calculateTimesForSplitPartitions(
      this.splitPartitionsFromTimeBreaks(partitions, timeBreaks),
      timeBreaks
    );
  }
  
  calculatePartitionsForTimes(times, timeBreaks) {
    // e.g. take times: [{value: 'A', startTime: 7:00, endTime: 7:10}, 
    //                   {value: 'B', startTime: 7:10, endTime: 7:30},
    //                   {value: 'C', startTime: 8:00, endTime: 8:30}]
    //           timeBreaks: [[Time(7.0), Time(7,30)], [Time(8,30), Time(9.0)]]
    // and return [{value:'A', size: 10}, {value:'B', size: 20}, {value:'C', size: 30}]
    // ASSUMPTION: partition total size equals timeBreaks total size
    // TODO: Convert times into partitions
    
    // preprocess the times so that they never cross a timeBreak boundary
    
    
    console.log('calling cal parts for times', times, timeBreaks);
    var partitions = [],
        timeBreakIndex = 0,
        lastPartition,
        lastEndTime;
    times.forEach(function(time) {
      var size = time.endTime.minutesAfter(lastEndTime || time.startTime);
      console.log('initial size', size);
      if (size < 0) size = 0;
      // If previous partition was the same then add this one onto it, otherwise create a new partition
      if (lastPartition && lastPartition.value === time.value) {
        console.log('adding size to previous partition', time.value, size);
        lastPartition.size += size;
      } else {
        console.log('creating new partition', time.value, size);
        lastPartition = {value: time.value, size: size};
        partitions.push(lastPartition);
      }
      if (!lastEndTime || lastEndTime.lessThanEq(time.endTime)) {
        lastEndTime = time.endTime;
      }
      console.log('endTime', lastEndTime.toString(), 'tiebreak AT', timeBreaks[timeBreakIndex][1].toString())
      if (lastEndTime.equals(timeBreaks[timeBreakIndex][1])) {
        console.log('jumping ahead to', timeBreaks[timeBreakIndex][1].toString());
        timeBreakIndex++;
        if (timeBreakIndex < timeBreaks.length) lastEndTime = timeBreaks[timeBreakIndex][0];
      }
    });
    return partitions;
  }
}