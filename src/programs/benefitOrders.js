import { benefitOrderMA } from './massachusetts/benefitOrderMA';

/**
 * Each state's benefits in the order in which
 * they should be processed.
 */
var benefitOrders = { MA: benefitOrderMA };


export { benefitOrders };
