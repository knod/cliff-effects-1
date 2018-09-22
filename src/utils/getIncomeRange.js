import _ from 'lodash';


var getIncomeRange = function (limits, multiplier) {
  // Adjust to time-interval, round to hundreds
  var maxIncome = Math.ceil((limits.max * multiplier) / 100) * 100,
      interval  = Math.ceil((maxIncome / 100) / 10) * 10;

  return _.range(limits.min, maxIncome, interval);
};  // End getIncomeRange()


export { getIncomeRange };
