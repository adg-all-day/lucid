import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function FilterSelectedDot({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="7" stroke="#5B5FC7" strokeWidth="6" fill="none" />
    </Svg>
  );
}
