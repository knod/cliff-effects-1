import React, { Component } from 'react';
import _ from 'lodash';
import { Line } from 'react-chartjs-2';

// CUSTOM ELEMENTS
import { VerticalLine } from './VerticalLine';

// LOGIC
import { timescaleMultipliers } from '../../utils/convert-by-timescale';
import { getIncomeRange } from '../../utils/getIncomeRange';
import {
  formatAxis,
  formatLabel,
  formatStackedTitle,
} from '../../utils/charts/chartFormatting';
import { getDatasets } from '../../utils/charts/getChartData';

// DATA
// In future, graphs will control their own aspect ratio,
// zoom levels, etc., so for now they'll have access to
// the limit values.
import { PROGRAM_CHART_VALUES } from '../../utils/charts/PROGRAM_CHART_VALUES';


// Graphs get things in monthly values, so we'll convert from there
var multipliers = timescaleMultipliers.fromMonthly,
    // Each graph controls its own scaling
    limits      = PROGRAM_CHART_VALUES.limits;

// ===============
// GRAPH DATA
// ===============
/* Note: default tooltip for chart.js 2.0+:
 * options: { tooltips: { callbacks: {
 *  label: function(tooltipItem, data) {
 *    return tooltipItem.yLabel;
 *  }
 * }}}
 */
class StackedAreaGraph extends Component {

  constructor (props) {
    super(props);
    this.state = { verticalLine: new VerticalLine() };
  }

  render () {
    const { client, timescale, activePrograms } = this.props;
    const multiplier = multipliers[ timescale ];

    var withIncome    = activePrograms.slice();
    withIncome.unshift('income');

    // Adjust to time-interval, round to hundreds
    var withIncome = activePrograms.slice();
    withIncome.unshift('income');

    var incomes    = getIncomeRange(limits, multiplier),
        extraProps = { income: { fill: 'origin' }},
        datasets   = getDatasets(incomes, client, multiplier, withIncome, extraProps);

    // react-chartjs-2 keeps references to plugins, so we
    // have to mutate that reference
    var income   = client.future.earned * multiplier,
        hack     = this.state.verticalLine;
    hack.incomes = incomes;
    hack.income  = income;

    var stackedAreaProps = {
      data: {
        labels:   incomes,
        datasets: datasets,
      },  // end `data`
      options: {
        title: {
          display: true,
          text:    'All Money Coming in as Income Changes',
        },  // end `title`
        elements: {
          line:  { fill: '-1' },
          point: {
            radius:      0,
            hitRadius:   10,
            hoverRadius: 10,
          },
        },  // end `elements`
        scales: {
          yAxes: [
            {
              stacked:    true,
              scaleLabel: {
                display:     true,
                labelString: 'Total Money Coming In ($)',
              },
              ticks: {
                beginAtZero: true,
                callback:    formatAxis,
              },
            },
          ],  // end `yAxes`
          xAxes: [
            {
              stacked:    true,
              scaleLabel: {
                display:     true,
                labelString: timescale + ' Income ($)',
              },
              ticks: { callback: formatAxis },
            },
          ],  // end `xAxes`
        },  // end `scales`
        tooltips: {
          callbacks: {
            title: formatStackedTitle,
            label: formatLabel,
          },
        },  // end `tooltips`
      },  // end `options`
      plugins: [ this.state.verticalLine ],
      redraw:  true,
    };  // end `stackedAreaProps`

    return (
      <Line { ...stackedAreaProps } />
    );
  }
};  // End <StackedAreaGraph>


export { StackedAreaGraph };
