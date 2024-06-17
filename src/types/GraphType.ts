import { ScaleLinear } from 'd3';

export type Graph_2D = {
  graphData: Record<string, Record<string, number>>;
};

export type Point = [number, number];

export type Dijkstra_Graph = Record<string, Record<string, number | [number, number]>>;

export type Dijkstra_Graph2 = {
  PointName: string;
  SvgCoordinate: [number, number];
  CartesiansCoordinate: [number, number];
  RouteInfo: Record<string, number>;
}[];

export type Distance = {
  destination: number;
};

export type ScatterplotProps = {
  width: number;
  height: number;
  // data: { x: number; y: number }[];
  data: number[][];
  tour: string[];
};

export type VoronoiPlotProps = {
  width: number;
  height: number;
  // data: { x: number; y: number }[];
  // data: ArrayLike<[number, number]>;
  data: number[][];
};

export type VoronoiDiagramInput = {
  width: number;
  height: number;
  data: [number, number][][];
  destinations: [number, number][];
};

export type AxisLeftProps = {
  yScale: ScaleLinear<number, number>;
  pixelsPerTick: number;
  width: number;
};
