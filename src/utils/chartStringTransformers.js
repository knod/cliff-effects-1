/** Functions to help transform strings for charts.
 * @module */

import { withCurrency } from './prettifiers';


/** Recursively extract text from language-specific React
 *     objects. Creates one inline string of text.
 *
 * Recursion is untested.
 * @params {object} translationObj React element containing
 *     children that are strings or other React elements.
 *
 * @returns {string}
 */
const snippetToText = function (translationObj) {

  const children = translationObj.props.children;
  
  if (typeof children === `string`) {
    return children;

  // To handle more complex translationObj objects
  } else if (Array.isArray(children)) {

    let allText = ``;
    for (let child of children) {
      allText += ` ` + this.snippetToText(child);
    }

    return allText;
  }
};


/** Adds translation-specific money designations
 *     (like a dollar sign for English) to the number value
 *     string Highcharts creates, then wraps it in a span with
 *     a class.
 *
 * @params {object} chartObject Object Highcharts sends to event
 *     handlers
 *
 * @returns {string} String representing an HTML element.
 * 
 * @example
 * let toShow = formatMoneyWithk({ axis: { defaultLabelFormatter: function () { return '10k'; }} });
 * console.log(toShow);
 * // If app's language code is 'en':
 * // <span class="graph-label">$10k</span>
 * // If app's language code is 'vi':
 * // <span class="graph-label">10k$</span>
 */
const formatMoneyWithK = (chartObject, snippets) => {
  // https://api.highcharts.com/highcharts/xAxis.labels.formatter
  const withK     = chartObject.axis.defaultLabelFormatter.call(chartObject),
        withMoney = withCurrency(withK, snippets),
        asHTML    = `<span class="graph-label">${withMoney}</span>`;
  return asHTML;
};


export {
  formatMoneyWithK,
  snippetToText,
};
