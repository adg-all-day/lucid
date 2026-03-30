// main app entry point... navigation setup, fonts, tab bar etc
// suggezt: pull the greeting name from the profile endpoint instead of hardcoding

import React, { useCallback } from 'react';
import { View as RNView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NavHomeIcon from './src/components/NavHomeIcon';
import NavHelpIcon from './src/components/NavHelpIcon';
import NavHeadsetIcon from './src/components/NavHeadsetIcon';
import NavSettingsIcon from './src/components/NavSettingsIcon';
import StyledText from './src/components/StyledText';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import HomeScreen from './src/screens/HomeScreen';
import HelpScreen from './src/screens/HelpScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NewTransactionScreen from './src/screens/NewTransactionScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

const TAB_ICON_COMPONENTS = {
  Home: NavHomeIcon,
  Help: NavHelpIcon,
  'Contact Us': NavHeadsetIcon,
  Settings: NavSettingsIcon,
};

// home stack sits inside the Home tab... transaction detail slides in from right
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </HomeStack.Navigator>
  );
}

// bottom tab bar.. the focused logic is a bit tricky because
// when your on TransactionDetail inside the Home tab, Home should not look active
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const IconComponent = TAB_ICON_COMPONENTS[route.name];
          let isActuallyFocused = focused;
          if (route.name === 'Home' && focused) {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
            isActuallyFocused = routeName === 'HomeMain';
          }
          return (
            <RNView style={{ alignItems: 'center' }}>
              <IconComponent size={24} color="#FFFFFF" focused={isActuallyFocused} />
            </RNView>
          );
        },
        tabBarLabel: ({ focused }) => {
          let isActuallyFocused = focused;
          if (route.name === 'Home' && focused) {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
            isActuallyFocused = routeName === 'HomeMain';
          }
          return (
            <RNView style={{ alignItems: 'center' }}>
              <StyledText style={{
                fontSize: 12,
                color: '#FFFFFF',
                fontFamily: isActuallyFocused ? 'Satoshi-Bold' : 'Satoshi-Regular',
                marginTop: 2,
              }}>
                {route.name}
              </StyledText>
              <RNView style={{
                width: 32,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: isActuallyFocused ? '#D9DFD9' : '#5B5FC7',
                marginTop: 4,
              }} />
            </RNView>
          );
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          height: 104,
          paddingTop: 8,
          paddingBottom: 42,
          borderTopWidth: 0,
          backgroundColor: '#5B5FC7',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
      <Tab.Screen name="Contact Us" component={ContactUsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Satoshi-Light': require('./assets/fonts/Satoshi-Light.otf'),
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-Black': require('./assets/fonts/Satoshi-Black.otf'),
    'LexendDeca-Regular': require('./assets/fonts/LexendDeca-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer onReady={onLayoutRootView}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeTabs" component={HomeTabs} />
          {/* new transaction opens as a transparent modal overlay on top of everything */}
          <Stack.Screen
            name="NewTransaction"
            component={NewTransactionScreen}
            options={{
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
