// root layout -- wraps everything with providers, loads custom fonts
// this replaces the old App.js now that we're using expo-router

import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import queryClient from '../src/api/queryClient';
import useAuthStore from '../src/stores/authStore';
import useTheme from '../src/hooks/useTheme';

SplashScreen.preventAutoHideAsync();

const AUTH_ROUTES = ['log-in', 'sign-up', 'forgot-password', 'email-verification', 'password-change', 'two-factor-authentication', 'two-factor-code', 'recovery-code', 'verify-email'];

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrating = useAuthStore((state) => state.hydrating);
  const theme = useTheme();

  useEffect(() => {
    if (hydrating) return;

    const firstSegment = segments[0];
    if (firstSegment === 'splash') return;

    const onAuthScreen = AUTH_ROUTES.includes(firstSegment);
    const onProtectedScreen = firstSegment === '(tabs)' || firstSegment === 'new-transaction' || firstSegment === 'transaction';

    if (!isAuthenticated && onProtectedScreen) {
      router.replace('/log-in');
    } else if (isAuthenticated && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hydrating, segments, router]);

  const [fontsLoaded] = useFonts({
    'Satoshi-Light': require('../assets/fonts/Satoshi-Light.otf'),
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),
    'LexendDeca-Regular': require('../assets/fonts/LexendDeca-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.background }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack initialRouteName="splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="log-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="new-transaction"
            options={{
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
