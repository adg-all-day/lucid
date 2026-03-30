// custom Text component that maps fontWeight to our Satoshi font files
// android breaks if you set both fontWeight and fontFamily so we strip fontWeight
import React from 'react';
import { Platform, Text as RNText, StyleSheet } from 'react-native';

export default function StyledText(props) {
  const flatStyle = StyleSheet.flatten(props.style) || {};
  const fontWeight = flatStyle.fontWeight;

  let fontFamily = flatStyle.fontFamily;
  if (fontFamily === 'LexendDeca-Regular') {
    // Pass through Lexend Deca without Satoshi mapping
    return <RNText {...props} />;
  }

  if (!fontFamily || fontFamily === 'System') {
    fontFamily = 'Satoshi-Regular';
    if (fontWeight === '800' || fontWeight === '900' || fontWeight === 'bold') {
      fontFamily = 'Satoshi-Bold';
    } else if (fontWeight === '700') {
      fontFamily = 'Satoshi-Bold';
    } else if (fontWeight === '600' || fontWeight === '500') {
      fontFamily = 'Satoshi-Medium';
    } else if (fontWeight === '300' || fontWeight === '200' || fontWeight === 'light') {
      fontFamily = 'Satoshi-Light';
    }
  }

  // On Android, having fontWeight alongside a custom fontFamily causes fallback to system font.
  // Build a clean style object with fontWeight removed and fontFamily set.
  const { fontWeight: _fw, fontFamily: _ff, ...restStyle } = flatStyle;

  return (
    <RNText
      {...props}
      style={[restStyle, { fontFamily }]}
    />
  );
}
