const sqr = (x: number) => {
  return x * x;
};

const dist2 = (v: [number, number], w: [number, number]) => {
  return sqr(v[0] - w[0]) + sqr(v[1] - w[1]);
};

const distToSegmentSquared = (p: [number, number], v: [number, number], w: [number, number]) => {
  const l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]);
};

// https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
export const distToLineSegment = (
  point: [number, number],
  v: [number, number], // point of line vw
  w: [number, number] // point of line vw
) => {
  return Math.sqrt(distToSegmentSquared(point, v, w));
};

export const FindLinearLineFunction = (point1: [number, number], point2: [number, number]) => {
  // line: y = ax + b
  // a is called gradient
  let a: number;
  let b: number;
  if (point2[1] >= point1[1]) {
    a = (point2[1] - point1[1]) / (point2[0] - point1[0]);
    b = point1[1] - a * point1[0];
  } else {
    a = (point1[1] - point2[1]) / (point1[0] - point2[0]);
    b = point2[1] - a * point2[0];
  }
  // a = (point2[1] - point1[1]) / (point2[0] - point1[0]);
  // b = point1[1] - a * point1[0];
  return { a: a, b: b };
};

export const FindIntersectPointOfPerpendicularToLine = (
  destinationPoint: [number, number],
  vertex1: [number, number],
  vertex2: [number, number]
) => {
  let _a: number, _b: number, intersect_X: number, intersect_Y: number;

  if (vertex1[0] == vertex2[0]) {
    intersect_X = vertex1[0];
    intersect_Y = destinationPoint[1];
    return [intersect_X, intersect_Y] as [number, number];
  }

  if (vertex1[1] == vertex2[1]) {
    intersect_X = destinationPoint[0];
    intersect_Y = vertex1[1];
    return [intersect_X, intersect_Y] as [number, number];
  }

  // có vấn đề khi độ chính xác quá lớn khiên các phép tính sai lệch
  // a.k.a các điểm có toạ độ chênh số quá nhỏ
  // line1: y = ax + b
  const { a, b } = FindLinearLineFunction(vertex1, vertex2);
  // line2: y = _ax + _b
  // 2 lines need to be perpendicular
  if (a == 0) {
    // meaning line 1 is y= 0 => line 2 is x = b
    intersect_X = destinationPoint[0];
    intersect_Y = b;
  } else {
    _a = -1 / a;
    _b = destinationPoint[1] - _a * destinationPoint[0];
    intersect_X = (_b - b) / (a - _a);
    intersect_Y = a * intersect_X + b;
  }
  return [intersect_X, intersect_Y] as [number, number];
};
