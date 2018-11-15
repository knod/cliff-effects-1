/**
 * Functions for making client values into values
 *     that users will see.
 * @module
 */

// @todo Are any of these used outside of output?

import { snippetToText } from './chartStringTransformers';


// @todo Put code from #226 in here
// @todo Needs clearer name
/** Rounds a number to the first two decimal points or adds
 *     decimal points if needed, then cuts off all extra
 *     decimals, returning a string.
 * Does this need a better name? Is it useful?
 *
 * @param {number} decimal Number that might have decimals
 * @returns {string}
 */
const toMoneyStr = function (decimal) {
  return (decimal).toFixed(2);
};

/** Surrounds money amounts with currency symbols based
 *     on props of `translations`.
 *
 * @param {string|number} toSurround Money amount. If needed, it should
 *     have commas, etc. The reason for separating this functionality
 *     is that our highcharts string formatter sends along a
 *     pre-formatted string. We may handle that formatting differently
 *     in the future.
 * @param {object} translations Object containing translation
 *     spans.
 * @param {object} translations.i_beforeMoney Characters that
 *     should go before currency.
 * @param {object} translations.i_afterMoney Characters that
 *     should go after currency.
 *
 * @returns {string}
 */
const withCurrency = function (toSurround, translations) {
  const before = snippetToText(translations.i_beforeMoney),
        after  = snippetToText(translations.i_afterMoney);
  return before + toSurround + after;
};

// @todo Rename to clearer name
/** Convert number to USD money string with no decimal places if
 *     they're not needed.
 * @todo Make it app language specific.
 *
 * @param {string} toFormat String representing a number
 *     to convert to a US money value format
 *
 * @returns {string}
 */
const toFancyMoneyStr = function (toFormat) {
  return toFormat.toLocaleString('en-US', { style: 'currency',currency: 'USD' }).replace('.00','');
};


export {
  toMoneyStr,
  withCurrency,
  toFancyMoneyStr,
};
