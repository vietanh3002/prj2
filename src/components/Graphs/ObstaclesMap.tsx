import * as d3 from 'd3';
import { useEffect, useState } from 'react';

import { VoronoiPlotProps } from '../../types/GraphType';
import { AxisBottom } from './AxisBottom';
import { AxisLeft } from './AxisLeft';
import { RobotObject } from '../../models/Robot';
import { ObstacleType, RobotType } from '../../types/ModelType';
import { ObstacleObject } from '../../models/Obstacle';
import { dummyObstacleMapData } from '../../samples/DummyData';

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
// const X_DOMAIN = [0, 10];
// const Y_DOMAIN = [0, 10];

const X_DOMAIN = [0, 4200];
const Y_DOMAIN = [0, 2100];

export const ObstaclesMap = ({ width, height, data }: VoronoiPlotProps) => {
  //   const [robotModel, setRobotModel] = useState({} as RobotModel);
  const [robotDisplay, setRobotDisplay] = useState(<rect></rect>);
  const [obstacleDisplay, setObstaclesDisplay] = useState([] as ObstacleType[]);
  let interval = setInterval(() => {
    // console.log('init interval');
  });
  let robot: RobotType;
  const obstacles: ObstacleType[] = [];

  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = d3.scaleLinear().domain(Y_DOMAIN).range([boundsHeight, 0]);
  const xScale = d3.scaleLinear().domain(X_DOMAIN).range([0, boundsWidth]);

  const CreateRobot = (width: number, height: number, color: string, x: number, y: number) => {
    robot = RobotObject(width, height, color, x, y);

    const robotDisplay = (
      <rect
        id="robot-object"
        width={robot.width}
        height={robot.height}
        x={xScale(robot.xPos)}
        y={yScale(robot.yPos)}
        opacity={1}
        stroke="#cb1dd1"
        fill={robot.color}
        fillOpacity={0.1}
        strokeWidth={1}
      />
    );
    // setRobotDisplay(robotDisplay);
    return robotDisplay;
  };

  const DrawObstacles = (width: number, height: number, color: string, x: number, y: number) => {
    robot = ObstacleObject(width, height, color, x, y);

    const robotDisplay = (
      <rect
        id="obstacle-object"
        width={robot.width}
        height={robot.height}
        x={xScale(robot.xPos)}
        y={yScale(robot.yPos)}
        opacity={1}
        stroke="#cb1dd1"
        fill={robot.color}
        fillOpacity={0.1}
        strokeWidth={1}
      />
    );
    // setRobotDisplay(robotDisplay);
    return robotDisplay;
  };

  const DrawObstacles2 = data.map((d, i) => {
    const objectSize = { width: 10, height: 10 };
    const obstacle = ObstacleObject(objectSize.width, objectSize.height, 'green', d[0], d[1]);
    obstacles.push(obstacle);
    return (
      <rect
        key={i}
        width={objectSize.width}
        height={objectSize.height}
        x={xScale(d[0])}
        y={yScale(d[1])}
        opacity={1}
        stroke="#cb1dd1"
        fill="green"
        fillOpacity={0.8}
        strokeWidth={1}
      />
    );
  });

  // init robot
  useEffect(() => {
    // check using stete is making async action
    setRobotDisplay(CreateRobot(30, 30, getRandomColor(), 500, 800));
    // setObstaclesDisplay(DrawObstacles(10, 400, 'green', 0, 2100));
    // CreateObstacleObjects(dummyObstacleMapData);
    interval = setInterval(() => {
      // do phần tính Christofy quá lâu nên page chưa hiển thị, object đã được vẽ và di chuyển trước khi trang hiện lên
      // nên object không còn ở vị trí ban đầu
      console.log('This will run every second!');
      UpdateGameArea();
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const CreateObstacleObjects = (dummyObstacleMapData: string[][]) => {
    dummyObstacleMapData.forEach((obj, index) => {
      const obstacle: ObstacleType = {
        width: Number(obj[0]),
        height: Number(obj[1]),
        color: `${obj[2]}`,
        xPos: Number(obj[3]),
        yPos: Number(obj[4]),
      };
      DrawObstacles(obstacle.width, obstacle.height, obstacle.color, obstacle.xPos, obstacle.yPos);
    });
  };

  const UpdateGameArea = () => {
    // check if crash with any object
    obstacles.forEach((obstacle, index) => {
      if (CheckIfCrash(robot, obstacle)) {
        clearInterval(interval);
      }
    });

    // robot.xPos += 5;
    setRobotDisplay(CreateRobot(30, 30, getRandomColor(), robot.xPos + 10, robot.yPos + 10));
  };

  const CheckIfCrash = (robot: RobotType, obstacle: ObstacleType): boolean => {
    const myleft = robot.xPos;
    const myright = robot.xPos + robot.width;
    const mytop = robot.yPos;
    const mybottom = robot.yPos + robot.height;
    const obstacleLeft = obstacle.xPos;
    const obstacleRight = obstacle.xPos + obstacle.width;
    const obstacleTop = obstacle.yPos;
    const obstacleBottom = obstacle.yPos + obstacle.height;

    if (
      mybottom < obstacleTop ||
      mytop > obstacleBottom ||
      myright < obstacleLeft ||
      myleft > obstacleRight
    ) {
      return false;
    }
    const x = [xScale(obstacleLeft), yScale(obstacleTop)];
    return true;
  };

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  return (
    <div>
      <div id="voronoid-ground"></div>
      <svg width={width} height={height} viewBox={`0, 0, ${width}, ${height}`}>
        {/* first group is for the violin and box shapes */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        >
          {/* Y axis */}
          <AxisLeft yScale={yScale} pixelsPerTick={40} width={boundsWidth} />

          {/* X axis, use an additional translation to appear at the bottom */}
          <g transform={`translate(0, ${boundsHeight})`}>
            <AxisBottom xScale={xScale} pixelsPerTick={40} height={boundsHeight} />
          </g>

          <g id="robot-place">{robotDisplay}</g>
          {/* <g id="obstacle-place">{obstacleDisplay}</g> */}
          <g id="obstacle-place">{DrawObstacles2}</g>
        </g>
      </svg>
    </div>
  );
};
