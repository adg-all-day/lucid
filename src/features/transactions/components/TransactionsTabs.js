import React from 'react';
import { Animated, ScrollView, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/StyledText';

export default function TransactionsTabs({
  tabs,
  theme,
  activeTab,
  setActiveTab,
  setTabLayouts,
  underlineLeft,
  underlineWidth,
  styles,
}) {
  return (
    <>
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                setTabLayouts((current) => {
                  const prev = current[tab];
                  if (prev && prev.x === x && prev.width === width) {
                    return current;
                  }
                  return {
                    ...current,
                    [tab]: { x, width },
                  };
                });
              }}
            >
              <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.tabUnderline,
            {
              left: underlineLeft,
              width: underlineWidth,
            },
          ]}
        />
      </View>
      <View style={styles.tabDivider} />
    </>
  );
}
