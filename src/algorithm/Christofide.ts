import { FindNextEdgeFromAllVisitedVertices } from '../helpers/Comparer';
import { Shuffle } from '../helpers/CreateRandom';
import { Graph_2D } from '../types/GraphType';
import Dijkstra from './Dijkstra';

export const BuildGraph = (data: number[][]) => {
  //   // sample data setup for graph
  //   const graph: Graph_2D = {
  //     graphData: {
  //       point_0: { 1: 0.1245, 2: 0.1545 },
  //       point_2: { 1: 0.1245, 2: 0.1545 },
  //     },
  //   };

  const graph: Graph_2D = {
    graphData: {},
  };

  data.forEach((point_position, point_index, data) => {
    // select the rest of points in data
    const other_points = data.filter((point, index) => point_index != index);
    other_points.forEach((other_point) => {
      // check if point is in graph data
      if (!graph.graphData[point_index]) {
        graph.graphData[point_index] = {};
      }
      //check the index of other point in the original data
      const destination = data.indexOf(other_point);
      if (destination != -1) {
        graph.graphData[point_index][destination] = GetDistance(
          point_position[0],
          point_position[1],
          other_point[0],
          other_point[1]
        );
      }
    });
  });

  return graph;
};

export const BuildVoronoiClickPointGraph = (
  vertexEndpoints: number[][],
  dijkstraData: Record<string, Record<string, number>>,
  VoronoidVerticesArr: [number, number][]
) => {
  //   // sample data setup for graph
  //   const graph: Record<string, Record<string, number>> = {
  //       point_0: { 1: 0.1245, 2: 0.1545 },
  //       point_2: { 1: 0.1245, 2: 0.1545 },
  //     },
  //   };

  const graph: Record<string, Record<string, number>> = {};

  vertexEndpoints.forEach((point_position, point_index, data) => {
    // select the rest of points in data
    const other_points = data.filter((point, index) => point_index != index);
    other_points.forEach((other_point) => {
      const startPointlabel = VoronoidVerticesArr.findIndex(
        (x) => x[0] == point_position[0] && x[1] == point_position[1]
      );

      // check if point is in graph data
      if (!graph[startPointlabel]) {
        graph[startPointlabel] = {};
      }
      //check the index of other point in the original data
      const destinationPointLabel = VoronoidVerticesArr.findIndex(
        (x) => x[0] == other_point[0] && x[1] == other_point[1]
      );
      if (destinationPointLabel != -1) {
        const dijkstraCalc = Dijkstra(
          dijkstraData,
          `${startPointlabel}`,
          `${destinationPointLabel}`
        );
        graph[startPointlabel][destinationPointLabel] = dijkstraCalc.pathCost;
        // graph[startPointlabel][] = dijkstraCalc.dijkstraPath;
      }
    });
  });

  return graph;
};

export const FindMSTree = (graphData: Record<string, Record<string, number>>) => {
  // this is for complete graph
  const MSTrees = [];
  // start from 1 vertex in list
  for (const startPoint in graphData) {
    let weight = 0;
    let route = '';
    // add to visited list
    const visitedVertices: string[] = [];
    // array is mutable so this will be changed by the subsequent func
    visitedVertices.push(startPoint);

    const length = Object.keys(graphData[startPoint]).length;
    // number of edge is number of vertices - 1
    for (let i = 0; i < length; i++) {
      // choose the next path
      const result = ChooseNextMinWeight(visitedVertices, graphData);
      const localWeight = result.weight;
      const localPath = result.path;

      weight = weight + localWeight;
      if (route == '') {
        route = localPath;
      } else {
        route = `${route} | ${localPath}`;
      }
    }

    // add total weight
    visitedVertices.push(weight.toString());
    visitedVertices.push(route);
    // return the tree
    MSTrees.push(visitedVertices);
  }
  //console.log('MSTrees:');
  //console.log(MSTrees);
  let minCost = 999999;
  let MSTree: string[] = [];
  // get the minimum weight tree
  MSTrees.forEach((tree, index) => {
    if (index == 0) {
      minCost = Number(tree[tree.length - 1]);
      MSTree = tree;
    }
    if (Number(tree[tree.length - 1]) < minCost) {
      minCost = Number(tree[tree.length - 1]);
      MSTree = tree;
    }
  });
  //console.log('MSTree:');
  //console.log(MSTree);
  return MSTree;
};

