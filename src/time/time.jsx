var Time = function(hour, minute, ampm) {
  this.hour = parseInt(hour);
  this.minute = parseInt(minute);
  if (ampm && ampm.toLowerCase() === 'pm' && this.hour !== 12) {
    this.hour += 12;
  }
  return this;
}

Time.prototype.lessThanEq = function(time) {
  if (this.hour < time.hour) return true;
  if (this.hour === time.hour && this.minute <= time.minute) return true;
  return false;
};

Time.prototype.lessThan = function(time) {
  if (this.hour < time.hour) return true;
  if (this.hour === time.hour && this.minute < time.minute) return true;
  return false;
};

Time.prototype.minutesAfter = function(time) {
  return (this.hour - time.hour)*60 + (this.minute - time.minute);
};

Time.prototype.getNextHourMark = function() {
  return new Time(this.hour + 1, 0);
};

Time.prototype.getNextHalfHourMark = function() {
  if (this.minute == 0) {
    return new Time(this.hour, 30);
  } else if (this.minute >= 30) {
    return new Time(this.hour + 1, 0);
  } else {
    return new Time(this.hour, 30);
  }
};

Time.prototype.getNextQuarterHourMark = function() {
  if (this.minute == 0) {
    return new Time(this.hour, 15);
  } else if (this.minute >= 45) {
    return new Time(this.hour + 1, 0);
  } else if (this.minute >= 30) {
    return new Time(this.hour, 45);
  } else if (this.minute >= 15) {
    return new Time(this.hour, 30);
  } else {
    return new Time(this.hour, 15);
  }
};

Time.prototype.toString = function() {
  if (this.minute === 0) {
    if (this.hour === 12) return '12 PM';
    return (this.hour > 12 ? this.hour - 12 : this.hour) + (this.hour < 12 ? ' AM' : ' PM');
  } else if (this.hour < 12) {
    return this.hour + ':' + this.minutesToString() + ' AM';
  } else if (this.hour == 12) {
    return this.hour + ':' + this.minutesToString() + ' PM';
  } else {
    return this.hour + ':' + this.minutesToString() + ' PM';
  }
};

Time.prototype.toString24 = function() {
  return (this.hour < 10 ? '0' : '') + this.hour + ':' + this.minutesToString();
};

Time.prototype.minutesToString = function() {
  if (this.minute === 0) {
    return '00';
  } else if (this.minute <= 9) {
    return '0' + this.minute;
  } else {
    return this.minute;
  }
};

Time.prototype.isHour = function() {
  return this.minute == 0;
};
Time.prototype.isHalfHour = function() {
  return this.minute == 30;
};

Time.prototype.subtractHour = function() {
  return new Time(this.hour - 1, this.minute);
};

Time.prototype.equals = function(time) {
  return (this.hour == time.hour) && (this.minute == time.minute);
};

Time.prototype.addMinutes = function(x) {
  var h = this.hour, m = this.minute;
  var rem = x % 60;
  if (x >= 60) {
    h += (x-rem)/60;
    m += rem;
  } else {
    m += rem;
  }
  if (m > 60) {
    m = m - 60;
    h = h + 1;
  }
  return new Time(h,m);
};