import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

export default function PlaceholderScreen({ title, subtitle }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});
