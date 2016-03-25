'use strict';

var assert = require('assert');
require('../dist/test/app.js');

require('babel/register');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('Time', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      var time = new Time(7, 0, 'am');
      assert.equal(time.toString(), '7 AM');
    });
  });
});