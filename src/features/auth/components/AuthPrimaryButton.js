import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet } from 'react-native';
import Text from '../../../components/StyledText';
import Colors from '../../../constants/colors';
import useTheme from '../../../hooks/useTheme';

export default function AuthPrimaryButton({ title, onPress, style, textStyle, loading = false, disabled = false }) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  const animateTo = (toScale, toTranslateY) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        useNativeDriver: true,
        speed: 28,
        bounciness: 0,
      }),
      Animated.spring(translateY, {
        toValue: toTranslateY,
        useNativeDriver: true,
        speed: 28,
        bounciness: 0,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={() => !disabled && !loading && animateTo(0.985, 1)}
      onPressOut={() => !disabled && !loading && animateTo(1, 0)}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: theme.actionButtonBg },
          style,
          (disabled || loading) && styles.buttonDisabled,
          {
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Text style={[styles.text, { color: theme.actionButtonText }, textStyle]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
});
