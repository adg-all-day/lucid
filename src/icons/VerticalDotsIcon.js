import React from 'react';
import Svg, { Ellipse } from 'react-native-svg';

export default function VerticalDotsIcon({ width = 3, height = 11, color = '#5B5FC7' }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 3 11" fill="none">
      <Ellipse cx="1.29414" cy="1.29412" rx="1.29414" ry="1.29412" fill={color} />
      <Ellipse cx="1.29414" cy="5.49969" rx="1.29414" ry="1.29412" fill={color} />
      <Ellipse cx="1.29414" cy="9.70617" rx="1.29414" ry="1.29412" fill={color} />
    </Svg>
  );
}
