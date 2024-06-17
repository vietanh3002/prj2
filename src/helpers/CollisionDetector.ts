export const isCollision = (polygon: [number, number][], line: [number, number][]) =>
  polyLine(polygon, line[0][0], line[0][1], line[1][0], line[1][1]);

const polyLine = (vertices: [number, number][], x1: number, y1: number, x2: number, y2: number) => {
  let next = 0;
  for (let current = 0; current < vertices.length; current++) {
    next = current + 1;
    if (next == vertices.length) next = 0;
    const x3 = vertices[current][0];
    const y3 = vertices[current][1];
    const x4 = vertices[next][0];
    const y4 = vertices[next][1];
    const hit = lineLine(x1, y1, x2, y2, x3, y3, x4, y4);
    if (hit) return true;
  }
  return false;
};

const lineLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
) => {
  const uA =
    ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  const uB =
    ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) /
    ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
};
