// material design style outlined field.. the label floats on top of the border
// bgColor needs to match the parent background or it looks weird
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './StyledText';
import useTheme from '../hooks/useTheme';

export default function OutlinedField({ label, bgColor, children }) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { backgroundColor: bgColor || theme.cardBg, color: theme.textSecondary }]}>{label}</Text>
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
