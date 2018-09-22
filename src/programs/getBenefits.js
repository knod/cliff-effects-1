// DATA
import { benefitOrders } from './benefitOrders';

// LOGIC
import { getSection8Benefit } from './massachusetts/section8';
import { getSNAPBenefits } from './federal/snap';

// OBJECT MANAGEMENT
import { cloneDeep } from 'lodash';


var getters = {
  snap: {
    getSubsidy:  getSNAPBenefits,
    sideEffects: function (client, timeframe, newSubsidy) {
      client[ timeframe ].rentShare = newSubsidy;
      return;
    },
  },
  section8: {
    getSubsidy:  getSection8Benefit,
    sideEffects: function (client, timeframe, newSubsidy) {
      return;
    },
  },
};


/**
 * Returns the benefits for the client in the given
 *     timeframe.
 * 
 * Clones `client` in order to avoid affecting caller's
 *     objects.
 * 
 * Returns... array of benefits? That's useful in one case,
 * but not in another.
 */
var getBenefits = function (state, activeBenefits, client, timeframe) {

  state = state || `MA`;

  var benefitOrder = benefitOrders[ state ],
      clone        = cloneDeep(client);

  var benefits = [];

  for (let benefiti = 0; benefiti < benefitOrder.length; benefiti ++) {
    let name = benefitOrder[ benefiti ];

    if (activeBenefits[ name ] === true) {
      let monthlyAmount = getters[ name ].getSubsidy(clone, timeframe);
      getters[ name ].sideEffects(clone, monthlyAmount);

      benefits.push(monthlyAmount);
    }
  }  // End for each benefit in order

  return { newClient: clone, benefits: benefits };
};  // End getBenefits()


export { getBenefits };