export const ChooseNextMinWeight = (
  visitedVertices: string[],
  graphData: Record<string, Record<string, number>>
) => {
  const nextPossibleEdges: Record<string, Record<string, number>> = {};
  // check every edges come from visited vertices
  for (const index in visitedVertices) {
    const visitedVertex = visitedVertices[index];
    nextPossibleEdges[visitedVertex] = {};
    // choose the next move
    for (const key in graphData[visitedVertex]) {
      // check not to form a cycle by not revisit a vertex
      if (visitedVertices.indexOf(key) == -1) {
        nextPossibleEdges[visitedVertex][key] = graphData[visitedVertex][key];
      }
    }
  }
  const result = FindNextEdgeFromAllVisitedVertices(nextPossibleEdges);
  const nextVertex = result.resultVertex;
  const weight = result.minWeight;
  const resultEdge = result.resultEdge;
  const keys = Object.keys(resultEdge);
  const startvertex = keys[keys.length - 1];
  const path = `${startvertex} - ${nextVertex}`;
  visitedVertices.push(nextVertex);

  return { weight: weight, path: path };
};

export const FindOddVertices = (MSTree: string[]) => {
  const oddVertices = [];
  const tmp: Record<string, number> = {};
  // const route = MSTree[4];
  const route = MSTree[MSTree.length - 1];
  const edges = route.split(' | ');
  // count the degree of each edge
  edges.forEach((edge) => {
    const vertices = edge.split(' - ');
    if (tmp[vertices[0]] == null) {
      tmp[vertices[0]] = 0;
    }
    if (tmp[vertices[1]] == null) {
      tmp[vertices[1]] = 0;
    }

    tmp[vertices[0]] += 1;
    tmp[vertices[1]] += 1;
  });

  for (const vertex in tmp) {
    if (tmp[vertex] % 2 != 0) {
      oddVertices.push(vertex);
    }
  }

  return oddVertices;
};

export const OtherMinimumWeightMatching = (
  MSTree: string[],
  graphData: Record<string, Record<string, number>>,
  oddVertices: string[]
) => {
  const tempOddVertices = oddVertices.slice();
  Shuffle(tempOddVertices);
  while (tempOddVertices.length > 0) {
    const v = tempOddVertices.pop();
    let length = 99999999;
    const u = '';
    let closest = '';

    tempOddVertices.forEach((u) => {
      if (v != undefined && v != u && graphData[v][u] < length) {
        length = graphData[v][u];
        closest = u;
      }
    });

    MSTree[MSTree.length - 1] = `${MSTree[MSTree.length - 1]} | ${v} - ${closest}`;
    const i = tempOddVertices.indexOf(closest);
    if (i != -1) {
      tempOddVertices.splice(i, 1);
    }
  }
  return MSTree;
};

export const MinimumWeightMatching = (
  MSTree: string[],
  graphData: Record<string, Record<string, number>>,
  oddVertices: string[]
) => {
  let bestTotalWeight = 99999999;
  let bestPairs = '';

  oddVertices.forEach((el, index) => {
    let totalWeight = 0;
    let selectPairs = '';
    // make a copy of original odd vertices array for element removal later
    const tempOddVertices = oddVertices.slice();
    tempOddVertices.forEach((oddVertex, id) => {
      if (id == index) {
        const other_OddVertices = tempOddVertices.filter(
          (point, otherIndex) => otherIndex != index
        );
        let minWeight = 9999999;
        let pair = '';
        const tmp: string[] = [''];
        //from the current vertext, get the nearest vertex
        other_OddVertices.forEach((otherOddVertex) => {
          const distance = graphData[oddVertex][otherOddVertex];
          if (distance <= minWeight) {
            minWeight = distance;
            pair = `${oddVertex} - ${otherOddVertex}`;
            tmp[0] = oddVertex;
            tmp[1] = otherOddVertex;
          }
        });
        totalWeight += minWeight;
        if (selectPairs == '') {
          selectPairs = pair;
        } else {
          selectPairs = `${selectPairs} | ${pair}`;
        }
        // remove 2 oddVertex that matched
        tempOddVertices.splice(id, 1);
        const ix = tempOddVertices.indexOf(tmp[1]);
        if (ix != -1) {
          tempOddVertices.splice(ix, 1);
        }
      }
    });
    if (totalWeight <= bestTotalWeight) {
      bestTotalWeight = totalWeight;
      if (bestPairs != '') {
        bestPairs = `${bestPairs} | ${selectPairs}`;
      } else {
        bestPairs = selectPairs;
      }
    }
  });

  if (bestPairs != '') {
    const x = MSTree[MSTree.length - 1];
    const xx = MSTree[MSTree.length - 1].length;
    bestPairs.split(' | ').forEach((bestPair) => {
      MSTree[MSTree.length - 1] = `${MSTree[MSTree.length - 1]} | ${bestPair}`;
    });
    const y = MSTree[MSTree.length - 1];
    const yy = MSTree[MSTree.length - 1].length;
    const z = yy;
  }

  return MSTree;
};

