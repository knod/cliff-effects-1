// REACT COMPONENTS
import React from 'react';
import { Table } from 'semantic-ui-react';

// BENEFIT LOGIC
import { applyAndPushBenefits } from '../../programs/applyAndPushBenefits';

// DATA
// Colors and text for parts of the chart
import { PROGRAM_CHART_VALUES } from '../../utils/charts/PROGRAM_CHART_VALUES';

// OBJECT MANIPULATION
import { cloneDeep } from 'lodash';


const getSignSymbol = function (num) {
  if (num > 0) {
    return '+';
  }
  else if (num < 0) {
    return '-';
  }
  else { return ''; }
};  // End getSignSymbol()


const BenefitsRow = function ({ dataset, snippets }) {

  var rowHeaderStyle    = {
    fontSize:   `1.1em`,
    fontWeight: 700,
    textAlign:  `left`,
  };

  return (
    <Table.Row>
      <Table.Cell style = { rowHeaderStyle }>{ dataset.label }</Table.Cell>
      <Table.Cell textAlign = { `right` }>
        { snippets.dollarSign_v1 }
        { dataset.current }
        { snippets.perMonth_v1 }
      </Table.Cell>
      <Table.Cell textAlign = { `right` }>
        { snippets.dollarSign_v1 }
        { dataset.future }
        { snippets.perMonth_v1 }
      </Table.Cell>
      <Table.Cell textAlign = { `right` }>
        { getSignSymbol(dataset.diff) } { snippets.dollarSign_v1 }
        { Math.abs(dataset.diff) }
        { snippets.perMonth_v1 }
      </Table.Cell>
    </Table.Row>
  );
};  // End <BenefitsRow>


