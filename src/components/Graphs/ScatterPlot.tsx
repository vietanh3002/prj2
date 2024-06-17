import * as d3 from 'd3';

import { AxisLeft } from './AxisLeft';
import { ScatterplotProps } from '../../types/GraphType';
import { AxisBottom } from './AxisBottom';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

export const Scatterplot = ({ width, height, data, tour }: ScatterplotProps) => {
  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  // const yScale = d3.scaleLinear().domain([0, 10]).range([boundsHeight, 0]);
  // const xScale = d3.scaleLinear().domain([0, 10]).range([0, boundsWidth]);
  const yScale = d3.scaleLinear().domain([0, 2100]).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain([0, 4200]).range([0, boundsWidth]);

  // Build the shapes
  const allShapes = data.map((d, i) => {
    return (
      <circle
        key={i}
        r={15}
        // cx={xScale(d.y)}
        // cy={yScale(d.x)}
        cx={xScale(d[0])}
        cy={yScale(d[1])}
        opacity={1}
        stroke="#cb1dd1"
        fill="#cb1dd1"
        fillOpacity={0.1}
        strokeWidth={1}
      />
    );
  });

  // Build the lines
  const constructLines = tour.map((d, i, tour) => {
    if (i == tour.length - 1) {
      return;
    }
    const currentVertex = Number(d);
    const nextVertex = Number(tour[i + 1]);
    const x1 = data[currentVertex][0];
    const y1 = data[currentVertex][1];
    const x2 = data[nextVertex][0];
    const y2 = data[nextVertex][1];
    return (
      <line
        key={i}
        x1={xScale(x1)}
        x2={xScale(x2)}
        y1={yScale(y1)}
        y2={yScale(y2)}
        strokeWidth={1}
        stroke="#cb1dd1"
        fill="#cb1dd1"
      ></line>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        {/* first group is for the violin and box shapes */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom xScale={xScale} pixelsPerTick={40} height={boundsHeight} />
          </g>

          {/* Circles */}
          {allShapes}
          {constructLines}
        </g>
      </svg>
    </div>
  );
};
