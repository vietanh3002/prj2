export const GetDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** (1.0 / 2.0);
};

export const ConvertCartesiansSystemToSvg = (
  cartesiansCoordinate: [number, number],
  svgHeight: number,
  svgWidth: number,
  X_DOMAIN: number[],
  Y_DOMAIN: number[]
): [number, number] => {
  // convert base on ratio and scale of domain
  const x = (svgWidth * cartesiansCoordinate[0]) / X_DOMAIN[1];
  const y = (svgHeight * (Y_DOMAIN[1] - cartesiansCoordinate[1])) / Y_DOMAIN[1];
  return [x, y];
};