const BenefitsTable = function ({ client, snippets }) {

  var clone = cloneDeep(client);
  var curr = clone.current;

  var allData         = {},
      activeBenefits  = [];

  if (curr.hasSection8) {
    activeBenefits.push(`section8`);
  }

  if (curr.hasSnap) {
    activeBenefits.push(`snap`);
  }

  var currentCalcData = {
    activeBenefits: activeBenefits,
    dataToAddTo:    allData,
    clientToChange: clone,
    timeframe:      `current`,
  };
  applyAndPushBenefits (currentCalcData);

  // Add to the `current` data already there
  var futureCalcData = {
    activeBenefits: activeBenefits,
    dataToAddTo:    allData,
    clientToChange: clone,
    timeframe:      `future`,
  };
  applyAndPushBenefits (futureCalcData);

  var benefitRows  = [],
      currentSums  = 0,
      futureSums   = 0,
      diffSums     = 0;
  for (let bName of activeBenefits) {

    let frosting = PROGRAM_CHART_VALUES[ bName ],
        dataset  = { label: frosting.name };

    let rawData     = allData[ bName ];
    // Always three columns of numbers
    dataset.current = Math.round(rawData[ 0 ]);
    dataset.future  = Math.round(rawData[ 1 ]);
    dataset.diff    = dataset.future - dataset.current;

    currentSums += dataset.current;
    futureSums  += dataset.future;
    diffSums    += dataset.diff;

    benefitRows.push(
      <BenefitsRow
        dataset  = { dataset }
        snippets = { snippets }
        key      = { frosting.name } />
    );
  }  // end for each benefit in order

  var benefitTotalsRow = {
    current: currentSums,
    future:  futureSums,
    diff:    diffSums,
  };

  var incomesRow = {
    current: Math.round(clone.current.earned),
    future:  Math.round(clone.future.earned),
    diff:    Math.round(clone.future.earned - clone.current.earned),
  };

  var totalsRow = {
    current: benefitTotalsRow.current + incomesRow.current,
    future:  benefitTotalsRow.future + incomesRow.future,
    diff:    benefitTotalsRow.diff + incomesRow.diff,
  };

  const columnHeaderStyle = {
          background:    'rgba(0, 181, 173, 1)',
          color:         'white',
          fontSize:      '1.3em',
          fontWeight:    900,
          textAlign:     'center',
          borderRadius:  'inherit',
          letterSpacing: '0.02em',
        }
        , totalsRowStyle    = {
          borderTop:  '2px solid rgba(0, 181, 173, 1)',
          fontWeight: 700,
          fontSize:   '1.1em',
          padingTop:  '0.25em',
        }
        , rowHeaderStyle    = {
          fontSize:   '1.1em',
          fontWeight: 700,
          textAlign:  'left',
        }
        , totalsRowHeaderStyle = {
          fontSize:   '1.2em',
          fontWeight: 700,
          textAlign:  'left',
          borderTop:  '2px solid rgba(0, 181, 173, 1)',
          padingTop:  '0.25em',


        };


  const TotalBenefitsRow = function({ client, snippets }){
    if (!client.current.hasSnap || !client.current.hasSection8) {
      return (null);
    }

    return (
      <Table.Row>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowHeaderStyle }>{ snippets.rowTotalBenefits_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ snippets.dollarSign_v1 }{ benefitTotalsRow.current }{ snippets.perMonth_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ snippets.dollarSign_v1 }{ benefitTotalsRow.future }{ snippets.perMonth_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ getSignSymbol(benefitTotalsRow.diff) } { snippets.dollarSign_v1 }{ Math.abs(benefitTotalsRow.diff) }{ snippets.perMonth_v1 }
        </Table.Cell>
      </Table.Row>
    );
  };

  const IncomeRow = function ({ snippets }) {
    return (
      <Table.Row>
        <Table.Cell style={ rowHeaderStyle }>{ snippets.rowIncome_v1 }</Table.Cell>
        <Table.Cell textAlign='right'>{ snippets.dollarSign_v1 }{ incomesRow.current }{ snippets.perMonth_v1 }</Table.Cell>
        <Table.Cell textAlign='right'>{ snippets.dollarSign_v1 }{ incomesRow.future }{ snippets.perMonth_v1 }</Table.Cell>
        <Table.Cell textAlign='right'>{ getSignSymbol(incomesRow.diff) } { snippets.dollarSign_v1 }{ Math.abs(incomesRow.diff) }{ snippets.perMonth_v1 }</Table.Cell>
      </Table.Row>
    );
  };

  const TotalsRow = function ({ snippets }) {
    return (
      <Table.Row style={{ border: 'none' }}>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowHeaderStyle }>{ snippets.rowNetTotal_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ snippets.dollarSign_v1 }{ totalsRow.current }{ snippets.perMonth_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ snippets.dollarSign_v1 }{ totalsRow.future }{ snippets.perMonth_v1 }
        </Table.Cell>
        <Table.Cell
          textAlign='right'
          width={ 3 }
          style={ totalsRowStyle }>{ getSignSymbol(totalsRow.diff) } { snippets.dollarSign_v1 }{ Math.abs(totalsRow.diff) }{ snippets.perMonth_v1 }
        </Table.Cell>
      </Table.Row>
    );
  };

  return (
    <div>
      <Table celled>
        <Table.Header>
          <Table.Row >
            <Table.Cell
              style={ columnHeaderStyle }
              width={ 3 }>{ snippets.columnBenefit_v1 }
            </Table.Cell>
            <Table.Cell
              style={ columnHeaderStyle }
              width={ 3 }>{ snippets.columnCurrentBenefits_v1 }
            </Table.Cell>
            <Table.Cell
              style={ columnHeaderStyle }
              width={ 3 }>{ snippets.columnNewEstimate_v1 }
            </Table.Cell>
            <Table.Cell
              style={ columnHeaderStyle }
              width={ 3 }>{ snippets.columnDifference_v1 }
            </Table.Cell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { benefitRows }
          <TotalBenefitsRow 
            client={ clone } 
            snippets={ snippets } />
          <IncomeRow snippets={ snippets } />
          <TotalsRow snippets={ snippets } />
        </Table.Body>
      </Table>
    </div>
  );

};  // End BenefitsTable(<>)


export {
  BenefitsTable,
  BenefitsRow,
  getSignSymbol,
};
