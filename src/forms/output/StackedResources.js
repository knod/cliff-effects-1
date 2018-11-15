import React, { Component } from 'react';
import { range } from 'lodash';

// HIGHCHARTS
import Highcharts from 'highcharts';
import {
  HighchartsChart,
  Chart,
  Title,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  PlotLine,
  AreaSeries,
  PlotBand,
  withHighcharts,
} from 'react-jsx-highcharts';

// LOGIC
import { timescaleMultipliers } from '../../utils/convert-by-timescale';
import { getChartData } from '../../utils/charts/getChartData';
import { getAllExpenses } from '../../utils/clientExpenses';
// All these money formatters need to be checked for duplicated work
// and consolidated to what we really need.
import {
  toFancyMoneyStr,
  withCurrency,
  toMoneyStr,
} from '../../utils/prettifiers';
import {
  formatMoneyWithK,
  snippetToText,
} from '../../utils/chartStringTransformers';

// DATA
import { PROGRAM_CHART_VALUES } from '../../utils/charts/PROGRAM_CHART_VALUES';


// Graphs get things in monthly values, so we'll convert from there
let multipliers = timescaleMultipliers.fromMonthly,
    // Each graph controls its own scaling
    limits      = PROGRAM_CHART_VALUES.limits;


/** Graph of all incoming resources as household income changes. Uses Highchart lib.
 * @class
 *
 * @params {object} props
 * @params {object} props.client Data for current and future client circumstances.
 * @params {'Weekly'|'Monthly'|'Yearly'} props.timescale Should be `timeInterval`.
 * @params {string[]} props.activePrograms Benefit programs in which the household enrolled.
 * @params {object} props.className An extra class for the outermost component,
 *     whether it's the chart or the no-chart message.
 * @params {object} props.snippets Translation spans of text in app.
 */
class StackedResourcesComp extends Component {

  constructor (props) {
    super(props);
    let separator = snippetToText(props.snippets.i_thousandsSeparator);
    // This doesn't affect the strings we put in there, just pure numbers
    Highcharts.setOptions({ lang: { thousandsSep: separator }});
  }

  render () {
    const {
      client,
      timescale,
      activePrograms,
      className,
      snippets,
    } = this.props;

    const multiplier  = multipliers[ timescale ],
          resources   = [ `earned` ].concat(activePrograms),
          currentPay  = client.current.earned * multiplier,
          getText     = snippetToText,
          allExpenses = getAllExpenses(client.current) * multiplier;

    // Adjust to time-interval. Highcharts will round
    // for displayed ticks.
    const max      = (limits.max * multiplier),
          interval = ((max / 100) / 10) * 30;

    const xRange   = range(limits.min, max, interval),  // x-axis/earned income numbers
          datasets = getChartData(xRange, multiplier, client, resources, {});

    // Individual benefit lines
    const lines = [];
    for (let dataseti = 0; dataseti < datasets.length; dataseti++) {
      let dataset = datasets[ dataseti ],
          line = (
            <AreaSeries
              key         = { dataset.label }
              id          = { dataset.label.replace(` `, ``) }
              name        = { dataset.label }
              data        = { dataset.data }
              legendIndex = { dataseti } />
          );

      lines.unshift(line);
    }

    // Get 'Unexpected template string expression' warning otherwise
    // Not sure how to use `withCurrency()` here
    const labelHeaderFormatStart = `<span style="font-size: 10px">${getText(snippets.i_beforeMoney)}`,
          labelHeaderFormatEnd   = `{point.key:,.2f}${getText(snippets.i_afterMoney)}</span><br/>`,
          labelHeaderFormat      = labelHeaderFormatStart + labelHeaderFormatEnd;


    const plotOptions =  {
      area:   { stacking: `normal`, pointInterval: interval },
      series: { marker: { enabled: false }},  // No dots on the lines
    };

    // @todo Abstract different component attributes as frosting
    // `zoomKey` doesn't work without another package
    // Expenses number still lacks thousands separator
    return (
      <div className={ `benefit-lines-graph ` + (className || ``) }>
        <HighchartsChart plotOptions={ plotOptions }>

          <Chart
            tooltip  = {{ enabled: true }}
            zoomType = { `xy` }
            panning  = { true }
            panKey   = { `alt` }
            resetZoomButton = {{ theme: { zIndex: 200 }, relativeTo: `chart` }} />

          <Title>{ getText(snippets.i_benefitProgramsTitle) }</Title>

          <Legend
            align         = { `center` }
            verticalAlign = { `top` } />

          <Tooltip
            split         = { true }
            headerFormat  = { labelHeaderFormat }
            valuePrefix   = { `$` }
            valueDecimals = { 2 }
            padding       = { 8 }
            borderRadius  = { 4 }
            borderColor   = { `transparent`  }
            hideDelay     = { 300 } />

          <XAxis
            endOnTick = { false }
            labels    = {{ formatter: this.formatMoneyWithK }}
            crosshair = {{}}>

            <XAxis.Title>{ `${timescale} ${getText(snippets.i_xAxisTitleEnd)}<br/>${getText(snippets.i_zoomInstructions)}` }</XAxis.Title>
            <PlotLine
              value     = { currentPay }
              useHTML   = { true }
              label     = {{ text: `${getText(snippets.i_currentPayPlotLineLabel)}<br/>${toFancyMoneyStr(currentPay)}`, rotation: 0 }}
              zIndex    = { 5 }
              width     = { 2 }
              color     = { `gray` }
              dashStyle = { `ShortDashDot` } />

          </XAxis>

          <YAxis
            endOnTick  = { false }
            labels     = {{ useHTML: true, formatter: this.formatMoneyWithK }}>

            <YAxis.Title>{ getText(snippets.i_benefitValue) }</YAxis.Title>

            { lines }
            <PlotBand
              id     = { `allExpensesArea` }
              name   = { `All Expenses` }
              label  = {{ text: `Expenses: ${withCurrency(toMoneyStr(allExpenses), snippets)}`, verticalAlign: `top`, y: 15, align: `right`, textAlign: `right`, x: -5 }}
              from   = { 0 }
              to     = { allExpenses }
              color  = { `rgba(242, 113, 28, .5)` }
              zIndex = { 3 } />
            <PlotLine
              id        = { `allExpensesLine` }
              value     = { allExpenses }
              color     = { `#f2711c` }
              width     = { 2 }
              dashStyle = { `ShortDot` }
              zIndex    = { 3 } />

          </YAxis>

        </HighchartsChart>

      </div>
    );
  }  // Ends render()


  /** Adds translation-specific money designations
   *     (like a dollar sign for English) to the number value
   *     string Highcharts creates, then wraps it in a span with
   *     a class.
   * @method
   *
   * @params {highchartsObject} hcObject Object Highcharts sends to event
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
  formatMoneyWithK = (highchartsObject) => {
    return formatMoneyWithK(highchartsObject, this.props.snippets);
  };
};


const StackedResources = withHighcharts(StackedResourcesComp, Highcharts);


export { StackedResources };
