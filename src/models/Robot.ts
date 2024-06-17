import { RobotType } from '../types/ModelType';

export const RobotObject = (
  width: number,
  height: number,
  color: string,
  x: number,
  y: number
): RobotType => {
  return {
    height: height,
    width: width,
    xPos: x,
    yPos: y,
    color: color,
  } as RobotType;
};
