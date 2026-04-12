import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function ModalBlurBackdrop({ isDark = false, blurTarget = null }) {
  return (
    <>
      <BlurView
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        blurMethod={blurTarget ? 'dimezisBlurView' : 'none'}
        blurTarget={blurTarget}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.12)' },
        ]}
      />
    </>
  );
}
