import React from 'react';
import { Divider, Header, Tab, Message, Button, Menu } from 'semantic-ui-react';

// PROJECT COMPONENTS
import { FormPartsContainer } from './FormPartsContainer';
import { IntervalColumnHeadings } from '../components/headings';
import { CashFlowInputsRow } from './cashflow';
import { GraphHolder } from './output/GraphHolder';
import { BenefitsTable } from './output/BenefitsTable';
import { StackedBarGraph } from './output/StackedBarGraph';
import { StackedAreaGraph } from './output/StackedAreaGraph';
import { BenefitsLineGraph } from './output/BenefitsLineGraph';

// ========================================
// COMPONENTS
// ========================================
/** @todo Cash flow row for trying out different future incomes.
*
* @function
* @param {object} props
* @property {object} props.future Client future/predictive data.
* @property {string} props.time Used in class names. Meant to make
*     this more easily decoupled in future.
* @property {function} props.updateClientValue Update client state
*     value.
* @property {object} props.snippets Language-specific text
*
* @returns {object} React element
*/
const IncomeForm = function ({ future, time, updateClientValue, snippets }) {

  var type = 'income';

  /**
  * As per Project Hope's input, for the first prototype we're only
  *     including the ability to change earned income.
  */
  return (
    <div className='field-aligner two-column'>
      <IntervalColumnHeadings type={ type } />
      <CashFlowInputsRow
        timeState={ future }
        type={ type }
        time={ time }
        updateClientValue = { updateClientValue }
        generic='earned'
        labelInfo='(Weekly income = hourly wage times average number of work hours per week)'>
        { snippets.i_futureIncomeQuestion }
      </CashFlowInputsRow>
    </div>
  );
};  // End IncomeForm() Component


const TabbedVisualizations = ({ client, snippets }) => {
  return (
  // Benefit Courses, Tracks, Routes, Traces, Progressions, Progress, Trajectories, Changes
    <Tab
      menu={{ color: 'teal',  attached: true, tabular: true }}
      panes={ [
        { 
          menuItem: (
            <Menu.Item key="tab1">
              { snippets.i_tabTitleChanges }
            </Menu.Item>
          ),
          render: () => {
            return (
              <Tab.Pane>
                <BenefitsTable
                  client={ client }
                  snippets={ snippets } />
              </Tab.Pane>
            );
          },
        },
        { 
          menuItem: (
            <Menu.Item key="tab2">
              { snippets.i_tabTitleChangesChart }
            </Menu.Item>
          ),  
          render: () => {return <Tab.Pane><StackedBarGraph client={ client } /></Tab.Pane>;}, 
        },
        {
          menuItem: (
            <Menu.Item key="tab3">
              { snippets.i_tabTitleStackedIncomes }
            </Menu.Item>
          ),
          render: () => {
            return (
              <Tab.Pane>
                <GraphHolder
                  client={ client }
                  Graph={ StackedAreaGraph } />
              </Tab.Pane>
            );
          },
        },
        {
          menuItem: (
            <Menu.Item key="tab4">
              { snippets.i_tabTitleBenefitPrograms }
            </Menu.Item>
          ),
          render: () => {
            return (
              <Tab.Pane>
                <GraphHolder
                  client={ client }
                  Graph={ BenefitsLineGraph } />
              </Tab.Pane>
            );
          },
        },
      ] } />
  );
};


const PredictionsStep = function ({ updateClientValue, navData, client, snippets, openFeedback }) {

  return (
    <FormPartsContainer
      title     = { snippets.i_title }
      clarifier = { null }
      navData   = { navData }
      formClass = { `predictions` }>
      <IncomeForm
        updateClientValue = { updateClientValue }
        future            = { client.future }
        time              = { 'future' } 
        snippets          = { snippets } />
      <Divider className='ui section divider hidden' />
      <Header
        as        ='h3'
        className ='ui Header align centered'>
        { snippets.i_chartsHeader }
      </Header>
      <Message
        visible
        warning
        style={{ 'textAlign': 'center' }}>
        { snippets.i_warningMessage }
        <br />
        <Button
          fluid
          color='teal'
          style={{
            'display':     'block',
            'marginLeft':  'auto',
            'marginRight': 'auto',
            'marginTop':   '10px',
            'maxWidth':    '400px', 
          }}
          onClick={ openFeedback }>
          { snippets.i_submitFeedback }
        </Button>
      </Message>
      <TabbedVisualizations 
        client   = { client }
        snippets = { snippets } />
    </FormPartsContainer>
  );
};  // End FutureIncomeStep() Component

export { PredictionsStep };
                                              
