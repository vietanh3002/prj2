const graph = {
  a: { b: 5, c: 2 },
  b: { a: 5, c: 7, d: 8 },
  c: { a: 2, b: 7, d: 4, e: 8 },
  d: { b: 8, c: 4, e: 6, f: 4 },
  e: { c: 8, d: 6, f: 3 },
  f: { e: 3, d: 4 },
};

const graph2 = {
  0: { 1: 117, 3: 175.5 },
  1: { 0: 117, 2: 117, 10: 273 },
  2: { 1: 117, 3: 130.8099766837377, 4: 55.154328932550705 },
  3: { 0: 175.5, 2: 130.8099766837377, 7: 162.5 },
  4: { 2: 55.154328932550705, 5: 195, 12: 195 },
  5: { 4: 195, 6: 46.87216658103186, 13: 195 },
  6: { 5: 46.87216658103186, 7: 123.3288287465668, 9: 403 },
  7: { 3: 162.5, 6: 123.3288287465668, 8: 442 },
  8: { 7: 442, 9: 117 },
  9: { 6: 403, 8: 117, 14: 234 },
  10: { 1: 273, 11: 97.50000000000003, 15: 390 },
  11: { 10: 97.50000000000003, 12: 70.30824987154776, 16: 436.03325561245896 },
  12: { 4: 195, 11: 70.30824987154776, 13: 195 },
  13: { 5: 195, 12: 195, 14: 429, 17: 429 },
  14: { 9: 234, 13: 429, 18: 429 },
  15: { 10: 390, 16: 292.49999999999994 },
  16: { 11: 436.03325561245896, 15: 292.49999999999994, 17: 58.50000000000006 },
  17: { 13: 429, 16: 58.50000000000006, 18: 429 },
  18: { 14: 429, 17: 429 },
};

const printTable = (table: any) => {
  return Object.keys(table)
    .map((vertex) => {
      const { vertex: from, cost } = table[vertex];
      return `${vertex}: ${cost} via ${from}`;
    })
    .join('\n');
};

const tracePath = (table: any, start: any, end: any) => {
  const path = [];
  let next = end;
  while (true) {
    path.unshift(next);
    if (next === start) {
      break;
    }
    next = table[next].vertex;
  }

  return path;
};

const formatGraph = (g: any) => {
  const tmp: any = {};
  Object.keys(g).forEach((k) => {
    const obj = g[k];
    const arr: any = [];
    Object.keys(obj).forEach((v) => arr.push({ vertex: v, cost: obj[v] }));
    tmp[k] = arr;
  });
  // console.log(tmp);
  return tmp;
};

const Dijkstra = (graph: Record<string, Record<string, number>>, start: string, end: string) => {
  const map: any = formatGraph(graph);

  const visited: string[] = [];
  const unvisited = [start];
  const shortestDistances = { [start]: { vertex: start, cost: 0 } };

  let vertex;
  while ((vertex = unvisited.shift())) {
    // Explore unvisited neighbors
    const x = map[vertex];
    const neighbors = map[vertex].filter((n: any) => !visited.includes(n.vertex));

    // Add neighbors to the unvisited list
    unvisited.push(...neighbors.map((n: any) => n.vertex));

    const costToVertex = shortestDistances[vertex].cost;

    for (const { vertex: to, cost } of neighbors) {
      const currCostToNeighbor = shortestDistances[to] && shortestDistances[to].cost;
      const newCostToNeighbor = costToVertex + cost;
      if (currCostToNeighbor == undefined || newCostToNeighbor < currCostToNeighbor) {
        // Update the table
        shortestDistances[to] = { vertex, cost: newCostToNeighbor };
      }
    }

    visited.push(vertex);
  }

  // console.log('Table of costs:');
  // console.log(printTable(shortestDistances));

  const path = tracePath(shortestDistances, start, end);

  // console.log(
  //   'Shortest path is: ',
  //   path.join(' -> '),
  //   ' with weight ',
  //   shortestDistances[end].cost
  // );

  return {
    dijkstraPath: path,
    pathCost: shortestDistances[end].cost,
  };
};

export default Dijkstra;
// Dijkstra(graph2, '0', '18');
