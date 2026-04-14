import React from 'react';
import Svg, { Line, Path, Rect } from 'react-native-svg';

export default function FeeCalculatorIcon({ width = 19, height = 24 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 24" fill="none">
      <Rect width="19" height="24" rx="5" fill="#FFA600" />
      <Rect x="2.17188" y="1.5" width="14.6571" height="6.5" rx="2" fill="#5B5FC7" fillOpacity="0.71" />
      <Path d="M3.67858 12.361H5.14858V10.891H5.70858V12.361H7.17858V12.921H5.70858V14.398H5.14858V12.921H3.67858V12.361Z" fill="white" />
      <Path d="M4.56665 22H3.81065L5.00765 20.306L3.81765 18.577H4.58065L5.44865 19.851L6.29565 18.577H7.04465L5.85465 20.306L7.02365 22H6.26065L5.40665 20.747L4.56665 22Z" fill="white" />
      <Path d="M12.5054 13.439V12.851H14.6404V13.439H12.5054Z" fill="white" />
      <Path d="M11.8212 18.892H15.3212V19.459H11.8212V18.892ZM11.8212 20.362H15.3212V20.929H11.8212V20.362Z" fill="white" />
      <Line x1="9.47852" y1="11" x2="9.47852" y2="22" stroke="white" strokeWidth="0.5" />
      <Line x1="16.6562" y1="15.75" x2="1.99911" y2="15.75" stroke="white" strokeWidth="0.5" />
    </Svg>
  );
}
