import * as d3 from 'd3';

import checkIfPolygonInternal from 'robust-point-in-polygon';
import { useRef, useState } from 'react';
import { Delaunay } from 'd3';

import { AxisLeft } from './AxisLeft';
import {
  Dijkstra_Graph,
  Point,
  VoronoiDiagramInput,
  VoronoiPlotProps,
} from '../../types/GraphType';
import { AxisBottom } from './AxisBottom';
import { GetDistance } from '../../helpers/Calculator';
import { isCollision } from '../../helpers/CollisionDetector';
import Dijkstra from '../../algorithm/Dijkstra';
import BSpline from '../../algorithm/BSpline';
import {
  BuildVoronoiClickPointGraph,
  ChritofideOnVoronoiEndpoint,
} from '../../algorithm/Christofide';
import {
  FindIntersectPointOfPerpendicularToLine,
  FindLinearLineFunction,
  distToLineSegment,
} from '../../helpers/Geometry';
import { colorArr } from '../../samples/DummyData';
import { GetRandomColor } from '../../helpers/Utilities';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
// const X_DOMAIN = [0, 10];
// const Y_DOMAIN = [0, 10];

const X_DOMAIN = [0, 4200];
const Y_DOMAIN = [0, 2100];

export const VoronoiDiagram = ({
  width,
  height,
  destinations,
  data: inputPoints,
}: VoronoiDiagramInput) => {
  // export const VoronoiDiagram = ({ width, height, data: inputPoints }: VoronoiDiagramInput) => {
  const VoronoidVerticesArr: [number, number][] = [];
  const [route, setRoute] = useState([<path key="0"></path>]);
  const displayElements = [] as JSX.Element[];
  //to add target points and intersect pointes to bspline
  const trackingList: Record<string, [number, number][]> = {};
  const [displayRoute, setDisplayRoute] = useState([<circle key="0"></circle>]);
  const [displayBSpline, setDisplayBSpline] = useState([<line key="0"></line>]);
  const intersectPointArr: [number, number][] = [];
  const collidedLines: [number, number][][] = [];

  const vertexEndpoints = useRef([] as [number, number][]);

  // take input as Delaunay.Polygon
  const GetVerticesInCartesiansSystem = (polygon: [number, number][]) => {
    const PolygonVerticesInCartesian: [number, number][] = [];
    polygon.forEach((CellPoint, index) => {
      const [x, y] = ConvertSvgToCartesiansSystem(CellPoint);
      PolygonVerticesInCartesian.push([x, y]);
    });

    return PolygonVerticesInCartesian;
  };

  const ConvertSvgToCartesiansSystem = (svgCoordinate: [number, number]) => {
    // convert base on ratio and scale of domain
    const svgHeight = boundsHeight;
    const svgWidth = boundsWidth;
    const x = (X_DOMAIN[1] * svgCoordinate[0]) / svgWidth;
    const y = (Y_DOMAIN[1] * (svgHeight - svgCoordinate[1])) / svgHeight;
    return [x, y];
  };

  const ConvertCartesiansSystemToSvg = (
    cartesiansCoordinate: [number, number]
  ): [number, number] => {
    // convert base on ratio and scale of domain
    const svgHeight = boundsHeight;
    const svgWidth = boundsWidth;
    const x = (svgWidth * cartesiansCoordinate[0]) / X_DOMAIN[1];
    const y = (svgHeight * (Y_DOMAIN[1] - cartesiansCoordinate[1])) / Y_DOMAIN[1];
    return [x, y];
  };

  let svgPath = {
    voronoiCells: '',
    voronoiPoints: '',
    voronoiBounds: '',
  };

  let voronoi: d3.Voronoi<Delaunay.Point>;
  let delaunay: d3.Delaunay<Delaunay.Point>;

  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = d3.scaleLinear().domain(Y_DOMAIN).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, boundsWidth]);

  const delaunayData: Array<Delaunay.Point> = [];

  inputPoints.flat().map((item, index) => {
    const z = [xScale(item[0]), yScale(item[1])] as Delaunay.Point;
    delaunayData.push(z);
  });

  const svgDestinations = destinations.map((cartersianDestin) => {
    // return cartersianDestin;
    return ConvertCartesiansSystemToSvg(cartersianDestin as [number, number]);
  });

  const GetVoronoiPathString = () => {
    delaunay = Delaunay.from(delaunayData);
    voronoi = delaunay.voronoi([0, 0, boundsWidth, boundsHeight]);
    const voronoiCells = voronoi.render();
    const voronoiPoints = delaunay.renderPoints();
    const voronoiBounds = voronoi.renderBounds();
    const segments = voronoiCells.split(/M/).slice(1);
    return {
      voronoiCells: voronoiCells,
      voronoiPoints: voronoiPoints,
      voronoiBounds: voronoiBounds,
    };
  };

  const GetVoronoiCoordinates = () => {
    const VoronoiCartesiansCoordinates: [number, number][][] = [];
    const VoronoiCoordinates: [number, number][][] = [];
    const polygons = [...voronoi.cellPolygons()];

    polygons.forEach((polygon, index) => {
      const cartesianResult = GetVerticesInCartesiansSystem(polygon);
      VoronoiCartesiansCoordinates.push(cartesianResult);
      VoronoiCoordinates.push(polygon);
    });

    return {
      VoronoiCoordinates: VoronoiCoordinates,
      VoronoiCartesiansCoordinates: VoronoiCartesiansCoordinates,
    };
  };

  svgPath = GetVoronoiPathString();
  const voronoiCoordinates = GetVoronoiCoordinates();
  const graph: Dijkstra_Graph = {};
  const BuildGraph = (data: [number, number][][]) => {
    data.forEach((polygon, polygon_index) => {
      // the last one is also the first polygon's point
      for (let i = 0; i < polygon.length - 1; i++) {
        const point = polygon[i];
        const point_index = i;

        // next point
        const point_label = VoronoidVerticesArr.findIndex(
          (x) => x[0] == point[0] && x[1] == point[1]
        );

        const next_point = polygon[point_index + 1];
        const next_point_label = VoronoidVerticesArr.findIndex(
          (x) => x[0] == next_point[0] && x[1] == next_point[1]
        );

        // check if point is in graph data
        // naming: polygonID_IdOfPointInPolygon
        if (!graph[`${polygon_index}_${point_index}`]) {
          graph[`${polygon_index}_${point_index}`] = {};
        }

        graph[`${polygon_index}_${point_index}`]['label'] = point_label;

        if (graph[`${polygon_index}_${point_index - 1}`]) {
          // previous point
          const previous_point = polygon[point_index - 1];
          const previous_point_label = VoronoidVerticesArr.findIndex(
            (x) => x[0] == previous_point[0] && x[1] == previous_point[1]
          );
          // ToDO: change to Cartesians coordinate
          graph[`${polygon_index}_${point_index}`][`${point_label}-${previous_point_label}`] =
            GetDistance(previous_point[0], previous_point[1], point[0], point[1]);
        }

        graph[`${polygon_index}_${point_index}`]['Svg_Coordinate'] = point;
        graph[`${polygon_index}_${point_index}`][`${point_label}-${next_point_label}`] =
          GetDistance(point[0], point[1], next_point[0], next_point[1]);
      }
    });
  };

  const VoronoidVertices = (data: Point[][]) => {
    data.forEach((polygon) => {
      polygon.forEach((point) => {
        const ifExisted = VoronoidVerticesArr.some((x) => x[0] == point[0] && x[1] == point[1]);
        // const z = ConvertSvgToCartesiansSystem(point);
        // const p: Point = [z[0], z[1]];
        // const ifExisted = VoronoidVerticesArr.some((x) => x[0] == p[0] && x[1] == p[1]);
        if (!ifExisted) {
          VoronoidVerticesArr.push(point);
          // VoronoidVerticesArr.push(p);
        }
      });
    });
  };

  // build array of vertices and use index in array as label
  VoronoidVertices(voronoiCoordinates.VoronoiCoordinates);
  BuildGraph(voronoiCoordinates.VoronoiCoordinates);

  // convert to the svg coordinatee to draw
  const objectEndpoints = inputPoints.map((polygon) => {
    return polygon.map((point) => {
      return ConvertCartesiansSystemToSvg(point);
    });
  });

  // this is graph data to load into dijktra file/////
  const dijkstraData: Record<string, Record<string, number>> = {};
  const excludedLabels: string[] = [];
  for (const g in graph) {
    const label = graph[g]['label'];
    const svgCoordinate = graph[g]['Svg_Coordinate'] as [number, number];
    // const [cartesiansX, cartesiansY] = ConvertSvgToCartesiansSystem(svgCoordinate);
    // to remove voronoi vertices that is inside object polygon
    let checkFlg = 1;
    objectEndpoints.forEach((polygon, i) => {
      const flg = checkIfPolygonInternal(polygon, svgCoordinate);
      if (flg == -1 || flg == 0) {
        checkFlg = flg;
      }
    });
    // const check = checkIfPolygonInternal(objectEndpoints, svgCoordinate);
    if (checkFlg == -1 || checkFlg == 0) {
      const filter = excludedLabels.filter((x) => x == `${label}`);
      if (filter.length == 0) {
        excludedLabels.push(`${label}`);
      }
    }
    if (checkFlg == 1) {
      const keys = Object.keys(graph[g]).filter((x) => x !== 'label' && x !== 'Svg_Coordinate');
      keys.forEach((key) => {
        if (!dijkstraData[`${label}`]) {
          dijkstraData[`${label}`] = {};
        }

        const split = key.split('-');
        if (split.indexOf(`${label}`) != -1) {
          const nextLabel = split.filter((element, index) => {
            return element != `${label}`;
          });

          // check if route is intercept with edges of polygons then remove it from dijkstraData
          let isCollided = false;
          objectEndpoints.forEach((polygon, index) => {
            const nextPointCoordinate = VoronoidVerticesArr[Number(nextLabel[0])];
            const line = [svgCoordinate, nextPointCoordinate];
            const check = isCollision(polygon, line);
            if (check == true) {
              isCollided = true;
              collidedLines.push(line); // this would be collection of pairs
            }
          });
          if (dijkstraData[nextLabel[0]] && isCollided == false) {
            dijkstraData[nextLabel[0]][`${label}`] = Number(graph[g][key]);
            dijkstraData[`${label}`][nextLabel[0]] = Number(graph[g][key]);
          }
        }
      });
    }
  }

  const DrawResultPath = (paths: any[]) => {
    const z: React.SetStateAction<JSX.Element[]> = [];
    paths.forEach((path, idx) => {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      path.forEach((point_label: any, idx: number) => {
        const current_point = VoronoidVerticesArr[Number(point_label)];
        const next_point = VoronoidVerticesArr[Number(path[idx + 1])];
        if (current_point && next_point) {
          z.push(
            <path
              key={`resultPath_${idx + 1}`}
              stroke={color}
              // stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              d={`M${current_point[0]},${current_point[1]}L${next_point[0]},${next_point[1]}`}
            />
          );
        }
      });
    });

    return z;
  };

  const FindClosetVertexInPolygon = (point: number[], polygon: [number, number][]): number => {
    let min = Number.MAX_SAFE_INTEGER;
    let minVertexIndex = 0;
    polygon.forEach((vertex, index) => {
      const distance = GetDistance(point[0], point[1], vertex[0], vertex[1]);
      if (distance < min) {
        min = distance;
        minVertexIndex = index;
      }
    });

    return minVertexIndex;
  };

  const FindClosetEdgeInPolygon = (point: [number, number], polygon: [number, number][]) => {
    let min = Number.MAX_SAFE_INTEGER;
    let minEdgeEndpoints: [number, number][] = [];
    polygon.forEach((vertex, index) => {
      if (index != polygon.length - 1) {
        const distance = distToLineSegment(point, vertex, polygon[index + 1]);
        if (distance < min) {
          min = distance;
          minEdgeEndpoints = [vertex, polygon[index + 1]];
        }
      }
    });

    return { minEdgeEndpoints, distance: min };
  };

  const FindClosetVertexToIntersectPoint = (
    intersectPoint: [number, number],
    vertext1: [number, number],
    vertext2: [number, number]
  ): [number, number] => {
    const [cartesiansX1, cartesiansY1] = ConvertSvgToCartesiansSystem(vertext1);
    const [cartesiansX2, cartesiansY2] = ConvertSvgToCartesiansSystem(vertext2);

    // check if vertex happens to be in polygon object
    const flg_1 = objectEndpoints.some((polygon) => {
      const check = checkIfPolygonInternal(polygon, vertext1);
      return check == -1 || check == 0;
    });
    if (flg_1) {
      return vertext2;
    }

    const flg_2 = objectEndpoints.some((polygon) => {
      const check = checkIfPolygonInternal(polygon, vertext2);
      return check == -1 || check == 0;
    });
    if (flg_2) {
      return vertext1;
    }

    const distanceToVertex1 = GetDistance(
      intersectPoint[0],
      intersectPoint[1],
      vertext1[0],
      vertext1[1]
    );
    const distanceToVertex2 = GetDistance(
      intersectPoint[0],
      intersectPoint[1],
      vertext2[0],
      vertext2[1]
    );
    if (distanceToVertex1 < distanceToVertex2) {
      return vertext1;
    }
    return vertext2;
  };

  const OnMouseUpHandler = (event: any) => {
    //remove all path lines
    setRoute([<path key="0"></path>]);

    // actual coordinate on svg
    const svgX = event.nativeEvent.offsetX;
    const svgY = event.nativeEvent.offsetY;

    // because g has been translated (MARGIN.left, MARGIN.top) to match what have been drawn
    // see bblow when draw to jsx
    const transformedSvgX = svgX - MARGIN.left;
    const transformedSvgY = svgY - MARGIN.top;
    // alert(`${transformedSvgX}-${transformedSvgY}`);
    const [cartesiansX, cartesiansY] = ConvertSvgToCartesiansSystem([
      transformedSvgX,
      transformedSvgY,
    ]);

    console.time('Overall Execution Time');

    const i = delaunay.find(xScale(cartesiansX), yScale(cartesiansY));
    const polygon = voronoi.cellPolygon(i);
    // const voronoiNeightbors = [...voronoi.neighbors(i)];
    let distantFromPoitToEdges = 0;
    svgDestinations.forEach((destination) => {
      const destinPoint = [destination[0], destination[1]] as [number, number];
      const [cartesiansX, cartesiansY] = ConvertSvgToCartesiansSystem(destinPoint);
      const i = delaunay.find(xScale(cartesiansX), yScale(cartesiansY));
      const polygon = voronoi.cellPolygon(i);
      const checkVoronoiEdges = FindClosetEdgeInPolygon(destinPoint, polygon);
      const lineEndpoints: [number, number][] = checkVoronoiEdges.minEdgeEndpoints;
      distantFromPoitToEdges += checkVoronoiEdges.distance;
      const intersectPoint = FindIntersectPointOfPerpendicularToLine(
        destinPoint,
        lineEndpoints[0],
        lineEndpoints[1]
      );
      const [xx, yy] = ConvertSvgToCartesiansSystem(intersectPoint);
      intersectPointArr.push(intersectPoint);

      const firstVertex = FindClosetVertexToIntersectPoint(
        intersectPoint,
        lineEndpoints[0],
        lineEndpoints[1]
      );

      // get the closet vertex associate with destination points
      vertexEndpoints.current.push(firstVertex);
      const label = VoronoidVerticesArr.findIndex(
        (x) => x[0] == firstVertex[0] && x[1] == firstVertex[1]
      );
      trackingList[label] = [destinPoint, intersectPoint];
    });

    intersectPointArr.forEach((d, i) => {
      const c = (
        <circle
          key={`intersectPoint_${i}`}
          r={10}
          cx={d[0]}
          cy={d[1]}
          opacity={1}
          stroke="#cb1dd1"
          fill="blue"
          fillOpacity={0.5}
          strokeWidth={1}
        />
      );

      const line1 = (
        <line
          key={`line1_${i}`}
          x1={d[0]}
          x2={svgDestinations[i][0]}
          y1={d[1]}
          y2={svgDestinations[i][1]}
          strokeWidth={3}
          stroke="#cb1dd1"
          strokeLinecap="round"
          fill="#cb1dd1"
        ></line>
      );

      const line2 = (
        <line
          key={`line2_${i}`}
          x1={d[0]}
          x2={vertexEndpoints.current[i][0]}
          y1={d[1]}
          y2={vertexEndpoints.current[i][1]}
          strokeWidth={3}
          stroke="#cb1dd1"
          strokeLinecap="round"
          fill="#cb1dd1"
        ></line>
      );

      displayElements.push(c, line1, line2);
      // displayElements.push(c);
    });

    setDisplayRoute(displayElements);

    //build graph with vertices of voronoi
    const graph = BuildVoronoiClickPointGraph(
      vertexEndpoints.current,
      dijkstraData,
      VoronoidVerticesArr
    );

    if (Object.keys(graph).length < 1) {
      return;
    }

    console.time('Chritofide Execution Time');
    const result = ChritofideOnVoronoiEndpoint(graph);
    console.timeEnd('Chritofide Execution Time');
    console.log('TSP tour: ', result);
    console.log('Final tour distance result: ', result.length + distantFromPoitToEdges);
    const finalSafePath: any[][] = [];
    result.path.forEach((endpointLabel, index) => {
      const current_point = VoronoidVerticesArr[Number(endpointLabel)];
      const current_point_label = endpointLabel;
      const next_point_label = result.path[index + 1];
      const next_point = VoronoidVerticesArr[Number(result.path[index + 1])];
      if (current_point && next_point) {
        const dij = Dijkstra(dijkstraData, current_point_label, next_point_label);
        finalSafePath.push(dij.dijkstraPath);
      }
    });

    const finalSafePathCoordinates: any[] = [];
    finalSafePath.forEach((path) => {
      const pathCoordinateArr: number[][] = [];
      path.forEach((vertex_label) => {
        const coordinate = VoronoidVerticesArr[vertex_label];
        const [x, y] = ConvertSvgToCartesiansSystem(coordinate);
        pathCoordinateArr.push(coordinate);
      });
      // add svgDestinations and first vertex into BSlpine
      pathCoordinateArr.unshift(trackingList[path[0]][1]);
      pathCoordinateArr.unshift(trackingList[path[0]][0]);
      pathCoordinateArr.push(trackingList[path[path.length - 1]][1]);
      pathCoordinateArr.push(trackingList[path[path.length - 1]][0]);
      finalSafePathCoordinates.push(pathCoordinateArr);
    });

    console.timeEnd('Overall Execution Time');

    console.log('finalSafePath tour: ', finalSafePath);

    const BSplineArr: any[] = [];
    finalSafePathCoordinates.forEach((path, idx) => {
      // const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const color = GetRandomColor();
      const pts = path;
      const spline = new BSpline(pts, 3, true);
      let oldx, oldy, x, y;
      oldx = spline.calcAt(0)[0];
      oldy = spline.calcAt(0)[1];
      for (let t = 0; t <= 1; t += 0.001) {
        const interpol = spline.calcAt(t);
        let i = 1;
        x = interpol[0];
        y = interpol[1];
        const line = (
          <line
            key={`bspline_${idx}_${i++}`}
            x1={oldx}
            x2={x}
            y1={oldy}
            y2={y}
            strokeWidth={3}
            stroke={color}
            // stroke="#cb1dd1"
            strokeLinecap="round"
            fill="#cb1dd1"
          ></line>
        );
        BSplineArr.push(line);
        oldx = x;
        oldy = y;
      }
    });
    setDisplayBSpline(BSplineArr);

    //// draw line that follow voronoi edges
    // const routeLines = DrawResultPath(finalSafePath);
    // setRoute(routeLines);
  };

  // Build the shapes
  const DisplayDestinations = svgDestinations.map((d, i) => {
    return (
      <circle
        key={`destinationPoint_${i}`}
        r={10}
        cx={d[0]}
        cy={d[1]}
        opacity={1}
        stroke="#cb1dd1"
        fill="red"
        fillOpacity={0.5}
        strokeWidth={1}
      />
    );
  });

  const DisplayObjectEndpoints = objectEndpoints.flat().map((d, i) => {
    return (
      <circle
        key={`objectEndpoints_${i}`}
        r={10}
        cx={d[0]}
        cy={d[1]}
        opacity={1}
        stroke="#cb1dd1"
        fill="blue"
        fillOpacity={0.5}
        strokeWidth={1}
      />
    );
  });

  const DrawPolygons = () => {
    const polygonArr: JSX.Element[] = [];
    objectEndpoints.forEach((polygon, i) => {
      const points = polygon.join(' ');
      polygonArr.push(
        <polygon points={points} fill="orange" stroke="purple" strokeWidth={1} fillRule="nonzero" />
      );
    });
    return polygonArr;
  };

  const DrawExclude = excludedLabels.map((d, i) => {
    const point = VoronoidVerticesArr[Number(d)];
    return (
      <circle
        key={`excludedVertices_${i}`}
        r={10}
        cx={point[0]}
        cy={point[1]}
        opacity={1}
        stroke="#cb1dd1"
        fill="black"
        fillOpacity={0.5}
        strokeWidth={1}
      />
    );
  });

  const hideCollidedLines = collidedLines.map((line, i) => {
    return (
      <line
        key={`collisionLine_${i}`}
        x1={line[0][0]}
        x2={line[1][0]}
        y1={line[0][1]}
        y2={line[1][1]}
        strokeWidth={3}
        stroke="#ffffff"
        fill="#ffffff"
      ></line>
    );
  });

  return (
    <div>
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

          <g id="voronoid-ground" pointerEvents={'all'} onMouseUp={OnMouseUpHandler}>
            {/* <g id="voronoid-ground"> */}
            <path stroke="black" fill="none" d={svgPath.voronoiCells} />
            <path stroke="#cb1dd1" fill="#cb1dd1" d={svgPath.voronoiPoints} />
            <path stroke="black" fill="none" d={svgPath.voronoiBounds} />
            {DisplayDestinations}
            {/* {hideCollidedLines} */}
            {DrawPolygons()}
            {/* Drawing the edge points of obstacles */}
            {/* {DisplayObjectEndpoints} */}
            {/* Drawing the points that are inside the polygon */}
            {/* {DrawExclude} */}
            {/* {displayRoute} */}
            {displayBSpline}
            {route}
          </g>
        </g>
      </svg>
    </div>
  );
};