export const FindEulerianTour = (
  multiGraph: string[],
  graphData: Record<string, Record<string, number>>
) => {
  const neighbours: Record<string, string[]> = {};
  const route = multiGraph[multiGraph.length - 1];
  const edges = route.split(' | ');

  // count the neighbor of each vertex
  edges.forEach((edge) => {
    const vertices = edge.split(' - ');
    if (neighbours[vertices[0]] == null) {
      neighbours[vertices[0]] = [];
    }
    if (neighbours[vertices[1]] == null) {
      neighbours[vertices[1]] = [];
    }

    neighbours[vertices[0]].push(vertices[1]);
    neighbours[vertices[1]].push(vertices[0]);
  });

  const startVertex = edges[0].split(' - ')[0];
  const EP = [neighbours[startVertex][0]];
  while (edges.length > 0) {
    // check if this vertex has neighbour ?
    EP.forEach((element, index) => {
      // if (neighbours[element].length > 0) {
      //   // return;
      // }

      while (neighbours[element].length > 0) {
        const w = neighbours[element][0];
        // remove visited edge
        edges.forEach((item, index) => {
          if (
            (item.split(' - ')[0] == w && item.split(' - ')[1] == element) ||
            (item.split(' - ')[0] == element && item.split(' - ')[1] == w)
          ) {
            edges.splice(index, 1);
          }
        });

        neighbours[element].splice(neighbours[element].indexOf(w), 1);
        neighbours[w].splice(neighbours[w].indexOf(element), 1);

        index += 1;
        // EP.splice(index, 0, w);
        EP.push(w);
        element = w;
      }
    });
  }

  return EP;
};

export const FindTSPTour = (
  eulerian_tour: string[],
  graphData: Record<string, Record<string, number>>
) => {
  let current = eulerian_tour[0];
  const path = [current];
  const visited = new Array<boolean>(eulerian_tour.length);
  visited[Number(eulerian_tour[0])] = true;
  let length = 0;

  eulerian_tour.forEach((vertex) => {
    const i = Number(vertex);
    if (visited[i] == null) {
      path.push(vertex);
      visited[i] = true;

      length += graphData[current][i];
      current = vertex;
    }
  });

  length += graphData[current][eulerian_tour[0]];
  path.push(eulerian_tour[0]);

  //console.log('Result path: ', path);
  //console.log('Result length of the path: ', length);

  return { length: length, path: path };
};

const GetDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** (1.0 / 2.0);
};

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

export const ChritofideOnVoronoiEndpoint = (graphData: Record<string, Record<string, number>>) => {
  //  build a minimum spanning tree
  const MSTree = FindMSTree(graphData);

  // Find odd vertexes
  const oddVertices = FindOddVertices(MSTree);
  console.log('Odd vertexes in MSTree: ', oddVertices);

  // // add minimum weight matching edges to MST
  // const multiGraph = MinimumWeightMatching(MSTree, graphData, oddVertices);
  const multiGraph = OtherMinimumWeightMatching(MSTree, graphData, oddVertices);
  //console.log('Minimum weight matching: ', multiGraph);

  // const oddVertices2 = FindOddVertices(multiGraph);
  // console.log('Check Odd vertexes in MSTree: ', oddVertices2);

  // find an eulerian tour
  const eulerian_tour = FindEulerianTour(multiGraph, graphData);
  //console.log('Eulerian tour: ', eulerian_tour);

  // find an tsp tour
  const tsp_tour = FindTSPTour(eulerian_tour, graphData);
  //console.log('TSP tour: ', tsp_tour);

  return tsp_tour;
};
