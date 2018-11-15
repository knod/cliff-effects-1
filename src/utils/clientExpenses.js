/** Getting all client expenses
 * @module */

// Folder structure notes:
// Near to CLIENT_DEFAULTS that has all the prop names, and
// other useful things.

// @todo Move all expense getting into here instead
// of cashflow.js which has a terrible and unclear name.
// @todo Consider how name-cores.js is done too. Maybe
// States should have various expense calculations in them
// that can be leveraged in here? For example, a
// `getAllStateSpecificExpenses()` function.
// @todo Get all client prop helpers into one area.

import {
  getHousingCosts,
  sumProps,
} from './cashflow';

/** Names of all expense props except housing, which is more
 * complicated. */
const expensePropNames = [
  `childDirectCare`,
  `childBeforeAndAfterSchoolCare`,
  `childTransportation`,
  `childOtherCare`,
  `earnedBecauseOfChildCare`,
  `childSupportPaidOut`,
  `adultDirectCare`,
  `adultTransportation`,
  `adultOtherCare`,
  `disabledAssistance`,
  `earnedBecauseOfAdultCare`,
  `disabledMedical`,
  `otherMedical`,
  `otherExpensesFood`,
  `otherExpensesUtilities`,
  `otherExpensesCable`,
  `otherExpensesMedical`,
  `otherExpensesTransport`,
  `otherExpensesCareProducts`,
  `otherExpensesClothes`,
  `otherExpensesPhone`,
  `otherExpensesEntertainment`,
  `otherExpensesOther`,
  `wantsToSeeOtherExpenses`,
];  // ends expensePropNames


/** Get total of all client expenses.
 * @param {object} client `.current` or `.future` of usual client object
 * @returns {number}
 */
const getAllExpenses = function (client) {
  let housingCosts = getHousingCosts(client),
      others       = sumProps(client, expensePropNames);
  return housingCosts + others;
};


export {
  expensePropNames,
  getAllExpenses,
};
