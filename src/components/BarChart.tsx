import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const BarChart = () => {
  useEffect(() => DrawChart);
  // const graphRef = useRef(null);

  const DrawChart = () => {
    const data = [12, 5, 6, 6, 9, 10];
    const svg = d3.select('#graph-area').append('svg').attr('width', 700).attr('height', 300);
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * 70)
      .attr('y', (d, i) => 300 - 10 * d)
      .attr('width', 65)
      .attr('height', (d, i) => d * 10)
      .attr('fill', 'green');
  };

  return (
    <>
      <div id="graph-area"></div>
    </>
  );
};

export default BarChart;