// https://www.google.com/search?q=b+spline+curve+js&sxsrf=APwXEdc9Pwqwtf773JofoEuGmIK4ax89hg%3A1687796506701&source=hp&ei=GruZZPubKO632roP4Zmx2Ac&iflsig=AOEireoAAAAAZJnJKrRcoZn7GIrXs35zdVg98jv2tOAa&ved=0ahUKEwj7kO75q-H_AhXum1YBHeFMDHsQ4dUDCAk&uact=5&oq=b+spline+curve+js&gs_lcp=Cgdnd3Mtd2l6EAMyBQghEKABMgUIIRCgATIICCEQFhAeEB06BwgjEIoFECc6BAgjECc6CwguEIAEELEDEIMBOgsIABCKBRCxAxCDAToFCAAQgAQ6EQguEIoFELEDEIMBEMcBENEDOgQIABADOg4ILhCKBRCxAxCDARDUAjoICAAQigUQhgNQAFjHHmDdIGgAcAB4AIABvwGIAYoFkgEDMC40mAEAoAEB&sclient=gws-wiz
// https://javascript.info/bezier-curve
// http://using-d3js.com/05_04_curves.html
// https://richardfuhr.neocities.org/BusyBCurves
// https://github.com/thibauts/b-spline#readme
// https://github.com/Tagussan/BSpline
// http://tagussan.rdy.jp/singleProjects/BSpline/
// https://www.geeksforgeeks.org/b-spline-curve-in-computer-graphics/
