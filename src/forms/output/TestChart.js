import React, { Component } from 'react';

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
  LineSeries,
  withHighcharts,
} from 'react-jsx-highcharts';

// // LOGIC
// import { timescaleMultipliers } from '../../utils/convert-by-timescale';
// import { getChartData } from '../../utils/charts/getChartData';
import { toFancyMoneyStr } from '../../utils/charts/chartFormatting';

// // DATA
// // In future, graphs will control their own aspect ratio,
// // zoom levels, etc., so for now they'll have access to
// // the limit values.
// import { PROGRAM_CHART_VALUES } from '../../utils/charts/PROGRAM_CHART_VALUES';


// // Graphs get things in monthly values, so we'll convert from there
// let multipliers = timescaleMultipliers.fromMonthly,
//     // Each graph controls its own scaling
//     limits      = PROGRAM_CHART_VALUES.limits;


// Add/remove plotLine
// https://stackoverflow.com/a/14632292/3791179
// Also has a mousein and mouseout hook we can use
// to make it bigger when hovered over.

// Remove point markers
// https://stackoverflow.com/a/14642909/3791179

// (Note: If we have room to include the plot lines amount
// in the label, we probably don't need tooltips for them.)
// Possible way to handle tooltips for plot lines
// https://stackoverflow.com/questions/12451549/highcharts-plotband-tooltip-hover-default-styling#21277491
// Dunno if I like the CSS solution since it then hides the label text except on hover.
// Maybe could use something similar where the HTML has the label part and then a separate tooltip part...

// Haven't figured out how to pan vertically
// This might help, but means chart may have set dimensions:
// https://api.highcharts.com/highcharts/chart.scrollablePlotArea
// Not sure how it would act with zoom.


// Going to copy the benefits line graph into here
/** @namespace */
class TestChartComp extends Component {

  zoomProportionally = (event) => {
    // No way to know where a selection drag started

    // Don't mess with resetting a selection
    if (event.resetSelection === true) {
      return true;  // do reset selection?
    }

    // Get the current extremes as chart units/values
    const xVals = {
            min: event.xAxis[ 0 ].min,
            max: event.xAxis[ 0 ].max,
          },
          yVals = {
            min: event.yAxis[ 0 ].min,
            max: event.yAxis[ 0 ].max,
          };

    // Get the operations for the different axes
    const xAxis = this.chart.xAxis[ 0 ],
          yAxis = this.chart.yAxis[ 0 ];

    // Get the pixel units so we can compare proportions
    const xPix = {
      min: xAxis.toPixels(xVals.min),
      max: xAxis.toPixels(xVals.max),
    };
    xPix.diff = xPix.max - xPix.min;

    // flip y amounts because y 0 is at the top
    const yPix = {
      min: yAxis.toPixels(yVals.max),
      max: yAxis.toPixels(yVals.min),
    };
    yPix.diff = yPix.max - yPix.min;

    // Make the pixel sizes match
    let axisThatChanged = null,
        newExtremes     = null;

    // Whichever is the smaller size, match to that one
    // Since we're matching the smallest size, will we
    // ever hit a max or min? ...I'm going to assume no.

    // If x is smaller, y has to change
    if (xPix.diff < yPix.diff) {
      // @todo How to pick the right ratio?
      // const ratio = this.chart.plotHeight/this.chart.plotWidth;
      // console.log('ratio', ratio);
      axisThatChanged = `y`;
      newExtremes     = this.getNewExtremes(yPix, xPix);
    // If y is smaller, x has to change
    } else {
      axisThatChanged = `x`;
      newExtremes     = this.getNewExtremes(xPix, yPix);
    }

    // Convert back to chart units because that's what
    // `setExtremes` uses, then set those extremes.
    if (axisThatChanged === `y`) {
      // flip y amounts back here
      const min = yAxis.toValue(newExtremes.max),
            max = yAxis.toValue(newExtremes.min);
      console.log('------- y changing');
      console.log('x original vals:', xVals, xVals.max - xVals.min, '; y original vals:', yVals, yVals.max - yVals.min);
      console.log('x original pix:', xPix, '; y original pixs:', yPix);
      console.log('y new pix:', newExtremes, '; y new vals:', min, max, min - max);
      yAxis.setExtremes(min, max);
    } else {
      const min = xAxis.toValue(newExtremes.min),
            max = xAxis.toValue(newExtremes.max);
      console.log('------- x changing');
      console.log('x original vals:', xVals, xVals.max - xVals.min, '; y original vals:', yVals, yVals.max - yVals.min);
      console.log('x original pix:', xPix, '; y original pixs:', yPix);
      console.log('x new pix:', newExtremes, '; x new vals:', min, max, min - max);
      xAxis.setExtremes(min, max);
    }

    // Don't send zoom event
    event.preventDefault();
    return false;
  };  // Ends zoomProportionally()

