import { ObstacleType } from '../types/ModelType';

export const ObstacleObject = (
  width: number,
  height: number,
  color: string,
  x: number,
  y: number
): ObstacleType => {
  return {
    height: height,
    width: width,
    xPos: x,
    yPos: y,
    color: color,
  } as ObstacleType;
};
