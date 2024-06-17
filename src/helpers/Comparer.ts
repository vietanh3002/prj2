export const CheckIfArrayIsEqual = (a: [], b: []): boolean => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const FindNextEdgeFromAllVisitedVertices = (
  nextAvailableEdges: Record<string, Record<string, number>>
) => {
  let minWeight = 9999999;
  let resultVertex = '';
  const resultEdge: Record<string, Record<string, number>> = {};

  for (const nextPossibleOfOneVertex in nextAvailableEdges) {
    for (const nextPossibleEdges in nextAvailableEdges[nextPossibleOfOneVertex]) {
      if (nextAvailableEdges[nextPossibleOfOneVertex][nextPossibleEdges] <= minWeight) {
        minWeight = nextAvailableEdges[nextPossibleOfOneVertex][nextPossibleEdges];
        resultVertex = nextPossibleEdges;
        resultEdge[nextPossibleOfOneVertex] = {};
        resultEdge[nextPossibleOfOneVertex][nextPossibleEdges] = minWeight;
      }
    }
  }

  // return resultVertex;
  return { resultVertex: resultVertex, minWeight: minWeight, resultEdge: resultEdge };
};
