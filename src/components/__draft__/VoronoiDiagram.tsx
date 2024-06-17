import * as d3 from 'd3';

import { AxisLeft } from '../Graphs/AxisLeft';
import { ScatterplotProps, VoronoiPlotProps } from '../../types/GraphType';
import { AxisBottom } from '../Graphs/AxisBottom';
import { Delaunay } from 'd3';
import { useEffect } from 'react';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

export const VoronoiDiagram = ({ width, height, data }: VoronoiPlotProps) => {
  let svgPath = {
    voronoiCells: '',
    voronoiPoints: '',
    voronoiBounds: '',
  };

  let voronoi: d3.Voronoi<Delaunay.Point>;

  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = d3.scaleLinear().domain([0, 10]).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain([0, 10]).range([0, boundsWidth]);
  // const yScale = d3.scaleLinear().domain([0, 2100]).range([boundsHeight, 0]);
  // const xScale = d3.scaleLinear().domain([0, 4200]).range([0, boundsWidth]);

  const delaunayData: Array<Delaunay.Point> = [];
  data.forEach((item, index) => {
    const z = [xScale(item[0]), yScale(item[1])] as Delaunay.Point;
    // const z = [item[0], item[1]] as Delaunay.Point;
    delaunayData.push(z);
  });

  const GetVoronoiPathString = () => {
    const delaunay = Delaunay.from(delaunayData);
    voronoi = delaunay.voronoi([0, 0, boundsWidth, boundsHeight]);
    const voronoiCells = voronoi.render();
    const voronoiPoints = delaunay.renderPoints();
    const voronoiBounds = voronoi.renderBounds();
    return {
      voronoiCells: voronoiCells,
      voronoiPoints: voronoiPoints,
      voronoiBounds: voronoiBounds,
    };
  };

  const VoronoiBuilup = () => {
    const delaunay = Delaunay.from(delaunayData);

    // const delaunay = Delaunay.from(
    //   delaunayData,
    //   (d) => xScale(d[0]),
    //   (d) => yScale(d[1])
    // );

    // const canvas = loadCanvas('voronoid-ground');
    const canvas = document.createElement('canvas');
    canvas.id = 'CursorLayer';
    canvas.width = width;
    canvas.height = height;
    canvas.style.zIndex = '8';
    canvas.style.position = 'absolute';
    canvas.style.border = '1px solid';
    document.querySelector('#voronoid-ground')?.appendChild(canvas);

    const context = canvas.getContext('2d'); // DOM.context2d(width, height);
    // const voronoi = delaunay.voronoi([0.5, 0.5, width - 0.5, height - 0.5]);
    const voronoi = delaunay.voronoi([0, 0, canvas.width, canvas.height]);
    const x = voronoi.render();
    if (context) {
      context.translate(MARGIN.left, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);

      // show delaunay triangulation
      context.beginPath();
      delaunay.render(context);
      context.strokeStyle = '#ccc';
      context.stroke();

      // show voronoi cell
      context.beginPath();
      voronoi.render(context);
      voronoi.renderBounds(context);
      context.strokeStyle = '#000';
      context.stroke();

      // show vorono point
      context.beginPath();
      delaunay.renderPoints(context);
      context.fill();

      // color specified trangle
      // context.strokeStyle = 'black';
      // context.beginPath();
      // voronoi.delaunay.renderPoints(context, 5);
      // voronoi.delaunay.renderTriangle(5, context);
      // context.fill();
      // context.lineWidth = 1.5;
      const polygons = [...voronoi.cellPolygons()];
      // const segments = voronoi.render().split(/M/).slice(1);
      const svgPathStr = voronoi.render();
      const segments = svgPathStr.split(/M/).slice(1);

      for (const e of segments) {
        context.beginPath();
        context.stroke(new Path2D('M' + e));
      }

      //// transform canvas to Cartesian coordinate system
      context.translate(0, canvas.height);
      context.scale(1, -1);

      // todo: re-scale the canvas to axis
      const e = '0,0L360,528';
      context.strokeStyle = 'red';
      context.stroke(new Path2D('M' + e));
    }
  };

  // useEffect(() => {
  //   // code to run after render goes here
  //   // VoronoiBuilup();
  // });

  const loadCanvas = (id: string) => {
    const canvas = document.createElement('canvas');
    const div = document.getElementById(`${id}`);
    canvas.id = 'CursorLayer';
    canvas.width = width;
    canvas.height = height;
    canvas.style.zIndex = '8';
    canvas.style.position = 'absolute';
    canvas.style.border = '1px solid';
    div?.appendChild(canvas);

    return canvas;
  };

  svgPath = GetVoronoiPathString();
  const GetVoronoiCoordinates = (SvgCoordiate: string) => {
    SvgCoordiate.split(',');
    const polygons = [...voronoi.cellPolygons()];
  };
  return (
    <div>
      <div id="voronoid-ground"></div>
      <svg width={width} height={height} viewBox={`0, 0, ${width}, ${height}`}>
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

          <g>
            <path
              // transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
              stroke="black"
              fill="none"
              d={svgPath.voronoiCells}
            />
            <path
              // transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
              stroke="#cb1dd1"
              fill="#cb1dd1"
              d={svgPath.voronoiPoints}
            />
            <path
              // transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
              stroke="black"
              fill="none"
              d={svgPath.voronoiBounds}
            />
            <path
              // transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
              stroke="red"
              fill="none"
              d="M0,0L88,264"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
