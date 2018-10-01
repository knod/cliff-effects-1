/** @module utils/valueFixers.js
 * Transformers for transforming client
 * values into valid values.
 */

const returnSame = function (newVal, state) {
  return newVal;
};

/** Converts known bool-like values to bools */
const toBoolean = function (value) {
  if (value === 'Yes') {
    return true;
  } else if (value === 'No') {
    return false;
  } else if (typeof(value) === 'boolean') {
    return value;
  } else {
    return null;
  }
};

const stringToNumber = function (str) {
  return Number(str);
};

/**
 * Every client property and nested property must have one.
 */
const valueFixers = {
  // Current programs
  hasSnap:                       returnSame,
  hasSection8:                   returnSame,
  // Household
  household:                     returnSame,
  m_age:                         returnSame,  // to positive int (validate in component?)
  m_role:                        returnSame,
  m_disabled:                    returnSame,
  // MONEY AMOUNTS
  // Income
  earned:                        stringToNumber,
  TAFDC:                         stringToNumber,
  SSI:                           stringToNumber,
  SSDI:                          stringToNumber,
  childSupportIn:                stringToNumber,
  unemployment:                  stringToNumber,
  workersComp:                   stringToNumber,
  pension:                       stringToNumber,
  socialSecurity:                stringToNumber,
  alimony:                       stringToNumber,
  otherIncome:                   stringToNumber,
  incomeExclusions:              stringToNumber,
  // Expenses
  childDirectCare:               stringToNumber,
  childBeforeAndAfterSchoolCare: stringToNumber,
  childTransportation:           stringToNumber,
  childOtherCare:                stringToNumber,
  earnedBecauseOfChildCare:      stringToNumber,
  childSupportPaidOut:           stringToNumber,
  adultDirectCare:               stringToNumber,
  adultTransportation:           stringToNumber,
  adultOtherCare:                stringToNumber,
  disabledAssistance:            stringToNumber,
  earnedBecauseOfAdultCare:      stringToNumber,
  disabledMedical:               stringToNumber,
  otherMedical:                  stringToNumber,
  housing:                       returnSame,
  contractRent:                  stringToNumber,
  rentShare:                     stringToNumber,
  rent:                          stringToNumber,
  mortgage:                      stringToNumber,
  housingInsurance:              stringToNumber,
  propertyTax:                   stringToNumber,
  climateControl:                returnSame,
  nonHeatElectricity:            returnSame,
  phone:                         returnSame,
  fuelAssistance:                toBoolean,
  otherExpensesFood:             stringToNumber,
  otherExpensesUtilities:        stringToNumber,
  otherExpensesCable:            stringToNumber,
  otherExpensesMedical:          stringToNumber,
  otherExpensesTransport:        stringToNumber,
  otherExpensesCareProducts:     stringToNumber,
  otherExpensesClothes:          stringToNumber,
  otherExpensesPhone:            stringToNumber,
  otherExpensesEntertainment:    stringToNumber,
  otherExpensesOther:            stringToNumber,
  wantsToSeeOtherExpenses:       toBoolean,

};  // end valueFixers


export { valueFixers, returnSame, stringToNumber, toBoolean };
