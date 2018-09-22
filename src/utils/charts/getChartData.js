// DATA
import { PROGRAM_CHART_VALUES } from '../../utils/charts/PROGRAM_CHART_VALUES';

// LOGIC
import { getSection8Benefit } from '../../programs/massachusetts/section8';
import { getSNAPBenefits } from '../../programs/federal/snap';

// OBJECT MANAGEMENT
import _ from 'lodash';


/** Order in which benefits must be run to affect
 *     each other correctly. @todo Store this
 *     where it can be easily edited by non-coders
 */
var benefitOrder = [
  `income`,
  `section8`,
  `snap`,
];

/** Container for functions so we can access them
 *     as we iterate.
 */
var getBenefit = {
  income: {
    getSubsidy: function (client, timeframe) {
      return client.future.earned;
    },
    getProps: function () {
      return {};
    },
  },
  section8: {
    getSubsidy: getSection8Benefit,
    getProps:   function (client, newSubsidy) {
      return { rentShare: client.future.contractRent - newSubsidy };
    },
  },
  snap: {
    getSubsidy: getSNAPBenefits,
    getProps:   function (client, newSubsidy) {
      return {};
    },
  },
};

/** Returns various arrays of values over change in income */
var getData = {};

getData.income = function (xRange, client, multiplier) {
  return xRange;
};  // End getData.income

getData.snap = function (xRange, client, multiplier) {

  var data = xRange.map(function (income) {
    client.future.earned = income / multiplier;  // Turn it back into monthly
    return getSNAPBenefits(client, 'future') * multiplier;
  });

  return data;
};  // End getData.snap


getData.section8 = function (xRange, client, multiplier) {

  // How the heck did I calculate subsidy amount for the past
  // considering I only know the current subsidy amount? I'm
  // worried about that.
  var data = xRange.map(function (income) {
    // New renting data
    client.future.earned  = income / multiplier;  // Turn it back into monthly
    var monthlySubsidy    = getSection8Benefit(client, 'future');
    return monthlySubsidy * multiplier;
  });

  return data;
};  // End getData.section8()

/** Mutates `benefitDatasets` items to push new data onto
 *     their `.data` prop.
 * 
 * @todo Research how to jsdoc arrays of objects
 *
 * @param {array} xRange All income values to be included.
 * @param {object} clone Clone of the client object
 * @param {object} clone.future
 * @param {object} clone.client
 * @param {float} multiplier Adjusts income and data
 *     values (meant to adjust to weekly, monthly, and yearly amounts)
 * @param {array} benefitDatasets List of datasets, one for
 *     each benefit.
 * @param {object} benefitDatasets[n]
 * @param {string} benefitDatasets[n].benefitName Name of the benefit
 * @param {array} benefitDatasets[n].data List to which output
 *     will be pushed.
 * 
 * @returns undefined
 */
const insertBenefitData = function (xRange, clone, multiplier, benefitDatasets) {

  // Don't loop if there's nothing to do
  if (benefitDatasets.length === 0) {
    return;
  }

  // Otherwise, loop over incomes
  for (var incomei = 0; incomei < xRange.length; incomei++) {
    var income = xRange[ incomei ];
    clone.future.earned = income / multiplier;  // turn into monthly amount

    // Datasets need to be in correct order for benefits to
    // affect each other corrrectly.
    for (let benefiti = 0; benefiti < benefitDatasets.length; benefiti++) {

      let dataset = benefitDatasets[ benefiti ],
          name    = dataset.benefitName,
          funcs   = getBenefit[ name ];

      let monthlyAmount = funcs.getSubsidy(clone, `future`);
      dataset.data.push(monthlyAmount * multiplier);

      // Mutate the future values of the clone in whatever
      // way is appropriate for that program.
      let newPropValues = funcs.getProps(clone, monthlyAmount);
      Object.assign(clone.future, newPropValues);

    }  // end for each benefit, in order

    // placeholders
    var getBenefits = function () {},
        activeBenefits = [],
        dataset = [];
    let data = getBenefits({ state: `MA`, activeBenefits, clone, timeframe: `future` });

    let { newClient, ...benefits } = data;

    for (let benefiti in activeBenefits) {
      let name = activeBenefits[ benefiti ];
      dataset.data.push(data[ name ] * multiplier);
    }



  }  // end for all incomes

  return;
};  // End insertBenefitData()


/** Returns the graph data formated in a way our graph library understands.
 * 
 * @param {array} activeBenefits List of active benefits. @todo - use object instead?
 * */
