// tab bar layout -- mirrors the old App.js tab navigator styling
// the "isActuallyFocused" trick keeps Home from looking active
// when the user has drilled into a transaction detail

import { View } from 'react-native';
import { Tabs, useSegments } from 'expo-router';
import NavHomeIcon from '../../src/icons/NavHomeIcon';
import NavHelpIcon from '../../src/icons/NavHelpIcon';
import NavHeadsetIcon from '../../src/icons/NavHeadsetIcon';
import NavSettingsIcon from '../../src/icons/NavSettingsIcon';
import Text from '../../src/components/StyledText';

export default function TabLayout() {
  const segments = useSegments();

  // figure out if we're deep inside the home tab (like on a transaction page)
  // so we can dim the Home icon when the user isn't really on the main home screen
  const isOnTransactionDetail =
    segments.includes('(tabs)') && segments.includes('transaction');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          height: 104,
          paddingTop: 8,
          paddingBottom: 42,
          borderTopWidth: 0,
          backgroundColor: '#5B5FC7',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => {
            // if we navigated to transaction detail, home shouldn't glow
            const isActuallyFocused = focused && !isOnTransactionDetail;
            return (
              <View style={{ alignItems: 'center' }}>
                <NavHomeIcon size={24} color="#FFFFFF" focused={isActuallyFocused} />
              </View>
            );
          },
          tabBarLabel: ({ focused }) => {
            const isActuallyFocused = focused && !isOnTransactionDetail;
            return (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#FFFFFF',
                    fontFamily: isActuallyFocused ? 'Satoshi-Bold' : 'Satoshi-Regular',
                    marginTop: 2,
                  }}
                >
                  Home
                </Text>
                <View
                  style={{
                    width: 32,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: isActuallyFocused ? '#D9DFD9' : '#5B5FC7',
                    marginTop: 4,
                  }}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <NavHelpIcon size={24} color="#FFFFFF" focused={focused} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#FFFFFF',
                  fontFamily: focused ? 'Satoshi-Bold' : 'Satoshi-Regular',
                  marginTop: 2,
                }}
              >
                Help
              </Text>
              <View
                style={{
                  width: 32,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: focused ? '#D9DFD9' : '#5B5FC7',
                  marginTop: 4,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contact-us"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <NavHeadsetIcon size={24} color="#FFFFFF" focused={focused} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#FFFFFF',
                  fontFamily: focused ? 'Satoshi-Bold' : 'Satoshi-Regular',
                  marginTop: 2,
                }}
              >
                Contact Us
              </Text>
              <View
                style={{
                  width: 32,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: focused ? '#D9DFD9' : '#5B5FC7',
                  marginTop: 4,
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <NavSettingsIcon size={24} color="#FFFFFF" focused={focused} />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#FFFFFF',
                  fontFamily: focused ? 'Satoshi-Bold' : 'Satoshi-Regular',
                  marginTop: 2,
                }}
              >
                Settings
              </Text>
              <View
                style={{
                  width: 32,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: focused ? '#D9DFD9' : '#5B5FC7',
                  marginTop: 4,
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
