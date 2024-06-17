import {
  BuildGraph,
  FindMSTree,
  FindOddVertices,
  MinimumWeightMatching,
  OtherMinimumWeightMatching,
  FindEulerianTour,
  FindTSPTour,
} from '../algorithm/Christofide';
import BarChart from '../components/BarChart';
import {
  dummyGraphData1,
  dummyGraphData2,
  dummyGraphData3,
  DummyObjectsTest,
  DummyTriangleObjectTest,
  DummyRectangleObjectTest,
  DummyObjectTest_Poly_01,
  DummyObjectTest_Rect_02,
  DummyObjectTest_Poly_02,
} from '../samples/DummyData';
import { Scatterplot } from '../components/Graphs/ScatterPlot';
import { VoronoiDiagram } from '../components/Graphs/VoronoiDiagram';
import { ObstaclesMap } from '../components/Graphs/ObstaclesMap';
import { obstacles, obstacles2 } from '../samples/obstacles-map';

const getChritofideData = (data: number[][]) => {
  // build a graph
  const graphData = BuildGraph(data).graphData;
  console.log(graphData);

  //  build a minimum spanning tree
  const MSTree = FindMSTree(graphData);

  // Find odd vertexes
  const oddVertices = FindOddVertices(MSTree);
  console.log('Odd vertexes in MSTree: ', oddVertices);

  // // add minimum weight matching edges to MST
  const multiGraph = MinimumWeightMatching(MSTree, graphData, oddVertices);
  //const multiGraph = OtherMinimumWeightMatching(MSTree, graphData, oddVertices);
  console.log('Minimum weight matching: ', multiGraph);

  const oddVertices2 = FindOddVertices(multiGraph);
  console.log('Check Odd vertexes in MSTree: ', oddVertices2);

  // find an eulerian tour
  const eulerian_tour = FindEulerianTour(multiGraph, graphData);
  console.log('Eulerian tour: ', eulerian_tour);

  // find an tsp tour
  const tsp_tour = FindTSPTour(eulerian_tour, graphData);
  console.log('TSP tour: ', tsp_tour);

  return tsp_tour;
};

const CreateTriangleObjects = () => {
  const inputData = [] as [number, number][][];
  for (let i = 0; i <= 3950; i += 400) {
    const x = [
      [
        DummyTriangleObjectTest.DummyObjects[0][0][0] + i,
        DummyTriangleObjectTest.DummyObjects[0][0][1],
      ],
      [
        DummyTriangleObjectTest.DummyObjects[0][1][0] + i,
        DummyTriangleObjectTest.DummyObjects[0][1][1],
      ],
      [
        DummyTriangleObjectTest.DummyObjects[0][2][0] + i,
        DummyTriangleObjectTest.DummyObjects[0][2][1],
      ],
    ] as [number, number][];
    inputData.push(x);
  }
  inputData.map((triangle) => {
    for (let i = 0; i <= 1700; i += 400) {
      const x = [
        [triangle[0][0], triangle[0][1] + i],
        [triangle[1][0], triangle[1][1] + i],
        [triangle[2][0], triangle[2][1] + i],
      ] as [number, number][];
      inputData.push(x);
    }
  });
  return { Destinations: DummyTriangleObjectTest.Destinations, DummyObjects: inputData };
};

const CreateRectObjects = () => {
  const inputData = [] as [number, number][][];
  for (let i = 0; i <= 3950; i += 400) {
    const x = [
      [
        DummyRectangleObjectTest.DummyObjects[0][0][0] + i,
        DummyRectangleObjectTest.DummyObjects[0][0][1],
      ],
      [
        DummyRectangleObjectTest.DummyObjects[0][1][0] + i,
        DummyRectangleObjectTest.DummyObjects[0][1][1],
      ],
      [
        DummyRectangleObjectTest.DummyObjects[0][2][0] + i,
        DummyRectangleObjectTest.DummyObjects[0][2][1],
      ],
      [
        DummyRectangleObjectTest.DummyObjects[0][3][0] + i,
        DummyRectangleObjectTest.DummyObjects[0][3][1],
      ],
    ] as [number, number][];
    inputData.push(x);
  }
  inputData.map((rect) => {
    for (let i = 0; i <= 1700; i += 400) {
      const x = [
        [rect[0][0], rect[0][1] + i],
        [rect[1][0], rect[1][1] + i],
        [rect[2][0], rect[2][1] + i],
        [rect[3][0], rect[3][1] + i],
      ] as [number, number][];
      inputData.push(x);
    }
  });
  return { Destinations: DummyRectangleObjectTest.Destinations, DummyObjects: inputData };
};

const CreateObject = () => {
  return DummyObjectTest_Poly_02;
};

const Graph = () => {
  // const data = CreateTriangleObjects();
  // const data = CreateRectObjects();
  const data = CreateObject();

  return (
    <>
      <div>
        <p>Graph</p>
        {/* <BarChart /> */}
        <div id="graph-area"></div>
        <VoronoiDiagram
          data={data.DummyObjects as [number, number][][]}
          width={2000}
          height={1000}
          destinations={data.Destinations as [number, number][]}
        />
        {/* <VoronoiDiagram data={dummyGraphData2} width={900} height={900} tour={data.path} /> */}
      </div>
    </>
  );
};

export default Graph;