const getDatasets = function (xRange, client, multiplier, activeBenefits, extraGraphProps) {

  // Don't want to change actual client's data
  var clone    = _.cloneDeep(client),
      datasets = [];

  for (let benefiti = 0; benefiti < benefitOrder.length; benefiti++) {

    let benefitName = benefitOrder[ benefiti ];

    if (activeBenefits.indexOf(benefitName) > -1) {

      var graphFrosting = PROGRAM_CHART_VALUES[ benefitName ];

      datasets.push({
        benefitName:     benefitName,
        label:           graphFrosting.name,
        backgroundColor: graphFrosting.color,
        borderColor:     graphFrosting.color,
        data:            [],  // Will be populated later
        ...extraGraphProps[ benefitName ],  // Override other props
      });
    }
  }  // end for benefits (in correct order)

  // Mutates each `.data` prop for each benefit
  insertBenefitData(xRange, clone, multiplier, datasets);

  return datasets;
};  // End getDatasets()


/*
// Return array of graph data

// Already have
benefitsInOrder
array

// Don't have
max, activeBenefits, multiplier, client, USState?
object, array, number, object, object, string?

// ========================
// 1, based around charts
// ========================
getChartDatasets (USState, incomes, multiplier/timeInterval, client, activeBenefits) {
  // Lets make incomes always monthly and they can be changed in here?
  // `activeBenefits` should include income?
  // Maybe `interval` instead of `multiplier`? And get multiplier in here?

  var benefitDatasets = [],
      allData         = { income: [] },  // each active benefit will have data in here
      clone           = cloneDeep(client),;

  // ABSTRACT THIS TO CONSTANTS SOMEWHERE
  var chartOptions = { label, background, border }

  var obj = {
    clientToChange: clone,
    state:          `MA`,
    timeWanted:     `future`,
    active:         activeBenefits,
    dataToChange:   allData,
  };

  for (income in incomes) {
    // Collect datasets in `allData`. Mutates `clone` and `allData`.
    // MUST ADD TO EACH BENEFIT. HOW? IN MUTATOR? [yes]
    // MUST CHANGE WITH MULTIPLIER. HOW? HERE? IN `getBenefits()`? [here]
    getBenefits(obj);

    // Adjust money amount to correct time interval (weekly, monthly, or yearly)
    for (benefitName in activeBenefits) {
      let val = dataToChange[ benefitName ][ indx ] * multiplier;
      dataToChange[ benefitName ][ indx ] = val;
    }
  }

  // Return in the same order as it was asked for
  for (each benefitName in activeBenefits) {

    // All info for that benefit
    let dataset = {
      ...chartOptions,
      data: allData[ benefitName ],
    };

    benefitDatasets.push(dataset);
  }

  return benefitDatasets;
}


// Mutates data and client
// addToBenefitData
// fillInBenefitData
accumulateBenefits ({ state, dataToChange, activeBenefits, clientToChange, timeframe }) {
  for (benefit in benefitsInOrder) {

    // If this isn't one of the benefits the caller wants
    if (!isIn(activeBenefits, benefit)) {
      continue;  // skip this loop
    }

    // If this benefit doesn't exist in the object, add it
    if (!isIn(dataToChange, benefit)) {
      dataToChange[ benefit ] = [];
    }

    var subsidy = calculateBenefit(clientToChange, timeframe);
    mutateWithSideEffects(clientToChange[ timeframe ], subsidy); // Un-time-restricted `clientToChange`?

    dataToChange[ benefit ].push(subsidy);
  }

  return;
}


getIncomes = (limits, multiplier) {
  // Adjust to time-interval, round to hundreds
  var maxIncome = Math.ceil((limits.max * multiplier) / 100) * 100,
      interval  = Math.ceil((max / 100) / 10) * 10;
  return _.range(limits.min, max, interval);
};

// ABSTRACT INSTEAD OF PASSING IN:
xRange...? Using mutliplier? xRange needs min, max, interval.


// ========================
// 2 XXX
// ========================

// Return in the same order as it was asked for
for (each benefitName in activeBenefits) {

  // All info for that benefit
  let dataset = {
    ...baseDataset,
    data: allData[ benefitName ],
  };

  let dataz = null;
  for (income in incomes) {
    var obj = {
      clone: clone,
      state: `MA`,
      timeframe: `future`,
      active: activeBenefits,
      dataRepository: {},
    };

    // Collect datasets as object. Mutates clone.
    // MUST ADD TO EACH BENEFIT. HOW? IN MUTATOR?
    dataz = getBenefits(`MA`, clone, activeBenefits, `future`, dataRepository);

  }

  dataz[ benefitName ]

  benefitDatasets.push(dataset);



}






*/


export {
  benefitOrder,
  getBenefit,
  getData,
  insertBenefitData,
  getDatasets,
};
