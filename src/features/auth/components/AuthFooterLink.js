import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

export default function AuthFooterLink({ prompt, actionLabel, onPress, style, textStyle, linkStyle }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.text, { color: theme.text }, textStyle]}>{prompt} </Text>
      <Pressable onPress={onPress}>
        <Text style={[styles.link, linkStyle]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  link: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});