  /** Returns new min and max values using `diff`
   *     as a guide.
   *
   * @param {object} current
   * @param {number} current.min
   * @param {number} current.diff
   * @param {object} toMatchTo
   * @param {number} toMatchTo.diff
   * 
   * @returns {object} newExtremes { min: number, max: number }
   */
  getNewExtremes = function (current, toMatchTo, ratio) {
    // @todo How to use the ratio to crop the area correctly?
    const halfDiff    = toMatchTo.diff / 2,
          currCenter  = current.min + (current.diff / 2),
          newExtremes = {
            min: currCenter - halfDiff,
            max: currCenter + halfDiff,
          };

    return newExtremes;
  };

  zoomOut = () => {
    this.chart.zoomOut();
  };

  getChart = (chart) => {
    this.chart = chart;
  };


  render () {
    const { className } = this.props,
          currentEarned = 3.3056,
          interval      = 1;
    
    this.maxY = 800.23445;

    const plotOptions =  { line: { pointInterval: interval }},
          chart       = { events: { selection: this.zoomProportionally }};

    // zoomKey doesn't work without another package

    return (
      <div className={ `test-chart ` + (className || ``) }>
        <button onClick={ this.zoomOut }>Zoom out</button>

        <HighchartsChart
          plotOptions = { plotOptions }
          chart       = { chart }
          callback    = { this.getChart }>

          <Chart

            tooltip  = {{ enabled: true }}
            zoomType = { `xy` }
            panning  = { true }
            panKey   = { `alt` }
            resetZoomButton = {{ theme: { zIndex: 200 }, relativeTo: `chart` }} />

          <Title>Test</Title>

          <Legend
            align         = { `center` }
            verticalAlign = { `top` } />

          <Tooltip
            split         = { true }
            valuePrefix   = { `$` }
            valueDecimals = { 2 }
            padding       = { 8 }
            borderRadius  = { 4 }
            borderColor   = { `transparent`  }
            hideDelay     = { 300 } />

          <XAxis
            endOnTick = { false }
            min       = { 0 }>

            <XAxis.Title>Pay</XAxis.Title>
            <PlotLine
              useHTML   = { true }
              value     = { currentEarned }
              label     = {{ text: `Current pay:<br/>${toFancyMoneyStr(currentEarned)}`, rotation: 0 }}
              zIndex    = { 5 }
              width     = { 2 }
              color     = { `gray` }
              dashStyle = { `ShortDashDot` } />

          </XAxis>

          <YAxis
            endOnTick = { false }
            min       = { 0 }>

            <YAxis.Title>Benefit Value</YAxis.Title>

            <LineSeries data={ [
              100.23445,
              200.23445,
              300.23445,
              200.23445,
              300.23445,
              800.23445,
              100.23445,
              200.23445,
              300.23445, 
            ] } /><LineSeries data={ [
              600.23445,
              500.23445,
              400.23445,
              500.23445,
              400.23445,
              500.23445,
              600.23445,
              500.23445,
              400.23445, 
            ] } />

          </YAxis>

        </HighchartsChart>
      </div>
    );
  }  // Ends render()
};  // Ends <TestChartComp>


const TestChart = withHighcharts(TestChartComp, Highcharts);


export { TestChart };
