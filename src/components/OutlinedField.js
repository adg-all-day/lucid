// material design style outlined field.. the label floats on top of the border
// bgColor needs to match the parent background or it looks weird
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './StyledText';

export default function OutlinedField({ label, bgColor = 'white', children }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { backgroundColor: bgColor }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginTop: 20,
  },
  label: {
    position: 'absolute',
    top: -8,
    left: 10,
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#707070',
    zIndex: 1,
  },
});
