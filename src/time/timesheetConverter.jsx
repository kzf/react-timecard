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

  calculateLabelsForTimeBreaks(timeBreaks) {
    var labels = [],
        minutesSoFar = 0;
    timeBreaks.forEach(function(timeBreak) {
      labels = labels.concat(this.calculateLabelsFor(timeBreak[0], timeBreak[1]).map((label) => (
        [label[0], label[1] + minutesSoFar]
      )));
      minutesSoFar += timeBreak[1].minutesAfter(timeBreak[0]);
    }.bind(this));
    return labels;
  }

  calculateMarkersAndLabelsForTimeBreaks(timeBreaks) {
    var labels = [],
        majorMarkers = [],
        minorMarkers = [],
        minutesSoFar = 0;
    timeBreaks.forEach(function(timeBreak) {
      labels = labels.concat(this.calculateLabelsFor(timeBreak[0], timeBreak[1]).map((label) => (
        [label[0], label[1] + minutesSoFar]
      )));
      labels.forEach((label) => minorMarkers.push(label[1]));
      minutesSoFar += timeBreak[1].minutesAfter(timeBreak[0]);
      majorMarkers.push(minutesSoFar);
    }.bind(this));
    return {
      labels, majorMarkers, minorMarkers
    };
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
    var timeBreakIndex = 0,
        scratchTimes = times.map((time) => (
          {
            value: time.value,
            tooltip: time.tooltip,
            startTime: time.startTime,
            endTime: time.endTime,
          }
        )), // working space for modifying times in-place
        splitTimes = [],
        timeIndex = 0,
        time, timeBreak, endTime;

    while (timeIndex < scratchTimes.length) {
      time = scratchTimes[timeIndex];
      timeBreak = timeBreaks[timeBreakIndex];
      if (!timeBreak) {
        break; // we ran out of timeBreaks so we can stop
      } else if (time.endTime.lessThanEq(timeBreak[0])) {
        // Do nothing, time finished before this timeBreak
      } else if (time.startTime.lessThan(timeBreak[0])) {
        // Time overlaps the start of the timebreak, trim the start.
        endTime = time.endTime;
        if (timeBreak[1].lessThan(endTime)) {
          endTime = timeBreak[1];
          // reprocess this time, for the next time break
          timeIndex--;
          time.startTime = timeBreak[1];
          timeBreakIndex++; //move on to next time break
        }
        splitTimes.push({
          value: time.value,
          tooltip: time.tooltip,
          startTime: timeBreak[0],
          endTime: endTime,
        });
        // If we get to this point then the time comes after the start of the timeBreak
      } else if (timeBreak[1].lessThanEq(time.startTime)) {
        // time is completely outside of this time break
        timeBreakIndex++;
        timeIndex--; // reprocess this time
      } else if (timeBreak[1].lessThanEq(time.endTime)) {
        // time break end is inside the time interval
        endTime = timeBreak[1];
        splitTimes.push({
          value: time.value,
          tooltip: time.tooltip,
          startTime: time.startTime,
          endTime: endTime,
        })
        // reprocess this time, for the next time break
        timeIndex--;
        time.startTime = timeBreak[1];
        timeBreakIndex++; //move on to next time break
      } else {
        // time is completely inside the time break
        splitTimes.push(time);
      }
      timeIndex++;
    }


    var partitions = [],
        lastPartition,
        lastEndTime;
    timeBreakIndex = 0;
    splitTimes.forEach(function(time) {
      var size = time.endTime.minutesAfter(lastEndTime || time.startTime);
      if (size < 0) size = 0;
      // If previous partition was the same then add this one onto it, otherwise create a new partition
      if (lastPartition && lastPartition.value === time.value) {
        lastPartition.size += size;
      } else {
        lastPartition = {value: time.value, size: size};
        partitions.push(lastPartition);
      }
      if (!lastEndTime || lastEndTime.lessThanEq(time.endTime)) {
        lastEndTime = time.endTime;
      }
      if (lastEndTime.equals(timeBreaks[timeBreakIndex][1])) {
        timeBreakIndex++;
        if (timeBreakIndex < timeBreaks.length) lastEndTime = timeBreaks[timeBreakIndex][0];
      }
    });
    return partitions;
  }

  calculatePartitionsForInitialTimes(initialTimes, timeBreaks) {
    // NOT Assuming that the total size of times is equal to total size of timeBreaks
    // Convert the intialTimes to a new times array which has
    var timeBreakIndex = 0,
        lastEndTime = timeBreaks[timeBreakIndex][0],
        times = [],
        lastTime = null;

    initialTimes.forEach(function(time, i) {
      if (!time.startTime && !time.endTime) return;
      // If we have no end time then set end time to start Time
      if (!time.endTime) time.endTime = time.startTime;
      // Do nothing if the time is negative duration or we have no start time
      if (!time.startTime || time.endTime.lessThan(time.startTime)) return;
      if (!time.startTime.isValid() || !time.endTime.isValid()) return;
      // If we missed a spot, add a time to fill it
      if (lastEndTime && lastEndTime.lessThan(time.startTime)) {
        times.push({startTime: lastEndTime, endTime: time.startTime});
        lastEndTime = time.startTime;
      }
      // Add this time
      lastTime = {
        value: time.value,
        tooltip: time.tooltip,
        startTime: lastEndTime,
        endTime: time.endTime,
      };
      times.push(lastTime);
      lastEndTime = time.endTime;
    });

    // Add a final time if we didn't make it to the final timeBreak
    var endTime = timeBreaks[timeBreaks.length - 1][1];
    if (!lastTime || lastTime.endTime.lessThan(endTime)) {
      times.push({
        startTime: lastTime.endTime,
        endTime: endTime,
      })
    }

    return this.calculatePartitionsForTimes(times, timeBreaks);
  }
}
