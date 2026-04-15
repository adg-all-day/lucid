import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LucidLogo from '../../../icons/LucidLogo';
import useAuthStore from '../../../stores/authStore';
import useUserStore from '../../../stores/userStore';
import client from '../../../api/client';
import useTheme from '../../../hooks/useTheme';
import applyRegionalLanguage from '../../../i18n/applyRegionalLanguage';

export default function SplashScreen() {
  const router = useRouter();
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const holdTimer = setTimeout(() => {
        Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.04,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(async ({ finished }) => {
        if (!finished) return;

        // hydrate token from SecureStore
        await useAuthStore.getState().hydrate();
        const token = useAuthStore.getState().token;

        if (!token) {
          router.replace('/log-in');
          return;
        }

        // validate token by fetching profile
        try {
          const profile = await client.get('/profile');
          const data = profile?.data ?? profile;
          useUserStore.getState().setUser(data);
          await applyRegionalLanguage(data);
          router.replace('/(tabs)');
        } catch {
          useAuthStore.getState().clearToken();
          router.replace('/log-in');
        }
      });
    }, 1200);

    return () => clearTimeout(holdTimer);
  }, [opacity, router, scale]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.headerBg }]}>
      <Animated.View
        style={[
          styles.center,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <LucidLogo size={68} color={theme.logoColor} accentColor={theme.logoAccent} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
